"use client";

import { useState } from "react";
import type { TierId } from "@/lib/pricing";

interface UpgradeButtonProps {
  tier: Exclude<TierId, "free">;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Posts to /api/stripe/checkout for the given tier and redirects the browser
 * to the returned Stripe Checkout URL.
 */
export function UpgradeButton({ tier, children, className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? `Request failed (${res.status})`);
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={
          className ??
          "inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        }
      >
        {loading ? "Redirecting…" : (children ?? `Upgrade to ${tier}`)}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
