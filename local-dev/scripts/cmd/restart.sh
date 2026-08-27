#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

if [ $# -eq 0 ]; then
  echo "Usage: __SLUG__ restart <container> [container...] | all" >&2; exit 1
fi

___SLUG___check_docker

_restart_one() {
  local name
  name=$(resolve_alias "$1")
  local compose_file service dir
  compose_file=$(resolve_container "$name") || exit 1
  service=$(resolve_service "$name")
  dir="$(dirname "$compose_file")"
  docker compose --project-name __SLUG__ --project-directory "$dir" -f "$compose_file" restart "$service"
}

if [ "${1:-}" = "all" ]; then
  for f in "${___SLUG_UPPER___COMPOSE_FILES[@]+"${___SLUG_UPPER___COMPOSE_FILES[@]}"}"; do
    dir="$(dirname "$f")"
    docker compose --project-name __SLUG__ --project-directory "$dir" -f "$f" restart
  done
else
  for target in "$@"; do
    _restart_one "$target"
  done
fi
