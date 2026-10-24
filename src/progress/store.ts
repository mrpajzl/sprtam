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
  /** Score of the latest round (drives recommendations). */
  l?: number
}

export interface Progress {
  v: 1
  /** Last chosen grade. */
  g?: GradeId
  /** Topic progress by "grade/subject/topic". */
  t: Record<string, TopicProgress>
  /** Vocabulary Leitner box (0–5) by English word. */
  w: Record<string, number>
  /** Pinned topics: key → day pinned; negative = unpinned that day (so merging keeps the newer choice). */
  f?: Record<string, number>
  /** Days with any practice (newest last, at most 120). */
  a?: number[]
}

const KEY = 'sprtam:progress'
const empty = (): Progress => ({ v: 1, t: {}, w: {} })
export const today = () => Math.floor(Date.now() / 86_400_000)

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

const active = (a: number[] = []) => (a.at(-1) === today() ? a : [...a, today()].slice(-120))

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
  commit({ ...state, a: active(state.a), w: { ...state.w, [en]: Math.max(0, Math.min(5, box)) } })
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
  return { v: 1, g: a.g ?? b.g, t, w, f, a: days }
}

export function importProgress(p: Progress) { commit(merge(state, p)) }

export function resetProgress() { commit(empty()) }

/** 0–3 stars from a best score. */
export const stars = (s?: number) => (!s ? 0 : s >= 90 ? 3 : s >= 70 ? 2 : s >= 40 ? 1 : 0)
