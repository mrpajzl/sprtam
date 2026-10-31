// Routing check against a production build: `npm run build && PORT=8091 node dist-server/index.mjs` (with
// CONTENT_API pointing at the content service or `npx tsx scripts/content-stub.ts`), then
// `node scripts/routing-test.mjs [http://localhost:8091]`.
import { chromium } from 'playwright-core'
const BASE = process.argv[2] ?? 'http://localhost:8091'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
let fails = 0
const ok = (cond, msg) => { console.log(cond ? '✓' : '✗', msg); if (!cond) fails++ }
const path = () => p.evaluate(() => location.pathname + location.search + location.hash)

// Direct load of a deep link: the page from the server, then the app renders the same topic.
await p.goto(`${BASE}/g/z5/matematika/zlomky`)
ok(await p.locator('.seg').count() > 0, 'topic opened directly renders the app screen')
ok((await p.title()).startsWith('Zlomky – Matematika, 5. třída'), `topic title: ${await p.title()}`)
ok(await p.locator('link[rel=canonical]').getAttribute('href') === 'https://sprtam.cz/g/z5/matematika/zlomky', 'canonical')

// Bar back on a directly opened page goes one level up (not out of the app).
await p.click('.bar .icon-btn')
await p.waitForSelector('.list .row')
ok(await path() === '/g/z5/matematika', `back goes up: ${await path()}`)

// In-app link navigation + browser back/forward.
await p.click('a.row[href="/g/z5/matematika/zlomky"]')
await p.waitForSelector('.seg')
ok(await path() === '/g/z5/matematika/zlomky', 'link click navigates')
await p.click('a.mode[href$="/kviz"]')
await p.waitForTimeout(300)
ok(await path() === '/g/z5/matematika/zlomky/kviz', 'mode link')
await p.goBack(); await p.waitForSelector('.seg')
ok(await path() === '/g/z5/matematika/zlomky', 'browser back')
await p.goForward(); await p.waitForTimeout(300)
ok(await path() === '/g/z5/matematika/zlomky/kviz', 'browser forward')

// Old hash links still work.
await p.goto(`${BASE}/#/g/z6/fyzika`)
await p.waitForSelector('.list .row')
ok(await path() === '/g/z6/fyzika', `legacy #/ link redirected: ${await path()}`)

// Search keeps its query in a shareable URL.
await p.goto(`${BASE}/hledat?q=zlomky`)
await p.waitForSelector('.hit')
ok((await p.inputValue('input[type=search]')) === 'zlomky', 'search reads ?q=')
await p.fill('input[type=search]', 'atom')
await p.waitForTimeout(200)
ok(await path() === '/hledat?q=atom', `search writes ?q=: ${await path()}`)

// Učivo → grade → vocab via links.
await p.goto(`${BASE}/ucivo`)
await p.click('a.num-key[href="/g/z7"]')
await p.waitForSelector('.tiles')
ok(await path() === '/g/z7' && (await p.title()).startsWith('7. třída'), 'grade key link + title')
await p.goto(`${BASE}/slovicka/B1`)
await p.waitForSelector('html[data-app] .vocab-tile .seg-meter')
ok((await p.title()).includes('B1'), 'vocab level direct load')

// Tab bar + breadcrumbs: back to a screen that is already behind us instead of stacking copies.
const idx = () => p.evaluate(() => history.state?.i ?? 0)
await p.goto(`${BASE}/ucivo`)
await p.click('a.num-key[href="/g/z5"]'); await p.waitForSelector('.tiles')
await p.click('a.tile[href="/g/z5/matematika"]'); await p.waitForSelector('.list .row')
await p.click('a.row[href="/g/z5/matematika/zlomky"]'); await p.waitForSelector('.seg')
ok(await idx() === 3, `three steps deep: ${await idx()}`)
ok(await p.locator('.bar .crumbs a').allTextContents().then((t) => t.join('|')) === '5. třída|Matematika', 'topic shows its path')
ok(await p.locator('.tabbar a[aria-current="page"]').getAttribute('href') === '/ucivo', 'Učivo tab is current inside a class')
await p.click('.bar .crumbs a[href="/g/z5"]'); await p.waitForSelector('.tiles')
ok(await path() === '/g/z5' && await idx() === 1, `crumb goes back to the class: ${await path()} #${await idx()}`)
await p.goForward(); await p.goForward(); await p.waitForSelector('.seg')
await p.click('.tabbar a[href="/ucivo"]'); await p.waitForSelector('.pad')
ok(await path() === '/ucivo' && await idx() === 0, `Učivo tab returns to the start of the trail: #${await idx()}`)
await p.click('.tabbar a[href="/hry"]'); await p.waitForSelector('.extra-key')
ok(await p.locator('.tabbar a[aria-current="page"]').getAttribute('href') === '/hry', 'Hry tab current')
await p.click('.tabbar a[href="/hledat"]'); await p.waitForSelector('.tabbar a[href="/hledat"][aria-current="page"]')
ok(await path() === '/hledat', 'Hledat tab opens search')
// Já is the chip in the header: its sheet has the pupil's things, and a link there closes it.
await p.click('.tabbar a[href="/hry"]'); await p.waitForSelector('.extra-key')
await p.click('.school-chip'); await p.waitForSelector('.school-sheet[open] .me-grid')
await p.click('.school-sheet .me-tile[href="/prehled"]'); await p.waitForSelector('.school-sheet', { state: 'detached' })
ok(await path() === '/prehled', 'the Já sheet opens Přehled and closes')
// The first class opened became the pupil's school: home shows its subjects and the games that belong to them.
await p.click('.tabbar a[href="/"]'); await p.waitForSelector('.my-tiles .tile')
ok((await p.locator('.school-chip').textContent()).includes('7. třída'), 'home shows the first class opened as my school')
ok(await p.locator('.home .extra-key[href="/slovicka"]').count() === 1, 'home offers the words of the class')
// Opened directly (nothing behind): the tab navigates forward.
await p.goto(`${BASE}/g/z5/matematika/zlomky`); await p.waitForSelector('.seg')
await p.click('.tabbar a[href="/hry"]'); await p.waitForSelector('.extra-key')
ok(await path() === '/hry' && await idx() === 1, 'Hry tab from a direct link')
await p.click('a.extra-key[href="/slovicka"]'); await p.waitForSelector('.levels')
ok(await p.locator('.tabbar').count() === 1, 'tab bar on vocab')
await p.click('a.row[href="/slovicka/A1"]'); await p.waitForSelector('.vocab-tile')
await p.click('a.vocab-tile[href="/slovicka/A1/0"]'); await p.waitForSelector('.drill')
ok(await p.locator('.tabbar').count() === 0, 'no tab bar while drilling')
// No-JS page carries the same navigation.
const html = await (await fetch(`${BASE}/g/z5/matematika/zlomky`)).text()
ok(html.includes('class="tabbar"') && html.includes('<nav class="crumbs" aria-label="Kde jsem"><a href="/g/z5">5. třída</a><a href="/g/z5/matematika">Matematika</a></nav>'), 'server-rendered topic has crumbs and tab bar')

// Unknown route → 404 status.
const r = await p.goto(`${BASE}/g/z5/matematika/nic-takoveho`)
ok(r.status() === 404, 'unknown topic is 404')

// App screens without a page of their own open directly (server/index.ts isAppRoute).
for (const path of ['/ja', '/skola', '/ucivo', '/hry', '/nastaveni', '/profily', '/plan', '/plan/novy', '/plan/abc123', '/plan/abc123/pisemka', '/prijimacky/matematika/simulace', '/g/z5/matematika/zlomky/tisk']) {
  ok((await fetch(`${BASE}${path}`)).status === 200, `${path} opens directly`)
}
ok((await fetch(`${BASE}/plan/abc123/nic`)).status === 404, 'unknown plan screen is 404')
// Periodická tabulka: the page is server-rendered, a game opens directly, an unknown set is 404.
for (const path of ['/periodicka-tabulka', '/periodicka-tabulka/zs/najdi', '/periodicka-tabulka/vse/druh']) {
  ok((await fetch(`${BASE}${path}`)).status === 200, `${path} opens directly`)
}
ok((await fetch(`${BASE}/periodicka-tabulka/nic/najdi`)).status === 404 && (await fetch(`${BASE}/periodicka-tabulka/zs/nic`)).status === 404, 'unknown set or game of Periodická tabulka is 404')
await p.goto(`${BASE}/periodicka-tabulka/zaklad/najdi`)
await p.waitForSelector('.periodic-el')
ok(await p.locator('.periodic-el').count() === 20, 'a game of Periodická tabulka opened directly renders the app screen')

// A first visit asks for the school on the home screen; a class key makes it the pupil's.
const fresh = await (await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })).newPage()
fresh.on('pageerror', (e) => errs.push(String(e)))
await fresh.goto(`${BASE}/`); await fresh.waitForSelector('html[data-app] .welcome')
await fresh.click('.welcome button.num-key[aria-label="9. třída"]'); await fresh.waitForSelector('.my-tiles .tile')
ok(await fresh.locator('.home .extra-key[href="/prijimacky"]').count() === 1, 'a 9th grader gets Přijímačky on the home screen')
await fresh.goto(`${BASE}/g/z9/zemepis`); await fresh.waitForSelector('.extra-key')
ok(await fresh.locator('.extra-key[href="/slepa-mapa"]').count() === 1, 'zeměpis offers Slepá mapa')
// Only the pupil's second language: neither the subjects nor the first recommendations offer the others.
// The school is chosen in the sheet of the header chip.
await fresh.goto(`${BASE}/`); await fresh.waitForSelector('.my-tiles .tile')
await fresh.click('.school-chip'); await fresh.waitForSelector('.school-sheet[open]')
await fresh.click('.school-sheet button.num-key[aria-label="7. třída"]')
await fresh.selectOption('.school-sheet select[aria-label="Druhý cizí jazyk"]', 'francouzstina')
await fresh.click('.school-sheet .school-done'); await fresh.waitForSelector('.school-sheet', { state: 'detached' })
ok((await fresh.locator('.school-chip').textContent()).includes('7. třída'), 'the sheet changes the class on the spot')
await fresh.goto(`${BASE}/`); await fresh.waitForSelector('.my-tiles .tile')
ok(await fresh.locator('.home a[href*="/nemcina"], .home a[href*="/spanelstina"]').count() === 0, 'the chosen second language hides the others on the home screen')
// Switching an obor on asks for the year, then home shows the obor's subjects.
await fresh.goto(`${BASE}/obor/informacni-technologie`); await fresh.waitForSelector('.approach-switch')
await fresh.click('.approach-switch'); await fresh.click('.obor-pick button.num-key[aria-label="2. ročník"]')
await fresh.goto(`${BASE}/`); await fresh.waitForSelector('.my-tiles .tile')
ok((await fresh.locator('.school-chip').textContent()).includes('2. ročník · 💻') && await fresh.locator('.my-tiles .tile[href="/g/odb/programovani"]').count() === 1, 'an obor switched on reaches the home screen')
const homeHtml = await (await fetch(`${BASE}/`)).text()
ok(homeHtml.includes('href="/ucivo"') && homeHtml.includes('<a class="num-key" href="/g/z7"'), 'server-rendered home links Učivo and every class')

ok(!errs.length, `no page errors ${errs.join(' | ')}`)
await b.close()
process.exit(fails ? 1 : 0)
