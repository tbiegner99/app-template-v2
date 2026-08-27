#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: __SLUG__ logs <container>" >&2; exit 1
fi
TARGET=$(resolve_alias "$TARGET")

___SLUG___check_docker
resolve_container "$TARGET" >/dev/null || exit 1
docker logs -f "$TARGET"
