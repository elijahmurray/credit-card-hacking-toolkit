#!/usr/bin/env bash
# Install repo git hooks (idempotent — safe to re-run).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="$REPO_ROOT/scripts/hooks"
HOOK_DST="$REPO_ROOT/.git/hooks"

if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "ERROR: not a git repo (no .git/ at $REPO_ROOT)" >&2
  exit 1
fi

mkdir -p "$HOOK_DST"
for hook in "$HOOK_SRC"/*; do
  name="$(basename "$hook")"
  cp "$hook" "$HOOK_DST/$name"
  chmod +x "$HOOK_DST/$name"
  echo "Installed: $name"
done
