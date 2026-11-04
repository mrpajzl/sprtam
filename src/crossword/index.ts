import { records } from '../progress/records'
import type { YearId } from '../content/types'

// Matematické křížovky (/matematicke-krizovky): příklady „a ○ b = c“ vodorovně i svisle, které se kříží ve
// společných číslech. Některá čísla chybí a doplňují se z nabídky dlaždic. Úrovně (od sčítání do 10 po záporná
// čísla) jsou v kódu jako sady Periodické tabulky (src/chem/index.ts); každá křížovka se vygeneruje znovu.
//
// Generátor zaručuje, že křížovka jde vyřešit krok za krokem: vždy je nějaký příklad, ve kterém chybí jen jedno
// číslo. Takové řešení je jediné, a tak se dá každé políčko porovnat s ním (i nápověda).

export const CROSSWORD_PATH = '/matematicke-krizovky'
export const CROSSWORD_INTRO = 'Doplň chybějící čísla tak, aby platily všechny příklady – vodorovně i svisle. Příklady se kříží, takže jedno číslo patří do dvou příkladů najednou. Začni tam, kde chybí jen jedno číslo. Vyber si úroveň podle toho, co už umíš.'

export type Op = '+' | '−' | '×' | '÷'

export type LevelId = 'do10' | 'do20' | 'do100' | 'nasobilka' | 'ctyri' | 'do1000' | 'zaporna'

export interface Level {
  id: LevelId
  title: string
  hint: string
  /** For whom, in words („1. třída“). */
  who: string
  /** For which grades it is meant (the level list recommends one by the pupil's grade). */
  g: YearId[]
  /** Operations, repeated = more often. */
  ops: Op[]
  /** Every number of the crossword lies in [min, max]. */
  min: number
  max: number
  /** × and ÷: the smaller factor at most `small`, the bigger at most `big` (by absolute value, never 0 or 1). */
  small: number
  big: number
  /** Number of equations. */
  eqs: number
  /** Share of the numbers that are missing (in effect at most one per equation: each is filled in from one equation). */
  blanks: number
  /** Extra tiles that fit nowhere (harder levels). */
  extra: number
}

export const LEVELS: Level[] = [
  { id: 'do10', who: '1. třída', title: 'Sčítání a odčítání do 10', hint: 'první krůčky', g: ['z1'], ops: ['+', '−'], min: 0, max: 10, small: 0, big: 0, eqs: 3, blanks: 0.34, extra: 0 },
  { id: 'do20', who: '1.–2. třída', title: 'Sčítání a odčítání do 20', hint: 'i přes desítku', g: ['z1', 'z2'], ops: ['+', '−'], min: 0, max: 20, small: 0, big: 0, eqs: 4, blanks: 0.42, extra: 0 },
  { id: 'do100', who: '2.–3. třída', title: 'Sčítání a odčítání do 100', hint: 'dvojciferná čísla', g: ['z2', 'z3'], ops: ['+', '−'], min: 0, max: 100, small: 0, big: 0, eqs: 5, blanks: 0.45, extra: 0 },
  { id: 'nasobilka', who: '3.–4. třída', title: 'Malá násobilka', hint: 'násobení a dělení do 100', g: ['z3', 'z4'], ops: ['×', '×', '÷', '÷', '+', '−'], min: 0, max: 100, small: 10, big: 10, eqs: 5, blanks: 0.5, extra: 1 },
  { id: 'ctyri', who: '4.–5. třída', title: 'Všechny čtyři počty', hint: 'násobilka, sčítání a odčítání do 100 v jedné křížovce', g: ['z4', 'z5'], ops: ['×', '÷', '+', '−'], min: 0, max: 100, small: 10, big: 10, eqs: 7, blanks: 0.55, extra: 2 },
  { id: 'do1000', who: '5.–6. třída', title: 'Počítání do 1000', hint: 'velká čísla, násobení jednociferným číslem', g: ['z5', 'z6'], ops: ['+', '−', '×', '÷'], min: 0, max: 1000, small: 9, big: 120, eqs: 7, blanks: 0.6, extra: 3 },
  { id: 'zaporna', who: 'od 7. třídy', title: 'Záporná čísla', hint: 'celá čísla od −100 do 100', g: ['z7', 'z8', 'z9', 's1', 's2', 's3', 's4'], ops: ['+', '−', '×', '÷'], min: -100, max: 100, small: 10, big: 12, eqs: 8, blanks: 0.6, extra: 3 },
]

export const levelById = (id?: string) => LEVELS.find((x) => x.id === id)

/** The level meant for a grade (the first one listing it). */
export const levelFor = (g?: string) => LEVELS.find((x) => (x.g as string[]).includes(g ?? ''))

export type Dir = 'h' | 'v'

export interface Equation {
  r: number
  c: number
  dir: Dir
  op: Op
  /** a, b, c of „a op b = c“. */
  vals: [number, number, number]
}

/** A cell of the grid: a number (with its key), an operator or „=“. */
export type Cell =
  | { kind: 'num'; r: number; c: number; key: string; value: number; blank: boolean }
  | { kind: 'op'; r: number; c: number; text: string }

export interface Puzzle {
  rows: number
  cols: number
  eqs: Equation[]
  cells: Cell[]
  /** Number cells of each equation (a, b, c). */
  numKeys: [string, string, string][]
  /** The tiles to place: the values of the blank cells and the extra ones, sorted. */
  tiles: number[]
}

export const key = (r: number, c: number) => `${r},${c}`
const step = (d: Dir) => (d === 'h' ? [0, 1] : [1, 0])
const rnd = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** The third value of „a op b = c“ from the other two (position `unknown` 0, 1 or 2), or NaN when it is not whole. */
function third(op: Op, v: (number | undefined)[], unknown: number): number {
  const [a, b, c] = v as number[]
  const div = (x: number, y: number) => (y === 0 || x % y !== 0 ? NaN : x / y)
  switch (op) {
    case '+': return unknown === 2 ? a + b : unknown === 0 ? c - b : c - a
    case '−': return unknown === 2 ? a - b : unknown === 0 ? c + b : a - c
    case '×': return unknown === 2 ? a * b : unknown === 0 ? div(c, b) : div(c, a)
    case '÷': return unknown === 2 ? div(a, b) : unknown === 0 ? c * b : div(a, c)
  }
}

/** Positions of the factors: a × b = c, a ÷ b = c (b and c are the factors of a). */
const factors = (op: Op): [number, number] | null => (op === '×' ? [0, 1] : op === '÷' ? [1, 2] : null)

function fits(op: Op, v: number[], lv: Level): boolean {
  if (v.some((x) => !Number.isInteger(x) || x < lv.min || x > lv.max)) return false
  const f = factors(op)
  if (f) {
    const [x, y] = [Math.abs(v[f[0]]), Math.abs(v[f[1]])].sort((p, q) => p - q)
    return x >= 2 && x <= lv.small && y <= lv.big
  }
  // + and −: no adding or taking away nothing.
  return v[0] !== 0 && v[1] !== 0
}

/** A random number for a free position of the equation. */
function sample(op: Op, pos: number, lv: Level): number {
  const f = factors(op)
  if (f?.includes(pos)) {
    const n = Math.random() < 0.5 ? rnd(2, lv.small) : rnd(2, lv.big)
    return lv.min < 0 && Math.random() < 0.4 ? -n : n
  }
  return rnd(lv.min < 0 ? lv.min : 1, lv.max)
}

/** Values of an equation with operation `op`, one of them maybe given (the crossing), or null when none fit. */
export function solveEq(op: Op, lv: Level, given?: [number, number]): [number, number, number] | null {
  for (let t = 0; t < 60; t++) {
    const v: (number | undefined)[] = [undefined, undefined, undefined]
    if (given) v[given[0]] = given[1]
    const f = factors(op)
    // The free positions: sample one (a factor where it can), compute the last one.
    const free = [0, 1, 2].filter((i) => v[i] === undefined)
    const first = free.length === 3 ? (f ? f[0] : 0) : f ? free.find((i) => f.includes(i)) ?? free[0] : pick(free)
    v[first] = sample(op, first, lv)
    if (free.length === 3) {
      const second = f ? f[1] : 1
      v[second] = sample(op, second, lv)
    }
    const last = [0, 1, 2].find((i) => v[i] === undefined)!
    v[last] = third(op, v, last)
    if (fits(op, v as number[], lv)) return v as [number, number, number]
  }
  return null
}

/** Grid cells of an equation: a, op, b, =, c. */
const eqCells = (e: Pick<Equation, 'r' | 'c' | 'dir'>) => { const [dr, dc] = step(e.dir); return [0, 1, 2, 3, 4].map((i) => [e.r + dr * i, e.c + dc * i] as const) }

const MAX_COLS = 9
const MAX_ROWS = 11

/** One try at a layout: equations placed one by one, each crossing exactly one number of an earlier one. */
function layout(lv: Level): Equation[] | null {
  const occupied = new Map<string, { eq: number[]; num: boolean }>()
  const eqs: Equation[] = []
  const put = (e: Equation) => {
    eqCells(e).forEach(([r, c], i) => {
      const k = key(r, c)
      const o = occupied.get(k) ?? { eq: [], num: i % 2 === 0 }
      o.eq.push(eqs.length)
      occupied.set(k, o)
    })
    eqs.push(e)
  }
  const bounds = () => {
    let r0 = Infinity, r1 = -Infinity, c0 = Infinity, c1 = -Infinity
    for (const k of occupied.keys()) { const [r, c] = k.split(',').map(Number); r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c) }
    return { r0, r1, c0, c1 }
  }
  const op0 = pick(lv.ops)
  const first = solveEq(op0, lv)
  if (!first) return null
  put({ r: 0, c: 0, dir: Math.random() < 0.5 ? 'h' : 'v', op: op0, vals: first })

  let stuck = 0
  while (eqs.length < lv.eqs && stuck < 40) {
    stuck++
    // A number cell of exactly one equation, where a new equation can cross it.
    const cands = shuffle([...occupied.entries()].filter(([, o]) => o.num && o.eq.length === 1))
    if (!cands.length) return null
    const [k, o] = cands[0]
    const [r, c] = k.split(',').map(Number)
    const host = eqs[o.eq[0]]
    const dir: Dir = host.dir === 'h' ? 'v' : 'h'
    const value = host.vals[eqCells(host).findIndex(([rr, cc]) => rr === r && cc === c) / 2]
    const [dr, dc] = step(dir)
    let placed = false
    for (const pos of shuffle([0, 1, 2])) {
      const start = { r: r - dr * pos * 2, c: c - dc * pos * 2, dir }
      const cells = eqCells(start)
      const mine = new Set(cells.map(([rr, cc]) => key(rr, cc)))
      const free = (rr: number, cc: number) => !occupied.has(key(rr, cc))
      const ok = cells.every(([rr, cc], i) => {
        if (i === pos * 2) return true
        if (!free(rr, cc)) return false
        // Nothing of another equation right next to it: every line of the grid reads as one equation.
        return [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => free(rr + a, cc + b) || mine.has(key(rr + a, cc + b)))
      }) && free(start.r - dr, start.c - dc) && free(start.r + dr * 5, start.c + dc * 5)
      if (!ok) continue
      // Still fits a phone.
      const b = bounds()
      const [er, ec] = cells[4]
      if (Math.max(b.c1, ec) - Math.min(b.c0, start.c) + 1 > MAX_COLS || Math.max(b.r1, er) - Math.min(b.r0, start.r) + 1 > MAX_ROWS) continue
      const op = pick(lv.ops)
      const vals = solveEq(op, lv, [pos, value])
      if (!vals) continue
      put({ ...start, op, vals })
      placed = true
      break
    }
    if (placed) stuck = 0
  }
  return eqs.length === lv.eqs ? eqs : null
}

/** Can the blanks be filled one by one, always in an equation with a single missing number? */
export function solvable(numKeys: [string, string, string][], blank: Set<string>): boolean {
  const unknown = new Set(blank)
  for (let changed = true; changed && unknown.size;) {
    changed = false
    for (const ks of numKeys) {
      const missing = ks.filter((k) => unknown.has(k))
      if (missing.length === 1) { unknown.delete(missing[0]); changed = true }
    }
  }
  return unknown.size === 0
}

/** A new crossword of a level. */
export function generate(lv: Level): Puzzle {
  let eqs: Equation[] | null = null
  for (let t = 0; t < 200 && !eqs; t++) eqs = layout(lv)
  // Very unlikely; a smaller crossword is still a crossword.
  if (!eqs) return generate({ ...lv, eqs: Math.max(1, lv.eqs - 1) })

  // Shift so that the grid starts at 0, 0.
  const all = eqs.flatMap(eqCells)
  const r0 = Math.min(...all.map(([r]) => r)), c0 = Math.min(...all.map(([, c]) => c))
  for (const e of eqs) { e.r -= r0; e.c -= c0 }
  const rows = Math.max(...all.map(([r]) => r)) - r0 + 1
  const cols = Math.max(...all.map(([, c]) => c)) - c0 + 1

  const values = new Map<string, number>()
  const ops = new Map<string, string>()
  const numKeys = eqs.map((e) => {
    const cells = eqCells(e)
    cells.forEach(([r, c], i) => { if (i === 1) ops.set(key(r, c), e.op); if (i === 3) ops.set(key(r, c), '=') })
    const ks = [0, 2, 4].map((i) => key(...cells[i])) as [string, string, string]
    ks.forEach((k, i) => values.set(k, e.vals[i]))
    return ks
  })

  // Hide as many numbers as the level wants, keeping the crossword solvable step by step.
  const want = Math.max(1, Math.round(values.size * lv.blanks))
  const blank = new Set<string>()
  for (const k of shuffle([...values.keys()])) {
    if (blank.size >= want) break
    blank.add(k)
    if (!solvable(numKeys, blank)) blank.delete(k)
  }

  const cells: Cell[] = []
  for (const [k, value] of values) { const [r, c] = k.split(',').map(Number); cells.push({ kind: 'num', r, c, key: k, value, blank: blank.has(k) }) }
  for (const [k, text] of ops) { const [r, c] = k.split(',').map(Number); cells.push({ kind: 'op', r, c, text }) }
  cells.sort((a, b) => a.r - b.r || a.c - b.c)

  // Extra tiles: close to the real ones, so they have to be thought about, but not a value of a blank.
  const real = [...blank].map((k) => values.get(k)!)
  const extra: number[] = []
  for (let t = 0; extra.length < lv.extra && t < 50; t++) {
    const x = pick(real) + pick([-10, -2, -1, 1, 2, 10])
    if (x >= lv.min && x <= lv.max && !real.includes(x) && !extra.includes(x)) extra.push(x)
  }
  return { rows, cols, eqs, cells, numKeys, tiles: [...real, ...extra].sort((a, b) => a - b) }
}

/** „−5“ with a real minus sign. */
export const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

// Best results stay in this device only, like the rest of the progress (docs/SOUKROMI.md): the best result (0–100) per level.
const best = records('sprtam:krizovky')
export const saveBest = best.save
export const useBest = best.use
