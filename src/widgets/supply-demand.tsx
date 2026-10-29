import { useId, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

// Linear demand P = a − b · (Q − dD) and supply P = c + d · (Q − dS) on axes Q (quantity, x) and P (price, y),
// both 0…10. dD and dS shift the lines sideways (right = more demanded/supplied at every price).
// Equilibrium: Q* = (a − c + b · dD + d · dS) / (b + d), P* from either line.

const SHIFT = 3

const props = s.object({
  demand: s.tuple([
    s.number({ min: 1, max: 10, description: 'Cena, při které už nikdo nekupuje (průsečík s osou P).' }),
    s.number({ min: 0.1, max: 5, description: 'O kolik klesne cena s každou další jednotkou množství (sklon).' }),
  ], { description: 'Poptávka D: [a, b], přímka P = a − b · Q.' }),
  supply: s.tuple([
    s.number({ min: 0, max: 9, description: 'Nejnižší cena, za kterou někdo začne prodávat (průsečík s osou P).' }),
    s.number({ min: 0.1, max: 5, description: 'O kolik roste cena s každou další jednotkou množství (sklon).' }),
  ], { description: 'Nabídka S: [c, d], přímka P = c + d · Q.' }),
  good: s.optional(s.string({ description: 'Jaké zboží, např. „jahody“. Ukáže se v nadpisu grafu.' })),
  units: s.optional(s.tuple([s.string(), s.string()], { description: 'Jednotky [množství, cena], např. ["t", "tis. Kč/t"]. Bez nich jsou osy jen Q a P.' })),
  scenarios: s.optional(s.array(s.object({
    label: s.string({ description: 'Co se stalo, např. „Lidem roste příjem“.' }),
    curve: s.enum(['D', 'S'], { description: 'Která křivka se posune: D poptávka, S nabídka.' }),
    shift: s.number({ min: -SHIFT, max: SHIFT, description: 'Posun doprava (+, víc) nebo doleva (−, míň), v jednotkách množství.' }),
  }), { min: 1, max: 6, description: 'Tlačítka se scénáři. Bez nich se ukážou čtyři běžné (příjem, móda, suroviny, technologie).' })),
  mode: s.optional(s.enum(['shift', 'price'], { description: 'shift = posouvání křivek (výchozí), price = pevná cena nad nebo pod rovnováhou, ukáže přebytek nebo nedostatek.' })),
  price: s.optional(s.number({ min: 0, max: 10, description: 'Jen v režimu price: počáteční pevná cena.' })),
  ask: s.optional(s.enum(['price', 'quantity'], { description: 'Jen pro otázku: ptá se na rovnovážnou cenu (výchozí) nebo množství.' })),
})
type P = Infer<typeof props>

const DEFAULT_SCENARIOS: NonNullable<P['scenarios']> = [
  { label: 'Lidem roste příjem', curve: 'D', shift: 2 },
  { label: 'Zboží vyšlo z módy', curve: 'D', shift: -2 },
  { label: 'Zdražily suroviny', curve: 'S', shift: -2 },
  { label: 'Nová levnější technologie', curve: 'S', shift: 2 },
]

const eq = (p: P, dD: number, dS: number) => {
  const [a, b] = p.demand, [c, d] = p.supply
  const Q = (a - c + b * dD + d * dS) / (b + d)
  return { Q, P: a - b * (Q - dD) }
}
const r2 = (x: number) => Math.round(x * 100) / 100

// Chart geometry: plot area 0…10 × 0…10.
const W = 300, H = 282, L = 34, T = 26, R = 14, B = 34, S = (W - L - R) / 10, SY = (H - T - B) / 10
const X = (q: number) => L + q * S, Y = (p: number) => H - B - p * SY

function SupplyDemand(p: P) {
  const [a, b] = p.demand, [c, d] = p.supply
  const [dD, setDD] = useState(0)
  const [dS, setDS] = useState(0)
  const [mode, setMode] = useState(p.mode ?? 'shift')
  const e0 = eq(p, 0, 0)
  const [price, setPrice] = useState(p.price ?? Math.min(10, r2(e0.P + 2)))
  const clip = `sd${useId()}`
  const [said, setSaid] = useState<string | null>(null)
  const e = eq(p, dD, dS)
  const scen = p.scenarios ?? DEFAULT_SCENARIOS
  const [uq, up] = p.units ?? ['', '']
  // Line through the plot for P = p0 + k · (Q − dq), clipped to 0…10 by the clipPath.
  const line = (p0: number, k: number, dq: number) => `M${X(0)},${Y(p0 - k * dq)} L${X(10)},${Y(p0 + k * (10 - dq))}`
  const shifted = dD !== 0 || dS !== 0
  const clamp = (q: number) => Math.min(9.3, Math.max(0.3, q))
  const dLab = clamp((a - 1) / b + dD), sLab = clamp((9 - c) / d + dS)
  // Price mode: quantities at the fixed price.
  const qd = Math.max(0, (a - price) / b + dD), qs = Math.max(0, (price - c) / d + dS)
  const gapKind = Math.abs(qs - qd) < 0.05 ? 'eq' : qs > qd ? 'surplus' : 'shortage'
  const inPlot = e.Q >= 0 && e.Q <= 10 && e.P >= 0 && e.P <= 10
  const reset = () => { setDD(0); setDS(0); setSaid(null) }
  const status = mode === 'price'
    ? gapKind === 'eq' ? `Cena ${fmt(price)} je rovnovážná: kolik se nabízí, tolik se koupí.`
      : gapKind === 'surplus' ? `Cena je nad rovnováhou: přebytek ${fmt(r2(qs - qd))}${uq ? ` ${uq}` : ''}. Nabízí se ${fmt(r2(qs))}, kupuje jen ${fmt(r2(qd))}.`
      : `Cena je pod rovnováhou: nedostatek ${fmt(r2(qd - qs))}${uq ? ` ${uq}` : ''}. Chtějí ${fmt(r2(qd))}, nabízí se jen ${fmt(r2(qs))}.`
    : inPlot ? '' : 'Rovnováha je mimo graf.'
  return (
    <div class="w sd">
      <div class="chips sd-chips" role="group" aria-label="Režim">
        <button class={`chip ${mode === 'shift' ? 'sel' : ''}`} aria-pressed={mode === 'shift'} onClick={() => setMode('shift')}>Posun křivek</button>
        <button class={`chip ${mode === 'price' ? 'sel' : ''}`} aria-pressed={mode === 'price'} onClick={() => setMode('price')}>Pevná cena</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Graf nabídky a poptávky${p.good ? `: ${p.good}` : ''}. Rovnováha: cena ${fmt(r2(e.P))}, množství ${fmt(r2(e.Q))}.`}>
        <defs><clipPath id={clip}><rect x={L} y={T} width={10 * S} height={10 * SY} /></clipPath></defs>
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={X(i)} x2={X(i)} y1={Y(0)} y2={Y(10)} stroke="var(--line)" />
            <line x1={X(0)} x2={X(10)} y1={Y(i)} y2={Y(i)} stroke="var(--line)" />
            {i % 2 === 0 && <text x={X(i)} y={Y(0) + 14} text-anchor="middle" font-size="10" fill="var(--ink-3)">{i}</text>}
            {i % 2 === 0 && <text x={X(0) - 6} y={Y(i) + 3.5} text-anchor="end" font-size="10" fill="var(--ink-3)">{i}</text>}
          </g>
        ))}
        <line x1={X(0)} x2={X(10)} y1={Y(0)} y2={Y(0)} stroke="var(--ink-2)" stroke-width="2" />
        <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(10)} stroke="var(--ink-2)" stroke-width="2" />
        <text x={X(10)} y={H - 4} text-anchor="end" font-size="12" font-weight="800" fill="var(--ink-2)">Q {uq && `(${uq})`} množství</text>
        <text x={4} y={12} font-size="12" font-weight="800" fill="var(--ink-2)">P {up && `(${up})`} cena</text>
        <g clip-path={`url(#${clip})`}>
          {shifted && dD !== 0 && <path d={line(a, -b, 0)} class="sd-ghost sd-d" />}
          {shifted && dS !== 0 && <path d={line(c, d, 0)} class="sd-ghost sd-s" />}
          {mode === 'price' && gapKind !== 'eq' && (
            <rect x={X(Math.min(qd, qs))} y={Y(price) - 7} width={Math.abs(qs - qd) * S} height={14} rx="4" class={`sd-gap sd-${gapKind}`} />
          )}
          <path d={line(a, -b, dD)} class="sd-line sd-d" />
          <path d={line(c, d, dS)} class="sd-line sd-s" />
          {mode === 'price' && <line x1={X(0)} x2={X(10)} y1={Y(price)} y2={Y(price)} class="sd-price" />}
          {mode === 'shift' && inPlot && <>
            <line x1={X(0)} x2={X(e.Q)} y1={Y(e.P)} y2={Y(e.P)} class="sd-guide" />
            <line x1={X(e.Q)} x2={X(e.Q)} y1={Y(0)} y2={Y(e.P)} class="sd-guide" />
          </>}
          {shifted && mode === 'shift' && <circle cx={X(e0.Q)} cy={Y(e0.P)} r="4" class="sd-old" />}
          {inPlot && <circle cx={X(e.Q)} cy={Y(e.P)} r="6" class="sd-eq" />}
        </g>
        <text x={X(dLab) + 6} y={Y(a - b * (dLab - dD)) + 4} class="sd-tag sd-d-t">D</text>
        <text x={X(sLab) + 6} y={Y(c + d * (sLab - dS)) + 4} class="sd-tag sd-s-t">S</text>
        {mode === 'shift' && inPlot && <>
          <text x={X(0) + 3} y={Y(e.P) - 4} class="sd-eqt">P* = {fmt(r2(e.P))}</text>
          <text x={X(e.Q) + 4} y={Y(0) - 5} class="sd-eqt">Q* = {fmt(r2(e.Q))}</text>
        </>}
      </svg>
      {mode === 'shift'
        ? <>
          <div class="val" aria-live="polite">{inPlot ? `P* = ${fmt(r2(e.P))}${up ? ` ${up}` : ''}, Q* = ${fmt(r2(e.Q))}${uq ? ` ${uq}` : ''}` : status}</div>
          {inPlot && <div class="sub">{!shifted ? 'Rovnováha: tady se křivky protínají.' : <>Cena {e.P > e0.P + 0.005 ? 'stoupla' : e.P < e0.P - 0.005 ? 'klesla' : 'se nezměnila'}, množství {e.Q > e0.Q + 0.005 ? 'stouplo' : e.Q < e0.Q - 0.005 ? 'kleslo' : 'se nezměnilo'}.{said ? ` (${said})` : ''}</>}</div>}
          <div class="chips sd-chips" role="group" aria-label="Scénáře">
            {scen.map((x) => (
              <button key={x.label} class={`chip ${said === x.label ? 'sel' : ''}`} aria-pressed={said === x.label} onClick={() => { setDD(x.curve === 'D' ? x.shift : 0); setDS(x.curve === 'S' ? x.shift : 0); setSaid(x.label) }}>
                {x.label} <small class={x.curve === 'D' ? 'sd-d-t' : 'sd-s-t'}>{x.curve} {x.shift > 0 ? '→' : '←'}</small>
              </button>
            ))}
          </div>
          <Shift name="Poptávka D" cls="sd-d-t" value={dD} set={(v) => { setDD(v); setSaid(null) }} />
          <Shift name="Nabídka S" cls="sd-s-t" value={dS} set={(v) => { setDS(v); setSaid(null) }} />
          {shifted && <div class="ctrls"><button class="reveal" onClick={reset}>Vrátit křivky</button></div>}
        </>
        : <>
          <div class={`val sd-${gapKind}-t`} aria-live="polite">{gapKind === 'eq' ? 'Rovnováha' : gapKind === 'surplus' ? `Přebytek ${fmt(r2(qs - qd))}${uq ? ` ${uq}` : ''}` : `Nedostatek ${fmt(r2(qd - qs))}${uq ? ` ${uq}` : ''}`}</div>
          <div class="sub">{status}</div>
          <label class="sd-sl">
            <span>Cena</span>
            <input type="range" min={0} max={10} step={0.1} value={price} aria-valuetext={`cena ${fmt(price)}`} onInput={(ev) => setPrice(Number(ev.currentTarget.value))} />
            <output>{fmt(price)}</output>
          </label>
          <div class="sd-note">Nad rovnováhou (např. minimální cena) zboží zbývá, pod ní (cenový strop) se nedostává.</div>
        </>}
    </div>
  )
}

function Shift({ name, cls, value, set }: { name: string; cls: string; value: number; set: (n: number) => void }) {
  const txt = value === 0 ? 'beze změny' : value > 0 ? `+${fmt(value)} doprava` : `${fmt(value)} doleva`
  return (
    <label class="sd-sl">
      <span class={cls}>{name}</span>
      <input type="range" min={-SHIFT} max={SHIFT} step={0.5} value={value} aria-valuetext={`${name}: ${txt}`} onInput={(ev) => set(Number(ev.currentTarget.value))} />
      <output>{value > 0 ? `+${fmt(value)}` : fmt(value)}</output>
    </label>
  )
}

const eqText = (p: P) => `Poptávka: P = ${fmt(p.demand[0])} − ${fmt(p.demand[1])} · Q. Nabídka: P = ${fmt(p.supply[0])} + ${fmt(p.supply[1])} · Q.`

export default defineWidget({
  name: 'supply-demand',
  title: 'Nabídka a poptávka',
  summary: 'Graf s klesající poptávkou D a rostoucí nabídkou S. Průsečík je rovnovážná cena a množství. Scénáře a posuvníky posouvají křivky a rovnováha se posune. V režimu pevné ceny je vidět přebytek nebo nedostatek.',
  use: 'Ekonomika (SŠ, OA) a základy tržního hospodářství na ZŠ: trh, nabídka, poptávka, tržní rovnováha, posun křivek, cenová regulace (minimální cena, cenový strop).',
  props,
  examples: [
    { title: 'Trh s jahodami', props: { demand: [9, 0.8], supply: [1, 0.8], good: 'jahody', units: ['t', 'tis. Kč/t'] } },
    { title: 'Minimální cena nad rovnováhou', props: { demand: [9, 1], supply: [2, 0.75], mode: 'price', price: 7 } },
    { title: 'Vlastní scénáře: kávové boby', props: { demand: [8, 0.6], supply: [2, 0.9], good: 'káva', scenarios: [{ label: 'Neúroda v Brazílii', curve: 'S', shift: -2.5 }, { label: 'Káva je v módě', curve: 'D', shift: 2 }, { label: 'Vědci: káva škodí', curve: 'D', shift: -1.5 }] } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.demand[0] <= p.supply[0]) e.push('demand must start above supply (demand[0] > supply[0]), otherwise there is no equilibrium')
    for (const dD of [-SHIFT, 0, SHIFT]) for (const dS of [-SHIFT, 0, SHIFT]) {
      const x = eq(p, dD, dS)
      if (!(x.Q >= 0 && x.Q <= 10 && x.P >= 0 && x.P <= 10)) { e.push(`shifting the lines by ±${SHIFT} moves the equilibrium off the 0–10 chart (D ${dD}, S ${dS}: Q ${r2(x.Q)}, P ${r2(x.P)})`); return e }
    }
    if (p.price !== undefined && p.mode !== 'price') e.push('price only applies to mode "price"')
    if (p.scenarios && new Set(p.scenarios.map((x) => x.label)).size !== p.scenarios.length) e.push('scenario labels must be unique')
    if (p.scenarios?.some((x) => x.shift === 0)) e.push('a scenario must shift the line (shift ≠ 0)')
    return e
  },
  Component: SupplyDemand,
  Question: (p) => <div class="w"><div class="sd-task">{eqText(p)}</div>{p.good && <div class="sub">Zboží: {p.good}</div>}</div>,
  checkQuestion: (p, answers) => {
    const x = eq(p, 0, 0), want = p.ask === 'quantity' ? x.Q : x.P
    const parse = (v: string) => Number(v.replace(/\s/g, '').replace(',', '.').replace('−', '-'))
    return answers.some((v) => Math.abs(parse(v) - want) < 0.006) ? [] : [`the equilibrium ${p.ask === 'quantity' ? 'quantity' : 'price'} ${r2(want)} is not among the answers`]
  },
  html: (p, inline) => {
    const x = eq(p, 0, 0)
    return `<p>${p.good ? `Trh: ${inline(p.good)}. ` : ''}${eqText(p)} Rovnováha je v průsečíku: P* = ${fmt(r2(x.P))}, Q* = ${fmt(r2(x.Q))}.</p>`
  },
})
