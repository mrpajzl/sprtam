import type { ApproachFile, GradeId } from './types'

// What the app gets from the content API (docs/OBSAH.md): a small manifest of the current release
// and files named by the hash of their contents, so every file can be cached forever.
//
//   GET /api/content/manifest        this Manifest (always fresh; also embedded in every served page)
//   GET /api/content/f/<hash>.json   one file of a release
//
// Files of a release (Manifest.files: name → hash):
//   subject/<grade>/<subject>         Topic[] in school-year order (the subject's _subject list)
//   index                             TopicRow[] of every topic (search, recommendations)
//   text                              string[] in the order of `index`: explanation titles, terms, summaries
//   vocab/<level>                     VocabFile (A1 … C1)
//   approach/<id>/<grade>             ApproachYearFile
// Teaching approaches themselves are small and needed before the first render: inline in `approaches`.

export const MANIFEST_FORMAT = 1

export interface ApproachMeta extends Omit<ApproachFile, 'format'> {
  id: string
  /** Grades that have a plan, in school order. */
  grades: GradeId[]
}

/** [grade, subject, id, title, emoji, approach?] – approach only for topics of one teaching approach. */
export type TopicRow = [GradeId, string, string, string, string, string?]

export interface Manifest {
  format: typeof MANIFEST_FORMAT
  /** Number of the release (0 in development). */
  release: number
  /** Hash of the whole release: changes whenever any file does. */
  hash: string
  /** When the release was published (ms). */
  publishedAt: number
  /** File name → hash of its contents. */
  files: Record<string, string>
  approaches: ApproachMeta[]
}

/** Hashes are lowercase hex; file URLs are /api/content/f/<hash>.json. */
export const HASH = /^[0-9a-f]{20}$/
