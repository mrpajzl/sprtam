import { Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Select } from '../ui/Select'
import { defineWidget } from './kit'

// A ladder of units (the biggest on top). The pupil types a number, picks its unit and taps the
// target unit on the ladder: it sees the result, every step it multiplied or divided by and how far
// the decimal comma moved. Decimal units are converted by moving the comma in the digits (exact,
// no floating point); time (60, 60, 24) with ordinary arithmetic.

type Q = 'length' | 'mass' | 'volume' | 'area' | 'time'
/** Units top (biggest) to bottom, with their size in the smallest unit. */
const LADDER: Record<Q, [string, number][]> = {
  length: [['km', 1e6], ['m', 1e3], ['dm', 100], ['cm', 10], ['mm', 1]],
  mass: [['t', 1e9], ['kg', 1e6], ['dag', 1e4], ['g', 1e3], ['mg', 1]],
  volume: [['m³', 1e6], ['hl', 1e5], ['l', 1e3], ['dm³', 1e3], ['dl', 100], ['cl', 10], ['ml', 1], ['cm³', 1]],
  area: [['km²', 1e12], ['ha', 1e10], ['a', 1e8], ['m²', 1e6], ['dm²', 1e4], ['cm²', 100], ['mm²', 1]],
  time: [['den', 86400], ['h', 3600], ['min', 60], ['s', 1]],
}
const DEFAULT: Record<Q, string> = { length: 'm', mass: 'kg', volume: 'l', area: 'm²', time: 'h' }
const NAME: Record<Q, string> = { length: 'délka', mass: 'hmotnost', volume: 'objem', area: 'obsah', time: 'čas' }
const UNIT_LIST = Object.values(LADDER).flat().map(([u]) => u)
const unit = s.enum(UNIT_LIST as [string, ...string[]])

const props = s.object({
  quantity: s.enum(['length', 'mass', 'volume', 'area', 'time'], { description: 'Veličina: "length" délka (mm–km), "mass" hmotnost (mg–t), "volume" objem (ml–hl, cm³–m³), "area" obsah (mm²–km², a, ha), "time" čas (s, min, h, den).' }),
  value: s.optional(s.number({ min: 0, max: 1e9, description: 'Číslo na začátku, např. 2.5. Výchozí 1.' })),
  from: s.optional({ ...unit, description: 'Jednotka zadaného čísla, např. "m". Výchozí m, kg, l, m² nebo h.' }),
  to: s.optional({ ...unit, description: 'Cílová jednotka, na kterou se převádí, např. "cm". V otázce povinná.' }),
  units: s.optional(s.array(unit, { min: 2, max: 8, description: 'Jen tyto jednotky na žebříku, např. ["mm", "cm", "dm", "m"] pro 3. třídu. Bez toho všechny jednotky veličiny.' })),
}, { description: 'Převod jednotek na žebříku.' })
type P = Infer<typeof props>

interface Rung { units: string[]; f: number }
function rungs(q: Q, only?: string[]): Rung[] {
  const out: Rung[] = []
  for (const [u, f] of LADDER[q]) {
    if (only && !only.includes(u)) continue
    const last = out[out.length - 1]
    if (last && last.f === f) last.units.push(u)
    else out.push({ units: [u], f })
  }
  return out
}
const factor = (q: Q, u: string) => LADDER[q].find(([x]) => x === u)?.[1] ?? 1

// ——— Exact decimal numbers as digit strings ———

interface Dec { int: string; frac: string }
const group = (int: string) => (int.length >= 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : int)
const show = (d: Dec) => group(d.int) + (d.frac ? `,${d.frac}` : '')
function parse(text: string): Dec | null {
  const t = text.replace(/\s/g, '').replace('.', ',')
  const m = /^(\d{1,10})(?:,(\d{1,10}))?$/.exec(t)
  return m ? { int: m[1].replace(/^0+(?=\d)/, ''), frac: (m[2] ?? '').replace(/0+$/, '') } : null
}
/** Multiply by 10^k by moving the comma. */
function shift(d: Dec, k: number): Dec {
  let digits = d.int + d.frac, point = d.int.length + k
  if (point < 0) { digits = '0'.repeat(-point) + digits; point = 0 }
  if (point > digits.length) digits += '0'.repeat(point - digits.length)
  return { int: digits.slice(0, point).replace(/^0+(?=\d)/, '') || '0', frac: digits.slice(point).replace(/0+$/, '') }
}
const toNum = (d: Dec) => Number(`${d.int}.${d.frac || 0}`)
const fromNum = (n: number) => parse(String(n).includes('e') ? n.toFixed(10) : String(n))

/** Converted value: exact for decimal units; time rounded to 4 places (`approx` when not exact). */
function convert(q: Q, d: Dec, from: string, to: string): { d: Dec; approx: boolean } {
  const ff = factor(q, from), ft = factor(q, to)
  if (q !== 'time') return { d: shift(d, Math.round(Math.log10(ff / ft))), approx: false }
  const r = (toNum(d) * ff) / ft, r4 = Math.round(r * 1e4) / 1e4
  return { d: fromNum(r4) ?? { int: '0', frac: '' }, approx: Math.abs(r - r4) > 1e-9 }
}

/** „den“ is the only unit that is a word: 1 den, 2 dny, 5 dní, 1,5 dne. */
const word = (u: string, d: Dec) => (u !== 'den' ? u : d.frac ? 'dne' : d.int === '1' ? 'den' : ['2', '3', '4'].includes(d.int) ? 'dny' : 'dní')
const places = (k: number) => (k === 1 ? '1 místo' : k < 5 ? `${k} místa` : `${k} míst`)
const num = (n: number) => group(String(n))

function explain(q: Q, R: Rung[], from: string, to: string) {
  const a = R.findIndex((r) => r.units.includes(from)), b = R.findIndex((r) => r.units.includes(to))
  if (a === b) return from === to ? ['Klepni na žebříku na jinou jednotku.'] : [`Je to totéž: 1 ${from} = 1 ${to}. Číslo se nemění.`]
  const down = b > a
  const steps = (down ? R.slice(a, b + 1) : R.slice(b, a + 1)).map((r, i, xs) => (i ? xs[i - 1].f / r.f : 0)).slice(1)
  if (!down) steps.reverse()
  const total = steps.reduce((x, y) => x * y, 1)
  const op = down ? '·' : ':'
  const chain = steps.map((x) => `${op}\u00a0${num(x)}`).join(' ') + (steps.length > 1 ? ` =\u00a0${op}\u00a0${num(total)}` : '')
  const lines = [`${down ? 'Z větší jednotky na menší → násobím' : 'Z menší jednotky na větší → dělím'} ${chain}`]
  if (q === 'time') lines.push('Čas se nepřevádí po desítkách (1 den = 24 h, 1 h = 60 min, 1 min = 60 s), proto nestačí posunout čárku.')
  else lines.push(`Desetinná čárka se posune o ${places(Math.round(Math.log10(total)))} ${down ? 'doprava' : 'doleva'}.`)
  return lines
}

function Units(p: P) {
  const q = p.quantity
  const R = rungs(q, p.units)
  const shown = R.flatMap((r) => r.units)
  const first = (u: string | undefined, fb: string) => (u && shown.includes(u) ? u : shown.includes(fb) ? fb : shown[0])
  const [text, setText] = useState(fromNum(p.value ?? 1) ? show(fromNum(p.value ?? 1)!).replace(/ /g, '') : '1')
  const [from, setFrom] = useState(first(p.from, DEFAULT[q]))
  const [to, setTo] = useState(first(p.to, shown.find((u) => u !== first(p.from, DEFAULT[q])) ?? shown[0]))
  const d = parse(text)
  const res = d ? convert(q, d, from, to) : null
  const a = R.findIndex((r) => r.units.includes(from)), b = R.findIndex((r) => r.units.includes(to))
  const lo = Math.min(a, b), hi = Math.max(a, b), down = b > a
  const swap = () => { if (res && !res.approx) setText(show(res.d).replace(/ /g, '')); setFrom(to); setTo(from) }

  return (
    <div class="w units">
      <div class="units-in">
        <input type="text" inputMode="decimal" value={text} maxLength={14} aria-label="Číslo" onInput={(e) => setText(e.currentTarget.value)} />
        <Select label="Jednotka zadaného čísla" value={from} onChange={setFrom} search={false} options={shown.map((u) => ({ value: u, label: u }))} />
        <button class="reveal" onClick={swap} aria-label="Prohodit jednotky">⇅</button>
      </div>
      <div class="units-ladder" role="group" aria-label={`Žebřík jednotek – ${NAME[q]}. Klepni na jednotku, na kterou chceš převádět.`}>
        {R.map((r, i) => (
          <div key={r.units.join()}>
            {i > 0 && (
              <div class={`units-gap ${i > lo && i <= hi ? (down ? 'path down' : 'path up') : ''}`}>
                {i > lo && i <= hi ? (down ? `↓ · ${num(R[i - 1].f / r.f)}` : `↑ : ${num(R[i - 1].f / r.f)}`) : `· ${num(R[i - 1].f / r.f)}`}
              </div>
            )}
            <div class="units-rung">
              {r.units.map((u, k) => (
                <Fragment key={u}>
                  {k > 0 && <span class="units-eq">=</span>}
                  <button class={`units-u ${u === from ? 'from' : ''} ${u === to ? 'to' : ''}`} aria-pressed={u === to} aria-label={`Převést na ${u}`} onClick={() => setTo(u)}>{u}</button>
                </Fragment>
              ))}
              <span class="units-v">
                {d && r.units.includes(from) ? `${show(d)} ${word(from, d)}` : res && r.units.includes(to) ? `${res.approx ? '≈ ' : ''}${show(res.d)} ${word(to, res.d)}` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div class="val" aria-live="polite">{d && res ? `${show(d)} ${word(from, d)} ${res.approx ? '≈' : '='} ${show(res.d)} ${word(to, res.d)}` : 'Napiš číslo, např. 2,5'}</div>
      {d && explain(q, R, from, to).map((t, i) => <div key={i} class="sub">{t}</div>)}
    </div>
  )
}

/** The task only: „2,5 m = ? cm“. */
function UnitsQuestion(p: P) {
  const d = fromNum(p.value ?? 1)!
  const from = p.from ?? DEFAULT[p.quantity]
  return <div class="units-q">{show(d)} {word(from, d)} = <span class="units-blank">?</span> {p.to === 'den' ? 'dní' : p.to}</div>
}

export default defineWidget({
  name: 'units',
  title: 'Převody jednotek',
  summary: 'Žebřík jednotek od největší po nejmenší. Dítě napíše číslo, vybere jeho jednotku a klepne na cílovou jednotku; vidí výsledek, čím násobilo nebo dělilo a o kolik míst se posunula desetinná čárka.',
  use: 'Převody jednotek délky, hmotnosti, objemu, obsahu a času (3.–7. třída), desetinná čísla a násobení a dělení 10, 100, 1000; v otázkách (input) zadání převodu „2,5 m = ? cm“.',
  props,
  examples: [
    { title: 'Délka: 2,5 m na cm', props: { quantity: 'length', value: 2.5, from: 'm', to: 'cm' } },
    { title: 'Obsah: hektary a ary', props: { quantity: 'area', value: 3.2, from: 'ha', to: 'm²' } },
    { title: 'Čas: 90 minut', props: { quantity: 'time', value: 90, from: 'min', to: 'h' } },
    { title: 'Objem: litry a dm³', props: { quantity: 'volume', value: 750, from: 'ml', to: 'l' } },
  ],
  check: (p) => {
    const e: string[] = []
    const own = LADDER[p.quantity].map(([u]) => u)
    for (const [k, u] of [['from', p.from], ['to', p.to]] as const) if (u && !own.includes(u)) e.push(`${k}: ${u} is not a unit of ${p.quantity} (${own.join(', ')})`)
    if (p.units) {
      for (const u of p.units) if (!own.includes(u)) e.push(`units: ${u} is not a unit of ${p.quantity}`)
      if (new Set(p.units).size !== p.units.length) e.push('units: duplicates')
      for (const u of [p.from, p.to]) if (u && !p.units.includes(u)) e.push(`units must include ${u}`)
      if (!p.from && !p.units.includes(DEFAULT[p.quantity])) e.push(`units must include from (default ${DEFAULT[p.quantity]})`)
    }
    if (p.value !== undefined && !fromNum(p.value)) e.push('value: at most 10 digits before and after the comma')
    if (p.from && p.to && p.from === p.to) e.push('from and to are the same unit')
    return e
  },
  Component: Units,
  Question: UnitsQuestion,
  checkQuestion: (p, answers) => {
    if (!p.to) return ['a question needs "to"']
    const d = fromNum(p.value ?? 1)
    if (!d) return []
    const r = convert(p.quantity, d, p.from ?? DEFAULT[p.quantity], p.to)
    if (r.approx) return [`the result is not exact (≈ ${show(r.d)}), pick other numbers`]
    const want = toNum(r.d)
    return answers.some((a) => Math.abs(Number(a.replace(/\s/g, '').replace(',', '.')) - want) <= want * 1e-12) ? [] : [`the result ${show(r.d).replace(/ /g, ' ')} is not among the answers`]
  },
  html: (p) => {
    const R = rungs(p.quantity, p.units)
    const rows = R.slice(1).map((r, i) => `<li>1 ${R[i].units[0]} = ${num(R[i].f / r.f)} ${r.units[0]}${r.units.length > 1 ? ` = ${num(R[i].f / r.f)} ${r.units[1]}` : ''}</li>`)
    R.filter((r) => r.units.length > 1).forEach((r) => rows.push(`<li>1 ${r.units[0]} = 1 ${r.units[1]}</li>`))
    return `<ul>${rows.join('')}</ul>`
  },
})
