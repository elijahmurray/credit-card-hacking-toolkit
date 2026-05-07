---
name: bank-bonus-rules
description: Bank bonus eligibility and execution rules — DD requirements (real payroll vs ACH push vs Zelle), ChexSystems sensitivity, prior-bonus lockouts (Chase 2yr, Citi 6mo, BoA 90d), 1099-INT for ≥$10, holding periods, early-close fees. Use when user mentions any bank/brokerage bonus or in the bank-bonus user-invoked workflow.
---

# bank-bonus-rules — eligibility + execution

## When to load

- User asks "is the [Bank] $X bonus worth it?"
- `bank-bonus` user-invoked workflow
- User about to enroll in a new bank account
- After running portfolio-review (bank bonuses surface as opportunities)

## Where the data lives

`data/bank-bonuses.json` — per-bonus with bank, product, bonus, MSR/DD, lockout, credit pull, 1099-INT flag, estimated hours, ROI/hour, confidence.

## DD (Direct Deposit) — what counts

This is the most-misunderstood part of bank bonuses. Banks define "direct deposit" differently:

| Bank | Real payroll DD | ACH push from another bank | Zelle | Plaid-routed (Chime, etc) |
|---|---|---|---|---|
| **Chase** | ✅ | Sometimes (was working 2024, tightening 2025) | ❌ | Sometimes |
| **Citi** | ✅ | ✅ (most reliable) | ❌ | ✅ |
| **BoA** | ✅ | Sometimes | ❌ | Sometimes |
| **Wells Fargo** | ✅ | ❌ (must be coded as DD) | ❌ | ❌ |
| **US Bank** | ✅ | Sometimes | ❌ | Sometimes |
| **SoFi** | ✅ (SoFi defines DD as "any ACH credit") | ✅ | ✅ | ✅ |
| **Discover** | ✅ | ✅ | ✅ | ✅ |
| **Capital One 360** | ✅ | ✅ | ❌ | Sometimes |
| **Fidelity Cash Mgmt** | ✅ | Counts ACH credits as DD | ✅ | ✅ |
| **Schwab** | ✅ | ✅ | ✅ | ✅ |

**The trick:** "ACH push" means initiating an ACH transfer FROM another bank TO the bonus bank. Most banks let you push money out for free. Whether the receiving bank counts it as DD depends on whether it's coded with a "PAYROLL" or "DIR DEP" hint vs just "TRANSFER."

**Brokerage push trick:** Pushing from Fidelity / Schwab / Vanguard brokerage cash often gets coded as DD even at picky banks. Use this when payroll DD isn't possible.

**Zelle:** Most major banks have explicitly excluded Zelle as DD as of 2024–2025. Don't try.

## Prior-bonus lockouts (memorize)

| Bank | Lockout |
|---|---|
| **Chase Personal Checking** | 2 years from last bonus + no Chase personal checking open within 90 days |
| **Chase Business Complete** | 2 years from last bonus |
| **Citi Personal Checking** | 6 months from account close (or never had one) |
| **BoA** | 90 days from account close (varies by product) |
| **Wells Fargo** | 12 months from last bonus |
| **US Bank** | 6 months |
| **SoFi** | One-time-only per SSN |
| **Discover Checking** | One-time-only per SSN |

If the user violates these, the bonus does not pay (or claws back).

## ChexSystems

ChexSystems is the bank version of ChexSystems is to credit reports for bank deposits. Banks pull ChexSystems on new account opening to check for prior fraud / closed-with-balance accounts. If you've opened many bank accounts in the last 12 months (10+), some banks (Chase especially) auto-deny.

- **Chex-sensitive banks:** Chase, BoA, Wells Fargo, US Bank
- **Chex-tolerant:** SoFi, Discover, Fidelity, Schwab, Cap One 360, Citi (mostly)

If user has 5+ bank accounts opened in last 12 months, recommend Chex-tolerant banks first to keep options open at sensitive ones.

## 1099-INT (the tax flag)

Any bank bonus ≥$10 must be reported on a 1099-INT to the IRS. This is taxable interest income at your marginal rate.

**Implications:**
- $300 Chase bonus at 32% marginal = $204 net after tax. Still profitable but don't quote $300 as net.
- Bank bonuses are NOT eligible for credit-card rewards exclusion (rewards from credit cards are NOT taxable; bank bonuses ARE)
- If user is in low tax bracket (<22%), bank bonuses are more attractive
- Multi-bank-bonus run can push user into estimated tax requirements (if total interest >$1K projected)

Always flag 1099-INT in your output for any bonus ≥$10.

## Holding periods

Most bank bonuses require:
- Maintain account open for X days (60–180 typical) after bonus posts
- Don't withdraw bonus money for X days

Withdrawing early or closing early can trigger clawback PLUS ChexSystems flag for "abuse."

## Hard pull vs soft pull

| Bank | Pull type |
|---|---|
| Chase personal checking | Soft most cases |
| Chase Business Complete | **HARD pull, counts toward 5/24** |
| Citi personal | Soft |
| BoA personal | Soft most cases |
| Wells Fargo | Soft mostly |

Chase Business Complete being a hard pull + counting toward 5/24 is the most-missed gotcha. A bank bonus shouldn't burn a 5/24 slot — but Chase Biz Complete does.

## Output template for a bank bonus rec

> **Bank bonus: Chase Total Checking — $300 bonus**
>
> | Field | Value |
> |---|---|
> | Bonus | $300 |
> | Requirement | $500+ DD within 90 days |
> | DD type accepted | Real payroll best; brokerage push works in most DPs |
> | Prior lockout | 2 years from last Chase personal checking bonus + no open Chase personal checking in past 90 days |
> | Pull type | Soft |
> | 1099-INT | Yes ($300 reported) |
> | Net after tax (32% bracket) | $204 |
> | Holding period | 6 months minimum |
> | Estimated time | 1.5 hours |
> | ROI/hour (post-tax) | ~$135/hr |
>
> ✅ Eligible per profile (no Chase checking bonus since 2022). 🟢 Recommend.
> Open online, set up brokerage push from Fidelity Cash Mgmt as DD, hold 6mo+, then close.

## See also

- `data/bank-bonuses.json` — current active bonuses
- `application-rules` — Chase Biz Complete is the cross-over point with 5/24
- `shutdown-risk` — bank bonus abuse patterns
