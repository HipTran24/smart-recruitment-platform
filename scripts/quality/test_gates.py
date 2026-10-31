"""Synthetic negative controls for the CI gates, never evidence of a real security scan."""
import json
import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import dependency_audit
import sarif_gate


class GateTests(unittest.TestCase):
    def test_review_requires_unchanged_source_and_is_invalidated_by_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'fixture.java'
            source.write_text('synthetic negative test fixture')
            review = root / 'reviews.json'
            item = {'rule': 'synthetic-rule', 'file': source.name, 'line': 1,
                    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                    'classification': 'false-positive', 'reason': 'Synthetic review control',
                    'evidence': ['synthetic negative test']}
            review.write_text(json.dumps({'version': 1, 'findings': [item]}))
            self.assertIn(('synthetic-rule', source.name, 1), sarif_gate.load_reviews(review, root))
            source.write_text('changed code must be reviewed again')
            with self.assertRaises(ValueError):
                sarif_gate.load_reviews(review, root)

    def test_review_applies_only_to_exact_rule_file_and_line_and_remains_visible(self):
        rule = {'id': 'synthetic-high', 'properties': {'security-severity': '8.8'}}
        results = [{'ruleId': rule['id'], 'locations': [{'physicalLocation': {
            'artifactLocation': {'uri': 'fixture.java'}, 'region': {'startLine': line}}}]} for line in [1, 2]]
        run = {'tool': {'driver': {'name': 'CodeQL', 'rules': [rule]}}, 'results': results}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fixture.sarif'
            path.write_text(json.dumps({'version': '2.1.0', 'runs': [run]}))
            findings = sarif_gate.inspect([path], {('synthetic-high', 'fixture.java', 1): 'Synthetic reviewed result'})
            self.assertEqual([False, True], [item['blocking'] for item in findings])
            self.assertTrue(findings[0]['reviewedFalsePositive'])
            self.assertEqual(8.8, findings[0]['score'])

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
            {'id': 'synthetic-medium', 'properties': {'security-severity': '5.0'}}, {'id': 'synthetic-error'}]}},
            'results': [{'ruleId': 'synthetic-high'}, {'ruleId': 'synthetic-medium'}, {'ruleId': 'synthetic-error', 'level': 'error'}]}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fixture.sarif'
            path.write_text(json.dumps({'version': '2.1.0', 'runs': [run]}))
            self.assertEqual([True, False, True], [item['blocking'] for item in sarif_gate.inspect([path])])

    def test_codeql_extension_rule_severity_is_enforced(self):
        run={'tool':{'driver':{'name':'CodeQL'},'extensions':[{'rules':[{'id':'synthetic-extension','properties':{'tags':['security'],'security-severity':'8.8'}}]}]},'results':[{'ruleId':'synthetic-extension'}]}
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'extension.sarif'
            path.write_text(json.dumps({'version':'2.1.0','runs':[run]}))
            self.assertTrue(sarif_gate.inspect([path])[0]['blocking'])
            run['tool']['extensions']=[]
            path.write_text(json.dumps({'version':'2.1.0','runs':[run]}))
            with self.assertRaises(ValueError): sarif_gate.inspect([path])

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
