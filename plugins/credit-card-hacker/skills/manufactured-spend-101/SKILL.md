---
name: manufactured-spend-101
description: Read-only landscape of manufactured spend — Visa GC chains via grocery/drug/office stores, money orders at Walmart/grocery, Plastiq, peer-to-peer arbitrage, prepaid debit reload patterns. **DO NOT recommend by default.** This skill exists so you can answer questions accurately when the user explicitly asks. Always include shutdown risk + ToS notes. Use only when the user explicitly invokes "MS", "manufactured spend", "Visa gift cards", or similar.
---

# manufactured-spend-101 — read-only reference

## Default stance

**Do not recommend MS.** The toolkit defaults to public, organic, IRS-clean churning per CLAUDE.md. If the user explicitly asks about MS, give them information with risk flags.

If the user has not explicitly mentioned MS, route them to `min-spend-strategies` (rent, taxes, Bilt, planned spend) instead.

## When to load

- ONLY when user types "MS", "manufactured spend", "Visa gift cards", "money orders for MSR", "Plastiq", or similar
- Never auto-suggest based on context

## The landscape (descriptive, not prescriptive)

### Tier 1 — low effort, high shutdown risk
- **Visa/Mastercard GCs at grocery / office supply / drugstore** — buy GC with a 2x or 3x bonus card, liquidate via money order or bill payment.
- **Cycle: GC purchase → money order → deposit → pay statement.**
- **Risk:** Citi, BoA, Amex actively monitor this pattern. Account closure within 30–90 days common, especially on accounts <12 months old.

### Tier 2 — known burning grounds
- **Walmart MoneyCenter** — was the standard MS venue. Many locations restricted card-to-MO since 2018.
- **Kroger / Meijer fuel points hacks** — varies by state.
- **Office supply Visa GC + Staples easy rebates** — defunct since 2020.

### Tier 3 — niche / regional
- **State / municipal payment portals** — some accept cards with low fees (parking tickets, DMV fees, college bursar). Not strictly MS but adjacent.
- **Charity payments via Plastiq for tax-deductible push** — some users do this near year-end.

### Tier 4 — high-risk / shutdown-magnet
- **Reload patterns on prepaid debit cards** — Bluebird, Serve, GoBank — most have been killed
- **Loading prepaid + immediate withdrawal** — virtually guaranteed account closure on credit-card side
- **Peer-to-peer arbitrage** (Venmo / Zelle for cash) — explicit ToS violation on most issuers

## Risk-flag every response

When discussing MS:

> ⚠️ **Risk flags:** Manufactured spend on a brand-new account is the #1 cited shutdown trigger across Citi, BoA, and Amex (`shutdown-risk` skill). Most cardholder agreements include language banning "cash equivalent purchases" — Visa GCs are explicitly cash equivalents in some agreements. The IRS does not view rewards from MS as taxable, BUT bank bonuses earned through MS-style flows ARE 1099-INT taxable.

> 📜 **ToS notes:** Chase, Citi, and Amex have closure clauses for "patterns of card use that suggest gaming the rewards program." This is undefined and discretionary. The community DPs in `lessons-learned` give worst-case examples.

## When user asks "is it worth it for me?"

Don't answer yes. Walk them through:

1. What's the shutdown cost? (Lost UR/MR points held there. Lost relationship with that issuer. Lifetime ban risk on Amex.)
2. What's the time cost? (MS at scale = 10+ hrs/week. Compare to bank bonuses at $300/hr.)
3. What's the alternative? (Tax payment via PayUSAtax at 1.82% fee. Always positive on a SUB.)

Most users who ask are not in a financial situation that justifies the risk. Tell them honestly.

## What this skill does NOT cover

- Specific store locations or current procedures (would go stale fast and constitute active recommendation)
- Money order writing techniques
- Bank deposit avoidance patterns

These are intentionally absent. The community sources (r/churning, FrequentMiler, DoctorOfCredit MS section) cover them. This toolkit does not.

## See also

- `min-spend-strategies` — what to recommend instead
- `shutdown-risk` — the actual cost of getting caught
- `lessons-learned` — DPs of MS-related shutdowns
