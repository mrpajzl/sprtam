import { randomUUID } from 'node:crypto'
import { subjectKey, topicKey } from '../../src/content/docs'
import type { GradeId, SubjectFile, SubjectId, TopicFile } from '../../src/content/types'
import type { Session } from './auth'
import { CONFIG, LIMITS, MINUTE } from './config'
import { all, audit, one, run, type DraftRow, type ReviewRow } from './db'
import { isSubject, readTopic, topicExists, topicProblems, type Problem } from './content'
import { HttpError, limit } from './http'
import { changesTo, contentAt, getDoc, problemsAfter, publish, version, versionId, type DocChange } from './store'

// A draft is one moderator's change of one topic (an edit, or a new topic with its place in the subject).
// It is saved as the moderator types. "Odeslat ke kontrole" puts it in front of the other moderators: each
// can approve it, ask for changes or comment. Once enough of them (CONFIG.approvals, never the author)
// approve the current revision, it is published at once – a new release of the content (store.ts).
// Any later edit is a new revision: approvals of an older one no longer count.

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

interface DraftData { topic: TopicFile; after?: string | null }

export interface ReviewView {
  id: number; rev: number; stale: boolean; user: { id: string; name: string }; verdict: ReviewRow['verdict']; body: string; anchor: string | null
  createdAt: number; resolvedAt: number | null
}

export interface DraftView {
  id: string; kind: 'edit' | 'new'; grade: GradeId; subject: SubjectId; topicId: string; title: string; rev: number
  status: DraftRow['status']; note: string | null
  author: { id: string; name: string }; createdAt: number; updatedAt: number; submittedAt: number | null
  decidedAt: number | null; decidedBy: string | null; decisionNote: string | null; release: number | null
  baseVersion: number | null; rollbackOf: number | null
  /** The topic changed (was published by someone else) since this draft started: it has to be brought up to date first. */
  conflict: boolean
  /** Approvals of the current revision, and who asks for changes in it. */
  approvals: { id: string; name: string }[]; changes: { id: string; name: string }[]; needed: number
  legacyPrUrl: string | null
}

type Row = DraftRow & { author_name: string }

const names = () => new Map(all<{ id: string; name: string }>('SELECT id, name FROM users').map((u) => [u.id, u.name]))

/** The latest decision (approve / changes) of every reviewer on revision `rev`. */
function decisions(id: string, rev: number) {
  const last = new Map<string, ReviewRow['verdict']>()
  for (const r of all<ReviewRow>("SELECT * FROM reviews WHERE draft_id = ? AND rev = ? AND verdict != 'comment' ORDER BY id", id, rev)) last.set(r.user_id, r.verdict)
  return last
}

function conflictOf(d: DraftRow): boolean {
  if (d.status !== 'draft' && d.status !== 'review') return false
  return d.kind === 'edit' ? versionId(topicKey(d.grade, d.subject, d.topic_id)) !== d.base_version : topicExists(d.grade, d.subject, d.topic_id)
}

function view(d: Row, who = names()): DraftView {
  const dec = d.status === 'review' ? decisions(d.id, d.rev) : new Map()
  const people = (v: string) => [...dec].filter(([, x]) => x === v).map(([id]) => ({ id, name: who.get(id) ?? '?' }))
  return {
    id: d.id, kind: d.kind, grade: d.grade as GradeId, subject: d.subject as SubjectId, topicId: d.topic_id, title: d.title, rev: d.rev,
    status: d.status, note: d.note, author: { id: d.user_id, name: d.author_name }, createdAt: d.created_at, updatedAt: d.updated_at,
    submittedAt: d.submitted_at, decidedAt: d.decided_at, decidedBy: d.decided_by ? who.get(d.decided_by) ?? '?' : null, decisionNote: d.decision_note,
    release: d.release_id, baseVersion: d.base_version, rollbackOf: d.rollback_of, conflict: conflictOf(d),
    approvals: people('approve'), changes: people('changes'), needed: CONFIG.approvals, legacyPrUrl: d.legacy_pr_url,
  }
}

const SELECT = 'SELECT d.*, u.name AS author_name FROM drafts d JOIN users u ON u.id = d.user_id'

/** A draft the session may see: its own, any for admins, and other moderators' once they were sent for review. */
function load(s: Session, id: unknown): Row {
  const d = typeof id === 'string' ? one<Row>(`${SELECT} WHERE d.id = ?`, id) : undefined
  const visible = d && (d.user_id === s.user.id || s.user.role === 'admin' || (d.status !== 'draft' && d.submitted_at !== null))
  // Somebody else's work in progress looks exactly like a missing draft.
  if (!d || !visible) throw new HttpError(404, 'Návrh nenalezen.')
  return d
}

const own = (s: Session, d: Row, what: string) => { if (d.user_id !== s.user.id) throw new HttpError(403, `${what} smí jen autor návrhu.`) }
const open = (d: Row) => { if (d.status !== 'draft' && d.status !== 'review') throw new HttpError(409, 'Návrh je uzavřený. Začni nový.', 'closed') }

export function listDrafts(s: Session, everyone: boolean) {
  const who = names()
  const rows = everyone && s.user.role === 'admin'
    ? all<Row>(`${SELECT} ORDER BY d.updated_at DESC LIMIT 500`)
    : all<Row>(`${SELECT} WHERE d.user_id = ? ORDER BY d.updated_at DESC`, s.user.id)
  return rows.map((d) => view(d, who))
}

/** Drafts waiting for review, oldest first, with what this moderator already said about the current revision. */
export function reviewQueue(s: Session) {
  const who = names()
  return all<Row>(`${SELECT} WHERE d.status = 'review' ORDER BY d.submitted_at`).map((d) => ({
    ...view(d, who),
    mine: d.user_id === s.user.id,
    myVerdict: decisions(d.id, d.rev).get(s.user.id) ?? null,
  }))
}

/** Open drafts by topic key – the library shows who is working on what. */
export function activeDrafts() {
  return all<{ grade: string; subject: string; topic_id: string; user_id: string; author_name: string; status: string; kind: string; id: string }>(
    `SELECT d.id, d.grade, d.subject, d.topic_id, d.user_id, d.status, d.kind, u.name AS author_name FROM drafts d JOIN users u ON u.id = d.user_id WHERE d.status IN ('draft', 'review')`)
    .map((d) => ({ key: `${d.grade}/${d.subject}/${d.topic_id}`, userId: d.user_id, name: d.author_name, status: d.status, kind: d.kind, id: d.status === 'review' ? d.id : null }))
}

function reviewsOf(d: Row, who = names()): ReviewView[] {
  return all<ReviewRow>('SELECT * FROM reviews WHERE draft_id = ? ORDER BY id', d.id).map((r) => ({
    id: r.id, rev: r.rev, stale: r.rev !== d.rev, user: { id: r.user_id, name: who.get(r.user_id) ?? '?' }, verdict: r.verdict, body: r.body, anchor: r.anchor,
    createdAt: r.created_at, resolvedAt: r.resolved_at,
  }))
}

/** A draft with its topic, the version it started from, what is published now, and the review so far. */
export function getDraft(s: Session, id: unknown) {
  const d = load(s, id)
  const data = JSON.parse(d.data) as DraftData
  const who = names()
  const base = d.base_version ? (version(d.base_version).data as TopicFile | null) : null
  const key = topicKey(d.grade, d.subject, d.topic_id)
  const now = getDoc(key) as TopicFile | undefined
  return {
    draft: view(d, who), topic: data.topic, after: data.after ?? null, base, published: now ?? null, publishedVersion: versionId(key) ?? null,
    reviews: reviewsOf(d, who), problems: d.status === 'draft' || d.status === 'review' ? problemsOf(d, data) : [],
  }
}

const openDrafts = (userId: string) => one<{ n: number }>("SELECT COUNT(*) AS n FROM drafts WHERE user_id = ? AND status IN ('draft', 'review')", userId)!.n

function insertDraft(s: Session, kind: 'edit' | 'new', g: string, sub: string, topic: TopicFile, extra: { after?: string | null; base?: number | null; rollbackOf?: number | null; note?: string | null }) {
  if (openDrafts(s.user.id) >= LIMITS.drafts) throw new HttpError(429, `Máš rozpracováno ${LIMITS.drafts} návrhů. Nejdřív některé dokonči nebo smaž.`)
  const id = randomUUID(), now = Date.now()
  run('INSERT INTO drafts (id, user_id, kind, grade, subject, topic_id, title, data, base_version, rollback_of, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, s.user.id, kind, g, sub, topic.id, String(topic.title || topic.id).slice(0, 200), JSON.stringify(kind === 'new' ? { topic, after: extra.after ?? null } : { topic }),
    extra.base ?? null, extra.rollbackOf ?? null, extra.note ?? null, now, now)
  return id
}

const mineFor = (s: Session, g: string, sub: string, id: string) =>
  one<DraftRow>("SELECT * FROM drafts WHERE user_id = ? AND grade = ? AND subject = ? AND topic_id = ? AND status IN ('draft', 'review') ORDER BY updated_at DESC", s.user.id, g, sub, id)

export function createDraft(s: Session, body: Record<string, unknown>) {
  const { kind } = body
  if (!isSubject(body.grade, body.subject)) throw new HttpError(400, 'Neznámý ročník nebo předmět.')
  const g = body.grade as string, sub = body.subject as string
  if (kind === 'edit') {
    const id = String(body.topicId ?? '')
    // One open draft per moderator and topic: editing again continues it.
    const mine = mineFor(s, g, sub, id)
    if (mine) return getDraft(s, mine.id)
    const { topic, version: v } = readTopic(g, sub, id)
    return getDraft(s, insertDraft(s, 'edit', g, sub, topic, { base: v }))
  }
  if (kind === 'new') {
    const topic = body.topic as TopicFile
    if (!topic || typeof topic !== 'object' || typeof topic.id !== 'string' || !ID.test(topic.id) || topic.id.length > 80) throw new HttpError(400, 'Id tématu smí mít jen malá písmena bez diakritiky, číslice a pomlčky.')
    if (topicExists(g, sub, topic.id)) throw new HttpError(409, 'Téma s tímto id v předmětu už je. Zvol jiný název nebo id.')
    if (one("SELECT 1 FROM drafts WHERE kind = 'new' AND grade = ? AND subject = ? AND topic_id = ? AND status IN ('draft', 'review')", g, sub, topic.id)) throw new HttpError(409, 'Nové téma s tímto id už někdo rozpracoval.')
    return getDraft(s, insertDraft(s, 'new', g, sub, topic, { after: typeof body.after === 'string' ? body.after : null }))
  }
  throw new HttpError(400, 'Neznámý druh návrhu.')
}

export function saveDraft(s: Session, id: unknown, body: Record<string, unknown>) {
  const d = load(s, id)
  own(s, d, 'Upravovat')
  open(d)
  if (body.rev !== d.rev) throw new HttpError(409, 'Návrh se mezitím změnil v jiném okně. Načti ho znovu.', 'stale')
  const topic = body.topic as TopicFile
  if (!topic || typeof topic !== 'object' || Array.isArray(topic)) throw new HttpError(400, 'Chybí téma.')
  // The id of an existing topic never changes (progress is stored by it); a new topic keeps its id once created.
  if (topic.id !== d.topic_id) throw new HttpError(400, 'Id tématu se nedá změnit.')
  const old = JSON.parse(d.data) as DraftData
  const after = d.kind === 'new' ? (body.after === null || typeof body.after === 'string' ? body.after : old.after ?? null) : undefined
  const data = JSON.stringify({ topic, ...(d.kind === 'new' ? { after } : {}) })
  if (data === d.data) return { rev: d.rev, updatedAt: d.updated_at }
  const rev = d.rev + 1, now = Date.now()
  run('UPDATE drafts SET data = ?, title = ?, rev = ?, updated_at = ? WHERE id = ? AND rev = ?', data, String(topic.title || d.title).slice(0, 200), rev, now, d.id, d.rev)
  return { rev, updatedAt: now }
}

export function deleteDraft(s: Session, id: unknown, ip: string) {
  const d = load(s, id)
  if (d.user_id !== s.user.id && s.user.role !== 'admin') throw new HttpError(403, 'Smazat smí jen autor.')
  if (d.status === 'review' || d.status === 'published') throw new HttpError(409, d.status === 'review' ? 'Návrh je v kontrole. Nejdřív ho vrať do rozpracovaných.' : 'Zveřejněný návrh je součástí historie.')
  run('DELETE FROM drafts WHERE id = ?', d.id)
  audit('draft.deleted', s.user.id, { draft: d.id, topic: `${d.grade}/${d.subject}/${d.topic_id}` }, ip)
}

// ——— What publishing a draft changes ———

/** The new list of topics: `id` inserted after `after` (at the start for null, at the end when `after` is gone). */
function insertTopic(list: SubjectFile, id: string, after: string | null | undefined): SubjectFile {
  if (list.topics.includes(id)) return list
  const topics = [...list.topics]
  const at = after === null ? 0 : after !== undefined && topics.includes(after) ? topics.indexOf(after) + 1 : topics.length
  topics.splice(at, 0, id)
  return { ...list, topics }
}

function changesOf(d: DraftRow, data: DraftData): DocChange[] {
  const out: DocChange[] = [{ key: topicKey(d.grade, d.subject, d.topic_id), data: data.topic }]
  if (d.kind === 'new') {
    const list = getDoc(subjectKey(d.grade, d.subject)) as SubjectFile | undefined
    if (!list) throw new HttpError(409, 'Předmět nemá seznam témat. Dej vědět správci.')
    out.push({ key: subjectKey(d.grade, d.subject), data: insertTopic(list, d.topic_id, data.after) })
  }
  return out
}

/** Everything that keeps the draft from being published as it is (the editor's checks plus the content as a whole). */
function problemsOf(d: DraftRow, data: DraftData): Problem[] {
  const own = topicProblems(data.topic, d.grade as GradeId, d.subject as SubjectId, d.topic_id)
  if (own.length) return own
  const out: Problem[] = []
  const before = getDoc(topicKey(d.grade, d.subject, d.topic_id)) as TopicFile | undefined
  if (d.kind === 'edit' && before && before.approach !== data.topic.approach) out.push({ path: 'approach', message: 'Přístup k výuce celého tématu se tady měnit nedá.' })
  if (d.kind === 'new' && data.topic.approach) out.push({ path: 'approach', message: 'Téma jen pro jeden přístup k výuce zakládá správce.' })
  if (conflictOf(d)) return out
  for (const i of problemsAfter(changesOf(d, data))) out.push({ path: i.path, message: i.cs })
  return out
}

function assertReady(d: DraftRow, data: DraftData) {
  if (conflictOf(d)) {
    throw new HttpError(409, d.kind === 'edit'
      ? 'Téma mezitím někdo jiný změnil a jeho změna je už zveřejněná. Autor musí návrh převést na novou verzi.'
      : 'Téma s tímto id už v učivu je.', 'conflict')
  }
  const problems = problemsOf(d, data)
  if (problems.length) throw new HttpError(422, 'Téma ještě není hotové – oprav zvýrazněné věci.', 'invalid', { problems })
}

// ——— Review ———

export function submitDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  own(s, d, 'Odeslat')
  if (d.status !== 'draft') throw new HttpError(409, d.status === 'review' ? 'Návrh už je v kontrole.' : 'Návrh je uzavřený.')
  limit(`submit:${s.user.id}`, 30, 60 * MINUTE)
  assertReady(d, JSON.parse(d.data))
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : ''
  run("UPDATE drafts SET status = 'review', note = ?, submitted_rev = rev, submitted_at = ? WHERE id = ?", note || null, Date.now(), d.id)
  audit('draft.submitted', s.user.id, { draft: d.id, topic: `${d.grade}/${d.subject}/${d.topic_id}` }, ip)
  return getDraft(s, d.id)
}

/** Back from review to the author's work in progress (the reviews stay). */
export function withdrawDraft(s: Session, id: unknown, ip: string) {
  const d = load(s, id)
  own(s, d, 'Vrátit')
  if (d.status !== 'review') throw new HttpError(409, 'Návrh není v kontrole.')
  run("UPDATE drafts SET status = 'draft' WHERE id = ?", d.id)
  audit('draft.withdrawn', s.user.id, { draft: d.id }, ip)
  return getDraft(s, d.id)
}

/** After someone else's change of the same topic was published: the draft now edits that version (a new revision). */
export function rebaseDraft(s: Session, id: unknown, ip: string) {
  const d = load(s, id)
  own(s, d, 'Převést')
  open(d)
  if (d.kind !== 'edit' || !conflictOf(d)) throw new HttpError(409, 'Návrh už vychází ze zveřejněné verze.')
  const v = versionId(topicKey(d.grade, d.subject, d.topic_id))
  if (!v) throw new HttpError(409, 'Téma mezitím z učiva zmizelo. Dej vědět správci.')
  run('UPDATE drafts SET base_version = ?, rev = rev + 1, updated_at = ? WHERE id = ?', v, Date.now(), d.id)
  audit('draft.rebased', s.user.id, { draft: d.id, version: v }, ip)
  return getDraft(s, d.id)
}

const VERDICTS = ['approve', 'changes', 'comment'] as const

export function reviewDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  if (d.status !== 'review') throw new HttpError(409, 'Návrh teď není v kontrole.')
  const verdict = body.verdict as (typeof VERDICTS)[number]
  if (!VERDICTS.includes(verdict)) throw new HttpError(400, 'Neznámé rozhodnutí.')
  const text = typeof body.body === 'string' ? body.body.trim().slice(0, 4000) : ''
  const anchor = typeof body.anchor === 'string' && /^[a-z0-9[\].]{1,80}$/i.test(body.anchor) ? body.anchor : null
  if (verdict !== 'comment' && d.user_id === s.user.id) throw new HttpError(403, 'Vlastní návrh schvalovat nemůžeš – to udělá někdo jiný.')
  if (verdict !== 'approve' && !text) throw new HttpError(400, verdict === 'changes' ? 'Napiš, co je potřeba změnit.' : 'Napiš komentář.')
  // The reviewer approves exactly what they saw.
  if (verdict === 'approve' && body.rev !== d.rev) throw new HttpError(409, 'Návrh se mezitím změnil. Podívej se na novou verzi.', 'stale')
  limit(`review:${s.user.id}`, 120, 10 * MINUTE)
  const data = JSON.parse(d.data) as DraftData
  if (verdict === 'approve') assertReady(d, data)
  run('INSERT INTO reviews (draft_id, rev, user_id, verdict, body, anchor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', d.id, d.rev, s.user.id, verdict, text, anchor, Date.now())
  audit(`review.${verdict}`, s.user.id, { draft: d.id, rev: d.rev }, ip)

  let release: number | null = null
  if (verdict === 'approve') {
    const dec = decisions(d.id, d.rev)
    const approvers = [...dec].filter(([u, v]) => v === 'approve' && u !== d.user_id).map(([u]) => u)
    if (approvers.length >= CONFIG.approvals && ![...dec.values()].includes('changes')) release = publishDraft(d, data, approvers, s.user.id, ip)
  }
  return { ...getDraft(s, d.id), released: release }
}

function publishDraft(d: DraftRow, data: DraftData, approvers: string[], by: string, ip: string): number {
  const r = publish(changesOf(d, data), { userId: d.user_id, reason: d.rollback_of ? 'rollback' : 'change', draftId: d.id, approvedBy: approvers, note: d.note ?? undefined }, (r) => {
    run("UPDATE drafts SET status = 'published', decided_at = ?, decided_by = ?, release_id = ? WHERE id = ?", Date.now(), by, r.release, d.id)
  })
  audit('draft.published', by, { draft: d.id, release: r.release, topic: `${d.grade}/${d.subject}/${d.topic_id}`, approvedBy: approvers }, ip)
  return r.release
}

export function resolveReview(s: Session, id: unknown, reviewId: unknown, ip: string) {
  const d = load(s, id)
  const r = one<ReviewRow>('SELECT * FROM reviews WHERE id = ? AND draft_id = ?', Number(reviewId), d.id)
  if (!r) throw new HttpError(404, 'Komentář nenalezen.')
  if (d.user_id !== s.user.id && r.user_id !== s.user.id) throw new HttpError(403, 'Vyřešit komentář smí autor návrhu nebo autor komentáře.')
  run('UPDATE reviews SET resolved_at = ?, resolved_by = ? WHERE id = ?', r.resolved_at ? null : Date.now(), r.resolved_at ? null : s.user.id, r.id)
  audit('review.resolved', s.user.id, { draft: d.id, review: r.id }, ip)
  return getDraft(s, d.id)
}

/** An admin closes a draft that will not be published (with a reason the author sees). */
export function rejectDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  if (s.user.role !== 'admin') throw new HttpError(403, 'Zamítnout návrh smí jen správce.')
  open(d)
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : ''
  if (!note) throw new HttpError(400, 'Napiš autorovi, proč návrh zamítáš.')
  run("UPDATE drafts SET status = 'rejected', decided_at = ?, decided_by = ?, decision_note = ? WHERE id = ?", Date.now(), s.user.id, note, d.id)
  audit('draft.rejected', s.user.id, { draft: d.id }, ip)
  return getDraft(s, d.id)
}

// ——— Rollback ———

function topicVersion(versionIdValue: unknown) {
  const v = version(Number(versionIdValue))
  const m = /^topics\/([a-z0-9]+)\/([a-z]+)\/([a-z0-9-]+)$/.exec(v.version.key)
  if (!m || m[3] === '_subject' || !v.data) throw new HttpError(400, 'Vrátit jde jen verzi tématu.')
  return { v, g: m[1], sub: m[2], id: m[3], topic: v.data as TopicFile }
}

/** A draft that brings a topic back to an earlier version – reviewed like any other change. */
export function rollbackDraft(s: Session, versionIdValue: unknown, ip: string) {
  const { v, g, sub, id, topic } = topicVersion(versionIdValue)
  if (v.version.current) throw new HttpError(409, 'Tohle je zveřejněná verze.')
  if (!topicExists(g, sub, id)) throw new HttpError(409, 'Téma už v učivu není.')
  if (mineFor(s, g, sub, id)) throw new HttpError(409, 'U tohoto tématu už máš rozpracovaný návrh. Dokonči ho nebo ho smaž.')
  const draft = insertDraft(s, 'edit', g, sub, topic, { base: versionId(topicKey(g, sub, id)), rollbackOf: v.version.id, note: `Návrat k verzi ${v.version.n}` })
  audit('draft.rollback', s.user.id, { draft, version: v.version.id }, ip)
  return getDraft(s, draft)
}

/** Admins only, for emergencies: publish an earlier version at once, without review. */
export function restoreVersionNow(s: Session, versionIdValue: unknown, body: Record<string, unknown>, ip: string) {
  const { v } = topicVersion(versionIdValue)
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''
  if (!note) throw new HttpError(400, 'Napiš důvod (zůstane v historii).')
  const r = publish([{ key: v.version.key, data: v.data }], { userId: s.user.id, reason: 'rollback', note: `${note} (návrat k verzi ${v.version.n} bez kontroly)` })
  audit('content.restored-version', s.user.id, { version: v.version.id, release: r.release, note }, ip)
  return { release: r.release }
}

/** Admins only: the whole content back to how it was after release `id` (a new release; nothing is lost). */
export function restoreRelease(s: Session, releaseId: unknown, body: Record<string, unknown>, ip: string) {
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''
  if (!note) throw new HttpError(400, 'Napiš důvod (zůstane v historii).')
  const id = Number(releaseId)
  const changes = changesTo(contentAt(id))
  const r = publish(changes, { userId: s.user.id, reason: 'restore', note: `${note} (obnova vydání ${id})` })
  audit('content.restored-release', s.user.id, { to: id, release: r.release, docs: changes.length, note }, ip)
  return { release: r.release, docs: changes.length }
}
