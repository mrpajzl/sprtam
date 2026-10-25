import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

const props = s.object({
  a: s.int({ min: 1, max: 12, description: 'Délka první odvěsny na začátku.' }),
  b: s.int({ min: 1, max: 12, description: 'Délka druhé odvěsny na začátku.' }),
})
type P = Infer<typeof props>

function Pythagoras({ a: a0, b: b0 }: P) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0)
  const c = Math.sqrt(a * a + b * b)
  const k = 150 / (a + b + Math.max(a, b))
  const A = a * k, B = b * k
  const ox = A + 8, oy = 8 + B
  // right angle at (ox, oy+A); legs: vertical a (up), horizontal b (right)
  const P1 = [ox, oy], P2 = [ox, oy + A], P3 = [ox + B, oy + A]
  const dx = P3[0] - P1[0], dy = P3[1] - P1[1]
  const sq = `M${P1} L${P3} L${P3[0] + dy},${P3[1] - dx} L${P1[0] + dy},${P1[1] - dx} Z`
  const W = ox + B + A + 20, H = oy + A + B + 10
  return (
    <div class="w">
      <svg viewBox={`0 0 ${W} ${H}`} width="280">
        <path d={`M${ox - A},${oy} h${A} v${A} h${-A} Z`} fill="color-mix(in oklch, var(--accent) 30%, transparent)" />
        <path d={`M${ox},${oy + A} h${B} v${B} h${-B} Z`} fill="color-mix(in oklch, var(--accent) 45%, transparent)" />
        <path d={sq} fill="color-mix(in oklch, var(--accent-ink) 35%, transparent)" />
        <path d={`M${P1} L${P2} L${P3} Z`} fill="var(--card)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" />
        <text x={ox - A / 2} y={oy + A / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">a²={a * a}</text>
        <text x={ox + B / 2} y={oy + A + B / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">b²={b * b}</text>
        <text x={(P1[0] + P3[0]) / 2 + dy / 2} y={(P1[1] + P3[1]) / 2 - dx / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">c²={a * a + b * b}</text>
      </svg>
      <div class="val">c = √{a * a + b * b} {Number.isInteger(c) ? `= ${c}` : `≈ ${fmt(c)}`}</div>
      <Slider name="a" value={a} set={setA} min={1} max={12} />
      <Slider name="b" value={b} set={setB} min={1} max={12} />
    </div>
  )
}

export default defineWidget({
  name: 'pythagoras',
  title: 'Pythagorova věta',
  summary: 'Pravoúhlý trojúhelník se čtverci nad všemi stranami a jejich obsahy. Posuvníky mění odvěsny a ukazuje se c = √(a² + b²).',
  use: 'Pythagorova věta, výpočet přepony, druhá mocnina a odmocnina v geometrii.',
  props,
  examples: [{ title: '3, 4, 5', props: { a: 3, b: 4 } }],
  Component: Pythagoras,
})
