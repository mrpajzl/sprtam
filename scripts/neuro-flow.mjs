// Neuronová síť in a real browser: drawing on the pad with a finger and the mouse, teaching the network all four
// shapes, the learning curve and the moment it got it, guessing a new drawing without any tap, saving across a
// reload, taking an example back, forgetting everything, the link from a topic, the keyboard and the dark theme.
//   node scripts/neuro-flow.mjs [base]   (default http://127.0.0.1:5193, the dev server: npx vite --port 5193 --host 127.0.0.1)
// SHOTS=<dir> saves screenshots there.
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://127.0.0.1:5193'
const shots = process.env.SHOTS
let failed = 0
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed++ }

const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
const watch = (p) => {
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => m.type() === 'error' && !/font|woff|403|Failed to load resource/i.test(m.text()) && errors.push(m.text()))
}
const shot = async (page, name) => { if (!shots) return; await page.waitForTimeout(300); await page.screenshot({ path: `${shots}/nn-${name}.png`, fullPage: true }) }

// A shape as a hand draws it: random size and place, a little shake; rectangles 2× wider (or taller).
let seed = 7
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
function hand(shape) {
  const size = 0.35 + rnd() * 0.4, cx = 0.35 + rnd() * 0.3, cy = 0.35 + rnd() * 0.3
  const pts = []
  const line = (a, b) => { for (let i = 0; i <= 10; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / 10, a[1] + ((b[1] - a[1]) * i) / 10]) }
  const poly = (c) => c.forEach((p, i) => line(p, c[(i + 1) % c.length]))
  if (shape === 0) poly([[0, -0.5], [0.5, 0.4], [-0.5, 0.4]])
  else if (shape === 1) poly([[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]])
  else if (shape === 2) for (let i = 0; i <= 40; i++) { const t = (i / 40) * Math.PI * 2; pts.push([Math.cos(t) * 0.5, Math.sin(t) * 0.5]) }
  else { const h = 0.22 + rnd() * 0.06; const c = [[-0.5, -h], [0.5, -h], [0.5, h], [-0.5, h]]; poly(rnd() < 0.3 ? c.map(([x, y]) => [y, x]) : c) }
  return pts.map(([x, y]) => [cx + x * size + (rnd() - 0.5) * 0.01, cy + y * size + (rnd() - 0.5) * 0.01])
}

/** Draws with the mouse (pointer events) on the pad. */
async function draw(page, pts) {
  await page.locator('.nn-pad canvas').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  const box = await page.locator('.nn-pad canvas').boundingBox()
  const at = ([x, y]) => [box.x + x * box.width, box.y + y * box.height]
  await page.mouse.move(...at(pts[0]))
  await page.mouse.down()
  for (const p of pts.slice(1)) await page.mouse.move(...at(p))
  await page.mouse.up()
  await page.waitForTimeout(40)
}
const lcd = (page) => page.locator('.nn-lcd b').textContent()
const taughtCount = (page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('sprtam:neuronka')).t.length } catch { return 0 } })

// ——— Phone ———
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await phone.newPage()
watch(p)
await p.goto(`${base}/neuronova-sit`)
await p.waitForFunction(() => document.querySelector('.nn-lcd b')?.textContent === 'Nakresli tvar')
check(await p.locator('.nn-shape').count() === 4, 'four shape keys')
check(await p.locator('.nn-curve svg').count() === 1 && await p.locator('.nn-net svg').count() === 1, 'learning curve and network diagram')
const scroll = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
check(scroll, 'no sideways scroll on a phone')
await shot(p, 'empty')

await p.locator('.nn-shape').nth(2).click()
check(/Nejdřív nakresli/.test(await p.locator('.nn-said').textContent()), 'naming an empty pad asks for a drawing first')

// A finger draws too (touch events become pointer events).
await p.locator('.nn-pad canvas').evaluate((el) => el.scrollIntoView({ block: 'center' }))
const box = await p.locator('.nn-pad canvas').boundingBox()
const cdp = await phone.newCDPSession(p)
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: box.x + x * box.width, y: box.y + y * box.height }] })
await touch('touchStart', 0.3, 0.3)
for (let i = 1; i <= 10; i++) await touch('touchMove', 0.3 + i * 0.04, 0.3 + i * 0.03)
await touch('touchEnd')
await p.waitForTimeout(100)
check(await p.locator('.nn-pad-hint').count() === 0 && (await lcd(p)) !== 'Nakresli tvar', 'a finger draws on the pad and the network guesses')
await p.locator('.nn-clear').click()
check(await p.locator('.nn-pad-hint').count() === 1, 'Smazat kresbu empties the pad')

// Teach: 6 rounds of all four shapes in a mixed order.
const order = [0, 1, 2, 3, 2, 0, 3, 1, 1, 3, 0, 2, 3, 2, 1, 0, 0, 2, 1, 3, 2, 3, 0, 1]
for (const [i, shape] of order.entries()) {
  await draw(p, hand(shape))
  if (i === 1) await shot(p, 'drawing')
  await p.locator('.nn-shape').nth(shape).click()
  await p.waitForFunction((n) => { try { return JSON.parse(localStorage.getItem('sprtam:neuronka')).t.length === n } catch { return false } }, i + 1, { timeout: 5000 }).catch(async (e) => { console.log('  said:', await p.locator('.nn-said').textContent(), await lcd(p)); throw e })
}
check(await taughtCount(p) === order.length, `${order.length} examples saved`)
check(await p.locator('.nn-curve rect.ok, .nn-curve rect.bad').count() === order.length, 'one bar per example on the curve')
const got = await p.locator('.nn-curve .got').count()
check(got === 1, 'the curve marks when the network got it')
console.log(`  ${await p.locator('.nn-curve p').textContent()}`)
check((await p.locator('.nn-shape small').allTextContents()).join(' ') === '6× 6× 6× 6×', 'every key counts its examples')
await shot(p, 'taught')

// Guessing without a tap: draw, read the display.
let right = 0
for (const shape of [2, 0, 3, 1, 2, 0, 3, 1]) {
  await draw(p, hand(shape))
  const text = await lcd(p)
  const name = ['trojúhelník', 'čtverec', 'kruh', 'obdélník'][shape]
  if (text.includes(name)) right++
  await p.locator('.nn-clear').click()
}
check(right >= 6, `the network names new drawings by itself (${right}/8)`)
await draw(p, hand(2))
check(await p.locator('.nn-shape.guess').count() === 1, 'the guessed shape key is marked')
check(await p.locator('.nn-net .px').count() > 10, 'the diagram shows what the network sees')
await shot(p, 'guess')

// Saving across a reload
await p.reload()
await p.waitForFunction(() => document.querySelector('.nn-lcd b')?.textContent === 'Kresli')
check(await p.locator('.nn-curve rect.ok, .nn-curve rect.bad').count() === order.length, 'after a reload the examples are back')
await draw(p, hand(2))
check((await lcd(p)).includes('kruh'), 'and the network learned them again')
await p.locator('.nn-clear').click()

// Take back, forget
await p.getByRole('button', { name: 'Vzít zpět poslední příklad' }).click()
check(await taughtCount(p) === order.length - 1, 'Vzít zpět removes the last example')
await p.getByRole('button', { name: 'Vymazat síť' }).click()
check(await p.locator('.nn-confirm').count() === 1, 'Vymazat síť asks first')
await p.getByRole('button', { name: 'Nechat' }).click()
check(await taughtCount(p) === order.length - 1, 'Nechat keeps everything')
await p.getByRole('button', { name: 'Vymazat síť' }).click()
await p.locator('.nn-danger').click()
check(await p.evaluate(() => localStorage.getItem('sprtam:neuronka')) === null, 'Vymazat forgets everything')
check(await p.locator('.nn-curve rect.ok, .nn-curve rect.bad').count() === 0 && await p.locator('.nn-curve .got').count() === 0, 'and the curve is empty')

// Games list and a topic link to it
await p.goto(`${base}/hry`)
check(await p.locator('a.extra-key[href="/neuronova-sit"]').count() === 1, 'Hry lists Neuronová síť')
await p.goto(`${base}/g/z8/prirodopis/nervy-smysly`)
await p.waitForSelector('.topic-extra', { timeout: 15000 }).catch(() => {})
check(await p.locator('.topic-extra a[href="/neuronova-sit"]').count() === 1, 'the topic Nervová soustava links the game')

// ——— Computer: keyboard and the dark theme ———
const desk = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' })
const d = await desk.newPage()
watch(d)
await d.addInitScript(() => localStorage.setItem('sprtam-theme', 'dark'))
await d.goto(`${base}/neuronova-sit`)
await d.waitForFunction(() => document.querySelector('.nn-lcd b')?.textContent === 'Nakresli tvar')
await draw(d, hand(1))
await d.keyboard.press('2')
check(await taughtCount(d) === 1, 'key 2 names the drawing a square')
await draw(d, hand(3))
await d.keyboard.press('Escape')
check(await d.locator('.nn-pad-hint').count() === 1, 'Escape empties the pad')
await draw(d, hand(3))
await shot(d, 'dark')

check(!errors.length, `no errors${errors.length ? `: ${errors.join(' | ')}` : ''}`)
await browser.close()
console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
