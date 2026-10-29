import type { TopicProgress } from './store'

// Plán před písemkou: the pupil picks the topics and the day of a test, the app spreads their practice over the days
// left. Pure functions without the browser (scripts/learning-test.ts checks them); kept in Progress.k (store.ts), so a
// plan travels with the progress to another device.
//
// A topic is READY when its latest round had at least READY_PCT and it was practised in the last FRESH_DAYS days.
// Every day until the day before the test, „Dnes“ offers the topics that are not ready – new ones first, then the
// weakest, then the longest unpractised – as many as it takes to get through all of them by then. The day before the
// test is for a practice test of all the topics; on the day itself only a quick look back.

export interface Plan {
  /** Name, e.g. „Písemka ze zlomků“. */
  n: string
  /** Day of the test (days since 1970, like every date in the progress). */
  d: number
  /** Topic keys "grade/subject/topic", in the order picked. */
  t: string[]
  /** Last change (ms): when two devices merge, the newer plan wins. */
  u: number
  /** Deleted (kept so that a merge does not bring it back). */
  x?: 1
}

export const READY_PCT = 75
export const FRESH_DAYS = 7
/** At most this many topics a day, however little time is left. */
export const MAX_A_DAY = 4
/** A past plan stays on the home screen this many days after the test. */
export const KEEP_DAYS = 2

export type TopicState = 'new' | 'weak' | 'stale' | 'ready'
export type Phase = 'learn' | 'final' | 'exam' | 'past'

export function topicState(v: TopicProgress | undefined, now: number): TopicState {
  if (!v?.n) return 'new'
  if ((v.l ?? v.s) < READY_PCT) return 'weak'
  return now - v.d > FRESH_DAYS ? 'stale' : 'ready'
}

export interface PlanDay {
  /** Days until the test: 1 = tomorrow, 0 = today, negative = past. */
  left: number
  phase: Phase
  states: Record<string, TopicState>
  /** Topics to practise today (not ready and not practised today yet). */
  today: string[]
  /** Topics of the plan practised today already. */
  doneToday: string[]
  ready: number
}

export function planDay(plan: Plan, t: Record<string, TopicProgress>, now: number): PlanDay {
  const left = plan.d - now
  const phase: Phase = left > 1 ? 'learn' : left === 1 ? 'final' : left === 0 ? 'exam' : 'past'
  const states: Record<string, TopicState> = {}
  for (const k of plan.t) states[k] = topicState(t[k], now)
  const doneToday = plan.t.filter((k) => t[k]?.d === now && !!t[k]?.n)
  const open = plan.t.filter((k) => states[k] !== 'ready')
  const rank = (k: string) => {
    const v = t[k], s = states[k]
    // New in the picked order, then the weakest, then the longest without practice.
    return s === 'new' ? plan.t.indexOf(k) : s === 'weak' ? 1000 + (v!.l ?? v!.s) : 2000 + Math.max(0, 999 - (now - v!.d))
  }
  // Days to learn in: today up to the day before the test (that one is for the practice test).
  const days = Math.max(1, left - 1)
  const quota = phase === 'learn' ? Math.min(MAX_A_DAY, Math.max(1, Math.ceil(open.length / days))) : phase === 'final' ? MAX_A_DAY : 0
  const today = open.filter((k) => !doneToday.includes(k)).sort((a, b) => rank(a) - rank(b)).slice(0, Math.max(0, quota - doneToday.length))
  return { left, phase, states, today, doneToday, ready: plan.t.length - open.length }
}

/** Plans to show, the nearest test first: not deleted and not past for more than KEEP_DAYS. */
export const activePlans = (k: Record<string, Plan> | undefined, now: number) =>
  Object.entries(k ?? {}).filter(([, p]) => !p.x && p.d >= now - KEEP_DAYS).sort((a, b) => a[1].d - b[1].d)

/** Merge the plans of two devices: the later change of each plan wins (a deletion too). */
export function mergePlans(a: Record<string, Plan> | undefined, b: Record<string, Plan> | undefined): Record<string, Plan> | undefined {
  if (!a && !b) return undefined
  const k = { ...a }
  for (const [id, p] of Object.entries(b ?? {})) if (!k[id] || p.u > k[id].u) k[id] = p
  return k
}

/** A day number from a date input (YYYY-MM-DD) and back. */
export const dayOf = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000) }
export const isoOf = (day: number) => new Date(day * 86_400_000).toISOString().slice(0, 10)

/** „pátek 6. 11.“ */
export const dayName = (day: number) => new Date(day * 86_400_000).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC' })
