#!/usr/bin/env bash
# tools/codex/install-profiles.sh
# Копіює командні профілі RoomBook у CODEX_HOME.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/profiles" && pwd)"
DST="${CODEX_HOME:-$HOME/.codex}"
mkdir -p "$DST"
for f in "$SRC"/*.config.toml; do
  name="$(basename "$f")"
  if [ -f "$DST/$name" ] && ! cmp -s "$f" "$DST/$name"; then
    cp "$DST/$name" "$DST/$name.bak"
    echo "оновлено: $name (попередню версію збережено як $name.bak)"
  fi
  cp "$f" "$DST/$name"
done
installed="$(cd "$SRC" && ls ./*.config.toml | xargs -n1 basename \
  | tr '\n' ' ')"
echo "встановлено профілі: $installed"
