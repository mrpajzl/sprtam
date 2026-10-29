import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// One number in binary, decimal, hexadecimal (and optionally octal). Bits are tap switches with
// their weights above; the decimal value is written out as a sum of weights. Optional: division by
// two with the table of remainders, and a target number to set.

const props = s.object({
  value: s.int({ min: 0, max: 65535, description: 'Číslo na začátku (desítkově). Musí se vejít do zadaného počtu bitů.' }),
  bits: s.optional(s.int({ min: 4, max: 16, description: 'Počet bitů: 4, 8 (bajt, výchozí) nebo 16.' })),
  octal: s.optional(s.boolean({ description: 'Ukázat i osmičkovou soustavu.' })),
  division: s.optional(s.boolean({ description: 'Ukázat převod z desítkové do dvojkové soustavy dělením dvěma (tabulka zbytků).' })),
  target: s.optional(s.int({ min: 0, max: 65535, description: 'Úkol: dítě má bity nastavit tak, aby vyšlo toto číslo. Zadání čísla tlačítky se pak skryje.' })),
  show: s.optional(s.enum(['bin', 'dec', 'hex', 'oct'], { description: 'Jen pro otázku: v jaké soustavě se číslo ukáže v zadání (bin, dec, hex, oct). Výchozí dec.' })),
}, { description: 'Číslo ve dvojkové, desítkové a šestnáctkové soustavě.' })
type P = Infer<typeof props>

const BASE = { bin: 2, oct: 8, dec: 10, hex: 16 } as const

/** 37, 8 bits → „0010 0101“. */
const binStr = (n: number, bits: number) => n.toString(2).padStart(bits, '0').replace(/(.{4})(?=.)/g, '$1 ')
const hexStr = (n: number) => n.toString(16).toUpperCase()
const sumOf = (n: number, bits: number) => {
  const w: number[] = []
  for (let i = bits - 1; i >= 0; i--) if (n & (1 << i)) w.push(1 << i)
  return w
}
/** Division by two: [number, quotient, remainder] rows until 0. */
const divRows = (n: number) => {
  const r: [number, number, number][] = []
  for (let x = n; x > 0; x = Math.floor(x / 2)) r.push([x, Math.floor(x / 2), x % 2])
  return r
}

function Binary({ value, bits = 8, octal, division, target }: P) {
  const max = 2 ** bits - 1
  const [n, setN] = useState(Math.min(value, max))
  const [text, setText] = useState(String(Math.min(value, max)))
  const set = (x: number) => { const v = Math.max(0, Math.min(max, Math.round(x))); setN(v); setText(String(v)) }
  const weights = Array.from({ length: bits }, (_, i) => 2 ** (bits - 1 - i))
  const rows = Array.from({ length: Math.ceil(bits / 8) }, (_, r) => weights.slice(r * 8, r * 8 + 8))
  const parts = sumOf(n, bits)
  const done = target !== undefined && n === target
  return (
    <div class="w binary-w">
      {target !== undefined && <div class={`binary-task ${done ? 'ok' : ''}`} aria-live="polite">{done ? `Správně! ${target} = ${binStr(target, bits)}₂ ✓` : `Úkol: zapni bity tak, aby vyšlo ${target}.`}</div>}
      <div class="binary-bits">
        {rows.map((row, r) => (
          <div key={r} class="binary-row" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
            {row.map((w) => {
              const on = (n & w) !== 0
              return (
                <div key={w} class="binary-bit">
                  <small class="binary-wt">{w}</small>
                  <button class={`binary-sw ${on ? 'on' : ''}`} aria-pressed={on} aria-label={`Bit s váhou ${w}: ${on ? '1' : '0'}`} onClick={() => set(n ^ w)}>{on ? 1 : 0}</button>
                </div>
              )
            })}
            {Array.from({ length: row.length / 4 }, (_, g) => {
              const nib = (n >> (bits - 4 * (r * 2 + g + 1))) & 15
              return <span key={`h${g}`} class="binary-nib" style={{ gridColumn: `${g * 4 + 1} / span 4` }}>{hexStr(nib)}<sub>16</sub></span>
            })}
          </div>
        ))}
      </div>
      <div class="binary-sum" aria-live="polite">
        {parts.length ? `${parts.join(' + ')} = ${n}` : 'Žádný bit není zapnutý = 0'}
      </div>
      <table class="binary-tab">
        <tbody>
          <tr><th>dvojkově</th><td>{binStr(n, bits)}<sub>2</sub></td></tr>
          <tr class="dec"><th>desítkově</th><td>{n}<sub>10</sub></td></tr>
          <tr><th>šestnáctkově</th><td>{hexStr(n)}<sub>16</sub></td></tr>
          {octal && <tr><th>osmičkově</th><td>{n.toString(8)}<sub>8</sub></td></tr>}
        </tbody>
      </table>
      {target === undefined && (
        <div class="ctrls binary-in">
          <div class="step">
            <button onClick={() => set(n - 1)} aria-label="O jedna méně">−</button>
            <input class="binary-field" type="number" inputMode="numeric" min={0} max={max} value={text} aria-label={`Číslo v desítkové soustavě, 0 až ${max}`}
              onInput={(e) => { const t = e.currentTarget.value; setText(t); if (/^\d+$/.test(t)) setN(Math.min(max, Number(t))) }}
              onBlur={() => setText(String(n))} />
            <button onClick={() => set(n + 1)} aria-label="O jedna více">+</button>
          </div>
        </div>
      )}
      {division && (
        <div class="binary-div">
          <div class="sub">Převod dělením dvěma</div>
          {n === 0 ? <div class="binary-read">0 = 0₂</div> : (
            <>
              <table class="binary-dt">
                <thead><tr><th>číslo</th><th>: 2 =</th><th>zbytek</th></tr></thead>
                <tbody>{divRows(n).map(([x, q, r]) => <tr key={x}><td>{x}</td><td>{q}</td><td class="r">{r}</td></tr>)}</tbody>
              </table>
              <div class="binary-read">Zbytky čti odspodu ↑: {n} = {n.toString(2)}₂</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** Quiz task: the number in one base, e.g. „100101₂“. */
function BinaryQuestion({ value, bits = 8, show = 'dec' }: P) {
  const b = BASE[show]
  const txt = b === 2 ? binStr(value, Math.min(bits, Math.max(4, Math.ceil(value.toString(2).length / 4) * 4))) : b === 16 ? hexStr(value) : value.toString(b)
  return (
    <div class="w binary-w">
      <div class="val binary-q">{txt}<sub>{b}</sub></div>
      <div class="sub">{{ 2: 'Číslo ve dvojkové soustavě', 8: 'Číslo v osmičkové soustavě', 10: 'Číslo v desítkové soustavě', 16: 'Číslo v šestnáctkové soustavě' }[b]}</div>
    </div>
  )
}

/** Reads an answer as a number in base b; null when it is not one. Accepts 0b/0x prefixes, subscripts and spaces. */
const parse = (a: string, b: number) => {
  const t = a.trim().toLowerCase().replace(/[\s_]/g, '').replace(/[₀₁₂₆₈]+$/, '').replace(b === 16 ? /^0x|h$/ : b === 2 ? /^0b/ : b === 8 ? /^0o/ : /^$/, '')
  const ok = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/ }[b as 2 | 8 | 10 | 16]
  return ok.test(t) ? parseInt(t, b) : null
}

export default defineWidget({
  name: 'binary',
  title: 'Číselné soustavy',
  summary: 'Řada bitů jako přepínače 0/1 s vahami 128, 64, … 1. Klepnutím se mění bity a číslo se hned přepočítá do desítkové, šestnáctkové (i osmičkové) soustavy, výpočet je rozepsaný jako součet vah. Volitelně převod dělením dvěma nebo úkol „nastav číslo“.',
  use: 'Informatika ZŠ (dvojková soustava, bit a bajt), hardware a elektronika (šestnáctková soustava, registry, adresy), převody mezi soustavami.',
  props,
  examples: [
    { title: 'Bajt: číslo 37', props: { value: 37, division: true } },
    { title: 'Úkol: nastav 200', props: { value: 0, target: 200 } },
    { title: '16 bitů s osmičkovou soustavou', props: { value: 2026, bits: 16, octal: true } },
  ],
  check: (p) => {
    const e: string[] = []
    const bits = p.bits ?? 8
    if (![4, 8, 16].includes(bits)) e.push('bits must be 4, 8 or 16')
    const max = 2 ** bits - 1
    if (p.value > max) e.push(`value ${p.value} does not fit into ${bits} bits (max ${max})`)
    if (p.target !== undefined) {
      if (p.target > max) e.push(`target ${p.target} does not fit into ${bits} bits (max ${max})`)
      if (p.target === p.value) e.push('target equals value – the task is already solved')
    }
    return e
  },
  Component: Binary,
  Question: BinaryQuestion,
  checkQuestion: (p, answers) => {
    const shown = BASE[p.show ?? 'dec']
    const e: string[] = []
    for (const a of answers) {
      const fits = ([2, 8, 10, 16] as const).filter((b) => b !== shown && parse(a, b) === p.value)
      if (!fits.length) e.push(`answer „${a}“ is not ${p.value} in another base than the shown one`)
    }
    return e
  },
  html: (p) => {
    const n = Math.min(p.value, 2 ** (p.bits ?? 8) - 1), bits = p.bits ?? 8
    const parts = sumOf(n, bits)
    return `<p>${n}<sub>10</sub> = ${binStr(n, bits)}<sub>2</sub> = ${hexStr(n)}<sub>16</sub>${p.octal ? ` = ${n.toString(8)}<sub>8</sub>` : ''}</p>`
      + `<p>Váhy bitů: ${Array.from({ length: bits }, (_, i) => 2 ** (bits - 1 - i)).join(', ')}. ${parts.length ? `${parts.join(' + ')} = ${n}` : '0'}</p>`
  },
})
