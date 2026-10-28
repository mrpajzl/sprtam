import type { CoreSubjectId, GradeId, SubjectId, YearId } from './types'

export interface Stage {
  id: 'zs1' | 'zs2' | 'ss'
  name: string
  grades: YearId[]
}

export const STAGES: Stage[] = [
  { id: 'zs1', name: '1. stupeň', grades: ['z1', 'z2', 'z3', 'z4', 'z5'] },
  { id: 'zs2', name: '2. stupeň', grades: ['z6', 'z7', 'z8', 'z9'] },
  { id: 'ss', name: 'Střední škola', grades: ['s1', 's2', 's3', 's4'] },
]

/** Odborné předměty: topics of vocational schools that belong to no single grade (obory pick them per year, src/obory.ts). */
export const ODB: Extract<GradeId, 'odb'> = 'odb'

export const GRADE_NAME: Record<GradeId, string> = {
  z1: '1. třída', z2: '2. třída', z3: '3. třída', z4: '4. třída', z5: '5. třída',
  z6: '6. třída', z7: '7. třída', z8: '8. třída', z9: '9. třída',
  s1: '1. ročník', s2: '2. ročník', s3: '3. ročník', s4: '4. ročník',
  odb: 'Odborné předměty',
}

export const GRADE_SHORT: Record<GradeId, string> = {
  z1: '1.', z2: '2.', z3: '3.', z4: '4.', z5: '5.', z6: '6.', z7: '7.', z8: '8.', z9: '9.',
  s1: '1.', s2: '2.', s3: '3.', s4: '4.',
  odb: 'odb.',
}

/** Key colours (see --k-* in styles.css). */
export const KEY_COLORS = ['orange', 'blue', 'yellow', 'green', 'lime', 'teal', 'purple', 'pink', 'red', 'gray', 'ink'] as const
export type KeyColor = (typeof KEY_COLORS)[number]

export interface SubjectMeta {
  name: string
  /** Key colour; subjects in one grade never share one. */
  c: KeyColor
  /** Odborné předměty have an emoji instead of a drawn glyph (src/ui/glyphs.tsx). */
  emoji?: string
}

export const SUBJECTS: Record<CoreSubjectId, SubjectMeta> = {
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
export const GRADE_SUBJECTS: Record<YearId, CoreSubjectId[]> = {
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
/** Every place topics can live: the grades and the odborné předměty. */
export const GRADES: GradeId[] = [...ALL_GRADES, ODB]

export const isGrade = (g: unknown): g is GradeId => (GRADES as unknown[]).includes(g)
export const isCoreSubject = (s: unknown): s is CoreSubjectId => typeof s === 'string' && Object.hasOwn(SUBJECTS, s)

export function stageOf(g: YearId): Stage {
  return STAGES.find((s) => s.grades.includes(g))!
}

// ——— Odborné předměty ———
// They are content, not code: each is topics/odb/<id>/_subject with its name, emoji and colour, and every release
// carries their list (Manifest.vocational). Whoever knows the current release (the app, the server, the content
// service) hands it over with setVocational; until then only the core subjects are known.

export type VocationalMeta = Required<SubjectMeta>
let vocational: Record<string, VocationalMeta> = {}

/** A valid entry of Manifest.vocational (it comes from the network: everything that ends up in pages and URLs is checked). */
export const isVocationalEntry = (id: string, m: unknown): m is VocationalMeta => {
  const x = m as VocationalMeta
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) && id.length <= 40 && !isCoreSubject(id) && !!x && typeof x === 'object'
    && typeof x.name === 'string' && x.name.length > 0 && x.name.length <= 80 && typeof x.emoji === 'string' && x.emoji.length > 0 && x.emoji.length <= 16
    && (KEY_COLORS as readonly unknown[]).includes(x.c)
}

/** Sets the odborné předměty of the current release; invalid entries are left out. */
export function setVocational(v: unknown) {
  const out: Record<string, VocationalMeta> = {}
  if (v && typeof v === 'object' && !Array.isArray(v)) for (const [id, m] of Object.entries(v)) if (isVocationalEntry(id, m)) out[id] = { name: m.name, emoji: m.emoji, c: m.c }
  vocational = out
}

/** Odborné předměty of the current release, by name. */
export const vocationalSubjects = (): string[] => Object.keys(vocational).sort((a, b) => vocational[a].name.localeCompare(vocational[b].name, 'cs'))

/** Name and colour of any subject; an unknown one gets its id in grey (never crashes on content from an older release). */
export const subjectMeta = (s: SubjectId): SubjectMeta => (isCoreSubject(s) ? SUBJECTS[s] : Object.hasOwn(vocational, s) ? vocational[s] : { name: s, c: 'gray' })

/** The subjects of a grade: the curriculum's, or for `odb` every odborný předmět of the release. */
export const gradeSubjects = (g: GradeId): SubjectId[] => (g === ODB ? vocationalSubjects() : GRADE_SUBJECTS[g])

export const hasSubjectIn = (g: GradeId, s: unknown): s is SubjectId => typeof s === 'string' && gradeSubjects(g).includes(s)
