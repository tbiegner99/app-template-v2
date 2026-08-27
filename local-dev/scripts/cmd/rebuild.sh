#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

if [ $# -eq 0 ]; then
  echo "Usage: __SLUG__ rebuild <container> [container...] | all" >&2; exit 1
fi

___SLUG___check_docker

docker network inspect __SLUG__-local >/dev/null 2>&1 \
  || docker network create __SLUG__-local

_rebuild_one() {
  local name
  name=$(resolve_alias "$1")
  local compose_file service dir
  compose_file=$(resolve_container "$name") || exit 1
  service=$(resolve_service "$name")
  dir="$(dirname "$compose_file")"
  echo "[__SLUG__] Rebuilding $name..."
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" rm -sf "$service"
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" up -d --build "$service"
  echo "[__SLUG__] $name rebuilt and started."
}

if [ "${1:-}" = "all" ]; then
  for f in "${___SLUG_UPPER___COMPOSE_FILES[@]+"${___SLUG_UPPER___COMPOSE_FILES[@]}"}"; do
    dir="$(dirname "$f")"
    echo "[__SLUG__] Rebuilding $(basename "$f")..."
    docker compose --project-name __SLUG__ --project-directory "$dir" -f "$f" rm -sf
    docker compose --project-name __SLUG__ --project-directory "$dir" -f "$f" up -d --build
  done
else
  for target in "$@"; do
    _rebuild_one "$target"
  done
fi
