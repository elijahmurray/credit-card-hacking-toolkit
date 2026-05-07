import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PUBLIC_TIERS, type TierId } from "@/lib/pricing";
import { PricingCard } from "@/components/pricing/pricing-card";
import { UpgradeButton } from "@/components/pricing/upgrade-button";

export const metadata = {
  title: "Pricing — Credit Card Hacker",
  description:
    "$15/month for unlimited Sonnet, or stay free with 10 messages a day. One Sapphire Preferred SUB pays for years of Pro.",
};

/**
 * Public pricing page. Server component — checks auth so the CTA on each
 * card is correctly tailored (Sign up / Upgrade / Current plan).
 */
export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: TierId | null = null;
  if (user) {
    const service = createServiceClient();
    const { data } = await service
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.tier === "free" || data?.tier === "pro" || data?.tier === "power") {
      currentTier = data.tier;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Simple pricing
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          One Sapphire Preferred SUB at floor cpp is roughly $1,275 in value.
          Pro pays for itself in the first card.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {PUBLIC_TIERS.map((tierId) => {
          const isPaid = tierId !== "free";
          const isCurrent = currentTier === tierId;

          let cta: React.ReactNode;
          if (isCurrent) {
            cta = (
              <div className="rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-center text-sm font-medium text-zinc-700">
                Your current plan
              </div>
            );
          } else if (!isPaid) {
            // Free
            cta = user ? (
              <Link
                href="/chat"
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Continue on Free
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Sign up — free
              </Link>
            );
          } else {
            // Paid tier (currently just Pro on the public page)
            cta = user ? (
              <UpgradeButton tier={tierId as Exclude<TierId, "free">}>
                Upgrade to Pro
              </UpgradeButton>
            ) : (
              <Link
                href="/signup?intent=pro"
                className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Sign up to upgrade
              </Link>
            );
          }

          return (
            <PricingCard
              key={tierId}
              tier={tierId}
              highlighted={isPaid}
              cta={cta}
            />
          );
        })}
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-zinc-500">
        Prices in USD. Cancel anytime from your settings page. Power tier
        ($39/mo, Opus on demand) coming soon for users who want deeper
        portfolio audits.
      </p>
    </main>
  );
}
