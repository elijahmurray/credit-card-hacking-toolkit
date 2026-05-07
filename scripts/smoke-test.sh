#!/usr/bin/env bash
# smoke-test.sh — validate toolkit structure before commit.
# Checks: skill frontmatter, data-file _meta blocks, JSON validity, CLAUDE.md size.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
WARN=0

ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; PASS=$((PASS+1)); }
err()  { printf "  \033[31m✗\033[0m %s\n" "$1"; FAIL=$((FAIL+1)); }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; WARN=$((WARN+1)); }

section() { printf "\n\033[1m%s\033[0m\n" "$1"; }

# ---------- 1. CLAUDE.md size ----------
section "CLAUDE.md"
if [ ! -f CLAUDE.md ]; then
  err "CLAUDE.md missing"
else
  lines=$(wc -l < CLAUDE.md | tr -d ' ')
  bytes=$(wc -c < CLAUDE.md | tr -d ' ')
  if [ "$lines" -gt 400 ]; then
    err "CLAUDE.md is $lines lines (>400 — too large, will eat context budget)"
  elif [ "$lines" -gt 250 ]; then
    warn "CLAUDE.md is $lines lines ($bytes bytes) — getting heavy, consider trimming"
  else
    ok "CLAUDE.md size OK ($lines lines, $bytes bytes)"
  fi
fi

# ---------- 2. Data files ----------
section "Data files (data/*.json)"
if [ ! -d data ]; then
  err "data/ directory missing"
else
  shopt -s nullglob
  for f in data/*.json; do
    name=$(basename "$f")

    # JSON validity
    if ! python3 -c "import json,sys; json.load(open('$f'))" 2>/dev/null; then
      err "$name: invalid JSON"
      continue
    fi

    # _meta block
    has_meta=$(python3 -c "import json; d=json.load(open('$f')); print('yes' if isinstance(d, dict) and '_meta' in d else 'no')" 2>/dev/null)
    if [ "$has_meta" != "yes" ]; then
      err "$name: missing _meta block"
      continue
    fi

    # _meta.last_updated
    last_updated=$(python3 -c "import json; d=json.load(open('$f')); print(d['_meta'].get('last_updated',''))" 2>/dev/null)
    if [ -z "$last_updated" ]; then
      err "$name: _meta missing last_updated"
      continue
    fi

    # Staleness check (advisory)
    staleness_days=$(python3 -c "import json; d=json.load(open('$f')); print(d['_meta'].get('staleness_days',''))" 2>/dev/null)
    if [ -n "$staleness_days" ]; then
      age=$(python3 -c "
import datetime as dt
try:
    d = dt.date.fromisoformat('$last_updated')
    print((dt.date.today() - d).days)
except Exception:
    print(-1)
" 2>/dev/null)
      if [ "$age" -gt "$staleness_days" ] 2>/dev/null; then
        warn "$name: stale ($age days old, staleness_days=$staleness_days)"
      else
        ok "$name: OK (updated $last_updated, ${age}d old)"
      fi
    else
      ok "$name: OK (updated $last_updated, no staleness_days set)"
    fi
  done
  shopt -u nullglob
fi

# ---------- 3. Skills ----------
section "Skills (skills/*/SKILL.md)"
if [ ! -d skills ]; then
  err "skills/ directory missing"
else
  shopt -s nullglob
  found_any=0
  for d in skills/*/; do
    found_any=1
    name=$(basename "$d")
    skill_file="${d}SKILL.md"

    if [ ! -f "$skill_file" ]; then
      err "skills/$name: missing SKILL.md"
      continue
    fi

    # Frontmatter must start with --- and contain name + description
    head1=$(head -n 1 "$skill_file")
    if [ "$head1" != "---" ]; then
      err "skills/$name/SKILL.md: missing frontmatter opener (---)"
      continue
    fi

    # Extract frontmatter block
    fm=$(awk '/^---$/{c++; next} c==1' "$skill_file")
    if ! echo "$fm" | grep -q '^name:'; then
      err "skills/$name/SKILL.md: frontmatter missing 'name:'"
      continue
    fi
    if ! echo "$fm" | grep -q '^description:'; then
      err "skills/$name/SKILL.md: frontmatter missing 'description:'"
      continue
    fi

    # Name field should match dir name
    fm_name=$(echo "$fm" | awk -F': *' '/^name:/ {print $2; exit}' | tr -d '"' | tr -d "'")
    if [ "$fm_name" != "$name" ]; then
      warn "skills/$name/SKILL.md: frontmatter name '$fm_name' != dir name '$name'"
    fi

    # Description length sanity
    desc=$(echo "$fm" | awk -F': *' '/^description:/ {print $2; exit}')
    desc_len=${#desc}
    if [ "$desc_len" -lt 30 ]; then
      warn "skills/$name/SKILL.md: description very short ($desc_len chars)"
    elif [ "$desc_len" -gt 500 ]; then
      warn "skills/$name/SKILL.md: description very long ($desc_len chars)"
    fi

    # Body size sanity
    body_lines=$(wc -l < "$skill_file" | tr -d ' ')
    if [ "$body_lines" -gt 500 ]; then
      warn "skills/$name/SKILL.md: $body_lines lines (large; split if possible)"
    fi

    ok "skills/$name OK ($body_lines lines)"
  done
  shopt -u nullglob
  if [ "$found_any" -eq 0 ]; then
    warn "skills/ exists but contains no SKILL.md files"
  fi
fi

# ---------- 4. Plugin manifest ----------
section "Plugin manifest"
if [ -f .claude-plugin/plugin.json ]; then
  if python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" 2>/dev/null; then
    ok ".claude-plugin/plugin.json valid JSON"
  else
    err ".claude-plugin/plugin.json invalid JSON"
  fi
else
  err ".claude-plugin/plugin.json missing"
fi
if [ -f .claude-plugin/marketplace.json ]; then
  if python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" 2>/dev/null; then
    ok ".claude-plugin/marketplace.json valid JSON"
  else
    err ".claude-plugin/marketplace.json invalid JSON"
  fi
else
  warn ".claude-plugin/marketplace.json missing"
fi

# ---------- 5. .gitignore guards ----------
section ".gitignore safety"
if grep -q 'profile.json' .gitignore 2>/dev/null; then
  ok "profile.json is gitignored"
else
  err "profile.json NOT gitignored — user data could leak into commits"
fi
if grep -qE '^\.env$' .gitignore 2>/dev/null; then
  ok ".env is gitignored"
else
  warn ".env not in .gitignore"
fi

# ---------- summary ----------
section "Summary"
printf "  passed: %d\n  warnings: %d\n  failures: %d\n" "$PASS" "$WARN" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
