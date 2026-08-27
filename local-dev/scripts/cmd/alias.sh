#!/usr/bin/env bash
set -euo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/compose.sh"

_usage() {
  echo "Usage: __SLUG__ alias <alias> <container>   (add, implicit)" >&2
  echo "       __SLUG__ alias add <alias> <container>" >&2
  echo "       __SLUG__ alias remove <alias>" >&2
  echo "       __SLUG__ alias list" >&2
  exit 1
}

_alias_list() {
  echo "Aliases (from $___SLUG_UPPER___ALIAS_FILE):"
  grep -Ev '^\s*(#|$)' "$___SLUG_UPPER___ALIAS_FILE" 2>/dev/null | while IFS= read -r line; do
    printf "  %s\n" "$line"
  done
}

_alias_add() {
  local name="$1" container="$2"
  if grep -qE "^${name}=" "$___SLUG_UPPER___ALIAS_FILE" 2>/dev/null; then
    echo "Error: alias '$name' already exists. Edit $___SLUG_UPPER___ALIAS_FILE directly to change it." >&2
    exit 1
  fi
  echo "${name}=${container}" >> "$___SLUG_UPPER___ALIAS_FILE"
  echo "Added alias: $name -> $container"
}

_alias_remove() {
  local name="$1" tmp
  if ! grep -qE "^${name}=" "$___SLUG_UPPER___ALIAS_FILE" 2>/dev/null; then
    echo "Error: alias '$name' does not exist." >&2
    exit 1
  fi
  tmp=$(mktemp)
  grep -vE "^${name}=" "$___SLUG_UPPER___ALIAS_FILE" > "$tmp"
  mv "$tmp" "$___SLUG_UPPER___ALIAS_FILE"
  echo "Removed alias: $name"
}

case $# in
  0)
    _alias_list
    ;;
  1)
    [ "$1" = "list" ] && _alias_list || _usage
    ;;
  2)
    case "$1" in
      list|add) _usage ;;
      remove|rm|delete) _alias_remove "$2" ;;
      *) _alias_add "$1" "$2" ;;
    esac
    ;;
  3)
    [ "$1" = "add" ] || _usage
    _alias_add "$2" "$3"
    ;;
  *)
    _usage
    ;;
esac
