// Dev helper: open a route and dump console messages, failed requests and page text.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage()
p.on('console', (m) => console.log('console', m.type(), m.text().slice(0, 200)))
p.on('pageerror', (e) => console.log('pageerror', String(e).slice(0, 300)))
p.on('requestfailed', (r) => console.log('failed', r.url(), r.failure()?.errorText))
p.on('response', (r) => r.status() >= 400 && console.log('http', r.status(), r.url()))
await p.goto(process.argv[2]); await p.waitForTimeout(5000)
console.log('TEXT:', (await p.locator('body').innerText()).slice(0, 300))
await b.close()
