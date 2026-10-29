// Vocabulary types. The file formats (content/vocab/<level>.json for English, content/vocab/<lang>/<level>.json for the
// other languages) are defined in src/content/format.ts; the app reads both as a WordSet (src/vocab/index.ts).
import type { VocabFile, WordsFile } from '../content/format'

export type Level = VocabFile['level']
export type WordLang = WordsFile['lang']
export type VocabLang = 'en' | WordLang

/** { cz (asked), word (the answer), similar (looks alike, wrong), related (similar meaning, wrong) } */
export interface Word { cz: string; word: string; similar: string; related: string }
export interface VocabGroup {
  name: string
  emoji: string
  /** Accent of the pronunciation (English groups: en-GB, en-US, en-AU); default: the language's. */
  lang?: string
  words: Word[]
}
export interface VocabSet { lang: VocabLang; level: Level; groups: VocabGroup[] }
