// Typed answers of the vocabulary drill (src/screens/Vocab.tsx): how strict, and the letter hint.

/** A note in parentheses at the end ("l'arbre (m)") is shown, never required. */
const NOTE = /\s*\([^)]*\)\s*$/
const norm = (s: string) => s.toLowerCase().replace(/[’`]/g, "'").replace(/[\s\-.!?¿¡,]+/g, '')
/** Without diacritics (ä → a, ß → ss, ñ → n): a missing accent is a typo, not a mistake. */
const plain = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss')

function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

/** Exact, or a small typo (1 letter from 5 letters, 2 from 12; missing diacritics). */
export function check(typed: string, answer: string): 'ok' | 'typo' | 'bad' {
  const a = norm(typed)
  if (!a) return 'bad'
  const full = norm(answer), bare = norm(answer.replace(NOTE, ''))
  if (a === full || a === bare) return 'ok'
  const b = plain(bare)
  return distance(plain(a), b) <= (b.length >= 12 ? 2 : b.length >= 5 ? 1 : 0) ? 'typo' : 'bad'
}

/** „h _ _ _ _“: first letter of every word, the rest hidden; a note in parentheses stays as it is. */
export const mask = (answer: string) => {
  const note = answer.match(NOTE)?.[0].trim()
  const bare = answer.replace(NOTE, '')
  return bare.split(' ').map((p) => [...p].map((ch, k) => (k === 0 || !/\p{L}/u.test(ch) ? ch : '_')).join(' ')).join('   ') + (note ? `   ${note}` : '')
}
