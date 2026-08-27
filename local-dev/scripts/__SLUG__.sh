#!/usr/bin/env bash
# __SLUG__ — __DISPLAY_NAME__ local dev environment manager

# Resolve symlinks so this works when invoked via npm global bin symlink
___SLUG___resolve_dir() {
  local src="${BASH_SOURCE[0]}"
  while [ -L "$src" ]; do
    local dir
    dir="$(cd -P "$(dirname "$src")" && pwd)"
    src="$(readlink "$src")"
    [[ "$src" != /* ]] && src="$dir/$src"
  done
  cd -P "$(dirname "$src")" && pwd
}
__SLUG_UPPER___SCRIPT_DIR="$(___SLUG___resolve_dir)"
export __SLUG_UPPER___SCRIPT_DIR

# env.sh: platform check + .env loading, no docker calls
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"

___SLUG___help() {
  cat <<'EOF'

__SLUG__ — __DISPLAY_NAME__ local dev environment manager

Usage:
  __SLUG__ <command> [target]

Commands:
  start    | s     <container|all>   Start one or all containers
  stop     | x     <container|all>   Stop one or all containers
  restart  | r     <container> [...]|all   Restart one, many, or all containers
  rebuild  | rb    <container> [...]|all   Rebuild and restart one, many, or all containers
  logs     | l     <container>       Follow log output for a container
  health   | h     <container|all>   Report health status of containers
  reset-db | rdb | dbr               Drop, reseed, and migrate the local database
  db-migrate | dbm                   Run Liquibase migrations without resetting the database
  pull-device-db | pddb  [-o] [-s <serial>]  Pull app.db from connected device to current directory
  devices        | ld                        List connected iOS and Android devices
  build-web | bw  [app]              Build a web app and restart the ui container
  alias    | a     <alias> <container>       Add a short-name container alias
  alias    | a     add <alias> <container>   Add a short-name container alias
  alias    | a     remove <alias>            Remove a container alias
  alias    | a     list                      List configured container aliases
  help     | --help | -h             Show this help text

Examples:
  __SLUG__ start all              __SLUG__ s all
  __SLUG__ stop ui                __SLUG__ x ui
  __SLUG__ restart backend        __SLUG__ r be
  __SLUG__ rebuild ui             __SLUG__ rb ui
  __SLUG__ logs backend           __SLUG__ l be
  __SLUG__ health all             __SLUG__ h db
  __SLUG__ reset-db                     __SLUG__ rdb
  __SLUG__ db-migrate                   __SLUG__ dbm
  __SLUG__ pull-device-db               __SLUG__ pddb -o -s emulator-5554
  __SLUG__ build-web                    __SLUG__ bw control-center
  __SLUG__ alias list                   __SLUG__ a list
  __SLUG__ alias add cache __SLUG__-redis
  __SLUG__ a cache __SLUG__-redis       (implicit add, same as above)
  __SLUG__ alias remove cache           __SLUG__ a remove cache

Default aliases: ui, be, backend, db, postgres, supertokens, auth —
see local-dev/scripts/container-aliases.conf.

EOF
}

___SLUG___run_cmd() {
  local cmd="$1"
  shift
  local cmd_file="$__SLUG_UPPER___SCRIPT_DIR/cmd/${cmd}.sh"
  if [ ! -f "$cmd_file" ]; then
    echo "Error: command script not found: $cmd_file" >&2
    exit 1
  fi
  bash "$cmd_file" "$@"
}

CMD="${1:-}"

case "$CMD" in
  start|s)          shift; ___SLUG___run_cmd start "$@" ;;
  stop|x)           shift; ___SLUG___run_cmd stop "$@" ;;
  restart|r)        shift; ___SLUG___run_cmd restart "$@" ;;
  rebuild|rb)       shift; ___SLUG___run_cmd rebuild "$@" ;;
  logs|l)           shift; ___SLUG___run_cmd logs "$@" ;;
  health|h)         shift; ___SLUG___run_cmd health "$@" ;;
  reset-db|rdb|dbr) ___SLUG___run_cmd reset-db ;;
  db-migrate|dbm)      ___SLUG___run_cmd db-migrate ;;
  pull-device-db|pddb) shift; ___SLUG___run_cmd pull-device-db "$@" ;;
  devices|ld)          ___SLUG___run_cmd devices ;;
  build-web|bw)     shift; ___SLUG___run_cmd build-web "$@" ;;
  alias|a)          shift; ___SLUG___run_cmd alias "$@" ;;
  help|--help|-h)   ___SLUG___help; exit 0 ;;
  "")               ___SLUG___help; exit 0 ;;
  *)
    echo "Error: unknown command '$CMD'" >&2
    ___SLUG___help
    exit 1
    ;;
esac
