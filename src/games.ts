import { subjectMeta, type KeyColor } from './content/curriculum'
import type { GradeId, SubjectId, YearId } from './content/types'
import { ELEMENTS_PATH } from './chem'
import { EXAM } from './exam'
import { MAPS_PATH } from './maps'
import { LANGS, vocabPath } from './vocab/langs'
import type { Level, VocabLang } from './vocab/types'

// Learning games and other extras beside the topics (Slepá mapa, Periodická tabulka, slovíčka, přijímačky).
// One registry, and each extra says where it belongs: the subjects it is part of, optionally only some grades.
// Every screen that offers extras asks the registry instead of linking them by hand: the home screen (the
// pupil's school), a grade, a subject and the Hry tab (games) or Učivo (preparation). A new game is one entry
// here; the app and the server pages (server/pages.ts) both read it.

export interface Extra {
  id: string
  /** hra = a game (the Hry tab), priprava = preparation for an exam (Učivo). */
  kind: 'hra' | 'priprava'
  name: string
  hint: string
  /** Shown on the key: an emoji, or `glyph` in the mono font (Aa). */
  emoji?: string
  glyph?: string
  c: KeyColor
  path: string
  /** The subjects it belongs to. */
  s: SubjectId[]
  /** Only in these grades; without it wherever one of the subjects is taught. */
  g?: YearId[]
}

const WORDS = 'slovicka-'
const range = (ls: Level[]) => (ls.length > 1 ? `${ls[0]}–${ls[ls.length - 1]}` : ls[0])

/**
 * Every extra of the release. `levels` = levels of a language's vocabulary in the release (src/vocab levelsOf in
 * the app, the release's files on the server): a language without words has no entry.
 */
export function extras(levels: (lang: VocabLang) => Level[]): Extra[] {
  return [
    { id: 'slepa-mapa', kind: 'hra', name: 'Slepá mapa', hint: 'kraje, Evropa, svět', emoji: '🗺️', c: 'teal', path: MAPS_PATH, s: ['zemepis', 'vlastiveda'] },
    { id: 'periodicka-tabulka', kind: 'hra', name: 'Periodická tabulka', hint: 'prvky, značky a hra na slepou tabulku', emoji: '🧪', c: 'green', path: ELEMENTS_PATH, s: ['chemie'] },
    ...LANGS.flatMap((l): Extra[] => {
      const ls = levels(l.id)
      return ls.length ? [{ id: `${WORDS}${l.id}`, kind: 'hra', name: l.title, hint: `${range(ls)} · psaní, poslech, kartičky`, glyph: 'Aa', c: subjectMeta(l.subject).c, path: vocabPath(l.id), s: [l.subject] }] : []
    }),
    { id: EXAM.id, kind: 'priprava', name: EXAM.name, hint: EXAM.hint, emoji: EXAM.emoji, c: 'orange', path: `/${EXAM.id}`, s: ['cestina', 'matematika'], g: ['z9'] },
  ]
}

const fits = (x: Extra, g: GradeId, s: SubjectId) => x.s.includes(s) && (!x.g || (x.g as GradeId[]).includes(g))

/** Extras of a subject in a grade. */
export const extrasOf = (all: Extra[], g: GradeId, s: SubjectId) => all.filter((x) => fits(x, g, s))

/** Extras of any of the subjects of a grade (the grade screen, the pupil's school on the home screen). */
export const extrasFor = (all: Extra[], g: GradeId, subjects: SubjectId[]) => all.filter((x) => subjects.some((s) => fits(x, g, s)))

/** For a whole year: the words of several languages are one key, Slovíčka, which lists the languages. */
export function merged(list: Extra[]): Extra[] {
  const words = list.filter((x) => x.id.startsWith(WORDS))
  if (words.length < 2) return list
  const one: Extra = { id: 'slovicka', kind: 'hra', name: 'Slovíčka', hint: words.map((x) => subjectMeta(x.s[0]).name.toLowerCase()).join(', '), glyph: 'Aa', c: 'purple', path: '/slovicka', s: words.flatMap((x) => x.s) }
  return list.flatMap((x) => (x === words[0] ? [one] : words.includes(x) ? [] : [x]))
}
