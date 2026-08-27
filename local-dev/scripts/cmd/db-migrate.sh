#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

___SLUG___check_docker

_pg=$(resolve_alias postgres)
docker inspect --format '{{.State.Status}}' "$_pg" 2>/dev/null | grep -q "running" \
  || { echo "postgres container is not running — run: __SLUG__ start $_pg" >&2; exit 1; }

echo "Running Liquibase migrations..."
docker run --rm \
  --network host \
  -v "$__SLUG_UPPER___REPO_ROOT/database:/liquibase/changelog" \
  liquibase/liquibase \
  --url="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME" \
  --username="$DB_USER" \
  --password="$DB_PASS" \
  --search-path=/liquibase/changelog \
  --changelog-file=changelog-master.xml \
  update

echo "Migrations complete."
