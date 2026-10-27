// Error reports („Nahlásit chybu“) through the server of sprtam.cz: checked, limited per device and forwarded to the
// content service with REPORT_TOKEN – and nothing about the pupil travels along. Needs `npm run build` and content/
// (npm run content:pull); starts scripts/content-stub.ts and the built server on free ports.
//   node scripts/report-test.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const free = () => new Promise((r) => { const s = createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)) }) })
const [stubPort, port, offPort] = [await free(), await free(), await free()]
const TOKEN = 'test-report-token-0123456789-abcdefghij'
const data = mkdtempSync(join(tmpdir(), 'sprtam-report-'))
const procs = []
const start = (args, env, ready) => new Promise((r) => {
  const p = spawn(args[0], args.slice(1), { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'] })
  procs.push(p)
  p.stdout.on('data', (d) => { if (String(d).includes(ready)) r(p) })
})

let failed = 0
const check = (ok, what) => { console.log(ok ? '✓' : '✗', what); if (!ok) failed++ }

try {
  await start(['node', '--import', 'tsx', 'scripts/content-stub.ts', String(stubPort)], { REPORT_TOKEN: TOKEN }, 'content stub on')
  await start(['node', 'dist-server/index.mjs'], { PORT: String(port), DATA_DIR: data, CONTENT_API: `http://localhost:${stubPort}`, REPORT_TOKEN: TOKEN }, 'Šprtám on')
  await start(['node', 'dist-server/index.mjs'], { PORT: String(offPort), DATA_DIR: data, CONTENT_API: `http://localhost:${stubPort}`, REPORT_TOKEN: '' }, 'Šprtám on')
  const base = `http://localhost:${port}`
  // Wait for the first content release (the server polls the service).
  for (let i = 0; i < 100 && (await fetch(`${base}/api/content/manifest`)).status !== 200; i++) await new Promise((r) => setTimeout(r, 100))
  const release = (await (await fetch(`${base}/api/content/manifest`)).json()).release
  const send = (body, b = base, headers = {}) => fetch(`${b}/api/report`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'pupil-browser', 'CF-Connecting-IP': '203.0.113.7', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  const ok = { topic: 'z5/matematika/zlomky', target: { kind: 'question', index: 3, text: '  Kolik je 1/2 + 1/4?  ' }, reason: 'wrong', note: 'Ve výsledku má být 3/4.', release }

  const r1 = await send(ok)
  check(r1.status === 204, 'a report is accepted (204)')
  const got = await (await fetch(`http://localhost:${stubPort}/stub/reports`)).json()
  check(got.length === 1 && got[0].body.target.text === 'Kolik je 1/2 + 1/4?' && got[0].body.note === ok.note, 'it reaches the content service, trimmed')
  const h = got[0]?.headers ?? {}
  check(h.authorization === `Bearer ${TOKEN}` && !JSON.stringify(h).includes('203.0.113.7') && h['user-agent'] !== 'pupil-browser' && !h['x-forwarded-for'], 'forwarded with the token, without the address or browser')
  check(Object.keys(got[0]?.body ?? {}).sort().join() === 'note,reason,release,target,topic', 'only the report itself is forwarded')

  check((await send({ ...ok, topic: 'z5/matematika/neexistuje' }, base, { 'CF-Connecting-IP': '203.0.113.8' })).status === 400, 'an unknown topic is refused')
  check((await send({ ...ok, reason: 'spam' }, base, { 'CF-Connecting-IP': '203.0.113.8' })).status === 400, 'an unknown reason is refused')
  check((await send({ ...ok, target: { kind: 'question', index: 999, text: 'x' } }, base, { 'CF-Connecting-IP': '203.0.113.8' })).status === 400, 'an index out of range is refused')
  check((await send('{nope', base, { 'CF-Connecting-IP': '203.0.113.8' })).status === 400, 'broken JSON is refused')
  check((await send({ ...ok, note: 'x'.repeat(5000) }, base, { 'CF-Connecting-IP': '203.0.113.8' })).status === 413, 'a huge body is refused')
  check((await fetch(`${base}/api/report`)).status === 405, 'only POST')
  const bad = await send({ ...ok, reason: 'spam' }, base, { 'CF-Connecting-IP': '203.0.113.8' })
  check((await bad.json()).error?.length > 0, 'errors come with a Czech message')

  const codes = []
  for (let i = 0; i < 5; i++) codes.push((await send(ok)).status)
  check(codes.slice(0, 4).every((c) => c === 204) && codes[4] === 429, `one device sends at most 5 reports in 10 minutes (${codes.join(',')})`)
  check((await send(ok, base, { 'CF-Connecting-IP': '203.0.113.9' })).status === 204, 'another device still can')

  const off = await send(ok, `http://localhost:${offPort}`)
  check(off.status === 503 && (await off.json()).error === 'Hlášení teď nejde poslat. Zkus to později.', 'without REPORT_TOKEN reports are off (503)')
} finally {
  procs.forEach((p) => p.kill())
  rmSync(data, { recursive: true, force: true })
}
console.log(failed ? `${failed} failed` : 'all passed')
process.exit(failed ? 1 : 0)
