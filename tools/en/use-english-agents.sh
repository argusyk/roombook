#!/usr/bin/env bash
# Installs the English AGENTS.override.md files for readers of the English
# edition of "Developing with Codex" (see README.en.md).
#
# Codex reads AGENTS.override.md instead of AGENTS.md in the same directory,
# so the agent gets English instructions and replies in English. The overrides
# are listed in .gitignore (from ch05-end on) and never get committed.
#
#   bash tools/en/use-english-agents.sh            # install / sync
#   bash tools/en/use-english-agents.sh --remove   # remove the overrides
#
# On a chapter branch made from an older tag (where tools/en/ does not exist):
#   git show main:tools/en/use-english-agents.sh | bash
#   git show main:tools/en/use-english-agents.sh | bash -s -- --remove
#
# An override is installed only next to an existing AGENTS.md, and its text
# matches the version of that AGENTS.md at the checked-out tag (the Ukrainian
# files grow from Chapter 5 to Chapter 15). Run the script again after
# switching to another tag. Files that do not carry the marker of this script
# (your own overrides) are never overwritten or deleted.
set -euo pipefail

marker="tools/en/use-english-agents.sh"
mode=install
ref="${ROOMBOOK_EN_REF:-main}"
while [ $# -gt 0 ]; do
  case "$1" in
    --remove) mode=remove ;;
    --ref) ref="${2:?--ref needs a value}"; shift ;;
    -h|--help) echo "usage: use-english-agents.sh [--remove] [--ref <branch>]"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

root="$(git rev-parse --show-toplevel)"
cd "$root"

# source name : target directory
pairs="root:. apps-api:apps/api apps-web:apps/web legacy-php:legacy-php"

# English file for a given Ukrainian AGENTS.md (blob hash, first 7 characters).
# Unknown hash (edited file or a newer main) -> the main version.
variant() {
  case "$1:$2" in
    root:fcf330d)       echo "by-tag/root.ch05-end" ;;        # ch05-end..ch09-end
    root:183a7c0)       echo "by-tag/root.ch10-end" ;;        # ch10-end
    apps-api:bead703)   echo "by-tag/apps-api.ch05-end" ;;    # ch05-end..ch11-end
    apps-api:e08bb74)   echo "by-tag/apps-api.ch12-end" ;;    # ch12-end
    apps-api:c284b38)   echo "by-tag/apps-api.ch13-end" ;;    # ch13-end..ch14-end
    legacy-php:e968bc5) echo "by-tag/legacy-php.ch05-end" ;;  # ch05-end..ch06-end
    legacy-php:8b4ab36) echo "by-tag/legacy-php.ch07-end" ;;  # ch07-end..ch10-end
    root:0fe1c6d|apps-api:6f180a3|apps-web:e0f3d74|legacy-php:038051c) echo "$1" ;;
    *) echo "$1"; echo "note: $1 AGENTS.md differs from every tagged version; using the main translation" >&2 ;;
  esac
}

source_of() { # prints the English text for tools/en/agents/$1.AGENTS.override.md
  local rel="tools/en/agents/$1.AGENTS.override.md"
  if [ -f "$rel" ]; then
    cat "$rel"
  elif git cat-file -e "$ref:$rel" 2>/dev/null; then
    git show "$ref:$rel"
  elif git cat-file -e "origin/$ref:$rel" 2>/dev/null; then
    git show "origin/$ref:$rel"
  else
    echo "cannot find $rel in the working tree, $ref or origin/$ref" >&2
    return 1
  fi
}

ours() { [ -f "$1" ] && grep -q "$marker" "$1"; }

for pair in $pairs; do
  name="${pair%%:*}"
  dir="${pair#*:}"
  target="$dir/AGENTS.override.md"
  [ "$dir" = "." ] && target="AGENTS.override.md"

  if [ "$mode" = remove ] || [ ! -f "$dir/AGENTS.md" ]; then
    if ours "$target"; then
      rm -f "$target"
      echo "removed   $target"
    elif [ -f "$target" ]; then
      echo "kept      $target (not created by this script)"
    elif [ "$mode" = install ]; then
      echo "skipped   $target (no $dir/AGENTS.md at this commit)"
    fi
    continue
  fi

  if [ -f "$target" ] && ! ours "$target"; then
    echo "kept      $target (your own override; delete it to use the English one)"
    continue
  fi
  hash="$(git hash-object -- "$dir/AGENTS.md")"
  src="$(variant "$name" "${hash:0:7}")"
  source_of "$src" > "$target.tmp"
  mv "$target.tmp" "$target"
  echo "installed $target  <- tools/en/agents/$src.AGENTS.override.md"
done

if [ "$mode" = install ] && [ -f AGENTS.override.md ] \
   && ! git check-ignore -q AGENTS.override.md; then
  echo "warning: AGENTS.override.md is not in .gitignore at this commit; do not commit it" >&2
fi
echo "Check: codex --ask-for-approval never \"Summarize the current instructions.\""
