// Dev check: two isolated browser contexts connect over the WebRTC Link
// using only the QR payloads (no signalling server). Needs `npm run dev` on :5179.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const base = process.argv[2] ?? 'http://127.0.0.1:5179/'
const b = await chromium.launch({ executablePath: exe })
const A = await (await b.newContext()).newPage(), B = await (await b.newContext()).newPage()
await A.goto(base); await B.goto(base)
const setup = `(async () => { const m = await import('/src/progress/p2p.ts'); window.l = new m.Link(); window.got = []; window.l.onMessage = (x) => window.got.push(x); window.l.onOpen = () => window.l.send({ from: document.title + Math.random() }) })()`
await A.evaluate(setup); await B.evaluate(setup)
const offer = await A.evaluate(() => window.l.offer())
const answer = await B.evaluate((o) => window.l.answer(o), offer)
console.log('offer QR chars:', offer.length, 'answer QR chars:', answer.length)
await A.evaluate((a) => window.l.accept(a), answer)
await A.waitForFunction(() => window.got.length > 0, null, { timeout: 10000 })
await B.waitForFunction(() => window.got.length > 0, null, { timeout: 10000 })
console.log('A got', await A.evaluate(() => window.got), 'B got', await B.evaluate(() => window.got))
await b.close()
