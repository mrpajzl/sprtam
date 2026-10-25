// Production check: every subject page lists the same number of topics as the local content.
import { chromium } from 'playwright-core'
import { readdirSync, readFileSync } from 'node:fs'
const base = process.argv[2] ?? 'https://sprtam.cz/'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const counts = {}
// Approach-only topics (docs/PRISTUPY.md) are not in the subject list.
const read = (f) => JSON.parse(readFileSync(f, 'utf8'))
for (const g of readdirSync('content/topics')) for (const s of readdirSync('content/topics/' + g)) counts[`${g}/${s}`] = read(`content/topics/${g}/${s}/_subject.json`).topics.filter((id) => !read(`content/topics/${g}/${s}/${id}.json`).approach).length
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage()
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto(base); await p.waitForTimeout(1000)
let bad = 0
for (const [k, n] of Object.entries(counts)) {
  await p.evaluate((u) => { history.pushState(null, '', u); dispatchEvent(new PopStateEvent('popstate')) }, `/g/${k}`)
  const got = await p.waitForFunction((n) => document.querySelectorAll('.list .row').length === n, n, { timeout: 15000 }).then(() => n, async () => p.locator('.list .row').count())
  if (got !== n) { bad++; console.log('✗', k, 'prod', got, 'local', n) }
}
console.log(Object.keys(counts).length, 'subjects checked,', bad, 'mismatches', errs)
await b.close()
