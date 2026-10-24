import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const A = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
const B = await (await b.newContext()).newPage()
await A.goto('http://127.0.0.1:5179/')
await A.evaluate(() => localStorage.setItem('sprtam:progress', JSON.stringify({ v: 1, g: 'z6', t: { 'z6/matematika/uhel': { s: 90, n: 3, d: 20749 } }, w: { bird: 3 } })))
await A.goto('http://127.0.0.1:5179/sdilet'); await A.reload(); await A.waitForTimeout(300)
await A.getByText('Ukázat kód pokroku').click(); await A.waitForSelector('.qr svg')
await A.screenshot({ path: '/tmp/sprtam-shots/code.png' })
const url = await A.evaluate(async () => { const m = await import('/src/progress/code.ts'); const s = await import('/src/progress/store.ts'); return m.shareUrl(await m.encodeProgress(s.getProgress())) })
console.log('share url length', url.length)
await B.goto(url); await B.waitForTimeout(800)
console.log('B after import:', B.url(), await B.evaluate(() => localStorage.getItem('sprtam:progress')))
const bad = url.slice(0, -3) + 'AAA'
await B.goto('about:blank'); await B.goto(bad); await B.waitForTimeout(500)
console.log('tampered:', await B.evaluate(() => document.body.innerText))
await b.close()
