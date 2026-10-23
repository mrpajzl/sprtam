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

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.json': 'application/json' }
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

  const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = join(DIST, path)
  if (!file.startsWith(DIST)) file = join(DIST, 'index.html')
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html') } catch { file = join(DIST, 'index.html') }
  try {
    const data = await readFile(file)
    const immutable = file.includes(`${join(DIST, 'assets')}`)
    res.writeHead(200, {
      ...SECURITY,
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    res.end(data)
  } catch { res.writeHead(404).end() }
}).listen(PORT, () => console.log(`Šprtám on :${PORT}`))
