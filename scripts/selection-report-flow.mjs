// Reporting from marked words in a real browser: marking text in an explanation or a question shows the key
// „Nahlásit chybu“ under it, the selection (and so copying and sharing) stays as it is, the report carries the marked
// words to the content service, and text outside questions and explanations gets no key. Mouse and touch.
// Needs `npm run build` and content/ (npm run content:pull); starts scripts/content-stub.ts and the built server.
//   node scripts/selection-report-flow.mjs        SHOTS=1 also saves screenshots to /tmp/sprtam-shots
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = join(import.meta.dirname, '..')
const free = () => new Promise((r) => { const s = createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)) }) })
const [stubPort, port] = [await free(), await free()]
const TOKEN = 'test-report-token-0123456789-abcdefghij'
const data = mkdtempSync(join(tmpdir(), 'sprtam-selreport-'))
const procs = []
const start = (args, env, ready) => new Promise((r) => {
  const p = spawn(args[0], args.slice(1), { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'] })
  procs.push(p)
  p.stdout.on('data', (d) => { if (String(d).includes(ready)) r(p) })
})
const dir = `${homedir()}/Library/Caches/ms-playwright/` + readdirSync(`${homedir()}/Library/Caches/ms-playwright`).find((d) => d.startsWith('chromium-'))
const exe = process.env.CHROME ?? `${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const shots = process.env.SHOTS ? '/tmp/sprtam-shots' : null
if (shots) mkdirSync(shots, { recursive: true })

let failed = 0
const check = (ok, what) => { console.log(ok ? '✓' : '✗', what); if (!ok) failed++ }
const stubReports = async () => (await (await fetch(`http://localhost:${stubPort}/stub/reports`)).json()).map((r) => r.body)

// Marks the first `n` characters of the first longer text in `sel` from character `from` (as a long press or a drag would).
const mark = (page, sel, from = 0, n = 12) => page.evaluate(({ sel, from, n }) => {
  const root = document.querySelector(sel)
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.data.trim().length > from + n ? 1 : 3) })
  const t = walk.nextNode()
  const r = document.createRange()
  r.setStart(t, from); r.setEnd(t, from + n)
  getSelection().removeAllRanges(); getSelection().addRange(r)
  return getSelection().toString()
}, { sel, from, n })

const browser = await chromium.launch({ executablePath: exe })
try {
  await start(['node', '--import', 'tsx', 'scripts/content-stub.ts', String(stubPort)], { REPORT_TOKEN: TOKEN }, 'content stub on')
  await start(['node', 'dist-server/index.mjs'], { PORT: String(port), DATA_DIR: data, CONTENT_API: `http://localhost:${stubPort}`, REPORT_TOKEN: TOKEN }, 'Šprtám on')
  const base = `http://localhost:${port}`
  for (let i = 0; i < 100 && (await fetch(`${base}/api/content/manifest`)).status !== 200; i++) await new Promise((r) => setTimeout(r, 100))

  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, colorScheme: scheme })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|Loading the font 'data:/.test(m.text()) && errors.push(m.text()))
    await page.goto(base + '/')
    await page.evaluate((dark) => { localStorage.setItem('sprtam-theme', dark ? 'dark' : 'light') }, scheme === 'dark')

    // An explanation, marked with the mouse (a double click selects a word).
    await page.goto(base + '/g/z5/matematika/zlomky')
    await page.waitForSelector('.reportable p')
    const word = page.locator('.reportable p').first()
    const box = await word.boundingBox()
    await page.mouse.dblclick(box.x + 30, box.y + box.height / 2)
    const picked = await page.evaluate(() => getSelection().toString())
    check(await page.locator('.sel-report').waitFor({ timeout: 2000 }).then(() => true, () => false), `${scheme}: marking a word in an explanation shows the key`)
    const sel = await page.evaluate(() => { const r = getSelection().getRangeAt(0).getBoundingClientRect(); return { bottom: r.bottom, left: r.left, right: r.right } })
    const key = await page.locator('.sel-report').boundingBox()
    check(key && key.y >= sel.bottom + 8 && key.x < sel.right + 80 && key.x + key.width > sel.left - 80, `${scheme}: the key sits right under the marked words`)
    check((await page.evaluate(() => getSelection().toString())) === picked && picked.trim().length > 0, `${scheme}: the selection stays (copying and sharing work as usual)`)
    if (shots) await page.screenshot({ path: `${shots}/selection-key-${scheme}.png` })

    // Clicking somewhere else hides it, Escape too.
    await page.mouse.click(5, 790)
    check(await page.locator('.sel-report').waitFor({ state: 'detached', timeout: 1000 }).then(() => true, () => false), `${scheme}: clicking elsewhere hides the key`)
    await page.mouse.dblclick(box.x + 30, box.y + box.height / 2)
    await page.locator('.sel-report').waitFor({ timeout: 2000 })
    await page.keyboard.press('Escape')
    check(await page.locator('.sel-report').count() === 0, `${scheme}: Escape hides the key`)

    // Outside questions and explanations (the title bar) there is nothing to report.
    await mark(page, '.bar', 0, 4)
    await page.waitForTimeout(600)
    check(await page.locator('.sel-report').count() === 0, `${scheme}: text outside questions and explanations gets no key`)

    // The report carries the marked words.
    await page.mouse.dblclick(box.x + 30, box.y + box.height / 2)
    const quote = (await page.evaluate(() => getSelection().toString())).replace(/\s+/g, ' ').trim()
    await page.locator('.sel-report').click()
    await page.waitForSelector('dialog.report-sheet[open]')
    check((await page.locator('.report-quote mark').textContent()) === quote, `${scheme}: the dialog shows the marked words`)
    if (shots) await page.screenshot({ path: `${shots}/selection-dialog-${scheme}.png` })
    await page.locator('.report-reason').nth(2).click()
    await page.locator('.report-sheet .btn[type=submit]').click()
    await page.getByText('Díky, předáno!').waitFor({ timeout: 5000 })
    const last = (await stubReports()).at(-1)
    check(last?.quote === quote && last.target.kind === 'explanation' && last.topic === 'z5/matematika/zlomky' && last.reason === 'typo', `${scheme}: the report reaches moderation with the marked words`)
    await page.keyboard.press('Escape')

    check(errors.length === 0, `${scheme}: no errors in the console${errors.length ? `: ${errors.join(' | ')}` : ''}`)
    await ctx.close()
  }

  // A phone: marking by a long press (no pointer events to rely on), the key under the words, a tap on it.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await phone.newPage()
  // A quiz question with an index in the topic (generated maths examples have none and cannot be reported).
  let found = false
  for (let i = 0; i < 6 && !found; i++) {
    await page.goto(base + '/g/z5/cestina/zajmena/kviz')
    await page.waitForSelector('.question')
    await mark(page, '.question', 0, 5)
    found = await page.locator('.sel-report').waitFor({ timeout: 1500 }).then(() => true, () => false)
  }
  check(found, 'phone: marking words in a quiz question shows the key')
  if (found) {
    const covered = await page.evaluate(() => {
      const k = document.querySelector('.sel-report').getBoundingClientRect()
      return [...document.querySelectorAll('button:not(.sel-report), a, input')].some((b) => {
        const r = b.getBoundingClientRect()
        return r.width && k.left < r.right && k.right > r.left && k.top < r.bottom && k.bottom > r.top
      })
    })
    check(!covered, 'phone: the key covers no answer or other button')
  }
  if (found) {
    if (shots) await page.screenshot({ path: `${shots}/selection-key-phone.png` })
    await page.locator('.sel-report').tap()
    check(await page.locator('dialog.report-sheet[open] .report-quote').waitFor({ timeout: 2000 }).then(() => true, () => false), 'phone: a tap on the key opens the report with the marked words')
    check((await page.locator('.report-what small').first().textContent()) === 'Otázka', 'phone: it reports the question')
  }
  await phone.close()
} finally {
  await browser.close()
  procs.forEach((p) => p.kill())
  rmSync(data, { recursive: true, force: true })
}
console.log(failed ? `${failed} failed` : 'all passed')
process.exit(failed ? 1 : 0)
