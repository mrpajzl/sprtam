import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

const load = (what: string) => s.object({
  count: s.int({ min: 0, max: 5, description: "Počet závaží (0–5); u síly ruky kolik závaží by vážila." }),
  distance: s.int({ min: 1, max: 6, description: `Na kolikátém háčku od osy otáčení (1 = nejblíž).` }),
}, { description: what })

const props = s.object({
  type: s.optional(s.enum(['two-sided', 'one-sided'], { description: 'Druh páky: "two-sided" dvojzvratná (houpačka, váhy, osa uprostřed – výchozí), "one-sided" jednozvratná (kolečko, louskáček – osa na kraji, břemeno i síla na stejné straně).' })),
  left: load('Vlevo (u jednozvratné páky břemeno, které táhne dolů)'),
  right: s.optional(load('Vpravo (u jednozvratné páky síla ruky, která táhne nahoru; počet = kolik závaží by vážila)')),
  leftArm: s.optional(s.int({ min: 2, max: 6, description: 'Počet háčků na levém rameni (výchozí 5). Jen u dvojzvratné páky; různá délka ramen = nerovnoramenná páka.' })),
  rightArm: s.optional(s.int({ min: 2, max: 6, description: 'Počet háčků na pravém rameni (výchozí 5); u jednozvratné páky délka celé páky.' })),
  mass: s.optional(s.number({ min: 10, max: 1000, description: 'Hmotnost jednoho závaží v gramech (výchozí 100 g ≐ 1 N, počítá se g ≐ 10 N/kg).' })),
  spacing: s.optional(s.number({ min: 1, max: 100, description: 'Vzdálenost sousedních háčků v centimetrech (výchozí 10 cm).' })),
  goal: s.optional(s.boolean({ description: 'Režim „vyrovnej“: levá strana (břemeno) je pevně daná, dítě hledá pravou stranu, aby byla páka v rovnováze.' })),
}, { description: 'Páka na podpěře se závažími; momenty sil M = F · r a podmínka rovnováhy.' })
type P = Infer<typeof props>

/** Up to 3 significant digits. */
const num = (n: number) => (Math.abs(n) >= 10 || n === 0 ? fmt(n) : String(+n.toPrecision(3)).replace('.', ',').replace('-', '−'))
const pieces = (n: number) => `${n} závaží`

function Stepper({ text, less, more, dec, inc, canDec, canInc }: { text: string; less: string; more: string; dec: () => void; inc: () => void; canDec: boolean; canInc: boolean }) {
  return (
    <div class="step lever-step">
      <button onClick={dec} disabled={!canDec} aria-label={less}>−</button>
      <span>{text}</span>
      <button onClick={inc} disabled={!canInc} aria-label={more}>+</button>
    </div>
  )
}

/** A stack of weights hanging from a hook; the group moves with the lever, the weights stay vertical. */
function Stack({ x, y, count, color, label }: { x: number; y: number; count: number; color: string; label: string }) {
  return (
    <g class="lever-move" style={{ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` }}>
      {count > 0 && <line x1="0" y1="0" x2="0" y2="12" stroke="var(--ink-2)" stroke-width="2" />}
      {Array.from({ length: count }, (_, i) => (
        <rect key={i} x="-10" y={12 + i * 13} width="20" height="12" rx="3" style={{ fill: color }} stroke="var(--ink)" stroke-width="1.5" />
      ))}
      {count > 0 && <text x="0" y={12 + count * 13 + 13} text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink-2)">{label}</text>}
    </g>
  )
}

/** Upward pull of the hand (one-sided lever): arrow length grows with the force. */
function Pull({ x, y, count, label }: { x: number; y: number; count: number; label: string }) {
  const h = 14 + count * 10
  return (
    <g class="lever-move" style={{ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` }}>
      {count > 0 && (
        <g>
          <line x1="0" y1="-3" x2="0" y2={-h + 8} stroke="var(--k-orange)" stroke-width="4" stroke-linecap="round" />
          <path d={`M-7 ${-h + 10} L0 ${-h} L7 ${-h + 10} Z`} fill="var(--k-orange)" />
          <text x="0" y={-h - 6} text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink-2)">{label}</text>
        </g>
      )}
    </g>
  )
}

function Lever(p: P) {
  const one = p.type === 'one-sided'
  const armL = one ? 0 : p.leftArm ?? 5, armR = p.rightArm ?? 5
  const [L, setL] = useState(p.left)
  const [R, setR] = useState(p.right ?? { count: p.goal ? 1 : 0, distance: 1 })
  const N = ((p.mass ?? 100) / 1000) * 10 // one weight in newtons
  const cm = p.spacing ?? 10
  const mL = L.count * L.distance, mR = R.count * R.distance // moments in "weight × hook" units: exact comparison
  const F1 = L.count * N, F2 = R.count * N, r1 = (L.distance * cm) / 100, r2 = (R.distance * cm) / 100
  const M1 = F1 * r1, M2 = F2 * r2
  const max = one ? 7 : 14
  const tilt = mL === mR ? 0 : (max * (one ? mL - mR : mR - mL)) / Math.max(mL, mR)

  // Geometry
  const px = one ? 46 : 170, py = one ? 130 : 92, u = one ? Math.min(48, 260 / armR) : Math.min(28, 140 / Math.max(armL, armR))
  const rad = (tilt * Math.PI) / 180
  const at = (d: number) => [px + d * u * Math.cos(rad), py + d * u * Math.sin(rad)] as const // d = signed hook number
  const [lx, ly] = at(one ? L.distance : -L.distance), [rx, ry] = at(R.distance)
  const H = one ? 262 : 232
  const balanced = mL === mR && mL > 0
  const names = one ? ['břemeno', 'síla ruky'] : ['vlevo', 'vpravo']
  const verdict = balanced ? 'Rovnováha ✓' : mL === 0 && mR === 0 ? 'Pověs závaží' : one
    ? mL > mR ? 'Břemeno převažuje' : 'Ruka páku zvedá'
    : mL > mR ? 'Převažuje levá strana' : 'Převažuje pravá strana'
  const result = balanced ? 'M₁ = M₂, páka je v rovnováze.' : one
    ? (mL > mR ? 'M₁ > M₂, konec páky klesá.' : mL < mR ? 'M₁ < M₂, konec páky stoupá.' : '')
    : (mL > mR ? 'M₁ > M₂, levá strana klesá.' : mL < mR ? 'M₁ < M₂, pravá strana klesá.' : '')

  const side = (k: 0 | 1) => {
    const v = k === 0 ? L : R, set = k === 0 ? setL : setR, arm = k === 0 ? (one ? armR : armL) : armR, where = names[k]
    const isPull = one && k === 1
    return (
      <div class="lever-side">
        <div class="lever-head">{one ? (k === 0 ? 'Břemeno' : 'Síla ruky') : k === 0 ? 'Vlevo' : 'Vpravo'}</div>
        <Stepper text={isPull ? `${num(v.count * N)} N` : pieces(v.count)} less={isPull ? 'Zmenšit sílu ruky' : `Ubrat závaží ${where}`} more={isPull ? 'Zvětšit sílu ruky' : `Přidat závaží ${where}`}
          canDec={v.count > 0} canInc={v.count < 5} dec={() => set({ ...v, count: v.count - 1 })} inc={() => set({ ...v, count: v.count + 1 })} />
        <Stepper text={`${v.distance}. háček`} less={`Blíž k ose (${where})`} more={`Dál od osy (${where})`}
          canDec={v.distance > 1} canInc={v.distance < arm} dec={() => set({ ...v, distance: v.distance - 1 })} inc={() => set({ ...v, distance: v.distance + 1 })} />
      </div>
    )
  }

  const x0 = one ? -0.35 : -armL - 0.35, x1 = armR + 0.35
  return (
    <div class="w lever">
      <svg viewBox={one ? `0 0 340 ${H}` : `0 34 340 ${H - 40}`} width="340" role="img" aria-label={`Páka: ${names[0]} ${L.count} závaží na ${L.distance}. háčku, ${names[1]} ${R.count} ${one ? 'N' : 'závaží'} na ${R.distance}. háčku. ${verdict}.`}>
        {/* support and ground */}
        <path d={`M${px} ${py} L${px - 16} ${py + 34} L${px + 16} ${py + 34} Z`} fill="var(--ink-3)" />
        <line x1={px - 28} x2={px + 28} y1={py + 35} y2={py + 35} stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
        {/* the bar with hooks and their numbers */}
        <g class="lever-move" style={{ transform: `rotate(${tilt.toFixed(2)}deg)`, transformOrigin: `${px}px ${py}px` }}>
          <rect x={px + x0 * u} y={py - 5} width={(x1 - x0) * u} height="10" rx="5" fill="var(--accent-soft)" stroke="var(--accent-ink)" stroke-width="2" />
          {Array.from({ length: armL + armR }, (_, i) => {
            const d = i < armL ? -(armL - i) : i - armL + 1
            return (
              <g key={d}>
                <circle cx={px + d * u} cy={py} r="2.5" fill="var(--accent-ink)" />
                <text x={px + d * u} y={py - 9} text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink-3)">{Math.abs(d)}</text>
              </g>
            )
          })}
        </g>
        <circle cx={px} cy={py} r="5" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5" />
        <Stack x={lx} y={ly} count={L.count} color="var(--k-blue)" label={`F₁ = ${num(F1)} N`} />
        {one
          ? <Pull x={rx} y={ry} count={R.count} label={`F₂ = ${num(F2)} N`} />
          : <Stack x={rx} y={ry} count={R.count} color="var(--k-orange)" label={`F₂ = ${num(F2)} N`} />}
      </svg>
      <div class={`val${balanced ? ' lever-ok' : ''}`} aria-live="polite">{verdict}</div>
      <div class="sub lever-calc">
        <div><b class="lever-l">M₁</b> = F₁ · r₁ = {num(F1)} N · {num(r1)} m = <b>{num(M1)} N·m</b></div>
        <div><b class="lever-r">M₂</b> = F₂ · r₂ = {num(F2)} N · {num(r2)} m = <b>{num(M2)} N·m</b></div>
        <div>{result || "Na páce nic nevisí."}</div>
      </div>
      {p.goal && !balanced && <div class="sub lever-goal">{one ? 'Najdi sílu ruky a místo, kde páku zvednout, aby byla v rovnováze.' : 'Najdi, kolik závaží a kam pověsit vpravo, aby byla páka v rovnováze.'}</div>}
      <div class={`lever-ctrls${p.goal ? ' only' : ''}`}>
        {!p.goal && side(0)}
        {side(1)}
      </div>
      <div class="sub lever-note">1 závaží = {num(p.mass ?? 100)} g ≐ {num(N)} N · háčky po {num(cm)} cm{one ? ' · osa otáčení je na kraji' : ''}</div>
    </div>
  )
}

export default defineWidget({
  name: 'lever',
  title: 'Páka a momenty sil',
  summary: 'Páka na podpěře se závažími. Dítě tlačítky přidává závaží a posouvá je po háčcích, páka se nakloní podle momentů M = F · r; pod ní je výpočet obou momentů a podmínka rovnováhy. Režim „vyrovnej“: levá strana je daná, dítě hledá pravou. Umí i jednozvratnou páku (kolečko) se silou ruky nahoru.',
  use: 'Fyzika 7. třída a mechanika SŠ: páka, moment síly, rovnováha na páce, rovnoramenná a nerovnoramenná páka, jednozvratná páka (kolečko, louskáček).',
  props,
  examples: [
    { title: 'Houpačka: vyrovnej páku', props: { left: { count: 3, distance: 4 }, goal: true } },
    { title: 'Nerovnoramenná páka', props: { left: { count: 4, distance: 2 }, right: { count: 1, distance: 3 }, leftArm: 3, rightArm: 6, mass: 200, spacing: 5 } },
    { title: 'Kolečko (jednozvratná páka)', props: { type: 'one-sided', left: { count: 5, distance: 2 }, right: { count: 1, distance: 5 }, goal: true } },
  ],
  check: (p) => {
    const e: string[] = []
    const one = p.type === 'one-sided'
    const armL = p.leftArm ?? 5, armR = p.rightArm ?? 5
    if (one && p.leftArm !== undefined) e.push('leftArm is only for a two-sided lever (one-sided uses rightArm)')
    if (p.left.distance > (one ? armR : armL)) e.push('left.distance is beyond the arm')
    if (p.right && p.right.distance > armR) e.push('right.distance is beyond the right arm')
    if (p.goal) {
      const m = p.left.count * p.left.distance
      if (m === 0) e.push('goal needs left.count ≥ 1')
      let ok = false
      for (let c = 1; c <= 5; c++) for (let d = 1; d <= armR; d++) if (c * d === m) ok = true
      if (m > 0 && !ok) e.push('goal cannot be balanced: no right count 1–5 × hook within rightArm gives the same moment')
      if (p.right && p.right.count * p.right.distance === m) e.push('in goal mode the right side must not already balance')
    }
    return e
  },
  Component: Lever,
})
