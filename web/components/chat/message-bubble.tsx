"use client";

import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "system" || role === "data") return null;
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-md border px-4 py-3 text-sm",
          isUser
            ? "border-zinc-200 bg-white text-zinc-900"
            : "border-transparent bg-transparent text-zinc-900",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <article className="prose prose-zinc prose-sm max-w-none prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-table:text-xs">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
