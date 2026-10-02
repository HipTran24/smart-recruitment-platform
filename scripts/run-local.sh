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
jwt_private_key="$(env_value JWT_PRIVATE_KEY_FILE)"
jwt_public_key="$(env_value JWT_PUBLIC_KEY_FILE)"
session_cookie_secure="$(env_value SERVER_SESSION_COOKIE_SECURE)"
session_cookie_secure="${session_cookie_secure:-false}"
forward_headers_strategy="$(env_value SERVER_FORWARD_HEADERS_STRATEGY)"
forward_headers_strategy="${forward_headers_strategy:-none}"
cors_allowed_origins="$(env_value APP_WEB_CORS_ALLOWED_ORIGINS)"

export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:${mysql_port}/${database}?useSSL=false&allowPublicKeyRetrieval=true&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true"
export SPRING_DATASOURCE_USERNAME="$username"
export SPRING_DATASOURCE_PASSWORD="$password"
export SPRING_JPA_HIBERNATE_DDL_AUTO="validate"
export SERVER_SESSION_COOKIE_SECURE="$session_cookie_secure"
export SERVER_FORWARD_HEADERS_STRATEGY="$forward_headers_strategy"
export APP_WEB_CORS_ALLOWED_ORIGINS="$cors_allowed_origins"
export APP_SECURITY_JWT_ISSUER="$(env_value APP_SECURITY_JWT_ISSUER)"
export APP_SECURITY_JWT_AUDIENCE="$(env_value APP_SECURITY_JWT_AUDIENCE)"
export APP_SECURITY_JWT_KEY_ID="$(env_value APP_SECURITY_JWT_KEY_ID)"
export APP_SECURITY_JWT_PRIVATE_KEY_LOCATION="file:${jwt_private_key}"
export APP_SECURITY_JWT_PUBLIC_KEY_LOCATION="file:${jwt_public_key}"
export APP_SECURITY_JWT_ACCESS_TOKEN_TTL="$(env_value APP_SECURITY_JWT_ACCESS_TOKEN_TTL)"
export APP_SECURITY_JWT_REFRESH_TOKEN_TTL="$(env_value APP_SECURITY_JWT_REFRESH_TOKEN_TTL)"
export APP_SECURITY_JWT_CLOCK_SKEW="$(env_value APP_SECURITY_JWT_CLOCK_SKEW)"
export GOOGLE_OAUTH_ENABLED="$(env_value GOOGLE_OAUTH_ENABLED)"
export GOOGLE_OAUTH_CLIENT_ID="$(env_value GOOGLE_OAUTH_CLIENT_ID)"
export GOOGLE_OAUTH_CLIENT_SECRET="$(env_value GOOGLE_OAUTH_CLIENT_SECRET)"
export GOOGLE_OAUTH_SUCCESS_REDIRECT_URI="$(env_value GOOGLE_OAUTH_SUCCESS_REDIRECT_URI)"
export GOOGLE_OAUTH_AUTHORIZATION_CODE_TTL="$(env_value GOOGLE_OAUTH_AUTHORIZATION_CODE_TTL)"
export GEMINI_ENABLED="$(env_value GEMINI_ENABLED)"
export GEMINI_API_KEY="$(env_value GEMINI_API_KEY)"
export GEMINI_MODEL="$(env_value GEMINI_MODEL)"
export GEMINI_API_BASE_URL="$(env_value GEMINI_API_BASE_URL)"
export GEMINI_API_VERSION="$(env_value GEMINI_API_VERSION)"
export GEMINI_CONNECT_TIMEOUT="$(env_value GEMINI_CONNECT_TIMEOUT)"
export GEMINI_READ_TIMEOUT="$(env_value GEMINI_READ_TIMEOUT)"
export GEMINI_MAX_RESUME_CHARACTERS="$(env_value GEMINI_MAX_RESUME_CHARACTERS)"
export GEMINI_MAX_JOB_DESCRIPTION_CHARACTERS="$(env_value GEMINI_MAX_JOB_DESCRIPTION_CHARACTERS)"
export GEMINI_MAX_REQUIRED_CRITERIA="$(env_value GEMINI_MAX_REQUIRED_CRITERIA)"
export GEMINI_MAX_OUTPUT_TOKENS="$(env_value GEMINI_MAX_OUTPUT_TOKENS)"
export GEMINI_ALLOW_INSECURE_ENDPOINT="$(env_value GEMINI_ALLOW_INSECURE_ENDPOINT)"

printf 'Starting Spring Boot against MySQL on localhost:%s.\n' "$mysql_port"
run_maven -B -ntp spring-boot:run
