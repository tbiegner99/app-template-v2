#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: __SLUG__ start <container|all>" >&2; exit 1
fi
TARGET=$(resolve_alias "$TARGET")

___SLUG___check_docker

# Ensure shared network exists before starting any containers
docker network inspect __SLUG__-local >/dev/null 2>&1 \
  || docker network create __SLUG__-local

_start_file() {
  local f="$1"
  local dir
  dir="$(dirname "$f")"
  echo "[__SLUG__] Starting $(basename "$f")..."
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$f" up -d
}

if [ "$TARGET" = "all" ]; then
  for f in "${___SLUG_UPPER___COMPOSE_FILES[@]+"${___SLUG_UPPER___COMPOSE_FILES[@]}"}"; do
    _start_file "$f"
  done
else
  compose_file=$(resolve_container "$TARGET") || exit 1
  service=$(resolve_service "$TARGET")
  dir="$(dirname "$compose_file")"
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" up -d "$service"
fi
