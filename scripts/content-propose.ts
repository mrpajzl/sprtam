// Sends new topics from the local content/ to moderation as drafts for review (docs/OBSAH.md, "API pro moderování"):
//   npx tsx scripts/content-propose.ts topics/odb/programovani [topics/odb/site …]
// Every topic of each folder that is not published yet becomes a "new topic" draft, sent for review. Topics of an
// odborný předmět that does not exist yet carry its name, emoji and colour, so whichever is approved first founds it,
// and the intended order of the subject, so topics approved in any order keep it. Topics already published or
// already proposed (409) are skipped: running it again only sends what is missing. Nothing is ever published by
// this script – a person approves every draft in moderation.
//   SPRTAM_TOKEN=spt_…  (or the file ~/.config/sprtam/api-token)   CONTENT_API=https://moderace.sprtam.cz (default)
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CONTENT } from '../plugins/content'
import { stripSchema } from '../src/content/docs'
import type { SubjectFile, TopicFile } from '../src/content/types'

const api = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
const tokenFile = join(homedir(), '.config/sprtam/api-token')
const token = (process.env.SPRTAM_TOKEN ?? (existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8') : '')).trim()
if (!token.startsWith('spt_')) { console.error(`No API token: set SPRTAM_TOKEN or put it in ${tokenFile} (Moderace → Účet → API tokeny).`); process.exit(1) }
const folders = process.argv.slice(2)
if (!folders.length) { console.error('Usage: npx tsx scripts/content-propose.ts topics/<grade>/<subject> …'); process.exit(1) }

async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(`${api}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.timeout(60_000),
  })
  return { status: res.status, body: (await res.json().catch(() => null)) as Record<string, any> | null }
}

const read = <T>(file: string) => stripSchema(JSON.parse(readFileSync(file, 'utf8'))) as T
let sent = 0, skipped = 0, failed = 0
for (const folder of folders) {
  const [kind, grade, subject] = folder.replace(/^content\//, '').replace(/\/$/, '').split('/')
  if (kind !== 'topics' || !grade || !subject) { console.error(`${folder}: expected topics/<grade>/<subject>`); failed++; continue }
  const dir = join(CONTENT, kind, grade, subject)
  const list = read<SubjectFile>(join(dir, '_subject.json'))
  const subjectMeta = list.name && list.emoji && list.color ? { name: list.name, emoji: list.emoji, color: list.color } : undefined
  const index = (await call('GET', '/api/content/index')).body
  const published = new Set((index?.subjects?.[`${grade}/${subject}`] ?? []).map((t: { id: string }) => t.id))
  for (const [i, id] of list.topics.entries()) {
    if (published.has(id)) { skipped++; continue }
    const topic = read<TopicFile>(join(dir, `${id}.json`))
    const r = await call('POST', '/api/drafts', { kind: 'new', grade, subject, topic, after: i ? list.topics[i - 1] : null, order: list.topics, ...(subjectMeta ? { subjectMeta } : {}) })
    if (r.status === 409) { console.log(`· ${grade}/${subject}/${id}: ${r.body?.error ?? 'already proposed'}`); skipped++; continue }
    if (r.status !== 200) { console.log(`✗ ${grade}/${subject}/${id}: ${r.status} ${r.body?.error ?? ''}`); failed++; continue }
    const draft = r.body!.draft as { id: string }
    const sub = await call('POST', `/api/drafts/${draft.id}/submit`, { note: `Nové téma předmětu ${list.name ?? subject} (${i + 1}/${list.topics.length}).` })
    if (sub.status !== 200) { console.log(`✗ ${grade}/${subject}/${id}: draft ${draft.id} saved, but not sent: ${sub.status} ${JSON.stringify(sub.body?.problems ?? sub.body?.error ?? '')}`); failed++; continue }
    console.log(`✓ ${grade}/${subject}/${id} → ${api}/kontrola/${draft.id}`)
    sent++
  }
}
console.log(`${sent} sent for review, ${skipped} skipped, ${failed} failed`)
process.exit(failed ? 1 : 0)
