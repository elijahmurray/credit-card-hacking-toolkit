import { NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/stripe/portal
 * Returns: { url } — Stripe Customer Portal session, redirect to manage
 * subscription / payment method / cancel.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: sub } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "no Stripe customer for this user" },
      { status: 404 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
