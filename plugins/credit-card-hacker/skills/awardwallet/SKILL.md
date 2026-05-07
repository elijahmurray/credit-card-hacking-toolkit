---
name: awardwallet
description: AwardWallet integration — pulls current points balances + card list via API, syncs into profile.json. Use when user mentions AwardWallet, when profile points data is stale (>7 days), or when running portfolio-review and balances are needed. Requires AwardWallet+ paid account and API key in .env.
---

# awardwallet — auto-sync balances and card list

## What AwardWallet does

AwardWallet (awardwallet.com) tracks loyalty program balances by scraping/aggregating user accounts across airlines, hotels, credit card programs, and bank checking. The free tier shows balances; the paid tier (AwardWallet+, ~$30/yr) exposes a developer API.

## When to load

- User mentions AwardWallet by name
- `portfolio-review` workflow needs current balances
- Profile `points.awardwallet_synced` is true but `points.last_synced_at` > 7 days
- User asks "what are my points balances?" without giving them in chat

## Setup (one-time)

1. User signs up for AwardWallet+ and generates an API key at awardwallet.com/account/api.
2. User adds to `.env` (gitignored):
   ```
   AWARDWALLET_API_KEY=ak_live_...
   AWARDWALLET_USER_ID=12345
   ```
3. Run `bash scripts/refresh-balances.sh` — pulls all linked program balances and writes to `./profile.json` → `points` block.

## Sync flow (in code)

```python
# scripts/refresh-balances.py (sketch)
import os, json, requests, datetime as dt

API_KEY = os.environ["AWARDWALLET_API_KEY"]
USER_ID = os.environ["AWARDWALLET_USER_ID"]

resp = requests.get(
    f"https://business.awardwallet.com/api/export/v1/Members/{USER_ID}",
    params={"AccessKey": API_KEY},
)
data = resp.json()

# Map AwardWallet account names to profile.points keys
program_map = {
    "Chase Ultimate Rewards": "chase_ur",
    "American Express Membership Rewards": "amex_mr",
    "Citi ThankYou Points": "citi_typ",
    "Capital One Miles": "capone_miles",
    "Bilt Rewards": "bilt",
    "World of Hyatt": "hyatt",
    "United MileagePlus": "united",
    # ... etc
}

profile = json.load(open("./profile.json"))
profile.setdefault("points", {})
for account in data.get("accounts", []):
    name = account.get("displayName")
    balance = account.get("balanceRaw", 0)
    if name in program_map:
        profile["points"][program_map[name]] = int(balance)
profile["points"]["awardwallet_synced"] = True
profile["points"]["last_synced_at"] = dt.datetime.now().isoformat()
json.dump(profile, open("./profile.json", "w"), indent=2)
```

(The actual API shape may differ — check awardwallet.com/api/v1/docs. This is a sketch.)

## Card list sync

AwardWallet also tracks credit card open dates. Pull via the same API and offer the user a diff:

> AwardWallet shows 3 cards not in your profile: Hilton Aspire (opened 2024-11), Bonvoy Brilliant (2025-03), United Quest (2025-08). Add to profile?

Then update `cards[]` if user confirms. Don't auto-write — cards have nuance (notes, product changes, SUB-received status) AwardWallet doesn't track perfectly.

## What AwardWallet does NOT track well

- Open dates for closed cards (frequently missing)
- SUB-earned date (have to record manually in `getting-started`)
- Product change history (treated as a single card)
- Business cards under EIN (AwardWallet primarily personal)
- Bank checking bonuses (separate tracker)

For these, fall back to manual entry during `getting-started` or via direct `profile.json` edits.

## Privacy note

AwardWallet stores program login credentials. Discuss with user before recommending: it's an aggregator that has historically had security incidents (2014 breach disclosed). For users uncomfortable, manual entry every 90 days is fine.

## Without AwardWallet+

If user only has free AwardWallet:
- They can manually export balance summary as text from the AwardWallet web UI
- Paste it during `getting-started` Batch 6, parse out balances
- No auto-sync; they re-paste quarterly during portfolio-review

## See also

- `getting-started` — captures balances initially
- `portfolio-review` — consumes balance freshness
- `data/points-valuations.json` — converts balances to dollar values
