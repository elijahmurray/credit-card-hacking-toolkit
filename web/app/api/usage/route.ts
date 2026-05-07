import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { TIERS } from "@/lib/pricing";

/**
 * GET /api/usage
 * Returns the current user's tier + today's usage. Used by the chat UI's
 * UsageIndicator component (informational; no `allowed` field).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await checkRateLimit(user.id);
  const tierConfig = TIERS[result.tier];

  return NextResponse.json({
    tier: result.tier,
    tierName: tierConfig.name,
    model: result.model,
    nextRequestIsFallback: result.isFallback,
    usage: {
      premium: result.usage.premium,
      fallback: result.usage.fallback,
      premiumQuota: tierConfig.premiumDailyQuota,
      totalDailyCap: tierConfig.totalDailyCap,
    },
  });
}
