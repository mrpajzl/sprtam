import { topicFile } from '../../../src/content/format'
import { topicIssues } from '../../../src/content/rules'
import { validate } from '../../../src/content/schema'
import type { TopicFile } from '../../../src/content/types'

// What still has to be fixed before the topic can be sent: the format (src/content/format.ts) and the
// authoring rules (src/content/rules.ts) – exactly what the server and the deploy check – in Czech,
// each tied to the place in the editor where it is fixed.

export type Section = { kind: 'meta' } | { kind: 'ex'; i: number } | { kind: 'qs' }

export interface Issue {
  /** Validator path, e.g. `explanations[0].blocks[3].text` ('' = the whole topic). */
  path: string
  cs: string
  section: Section
  block?: number
  question?: number
}

const FIELD: Record<string, string> = {
  text: 'text', term: 'pojem', definition: 'vysvětlení pojmu', example: 'příklad', wrong: 'co je špatně', right: 'co je správně', why: 'proč',
  items: 'položky', question: 'zadání', answer: 'odpověď', options: 'možnosti', answers: 'správné odpovědi', pairs: 'dvojice', explanation: 'vysvětlení odpovědi',
  head: 'záhlaví', rows: 'řádky', caption: 'popisek', title: 'název', emoji: 'emoji', blocks: 'bloky', questions: 'otázky', props: 'nastavení pomůcky', id: 'id',
}

function czech(path: string, m: string): string {
  const field = path.match(/([a-z]+)(\[\d+\])*$/i)?.[1] ?? ''
  let x: RegExpMatchArray | null
  if (m === 'empty text') return field === 'title' && /^explanations\[\d+\]\.title$/.test(path) ? 'Pojmenuj vysvětlení (1–3 slova).' : `Vyplň ${FIELD[field] ?? 'text'}.`
  if ((x = m.match(/^missing field "(.+)"/))) return `Chybí ${FIELD[x[1]] ?? x[1]}.`
  if ((x = m.match(/^needs at least (\d+) items, has (\d+)/))) return field === 'questions' ? `Potřeba aspoň ${x[1]} otázek (zatím ${x[2]}).` : `Potřeba aspoň ${x[1]} (zatím ${x[2]}).`
  if ((x = m.match(/^allows at most (\d+) items/))) return `Nejvýš ${x[1]}.`
  if ((x = m.match(/is less than (\S+)/))) return `Nejméně ${x[1]}.`
  if ((x = m.match(/is more than (\S+)/))) return `Nejvýš ${x[1]}.`
  if (/^expected a whole number/.test(m)) return 'Zadej celé číslo.'
  if (/^expected a number/.test(m)) return 'Zadej číslo.'
  if (/does not match/.test(m)) return field === 'id' ? 'Id: jen malá písmena bez diakritiky, číslice a pomlčky.' : 'Hodnota nemá správný tvar.'
  if ((x = m.match(/^unknown field "(.+)"/))) return `Neznámé pole „${x[1]}“.`
  if (/^unknown widget/.test(m)) return 'Vyber pomůcku.'
  if (/^expected a list of exactly/.test(m)) return 'Vyplň obě strany.'
  return m
}

function locate(path: string, cs: string): Omit<Issue, 'path' | 'cs'> {
  let x: RegExpMatchArray | null
  if ((x = path.match(/^explanations\[(\d+)\](?:\.blocks\[(\d+)\])?/))) return { section: { kind: 'ex', i: Number(x[1]) }, block: x[2] !== undefined ? Number(x[2]) : undefined }
  if ((x = path.match(/^questions(?:\[(\d+)\])?/))) return { section: { kind: 'qs' }, question: x[1] !== undefined ? Number(x[1]) : undefined }
  // Rules about the whole topic belong where they are fixed.
  if (/ústní|otázk/i.test(cs)) return { section: { kind: 'qs' } }
  if (/Častou chybu/.test(cs)) return { section: { kind: 'ex', i: 0 } }
  return { section: { kind: 'meta' } }
}

export function checkTopic(t: TopicFile, approaches: readonly string[]): Issue[] {
  const out: Issue[] = []
  for (const i of validate(topicFile, t)) {
    const path = i.path === '(root)' ? '' : i.path
    const cs = czech(path, i.message)
    out.push({ path, cs, ...locate(path, cs) })
  }
  let rules: { path: string; cs: string }[] = []
  try { rules = topicIssues(t, approaches) } catch { /* the format issues above say what is broken */ }
  for (const r of rules) out.push({ path: r.path, cs: r.cs, ...locate(r.path, r.cs) })
  return out
}

export const sameSection = (a: Section, b: Section) => a.kind === b.kind && (a.kind !== 'ex' || a.i === (b as { i: number }).i)
