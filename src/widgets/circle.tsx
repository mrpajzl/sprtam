import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

// A circle with its radius r and diameter d, the formulas o = 2πr and S = πr² with the numbers filled in.
// "Odvaluj" rolls the circle along a line (CSS transitions only) to show o ≈ 3,14 · d.
// Optionally a sector with angle α, its area and arc length (secondary school).

const props = s.object({
  r: s.number({ min: 0.5, max: 100, description: 'Poloměr na začátku. Do max 20 po půlkách (2,5), jinak celé číslo.' }),
  max: s.optional(s.int({ min: 2, max: 100, description: 'Největší poloměr na posuvníku. Výchozí 10.' })),
  unit: s.optional(s.enum(['mm', 'cm', 'dm', 'm', 'km'], { description: 'Jednotka délky. Výchozí "cm".' })),
  input: s.optional(s.enum(['r', 'd'], { description: 'Co dítě zadává posuvníkem na začátku: "r" poloměr, nebo "d" průměr. Dá se přepnout. Výchozí "r".' })),
  pi: s.optional(s.enum(['3.14', 'exact'], { description: 'Jak počítat s π na začátku: "3.14" – dosadit π ≈ 3,14, "exact" – nechat π ve výsledku (6π cm ≈ 18,85 cm). Dá se přepnout. Výchozí "3.14".' })),
  roll: s.optional(s.boolean({ description: 'Začít v režimu „odvaluj“: kružnice se odvalí po přímce a ukáže, že obvod je asi 3,14 průměru.' })),
  sector: s.optional(s.int({ min: 1, max: 359, description: 'Kruhová výseč s tímto středovým úhlem α ve stupních: ukáže její obsah a délku oblouku, α jde měnit posuvníkem (SŠ).' })),
})
type P = Infer<typeof props>

/** „=“ when the rounded number is exact, otherwise „≈“. */
const eq = (v: number) => (Math.abs(Math.round(v * 100) / 100 - v) < 1e-9 ? '=' : '≈')
const stepOf = (max: number) => (max <= 20 ? 0.5 : 1)

function Seg<T extends string>({ label, value, set, options }: { label: string; value: T; set: (v: T) => void; options: [T, string][] }) {
  return (
    <div class="circle-seg" role="group" aria-label={label}>
      {options.map(([v, t]) => <button key={v} class={v === value ? 'on' : ''} aria-pressed={v === value} onClick={() => set(v)}>{t}</button>)}
    </div>
  )
}

function Picture({ r, max, u, alpha }: { r: number; max: number; u: string; alpha?: number }) {
  const cx = 150, cy = 110, R = 18 + 82 * (r / max)
  const rad = Math.PI / 180
  const ra = alpha === undefined ? -40 : 0 // the radius drawn at this angle (degrees, counterclockwise)
  const px = (a: number, k = R) => cx + k * Math.cos(-a * rad), py = (a: number, k = R) => cy + k * Math.sin(-a * rad)
  return (
    <svg viewBox="0 0 300 220" width="300" role="img" aria-label={`Kruh s poloměrem ${fmt(r)} ${u} a průměrem ${fmt(2 * r)} ${u}`}>
      <circle cx={cx} cy={cy} r={R} class="circle-disc" />
      {alpha !== undefined && <path class="circle-sector" d={alpha >= 360 ? '' : `M${cx},${cy} L${px(0)},${py(0)} A${R},${R} 0 ${alpha > 180 ? 1 : 0} 0 ${px(alpha)},${py(alpha)} Z`} />}
      {alpha !== undefined && <path class="circle-arc" d={`M${px(0)},${py(0)} A${R},${R} 0 ${alpha > 180 ? 1 : 0} 0 ${px(alpha)},${py(alpha)}`} />}
      {alpha !== undefined && <text x={px(alpha / 2, Math.min(34, R * 0.55))} y={py(alpha / 2, Math.min(34, R * 0.55)) + 5} class="circle-label alpha" text-anchor="middle">α</text>}
      {alpha === undefined && <>
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} class="circle-d" />
        <text x={cx - R / 2} y={cy + 18} class="circle-label d" text-anchor="middle">d</text>
      </>}
      <line x1={cx} y1={cy} x2={px(ra)} y2={py(ra)} class="circle-r" />
      <text x={px(ra, R / 2) + (alpha === undefined ? 8 : 0)} y={py(ra, R / 2) + (alpha === undefined ? -6 : -8)} class="circle-label r" text-anchor="middle">r</text>
      <circle cx={cx} cy={cy} r="3.5" fill="var(--ink)" />
      <text x={cx - 6} y={alpha === undefined ? cy - 7 : cy + 16} class="circle-label s" text-anchor="end">S</text>
    </svg>
  )
}

/** The circle rolls once along a line: the drawn circumference unwinds into a segment of length π · d. */
function Roll({ r, u, pi }: { r: number; u: string; pi: '3.14' | 'exact' }) {
  const [run, setRun] = useState(0) // remount key: a new run starts unrolled
  const [rolled, setRolled] = useState(false)
  const R = 40, x0 = 14 + R, cy = 84, ground = cy + R, C = 2 * Math.PI * R
  const d = 2 * r, o = pi === 'exact' ? Math.PI * d : 3.14 * d
  return (
    <>
      <svg key={run} viewBox="0 0 360 160" width="360" class={`circle-roll${rolled ? ' rolled' : ''}`} role="img"
        aria-label={rolled ? 'Kružnice se odvalila: obvod je o něco víc než tři průměry' : 'Kružnice připravená k odvalení'}>
        <line x1="6" y1={ground} x2="354" y2={ground} stroke="var(--line)" stroke-width="2" />
        <line x1={x0} y1={ground} x2={x0 + C} y2={ground} pathLength={100} class="circle-unrolled" />
        <g class="circle-ticks">
          {[1, 2, 3].map((k) => <g key={k}>
            <line x1={x0 + k * 2 * R} x2={x0 + k * 2 * R} y1={ground - 7} y2={ground + 7} stroke="var(--ink)" stroke-width="2" />
            <text x={x0 + (k - 0.5) * 2 * R} y={ground + 22} text-anchor="middle" class="circle-label d">d</text>
          </g>)}
          <line x1={x0} x2={x0} y1={ground - 7} y2={ground + 7} stroke="var(--ink)" stroke-width="2" />
          <text x={x0 + 6 * R + Math.PI * R - 3 * R} y={ground + 22} text-anchor="middle" class="circle-tick-rest">0,14d</text>
        </g>
        <g class="circle-wheel" style={{ transformOrigin: `${x0}px ${cy}px`, transform: rolled ? `translate(${C}px, 0px) rotate(360deg)` : 'translate(0px, 0px) rotate(0deg)' }}>
          <circle cx={x0} cy={cy} r={R} class="circle-ghost" />
          <path d={`M${x0},${cy + R} A${R},${R} 0 1 0 ${x0},${cy - R} A${R},${R} 0 1 0 ${x0},${cy + R}`} pathLength={100} class="circle-rim" />
          <line x1={x0} y1={cy - R} x2={x0} y2={cy + R} class="circle-d thin" />
          <circle cx={x0} cy={cy + R} r="4.5" fill="var(--accent)" />
          <circle cx={x0} cy={cy} r="3" fill="var(--ink)" />
        </g>
      </svg>
      <div class="val" aria-live="polite">{rolled ? `o ${pi === 'exact' ? '=' : '≈'} ${pi === 'exact' ? 'π' : '3,14'} · d` : 'Kolik průměrů je obvod?'}</div>
      <div class="sub">{rolled
        ? <>Obvod je trochu víc než 3 průměry. {pi === 'exact' ? <>o = π · {fmt(d)} = {fmt(d)}π {u} ≈ {fmt(o)} {u}</> : <>o ≈ 3,14 · {fmt(d)} {eq(o)} {fmt(o)} {u}</>}</>
        : <>Kružnici s průměrem d = {fmt(d)} {u} odvalíme po přímce o jednu otočku.</>}</div>
      <div class="ctrls">
        {rolled
          ? <button class="reveal" onClick={() => { setRolled(false); setRun(run + 1) }}>Znovu</button>
          : <button class="reveal" onClick={() => setRolled(true)}>Odvaluj ▶</button>}
      </div>
    </>
  )
}

function Circle({ r: r0, max = 10, unit = 'cm', input = 'r', pi: pi0 = '3.14', roll = false, sector }: P) {
  const step = stepOf(max)
  const [r, setR] = useState(Math.min(max, Math.max(step, r0)))
  const [inp, setInp] = useState<'r' | 'd'>(input)
  const [pi, setPi] = useState<'3.14' | 'exact'>(pi0)
  const [view, setView] = useState<'circle' | 'roll'>(roll ? 'roll' : 'circle')
  const [alpha, setAlpha] = useState(sector ?? 90)
  const u = unit, d = 2 * r
  const P = pi === 'exact' ? Math.PI : 3.14
  const o = 2 * P * r, S = P * r * r
  const sq = `${fmt(r)}²`
  const exact = pi === 'exact'
  const lines = [
    inp === 'r'
      ? <>d = 2 · r = 2 · {fmt(r)} = <b>{fmt(d)} {u}</b></>
      : <>r = d : 2 = {fmt(d)} : 2 = <b>{fmt(r)} {u}</b></>,
    exact
      ? <>o = {inp === 'r' ? <>2πr = 2 · π · {fmt(r)}</> : <>πd = π · {fmt(d)}</>} = <b>{fmt(d)}π {u}</b> ≈ {fmt(o)} {u}</>
      : <>o = {inp === 'r' ? <>2πr = 2 · 3,14 · {fmt(r)}</> : <>πd = 3,14 · {fmt(d)}</>} {eq(o)} <b>{fmt(o)} {u}</b></>,
    exact
      ? <>S = πr² = π · {sq} = <b>{fmt(r * r)}π {u}²</b> ≈ {fmt(S)} {u}²</>
      : <>S = πr² = 3,14 · {sq} = 3,14 · {fmt(r * r)} {eq(S)} <b>{fmt(S)} {u}²</b></>,
  ]
  if (sector !== undefined) {
    const k = alpha / 360
    lines.push(<>výseč: S<sub>v</sub> = <span class="circle-frac">{alpha}°/360°</span> · πr² {eq(k * S)} <b>{fmt(k * S)} {u}²</b></>)
    lines.push(<>oblouk: l = <span class="circle-frac">{alpha}°/360°</span> · 2πr {eq(k * o)} <b>{fmt(k * o)} {u}</b></>)
  }
  return (
    <div class="w">
      <Seg label="Zobrazení" value={view} set={setView} options={[['circle', 'Kruh'], ['roll', 'Odvaluj']]} />
      {view === 'roll' ? <Roll r={r} u={u} pi={pi} /> : <>
        <Picture r={r} max={max} u={u} alpha={sector !== undefined ? alpha : undefined} />
        <div class="val">r = {fmt(r)} {u} · d = {fmt(d)} {u}</div>
        <div class="circle-lines" aria-live="polite">{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
      </>}
      <div class="circle-opts">
        <Seg label="Co zadávám" value={inp} set={setInp} options={[['r', 'zadávám r'], ['d', 'zadávám d']]} />
        <Seg label="Jak počítat s π" value={pi} set={setPi} options={[['3.14', 'π ≈ 3,14'], ['exact', 'přesně']]} />
      </div>
      {inp === 'r'
        ? <Slider name="r" value={r} set={setR} min={step} max={max} step={step} />
        : <Slider name="d" value={d} set={(v) => setR(v / 2)} min={2 * step} max={2 * max} step={2 * step} />}
      {sector !== undefined && view === 'circle' && <Slider name="α" value={alpha} set={setAlpha} min={5} max={355} step={5} />}
    </div>
  )
}

export default defineWidget({
  name: 'circle',
  title: 'Kruh a kružnice',
  summary: 'Kruh s poloměrem a průměrem a pod ním výpočet průměru, obvodu o = 2πr a obsahu S = πr² s dosazením. Posuvníkem se mění r nebo d, π jde dosadit jako 3,14 nebo nechat přesně. V režimu „Odvaluj“ se kružnice odvalí po přímce a ukáže, že obvod je asi 3,14 průměru. Volitelně kruhová výseč s obsahem a délkou oblouku.',
  use: 'Kruh a kružnice, poloměr a průměr, obvod a obsah kruhu, číslo π, kruhová výseč a délka oblouku.',
  props,
  examples: [
    { title: 'Obvod a obsah kruhu', props: { r: 3 } },
    { title: 'Proč je obvod 3,14 · d', props: { r: 2, input: 'd', roll: true } },
    { title: 'Kruhová výseč (SŠ)', props: { r: 5, max: 10, pi: 'exact', sector: 120 } },
  ],
  check: (p) => {
    const max = p.max ?? 10, step = stepOf(max)
    const e: string[] = []
    if (p.r > max) e.push(`r must be at most max (${max})`)
    if (Math.abs(p.r / step - Math.round(p.r / step)) > 1e-9) e.push(step === 1 ? 'r must be a whole number when max > 20' : 'r must be a multiple of 0.5')
    return e
  },
  Component: Circle,
  html: (p, inline) => {
    const u = p.unit ?? 'cm', r = p.r
    return `<p>${inline(`Kruh s poloměrem r = ${fmt(r)} ${u}: průměr d = ${fmt(2 * r)} ${u}, obvod o = 2πr ≈ ${fmt(2 * 3.14 * r)} ${u}, obsah S = πr² ≈ ${fmt(3.14 * r * r)} ${u}².`)}</p>`
  },
})
