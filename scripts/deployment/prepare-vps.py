#!/usr/bin/env python3
"""Prepare private VPS TLS material and isolated migration credentials without printing secrets."""
import argparse
from datetime import datetime, timezone
import gzip
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import time


def run(command, *, data=None, env=None, label='Preparation'):
    result = subprocess.run(command, input=data, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        detail = result.stderr.decode(errors='replace')[-1200:]
        for key, value in read_env().items():
            if re.search(r'PASSWORD|SECRET|TOKEN|API_KEY', key) and len(value) >= 6:
                detail = detail.replace(value, '[REDACTED]')
        raise RuntimeError(label + ' failed: ' + detail)
    return result.stdout


def read_env():
    return dict(line.split('=', 1) for line in Path('.env').read_text().splitlines()
                if '=' in line and not line.lstrip().startswith('#'))


def save_env(updates):
    path = Path('.env'); lines = path.read_text().splitlines()
    for key, value in updates.items():
        if any(line.startswith(key + '=') for line in lines):
            lines = [key + '=' + value if line.startswith(key + '=') else line for line in lines]
        else: lines.append(key + '=' + value)
    path.write_text('\n'.join(lines) + '\n'); path.chmod(0o600)


def certificates():
    root = Path.cwd(); tls = root / '.local/mysql-tls'; tls.mkdir(parents=True, exist_ok=True)
    tls.chmod(0o755)
    private = root / '.local/secrets'; private.mkdir(parents=True, exist_ok=True)
    ca_key = private / 'mysql-ca-key.pem'; ca_cert = tls / 'ca.pem'
    if not ca_key.exists() or not ca_cert.exists():
        run(['openssl', 'req', '-new', '-x509', '-newkey', 'rsa:3072', '-nodes', '-days', '3650',
             '-keyout', str(ca_key), '-out', str(ca_cert), '-subj', '/CN=SmartRecruit MySQL CA',
             '-addext', 'basicConstraints=critical,CA:TRUE'], label='MySQL CA generation')
        ca_key.chmod(0o600)
    cert = tls / 'server-cert.pem'; key = tls / 'server-key.pem'
    valid = cert.exists() and key.exists() and subprocess.run(['openssl', 'x509', '-checkend', '604800', '-noout', '-in', str(cert)],
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if not valid:
        key.unlink(missing_ok=True)
        run(['openssl', 'req', '-new', '-newkey', 'rsa:3072', '-nodes', '-keyout', str(key),
             '-out', str(tls / 'server.csr'), '-subj', '/CN=mysql'], label='MySQL server key generation')
        extensions = tls / 'server.ext'
        extensions.write_text('subjectAltName=DNS:mysql,DNS:localhost,IP:127.0.0.1\nextendedKeyUsage=serverAuth\nkeyUsage=digitalSignature,keyEncipherment\nbasicConstraints=CA:FALSE\n')
        run(['openssl', 'x509', '-req', '-in', str(tls / 'server.csr'), '-CA', str(ca_cert), '-CAkey', str(ca_key),
             '-CAcreateserial', '-out', str(cert), '-days', '365', '-sha256', '-extfile', str(extensions)], label='MySQL certificate signing')
    trust = tls / 'mysql-truststore.p12'
    if trust.exists(): trust.unlink()
    # This store contains ONLY a public CA certificate. Its standard integrity password is not a credential.
    keytool = shutil.which('keytool')
    arguments = ['-importcert', '-noprompt', '-alias', 'smartrecruit-mysql-ca', '-storetype', 'PKCS12', '-storepass', 'changeit']
    if keytool:
        run([keytool, *arguments, '-file', str(ca_cert), '-keystore', str(trust)], label='MySQL CA truststore generation')
    else:
        run(['docker', 'run', '--rm', '--network', 'none', '--user', '0:0', '--mount', 'type=bind,src=' + str(tls) + ',dst=/tls',
             '--entrypoint', 'keytool', 'eclipse-temurin:25-jre-alpine', *arguments, '-file', '/tls/ca.pem', '-keystore', '/tls/mysql-truststore.p12'], label='MySQL CA truststore generation')
        run(['docker', 'run', '--rm', '--network', 'none', '--user', '0:0', '--mount', 'type=bind,src=' + str(tls) + ',dst=/tls',
             '--entrypoint', 'sh', 'mysql:8.4.11', '-c', 'chown "$1:$2" /tls/mysql-truststore.p12',
             'prepare', str(os.getuid()), str(os.getgid())], label='Truststore ownership')
    trust.chmod(0o644); ca_cert.chmod(0o644); cert.chmod(0o644)
    v = read_env()
    updates = {'MYSQL_TLS_DIRECTORY': str(tls), 'MYSQL_TRUSTSTORE_FILE': str(trust), 'APP_MIGRATION_ENABLED': 'false'}
    updates['MIGRATION_DB_USERNAME'] = v.get('MIGRATION_DB_USERNAME') or 'smartrecruit_migrator'
    updates['MIGRATION_DB_PASSWORD'] = v.get('MIGRATION_DB_PASSWORD') or secrets.token_urlsafe(32)
    if not v.get('APP_NOTIFICATION_PROVIDER') or v['APP_NOTIFICATION_PROVIDER'] == 'logging':
        updates.update(APP_NOTIFICATION_PROVIDER='disabled', APP_NOTIFICATION_ENABLED='false')
    if not v.get('APP_SECURITY_JWT_ISSUER', '').startswith('https://'):
        updates['APP_SECURITY_JWT_ISSUER'] = v.get('APP_PUBLIC_URL') or 'https://smartrecruit.synaplearn.online'
    # The SPA uses the same-origin Nginx proxy. Local development origins must not
    # be carried into production, while explicit HTTPS origins remain available.
    origins = [origin.strip() for origin in v.get('APP_WEB_CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()]
    updates['APP_WEB_CORS_ALLOWED_ORIGINS'] = ','.join(origin for origin in origins if origin.startswith('https://'))
    url = v.get('SPRING_DATASOURCE_URL', '')
    if not url or url.startswith('jdbc:mysql://mysql:') or url.startswith('jdbc:mysql://mysql/'):
        updates['SPRING_DATASOURCE_URL'] = 'jdbc:mysql://mysql:3306/' + v['MYSQL_DATABASE'] + '?sslMode=VERIFY_IDENTITY&trustCertificateKeyStoreUrl=file:/run/secrets/mysql-truststore.p12&trustCertificateKeyStoreType=PKCS12&trustCertificateKeyStorePassword=changeit&fallbackToSystemTrustStore=false&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
    save_env(updates)
    image = 'mysql:8.4.11'
    uid = run(['docker', 'run', '--rm', '--entrypoint', 'id', image, '-u', 'mysql']).decode().strip()
    gid = run(['docker', 'run', '--rm', '--entrypoint', 'id', image, '-g', 'mysql']).decode().strip()
    if not uid.isdigit() or not gid.isdigit(): raise RuntimeError('Could not determine MySQL file ownership.')
    run(['docker', 'run', '--rm', '--network', 'none', '--user', '0:0', '--mount', 'type=bind,src=' + str(tls) + ',dst=/tls',
         '--entrypoint', 'sh', image, '-c', 'chown "$1:$2" /tls/server-key.pem && chmod 600 /tls/server-key.pem', 'prepare', uid, gid], label='MySQL TLS permissions')
    for name, mode in [('JWT_PRIVATE_KEY_FILE', '640'), ('JWT_PUBLIC_KEY_FILE', '644')]:
        path = Path(v[name]).resolve()
        run(['docker', 'run', '--rm', '--network', 'none', '--user', '0:0', '--mount', 'type=bind,src=' + str(path) + ',dst=/key',
             '--entrypoint', 'sh', image, '-c', 'chgrp 10001 /key && chmod "$1" /key', 'prepare', mode], label='JWT key permissions')
    print('MySQL TLS, CA trust and JWT read permissions prepared.')


def database():
    v = read_env(); name = v['MYSQL_DATABASE']; runtime = v['MYSQL_USER']; migrator = v['MIGRATION_DB_USERNAME']
    if not all(re.fullmatch(r'[A-Za-z0-9_]+', item) for item in [name, runtime, migrator]) or runtime == migrator or 'root' in [runtime, migrator]:
        raise RuntimeError('Runtime and migration users must be distinct, non-root identifiers.')
    compose = ['docker', 'compose', '--env-file', '.env', '-f', 'infra/docker/compose.prod.yml']
    container = run(compose + ['ps', '-q', 'mysql']).decode().strip()
    env = {**os.environ, 'MYSQL_PWD': v['MYSQL_ROOT_PASSWORD']}
    command = ['docker', 'exec', '-i', '-e', 'MYSQL_PWD', container]
    # Unix sockets are local secure transport. The application always uses verified TLS over TCP.
    admin = command + ['mysql', '--protocol=SOCKET', '--ssl-mode=DISABLED', '-uroot']
    for attempt in range(60):
        try:
            run(admin, data=b'SELECT 1;', env=env, label='MySQL administrator readiness')
            break
        except RuntimeError:
            if attempt == 59: raise
            time.sleep(1)
    backup = run(command + ['mysqldump', '--protocol=SOCKET', '--ssl-mode=DISABLED', '-uroot', '--single-transaction', '--no-tablespaces', '--set-gtid-purged=OFF', name], env=env, label='Pre-migration database backup')
    backups = Path('.local/backups'); backups.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    with (backups / ('before-migration-' + stamp + '.sql.gz')).open('xb') as output: output.write(gzip.compress(backup))
    def quote(value): return "'" + value.replace('\\', '\\\\').replace("'", "''") + "'"
    identity = quote(migrator) + "@'%'"; app = quote(runtime) + "@'%'"
    scope = '`' + name.replace('_', '\\_') + '`.*'
    sql = 'CREATE USER IF NOT EXISTS ' + identity + ' IDENTIFIED BY ' + quote(v['MIGRATION_DB_PASSWORD']) + ';\n'
    sql += 'ALTER USER ' + identity + ' IDENTIFIED BY ' + quote(v['MIGRATION_DB_PASSWORD']) + ';\n'
    sql += 'GRANT ALL PRIVILEGES ON ' + scope + ' TO ' + identity + ';\n'
    sql += 'REVOKE ALL PRIVILEGES, GRANT OPTION FROM ' + app + ';\n'
    sql += 'GRANT SELECT,INSERT,UPDATE,DELETE ON ' + scope + ' TO ' + app + ';\n'
    run(admin, data=sql.encode(), env=env, label='Separate migration/runtime database permissions')
    print('Database backed up; migration and runtime identities prepared.')


if __name__ == '__main__':
    os.umask(0o077)
    parser = argparse.ArgumentParser(); parser.add_argument('phase', choices=['certificates', 'database']); args = parser.parse_args()
    try:
        certificates() if args.phase == 'certificates' else database()
    except (OSError, RuntimeError, KeyError) as failure:
        raise SystemExit(str(failure))
