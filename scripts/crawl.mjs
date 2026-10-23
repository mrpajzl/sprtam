// Dev check: open every topic (both explanations) and report runtime errors. Needs dev server on :5179.
import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
let errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto('http://127.0.0.1:5179/'); await p.waitForTimeout(500)
const bad = []; let n = 0
for (const g of readdirSync('src/content/data')) for (const f of readdirSync('src/content/data/' + g)) {
  const subj = f.replace('.ts', '')
  const ids = await p.evaluate(async (path) => (await import(path)).default.topics.map((t) => t.id), `/src/content/data/${g}/${f}`)
  for (const id of ids) for (const ex of [0, 1]) {
    errs = []
    await p.evaluate((h) => { location.hash = h }, `/g/${g}/${subj}/${id}?ex=${ex}`)
    await p.waitForSelector('.blocks', { timeout: 5000 }).catch(() => errs.push('no .blocks'))
    await p.waitForTimeout(30)
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    if (overflow) errs.push('horizontal overflow')
    if (errs.length) bad.push(`${g}/${subj}/${id}#${ex}: ${errs.join(' | ')}`)
    n++
  }
}
console.log(n, 'pages,', bad.length, 'with problems'); bad.slice(0, 40).forEach((x) => console.log('✗', x))
await b.close()
