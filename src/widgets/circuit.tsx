import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

const props = s.object({
  voltage: s.number({ min: 0.5, max: 230, description: 'Napětí zdroje U ve voltech (V), např. 4,5 nebo 12.' }),
  resistors: s.array(s.number({ min: 0.1, max: 10000, description: 'Odpor v ohmech (Ω).' }), { min: 1, max: 3, description: 'Odpory R1…R3 v ohmech (1 až 3 spotřebiče).' }),
  mode: s.enum(['series', 'parallel'], { description: 'Zapojení: "series" sériově (za sebou), "parallel" paralelně (vedle sebe).' }),
  bulbs: s.optional(s.boolean({ description: 'true = místo rezistorů žárovky, které svítí podle výkonu.' })),
  ask: s.optional(s.enum(['current', 'resistance'], { description: 'Jen pro otázku: na co se ptá – "current" celkový proud I v ampérech, "resistance" celkový odpor R v ohmech. Výchozí "current".' })),
}, { description: 'Elektrický obvod: zdroj s napětím U a 1–3 rezistory nebo žárovky zapojené sériově nebo paralelně.' })
type P = Infer<typeof props>
type Mode = P['mode']

interface Part { R: number; U: number; I: number; P: number }
interface Solution { R: number; I: number; P: number; parts: Part[] }

/** Ohm's law and Kirchhoff's laws for a series or parallel connection. Open switch = no current. */
export function solve(U: number, Rs: number[], mode: Mode, closed = true): Solution {
  const R = mode === 'series' ? Rs.reduce((a, b) => a + b, 0) : 1 / Rs.reduce((a, b) => a + 1 / b, 0)
  if (!closed) return { R, I: 0, P: 0, parts: Rs.map((r) => ({ R: r, U: 0, I: 0, P: 0 })) }
  const I = U / R
  const parts = Rs.map((r) => {
    const u = mode === 'series' ? I * r : U, i = u / r
    return { R: r, U: u, I: i, P: u * i }
  })
  return { R, I, P: U * I, parts }
}

/** Up to 3 significant digits: 0,0451 · 1,2 · 13,33. */
const num = (n: number) => (Math.abs(n) >= 10 || n === 0 ? fmt(n) : String(+n.toPrecision(3)).replace('.', ',').replace('-', '−'))
const ohm = (r: number) => (r >= 1000 ? `${num(r / 1000)} kΩ` : `${num(r)} Ω`)
const amp = (i: number) => (i !== 0 && Math.abs(i) < 1 ? `${num(i)} A (${num(i * 1000)} mA)` : `${num(i)} A`)
const parse = (t: string) => Number((t.match(/−?-?\d+(?:[.,]\d+)?/)?.[0] ?? 'NaN').replace('−', '-').replace(',', '.'))
const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.005, Math.abs(b) * 0.01)

// Resistance steps for the +/− buttons (the author's value is added in).
const STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8].flatMap((x) => [x, x * 10, x * 100, x * 1000]).concat(10000)

// ——— Schematic (ČSN symbols) ———

const L = 40, T = 40, B = 180, RIGHT = 285 // the loop
const SRC = 110 // source centre on the left wire
const SW = [80, 110] // switch contacts on the top wire

function centres(n: number, mode: Mode) {
  if (mode === 'series') return n === 1 ? [200] : n === 2 ? [165, 245] : [150, 205, 260]
  return n === 1 ? [RIGHT] : n === 2 ? [195, RIGHT] : [165, 225, RIGHT]
}

function Element({ x, y, vertical, bulb, glow, name, value }: { x: number; y: number; vertical: boolean; bulb: boolean; glow: number; name: string; value: string }) {
  const lx = vertical ? x + 12 : x, ly = vertical ? y - 4 : y - 16
  return (
    <g>
      {bulb ? (
        <g>
          {glow > 0.02 && <circle cx={x} cy={y} r={13 + 9 * glow} class="circuit-glow" style={{ opacity: String(0.25 + 0.6 * glow) }} />}
          <circle cx={x} cy={y} r="13" stroke="var(--ink)" stroke-width="2.5" style={{ fill: `color-mix(in oklab, var(--k-yellow) ${Math.round(glow * 100)}%, var(--card))` }} />
          <path d={`M${x - 9.2} ${y - 9.2} L${x + 9.2} ${y + 9.2} M${x + 9.2} ${y - 9.2} L${x - 9.2} ${y + 9.2}`} stroke="var(--ink)" stroke-width="2.5" />
        </g>
      ) : vertical ? (
        <rect x={x - 8} y={y - 20} width="16" height="40" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5" />
      ) : (
        <rect x={x - 20} y={y - 8} width="40" height="16" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5" />
      )}
      <text x={lx + (vertical && bulb ? 4 : 0)} y={ly} text-anchor={vertical ? 'start' : 'middle'} font-size="12" font-weight="800" fill="var(--ink)">{name}</text>
      {value && <text x={lx + (vertical && bulb ? 4 : 0)} y={vertical ? ly + 14 : y + 28} text-anchor={vertical ? 'start' : 'middle'} font-size="11" font-weight="700" fill="var(--ink-2)">{value}</text>}
    </g>
  )
}

/** Flow of conventional current (+ → −) as moving dots; speed grows with the current. */
function Flow({ d, I, paused }: { d: string; I: number; paused: boolean }) {
  if (I <= 0) return null
  const speed = Math.min(120, Math.max(6, 50 * Math.sqrt(I))) // px per second
  return <path d={d} class={`circuit-flow${paused ? ' paused' : ''}`} style={{ animationDuration: `${(18 / speed).toFixed(2)}s` }} />
}

function Schematic({ U, Rs, mode, bulbs, closed, sol, paused, values, still }: { U: number; Rs: number[]; mode: Mode; bulbs: boolean; closed: boolean; sol: Solution; paused: boolean; values: boolean; still?: boolean }) {
  const xs = centres(Rs.length, mode)
  const last = xs[xs.length - 1]
  const mid = (T + B) / 2
  const flows: { d: string; I: number }[] = []
  if (mode === 'series') {
    flows.push({ d: `M${L} ${SRC - 8} V${T} H${RIGHT} V${B} H${L} V${SRC + 8}`, I: sol.I })
  } else {
    flows.push({ d: `M${L} ${SRC - 8} V${T} H${xs[0]}`, I: sol.I }, { d: `M${xs[0]} ${B} H${L} V${SRC + 8}`, I: sol.I })
    xs.forEach((x, k) => {
      flows.push({ d: `M${x} ${T} V${B}`, I: sol.parts[k].I })
      if (k < xs.length - 1) {
        const rest = sol.parts.slice(k + 1).reduce((a, p) => a + p.I, 0)
        flows.push({ d: `M${x} ${T} H${xs[k + 1]}`, I: rest }, { d: `M${xs[k + 1]} ${B} H${x}`, I: rest })
      }
    })
  }
  const glow = (p: number) => (bulbs ? 1 - Math.exp(-p / 3) : 0)
  return (
    <svg viewBox="0 0 340 210" width="340" role="img" aria-label={`Schéma: zdroj ${num(U)} V, ${Rs.length === 1 ? 'jeden spotřebič' : `${Rs.length} spotřebiče zapojené ${mode === 'series' ? 'sériově' : 'paralelně'}`}, spínač ${closed ? 'sepnutý' : 'rozpojený'}.`}>
      <g fill="none" stroke="var(--ink-2)" stroke-width="2.5" stroke-linecap="round">
        {/* left wire with the source gap, top wire with the switch gap */}
        <path d={`M${L} ${SRC - 6} V${T} H${SW[0]} M${SW[1]} ${T} H${mode === 'series' ? RIGHT : last}`} />
        <path d={`M${L} ${SRC + 6} V${B} H${mode === 'series' ? RIGHT : last}`} />
        {mode === 'series' ? <path d={`M${RIGHT} ${T} V${B}`} /> : xs.map((x) => <path key={x} d={`M${x} ${T} V${B}`} />)}
      </g>
      {closed && !still && flows.map((f, i) => <Flow key={i} d={f.d} I={f.I} paused={paused} />)}
      {mode === 'parallel' && xs.slice(0, -1).map((x) => <g key={x} fill="var(--ink)"><circle cx={x} cy={T} r="4" /><circle cx={x} cy={B} r="4" /></g>)}
      {/* source: long thin plate = +, short thick plate = − */}
      <line x1={L - 18} x2={L + 18} y1={SRC - 6} y2={SRC - 6} stroke="var(--ink)" stroke-width="2.5" />
      <line x1={L - 9} x2={L + 9} y1={SRC + 6} y2={SRC + 6} stroke="var(--ink)" stroke-width="6" />
      <text x={L - 22} y={SRC - 10} text-anchor="end" font-size="13" font-weight="900" fill="var(--ink-2)">+</text>
      <text x={L - 14} y={SRC + 22} text-anchor="end" font-size="13" font-weight="900" fill="var(--ink-2)">−</text>
      <text x={L + 24} y={SRC + 4} font-size="13" font-weight="900" fill="var(--accent-ink)">{`U = ${num(U)} V`}</text>
      {/* switch */}
      <circle cx={SW[0]} cy={T} r="3.5" fill="var(--card)" stroke="var(--ink)" stroke-width="2" />
      <circle cx={SW[1]} cy={T} r="3.5" fill="var(--card)" stroke="var(--ink)" stroke-width="2" />
      <line x1={SW[0] + 3} y1={T} x2={closed ? SW[1] - 3 : SW[1] - 6} y2={closed ? T : T - 17} stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" class="circuit-switch" />
      <text x={(SW[0] + SW[1]) / 2} y={T + 20} text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-3)">S</text>
      {Rs.map((r, k) => (
        <Element key={k} x={xs[k]} y={mode === 'series' ? T : mid} vertical={mode === 'parallel'} bulb={bulbs}
          glow={still ? 0 : glow(sol.parts[k].P)} name={`${bulbs ? 'Ž' : 'R'}${k + 1}`} value={values ? ohm(r) : ''} />
      ))}
    </svg>
  )
}

// ——— The widget ———

function Stepper({ label, text, dec, inc, canDec, canInc }: { label: string; text: string; dec: () => void; inc: () => void; canDec: boolean; canInc: boolean }) {
  return (
    <div class="step circuit-step">
      <button onClick={dec} disabled={!canDec} aria-label={`Zmenšit ${label}`}>−</button>
      <span>{text}</span>
      <button onClick={inc} disabled={!canInc} aria-label={`Zvětšit ${label}`}>+</button>
    </div>
  )
}

function Circuit(p: P) {
  const [U, setU] = useState(p.voltage)
  const [Rs, setRs] = useState(p.resistors)
  const [mode, setMode] = useState<Mode>(p.mode)
  const [bulbs, setBulbs] = useState(!!p.bulbs)
  const [closed, setClosed] = useState(true)
  const [paused, setPaused] = useState(false)
  const steps = [...new Set([...STEPS, ...p.resistors])].sort((a, b) => a - b)
  const sol = solve(U, Rs, mode, closed)
  const name = (k: number) => `${bulbs ? 'Ž' : 'R'}${k + 1}`
  const big = Math.max(24, Math.ceil(p.voltage))
  const shift = (k: number, d: number) => {
    const i = steps.findIndex((x) => x >= Rs[k])
    const j = Math.min(steps.length - 1, Math.max(0, (steps[i] === Rs[k] ? i : d > 0 ? i - 1 : i) + d))
    setRs(Rs.map((r, m) => (m === k ? steps[j] : r)))
  }
  const sum = mode === 'series'
    ? `R = ${Rs.map((_, k) => `R${k + 1}`).join(' + ')} = ${Rs.map(ohm).join(' + ')} = ${ohm(sol.R)}`
    : Rs.length === 1 ? `R = ${ohm(sol.R)}` : `1/R = ${Rs.map((_, k) => `1/R${k + 1}`).join(' + ')} → R = ${ohm(sol.R)}`
  const kirchhoff = !closed || Rs.length === 1 ? '' : mode === 'series'
    ? `U = ${sol.parts.map((x) => num(x.U)).join(' V + ')} V = ${num(U)} V`
    : `I = ${sol.parts.map((x) => num(x.I)).join(' A + ')} A = ${num(sol.I)} A`
  return (
    <div class="w circuit">
      <Schematic U={U} Rs={Rs} mode={mode} bulbs={bulbs} closed={closed} sol={sol} paused={paused} values />
      <div class="val" aria-live="polite">{`I = ${amp(sol.I)}`}</div>
      <div class="sub circuit-calc">
        {!closed && <div class="circuit-law">Spínač je rozpojený, obvodem neteče proud.</div>}
        <div>{sum}</div>
        {closed && <div>I = U / R = {num(U)} V / {ohm(sol.R)} = {amp(sol.I)}</div>}
        {closed && <div>P = U · I = {num(U)} V · {num(sol.I)} A = {num(sol.P)} W</div>}
        {kirchhoff && <div class="circuit-law">{mode === 'series' ? 'Napětí se dělí: ' : 'Proud se dělí: '}{kirchhoff}</div>}
      </div>
      <table class="circuit-table">
        <thead><tr><th scope="col" /><th scope="col">R</th><th scope="col">U</th><th scope="col">I</th><th scope="col">P</th></tr></thead>
        <tbody>
          {sol.parts.map((x, k) => (
            <tr key={k}><th scope="row">{name(k)}</th><td>{ohm(x.R)}</td><td>{num(x.U)} V</td><td>{num(x.I)} A</td><td>{num(x.P)} W</td></tr>
          ))}
          <tr class="circuit-total"><th scope="row">celkem</th><td>{ohm(sol.R)}</td><td>{num(U)} V</td><td>{num(sol.I)} A</td><td>{num(sol.P)} W</td></tr>
        </tbody>
      </table>
      <div class="ctrls">
        <button class="reveal" aria-label={closed ? 'Vypnout: rozpojit spínač S' : 'Zapnout: sepnout spínač S'} onClick={() => setClosed(!closed)}>{closed ? 'Vypnout' : 'Zapnout'}</button>
        <button class="reveal circuit-pause" aria-label={paused ? 'Tečky proudu: rozpohybovat' : 'Tečky proudu: zastavit'} onClick={() => setPaused(!paused)}>{paused ? '▶ Tečky' : '❚❚ Tečky'}</button>
      </div>
      <div class="chips" role="group" aria-label="Zapojení">
        <button class={`chip${mode === 'series' ? ' sel' : ''}`} aria-pressed={mode === 'series'} onClick={() => setMode('series')}>Sériově</button>
        <button class={`chip${mode === 'parallel' ? ' sel' : ''}`} aria-pressed={mode === 'parallel'} onClick={() => setMode('parallel')}>Paralelně</button>
        <button class={`chip${bulbs ? ' sel' : ''}`} aria-pressed={bulbs} onClick={() => setBulbs(!bulbs)}>Žárovky</button>
      </div>
      <label class="slider">
        <span>U</span>
        <input type="range" min={0} max={big} step={big > 24 ? 1 : 0.5} value={U} onInput={(e) => setU(Number(e.currentTarget.value))} aria-label="Napětí zdroje U ve voltech" />
        <output>{num(U)} V</output>
      </label>
      <div class="ctrls">
        {Rs.map((r, k) => (
          <Stepper key={k} label={name(k)} text={`${name(k)} = ${ohm(r)}`} dec={() => shift(k, -1)} inc={() => shift(k, 1)} canDec={r > steps[0]} canInc={r < steps[steps.length - 1]} />
        ))}
      </div>
      <div class="ctrls">
        <Stepper label="počet spotřebičů" text={`${Rs.length} ${Rs.length === 1 ? 'spotřebič' : 'spotřebiče'}`} canDec={Rs.length > 1} canInc={Rs.length < 3}
          dec={() => setRs(Rs.slice(0, -1))} inc={() => setRs([...Rs, Rs[Rs.length - 1]])} />
      </div>
    </div>
  )
}

function CircuitQuestion(p: P) {
  const sol = solve(p.voltage, p.resistors, p.mode)
  return (
    <div class="w circuit">
      <Schematic U={p.voltage} Rs={p.resistors} mode={p.mode} bulbs={!!p.bulbs} closed sol={sol} paused values still />
      <div class="sub">{p.ask === 'resistance' ? 'Jaký je celkový odpor R obvodu?' : 'Jaký proud I prochází zdrojem?'}</div>
    </div>
  )
}

const describe = (p: P) =>
  `Zdroj ${num(p.voltage)} V, ${p.resistors.map((r, k) => `${p.bulbs ? 'Ž' : 'R'}${k + 1} = ${ohm(r)}`).join(', ')}${p.resistors.length > 1 ? `, zapojení ${p.mode === 'series' ? 'sériové' : 'paralelní'}` : ''}.`

export default defineWidget({
  name: 'circuit',
  title: 'Elektrický obvod',
  summary: 'Schéma se zdrojem, spínačem a 1–3 rezistory nebo žárovkami. Dítě mění napětí, odpory, počet spotřebičů a zapojení (sériově/paralelně); vidí celkový odpor, proud, napětí a proud na každém spotřebiči a výkon. Proud ukazují pohyblivé tečky, žárovky svítí podle výkonu.',
  use: 'Fyzika 8. třída a elektrotechnika: Ohmův zákon, sériové a paralelní zapojení, Kirchhoffovy zákony, výkon P = U · I, rozpojený obvod.',
  props,
  examples: [
    { title: 'Žárovka na baterii 4,5 V', props: { voltage: 4.5, resistors: [15], mode: 'series', bulbs: true } },
    { title: 'Dvě žárovky za sebou', props: { voltage: 12, resistors: [20, 40], mode: 'series', bulbs: true } },
    { title: 'Tři rezistory paralelně', props: { voltage: 24, resistors: [12, 24, 8], mode: 'parallel' } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.ask && p.resistors.length === 1 && p.ask === 'resistance') e.push('ask "resistance" needs 2 or 3 resistors')
    const I = solve(p.voltage, p.resistors, p.mode).I
    if (I > 100) e.push(`current ${I.toFixed(1)} A is unrealistically high`)
    return e
  },
  Component: Circuit,
  Question: CircuitQuestion,
  checkQuestion: (p, answers) => {
    const sol = solve(p.voltage, p.resistors, p.mode)
    const want = p.ask === 'resistance' ? sol.R : sol.I
    const unit = p.ask === 'resistance' ? 'Ω' : 'A'
    return answers.some((a) => close(parse(a), want)) ? [] : [`the answer ${+want.toPrecision(4)} ${unit} is not among the answers`]
  },
  html: (p, inline) => `<p>${inline(describe(p))}</p>`,
})
