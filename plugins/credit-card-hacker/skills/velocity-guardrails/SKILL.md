---
name: velocity-guardrails
description: Soft rules beyond stated app rules — Chase RAT (Risk Assessment Team) shutdown patterns, Amex pop-up triggers, Citi rapid-application shutdown, BoA "asset gather" sensitivity, Cap One auto-decline patterns. Use whenever the user is about to apply for a 3rd+ card in 30 days, opened ≥2 of any one issuer in last 60 days, or asks about app sequencing.
---

# velocity-guardrails — what the issuer doesn't publish but enforces

## Why these matter

The hard rules in `application-rules` are "you will be denied if X." Velocity guardrails are "you will be approved, but you will get shut down 30 days later" or "you will trigger a financial review." Different failure mode, same outcome (lost SUB + closed account).

## When to load

- User about to apply for 3rd+ card in 30 days (any issuer)
- Already opened ≥2 with a single issuer in last 60 days
- Planning an app-day with multiple submissions
- After any unusual approval sequence ("Amex approved 3 in one week — am I OK?")

## The major patterns

### Chase RAT (Risk Assessment Team)

- 5+ Chase apps in 6 months → high RAT shutdown probability
- Sudden volume spike on a brand-new Chase card (large balance, immediate balance transfer) → fraud-flag review
- Multiple Ink applications close together with same business name + EIN → manual review

**Mitigation:** Space Chase business apps 90 days minimum. Vary EIN/SSN application across player-2. Pre-fund the new Chase account with normal-looking spend before MSR push.

### Amex Financial Review (FR)

- 3+ Amex apps in 30 days → FR risk
- Large MSR on a new Amex with no prior Amex history → FR risk
- Sudden spike in monthly spend (e.g., $20K MSR on Business Plat) without comparable prior pattern → FR risk

**Mitigation:** During FR, Amex requests 4506-T (tax transcripts). Best practice: don't apply for Amex if you can't show ≥$50K reported income matching MSR scale. If FR comes, comply quickly. A failed FR is a permanent banning — Amex never lets you back in.

### Citi rapid-application shutdown

- 3+ Citi cards in a few weeks can trigger closure of NEW AND EXISTING Citi cards
- Citi enforces 8/65/95 strictly on the back end too — apps within those windows risk closure post-approval

**Mitigation:** Respect 8 days personal / 65 days second personal / 95 days business spacing strictly. Even if their system lets you submit early, they can claw back later.

### BoA asset-gather sensitivity

- BoA approvals correlate strongly with held assets at BoA/Merrill (not just credit)
- Premium Rewards / Customized Cash — auto-deny common without $20K+ at BoA/Merrill for Preferred Rewards Platinum Honors

**Mitigation:** Pre-fund Merrill with $20K (transfer in kind from Fidelity/Vanguard, no tax event) 60 days before BoA card application.

### Cap One auto-decline

- Cap One auto-declines based on income-to-debt ratio and prior Cap One history
- Recon is rare (they don't reverse decisions like Chase/Amex)
- Common to be capped at 2 Cap One cards lifetime

**Mitigation:** Don't apply for Cap One if you have any rejected Cap One app in last 6 months — wait for the cooldown. Apply with conservative income figure (lower) and zero current Cap One cards.

### Discover card flooding

- Discover doesn't have a published velocity rule but pulls TransUnion only
- Discover business reports to personal (counts toward 5/24)
- Multiple Discover apps in <90 days → soft-deny via "thank you" letter

## How to score velocity in candidate ranking

When picking a card via `next-card`, apply this multiplier to Y1 net value:

- 0 cards in last 60 days → 1.0× (no penalty)
- 1 card in last 60 days → 0.95×
- 2 cards in last 60 days → 0.85× (start warning)
- 3+ cards in last 60 days → 0.5× + add a "STOP — velocity risk" flag

This is a heuristic, not a published number. Disclose it in your output: "Adjusted Y1 net is 0.85× headline due to recent velocity (2 apps in 45 days)."

## When to say STOP

Per CLAUDE.md "When the user is at risk of shutdown" section:

- 5+ Chase apps in 6 months
- 3+ Amex apps in 30 days
- Visible MS pattern on a brand-new account
- Closing a card under 12 months
- New card + immediate large BT/CA

Output a clear:

> 🛑 STOP — recommending no card application this cycle. Velocity is at Chase RAT threshold (5 apps in 5 months). Take a 60-day break minimum.

## See also

- `shutdown-risk` — primary-source DPs of actual shutdowns
- `application-rules` — the published gates
- `pop-up-jail-amex` — what happens when Amex velocity triggers the popup
