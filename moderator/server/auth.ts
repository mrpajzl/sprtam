import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import {
  generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse,
  type AuthenticationResponseJSON, type RegistrationResponseJSON,
} from '@simplewebauthn/server'
import { CONFIG, DAY, LIMITS, MINUTE } from './config'
import { all, audit, one, run, tx, type CredentialRow, type InviteRow, type SessionRow, type UserRow } from './db'
import { clearSessionCookie, cookies, HttpError, limit, SESSION_COOKIE, sessionCookie, type Req, type Res } from './http'

// Sign-in with passkeys only (WebAuthn, user verification required): nothing to guess, phish or reuse.
// Accounts exist only through a single-use invite link from an admin. Sessions are random 256-bit tokens
// in a __Host- cookie (HttpOnly, Secure, SameSite=Strict); the database keeps only their SHA-256.

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const token = () => randomBytes(32).toString('base64url')

export interface User { id: string; name: string; role: 'admin' | 'moderator' }
/** A signed-in browser (cookie), or a script with an API token (only where a route allows tokens). */
export interface Session { user: User; hash: string; authAt: number; via: 'cookie' | 'token' }

// ——— Challenges ———
// Registration challenges (an invite or a signed-in user is needed to get one) are kept in memory, single use.
// Login challenges are open to anyone, so they are not stored at all: the server signs {challenge, expiry}
// with a key that exists only in this process and remembers a challenge only once it was used successfully.

interface Challenge { challenge: string; until: number; invite?: string; webauthnId?: string; userId?: string }
const challenges = new Map<string, Challenge>()
const usedLogins = new Map<string, number>()
setInterval(() => {
  const now = Date.now()
  for (const [k, c] of challenges) if (c.until < now) challenges.delete(k)
  for (const [k, until] of usedLogins) if (until < now) usedLogins.delete(k)
}, MINUTE).unref()

const EXPIRED = 'Platnost výzvy vypršela. Zkus to znovu.'

function putChallenge(c: Omit<Challenge, 'until'>): string {
  if (challenges.size > 5000) throw new HttpError(503, 'Server je přetížený, zkus to za chvíli.')
  const id = randomUUID()
  challenges.set(id, { ...c, until: Date.now() + LIMITS.challenge })
  return id
}

function takeChallenge(id: unknown): Challenge {
  const c = typeof id === 'string' ? challenges.get(id) : undefined
  if (typeof id === 'string') challenges.delete(id)
  if (!c || c.until < Date.now()) throw new HttpError(400, EXPIRED, 'challenge')
  return c
}

const LOGIN_KEY = randomBytes(32)
const mac = (challenge: string, until: number) => createHmac('sha256', LOGIN_KEY).update(`login|${until}|${challenge}`).digest()

/** `<expiry>.<challenge>.<mac>`: everything the server needs to check a login answer later. */
const signLogin = (challenge: string, until: number) => `${until}.${challenge}.${mac(challenge, until).toString('base64url')}`

function openLogin(id: unknown): { challenge: string; until: number } {
  const [u, challenge, m] = typeof id === 'string' && id.length < 300 ? id.split('.') : []
  const until = Number(u)
  const given = Buffer.from(m ?? '', 'base64url')
  const ok = challenge && Number.isFinite(until) && until > Date.now() && given.length === 32 && timingSafeEqual(given, mac(challenge, until))
  if (!ok || usedLogins.has(challenge)) throw new HttpError(400, EXPIRED, 'challenge')
  return { challenge, until }
}

// ——— Sessions ———

/** `Authorization: Bearer spt_…` – an API token instead of the session cookie. */
export const bearer = (req: Req) => {
  const h = req.headers.authorization
  return typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7).trim() : null
}

export function getSession(req: Req): Session | null {
  const b = bearer(req)
  if (b !== null) return tokenSession(b)
  const t = cookies(req)[SESSION_COOKIE]
  if (!t || t.length > 100) return null
  const hash = sha256(t)
  const row = one<SessionRow & Pick<UserRow, 'name' | 'role' | 'active'>>(
    'SELECT s.*, u.name, u.role, u.active FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.hash = ?', hash)
  const now = Date.now()
  if (!row) return null
  if (!row.active || row.seen_at + LIMITS.sessionIdle < now || row.created_at + LIMITS.sessionMax < now) {
    run('DELETE FROM sessions WHERE hash = ?', hash)
    return null
  }
  if (now - row.seen_at > MINUTE) run('UPDATE sessions SET seen_at = ? WHERE hash = ?', now, hash)
  return { user: { id: row.user_id, name: row.name, role: row.role }, hash, authAt: row.auth_at, via: 'cookie' }
}

function startSession(req: Req, res: Res, userId: string, credentialId: string) {
  // A login replaces the session this browser had (no session fixation, no piling up).
  const old = cookies(req)[SESSION_COOKIE]
  if (old) run('DELETE FROM sessions WHERE hash = ?', sha256(old))
  const t = token(), now = Date.now()
  run('INSERT INTO sessions (hash, user_id, cred_id, created_at, seen_at, auth_at, ua) VALUES (?, ?, ?, ?, ?, ?, ?)', sha256(t), userId, credentialId, now, now, now, String(req.headers['user-agent'] ?? '').slice(0, 200))
  run('UPDATE users SET last_login_at = ? WHERE id = ?', now, userId)
  run('DELETE FROM sessions WHERE seen_at < ? OR created_at < ?', now - LIMITS.sessionIdle, now - LIMITS.sessionMax)
  res.setHeader('Set-Cookie', sessionCookie(t, LIMITS.sessionMax))
}

export function logout(req: Req, res: Res) {
  const t = cookies(req)[SESSION_COOKIE]
  if (t) run('DELETE FROM sessions WHERE hash = ?', sha256(t))
  res.setHeader('Set-Cookie', clearSessionCookie())
}

/**
 * The signed-in moderator. API tokens are accepted only where `tokens` is set: they can read content and work
 * on their own drafts, never review, publish or manage anything.
 */
export function requireSession(req: Req, tokens = false): Session {
  const s = getSession(req)
  if (!s) throw new HttpError(401, bearer(req) !== null ? 'Neplatný nebo prošlý API token.' : 'Přihlas se prosím.', 'login')
  if (s.via === 'token' && !tokens) throw new HttpError(403, 'Tohle s API tokenem nejde – jen v moderaci po přihlášení.', 'token')
  if (s.via === 'token') limit(`token:${s.hash}`, 600, 10 * MINUTE)
  return s
}

/**
 * Whose rate limits a request counts against. Each API token has its own, apart from the moderator in the
 * browser: a script working through dozens of topics must not lock its owner out of opening a topic.
 */
export const actor = (s: Session) => (s.via === 'token' ? s.hash : `user:${s.user.id}`)

/** Admin actions and passkey changes need a passkey confirmation from the last few minutes. */
export function requireRecent(s: Session) {
  if (s.via !== 'cookie' || Date.now() - s.authAt > LIMITS.recentAuth) throw new HttpError(403, 'Potvrď to prosím svým klíčem.', 'reauth')
}

export function requireAdmin(req: Req, recent = false): Session {
  const s = requireSession(req)
  if (s.user.role !== 'admin') throw new HttpError(403, 'Na tohle nemáš oprávnění.')
  if (recent) requireRecent(s)
  return s
}

// ——— Login ———

export async function loginOptions() {
  const options = await generateAuthenticationOptions({ rpID: CONFIG.rpId, userVerification: 'required', timeout: LIMITS.challenge })
  return { challengeId: signLogin(options.challenge, Date.now() + LIMITS.challenge), options }
}

const FAIL = 'Tenhle klíč tu neznáme, nebo je účet vypnutý.'

export async function loginVerify(req: Req, res: Res, ip: string, body: Record<string, unknown>) {
  const c = openLogin(body.challengeId)
  const response = body.response as AuthenticationResponseJSON
  if (!response || typeof response.id !== 'string') throw new HttpError(400, FAIL)
  const cred = one<CredentialRow>('SELECT * FROM credentials WHERE id = ?', response.id)
  const user = cred && one<UserRow>('SELECT * FROM users WHERE id = ?', cred.user_id)
  if (!cred || !user || !user.active) { audit('login.fail', user?.id ?? null, { reason: cred ? 'inactive' : 'unknown-key' }, ip); throw new HttpError(401, FAIL) }
  let v
  try {
    v = await verifyAuthenticationResponse({
      response, expectedChallenge: c.challenge, expectedOrigin: CONFIG.origin, expectedRPID: CONFIG.rpId, requireUserVerification: true,
      credential: { id: cred.id, publicKey: new Uint8Array(cred.public_key), counter: cred.counter, transports: JSON.parse(cred.transports) },
    })
  } catch { v = { verified: false } as const }
  if (!v.verified) { audit('login.fail', user.id, { reason: 'signature' }, ip); throw new HttpError(401, FAIL) }
  // A signed challenge works once.
  if (usedLogins.has(c.challenge)) throw new HttpError(400, EXPIRED, 'challenge')
  usedLogins.set(c.challenge, c.until)
  run('UPDATE credentials SET counter = ?, last_used_at = ? WHERE id = ?', v.authenticationInfo.newCounter, Date.now(), cred.id)
  startSession(req, res, user.id, cred.id)
  audit('login', user.id, { key: cred.label }, ip)
  return { user: { id: user.id, name: user.name, role: user.role } }
}

// ——— Invites (new account, or a new passkey for an existing one) ———

export function createInvite(by: User | null, kind: 'user' | 'key', name: string, role: 'admin' | 'moderator', userId: string | null = null) {
  const t = token(), now = Date.now()
  run('INSERT INTO invites (hash, kind, user_id, name, role, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', sha256(t), kind, userId, name, role, by?.id ?? null, now, now + LIMITS.invite)
  // The token travels in the #fragment: browsers never send it to a server or in a Referer.
  return { url: `${CONFIG.origin}/pozvanka#${t}`, expiresAt: now + LIMITS.invite, id: sha256(t).slice(0, 16) }
}

function findInvite(t: unknown): InviteRow {
  const row = typeof t === 'string' && t.length < 100 ? one<InviteRow>('SELECT * FROM invites WHERE hash = ?', sha256(t)) : undefined
  if (!row || row.used_at || row.expires_at < Date.now()) throw new HttpError(404, 'Pozvánka neplatí – už byla použitá, vypršela, nebo je odkaz neúplný. Požádej o novou.', 'invite')
  if (row.kind === 'key' && !one<UserRow>('SELECT id FROM users WHERE id = ? AND active = 1', row.user_id)) throw new HttpError(404, 'Účet k této pozvánce je vypnutý.', 'invite')
  return row
}

export function inviteInfo(body: Record<string, unknown>) {
  const inv = findInvite(body.token)
  return { kind: inv.kind, name: inv.name, role: inv.role, expiresAt: inv.expires_at }
}

const SELECTION = { residentKey: 'required', requireResidentKey: true, userVerification: 'required' } as const

async function registrationOptions(name: string, webauthnId: string, exclude: CredentialRow[]) {
  return generateRegistrationOptions({
    rpName: CONFIG.rpName, rpID: CONFIG.rpId, userName: name, userDisplayName: name, userID: Buffer.from(webauthnId, 'base64url'),
    attestationType: 'none', authenticatorSelection: SELECTION, timeout: LIMITS.challenge, supportedAlgorithmIDs: [-8, -7, -257],
    excludeCredentials: exclude.map((c) => ({ id: c.id, transports: JSON.parse(c.transports) })),
  })
}

export async function inviteOptions(body: Record<string, unknown>) {
  const inv = findInvite(body.token)
  const user = inv.user_id ? one<UserRow>('SELECT * FROM users WHERE id = ?', inv.user_id) : undefined
  const webauthnId = user?.webauthn_id ?? randomBytes(32).toString('base64url')
  const options = await registrationOptions(user?.name ?? inv.name, webauthnId, user ? all<CredentialRow>('SELECT * FROM credentials WHERE user_id = ?', user.id) : [])
  return { challengeId: putChallenge({ challenge: options.challenge, invite: inv.hash, webauthnId }), options }
}

async function verifyRegistration(c: Challenge, response: RegistrationResponseJSON) {
  try {
    const v = await verifyRegistrationResponse({ response, expectedChallenge: c.challenge, expectedOrigin: CONFIG.origin, expectedRPID: CONFIG.rpId, requireUserVerification: true })
    if (v.verified) return v.registrationInfo
  } catch { /* below */ }
  throw new HttpError(400, 'Klíč se nepodařilo ověřit. Zkus to znovu.')
}

/** A short name of the device the passkey lives on, from the browser's user agent. */
function deviceLabel(req: Req) {
  const ua = String(req.headers['user-agent'] ?? '')
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Zařízení'
  const br = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : ''
  return br ? `${os} · ${br}` : os
}

function insertCredential(req: Req, userId: string, info: Awaited<ReturnType<typeof verifyRegistration>>) {
  const k = info.credential
  if (one('SELECT id FROM credentials WHERE id = ?', k.id)) throw new HttpError(409, 'Tenhle klíč už je zaregistrovaný.')
  run('INSERT INTO credentials (id, user_id, public_key, counter, transports, device_type, backed_up, label, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    k.id, userId, k.publicKey, k.counter, JSON.stringify(k.transports ?? []), info.credentialDeviceType, info.credentialBackedUp ? 1 : 0, deviceLabel(req), Date.now())
}

export async function inviteVerify(req: Req, res: Res, ip: string, body: Record<string, unknown>) {
  const c = takeChallenge(body.challengeId)
  if (!c.invite || typeof body.token !== 'string' || sha256(body.token) !== c.invite) throw new HttpError(400, 'Pozvánka nesouhlasí.')
  const info = await verifyRegistration(c, body.response as RegistrationResponseJSON)
  const { userId, kind } = tx(() => {
    const inv = findInvite(body.token)
    // Claim the invite atomically: two tabs racing with one link create one account.
    if (run('UPDATE invites SET used_at = ? WHERE hash = ? AND used_at IS NULL', Date.now(), inv.hash).changes !== 1) throw new HttpError(404, 'Pozvánka už byla použitá.')
    let id = inv.user_id
    if (inv.kind === 'user') {
      id = randomUUID()
      run('INSERT INTO users (id, name, role, active, webauthn_id, created_at, created_by) VALUES (?, ?, ?, 1, ?, ?, ?)', id, inv.name, inv.role, c.webauthnId!, Date.now(), inv.created_by)
    }
    insertCredential(req, id!, info)
    return { userId: id!, kind: inv.kind }
  })
  startSession(req, res, userId, info.credential.id)
  audit(kind === 'user' ? 'user.created' : 'key.added', userId, { via: 'invite' }, ip)
  const u = one<UserRow>('SELECT * FROM users WHERE id = ?', userId)!
  return { user: { id: u.id, name: u.name, role: u.role } }
}

// ——— Own passkeys ———

export async function addKeyOptions(s: Session) {
  requireRecent(s)
  const u = one<UserRow>('SELECT * FROM users WHERE id = ?', s.user.id)!
  const options = await registrationOptions(u.name, u.webauthn_id, all<CredentialRow>('SELECT * FROM credentials WHERE user_id = ?', u.id))
  return { challengeId: putChallenge({ challenge: options.challenge, userId: u.id, webauthnId: u.webauthn_id }), options }
}

export async function addKeyVerify(req: Req, s: Session, ip: string, body: Record<string, unknown>) {
  requireRecent(s)
  const c = takeChallenge(body.challengeId)
  if (!c.userId || c.userId !== s.user.id) throw new HttpError(400, 'Výzva nepatří k tvému účtu.')
  const info = await verifyRegistration(c, body.response as RegistrationResponseJSON)
  insertCredential(req, s.user.id, info)
  audit('key.added', s.user.id, null, ip)
  return { ok: true }
}

export function listKeys(userId: string) {
  return all<CredentialRow>('SELECT * FROM credentials WHERE user_id = ? ORDER BY created_at', userId)
    .map((c) => ({ id: c.id, label: c.label, createdAt: c.created_at, lastUsedAt: c.last_used_at, synced: !!c.backed_up }))
}

export function removeKey(s: Session, id: string, ip: string) {
  requireRecent(s)
  const keys = listKeys(s.user.id)
  if (!keys.some((k) => k.id === id)) throw new HttpError(404, 'Klíč nenalezen.')
  if (keys.length < 2) throw new HttpError(400, 'Poslední klíč odebrat nejde – nejdřív si přidej jiný.')
  run('DELETE FROM credentials WHERE id = ? AND user_id = ?', id, s.user.id)
  // Whoever signed in with that key is out too.
  run('DELETE FROM sessions WHERE user_id = ? AND cred_id = ?', s.user.id, id)
  audit('key.removed', s.user.id, null, ip)
}

// ——— API tokens (scripts and agents proposing content) ———

const TOKEN = /^spt_[A-Za-z0-9_-]{43}$/

function tokenSession(t: string): Session | null {
  if (!TOKEN.test(t)) return null
  const hash = sha256(t)
  const row = one<{ id: string; user_id: string; expires_at: number; last_used_at: number | null } & Pick<UserRow, 'name' | 'role' | 'active'>>(
    'SELECT t.id, t.user_id, t.expires_at, t.last_used_at, u.name, u.role, u.active FROM api_tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ?', hash)
  const now = Date.now()
  if (!row || !row.active || row.expires_at < now) return null
  if (!row.last_used_at || now - row.last_used_at > MINUTE) run('UPDATE api_tokens SET last_used_at = ? WHERE hash = ?', now, hash)
  return { user: { id: row.user_id, name: row.name, role: row.role }, hash: `token:${row.id}`, authAt: 0, via: 'token' }
}

export function listTokens(userId: string) {
  return all<{ id: string; label: string; created_at: number; expires_at: number; last_used_at: number | null }>(
    'SELECT id, label, created_at, expires_at, last_used_at FROM api_tokens WHERE user_id = ? ORDER BY created_at DESC', userId,
  ).map((t) => ({ id: t.id, label: t.label, createdAt: t.created_at, expiresAt: t.expires_at, lastUsedAt: t.last_used_at, expired: t.expires_at < Date.now() }))
}

/** A new token, shown once. Needs a fresh passkey confirmation. */
export function createToken(s: Session, body: Record<string, unknown>, ip: string) {
  requireRecent(s)
  const label = typeof body.label === 'string' ? body.label.replace(/\s+/g, ' ').trim().slice(0, 60) : ''
  if (label.length < 2) throw new HttpError(400, 'Pojmenuj token (k čemu ho použiješ).')
  const days = Math.min(Math.max(Math.round(Number(body.days) || 30), 1), LIMITS.apiToken / DAY)
  if (one<{ n: number }>('SELECT COUNT(*) AS n FROM api_tokens WHERE user_id = ?', s.user.id)!.n >= 10) throw new HttpError(429, 'Máš už 10 tokenů. Nějaký nejdřív zruš.')
  const t = `spt_${token()}`, id = randomBytes(6).toString('hex'), now = Date.now()
  run('INSERT INTO api_tokens (hash, id, user_id, label, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)', sha256(t), id, s.user.id, label, now, now + days * DAY)
  audit('token.created', s.user.id, { id, label, days }, ip)
  return { id, token: t, expiresAt: now + days * DAY }
}

export function removeToken(s: Session, id: unknown, ip: string) {
  if (typeof id !== 'string' || run('DELETE FROM api_tokens WHERE id = ? AND user_id = ?', id, s.user.id).changes !== 1) throw new HttpError(404, 'Token nenalezen.')
  audit('token.removed', s.user.id, { id }, ip)
}
