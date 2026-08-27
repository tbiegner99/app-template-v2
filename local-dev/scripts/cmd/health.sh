#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: __SLUG__ health <container|all>" >&2; exit 1
fi
TARGET=$(resolve_alias "$TARGET")

___SLUG___check_docker

_check_one() {
  local name="$1"
  local state health symbol
  state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null) || state="not found"
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}-{{end}}' "$name" 2>/dev/null) || health="-"
  if [ "$state" = "running" ]; then symbol="✓"; else symbol="✗"; fi
  printf "[%s] %-20s %-10s (%s)\n" "$symbol" "$name" "$state" "$health"
}

overall=0
if [ "$TARGET" = "all" ]; then
  for name in $(list_containers); do
    state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null) || state="not found"
    _check_one "$name"
    [ "$state" = "running" ] || overall=1
  done
else
  resolve_container "$TARGET" >/dev/null || exit 1
  state=$(docker inspect --format '{{.State.Status}}' "$TARGET" 2>/dev/null) || state="not found"
  _check_one "$TARGET"
  [ "$state" = "running" ] || overall=1
fi

exit $overall
