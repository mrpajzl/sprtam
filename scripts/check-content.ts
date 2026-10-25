// Validates all content: npm run check:content [-- path-filter]
//   1. layout of content/ (every curriculum subject present, every topic listed exactly once, file name = id)
//   2. every file against the format (src/content/format.ts), widget props against each widget's schema and rules
//   3. authoring rules from docs/CONTENT.md (two explanations from zero, enough questions…)
//   4. canonical formatting (npm run content:format) and generated files up to date (npm run content:generate)
//   5. the widget registry (every widget file registered, examples valid)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { CONTENT, ROOT, TOPICS, VOCAB } from '../plugins/content'
import { GRADE_SUBJECTS } from '../src/content/curriculum'
import { BLOCK_EXAMPLES, QUESTION_EXAMPLES } from '../src/content/examples'
import { block, LEVELS, question, subjectFile, topicFile, vocabFile } from '../src/content/format'
import { validate, type S } from '../src/content/schema'
import type { Block, Question, SubjectFile, TopicFile, VocabFile } from '../src/content/types'
import { GENERATOR_NAMES } from '../src/quiz/generators'
import { WIDGETS } from '../src/widgets'
import type { WidgetRef } from '../src/widgets'
import { generated } from './content-generate'

const filter = process.argv[2] ?? ''
const errors: string[] = []
let topics = 0, questions = 0, words = 0
const err = (where: string, m: string) => errors.push(`${where}: ${m}`)
const rel = (f: string) => relative(ROOT, f)
const ls = (d: string) => (existsSync(d) ? readdirSync(d).sort() : [])
const isDir = (p: string) => statSync(p).isDirectory()

/** Parses a content file, checks its formatting, $schema and format; null when it is not valid JSON. */
function load<T>(file: string, schema: S, schemaPath: string): T | null {
  const where = rel(file)
  let text: string, data: unknown
  try { text = readFileSync(file, 'utf8'); data = JSON.parse(text) } catch (e) { err(where, `not valid JSON: ${(e as Error).message}`); return null }
  const issues = validate(schema, data)
  for (const i of issues.slice(0, 20)) err(where, `${i.path}: ${i.message}`)
  if (issues.length > 20) err(where, `… and ${issues.length - 20} more format errors`)
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const d = data as { $schema?: string }
  if (d.$schema !== schemaPath) err(where, `"$schema" must be "${schemaPath}"`)
  if (text !== JSON.stringify(data, null, 2) + '\n') err(where, 'not formatted – run npm run content:format')
  return data as T
}

/** Content rules also run on files with format errors (to report everything at once); a crash there only means the format is broken. */
const rules = (where: string, f: () => void) => { const n = errors.length; try { f() } catch { if (errors.length === n) err(where, 'cannot check the rules until the format errors are fixed') } }

// ——— Widgets ———

function checkWidget(w: WidgetRef, where: string) {
  const def = WIDGETS[w.widget]
  if (!def) return // already reported by the format check
  for (const m of def.check?.(w.props as never) ?? []) err(where, `widget ${w.widget}: ${m}`)
}

// ——— Topics ———

function checkBlock(b: Block, where: string) {
  if (b.type === 'table' && !b.rows.every((r) => r.length === b.head.length)) err(where, 'table row width differs from head')
  if (b.type === 'widget') checkWidget(b, where)
  if (b.type === 'example' && b.widget) checkWidget(b.widget, where)
}

function checkQuestion(q: Question, where: string) {
  switch (q.type) {
    case 'choice':
      if (q.answer >= q.options.length) err(where, 'choice answer out of range')
      if (new Set(q.options).size !== q.options.length) err(where, 'duplicate options')
      break
    case 'input':
      if (q.widget) {
        checkWidget(q.widget, where)
        for (const m of WIDGETS[q.widget.widget]?.checkQuestion?.(q.widget.props as never, q.answers) ?? []) err(where, `widget ${q.widget.widget}: ${m}`)
      }
      break
  }
}

function checkTopic(t: TopicFile, where: string) {
  t.explanations.forEach((x, i) => {
    const w = `${where} explanations[${i}]`
    x.blocks.forEach((b, j) => checkBlock(b, `${w}.blocks[${j}]`))
    // Depth: every explanation must stand on its own and start from zero (docs/CONTENT.md).
    const has = (k: Block['type']) => x.blocks.some((b) => b.type === k)
    if (x.blocks.length < 8) err(w, `too shallow (${x.blocks.length} blocks, need ≥ 8)`)
    if (x.blocks[0]?.type !== 'heading' || x.blocks[1]?.type !== 'text') err(w, 'must start with a heading ("O čem to je") and a text')
    if (!has('term')) err(w, 'no term block – new terms must be explained')
    if (!has('summary')) err(w, 'no summary')
    if (!has('example') && !has('steps') && !has('widget')) err(w, 'needs an example, steps or a widget')
  })
  if (!t.explanations.some((x) => x.blocks.some((b) => b.type === 'mistake'))) err(where, 'needs a mistake block')
  if (t.generator && !GENERATOR_NAMES.includes(t.generator)) err(where, `unknown generator ${t.generator} (src/quiz/generators.ts)`)
  if (!t.questions.some((q) => q.type === 'open')) err(where, 'needs ≥ 1 open question')
  t.questions.forEach((q, i) => { questions++; checkQuestion(q, `${where} questions[${i}]`) })
}

for (const g of ls(TOPICS)) {
  if (!isDir(join(TOPICS, g))) { err(rel(join(TOPICS, g)), 'unexpected file'); continue }
  if (!(g in GRADE_SUBJECTS)) { err(rel(join(TOPICS, g)), 'unknown grade (src/content/curriculum.ts)'); continue }
  for (const s of ls(join(TOPICS, g))) {
    const dir = join(TOPICS, g, s)
    if (!isDir(dir)) { err(rel(dir), 'unexpected file'); continue }
    if (filter && !ls(dir).some((f) => rel(join(dir, f)).includes(filter))) continue
    if (!GRADE_SUBJECTS[g as keyof typeof GRADE_SUBJECTS].includes(s as never)) err(rel(dir), 'subject not in GRADE_SUBJECTS for this grade (src/content/curriculum.ts)')
    const listFile = join(dir, '_subject.json')
    if (!existsSync(listFile)) { err(rel(dir), 'missing _subject.json'); continue }
    const list = load<SubjectFile>(listFile, subjectFile, '../../../schema/subject.schema.json')
    const ids = Array.isArray(list?.topics) ? list.topics : []
    const listed = new Set(ids)
    if (listed.size !== ids.length) err(rel(listFile), 'a topic is listed twice')
    for (const f of ls(dir)) {
      if (f === '_subject.json') continue
      const file = join(dir, f)
      const where = rel(file)
      if (!f.endsWith('.json')) { err(where, 'unexpected file (only .json)'); continue }
      const id = f.slice(0, -5)
      if (!rel(file).includes(filter)) continue
      if (ids.length && !listed.has(id)) err(where, 'not listed in _subject.json')
      const t = load<TopicFile>(file, topicFile, '../../../schema/topic.schema.json')
      topics++
      if (!t) continue
      if (t.id !== id) err(where, `id "${t.id}" differs from the file name`)
      rules(where, () => checkTopic(t, where))
    }
    for (const id of listed) if (!existsSync(join(dir, `${id}.json`))) err(rel(listFile), `lists "${id}" but ${id}.json does not exist`)
  }
}

// Every subject listed in the curriculum must have its content (guards against content missing from a build).
if (!filter) for (const [g, subs] of Object.entries(GRADE_SUBJECTS)) for (const s of subs) {
  if (!existsSync(join(TOPICS, g, s, '_subject.json'))) errors.push(`missing content/topics/${g}/${s}/_subject.json`)
}

// ——— Vocabulary ———

const english = new Map<string, string>()
for (const l of LEVELS) {
  const file = join(VOCAB, `${l.toLowerCase()}.json`)
  if (!rel(file).includes(filter) && filter) continue
  if (!existsSync(file)) { errors.push(`missing ${rel(file)}`); continue }
  const v = load<VocabFile>(file, vocabFile, '../schema/vocab.schema.json')
  if (!v) continue
  if (v.level !== l) err(rel(file), `level ${v.level} differs from the file name`)
  rules(rel(file), () => { for (const g of v.groups) for (const w of g.words) {
    words++
    const where = `${rel(file)} ${g.name} "${w.cz}"`
    if (new Set([w.en, w.similar, w.related].map((x) => x.toLowerCase())).size !== 3) err(where, 'similar/related must differ from each other and from en')
    // Progress is stored by the English word: it must be unique across all levels.
    const key = w.en.toLowerCase()
    if (english.has(key)) err(where, `"${w.en}" is already in ${english.get(key)}`)
    english.set(key, `${l} ${g.name}`)
  } })
}
for (const f of ls(VOCAB)) if (!LEVELS.some((l) => `${l.toLowerCase()}.json` === f)) err(rel(join(VOCAB, f)), 'unexpected file')
for (const f of ls(CONTENT)) if (!['topics', 'vocab', 'schema', 'README.md'].includes(f)) err(rel(join(CONTENT, f)), 'unexpected file')

// ——— Widget registry ———

const widgetDir = join(ROOT, 'src', 'widgets')
for (const f of ls(widgetDir)) {
  if (!f.endsWith('.tsx') || f === 'kit.tsx' || f === 'index.tsx') continue
  const name = f.slice(0, -4)
  if (!WIDGETS[name]) err(`src/widgets/${f}`, 'widget not registered in src/widgets/index.tsx (or its name differs from the file name)')
}
for (const w of Object.values(WIDGETS)) {
  const where = `src/widgets/${w.name}.tsx`
  if (!/^[a-z]+(-[a-z]+)*$/.test(w.name)) err(where, 'name must be kebab-case')
  if (!w.examples.length) err(where, 'needs at least one example')
  w.examples.forEach((x, i) => {
    for (const issue of validate(w.props, x.props)) err(`${where} examples[${i}]`, `${issue.path}: ${issue.message}`)
    for (const m of w.check?.(x.props) ?? []) err(`${where} examples[${i}]`, m)
  })
  for (const [k, f] of Object.entries(w.props.fields)) if (!f.description) err(where, `prop "${k}" has no description`)
}

for (const [k, b] of Object.entries(BLOCK_EXAMPLES)) for (const i of validate(block, b)) err(`src/content/examples.ts block ${k}`, `${i.path}: ${i.message}`)
for (const [k, q] of Object.entries(QUESTION_EXAMPLES)) for (const i of validate(question, q)) err(`src/content/examples.ts question ${k}`, `${i.path}: ${i.message}`)

// ——— Generated files ———

if (!filter) for (const [path, text] of Object.entries(generated())) {
  const file = join(ROOT, path)
  if (!existsSync(file) || readFileSync(file, 'utf8') !== text) errors.push(`${path} is out of date – run npm run content:generate`)
}

console.log(`${topics} topics, ${questions} questions, ${words} words, ${Object.keys(WIDGETS).length} widgets, ${errors.length} errors`)
for (const e of errors.slice(0, 200)) console.log('✗', e)
if (errors.length > 200) console.log(`… and ${errors.length - 200} more`)
process.exit(errors.length ? 1 : 0)
