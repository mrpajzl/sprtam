// Static file server for the built PWA + an anonymous usage counter.
// The counter stores only per-day totals ({ users, new }). No IPs, no IDs, no cookies, no logs of requests.
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT ?? 8080)
const DIST = process.env.DIST ?? join(import.meta.dirname, '..', 'dist')
const DATA = process.env.DATA_DIR ?? join(import.meta.dirname, '..', 'data')
const STATS_TOKEN = process.env.STATS_TOKEN ?? ''
const FILE = join(DATA, 'stats.json')
// The app moved to sprtam.cz. These hosts still reach this server and send everyone over (see below).
const CANONICAL = 'https://sprtam.cz'
const LEGACY = new Set((process.env.LEGACY_HOSTS ?? 'sprtam.ondrejzraly.cz,www.sprtam.cz').split(','))

const isFile = (f) => stat(f).then((s) => s.isFile(), () => false)
const page = (...parts) => isFile(join(DIST, ...parts, 'index.html'))
const MODES = ['kviz', 'opakovani', 'pisemka', 'zkouseni']

/** Routes the app renders that have no prerendered page of their own. */
async function isAppRoute(path) {
  const p = path.split('/').filter(Boolean)
  if (p.length === 1) return ['hledat', 'mix', 'sdilet'].includes(p[0])
  if (p[0] === 'g' && p.length === 4 && p[3] === '~test') return page(...p.slice(0, 3))
  if (p[0] === 'g' && p.length === 5 && MODES.includes(p[4])) return page(...p.slice(0, 4))
  if (p[0] === 'slovicka' && p.length === 3) return page(...p.slice(0, 2))
  return false
}

// A page from an older deploy (kept open, or served by an old service worker) asks for
// hashed chunks that no longer exist. Instead of a 404 that leaves the app dead, answer with
// a script that drops the old service worker and reloads once into the current version.
// Only for the page's own script loads (Sec-Fetch-Dest: script), never for a service worker filling its cache.
const STALE = `${await readFile(join(DIST, 'boot-check.js'), 'utf8').catch(() => '')}\n;window.sprtamHeal && sprtamHeal()`

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const movePage = (to) => `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Šprtám se přestěhoval</title><link rel="canonical" href="${esc(to)}"><script src="/move.js"></script></head><body style="font-family:system-ui,sans-serif;padding:2rem"><p>Šprtám se přestěhoval na <a href="${esc(to)}">sprtam.cz</a>…</p></body></html>`

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' }
const SECURITY = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
}

let stats = {}
try { stats = JSON.parse(await readFile(FILE, 'utf8')) } catch { /* first run */ }
let dirty = false
setInterval(async () => { if (!dirty) return; dirty = false; await mkdir(DATA, { recursive: true }); await writeFile(FILE, JSON.stringify(stats)) }, 10_000).unref()

function ping(body) {
  const day = new Date().toISOString().slice(0, 10)
  const d = (stats[day] ??= { users: 0, new: 0 })
  d.users++
  if (body.includes('"new":true')) d.new++
  dirty = true
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/api/ping' && req.method === 'POST') {
    let body = ''
    req.on('data', (c) => { if (body.length < 100) body += c })
    req.on('end', () => { ping(body); res.writeHead(204).end() })
    return
  }
  if (url.pathname === '/api/stats') {
    if (STATS_TOKEN && url.searchParams.get('token') !== STATS_TOKEN) return res.writeHead(403).end()
    return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(stats))
  }
  if (url.pathname === '/healthz') return res.writeHead(200).end('ok')

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

  // Pages: /g/z5/matematika → dist/g/z5/matematika/index.html (prerendered, see plugins/prerender.ts).
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) return res.writeHead(301, { Location: url.pathname.replace(/\/+$/, '') + url.search }).end()
  let path
  try { path = normalize(decodeURIComponent(url.pathname)) } catch { return res.writeHead(400).end() }
  let file = join(DIST, path)
  let status = 200
  if (!file.startsWith(DIST)) return res.writeHead(404).end()
  if (!(await isFile(file))) {
    if (await isFile(join(file, 'index.html'))) file = join(file, 'index.html')
    else if (/\/assets\/[^/]+\.js$/.test(path) && (req.headers['sec-fetch-dest'] ?? 'script') === 'script') return res.writeHead(200, { ...SECURITY, 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' }).end(STALE)
    else if (extname(path)) return res.writeHead(404, SECURITY).end()
    else {
      // In-app screens without their own page (quiz, search…) get the empty shell; anything else is a 404.
      status = (await isAppRoute(path)) ? 200 : 404
      file = join(DIST, 'app.html')
    }
  }
  try {
    const data = await readFile(file)
    const immutable = file.includes(`${join(DIST, 'assets')}`)
    res.writeHead(status, {
      ...SECURITY,
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      // Cloudflare overrides no-cache on .js (4 h browser TTL) but keeps no-store: sw.js must never be stale.
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : /\.(js|webmanifest)$/.test(file) ? 'no-store' : 'no-cache',
    })
    res.end(data)
  } catch { res.writeHead(404).end() }
}).listen(PORT, () => console.log(`Šprtám on :${PORT}`))
