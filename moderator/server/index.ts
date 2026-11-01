import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { HASH } from '../../src/content/manifest'
import { applicationCounts, approveApplication, createApplication, listApplications, rejectApplication } from './applications'
import { auditLog, endSessions, invite, keyLink, listInvites, listUsers, revokeInvite, updateUser } from './admin'
import {
  actor, addKeyOptions, addKeyVerify, bearer, createToken, getSession, inviteInfo, inviteOptions, inviteVerify, listKeys, listTokens, loginOptions, loginVerify, logout,
  removeKey, removeToken, requireAdmin, requireRecent, requireSession,
} from './auth'
import { backupReport, backupStatus, releaseChanges, releasesAfter, requireBackup, snapshot } from './backup'
import { CONFIG, LIMITS, MINUTE } from './config'
import { contentIndex, readTopic } from './content'
import { audit, one, run } from './db'
import {
  activeDrafts, applySuggestion, createDraft, deleteDraft, deleteReview, editReview, getDraft, getThread, listDrafts, rebaseDraft, rejectDraft, resolveReview, restoreRelease, restoreVersionNow, reviewCounts, reviewDraft, reviewQueue,
  rollbackDraft, saveDraft, submitDraft, withdrawDraft, publishUnverified, verifyTopic } from './drafts'
import { publishWords } from './words'
import { assertSameOrigin, clientIp, cookies, HttpError, ipKey, json, limit, readJson, SECURITY_HEADERS, SESSION_COOKIE, type Req, type Res } from './http'
import { getProfile, listProfiles, ownProfile, profileByName, saveProfile } from './profiles'
import { createReport, listReports, reportCounts, updateReport } from './reports'
import { createRequest, deleteRequest, listRequests, updateRequest, voteRequest } from './requests'
import { current, file, gzipped, history, load, previousVersion, published, releases, verifyChain, version } from './store'

// The content service of Šprtám (docs/OBSAH.md) and its moderation app (docs/MODERACE.md): the learning
// content with its whole history in one database, a public read-only API the app reads it from, and the
// editor where invited moderators change it – every change reviewed and approved by other moderators.

type Handler = (req: Req, res: Res, p: string[], ip: string) => Promise<unknown> | unknown
interface Route { method: string; path: RegExp; run: Handler; open?: boolean }

/** A handler that wrote the response itself returns this. */
const SENT = Symbol('sent')

const routes: Route[] = []
const on = (method: string, path: string, run: Handler, open = false) =>
  routes.push({ method, path: new RegExp(`^${path.replace(/:[a-z]+/g, '([^/]+)')}$`), run, open })
const query = (req: Req, k: string) => new URL(req.url!, 'http://x').searchParams.get(k)

// ——— Public content API (read only; the app at sprtam.cz syncs from it) ———

const accepts = (req: Req, enc: string) => String(req.headers['accept-encoding'] ?? '').includes(enc)
// The content is CC BY-SA 4.0 (docs/OBSAH.md, Licence); every public content response says so.
const LICENSE = 'CC-BY-SA-4.0'
const LICENSE_LINK = { Link: '<https://creativecommons.org/licenses/by-sa/4.0/>; rel="license"' }

on('GET', '/api/public/v1/manifest', (req, res) => {
  const live = current()
  if (!live) throw new HttpError(503, 'Učivo zatím není zveřejněné.')
  const etag = `"${live.manifest.hash}"`
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-cache', ...LICENSE_LINK }).end(); return SENT }
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ETag: etag, 'Cache-Control': 'no-cache', ...LICENSE_LINK })
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(live.manifest))
  return SENT
}, true)

on('GET', '/api/public/v1/files/:hash', (req, res, p) => {
  const text = HASH.test(p[0]) ? file(p[0]) : undefined
  if (!text) throw new HttpError(404, 'Soubor nenalezen.')
  const headers: Record<string, string | number> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable', ETag: `"${p[0]}"`, Vary: 'Accept-Encoding', ...LICENSE_LINK }
  if (accepts(req, 'gzip')) { const b = gzipped(p[0], text); res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': b.length }).end(b) }
  else res.writeHead(200, headers).end(text)
  return SENT
}, true)

let exported: { release: number; body: Buffer } | undefined
on('GET', '/api/public/v1/export', (req, res, _p, ip) => {
  limit(`export:${ipKey(ip)}`, 30, 60 * MINUTE)
  const live = current()
  if (!live) throw new HttpError(503, 'Učivo zatím není zveřejněné.')
  if (exported?.release !== live.release) {
    const text = JSON.stringify({ release: live.release, publishedAt: live.publishedAt, license: LICENSE, docs: Object.fromEntries(published()) })
    exported = { release: live.release, body: gzipped(`export-${live.release}`, text) }
  }
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Encoding': 'gzip', 'Content-Length': exported.body.length, 'Cache-Control': 'no-cache', Vary: 'Accept-Encoding', ...LICENSE_LINK })
  res.end(exported.body)
  return SENT
}, true)

// Error reports from pupils, forwarded by the server of sprtam.cz with REPORT_TOKEN (never straight from the app).
on('POST', '/api/public/v1/reports', async (req) => createReport(req, await readJson(req, LIMITS.openBody)), true)

// ——— Backups and the git mirror (the backup puller's token only) ———

on('GET', '/api/internal/backup', (req, res, _p, ip) => { requireBackup(req); limit(`backup:${ipKey(ip)}`, 12, 60 * MINUTE); snapshot(req, res, ip); return SENT }, true)
on('GET', '/api/internal/backup/status', (req) => { requireBackup(req); return { ...backupStatus(), release: current()?.release ?? null } }, true)
on('POST', '/api/internal/backup/report', async (req) => { requireBackup(req); return backupReport(await readJson(req, LIMITS.openBody)) }, true)
on('GET', '/api/internal/releases', (req) => { requireBackup(req); return { releases: releasesAfter(query(req, 'after')) } }, true)
on('GET', '/api/internal/releases/:id', (req, _res, p) => { requireBackup(req); return releaseChanges(p[0]) }, true)

// ——— Sign-in ———

on('GET', '/api/session', (req) => {
  const s = getSession(req)
  return { user: s?.via === 'cookie' ? s.user : null, recentUntil: s ? s.authAt + 15 * MINUTE : null, approvals: CONFIG.approvals }
}, true)
const open = (req: Req) => readJson(req, LIMITS.openBody)
on('POST', '/api/auth/login/options', (_req, _res, _p, ip) => { limit(`auth:${ipKey(ip)}`, 40, 10 * MINUTE); return loginOptions() }, true)
on('POST', '/api/auth/login/verify', async (req, res, _p, ip) => { limit(`auth:${ipKey(ip)}`, 40, 10 * MINUTE); return loginVerify(req, res, ip, await open(req)) }, true)
on('POST', '/api/auth/logout', (req, res) => { logout(req, res); return { ok: true } }, true)
on('POST', '/api/invite/info', async (req, _res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteInfo(await open(req)) }, true)
on('POST', '/api/invite/options', async (req, _res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteOptions(await open(req)) }, true)
on('POST', '/api/invite/verify', async (req, res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteVerify(req, res, ip, await open(req)) }, true)

// Applications to become a moderator, from the public form /zapojit-se (docs/MODERACE.md). The form is on this
// origin, so the same-origin check applies like to any other change.
on('POST', '/api/applications', async (req, _res, _p, ip) => createApplication(await open(req), ip), true)

// ——— Own account ———

on('GET', '/api/me/keys', (req) => listKeys(requireSession(req).user.id))
on('POST', '/api/me/keys/options', (req) => addKeyOptions(requireSession(req)))
on('POST', '/api/me/keys/verify', async (req, _res, _p, ip) => addKeyVerify(req, requireSession(req), ip, await readJson(req)))
on('DELETE', '/api/me/keys/:id', (req, _res, p, ip) => { removeKey(requireSession(req), p[0], ip); return { ok: true } })
on('POST', '/api/me/sessions/end-others', (req, _res, _p, ip) => {
  const s = requireSession(req)
  // Everywhere else means API tokens too: a token made from a stolen session must not outlive it.
  run('DELETE FROM sessions WHERE user_id = ? AND hash != ?', s.user.id, s.hash)
  run('DELETE FROM api_tokens WHERE user_id = ?', s.user.id)
  audit('sessions.ended', s.user.id, { own: true, tokens: true }, ip)
  return { ok: true }
})
// How the moderator presents themselves on /moderatori (moderator/server/profiles.ts). Browser only.
on('GET', '/api/me/profile', (req) => ownProfile(requireSession(req)))
on('PUT', '/api/me/profile', async (req, _res, _p, ip) => saveProfile(requireSession(req), await readJson(req), ip))
on('GET', '/api/me/tokens', (req) => listTokens(requireSession(req).user.id))
on('POST', '/api/me/tokens', async (req, _res, _p, ip) => createToken(requireSession(req), await readJson(req), ip))
on('DELETE', '/api/me/tokens/:id', (req, _res, p, ip) => { removeToken(requireSession(req), p[0], ip); return { ok: true } })

// ——— Moderators' profiles: public ones for everyone, all of them for signed-in moderators ———

const viewer = (req: Req) => { const s = getSession(req); return s?.via === 'cookie' ? s : null }
on('GET', '/api/moderators', (req) => listProfiles(viewer(req)), true)
on('GET', '/api/moderators/by-name', (req, _res, _p, ip) => { limit(`by-name:${ipKey(ip)}`, 120, 10 * MINUTE); return profileByName(viewer(req), query(req, 'name')) }, true)
on('GET', '/api/moderators/:id', (req, _res, p) => getProfile(viewer(req), p[0]), true)

// ——— Content, drafts and review ———
// Published content is public (the same the app shows): teachers browse it without an account. Who is working
// on what, history and drafts are for moderators. Routes marked `tokens` also accept API tokens (scripts and
// agents proposing content); reviewing, publishing and administration never do.

const tokens = true
on('GET', '/api/content/index', (req) => ({ ...contentIndex(), active: getSession(req) ? activeDrafts() : [] }), true)
on('GET', '/api/content/topic/:g/:s/:id', (_req, _res, p) => readTopic(p[0], p[1], p[2]), true)
on('GET', '/api/history/:g/:s/:id', (req, _res, p) => { requireSession(req, tokens); readTopic(p[0], p[1], p[2]); return history(`topics/${p[0]}/${p[1]}/${p[2]}`) })
on('GET', '/api/versions/:id', (req, _res, p) => { requireSession(req, tokens); return { ...version(Number(p[0])), previous: previousVersion(Number(p[0])) } })
on('POST', '/api/versions/:id/rollback', (req, _res, p, ip) => rollbackDraft(requireSession(req), p[0], ip))

on('GET', '/api/drafts', (req) => listDrafts(requireSession(req, tokens), query(req, 'all') === '1'))
on('POST', '/api/drafts', async (req) => {
  const s = requireSession(req, tokens)
  // Admins load whole subjects at once (scripts/content-propose.ts, content-update.ts); like the open-draft and submit limits, this one is for moderators.
  if (s.user.role !== 'admin') limit(`create:${actor(s)}`, 60, 10 * MINUTE)
  return createDraft(s, await readJson(req))
})
on('GET', '/api/drafts/:id', (req, _res, p) => getDraft(requireSession(req, tokens), p[0]))
on('PUT', '/api/drafts/:id', async (req, _res, p) => {
  const s = requireSession(req, tokens)
  if (s.user.role !== 'admin') limit(`save:${actor(s)}`, 600, 10 * MINUTE)
  return saveDraft(s, p[0], await readJson(req))
})
on('DELETE', '/api/drafts/:id', (req, _res, p, ip) => { deleteDraft(requireSession(req, tokens), p[0], ip); return { ok: true } })
// Content added by AI: published at once as unverified (admins only), checked later by a person ("Ověřit").
on('POST', '/api/drafts/publish-unverified', async (req, _res, _p, ip) => publishUnverified(requireSession(req, tokens), await readJson(req), ip))
// Vocabulary of other languages: published at once by an admin (moderator/server/words.ts).
on('POST', '/api/content/words', async (req, _res, _p, ip) => publishWords(requireSession(req, tokens), await readJson(req, 4 * 1024 * 1024), ip))
on('POST', '/api/content/verify', async (req, _res, _p, ip) => verifyTopic(requireSession(req), await readJson(req), ip))
on('POST', '/api/drafts/:id/submit', async (req, _res, p, ip) => submitDraft(requireSession(req, tokens), p[0], await readJson(req), ip))
on('POST', '/api/drafts/:id/withdraw', (req, _res, p, ip) => withdrawDraft(requireSession(req, tokens), p[0], ip))
on('POST', '/api/drafts/:id/rebase', (req, _res, p, ip) => rebaseDraft(requireSession(req, tokens), p[0], ip))
on('POST', '/api/drafts/:id/review', async (req, _res, p, ip) => reviewDraft(requireSession(req), p[0], await readJson(req), ip))
on('POST', '/api/drafts/:id/reviews/:rid/resolve', (req, _res, p, ip) => resolveReview(requireSession(req), p[0], p[1], ip))
on('PATCH', '/api/drafts/:id/reviews/:rid', async (req, _res, p, ip) => editReview(requireSession(req), p[0], p[1], await readJson(req), ip))
on('DELETE', '/api/drafts/:id/reviews/:rid', (req, _res, p, ip) => deleteReview(requireSession(req), p[0], p[1], ip))
on('POST', '/api/drafts/:id/reviews/:rid/apply', async (req, _res, p, ip) => applySuggestion(requireSession(req), p[0], p[1], await readJson(req), ip))
on('GET', '/api/drafts/:id/thread', (req, _res, p) => getThread(requireSession(req), p[0]))
on('POST', '/api/drafts/:id/reject', async (req, _res, p, ip) => rejectDraft(requireSession(req), p[0], await readJson(req), ip))
const reviewFilter = (req: Req) => ({ mine: query(req, 'mine') === '1', grade: query(req, 'grade') || null, subject: query(req, 'subject') || null })
on('GET', '/api/reviews', (req) => reviewQueue(requireSession(req), query(req, 'tab') ?? 'open', reviewFilter(req)))
on('GET', '/api/reviews/counts', (req) => reviewCounts(requireSession(req), reviewFilter(req)))

// ——— Requests for new widgets ———

on('GET', '/api/widget-requests', (req) => listRequests(requireSession(req)))
on('POST', '/api/widget-requests', async (req, _res, _p, ip) => createRequest(requireSession(req), await readJson(req), ip))
on('POST', '/api/widget-requests/:id/vote', (req, _res, p) => voteRequest(requireSession(req), p[0]))
on('PATCH', '/api/widget-requests/:id', async (req, _res, p, ip) => updateRequest(requireSession(req), p[0], await readJson(req), ip))
on('DELETE', '/api/widget-requests/:id', (req, _res, p, ip) => { deleteRequest(requireSession(req), p[0], ip); return { ok: true } })

// ——— Error reports from pupils ———

const reportFilter = (req: Req) => ({ grade: query(req, 'grade') || null, subject: query(req, 'subject') || null, topic: query(req, 'topic') || null })
on('GET', '/api/reports', (req) => listReports(requireSession(req), { status: query(req, 'status') ?? 'open', ...reportFilter(req) }))
on('GET', '/api/reports/counts', (req) => reportCounts(requireSession(req), reportFilter(req)))
on('PATCH', '/api/reports/:id', async (req, _res, p, ip) => updateReport(requireSession(req), p[0], await readJson(req), ip))

// ——— Admin ———

on('GET', '/api/admin/users', (req) => { requireAdmin(req); return { users: listUsers(), invites: listInvites() } })
on('POST', '/api/admin/invites', async (req, _res, _p, ip) => invite(requireAdmin(req, true), await readJson(req), ip))
on('DELETE', '/api/admin/invites/:id', (req, _res, p, ip) => { revokeInvite(requireAdmin(req, true), p[0], ip); return { ok: true } })
on('PATCH', '/api/admin/users/:id', async (req, _res, p, ip) => { updateUser(requireAdmin(req, true), p[0], await readJson(req), ip); return { ok: true } })
on('POST', '/api/admin/users/:id/key-link', async (req, _res, p, ip) => keyLink(requireAdmin(req, true), p[0], await readJson(req), ip))
on('POST', '/api/admin/users/:id/end-sessions', (req, _res, p, ip) => { endSessions(requireAdmin(req, true), p[0], ip); return { ok: true } })
on('GET', '/api/admin/applications', (req) => { requireAdmin(req); return listApplications(query(req, 'status')) })
on('GET', '/api/admin/applications/counts', (req) => { requireAdmin(req); return applicationCounts() })
on('POST', '/api/admin/applications/:id/approve', (req, _res, p, ip) => approveApplication(requireAdmin(req, true), p[0], ip))
on('POST', '/api/admin/applications/:id/reject', async (req, _res, p, ip) => rejectApplication(requireAdmin(req, true), p[0], await readJson(req), ip))
on('GET', '/api/admin/audit', (req) => { requireAdmin(req); return auditLog(query(req, 'before'), query(req, 'user'), query(req, 'action'), query(req, 'q')) })
on('POST', '/api/admin/check', (req) => { requireRecent(requireAdmin(req)); return { ok: true } })
on('GET', '/api/admin/releases', (req) => { requireAdmin(req); const b = query(req, 'before'); return releases(b ? Number(b) : undefined) })
on('POST', '/api/admin/releases/:id/restore', async (req, _res, p, ip) => restoreRelease(requireAdmin(req, true), p[0], await readJson(req), ip))
on('POST', '/api/admin/versions/:id/restore', async (req, _res, p, ip) => restoreVersionNow(requireAdmin(req, true), p[0], await readJson(req), ip))
on('GET', '/api/admin/system', (req) => {
  requireAdmin(req)
  const live = current()
  const chain = verifyChain()
  return {
    release: live?.release ?? null, publishedAt: live?.publishedAt ?? null, docs: published().size, versions: chain.count, chainOk: chain.ok,
    approvals: CONFIG.approvals, backup: backupStatus(), commit: CONFIG.commit,
    reviews: one<{ n: number }>("SELECT COUNT(*) AS n FROM drafts WHERE status = 'review'")!.n,
  }
})

// ——— Static files (the editor and the preview frame) ———

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
}

const decode = (s: string) => { try { return decodeURIComponent(s) } catch { throw new HttpError(400, 'Neplatná adresa.') } }

async function serveStatic(req: Req, res: Res, pathname: string) {
  const rel = normalize(decode(pathname)).replace(/^(\.\.(\/|\\|$))+/, '')
  let file = join(CONFIG.staticDir, rel)
  if (!file.startsWith(CONFIG.staticDir)) return res.writeHead(400).end()
  const isFile = await stat(file).then((s) => s.isFile(), () => false)
  // Screens of the editor are client routes: anything without a file extension gets the app.
  if (!isFile) {
    if (extname(rel)) return res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nenalezeno')
    file = join(CONFIG.staticDir, 'index.html')
  }
  const body = await readFile(file).catch(() => null)
  if (!body) return res.writeHead(404).end()
  const hashed = rel.startsWith('/assets/')
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache' })
  res.end(req.method === 'HEAD' ? undefined : body)
}

load()

createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
  const url = new URL(req.url ?? '/', 'http://x')
  const ip = clientIp(req)
  try {
    if (url.pathname === '/healthz') return res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok')
    if (!url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end()
      try { return await serveStatic(req, res, url.pathname) } catch (e) { if (e instanceof HttpError) return res.writeHead(e.status).end(); throw e }
    }
    // Requests with a bearer token (scripts, the backup puller) carry no cookies, so no page can send them for
    // somebody else: browsers send an Authorization header cross-site only after a CORS preflight we never allow.
    // A request that carries a session cookie is always checked, bearer header or not.
    if (req.method !== 'GET' && req.method !== 'HEAD' && (bearer(req) === null || cookies(req)[SESSION_COOKIE])) assertSameOrigin(req)
    limit(`api:${ipKey(ip)}`, 1200, 5 * MINUTE)
    const matching = routes.filter((r) => r.path.test(url.pathname))
    if (!matching.length) throw new HttpError(404, 'Nenalezeno.')
    const method = req.method === 'HEAD' ? 'GET' : req.method
    const route = matching.find((r) => r.method === method)
    if (!route) throw new HttpError(405, 'Nepodporovaná metoda.')
    const params = url.pathname.match(route.path)!.slice(1).map(decode)
    const out = await route.run(req, res, params, ip)
    if (out !== SENT) json(res, 200, out ?? { ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return json(res, e.status, { error: e.message, code: e.code, ...e.extra }, e.code === 'rate' ? { 'Retry-After': String(e.extra?.retryAfter ?? 60) } : {})
    }
    console.error(req.method, url.pathname, e)
    if (!res.headersSent) json(res, 500, { error: 'Na serveru se něco pokazilo. Zkus to znovu.' })
    else res.end()
  }
}).listen(CONFIG.port, () => console.log(`moderace on :${CONFIG.port} (${CONFIG.origin}, ${CONFIG.approvals} approval(s) to publish, backups ${CONFIG.backupToken ? 'on' : 'off'})`))
