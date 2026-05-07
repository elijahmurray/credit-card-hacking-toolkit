"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Composer } from "@/components/chat/composer";
import { MessageBubble } from "@/components/chat/message-bubble";

/**
 * Onboarding chat. Same shape as ChatWindow but:
 *  - Hits /api/onboarding instead of /api/chat
 *  - Seeds an intro message so the user sees what's about to happen before
 *    typing anything
 *  - Detects when the assistant has emitted a fenced ```json block (which means
 *    the server has just persisted the profile) and shows a "you're set"
 *    completion banner with a button to /chat
 */
export function OnboardingChat() {
  const router = useRouter();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    append,
  } = useChat({
    api: "/api/onboarding",
  });

  // On first render, kick the agent off so the user sees Batch 1 immediately
  // instead of an empty composer. We send a one-word seed message; the system
  // prompt tells the agent to open with an intro + Batch 1.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    if (messages.length > 0) return;
    startedRef.current = true;
    void append({ role: "user", content: "Let's start onboarding." });
  }, [append, messages.length]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Did the agent just emit the completion JSON block? If so, server has
  // already persisted profile + flipped onboarded. We surface a banner.
  const isComplete = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return false;
    return /```\s*json/i.test(last.content);
  }, [messages]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  async function handleSaveAndExit() {
    // We don't have the structured profile client-side (the agent holds it).
    // The safest "save and continue" semantics here is: leave the page. The
    // backend already has whatever profile JSON the agent has emitted; if the
    // agent hasn't emitted one yet, profiles.data stays empty and the user
    // remains un-onboarded — they'll be redirected back to /onboarding next
    // visit, which is exactly what we want.
    setSavingDraft(true);
    setDraftError(null);
    try {
      router.push("/chat");
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Failed to exit");
      setSavingDraft(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">
            Build your churning profile
          </h1>
          <p className="text-xs text-zinc-500">
            ~7 batches of short questions. Say &quot;skip&quot; on anything you
            don&apos;t know.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAndExit}
          disabled={savingDraft}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and continue later
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-zinc-50">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {messages.length === 0 && <IntroState />}
          <div className="space-y-4">
            {messages
              // Hide the seed user message — it's just a kickoff, not real input.
              .filter(
                (m, i) =>
                  !(
                    i === 0 &&
                    m.role === "user" &&
                    m.content === "Let's start onboarding."
                  ),
              )
              .map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} />
              ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "user" && (
                <MessageBubble role="assistant" content="…" />
              )}
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.message || "Something went wrong. Try again."}
            </div>
          )}
          {draftError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {draftError}
            </div>
          )}

          {isComplete && !isLoading && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">Profile saved.</p>
              <p className="mt-1 text-xs text-emerald-800">
                You&apos;re all set. Head to chat and ask what to apply for next.
              </p>
              <button
                type="button"
                onClick={() => router.push("/chat")}
                className="mt-3 inline-flex items-center rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
              >
                Go to chat →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          <Composer
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
          />
        </div>
      </div>
    </div>
  );
}

function IntroState() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-base font-semibold text-zinc-900">
        Let&apos;s build your profile.
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        Seven short batches: household, credit, current cards, gates, earning,
        points, goals. Takes about 5 minutes.
      </p>
      <p className="mt-4 text-xs text-zinc-500">
        Loading your first batch of questions…
      </p>
    </div>
  );
}
