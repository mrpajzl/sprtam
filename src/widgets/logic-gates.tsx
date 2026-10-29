import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// Logic gates in IEC 60617 symbols (rectangle with &, ≥1, =1, 1 and a negation circle) or ANSI
// shapes. Inputs are tap switches, the output a LED, next to it the truth table with the current
// row lit. Optionally a small circuit of 2–3 gates with the values on its wires.

const GATES = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'] as const
type Gate = (typeof GATES)[number]
const INFO: Record<Gate, { name: string; cs: string; rule: string; iec: string; neg: boolean; f: (a: number, b: number) => number }> = {
  and: { name: 'AND', cs: 'logický součin', rule: 'Výstup je 1, jen když jsou oba vstupy 1.', iec: '&', neg: false, f: (a, b) => a & b },
  or: { name: 'OR', cs: 'logický součet', rule: 'Výstup je 1, když je aspoň jeden vstup 1.', iec: '≥1', neg: false, f: (a, b) => a | b },
  not: { name: 'NOT', cs: 'negace, invertor', rule: 'Výstup je opak vstupu.', iec: '1', neg: true, f: (a) => 1 - a },
  nand: { name: 'NAND', cs: 'negovaný součin', rule: 'Opak AND: výstup je 0, jen když jsou oba vstupy 1.', iec: '&', neg: true, f: (a, b) => 1 - (a & b) },
  nor: { name: 'NOR', cs: 'negovaný součet', rule: 'Opak OR: výstup je 1, jen když jsou oba vstupy 0.', iec: '≥1', neg: true, f: (a, b) => 1 - (a | b) },
  xor: { name: 'XOR', cs: 'nonekvivalence, výlučné nebo', rule: 'Výstup je 1, když se vstupy liší.', iec: '=1', neg: false, f: (a, b) => a ^ b },
  xnor: { name: 'XNOR', cs: 'ekvivalence', rule: 'Výstup je 1, když jsou vstupy stejné.', iec: '=1', neg: true, f: (a, b) => 1 - (a ^ b) },
}

const props = s.object({
  gates: s.optional(s.array(s.enum(GATES), { min: 1, max: 7, description: 'Členy, mezi kterými dítě přepíná (and, or, not, nand, nor, xor, xnor); první se ukáže na začátku. Bez zadání všechny.' })),
  notation: s.optional(s.enum(['iec', 'ansi'], { description: 'Značky na začátku: iec (evropské podle IEC 60617, výchozí) nebo ansi (americké). Dítě je může přepnout.' })),
  circuit: s.optional(s.array(s.object({
    gate: s.enum(GATES, { description: 'Druh členu.' }),
    in: s.array(s.string({ pattern: '^(A|B|C|X[1-3])$' }), { min: 1, max: 2, description: 'Vstupy členu: A, B, C nebo výstup dřívějšího členu X1, X2. NOT má jeden vstup, ostatní dva.' }),
  }), { min: 2, max: 3, description: 'Obvod ze 2–3 členů. Výstup posledního členu je Y. Např. A AND (NOT B) = [{ gate: not, in: [B] }, { gate: and, in: [A, X1] }]. Místo gates.' })),
}, { description: 'Logické členy a jejich pravdivostní tabulky.' })
type P = Infer<typeof props>
type Node = { gate: Gate; in: string[] }

const LETTERS = ['A', 'B', 'C']
const inputsOf = (nodes: Node[]) => LETTERS.filter((l) => nodes.some((n) => n.in.includes(l)))
/** Values of all wires for given input values. */
function evaluate(nodes: Node[], inp: Record<string, number>) {
  const v: Record<string, number> = { ...inp }
  nodes.forEach((n, i) => { v[`X${i + 1}`] = INFO[n.gate].f(v[n.in[0]] ?? 0, v[n.in[1] ?? n.in[0]] ?? 0) })
  return v
}
/** „A AND (NOT B)“ */
function expr(nodes: Node[], ref = `X${nodes.length}`): string {
  if (!ref.startsWith('X')) return ref
  const n = nodes[Number(ref.slice(1)) - 1]
  const sub = (r: string) => (r.startsWith('X') ? `(${expr(nodes, r)})` : r)
  return n.gate === 'not' ? `NOT ${sub(n.in[0])}` : `${sub(n.in[0])} ${INFO[n.gate].name} ${sub(n.in[1] ?? n.in[0])}`
}
const outName = (nodes: Node[], i: number) => (i === nodes.length - 1 ? 'Y' : `X${i + 1}`)

// ——— Layout (viewBox units) ———

const BW = 48, H = 56, IN_X = 22, COL = 120
interface Lay { W: number; Hh: number; inY: Record<string, number>; busX: Record<string, number>; gx: number[]; gy: number[]; pins: number[][]; ledX: number }
function layout(nodes: Node[]): Lay {
  const ins = inputsOf(nodes)
  const inY: Record<string, number> = {}, busX: Record<string, number> = {}
  ins.forEach((l, i) => { inY[l] = (ins.length === 1 ? 85 : 44) + i * 76; busX[l] = 50 + i * 12 })
  const x1 = 50 + ins.length * 12 + 26
  const depth: number[] = [], gy: number[] = []
  const yOf = (r: string) => (r.startsWith('X') ? gy[Number(r.slice(1)) - 1] : inY[r])
  nodes.forEach((n, i) => {
    depth[i] = 1 + Math.max(0, ...n.in.map((r) => (r.startsWith('X') ? depth[Number(r.slice(1)) - 1] : 0)))
    gy[i] = n.in.reduce((a, r) => a + yOf(r), 0) / n.in.length
    // Keep gates in the same column apart.
    for (let j = 0; j < i; j++) if (depth[j] === depth[i] && Math.abs(gy[j] - gy[i]) < 80) gy[i] = gy[j] + 80
  })
  const top = Math.min(...gy, ...Object.values(inY)) - 44
  if (top < 0) { gy.forEach((_, i) => (gy[i] -= top)); for (const l of ins) inY[l] -= top }
  const gx = depth.map((d) => x1 + (d - 1) * COL)
  const pins = nodes.map((n, i) => (n.in.length === 1 ? [gy[i]] : [gy[i] - 14, gy[i] + 14]))
  const ledX = gx[nodes.length - 1] + BW + 50
  return { W: ledX + 30, Hh: Math.max(170, Math.max(...gy, ...Object.values(inY)) + 50), inY, busX, gx, gy, pins, ledX }
}

function Shape({ g, x, y, ansi }: { g: Gate; x: number; y: number; ansi: boolean }) {
  const I = INFO[g]
  const base = g === 'nand' ? 'and' : g === 'nor' ? 'or' : g === 'xnor' ? 'xor' : g
  const body = { fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' as const }
  return (
    <g>
      {!ansi && <rect x={x} y={y - H / 2} width={BW} height={H} rx="3" {...body} />}
      {!ansi && <text x={x + BW / 2} y={y - H / 2 + 19} text-anchor="middle" font-size="16" font-weight="800" fill="var(--ink)">{I.iec}</text>}
      {ansi && base === 'and' && <path d={`M${x} ${y - 28}H${x + 20}A28 28 0 0 1 ${x + 20} ${y + 28}H${x}Z`} {...body} />}
      {ansi && (base === 'or' || base === 'xor') && <path d={`M${x - 4} ${y - 28}Q${x + 8} ${y} ${x - 4} ${y + 28}Q${x + 28} ${y + 28} ${x + BW} ${y}Q${x + 28} ${y - 28} ${x - 4} ${y - 28}Z`} {...body} />}
      {ansi && base === 'xor' && <path d={`M${x - 12} ${y - 28}Q${x} ${y} ${x - 12} ${y + 28}`} fill="none" stroke="var(--ink)" stroke-width="2.5" />}
      {ansi && base === 'not' && <path d={`M${x} ${y - 22}L${x + BW - 4} ${y}L${x} ${y + 22}Z`} {...body} />}
      {I.neg && <circle cx={x + BW + (ansi && base === 'not' ? 0 : 4)} cy={y} r="4.5" {...body} stroke-width="2" />}
      <text x={x + BW / 2} y={y + H / 2 + 15} text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink-3)">{I.name}</text>
    </g>
  )
}

const wire = (on: number) => ({ fill: 'none', stroke: on ? 'var(--accent)' : 'var(--ink-3)', 'stroke-width': on ? 4 : 2.5, 'stroke-linejoin': 'round' as const, 'stroke-linecap': 'round' as const, class: 'lg-wire' })

function Circuit({ nodes, v, ansi, toggle }: { nodes: Node[]; v: Record<string, number>; ansi: boolean; toggle: (l: string) => void }) {
  const L = useMemo(() => layout(nodes), [nodes])
  const last = nodes.length - 1
  const ins = inputsOf(nodes)
  const y = v[`X${nodes.length}`]
  // Every input pin with its source.
  const links = nodes.flatMap((n, i) => n.in.map((r, k) => ({ r, i, px: L.gx[i], py: L.pins[i][k] })))
  return (
    <div class="lg-stage" style={{ maxWidth: `${Math.round(L.W * 1.15)}px` }}>
      <svg viewBox={`0 0 ${L.W} ${L.Hh}`} width="100%" role="img" aria-label={`Obvod Y = ${expr(nodes)}. Výstup Y je ${y}.`}>
        {/* Wires from inputs: along a vertical bus to each pin */}
        {links.filter((l) => !l.r.startsWith('X')).map((l, k) => (
          <path key={`i${k}`} d={`M${IN_X + 18} ${L.inY[l.r]}H${L.busX[l.r]}V${l.py}H${l.px + 2}`} {...wire(v[l.r])} />
        ))}
        {ins.map((l) => {
          const ys = links.filter((x) => x.r === l).map((x) => x.py)
          return ys.length > 1 ? ys.map((py, k) => <circle key={`${l}${k}`} cx={L.busX[l]} cy={py} r="3.5" fill={v[l] ? 'var(--accent)' : 'var(--ink-3)'} />) : null
        })}
        {/* Wires between gates */}
        {links.filter((l) => l.r.startsWith('X')).map((l, k) => {
          const j = Number(l.r.slice(1)) - 1, ox = L.gx[j] + BW, oy = L.gy[j]
          const mx = Math.round((ox + 10 + l.px) / 2) + (k % 2 ? 6 : -6)
          return <path key={`g${k}`} d={`M${ox} ${oy}H${mx}V${l.py}H${l.px + 2}`} {...wire(v[l.r])} />
        })}
        <path d={`M${L.gx[last] + BW} ${L.gy[last]}H${L.ledX}`} {...wire(y)} />
        {nodes.map((n, i) => <Shape key={i} g={n.gate} x={L.gx[i]} y={L.gy[i]} ansi={ansi} />)}
        {/* Values on the gate outputs */}
        {nodes.map((_, i) => (
          <text key={`t${i}`} x={L.gx[i] + BW + 9} y={L.gy[i] + (i < last && links.some((l) => l.r === `X${i + 1}` && l.py < L.gy[i]) ? 19 : -9)} font-size="12" font-weight="800" fill={v[`X${i + 1}`] ? 'var(--accent-ink)' : 'var(--ink-3)'}>
            {i === last ? `Y = ${y}` : `X${i + 1} = ${v[`X${i + 1}`]}`}
          </text>
        ))}
        <circle cx={L.ledX + 10} cy={L.gy[last]} r="13" class={`lg-led ${y ? 'on' : ''}`} />
      </svg>
      {ins.map((l) => (
        <button key={l} class={`lg-in ${v[l] ? 'on' : ''}`} style={{ left: `${(IN_X / L.W) * 100}%`, top: `${(L.inY[l] / L.Hh) * 100}%` }}
          aria-pressed={!!v[l]} aria-label={`Vstup ${l}: ${v[l]}`} onClick={() => toggle(l)}>
          <small>{l}</small>{v[l]}
        </button>
      ))}
    </div>
  )
}

function Table({ nodes, cur }: { nodes: Node[]; cur: number }) {
  const ins = inputsOf(nodes)
  const cols = nodes.map((_, i) => outName(nodes, i))
  return (
    <table class="lg-table" aria-label="Pravdivostní tabulka">
      <thead><tr>{ins.map((l) => <th key={l}>{l}</th>)}{cols.map((c) => <th key={c} class={c === 'Y' ? 'y' : 'x'}>{c}</th>)}</tr></thead>
      <tbody>
        {Array.from({ length: 2 ** ins.length }, (_, r) => {
          const inp = Object.fromEntries(ins.map((l, k) => [l, (r >> (ins.length - 1 - k)) & 1]))
          const v = evaluate(nodes, inp)
          return (
            <tr key={r} class={r === cur ? 'on' : ''} aria-current={r === cur ? 'true' : undefined}>
              {ins.map((l) => <td key={l}>{inp[l]}</td>)}
              {nodes.map((_, i) => <td key={i} class={i === nodes.length - 1 ? 'y' : 'x'}>{v[`X${i + 1}`]}</td>)}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const single = (g: Gate): Node[] => [{ gate: g, in: g === 'not' ? ['A'] : ['A', 'B'] }]

function LogicGates({ gates, notation = 'iec', circuit }: P) {
  const list = gates ?? [...GATES]
  const [g, setG] = useState<Gate>(list[0])
  const [ansi, setAnsi] = useState(notation === 'ansi')
  const [inp, setInp] = useState<Record<string, number>>({ A: 0, B: 0, C: 0 })
  const nodes = useMemo<Node[]>(() => (circuit ? (circuit as Node[]) : single(g)), [circuit, g])
  const ins = inputsOf(nodes)
  const v = evaluate(nodes, inp)
  const y = v[`X${nodes.length}`]
  const cur = ins.reduce((a, l) => a * 2 + inp[l], 0)
  const I = INFO[g]
  return (
    <div class="w lg-w">
      {!circuit && list.length > 1 && (
        <div class="chips lg-gates" role="group" aria-label="Logický člen">
          {list.map((x) => <button key={x} class={`chip ${x === g ? 'sel' : ''}`} aria-pressed={x === g} onClick={() => setG(x)}>{INFO[x].name}</button>)}
        </div>
      )}
      <div class="lg-main">
        <Circuit nodes={nodes} v={v} ansi={ansi} toggle={(l) => setInp({ ...inp, [l]: 1 - inp[l] })} />
        <Table nodes={nodes} cur={cur} />
      </div>
      <div class="val" aria-live="polite">Y = {expr(nodes)} = {y}</div>
      <div class="sub">{circuit ? 'Klepni na vstupy a sleduj hodnoty na vodičích.' : <><b>{I.name}</b> – {I.cs}. {I.rule}</>}</div>
      <div class="chips lg-not" role="group" aria-label="Značky">
        <button class={`chip ${!ansi ? 'sel' : ''}`} aria-pressed={!ansi} onClick={() => setAnsi(false)}>Značky IEC</button>
        <button class={`chip ${ansi ? 'sel' : ''}`} aria-pressed={ansi} onClick={() => setAnsi(true)}>Značky ANSI</button>
      </div>
    </div>
  )
}

function tableHtml(nodes: Node[]) {
  const ins = inputsOf(nodes)
  const head = [...ins, ...nodes.map((_, i) => outName(nodes, i))]
  const rows = Array.from({ length: 2 ** ins.length }, (_, r) => {
    const inp = Object.fromEntries(ins.map((l, k) => [l, (r >> (ins.length - 1 - k)) & 1]))
    const v = evaluate(nodes, inp)
    return [...ins.map((l) => inp[l]), ...nodes.map((_, i) => v[`X${i + 1}`])]
  })
  return `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

export default defineWidget({
  name: 'logic-gates',
  title: 'Logické členy',
  summary: 'Logické členy AND, OR, NOT, NAND, NOR, XOR a XNOR ve značkách IEC (nebo amerických ANSI). Dítě klepe na vstupy 0/1, výstup svítí jako LED a v pravdivostní tabulce se zvýrazní aktuální řádek. Volitelně obvod ze 2–3 členů s hodnotami na vodičích.',
  use: 'Informatika (logické operace, pravdivostní tabulky), elektronika a číslicová technika (logické obvody, kombinační obvody), automatizace.',
  props,
  examples: [
    { title: 'Všechny členy', props: {} },
    { title: 'AND a OR', props: { gates: ['and', 'or'] } },
    { title: 'Obvod A AND (NOT B)', props: { circuit: [{ gate: 'not', in: ['B'] }, { gate: 'and', in: ['A', 'X1'] }] } },
    { title: 'Obvod se třemi vstupy (ANSI)', props: { notation: 'ansi', circuit: [{ gate: 'and', in: ['A', 'B'] }, { gate: 'not', in: ['C'] }, { gate: 'or', in: ['X1', 'X2'] }] } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.circuit && p.gates) e.push('use either gates or circuit, not both')
    if (p.gates && new Set(p.gates).size !== p.gates.length) e.push('gates: duplicate gate')
    const c = p.circuit
    if (c) {
      c.forEach((n, i) => {
        if (n.gate === 'not' ? n.in.length !== 1 : n.in.length !== 2) e.push(`circuit[${i}]: ${n.gate} needs ${n.gate === 'not' ? 'one input' : 'two inputs'}`)
        if (n.in.length === 2 && n.in[0] === n.in[1]) e.push(`circuit[${i}]: both inputs are the same`)
        for (const r of n.in) if (r.startsWith('X') && Number(r.slice(1)) > i) e.push(`circuit[${i}]: ${r} is not the output of an earlier gate`)
        if (i < c.length - 1 && !c.slice(i + 1).some((m) => m.in.includes(`X${i + 1}`))) e.push(`circuit[${i}]: output X${i + 1} is not used (only the last gate gives Y)`)
      })
      const used = LETTERS.filter((l) => c.some((n) => n.in.includes(l)))
      if (used.join('') !== LETTERS.slice(0, used.length).join('')) e.push(`inputs must be A, A+B or A+B+C (used: ${used.join(', ') || 'none'})`)
    }
    return e
  },
  Component: LogicGates,
  html: (p) => {
    if (p.circuit) return `<p>Y = ${expr(p.circuit as Node[])}</p>${tableHtml(p.circuit as Node[])}`
    const list = p.gates ?? [...GATES]
    const two = list.filter((g) => g !== 'not')
    const head = ['A', 'B', ...two.map((g) => `A ${INFO[g].name} B`)]
    const rows = [0, 1, 2, 3].map((r) => [r >> 1, r & 1, ...two.map((g) => INFO[g].f(r >> 1, r & 1))])
    const t2 = two.length ? `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''
    const t1 = list.includes('not') ? '<table><thead><tr><th>A</th><th>NOT A</th></tr></thead><tbody><tr><td>0</td><td>1</td></tr><tr><td>1</td><td>0</td></tr></tbody></table>' : ''
    return `<ul>${list.map((g) => `<li><b>${INFO[g].name}</b> (${INFO[g].cs}, značka ${INFO[g].iec}${INFO[g].neg ? ' s kroužkem negace' : ''}): ${INFO[g].rule}</li>`).join('')}</ul>${t2}${t1}`
  },
})
