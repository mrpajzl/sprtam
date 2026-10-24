// Production check: every subject page lists the same number of topics as the local content.
import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const base = process.argv[2] ?? 'https://sprtam.cz/'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const counts = JSON.parse(execFileSync('npx', ['tsx', '-e', `
import { readdirSync } from 'node:fs'
const out = {}
for (const g of readdirSync('src/content/data')) for (const f of readdirSync('src/content/data/' + g)) out[g + '/' + f.replace('.ts', '')] = (await import('./src/content/data/' + g + '/' + f)).default.topics.length
console.log(JSON.stringify(out))`.replace('await import', 'require') ], { encoding: 'utf8' }))
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
