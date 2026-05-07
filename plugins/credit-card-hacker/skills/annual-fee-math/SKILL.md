---
name: annual-fee-math
description: Break-even framework for "is this AF worth it?" — realized credits + earning premium vs no-AF version + lounge/status/portal value − AF + retention-offer EV. Use whenever the user asks about a card's AF, when the AF is about to post, or in any cancel-decision workflow.
---

# annual-fee-math — should I keep paying this AF?

## When to load

- AF posts in <60 days
- User asks "is the [card] AF still worth it?"
- `cancel-decision` workflow
- Quarterly portfolio review

## The break-even formula

```
keep_value = realized_credits + earning_premium + perks_value + retention_offer_EV − AF
```

Where:
- **realized_credits** = sum( credit headline × expected_realized ) from `credits-catalog`
- **earning_premium** = (annual_spend_in_card_categories × bonus_rate) − (same spend × no_AF_alternative_rate)
- **perks_value** = lounge access value, status grants, portal multipliers, travel insurance
- **retention_offer_EV** = expected value of typical retention offer for this card (from `retention-offers`)
- **AF** = current annual fee (post-renewal AF, not Y1 waived)

If `keep_value > 0`: keep. If close to zero: try retention. If negative even with retention: downgrade or cancel.

## Worked example: Sapphire Reserve renewal at $795 AF

User spends $20K/year in dining + travel categories. Held CSR for 18 months (no longer in clawback window).

- Realized credits (from `credits-catalog`):
  - Travel $300 × 0.95 = $285
  - DoorDash $120 × 0.4 = $48
  - Lyft $120 × 0.7 = $84
  - Apple $250 × 0.6 = $150
  - OpenTable dining $300 × 0.25 = $75
  - **Subtotal: $642**
- Earning premium vs CSP ($95 AF, 3x dining/travel via portal vs CSR's 8x portal):
  - Travel via portal: $5K × (8x − 5x) × 1.7cpp = $255 premium
  - Dining: $8K × (3x − 3x) × 1.7cpp = $0
  - Other travel: $5K × (3x − 2x) × 1.7cpp = $85 premium
  - **Subtotal: $340**
- Perks: Priority Pass Select ($429 retail, but free P+ from Plat possible) — call it $200 if user uses it 4+ times/year
- Retention offer EV: 50% chance of $200 statement credit OR 60K UR = $100 expected
- **Total keep_value = $642 + $340 + $200 + $100 − $795 = $487 net positive**

Verdict: Keep. Try retention (call after AF posts).

## Same example, low-utilization user

User spends $5K/year, doesn't use OpenTable, doesn't have Apple subscription, doesn't fly enough to use Priority Pass.

- Realized credits: $285 (just travel) + $84 Lyft = $369
- Earning premium: $5K × (3x − 2x) × 1.7cpp = $85
- Perks: Priority Pass ≈ $0 if not flown
- Retention EV: $100
- **Total keep_value = $369 + $85 + $0 + $100 − $795 = −$241**

Verdict: Cancel or downgrade to CSP/Freedom.

## The clawback rule (most-missed)

If the card is <12 months old, **do not close** even if keep_value < 0. Most issuers (Amex specifically) claw back the SUB if the card is closed within 12 months. Wait until month 13.

CLAUDE.md "When someone asks should I keep [card]?" point 3:
> Check the 1-year SUB clawback rule. If card is <12 months old, recommend keeping until month 13.

## When earning_premium is small

If you have a no-AF card that earns 2% on the same category, the earning premium of an AF card needs to overcome the AF + opportunity cost. Use Capital One Venture (1.5x base = 1.5cpp on Cap One miles = ~2.25% via transfer) as the reference rate when comparing earner cards.

## Output format

Always show the breakdown:

| Component | Value |
|---|---|
| Realized credits | $642 |
| Earning premium | $340 |
| Perks (Priority Pass) | $200 |
| Retention offer EV | $100 |
| **Total benefit** | **$1,282** |
| AF | −$795 |
| **Net keep value** | **$487** |

**Verdict: Keep + try retention.**

## See also

- `credits-catalog` — for realized credit values
- `retention-offers` — for retention EV by card
- `product-changes` — for downgrade alternatives
- `cancel-decision` — the workflow that uses this
