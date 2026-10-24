// Production check: device A copies its progress link (UI "Kopírovat"), device B opens it and imports.
import { chromium } from 'playwright-core'
const base = process.argv[2] ?? 'https://sprtam.ondrejzraly.cz/'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const ca = await b.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
const A = await ca.newPage()
await A.goto(base)
await A.evaluate(() => localStorage.setItem('sprtam:progress', JSON.stringify({ v: 1, g: 'z5', t: { 'z5/matematika/zlomky': { s: 95, n: 1, d: 1 }, 'z8/dejepis/revoluce-1848': { s: 72, n: 1, d: 1, e: 1 } }, w: { quote: 4, bird: 2 } })))
await A.goto(base + 'sdilet'); await A.reload(); await A.getByText('Ukázat kód pokroku').click()
await A.waitForSelector('.qr svg'); await A.getByText('Kopírovat').click(); await A.waitForTimeout(300)
const url = await A.evaluate(() => navigator.clipboard.readText())
console.log('link length', url.length)
const B = await (await b.newContext()).newPage()
await B.goto(url); await B.waitForURL(/\/g\/z/, { timeout: 15000 }).catch(() => {})
console.log(B.url(), await B.evaluate(() => localStorage.getItem('sprtam:progress')))
await b.close()
