// Publishes the vocabulary of other languages from the local content/ (content/vocab/<lang>/<level>.json) at once,
// as an admin (moderator/server/words.ts – vocabulary has no review in moderation):
//   npx tsx scripts/content-words.ts de fr es
// One release per language. The content service checks the whole content first and refuses anything invalid.
//   SPRTAM_TOKEN=spt_…  (or the file ~/.config/sprtam/api-token; the token of an admin)   CONTENT_API=https://moderace.sprtam.cz
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CONTENT } from '../plugins/content'

const api = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
const tokenFile = join(homedir(), '.config/sprtam/api-token')
const token = (process.env.SPRTAM_TOKEN ?? (existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8') : '')).trim()
if (!token.startsWith('spt_')) { console.error(`No API token: set SPRTAM_TOKEN or put it in ${tokenFile}.`); process.exit(1) }
const langs = process.argv.slice(2)
if (!langs.length) { console.error('Usage: npx tsx scripts/content-words.ts de [fr es]'); process.exit(1) }

let failed = 0
for (const lang of langs) {
  const dir = join(CONTENT, 'vocab', lang)
  const files = (existsSync(dir) ? readdirSync(dir) : []).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ lang, level: f.slice(0, -5).toUpperCase(), data: JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
  if (!files.length) { console.log(`✗ ${lang}: no files in ${dir}`); failed++; continue }
  const res = await fetch(`${api}/api/content/words`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, note: `Slovíčka ${lang} ${files.map((f) => f.level).join(', ')}` }), redirect: 'error', signal: AbortSignal.timeout(120_000),
  })
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (res.ok) console.log(`✓ ${lang}: ${files.map((f) => f.level).join(', ')} → release ${body?.release}`)
  else { console.log(`✗ ${lang}: ${res.status} ${JSON.stringify(body?.problems ?? body?.error ?? '')}`); failed++ }
}
process.exit(failed ? 1 : 0)
