import { ALL_GRADES } from '../content/curriculum'
import { allTopicKeys } from '../content'
import { allWords } from '../vocab'
import { stars, type Progress } from './store'

// Generic pack/unpack: JSON → deflate → base64url with a version digit and a
// 6-char SHA-256 checksum, so a mistyped or truncated code is rejected.

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function pipe(data: Uint8Array, t: CompressionStream | DecompressionStream) {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(t)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function checksum(s: string) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
  return b64(h).slice(0, 6)
}

async function seal(version: string, bytes: Uint8Array) {
  const body = b64(bytes)
  return `${version}${await checksum(body)}${body}`
}

async function open(code: string, version: string) {
  const c = code.trim().replace(/\s+/g, '')
  if (c[0] !== version) throw new Error('Neznámý kód')
  const sum = c.slice(1, 7), body = c.slice(7)
  if ((await checksum(body)) !== sum) throw new Error('Kód je poškozený')
  return unb64(body)
}

export const pack = async (data: unknown) => seal('1', await pipe(new TextEncoder().encode(JSON.stringify(data)), new CompressionStream('deflate-raw')))
export const unpack = async <T,>(code: string): Promise<T> => JSON.parse(new TextDecoder().decode(await pipe(await open(code, '1'), new DecompressionStream('deflate-raw'))))

// Progress code (version 2) – small enough for a QR code.
// Each item is 3 bytes: a 21-bit hash of its name + 3 bits of state.
//   topic: stars (0–3) and the preferred explanation; word: Leitner box (0–5).
// The receiving app maps hashes back using its own list of topics and words.

const h21 = (s: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0) >>> 11
}

function varint(n: number, out: number[]) { while (n > 127) { out.push((n & 127) | 128); n >>>= 7 } out.push(n) }

export async function encodeProgress(p: Progress): Promise<string> {
  const out: number[] = [p.g ? ALL_GRADES.indexOf(p.g) : 255]
  const topics = Object.entries(p.t).filter(([, v]) => stars(v.s) > 0 || v.e)
  const words = Object.entries(p.w).filter(([, b]) => b > 0)
  const item = (hash: number, bits: number) => { const x = (hash << 3) | bits; out.push(x >>> 16, (x >>> 8) & 255, x & 255) }
  varint(topics.length, out)
  for (const [k, v] of topics) item(h21(k), (stars(v.s) << 1) | (v.e ?? 0))
  for (const [w, b] of words) item(h21(w), b)
  return seal('2', new Uint8Array(out))
}

const STAR_SCORE = [0, 40, 70, 90]

export async function decodeProgress(code: string): Promise<Progress> {
  const bytes = await open(code, '2')
  const [keys, words] = await Promise.all([allTopicKeys(), allWords()])
  const topicBy = new Map(keys.map((k) => [h21(k), k]))
  const wordBy = new Map(words.map((w) => [h21(w), w]))
  let i = 1, n = 0, shift = 0
  for (;;) { const b = bytes[i++]; n |= (b & 127) << shift; shift += 7; if (!(b & 128)) break }
  const p: Progress = { v: 1, t: {}, w: {}, g: bytes[0] < ALL_GRADES.length ? ALL_GRADES[bytes[0]] : undefined }
  const day = Math.floor(Date.now() / 86_400_000)
  for (let k = 0; i + 2 < bytes.length; k++, i += 3) {
    const x = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    const hash = x >>> 3, bits = x & 7
    if (k < n) { const key = topicBy.get(hash); if (key) p.t[key] = { s: STAR_SCORE[bits >> 1], n: 1, d: day, ...(bits & 1 ? { e: 1 as const } : {}) } }
    else { const w = wordBy.get(hash); if (w) p.w[w] = bits }
  }
  return p
}

/** A link that imports the progress when opened (code is in the #fragment, never sent to a server). */
export const shareUrl = (code: string) => `${location.origin}${location.pathname}#/p/${code}`
