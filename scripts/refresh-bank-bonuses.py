#!/usr/bin/env python3
"""
refresh-bank-bonuses.py — STUB.

Goal: pull current bank/brokerage bonuses from DoctorOfCredit's "Best Bank
Account Bonuses" page and bankrewards.io, update data/bank-bonuses.json,
recompute ROI/hour, bump _meta.last_updated.

Approach (when implemented):
  1. Fetch https://www.doctorofcredit.com/best-bank-account-bonuses/
  2. Parse the table (bank, product, bonus, MSR/DD, lockout).
  3. Cross-check with bankrewards.io if available.
  4. For each bonus, estimate hours-to-complete (from existing entry if known,
     else default).
  5. Recompute ROI/hour.
  6. Mark expired bonuses.

Not implemented yet. Update data/bank-bonuses.json manually:
  - Open https://www.doctorofcredit.com/best-bank-account-bonuses/
  - For each entry in data/bank-bonuses.json, verify still active.
  - Add new bonuses listed as currently active.
  - Bump _meta.last_updated.
"""

import sys

print(__doc__)
print("STUB: not implemented. Check DoC manually for now.")
sys.exit(0)
