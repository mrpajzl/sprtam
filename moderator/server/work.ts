import { randomUUID } from 'node:crypto'
import { GRADE_NAME } from '../../src/content/curriculum'
import { isSubjectOf } from '../../src/content/docs'
import type { GradeId, TopicFile } from '../../src/content/types'
import type { Session } from './auth'
import { claimQuietly, claimsBy } from './claims'
import { contentIndex, isSubject, readTopic } from './content'
import { DAY, MINUTE } from './config'
import { all, audit, one, run, type DraftRow } from './db'
import { activeDrafts, createDraft, getDraft, mineFor, reviewQueue, saveDraft, submitDraft } from './drafts'
import { HttpError, limit } from './http'
import { replaceInTopic } from './search'
import { openReports } from './verify'

// Moderators' work across the content (docs/MODERACE.md): fixing pupils' reports in a draft, one replacement in many
// topics at once, how far each subject is, what is new for me ("Na mně"), and saved replies.

// ——— Fixing reports ———

/**
 * "Opravit": opens my draft of the reported topic (continues it when I have one) and ties the reports to it. They are
 * mine while I fix them, the editor and the reviewers see them, and publishing the draft closes them as fixed.
 */
export function fixReports(s: Session, body: Record<string, unknown>, ip: string) {
  const ids = Array.isArray(body.ids) && body.ids.length <= 50 ? [...new Set(body.ids)] : []
  const rows = ids.map((id) => (typeof id === 'string' ? one<{ id: string; topic: string; status: string }>('SELECT id, topic, status FROM reports WHERE id = ?', id) : undefined))
  if (!rows.length || rows.some((r) => !r)) throw new HttpError(404, 'Hlášení nenalezeno.')
  if (rows.some((r) => r!.status !== 'open')) throw new HttpError(409, 'Některé hlášení už je vyřízené.')
  const topics = new Set(rows.map((r) => r!.topic))
  if (topics.size !== 1) throw new HttpError(400, 'Opravit najednou jde jen hlášení k jednomu tématu.')
  // Somebody else is already fixing or has taken one of them: theirs stays.
  const claims = claimsBy('report')
  for (const r of rows) {
    const fixing = one<{ user_id: string; status: string; name: string }>('SELECT d.user_id, d.status, u.name FROM reports r JOIN drafts d ON d.id = r.draft_id JOIN users u ON u.id = d.user_id WHERE r.id = ?', r!.id)
    if (fixing && fixing.user_id !== s.user.id && (fixing.status === 'draft' || fixing.status === 'review')) throw new HttpError(409, `Tohle hlášení už opravuje ${fixing.name}.`)
    const c = claims.get(r!.id)
    if (c && c.userId !== s.user.id) throw new HttpError(409, `Tohle hlášení si bere ${c.name}.`)
  }
  const [g, sub, id] = [...topics][0].split('/')
  if ((mineFor(s, g, sub, id) as DraftRow | undefined)?.status === 'review') throw new HttpError(409, 'Tvůj návrh tohoto tématu je v kontrole. Vrať ho do rozpracovaných, nebo počkej na jeho zveřejnění.')
  const { draft } = createDraft(s, { kind: 'edit', grade: g, subject: sub, topicId: id })
  for (const r of rows) run('UPDATE reports SET draft_id = ? WHERE id = ?', draft.id, r!.id)
  claimQuietly(s.user.id, 'report', rows.map((r) => r!.id))
  audit('report.fixing', s.user.id, { reports: rows.map((r) => r!.id), draft: draft.id }, ip)
  return { draft: draft.id }
}

// ——— One replacement in many topics ———

const KEY = /^([a-z0-9]+)\/([a-z]+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/

/**
 * Replaces exact text in the chosen topics: each becomes my draft (an open one of mine is continued), optionally sent
 * for review right away. Reviewed like any other change; topics where it cannot be done say why.
 */
export function replaceInTopics(s: Session, body: Record<string, unknown>, ip: string) {
  const find = typeof body.find === 'string' ? body.find : ''
  const by = typeof body.replace === 'string' ? body.replace : ''
  if (!find.trim() || find.length > 200 || by.length > 200) throw new HttpError(400, 'Hledaný text musí mít 1 až 200 znaků, nový nejvýš 200.')
  if (find === by) throw new HttpError(400, 'Nový text je stejný jako hledaný.')
  const keys = Array.isArray(body.topics) ? [...new Set(body.topics)].filter((k): k is string => typeof k === 'string') : []
  if (!keys.length || keys.length > 50) throw new HttpError(400, 'Vyber 1 až 50 témat.')
  const submit = body.submit === true
  const note = `Nahrazeno „${find}“ → „${by}“${typeof body.note === 'string' && body.note.trim() ? `: ${body.note.trim().slice(0, 500)}` : ''}`
  limit(`replace:${s.user.id}`, 20, 60 * MINUTE)
  const results: { key: string; title: string; draft: string | null; replaced: number; submitted: boolean; error: string | null }[] = []
  for (const key of keys) {
    const m = KEY.exec(key)
    const out = { key, title: key, draft: null as string | null, replaced: 0, submitted: false, error: null as string | null }
    results.push(out)
    try {
      if (!m || !isSubject(m[1], m[2])) throw new HttpError(404, 'Téma nenalezeno.')
      const [, g, sub, id] = m
      const mine = mineFor(s, g, sub, id) as DraftRow | undefined
      if (mine?.status === 'review') throw new HttpError(409, 'Tvůj návrh tohoto tématu je v kontrole – uprav ho v editoru.')
      const topic = mine ? (JSON.parse(mine.data) as { topic: TopicFile }).topic : readTopic(g, sub, id).topic
      out.title = topic.title
      const r = replaceInTopic(topic, find, by)
      if (!r.n) throw new HttpError(409, 'Text tu už není.')
      const d = mine ? getDraft(s, mine.id).draft : createDraft(s, { kind: 'edit', grade: g, subject: sub, topicId: id }).draft
      saveDraft(s, d.id, { topic: r.topic, rev: d.rev })
      out.draft = d.id
      out.replaced = r.n
      if (submit) {
        try { submitDraft(s, d.id, { note }, ip); out.submitted = true } catch (e) { out.error = `Uloženo, ale neodesláno: ${e instanceof HttpError ? e.message : 'chyba'}` }
      }
    } catch (e) {
      if (!(e instanceof HttpError)) throw e
      out.error = e.message
    }
  }
  audit('content.replaced', s.user.id, { find, replace: by, drafts: results.filter((r) => r.draft).length, submitted: results.filter((r) => r.submitted).length }, ip)
  return { results }
}

// ——— How far the content is ———

/** Per grade and subject: topics, checked ones, open reports, changes in progress and claimed unverified topics. */
export function coverage() {
  const reports = openReports()
  const claims = claimsBy('topic')
  const drafts = new Map<string, number>()
  for (const a of activeDrafts()) { const gs = a.key.split('/').slice(0, 2).join('/'); drafts.set(gs, (drafts.get(gs) ?? 0) + 1) }
  return Object.entries(contentIndex().subjects).filter(([, list]) => list.length).map(([gs, list]) => {
    const [grade, subject] = gs.split('/')
    return {
      grade, subject, topics: list.length, verified: list.filter((t) => t.verified).length,
      reports: list.reduce((n, t) => n + (reports.get(`${gs}/${t.id}`) ?? 0), 0),
      drafts: drafts.get(gs) ?? 0,
      claimed: list.filter((t) => !t.verified && claims.has(`${gs}/${t.id}`)).length,
    }
  })
}

// ——— "Na mně": what is new for me ———

/** How far back "Na mně" looks; seen marks are kept a while longer. */
const INBOX_DAYS = 30
const ITEM = /^(msg|pub|rej|rep):[A-Za-z0-9-]{1,80}$/

type ItemKind = 'reply' | 'comment' | 'changes' | 'approved' | 'published' | 'rejected' | 'report'
export interface InboxItem { id: string; kind: ItemKind; at: number; by: string | null; text: string; title: string; grade: string; subject: string; href: string; seen: boolean }

const short = (s: string, n = 220) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t }
const likeId = (id: string) => `%"${id.replace(/[\\%_]/g, (c) => `\\${c}`)}"%`

function inboxItems(s: Session): InboxItem[] {
  const me = s.user.id, since = Date.now() - INBOX_DAYS * DAY
  const items: Omit<InboxItem, 'seen'>[] = []

  // Messages and decisions of others: everything on my changes, and replies in threads I wrote in (after I did).
  for (const r of all<{ id: number; draft_id: string; verdict: string; body: string; created_at: number; parent_id: number | null; by: string; title: string; grade: string; subject: string; author: string }>(`
    SELECT r.id, r.draft_id, r.verdict, r.body, r.created_at, r.parent_id, u.name AS by, d.title, d.grade, d.subject, d.user_id AS author
    FROM reviews r JOIN drafts d ON d.id = r.draft_id JOIN users u ON u.id = r.user_id
    WHERE r.created_at > ? AND r.user_id != ? AND (d.user_id = ? OR EXISTS (
      SELECT 1 FROM reviews m WHERE m.user_id = ? AND m.id < r.id AND (m.id = COALESCE(r.parent_id, r.id) OR m.parent_id = COALESCE(r.parent_id, r.id))))
    ORDER BY r.id DESC LIMIT 300`, since, me, me, me)) {
    const kind: ItemKind = r.verdict === 'changes' ? 'changes' : r.verdict === 'approve' ? 'approved' : r.author === me && r.parent_id === null ? 'comment' : 'reply'
    if (r.verdict === 'approve' && r.author !== me) continue
    items.push({ id: `msg:${r.id}`, kind, at: r.created_at, by: r.by, text: short(r.body), title: r.title, grade: r.grade, subject: r.subject, href: `/kontrola/${r.draft_id}` })
  }

  // My changes decided by someone else.
  for (const d of all<{ id: string; status: string; title: string; grade: string; subject: string; decided_at: number; by: string | null; decision_note: string | null; release_id: number | null }>(`
    SELECT d.id, d.status, d.title, d.grade, d.subject, d.decided_at, u.name AS by, d.decision_note, d.release_id FROM drafts d LEFT JOIN users u ON u.id = d.decided_by
    WHERE d.user_id = ? AND d.decided_at > ? AND d.status IN ('published', 'rejected') AND (d.decided_by IS NULL OR d.decided_by != ?)`, me, since, me)) {
    items.push({
      id: `${d.status === 'published' ? 'pub' : 'rej'}:${d.id}`, kind: d.status === 'published' ? 'published' : 'rejected', at: d.decided_at, by: d.by,
      text: d.status === 'published' ? (d.release_id ? `Vydání ${d.release_id}` : '') : short(d.decision_note ?? ''), title: d.title, grade: d.grade, subject: d.subject, href: `/kontrola/${d.id}`,
    })
  }

  // Pupils' reports about topics whose published version is mine: I wrote it, approved it or verified it.
  for (const r of all<{ id: string; topic: string; reason: string; note: string; target_text: string; created_at: number }>(`
    SELECT r.id, r.topic, r.reason, r.note, r.target_text, r.created_at FROM reports r
    JOIN docs dc ON dc.key = 'topics/' || r.topic JOIN versions v ON v.id = dc.version
    WHERE r.status = 'open' AND r.created_at > ? AND (v.user_id = ? OR v.approved_by LIKE ? ESCAPE '\\')
    ORDER BY r.created_at DESC LIMIT 100`, since, me, likeId(me))) {
    const [g, sub, id] = r.topic.split('/')
    const t = contentIndex().subjects[`${g}/${sub}`]?.find((x) => x.id === id)
    items.push({ id: `rep:${r.id}`, kind: 'report', at: r.created_at, by: null, text: short(r.note || r.target_text), title: t?.title ?? id, grade: g, subject: sub, href: `/hlaseni?tema=${r.topic}` })
  }

  const seen = new Set(all<{ item: string }>('SELECT item FROM inbox_seen WHERE user_id = ?', me).map((r) => r.item))
  return items.sort((a, b) => b.at - a.at).slice(0, 200).map((i) => ({ ...i, seen: seen.has(i.id) }))
}

/** Changes of others waiting for my decision (the same as "Čeká na tebe" in Kontrola). */
function waitingFor(s: Session) {
  return reviewQueue(s, 'open', { mine: false, grade: null, subject: null })
    .filter((d) => d.status === 'review' && !d.mine && !d.myVerdict)
    .map((d) => ({ id: d.id, title: d.title, grade: d.grade, subject: d.subject, author: d.author.name, at: d.submittedAt ?? d.updatedAt, conflict: d.conflict, kind: d.kind }))
}

export function inbox(s: Session) {
  const items = inboxItems(s)
  // What I took ("Beru si to"), with the title of the topic it is about.
  const title = (key: string) => { const [g, sub, id] = key.split('/'); return contentIndex().subjects[`${g}/${sub}`]?.find((t) => t.id === id)?.title ?? id }
  const claims = [...claimsBy('report').values(), ...claimsBy('topic').values()].filter((c) => c.userId === s.user.id).map((c) => {
    const topic = c.kind === 'topic' ? c.ref : one<{ topic: string }>('SELECT topic FROM reports WHERE id = ?', c.ref)?.topic ?? ''
    return { kind: c.kind, ref: c.ref, until: c.until, topic, title: topic ? title(topic) : '' }
  })
  return { waiting: waitingFor(s), items, unread: items.filter((i) => !i.seen).length, claims }
}

export function inboxCounts(s: Session) {
  return { unread: inboxItems(s).filter((i) => !i.seen).length, waiting: waitingFor(s).length }
}

/** Marks items as seen: some by id, everything about one change (opened in Kontrola), or all of them. */
export function markSeen(s: Session, body: Record<string, unknown>) {
  let ids: string[] = []
  if (body.all === true) ids = inboxItems(s).map((i) => i.id)
  else if (typeof body.draft === 'string') {
    const d = one<{ id: string }>('SELECT id FROM drafts WHERE id = ?', body.draft)
    if (d) ids = [...all<{ id: number }>('SELECT id FROM reviews WHERE draft_id = ? AND user_id != ?', d.id, s.user.id).map((r) => `msg:${r.id}`), `pub:${d.id}`, `rej:${d.id}`]
  } else if (Array.isArray(body.items)) ids = body.items.filter((x): x is string => typeof x === 'string' && ITEM.test(x)).slice(0, 500)
  const now = Date.now()
  for (const id of ids) run('INSERT INTO inbox_seen (user_id, item, at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING', s.user.id, id, now)
  run('DELETE FROM inbox_seen WHERE at < ?', now - 3 * INBOX_DAYS * DAY)
  return { ok: true, seen: ids.length }
}

// ——— Saved replies ———

const REPLY_KINDS = ['report', 'review'] as const
const MAX_REPLIES = 30

export function listReplies(s: Session, kind: unknown) {
  if (!REPLY_KINDS.includes(kind as never)) throw new HttpError(400, 'Neznámý druh odpovědi.')
  return all<{ id: string; text: string }>('SELECT id, text FROM saved_replies WHERE user_id = ? AND kind = ? ORDER BY created_at', s.user.id, kind as string)
}

export function addReply(s: Session, body: Record<string, unknown>) {
  if (!REPLY_KINDS.includes(body.kind as never)) throw new HttpError(400, 'Neznámý druh odpovědi.')
  const text = typeof body.text === 'string' ? body.text.replace(/\r\n?/g, '\n').trim() : ''
  if (!text || text.length > 1000) throw new HttpError(400, 'Odpověď musí mít 1 až 1000 znaků.')
  const kind = body.kind as string
  const existing = one<{ id: string }>('SELECT id FROM saved_replies WHERE user_id = ? AND kind = ? AND text = ?', s.user.id, kind, text)
  if (existing) return { id: existing.id, text }
  if (one<{ n: number }>('SELECT COUNT(*) AS n FROM saved_replies WHERE user_id = ? AND kind = ?', s.user.id, kind)!.n >= MAX_REPLIES) throw new HttpError(429, `Uložených odpovědí můžeš mít nejvýš ${MAX_REPLIES}. Nějakou smaž.`)
  const id = randomUUID()
  run('INSERT INTO saved_replies (id, user_id, kind, text, created_at) VALUES (?, ?, ?, ?, ?)', id, s.user.id, kind, text, Date.now())
  return { id, text }
}

export function removeReply(s: Session, id: unknown) {
  if (typeof id === 'string') run('DELETE FROM saved_replies WHERE id = ? AND user_id = ?', id, s.user.id)
  return { ok: true }
}

/** Topic keys of a grade and subject that exist (filters of the queues). */
export function checkFilter(grade: string | null, subject: string | null) {
  if (grade && !(grade in GRADE_NAME)) throw new HttpError(400, 'Neznámý ročník.')
  if (grade && subject && !isSubjectOf(grade as GradeId, subject)) throw new HttpError(400, 'Neznámý předmět.')
  return { grade, subject }
}

