---
name: lessons-learned
description: Hard-won data points from the churning community — shutdown stories, retention denials, recovery patterns, popup variations. Use for context when a user is making a high-risk move, when they ask "has anyone successfully [X]?", or when explaining WHY a rule exists. This skill points to community DPs rather than restating them — sources go stale fast.
---

# lessons-learned — community DPs as context

## What this skill is

A pointer skill. It does not restate community lore (that goes stale). It points the agent to the right primary sources when a user asks "has anyone done this?" or "what happens if I do this?".

## When to load

- User asks "has anyone successfully [X]?"
- User about to do something the toolkit warns against — they want the specific DPs of what went wrong
- User asks "why does this rule exist?"
- After a shutdown / popup / denial — looking for recovery patterns

## Primary community sources

| Source | What it covers | Best for |
|---|---|---|
| **r/churning** | All DPs. Daily Discussion + Weekly Question threads. | Most current DPs of any pattern. Use Reddit search. |
| **r/CreditCards** | Less churning-focused, more product-focused | New product launches, AF discussions |
| **DoctorOfCredit** | News + bank bonuses + DPs in comments | Bank bonus DPs, current promos |
| **FrequentMiler** | Long-form analysis + DPs | Application-rule changes, premium card analyses |
| **OneMileAtATime / View From The Wing** | News + commentary | New offers, devaluations |
| **The Points Guy** | News (don't trust their valuations) | Public offers, devaluations |
| **MilesTalk** | Forum + DPs | Niche issuer DPs |

## How to use

When user asks "has anyone gotten the popup on a Resy Plat offer?":

1. Don't fabricate. Say "let me point you to the right place to check."
2. Suggest searching r/churning for "Resy Plat popup" sorted by Recent.
3. If you have web access, do the search and summarize top 3 DPs from last 60 days. Cite directly.

When user asks "what happens if I close a Chase card under 12 months?":

1. The clawback is documented. Cite r/churning's wiki (reddit.com/r/churning/wiki) → "Clawback DPs."
2. Most DPs: SUB clawed back, account closure trigger, no permanent damage.
3. Some DPs: Chase RAT review triggered if pattern.

## The principle

This toolkit's data files (`application-rules`, `card-families`, `shutdown-patterns`) capture the STABLE rules. r/churning captures the CURRENT DPs. The agent should:

- For stable rules: cite the data file
- For "is this still working in 2026?": point at recent r/churning threads
- For "has the popup changed in the last month?": point at r/churning + suggest user search

## Recovery DPs (most-asked patterns)

When users come in already-shutdown or already-denied:

### "I just got the Amex Financial Review request"
- Comply ASAP (4506-T, recent paystubs, bank statements)
- Don't argue
- Don't apply for any other Amex during the FR
- Outcome distribution: ~70% pass + retain accounts; ~30% lose all Amex permanently
- Source: r/churning Amex FR megathread

### "Chase shutdown letter"
- Move points OUT of UR within hours (transfer to Hyatt, United, etc.) — Chase has been observed reversing transfers post-shutdown but most early transfers survive
- Don't open new Chase accounts under same SSN (won't work for years)
- Spouse's separate apps still work
- Source: r/churning Chase shutdown DPs

### "Citi shut down all my cards"
- Usually 3+ apps in 3 weeks pattern
- 12–24 month cooldown before re-applying
- Some users recover via in-branch application + manual review
- Source: r/churning Citi shutdown threads

## What this skill does NOT do

- Restate DPs that change weekly
- Promise specific DPs from memory (cite the source instead)
- Replace `application-rules` or `shutdown-risk` for stable info

## See also

- `shutdown-risk` — the documented patterns that trigger closures
- `application-rules` — the stable rules
- `velocity-guardrails` — soft rules where DPs matter most
