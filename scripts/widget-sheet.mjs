// Dev helper: one contact sheet with every widget type. node scripts/widget-sheet.mjs < routes
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const lines = readFileSync(0, 'utf8').trim().split('\n').map((l) => l.split(' '))
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: process.env.DARK ? 'dark' : 'light' })
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
const imgs = []
for (const [w, r] of lines) {
  await p.goto('http://127.0.0.1:5179/#' + r); await p.waitForTimeout(900)
  const el = p.locator('.blocks .w').first()
  if (!(await el.count())) { console.log('no widget', w, r); continue }
  imgs.push([w, (await el.screenshot()).toString('base64')])
}
const html = `<body style="margin:0;background:#ddd;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:1640px">${imgs.map(([w, d]) => `<figure style="margin:0;width:400px"><figcaption>${w}</figcaption><img style="width:400px" src="data:image/png;base64,${d}"></figure>`).join('')}</body>`
writeFileSync('/tmp/sprtam-shots/sheet.html', html)
const q = await b.newPage({ viewport: { width: 1656, height: 800 } })
await q.goto('file:///tmp/sprtam-shots/sheet.html'); await q.screenshot({ path: '/tmp/sprtam-shots/sheet.png', fullPage: true })
console.log(errs.length ? errs : 'no errors'); await b.close()
