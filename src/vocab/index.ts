import type { Level, VocabSet } from './types'

const files = import.meta.glob<{ default: VocabSet }>('/content/vocab/*.json')

export const loadLevel = (l: Level) => {
  const f = files[`/content/vocab/${l.toLowerCase()}.json`]
  return f ? f().then((m) => m.default) : Promise.reject(new Error('missing'))
}

/** Every English word in all levels (used only when importing a progress code). */
export async function allWords(): Promise<string[]> {
  const sets = await Promise.all(Object.values(files).map((f) => f().then((m) => m.default)))
  return sets.flatMap((s) => s.groups.flatMap((g) => g.words.map((w) => w.en)))
}

export interface WordRef { cz: string; en: string; level: Level; group: number }

let words: Promise<WordRef[]> | undefined
/** All words with their level and group (for search). */
export const loadWordRefs = () => (words ??= Promise.all(Object.values(files).map((f) => f().then((m) => m.default)))
  .then((sets) => sets.flatMap((s) => s.groups.flatMap((g, group) => g.words.map(({ cz, en }) => ({ cz, en, level: s.level, group }))))))
