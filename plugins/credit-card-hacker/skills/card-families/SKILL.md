---
name: card-families
description: Family-level SUB lockouts — Chase Sapphire (48-mo, family-wide), Chase Ink (no family lockout), Amex Plat variants (each separate clock), Amex Gold (personal vs business separate), Amex Bonvoy ↔ Chase Marriott (24-mo cross-issuer), Citi Strata, Citi AAdvantage ↔ Barclays Aviator, Cap One Venture. Use whenever the candidate card belongs to a family the user has touched before.
---

# card-families — the second-most-common cause of failed applications

## Why this exists separately from application-rules

Issuer-level rules (5/24, 1/30, 8/65/95) decide whether you're approved at all. Family-level rules decide whether — assuming approved — you actually get the SUB. A user can be approved for an Amex Personal Plat and still get NO bonus because they earned a Plat SUB in 2019.

## When to load

- Any card whose family the user has had a SUB on before (check `cards[]` + `amex_history[]`)
- Any Amex card (Plat, Gold, Bonvoy, Hilton, Delta) — always check
- Any Marriott card from either Chase or Amex — cross-issuer hairball
- Any Sapphire candidate
- Any AAdvantage application (Citi vs Barclays)

## Where the data lives

`data/card-families.json` — keyed by family slug with members[], rule, workaround, confidence, notes.

## The families that block most often

### Chase Sapphire (`chase_sapphire`)
- Members: CSP, CSR, legacy Sapphire
- Rule: 48-month family-wide SUB lockout. Cannot earn SUB on ANY Sapphire if currently hold any OR earned SUB in past 48 months.
- Workaround: Product-change Sapphire to Freedom Unlimited or Freedom Flex before reapplying. The 48-mo clock starts from prior SUB earn date.

### Chase Ink (`chase_ink`)
- Members: Ink Business Preferred, Ink Business Cash, Ink Business Unlimited, Ink Business Premier
- Rule: NO family-level lockout (as of 2026). Each card has its own 24-month per-product clock.
- This is why churning Inks is the highest-floor public play. Stagger 1/30 (or 1/90 to be safe) and rotate.

### Amex Platinum (`amex_platinum`)
- Members: Personal Plat, Schwab Plat, Morgan Stanley Plat, Goldman Plat (defunct), Business Plat
- Rule: Each variant has its own once-per-lifetime SUB clock. Personal and Business are separate. Schwab/MS variants are separate from Personal Plat.
- This is the legal way to get multiple Plat SUBs over a churning career.

### Amex Gold (`amex_gold`)
- Members: Personal Gold, Business Gold, Premier Rewards Gold (legacy)
- Rule: Personal and Business Gold are separate clocks.

### Amex Bonvoy ↔ Chase Marriott (`amex_bonvoy`, `chase_marriott`)
- Cross-issuer 24-month rule. Cannot have certain Bonvoy cards open across BOTH issuers. Wording varies per card.
- This is the most complex family rule. Read the specific offer terms before recommending.

### Citi Strata (`citi_strata`)
- Members: Strata Premier, Strata Elite
- Rule: 48-month per-product, with some offers extending lockout family-wide. Read offer terms.

### Citi AAdvantage ↔ Barclays Aviator (`citi_aadvantage`, `barclays_aadvantage`)
- Citi: 48-month per-product. Barclays: 24-month per-product.
- Cross-issuer: Barclays Aviator is often the path to a second AA SUB after Citi AA, since they're different issuers.

## How to advise

When a user is locked out by a family rule, **don't** suggest "wait 48 months." Suggest the workaround:

> CSR is locked (Sapphire family — earned CSP SUB on 2024-03-15, eligible 2028-03-15). Workaround: ride out current Sapphire term, product-change to Freedom Unlimited at next AF, then reapply for CSR after 2028-03-15.

For Marriott specifically:

> Bonvoy Brilliant is risky given you closed Boundless on 2025-08-01 and earned its SUB 2024-04. The 24-month cross-issuer clock means SUB likely won't post until 2026-04. Confirm by reading the specific Brilliant offer T&Cs before applying.

## Bilt as a special case

`data/card-families.json` flags Bilt: single product, NO traditional SUB. Rent Day double points + 1x rent are the play. Don't recommend Bilt for SUB chasing — recommend it for rent payments and as a Y1-net AF=$0 portfolio anchor.

## See also

- `application-rules` — issuer-level gates
- `welcome-offer-language` — exact wording variants
- `product-changes` — downgrade trees that preserve family SUB-eligibility
