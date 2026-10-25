import { useEffect, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget } from './kit'

const props = s.object({
  steps: s.array(s.string(), { min: 2, max: 8, description: 'Kroky koloběhu v pořadí; po posledním následuje zase první. Ideálně 3–6, krátce.' }),
})
type P = Infer<typeof props>

function Cycle({ steps }: P) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => { if (!auto) return; const t = setInterval(() => setI((x) => (x + 1) % steps.length), 2200); return () => clearInterval(t) }, [auto, steps.length])
  const n = steps.length, R = 92, C = 130
  return (
    <div class="w">
      <svg viewBox="0 0 260 260" width="260" onClick={() => { setAuto(false); setI((i + 1) % n) }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line)" stroke-width="6" stroke-dasharray="4 10" />
        {steps.map((_, k) => {
          const a = (k / n) * 2 * Math.PI - Math.PI / 2
          return <circle key={k} cx={C + R * Math.cos(a)} cy={C + R * Math.sin(a)} r={k === i ? 22 : 15} fill={k === i ? 'var(--accent)' : 'var(--accent-soft)'} style={{ transition: 'all 0.3s' }} />
        })}
        {steps.map((_, k) => {
          const a = (k / n) * 2 * Math.PI - Math.PI / 2
          return <text key={k} x={C + R * Math.cos(a)} y={C + R * Math.sin(a) + 6} text-anchor="middle" font-size="16" font-weight="900" fill={k === i ? 'var(--on-accent)' : 'var(--accent-ink)'}>{k + 1}</text>
        })}
        <foreignObject x={C - 60} y={C - 46} width="120" height="92">
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', fontWeight: 800, fontSize: '14px', lineHeight: 1.25 }}><Inline text={steps[i]} /></div>
        </foreignObject>
      </svg>
      <div class="ctrls">
        <button class="reveal" onClick={() => { setAuto(false); setI((i + n - 1) % n) }}>←</button>
        <button class="reveal" onClick={() => { setAuto(false); setI((i + 1) % n) }}>→</button>
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'cycle',
  title: 'Koloběh',
  summary: 'Kroky v kruhu, které se samy postupně zvýrazňují; šipkami nebo klepnutím jde dítě krok po kroku.',
  use: 'Děje, které se opakují dokola: koloběh vody, roční období, životní cyklus, oběh látek.',
  props,
  examples: [{ title: 'Koloběh vody', props: { steps: ['Voda se vypaří', 'Pára vytvoří mraky', 'Prší nebo sněží', 'Voda steče do řek a moří'] } }],
  Component: Cycle,
  html: (p, inline) => `<ol>${p.steps.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`,
})
