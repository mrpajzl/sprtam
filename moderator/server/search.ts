import { parseKey } from '../../src/content/docs'
import type { TopicFile } from '../../src/content/types'
import { HttpError } from './http'
import { current, getDoc, published } from './store'

// Searching the text of all published topics (explanations, questions, options, answers, hints), and the pure part
// of "Najít a nahradit": the same replacement in many topics, made into drafts by work.ts.

/** Fields that are not text for pupils: ids, kinds, widget settings, the emoji. They are never searched or replaced. */
const SKIP = new Set(['id', 'type', 'widget', 'props', 'generator', 'approach', 'format', 'verified', 'emoji'])

export interface TextAt { path: string; text: string }
interface Indexed extends TextAt { folded: string }

/** Every text of a topic a pupil reads, with its path (`questions[2].options[1]`). */
export function textsOf(t: TopicFile): TextAt[] {
  const out: TextAt[] = []
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') { if (path) out.push({ path, text: v }); return }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, path ? `${path}.${k}` : k)
  }
  walk(t, '')
  return out
}

const PART: Record<string, string> = {
  question: 'zadání', options: 'možnost', answers: 'odpověď', answer: 'odpověď', explanation: 'vysvětlení odpovědi', hints: 'nápověda', items: 'položka', pairs: 'dvojice',
  title: 'název', text: 'text', term: 'pojem', definition: 'vysvětlení pojmu', example: 'příklad', wrong: 'špatně', right: 'správně', why: 'proč', head: 'záhlaví', rows: 'tabulka', caption: 'popisek',
}

/** "questions[2].options[1]" → "Otázka 3 · možnost 2". */
export function placeOf(path: string): string {
  let m: RegExpMatchArray | null
  if (path === 'title') return 'Název tématu'
  if ((m = path.match(/^questions\[(\d+)\](?:\.([a-z]+)(?:\[(\d+)\])?)?/i))) return `Otázka ${Number(m[1]) + 1}${m[2] ? ` · ${PART[m[2]] ?? m[2]}${m[3] !== undefined && m[2] !== 'pairs' ? ` ${Number(m[3]) + 1}` : ''}` : ''}`
  if ((m = path.match(/^explanations\[(\d+)\]\.blocks\[(\d+)\]/))) return `Vysvětlení ${Number(m[1]) + 1} · blok ${Number(m[2]) + 1}`
  if ((m = path.match(/^explanations\[(\d+)\]\.title/))) return `Vysvětlení ${Number(m[1]) + 1} · název`
  return path
}

// ——— Matching without regard to case and diacritics, but showing the original text ———

const foldChar = (c: string) => c.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
/** The whole text folded at once: fast, kept per release, used to skip texts without a match. */
const foldAll = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

/** The folded text and, for each of its characters, where it came from in the original. */
function folded(text: string): { f: string; at: number[] } {
  let f = ''
  const at: number[] = []
  let i = 0
  for (const c of text) {
    const x = foldChar(c)
    for (let k = 0; k < x.length; k++) at.push(i)
    f += x
    i += c.length
  }
  at.push(i)
  return { f, at }
}

/** Where `q` is in `text`: exactly (case and diacritics count) or loosely. Ranges in the original text. */
export function findAll(text: string, q: string, exact: boolean): [number, number][] {
  const out: [number, number][] = []
  if (exact) {
    for (let i = text.indexOf(q); i >= 0 && q; i = text.indexOf(q, i + q.length)) out.push([i, i + q.length])
    return out
  }
  const { f, at } = folded(text)
  const fq = [...q].map(foldChar).join('')
  if (!fq) return out
  for (let i = f.indexOf(fq); i >= 0; i = f.indexOf(fq, i + fq.length)) out.push([at[i], at[i + fq.length]])
  return out
}

export interface Hit { path: string; place: string; before: string; match: string; after: string }

const CONTEXT = 60
function hitsIn(texts: Indexed[], q: string, exact: boolean): { hits: Hit[]; count: number } {
  const hits: Hit[] = []
  let count = 0
  const fq = foldAll(q)
  for (const t of texts) {
    // Most texts have no match: the folded copy says so without going through them character by character.
    if (exact ? !t.text.includes(q) : !t.folded.includes(fq)) continue
    for (const [a, b] of findAll(t.text, q, exact)) {
      count++
      if (hits.length < 12) {
        const before = t.text.slice(Math.max(0, a - CONTEXT), a), after = t.text.slice(b, b + CONTEXT)
        hits.push({ path: t.path, place: placeOf(t.path), before: (a > CONTEXT ? '…' : '') + before, match: t.text.slice(a, b), after: after + (b + CONTEXT < t.text.length ? '…' : '') })
      }
    }
  }
  return { hits, count }
}

/** The texts of every published topic, kept until the next release. */
let corpus: { release: number; topics: { key: string; grade: string; subject: string; id: string; title: string; emoji: string; texts: Indexed[] }[] } | undefined
function topics() {
  const release = current()?.release ?? 0
  if (corpus?.release === release) return corpus.topics
  const list: NonNullable<typeof corpus>['topics'] = []
  for (const k of published().keys()) {
    const r = parseKey(k)
    if (r?.kind !== 'topic') continue
    const t = getDoc(k) as TopicFile
    list.push({ key: `${r.grade}/${r.subject}/${r.id}`, grade: r.grade, subject: r.subject, id: r.id, title: t.title, emoji: t.emoji, texts: textsOf(t).map((x) => ({ ...x, folded: foldAll(x.text) })) })
  }
  corpus = { release, topics: list }
  return list
}

export const SEARCH_MAX = 200

/** Topics whose text contains `q` (at least 2 characters), narrowed to a grade and subject. */
export function search(q: unknown, f: { grade: string | null; subject: string | null; exact: boolean }) {
  const text = typeof q === 'string' ? q.trim().replace(/\s+/g, ' ') : ''
  if ([...text].length < 2 || text.length > 100) throw new HttpError(400, 'Hledej 2 až 100 znaků.')
  const out: { key: string; grade: string; subject: string; id: string; title: string; emoji: string; hits: Hit[]; count: number }[] = []
  let total = 0
  for (const t of topics()) {
    if ((f.grade && t.grade !== f.grade) || (f.subject && t.subject !== f.subject)) continue
    const r = hitsIn(t.texts, text, f.exact)
    if (!r.count) continue
    total += r.count
    if (out.length < SEARCH_MAX) out.push({ key: t.key, grade: t.grade, subject: t.subject, id: t.id, title: t.title, emoji: t.emoji, ...r })
  }
  return { q: text, topics: out, matches: total, truncated: out.length >= SEARCH_MAX }
}

/** The topic with every exact occurrence of `find` in its texts replaced, and how many there were. */
export function replaceInTopic(t: TopicFile, find: string, by: string): { topic: TopicFile; n: number } {
  let n = 0
  const walk = (v: unknown, key: string): unknown => {
    if (typeof v === 'string') {
      if (!key || SKIP.has(key) || !v.includes(find)) return v
      n += v.split(find).length - 1
      return v.split(find).join(by)
    }
    if (Array.isArray(v)) return v.map((x) => walk(x, key))
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SKIP.has(k) ? x : walk(x, k)]))
    return v
  }
  const topic = walk(t, '') as TopicFile
  return { topic, n }
}
