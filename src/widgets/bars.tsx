import { useEffect, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget, fmt } from './kit'

const props = s.object({
  unit: s.optional(s.string({ description: 'Jednotka za hodnotou, např. "mil. obyvatel" nebo "°C".' })),
  items: s.array(s.object({
    label: s.string({ description: 'Popisek sloupce.' }),
    value: s.number({ description: 'Hodnota; délka pruhu je poměrná k největší hodnotě.' }),
  }), { min: 2, max: 12, description: 'Porovnávané hodnoty. Ideálně 3–8.' }),
})
type P = Infer<typeof props>

function Bars({ unit, items }: P) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1)
  const [grow, setGrow] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setGrow(true)); return () => cancelAnimationFrame(t) }, [])
  return (
    <div class="w">
      <div class="bars-list">
        {items.map((it, i) => (
          <div key={i} class="bar-row">
            <span><Inline text={it.label} /></span>
            <div class="track"><div class="fill" style={{ width: grow ? `${Math.max(2, (Math.abs(it.value) / max) * 100)}%` : '0%' }} /></div>
            <b>{fmt(it.value)}{unit ? ` ${unit}` : ''}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'bars',
  title: 'Sloupcový graf',
  summary: 'Vodorovné pruhy, jejichž délka odpovídá hodnotě; pruhy při zobrazení vyrostou.',
  use: 'Porovnání čísel: počty obyvatel, rozlohy, teploty, výsledky měření, statistika.',
  props,
  examples: [{ title: 'Největší česká města', props: { unit: 'tis. obyvatel', items: [{ label: 'Praha', value: 1384 }, { label: 'Brno', value: 402 }, { label: 'Ostrava', value: 284 }] } }],
  Component: Bars,
})
