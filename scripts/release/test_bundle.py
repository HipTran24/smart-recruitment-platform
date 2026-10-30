"""Artifact selector/rollback tests use explicitly synthetic bundles, never a production deployment."""
import tempfile
import unittest
import zipfile
from pathlib import Path
import bundle


class BundleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def fixture(self, version, revision='a' * 40):
        directory = self.root / ('input-' + version); directory.mkdir()
        jar = directory / 'api.jar'
        with zipfile.ZipFile(jar, 'w') as archive:
            archive.writestr('META-INF/maven/com.recruitment/application/pom.properties', 'version=' + version + '\n')
            archive.writestr('synthetic.txt', version)
        frontend = directory / 'dist'; frontend.mkdir(); (frontend / 'index.html').write_text('synthetic-' + version)
        (directory / 'V001__synthetic_fixture.sql').write_text('-- Synthetic fixture, never executed\n')
        result = self.root / ('bundle-' + version)
        bundle.create(jar, frontend, result, version, revision, False, directory)
        return result

    def test_verified_activation_and_rollback_preserve_immutable_payloads(self):
        first = self.fixture('1.0.0'); second = self.fixture('1.0.1', 'b' * 40); state = self.root / 'state'
        bundle.select(state, first); bundle.select(state, second)
        self.assertEqual('1.0.1', bundle.verify((state / 'current').resolve())['version'])
        bundle.select(state, rollback=True)
        self.assertEqual('1.0.0', bundle.verify((state / 'current').resolve())['version'])
        self.assertEqual(bundle.digest(first / 'api.jar'), bundle.digest(state / 'current/api.jar'))

    def test_tampering_cannot_replace_the_current_selection(self):
        first = self.fixture('1.0.0'); second = self.fixture('1.0.1'); state = self.root / 'state'
        bundle.select(state, first); (second / 'api.jar').write_bytes(b'tampered')
        with self.assertRaises(ValueError): bundle.select(state, second)
        self.assertEqual('1.0.0', bundle.verify((state / 'current').resolve())['version'])

    def test_no_previous_release_cannot_fake_a_rollback(self):
        with self.assertRaises(ValueError): bundle.select(self.root / 'state', rollback=True)

    def test_path_traversal_versions_are_rejected(self):
        for version in ('../main', '1.0.0;echo bad', 'v1.0.0', '1.0'):
            with self.assertRaises(ValueError): bundle.valid_version(version)

    def test_regular_user_files_are_never_replaced_by_activation(self):
        state = self.root / 'state'; state.mkdir(); (state / 'current').write_text('user file')
        with self.assertRaises(ValueError): bundle.select(state, self.fixture('1.0.0'))
        self.assertEqual('user file', (state / 'current').read_text())

    def test_embedded_jar_version_must_match_bundle_version(self):
        source = self.fixture('1.0.0')
        with self.assertRaises(ValueError):
            bundle.create(source / 'api.jar', self.root, self.root / 'invalid', '1.0.1', 'a' * 40, False, self.root)


if __name__ == '__main__': unittest.main()
