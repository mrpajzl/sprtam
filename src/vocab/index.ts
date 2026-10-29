import { loadHash, manifest, onManifest } from '../content/remote'
import type { VocabFile, WordsFile } from '../content/types'
import { LANGS, LEVEL_IDS, levelFile, wordKey } from './langs'
import type { Level, VocabLang, VocabSet } from './types'

// Each level of each language is one file of the content release (vocab/<level> for English, words/<lang>/<level>,
// src/content/manifest.ts). Both formats are read as one VocabSet: the answer is `word`.

/** Levels of a language that the current release has, A1 first. */
export const levelsOf = (lang: VocabLang): Level[] => LEVEL_IDS.filter((l) => levelFile(lang, l) in manifest().files)

/** Languages that have any words in the current release (English first). */
export const vocabLangs = () => LANGS.filter((l) => levelsOf(l.id).length > 0)

const sets = new Map<string, Promise<VocabSet>>()

export function loadLevel(lang: VocabLang, level: Level): Promise<VocabSet> {
  const h = manifest().files[levelFile(lang, level)]
  if (!h) return Promise.reject(new Error('missing'))
  let p = sets.get(h)
  if (!p) {
    p = lang === 'en'
      ? loadHash<VocabFile>(h).then((v) => ({ lang, level, groups: v.groups.map(({ words, ...g }) => ({ ...g, words: words.map(({ en, ...w }) => ({ ...w, word: en })) })) }))
      : loadHash<WordsFile>(h).then((v) => ({ lang, level, groups: v.groups }))
    p.catch(() => sets.delete(h))
    sets.set(h, p)
  }
  return p
}

const loadAll = () => Promise.all(LANGS.flatMap((l) => levelsOf(l.id).map((lv) => loadLevel(l.id, lv))))

/** Progress keys of every word in all languages (used only when importing a progress code). */
export async function allWords(): Promise<string[]> {
  const all = await loadAll()
  return all.flatMap((s) => s.groups.flatMap((g) => g.words.map((w) => wordKey(s.lang, w.word))))
}

export interface WordRef { cz: string; word: string; lang: VocabLang; level: Level; group: number }

let words: Promise<WordRef[]> | undefined
onManifest(() => { words = undefined })
/** All words with their language, level and group (search, overview). */
export const loadWordRefs = () => (words ??= loadAll()
  .then((all) => all.flatMap((s) => s.groups.flatMap((g, group) => g.words.map(({ cz, word }) => ({ cz, word, lang: s.lang, level: s.level, group })))), (e) => { words = undefined; throw e }))
