import { Fragment, type JSX } from 'preact'
import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, gcd } from './kit'
import { BY_SYMBOL } from '../chem/elements'

// Balancing a chemical equation: the pupil sets the stoichiometric coefficients with +/−
// and a table counts the atoms of every element on both sides.

/**
 * Atoms in a formula: „Al2(SO4)3“ → { Al: 2, S: 3, O: 12 }. Knows parentheses (also [ ]) and hydrates
 * with „·“ („CuSO4·5H2O“). Throws on anything else.
 */
export function parseFormula(f: string): Map<string, number> {
  const out = new Map<string, number>()
  const add = (m: Map<string, number>, k: number) => m.forEach((n, el) => out.set(el, (out.get(el) ?? 0) + n * k))
  for (const part of f.split(/[·*]/)) {
    const m = /^(\d*)(.+)$/.exec(part)
    if (!m) throw new Error(`empty part in ${f}`)
    let i = 0
    const src = m[2]
    const num = () => { const d = /^\d+/.exec(src.slice(i)); if (!d) return 1; i += d[0].length; return Number(d[0]) }
    const group = (close: string | null): Map<string, number> => {
      const g = new Map<string, number>()
      const put = (el: string, n: number) => g.set(el, (g.get(el) ?? 0) + n)
      while (i < src.length) {
        const ch = src[i]
        if (ch === '(' || ch === '[') {
          i++
          const inner = group(ch === '(' ? ')' : ']')
          const k = num()
          inner.forEach((n, el) => put(el, n * k))
        } else if (ch === ')' || ch === ']') {
          if (ch !== close) throw new Error(`unexpected ${ch} in ${f}`)
          i++
          return g
        } else {
          const e = /^[A-Z][a-z]?/.exec(src.slice(i))
          if (!e) throw new Error(`unexpected „${ch}“ in ${f}`)
          if (!BY_SYMBOL.has(e[0])) throw new Error(`unknown element ${e[0]} in ${f}`)
          i += e[0].length
          put(e[0], num())
        }
      }
      if (close) throw new Error(`missing ${close} in ${f}`)
      return g
    }
    add(group(null), m[1] ? Number(m[1]) : 1)
  }
  return out
}

/** Atoms of every element on the left and the right for the given coefficients (elements in order of appearance). */
function count(reactants: string[], products: string[], k: number[]) {
  const rows = new Map<string, [number, number]>()
  const side = (fs: string[], off: number, j: 0 | 1) => fs.forEach((f, i) => parseFormula(f).forEach((n, el) => {
    const r = rows.get(el) ?? [0, 0]
    r[j] += n * k[off + i]
    rows.set(el, r)
  }))
  side(reactants, 0, 0)
  side(products, reactants.length, 1)
  return [...rows].map(([el, [l, r]]) => ({ el, l, r }))
}

/** „Ca(OH)2“ with the counts as subscripts; a number after „·“ is a coefficient. */
function Formula({ f }: { f: string }) {
  const parts: (string | JSX.Element)[] = []
  const re = /(^|[·*])(\d+)|(\d+)/g
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(f))) {
    if (m.index > last) parts.push(f.slice(last, m.index))
    if (m[2]) parts.push(`${m[1] ? '·' : ''}${m[2]}`)
    else parts.push(<sub key={i++}>{m[3]}</sub>)
    last = re.lastIndex
  }
  if (last < f.length) parts.push(f.slice(last))
  return <span class="chem-f">{parts.map((p) => (typeof p === 'string' ? p.replace(/\*/g, '·') : p))}</span>
}
/** Plain text for screen readers and the static page: „Ca(OH)₂“. */
const SUB = '₀₁₂₃₄₅₆₇₈₉'
const plain = (f: string) => f.replace(/\*/g, '·').replace(/([^·\d])(\d+)/g, (_, a: string, d: string) => a + d.split('').map((x) => SUB[Number(x)]).join(''))

const props = s.object({
  reactants: s.array(s.string({ pattern: '^[A-Za-z0-9()\\[\\]·*]+$' }), { min: 1, max: 4, description: 'Reaktanty (výchozí látky) jako vzorce bez koeficientů, např. ["H2", "O2"]. Čísla ve vzorci se zobrazí jako dolní indexy; jde i se závorkami: "Ca(OH)2", "Al2(SO4)3".' }),
  products: s.array(s.string({ pattern: '^[A-Za-z0-9()\\[\\]·*]+$' }), { min: 1, max: 4, description: 'Produkty jako vzorce bez koeficientů, např. ["H2O"].' }),
  coefficients: s.array(s.int({ min: 1, max: 20 }), { min: 2, max: 8, description: 'Správné stechiometrické koeficienty v pořadí reaktanty, pak produkty – nejmenší celá čísla, i jedničky. Např. [2, 1, 2] pro 2 H2 + O2 → 2 H2O.' }),
}, { description: 'Chemická rovnice k vyčíslení.' })
type P = Infer<typeof props>

function Side({ fs, k, off, set }: { fs: string[]; k: number[]; off: number; set?: (i: number, v: number) => void }) {
  return (
    <>
      {fs.map((f, i) => (
        <Fragment key={i}>
          {i > 0 && <span class="chem-op">+</span>}
          <span class="chem-sp">
            <span class="chem-top">
              {set ? <b class={`chem-n ${k[off + i] === 1 ? 'one' : ''}`}>{k[off + i]}</b> : <span class="chem-blank" aria-hidden="true" />}
              <Formula f={f} />
            </span>
            {set && (
              <span class="chem-k">
                <button onClick={() => set(off + i, k[off + i] - 1)} disabled={k[off + i] <= 1} aria-label={`Méně ${plain(f)}, teď ${k[off + i]}`}>−</button>
                <button onClick={() => set(off + i, k[off + i] + 1)} disabled={k[off + i] >= 20} aria-label={`Více ${plain(f)}, teď ${k[off + i]}`}>+</button>
              </span>
            )}
          </span>
        </Fragment>
      ))}
    </>
  )
}

const text = (fs: string[], k: number[], off: number) => fs.map((f, i) => `${k[off + i] > 1 ? `${k[off + i]} ` : ''}${plain(f)}`).join(' + ')

function ChemEquation({ reactants, products, coefficients }: P) {
  const n = reactants.length + products.length
  const [k, setK] = useState<number[]>(() => Array(n).fill(1))
  const set = (i: number, v: number) => setK(k.map((x, j) => (j === i ? Math.max(1, Math.min(20, v)) : x)))
  let rows: { el: string; l: number; r: number }[] = []
  try { rows = count(reactants, products, k) } catch { /* invalid formula, caught by check */ }
  const ok = rows.length > 0 && rows.every((r) => r.l === r.r)
  const g = k.reduce(gcd)
  const eq = `${text(reactants, k, 0)} → ${text(products, k, reactants.length)}`
  return (
    <div class="w">
      <div class="chem-eq" role="group" aria-label="Rovnice">
        <Side fs={reactants} k={k} off={0} set={set} />
        <span class="chem-op chem-arrow">→</span>
        <Side fs={products} k={k} off={reactants.length} set={set} />
      </div>
      <table class="chem-table">
        <thead><tr><th>Prvek</th><th>Vlevo</th><th>Vpravo</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.el} class={r.l === r.r ? 'ok' : 'bad'}>
              <td>{r.el}</td><td>{r.l}</td><td>{r.r}</td><td aria-label={r.l === r.r ? 'sedí' : 'nesedí'}>{r.l === r.r ? '✓' : r.l < r.r ? `vlevo chybí ${r.r - r.l}` : `vpravo chybí ${r.l - r.r}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div class={`val chem-res ${ok ? 'ok' : ''}`} aria-live="polite">
        {ok ? (g > 1 ? 'Sedí, ale jde to zkrátit' : 'Výborně, vyrovnáno! ✓') : 'Ještě nesedí'}
      </div>
      <div class="sub">
        {ok && g > 1 ? `Vyděl všechny koeficienty číslem ${g}. Koeficienty mají být co nejmenší celá čísla.` : ok ? eq : 'Na obou stranách musí být stejně atomů každého prvku.'}
      </div>
      {k.some((x) => x > 1) && <div class="ctrls"><button class="reveal" onClick={() => setK(Array(n).fill(1))}>Znovu</button></div>}
    </div>
  )
}

/** Only the equation without coefficients, for an `input` question. */
function ChemQuestion({ reactants, products }: P) {
  const k = Array(reactants.length + products.length).fill(1)
  return (
    <div class="w">
      <div class="chem-eq" role="img" aria-label={`${reactants.map(plain).join(' + ')} → ${products.map(plain).join(' + ')}`}>
        <Side fs={reactants} k={k} off={0} />
        <span class="chem-op chem-arrow">→</span>
        <Side fs={products} k={k} off={reactants.length} />
      </div>
      <div class="sub">Napiš koeficienty zleva doprava, oddělené čárkou, i jedničky: např. 2, 1, 2.</div>
    </div>
  )
}

const parseAnswer = (a: string) => (/^\s*\d+(\s*[,;]\s*\d+)*\s*$/.test(a) ? a.split(/[,;]/).map((x) => Number(x.trim())) : null)

export default defineWidget({
  name: 'chem-equation',
  title: 'Vyčíslení chemické rovnice',
  summary: 'Chemická rovnice bez koeficientů. Dítě tlačítky +/− mění stechiometrické koeficienty; tabulka pod rovnicí počítá atomy každého prvku vlevo a vpravo, nesedící zvýrazní a vyrovnanou rovnici pochválí.',
  use: 'Chemické rovnice, zákon zachování hmotnosti, vyčíslování rovnic (slučování, rozklad, neutralizace, hoření).',
  props,
  examples: [
    { title: 'Vznik vody (ZŠ)', props: { reactants: ['H2', 'O2'], products: ['H2O'], coefficients: [2, 1, 2] } },
    { title: 'Hoření methanu', props: { reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'], coefficients: [1, 2, 1, 2] } },
    { title: 'Neutralizace se závorkami (SŠ)', props: { reactants: ['Ca(OH)2', 'H3PO4'], products: ['Ca3(PO4)2', 'H2O'], coefficients: [3, 2, 1, 6] } },
  ],
  check: (p) => {
    const e: string[] = []
    const all = [...p.reactants, ...p.products]
    for (const f of all) { try { parseFormula(f) } catch (x) { e.push(String((x as Error).message)) } }
    if (e.length) return e
    if (p.coefficients.length !== all.length) return [`coefficients: expected ${all.length} numbers (reactants, then products), got ${p.coefficients.length}`]
    const rows = count(p.reactants, p.products, p.coefficients)
    const bad = rows.filter((r) => r.l !== r.r)
    if (bad.length) e.push(`coefficients do not balance the equation: ${bad.map((r) => `${r.el} ${r.l} ≠ ${r.r}`).join(', ')}`)
    const left = new Set(p.reactants.flatMap((f) => [...parseFormula(f).keys()])), right = new Set(p.products.flatMap((f) => [...parseFormula(f).keys()]))
    for (const el of left) if (!right.has(el)) e.push(`element ${el} is only on the left`)
    for (const el of right) if (!left.has(el)) e.push(`element ${el} is only on the right`)
    if (p.coefficients.reduce(gcd) > 1) e.push('coefficients are not the smallest whole numbers (divide by their common divisor)')
    if (new Set(all).size !== all.length) e.push('the same formula appears twice')
    return e
  },
  Component: ChemEquation,
  Question: ChemQuestion,
  checkQuestion: (p, answers) => {
    const want = p.coefficients.join(',')
    const e: string[] = []
    if (!answers.some((a) => parseAnswer(a)?.join(',') === want)) e.push(`the coefficients ${p.coefficients.join(', ')} are not among the answers`)
    for (const a of answers) {
      const k = parseAnswer(a)
      if (k && k.join(',') !== want) e.push(`answer „${a}“ differs from the coefficients ${p.coefficients.join(', ')}`)
    }
    return e
  },
  // Formulas come from content: escaped like any text (inline), though the check only lets real formulas through.
  html: (p, inline) => `<p>Vyčísli rovnici: ${inline(p.reactants.map(plain).join(' + '))} → ${inline(p.products.map(plain).join(' + '))}</p><p>Vyčíslená: ${inline(text(p.reactants, p.coefficients, 0))} → ${inline(text(p.products, p.coefficients, p.reactants.length))}</p>`,
})
