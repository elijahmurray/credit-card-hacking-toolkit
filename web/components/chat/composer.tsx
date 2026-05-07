"use client";

import { type ChangeEvent, type FormEvent, type KeyboardEvent, useRef } from "react";

interface ComposerProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  isLoading,
  onStop,
}: ComposerProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim().length > 0) {
        formRef.current?.requestSubmit();
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={isLoading}
        placeholder="Ask about your next card, MSR plan, retention call…"
        className="flex-1 resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:bg-zinc-50"
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={value.trim().length === 0}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Send
        </button>
      )}
    </form>
  );
}
