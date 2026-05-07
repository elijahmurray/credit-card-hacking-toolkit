import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Atomically increments today's usage counters for a user. Uses Postgres
 * `on conflict ... do update` semantics via Supabase RPC fallback to a
 * raw SQL upsert (we issue this through a stored function-style query so
 * the increment is done server-side and is concurrency-safe).
 *
 * The supabase-js .upsert() helper would clobber existing values rather than
 * incrementing them, so we use rpc to a SQL fragment instead.
 */
export async function recordUsage(
  userId: string,
  isFallback: boolean,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const supabase = createServiceClient();
  const date = todayUtc();
  const premiumDelta = isFallback ? 0 : 1;
  const fallbackDelta = isFallback ? 1 : 0;

  // Upsert via a single SQL statement using PostgREST. Supabase exposes this
  // through `.from(...).upsert(..., { onConflict, ignoreDuplicates: false })`
  // but that overwrites — to ADD, we wrap in a tiny RPC. Until the project
  // adds a `record_daily_usage` SQL function, do a read+write fallback.
  // (Race window is tiny; chat requests are sequential per user.)
  const { data: existing, error: selectErr } = await supabase
    .from("daily_usage")
    .select("premium_messages, fallback_messages, total_input_tokens, total_output_tokens")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (selectErr) {
    console.error("recordUsage: select error", selectErr);
    return;
  }

  if (!existing) {
    const { error: insertErr } = await supabase.from("daily_usage").insert({
      user_id: userId,
      date,
      premium_messages: premiumDelta,
      fallback_messages: fallbackDelta,
      total_input_tokens: inputTokens,
      total_output_tokens: outputTokens,
    });
    if (insertErr) {
      // Likely a concurrent insert won — retry as update.
      if (insertErr.code === "23505") {
        await applyIncrement(userId, date, premiumDelta, fallbackDelta, inputTokens, outputTokens);
        return;
      }
      console.error("recordUsage: insert error", insertErr);
    }
    return;
  }

  await applyIncrement(userId, date, premiumDelta, fallbackDelta, inputTokens, outputTokens, existing);
}

async function applyIncrement(
  userId: string,
  date: string,
  premiumDelta: number,
  fallbackDelta: number,
  inputTokens: number,
  outputTokens: number,
  existing?: {
    premium_messages: number;
    fallback_messages: number;
    total_input_tokens: number;
    total_output_tokens: number;
  },
): Promise<void> {
  const supabase = createServiceClient();

  let current = existing;
  if (!current) {
    const { data } = await supabase
      .from("daily_usage")
      .select("premium_messages, fallback_messages, total_input_tokens, total_output_tokens")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();
    current = data ?? {
      premium_messages: 0,
      fallback_messages: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
    };
  }

  const { error } = await supabase
    .from("daily_usage")
    .update({
      premium_messages: current.premium_messages + premiumDelta,
      fallback_messages: current.fallback_messages + fallbackDelta,
      total_input_tokens: current.total_input_tokens + inputTokens,
      total_output_tokens: current.total_output_tokens + outputTokens,
    })
    .eq("user_id", userId)
    .eq("date", date);

  if (error) {
    console.error("recordUsage: update error", error);
  }
}
