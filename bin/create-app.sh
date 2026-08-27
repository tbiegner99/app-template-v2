#!/usr/bin/env bash
# create-app.sh — scaffold a new project from this template.
#
# Usage: bin/create-app.sh /path/to/new-project
#
# Prompts for project identity, copies this template into the target
# directory, substitutes identity tokens, prunes unselected modules, and
# optionally merges in the ble_alerts hardware module.

set -euo pipefail

TEMPLATE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"

if [ -z "$TARGET" ]; then
  echo "Usage: $0 /path/to/new-project" >&2
  exit 1
fi
if [ -e "$TARGET" ]; then
  echo "Error: $TARGET already exists" >&2
  exit 1
fi

read -rp "Display name (e.g. \"Acme Field Ops\"): " DISPLAY_NAME
DEFAULT_SLUG="$(echo "$DISPLAY_NAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/^_//;s/_$//')"
read -rp "Slug [$DEFAULT_SLUG]: " SLUG
SLUG="${SLUG:-$DEFAULT_SLUG}"
if ! [[ "$SLUG" =~ ^[a-z][a-z0-9_]*$ ]]; then
  echo "Error: slug must be lowercase, start with a letter, and contain only letters/numbers/underscores" >&2
  exit 1
fi

read -rp "Bundle ID prefix (e.g. com.acme) [com.example]: " BUNDLE_PREFIX
BUNDLE_PREFIX="${BUNDLE_PREFIX:-com.example}"

read -rp "Include mobile app? [Y/n]: " INCLUDE_MOBILE
INCLUDE_MOBILE="${INCLUDE_MOBILE:-Y}"
read -rp "Include web app? [Y/n]: " INCLUDE_WEB
INCLUDE_WEB="${INCLUDE_WEB:-Y}"
read -rp "Include backend? [Y/n]: " INCLUDE_BACKEND
INCLUDE_BACKEND="${INCLUDE_BACKEND:-Y}"

BACKEND_LANG="go"
if [[ "$INCLUDE_BACKEND" =~ ^[Yy] ]]; then
  read -rp "Backend language: [G]o / [N]ode [G]: " BACKEND_LANG_CHOICE
  BACKEND_LANG_CHOICE="${BACKEND_LANG_CHOICE:-G}"
  if [[ "$BACKEND_LANG_CHOICE" =~ ^[Nn] ]]; then
    BACKEND_LANG="node"
  fi
fi

INCLUDE_BLE_ALERTS="n"
if [[ "$INCLUDE_MOBILE" =~ ^[Yy] ]]; then
  read -rp "Include BLE + hardware alerts module (mobile)? [y/N]: " INCLUDE_BLE_ALERTS
  INCLUDE_BLE_ALERTS="${INCLUDE_BLE_ALERTS:-n}"
fi

read -rp "Start from a blank scaffold (no migrations, no auth/notifications/testapi domains, no SuperTokens)? [y/N]: " BLANK_SCAFFOLD
BLANK_SCAFFOLD="${BLANK_SCAFFOLD:-n}"

SLUG_UPPER="$(echo "$SLUG" | tr '[:lower:]' '[:upper:]')"
SLUG_TITLE="$(echo "$SLUG" | sed 's/^\(.\)/\U\1/')"
SLUG_INITIAL="$(echo "$SLUG" | cut -c1 | tr '[:lower:]' '[:upper:]')"

echo
echo "Creating $TARGET"
echo "  display name: $DISPLAY_NAME"
echo "  slug:         $SLUG"
echo "  bundle id:    $BUNDLE_PREFIX.$SLUG"
echo

mkdir -p "$TARGET"
rsync -a --exclude '.git' --exclude 'bin' --exclude 'node_modules' --exclude 'dist' "$TEMPLATE_ROOT/" "$TARGET/"

# --- module pruning ---
[[ "$INCLUDE_MOBILE" =~ ^[Yy] ]] || rm -rf "$TARGET/mobile"
[[ "$INCLUDE_WEB" =~ ^[Yy] ]] || rm -rf "$TARGET/web"
[[ "$INCLUDE_BACKEND" =~ ^[Yy] ]] || rm -rf "$TARGET/backend"

# --- backend language selection: exactly one of backend/__SLUG__ (Go) or
# backend/__SLUG___node (Node) survives, both ending up at backend/$SLUG ---
if [ -d "$TARGET/backend" ]; then
  if [ "$BACKEND_LANG" = "node" ]; then
    rm -rf "$TARGET/backend/__SLUG__"
    mv "$TARGET/backend/__SLUG___node" "$TARGET/backend/__SLUG__"
  else
    rm -rf "$TARGET/backend/__SLUG___node"
  fi
fi

# --- blank scaffold: strip migrations, SuperTokens, and the
# auth/notifications/testapi domains, keeping only health ---
if [[ "$BLANK_SCAFFOLD" =~ ^[Yy] ]]; then
  echo "Stripping to a blank scaffold (no auth/notifications/testapi, no SuperTokens)..."

  # database migrations: empty the changelog and remove migration files
  if [ -d "$TARGET/database" ]; then
    rm -f "$TARGET/database/migrations"/*.sql
    python3 - "$TARGET/database/changelog-master.xml" <<'PYEOF'
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(r'\n\s*<include file="migrations/[^"]+"/>', '', content)
with open(path, "w") as f:
    f.write(content)
PYEOF
  fi

  # local-dev: drop the SuperTokens container
  rm -f "$TARGET/local-dev/docker-compose.supertokens.yml"

  # backend: drop auth/notifications/testapi and swap in the blank entrypoint
  if [ -d "$TARGET/backend/__SLUG__" ]; then
    BACKEND_DIR="$TARGET/backend/__SLUG__"
    rm -rf "$BACKEND_DIR/src/domains/auth" "$BACKEND_DIR/src/domains/notifications" "$BACKEND_DIR/src/domains/testapi"
    if [ "$BACKEND_LANG" = "node" ]; then
      rm -f "$BACKEND_DIR/src/main.ts"
      mv "$BACKEND_DIR/src/main.blank.ts" "$BACKEND_DIR/src/main.ts"
    else
      rm -f "$BACKEND_DIR/src/main.go"
      mv "$BACKEND_DIR/src/main.blank.go" "$BACKEND_DIR/src/main.go"
    fi
    # SuperTokens/Firebase env vars are only used by the domains just removed
    if [ -f "$BACKEND_DIR/.env.example" ]; then
      grep -vE '^(FIREBASE_|SUPERTOKENS_|SYSTEM_ACTOR_KEY|API_DOMAIN|WEBSITE_DOMAIN)' \
        "$BACKEND_DIR/.env.example" > "$BACKEND_DIR/.env.example.tmp" || true
      mv "$BACKEND_DIR/.env.example.tmp" "$BACKEND_DIR/.env.example"
    fi
  fi
fi

# the non-blank path never uses the blank entrypoint variants — drop them
find "$TARGET/backend" -name 'main.blank.*' -delete 2>/dev/null || true

# --- ble_alerts optional module ---
if [ -d "$TARGET/mobile" ]; then
  BLE_SRC="$TARGET/mobile/optional-modules/ble_alerts"
  if [[ "$INCLUDE_BLE_ALERTS" =~ ^[Yy] ]]; then
    echo "Merging ble_alerts module..."
    rsync -a --exclude '*.full.dart' --exclude 'README.md' --exclude 'assets' \
      "$BLE_SRC/lib/" "$TARGET/mobile/__SLUG__/lib/"
    while IFS= read -r full; do
      rel="${full#"$BLE_SRC"/lib/}"
      dest="$TARGET/mobile/__SLUG__/lib/${rel%.full.dart}.dart"
      cp "$full" "$dest"
    done < <(find "$BLE_SRC/lib" -name '*.full.dart')
    # merge i18n keys back in (python is available on macOS/most CI images)
    python3 - "$BLE_SRC/assets/i18n" "$TARGET/mobile/__SLUG__/assets/i18n" <<'PYEOF'
import json, sys, pathlib
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
for f in src.glob("*.json"):
    target = dst / f.name
    if not target.exists():
        continue
    with open(f) as fh:
        addition = json.load(fh)
    with open(target) as fh:
        base = json.load(fh)
    bd = base.get("dictionary", base)
    ad = addition.get("dictionary", addition)
    bd.update(ad)
    with open(target, "w") as fh:
        json.dump(base, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
PYEOF
    # uncomment BLE deps in pubspec.yaml
    sed -i.bak -E '/__BEGIN_OPTIONAL_BLE_ALERTS__/,/__END_OPTIONAL_BLE_ALERTS__/ s/^  # (flutter_blue_plus|bluetooth_low_energy):/  \1:/' \
      "$TARGET/mobile/__SLUG__/pubspec.yaml"
    rm -f "$TARGET/mobile/__SLUG__/pubspec.yaml.bak"
    # wire registration into App.dart's bootstrap, before ServiceLocator.setup()
    APP_DART="$TARGET/mobile/__SLUG__/lib/App.dart"
    sed -i.bak \
      -e "s|^import 'core/di/service_locator.dart';|import 'core/di/ble_alerts_registration.dart';\nimport 'core/di/service_locator.dart';|" \
      -e "s|^  // __OPTIONAL_MODULE_REGISTRATION__|  ServiceLocator.extraMigrations = bleAlertsMigrations;\n  ServiceLocator.extraSetupSteps = [registerBleAlerts];|" \
      "$APP_DART"
    rm -f "$APP_DART.bak"
  fi
  rm -rf "$TARGET/mobile/optional-modules"
fi

# --- rename directories/files containing the __SLUG__ token ---
find "$TARGET" -depth -name '*__SLUG__*' | while read -r path; do
  newpath="$(dirname "$path")/$(basename "$path" | sed "s/__SLUG__/$SLUG/g")"
  mv "$path" "$newpath"
done

# --- text substitution across all files ---
grep -rIl "__SLUG_UPPER__\|__SLUG_TITLE__\|__SLUG_INITIAL__\|__SLUG__\|__DISPLAY_NAME__" \
  --exclude-dir=.git "$TARGET" 2>/dev/null | while read -r f; do
  sed -i.bak \
    -e "s/__SLUG_UPPER__/${SLUG_UPPER}/g" \
    -e "s/__SLUG_TITLE__/${SLUG_TITLE}/g" \
    -e "s/__SLUG_INITIAL__/${SLUG_INITIAL}/g" \
    -e "s/__SLUG__/${SLUG}/g" \
    -e "s/__DISPLAY_NAME__/${DISPLAY_NAME}/g" \
    "$f"
  rm -f "$f.bak"
done

# --- mobile bundle id ---
if [ -d "$TARGET/mobile/$SLUG" ]; then
  NEW_PKG="${BUNDLE_PREFIX}.${SLUG}"
  grep -rIl "com.mineSafe.mobile" "$TARGET/mobile/$SLUG" 2>/dev/null | while read -r f; do
    sed -i.bak "s/com\.mineSafe\.mobile/${NEW_PKG}/g" "$f"
    rm -f "$f.bak"
  done
  KOTLIN_FILE="$TARGET/mobile/$SLUG/android/app/src/main/kotlin/com/mineSafe/mobile/MainActivity.kt"
  if [ -f "$KOTLIN_FILE" ]; then
    NEW_DIR="$TARGET/mobile/$SLUG/android/app/src/main/kotlin/$(echo "$NEW_PKG" | tr '.' '/')"
    mkdir -p "$NEW_DIR"
    mv "$KOTLIN_FILE" "$NEW_DIR/MainActivity.kt"
    rmdir -p "$(dirname "$KOTLIN_FILE")" 2>/dev/null || true
  fi
fi

# --- fresh git repo ---
git -C "$TARGET" init -q
echo
echo "Done. Next steps:"
echo "  cd $TARGET"
echo "  npm install                 # installs the CLI (bin/$SLUG) and git hooks"
[ -d "$TARGET/mobile/$SLUG" ] && echo "  cd mobile/$SLUG && flutter pub get"
[ -d "$TARGET/mobile/widgetbook" ] && echo "  cd mobile/widgetbook && flutter pub get"
[ -d "$TARGET/web/apps/components" ] && echo "  cd web/apps/components && npm install"
[ -d "$TARGET/web/apps/control-center" ] && echo "  cd web/apps/control-center && npm install"
[ -d "$TARGET/mobile/$SLUG" ] && echo "  See mobile/$SLUG/FIREBASE_SETUP.md before running the mobile app."
echo "  See local-dev/.env.example before running local-dev."
