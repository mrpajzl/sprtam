"""Backups of the Šprtám content service (docs/OBSAH.md, Zálohy). Runs elsewhere than the service: on hetzner-1
(a Coolify container) and on the admin's Mac (a LaunchAgent, without the mirror).

Every run
  1. pulls a snapshot of the whole database (GET /api/internal/backup with its own token; no redirects followed,
     sizes capped while streaming),
  2. checks it: SHA-256 as announced, SQLite integrity, every version's content hash and the hash chain over all
     versions recomputed, what is published equals the newest versions, and the history only grew since the
     checkpoint of the last run (the version seen last time still has the same chain),
  3. stores it encrypted with age for recipients whose private keys are not on any server, and thins out old
     copies (48 hourly, 35 daily, 24 monthly; nothing is deleted in a run whose checks fail),
  4. replays every new release from the verified snapshot itself into a git mirror (one commit per release) and
     pushes it,
  5. reports the result back (POST /api/internal/backup/report), so the moderation shows the last verified backup.

Standard library only (plus the `age`, `git` and `ssh` commands). Commands:
  python backup.py                     run forever (every INTERVAL seconds)
  python backup.py once                one run; exit code 1 when it failed
  python backup.py health              exit 0 when the last successful run is younger than 2.5 × INTERVAL
  python backup.py verify FILE         check a decrypted snapshot (restore drills, before a restore); read only
  python backup.py accept-reset WHY    after a deliberate restore of an older database: the next snapshot becomes
                                       the new checkpoint (recorded in the state with the reason)
"""

import base64
import fcntl
import hashlib
import http.client
import json
import os
import random
import re
import socket
import sqlite3
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.parse
import zlib
from datetime import datetime, timezone
from pathlib import Path

API = os.environ.get('SPRTAM_API', 'https://moderace.sprtam.cz').rstrip('/')
TOKEN = os.environ.get('BACKUP_TOKEN', '')
RECIPIENTS = [r.strip() for r in os.environ.get('AGE_RECIPIENTS', '').split(',') if r.strip()]
# Optional: connect straight to this address of the origin (TLS still checked for the API's host name), so the
# snapshot does not pass through the CDN in the clear.
ORIGIN_IP = os.environ.get('ORIGIN_IP', '')
SOURCE = re.sub(r'[^a-z0-9-]', '', os.environ.get('BACKUP_SOURCE', socket.gethostname().lower()))[:30] or 'backup'
MIRROR_REMOTE = os.environ.get('MIRROR_REMOTE', '')
MIRROR_KEY = os.environ.get('MIRROR_KEY', '')  # base64 of an OpenSSH private key (a deploy key of the mirror repository)
KNOWN_HOSTS = os.environ.get('KNOWN_HOSTS', str(Path(__file__).with_name('known_hosts')))
INTERVAL = int(os.environ.get('INTERVAL', '3600'))
DATA = Path(os.environ.get('DATA_DIR', '/data'))
KEEP = {'hourly': 48, 'daily': 35, 'monthly': 24}
MAX_DOWNLOAD = 128 << 20   # gzip as sent (today ~2.5 MB)
MAX_DATABASE = 1 << 30     # after decompressing
MAX_RELEASES_PER_RUN = 500
UA = 'sprtam-backup/2'

STATE = DATA / 'state.json'
SNAPSHOTS = DATA / 'snapshots'
MIRROR = DATA / 'mirror'

# Document keys (src/content/docs.ts) – also the paths of files in the mirror, so nothing else may pass.
KEY = re.compile(r'^(topics/[a-z][0-9]/[a-z]+/(_subject|[a-z0-9]+(-[a-z0-9]+)*)|vocab/(a1|a2|b1|b2|c1)|approaches/[a-z0-9]+(-[a-z0-9]+)*/(approach|[a-z][0-9]))$')
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


# ——— State ———

def read_state():
    try:
        text = STATE.read_text()
    except FileNotFoundError:
        return {}
    try:
        return json.loads(text)
    except ValueError:
        raise Failure('state.json is damaged – fix or remove it deliberately (docs/OBSAH.md)')


def write_state(state):
    tmp = STATE.with_suffix('.tmp')
    with open(tmp, 'w') as f:
        f.write(json.dumps(state, indent=2))
        f.flush()
        os.fsync(f.fileno())
    tmp.replace(STATE)
    fd = os.open(DATA, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


# ——— HTTP: no redirects (the token must never go anywhere else), https only, sizes capped ———

def connection():
    u = urllib.parse.urlsplit(API)
    if u.scheme == 'https':
        ctx = ssl.create_default_context()
        if ORIGIN_IP:
            conn = http.client.HTTPSConnection(ORIGIN_IP, u.port or 443, timeout=120, context=ctx)
            # TLS to the origin's address, but checked for the API's name (SNI and certificate).
            conn._create_connection = lambda addr, *a, **k: socket.create_connection((ORIGIN_IP, u.port or 443), *a, **k)
            conn.host = u.hostname
            return conn, u.hostname
        return http.client.HTTPSConnection(u.hostname, u.port or 443, timeout=120, context=ctx), u.hostname
    if u.scheme == 'http' and u.hostname in ('localhost', '127.0.0.1'):
        return http.client.HTTPConnection(u.hostname, u.port or 80, timeout=120), u.hostname
    raise SystemExit('SPRTAM_API must be https (http only for localhost)')


def request(method, path, body=None, max_bytes=1 << 20, sink=None):
    """Returns (status, headers, bytes) – or writes the body into `sink` (a callable) and returns no bytes."""
    conn, host = connection()
    try:
        headers = {'Authorization': f'Bearer {TOKEN}', 'User-Agent': UA, 'Host': host, 'X-Backup-Source': SOURCE}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers['Content-Type'] = 'application/json'
        conn.request(method, path, body=data, headers=headers)
        r = conn.getresponse()
        if r.status != 200:
            raise OSError(f'{method} {path} → HTTP {r.status}')
        total, chunks = 0, []
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                raise Failure(f'{path}: response larger than {max_bytes} bytes')
            if sink:
                sink(chunk)
            else:
                chunks.append(chunk)
        return r.status, r.headers, b''.join(chunks)
    finally:
        conn.close()


# ——— Checking a snapshot ———

def open_snapshot(path):
    db = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
    db.execute('PRAGMA trusted_schema = OFF')
    deadline = time.time() + 600
    db.set_progress_handler(lambda: 1 if time.time() > deadline else 0, 100_000)  # a crafted file must not hang us
    for table in ('versions', 'releases', 'docs', 'users'):
        row = db.execute("SELECT type FROM sqlite_master WHERE name = ?", (table,)).fetchone()
        if not row or row[0] != 'table':
            raise Failure(f'{table} is not a table')
    return db


def chain_of(prev, key, n, h, user, approved, draft, release, reason, created):
    """The chain exactly as moderator/server/store.ts chainOf computes it."""
    return hashlib.sha256('\n'.join([prev, key, str(n), h, user or '', approved or '', draft or '', str(release), reason, str(created)]).encode()).hexdigest()


def verify_db(db):
    """Integrity, content hashes, the hash chain and what is published. Returns (count, last id, last chain, releases, chain by release)."""
    if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise Failure('SQLite integrity check failed')
    chain, count, last_id, by_release = '', 0, None, {}
    for (vid, key, n, data, h, user, approved, draft, release, reason, created, stored) in db.execute(
            'SELECT id, key, n, data, hash, user_id, approved_by, draft_id, release_id, reason, created_at, chain FROM versions ORDER BY id'):
        if not isinstance(key, str) or not KEY.match(key):
            raise Failure(f'version {vid}: not a content key')
        if (hashlib.sha256(data.encode()).hexdigest() if data is not None else '') != h:
            raise Failure(f'version {vid}: content does not match its hash')
        chain = chain_of(chain, key, n, h, user, approved, draft, release, reason, created)
        if chain != stored:
            raise Failure(f'version {vid}: hash chain broken')
        count, last_id, by_release[release] = count + 1, vid, chain
    stray = db.execute('''
        SELECT key FROM (SELECT key, id, data FROM versions v WHERE n = (SELECT MAX(n) FROM versions w WHERE w.key = v.key)) latest
        WHERE (data IS NULL AND key IN (SELECT key FROM docs)) OR (data IS NOT NULL AND id IS NOT (SELECT version FROM docs d WHERE d.key = latest.key))
        LIMIT 1''').fetchone()
    if stray:
        raise Failure(f'published {stray[0]} is not its newest version')
    releases = db.execute('SELECT COUNT(*) FROM releases').fetchone()[0]
    return count, last_id, chain, releases, by_release


def snapshot(state, report, tmpdir):
    """Downloads and checks a snapshot; the decompressed database stays in tmpdir for the mirror."""
    raw_path = Path(tmpdir) / 'snapshot.sqlite'
    gz_path = Path(tmpdir) / 'snapshot.sqlite.gz'
    inflate = zlib.decompressobj(16 + zlib.MAX_WBITS)
    digest = hashlib.sha256()
    out = open(raw_path, 'wb')
    gz = open(gz_path, 'wb')
    size = 0

    def sink(chunk):
        nonlocal size
        gz.write(chunk)
        # At most 1 MB of output at a time: a small chunk of a zip bomb never fills the memory.
        while chunk:
            data = inflate.decompress(chunk, 1 << 20)
            chunk = inflate.unconsumed_tail
            size += len(data)
            if size > MAX_DATABASE:
                raise Failure('snapshot larger than allowed when unpacked')
            digest.update(data)
            out.write(data)

    try:
        _, headers, _ = request('GET', '/api/internal/backup', max_bytes=MAX_DOWNLOAD, sink=sink)
        rest = inflate.flush()
        digest.update(rest)
        out.write(rest)
        if not inflate.eof:
            raise Failure('snapshot is cut off')
    finally:
        out.close()
        gz.close()
    announced = headers.get('X-Backup-Sha256', '')
    report['sha256'] = announced if re.fullmatch(r'[0-9a-f]{64}', announced) else None  # a failed check is still reported for this snapshot
    if digest.hexdigest() != announced:
        raise Failure('snapshot does not match its announced SHA-256')
    os.chmod(raw_path, 0o600)
    db = open_snapshot(raw_path)
    try:
        count, last_id, last_chain, releases, by_release = verify_db(db)
        checkpoint(state, db)
        # The history may only grow: the version seen last time must still be there with the same chain.
        if state.get('last_version'):
            row = db.execute('SELECT chain FROM versions WHERE id = ?', (state['last_version'],)).fetchone()
            if not row or row[0] != state['last_chain']:
                raise Failure(f"history was rewritten: version {state['last_version']} changed or disappeared")
            if count < state.get('versions', 0):
                raise Failure('fewer versions than last time')
    finally:
        db.close()
    return {'sha256': announced, 'gz': gz_path, 'db': raw_path, 'versions': count, 'last_version': last_id, 'last_chain': last_chain,
            'releases': releases, 'bytes': gz_path.stat().st_size}


def checkpoint(state, db):
    """Without a checkpoint (first run, or the state was lost) take it from the mirror's last commit, when there is one."""
    if state.get('last_version') or not (MIRROR / '.git').exists():
        return
    trailers = git('log', '-1', '--format=%(trailers:key=Release,valueonly)%n%(trailers:key=Content-Chain,valueonly)', check=False).stdout.split()
    if len(trailers) == 2 and trailers[0].isdigit():
        row = db.execute('SELECT id, chain FROM versions WHERE release_id = ? ORDER BY id DESC LIMIT 1', (int(trailers[0]),)).fetchone()
        if not row or row[1] != trailers[1]:
            raise Failure(f'history differs from the mirror at release {trailers[0]}')
        state.update({'last_version': row[0], 'last_chain': row[1]})


# ——— Storing ———

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
    with open(snap['gz'], 'rb') as f:
        subprocess.run(args, stdin=f, check=True)
    part.replace(out)
    for kind, key in (('daily', now.strftime('%Y%m%d')), ('monthly', now.strftime('%Y%m'))):
        d = SNAPSHOTS / kind
        d.mkdir(exist_ok=True)
        if not any(p.name.startswith(f'moderace-{key}') for p in d.iterdir()):
            os.link(out, d / out.name)
    return out


def thin_out():
    for kind, keep in KEEP.items():
        files = sorted((SNAPSHOTS / kind).glob('moderace-*.sqlite.gz.age')) if (SNAPSHOTS / kind).exists() else []
        for old in files[:-keep]:
            old.unlink()


def tidy():
    """Leftovers of runs that were killed."""
    for p in SNAPSHOTS.glob('*/*.part') if SNAPSHOTS.exists() else []:
        p.unlink(missing_ok=True)
    for p in DATA.glob('run-*'):
        if p.is_dir():
            for f in p.iterdir():
                f.unlink(missing_ok=True)
            p.rmdir()


# ——— Git mirror, from the verified snapshot ———

def git(*args, check=True):
    env = {**os.environ, 'GIT_SSH_COMMAND': f'ssh -i {DATA / "mirror_key"} -o IdentitiesOnly=yes -o UserKnownHostsFile={KNOWN_HOSTS} -o StrictHostKeyChecking=yes'}
    return subprocess.run(['git', '-C', str(MIRROR), *args], check=check, env=env, capture_output=True, text=True)


def mirror_key():
    key = DATA / 'mirror_key'
    want = base64.b64decode(MIRROR_KEY)
    if not key.exists() or key.read_bytes() != want:
        fd = os.open(key, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, 'wb') as f:
            f.write(want)


def mirrored_release():
    out = git('log', '-1', '--format=%(trailers:key=Release,valueonly)', check=False).stdout.strip()
    return int(out) if out.isdigit() else 0


def kind_of(key):
    p = key.split('/')
    if p[0] == 'topics':
        return 'subject' if p[3] == '_subject' else 'topic'
    if p[0] == 'vocab':
        return 'vocab'
    return 'approach' if p[2] == 'approach' else 'approach-year'


def mirror(snap, state):
    if not MIRROR_REMOTE or not MIRROR_KEY:
        return None
    mirror_key()
    if not (MIRROR / '.git').exists():
        MIRROR.mkdir(parents=True, exist_ok=True)
        subprocess.run(['git', 'init', '-q', '-b', 'main', str(MIRROR)], check=True)
        git('remote', 'add', 'origin', MIRROR_REMOTE)
        git('config', 'user.email', 'zalohy@sprtam.cz')
        # Continue what the mirror already has (e.g. after the volume was lost); an unreachable remote is an error,
        # never a reason to start a second history.
        heads = git('ls-remote', '--heads', 'origin', 'main').stdout.strip()
        if heads:
            git('fetch', '-q', 'origin', 'main')
            git('reset', '-q', '--hard', 'origin/main')
    root = (MIRROR / 'content').resolve()
    db = open_snapshot(snap['db'])
    try:
        names = dict(db.execute('SELECT id, name FROM users'))
        done = mirrored_release()
        rows = db.execute('SELECT id, created_at, user_id, reason, note FROM releases WHERE id > ? ORDER BY id LIMIT ?', (done, MAX_RELEASES_PER_RUN)).fetchall()
        for (rid, created, user, reason, note) in rows:
            versions = db.execute('SELECT key, data, approved_by, chain FROM versions WHERE release_id = ? ORDER BY id', (rid,)).fetchall()
            if not versions:
                continue
            approved = []
            for (key, data, appr, _) in versions:
                path = (MIRROR / 'content' / f'{key}.json').resolve()
                if not KEY.match(key) or not path.is_relative_to(root):
                    raise Failure(f'release {rid}: bad key')
                if data is None:
                    path.unlink(missing_ok=True)
                else:
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text(json.dumps({'$schema': SCHEMA[kind_of(key)], **json.loads(data)}, ensure_ascii=False, indent=2) + '\n')
                for a in json.loads(appr or '[]'):
                    if names.get(a, '?') not in approved:
                        approved.append(names.get(a, '?'))
            when = datetime.fromtimestamp(created / 1000, timezone.utc).isoformat()
            author = names.get(user) if user else None
            title = f'Vydání {rid}: {REASON.get(reason, reason)}' + (f' – {note}' if note else '')
            body = [f'Autor: {author}' if author else 'Autor: systém']
            if approved:
                body.append('Schválil/a: ' + ', '.join(approved))
            git('add', '-A')
            subprocess.run(['git', '-C', str(MIRROR), '-c', f'user.name={author or "Šprtám"}', 'commit', '-q', '--allow-empty', '--date', when,
                            '-m', title, '-m', '\n'.join(body), '-m', f'Release: {rid}\nContent-Chain: {versions[-1][3]}'],
                           check=True, capture_output=True,
                           env={**os.environ, 'GIT_COMMITTER_DATE': when, 'GIT_COMMITTER_NAME': 'Šprtám zálohy', 'GIT_COMMITTER_EMAIL': 'zalohy@sprtam.cz'})
    finally:
        db.close()
    local = git('rev-parse', '--verify', '-q', 'HEAD', check=False).stdout.strip()
    remote = (git('ls-remote', '--heads', 'origin', 'main').stdout.split() or [''])[0]
    if local and local != remote:
        git('push', '-q', 'origin', 'main')
    state['mirrored'] = mirrored_release()
    return state['mirrored']


# ——— Run ———

def run_once():
    DATA.mkdir(parents=True, exist_ok=True)
    if not TOKEN or not RECIPIENTS:
        raise SystemExit('BACKUP_TOKEN and AGE_RECIPIENTS are required')
    lock = open(DATA / 'lock', 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        log('another run is in progress')
        return False
    try:
        return run_locked()
    finally:
        lock.close()


def run_locked():
    tidy()
    now = datetime.now(timezone.utc)
    report = {'ok': False, 'message': '', 'sha256': None, 'mirrored': None}
    state = {}
    try:
        state = read_state()
        if state.get('last_ok') and now.timestamp() < datetime.fromisoformat(state['last_ok']).timestamp() - 300:
            raise Failure('the clock went backwards – not storing anything')
        report['mirrored'] = state.get('mirrored')
        with tempfile.TemporaryDirectory(dir=DATA, prefix='run-') as tmp:
            snap = snapshot(state, report, tmp)
            thin_out()
            out = store(snap, now)
            state.update({k: snap[k] for k in ('versions', 'last_version', 'last_chain', 'releases')})
            state.update({'last_ok': now.isoformat(), 'last_file': out.name, 'last_bytes': snap['bytes']})
            state.pop('reset_reason', None)
            write_state(state)
            msg = f"{snap['versions']} verzí, {snap['releases']} vydání, {snap['bytes'] // 1024} kB ({SOURCE})"
            try:
                report['mirrored'] = mirror(snap, state)
                write_state(state)
            except Exception as e:  # the backup itself is fine; the mirror retries next time
                msg += f'; zrcadlo selhalo ({type(e).__name__})'
                log('mirror failed:', repr(e), getattr(e, 'stderr', '') or '')
        report.update({'ok': True, 'message': msg})
        log('ok:', msg, out.name)
    except Failure as e:
        report['message'] = f'Kontrola zálohy selhala ({SOURCE}): {e}'
        state['last_failure'] = {'at': now.isoformat(), 'message': str(e)}
        try:
            write_state(state)
        except Exception:
            pass
        log('FAILED:', e)
    except Exception as e:
        report['message'] = f'Záloha selhala ({SOURCE}): {type(e).__name__}'
        log('FAILED:', repr(e))
    if report['sha256']:
        try:
            request('POST', '/api/internal/backup/report', {k: report[k] for k in ('ok', 'message', 'sha256', 'mirrored')})
        except Exception as e:
            log('report failed:', repr(e))
    return report['ok']


def health():
    try:
        last = read_state().get('last_ok')
    except Failure:
        sys.exit(1)
    age = time.time() - datetime.fromisoformat(last).timestamp() if last else float('inf')
    sys.exit(0 if age < INTERVAL * 2.5 else 1)


def verify_file(path):
    db = open_snapshot(path)
    try:
        count, last_id, chain, releases, _ = verify_db(db)
    finally:
        db.close()
    print(f'OK: {count} versions, {releases} releases, last version {last_id}, chain {chain}')


def accept_reset(reason):
    """A deliberate restore of an older database: forget the checkpoint and the mirror position (the mirror keeps its history)."""
    state = read_state()
    for k in ('last_version', 'last_chain', 'versions'):
        state.pop(k, None)
    state['reset_reason'] = f"{datetime.now(timezone.utc).isoformat()}: {reason}"
    write_state(state)
    print('The next snapshot becomes the new checkpoint. Releases whose numbers repeat after the restore are not mirrored again;'
          ' see docs/OBSAH.md (Obnova) for the mirror.')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'loop'
    if cmd == 'health':
        health()
    elif cmd == 'once':
        sys.exit(0 if run_once() else 1)
    elif cmd == 'verify' and len(sys.argv) == 3:
        try:
            verify_file(sys.argv[2])
        except Failure as e:
            print('FAILED:', e)
            sys.exit(1)
    elif cmd == 'accept-reset' and len(sys.argv) == 3:
        accept_reset(sys.argv[2])
    elif cmd == 'loop':
        time.sleep(random.randint(30, 90))
        while True:
            started = time.time()
            try:
                run_once()
            except Exception as e:  # never let one bad run end the service
                log('run crashed:', repr(e))
            time.sleep(max(60, INTERVAL - (time.time() - started) + random.randint(-60, 60)))
    else:
        print(__doc__)
        sys.exit(2)
