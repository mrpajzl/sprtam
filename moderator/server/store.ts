import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { canonical } from '../../src/content/canonical'
import { checkSnapshot, type CheckIssue } from '../../src/content/check'
import { parseKey, SCHEMAS } from '../../src/content/docs'
import type { Manifest } from '../../src/content/manifest'
import { buildRelease } from '../../src/content/release'
import { readSnapshot } from '../../plugins/content'
import { CONFIG } from './config'
import { all, audit, db, one, run, tx, type ReleaseRow, type VersionRow } from './db'
import { HttpError } from './http'

// The content: documents (src/content/docs.ts) with every version ever published. Publishing writes new
// versions of the changed documents and a release, in one transaction, after checking the whole content
// with the change applied (src/content/check.ts – the same check as npm run check:content). Nothing here
// is ever updated or deleted (db.ts triggers); each version extends a hash chain over all versions before
// it, so any rewrite of the history shows (verifyChain, and the backup puller keeps the last chain it saw).
//
// The published documents and the files the app reads (src/content/release.ts) are kept in memory.

export type Reason = VersionRow['reason']

interface Live {
  release: number
  publishedAt: number
  manifest: Manifest
  /** hash → file text */
  files: Map<string, string>
}

/** key → published document */
let docs = new Map<string, unknown>()
/** key → id of its published version */
const versionOf = new Map<string, number>()
let live: Live | null = null
/** Files of the few releases before the current one: clients that just loaded the previous manifest still get them. */
const older = new Map<string, string>()

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

/** A document as stored: fields in the canonical order of its format, compact JSON. */
function serialize(key: string, value: unknown): string {
  const ref = parseKey(key)
  return JSON.stringify(ref ? canonical(SCHEMAS[ref.kind], value) : value)
}

const chainOf = (prev: string, v: Pick<VersionRow, 'key' | 'n' | 'hash' | 'user_id' | 'release_id' | 'reason' | 'created_at'>) =>
  sha256([prev, v.key, v.n, v.hash, v.user_id ?? '', v.release_id, v.reason, v.created_at].join('\n'))

// ——— Reading ———

export const published = (): ReadonlyMap<string, unknown> => docs
export const getDoc = (key: string) => docs.get(key)
export const versionId = (key: string) => versionOf.get(key)
export const current = () => live

export function file(hash: string): string | undefined {
  return live?.files.get(hash) ?? older.get(hash)
}

const gz = new Map<string, Buffer>()
/** A file gzipped (cached; files never change). */
export function gzipped(hash: string, text: string): Buffer {
  let b = gz.get(hash)
  if (!b) {
    b = gzipSync(text)
    if (gz.size > 400) gz.delete(gz.keys().next().value!)
    gz.set(hash, b)
  }
  return b
}

function rebuild(release: ReleaseRow | undefined) {
  if (!release) { live = null; return }
  const r = buildRelease(docs)
  if (live) for (const [h, t] of live.files) if (!r.files.has(h)) older.set(h, t)
  // Keep roughly the files of the last few releases.
  while (older.size > 600) older.delete(older.keys().next().value!)
  live = { release: release.id, publishedAt: release.created_at, manifest: { ...r.manifest, release: release.id, publishedAt: release.created_at }, files: r.files }
}

/** Loads the published content into memory; on an empty database imports content/ (the files this image was built with). */
export function load() {
  if (!one('SELECT 1 FROM releases LIMIT 1')) importDir(CONFIG.contentDir)
  const rows = all<{ key: string; version: number; data: string | null }>('SELECT d.key, d.version, v.data FROM docs d JOIN versions v ON v.id = d.version')
  docs = new Map()
  versionOf.clear()
  for (const r of rows) if (r.data !== null) { docs.set(r.key, JSON.parse(r.data)); versionOf.set(r.key, r.version) }
  rebuild(one<ReleaseRow>('SELECT * FROM releases ORDER BY id DESC LIMIT 1'))
  const chain = verifyChain()
  if (!chain.ok) console.error(`content history: hash chain broken at version ${chain.brokenAt}`)
  console.log(`content: release ${live?.release ?? '–'}, ${docs.size} documents, ${chain.count} versions`)
}

function importDir(dir: string) {
  if (!existsSync(join(dir, 'topics'))) { console.warn(`content: nothing to import in ${dir}`); return }
  const snap = readSnapshot(dir)
  const issues = checkSnapshot(snap)
  if (issues.length) {
    console.error(`content: not importing ${dir}, ${issues.length} problems, e.g. ${issues.slice(0, 3).map((i) => `${i.key} ${i.path}: ${i.message}`).join('; ')}`)
    return
  }
  const r = tx(() => {
    const out = writeRelease([...snap].map(([key, data]) => ({ key, data })), { userId: null, reason: 'import', note: 'Import učiva z repozitáře' }, false)
    // Drafts started before the content moved here are based on what was imported.
    run(`UPDATE drafts SET base_version = (SELECT version FROM docs WHERE key = 'topics/' || drafts.grade || '/' || drafts.subject || '/' || drafts.topic_id)
         WHERE kind = 'edit' AND base_version IS NULL`)
    return out
  })
  audit('content.imported', null, { release: r.release, docs: snap.size, dir })
  console.log(`content: imported ${snap.size} documents from ${dir} as release ${r.release}`)
}

// ——— Publishing ———

export interface DocChange { key: string; data: unknown | null }
export interface PublishMeta { userId: string | null; reason: Reason; draftId?: string; note?: string; approvedBy?: string[] }

/** Problems of the content after these changes (only the changed documents are checked in depth). */
export function problemsAfter(changes: DocChange[]): CheckIssue[] {
  const next = new Map(docs)
  for (const c of changes) if (c.data === null) next.delete(c.key); else next.set(c.key, c.data)
  return checkSnapshot(next, { only: new Set(changes.filter((c) => c.data !== null).map((c) => c.key)) })
}

/** Writes a release with new versions of the changed documents. Runs inside tx(); publish() is the normal way. */
function writeRelease(changes: DocChange[], meta: PublishMeta, check = true) {
  if (check) {
    const problems = problemsAfter(changes)
    if (problems.length) throw new HttpError(422, 'Obsah by po změně nebyl v pořádku.', 'invalid', { problems: problems.slice(0, 50) })
  }
  const now = Date.now()
  const prev = one<{ chain: string }>('SELECT chain FROM versions ORDER BY id DESC LIMIT 1')?.chain ?? ''
  let chain = prev
  const release = (one<{ id: number }>('SELECT MAX(id) AS id FROM releases')?.id ?? 0) + 1
  const real = changes.filter((c) => {
    const cur = one<{ data: string | null }>('SELECT v.data FROM docs d JOIN versions v ON v.id = d.version WHERE d.key = ?', c.key)?.data ?? null
    return (c.data === null ? null : serialize(c.key, c.data)) !== cur
  })
  if (!real.length) throw new HttpError(409, 'Není co zveřejnit – obsah je stejný jako zveřejněná verze.', 'unchanged')
  const hash = sha256(real.map((c) => c.key).join('\n') + chain)
  run('INSERT INTO releases (id, created_at, user_id, draft_id, reason, note, hash, docs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    release, now, meta.userId, meta.draftId ?? null, meta.reason, meta.note ?? null, hash, real.length)
  const ids: Record<string, number> = {}
  const insert = db.prepare(`INSERT INTO versions (key, n, data, hash, user_id, approved_by, draft_id, release_id, reason, created_at, chain)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const c of real) {
    const data = c.data === null ? null : serialize(c.key, c.data)
    const n = (one<{ n: number }>('SELECT MAX(n) AS n FROM versions WHERE key = ?', c.key)?.n ?? 0) + 1
    const v = { key: c.key, n, hash: data === null ? '' : sha256(data), user_id: meta.userId, release_id: release, reason: meta.reason, created_at: now }
    chain = chainOf(chain, v)
    const id = Number(insert.run(v.key, v.n, data, v.hash, v.user_id, meta.approvedBy?.length ? JSON.stringify(meta.approvedBy) : null, meta.draftId ?? null, release, v.reason, now, chain).lastInsertRowid)
    ids[c.key] = id
    if (data === null) run('DELETE FROM docs WHERE key = ?', c.key)
    else run('INSERT INTO docs (key, version) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET version = excluded.version', c.key, id)
  }
  return { release, versions: ids, changes: real }
}

/**
 * Publishes changes as one release. `inside` runs in the same transaction (e.g. marking a draft published),
 * so either everything happens or nothing does.
 */
export function publish(changes: DocChange[], meta: PublishMeta, inside?: (r: { release: number; versions: Record<string, number> }) => void) {
  const r = tx(() => {
    const out = writeRelease(changes, meta)
    inside?.(out)
    return out
  })
  for (const c of r.changes) {
    if (c.data === null) { docs.delete(c.key); versionOf.delete(c.key) } else { docs.set(c.key, JSON.parse(serialize(c.key, c.data))); versionOf.set(c.key, r.versions[c.key]) }
  }
  docs = new Map(docs)
  rebuild(one<ReleaseRow>('SELECT * FROM releases WHERE id = ?', r.release))
  return r
}

// ——— History ———

export interface VersionView {
  id: number; key: string; n: number; deleted: boolean; createdAt: number; reason: Reason; release: number
  author: string | null; approvedBy: string[]; draftId: string | null; current: boolean
}

const names = () => new Map(all<{ id: string; name: string }>('SELECT id, name FROM users').map((u) => [u.id, u.name]))

function view(v: VersionRow, who: Map<string, string>): VersionView {
  return {
    id: v.id, key: v.key, n: v.n, deleted: v.data === null, createdAt: v.created_at, reason: v.reason, release: v.release_id,
    author: v.user_id ? who.get(v.user_id) ?? '?' : null, approvedBy: (JSON.parse(v.approved_by ?? '[]') as string[]).map((id) => who.get(id) ?? '?'),
    draftId: v.draft_id, current: versionOf.get(v.key) === v.id,
  }
}

export function history(key: string): VersionView[] {
  const who = names()
  return all<VersionRow>('SELECT * FROM versions WHERE key = ? ORDER BY n DESC', key).map((v) => view(v, who))
}

export function version(id: number): { version: VersionView; data: unknown | null } {
  const v = one<VersionRow>('SELECT * FROM versions WHERE id = ?', id)
  if (!v) throw new HttpError(404, 'Verze nenalezena.')
  return { version: view(v, names()), data: v.data === null ? null : JSON.parse(v.data) }
}

/** The version of a document before `id` (null when `id` is its first). */
export function previousVersion(id: number): { id: number; data: unknown | null } | null {
  const v = one<VersionRow>('SELECT * FROM versions WHERE id = ?', id)
  const p = v && one<VersionRow>('SELECT * FROM versions WHERE key = ? AND n < ? ORDER BY n DESC LIMIT 1', v.key, v.n)
  return p ? { id: p.id, data: p.data === null ? null : JSON.parse(p.data) } : null
}

export interface ReleaseView { id: number; createdAt: number; reason: Reason; note: string | null; author: string | null; draftId: string | null; docs: number; keys: string[] }

export function releases(before?: number): ReleaseView[] {
  const who = names()
  const rows = all<ReleaseRow>('SELECT * FROM releases WHERE id < ? ORDER BY id DESC LIMIT 50', before ?? Number.MAX_SAFE_INTEGER)
  return rows.map((r) => ({
    id: r.id, createdAt: r.created_at, reason: r.reason, note: r.note, author: r.user_id ? who.get(r.user_id) ?? '?' : null, draftId: r.draft_id, docs: r.docs,
    keys: r.docs <= 20 ? all<{ key: string }>('SELECT key FROM versions WHERE release_id = ? ORDER BY key', r.id).map((x) => x.key) : [],
  }))
}

/** Every document as it was right after release `id`. */
export function contentAt(id: number): Map<string, unknown> {
  if (!one('SELECT 1 FROM releases WHERE id = ?', id)) throw new HttpError(404, 'Vydání nenalezeno.')
  const rows = all<{ key: string; data: string | null }>(`
    SELECT v.key, v.data FROM versions v
    JOIN (SELECT key, MAX(n) AS n FROM versions WHERE release_id <= ? GROUP BY key) last ON last.key = v.key AND last.n = v.n`, id)
  return new Map(rows.filter((r) => r.data !== null).map((r) => [r.key, JSON.parse(r.data!)]))
}

/** The changes that make the published content equal to `target`. */
export function changesTo(target: ReadonlyMap<string, unknown>): DocChange[] {
  const out: DocChange[] = []
  for (const [key, data] of target) if (serialize(key, data) !== serialize(key, docs.get(key) ?? null)) out.push({ key, data })
  for (const key of docs.keys()) if (!target.has(key)) out.push({ key, data: null })
  return out
}

/** Recomputes the hash chain of all versions. */
export function verifyChain(): { ok: boolean; count: number; last: string; brokenAt?: number } {
  let chain = ''
  let count = 0
  for (const v of db.prepare('SELECT * FROM versions ORDER BY id').iterate() as Iterable<VersionRow>) {
    count++
    if ((v.data === null ? '' : sha256(v.data)) !== v.hash || chainOf(chain, v) !== v.chain) return { ok: false, count, last: chain, brokenAt: v.id }
    chain = v.chain
  }
  return { ok: true, count, last: chain }
}
