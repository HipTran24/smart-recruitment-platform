#!/usr/bin/env python3
"""Fail on high/critical CodeQL findings or error-level results; retain all findings in the report."""
import argparse
import json
import sys
from pathlib import Path


def inspect(paths):
    findings = []
    if not paths:
        raise ValueError('No SARIF files were produced')
    for path in paths:
        data = json.loads(path.read_text())
        if data.get('version') != '2.1.0' or not data.get('runs'):
            raise ValueError('Missing or invalid SARIF runs')
        for run in data['runs']:
            driver = run.get('tool', {}).get('driver', {})
            if driver.get('name') != 'CodeQL':
                raise ValueError('Expected CodeQL analysis')
            if any(not invocation.get('executionSuccessful', False) for invocation in run.get('invocations', [])):
                raise ValueError('Analysis invocation did not succeed')
            components = [driver, *run.get('tool', {}).get('extensions', [])]
            rules = {rule['id']: rule for component in components for rule in component.get('rules', [])}
            for result in run.get('results', []):
                rule_id = result.get('ruleId', '')
                rule = rules.get(rule_id)
                if rule is None:
                    raise ValueError('Missing rule metadata: ' + rule_id)
                properties = rule.get('properties', {})
                if 'security' in properties.get('tags', []) and 'security-severity' not in properties:
                    raise ValueError('Missing security severity: ' + rule_id)
                score = float(rule.get('properties', {}).get('security-severity', 0))
                level = result.get('level', rule.get('defaultConfiguration', {}).get('level', 'warning'))
                locations = result.get('locations', [])
                location = locations[0].get('physicalLocation', {}) if locations else {}
                findings.append({'rule': rule_id, 'score': score, 'level': level,
                                 'file': location.get('artifactLocation', {}).get('uri'),
                                 'line': location.get('region', {}).get('startLine'),
                                 'blocking': score >= 7.0 or level == 'error'})
    return findings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        findings = inspect(sorted(args.directory.rglob('*.sarif')))
        report = {'complete': True, 'findings': findings, 'blocking': sum(item['blocking'] for item in findings)}
        code = 1 if report['blocking'] else 0
    except (ValueError, KeyError, TypeError, OSError) as error:
        report = {'complete': False, 'error': str(error)}
        code = 2
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return code


if __name__ == '__main__':
    sys.exit(main())
