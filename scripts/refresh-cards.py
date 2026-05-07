#!/usr/bin/env python3
"""
refresh-cards.py — STUB.

Goal: pull current public SUBs from primary sources (DoctorOfCredit, FrequentMiler)
and update data/cards.json + data/sub-sweet-spots.json with fresh values + bump
_meta.last_updated.

Approach (when implemented):
  1. Fetch DoC's "Best Credit Card Bonuses" page.
  2. Fetch FrequentMiler's "Best Offers" table.
  3. For each card in data/cards.json, look up the current public SUB and
     update current_public_sub.amount + .msr + .msr_months if changed.
  4. Diff-print what changed.
  5. Update _meta.last_updated.
  6. Re-rank sub-sweet-spots.json by new Y1 net values (uses points-valuations.json).

Not implemented yet. Run manually until automated:
  - Open https://www.doctorofcredit.com/best-credit-card-bonuses/
  - For each card in data/cards.json with stale SUB, update by hand.
  - Bump data/cards.json _meta.last_updated to today's date.
  - Run bash scripts/smoke-test.sh to confirm no JSON errors.
"""

import sys

print(__doc__)
print("STUB: not implemented. Update data/cards.json + data/sub-sweet-spots.json manually for now.")
sys.exit(0)
