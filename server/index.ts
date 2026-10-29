// The server of sprtam.cz: the built PWA, the pages and the content API of the current content release
// (server/content.ts, docs/OBSAH.md), and pupils' error reports passed on to the moderators. It stores nothing about
// visitors and logs no requests: no IPs, no IDs, no cookies (reports are counted per device only in memory, see below).
// Built into one file without dependencies: vite build --ssr (package.json).
import { createHash } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile, rm, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { HASH } from '../src/content/manifest'
import { EXAM } from '../src/exam'
import { isMode, mapById, MAPS_PATH } from '../src/maps'
import { embed, encoded, file as contentFile, pageHtml, release, startContent } from './content'
import { render, robots, sitemap } from './pages'
import { parseReport } from './report'
import { shell } from './shell'

const PORT = Number(process.env.PORT ?? 8080)
const DIST = process.env.DIST ?? join(import.meta.dirname, '..', 'dist')
const DATA = process.env.DATA_DIR ?? join(import.meta.dirname, '..', 'data')
/** Shared with the content service: pupils' error reports are forwarded with it (docs/OBSAH.md). Empty = reports off. */
const REPORT_TOKEN = process.env.REPORT_TOKEN ?? ''
/** The content service (moderation) – its public read API is the source of all content. */
const CONTENT_API = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
// The app moved to sprtam.cz. These hosts still reach this server and send everyone over (see below).
const CANONICAL = 'https://sprtam.cz'
const LEGACY = new Set((process.env.LEGACY_HOSTS ?? 'sprtam.ondrejzraly.cz,www.sprtam.cz').split(','))

const isFile = (f: string) => stat(f).then((s) => s.isFile(), () => false)
const page = (...parts: string[]) => !!release()?.pages.has(`/${parts.join('/')}`)
const MODES = ['kviz', 'opakovani', 'pisemka', 'zkouseni']

/** Routes the app renders that have no page of their own (server/pages.ts). */
function isAppRoute(path: string) {
  const p = path.split('/').filter(Boolean)
  if (p.length === 1) return ['hledat', 'mix', 'sdilet', 'widgety', 'nastaveni', 'prehled', 'chyby', 'dnes'].includes(p[0])
  if (p.join('/') === 'chyby/procvicit') return true
  if (p[0] === 'widgety' && p.length === 2) return /^[a-z]+(-[a-z]+)*$/.test(p[1])
  if (p[0] === 'g' && p.length === 4 && p[3] === '~test') return page(...p.slice(0, 3))
  if (p[0] === 'g' && p.length === 5 && MODES.includes(p[4])) return page(...p.slice(0, 4))
  // A drill: /slovicka/A1/3, /slovicka/nemcina/A1/vse
  if (p[0] === 'slovicka' && (p.length === 3 || p.length === 4)) return page(...p.slice(0, -1))
  // A game of Slepá mapa: /slepa-mapa/evropa/najdi
  if (p.length === 3 && `/${p[0]}` === MAPS_PATH) return !!mapById(p[1]) && isMode(p[2])
  // Practice test of one part of the entrance exam: /prijimacky/matematika/test
  if (p.length === 3 && p[0] === EXAM.id && p[2] === 'test') return page(...p.slice(0, 2))
  // Practice of one epoch of a teaching approach (/waldorf/z1/<epoch>/test) or one area of the entrance exam (/prijimacky/matematika/zlomky/test)
  if (p.length === 4 && p[0] !== 'g' && p[3] === 'test') return page(...p.slice(0, 3))
  return false
}

// A page from an older deploy (kept open, or served by an old service worker) asks for
// hashed chunks that no longer exist. Instead of a 404 that leaves the app dead, answer with
// a script that drops the old service worker and reloads once into the current version.
// Only for the page's own script loads (Sec-Fetch-Dest: script), never for a service worker filling its cache.
const STALE = `${await readFile(join(DIST, 'boot-check.js'), 'utf8').catch(() => '')}\n;window.sprtamHeal && sprtamHeal()`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const movePage = (to: string) => `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Šprtám se přestěhoval</title><link rel="canonical" href="${esc(to)}"><script src="/move.js"></script></head><body style="font-family:system-ui,sans-serif;padding:2rem"><p>Šprtám se přestěhoval na <a href="${esc(to)}">sprtam.cz</a>…</p></body></html>`

const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg' }
const SECURITY = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
}

const TEMPLATE = await readFile(join(DIST, 'index.html'), 'utf8')
if (!TEMPLATE.includes('<div id="app"></div>')) throw new Error('dist/index.html: #app placeholder not found')
const SHELL = shell(TEMPLATE)

// Daily totals of the usage ping that used to live here. The ping is gone; so is what it collected.
await rm(join(DATA, 'stats.json'), { force: true }).catch(() => {})

const html = (res: ServerResponse, status: number, body: string, extra: Record<string, string> = {}) =>
  res.writeHead(status, { ...SECURITY, 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache', ...extra }).end(body)

/** /api/content/*: the manifest of the current release and its files (docs/OBSAH.md). */
async function contentApi(req: IncomingMessage, res: ServerResponse, path: string) {
  const r = release()
  if (path === '/api/content/manifest') {
    if (!r) return res.writeHead(503, { ...SECURITY, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '30' }).end('{"error":"content not loaded yet"}')
    const etag = `"${r.manifest.hash}"`
    const headers = { ...SECURITY, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ETag: etag }
    if (req.headers['if-none-match'] === etag) return res.writeHead(304, headers).end()
    return res.writeHead(200, headers).end(r.json)
  }
  const m = /^\/api\/content\/f\/([0-9a-f]+)\.json$/.exec(path)
  const e = m && HASH.test(m[1]) ? await contentFile(m[1]) : undefined
  if (!e) return res.writeHead(404, { ...SECURITY, 'Cache-Control': 'no-store' }).end()
  const [body, encoding] = await encoded(e, String(req.headers['accept-encoding'] ?? ''))
  res.writeHead(200, {
    ...SECURITY, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=31536000, immutable', Vary: 'Accept-Encoding', 'Content-Length': String(body.length),
    ...(encoding ? { 'Content-Encoding': encoding } : {}),
  })
  res.end(req.method === 'HEAD' ? undefined : body)
}

// ——— Error reports from pupils (button „Nahlásit chybu“) ———
// Forwarded to the content service, where moderators see them. Only what was reported travels on: no address,
// no browser, nothing about the device. The address is used here only to count reports in memory (as a hash,
// forgotten after a day), so that one device cannot flood the moderators.

const windows = new Map<string, { n: number; until: number }>()
setInterval(() => { const now = Date.now(); for (const [k, w] of windows) if (w.until < now) windows.delete(k) }, 60_000).unref()
const over = (key: string, max: number, ms: number) => {
  const now = Date.now()
  let w = windows.get(key)
  if (!w || w.until < now) windows.set(key, (w = { n: 0, until: now + ms }))
  return ++w.n > max
}
// Behind Cloudflare and Traefik. A forged CF-Connecting-IP (someone reaching the origin directly) only gets
// its own counter; the daily cap over everyone still holds.
const clientKey = (req: IncomingMessage) => {
  const cf = req.headers['cf-connecting-ip']
  const xff = String(req.headers['x-forwarded-for'] ?? '').split(',').map((x) => x.trim()).filter(Boolean)
  const ip = (typeof cf === 'string' && cf) || xff.at(-1) || req.socket.remoteAddress || '?'
  return createHash('sha256').update(ip).digest('base64url').slice(0, 16)
}

const jsonError = (res: ServerResponse, status: number, error: string) =>
  res.writeHead(status, { ...SECURITY, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify({ error }))
const UNAVAILABLE = 'Hlášení teď nejde poslat. Zkus to později.'

async function report(req: IncomingMessage, res: ServerResponse) {
  if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) return jsonError(res, 415, 'Očekávám JSON.')
  let body = ''
  for await (const c of req) { body += c; if (body.length > 4096) return jsonError(res, 413, 'Hlášení je moc dlouhé.') }
  let data: unknown
  try { data = JSON.parse(body) } catch { return jsonError(res, 400, 'Neplatné hlášení.') }
  const r = parseReport(data)
  if (typeof r === 'string') return jsonError(res, 400, r)
  if (!release()?.pages.has(`/g/${r.topic}`)) return jsonError(res, 400, 'Neznámé téma.')
  if (!REPORT_TOKEN) return jsonError(res, 503, UNAVAILABLE)
  const who = clientKey(req)
  if (over(`m:${who}`, 5, 10 * 60_000) || over(`d:${who}`, 20, 86_400_000)) return jsonError(res, 429, 'Poslal jsi hodně hlášení za sebou. Zkus to později.')
  if (over('all', 500, 86_400_000)) return jsonError(res, 503, UNAVAILABLE)
  try {
    const out = await fetch(`${CONTENT_API}/api/public/v1/reports`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${REPORT_TOKEN}` }, body: JSON.stringify(r), signal: AbortSignal.timeout(10_000),
    })
    if (out.ok) return res.writeHead(204, { ...SECURITY, 'Cache-Control': 'no-store' }).end()
    console.error('report: content service answered', out.status)
    return jsonError(res, out.status === 429 ? 429 : 503, out.status === 429 ? 'Hlášení je teď moc. Zkus to později.' : UNAVAILABLE)
  } catch (e) {
    console.error('report: content service unreachable', (e as Error).message)
    return jsonError(res, 503, UNAVAILABLE)
  }
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  let url: URL
  try { url = new URL(req.url ?? '/', 'http://x') } catch { return res.writeHead(400).end() }
  if (url.pathname === '/healthz') return res.writeHead(200).end('ok')
  if (url.pathname === '/api/report') {
    if (req.method !== 'POST') return res.writeHead(405, SECURITY).end()
    return report(req, res)
  }
  if (url.pathname.startsWith('/api/content/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end()
    return contentApi(req, res, url.pathname)
  }

  const host = (req.headers.host ?? '').replace(/:\d+$/, '').toLowerCase()
  if (LEGACY.has(host)) {
    // A person's browser loading a page gets public/move.js, which carries their progress (localStorage, bound
    // to this domain) to the new one. Everyone else (search engines, links to files) gets a permanent redirect.
    // Browsers tell themselves apart by sending Sec-Fetch-Dest; an old service worker re-fetching the page sends
    // it too, though not as "document".
    // Scripts and the service worker are still served here, so old open pages and installed apps keep working
    // until they reload into move.js. www.sprtam.cz never served the app, so it has nothing to carry.
    const page = !extname(url.pathname) || url.pathname.endsWith('.html')
    const to = CANONICAL + url.pathname + url.search
    if (page && host !== 'www.sprtam.cz' && req.headers['sec-fetch-dest']) {
      return res.writeHead(200, { ...SECURITY, 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }).end(movePage(to))
    }
    if (page || /\.(xml|txt|webmanifest)$/.test(url.pathname)) return res.writeHead(301, { Location: to }).end()
  }

  // Pages: /g/z5/matematika → rendered from the current content release (server/pages.ts).
  // Always a path of this site: `//evil.example` would be another host.
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) return res.writeHead(301, { Location: '/' + url.pathname.replace(/^\/+/, '').replace(/\/+$/, '') + url.search }).end()
  let path: string
  try { path = normalize(decodeURIComponent(url.pathname)) } catch { return res.writeHead(400).end() }
  const r = release()
  if (!extname(path) || path === '/index.html') {
    const pagePath = path === '/index.html' ? '/' : path
    if (!r) {
      // No content yet (first start while the content service is unreachable): the shell, which says so.
      return html(res, 503, SHELL, { 'Retry-After': '30' })
    }
    const page = pageHtml(r, pagePath, (p) => render(TEMPLATE, p))
    if (page) return html(res, 200, page)
  }
  if (r && path === '/sitemap.xml') return res.writeHead(200, { ...SECURITY, 'Content-Type': TYPES['.xml'], 'Cache-Control': 'no-cache' }).end(sitemap([...r.pages.values()]))
  if (path === '/robots.txt') return res.writeHead(200, { ...SECURITY, 'Content-Type': TYPES['.txt'], 'Cache-Control': 'no-cache' }).end(robots())
  let file = join(DIST, path)
  let status = 200
  if (!file.startsWith(DIST)) return res.writeHead(404).end()
  if (!(await isFile(file))) {
    if (/\/assets\/[^/]+\.js$/.test(path) && (req.headers['sec-fetch-dest'] ?? 'script') === 'script') return res.writeHead(200, { ...SECURITY, 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' }).end(STALE)
    if (extname(path)) return res.writeHead(404, SECURITY).end()
    // In-app screens without their own page (quiz, search…) get the empty shell; anything else is a 404.
    return html(res, isAppRoute(path) ? 200 : 404, embed(SHELL, r!))
  }
  try {
    let data = await readFile(file)
    // Hashed assets, and word recordings asked for by version (/audio/en/dog.mp3?v=…), never change.
    const immutable = file.includes(`${join(DIST, 'assets')}`) || (file.startsWith(join(DIST, 'audio')) && url.searchParams.has('v'))
    const headers: Record<string, string | number> = {
      ...SECURITY,
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      // Cloudflare overrides no-cache on .js (4 h browser TTL) but keeps no-store: sw.js must never be stale.
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : /\.(js|webmanifest)$/.test(file) ? 'no-store' : 'no-cache',
    }
    // Safari plays audio only from servers that answer byte ranges.
    if (extname(file) === '.mp3') {
      headers['Accept-Ranges'] = 'bytes'
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '')
      if (m && (m[1] || m[2])) {
        const size = data.length
        const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]))
        const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1
        if (start > end || start >= size) return res.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }).end()
        status = 206
        headers['Content-Range'] = `bytes ${start}-${end}/${size}`
        data = data.subarray(start, end + 1)
      }
      headers['Content-Length'] = data.length
    }
    res.writeHead(status, headers)
    res.end(data)
  } catch { res.writeHead(404).end() }
}

createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error(req.method, e)
    if (!res.headersSent) res.writeHead(500).end()
    else res.end()
  })
}).listen(PORT, () => console.log(`Šprtám on :${PORT}, content from ${CONTENT_API}`))
process.on('unhandledRejection', (e) => console.error('unhandled rejection', e))

await startContent({ api: CONTENT_API, dataDir: DATA })
