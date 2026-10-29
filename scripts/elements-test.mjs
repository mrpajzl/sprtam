// Periodická tabulka in a real browser: plays whole rounds of every mode by touch (one wrong answer each), the result,
// the record and practising the mistakes, the explore page (sets, an element from the list opens in the table), the
// keyboard on a computer and the blind table of all 118 elements.
//   node scripts/elements-test.mjs [base]   (default http://127.0.0.1:5179, the dev server: npx vite --port 5179 --host 127.0.0.1)
// SHOTS=1 saves screenshots to /tmp/sprtam-elements-*.png (light and dark).
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://127.0.0.1:5179'
const shots = !!process.env.SHOTS
let failed = 0
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed++ }

const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
const watch = (p) => {
  p.on('pageerror', (e) => errors.push(e.message))
  // Fonts inlined as data: URLs are blocked by the CSP everywhere (known, harmless); the dev server may refuse them too.
  p.on('console', (m) => m.type() === 'error' && !/font|woff|403/i.test(m.text()) && errors.push(m.text()))
}
const shot = async (page, name) => { if (!shots) return; await page.waitForTimeout(700); await page.screenshot({ path: `/tmp/sprtam-elements-${name}.png` }) }

const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await phone.newPage()
watch(p)

/** The app's own elements (served by Vite). */
const ELEMENTS = await (async () => {
  await p.goto(`${base}/`)
  return p.evaluate(async () => (await import('/src/chem/elements.ts')).ELEMENTS.map(({ z, symbol, name, cat }) => ({ z, symbol, name, cat })))
})()
const byName = (n) => ELEMENTS.find((e) => e.name === n)
const bySymbol = (s) => ELEMENTS.find((e) => e.symbol === s)
const kindOf = (e) => (e.cat === 'metalloid' ? 'polokov' : ['nonmetal', 'halogen', 'noble'].includes(e.cat) ? 'nekov' : 'kov')

const asked = () => p.locator('.el-ask b').first().textContent()
const optionText = (page, text) => page.locator('.el-opts .opt').filter({ hasText: new RegExp(`(^|\\d)${text.replace(/[()]/g, '\\$&')}$`) })

/** The right answer of the question on screen: the option to tap, or the Z of the cell to tap. */
async function rightAnswer(mode) {
  if (mode === 'poznej') return p.evaluate(() => Number(document.querySelector('.periodic-el.pick')?.dataset.z))
  const q = (await asked()).trim()
  if (mode === 'znacky') return byName(q).symbol
  if (mode === 'nazvy') return bySymbol(q).name
  if (mode === 'druh') return kindOf(byName(q.replace(/\s+\S+$/, '')))
  return byName(q).z
}

/** Waits for question i + 1 (after a right answer the game moves on by itself) or the result. */
const waitNext = async (i) => p.waitForFunction((i) => [...document.querySelectorAll('.steps-meter i')].findIndex((x) => x.classList.contains('now')) === i + 1 || !!document.querySelector('.result'), i)

/** Plays a round; the first question is answered wrong. Returns the number of questions. */
async function play(set, mode) {
  await p.goto(`${base}/periodicka-tabulka/${set}/${mode}`)
  await p.waitForSelector('.steps-meter')
  const n = await p.locator('.steps-meter i').count()
  for (let i = 0; i < n; i++) {
    const right = await rightAnswer(mode)
    if (mode === 'najdi') {
      if (i === 0) {
        // Three wrong taps: the game names each tapped element, then shows the right one.
        const wrong = await p.evaluate((z) => [...document.querySelectorAll('.periodic-el')].map((b) => Number(b.dataset.z)).filter((x) => x !== z).slice(0, 3), right)
        for (const [k, w] of wrong.entries()) {
          await p.locator(`.periodic-el[data-z="${w}"]`).tap()
          if (k === 0) {
            await p.waitForSelector('.el-say.bad')
            const said = await p.locator('.el-say').textContent()
            const e = ELEMENTS[w - 1]
            check(said === `To je ${e.symbol} – ${e.name}`, `${mode}: a wrong tap names the element (${said})`)
            check(await p.locator('.map-tries').textContent() === 'ještě 2 pokusy', `${mode}: tries left shown`)
          }
          await p.waitForTimeout(120)
        }
        await p.waitForSelector('.periodic-el.show')
        check(await p.locator(`.periodic-el.show[data-z="${right}"]`).count() === 1, `${mode}: the answer is shown after the third miss`)
        await shot(p, `${set}-${mode}-shown`)
        await p.locator('.map-next button').tap()
      } else {
        await p.locator(`.periodic-el[data-z="${right}"]`).tap()
      }
    } else if (mode === 'poznej') {
      const e = ELEMENTS[right - 1]
      if (i === 0) {
        await p.locator('.el-opts .opt').filter({ hasNotText: `${e.name} (${e.symbol})` }).first().tap()
        await p.waitForSelector('.map-next button')
        check(await p.locator('.el-opts .opt.ok').textContent().then((t) => t.endsWith(`${e.name} (${e.symbol})`)), `${mode}: the right option is marked`)
        check(await p.locator(`.periodic-el.show[data-z="${right}"] b`).textContent() === e.symbol, `${mode}: the cell shows its symbol after the answer`)
        await shot(p, `${set}-${mode}-wrong`)
        await p.locator('.map-next button').tap()
      } else {
        await optionText(p, `${e.name} (${e.symbol})`).tap()
      }
    } else {
      if (i === 0) {
        await p.locator('.el-opts .opt').filter({ hasNotText: new RegExp(`(^|\\d)${right}$`) }).first().tap()
        await p.waitForSelector('.map-next button')
        check(await p.locator('.el-fact').count() === 1, `${mode}: a wrong answer shows the element's facts`)
        await shot(p, `${set}-${mode}-wrong`)
        await p.locator('.map-next button').tap()
      } else {
        await optionText(p, right).tap()
      }
    }
    await waitNext(i)
  }
  await p.waitForSelector('.result')
  return n
}

await p.evaluate(() => localStorage.removeItem('sprtam:prvky'))
for (const [set, mode] of [['zaklad', 'znacky'], ['zs', 'nazvy'], ['zaklad', 'najdi'], ['zs', 'poznej'], ['zs', 'druh'], ['vse', 'najdi']]) {
  const n = await play(set, mode)
  const pct = await p.locator('.result .pct').textContent()
  check(n === 10 && pct.startsWith(`${n - 1} / ${n} napoprvé · 90 %`), `${set}/${mode}: a round of 10 with one mistake → ${pct}`)
  check(await p.locator('.result .mistakes .card').count() === 1, `${set}/${mode}: the mistake is listed`)
  if (set === 'zaklad' && mode === 'znacky') {
    check(await p.locator('.goal-done').count() === 1, 'the first result is a record')
    await shot(p, 'result')
    await p.getByRole('button', { name: /Procvičit chyby \(1\)/ }).tap()
    check(await p.locator('.steps-meter i').count() === 1, 'practising the mistakes asks only the missed element')
    await optionText(p, await rightAnswer('znacky')).tap()
    await p.waitForSelector('.result')
    check((await p.locator('.result .pct').textContent()).startsWith('1 / 1'), 'the mistake practised')
    // Opened directly, „Hotovo“ goes to the page of the set (not to /periodicka-tabulka/zaklad, which has no page).
    await p.getByRole('button', { name: 'Hotovo' }).tap()
    await p.waitForSelector('.el-list')
    check(new URL(p.url()).pathname + new URL(p.url()).search === '/periodicka-tabulka?sada=zaklad', `„Hotovo“ of a game opened directly goes to its set (${p.url()})`)
  }
}
const saved = JSON.parse(await p.evaluate(() => localStorage.getItem('sprtam:prvky')))
check(saved['zaklad/znacky'] === 90 && saved['vse/najdi'] === 90 && Object.keys(saved).length === 6, `records saved per set and mode (${JSON.stringify(saved)})`)

// The blind table of all 118 elements scrolls sideways on a phone; a cell is big enough to tap.
await p.goto(`${base}/periodicka-tabulka/vse/najdi`)
await p.waitForSelector('.periodic-el')
const cell = await p.locator('.periodic-el[data-z="26"]').boundingBox()
check(cell.width >= 28 && cell.height >= 30, `a cell of the whole table is big enough on a phone (${Math.round(cell.width)}×${Math.round(cell.height)})`)
check(await p.evaluate(() => document.querySelector('.el-table').scrollWidth > document.querySelector('.el-table').clientWidth), 'the whole table scrolls sideways on a phone')
check(await p.locator('.periodic-el b').count() === 0, 'the blind table shows no symbols before an answer')
await shot(p, 'vse-najdi')

// Explore: the sets, the table with details, an element from the list opens in the table.
await p.goto(`${base}/periodicka-tabulka`)
await p.waitForSelector('.periodic-grid')
check(await p.locator('.periodic-el').count() === 118 && await p.locator('.el-item').count() === 41, 'the default set: whole table, 41 elements from primary school in the list')
await p.getByRole('radio', { name: '20 prvků' }).tap()
await p.waitForFunction(() => document.querySelectorAll('.periodic-el').length === 20)
check(new URL(p.url()).search === '?sada=zaklad', 'the chosen set is in the address')
check(await p.locator('.el-item').count() === 20, 'the list shows the 20 elements')
await p.locator('.el-item').filter({ hasText: 'sodík' }).tap()
await p.waitForSelector('.periodic-detail .periodic-name')
check(await p.locator('.periodic-detail .periodic-name').textContent() === 'sodík', 'an element from the list opens its details in the table')
await p.locator('.periodic-grid .periodic-el').filter({ hasText: 'Mg' }).tap()
await p.waitForFunction(() => document.querySelector('.periodic-detail .periodic-name')?.textContent === 'hořčík')
await p.locator('.el-item').filter({ hasText: 'sodík' }).tap()
await p.waitForFunction(() => document.querySelector('.periodic-detail .periodic-name')?.textContent === 'sodík', null, { timeout: 3000 }).catch(() => {})
check(await p.locator('.periodic-detail .periodic-name').textContent() === 'sodík', 'the same element from the list opens again after a tap in the table')
check(await p.locator('.map-mode').first().getAttribute('href') === '/periodicka-tabulka/zaklad/znacky', 'games of the chosen set')
check(await p.locator('.map-mode .stars').count() === 2, 'records of the set shown at its games')
await p.getByRole('radio', { name: 'všechny prvky' }).tap()
check((await p.locator('.map-mode').first().getAttribute('href')).endsWith('?vse') && (await p.locator('.map-mode small').first().textContent()).includes('20 otázek'), 'all the elements of the set as one round')
await p.reload()
await p.waitForFunction(() => document.querySelectorAll('.periodic-el').length === 20)
check(true, 'the set survives a reload')
await shot(p, 'explore')
await p.goto(`${base}/`)
await p.locator('a[href="/periodicka-tabulka"]').first().tap()
await p.waitForSelector('.el-list')
check(true, 'the home screen leads to the game')
await p.goto(`${base}/periodicka-tabulka/nic/znacky`)
check(await p.locator('.empty').count() === 1, 'an unknown set says so')

// A computer: keys 1–4 answer, Enter goes on; dark theme.
const desk = await browser.newContext({ viewport: { width: 1280, height: 860 } })
const d = await desk.newPage()
await d.addInitScript(() => localStorage.setItem('sprtam-theme', 'dark'))
watch(d)
await d.goto(`${base}/periodicka-tabulka/zs/znacky`)
await d.waitForSelector('.el-opts .opt')
check(await d.locator('.el-opts .key-hint').count() === 4, 'key hints on a computer')
const q = (await d.locator('.el-ask b').textContent()).trim()
const wrongKey = await d.evaluate((sym) => [...document.querySelectorAll('.el-opts .opt')].findIndex((o) => !o.textContent.endsWith(sym)) + 1, byName(q).symbol)
await d.keyboard.press(String(wrongKey))
await d.waitForSelector('.map-next button')
await shot(d, 'dark-wrong')
await d.keyboard.press('Enter')
await d.waitForFunction(() => !document.querySelector('.map-next'))
check(await d.locator('.steps-meter i.bad').count() === 1, 'a key answers, Enter goes on')
await d.goto(`${base}/periodicka-tabulka/vse/poznej`)
await d.waitForSelector('.periodic-el.pick')
const box = await d.locator('.el-table').boundingBox()
check(box.width > 700 && await d.evaluate(() => document.querySelector('.el-table').scrollWidth <= document.querySelector('.el-table').clientWidth + 1), 'the whole table fits a computer screen without scrolling')
await shot(d, 'dark-poznej')

check(errors.length === 0, `no errors in the console${errors.length ? `: ${errors.join(' | ')}` : ''}`)
await browser.close()
console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
