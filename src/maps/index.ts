import { records, type Best } from '../progress/records'
import { OTHER, REGIONS, STATES, type Part, type Place } from './places'

// Slepá mapa (/slepa-mapa): find states and regions on a blind map. The maps and their questions live in code
// like the curriculum (src/content/curriculum.ts); the outlines are generated from Natural Earth
// (scripts/maps-generate.ts → src/maps/data/*.json) and load only when a map is opened.

export const MAPS_PATH = '/slepa-mapa'
export const MAPS_INTRO = 'Najdi na mapě kraje Česka, státy Evropy a celého světa a jejich hlavní města. Mapu si nejdřív prohlédni, pak hraj: za každé místo, které najdeš napoprvé, máš celý bod.'

export interface MapData {
  w: number
  h: number
  /** Areas: id, SVG path (empty = too small to draw, shown as a dot), label point, box of the largest part. */
  f: Area[]
}

export interface Area { id: string; d: string; x: number; y: number; b: [number, number, number, number] }

export type Source = 'svet' | 'evropa' | 'kraje'

export interface GameMap {
  id: string
  title: string
  emoji: string
  /** One line under the title in lists. */
  hint: string
  about: string
  source: Source
  /** What the map asks about, in the order of the list on its page. */
  ids: string[]
  /** States or regions, for the words around them. */
  kind: 'stat' | 'kraj'
}

const byName = (a: string, b: string) => place(a)!.name.localeCompare(place(b)!.name, 'cs')
const statesOf = (...parts: Part[]) => Object.keys(STATES).filter((id) => parts.includes(STATES[id].part!)).sort(byName)

export const MAPS: GameMap[] = [
  {
    id: 'kraje', title: 'Kraje Česka', emoji: '🇨🇿', hint: '14 krajů a krajská města', source: 'kraje', kind: 'kraj',
    about: 'Česko má 14 krajů včetně hlavního města Prahy. Najdi každý kraj na mapě a poznej, které město je jeho sídlem.',
    ids: Object.keys(REGIONS).sort(byName),
  },
  {
    id: 'evropa', title: 'Evropa', emoji: '🇪🇺', hint: 'státy a hlavní města', source: 'evropa', kind: 'stat',
    about: 'Všechny evropské státy od Islandu po Rusko a Turecko, i ty nejmenší jako Vatikán nebo Monako. Malé státy jsou na mapě vyznačené tečkou, mapu si můžeš přiblížit.',
    ids: [...statesOf('evropa'), 'TUR'].sort(byName),
  },
  {
    id: 'svet', title: 'Svět', emoji: '🌍', hint: 'všech 195 států', source: 'svet', kind: 'stat',
    about: 'Všechny státy světa: 193 členů OSN, Vatikán a Kosovo. Malé ostrovní státy jsou vyznačené tečkou, mapu si můžeš přiblížit. Jestli je to na začátek moc, vyber si jen jeden světadíl.',
    ids: Object.keys(STATES).sort(byName),
  },
  {
    id: 'afrika', title: 'Afrika', emoji: '🌍', hint: 'státy a hlavní města', source: 'svet', kind: 'stat',
    about: 'Všech 54 afrických států, od Egypta po Jihoafrickou republiku, i s ostrovy v Atlantiku a Indickém oceánu.',
    ids: statesOf('afrika'),
  },
  {
    id: 'asie', title: 'Asie', emoji: '🌏', hint: 'státy a hlavní města', source: 'svet', kind: 'stat',
    about: 'Státy Asie od Turecka a Arabského poloostrova po Japonsko a Indonésii. Rusko najdeš na mapě Evropy.',
    ids: statesOf('asie'),
  },
  {
    id: 'amerika', title: 'Amerika', emoji: '🌎', hint: 'Severní a Jižní Amerika', source: 'svet', kind: 'stat',
    about: 'Státy Severní, Střední a Jižní Ameriky i ostrovní státy v Karibiku.',
    ids: statesOf('amerika'),
  },
  {
    id: 'oceanie', title: 'Austrálie a Oceánie', emoji: '🌏', hint: '14 států', source: 'svet', kind: 'stat',
    about: 'Austrálie, Nový Zéland a ostrovní státy Tichého oceánu. Ty nejmenší jsou vyznačené tečkou.',
    ids: statesOf('oceanie'),
  },
]

/** The maps of whole continents of the world map, listed apart on the home page of the game. */
export const PARTS = ['afrika', 'asie', 'amerika', 'oceanie']

export const mapById = (id?: string) => MAPS.find((m) => m.id === id)

export function place(id: string): Place | undefined {
  return STATES[id] ?? REGIONS[id]
}

/** Name of anything drawn on a map (also territories that are not asked about). */
export const nameOf = (id: string) => place(id)?.name ?? OTHER[id]

export type ModeId = 'najdi' | 'mesta' | 'poznej'

export interface Mode { id: ModeId; title: string; hint: string }

export function modesOf(m: GameMap): Mode[] {
  const state = m.kind === 'stat'
  return [
    { id: 'najdi', title: 'Najdi na mapě', hint: state ? 'ukaž stát podle názvu' : 'ukaž kraj podle názvu' },
    { id: 'mesta', title: state ? 'Hlavní města' : 'Krajská města', hint: state ? 'ukaž stát podle hlavního města' : 'ukaž kraj podle krajského města' },
    { id: 'poznej', title: state ? 'Poznáš stát?' : 'Poznáš kraj?', hint: 'vyber název vyznačeného místa' },
  ]
}

export const isMode = (s?: string): s is ModeId => s === 'najdi' || s === 'mesta' || s === 'poznej'

/** The places a mode can ask about (a capital to ask for, where the mode needs one). */
export const askable = (m: GameMap, mode: ModeId) => (mode === 'mesta' ? m.ids.filter((id) => place(id)?.capital) : m.ids)

/** A quick round; „celá mapa“ asks about every place. */
export const ROUND = 10

// Best results stay in this device only, like the rest of the progress (docs/SOUKROMI.md): the best result (0–100)
// per `<map>/<mode>` (a quick round) and `<map>/<mode>/vse` (the whole map).
const best = records('sprtam:mapy')
export const saveBest = best.save
export const useBest = best.use

export const bestKey = (map: string, mode: ModeId, all: boolean) => `${map}/${mode}${all ? '/vse' : ''}`

/** The best quick round of any mode of a map, 0–100. */
export const bestOf = (b: Best, map: string) => Math.max(0, ...(['najdi', 'mesta', 'poznej'] as const).map((m) => b[bestKey(map, m, false)] ?? 0))
