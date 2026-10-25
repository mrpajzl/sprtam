import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const props = s.object({
  value: s.int({ min: 0, max: 999, description: 'Počáteční číslo (0–999).' }),
})
type P = Infer<typeof props>

function PlaceValue({ value }: P) {
  const [v, setV] = useState(Math.max(0, Math.min(999, value)))
  const h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), u = v % 10
  const col = (count: number, kind: 'h' | 't' | 'u', name: string, mul: number) => (
    <div style={{ display: 'grid', justifyItems: 'center', gap: '6px', flex: 1 }}>
      <svg viewBox="0 0 90 120" width="90">
        {kind === 'h' && Array.from({ length: count }, (_, i) => <rect key={i} x={6 + (i % 3) * 4} y={6 + i * 10} width={60} height={60} rx="4" fill="var(--accent)" opacity={0.25 + 0.75 / (i + 1)} stroke="var(--card)" stroke-width="2" />)}
        {kind === 't' && Array.from({ length: count }, (_, i) => <rect key={i} x={4 + i * 9} y={4} width={7} height={100} rx="3" fill="var(--accent)" />)}
        {kind === 'u' && Array.from({ length: count }, (_, i) => <rect key={i} x={10 + (i % 3) * 25} y={8 + Math.floor(i / 3) * 25} width={20} height={20} rx="4" fill="var(--accent)" />)}
      </svg>
      <b style={{ fontSize: '1.6rem' }}>{count}</b>
      <span class="sub">{name}</span>
      <div class="step"><button onClick={() => setV(Math.max(0, v - mul))}>−</button><button onClick={() => setV(Math.min(999, v + mul))}>+</button></div>
    </div>
  )
  return (
    <div class="w">
      <div style={{ display: 'flex', gap: '6px' }}>{col(h, 'h', 'stovky', 100)}{col(t, 't', 'desítky', 10)}{col(u, 'u', 'jednotky', 1)}</div>
      <div class="val">{v}</div>
    </div>
  )
}

export default defineWidget({
  name: 'place-value',
  title: 'Stovky, desítky, jednotky',
  summary: 'Číslo rozložené na čtverce (stovky), tyčky (desítky) a kostičky (jednotky). Tlačítky + a − u každého řádu se číslo mění.',
  use: 'Zápis čísel do 1000, řády, rozklad čísla, přechod přes desítku.',
  props,
  examples: [{ title: 'Číslo 254', props: { value: 254 } }],
  Component: PlaceValue,
})
