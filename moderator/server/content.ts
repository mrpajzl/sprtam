import { GRADE_SUBJECTS, isGrade, ODB, type VocationalMeta } from '../../src/content/curriculum'
import { ID, parseKey, subjectKey, topicKey } from '../../src/content/docs'
import { topicFile } from '../../src/content/format'
import { topicIssues } from '../../src/content/rules'
import { validate } from '../../src/content/schema'
import type { ApproachFile, GradeId, SubjectFile, SubjectId, TopicFile } from '../../src/content/types'
import { GENERATOR_NAMES } from '../../src/quiz/generators'
import { CONFIG } from './config'
import { HttpError } from './http'
import { current, getDoc, published, versionId } from './store'

// The published content as the editor needs it: the catalogue of topics, one topic, and the rules of a topic.

/** A subject that has topics: the curriculum's, or a published odborný předmět (topics/odb/<s>/_subject). */
export function isSubject(g: unknown, s: unknown): boolean {
  if (typeof g !== 'string' || typeof s !== 'string' || !isGrade(g)) return false
  return g === ODB ? published().has(subjectKey(ODB, s)) : (GRADE_SUBJECTS[g] as string[]).includes(s)
}

/** Published odborné předměty: id → name, emoji and colour. */
export function vocational(): Record<string, VocationalMeta> {
  const out: Record<string, VocationalMeta> = {}
  for (const k of published().keys()) {
    const r = parseKey(k)
    if (r?.kind !== 'subject' || r.grade !== ODB) continue
    const f = getDoc(k) as SubjectFile
    if (f.name && f.emoji && f.color) out[r.subject] = { name: f.name, emoji: f.emoji, c: f.color }
  }
  return out
}

export interface TopicRef { id: string; title: string; emoji: string; approach?: string }
export interface ContentIndex {
  subjects: Record<string, TopicRef[]>
  /** Odborné předměty (grade odb): their names, emoji and colours. */
  vocational: Record<string, VocationalMeta>
  approaches: { id: string; name: string; short: string; emoji: string }[]
  generators: string[]
  commit: string
  release: number
}

let cached: ContentIndex | undefined

export function contentIndex(): ContentIndex {
  const release = current()?.release ?? 0
  if (cached?.release === release) return cached
  const subjects: Record<string, TopicRef[]> = {}
  const voc = vocational()
  for (const [g, list] of [...Object.entries(GRADE_SUBJECTS), [ODB, Object.keys(voc)] as const]) for (const s of list) {
    const ids = (getDoc(subjectKey(g, s)) as SubjectFile | undefined)?.topics ?? []
    subjects[`${g}/${s}`] = ids.flatMap((id) => {
      const t = getDoc(topicKey(g, s, id)) as TopicFile | undefined
      return t ? [{ id, title: t.title, emoji: t.emoji, ...(t.approach ? { approach: t.approach } : {}) }] : []
    })
  }
  return (cached = { subjects, vocational: voc, approaches: approaches(), generators: GENERATOR_NAMES, commit: CONFIG.commit, release })
}

export const approachIds = () => [...published().keys()].flatMap((k) => { const r = parseKey(k); return r?.kind === 'approach' ? [r.approach] : [] }).sort()

function approaches() {
  return approachIds().map((id) => {
    const a = getDoc(`approaches/${id}/approach`) as ApproachFile
    return { id, name: a.name, short: a.short, emoji: a.emoji }
  })
}

/** A published topic and the id of its version. */
export function readTopic(g: string, s: string, id: string): { topic: TopicFile; version: number } {
  if (!isSubject(g, s) || !ID.test(id)) throw new HttpError(404, 'Téma nenalezeno.')
  const topic = getDoc(topicKey(g, s, id)) as TopicFile | undefined
  if (!topic) throw new HttpError(404, 'Téma nenalezeno.')
  return { topic, version: versionId(topicKey(g, s, id))! }
}

export const topicExists = (g: string, s: string, id: string) => published().has(topicKey(g, s, id))

export interface Problem { path: string; message: string }

/** Format and rules of one topic as a document of grade g / subject s (empty = fine) – what the editor shows. */
export function topicProblems(t: unknown, g: GradeId, s: SubjectId, id: string, founding = false): Problem[] {
  const out: Problem[] = validate(topicFile, t).map((i) => ({ path: i.path === '(root)' ? '' : i.path, message: i.message }))
  const topic = t as TopicFile
  if (topic && typeof topic === 'object' && topic.id !== id) out.push({ path: 'id', message: `id "${topic.id}" differs from the file name` })
  if (!ID.test(id)) out.push({ path: 'id', message: 'id must be kebab-case ASCII' })
  if (!out.length) try { for (const i of topicIssues(topic, approachIds())) out.push({ path: i.path, message: i.message }) } catch { out.push({ path: '', message: 'cannot check the rules' }) }
  if (!isSubject(g, s) && !founding) out.push({ path: '', message: 'unknown grade or subject' })
  return out
}
