import { randomUUID } from 'node:crypto'
import { WIDGETS } from '../../src/widgets'
import type { Session } from './auth'
import { LIMITS, MINUTE } from './config'
import { all, audit, one, run } from './db'
import { HttpError, limit } from './http'

// Requests for a new interactive widget (pomůcka). Widgets are code (src/widgets), so a moderator describes
// what pupils should be able to do and where it would help; others add their vote; admins plan it and,
// once the widget exists, link it.

export const REQUEST_STATUS = ['new', 'planned', 'building', 'done', 'declined'] as const
type Status = (typeof REQUEST_STATUS)[number]

interface RequestRow { id: string; user_id: string; title: string; body: string; example: string; topics: string; status: Status; admin_note: string; widget: string | null; created_at: number; updated_at: number }

const text = (v: unknown, max: number, what: string, min = 0) => {
  const t = typeof v === 'string' ? v.trim().slice(0, max) : ''
  if (t.length < min) throw new HttpError(400, what)
  return t
}

export function listRequests(s: Session) {
  const rows = all<RequestRow & { author: string; votes: number; mine: number }>(`
    SELECT r.*, u.name AS author, (SELECT COUNT(*) FROM widget_votes v WHERE v.request_id = r.id) AS votes,
      EXISTS (SELECT 1 FROM widget_votes v WHERE v.request_id = r.id AND v.user_id = ?) AS mine
    FROM widget_requests r JOIN users u ON u.id = r.user_id
    ORDER BY CASE r.status WHEN 'building' THEN 0 WHEN 'planned' THEN 1 WHEN 'new' THEN 2 WHEN 'done' THEN 3 ELSE 4 END, votes DESC, r.created_at DESC`, s.user.id)
  return rows.map((r) => ({
    id: r.id, title: r.title, body: r.body, example: r.example, topics: r.topics, status: r.status, adminNote: r.admin_note, widget: r.widget,
    author: { id: r.user_id, name: r.author }, votes: r.votes, voted: !!r.mine, createdAt: r.created_at, updatedAt: r.updated_at,
  }))
}

export function createRequest(s: Session, body: Record<string, unknown>, ip: string) {
  limit(`widget-request:${s.user.id}`, 10, 60 * MINUTE)
  const open = one<{ n: number }>("SELECT COUNT(*) AS n FROM widget_requests WHERE user_id = ? AND status IN ('new', 'planned', 'building')", s.user.id)!.n
  if (open >= LIMITS.widgetRequests) throw new HttpError(429, `Máš otevřených ${LIMITS.widgetRequests} žádostí. Počkej, až se některé vyřídí.`)
  const id = randomUUID(), now = Date.now()
  run('INSERT INTO widget_requests (id, user_id, title, body, example, topics, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id, s.user.id,
    text(body.title, 120, 'Napiš krátký název pomůcky.', 3),
    text(body.body, 4000, 'Popiš, co by si s pomůckou děti měly vyzkoušet (aspoň pár vět).', 20),
    text(body.example, 4000, ''),
    text(body.topics, 1000, ''),
    now, now)
  run('INSERT INTO widget_votes (request_id, user_id, created_at) VALUES (?, ?, ?)', id, s.user.id, now)
  audit('widget-request.created', s.user.id, { request: id }, ip)
  return { id }
}

const find = (id: unknown) => {
  const r = typeof id === 'string' ? one<RequestRow>('SELECT * FROM widget_requests WHERE id = ?', id) : undefined
  if (!r) throw new HttpError(404, 'Žádost nenalezena.')
  return r
}

export function voteRequest(s: Session, id: unknown) {
  const r = find(id)
  if (one('SELECT 1 FROM widget_votes WHERE request_id = ? AND user_id = ?', r.id, s.user.id)) run('DELETE FROM widget_votes WHERE request_id = ? AND user_id = ?', r.id, s.user.id)
  else run('INSERT INTO widget_votes (request_id, user_id, created_at) VALUES (?, ?, ?)', r.id, s.user.id, Date.now())
  return { ok: true }
}

/** The author edits the text while nobody has picked it up; admins set the state, a note and the finished widget. */
export function updateRequest(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const r = find(id)
  const admin = s.user.role === 'admin'
  if (!admin && (r.user_id !== s.user.id || r.status !== 'new')) throw new HttpError(403, 'Upravit smí autor, dokud žádost nikdo nevzal, nebo správce.')
  const set: Record<string, string | null> = {}
  if ('title' in body) set.title = text(body.title, 120, 'Napiš krátký název pomůcky.', 3)
  if ('body' in body) set.body = text(body.body, 4000, 'Popiš, co by si s pomůckou děti měly vyzkoušet.', 20)
  if ('example' in body) set.example = text(body.example, 4000, '')
  if ('topics' in body) set.topics = text(body.topics, 1000, '')
  if (admin && 'status' in body) {
    if (!REQUEST_STATUS.includes(body.status as Status)) throw new HttpError(400, 'Neznámý stav.')
    set.status = body.status as Status
  }
  if (admin && 'adminNote' in body) set.admin_note = text(body.adminNote, 2000, '')
  if (admin && 'widget' in body) {
    const w = body.widget === null || body.widget === '' ? null : String(body.widget)
    if (w !== null && !WIDGETS[w]) throw new HttpError(400, 'Taková pomůcka neexistuje.')
    set.widget = w
  }
  const keys = Object.keys(set)
  if (!keys.length) return { ok: true }
  run(`UPDATE widget_requests SET ${keys.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`, ...keys.map((k) => set[k]), Date.now(), r.id)
  audit('widget-request.updated', s.user.id, { request: r.id, fields: keys }, ip)
  return { ok: true }
}

export function deleteRequest(s: Session, id: unknown, ip: string) {
  const r = find(id)
  if (s.user.role !== 'admin' && (r.user_id !== s.user.id || r.status !== 'new')) throw new HttpError(403, 'Smazat smí autor, dokud žádost nikdo nevzal, nebo správce.')
  run('DELETE FROM widget_requests WHERE id = ?', r.id)
  audit('widget-request.deleted', s.user.id, { request: r.id }, ip)
}
