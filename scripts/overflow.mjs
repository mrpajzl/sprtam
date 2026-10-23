// Dev check: which element is wider than the viewport on a given route.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
for (const r of process.argv.slice(2)) {
  await p.goto('http://127.0.0.1:5179/#' + r); await p.waitForTimeout(600)
  console.log(r, await p.evaluate(() => [...document.querySelectorAll('.blocks *, .seg *, .bar *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 3).map((e) => `${e.tagName}.${e.className} "${e.textContent.slice(0, 50)}" ${Math.round(e.getBoundingClientRect().right)}`)))
}
await b.close()
