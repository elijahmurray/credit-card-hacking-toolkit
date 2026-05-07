---
name: next-card
description: The hero command. Picks the single best next card to apply for, given the user's profile. Loads ./profile.json, computes 5/24 + family lockouts + Amex history, filters candidates from data/cards.json, pulls elevated offers, computes Y1 net at floor cpp, ranks risk-adjusted, and returns ONE opinionated recommendation with the application link. Triggered by "/credit-card-hacker:next-card", "what card should I get next?", "what should I apply for?", "best card right now?".
---

# next-card — pick one card, with conviction

This is the hero workflow. Output one recommendation, not a buffet. The user wants a decision, not options.

## Trigger phrases

- `/credit-card-hacker:next-card`
- "What card should I get next?"
- "What should I apply for?"
- "Best card right now?"
- "I want a new card"

## Hard prerequisite

`./profile.json` must exist. If missing:

> Profile not found at `./profile.json`. Run `/credit-card-hacker:getting-started` first — I need your card history, 5/24 status, and Amex card-of-record list to recommend a card. Without it, I'd be guessing.

Don't proceed. Don't recommend anything. Don't fall back to a "generic" pick.

## The 8-step flow (from CLAUDE.md)

### Step 1 — Read the profile

Load `./profile.json`. Extract:
- `cards[]` — all open + closed in last 48mo
- `amex_history[]` — full lifetime
- `gates` — pre-computed counts
- `goals` — primary goal + risk tolerance + do_not_recommend

If `last_updated` > 90 days, prepend warning:

> ⚠️ Profile last updated [N] days ago. Some gates (5/24, Amex velocity) may be stale. Refresh with `/credit-card-hacker:getting-started` if anything has changed.

### Step 2 — Compute current gates (verify)

Re-derive these from `cards[]` and compare to `gates`:
- 5/24 count = personal cards opened in last 24 months from issuers reporting to personal bureaus (per `application-rules`)
- Amex consumer + co-brand count (excluding charge cards) — for 5-card limit
- Citi: last personal app date + last business app date (8/65/95 windows)
- BoA: 30d / 12mo / 24mo counts
- Family clocks: Sapphire 48mo, Plat per-product, Marriott 24mo cross-issuer

If derived counts disagree with stored `gates`, use derived. Note the discrepancy.

### Step 3 — Load gate skills (mandatory)

Load `application-rules` skill. Load `welcome-offer-language` skill. Load `card-families` skill. Load `velocity-guardrails` skill.

If user has any Amex history → also load `pop-up-jail-amex`.

### Step 4 — Build candidate set

Start with all cards in `data/cards.json`. Drop:
- Cards user currently holds (no SUB)
- Cards blocked by Amex once-per-lifetime (check `amex_history[]`)
- Cards blocked by Sapphire 48-mo family
- Cards blocked by 5/24 (personal Chase, Amex co-brand, Citi, BoA, Wells personal etc)
- Cards blocked by issuer velocity (Citi 8/65/95, BoA 2/3/4, Cap One 1/6, Barclays 6/24)
- Cards in `goals.do_not_recommend`

For each blocked card, capture WHY (we'll mention briefly in output if relevant).

### Step 5 — Pull current SUBs

For each remaining candidate:
1. Read `current_public_sub` from `data/cards.json`
2. Check `data/elevated-offers.json` for elevated/Resy/CardMatch/NLL offer (if higher AND user is eligible per channel)
3. Use the higher of public vs elevated. Note offer source.

### Step 6 — Compute Y1 net at floor cpp

For each candidate:
```
sub_value = sub_amount × floor_cpp  (from points-valuations skill)
realistic_credits = sum(headline × expected_realized) for each credit (from credits-catalog)
af_y1 = annual_fee_waived_y1 ? 0 : annual_fee
y1_net = sub_value + realistic_credits − af_y1
```

Subtract MSR fee if user can't hit MSR organically (per `min-spend-strategies` — usually PayUSAtax 1.82%).

### Step 7 — Risk-adjust

Apply velocity penalty per `velocity-guardrails`:
- 0 cards in 60d → 1.0×
- 1 → 0.95×
- 2 → 0.85×
- 3+ → 0.5× + STOP flag

Apply popup risk for Amex if user has high Amex history (3+ closed Amex products) → 0.7× UNLESS recommendation is via Resy/NLL channel.

### Step 8 — Pick the winner

Sort by risk-adjusted Y1 net. Take the top card. Show:

1. **The recommendation** — bold, one line: "Apply for **Chase Ink Business Preferred** this week."
2. **The reasoning paragraph** — 2–4 sentences. Why this card, why now, what makes it the right call given THIS user's profile (not generic).
3. **The math table:**

| Field | Value |
|---|---|
| SUB | 90K UR |
| SUB value (1.7cpp floor) | $1,530 |
| Realistic credits (Y1) | $0 (no AF credits) |
| AF (Y1) | $95 |
| MSR | $8K / 3mo |
| MSR fee (PayUSAtax route) | $146 |
| **Y1 net** | **$1,289** |

4. **Gate check table:**

| Rule | Status |
|---|---|
| Chase 5/24 | ✅ 2/24 |
| Ink family 24mo per-product | ✅ Last Ink Cash Q2 2024 |
| Chase 1/30 | ✅ Last Chase 2026-02-14 |
| Velocity (60d) | ✅ 1 card in 60d |

5. **Application link / channel:**

> Apply at [chase.com/business/ink-preferred](https://creditcards.chase.com/business-credit-cards/ink/business-preferred). Public 90K offer. No targeted/elevated path needed.

6. **MSR plan (one-liner):** Reference `min-spend-strategies` if MSR is large.

## When the answer is "don't apply right now"

If all candidates have negative risk-adjusted Y1 OR a STOP velocity flag triggers, recommend waiting:

> 🛑 **No recommendation this cycle.** Velocity is at Chase RAT threshold (5 apps in 5 months). Best Y1-net candidate is Ink Business Cash but the velocity penalty pushes it to break-even after expected shutdown probability. **Wait 60 days.** Recheck on 2026-07-06.

## When two candidates are close

If #1 and #2 are within 10% of each other, mention #2 in one line:

> Runner-up: Amex Business Plat (175K MR via Resy) — would beat Ink if you can land the Resy offer. Set a Resy email alert; if the offer arrives in the next 14 days, switch to it.

Don't list 3+. Two max. Prefer one.

## Goals-aware tilt

Per `profile.goals.primary`:
- `transferable_points` → favor cards that earn UR/MR/TYP over cashback or co-brand
- `specific_trip` → favor cards whose transfer partners reach the trip's airline/hotel
- `cashback` → favor Inks paying cashback or Discover/Citi Custom Cash
- `bank_bonus_heavy` → consider whether a bank bonus belongs higher than any card → suggest `/credit-card-hacker:bank-bonus` instead

## Output template (full example)

> **Apply for Chase Ink Business Preferred this week.**
>
> You're 2/24, no Inks under 24mo, your last Chase app was February — the Ink Preferred slot is wide open and the 90K UR public offer is at its top. Your $5K/mo organic business spend + $5K Q3 estimated taxes (PayUSAtax route at 1.82%) hits the $8K MSR comfortably with $146 in fees. UR aligns with your "transferable points" goal and you'll likely use them via Hyatt or United transfers.
>
> | Field | Value |
> |---|---|
> | SUB | 90K UR (public) |
> | SUB value (1.7 cpp floor) | $1,530 |
> | AF (Y1) | $95 |
> | MSR | $8K / 3mo |
> | MSR fee (taxes route) | $146 |
> | **Y1 net** | **$1,289** |
>
> | Rule | Status |
> |---|---|
> | Chase 5/24 | ✅ 2/24 |
> | Ink 24mo per-product (IBP) | ✅ Never held |
> | Chase 1/30 | ✅ Last 2026-02-14 |
> | Velocity (60d) | ✅ 1 |
>
> Apply: [chase.com/business/ink-preferred](https://creditcards.chase.com/business-credit-cards/ink/business-preferred)
>
> MSR plan: $5K Q3 estimated tax via PayUSAtax (due 2026-09-15 anyway), $2.5K organic business spend, $500 vet bill (planned).
>
> Runner-up: Amex Business Plat (175K MR via Resy) — only switch if the Resy offer lands in the next 14 days.

## See also

- `getting-started` — must run first if profile missing
- `application-rules` — the gates
- `card-families` — family lockouts
- `welcome-offer-language` — wording variants
- `pop-up-jail-amex` — Amex popup mitigation
- `velocity-guardrails` — risk penalty
- `sub-sweet-spots` — current SUB rankings
- `credits-catalog` — for realistic credit values
- `points-valuations` — floor cpp
- `min-spend-strategies` — for the MSR plan one-liner
