---
name: application-rules
description: Issuer-specific application rules — Chase 5/24, Amex 1/5 day + 2/90 + 5-card limit, Citi 8/65/95 + 48-month SUB, BoA 2/3/4, US Bank 2/12, Cap One 1/6, Barclays 6/24, Wells 1/6, Discover business reports to personal. MUST load before recommending any card application. Use whenever a user asks about applying for a card, asks "am I 5/24?", or you're about to compute Y1 net value for a candidate.
---

# application-rules — the gates that decide if you can even get a SUB

## When to load

- Before recommending any card application (mandatory per CLAUDE.md)
- When user asks "am I 5/24?", "how soon can I apply for another Amex?", "did I just kill myself with that BoA app?"
- When computing application velocity penalties for Y1 net value

## Where the data lives

`data/application-rules.json` — keyed by issuer with rule names, applies-to scope, what-counts / what-does-not-count, confidence level, and primary sources.

## How to use it

1. **Read the file.** Don't paraphrase from memory. The rules update.
2. **Cross-reference the user's profile** (`./profile.json` → `gates`). You should already have computed counts during `getting-started`. If a count looks stale (last update >30 days), re-derive from `cards[]` open dates.
3. **For each candidate card, check every rule that could deny it.** Don't stop at 5/24. Check family lockouts (`card-families` skill), once-per-lifetime (`welcome-offer-language` skill), and velocity (`velocity-guardrails` skill).
4. **Preserve the confidence level.** If a rule is `LIKELY` rather than `VERIFIED`, say so in your output. Don't make `LIKELY` rules sound like hard limits.

## The 5/24 calculation (most common gotcha)

5/24 = personal cards opened in the last 24 months from issuers that report to **personal** credit bureaus.

**Counts:**
- Personal cards from any issuer (Chase, Amex personal, Citi personal, BoA personal, Wells, US Bank, Barclays, Discover, Synchrony in most cases)
- Capital One business cards (Spark) — they DO report to personal
- Discover business cards — they DO report to personal
- Authorized user cards (safer to assume yes)

**Does NOT count:**
- Amex business cards
- Chase business cards (Ink)
- Citi business cards
- BoA business cards
- US Bank business cards
- Wells Fargo business cards

**Subtle:** Even though Chase business cards don't COUNT toward 5/24, Chase still CHECKS 5/24 when approving them. If you're at 5/24, you can't get an Ink either.

## When a rule blocks the recommendation

Don't soften it. Output:

> ❌ Blocked by Chase 5/24 — currently at 5/24 (cards: ink_cash 2025-02, amex_gold 2024-11, …). Earliest viable Chase application: 2026-09-15 (when amex_gold rolls off).

Then either pivot to a non-Chase candidate or recommend waiting + give the unblock date.

## When a rule has soft confidence

E.g., Chase 1/30:

> ⚠️ Likely blocked by Chase 1/30 — opened CSP on 2026-04-20. Recon may approve, but most DPs say wait until 2026-05-20. Worth testing if you have an elevated targeted offer expiring sooner.

## See also

- `card-families` — family-level lockouts (Sapphire 48mo, Marriott cross-issuer)
- `welcome-offer-language` — Amex once-per-lifetime exact wording
- `velocity-guardrails` — soft rules beyond stated app rules
- `shutdown-risk` — what happens if you violate these too aggressively
