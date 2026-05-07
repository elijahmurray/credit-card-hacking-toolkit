import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserTier } from "@/lib/billing/resolve-tier";
import { TIERS, pickModelForRequest, type ModelId, type TierId } from "@/lib/pricing";

export interface RateLimitResult {
  allowed: boolean;
  model: ModelId;
  isFallback: boolean;
  tier: TierId;
  usage: {
    premium: number;
    fallback: number;
    quota: number;
  };
}

/**
 * Returns today's UTC date as YYYY-MM-DD. We bucket usage on UTC days so the
 * server doesn't depend on the user's timezone (and so a single user can't
 * race the rollover by changing their clock).
 */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Decides whether a chat request should be allowed and which model to use.
 *
 * - Reads the user's current tier (and the daily_usage row for today)
 * - Asks pricing.ts which model to pick given premium count so far
 * - Enforces hard `totalDailyCap` if the tier defines one (currently none do)
 *
 * Caller is responsible for invoking `recordUsage` AFTER the request completes
 * so that the next request sees the updated counts.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = createServiceClient();
  const tier = await getUserTier(userId);
  const tierConfig = TIERS[tier];

  const { data, error } = await supabase
    .from("daily_usage")
    .select("premium_messages, fallback_messages")
    .eq("user_id", userId)
    .eq("date", todayUtc())
    .maybeSingle();

  if (error) {
    console.error("checkRateLimit: supabase error", error);
  }

  const premium = data?.premium_messages ?? 0;
  const fallback = data?.fallback_messages ?? 0;

  const { model, isFallback } = pickModelForRequest(tier, premium);

  const allowed =
    tierConfig.totalDailyCap === 0 || premium + fallback < tierConfig.totalDailyCap;

  return {
    allowed,
    model,
    isFallback,
    tier,
    usage: {
      premium,
      fallback,
      quota: tierConfig.premiumDailyQuota,
    },
  };
}
