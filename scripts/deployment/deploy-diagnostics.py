#!/usr/bin/env python3
"""Print bounded startup diagnostics without leaking runtime secrets."""
from pathlib import Path
import re
import subprocess

values = []
env_file = Path('.env')
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            if re.search(r'PASSWORD|SECRET|TOKEN|API_KEY', key) and len(value) >= 6:
                values.append(value.strip().strip('\"\''))

compose = ['docker', 'compose', '--env-file', '.env', '-f', 'infra/docker/compose.prod.yml']
for args in [['ps', '-a'], ['logs', '--no-color', '--tail', '100', 'app', 'frontend']]:
    result = subprocess.run(compose + args, text=True, capture_output=True)
    output = result.stdout + result.stderr
    for value in sorted(values, key=len, reverse=True):
        output = output.replace(value, '[REDACTED]')
    output = re.sub(r'-----BEGIN .*?PRIVATE KEY-----.*?-----END .*?PRIVATE KEY-----', '[REDACTED PRIVATE KEY]', output, flags=re.S)
    print(output[-30000:])
