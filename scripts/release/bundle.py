#!/usr/bin/env python3
"""Versioned CI artifact bundles and an isolated atomic artifact selector. Never deploys a service or DB."""
import argparse
import datetime
import fcntl
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import tarfile
import zipfile
from pathlib import Path

VERSION = re.compile(r'\d+\.\d+\.\d+(?:-[A-Za-z0-9][A-Za-z0-9.-]*)?')


def valid_version(value):
    if len(value)>64 or not VERSION.fullmatch(value):
        raise ValueError('Version must be semver without path/shell characters')
    return value


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def jar_version(path):
    with zipfile.ZipFile(path) as archive:
        text = archive.read('META-INF/maven/com.recruitment/application/pom.properties').decode()
    for line in text.splitlines():
        if line.startswith('version='):
            return line.split('=', 1)[1]
    raise ValueError('JAR has no Maven version')


def archive_files(root, paths, destination):
    with destination.open('wb') as raw:
        with gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0) as zipped:
            with tarfile.open(fileobj=zipped, mode='w') as archive:
                for path in sorted(paths):
                    if path.is_symlink():
                        raise ValueError('Artifact sources must not contain symlinks')
                    if path.is_file():
                        info = archive.gettarinfo(str(path), str(path.relative_to(root)))
                        info.uid = info.gid = info.mtime = 0
                        info.uname = info.gname = ''
                        with path.open('rb') as content:
                            archive.addfile(info, content)


def create(jar, frontend, output, version, revision, dirty, migrations, review_head=None):
    valid_version(version)
    if jar_version(jar) != version:
        raise ValueError('Manifest version must match the tested JAR version')
    if output.exists():
        raise ValueError('Output must be new; refusing to overwrite a bundle')
    output.mkdir(parents=True)
    shutil.copyfile(jar, output / 'api.jar')
    archive_files(frontend, frontend.rglob('*'), output / 'frontend.tar.gz')
    archive_files(migrations, migrations.glob('V*.sql'), output / 'migrations.tar.gz')
    if not (frontend / 'index.html').is_file():
        raise ValueError('Frontend production build is missing index.html')
    manifest = {'version': version, 'sourceCommit': revision, 'reviewHeadCommit': review_head or revision,
                'gitDirty': dirty, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'promotionStatus': 'UNAPPROVED_CI_ARTIFACT',
                'files': {name: digest(output / name) for name in ('api.jar', 'frontend.tar.gz', 'migrations.tar.gz')},
                'migrations': {p.name: digest(p) for p in sorted(migrations.glob('V*.sql'))}}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    names = ('api.jar', 'frontend.tar.gz', 'migrations.tar.gz', 'manifest.json')
    (output / 'checksums.sha256').write_text(''.join(digest(output / name) + '  ' + name + '\n' for name in names))
    return manifest


def verify(bundle):
    manifest = json.loads((bundle / 'manifest.json').read_text())
    valid_version(manifest['version'])
    if not re.fullmatch(r'[a-f0-9]{40}', manifest['sourceCommit']) or manifest.get('gitDirty') is not False:
        raise ValueError('Bundle must identify a clean committed source tree')
    if set(manifest['files']) != {'api.jar', 'frontend.tar.gz', 'migrations.tar.gz'}:
        raise ValueError('Unexpected artifact inventory')
    for name, expected in manifest['files'].items():
        if digest(bundle / name) != expected:
            raise ValueError('Artifact checksum mismatch: ' + name)
    expected = ''.join(digest(bundle / name) + '  ' + name + '\n' for name in ('api.jar', 'frontend.tar.gz', 'migrations.tar.gz', 'manifest.json'))
    if (bundle / 'checksums.sha256').read_text() != expected:
        raise ValueError('Bundle checksum inventory mismatch')
    if jar_version(bundle / 'api.jar') != manifest['version']:
        raise ValueError('JAR version differs from manifest')
    with tarfile.open(bundle / 'frontend.tar.gz') as archive:
        names = []
        for member in archive.getmembers():
            path = Path(member.name)
            if path.is_absolute() or '..' in path.parts or not member.isfile():
                raise ValueError('Unsafe frontend archive member')
            names.append(member.name)
        if 'index.html' not in names:
            raise ValueError('Frontend archive missing entry point')
    if not manifest.get('migrations'):
        raise ValueError('Migration inventory must not be empty')
    with tarfile.open(bundle / 'migrations.tar.gz') as archive:
        actual = {}
        for member in archive.getmembers():
            if not member.isfile() or not re.fullmatch(r'V[0-9]+__[A-Za-z0-9_]+\.sql', member.name):
                raise ValueError('Unsafe migration archive member')
            with archive.extractfile(member) as content:
                actual[member.name] = hashlib.file_digest(content, 'sha256').hexdigest()
        if actual != manifest['migrations']:
            raise ValueError('Migration archive differs from manifest')
    return manifest


def replace_link(state, name, target):
    path = state / name
    if path.exists() and not path.is_symlink():
        raise ValueError('Refusing to replace a non-symlink selector')
    temporary = state / (name + '.next')
    if temporary.exists() or temporary.is_symlink():
        raise ValueError('Another selector update is incomplete')
    temporary.symlink_to(target)
    os.replace(temporary, path)


def select(state, bundle=None, rollback=False):
    state.mkdir(parents=True, exist_ok=True)
    with (state / 'activation.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        current = state / 'current'
        previous = state / 'previous'
        if (current.exists() and not current.is_symlink()) or (previous.exists() and not previous.is_symlink()):
            raise ValueError('Selectors must be managed symlinks')
        old = os.readlink(current) if current.is_symlink() else None
        if rollback:
            if not previous.is_symlink():
                raise ValueError('No previous verified artifact exists')
            target = os.readlink(previous)
            verify((state / target).resolve())
        else:
            manifest = verify(bundle)
            name = manifest['version'] + '-' + manifest['sourceCommit'][:12]
            target = 'releases/' + name
            destination = state / target
            if destination.exists():
                existing = verify(destination)
                if existing['files'] != manifest['files'] or existing['sourceCommit'] != manifest['sourceCommit']:
                    raise ValueError('Immutable release identity collision')
            else:
                destination.parent.mkdir(exist_ok=True)
                shutil.copytree(bundle, destination)
                verify(destination)
        # The service selector changes atomically only after artifact validation.
        if old and old != target:
            replace_link(state, 'previous', old)
        replace_link(state, 'current', target)
        return target


def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()


def main():
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest='command', required=True)
    build = commands.add_parser('create')
    build.add_argument('--jar', type=Path, required=True)
    build.add_argument('--frontend', type=Path, required=True)
    build.add_argument('--output', type=Path, required=True)
    build.add_argument('--version', required=True)
    check = commands.add_parser('verify'); check.add_argument('bundle', type=Path)
    for name in ('activate', 'rollback'):
        command = commands.add_parser(name); command.add_argument('--state-dir', type=Path, required=True)
        if name == 'activate': command.add_argument('bundle', type=Path)
    args = parser.parse_args()
    try:
        if args.command == 'create':
            result = create(args.jar, args.frontend, args.output, args.version, git('rev-parse', 'HEAD'),
                            bool(git('status', '--porcelain')), Path('src/main/resources/db/migration'),
                            os.environ.get('PR_HEAD_SHA') or None)
        elif args.command == 'verify': result = verify(args.bundle)
        else: result = {'selected': select(args.state_dir, getattr(args, 'bundle', None), args.command == 'rollback')}
        print(json.dumps(result, indent=2))
    except (ValueError, KeyError, OSError, tarfile.TarError, zipfile.BadZipFile) as error:
        parser.exit(1, 'Release operation rejected: ' + str(error) + '\n')


if __name__ == '__main__':
    main()
