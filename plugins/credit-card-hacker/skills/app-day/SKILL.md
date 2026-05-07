---
name: app-day
description: Multi-card application sequencing — order, spacing, channel choice (Resy/CardMatch first vs public), browser/device strategy, recovery if first app declines. Use when the user wants to apply for 2+ cards in one session ("app-o-rama"), at end of a 30-day Amex velocity window, or as part of a quarterly portfolio plan.
---

# app-day — sequencing 2+ apps cleanly

## Trigger phrases

- `/credit-card-hacker:app-day`
- "I want to do an app-o-rama"
- "Apply for 3 cards this weekend?"
- "Best order for [card list]?"

## Hard prerequisite

`./profile.json`. Also: user must have a clear list of cards in mind, or have just run `next-card` + `portfolio-review`.

## When app-day is the right call

Good fit:
- 2+ cards eligible AND combined Y1 net > $2,500
- User can complete MSR on each within window
- No high-velocity flags (per `velocity-guardrails`)
- Goal: maximize SUB capture in a single hard-pull window so credit-score impact is consolidated

Bad fit:
- Already at velocity thresholds (>2 apps in last 60 days)
- User has a mortgage / car loan in <6 months
- Single highest-EV card has Y1 net > sum of secondary candidates − their app-day risk premium
- User is uncomfortable explaining 3 inquiries to anyone

## The sequencing principles

### 1. Hard-pull issuers first, soft-pull later same day
If applying for 3 cards across Chase, Amex, Citi:
- Chase pulls Experian (or TransUnion in some states) — usually hard
- Amex pulls Experian — hard
- Citi pulls Equifax — hard

Sequencing matters for credit-score impact display: each hard pull adds ~5 points temporarily. If you apply for all 3 in 24 hours, the score reflects it AFTER, not between apps. So pre-approval at app #3 still sees pre-app-day score.

### 2. Highest-friction app FIRST
If one card requires a Resy / CardMatch / NLL channel (Amex Plat), do it first while you have patience and the offer hasn't expired. Don't end your app-day with the hardest one.

### 3. Highest-Y1-net card if approval is uncertain
If you're worried about a denial cascading (e.g., high 5/24 with one Chase app planned), put that app FIRST. If it's denied, you've still got slots for the more-likely-approved apps.

### 4. Different issuers in same session
Generally fine. Banks don't see each other's apps in real time (only what's already on the bureaus).

Exception: Chase will see the Amex hard pull from earlier today on a fresh bureau pull and may take it into consideration. The 24hr lag is real but not absolute.

### 5. Avoid same-issuer same-day
- Chase: 1 personal + 1 business same day is OK (different bureau pulls in many cases). 2 personal same day usually triggers 1/30 rule on the second.
- Amex: 1/5-day rule. Don't try 2 Amex same day.
- Citi: explicit "no same-day double-dip" rule. Second Citi denied.
- BoA: 2-card same-day allowed within 2/3/4 limit.
- Cap One: 1 personal same day, second triggers 1/6mo.

## Channel order in the session

For each card, choose channel BEFORE app-day starts:

1. **Targeted offers (Resy, CardMatch, NLL email)** — apply via these direct links
2. **Referral links** — if a P2 / family member can refer for a referral bonus, use that link
3. **Public** — last resort

Have all channel URLs in tabs before starting. Don't research mid-session.

## Browser strategy

- **Use one browser, normal mode, NOT incognito.** Card issuers' anti-fraud systems sometimes flag incognito as suspicious. EXCEPTION: Amex popup mitigation — for Amex apps where popup is a concern, use incognito for that app only.
- **Don't VPN.** Issuers' fraud systems flag mismatched IP/billing-address.
- **Same device throughout.** Don't switch laptop ↔ phone between apps.

## Recovery from a denial mid-app-day

If Chase denies app #1:
- DO call recon (1-888-270-2127) within 30 days. Often reversible if reason is borderline (low utilization, recent inquiry).
- DON'T skip ahead to apps #2, #3 immediately — reassess. The denial may indicate something will block #2 too.

If Amex denies app #1:
- Recon less successful at Amex than Chase. Worth a try (1-800-528-2122).
- If denial reason was popup-related, do NOT proceed with another Amex app same week.

If Citi denies app #1:
- Citi recon is slow; usually wait the cooling period and reapply.
- Don't apply for another Citi within 8 days regardless.

## Output format

When user proposes an app-day, show:

> # App-day plan: 2026-05-08 (Saturday)
>
> ## Order
>
> | # | Card | Issuer | Bureau | Channel | Y1 net | App by |
> |---|---|---|---|---|---|---|
> | 1 | Amex Business Plat | Amex | EX | Resy elevated 250K | $4,000 | 9:00am — Resy expires 2026-05-12 |
> | 2 | Chase Ink Business Preferred | Chase | EX | Public 90K | $1,289 | 9:30am |
> | 3 | Citi AAdvantage Business | Citi | EQ | Public 75K AA | $1,050 | 10:00am |
>
> Total expected Y1 net: **$6,339** (gross, before risk-adjustment)
>
> Velocity penalty: 0.85× (this brings you to 3 apps in 7 days — Amex 1/5 rule means the Amex app is the only one that matters for Amex velocity; Chase + Citi are different issuers). Risk-adjusted: **$5,388**.
>
> ## Pre-app checklist
>
> - [ ] Resy app open with the 250K Plat offer link (do this app FIRST)
> - [ ] Reply to the Resy email to "save" the offer in case the link expires mid-session
> - [ ] Have business EIN ready (or SSN if no EIN)
> - [ ] Confirm no same-day denial of #2 if #1 is borderline
> - [ ] Plan MSR coverage now: $20K + $8K + $4K = $32K combined MSR over 3 months. You spend ~$5K/mo organic + plan to do $15K of estimated taxes (PayUSAtax 1.82% = $273 fee)
>
> ## Sequencing
>
> 1. **9:00am** — Amex Business Plat via Resy. Should it popup, screenshot and abort. Don't submit a popup.
> 2. **9:30am** — Chase Ink Business Preferred via chase.com/business/ink-preferred. Public.
> 3. **10:00am** — Citi AAdvantage Business via citi.com/business. Public.
>
> If #1 (Amex) declines: skip #2, #3 — total day re-plan needed (likely Amex velocity issue affecting comfort with more apps)
> If #1 approves but #2 declines: still proceed with #3 (different issuers, denial doesn't cascade)
>
> ## Post-app-day
>
> - Don't apply for ANY new card for the next 30 days minimum
> - Set MSR tracking on each card (date opened + msr_months)
> - Update profile.json: add the 3 new cards once approvals confirm. Run `getting-started` in append mode.

## When NOT to do app-day

- If `next-card` has only ONE high-Y1 candidate and other candidates are sub-$300 net — just apply for the one card
- If the user is at velocity threshold — wait 60 days
- If user has any current MSR window still open — finish that first
- If user is unsure about MSR coverage — fix the MSR plan first (`min-spend`)

## See also

- `next-card` — for picking individual candidates
- `velocity-guardrails` — the velocity penalty math
- `pop-up-jail-amex` — popup planning for Amex apps
- `application-rules` — same-day rules per issuer
- `min-spend` — MSR coverage planning across multiple cards
