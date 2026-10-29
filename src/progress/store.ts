import { useEffect, useState } from 'preact/hooks'
import type { YearId } from '../content/types'
import { frozen } from './freeze'
import { mergePlans, type Plan } from './plan'
import { nextBox, today, type QuestionProgress } from './questions'

export { isDue, isMistake, questionId, QUESTION_GAP, today, topicOf, type QuestionProgress } from './questions'

// All progress lives only in this browser (localStorage). Nothing is sent anywhere.

export interface TopicProgress {
  /** Best score 0–100 from any quiz mode. */
  s: number
  /** Number of finished practice rounds. */
  n: number
  /** Day of last practice (days since epoch). */
  d: number
  /** Preferred explanation (0/1) – remembered when the second one helped. */
  e?: 0 | 1
  /** Score of the latest round (drives recommendations). */
  l?: number
}

export interface Progress {
  v: 1
  /** Last chosen grade. */
  g?: YearId
  /** Topic progress by "grade/subject/topic". */
  t: Record<string, TopicProgress>
  /** Vocabulary Leitner box (0–5) by English word. */
  w: Record<string, number>
  /** Pinned topics: key → day pinned; negative = unpinned that day (so merging keeps the newer choice). */
  f?: Record<string, number>
  /** Days with any practice (newest last, at most 120). */
  a?: number[]
  /** Answered quiz questions by question id (`questionId`): spaced repetition of single questions. */
  q?: Record<string, QuestionProgress>
  /** Daily goal: answers per day (0 = off; unset = DEFAULT_GOAL). */
  o?: number
  /** Answers given today: [day, count]. */
  x?: [number, number]
  /** Plans before a test by id (plan.ts). */
  k?: Record<string, Plan>
}


const KEY = 'sprtam:progress'
const empty = (): Progress => ({ v: 1, t: {}, w: {} })

function load(): Progress {
  try { const p = JSON.parse(localStorage.getItem(KEY) ?? ''); if (p?.v === 1) return { ...empty(), ...p } } catch { /* first run */ }
  return empty()
}

let state = load()
const subs = new Set<() => void>()

function commit(next: Progress) {
  if (frozen) return
  state = next
  localStorage.setItem(KEY, JSON.stringify(state))
  subs.forEach((f) => f())
}

addEventListener('storage', (e) => { if (e.key === KEY) { state = load(); subs.forEach((f) => f()) } })

export const getProgress = () => state

export function useProgress(): Progress {
  const [, force] = useState(0)
  useEffect(() => { const f = () => force((x) => x + 1); subs.add(f); return () => { subs.delete(f) } }, [])
  return state
}

export function setGrade(g: YearId) { if (state.g !== g) commit({ ...state, g }) }

const active = (a: number[] = []) => (a.at(-1) === today() ? a : [...a, today()].slice(-120))
/** One more answer today (for the daily goal). */
const counted = (x?: [number, number]): [number, number] => (x?.[0] === today() ? [x[0], x[1] + 1] : [today(), 1])

export function recordTopic(key: string, score: number) {
  const prev = state.t[key]
  const l = Math.round(score)
  commit({ ...state, a: active(state.a), t: { ...state.t, [key]: { ...prev, s: Math.max(prev?.s ?? 0, l), n: (prev?.n ?? 0) + 1, d: today(), l } } })
}

export const isPinned = (p: Progress, key: string) => (p.f?.[key] ?? 0) > 0

/** Pinned topic keys, most recently pinned first. */
export const pinnedKeys = (p: Progress) => Object.entries(p.f ?? {}).filter(([, d]) => d > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k)

export function togglePin(key: string) {
  // Store the day, offset by a fraction of it so the newest action wins and keeps its order.
  const stamp = today() + (Date.now() % 86_400_000) / 86_400_000
  commit({ ...state, f: { ...state.f, [key]: isPinned(state, key) ? -stamp : stamp } })
}

export function preferExplanation(key: string, e: 0 | 1) {
  const prev = state.t[key] ?? { s: 0, n: 0, d: today() }
  if (prev.e !== e) commit({ ...state, t: { ...state.t, [key]: { ...prev, e } } })
}

export function setWordBox(en: string, box: number) {
  commit({ ...state, a: active(state.a), x: counted(state.x), w: { ...state.w, [en]: Math.max(0, Math.min(5, box)) } })
}

// ——— Single questions (rules in questions.ts) ———

/** At most this many questions are remembered; the longest-known ones go first. */
const MAX_QUESTIONS = 4000

/**
 * One answer in a quiz. Every answer counts towards the daily goal; `id` (questions of the content, not generated
 * ones) and `first` (only the first try in a round) also move the question's box.
 */
export function answered(id: string | undefined, ok: boolean, hint: boolean, first: boolean) {
  let q = state.q
  if (id && first) {
    const prev = q?.[id]
    q = { ...q, [id]: { b: nextBox(prev, ok, hint), d: today(), w: (prev?.w ?? 0) + (ok ? 0 : 1) } }
    const keys = Object.keys(q)
    if (keys.length > MAX_QUESTIONS) {
      // Forget the best-known ones that were never wrong first, then the oldest.
      const drop = keys.sort((a, b) => rank(q![a]) - rank(q![b])).slice(0, keys.length - MAX_QUESTIONS)
      q = { ...q }
      for (const k of drop) delete q[k]
    }
  }
  commit({ ...state, a: active(state.a), x: counted(state.x), q })
}
const rank = (v: QuestionProgress) => (v.w ? 1e6 : 0) - v.b * 1e5 + v.d

// ——— Daily goal ———

export const DEFAULT_GOAL = 20
export const GOALS = [0, 10, 20, 40]
export const goalOf = (p: Progress) => p.o ?? DEFAULT_GOAL
export const answeredToday = (p: Progress) => (p.x?.[0] === today() ? p.x[1] : 0)
export function setGoal(n: number) { if (goalOf(state) !== n) commit({ ...state, o: n }) }

// ——— Plans before a test (rules in plan.ts) ———

export const newPlanId = () => Math.random().toString(36).slice(2, 8)

export function savePlan(id: string, plan: Omit<Plan, 'u'>) {
  commit({ ...state, k: { ...state.k, [id]: { ...plan, u: Date.now() } } })
}

export function deletePlan(id: string) {
  const p = state.k?.[id]
  if (p) commit({ ...state, k: { ...state.k, [id]: { n: '', d: p.d, t: [], u: Date.now(), x: 1 } } })
}

/** Merge another device's progress: keep the better of both for every item. */
export function merge(a: Progress, b: Progress): Progress {
  const t = { ...a.t }
  for (const [k, v] of Object.entries(b.t)) {
    const x = t[k]
    const newer = x && x.d >= v.d ? x : v, older = newer === v ? x : v
    t[k] = x ? { s: Math.max(x.s, v.s), n: Math.max(x.n, v.n), d: Math.max(x.d, v.d), e: newer.e ?? older?.e, l: newer.l ?? older?.l } : v
  }
  const w = { ...a.w }
  for (const [k, v] of Object.entries(b.w)) w[k] = Math.max(w[k] ?? 0, v)
  const f = { ...a.f }
  for (const [k, v] of Object.entries(b.f ?? {})) if (Math.abs(v) > Math.abs(f[k] ?? 0)) f[k] = v
  const days = [...new Set([...(a.a ?? []), ...(b.a ?? [])])].sort((x, y) => x - y).slice(-120)
  const q = { ...a.q }
  for (const [k, v] of Object.entries(b.q ?? {})) {
    const x = q[k]
    // The later answer decides the box; mistakes add up as the larger count (both devices may have seen the same one).
    q[k] = !x ? v : { ...(v.d > x.d ? v : x), w: Math.max(x.w, v.w) }
  }
  // Today's answers: the later day wins; on the same day the larger count (it is the same day seen twice).
  let x = a.x
  if (b.x && (!x || b.x[0] > x[0])) x = b.x
  else if (b.x && x && b.x[0] === x[0]) x = [x[0], Math.max(x[1], b.x[1])]
  const o = a.o ?? b.o
  const k = mergePlans(a.k, b.k)
  return { v: 1, g: a.g ?? b.g, t, w, f, a: days, q, ...(o !== undefined ? { o } : {}), ...(x ? { x } : {}), ...(k ? { k } : {}) }
}

export function importProgress(p: Progress) { commit(merge(state, p)) }

export function resetProgress() { commit(empty()) }

/** 0–3 stars from a best score. */
export const stars = (s?: number) => (!s ? 0 : s >= 90 ? 3 : s >= 70 ? 2 : s >= 40 ? 1 : 0)
