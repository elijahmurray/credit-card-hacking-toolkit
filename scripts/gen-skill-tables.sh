#!/usr/bin/env bash
# gen-skill-tables.sh — auto-generate the skill table for README.md from
# skill frontmatter. Replaces content between <!-- SKILLS:START --> and
# <!-- SKILLS:END --> markers in README.md.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

README="$REPO_ROOT/README.md"
SKILLS_DIR="$REPO_ROOT/skills"

if [ ! -f "$README" ]; then
  echo "ERROR: README.md not found." >&2
  exit 1
fi

if [ ! -d "$SKILLS_DIR" ]; then
  echo "ERROR: skills/ not found." >&2
  exit 1
fi

# Build the table content via python3 for cleaner frontmatter parsing
TABLE=$(python3 - <<'PY'
import os, re, sys

skills_dir = "skills"
rows = []
for name in sorted(os.listdir(skills_dir)):
    skill_path = os.path.join(skills_dir, name, "SKILL.md")
    if not os.path.isfile(skill_path):
        continue
    with open(skill_path) as f:
        body = f.read()
    m = re.match(r'^---\s*\n(.*?)\n---', body, re.DOTALL)
    if not m:
        continue
    fm = m.group(1)
    name_match = re.search(r'^name:\s*(.+)$', fm, re.MULTILINE)
    desc_match = re.search(r'^description:\s*(.+?)(?=\n[a-z_]+:|\Z)', fm, re.MULTILINE | re.DOTALL)
    if not (name_match and desc_match):
        continue
    skill_name = name_match.group(1).strip()
    desc = desc_match.group(1).strip().replace('\n', ' ')
    desc = re.sub(r'\s+', ' ', desc)
    if len(desc) > 220:
        desc = desc[:217] + '...'
    rows.append((skill_name, desc))

print('| Skill | Description |')
print('|---|---|')
for name, desc in rows:
    desc_md = desc.replace('|', '\\|')
    print(f'| `{name}` | {desc_md} |')
PY
)

# Replace between markers
python3 - "$README" <<PY
import re, sys
path = "$README"
with open(path) as f:
    content = f.read()
table = '''$TABLE'''
new = re.sub(
    r'(<!-- SKILLS:START -->)(.*?)(<!-- SKILLS:END -->)',
    lambda m: m.group(1) + '\n' + table + '\n' + m.group(3),
    content,
    flags=re.DOTALL,
)
if new == content:
    print('WARN: SKILLS:START / SKILLS:END markers not found in README.md — table not inserted.', file=sys.stderr)
    sys.exit(1)
with open(path, 'w') as f:
    f.write(new)
print('Updated skill table in README.md')
PY
