import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(String(e)))
const mode = process.argv[2] ?? 'kviz', route = process.argv[3] ?? '/g/z6/matematika/uhel'
await p.goto((process.env.BASE ?? 'http://127.0.0.1:5179/') + '#' + route + '/' + mode); await p.waitForSelector('.question', { timeout: 15000 })
for (let i = 0; i < 40; i++) {
  if (await p.locator('.result').count()) break
  if (i === 1) await p.screenshot({ path: `/tmp/sprtam-shots/q-${mode}.png` })
  if (await p.locator('.sheet .btn').count()) { if (i === 2) await p.screenshot({ path: `/tmp/sprtam-shots/q-${mode}-sheet.png` }); await p.locator('.sheet .btn').click(); await p.waitForTimeout(100); continue }
  if (await p.getByText('Ukázat odpověď').count()) { await p.getByText('Ukázat odpověď').click(); await p.waitForTimeout(100); if (i===2) await p.screenshot({ path: `/tmp/sprtam-shots/q-${mode}-oral.png` }); await p.locator('.self .btn').last().click(); continue }
  if (await p.locator('.answer-input').count()) { await p.fill('.answer-input', '42'); await p.keyboard.press('Enter') }
  else if (await p.locator('.order').count()) await p.getByText('Hotovo').click()
  else if (await p.locator('.pairs').count()) { const n = await p.locator('.pairs .col').first().locator('.opt').count(); for (let k=0;k<n;k++){ await p.locator('.pairs .col').first().locator('.opt').nth(k).click(); const txt = await p.evaluate(()=>0); for (let j=0;j<n;j++){ const r=p.locator('.pairs .col').nth(1).locator('.opt:not(.done)').nth(j); if(!(await r.count())) break; await r.click(); await p.waitForTimeout(50); if (await p.locator('.pairs .col').first().locator('.opt').nth(k).evaluate(e=>e.classList.contains('done'))) break } } }
  else if (await p.locator('.opts .opt, .tf .opt').count()) await p.locator('.opts .opt, .tf .opt').first().click()
  else { await p.screenshot({ path: '/tmp/sprtam-shots/stuck.png' }); console.log('stuck:', (await p.locator('.page').innerText()).slice(0, 200)); break }
  await p.waitForTimeout(450)
}
await p.waitForTimeout(500)
await p.screenshot({ path: `/tmp/sprtam-shots/q-${mode}-result.png` })
console.log(await p.evaluate(() => localStorage.getItem('sprtam:progress')), errs)
await b.close()
