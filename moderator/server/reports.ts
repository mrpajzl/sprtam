import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { parseReport } from '../../server/report'
import { topicKey } from '../../src/content/docs'
import type { TopicFile } from '../../src/content/types'
import { bearer, type Session } from './auth'
import { CONFIG, LIMITS, MINUTE } from './config'
import { claimsBy, releaseClaims, type ClaimView } from './claims'
import { all, audit, one, run } from './db'
import { HttpError, limit, type Req } from './http'
import { getDoc } from './store'

// Error reports from pupils („Nahlásit chybu“ in the app). The server of sprtam.cz checks them, counts them per
// device in memory and forwards only the report itself with REPORT_TOKEN; moderators read them here, fix the
// topic through a normal draft and close the report.

export const REPORT_STATUS = ['open', 'fixed', 'dismissed'] as const
type Status = (typeof REPORT_STATUS)[number]

interface ReportRow {
  id: string; topic: string; target_kind: 'question' | 'explanation'; target_index: number; target_text: string; reason: string; note: string; quote: string
  release: number | null; status: Status; created_at: number; decided_at: number | null; decided_by: string | null; decision_note: string | null
  draft_id: string | null
}

const sha = (s: string) => createHash('sha256').update(s).digest()

function requireReporter(req: Req) {
  if (!CONFIG.reportToken) throw new HttpError(503, 'Hlášení nejsou zapnutá.')
  const t = bearer(req)
  if (!t || !timingSafeEqual(sha(t), sha(CONFIG.reportToken))) throw new HttpError(401, 'Neplatný token hlášení.', 'report')
}

export function createReport(req: Req, body: Record<string, unknown>) {
  requireReporter(req)
  limit('reports', 600, 60 * MINUTE)
  const r = parseReport(body)
  if (typeof r === 'string') throw new HttpError(400, r)
  const open = one<{ n: number }>("SELECT COUNT(*) AS n FROM reports WHERE status = 'open'")!.n
  if (open >= LIMITS.openReports) throw new HttpError(429, 'Otevřených hlášení je moc.', 'rate', { retryAfter: 3600 })
  const id = randomUUID()
  run('INSERT INTO reports (id, topic, target_kind, target_index, target_text, reason, note, quote, release, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, r.topic, r.target.kind, r.target.index, r.target.text, r.reason, r.note, r.quote ?? '', r.release, Date.now())
  audit('report.created', null, { report: id, topic: r.topic })
  return { id }
}

const title = (topic: string) => {
  const [g, s, id] = topic.split('/')
  const t = getDoc(topicKey(g, s, id)) as TopicFile | undefined
  return t ? { title: t.title, emoji: t.emoji } : { title: id, emoji: '' }
}

export interface ReportFilter { status: string; grade: string | null; subject: string | null; topic: string | null }

function where(f: Omit<ReportFilter, 'status'>) {
  const sql: string[] = [], args: string[] = []
  if (f.topic) { sql.push('r.topic = ?'); args.push(f.topic) }
  else {
    if (f.grade) { sql.push("r.topic LIKE ? ESCAPE '\\'"); args.push(`${f.grade.replace(/[\\%_]/g, '\\$&')}/${f.subject ? `${f.subject.replace(/[\\%_]/g, '\\$&')}/` : ''}%`) }
  }
  return { sql: sql.map((x) => ` AND ${x}`).join(''), args }
}

/** The open draft a report is being fixed in (fixReports in work.ts), if it is still open. */
interface FixRow { draft_status: string | null; draft_author: string | null; draft_author_name: string | null }

function viewOf(r: ReportRow & FixRow & { decider: string | null }, claims: Map<string, ClaimView>) {
  const fixing = r.draft_id && (r.draft_status === 'draft' || r.draft_status === 'review')
  return {
    id: r.id, topic: r.topic, ...title(r.topic), target: { kind: r.target_kind, index: r.target_index, text: r.target_text }, reason: r.reason, note: r.note, quote: r.quote,
    release: r.release, status: r.status, createdAt: r.created_at, decidedAt: r.decided_at, decidedBy: r.decider, decisionNote: r.decision_note,
    fix: fixing ? { draft: r.draft_id!, status: r.draft_status!, author: { id: r.draft_author!, name: r.draft_author_name ?? '?' } } : null,
    claim: r.status === 'open' ? claims.get(r.id) ?? null : null,
  }
}
export type ReportView = ReturnType<typeof viewOf>

const SELECT = `SELECT r.*, u.name AS decider, d.status AS draft_status, d.user_id AS draft_author, du.name AS draft_author_name
  FROM reports r LEFT JOIN users u ON u.id = r.decided_by LEFT JOIN drafts d ON d.id = r.draft_id LEFT JOIN users du ON du.id = d.user_id`

export function listReports(_s: Session, f: ReportFilter) {
  const w = where(f)
  const claims = claimsBy('report')
  return all<ReportRow & FixRow & { decider: string | null }>(`${SELECT}
    WHERE ${f.status === 'closed' ? "r.status != 'open'" : "r.status = 'open'"}${w.sql}
    ORDER BY ${f.status === 'closed' ? 'r.decided_at' : 'r.created_at'} DESC LIMIT 300`, ...w.args).map((r) => viewOf(r, claims))
}

/** The reports a draft fixes (shown in the editor and to its reviewers). */
export function reportsOfDraft(draftId: string) {
  const claims = claimsBy('report')
  return all<ReportRow & FixRow & { decider: string | null }>(`${SELECT} WHERE r.draft_id = ? ORDER BY r.created_at`, draftId).map((r) => viewOf(r, claims))
}

/** A draft that fixed reports is deleted (left untouched, or thrown away): its author's claims of them go, the reports are free again. */
export function releaseReportsOfDraft(draftId: string, userId: string) {
  for (const r of all<{ id: string }>('SELECT id FROM reports WHERE draft_id = ?', draftId)) run("DELETE FROM claims WHERE kind = 'report' AND ref = ? AND user_id = ?", r.id, userId)
}

/** The draft was published: the reports it fixed are closed as fixed by its author, in that release. Runs inside the publish. */
export function closeReportsOfDraft(draftId: string, authorId: string, release: number) {
  const ids = all<{ id: string }>("SELECT id FROM reports WHERE draft_id = ? AND status = 'open'", draftId).map((r) => r.id)
  if (!ids.length) return
  run("UPDATE reports SET status = 'fixed', decided_at = ?, decided_by = ?, decision_note = ? WHERE draft_id = ? AND status = 'open'", Date.now(), authorId, `Opraveno ve vydání ${release}`, draftId)
  releaseClaims('report', ids)
}

export function reportCounts(_s: Session, f: Omit<ReportFilter, 'status'>) {
  const w = where(f)
  const n = (cond: string) => one<{ n: number }>(`SELECT COUNT(*) AS n FROM reports r WHERE ${cond}${w.sql}`, ...w.args)!.n
  return { open: n("r.status = 'open'"), closed: n("r.status != 'open'") }
}

export function updateReport(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  return updateReports(s, { ...body, ids: [id] }, ip)
}

/** Closes (or opens again) one report or several at once – the same mistake reported by several pupils. */
export function updateReports(s: Session, body: Record<string, unknown>, ip: string) {
  const ids = Array.isArray(body.ids) && body.ids.length <= 100 ? [...new Set(body.ids)] : []
  const rows = ids.map((id) => (typeof id === 'string' ? one<ReportRow>('SELECT * FROM reports WHERE id = ?', id) : undefined))
  if (!rows.length || rows.some((r) => !r)) throw new HttpError(404, 'Hlášení nenalezeno.')
  if (!REPORT_STATUS.includes(body.status as Status)) throw new HttpError(400, 'Neznámý stav.')
  const status = body.status as Status
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : ''
  for (const r of rows as ReportRow[]) {
    if (status === 'open') run('UPDATE reports SET status = ?, decided_at = NULL, decided_by = NULL, decision_note = NULL WHERE id = ?', status, r.id)
    else run('UPDATE reports SET status = ?, decided_at = ?, decided_by = ?, decision_note = ? WHERE id = ?', status, Date.now(), s.user.id, note || null, r.id)
    audit('report.updated', s.user.id, { report: r.id, status }, ip)
  }
  if (status !== 'open') releaseClaims('report', (rows as ReportRow[]).map((r) => r.id))
  return { ok: true }
}
