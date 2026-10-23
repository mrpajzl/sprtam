// Prints one route per widget type (first topic that uses it).
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = join(import.meta.dirname, '..', 'src', 'content', 'data')
const seen = new Map<string, string>()
for (const g of readdirSync(root)) for (const f of readdirSync(join(root, g))) {
  const s = (await import(pathToFileURL(join(root, g, f)).href)).default
  for (const t of s.topics) t.ex.forEach((x: any, i: number) => x.blocks.forEach((b: any) => { if (b.t === 'w' && !seen.has(b.w)) seen.set(b.w, `/g/${g}/${s.subject}/${t.id}?ex=${i}`) }))
}
console.log([...seen.entries()].map(([w, r]) => `${w} ${r}`).join('\n'))
