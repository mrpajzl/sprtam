import { randomUUID } from 'node:crypto'
import { topicKey } from '../../src/content/docs'
import type { TopicFile } from '../../src/content/types'
import type { Session } from './auth'
import { createInvite } from './auth'
import { DAY, MINUTE } from './config'
import { all, audit, one, run, tx } from './db'
import { HttpError, ipKey, limit } from './http'
import { getDoc } from './store'

// Applications to become a moderator. Every topic in the app says who wrote it and whether a person has checked
// it yet; an unchecked one invites the reader to help ("Chci to schválit" → /zapojit-se on moderation). Anyone may
// send the short form without an account; admins read the applications and approve one with an invite link to
// pass on to the applicant (docs/MODERACE.md, Žádosti o moderátorství).

export const APPLICATION_STATUS = ['open', 'approved', 'rejected'] as const
type Status = (typeof APPLICATION_STATUS)[number]

interface ApplicationRow {
  id: string; name: string; email: string; teacher: number; subjects: string; note: string; topic: string | null; status: Status
  created_at: number; decided_at: number | null; decided_by: string | null; decision_note: string | null; invite: string | null
}

/** Decided applications (with the applicant's e-mail) are kept this long, then deleted. */
const KEEP = 180 * DAY
/** More open applications than this wait until admins decide some (a flood cannot fill the database). */
const MAX_OPEN = 500
const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/
const TOPIC = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/

const line = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const para = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '')

/** The topic the applicant came from, when it exists: "<grade>/<subject>/<id>" and its title. */
function topicOf(v: unknown) {
  if (typeof v !== 'string' || !TOPIC.test(v)) return null
  const [g, s, id] = v.split('/')
  const t = getDoc(topicKey(g, s, id)) as TopicFile | undefined
  return t ? { key: v, title: t.title, emoji: t.emoji } : null
}

/** The public form. No account; limited per address and in total, a hidden field catches simple bots. */
export function createApplication(body: Record<string, unknown>, ip: string) {
  limit(`application:${ipKey(ip)}`, 5, 60 * MINUTE)
  limit('applications', 200, DAY)
  // A field people never see (the form hides it): whatever fills it is a bot. Pretend it worked.
  if (line(body.website, 200)) return { ok: true }
  const name = line(body.name, 80)
  if (name.length < 2) throw new HttpError(400, 'Napiš své jméno.')
  const email = line(body.email, 200).toLowerCase()
  if (!EMAIL.test(email)) throw new HttpError(400, 'Napiš e-mail, na který ti můžeme odpovědět.')
  if (typeof body.teacher !== 'boolean') throw new HttpError(400, 'Vyber, jestli učíš.')
  const teacher = body.teacher
  const subjects = teacher ? line(body.subjects, 300) : ''
  if (teacher && subjects.length < 2) throw new HttpError(400, 'Napiš, jaké předměty učíš.')
  const note = para(body.note, 2000)
  const topic = topicOf(body.topic)?.key ?? null
  const id = tx(() => {
    if (one('SELECT 1 FROM applications WHERE email = ? AND status = ?', email, 'open')) throw new HttpError(409, 'Žádost s tímto e-mailem už máme a čeká na vyřízení. Ozveme se.')
    if (one<{ n: number }>("SELECT COUNT(*) AS n FROM applications WHERE status = 'open'")!.n >= MAX_OPEN) throw new HttpError(429, 'Žádostí je teď moc. Zkus to prosím za pár dní.', 'rate', { retryAfter: 86400 })
    const id = randomUUID()
    run('INSERT INTO applications (id, name, email, teacher, subjects, note, topic, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id, name, email, teacher ? 1 : 0, subjects, note, topic, Date.now())
    return id
  })
  // No personal data in the log: the application itself holds it and is deleted later.
  audit('application.created', null, { application: id }, ip)
  return { ok: true }
}

const prune = () => run("DELETE FROM applications WHERE status != 'open' AND decided_at < ?", Date.now() - KEEP)

export function listApplications(status: unknown) {
  prune()
  const open = status !== 'decided'
  const rows = all<ApplicationRow & { decider: string | null; used: number | null }>(`
    SELECT a.*, u.name AS decider, (SELECT i.used_at FROM invites i WHERE substr(i.hash, 1, 16) = a.invite) AS used
    FROM applications a LEFT JOIN users u ON u.id = a.decided_by
    WHERE ${open ? "a.status = 'open'" : "a.status != 'open'"}
    ORDER BY ${open ? 'a.created_at' : 'a.decided_at DESC'} LIMIT 200`)
  return {
    counts: applicationCounts(),
    applications: rows.map((a) => ({
      id: a.id, name: a.name, email: a.email, teacher: !!a.teacher, subjects: a.subjects, note: a.note, topic: topicOf(a.topic),
      status: a.status, createdAt: a.created_at, decidedAt: a.decided_at, decidedBy: a.decider, decisionNote: a.decision_note,
      // Approved: has the applicant created their account with the link yet?
      joined: a.status === 'approved' ? !!a.used : null,
    })),
  }
}

export const applicationCounts = () => ({ open: one<{ n: number }>("SELECT COUNT(*) AS n FROM applications WHERE status = 'open'")!.n })

const find = (id: unknown) => {
  const a = typeof id === 'string' ? one<ApplicationRow>('SELECT * FROM applications WHERE id = ?', id) : undefined
  if (!a) throw new HttpError(404, 'Žádost nenalezena.')
  return a
}

/**
 * Approves an application: a single-use invite link for a moderator account in the applicant's name, to be passed
 * on to them. An approved application whose link has not been used yet gets a new link (the old one stops working).
 */
export function approveApplication(s: Session, id: unknown, ip: string) {
  return tx(() => {
    const a = find(id)
    if (a.status === 'rejected') throw new HttpError(409, 'Žádost je zamítnutá.')
    if (a.status === 'approved') {
      const used = a.invite ? one<{ used_at: number | null }>('SELECT used_at FROM invites WHERE substr(hash, 1, 16) = ?', a.invite) : undefined
      if (used?.used_at) throw new HttpError(409, 'Žadatel už si účet vytvořil.')
      if (a.invite) run('DELETE FROM invites WHERE substr(hash, 1, 16) = ? AND used_at IS NULL', a.invite)
    }
    // Names never contain a comma (several checkers of a topic are joined with one, profiles.ts).
    const out = createInvite(s.user, 'user', a.name.replace(/[,<>]/g, ' ').replace(/\s+/g, ' ').trim(), 'moderator')
    run("UPDATE applications SET status = 'approved', decided_at = ?, decided_by = ?, invite = ? WHERE id = ?", Date.now(), s.user.id, out.id, a.id)
    audit('application.approved', s.user.id, { application: a.id, name: a.name, again: a.status === 'approved' }, ip)
    return { url: out.url, expiresAt: out.expiresAt, name: a.name, email: a.email }
  })
}

export function rejectApplication(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const a = find(id)
  if (a.status !== 'open') throw new HttpError(409, 'Žádost už je vyřízená.')
  run("UPDATE applications SET status = 'rejected', decided_at = ?, decided_by = ?, decision_note = ? WHERE id = ?", Date.now(), s.user.id, para(body.note, 1000) || null, a.id)
  audit('application.rejected', s.user.id, { application: a.id }, ip)
  return { ok: true }
}
