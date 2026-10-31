import { useEffect, useState } from 'preact/hooks'
import type { CoreSubjectId, YearId } from './content/types'

// Obory odborných škol (docs/OBORY.md). An obor is a plan, not content: for each year it names the general
// subjects (taught from the gymnázium topics of the same year, s1–s4) and the odborné předměty (topics/odb/<id>,
// content shared by every obor that uses them). The plan lives in code like the curriculum (curriculum.ts) and
// the entrance exam (exam.ts); the předměty and their topics are content and go through moderation. A předmět
// the plan names but the content does not have yet shows as "připravujeme" – it never blocks publishing.

export interface OborYear {
  /** Odborné předměty of the year (ids of topics/odb/<id>), in the order they are shown. */
  odb: string[]
  /** General subjects of the year, as the gymnázium teaches them in the same year. */
  general: CoreSubjectId[]
}

export interface Obor {
  /** In the address (/obor/<id>); never changes. */
  id: string
  /** Kód oboru vzdělání (RVP SOV), e.g. 18-20-M/01. */
  code: string
  name: string
  /** M = maturitní obor, L = maturitní obor s odborným výcvikem, H = s výučním listem. */
  kind: 'M' | 'L' | 'H'
  /** What the obor is about (one or two sentences, inline markup). */
  about: string
  /** 1. ročník first. */
  years: OborYear[]
}

const KIND_NAME: Record<Obor['kind'], string> = { M: 'maturitní obor', L: 'maturitní obor s odborným výcvikem', H: 'obor s výučním listem' }
export const kindName = (o: Obor) => KIND_NAME[o.kind]

const BASE: CoreSubjectId[] = ['cestina', 'literatura', 'anglictina', 'matematika']

export const OBORY: Obor[] = [
  {
    id: 'informacni-technologie',
    code: '18-20-M/01',
    name: 'Informační technologie',
    kind: 'M',
    about: 'Programování, počítačové sítě, hardware, operační systémy, databáze a bezpečnost. Absolventi pracují jako programátoři, správci sítí a systémů nebo technici podpory.',
    years: [
      { odb: ['hardware', 'operacni-systemy', 'programovani', 'web'], general: [...BASE, 'dejepis', 'fyzika', 'zsv'] },
      { odb: ['programovani', 'web', 'operacni-systemy', 'site', 'elektronika'], general: [...BASE, 'dejepis', 'fyzika', 'zsv'] },
      { odb: ['programovani', 'site', 'databaze', 'kyberbezpecnost', 'ekonomika'], general: [...BASE, 'zsv'] },
      { odb: ['databaze', 'kyberbezpecnost', 'ekonomika'], general: [...BASE, 'zsv'] },
    ],
  },
  {
    id: 'strojirenstvi',
    code: '23-41-M/01',
    name: 'Strojírenství',
    kind: 'M',
    about: 'Technické kreslení, materiály, mechanika, části strojů, výrobní technologie a CNC. Absolventi pracují jako konstruktéři, technologové, programátoři CNC nebo mistři ve výrobě.',
    years: [
      { odb: ['technicke-kresleni', 'materialy', 'mechanika'], general: [...BASE, 'dejepis', 'fyzika', 'chemie', 'zsv'] },
      { odb: ['technicke-kresleni', 'technologie', 'mechanika', 'stroje'], general: [...BASE, 'dejepis', 'fyzika', 'zsv'] },
      { odb: ['technologie', 'stroje', 'mechanika', 'elektrotechnika', 'cnc', 'automatizace'], general: [...BASE, 'zsv'] },
      { odb: ['cnc', 'automatizace', 'ekonomika'], general: [...BASE, 'zsv'] },
    ],
  },
  {
    id: 'mechatronik',
    code: '23-45-L/01',
    name: 'Mechatronik',
    kind: 'L',
    about: 'Mechanik seřizovač se zaměřením na mechatroniku: spojuje strojírenství, elektrotechniku, elektroniku a automatizaci. Absolventi seřizují a programují stroje, linky a roboty.',
    years: [
      { odb: ['technicke-kresleni', 'materialy', 'elektrotechnika'], general: [...BASE, 'dejepis', 'fyzika', 'chemie', 'zsv'] },
      { odb: ['technicke-kresleni', 'technologie', 'elektrotechnika', 'elektronika', 'mechanika'], general: [...BASE, 'dejepis', 'fyzika', 'zsv'] },
      { odb: ['elektronika', 'stroje', 'mechanika', 'automatizace', 'cnc'], general: [...BASE, 'zsv'] },
      { odb: ['automatizace', 'cnc', 'ekonomika'], general: [...BASE, 'zsv'] },
    ],
  },
  {
    id: 'kosmeticke-sluzby',
    code: '69-41-L/01',
    name: 'Kosmetické služby',
    kind: 'L',
    about: 'Kosmetička: péče o pleť, zdravověda a dermatologie, kosmetické přípravky, líčení, manikúra a pedikúra i práce s klientem. Absolventi pracují v salonech nebo si otevřou vlastní.',
    years: [
      { odb: ['zdravoveda', 'kosmetika', 'kosmeticke-pripravky', 'komunikace'], general: [...BASE, 'dejepis', 'biologie', 'chemie', 'zsv'] },
      { odb: ['zdravoveda', 'kosmetika', 'kosmeticke-pripravky', 'manikura'], general: [...BASE, 'dejepis', 'biologie', 'chemie', 'zsv'] },
      { odb: ['kosmetika', 'vizaz', 'komunikace', 'ekonomika'], general: [...BASE, 'zsv'] },
      { odb: ['kosmetika', 'vizaz', 'ekonomika'], general: [...BASE, 'zsv'] },
    ],
  },
  {
    id: 'starozitnik',
    code: '82-48-L/01',
    name: 'Starožitník',
    kind: 'L',
    about: 'Dějiny umění a slohů, nábytek, sklo, porcelán, kovy, šperky, obrazy a obchod se starožitnostmi: jak předmět poznat, zařadit, ocenit a jak o něj pečovat.',
    years: [
      { odb: ['dejiny-umeni', 'nabytek', 'sklo-porcelan'], general: [...BASE, 'dejepis', 'chemie', 'zsv'] },
      { odb: ['dejiny-umeni', 'sklo-porcelan', 'kovy-sperky', 'obrazy-grafika'], general: [...BASE, 'dejepis', 'zsv'] },
      { odb: ['dejiny-umeni', 'nabytek', 'kovy-sperky', 'starozitnictvi', 'ekonomika'], general: [...BASE, 'dejepis', 'zsv'] },
      { odb: ['starozitnictvi', 'obrazy-grafika', 'komunikace', 'ekonomika'], general: [...BASE, 'dejepis', 'zsv'] },
    ],
  },
]

export const OBOR_PATH = '/obor'

export const oborById = (id: string | undefined) => OBORY.find((o) => o.id === id)

/** The gymnázium grade whose general subjects a year of an obor uses: 1. ročník → s1. */
export const yearGrade = (i: number) => `s${i + 1}` as YearId

/** Index of the year of an obor a grade stands for (s1 → 0), or -1. */
export const yearOf = (o: Obor, g: string) => (/^s[1-4]$/.test(g) && Number(g[1]) <= o.years.length ? Number(g[1]) - 1 : -1)

/** Every odborný předmět some obor uses. */
export const oborSubjects = () => [...new Set(OBORY.flatMap((o) => o.years.flatMap((y) => y.odb)))]

/**
 * Obory with at least one of their odborné předměty in the content (`has`): only those are offered. A new obor
 * appears once reviewers approve its first topics; until then its plan is in code but nowhere in the app.
 */
export const readyObory = (has: (s: string) => boolean) => OBORY.filter((o) => o.years.some((y) => y.odb.some(has)))

/** Obory that teach an odborný předmět. */
export const oboryOf = (s: string) => OBORY.filter((o) => o.years.some((y) => y.odb.includes(s)))

// ——— The pupil's choice: a device setting like the theme (localStorage, never sent anywhere) ———

const KEY = 'sprtam-obor'
const EVENT = 'sprtam:obor'

export function getObor(): string | undefined {
  try { const v = localStorage.getItem(KEY) ?? undefined; return oborById(v) ? v : undefined } catch { return undefined }
}

export function setObor(id: string | undefined) {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY) } catch { /* private mode */ }
  dispatchEvent(new Event(EVENT))
}

export function useObor(): Obor | undefined {
  const [v, setV] = useState(getObor)
  useEffect(() => {
    const on = () => setV(getObor())
    addEventListener(EVENT, on)
    addEventListener('storage', on)
    return () => { removeEventListener(EVENT, on); removeEventListener('storage', on) }
  }, [])
  return oborById(v)
}
