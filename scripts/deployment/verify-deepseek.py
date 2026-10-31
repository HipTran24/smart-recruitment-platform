#!/usr/bin/env python3
"""Verify the configured provider with a tiny non-personal request; never print credentials."""
import json
from pathlib import Path
import urllib.request
import urllib.error

values = dict(line.split('=', 1) for line in Path('.env').read_text().splitlines()
              if '=' in line and not line.lstrip().startswith('#'))
if values.get('DEEPSEEK_ENABLED') != 'true' or not values.get('DEEPSEEK_API_KEY'):
    raise SystemExit('DeepSeek is not enabled in the VPS environment.')
body = {'model': values.get('DEEPSEEK_MODEL', 'deepseek-flash'), 'stream': False,
        'messages': [{'role': 'user', 'content': 'Return JSON: {"healthy":true}'}],
        'response_format': {'type': 'json_object'}, 'thinking': {'type': 'disabled'}, 'max_tokens': 32}
request = urllib.request.Request('https://api.deepseek.com/chat/completions', data=json.dumps(body).encode(),
          headers={'Authorization': 'Bearer ' + values['DEEPSEEK_API_KEY'], 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(request, timeout=45) as response:
        result = json.load(response)
        assert json.loads(result['choices'][0]['message']['content'])['healthy'] is True
        print(json.dumps({'deepseekHttpStatus': response.status, 'model': result.get('model'), 'healthy': True}))
except urllib.error.HTTPError as failure:
    raise SystemExit('DeepSeek verification returned HTTP ' + str(failure.code) + '; provider body suppressed.') from None
