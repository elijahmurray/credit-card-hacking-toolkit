---
name: points-valuations
description: Floor cents-per-point (cpp) by program — the conservative valuation used in all Y1 net math. Chase UR 1.7, Amex MR 1.6, Citi TYP 1.5, Cap One Miles 1.5, Bilt 1.5, Hyatt 1.7, United 1.3, Hilton 0.5, Marriott 0.7, AA 1.4, Delta 1.1. **Never use TPG numbers.** Use this for any SUB/earning value calculation. (If the travel-hacking-toolkit is installed, defer to its more detailed version.)
---

# points-valuations — floor cpp, never ceiling

## Why floor, not ceiling

The Points Guy and other commercial valuations cite ceiling cpp (best-case international business class redemptions). Real users do not consistently redeem at ceiling. This toolkit uses floor cpp — what a typical user actually realizes across a year of redemptions.

## When to load

- Any SUB value calculation
- Any "is this AF worth it?" calc
- Any transfer-partner discussion
- User asks "what are my [X] points worth?"

## Cross-toolkit reference

If the user has the **travel-hacking-toolkit** installed, defer to its `points-valuations` skill — it's the burn-side toolkit and tracks more programs in detail. This file is a fallback / earn-side cheat sheet.

## Floor cpp table (this toolkit's defaults)

### Transferable currencies
| Program | Floor cpp | Notes |
|---|---|---|
| Chase Ultimate Rewards | 1.7 | Floor via Hyatt transfer for hotels; 1.25–1.5 via portal |
| Amex Membership Rewards | 1.6 | Via best transfer partner (ANA, Air Canada, Virgin Atlantic for AA flights) |
| Citi ThankYou Points | 1.5 | Strata cards make TYP transferable |
| Capital One Miles | 1.5 | Via transfer partners (Turkish for SW domestic, etc.) |
| Bilt Rewards | 1.5 | Transferable to Hyatt + airlines + Alaska |

### Airline programs (legacy / not transferable from CCs)
| Program | Floor cpp |
|---|---|
| World of Hyatt | 1.7 (the gold standard for hotel) |
| United MileagePlus | 1.3 |
| American AAdvantage | 1.4 |
| Delta SkyMiles | 1.1 |
| Alaska Mileage Plan | 1.4 |
| Air Canada Aeroplan | 1.4 |
| Southwest Rapid Rewards | 1.3 |
| British Airways Avios | 1.3 |
| Air France/KLM Flying Blue | 1.3 |
| ANA Mileage Club | 1.5 |
| Singapore KrisFlyer | 1.4 |
| Virgin Atlantic Flying Club | 1.4 |
| Turkish Miles&Smiles | 1.5 |

### Hotel programs
| Program | Floor cpp |
|---|---|
| Hyatt | 1.7 |
| Marriott Bonvoy | 0.7 |
| Hilton Honors | 0.5 |
| IHG One Rewards | 0.5 |
| Wyndham | 0.9 |
| Choice Privileges | 0.5 |

### Cashback equivalents
- Discover cashback: 1.0 (it's literally cash)
- Chase cashback (no UR card): 1.0
- Amex Reward Dollars (when held without MR card): 1.0
- Citi cashback: 1.0
- BoA cashback: 1.0 (or 1.75 with Preferred Rewards Platinum Honors multiplier on the SUB cashback only)

## How to use

For SUB value:
```
sub_value = sub_amount × floor_cpp
```

Example: CSP 75K UR SUB → 75,000 × 0.017 = $1,275.

For converting balances during portfolio review:
```
total_points_value = sum( balance_in_program × floor_cpp )
```

## When to deviate from floor

Almost never. The exceptions:

- User explicitly redeems at higher rate consistently (e.g., always Hyatt at 2.0+ cpp). Use the user's documented rate.
- User redeems at LOWER rate (e.g., always Chase portal at 1.0 cpp). Use 1.25 cpp for CSP portal, 1.5 for CSR.

Never use TPG numbers. Their valuations include ceiling redemptions most users can't replicate (ANA First Class at 7+ cpp, Lufthansa First at 6+).

## When the data file is populated

Future: `data/points-valuations.json` will include per-program tables with primary sources (FrequentMiler valuations, monthly Reddit polls). Until then, this skill body IS the data.

## See also

- `data/cards.json` — cards reference these floor cpp in their `valuation_floor_cpp` fields
- `transfer-partners` (cross-toolkit) — best transfer paths to redeem at floor
- `transfer-bonuses` (cross-toolkit) — temporary boosts that increase effective cpp
