import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Graph, Slider } from './kit'

const props = s.object({
  k: s.number({ min: -5, max: 5, description: 'Směrnice k v y = k · x + q (po 0,5).' }),
  q: s.number({ min: -6, max: 6, description: 'Posun q – kde přímka protne osu y.' }),
}, { description: 'Funkce y = k · x + q.' })
type P = Infer<typeof props>

function Linear({ k: k0, q: q0 }: P) {
  const [k, setK] = useState(k0), [q, setQ] = useState(q0)
  const sgn = (n: number) => (n < 0 ? ` − ${fmt(-n)}` : ` + ${fmt(n)}`)
  return (
    <div class="w">
      <Graph f={(x) => k * x + q} />
      <div class="val">y = {k === 0 ? '' : k === 1 ? 'x' : k === -1 ? '−x' : `${fmt(k)}x`}{k === 0 ? fmt(q) : q ? sgn(q) : ''}</div>
      <div class="sub">{k > 0 ? 'rostoucí' : k < 0 ? 'klesající' : 'konstantní'}</div>
      <Slider name="k" value={k} set={setK} min={-5} max={5} step={0.5} />
      <Slider name="q" value={q} set={setQ} min={-5} max={5} step={0.5} />
    </div>
  )
}

export default defineWidget({
  name: 'linear',
  title: 'Lineární funkce',
  summary: 'Graf přímky y = k · x + q v mřížce. Posuvníky k a q přímku naklánějí a posouvají; pod grafem je předpis a jestli roste, nebo klesá.',
  use: 'Lineární funkce, přímá úměrnost (q = 0), význam k a q, rostoucí a klesající funkce.',
  props,
  examples: [{ title: 'y = 2x − 1', props: { k: 2, q: -1 } }],
  Component: Linear,
})
