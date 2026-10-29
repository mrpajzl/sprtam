import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

const ASK = ['mean', 'median', 'mode', 'range'] as const
const props = s.object({
  values: s.array(s.number(), { min: 1, max: 15, description: 'Hodnoty v pořadí, jak byly naměřené (např. známky z písemky). 1–15 hodnot, všechny mezi min a max.' }),
  label: s.optional(s.string({ description: 'Co hodnoty znamenají, např. „Známky z písemky“ nebo „Teplota v poledne“.' })),
  unit: s.optional(s.string({ description: 'Jednotka za číslem, např. „°C“, „Kč“, „cm“. U známek vynech.' })),
  min: s.number({ min: -1000, max: 1000, description: 'Nejmenší hodnota, kterou jde nastavit (spodek grafu).' }),
  max: s.number({ min: -1000, max: 10000, description: 'Největší hodnota, kterou jde nastavit (vršek grafu).' }),
  step: s.optional(s.number({ min: 0.1, max: 1000, description: 'O kolik mění hodnotu tlačítka − a +. Výchozí 1.' })),
  outlier: s.optional(s.boolean({ description: 'Ukázat tlačítko „odlehlá hodnota“: přidá extrém (min nebo max) a ukáže, že průměr se pohne hodně, medián málo.' })),
  ask: s.optional(s.enum(ASK, { description: 'Jen pro otázku typu input: co má dítě spočítat (mean = průměr, median = medián, mode = modus, range = rozpětí). Kontrola ověří, že výsledek je mezi odpověďmi.' })),
})
type P = Infer<typeof props>

// ——— Math ———

const round = (n: number) => Math.round(n * 1e9) / 1e9
const sorted = (v: number[]) => [...v].sort((a, b) => a - b)
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
function median(v: number[]) {
  const o = sorted(v), m = Math.floor(o.length / 2)
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2
}
/** Most frequent values; [] when every value occurs equally often (and there are at least two different ones). */
function modes(v: number[]) {
  const c = new Map<number, number>()
  for (const x of v) c.set(x, (c.get(x) ?? 0) + 1)
  const top = Math.max(...c.values())
  const m = [...c].filter(([, n]) => n === top).map(([x]) => x).sort((a, b) => a - b)
  return { values: c.size > 1 && m.length === c.size ? [] : m, count: top }
}
const range = (v: number[]) => Math.max(...v) - Math.min(...v)
const statOf = (v: number[], ask: (typeof ASK)[number]) => (ask === 'mean' ? mean(v) : ask === 'median' ? median(v) : ask === 'range' ? range(v) : modes(v).values[0])

/** Value with unit; negative numbers in brackets inside a sum. */
const u = (n: number, unit?: string) => `${fmt(n)}${unit ? ` ${unit}` : ''}`
const term = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n))
const eq = (n: number) => (Math.abs(round(n) - Math.round(n * 100) / 100) > 1e-9 ? '≈' : '=')

// ——— Widget ———

function Bars({ vals, min, max, unit, sel, setSel, lines }: { vals: number[]; min: number; max: number; unit?: string; sel?: number; setSel?: (i: number) => void; lines?: { mean: number; median: number } }) {
  // Bars grow from 0 when the range crosses zero (temperatures), otherwise from the bottom (min).
  const cross = min < 0 && max > 0
  const h = (v: number) => (cross ? 4 : 8) + ((cross ? 92 : 92) * (Math.min(max, Math.max(min, v)) - min)) / (max - min || 1)
  const base = cross ? h(0) : 0
  return (
    <div class={`stats-chart ${cross ? 'cross' : ''}`}>
      {cross && <div class="stats-zero" style={{ bottom: `${base}%` }} />}
      {vals.map((v, i) => {
        const y = h(v), up = y >= base
        const inner = <>
          <span class="stats-fill" style={{ bottom: `${Math.min(y, base)}%`, height: `${Math.max(Math.abs(y - base), 1.5)}%` }} />
          <span class="stats-num" style={up ? { bottom: `calc(${y}% + 2px)` } : { top: `calc(${100 - y}% + 2px)` }}>{fmt(v)}</span>
        </>
        return setSel
          ? <button key={i} class={`stats-bar ${sel === i ? 'sel' : ''}`} onClick={() => setSel(i)} aria-label={`${i + 1}. hodnota ${u(v, unit)}${sel === i ? ', vybraná' : ''}`} aria-pressed={sel === i}>{inner}</button>
          : <div key={i} class="stats-bar">{inner}</div>
      })}
      {lines && <div class="stats-line mean" style={{ bottom: `${h(lines.mean)}%` }} />}
      {lines && <div class="stats-line median" style={{ bottom: `${h(lines.median)}%` }} />}
    </div>
  )
}

function Stats({ values, label, unit, min, max, step = 1, outlier }: P) {
  const [vals, setVals] = useState(values)
  const [sel, setSel] = useState(0)
  const [out, setOut] = useState<{ mean: number; median: number } | null>(null) // stats before the outlier was added
  const edit = (next: number[], i = sel) => { setVals(next); setSel(Math.max(0, Math.min(i, next.length - 1))); setOut(null) }
  const change = (d: number) => edit(vals.map((v, i) => (i === sel ? round(Math.min(max, Math.max(min, v + d))) : v)))

  const n = vals.length, sum = vals.reduce((a, b) => a + b, 0), avg = sum / n
  const o = sorted(vals), med = median(vals), mid = n % 2 ? [Math.floor(n / 2)] : [n / 2 - 1, n / 2]
  const mo = modes(vals)
  const lo = o[0], hi = o[n - 1]
  const extreme = Math.abs(max - med) >= Math.abs(med - min) ? max : min

  const toggleOutlier = () => {
    if (out) { setVals(vals.slice(0, -1)); setSel(Math.min(sel, n - 2)); setOut(null) }
    else { setOut({ mean: avg, median: med }); setVals([...vals, extreme]); setSel(n) }
  }

  return (
    <div class="w stats">
      {label && <div class="sub">{label}{unit ? ` (${unit})` : ''}</div>}
      <Bars vals={vals} min={min} max={max} unit={unit} sel={sel} setSel={setSel} lines={{ mean: avg, median: med }} />
      <div class="stats-legend" aria-hidden="true"><span><i class="mean" />průměr</span><span><i class="median" />medián</span></div>
      <div class="ctrls">
        <div class="step">
          <button onClick={() => change(-step)} disabled={vals[sel] <= min} aria-label={`Zmenšit ${sel + 1}. hodnotu`}>−</button>
          <span aria-live="polite">{u(vals[sel], unit)}</span>
          <button onClick={() => change(step)} disabled={vals[sel] >= max} aria-label={`Zvětšit ${sel + 1}. hodnotu`}>+</button>
        </div>
        <button class="chip" onClick={() => edit([...vals, vals[sel]], n)} disabled={n >= 15} aria-label="Přidat hodnotu">+ přidat</button>
        <button class="chip" onClick={() => edit(vals.filter((_, i) => i !== sel))} disabled={n <= 1} aria-label={`Odebrat ${sel + 1}. hodnotu`}>− odebrat</button>
      </div>

      <div class="stats-sorted" aria-label={`Seřazeno: ${o.map((v) => fmt(v)).join(', ')}`}>
        <span class="stats-cap">Seřazeno:</span>
        {o.map((v, i) => <span key={i} class={`stats-chip ${mid.includes(i) ? 'mid' : ''}`}>{fmt(v)}</span>)}
      </div>

      <div class="stats-cards" aria-live="polite">
        <div class="stats-card">
          <b>Průměr</b>
          <span class="stats-big">{eq(avg) === '≈' ? '≈ ' : ''}{u(avg, unit)}</span>
          <small>{n > 1 ? `(${vals.map(term).join(' + ')}) ÷ ${n} = ` : ''}{fmt(sum)} ÷ {n} {eq(avg)} {fmt(avg)}</small>
        </div>
        <div class="stats-card">
          <b>Medián</b>
          <span class="stats-big">{u(med, unit)}</span>
          <small>{n % 2 ? `prostřední hodnota (${mid[0] + 1}. z ${n})` : `(${fmt(o[mid[0]])} + ${fmt(o[mid[1]])}) ÷ 2 = ${fmt(med)}`}</small>
        </div>
        <div class="stats-card">
          <b>Modus</b>
          <span class="stats-big">{mo.values.length ? mo.values.map((v) => u(v, unit)).join(' a ') : 'není'}</span>
          <small>{mo.values.length ? `nejčastější, ${mo.count}×` : 'každá hodnota je stejně často'}</small>
        </div>
        <div class="stats-card">
          <b>Rozpětí</b>
          <span class="stats-big">{u(hi - lo, unit)}</span>
          <small>největší − nejmenší = {fmt(hi)} − {term(lo)}</small>
        </div>
      </div>

      {outlier && (
        <div class="stats-out">
          <button class="reveal" onClick={toggleOutlier} disabled={!out && n >= 15} aria-pressed={!!out}>{out ? 'Odebrat odlehlou hodnotu' : `Přidat odlehlou hodnotu ${fmt(extreme)}`}</button>
          {out && (
            <div aria-live="polite">
              Průměr: {fmt(out.mean)} → <b>{fmt(avg)}</b> (posun o {fmt(Math.abs(avg - out.mean))}).{' '}
              Medián: {fmt(out.median)} → <b>{fmt(med)}</b> (posun o {fmt(Math.abs(med - out.median))}).
            </div>
          )}
        </div>
      )}
      <div class="sub stats-hint">Klepni na sloupec a měň ho tlačítky − a +.</div>
    </div>
  )
}

/** Only the data, without the results. */
function StatsQuestion({ values, label, unit, min, max }: P) {
  return (
    <div class="w stats">
      {label && <div class="sub">{label}{unit ? ` (${unit})` : ''}</div>}
      <Bars vals={values} min={min} max={max} unit={unit} />
    </div>
  )
}

const NAMES = { mean: 'průměr', median: 'medián', mode: 'modus', range: 'rozpětí' }

export default defineWidget({
  name: 'stats',
  title: 'Průměr, medián, modus',
  summary: 'Řada hodnot jako sloupečky. Dítě hodnoty přidává, ubírá a mění a průběžně vidí aritmetický průměr (součet ÷ počet), medián v seřazené řadě, modus a rozpětí. Volitelně ukáže, jak odlehlá hodnota pohne průměrem, ale skoro ne mediánem.',
  use: 'Statistika: aritmetický průměr, medián, modus, rozpětí, seřazení dat, vliv odlehlé hodnoty; známky, teploty, ceny, naměřená data.',
  props,
  examples: [
    { title: 'Známky z písemky', props: { values: [1, 2, 2, 3, 1, 4, 2], label: 'Známky z písemky', min: 1, max: 5 } },
    { title: 'Teploty za týden', props: { values: [-2, 1, 3, 0, -1, 2, 4], label: 'Teplota ráno', unit: '°C', min: -5, max: 8 } },
    { title: 'Kapesné a odlehlá hodnota', props: { values: [200, 150, 250, 200, 300, 150], label: 'Kapesné za měsíc', unit: 'Kč', min: 0, max: 1500, step: 50, outlier: true } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.min >= p.max) e.push('min must be less than max')
    p.values.forEach((v, i) => { if (v < p.min || v > p.max) e.push(`values[${i}]: ${v} is outside min–max`) })
    if (p.outlier && p.values.length >= 15) e.push('outlier needs room for one more value (at most 14 values)')
    if (p.ask === 'mode' && !modes(p.values).values.length) e.push('ask "mode": the values have no mode')
    if (p.ask === 'mode' && modes(p.values).values.length > 1) e.push('ask "mode": the values have more than one mode')
    return e
  },
  Component: Stats,
  Question: StatsQuestion,
  checkQuestion: (p, answers) => {
    if (!p.ask) return ['a question needs "ask" (which value to compute)']
    const want = statOf(p.values, p.ask)
    if (want === undefined) return ['the values have no single mode']
    const ok = answers.some((a) => {
      const x = Number(a.replace(/\s/g, '').replace(',', '.').replace('−', '-'))
      return Number.isFinite(x) && (Math.abs(x - want) < 1e-9 || Math.abs(x - Math.round(want * 100) / 100) < 1e-9)
    })
    return ok ? [] : [`the ${NAMES[p.ask]} ${fmt(want)} is not among the answers`]
  },
  html: (p, inline) => {
    const v = p.values, mo = modes(v).values
    const head = p.label ? inline(p.label) + (p.unit ? ` (${inline(p.unit)})` : '') : 'Hodnota'
    return `<table><tr><th>Pořadí</th>${v.map((_, i) => `<td>${i + 1}.</td>`).join('')}</tr><tr><th>${head}</th>${v.map((x) => `<td>${fmt(x)}</td>`).join('')}</tr></table>`
      + `<p>Průměr ${eq(mean(v))} ${fmt(mean(v))}, medián = ${fmt(median(v))}, modus: ${mo.length ? mo.map(fmt).join(' a ') : 'není'}, rozpětí = ${fmt(range(v))}.</p>`
  },
})
