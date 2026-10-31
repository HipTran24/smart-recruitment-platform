#!/usr/bin/env bash
# Executed by the authorized Lightsail CD job after checking out its exact commit.
set -Eeuo pipefail
umask 077

cd /home/ubuntu/smart-recruitment
mkdir -p secrets
if [[ ! -f secrets/app-jwt-private.pem ]]; then
  openssl genpkey -algorithm RSA -out secrets/app-jwt-private.pem -pkeyopt rsa_keygen_bits:3072
fi
if [[ ! -f secrets/app-jwt-public.pem ]]; then
  openssl pkey -pubout -in secrets/app-jwt-private.pem -out secrets/app-jwt-public.pem
fi
chmod 600 secrets/app-jwt-private.pem
chmod 644 secrets/app-jwt-public.pem

# Existing database credentials remain unchanged. First-boot credentials are random,
# written only on the VPS, and never printed or committed.
python3 - <<'PY'
from pathlib import Path
import os
import secrets
p = Path('.env')
lines = p.read_text().splitlines() if p.exists() else Path('.env.example').read_text().splitlines()
values = {}
for line in lines:
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1)
        values[k] = v

def put(key, value):
    global lines
    if any(line.startswith(key + '=') for line in lines):
        lines = [key + '=' + value if line.startswith(key + '=') else line for line in lines]
    else:
        lines.append(key + '=' + value)
    values[key] = value

def default(key, value):
    if not values.get(key) or values[key].startswith('replace-with-'):
        put(key, value)

for key in ['MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD']:
    default(key, secrets.token_urlsafe(32))
default('MYSQL_DATABASE', 'smart_recruitment_db')
default('MYSQL_USER', 'smartrecruit_user')
default('JWT_PRIVATE_KEY_FILE', str(Path('secrets/app-jwt-private.pem').resolve()))
default('JWT_PUBLIC_KEY_FILE', str(Path('secrets/app-jwt-public.pem').resolve()))
default('SPRING_PROFILES_ACTIVE', 'production')
default('APP_SECURITY_JWT_ISSUER', 'https://smartrecruit.production')
default('APP_SECURITY_JWT_AUDIENCE', 'smart-recruitment-app')
default('APP_SECURITY_JWT_KEY_ID', 'smartrecruit-prod-v1')
default('APP_SECURITY_JWT_ACCESS_TOKEN_TTL', 'PT15M')
default('APP_SECURITY_JWT_REFRESH_TOKEN_TTL', 'P7D')
default('APP_SECURITY_JWT_CLOCK_SKEW', 'PT30S')
put('APP_TEST_MAILBOX_ENABLED', 'false')
if os.environ.get('DEEPSEEK_API_KEY'):
    put('DEEPSEEK_API_KEY', os.environ['DEEPSEEK_API_KEY'])
if values.get('DEEPSEEK_API_KEY'):
    put('DEEPSEEK_ENABLED', 'true')
    put('DEEPSEEK_MODEL', 'deepseek-flash')
    put('GEMINI_ENABLED', 'false')
else:
    raise SystemExit('Configure the DEEPSEEK_API_KEY GitHub Secret or VPS environment before deploying.')
next_file = p.with_suffix('.next')
next_file.write_text('\n'.join(lines) + '\n')
next_file.chmod(0o600)
next_file.replace(p)
print('VPS configuration saved; secret values are not displayed.')
PY

docker compose --env-file .env -f infra/docker/compose.prod.yml up --build -d --remove-orphans --wait --wait-timeout 300
docker compose --env-file .env -f infra/docker/compose.prod.yml ps
