import type { Session } from './auth'
import { createInvite } from './auth'
import { all, audit, one, run, type InviteRow, type UserRow } from './db'
import { HttpError } from './http'
import { assertNameFree, cleanName } from './profiles'

// Managing moderators (admins only, with a fresh passkey confirmation for every change).

const ROLES = ['admin', 'moderator'] as const
const role = (v: unknown) => {
  if (!ROLES.includes(v as never)) throw new HttpError(400, 'Neznámá role.')
  return v as (typeof ROLES)[number]
}

export function listUsers() {
  const keys = all<{ user_id: string; n: number; last: number | null }>('SELECT user_id, COUNT(*) AS n, MAX(last_used_at) AS last FROM credentials GROUP BY user_id')
  const sessions = all<{ user_id: string; n: number }>('SELECT user_id, COUNT(*) AS n FROM sessions GROUP BY user_id')
  const tokens = all<{ user_id: string; n: number }>('SELECT user_id, COUNT(*) AS n FROM api_tokens WHERE expires_at > ? GROUP BY user_id', Date.now())
  return all<UserRow>('SELECT * FROM users ORDER BY active DESC, name').map((u) => ({
    id: u.id, name: u.name, role: u.role, active: !!u.active, createdAt: u.created_at, lastLoginAt: u.last_login_at,
    keys: keys.find((k) => k.user_id === u.id)?.n ?? 0, sessions: sessions.find((k) => k.user_id === u.id)?.n ?? 0,
    tokens: tokens.find((k) => k.user_id === u.id)?.n ?? 0,
  }))
}

export function listInvites() {
  return all<InviteRow & { by_name: string | null; for_name: string | null }>(
    `SELECT i.*, b.name AS by_name, f.name AS for_name FROM invites i LEFT JOIN users b ON b.id = i.created_by LEFT JOIN users f ON f.id = i.user_id
     WHERE i.used_at IS NULL AND i.expires_at > ? ORDER BY i.created_at DESC`, Date.now(),
  ).map((i) => ({ id: i.hash.slice(0, 16), kind: i.kind, name: i.for_name ?? i.name, role: i.role, by: i.by_name, createdAt: i.created_at, expiresAt: i.expires_at }))
}

export function invite(s: Session, body: Record<string, unknown>, ip: string) {
  const name = cleanName(body.name)
  assertNameFree(name, null)
  const r = role(body.role)
  const out = createInvite(s.user, 'user', name, r)
  audit('invite.created', s.user.id, { name, role: r }, ip)
  return out
}

export function revokeInvite(s: Session, id: unknown, ip: string) {
  if (typeof id !== 'string' || !/^[0-9a-f]{16}$/.test(id)) throw new HttpError(400, 'Neplatná pozvánka.')
  const n = run('DELETE FROM invites WHERE substr(hash, 1, 16) = ? AND used_at IS NULL', id).changes
  if (!n) throw new HttpError(404, 'Pozvánka nenalezena.')
  audit('invite.revoked', s.user.id, null, ip)
}

const target = (id: unknown) => {
  const u = typeof id === 'string' ? one<UserRow>('SELECT * FROM users WHERE id = ?', id) : undefined
  if (!u) throw new HttpError(404, 'Uživatel nenalezen.')
  return u
}

/** Admins who can still sign in (active, with a passkey) – one of them must always remain. */
const otherActiveAdmins = (id: string) => one<{ n: number }>(
  "SELECT COUNT(*) AS n FROM users u WHERE u.role = 'admin' AND u.active = 1 AND u.id != ? AND EXISTS (SELECT 1 FROM credentials c WHERE c.user_id = u.id)", id)!.n
/** Unused links for a new passkey of a user – void after a reset or when the account is switched off. */
const dropKeyLinks = (userId: string) => run("DELETE FROM invites WHERE user_id = ? AND kind = 'key' AND used_at IS NULL", userId)

export function updateUser(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const u = target(id)
  if ('active' in body) {
    const active = body.active === true
    if (!active && u.id === s.user.id) throw new HttpError(400, 'Sám sebe vypnout nemůžeš.')
    if (!active && u.role === 'admin' && !otherActiveAdmins(u.id)) throw new HttpError(400, 'Musí zůstat aspoň jeden aktivní správce.')
    run('UPDATE users SET active = ? WHERE id = ?', active ? 1 : 0, u.id)
    // A switched-off account is out immediately, everywhere.
    if (!active) { run('DELETE FROM sessions WHERE user_id = ?', u.id); run('DELETE FROM api_tokens WHERE user_id = ?', u.id); dropKeyLinks(u.id) }
    audit(active ? 'user.enabled' : 'user.disabled', s.user.id, { user: u.id, name: u.name }, ip)
  }
  if ('role' in body) {
    const r = role(body.role)
    if (r !== 'admin' && u.role === 'admin' && !otherActiveAdmins(u.id)) throw new HttpError(400, 'Musí zůstat aspoň jeden aktivní správce.')
    run('UPDATE users SET role = ? WHERE id = ?', r, u.id)
    audit('user.role', s.user.id, { user: u.id, name: u.name, role: r }, ip)
  }
  if ('name' in body) {
    const name = cleanName(body.name)
    assertNameFree(name, u.id)
    run('UPDATE users SET name = ? WHERE id = ?', name, u.id)
    // The former name too: topics checked under it keep leading to this account (profiles.ts).
    audit('user.renamed', s.user.id, { user: u.id, from: u.name, name }, ip)
  }
}

/** A link for a new passkey (lost phone…). `reset` also removes the old passkeys and sessions first. */
export function keyLink(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const u = target(id)
  if (!u.active) throw new HttpError(400, 'Účet je vypnutý. Nejdřív ho zapni.')
  if (body.reset === true) {
    if (u.id === s.user.id) throw new HttpError(400, 'Vlastní klíče si spravuj v Účtu.')
    if (u.role === 'admin' && !otherActiveAdmins(u.id)) throw new HttpError(400, 'Musí zůstat aspoň jeden správce, který se může přihlásit.')
    run('DELETE FROM credentials WHERE user_id = ?', u.id)
    run('DELETE FROM sessions WHERE user_id = ?', u.id)
    run('DELETE FROM api_tokens WHERE user_id = ?', u.id)
    dropKeyLinks(u.id)
  }
  const out = createInvite(s.user, 'key', u.name, u.role, u.id)
  audit(body.reset === true ? 'user.keys-reset' : 'key.link', s.user.id, { user: u.id, name: u.name }, ip)
  return out
}

/** Signs a user out everywhere: every session (except the admin's own current one) and every API token. */
export function endSessions(s: Session, id: unknown, ip: string) {
  const u = target(id)
  run('DELETE FROM sessions WHERE user_id = ?' + (u.id === s.user.id ? ' AND hash != ?' : ''), ...(u.id === s.user.id ? [u.id, s.hash] : [u.id]))
  run('DELETE FROM api_tokens WHERE user_id = ?', u.id)
  audit('sessions.ended', s.user.id, { user: u.id, name: u.name }, ip)
}

/** A page of the audit log, newest first, optionally narrowed to one person ("-" = no account: CLI, applicants, unknown keys),
 *  a set of actions (comma separated) and words found in the details or the IP. */
export function auditLog(before: unknown, user: unknown, actions: unknown, q: unknown) {
  const b = typeof before === 'string' && /^\d+$/.test(before) ? Number(before) : Number.MAX_SAFE_INTEGER
  const where = ['a.id < ?']
  const args: (string | number)[] = [b]
  if (user === '-') where.push('a.user_id IS NULL')
  else if (typeof user === 'string' && user) { where.push('a.user_id = ?'); args.push(user) }
  const acts = typeof actions === 'string' ? actions.split(',').filter((a) => /^[a-z][a-z.-]{0,40}$/.test(a)).slice(0, 50) : []
  if (acts.length) { where.push(`a.action IN (${acts.map(() => '?').join(', ')})`); args.push(...acts) }
  for (const w of typeof q === 'string' ? q.trim().slice(0, 100).split(/\s+/).filter(Boolean).slice(0, 5) : []) {
    const like = `%${w.replace(/[\\%_]/g, (c) => '\\' + c)}%`
    where.push("(a.detail LIKE ? ESCAPE '\\' OR a.ip LIKE ? ESCAPE '\\')")
    args.push(like, like)
  }
  return all<{ id: number; at: number; user_id: string | null; name: string | null; action: string; detail: string | null; ip: string | null }>(
    `SELECT a.*, u.name FROM audit a LEFT JOIN users u ON u.id = a.user_id WHERE ${where.join(' AND ')} ORDER BY a.id DESC LIMIT 100`, ...args,
  ).map((a) => ({ id: a.id, at: a.at, user: a.name, action: a.action, detail: a.detail ? JSON.parse(a.detail) : null, ip: a.ip }))
}
