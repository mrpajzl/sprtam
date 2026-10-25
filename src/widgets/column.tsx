import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// Written arithmetic laid out the way it is written in a Czech exercise book
// ("pod sebou"), solved column by column with a spoken commentary.
//   +  sčítání (also decimals – aligned by the comma)
//   −  odčítání, Czech method of "doplňování": „7 a kolik je 12? 5, 1 si pamatuji“
//   ·  násobení (multi-digit multiplier → partial products shifted left, then their sum)
//   :  dělení in the Czech layout (remainders written under the dividend)

type Kind = 'n' | 'op' | 'carry' | 'pad' | 'res'
interface Cell { ch: string; kind: Kind; step: number }
interface Step { text: string; act: [number, number][] }
interface Layout { rows: (Cell | null)[][]; lines: number[]; steps: Step[]; width: number }

const PLACE = ['jednotky', 'desítky', 'stovky', 'tisíce', 'desetitisíce', 'statisíce', 'miliony', 'desítky milionů', 'stovky milionů']
const FRAC = ['desetiny', 'setiny', 'tisíciny', 'desetitisíciny']
const clean = (v: string | number) => String(v).replace(/\s/g, '').replace('.', ',').replace('−', '-')
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

class Grid {
  rows: (Cell | null)[][] = []
  constructor(public width: number) {}
  row() { this.rows.push(Array(this.width).fill(null)); return this.rows.length - 1 }
  /** Put a character at column c (0 = leftmost). */
  put(r: number, c: number, ch: string, kind: Kind = 'n', step = 0) { if (c >= 0 && c < this.width) this.rows[r][c] = { ch, kind, step } }
  /** Write a string so that its last character lands in column `right`. */
  text(r: number, right: number, s: string, kind: Kind = 'n', step = 0) { [...s].forEach((ch, i) => this.put(r, right - s.length + 1 + i, ch, kind, step)) }
}

function addSub(aRaw: string, bRaw: string, minus: boolean): Layout {
  const split = (s: string) => { const [i, f = ''] = s.split(','); return { i: i.replace(/^0+(?=\d)/, ''), f } }
  let A = split(aRaw), B = split(bRaw)
  const fl = Math.max(A.f.length, B.f.length)
  const str = (x: { i: string; f: string }) => (fl ? `${x.i},${x.f.padEnd(fl, '0')}` : x.i)
  const padFrom = (x: { i: string; f: string }) => x.i.length + 1 + x.f.length // index where added zeros start
  const sa = str(A), sb = str(B)
  const scale = 10 ** fl
  const va = Math.round(Number(sa.replace(',', '.')) * scale), vb = Math.round(Number(sb.replace(',', '.')) * scale)
  const res = minus ? va - vb : va + vb
  const resDigits = String(Math.abs(res)).padStart(fl + 1, '0')
  const sr = fl ? `${resDigits.slice(0, -fl)},${resDigits.slice(-fl)}` : resDigits
  const width = Math.max(sa.length, sb.length, sr.length) + 2
  const right = width - 1
  const g = new Grid(width)
  const rc = g.row(), ra = g.row(), rb = g.row(), rr = g.row()
  // Operands (zeros added after the comma are shown faded).
  ;[[ra, sa, A], [rb, sb, B]].forEach(([r, s, x]) => {
    const from = fl ? padFrom(x as { i: string; f: string }) : Infinity
    ;[...(s as string)].forEach((ch, i) => g.put(r as number, right - (s as string).length + 1 + i, ch, i >= from ? 'pad' : 'n'))
  })
  g.put(rb, 0, minus ? '−' : '+', 'op')
  // Columns from the right, skipping the comma.
  const cols: number[] = []
  for (let c = right; c > right - Math.max(sa.length, sb.length); c--) if (!fl || c !== right - fl) cols.push(c)
  if (fl) { g.put(rr, right - fl, ',', 'res', 1) }
  const digitAt = (s: string, c: number) => { const i = s.length - 1 - (right - c); return i >= 0 && s[i] !== ',' ? Number(s[i]) : null }
  const steps: Step[] = []
  let carry = 0
  cols.forEach((c, k) => {
    const pos = k < fl ? FRAC[fl - 1 - k] : PLACE[k - fl]
    const daN = digitAt(sa, c), db = digitAt(sb, c), da = daN ?? 0
    const step = k + 1
    let text: string, digit: number, next: number
    if (!minus) {
      const sum = da + (db ?? 0) + carry
      digit = sum % 10; next = Math.floor(sum / 10)
      const parts = [...(daN !== null ? [daN] : []), ...(db !== null ? [db] : []), ...(carry ? [carry] : [])]
      text = parts.length === 1 && !carry
        ? `${cap(pos)}: tady je jen ${sum}, opíšu ${digit}.`
        : `${cap(pos)}: ${parts.join(' + ')}${carry ? ' (ta 1, co si pamatuji)' : ''} = ${sum}. Píšu ${digit}${next ? `, ${next} si pamatuji` : ''}.`
    } else {
      const s = (db ?? 0) + carry
      const need = da >= s ? da : da + 10
      digit = need - s; next = da >= s ? 0 : 1
      const intro = carry ? (db === null ? 'Dole nic není, ale pamatuji si 1. ' : `K ${db} přičtu 1, co si pamatuji: ${s}. `) : ''
      const leadingZero = digit === 0 && k === cols.length - 1
      text = db === null && !carry
        ? `${cap(pos)}: dole nic není, opíšu ${da}.`
        : `${cap(pos)}: ${intro}${s} a kolik je ${need}? ${digit}.${leadingZero ? ' Nulu na začátek čísla nepíšu.' : ` Píšu ${digit}${next ? ', 1 si pamatuji' : ''}.`}`
    }
    g.put(rr, c, String(digit), 'res', step)
    if (next && cols[k + 1] !== undefined) g.put(rc, cols[k + 1], String(next), 'carry', step)
    if (fl && step === 1) g.put(rr, right - fl, ',', 'res', 1)
    steps.push({ text, act: [[ra, c], [rb, c], [rr, c]] })
    carry = next
  })
  if (carry && !minus) {
    const c = cols[cols.length - 1] - 1
    g.put(rr, c, String(carry), 'res', cols.length + 1)
    steps.push({ text: `Zbyla ${carry}, kterou si pamatuji – napíšu ji na začátek.`, act: [[rr, c]] })
  }
  // Hide leading zeros of the result (subtraction).
  let c0 = g.rows[rr].findIndex((x) => x !== null)
  while (c0 >= 0 && g.rows[rr][c0]?.ch === '0' && /\d/.test(g.rows[rr][c0 + 1]?.ch ?? '')) { g.rows[rr][c0] = null; c0++ }
  const nice = (x: string) => (x.includes(',') ? x.replace(/0+$/, '').replace(/,$/, '') : x).replace(/^0+(?=\d)/, '')
  const shown = sr.replace(/^0+(?=\d)/, '')
  const plain = nice(sr)
  steps.push({ text: `Výsledek: ${shown}${plain !== shown ? ` = ${plain} (nuly na konci za čárkou můžu vynechat)` : ''}.${minus ? ` Zkouška: ${plain} + ${nice(sb)} = ${nice(sa)}.` : ''}`, act: [] })
  return { rows: g.rows, lines: [rr], steps, width }
}

function multiply(aRaw: string, bRaw: string): Layout {
  const a = aRaw.replace(/^0+(?=\d)/, ''), b = bRaw.replace(/^0+(?=\d)/, '')
  const bd = [...b].reverse().map(Number)
  const partials = bd.map((d, i) => String(Number(a) * d) + '0'.repeat(i))
  const total = String(Number(a) * Number(b))
  const width = Math.max(a.length, b.length + 1, total.length, ...partials.map((p) => p.length)) + 2
  const right = width - 1
  const g = new Grid(width)
  const steps: Step[] = []
  if (bd.length === 1) {
    const rc = g.row(), ra = g.row(), rb = g.row(), rr = g.row()
    g.text(ra, right, a); g.text(rb, right, b); g.put(rb, right - b.length, '·', 'op')
    let carry = 0
    const ad = [...a].reverse().map(Number)
    ad.forEach((d, k) => {
      const c = right - k, p = d * bd[0] + carry
      const digit = k === ad.length - 1 ? p : p % 10, next = Math.floor(p / 10)
      const last = k === ad.length - 1
      if (last) g.text(rr, c, String(p), 'res', k + 1); else g.put(rr, c, String(digit), 'res', k + 1)
      if (!last && next) g.put(rc, c - 1, String(next), 'carry', k + 1)
      steps.push({ text: `${cap(PLACE[k])}: ${d} · ${bd[0]} = ${d * bd[0]}${carry ? `, + ${carry} co si pamatuji = ${p}` : ''}. Píšu ${last ? p : digit}${!last && next ? `, ${next} si pamatuji` : ''}.`, act: [[ra, c], [rb, right], [rr, c]] })
      carry = next
    })
    steps.push({ text: `Výsledek: ${a} · ${b} = ${total}.`, act: [] })
    return { rows: g.rows, lines: [rr], steps, width }
  }
  const ra = g.row(), rb = g.row()
  g.text(ra, right, a); g.text(rb, right, b); g.put(rb, right - b.length, '·', 'op')
  const prow = partials.map(() => g.row())
  const ad = [...a].reverse().map(Number)
  partials.forEach((_, i) => {
    // Czech exercise books leave the shifted places empty instead of writing zeros.
    const shown = String(Number(a) * bd[i])
    g.text(prow[i], right - i, shown, 'res', i + 1)
    let carry = 0
    const talk = ad.map((d, k) => {
      const p = d * bd[i] + carry, last = k === ad.length - 1
      const t = `${d} · ${bd[i]}${carry ? ` + ${carry}` : ''} = ${p}, píšu ${last ? p : p % 10}${!last && p >= 10 ? `, ${Math.floor(p / 10)} si pamatuji` : ''}`
      carry = Math.floor(p / 10)
      return t
    })
    steps.push({ text: `Násobím číslicí ${bd[i]} (${PLACE[i]}). ${i ? `Začnu psát o ${i === 1 ? 'jedno místo' : `${i} místa`} doleva, pod ${PLACE[i]}. ` : ''}${talk.join('; ')}. → ${shown}`, act: [[rb, right - i], [prow[i], right - i]] })
  })
  const rt = g.row()
  let carry = 0
  for (let k = 0; k < total.length; k++) {
    const c = right - k
    const ds = partials.map((p) => { const j = p.length - 1 - k; return j >= 0 && k >= partials.indexOf(p) ? Number(p[j]) : null }).filter((x): x is number => x !== null)
    const sum = ds.reduce((x, y) => x + y, 0) + carry
    const last = k === total.length - 1
    g.put(rt, c, total[total.length - 1 - k], 'res', partials.length + 1 + k)
    steps.push({ text: `Sčítám pod sebou – ${PLACE[k]}: ${ds.length ? ds.join(' + ') : '0'}${carry ? ` + ${carry}` : ''} = ${sum}. Píšu ${last ? sum : sum % 10}${!last && sum >= 10 ? `, ${Math.floor(sum / 10)} si pamatuji` : ''}.`, act: [...partials.map((_, i) => [prow[i], c] as [number, number]), [rt, c]] })
    carry = Math.floor(sum / 10)
    if (last) break
  }
  steps.push({ text: `Výsledek: ${a} · ${b} = ${total}.`, act: [] })
  return { rows: g.rows, lines: [prow[0], rt], steps, width }
}

function divide(aRaw: string, bRaw: string): Layout {
  const D = aRaw.replace(/^0+(?=\d)/, ''), d = Number(bRaw)
  const q = String(Math.floor(Number(D) / d)), rem = Number(D) % d
  const head = `${D} : ${d} = `
  const width = head.length + q.length + 1
  const g = new Grid(width)
  const top = g.row()
  ;[...head].forEach((ch, i) => g.put(top, i, ch, /\d/.test(ch) ? 'n' : 'op'))
  const steps: Step[] = []
  // Take the first part of the dividend that contains the divisor.
  let len = 1
  while (len < D.length && Number(D.slice(0, len)) < d) len++
  let cur = Number(D.slice(0, len)), pos = len - 1, qi = 0, step = 1
  for (;;) {
    const qd = Math.floor(cur / d), r = cur - qd * d
    g.put(top, head.length + qi, String(qd), 'res', step)
    const more = pos + 1 < D.length
    const row = g.row()
    const lineText = more ? `${r}${D[pos + 1]}` : `${r}`
    const end = more ? pos + 1 : pos
    g.text(row, end, lineText, 'res', step)
    steps.push({
      text: `${cur} : ${d} = ${qd}${qd === 0 ? ` (${cur} je menší než ${d}) – do výsledku píšu 0` : ` (${qd} · ${d} = ${qd * d})`}, zbytek ${r}.${more ? ` Ke zbytku připíšu další číslici ${D[pos + 1]} → ${lineText}.` : ''}`,
      act: [[top, head.length + qi], ...(more ? [[row, end] as [number, number]] : [])],
    })
    if (!more) break
    cur = Number(`${r}${D[pos + 1]}`); pos++; qi++; step++
  }
  steps.push({ text: `Výsledek: ${D} : ${d} = ${q}${rem ? `, zbytek ${rem}. Zkouška: ${q} · ${d} + ${rem} = ${D}.` : `. Zkouška: ${q} · ${d} = ${D}.`}`, act: [] })
  return { rows: g.rows, lines: [], steps, width }
}

/** Narrow columns for the decimal comma and the spaces around „ : “ and „ = “. */
const cols = (L: Layout) => Array.from({ length: L.width }, (_, c) => {
  const chars = L.rows.map((r) => r[c]?.ch).filter((x) => x !== undefined && x !== '')
  return chars.length && chars.every((x) => x === ',' || x === ' ') ? '0.32em' : '0.72em'
}).join(' ')

const num = s.anyOf([s.number({ min: 0 }), s.string({ pattern: '^[0-9 ]+(,[0-9]+)?$' })], { description: 'Číslo; jako text i s mezerami mezi řády nebo s desetinnou čárkou: 12500, "12 500", "3,75".' })
const props = s.object({
  a: num,
  b: num,
  op: s.enum(['+', '-', '·', ':'], { description: 'Početní operace: "+" sčítání, "-" odčítání (doplňováním), "·" násobení (i víceciferným číslem), ":" dělení (jednociferným i víceciferným dělitelem). · a : jen s celými čísly.' }),
}, { description: 'Příklad a op b.' })
type P = Infer<typeof props>

const value = (v: string | number) => Number(clean(v).replace(',', '.'))
/** The exact result: a whole quotient for :, otherwise rounded to the decimals of the operands. */
export function columnResult({ a, b, op }: P) {
  const x = value(a), y = value(b)
  const r = op === '+' ? x + y : op === '-' ? x - y : op === '·' ? x * y : Math.floor(x / y)
  return Math.round(r * 1e9) / 1e9
}

/** The problem written „pod sebou“ without the solution – used in quiz questions. */
function ColumnProblem({ a, b, op }: P) {
  const A = clean(a), B = clean(b)
  const L = op === ':' ? null : op === '·' ? multiply(A, B) : addSub(A, B, op !== '+')
  if (!L) return <div class="column-q">{A} : {B} =</div>
  const keep = L.rows.slice(0, op === '·' && B.length > 1 ? 2 : 3).map((row) => row.map((c) => (c && c.kind !== 'carry' && c.kind !== 'res' ? c : null)))
  return (
    <div class="column" style={{ gridTemplateColumns: cols(L), marginBottom: '8px' }} role="img" aria-label={`${A} ${op} ${B}`}>
      {keep.map((row, r) => row.map((cell, c) => <span key={`${r}-${c}`} class={`cc ${cell ? cell.kind : ''}`}>{cell?.ch ?? ''}</span>))}
      {Array.from({ length: L.width }, (_, c) => <span key={`l${c}`} class="cc line" />)}
    </div>
  )
}

function Column({ a, b, op }: P) {
  const L = useMemo(() => {
    const A = clean(a), B = clean(b)
    if (op === '+') return addSub(A, B, false)
    if (op === '-') return addSub(A, B, true)
    if (op === '·') return multiply(A, B)
    return divide(A, B)
  }, [a, b, op])
  const [k, setK] = useState(0)
  const done = k >= L.steps.length
  const act = new Set((L.steps[k - 1]?.act ?? []).map(([r, c]) => `${r}:${c}`))
  return (
    <div class="w">
      <div class={`column ${op === ':' ? 'div' : ''}`} style={{ gridTemplateColumns: cols(L) }} role="img" aria-label={`${a} ${op} ${b}`}>
        {L.rows.map((row, r) => row.map((cell, c) => (
          <span key={`${r}-${c}`} class={`cc ${cell ? cell.kind : ''} ${L.lines.includes(r) ? 'line' : ''} ${act.has(`${r}:${c}`) ? 'act' : ''} ${cell && cell.step > k ? 'hid' : ''}`}>
            {cell?.ch ?? ''}
          </span>
        )))}
      </div>
      <div class="sub" style={{ minHeight: '2.8em', color: 'var(--ink)' }}>{k === 0 ? 'Počítej se mnou krok za krokem.' : L.steps[k - 1].text}</div>
      <div class="ctrls">
        {k > 0 && <button class="reveal" onClick={() => setK(0)}>Znovu</button>}
        {!done && <button class="reveal" onClick={() => setK(k + 1)}>{k === 0 ? 'Začít' : 'Další krok'}</button>}
        {!done && k === 0 && <button class="reveal" onClick={() => setK(L.steps.length)}>Ukázat výsledek</button>}
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'column',
  title: 'Písemné počítání pod sebou',
  summary: 'Příklad zapsaný pod sebou jako v sešitě. Dítě jde tlačítkem krok za krokem, každý krok je okomentovaný („7 a kolik je 12? 5, 1 si pamatuji“).',
  use: 'Písemné sčítání, odčítání, násobení a dělení; v příkladech (example) jako řešení, v otázkách (input) jako zadání.',
  props,
  examples: [
    { title: 'Odčítání', props: { a: 832, b: 457, op: '-' } },
    { title: 'Násobení dvojciferným', props: { a: 345, b: 23, op: '·' } },
    { title: 'Dělení', props: { a: 9874, b: 7, op: ':' } },
    { title: 'Desetinná čísla', props: { a: '12,5', b: '3,75', op: '+' } },
  ],
  check: (p) => {
    const e: string[] = []
    if ((p.op === '·' || p.op === ':') && (/,/.test(clean(p.a)) || /,/.test(clean(p.b)))) e.push('· and : need whole numbers')
    if (p.op === '-' && value(p.a) < value(p.b)) e.push('− needs a ≥ b')
    if (p.op === ':' && value(p.b) === 0) e.push('division by zero')
    return e
  },
  Component: Column,
  Question: ColumnProblem,
  checkQuestion: (p, answers) => {
    const want = columnResult(p)
    return answers.some((v) => Math.abs(value(v) - want) < 1e-9) ? [] : [`the result ${want} is not among the answers`]
  },
})

/** For tests: the raw layouts. */
export const _layout = { addSub, multiply, divide }
