import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TIERS, type TierId } from "@/lib/pricing";
import { formatMonthly } from "@/lib/billing/format";
import { UpgradeButton } from "@/components/pricing/upgrade-button";
import { ManageBillingButton } from "./manage-billing-button";

export const metadata = {
  title: "Settings — Credit Card Hacker",
};

interface SubRow {
  tier: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

/**
 * Subscription management page. Shows current tier, status, period-end, and
 * "Manage billing" (portal) for paid users + "Upgrade" for free users.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  const service = createServiceClient();
  const { data: rawSub } = await service
    .from("subscriptions")
    .select(
      "tier, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const sub = (rawSub ?? {
    tier: "free",
    status: "active",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
  }) as SubRow;

  const tier: TierId =
    sub.tier === "pro" || sub.tier === "power" || sub.tier === "free"
      ? (sub.tier as TierId)
      : "free";
  const tierConfig = TIERS[tier];
  const hasStripeCustomer = Boolean(sub.stripe_customer_id);
  const isPaid = tier !== "free";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Settings</h1>
      <p className="mt-1 text-sm text-zinc-600">{user.email}</p>

      <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Subscription</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Current plan: <span className="font-medium text-zinc-900">{tierConfig.name}</span>
              <span className="ml-2 text-zinc-500">— {formatMonthly(tierConfig.priceMonthly)}</span>
            </p>
          </div>
          <StatusPill status={sub.status ?? "active"} />
        </div>

        {sub.current_period_end ? (
          <p className="mt-3 text-sm text-zinc-600">
            {sub.cancel_at_period_end ? "Cancels on " : "Renews on "}
            <span className="font-medium text-zinc-900">
              {new Date(sub.current_period_end).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {sub.cancel_at_period_end ? " — you'll drop to Free after that." : null}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isPaid && hasStripeCustomer ? (
            <ManageBillingButton />
          ) : null}

          {!isPaid ? (
            <div className="flex-1">
              <UpgradeButton tier="pro">Upgrade to Pro — $15/mo</UpgradeButton>
            </div>
          ) : null}

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Compare plans
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">What's included</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          {tierConfig.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const label =
    status === "active"
      ? "Active"
      : status === "trialing"
        ? "Trialing"
        : status === "past_due"
          ? "Past due"
          : status === "canceled"
            ? "Canceled"
            : "Pending";
  const tone =
    status === "active" || status === "trialing"
      ? "bg-emerald-100 text-emerald-800"
      : status === "past_due"
        ? "bg-amber-100 text-amber-800"
        : status === "canceled"
          ? "bg-zinc-200 text-zinc-700"
          : "bg-zinc-100 text-zinc-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
