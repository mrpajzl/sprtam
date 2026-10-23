// Dev check: vocabulary swipe – screenshots and real pointer drags. Needs dev server on :5179.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto((process.env.BASE ?? 'http://127.0.0.1:5179/') + '#/slovicka'); await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/sprtam-shots/v-levels.png' })
await p.goto((process.env.BASE ?? 'http://127.0.0.1:5179/') + '#/slovicka/A1/0'); await p.waitForTimeout(600); await p.screenshot({ path: '/tmp/sprtam-shots/v-card.png' })
const drag = async (dx) => { const box = await p.locator('.scard:not(.back)').boundingBox(); const x = box.x + box.width / 2, y = box.y + box.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(x + (dx * i) / 8, y); if (dx > 0 && Math.abs(dx) < 200) await p.screenshot({ path: '/tmp/sprtam-shots/v-drag.png' }); await p.mouse.up() }
let rounds = 0
for (let i = 0; i < 60 && !(await p.locator('.result').count()); i++) {
  const ask = await p.locator('.ask h2').textContent()
  const card = (await p.locator('.scard:not(.back)').textContent()).replace(/^AnoNe/, '')
  // Cheat with the data to swipe correctly most of the time.
  const right = await p.evaluate(async ([cz, c]) => { const m = await import('/src/vocab/data/a1.ts'); return m.default.groups.flatMap((g) => g.words).find((w) => w[0] === cz)?.[1] === c }, [ask, card])
  if (i === 0) await drag(150), await p.waitForTimeout(50)
  await drag(right ? 160 : -160); rounds++
  await p.waitForTimeout(right ? 1000 : 400)
}
await p.screenshot({ path: '/tmp/sprtam-shots/v-result.png' })
console.log('swipes', rounds, await p.locator('.result .pct').textContent(), Object.keys(JSON.parse(await p.evaluate(() => localStorage.getItem('sprtam:progress'))).w).length, 'words saved', errs)
await b.close()
