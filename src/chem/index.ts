import { records } from '../progress/records'
import { BY_SYMBOL, ELEMENTS, type Element } from './elements'

// Periodická tabulka (/periodicka-tabulka): a game for learning the elements, their symbols and where they sit in
// the table. Sets and modes live in code like the maps of Slepá mapa (src/maps/index.ts); the elements are in
// src/chem/elements.ts.

export const ELEMENTS_PATH = '/periodicka-tabulka'
export const ELEMENTS_INTRO = 'Nauč se chemické prvky, jejich značky a místo v periodické tabulce. Tabulku si nejdřív prohlédni, klepnutím na prvek uvidíš, co o něm potřebuješ vědět. Pak hraj: za každou odpověď napoprvé máš celý bod.'

export type SetId = 'zaklad' | 'zs' | 'vse'

export interface ElementSet {
  id: SetId
  title: string
  /** Short name for the chips. */
  short: string
  hint: string
  /** Elements asked about, by Z. */
  zs: number[]
  /** The table shows only the first 20 elements in 8 columns (fits a phone without scrolling). */
  compact: boolean
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const bySymbols = (s: string) => s.split(' ').map((x) => BY_SYMBOL.get(x)!.z)

export const SETS: ElementSet[] = [
  { id: 'zaklad', title: 'Prvních 20 prvků', short: '20 prvků', hint: 'od vodíku po vápník', zs: range(1, 20), compact: true },
  {
    id: 'zs', title: 'Prvky ze základní školy', short: 'ze ZŠ', hint: '41 prvků, které by měl znát každý', compact: false,
    // The first 20 and the elements met at primary school: metals of everyday life, the other halogens and noble gases, uranium and radium.
    zs: [...range(1, 20), ...bySymbols('Cr Mn Fe Co Ni Cu Zn Br Kr Ag Sn I Xe Ba W Pt Au Hg Pb Ra U')].sort((a, b) => a - b),
  },
  { id: 'vse', title: 'Všech 118 prvků', short: 'všech 118', hint: 'celá tabulka', zs: range(1, 118), compact: false },
]

export const setById = (id?: string) => SETS.find((x) => x.id === id)

/** The elements the table of a set shows (a compact set only its own, the others the whole table). */
export const shownOf = (set: ElementSet) => (set.compact ? ELEMENTS.filter((e) => e.z <= 20) : ELEMENTS)

export type ModeId = 'znacky' | 'nazvy' | 'najdi' | 'poznej' | 'druh'

export interface Mode { id: ModeId; title: string; hint: string }

export const MODES: Mode[] = [
  { id: 'znacky', title: 'Značky', hint: 'vyber značku prvku podle názvu' },
  { id: 'nazvy', title: 'Názvy', hint: 'vyber název prvku podle značky' },
  { id: 'najdi', title: 'Najdi v tabulce', hint: 'ukaž prvek ve slepé tabulce' },
  { id: 'poznej', title: 'Poznáš prvek?', hint: 'pojmenuj vyznačený prvek' },
  { id: 'druh', title: 'Kov, nebo nekov?', hint: 'roztřiď kovy, polokovy a nekovy' },
]

export const isMode = (s?: string): s is ModeId => MODES.some((m) => m.id === s)

export type Kind = 'kov' | 'polokov' | 'nekov'
export const KINDS: Kind[] = ['kov', 'polokov', 'nekov']

/** Metal, metalloid or non-metal (as taught at school: the noble gases and halogens are non-metals). */
export function kindOf(e: Element): Kind {
  if (e.cat === 'metalloid') return 'polokov'
  return e.cat === 'nonmetal' || e.cat === 'halogen' || e.cat === 'noble' ? 'nekov' : 'kov'
}

/**
 * The elements a mode can ask about. „Kov, nebo nekov?“ leaves out polonium and astatine (classed differently by
 * different books) and the superheavy elements from rutherfordium on (only a few atoms ever made, properties unknown).
 */
export const askable = (set: ElementSet, mode: ModeId) => (mode === 'druh' ? set.zs.filter((z) => z !== 84 && z !== 85 && z < 104) : set.zs)

/** A quick round; „všechny“ asks about every element of the set. */
export const ROUND = 10

const el = (z: number) => ELEMENTS[z - 1]
/** Distance of two cells of the table (the f-block rows count as they are drawn, under the table). */
export const cellDistance = (a: Element, b: Element) => Math.hypot(a.row - b.row, a.col - b.col)
const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Three wrong options for a question about `z`, picked from `pool` so that they are easy to mix up: symbols with the
 * same first letter (Na, N, Ne), names that sound alike (sodík → S), neighbours in the table; with a bit of chance,
 * so a round is not the same every time.
 */
export function distractors(z: number, pool: number[], mode: ModeId): number[] {
  const t = el(z)
  const near = mode === 'poznej'
  const scored = pool.filter((x) => x !== z).map((x) => {
    const e = el(x)
    let s = Math.random() * 1.5
    if (near) s -= cellDistance(t, e) * 2
    else {
      if (e.symbol[0] === t.symbol[0]) s += 3
      if (fold(e.name)[0] === fold(t.name)[0]) s += 2
      if (e.symbol[0].toLowerCase() === fold(t.name)[0]) s += 2
      if (cellDistance(t, e) < 2) s += 1
    }
    return { x, s }
  }).sort((a, b) => b.s - a.s)
  return scored.slice(0, 3).map((x) => x.x)
}

// Best results stay in this device only, like the rest of the progress (docs/SOUKROMI.md): the best result (0–100)
// per `<set>/<mode>` (a quick round) and `<set>/<mode>/vse` (every element of the set).
const best = records('sprtam:prvky')
export const saveBest = best.save
export const useBest = best.use

export const bestKey = (set: SetId, mode: ModeId, all: boolean) => `${set}/${mode}${all ? '/vse' : ''}`
