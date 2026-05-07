#!/usr/bin/env bash
# setup.sh — one-time toolkit setup.
# - install git hooks (sync-agent on CLAUDE.md edits)
# - create profile.json from template if missing
# - validate everything

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Installing git hooks..."
bash scripts/install-hooks.sh

echo "==> Checking profile.json..."
PROFILE_PATH="${CARD_HACKER_PROFILE_PATH:-$REPO_ROOT/profile.json}"
if [ -f "$PROFILE_PATH" ]; then
  echo "    Profile exists at: $PROFILE_PATH"
else
  echo "    Profile does NOT exist yet."
  echo "    Run /credit-card-hacker:getting-started in Claude Code to build it."
fi

echo "==> Running smoke test..."
if bash scripts/smoke-test.sh; then
  echo ""
  echo "✅ Setup complete."
  echo ""
  echo "Next steps:"
  echo "  1. Open this repo in Claude Code (claude .)"
  echo "  2. Run /credit-card-hacker:getting-started to build your profile"
  echo "  3. Optionally: bash scripts/setup-keys.sh — to wire up AwardWallet API key"
  echo "  4. Then: ask 'what card should I get next?'"
else
  echo ""
  echo "⚠️  Smoke test had failures — check output above."
  exit 1
fi
