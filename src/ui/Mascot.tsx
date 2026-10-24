// Šprťa: a little pocket device with a screen for a face.
export type Mood = 'idle' | 'happy' | 'sad' | 'wow'

const EYES: Record<Mood, preact.JSX.Element> = {
  idle: <g class="eyes"><rect x="22" y="24" width="5" height="8" rx="2.5" /><rect x="37" y="24" width="5" height="8" rx="2.5" /></g>,
  happy: <g fill="none" stroke-width="3" stroke-linecap="round"><path d="M21.5 30l3-4 3 4M36.5 30l3-4 3 4" /></g>,
  sad: <g fill="none" stroke-width="3" stroke-linecap="round"><path d="M21.5 29l5-2M42.5 29l-5-2" /></g>,
  wow: <g><circle cx="24.5" cy="28" r="3.6" /><circle cx="39.5" cy="28" r="3.6" /></g>,
}

const MOUTH: Record<Mood, string> = {
  idle: 'M29 35.5q3 2 6 0',
  happy: 'M27 34.5q5 4.5 10 0',
  sad: 'M28 37q4-3 8 0',
  wow: 'M30.5 36a1.5 1.5 0 0 0 3 0a1.5 1.5 0 0 0-3 0',
}

export function Mascot({ mood = 'idle', size = 64 }: { mood?: Mood; size?: number }) {
  return (
    <svg class={`mascot ${mood}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path class="ant" d="M32 11V5" stroke="var(--ink-strong)" stroke-width="2.5" stroke-linecap="round" />
      <circle class="ant-tip" cx="32" cy="4.5" r="3" fill="var(--k-orange)" />
      <rect x="21" y="49" width="6" height="7" rx="2" fill="var(--ink-strong)" />
      <rect x="37" y="49" width="6" height="7" rx="2" fill="var(--ink-strong)" />
      <rect x="8" y="11" width="48" height="40" rx="12" fill="var(--k-orange)" />
      <circle cx="49" cy="17.5" r="2.4" fill="var(--ink-strong)" />
      <rect x="14" y="18" width="34" height="25" rx="7" fill="#141518" />
      <g fill="#f4f4f1" stroke="#f4f4f1">{EYES[mood]}</g>
      <path d={MOUTH[mood]} fill={mood === 'wow' ? '#f4f4f1' : 'none'} stroke="#f4f4f1" stroke-width="2.4" stroke-linecap="round" />
    </svg>
  )
}
