import type { VocabLang } from './types'

/** File name of an English word's recording: public/audio/en/<slug>.mp3 (see scripts/vocab-audio.ts). */
export const audioSlug = (en: string) => en.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const fnv = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) } return h >>> 0 }

/** Other languages: the word in ASCII (ß → ss, accents dropped), and when that loses anything a short hash of the
 *  word, so "schon" and "schön" or "si" and "sí" never share a file. */
export function wordSlug(lang: VocabLang, word: string) {
  if (lang === 'en') return audioSlug(word)
  const ascii = word.normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss')
  return audioSlug(ascii) + (/^[\x20-\x7e]*$/.test(word) ? '' : `-${fnv(word).toString(36)}`)
}
