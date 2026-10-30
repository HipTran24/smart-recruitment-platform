"""Synthetic negative controls for the CI gates, never evidence of a real security scan."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import dependency_audit
import sarif_gate


class GateTests(unittest.TestCase):
    def test_missing_or_failed_sast_cannot_be_green(self):
        with self.assertRaises(ValueError):
            sarif_gate.inspect([])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fixture.sarif'
            path.write_text(json.dumps({'version': '2.1.0', 'runs': []}))
            with self.assertRaises(ValueError):
                sarif_gate.inspect([path])

    def test_high_and_error_findings_block_but_warnings_stay_in_report(self):
        run = {'tool': {'driver': {'name': 'CodeQL', 'rules': [
            {'id': 'synthetic-high', 'properties': {'security-severity': '7.0'}},
            {'id': 'synthetic-medium', 'properties': {'security-severity': '5.0'}}]}},
            'results': [{'ruleId': 'synthetic-high'}, {'ruleId': 'synthetic-medium'}, {'ruleId': 'synthetic-error', 'level': 'error'}]}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fixture.sarif'
            path.write_text(json.dumps({'version': '2.1.0', 'runs': [run]}))
            self.assertEqual([True, False, True], [item['blocking'] for item in sarif_gate.inspect([path])])

    def test_empty_dependency_inventory_cannot_pass(self):
        with self.assertRaises(ValueError):
            dependency_audit.coordinates({})

    def test_osv_failure_or_active_advisory_is_not_success(self):
        with patch.object(dependency_audit, 'request', return_value={'results': []}):
            with self.assertRaises(ValueError):
                dependency_audit.audit([('synthetic:fixture', '1')])
        with patch.object(dependency_audit, 'request', side_effect=[{'results': [{'vulns': [{'id': 'SYNTHETIC'}]}]}, {'id': 'SYNTHETIC'}]):
            self.assertEqual(1, len(dependency_audit.audit([('synthetic:fixture', '1')])))


if __name__ == '__main__':
    unittest.main()
