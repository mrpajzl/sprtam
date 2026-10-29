import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

// Gear train (or belt drive): driving wheel z1, optional idler, driven wheel z2.
//   i = z2 / z1 = n1 / n2,  n2 = n1 · z1 / z2
// Meshing gears turn opposite ways; an idler flips the sense but does not change the ratio.
// An open belt keeps the sense. The animation is slowed down (1 turn of the driving wheel = 6 s),
// runs on CSS only and starts paused for prefers-reduced-motion.

const props = s.object({
  z1: s.int({ min: 6, max: 100, description: 'Počet zubů hnacího kola z₁ (u řemenového převodu průměr hnací řemenice d₁ v cm).' }),
  z2: s.int({ min: 6, max: 100, description: 'Počet zubů hnaného kola z₂ (u řemenového převodu průměr hnané řemenice d₂ v cm).' }),
  idler: s.optional(s.int({ min: 6, max: 100, description: 'Počet zubů vloženého kola mezi nimi. Obrátí smysl otáčení, převodový poměr nezmění. Jen u ozubených kol.' })),
  n1: s.optional(s.int({ min: 1, max: 10000, description: 'Otáčky hnacího kola n₁ za minutu (min⁻¹). Výchozí 120.' })),
  belt: s.optional(s.boolean({ description: 'Řemenový převod: místo ozubených kol dvě řemenice spojené řemenem; z₁, z₂ jsou jejich průměry v cm.' })),
  ask: s.optional(s.enum(['n2', 'i'], { description: 'Jen pro otázku (input): "n2" otáčky hnaného kola (výchozí), "i" převodový poměr.' })),
}, { description: 'Převod z hnacího kola z₁ na hnané kolo z₂.' })
type P = Infer<typeof props>

const PERIOD = 6 // seconds per turn of the driving wheel
const SUB = ['₀', '₁', '₂', '₃']
const sub = (n: number) => SUB[n]

/** Toothed wheel outline around (0, 0); a tooth points along angle 0. */
function gearPath(z: number, m: number) {
  const rp = (m * z) / 2, ra = rp + m * 0.95, rf = rp - m * 1.15, p = (2 * Math.PI) / z
  const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  let d = ''
  for (let k = 0; k < z; k++) {
    const b = k * p
    d += `${k ? 'L' : 'M'}${pt(rf, b - p * 0.3)}L${pt(ra, b - p * 0.13)}L${pt(ra, b + p * 0.13)}L${pt(rf, b + p * 0.3)}`
  }
  return `${d}Z`
}

interface Wheel { z: number; x: number; r: number; phase: number; cw: boolean; period: number; role: 'drive' | 'idler' | 'driven' }

function layout(teeth: number[], belt: boolean) {
  const W = 340
  const sum = teeth.reduce((a, b) => a + b, 0)
  // Module m: the whole train fits 320 px wide and the biggest wheel 190 px tall.
  const m = Math.min(belt ? 250 / sum : 316 / (sum + 4.5), 190 / (Math.max(...teeth) + 2.2), 9)
  const gap = belt ? Math.max(24, 70 - sum * m * 0.1) : 0
  const ra = (z: number) => (m * z) / 2 + (belt ? 4 : m * 0.95)
  const H = Math.max(...teeth.map((z) => 2 * ra(z))) + 16
  const wheels: Wheel[] = []
  let x = 0
  teeth.forEach((z, i) => {
    const r = (m * z) / 2
    if (i === 0) x = r
    else x += wheels[i - 1].r + r + gap
    const prev = wheels[i - 1]
    // Meshing: a tooth of the previous wheel at its right ↔ a gap of this wheel at its left.
    const p = (2 * Math.PI) / z
    const phase = i === 0 || belt ? 0 : Math.PI - p * (0.5 + prev.phase / ((2 * Math.PI) / prev.z))
    wheels.push({ z, x, r, phase, cw: belt || i % 2 === 0, period: (PERIOD * z) / teeth[0], role: i === 0 ? 'drive' : i === teeth.length - 1 ? 'driven' : 'idler' })
  })
  const left = wheels[0].x - ra(wheels[0].z), right = x + ra(teeth[teeth.length - 1])
  const shift = (W - (right - left)) / 2 - left
  wheels.forEach((w) => (w.x += shift))
  return { wheels, m, W, H, cy: H / 2 }
}

const FILL = { drive: 'var(--accent)', idler: 'var(--k-gray)', driven: 'var(--k-blue)' }

function Picture({ teeth, belt, run, label }: { teeth: number[]; belt: boolean; run: boolean; label: string }) {
  const L = useMemo(() => layout(teeth, belt), [teeth.join(','), belt])
  const { wheels, m, W, H, cy } = L
  let beltPath = ''
  if (belt) {
    const [a, b] = wheels, d = b.x - a.x
    const al = Math.acos((a.r - b.r) / d)
    const P = (w: Wheel, s: number) => `${(w.x + w.r * Math.cos(s * al)).toFixed(2)},${(cy + w.r * Math.sin(s * al)).toFixed(2)}`
    beltPath = `M${P(a, -1)}L${P(b, -1)}A${b.r},${b.r} 0 ${2 * al > Math.PI ? 1 : 0} 1 ${P(b, 1)}L${P(a, 1)}A${a.r},${a.r} 0 ${2 * Math.PI - 2 * al > Math.PI ? 1 : 0} 1 ${P(a, -1)}Z`
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={label} class={`gears-svg ${run ? 'run' : ''}`} key={`${teeth.join('-')}-${belt}`}>
      {wheels.map((w) => (
        <g key={w.role + w.x} transform={`translate(${w.x.toFixed(2)} ${cy.toFixed(2)})`}>
          <g class={`gears-spin ${w.cw ? '' : 'ccw'}`} style={{ animationDuration: `${w.period.toFixed(3)}s` }}>
            <g transform={`rotate(${((w.phase * 180) / Math.PI).toFixed(3)})`}>
              <circle r={w.r + m * 1.2 + 4} fill="none" />
              {belt
                ? <>
                    <circle r={w.r} fill={FILL[w.role]} stroke="var(--ink-2)" stroke-width="2" />
                    {[0, 1, 2].map((k) => <line key={k} x1="0" y1="0" x2={(w.r * 0.8 * Math.cos((k * 2 * Math.PI) / 3)).toFixed(2)} y2={(w.r * 0.8 * Math.sin((k * 2 * Math.PI) / 3)).toFixed(2)} stroke="var(--card)" stroke-width="3" />)}
                  </>
                : <path d={gearPath(w.z, m)} fill={FILL[w.role]} stroke="var(--ink-2)" stroke-width="1.2" stroke-linejoin="round" />}
              <circle cx={(w.r * (belt ? 0.8 : 0.72)).toFixed(2)} r={Math.max(2.5, Math.min(6, w.r * 0.12)).toFixed(2)} fill="var(--ink)" />
              <circle r={Math.max(3, w.r * 0.18).toFixed(2)} fill="var(--card)" stroke="var(--ink-2)" stroke-width="1.5" />
            </g>
          </g>
        </g>
      ))}
      {belt && <path d={beltPath} fill="none" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" />}
    </svg>
  )
}

const prefersReduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const turns = (n: number) => `${fmt(n)}×`

function Gears({ z1, z2, idler, n1 = 120, belt = false }: P) {
  const [a, setA] = useState(z1)
  const [b, setB] = useState(z2)
  const [v, setV] = useState<number | null>(belt ? null : idler ?? null)
  const [n, setN] = useState(n1)
  const [run, setRun] = useState(() => !prefersReduced())
  const teeth = v === null ? [a, b] : [a, v, b]
  const i = b / a, n2 = (n * a) / b
  const unit = belt ? 'd' : 'z'
  const what = belt ? 'řemenice' : 'kolo'
  const driven = belt ? 'hnaná řemenice' : 'hnané kolo'
  const kind = i > 1 ? `Převod do pomala: ${driven} se točí pomaleji než hnací (zato silněji).`
    : i < 1 ? `Převod do rychla: ${driven} se točí rychleji než hnací (zato slaběji).`
    : 'Otáčky se nemění (i = 1).'
  const sense = belt ? 'Otevřený řemen: obě řemenice se točí stejným smyslem.'
    : v !== null ? 'Vložené kolo obrátilo smysl: hnací a hnané kolo se točí stejně. Poměr nezměnilo.'
    : 'Sousední kola se točí opačně.'
  const label = `${belt ? 'Řemenový převod' : 'Ozubená kola'}: hnací ${unit}₁ = ${a}${v !== null ? `, vložené ${v}` : ''}, hnané ${unit}₂ = ${b}. ${sense}`
  const arrow = (cw: boolean) => (cw ? '↻ po směru hodin' : '↺ proti směru hodin')
  const max = Math.max(3000, n1)

  return (
    <div class="w gears">
      <Picture teeth={teeth} belt={belt} run={run} label={label} />
      <div class="gears-table" style={{ gridTemplateColumns: `auto repeat(${teeth.length}, 1fr)` }}>
        <span />
        <b class="drive">hnací</b>
        {v !== null && <b class="idler">vložené</b>}
        <b class="driven">hnané</b>
        <span class="gears-rl">{belt ? 'průměr' : 'zuby'}</span>
        <span>{unit}₁ = {a}{belt ? ' cm' : ''}</span>
        {v !== null && <span>{v}</span>}
        <span>{unit}₂ = {b}{belt ? ' cm' : ''}</span>
        <span class="gears-rl">otáčky</span>
        <span>{fmt(n)} min⁻¹</span>
        {v !== null && <span>{fmt((n * a) / v)} min⁻¹</span>}
        <span>{fmt(n2)} min⁻¹</span>
        <span class="gears-rl">smysl</span>
        {teeth.map((_, k) => <span key={k} class="gears-dir">{arrow(belt || k % 2 === 0)}</span>)}
      </div>

      <div aria-live="polite" class="gears-out">
        <div class="val">i = {unit}₂ / {unit}₁ = {b} / {a} = {fmt(i)}</div>
        <div class="sub">n₂ = n₁ · {unit}₁ / {unit}₂ = {fmt(n)} · {a} / {b} = <b>{fmt(n2)} min⁻¹</b></div>
        <div class="sub">Když se hnací {what} otočí 1×, {belt ? 'hnaná' : 'hnané'} se otočí {turns(a / b)}.</div>
        <div class={`gears-kind ${i > 1 ? 'slow' : i < 1 ? 'fast' : ''}`}>{kind}</div>
        <div class="sub">{sense}</div>
      </div>

      <div class="gears-ctrls">
        <Slider name={`${unit}${sub(1)}`} value={a} set={setA} min={6} max={100} />
        <Slider name={`${unit}${sub(2)}`} value={b} set={setB} min={6} max={100} />
        {v !== null && <Slider name="vlož." value={v} set={setV} min={6} max={100} />}
        <Slider name="n₁" value={n} set={setN} min={10} max={max} step={10} />
      </div>
      <div class="ctrls">
        <button class="reveal" aria-pressed={run} onClick={() => setRun(!run)}>{run ? '❚❚ Zastavit' : '▶ Roztočit'}</button>
        {!belt && <button class="reveal" onClick={() => setV(v === null ? Math.max(6, Math.round((a + b) / 4)) : null)}>{v === null ? '+ Vložené kolo' : '− Vložené kolo'}</button>}
      </div>
      <div class="sub gears-note">Animace je zpomalená: hnací {what} se otočí jednou za {PERIOD} s.</div>
    </div>
  )
}

function GearsQuestion({ z1, z2, idler, n1 = 120, belt = false, ask = 'n2' }: P) {
  const teeth = idler !== undefined && !belt ? [z1, idler, z2] : [z1, z2]
  const unit = belt ? 'd' : 'z'
  return (
    <div class="w gears">
      <Picture teeth={teeth} belt={belt} run={false} label={`${belt ? 'Řemenový převod' : 'Ozubená kola'}: ${unit}₁ = ${z1}, ${unit}₂ = ${z2}`} />
      <div class="sub gears-given">
        {unit}₁ = {z1}{belt ? ' cm' : ''}{idler !== undefined && !belt ? `, vložené kolo ${idler} zubů` : ''}, {unit}₂ = {z2}{belt ? ' cm' : ''}{ask === 'n2' ? `, n₁ = ${fmt(n1)} min⁻¹` : ''}
      </div>
    </div>
  )
}

export const gearsAnswer = ({ z1, z2, n1 = 120, ask = 'n2' }: P) => Math.round((ask === 'i' ? z2 / z1 : (n1 * z1) / z2) * 100) / 100
const asNum = (a: string) => Number(a.replace(/\s/g, '').replace(',', '.'))

export default defineWidget({
  name: 'gears',
  title: 'Ozubená kola a převody',
  summary: 'Dvě nebo tři ozubená kola (nebo dvě řemenice) se otáčejí. Dítě posuvníky mění počty zubů a otáčky a vidí převodový poměr i = z₂ / z₁, otáčky hnaného kola, smysl otáčení a jestli jde o převod do pomala, nebo do rychla.',
  use: 'Části strojů a mechanika (ZŠ fyzika, SŠ strojírenství): ozubený a řemenový převod, převodový poměr, otáčky, vložené kolo, jízdní kolo.',
  props,
  examples: [
    { title: 'Převod do pomala 20 : 40', props: { z1: 20, z2: 40, n1: 120 } },
    { title: 'Vložené kolo obrátí smysl', props: { z1: 30, z2: 15, idler: 12, n1: 600 } },
    { title: 'Řemenový převod', props: { z1: 10, z2: 25, n1: 1450, belt: true } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.belt && p.idler !== undefined) e.push('idler is only for gears, not with belt')
    return e
  },
  Component: Gears,
  Question: GearsQuestion,
  checkQuestion: (p, answers) => {
    const want = gearsAnswer(p)
    return answers.some((a) => Math.abs(asNum(a) - want) < 0.006) ? [] : [`the ${p.ask === 'i' ? 'ratio i' : 'speed n2'} ${want} is not among the answers`]
  },
  html: (p) => {
    const u = p.belt ? 'd' : 'z', n1 = p.n1 ?? 120, cm = p.belt ? ' cm' : ''
    return `<p>${p.belt ? 'Řemenový převod' : 'Ozubený převod'}: ${u}₁ = ${p.z1}${cm}, ${u}₂ = ${p.z2}${cm}${p.idler !== undefined && !p.belt ? `, vložené kolo ${p.idler} zubů` : ''}. Převodový poměr i = ${u}₂ / ${u}₁ = ${fmt(p.z2 / p.z1)}; při n₁ = ${n1} min⁻¹ je n₂ = ${fmt((n1 * p.z1) / p.z2)} min⁻¹.</p>`
  },
})
