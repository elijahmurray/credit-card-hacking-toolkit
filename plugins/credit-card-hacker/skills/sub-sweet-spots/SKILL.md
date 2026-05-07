---
name: sub-sweet-spots
description: Current best SUBs ranked legendary / excellent / good by Y1 net value at floor cpp, with MSR and caveats. Use when picking a card for SUB chasing, when comparing two SUBs head-to-head, or when the user asks "what's the best public offer right now?". Pulls from data/sub-sweet-spots.json — verify current public offer at the application page before final recommendation.
---

# sub-sweet-spots — the current SUB leaderboard

## When to load

- Step 5 of `next-card` flow — pulling current SUBs
- User asks "what's the best SUB available now?"
- Comparing two SUBs (e.g., "Personal Plat vs Business Plat for me?")
- Quarterly portfolio review

## Where the data lives

`data/sub-sweet-spots.json` — tiered (legendary / excellent / good) with:
- `card` — id matching `data/cards.json`
- `current_offer` — point/cash amount + channel (public, Resy, CardMatch)
- `msr` — required spend + window
- `y1_net_at_floor` — first-year net value at floor cpp
- `caveats` — eligibility blockers
- `confidence`

## Tier definitions (from _meta.notes)

- **legendary** — >$1500 first-year net (after AF + realistic credits)
- **excellent** — $750–$1500
- **good** — $300–$750

## How to use

1. **Filter to eligible cards.** Drop anything blocked by `application-rules`, `card-families`, `welcome-offer-language` for this user.
2. **Show the offer source.** If the legendary tier requires Resy/CardMatch/NLL, say so and link to the channel. Don't quote a 250K offer as if it's public.
3. **Note caveats.** "Once-per-lifetime" means nothing if the user has held the card before — drop or downgrade the rec.
4. **Cross-reference current public offer.** The data file is last-known-good. Tell the user to check the application page for current public.

## Reading the y1_net_at_floor

Example from data: `"y1_net_at_floor": "≈$1530 first year (90K x 1.7cpp) - $95 AF"`

This tells you:
- Pre-credit math
- Floor cpp used (1.7 for UR — never quote TPG's 2.05)
- AF subtracted
- Does NOT include realized credits — add those from `credits-catalog` for cards that have credits

Standard formula:
```
Y1 net = (SUB_amount × floor_cpp) + sum(credits realized × expected_realized) − AF_y1
```

## Historical context

`historical_legendary_now_devalued` lists cards that USED to be legendary but aren't anymore. Use this when a user says "I remember Plat was 150K MR, what's it now?" — give them context that the bar moved.

## When the data is stale

Check `_meta.last_updated`. SUBs change weekly. If staleness >14 days, prepend output:

> ⚠️ SUB data was last refreshed N days ago — verify the current public offer at the application page before submitting.

## See also

- `data/cards.json` — full card details
- `data/elevated-offers.json` — Resy / CardMatch / NLL channel offers (when populated)
- `points-valuations` — floor cpp by program (cross-toolkit)
- `credits-catalog` — for adding realized credit value to Y1 net
