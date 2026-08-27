#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: __SLUG__ stop <container|all>" >&2; exit 1
fi
TARGET=$(resolve_alias "$TARGET")

___SLUG___check_docker

if [ "$TARGET" = "all" ]; then
  for f in "${___SLUG_UPPER___COMPOSE_FILES[@]+"${___SLUG_UPPER___COMPOSE_FILES[@]}"}"; do
    dir="$(dirname "$f")"
    echo "[__SLUG__] Stopping $(basename "$f")..."
    docker compose --project-name __SLUG__ --project-directory "$dir" -f "$f" stop
  done
else
  compose_file=$(resolve_container "$TARGET") || exit 1
  service=$(resolve_service "$TARGET")
  dir="$(dirname "$compose_file")"
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" stop "$service"
fi
