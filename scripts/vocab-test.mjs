// Dev check: vocabulary drill – pick and typed cards, misses come back. Needs dev server on :5179.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const base = process.env.BASE ?? 'http://127.0.0.1:5179/'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto(base + 'slovicka/A1/0'); await p.waitForTimeout(800)
await p.screenshot({ path: '/tmp/sprtam-shots/v-pick.png' })
const en = (cz) => p.evaluate(async (cz) => { const m = await import('/content/vocab/a1.json'); return m.default.groups.flatMap((g) => g.words).find((w) => w.cz === cz)?.en }, cz)
let n = 0, typed = 0, wrongDone = false, shot = false
for (; n < 80 && !(await p.locator('.result').count()); n++) {
  const cz = await p.locator('.ask h2').textContent(), right = await en(cz)
  const total = await p.locator('.qtop .timer').textContent()
  if (await p.locator('.type').count()) {
    typed++
    if (!shot) { await p.screenshot({ path: '/tmp/sprtam-shots/v-type.png' }); shot = true }
    // One typo: still counts, shows the right spelling.
    await p.fill('.answer-input', right.length >= 5 ? right.slice(0, -1) + 'x' : right); await p.keyboard.press('Enter')
    await p.waitForTimeout(300)
    if (typed === 1) await p.screenshot({ path: '/tmp/sprtam-shots/v-typo.png' })
    if (await p.locator('.reveal').count()) await p.keyboard.press('Enter')
    else await p.waitForTimeout(800)
  } else if (!wrongDone) {
    // Miss the first word on purpose: it must come back typed.
    await p.locator('.opt', { hasNotText: new RegExp(`^${right}$`) }).first().click(); await p.waitForTimeout(300)
    await p.screenshot({ path: '/tmp/sprtam-shots/v-miss.png' })
    await p.keyboard.press('Enter'); wrongDone = true
    console.log('after miss', total, '→', await p.locator('.qtop .timer').textContent())
  } else {
    await p.locator('.opt', { hasText: new RegExp(`^${right}$`) }).click(); await p.waitForTimeout(1100)
  }
  await p.waitForTimeout(100)
}
await p.screenshot({ path: '/tmp/sprtam-shots/v-result.png' })
console.log('cards', n, 'typed', typed, await p.locator('.result .pct').textContent(), Object.keys(JSON.parse(await p.evaluate(() => localStorage.getItem('sprtam:progress'))).w).length, 'words saved', errs)
// Second session: words now in box ≥ 2 are typed.
await p.evaluate(async () => { const m = await import('/content/vocab/a1.json'); const s = JSON.parse(localStorage.getItem('sprtam:progress')); for (const w of m.default.groups[0].words) s.w[w.en] = 3; localStorage.setItem('sprtam:progress', JSON.stringify(s)) })
await p.goto(base + 'slovicka/A1/0'); await p.reload(); await p.waitForTimeout(800)
console.log('known words typed:', await p.locator('.type').count() === 1)
await b.close()
