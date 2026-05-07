/**
 * Tier configuration. Single source of truth for pricing, quotas, model selection.
 *
 * Pricing rationale (from research, see: docs/pricing-research.md):
 * - Anchor in market is $20/mo for "serious AI" (ChatGPT/Claude/Cursor Pro). We sit
 *   below at $15 to signal "specialized vertical" and clear the impulse-buy threshold.
 * - Free uses HYBRID pattern: full Sonnet for first N msgs/day, then silent fallback
 *   to Haiku 4.5 (no hard wall — never cut off mid-conversation).
 * - One Sapphire Preferred SUB at floor cpp = ~$1,275 value. Pro ROI is obvious.
 *
 * To change pricing: edit this file + regenerate Stripe products via dashboard,
 * then update STRIPE_PRICE_ID_PRO in env.
 */

export type TierId = "free" | "pro" | "power";

export type ModelId = "claude-haiku-4-5-20251001" | "claude-sonnet-4-6" | "claude-opus-4-7";

export interface Tier {
  id: TierId;
  name: string;
  priceMonthly: number; // USD
  stripePriceEnvVar?: string; // env var name holding Stripe price ID
  /** Daily quota of "premium" (Sonnet) messages. Hits cap → fallback model. */
  premiumDailyQuota: number;
  /** Hard daily total cap (premium + fallback combined). 0 = unlimited. */
  totalDailyCap: number;
  /** Soft monthly cap to control runaway abuse. 0 = unlimited. */
  monthlyCap: number;
  premiumModel: ModelId;
  fallbackModel: ModelId | null; // null = hard cutoff with friendly upgrade prompt
  features: string[];
}

export const TIERS: Record<TierId, Tier> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    premiumDailyQuota: 10,
    totalDailyCap: 0, // unlimited Haiku after Sonnet quota exhausted
    monthlyCap: 0,
    premiumModel: "claude-sonnet-4-6",
    fallbackModel: "claude-haiku-4-5-20251001",
    features: [
      "10 Sonnet messages per day, then unlimited Haiku",
      "Profile builder + card history",
      "Next-card recommendations",
      "Min-spend planning",
      "Bank-bonus tracking",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 15,
    stripePriceEnvVar: "STRIPE_PRICE_ID_PRO",
    premiumDailyQuota: 200, // soft daily cap to prevent abuse
    totalDailyCap: 0,
    monthlyCap: 0,
    premiumModel: "claude-sonnet-4-6",
    fallbackModel: "claude-sonnet-4-6", // never degrade Pro
    features: [
      "Effectively unlimited Sonnet messages",
      "Everything in Free",
      "Retention-call scripts + EV computations",
      "Cancel/keep/downgrade decision trees",
      "App-day sequencing planner",
      "Quarterly portfolio review",
      "AwardWallet auto-sync",
    ],
  },
  // Power tier defined but NOT YET LAUNCHED. Add when Pro hits soft cap signals.
  power: {
    id: "power",
    name: "Power",
    priceMonthly: 39,
    stripePriceEnvVar: "STRIPE_PRICE_ID_POWER",
    premiumDailyQuota: 1000,
    totalDailyCap: 0,
    monthlyCap: 0,
    premiumModel: "claude-sonnet-4-6",
    fallbackModel: "claude-sonnet-4-6",
    features: [
      "Everything in Pro",
      "Opus 4.7 for deep portfolio audits + 'should I keep this card?' analyses",
      "Priority support",
      "Player-2 household linking (manage two profiles)",
      "API export of recommendations",
    ],
  },
};

/** Tiers visible in the pricing page UI at launch. Excludes Power until ready. */
export const PUBLIC_TIERS: TierId[] = ["free", "pro"];

export function getTier(id: TierId): Tier {
  return TIERS[id];
}

export function pickModelForRequest(
  tier: TierId,
  premiumUsedToday: number,
): { model: ModelId; isFallback: boolean } {
  const t = TIERS[tier];
  if (premiumUsedToday < t.premiumDailyQuota) {
    return { model: t.premiumModel, isFallback: false };
  }
  if (t.fallbackModel) {
    return { model: t.fallbackModel, isFallback: true };
  }
  // No fallback configured = hard cap. Caller checks `isFallback` & should
  // interpret null as "send upgrade prompt instead of generating."
  return { model: t.premiumModel, isFallback: true };
}
