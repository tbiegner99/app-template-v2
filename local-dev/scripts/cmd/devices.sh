#!/usr/bin/env bash
set -eo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"

SHOW_ALL=false

for arg in "$@"; do
  case "$arg" in
    -A) SHOW_ALL=true ;;
    -h|--help)
      echo "Usage: __SLUG__ devices [-A]"
      echo "  -A   Include shutdown simulators and inactive Android devices"
      exit 0 ;;
  esac
done

printf "%-30s %-40s %-10s %s\n" "Name" "ID" "Platform" "Type"
printf "%-30s %-40s %-10s %s\n" "------------------------------" "----------------------------------------" "----------" "----"

# iOS real devices via devicectl
if command -v xcrun >/dev/null 2>&1; then
  local_filter="connected"
  $SHOW_ALL && local_filter="."

  while IFS= read -r line; do
    local_udid="$(echo "$line" | grep -Eo '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' | head -1 || true)"
    [ -n "$local_udid" ] || continue
    local_name="$(echo "$line" | sed "s/[[:space:]]*[^ ]*coredevice[^ ]*.*//" | xargs)"
    local_model="$(echo "$line" | grep -oE '\([^)]+\)$' | tr -d '()' || true)"
    printf "%-30s %-40s %-10s %s\n" "$local_name" "$local_udid" "iOS" "${local_model:-device}"
  done < <(xcrun devicectl list devices 2>/dev/null | grep -E "$local_filter" | grep -v "^[-= ]" || true)

  # iOS simulators
  local_sim_filter="Booted"
  $SHOW_ALL && local_sim_filter="Booted\|Shutdown"

  while IFS= read -r line; do
    local_udid="$(echo "$line" | grep -Eo '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' | head -1 || true)"
    [ -n "$local_udid" ] || continue
    local_name="$(echo "$line" | sed 's/ (.*//' | xargs)"
    local_state="$(echo "$line" | grep -oE '\([^)]+\)' | tail -1 | tr -d '()' || true)"
    printf "%-30s %-40s %-10s %s\n" "$local_name" "$local_udid" "iOS sim" "${local_state:-shutdown}"
  done < <(xcrun simctl list devices available 2>/dev/null | grep -E "$local_sim_filter" | grep -v "^==" || true)
fi

# Android devices via adb
if command -v adb >/dev/null 2>&1; then
  local_adb_filter="device$"
  $SHOW_ALL && local_adb_filter="device$\|offline\|unauthorized"

  while IFS= read -r line; do
    local_serial="$(echo "$line" | awk '{print $1}')"
    [ -n "$local_serial" ] || continue
    local_name="$(adb -s "$local_serial" shell getprop ro.product.model 2>/dev/null | tr -d '\r' || true)"
    local_type="$(adb -s "$local_serial" shell getprop ro.build.characteristics 2>/dev/null | tr -d '\r' || true)"
    printf "%-30s %-40s %-10s %s\n" "${local_name:-unknown}" "$local_serial" "Android" "${local_type:-device}"
  done < <(adb devices 2>/dev/null | grep -E "$local_adb_filter" || true)
fi
