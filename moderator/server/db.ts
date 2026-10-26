import { chmodSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { CONFIG } from './config'

// One SQLite file in the data volume. Secrets (session and invite tokens) are stored only as SHA-256
// hashes, so a copy of the database does not let anyone in.

mkdirSync(CONFIG.dataDir, { recursive: true, mode: 0o700 })
const file = join(CONFIG.dataDir, 'moderace.sqlite')
export const db = new DatabaseSync(file)
try { chmodSync(file, 0o600) } catch { /* not the owner */ }

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  active INTEGER NOT NULL DEFAULT 1,
  webauthn_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  created_by TEXT,
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key BLOB NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT NOT NULL DEFAULT '[]',
  device_type TEXT,
  backed_up INTEGER,
  label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
CREATE INDEX IF NOT EXISTS credentials_user ON credentials(user_id);

CREATE TABLE IF NOT EXISTS invites (
  hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('user', 'key')),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_by TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cred_id TEXT,
  created_at INTEGER NOT NULL,
  seen_at INTEGER NOT NULL,
  auth_at INTEGER NOT NULL,
  ua TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL CHECK (kind IN ('edit', 'new')),
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  rev INTEGER NOT NULL DEFAULT 1,
  base_sha TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'merged', 'closed')),
  branch TEXT,
  pr_number INTEGER,
  pr_url TEXT,
  submitted_rev INTEGER,
  submitted_at INTEGER,
  checked_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS drafts_user ON drafts(user_id);
CREATE INDEX IF NOT EXISTS drafts_topic ON drafts(grade, subject, topic_id);

CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  ip TEXT
);
`)

// Columns added after the first release.
const columns = (table: string) => (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name)
if (!columns('sessions').includes('cred_id')) db.exec('ALTER TABLE sessions ADD COLUMN cred_id TEXT')

// ——— Migrations (PRAGMA user_version) ———

const MIGRATIONS: string[] = [
  // 1: the content itself lives here (docs/OBSAH.md). Versions and releases are append-only (triggers), every
  // version carries a hash chain over all versions before it, so a rewritten history shows. Drafts are reviewed
  // and approved by other moderators instead of becoming pull requests.
  `
  CREATE TABLE releases (
    id INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL,
    user_id TEXT,
    draft_id TEXT,
    reason TEXT NOT NULL CHECK (reason IN ('import', 'change', 'rollback', 'restore')),
    note TEXT,
    hash TEXT NOT NULL,
    docs INTEGER NOT NULL
  );
  CREATE TABLE versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    n INTEGER NOT NULL,
    data TEXT,
    hash TEXT NOT NULL,
    user_id TEXT,
    approved_by TEXT,
    draft_id TEXT,
    release_id INTEGER NOT NULL REFERENCES releases(id),
    reason TEXT NOT NULL CHECK (reason IN ('import', 'change', 'rollback', 'restore')),
    created_at INTEGER NOT NULL,
    chain TEXT NOT NULL,
    UNIQUE (key, n)
  );
  CREATE INDEX versions_release ON versions(release_id);
  CREATE TABLE docs (
    key TEXT PRIMARY KEY,
    version INTEGER NOT NULL REFERENCES versions(id)
  );
  CREATE TRIGGER versions_append_only_u BEFORE UPDATE ON versions BEGIN SELECT RAISE(ABORT, 'versions are append-only'); END;
  CREATE TRIGGER versions_append_only_d BEFORE DELETE ON versions BEGIN SELECT RAISE(ABORT, 'versions are append-only'); END;
  CREATE TRIGGER releases_append_only_u BEFORE UPDATE ON releases BEGIN SELECT RAISE(ABORT, 'releases are append-only'); END;
  CREATE TRIGGER releases_append_only_d BEFORE DELETE ON releases BEGIN SELECT RAISE(ABORT, 'releases are append-only'); END;

  CREATE TABLE drafts_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    kind TEXT NOT NULL CHECK (kind IN ('edit', 'new')),
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    rev INTEGER NOT NULL DEFAULT 1,
    base_version INTEGER,
    rollback_of INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'withdrawn', 'rejected')),
    note TEXT,
    submitted_rev INTEGER,
    submitted_at INTEGER,
    decided_at INTEGER,
    decided_by TEXT,
    decision_note TEXT,
    release_id INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    legacy_pr_url TEXT
  );
  INSERT INTO drafts_new (id, user_id, kind, grade, subject, topic_id, title, data, rev, status, submitted_rev, submitted_at, created_at, updated_at, legacy_pr_url)
    SELECT id, user_id, kind, grade, subject, topic_id, title, data, rev,
      CASE status WHEN 'submitted' THEN 'review' WHEN 'merged' THEN 'published' WHEN 'closed' THEN 'withdrawn' ELSE 'draft' END,
      submitted_rev, submitted_at, created_at, updated_at, pr_url
    FROM drafts;
  DROP TABLE drafts;
  ALTER TABLE drafts_new RENAME TO drafts;
  CREATE INDEX drafts_user ON drafts(user_id);
  CREATE INDEX drafts_topic ON drafts(grade, subject, topic_id);
  CREATE INDEX drafts_status ON drafts(status);

  CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_id TEXT NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    rev INTEGER NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    verdict TEXT NOT NULL CHECK (verdict IN ('approve', 'changes', 'comment')),
    body TEXT NOT NULL DEFAULT '',
    anchor TEXT,
    created_at INTEGER NOT NULL,
    resolved_at INTEGER,
    resolved_by TEXT
  );
  CREATE INDEX reviews_draft ON reviews(draft_id);

  CREATE TABLE widget_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    example TEXT NOT NULL DEFAULT '',
    topics TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'planned', 'building', 'done', 'declined')),
    admin_note TEXT NOT NULL DEFAULT '',
    widget TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE widget_votes (
    request_id TEXT NOT NULL REFERENCES widget_requests(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (request_id, user_id)
  );

  CREATE TABLE api_tokens (
    hash TEXT PRIMARY KEY,
    id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    last_used_at INTEGER
  );

  CREATE TABLE backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    at INTEGER NOT NULL,
    bytes INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    ip TEXT,
    verified INTEGER,
    note TEXT,
    mirrored INTEGER
  );
  `,
]

for (let v = Number((db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version); v < MIGRATIONS.length; v++) {
  // Rebuilding a table (drafts) needs foreign keys off for the moment of the swap.
  db.exec('PRAGMA foreign_keys = OFF')
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(MIGRATIONS[v])
    db.exec(`PRAGMA user_version = ${v + 1}`)
    db.exec('COMMIT')
  } catch (e) { db.exec('ROLLBACK'); throw e } finally { db.exec('PRAGMA foreign_keys = ON') }
}

export type Row = Record<string, SQLInputValue>

export const one = <T,>(sql: string, ...args: SQLInputValue[]) => db.prepare(sql).get(...args) as T | undefined
export const all = <T,>(sql: string, ...args: SQLInputValue[]) => db.prepare(sql).all(...args) as T[]
export const run = (sql: string, ...args: SQLInputValue[]) => db.prepare(sql).run(...args)

export function tx<T>(f: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try { const r = f(); db.exec('COMMIT'); return r } catch (e) { db.exec('ROLLBACK'); throw e }
}

export function audit(action: string, user: string | null, detail: unknown = null, ip: string | null = null) {
  run('INSERT INTO audit (at, user_id, action, detail, ip) VALUES (?, ?, ?, ?, ?)', Date.now(), user, action, detail === null ? null : JSON.stringify(detail), ip)
}

export interface UserRow { id: string; name: string; role: 'admin' | 'moderator'; active: number; webauthn_id: string; created_at: number; created_by: string | null; last_login_at: number | null }
export interface CredentialRow { id: string; user_id: string; public_key: Uint8Array; counter: number; transports: string; device_type: string | null; backed_up: number | null; label: string; created_at: number; last_used_at: number | null }
export interface InviteRow { hash: string; kind: 'user' | 'key'; user_id: string | null; name: string; role: 'admin' | 'moderator'; created_by: string | null; created_at: number; expires_at: number; used_at: number | null }
export interface SessionRow { hash: string; user_id: string; cred_id: string | null; created_at: number; seen_at: number; auth_at: number; ua: string | null }
export interface DraftRow {
  id: string; user_id: string; kind: 'edit' | 'new'; grade: string; subject: string; topic_id: string; title: string; data: string; rev: number
  base_version: number | null; rollback_of: number | null; status: DraftStatus; note: string | null
  submitted_rev: number | null; submitted_at: number | null; decided_at: number | null; decided_by: string | null; decision_note: string | null
  release_id: number | null; created_at: number; updated_at: number; legacy_pr_url: string | null
}
export type DraftStatus = 'draft' | 'review' | 'published' | 'withdrawn' | 'rejected'
export interface ReviewRow { id: number; draft_id: string; rev: number; user_id: string; verdict: 'approve' | 'changes' | 'comment'; body: string; anchor: string | null; created_at: number; resolved_at: number | null; resolved_by: string | null }
export interface VersionRow { id: number; key: string; n: number; data: string | null; hash: string; user_id: string | null; approved_by: string | null; draft_id: string | null; release_id: number; reason: 'import' | 'change' | 'rollback' | 'restore'; created_at: number; chain: string }
export interface ReleaseRow { id: number; created_at: number; user_id: string | null; draft_id: string | null; reason: VersionRow['reason']; note: string | null; hash: string; docs: number }
