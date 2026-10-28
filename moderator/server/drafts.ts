import { randomUUID } from 'node:crypto'
import { topicChanged } from '../../src/content/diff'
import { isSubjectOf, subjectKey, topicKey } from '../../src/content/docs'
import { FORMAT } from '../../src/content/format'
import type { GradeId, SubjectFile, SubjectId, TopicFile } from '../../src/content/types'
import { requireRecent, type Session } from './auth'
import { CONFIG, LIMITS, MINUTE } from './config'
import { all, audit, one, run, tx, type DraftRow, type ReviewRow } from './db'
import { isSubject, readTopic, topicExists, topicProblems, type Problem } from './content'
import { HttpError, limit } from './http'
import { GRADE_NAME, isCoreSubject, KEY_COLORS, ODB, type KeyColor } from '../../src/content/curriculum'
import { changesTo, contentAt, getDoc, problemsAfter, publish, version, versionId, type DocChange } from './store'

// A draft is one moderator's change of one topic (an edit, or a new topic with its place in the subject).
// It is saved as the moderator types. "Odeslat ke kontrole" puts it in front of the other moderators: each
// can approve it, ask for changes or talk about it (threads of replies, suggested wording the author takes over).
// Once enough of them (CONFIG.approvals) approve the current revision, it is published at once – a new release of
// the content (store.ts). A moderator never approves their own change; an admin may, in a signed-in browser with a
// fresh passkey confirmation (a stolen session alone does not publish anything). Any later edit is a new revision:
// approvals of an older one no longer count.

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** A new odborný předmět the draft's topic founds (topics/odb/<subject>/_subject), when it is not published yet. */
export interface NewSubject { name: string; emoji: string; color: KeyColor }

interface DraftData {
  topic: TopicFile
  after?: string | null
  /** New topics of an odborný předmět that does not exist yet: the předmět they found when the first one is published. */
  subject?: NewSubject
  /** The intended order of the subject's topics: drafts of one subject published in any order still end up in it. */
  order?: string[]
}

function newSubjectOf(v: unknown): NewSubject | undefined {
  const x = v as NewSubject
  if (!x || typeof x !== 'object') return undefined
  const name = typeof x.name === 'string' ? x.name.trim() : '', emoji = typeof x.emoji === 'string' ? x.emoji.trim() : ''
  if (!name || name.length > 80 || !emoji || emoji.length > 16 || !(KEY_COLORS as readonly unknown[]).includes(x.color)) return undefined
  return { name, emoji, color: x.color }
}

const orderOf = (v: unknown): string[] | undefined => (Array.isArray(v) && v.length <= 300 && v.every((x) => typeof x === 'string' && ID.test(x)) ? v : undefined)

/** A new topic of an odborný předmět that is not published yet (the draft founds it). */
const founds = (d: DraftRow, data: DraftData) => d.kind === 'new' && d.grade === ODB && !!data.subject && !isSubject(d.grade, d.subject)

/** Suggested wording of one text field of the topic (`path` inside the commented item): `from` what it said then. */
export interface Suggestion { path: string; from: string; to: string }

export interface ReviewView {
  id: number; rev: number; stale: boolean; user: { id: string; name: string }; verdict: ReviewRow['verdict']; body: string; anchor: string | null
  createdAt: number; resolvedAt: number | null
  /** The first message of the thread this one replies to. */
  parent: number | null
  suggestion: Suggestion | null; appliedAt: number | null; editedAt: number | null
}

export interface DraftView {
  id: string; kind: 'edit' | 'new'; grade: GradeId; subject: SubjectId; topicId: string; title: string; rev: number
  status: DraftRow['status']; note: string | null
  author: { id: string; name: string }; createdAt: number; updatedAt: number; submittedAt: number | null
  decidedAt: number | null; decidedBy: string | null; decisionNote: string | null; release: number | null
  baseVersion: number | null; rollbackOf: number | null
  /** The topic changed (was published by someone else) since this draft started: it has to be brought up to date first. */
  conflict: boolean
  /** Anything changed against the version it started from. Opening a topic in the editor creates a draft, and until
   *  something changes it is nobody's business: it is not listed, not shown as "being edited", and cannot be sent. */
  changed: boolean
  /** Approvals of the current revision, and who asks for changes in it. */
  approvals: { id: string; name: string }[]; changes: { id: string; name: string }[]; needed: number
  legacyPrUrl: string | null
}

type Row = DraftRow & { author_name: string }

const names = () => new Map(all<{ id: string; name: string }>('SELECT id, name FROM users').map((u) => [u.id, u.name]))

/** The latest decision (approve / changes) of every active reviewer on revision `rev` (a switched-off account no longer counts). */
function decisions(id: string, rev: number) {
  const last = new Map<string, ReviewRow['verdict']>()
  for (const r of all<ReviewRow>("SELECT r.* FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.draft_id = ? AND r.rev = ? AND r.verdict != 'comment' AND u.active = 1 ORDER BY r.id", id, rev)) last.set(r.user_id, r.verdict)
  return last
}

/** Admin rights count only in a signed-in browser: an API token of an admin acts like a moderator's. */
const isAdmin = (s: Session) => s.user.role === 'admin' && s.via === 'cookie'

/** Who approved revision `rev`: other moderators, and the author only while they are an admin. */
function approversOf(d: DraftRow, dec: Map<string, ReviewRow['verdict']>) {
  const authorAdmin = one<{ role: string }>('SELECT role FROM users WHERE id = ?', d.user_id)?.role === 'admin'
  return [...dec].filter(([u, v]) => v === 'approve' && (u !== d.user_id || authorAdmin)).map(([u]) => u)
}

function conflictOf(d: DraftRow): boolean {
  if (d.status !== 'draft' && d.status !== 'review') return false
  return d.kind === 'edit' ? versionId(topicKey(d.grade, d.subject, d.topic_id)) !== d.base_version : topicExists(d.grade, d.subject, d.topic_id)
}

function changedOf(d: DraftRow): boolean {
  if (d.kind === 'new' || !d.base_version) return true
  const base = version(d.base_version).data as TopicFile | null
  return topicChanged(base, (JSON.parse(d.data) as DraftData).topic)
}

/** An edit nobody ever changed or sent: safe to drop. */
const empty = (d: DraftRow) => d.status === 'draft' && d.submitted_at === null && !changedOf(d)

/** Drops a moderator's untouched drafts (opened in the editor and left), except ones touched in the last `keepMs`. */
function pruneEmpty(userId: string, keepMs: number) {
  const cutoff = Date.now() - keepMs
  for (const d of all<DraftRow>("SELECT * FROM drafts WHERE user_id = ? AND status = 'draft' AND submitted_at IS NULL AND kind = 'edit' AND updated_at < ?", userId, cutoff)) {
    if (empty(d) && !one('SELECT 1 FROM reviews WHERE draft_id = ?', d.id)) run('DELETE FROM drafts WHERE id = ?', d.id)
  }
}

function view(d: Row, who = names()): DraftView {
  const dec = d.status === 'review' ? decisions(d.id, d.rev) : new Map()
  const people = (ids: string[]) => ids.map((id) => ({ id, name: who.get(id) ?? '?' }))
  return {
    id: d.id, kind: d.kind, grade: d.grade as GradeId, subject: d.subject as SubjectId, topicId: d.topic_id, title: d.title, rev: d.rev,
    status: d.status, note: d.note, author: { id: d.user_id, name: d.author_name }, createdAt: d.created_at, updatedAt: d.updated_at,
    submittedAt: d.submitted_at, decidedAt: d.decided_at, decidedBy: d.decided_by ? who.get(d.decided_by) ?? '?' : null, decisionNote: d.decision_note,
    release: d.release_id, baseVersion: d.base_version, rollbackOf: d.rollback_of, conflict: conflictOf(d), changed: changedOf(d),
    approvals: people(dec.size ? approversOf(d, dec) : []), changes: people([...dec].filter(([, x]) => x === 'changes').map(([id]) => id)), needed: CONFIG.approvals, legacyPrUrl: d.legacy_pr_url,
  }
}

const SELECT = 'SELECT d.*, u.name AS author_name FROM drafts d JOIN users u ON u.id = d.user_id'

/** Decided changes are open to every moderator: what was approved or rejected, by whom and why. */
const decided = (d: DraftRow) => d.status === 'published' || d.status === 'rejected' || d.status === 'withdrawn'

/**
 * A draft the session may see. In the signed-in app every moderator sees every change, work in progress included.
 * An API token sees its owner's drafts and others' once they were sent for review or decided.
 */
function load(s: Session, id: unknown): Row {
  const d = typeof id === 'string' ? one<Row>(`${SELECT} WHERE d.id = ?`, id) : undefined
  const visible = d && (d.user_id === s.user.id || s.via === 'cookie' || decided(d) || (d.status !== 'draft' && d.submitted_at !== null))
  // Somebody else's work in progress looks exactly like a missing draft.
  if (!d || !visible) throw new HttpError(404, 'Návrh nenalezen.')
  return d
}

const own = (s: Session, d: Row, what: string) => { if (d.user_id !== s.user.id) throw new HttpError(403, `${what} smí jen autor návrhu.`) }
const open = (d: Row) => { if (d.status !== 'draft' && d.status !== 'review') throw new HttpError(409, 'Návrh je uzavřený. Začni nový.', 'closed') }

export function listDrafts(s: Session, everyone: boolean) {
  pruneEmpty(s.user.id, 2 * 60 * MINUTE)
  const who = names()
  const rows = everyone && isAdmin(s)
    ? all<Row>(`${SELECT} ORDER BY d.updated_at DESC LIMIT 500`)
    : all<Row>(`${SELECT} WHERE d.user_id = ? ORDER BY d.updated_at DESC`, s.user.id)
  return rows.filter((d) => !empty(d)).map((d) => view(d, who))
}

export type ReviewTab = 'open' | 'published' | 'rejected'
export interface ReviewFilter { mine: boolean; grade: string | null; subject: string | null }
const DECIDED_LIMIT = 200

/** Which drafts each tab of the review screen holds, narrowed to my own and to a grade and subject. */
function tabWhere(s: Session, tab: unknown, f: ReviewFilter): [string, string[]] {
  if (f.grade !== null && !(f.grade in GRADE_NAME)) throw new HttpError(400, 'Neznámý ročník.')
  // Odborné předměty: published ones, and new ones some draft is founding.
  const known = (x: string) => isCoreSubject(x) || isSubject(ODB, x) || (ID.test(x) && !!one('SELECT 1 FROM drafts WHERE grade = ? AND subject = ?', ODB, x))
  if (f.subject !== null && !known(f.subject)) throw new HttpError(400, 'Neznámý předmět.')
  let more = '', args: string[] = []
  if (f.mine) { more += ' AND d.user_id = ?'; args.push(s.user.id) }
  if (f.grade) { more += ' AND d.grade = ?'; args.push(f.grade) }
  if (f.subject) { more += ' AND d.subject = ?'; args.push(f.subject) }
  // Open: everyone's work in progress and changes in review.
  if (tab === 'open') return [`d.status IN ('draft', 'review')${more}`, args]
  if (tab === 'published') return [`d.status = 'published'${more}`, args]
  // Old pull requests closed without merging (status withdrawn) were turned down too.
  if (tab === 'rejected') return [`d.status IN ('rejected', 'withdrawn')${more}`, args]
  throw new HttpError(400, 'Neznámý seznam.')
}

/**
 * The review screen, open to every moderator: everyone's changes in review (oldest first, with what this moderator
 * already said about the current revision) and drafts in progress, then the latest approved and rejected changes.
 */
export function reviewQueue(s: Session, tab: unknown, f: ReviewFilter) {
  const [where, args] = tabWhere(s, tab, f)
  const who = names()
  const rows = tab === 'open'
    ? all<Row>(`${SELECT} WHERE ${where} ORDER BY d.status = 'draft', COALESCE(d.submitted_at, d.updated_at)`, ...args).filter((d) => !empty(d))
    : all<Row>(`${SELECT} WHERE ${where} ORDER BY COALESCE(d.decided_at, d.updated_at) DESC LIMIT ${DECIDED_LIMIT}`, ...args)
  return rows.map((d) => ({
    ...view(d, who),
    mine: d.user_id === s.user.id,
    myVerdict: d.status === 'review' ? decisions(d.id, d.rev).get(s.user.id) ?? null : null,
  }))
}

/** How many changes each tab holds (open without untouched drafts, which are not listed). */
export function reviewCounts(s: Session, f: ReviewFilter) {
  const n = (tab: ReviewTab) => {
    const [where, args] = tabWhere(s, tab, f)
    if (tab === 'open') return all<Row>(`${SELECT} WHERE ${where}`, ...args).filter((d) => !empty(d)).length
    return one<{ n: number }>(`SELECT COUNT(*) AS n FROM drafts d WHERE ${where}`, ...args)!.n
  }
  return { open: n('open'), published: n('published'), rejected: n('rejected') }
}

/** Open drafts that change something, by topic key – the library shows who is working on what. */
export function activeDrafts() {
  return all<Row>(`${SELECT} WHERE d.status IN ('draft', 'review')`)
    .filter((d) => !empty(d))
    .map((d) => ({ grade: d.grade, subject: d.subject, topic_id: d.topic_id, user_id: d.user_id, author_name: d.author_name, status: d.status, kind: d.kind, id: d.id }))
    .map((d) => ({ key: `${d.grade}/${d.subject}/${d.topic_id}`, userId: d.user_id, name: d.author_name, status: d.status, kind: d.kind, id: d.status === 'review' ? d.id : null }))
}

function reviewsOf(d: Row, who = names()): ReviewView[] {
  return all<ReviewRow>('SELECT * FROM reviews WHERE draft_id = ? ORDER BY id', d.id).map((r) => ({
    id: r.id, rev: r.rev, stale: r.rev !== d.rev, user: { id: r.user_id, name: who.get(r.user_id) ?? '?' }, verdict: r.verdict, body: r.body, anchor: r.anchor,
    createdAt: r.created_at, resolvedAt: r.resolved_at, parent: r.parent_id,
    suggestion: r.suggestion ? JSON.parse(r.suggestion) as Suggestion : null, appliedAt: r.applied_at, editedAt: r.edited_at,
  }))
}

/** Just the conversation, cheap enough to ask for every few seconds while a review is open. */
export function getThread(s: Session, id: unknown) {
  const d = load(s, id)
  return { rev: d.rev, status: d.status, reviews: reviewsOf(d) }
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
    draft: view(d, who), topic: data.topic, after: data.after ?? null, subject: founds(d, data) ? data.subject! : null, base, published: now ?? null, publishedVersion: versionId(key) ?? null,
    reviews: reviewsOf(d, who), problems: d.status === 'draft' || d.status === 'review' ? problemsOf(d, data) : [],
  }
}

const openDrafts = (userId: string) => one<{ n: number }>("SELECT COUNT(*) AS n FROM drafts WHERE user_id = ? AND status IN ('draft', 'review')", userId)!.n

function insertDraft(s: Session, kind: 'edit' | 'new', g: string, sub: string, topic: TopicFile, extra: { after?: string | null; base?: number | null; rollbackOf?: number | null; note?: string | null; subject?: NewSubject; order?: string[] }) {
  // Untouched drafts of other topics go; one opened in the last minutes may still be open in another tab.
  pruneEmpty(s.user.id, 10 * MINUTE)
  // Admins bring in whole new předměty at once (dozens of topics waiting for review): no limit for them.
  if (s.user.role !== 'admin' && openDrafts(s.user.id) >= LIMITS.drafts) throw new HttpError(429, `Máš rozpracováno ${LIMITS.drafts} návrhů. Nejdřív některé dokonči nebo smaž.`)
  const id = randomUUID(), now = Date.now()
  run('INSERT INTO drafts (id, user_id, kind, grade, subject, topic_id, title, data, base_version, rollback_of, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, s.user.id, kind, g, sub, topic.id, String(topic.title || topic.id).slice(0, 200), JSON.stringify(kind === 'new' ? { topic, after: extra.after ?? null, ...(extra.subject ? { subject: extra.subject } : {}), ...(extra.order ? { order: extra.order } : {}) } : { topic }),
    extra.base ?? null, extra.rollbackOf ?? null, extra.note ?? null, now, now)
  return id
}

const mineFor = (s: Session, g: string, sub: string, id: string) =>
  one<DraftRow>("SELECT * FROM drafts WHERE user_id = ? AND grade = ? AND subject = ? AND topic_id = ? AND status IN ('draft', 'review') ORDER BY updated_at DESC", s.user.id, g, sub, id)

export function createDraft(s: Session, body: Record<string, unknown>) {
  const { kind } = body
  // A new topic may found a new odborný předmět: then it names it (name, emoji, color).
  const subject = body.grade === ODB ? newSubjectOf(body.subjectMeta) : undefined
  const founding = kind === 'new' && body.grade === ODB && typeof body.subject === 'string' && isSubjectOf(ODB, body.subject) && !isSubject(ODB, body.subject)
  if (founding && !subject) throw new HttpError(400, 'Nový odborný předmět potřebuje název, emoji a barvu (subjectMeta: { name, emoji, color }).')
  if (!isSubject(body.grade, body.subject) && !founding) throw new HttpError(400, 'Neznámý ročník nebo předmět.')
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
    return getDraft(s, insertDraft(s, 'new', g, sub, topic, { after: typeof body.after === 'string' ? body.after : null, subject, order: orderOf(body.order) }))
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
  // The editor saves unfinished topics (empty texts), but never a different shape: reviewers' screens rely on it.
  const list = (x: unknown) => Array.isArray(x) && x.every((y) => y && typeof y === 'object' && !Array.isArray(y))
  if (!list(topic.explanations) || !topic.explanations.every((x) => list(x.blocks)) || !list(topic.questions)) throw new HttpError(400, 'Téma nemá správnou stavbu (vysvětlení s bloky a otázky).')
  // The id of an existing topic never changes (progress is stored by it); a new topic keeps its id once created.
  if (topic.id !== d.topic_id) throw new HttpError(400, 'Id tématu se nedá změnit.')
  const old = JSON.parse(d.data) as DraftData
  const after = d.kind === 'new' ? (body.after === null || typeof body.after === 'string' ? body.after : old.after ?? null) : undefined
  const data = JSON.stringify({ topic, ...(d.kind === 'new' ? { after, ...(old.subject ? { subject: old.subject } : {}), ...(old.order ? { order: old.order } : {}) } : {}) })
  if (data === d.data) return { rev: d.rev, updatedAt: d.updated_at }
  const rev = d.rev + 1, now = Date.now()
  run('UPDATE drafts SET data = ?, title = ?, rev = ?, updated_at = ? WHERE id = ? AND rev = ?', data, String(topic.title || d.title).slice(0, 200), rev, now, d.id, d.rev)
  return { rev, updatedAt: now }
}

export function deleteDraft(s: Session, id: unknown, ip: string) {
  const d = load(s, id)
  if (d.user_id !== s.user.id && !isAdmin(s)) throw new HttpError(403, 'Smazat smí jen autor.')
  // Only work in progress: anything that went through review keeps its record (reviews, decisions).
  if (d.status !== 'draft') throw new HttpError(409, d.status === 'review' ? 'Návrh je v kontrole. Nejdřív ho vrať do rozpracovaných.' : 'Vyřízený návrh zůstává v historii.')
  run('DELETE FROM drafts WHERE id = ?', d.id)
  audit('draft.deleted', s.user.id, { draft: d.id, topic: `${d.grade}/${d.subject}/${d.topic_id}` }, ip)
}

// ——— What publishing a draft changes ———

/**
 * The new list of topics: `id` after the nearest topic before it in the intended `order` that is already there,
 * or else after `after` (at the start for null, at the end when `after` is gone).
 */
function insertTopic(list: SubjectFile, id: string, after: string | null | undefined, order?: string[]): SubjectFile {
  if (list.topics.includes(id)) return list
  const topics = [...list.topics]
  const k = order?.indexOf(id) ?? -1
  const before = k >= 0 ? order!.slice(0, k).reverse().find((x) => topics.includes(x)) : undefined
  const at = before ? topics.indexOf(before) + 1
    : after === null ? 0 : after !== undefined && topics.includes(after) ? topics.indexOf(after) + 1 : topics.length
  topics.splice(at, 0, id)
  return { ...list, topics }
}

function changesOf(d: DraftRow, data: DraftData): DocChange[] {
  const out: DocChange[] = [{ key: topicKey(d.grade, d.subject, d.topic_id), data: data.topic }]
  if (d.kind === 'new') {
    const list = getDoc(subjectKey(d.grade, d.subject)) as SubjectFile | undefined
    if (list) out.push({ key: subjectKey(d.grade, d.subject), data: insertTopic(list, d.topic_id, data.after, data.order) })
    else if (founds(d, data)) out.push({ key: subjectKey(d.grade, d.subject), data: { format: FORMAT, topics: [d.topic_id], ...data.subject! } satisfies SubjectFile })
    else throw new HttpError(409, 'Předmět nemá seznam témat. Dej vědět správci.')
  }
  return out
}

/** Everything that keeps the draft from being published as it is (the editor's checks plus the content as a whole). */
function problemsOf(d: DraftRow, data: DraftData): Problem[] {
  const own = topicProblems(data.topic, d.grade as GradeId, d.subject as SubjectId, d.topic_id, founds(d, data))
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
  if (!changedOf(d)) throw new HttpError(422, 'V návrhu zatím není žádná změna. Uprav téma, pak ho pošli ke kontrole.', 'empty')
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
const ANCHOR = /^[a-z0-9[\].]{1,80}$/i

/** "questions[2].options[1]" → ['questions', 2, 'options', 1] (null for anything else). */
function parsePath(path: string): (string | number)[] | null {
  if (!/^[a-z]+(\.[a-z]+|\[\d{1,4}\])*$/i.test(path) || path.length > 120) return null
  return [...path.matchAll(/([a-z]+)|\[(\d+)\]/gi)].map((m) => (m[1] ? m[1] : Number(m[2])))
}

function textAt(topic: TopicFile, path: string): string | undefined {
  const p = parsePath(path)
  const v = p?.reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string | number, unknown>)[k] : undefined), topic)
  return typeof v === 'string' ? v : undefined
}

function setText(topic: TopicFile, path: string, value: string): TopicFile {
  const p = parsePath(path)!
  const copy = structuredClone(topic) as unknown as Record<string | number, unknown>
  const parent = p.slice(0, -1).reduce<Record<string | number, unknown>>((o, k) => o[k] as Record<string | number, unknown>, copy)
  parent[p[p.length - 1]] = value
  return copy as unknown as TopicFile
}

const message = (x: unknown, max: number) => (typeof x === 'string' ? x.replace(/\r\n?/g, '\n').trim().slice(0, max) : '')

export function reviewDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  const verdict = body.verdict as (typeof VERDICTS)[number]
  if (!VERDICTS.includes(verdict)) throw new HttpError(400, 'Neznámé rozhodnutí.')
  // Talking goes on while the draft is open (also when the author took it back to work on it); deciding only in review.
  if (verdict === 'comment') open(d)
  else if (d.status !== 'review') throw new HttpError(409, 'Návrh teď není v kontrole.')
  const text = message(body.body, 4000)
  const data = JSON.parse(d.data) as DraftData

  // A reply belongs to the thread of its first message, at the same place.
  let parent: ReviewRow | undefined
  if (body.parent !== undefined && body.parent !== null) {
    parent = one<ReviewRow>('SELECT * FROM reviews WHERE id = ? AND draft_id = ?', Number(body.parent), d.id)
    if (!parent) throw new HttpError(404, 'Zpráva, na kterou odpovídáš, už není.')
    if (parent.parent_id !== null) parent = one<ReviewRow>('SELECT * FROM reviews WHERE id = ?', parent.parent_id)!
    if (verdict !== 'comment') throw new HttpError(400, 'Odpovědět jde jen zprávou.')
  }
  const anchor = parent ? parent.anchor : typeof body.anchor === 'string' && ANCHOR.test(body.anchor) ? body.anchor : null

  let suggestion: Suggestion | null = null
  const sg = body.suggestion as { path?: unknown; text?: unknown } | undefined
  if (sg && typeof sg === 'object') {
    if (verdict !== 'comment') throw new HttpError(400, 'Návrh textu jde poslat jen jako zprávu.')
    const path = typeof sg.path === 'string' ? sg.path : ''
    const from = anchor && (path.startsWith(`${anchor}.`) || path.startsWith(`${anchor}[`)) ? textAt(data.topic, path) : undefined
    if (from === undefined) throw new HttpError(400, 'Navrhnout jde jen text u bloku nebo otázky, ke které píšeš.')
    const to = typeof sg.text === 'string' ? sg.text.replace(/\r\n?/g, '\n').slice(0, 4000) : ''
    if (to === from) throw new HttpError(400, 'Navržený text je stejný jako současný.')
    suggestion = { path, from, to }
  }

  if (d.user_id === s.user.id && verdict !== 'comment') {
    if (verdict === 'changes') throw new HttpError(403, 'O úpravy vlastního návrhu žádat nejde – uprav ho rovnou.')
    if (!isAdmin(s)) throw new HttpError(403, 'Vlastní návrh schvalovat nemůžeš – to udělá někdo jiný.')
    // An admin publishing their own change: confirmed with the passkey, not just an open session.
    requireRecent(s)
  }
  if (verdict !== 'approve' && !text && !suggestion) throw new HttpError(400, verdict === 'changes' ? 'Napiš, co je potřeba změnit.' : 'Napiš zprávu.')
  // The reviewer approves exactly what they saw.
  if (verdict === 'approve' && body.rev !== d.rev) throw new HttpError(409, 'Návrh se mezitím změnil. Podívej se na novou verzi.', 'stale')
  limit(`review:${s.user.id}`, 120, 10 * MINUTE)
  if (verdict === 'approve') assertReady(d, data)
  run('INSERT INTO reviews (draft_id, rev, user_id, verdict, body, anchor, parent_id, suggestion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    d.id, d.rev, s.user.id, verdict, text, anchor, parent?.id ?? null, suggestion ? JSON.stringify(suggestion) : null, Date.now())
  // A reply opens a resolved thread again.
  if (parent?.resolved_at) run('UPDATE reviews SET resolved_at = NULL, resolved_by = NULL WHERE id = ?', parent.id)
  audit(`review.${verdict}`, s.user.id, { draft: d.id, rev: d.rev, ...(d.user_id === s.user.id && verdict === 'approve' ? { own: true } : {}) }, ip)

  let release: number | null = null
  if (verdict === 'approve') {
    const dec = decisions(d.id, d.rev)
    const approvers = approversOf(d, dec)
    if (approvers.length >= CONFIG.approvals && ![...dec.values()].includes('changes')) release = publishDraft(d, data, approvers, s.user.id, ip)
  }
  return { ...getDraft(s, d.id), released: release }
}

function ownMessage(s: Session, d: Row, reviewId: unknown) {
  const r = one<ReviewRow>('SELECT * FROM reviews WHERE id = ? AND draft_id = ?', Number(reviewId), d.id)
  if (!r) throw new HttpError(404, 'Zpráva nenalezena.')
  if (r.user_id !== s.user.id) throw new HttpError(403, 'Upravit nebo smazat smíš jen svou zprávu.')
  return r
}

/** Corrects the text of one's own message (and of a suggestion not taken over yet). */
export function editReview(s: Session, id: unknown, reviewId: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  open(d)
  const r = ownMessage(s, d, reviewId)
  const text = message(body.body, 4000)
  let suggestion = r.suggestion
  if (r.suggestion && typeof body.suggestion === 'string') {
    if (r.applied_at) throw new HttpError(409, 'Návrh textu už autor převzal.')
    const sg = JSON.parse(r.suggestion) as Suggestion
    suggestion = JSON.stringify({ ...sg, to: body.suggestion.replace(/\r\n?/g, '\n').slice(0, 4000) })
  }
  if (!text && !suggestion && r.verdict !== 'approve') throw new HttpError(400, 'Zpráva nemůže být prázdná.')
  run('UPDATE reviews SET body = ?, suggestion = ?, edited_at = ? WHERE id = ?', text, suggestion, Date.now(), r.id)
  audit('review.edited', s.user.id, { draft: d.id, review: r.id }, ip)
  return getDraft(s, d.id)
}

/** Deletes one's own message, unless somebody already replied or it was a decision. */
export function deleteReview(s: Session, id: unknown, reviewId: unknown, ip: string) {
  const d = load(s, id)
  open(d)
  const r = ownMessage(s, d, reviewId)
  if (r.verdict !== 'comment') throw new HttpError(409, 'Rozhodnutí zůstává v historii kontroly.')
  if (one('SELECT 1 FROM reviews WHERE parent_id = ?', r.id)) throw new HttpError(409, 'Na zprávu už někdo odpověděl, smazat ji nejde. Můžeš ji upravit.')
  if (r.applied_at) throw new HttpError(409, 'Převzatý návrh textu zůstává v historii.')
  run('DELETE FROM reviews WHERE id = ?', r.id)
  audit('review.deleted', s.user.id, { draft: d.id, review: r.id }, ip)
  return getDraft(s, d.id)
}

/** The author takes over a suggested wording: a new revision of the draft, as if typed in the editor. */
export function applySuggestion(s: Session, id: unknown, reviewId: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  own(s, d, 'Převzít návrh textu')
  open(d)
  if (body.rev !== d.rev) throw new HttpError(409, 'Návrh se mezitím změnil v jiném okně. Načti ho znovu.', 'stale')
  const r = one<ReviewRow>('SELECT * FROM reviews WHERE id = ? AND draft_id = ?', Number(reviewId), d.id)
  if (!r?.suggestion) throw new HttpError(404, 'Návrh textu nenalezen.')
  if (r.applied_at) throw new HttpError(409, 'Návrh textu už je převzatý.')
  const sg = JSON.parse(r.suggestion) as Suggestion
  const data = JSON.parse(d.data) as DraftData
  const now = textAt(data.topic, sg.path)
  if (now === undefined) throw new HttpError(409, 'Tohle místo v tématu už není (blok nebo otázka se mezitím přesunuly).', 'moved')
  if (now !== sg.from) throw new HttpError(409, 'Text se od návrhu změnil. Převezmi ho ručně v editoru.', 'moved')
  const topic = setText(data.topic, sg.path, sg.to)
  const rev = d.rev + 1, at = Date.now()
  tx(() => {
    run('UPDATE drafts SET data = ?, title = ?, rev = ?, updated_at = ? WHERE id = ? AND rev = ?', JSON.stringify({ ...data, topic }), String(topic.title || d.title).slice(0, 200), rev, at, d.id, d.rev)
    run('UPDATE reviews SET applied_at = ? WHERE id = ?', at, r.id)
    // Taken over = the thread is done.
    run('UPDATE reviews SET resolved_at = ?, resolved_by = ? WHERE id = ?', at, s.user.id, r.parent_id ?? r.id)
  })
  audit('review.applied', s.user.id, { draft: d.id, review: r.id, rev }, ip)
  return getDraft(s, d.id)
}

function publishDraft(d: DraftRow, data: DraftData, approvers: string[], by: string, ip: string): number {
  const key = topicKey(d.grade, d.subject, d.topic_id)
  const r = publish(changesOf(d, data), { userId: d.user_id, reason: d.rollback_of ? 'rollback' : 'change', draftId: d.id, approvedBy: approvers, note: d.note ?? undefined }, (r) => {
    // Checked again against the database itself, in the same transaction as the write.
    const prev = one<{ id: number; data: string | null }>('SELECT id, data FROM versions WHERE key = ? AND release_id < ? ORDER BY n DESC LIMIT 1', key, r.release)
    const live = prev && prev.data !== null ? prev.id : null
    if (d.kind === 'edit' ? live !== d.base_version : live !== null) throw new HttpError(409, 'Téma mezitím změnil někdo jiný. Autor musí návrh převést na novou verzi.', 'conflict')
    if (run("UPDATE drafts SET status = 'published', decided_at = ?, decided_by = ?, release_id = ? WHERE id = ? AND status = 'review' AND rev = ?", Date.now(), by, r.release, d.id, d.rev).changes !== 1) {
      throw new HttpError(409, 'Návrh se mezitím změnil.', 'stale')
    }
  })
  audit('draft.published', by, { draft: d.id, release: r.release, topic: `${d.grade}/${d.subject}/${d.topic_id}`, approvedBy: approvers }, ip)
  return r.release
}

export function resolveReview(s: Session, id: unknown, reviewId: unknown, ip: string) {
  const d = load(s, id)
  const r = one<ReviewRow>('SELECT * FROM reviews WHERE id = ? AND draft_id = ? AND parent_id IS NULL', Number(reviewId), d.id)
  if (!r) throw new HttpError(404, 'Komentář nenalezen.')
  if (d.user_id !== s.user.id && r.user_id !== s.user.id) throw new HttpError(403, 'Vyřešit komentář smí autor návrhu nebo autor komentáře.')
  run('UPDATE reviews SET resolved_at = ?, resolved_by = ? WHERE id = ?', r.resolved_at ? null : Date.now(), r.resolved_at ? null : s.user.id, r.id)
  audit('review.resolved', s.user.id, { draft: d.id, review: r.id }, ip)
  return getDraft(s, d.id)
}

/** An admin closes a draft that will not be published (with a reason the author sees). */
export function rejectDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  if (!isAdmin(s)) throw new HttpError(403, 'Zamítnout návrh smí jen správce.')
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
  const mine = mineFor(s, g, sub, id)
  if (mine && !empty(mine)) throw new HttpError(409, 'U tohoto tématu už máš rozpracovaný návrh. Dokonči ho nebo ho smaž.')
  if (mine) run('DELETE FROM drafts WHERE id = ?', mine.id)
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
