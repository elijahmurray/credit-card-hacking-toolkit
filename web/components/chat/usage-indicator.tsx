"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface UsageResponse {
  tier: "free" | "pro" | "power";
  premiumUsedToday: number;
  premiumDailyQuota: number;
}

/**
 * Top-right badge showing today's premium-message usage.
 *
 * Depends on `/api/usage` which is owned by the stripe-builder agent. Until
 * that endpoint exists, we silently fall back to a placeholder ("5/10 today")
 * so the UI doesn't break.
 */
export function UsageIndicator() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/usage")
      .then(async (res) => {
        if (!res.ok) {
          setMissing(true);
          return null;
        }
        return (await res.json()) as UsageResponse;
      })
      .then((data) => {
        if (!cancelled && data) setUsage(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Placeholder shape until /api/usage ships.
  const display = usage ?? {
    tier: "free" as const,
    premiumUsedToday: 5,
    premiumDailyQuota: 10,
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600"
        title={missing ? "Usage endpoint not yet available — placeholder" : ""}
      >
        {display.premiumUsedToday} / {display.premiumDailyQuota} today
      </span>
      {display.tier === "free" && (
        <Link
          href="/pricing"
          className="text-xs font-medium text-zinc-700 hover:text-zinc-900"
        >
          Upgrade →
        </Link>
      )}
    </div>
  );
}
