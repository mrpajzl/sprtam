import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { bearer } from './auth'
import { CONFIG } from './config'
import { all, db, one, run, type ReleaseRow, type VersionRow } from './db'
import { HttpError, type Req, type Res } from './http'
import { verifyChain } from './store'

// Backups are pulled, not pushed: a machine elsewhere (docs/OBSAH.md, Zálohy) asks for a snapshot of the
// whole database every hour with its own token, keeps encrypted copies this server cannot reach or delete,
// and replays every release into a git mirror. This server only answers; it holds no credentials of the
// backup machine. The puller also keeps the last hash chain it saw and checks the history only grew.

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest()

/** Only the backup puller: `Authorization: Bearer <BACKUP_TOKEN>`. */
export function requireBackup(req: Req) {
  const t = bearer(req)
  if (!CONFIG.backupToken || !t || !timingSafeEqual(sha(t), sha(CONFIG.backupToken))) throw new HttpError(401, 'Neplatný token zálohy.', 'backup')
}

/** A consistent copy of the database (VACUUM INTO), gzipped. */
export function snapshot(res: Res, ip: string) {
  const file = join(CONFIG.dataDir, `snapshot-${randomBytes(8).toString('hex')}.sqlite`)
  try {
    db.prepare('VACUUM INTO ?').run(file)
    const raw = readFileSync(file)
    const body = gzipSync(raw)
    const digest = createHash('sha256').update(raw).digest('hex')
    const chain = verifyChain()
    run('INSERT INTO backups (at, bytes, sha256, ip) VALUES (?, ?, ?, ?)', Date.now(), raw.length, digest, ip)
    run('DELETE FROM backups WHERE at < ?', Date.now() - 90 * 86_400_000)
    res.writeHead(200, {
      'Content-Type': 'application/gzip', 'Content-Length': body.length, 'Cache-Control': 'no-store',
      'X-Backup-Sha256': digest, 'X-Content-Versions': String(chain.count), 'X-Content-Chain': chain.last, 'X-Content-Chain-Ok': chain.ok ? '1' : '0',
    })
    res.end(body)
  } finally { rmSync(file, { force: true }) }
}

/** The puller says how checking and storing the snapshot went (and up to which release the git mirror is). */
export function backupReport(body: Record<string, unknown>) {
  const sha = typeof body.sha256 === 'string' && /^[0-9a-f]{64}$/.test(body.sha256) ? body.sha256 : ''
  const note = typeof body.message === 'string' ? body.message.slice(0, 500) : null
  const mirrored = Number.isInteger(body.mirrored) ? Number(body.mirrored) : null
  if (!sha || run('UPDATE backups SET verified = ?, note = ?, mirrored = ? WHERE sha256 = ? AND id = (SELECT MAX(id) FROM backups WHERE sha256 = ?)', body.ok === true ? 1 : 0, note, mirrored, sha, sha).changes !== 1) {
    throw new HttpError(404, 'Taková záloha tu není.')
  }
  return { ok: true }
}

export function backupStatus() {
  const last = one<{ at: number; bytes: number; verified: number | null; note: string | null }>('SELECT at, bytes, verified, note FROM backups ORDER BY id DESC LIMIT 1')
  const good = one<{ at: number }>('SELECT at FROM backups WHERE verified = 1 ORDER BY id DESC LIMIT 1')
  const mirror = one<{ mirrored: number }>('SELECT mirrored FROM backups WHERE mirrored IS NOT NULL ORDER BY id DESC LIMIT 1')
  const day = one<{ n: number }>('SELECT COUNT(*) AS n FROM backups WHERE at > ?', Date.now() - 86_400_000)!.n
  return {
    configured: !!CONFIG.backupToken, lastAt: last?.at ?? null, lastBytes: last?.bytes ?? null, last24h: day,
    lastVerified: last ? last.verified : null, lastNote: last?.note ?? null, lastGoodAt: good?.at ?? null, mirrored: mirror?.mirrored ?? null,
  }
}

// ——— Releases for the git mirror ———

const names = () => new Map(all<{ id: string; name: string }>('SELECT id, name FROM users').map((u) => [u.id, u.name]))

export function releasesAfter(after: unknown) {
  const from = Number(after) || 0
  const who = names()
  return all<ReleaseRow>('SELECT * FROM releases WHERE id > ? ORDER BY id LIMIT 200', from).map((r) => ({
    id: r.id, createdAt: r.created_at, reason: r.reason, note: r.note, author: r.user_id ? who.get(r.user_id) ?? null : null, docs: r.docs,
  }))
}

/** The documents a release changed (null = removed) and who approved them. */
export function releaseChanges(id: unknown) {
  const r = one<ReleaseRow>('SELECT * FROM releases WHERE id = ?', Number(id))
  if (!r) throw new HttpError(404, 'Vydání nenalezeno.')
  const who = names()
  const versions = all<VersionRow>('SELECT * FROM versions WHERE release_id = ? ORDER BY id', r.id)
  return {
    id: r.id, createdAt: r.created_at, reason: r.reason, note: r.note, author: r.user_id ? who.get(r.user_id) ?? null : null,
    approvedBy: [...new Set(versions.flatMap((v) => JSON.parse(v.approved_by ?? '[]') as string[]))].map((u) => who.get(u) ?? '?'),
    docs: Object.fromEntries(versions.map((v) => [v.key, v.data === null ? null : JSON.parse(v.data)])),
    chain: versions.length ? versions[versions.length - 1].chain : null,
  }
}
