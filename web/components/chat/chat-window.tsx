"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

import { Composer } from "./composer";
import { MessageBubble } from "./message-bubble";
import { UsageIndicator } from "./usage-indicator";

export function ChatWindow() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: "/api/chat",
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">Credit Card Hacker</h1>
        <UsageIndicator />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-zinc-50">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          {messages.length === 0 && <EmptyState />}
          <div className="space-y-4">
            {messages.map((m) => (
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

function EmptyState() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-base font-semibold text-zinc-900">
        Ask me what to apply for next.
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        I read your card history, check 5/24 + family lockouts, pull current
        SUBs, and give one opinionated recommendation with the math.
      </p>
      <p className="mt-4 text-xs text-zinc-500">
        Try: <span className="font-mono">/credit-card-hacker:next-card</span> ·{" "}
        <span className="font-mono">should I keep my CSR?</span> ·{" "}
        <span className="font-mono">help me hit a $4K MSR</span>
      </p>
    </div>
  );
}
