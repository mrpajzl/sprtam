import { useRef, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

const props = s.object({
  min: s.number({ description: 'Číslo na levém konci osy.' }),
  max: s.number({ description: 'Číslo na pravém konci osy.' }),
  step: s.optional(s.number({ min: 0.001, description: 'Vzdálenost mezi dílky. Výchozí 1. Nejvýš 40 dílků: (max − min) / step ≤ 40.' })),
  start: s.optional(s.number({ description: 'Kde stojí tečka na začátku. Výchozí min.' })),
  hop: s.optional(s.number({ description: 'Délka skoku. Když je zadaný spolu se start, dítě tečku neposouvá, ale tlačítkem skáče od start o hop (záporný = doleva) – sčítání a odčítání na ose.' })),
})
type P = Infer<typeof props>

function NumberLine({ min, max, step = 1, start, hop }: P) {
  const [v, setV] = useState(start ?? min)
  const [hops, setHops] = useState(0)
  const W = 320, pad = 16, n = Math.round((max - min) / step)
  const x = (val: number) => pad + ((val - min) / (max - min)) * (W - 2 * pad)
  const svg = useRef<SVGSVGElement>(null)
  const jumping = start !== undefined && !!hop
  const pos = jumping ? start + hop * hops : v
  const drag = (e: PointerEvent) => {
    if (hop) return
    const r = svg.current!.getBoundingClientRect()
    const rel = ((e.clientX - r.left) / r.width) * W
    const val = min + Math.round(((rel - pad) / (W - 2 * pad)) * n) * step
    setV(Math.max(min, Math.min(max, Math.round(val * 1000) / 1000)))
  }
  const label = (i: number) => fmt(min + i * step)
  const every = n > 10 ? Math.ceil(n / 10) : 1
  return (
    <div class="w">
      <svg ref={svg} viewBox={`0 0 ${W} 86`} onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); drag(e) }} onPointerMove={(e) => e.buttons && drag(e)} style={{ touchAction: 'none' }}>
        <line x1={pad} x2={W - pad} y1={50} y2={50} stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={i}>
            <line x1={x(min + i * step)} x2={x(min + i * step)} y1={43} y2={57} stroke="var(--ink-3)" stroke-width={i % every ? 1.5 : 2.5} />
            {i % every === 0 && <text x={x(min + i * step)} y={76} text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">{label(i)}</text>}
          </g>
        ))}
        {jumping && Array.from({ length: hops }, (_, i) => {
          const a = x(start + hop * i), b = x(start + hop * (i + 1))
          return <path key={i} d={`M${a},44 Q${(a + b) / 2},${10} ${b},44`} fill="none" stroke="var(--accent)" stroke-width="2.5" />
        })}
        <circle cx={x(pos)} cy={50} r={10} fill="var(--accent)" stroke="var(--card)" stroke-width="3" style={{ transition: 'cx 0.3s' }} />
      </svg>
      <div class="val">{jumping ? `${fmt(start)} ${hop < 0 ? '−' : '+'} ${fmt(Math.abs(hop * hops))} = ${fmt(pos)}` : fmt(pos)}</div>
      {jumping ? (
        <div class="ctrls">
          <button class="reveal" onClick={() => setHops(0)}>Znovu</button>
          <button class="reveal" onClick={() => { const nx = start + hop * (hops + 1); if (nx >= min && nx <= max) setHops(hops + 1) }}>{hop > 0 ? `+${fmt(hop)}` : `−${fmt(-hop)}`}</button>
        </div>
      ) : <div class="sub">Posuň tečku</div>}
    </div>
  )
}

export default defineWidget({
  name: 'number-line',
  title: 'Číselná osa',
  summary: 'Osa s dílky a tečkou. Dítě tečku táhne (a vidí číslo), nebo s ní tlačítkem skáče o zadaný krok.',
  use: 'Pořadí čísel, záporná čísla, desetinná čísla, zaokrouhlování; s hop sčítání a odčítání po skocích.',
  props,
  examples: [
    { title: 'Posouvání', props: { min: -5, max: 5 } },
    { title: 'Skoky: 3 + 4 · 2', props: { min: 0, max: 12, start: 3, hop: 2 } },
  ],
  check: (p) => {
    const e: string[] = []
    const n = (p.max - p.min) / (p.step ?? 1)
    if (p.max <= p.min) e.push('max must be more than min')
    if (n > 40) e.push(`too many ticks (${Math.round(n)}, max 40): raise step`)
    if (p.start !== undefined && (p.start < p.min || p.start > p.max)) e.push('start outside min..max')
    if (p.hop !== undefined && p.start === undefined) e.push('hop needs start')
    return e
  },
  Component: NumberLine,
})
