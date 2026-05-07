---
name: getting-started
description: First-run profile builder. Walks the user through a Q&A flow to construct ./profile.json with their card history, 5/24 status, Amex card-of-record list, family lockouts, organic spend, household/P2 status, points balances, and goals. Use when profile.json is missing, when the user says "set me up" or "build my profile", or when downstream skills (next-card, portfolio-review, cancel-decision) report a missing profile. THIS SKILL IS THE ONE EXCEPTION TO THE PRE-OUTPUT GATE — sequential clarifying questions are required and expected here.
---

# getting-started — build the user's churning profile

This is the **only** skill in the toolkit allowed to ask sequential clarifying questions. Every other skill must run on the data in `./profile.json`. So get the profile right.

## When to invoke

- `./profile.json` does not exist
- User says "set me up", "build my profile", "I'm new", "let's start over"
- Another skill returned "profile missing — run /credit-card-hacker:getting-started"
- User wants to do a major refresh (annual review, after a big life change like marriage / move to new state / new job with different income)

## The path on disk

- Default: `./profile.json` at the repo root (the toolkit is self-contained — no files outside the repo).
- Override via env var `$CARD_HACKER_PROFILE_PATH` if the user wants it elsewhere.
- File mode should be `600` (user-only readable). `chmod 600 ./profile.json` after write.
- **Never commit this file.** It contains card open dates, household income range, points balances. Already in `.gitignore`.

## How to run the Q&A flow

Ask questions in **batches of 3–5 related items**, not one-at-a-time. Each batch should fit on one screen. Wait for the user's response, then move on. Don't re-ask things they already answered. Don't lecture.

If the user says "I don't know" or "skip", record `null` and move on. The profile is iteratively improvable — `/credit-card-hacker:portfolio-review` can fill gaps later.

### Batch 1 — household basics

```
1. Are you churning solo, or with a Player 2 (spouse/partner who also applies)?
2. What state do you live in? (matters for some bank bonuses + state-restricted offers)
3. Rough household income range? (used only to filter cards that auto-decline below thresholds — never written to public output)
   - <$50K / $50–100K / $100–200K / $200K+
4. Do you own a small business, even a sole prop side hustle (eBay, freelance, Etsy)? (qualifies you for business cards using your SSN/EIN)
```

### Batch 2 — credit posture

```
5. Approximate FICO score? (740+ / 700–740 / 660–700 / <660)
6. How sensitive are you to hard inquiries? (going for a mortgage in <12mo? car loan?)
7. Have you ever been shut down by a bank, or had a financial review? (Chase RAT, Amex FR, Citi rapid-app shutdown, etc.)
8. ChexSystems status — opened many bank accounts in last 12 months? (matters for bank bonuses)
```

### Batch 3 — current card portfolio

This is the most important batch. Ask:

> List every credit card you currently hold OR have closed in the past 48 months. For each, I need: issuer, card name, open date (month + year is fine), and whether it's still open. If you used AwardWallet or have an app like CardPointers, paste the export.

Help the user. If they say "all my Chase cards", offer to enumerate from `data/cards.json` (Chase issuers list) and ask them to confirm. If they say "I don't remember the open date", suggest checking the card itself (most have "MEMBER SINCE" on the front), or pulling Credit Karma.

For each card collect into `cards[]`:
- `card_id` — match to `data/cards.json` `id` field where possible
- `issuer` — Chase / Amex / Citi / BoA / Cap One / etc.
- `name` — human name ("Sapphire Preferred", "Gold Card")
- `type` — personal / business
- `open_date` — `YYYY-MM` (day optional)
- `status` — `open` / `closed` / `product_changed`
- `closed_date` — if closed
- `product_changed_to` — if PC'd
- `received_sub` — boolean (default true if open + past MSR window)
- `current_credit_limit` — optional, helps with utilization math
- `notes` — anything weird (e.g., "Plat opened via Resy NLL", "CSR product-changed from CSP in 2024")

### Batch 4 — gates derived from cards

After Batch 3, **compute and confirm**:

- **5/24 count** — count personal cards opened in the last 24 months from any issuer that reports to personal bureaus. Show the user the count and the list. Ask: "Does this match what you expected?"
- **Amex card-of-record list** — list every Amex card the user has EVER had (including closed). The once-per-lifetime clock for SUBs is per-product-per-lifetime. Save as `amex_history[]` with `card_name`, `received_sub_date`, `closed_date`.
- **Family-lockout flags**:
  - `chase_sapphire_last_sub_date` (48-mo clock)
  - `amex_plat_personal_received_sub` (boolean + date)
  - `amex_gold_personal_received_sub` (boolean + date)
  - `marriott_bonvoy_last_sub_date` (24-mo cross-issuer clock)
  - `hilton_last_sub_date`
- **Velocity flags**:
  - `chase_apps_last_6_months`
  - `amex_apps_last_30_days`
  - `boa_apps_last_30_days` / `_12_months` / `_24_months`
  - `citi_last_personal_app_date` / `last_business_app_date`

### Batch 5 — earning side

```
9. Roughly how much do you charge to credit cards per month? (use this to size MSR plans)
10. What are your top 5 organic spend categories?
    (rent, groceries, dining, gas, utilities, travel, healthcare, kids/childcare,
     business expenses, charity, taxes-DIY, insurance, online shopping)
11. Do you pay rent? If yes, how much, and do you currently use Bilt?
12. Do you owe estimated quarterly taxes you could route through PayUSAtax/ACI?
13. Any large planned spend in the next 12 months? (wedding, new HVAC, tuition payment)
```

### Batch 6 — points balances & loyalty

```
14. Current points balances — Chase UR, Amex MR, Citi TYP, Cap One Miles,
    Bilt, plus any specific airline/hotel programs (Hyatt, United, Hilton, Marriott, AA, Delta).
    "AwardWallet sync" if connected. Approximate is fine.
15. Status held: airline elite, hotel elite, lounge memberships?
16. Most-used airlines (home airport + 2–3 destinations)?
17. Booking style: cash + portal, transfer to partners, or mostly hotels?
```

### Batch 7 — goals & risk tolerance

```
18. Primary goal next 12 months?
    a) Maximize transferable points balance
    b) Specific big trip (state which one + when)
    c) Maximize cashback (for bills, no travel goal)
    d) Bank-bonus heavy churning (cash now, less travel)
19. Risk tolerance: conservative (no shutdowns ever) / moderate (accept some velocity) / aggressive (Resy/NLL hunting, manufactured spend OK)
20. Are you OK with business-card applications, or strict personal-only?
21. Anything you do NOT want to be recommended? (issuer you've sworn off, etc.)
```

## Profile schema (write this exact shape)

```json
{
  "schema_version": 1,
  "last_updated": "2026-05-06",
  "household": {
    "player_count": 1,
    "p2_present": false,
    "state": "CA",
    "income_range": "100-200k",
    "owns_business_or_sole_prop": true
  },
  "credit_posture": {
    "fico_band": "740+",
    "mortgage_in_12_months": false,
    "prior_shutdown": false,
    "chex_sensitive": false
  },
  "cards": [
    {
      "card_id": "chase_sapphire_reserve",
      "issuer": "Chase",
      "name": "Sapphire Reserve",
      "type": "personal",
      "open_date": "2023-08",
      "status": "open",
      "received_sub": true,
      "current_credit_limit": 30000,
      "notes": "Product-changed from CSP in 2024."
    }
  ],
  "amex_history": [
    {
      "card_name": "Personal Platinum",
      "received_sub_date": "2021-03",
      "closed_date": "2023-04"
    }
  ],
  "gates": {
    "five_24_count": 2,
    "five_24_list": ["chase_ink_cash 2025-02", "amex_gold 2024-11"],
    "chase_sapphire_last_sub_date": "2020-09",
    "amex_plat_personal_received_sub": true,
    "amex_plat_personal_received_sub_date": "2021-03",
    "amex_gold_personal_received_sub": false,
    "marriott_bonvoy_last_sub_date": null,
    "hilton_last_sub_date": null,
    "chase_apps_last_6_months": 1,
    "amex_apps_last_30_days": 0,
    "boa_apps_last_12_months": 0,
    "citi_last_personal_app_date": null
  },
  "earning": {
    "monthly_cc_spend": 4500,
    "organic_categories": ["dining", "groceries", "gas", "utilities", "travel"],
    "rent": { "pays_rent": true, "monthly_amount": 2800, "uses_bilt": true },
    "estimated_taxes": { "owes_quarterly": false, "annual_amount": null },
    "planned_large_spend": []
  },
  "points": {
    "chase_ur": 145000,
    "amex_mr": 80000,
    "citi_typ": 0,
    "capone_miles": 0,
    "bilt": 12000,
    "hyatt": 30000,
    "united": 50000,
    "hilton": 0,
    "marriott": 0,
    "aa": 0,
    "delta": 0,
    "awardwallet_synced": false
  },
  "loyalty": {
    "airline_status": [],
    "hotel_status": [{ "program": "Hyatt", "tier": "Explorist" }],
    "lounge_memberships": ["Priority Pass via CSR"],
    "home_airport": "SFO",
    "frequent_destinations": ["NYC", "LON"]
  },
  "goals": {
    "primary": "transferable_points",
    "specific_trip": null,
    "risk_tolerance": "moderate",
    "ok_with_business_cards": true,
    "do_not_recommend": []
  }
}
```

## After writing

1. Echo back the profile in a compact summary table (cards, 5/24 count, balances, gates).
2. Tell the user what to run next:
   - "What card should I get next?" → triggers `next-card`
   - "Should I keep my [card]?" → triggers `cancel-decision`
   - Quarterly: `/credit-card-hacker:portfolio-review`
3. Remind them: profile lives at `./profile.json` (or `$CARD_HACKER_PROFILE_PATH`). If they edit it manually, keep the schema shape. Bump `last_updated`.

## Edge cases

- **User pastes AwardWallet export** — parse directly. The card list is the most valuable part. AwardWallet does NOT track open dates reliably for closed cards — confirm those manually.
- **User says "I have like 30 cards"** — fine. Take them in batches by issuer ("OK list all your Chase cards first, then Amex, then Citi…").
- **User refuses to share income** — accept `null`. We only use it to filter cards with hard income floors (e.g., older Chase income-required apps). Most modern cards work without it.
- **User is new to churning, has 1–2 cards** — short profile. Skip Batches 4 (gates trivial) and just record the cards. Then route to `next-card` immediately.
- **Existing profile + user wants to add 1 card** — don't re-run the whole flow. Read existing file, append to `cards[]`, recompute `gates`, write back, bump `last_updated`. Diff-style update.

## Validation before write

- All `card_id`s referenced should exist in `data/cards.json` OR be marked `card_id: null` with a `name` field. (Custom cards are OK; just flag.)
- `open_date` format `YYYY-MM` (or `YYYY-MM-DD`).
- `gates.five_24_count` must equal length of `gates.five_24_list`.
- `amex_history[]` must include closed cards too (lifetime clock).
- After write, run `python3 -c "import json; json.load(open('PATH'))"` to confirm valid JSON.
