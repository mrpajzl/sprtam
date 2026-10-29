// Offline check against a production build (`npm run build`, then `node dist-server/index.mjs` with a content API):
// after one online visit, the whole app – every grade, subject, topic, vocabulary level and approach plan –
// works without a connection. node scripts/offline-test.mjs [http://localhost:8091]
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const BASE = process.argv[2] ?? 'http://localhost:8091'
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
let fails = 0
const ok = (c, m) => { console.log(c ? '✓' : '✗', m); if (!c) fails++ }

await p.goto(`${BASE}/`)
await p.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 }).catch(() => {})
// Every file of the release in the content cache (src/content/remote.ts keepOffline).
const want = await p.evaluate(async () => Object.keys(JSON.parse(document.getElementById('sprtam-manifest').textContent).files).length)
let have = 0
for (let i = 0; i < 120 && have < want; i++) {
  await p.waitForTimeout(500)
  have = await p.evaluate(async () => (await (await caches.open('content')).keys()).length)
}
ok(have === want, `content cache holds all ${want} files of the release (${have})`)

await ctx.setOffline(true)
const visit = async (path, sel, what) => {
  await p.goto(`${BASE}${path}`).catch(() => {})
  const found = await p.waitForSelector(sel, { timeout: 10000 }).then(() => true, () => false)
  ok(found, `offline ${what} (${path})`)
}
await visit('/g/s3', '.tiles .tile', 'grade page')
await visit('/g/z8/chemie', '.list .row', 'subject page')
await visit('/g/z9/fyzika/' + await p.evaluate(async () => {
  const m = JSON.parse(localStorage.getItem('sprtam:manifest'))
  const c = await caches.open('content')
  const r = await c.match(`/api/content/f/${m.files['subject/z9/fyzika']}.json`)
  return (await r.json())[2].id
}), '.blocks', 'topic page')
await visit('/slovicka/B2', '.tiles .tile', 'vocabulary level')
await visit('/waldorf/z3', '.list .row', 'approach year')
await visit('/hledat?q=atom', '.row', 'search')
await visit('/periodicka-tabulka', '.periodic-detail', 'Periodická tabulka with the table widget')
await visit('/periodicka-tabulka/vse/poznej', '.periodic-el.pick', 'a game of Periodická tabulka')
// In-app navigation while offline.
await p.evaluate(() => { history.pushState(null, '', '/g/z2/prvouka'); dispatchEvent(new PopStateEvent('popstate')) })
ok(await p.waitForSelector('.list .row', { timeout: 10000 }).then(() => true, () => false), 'offline in-app navigation to another subject')
ok(!errs.length, `no page errors ${errs.join(' | ')}`)
await b.close()
process.exit(fails ? 1 : 0)
