---
name: player-2-strategy
description: Couples doubling SUB capacity — separate-applicant rules, AU (authorized user) implications for 5/24, referral rotation, household SUB sequencing. Use whenever profile.player_count == 2 and user is planning multi-card runs, when discussing referral bonuses, or when explaining "AU" / "authorized user" in any context.
---

# player-2-strategy — couples earn 2x

## When P2 doubles capacity

If both adults in a household apply for cards independently, the household SUB capacity is 2x:
- 2x Chase 5/24 budget (5 personal slots each)
- 2x Amex once-per-lifetime per product (each spouse gets their own Plat SUB lifetime, etc.)
- 2x Citi 8/65/95 windows (offset by 4+ days for safety)
- 2x bank bonus capacity

## When to load

- `profile.json` → `household.player_count >= 2`
- User mentions spouse / partner
- Any referral discussion ("should I refer them?")
- Adding spouse as authorized user (AU) on a card

## The independent-applicant principle

Each spouse applies for their own cards using their own SSN. They are independent applicants. Issuers do not link them automatically (with rare exceptions noted below).

This means:
- P1 has CSP. P2 can also have CSP (P2 can earn the SUB even though P1 has held the card).
- P1 hit 5/24. P2 may still be at 0/24 and can apply for any 5/24-restricted card.
- P1 has Plat (lifetime SUB used). P2 can earn Plat SUB independently.

## AU (Authorized User) — the trap

Adding P2 as AU on P1's card:
- ✅ Builds P2's credit history (account age + history are reported to P2's bureau)
- ✅ P2 gets a card to use, no AF for AU on most cards
- ❌ AU cards typically COUNT toward 5/24 for P2 (some DPs say not; safer to assume yes)
- ❌ Adding AU means P2 "burned" a 5/24 slot without earning a SUB

**Rule of thumb:** Don't add P2 as AU on a card P2 might want to apply for themselves later. Wait until P2's 5/24 budget is fully consumed by self-applications, THEN add AUs to round out access.

## Referral rotation

Most issuers pay referral bonuses when a new user signs up via a referral link from an existing cardholder. This is genuine free money for couples:

- Chase: 10K–25K UR per CSP/CSR/Ink referral
- Amex: 5K–60K MR per Plat/Gold referral (Amex caps annual referral earnings at 100K MR per card)
- Citi: $50–$200 per Strata/AAdvantage referral

**Referral sequencing for max household earn:**
1. P1 applies for CSP cold (no one to refer them)
2. P2 applies for CSP via P1's referral link → P1 gets 25K UR
3. Later, P1 applies for CSR via P2's CSR referral link → P2 gets 25K UR
4. Continue alternating who applies first for each card so the OTHER spouse always earns the referral

Over a year of normal churning, $200–$1000+ in referral bonuses per couple.

## Sequencing gotchas

- **Joint Amex Plat SUBs:** P1 and P2 both can get the SUB lifetime. But if you both apply same day, Amex sometimes flags as fraud. Stagger 7+ days.
- **Chase Sapphire 48-mo:** household-level it doesn't combine. P1's Sapphire SUB doesn't block P2's Sapphire SUB.
- **Joint bank accounts as DD:** If P1 and P2 share a checking account that's the DD for a bank bonus, the issuer may consider it the same account and not pay both bonuses. Use individual checking for each spouse's bank bonuses.
- **Marriott Bonvoy cross-issuer:** the cross-issuer rule is per-applicant, not per-household. P1 having Bonvoy Brilliant doesn't block P2 from getting Boundless.

## Communication strategy

Couples churning together often run into "I forgot you applied for that." Suggest:
- Shared Google sheet OR shared `profile.json` per spouse OR a household-level profile with `player_1` and `player_2` arrays
- Calendar reminders for AF posting + retention call windows + 48-mo Sapphire clock
- Quarterly portfolio-review jointly

## Profile schema for P2

If P2 is also churning, run `getting-started` for P2 separately and store at `./profile-p2.json` (or override env var). Both files gitignored. Cross-reference manually.

Future: a household-mode `getting-started` that produces `./profile.json` with both `player_1.cards[]` and `player_2.cards[]`. For now, keep separate files.

## When NOT to enroll P2 in churning

- P2 doesn't want to (most common, most important)
- P2 has poor credit (any approvals will be denied; inquiries hurt for nothing)
- P2 has career/credit reasons to keep credit history minimal (mortgage in <12mo, security clearance, etc.)
- P2 is sole earner and approval depends on showing income that would be diluted

## See also

- `application-rules` — per-applicant gates apply to each spouse independently
- `business-card-strategy` — P2 can also have separate sole-prop business cards
- `bank-bonus-rules` — joint vs individual checking nuances
