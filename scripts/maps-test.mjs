// Slepá mapa in a real browser: plays whole rounds of every mode by touch, tries a wrong tap, the result and the
// record, the explore page, and panning and zooming with a mouse.
//   node scripts/maps-test.mjs [base]   (default http://127.0.0.1:5179, the dev server: npx vite --port 5179 --host 127.0.0.1)
// SHOTS=1 saves screenshots to /tmp/sprtam-maps-*.png.
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

const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await phone.newPage()
watch(p)

/** A screen point inside the place (its own path or dot, not a neighbour or an enclave). */
async function pointIn(page, id) {
  return page.evaluate((id) => {
    const els = [...document.querySelectorAll(`.map [data-id="${id}"]`)]
    for (const el of els.reverse()) {
      const r = el.getBoundingClientRect()
      for (let i = 1; i < 40; i++) for (let j = 1; j < 40; j++) {
        const x = r.left + (r.width * i) / 40, y = r.top + (r.height * j) / 40
        if (document.elementFromPoint(x, y) === el) return { x, y }
      }
    }
    return null
  }, id)
}

/** id of a place by its Czech name or capital (the app's own data, served by Vite). */
const idOf = (page, map, text, by) => page.evaluate(async ([map, text, by]) => {
  const { STATES, REGIONS } = await import('/src/maps/places.ts')
  return Object.entries(map === 'kraje' ? REGIONS : STATES).find(([, v]) => v[by] === text)?.[0]
}, [map, text, by])

/** A point in the place: zooms in on it when it is hidden under its neighbours, out when it is out of view. */
async function reach(page, id) {
  for (let i = 0; i < 8; i++) {
    const at = await pointIn(page, id)
    if (at) return at
    const where = await page.evaluate((id) => {
      const m = document.querySelector('.map').getBoundingClientRect()
      const r = document.querySelector(`.map [data-id="${id}"]`).getBoundingClientRect()
      const x = r.left + r.width / 2, y = r.top + r.height / 2
      return x > m.left && x < m.right && y > m.top && y < m.bottom ? { x, y } : null
    }, id)
    if (where) { await page.mouse.move(where.x, where.y); await page.mouse.wheel(0, -500) }
    else await page.locator('.map-zoom button[aria-label="Oddálit"]').click()
    await page.waitForTimeout(80)
  }
  return null
}

async function play(page, map, mode, { wrongFirst = false } = {}) {
  await page.goto(`${base}/slepa-mapa/${map}/${mode}`)
  await page.waitForSelector('.map svg path')
  await page.waitForTimeout(400) // fonts settle the layout
  for (let k = 0; k < 40; k++) {
    if (await page.locator('.result').count()) return true
    let tapped = null
    if (mode === 'poznej') {
      const opts = page.locator('.map-opts .opt')
      await opts.first().waitFor()
      const id = await page.evaluate(() => document.querySelector('.map .pick')?.getAttribute('data-id'))
      const name = await page.evaluate(async (id) => { const { STATES, REGIONS } = await import('/src/maps/places.ts'); return ({ ...STATES, ...REGIONS })[id]?.name }, id)
      await opts.filter({ hasText: new RegExp(`^${name}$`) }).click()
    } else {
      const text = await page.locator('.map-ask b').textContent()
      const id = await idOf(page, map, text, mode === 'mesta' ? 'capital' : 'name')
      if (!id) { check(false, `${map}/${mode}: no place for „${text}“`); return false }
      if (wrongFirst && k === 0) {
        const other = await page.evaluate((id) => [...document.querySelectorAll('.map path.p')].map((e) => e.getAttribute('data-id')).find((x) => x !== id), id)
        const at = await pointIn(page, other)
        await page.touchscreen.tap(at.x, at.y)
        await page.waitForSelector('.map-tag.bad')
        check(/^To je /.test(await page.locator('.map-tag').textContent()), 'a wrong tap names the place tapped')
        check(/pokus/.test(await page.locator('.map-tries').textContent()), 'the tries left are shown')
      }
      const at = await reach(page, id)
      if (!at) { check(false, `${map}/${mode}: ${id} not tappable`); return false }
      await page.touchscreen.tap(at.x, at.y)
      tapped = { id, at, text }
    }
    await page.waitForFunction((k) => document.querySelectorAll('.steps-meter i.ok, .steps-meter i.half, .steps-meter i.bad').length > k || document.querySelector('.result'), k, { timeout: 5000 }).catch(async (e) => {
      // What is under the finger now, for a failure that is hard to reproduce.
      const now = tapped && await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.getAttribute('data-id'), tapped.at)
      console.log(`✗ ${map}/${mode}: tapped ${JSON.stringify(tapped)}, now under the finger: ${now}`)
      await page.screenshot({ path: '/tmp/sprtam-maps-fail.png' })
      throw e
    })
    if (await page.locator('.map-next .btn').count()) await page.locator('.map-next .btn').click()
    // The right answer stays on screen for a moment before the next question.
    await page.waitForFunction((k) => document.querySelector('.result') || [...document.querySelectorAll('.steps-meter i')].findIndex((i) => i.classList.contains('now')) === k + 1, k)
  }
  return !!(await page.locator('.result').count())
}

// Home screen entry and the list of maps.
await p.goto(`${base}/`)
await p.evaluate(() => localStorage.removeItem('sprtam:mapy'))
await p.locator('a[href="/slepa-mapa"]').first().click()
await p.waitForSelector('.map-row')
check((await p.locator('.map-row').count()) === 7, 'seven maps are listed')
if (shots) await p.screenshot({ path: '/tmp/sprtam-maps-home.png' })

// Explore: tapping a place names it, the list selects places.
await p.goto(`${base}/slepa-mapa/kraje`)
await p.waitForSelector('.map svg path')
let at = await pointIn(p, 'CZ-JM')
await p.touchscreen.tap(at.x, at.y)
check((await p.locator('.map-tag').textContent()) === 'Jihomoravský kraj · Brno', 'tapping a region shows its name and seat')
await p.locator('.map-place', { hasText: 'Kraj Vysočina' }).click()
check((await p.locator('.map-tag').textContent()) === 'Kraj Vysočina · Jihlava', 'the list selects a region')
check((await p.locator('.map-place').count()) === 14, 'all 14 regions are listed')
if (shots) await p.screenshot({ path: '/tmp/sprtam-maps-explore.png', fullPage: true })

// Microstates on a phone: a tap on the dot of Monaco or San Marino picks it, not France or Italy around it.
await p.goto(`${base}/slepa-mapa/evropa`)
await p.waitForSelector('.map svg path')
await p.waitForTimeout(400)
const middle = (id) => p.evaluate((id) => { const r = document.querySelector(`.map [data-id="${id}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, id)
for (const [id, name] of [['MCO', 'Monako · Monako'], ['SMR', 'San Marino · San Marino'], ['VAT', 'Vatikán · Vatikán']]) {
  const m = await middle(id)
  await p.touchscreen.tap(m.x + 6, m.y + 5) // a finger is never exact
  check((await p.locator('.map-tag').textContent()) === name, `a tap next to ${name.split(' ·')[0]} picks it`)
}
at = await pointIn(p, 'FRA')
await p.touchscreen.tap(at.x, at.y)
check((await p.locator('.map-tag').textContent()) === 'Francie · Paříž', 'France itself is still tappable')
const vw = async () => Number((await p.locator('.map > svg').getAttribute('viewBox')).split(' ')[2])
const w0 = await vw()
for (let i = 0; i < 9; i++) { await p.locator('.map-zoom button[aria-label="Přiblížit"]').click(); await p.waitForTimeout(30) }
check(w0 / (await vw()) > 40, `the map zooms in far enough for Monaco (${Math.round(w0 / (await vw()))}×)`)

// Whole rounds by touch.
check(await play(p, 'kraje', 'najdi', { wrongFirst: true }), 'kraje/najdi: a round to the end')
const result = await p.locator('.result .pct').textContent()
check(/^9 \/ 10 napoprvé · 95 %/.test(result), `kraje/najdi: one place at the second try = 95 % (${result})`)
check(await p.locator('.result', { hasText: 'Nový rekord' }).count() === 1, 'the first round is a record')
const saved = await p.evaluate(() => localStorage.getItem('sprtam:mapy'))
check(JSON.parse(saved ?? '{}')['kraje/najdi'] === 95, `the record is saved in this device (${saved})`)
if (shots) await p.screenshot({ path: '/tmp/sprtam-maps-result.png' })
await p.locator('.result .btn', { hasText: 'Procvičit chyby (1)' }).click()
check((await p.locator('.steps-meter i').count()) === 1, 'practising the mistakes asks about just them')

check(await play(p, 'kraje', 'mesta'), 'kraje/mesta: a round to the end')
check(await play(p, 'evropa', 'poznej'), 'evropa/poznej: a round to the end')
check(await play(p, 'oceanie', 'najdi'), 'oceanie/najdi: tiny island states can be tapped')
check(await play(p, 'svet', 'mesta'), 'svet/mesta: a round to the end')
if (shots) await p.screenshot({ path: '/tmp/sprtam-maps-world.png' })

// Three wrong taps show the answer and wait for „Dál“.
await p.goto(`${base}/slepa-mapa/kraje/najdi`)
await p.waitForSelector('.map svg path')
const text = await p.locator('.map-ask b').textContent()
const target = await idOf(p, 'kraje', text, 'name')
const others = await p.evaluate((id) => [...document.querySelectorAll('.map path.p')].map((e) => e.getAttribute('data-id')).filter((x) => x !== id).slice(0, 3), target)
for (const o of others) { at = await pointIn(p, o); await p.touchscreen.tap(at.x, at.y); await p.waitForTimeout(80) }
await p.waitForSelector('.map-next .btn')
check((await p.locator('.map-tag').textContent()) === `Tohle je ${text}`, 'after three wrong taps the answer is shown')
check(await p.locator(`.map [data-id="${target}"].show`).count() === 1, 'the right region is highlighted')
check(await p.locator('.steps-meter i.bad').count() === 1, 'and counts as a miss')

// Mouse: drag pans, the wheel and buttons zoom, a drag is not a tap.
const desk = await browser.newContext({ viewport: { width: 1280, height: 860 } })
const d = await desk.newPage()
watch(d)
await d.goto(`${base}/slepa-mapa/svet/najdi`)
await d.waitForSelector('.map svg path')
const vb = () => d.locator('.map > svg').getAttribute('viewBox').then((s) => s.split(' ').map(Number))
const v0 = await vb()
const box = await d.locator('.map').boundingBox()
await d.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await d.mouse.wheel(0, -400)
await d.waitForTimeout(100)
const v1 = await vb()
check(v1[2] < v0[2], 'the wheel zooms in')
await d.mouse.down()
await d.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2 - 100, { steps: 6 })
await d.mouse.up()
const v2 = await vb()
check(v2[0] > v1[0] && v2[2] === v1[2], 'dragging pans')
check(await d.locator('.map-tag').count() === 0, 'a drag is not a tap')
await d.locator('.map-zoom button[aria-label="Celá mapa"]').click()
await d.waitForTimeout(500)
const v3 = await vb()
check(Math.abs(v3[2] - v0[2]) < 1, 'the button returns to the whole map')
if (shots) await d.screenshot({ path: '/tmp/sprtam-maps-desktop.png' })

check(errors.length === 0, `no errors in the console${errors.length ? `: ${errors.join(' | ')}` : ''}`)
await browser.close()
console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
