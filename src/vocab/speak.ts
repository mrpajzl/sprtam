import { AUDIO_V } from './audio'
import { wordSlug } from './slug'
import type { VocabLang } from './types'

// Every word has a recording (public/audio/<lang>, made by scripts/vocab-audio.ts). The browser's own speech is
// only the fallback for when the file cannot be played (offline before it was ever loaded).
// Web Audio, not <audio>: Safari caps the media elements a page may hold (a new one per word went silent after
// a few rounds) and reloads a reused one on every word (it played late). Decoded words start at once.
const url = (lang: VocabLang, word: string) => `/audio/${lang}/${wordSlug(lang, word)}.mp3?v=${AUDIO_V}`
const buffers = new Map<string, Promise<AudioBuffer>>()
let ctx: AudioContext | null = null
let playing: AudioBufferSourceNode | null = null
let last = ''

function context() {
  if (!ctx || ctx.state === 'closed') {
    // Play even with the iPhone's silent switch on, like the <audio> it replaces.
    try { (navigator as { audioSession?: { type: string } }).audioSession!.type = 'playback' } catch { /* not Safari */ }
    ctx = new AudioContext()
  }
  return ctx
}

function buffer(lang: VocabLang, word: string) {
  const id = `${lang}:${word}`
  let b = buffers.get(id)
  if (!b) {
    // A whole-file fetch, which the service worker keeps for offline use.
    b = fetch(url(lang, word)).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer() })
      .then((data) => context().decodeAudioData(data))
    b.catch(() => { if (buffers.get(id) === b) buffers.delete(id) })
    buffers.set(id, b)
    // Keep only the current session's words around.
    if (buffers.size > 60) buffers.delete(buffers.keys().next().value!)
  }
  return b
}

/** Starts loading the words of a session, so they play at once (and offline, once the service worker has them). */
export function preload(lang: VocabLang, words: string[]) {
  for (const w of words) buffer(lang, w).catch(() => {})
}

function synth(text: string, lang: string) {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.9; speechSynthesis.speak(u)
  } catch { /* no TTS */ }
}

/** Says a word of `lang`: its recording, or the browser's voice `voice` (en-GB, de-DE…) when there is none. */
export function speak(lang: VocabLang, word: string, voice: string) {
  const id = `${lang}:${word}`
  try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel() } catch { /* no TTS */ }
  try { playing?.stop() } catch { /* already ended */ }
  playing = null
  last = id
  let c: AudioContext
  try { c = context() } catch { synth(word, voice); return }
  // Still inside the tap: wakes a context Safari suspended or interrupted (first use, phone call, background).
  if (c.state !== 'running') {
    c.resume().catch(() => {})
    // Older iOS unlocks only once a sound starts inside the tap: a silent one.
    try { const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start() } catch { /* fine */ }
  }
  buffer(lang, word).then((b) => {
    if (last !== id) return
    const s = c.createBufferSource()
    s.buffer = b
    s.connect(c.destination)
    s.start()
    playing = s
  }, () => { if (last === id) synth(word, voice) })
}
