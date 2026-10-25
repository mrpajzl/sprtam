import { useRef, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const props = s.object({
  hours: s.int({ min: 0, max: 23, description: 'Hodiny na začátku (ciferník ukazuje 12 hodin, 15 = 3).' }),
  minutes: s.int({ min: 0, max: 59, description: 'Minuty na začátku. Ručičkou jde nastavit po 5 minutách.' }),
})
type P = Infer<typeof props>

function Clock({ hours, minutes }: P) {
  const [mins, setMins] = useState((hours % 12) * 60 + minutes)
  const svg = useRef<SVGSVGElement>(null)
  const h = Math.floor(mins / 60) % 12, m = mins % 60
  const drag = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const ang = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)))
    const mm = Math.round((((ang / (2 * Math.PI)) * 60 + 60) % 60) / 5) * 5 % 60
    let hh = h
    if (m >= 45 && mm <= 15) hh = (h + 1) % 12
    if (m <= 15 && mm >= 45) hh = (h + 11) % 12
    setMins(hh * 60 + mm)
  }
  const hand = (deg: number, len: number, w: number, c: string) => <line x1="100" y1="100" x2={100 + len * Math.sin((deg * Math.PI) / 180)} y2={100 - len * Math.cos((deg * Math.PI) / 180)} stroke={c} stroke-width={w} stroke-linecap="round" />
  const words = m === 0 ? `${h || 12} hodin` : m === 15 ? `čtvrt na ${(h % 12) + 1}` : m === 30 ? `půl ${(h % 12) + 1}` : m === 45 ? `tři čtvrtě na ${(h % 12) + 1}` : ''
  return (
    <div class="w">
      <svg ref={svg} viewBox="0 0 200 200" width="220" style={{ touchAction: 'none' }} onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); drag(e) }} onPointerMove={(e) => e.buttons && drag(e)}>
        <circle cx="100" cy="100" r="94" fill="var(--bg)" stroke="var(--accent)" stroke-width="5" />
        {Array.from({ length: 60 }, (_, i) => <line key={i} x1="100" y1={i % 5 ? 12 : 10} x2="100" y2={i % 5 ? 16 : 22} stroke="var(--ink-3)" stroke-width={i % 5 ? 1 : 3} transform={`rotate(${i * 6} 100 100)`} />)}
        {Array.from({ length: 12 }, (_, i) => <text key={i} x={100 + 68 * Math.sin(((i + 1) * Math.PI) / 6)} y={100 - 68 * Math.cos(((i + 1) * Math.PI) / 6) + 7} text-anchor="middle" font-size="19" font-weight="800" fill="var(--ink)">{i + 1}</text>)}
        {hand((h + m / 60) * 30, 46, 7, 'var(--ink)')}
        {hand(m * 6, 58, 4, 'var(--accent)')}
        <circle cx="100" cy="100" r="6" fill="var(--ink)" />
      </svg>
      <div class="val">{h || 12}:{String(m).padStart(2, '0')}</div>
      <div class="sub">{words || 'Táhni velkou ručičku'}</div>
    </div>
  )
}

export default defineWidget({
  name: 'clock',
  title: 'Hodiny',
  summary: 'Ručičkové hodiny. Dítě táhne velkou ručičku, malá jde s ní; pod ciferníkem je čas číslem i slovy (čtvrt, půl, tři čtvrtě).',
  use: 'Čtení času na ručičkových hodinách, celé hodiny, čtvrt, půl, tři čtvrtě.',
  props,
  examples: [{ title: 'Půl čtvrté', props: { hours: 3, minutes: 30 } }],
  Component: Clock,
})
