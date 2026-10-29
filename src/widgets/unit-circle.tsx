import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, gcd } from './kit'

const props = s.object({
  angle: s.int({ min: 0, max: 360, description: 'Úhel α na začátku ve stupních, násobek 5 (posuvník jde po 5°).' }),
  radians: s.optional(s.boolean({ description: 'Začít v obloukové míře (radiány: π/6, π/4…) místo stupňů. Přepnout jde i v pomůcce.' })),
  graph: s.optional(s.boolean({ description: 'Hned ukázat vedle kružnice graf funkce sin (sinusoidu), který se kreslí, jak bod obíhá. Zapnout jde i v pomůcce.' })),
})
type P = Infer<typeof props>

// ——— Values ———

const rad = (a: number) => (a * Math.PI) / 180
/** Reference angle 0–90° and the exact values for it (only for multiples of 30° and 45°). */
const EXACT: Record<number, { sin: string; cos: string; tg?: string }> = {
  0: { sin: '0', cos: '1', tg: '0' },
  30: { sin: '½', cos: '√3/2', tg: '√3/3' },
  45: { sin: '√2/2', cos: '√2/2', tg: '1' },
  60: { sin: '√3/2', cos: '½', tg: '√3' },
  90: { sin: '1', cos: '0' },
}
const refAngle = (a: number) => { const x = a % 180; return x <= 90 ? x : 180 - x }
const sgn = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.sign(x))
const withSign = (s: number, v: string) => (v === '0' || s >= 0 ? v : `−${v}`)
/** Exact sin, cos and tg as text, or undefined when the angle is not a notable one. tg: null = not defined. */
function exact(a: number) {
  const e = EXACT[refAngle(a)]
  if (!e) return undefined
  const sn = sgn(Math.sin(rad(a))), cs = sgn(Math.cos(rad(a)))
  return { sin: withSign(sn, e.sin), cos: withSign(cs, e.cos), tg: e.tg === undefined ? null : withSign(sn * cs, e.tg) }
}
/** 0.86603 → „0,866“, −0.5 → „−0,5“. */
const f3 = (n: number) => String(Math.round(n * 1000) / 1000 + 0).replace('.', ',').replace('-', '−')
/** 150 → „5π/6“, 180 → „π“, 0 → „0“. */
function piText(a: number) {
  if (a === 0) return '0'
  const k = a / 5, g = gcd(k, 36), n = k / g, d = 36 / g
  return `${n === 1 ? '' : n}π${d === 1 ? '' : `/${d}`}`
}
const angleText = (a: number, inRad: boolean) => (inRad ? piText(a) : `${a}°`)
const QUAD = ['I.', 'II.', 'III.', 'IV.']
function quadrant(a: number) {
  if (a % 90 === 0) return null
  return Math.floor((a % 360) / 90)
}

// ——— Widget ———

function UnitCircle({ angle, radians, graph }: P) {
  const [a, setA] = useState(Math.max(0, Math.min(360, Math.round(angle / 5) * 5)))
  const [inRad, setInRad] = useState(!!radians)
  const [g, setG] = useState(!!graph)
  const sn = Math.sin(rad(a)), cs = Math.cos(rad(a))
  const ex = exact(a)
  const q = quadrant(a)
  const tgOk = Math.abs(cs) > 1e-9

  // Circle geometry; the graph (if on) sits to the right on the same scale.
  const R = 82, CX = 112, CY = 106, X0 = 236, GW = 300
  const W = g ? X0 + GW + 16 : 228, H = 214
  const px = CX + R * cs, py = CY - R * sn
  const fs = g ? 1.3 : 1 // text scale: the wide picture with the graph is drawn smaller
  const gx = (deg: number) => X0 + (deg / 360) * GW
  const arcR = 22
  const arc = a === 0 ? '' : a === 360
    ? `M${CX + arcR},${CY} A${arcR},${arcR} 0 1 0 ${CX - arcR},${CY} A${arcR},${arcR} 0 1 0 ${CX + arcR},${CY}`
    : `M${CX + arcR},${CY} A${arcR},${arcR} 0 ${a > 180 ? 1 : 0} 0 ${CX + arcR * cs},${CY - arcR * sn}`
  const sector = q === null ? '' : (() => {
    const a0 = rad(q * 90), a1 = rad(q * 90 + 90)
    return `M${CX},${CY} L${CX + R * Math.cos(a0)},${CY - R * Math.sin(a0)} A${R},${R} 0 0 0 ${CX + R * Math.cos(a1)},${CY - R * Math.sin(a1)} Z`
  })()
  let sine = '', trace = ''
  for (let d = 0; d <= 360; d += 5) {
    const pt = `${gx(d).toFixed(1)},${(CY - R * Math.sin(rad(d))).toFixed(1)}`
    sine += `${d ? 'L' : 'M'}${pt}`
    if (d <= a) trace += `${d ? 'L' : 'M'}${pt}`
  }

  const signs = q === null ? null : { sin: q < 2 ? '+' : '−', cos: q === 0 || q === 3 ? '+' : '−', tg: q === 0 || q === 2 ? '+' : '−' }
  const where = q === null
    ? `Bod leží na ose ${a % 180 === 0 ? 'x' : 'y'}, není v žádném kvadrantu.`
    : `${QUAD[q]} kvadrant: sin ${signs!.sin}, cos ${signs!.cos}, tg ${signs!.tg}`

  const row = (name: string, cls: string, exactV: string | null | undefined, v: number, defined = true) => (
    <div class={`uc-row ${cls}`}>
      <span class="uc-name">{name} α</span>
      <span class="uc-v">
        {!defined ? 'není definován' : exactV !== undefined && exactV !== null
          ? <>{exactV}{/^−?\d$/.test(exactV) ? '' : <small> ≈ {f3(v)}</small>}</>
          : <>≈ {f3(v)}</>}
      </span>
    </div>
  )

  return (
    <div class="w uc">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Jednotková kružnice, α = ${angleText(a, inRad)}, sin α ≈ ${f3(sn)}, cos α ≈ ${f3(cs)}`}>
        {sector && <path d={sector} class="uc-sector" />}
        {[0, 1, 2, 3].map((k) => (
          <text key={k} x={CX + (k === 0 || k === 3 ? 1 : -1) * (R + 6)} y={CY + (k < 2 ? -1 : 1) * (R + 2) + (k < 2 ? 4 : 8)} text-anchor={k === 0 || k === 3 ? 'end' : 'start'} font-size={13 * fs} font-weight="800" class={`uc-q ${q === k ? 'on' : ''}`}>{QUAD[k]}</text>
        ))}
        <line x1={CX - R - 14} x2={CX + R + 14} y1={CY} y2={CY} class="uc-axis" />
        <line x1={CX} x2={CX} y1={CY - R - 14} y2={CY + R + 14} class="uc-axis" />
        <text x={CX + R + 14} y={CY - 6} text-anchor="end" font-size={12 * fs} class="uc-lbl">x</text>
        <text x={CX + 6} y={CY - R - 6} font-size={12 * fs} class="uc-lbl">y</text>
        <text x={CX + R + 3} y={CY + 14} font-size={11 * fs} class="uc-lbl">1</text>
        <text x={CX - R - 3} y={CY + 14} text-anchor="end" font-size={11 * fs} class="uc-lbl">−1</text>
        <circle cx={CX} cy={CY} r={R} class="uc-circle" />
        {arc && <path d={arc} class="uc-arc" />}
        {a > 0 && a < 360 && <text x={CX + 30 * Math.cos(rad(a / 2))} y={CY - 30 * Math.sin(rad(a / 2)) + 4} text-anchor="middle" font-size={12 * fs} font-weight="800" class="uc-arc-t">α</text>}
        <line x1={CX} y1={CY} x2={px} y2={py} class="uc-radius" />
        <line x1={CX} y1={CY} x2={px} y2={CY} class="uc-cos" />
        <line x1={px} y1={CY} x2={px} y2={py} class="uc-sin" />
        {g && <line x1={px} y1={py} x2={gx(a)} y2={py} class="uc-link" />}
        <circle cx={px} cy={py} r="5.5" class="uc-pt" />
        <text x={px + (cs >= 0 ? 8 : -8)} y={py + (sn >= 0 ? -8 : 16)} text-anchor={cs >= 0 ? 'start' : 'end'} font-size={13 * fs} font-weight="900" class="uc-lbl">P</text>
        {Math.abs(cs) > 0.3 && <text x={CX + (R * cs) / 2} y={CY + (sn >= 0 ? 15 : -7)} text-anchor="middle" font-size={11 * fs} font-weight="800" class="uc-cos-t">cos α</text>}
        {Math.abs(sn) > 0.3 && <text x={px + (cs >= 0 ? 6 : -6)} y={CY - (R * sn) / 2 + 4} text-anchor={cs >= 0 ? 'start' : 'end'} font-size={11 * fs} font-weight="800" class="uc-sin-t">sin α</text>}
        {g && (
          <g>
            <line x1={X0} x2={X0 + GW + 10} y1={CY} y2={CY} class="uc-axis" />
            <line x1={X0} x2={X0} y1={CY - R - 8} y2={CY + R + 8} class="uc-axis" />
            {[1, -1].map((v) => <g key={v}><line x1={X0 - 3} x2={X0 + GW} y1={CY - v * R} y2={CY - v * R} class="uc-gridl" /><text x={X0 - 5} y={CY - v * R + 4} text-anchor="end" font-size={11 * fs} class="uc-lbl">{v === 1 ? '1' : '−1'}</text></g>)}
            {[90, 180, 270, 360].map((d) => <g key={d}><line x1={gx(d)} x2={gx(d)} y1={CY - 3} y2={CY + 3} class="uc-axis" /><text x={gx(d)} y={CY + 16} text-anchor="middle" font-size={11 * fs} class="uc-lbl">{angleText(d, inRad)}</text></g>)}
            <path d={sine} class="uc-sine-all" />
            {trace && <path d={trace} class="uc-sine" />}
            <line x1={gx(a)} y1={CY} x2={gx(a)} y2={py} class="uc-sin thin" />
            <circle cx={gx(a)} cy={py} r="4.5" class="uc-pt" />
            <text x={X0 + GW + 10} y={CY - R - 2} text-anchor="end" font-size={12 * fs} font-weight="800" class="uc-sin-t">y = sin x</text>
          </g>
        )}
      </svg>

      <div class="val" aria-live="polite">α = {angleText(a, inRad)}{inRad && a % 180 !== 0 ? <small class="uc-approx"> ≈ {f3(rad(a))} rad</small> : inRad ? ' rad' : ''}</div>
      <div class="uc-vals" aria-live="polite">
        {row('sin', 'sin', ex?.sin, sn)}
        {row('cos', 'cos', ex?.cos, cs)}
        {row('tg', 'tg', ex ? ex.tg : undefined, tgOk ? sn / cs : 0, tgOk)}
      </div>
      <div class="sub">{where}</div>

      <label class="slider">
        <span>α</span>
        <input type="range" min={0} max={360} step={5} value={a} onInput={(e) => setA(Number(e.currentTarget.value))} aria-label="Úhel α" aria-valuetext={inRad ? `${piText(a)} radiánů` : `${a} stupňů`} />
        <output>{angleText(a, inRad)}</output>
      </label>
      <div class="ctrls">
        <div class="step">
          <button onClick={() => setA(Math.max(0, a - 5))} aria-label="Zmenšit úhel o 5°">−</button>
          <span>5°</span>
          <button onClick={() => setA(Math.min(360, a + 5))} aria-label="Zvětšit úhel o 5°">+</button>
        </div>
        <button class={`chip ${!inRad ? 'sel' : ''}`} onClick={() => setInRad(false)} aria-pressed={!inRad}>stupně</button>
        <button class={`chip ${inRad ? 'sel' : ''}`} onClick={() => setInRad(true)} aria-pressed={inRad}>radiány</button>
        <button class={`chip ${g ? 'sel' : ''}`} onClick={() => setG(!g)} aria-pressed={g}>graf sin</button>
      </div>
    </div>
  )
}

const TABLE = [0, 30, 45, 60, 90]

export default defineWidget({
  name: 'unit-circle',
  title: 'Jednotková kružnice',
  summary: 'Bod P na jednotkové kružnici pod úhlem α (posuvník po 5°, stupně nebo radiány). Sin α je svislá a cos α vodorovná úsečka, pod tím hodnoty sin, cos a tg, kvadrant se znaménky a u význačných úhlů přesné hodnoty (½, √2/2, √3/2). Volitelně se vedle kreslí sinusoida.',
  use: 'Goniometrie na SŠ: definice sin a cos na jednotkové kružnici, znaménka v kvadrantech, hodnoty význačných úhlů, oblouková míra, graf funkce sinus a její periodicita.',
  props,
  examples: [
    { title: 'Úhel 30°', props: { angle: 30 } },
    { title: 'II. kvadrant v radiánech', props: { angle: 150, radians: true } },
    { title: 'Kružnice a sinusoida', props: { angle: 225, graph: true } },
  ],
  check: (p) => (p.angle % 5 !== 0 ? ['angle must be a multiple of 5'] : []),
  Component: UnitCircle,
  html: (p) => {
    const e = exact(p.angle), sn = Math.sin(rad(p.angle)), cs = Math.cos(rad(p.angle))
    const v = (ex: string | null | undefined, x: number) => (ex === null ? 'není definován' : ex ?? `≈ ${f3(x)}`)
    return `<p>Jednotková kružnice (poloměr 1): bod P[cos α; sin α]. Pro α = ${p.angle}° (${piText(p.angle)} rad): sin α = ${v(e?.sin, sn)}, cos α = ${v(e?.cos, cs)}, tg α = ${Math.abs(cs) < 1e-9 ? 'není definován' : v(e?.tg, sn / cs)}.</p>`
      + `<table><tr><th>α</th>${TABLE.map((a) => `<td>${a}° (${piText(a)})</td>`).join('')}</tr>`
      + `<tr><th>sin α</th>${TABLE.map((a) => `<td>${EXACT[a].sin}</td>`).join('')}</tr>`
      + `<tr><th>cos α</th>${TABLE.map((a) => `<td>${EXACT[a].cos}</td>`).join('')}</tr>`
      + `<tr><th>tg α</th>${TABLE.map((a) => `<td>${EXACT[a].tg ?? 'není def.'}</td>`).join('')}</tr></table>`
  },
})
