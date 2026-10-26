// A stand-in for the content service's public API (docs/OBSAH.md), for tests of the app and its server:
//   npx tsx scripts/content-stub.ts [port]      (default 8097; content from content/ – npm run content:pull)
// Serves /api/public/v1/manifest, /api/public/v1/files/<hash> and /api/public/v1/export. The release number
// goes up whenever a file in content/ changes, as after a publish.
import { readdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { CONTENT, readSnapshot } from '../plugins/content'
import { buildRelease } from '../src/content/release'

const port = Number(process.argv[2] ?? 8097)

const stamp = (d: string): string => readdirSync(d).map((f) => { const p = join(d, f); const s = statSync(p); return s.isDirectory() ? stamp(p) : `${f}:${s.mtimeMs}:${s.size}` }).join('|')

let state: { stamp: string; release: number; publishedAt: number; snap: Map<string, unknown>; built: ReturnType<typeof buildRelease> } | undefined
function current() {
  const s = ['topics', 'vocab', 'approaches'].map((d) => stamp(join(CONTENT, d))).join('#')
  if (state?.stamp !== s) {
    const snap = readSnapshot(CONTENT)
    state = { stamp: s, release: (state?.release ?? 0) + 1, publishedAt: Date.now(), snap, built: buildRelease(snap) }
  }
  return state
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x')
  const json = (status: number, body: string, headers: Record<string, string> = {}) => res.writeHead(status, { 'Content-Type': 'application/json', ...headers }).end(body)
  try {
    const st = current()
    if (url.pathname === '/api/public/v1/manifest') {
      const etag = `"${st.built.manifest.hash}"`
      if (req.headers['if-none-match'] === etag) return res.writeHead(304, { ETag: etag }).end()
      return json(200, JSON.stringify({ ...st.built.manifest, release: st.release, publishedAt: st.publishedAt }), { ETag: etag, 'Cache-Control': 'no-cache' })
    }
    const f = /^\/api\/public\/v1\/files\/([0-9a-f]{20})$/.exec(url.pathname)
    if (f) { const body = st.built.files.get(f[1]); return body ? json(200, body, { 'Cache-Control': 'public, max-age=31536000, immutable' }) : json(404, '{}') }
    if (url.pathname === '/api/public/v1/export') return json(200, JSON.stringify({ release: st.release, publishedAt: st.publishedAt, docs: Object.fromEntries(st.snap) }))
    json(404, '{}')
  } catch (e) { json(500, JSON.stringify({ error: (e as Error).message })) }
}).listen(port, () => console.log(`content stub on :${port}`))
