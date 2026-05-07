---
name: pop-up-jail-amex
description: Amex in-flow popup ("Welcome offer not available...") mitigation — incognito browsing, Resy embedded offers, CardMatch targeted offers, referral links, NLL email triggers. Use whenever recommending an Amex card to a user with prior Amex history (≥1 closed Amex card OR ≥3 currently held Amex products), and whenever the user reports they hit the popup.
---

# pop-up-jail-amex — the Amex popup is not the once-per-lifetime rule

## What the popup is

When applying for an Amex card via amex.com, an in-flow page may appear before submit:

> "Based on your history with American Express welcome bonus offers, you are not eligible to receive the welcome bonus."

This is **not** the same as the once-per-lifetime SUB rule (`welcome-offer-language` skill). The popup can fire even on cards the user has never held, due to:

- High Amex card velocity (3+ apps in 90 days)
- Many closed Amex accounts in user's history
- "Insufficient relationship" — too few cards held + too many opened/closed
- Pure model unpredictability (trial closures by Amex)

If the popup appears and you submit anyway, you're approved for the card with no SUB. The card is essentially worthless for the SUB purpose.

## When to load

- Recommending any Amex card (mandatory) where user has any prior Amex history
- User reports "I got the popup" — they need a recovery plan
- Planning the order of an app-day with Amex apps in it

## The mitigation playbook (in order of effectiveness)

1. **Resy targeted offer (best).** Resy emails users elevated Amex offers (e.g., 175K Personal Plat, 250K Business Plat). Apply through the Resy link. The Resy offer often:
   - Bypasses popup entirely (different offer ID, different routing)
   - Carries elevated SUB
   - Sometimes omits "have or have had this Card" wording
   - Use Resy iOS app + check "Offers" tab; check email weekly

2. **Incognito / private browsing.** Apply in a fresh browser session not logged into amex.com. No guarantee but reduces personalization signals. Combine with #3.

3. **Amex CardMatch.** Visit cardmatch.creditcards.com, enter SSN. Sometimes shows targeted Amex offers that bypass popup. Targeted offers have unique URLs and offer IDs.

4. **NLL (No-Lifetime-Language) email offers.** Amex occasionally sends emails with offers explicitly omitting the lifetime language. These are gold for repeat SUBs. Forward the email to yourself, click within hours (some have 24–72hr windows).

5. **Referral link from another user.** Family member's referral link sometimes carries different offer routing. Less reliable than Resy/CardMatch but free.

6. **In-branch (rare).** Some Amex products allow in-branch / phone application that bypasses online popup. Limited utility.

## What does NOT work

- Clearing cookies (popup is server-side per SSN)
- Different IP / VPN (won't bypass)
- Applying just before midnight (popup persists across days)
- Calling Amex to "remove the popup" (CSRs cannot)
- Asking Resy customer service to send you the offer (only sent based on usage)

## Output template

When recommending an Amex card to popup-risk user:

> ⚠️ Popup risk: profile shows 4 closed Amex products (Plat 2019, Gold 2020, Hilton 2021, Delta 2022). Public application has high popup probability. **Recommended path:**
> 1. Wait for Resy offer (check resy.com/offers + email weekly). Recent Plat Resy offers are 175K MR.
> 2. If no Resy offer in 30 days, check CardMatch monthly for targeted Plat.
> 3. If popup appears at submit: **do not submit.** Close window. Try again in 90 days via fresh channel.

## See also

- `welcome-offer-language` — the wording rule (separate from popup)
- `velocity-guardrails` — Amex velocity thresholds that trigger popup
- `data/elevated-offers.json` — tracked Resy/NLL/CardMatch offers (when populated)
