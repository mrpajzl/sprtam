import { loadHash, manifest } from './remote'
import type { GradeId, Subject, SubjectId, Topic } from './types'

// Each subject is one file of the content release (subject/<grade>/<subject>, src/content/manifest.ts)
// with its topics in school-year order; the service worker keeps all of them for offline use.

const cache = new Map<string, Promise<Subject>>()

export const hasSubject = (g: GradeId, s: SubjectId) => `subject/${g}/${s}` in manifest().files

/** A subject with all its topics in school-year order. */
export function loadSubject(g: GradeId, s: SubjectId): Promise<Subject> {
  const h = manifest().files[`subject/${g}/${s}`]
  if (!h) return Promise.reject(new Error('missing'))
  if (!cache.has(h)) cache.set(h, loadHash<Topic[]>(h).then((topics) => ({ grade: g, subject: s, topics }), (e) => { cache.delete(h); throw e }))
  return cache.get(h)!
}

/** One topic (loads its subject). */
export const loadTopic = (g: GradeId, s: SubjectId, id: string): Promise<Topic> =>
  loadSubject(g, s).then((subj) => subj.topics.find((t) => t.id === id) ?? Promise.reject(new Error('missing')))

export const topicKey = (g: GradeId, s: SubjectId, t: Topic | string) => `${g}/${s}/${typeof t === 'string' ? t : t.id}`

/** Every topic key in the app (from the topic index – used only when importing a progress code). */
export async function allTopicKeys(): Promise<string[]> {
  const rows = await loadHash<[GradeId, SubjectId, string][]>(manifest().files.index)
  return rows.map(([g, s, id]) => `${g}/${s}/${id}`)
}
