import type { GradeId, TopicFile } from '../../../src/content/types'
import { locate, type Issue } from './issues'

// Automatic tips beyond the rules (docs/MODERACE.md, Automatická kontrola): things a careful reviewer would notice –
// a correct option that gives itself away by its length, the same question twice,
// a result that does not add up, typos in spacing and formatting, sentences too long for the grade. They never block
// sending or approving; spelling itself is underlined by the browser in the editor's fields.

export interface Tip extends Issue { tip: true }

const tip = (path: string, cs: string): Tip => ({ path, cs, ...locate(path, cs), tip: true })

/** Texts a pupil reads (no ids, widget settings or emoji), with their paths. */
function texts(t: TopicFile): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = []
  const skip = new Set(['id', 'type', 'widget', 'props', 'generator', 'approach', 'format', 'verified', 'emoji'])
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') { if (path) out.push({ path, text: v }); return }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!skip.has(k)) walk(x, path ? `${path}.${k}` : k)
  }
  walk(t, '')
  return out
}

const norm = (s: string) => s.toLowerCase().replace(/[*`_~]/g, '').replace(/\s+/g, ' ').replace(/[\s.?!:]+$/, '').trim()

/** Words per sentence a pupil of the grade still reads comfortably. */
function sentenceLimit(g: GradeId): number {
  if (/^z[1-3]$/.test(g)) return 16
  if (/^z[45]$/.test(g)) return 20
  if (/^z[6-9]$/.test(g)) return 26
  return 32
}

// ——— Arithmetic in a question: "Kolik je 12 · 3 + 4?" ———

// A fraction (2/3) is one number; the en dash is a range in Czech ("1–5"), never a minus.
// Thousands are grouped by a space ("2 025").
const NUM = String.raw`(?:\d{1,3}(?: \d{3})+|\d+)(?:[,.]\d+)?(?:\s*\/\s*\d+)?`
// × is a dimension in Czech ("30 × 120 mm"); multiplication is ·.
const OP = String.raw`[+\-−·*:]`
const EXPR = new RegExp(String.raw`(?:${NUM}\s*${OP}\s*)+${NUM}`, 'g')

const num = (s: string) => {
  const [a, b] = s.replace(/(\d) (?=\d{3})/g, '$1').split('/')
  return b === undefined ? Number(a.replace(',', '.')) : Number(a.replace(',', '.')) / Number(b)
}

/** Evaluates numbers with + − · : (usual precedence); undefined when it is not plain arithmetic. */
export function evaluate(expr: string): number | undefined {
  const tokens = expr.match(new RegExp(`${NUM}|${OP}`, 'g'))
  if (!tokens || tokens.length < 3 || tokens.length % 2 === 0) return undefined
  const terms: number[] = [num(tokens[0])]
  const signs: number[] = [1]
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], b = num(tokens[i + 1])
    if (/[+]/.test(op)) { terms.push(b); signs.push(1) }
    else if (/[\-−]/.test(op)) { terms.push(b); signs.push(-1) }
    else if (/[·*]/.test(op)) terms[terms.length - 1] *= b
    else { if (b === 0) return undefined; terms[terms.length - 1] /= b }
  }
  const v = terms.reduce((s, t, i) => s + signs[i] * t, 0)
  return Number.isFinite(v) ? v : undefined
}

/** The number an answer starts with ("36 cm", "3/4", "−2,5"); undefined for words. */
function answerNumber(a: string): number | undefined {
  const s = a.replace(/[*`]/g, '').trim()
  let m: RegExpMatchArray | null
  if ((m = s.match(/^([\-−]?\d+)\s*\/\s*(\d+)$/))) return Number(m[2]) ? num(m[1].replace('−', '-')) / Number(m[2]) : undefined
  if ((m = s.match(/^([\-−]?\d+(?:[,.]\d+)?)(?:\s*[a-zA-Zá-žÁ-Ž°%²³]+\.?)?$/))) return num(m[1].replace('−', '-'))
  return undefined
}

/** The single arithmetic expression a question asks to compute, if it is clearly one. */
function asked(question: string): number | undefined {
  // Code (`x * 2`) is not arithmetic for pupils; a series ("1 + 2 + … + 100") or |absolute value| is not plain arithmetic.
  const plain = question.replace(/`[^`]*`/g, ' ').replace(/\*/g, '')
  if (!/[=?]|kolik|vypočítej|spočítej|vypočti|spočti/i.test(plain) || /[…|]/.test(plain) || /zbyt|celý podíl|celých|zaokrouhl/i.test(plain)) return undefined
  const all = [...plain.matchAll(EXPR)]
  if (all.length !== 1) return undefined
  const m = all[0], before = plain[m.index! - 1] ?? ' ', after = plain[m.index! + m[0].length] ?? ' '
  // A sign, bracket, power, letter or unit right next to it means it is not the whole expression.
  if (/[\-−–(^\p{L}\d,./]/u.test(before) || /[)^²³⁰-⁹⁻\p{L}\d]/u.test(after) || /^\s*[%°⁰-⁹⁻]/.test(plain.slice(m.index! + m[0].length))) return undefined
  // An operator spaced on one side only is a sign ("60 +0,03"); "3000:80" or "10:30" is a port or a time.
  if (/\s[+\-−·:]\S|\S[+\-−·:]\s|\d:\d|\d-\d/.test(m[0])) return undefined
  // It has to be what the question asks for: "12 · 3 =", "… 12 · 3?" or "Kolik je 12 · 3", not "30 = 2 · 3 · 5. Kolik je…".
  const rest = plain.slice(m.index! + m[0].length).trim(), lead = plain.slice(0, m.index!)
  if (!/^([=?]|$)/.test(rest) && !/(kolik je|vypočítej|spočítej|vypočti|spočti)[\s:]*$/i.test(lead)) return undefined
  if (/=\s*$/.test(lead)) return undefined
  // "1 : 50" is a scale or a ratio, not a division to compute.
  if (/^[\d\s,.]+:[\d\s,.]+$/.test(m[0]) && /měřít|poměr|mapa|mapě/i.test(plain)) return undefined
  if (/[a-z]\s*[=]/i.test(plain) || /\d\s*[a-z]\b/i.test(plain.slice(m.index! + m[0].length, m.index! + m[0].length + 3))) return undefined
  return evaluate(m[0])
}

const show = (v: number) => (Math.round(v * 1e6) / 1e6).toLocaleString('cs')

export function qualityTips(t: TopicFile, grade: GradeId, subject = ''): Tip[] {
  const french = subject === 'francouzstina'
  const out: Tip[] = []
  const qs = (t.questions ?? []).filter((q) => q && typeof q === 'object')

  // The same question twice (same wording and the same options or answers).
  const seen = new Map<string, number>()
  qs.forEach((q, i) => {
    const { question, explanation: _, hints: __, ...rest } = q as typeof q & { explanation?: string; hints?: string[] }
    const k = question ? `${norm(question)}|${JSON.stringify(rest)}` : ''
    if (!k) return
    if (seen.has(k)) out.push(tip(`questions[${i}].question`, `Stejné zadání jako otázka ${seen.get(k)! + 1}.`))
    else seen.set(k, i)
  })

  // A correct option that gives itself away by its length (the app shuffles the order of options, not their length).
  const choices = qs.map((q, i) => ({ q, i })).filter(({ q }) => q.type === 'choice' && Array.isArray(q.options) && q.options.length >= 3)
  for (const { q, i } of choices) {
    if (q.type !== 'choice') continue
    const right = q.options[q.answer] ?? '', others = q.options.filter((_, k) => k !== q.answer)
    const longest = Math.max(...others.map((o) => o.length))
    if (right.length >= 30 && right.length > 2.2 * longest) out.push(tip(`questions[${i}].options[${q.answer}]`, 'Správná možnost je mnohem delší než ostatní, tím se prozrazuje.'))
  }
  const tf = qs.filter((q) => q.type === 'truefalse')
  if (tf.length >= 4 && tf.every((q) => q.type === 'truefalse' && q.answer === (tf[0] as { answer: boolean }).answer)) {
    out.push(tip('questions', `Všech ${tf.length} otázek pravda/nepravda má odpověď „${(tf[0] as { answer: boolean }).answer ? 'pravda' : 'nepravda'}“. Přidej i opačné.`))
  }

  // Results that do not add up.
  qs.forEach((q, i) => {
    if (q.type !== 'input' && q.type !== 'choice') return
    const v = asked(q.question ?? '')
    if (v === undefined) return
    const given = q.type === 'input' ? (q.answers ?? []).map((a) => answerNumber(String(a))) : [answerNumber(String(q.options?.[q.answer] ?? ''))]
    if (!given.length || given.some((x) => x === undefined)) return
    if (!given.some((x) => Math.abs(x! - v) < 1e-9 * Math.max(1, Math.abs(v)))) {
      out.push(tip(q.type === 'input' ? `questions[${i}].answers` : `questions[${i}].options[${q.answer}]`, `Spočítal jsem ${show(v)}, ale správná odpověď je ${q.type === 'input' ? q.answers[0] : q.options[q.answer]}. Zkontroluj výsledek.`))
    }
  })

  // Spacing, formatting and sentence length in every text.
  const limit = sentenceLimit(grade)
  for (const { path, text } of texts(t)) {
    const problems: string[] = []
    if (/\S {2,}\S/.test(text)) problems.push('dvě mezery za sebou')
    // "je je" and "se se" are good Czech ("Poznat je je těžké"); longer words twice in a row are a slip.
    const rep = text.replace(/`[^`]*`/g, ' ').match(/(?<!\p{L})(\p{L}{3,})\s+\1(?!\p{L})/u)
    if (rep && !/^(tak|ten|tam)$/i.test(rep[1])) problems.push(`dvakrát „${rep[1]}“`)
    // French puts a space before ? ! ; – only Czech-like texts are checked.
    if (!french && /\p{L} [,;!?](?=\s|$)/u.test(text)) problems.push('mezera před interpunkcí')
    if (/\p{Ll}{2}[,;]\p{Ll}{2}/u.test(text.replace(/`[^`]*`/g, ''))) problems.push('chybí mezera za čárkou')
    if ((text.replace(/`[^`]*`/g, '').match(/\*\*/g)?.length ?? 0) % 2) problems.push('neuzavřené tučné písmo (**)')
    if ((text.match(/`/g)?.length ?? 0) % 2) problems.push('neuzavřený vzorec (`)')
    // Items of an ordering question may split one quoted sentence.
    if (!/\.items\[\d+\]$/.test(path) && (text.match(/„/g)?.length ?? 0) !== (text.match(/“/g)?.length ?? 0)) problems.push('neuzavřené uvozovky „“')
    if (problems.length) out.push(tip(path, `Překlep: ${problems.join(', ')}.`))
    if (/^(explanations\[\d+\]\.blocks\[\d+\]\.(text|definition|why|items\[\d+\])|questions\[\d+\]\.question)$/.test(path)) {
      const long = text.replace(/[*`_]/g, '').split(/(?<=[.!?])\s+/).map((s) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length).reduce((a, b) => Math.max(a, b), 0)
      if (long > limit) out.push(tip(path, `Dlouhá věta (${long} slov). Pro tenhle ročník raději do ${limit}, rozděl ji.`))
    }
  }
  return out
}
