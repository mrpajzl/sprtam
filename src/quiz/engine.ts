import type { Question, Topic } from '../content/types'
import { GENERATORS } from './generators'

export type ModeId = 'kviz' | 'opakovani' | 'pisemka' | 'zkouseni' | 'test'

export interface Mode {
  id: ModeId
  name: string
  hint: string
  /** Show right/wrong right after each answer (otherwise only at the end). */
  instant: boolean
  count: number
}

export const MODES: Record<ModeId, Mode> = {
  kviz: { id: 'kviz', name: 'Rychlý kvíz', hint: '5 otázek', instant: true, count: 5 },
  opakovani: { id: 'opakovani', name: 'Opakování', hint: 'dokud to neumíš', instant: true, count: 12 },
  pisemka: { id: 'pisemka', name: 'Písemka', hint: '10 otázek, známka', instant: false, count: 10 },
  zkouseni: { id: 'zkouseni', name: 'Zkoušení', hint: 'odpovídej nahlas', instant: true, count: 8 },
  test: { id: 'test', name: 'Test', hint: 'celý předmět, 20 otázek', instant: false, count: 20 },
}

export interface Item { q: Question; topic: string }

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

/** Builds the question list for a mode from one topic (or all topics of a subject for the test). */
export function build(mode: ModeId, topics: { key: string; t: Topic }[]): Item[] {
  const m = MODES[mode]
  const all = (pred: (q: Question) => boolean) => topics.flatMap(({ key, t }) => t.qs.filter(pred).map((q) => ({ q, topic: key })))
  const gen = (n: number) => topics.flatMap(({ key, t }) => (t.gen && GENERATORS[t.gen] ? Array.from({ length: n }, () => ({ q: GENERATORS[t.gen!](), topic: key })) : []))

  if (mode === 'zkouseni') {
    // Oral exam: real open questions first, then other questions asked "aloud".
    const open = shuffle(all((q) => q.t === 'open'))
    const rest = shuffle(all((q) => q.t === 'choice' || q.t === 'input' || q.t === 'tf'))
    return [...open, ...rest].slice(0, m.count)
  }

  const closed = all((q) => q.t !== 'open')
  if (mode === 'test') {
    // Spread evenly across topics.
    const per = Math.max(1, Math.ceil(m.count / topics.length))
    const picked = topics.flatMap(({ key }) => shuffle(closed.filter((i) => i.topic === key)).slice(0, per))
    return shuffle(picked).slice(0, m.count)
  }
  if (mode === 'opakovani') return shuffle([...closed, ...gen(3)]).slice(0, Math.max(m.count, closed.length))
  return shuffle([...shuffle(closed).slice(0, m.count), ...gen(Math.ceil(m.count / 3))]).slice(0, m.count)
}

const norm = (s: string) => s.toLowerCase().normalize('NFC').replace(/[\s.]+$/g, '').replace(/\s+/g, ' ').replace(/\s*([/:,·+−-])\s*/g, '$1').replace(/[’`]/g, "'").trim()
const asNum = (s: string) => { const t = s.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null }

const bare = (s: string) => norm(s).normalize('NFD').replace(/\p{M}/gu, '')

/** `strict` = diacritics matter (Czech spelling); elsewhere „Premyslovci“ counts as „Přemyslovci“. */
export function checkInput(given: string, accepted: string[], strict = true): boolean {
  const gn = asNum(given)
  return accepted.some((a) => {
    const an = asNum(a)
    if (gn !== null && an !== null) return Math.abs(gn - an) < 1e-9
    return strict ? norm(a) === norm(given) : bare(a) === bare(given)
  })
}

/** Spelling matters in Czech language and literature topics. */
export const strictFor = (topicKey: string) => /\/(cestina|literatura)\//.test(topicKey)

/** Czech school grade 1–5 from a percentage. */
export const grade = (pct: number) => (pct >= 90 ? 1 : pct >= 75 ? 2 : pct >= 50 ? 3 : pct >= 30 ? 4 : 5)
export const GRADE_WORD = ['', 'výborně', 'chvalitebně', 'dobře', 'dostatečně', 'nedostatečně']

/** Short text form of the correct answer (for feedback and the oral exam). */
export function answerText(q: Question): string {
  switch (q.t) {
    case 'choice': return q.o[q.a]
    case 'tf': return q.a ? 'Pravda' : 'Nepravda'
    case 'input': return q.a[0]
    case 'order': return q.items.join(' → ')
    case 'pair': return q.pairs.map(([a, b]) => `${a} – ${b}`).join(', ')
    case 'open': return q.a
  }
}
