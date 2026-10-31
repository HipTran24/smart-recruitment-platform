#!/usr/bin/env python3
"""Create isolated local QA candidates, then upload and apply each supplied CV via the real API."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import subprocess
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--directories', nargs='+', required=True)
parser.add_argument('--database-config', type=Path, default=ROOT / '.local/qa-runtime.json')
parser.add_argument('--recruiter-credentials', type=Path, default=ROOT / '.local/role-test-accounts.json')
parser.add_argument('--manifest', type=Path, default=ROOT / '.local/cv-test-fixtures.json')
parser.add_argument('--base-url', default='http://localhost:8444')
parser.add_argument('--job-id', type=int, required=True)
parser.add_argument('--accounts-only', action='store_true')
args = parser.parse_args()
config = json.loads(args.database_config.read_text())
if config['database'] != 'smartrecruit_qa':
    raise SystemExit('This fixture script only writes to the isolated smartrecruit_qa database.')


def sql(statement):
    env = os.environ.copy()
    env['MYSQL_PWD'] = config['password']
    result = subprocess.run(['docker', 'exec', '-i', '-e', 'MYSQL_PWD', config['container'],
                             'mysql', '-u' + config['username'], '-N', config['database']],
                            input=statement, text=True, capture_output=True, env=env, check=True)
    return result.stdout.strip()


def literal(value):
    return "CONVERT(0x" + str(value).encode('utf-8').hex() + " USING utf8mb4)"


def save():
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
    args.manifest.chmod(0o600)


def api(path, body=None, token=None, method=None, raw=None, content_type='application/json'):
    headers = {'Content-Type': content_type}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    payload = raw if raw is not None else json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(args.base_url + path, data=payload, headers=headers,
                                     method=method or ('POST' if payload is not None else 'GET'))
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read()
            return json.loads(data) if data else None
    except urllib.error.HTTPError as error:
        raise RuntimeError(f'{method or request.method} {path} returned HTTP {error.code}') from None


state = json.loads(args.manifest.read_text()) if args.manifest.exists() else {'jobId': args.job_id, 'candidates': []}
if state['jobId'] != args.job_id:
    raise SystemExit('Use another manifest for a different test job.')
files = []
for directory in args.directories:
    for index, file in enumerate(sorted(Path(directory).glob('*.pdf')), 1):
        files.append((file, index))
known = {row['source']: row for row in state['candidates']}
new_rows = []
for file, index in files:
    source = str(file.resolve())
    if source in known:
        if known[source]['sha256'] != hashlib.sha256(file.read_bytes()).hexdigest():
            raise SystemExit('A source CV changed; use a fresh manifest for ' + file.name)
        continue
    group = file.parent.name.zfill(2)
    email = f'cv{group}.{index:02d}@smartrecruit.local'
    if sql('SELECT id FROM users WHERE email=' + literal(email)):
        email = f'cv{group}.{index:02d}.{secrets.token_hex(2)}@smartrecruit.local'
    row = {'source': source, 'group': file.parent.name, 'name': f'Ứng viên CV {group}-{index:02d}',
           'email': email, 'password': 'Cv!' + secrets.token_urlsafe(12) + 'Aa9',
           'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
    new_rows.append(row)

if new_rows:
    java_home = subprocess.check_output(['/usr/libexec/java_home', '-v', '25'], text=True).strip()
    classpath = str(ROOT / 'target/classes') + ':' + (ROOT / '.local/cv-classpath').read_text().strip()
    result = subprocess.run([java_home + '/bin/java', '--class-path', classpath,
                             str(ROOT / 'scripts/qa/HashFixturePasswords.java')],
                            input='\n'.join(row['password'] for row in new_rows) + '\n',
                            capture_output=True, text=True, check=True)
    hashes = [line for line in result.stdout.splitlines() if line.startswith('$argon2id$')]
    if len(hashes) != len(new_rows):
        raise SystemExit('Could not hash all fixture passwords.')
    for row, password_hash in zip(new_rows, hashes):
        row['userId'] = int(sql('START TRANSACTION; INSERT INTO users(version,created_at,updated_at,email,password_hash,full_name,is_active,credential_version,email_verified) VALUES(0,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6),'
                               + ','.join([literal(row['email']), literal(password_hash), literal(row['name'])]) + ',1,1,1); '
                               + 'SET @cv_fixture_user=LAST_INSERT_ID(); INSERT INTO user_roles(user_id,role_id) SELECT @cv_fixture_user,id FROM roles WHERE code=\'ROLE_CANDIDATE\'; COMMIT; SELECT @cv_fixture_user;'))
        state['candidates'].append(row)
        save()
        print('Created', row['email'], flush=True)

if args.accounts_only:
    print('Candidate accounts ready:', len(state['candidates']))
    raise SystemExit(0)

recruiter = next(account for account in json.loads(args.recruiter_credentials.read_text()) if account['role'] == 'ROLE_RECRUITER')
pair = api('/api/v1/auth/login', {'email': recruiter['email'], 'password': recruiter['password']})
job = api(f'/api/v1/recruiter/jobs/{args.job_id}', token=pair['accessToken'])
if job['status'] != 'OPEN':
    raise SystemExit('Publish the test job before importing candidates.')
state.update(recruiterEmail=recruiter['email'], jobTitle=job['title'])
for row in state['candidates']:
    if row.get('applicationId'):
        continue
    pair = api('/api/v1/auth/login', {'email': row['email'], 'password': row['password']})
    token = pair['accessToken']
    me = api('/api/v1/auth/me', token=token)
    if me.get('roles', me.get('roleCodes')) != ['ROLE_CANDIDATE']:
        raise SystemExit('Wrong role for ' + row['email'])
    api('/api/v1/candidates/me', {'headline': 'Hồ sơ kiểm thử từ CV nhóm ' + row['group']}, token, 'PUT')
    api('/api/v1/candidates/me/consent', {'consented': True}, token, 'PUT')
    if not row.get('resumeId'):
        file = Path(row['source'])
        boundary = 'cv-fixture-' + secrets.token_hex(12)
        content = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{file.name}"\r\nContent-Type: application/pdf\r\n\r\n'.encode()
                   + file.read_bytes() + f'\r\n--{boundary}--\r\n'.encode())
        resume = api('/api/v1/candidates/me/resumes/upload', token=token, raw=content,
                     content_type='multipart/form-data; boundary=' + boundary)
        row['resumeId'] = resume['id']
        save()
    application = api(f'/api/v1/jobs/{args.job_id}/applications',
                      {'candidateResumeId': row['resumeId'], 'coverLetter': 'Hồ sơ kiểm thử CV nhóm ' + row['group'], 'source': 'QA_CV_CORPUS'}, token)
    row.update(applicationId=application['id'], loginVerified=True)
    save()
    print('Ready', row['email'], 'application', row['applicationId'], flush=True)

lines = ['# Tài khoản ứng viên và CV kiểm thử', '', 'Đăng nhập: http://localhost:8444/login', '',
         f"Nhà tuyển dụng: `{state['recruiterEmail']}` · Công việc: **{state['jobTitle']}** (mã {state['jobId']}).", '',
         '| Ứng viên | Email | Mật khẩu | CV gốc | Mã hồ sơ |', '|---|---|---|---|---|']
for row in state['candidates']:
    lines.append(f"| {row['name']} | {row['email']} | `{row['password']}` | {row['group']}/{Path(row['source']).name} | {row['applicationId']} |")
output = args.manifest.with_suffix('.md')
output.write_text('\n'.join(lines) + '\n')
output.chmod(0o600)
print('Ready for recruiter:', len(state['candidates']), 'candidate accounts and CV applications')
