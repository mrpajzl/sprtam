import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

const props = s.object({
  shape: s.enum(['square', 'rect', 'triangle', 'circle'], { description: 'Útvar: "square" čtverec, "rect" obdélník, "triangle" trojúhelník, "circle" kruh.' }),
  a: s.optional(s.int({ min: 1, max: 12, description: 'Strana a (u trojúhelníku základna, u kruhu poloměr r, nejvýš 6). Výchozí 4.' })),
  b: s.optional(s.int({ min: 1, max: 10, description: 'Strana b obdélníku nebo výška v trojúhelníku. Výchozí 3.' })),
})
type P = Infer<typeof props>

function Shape({ shape, a: a0 = 4, b: b0 = 3 }: P) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0)
  const s = 16
  let fig, o = '', S = ''
  if (shape === 'square') { fig = <rect x={10} y={10} width={a * s} height={a * s} rx="3" />; o = `o = 4 · ${a} = ${4 * a}`; S = `S = ${a} · ${a} = ${a * a}` }
  else if (shape === 'rect') { fig = <rect x={10} y={10} width={a * s} height={b * s} rx="3" />; o = `o = 2 · (${a} + ${b}) = ${2 * (a + b)}`; S = `S = ${a} · ${b} = ${a * b}` }
  else if (shape === 'triangle') { fig = <path d={`M10,${10 + b * s} h${a * s} L${10 + (a * s) / 3},10 Z`} />; S = `S = ${a} · ${b} : 2 = ${fmt((a * b) / 2)}`; o = `základna a = ${a}, výška v = ${b}` }
  else { fig = <circle cx={10 + a * s} cy={10 + a * s} r={a * s} />; o = `o = 2 · π · ${a} ≈ ${fmt(2 * Math.PI * a)}`; S = `S = π · ${a}² ≈ ${fmt(Math.PI * a * a)}` }
  const W = 20 + (shape === 'circle' ? 2 * a : a) * s, H = 20 + (shape === 'circle' ? 2 * a : shape === 'square' ? a : b) * s
  return (
    <div class="w">
      <svg viewBox={`0 0 ${Math.max(W, 60)} ${Math.max(H, 60)}`} width={Math.min(280, Math.max(W, 60) * 1.4)}>
        <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round">{fig}</g>
        {shape !== 'circle' && Array.from({ length: a - 1 }, (_, i) => <line key={i} x1={10 + (i + 1) * s} x2={10 + (i + 1) * s} y1={10} y2={H - 10} stroke="var(--accent)" stroke-opacity={shape === 'triangle' ? 0 : 0.25} />)}
        {(shape === 'rect' || shape === 'square') && Array.from({ length: (shape === 'square' ? a : b) - 1 }, (_, i) => <line key={i} y1={10 + (i + 1) * s} y2={10 + (i + 1) * s} x1={10} x2={W - 10} stroke="var(--accent)" stroke-opacity="0.25" />)}
      </svg>
      <div class="val" style={{ fontSize: '1.1rem' }}>{S}</div>
      <div class="sub">{o}</div>
      <Slider name={shape === 'circle' ? 'r' : 'a'} value={a} set={setA} min={1} max={shape === 'circle' ? 6 : 12} />
      {(shape === 'rect' || shape === 'triangle') && <Slider name={shape === 'triangle' ? 'v' : 'b'} value={b} set={setB} min={1} max={10} />}
    </div>
  )
}

export default defineWidget({
  name: 'shape',
  title: 'Obvod a obsah útvaru',
  summary: 'Čtverec, obdélník, trojúhelník nebo kruh se čtverečkovou sítí. Posuvníky mění rozměry; pod útvarem je výpočet obsahu S a obvodu o.',
  use: 'Obvod a obsah čtverce, obdélníku, trojúhelníku a kruhu, jednotky obsahu.',
  props,
  examples: [
    { title: 'Obdélník 5 × 3', props: { shape: 'rect', a: 5, b: 3 } },
    { title: 'Kruh', props: { shape: 'circle', a: 3 } },
  ],
  check: (p) => (p.shape === 'circle' && (p.a ?? 4) > 6 ? ['circle radius a is at most 6'] : []),
  Component: Shape,
})
