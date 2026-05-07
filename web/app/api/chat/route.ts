import { NextResponse } from "next/server";
import { streamText, type CoreMessage } from "ai";

import { anthropic } from "@/lib/ai/anthropic";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { pickModelForRequest, type TierId } from "@/lib/pricing";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { CardHackerProfile } from "@/lib/types";

export const runtime = "nodejs"; // need fs for skill-loader

interface ChatRequestBody {
  messages: CoreMessage[];
  conversationId?: string;
}

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
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { messages, conversationId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // 3. Load tier + today's usage. Service client for the writes later;
  //    user-scoped client (RLS) for reads is fine.
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

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
  const profile = (profileRow?.data ?? null) as
    | CardHackerProfile
    | Record<string, unknown>
    | null;

  // 4. Pick model
  const { model: modelId, isFallback } = pickModelForRequest(
    tier,
    premiumUsedToday,
  );

  // 5. Build system prompt (static + dynamic). Cache_control is set on the
  //    system message via providerOptions so the static block stays warm
  //    across requests.
  const built = await buildSystemPrompt({ profile });

  // 6. Stream
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const lastUserText =
    typeof lastUserMessage?.content === "string"
      ? lastUserMessage.content
      : Array.isArray(lastUserMessage?.content)
        ? lastUserMessage!.content
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("")
        : "";

  const result = streamText({
    model: anthropic()(modelId),
    // Pass the system prompt as a `system` message via the messages array so
    // we can attach providerOptions.cacheControl to it. The static block goes
    // in its own system message (cacheable), the dynamic profile block in a
    // second system message (uncached).
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

        // a) Ensure conversation exists (or create one).
        let convId = conversationId;
        if (!convId) {
          const { data: created } = await service
            .from("conversations")
            .insert({
              user_id: user.id,
              title: lastUserText.slice(0, 80) || "New conversation",
            })
            .select("id")
            .single();
          convId = created?.id;
        }

        // b) Insert the user's last message + the assistant reply.
        if (convId) {
          await service.from("messages").insert([
            {
              conversation_id: convId,
              user_id: user.id,
              role: "user",
              content: lastUserText,
            },
            {
              conversation_id: convId,
              user_id: user.id,
              role: "assistant",
              content: text,
              model: modelId,
              input_tokens: usage?.promptTokens ?? null,
              output_tokens: usage?.completionTokens ?? null,
              is_fallback: isFallback,
            },
          ]);
        }

        // c) Bump daily_usage. Upsert by composite key (user_id, date).
        const premiumDelta = isFallback ? 0 : 1;
        const fallbackDelta = isFallback ? 1 : 0;
        const inputDelta = usage?.promptTokens ?? 0;
        const outputDelta = usage?.completionTokens ?? 0;

        const { data: existing } = await service
          .from("daily_usage")
          .select("premium_messages, fallback_messages, total_input_tokens, total_output_tokens")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (existing) {
          await service
            .from("daily_usage")
            .update({
              premium_messages: existing.premium_messages + premiumDelta,
              fallback_messages: existing.fallback_messages + fallbackDelta,
              total_input_tokens: Number(existing.total_input_tokens) + inputDelta,
              total_output_tokens: Number(existing.total_output_tokens) + outputDelta,
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
        console.error("[chat:onFinish] bookkeeping failed", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
