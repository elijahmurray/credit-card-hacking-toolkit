---
name: cancel-decision
description: Decision tree when AF is approaching — keep / call retention / downgrade / product-change / cancel. Computes break-even with realized credits, runs retention path with calling script, considers downgrade tree to preserve credit line + family eligibility. Triggered by "/credit-card-hacker:cancel-decision [card]", "should I keep my [card]?", "AF posted", "is [card] worth it?".
---

# cancel-decision — keep or kill, with the math

## Trigger phrases

- `/credit-card-hacker:cancel-decision [card-id]`
- "Should I keep my [card]?"
- "[Card] AF just posted, what do I do?"
- "Is the [card] AF worth it?"

## The decision tree

```
┌─ Card <12 months old? ─────────────► YES → KEEP (clawback risk). Reassess at month 13.
│        │
│        NO
│        ▼
├─ Realized keep_value > 0? ─────────► YES → KEEP. Optionally call retention for bonus.
│        │
│        NO
│        ▼
├─ Retention offer brings keep_value > 0? ─► YES → CALL RETENTION + accept.
│        │
│        NO
│        ▼
├─ Downgrade exists that preserves credit line? ─► YES → DOWNGRADE.
│        │
│        NO
│        ▼
└─ CANCEL.
```

## Hard prerequisite

`./profile.json` must exist. Card must be in `cards[]`.

If user names a card not in profile:

> [Card name] not found in your profile. Add it via `getting-started` or tell me the open date so I can compute the keep/cancel decision.

## Step-by-step

### Step 1 — Find the card

Match user input against `profile.cards[]` by `card_id` or `name`. If multiple match (rare), ask once which.

### Step 2 — Check clawback window

If `today − open_date < 365 days`:

> 🛑 **KEEP.** Card is only [N] months old. Closing now risks SUB clawback (most issuers, Amex specifically). Re-evaluate in [13 − N] months.

Don't proceed further. Don't even compute keep_value. The clawback risk dominates.

### Step 3 — Load skills

Load `annual-fee-math`. Load `credits-catalog`. Load `retention-offers`. Load `product-changes`.

### Step 4 — Compute baseline keep_value

Per `annual-fee-math`:
```
keep_value = realized_credits + earning_premium + perks_value − AF
```

Show the breakdown table.

### Step 5 — Run the tree

**If keep_value > $100:** Recommend KEEP outright. Mention retention call as bonus opportunity but it's not required.

**If keep_value between $0 and $100:** Recommend KEEP + try retention. Quote typical retention offer for this card from `retention-offers`. Add expected retention EV to decide if call is worth the time.

**If keep_value between −$200 and $0:** Run retention path. If typical retention pushes it positive, recommend CALL RETENTION + accept. Provide calling script, timing (Chase: after AF posts; Amex: 30 days before).

**If keep_value < −$200:** Skip retention (won't recover this much). Go to downgrade tree from `product-changes`. Find a no-AF or lower-AF target that preserves credit line + family SUB-eligibility status.

**If no viable downgrade OR downgrade is also negative net value:** Recommend CANCEL.

### Step 6 — Output the three options

Even when one is clearly best, show the user all three so they understand the choice:

> | Option | Y1 net | Notes |
> |---|---|---|
> | KEEP at full AF | −$241 | Realized credits low this year; OpenTable not used |
> | KEEP + retention ($300 credit) | $59 | 50% chance Chase offers; would you accept $300? |
> | DOWNGRADE to CSP | $40 | Preserves credit line ($30K), keeps Sapphire family clock unchanged |
> | CANCEL | $0 | Closes line, ends earning, no future Sapphire blocking issue beyond what already exists |
>
> **Recommended: DOWNGRADE to CSP.** You don't use the CSR-specific perks (Priority Pass, OpenTable), and downgrading keeps the credit line + AAoA. Sapphire family clock is already running from your 2024-03-15 SUB; downgrade vs cancel doesn't change that.

### Step 7 — Specific instructions

For each chosen path, give the calling-script, timing, and what to confirm:

**For KEEP + retention:**
> Call 1-800-432-3117 on or after [AF post date]. Use opener: "I'm calling about my Sapphire Reserve. The annual fee just posted; I'm evaluating whether to keep this card. Are there any retention offers available on my account?"
>
> Listen. If first offer is $300 statement credit: accept (it nets you $59 keep_value). If 50K UR + $5K spend: also accept (50K × 1.7 = $850 worth $5K MSR if organic).

**For DOWNGRADE:**
> Call 1-800-432-3117. "I'd like to product-change my Sapphire Reserve to Sapphire Preferred." Confirm credit line transfers, no inquiry, no SUB on the PC product. AF refunded prorated if PC happens before AF cycle ends.

**For CANCEL:**
> Call 1-800-432-3117. "I'd like to close my Sapphire Reserve account." Confirm AF refund timing (most issuers: prorated for first 30 days; some refund full AF if closed within 60 days of posting). Move points OUT of UR before closing — points held in UR die with the card if not transferred to a Hyatt/United etc. partner OR moved to another UR-earning Chase card on your account.

## Special cases

### Hilton Aspire — never downgrade
The resort credit + Diamond status are the entire value. Downgrading strips them. If you can't justify the $550 AF, cancel rather than downgrade.

### Amex Plat — call 30 days BEFORE AF posts
Amex retention rotates monthly. Calling before the AF posts gives more leverage. Amex offers per `retention-offers` skill.

### Cap One — usually no retention offered
Cap One Venture X is built to net out at near-$0 AF via credits. If you can't realize the credits, the card just isn't for you. Downgrade to Venture or close.

### Cards with 5/24 implications on closure
Closing doesn't UN-count toward 5/24 (the 24mo clock runs from open date regardless). But: closing too many in a short period can flag your Chase relationship. Don't close 3+ Chase cards in 30 days.

## See also

- `annual-fee-math` — break-even framework
- `credits-catalog` — for realized credit values
- `retention-offers` — DPs by card + scripts
- `product-changes` — downgrade tree
- `getting-started` — if card isn't in profile yet
