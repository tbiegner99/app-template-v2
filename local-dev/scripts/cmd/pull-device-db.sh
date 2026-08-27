#!/usr/bin/env bash
set -eo pipefail
source "$__SLUG_UPPER___HOME/lib/resolve-dir.sh"
source "$__SLUG_UPPER___SCRIPT_DIR/lib/env.sh"

ANDROID_PACKAGE="com.mineSafe.mobile"
IOS_BUNDLE_ID="com.mineSafe.mobile"
DB_NAME="app.db"
OUTPUT_FILE="$PWD/__SLUG__-$(date +%Y%m%d-%H%M%S).db"
OPEN_AFTER=false
ADB_SERIAL=""
IOS_DEVICE=""
IOS=false

usage() {
  cat <<EOF
Usage: __SLUG__ pull-device-db [options]

Options:
  -ios         Pull from iOS device/simulator (default: Android)
  -o           Open the database file after pulling
  -s <id>      Device serial (Android) or UDID/name (iOS)
  -h           Show this help

Examples:
  __SLUG__ pddb
  __SLUG__ pddb -ios -o
  __SLUG__ pddb -ios -s "Thomas's iPad" -o
  __SLUG__ pddb -s emulator-5554 -o
EOF
}

# Pre-scan for -ios before getopts (getopts doesn't handle multi-char flags)
args=()
for arg in "$@"; do
  if [ "$arg" = "-ios" ]; then
    IOS=true
  else
    args+=("$arg")
  fi
done
set -- "${args[@]+"${args[@]}"}"

while getopts "os:h" opt; do
  case "$opt" in
    o) OPEN_AFTER=true ;;
    s) ADB_SERIAL="$OPTARG"; IOS_DEVICE="$OPTARG" ;;
    h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

_pull_ios() {
  # Prefer booted simulator (faster, no trust prompt)
  if xcrun simctl list devices 2>/dev/null | grep -q "Booted"; then
    echo "Pulling from booted iOS simulator..."
    local container
    container="$(xcrun simctl get_app_container booted "$IOS_BUNDLE_ID" data 2>/dev/null)" \
      || { echo "Error: app '$IOS_BUNDLE_ID' not found on booted simulator." >&2; exit 1; }
    local db_path
    db_path="$(find "$container" -name "$DB_NAME" 2>/dev/null | head -1)"
    [ -n "$db_path" ] || { echo "Error: $DB_NAME not found in simulator container." >&2; exit 1; }
    cp "$db_path" "$OUTPUT_FILE"
    return
  fi

  # Real device via devicectl (Xcode 15+)
  local device_list
  device_list="$(xcrun devicectl list devices 2>/dev/null)"

  local udid=""
  if [ -n "$IOS_DEVICE" ]; then
    if echo "$IOS_DEVICE" | grep -qE '^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$'; then
      udid="$IOS_DEVICE"
    else
      udid="$(echo "$device_list" | grep -F "$IOS_DEVICE" | grep -Eo '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' | head -1 || true)"
      [ -n "$udid" ] || { echo "Error: no device found matching '$IOS_DEVICE'." >&2; exit 1; }
    fi
  else
    udid="$(echo "$device_list" | grep -Eo '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' | head -1 || true)"
  fi

  [ -n "$udid" ] || { echo "Error: no iOS device found. Connect a device or boot a simulator." >&2; exit 1; }

  local device_label=""
  device_label="$(echo "$device_list" | grep "$udid" | sed 's/  */ /g' | cut -d' ' -f1-2 | xargs || true)"
  echo "Pulling from iOS device: ${device_label:-$udid}..."

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT

  xcrun devicectl device copy from \
    --device "$udid" \
    --domain-type appDataContainer \
    --domain-identifier "$IOS_BUNDLE_ID" \
    --source "." \
    --destination "$tmp_dir" \
    || { echo "Error: could not copy app container. Is the app installed?" >&2; exit 1; }

  local db_path=""
  db_path="$(find "$tmp_dir" -name "$DB_NAME" 2>/dev/null | head -1 || true)"
  [ -n "$db_path" ] || { echo "Error: $DB_NAME not found in app container." >&2; exit 1; }
  cp "$db_path" "$OUTPUT_FILE"
}

_pull_android() {
  if ! command -v adb >/dev/null 2>&1; then
    echo "Error: adb not found. Ensure Android SDK platform-tools is in PATH." >&2
    exit 1
  fi

  local adb_args=()
  [ -n "$ADB_SERIAL" ] && adb_args+=(-s "$ADB_SERIAL")

  adb "${adb_args[@]+"${adb_args[@]}"}" devices 2>/dev/null | grep -q "device$" \
    || { echo "Error: no Android device connected." >&2; exit 1; }

  echo "Pulling from Android device..."
  local device_path="/data/data/$ANDROID_PACKAGE/databases/$DB_NAME"

  adb "${adb_args[@]+"${adb_args[@]}"}" shell "run-as $ANDROID_PACKAGE cp $device_path /sdcard/$DB_NAME" \
    || { echo "Error: could not access app database. Is the app installed and debuggable?" >&2; exit 1; }

  adb "${adb_args[@]+"${adb_args[@]}"}" pull "/sdcard/$DB_NAME" "$OUTPUT_FILE"
  adb "${adb_args[@]+"${adb_args[@]}"}" shell "rm /sdcard/$DB_NAME" 2>/dev/null || true
}

if $IOS; then
  _pull_ios
else
  _pull_android
fi

echo "Saved to: $OUTPUT_FILE"
$OPEN_AFTER && open "$OUTPUT_FILE" || true
