---
name: credits-catalog
description: Per-card credit catalog with friction rating + realistic realization fraction (not headline value). Use when computing Y1 net value for any premium card, when running cancel-decision break-even, or when the user asks "is this AF worth it?". Pulls from data/credits-catalog.json.
---

# credits-catalog — what credits are actually worth

## The headline-value trap

Card marketing lists $1500+ in "credits" on Plat / CSR / Aspire. Most users realize 30–60% of headline. This skill provides the realistic fraction so you don't recommend a card based on imaginary value.

## When to load

- Computing Y1 net for any card with `credits` field in `data/cards.json`
- `cancel-decision` workflow — break-even check
- User asks "is the AF worth it on [card]?"
- Comparing two cards where one has more credits

## Where the data lives

`data/credits-catalog.json` — array of credits with:
- `card_id` — match to `data/cards.json`
- `name` — credit name
- `headline` — marketing dollar value
- `friction` — `low` / `medium` / `high` / `very_high`
- `expected_realized` — fraction 0.0–1.0 of headline (default expectation for a typical user)
- `notes` — context about why friction is what it is

## How to compute realistic credit value

```
realistic_credits = sum( headline × expected_realized ) for each credit on the card
```

**Always show your work:**

> CSR credits realistic value = $300 travel × 0.95 + $120 DoorDash × 0.4 + $120 Lyft × 0.7 + $250 Apple × 0.6 + $300 OpenTable × 0.25 = $285 + $48 + $84 + $150 + $75 = **$642 realized vs $1,090 headline**.

## User-specific overrides

If `./profile.json` has `credit_realization_overrides` (planned future field), use those. Example:
```json
"credit_realization_overrides": {
  "amex_platinum_personal.Equinox": 1.0,
  "chase_sapphire_reserve.Sapphire Reserve dining (OpenTable Premier)": 0.8
}
```

A user who lives in NYC and uses OpenTable weekly has a different realization for the Sapphire dining credit than a user in Boise. Honor the override when present.

## Specific guidance per common credit

- **Amex Platinum Equinox $300**: default 0.05. Override to 1.0 ONLY if user already pays for Equinox.
- **Amex Platinum airline incidental $200**: default 0.3. Don't promise gift card hacks — Amex enforced.
- **CSR OpenTable dining $300**: default 0.25. Override to 0.7 if user is in SF/NYC/LA.
- **Global Entry $120**: divide by 4 (renews every 4 years). Default headline already divided in data file ($30/yr equivalent). Don't double-count if user has multiple cards offering it.
- **Saks $100**: default 0.6. Many users forget the second-half $50.

## Output format

When listing credits in a recommendation:

| Credit | Headline | Friction | Realistic |
|---|---|---|---|
| Annual travel | $300 | low | $285 |
| DoorDash | $120 | medium | $48 |
| Lyft | $120 | low | $84 |
| Apple | $250 | low | $150 |
| OpenTable dining | $300 | high | $75 |
| **Total** | **$1,090** | | **$642** |

## See also

- `data/cards.json` — credit listings per card
- `annual-fee-math` — break-even framework that uses these realistic values
- `cancel-decision` — the workflow that consumes this skill
