from pathlib import Path
import tarfile
import tempfile
import unittest

from data_bundle import TransferError, add_bytes, read_bundle, safe_key, write_bundle


class DataBundleTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'data.tar.gz'
        self.manifest = {'createdAt': '2026-11-01T00:00:00Z', 'tableCounts': {'users': 1}, 'roleCounts': {'ROLE_CANDIDATE': 1}}

    def create(self):
        return write_bundle(self.path, b'CREATE TABLE test(id INT);', self.manifest, [('candidate/cv.pdf', b'private-cv')])

    def rewrite(self, change):
        with tarfile.open(self.path, 'r:gz') as archive:
            entries = {member.name: archive.extractfile(member).read() for member in archive.getmembers()}
        change(entries)
        with tarfile.open(self.path, 'w:gz') as archive:
            for name, data in entries.items(): add_bytes(archive, name, data)

    def test_round_trip_preserves_sql_and_cv_bytes_with_private_permissions(self):
        expected = self.create()
        manifest, sql, files = read_bundle(self.path)
        self.assertEqual(expected, manifest)
        self.assertEqual(b'CREATE TABLE test(id INT);', sql)
        self.assertEqual([('candidate/cv.pdf', b'private-cv')], files)
        self.assertEqual(0o600, self.path.stat().st_mode & 0o777)
        with self.assertRaises(FileExistsError): self.create()

    def test_tampered_database_is_rejected(self):
        self.create()
        self.rewrite(lambda entries: entries.update({'database.sql': b'changed'}))
        with self.assertRaisesRegex(TransferError, 'checksum'): read_bundle(self.path)

    def test_tampered_cv_is_rejected(self):
        self.create()
        self.rewrite(lambda entries: entries.update({'uploads/candidate/cv.pdf': b'changed-cv'}))
        with self.assertRaises(TransferError): read_bundle(self.path)

    def test_path_traversal_and_absolute_cv_paths_are_rejected(self):
        for key in ['../escape', '/etc/passwd', 'candidate/../escape', 'candidate\\escape', './cv.pdf']:
            with self.subTest(key=key), self.assertRaises(TransferError): safe_key(key)

    def test_extra_members_are_rejected(self):
        self.create()
        self.rewrite(lambda entries: entries.update({'uploads/../outside': b'bad'}))
        with self.assertRaisesRegex(TransferError, 'unexpected'): read_bundle(self.path)

    def test_symlinks_cannot_be_restored(self):
        self.create()
        with tarfile.open(self.path, 'r:gz') as archive:
            entries = {m.name: archive.extractfile(m).read() for m in archive.getmembers()}
        with tarfile.open(self.path, 'w:gz') as archive:
            for name, data in entries.items(): add_bytes(archive, name, data)
            link = tarfile.TarInfo('uploads/link'); link.type = tarfile.SYMTYPE; link.linkname = '/etc/passwd'; archive.addfile(link)
        with self.assertRaisesRegex(TransferError, 'non-regular'): read_bundle(self.path)


if __name__ == '__main__': unittest.main()
