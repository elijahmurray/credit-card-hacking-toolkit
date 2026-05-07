---
name: bank-bonus
description: Current bank/brokerage bonuses ranked by ROI/hour, filtered to ones the user is eligible for (ChexSystems, prior-bonus lockouts, 5/24 if Chase Business, state restrictions). Triggered by "/credit-card-hacker:bank-bonus", "any good bank bonuses?", "what bank bonus should I do?", "Chase $300 still around?".
---

# bank-bonus — eligible bank bonuses ranked

## Trigger phrases

- `/credit-card-hacker:bank-bonus`
- "Any good bank bonuses?"
- "What bank bonus should I do?"
- "Is the Chase $300 still around?"
- "I want a quick cash play"

## Hard prerequisite

`./profile.json` must exist (need ChexSystems status, prior bonuses, state, 5/24 for Chase Biz).

## The flow

### Step 1 — Load data + skill

Read `data/bank-bonuses.json`. Load `bank-bonus-rules` skill.

### Step 2 — Filter to eligible

For each bonus:
- Check prior-bonus lockout against profile (e.g., Chase 2yr — search `cards[]` and historic bank-bonus log if present)
- Check ChexSystems sensitivity vs profile `credit_posture.chex_sensitive`
- Check state restrictions
- Check 5/24 if Chase Business (counts; flag against current 5/24)

### Step 3 — Rank by post-tax ROI/hour

```
post_tax_bonus = bonus × (1 − marginal_tax_rate)
roi_per_hour = post_tax_bonus / estimated_hours
```

Use marginal_tax_rate from profile income range (rough): <$50K = 12%, $50–100K = 22%, $100–200K = 24%, $200K+ = 32%. If `1099_int = false`, use full bonus (rare — most bank bonuses ARE 1099-INT-reported).

Sort descending.

### Step 4 — Output top 3 eligible bonuses

Don't list all bonuses. Top 3 max. If <3 eligible, say so honestly.

> # Eligible bank bonuses (sorted by post-tax ROI/hour)
>
> ## 🥇 Chase Total Checking — $300
>
> | Field | Value |
> |---|---|
> | Bonus | $300 |
> | Requirement | $500+ DD within 90 days |
> | DD type | Real payroll best; brokerage push (Fidelity Cash Mgmt) works |
> | Lockout | ✅ No Chase personal checking bonus since 2022-08 (>2yr ago) |
> | Pull type | Soft |
> | 1099-INT | Yes |
> | Post-tax (24% bracket) | $228 |
> | Estimated hours | 1.5 |
> | **ROI/hour** | **$152** |
> | Holding period | 6 months minimum |
>
> Action: open online at chase.com/checking. Set up Fidelity → Chase ACH push of $500 right after account opens. Hold 6mo.
>
> ## 🥈 Citi Priority — $400
> [...same table format...]
>
> ## 🥉 SoFi Checking + Savings — $325
> [...same table format...]
>
> ---
>
> **Skipped (ineligible):**
> - BoA Advantage Checking — opened 2025-09 (within 90-day lockout)
> - Wells Fargo Everyday Checking — bonus claimed 2024-12 (12mo lockout)
> - US Bank Smartly — only available in CA/AZ/NV/WA (you're in NY)

### Step 5 — Cross-flags

If user has 5+ Chase apps in last 6 months → flag Chase Business Complete:

> ⚠️ Chase Business Complete bonus is currently $500 but it's a HARD pull and counts toward your 5/24. You're at 4/24 with high Chase velocity — this would push you to 5/24 and likely trigger Chase RAT review (`shutdown-risk`). **Skip** even though ROI is high.

If user has opened 5+ checking accounts in last 12 months → ChexSystems warning:

> ⚠️ You've opened 5 checking accounts in past 12 months. Chase, BoA, Wells Fargo are Chex-sensitive — recommend skipping them this round and prioritizing SoFi / Discover / Fidelity / Schwab (Chex-tolerant) until you cool down 6+ months.

### Step 6 — Suggest a sequencing plan

If user wants to do multiple bank bonuses, suggest order:
1. Chex-sensitive ones FIRST (Chase) while ChexSystems is clean
2. Bonuses requiring prior-account-clear lockout next (Citi 6mo)
3. Easy soft-pull, no-lockout ones (SoFi, Discover) anytime
4. Holding period awareness — some require 60–180 days open before close, so don't queue too many at once

## Important reminders

- **1099-INT for ≥$10** — always note in output. Bank bonuses ARE taxable interest income, unlike credit card rewards.
- **Holding period** — note minimum days to keep open. Closing early → clawback + ChexSystems flag.
- **Real payroll DD vs brokerage push** — most banks accept brokerage push as DD in 2026, but tightening. Test small first.
- **Joint accounts and household** — if spouse also doing bank bonuses, use individual checking for each spouse's bonus (joint accounts may share bonus eligibility per issuer).

## See also

- `bank-bonus-rules` — the full eligibility and DD-type matrix
- `data/bank-bonuses.json` — current active bonuses
- `application-rules` — Chase Biz Complete is the cross-over with 5/24
- `shutdown-risk` — for bank-bonus abuse patterns
