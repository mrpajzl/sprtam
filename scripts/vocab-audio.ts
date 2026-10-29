// Pronunciation of every vocabulary word, recorded once with ElevenLabs and served as static files.
//
//   ELEVENLABS_API_KEY=… npx tsx scripts/vocab-audio.ts gen     raw takes → scripts/.audio-raw (git-ignored), only missing ones
//   npx tsx scripts/vocab-audio.ts build                        raw → public/audio/<lang>/<slug>.mp3 + src/vocab/audio.ts (version)
//   ELEVENLABS_API_KEY=… npx tsx scripts/vocab-audio.ts check   speech-to-text of every built file must give back the word
//
// Every command takes `--lang de,fr` to work on some languages only (default: all of content/vocab). The version
// in src/vocab/audio.ts always covers the files of every language in public/audio.
// Delete a raw take (or pass words after `gen --force`) to record it again.
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { VocabFile, WordsFile } from '../src/content/types'
import { LANGS } from '../src/vocab/langs'
import { wordSlug } from '../src/vocab/slug'
import type { VocabLang } from '../src/vocab/types'

const ROOT = join(import.meta.dirname, '..')
const RAW = join(import.meta.dirname, '.audio-raw')
const AUDIO = join(ROOT, 'public', 'audio')
const outDir = (lang: VocabLang) => join(AUDIO, lang)
/** English takes stay where they always were; the other languages get a folder each. */
const rawDir = (lang: VocabLang) => (lang === 'en' ? RAW : join(RAW, lang))
const API = 'https://api.elevenlabs.io/v1'
const MODEL = 'eleven_v4'
/** Clear educational voices, one per accent the groups use (English group `lang`) and one per other language. */
const VOICES: Record<string, string> = {
  'en-GB': 'Xb7hH8MSUJpSbSDYk0k2', // Alice – Clear, Engaging Educator (British)
  'en-US': 'XrExE9yKIg1WjnnlVkGX', // Matilda – Knowledgable, Professional (American)
  'en-AU': 'IKne3meq5aSn9XLyUdCD', // Charlie – Deep, Confident (Australian)
  'de-DE': 'lzvBSKYbNWDD0a6BaJSK', // Petra – Confident and Pleasant (standard German)
  'fr-FR': '5OnMHwgTFgvPVwE8jP6B', // Anaïs – Instructor (standard French)
  'es-ES': 'SDVJaMLoJa7wc3s2sn7d', // Lydia – Warm, Clear (Spain)
}
/**
 * Words spelled the same as another word that sounds different (close, refuse, desert…). They are recorded
 * as „to close. Close.“: the first phrase settles the meaning, only the word after the pause is kept.
 */
const LEAD: Record<string, string> = {
  close: 'to', read: 'to', increase: 'to', produce: 'to', refuse: 'to', resume: 'to',
  minute: 'one', wind: 'the', present: 'a', subject: 'a school', progress: 'the', contract: 'a',
  desert: 'the', export: 'the', import: 'the', wound: 'a', house: 'a',
  // Single words the recogniser kept hearing as something else (biscuits, four): said in a phrase first.
  biscuit: 'one', full: 'the glass is',
}

/** One recording: `en` is the word as written (any language), `say` what is spoken (without a note in parentheses). */
interface Entry { lang: VocabLang; en: string; say: string; voice: string; slug: string }

const arg = (name: string) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined }
const LANG_ARG = arg('--lang')?.split(',') as VocabLang[] | undefined
const LEVEL_FILES = ['a1', 'a2', 'b1', 'b2', 'c1']

async function words(): Promise<Entry[]> {
  const out: Entry[] = []
  for (const m of LANGS) {
    if (LANG_ARG && !LANG_ARG.includes(m.id)) continue
    const dir = m.id === 'en' ? join(ROOT, 'content', 'vocab') : join(ROOT, 'content', 'vocab', m.id)
    for (const l of LEVEL_FILES) {
      const file = join(dir, `${l}.json`)
      if (!existsSync(file)) { if (m.id === 'en') throw new Error(`${file} missing – npm run content:pull`); continue }
      if (m.id === 'en') {
        const set: VocabFile = JSON.parse(readFileSync(file, 'utf8'))
        for (const g of set.groups) for (const { en } of g.words) out.push({ lang: 'en', en, say: en, voice: VOICES[g.lang ?? 'en-GB'], slug: wordSlug('en', en) })
      } else {
        const set: WordsFile = JSON.parse(readFileSync(file, 'utf8'))
        const voice = VOICES[m.speech] ?? (() => { throw new Error(`no voice for ${m.speech} in VOICES`) })()
        for (const g of set.groups) for (const { word } of g.words) out.push({ lang: m.id, en: word, say: word.replace(/\s*\([^)]*\)\s*$/, ''), voice, slug: wordSlug(m.id, word) })
      }
    }
  }
  const seen = new Map<string, string>()
  for (const w of out) {
    const k = `${w.lang}/${w.slug}`
    if (seen.has(k)) throw new Error(`"${w.en}" and "${seen.get(k)}" share the file ${k}.mp3`)
    seen.set(k, w.en)
  }
  return out
}

const key = () => process.env.ELEVENLABS_API_KEY || (console.error('ELEVENLABS_API_KEY is not set'), process.exit(1))

async function api(path: string, init: RequestInit, attempt = 1): Promise<Response> {
  const res = await fetch(API + path, { ...init, headers: { 'xi-api-key': key(), ...init.headers } })
  if (res.ok) return res
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 2000 * attempt))
    return api(path, init, attempt + 1)
  }
  throw new Error(`${path} → ${res.status} ${(await res.text()).slice(0, 300)}`)
}

async function pool<T>(items: T[], n: number, job: (t: T) => Promise<void>) {
  let i = 0
  const failed: string[] = []
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const t = items[i++]
      try { await job(t) } catch (e) { failed.push(String(e)); console.error('  ✗', String(e)) }
    }
  }))
  return failed
}

const rawFile = (w: Entry) => join(rawDir(w.lang), `${w.slug}.mp3`)
const leadFile = (w: Entry) => join(rawDir(w.lang), `${w.slug}.json`)
const outFile = (w: Entry) => join(outDir(w.lang), `${w.slug}.mp3`)

const spoken = (lead: string, en: string) => `${lead} ${en}. ${en[0].toUpperCase()}${en.slice(1)}.`

async function gen(force: string[]) {
  for (const m of LANGS) await mkdir(rawDir(m.id), { recursive: true })
  const todo = (await words()).filter((w) => force.includes(w.en) || !existsSync(rawFile(w)))
  console.log(`${todo.length} words to record`)
  let done = 0
  const failed = await pool(todo, 3, async (w) => {
    const lead = w.lang === 'en' ? LEAD[w.en] : undefined
    const body = JSON.stringify({
      text: lead ? spoken(lead, w.en) : w.say,
      model_id: MODEL,
      language_code: w.lang,
      voice_settings: { stability: 0.75, similarity_boost: 0.8, style: 0, use_speaker_boost: true, speed: 0.95 },
    })
    const res = await api(`/text-to-speech/${w.voice}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'content-type': 'application/json' }, body })
    await writeFile(rawFile(w), Buffer.from(await res.arrayBuffer()))
    if (lead) await writeFile(leadFile(w), JSON.stringify({ text: spoken(lead, w.en) }))
    else await rm(leadFile(w), { force: true })
    if (++done % 50 === 0) console.log(`  ${done}/${todo.length}`)
  })
  console.log(failed.length ? `${failed.length} failed` : 'all recorded')
  if (failed.length) process.exit(1)
}

const TARGET_LUFS = -18

function encode(w: Entry, out: string) {
  // With a lead-in, keep only what follows the last pause.
  let lead = 0
  if (existsSync(leadFile(w))) {
    const log = spawnSync('ffmpeg', ['-hide_banner', '-i', rawFile(w), '-af', 'silencedetect=noise=-40dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
    const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]))
    const total = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(log)!.slice(1).reduce((t, x) => t * 60 + Number(x), 0))
    const pause = ends.filter((t) => t < total - 0.15).at(-1)
    if (!pause) throw new Error(`${w.en}: no pause after the lead-in`)
    lead = Math.max(0, pause - 0.03)
  }
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse'
  const input = ['-hide_banner', '-ss', lead.toFixed(3), '-i', rawFile(w)]
  // loudnorm prints its measurement as JSON on stderr.
  const measured = spawnSync('ffmpeg', [...input, '-af', `${trim},loudnorm=print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const i = Number(JSON.parse(/\{[^{}]*"input_i"[^{}]*\}/.exec(measured)?.[0] ?? '{}').input_i)
  const gain = Number.isFinite(i) ? TARGET_LUFS - i : 0
  execFileSync('ffmpeg', ['-v', 'error', ...input, '-af', `${trim},volume=${gain.toFixed(2)}dB,alimiter=limit=0.89:level=false,afade=t=in:d=0.005`,
    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', '-map_metadata', '-1', '-id3v2_version', '0', '-write_xing', '0', '-y', out])
}

async function build() {
  const list = await words()
  const missing = list.filter((w) => !existsSync(rawFile(w)))
  if (missing.length) throw new Error(`no recording for ${missing.length} words, e.g. ${missing.slice(0, 5).map((w) => w.en).join(', ')} – run gen`)
  for (const lang of new Set(list.map((w) => w.lang))) {
    await mkdir(outDir(lang), { recursive: true })
    const keep = new Set(list.filter((w) => w.lang === lang).map((w) => `${w.slug}.mp3`))
    for (const f of await readdir(outDir(lang))) if (!keep.has(f)) await rm(join(outDir(lang), f))
  }
  const failed = await pool(list, 8, async (w) => { encode(w, outFile(w)) })
  if (failed.length) throw new Error(`${failed.length} files failed to encode`)
  // The version covers every language's files (also those not rebuilt now). English alone hashes as it always did.
  const hash = createHash('sha256')
  for (const m of LANGS) {
    if (!existsSync(outDir(m.id))) continue
    for (const f of (await readdir(outDir(m.id))).filter((f) => f.endsWith('.mp3')).sort((a, b) => a.localeCompare(b))) {
      hash.update(m.id === 'en' ? f.slice(0, -4) : `${m.id}/${f.slice(0, -4)}`).update(await readFile(join(outDir(m.id), f)))
    }
  }
  const v = hash.digest('hex').slice(0, 10)
  await writeFile(join(ROOT, 'src', 'vocab', 'audio.ts'), `// Generated by scripts/vocab-audio.ts build – changes whenever any recording changes.\nexport const AUDIO_V = '${v}'\n`)
  console.log(`${list.length} files, version ${v}`)
}

/**
 * What the recogniser may write instead, checked by ear-equivalence: homophones (sea → C), American spelling
 * of British words, digits, and Australian slang it does not know.
 */
const SOUNDS_SAME: Record<string, string[]> = {
  affect: ['effect'], analyse: ['analyze'], apologise: ['apologize'], be: ['b'], bee: ['b'], behaviour: ['behavior'],
  board: ['bored'], brake: ['break'], buy: ['bye', 'by'], 'cark it': ['cock it'], carry: ['carrie'], cell: ['sell'],
  'chuck a sickie': ['chakasiki'], 'chuck a wobbly': ['shaka wobbley'], colour: ['color'], 'come a gutser': ['come agazza'],
  drawer: ['draw'], emphasise: ['emphasize'], eye: ['i'], fare: ['fair'], flour: ['flower'], globalisation: ['globalization'],
  grey: ['gray'], gym: ['jim'], 'have forty winks': ['have 40 winks'], hear: ['here'], hire: ['higher'], know: ['no'],
  main: ['maine'], meat: ['meet'], neighbour: ['neighbor'], pour: ['poor'], recognise: ['recognize'], sauce: ['source'],
  sea: ['c', 'see'], see: ['c', 'sea'], sell: ['cell'], son: ['sun'], steal: ['steel'], tea: ['t'], tie: ['thai'],
  twenty: ['20'], wear: ['where'], week: ['weak'], weigh: ['way'], write: ['right'],
}

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim()

async function check() {
  const list = await words()
  const cacheFile = join(RAW, 'check.json')
  const cache: Record<string, { sha: string; heard: string }> = existsSync(cacheFile) ? JSON.parse(await readFile(cacheFile, 'utf8')) : {}
  const bad: string[] = []
  await pool(list, 3, async (w) => {
    const data = await readFile(outFile(w))
    const ck = w.lang === 'en' ? w.slug : `${w.lang}/${w.slug}`
    const sha = createHash('sha256').update(data).digest('hex')
    let heard = cache[ck]?.sha === sha ? cache[ck].heard : null
    if (heard === null) {
      const form = new FormData()
      form.append('model_id', 'scribe_v1')
      form.append('language_code', w.lang)
      form.append('tag_audio_events', 'false')
      form.append('file', new Blob([data], { type: 'audio/mpeg' }), `${w.slug}.mp3`)
      heard = ((await (await api('/speech-to-text', { method: 'POST', body: form })).json()) as { text: string }).text
      cache[ck] = { sha, heard }
    }
    const a = norm(heard).replace(/'/g, ''), b = norm(w.say).replace(/'/g, '')
    const ok = [b, ...(SOUNDS_SAME[w.en] ?? []).map((x) => norm(x).replace(/'/g, ''))].some((x) => x === a || x.replace(/ /g, '') === a.replace(/ /g, ''))
    if (!ok) bad.push(`${w.en}  →  heard "${heard}"`)
  })
  await writeFile(cacheFile, JSON.stringify(cache, null, 1))
  console.log(bad.length ? `${bad.length} differ:\n${bad.sort().join('\n')}` : `all ${list.length} heard right`)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'gen') await gen(rest.filter((a, i) => a !== '--force' && a !== '--lang' && rest[i - 1] !== '--lang'))
else if (cmd === 'build') await build()
else if (cmd === 'check') await check()
else console.error('usage: vocab-audio.ts gen [--force words…] | build | check   [--lang de,fr]')
