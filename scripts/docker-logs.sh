#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

service="${1:-app}"
case "$service" in
  app|mysql) ;;
  *) fail "Usage: $0 [app|mysql]" ;;
esac

compose logs --follow --tail=200 "$service"
