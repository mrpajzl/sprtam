import { useId, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

// The pH scale 0–14 in the colours of the universal indicator, with everyday substances.
// The colours are the content here (a printed universal indicator chart), so they are fixed.
const COLORS = ['#ee1c25', '#f26724', '#f8c611', '#f5ed1c', '#b5d333', '#84c341', '#4db749', '#33a94b', '#22b46b', '#0ab8b6', '#4690cd', '#3853a4', '#5a51a2', '#63459d', '#6c2180']

const SUBSTANCES = {
  zaludek: { name: 'žaludeční šťáva', ph: 1.5, shown: '1–2' },
  citron: { name: 'citron', ph: 2, shown: '2' },
  cola: { name: 'coca-cola', ph: 2.5, shown: '2,5' },
  ocet: { name: 'ocet', ph: 3, shown: '3' },
  kava: { name: 'káva', ph: 5, shown: '5' },
  dest: { name: 'déšť', ph: 5.6, shown: '5,6' },
  voda: { name: 'čistá voda', ph: 7, shown: '7' },
  krev: { name: 'krev', ph: 7.4, shown: '7,4' },
  more: { name: 'mořská voda', ph: 8, shown: '8' },
  soda: { name: 'jedlá soda (roztok)', ph: 8.5, shown: '8–9' },
  mydlo: { name: 'mýdlo', ph: 9.5, shown: '9–10' },
  cpavek: { name: 'čpavek', ph: 11, shown: '11' },
  naoh: { name: 'hydroxid sodný (roztok)', ph: 13.5, shown: '13–14' },
} as const
type Id = keyof typeof SUBSTANCES
const IDS = Object.keys(SUBSTANCES) as Id[]
/** „≈ 2“, but pure water is exactly 7 (at 25 °C). */
const approx = (id: Id) => `${id === 'voda' ? '' : 'asi '}${SUBSTANCES[id].shown}`

const props = s.object({
  highlight: s.optional(s.array(s.enum(IDS), { min: 1, max: 13, description: `Látky, které se ukážou (ostatní až po klepnutí na „Další látky“): ${IDS.map((id) => `${id} = ${SUBSTANCES[id].name}`).join(', ')}.` })),
  level: s.optional(s.enum(['zs', 'ss'], { description: '"zs" = kyselé, neutrální, zásadité (výchozí); "ss" = navíc koncentrace [H⁺] = 10^−pH, pOH a porovnání dvou roztoků (o kolik řádů se liší).' })),
  value: s.optional(s.number({ min: 0, max: 14, description: 'pH, které je nastavené na začátku (výchozí 7).' })),
}, { description: 'Stupnice pH s příklady látek.' })
type P = Infer<typeof props>

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
/** Indicator colour for any pH, mixed between the whole numbers. */
export function phColor(ph: number) {
  const i = Math.min(13, Math.floor(ph)), t = ph - i
  const a = hex(COLORS[i]), b = hex(COLORS[i + 1])
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * t)).join(' ')})`
}
const kind = (ph: number) => (ph < 7 ? 'kyselý' : ph > 7 ? 'zásaditý' : 'neutrální')
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** [H⁺] in mol/dm³: „10⁻³ = 0,001“ or „10⁻²˒⁵ ≈ 3,2 · 10⁻³“. */
function HPlus({ ph }: { ph: number }) {
  const pow = (e: number) => <>10<sup>{fmt(e)}</sup></>
  if (Number.isInteger(ph)) return <>{pow(-ph)}{ph <= 4 ? ` = ${ph ? (10 ** -ph).toFixed(ph).replace('.', ',') : '1'}` : ''} mol/dm³</>
  const e = Math.floor(-ph), m = Math.round(10 ** (-ph - e) * 10) / 10
  return <>{pow(-ph)} ≈ {m >= 10 ? pow(e + 1) : <>{fmt(m)} · {pow(e)}</>} mol/dm³</>
}
/** How many times the [H⁺] differ: „1 000krát (o 3 řády)“. */
function times(d: number) {
  if (d === 0) return 'stejná'
  const f = 10 ** d
  const r = Number.isInteger(d) ? big(f) : f < 100 ? fmt(Math.round(f * 10) / 10) : big(Number(f.toPrecision(2)))
  return `${Number.isInteger(d) ? '' : 'asi '}${r}krát ${d === 1 ? 'větší (o 1 řád)' : Number.isInteger(d) ? `větší (o ${d} ${d < 5 ? 'řády' : 'řádů'})` : 'větší'}`
}

function Scale({ ph, set, marks, b }: { ph: number; set: (n: number) => void; marks: Id[]; b?: number }) {
  const X = (v: number) => 12 + (v / 14) * 316
  const grad = `phg${useId()}`
  const onTap = (e: MouseEvent) => {
    const svg = e.currentTarget as SVGSVGElement
    const r = svg.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 340
    set(Math.max(0, Math.min(14, Math.round(((x - 12) / 316) * 14 * 10) / 10)))
  }
  return (
    <svg viewBox="0 0 340 92" width="340" class="ph-scale" onClick={onTap} aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0" x2="1">
          {COLORS.map((c, i) => <stop key={i} offset={`${(i / 14) * 100}%`} stop-color={c} />)}
        </linearGradient>
      </defs>
      <rect x={X(0)} y="20" width={X(14) - X(0)} height="30" rx="8" fill={`url(#${grad})`} />
      {Array.from({ length: 15 }, (_, i) => (
        <text key={i} x={X(i)} y="66" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-2)">{i}</text>
      ))}
      {marks.map((id) => <circle key={id} cx={X(SUBSTANCES[id].ph)} cy="80" r="4" fill="var(--ink-3)" />)}
      {b !== undefined && <g style={{ transform: `translateX(${X(b)}px)`, transition: 'transform 0.15s' }}>
        <line x1="0" x2="0" y1="18" y2="52" stroke="var(--ink-3)" stroke-width="2" stroke-dasharray="3 3" />
        <text x="0" y="12" text-anchor="middle" font-size="12" font-weight="900" fill="var(--ink-2)">B</text>
      </g>}
      <g class="ph-ptr" style={{ transform: `translateX(${X(ph)}px)` }}>
        <line x1="0" x2="0" y1="16" y2="54" stroke="var(--ink)" stroke-width="3" />
        <path d="M-7 4 L7 4 L0 15 Z" fill="var(--ink)" />
      </g>
    </svg>
  )
}

function Ph({ highlight, level = 'zs', value = 7 }: P) {
  const [ph, setPh] = useState(value)
  const [pick, setPick] = useState<Id | null>(null)
  const [more, setMore] = useState(!highlight)
  const [b, setB] = useState(value <= 11 ? Math.round(value) + 3 : Math.round(value) - 3)
  const list = more ? IDS : IDS.filter((id) => highlight?.includes(id))
  const set = (v: number) => { setPh(Math.round(v * 10) / 10); setPick(null) }
  const near = pick ? [] : list.filter((id) => Math.abs(SUBSTANCES[id].ph - ph) <= 0.5)
  const k = kind(ph)
  const ss = level === 'ss'
  const d = Math.round(Math.abs(ph - b) * 10) / 10
  return (
    <div class="w">
      <Scale ph={ph} set={set} marks={list} b={ss ? b : undefined} />
      <div class="ph-read" aria-live="polite">
        <span class="ph-dot" style={{ background: phColor(ph) }} />
        <span class="val">pH {fmt(ph)}</span>
        <span class={`ph-kind ph-${k === 'kyselý' ? 'acid' : k === 'zásaditý' ? 'base' : 'neutral'}`}>{k}</span>
      </div>
      <div class="sub">
        {pick ? `${SUBSTANCES[pick].name}: pH ${approx(pick)}, ${k === 'neutrální' ? 'neutrální' : `${k} roztok`}`
          : near.length ? `Podobné pH: ${near.map((id) => `${SUBSTANCES[id].name} (${approx(id)})`).join(', ')}`
          : ph < 7 ? 'Čím menší pH, tím kyselejší roztok.' : ph > 7 ? 'Čím větší pH, tím zásaditější roztok.' : 'Neutrální: ani kyselý, ani zásaditý.'}
      </div>
      <Slider name="pH" value={ph} set={set} min={0} max={14} step={0.1} />
      <div class="ph-chips" role="group" aria-label="Látky">
        {list.map((id) => (
          <button key={id} class={`chip ph-chip ${pick === id ? 'sel' : ''}`} onClick={() => { setPh(SUBSTANCES[id].ph); setPick(id) }} aria-pressed={pick === id}>
            <i style={{ background: phColor(SUBSTANCES[id].ph) }} />{SUBSTANCES[id].name} <small>{approx(id)}</small>
          </button>
        ))}
        {!more && <button class="chip ph-chip" onClick={() => setMore(true)}>Další látky…</button>}
      </div>
      {ss && (
        <div class="ph-ss">
          <div><span>[H⁺]</span><b><HPlus ph={ph} /></b></div>
          <div><span>pOH = 14 − pH</span><b>{fmt(Math.round((14 - ph) * 10) / 10)}</b></div>
          <Slider name="pH B" value={b} set={(v) => setB(Math.round(v * 10) / 10)} min={0} max={14} step={0.1} />
          <p aria-live="polite">
            {d === 0 ? 'Oba roztoky mají stejné pH, a tedy stejnou koncentraci H⁺.'
              : `pH se liší o ${fmt(d)} → koncentrace H⁺ v roztoku s pH ${fmt(Math.min(ph, b))} je ${times(d)} než v roztoku s pH ${fmt(Math.max(ph, b))}.`}
          </p>
          <small>Hodnoty platí pro vodné roztoky při 25 °C. Hodnoty pH látek jsou přibližné.</small>
        </div>
      )}
      {!ss && <div class="ph-note">pH látek je přibližné.</div>}
    </div>
  )
}

export default defineWidget({
  name: 'ph',
  title: 'Stupnice pH',
  summary: 'Stupnice pH 0–14 v barvách univerzálního indikátoru. Posuvníkem nebo klepnutím na stupnici dítě nastaví pH a vidí, jestli je roztok kyselý, neutrální, nebo zásaditý; klepnutím na látku (citron, ocet, krev, mýdlo…) se ukáže její přibližné pH. Pro SŠ navíc koncentrace [H⁺] = 10^−pH, pOH a o kolik řádů se liší dva roztoky.',
  use: 'Kyseliny a zásady, pH a indikátory, neutralizace, látky z běžného života; na SŠ koncentrace oxoniových kationtů a logaritmická stupnice.',
  props,
  examples: [
    { title: 'Kyselé a zásadité (ZŠ)', props: {} },
    { title: 'Látky v kuchyni', props: { highlight: ['citron', 'ocet', 'kava', 'voda', 'soda', 'mydlo'], value: 3 } },
    { title: 'Koncentrace H⁺ (SŠ)', props: { level: 'ss', value: 2 } },
  ],
  check: (p) => (p.highlight && new Set(p.highlight).size !== p.highlight.length ? ['highlight: duplicate substances'] : []),
  Component: Ph,
  html: (p) => `<p>Stupnice pH 0–14: pH menší než 7 = kyselý roztok, 7 = neutrální, větší než 7 = zásaditý.</p><table><thead><tr><th>Látka</th><th>pH (přibližně)</th></tr></thead><tbody>${(p.highlight ?? IDS)
    .map((id) => `<tr><td>${SUBSTANCES[id].name}</td><td>${SUBSTANCES[id].shown}</td></tr>`).join('')}</tbody></table>`,
})
