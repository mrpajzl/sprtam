import type { Explanation, Question, TopicFile } from './types'

// Differences between two versions of content, for people: which blocks and questions were added,
// removed or changed, and inside changed text which words. Pure functions, shared by the moderation
// app (review, history) and the server (summaries).

export type Op<T> =
  | { op: 'same'; a: T; b: T; ai: number; bi: number }
  | { op: 'mod'; a: T; b: T; ai: number; bi: number }
  | { op: 'add'; b: T; bi: number }
  | { op: 'del'; a: T; ai: number }

const json = (x: unknown) => JSON.stringify(x)

/** Longest common subsequence of a and b by key: pairs of matching indexes, in order. */
function lcs(a: string[], b: string[]): [number, number][] {
  const n = a.length, m = b.length
  // Common prefix and suffix first: most edits touch a few items in the middle.
  let pre = 0
  while (pre < n && pre < m && a[pre] === b[pre]) pre++
  let suf = 0
  while (suf < n - pre && suf < m - pre && a[n - 1 - suf] === b[m - 1 - suf]) suf++
  const A = a.slice(pre, n - suf), B = b.slice(pre, m - suf)
  const out: [number, number][] = []
  for (let i = 0; i < pre; i++) out.push([i, i])
  if (A.length && B.length) {
    // Lists here are short (blocks, questions, words of a group); beyond this size a plain replace is fine.
    if (A.length * B.length <= 4_000_000) {
      const w = B.length + 1
      const t = new Uint32Array((A.length + 1) * w)
      for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) {
        t[i * w + j] = A[i] === B[j] ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1])
      }
      for (let i = 0, j = 0; i < A.length && j < B.length;) {
        if (A[i] === B[j]) { out.push([pre + i, pre + j]); i++; j++ } else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) i++; else j++
      }
    }
  }
  for (let i = 0; i < suf; i++) out.push([n - suf + i, m - suf + i])
  return out
}

/**
 * Operations turning list a into list b. Items equal by `key` are `same`; between them, removed and added
 * items that are `similar` (e.g. a block of the same type at the same place) pair up as `mod`.
 */
export function diffList<T>(a: readonly T[], b: readonly T[], similar: (x: T, y: T) => boolean = () => false, key: (x: T) => string = json): Op<T>[] {
  const ka = a.map(key), kb = b.map(key)
  const pairs = lcs(ka, kb)
  const out: Op<T>[] = []
  let i = 0, j = 0
  const gap = (ie: number, je: number) => {
    const dels: number[] = [], adds: number[] = []
    for (; i < ie; i++) dels.push(i)
    for (; j < je; j++) adds.push(j)
    // Removed and added items at the same place: a change when they are similar, else the old one out and the new one in.
    for (let p = 0; p < Math.max(dels.length, adds.length); p++) {
      const x = dels[p], y = adds[p]
      if (x !== undefined && y !== undefined && similar(a[x], b[y])) { out.push({ op: 'mod', a: a[x], b: b[y], ai: x, bi: y }); continue }
      if (x !== undefined) out.push({ op: 'del', a: a[x], ai: x })
      if (y !== undefined) out.push({ op: 'add', b: b[y], bi: y })
    }
  }
  for (const [pi, pj] of pairs) {
    gap(pi, pj)
    out.push({ op: 'same', a: a[pi], b: b[pj], ai: pi, bi: pj })
    i = pi + 1; j = pj + 1
  }
  gap(a.length, b.length)
  return out
}

// ——— Text ———

export interface Seg { t: 'same' | 'add' | 'del'; s: string }

const TOKEN = /\s+|[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu

/** Word-level difference of two texts. */
export function diffText(a: string, b: string): Seg[] {
  if (a === b) return a ? [{ t: 'same', s: a }] : []
  const ta = a.match(TOKEN) ?? [], tb = b.match(TOKEN) ?? []
  if (ta.length * tb.length > 1_000_000) return [...(a ? [{ t: 'del' as const, s: a }] : []), ...(b ? [{ t: 'add' as const, s: b }] : [])]
  const out: Seg[] = []
  const push = (t: Seg['t'], s: string) => { const last = out[out.length - 1]; if (last?.t === t) last.s += s; else out.push({ t, s }) }
  let i = 0, j = 0
  for (const [pi, pj] of lcs(ta, tb)) {
    // Removed words first, then added ones: reads as "old → new".
    for (; i < pi; i++) push('del', ta[i])
    for (; j < pj; j++) push('add', tb[j])
    push('same', ta[pi]); i = pi + 1; j = pj + 1
  }
  for (; i < ta.length; i++) push('del', ta[i])
  for (; j < tb.length; j++) push('add', tb[j])
  return joinChanges(out)
}

/**
 * "a b c" → "x y z" would read as a, x, space, b, y, space…: a lone space kept between two changes only
 * breaks them up. Such spaces become part of both the removed and the added text, so each reads as a whole.
 */
function joinChanges(segs: Seg[]): Seg[] {
  const out: Seg[] = []
  let del = '', add = ''
  const flush = () => { if (del) out.push({ t: 'del', s: del }); if (add) out.push({ t: 'add', s: add }); del = add = '' }
  segs.forEach((s, k) => {
    const inGap = s.t === 'same' && /^\s+$/.test(s.s) && (del || add) && segs.slice(k + 1).find((x) => x.t !== 'same' || !/^\s+$/.test(x.s))?.t !== 'same'
    if (s.t === 'del') del += s.s
    else if (s.t === 'add') add += s.s
    else if (inGap && k < segs.length - 1) { del += s.s; add += s.s }
    else { flush(); out.push(s) }
  })
  flush()
  return out
}

// ——— Topics ———

export interface FieldChange { field: 'title' | 'emoji' | 'generator' | 'approach'; a?: string; b?: string }

export interface TopicDiff {
  fields: FieldChange[]
  /** Explanations; a `mod` explanation has its blocks diffed with diffBlocks. */
  explanations: Op<Explanation>[]
  questions: Op<Question>[]
  /** Counts of changed things, for a one-line summary. */
  stats: { added: number; removed: number; changed: number }
}

/** Blocks of an explanation: a changed block is one of the same type at the same place. */
export const diffBlocks = (a: Explanation['blocks'], b: Explanation['blocks']) => diffList(a, b, (x, y) => x.type === y.type)

/** Two versions of a topic (`a` null = a new topic). */
export function diffTopic(a: TopicFile | null, b: TopicFile): TopicDiff {
  const fields: FieldChange[] = []
  for (const f of ['title', 'emoji', 'generator', 'approach'] as const) if ((a?.[f] ?? undefined) !== (b[f] ?? undefined)) fields.push({ field: f, a: a?.[f], b: b[f] })
  const explanations = diffList(a?.explanations ?? [], b.explanations, (x, y) => (x.approach ?? '') === (y.approach ?? ''))
  const questions = diffList(a?.questions ?? [], b.questions, (x, y) => x.type === y.type)
  const stats = { added: 0, removed: 0, changed: fields.length }
  const count = (ops: Op<unknown>[]) => { for (const o of ops) if (o.op === 'add') stats.added++; else if (o.op === 'del') stats.removed++; else if (o.op === 'mod') stats.changed++ }
  for (const o of explanations) {
    if (o.op === 'mod') count(diffBlocks(o.a.blocks, o.b.blocks))
    else if (o.op === 'add') stats.added += o.b.blocks.length
    else if (o.op === 'del') stats.removed += o.a.blocks.length
  }
  count(questions)
  return { fields, explanations, questions, stats }
}

export const sameDoc = (a: unknown, b: unknown) => json(a) === json(b)

// ——— Any document (vocabulary, plans of approaches, topic lists) ———

export interface JsonChange { path: string; op: 'add' | 'del' | 'mod'; a?: unknown; b?: unknown }

/** Items of a list that are "the same thing" although changed: same id / name / en. */
const ident = (x: unknown) => (x && typeof x === 'object' && !Array.isArray(x) ? ['id', 'en', 'name', 'cz'].map((k) => (x as Record<string, unknown>)[k]).find((v) => typeof v === 'string') : undefined)

/** Changed leaves of two JSON values, with readable paths (groups[2].words[5].en). */
export function diffJson(a: unknown, b: unknown, path = '', out: JsonChange[] = []): JsonChange[] {
  if (json(a) === json(b)) return out
  if (Array.isArray(a) && Array.isArray(b)) {
    for (const o of diffList(a, b, (x, y) => ident(x) !== undefined && ident(x) === ident(y))) {
      if (o.op === 'add') out.push({ path: `${path}[${o.bi}]`, op: 'add', b: o.b })
      else if (o.op === 'del') out.push({ path: `${path}[${o.ai}]`, op: 'del', a: o.a })
      else if (o.op === 'mod') diffJson(o.a, o.b, `${path}[${o.bi}]`, out)
    }
    return out
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ao = a as Record<string, unknown>, bo = b as Record<string, unknown>
    for (const k of new Set([...Object.keys(ao), ...Object.keys(bo)])) {
      const p = path ? `${path}.${k}` : k
      if (!(k in bo)) out.push({ path: p, op: 'del', a: ao[k] })
      else if (!(k in ao)) out.push({ path: p, op: 'add', b: bo[k] })
      else diffJson(ao[k], bo[k], p, out)
    }
    return out
  }
  out.push({ path, op: 'mod', a, b })
  return out
}
