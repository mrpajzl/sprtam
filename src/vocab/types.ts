export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

/** [česky, anglicky správně, podobně vypadající špatně, příbuzné ale špatně] */
export type Word = [cz: string, en: string, near: string, rel: string]

export interface VocabSet {
  level: Level
  /** Themed groups, e.g. „Zvířata“. */
  groups: { name: string; emoji: string; words: Word[]; /** Accent for speech, default en-GB (e.g. Australian idioms). */ lang?: string }[]
}
