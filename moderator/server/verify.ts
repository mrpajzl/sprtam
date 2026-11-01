import { createHash } from 'node:crypto'
import { GRADE_NAME } from '../../src/content/curriculum'
import { topicKey } from '../../src/content/docs'
import type { TopicFile } from '../../src/content/types'
import type { Session } from './auth'
import { claimsBy, type ClaimView } from './claims'
import { contentIndex, readTopic } from './content'
import { all, one, run } from './db'
import { HttpError } from './http'
import { getDoc } from './store'

// Checking unverified topics (docs/MODERACE.md, Ověřování): the queue of topics nobody has checked yet – the
// moderator's own subjects first – and what each moderator already went through in a topic. Going through a topic
// is ticking off every explanation and question; "Ověřit" opens once all of them are ticked. A tick belongs to the
// text it was given for (a hash of it): when the topic changes, only the changed parts need a look again.

/** Every part of a topic that is checked on its own: `ex:<i>` explanations, `q:<i>` questions, with a tick id of each –
 *  the part and a hash of its text, so two identical questions are still two ticks. */
export function partsOf(t: TopicFile): [string, string][] {
  const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('base64url').slice(0, 16)
  return [...t.explanations.map((x, i) => [`ex:${i}`, `ex:${i}:${h(x)}`] as [string, string]), ...t.questions.map((q, i) => [`q:${i}`, `q:${i}:${h(q)}`] as [string, string])]
}

const stored = (userId: string, key: string): Set<string> => {
  const r = one<{ items: string }>('SELECT items FROM verify_progress WHERE user_id = ? AND topic = ?', userId, key)
  try { const v = JSON.parse(r?.items ?? '[]'); return new Set(Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []) } catch { return new Set() }
}

/** What the moderator already went through in the topic as it is now, and how many parts it has. */
function progressOf(userId: string, key: string, t: TopicFile) {
  const have = stored(userId, key)
  const parts = partsOf(t)
  return { done: parts.filter(([, h]) => have.has(h)).map(([k]) => k), total: parts.length }
}

/** Parts of the topic the moderator has not ticked yet (verifyTopic needs none). */
export function partsMissing(userId: string, key: string, t: TopicFile): number {
  const p = progressOf(userId, key, t)
  return p.total - p.done.length
}

export function getProgress(s: Session, g: string, sub: string, id: string) {
  const { topic, version } = readTopic(g, sub, id)
  return { ...progressOf(s.user.id, topicKey(g, sub, id), topic), version }
}

/** Ticks (or unticks) parts of the published topic: `{ parts: ['ex:0', 'q:3'], done: true }`. */
export function setProgress(s: Session, g: string, sub: string, id: string, body: Record<string, unknown>) {
  if (s.via !== 'cookie') throw new HttpError(403, 'Ověřuje jen člověk v moderaci, ne API token.')
  const { topic, version } = readTopic(g, sub, id)
  const key = topicKey(g, sub, id)
  const parts = new Map(partsOf(topic))
  const asked = Array.isArray(body.parts) ? body.parts.filter((x): x is string => typeof x === 'string' && parts.has(x)) : []
  if (!asked.length) throw new HttpError(400, 'Neznámá část tématu.')
  const have = stored(s.user.id, key)
  // Ticks of texts that are no longer in the topic go, so the list never grows.
  const current = new Set(parts.values())
  for (const h of have) if (!current.has(h)) have.delete(h)
  for (const k of asked) { if (body.done === false) have.delete(parts.get(k)!); else have.add(parts.get(k)!) }
  run('INSERT INTO verify_progress (user_id, topic, items, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, topic) DO UPDATE SET items = excluded.items, updated_at = excluded.updated_at',
    s.user.id, key, JSON.stringify([...have]), Date.now())
  return { ...progressOf(s.user.id, key, topic), version }
}

/** The topic was verified: nobody needs their ticks of it any more. */
export const dropProgress = (key: string) => run('DELETE FROM verify_progress WHERE topic = ?', key)

const subjectsOf = (userId: string): string[] => {
  try { const v = JSON.parse(one<{ subjects: string }>('SELECT subjects FROM users WHERE id = ?', userId)?.subjects ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}

export const openReports = () => new Map(all<{ topic: string; n: number }>("SELECT topic, COUNT(*) AS n FROM reports WHERE status = 'open' GROUP BY topic").map((r) => [r.topic, r.n]))

export interface QueueRow {
  key: string; grade: string; subject: string; id: string; title: string; emoji: string
  reports: number; claim: ClaimView | null; progress: { done: number; total: number } | null; mySubject: boolean
}

/**
 * Unverified topics in the order worth checking them: what I took or started first, then my subjects (from my
 * profile), then topics pupils reported mistakes in, then in the order of the curriculum.
 */
export function verifyQueue(s: Session, f: { grade: string | null; subject: string | null; mine: boolean }) {
  if (f.grade && !(f.grade in GRADE_NAME)) throw new HttpError(400, 'Neznámý ročník.')
  const mySubjects = subjectsOf(s.user.id)
  const reports = openReports()
  const claims = claimsBy('topic')
  const mine = new Map(all<{ topic: string; items: string }>('SELECT topic, items FROM verify_progress WHERE user_id = ?', s.user.id).map((r) => [r.topic, r.items]))
  const rows: (QueueRow & { order: number })[] = []
  let order = 0
  for (const [gs, list] of Object.entries(contentIndex().subjects)) {
    const [g, sub] = gs.split('/')
    for (const t of list) {
      order++
      if (t.verified || (f.grade && g !== f.grade) || (f.subject && sub !== f.subject)) continue
      const mySubject = mySubjects.includes(sub)
      if (f.mine && !mySubject) continue
      const key = `${g}/${sub}/${t.id}`
      let progress: QueueRow['progress'] = null
      if (mine.has(topicKey(g, sub, t.id))) {
        const topic = getDoc(topicKey(g, sub, t.id)) as TopicFile
        const p = progressOf(s.user.id, topicKey(g, sub, t.id), topic)
        if (p.done.length) progress = { done: p.done.length, total: p.total }
      }
      rows.push({ key, grade: g, subject: sub, id: t.id, title: t.title, emoji: t.emoji, reports: reports.get(key) ?? 0, claim: claims.get(key) ?? null, progress, mySubject, order })
    }
  }
  const rank = (r: QueueRow) => (r.claim?.userId === s.user.id ? 0 : r.progress ? 1 : r.claim ? 5 : r.mySubject ? 2 : 3)
  rows.sort((a, b) => rank(a) - rank(b) || b.reports - a.reports || a.order - b.order)
  return { topics: rows.slice(0, 500).map(({ order: _, ...r }) => r), total: rows.length, mySubjects }
}
