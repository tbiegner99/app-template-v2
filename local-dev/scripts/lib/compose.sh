#!/usr/bin/env bash
# compose.sh — discovers all docker-compose files and builds a container registry
# Compatible with bash 3.2 (macOS default) — no associative arrays, safe empty-array expansions

# Requires: __SLUG_UPPER___REPO_ROOT set by env.sh

___SLUG_UPPER___ALIAS_FILE="$__SLUG_UPPER___SCRIPT_DIR/container-aliases.conf"

# Translates a short alias (e.g. "postgres") to its real container name
# (e.g. "__SLUG__-postgres") via container-aliases.conf. Passes unknown
# names through unchanged, so real container names still work directly.
resolve_alias() {
  local name="$1" line
  if [ -f "$___SLUG_UPPER___ALIAS_FILE" ]; then
    line=$(grep -E "^${name}=" "$___SLUG_UPPER___ALIAS_FILE" 2>/dev/null | tail -1)
    if [ -n "$line" ]; then
      echo "${line#*=}"
      return 0
    fi
  fi
  echo "$name"
}

___SLUG_UPPER___COMPOSE_FILES=()
# Registry entries stored as "container_name:compose_file:service_key"
___SLUG_UPPER___REGISTRY=()

___SLUG___discover_compose_files() {
  local f
  while IFS= read -r f; do
    ___SLUG_UPPER___COMPOSE_FILES+=("$f")
  done < <(
    find "$__SLUG_UPPER___REPO_ROOT" \
      -maxdepth 3 \
      -name "docker-compose*.yml" \
      -not -path "*/node_modules/*" \
      -not -path "*/.git/*" \
      -not -path "*/build/*" \
      -not -path "*/.dart_tool/*" \
      2>/dev/null | sort
  )

  if [ "${#___SLUG_UPPER___COMPOSE_FILES[@]}" -eq 0 ]; then
    echo "Error: No docker-compose*.yml files found under $__SLUG_UPPER___REPO_ROOT" >&2
    exit 2
  fi
}

___SLUG___build_container_registry() {
  local f svc cname
  for f in "${___SLUG_UPPER___COMPOSE_FILES[@]+"${___SLUG_UPPER___COMPOSE_FILES[@]}"}"; do
    # Extract top-level service names directly from YAML (avoids slow `docker compose config`)
    while IFS= read -r svc; do
      [ -z "$svc" ] && continue
      # Extract container_name for this service block
      cname=$(awk "/^  ${svc}:/{found=1; next} found && /^    container_name:/{print \$2; exit} found && /^  [^ ]/{exit}" "$f")
      if [ -n "$cname" ]; then
        if ___SLUG___lookup_file "$cname" >/dev/null 2>&1; then
          echo "[__SLUG__] Warning: duplicate container_name '$cname' in $f" >&2
        fi
        ___SLUG_UPPER___REGISTRY+=("${cname}:${f}:${svc}")
      fi
    done < <(awk '/^services:/{s=1;next} s && /^  [a-zA-Z0-9_-]+:/{name=$1; gsub(/:$/,"",name); print name} s && /^[^ ]/{s=0}' "$f")
  done
}

___SLUG___lookup_file() {
  local name="$1" entry
  for entry in "${___SLUG_UPPER___REGISTRY[@]+"${___SLUG_UPPER___REGISTRY[@]}"}"; do
    local n="${entry%%:*}"
    if [ "$n" = "$name" ]; then
      local rest="${entry#*:}"
      echo "${rest%%:*}"
      return 0
    fi
  done
  return 1
}

___SLUG___lookup_service() {
  local name="$1" entry
  for entry in "${___SLUG_UPPER___REGISTRY[@]+"${___SLUG_UPPER___REGISTRY[@]}"}"; do
    local n="${entry%%:*}"
    if [ "$n" = "$name" ]; then
      echo "${entry##*:}"
      return 0
    fi
  done
  return 1
}

resolve_container() {
  local name="$1"
  local file
  file=$(___SLUG___lookup_file "$name") || {
    echo "Error: Unknown container '$name'." >&2
    echo "Known containers: $(list_containers)" >&2
    return 1
  }
  echo "$file"
}

resolve_service() {
  local name="$1"
  ___SLUG___lookup_service "$name"
}

list_containers() {
  local entry
  for entry in "${___SLUG_UPPER___REGISTRY[@]+"${___SLUG_UPPER___REGISTRY[@]}"}"; do
    echo "${entry%%:*}"
  done | sort | tr '\n' ' '
}

___SLUG___discover_compose_files
___SLUG___build_container_registry
