import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, gcd, Step } from './kit'

const props = s.object({
  numerator: s.int({ min: 0, max: 36, description: 'Čitatel – kolik dílků je obarvených. Smí být víc než jmenovatel (pak se ukáže víc celků), nejvýš 3× jmenovatel.' }),
  denominator: s.int({ min: 1, max: 12, description: 'Jmenovatel – na kolik stejných dílů je celek rozdělený.' }),
})
type P = Infer<typeof props>

function Fraction({ numerator, denominator }: P) {
  const [d, setD] = useState(Math.max(1, denominator))
  const [n, setN] = useState(Math.min(numerator, Math.max(1, denominator) * 3))
  const R = 70, cx = 80, cy = 80
  const whole = Math.max(1, Math.ceil(n / d))
  const pies = Array.from({ length: whole }, (_, p) => {
    const filled = Math.max(0, Math.min(d, n - p * d))
    return (
      <svg key={p} viewBox="0 0 160 160" width={whole > 1 ? 120 : 160}>
        {Array.from({ length: d }, (_, i) => {
          if (d === 1) return <circle key={i} cx={cx} cy={cy} r={R} fill={i < filled ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--card)" stroke-width="3" />
          const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2
          const large = a1 - a0 > Math.PI ? 1 : 0
          return <path key={i} d={`M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`} fill={i < filled ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--card)" stroke-width="3" style={{ transition: 'fill 0.25s' }} />
        })}
      </svg>
    )
  })
  const g = gcd(n, d)
  return (
    <div class="w">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>{pies}</div>
      <div class="val" style={{ fontSize: '2rem', lineHeight: 1.1 }}>
        <span style={{ display: 'inline-grid', justifyItems: 'center' }}><span>{n}</span><span style={{ borderTop: '3px solid currentColor', padding: '0 6px' }}>{d}</span></span>
      </div>
      <div class="sub">{g > 1 && n > 0 ? `= ${n / g}/${d / g}` : ' '}{n / d ? ` · ${fmt(n / d)}` : ''}</div>
      <div class="ctrls">
        <Step value={n} set={setN} min={0} max={d * 3} label={`nahoře ${n}`} />
        <Step value={d} set={(v) => { setD(v); setN(Math.min(n, v * 3)) }} min={1} max={12} label={`dole ${d}`} />
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'fraction',
  title: 'Zlomek',
  summary: 'Koláč rozdělený na dílky s obarvenou částí a zlomkem pod ním. Dítě mění čitatel i jmenovatel a vidí krácení a desetinné číslo.',
  use: 'Co je zlomek, porovnávání a krácení zlomků, smíšená čísla, převod na desetinné číslo.',
  props,
  examples: [
    { title: 'Tři čtvrtiny', props: { numerator: 3, denominator: 4 } },
    { title: 'Víc než celek', props: { numerator: 7, denominator: 4 } },
  ],
  check: (p) => (p.numerator > p.denominator * 3 ? ['numerator may be at most 3 × denominator'] : []),
  Component: Fraction,
})
