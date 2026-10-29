import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, gcd } from './kit'

const props = s.object({
  mode: s.enum(['coin', 'die', 'two-dice'], { description: 'Pokus: coin = hod mincí (výsledek 1 = panna, 2 = orel), die = hod jednou kostkou (1–6), two-dice = hod dvěma kostkami, sleduje se součet (2–12).' }),
  event: s.optional(s.object({
    label: s.string({ description: 'Jev slovy, jak ho dítě uvidí, např. „padne 6“, „sudé číslo“, „součet 7“.' }),
    outcomes: s.array(s.int({ min: 1, max: 12 }), { min: 1, max: 11, description: 'Výsledky, které jev tvoří: u mince 1 = panna, 2 = orel; u kostky čísla 1–6; u dvou kostek součty 2–12. Např. sudé číslo = [2, 4, 6].' }),
  }, { description: 'Zvýrazněný jev (nepovinné): jeho sloupce se obarví a ukáže se jeho pravděpodobnost i to, jak se k ní blíží relativní četnost.' })),
})
type P = Infer<typeof props>
type Mode = P['mode']

const MAX = 10000 // throws; keeps the history small

/** Outcomes of the experiment and how many equally likely cases give each one. */
function space(mode: Mode) {
  if (mode === 'coin') return { outs: [1, 2], ways: [1, 1], all: 2 }
  if (mode === 'die') return { outs: [1, 2, 3, 4, 5, 6], ways: [1, 1, 1, 1, 1, 1], all: 6 }
  const outs = Array.from({ length: 11 }, (_, i) => i + 2)
  return { outs, ways: outs.map((o) => 6 - Math.abs(o - 7)), all: 36 }
}
const outName = (mode: Mode, o: number) => (mode === 'coin' ? (o === 1 ? 'panna' : 'orel') : String(o))
const what = (mode: Mode) => (mode === 'coin' ? 'hod mincí' : mode === 'die' ? 'hod kostkou' : 'hod dvěma kostkami (součet)')

/** 1/6 → „1/6“, 6/36 → „6/36 = 1/6“. */
function frac(k: number, n: number) {
  const g = gcd(k, n) || 1
  return g > 1 ? `${k}/${n} = ${k / g}/${n / g}` : `${k}/${n}`
}
/** 0.1667 → „≈ 16,7 %“, 0.5 → „= 50 %“ (to follow a fraction). */
function pct(x: number) {
  const r = Math.round(x * 1000) / 10
  return `${Math.abs(r - x * 100) > 1e-9 ? '≈' : '='} ${String(r).replace('.', ',')} %`
}
function eventWays(mode: Mode, outcomes: number[]) {
  const sp = space(mode)
  return sp.outs.reduce((a, o, i) => a + (outcomes.includes(o) ? sp.ways[i] : 0), 0)
}

// ——— Pictures ———

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
}
function Face({ mode, v, size = 48 }: { mode: Mode; v: number; size?: number }) {
  if (mode === 'coin') {
    return (
      <svg viewBox="0 0 48 48" width={size} aria-hidden="true">
        <circle cx="24" cy="24" r="21" class="dice-coin" />
        <circle cx="24" cy="24" r="16" fill="none" class="dice-coin-rim" />
        <text x="24" y="30" text-anchor="middle" font-size="17" font-weight="900" class="dice-coin-t">{v === 1 ? 'P' : 'O'}</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" width={size} aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="9" class="dice-face" />
      {PIPS[v].map(([x, y], i) => <circle key={i} cx={12 + x * 12} cy={12 + y * 12} r="4.2" class="dice-pip" />)}
    </svg>
  )
}

// ——— Widget ———

interface State { counts: number[]; total: number; hits: number; last: number[]; hist: number[] }
const empty = (n: number): State => ({ counts: Array(n).fill(0), total: 0, hits: 0, last: [], hist: [] })

function Dice({ mode, event }: P) {
  const sp = space(mode)
  const [st, setSt] = useState<State>(() => empty(sp.outs.length))
  const inEvent = (o: number) => !!event?.outcomes.includes(o)

  const roll = (k: number) => {
    const counts = st.counts.slice(), hist = st.hist.slice()
    let { total, hits } = st, last = st.last
    const n = Math.min(k, MAX - total)
    for (let i = 0; i < n; i++) {
      const faces = mode === 'coin' ? [1 + Math.floor(Math.random() * 2)] : mode === 'die' ? [1 + Math.floor(Math.random() * 6)] : [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]
      const o = faces.reduce((a, b) => a + b, 0)
      counts[o - sp.outs[0]]++
      total++
      if (inEvent(o)) hits++
      if (event) hist.push(hits / total)
      last = faces
    }
    setSt({ counts, total, hits, last, hist })
  }

  // Chart: relative frequency (bars) against theoretical probability (dashed marks).
  const W = 320, L = 34, T = 16, PH = 130, B = 24, H = T + PH + B
  const n = sp.outs.length, slot = (W - L - 4) / n, bw = Math.min(slot * 0.68, 56)
  const theory = sp.ways.map((w) => w / sp.all)
  const rel = st.counts.map((c) => (st.total ? c / st.total : 0))
  const need = Math.max(...rel, Math.max(...theory) * 1.35)
  const yMax = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1].find((m) => m >= need - 1e-9) ?? 1
  const Y = (v: number) => T + PH - (v / yMax) * PH
  const res = st.total === 0 ? 'Zatím nic nepadlo.'
    : mode === 'coin' ? (st.last[0] === 1 ? 'Padla panna.' : 'Padl orel.')
    : mode === 'die' ? `Padlo ${st.last[0]}.`
    : `Padlo ${st.last[0]} a ${st.last[1]}, součet ${st.last[0] + st.last[1]}.`

  const ew = event ? eventWays(mode, event.outcomes) : 0
  const pE = ew / sp.all

  // History of the event's relative frequency (downsampled to ≤ 160 points).
  let hPath = ''
  const HW = 320, HH = 70, HL = 34
  if (event && st.hist.length) {
    const len = st.hist.length, stepH = Math.max(1, Math.ceil(len / 160))
    const hx = (i: number) => HL + (len === 1 ? 0 : (i / (len - 1)) * (HW - HL - 4))
    const hy = (v: number) => 6 + (1 - v) * (HH - 12)
    for (let i = 0; i < len; i += stepH) hPath += `${i ? 'L' : 'M'}${hx(i).toFixed(1)},${hy(st.hist[i]).toFixed(1)}`
    hPath += `L${hx(len - 1).toFixed(1)},${hy(st.hist[len - 1]).toFixed(1)}`
  }

  return (
    <div class="w dice">
      <div class="dice-last" aria-hidden="true">
        {(st.total ? st.last : mode === 'coin' ? [1] : mode === 'die' ? [6] : [6, 6]).map((v, i) => <Face key={i} mode={mode} v={v} />)}
      </div>
      <div class="val" aria-live="polite">{res}</div>
      <div class="sub">Hodů: {st.total.toLocaleString('cs-CZ')}</div>
      <div class="ctrls">
        {[1, 10, 100].map((k) => (
          <button key={k} class="reveal" disabled={st.total >= MAX} onClick={() => roll(k)} aria-label={`Hodit ${k}×`}>Hoď {k}×</button>
        ))}
        <button class="reveal dice-reset" disabled={st.total === 0} onClick={() => setSt(empty(n))} aria-label="Znovu, vynulovat hody">Znovu</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Četnosti: ${sp.outs.map((o, i) => `${outName(mode, o)} ${st.counts[i]}×`).join(', ')}`}>
        {[0, yMax / 2, yMax].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - 2} y1={Y(v)} y2={Y(v)} class="dice-grid" />
            <text x={L - 4} y={Y(v) + 4} text-anchor="end" font-size="10" class="dice-axis">{String(Math.round(v * 1000) / 10).replace('.', ',')} %</text>
          </g>
        ))}
        {sp.outs.map((o, i) => {
          const x = L + i * slot + (slot - bw) / 2, cx = x + bw / 2
          return (
            <g key={o}>
              <rect x={x} y={T} width={bw} height={PH} rx="3" class={`dice-bar ${!event || inEvent(o) ? 'on' : ''}`} style={{ transform: `scaleY(${rel[i] / yMax})` }} />
              <line x1={x - 3} x2={x + bw + 3} y1={Y(theory[i])} y2={Y(theory[i])} class="dice-th" />
              {st.counts[i] > 0 && <text x={cx} y={Math.max(T - 3, Y(rel[i]) - 4)} text-anchor="middle" font-size="9.5" class="dice-cnt">{st.counts[i]}</text>}
              <text x={cx} y={T + PH + 16} text-anchor="middle" font-size="12" font-weight="800" class={`dice-out ${event && inEvent(o) ? 'on' : ''}`}>{outName(mode, o)}</text>
            </g>
          )
        })}
      </svg>
      <div class="dice-legend"><span><i class="dice-key-bar" />relativní četnost</span><span><i class="dice-key-th" />pravděpodobnost</span></div>

      {event ? (
        <div class="dice-event">
          <div class="dice-ev-h">Jev „{event.label}“</div>
          <div><b>Teorie:</b> P = {frac(ew, sp.all)} {pct(pE)}</div>
          <div aria-live="polite"><b>Pokus:</b> {st.total ? <>{st.hits} z {st.total.toLocaleString('cs-CZ')} {pct(st.hits / st.total)}</> : 'zatím nic'}</div>
          {st.hist.length > 0 && (
            <svg viewBox={`0 0 ${HW} ${HH}`} width={HW} aria-hidden="true">
              <line x1={HL} x2={HW - 2} y1={6 + (1 - pE) * (HH - 12)} y2={6 + (1 - pE) * (HH - 12)} class="dice-th" />
              <line x1={HL} x2={HL} y1={4} y2={HH - 4} class="dice-grid" />
              <text x={HL - 4} y={10} text-anchor="end" font-size="9" class="dice-axis">100 %</text>
              <text x={HL - 4} y={HH - 4} text-anchor="end" font-size="9" class="dice-axis">0 %</text>
              <path d={hPath} class="dice-hist" />
            </svg>
          )}
          {st.hist.length > 0 && <div class="dice-note">Čím víc hodů, tím blíž je čára k přerušované (teorii).</div>}
        </div>
      ) : (
        <div class="dice-note">{mode === 'two-dice' ? 'Součet 7 jde hodit 6 způsoby (6/36 = 1/6), součet 2 nebo 12 jen jedním (1/36).' : `Každý výsledek má pravděpodobnost ${frac(1, sp.all)} ${pct(1 / sp.all)}.`}</div>
      )}
    </div>
  )
}

/** Only the task: the experiment and the event, without the probability. */
function DiceQuestion({ mode, event }: P) {
  return (
    <div class="w dice">
      {mode === 'two-dice' ? (
        <table class="dice-table" aria-label="Součty dvou kostek">
          <tbody>
            <tr><th>+</th>{[1, 2, 3, 4, 5, 6].map((b) => <th key={b}>{b}</th>)}</tr>
            {[1, 2, 3, 4, 5, 6].map((a) => <tr key={a}><th>{a}</th>{[1, 2, 3, 4, 5, 6].map((b) => <td key={b}>{a + b}</td>)}</tr>)}
          </tbody>
        </table>
      ) : (
        <div class="dice-last">{space(mode).outs.map((o) => <Face key={o} mode={mode} v={o} size={40} />)}</div>
      )}
      <div class="sub">Pokus: {what(mode)}{event ? <> · jev „{event.label}“</> : null}</div>
    </div>
  )
}

/** „1/6“, „0,5“, „50 %“ → number. */
function answerValue(a: string) {
  const t = a.replace(/\s/g, '').replace(',', '.').replace('−', '-')
  const f = t.match(/^(\d+)\/(\d+)$/)
  if (f) return Number(f[1]) / Number(f[2])
  const p = t.match(/^(-?\d+(?:\.\d+)?)%$/)
  if (p) return Number(p[1]) / 100
  return t ? Number(t) : NaN
}

export default defineWidget({
  name: 'dice',
  title: 'Pravděpodobnost: kostka a mince',
  summary: 'Hod mincí, kostkou nebo dvěma kostkami po 1, 10 nebo 100 hodech. Pruhový graf relativních četností stojí vedle teoretické pravděpodobnosti, takže dítě vidí, jak se s počtem hodů četnost blíží teorii.',
  use: 'Pravděpodobnost a statistika: náhodný pokus, jev, relativní četnost, klasická pravděpodobnost (příznivé ÷ všechny možnosti), součet dvou kostek, zákon velkých čísel.',
  props,
  examples: [
    { title: 'Hod mincí', props: { mode: 'coin', event: { label: 'padne panna', outcomes: [1] } } },
    { title: 'Kostka: sudé číslo', props: { mode: 'die', event: { label: 'sudé číslo', outcomes: [2, 4, 6] } } },
    { title: 'Dvě kostky: součet 7', props: { mode: 'two-dice', event: { label: 'součet 7', outcomes: [7] } } },
  ],
  check: (p) => {
    const e: string[] = []
    if (!p.event) return e
    const outs = space(p.mode).outs
    const bad = p.event.outcomes.filter((o) => !outs.includes(o))
    if (bad.length) e.push(`event.outcomes: ${bad.join(', ')} not possible for ${p.mode} (allowed ${outs[0]}–${outs[outs.length - 1]})`)
    if (new Set(p.event.outcomes).size !== p.event.outcomes.length) e.push('event.outcomes: duplicate outcomes')
    if (!p.event.label.trim()) e.push('event.label is empty')
    return e
  },
  Component: Dice,
  Question: DiceQuestion,
  checkQuestion: (p, answers) => {
    if (!p.event) return ['a question needs an event (its probability is the answer)']
    const want = eventWays(p.mode, p.event.outcomes) / space(p.mode).all
    return answers.some((a) => Math.abs(answerValue(a) - want) < 1e-9) ? [] : [`the probability ${eventWays(p.mode, p.event.outcomes)}/${space(p.mode).all} is not among the answers (as a fraction, decimal or %)`]
  },
  html: (p, inline) => {
    const sp = space(p.mode)
    const rows = p.mode === 'two-dice'
      ? `<table><tr><th>Součet</th>${sp.outs.map((o) => `<td>${o}</td>`).join('')}</tr><tr><th>Pravděpodobnost</th>${sp.ways.map((w) => `<td>${w}/36</td>`).join('')}</tr></table>`
      : `<p>Možné výsledky: ${sp.outs.map((o) => outName(p.mode, o)).join(', ')} – každý s pravděpodobností 1/${sp.all}.</p>`
    const ev = p.event ? `<p>Jev „${inline(p.event.label)}“: P = ${frac(eventWays(p.mode, p.event.outcomes), sp.all)} ${pct(eventWays(p.mode, p.event.outcomes) / sp.all)}.</p>` : ''
    return `<p>Pokus: ${what(p.mode)}.</p>${rows}${ev}`
  },
})
