import { useEffect } from 'preact/hooks'
import { GRADE_NAME, subjectMeta } from './content/curriculum'
import type { Block, GradeId, SubjectId } from './content/types'

// Page titles and descriptions, shared by the app (document.title) and the
// pages the server renders (server/pages.ts), so both always say the same.

export const SITE_NAME = 'Šprtám'

/** „5. třída“, „1. ročník SŠ“ */
export const gradeLabel = (g: GradeId) => (g === 'odb' ? 'odborná škola' : g[0] === 's' ? `${GRADE_NAME[g]} SŠ` : GRADE_NAME[g])

/** Accusative, for „pro 5. třídu“, „pro 1. ročník SŠ“, „pro odborné školy“. */
export const gradeFor = (g: GradeId) => (g === 'odb' ? 'odborné školy' : gradeLabel(g).replace('třída', 'třídu'))

export const titles = {
  home: () => `${SITE_NAME} – opakování učiva ZŠ a SŠ`,
  grade: (g: GradeId) => (g === 'odb' ? 'Odborné předměty – střední odborné školy' : `${gradeLabel(g)} – všechny předměty`),
  subject: (g: GradeId, s: SubjectId) => `${subjectMeta(s).name} – ${gradeLabel(g)}`,
  topic: (g: GradeId, s: SubjectId, title: string) => `${title} – ${subjectMeta(s).name}, ${gradeLabel(g)}`,
  /** /slovicka, or one language's /slovicka/<language> ("Německá slovíčka"). */
  vocab: (lang?: string) => lang ?? 'Slovíčka – angličtina A1–C1 a další jazyky',
  vocabLevel: (level: string, lang = 'Anglická slovíčka') => `${lang} ${level}`,
  approach: (name: string) => `${name} – epochy a učivo`,
  approachYear: (name: string, year: string) => `${name}: ${year} – epochy`,
  approachBlock: (name: string, year: string, block: string) => `${block} – ${name}, ${year}`,
  obory: () => 'Odborné školy – obory a jejich odborné předměty',
  obor: (name: string) => `${name} – odborné předměty po ročnících`,
  exam: () => 'Přijímačky na SŠ – příprava z češtiny a matematiky',
  examPart: (part: string) => `${part} – příprava na přijímačky`,
  examArea: (area: string, part: string) => `${area} – příprava na přijímačky (${part})`,
  maps: () => 'Slepá mapa – kraje Česka, Evropa a svět',
  map: (title: string, kind: 'stat' | 'kraj') => `Slepá mapa: ${title} – ${kind === 'kraj' ? 'kraje a krajská města' : 'státy a hlavní města'}`,
}

export const fullTitle = (t?: string) => (!t ? titles.home() : t.startsWith(SITE_NAME) ? t : `${t} | ${SITE_NAME}`)

export function useTitle(t: string | undefined) {
  useEffect(() => { if (t) document.title = fullTitle(t) }, [t])
}

/** Plain text of inline content markup (**bold**, *italic*, `code`, ^sup). */
export const plain = (text: string) => text.replace(/\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g, '$1$2$3').replace(/\^/g, '')

/** First ~155 characters of an explanation's prose, cut at a word boundary. */
export function summary(blocks: Block[], max = 155): string {
  const text = blocks.flatMap((b) => (b.type === 'text' || b.type === 'summary' ? [plain(b.text)] : b.type === 'term' ? [`${plain(b.term)}: ${plain(b.definition)}`] : [])).join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:.!?–-]+$/, '')}…`
}
