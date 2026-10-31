import { GRADE_SUBJECTS, isCoreSubject, isGrade, ODB } from './curriculum'
import { approachFile, approachYearFile, LEVELS, subjectFile, topicFile, vocabFile, WORD_LANGS, wordsFile } from './format'
import type { S } from './schema'
import type { GradeId, SubjectId, YearId } from './types'

// Content is a set of documents (JSON values) with path-like keys – the same paths the files had in
// content/ (without .json). The content database stores versions of them, releases point at versions,
// and exports write them back as files:
//
//   topics/<grade>/<subject>/<topic-id>   one topic                       TopicFile
//   topics/<grade>/<subject>/_subject     order of the subject's topics   SubjectFile
//   topics/odb/<subject>/…                odborné předměty: any id that is not a core subject; their _subject names them
//   vocab/<level>                         a1 … c1 (English)               VocabFile
//   vocab/<lang>/<level>                  de, fr, es; a1 … c1             WordsFile
//   approaches/<id>/approach              a teaching approach             ApproachFile
//   approaches/<id>/<grade>               its plan of one year            ApproachYearFile

export type DocKind = 'topic' | 'subject' | 'vocab' | 'words' | 'approach' | 'approach-year'

export type DocRef =
  | { kind: 'topic'; grade: GradeId; subject: SubjectId; id: string }
  | { kind: 'subject'; grade: GradeId; subject: SubjectId }
  | { kind: 'vocab'; level: (typeof LEVELS)[number] }
  | { kind: 'words'; lang: (typeof WORD_LANGS)[number]; level: (typeof LEVELS)[number] }
  | { kind: 'approach'; approach: string }
  | { kind: 'approach-year'; approach: string; grade: YearId }

export const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Ids that are routes of the app and so cannot be ids of teaching approaches (/waldorf). */
export const RESERVED = ['g', 'p', 'obor', 'hledat', 'mix', 'sdilet', 'slovicka', 'spojit', 'presun', 'widgety', 'nastaveni', 'prijimacky', 'slepa-mapa', 'periodicka-tabulka', 'o-aplikaci', 'prehled', 'chyby', 'dnes', 'ucivo', 'hry', 'ja', 'skola', 'profily', 'plan', 'api', 'assets', 'audio', 'healthz']

/** A subject that may hold topics of grade g: the curriculum's, or for odb any id that is not a core subject. */
export const isSubjectOf = (g: GradeId, s: string): s is SubjectId => (g === ODB ? ID.test(s) && s.length <= 40 && !isCoreSubject(s) : (GRADE_SUBJECTS[g] as string[]).includes(s))

/** What a key names, or null for anything that is not a content document. */
export function parseKey(key: string): DocRef | null {
  const p = key.split('/')
  if (p[0] === 'topics' && p.length === 4 && isGrade(p[1]) && isSubjectOf(p[1], p[2])) {
    if (p[3] === '_subject') return { kind: 'subject', grade: p[1], subject: p[2] }
    return ID.test(p[3]) ? { kind: 'topic', grade: p[1], subject: p[2], id: p[3] } : null
  }
  if (p[0] === 'vocab' && p.length === 2) {
    const level = LEVELS.find((l) => l.toLowerCase() === p[1])
    return level ? { kind: 'vocab', level } : null
  }
  if (p[0] === 'vocab' && p.length === 3) {
    const lang = WORD_LANGS.find((l) => l === p[1]), level = LEVELS.find((l) => l.toLowerCase() === p[2])
    return lang && level ? { kind: 'words', lang, level } : null
  }
  if (p[0] === 'approaches' && p.length === 3 && ID.test(p[1]) && !RESERVED.includes(p[1])) {
    if (p[2] === 'approach') return { kind: 'approach', approach: p[1] }
    return isGrade(p[2]) && p[2] !== ODB ? { kind: 'approach-year', approach: p[1], grade: p[2] as YearId } : null
  }
  return null
}

export const topicKey = (g: string, s: string, id: string) => `topics/${g}/${s}/${id}`
export const subjectKey = (g: string, s: string) => `topics/${g}/${s}/_subject`
export const vocabKey = (level: string) => `vocab/${level.toLowerCase()}`
export const wordsKey = (lang: string, level: string) => `vocab/${lang}/${level.toLowerCase()}`

export const SCHEMAS: Record<DocKind, S> = {
  topic: topicFile, subject: subjectFile, vocab: vocabFile, words: wordsFile, approach: approachFile, 'approach-year': approachYearFile,
}

/** `$schema` of each kind of file in content/ (relative to the file; for editors). */
export const SCHEMA_PATHS: Record<DocKind, string> = {
  topic: '../../../schema/topic.schema.json',
  subject: '../../../schema/subject.schema.json',
  vocab: '../schema/vocab.schema.json',
  words: '../../schema/words.schema.json',
  approach: '../../schema/approach.schema.json',
  'approach-year': '../../schema/approach-year.schema.json',
}

/** A document as stored: without the editor-only `$schema` field. */
export function stripSchema<T>(v: T): T {
  if (!v || typeof v !== 'object' || Array.isArray(v) || !('$schema' in v)) return v
  const { $schema: _, ...rest } = v as Record<string, unknown>
  return rest as T
}
