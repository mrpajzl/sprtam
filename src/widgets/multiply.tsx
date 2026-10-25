import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, Slider } from './kit'

const props = s.object({
  rows: s.int({ min: 1, max: 12, description: 'Počet řádků teček na začátku (první činitel).' }),
  columns: s.int({ min: 1, max: 12, description: 'Počet sloupců teček na začátku (druhý činitel).' }),
  max: s.optional(s.int({ min: 2, max: 12, description: 'Velikost mřížky – nejvíc řádků i sloupců. Výchozí 10.' })),
})
type P = Infer<typeof props>

function Multiply({ rows, columns, max = 10 }: P) {
  const [a, setA] = useState(rows), [b, setB] = useState(columns)
  const s = 22
  return (
    <div class="w">
      <svg viewBox={`0 0 ${max * s + 4} ${max * s + 4}`} width="240">
        {Array.from({ length: max * max }, (_, i) => {
          const r = Math.floor(i / max), c = i % max, on = r < a && c < b
          return <circle key={i} cx={c * s + s / 2 + 2} cy={r * s + s / 2 + 2} r={on ? 8 : 3} fill={on ? 'var(--accent)' : 'var(--line)'} style={{ transition: 'r 0.2s, fill 0.2s' }} />
        })}
      </svg>
      <div class="val">{a} · {b} = {a * b}</div>
      <Slider name="řádky" value={a} set={setA} min={1} max={max} />
      <Slider name="sloupce" value={b} set={setB} min={1} max={max} />
    </div>
  )
}

export default defineWidget({
  name: 'multiply',
  title: 'Násobení v mřížce',
  summary: 'Mřížka teček: obarvené tečky tvoří obdélník řádky × sloupce. Posuvníky mění oba činitele a výsledek se hned přepočítá.',
  use: 'Malá násobilka, záměna činitelů, násobení jako opakované sčítání, obsah obdélníku ve čtverečcích.',
  props,
  examples: [{ title: '3 · 4', props: { rows: 3, columns: 4 } }],
  check: (p) => (Math.max(p.rows, p.columns) > (p.max ?? 10) ? ['rows/columns larger than max'] : []),
  Component: Multiply,
})
