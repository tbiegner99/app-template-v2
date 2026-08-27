#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

_step() { printf "[%s/%s] %s... " "$1" "$2" "$3"; }
_ok()   { echo "[OK]"; }
_fail() { echo "[FAILED: $1]" >&2; exit 1; }

___SLUG___check_docker

PSQL=(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER")

_step 1 5 "Checking postgres container"
_pg=$(resolve_alias postgres)
docker inspect --format '{{.State.Status}}' "$_pg" 2>/dev/null | grep -q "running" \
  || _fail "postgres container is not running — run: __SLUG__ start $_pg"
_ok

_step 2 5 "Dropping database $DB_NAME"
# Terminate other backends first — DROP DATABASE fails while the app
# container still holds open connections to it. SuperTokens uses its own
# separate database (see docker-compose.supertokens.yml), so it's untouched
# by this reset.
PGPASSWORD="$DB_PASS" "${PSQL[@]}" -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
  >/dev/null 2>&1 || true
PGPASSWORD="$DB_PASS" "${PSQL[@]}" -d postgres \
  -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || _fail "could not drop database"
_ok

_step 3 5 "Recreating database $DB_NAME"
PGPASSWORD="$DB_PASS" "${PSQL[@]}" -d postgres \
  -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || _fail "could not create database"
_ok

_step 4 5 "Applying seed.sql"
PGPASSWORD="$DB_PASS" "${PSQL[@]}" -d "$DB_NAME" \
  -f "$__SLUG_UPPER___LOCAL_DEV/seed.sql" 2>/dev/null || _fail "seed.sql failed"
_ok

echo "[5/5] Running Liquibase migrations..."
docker run --rm \
  --network host \
  -v "$__SLUG_UPPER___REPO_ROOT/database:/liquibase/changelog" \
  liquibase/liquibase \
  --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
  --username="$DB_USER" \
  --password="$DB_PASS" \
  --search-path=/liquibase/changelog \
  --changelog-file=changelog-master.xml \
  update || _fail "Liquibase migration failed"

echo ""
echo "Database reset complete."
