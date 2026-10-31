"""Private, checksummed database/CV bundle. No API keys or plaintext passwords are exported."""
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import tarfile


class TransferError(RuntimeError):
    pass


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_key(key):
    path = PurePosixPath(key)
    if not key or path.is_absolute() or '..' in path.parts or '\\' in key or str(path) != key:
        raise TransferError('Invalid CV storage path in bundle.')
    return key


def add_bytes(archive, name, data):
    info = tarfile.TarInfo(name)
    info.size = len(data)
    info.mode = 0o600
    archive.addfile(info, io.BytesIO(data))


def write_bundle(destination, database_sql, manifest, files):
    """Exclusive creation avoids accidentally replacing an earlier backup."""
    manifest = {**manifest, 'formatVersion': 1, 'databaseSha256': digest(database_sql), 'files': []}
    contents = []
    for key, data in files:
        safe_key(key)
        manifest['files'].append({'key': key, 'size': len(data), 'sha256': digest(data)})
        contents.append((key, data))
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open('xb') as output:
        destination.chmod(0o600)
        with tarfile.open(fileobj=output, mode='w:gz') as archive:
            add_bytes(archive, 'manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2).encode())
            add_bytes(archive, 'database.sql', database_sql)
            for key, data in contents:
                add_bytes(archive, 'uploads/' + key, data)
    return manifest


def read_bundle(source):
    """Validate every member before any SQL is imported or any CV is written."""
    with tarfile.open(source, 'r:gz') as archive:
        members = archive.getmembers()
        if any(not member.isfile() for member in members) or len({m.name for m in members}) != len(members):
            raise TransferError('Bundle contains duplicate names or non-regular files.')
        by_name = {member.name: member for member in members}
        if 'manifest.json' not in by_name or 'database.sql' not in by_name:
            raise TransferError('Bundle is missing its manifest or database.')
        if by_name['manifest.json'].size > 10 * 1024 * 1024 or sum(m.size for m in members) > 2 * 1024**3:
            raise TransferError('Bundle exceeds supported size limits.')
        manifest = json.loads(archive.extractfile('manifest.json').read())
        if manifest.get('formatVersion') != 1:
            raise TransferError('Unsupported bundle format.')
        sql = archive.extractfile('database.sql').read()
        if digest(sql) != manifest.get('databaseSha256'):
            raise TransferError('Database checksum mismatch.')
        files = []
        expected = {'manifest.json', 'database.sql'}
        keys = set()
        for entry in manifest['files']:
            key = safe_key(entry['key'])
            if key in keys:
                raise TransferError('Duplicate CV in manifest.')
            keys.add(key)
            name = 'uploads/' + key
            expected.add(name)
            if name not in by_name or by_name[name].size != entry['size']:
                raise TransferError('Missing CV or CV size mismatch.')
            data = archive.extractfile(name).read()
            if digest(data) != entry['sha256']:
                raise TransferError('CV checksum mismatch.')
            files.append((key, data))
        if expected != set(by_name):
            raise TransferError('Bundle contains unexpected files.')
        return manifest, sql, files


def uploads_tar(files):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode='w') as archive:
        for key, data in files:
            add_bytes(archive, safe_key(key), data)
    return output.getvalue()
