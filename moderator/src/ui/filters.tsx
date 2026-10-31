import { GRADE_NAME, ODB, STAGES, subjectMeta } from '../../../src/content/curriculum'
import type { SubjectId } from '../../../src/content/types'
import { SubjectGlyph } from '../../../src/ui/glyphs'
import type { SelectOption } from '../../../src/ui/Select'

// The grade and subject filters of the queues (Review, Reports), as options of our dropdown (src/ui/Select.tsx).

export const gradeOptions: SelectOption[] = [
  { value: '', label: 'Všechny ročníky' },
  ...STAGES.flatMap((st) => st.grades.map((g) => ({ value: g, label: GRADE_NAME[g], group: st.name }))),
  { value: ODB, label: GRADE_NAME[ODB] },
]

export const subjectOptions = (subjects: SubjectId[]): SelectOption[] => [
  { value: '', label: 'Všechny předměty' },
  ...subjects.map((s) => ({ value: s, label: subjectMeta(s).name, icon: <SubjectGlyph s={s} /> })),
]
