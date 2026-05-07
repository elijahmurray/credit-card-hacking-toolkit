---
name: shutdown-risk
description: Primary-source data points of bank shutdowns by trigger pattern (Chase RAT, Amex FR, Citi rapid-app, BoA fraud-flag, Cap One auto-decline cascade). Load when the user has crossed any velocity threshold, after any unusual approval pattern, when planning a high-volume churning month, or when the user shows you any "account closed" letter.
---

# shutdown-risk — what actually triggers bank closures

## When to load

- Velocity at or past thresholds (Chase 5/6mo, Amex 3/30d, Citi 3-in-3-weeks)
- User mentions any of: financial review request, 4506-T request, sudden credit-line decrease, "account closed" letter
- After unusual approval ("Amex approved 3 apps in a week — should I be worried?")
- Planning aggressive month (4+ apps planned)

## Where the data lives

`data/shutdown-patterns.json` — DP-based by trigger pattern with sources.

## Core thresholds (from the data)

| Trigger | Issuer | Outcome |
|---|---|---|
| 5+ apps in 6mo | Chase RAT | Closure of new + sometimes existing accounts |
| 3+ apps in 30d | Amex | Financial Review (4506-T request) → if failed, lifetime ban |
| 3+ apps in 3 weeks | Citi | Closure of new + existing Citi |
| Large BT/CA on new account | Any | Fraud flag → lock + closure |
| Visible MS pattern (gift cards + immediate redemption) | All | Targeted closure, esp. Citi/BoA |
| Bank bonus + immediate withdraw | Bank checking | Bonus clawback + ChexSystems flag |

## Output format when flagging risk

Always cite the source:

> 🛑 You're at 5/24 + 5 Chase apps in 6 months. Per FrequentMiler and r/churning DPs (cited in `data/shutdown-patterns.json`), this is the well-documented Chase RAT pattern: most users in this state get a 30-day shutdown letter. **Stop applying for any Chase product (including business) for 90 days minimum.** If you do get the RAT call, comply, don't argue, and move points OUT of UR before the shutdown processes (Chase will lock the account and points held there are lost on closure).

## Recovery DPs

- **Chase shutdown:** Generally permanent. Re-applying with a different SSN family member sometimes works after 12+ months.
- **Amex FR failure:** Permanent ban. Cannot re-establish under same SSN. Note: charge-card holders sometimes survive with reduced limits — credit-card-side is gone.
- **Citi shutdown:** 12–24 month ban; some DPs of recovery via in-branch application.
- **BoA shutdown:** Lifetime ban for fraud-flag closures; less severe for soft closures.
- **Bank bonus clawback:** Loss of bonus + ChexSystems flag for 5 years (not credit, but blocks future bank account openings at sensitive banks).

## What NOT to do during a shutdown

- Don't move points OUT in the same hour you receive the letter — Chase has been observed reversing transfers
- Don't withdraw bank-bonus money mid-clawback
- Don't open a new account at the same bank with a slight name variation — they detect

## See also

- `velocity-guardrails` — the soft thresholds before they harden into shutdown
- `application-rules` — the rules that, when broken at scale, trigger this
- `lessons-learned` — community DPs and recovery stories
