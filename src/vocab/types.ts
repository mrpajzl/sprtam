// Vocabulary types. The file format (content/vocab/<level>.json) is defined in src/content/format.ts.
import type { VocabFile } from '../content/format'

export type Level = VocabFile['level']
export type VocabSet = VocabFile
export type VocabGroup = VocabSet['groups'][number]
/** { cz, en (the answer), similar (looks alike, wrong), related (similar meaning, wrong) } */
export type Word = VocabGroup['words'][number]
