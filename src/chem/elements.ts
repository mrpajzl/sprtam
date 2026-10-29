// The periodic table of all 118 elements, shared by the widgets periodic and chem-equation and the game
// Periodická tabulka (src/chem/index.ts). Czech names follow the current Czech nomenclature
// (IUPAC, ČSN): tennessin, oganesson… Relative atomic masses: IUPAC standard values, rounded;
// for elements without a stable isotope the mass number of the longest-lived isotope in brackets.

/** „Z symbol name mass“, Z = position + 1. Mass in brackets = no stable isotope. */
const RAW = `H vodík 1.008|He helium 4.0026|Li lithium 6.94|Be beryllium 9.0122|B bor 10.81|C uhlík 12.011|N dusík 14.007|O kyslík 15.999|F fluor 18.998|Ne neon 20.180|
Na sodík 22.990|Mg hořčík 24.305|Al hliník 26.982|Si křemík 28.085|P fosfor 30.974|S síra 32.06|Cl chlor 35.45|Ar argon 39.948|
K draslík 39.098|Ca vápník 40.078|Sc skandium 44.956|Ti titan 47.867|V vanad 50.942|Cr chrom 51.996|Mn mangan 54.938|Fe železo 55.845|Co kobalt 58.933|Ni nikl 58.693|Cu měď 63.546|Zn zinek 65.38|Ga gallium 69.723|Ge germanium 72.630|As arsen 74.922|Se selen 78.971|Br brom 79.904|Kr krypton 83.798|
Rb rubidium 85.468|Sr stroncium 87.62|Y yttrium 88.906|Zr zirkonium 91.224|Nb niob 92.906|Mo molybden 95.95|Tc technecium [98]|Ru ruthenium 101.07|Rh rhodium 102.91|Pd palladium 106.42|Ag stříbro 107.87|Cd kadmium 112.41|In indium 114.82|Sn cín 118.71|Sb antimon 121.76|Te tellur 127.60|I jod 126.90|Xe xenon 131.29|
Cs cesium 132.91|Ba baryum 137.33|La lanthan 138.91|Ce cer 140.12|Pr praseodym 140.91|Nd neodym 144.24|Pm promethium [145]|Sm samarium 150.36|Eu europium 151.96|Gd gadolinium 157.25|Tb terbium 158.93|Dy dysprosium 162.50|Ho holmium 164.93|Er erbium 167.26|Tm thulium 168.93|Yb ytterbium 173.05|Lu lutecium 174.97|Hf hafnium 178.49|Ta tantal 180.95|W wolfram 183.84|Re rhenium 186.21|Os osmium 190.23|Ir iridium 192.22|Pt platina 195.08|Au zlato 196.97|Hg rtuť 200.59|Tl thallium 204.38|Pb olovo 207.2|Bi bismut 208.98|Po polonium [209]|At astat [210]|Rn radon [222]|
Fr francium [223]|Ra radium [226]|Ac aktinium [227]|Th thorium 232.04|Pa protaktinium 231.04|U uran 238.03|Np neptunium [237]|Pu plutonium [244]|Am americium [243]|Cm curium [247]|Bk berkelium [247]|Cf kalifornium [251]|Es einsteinium [252]|Fm fermium [257]|Md mendelevium [258]|No nobelium [259]|Lr lawrencium [262]|Rf rutherfordium [267]|Db dubnium [268]|Sg seaborgium [269]|Bh bohrium [270]|Hs hassium [269]|Mt meitnerium [278]|Ds darmstadtium [281]|Rg roentgenium [282]|Cn kopernicium [285]|Nh nihonium [286]|Fl flerovium [289]|Mc moscovium [290]|Lv livermorium [293]|Ts tennessin [294]|Og oganesson [294]`

export const CATEGORIES = {
  alkali: 'alkalické kovy',
  earth: 'kovy alkalických zemin',
  transition: 'přechodné kovy',
  lanthanoid: 'lanthanoidy',
  actinoid: 'aktinoidy',
  metal: 'ostatní kovy',
  metalloid: 'polokovy',
  nonmetal: 'nekovy',
  halogen: 'halogeny',
  noble: 'vzácné plyny',
} as const
export type Cat = keyof typeof CATEGORIES
export const CAT_KEYS = Object.keys(CATEGORIES) as Cat[]

const SETS: [Cat, number[]][] = [
  ['alkali', [3, 11, 19, 37, 55, 87]],
  ['earth', [4, 12, 20, 38, 56, 88]],
  ['metalloid', [5, 14, 32, 33, 51, 52]],
  ['nonmetal', [1, 6, 7, 8, 15, 16, 34]],
  ['halogen', [9, 17, 35, 53, 85, 117]],
  ['noble', [2, 10, 18, 36, 54, 86, 118]],
  ['metal', [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116]],
]
const catOf = (z: number): Cat => {
  if (z >= 57 && z <= 71) return 'lanthanoid'
  if (z >= 89 && z <= 103) return 'actinoid'
  return SETS.find(([, zs]) => zs.includes(z))?.[0] ?? 'transition'
}

const PERIOD_END = [2, 10, 18, 36, 54, 86, 118]

export interface Element {
  z: number; symbol: string; name: string
  /** Relative atomic mass; `stable` = false → mass number of the longest-lived isotope. */
  mass: number; stable: boolean
  period: number
  /** 1–18; null for the f-block (Ce–Lu, Th–Lr), which sits in the extra rows. */
  group: number | null
  /** Position in the table grid: row 1–7 (8–9 = lanthanoids/actinoids), column 1–18. */
  row: number; col: number
  cat: Cat
}

export const ELEMENTS: Element[] = RAW.replace(/\n/g, '').split('|').map((e, i) => {
  const [symbol, name, m] = e.split(' ')
  const z = i + 1
  const period = PERIOD_END.findIndex((end) => z <= end) + 1
  const start = period === 1 ? 1 : PERIOD_END[period - 2] + 1
  const k = z - start
  let group: number | null, row = period, col: number
  if (period === 1) group = z === 1 ? 1 : 18
  else if (period <= 3) group = k < 2 ? k + 1 : k + 11
  else if (period <= 5) group = k + 1
  else if (k < 2) group = k + 1
  else if (k <= 16) group = k === 2 ? 3 : null // La / Ac in group 3, the rest of the f-block without a group
  else group = k - 13
  if (period >= 6 && k >= 2 && k <= 16) { row = period + 2; col = k + 1 } else col = group!
  return { z, symbol, name, mass: Number(m.replace(/[[\]]/g, '')), stable: !m.startsWith('['), period, group, row, col, cat: catOf(z) }
})
export const BY_SYMBOL = new Map(ELEMENTS.map((e) => [e.symbol, e]))

const ROMAN = ['', 'I.A', 'II.A', 'III.B', 'IV.B', 'V.B', 'VI.B', 'VII.B', 'VIII.B', 'VIII.B', 'VIII.B', 'I.B', 'II.B', 'III.A', 'IV.A', 'V.A', 'VI.A', 'VII.A', 'VIII.A']
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')

/** Electron configuration for Z ≤ 36 (with the exceptions Cr and Cu). */
export function config(z: number): { shells: number[]; text: string } | null {
  if (z > 36) return null
  const order: [string, number, number][] = [['1s', 1, 2], ['2s', 2, 2], ['2p', 2, 6], ['3s', 3, 2], ['3p', 3, 6], ['4s', 4, 2], ['3d', 3, 10], ['4p', 4, 6]]
  let left = z
  const fill = order.map(([n, shell, cap]) => { const k = Math.min(cap, left); left -= k; return [n, shell, k] as [string, number, number] }).filter((x) => x[2] > 0)
  if (z === 24 || z === 29) { // Cr 4s¹ 3d⁵, Cu 4s¹ 3d¹⁰: a half-full / full d subshell is more stable
    fill.find((x) => x[0] === '4s')![2] = 1
    fill.find((x) => x[0] === '3d')![2] += 1
  }
  const shells: number[] = []
  fill.forEach(([, shell, k]) => { shells[shell - 1] = (shells[shell - 1] ?? 0) + k })
  return { shells, text: fill.map(([n, , k]) => `${n}${sup(k)}`).join(' ') }
}

export const SHELL = ['K', 'L', 'M', 'N']
export const valence = (e: Element) => (e.z === 2 ? 2 : e.group === null ? null : e.group <= 2 ? e.group : e.group >= 13 ? e.group - 10 : null)
const GASES = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86])
export const state = (z: number) => (z >= 100 ? 'nezjištěné – vzniklo jen pár atomů' : GASES.has(z) ? 'plyn' : z === 35 || z === 80 ? 'kapalina' : 'pevná látka')
/** „1,01“; in brackets for elements without a stable isotope. */
export const massText = (e: Element) => (e.stable ? e.mass.toFixed(2).replace('.', ',') : `[${e.mass}]`)
export const groupText = (e: Element) => (e.group === null ? (e.cat === 'lanthanoid' ? 'lanthanoidy (f-prvky)' : 'aktinoidy (f-prvky)') : `${e.group}. (${ROMAN[e.group]})`)
