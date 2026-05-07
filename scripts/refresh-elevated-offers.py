#!/usr/bin/env python3
"""
refresh-elevated-offers.py — STUB.

Goal: pull current Resy / CardMatch / NLL elevated offer DPs from r/churning
+ FrequentMiler and update data/elevated-offers.json. Mark expired offers,
add new ones, bump _meta.last_updated.

Approach (when implemented):
  1. Fetch r/churning "Daily Discussion" + "What Card Should I Get" recent threads
     (use REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET from .env, or unauth via
     old.reddit.com/.../json with user-agent set).
  2. Fetch FrequentMiler "Best Offers" page and look for elevated/Resy/NLL annotations.
  3. For each detected offer, append/update entry in data/elevated-offers.json
     with channel, amount, msr, first_seen, last_seen.
  4. Mark offers as expired if not seen in last 14 days.
  5. Update _meta.last_updated.

Not implemented yet. Run manually until automated:
  - Check Resy iOS app -> Offers tab
  - Check cardmatch.creditcards.com (signed in)
  - Scan r/churning daily threads for "Resy 175K" / "NLL" mentions
  - Update data/elevated-offers.json by hand
"""

import sys

print(__doc__)
print("STUB: not implemented. Check Resy app + r/churning manually for now.")
sys.exit(0)
