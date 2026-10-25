import { AUDIO_V } from './audio'
import { audioSlug } from './slug'

// Every word has a recording (public/audio/en, made by scripts/vocab-audio.ts). The browser's own speech is
// only the fallback for when the file cannot be played (offline before it was ever loaded).
const url = (en: string) => `/audio/en/${audioSlug(en)}.mp3?v=${AUDIO_V}`
// One element for every word: Safari caps how many media elements a page may hold and does not free dropped
// ones soon, so a new element per word made it go silent after a few rounds. Playing it once from a tap also
// unlocks it for good.
let player: HTMLAudioElement | null = null
const warm = new Set<string>()

/** Starts loading the words of a session, so they play at once (and offline, once the service worker has them). */
export function preload(words: string[]) {
  // A plain fetch: the service worker keeps only whole files, and audio elements ask for byte ranges.
  for (const en of words) if (!warm.has(en)) { warm.add(en); fetch(url(en)).catch(() => warm.delete(en)) }
}

function synth(en: string, lang: string) {
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(en); u.lang = lang; u.rate = 0.9; speechSynthesis.speak(u)
  } catch { /* no TTS */ }
}

export function speak(en: string, lang = 'en-GB') {
  try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel() } catch { /* no TTS */ }
  const a = player ??= new Audio()
  const src = new URL(url(en), location.href).href
  if (a.src === src && !a.error) { a.pause(); a.currentTime = 0 } else { a.src = src }
  a.play().catch((e: DOMException) => {
    // AbortError: another word took over. Anything else: the file is not playable, say it instead.
    if (a.src !== src || e.name === 'AbortError') return
    synth(en, lang)
  })
}
