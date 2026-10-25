import { AUDIO_V } from './audio'
import { audioSlug } from './slug'

// Every word has a recording (public/audio/en, made by scripts/vocab-audio.ts). The browser's own speech is
// only the fallback for when the file cannot be played (offline before it was ever loaded).
const url = (en: string) => `/audio/en/${audioSlug(en)}.mp3?v=${AUDIO_V}`
const ready = new Map<string, HTMLAudioElement>()
let playing: HTMLAudioElement | null = null

function element(en: string) {
  let a = ready.get(en)
  if (!a) {
    a = new Audio(url(en))
    a.preload = 'auto'
    ready.set(en, a)
    // Keep only the current session's words around.
    if (ready.size > 60) ready.delete(ready.keys().next().value!)
  }
  return a
}

/** Starts loading the words of a session, so they play at once (and offline, once the service worker has them). */
export function preload(words: string[]) {
  // A plain fetch first: the service worker keeps only whole files, and audio elements ask for byte ranges.
  for (const en of words) if (!ready.has(en)) fetch(url(en)).then(() => element(en), () => {})
}

function synth(en: string, lang: string) {
  try { const u = new SpeechSynthesisUtterance(en); u.lang = lang; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { /* no TTS */ }
}

export function speak(en: string, lang = 'en-GB') {
  playing?.pause()
  try { speechSynthesis.cancel() } catch { /* no TTS */ }
  const a = element(en)
  playing = a
  a.currentTime = 0
  a.play().catch((e: DOMException) => {
    if (playing !== a || e.name === 'AbortError') return
    // A failed load leaves the element broken; the next try gets a fresh one.
    ready.delete(en)
    synth(en, lang)
  })
}
