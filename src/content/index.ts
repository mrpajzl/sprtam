import type { GradeId, Subject, SubjectId, Topic } from './types'

// Each subject file becomes its own chunk; the service worker precaches all of them.
const files = import.meta.glob<{ default: Subject }>('./data/*/*.ts')
const cache = new Map<string, Promise<Subject>>()

export const hasSubject = (g: GradeId, s: SubjectId) => `./data/${g}/${s}.ts` in files

export function loadSubject(g: GradeId, s: SubjectId): Promise<Subject> {
  const key = `./data/${g}/${s}.ts`
  if (!files[key]) return Promise.reject(new Error('missing'))
  if (!cache.has(key)) cache.set(key, files[key]().then((m) => m.default))
  return cache.get(key)!
}

export const topicKey = (g: GradeId, s: SubjectId, t: Topic | string) => `${g}/${s}/${typeof t === 'string' ? t : t.id}`

/** Every topic key in the app (loads all subject chunks – used only when importing a progress code). */
export async function allTopicKeys(): Promise<string[]> {
  const subs = await Promise.all(Object.values(files).map((f) => f().then((m) => m.default)))
  return subs.flatMap((s) => s.topics.map((t) => topicKey(s.grade, s.subject, t)))
}
