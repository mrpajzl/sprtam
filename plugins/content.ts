import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { stripSchema } from '../src/content/docs'
import type { ApproachFile, ApproachYearFile, GradeId, Subject, SubjectFile, SubjectId, Topic, VocabFile } from '../src/content/types'

// Reads content/ from disk for build plugins and scripts (the app itself loads it with import.meta.glob,
// see src/content/index.ts). No validation here – that is scripts/check-content.ts.

export const ROOT = join(import.meta.dirname, '..')
export const CONTENT = join(ROOT, 'content')
export const TOPICS = join(CONTENT, 'topics')
export const VOCAB = join(CONTENT, 'vocab')
export const APPROACHES = join(CONTENT, 'approaches')

export const readJson = <T,>(file: string): T => JSON.parse(readFileSync(file, 'utf8'))
const dirs = (d: string) => (existsSync(d) ? readdirSync(d).filter((f) => statSync(join(d, f)).isDirectory()).sort() : [])

/** Every [grade, subject] that has a content folder, sorted. */
export const subjectDirs = (): [GradeId, SubjectId][] => dirs(TOPICS).flatMap((g) => dirs(join(TOPICS, g)).map((s) => [g as GradeId, s as SubjectId] as [GradeId, SubjectId]))

/** A subject with its topics in the order of _subject.json. */
export function readSubject(g: GradeId, s: SubjectId): Subject {
  const dir = join(TOPICS, g, s)
  const list = readJson<SubjectFile>(join(dir, '_subject.json'))
  return { grade: g, subject: s, topics: list.topics.map((id) => readJson<Topic>(join(dir, `${id}.json`))) }
}

/** Every JSON file under content/topics (for watching in dev). */
export const topicFiles = () => subjectDirs().flatMap(([g, s]) => readdirSync(join(TOPICS, g, s)).filter((f) => f.endsWith('.json')).map((f) => join(TOPICS, g, s, f)))

export const readSubjects = (): Subject[] => subjectDirs().map(([g, s]) => readSubject(g, s))

/** Vocabulary levels, A1 first. */
export const readVocab = (): VocabFile[] => readdirSync(VOCAB).filter((f) => f.endsWith('.json')).sort().map((f) => readJson<VocabFile>(join(VOCAB, f)))

/** Every content file under `dir` as documents (src/content/docs.ts): key = path without .json, value without `$schema`. Throws on invalid JSON. */
export function readSnapshot(dir = CONTENT): Map<string, unknown> {
  const out = new Map<string, unknown>()
  const walk = (d: string, prefix: string) => {
    for (const f of existsSync(d) ? readdirSync(d).sort() : []) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p, `${prefix}${f}/`)
      else if (f.endsWith('.json')) out.set(`${prefix}${f.slice(0, -5)}`, stripSchema(readJson(p)))
    }
  }
  for (const top of ['topics', 'vocab', 'approaches']) walk(join(dir, top), `${top}/`)
  return out
}

export interface Approach extends ApproachFile { id: string; years: [GradeId, ApproachYearFile][] }

/** Teaching approaches (content/approaches/<id>/) with their years in school order. */
export function readApproaches(order: readonly GradeId[]): Approach[] {
  return dirs(APPROACHES).map((id) => {
    const dir = join(APPROACHES, id)
    const years = readdirSync(dir).filter((f) => f !== 'approach.json' && f.endsWith('.json')).map((f) => f.slice(0, -5) as GradeId)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    return { ...readJson<ApproachFile>(join(dir, 'approach.json')), id, years: years.map((g) => [g, readJson<ApproachYearFile>(join(dir, `${g}.json`))] as [GradeId, ApproachYearFile]) }
  })
}
