// Matematické křížovky in a real browser: the level page, every level solved by touch (one wrong tile first, a hint,
// tapping a tile back), the result and the record, and the keyboard on a computer.
//   node scripts/crossword-test.mjs [base]   (default http://127.0.0.1:5179, the dev server: npx vite --port 5179 --host 127.0.0.1)
// SHOTS=<dir> saves screenshots there (light and dark).
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://127.0.0.1:5179'
const shots = process.env.SHOTS
let failed = 0
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed++ }

const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
const watch = (p) => {
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => m.type() === 'error' && !/font|woff|403|Failed to load resource/i.test(m.text()) && errors.push(m.text()))
}
const shot = async (page, name) => { if (!shots) return; await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/cw-${name}.png` }) }

const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await phone.newPage()
watch(p)

await p.goto(`${base}/matematicke-krizovky`)
await p.waitForSelector('.cw-example')
const levels = await p.locator('.map-mode').count()
check(levels === 7, `level page lists 7 levels (${levels})`)
await shot(p, 'levels')

/** The solution: value of every blank cell, read from the app's state is not possible, so solve like a pupil would. */
const solve = (page = p) => page.evaluate(() => {
  const cells = [...document.querySelector('.cw-board').querySelectorAll('.cw-grid > *')].map((el) => { const [r, c] = el.dataset.k.split(',').map(Number); return { r, c, text: el.textContent.replace('−', '-'), blank: el.tagName === 'BUTTON' } })
  const at = new Map(cells.map((x) => [`${x.r},${x.c}`, x]))
  const eqs = []
  for (const x of cells) for (const [dr, dc] of [[0, 1], [1, 0]]) {
    const g = (i) => at.get(`${x.r + dr * i},${x.c + dc * i}`)
    const prev = at.get(`${x.r - dr},${x.c - dc}`)
    if (!prev && g(1) && ['+', '-', '×', '÷'].includes(g(1).text) && g(3)?.text === '=') eqs.push({ op: g(1).text, k: [0, 2, 4].map((i) => `${x.r + dr * i},${x.c + dc * i}`) })
  }
  const val = new Map(cells.filter((x) => !x.blank && /^-?\d+$/.test(x.text)).map((x) => [`${x.r},${x.c}`, Number(x.text)]))
  for (let changed = true; changed;) {
    changed = false
    for (const e of eqs) {
      const v = e.k.map((k) => val.get(k))
      const miss = v.filter((x) => x === undefined).length
      if (miss !== 1) continue
      const [a, b, c] = v, i = v.indexOf(undefined)
      const r = e.op === '+' ? [c - b, c - a, a + b][i] : e.op === '-' ? [c + b, a - c, a - b][i] : e.op === '×' ? [c / b, c / a, a * b][i] : [c * b, a / c, a / b][i]
      val.set(e.k[i], r); changed = true
    }
  }
  return { eqs: eqs.length, blanks: cells.filter((x) => x.blank).map((x) => ({ key: `${x.r},${x.c}`, v: val.get(`${x.r},${x.c}`) })) }
})
const cell = (key, page = p) => page.locator(`.cw-board button[data-k="${key}"]`)
const tile = (v, page = p) => page.locator('.cw-tile:not(.used)').filter({ hasText: new RegExp(`^${String(v).replace('-', '−')}$`) }).first()

for (let li = 0; li < levels; li++) {
  await p.goto(`${base}/matematicke-krizovky`)
  const href = await p.locator('.map-mode').nth(li).getAttribute('href')
  await p.goto(base + href)
  await p.waitForSelector('.cw-bank')
  const { eqs, blanks } = await solve()
  const tiles = await p.locator('.cw-tile').count()
  check(blanks.every((b) => Number.isFinite(b.v)), `${href}: solvable step by step (${eqs} equations, ${blanks.length} blanks, ${tiles} tiles)`)
  const fits = await p.evaluate(() => { const g = document.querySelector('.cw-grid').getBoundingClientRect(); return g.left >= 0 && g.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth })
  check(fits, `${href}: grid fits the phone`)
  if (li === 3) await shot(p, 'game')
  for (const [i, b] of blanks.entries()) {
    if (li === 0 && i === 0) {
      // A hint fills the first cell.
      await p.click('.cw-hint')
      const t = (await cell(b.key).textContent()).replace('−', '-')
      check(Number(t) === b.v, `${href}: the hint places the right number`)
      continue
    }
    await cell(b.key).click()
    if (li === 1 && i === 0) {
      // A wrong tile first (when there is another one), then it goes back by tapping the cell again.
      const other = p.locator('.cw-tile:not(.used)').filter({ hasNotText: new RegExp(`^${String(b.v).replace('-', '−')}$`) }).first()
      if (await other.count()) {
        await other.click()
        await cell(b.key).click(); await cell(b.key).click()
        check((await cell(b.key).textContent()) === '', `${href}: tapping a filled selected cell empties it`)
      }
    }
    await tile(b.v).click()
  }
  await p.waitForSelector('.cw-ask b:has-text("Hotovo")', { timeout: 3000 }).catch(() => {})
  check((await p.locator('.cw-cell.bad').count()) === 0 && (await p.locator('.cw-ask b').textContent()).startsWith('Hotovo'), `${href}: solved, every equation green`)
  if (li === 2) await shot(p, 'solved')
  await p.waitForSelector('.result', { timeout: 4000 })
  check(await p.locator('.result .pct').isVisible(), `${href}: result shown`)
  if (li === 1) await shot(p, 'result')
}
await p.goto(`${base}/matematicke-krizovky`)
await p.waitForSelector('.map-mode .stars')
check((await p.locator('.map-mode .stars').count()) === levels, 'every level shows its record')

// A wrong equation turns red.
await p.goto(`${base}/matematicke-krizovky/do10`)
await p.waitForSelector('.cw-bank')
{
  const { blanks } = await solve()
  let red = false
  // Put tiles in the wrong order until something is red.
  const vals = blanks.map((b) => b.v)
  if (new Set(vals).size > 1) {
    for (const [i, b] of blanks.entries()) { await cell(b.key).click(); await tile(vals[(i + 1) % vals.length]).click() }
    red = (await p.locator('.cw-cell.bad').count()) > 0
    check(red, 'a wrong equation turns red')
    await shot(p, 'wrong')
  }
}

// Unknown level.
await p.goto(`${base}/matematicke-krizovky/nic`)
await p.waitForSelector('.empty', { timeout: 3000 }).catch(() => {})
check(await p.locator('.empty').isVisible(), 'unknown level says so')

// Dark theme and the keyboard on a computer.
const desk = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: 'dark' })
const d = await desk.newPage()
watch(d)
await d.goto(`${base}/`)
await d.evaluate(() => localStorage.setItem('sprtam-theme', 'dark'))
await d.goto(`${base}/matematicke-krizovky/do100`)
await d.waitForSelector('.cw-bank')
{
  const { blanks } = await solve(d)
  await d.keyboard.press('h')
  check((await d.locator('.cw-hint small').textContent()) === '1', 'H gives a hint on a computer')
  // Type the numbers of the other cells; arrows and a click select the cell.
  for (const b of blanks) {
    if ((await cell(b.key, d).textContent()) !== '') continue
    await cell(b.key, d).click()
    await d.keyboard.type(String(b.v))
    // A number that is the beginning of another tile needs Enter.
    if ((await cell(b.key, d).textContent()) === '') await d.keyboard.press('Enter')
  }
  await d.waitForSelector('.result', { timeout: 4000 }).catch(() => {})
  check(await d.locator('.result').isVisible(), 'solved by typing the numbers')
}
await d.goto(`${base}/matematicke-krizovky/zaporna`)
await d.waitForSelector('.cw-bank')
await shot(d, 'dark-desk')

check(errors.length === 0, `no errors in the console${errors.length ? `: ${errors.join(' | ')}` : ''}`)
await browser.close()
process.exit(failed ? 1 : 0)
