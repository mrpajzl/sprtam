import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Graph, Slider } from './kit'

const props = s.object({
  a: s.number({ min: -3, max: 3, description: 'Koeficient a u x² (po 0,5, nesmí být 0): kladné = parabola otevřená nahoru.' }),
  b: s.number({ min: -6, max: 6, description: 'Koeficient b u x.' }),
  c: s.number({ min: -6, max: 6, description: 'Absolutní člen c – kde parabola protne osu y.' }),
}, { description: 'Funkce y = a · x² + b · x + c.' })
type P = Infer<typeof props>

function Quadratic({ a: a0, b: b0, c: c0 }: P) {
  const [a, setA] = useState(a0 || 1), [b, setB] = useState(b0), [c, setC] = useState(c0)
  const D = b * b - 4 * a * c
  const roots = D < 0 ? 'žádný reálný kořen' : D === 0 ? `x = ${fmt(-b / (2 * a))}` : `x₁ = ${fmt((-b - Math.sqrt(D)) / (2 * a))}, x₂ = ${fmt((-b + Math.sqrt(D)) / (2 * a))}`
  const t = (n: number, s: string) => (n === 0 ? '' : `${n < 0 ? ' − ' : ' + '}${Math.abs(n) === 1 && s ? '' : fmt(Math.abs(n))}${s}`)
  return (
    <div class="w">
      <Graph f={(x) => a * x * x + b * x + c} />
      <div class="val">y = {a === 1 ? '' : a === -1 ? '−' : fmt(a)}x²{t(b, 'x')}{t(c, '')}</div>
      <div class="sub">D = {fmt(D)} · {roots}</div>
      <Slider name="a" value={a} set={(v) => setA(v || 0.5)} min={-3} max={3} step={0.5} />
      <Slider name="b" value={b} set={setB} min={-6} max={6} step={1} />
      <Slider name="c" value={c} set={setC} min={-6} max={6} step={1} />
    </div>
  )
}

export default defineWidget({
  name: 'quadratic',
  title: 'Kvadratická funkce',
  summary: 'Graf paraboly y = a · x² + b · x + c. Posuvníky mění koeficienty; pod grafem je diskriminant a kořeny.',
  use: 'Kvadratická funkce, vliv koeficientů na parabolu, diskriminant a počet řešení kvadratické rovnice.',
  props,
  examples: [{ title: 'y = x² − 2x − 3', props: { a: 1, b: -2, c: -3 } }],
  check: (p) => (p.a === 0 ? ['a must not be 0'] : []),
  Component: Quadratic,
})
