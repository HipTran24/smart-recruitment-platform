#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

validate_local_env
require_project_java

mysql_port="$(env_value MYSQL_PORT)"
mysql_port="${mysql_port:-3306}"
database="$(env_value MYSQL_DATABASE)"
username="$(env_value MYSQL_USER)"
password="$(env_value MYSQL_PASSWORD)"

export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:${mysql_port}/${database}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh"
export SPRING_DATASOURCE_USERNAME="$username"
export SPRING_DATASOURCE_PASSWORD="$password"
export SPRING_JPA_HIBERNATE_DDL_AUTO="validate"

printf 'Starting Spring Boot against MySQL on localhost:%s.\n' "$mysql_port"
run_maven -B -ntp spring-boot:run
