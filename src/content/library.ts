import { useAsync } from '../ui/useAsync'
import { topicKey } from '.'
import type { GradeId, SubjectId } from './types'

// The whole topic catalogue as a light index (built by plugins/topic-index.ts),
// for search and recommendations without loading every subject chunk.

export interface TopicRef {
  g: GradeId
  s: SubjectId
  id: string
  title: string
  emoji: string
  key: string
  /** Position within its subject (school-year order). */
  i: number
  /** Set for topics that belong to one teaching approach only (not in the regular subject list). */
  approach?: string
}

let refs: Promise<TopicRef[]> | undefined
let byKey: Map<string, TopicRef> | undefined

export function loadIndex(): Promise<TopicRef[]> {
  return (refs ??= import('virtual:topic-index').then((m) => {
    const n = new Map<string, number>()
    const out = m.default.map(([g, s, id, title, emoji, approach]) => {
      const i = n.get(g + s) ?? 0
      n.set(g + s, i + 1)
      return { g, s, id, title, emoji, key: topicKey(g, s, id), i, ...(approach ? { approach } : {}) }
    })
    byKey = new Map(out.map((r) => [r.key, r]))
    return out
  }))
}

export const useIndex = () => useAsync(loadIndex, [])
export const refFor = (key: string) => byKey?.get(key)

/** Lowercase without diacritics: „Přemyslovci“ → „premyslovci“. */
export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

let texts: Promise<string[]> | undefined
export const loadTexts = () => (texts ??= import('virtual:topic-text').then((m) => m.default))

export interface Hit {
  ref: TopicRef
  score: number
  /** Matching line from the explanation (a term or key rule), when the title alone did not match. */
  via?: string
}

const folded = new WeakMap<object, { titles: string[]; lines: string[][] }>()

/** Every query word must appear in the title or the explanation's terms and key rules. */
export function searchTopics(query: string, all: TopicRef[], text: string[] | undefined, prefer?: GradeId): Hit[] {
  const words = fold(query).split(/[\s,]+/).filter(Boolean)
  if (!words.length) return []
  let f = folded.get(all)
  if (!f || (text && !f.lines.length)) {
    f = { titles: all.map((r) => fold(r.title)), lines: text ? text.map((t) => fold(t).split('\n')) : [] }
    folded.set(all, f)
  }
  const whole = fold(query.trim())
  const hits: Hit[] = []
  all.forEach((ref, k) => {
    const title = f!.titles[k]
    const lines = f!.lines[k] ?? []
    let score = 0, via: string | undefined
    for (const w of words) {
      const at = title.indexOf(w)
      if (at === 0 || (at > 0 && /[^a-z0-9]/.test(title[at - 1]))) score += 3
      else if (at > 0) score += 2
      else {
        const li = lines.findIndex((l) => l.includes(w))
        if (li < 0) return
        score += 1
        via ??= text![k].split('\n')[li]
      }
    }
    if (title.startsWith(whole)) score += 4
    if (ref.g === prefer) score += 0.5
    hits.push({ ref, score, via })
  })
  return hits.sort((a, b) => b.score - a.score).slice(0, 60)
}
