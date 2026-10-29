// Validates all content: npm run check:content [-- path-filter]
//   1. every file: valid JSON, the right "$schema", canonical formatting (npm run content:format)
//   2. the documents together (src/content/check.ts – the same check the content service runs before publishing):
//      format, authoring rules from docs/CONTENT.md, every topic listed once, plans of approaches, unique words
//   3. generated files up to date (npm run content:generate) and the widget registry (every widget registered, examples valid)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { CONTENT, ROOT } from '../plugins/content'
import { checkSnapshot } from '../src/content/check'
import { GRADE_SUBJECTS, ODB } from '../src/content/curriculum'
import { ID, isSubjectOf, parseKey, RESERVED, SCHEMA_PATHS, stripSchema, subjectKey } from '../src/content/docs'
import { OBORY, oborSubjects, yearGrade } from '../src/obory'
import { BLOCK_EXAMPLES, QUESTION_EXAMPLES } from '../src/content/examples'
import { block, question } from '../src/content/format'
import { validate } from '../src/content/schema'
import type { TopicFile, VocabFile } from '../src/content/types'
import { WIDGETS } from '../src/widgets'
import { generated } from './content-generate'

const filter = process.argv[2] ?? ''
const errors: string[] = []
const err = (where: string, m: string) => errors.push(`${where}: ${m}`)
const rel = (f: string) => relative(ROOT, f)
const ls = (d: string) => (existsSync(d) ? readdirSync(d).sort() : [])

// ——— Files ———

const snap = new Map<string, unknown>()
const walk = (dir: string, prefix: string) => {
  for (const f of ls(dir)) {
    const file = join(dir, f)
    if (statSync(file).isDirectory()) { walk(file, `${prefix}${f}/`); continue }
    const key = `${prefix}${f.replace(/\.json$/, '')}`
    const ref = f.endsWith('.json') ? parseKey(key) : null
    if (!ref) { err(rel(file), 'unexpected file (not a content document: unknown grade, subject, level or id)'); continue }
    let text: string, data: unknown
    try { text = readFileSync(file, 'utf8'); data = JSON.parse(text) } catch (e) { err(rel(file), `not valid JSON: ${(e as Error).message}`); continue }
    if ((data as { $schema?: string })?.$schema !== SCHEMA_PATHS[ref.kind]) err(rel(file), `"$schema" must be "${SCHEMA_PATHS[ref.kind]}"`)
    if (text !== JSON.stringify(data, null, 2) + '\n') err(rel(file), 'not formatted – run npm run content:format')
    snap.set(key, stripSchema(data))
  }
}
for (const top of ['topics', 'vocab', 'approaches']) walk(join(CONTENT, top), `${top}/`)
for (const f of ls(CONTENT)) if (!['topics', 'vocab', 'approaches', 'schema', 'README.md'].includes(f)) err(rel(join(CONTENT, f)), 'unexpected file')

// ——— Documents together ———

const only = filter ? new Set([...snap.keys()].filter((k) => `content/${k}.json`.includes(filter))) : undefined
for (const i of checkSnapshot(snap, { only, partial: !!filter })) {
  if (only && i.key && !only.has(i.key)) continue
  err(i.key ? `content/${i.key}.json${i.path ? ` ${i.path}` : ''}` : 'content', i.message)
}
let topics = 0, questions = 0, words = 0
for (const [k, v] of snap) {
  if (only && !only.has(k)) continue
  const ref = parseKey(k)
  if (ref?.kind === 'topic') { topics++; questions += (v as TopicFile).questions?.length ?? 0 }
  if (ref?.kind === 'vocab') words += (v as VocabFile).groups?.reduce((n, g) => n + (g.words?.length ?? 0), 0) ?? 0
}

// ——— Widget registry ———

const EVIL = '<img src=x onerror=alert(1)>'
const escHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const poison = (v: unknown): unknown => (typeof v === 'string' ? v + EVIL : Array.isArray(v) ? v.map(poison) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, poison(x)])) : v)

const widgetDir = join(ROOT, 'src', 'widgets')
for (const f of ls(widgetDir)) {
  if (!f.endsWith('.tsx') || f === 'kit.tsx' || f === 'index.tsx' || f === 'view.tsx') continue
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
  // Pages from the server show html(): every text from content must go through `inline` (escaped). Fed with
  // markup in every string prop, an example must not render it (props it cannot render at all may throw).
  if (w.html) for (const x of w.examples) {
    let out = ''
    try { out = w.html(poison(x.props), escHtml) } catch { continue }
    if (out.includes(EVIL)) err(where, `html() of example "${x.title}" puts text from content into the page unescaped – use inline()`)
  }
}

for (const [k, b] of Object.entries(BLOCK_EXAMPLES)) for (const i of validate(block, b)) err(`src/content/examples.ts block ${k}`, `${i.path}: ${i.message}`)
for (const [k, q] of Object.entries(QUESTION_EXAMPLES)) for (const i of validate(question, q)) err(`src/content/examples.ts question ${k}`, `${i.path}: ${i.message}`)

// ——— Obory (src/obory.ts, code): a valid plan; odborné předměty it names but the content lacks only show as "připravujeme" ———

const oborIds = new Set<string>()
for (const o of OBORY) {
  const where = `src/obory.ts ${o.id}`
  if (!ID.test(o.id) || RESERVED.includes(o.id) || oborIds.has(o.id)) err(where, 'id must be kebab-case, unique and not a reserved route')
  oborIds.add(o.id)
  if (!/^\d{2}-\d{2}-[A-Z]\/\d{2}$/.test(o.code)) err(where, `code ${o.code} is not a kód oboru like 18-20-M/01`)
  if (o.years.length < 1 || o.years.length > 4) err(where, 'an obor has 1–4 years (the app shows them as 1.–4. ročník SŠ)')
  o.years.forEach((y, i) => {
    for (const s of y.general) if (!(GRADE_SUBJECTS[yearGrade(i)] as string[]).includes(s)) err(where, `year ${i + 1}: ${s} is not a subject of ${yearGrade(i)}`)
    for (const s of y.odb) if (!isSubjectOf(ODB, s)) err(where, `year ${i + 1}: "${s}" cannot be an odborný předmět (kebab-case, not a core subject)`)
    if (new Set(y.odb).size !== y.odb.length || new Set(y.general).size !== y.general.length) err(where, `year ${i + 1}: a subject is listed twice`)
  })
}
// Without a filter the whole content is here: say which odborné předměty the obory are still waiting for.
if (!filter) {
  const missing = oborSubjects().filter((s) => !snap.has(subjectKey(ODB, s)))
  if (missing.length) console.log(`obory: ${missing.length} odborných předmětů zatím chybí (připravujeme): ${missing.join(', ')}`)
}

// ——— Generated files ———

if (!filter) for (const [path, text] of Object.entries(generated())) {
  const file = join(ROOT, path)
  if (!existsSync(file) || readFileSync(file, 'utf8') !== text) errors.push(`${path} is out of date – run npm run content:generate`)
}

console.log(`${topics} topics, ${questions} questions, ${words} words, ${Object.keys(WIDGETS).length} widgets, ${errors.length} errors`)
for (const e of errors.slice(0, 200)) console.log('✗', e)
if (errors.length > 200) console.log(`… and ${errors.length - 200} more`)
process.exit(errors.length ? 1 : 0)
