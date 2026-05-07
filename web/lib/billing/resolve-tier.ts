import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import type { TierId } from "@/lib/pricing";

/**
 * Resolve the current tier for a given user. Reads from the `subscriptions`
 * table via the service-role client because some callers (e.g. the Stripe
 * webhook) operate without an authenticated user session — auth.uid() is null
 * there, so RLS would reject the read.
 *
 * Defaults to "free" if no subscription row exists yet (e.g. the row hasn't
 * been backfilled by the handle_new_user trigger).
 */
export async function getUserTier(userId: string): Promise<TierId> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Fail closed but don't throw — rate-limit path is hot.
    console.error("getUserTier: supabase error", error);
    return "free";
  }

  if (!data) return "free";

  // Canceled / past_due users fall back to free behavior immediately.
  // (Stripe webhook is the authoritative path that flips status; we double-
  // check here to avoid serving Pro features to a lapsed user mid-cycle.)
  if (data.status === "canceled") return "free";

  const tier = data.tier as TierId;
  if (tier === "free" || tier === "pro" || tier === "power") return tier;
  return "free";
}
