import type { Manifest } from './manifest'

// The content of the app comes from the content API (docs/OBSAH.md): a small manifest of the current release
// and files named by the hash of their contents. The manifest is embedded in every page the server sends;
// offline (the precached app.html shell) it comes from the service worker's cache or from the last one kept
// in localStorage. Files are cached by the service worker forever – a new release means new hashes.

const STORE = 'sprtam:manifest'
const CACHE = 'content' // the service worker's cache of /api/content/f/* (vite.config.ts)
const REFRESH = 10 * 60_000

let current: Manifest | undefined
const listeners = new Set<(m: Manifest) => void>()

const valid = (m: unknown): m is Manifest => !!m && typeof m === 'object' && (m as Manifest).format === 1 && typeof (m as Manifest).files === 'object' && Array.isArray((m as Manifest).approaches)

/** The manifest in use (set by initContent before the first render). */
export function manifest(): Manifest {
  if (!current) throw new Error('content manifest not loaded')
  return current
}

/** Called now (when loaded) and with every newer release. */
export function onManifest(f: (m: Manifest) => void) {
  listeners.add(f)
  if (current) f(current)
  return () => { listeners.delete(f) }
}

function use(m: Manifest) {
  if (current && current.hash === m.hash) return
  current = m
  try { localStorage.setItem(STORE, JSON.stringify(m)) } catch { /* full or private mode */ }
  listeners.forEach((f) => f(m))
}

async function fetchManifest(): Promise<Manifest | undefined> {
  try {
    const res = await fetch('/api/content/manifest', { cache: 'no-cache' })
    const m = res.ok ? await res.json() : undefined
    return valid(m) ? m : undefined
  } catch { return undefined }
}

const parse = (text: string | null | undefined) => { try { const m = JSON.parse(text ?? 'null'); return valid(m) ? m : undefined } catch { return undefined } }

/**
 * Loads the manifest. A page from the server carries the current one. The offline shell (app.html) does
 * not: then the newer of the last one this device used (whose files keepOffline cached) and the one the
 * service worker answers with.
 */
export async function initContent(): Promise<boolean> {
  const embedded = parse(document.getElementById('sprtam-manifest')?.textContent)
  if (embedded) use(embedded)
  else {
    const kept = parse((() => { try { return localStorage.getItem(STORE) } catch { return null } })())
    const fetched = await fetchManifest()
    const best = kept && fetched ? (fetched.release >= kept.release ? fetched : kept) : kept ?? fetched
    if (best) use(best)
  }
  if (!current) return false
  // Pick up new releases: when the app comes back to the screen, and every few minutes while it is open.
  // Only newer ones – an older answer would be the service worker's cache on a bad connection.
  const refresh = () => { if (document.visibilityState === 'visible' && navigator.onLine) fetchManifest().then((m) => m && m.release > current!.release && use(m)) }
  document.addEventListener('visibilitychange', refresh)
  setInterval(refresh, REFRESH)
  return true
}

const files = new Map<string, Promise<unknown>>()

/** A file of a release by hash (cached for the visit; the service worker keeps it for offline use). */
export function loadHash<T>(hash: string): Promise<T> {
  let p = files.get(hash)
  if (!p) {
    p = fetch(`/api/content/f/${hash}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`content ${r.status}`))))
    p.catch(() => files.delete(hash))
    files.set(hash, p)
  }
  return p as Promise<T>
}

/** A file of the current release by name (manifest.ts lists the names). */
export function loadFile<T>(name: string): Promise<T> {
  const h = current?.files[name]
  return h ? loadHash<T>(h) : Promise.reject(new Error(`missing ${name}`))
}

/**
 * Makes the whole app work offline: puts every file of the current release into the service worker's cache
 * (the window can write it directly, so this works even before the service worker controls the page) and
 * drops files of older releases. Runs when the browser is idle.
 */
export function keepOffline() {
  if (!('caches' in window) || !current) return
  const run = async () => {
    const m = current!
    const urls = new Set(Object.values(m.files).map((h) => new URL(`/api/content/f/${h}.json`, location.origin).href))
    try {
      const cache = await caches.open(CACHE)
      const have = new Set((await cache.keys()).map((r) => r.url))
      for (const url of urls) if (!have.has(url)) await cache.add(url)
      // Only after everything of this release is in: older files may still serve a page opened earlier.
      for (const url of have) if (!urls.has(url)) await cache.delete(url)
    } catch { /* offline or storage full: next time */ }
  }
  const idle = (window as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  const start = () => (idle ? idle(() => void run(), { timeout: 10_000 }) : setTimeout(run, 3000))
  start()
  listeners.add(() => start()) // and again for every new release
}
