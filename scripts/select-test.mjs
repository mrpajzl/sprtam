// Our dropdown (src/ui/Select.tsx) in the app: the obor picker in Moje škola (search, keyboard, a click outside,
// Esc inside the Já sheet closes only the list) and the plan editor. Against `npx vite --port 8463` or a build:
// `node scripts/select-test.mjs [http://localhost:8463] [shots-dir]`.
import { chromium } from 'playwright-core'
const BASE = process.argv[2] ?? 'http://localhost:8463'
const SHOTS = process.argv[3]
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
let fails = 0
const ok = (cond, msg) => { console.log(cond ? '✓' : '✗', msg); if (!cond) fails++ }

for (const theme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
  await ctx.addInitScript((t) => { localStorage.setItem('sprtam-theme', t); localStorage.setItem('sprtam-obor', '') }, theme)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
  const shot = async (n) => { if (SHOTS) { await p.waitForTimeout(350); await p.screenshot({ path: `${SHOTS}/${n}-${theme}.png` }) } }

  await p.goto(`${BASE}/skola`)
  await p.getByRole('radio', { name: 'Střední škola' }).click()
  await p.getByRole('button', { name: '1. ročník', exact: true }).click()
  const obor = p.locator('button.sel.pick', { hasText: 'Obor' })
  await obor.waitFor({ timeout: 15000 })
  await obor.click()
  const panel = p.locator('.sel-panel')
  ok(await panel.isVisible(), `${theme}: obor list opens`)
  ok(await p.evaluate(() => document.activeElement?.getAttribute('role') === 'combobox'), `${theme}: the search field has the focus`)
  const all = await panel.getByRole('option').count()
  ok(all >= 2, `${theme}: options listed (${all})`)
  ok(await panel.locator('.sel-ic.svg svg').count() > 0, `${theme}: obor options carry SVG icons`)
  await shot('obor-open')
  await p.keyboard.type('strojir')
  ok(await panel.getByRole('option').count() === 1, `${theme}: search "strojir" leaves one obor`)
  await p.keyboard.type('xyz')
  ok(await panel.locator('.sel-empty').isVisible(), `${theme}: no match says so`)
  await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace')
  await p.keyboard.press('Enter')
  ok(!(await panel.count()), `${theme}: Enter picks and closes`)
  ok((await obor.innerText()).includes('Strojírenství'), `${theme}: the row shows the picked obor`)
  ok(await p.evaluate(() => localStorage.getItem('sprtam-obor')) === 'strojirenstvi', `${theme}: the obor is saved`)
  ok(await p.evaluate(() => document.activeElement?.classList.contains('sel')), `${theme}: focus returns to the trigger`)

  // Keyboard alone: arrows open, Esc closes; a click outside closes.
  await p.keyboard.press('ArrowDown')
  ok(await panel.isVisible(), `${theme}: ArrowDown on the trigger opens`)
  await p.keyboard.press('Escape')
  ok(!(await panel.count()), `${theme}: Esc closes`)
  await obor.click()
  await p.mouse.click(5, 5)
  ok(!(await panel.count()), `${theme}: a click outside closes`)

  // In the Já sheet (a modal dialog) the list is over the sheet and Esc does not close the sheet.
  await p.goto(`${BASE}/`)
  await p.locator('.school-chip').click()
  const sheet = p.locator('dialog.school-sheet[open]')
  await sheet.waitFor()
  await sheet.locator('button.sel.pick', { hasText: 'Obor' }).click()
  ok(await panel.isVisible(), `${theme}: list opens in the sheet`)
  const top = await p.evaluate(() => { const r = document.querySelector('.sel-opt')?.getBoundingClientRect(); return r && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.sel-panel') != null })
  ok(top, `${theme}: the list is on top of the sheet`)
  await shot('obor-sheet')
  await panel.getByRole('option', { name: /gymnázium/ }).click()
  ok(await p.evaluate(() => localStorage.getItem('sprtam-obor')) !== 'strojirenstvi', `${theme}: a click picks an option`)
  await sheet.locator('button.sel.pick', { hasText: 'Obor' }).click()
  await p.keyboard.press('Escape')
  ok(!(await panel.count()) && await sheet.count() === 1, `${theme}: Esc closes the list, not the sheet`)

  // The plan editor: subject picker with glyphs.
  await p.goto(`${BASE}/plan/novy`)
  const subj = p.locator('.field .sel', { hasText: /./ }).nth(1)
  await subj.waitFor()
  await subj.click()
  ok(await panel.locator('.sel-ic.svg').count() > 0, `${theme}: subjects show glyphs`)
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter')
  ok(!(await panel.count()), `${theme}: plan subject picked by keys`)
  await shot('plan')
  ok(!errs.length, `${theme}: no page errors ${errs.join(' | ')}`)
  await ctx.close()
}
await b.close()
console.log(fails ? `${fails} failed` : 'all passed')
process.exit(fails ? 1 : 0)
