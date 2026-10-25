import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, Step } from './kit'

const props = s.object({
  number: s.int({ min: 1, max: 9, description: 'Které násobky se kreslí (násobková řada 1–9). Dítě ho může tlačítky změnit.' }),
})
type P = Infer<typeof props>

// Ten points 0–9 on a circle; the line goes through the last digits of n, 2n, 3n … 10n.
// Every multiplication table draws its own figure: 2 and 8 a pentagon, 3 and 7 a star, 5 a line…
function MultipleCircle({ number }: P) {
  const [n, setN] = useState(number)
  const [k, setK] = useState(0) // how many multiples are drawn
  const R = 92, C = 120
  const pt = (d: number) => { const a = (d / 10) * 2 * Math.PI - Math.PI / 2; return [C + R * Math.cos(a), C + R * Math.sin(a)] as const }
  const multiples = Array.from({ length: 10 }, (_, i) => n * (i + 1))
  const path = [0, ...multiples.slice(0, k).map((m) => m % 10)].map((d, i) => `${i ? 'L' : 'M'}${pt(d).join(',')}`).join(' ')
  const change = (v: number) => { setN(v); setK(0) }
  return (
    <div class="w">
      <svg viewBox="0 0 240 240" width="240" role="img" aria-label={`Kruh násobků čísla ${n}`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line)" stroke-width="2" />
        {k > 0 && <path d={path} fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" />}
        {Array.from({ length: 10 }, (_, d) => {
          const [x, y] = pt(d), [lx, ly] = [C + (R + 16) * Math.cos((d / 10) * 2 * Math.PI - Math.PI / 2), C + (R + 16) * Math.sin((d / 10) * 2 * Math.PI - Math.PI / 2)]
          const on = k > 0 && multiples.slice(0, k).some((m) => m % 10 === d)
          return <g key={d}>
            <circle cx={x} cy={y} r={on ? 7 : 5} fill={on ? 'var(--accent)' : 'var(--ink-3)'} />
            <text x={lx} y={ly + 5} text-anchor="middle" font-size="14" font-weight="800" fill="var(--ink-2)">{d}</text>
          </g>
        })}
      </svg>
      <div class="val" style={{ fontSize: '1.05rem', minHeight: '1.6em' }}>{multiples.slice(0, k).join(', ') || `Násobky čísla ${n}`}</div>
      <div class="sub">{k === 0 ? 'Spoj poslední číslice násobků' : k < 10 ? `${k} · ${n} = ${n * k} → bod ${(n * k) % 10}` : 'Hotovo – každá řada kreslí svůj obrazec'}</div>
      <div class="ctrls">
        <Step value={n} set={change} min={1} max={9} label={`řada ${n}`} />
        {k < 10 ? <button class="reveal" onClick={() => setK(k + 1)}>Další násobek</button> : <button class="reveal" onClick={() => setK(0)}>Znovu</button>}
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'multiple-circle',
  title: 'Kruh násobků',
  summary: 'Kruh s deseti body 0–9. Dítě po jednom přidává násobky a čára spojuje jejich poslední číslice; každá násobková řada nakreslí svůj obrazec (řada 3 hvězdu, řada 2 pětiúhelník).',
  use: 'Násobilka a násobkové řady, rytmus násobků, souvislost řad (2 a 8, 3 a 7 kreslí stejný obrazec opačným směrem); typická pomůcka waldorfské školy.',
  props,
  examples: [
    { title: 'Řada 3 – hvězda', props: { number: 3 } },
    { title: 'Řada 2 – pětiúhelník', props: { number: 2 } },
  ],
  Component: MultipleCircle,
})
