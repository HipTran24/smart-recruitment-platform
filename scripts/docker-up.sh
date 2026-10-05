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
frontend_port="$(env_value FRONTEND_PORT)"
frontend_port="${frontend_port:-8443}"

printf '\n===================================================\n'
printf '🚀 SmartRecruit Containers Running Successfully:\n'
printf '   - Frontend (SPA):      http://localhost:%s\n' "$frontend_port"
printf '   - Backend REST API:    http://localhost:%s\n' "$app_port"
printf '   - OpenAPI Docs:        http://localhost:%s/v3/api-docs\n' "$app_port"
printf '   - Health Check:        http://localhost:%s/actuator/health\n' "$app_port"
printf '===================================================\n\n'
