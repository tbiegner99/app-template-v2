#!/usr/bin/env bash
# env.sh — loads .env, exports credentials, detects unsupported platforms

___SLUG___env_resolve_dir() {
  local src="${BASH_SOURCE[0]}"
  while [ -L "$src" ]; do
    local dir
    dir="$(cd -P "$(dirname "$src")" && pwd)"
    src="$(readlink "$src")"
    [[ "$src" != /* ]] && src="$dir/$src"
  done
  cd -P "$(dirname "$src")" && pwd
}
# Use a private variable so we don't clobber __SLUG_UPPER___SCRIPT_DIR set by __SLUG__.sh
___SLUG_UPPER___ENV_LIB_DIR="$(___SLUG___env_resolve_dir)"
__SLUG_UPPER___LOCAL_DEV="$(cd "$___SLUG_UPPER___ENV_LIB_DIR/../.." && pwd)"
__SLUG_UPPER___REPO_ROOT="$(cd "$__SLUG_UPPER___LOCAL_DEV/.." && pwd)"

___SLUG___check_platform() {
  case "$(uname -s 2>/dev/null)" in
    CYGWIN*|MINGW*|MSYS*|Windows_NT)
      echo "Error: __SLUG__ is not supported on Windows. Use bash or zsh on macOS or Linux." >&2
      exit 1
      ;;
  esac
  if [ -n "${WINDIR:-}" ] || [ -n "${SystemRoot:-}" ]; then
    echo "Error: __SLUG__ is not supported on Windows. Use bash or zsh on macOS or Linux." >&2
    exit 1
  fi
}

___SLUG___load_env() {
  local env_file="$__SLUG_UPPER___LOCAL_DEV/.env"
  local example_file="$__SLUG_UPPER___LOCAL_DEV/.env.example"

  if [ -f "$env_file" ]; then
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
  elif [ -f "$example_file" ]; then
    echo "[__SLUG__] Warning: local-dev/.env not found. Using defaults from .env.example." >&2
    # shellcheck disable=SC1090
    set -a; source "$example_file"; set +a
  fi

  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_NAME="${DB_NAME:-__SLUG___local}"
  DB_USER="${DB_USER:-__SLUG__}"
  DB_PASS="${DB_PASS:-__SLUG___local_pass}"
  UI_PORT="${UI_PORT:-8000}"
  CONTROL_CENTER_DEV_PORT="${CONTROL_CENTER_DEV_PORT:-3000}"

  export DB_HOST DB_PORT DB_NAME DB_USER DB_PASS UI_PORT CONTROL_CENTER_DEV_PORT
  export __SLUG_UPPER___REPO_ROOT __SLUG_UPPER___LOCAL_DEV
}

___SLUG___check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop and try again." >&2
    exit 2
  fi
}

___SLUG___check_platform
___SLUG___load_env
