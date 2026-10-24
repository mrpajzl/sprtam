// Dev check: renders column widgets in the browser and screenshots them step by step. Needs dev server on :5179.
import { chromium } from 'playwright-core'
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: process.env.DARK ? 'dark' : 'light' })
const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto('http://127.0.0.1:5179/'); await p.waitForTimeout(500)
const cases = JSON.parse(process.argv[2] ?? '[{"a":832,"b":457,"op":"-"},{"a":"12,5","b":"3,75","op":"+"},{"a":345,"b":23,"op":"·"},{"a":9874,"b":7,"op":":"}]')
await p.evaluate(async (cases) => {
  const dep = performance.getEntriesByType('resource').map((e) => e.name).find((u) => u.includes('/deps/preact.js?v='))
  const { h, render } = await import(dep)
  const { Column, ColumnProblem } = await import('/src/widgets/column.tsx')
  document.body.innerHTML = '<div class="page" id="t" style="display:grid;gap:12px"></div>'
  render(h('div', { style: 'display:grid;gap:12px' }, [...cases.map((c) => h(Column, c)), h('div', { class: 'card' }, h(ColumnProblem, cases[0]))]), document.getElementById('t'))
}, cases)
await p.waitForTimeout(300)
// Advance each widget a few steps.
const n = await p.locator('.w').count()
for (let i = 0; i < n; i++) for (let k = 0; k < (i + 2); k++) { const btn = p.locator('.w').nth(i).locator('.reveal', { hasText: /Začít|Další krok/ }); if (await btn.count()) await btn.click() }
await p.waitForTimeout(500)
await p.screenshot({ path: '/tmp/sprtam-shots/column.png', fullPage: true })
console.log(errs.length ? errs : 'no errors'); await b.close()
