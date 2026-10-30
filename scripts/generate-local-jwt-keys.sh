#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$REPO_ROOT/.local/secrets/jwt}"
PRIVATE_KEY="$TARGET_DIR/private.pem"
PUBLIC_KEY="$TARGET_DIR/public.pem"

command -v openssl >/dev/null 2>&1 || {
  printf 'Error: openssl is required to generate local JWT keys.\n' >&2
  exit 1
}

if [[ -e "$PRIVATE_KEY" || -e "$PUBLIC_KEY" ]]; then
  printf 'Error: refusing to overwrite existing JWT key files in %s.\n' "$TARGET_DIR" >&2
  exit 1
fi

umask 077
mkdir -p "$TARGET_DIR"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out "$PRIVATE_KEY"
openssl pkey -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY"
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"

printf 'Created local JWT key pair. Add these absolute paths to .env:\n'
printf 'JWT_PRIVATE_KEY_FILE=%s\n' "$PRIVATE_KEY"
printf 'JWT_PUBLIC_KEY_FILE=%s\n' "$PUBLIC_KEY"
