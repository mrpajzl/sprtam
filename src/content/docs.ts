import { ALL_GRADES, GRADE_SUBJECTS } from './curriculum'
import { approachFile, approachYearFile, LEVELS, subjectFile, topicFile, vocabFile } from './format'
import type { S } from './schema'
import type { GradeId, SubjectId } from './types'

// Content is a set of documents (JSON values) with path-like keys – the same paths the files had in
// content/ (without .json). The content database stores versions of them, releases point at versions,
// and exports write them back as files:
//
//   topics/<grade>/<subject>/<topic-id>   one topic                       TopicFile
//   topics/<grade>/<subject>/_subject     order of the subject's topics   SubjectFile
//   vocab/<level>                         a1 … c1                         VocabFile
//   approaches/<id>/approach              a teaching approach             ApproachFile
//   approaches/<id>/<grade>               its plan of one year            ApproachYearFile

export type DocKind = 'topic' | 'subject' | 'vocab' | 'approach' | 'approach-year'

export type DocRef =
  | { kind: 'topic'; grade: GradeId; subject: SubjectId; id: string }
  | { kind: 'subject'; grade: GradeId; subject: SubjectId }
  | { kind: 'vocab'; level: (typeof LEVELS)[number] }
  | { kind: 'approach'; approach: string }
  | { kind: 'approach-year'; approach: string; grade: GradeId }

export const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Ids that are routes of the app and so cannot be ids of teaching approaches (/waldorf). */
export const RESERVED = ['g', 'p', 'hledat', 'mix', 'sdilet', 'slovicka', 'spojit', 'presun', 'widgety', 'nastaveni', 'prijimacky', 'slepa-mapa', 'o-aplikaci', 'prehled', 'chyby', 'dnes', 'api', 'assets', 'audio', 'healthz']

const isGrade = (g: string): g is GradeId => (ALL_GRADES as string[]).includes(g)
const isSubject = (g: GradeId, s: string): s is SubjectId => (GRADE_SUBJECTS[g] as string[]).includes(s)

/** What a key names, or null for anything that is not a content document. */
export function parseKey(key: string): DocRef | null {
  const p = key.split('/')
  if (p[0] === 'topics' && p.length === 4 && isGrade(p[1]) && isSubject(p[1], p[2])) {
    if (p[3] === '_subject') return { kind: 'subject', grade: p[1], subject: p[2] }
    return ID.test(p[3]) ? { kind: 'topic', grade: p[1], subject: p[2], id: p[3] } : null
  }
  if (p[0] === 'vocab' && p.length === 2) {
    const level = LEVELS.find((l) => l.toLowerCase() === p[1])
    return level ? { kind: 'vocab', level } : null
  }
  if (p[0] === 'approaches' && p.length === 3 && ID.test(p[1]) && !RESERVED.includes(p[1])) {
    if (p[2] === 'approach') return { kind: 'approach', approach: p[1] }
    return isGrade(p[2]) ? { kind: 'approach-year', approach: p[1], grade: p[2] } : null
  }
  return null
}

export const topicKey = (g: string, s: string, id: string) => `topics/${g}/${s}/${id}`
export const subjectKey = (g: string, s: string) => `topics/${g}/${s}/_subject`
export const vocabKey = (level: string) => `vocab/${level.toLowerCase()}`

export const SCHEMAS: Record<DocKind, S> = {
  topic: topicFile, subject: subjectFile, vocab: vocabFile, approach: approachFile, 'approach-year': approachYearFile,
}

/** `$schema` of each kind of file in content/ (relative to the file; for editors). */
export const SCHEMA_PATHS: Record<DocKind, string> = {
  topic: '../../../schema/topic.schema.json',
  subject: '../../../schema/subject.schema.json',
  vocab: '../schema/vocab.schema.json',
  approach: '../../schema/approach.schema.json',
  'approach-year': '../../schema/approach-year.schema.json',
}

/** A document as stored: without the editor-only `$schema` field. */
export function stripSchema<T>(v: T): T {
  if (!v || typeof v !== 'object' || Array.isArray(v) || !('$schema' in v)) return v
  const { $schema: _, ...rest } = v as Record<string, unknown>
  return rest as T
}
