// Content types. The format of the files themselves is defined in ./format.ts (content/**/*.json);
// how to write content: docs/CONTENT.md.

export type { Block, Explanation, Question, SubjectFile, TopicFile, VocabFile } from './format'
import type { TopicFile } from './format'

/** Grade id: z1–z9 = základní škola, s1–s4 = střední škola (gymnázium). */
export type GradeId =
  | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7' | 'z8' | 'z9'
  | 's1' | 's2' | 's3' | 's4'

export type SubjectId =
  | 'cestina' | 'matematika' | 'anglictina' | 'prvouka' | 'prirodoveda' | 'vlastiveda'
  | 'dejepis' | 'zemepis' | 'prirodopis' | 'fyzika' | 'chemie' | 'obcanska'
  | 'literatura' | 'biologie' | 'zsv' | 'informatika'

export type Topic = TopicFile

/** One subject of one grade, assembled from content/topics/<grade>/<subject>/: its topics in school-year order. */
export interface Subject {
  grade: GradeId
  subject: SubjectId
  topics: Topic[]
}
