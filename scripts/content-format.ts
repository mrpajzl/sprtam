// Rewrites every content file in the canonical formatting (2-space JSON, newline at the end):
// npm run content:format. check:content fails on files that are not formatted this way.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { CONTENT, ROOT, TOPICS, VOCAB } from '../plugins/content'

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [] })
let changed = 0
for (const file of [...walk(TOPICS), ...walk(VOCAB)]) {
  const text = readFileSync(file, 'utf8')
  let data: unknown
  try { data = JSON.parse(text) } catch (e) { console.log('✗', relative(ROOT, file), (e as Error).message); continue }
  const out = JSON.stringify(data, null, 2) + '\n'
  if (out !== text) { writeFileSync(file, out); changed++; console.log('✓', relative(ROOT, file)) }
}
console.log(`${changed} file(s) reformatted in ${relative(ROOT, CONTENT)}/`)
