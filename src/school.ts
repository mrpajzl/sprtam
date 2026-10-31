import { useEffect, useState } from 'preact/hooks'
import { hasSubject } from './content'
import { GRADE_NAME, GRADE_SUBJECTS, ODB, SECOND_LANGUAGES } from './content/curriculum'
import type { CoreSubjectId, YearId } from './content/types'
import { yearOf, type Obor } from './obory'

// Moje škola (src/screens/School.tsx): the pupil's year (Progress.g), obor (src/obory.ts), teaching approach
// (src/approach.ts) and second foreign language. The home screen shows the subjects they give.

// ——— The second foreign language: a device setting like the obor (localStorage, kept per profile, never sent) ———

const KEY = 'sprtam-jazyk'
const EVENT = 'sprtam:jazyk'
const isLanguage = (v: string | undefined): v is CoreSubjectId => SECOND_LANGUAGES.includes(v as CoreSubjectId)

export function getLanguage(): CoreSubjectId | undefined {
  try { const v = localStorage.getItem(KEY) ?? undefined; return isLanguage(v) ? v : undefined } catch { return undefined }
}

export function setLanguage(s: CoreSubjectId | undefined) {
  try { s ? localStorage.setItem(KEY, s) : localStorage.removeItem(KEY) } catch { /* private mode */ }
  dispatchEvent(new Event(EVENT))
}

export function useLanguage(): CoreSubjectId | undefined {
  const [v, setV] = useState(getLanguage)
  useEffect(() => {
    const on = () => setV(getLanguage())
    addEventListener(EVENT, on)
    return () => removeEventListener(EVENT, on)
  }, [])
  return v
}

/** Second languages a grade has topics of (the choice is offered only when there are two or more). */
export const languagesOf = (g: YearId) => GRADE_SUBJECTS[g].filter((s) => SECOND_LANGUAGES.includes(s) && hasSubject(g, s))

/**
 * The pupil's subjects with content: those of the year (with a chosen second language only that one), or with an
 * obor its odborné předměty and the general subjects it takes.
 */
export function schoolSubjects(g: YearId, o: Obor | undefined, lang: CoreSubjectId | undefined): { odb: string[]; general: CoreSubjectId[] } {
  const i = o ? yearOf(o, g) : -1
  if (o && i >= 0) return { odb: o.years[i].odb.filter((s) => hasSubject(ODB, s)), general: o.years[i].general.filter((s) => hasSubject(g, s)) }
  const mine = lang && languagesOf(g).includes(lang)
  return { odb: [], general: GRADE_SUBJECTS[g].filter((s) => hasSubject(g, s) && (!mine || !SECOND_LANGUAGES.includes(s) || s === lang)) }
}

/** "8. třída", "2. ročník · Informační technologie" */
export const schoolName = (g: YearId, o: Obor | undefined) => `${GRADE_NAME[g]}${o && yearOf(o, g) >= 0 ? ` · ${o.name}` : ''}`
