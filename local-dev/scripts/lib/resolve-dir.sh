#!/usr/bin/env bash
# Sets __SLUG_UPPER___SCRIPT_DIR using $__SLUG_UPPER___HOME (set by install.sh in shell profile).
# Source this at the top of any cmd script.

if [ -z "${__SLUG_UPPER___HOME:-}" ]; then
  echo "Error: __SLUG_UPPER___HOME is not set. Run 'npm install -g' from the repo root and source your shell profile." >&2
  exit 1
fi

__SLUG_UPPER___SCRIPT_DIR="$__SLUG_UPPER___HOME"
export __SLUG_UPPER___SCRIPT_DIR
