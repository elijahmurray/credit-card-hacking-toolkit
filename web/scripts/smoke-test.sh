#!/usr/bin/env bash
# smoke-test.sh — verify the web app boots and routes respond correctly with
# placeholder env vars. Doesn't test external services (Supabase/Anthropic/Stripe);
# just confirms the build + middleware + auth gating work end-to-end.
#
# Run: bash scripts/smoke-test.sh

set -u
cd "$(dirname "$0")/.."

PORT=${PORT:-3099}
PASS=0
FAIL=0
ok()  { printf "  \033[32m✓\033[0m %s\n" "$1"; PASS=$((PASS+1)); }
err() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAIL=$((FAIL+1)); }

# 1. typecheck
printf "\n\033[1mTypecheck\033[0m\n"
if npx tsc --noEmit > /tmp/tsc.log 2>&1; then
  ok "tsc --noEmit (0 errors)"
else
  err "tsc --noEmit failed:"
  tail -20 /tmp/tsc.log
  exit 1
fi

# 2. build (warns on .skills/ + Next deprecation but should succeed)
printf "\n\033[1mBuild\033[0m\n"
if NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
   SUPABASE_SERVICE_ROLE_KEY=placeholder \
   ANTHROPIC_API_KEY=placeholder \
   STRIPE_SECRET_KEY=sk_test_placeholder \
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder \
   STRIPE_WEBHOOK_SECRET=whsec_placeholder \
   STRIPE_PRICE_ID_PRO=price_placeholder \
   STRIPE_PRICE_ID_POWER=price_placeholder \
   NEXT_PUBLIC_APP_URL=http://localhost:3000 \
   npx next build > /tmp/build.log 2>&1; then
  ok "next build (all routes compiled)"
else
  err "next build failed:"
  tail -20 /tmp/build.log
  exit 1
fi

# 3. dev server + route smoke
printf "\n\033[1mDev server route checks\033[0m\n"
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
SUPABASE_SERVICE_ROLE_KEY=placeholder \
ANTHROPIC_API_KEY=placeholder \
STRIPE_SECRET_KEY=sk_test_placeholder \
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder \
STRIPE_WEBHOOK_SECRET=whsec_placeholder \
STRIPE_PRICE_ID_PRO=price_placeholder \
STRIPE_PRICE_ID_POWER=price_placeholder \
NEXT_PUBLIC_APP_URL=http://localhost:$PORT \
PORT=$PORT \
npx next dev --turbopack > /tmp/devlog.txt 2>&1 &
DEV_PID=$!

# Wait up to 20s for ready
for _ in 1 2 3 4 5 6 7 8 9 10; do
  sleep 2
  if /usr/bin/curl -sf -o /dev/null "http://localhost:$PORT/"; then
    break
  fi
done

check_route() {
  local path=$1 expected=$2 label=$3
  local rc
  rc=$(/usr/bin/curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$path")
  if [ "$rc" = "$expected" ]; then
    ok "$path → $rc ($label)"
  else
    err "$path → $rc, expected $expected ($label)"
  fi
}

# Public routes
check_route "/"        "200" "landing"
check_route "/login"   "200" "login form"
check_route "/signup"  "200" "signup form"
check_route "/pricing" "200" "pricing page"

# Auth-gated → redirect to login
check_route "/chat"      "307" "redirect (no session)"
check_route "/dashboard" "307" "redirect (no session)"
check_route "/profile"   "307" "redirect (no session)"
check_route "/settings"  "307" "redirect (no session)"

# API routes — unauthenticated should 401
check_route "/api/usage" "401" "auth required"

kill $DEV_PID 2>/dev/null
wait 2>/dev/null

printf "\n\033[1mSummary\033[0m\n  passed: %d\n  failed: %d\n" "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
