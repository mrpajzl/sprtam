import { useEffect, useState } from 'preact/hooks'
import { APPROACH_EVENT, approachById, getApproach } from './approach'

// How a Písemka and a Test end (Nastavení → Hodnocení): a mark 1–5, or a short spoken-style sentence instead.
// The default follows the teaching approach the child chose (Waldorf: no marks, content approaches/<id> `grading`).
// A device setting like the theme (localStorage, never sent anywhere), one per profile (src/profiles.ts).
// The child's own choice is kept with the approach it was made under: choosing another school applies its default again.

export type Grading = 'marks' | 'verbal'

export const GRADING_KEY = 'sprtam-hodnoceni'
const EVENT = 'sprtam:grading'

/** What the chosen approach (or the regular school without one) does. */
export const defaultGrading = (approach = getApproach()): Grading => approachById(approach)?.grading ?? 'marks'

export function getGrading(): Grading {
  const approach = getApproach()
  try {
    const v = JSON.parse(localStorage.getItem(GRADING_KEY) ?? 'null') as { a?: string; g?: string } | null
    if (v && (v.a ?? undefined) === approach && (v.g === 'marks' || v.g === 'verbal')) return v.g
  } catch { /* broken: the default */ }
  return defaultGrading(approach)
}

export function setGrading(g: Grading) {
  try {
    const approach = getApproach()
    if (g === defaultGrading(approach)) localStorage.removeItem(GRADING_KEY)
    else localStorage.setItem(GRADING_KEY, JSON.stringify({ a: approach, g }))
  } catch { /* private mode */ }
  dispatchEvent(new Event(EVENT))
}

export function useGrading(): Grading {
  const [v, setV] = useState(getGrading)
  useEffect(() => {
    const on = () => setV(getGrading())
    for (const e of [EVENT, APPROACH_EVENT, 'storage']) addEventListener(e, on)
    return () => { for (const e of [EVENT, APPROACH_EVENT, 'storage']) removeEventListener(e, on) }
  }, [])
  return v
}

/** The hint of a graded round (Písemka, Cvičná písemka): what it ends with. */
export const gradedHint = (g: Grading) => (g === 'verbal' ? 'slovní hodnocení' : 'známka')
