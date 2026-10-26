import { createHash } from 'node:crypto'
import { ALL_GRADES } from './curriculum'
import { parseKey } from './docs'
import { MANIFEST_FORMAT, type ApproachMeta, type Manifest, type TopicRow } from './manifest'
import type { Snapshot } from './check'
import type { ApproachFile, ApproachYearFile, GradeId, SubjectFile, TopicFile, VocabFile } from './types'

// Turns a set of content documents (docs.ts) into the files the app reads (manifest.ts). Runs on the
// server: in the content service when something is published, and in development from content/.
// The same documents always give the same files and hashes.

export const hashOf = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 20)

export interface ReleaseFiles {
  /** Manifest without the release number and time (the publisher adds them). */
  manifest: Omit<Manifest, 'release' | 'publishedAt'>
  /** hash → file text (compact JSON). */
  files: Map<string, string>
}

export function buildRelease(snap: Snapshot): ReleaseFiles {
  const named = new Map<string, unknown>()
  const subjects: [string, string, SubjectFile][] = []
  const vocab: VocabFile[] = []
  const metas = new Map<string, ApproachFile>()
  const years: [string, GradeId, ApproachYearFile][] = []
  for (const [key, value] of snap) {
    const ref = parseKey(key)
    if (ref?.kind === 'subject') subjects.push([ref.grade, ref.subject, value as SubjectFile])
    else if (ref?.kind === 'vocab') vocab.push(value as VocabFile)
    else if (ref?.kind === 'approach') metas.set(ref.approach, value as ApproachFile)
    else if (ref?.kind === 'approach-year') years.push([ref.approach, ref.grade, value as ApproachYearFile])
  }

  // Subjects sorted by grade and subject id, as the folders were (the order of the search index).
  subjects.sort((a, b) => (a[0] + '/' + a[1] < b[0] + '/' + b[1] ? -1 : 1))
  const rows: TopicRow[] = []
  const text: string[] = []
  for (const [g, s, list] of subjects) {
    const topics = list.topics.map((id) => snap.get(`topics/${g}/${s}/${id}`) as TopicFile).filter(Boolean)
    named.set(`subject/${g}/${s}`, topics)
    for (const t of topics) {
      rows.push([g as GradeId, s, t.id, t.title, t.emoji, ...(t.approach ? [t.approach] : [])] as TopicRow)
      const lines = t.explanations.filter((x) => !x.approach).flatMap((x) => [x.title, ...x.blocks.flatMap((b) => (b.type === 'term' ? [b.term] : b.type === 'summary' ? [b.text] : []))])
      text.push([...new Set(lines)].join('\n').replace(/[*`]/g, ''))
    }
  }
  named.set('index', rows)
  named.set('text', text)
  for (const v of vocab.sort((a, b) => (a.level < b.level ? -1 : 1))) named.set(`vocab/${v.level}`, v)
  for (const [id, g, y] of years) named.set(`approach/${id}/${g}`, y)

  const approaches: ApproachMeta[] = [...metas.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([id, { format: _, ...a }]) => ({
    ...a, id, grades: years.filter((y) => y[0] === id).map((y) => y[1]).sort((x, y) => ALL_GRADES.indexOf(x) - ALL_GRADES.indexOf(y)),
  }))

  const files = new Map<string, string>()
  const index: Record<string, string> = {}
  for (const name of [...named.keys()].sort()) {
    const body = JSON.stringify(named.get(name))
    const h = hashOf(body)
    files.set(h, body)
    index[name] = h
  }
  const hash = hashOf(JSON.stringify({ index, approaches }))
  return { manifest: { format: MANIFEST_FORMAT, hash, files: index, approaches }, files }
}
