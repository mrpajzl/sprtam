import { loadFile, manifest, onManifest } from '../content/remote'
import type { Level, VocabSet } from './types'

// Each level is one file of the content release (vocab/<level>, src/content/manifest.ts).

const levels = () => Object.keys(manifest().files).filter((n) => n.startsWith('vocab/')).sort()

export const loadLevel = (l: Level) => loadFile<VocabSet>(`vocab/${l}`)

const loadAll = () => Promise.all(levels().map((n) => loadFile<VocabSet>(n)))

/** Every English word in all levels (used only when importing a progress code). */
export async function allWords(): Promise<string[]> {
  const sets = await loadAll()
  return sets.flatMap((s) => s.groups.flatMap((g) => g.words.map((w) => w.en)))
}

export interface WordRef { cz: string; en: string; level: Level; group: number }

let words: Promise<WordRef[]> | undefined
onManifest(() => { words = undefined })
/** All words with their level and group (for search). */
export const loadWordRefs = () => (words ??= loadAll()
  .then((sets) => sets.flatMap((s) => s.groups.flatMap((g, group) => g.words.map(({ cz, en }) => ({ cz, en, level: s.level, group })))), (e) => { words = undefined; throw e }))
