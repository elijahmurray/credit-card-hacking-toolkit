import { NextResponse } from "next/server";
import { streamText, type CoreMessage } from "ai";

import { anthropic } from "@/lib/ai/anthropic";
import {
  buildOnboardingSystemPrompt,
  extractProfileJson,
} from "@/lib/ai/onboarding-system-prompt";
import { pickModelForRequest, type TierId } from "@/lib/pricing";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // need fs for skill-loader

interface OnboardingRequestBody {
  messages: CoreMessage[];
}

/**
 * Onboarding chat endpoint. Mirrors /api/chat but:
 *  - Uses the onboarding-biased system prompt that forces the agent to run the
 *    `getting-started` Q&A flow.
 *  - On stream finish, looks for a fenced ```json block in the assistant's
 *    final message. If found AND parses cleanly, persists to profiles.data and
 *    flips onboarded = true.
 *
 * We deliberately do NOT log onboarding messages into the conversations table —
 * onboarding is not a "conversation" the user reviews later, and the captured
 * data lives on profiles.data anyway. This keeps the chat history clean.
 */
export async function POST(req: Request) {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: OnboardingRequestBody;
  try {
    body = (await req.json()) as OnboardingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // 3. Load tier + today's usage + any existing partial profile.
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: subRow }, { data: usageRow }, { data: profileRow }] =
    await Promise.all([
      supabase.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("daily_usage")
        .select("premium_messages, fallback_messages")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
      supabase.from("profiles").select("data").eq("id", user.id).maybeSingle(),
    ]);

  const tier: TierId = (subRow?.tier as TierId | undefined) ?? "free";
  const premiumUsedToday = usageRow?.premium_messages ?? 0;
  const partialProfile =
    (profileRow?.data ?? null) as Record<string, unknown> | null;

  // 4. Pick model (same routing as main chat — onboarding shouldn't bypass quotas).
  const { model: modelId, isFallback } = pickModelForRequest(tier, premiumUsedToday);

  // 5. Build prompt
  const built = await buildOnboardingSystemPrompt({
    partialProfile,
    todayIso: today,
  });

  // 6. Stream
  const result = streamText({
    model: anthropic()(modelId),
    messages: [
      {
        role: "system",
        content: built.staticSystem,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      {
        role: "system",
        content: built.dynamicSystem,
      },
      ...messages,
    ] as CoreMessage[],

    onFinish: async ({ usage, text }) => {
      try {
        const service = createServiceClient();

        // a) Detect a profile JSON block in the assistant text. If present and
        //    parseable, persist + mark onboarded.
        const parsed = extractProfileJson(text);
        if (parsed) {
          // Ensure last_updated is today regardless of what the model emitted.
          const profileToSave = {
            ...parsed,
            schema_version: 1,
            last_updated: today,
          };
          await service
            .from("profiles")
            .update({
              data: profileToSave,
              onboarded: true,
            })
            .eq("id", user.id);
        }

        // b) Bump daily_usage so onboarding messages count against quota.
        const premiumDelta = isFallback ? 0 : 1;
        const fallbackDelta = isFallback ? 1 : 0;
        const inputDelta = usage?.promptTokens ?? 0;
        const outputDelta = usage?.completionTokens ?? 0;

        const { data: existing } = await service
          .from("daily_usage")
          .select(
            "premium_messages, fallback_messages, total_input_tokens, total_output_tokens",
          )
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (existing) {
          await service
            .from("daily_usage")
            .update({
              premium_messages: existing.premium_messages + premiumDelta,
              fallback_messages: existing.fallback_messages + fallbackDelta,
              total_input_tokens:
                Number(existing.total_input_tokens) + inputDelta,
              total_output_tokens:
                Number(existing.total_output_tokens) + outputDelta,
            })
            .eq("user_id", user.id)
            .eq("date", today);
        } else {
          await service.from("daily_usage").insert({
            user_id: user.id,
            date: today,
            premium_messages: premiumDelta,
            fallback_messages: fallbackDelta,
            total_input_tokens: inputDelta,
            total_output_tokens: outputDelta,
          });
        }
      } catch (err) {
        // Don't fail the user-facing response on bookkeeping errors.
        console.error("[onboarding:onFinish] bookkeeping failed", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
