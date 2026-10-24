// Content schema. Every subject file in src/content/data/<grade>/<subject>.ts
// default-exports a `Subject`. See docs/CONTENT.md for authoring rules.

/** Grade id: z1–z9 = základní škola, s1–s4 = střední škola (gymnázium). */
export type GradeId =
  | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7' | 'z8' | 'z9'
  | 's1' | 's2' | 's3' | 's4'

export type SubjectId =
  | 'cestina' | 'matematika' | 'anglictina' | 'prvouka' | 'prirodoveda' | 'vlastiveda'
  | 'dejepis' | 'zemepis' | 'prirodopis' | 'fyzika' | 'chemie' | 'obcanska'
  | 'literatura' | 'biologie' | 'zsv' | 'informatika'

/** Inline text supports **bold**, *italic* and `code`/vzorec. */
export type Block =
  | { t: 'h'; text: string } // short section heading inside an explanation
  | { t: 'p'; text: string }
  /** A new term, introduced before it is used: what it is in plain words, plus an example. */
  | { t: 'term'; term: string; def: string; ex?: string }
  /** A typical mistake: the wrong version, the right one and why. */
  | { t: 'mistake'; wrong: string; right: string; why: string }
  | { t: 'key'; text: string } // the one rule to remember, shown highlighted
  | { t: 'list'; items: string[] }
  | { t: 'steps'; items: string[] } // revealed one by one
  | { t: 'example'; q: string; a: string } // worked example, answer revealed on tap
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'pic'; items: string[]; caption?: string } // row of emoji as a picture
  | Widget

export type Widget =
  /** Tap to add/remove objects and count them. */
  | { t: 'w'; w: 'counter'; p: { emoji: string; start?: number; max?: number } }
  /** Number line; optional hop from `start` by `hop` (add/sub visualisation). */
  | { t: 'w'; w: 'numberline'; p: { min: number; max: number; step?: number; start?: number; hop?: number } }
  /** Pie/bar of a fraction with +/- for numerator and denominator. */
  | { t: 'w'; w: 'fraction'; p: { n: number; d: number } }
  /** Place value blocks (stovky, desítky, jednotky). */
  | { t: 'w'; w: 'placevalue'; p: { value: number } }
  /** Analogue clock with draggable time. */
  | { t: 'w'; w: 'clock'; p: { h: number; m: number } }
  /** a × b grid of dots with sliders (násobení, obsah). */
  | { t: 'w'; w: 'multiply'; p: { a: number; b: number; max?: number } }
  /** Balance scale for equation a·x + b = c; user does the same operation on both sides. */
  | { t: 'w'; w: 'balance'; p: { a: number; b: number; c: number } }
  /** Angle with slider and classification. */
  | { t: 'w'; w: 'angle'; p: { deg: number } }
  /** Right triangle with squares on sides. */
  | { t: 'w'; w: 'pythagoras'; p: { a: number; b: number } }
  /** Graph of y = k·x + q with sliders. */
  | { t: 'w'; w: 'linear'; p: { k: number; q: number } }
  /** Graph of y = a·x² + b·x + c with sliders. */
  | { t: 'w'; w: 'quadratic'; p: { a: number; b: number; c: number } }
  /** 10×10 grid showing p %. */
  | { t: 'w'; w: 'percent'; p: { p: number; of?: number } }
  /** Shape with sliders showing perimeter and area. */
  | { t: 'w'; w: 'shape'; p: { shape: 'square' | 'rect' | 'triangle' | 'circle'; a?: number; b?: number } }
  /** Horizontal timeline. */
  | { t: 'w'; w: 'timeline'; p: { events: { year: number; label: string }[] } }
  /** Flip cards: front → back. */
  | { t: 'w'; w: 'flip'; p: { cards: { front: string; back: string }[] } }
  /** Sort items into 2–4 buckets; `b` is the index of the correct bucket. */
  | { t: 'w'; w: 'sort'; p: { buckets: string[]; items: { text: string; b: number }[] } }
  /** Cycle diagram (koloběh vody, …), steps highlighted in turn. */
  | { t: 'w'; w: 'cycle'; p: { steps: string[] } }
  /** Word split into coloured parts (předpona, kořen, přípona, koncovka…). */
  | { t: 'w'; w: 'parts'; p: { words: { parts: { text: string; label: string }[] }[] } }
  /** Fill the gap: tap the correct option, e.g. b_t → y/i. */
  | { t: 'w'; w: 'gap'; p: { items: { before: string; after: string; options: string[]; a: number }[] } }
  /** Bar chart for comparing values (population, temperatures…). */
  | { t: 'w'; w: 'bars'; p: { unit?: string; items: { label: string; value: number }[] } }

export type Question =
  | { t: 'choice'; q: string; o: string[]; a: number; why?: string }
  | { t: 'tf'; q: string; a: boolean; why?: string }
  /** Short typed answer; any of `a` is accepted (case/diacritics/space-insensitive for text, numeric compare for numbers). */
  | { t: 'input'; q: string; a: string[]; why?: string }
  /** Put items into the given (correct) order. */
  | { t: 'order'; q: string; items: string[]; why?: string }
  /** Match left to right; pairs are given correctly. */
  | { t: 'pair'; q: string; pairs: [string, string][]; why?: string }
  /** Open oral-exam question; the child answers aloud, then self-assesses. */
  | { t: 'open'; q: string; a: string }

export interface Explanation {
  /** Short name of the approach, e.g. „Na pizze“, „Na číselné ose“, „Příběhem“. */
  title: string
  blocks: Block[]
}

export interface Topic {
  /** Unique within the subject file, kebab-case ASCII. */
  id: string
  title: string
  emoji: string
  /** Two different ways to explain the same thing. */
  ex: [Explanation, Explanation]
  qs: Question[]
  /** Optional procedural question generator (see src/quiz/generators.ts). */
  gen?: string
}

export interface Subject {
  grade: GradeId
  subject: SubjectId
  topics: Topic[]
}
