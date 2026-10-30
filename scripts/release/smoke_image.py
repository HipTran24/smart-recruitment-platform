#!/usr/bin/env python3
"""Exercise the actual candidate image in an isolated network, without credentials or deployment."""
import argparse
import json
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('image')
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
image = json.loads(subprocess.check_output(['docker', 'image', 'inspect', args.image], text=True))[0]
if image['Config']['User'] != '10001:10001':
    raise SystemExit('Candidate image must run as the expected non-root user')
result = subprocess.run(['docker', 'run', '--rm', '--network', 'none', args.image,
                         '--spring.profiles.active=production'], capture_output=True, text=True, timeout=60)
log = result.stdout + result.stderr
if result.returncode == 0 or 'Production configuration rejected' not in log or 'HikariPool' in log:
    raise SystemExit('Image failed the missing-production-configuration safety smoke')
args.output.parent.mkdir(parents=True, exist_ok=True)
report = {'imageId': image['Id'], 'platform': image['Os'] + '/' + image['Architecture'],
          'user': image['Config']['User'], 'missingConfigExit': result.returncode,
          'guardRejected': True, 'databasePoolStarted': False, 'registryPublished': False}
args.output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
