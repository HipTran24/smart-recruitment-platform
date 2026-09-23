#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

case "${1:-}" in
  "")
    compose down
    ;;
  --remove-data)
    printf 'Removing containers and the local Docker database volume.\n' >&2
    compose down --volumes
    ;;
  *)
    fail "Usage: $0 [--remove-data]"
    ;;
esac
