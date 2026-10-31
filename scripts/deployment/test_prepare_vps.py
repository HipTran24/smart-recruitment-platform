import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


spec = importlib.util.spec_from_file_location('prepare_vps', Path(__file__).with_name('prepare-vps.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class EphemeralMigrationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        previous = Path.cwd()
        os.chdir(self.directory.name)
        self.addCleanup(os.chdir, previous)
        self.values = {'MYSQL_DATABASE': 'app_db', 'MYSQL_USER': 'runtime',
                       'MYSQL_ROOT_PASSWORD': 'test-root-value', 'MIGRATION_DB_USERNAME': 'migrator'}
        Path('.env').write_text('\n'.join(k + '=' + v for k, v in self.values.items()) + '\n')

    def test_removes_legacy_migration_password_without_changing_other_configuration(self):
        with Path('.env').open('a') as handle:
            handle.write('MIGRATION_DB_PASSWORD=legacy-test-value\n')
        module.save_env({'APP_MIGRATION_ENABLED': 'false'}, remove=('MIGRATION_DB_PASSWORD',))
        self.assertNotIn('MIGRATION_DB_PASSWORD', Path('.env').read_text())
        self.assertEqual(self.values['MYSQL_ROOT_PASSWORD'], module.read_env()['MYSQL_ROOT_PASSWORD'])
        self.assertEqual(0o600, Path('.env').stat().st_mode & 0o777)

    def exercise_migration(self, failure):
        calls = []
        def command(args, **kwargs):
            calls.append((args, kwargs))
            if args[-3:] == ['ps', '-q', 'mysql']:
                return b'mysql-container\n'
            if 'mysqldump' in args:
                return b'-- synthetic schema backup'
            if 'run' in args and failure:
                raise RuntimeError('Synthetic migration failure')
            return b''
        before = Path('.env').read_bytes()
        with patch.object(module, 'run', side_effect=command):
            if failure:
                with self.assertRaisesRegex(RuntimeError, 'Synthetic migration failure'):
                    module.database()
            else:
                module.database()
        self.assertEqual(before, Path('.env').read_bytes())
        self.assertIn(b'ACCOUNT LOCK', calls[-1][1]['data'])
        migration = next((args, options) for args, options in calls if 'run' in args)
        self.assertIn('MIGRATION_DB_PASSWORD', migration[0])
        temporary = migration[1]['env']['MIGRATION_DB_PASSWORD']
        self.assertGreaterEqual(len(temporary), 32)
        self.assertNotIn(temporary, ' '.join(migration[0]))
        for path in Path('.').rglob('*'):
            if path.is_file():
                self.assertNotIn(temporary.encode(), path.read_bytes())

    def test_successful_migration_never_persists_secret_and_locks_identity(self):
        self.exercise_migration(False)

    def test_failed_migration_also_locks_identity(self):
        self.exercise_migration(True)


if __name__ == '__main__':
    unittest.main()
