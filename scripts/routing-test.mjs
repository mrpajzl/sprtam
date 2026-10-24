// Routing check against a production build: `npm run build && PORT=8091 node server/index.mjs`, then
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
ok(await p.locator('link[rel=canonical]').getAttribute('href') === 'https://sprtam.ondrejzraly.cz/g/z5/matematika/zlomky', 'canonical')

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

// Unknown route → 404 status.
const r = await p.goto(`${BASE}/g/z5/matematika/nic-takoveho`)
ok(r.status() === 404, 'unknown topic is 404')

ok(!errs.length, `no page errors ${errs.join(' | ')}`)
await b.close()
process.exit(fails ? 1 : 0)
