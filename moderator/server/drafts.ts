import { randomUUID } from 'node:crypto'
import { GRADE_NAME, SUBJECTS } from '../../src/content/curriculum'
import { fileText } from '../../src/content/canonical'
import { subjectFile, topicFile } from '../../src/content/format'
import type { GradeId, SubjectFile, SubjectId, TopicFile } from '../../src/content/types'
import type { Session } from './auth'
import { CONFIG, LIMITS, MINUTE } from './config'
import { all, audit, one, run, type DraftRow } from './db'
import { blobSha, isSubject, readTopic, subjectPath, subjectProblems, topicExists, topicPath, topicProblems } from './content'
import { branchHead, commentPull, commitFiles, createBranch, fileAt, getPull, moveBranch, openPull } from './github'
import { HttpError, limit } from './http'

// A draft is one moderator's change of one topic (an edit, or a new topic with its place in the subject).
// It is saved as the moderator types; "Odeslat ke schválení" turns it into a pull request, later sends
// update the same pull request. Merging is up to the maintainers on GitHub.

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TOPIC_SCHEMA = '../../../schema/topic.schema.json'
const SUBJECT_SCHEMA = '../../../schema/subject.schema.json'

interface DraftData { topic: TopicFile; after?: string | null }

export interface DraftView {
  id: string; kind: 'edit' | 'new'; grade: GradeId; subject: SubjectId; topicId: string; title: string; rev: number
  status: DraftRow['status']; prNumber: number | null; prUrl: string | null; unsent: boolean
  author: { id: string; name: string }; createdAt: number; updatedAt: number; submittedAt: number | null
}

function view(d: DraftRow & { author_name?: string }): DraftView {
  return {
    id: d.id, kind: d.kind, grade: d.grade as GradeId, subject: d.subject as SubjectId, topicId: d.topic_id, title: d.title, rev: d.rev,
    status: d.status, prNumber: d.pr_number, prUrl: d.pr_url, unsent: d.status === 'submitted' ? d.rev !== d.submitted_rev : d.status === 'draft',
    author: { id: d.user_id, name: d.author_name ?? '' }, createdAt: d.created_at, updatedAt: d.updated_at, submittedAt: d.submitted_at,
  }
}

const SELECT = 'SELECT d.*, u.name AS author_name FROM drafts d JOIN users u ON u.id = d.user_id'

function load(s: Session, id: unknown): DraftRow & { author_name: string } {
  const d = typeof id === 'string' ? one<DraftRow & { author_name: string }>(`${SELECT} WHERE d.id = ?`, id) : undefined
  // Somebody else's draft looks exactly like a missing one (admins may see all).
  if (!d || (d.user_id !== s.user.id && s.user.role !== 'admin')) throw new HttpError(404, 'Návrh nenalezen.')
  return d
}

export function listDrafts(s: Session, everyone: boolean) {
  const rows = everyone && s.user.role === 'admin'
    ? all<DraftRow & { author_name: string }>(`${SELECT} ORDER BY d.updated_at DESC LIMIT 500`)
    : all<DraftRow & { author_name: string }>(`${SELECT} WHERE d.user_id = ? ORDER BY d.updated_at DESC`, s.user.id)
  return rows.map(view)
}

/** Open drafts of other moderators, by topic key – the library shows who is working on what. */
export function activeDrafts() {
  return all<{ grade: string; subject: string; topic_id: string; user_id: string; author_name: string; status: string; kind: string }>(
    `SELECT d.grade, d.subject, d.topic_id, d.user_id, d.status, d.kind, u.name AS author_name FROM drafts d JOIN users u ON u.id = d.user_id WHERE d.status IN ('draft', 'submitted')`)
    .map((d) => ({ key: `${d.grade}/${d.subject}/${d.topic_id}`, userId: d.user_id, name: d.author_name, status: d.status, kind: d.kind }))
}

export function getDraft(s: Session, id: unknown) {
  const d = load(s, id)
  const data = JSON.parse(d.data) as DraftData
  return { draft: view(d), topic: data.topic, after: data.after ?? null }
}

const openDrafts = (userId: string) => one<{ n: number }>("SELECT COUNT(*) AS n FROM drafts WHERE user_id = ? AND status IN ('draft', 'submitted')", userId)!.n

export function createDraft(s: Session, body: Record<string, unknown>) {
  const { kind } = body
  if (!isSubject(body.grade, body.subject)) throw new HttpError(400, 'Neznámý ročník nebo předmět.')
  const g = body.grade as string, sub = body.subject as string
  const now = Date.now()
  if (kind === 'edit') {
    const id = String(body.topicId ?? '')
    // One open draft per moderator and topic: editing again continues it.
    const mine = one<DraftRow>("SELECT * FROM drafts WHERE user_id = ? AND grade = ? AND subject = ? AND topic_id = ? AND status IN ('draft', 'submitted') ORDER BY updated_at DESC", s.user.id, g, sub, id)
    if (mine) return getDraft(s, mine.id)
    const { topic, sha } = readTopic(g, sub, id)
    if (openDrafts(s.user.id) >= LIMITS.drafts) throw new HttpError(429, `Máš rozpracováno ${LIMITS.drafts} návrhů. Nejdřív některé dokonči nebo smaž.`)
    const draftId = randomUUID()
    run('INSERT INTO drafts (id, user_id, kind, grade, subject, topic_id, title, data, base_sha, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      draftId, s.user.id, 'edit', g, sub, id, topic.title, JSON.stringify({ topic }), sha, now, now)
    return getDraft(s, draftId)
  }
  if (kind === 'new') {
    const topic = body.topic as TopicFile
    if (!topic || typeof topic !== 'object' || typeof topic.id !== 'string' || !ID.test(topic.id)) throw new HttpError(400, 'Id tématu smí mít jen malá písmena bez diakritiky, číslice a pomlčky.')
    if (topicExists(g, sub, topic.id)) throw new HttpError(409, 'Téma s tímto id v předmětu už je. Zvol jiný název nebo id.')
    if (one("SELECT 1 FROM drafts WHERE kind = 'new' AND grade = ? AND subject = ? AND topic_id = ? AND status IN ('draft', 'submitted')", g, sub, topic.id)) throw new HttpError(409, 'Nové téma s tímto id už někdo rozpracoval.')
    if (openDrafts(s.user.id) >= LIMITS.drafts) throw new HttpError(429, `Máš rozpracováno ${LIMITS.drafts} návrhů. Nejdřív některé dokonči nebo smaž.`)
    const draftId = randomUUID()
    run('INSERT INTO drafts (id, user_id, kind, grade, subject, topic_id, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      draftId, s.user.id, 'new', g, sub, topic.id, String(topic.title ?? topic.id).slice(0, 200), JSON.stringify({ topic, after: typeof body.after === 'string' ? body.after : null }), now, now)
    return getDraft(s, draftId)
  }
  throw new HttpError(400, 'Neznámý druh návrhu.')
}

export function saveDraft(s: Session, id: unknown, body: Record<string, unknown>) {
  const d = load(s, id)
  if (d.user_id !== s.user.id) throw new HttpError(403, 'Upravovat smí jen autor návrhu.')
  if (d.status === 'merged' || d.status === 'closed') throw new HttpError(409, 'Návrh je uzavřený. Začni nový.')
  if (body.rev !== d.rev) throw new HttpError(409, 'Návrh se mezitím změnil v jiném okně. Načti ho znovu.', 'stale')
  const topic = body.topic as TopicFile
  if (!topic || typeof topic !== 'object') throw new HttpError(400, 'Chybí téma.')
  // The id of an existing topic never changes (progress is stored by it); a new topic keeps its id once created.
  if (topic.id !== d.topic_id) throw new HttpError(400, 'Id tématu se nedá změnit.')
  const old = JSON.parse(d.data) as DraftData
  const after = d.kind === 'new' ? (body.after === null || typeof body.after === 'string' ? body.after : old.after ?? null) : undefined
  const rev = d.rev + 1, now = Date.now()
  run('UPDATE drafts SET data = ?, title = ?, rev = ?, updated_at = ? WHERE id = ? AND rev = ?',
    JSON.stringify({ topic, ...(d.kind === 'new' ? { after } : {}) }), String(topic.title || d.title).slice(0, 200), rev, now, d.id, d.rev)
  return { rev, updatedAt: now }
}

export function deleteDraft(s: Session, id: unknown, ip: string) {
  const d = load(s, id)
  if (d.user_id !== s.user.id && s.user.role !== 'admin') throw new HttpError(403, 'Smazat smí jen autor.')
  if (d.status === 'submitted') throw new HttpError(409, 'Návrh čeká na schválení. Zavři pull request na GitHubu, nebo počkej na rozhodnutí.')
  run('DELETE FROM drafts WHERE id = ?', d.id)
  audit('draft.deleted', s.user.id, { draft: d.id, topic: `${d.grade}/${d.subject}/${d.topic_id}` }, ip)
}

// ——— Pull requests ———

/** "2, 5 a 7" */
const nums = (xs: number[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} a ${xs[xs.length - 1]}` : String(xs[0]))

/** What changed between two lists, in words: „změněno 2 (č. 3 a 5), přidáno 1“. */
function listChange<T>(a: T[], b: T[]): string {
  const same = (x: T, y: T) => JSON.stringify(x) === JSON.stringify(y)
  const changed = b.flatMap((x, i) => (i < a.length && !same(a[i], x) ? [i + 1] : []))
  const parts = [
    ...(changed.length ? [`změněno ${changed.length} (č. ${nums(changed)})`] : []),
    ...(b.length > a.length ? [`přidáno ${b.length - a.length}`] : []),
    ...(a.length > b.length ? [`odebráno ${a.length - b.length}`] : []),
  ]
  return parts.join(', ')
}

function summary(before: TopicFile | null, after: TopicFile): string[] {
  const blocks = (t: TopicFile) => t.explanations.map((x) => `${x.title} (${x.blocks.length} bloků)`).join(', ')
  if (!before) return [`Nové téma **${after.emoji} ${after.title}**: ${after.explanations.length} vysvětlení – ${blocks(after)}; ${after.questions.length} otázek.`]
  const out: string[] = []
  if (before.title !== after.title || before.emoji !== after.emoji) out.push(`Název: ${before.emoji} ${before.title} → ${after.emoji} ${after.title}`)
  after.explanations.forEach((x, i) => {
    const b = before.explanations[i]
    if (!b) return out.push(`Nové vysvětlení „${x.title}“ (${x.blocks.length} bloků)`)
    if (b.title !== x.title) out.push(`Vysvětlení „${b.title}“ přejmenováno na „${x.title}“`)
    const c = listChange(b.blocks, x.blocks)
    if (c) out.push(`Vysvětlení „${x.title}“ – bloky: ${c}`)
  })
  if (before.explanations.length > after.explanations.length) out.push(`Odebráno vysvětlení (${before.explanations.length} → ${after.explanations.length})`)
  const q = listChange(before.questions, after.questions)
  if (q) out.push(`Otázky: ${q}`)
  if (before.generator !== after.generator) out.push(`Generátor příkladů: ${before.generator ?? '–'} → ${after.generator ?? '–'}`)
  return out.length ? out : ['Beze změny obsahu.']
}

/** User text in a pull request: no @-mentions (they would notify people). */
const md = (t: string) => t.replace(/@/g, '@\u200b')

const withSchema = (t: TopicFile) => ({ $schema: TOPIC_SCHEMA, ...t })

/** The new list of topics: `id` inserted after `after` (at the start for null, at the end when `after` is gone). */
function insertTopic(list: SubjectFile, id: string, after: string | null | undefined): SubjectFile {
  if (list.topics.includes(id)) return list
  const topics = [...list.topics]
  const at = after === null ? 0 : after !== undefined && topics.includes(after) ? topics.indexOf(after) + 1 : topics.length
  topics.splice(at, 0, id)
  return { ...list, topics }
}

export async function submitDraft(s: Session, id: unknown, body: Record<string, unknown>, ip: string) {
  const d = load(s, id)
  if (d.user_id !== s.user.id) throw new HttpError(403, 'Odeslat smí jen autor návrhu.')
  if (d.status === 'merged' || d.status === 'closed') throw new HttpError(409, 'Návrh je uzavřený. Začni nový.')
  limit(`submit:${s.user.id}`, 20, 60 * MINUTE)
  const data = JSON.parse(d.data) as DraftData
  const topic = data.topic
  const g = d.grade as GradeId, sub = d.subject as SubjectId
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : ''

  // The same checks as the deploy (npm run check:content): a pull request from here never breaks the build.
  const problems = topicProblems(topic, g, sub, d.topic_id)
  if (problems.length) throw new HttpError(422, 'Téma ještě není hotové – oprav zvýrazněné věci.', 'invalid', { problems })

  const path = topicPath(g, sub, d.topic_id)
  const text = fileText(topicFile, withSchema(topic))
  const main = await branchHead(CONFIG.githubBase)
  if (!main) throw new HttpError(502, 'Na GitHubu chybí hlavní větev.')
  const onMain = await fileAt(path, main)

  let before: TopicFile | null = null
  if (d.kind === 'edit') {
    if (!onMain) throw new HttpError(409, 'Téma mezitím z učiva zmizelo. Dej vědět správci.', 'conflict')
    before = JSON.parse(onMain.text)
    // Someone changed the topic since this draft started: do not silently overwrite their work.
    if (onMain.sha !== d.base_sha && onMain.text !== text && d.status === 'draft') {
      throw new HttpError(409, 'Téma mezitím někdo jiný změnil a jeho změna je už schválená. Otevři téma znovu a úpravy přenes do nové verze.', 'conflict')
    }
    if (before!.approach !== topic.approach) throw new HttpError(422, 'Přístup k výuce celého tématu se tady měnit nedá.')
  } else if (onMain && d.status === 'draft') {
    throw new HttpError(409, 'Téma s tímto id už v učivu je. Založ nové téma s jiným názvem.', 'conflict')
  }
  if (d.kind === 'new' && topic.approach) throw new HttpError(422, 'Téma jen pro jeden přístup k výuce se zakládá ručně v repozitáři.')

  const author = { name: s.user.name, email: 'moderace@sprtam.cz' }
  const where = `${GRADE_NAME[g]}, ${SUBJECTS[sub].name}`
  const message = `${d.kind === 'new' ? 'Přidat téma' : 'Upravit téma'} ${topic.title} (${where})\n\nNavrhl/a ${s.user.name} v moderaci Šprtámu.`
  const pull = d.pr_number ? await getPull(d.pr_number) : null
  const open = pull?.state === 'open'

  // The files of this change, on top of `ref`; the topic list is merged into whatever that branch has.
  const files = async (ref: string) => {
    const out = [{ path, text }]
    if (d.kind === 'new') {
      const sp = subjectPath(g, sub)
      const cur = await fileAt(sp, ref)
      if (!cur) throw new HttpError(409, 'Na GitHubu chybí seznam témat předmětu.')
      const list = insertTopic(JSON.parse(cur.text) as SubjectFile, d.topic_id, data.after)
      if (subjectProblems(list).length) throw new HttpError(409, 'Seznam témat předmětu na GitHubu je poškozený. Dej vědět správci.')
      const listText = fileText(subjectFile, { $schema: SUBJECT_SCHEMA, ...list })
      if (listText !== cur.text) out.push({ path: sp, text: listText })
    }
    return out
  }

  let branch = d.branch, number = d.pr_number, url = d.pr_url
  if (open && branch) {
    const head = await branchHead(branch)
    if (!head) throw new HttpError(409, 'Větev návrhu na GitHubu chybí. Dej vědět správci.')
    const sha = await commitFiles(head, await files(head), message, author)
    await moveBranch(branch, sha)
    await commentPull(number!, [`**${md(s.user.name)}** poslal/a úpravy návrhu.`, ...(note ? [`> ${md(note).replace(/\n/g, '\n> ')}`] : [])].join('\n\n'))
  } else {
    branch = `moderace/${d.topic_id}-${d.id.slice(0, 8)}${d.pr_number ? `-${Date.now().toString(36)}` : ''}`
    const sha = await commitFiles(main, await files(main), message, author)
    await createBranch(branch, sha)
    const lines = summary(before, topic)
    const pr = await openPull(branch, `${d.kind === 'new' ? 'Nové téma' : 'Úprava tématu'}: ${topic.emoji} ${topic.title} (${where})`, [
      `Navrhl/a **${md(s.user.name)}** v [moderaci Šprtámu](${CONFIG.origin}).`,
      '',
      ...(note ? [`> ${md(note).replace(/\n/g, '\n> ')}`, ''] : []),
      '### Změny',
      ...lines.map((l) => `- ${l}`),
      '',
      `Soubor: \`${path}\``,
      '',
      'Obsah prošel stejnou kontrolou jako `npm run check:content` (formát i pravidla z docs/CONTENT.md). Po sloučení se nasadí automaticky.',
    ].join('\n'))
    number = pr.number; url = pr.html_url
  }
  const now = Date.now()
  run("UPDATE drafts SET status = 'submitted', branch = ?, pr_number = ?, pr_url = ?, submitted_rev = rev, submitted_at = ?, checked_at = ?, base_sha = COALESCE(base_sha, ?) WHERE id = ?",
    branch, number, url, now, now, d.kind === 'edit' ? onMain?.sha ?? null : blobSha(text), d.id)
  audit(open ? 'draft.updated' : 'draft.submitted', s.user.id, { draft: d.id, pr: number, topic: `${g}/${sub}/${d.topic_id}` }, ip)
  return getDraft(s, d.id)
}

/** Refreshes the state of submitted drafts from GitHub (at most once a minute each). */
export async function refreshStatuses(drafts: DraftView[]) {
  const now = Date.now()
  const due = all<DraftRow>("SELECT * FROM drafts WHERE status = 'submitted' AND pr_number IS NOT NULL AND (checked_at IS NULL OR checked_at < ?)", now - MINUTE)
    .filter((d) => drafts.some((x) => x.id === d.id)).slice(0, 20)
  await Promise.all(due.map(async (d) => {
    const p = await getPull(d.pr_number!).catch(() => undefined)
    if (p === undefined) return
    const status = !p ? 'closed' : p.merged_at ? 'merged' : p.state === 'closed' ? 'closed' : 'submitted'
    run('UPDATE drafts SET status = ?, checked_at = ? WHERE id = ?', status, now, d.id)
    const v = drafts.find((x) => x.id === d.id)
    if (v) v.status = status
  }))
  return drafts
}
