---
name: portfolio-review
description: Quarterly audit of the user's full card portfolio — AFs coming due, missed credits, expiring SUBs, retention windows opening, family clocks rolling off, stale points balances, missed quarterly category activations. Triggered by "/credit-card-hacker:portfolio-review", "audit my cards", "portfolio review", "what should I be doing this quarter?".
---

# portfolio-review — quarterly audit

## When to invoke

- `/credit-card-hacker:portfolio-review`
- "Audit my cards" / "portfolio review"
- "What should I be doing this quarter?"
- Roughly every 90 days (suggest setting a recurring reminder)

## Hard prerequisite

`./profile.json` must exist. If missing, route to `/credit-card-hacker:getting-started`.

## What to compute

### 1. AFs posting in the next 90 days

For each card with `annual_fee > 0`:
- Anniversary date = `open_date` + N years
- AF posts on the statement closing AT or AFTER that anniversary
- If anniversary in next 90 days → flag for `cancel-decision` review

### 2. Cards still in clawback window

For each card opened in last 12 months:
- DO NOT recommend closing (SUB clawback)
- Even if Y1 net is barely positive, flag "wait until month 13"

### 3. Family clocks rolling off

For each `gates.*_last_sub_date`:
- If date + 48mo (Sapphire, Citi 48mo cards) is within next 90 days → flag as "Sapphire SUB eligibility unlocks soon"
- If date + 24mo (Marriott cross-issuer, Chase Ink per-product, Barclays) is within next 90 days → flag

### 4. Expiring SUB MSR windows

For any card opened in last 6 months whose MSR isn't yet hit:
- Compute days remaining in MSR window (open_date + msr_months)
- Flag if <30 days remaining and MSR not hit

### 5. Quarterly category activations

If user holds Freedom Flex, Discover IT, or Customized Cash:
- Flag whether the new quarter's category was activated
- Reference `category-rotators` for current quarter's categories

### 6. Stale points balances

If `profile.points.last_synced_at` > 90 days OR `awardwallet_synced` is false:
- Suggest re-running balance sync (via `awardwallet` skill if AwardWallet+ configured, else manual entry)

### 7. Missed credits (Y-T-D)

For each card with credits in `data/credits-catalog.json`:
- Note credits that reset Jan 1 (annual) or Jul 1 (semi-annual)
- For semi-annual: if first half not used and we're past June 30, that $50 is gone forever
- Suggest specific spend before year-end if H2 credits about to expire

### 8. Bank bonuses available

Pull eligible bank bonuses from `data/bank-bonuses.json` filtered against profile lockouts. List top 3 by ROI/hour.

## Output format

Use sections + tables. Lead with most-urgent (AFs in next 30 days, expiring MSRs).

> # Portfolio review — 2026 Q2
>
> **As of 2026-05-06.**
>
> ## 🔴 Urgent (next 30 days)
>
> | Item | Card | Action by | Why |
> |---|---|---|---|
> | AF posting | Amex Personal Plat | 2026-05-20 | Decide keep / downgrade / retention call before posting |
> | MSR closing | Ink Cash | 2026-05-30 | $1,200 left of $4K MSR — 24 days remaining |
> | H2 credit not used | Amex Plat Saks $50 | 2026-06-30 | Use it or lose it |
>
> ## 🟡 This quarter (next 90 days)
>
> | Item | Card | Action by | Why |
> |---|---|---|---|
> | AF posting | CSR | 2026-08-15 | $795 — run `cancel-decision` |
> | Sapphire 48mo unlocks | n/a | 2026-09-15 | Last Sapphire SUB 2022-09-15 — eligible for new Sapphire after that |
> | Q3 category | Freedom Flex | 2026-07-01 | Activate the new quarter's category |
>
> ## 🟢 Opportunities
>
> | Item | Detail | Y1 net |
> |---|---|---|
> | New SUB available | Ink Business Preferred — 2/24, never held IBP | $1,289 |
> | Bank bonus | Chase Total Checking $300 — eligible (last bonus 2022) | $204 net of tax |
>
> ## 🔵 Housekeeping
>
> - Points balances last synced 127 days ago — re-run `awardwallet` sync or manual update
> - Hilton Aspire H2 resort credit ($200) — use by 2026-12-31
>
> ## Recommended next actions
>
> 1. **Today:** Use Saks $50 + Plat retention call planning
> 2. **By 2026-05-20:** Decide on Plat AF (run `/credit-card-hacker:cancel-decision plat`)
> 3. **By 2026-05-30:** Finish Ink Cash MSR via PayUSAtax $1,200 estimated tax
> 4. **In June:** Apply for Ink Business Preferred (run `/credit-card-hacker:next-card` to confirm)

## Don't do these in portfolio-review

- Don't recommend brand-new applications here (route to `/credit-card-hacker:next-card`)
- Don't make AF decisions here (route to `/credit-card-hacker:cancel-decision`)
- Don't run MSR plans here (route to `/credit-card-hacker:min-spend`)

This skill is the AUDIT. The other workflows are the EXECUTION. Surface, don't decide.

## See also

- `cancel-decision` — for AFs coming due
- `min-spend` — for expiring MSRs
- `next-card` — for new applications
- `bank-bonus` — for active bank bonus opportunities
- `credits-catalog` — for credit reset dates
- `awardwallet` — for balance refresh
- `category-rotators` — for quarterly activation reminders
