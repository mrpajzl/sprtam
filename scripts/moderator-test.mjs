// Moderation end to end (docs/MODERACE.md): starts the built server (npm run moderator:build first) on a free
// port with an empty database and drives Chromium with virtual passkeys through sign-in, the editor and the
// security rules. GitHub is not touched (no token): sending a draft is tested only up to that point.
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
const env = { ...process.env, PORT: String(port), ORIGIN: BASE, DATA_DIR: data, GITHUB_TOKEN: '' }
const server = spawn('node', ['--no-warnings', 'moderator/dist-server/index.mjs'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise((r) => server.stdout.once('data', r))
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
  await admin.page.getByRole('button', { name: 'Přihlásit se klíčem' }).click()
  check(await signedInAs(admin.page, 'Ada'), 'passkey sign-in works')
  const opts = await admin.api('POST', '/api/auth/login/options', {})
  const forged = opts.body.challengeId.replace(/\.[^.]+$/, '.AAAA')
  check((await admin.api('POST', '/api/auth/login/verify', { challengeId: forged, response: { id: 'x' } })).status === 400, 'a forged login challenge is refused')
  check((await admin.api('GET', '/api/content/index')).status === 200, 'signed-in API works')

  // ——— Cross-site and anonymous requests ———
  const evil = await fetch(`${BASE}/api/drafts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', Cookie: `moderace=${cookie.value}` }, body: '{}' })
  check(evil.status === 403, 'a request from a foreign origin is refused even with the cookie')
  const anon = await fetch(`${BASE}/api/content/index`)
  check(anon.status === 401, 'content needs a session')
  check((await fetch(`${BASE}/%E0`)).status === 400, 'a malformed URL gives 400')
  check((await fetch(`${BASE}/`)).headers.get('content-security-policy')?.includes("script-src 'self'"), 'strict CSP header')

  // ——— Editor: open a topic, edit, autosave, preview ———
  await admin.page.goto(`${BASE}/ucivo/z6/matematika`)
  await admin.page.getByRole('button', { name: /Prvočísla/ }).click()
  await admin.page.waitForURL(/\/navrh\//)
  const frame = admin.page.frameLocator('iframe')
  await frame.locator('.blocks').waitFor()
  await admin.page.locator('.card.t-text textarea').first().fill('Test **náhledu**.')
  check(await frame.locator('.blocks strong', { hasText: 'náhledu' }).waitFor({ timeout: 3000 }).then(() => true, () => false), 'preview shows the edit')
  check(await admin.page.locator('.save.saved').waitFor({ timeout: 5000 }).then(() => true, () => false), 'draft is saved')
  const draftId = admin.page.url().split('/').pop()

  // ——— Another moderator cannot touch it ———
  const mod = await device()
  await mod.page.goto(cli('invite', 'Petr Moderátor', 'moderator'))
  await mod.page.getByRole('button', { name: 'Vytvořit přístupový klíč' }).click()
  check(await signedInAs(mod.page, 'Petr'), 'second account created')
  check((await mod.api('GET', `/api/drafts/${draftId}`)).status === 404, "a moderator cannot read another's draft")
  check((await mod.api('PUT', `/api/drafts/${draftId}`, { topic: {}, rev: 1 })).status === 404, "a moderator cannot change another's draft")
  check((await mod.api('GET', '/api/admin/users')).status === 403, 'a moderator cannot manage users')
  check((await mod.api('POST', '/api/drafts', { kind: 'new', grade: 'z6', subject: 'matematika', topic: { id: '../../x' } })).status === 400, 'a path in a topic id is refused')
  check((await mod.api('POST', '/api/drafts', { kind: 'edit', grade: '../z6', subject: 'matematika', topicId: 'uhel' })).status === 400, 'a path in a grade is refused')

  // ——— Admin actions: key link, reset, disable ———
  const users = (await admin.api('GET', '/api/admin/users')).body.users
  const petr = users.find((u) => u.name === 'Petr Moderátor')
  const keyLink = (await admin.api('POST', `/api/admin/users/${petr.id}/key-link`, {})).body.url
  check(typeof keyLink === 'string', 'admin creates a key link (fresh sign-in)')
  check((await admin.api('POST', `/api/admin/users/${petr.id}/key-link`, { reset: true })).status === 200, 'admin resets the keys')
  check((await mod.api('GET', '/api/content/index')).status === 401, 'reset signs the user out')
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

  // ——— Submitting without GitHub ———
  const sub = await admin.api('POST', `/api/drafts/${draftId}/submit`, {})
  check(sub.status === 503 && sub.body.code === 'github', 'submitting without a GitHub token says so')

  check([admin, mod].every((d) => !d.errors.length), 'no errors in the pages')
} finally {
  await browser.close()
  server.kill()
  rmSync(data, { recursive: true, force: true })
}
console.log(failed ? `${failed} failed` : 'all passed')
process.exit(failed ? 1 : 0)
