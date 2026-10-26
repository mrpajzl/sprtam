// Downloads the current content release into content/ (docs/OBSAH.md), for development, tests and scripts that
// read the files: npm run content:pull. Content lives in the content service; this local copy is not in git
// and is overwritten by the next pull (changes go through moderation).
//   CONTENT_API=https://moderace.sprtam.cz (default) – or a local stub (scripts/content-stub.ts)
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { CONTENT } from '../plugins/content'
import { fileText } from '../src/content/canonical'
import { parseKey, SCHEMA_PATHS, SCHEMAS } from '../src/content/docs'

const api = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
const res = await fetch(`${api}/api/public/v1/export`, { signal: AbortSignal.timeout(120_000) })
if (!res.ok) { console.error(`${api}/api/public/v1/export → ${res.status}`); process.exit(1) }
const { release, docs } = (await res.json()) as { release: number; docs: Record<string, unknown> }

const wanted = new Set<string>()
let written = 0
for (const [key, doc] of Object.entries(docs)) {
  // Keys come from the network: only real content documents become files (no paths outside content/).
  const ref = parseKey(key)
  if (!ref) { console.warn(`skipping unknown document ${JSON.stringify(key)}`); continue }
  const file = join(CONTENT, `${key}.json`)
  wanted.add(file)
  const text = fileText(SCHEMAS[ref.kind], { $schema: SCHEMA_PATHS[ref.kind], ...(doc as object) })
  let old = ''
  try { old = readFileSync(file, 'utf8') } catch { /* new file */ }
  if (old !== text) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); written++ }
}

// Documents that are no longer in the release.
let removed = 0
const walk = (d: string) => {
  let entries: string[] = []
  try { entries = readdirSync(d) } catch { return }
  for (const f of entries) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) { walk(p); if (!readdirSync(p).length) rmSync(p, { recursive: true }) }
    else if (!wanted.has(p)) { rmSync(p); removed++ }
  }
}
for (const top of ['topics', 'vocab', 'approaches']) walk(join(CONTENT, top))

console.log(`release ${release}: ${wanted.size} documents in ${relative(process.cwd(), CONTENT) || 'content'}/, ${written} written, ${removed} removed`)
