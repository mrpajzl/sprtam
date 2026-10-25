import { useEffect, useState } from 'preact/hooks'
import type { ApproachFile, ApproachYearFile, GradeId, YearBlock } from './content/types'

// Teaching approaches (content/approaches/<id>/, docs/PRISTUPY.md). The child's choice is a device
// setting like the theme (localStorage, never sent anywhere); the plans themselves are public pages.

export interface Approach extends ApproachFile { id: string; grades: GradeId[] }

const meta = import.meta.glob<ApproachFile>('/content/approaches/*/approach.json', { eager: true, import: 'default' })
const years = import.meta.glob<{ default: ApproachYearFile }>(['/content/approaches/*/*.json', '!**/approach.json'])
const ORDER: GradeId[] = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8', 'z9', 's1', 's2', 's3', 's4']

export const APPROACHES: Approach[] = Object.entries(meta).map(([path, a]) => {
  const id = path.split('/')[3]
  const grades = Object.keys(years).filter((y) => y.split('/')[3] === id).map((y) => y.split('/')[4].replace('.json', '') as GradeId)
  return { ...a, id, grades: grades.sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y)) }
})
export const approachById = (id: string | undefined) => APPROACHES.find((a) => a.id === id)

export const loadYear = (id: string, g: GradeId): Promise<ApproachYearFile> => {
  const f = years[`/content/approaches/${id}/${g}.json`]
  return f ? f().then((m) => m.default) : Promise.reject(new Error('missing'))
}

/** An epoch or an ongoing subject of the year, by id. */
export const findBlock = (y: ApproachYearFile, id: string): YearBlock | undefined => [...y.epochs, ...(y.ongoing ?? [])].find((b) => b.id === id)

// ——— The child's choice ———

const KEY = 'sprtam-approach'
const EVENT = 'sprtam:approach'

export function getApproach(): string | undefined {
  try { const v = localStorage.getItem(KEY) ?? undefined; return approachById(v) ? v : undefined } catch { return undefined }
}

export function setApproach(id: string | undefined) {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY) } catch { /* private mode */ }
  dispatchEvent(new Event(EVENT))
}

export function useApproach(): string | undefined {
  const [v, setV] = useState(getApproach)
  useEffect(() => {
    const on = () => setV(getApproach())
    addEventListener(EVENT, on)
    addEventListener('storage', on)
    return () => { removeEventListener(EVENT, on); removeEventListener('storage', on) }
  }, [])
  return v
}

/** Is a topic visible in the regular lists for this choice? Approach-only topics show only in their plan. */
export const listed = (t: { approach?: string }) => !t.approach
