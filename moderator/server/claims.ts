import { parseKey, topicKey } from '../../src/content/docs'
import type { Session } from './auth'
import { HOUR } from './config'
import { all, audit, one, run } from './db'
import { HttpError } from './http'
import { published } from './store'

// "Beru si to": a moderator says they are working on a pupil's report or on checking an unverified topic, so two
// people do not do the same work. A claim lasts two days (it can be renewed) and goes away when the work is done:
// the report is closed or the topic verified.

export const CLAIM_MS = 48 * HOUR
/** Claims one moderator may hold at once (nobody keeps half of the content to themselves). */
const MAX_CLAIMS = 40

export type ClaimKind = 'report' | 'topic'
export interface ClaimView { kind: ClaimKind; ref: string; userId: string; name: string; until: number }

const prune = () => run('DELETE FROM claims WHERE until < ?', Date.now())

/** Every claim in force (a short list: a few per moderator at most). */
export function activeClaims(): ClaimView[] {
  prune()
  return all<{ kind: ClaimKind; ref: string; user_id: string; name: string; until: number }>(
    'SELECT c.kind, c.ref, c.user_id, u.name, c.until FROM claims c JOIN users u ON u.id = c.user_id WHERE u.active = 1 ORDER BY c.created_at',
  ).map((c) => ({ kind: c.kind, ref: c.ref, userId: c.user_id, name: c.name, until: c.until }))
}

/** Claims of one kind by what they are about. */
export const claimsBy = (kind: ClaimKind) => new Map(activeClaims().filter((c) => c.kind === kind).map((c) => [c.ref, c]))

function checkRef(kind: unknown, ref: unknown): [ClaimKind, string] {
  if (kind === 'report') {
    const r = typeof ref === 'string' ? one<{ status: string }>('SELECT status FROM reports WHERE id = ?', ref) : undefined
    if (!r) throw new HttpError(404, 'Hlášení nenalezeno.')
    if (r.status !== 'open') throw new HttpError(409, 'Hlášení už je vyřízené.')
    return ['report', ref as string]
  }
  if (kind === 'topic') {
    const k = typeof ref === 'string' ? parseKey(`topics/${ref}`) : null
    if (k?.kind !== 'topic' || !published().has(topicKey(k.grade, k.subject, k.id))) throw new HttpError(404, 'Téma nenalezeno.')
    return ['topic', ref as string]
  }
  throw new HttpError(400, 'Neznámý druh (report nebo topic).')
}

/** Takes (or renews) a claim; somebody else's claim in force stops it. */
export function claim(s: Session, body: Record<string, unknown>, ip: string) {
  const [kind, ref] = checkRef(body.kind, body.ref)
  prune()
  const held = one<{ user_id: string; name: string; until: number }>('SELECT c.user_id, u.name, c.until FROM claims c JOIN users u ON u.id = c.user_id WHERE c.kind = ? AND c.ref = ? AND u.active = 1', kind, ref)
  if (held && held.user_id !== s.user.id) throw new HttpError(409, `Tohle si už bere ${held.name}.`, 'claimed', { claim: { userId: held.user_id, name: held.name, until: held.until } })
  if (!held && one<{ n: number }>('SELECT COUNT(*) AS n FROM claims WHERE user_id = ?', s.user.id)!.n >= MAX_CLAIMS) {
    throw new HttpError(429, `Zamluveno máš už ${MAX_CLAIMS} věcí. Nejdřív některé dokonči nebo uvolni.`)
  }
  const now = Date.now()
  run('INSERT INTO claims (kind, ref, user_id, created_at, until) VALUES (?, ?, ?, ?, ?) ON CONFLICT (kind, ref) DO UPDATE SET user_id = excluded.user_id, created_at = excluded.created_at, until = excluded.until',
    kind, ref, s.user.id, now, now + CLAIM_MS)
  if (!held) audit('claim.taken', s.user.id, { kind, ref }, ip)
  return { kind, ref, userId: s.user.id, name: s.user.name, until: now + CLAIM_MS } satisfies ClaimView
}

/** Gives a claim up: one's own, or anybody's for an admin (someone went on holiday). */
export function unclaim(s: Session, kind: unknown, ref: unknown, ip: string) {
  const c = typeof kind === 'string' && typeof ref === 'string' ? one<{ user_id: string }>('SELECT user_id FROM claims WHERE kind = ? AND ref = ?', kind, ref) : undefined
  if (!c) return { ok: true }
  if (c.user_id !== s.user.id && s.user.role !== 'admin') throw new HttpError(403, 'Uvolnit smíš jen to, co sis vzal/a sám/sama.')
  run('DELETE FROM claims WHERE kind = ? AND ref = ?', kind as string, ref as string)
  audit('claim.released', s.user.id, { kind, ref, ...(c.user_id !== s.user.id ? { of: c.user_id } : {}) }, ip)
  return { ok: true }
}

/** The work is done (a report closed, a topic verified): its claim goes. */
export function releaseClaims(kind: ClaimKind, refs: string[]) {
  for (const ref of refs) run('DELETE FROM claims WHERE kind = ? AND ref = ?', kind, ref)
}

/** Claims a moderator takes as a side effect (fixing reports): never takes one away from somebody else. */
export function claimQuietly(userId: string, kind: ClaimKind, refs: string[]) {
  const now = Date.now()
  for (const ref of refs) {
    run('INSERT INTO claims (kind, ref, user_id, created_at, until) VALUES (?, ?, ?, ?, ?) ON CONFLICT (kind, ref) DO UPDATE SET user_id = excluded.user_id, created_at = excluded.created_at, until = excluded.until WHERE claims.user_id = excluded.user_id OR claims.until < ?',
      kind, ref, userId, now, now + CLAIM_MS, now)
  }
}
