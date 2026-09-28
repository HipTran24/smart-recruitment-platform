#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly ENV_FILE="$REPO_ROOT/.env"
readonly COMPOSE_FILE="$REPO_ROOT/infra/docker/compose.local.yml"

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' was not found on PATH."
}

require_project_java() {
  require_command java

  local expected actual
  expected="$(sed -n -E 's#.*<java.version>([0-9]+)</java.version>.*#\1#p' "$REPO_ROOT/pom.xml" | head -n 1)"
  actual="$(java -version 2>&1 | sed -n -E '1s/.*"([0-9]+)(\.[0-9]+)?.*/\1/p')"

  [[ -n "$expected" ]] || fail "Could not determine java.version from pom.xml."
  [[ "$actual" == "$expected" ]] || fail "Project requires Java $expected, but the current java command reports Java ${actual:-unknown}."
}

project_java_home() {
  local expected
  expected="$(sed -n -E 's#.*<java.version>([0-9]+)</java.version>.*#\1#p' "$REPO_ROOT/pom.xml" | head -n 1)"

  if [[ -x /usr/libexec/java_home ]]; then
    /usr/libexec/java_home -v "$expected" 2>/dev/null && return
  fi

  if [[ -n "${JAVA_HOME:-}" && -x "${JAVA_HOME}/bin/java" ]]; then
    printf '%s\n' "$JAVA_HOME"
    return
  fi

  return 1
}

ensure_env_file() {
  [[ -f "$ENV_FILE" ]] || fail "Missing .env. Copy .env.example to .env and replace all placeholder values."
}

env_value() {
  local key="$1"
  sed -n -E "s/^${key}=(.*)$/\1/p" "$ENV_FILE" | tail -n 1
}

require_env_value() {
  local key="$1"
  local value
  value="$(env_value "$key")"

  [[ -n "$value" ]] || fail "Missing value for $key in .env."
  [[ "$value" != replace-with-* ]] || fail "Replace the placeholder value for $key in .env."
}

validate_local_env() {
  ensure_env_file
  require_env_value MYSQL_DATABASE
  require_env_value MYSQL_USER
  require_env_value MYSQL_PASSWORD
  require_env_value MYSQL_ROOT_PASSWORD
}

run_maven() {
  local java_home
  java_home="$(project_java_home)" || fail "Could not resolve a JDK matching java.version from pom.xml."

  if [[ -x "$REPO_ROOT/mvnw" && -f "$REPO_ROOT/.mvn/wrapper/maven-wrapper.properties" ]]; then
    JAVA_HOME="$java_home" "$REPO_ROOT/mvnw" "$@"
    return
  fi

  require_command mvn
  JAVA_HOME="$java_home" mvn "$@"
}

compose() {
  require_command docker
  docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required."
  validate_local_env

  (
    cd "$REPO_ROOT"
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
  )
}
