import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { TierId } from "@/lib/pricing";

/**
 * Stripe webhook handler.
 *
 * Verifies the request signature against STRIPE_WEBHOOK_SECRET, then mirrors
 * subscription state into the public.subscriptions table using the service
 * role (RLS would otherwise block writes — there's no auth.uid() in this
 * server-to-server context).
 *
 * The middleware matcher excludes /api/stripe/webhook so the raw body is
 * preserved (signature verification needs the byte-identical request body).
 *
 * Events handled:
 *   - checkout.session.completed       → upsert sub row, mark active, set tier
 *   - customer.subscription.created    → same, also captures cancel_at_period_end
 *   - customer.subscription.updated    → tier swap, period changes, cancellation flag
 *   - customer.subscription.deleted    → revert to free + canceled
 *   - invoice.payment_failed           → mark past_due (model selection sees free)
 *
 * All other events are acknowledged with 200 so Stripe stops retrying.
 */

// Force the Node.js runtime; the Stripe SDK uses Node crypto for signing.
export const runtime = "nodejs";
// Disable any caching layer; webhooks are write-only.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("stripe webhook: signature verification failed", message);
    return NextResponse.json({ error: `bad signature: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        // Acknowledge; not an event we care about.
        break;
    }
  } catch (err) {
    console.error(`stripe webhook: handler error for ${event.type}`, err);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: "handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a Stripe price id to a TierId via env vars. Falls back to "free" if
 * unknown (defensive — should never happen in practice).
 */
function tierFromPriceId(priceId: string | null | undefined): TierId {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_POWER) return "power";
  return "free";
}

function periodEndDate(unixSeconds: number | null | undefined): Date | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000);
}

/**
 * Resolve our internal user id from the Stripe customer + metadata. Tries
 * (in order):
 *   1. session/subscription metadata.userId (set during Checkout creation)
 *   2. customer.metadata.userId
 *   3. lookup by stripe_customer_id in our subscriptions table
 *   4. lookup by email from the Stripe customer object
 */
async function resolveUserId(opts: {
  metadataUserId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<string | null> {
  if (opts.metadataUserId) return opts.metadataUserId;

  const supabase = createServiceClient();

  if (opts.stripeCustomerId) {
    // 2. customer metadata
    try {
      const customer = await stripe.customers.retrieve(opts.stripeCustomerId);
      if (!customer.deleted) {
        const metaUserId = customer.metadata?.userId;
        if (metaUserId) return metaUserId;

        // 3. lookup by customer id
        const { data: byCustomer } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", opts.stripeCustomerId)
          .maybeSingle();
        if (byCustomer?.user_id) return byCustomer.user_id;

        // 4. lookup by email via auth admin
        if (customer.email) {
          const { data } = await supabase.auth.admin.listUsers();
          const match = data?.users.find(
            (u) => u.email?.toLowerCase() === customer.email?.toLowerCase(),
          );
          if (match) return match.id;
        }
      }
    } catch (err) {
      console.error("resolveUserId: stripe customer fetch failed", err);
    }
  }

  return null;
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const userId = await resolveUserId({
    metadataUserId: session.metadata?.userId ?? null,
    stripeCustomerId: customerId,
  });

  if (!userId) {
    console.error("checkout.session.completed: could not resolve user", session.id);
    return;
  }

  // Pull the full subscription so we have price + period_end.
  if (!subscriptionId) {
    console.error("checkout.session.completed: no subscription id", session.id);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await writeSubscriptionRow(userId, subscription);
}

async function handleSubscriptionUpsert(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId = await resolveUserId({
    metadataUserId: subscription.metadata?.userId ?? null,
    stripeCustomerId: customerId,
  });

  if (!userId) {
    console.error(
      "customer.subscription.created/updated: could not resolve user",
      subscription.id,
    );
    return;
  }

  await writeSubscriptionRow(userId, subscription);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId = await resolveUserId({
    metadataUserId: subscription.metadata?.userId ?? null,
    stripeCustomerId: customerId,
  });

  if (!userId) {
    console.error(
      "customer.subscription.deleted: could not resolve user",
      subscription.id,
    );
    return;
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      tier: "free",
      status: "canceled",
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: false,
      current_period_end: periodEndDate(subscription.current_period_end)?.toISOString() ?? null,
    })
    .eq("user_id", userId);
  if (error) {
    console.error("subscription.deleted: update failed", error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  if (!customerId) return;

  const userId = await resolveUserId({
    metadataUserId: null,
    stripeCustomerId: customerId,
  });
  if (!userId) {
    console.error("invoice.payment_failed: could not resolve user", invoice.id);
    return;
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("user_id", userId);
  if (error) {
    console.error("invoice.payment_failed: update failed", error);
    throw error;
  }
}

/**
 * Idempotent write of a Stripe subscription into our table. Uses upsert on
 * user_id (the PK) so we never accidentally orphan rows.
 */
async function writeSubscriptionRow(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;
  const tier = tierFromPriceId(priceId);

  // Stripe subscription statuses are a superset of ours; coerce.
  const status = mapStatus(subscription.status);

  const supabase = createServiceClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      tier,
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: periodEndDate(subscription.current_period_end)?.toISOString() ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("writeSubscriptionRow: upsert failed", error);
    throw error;
  }
}

function mapStatus(
  stripeStatus: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "trialing" | "incomplete" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "incomplete";
    default:
      return "incomplete";
  }
}
