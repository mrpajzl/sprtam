import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, Slider } from './kit'

const props = s.object({
  degrees: s.int({ min: 0, max: 360, description: 'Velikost úhlu na začátku ve stupních.' }),
})
type P = Infer<typeof props>

function Angle({ degrees }: P) {
  const [d, setD] = useState(degrees)
  const r = Math.PI / 180
  const kind = d === 0 ? 'nulový' : d < 90 ? 'ostrý' : d === 90 ? 'pravý' : d < 180 ? 'tupý' : d === 180 ? 'přímý' : 'nekonvexní'
  const x = 150 + 110 * Math.cos(-d * r), y = 130 + 110 * Math.sin(-d * r)
  const ax = 150 + 36 * Math.cos(-d * r), ay = 130 + 36 * Math.sin(-d * r)
  return (
    <div class="w">
      <svg viewBox={d > 180 ? '0 10 300 240' : '0 10 300 135'} width="280">
        <line x1="150" y1="130" x2="270" y2="130" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
        <line x1="150" y1="130" x2={x} y2={y} stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
        {d === 90 ? <path d="M172 130 V108 H150" fill="none" stroke="var(--accent)" stroke-width="2.5" /> :
          d > 0 && <path d={`M186 130 A36 36 0 ${d > 180 ? 1 : 0} 0 ${ax} ${ay}`} fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5" />}
        <circle cx="150" cy="130" r="5" fill="var(--ink)" />
      </svg>
      <div class="val">{d}° · {kind}</div>
      <Slider name="α" value={d} set={setD} min={0} max={360} step={5} />
    </div>
  )
}

export default defineWidget({
  name: 'angle',
  title: 'Úhel',
  summary: 'Úhel se dvěma rameny; posuvníkem se otevírá po 5° a pod ním je velikost a druh úhlu (ostrý, pravý, tupý, přímý…).',
  use: 'Druhy úhlů, měření úhlů, odhad velikosti úhlu.',
  props,
  examples: [{ title: 'Ostrý úhel', props: { degrees: 40 } }],
  Component: Angle,
})
