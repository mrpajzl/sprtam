import { useEffect, useState } from 'preact/hooks'
import type { GradeId } from '../content/types'

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
}

export interface Progress {
  v: 1
  /** Last chosen grade. */
  g?: GradeId
  /** Topic progress by "grade/subject/topic". */
  t: Record<string, TopicProgress>
  /** Vocabulary Leitner box (0–5) by English word. */
  w: Record<string, number>
}

const KEY = 'sprtam:progress'
const empty = (): Progress => ({ v: 1, t: {}, w: {} })
const today = () => Math.floor(Date.now() / 86_400_000)

function load(): Progress {
  try { const p = JSON.parse(localStorage.getItem(KEY) ?? ''); if (p?.v === 1) return { ...empty(), ...p } } catch { /* first run */ }
  return empty()
}

let state = load()
const subs = new Set<() => void>()

function commit(next: Progress) {
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

export function setGrade(g: GradeId) { if (state.g !== g) commit({ ...state, g }) }

export function recordTopic(key: string, score: number) {
  const prev = state.t[key]
  commit({ ...state, t: { ...state.t, [key]: { ...prev, s: Math.max(prev?.s ?? 0, Math.round(score)), n: (prev?.n ?? 0) + 1, d: today() } } })
}

export function preferExplanation(key: string, e: 0 | 1) {
  const prev = state.t[key] ?? { s: 0, n: 0, d: today() }
  if (prev.e !== e) commit({ ...state, t: { ...state.t, [key]: { ...prev, e } } })
}

export function setWordBox(en: string, box: number) {
  commit({ ...state, w: { ...state.w, [en]: Math.max(0, Math.min(5, box)) } })
}

/** Merge another device's progress: keep the better of both for every item. */
export function merge(a: Progress, b: Progress): Progress {
  const t = { ...a.t }
  for (const [k, v] of Object.entries(b.t)) {
    const x = t[k]
    t[k] = x ? { s: Math.max(x.s, v.s), n: Math.max(x.n, v.n), d: Math.max(x.d, v.d), e: x.d >= v.d ? x.e ?? v.e : v.e ?? x.e } : v
  }
  const w = { ...a.w }
  for (const [k, v] of Object.entries(b.w)) w[k] = Math.max(w[k] ?? 0, v)
  return { v: 1, g: a.g ?? b.g, t, w }
}

export function importProgress(p: Progress) { commit(merge(state, p)) }

export function resetProgress() { commit(empty()) }

/** 0–3 stars from a best score. */
export const stars = (s?: number) => (!s ? 0 : s >= 90 ? 3 : s >= 70 ? 2 : s >= 40 ? 1 : 0)
