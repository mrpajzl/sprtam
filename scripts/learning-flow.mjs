// The learning loop in a real browser: a quiz with a wrong answer and a hint, the mistake in Sešit chyb and on the
// home screen, a review round that clears it, the overview, the daily goal and a report of a mistake in the content.
//   node scripts/learning-flow.mjs [baseUrl]   (a built server with content, e.g. as in scripts/report-test.mjs)
//   SHOTS=1 also saves screenshots to /tmp/sprtam-shots (light and dark).
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'

const base = (process.argv[2] ?? 'http://localhost:8080').replace(/\/$/, '')
const dir = `${homedir()}/Library/Caches/ms-playwright/` + readdirSync(`${homedir()}/Library/Caches/ms-playwright`).find((d) => d.startsWith('chromium-'))
const exe = process.env.CHROME ?? `${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const browser = await chromium.launch({ executablePath: exe })
const shots = process.env.SHOTS ? '/tmp/sprtam-shots' : null
if (shots) mkdirSync(shots, { recursive: true })

let failed = 0
const check = (ok, what) => { console.log(ok ? '✓' : '✗', what); if (!ok) failed++ }
const day = Math.floor(Date.now() / 86_400_000)

for (const scheme of shots ? ['light', 'dark'] : ['light']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|Loading the font 'data:/.test(m.text()) && errors.push(m.text()))
  const shot = async (name) => { if (!shots) return; await page.waitForTimeout(600); await page.screenshot({ path: `${shots}/${name}-${scheme}.png` }) }
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('sprtam:progress') ?? '{}'))

  // A streak with a missed day the day before yesterday (forgiven), and the dark theme where asked.
  await page.goto(base + '/')
  await page.evaluate(({ day, dark }) => {
    localStorage.setItem('sprtam:progress', JSON.stringify({ v: 1, g: 'z5', t: {}, w: {}, a: [day - 5, day - 4, day - 3, day - 1] }))
    if (dark) localStorage.setItem('sprtam-theme', 'dark')
  }, { day, dark: scheme === 'dark' })
  await page.reload()
  await page.waitForSelector('.display')
  check((await page.locator('.streak b').textContent()) === '4', `${scheme}: a missed day is forgiven in the streak`)
  check(await page.locator('.leds i.frz').count() === 1, `${scheme}: the forgiven day shows as a frozen LED`)
  check((await page.locator('.goal small').textContent()) === 'dnes 0/20', `${scheme}: the daily goal on the display`)
  check(await page.locator('.next a[href="/dnes"], .next a[href="/chyby"]').count() === 0, `${scheme}: nothing to review before any mistake`)

  // Quick quiz of a topic: the first question wrong on purpose, the rest answered somehow.
  await page.goto(base + '/g/z5/matematika/zlomky/kviz')
  await page.waitForSelector('.question')
  let wrongText = '', reportable = 0, reported = scheme !== 'light'
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('.question')
    const q = await page.locator('h2.question').innerText()
    const wrong = i === 0
    if (await page.locator('.answer-input').count()) {
      if (!wrong && await page.locator('.hint-key').count()) { await page.click('.hint-key'); check(await page.locator('.hint').count() === 1, `${scheme}: a hint opens before answering`); if (scheme === 'light') await shot('hint') }
      await page.fill('.answer-input', wrong ? 'nevím' : '1')
      await page.click('form button[type=submit]')
    } else if (await page.locator('.tf .opt').count()) await page.locator('.tf .opt').first().click()
    else if (await page.locator('.opts .opt').count()) await page.locator('.opts .opt').first().click()
    else if (await page.locator('.order').count()) await page.click('.stack > .btn')
    else { const left = page.locator('.pairs .col').first().locator('.opt'); const n = await left.count(); for (let k = 0; k < n; k++) { await left.nth(k).click(); for (const b of await page.locator('.pairs .col').nth(1).locator('.opt:not(.done)').all()) { await b.click(); if (await left.nth(k).evaluate((e) => e.classList.contains('done'))) break; await left.nth(k).click() } } }
    await page.waitForSelector('.sheet')
    const bad = await page.locator('.sheet.bad').count()
    if (bad && !wrongText) wrongText = q
    if (i === 0 && bad) await shot('sheet-wrong')
    // Questions of the content can be reported; generated maths examples cannot (they are code).
    if (await page.locator('.sheet .report-key').count()) reportable++
    if (!reported && scheme === 'light' && await page.locator('.sheet .report-key').count()) {
      reported = true
      await page.click('.sheet .report-key')
      await page.waitForSelector('dialog.report-sheet[open]')
      check(await page.locator('.report-sheet .btn[type=submit]').isDisabled(), 'report: sending needs a reason')
      await page.click('.report-reason >> nth=0')
      await page.fill('.report-note textarea', 'Test z learning-flow.mjs')
      await shot('report')
      await page.click('.report-sheet .btn[type=submit]')
      await page.waitForSelector('.report-done')
      check(true, 'report: sent and thanked')
      await page.click('.report-done .btn')
    }
    await page.click('.sheet .btn')
  }
  check(reportable > 0, `${scheme}: questions can be reported from the answer sheet (${reportable} of 5)`)
  await page.waitForSelector('.result')
  await shot('result')
  check(await page.locator('.goal-left, .goal-done').count() === 1, `${scheme}: the result shows the daily goal`)
  let p = await progress()
  const ids = Object.keys(p.q ?? {})
  check(ids.length >= 1 && ids.every((k) => k.startsWith('z5/matematika/zlomky#')), `${scheme}: answers are kept per question (${ids.length})`)
  check(p.x?.[0] === day && p.x[1] === 5, `${scheme}: five answers count for today`)

  // A sure mistake for the rest of the flow (the quiz may have mixed in generated questions without an id).
  if (!Object.values(p.q).some((v) => v.w > 0)) {
    await page.evaluate((id) => { const p = JSON.parse(localStorage.getItem('sprtam:progress')); p.q[id] = { b: 0, d: Math.floor(Date.now() / 86_400_000), w: 1 }; localStorage.setItem('sprtam:progress', JSON.stringify(p)) }, ids[0])
  }
  await page.goto(base + '/')
  await page.waitForSelector('.next a[href="/dnes"]')
  check(await page.locator('.hero-main[href="/dnes"]').count() === 1 && await page.locator('.next-chip[href="/chyby"]').count() === 1, `${scheme}: home offers Dnešní opakování first and Sešit chyb under it`)
  await shot('home')

  await page.click('.next-chip[href="/chyby"]')
  await page.waitForSelector('.mistakes-book .mistakes .card')
  check(await page.locator('.mistakes-book .mistakes .card').count() >= 1, `${scheme}: Sešit chyb lists the mistake with its answer`)
  await shot('chyby')
  await page.click('.mistakes-book .btn.block')
  await page.waitForSelector('.question')
  check((await page.locator('.timer').textContent()).endsWith(`/${await page.locator('.steps-meter i').count()}`), `${scheme}: a round of mistakes starts`)

  // Two right answers take it out of the book: set the box as if answered, then the book is empty.
  await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('sprtam:progress')); for (const v of Object.values(p.q)) v.b = 2; localStorage.setItem('sprtam:progress', JSON.stringify(p)) })
  await page.goto(base + '/chyby')
  await page.waitForSelector('.empty')
  check((await page.locator('.empty').textContent()).includes('prázdný'), `${scheme}: an emptied book says so`)

  await page.goto(base + '/prehled')
  await page.waitForSelector('.sub-row')
  check(await page.locator('.sub-row').count() >= 1 && await page.locator('.star-bar i.b0, .star-bar i.b1, .star-bar i.b2, .star-bar i.b3').count() >= 1, `${scheme}: the overview shows subjects with stars`)
  await shot('prehled')

  await page.goto(base + '/nastaveni')
  await page.click('text=40 odpovědí denně')
  p = await progress()
  check(p.o === 40, `${scheme}: the daily goal can be changed`)
  await page.goto(base + '/')
  await page.waitForSelector('.goal small')
  check((await page.locator('.goal small').textContent()) === 'dnes 5/40', `${scheme}: the display follows the new goal`)

  // Hints in the gallery example (content has none yet; generated maths questions do).
  await page.goto(base + '/widgety')
  await page.waitForSelector('.hint-key')
  check(await page.locator('.hint-key').count() >= 1, `${scheme}: the gallery example shows hints`)

  // Explanation report link on a topic.
  await page.goto(base + '/g/z5/matematika/zlomky')
  await page.waitForSelector('.topic-report .report-key')
  check(true, `${scheme}: an explanation can be reported`)
  check(!errors.length, `${scheme}: no errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}
await browser.close()
console.log(failed ? `${failed} failed` : 'all passed')
process.exit(failed ? 1 : 0)
