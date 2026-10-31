// Marks or words at the end of a Písemka (src/grading.ts) in a real browser: marks by default, words in the
// Waldorf school, the switch in Nastavení → Hodnocení, and another school bringing its own default back.
//   node scripts/grading-flow.mjs [baseUrl]   (a built server with content, e.g. as in scripts/report-test.mjs)
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
const TOPIC = '/g/z5/matematika/zlomky'

for (const scheme of shots ? ['light', 'dark'] : ['light']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|Loading the font 'data:/.test(m.text()) && errors.push(m.text()))
  const shot = async (name) => { if (!shots) return; await page.waitForTimeout(600); await page.screenshot({ path: `${shots}/${name}-${scheme}.png`, fullPage: true }) }
  const hint = async () => { await page.goto(base + TOPIC); await page.waitForSelector('.modes'); return page.locator(`.mode[href$="/pisemka"] small`).innerText() }
  const toggle = () => page.getByRole('switch', { name: /Známky v písemce/ })
  const settings = async () => { await page.goto(base + '/nastaveni'); await toggle().waitFor() }

  /** Answers a whole Písemka somehow and returns the result. */
  async function pisemka() {
    await page.goto(base + TOPIC + '/pisemka')
    await page.waitForSelector('.question')
    for (let i = 0; i < 40 && !(await page.locator('.result').count()); i++) {
      if (await page.locator('.answer-input').count()) { await page.fill('.answer-input', '1'); await page.click('form button[type=submit]') }
      else if (await page.locator('.tf .opt').count()) await page.locator('.tf .opt').first().click()
      else if (await page.locator('.opts .opt').count()) await page.locator('.opts .opt').first().click()
      else if (await page.locator('.order').count()) await page.click('.stack > .btn')
      else { const left = page.locator('.pairs .col').first().locator('.opt'); const n = await left.count(); for (let k = 0; k < n; k++) { await left.nth(k).click(); for (const b of await page.locator('.pairs .col').nth(1).locator('.opt:not(.done)').all()) { await b.click(); if (await left.nth(k).evaluate((e) => e.classList.contains('done'))) break; await left.nth(k).click() } } }
      await page.waitForTimeout(450)
    }
    await page.waitForSelector('.result')
    return { mark: await page.locator('.result .mark').count(), stars: await page.locator('.result .big-stars').count(), title: await page.locator('.result h2').innerText() }
  }

  await page.goto(base + '/')
  if (scheme === 'dark') await page.evaluate(() => localStorage.setItem('sprtam-theme', 'dark'))

  // A regular school: marks.
  check(await hint() === '10 otázek, známka', `${scheme}: Písemka promises a mark`)
  await settings()
  check(await toggle().getAttribute('aria-checked') === 'true', `${scheme}: marks are on by default`)
  let r = await pisemka()
  check(r.mark === 1 && /výborně|chvalitebně|dobře|dostatečně|nedostatečně/.test(r.title), `${scheme}: Písemka ends with a mark (${r.title})`)

  // Waldorf: words without asking.
  await page.evaluate(() => localStorage.setItem('sprtam-approach', 'waldorf'))
  check(await hint() === '10 otázek, slovní hodnocení', `${scheme}: in Waldorf Písemka promises words`)
  await settings()
  check(await toggle().getAttribute('aria-checked') === 'false', `${scheme}: in Waldorf marks are off by default`)
  check(/Waldorfská škola známky nedává/.test(await page.locator('.settings').innerText()), `${scheme}: Settings say why`)
  await shot('grading-settings')
  r = await pisemka()
  check(r.mark === 0 && r.stars > 0 && r.title.length > 15, `${scheme}: Písemka ends with words and stars (${r.title})`)
  await shot('grading-words')

  // The child turns marks on in Waldorf…
  await settings()
  await toggle().click()
  check(await toggle().getAttribute('aria-checked') === 'true', `${scheme}: marks can be turned on`)
  check(await hint() === '10 otázek, známka', `${scheme}: …and Písemka promises a mark again`)
  r = await pisemka()
  check(r.mark === 1, `${scheme}: …and ends with one`)

  // …and off again in a regular school.
  await page.evaluate(() => localStorage.removeItem('sprtam-approach'))
  await settings()
  check(await toggle().getAttribute('aria-checked') === 'true', `${scheme}: another school brings its own default back`)
  await toggle().click()
  check(await toggle().getAttribute('aria-checked') === 'false', `${scheme}: marks can be turned off in a regular school`)
  r = await pisemka()
  check(r.mark === 0, `${scheme}: Písemka then ends without a mark`)
  await page.reload()
  await page.waitForSelector('.result, .question')
  check(await page.evaluate(() => localStorage.getItem('sprtam-hodnoceni')) === '{"g":"verbal"}', `${scheme}: the choice is kept with no approach`)

  check(errors.length === 0, `${scheme}: no errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

await browser.close()
console.log(failed ? `${failed} ✗` : 'all ✓')
process.exit(failed ? 1 : 0)
