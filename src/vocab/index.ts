import type { Level, VocabSet } from './types'

const files = import.meta.glob<{ default: VocabSet }>('./data/*.ts')

export const loadLevel = (l: Level) => {
  const f = files[`./data/${l.toLowerCase()}.ts`]
  return f ? f().then((m) => m.default) : Promise.reject(new Error('missing'))
}

/** Every English word in all levels (used only when importing a progress code). */
export async function allWords(): Promise<string[]> {
  const sets = await Promise.all(Object.values(files).map((f) => f().then((m) => m.default)))
  return sets.flatMap((s) => s.groups.flatMap((g) => g.words.map((w) => w[1])))
}
