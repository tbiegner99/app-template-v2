#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

___SLUG___check_docker

APP="${1:-control-center}"
WEB_DIR="$__SLUG_UPPER___REPO_ROOT/web/apps/$APP"

if [ ! -d "$WEB_DIR" ]; then
  echo "Error: web app '$APP' not found at $WEB_DIR" >&2
  exit 1
fi

echo "[__SLUG__] Building $APP..."
(cd "$WEB_DIR" && npm run build)

echo "[__SLUG__] Restarting ui container..."
compose_file=$(resolve_container "$(resolve_alias ui)") || exit 1
dir="$(dirname "$compose_file")"
docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" restart ui

echo "[__SLUG__] $APP built and ui restarted."
