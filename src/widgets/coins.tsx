import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// Czech coins and banknotes as tappable pictures. With a target the pupil puts together an amount
// (and can ask for the solution with the fewest pieces); without one it just adds up what is on the table.

const ALL = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000] as const
const NOTE = 100 // 100 Kč and more are banknotes
const MAX_PIECES = 30

const props = s.object({
  target: s.optional(s.int({ min: 1, max: 10000, description: 'Cílová částka v Kč, kterou má dítě složit. Bez ní se mince jen volně sčítají.' })),
  values: s.optional(s.array(s.int({ min: 1, max: 5000 }), { min: 1, max: 12, description: 'Které mince a bankovky má dítě k dispozici (hodnoty v Kč: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000). Bez toho všechny do max.' })),
  max: s.optional(s.int({ min: 1, max: 5000, description: 'Nejvyšší mince nebo bankovka, např. 20 pro 1. třídu (jen když není values). Výchozí 5000.' })),
  pile: s.optional(s.array(s.int({ min: 1, max: 5000 }), { min: 1, max: MAX_PIECES, description: 'Mince a bankovky, které už leží na stole (hodnoty v Kč). V otázce je to hromádka, kterou má dítě sečíst.' })),
}, { description: 'České mince a bankovky.' })
type P = Infer<typeof props>

/** Thousands with a space, as Czech prices: 1 250 Kč. */
const kc = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Kč`
const available = (p: P) => (p.values ? [...new Set(p.values)].sort((a, b) => a - b) : ALL.filter((v) => v <= (p.max ?? 5000)))
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const pieces = (n: number) => (n === 1 ? '1 kus' : n < 5 ? `${n} kusy` : `${n} kusů`)

/** Fewest pieces that make `amount` from `vals` (dynamic programming, so it is right for any set, not only Czech coins). */
function fewest(amount: number, vals: readonly number[]): number[] | null {
  const best = new Int32Array(amount + 1).fill(-1), from = new Int32Array(amount + 1)
  best[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const v of vals) {
      if (v <= a && best[a - v] >= 0 && (best[a] < 0 || best[a - v] + 1 < best[a])) { best[a] = best[a - v] + 1; from[a] = v }
    }
  }
  if (best[amount] < 0) return null
  const out: number[] = []
  for (let a = amount; a > 0; a -= from[a]) out.push(from[a])
  return out.sort((a, b) => b - a)
}

// Colours are content here: the real metals and the main colours of the banknotes.
const METAL: Record<number, { fill: string; edge: string; core?: string }> = {
  1: { fill: '#cfd2d6', edge: '#878c94' },
  2: { fill: '#cfd2d6', edge: '#878c94' },
  5: { fill: '#cfd2d6', edge: '#878c94' },
  10: { fill: '#d08b5b', edge: '#93542c' },
  20: { fill: '#e2bd55', edge: '#a07d1f' },
  50: { fill: '#d08b5b', edge: '#93542c', core: '#e2bd55' },
}
const PAPER: Record<number, string> = { 100: '#7fbfa8', 200: '#f0a35e', 500: '#e08a80', 1000: '#b48ad0', 2000: '#c9b45a', 5000: '#9aa3d6' }
const SIZE: Record<number, number> = { 1: 20, 2: 21.5, 5: 23, 10: 24.5, 20: 26, 50: 27.5 } // real diameters in mm

/** One coin or banknote as SVG; `h` = rendered height in px. */
function Money({ v, h }: { v: number; h: number }) {
  if (v >= NOTE) {
    return (
      <svg viewBox="0 0 64 34" width={(h * 64) / 34} height={h} aria-hidden="true">
        <rect x="1" y="1" width="62" height="32" rx="3" fill={PAPER[v]} stroke="#3a3d44" stroke-opacity="0.45" stroke-width="1.2" />
        <circle cx="13" cy="17" r="8" fill="#ffffff" fill-opacity="0.35" />
        <text x="40" y="21.5" text-anchor="middle" font-size={v >= 1000 ? 12 : 13} font-weight="900" fill="#1b1d21">{v}</text>
      </svg>
    )
  }
  const m = METAL[v], r = (SIZE[v] / 27.5) * 15.5
  return (
    <svg viewBox="0 0 34 34" width={h} height={h} aria-hidden="true">
      <circle cx="17" cy="17" r={r} fill={m.fill} stroke={m.edge} stroke-width="1.6" />
      {m.core && <circle cx="17" cy="17" r={r * 0.62} fill={m.core} />}
      <circle cx="17" cy="17" r={r - 2.6} fill="none" stroke={m.edge} stroke-opacity="0.45" stroke-width="0.8" />
      <text x="17" y={21.5 - (r < 13 ? 0.5 : 0)} text-anchor="middle" font-size={v >= 10 ? 11 : 13} font-weight="900" fill="#1b1d21">{v}</text>
    </svg>
  )
}

function Coins(p: P) {
  const vals = useMemo(() => available(p), [p.values, p.max])
  const start = (p.pile ?? []).filter((v) => vals.includes(v))
  const [table, setTable] = useState<number[]>(start)
  const [target, setTarget] = useState(p.target)
  const [note, setNote] = useState('')
  const total = sum(table)
  const sorted = [...table].sort((a, b) => b - a)
  const full = table.length >= MAX_PIECES

  const add = (v: number) => { if (!full) { setTable([...table, v]); setNote('') } }
  const remove = (i: number) => { const v = sorted[i], k = table.indexOf(v); setTable(table.filter((_, j) => j !== k)); setNote('') }
  const solve = () => {
    const amount = target ?? total
    const best = amount ? fewest(amount, vals) : null
    if (!best) { setNote(amount ? 'Z těchhle mincí to složit nejde.' : 'Nejdřív polož na stůl nějaké peníze.'); return }
    setTable(best)
    setNote(`Nejméně kusů: ${best.map((v) => v).join(' + ')} = ${kc(amount)} (${pieces(best.length)}).`)
  }
  const another = () => {
    const top = Math.min(10000, Math.max(p.target ?? 0, 2 * vals[vals.length - 1]))
    for (let i = 0; i < 50; i++) {
      const t = 1 + Math.floor(Math.random() * top)
      const best = t !== target ? fewest(t, vals) : null
      if (best && best.length <= MAX_PIECES) { setTarget(t); setTable([]); setNote(''); return }
    }
  }

  const diff = target !== undefined ? target - total : 0
  const status = target === undefined
    ? `Celkem ${kc(total)}`
    : diff === 0 ? `Přesně ${kc(target)}! Výborně ✓` : diff > 0 ? `Máš ${kc(total)}, chybí ${kc(diff)}` : `Máš ${kc(total)}, to je o ${kc(-diff)} víc`

  const coins = vals.filter((v) => v < NOTE), notes = vals.filter((v) => v >= NOTE)
  const palette = (list: number[]) => list.length > 0 && (
    <div class="coins-row">
      {list.map((v) => (
        <button key={v} class="coins-key" onClick={() => add(v)} disabled={full} aria-label={`Přidat ${kc(v)}`}>
          <Money v={v} h={v >= NOTE ? 34 : 38} />
        </button>
      ))}
    </div>
  )

  return (
    <div class="w coins">
      {target !== undefined && <div class="coins-goal">Slož <b>{kc(target)}</b></div>}
      <div class={`coins-table ${target !== undefined && diff === 0 ? 'ok' : ''}`} aria-label="Stůl">
        {sorted.length === 0 && <span class="coins-empty">Klepni na minci nebo bankovku dole.</span>}
        {sorted.map((v, i) => (
          <button key={`${v}-${i}`} class="coins-piece" onClick={() => remove(i)} aria-label={`Odebrat ${kc(v)}`}>
            <Money v={v} h={v >= NOTE ? 30 : 34} />
          </button>
        ))}
      </div>
      <div class={`val ${target !== undefined && diff === 0 ? 'coins-ok' : ''}`} aria-live="polite">{status}</div>
      <div class="sub">{note || (sorted.length ? `${pieces(sorted.length)} · ${sorted.join(' + ')}` : 'Na stole nic není.')}</div>
      {palette(coins)}
      {palette(notes)}
      {full && <div class="sub">Víc se na stůl nevejde – klepnutím na stole něco odeber.</div>}
      <div class="ctrls">
        <button class="reveal" onClick={solve}>Nejméně kusů</button>
        {table.length > 0 && <button class="reveal" onClick={() => { setTable([]); setNote('') }}>Vysypat</button>}
        {p.target !== undefined && <button class="reveal" onClick={another}>Jiná částka</button>}
      </div>
    </div>
  )
}

/** The pile alone, for a question „Kolik je to korun?“. */
function CoinsQuestion(p: P) {
  const pile = [...(p.pile ?? [])].sort((a, b) => b - a)
  const counts = [...new Set(pile)].map((v) => `${pile.filter((x) => x === v).length}× ${kc(v)}`).join(', ')
  return (
    <div class="coins-table coins-q" role="img" aria-label={`Hromádka peněz: ${counts}`}>
      {pile.map((v, i) => <span key={i} class="coins-piece"><Money v={v} h={v >= NOTE ? 34 : 40} /></span>)}
    </div>
  )
}

export default defineWidget({
  name: 'coins',
  title: 'Peníze',
  summary: 'České mince a bankovky jako obrázky. Dítě je klepnutím pokládá na stůl a bere zpět, vidí součet. Se zadanou částkou ji má složit; tlačítko „Nejméně kusů“ ukáže řešení s co nejmenším počtem mincí a bankovek.',
  use: 'Počítání s penězi v 1.–3. třídě, sčítání do 20, 100 a 1000, rozklad čísla, placení a vracení; v otázkách (input) hromádka peněz „Kolik je to korun?“.',
  props,
  examples: [
    { title: 'Kolik je na stole', props: { values: [1, 2, 5, 10, 20, 50], pile: [20, 10, 5, 2, 1] } },
    { title: 'Slož 38 Kč', props: { target: 38, max: 50 } },
    { title: 'Slož 1 750 Kč', props: { target: 1750 } },
  ],
  check: (p) => {
    const e: string[] = []
    const allowed = new Set<number>(ALL)
    for (const v of [...(p.values ?? []), ...(p.pile ?? [])]) if (!allowed.has(v)) e.push(`${v} is not a Czech coin or banknote (${ALL.join(', ')})`)
    if (p.values && p.max !== undefined) e.push('use values or max, not both')
    if (p.values && new Set(p.values).size !== p.values.length) e.push('values: duplicates')
    if (p.max !== undefined && !allowed.has(p.max)) e.push(`max ${p.max} is not a Czech coin or banknote`)
    if (e.length) return e
    const vals = available(p)
    for (const v of p.pile ?? []) if (!vals.includes(v)) e.push(`pile: ${v} Kč is not among the available values`)
    if (p.target !== undefined) {
      const best = fewest(p.target, vals)
      if (!best) e.push(`target ${p.target} cannot be made from ${vals.join(', ')}`)
      else if (best.length > MAX_PIECES) e.push(`target ${p.target} needs ${best.length} pieces, at most ${MAX_PIECES} fit`)
    }
    return e
  },
  Component: Coins,
  Question: CoinsQuestion,
  checkQuestion: (p, answers) => {
    if (!p.pile?.length) return ['a question needs a pile']
    const want = sum(p.pile)
    return answers.some((a) => Number(a.replace(/\s|Kč/g, '').replace(',', '.')) === want) ? [] : [`the sum ${want} is not among the answers`]
  },
})
