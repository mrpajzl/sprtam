import { isCoreSubject } from '../../src/content/curriculum'
import { parseKey } from '../../src/content/docs'
import type { TopicFile } from '../../src/content/types'
import { AVATARS, PROFILE_LIMITS, type Profile, type ProfileDetail, type ProfileTopic } from '../src/profile'
import type { Session } from './auth'
import { vocational } from './content'
import { all, audit, one, run, tx, type UserRow } from './db'
import { HttpError, limit } from './http'
import { current, getDoc } from './store'

// Moderators' own profiles (docs/MODERACE.md, Profil moderátora). Each moderator decides how they present
// themselves: the name shown at the topics they check, a line about who they are, a few sentences, the subjects
// they look after, their web page and a picture. The page /moderatori shows the profiles to everyone who made
// theirs public; signed-in moderators see all active colleagues. No e-mail, no photo uploads.

const line = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const para = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '')

/**
 * A name as it shows at checked topics, in the history and in the public content mirror. Several checkers of one
 * topic are joined with ", ", so a name never contains a comma. Shared with the admin's invites (admin.ts).
 */
export function cleanName(v: unknown) {
  const name = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''
  if (name.length < 2 || name.length > PROFILE_LIMITS.name) throw new HttpError(400, `Napiš jméno (2–${PROFILE_LIMITS.name} znaků).`)
  if (/[,<>]/.test(name)) throw new HttpError(400, 'Jméno nesmí obsahovat čárku ani znaky < >.')
  return name
}

/** A public web address: https only, without credentials, at most 200 characters. '' = none. */
function cleanWeb(v: unknown) {
  let s = line(v, 400)
  if (!s) return ''
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`
  let u: URL
  try { u = new URL(s) } catch { throw new HttpError(400, 'Webová adresa nevypadá správně.') }
  if (u.protocol !== 'https:' || u.username || u.password || !u.hostname.includes('.')) throw new HttpError(400, 'Webová adresa musí začínat https:// (bez jména a hesla).')
  const out = u.href
  if (out.length > PROFILE_LIMITS.web) throw new HttpError(400, `Webová adresa je moc dlouhá (nejvýš ${PROFILE_LIMITS.web} znaků).`)
  return out
}

function cleanSubjects(v: unknown) {
  if (!Array.isArray(v)) return []
  const voc = vocational()
  const out = [...new Set(v.filter((s): s is string => typeof s === 'string' && (isCoreSubject(s) || Object.hasOwn(voc, s))))]
  if (out.length > PROFILE_LIMITS.subjects) throw new HttpError(400, `Vyber nejvýš ${PROFILE_LIMITS.subjects} předmětů.`)
  return out
}

// ——— What each moderator did: checked topics and published changes (from the content history, per release) ———

interface Work { topics: Map<string, ProfileTopic[]>; published: Map<string, number> }
let work: { release: number; data: Work } | undefined

/**
 * Topics whose CURRENT version carries `verified` belong to the moderators who approved that version (a review
 * approval or "Ověřit"); matched by account, so a later change of name keeps them. Every publish is a new release,
 * so the result is kept until the next one.
 */
function workOf(): Work {
  const release = current()?.release ?? 0
  if (work?.release === release) return work.data
  const topics = new Map<string, ProfileTopic[]>()
  for (const r of all<{ key: string; approved_by: string }>(
    "SELECT d.key, v.approved_by FROM docs d JOIN versions v ON v.id = d.version WHERE d.key LIKE 'topics/%' AND v.approved_by IS NOT NULL")) {
    const t = getDoc(r.key) as TopicFile | undefined
    const k = parseKey(r.key)
    if (!t?.verified || k?.kind !== 'topic') continue
    let ids: unknown
    try { ids = JSON.parse(r.approved_by) } catch { continue }
    if (!Array.isArray(ids)) continue
    for (const id of ids) {
      if (typeof id !== 'string') continue
      const list = topics.get(id) ?? []
      list.push({ key: `${k.grade}/${k.subject}/${k.id}`, title: t.title, emoji: t.emoji, at: t.verified.at })
      topics.set(id, list)
    }
  }
  for (const list of topics.values()) list.sort((a, b) => b.at.localeCompare(a.at) || a.title.localeCompare(b.title, 'cs'))
  const published = new Map(all<{ user_id: string; n: number }>("SELECT user_id, COUNT(*) AS n FROM drafts WHERE status = 'published' GROUP BY user_id").map((r) => [r.user_id, r.n]))
  work = { release, data: { topics, published } }
  return work.data
}

function view(u: UserRow, w: Work): Profile {
  let subjects: string[] = []
  try { const s = JSON.parse(u.subjects); if (Array.isArray(s)) subjects = s.filter((x) => typeof x === 'string') } catch { /* keep none */ }
  return {
    id: u.id, name: u.name, role: u.role, headline: u.headline, bio: u.bio, subjects, web: u.web, avatar: u.avatar, public: !!u.public,
    since: u.created_at, verified: w.topics.get(u.id)?.length ?? 0, published: w.published.get(u.id) ?? 0,
  }
}

/** Has the moderator filled in anything beyond the name? Empty profiles are listed after the filled ones. */
const filled = (p: Profile) => !!(p.headline || p.bio || p.subjects.length || p.web || p.avatar)

/** The list on /moderatori: public profiles for everyone, all active colleagues for a signed-in moderator. */
export function listProfiles(s: Session | null) {
  const w = workOf()
  const rows = all<UserRow>(`SELECT * FROM users WHERE active = 1 ${s ? '' : 'AND public = 1'}`)
  return rows.map((u) => view(u, w)).sort((a, b) => Number(filled(b)) - Number(filled(a)) || b.verified - a.verified || a.name.localeCompare(b.name, 'cs'))
}

/** One profile, with the topics the moderator checked. Not public and nobody signed in: as if it did not exist. */
export function getProfile(s: Session | null, id: unknown): ProfileDetail {
  const u = typeof id === 'string' && id.length <= 64 ? one<UserRow>('SELECT * FROM users WHERE id = ? AND active = 1', id) : undefined
  if (!u || (!s && !u.public)) throw new HttpError(404, 'Tenhle profil neexistuje, nebo není veřejný.')
  const w = workOf()
  return { ...view(u, w), topics: (w.topics.get(u.id) ?? []).slice(0, 300) }
}

// ——— Names: current and former, compared without regard to case (Czech letters too) ———

const fold = (name: string) => name.toLocaleLowerCase('cs')

/** Every name an account had before (changes in its profile or by an admin), newest first: account id per name. */
function formerNames(): Map<string, string> {
  const out = new Map<string, string>()
  for (const r of all<{ user_id: string | null; detail: string | null }>(
    "SELECT user_id, detail FROM audit WHERE action IN ('profile.updated', 'user.renamed') ORDER BY id DESC")) {
    let d: { user?: unknown; name?: unknown }
    try { d = JSON.parse(r.detail ?? '{}') } catch { continue }
    // profile.updated: { name: { from, to } } by the account itself; user.renamed: { user, from, name } by an admin.
    const from = typeof d.name === 'object' && d.name ? (d.name as { from?: unknown }).from : (d as { from?: unknown }).from
    const id = typeof d.user === 'string' ? d.user : r.user_id
    if (typeof from === 'string' && id && !out.has(fold(from))) out.set(fold(from), id)
  }
  return out
}

/** The account a name belongs to now: its current name, or else a name it had before. */
function ownerOf(name: string): string | undefined {
  const f = fold(name)
  return all<{ id: string; name: string }>('SELECT id, name FROM users').find((u) => fold(u.name) === f)?.id ?? formerNames().get(f)
}

/**
 * Throws when a name is taken by another account – now, or before (topics checked under it still lead to that
 * account's profile, so nobody else may take it). Two people with one name could not be told apart at topics.
 */
export function assertNameFree(name: string, exceptId: string | null) {
  const owner = ownerOf(name)
  if (owner && owner !== exceptId) throw new HttpError(409, 'Tohle jméno už má (nebo mělo) jiný moderátor. Odliš ho třeba titulem nebo druhým jménem.')
}

/**
 * Whose profile a name at a topic is ("Zkontrolováno člověkem: …"). A topic keeps the name its checker had then, so
 * former names count too. Only profiles the viewer may see.
 */
export function profileByName(s: Session | null, v: unknown) {
  const name = line(v, PROFILE_LIMITS.name)
  const id = name ? ownerOf(name) : undefined
  const found = id ? one<{ id: string }>(`SELECT id FROM users WHERE id = ? AND active = 1 ${s ? '' : 'AND public = 1'}`, id) : undefined
  if (!found) throw new HttpError(404, 'Profil s tímhle jménem není veřejný.')
  return { id: found.id }
}

/** The signed-in moderator's own profile, for the form in Účet. */
export function ownProfile(s: Session): ProfileDetail {
  return getProfile(s, s.user.id)
}

/** Saves the own profile. Only in the browser (never with an API token: a script must not rename anyone). */
export function saveProfile(s: Session, body: Record<string, unknown>, ip: string): ProfileDetail {
  limit(`profile:${s.user.id}`, 30, 10 * 60_000)
  const name = cleanName(body.name)
  const headline = line(body.headline, PROFILE_LIMITS.headline)
  const bio = para(body.bio, PROFILE_LIMITS.bio)
  const subjects = cleanSubjects(body.subjects)
  const web = cleanWeb(body.web)
  const avatar = typeof body.avatar === 'string' && (AVATARS as readonly string[]).includes(body.avatar) ? body.avatar : ''
  if (typeof body.public !== 'boolean') throw new HttpError(400, 'Vyber, jestli má být profil veřejný.')
  const before = one<UserRow>('SELECT * FROM users WHERE id = ?', s.user.id)!
  tx(() => {
    assertNameFree(name, s.user.id)
    run('UPDATE users SET name = ?, headline = ?, bio = ?, subjects = ?, web = ?, avatar = ?, public = ?, profile_at = ? WHERE id = ?',
      name, headline, bio, JSON.stringify(subjects), web, avatar, body.public ? 1 : 0, Date.now(), s.user.id)
  })
  // The log keeps a change of name (others may wonder who is who) and of visibility, not the texts themselves.
  audit('profile.updated', s.user.id, {
    ...(before.name !== name ? { name: { from: before.name, to: name } } : {}),
    ...(!!before.public !== body.public ? { public: body.public } : {}),
  }, ip)
  return ownProfile({ ...s, user: { ...s.user, name } })
}
