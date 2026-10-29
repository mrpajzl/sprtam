import type { CoreSubjectId } from '../content/types'
import type { Level, VocabLang } from './types'

// Languages with vocabulary. English lives at /slovicka/<level> (its old addresses), the others at
// /slovicka/<path>/<level>; the path is the language's subject, so a grade's language tile and its words share a name.

/** Levels in order (as LEVELS in src/content/format.ts, which the app does not import: it would pull in the widgets). */
export const LEVEL_IDS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export interface LangMeta {
  id: VocabLang
  /** Subject of the language (its tile in a grade links to these words). */
  subject: CoreSubjectId
  /** Address segment: '' for English (/slovicka/A1), else the subject (/slovicka/nemcina/A1). */
  path: string
  /** "Angličtina" */
  name: string
  /** "Anglická slovíčka" */
  title: string
  /** "Anglicky" – label of the answer field. */
  adverb: string
  /** Default voice of the pronunciation (speechSynthesis fallback). */
  speech: string
}

export const LANGS: LangMeta[] = [
  { id: 'en', subject: 'anglictina', path: '', name: 'Angličtina', title: 'Anglická slovíčka', adverb: 'Anglicky', speech: 'en-GB' },
  { id: 'de', subject: 'nemcina', path: 'nemcina', name: 'Němčina', title: 'Německá slovíčka', adverb: 'Německy', speech: 'de-DE' },
  { id: 'fr', subject: 'francouzstina', path: 'francouzstina', name: 'Francouzština', title: 'Francouzská slovíčka', adverb: 'Francouzsky', speech: 'fr-FR' },
  { id: 'es', subject: 'spanelstina', path: 'spanelstina', name: 'Španělština', title: 'Španělská slovíčka', adverb: 'Španělsky', speech: 'es-ES' },
]

export const langById = (id: VocabLang) => LANGS.find((l) => l.id === id)!
/** The language of an address segment (/slovicka/<path>), English never (its levels are right under /slovicka). */
export const langByPath = (path: string | undefined) => (path ? LANGS.find((l) => l.path === path) : undefined)
export const langOfSubject = (s: string) => LANGS.find((l) => l.subject === s)

/** /slovicka/A1, /slovicka/nemcina/A1/3 */
export const vocabPath = (lang: VocabLang, level?: Level, group?: number | 'vse') =>
  ['/slovicka', langById(lang).path, level, group].filter((x) => x !== undefined && x !== '').join('/')

/** Release file of a language's level (src/content/manifest.ts): English keeps its old name, which older apps read. */
export const levelFile = (lang: VocabLang, level: Level) => (lang === 'en' ? `vocab/${level}` : `words/${lang}/${level}`)

/** Progress key of a word (Progress.w): English words by themselves (as always), the others as "de:der Hund". */
export const wordKey = (lang: VocabLang, word: string) => (lang === 'en' ? word : `${lang}:${word}`)
