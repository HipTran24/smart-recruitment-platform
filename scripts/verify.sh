#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_project_java

printf 'Running Maven verification with an isolated MySQL Testcontainer.\n'
run_maven -B -ntp verify
