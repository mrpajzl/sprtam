import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, Step } from './kit'

const props = s.object({
  emoji: s.string({ description: 'Co se počítá – jedno emoji, např. "🍎".' }),
  start: s.optional(s.int({ min: 0, max: 50, description: 'Kolik věcí je vidět na začátku. Výchozí 3.' })),
  max: s.optional(s.int({ min: 1, max: 50, description: 'Nejvíc věcí, kolik jde přidat. Výchozí 20.' })),
})
type P = Infer<typeof props>

function Counter({ emoji, start = 3, max = 20 }: P) {
  const [n, set] = useState(start)
  return (
    <div class="w">
      <div class="counter-items">{Array.from({ length: n }, (_, i) => <span key={i}>{emoji}</span>)}</div>
      <div class="val">{n}</div>
      <div class="ctrls"><Step value={n} set={set} min={0} max={max} label={`${n}`} /></div>
    </div>
  )
}

export default defineWidget({
  name: 'counter',
  title: 'Počítadlo',
  summary: 'Řada obrázků (emoji); tlačítky + a − dítě přidává a ubírá a vidí, kolik jich je.',
  use: 'Počítání do 20, sčítání a odčítání přidáváním a ubíráním, porovnávání v 1. třídě.',
  props,
  examples: [{ title: 'Jablka', props: { emoji: '🍎', start: 3, max: 10 } }],
  check: (p) => ((p.start ?? 3) > (p.max ?? 20) ? ['start is more than max'] : []),
  Component: Counter,
})
