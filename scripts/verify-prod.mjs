// Production check: every subject page lists the same number of topics as the content release it serves.
import { chromium } from 'playwright-core'
const base = process.argv[2] ?? 'https://sprtam.cz/'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const counts = {}
// The topic index of the current release (docs/OBSAH.md); approach-only topics (docs/PRISTUPY.md) are not in the subject list.
const get = (path) => fetch(new URL(path, base)).then((r) => r.json())
const manifest = await get('/api/content/manifest')
for (const [g, s, , , , approach] of await get(`/api/content/f/${manifest.files.index}.json`)) counts[`${g}/${s}`] = (counts[`${g}/${s}`] ?? 0) + (approach ? 0 : 1)
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage()
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto(base); await p.waitForTimeout(1000)
let bad = 0
for (const [k, n] of Object.entries(counts)) {
  await p.evaluate((u) => { history.pushState(null, '', u); dispatchEvent(new PopStateEvent('popstate')) }, `/g/${k}`)
  const got = await p.waitForFunction((n) => document.querySelectorAll('.list .row').length === n, n, { timeout: 15000 }).then(() => n, async () => p.locator('.list .row').count())
  if (got !== n) { bad++; console.log('✗', k, 'page', got, 'release', n) }
}
console.log(`release ${manifest.release}:`, Object.keys(counts).length, 'subjects checked,', bad, 'mismatches', errs)
await b.close()
