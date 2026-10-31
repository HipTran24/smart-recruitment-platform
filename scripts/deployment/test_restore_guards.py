import argparse
import importlib.util
import json
from pathlib import Path
import tempfile
import tarfile
import unittest
from unittest.mock import Mock, patch

from data_bundle import TransferError, write_bundle

spec = importlib.util.spec_from_file_location('manage_data', Path(__file__).with_name('manage-data.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RestoreGuardTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.bundle = Path(self.directory.name) / 'data.tar.gz'
        write_bundle(self.bundle, b'SQL', {'createdAt': '2026-11-01', 'tableCounts': {'users': 1}, 'roleCounts': {}}, [])
        self.args = argparse.Namespace(bundle=self.bundle, database_config=None, uploads_volume=None,
            helper_image='mysql:8.4.11', uploads_uid=10001, uploads_gid=10001)
        self.database = Mock()

    def test_nonempty_database_is_never_overwritten(self):
        self.database.query.return_value = ['users']
        with patch.object(module, 'compose_target', return_value=(self.database, 'cv-data')), patch.object(module, 'run') as docker:
            with self.assertRaisesRegex(TransferError, 'not empty'): module.restore(self.args)
        self.database.import_sql.assert_not_called()
        docker.assert_not_called()

    def test_nonempty_cv_volume_stops_before_importing_any_accounts(self):
        self.database.query.return_value = []
        with (
            patch.object(module, 'compose_target', return_value=(self.database, 'cv-data')),
            patch.object(module, 'run', side_effect=TransferError('volume not empty')),
        ):
            with self.assertRaises(TransferError): module.restore(self.args)
        self.database.import_sql.assert_not_called()

    def test_invalid_bundle_stops_before_connecting_to_the_target(self):
        self.bundle.write_bytes(b'invalid bundle')
        with patch.object(module, 'compose_target') as target:
            with self.assertRaises(tarfile.ReadError): module.restore(self.args)
        target.assert_not_called()

    def compose_config(self):
        return {'services': {'mysql': {'environment': {'MYSQL_DATABASE': 'app_db', 'MYSQL_USER': 'app', 'MYSQL_PASSWORD': 'test-only-password'}},
                'app': {'volumes': [{'type': 'volume', 'source': 'resume-data', 'target': '/app/uploads'}]}},
                'volumes': {'resume-data': {'name': 'smart-recruitment_resume-data'}}}

    def test_compose_target_uses_the_configured_database_and_named_cv_volume(self):
        args = argparse.Namespace(env_file=Path('.env'), compose_file=Path('compose.yml'))
        responses = [json.dumps(self.compose_config()).encode(), b'actual-mysql-container\n', b'']
        with patch.object(module, 'run', side_effect=responses): database, volume = module.compose_target(args)
        self.assertEqual('actual-mysql-container', database.container)
        self.assertEqual('app_db', database.database)
        self.assertEqual('smart-recruitment_resume-data', volume)

    def test_restore_rejects_a_running_app_before_importing(self):
        args = argparse.Namespace(env_file=Path('.env'), compose_file=Path('compose.yml'))
        responses = [json.dumps(self.compose_config()).encode(), b'mysql-id', b'app-id']
        with patch.object(module, 'run', side_effect=responses), self.assertRaisesRegex(TransferError, 'Stop the app'):
            module.compose_target(args)

    def test_restore_rejects_an_unexpected_upload_storage_mount(self):
        args = argparse.Namespace(env_file=Path('.env'), compose_file=Path('compose.yml'))
        config = self.compose_config(); config['services']['app']['volumes'][0]['type'] = 'bind'
        with patch.object(module, 'run', side_effect=[json.dumps(config).encode(), b'mysql-id', b'']), self.assertRaisesRegex(TransferError, 'named CV volume'):
            module.compose_target(args)


if __name__ == '__main__': unittest.main()
