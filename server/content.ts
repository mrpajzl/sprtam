import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'
import { HASH, type Manifest } from '../src/content/manifest'
import { hashOf } from '../src/content/release'
import type { ApproachYearFile, GradeId, Subject, SubjectId, Topic, VocabFile } from '../src/content/types'
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
  return !!x && x.format === 1 && Number.isInteger(x.release) && typeof x.hash === 'string' && !!x.files && typeof x.files === 'object'
    && Object.values(x.files).every((h) => typeof h === 'string' && HASH.test(h)) && Array.isArray(x.approaches)
}

/** The pages' view of a release (throws when a file does not have the expected shape). */
function siteOf(m: Manifest, read: (hash: string) => unknown): SiteContent {
  const names = Object.keys(m.files).sort()
  const subjects: Subject[] = names.filter((n) => n.startsWith('subject/')).map((n) => {
    const [, grade, subject] = n.split('/')
    const topics = read(m.files[n]) as Topic[]
    if (!Array.isArray(topics)) throw new Error(`${n}: not a list of topics`)
    return { grade: grade as GradeId, subject: subject as SubjectId, topics }
  })
  const vocab = names.filter((n) => n.startsWith('vocab/')).map((n) => read(m.files[n]) as VocabFile)
  const approaches = m.approaches.map((a) => ({ ...a, years: a.grades.map((g) => [g, read(m.files[`approach/${a.id}/${g}`]) as ApproachYearFile] as [GradeId, ApproachYearFile]) }))
  return { subjects, vocab, approaches }
}

/** Builds the in-memory release from files already in `files`. */
function build(m: Manifest): Release {
  const read = (h: string) => { const e = files.get(h); if (!e) throw new Error(`file ${h} missing`); return JSON.parse(e.body.toString('utf8')) }
  const all = pages(siteOf(m, read))
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

  const keep = async () => {
    const memory = new Set(recent.slice(0, KEEP_MEMORY).flatMap((m) => Object.values(m.files)))
    for (const h of files.keys()) if (!memory.has(h)) files.delete(h)
    const disk = new Set(recent.slice(0, KEEP_DISK).flatMap((m) => Object.values(m.files)))
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
    for (const m of recent) {
      const ok = (await Promise.all(Object.values(m.files).map(fromDisk))).every(Boolean)
      if (ok) { await swap(m, false); break }
      log(`content: stored release ${m.release} is incomplete, skipping it`)
    }
  } catch { log('content: no stored release yet') }

  // ——— Follow the content service ———
  const get = async (url: string, max: number, headers: Record<string, string> = {}) => {
    const res = await fetch(url, { headers: { 'User-Agent': 'sprtam-web', ...headers }, signal: AbortSignal.timeout(TIMEOUT) })
    if (res.status === 304) return { status: 304, text: '' }
    if (!res.ok) throw new Error(`${url} → ${res.status}`)
    if (Number(res.headers.get('content-length') ?? 0) > max) throw new Error(`${url}: too large`)
    const text = await res.text()
    if (text.length > max) throw new Error(`${url}: too large`)
    return { status: res.status, text }
  }

  let lastError = ''
  const sync = async () => {
    const etag = current ? `"${current.manifest.hash}"` : undefined
    const r = await get(`${api}/api/public/v1/manifest`, MAX_MANIFEST, etag ? { 'If-None-Match': etag } : {})
    if (r.status === 304) return
    const m = JSON.parse(r.text) as unknown
    if (!isManifest(m)) throw new Error('manifest has an unexpected shape')
    // The content service is the authority: any other release (even a lower number after a restore) is taken.
    if (current && m.hash === current.manifest.hash) return
    const missing = [...new Set(Object.values(m.files))]
    for (const h of missing) await fromDisk(h)
    const todo = missing.filter((h) => !files.has(h))
    // A few at a time; one failure aborts the whole update (tried again on the next poll).
    const fetched = new Map<string, Buffer>()
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(async (h) => {
        const { text } = await get(`${api}/api/public/v1/files/${h}`, MAX_FILE)
        if (hashOf(text) !== h) throw new Error(`file ${h}: contents do not match the hash`)
        JSON.parse(text)
        fetched.set(h, Buffer.from(text, 'utf8'))
      }))
    }
    for (const [h, body] of fetched) { await atomic(path(h), body); files.set(h, { body }) }
    await swap(m, true)
  }

  fromStore = fromDisk
  const loop = async () => {
    try { await sync(); if (lastError) log('content: syncing again'); lastError = '' } catch (e) {
      const msg = (e as Error).message
      // Say it once, not every 15 seconds.
      if (msg !== lastError) log(`content: sync failed: ${msg}`)
      lastError = msg
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
