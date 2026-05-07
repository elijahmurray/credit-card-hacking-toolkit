---
name: retention-offers
description: Recent retention-offer DPs by card with calling scripts and timing — Chase calls after AF posts, Amex calls 30 days before AF, Citi chat sometimes works, BoA never offers. Use whenever AF is approaching, in cancel-decision workflow, or when the user is debating "should I call retention?".
---

# retention-offers — when to call, what to say, what to expect

## Timing per issuer

| Issuer | When to call | Channel |
|---|---|---|
| **Chase** | AFTER the AF posts on statement | Phone (1-800-432-3117) |
| **Amex** | 30 days BEFORE AF posts (offer rotates monthly) | Phone or chat in app |
| **Citi** | After AF posts | Chat first, phone if no offer |
| **BoA** | Almost never offers retention. Try, but don't expect. | Phone |
| **Cap One** | After AF posts | Chat first |
| **Barclays** | After AF posts | Phone |

## When to load

- AF posting in next 60 days
- User debating cancel vs keep
- `cancel-decision` workflow

## Where the data lives

`data/retention-offers.json` (when populated) — DPs by card with offer type (statement credit / points / spend bonus), typical amount, success rate.

## The calling script

Universal opener (works across issuers):

> "Hi, I'm calling about my [Card Name]. I see the annual fee just posted [or is about to post]. I've been a long-time cardmember and want to evaluate whether it makes sense to keep this card. Are there any retention offers available on my account?"

**Don't:**
- Threaten to close
- Mention competitor cards
- Demand a specific offer
- Call multiple times in one cycle (some issuers note this and lock you out)

**Do:**
- Say it once, listen
- If first offer is small ("$50 statement credit"), politely ask "Is that the only offer available?" — sometimes a second offer pops
- If no offer or insufficient, say "Thanks, I'll think about it" and hang up. Don't accept poor offers — they sometimes update later in the cycle.

## Typical offers by card

### Chase Sapphire Reserve ($795 AF)
- Common: $300 statement credit OR 50K UR after $5K spend in 3 months
- Best: $500 statement credit (rare)
- 50% of users get something; 50% get nothing
- **Expected EV: $200**

### Chase Sapphire Preferred ($95 AF)
- Common: $95 statement credit OR 10K UR
- Best: 30K UR after $1K spend
- 30% of users get something
- **Expected EV: $40**

### Amex Personal Platinum ($695 AF)
- Common: 30K MR after $3K spend in 3 months
- Best: 75K MR after $4K spend (rare, requires multiple call attempts)
- **Expected EV: $250**

### Amex Gold ($325 AF)
- Common: 20K MR after $2K spend
- Best: 60K MR after $4K spend (rare)
- **Expected EV: $100**

### Cap One Venture X ($395 AF)
- Cap One often does NOT offer retention
- The card is built to be permanent (credits net AF to ~$0)
- Don't expect retention — keep based on credits alone

### Citi Strata Premier ($95 AF)
- Common: $50 statement credit
- Rarely offers points
- **Expected EV: $25**

### BoA Premium Rewards / Premium Rewards Elite
- Almost never offers retention
- Decision is purely on credit utilization + Preferred Rewards multiplier value

## Output template

When advising on retention call:

> **Retention call plan: Chase Sapphire Reserve, AF $795 posts 2026-08-15**
>
> 1. Wait until 2026-08-16 (after AF posts on statement).
> 2. Call 1-800-432-3117. Use universal opener (above).
> 3. Expect: ~50% chance of $300 credit OR 50K UR.
> 4. If offered $300: accept, treat as Y1 net adjustment. (Effective AF becomes $495.)
> 5. If offered 50K UR + $5K spend: accept ONLY if you have organic spend. 50K × 1.7cpp = $850 value, well worth $5K MSR if spend is organic.
> 6. If no offer: don't cancel on the spot. Re-evaluate keep vs downgrade with `annual-fee-math`.

## What if retention is generous and you accept?

- Spend bonus: count toward annual MSR planning. Don't hit it with manufactured spend.
- Statement credit: posts within 1–2 cycles. Confirm before next AF.
- Some retention offers RESET the SUB clock (rare; mostly Amex). Read the offer terms.

## See also

- `annual-fee-math` — break-even framework
- `product-changes` — alternative if retention insufficient
- `cancel-decision` — the workflow
