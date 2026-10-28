import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'
import { ALL_GRADES, GRADE_SUBJECTS, isVocationalEntry, ODB, setVocational } from '../src/content/curriculum'
import { ID, RESERVED } from '../src/content/docs'
import { LEVELS } from '../src/content/format'
import { HASH, type Manifest } from '../src/content/manifest'
import { hashOf } from '../src/content/release'
import type { ApproachYearFile, GradeId, Subject, SubjectId, Topic, VocabFile, YearId } from '../src/content/types'
import { pages, type Page, type SiteContent } from './pages'

// The content of sprtam.cz comes from the content service (CONTENT_API, docs/OBSAH.md). This keeps a
// copy of its current release: the manifest is polled every few seconds; when it changes, the missing
// files are fetched by hash, checked against the hash and stored in DATA_DIR/content – and only once
// everything is there and readable does the site switch over. On start the stored copy is used, so the
// site works even while the content service is down. Files of the last few releases stay available, so
// pages opened before a release still get the files they ask for.

const POLL = 15_000
const TIMEOUT = 20_000
const MAX_MANIFEST = 1 << 20
const MAX_FILE = 32 << 20
/** Limits of one release: a manifest outside them is refused before anything is downloaded or while it is. */
const MAX_FILES = 2000
const MAX_RELEASE = 100 << 20
/** Release numbers only grow; anything near the float limit is not a real release. */
const MAX_RELEASE_NUMBER = 1e12
/** Releases whose files are kept in memory (current first) and on disk. */
const KEEP_MEMORY = 5
const KEEP_DISK = 10

const gz = promisify(gzip)
const br = promisify(brotliCompress)

/** One file of a release: its text, compressed variants made on first use. */
export interface Entry { body: Buffer; gzip?: Promise<Buffer>; br?: Promise<Buffer> }

export interface Release {
  manifest: Manifest
  /** The manifest as sent to the app (also embedded in pages). */
  json: string
  pages: Map<string, Page>
  /** Rendered HTML by path, filled as pages are asked for. */
  html: Map<string, string>
}

let current: Release | undefined
/** Manifests of recent releases, newest first (current = [0]). */
let recent: Manifest[] = []
const files = new Map<string, Entry>()

export const release = () => current
let fromStore: (h: string) => Promise<boolean> = async () => false

/** A file of the current or a recent release (read back from disk when it is no longer in memory). */
export async function file(hash: string): Promise<Entry | undefined> {
  if (!files.has(hash) && recent.some((m) => Object.values(m.files).includes(hash))) await fromStore(hash)
  return files.get(hash)
}

/** The file in the encoding the client accepts (br, gzip or none). */
export async function encoded(e: Entry, accept: string): Promise<[Buffer, string | undefined]> {
  if (/\bbr\b/.test(accept)) return [await (e.br ??= br(e.body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })), 'br']
  if (/\bgzip\b/.test(accept)) return [await (e.gzip ??= gz(e.body, { level: 9 })), 'gzip']
  return [e.body, undefined]
}

const isManifest = (m: unknown): m is Manifest => {
  const x = m as Manifest
  return !!x && typeof x === 'object' && x.format === 1 && Number.isSafeInteger(x.release) && x.release >= 0 && x.release < MAX_RELEASE_NUMBER
    && typeof x.hash === 'string' && HASH.test(x.hash) && typeof x.publishedAt === 'number' && Number.isFinite(x.publishedAt)
    && !!x.files && typeof x.files === 'object' && !Array.isArray(x.files) && Object.keys(x.files).length <= MAX_FILES
    && Object.values(x.files).every((h) => typeof h === 'string' && HASH.test(h)) && Array.isArray(x.approaches)
}

const isYear = (g: unknown): g is YearId => (ALL_GRADES as unknown[]).includes(g)
const isId = (v: unknown): v is string => typeof v === 'string' && ID.test(v)
const isApproachId = (v: unknown): v is string => isId(v) && !RESERVED.includes(v)

/**
 * The pages' view of a release. Throws – and the release is not used – when a file does not have the expected
 * shape or anything that ends up in URLs (grades, subjects, levels, ids) is not what the app can have: content
 * text is escaped in the pages, but these are also checked so a broken or compromised content service cannot
 * smuggle anything in through them.
 */
function siteOf(m: Manifest, read: (hash: string) => unknown): SiteContent {
  const bad = (what: string): never => { throw new Error(`release ${m.release}: ${what}`) }
  // Odborné předměty name themselves in the manifest: their ids end up in URLs, their names in pages.
  const voc = m.vocational ?? {}
  if (typeof voc !== 'object' || Array.isArray(voc)) bad('vocational: not an object')
  for (const [id, v] of Object.entries(voc)) if (!isVocationalEntry(id, v)) bad(`vocational ${JSON.stringify(id)}`)
  const isGrade = (g: unknown): g is GradeId => isYear(g) || g === ODB
  const isSubjectOf = (g: GradeId, s: unknown): s is SubjectId => (g === ODB ? typeof s === 'string' && Object.hasOwn(voc, s) : (GRADE_SUBJECTS[g] as unknown[]).includes(s))
  /** grade/subject/id of a topic, as plans of approaches refer to topics. */
  const isTopicRef = (k: unknown) => { const [g, s, id, ...rest] = typeof k === 'string' ? k.split('/') : []; return !rest.length && isGrade(g) && isSubjectOf(g, s) && isId(id) }
  const approachIds = new Set<string>()
  for (const a of m.approaches) {
    if (!a || !isApproachId(a.id) || !Array.isArray(a.grades) || !a.grades.every(isYear)) bad(`approach ${JSON.stringify(a?.id)}`)
    approachIds.add(a.id)
  }
  const subjects: Subject[] = []
  const vocab: VocabFile[] = []
  for (const n of Object.keys(m.files).sort()) {
    const p = n.split('/')
    if (n === 'index' || n === 'text') continue
    if (p[0] === 'subject' && p.length === 3 && isGrade(p[1]) && isSubjectOf(p[1], p[2])) {
      const topics = read(m.files[n]) as Topic[]
      if (!Array.isArray(topics)) bad(`${n}: not a list of topics`)
      for (const t of topics) if (!t || !isId(t.id) || (t.approach !== undefined && !approachIds.has(t.approach))) bad(`${n}: topic ${JSON.stringify(t?.id)}`)
      subjects.push({ grade: p[1], subject: p[2], topics })
    } else if (p[0] === 'vocab' && p.length === 2 && (LEVELS as readonly string[]).includes(p[1])) {
      const v = read(m.files[n]) as VocabFile
      if (!v || v.level !== p[1] || !Array.isArray(v.groups)) bad(`${n}: not vocabulary of level ${p[1]}`)
      vocab.push(v)
    } else if (!(p[0] === 'approach' && p.length === 3 && approachIds.has(p[1]) && isYear(p[2]))) bad(`unknown file ${JSON.stringify(n)}`)
  }
  const approaches = m.approaches.map((a) => ({
    ...a,
    years: a.grades.map((g) => {
      const y = read(m.files[`approach/${a.id}/${g}`] ?? bad(`approach/${a.id}/${g} missing`)) as ApproachYearFile
      if (!y || !Array.isArray(y.epochs)) bad(`approach/${a.id}/${g}: not a plan`)
      for (const b of [...y.epochs, ...(y.ongoing ?? [])]) if (!b || !isId(b.id) || !Array.isArray(b.topics) || !b.topics.every(isTopicRef)) bad(`approach/${a.id}/${g}: ${JSON.stringify(b?.id)}`)
      return [g, y] as [YearId, ApproachYearFile]
    }),
  }))
  // Pages name subjects through subjectMeta: the odborné předměty of this release.
  setVocational(voc)
  return { subjects, vocab, approaches }
}

/** Builds the in-memory release from files already in `files`. */
function build(m: Manifest): Release {
  const read = (h: string) => { const e = files.get(h); if (!e) throw new Error(`file ${h} missing`); return JSON.parse(e.body.toString('utf8')) }
  let all: Page[]
  // siteOf names the release's odborné předměty for the pages; a release that fails leaves the live one's names.
  try { all = pages(siteOf(m, read)) } catch (e) { setVocational(current?.manifest.vocational); throw e }
  return { manifest: m, json: JSON.stringify(m), pages: new Map(all.map((p) => [p.path, p])), html: new Map() }
}

export interface ContentOptions { api: string; dataDir: string; log?: (m: string) => void }

export async function startContent({ api, dataDir, log = console.log }: ContentOptions) {
  const dir = join(dataDir, 'content')
  const fileDir = join(dir, 'files')
  await mkdir(fileDir, { recursive: true })
  const path = (h: string) => join(fileDir, `${h}.json`)

  /** Writes a file so a crash never leaves half of it: a temporary file renamed into place. */
  const atomic = async (to: string, data: string | Buffer) => {
    const tmp = `${to}.${process.pid}.tmp`
    await writeFile(tmp, data)
    await rename(tmp, to)
  }

  /** Loads a stored file into memory when its contents still match its hash. */
  const fromDisk = async (h: string) => {
    if (files.has(h)) return true
    const body = await readFile(path(h)).catch(() => null)
    if (!body || hashOf(body.toString('utf8')) !== h) return false
    files.set(h, { body })
    return true
  }

  /** The release being downloaded: its files stay while it is retried. */
  let pending: Manifest | undefined
  const keep = async () => {
    const memory = new Set([...recent.slice(0, KEEP_MEMORY), ...(pending ? [pending] : [])].flatMap((m) => Object.values(m.files)))
    for (const h of files.keys()) if (!memory.has(h)) files.delete(h)
    const disk = new Set([...recent.slice(0, KEEP_DISK), ...(pending ? [pending] : [])].flatMap((m) => Object.values(m.files)))
    for (const f of await readdir(fileDir).catch(() => [])) if (!disk.has(f.replace(/\.json$/, ''))) await rm(join(fileDir, f), { force: true })
  }

  const swap = async (m: Manifest, persist: boolean) => {
    const r = build(m)
    if (persist) {
      recent = [m, ...recent.filter((x) => x.hash !== m.hash)].slice(0, KEEP_DISK)
      await atomic(join(dir, 'releases.json'), JSON.stringify(recent))
    }
    current = r
    await keep()
    log(`content: release ${m.release} (${m.hash}, ${Object.keys(m.files).length} files, ${r.pages.size} pages)`)
  }

  // ——— Start from the stored copy ———
  try {
    const stored = JSON.parse(await readFile(join(dir, 'releases.json'), 'utf8')) as unknown[]
    recent = stored.filter(isManifest)
    // The newest stored release that is complete and builds; older ones when it does not.
    for (const m of recent) {
      const ok = (await Promise.all(Object.values(m.files).map(fromDisk))).every(Boolean)
      if (!ok) { log(`content: stored release ${m.release} is incomplete, skipping it`); continue }
      try { await swap(m, false); break } catch (e) { log(`content: stored release ${m.release} is unusable (${(e as Error).message}), skipping it`) }
    }
  } catch { log('content: no stored release yet') }

  // ——— Follow the content service ———
  /** A response body of at most `max` bytes – counted while it streams in, whatever the headers say. */
  const get = async (url: string, max: number, headers: Record<string, string> = {}) => {
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'sprtam-web', ...headers }, signal: abort.signal, redirect: 'error' })
      if (res.status === 304) return { status: 304, body: Buffer.alloc(0) }
      if (!res.ok || !res.body) throw new Error(`${url} → ${res.status}`)
      const chunks: Uint8Array[] = []
      let size = 0
      for await (const c of res.body as AsyncIterable<Uint8Array>) {
        size += c.byteLength
        if (size > max) { abort.abort(); throw new Error(`${url}: larger than ${max} bytes`) }
        chunks.push(c)
      }
      return { status: res.status, body: Buffer.concat(chunks) }
    } finally { clearTimeout(timer) }
  }

  let lastError = ''
  const sync = async () => {
    const etag = current ? `"${current.manifest.hash}"` : undefined
    const r = await get(`${api}/api/public/v1/manifest`, MAX_MANIFEST, etag ? { 'If-None-Match': etag } : {})
    if (r.status === 304) return
    const m = JSON.parse(r.body.toString('utf8')) as unknown
    if (!isManifest(m)) throw new Error('manifest has an unexpected shape')
    // The content service is the authority: any other release (even a lower number after a restore) is taken.
    if (current && m.hash === current.manifest.hash) return
    pending = m
    const missing = [...new Set(Object.values(m.files))]
    for (const h of missing) await fromDisk(h)
    const todo = missing.filter((h) => !files.has(h))
    // A few at a time, each stored as soon as it is verified; one failure aborts the whole update (tried
    // again on the next poll, already stored files are not fetched again).
    let total = 0
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(async (h) => {
        const { body } = await get(`${api}/api/public/v1/files/${h}`, MAX_FILE)
        total += body.length
        if (total > MAX_RELEASE) throw new Error(`release ${m.release}: larger than ${MAX_RELEASE} bytes`)
        const text = body.toString('utf8')
        if (hashOf(text) !== h) throw new Error(`file ${h}: contents do not match the hash`)
        JSON.parse(text)
        await atomic(path(h), body)
        files.set(h, { body })
      }))
    }
    await swap(m, true)
    pending = undefined
  }

  fromStore = fromDisk
  const loop = async () => {
    try { await sync(); if (lastError) log('content: syncing again'); lastError = '' } catch (e) {
      const msg = (e as Error).message
      // Say it once, not every 15 seconds.
      if (msg !== lastError) log(`content: sync failed: ${msg}`)
      lastError = msg
      // Only files of recent releases and of the one being retried stay (a newer manifest replaces it).
      await keep().catch(() => {})
    }
    setTimeout(loop, POLL).unref()
  }
  // The first sync runs in the background: with a stored copy the site is up right away.
  void loop()
}

/** Rendered HTML of a page of the current release (cached), with the manifest embedded. */
export function pageHtml(r: Release, path: string, render: (p: Page) => string): string | undefined {
  let html = r.html.get(path)
  if (html === undefined) {
    const p = r.pages.get(path)
    if (!p) return undefined
    html = embed(render(p), r)
    r.html.set(path, html)
  }
  return html
}

/** The manifest as a data block in a page (not a script: the CSP does not apply; `<` escaped so it cannot end the block). */
export const embed = (html: string, r: Release) =>
  html.replace('</head>', () => `<script type="application/json" id="sprtam-manifest">${r.json.replace(/</g, '\\u003c')}</script>\n  </head>`)
