// Content types. The format of the files themselves is defined in ./format.ts (content/**/*.json);
// how to write content: docs/CONTENT.md.

export type { ApproachFile, ApproachYearFile, Block, Explanation, Question, SubjectFile, TopicFile, VocabFile, YearBlock } from './format'
import type { TopicFile } from './format'

/** A grade of the curriculum: z1–z9 = základní škola, s1–s4 = střední škola (gymnázium). */
export type YearId =
  | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7' | 'z8' | 'z9'
  | 's1' | 's2' | 's3' | 's4'

/** Where topics live: a grade, or `odb` – odborné předměty of vocational schools, shared by their obory (src/obory.ts). */
export type GradeId = YearId | 'odb'

/** Subjects of the general curriculum (src/content/curriculum.ts). */
export type CoreSubjectId =
  | 'cestina' | 'matematika' | 'anglictina' | 'prvouka' | 'prirodoveda' | 'vlastiveda'
  | 'dejepis' | 'zemepis' | 'prirodopis' | 'fyzika' | 'chemie' | 'obcanska'
  | 'literatura' | 'biologie' | 'zsv' | 'informatika'

/** A core subject, or an odborný předmět: those are content (topics/odb/<id>/_subject) and come with the release. */
export type SubjectId = string

export type Topic = TopicFile

/** One subject of one grade, assembled from content/topics/<grade>/<subject>/: its topics in school-year order. */
export interface Subject {
  grade: GradeId
  subject: SubjectId
  topics: Topic[]
}
