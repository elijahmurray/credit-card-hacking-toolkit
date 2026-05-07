---
name: min-spend
description: Builds a concrete plan to hit a card's MSR using public, organic, low-risk spend — Bilt rent, taxes via PayUSAtax, planned large purchases, partner spend. Computes effective MSR fee and net SUB after fees. Triggered by "/credit-card-hacker:min-spend [card]", "how do I hit MSR on [card]?", "I have a $4K MSR, what do I do?".
---

# min-spend — concrete MSR plan with the math

## Trigger phrases

- `/credit-card-hacker:min-spend [card-id or name]`
- "How do I hit the [$X] MSR on [card]?"
- "I have a $4K/3mo MSR, what do I do?"
- "I'm short $1,200 on my MSR with 30 days left"

## Inputs needed

From `./profile.json`:
- `earning.monthly_cc_spend`
- `earning.organic_categories`
- `earning.rent` block
- `earning.estimated_taxes` block
- `earning.planned_large_spend[]`
- `goals.risk_tolerance`

From the card (in `data/cards.json`):
- `current_public_sub.msr` — required spend
- `current_public_sub.msr_months` — window
- `open_date` (from profile if existing card) — to calc days remaining

If user just opened the card, ask once for the open date if not in profile.

## The plan-building algorithm

### Step 1 — Compute remaining MSR

If card not in profile yet (just opened, MSR window starts now):
```
remaining_msr = full MSR
remaining_days = msr_months × 30
```

If card in profile with partial spend:
```
remaining_msr = MSR − amount_spent_so_far  (ask user if not tracked)
remaining_days = (open_date + msr_months × 30) − today
```

### Step 2 — Map organic spend to remaining window

```
organic_estimate = monthly_cc_spend × (remaining_days / 30) × (organic_can_route_to_this_card_fraction)
```

`organic_can_route_to_this_card_fraction` is typically 0.7–0.9 (some spend is locked to other cards: Amex-only places, Costco cards, etc.).

### Step 3 — Identify the gap

```
gap = remaining_msr − organic_estimate
```

If `gap <= 0`: organic spend covers it. Output a one-liner:

> Your normal $5K/mo organic spend covers the $4K/3mo MSR with margin. Just route everything to the new card. No special action needed.

If `gap > 0`: build a fill plan.

### Step 4 — Fill plan (in order from `min-spend-strategies`)

For each gap-fill source, compute fee + recommend amount:

1. **Bilt rent** — if user uses Bilt, rent ALREADY counts on Bilt; doesn't fill MSR for OTHER cards. SKIP (just note it).

2. **Federal estimated taxes via PayUSAtax** — fee 1.82%
   - If `estimated_taxes.owes_quarterly` is true → use this. Recommend amount = min(gap, annual_amount/4)
   - If user owes year-end taxes (April for prior year) → similar
   - If user doesn't owe → can OVERPAY (refund in 4–8 weeks). Only recommend if user has cash flow.

3. **Tuition** — if user listed tuition in `planned_large_spend`. Bursar fee usually 2.5%.

4. **Planned large spend** — wedding, HVAC, vet bills, etc. Free fee if just routed to new card.

5. **Partner organic spend** — if `household.player_count >= 2`, route partner's spend through this card (add as AU or just use the card directly).

6. **Plastiq** — pay any bill at 2.85% fee. Last resort.

7. **MS** — only if user explicitly asks. Default: do not include in plan.

### Step 5 — Output

Build a table:

> **MSR plan: Chase Ink Business Preferred — $8K / 3 months, deadline 2026-08-15 (101 days remaining)**
>
> Your monthly CC spend is $4,500. Of that, ~$3,000/mo (67%) can route to this card (excluding rent on Bilt + Costco card spend).
>
> Over 3 months: organic estimate = $9,000. Wait — you're already overshooting MSR with organic. Just route everything to Ink. **No fill needed.**
>
> ---
>
> If your organic estimate is closer to $5,000 over 3 months:
>
> | Source | Amount | Fee | Notes |
> |---|---|---|---|
> | Organic (3mo estimate) | $5,000 | $0 | Existing spend, just route here |
> | Federal Q3 estimated tax (PayUSAtax) | $2,500 | $46 | Due 2026-09-15 anyway |
> | Vet bill (planned 2026-07) | $500 | $0 | Already in profile |
> | **Total** | **$8,000** | **$46** | |
>
> Net SUB after fees = $1,530 − $46 = **$1,484**. Effective MSR cost = 0.6%.

### Step 6 — Pacing

If MSR is "$4K in 3 months" and user has 60 days left + already spent $1,500:
- Remaining $2,500 / 60 days = $42/day required
- Compare to user's $150/day organic → fine
- If pace is behind, suggest pulling forward planned spend OR adding a tax payment NOW

### Step 7 — Risk warnings

- If plan includes Plastiq + brand-new card: flag fraud-flag risk, recommend small test transaction first
- If plan would push user over $20K spend in a single month on a brand-new account: flag financial-review risk per `velocity-guardrails`
- If user is at high Amex velocity AND card is Amex: cross-reference `pop-up-jail-amex` (popup is pre-approval, but FR is post-approval risk)

## When plan is impossible

If gap > 50% of remaining MSR and user has no taxes/tuition/planned spend AND won't do MS:

> ⚠️ Honest answer: your organic spend of ~$3K covers about 38% of the $8K MSR. With no estimated taxes, no tuition, no planned large spend, and no MS comfort — you're going to miss the SUB. Options:
> 1. Don't apply for high-MSR cards in your profile. Switch the recommendation to Ink Cash ($6K MSR) or Ink Unlimited ($6K MSR).
> 2. Wait for a planned large purchase (you mentioned a possible HVAC replacement) before applying.
> 3. Reconsider tax overpayment if cash flow allows.

## See also

- `min-spend-strategies` — the full landscape of paths
- `manufactured-spend-101` — read-only, only if user explicitly asks
- `data/cards.json` — for MSR amounts per card
- `getting-started` — to capture the organic spend / planned spend if missing
