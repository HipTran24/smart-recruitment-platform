#!/usr/bin/env python3
"""Transfer existing accounts, password hashes, roles, applications and CVs to a fresh VPS DB."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile

from data_bundle import TransferError, read_bundle, uploads_tar, write_bundle

ROOT = Path(__file__).resolve().parents[2]
EPHEMERAL = {'refresh_tokens', 'oauth_authorization_codes', 'password_reset_tokens', 'email_verification_tokens'}


def run(command, *, data=None, env=None, action='Docker command'):
    result = subprocess.run(command, input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    if result.returncode:
        # SQL/provider diagnostics may contain private data; never echo command output or secrets.
        raise TransferError(f'{action} failed (exit {result.returncode}).')
    return result.stdout


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9_]+', value):
        raise TransferError('Invalid database or table identifier.')
    return value


class Database:
    def __init__(self, config):
        self.container = config['container']
        self.database = identifier(config['database'])
        self.username = config['username']
        self.env = {**os.environ, 'MYSQL_PWD': config['password']}

    def command(self, tool):
        return ['docker', 'exec', '-i', '-e', 'MYSQL_PWD', self.container, tool, '-u' + self.username]

    def query(self, sql):
        return run(self.command('mysql') + ['--default-character-set=utf8mb4', '-N', self.database],
                   data=sql.encode(), env=self.env, action='Database query').decode().splitlines()

    def counts(self):
        return {table: int(self.query('SELECT COUNT(*) FROM `' + identifier(table) + '`;')[0])
                for table in self.query('SHOW TABLES;')}

    def resumes(self):
        return [json.loads(line) for line in self.query(
            'SELECT JSON_ARRAY(storage_key,file_size_bytes) FROM candidate_resumes ORDER BY id;')]

    def dump(self):
        base = self.command('mysqldump') + ['--default-character-set=utf8mb4', '--single-transaction',
                '--no-tablespaces', '--set-gtid-purged=OFF', '--column-statistics=0', '--hex-blob',
                '--skip-add-locks', '--skip-add-drop-table', '--skip-comments']
        persistent = run(base + ['--ignore-table=' + self.database + '.' + table for table in sorted(EPHEMERAL)]
                         + [self.database], env=self.env, action='Database export')
        empty_sessions = run(base + ['--no-data', self.database] + sorted(EPHEMERAL),
                             env=self.env, action='Session schema export')
        return persistent + b'\n' + empty_sessions

    def import_sql(self, sql):
        run(self.command('mysql') + ['--default-character-set=utf8mb4', self.database],
            data=sql, env=self.env, action='Database import')


def export(args):
    database = Database(json.loads(args.database_config.read_text()))
    inventory = database.resumes()
    counts = database.counts()
    roles = [json.loads(line) for line in database.query('''
        SELECT JSON_ARRAY(r.code,COUNT(*)) FROM user_roles ur JOIN roles r ON r.id=ur.role_id GROUP BY r.code;
        ''')]
    sql = database.dump()
    if inventory != database.resumes():
        raise TransferError('CV records changed during export. Retry after uploads have finished.')
    after = database.counts()
    if {k: v for k, v in counts.items() if k not in EPHEMERAL} != {k: v for k, v in after.items() if k not in EPHEMERAL}:
        raise TransferError('Data changed during export. Retry after active writes have finished.')
    files = []
    root = args.uploads_directory.resolve()
    for key, size in inventory:
        from data_bundle import safe_key
        safe_key(key)
        path = (root / key).resolve()
        if not path.is_relative_to(root) or not path.is_file():
            raise TransferError('A referenced CV file is missing or outside the upload directory.')
        content = path.read_bytes()
        if len(content) != size:
            raise TransferError('A CV file size differs from its database record.')
        files.append((key, content))
    for table in EPHEMERAL:
        counts[table] = 0
    manifest = write_bundle(args.output, sql, {
        'createdAt': datetime.now(timezone.utc).isoformat(), 'tableCounts': counts,
        'roleCounts': dict(roles), 'sessionsExcluded': sorted(EPHEMERAL),
    }, files)
    print(json.dumps({'bundle': str(args.output.resolve()), **summary(manifest)}, ensure_ascii=False, indent=2))


def compose_target(args):
    command = ['docker', 'compose', '--env-file', str(args.env_file.resolve()), '-f', str(args.compose_file.resolve())]
    config = json.loads(run(command + ['config', '--format', 'json'], action='Compose configuration'))
    container = run(command + ['ps', '-q', 'mysql'], action='Locate MySQL container').decode().strip()
    if not container or '\n' in container:
        raise TransferError('Start the Compose mysql service before importing data.')
    if run(command + ['ps', '-q', 'app'], action='Check app state').strip():
        raise TransferError('Stop the app service before restoring data.')
    settings = config['services']['mysql']['environment']
    mounts = config['services']['app'].get('volumes', [])
    upload = next((mount for mount in mounts if mount['target'] == '/app/uploads' and mount['type'] == 'volume'), None)
    if not upload:
        raise TransferError('Expected a named CV volume mounted at /app/uploads.')
    volume = config['volumes'][upload['source']]['name']
    return Database({'container': container, 'database': settings['MYSQL_DATABASE'],
        'username': settings['MYSQL_USER'], 'password': settings['MYSQL_PASSWORD']}), volume


def volume_command(volume, image, shell):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{1,127}', volume):
        raise TransferError('Invalid uploads volume name.')
    return ['docker', 'run', '--rm', '-i', '--network', 'none', '--user', '0:0',
            '--mount', 'type=volume,src=' + volume + ',dst=/restore', '--entrypoint', 'sh', image, '-c', shell]


def restore(args):
    manifest, sql, files = read_bundle(args.bundle)
    if args.database_config:
        database = Database(json.loads(args.database_config.read_text()))
        if not args.uploads_volume:
            raise TransferError('--uploads-volume is required with --database-config.')
        volume = args.uploads_volume
    else:
        database, volume = compose_target(args)
    if database.query('SHOW TABLES;'):
        raise TransferError('Target database is not empty. Existing accounts/data were not changed.')
    empty_check = 'test -z "$(find /restore -mindepth 1 -maxdepth 1 -print -quit)"'
    run(volume_command(volume, args.helper_image, empty_check), action='Check empty uploads volume')
    if args.uploads_uid <= 0 or args.uploads_gid <= 0:
        raise TransferError('Upload UID/GID must be positive.')
    database.import_sql(sql)
    shell = 'tar -xf - -C /restore && chown -R "$1:$2" /restore && chmod 700 /restore'
    run(volume_command(volume, args.helper_image, shell) + ['restore', str(args.uploads_uid), str(args.uploads_gid)],
        data=uploads_tar(files), action='Restore CV files')
    actual = database.counts()
    if actual != manifest['tableCounts']:
        raise TransferError('Post-import table counts differ from the bundle. Leave the app stopped and inspect the import.')
    print(json.dumps({'restored': True, 'uploadsVolume': volume, **summary(manifest)}, ensure_ascii=False, indent=2))


def summary(manifest):
    return {'createdAt': manifest['createdAt'], 'users': manifest['tableCounts']['users'],
            'roles': manifest['roleCounts'], 'resumes': len(manifest['files']),
            'applications': manifest['tableCounts']['job_applications']}


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    out = commands.add_parser('export', help='Create a private snapshot of existing accounts and data.')
    out.add_argument('--database-config', type=Path, default=ROOT / '.local/qa-runtime.json')
    out.add_argument('--uploads-directory', type=Path, default=ROOT / '.local/qa-uploads')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    out.add_argument('--output', type=Path, default=ROOT / '.local/deploy-data' / ('smartrecruit-data-' + stamp + '.tar.gz'))
    incoming = commands.add_parser('restore', help='Import only into an empty MySQL database and empty CV volume.')
    incoming.add_argument('--bundle', type=Path, required=True)
    incoming.add_argument('--database-config', type=Path)
    incoming.add_argument('--uploads-volume')
    incoming.add_argument('--env-file', type=Path, default=ROOT / '.env')
    incoming.add_argument('--compose-file', type=Path, default=ROOT / 'infra/docker/compose.local.yml')
    incoming.add_argument('--uploads-uid', type=int, default=10001)
    incoming.add_argument('--uploads-gid', type=int, default=10001)
    incoming.add_argument('--helper-image', default='mysql:8.4.11')
    inspect = commands.add_parser('inspect', help='Validate a bundle and display counts without importing.')
    inspect.add_argument('--bundle', type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == 'export': export(args)
        elif args.command == 'restore': restore(args)
        else: print(json.dumps(summary(read_bundle(args.bundle)[0]), ensure_ascii=False, indent=2))
    except (TransferError, OSError, ValueError, KeyError, tarfile.TarError) as error:
        print('Data transfer stopped: ' + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
