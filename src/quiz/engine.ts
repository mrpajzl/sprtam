import type { Question, Topic } from '../content/types'
import { isDue, isMistake, questionId, today, type QuestionProgress } from '../progress/questions'
import { GENERATORS } from './generators'

export type ModeId = 'kviz' | 'opakovani' | 'pisemka' | 'zkouseni' | 'test' | 'mix' | 'chyby' | 'dnes'
/** Modes of one topic (/g/z5/matematika/zlomky/<mode>). */
export const TOPIC_MODES: ModeId[] = ['kviz', 'opakovani', 'pisemka', 'zkouseni']

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
  mix: { id: 'mix', name: 'Mix', hint: 'připnutá témata', instant: true, count: 15 },
  chyby: { id: 'chyby', name: 'Sešit chyb', hint: 'co se ti spletlo', instant: true, count: 15 },
  dnes: { id: 'dnes', name: 'Dnešní opakování', hint: 'co ti vypadává z hlavy', instant: true, count: 10 },
}

export interface Item {
  q: Question
  topic: string
  /** Questions of the content (not generated ones): position in the topic and the id its progress is kept under. */
  index?: number
  id?: string
}

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

/** Builds the question list for a mode from one topic (or all topics of a subject for the test). */
export function build(mode: ModeId, topics: { key: string; t: Topic }[]): Item[] {
  const m = MODES[mode]
  const all = (pred: (q: Question) => boolean) => topics.flatMap(({ key, t }) => t.questions.flatMap((q, index) => (pred(q) ? [{ q, topic: key, index, id: questionId(key, q) }] : [])))
  const gen = (n: number) => topics.flatMap(({ key, t }) => (t.generator && GENERATORS[t.generator] ? Array.from({ length: n }, () => ({ q: GENERATORS[t.generator!](), topic: key })) : []))

  if (mode === 'zkouseni') {
    // Oral exam: real open questions first, then other questions asked "aloud".
    const open = shuffle(all((q) => q.type === 'open'))
    const rest = shuffle(all((q) => q.type === 'choice' || q.type === 'input' || q.type === 'truefalse'))
    return [...open, ...rest].slice(0, m.count)
  }

  const closed = all((q) => q.type !== 'open')
  if (mode === 'test' || mode === 'mix') {
    // Spread evenly across topics.
    const per = Math.max(1, Math.ceil(m.count / topics.length))
    const picked = topics.flatMap(({ key }) => shuffle(closed.filter((i) => i.topic === key)).slice(0, per))
    return shuffle(picked).slice(0, m.count)
  }
  if (mode === 'opakovani') return shuffle([...closed, ...gen(3)]).slice(0, Math.max(m.count, closed.length))
  return shuffle([...shuffle(closed).slice(0, m.count), ...gen(Math.ceil(m.count / 3))]).slice(0, m.count)
}

/** The questions a student should see again, best first: for `chyby` the open mistakes, for `dnes` everything due. */
export function reviewIds(q: Record<string, QuestionProgress> | undefined, mode: 'chyby' | 'dnes', now = today()): string[] {
  const entries = Object.entries(q ?? {}).filter(([, v]) => (mode === 'chyby' ? isMistake(v) : isDue(v, now)))
  // Mistakes first, then the lower box, then the longest overdue.
  const score = (v: QuestionProgress) => (isMistake(v) ? 1000 : 0) - v.b * 100 + Math.min(99, now - v.d)
  return entries.sort((a, b) => score(b[1]) - score(a[1])).map(([k]) => k)
}

/** Items for a review round from ids (`reviewIds`), with the topics they come from. Ids no longer in the content are skipped. */
export function reviewItems(ids: string[], topics: { key: string; t: Topic }[], count: number): Item[] {
  const by = new Map<string, Item>()
  for (const { key, t } of topics) t.questions.forEach((q, index) => { if (q.type !== 'open') { const id = questionId(key, q); by.set(id, { q, topic: key, index, id }) } })
  return shuffle(ids.flatMap((id) => by.get(id) ?? []).slice(0, count))
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

/** The blank of a fill-in question: `t_gr`, `___`, `„__jet“`. Underscores only, so `c_a` in maths never comes up without options. */
const GAP = /[\p{L}'’]*_+[\p{L}'’]*/u

/** Alternatives the question spells out: „Doplň y/i:“, „i/y/a“, „a / an“, „(lavici / posteli)“, „doplň m, nebo mn“.
 * Only right after a bracket, colon, quote or „doplň …“ and before punctuation or „ a “, so „Je to podstatné jméno, nebo sloveso?“ never offers „jméno“. */
const OPENS = String.raw`(?<=(?:^|[(:„“"”)]\s?|(?:^|[\s(])(?:doplň|napiš|vyber|předponu|koncovku|písmeno|člen)\s))`
const CLOSES = String.raw`(?=$|[?):,.]|\sa\s)`
const W = String.raw`[\p{L}'’]+`
const SLASH = new RegExp(`${OPENS}${W}(?:\\s?/\\s?${W})+${CLOSES}`, 'giu')
const NEBO = new RegExp(`${OPENS}(${W}),? nebo (${W})${CLOSES}`, 'giu')
function listed(question: string): string[][] {
  return [
    ...[...question.matchAll(SLASH)].map((m) => m[0].split('/').map((x) => x.trim())),
    ...[...question.matchAll(NEBO)].map((m) => [m[1], m[2]]),
  ]
}

/** Czech spelling blanks whose alternatives everybody knows, when the question does not list them. */
function known(question: string, answer: string): string[] | null {
  const gap = question.match(GAP)?.[0]
  if (!gap) return null
  const a = answer.toLowerCase()
  if (/l_+$/u.test(gap) && ['i', 'y', 'a'].includes(a)) return ['i', 'y', 'a']
  if (['i', 'y'].includes(a)) return ['i', 'y']
  if (['í', 'ý'].includes(a)) return ['í', 'ý']
  if (/^_/.test(gap) && ['s', 'z', 'vz'].includes(a)) return ['s', 'z', 'vz']
  return null
}

/**
 * A fill-in-the-blank `input` question answered by tapping instead of typing: „Doplň y/i: t_gr“ → [i] [y].
 * The options come from the question (or the well-known Czech pairs for Czech topics); exactly one of them,
 * on its own or written into the blank (`__jet` + s = sjet), has to be an accepted answer. Otherwise null and the question stays typed.
 */
export function gapChoice(q: Extract<Question, { type: 'input' }>, strict = true): { options: string[]; answer: number } | null {
  if (q.widget) return null
  const gap = q.question.match(GAP)?.[0] ?? null
  const fits = (o: string) => checkInput(o, q.answers, strict) || (gap !== null && checkInput(gap.replace(/_+/u, o), q.answers, strict))
  const sets = listed(q.question)
  if (strict) { const k = known(q.question, q.answers[0]); if (k) sets.push(k) }
  for (const options of sets) {
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length || options.length > 4) continue
    const ok = options.flatMap((o, i) => (fits(o) ? [i] : []))
    if (ok.length === 1) return { options, answer: ok[0] }
  }
  return null
}

/** Spelling matters in Czech language and literature topics. */
export const strictFor = (topicKey: string) => /\/(cestina|literatura)\//.test(topicKey)

/** Czech school grade 1–5 from a percentage. */
export const grade = (pct: number) => (pct >= 90 ? 1 : pct >= 75 ? 2 : pct >= 50 ? 3 : pct >= 30 ? 4 : 5)
export const GRADE_WORD = ['', 'výborně', 'chvalitebně', 'dobře', 'dostatečně', 'nedostatečně']

/** Verbal evaluation instead of a grade (approaches without marks, e.g. Waldorf). Same bands as `grade`. */
export const verbal = (pct: number) => (pct >= 90 ? 'Výborně! Látku máš pevně v rukou.' : pct >= 75 ? 'Moc dobře. Pár drobností si ještě projdi.'
  : pct >= 50 ? 'Dobrý základ. Co nešlo, si zopakuj.' : pct >= 30 ? 'Část už umíš. Zbytek si projdi znovu.' : 'Tohle si projdi ještě jednou od začátku. Zvládneš to.')

/** Short text form of the correct answer (for feedback and the oral exam). */
export function answerText(q: Question): string {
  switch (q.type) {
    case 'choice': return q.options[q.answer]
    case 'truefalse': return q.answer ? 'Pravda' : 'Nepravda'
    case 'input': return q.answers[0]
    case 'order': return q.items.join(' → ')
    case 'match': return q.pairs.map(([a, b]) => `${a} – ${b}`).join(', ')
    case 'open': return q.answer
  }
}
