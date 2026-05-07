import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TIERS, type TierId } from "@/lib/pricing";

/**
 * POST /api/stripe/checkout
 * Body: { tier: "pro" | "power" }
 * Returns: { url } — redirect the browser to this URL.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "user has no email" }, { status: 400 });
  }

  let body: { tier?: TierId };
  try {
    body = (await req.json()) as { tier?: TierId };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const tier = body.tier;
  if (tier !== "pro" && tier !== "power") {
    return NextResponse.json(
      { error: "tier must be 'pro' or 'power'" },
      { status: 400 },
    );
  }

  const tierConfig = TIERS[tier];
  const priceEnvVar = tierConfig.stripePriceEnvVar;
  if (!priceEnvVar) {
    return NextResponse.json(
      { error: `tier ${tier} has no stripePriceEnvVar configured` },
      { status: 500 },
    );
  }
  const priceId = process.env[priceEnvVar];
  if (!priceId) {
    return NextResponse.json(
      { error: `${priceEnvVar} is not set in environment` },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const service = createServiceClient();

  // Get-or-create Stripe customer.
  const { data: subRow } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = subRow?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    // Persist on the subscriptions row (handle_new_user trigger creates the row
    // at signup, but if it's missing for any reason, upsert).
    const { error: upsertErr } = await service
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          tier: "free",
          status: "active",
        },
        { onConflict: "user_id" },
      );
    if (upsertErr) {
      console.error("checkout: failed to persist customer id", upsertErr);
    }
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      metadata: { userId: user.id, tier },
    },
    metadata: { userId: user.id, tier },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "stripe did not return a checkout url" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
