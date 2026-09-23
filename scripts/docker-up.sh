#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

validate_local_env
compose up --build --detach --remove-orphans
compose ps

app_port="$(env_value APP_PORT)"
app_port="${app_port:-8080}"
printf '\nApplication: http://localhost:%s\n' "$app_port"
