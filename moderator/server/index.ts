import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { auditLog, endSessions, invite, keyLink, listInvites, listUsers, revokeInvite, updateUser } from './admin'
import {
  addKeyOptions, addKeyVerify, getSession, inviteInfo, inviteOptions, inviteVerify, listKeys, loginOptions, loginVerify, logout, removeKey,
  requireAdmin, requireRecent, requireSession,
} from './auth'
import { CONFIG, LIMITS, MINUTE } from './config'
import { contentIndex, readTopic } from './content'
import { audit, run } from './db'
import { activeDrafts, createDraft, deleteDraft, getDraft, listDrafts, refreshStatuses, saveDraft, submitDraft } from './drafts'
import { githubReady } from './github'
import { assertSameOrigin, clientIp, HttpError, ipKey, json, limit, readJson, SECURITY_HEADERS, type Req, type Res } from './http'

// Moderation of Šprtám content: passkey sign-in for invited moderators, a topic editor with a live
// preview, and pull requests to GitHub. docs/MODERACE.md describes the whole thing.

type Handler = (req: Req, res: Res, p: string[], ip: string) => Promise<unknown> | unknown
interface Route { method: string; path: RegExp; run: Handler; open?: boolean }

const routes: Route[] = []
const on = (method: string, path: string, run: Handler, open = false) =>
  routes.push({ method, path: new RegExp(`^${path.replace(/:[a-z]+/g, '([^/]+)')}$`), run, open })

// ——— Sign-in ———

on('GET', '/api/session', (req) => {
  const s = getSession(req)
  return { user: s?.user ?? null, recentUntil: s ? s.authAt + 15 * MINUTE : null, github: githubReady() }
}, true)
const open = (req: Req) => readJson(req, LIMITS.openBody)
on('POST', '/api/auth/login/options', (_req, _res, _p, ip) => { limit(`auth:${ipKey(ip)}`, 40, 10 * MINUTE); return loginOptions() }, true)
on('POST', '/api/auth/login/verify', async (req, res, _p, ip) => { limit(`auth:${ipKey(ip)}`, 40, 10 * MINUTE); return loginVerify(req, res, ip, await open(req)) }, true)
on('POST', '/api/auth/logout', (req, res) => { logout(req, res); return { ok: true } }, true)
on('POST', '/api/invite/info', async (req, _res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteInfo(await open(req)) }, true)
on('POST', '/api/invite/options', async (req, _res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteOptions(await open(req)) }, true)
on('POST', '/api/invite/verify', async (req, res, _p, ip) => { limit(`invite:${ipKey(ip)}`, 30, 10 * MINUTE); return inviteVerify(req, res, ip, await open(req)) }, true)

// ——— Own account ———

on('GET', '/api/me/keys', (req) => listKeys(requireSession(req).user.id))
on('POST', '/api/me/keys/options', (req) => addKeyOptions(requireSession(req)))
on('POST', '/api/me/keys/verify', async (req, _res, _p, ip) => addKeyVerify(req, requireSession(req), ip, await readJson(req)))
on('DELETE', '/api/me/keys/:id', (req, _res, p, ip) => { removeKey(requireSession(req), p[0], ip); return { ok: true } })
on('POST', '/api/me/sessions/end-others', (req, _res, _p, ip) => {
  const s = requireSession(req)
  run('DELETE FROM sessions WHERE user_id = ? AND hash != ?', s.user.id, s.hash)
  audit('sessions.ended', s.user.id, { own: true }, ip)
  return { ok: true }
})

// ——— Content and drafts ———

on('GET', '/api/content/index', (req) => { requireSession(req); return { ...contentIndex(), active: activeDrafts() } })
on('GET', '/api/content/topic/:g/:s/:id', (req, _res, p) => { requireSession(req); return readTopic(p[0], p[1], p[2]) })
on('GET', '/api/drafts', async (req) => {
  const s = requireSession(req)
  const everyone = new URL(req.url!, 'http://x').searchParams.get('all') === '1'
  return refreshStatuses(listDrafts(s, everyone))
})
on('POST', '/api/drafts', async (req) => {
  const s = requireSession(req)
  limit(`create:${s.user.id}`, 60, 10 * MINUTE)
  return createDraft(s, await readJson(req))
})
on('GET', '/api/drafts/:id', (req, _res, p) => getDraft(requireSession(req), p[0]))
on('PUT', '/api/drafts/:id', async (req, _res, p) => {
  const s = requireSession(req)
  limit(`save:${s.user.id}`, 600, 10 * MINUTE)
  return saveDraft(s, p[0], await readJson(req))
})
on('DELETE', '/api/drafts/:id', (req, _res, p, ip) => { deleteDraft(requireSession(req), p[0], ip); return { ok: true } })
on('POST', '/api/drafts/:id/submit', async (req, _res, p, ip) => submitDraft(requireSession(req), p[0], await readJson(req), ip))

// ——— Admin ———

on('GET', '/api/admin/users', (req) => { requireAdmin(req); return { users: listUsers(), invites: listInvites() } })
on('POST', '/api/admin/invites', async (req, _res, _p, ip) => invite(requireAdmin(req, true), await readJson(req), ip))
on('DELETE', '/api/admin/invites/:id', (req, _res, p, ip) => { revokeInvite(requireAdmin(req, true), p[0], ip); return { ok: true } })
on('PATCH', '/api/admin/users/:id', async (req, _res, p, ip) => { updateUser(requireAdmin(req, true), p[0], await readJson(req), ip); return { ok: true } })
on('POST', '/api/admin/users/:id/key-link', async (req, _res, p, ip) => keyLink(requireAdmin(req, true), p[0], await readJson(req), ip))
on('POST', '/api/admin/users/:id/end-sessions', (req, _res, p, ip) => { endSessions(requireAdmin(req, true), p[0], ip); return { ok: true } })
on('GET', '/api/admin/audit', (req) => { requireAdmin(req); return auditLog(new URL(req.url!, 'http://x').searchParams.get('before')) })
on('POST', '/api/admin/check', (req) => { requireRecent(requireAdmin(req)); return { ok: true } })

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
    if (req.method !== 'GET') assertSameOrigin(req)
    limit(`api:${ipKey(ip)}`, 1200, 5 * MINUTE)
    const matching = routes.filter((r) => r.path.test(url.pathname))
    if (!matching.length) throw new HttpError(404, 'Nenalezeno.')
    const route = matching.find((r) => r.method === req.method)
    if (!route) throw new HttpError(405, 'Nepodporovaná metoda.')
    const params = url.pathname.match(route.path)!.slice(1).map(decode)
    const out = await route.run(req, res, params, ip)
    json(res, 200, out ?? { ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return json(res, e.status, { error: e.message, code: e.code, ...e.extra }, e.code === 'rate' ? { 'Retry-After': String(e.extra?.retryAfter ?? 60) } : {})
    }
    console.error(req.method, url.pathname, e)
    if (!res.headersSent) json(res, 500, { error: 'Na serveru se něco pokazilo. Zkus to znovu.' })
    else res.end()
  }
}).listen(CONFIG.port, () => console.log(`moderace on :${CONFIG.port} (${CONFIG.origin}, GitHub ${githubReady() ? CONFIG.githubRepo : 'not configured'})`))
