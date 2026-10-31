// Moderation end to end (docs/MODERACE.md, docs/OBSAH.md): starts the built server (npm run moderator:build first)
// on a free port with an empty database (it imports content/), and drives Chromium with virtual passkeys through
// sign-in, the editor, review and publishing, history and rollback, API tokens, widget requests, pupils' error reports, backups and the
// security rules.
//   node scripts/moderator-test.mjs
import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const exe = process.env.CHROME ?? process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const ROOT = join(import.meta.dirname, '..')
const port = await new Promise((r) => { const s = createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)) }) })
const BASE = `http://localhost:${port}`
const data = mkdtempSync(join(tmpdir(), 'moderace-test-'))
const BACKUP = 'test-backup-token-0123456789-abcdefghij'
const REPORT = 'test-report-token-0123456789-abcdefghij'
const env = { ...process.env, PORT: String(port), ORIGIN: BASE, DATA_DIR: data, BACKUP_TOKEN: BACKUP, REPORT_TOKEN: REPORT, REQUIRED_APPROVALS: '1' }
const server = spawn('node', ['--no-warnings', 'moderator/dist-server/index.mjs'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise((r) => server.stdout.on('data', (d) => { if (String(d).includes('moderace on')) r() }))
const cli = (...args) => execFileSync('node', ['--no-warnings', 'moderator/dist-server/cli.mjs', ...args], { cwd: ROOT, env }).toString().trim().split('\n').pop()

let failed = 0
const check = (ok, what) => { console.log(ok ? '✓' : '✗', what); if (!ok) failed++ }

const browser = await chromium.launch({ executablePath: exe })
/** A browser profile with its own passkey device. */
async function device() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  const api = (method, path, body) => page.evaluate(async ([m, p, b]) => { const r = await fetch(p, { method: m, headers: b ? { 'Content-Type': 'application/json' } : {}, body: b ? JSON.stringify(b) : undefined }); return { status: r.status, body: await r.json().catch(() => null) } }, [method, path, body])
  return { ctx, page, errors, api }
}
const signedInAs = (page, first) => page.getByText(`Ahoj, ${first}!`).waitFor({ timeout: 10000 }).then(() => true, () => false)

try {
  // ——— Invite → account, single use ———
  const admin = await device()
  const link = cli('invite', 'Ada Správcová', 'admin')
  await admin.page.goto(link)
  await admin.page.getByText('Vítej, Ada Správcová!').waitFor()
  check(!admin.page.url().includes('#'), 'invite token is removed from the address bar')
  await admin.page.getByRole('button', { name: 'Vytvořit přístupový klíč' }).click()
  check(await signedInAs(admin.page, 'Ada'), 'invite creates the account and signs in')
  const reuse = await device()
  await reuse.page.goto(link)
  check(await reuse.page.getByText('Pozvánka neplatí').waitFor({ timeout: 5000 }).then(() => true, () => false), 'a used invite is refused')

  // ——— Session cookie ———
  const cookie = (await admin.ctx.cookies()).find((c) => c.name === 'moderace')
  check(cookie?.httpOnly && cookie.sameSite === 'Strict', 'session cookie is HttpOnly and SameSite=Strict')

  // ——— Login with the passkey; challenges ———
  await admin.page.getByRole('button', { name: 'Odhlásit se' }).click()
  check(await admin.page.getByRole('heading', { name: 'Učivo Šprtámu' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'signing out leaves the public library')
  await admin.page.getByRole('link', { name: 'Přihlásit se' }).click()
  await admin.page.getByRole('button', { name: 'Přihlásit se klíčem' }).click()
  check(await signedInAs(admin.page, 'Ada'), 'passkey sign-in works')
  await admin.page.goto(`${BASE}/prihlaseni?dalsi=//evil.example`)
  await admin.page.waitForURL(`${BASE}/`).catch(() => {})
  check(admin.page.url() === `${BASE}/`, 'after sign-in it only returns to this site')
  const opts = await admin.api('POST', '/api/auth/login/options', {})
  const forged = opts.body.challengeId.replace(/\.[^.]+$/, '.AAAA')
  check((await admin.api('POST', '/api/auth/login/verify', { challengeId: forged, response: { id: 'x' } })).status === 400, 'a forged login challenge is refused')
  check((await admin.api('GET', '/api/content/index')).status === 200, 'signed-in API works')

  // ——— Cross-site and anonymous requests ———
  const evil = await fetch(`${BASE}/api/drafts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', Cookie: `moderace=${cookie.value}` }, body: '{}' })
  check(evil.status === 403, 'a request from a foreign origin is refused even with the cookie')
  const anon = await fetch(`${BASE}/api/content/index`)
  check(anon.status === 200 && (await anon.json()).active.length === 0, 'the catalogue is public, without who edits what')
  check((await fetch(`${BASE}/api/content/topic/z6/matematika/prvocisla`)).status === 200, 'a published topic is public')
  check((await fetch(`${BASE}/api/drafts`)).status === 401, 'drafts need a session')
  check((await fetch(`${BASE}/api/content/topic/z6/matematika/..%2Fx`)).status === 404, 'a path in a public topic id is refused')
  check((await fetch(`${BASE}/%E0`)).status === 400, 'a malformed URL gives 400')
  check((await fetch(`${BASE}/`)).headers.get('content-security-policy')?.includes("script-src 'self'"), 'strict CSP header')

  // ——— Browsing without an account (teachers) ———
  const teacher = await device()
  await teacher.page.goto(`${BASE}/ucivo/z6/matematika`)
  await teacher.page.getByRole('link', { name: /Prvočísla/ }).click()
  await teacher.page.waitForURL(/\/ucivo\/z6\/matematika\/prvocisla$/)
  check(await teacher.page.frameLocator('iframe').locator('.blocks').waitFor({ timeout: 5000 }).then(() => true, () => false), 'a visitor sees the topic in the phone')
  check(await teacher.page.locator('.v-qs li').count() >= 8, 'a visitor sees the questions with answers')
  check(await teacher.page.getByRole('button', { name: 'Upravit' }).count() === 0, 'a visitor has no edit button')
  await teacher.page.goto(`${BASE}/navrhy`)
  check(await teacher.page.getByRole('button', { name: 'Přihlásit se klíčem' }).isVisible(), 'drafts ask a visitor to sign in')

  // ——— Editor: browse a topic, switch to editing, autosave, preview ———
  await admin.page.goto(`${BASE}/ucivo/z6/matematika`)
  await admin.page.getByRole('link', { name: /Prvočísla/ }).click()
  await admin.page.waitForURL(/\/prvocisla$/)
  check(await admin.page.locator('.card.t-text').count() === 0, 'a topic opens read only')
  await admin.page.getByRole('button', { name: 'Upravit' }).click()
  await admin.page.waitForURL(/\/navrh\//)
  const frame = admin.page.frameLocator('iframe')
  await frame.locator('.blocks').waitFor()
  await admin.page.locator('.card.t-text textarea').first().fill('Test **náhledu**.')
  check(await frame.locator('.blocks strong', { hasText: 'náhledu' }).waitFor({ timeout: 3000 }).then(() => true, () => false), 'preview shows the edit')
  check(await admin.page.locator('.save.saved').waitFor({ timeout: 5000 }).then(() => true, () => false), 'draft is saved')
  const draftId = admin.page.url().split('/').pop()

  // ——— Widget gallery: a widget block starts in the gallery with live demos ———
  const blocksBefore = await admin.page.locator('.card.t-widget').count()
  await admin.page.locator('.add-card', { hasText: 'Přidat blok' }).first().click()
  await admin.page.locator('.menu-pop').getByRole('button', { name: /Interaktivní pomůcka/ }).click()
  const picker = admin.page.getByRole('dialog', { name: 'Vyber interaktivní pomůcku' })
  const demo = admin.page.frameLocator('.sc-frame iframe')
  check(await demo.locator('.blocks > *').first().waitFor({ timeout: 5000 }).then(() => true, () => false), 'the widget gallery shows the widget working')
  await picker.locator('.sc-item', { hasText: 'Číselná osa' }).click()
  const examples = picker.locator('.sc-tools .chip')
  await examples.nth(1).click()
  check(await examples.nth(1).getAttribute('aria-pressed') === 'true' && await picker.locator('.sc-frame iframe').evaluate((f) => f.offsetHeight > 120), 'a picked example is shown in a frame as tall as the widget')
  await picker.getByRole('button', { name: 'Použít „Číselná osa“' }).click()
  check(await admin.page.locator('.card.t-widget').count() === blocksBefore + 1 && await admin.page.locator('.card.t-widget.focused .we-head b', { hasText: 'Číselná osa' }).isVisible(), 'using it adds a widget block with that widget')
  await admin.page.getByRole('button', { name: 'Zpět', exact: true }).click()
  check(await admin.page.locator('.card.t-widget').count() === blocksBefore, 'undo takes the widget block back out')

  // ——— Phone: bottom bar, editor dock, parts sheet and full-screen preview, nothing wider than the screen ———
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState: await admin.ctx.storageState() })
  const ph = await phone.newPage()
  const fits = () => ph.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
  await ph.goto(`${BASE}/ucivo/z6/matematika`)
  await ph.locator('.topic').first().waitFor()
  check(await ph.locator('.bnav').isVisible() && !(await ph.locator('.top .tabs').isVisible()) && await fits(), 'phone: screens in a bottom bar, the page fits the screen')
  await ph.locator('.bnav').getByRole('button', { name: 'Více' }).click()
  check(await ph.locator('.more-sheet').getByRole('link', { name: 'Moderátoři' }).isVisible() && await ph.locator('.more-sheet').getByRole('link', { name: 'Pomůcky' }).isVisible(), 'phone: widget requests and admin screens under "Více"')
  await ph.goto(`${BASE}/navrh/${draftId}`)
  await ph.locator('.ed-dock').waitFor()
  check(await fits() && !(await ph.locator('.outline').isVisible()), 'phone: the editor fits, the outline is folded away')
  await ph.locator('.ed-dock').getByRole('button', { name: /Části/ }).click()
  await ph.locator('.outline .ol-item', { hasText: 'Otázky' }).click()
  check(!(await ph.locator('.outline').isVisible()) && await ph.locator('#question-0').isVisible(), 'phone: picking a part in the sheet closes it and shows the part')
  await ph.locator('.ed-dock').getByRole('button', { name: 'Náhled' }).click()
  const pv = await ph.locator('.ed-preview').boundingBox()
  check(pv && pv.width >= 389 && pv.height >= 843, 'phone: the preview covers the screen')
  await ph.getByRole('button', { name: 'Zavřít náhled' }).click()
  check(!(await ph.locator('.ed-preview').count()), 'phone: the preview closes')
  await phone.close()

  // ——— Another moderator cannot touch it ———
  const mod = await device()
  await mod.page.goto(cli('invite', 'Petr Moderátor', 'moderator'))
  await mod.page.getByRole('button', { name: 'Vytvořit přístupový klíč' }).click()
  check(await signedInAs(mod.page, 'Petr'), 'second account created')
  check((await mod.api('GET', `/api/drafts/${draftId}`)).status === 200, "a moderator reads another's draft in progress (everything is visible)")
  check((await mod.api('PUT', `/api/drafts/${draftId}`, { topic: {}, rev: 1 })).status === 403, "a moderator cannot change another's draft")
  check((await mod.api('DELETE', `/api/drafts/${draftId}`)).status === 403, "a moderator cannot delete another's draft")
  check((await mod.api('GET', '/api/admin/users')).status === 403, 'a moderator cannot manage users')
  check((await mod.api('POST', '/api/drafts', { kind: 'new', grade: 'z6', subject: 'matematika', topic: { id: '../../x' } })).status === 400, 'a path in a topic id is refused')
  check((await mod.api('POST', '/api/drafts', { kind: 'edit', grade: '../z6', subject: 'matematika', topicId: 'uhel' })).status === 400, 'a path in a grade is refused')

  // ——— Admin actions: key link, reset, disable ———
  const users = (await admin.api('GET', '/api/admin/users')).body.users
  const petr = users.find((u) => u.name === 'Petr Moderátor')
  const keyLink = (await admin.api('POST', `/api/admin/users/${petr.id}/key-link`, {})).body.url
  check(typeof keyLink === 'string', 'admin creates a key link (fresh sign-in)')
  check((await admin.api('POST', `/api/admin/users/${petr.id}/key-link`, { reset: true })).status === 200, 'admin resets the keys')
  check((await mod.api('GET', '/api/drafts')).status === 401, 'reset signs the user out')
  const old = await device()
  await old.page.goto(keyLink)
  check(await old.page.getByText('Pozvánka neplatí').waitFor({ timeout: 5000 }).then(() => true, () => false), 'a key link from before the reset no longer works')
  check((await admin.api('PATCH', `/api/admin/users/${(users.find((u) => u.name === 'Ada Správcová')).id}`, { active: false })).status === 400, 'the last admin cannot switch herself off')
  check((await admin.api('PATCH', `/api/admin/users/${petr.id}`, { role: 'admin' })).status === 200, 'admin changes a role')

  // ——— Own keys: a removed key ends its sessions ———
  const add = await admin.api('POST', '/api/me/keys/options', {})
  check(add.status === 200, 'adding a key is allowed right after sign-in')
  const keys = (await admin.api('GET', '/api/me/keys')).body
  check((await admin.api('DELETE', `/api/me/keys/${encodeURIComponent(keys[0].id)}`)).status === 400, 'the last key cannot be removed')

  // ——— Public content API ———
  const manifest = async () => (await fetch(`${BASE}/api/public/v1/manifest`)).json()
  const m1 = await manifest()
  check(m1.release === 1 && Object.keys(m1.files).length > 90, 'the imported content is release 1 of the public API')
  const subj = await fetch(`${BASE}/api/public/v1/files/${m1.files['subject/z6/matematika']}`)
  check(subj.status === 200 && (await subj.json()).some((t) => t.id === 'prvocisla'), 'files are served by hash')
  check((await fetch(`${BASE}/api/public/v1/manifest`, { headers: { 'If-None-Match': `"${m1.hash}"` } })).status === 304, 'the manifest answers 304 when unchanged')
  check((await fetch(`${BASE}/api/public/v1/files/../../etc`)).status === 404, 'only hashes are files')
  const topicText = async () => (await (await fetch(`${BASE}/api/content/topic/z6/matematika/prvocisla`)).json()).topic.explanations[0].blocks[1].text

  // ——— Review: a third moderator; a draft of hers that will conflict ———
  const eva = await device()
  await eva.page.goto(cli('invite', 'Eva Učitelka', 'moderator'))
  await eva.page.getByRole('button', { name: 'Vytvořit přístupový klíč' }).click()
  check(await signedInAs(eva.page, 'Eva'), 'a reviewer account is created')
  const evaDraft = (await eva.api('POST', '/api/drafts', { kind: 'edit', grade: 'z6', subject: 'matematika', topicId: 'prvocisla' })).body.draft
  check(!evaDraft.conflict, 'a fresh draft is not in conflict')
  // Opening a topic in the editor makes a draft, but until something changes it is nobody's business.
  check(!evaDraft.changed && !(await eva.api('GET', '/api/content/index')).body.active.some((a) => a.userId === evaDraft.author.id), 'an untouched draft is not shown as being edited')
  check(!(await eva.api('GET', '/api/drafts')).body.some((x) => x.id === evaDraft.id), 'an untouched draft is not in my drafts')
  const emptySubmit = await eva.api('POST', `/api/drafts/${evaDraft.id}/submit`, {})
  check(emptySubmit.status === 422 && emptySubmit.body.code === 'empty', 'an untouched draft cannot be sent for review')
  await eva.page.goto(`${BASE}/ucivo/z6/matematika/nasobek-delitel`)
  await eva.page.getByRole('button', { name: 'Upravit' }).click()
  await eva.page.waitForURL(/\/navrh\//)
  const leftId = eva.page.url().split('/').pop()
  await eva.page.locator('.ed-top a.icon').click()
  await eva.page.waitForURL(/nasobek-delitel$/)
  await eva.page.waitForTimeout(500)
  check((await eva.api('GET', `/api/drafts/${leftId}`)).status === 404, 'leaving the editor without a change drops the draft')

  // The admin sends her draft for review in the editor.
  await admin.page.goto(`${BASE}/navrh/${draftId}`)
  await admin.page.getByRole('button', { name: 'Odeslat ke kontrole' }).click()
  await admin.page.getByRole('dialog').getByRole('button', { name: 'Odeslat' }).click()
  check(await admin.page.getByText('Odesláno ke kontrole').waitFor({ timeout: 5000 }).then(() => true, () => false), 'a draft is sent for review')
  check((await admin.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'changes', body: 'x' })).status === 403, 'nobody asks for changes of their own change')
  check((await admin.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'approve', rev: 99 })).body.code === 'stale', 'an admin may approve her own change, but only the revision she saw')

  const queue = (await eva.api('GET', '/api/reviews')).body
  check(queue.some((d) => d.id === draftId && !d.mine), 'the change is in the review queue of others')
  await eva.page.goto(`${BASE}/kontrola/${draftId}`)
  check(await eva.page.locator('.diff ins', { hasText: 'náhledu' }).first().waitFor({ timeout: 5000 }).then(() => true, () => false), 'the review shows the changed words')
  check(await eva.page.locator('.decide.t-act').getByRole('button', { name: 'Schválit a zveřejnit' }).isVisible(), 'the reviewer sees what to do and where to approve')
  await eva.page.mouse.wheel(0, 3000)
  check(await eva.page.locator('.decide-bar').getByRole('button', { name: 'Schválit a zveřejnit' }).waitFor({ timeout: 3000 }).then(() => true, () => false), 'the approve button stays at hand while reading the changes')
  await eva.page.mouse.wheel(0, -6000)
  // A comment on one block, then a request for changes.
  await eva.page.locator('.d-item.d-mod').first().getByRole('button', { name: 'Komentovat' }).click()
  await eva.page.locator('.c-write textarea').fill('Tady bych dala příklad.')
  await eva.page.getByRole('button', { name: 'Odeslat', exact: true }).click()
  check(await eva.page.locator('.d-item .comment', { hasText: 'Tady bych dala příklad.' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'a comment sits at its block')

  // Talking about it: replies in the thread, formatting, edits, a suggested wording the author takes over.
  const first = (await admin.api('GET', `/api/drafts/${draftId}/thread`)).body.reviews.find((r) => r.body === 'Tady bych dala příklad.')
  const reply = await admin.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'comment', parent: first.id, body: 'Dobře, **doplním** ho:\n- třeba sedmičku' })
  const myReply = reply.body.reviews?.find((r) => r.parent === first.id)
  check(reply.status === 200 && myReply?.anchor === first.anchor, 'the author replies in the thread, at the same place')
  check(await eva.page.locator('.c-replies .rich strong', { hasText: 'doplním' }).waitFor({ timeout: 15000 }).then(() => true, () => false)
    && await eva.page.locator('.c-replies .rich li', { hasText: 'třeba sedmičku' }).count() === 1, 'a reply shows up on its own, formatted')
  check((await eva.api('DELETE', `/api/drafts/${draftId}/reviews/${first.id}`)).status === 409, 'a message with replies stays')
  check((await eva.api('PATCH', `/api/drafts/${draftId}/reviews/${myReply.id}`, { body: 'hack' })).status === 403, "nobody edits someone else's message")
  const edit = await admin.api('PATCH', `/api/drafts/${draftId}/reviews/${myReply.id}`, { body: 'Dobře, doplním ho.' })
  check(edit.status === 200 && edit.body.reviews.find((r) => r.id === myReply.id).editedAt > 0, 'one edits their own message')
  await eva.page.locator('.d-item.d-mod').first().getByRole('button', { name: 'Komentovat' }).click()
  await eva.page.getByRole('button', { name: 'Navrhnout text' }).click()
  await eva.page.getByLabel('Navržený text').fill('Test **náhledu**. Třeba 7 je prvočíslo.')
  await eva.page.getByRole('button', { name: 'Odeslat', exact: true }).click()
  check(await eva.page.locator('.c-suggest.view ins', { hasText: 'Třeba' }).first().waitFor({ timeout: 5000 }).then(() => true, () => false), 'a suggested wording shows what it changes')
  let d = (await admin.api('GET', `/api/drafts/${draftId}`)).body
  const sug = d.reviews.find((r) => r.suggestion)
  check((await eva.api('POST', `/api/drafts/${draftId}/reviews/${sug.id}/apply`, { rev: d.draft.rev })).status === 403, 'only the author takes over a suggestion')
  check((await eva.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'comment', anchor: first.anchor, suggestion: { path: 'title', text: 'x' } })).status === 400, 'a suggestion changes only the item it is about')
  const applied = await admin.api('POST', `/api/drafts/${draftId}/reviews/${sug.id}/apply`, { rev: d.draft.rev })
  check(applied.status === 200 && applied.body.draft.rev === d.draft.rev + 1 && JSON.stringify(applied.body.topic).includes('Třeba 7 je prvočíslo')
    && applied.body.reviews.find((r) => r.id === sug.id).appliedAt > 0, 'the author takes over a suggestion as a new revision')
  check((await admin.api('POST', `/api/drafts/${draftId}/reviews/${sug.id}/apply`, { rev: applied.body.draft.rev })).status === 409, 'a suggestion is taken over once')
  const extra = await eva.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'comment', body: 'Smažu' })
  check((await eva.api('DELETE', `/api/drafts/${draftId}/reviews/${extra.body.reviews.at(-1).id}`)).status === 200, 'one deletes their own message')
  await eva.page.reload()
  await eva.page.getByRole('button', { name: 'Požádat o úpravy' }).click()
  await eva.page.getByRole('dialog').locator('textarea').fill('Doplň prosím příklad.')
  await eva.page.getByRole('dialog').getByRole('button', { name: 'Odeslat autorovi' }).click()
  await eva.page.locator('.banner', { hasText: 'O úpravy žádá' }).waitFor({ timeout: 5000 })
  d = (await admin.api('GET', `/api/drafts/${draftId}`)).body
  check(d.draft.changes.length === 1 && d.reviews.filter((r) => r.verdict === 'changes').length === 1, 'the author sees the request for changes')

  // The author edits (a new revision): the request no longer blocks, an approval of the old revision would not count.
  const edited = { ...d.topic, explanations: d.topic.explanations.map((x, i) => (i ? x : { ...x, blocks: x.blocks.map((b, j) => (j === 1 ? { ...b, text: 'Test **náhledu**. Příklad: 7 je prvočíslo.' } : b)) })) }
  const saved = await admin.api('PUT', `/api/drafts/${draftId}`, { topic: edited, rev: d.draft.rev })
  check(saved.status === 200 && saved.body.rev === d.draft.rev + 1, 'editing in review makes a new revision')
  check((await eva.api('POST', `/api/drafts/${draftId}/review`, { verdict: 'approve', rev: d.draft.rev })).status === 409, 'an approval of an old revision is refused')
  check((await admin.api('POST', `/api/drafts/${draftId}/reviews/${d.reviews[0].id}/resolve`, {})).status === 200, 'the author resolves a comment')

  // Approval in the review screen publishes at once.
  await eva.page.goto(`${BASE}/kontrola/${draftId}`)
  await eva.page.getByRole('button', { name: 'Schválit a zveřejnit' }).click()
  check(await eva.page.locator('.banner.ok', { hasText: 'Zveřejněno' }).waitFor({ timeout: 8000 }).then(() => true, () => false), 'approving publishes the change')
  const m2 = await manifest()
  check(m2.release === 2 && m2.hash !== m1.hash && m2.files['subject/z6/matematika'] !== m1.files['subject/z6/matematika'] && m2.files['subject/z5/matematika'] === m1.files['subject/z5/matematika'], 'a new release changes only the files of the changed subject')
  check((await topicText()).includes('7 je prvočíslo'), 'the published topic is public right away')

  const approvedTab = (await eva.api('GET', '/api/reviews?tab=published')).body
  check(approvedTab.some((x) => x.id === draftId && x.decidedBy === 'Eva Učitelka' && x.release === 2) && !(await eva.api('GET', '/api/reviews')).body.some((x) => x.id === draftId), 'an approved change moves from the open tab to the approved one')
  check((await eva.api('GET', '/api/reviews?tab=nope')).status === 400, 'an unknown review tab is refused')
  await eva.page.goto(`${BASE}/kontrola?stav=schvaleno`)
  check(await eva.page.locator('a.draft', { hasText: 'schválil/a Eva Učitelka' }).first().waitFor({ timeout: 5000 }).then(() => true, () => false), 'the approved tab lists the change with who approved it')

  // Eva's own draft started from the old version: conflict, then rebase.
  d = (await eva.api('GET', `/api/drafts/${evaDraft.id}`)).body
  check(d.draft.conflict, "a draft based on an older version is in conflict")
  check((await eva.api('POST', `/api/drafts/${evaDraft.id}/submit`, {})).status === 409, 'a draft in conflict cannot be sent')
  check((await eva.api('POST', `/api/drafts/${evaDraft.id}/rebase`, {})).body.draft?.conflict === false, 'rebasing resolves the conflict')
  check((await eva.api('DELETE', `/api/drafts/${evaDraft.id}`)).status === 200, 'a draft is deleted')

  // A rejected change stays visible to every moderator, with the reason.
  const doomed = (await eva.api('POST', '/api/drafts', { kind: 'edit', grade: 'z6', subject: 'matematika', topicId: 'uhel' })).body.draft
  const doomedTopic = (await eva.api('GET', `/api/drafts/${doomed.id}`)).body.topic
  await eva.api('PUT', `/api/drafts/${doomed.id}`, { rev: doomed.rev, topic: { ...doomedTopic, title: `${doomedTopic.title} (zkouška)` } })
  const mineOpen = (await eva.api('GET', '/api/reviews?tab=open&mine=1')).body
  check(mineOpen.length === 1 && mineOpen[0].id === doomed.id && mineOpen[0].status === 'draft', 'only mine lists my draft in progress among open changes')
  check((await admin.api('GET', '/api/reviews?tab=open')).body.some((x) => x.id === doomed.id && x.status === 'draft'), 'every moderator sees drafts in progress by default')
  const byGrade = (q) => admin.api('GET', `/api/reviews?tab=open&${q}`).then((r) => r.body)
  check((await byGrade('grade=z6&subject=matematika')).some((x) => x.id === doomed.id) && !(await byGrade('grade=z5')).some((x) => x.id === doomed.id) && !(await byGrade('subject=cestina')).some((x) => x.id === doomed.id), 'changes filter by grade and subject')
  check((await admin.api('GET', '/api/reviews?grade=../x')).status === 400 && (await admin.api('GET', '/api/reviews/counts?subject=x')).status === 400, 'an unknown grade or subject is refused')
  check((await admin.api('GET', '/api/reviews/counts?grade=z5')).body.open === 0, 'counts follow the filter')
  await admin.page.goto(`${BASE}/kontrola?rocnik=z6&predmet=matematika`)
  check(await admin.page.locator('a.draft', { hasText: '(zkouška)' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'the review page lists a draft in progress filtered by grade and subject')
  await admin.page.getByLabel('Ročník').selectOption('z5')
  check(await admin.page.waitForURL(/rocnik=z5/).then(() => admin.page.locator('a.draft', { hasText: '(zkouška)' }).waitFor({ state: 'detached', timeout: 5000 })).then(() => true, () => false), 'choosing another grade filters the list')
  await eva.page.goto(`${BASE}/navrhy`)
  await eva.page.waitForURL(/\/kontrola\?moje=1$/)
  await eva.page.locator('a.draft', { hasText: '(zkouška)' }).click()
  await eva.page.waitForURL(new RegExp(`/kontrola/${doomed.id}$`))
  await eva.page.getByRole('link', { name: 'Pokračovat v úpravách' }).click()
  check(await eva.page.waitForURL(new RegExp(`/navrh/${doomed.id}$`), { timeout: 5000 }).then(() => true, () => false), 'the old drafts page leads to my changes, and I continue editing from the detail')
  check((await eva.api('POST', `/api/drafts/${doomed.id}/submit`, {})).status === 200, 'a second change is sent for review')
  check((await admin.api('POST', `/api/drafts/${doomed.id}/reject`, { note: 'Tohle nechceme.' })).body.draft?.status === 'rejected', 'an admin rejects a change')
  const rejectedTab = (await eva.api('GET', '/api/reviews?tab=rejected')).body
  check(rejectedTab.length === 1 && rejectedTab[0].id === doomed.id && rejectedTab[0].decisionNote === 'Tohle nechceme.' && rejectedTab[0].decidedBy === 'Ada Správcová', 'the rejected tab lists the change with who rejected it and why')
  const counts = (await eva.api('GET', '/api/reviews/counts')).body
  check(counts.open === 0 && counts.published === 1 && counts.rejected === 1, 'the review tabs are counted')
  await eva.page.goto(`${BASE}/kontrola?stav=zamitnuto`)
  check(await eva.page.locator('a.draft', { hasText: 'Tohle nechceme.' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'the rejected tab shows why')

  // ——— History and rollback ———
  const hist = (await eva.api('GET', '/api/history/z6/matematika/prvocisla')).body
  check(hist.length === 2 && hist[0].current && hist[0].approvedBy[0] === 'Eva Učitelka' && hist[1].reason === 'import', 'the history lists both versions with who approved')
  const back = await eva.api('POST', `/api/versions/${hist[1].id}/rollback`, {})
  check(back.status === 200 && back.body.draft.rollbackOf === hist[1].id, 'going back to a version is a draft')
  await eva.api('POST', `/api/drafts/${back.body.draft.id}/submit`, { note: 'Vracím' })
  check((await eva.api('POST', `/api/drafts/${back.body.draft.id}/review`, { verdict: 'approve', rev: back.body.draft.rev })).status === 403, 'a moderator never approves their own change')
  const appr = await admin.api('POST', `/api/drafts/${back.body.draft.id}/review`, { verdict: 'approve', rev: back.body.draft.rev })
  check(appr.status === 200 && appr.body.released === 3, 'the rollback is published after approval')
  check(!(await topicText()).includes('7 je prvočíslo'), 'the topic is back as it was')
  const h3 = (await eva.api('GET', '/api/history/z6/matematika/prvocisla')).body
  check(h3.length === 3 && h3[0].reason === 'rollback', 'the rollback is a new version (nothing is lost)')
  check((await eva.api('POST', `/api/admin/versions/${h3[1].id}/restore`, { note: 'x' })).status === 403, 'only admins restore without review')
  const now = await admin.api('POST', `/api/admin/versions/${h3[1].id}/restore`, { note: 'Test obnovy' })
  check(now.status === 200 && (await topicText()).includes('7 je prvočíslo'), 'an admin restores a version at once')
  const rel = await admin.api('POST', '/api/admin/releases/1/restore', { note: 'Zpět na import' })
  check(rel.status === 200 && rel.body.docs === 1 && !(await topicText()).includes('7 je prvočíslo'), 'an admin restores the whole content of a release')
  const sys = (await admin.api('GET', '/api/admin/system')).body
  // Every imported document has one version, plus the four changes above.
  check(sys.chainOk && sys.release === 5 && sys.versions === sys.docs + 4, 'the hash chain of the history is intact')

  // ——— API tokens ———
  const tok = await eva.api('POST', '/api/me/tokens', { label: 'Agent', days: 7 })
  check(tok.status === 200 && /^spt_/.test(tok.body.token), 'a moderator creates an API token')
  const bearer = (method, path, body, t = tok.body.token) => fetch(`${BASE}${path}`, { method, headers: { Authorization: `Bearer ${t}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  check((await bearer('GET', '/api/drafts')).status === 200, 'a token reads drafts')
  const viaToken = await bearer('POST', '/api/drafts', { kind: 'edit', grade: 'z5', subject: 'matematika', topicId: 'velka-cisla' })
  const tokDraft = (await viaToken.json()).draft
  check(viaToken.status === 200 && tokDraft.author.name === 'Eva Učitelka', 'a token creates drafts in its owner’s name (no Origin needed)')
  check((await bearer('POST', `/api/drafts/${draftId}/review`, { verdict: 'comment', body: 'x' })).status === 403, 'a token cannot review')
  check((await bearer('GET', '/api/me/tokens')).status === 403, 'a token cannot manage tokens')
  const opening = { kind: 'edit', grade: 'z5', subject: 'matematika', topicId: 'velka-cisla' }
  let last = 0
  for (let i = 0; i < 60; i++) last = (await bearer('POST', '/api/drafts', opening)).status
  check(last === 429, 'a token is slowed down after 60 drafts opened in 10 minutes')
  check((await eva.api('POST', '/api/drafts', opening)).status === 200, 'a busy script does not lock its owner out of opening topics in the browser')
  const fastTok = await admin.api('POST', '/api/me/tokens', { label: 'AI', days: 7 })
  let adminLast = 0
  for (let i = 0; i < 61; i++) adminLast = (await bearer('POST', '/api/drafts', opening, fastTok.body.token)).status
  check(fastTok.status === 200 && adminLast === 200, 'an admin’s token is not slowed down: an admin loads whole subjects')
  await admin.api('DELETE', `/api/me/tokens/${fastTok.body.id}`)
  check((await bearer('GET', '/api/drafts', null, 'spt_' + 'x'.repeat(43))).status === 401, 'an unknown token is refused')
  check((await bearer('GET', '/api/drafts', null, BACKUP)).status === 401, 'the backup token is not a moderator token')
  await eva.api('DELETE', `/api/me/tokens/${tok.body.id}`)
  check((await bearer('GET', '/api/drafts')).status === 401, 'a removed token stops working')
  const adminTok = (await admin.api('POST', '/api/me/tokens', { label: 'Admin agent', days: 7 })).body.token
  check((await (await bearer('GET', '/api/drafts?all=1', null, adminTok)).json()).every((x) => x.author.name === 'Ada Správcová'), "an admin's token sees only her own drafts")
  check((await bearer('GET', `/api/drafts/${tokDraft.id}`, null, adminTok)).status === 404, "an admin's token cannot read others' unsent drafts")
  check((await bearer('DELETE', `/api/drafts/${tokDraft.id}`, null, adminTok)).status === 404, "an admin's token cannot delete others' drafts")
  const sneaky = await fetch(`${BASE}/api/me/sessions/end-others`, { method: 'POST', headers: { Authorization: 'Bearer x', Cookie: `moderace=${cookie.value}`, Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })
  check(sneaky.status === 403, 'a bearer header does not skip the origin check of a cookie request')
  await admin.api('POST', '/api/me/sessions/end-others', {})
  check((await bearer('GET', '/api/drafts', null, adminTok)).status === 401, 'signing out other devices also ends API tokens')

  // ——— Widget requests ———
  const wr = await eva.api('POST', '/api/widget-requests', { title: 'Váhy na rovnice', body: 'Děti přidávají a odebírají závaží na obou miskách a vidí, že rovnováha zůstane.' })
  check(wr.status === 200, 'a moderator asks for a new widget')
  check((await admin.api('POST', `/api/widget-requests/${wr.body.id}/vote`, {})).status === 200, 'others vote for it')
  check((await eva.api('PATCH', `/api/widget-requests/${wr.body.id}`, { status: 'done' })).status === 200 && (await eva.api('GET', '/api/widget-requests')).body[0].status === 'new', 'only admins change the state')
  check((await admin.api('PATCH', `/api/widget-requests/${wr.body.id}`, { status: 'planned', widget: 'balance' })).status === 200, 'an admin plans it and links a widget')
  const reqs = (await admin.api('GET', '/api/widget-requests')).body
  check(reqs[0].votes === 2 && reqs[0].status === 'planned', 'votes and state are kept')
  await eva.page.goto(`${BASE}/pomucky`)
  const have = eva.page.locator('.have')
  await have.locator('.sc-item').first().waitFor()
  await have.locator('.sc-item', { hasText: 'Hodiny' }).click()
  check(await have.locator('.sc-item').count() >= 20 && await eva.page.frameLocator('.have iframe').locator('.blocks > *').first().waitFor({ timeout: 5000 }).then(() => true, () => false)
    && await have.locator('.sc-head h3').textContent() === 'Hodiny', 'the requests page shows every existing widget working')

  // ——— Error reports from pupils (forwarded by the server of sprtam.cz) ———
  const report = (body, t = REPORT) => fetch(`${BASE}/api/public/v1/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: JSON.stringify(body) })
  const rp = { topic: 'z6/matematika/prvocisla', target: { kind: 'question', index: 2, text: 'Je 1 prvočíslo?' }, reason: 'wrong', note: 'Myslím, že odpověď je obráceně.', release: 6 }
  check((await report(rp, 'nope')).status === 401 && [401, 403].includes((await report(rp, '')).status) && (await report(rp, BACKUP)).status === 401, 'a report needs the report token')
  check((await report({ ...rp, reason: 'spam' })).status === 400 && (await report({ ...rp, target: { kind: 'x', index: 0, text: 'a' } })).status === 400, 'a malformed report is refused')
  const sent = await report(rp)
  check(sent.status === 200, 'the server of sprtam.cz forwards a report')
  await report({ ...rp, topic: 'z5/matematika/velka-cisla', target: { kind: 'explanation', index: 0, text: 'Na číselné ose' }, reason: 'unclear', note: '', quote: '  na   číselné\n ose ' })
  const open = (await eva.api('GET', '/api/reports')).body
  check(open.length === 2 && open.some((r) => r.topic === rp.topic && r.title && r.note === rp.note && r.target.index === 2 && r.quote === '') && open.some((r) => r.quote === 'na číselné ose'), 'moderators see open reports with the topic title and the marked words')
  check((await eva.api('GET', '/api/reports?grade=z6&subject=matematika')).body.length === 1 && (await eva.api('GET', `/api/reports/counts?topic=${rp.topic}`)).body.open === 1, 'reports filter by grade, subject and topic')
  check((await fetch(`${BASE}/api/reports`)).status === 401, 'reports are only for moderators')
  const fixedOne = open.find((r) => r.topic === rp.topic)
  check((await eva.api('PATCH', `/api/reports/${fixedOne.id}`, { status: 'fixed' })).status === 200, 'a moderator closes a report as fixed')
  const closed = (await eva.api('GET', '/api/reports?status=closed')).body
  check(closed.length === 1 && closed[0].status === 'fixed' && closed[0].decidedBy === 'Eva Učitelka', 'a closed report remembers who closed it')
  const c = (await eva.api('GET', '/api/reports/counts')).body
  check(c.open === 1 && c.closed === 1, 'counts of open and closed reports')
  await eva.page.goto(`${BASE}/hlaseni`)
  check(await eva.page.locator('.report').first().waitFor({ timeout: 5000 }).then(() => true, () => false) && await eva.page.locator('.report').count() === 1 && (await eva.page.locator('.top .tabs').textContent()).includes('Hlášení · 1'), 'the reports screen lists the open ones, the tab counts them')
  await eva.page.goto(`${BASE}/ucivo/z5/matematika/velka-cisla`)
  check(await eva.page.getByText('1 otevřené hlášení').waitFor({ timeout: 5000 }).then(() => true, () => false), 'the topic shows its open reports')

  // ——— Backups ———
  const bk = await fetch(`${BASE}/api/internal/backup`, { headers: { Authorization: `Bearer ${BACKUP}` } })
  const bkBody = Buffer.from(await bk.arrayBuffer())
  check(bk.status === 200 && bkBody[0] === 0x1f && bkBody[1] === 0x8b && bk.headers.get('x-content-chain-ok') === '1', 'the backup puller gets a gzipped snapshot with the chain')
  check((await fetch(`${BASE}/api/internal/backup`, { headers: { Authorization: 'Bearer nope' } })).status === 401, 'a wrong backup token is refused')
  check((await fetch(`${BASE}/api/internal/backup`, { headers: { Cookie: `moderace=${cookie.value}` } })).status === 401, 'a session is not enough for a backup')
  const rels = await (await fetch(`${BASE}/api/internal/releases?after=1`, { headers: { Authorization: `Bearer ${BACKUP}` } })).json()
  check(rels.releases.length === 4, 'the mirror gets the releases after one')
  check((await admin.api('GET', '/api/admin/system')).body.backup.lastAt > 0, 'admins see when the last backup ran')

  // ——— An admin approves her own change (with a fresh passkey confirmation) ———
  const own = (await admin.api('POST', '/api/drafts', { kind: 'edit', grade: 'z6', subject: 'matematika', topicId: 'prvocisla' })).body
  const ownTopic = { ...own.topic, explanations: own.topic.explanations.map((x, i) => (i ? x : { ...x, blocks: x.blocks.map((b, j) => (j === 1 ? { ...b, text: `${b.text} Doplněno.` } : b)) })) }
  const ownRev = (await admin.api('PUT', `/api/drafts/${own.draft.id}`, { topic: ownTopic, rev: own.draft.rev })).body.rev
  await admin.api('POST', `/api/drafts/${own.draft.id}/submit`, {})
  await admin.page.goto(`${BASE}/kontrola/${own.draft.id}`)
  check(await admin.page.locator('.decide.t-act').getByRole('button', { name: 'Schválit a zveřejnit' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'an admin sees she can approve her own change')
  const self = await admin.api('POST', `/api/drafts/${own.draft.id}/review`, { verdict: 'approve', rev: ownRev })
  check(self.status === 200 && self.body.released === 6 && (await topicText()).includes('Doplněno.'), "an admin's own approval publishes her change")

  // ——— Odborné předměty: new topics found a předmět; published in any order, they keep the intended one ———
  const base = (await (await fetch(`${BASE}/api/content/topic/z6/matematika/prvocisla`)).json()).topic
  const order = ['odb-prvni', 'odb-druhe']
  const meta = { name: 'Testovací předmět', emoji: '🧪', color: 'teal' }
  check((await admin.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'testovaci', topic: { ...base, id: 'odb-prvni' } })).status === 400, 'a new odborný předmět needs its name, emoji and colour')
  check((await admin.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'matematika', subjectMeta: meta, topic: { ...base, id: 'odb-prvni' } })).status === 400, 'an odborný předmět cannot take the id of a core subject')
  const founded = []
  for (const id of order) {
    const r = await admin.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'testovaci', subjectMeta: meta, order, topic: { ...base, id, title: `Téma ${id}` } })
    founded.push(r.body)
    await admin.api('POST', `/api/drafts/${r.body.draft.id}/submit`, {})
  }
  check(founded.every((f) => f.subject?.name === meta.name && !f.problems.length), 'drafts of a new odborný předmět pass the checks and say what they found')
  // The second topic is approved first: it founds the předmět; the first one then goes before it.
  const pub = async (f) => (await eva.api('POST', `/api/drafts/${f.draft.id}/review`, { verdict: 'approve', rev: (await eva.api('GET', `/api/drafts/${f.draft.id}`)).body.draft.rev })).status
  check(await pub(founded[1]) === 200 && await pub(founded[0]) === 200, 'a reviewer approves both topics')
  const mOdb = await manifest()
  const list = await (await fetch(`${BASE}/api/public/v1/files/${mOdb.files['subject/odb/testovaci']}`)).json()
  check(mOdb.vocational?.testovaci?.name === meta.name && mOdb.vocational.testovaci.c === 'teal', 'the release names the new odborný předmět')
  check(list.map((t) => t.id).join() === order.join(), 'topics approved out of order keep the intended order')
  check((await admin.api('GET', '/api/content/index')).body.subjects['odb/testovaci']?.length === 2, 'the library lists the odborný předmět')
  // A new batch for the existing předmět: none of its intended order is published yet, so `after` decides.
  const more = (await admin.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'testovaci', after: 'odb-druhe', order: ['odb-treti', 'odb-ctvrte'], topic: { ...base, id: 'odb-treti' } })).body
  await admin.api('POST', `/api/drafts/${more.draft.id}/submit`, {})
  check(await pub(more) === 200, 'a reviewer approves a topic added to the předmět')
  const list2 = await (await fetch(`${BASE}/api/public/v1/files/${(await manifest()).files['subject/odb/testovaci']}`)).json()
  check(list2.map((t) => t.id).join() === [...order, 'odb-treti'].join(), 'a topic added later goes after its `after`, not to the start')

  // ——— Unverified content: AI content goes out at once, a person checks it later ———
  const topicNow = async (g, sub, id) => (await (await fetch(`${BASE}/api/content/topic/${g}/${sub}/${id}`)).json())
  check(!(await topicNow('odb', 'testovaci', 'odb-prvni')).topic.verified?.by.includes('?') && (await topicNow('odb', 'testovaci', 'odb-prvni')).topic.verified?.by === 'Eva Učitelka', 'a change approved in review is published as verified by its reviewer')
  const ai = []
  for (const id of ['ai-prvni', 'ai-druhe']) {
    const r = await admin.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'ai-predmet', subjectMeta: { name: 'AI předmět', emoji: '🤖', color: 'red' }, order: ['ai-prvni', 'ai-druhe'], topic: { ...base, id, title: `AI ${id}` } })
    ai.push(r.body.draft.id)
  }
  const evaDraftAi = (await eva.api('POST', '/api/drafts', { kind: 'new', grade: 'odb', subject: 'ai-predmet', subjectMeta: { name: 'AI předmět', emoji: '🤖', color: 'red' }, topic: { ...base, id: 'ai-evy' } })).body.draft.id
  check((await eva.api('POST', '/api/drafts/publish-unverified', { ids: [evaDraftAi] })).status === 403, 'a moderator cannot publish without review')
  check((await admin.api('POST', '/api/drafts/publish-unverified', { ids: [evaDraftAi] })).status === 403, "an admin cannot publish someone else's draft without review")
  const pu = await admin.api('POST', '/api/drafts/publish-unverified', { ids: ai })
  const aiList = await (await fetch(`${BASE}/api/public/v1/files/${(await manifest()).files['subject/odb/ai-predmet']}`)).json()
  check(pu.status === 200 && pu.body.published === 2 && aiList.map((t) => t.id).join() === 'ai-prvni,ai-druhe' && aiList.every((t) => !t.verified), 'an admin publishes drafts at once, as unverified, in one release')
  check((await admin.api('GET', `/api/drafts/${ai[0]}`)).body.draft.status === 'published', 'drafts published without review are closed')
  // Someone starts editing, then another moderator verifies the topic: no conflict for the edit.
  const editing = (await admin.api('POST', '/api/drafts', { kind: 'edit', grade: 'odb', subject: 'ai-predmet', topicId: 'ai-prvni' })).body
  const t1 = await topicNow('odb', 'ai-predmet', 'ai-prvni')
  check((await eva.api('POST', '/api/content/verify', { grade: 'odb', subject: 'ai-predmet', topicId: 'ai-prvni', version: t1.version - 1 })).status === 409, 'verifying an older version than the published one is refused')
  const ver = await eva.api('POST', '/api/content/verify', { grade: 'odb', subject: 'ai-predmet', topicId: 'ai-prvni', version: t1.version })
  const t2 = await topicNow('odb', 'ai-predmet', 'ai-prvni')
  check(ver.status === 200 && t2.topic.verified?.by === 'Eva Učitelka' && /^\d{4}-\d{2}-\d{2}$/.test(t2.topic.verified.at), 'a moderator verifies a topic: who and when')
  check((await eva.api('POST', '/api/content/verify', { grade: 'odb', subject: 'ai-predmet', topicId: 'ai-prvni', version: t2.version })).status === 409, 'a verified topic cannot be verified again')
  check(!(await admin.api('GET', `/api/drafts/${editing.draft.id}`)).body.draft.conflict, 'verifying does not put open edits of the topic in conflict')
  check((await admin.api('GET', '/api/content/index')).body.subjects['odb/ai-predmet'].map((t) => !!t.verified).join() === 'true,false', 'the library knows which topics are verified')

  // ——— Applications to become a moderator (the app's "Chci to zkontrolovat a schválit" leads here) ———
  await teacher.page.goto(`${BASE}/ucivo/odb/ai-predmet/ai-druhe`)
  await teacher.page.getByRole('link', { name: 'Chci to schválit' }).click()
  await teacher.page.waitForURL(/\/zapojit-se\?tema=odb\/ai-predmet\/ai-druhe$/)
  check(await teacher.page.getByText('Přicházíš od tématu').waitFor({ timeout: 5000 }).then(() => true, () => false) && await teacher.page.getByText('AI ai-druhe').isVisible(), 'an unverified topic leads a visitor to the application form, which names the topic')
  await teacher.page.getByLabel('Jméno a příjmení').fill('Jana Pedagožková')
  await teacher.page.getByLabel('E-mail').fill('Jana@Skola.example')
  await teacher.page.getByRole('radio', { name: 'Ano, učím' }).check()
  await teacher.page.getByLabel('Jaké předměty učíš?').fill('matematika, fyzika')
  await teacher.page.getByLabel(/Něco dalšího/).fill('Učím na gymnáziu.')
  await teacher.page.getByRole('button', { name: 'Odeslat žádost' }).click()
  check(await teacher.page.getByText('Díky, žádost máme').waitFor({ timeout: 5000 }).then(() => true, () => false), 'a visitor sends the application without an account')
  const apply = (body) => teacher.api('POST', '/api/applications', { name: 'Karel Zvědavý', email: 'karel@example.cz', teacher: false, ...body })
  check((await apply({ email: 'jana@skola.example', teacher: true, subjects: 'čeština' })).status === 409, 'a second open application with the same e-mail is refused')
  check((await apply({ email: 'není e-mail' })).status === 400, 'an application needs a valid e-mail')
  check((await apply({ website: 'https://spam.example' })).status === 200, 'a bot filling the hidden field is told it worked…')
  check((await fetch(`${BASE}/api/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'X Y', email: 'x@y.cz', teacher: false }) })).status === 403, 'an application from another site is refused')
  check((await eva.api('GET', '/api/admin/applications')).status === 403, 'only admins read the applications')
  const apps = (await admin.api('GET', '/api/admin/applications')).body
  const jana = apps.applications[0]
  check(apps.counts.open === 1 && apps.applications.length === 1 && jana.email === 'jana@skola.example' && jana.teacher && jana.subjects === 'matematika, fyzika' && jana.topic?.key === 'odb/ai-predmet/ai-druhe', '…but only real applications are stored, with the topic they came from')
  await admin.page.goto(`${BASE}/zadosti`)
  await admin.page.locator('.application').first().waitFor()
  check((await admin.page.locator('.top .tabs').textContent()).includes('Žádosti · 1'), 'the admins\' tab counts open applications')
  await admin.page.getByRole('button', { name: 'Schválit a vytvořit pozvánku' }).click()
  const invite = await admin.page.locator('.linkbox code').textContent({ timeout: 5000 })
  check(invite.startsWith(`${BASE}/pozvanka#`) && (await admin.page.getByRole('link', { name: 'Napsat e-mail s odkazem' }).getAttribute('href')).startsWith('mailto:jana%40skola.example'), 'approving gives an invite link to share, with a ready e-mail')
  await admin.page.getByRole('button', { name: 'Hotovo' }).click()
  const janaDev = await device()
  await janaDev.page.goto(invite)
  await janaDev.page.getByText('Vítej, Jana Pedagožková!').waitFor()
  await janaDev.page.getByRole('button', { name: 'Vytvořit přístupový klíč' }).click()
  check(await signedInAs(janaDev.page, 'Jana') && (await janaDev.api('GET', '/api/session')).body.user.role === 'moderator', 'the applicant creates a moderator account with the link')
  const decided = (await admin.api('GET', '/api/admin/applications?status=decided')).body.applications
  check(decided[0]?.status === 'approved' && decided[0].joined === true && decided[0].decidedBy === 'Ada Správcová', 'the approved application shows who approved it and that the account exists')
  check((await admin.api('POST', `/api/admin/applications/${jana.id}/approve`)).status === 409, 'no second link once the account exists')
  check((await apply({})).status === 200, 'another application arrives')
  const karel = (await admin.api('GET', '/api/admin/applications')).body.applications[0]
  check((await admin.api('POST', `/api/admin/applications/${karel.id}/reject`, { note: 'Neznáme.' })).status === 200 && (await admin.api('GET', '/api/admin/applications/counts')).body.open === 0, 'an admin rejects an application')
  check((await admin.api('POST', `/api/admin/applications/${karel.id}/approve`)).status === 409, 'a rejected application cannot be approved')

  // Vocabulary of other languages: only an admin publishes it, and only valid.
  const de = { format: 1, lang: 'de', level: 'A1', groups: [{ name: 'Zvířata', emoji: '🐾', words: [{ cz: 'pes', word: 'der Hund', similar: 'der Mund', related: 'die Katze' }] }] }
  const evaTok = (await eva.api('POST', '/api/me/tokens', { label: 'Slovíčka', days: 7 })).body.token
  check((await bearer('POST', '/api/content/words', { files: [{ lang: 'de', level: 'A1', data: de }] }, evaTok)).status === 403, 'a moderator cannot publish vocabulary')
  const dup = { ...de, groups: [{ ...de.groups[0], words: [de.groups[0].words[0], de.groups[0].words[0]] }] }
  check((await admin.api('POST', '/api/content/words', { files: [{ lang: 'de', level: 'A1', data: dup }] })).status === 422, 'vocabulary with a word twice is refused')
  check((await admin.api('POST', '/api/content/words', { files: [{ lang: 'xx', level: 'A1', data: de }] })).status === 400, 'an unknown language is refused')
  const words = await admin.api('POST', '/api/content/words', { files: [{ lang: 'de', level: 'A1', data: de }] })
  check(words.status === 200 && words.body.published === 1, 'an admin publishes German vocabulary')
  const wm = await (await fetch(`${BASE}/api/public/v1/manifest`)).json()
  check(!!wm.files['words/de/A1'] && !Object.keys(wm.files).some((n) => n.startsWith('vocab/de')), 'the release has it as words/de/A1')

  // ——— Moderators' profiles: each presents themselves as they like; public only when they say so ———
  const evaId = (await eva.api('GET', '/api/session')).body.user.id
  const anonList = async () => (await (await fetch(`${BASE}/api/moderators`)).json())
  check(Array.isArray(await anonList()) && (await anonList()).length === 0, 'nobody is listed publicly before making their profile public')
  check((await fetch(`${BASE}/api/moderators/${evaId}`)).status === 404, 'a profile that is not public is not shown to visitors')
  const evaProfile = (await eva.api('GET', '/api/me/profile')).body
  check(evaProfile.public === false && evaProfile.topics.some((t) => t.key === 'odb/ai-predmet/ai-prvni') && evaProfile.topics.some((t) => t.key === 'odb/testovaci/odb-prvni') && evaProfile.verified === evaProfile.topics.length, 'the profile lists the topics its owner checked (by review and by "Ověřit")')
  const profile = { name: 'Mgr. Eva Učitelka', headline: 'Učitelka matematiky', bio: 'Učím 15 let.\n\n\n\nRáda kontroluju.', subjects: ['matematika', 'neexistuje', 'testovaci'], web: 'skola.example/eva', avatar: '🦉', public: true }
  check((await eva.api('PUT', '/api/me/profile', { ...profile, name: 'Eva, Učitelka' })).status === 400, 'a name with a comma is refused (checkers are joined by commas)')
  check((await eva.api('PUT', '/api/me/profile', { ...profile, name: 'ada správcová' })).status === 409, "a moderator cannot take another moderator's name")
  check((await eva.api('PUT', '/api/me/profile', { ...profile, web: 'javascript:alert(1)' })).status === 400 && (await eva.api('PUT', '/api/me/profile', { ...profile, web: 'http://skola.example' })).status === 400, 'only https web addresses')
  check((await bearer('PUT', '/api/me/profile', profile, evaTok)).status === 403, 'an API token cannot change the profile')
  const savedProfile = await eva.api('PUT', '/api/me/profile', profile)
  check(savedProfile.status === 200 && savedProfile.body.name === 'Mgr. Eva Učitelka' && savedProfile.body.web === 'https://skola.example/eva' && savedProfile.body.bio === 'Učím 15 let.\n\nRáda kontroluju.' && savedProfile.body.subjects.join() === 'matematika,testovaci' && savedProfile.body.avatar === '🦉', 'a moderator saves the profile, cleaned up (subjects, web, paragraphs)')
  check((await eva.api('PUT', '/api/me/profile', { ...profile, avatar: '<b>' })).body.avatar === '', 'only pictures from the offered set')
  await eva.api('PUT', '/api/me/profile', profile)
  check((await eva.api('GET', '/api/session')).body.user.name === 'Mgr. Eva Učitelka', 'the new name is the account name')
  const publicList = await anonList()
  check(publicList.length === 1 && publicList[0].id === evaId && publicList[0].verified === evaProfile.verified && publicList[0].public, 'the public profile is listed, its checked topics kept after the rename')
  check(!JSON.stringify(publicList).includes('webauthn') && !('email' in publicList[0]) && !('lastLoginAt' in publicList[0]), 'the public list carries nothing private')
  check((await admin.api('GET', '/api/moderators')).body.length >= 3, 'signed-in moderators see all their active colleagues')
  check((await admin.api('PUT', '/api/me/profile', { ...profile, name: 'Ada Správcová', public: false })).status === 200 && (await anonList()).length === 1, 'a profile that is not public stays off the public list')
  await teacher.page.goto(`${BASE}/moderatori?jmeno=${encodeURIComponent('Mgr. Eva Učitelka')}`)
  check(await teacher.page.getByRole('heading', { name: 'Mgr. Eva Učitelka' }).waitFor({ timeout: 5000 }).then(() => true, () => false) && teacher.page.url() === `${BASE}/moderatori/${evaId}`, 'a name from a topic opens that profile')
  check(await teacher.page.locator('.p-bio').textContent() === 'Učím 15 let.\n\nRáda kontroluju.' && await teacher.page.locator('.p-topics a').count() === evaProfile.topics.length && (await teacher.page.getByRole('link', { name: 'skola.example' }).getAttribute('rel')).includes('nofollow'), 'the profile shows the text, the checked topics and the web link')
  const byName = async (n) => (await (await fetch(`${BASE}/api/moderators/by-name?name=${encodeURIComponent(n)}`)).json()).id
  check(await byName('Eva Učitelka') === evaId && await byName('MGR. EVA UČITELKA') === evaId, 'a topic checked before a change of name still leads to the profile (any case, Czech letters too)')
  check((await admin.api('PUT', '/api/me/profile', { ...profile, name: 'EVA UČITELKA', public: false })).status === 409 && (await admin.api('POST', '/api/admin/invites', { name: 'eva učitelka', role: 'moderator' })).status === 409, "nobody else may take a moderator's former name")
  check((await fetch(`${BASE}/api/moderators/by-name?name=${encodeURIComponent('Ada Správcová')}`)).status === 404, 'a name without a public profile is not found')
  await teacher.page.goto(`${BASE}/moderatori?jmeno=Ada%20Spr%C3%A1vcov%C3%A1`)
  check(await teacher.page.getByText('nemá veřejný profil').waitFor({ timeout: 5000 }).then(() => true, () => false) && await teacher.page.locator('.p-card').count() === 1, 'a name without a public profile shows the list')
  await eva.page.goto(`${BASE}/ucet`)
  await eva.page.getByRole('heading', { name: 'Můj profil' }).waitFor()
  await eva.page.getByLabel('Kdo jsem').fill('Učitelka matematiky a fyziky')
  await eva.page.getByRole('button', { name: 'Uložit profil' }).click()
  check(await eva.page.getByText('Profil uložen').waitFor({ timeout: 5000 }).then(() => true, () => false) && (await eva.api('GET', '/api/me/profile')).body.headline === 'Učitelka matematiky a fyziky', 'the profile is edited in Účet')

  check([admin, mod, teacher, eva, janaDev].every((d) => !d.errors.length), 'no errors in the pages')
} finally {
  await browser.close()
  server.kill()
  rmSync(data, { recursive: true, force: true })
}
console.log(failed ? `${failed} failed` : 'all passed')
process.exit(failed ? 1 : 0)
