import type { JSX } from 'preact'
import { useId } from 'preact/hooks'
import type { ObjectS } from '../content/schema'

// The widget standard. Every widget is one file in src/widgets/<name>.tsx whose default export is
// `defineWidget({...})`, listed once in src/widgets/index.ts. Shared controls live here, so widgets
// look and behave the same. How to write one: docs/WIDGETY.md (generated) and docs/CONTENT.md.

export interface WidgetExample<P> {
  /** What the example shows, e.g. „Tři čtvrtiny“. */
  title: string
  props: P
}

export interface WidgetDef<P = any> {
  /** Name used in content: `{ "type": "widget", "widget": "<name>", "props": {…} }`. Kebab-case, equals the file name. Never renamed. */
  name: string
  /** Czech name shown in the gallery. */
  title: string
  /** What the pupil sees and does, in one or two sentences. */
  summary: string
  /** Which topics it suits – helps authors pick the right widget instead of creating a new one. */
  use: string
  /** The props, with a Czech description of every field. Also generates the JSON Schema and the docs. */
  props: ObjectS<P>
  /** At least one; shown in the gallery and checked by the validator. */
  examples: WidgetExample<P>[]
  /** Rules the schema cannot express (an answer index in range, a solvable equation…). Returns problems in English. */
  check?: (p: P) => string[]
  Component: (p: P) => JSX.Element
  /**
   * The task only, for use above a quiz question (`"widget"` of an `input` question). Must not give the answer away.
   * Widgets without it cannot be used in questions.
   */
  Question?: (p: P) => JSX.Element
  /** Checks a question that shows this widget, e.g. that the accepted answers contain the real result. */
  checkQuestion?: (p: P, answers: string[]) => string[]
  /** Readable static HTML for the prerendered page (search engines, before JS loads). Omit when there is no text worth reading. */
  html?: (p: P, inline: (text: string) => string) => string
}

export const defineWidget = <P,>(def: WidgetDef<P>): WidgetDef<P> => def

// ——— Shared helpers ———

/** 3.5 → „3,5“, −2 → „−2“ (Czech decimal comma, real minus sign). */
export const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',').replace('-', '−')
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
export const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

// ——— Shared controls ———

/** − value + */
export function Step({ label, value, set, min, max }: { label?: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div class="step">
      <button onClick={() => set(Math.max(min, value - 1))} aria-label="Méně">−</button>
      <span>{label ?? value}</span>
      <button onClick={() => set(Math.min(max, value + 1))} aria-label="Více">+</button>
    </div>
  )
}

/** Named range slider with the current value. */
export function Slider({ name, value, set, min, max, step = 1 }: { name: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label class="slider">
      <span>{name}</span>
      <input type="range" min={min} max={max} step={step} value={value} onInput={(e) => set(Number(e.currentTarget.value))} />
      <output>{fmt(value)}</output>
    </label>
  )
}

/** Coordinate grid −6…6 with the graph of f (used by the function widgets). */
export function Graph({ f }: { f: (x: number) => number }) {
  const clip = `gc${useId()}` // unique: several graphs can share a page (the gallery)
  const S = 20, N = 6, W = 2 * N * S
  const X = (x: number) => W / 2 + x * S, Y = (y: number) => W / 2 - y * S
  let d = ''
  for (let i = 0; i <= 240; i++) {
    const x = -N + (i / 240) * 2 * N, y = f(x)
    if (Math.abs(y) > N * 3) { d += ' '; continue }
    d += `${d.endsWith(' ') || !d ? 'M' : 'L'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`
  }
  return (
    <svg viewBox={`0 0 ${W} ${W}`} width="260">
      <defs><clipPath id={clip}><rect width={W} height={W} /></clipPath></defs>
      {Array.from({ length: 2 * N + 1 }, (_, i) => <g key={i}><line x1={i * S} x2={i * S} y1={0} y2={W} stroke="var(--line)" /><line y1={i * S} y2={i * S} x1={0} x2={W} stroke="var(--line)" /></g>)}
      <line x1={0} x2={W} y1={W / 2} y2={W / 2} stroke="var(--ink-3)" stroke-width="2" />
      <line y1={0} y2={W} x1={W / 2} x2={W / 2} stroke="var(--ink-3)" stroke-width="2" />
      <text x={W - 10} y={W / 2 - 6} font-size="12" font-weight="800" fill="var(--ink-2)">x</text>
      <text x={W / 2 + 6} y={12} font-size="12" font-weight="800" fill="var(--ink-2)">y</text>
      <path d={d.replace(/ M/g, 'M').trim()} fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round" clip-path={`url(#${clip})`} />
    </svg>
  )
}
