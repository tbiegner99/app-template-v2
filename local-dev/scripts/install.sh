#!/usr/bin/env bash
# install.sh — postinstall: writes __SLUG_UPPER___HOME to the user's shell profile

set -euo pipefail

case "$(uname -s 2>/dev/null)" in
  CYGWIN*|MINGW*|MSYS*|Windows_NT)
    echo "[__SLUG__] Error: Windows is not supported. Use bash or zsh on macOS or Linux." >&2
    exit 1
    ;;
esac

___SLUG___install_resolve_dir() {
  local src="${BASH_SOURCE[0]}"
  while [ -L "$src" ]; do
    local dir
    dir="$(cd -P "$(dirname "$src")" && pwd)"
    src="$(readlink "$src")"
    [[ "$src" != /* ]] && src="$dir/$src"
  done
  cd -P "$(dirname "$src")" && pwd
}
INSTALL_SCRIPT_DIR="$(___SLUG___install_resolve_dir)"

if [ -z "${SHELL:-}" ]; then
  PROFILE="$HOME/.bashrc"
elif [[ "$SHELL" == */zsh ]]; then
  PROFILE="$HOME/.zshrc"
else
  PROFILE="$HOME/.bashrc"
fi

EXPORT_LINE="export __SLUG_UPPER___HOME=\"$INSTALL_SCRIPT_DIR\""

if grep -qF "__SLUG_UPPER___HOME=" "$PROFILE" 2>/dev/null; then
  echo "[__SLUG__] __SLUG_UPPER___HOME already set in $PROFILE — skipping."
else
  echo "" >> "$PROFILE"
  echo "# Added by __SLUG__ install" >> "$PROFILE"
  echo "$EXPORT_LINE" >> "$PROFILE"
  echo "[__SLUG__] Added __SLUG_UPPER___HOME to $PROFILE"
fi

echo ""
echo "[__SLUG__] Installation complete."
echo "[__SLUG__] Run the following to activate:"
echo "         source $PROFILE"
echo ""
