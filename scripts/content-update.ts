// Sends changes of published topics from the local content/ to moderation (docs/OBSAH.md, "API pro moderování"):
//   npx tsx scripts/content-update.ts topics/z5/matematika [topics/z5/cestina …] [--unverified] [--note "Doplněny otázky"]
// Every topic of each folder that differs from its published version becomes an "edit" draft with the local content
// and is sent for review. With --unverified (admins only) the drafts are published at once instead, marked unverified
// (the way content by AI goes, docs/OBSAH.md "Neověřené učivo") – except topics a person has already verified: those
// still go for review, so nobody's check disappears without a look. Topics equal to the published version are skipped,
// so running it again only does what is missing. When moderation says to slow down (429), it waits and goes on.
// Topics changed in moderation after content:pull would be overwritten: pull, change, then run this right away.
//   SPRTAM_TOKEN=spt_…  (or the file ~/.config/sprtam/api-token)   CONTENT_API=https://moderace.sprtam.cz (default)
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CONTENT } from '../plugins/content'
import { stripSchema } from '../src/content/docs'
import { withoutVerified } from '../src/content/verified'
import type { SubjectFile, TopicFile } from '../src/content/types'

const api = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
const tokenFile = join(homedir(), '.config/sprtam/api-token')
const token = (process.env.SPRTAM_TOKEN ?? (existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8') : '')).trim()
if (!token.startsWith('spt_')) { console.error(`No API token: set SPRTAM_TOKEN or put it in ${tokenFile} (Moderace → Účet → API tokeny).`); process.exit(1) }
const args = process.argv.slice(2)
const unverified = args.includes('--unverified')
const noteAt = args.indexOf('--note')
const note = noteAt >= 0 ? args[noteAt + 1] ?? '' : 'Úprava tématu'
const folders = args.filter((a, i) => a !== '--unverified' && i !== noteAt && i !== noteAt + 1)
if (!folders.length || !note) { console.error('Usage: npx tsx scripts/content-update.ts topics/<grade>/<subject> … [--unverified] [--note "…"]'); process.exit(1) }

async function call(method: string, path: string, body?: unknown): Promise<{ status: number; body: Record<string, any> | null }> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${api}${path}`, {
      method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.timeout(60_000),
    })
    const out = { status: res.status, body: (await res.json().catch(() => null)) as Record<string, any> | null }
    if (res.status !== 429 || attempt >= 20) return out
    const wait = Math.min(600, Number(res.headers.get('Retry-After')) || 60)
    console.log(`… moderation asks to slow down, waiting ${wait} s`)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
}

const read = <T>(file: string) => stripSchema(JSON.parse(readFileSync(file, 'utf8'))) as T
const same = (a: unknown, b: unknown) => JSON.stringify(withoutVerified(a)) === JSON.stringify(withoutVerified(b))
let sent = 0, published = 0, skipped = 0, failed = 0
/** Drafts to publish at once (--unverified), at most 200 per request. */
const batch: string[] = []
async function flush() {
  if (!batch.length) return
  const ids = batch.splice(0)
  const r = await call('POST', '/api/drafts/publish-unverified', { ids })
  if (r.status === 200) { console.log(`✓ ${ids.length} published as unverified (release ${r.body?.release})`); published += ids.length }
  else { console.log(`✗ ${ids.length} not published: ${r.status} ${JSON.stringify(r.body?.problems ?? r.body?.error ?? '')}`); failed += ids.length }
}

for (const folder of folders) {
  const [kind, grade, subject] = folder.replace(/^content\//, '').replace(/\/$/, '').split('/')
  if (kind !== 'topics' || !grade || !subject) { console.error(`${folder}: expected topics/<grade>/<subject>`); failed++; continue }
  const dir = join(CONTENT, kind, grade, subject)
  for (const id of read<SubjectFile>(join(dir, '_subject.json')).topics) {
    const name = `${grade}/${subject}/${id}`
    const local = read<TopicFile>(join(dir, `${id}.json`))
    const now = await call('GET', `/api/content/topic/${grade}/${subject}/${id}`)
    if (now.status === 404) { console.log(`· ${name}: not published yet (scripts/content-propose.ts)`); skipped++; continue }
    if (now.status !== 200) { console.log(`✗ ${name}: ${now.status} ${now.body?.error ?? ''}`); failed++; continue }
    const current = now.body!.topic as TopicFile
    if (same(current, local)) { skipped++; continue }
    // One open draft per moderator and topic: an open one is continued.
    const d = await call('POST', '/api/drafts', { kind: 'edit', grade, subject, topicId: id })
    if (d.status !== 200) { console.log(`✗ ${name}: ${d.status} ${d.body?.error ?? ''}`); failed++; continue }
    const draft = d.body!.draft as { id: string; status: string; rev: number }
    if (draft.status === 'review') { console.log(`· ${name}: my draft ${draft.id} is in review already`); skipped++; continue }
    const save = await call('PUT', `/api/drafts/${draft.id}`, { topic: withoutVerified(local), rev: draft.rev })
    if (save.status !== 200) { console.log(`✗ ${name}: draft ${draft.id} not saved: ${save.status} ${save.body?.error ?? ''}`); failed++; continue }
    if (unverified && !current.verified) {
      batch.push(draft.id)
      if (batch.length >= 200) await flush()
      continue
    }
    const sub = await call('POST', `/api/drafts/${draft.id}/submit`, { note })
    if (sub.status !== 200) { console.log(`✗ ${name}: draft ${draft.id} saved, but not sent: ${sub.status} ${JSON.stringify(sub.body?.problems ?? sub.body?.error ?? '')}`); failed++; continue }
    console.log(`✓ ${name} → ${api}/kontrola/${draft.id}${current.verified ? ' (verified topic, sent for review)' : ''}`)
    sent++
  }
  // Publish each subject as it is done, so a stop halfway keeps what is published.
  await flush()
}
console.log(`${published} published as unverified, ${sent} sent for review, ${skipped} skipped, ${failed} failed`)
process.exit(failed ? 1 : 0)
