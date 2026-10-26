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

// Direct load of a deep link: prerendered page, then the app renders the same topic.
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

// Home → grade → vocab via links.
await p.goto(`${BASE}/`)
await p.click('a.num-key[href="/g/z7"]')
await p.waitForSelector('.tiles')
ok(await path() === '/g/z7' && (await p.title()).startsWith('7. třída'), 'grade key link + title')
await p.goto(`${BASE}/slovicka/B1`)
await p.waitForSelector('html[data-app] .vocab-tile .seg-meter')
ok((await p.title()).includes('B1'), 'vocab level direct load')

// Tab bar + breadcrumbs: back to a screen that is already behind us instead of stacking copies.
const idx = () => p.evaluate(() => history.state?.i ?? 0)
await p.goto(`${BASE}/`)
await p.click('a.num-key[href="/g/z5"]'); await p.waitForSelector('.tiles')
await p.click('a.tile[href="/g/z5/matematika"]'); await p.waitForSelector('.list .row')
await p.click('a.row[href="/g/z5/matematika/zlomky"]'); await p.waitForSelector('.seg')
ok(await idx() === 3, `three steps deep: ${await idx()}`)
ok(await p.locator('.bar .crumbs a').allTextContents().then((t) => t.join('|')) === '5. třída|Matematika', 'topic shows its path')
ok(await p.locator('.tabbar a[aria-current="page"]').getAttribute('href') === '/g/z5', 'class tab is current inside the class')
await p.click('.bar .crumbs a[href="/g/z5"]'); await p.waitForSelector('.tiles')
ok(await path() === '/g/z5' && await idx() === 1, `crumb goes back to the class: ${await path()} #${await idx()}`)
await p.goForward(); await p.goForward(); await p.waitForSelector('.seg')
await p.click('.tabbar a[href="/"]'); await p.waitForSelector('.pad')
ok(await path() === '/' && await idx() === 0, `home tab returns to the start of the trail: #${await idx()}`)
await p.click('.tabbar a[href="/hledat"]'); await p.waitForSelector('input[type=search]')
ok(await p.locator('.tabbar a[aria-current="page"]').getAttribute('href') === '/hledat', 'search tab current')
// Opened directly (nothing behind): the tab navigates forward.
await p.goto(`${BASE}/g/z5/matematika/zlomky`); await p.waitForSelector('.seg')
await p.click('.tabbar a[href="/slovicka"]'); await p.waitForSelector('.levels')
ok(await path() === '/slovicka' && await idx() === 1, 'vocab tab from a direct link')
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

ok(!errs.length, `no page errors ${errs.join(' | ')}`)
await b.close()
process.exit(fails ? 1 : 0)
