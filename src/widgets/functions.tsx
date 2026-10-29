import { useState } from 'preact/hooks'
import type { JSX } from 'preact'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, gcd, Graph, Slider } from './kit'

const TYPES = ['reciprocal', 'abs', 'sqrt', 'exp', 'log', 'sin', 'cos', 'tan'] as const
type Kind = (typeof TYPES)[number]

const props = s.object({
  type: s.enum(TYPES, { description: 'Funkce: "reciprocal" nepřímá úměrnost y = a/(x − b) + c, "abs" absolutní hodnota y = a|x − b| + c, "sqrt" odmocnina y = a√(x − b) + c, "exp" exponenciální y = a^(x − b) + c, "log" logaritmická y = logₐ(x − b) + c, "sin"/"cos"/"tan" goniometrická y = a sin(bx) + c (tan = tg).' }),
  a: s.optional(s.number({ min: -6, max: 6, description: 'Parametr a. Exponenciální a logaritmická: základ 0,25–4 po 0,25, ne 1. Nepřímá úměrnost: −6 až 6 po 0,5. Ostatní: −3 až 3 po 0,5. Nesmí být 0.' })),
  b: s.optional(s.number({ min: -4, max: 4, description: 'Parametr b. Goniometrické: číslo u x (0,5–3 po 0,5, mění periodu). Ostatní: posun doprava (celé číslo −4 až 4).' })),
  c: s.optional(s.number({ min: -4, max: 4, description: 'Parametr c: posun nahoru (celé číslo −4 až 4).' })),
  choices: s.optional(s.array(s.enum(TYPES), { min: 2, max: 8, description: 'Mezi kterými funkcemi může dítě přepínat (tlačítka nad grafem). Bez toho jen „type“.' })),
}, { description: 'Graf funkce s posuvníky parametrů a vlastnostmi (D, H, průsečíky, monotonie, perioda).' })
type P = Infer<typeof props>

interface Range { min: number; max: number; step: number }
interface Spec { name: string; general: string; a: Range; b: Range; c: Range; def: [number, number, number] }
const SHIFT: Range = { min: -4, max: 4, step: 1 }
const BASE: Range = { min: 0.25, max: 4, step: 0.25 }
const COEF: Range = { min: -3, max: 3, step: 0.5 }
const FREQ: Range = { min: 0.5, max: 3, step: 0.5 }
const VSHIFT: Range = { min: -3, max: 3, step: 1 }
const SPECS: Record<Kind, Spec> = {
  reciprocal: { name: 'Nepřímá úměrnost', general: 'y = a/(x − b) + c', a: { min: -6, max: 6, step: 0.5 }, b: SHIFT, c: SHIFT, def: [2, 0, 0] },
  abs: { name: 'Absolutní hodnota', general: 'y = a|x − b| + c', a: COEF, b: SHIFT, c: SHIFT, def: [1, 0, 0] },
  sqrt: { name: 'Odmocnina', general: 'y = a√(x − b) + c', a: COEF, b: SHIFT, c: SHIFT, def: [1, 0, 0] },
  exp: { name: 'Exponenciální', general: 'y = aˣ⁻ᵇ + c', a: BASE, b: SHIFT, c: SHIFT, def: [2, 0, 0] },
  log: { name: 'Logaritmická', general: 'y = logₐ(x − b) + c', a: BASE, b: SHIFT, c: SHIFT, def: [2, 0, 0] },
  sin: { name: 'Sinus', general: 'y = a · sin(bx) + c', a: COEF, b: FREQ, c: VSHIFT, def: [1, 1, 0] },
  cos: { name: 'Kosinus', general: 'y = a · cos(bx) + c', a: COEF, b: FREQ, c: VSHIFT, def: [1, 1, 0] },
  tan: { name: 'Tangens', general: 'y = a · tg(bx) + c', a: COEF, b: FREQ, c: VSHIFT, def: [1, 1, 0] },
}
const TRIG = (t: Kind) => t === 'sin' || t === 'cos' || t === 'tan'
const BASED = (t: Kind) => t === 'exp' || t === 'log'

/** y = f(x); outside the domain or next to an asymptote returns Infinity (Graph then breaks the line). */
export function value(t: Kind, a: number, b: number, c: number, x: number): number {
  const X = x - b
  switch (t) {
    case 'reciprocal': return Math.abs(X) < 0.03 ? Infinity : a / X + c
    case 'abs': return a * Math.abs(X) + c
    case 'sqrt': return X < -1e-9 ? Infinity : a * Math.sqrt(Math.max(0, X)) + c
    case 'exp': return a ** X + c
    case 'log': return X <= 1e-9 ? Infinity : Math.log(X) / Math.log(a) + c
    case 'sin': return a * Math.sin(b * x) + c
    case 'cos': return a * Math.cos(b * x) + c
    case 'tan': {
      const k = (b * x) / Math.PI - 0.5
      return (Math.abs(k - Math.round(k)) * Math.PI) / b < 0.05 ? Infinity : a * Math.tan(b * x) + c
    }
  }
}

// ——— Formatting ———

const n = (x: number) => fmt(x)
/** Approximate numbers get „≈“. */
const approx = (x: number) => (Math.abs(x * 100 - Math.round(x * 100)) > 1e-6 ? '≈ ' : '') + fmt(x)
const plus = (x: number) => (x === 0 ? '' : x > 0 ? ` + ${n(x)}` : ` − ${n(-x)}`)
const inner = (b: number) => (b === 0 ? 'x' : b > 0 ? `x − ${n(b)}` : `x + ${n(-b)}`)
const coef = (a: number) => (a === 1 ? '' : a === -1 ? '−' : n(a))
const lo = (x: number | null, closed: boolean) => (x === null ? '(−∞' : `${closed ? '⟨' : '('}${n(x)}`)
const hi = (x: number | null, closed: boolean) => (x === null ? '∞)' : `${n(x)}${closed ? '⟩' : ')'}`)
const iv = (a: number | null, b: number | null, ca = false, cb = false) => `${lo(a, ca)}; ${hi(b, cb)}`

/** r·π as text, r = p/q: π, 2π, π/2, −2π/3… */
function pi(p: number, q: number, k = '') {
  if (p === 0) return '0'
  const g = gcd(Math.abs(p), Math.abs(q)); p /= g; q /= g
  if (q < 0) { p = -p; q = -q }
  return `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : Math.abs(p)}${k}π${q === 1 ? '' : `/${q}`}`
}
/** a·π + k·T for b = h/2 (h = 2b is an integer): the offset p/q·π divided by b. */
const piB = (p: number, q: number, b: number) => [p * 2, q * Math.round(2 * b)] as const
const sumPi = (off: string, step: string) => (off === '0' ? step : `${off} + ${step}`)

function Formula({ t, a, b, c }: { t: Kind; a: number; b: number; c: number }): JSX.Element {
  const bx = b === 1 ? 'x' : `${n(b)}x`
  switch (t) {
    case 'reciprocal': return <>y = {n(a)}/{b === 0 ? 'x' : `(${inner(b)})`}{plus(c)}</>
    case 'abs': return <>y = {coef(a)}|{inner(b)}|{plus(c)}</>
    case 'sqrt': return <>y = {coef(a)}√{b === 0 ? 'x' : `(${inner(b)})`}{plus(c)}</>
    case 'exp': return <>y = {a < 1 ? `(${n(a)})` : n(a)}<sup>{inner(b)}</sup>{plus(c)}</>
    case 'log': return <>y = log<sub>{n(a)}</sub>{b === 0 ? ' x' : `(${inner(b)})`}{plus(c)}</>
    default: {
      const f = t === 'tan' ? 'tg' : t
      return <>y = {coef(a)}{a !== 1 && a !== -1 ? ' · ' : ''}{f} {b === 1 ? 'x' : `(${bx})`}{plus(c)}</>
    }
  }
}

const formulaText = (t: Kind, a: number, b: number, c: number) => {
  switch (t) {
    case 'exp': return `y = ${a < 1 ? `(${n(a)})` : n(a)}^(${inner(b)})${plus(c)}`
    case 'log': return `y = log_${n(a)}(${inner(b)})${plus(c)}`
    case 'reciprocal': return `y = ${n(a)}/${b === 0 ? 'x' : `(${inner(b)})`}${plus(c)}`
    case 'abs': return `y = ${coef(a)}|${inner(b)}|${plus(c)}`
    case 'sqrt': return `y = ${coef(a)}√${b === 0 ? 'x' : `(${inner(b)})`}${plus(c)}`
    default: return `y = ${coef(a)}${a !== 1 && a !== -1 ? ' · ' : ''}${t === 'tan' ? 'tg' : t} ${b === 1 ? 'x' : `(${n(b)}x)`}${plus(c)}`
  }
}

/** Properties of the function as [label, text] rows. */
export function properties(t: Kind, a: number, b: number, c: number): [string, string][] {
  const rows: [string, string][] = []
  const f = (x: number) => value(t, a, b, c, x)
  const up = a > 0 // for exp/log: base > 1
  const grow = BASED(t) ? a > 1 : up
  // Domain and range
  const D = { reciprocal: `ℝ ∖ {${n(b)}}`, abs: 'ℝ', sqrt: iv(b, null, true), exp: 'ℝ', log: iv(b, null), sin: 'ℝ', cos: 'ℝ', tan: '' }
  const H = {
    reciprocal: `ℝ ∖ {${n(c)}}`, abs: up ? iv(c, null, true) : iv(null, c, false, true), sqrt: up ? iv(c, null, true) : iv(null, c, false, true),
    exp: iv(c, null), log: 'ℝ', sin: iv(c - Math.abs(a), c + Math.abs(a), true, true), cos: iv(c - Math.abs(a), c + Math.abs(a), true, true), tan: 'ℝ',
  }
  const h = Math.round(2 * b) // b = h/2 for the trigonometric functions
  if (t === 'tan') {
    const [p, q] = piB(1, 2, b), [sp, sq] = piB(1, 1, b)
    D.tan = `x ≠ ${sumPi(pi(p, q), pi(sp, sq, 'k'))}, k ∈ ℤ`
  }
  rows.push(['D(f)', D[t]], ['H(f)', H[t]])
  // Intersections with the axes
  const y0 = f(0)
  const py = Number.isFinite(y0) ? `[0; ${approx(y0)}]` : 'není (0 ∉ D)'
  let px = ''
  const pts = (xs: number[]) => xs.map((x) => `[${approx(x)}; 0]`).join(', ')
  switch (t) {
    case 'reciprocal': px = c === 0 ? 'není' : pts([b - a / c]); break
    case 'abs': case 'sqrt': {
      const r = -c / a
      px = r < 0 ? 'není' : r === 0 ? pts([b]) : t === 'abs' ? pts([b - r, b + r]) : pts([b + r * r])
      break
    }
    case 'exp': px = c < 0 ? pts([b + Math.log(-c) / Math.log(a)]) : 'není'; break
    case 'log': px = pts([b + a ** -c]); break
    default: {
      const r = -c / a
      if (t !== 'tan' && Math.abs(r) > 1) { px = 'není'; break }
      if (r === 0) {
        // sin, tg: bx = kπ; cos: bx = π/2 + kπ
        const [sp, sq] = piB(1, 1, b)
        const [p, q] = piB(1, 2, b)
        px = `x = ${t === 'cos' ? sumPi(pi(p, q), pi(sp, sq, 'k')) : pi(sp, sq, 'k')}, k ∈ ℤ`
        break
      }
      const xs: number[] = []
      const T = (t === 'tan' ? Math.PI : 2 * Math.PI) / b
      const base = t === 'sin' ? [Math.asin(r), Math.PI - Math.asin(r)] : t === 'cos' ? [Math.acos(r), -Math.acos(r)] : [Math.atan(r)]
      for (const x0 of base) for (let k = -12; k <= 12; k++) { const x = x0 / b + k * T; if (x >= -6 && x <= 6 && !xs.some((y) => Math.abs(y - x) < 1e-6)) xs.push(x) }
      const near = xs.sort((p, q) => Math.abs(p) - Math.abs(q)).slice(0, 4).sort((p, q) => p - q)
      px = `nekonečně mnoho, např. x ${near.some((x) => approx(x).startsWith("≈")) ? "≈ " : "= "}${near.map((x) => fmt(x)).join("; ")}…`
    }
  }
  rows.push(['Průsečíky s osou x', px], ['Průsečík s osou y', py])
  // Monotonicity
  let mono = ''
  switch (t) {
    case 'reciprocal': mono = `${up ? 'klesající' : 'rostoucí'} na ${iv(null, b)} a zvlášť na ${iv(b, null)} (ne na celém D)`; break
    case 'abs': mono = up ? `klesající na ${iv(null, b, false, true)}, rostoucí na ${iv(b, null, true)}` : `rostoucí na ${iv(null, b, false, true)}, klesající na ${iv(b, null, true)}`; break
    case 'sqrt': case 'exp': case 'log': mono = grow ? 'rostoucí na celém D(f)' : 'klesající na celém D(f)'; break
    case 'tan': {
      const [p, q] = piB(1, 2, b), [sp, sq] = piB(1, 1, b)
      mono = `${up ? 'rostoucí' : 'klesající'} na každém intervalu (${sumPi(pi(-p, q), pi(sp, sq, 'k'))}; ${sumPi(pi(p, q), pi(sp, sq, 'k'))})`
      break
    }
    default: {
      // sin: rises on ⟨−π/2; π/2⟩ + 2kπ, cos: rises on ⟨−π; 0⟩ + 2kπ (for a > 0), all divided by b
      const [p1, q1] = t === 'sin' ? piB(-1, 2, b) : piB(-1, 1, b), [p2, q2] = t === 'sin' ? piB(1, 2, b) : [0, 1]
      const [p3, q3] = t === 'sin' ? piB(3, 2, b) : piB(1, 1, b)
      const [sp, sq] = piB(2, 1, b)
      const k = pi(sp, sq, 'k')
      const rise = `⟨${sumPi(pi(p1, q1), k)}; ${sumPi(pi(p2, q2), k)}⟩`, fall = `⟨${sumPi(pi(p2, q2), k)}; ${sumPi(pi(p3, q3), k)}⟩`
      mono = up ? `rostoucí na ${rise}, klesající na ${fall}` : `klesající na ${rise}, rostoucí na ${fall}`
    }
  }
  rows.push(['Monotonie', mono])
  if (TRIG(t)) rows.push(['Perioda', t === 'tan' ? pi(2, h) : pi(4, h)])
  const asym = t === 'reciprocal' ? `x = ${n(b)}, y = ${n(c)}` : t === 'exp' ? `y = ${n(c)}` : t === 'log' ? `x = ${n(b)}` : ''
  if (asym) rows.push(['Asymptoty', asym])
  return rows
}

const clamp = (r: Range, v: number) => Math.min(r.max, Math.max(r.min, v))
function start(t: Kind, p?: Partial<P>): [number, number, number] {
  const sp = SPECS[t], d = sp.def
  return [clamp(sp.a, p?.a ?? d[0]), clamp(sp.b, p?.b ?? d[1]), clamp(sp.c, p?.c ?? d[2])]
}

function Functions(p: P) {
  const [t, setT] = useState<Kind>(p.type)
  const [[a, b, c], setV] = useState(() => start(p.type, p))
  const sp = SPECS[t]
  const pick = (k: Kind) => { setT(k); setV(k === p.type ? start(k, p) : start(k)) }
  // a must never be 0 (nor 1 for a base); the slider skips those values in the direction of travel.
  const setA = (v: number) => setV([BASED(t) ? (v === 1 ? (a < 1 ? 1.25 : 0.75) : v) : v === 0 ? (a < 0 ? sp.a.step : -sp.a.step) : v, b, c])
  const rows = properties(t, a, b, c)
  return (
    <div class="w functions">
      {p.choices && (
        <div class="chips functions-types" role="group" aria-label="Druh funkce">
          {p.choices.map((k) => (
            <button key={k} class={`chip${k === t ? ' sel' : ''}`} aria-pressed={k === t} onClick={() => pick(k)}>{SPECS[k].name}</button>
          ))}
        </div>
      )}
      <Graph f={(x) => value(t, a, b, c, x)} />
      <div class="val" aria-live="polite" aria-label={formulaText(t, a, b, c)}><Formula t={t} a={a} b={b} c={c} /></div>
      <div class="sub">{sp.name}: {sp.general}</div>
      <Slider name="a" value={a} set={setA} min={sp.a.min} max={sp.a.max} step={sp.a.step} />
      <Slider name="b" value={b} set={(v) => setV([a, v, c])} min={sp.b.min} max={sp.b.max} step={sp.b.step} />
      <Slider name="c" value={c} set={(v) => setV([a, b, v])} min={sp.c.min} max={sp.c.max} step={sp.c.step} />
      <dl class="functions-props">
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </div>
  )
}

const onGrid = (r: Range, v: number) => v >= r.min - 1e-9 && v <= r.max + 1e-9 && Math.abs((v - r.min) / r.step - Math.round((v - r.min) / r.step)) < 1e-9

export default defineWidget({
  name: 'functions',
  title: 'Graf funkce',
  summary: 'Graf nepřímé úměrnosti, absolutní hodnoty, odmocniny, exponenciální, logaritmické a goniometrických funkcí. Dítě posuvníky mění parametry a, b, c; pod grafem je předpis s dosazenými čísly a vlastnosti: definiční obor, obor hodnot, průsečíky s osami, monotonie, perioda a asymptoty.',
  use: 'Nepřímá úměrnost (9. třída), funkce na SŠ: absolutní hodnota, odmocnina, exponenciální a logaritmická funkce, sinus, kosinus, tangens; vliv parametrů na graf a vlastnosti funkcí. Lineární a kvadratická funkce mají vlastní widgety linear a quadratic.',
  props,
  examples: [
    { title: 'Nepřímá úměrnost y = 6/x', props: { type: 'reciprocal', a: 6 } },
    { title: 'Exponenciální a logaritmická', props: { type: 'exp', a: 2, choices: ['exp', 'log'] } },
    { title: 'Goniometrické funkce', props: { type: 'sin', a: 2, b: 1, c: 0, choices: ['sin', 'cos', 'tan'] } },
  ],
  check: (p) => {
    const e: string[] = []
    const sp = SPECS[p.type]
    const names = { a: sp.a, b: sp.b, c: sp.c } as const
    for (const k of ['a', 'b', 'c'] as const) {
      const v = p[k]
      if (v !== undefined && !onGrid(names[k], v)) e.push(`${k} = ${v} is outside ${names[k].min}…${names[k].max} (step ${names[k].step}) for type ${p.type}`)
    }
    if (p.a === 0) e.push('a must not be 0')
    if (BASED(p.type) && p.a === 1) e.push('the base a must not be 1')
    if (p.choices) {
      if (!p.choices.includes(p.type)) e.push('choices must include type')
      if (new Set(p.choices).size !== p.choices.length) e.push('duplicate choices')
    }
    return e
  },
  Component: Functions,
  html: (p, inline) => {
    const [a, b, c] = start(p.type, p)
    return `<p>${inline(`${SPECS[p.type].name}: ${formulaText(p.type, a, b, c)}`)}</p><ul>${properties(p.type, a, b, c).map(([k, v]) => `<li>${inline(`${k}: ${v}`)}</li>`).join('')}</ul>`
  },
})
