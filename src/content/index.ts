import subjects from 'virtual:content'
import type { GradeId, Subject, SubjectId, Topic } from './types'

// Content lives in content/topics/<grade>/<subject>/ (format: src/content/format.ts). Each subject is
// one chunk with its topics in the order of _subject.json (plugins/content-modules.ts); the service
// worker precaches all of them.
const cache = new Map<string, Promise<Subject>>()

export const hasSubject = (g: GradeId, s: SubjectId) => `${g}/${s}` in subjects

/** A subject with all its topics in school-year order. */
export function loadSubject(g: GradeId, s: SubjectId): Promise<Subject> {
  const key = `${g}/${s}`
  if (!subjects[key]) return Promise.reject(new Error('missing'))
  if (!cache.has(key)) cache.set(key, subjects[key]().then((m) => ({ grade: g, subject: s, topics: m.default })))
  return cache.get(key)!
}

/** One topic (loads its subject). */
export const loadTopic = (g: GradeId, s: SubjectId, id: string): Promise<Topic> =>
  loadSubject(g, s).then((subj) => subj.topics.find((t) => t.id === id) ?? Promise.reject(new Error('missing')))

export const topicKey = (g: GradeId, s: SubjectId, t: Topic | string) => `${g}/${s}/${typeof t === 'string' ? t : t.id}`

/** Every topic key in the app (loads all subjects – used only when importing a progress code). */
export async function allTopicKeys(): Promise<string[]> {
  const all = await Promise.all(Object.keys(subjects).map((k) => subjects[k]().then((m) => m.default.map((t) => `${k}/${t.id}`))))
  return all.flat()
}
