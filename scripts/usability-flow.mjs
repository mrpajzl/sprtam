// Usability features in a real browser: reading settings, keyboard, an unfinished round, Ostrá simulace, a worksheet,
// Plán před písemkou with a calendar file, a daily reminder and profiles.
//   node scripts/usability-flow.mjs [baseUrl]   (a built server with content, e.g. as in scripts/report-test.mjs)
//   SHOTS=1 also saves screenshots to /tmp/sprtam-shots (light and dark).
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'

const base = (process.argv[2] ?? 'http://localhost:8080').replace(/\/$/, '')
const dir = `${homedir()}/Library/Caches/ms-playwright/` + readdirSync(`${homedir()}/Library/Caches/ms-playwright`).find((d) => d.startsWith('chromium-'))
const exe = process.env.CHROME ?? `${dir}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const browser = await chromium.launch({ executablePath: exe })
const shots = process.env.SHOTS ? '/tmp/sprtam-shots' : null
if (shots) mkdirSync(shots, { recursive: true })

let failed = 0
const check = (ok, what) => { console.log(ok ? '✓' : '✗', what); if (!ok) failed++ }
const TOPIC = '/g/z7/matematika/zlomky-zaklad'

for (const scheme of shots ? ['light', 'dark'] : ['light']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|Loading the font 'data:/.test(m.text()) && errors.push(m.text()))
  const shot = async (name) => { if (!shots) return; await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/${name}-${scheme}.png`, fullPage: true }) }
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('sprtam:progress') ?? '{}'))
  await page.goto(base + '/')
  if (scheme === 'dark') await page.evaluate(() => localStorage.setItem('sprtam-theme', 'dark'))

  // ——— Reading ———
  await page.goto(base + '/nastaveni')
  await page.getByRole('radio', { name: 'Větší písmo', exact: true }).click()
  await page.getByRole('switch', { name: /Písmo pro snadné čtení/ }).click()
  await page.getByRole('switch', { name: /Víc místa/ }).click()
  await shot('settings-reading')
  await page.reload()
  const root = await page.evaluate(() => ({ ...document.documentElement.dataset, size: getComputedStyle(document.documentElement).fontSize, family: getComputedStyle(document.body).fontFamily }))
  check(root.text === '1' && root.spacing === 'wide' && root.font === 'legible' && root.size === '18px' && /Atkinson/.test(root.family), `reading settings survive a reload before paint (${JSON.stringify(root)})`)
  await page.goto(base + TOPIC)
  await shot('topic-reading')
  await page.goto(base + '/nastaveni')
  await page.getByRole('radio', { name: 'Normální písmo', exact: true }).click()
  await page.getByRole('switch', { name: /Písmo pro snadné čtení/ }).click()
  await page.getByRole('switch', { name: /Víc místa/ }).click()
  check(await page.evaluate(() => localStorage.getItem('sprtam-reading') === null && !document.documentElement.dataset.text), 'back to normal leaves nothing stored')

  // ——— Keyboard and an unfinished round (Opakování: every question of the topic) ———
  await page.goto(base + TOPIC + '/opakovani')
  await page.waitForSelector('.question')
  let answeredByKey = 0
  for (let k = 0; k < 16 && answeredByKey < 2; k++) {
    await page.waitForTimeout(150)
    const kind = await page.evaluate(() => document.querySelector('.opts') ? 'choice' : document.querySelector('.tf') ? 'tf' : document.querySelector('.answer-input') ? 'input' : 'other')
    if (kind === 'choice' || kind === 'tf') { await page.keyboard.press('1'); answeredByKey++ }
    else if (kind === 'input') { await page.fill('.answer-input', '1'); await page.keyboard.press('Enter') }
    else { await page.locator('.stack .btn, .pairs .opt').first().click().catch(() => {}); if (!(await page.locator('.sheet').count())) break }
    await page.waitForSelector('.sheet', { timeout: 5000 }).catch(async () => { throw new Error(`no feedback after a ${kind} question: ${await page.locator('.page').innerHTML()}`) })
    await page.mouse.click(5, 120) // away from „Dál“: the key itself must work
    await page.waitForTimeout(150) // effects (the key listener) run after paint
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => !document.querySelector('.sheet'))
  }
  check(answeredByKey >= 1, `keys 1/2 answer, Enter goes on (${answeredByKey} by key)`)
  await page.evaluate(() => localStorage.setItem('sprtam-reading', '{"nokeys":true}'))
  await page.reload()
  await page.getByRole('button', { name: 'Pokračovat' }).click()
  for (let k = 0; k < 16 && !(await page.locator('.opts, .tf').count()); k++) {
    if (await page.locator('.answer-input').count()) { await page.fill('.answer-input', '1'); await page.keyboard.press('Enter') }
    else if (await page.locator('.stack .btn').count()) await page.locator('.stack .btn').first().click()
    else break
    await page.waitForSelector('.sheet .btn', { timeout: 3000 }).catch(() => {})
    if (await page.locator('.sheet .btn').count()) await page.locator('.sheet .btn').first().click()
    await page.waitForTimeout(150)
  }
  await page.keyboard.press('1')
  await page.waitForTimeout(300)
  check(!(await page.locator('.sheet').count()) && !(await page.locator('.key-hint').first().isVisible()), 'shortcuts turned off: a digit does nothing, no key hints')
  await page.evaluate(() => localStorage.removeItem('sprtam-reading'))
  const before = await page.locator('.qtop .timer').textContent()
  await page.reload()
  await page.waitForSelector('.resume-ask')
  await shot('resume-ask')
  await page.getByRole('button', { name: 'Pokračovat' }).click()
  const after = await page.locator('.qtop .timer').textContent()
  check(before === after, `a reload offers the round again and goes on at the same question (${before} → ${after})`)
  await page.goto(base + '/')
  await page.waitForSelector('.hero-main[href*="pokracovat"]')
  await shot('home-resume')
  check(/Pokračovat: /.test(await page.locator('.hero-main').textContent()), 'the home screen offers to carry on')
  await page.locator('.hero-main').click()
  await page.waitForSelector('.question')
  await page.waitForTimeout(150)
  const direct = [await page.locator('.resume-ask').count(), page.url(), await page.locator('.qtop .timer').textContent()]
  check(!direct[0] && !direct[1].includes('pokracovat') && direct[2] === after, `Pokračovat on the home screen resumes at once (${direct})`)
  await page.goto(base + '/')
  await page.getByRole('button', { name: 'Zahodit rozdělané kolo' }).click()
  check(!(await page.locator('.hero-main[href*="pokracovat"]').count()) && await page.evaluate(() => localStorage.getItem('sprtam:resume') === null), 'the round can be dropped')

  // ——— Ostrá simulace ———
  await page.goto(base + '/prijimacky/matematika')
  await shot('exam-part')
  await page.getByRole('link', { name: /Ostrá simulace/ }).click()
  await page.getByRole('button', { name: 'Začít test' }).click()
  await page.waitForSelector('.sim-grid')
  check((await page.locator('.sim-grid button').count()) === 30 && /(69|70):\d\d$/.test(await page.locator('.qtop .timer').textContent()), '30 questions and 70 minutes on the clock')
  await page.getByRole('button', { name: 'Přeskočit' }).click()
  check(await page.locator('.sim-grid button.now').textContent() === '2', 'skip goes to the next question')
  await shot('sim-question')
  for (let k = 0; k < 3; k++) {
    await page.waitForTimeout(150)
    const kind = await page.evaluate(() => document.querySelector('.opts') ? 'choice' : document.querySelector('.tf') ? 'tf' : document.querySelector('.answer-input') ? 'input' : 'other')
    if (kind === 'choice' || kind === 'tf') await page.keyboard.press('1')
    else if (kind === 'input') { await page.fill('.answer-input', '1'); await page.keyboard.press('Enter') }
    else await page.getByRole('button', { name: 'Přeskočit' }).click()
    await page.waitForTimeout(500)
  }
  const done = await page.locator('.sim-grid button.done').count()
  check(done >= 1 && done <= 3, `answered questions are marked in the grid (${done})`)
  await page.reload()
  await page.getByRole('button', { name: /Pokračovat · zbývá/ }).click()
  check((await page.locator('.sim-grid button.done').count()) === done, 'the simulation resumes with its answers')
  await page.getByRole('button', { name: 'Odevzdat test' }).click()
  await page.getByRole('button', { name: 'Odevzdat', exact: true }).click()
  await page.waitForSelector('.sim-points')
  await shot('sim-result')
  check(/bodů z 50/.test(await page.locator('.sim-points').textContent()) && (await page.locator('.sim-areas .row').count()) >= 8, 'result in points out of 50 and per area')
  check(/bez odpovědi/.test(await page.locator('.mistakes').textContent()), 'unanswered questions are listed')
  await page.waitForTimeout(300)
  check(await page.evaluate(() => localStorage.getItem('sprtam:resume') === null), 'a handed-in test is not offered again')

  // ——— Worksheet ———
  await page.goto(base + TOPIC)
  await page.getByRole('link', { name: /Pracovní list/ }).click()
  await page.waitForSelector('.ws-qs')
  check((await page.locator('.ws-qs > li').count()) === 10 && (await page.locator('.ws-solutions li').count()) === 10, 'a worksheet of 10 questions with solutions')
  await shot('worksheet')
  await page.getByRole('radio', { name: 'Všechny' }).click()
  const all = await page.locator('.ws-qs > li').count()
  check(all > 10, `all questions on paper (${all})`)
  await page.emulateMedia({ media: 'print' })
  const printed = await page.evaluate(() => [...document.querySelectorAll('.bar, .ws-controls')].every((e) => getComputedStyle(e).display === 'none') && getComputedStyle(document.querySelector('.worksheet')).display !== 'none')
  check(printed, 'printing shows only the sheet')
  if (shots) await page.pdf?.({ path: `${shots}/worksheet-${scheme}.pdf` }).catch(() => {})
  await page.emulateMedia({ media: 'screen' })

  // ——— Plán před písemkou (from a clean progress: the simulation above practised some of its topics today) ———
  await page.evaluate(() => localStorage.removeItem('sprtam:progress'))
  await page.goto(base + TOPIC)
  await page.getByRole('link', { name: /Píšu z toho písemku/ }).click()
  await page.waitForSelector('.plan-topics')
  check(await page.getByRole('checkbox', { checked: true }).count() === 1, 'the topic it came from is picked')
  await page.getByRole('checkbox', { checked: false }).nth(0).click()
  await page.getByRole('checkbox', { checked: false }).nth(0).click()
  await page.fill('input[type=date]', await page.evaluate(() => new Date(Date.now() + 4 * 86_400_000).toISOString().slice(0, 10)))
  await page.fill('.field input:not([type])', 'Písemka ze zlomků')
  await shot('plan-editor')
  await page.getByRole('button', { name: 'Vytvořit plán' }).click()
  await page.waitForSelector('.plan-head')
  await shot('plan-detail')
  const head = [await page.locator('.plan-head').textContent(), await page.locator('.sec .list .row').count()]
  check(/za 4 dny/.test(head[0]) && head[1] === 1, `the plan: in 4 days, one topic of three today (${head})`)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Přidat do kalendáře' }).click()])
  const ics = readFileSync(await download.path(), 'utf8')
  check(download.suggestedFilename().endsWith('.ics') && ics.includes('RRULE:FREQ=DAILY;UNTIL=') && ics.includes('SUMMARY:Písemka ze zlomků'), 'the plan goes to the calendar as an .ics file')
  const plans = (await progress()).k
  check(plans && Object.values(plans)[0].t.length === 3, 'the plan is kept in the progress')
  await page.goto(base + '/')
  await shot('home-plan')
  check(/Písemka ze zlomků/.test(await page.locator('.home-plans').textContent()), 'the home screen shows the plan')
  await page.locator('.home-plans a').click()
  await page.getByRole('link', { name: /Cvičná písemka/ }).click()
  await page.waitForSelector('.question')
  check(true, 'a practice test of the plan opens')

  // ——— Daily reminder ———
  await page.goto(base + '/nastaveni')
  const [rem] = await Promise.all([page.waitForEvent('download'), page.locator('.reminder button').click()])
  check(readFileSync(await rem.path(), 'utf8').includes('RRULE:FREQ=DAILY\r\n'), 'a daily reminder as an .ics file')

  // ——— Profiles ———
  const mine = JSON.stringify((await progress()).k)
  await page.getByRole('button', { name: 'Přidat dalšího' }).click()
  await page.fill('.who-form input >> nth=0', 'Anna')
  await page.fill('.who-form input >> nth=1', 'Ben')
  await shot('profiles-form')
  await page.getByRole('button', { name: 'Přidat', exact: true }).click()
  check(await page.getByRole('radio', { name: /Anna/ }).count() === 1 && await page.getByRole('radio', { name: /Ben/ }).count() === 1, 'two profiles, the current one named')
  await page.getByRole('radio', { name: /Ben/ }).click()
  await page.waitForURL(base + '/')
  await page.waitForSelector('.school-chip')
  await shot('home-profile')
  check(/Ben/.test(await page.locator('.school-chip').getAttribute('aria-label')) && !(await progress()).k && !(await page.locator('.home-plans').count()), 'Ben starts with his own empty progress')
  await page.locator('.school-chip').click()
  await page.waitForSelector('.school-sheet[open]')
  await shot('profiles-switch')
  await page.locator('.school-sheet').getByRole('radio', { name: /Anna/ }).click()
  await page.waitForSelector('.home-plans')
  check(JSON.stringify((await progress()).k) === mine, 'switching back brings Anna\'s progress back')

  check(!errors.length, `no errors (${errors.join(' | ')})`)
  await ctx.close()
}

await browser.close()
console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
