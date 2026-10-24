import { ALL_GRADES, GRADE_SUBJECTS } from '../content/curriculum'
import { fold, type TopicRef } from '../content/library'
import { isPinned, stars, today, type Progress } from './store'

// What to practise next, from what the student has already practised:
//   due  – practised before and its review interval has passed (spaced repetition;
//          the better the last score, the longer the gap; pinned topics come back sooner)
//   weak – the last round went badly
//   next – the following topic in a subject the student is working through
//   base – an earlier grade's topic that the weak one builds on
//   start – first topics of the chosen grade, before any practice

export type Why =
  | { k: 'due'; days: number }
  | { k: 'weak'; pct: number }
  | { k: 'next' }
  | { k: 'base' }
  | { k: 'start' }

export interface Rec { ref: TopicRef; why: Why; score: number }

/** Days until a topic should come back, by stars of its latest round. */
const GAP = [1, 1, 3, 7]

// Significant title words, cut to a stem so „zlomky“ meets „zlomků“.
const stems = (title: string) => fold(title).split(/[^a-z0-9]+/).filter((w) => w.length >= 5).map((w) => w.slice(0, 5))

export function recommend(p: Progress, all: TopicRef[], max = 5): Rec[] {
  const now = today()
  const byKey = new Map(all.map((r) => [r.key, r]))
  const recs = new Map<string, Rec>()
  const add = (ref: TopicRef, why: Why, score: number) => {
    const old = recs.get(ref.key)
    if (!old || old.score < score) recs.set(ref.key, { ref, why, score })
  }

  const practised = Object.entries(p.t).flatMap(([k, v]) => { const ref = byKey.get(k); return ref && v.n > 0 ? [{ ref, v }] : [] })

  for (const { ref, v } of practised) {
    const last = v.l ?? v.s
    const st = stars(last)
    const pinned = isPinned(p, ref.key)
    const gap = (st === 3 && v.n >= 3 ? 14 : GAP[st]) * (pinned ? 0.5 : 1)
    const days = now - v.d
    const weak = last < 60
    // A weak topic often rests on something from an earlier grade.
    if (weak) {
      const mine = new Set(stems(ref.title))
      const at = (r: TopicRef) => ALL_GRADES.indexOf(r.g)
      const base = all
        .filter((r) => r.s === ref.s && at(r) < at(ref) && stems(r.title).some((w) => mine.has(w)))
        .sort((a, b) => at(b) - at(a))[0]
      if (base && stars(p.t[base.key]?.s) < 3) add(base, { k: 'base' }, 0.9)
    }
    if (days >= gap) add(ref, weak ? { k: 'weak', pct: last } : { k: 'due', days }, days / gap + (pinned ? 1.5 : 0) + (weak ? 1 : 0))
  }

  // Keep going through the subjects practised most recently.
  const latest = new Map<string, { ref: TopicRef; d: number }>()
  for (const { ref, v } of practised) {
    const sub = ref.g + ref.s, cur = latest.get(sub)
    if (!cur || v.d > cur.d || (v.d === cur.d && ref.i > cur.ref.i)) latest.set(sub, { ref, d: v.d })
  }
  ;[...latest.values()].sort((a, b) => b.d - a.d).slice(0, 3).forEach(({ ref }, rank) => {
    const subject = all.filter((r) => r.g === ref.g && r.s === ref.s)
    const fresh = (r: TopicRef) => !p.t[r.key]?.n
    const next = subject.find((r) => r.i > ref.i && fresh(r)) ?? subject.find(fresh)
    if (next) add(next, { k: 'next' }, 1.2 - rank * 0.2)
  })

  if (!practised.length && p.g) {
    GRADE_SUBJECTS[p.g].forEach((s, n) => { const first = all.find((r) => r.g === p.g && r.s === s); if (first) add(first, { k: 'start' }, 0.5 - n * 0.01) })
  }

  // Best first, at most two per subject so the list stays varied.
  const per = new Map<string, number>()
  return [...recs.values()].sort((a, b) => b.score - a.score).filter((r) => {
    const sub = r.ref.g + r.ref.s, n = per.get(sub) ?? 0
    per.set(sub, n + 1)
    return n < 2
  }).slice(0, max)
}

/** Consecutive days with practice, ending today or yesterday. */
export function streak(p: Progress): number {
  const days = new Set(p.a ?? [])
  let d = today()
  if (!days.has(d)) d--
  let n = 0
  while (days.has(d)) { n++; d-- }
  return n
}
