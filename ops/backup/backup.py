"""Backups of the Šprtám content service (docs/OBSAH.md, Zálohy). Runs on another server than the service.

Every hour it
  1. pulls a snapshot of the whole database (GET /api/internal/backup, its own token),
  2. checks it: SHA-256 as announced, SQLite integrity, the hash chain of all content versions recomputed,
     and that the history only grew since the last run (the version seen last time still has the same chain),
  3. stores it encrypted with age for recipients whose private keys are not on this server, and thins out old
     copies (48 hourly, 35 daily, 24 monthly; nothing is deleted while a check fails),
  4. replays every new release into a git mirror of the content (one commit per release) and pushes it,
  5. reports the result back (POST /api/internal/backup/report), so the moderation shows when the last
     verified backup ran.

Standard library only (plus the `age`, `git` and `ssh` commands). Commands:
  python backup.py            run forever (every INTERVAL seconds)
  python backup.py once       one run, exit code 1 on failure
  python backup.py health     exit 0 when the last successful run is younger than 2.5 × INTERVAL
"""

import base64
import gzip
import hashlib
import json
import os
import random
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = os.environ.get('SPRTAM_API', 'https://moderace.sprtam.cz').rstrip('/')
TOKEN = os.environ.get('BACKUP_TOKEN', '')
RECIPIENTS = [r.strip() for r in os.environ.get('AGE_RECIPIENTS', '').split(',') if r.strip()]
MIRROR_REMOTE = os.environ.get('MIRROR_REMOTE', '')
MIRROR_KEY = os.environ.get('MIRROR_KEY', '')  # base64 of an OpenSSH private key (a deploy key of the mirror repository)
INTERVAL = int(os.environ.get('INTERVAL', '3600'))
DATA = Path(os.environ.get('DATA_DIR', '/data'))
KEEP = {'hourly': 48, 'daily': 35, 'monthly': 24}
MAX_SNAPSHOT = 1 << 30
UA = 'sprtam-backup/1'

STATE = DATA / 'state.json'
SNAPSHOTS = DATA / 'snapshots'
MIRROR = DATA / 'mirror'

# $schema of each kind of file in the mirror (src/content/docs.ts SCHEMA_PATHS).
SCHEMA = {
    'topic': '../../../schema/topic.schema.json',
    'subject': '../../../schema/subject.schema.json',
    'vocab': '../schema/vocab.schema.json',
    'approach': '../../schema/approach.schema.json',
    'approach-year': '../../schema/approach-year.schema.json',
}
REASON = {'import': 'Import', 'change': 'Změna', 'rollback': 'Návrat ke starší verzi', 'restore': 'Obnova vydání'}


def log(*parts):
    print(datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), *parts, flush=True)


class Failure(Exception):
    """A check failed: nothing old is deleted, the run is reported as failed."""


def read_state():
    try:
        return json.loads(STATE.read_text())
    except FileNotFoundError:
        return {}


def write_state(state):
    tmp = STATE.with_suffix('.tmp')
    tmp.write_text(json.dumps(state, indent=2))
    tmp.replace(STATE)


def request(method, path, body=None, timeout=120):
    req = urllib.request.Request(API + path, method=method, headers={'Authorization': f'Bearer {TOKEN}', 'User-Agent': UA})
    if body is not None:
        req.data = json.dumps(body).encode()
        req.add_header('Content-Type', 'application/json')
    return urllib.request.urlopen(req, timeout=timeout)


def get_json(path):
    with request('GET', path) as r:
        return json.loads(r.read())


# ——— 1–3: snapshot ———

def kind_of(key):
    p = key.split('/')
    if p[0] == 'topics':
        return 'subject' if p[3] == '_subject' else 'topic'
    if p[0] == 'vocab':
        return 'vocab'
    return 'approach' if p[2] == 'approach' else 'approach-year'


def verify_chain(db):
    """Recomputes the chain exactly as moderator/server/store.ts does; returns (count, last id, last chain)."""
    chain, count, last_id = '', 0, None
    for (vid, key, n, data, h, user, release, reason, created, stored) in db.execute(
            'SELECT id, key, n, data, hash, user_id, release_id, reason, created_at, chain FROM versions ORDER BY id'):
        if (hashlib.sha256(data.encode()).hexdigest() if data is not None else '') != h:
            raise Failure(f'version {vid}: content does not match its hash')
        chain = hashlib.sha256('\n'.join([chain, key, str(n), h, user or '', str(release), reason, str(created)]).encode()).hexdigest()
        if chain != stored:
            raise Failure(f'version {vid}: hash chain broken')
        count, last_id = count + 1, vid
    return count, last_id, chain


def snapshot(state, report):
    with request('GET', '/api/internal/backup', timeout=300) as r:
        body = r.read(MAX_SNAPSHOT + 1)
        announced = r.headers.get('X-Backup-Sha256', '')
    if len(body) > MAX_SNAPSHOT:
        raise Failure('snapshot too large')
    raw = gzip.decompress(body)
    digest = hashlib.sha256(raw).hexdigest()
    report['sha256'] = announced if len(announced) == 64 else None  # so a failed check is reported for the right snapshot
    if digest != announced:
        raise Failure('snapshot does not match its announced SHA-256')
    with tempfile.NamedTemporaryFile(dir=DATA, suffix='.sqlite', delete=False) as f:
        f.write(raw)
        tmp = Path(f.name)
    try:
        db = sqlite3.connect(f'file:{tmp}?mode=ro', uri=True)
        try:
            if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise Failure('SQLite integrity check failed')
            count, last_id, last_chain = verify_chain(db)
            # The history may only grow: the version seen last time must still be there with the same chain.
            if state.get('last_version'):
                row = db.execute('SELECT chain FROM versions WHERE id = ?', (state['last_version'],)).fetchone()
                if not row or row[0] != state['last_chain']:
                    raise Failure(f"history was rewritten: version {state['last_version']} changed or disappeared")
                if count < state.get('versions', 0):
                    raise Failure('fewer versions than last time')
            releases = db.execute('SELECT COUNT(*) FROM releases').fetchone()[0]
        finally:
            db.close()
    finally:
        tmp.unlink(missing_ok=True)
    return {'sha256': digest, 'body': body, 'versions': count, 'last_version': last_id, 'last_chain': last_chain, 'releases': releases}


def store(snap, now):
    """Encrypted copy in hourly/, hard links into daily/ and monthly/ for the first copy of a day / month."""
    stamp = now.strftime('%Y%m%dT%H%M%SZ')
    hourly = SNAPSHOTS / 'hourly'
    hourly.mkdir(parents=True, exist_ok=True)
    out = hourly / f'moderace-{stamp}.sqlite.gz.age'
    part = out.with_suffix('.part')
    args = ['age', '--encrypt', '--output', str(part)]
    for r in RECIPIENTS:
        args += ['--recipient', r]
    subprocess.run(args, input=snap['body'], check=True)
    part.replace(out)
    for kind, key in (('daily', now.strftime('%Y%m%d')), ('monthly', now.strftime('%Y%m'))):
        d = SNAPSHOTS / kind
        d.mkdir(exist_ok=True)
        if not any(p.name.startswith(f'moderace-{key}') for p in d.iterdir()):
            os.link(out, d / out.name)
    return out


def thin_out():
    for kind, keep in KEEP.items():
        files = sorted((SNAPSHOTS / kind).glob('moderace-*.sqlite.gz.age'))
        for old in files[:-keep]:
            old.unlink()


# ——— 4: git mirror ———

def git(*args, check=True):
    env = {**os.environ, 'GIT_SSH_COMMAND': f'ssh -i {DATA / "mirror_key"} -o IdentitiesOnly=yes -o UserKnownHostsFile=/app/known_hosts -o StrictHostKeyChecking=yes'}
    return subprocess.run(['git', '-C', str(MIRROR), *args], check=check, env=env, capture_output=True, text=True)


def mirror(state):
    if not MIRROR_REMOTE or not MIRROR_KEY:
        return state.get('mirrored')
    key = DATA / 'mirror_key'
    key.write_bytes(base64.b64decode(MIRROR_KEY))
    key.chmod(0o600)
    if not (MIRROR / '.git').exists():
        MIRROR.mkdir(parents=True, exist_ok=True)
        subprocess.run(['git', 'init', '-q', '-b', 'main', str(MIRROR)], check=True)
        git('remote', 'add', 'origin', MIRROR_REMOTE)
        git('config', 'user.name', 'Šprtám zálohy')
        git('config', 'user.email', 'zalohy@sprtam.cz')
        # Continue from what the mirror already has (e.g. after the volume was lost).
        if git('fetch', '-q', 'origin', 'main', check=False).returncode == 0:
            git('reset', '-q', '--hard', 'origin/main')
            last = git('log', '-1', '--format=%(trailers:key=Release,valueonly)', check=False).stdout.strip()
            state['mirrored'] = int(last) if last.isdigit() else 0
    done = state.get('mirrored', 0)
    while True:
        batch = get_json(f'/api/internal/releases?after={done}')['releases']
        if not batch:
            break
        for rel in batch:
            r = get_json(f"/api/internal/releases/{rel['id']}")
            for key, doc in r['docs'].items():
                path = MIRROR / 'content' / f'{key}.json'
                if doc is None:
                    path.unlink(missing_ok=True)
                    continue
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps({'$schema': SCHEMA[kind_of(key)], **doc}, ensure_ascii=False, indent=2) + '\n')
            when = datetime.fromtimestamp(r['createdAt'] / 1000, timezone.utc).isoformat()
            title = f"Vydání {r['id']}: {REASON.get(r['reason'], r['reason'])}" + (f" – {r['note']}" if r.get('note') else '')
            body = [f"Autor: {r['author']}" if r.get('author') else 'Autor: systém']
            if r.get('approvedBy'):
                body.append('Schválil/a: ' + ', '.join(r['approvedBy']))
            body += ['', f"Release: {r['id']}", f"Content-Chain: {r['chain']}"]
            git('add', '-A')
            env_author = ['-c', f"user.name={r.get('author') or 'Šprtám'}"]
            subprocess.run(['git', '-C', str(MIRROR), *env_author, 'commit', '-q', '--allow-empty', '--date', when, '-m', title, '-m', '\n'.join(body)],
                           check=True, env={**os.environ, 'GIT_COMMITTER_DATE': when, 'GIT_COMMITTER_NAME': 'Šprtám zálohy', 'GIT_COMMITTER_EMAIL': 'zalohy@sprtam.cz'})
            done = r['id']
            state['mirrored'] = done
        # Push after every batch: a broken push leaves the commits for the next run.
        git('push', '-q', 'origin', 'main')
    return done


# ——— Run ———

def run_once():
    DATA.mkdir(parents=True, exist_ok=True)
    if not TOKEN or not RECIPIENTS:
        raise SystemExit('BACKUP_TOKEN and AGE_RECIPIENTS are required')
    state = read_state()
    now = datetime.now(timezone.utc)
    report = {'ok': False, 'message': '', 'sha256': None, 'mirrored': state.get('mirrored')}
    try:
        snap = snapshot(state, report)
        out = store(snap, now)
        thin_out()
        state.update({k: snap[k] for k in ('versions', 'last_version', 'last_chain', 'releases')})
        state.update({'last_ok': now.isoformat(), 'last_file': out.name, 'last_bytes': len(snap['body'])})
        write_state(state)
        msg = f"{snap['versions']} verzí, {snap['releases']} vydání, {len(snap['body']) // 1024} kB"
        try:
            report['mirrored'] = mirror(state)
            write_state(state)
        except Exception as e:  # the backup itself is fine; the mirror retries next time
            msg += f'; zrcadlo selhalo: {type(e).__name__}'
            log('mirror failed:', repr(e), getattr(e, 'stderr', ''))
        report.update({'ok': True, 'message': msg})
        log('ok:', msg, out.name)
    except Failure as e:
        report['message'] = f'Kontrola zálohy selhala: {e}'
        state['last_failure'] = {'at': now.isoformat(), 'message': str(e)}
        write_state(state)
        log('FAILED:', e)
    except (urllib.error.URLError, OSError, subprocess.CalledProcessError, ValueError) as e:
        report['message'] = f'Záloha selhala: {type(e).__name__}'
        log('FAILED:', repr(e))
    if report['sha256']:
        try:
            request('POST', '/api/internal/backup/report', {k: report[k] for k in ('ok', 'message', 'sha256', 'mirrored')}, timeout=30).close()
        except Exception as e:
            log('report failed:', repr(e))
    return report['ok']


def health():
    last = read_state().get('last_ok')
    age = time.time() - datetime.fromisoformat(last).timestamp() if last else float('inf')
    sys.exit(0 if age < INTERVAL * 2.5 else 1)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'loop'
    if cmd == 'health':
        health()
    elif cmd == 'once':
        sys.exit(0 if run_once() else 1)
    else:
        time.sleep(random.randint(30, 90))
        while True:
            started = time.time()
            run_once()
            time.sleep(max(60, INTERVAL - (time.time() - started) + random.randint(-60, 60)))
