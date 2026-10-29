import { useEffect, useState } from 'preact/hooks'
import type { Question, Topic } from '../content/types'
import type { Item, ModeId } from '../quiz/engine'
import { frozen } from './freeze'
import { questionId } from './questions'

// The unfinished round (localStorage sprtam:resume, only in this device and only for the current profile): a round
// interrupted by a closed tab, a call or a locked phone carries on where it stopped. One round at a time; it is saved
// after every answer and dropped when the round ends or a week has passed. Answers already given stay in the progress
// (store.ts) either way – the saved round only remembers which questions it had and how they went.

const KEY = 'sprtam:resume'
/** A saved round older than this is forgotten. */
const MAX_AGE = 7 * 86_400_000

/** A question of the round: a question of the content by its topic and id, a generated one whole. */
export interface SavedItem { t: string; id?: string; q?: Question }

export interface SavedRound {
  /** Where the round runs (its address), so it resumes only there. */
  path: string
  mode: ModeId
  /** What the home screen shows: the topic, subject or test. */
  label: string
  /** Last answer (ms). */
  at: number
  /** Distinct questions of the round. */
  items: SavedItem[]
  /** The order they are asked in, as indices into `items` (Opakování asks a wrong one again). */
  queue: number[]
  /** Position in the queue. */
  i: number
  /** Answers so far: k = index into `items`. */
  answers: { k: number; ok: boolean; hint: boolean }[]
  /** Time spent in the round (ms), for rounds with a clock. */
  ms?: number
}

const subs = new Set<() => void>()

export function savedRound(): SavedRound | undefined {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? 'null') as SavedRound | null
    if (r && typeof r.path === 'string' && Array.isArray(r.items) && Date.now() - r.at < MAX_AGE) return r
  } catch { /* none or broken */ }
  return undefined
}

export const savedRoundAt = (path: string) => { const r = savedRound(); return r?.path === path ? r : undefined }

export function saveRound(r: SavedRound) {
  if (frozen) return
  try { localStorage.setItem(KEY, JSON.stringify(r)) } catch { /* full or private mode: no resume */ }
  subs.forEach((f) => f())
}

/** Forget the saved round (only the one at `path`, when given). */
export function dropRound(path?: string) {
  if (path && savedRound()?.path !== path) return
  try { localStorage.removeItem(KEY) } catch { /* private mode */ }
  subs.forEach((f) => f())
}

addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) subs.forEach((f) => f()) })

export function useSavedRound(): SavedRound | undefined {
  const [, force] = useState(0)
  useEffect(() => { const f = () => force((x) => x + 1); subs.add(f); return () => { subs.delete(f) } }, [])
  return savedRound()
}

/** The round in a form that can be saved. */
export function packRound(base: Pick<SavedRound, 'path' | 'mode' | 'label' | 'ms'>, queue: Item[], i: number, answers: { item: Item; ok: boolean; hint: boolean }[]): SavedRound {
  const items: Item[] = [...new Set(queue)]
  const at = new Map(items.map((x, k) => [x, k]))
  return {
    ...base, at: Date.now(), i,
    items: items.map((x) => (x.id ? { t: x.topic, id: x.id } : { t: x.topic, q: x.q })),
    queue: queue.map((x) => at.get(x)!),
    answers: answers.map((a) => ({ k: at.get(a.item)!, ok: a.ok, hint: a.hint })),
  }
}

/** The saved round back with the questions of the loaded topics; undefined when any of them is gone (the content changed). */
export function unpackRound(r: SavedRound, topics: { key: string; t: Topic }[]) {
  const by = new Map<string, Item>()
  for (const { key, t } of topics) t.questions.forEach((q, index) => { const id = questionId(key, q); by.set(id, { q, topic: key, index, id }) })
  const items: Item[] = []
  for (const s of r.items) {
    const x = s.id ? by.get(s.id) : s.q ? { q: s.q, topic: s.t } : undefined
    if (!x) return undefined
    items.push(x)
  }
  if (r.queue.some((k) => !items[k]) || r.answers.some((a) => !items[a.k]) || r.i > r.queue.length) return undefined
  return { queue: r.queue.map((k) => items[k]), i: r.i, answers: r.answers.map((a) => ({ item: items[a.k], ok: a.ok, hint: a.hint })), ms: r.ms ?? 0 }
}

/** Topic keys of a saved round (to load them again). */
export const roundTopics = (r: SavedRound) => [...new Set(r.items.map((x) => x.t))]
