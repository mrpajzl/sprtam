import type { Block, Explanation, Question, TopicFile } from '../../../src/content/types'
import { FORMAT } from '../../../src/content/format'
import type { S } from '../../../src/content/schema'
import { WIDGETS } from '../../../src/widgets'

// Plain-data helpers for the editor: paths into a topic, immutable updates, empty blocks and questions,
// and the template of a new topic.

export type Path = (string | number)[]

/** The path as the validator writes it: `explanations[0].blocks[3].text`. */
export const pathKey = (p: Path) => p.map((x, i) => (typeof x === 'number' ? `[${x}]` : i ? `.${x}` : x)).join('')

export function getIn(o: unknown, p: Path): unknown {
  return p.reduce<unknown>((v, k) => (v == null ? undefined : (v as Record<string | number, unknown>)[k]), o)
}

/** A copy of `o` with the value at `p` replaced; `undefined` removes an object field. */
export function setIn<T>(o: T, p: Path, value: unknown): T {
  if (!p.length) return value as T
  const [k, ...rest] = p
  if (Array.isArray(o)) {
    const out = [...o]
    out[k as number] = setIn(out[k as number], rest, value)
    return out as T
  }
  const src = (o ?? {}) as Record<string, unknown>
  const next = setIn(src[k as string], rest, value)
  const out = { ...src }
  if (next === undefined) delete out[k as string]
  else out[k as string] = next
  return out as T
}

export const arrayInsert = <T,>(xs: T[], i: number, x: T) => [...xs.slice(0, i), x, ...xs.slice(i)]
export const arrayRemove = <T,>(xs: T[], i: number) => xs.filter((_, j) => j !== i)
export function arrayMove<T>(xs: T[], from: number, to: number): T[] {
  const out = [...xs]
  const [x] = out.splice(from, 1)
  out.splice(Math.max(0, Math.min(out.length, to)), 0, x)
  return out
}

/** „Vyjmenovaná slova po B“ → „vyjmenovana-slova-po-b“. */
export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '')

// ——— Defaults from a schema (widget props) ———

export function defaultOf(x: S): unknown {
  switch (x.kind) {
    case 'string': return ''
    case 'number': return x.min !== undefined && x.min > 0 ? x.min : 0
    case 'boolean': return false
    case 'enum': return x.values[0]
    case 'array': return Array.from({ length: x.min ?? 0 }, () => defaultOf(x.item))
    case 'tuple': return x.items.map(defaultOf)
    case 'object': return Object.fromEntries(Object.entries(x.fields).filter(([k]) => !x.optional.has(k)).map(([k, f]) => [k, defaultOf(f)]))
    case 'anyOf': return defaultOf(x.options[0])
    case 'variants': return {}
  }
}

/** A widget with the props of its first example (a working start that the author then changes). */
export const newWidget = (name: string) => ({ widget: name, props: structuredClone(WIDGETS[name].examples[0].props) as Record<string, unknown> })

// ——— Empty blocks and questions ———

export function newBlock(type: Block['type']): Block {
  switch (type) {
    case 'heading': return { type, text: '' }
    case 'text': return { type, text: '' }
    case 'term': return { type, term: '', definition: '', example: '' }
    case 'mistake': return { type, wrong: '', right: '', why: '' }
    case 'summary': return { type, text: '' }
    case 'list': return { type, items: [''] }
    case 'steps': return { type, items: ['', ''] }
    case 'example': return { type, question: '', answer: '' }
    case 'table': return { type, head: ['', ''], rows: [['', '']] }
    case 'picture': return { type, items: [] }
    case 'widget': return { type, ...newWidget('fraction') } as Block
  }
}

export function newQuestion(type: Question['type']): Question {
  switch (type) {
    case 'choice': return { type, question: '', options: ['', '', ''], answer: 0, explanation: '' }
    case 'truefalse': return { type, question: '', answer: true, explanation: '' }
    case 'input': return { type, question: '', answers: [''], explanation: '' }
    case 'order': return { type, question: '', items: ['', '', ''], explanation: '' }
    case 'match': return { type, question: '', pairs: [['', ''], ['', ''], ['', '']], explanation: '' }
    case 'open': return { type, question: '', answer: '' }
  }
}

/** The required structure of an explanation (docs/CONTENT.md), ready to be filled in. */
export const newExplanation = (title: string, approach?: string): Explanation => ({
  title,
  ...(approach ? { approach } : {}),
  blocks: [
    { type: 'heading', text: 'O čem to je' }, newBlock('text'),
    { type: 'heading', text: 'Nové pojmy' }, newBlock('term'),
    { type: 'heading', text: 'Jak na to' }, newBlock('steps'),
    newBlock('example'), newBlock('mistake'), newBlock('summary'),
  ],
})

export const newTopic = (id: string, title: string, emoji: string): TopicFile => ({
  format: FORMAT, id, title, emoji,
  explanations: [newExplanation('Příběhem'), newExplanation('Krok za krokem')],
  questions: [newQuestion('choice'), newQuestion('truefalse'), newQuestion('input'), newQuestion('open')],
})

/**
 * Optional texts left empty while editing (a term without an example, a question without an explanation)
 * are dropped before validating and sending, so an untouched optional field never counts as an error.
 */
export function clean(t: TopicFile): TopicFile {
  const drop = <T extends object>(o: T, keys: string[]): T => {
    const out = { ...o } as Record<string, unknown>
    for (const k of keys) if (out[k] === '') delete out[k]
    return out as T
  }
  return {
    ...t,
    explanations: t.explanations.map((x) => ({ ...x, blocks: x.blocks.map((b) => (b.type === 'term' ? drop(b, ['example']) : b.type === 'picture' ? drop(b, ['caption']) : b)) })),
    questions: t.questions.map((q) => drop(q, ['explanation'])),
  }
}

export const BLOCK_TYPES: { type: Block['type']; label: string; hint: string }[] = [
  { type: 'heading', label: 'Nadpis', hint: 'Krátký nadpis části výkladu' },
  { type: 'text', label: 'Odstavec', hint: 'Běžný text, pár krátkých vět' },
  { type: 'term', label: 'Nový pojem', hint: 'Odborné slovo vysvětlené obyčejně, s příkladem' },
  { type: 'steps', label: 'Postup', hint: 'Kroky, které se odkrývají jeden po druhém' },
  { type: 'example', label: 'Řešený příklad', hint: 'Zadání a řešení, které se ukáže po klepnutí' },
  { type: 'mistake', label: 'Častá chyba', hint: 'Špatně, správně a proč' },
  { type: 'summary', label: 'Shrnutí', hint: 'To hlavní k zapamatování, zvýrazněné' },
  { type: 'list', label: 'Seznam', hint: 'Odrážky' },
  { type: 'table', label: 'Tabulka', hint: 'Řádky a sloupce' },
  { type: 'picture', label: 'Obrázek z emoji', hint: 'Řada emoji, třeba 🍎🍎➕🍐' },
  { type: 'widget', label: 'Interaktivní pomůcka', hint: 'Zlomek, číselná osa, hodiny, třídění…' },
]

export const QUESTION_TYPES: { type: Question['type']; label: string; hint: string }[] = [
  { type: 'choice', label: 'Výběr z možností', hint: '2–4 možnosti, jedna správná' },
  { type: 'truefalse', label: 'Pravda / nepravda', hint: 'Tvrzení, které je, nebo není pravdivé' },
  { type: 'input', label: 'Napsat odpověď', hint: 'Krátká odpověď – číslo nebo slovo' },
  { type: 'order', label: 'Seřadit', hint: 'Položky ve správném pořadí, aplikace je zamíchá' },
  { type: 'match', label: 'Spojit dvojice', hint: 'Co k čemu patří' },
  { type: 'open', label: 'Ústní zkoušení', hint: 'Otázka na odpověď nahlas a vzorová odpověď' },
]

export const blockLabel = (t: Block['type']) => BLOCK_TYPES.find((b) => b.type === t)!.label
export const questionLabel = (t: Question['type']) => QUESTION_TYPES.find((b) => b.type === t)!.label
