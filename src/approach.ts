import { useEffect, useState } from 'preact/hooks'
import type { ApproachMeta } from './content/manifest'
import { loadFile, onManifest } from './content/remote'
import type { ApproachYearFile, GradeId, YearBlock } from './content/types'

// Teaching approaches (docs/PRISTUPY.md): their descriptions come with the content manifest (needed before
// the first render), the plans of single years are files of the release. The child's choice is a device
// setting like the theme (localStorage, never sent anywhere); the plans themselves are public pages.

export type Approach = ApproachMeta

/** All teaching approaches of the current release (filled before the first render, src/main.tsx). */
export let APPROACHES: Approach[] = []
onManifest((m) => { APPROACHES = m.approaches })

export const approachById = (id: string | undefined) => APPROACHES.find((a) => a.id === id)

export const loadYear = (id: string, g: GradeId): Promise<ApproachYearFile> => loadFile<ApproachYearFile>(`approach/${id}/${g}`)

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
