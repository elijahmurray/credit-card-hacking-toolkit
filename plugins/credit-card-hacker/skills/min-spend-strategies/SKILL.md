---
name: min-spend-strategies
description: Public, organic, low-risk paths to hit MSR — Bilt rent (1x), tax payments via PayUSAtax/ACI (1.82-1.87% fee), tuition, Plastiq, large planned spend, gift cards (4Q risk-flagged), partner organic spend. Default order: rent → taxes → tuition → planned big spend → MS only if explicitly asked. Use whenever user asks "how do I hit MSR" or after recommending any card with MSR > 1 month of organic spend.
---

# min-spend-strategies — public + organic paths

## Default ordering (from CLAUDE.md)

1. **Rent via Bilt (1x)** — if user pays rent and uses Bilt, count rent toward MSR. Note: most other cards' MSR does NOT accept Bilt-paid rent.
2. **Taxes via PayUSAtax / ACI** — federal estimated quarterly or year-end. Effective MSR cost = fee ÷ SUB cpp.
3. **Tuition** — university bursar usually accepts cards (sometimes with 2.5% fee).
4. **Large planned spend** — wedding, HVAC, kid braces, vet bill — push to a SUB-MSR.
5. **Partner organic spend** — household-level pool.
6. **Plastiq** — pay any bill via card at 2.85% fee. Last resort but legitimate.
7. **MS** — only if user explicitly asks. See `manufactured-spend-101`. Default DO NOT recommend.

## When to load

- User just got a new card and asks "how do I hit $4K/3mo?"
- After any card recommendation where MSR > 1.5× user's monthly_cc_spend
- `min-spend` user-invoked workflow
- Quarterly portfolio review (any expiring SUB windows)

## The tax payment math

PayUSAtax fee: ~1.82% of payment. ACI: ~1.87%. Pay1040: ~1.82%.

Effective MSR cost = fee ÷ SUB value. Example:

> Chase Ink Business Preferred SUB: 90K UR × 1.7cpp = $1,530 value. MSR $8K. Pay $8K of estimated taxes via PayUSAtax: fee = $146. Net SUB = $1,530 − $146 = **$1,384 net** (on a payment you owed anyway). Effective rate: 9.1× return on the fee.

**Caveats:**
- Federal only. State taxes vary by state — some accept cards, most charge >2.5% fee.
- IRS limits: 2 payments per processor per quarter for estimated, 2 per processor for year-end. Use multiple processors if needed.
- If you don't actually owe taxes, overpaying gets refunded. Refund delay is 4–8 weeks. Don't over-pre-pay if you need the cash flow.

## Bilt rent

- Bilt pays 1x on rent (the only card that does this with no fee).
- Rent paid via Bilt does NOT count toward most other cards' MSR. Bilt's MSR exception is itself.
- If user pays $2.8K/month rent via Bilt, that's $2.8K/month of "free" earnings (1x rent + Rent Day double on other categories). It is NOT a route to hit a CSP $4K/3mo MSR.

## Plastiq for non-Bilt rent

Plastiq accepts any card and pays anyone (rent, mortgage, contractor) at 2.85% fee. Use to push rent to MSR when you don't have Bilt.

> $4K/3mo MSR via Plastiq rent payments: 3× $1,333 rent payments = $4K spend, $114 fee. SUB worth $1,200+ → still profitable.

**Watch:** Plastiq has been increasingly card-restricted (some Mastercards rejected, Amex personal cards rejected on certain payment types). Test with $50 first.

## Gift cards in Q4

Q4 (Nov–Dec) gift card buying patterns are heavily monitored by Citi, BoA, and Amex — flagged as MS pattern. If user wants to buy GCs to hit MSR:
- Spread across Q1–Q3 if possible
- Vary merchants (Visa GCs from CVS, then grocery, then office supply)
- Don't redeem the GCs immediately — let them sit 30+ days
- High shutdown risk on a brand-new account doing this (`shutdown-risk` skill)

Default recommendation: don't.

## Output template

When recommending an MSR plan:

> **MSR plan: $8K Ink Business Preferred (3 months, deadline 2026-08-15)**
>
> | Source | Amount | Fee | Notes |
> |---|---|---|---|
> | Federal estimated tax (PayUSAtax) | $5,000 | $91 | Q3 estimated, due 2026-09-15 anyway |
> | Organic business spend (existing) | $2,400 | $0 | $800/mo software, advertising |
> | Vet bill (planned) | $600 | $0 | Already scheduled 2026-07 |
> | **Total** | **$8,000** | **$91** | |
>
> Net SUB after fees: $1,530 − $91 = **$1,439**.

## See also

- `manufactured-spend-101` — read-only, do not recommend by default
- `category-rotators` — earn bonus categories outside MSR window
- `data/cards.json` → MSR fields per card
