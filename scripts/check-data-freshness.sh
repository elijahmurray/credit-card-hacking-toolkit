#!/usr/bin/env bash
# check-data-freshness.sh — print which data files are stale per their
# _meta.staleness_days. Exit 1 if any are stale (useful in CI).

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

STALE=0
TOTAL=0

for f in data/*.json; do
  TOTAL=$((TOTAL+1))
  python3 - "$f" <<'PY'
import json, sys, datetime as dt
path = sys.argv[1]
try:
    d = json.load(open(path))
except Exception as e:
    print(f"  ✗ {path}: invalid JSON ({e})")
    sys.exit(2)
meta = d.get("_meta", {}) if isinstance(d, dict) else {}
last = meta.get("last_updated")
sd = meta.get("staleness_days")
if not last:
    print(f"  ! {path}: no _meta.last_updated")
    sys.exit(0)
try:
    age = (dt.date.today() - dt.date.fromisoformat(last)).days
except Exception:
    print(f"  ! {path}: bad last_updated format ({last!r})")
    sys.exit(0)
if sd is None:
    print(f"  · {path}: {age}d old (no staleness_days set)")
    sys.exit(0)
if age > sd:
    print(f"  ✗ {path}: STALE — {age}d old, threshold {sd}d")
    sys.exit(1)
else:
    print(f"  ✓ {path}: fresh ({age}d / {sd}d)")
    sys.exit(0)
PY
  rc=$?
  if [ "$rc" -eq 1 ]; then
    STALE=$((STALE+1))
  fi
done

echo ""
if [ "$STALE" -gt 0 ]; then
  echo "$STALE of $TOTAL data files are stale. Run the appropriate refresh script:"
  echo "  scripts/refresh-cards.py            (cards.json, sub-sweet-spots.json)"
  echo "  scripts/refresh-elevated-offers.py  (elevated-offers.json)"
  echo "  scripts/refresh-bank-bonuses.py     (bank-bonuses.json)"
  echo "  scripts/refresh-transfer-bonuses.py (transfer-bonuses.json)"
  exit 1
fi

echo "All $TOTAL data files are fresh."
exit 0
