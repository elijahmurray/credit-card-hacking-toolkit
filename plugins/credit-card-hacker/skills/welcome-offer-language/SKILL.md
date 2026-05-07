---
name: welcome-offer-language
description: The exact wording in welcome-offer terms determines SUB eligibility — especially Amex once-per-lifetime variations, Chase 48-month Sapphire family clock, Citi 48-month per-product wording. Use whenever recommending an Amex card (mandatory), or any card the user has held before, or any card in a family they've earned a SUB on. Wording variants determine whether elevated/Resy/NLL offers can give a second SUB.
---

# welcome-offer-language — wording is the rule, not the headline

## Why this matters

The application rules in `application-rules.json` describe the *typical* SUB-eligibility rules. The actual rule for any specific application is whatever is printed in **that offer's** terms and conditions at the moment the user clicks Apply. Wording varies by:

- Channel (public site, Resy, CardMatch, referral, NLL email)
- Time (Amex tightened wording in 2024)
- Product variant within a family

A user can sometimes get a SECOND SUB on an Amex card they've held before, **only** if the offer they're applying through omits the "have or have had this Card" language. This is how repeat Plat / Gold SUBs happen.

## When to load

- Recommending any Amex card (mandatory)
- Recommending any card the user has previously held or closed (check `cards[]` + `amex_history[]`)
- User asks "can I get the Plat bonus again?" or similar repeat-SUB question
- User shows you a screenshot of an offer page — read the wording carefully

## Amex once-per-lifetime — the wording variants

From `data/application-rules.json` → `issuers.amex.once_per_lifetime.wording_variants`:

1. **Standard restrictive** — "Welcome offer not available to applicants who have or have had this Card or the [related card]."
   → If user has ever held this product, no SUB.

2. **Discretionary** — "We may also consider the number of Cards you have opened and closed."
   → Soft language. Popup likely if velocity is high. Sometimes still issues SUB.

3. **Loose** — "Welcome offer not available to applicants who have had this Card."
   → Same as #1 in practice (per-product lifetime).

4. **Unicorn (no restriction language)** — Some elevated/Resy/NLL offers omit the restriction entirely.
   → This is the SUB-second-time path. Read the offer twice to confirm.

**How to advise:** Tell the user to screenshot the full T&Cs *before* clicking Apply. If the restrictive language is present and they've held the card, the popup will likely appear and the SUB will not post even if approved. If the offer is silent on prior holding, document it (date, channel, full text) — it's their evidence if Amex later claws back.

## Chase Sapphire 48-month family clock

From `application-rules.json` → `issuers.chase.sapphire_family_48mo`:

> Cannot earn the SUB on any Chase Sapphire-branded card if you currently hold ANY Sapphire card or have received a Sapphire SUB in the past 48 months.

The 48-month clock starts from the date you EARNED the prior Sapphire SUB (i.e., when MSR was met and bonus posted), NOT when you opened the card.

**Practical:** If the user opened CSP on 2022-09-01 and earned the SUB by 2022-12-15 (after meeting $4K MSR), they're eligible for any Sapphire SUB starting 2026-12-15. Best practice: product-change CSP/CSR to a Freedom variant before reapplying, so they don't currently HOLD a Sapphire either.

## Citi 48-month wording

From `application-rules.json` → `issuers.citi.48_month_sub`:

> Cannot earn SUB if you have received a SUB on the same card OR closed the same card within the past 48 months. Per-product (with caveats — Strata family has tighter rules).

**Critical:** Citi counts CLOSING the card as a SUB-blocking event for the next 48 months. So if the user closed Citi Premier in 2023, they can't get Strata Premier SUB until 2027. (Premier was renamed to Strata Premier in 2024 — Citi still counts the prior product.)

## Marriott Bonvoy cross-issuer

From `application-rules.json` → `cross_issuer_rules.chase_amex_marriott_24mo`:

> Cannot earn SUB on Marriott Bonvoy cards (any Chase or Amex) if you have received a SUB on any Bonvoy card in the past 24 months OR currently hold certain Bonvoy cards across the issuers.

Always read the specific offer wording. Bonvoy is the most complex cross-issuer rule in the game.

## Output template when wording is the deciding factor

> The public Amex Gold offer (60K MR after $6K/6mo) includes the standard "have or have had this Card" language. Per profile, you held Personal Gold from 2020-03 to 2022-11 — that wording would block the SUB. **Path forward:** wait for an elevated offer (Resy 100K runs 1–2x/year, CardMatch occasional) that omits the "have had" language. Set a calendar check.

## See also

- `application-rules` — the issuer-level gates
- `card-families` — family-level lockouts
- `pop-up-jail-amex` — what to do when the Amex popup appears
- `data/cards.json` — current public SUB amounts
- `data/elevated-offers.json` — tracked elevated/NLL offers (when populated)
