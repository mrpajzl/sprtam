// Progress of single quiz questions (Progress.q in store.ts): spaced repetition with a Leitner box per question,
// the „Sešit chyb“ and „Dnešní opakování“. Pure functions without the browser, so scripts can check them too.

/** Days since 1970 – the unit of every date in the progress. */
export const today = () => Math.floor(Date.now() / 86_400_000)

export interface QuestionProgress {
  /** Leitner box 0–5: a wrong answer sends it to 0, a right one a box up (QUESTION_GAP). */
  b: number
  /** Day of the last answer. */
  d: number
  /** How many times it went wrong. */
  w: number
}

/** Days until a question comes back, by its Leitner box. */
export const QUESTION_GAP = [0, 1, 3, 7, 14, 30]

/** Stable id of a question of a topic: its text and answer (not the explanation or hints, so fixing those keeps the progress). */
export function questionId(topic: string, q: object): string {
  const { explanation: _e, hints: _h, ...rest } = q as Record<string, unknown>
  const text = JSON.stringify(rest)
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return `${topic}#${(h >>> 0).toString(36)}`
}
export const topicOf = (id: string) => id.slice(0, id.indexOf('#'))

/** The next box: wrong → 0; right → up (a first right answer starts at 2, it was known already); with a hint it stays. */
export function nextBox(prev: QuestionProgress | undefined, ok: boolean, hint: boolean): number {
  if (!ok) return 0
  if (hint) return prev?.b ?? 1
  return prev ? Math.min(5, prev.b + 1) : 2
}

/** Questions that went wrong and were not answered right twice since. */
export const isMistake = (v: QuestionProgress) => v.w > 0 && v.b < 2
export const isDue = (v: QuestionProgress, now = today()) => now - v.d >= QUESTION_GAP[v.b]
