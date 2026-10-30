#!/usr/bin/env python3
"""Audit resolved public Maven coordinates with OSV; fail on any active advisory or incomplete scan."""
import argparse
import datetime
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = 'https://api.osv.dev/v1/'


def request(endpoint, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(BASE + endpoint, data=data, headers={'Content-Type': 'application/json'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise RuntimeError('OSV request unavailable; scan is incomplete') from None
            time.sleep(2 ** attempt)


def coordinates(tree):
    found = set()
    def visit(node):
        if all(node.get(k) for k in ('groupId', 'artifactId', 'version')):
            found.add((node['groupId'] + ':' + node['artifactId'], node['version']))
        for child in node.get('children', []):
            visit(child)
    for child in tree.get('children', []):
        visit(child)
    if not found:
        raise ValueError('Resolved dependency tree is empty')
    return sorted(found)


def audit(packages):
    queries = [{'package': {'ecosystem': 'Maven', 'name': name}, 'version': version} for name, version in packages]
    response = request('querybatch', {'queries': queries})
    results = response.get('results', [])
    if len(results) != len(queries):
        raise ValueError('OSV response is incomplete')
    findings = []
    cache = {}
    for package, query, result in zip(packages, queries, results):
        advisories = list(result.get('vulns', []))
        token = result.get('next_page_token')
        while token:
            page = request('query', dict(query, page_token=token))
            advisories.extend(page.get('vulns', []))
            token = page.get('next_page_token')
        for item in advisories:
            advisory_id = item['id']
            if advisory_id not in cache:
                cache[advisory_id] = request('vulns/' + advisory_id)
            advisory = cache[advisory_id]
            if advisory.get('withdrawn'):
                continue
            findings.append({'package': package[0], 'version': package[1], 'id': advisory_id,
                             'severity': advisory.get('database_specific', {}).get('severity', 'unspecified'),
                             'url': 'https://osv.dev/vulnerability/' + advisory_id})
    return findings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('dependency_tree', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        packages = coordinates(json.loads(args.dependency_tree.read_text()))
        findings = audit(packages)
        report = {'complete': True, 'packages': len(packages), 'findings': findings}
        status = 1 if findings else 0
    except (ValueError, KeyError, RuntimeError, OSError) as failure:
        report = {'complete': False, 'error': str(failure)}
        status = 2
    report['scannedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return status


if __name__ == '__main__':
    sys.exit(main())
