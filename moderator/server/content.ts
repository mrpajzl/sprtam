import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { GRADE_SUBJECTS } from '../../src/content/curriculum'
import { subjectFile, topicFile } from '../../src/content/format'
import { topicIssues } from '../../src/content/rules'
import { validate } from '../../src/content/schema'
import type { ApproachFile, GradeId, SubjectFile, SubjectId, TopicFile } from '../../src/content/types'
import { GENERATOR_NAMES } from '../../src/quiz/generators'
import { CONFIG } from './config'
import { HttpError } from './http'

// The content this server was built with (content/ is copied into the image; every merge to main
// redeploys it). The authoritative check against the current main happens when a pull request is made.

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Git's blob id of a text: lets us tell whether a file on GitHub still is the one an edit started from. */
export const blobSha = (text: string) => { const b = Buffer.from(text, 'utf8'); return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex') }

export const topicPath = (g: string, s: string, id: string) => `content/topics/${g}/${s}/${id}.json`
export const subjectPath = (g: string, s: string) => `content/topics/${g}/${s}/_subject.json`

export function isSubject(g: unknown, s: unknown): boolean {
  return typeof g === 'string' && typeof s === 'string' && Object.hasOwn(GRADE_SUBJECTS, g) && (GRADE_SUBJECTS[g as GradeId] as string[]).includes(s)
}

const readText = (rel: string) => readFileSync(join(CONFIG.contentDir, rel.replace(/^content\//, '')), 'utf8')

export interface TopicRef { id: string; title: string; emoji: string; approach?: string }
export interface ContentIndex { subjects: Record<string, TopicRef[]>; approaches: { id: string; name: string; short: string; emoji: string }[]; generators: string[]; commit: string }

let index: ContentIndex | undefined

export function contentIndex(): ContentIndex {
  if (index) return index
  const subjects: Record<string, TopicRef[]> = {}
  for (const [g, list] of Object.entries(GRADE_SUBJECTS)) for (const s of list) {
    try {
      const ids = (JSON.parse(readText(subjectPath(g, s))) as SubjectFile).topics
      subjects[`${g}/${s}`] = ids.map((id) => {
        const t = JSON.parse(readText(topicPath(g, s, id))) as TopicFile
        return { id, title: t.title, emoji: t.emoji, ...(t.approach ? { approach: t.approach } : {}) }
      })
    } catch { subjects[`${g}/${s}`] = [] }
  }
  return (index = { subjects, approaches: approaches(), generators: GENERATOR_NAMES, commit: CONFIG.commit })
}

export function approachIds(): string[] {
  const dir = join(CONFIG.contentDir, 'approaches')
  return existsSync(dir) ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory()).sort() : []
}

function approaches() {
  return approachIds().map((id) => {
    const a = JSON.parse(readFileSync(join(CONFIG.contentDir, 'approaches', id, 'approach.json'), 'utf8')) as ApproachFile
    return { id, name: a.name, short: a.short, emoji: a.emoji }
  })
}

export function readTopic(g: string, s: string, id: string): { topic: TopicFile; sha: string } {
  if (!isSubject(g, s) || !ID.test(id)) throw new HttpError(404, 'Téma nenalezeno.')
  let text: string
  try { text = readText(topicPath(g, s, id)) } catch { throw new HttpError(404, 'Téma nenalezeno.') }
  return { topic: JSON.parse(text), sha: blobSha(text) }
}

export const topicExists = (g: string, s: string, id: string) => existsSync(join(CONFIG.contentDir, 'topics', g, s, `${id}.json`))

export interface Problem { path: string; message: string }

/** Everything check:content would say about this topic as a file of grade g / subject s (empty = fine). */
export function topicProblems(t: unknown, g: GradeId, s: SubjectId, id: string): Problem[] {
  const out: Problem[] = validate(topicFile, t).map((i) => ({ path: i.path === '(root)' ? '' : i.path, message: i.message }))
  const topic = t as TopicFile
  if (topic && typeof topic === 'object' && topic.id !== id) out.push({ path: 'id', message: `id "${topic.id}" differs from the file name` })
  if (!ID.test(id)) out.push({ path: 'id', message: 'id must be kebab-case ASCII' })
  if (!out.length) try { for (const i of topicIssues(topic, approachIds())) out.push({ path: i.path, message: i.message }) } catch { out.push({ path: '', message: 'cannot check the rules' }) }
  if (!isSubject(g, s)) out.push({ path: '', message: 'unknown grade or subject' })
  return out
}

export const subjectProblems = (v: unknown) => validate(subjectFile, v)
