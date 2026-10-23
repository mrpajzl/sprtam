// Builds every quiz mode for every topic and checks that each typed answer accepts its own key.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, checkInput, strictFor, MODES, type ModeId } from '../src/quiz/engine'
import { GENERATORS } from '../src/quiz/generators'
const root = join(import.meta.dirname, '..', 'src', 'content', 'data')
let n = 0; const errs: string[] = []
for (const g of readdirSync(root)) for (const f of readdirSync(join(root, g))) {
  const s = (await import(pathToFileURL(join(root, g, f)).href)).default
  const topics = s.topics.map((t: any) => ({ key: `${g}/${s.subject}/${t.id}`, t }))
  for (const tp of topics) {
    for (const m of Object.keys(MODES) as ModeId[]) { const items = build(m, m === 'test' ? topics : [tp]); if (!items.length) errs.push(`${tp.key} ${m}: empty`); n++ }
    for (const q of tp.t.qs) if (q.t === 'input') for (const a of q.a) if (!checkInput(a, q.a, strictFor(tp.key))) errs.push(`${tp.key}: "${a}" rejected`)
  }
}
for (const [name, gen] of Object.entries(GENERATORS)) for (let i = 0; i < 200; i++) {
  const q = gen() as any
  if (q.t === 'input' && !checkInput(q.a[0], q.a)) errs.push(`gen ${name}: own answer rejected ${q.q} ${q.a}`)
  if (q.t === 'input' && q.a.some((x: string) => /NaN|undefined|Infinity/.test(x))) errs.push(`gen ${name}: bad ${q.q} ${q.a}`)
  if (q.t === 'choice' && (q.a < 0 || q.o.length < 2)) errs.push(`gen ${name}: bad choice ${q.q}`)
}
console.log(`${n} quizzes built, ${errs.length} problems`); errs.slice(0, 30).forEach((e) => console.log('✗', e))
