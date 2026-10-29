import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// Resistor colour code (IEC 60062). 4 bands: digit, digit, multiplier, tolerance;
// 5 bands: digit, digit, digit, multiplier, tolerance. Band colours are content, so they are
// hard-coded; every band is also labelled with the colour's name (screen readers, colour blindness).

const COLORS = ['černá', 'hnědá', 'červená', 'oranžová', 'žlutá', 'zelená', 'modrá', 'fialová', 'šedá', 'bílá', 'zlatá', 'stříbrná'] as const
type Color = (typeof COLORS)[number]
interface Info { hex: string; digit?: number; exp?: number; tol?: number }
const INFO: Record<Color, Info> = {
  černá: { hex: '#1c1c1c', digit: 0, exp: 0 },
  hnědá: { hex: '#7b4a26', digit: 1, exp: 1, tol: 1 },
  červená: { hex: '#d42a22', digit: 2, exp: 2, tol: 2 },
  oranžová: { hex: '#f07c12', digit: 3, exp: 3 },
  žlutá: { hex: '#f5d020', digit: 4, exp: 4 },
  zelená: { hex: '#22913c', digit: 5, exp: 5, tol: 0.5 },
  modrá: { hex: '#1f5fc9', digit: 6, exp: 6, tol: 0.25 },
  fialová: { hex: '#7d3cb5', digit: 7, exp: 7, tol: 0.1 },
  šedá: { hex: '#8c8c8c', digit: 8, exp: 8 },
  bílá: { hex: '#f6f6f2', digit: 9, exp: 9 },
  zlatá: { hex: '#c7a03a', exp: -1, tol: 5 },
  stříbrná: { hex: '#b9bec4', exp: -2, tol: 10 },
}

const props = s.object({
  bands: s.array(s.enum(COLORS), { min: 4, max: 5, description: 'Barvy proužků zleva. 4 proužky: 1. číslice, 2. číslice, násobitel, tolerance. 5 proužků: 3 číslice, násobitel, tolerance. Např. ["žlutá", "fialová", "červená", "zlatá"] = 4,7 kΩ ± 5 %.' }),
  mode: s.optional(s.enum(['read', 'build'], { description: '"read" (výchozí): dítě mění barvy a čte hodnotu. "build": dítě dostane hodnotu z bands a samo skládá barvy.' })),
}, { description: 'Rezistor s barevnými proužky.' })
type P = Infer<typeof props>

type Role = 'digit' | 'exp' | 'tol'
const roles = (n: number): Role[] => (n === 5 ? ['digit', 'digit', 'digit', 'exp', 'tol'] : ['digit', 'digit', 'exp', 'tol'])
const roleName = (r: Role, i: number) => (r === 'digit' ? `${i + 1}. číslice` : r === 'exp' ? 'násobitel' : 'tolerance')
const allowed = (r: Role, i: number) => COLORS.filter((c) => INFO[c][r === 'digit' ? 'digit' : r] !== undefined && !(r === 'digit' && i === 0 && c === 'černá'))

/** Number with a decimal comma and grouped thousands: 4700 → „4 700“, 0.47 → „0,47“. */
function num(n: number) {
  const [i, f] = String(Number(n.toPrecision(10))).split('.')
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (f ? `,${f}` : '')
}
const UNITS: [number, string][] = [[1e9, 'GΩ'], [1e6, 'MΩ'], [1e3, 'kΩ'], [1, 'Ω']]
/** 4700 → „4,7 kΩ“. */
function ohm(R: number) {
  const [u, name] = UNITS.find(([u]) => R >= u) ?? [1, 'Ω']
  return `${num(Number((R / u).toPrecision(6)))} ${name}`
}
const pct = (t: number) => `${num(t)} %`
const multLabel = (e: number) => (e < 0 ? `× ${num(10 ** e)}` : `× ${['1', '10', '100', '1 k', '10 k', '100 k', '1 M', '10 M', '100 M', '1 G'][e]}`).replace(/ /g, '\u00a0')

export function resistorValue(bands: readonly Color[]) {
  const rs = roles(bands.length)
  const digits = bands.slice(0, rs.length - 2).reduce((a, c) => a * 10 + (INFO[c].digit ?? 0), 0)
  const e = INFO[bands[rs.length - 2]].exp ?? 0
  const R = Number((e >= 0 ? digits * 10 ** e : digits / 10 ** -e).toPrecision(12))
  return { digits, e, R, tol: INFO[bands[rs.length - 1]].tol ?? 0 }
}
const same = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))

function Picture({ bands, sel, onBand }: { bands: readonly Color[]; sel?: number; onBand?: (i: number) => void }) {
  const xs = bands.length === 5 ? [92, 120, 148, 176, 236] : [96, 128, 160, 236]
  const rs = roles(bands.length)
  return (
    <svg viewBox="0 0 320 112" width="320" class="resistor-svg" aria-hidden={onBand ? undefined : 'true'}>
      <line x1="0" x2="320" y1="50" y2="50" stroke="var(--ink-3)" stroke-width="5" stroke-linecap="round" />
      {/* the body: wider caps at both ends, like a real carbon-film resistor */}
      <path d="M58 20 Q58 14 66 14 H96 Q104 14 108 22 H212 Q216 14 224 14 H254 Q262 14 262 20 V80 Q262 86 254 86 H224 Q216 86 212 78 H108 Q104 86 96 86 H66 Q58 86 58 80 Z" fill="#e5cf9f" stroke="var(--ink-3)" stroke-width="1.5" />
      {bands.map((c, i) => {
        const cap = xs[i] < 108 || xs[i] > 212
        const y = cap ? 15 : 23, h = cap ? 70 : 54
        return (
          <g key={i}
            class={onBand ? 'resistor-band' : undefined}
            role={onBand ? 'button' : undefined}
            tabindex={onBand ? 0 : undefined}
            aria-label={onBand ? `${roleName(rs[i], i)}: ${c}. Klepnutím změníš barvu.` : undefined}
            onClick={onBand ? () => onBand(i) : undefined}
            onKeyDown={onBand ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBand(i) } } : undefined}>
            <rect x={xs[i] - 14} y="4" width="28" height="92" fill="transparent" />
            <rect x={xs[i] - 8} y={y} width="16" height={h} fill={INFO[c].hex} stroke="var(--ink)" stroke-opacity="0.35" stroke-width="1" />
            <text x={xs[i]} y="108" text-anchor="middle" font-size="11" font-weight="800" fill={sel === i ? 'var(--accent-ink)' : 'var(--ink-3)'}>{i + 1}</text>
            {sel === i && <path d={`M${xs[i] - 6} 96 L${xs[i] + 6} 96 L${xs[i]} 90 Z`} fill="var(--accent)" />}
          </g>
        )
      })}
    </svg>
  )
}

/** The colour names under the picture: what each band means. */
function Names({ bands, sel, onSel }: { bands: readonly Color[]; sel?: number; onSel?: (i: number) => void }) {
  const rs = roles(bands.length)
  return (
    <div class="resistor-names" style={{ gridTemplateColumns: `repeat(${bands.length}, 1fr)` }}>
      {bands.map((c, i) => {
        const inner = <><small>{roleName(rs[i], i)}</small><span><i style={{ background: INFO[c].hex }} />{c}</span></>
        return onSel
          ? <button key={i} class={sel === i ? 'on' : ''} aria-pressed={sel === i} aria-label={`Proužek ${i + 1}, ${roleName(rs[i], i)}: ${c}`} onClick={() => onSel(i)}>{inner}</button>
          : <div key={i}>{inner}</div>
      })}
    </div>
  )
}

const meaning = (c: Color, r: Role) => (r === 'digit' ? String(INFO[c].digit) : r === 'exp' ? multLabel(INFO[c].exp!) : `± ${pct(INFO[c].tol!)}`)

function startBands(n: number): Color[] {
  return n === 5 ? ['hnědá', 'černá', 'černá', 'černá', 'hnědá'] : ['hnědá', 'černá', 'černá', 'hnědá']
}

function Resistor({ bands, mode = 'read' }: P) {
  const [m, setM] = useState(mode)
  const [cur, setCur] = useState<Color[]>(() => (mode === 'build' ? startBands(bands.length) : [...bands]))
  const [sel, setSel] = useState(0)
  const rs = roles(cur.length)
  const v = resistorValue(cur)
  const goal = resistorValue(bands)
  const set = (i: number, c: Color) => setCur(cur.map((x, j) => (j === i ? c : x)))
  const cycle = (i: number) => {
    const opts = allowed(rs[i], i)
    set(i, opts[(opts.indexOf(cur[i]) + 1) % opts.length])
    setSel(i)
  }
  const switchMode = (to: 'read' | 'build') => { setM(to); setCur(to === 'build' ? startBands(bands.length) : [...bands]); setSel(0) }
  const okR = same(v.R, goal.R), okT = v.tol === goal.tol
  const lo = v.R * (1 - v.tol / 100), hi = v.R * (1 + v.tol / 100)

  return (
    <div class="w resistor">
      <div class="resistor-mode" role="group" aria-label="Režim">
        <button class={m === 'read' ? 'on' : ''} aria-pressed={m === 'read'} onClick={() => switchMode('read')}>Čtu hodnotu</button>
        <button class={m === 'build' ? 'on' : ''} aria-pressed={m === 'build'} onClick={() => switchMode('build')}>Skládám barvy</button>
      </div>
      {m === 'build' && <div class="resistor-goal">Slož rezistor <b>{ohm(goal.R)} ± {pct(goal.tol)}</b></div>}
      <Picture bands={cur} sel={sel} onBand={cycle} />
      <Names bands={cur} sel={sel} onSel={setSel} />
      <div class="resistor-pal" role="group" aria-label={`Barva proužku ${sel + 1} (${roleName(rs[sel], sel)})`}>
        {allowed(rs[sel], sel).map((c) => (
          <button key={c} class={cur[sel] === c ? 'on' : ''} aria-pressed={cur[sel] === c} onClick={() => set(sel, c)}>
            <i style={{ background: INFO[c].hex }} /><span>{c}</span><small>{meaning(c, rs[sel])}</small>
          </button>
        ))}
      </div>
      <div aria-live="polite" class="resistor-out">
        <div class="val">{m === 'build' && 'Tvůj: '}{ohm(v.R)} ± {pct(v.tol)}</div>
        <div class="sub">{num(v.digits)} × {num(10 ** v.e)} Ω = {num(v.R)} Ω</div>
        {m === 'read'
          ? <div class="sub">Skutečná hodnota může být od {ohm(lo)} do {ohm(hi)}.</div>
          : <div class={`resistor-check ${okR && okT ? 'ok' : ''}`}>{okR && okT ? 'Správně! ✓' : okR ? 'Hodnota sedí ✓ – ještě tolerance.' : okT ? 'Tolerance sedí ✓ – ještě hodnota.' : 'Zatím nesedí hodnota ani tolerance.'}</div>}
      </div>
      <div class="sub resistor-hint">Klepni na proužek: změní barvu. Nebo vyber barvu z palety.</div>
    </div>
  )
}

function ResistorQuestion({ bands }: P) {
  return (
    <div class="w resistor">
      <Picture bands={bands} />
      <Names bands={bands} />
    </div>
  )
}

const asNum = (a: string) => Number(a.replace(/\s/g, '').replace(',', '.').replace('−', '-'))

export default defineWidget({
  name: 'resistor',
  title: 'Barevný kód rezistoru',
  summary: 'Rezistor se 4 nebo 5 barevnými proužky (IEC 60062). Dítě klepnutím mění barvy a vidí odpor v Ω, kΩ, MΩ s tolerancí a rozsahem; v opačném režimu skládá barvy k zadané hodnotě. U každého proužku je napsaný název barvy.',
  use: 'Elektrotechnika a fyzika (ZŠ i SŠ): rezistor, odpor, jednotky Ω/kΩ/MΩ, barevné značení součástek, tolerance.',
  props,
  examples: [
    { title: '4,7 kΩ ± 5 %', props: { bands: ['žlutá', 'fialová', 'červená', 'zlatá'] } },
    { title: 'Slož 220 Ω ± 5 %', props: { bands: ['červená', 'červená', 'hnědá', 'zlatá'], mode: 'build' } },
    { title: 'Přesný rezistor s 5 proužky', props: { bands: ['hnědá', 'červená', 'fialová', 'oranžová', 'hnědá'] } },
  ],
  check: (p) => {
    const e: string[] = []
    const rs = roles(p.bands.length)
    p.bands.forEach((c, i) => {
      if (!allowed(rs[i], i).includes(c)) e.push(`bands[${i}]: ${c} cannot be the ${rs[i] === 'digit' ? (i === 0 ? 'first digit' : 'digit') : rs[i] === 'exp' ? 'multiplier' : 'tolerance'} band`)
    })
    return e
  },
  Component: Resistor,
  Question: ResistorQuestion,
  checkQuestion: (p, answers) => {
    const { R } = resistorValue(p.bands)
    return answers.some((a) => [1, 1e3, 1e6].some((u) => same(asNum(a), R / u))) ? [] : [`the value ${R} Ω (or in kΩ, MΩ) is not among the answers`]
  },
  html: (p) => { const v = resistorValue(p.bands); return `<p>Rezistor s proužky ${p.bands.join(', ')}: ${ohm(v.R)} ± ${pct(v.tol)}.</p>` },
})
