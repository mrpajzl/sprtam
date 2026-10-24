import type { GradeId, SubjectId } from './types'

export interface Stage {
  id: 'zs1' | 'zs2' | 'ss'
  name: string
  grades: GradeId[]
}

export const STAGES: Stage[] = [
  { id: 'zs1', name: '1. stupeň', grades: ['z1', 'z2', 'z3', 'z4', 'z5'] },
  { id: 'zs2', name: '2. stupeň', grades: ['z6', 'z7', 'z8', 'z9'] },
  { id: 'ss', name: 'Střední škola', grades: ['s1', 's2', 's3', 's4'] },
]

export const GRADE_NAME: Record<GradeId, string> = {
  z1: '1. třída', z2: '2. třída', z3: '3. třída', z4: '4. třída', z5: '5. třída',
  z6: '6. třída', z7: '7. třída', z8: '8. třída', z9: '9. třída',
  s1: '1. ročník', s2: '2. ročník', s3: '3. ročník', s4: '4. ročník',
}

export const GRADE_SHORT: Record<GradeId, string> = {
  z1: '1.', z2: '2.', z3: '3.', z4: '4.', z5: '5.', z6: '6.', z7: '7.', z8: '8.', z9: '9.',
  s1: '1.', s2: '2.', s3: '3.', s4: '4.',
}

/** Key colours (see --k-* in styles.css). */
export type KeyColor = 'orange' | 'blue' | 'yellow' | 'green' | 'lime' | 'teal' | 'purple' | 'pink' | 'red' | 'gray' | 'ink'

export interface SubjectMeta {
  name: string
  /** Key colour; subjects in one grade never share one. */
  c: KeyColor
}

export const SUBJECTS: Record<SubjectId, SubjectMeta> = {
  cestina: { name: 'Čeština', c: 'red' },
  literatura: { name: 'Literatura', c: 'ink' },
  matematika: { name: 'Matematika', c: 'blue' },
  anglictina: { name: 'Angličtina', c: 'purple' },
  prvouka: { name: 'Prvouka', c: 'green' },
  prirodoveda: { name: 'Přírodověda', c: 'green' },
  vlastiveda: { name: 'Vlastivěda', c: 'yellow' },
  dejepis: { name: 'Dějepis', c: 'yellow' },
  zemepis: { name: 'Zeměpis', c: 'teal' },
  prirodopis: { name: 'Přírodopis', c: 'lime' },
  biologie: { name: 'Biologie', c: 'lime' },
  fyzika: { name: 'Fyzika', c: 'orange' },
  chemie: { name: 'Chemie', c: 'pink' },
  obcanska: { name: 'Občanská výchova', c: 'gray' },
  zsv: { name: 'Základy společenských věd', c: 'gray' },
  informatika: { name: 'Informatika', c: 'teal' },
}

/** Which subjects each grade has (follows RVP ZV and RVP G). */
export const GRADE_SUBJECTS: Record<GradeId, SubjectId[]> = {
  z1: ['cestina', 'matematika', 'prvouka'],
  z2: ['cestina', 'matematika', 'prvouka'],
  z3: ['cestina', 'matematika', 'anglictina', 'prvouka'],
  z4: ['cestina', 'matematika', 'anglictina', 'prirodoveda', 'vlastiveda'],
  z5: ['cestina', 'matematika', 'anglictina', 'prirodoveda', 'vlastiveda'],
  z6: ['cestina', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'prirodopis', 'fyzika', 'obcanska'],
  z7: ['cestina', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'prirodopis', 'fyzika', 'obcanska'],
  z8: ['cestina', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'prirodopis', 'fyzika', 'chemie', 'obcanska'],
  z9: ['cestina', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'prirodopis', 'fyzika', 'chemie', 'obcanska'],
  s1: ['cestina', 'literatura', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'biologie', 'fyzika', 'chemie', 'zsv'],
  s2: ['cestina', 'literatura', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'biologie', 'fyzika', 'chemie', 'zsv'],
  s3: ['cestina', 'literatura', 'matematika', 'anglictina', 'dejepis', 'zemepis', 'biologie', 'fyzika', 'chemie', 'zsv'],
  s4: ['cestina', 'literatura', 'matematika', 'anglictina', 'dejepis', 'zsv'],
}

export const ALL_GRADES = STAGES.flatMap((s) => s.grades)

export function stageOf(g: GradeId): Stage {
  return STAGES.find((s) => s.grades.includes(g))!
}
