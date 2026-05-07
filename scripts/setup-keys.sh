#!/usr/bin/env bash
# setup-keys.sh — interactive helper to populate .env with optional API keys.
# All keys are OPTIONAL. The toolkit works without any of them; keys unlock
# automation (AwardWallet balance sync, etc.).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f .env.example ]; then
  echo "ERROR: .env.example not found." >&2
  exit 1
fi

if [ -f .env ]; then
  echo ".env already exists. Edit it directly or delete it to start over."
  echo "Current keys set:"
  grep -E '^[A-Z_]+=' .env | cut -d= -f1 | sed 's/^/  - /'
  exit 0
fi

cp .env.example .env
chmod 600 .env

echo "Created .env from template (mode 600, gitignored)."
echo ""
echo "To enable AwardWallet balance sync:"
echo "  1. Sign up for AwardWallet+ at awardwallet.com (paid tier required for API access)"
echo "  2. Get API key at awardwallet.com/account/api"
echo "  3. Edit .env and set:"
echo "       AWARDWALLET_API_KEY=ak_live_..."
echo "       AWARDWALLET_USER_ID=12345"
echo "  4. Test with: bash scripts/refresh-balances.sh (when implemented)"
echo ""
echo "All keys are optional. Skip whatever you don't need."
