---
name: product-changes
description: Downgrade trees by issuer with SUB-clock implications — Chase Sapphire ↔ Freedom variants (preserves family lockout?), Amex Plat → Green / Schwab Plat / Cash Magnet, Amex Gold → Green / EveryDay, Citi Strata → Custom Cash, Cap One Venture variants. Use in cancel-decision when keep-value is negative but you want to preserve credit history / SUB future eligibility.
---

# product-changes — downgrade instead of close, when it makes sense

## Why product change beats closing

- Preserves credit line and account age (helps AAoA + utilization)
- Avoids the "closed within 12 months" SUB clawback risk
- Sometimes preserves family SUB-eligibility tracking (varies by issuer)
- Removes AF without losing the relationship

## When to load

- `cancel-decision` workflow with negative keep-value
- User says "I want to cancel [card]" — check if PC is better first
- AF posting and user can't justify keeping at full AF + retention won't save it

## Issuer-by-issuer downgrade trees

### Chase
- **Sapphire Reserve ($795) → Sapphire Preferred ($95)** — usually allowed after 12mo
- **Sapphire Preferred ($95) → Freedom Unlimited / Freedom Flex ($0)** — allowed
- **Sapphire Preferred ($95) → Freedom (legacy, no longer issued)** — not available
- **Critical:** PC'ing Sapphire to Freedom does NOT reset the 48-month Sapphire family clock. The clock starts at SUB-earn date, not card-close. PC is purely about preserving credit line + getting rid of AF.
- **Ink Business Preferred ($95) → Ink Business Cash ($0)** or **Ink Business Unlimited ($0)** — allowed, common play after SUB earned
- **United Club Infinite ($695) → United Quest ($295) → United Explorer ($95)** — downgrade tree; AF reduction without closure

### Amex
- **Personal Plat ($695) → Green ($150)** — usually allowed after 12mo
- **Personal Plat ($695) → Cash Magnet (no AF)** — allowed but loses MR earning
- **Gold ($325) → Green ($150)** — allowed
- **Gold ($325) → EveryDay ($0)** — allowed but loses MR earning rate (Gold is 4x dining/groc; EveryDay is 1x default)
- **Business Plat ($695) → Business Green ($375) → Business Cash Magnet** — possible
- **Critical:** Amex PC retains the once-per-lifetime SUB history on the OLD product. PC'ing Plat to Green does not let you re-earn Plat SUB later.
- **Critical:** Amex Hilton Aspire ($550) — DO NOT PC if you want to keep the resort credit and Diamond status. PC strips them.

### Citi
- **Strata Premier ($95) → Custom Cash ($0)** — usually allowed after 12mo
- **Strata Elite ($595) → Strata Premier ($95)** — allowed
- **Citi Premier (legacy) → Strata Premier** — automatic conversion happened in 2024
- **AAdvantage Executive ($595) → AAdvantage Platinum Select ($99)** — allowed

### BoA
- **Premium Rewards Elite ($550) → Premium Rewards ($95)** — allowed
- **Premium Rewards ($95) → Travel Rewards ($0)** — allowed but loses 2x base + Preferred Rewards multiplier

### Cap One
- **Venture X ($395) → Venture ($95)** — allowed
- **Venture ($95) → VentureOne ($0)** — allowed
- **Critical:** Cap One PC is rare and can be denied. Often the only path is full close.

### Barclays
- Limited PC options. Usually close-and-reapply rather than PC.

## When PC is NOT recommended

- Card is <12 months old → keep, don't PC, don't close (clawback)
- You actually use the perks → keep + try retention first
- You want to re-earn the SUB on the same product → must close (and wait the 48-mo Sapphire family clock or per-product Amex once-per-lifetime)
- Family lockout protection: PC does NOT bypass family lockouts. The 48-mo Sapphire clock keeps ticking regardless.

## Calling for a PC

Universal script:

> "Hi, I'd like to product-change my [Current Card] to [Target Card]. I understand this will reduce my AF and change my benefits."

Issuers' policies on PC eligibility:
- **Chase:** must hold card 12+ months
- **Amex:** must hold card 12+ months
- **Citi:** must hold card 12+ months
- **BoA:** typically 12+ months
- **Cap One:** discretionary

## Output template

> **Product change recommendation: CSR → CSP**
>
> - Current: CSR, $795 AF, 18 months held, your Y1 net is now negative ($241)
> - Target: CSP, $95 AF, retains your credit line ($30K)
> - Why PC vs close:
>   - Preserves account age (helps AAoA)
>   - Avoids closure inquiry on Chase relationship
>   - Sapphire 48-mo clock unaffected either way (already running from SUB date)
> - Why PC vs keep + retention: you already have low utilization on the card categories; even with retention, keep_value is barely positive
> - Action: call 1-800-432-3117 after AF posts, request PC to CSP. Confirm credit line transfers.

## See also

- `annual-fee-math` — why this card's keep-value is negative
- `retention-offers` — try retention first
- `cancel-decision` — the workflow
- `card-families` — confirm PC doesn't accidentally violate a family rule
