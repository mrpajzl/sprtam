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
  base_sha: string | null; status: 'draft' | 'submitted' | 'merged' | 'closed'; branch: string | null; pr_number: number | null; pr_url: string | null
  submitted_rev: number | null; submitted_at: number | null; checked_at: number | null; created_at: number; updated_at: number
}
