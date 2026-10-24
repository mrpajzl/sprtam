// Validates all content files: npm run check:content [-- path-filter]
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Subject, Block, Question } from '../src/content/types'
import { GENERATOR_NAMES } from '../src/quiz/generators'
import { GRADE_SUBJECTS } from '../src/content/curriculum'
import type { VocabSet } from '../src/vocab/types'

const WIDGETS = ['counter', 'numberline', 'fraction', 'placevalue', 'clock', 'multiply', 'balance', 'angle', 'pythagoras', 'linear', 'quadratic', 'percent', 'shape', 'timeline', 'flip', 'sort', 'cycle', 'parts', 'gap', 'bars']
const filter = process.argv[2] ?? ''
const root = join(import.meta.dirname, '..', 'src')
const errors: string[] = []
let topics = 0, questions = 0

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [] })
}

function checkBlock(b: Block, where: string) {
  const e = (m: string) => errors.push(`${where}: ${m}`)
  switch (b.t) {
    case 'h': case 'p': case 'key': if (!b.text) e('empty text'); break
    case 'term': if (!b.term || !b.def) e('term needs term and def'); break
    case 'mistake': if (!b.wrong || !b.right || !b.why) e('mistake needs wrong, right and why'); break
    case 'list': case 'steps': if (!b.items?.length) e('empty items'); break
    case 'example': if (!b.q || !b.a) e('example needs q and a'); break
    case 'table': if (!b.rows?.every((r) => r.length === b.head.length)) e('table row width != head'); break
    case 'pic': if (!b.items?.length) e('empty pic'); break
    case 'w': {
      if (!WIDGETS.includes(b.w)) e(`unknown widget ${b.w}`)
      const p: any = b.p
      if (!p) { e('widget without p'); break }
      if (b.w === 'sort' && !p.items.every((i: any) => i.b >= 0 && i.b < p.buckets.length)) e('sort bucket index out of range')
      if (b.w === 'gap' && !p.items.every((i: any) => i.a >= 0 && i.a < i.options.length)) e('gap answer out of range')
      if (b.w === 'fraction' && !(p.d > 0 && p.n >= 0)) e('bad fraction')
      if (b.w === 'flip' && !p.cards?.length) e('flip without cards')
      break
    }
    default: e(`unknown block ${(b as any).t}`)
  }
}

function checkQ(q: Question, where: string) {
  const e = (m: string) => errors.push(`${where}: ${m}`)
  if (!q.q) e('empty question')
  switch (q.t) {
    case 'choice':
      if (q.o.length < 2 || q.o.length > 4) e('choice needs 2–4 options')
      if (!(q.a >= 0 && q.a < q.o.length)) e('choice answer out of range')
      if (new Set(q.o).size !== q.o.length) e('duplicate options')
      break
    case 'tf': if (typeof q.a !== 'boolean') e('tf needs boolean'); break
    case 'input': if (!Array.isArray(q.a) || !q.a.length) e('input needs a: string[]'); break
    case 'order': if (q.items.length < 3) e('order needs ≥ 3 items'); break
    case 'pair': if (q.pairs.length < 3) e('pair needs ≥ 3 pairs'); break
    case 'open': if (!q.a) e('open needs a'); break
    default: e(`unknown question ${(q as any).t}`)
  }
}

for (const file of walk(join(root, 'content', 'data')).filter((f) => f.includes(filter))) {
  const rel = relative(root, file)
  let s: Subject
  try { s = (await import(pathToFileURL(file).href)).default } catch (err) { errors.push(`${rel}: import failed ${err}`); continue }
  const [, , grade, name] = rel.split('/')
  if (s.grade !== grade) errors.push(`${rel}: grade ${s.grade} != folder ${grade}`)
  if (`${s.subject}.ts` !== name) errors.push(`${rel}: subject ${s.subject} != file name`)
  if (!GRADE_SUBJECTS[s.grade]?.includes(s.subject)) errors.push(`${rel}: subject not in GRADE_SUBJECTS`)
  const ids = new Set<string>()
  for (const t of s.topics) {
    topics++
    const w = `${rel}#${t.id}`
    if (ids.has(t.id)) errors.push(`${w}: duplicate id`); ids.add(t.id)
    if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`${w}: id must be kebab-case ascii`)
    if (!t.title || !t.emoji) errors.push(`${w}: title/emoji missing`)
    if (t.ex?.length !== 2) errors.push(`${w}: needs exactly 2 explanations`)
    t.ex?.forEach((x, i) => { if (!x.title || !x.blocks.length) errors.push(`${w} ex${i}: empty`); x.blocks.forEach((b, j) => checkBlock(b, `${w} ex${i}[${j}]`)) })
    // Depth: every explanation must stand on its own and start from zero (docs/CONTENT.md).
    t.ex?.forEach((x, i) => {
      const e = (m: string) => errors.push(`${w} ex${i}: ${m}`)
      const has = (k: string) => x.blocks.some((b) => b.t === k)
      if (x.blocks.length < 8) e(`too shallow (${x.blocks.length} blocks, need ≥ 8)`)
      if (x.blocks[0]?.t !== 'h' || x.blocks[1]?.t !== 'p') e('must start with h "O čem to je" + p')
      if (!has('term')) e('no term block – new terms must be explained')
      if (!has('key')) e('no key summary')
      if (!has('example') && !has('steps') && !has('w')) e('needs an example, steps or a widget')
    })
    if (!t.ex?.some((x) => x.blocks.some((b) => b.t === 'mistake'))) errors.push(`${w}: needs a mistake block`)
    if (t.gen && !GENERATOR_NAMES.includes(t.gen)) errors.push(`${w}: unknown gen ${t.gen}`)
    if ((t.qs?.length ?? 0) < 8) errors.push(`${w}: needs ≥ 8 questions (has ${t.qs?.length ?? 0})`)
    if (!t.qs?.some((q) => q.t === 'open')) errors.push(`${w}: needs ≥ 1 open question`)
    t.qs?.forEach((q, i) => { questions++; checkQ(q, `${w} q${i}`) })
  }
}

for (const file of walk(join(root, 'vocab', 'data')).filter((f) => f.includes(filter))) {
  const rel = relative(root, file)
  const v: VocabSet = (await import(pathToFileURL(file).href)).default
  for (const g of v.groups) for (const w of g.words) {
    if (w.length !== 4 || w.some((x) => !x)) errors.push(`${rel} ${g.name}: bad word ${JSON.stringify(w)}`)
    else if (new Set(w.slice(1).map((x) => x.toLowerCase())).size !== 3) errors.push(`${rel} ${g.name}: distractor equals answer ${JSON.stringify(w)}`)
  }
}

// Every subject listed in the curriculum must have a file (guards against content missing from a build).
if (!filter) for (const [g, subs] of Object.entries(GRADE_SUBJECTS)) for (const s of subs) if (!existsSync(join(root, 'content', 'data', g, `${s}.ts`))) errors.push(`missing content file data/${g}/${s}.ts`)
for (const l of ['a1', 'a2', 'b1', 'b2', 'c1']) if (!filter && !existsSync(join(root, 'vocab', 'data', `${l}.ts`))) errors.push(`missing vocab/data/${l}.ts`)

console.log(`${topics} topics, ${questions} questions, ${errors.length} errors`)
for (const e of errors.slice(0, 200)) console.log('✗', e)
process.exit(errors.length ? 1 : 0)
