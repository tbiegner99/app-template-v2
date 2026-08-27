#!/usr/bin/env bash
set -euo pipefail

SUPERTOKENS_URL="${SUPERTOKENS_URL:-http://localhost:3567}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@local.dev}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin1234!}"

# Check if user already exists
existing=$(curl -sf "${SUPERTOKENS_URL}/recipe/user?email=${ADMIN_EMAIL}" \
  -H "Content-Type: application/json" 2>/dev/null || echo '{"status":"USER_NOT_FOUND"}')

if echo "$existing" | grep -q '"status":"OK"'; then
  echo "[seed-auth] User ${ADMIN_EMAIL} already exists — skipping."
  exit 0
fi

# Create the user via SuperTokens signup API
result=$(curl -sf -X POST "${SUPERTOKENS_URL}/recipe/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

if echo "$result" | grep -q '"status":"OK"'; then
  user_id=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])")
  echo "[seed-auth] Created user ${ADMIN_EMAIL} with SuperTokens ID: ${user_id}"
else
  echo "[seed-auth] Failed to create user: $result" >&2
  exit 1
fi
