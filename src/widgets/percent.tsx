import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

const props = s.object({
  percent: s.int({ min: 0, max: 100, description: 'Kolik procent je obarvených na začátku.' }),
  of: s.optional(s.number({ min: 0, description: 'Celek (základ). Když je zadaný, ukáže se i výsledek, např. 20 % z 300 = 60.' })),
})
type P = Infer<typeof props>

function Percent({ percent, of }: P) {
  const [p, setP] = useState(percent)
  return (
    <div class="w">
      <svg viewBox="0 0 200 200" width="220">
        {Array.from({ length: 100 }, (_, i) => <rect key={i} x={(i % 10) * 20 + 1} y={Math.floor(i / 10) * 20 + 1} width="18" height="18" rx="4" fill={i < p ? 'var(--accent)' : 'var(--accent-soft)'} style={{ transition: 'fill 0.2s' }} />)}
      </svg>
      <div class="val">{p} %{of ? ` z ${fmt(of)} = ${fmt((of * p) / 100)}` : ` = ${fmt(p / 100)}`}</div>
      <Slider name="%" value={p} set={setP} min={0} max={100} />
    </div>
  )
}

export default defineWidget({
  name: 'percent',
  title: 'Procenta',
  summary: 'Čtverec ze 100 políček; obarvená políčka jsou procenta. Posuvník mění počet procent a ukazuje desetinné číslo nebo část z celku.',
  use: 'Co je procento, procenta jako setiny, výpočet části z celku.',
  props,
  examples: [
    { title: '25 %', props: { percent: 25 } },
    { title: '20 % z 300', props: { percent: 20, of: 300 } },
  ],
  Component: Percent,
})
