import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

const props = s.object({
  a: s.number({ description: 'Kolikrát x je vlevo (a v rovnici a · x + b = c). Nesmí být 0.' }),
  b: s.number({ description: 'Číslo přičtené k x vlevo (b; záporné = odečtené).' }),
  c: s.number({ description: 'Číslo vpravo (c).' }),
}, { description: 'Rovnice a · x + b = c.' })
type P = Infer<typeof props>

function Balance({ a, b, c }: P) {
  // State: left = A·x + B, right = C. Each tap applies the same step to both sides.
  const [st, setSt] = useState({ A: a, B: b, C: c })
  const done = st.A === 1 && st.B === 0
  const side = (x: number, k: number) => `${x !== 0 ? (x === 1 ? 'x' : `${fmt(x)}x`) : ''}${k !== 0 ? `${x !== 0 ? (k > 0 ? ' + ' : ' − ') : k < 0 ? '−' : ''}${fmt(Math.abs(k))}` : x === 0 ? '0' : ''}`
  return (
    <div class="w">
      <svg viewBox="0 0 300 130" width="300">
        <line x1="30" y1="60" x2="270" y2="60" stroke="var(--ink-2)" stroke-width="5" stroke-linecap="round" />
        <rect x="10" y="20" width="110" height="40" rx="10" fill="var(--accent-soft)" />
        <rect x="180" y="20" width="110" height="40" rx="10" fill="var(--accent-soft)" />
        <text x="65" y="47" text-anchor="middle" font-size="20" font-weight="900" fill="var(--accent-ink)">{side(st.A, st.B)}</text>
        <text x="235" y="47" text-anchor="middle" font-size="20" font-weight="900" fill="var(--accent-ink)">{fmt(st.C)}</text>
        <path d="M150 62 L130 120 L170 120 Z" fill="var(--ink-3)" />
      </svg>
      <div class="val">{done ? `x = ${fmt(st.C)} ✓` : `${side(st.A, st.B)} = ${fmt(st.C)}`}</div>
      <div class="ctrls">
        {st.B !== 0 && <button class="reveal" onClick={() => setSt({ ...st, B: 0, C: st.C - st.B })}>{st.B > 0 ? `− ${fmt(st.B)}` : `+ ${fmt(-st.B)}`} na obou stranách</button>}
        {st.B === 0 && st.A !== 1 && <button class="reveal" onClick={() => setSt({ A: 1, B: 0, C: st.C / st.A })}>: {fmt(st.A)} na obou stranách</button>}
        {done && <button class="reveal" onClick={() => setSt({ A: a, B: b, C: c })}>Znovu</button>}
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'balance',
  title: 'Rovnice jako váhy',
  summary: 'Rovnice a · x + b = c na rovnoramenných vahách. Dítě tlačítky dělá stejnou úpravu na obou stranách, dokud nezůstane x = …',
  use: 'Lineární rovnice, ekvivalentní úpravy („co udělám vlevo, udělám i vpravo“).',
  props,
  examples: [{ title: '3x + 4 = 19', props: { a: 3, b: 4, c: 19 } }],
  check: (p) => (p.a === 0 ? ['a must not be 0'] : !Number.isInteger((p.c - p.b) / p.a) ? ['(c − b) / a should be a whole number'] : []),
  Component: Balance,
})
