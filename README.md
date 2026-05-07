# credit-card-hacking-toolkit

AI-powered credit card churning. A Claude Code plugin that picks your next card, hits min spend, decides when to cancel/downgrade/keep, hunts elevated and NLL offers, plans bank-bonus runs, and avoids shutdowns — all backed by structured reference data.

Sister project to [borski/travel-hacking-toolkit](https://github.com/borski/travel-hacking-toolkit). This is the **earn side**; that one is the **burn side**.

> "What card should I get next?" → opinionated recommendation in <60 seconds, with the Y1 net math, the gate check, and the application link.

---

## What it does

Ask the agent any of these and it executes the full workflow without ping-ponging clarifying questions:

- **What card should I get next?** → loads your profile, checks 5/24 + Amex history + family clocks + velocity, ranks candidates by Y1 net at floor cpp, returns ONE recommendation with the app link.
- **Should I keep my [card]?** → break-even math (realized credits + earning premium − AF), retention call EV, downgrade tree, three options ranked.
- **How do I hit MSR on my new [card]?** → maps your organic spend + tax payments + planned big spend to the MSR, computes effective fee.
- **Any good bank bonuses?** → filters DoC's list to ones you're eligible for (ChexSystems, prior lockouts, 5/24), ranks by post-tax ROI/hour.
- **Audit my portfolio.** → quarterly scan: AFs posting, expiring credits, missed quarterly activations, family clocks rolling off.
- **Plan my app-day.** → multi-card sequencing with bureau spread, Resy/CardMatch channel choice, recovery if first app declines.

It defaults to **public, organic, low-risk plays**. Manufactured spend is read-only reference (`manufactured-spend-101` skill); the agent does not proactively recommend it.

---

## Install

### As a Claude Code plugin (recommended)

```bash
git clone git@github.com:elijahmurray/credit-card-hacking-toolkit.git
cd credit-card-hacking-toolkit
bash scripts/setup.sh
```

Then open in Claude Code:

```bash
claude .
```

And run:

```
/credit-card-hacker:getting-started
```

This walks you through building your card profile (open dates, 5/24 status, Amex history, organic spend, points balances). The profile lives at `./profile.json` (gitignored) — it stays in this repo, not your home directory.

After the profile is built, just ask:

```
What card should I get next?
```

### Optional: AwardWallet auto-sync

```bash
bash scripts/setup-keys.sh
# Edit .env: set AWARDWALLET_API_KEY + AWARDWALLET_USER_ID (requires AwardWallet+ paid tier)
python3 scripts/refresh-balances.py
```

This pulls your loyalty balances and writes them to `profile.json` → `points`.

---

## Quick start (3 minutes)

```
/credit-card-hacker:getting-started        # build your profile
What card should I get next?                # hero workflow
Should I keep my Sapphire Reserve?          # AF decision
How do I hit the $4K MSR on my Ink?         # MSR plan
```

---

## How it works

The toolkit ships **skills** (markdown files Claude loads on-demand) plus **reference data** (JSON files with citations + staleness markers).

```
.
├── CLAUDE.md                    # agent system prompt (also AGENTS.md symlink)
├── agents/credit-card-hacker.md # plugin agent file (kept in sync via pre-commit)
├── .claude-plugin/              # plugin manifest + marketplace
├── plugins/credit-card-hacker/
│   └── skills/                  # the actual skills (28 of them)
├── skills/                      # symlink → plugins/credit-card-hacker/skills
├── data/                        # reference JSON (cards, rules, offers, valuations)
├── scripts/                     # setup, smoke-test, refresh, sync hooks
└── profile.json                 # YOUR private profile (gitignored)
```

Each data file has `_meta` with `last_updated`, `staleness_days`, `primary_sources`, and per-entry `confidence` (`VERIFIED` / `LIKELY` / `UNVERIFIED`). The agent preserves confidence in its output — it never invents rules.

---

## Skills

<!-- SKILLS:START -->
| Skill | Description |
|---|---|
| `annual-fee-math` | Break-even framework for "is this AF worth it?" — realized credits + earning premium vs no-AF version + lounge/status/portal value − AF + retention-offer EV. Use whenever the user asks about a card's AF, when the AF i... |
| `app-day` | Multi-card application sequencing — order, spacing, channel choice (Resy/CardMatch first vs public), browser/device strategy, recovery if first app declines. Use when the user wants to apply for 2+ cards in one sessio... |
| `application-rules` | Issuer-specific application rules — Chase 5/24, Amex 1/5 day + 2/90 + 5-card limit, Citi 8/65/95 + 48-month SUB, BoA 2/3/4, US Bank 2/12, Cap One 1/6, Barclays 6/24, Wells 1/6, Discover business reports to personal. M... |
| `awardwallet` | AwardWallet integration — pulls current points balances + card list via API, syncs into profile.json. Use when user mentions AwardWallet, when profile points data is stale (>7 days), or when running portfolio-review a... |
| `bank-bonus` | Current bank/brokerage bonuses ranked by ROI/hour, filtered to ones the user is eligible for (ChexSystems, prior-bonus lockouts, 5/24 if Chase Business, state restrictions). Triggered by "/credit-card-hacker:bank-bonu... |
| `bank-bonus-rules` | Bank bonus eligibility and execution rules — DD requirements (real payroll vs ACH push vs Zelle), ChexSystems sensitivity, prior-bonus lockouts (Chase 2yr, Citi 6mo, BoA 90d), 1099-INT for ≥$10, holding periods, early... |
| `business-card-strategy` | Sole-prop applications, EIN vs SSN, business-card 5/24 implications, what counts as "business activity", state filing requirements. Use when recommending Chase Ink / Amex Business Plat/Gold / Citi Business / BoA Busin... |
| `cancel-decision` | Decision tree when AF is approaching — keep / call retention / downgrade / product-change / cancel. Computes break-even with realized credits, runs retention path with calling script, considers downgrade tree to prese... |
| `card-families` | Family-level SUB lockouts — Chase Sapphire (48-mo, family-wide), Chase Ink (no family lockout), Amex Plat variants (each separate clock), Amex Gold (personal vs business separate), Amex Bonvoy ↔ Chase Marriott (24-mo ... |
| `category-rotators` | 5% category rotators — Discover IT (5% rotating quarters), Chase Freedom Flex (5% rotating quarters, capped $1500/qtr), BoA Customized Cash (3% choose-your-category), Citi Custom Cash (5% top spend category up to $500... |
| `credits-catalog` | Per-card credit catalog with friction rating + realistic realization fraction (not headline value). Use when computing Y1 net value for any premium card, when running cancel-decision break-even, or when the user asks ... |
| `getting-started` | First-run profile builder. Walks the user through a Q&A flow to construct ./profile.json with their card history, 5/24 status, Amex card-of-record list, family lockouts, organic spend, household/P2 status, points bala... |
| `lessons-learned` | Hard-won data points from the churning community — shutdown stories, retention denials, recovery patterns, popup variations. Use for context when a user is making a high-risk move, when they ask "has anyone successful... |
| `manufactured-spend-101` | Read-only landscape of manufactured spend — Visa GC chains via grocery/drug/office stores, money orders at Walmart/grocery, Plastiq, peer-to-peer arbitrage, prepaid debit reload patterns. **DO NOT recommend by default... |
| `min-spend` | Builds a concrete plan to hit a card's MSR using public, organic, low-risk spend — Bilt rent, taxes via PayUSAtax, planned large purchases, partner spend. Computes effective MSR fee and net SUB after fees. Triggered b... |
| `min-spend-strategies` | Public, organic, low-risk paths to hit MSR — Bilt rent (1x), tax payments via PayUSAtax/ACI (1.82-1.87% fee), tuition, Plastiq, large planned spend, gift cards (4Q risk-flagged), partner organic spend. Default order: ... |
| `next-card` | The hero command. Picks the single best next card to apply for, given the user's profile. Loads ./profile.json, computes 5/24 + family lockouts + Amex history, filters candidates from data/cards.json, pulls elevated o... |
| `player-2-strategy` | Couples doubling SUB capacity — separate-applicant rules, AU (authorized user) implications for 5/24, referral rotation, household SUB sequencing. Use whenever profile.player_count == 2 and user is planning multi-card... |
| `points-valuations` | Floor cents-per-point (cpp) by program — the conservative valuation used in all Y1 net math. Chase UR 1.7, Amex MR 1.6, Citi TYP 1.5, Cap One Miles 1.5, Bilt 1.5, Hyatt 1.7, United 1.3, Hilton 0.5, Marriott 0.7, AA 1.... |
| `pop-up-jail-amex` | Amex in-flow popup ("Welcome offer not available...") mitigation — incognito browsing, Resy embedded offers, CardMatch targeted offers, referral links, NLL email triggers. Use whenever recommending an Amex card to a u... |
| `portfolio-review` | Quarterly audit of the user's full card portfolio — AFs coming due, missed credits, expiring SUBs, retention windows opening, family clocks rolling off, stale points balances, missed quarterly category activations. Tr... |
| `product-changes` | Downgrade trees by issuer with SUB-clock implications — Chase Sapphire ↔ Freedom variants (preserves family lockout?), Amex Plat → Green / Schwab Plat / Cash Magnet, Amex Gold → Green / EveryDay, Citi Strata → Custom ... |
| `retention-offers` | Recent retention-offer DPs by card with calling scripts and timing — Chase calls after AF posts, Amex calls 30 days before AF, Citi chat sometimes works, BoA never offers. Use whenever AF is approaching, in cancel-dec... |
| `shopping-portals` | Online cashback portals — Rakuten, TopCashback, Capital One Shopping, Amex Offers, Chase Offers, airline mileage portals (United MileagePlus X, AAdvantage eShopping, Alaska Mileage Plan). Use when user mentions a spec... |
| `shutdown-risk` | Primary-source data points of bank shutdowns by trigger pattern (Chase RAT, Amex FR, Citi rapid-app, BoA fraud-flag, Cap One auto-decline cascade). Load when the user has crossed any velocity threshold, after any unus... |
| `sub-sweet-spots` | Current best SUBs ranked legendary / excellent / good by Y1 net value at floor cpp, with MSR and caveats. Use when picking a card for SUB chasing, when comparing two SUBs head-to-head, or when the user asks "what's th... |
| `velocity-guardrails` | Soft rules beyond stated app rules — Chase RAT (Risk Assessment Team) shutdown patterns, Amex pop-up triggers, Citi rapid-application shutdown, BoA "asset gather" sensitivity, Cap One auto-decline patterns. Use whenev... |
| `welcome-offer-language` | The exact wording in welcome-offer terms determines SUB eligibility — especially Amex once-per-lifetime variations, Chase 48-month Sapphire family clock, Citi 48-month per-product wording. Use whenever recommending an... |
<!-- SKILLS:END -->

To regenerate the table: `bash scripts/gen-skill-tables.sh`

---

## Data files

| File | Contents | Refresh cadence |
|---|---|---|
| `cards.json` | ~250-card master DB with SUBs, AFs, credits, earning rates | Weekly |
| `application-rules.json` | Issuer gates: 5/24, 1/30, 8/65/95, 2/3/4, etc. | Quarterly |
| `card-families.json` | Family lockouts (Sapphire 48mo, Plat tiers, Marriott cross-issuer, Bilt 2.0) | Quarterly |
| `welcome-offer-language.json` _(planned)_ | Wording variants per offer | Monthly |
| `sub-sweet-spots.json` | Tier-ranked SUBs (legendary / excellent / good) | Weekly |
| `elevated-offers.json` | Resy / CardMatch / NLL tracked offers | Weekly |
| `credits-catalog.json` | Per-card credits + realistic realization fractions | Quarterly |
| `retention-offers.json` | DPs by card with calling scripts + EV | Bimonthly |
| `bank-bonuses.json` | Active bank/brokerage bonuses with ROI/hr + lockouts | Weekly |
| `shutdown-patterns.json` | Chase RAT / Amex FR / Citi rapid-app DPs | Quarterly |
| `points-valuations.json` | Floor cpp by program | Bi-yearly |
| `transfer-partners.json` | UR/MR/TYP/Cap1/Bilt → airline+hotel partner ratios | Quarterly |
| `transfer-bonuses.json` | Active transfer bonuses + recent history | Weekly |
| `category-rotators.json` | Quarterly Freedom Flex / Discover IT categories | Quarterly |
| `shopping-portals.json` | Rakuten / TopCashback / airline portal rates | Bi-weekly |
| `pop-up-bypass.json` | Amex popup mitigation methods + effectiveness | Quarterly |
| `credit-pulls.json` | Which bureau each issuer pulls | Yearly |
| `m16p-flowchart.json` | Structured rendering of the m16p r/churning flowchart | Bi-yearly |

Refresh scripts (`scripts/refresh-*.py`) are stubs — currently update by hand. PRs welcome.

---

## Sources & honesty

This toolkit is built on:
- The **m16p r/churning Card Recommendation Flowchart** (the de facto community guide; ingested into `data/m16p-flowchart.json`)
- **DoctorOfCredit** for SUBs + bank bonuses
- **FrequentMiler** for application rules + analyses
- **r/churning** community DPs for retention, popup, shutdown patterns
- **Each issuer's official terms** for application rules + welcome offer language

Confidence levels in the data files:
- `VERIFIED` — corroborated by 2+ primary sources OR official issuer documentation
- `LIKELY` — single primary source OR multiple community DPs
- `UNVERIFIED` — single DP OR speculative

The agent preserves these levels in its output. It never asserts a `LIKELY` rule as a hard limit.

**Card data is reference, not real-time.** SUBs change weekly. The agent always tells you to verify the current public offer at the application page before submitting.

---

## Privacy

`profile.json` contains card open dates, household income range, and points balances. It is:
- Stored at `./profile.json` (override via `$CARD_HACKER_PROFILE_PATH`)
- Gitignored
- Mode `600` (user-only readable)
- Never sent to any external service by the agent

The `.env` file (for AwardWallet API key, etc.) is also gitignored.

---

## Development

```bash
bash scripts/install-hooks.sh    # one-time: install pre-commit hook
bash scripts/smoke-test.sh        # validates all skills + data files
bash scripts/check-data-freshness.sh
bash scripts/gen-skill-tables.sh  # regenerates README skill table
```

The pre-commit hook keeps `agents/credit-card-hacker.md` in sync with `CLAUDE.md` (the agent file must be a real file, not a symlink — Claude Code's plugin loader doesn't follow symlinks for agent definitions).

To add a new skill:

```bash
mkdir -p plugins/credit-card-hacker/skills/my-new-skill
# Create plugins/credit-card-hacker/skills/my-new-skill/SKILL.md with frontmatter:
#   ---
#   name: my-new-skill
#   description: <50-200 word description with trigger phrases>
#   ---
bash scripts/smoke-test.sh
bash scripts/gen-skill-tables.sh
```

---

## Risk stance

This toolkit defaults to **public, organic, IRS-clean churning**. We do not:
- Recommend manufactured spend
- Recommend fake direct deposits
- Recommend ToS violations or detection-evasion patterns

We always note:
- 1099-INT implications on bank bonuses ≥$10
- Credit-score impact (HP per app, AAoA changes, util) on multi-card plans
- Shutdown-risk thresholds (Chase RAT at 5/6mo, Amex FR at 3/30d, Citi at 3/3wk)

If you ask about MS explicitly, the `manufactured-spend-101` skill provides a read-only landscape with risk flags. The agent does not proactively bring it up.

---

## License

MIT. See [LICENSE](LICENSE).

## Contributing

PRs welcome — especially:
- Refresh-script implementations (replacing the stubs in `scripts/refresh-*.py`)
- Data file updates (new SUBs, retention DPs, shutdown patterns)
- New skills for under-covered areas (status matches, lounge access, etc.)
