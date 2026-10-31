import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = Path(__file__).with_name('deploy-lightsail.sh').read_text()
ENVIRONMENT_SCRIPT = SCRIPT.split("python3 - <<'PY'\n", 1)[1].split('\nPY\n', 1)[0]


class DeployEnvironmentTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / '.env.example').write_text((ROOT / '.env.example').read_text())

    def apply(self, key='test-only-deepseek-value'):
        env = {k: v for k, v in os.environ.items() if k != 'DEEPSEEK_API_KEY'}
        if key: env['DEEPSEEK_API_KEY'] = key
        return subprocess.run([sys.executable, '-c', ENVIRONMENT_SCRIPT], cwd=self.root,
                              env=env, text=True, capture_output=True)

    def values(self):
        return dict(line.split('=', 1) for line in (self.root / '.env').read_text().splitlines()
                    if '=' in line and not line.startswith('#'))

    def test_first_boot_uses_random_database_passwords_and_enables_deepseek(self):
        result = self.apply(); self.assertEqual(0, result.returncode)
        values = self.values()
        self.assertGreaterEqual(len(values['MYSQL_PASSWORD']), 32)
        self.assertNotEqual(values['MYSQL_PASSWORD'], values['MYSQL_ROOT_PASSWORD'])
        self.assertEqual('true', values['DEEPSEEK_ENABLED'])
        self.assertEqual('false', values['GEMINI_ENABLED'])
        self.assertEqual(0o600, (self.root / '.env').stat().st_mode & 0o777)
        self.assertNotIn(values['MYSQL_PASSWORD'], result.stdout + result.stderr)
        self.assertNotIn(values['DEEPSEEK_API_KEY'], result.stdout + result.stderr)

    def test_redeploy_preserves_existing_database_credentials_and_updates_only_the_provider_key(self):
        self.assertEqual(0, self.apply().returncode)
        original = self.values()
        self.assertEqual(0, self.apply('replacement-test-only-key').returncode)
        updated = self.values()
        for name in ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD']:
            self.assertEqual(original[name], updated[name])
        self.assertEqual('replacement-test-only-key', updated['DEEPSEEK_API_KEY'])

    def test_missing_provider_key_stops_before_writing_environment(self):
        result = self.apply(None)
        self.assertNotEqual(0, result.returncode)
        self.assertFalse((self.root / '.env').exists())

    def test_existing_provider_key_is_retained_without_a_new_github_secret(self):
        self.assertEqual(0, self.apply().returncode)
        before = self.values()
        self.assertEqual(0, self.apply(None).returncode)
        self.assertEqual(before['DEEPSEEK_API_KEY'], self.values()['DEEPSEEK_API_KEY'])


if __name__ == '__main__': unittest.main()
