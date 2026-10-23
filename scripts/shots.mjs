// Dev helper: screenshots of key screens. node scripts/shots.mjs [baseUrl]
import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
import { homedir } from 'node:os'
const base = process.argv[2] ?? 'http://127.0.0.1:5179/'
const dir = `${homedir()}/Library/Caches/ms-playwright/` + readdirSync(`${homedir()}/Library/Caches/ms-playwright`).find((d) => d.startsWith('chromium-'))
const exe = `${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: process.env.DARK ? 'dark' : 'light' })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const routes = (process.env.ROUTES ?? '/,/g/z6,/g/z6/matematika').split(',')
for (const r of routes) {
  await page.goto(base + '#' + r)
  await page.waitForTimeout(700)
  const name = r.replace(/[^a-z0-9]+/gi, '_') || 'home'
  await page.screenshot({ path: `/tmp/sprtam-shots/${name}.png`, fullPage: !!process.env.FULL })
  console.log('shot', name)
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors')
await browser.close()
