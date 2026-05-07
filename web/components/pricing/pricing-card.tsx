import { Check } from "lucide-react";
import { TIERS, type TierId } from "@/lib/pricing";
import { formatMonthly } from "@/lib/billing/format";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: TierId;
  highlighted?: boolean;
  cta: React.ReactNode;
}

/**
 * Server component. Renders one tier card. The CTA is passed in as a slot so
 * the parent can swap between sign-up link, upgrade button, current-plan
 * indicator, etc., without leaking auth state into this component.
 */
export function PricingCard({ tier, highlighted = false, cta }: PricingCardProps) {
  const t = TIERS[tier];

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-white p-8",
        highlighted
          ? "border-zinc-900 shadow-md ring-1 ring-zinc-900"
          : "border-zinc-200",
      )}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold text-zinc-900">{t.name}</h3>
        {highlighted ? (
          <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
            Recommended
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <span className="text-4xl font-semibold tracking-tight text-zinc-900">
          {t.priceMonthly === 0 ? "$0" : `$${t.priceMonthly}`}
        </span>
        <span className="ml-1 text-sm text-zinc-500">
          {t.priceMonthly === 0 ? "forever" : "/month"}
        </span>
        {t.priceMonthly > 0 ? (
          <p className="mt-1 text-xs text-zinc-500">
            Billed monthly via Stripe — cancel anytime ({formatMonthly(t.priceMonthly)})
          </p>
        ) : null}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {t.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-zinc-700">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-900" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">{cta}</div>
    </div>
  );
}
