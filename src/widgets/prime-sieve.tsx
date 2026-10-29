import { useRef, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, gcd } from './kit'

// A table 1…N. Sieve: the pupil crosses out the multiples of 2, 3, 5, 7… (button or tap) and the
// primes stay. Multiples: a tap highlights the multiples of a number; two numbers = two colours,
// the overlap are the common multiples (NSN), with the common divisors (NSD) underneath.

const props = s.object({
  n: s.int({ min: 10, max: 200, description: 'Do kolika jsou čísla v tabulce (10–200). Pro síto se hodí 100.' }),
  mode: s.optional(s.enum(['sieve', 'multiples'], { description: '"sieve" Eratosthenovo síto (výchozí), "multiples" násobky a dělitelnost (NSN, NSD).' })),
  marked: s.optional(s.array(s.int({ min: 1, max: 200 }), { min: 1, max: 2, description: 'Jen pro "multiples": jedno nebo dvě čísla, jejichž násobky jsou na začátku vybarvené, např. [4, 6].' })),
}, { description: 'Tabulka čísel 1…n.' })
type P = Infer<typeof props>

const COLORS = ['var(--k-blue)', 'var(--k-orange)', 'var(--k-green)', 'var(--k-purple)', 'var(--k-pink)', 'var(--k-teal)']
const primesTo = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((k) => k > 1 && Array.from({ length: Math.floor(Math.sqrt(k)) - 1 }, (_, j) => j + 2).every((d) => k % d))
const divisors = (k: number) => Array.from({ length: k }, (_, i) => i + 1).filter((d) => k % d === 0)
const list = (xs: number[], max = 8) => (xs.length > max ? `${xs.slice(0, max).join(', ')}, …` : xs.join(', '))
const count = (n: number, one: string, few: string, many: string) => `${n} ${n === 1 ? one : n < 5 && n > 0 ? few : many}`

/** Arrow keys move focus in the 10-column table (one tab stop for the whole table). */
function useGridKeys(n: number) {
  const [focus, setFocus] = useState(1)
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = (e: KeyboardEvent) => {
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10, Home: 1 - focus, End: n - focus }[e.key]
    if (d === undefined) return
    e.preventDefault()
    const k = Math.min(n, Math.max(1, focus + d))
    setFocus(k)
    ref.current?.querySelector<HTMLButtonElement>(`[data-k="${k}"]`)?.focus()
  }
  return { focus, setFocus, ref, onKeyDown }
}

function Sieve({ n }: { n: number }) {
  const [done, setDone] = useState<number[]>([]) // primes whose multiples are crossed out, in order
  const [msg, setMsg] = useState('Začni násobky dvojky: klepni na 2 nebo na „Další prvočíslo“.')
  const keys = useGridKeys(n)
  // Which prime crossed each number out first (its smallest prime factor among `done`).
  const by = new Map<number, number>()
  for (const p of done) for (let m = 2 * p; m <= n; m += p) if (!by.has(m)) by.set(m, p)
  const free = (k: number) => k > 1 && !by.has(k) && !done.includes(k)
  const next = Array.from({ length: n }, (_, i) => i + 1).find(free)
  const finished = next === undefined || next * next > n
  const primes = finished ? Array.from({ length: n }, (_, i) => i + 1).filter((k) => k > 1 && !by.has(k)) : []

  const take = (p: number) => {
    const all = [...done, p]
    const crossed = Array.from({ length: Math.floor(n / p) - 1 }, (_, i) => (i + 2) * p).filter((m) => !by.has(m))
    setDone(all)
    const end = (() => { const nx = Array.from({ length: n }, (_, i) => i + 1).find((k) => k > 1 && !all.includes(k) && !crossed.includes(k) && !by.has(k)); return nx === undefined || nx * nx > n ? nx : null })()
    setMsg(`${p} je prvočíslo. Škrtám jeho násobky: ${list(crossed.length ? crossed : [], 6) || 'žádné nové'}.${end !== null ? ` Hotovo – ${end ? `${end} · ${end} = ${end * end} je víc než ${n}, takže ` : ''}zbylá čísla jsou prvočísla.` : ''}`)
  }
  const tap = (k: number) => {
    keys.setFocus(k)
    if (finished) { setMsg(k === 1 ? '1 není prvočíslo – má jen jednoho dělitele.' : by.has(k) ? `${k} = ${by.get(k)} · ${k / by.get(k)!}, není to prvočíslo.` : `${k} je prvočíslo – dělí ho jen 1 a ${k}.`); return }
    if (k === 1) return setMsg('1 není prvočíslo – má jen jednoho dělitele. Proto ji škrtáme hned.')
    if (done.includes(k)) return setMsg(`Násobky ${k} už jsou škrtnuté.`)
    if (by.has(k)) return setMsg(`${k} už je škrtnuté: ${k} = ${by.get(k)} · ${k / by.get(k)!}.`)
    const f = Array.from({ length: k - 2 }, (_, i) => i + 2).find((d) => k % d === 0)
    if (f) return setMsg(`${k} = ${f} · ${k / f} – nejdřív škrtni násobky ${f}.`)
    take(k)
  }

  const label = (k: number) => k === 1 ? '1, není prvočíslo' : done.includes(k) || primes.includes(k) ? `${k}, prvočíslo` : by.has(k) ? `${k}, škrtnuté – násobek ${by.get(k)}` : `${k}, zatím neškrtnuté`
  return (
    <>
      <div class="sieve-grid" ref={keys.ref} onKeyDown={keys.onKeyDown} role="group" aria-label={`Čísla 1 až ${n}`}>
        {Array.from({ length: n }, (_, i) => i + 1).map((k) => {
          const p = by.get(k), isPrime = done.includes(k) || primes.includes(k)
          const c = p ? COLORS[done.indexOf(p) % COLORS.length] : done.includes(k) ? COLORS[done.indexOf(k) % COLORS.length] : undefined
          return (
            <button key={k} data-k={k} tabIndex={k === keys.focus ? 0 : -1} aria-label={label(k)} onClick={() => tap(k)}
              class={`sieve-c ${k === 1 ? 'one' : ''} ${p ? 'out' : ''} ${isPrime ? 'prime' : ''} ${finished && primes.includes(k) && !done.includes(k) ? 'rest' : ''}`}
              style={c ? ({ '--sc': c } as Record<string, string>) : undefined}>{k}</button>
          )
        })}
      </div>
      <div class="val" aria-live="polite">{finished ? `Prvočísel do ${n}: ${primes.length}` : next ? `Další na řadě: ${next}` : ''}</div>
      <div class="sub" aria-live="polite">{msg}</div>
      <div class="ctrls">
        {!finished && <button class="reveal" onClick={() => next && take(next)}>Další prvočíslo</button>}
        {!finished && done.length > 0 && <button class="reveal" onClick={() => { const ps = primesTo(Math.floor(Math.sqrt(n))); setDone(ps); setMsg(`Škrtnuté násobky ${ps.join(', ')}. Zbylá čísla jsou prvočísla.`) }}>Dokončit</button>}
        {done.length > 0 && <button class="reveal" onClick={() => { setDone([]); setMsg('Začni násobky dvojky: klepni na 2 nebo na „Další prvočíslo“.') }}>Znovu</button>}
      </div>
    </>
  )
}

function Multiples({ n, marked }: { n: number; marked: number[] }) {
  const [sel, setSel] = useState<number[]>(marked)
  const keys = useGridKeys(n)
  const tap = (k: number) => {
    keys.setFocus(k)
    setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.length >= 2 ? [sel[1], k] : [...sel, k])
  }
  const [a, b] = sel
  const isM = (x: number | undefined, k: number) => x !== undefined && k % x === 0
  const lcm = a && b ? (a * b) / gcd(a, b) : 0
  const common = a && b ? Array.from({ length: Math.floor(n / lcm) }, (_, i) => (i + 1) * lcm) : []
  const label = (k: number) => [String(k), ...sel.filter((x) => k % x === 0).map((x) => `násobek ${x}`), ...(sel.includes(k) ? ['vybrané'] : [])].join(', ')

  return (
    <>
      <div class="sieve-grid" ref={keys.ref} onKeyDown={keys.onKeyDown} role="group" aria-label={`Čísla 1 až ${n}. Klepni na číslo a uvidíš jeho násobky.`}>
        {Array.from({ length: n }, (_, i) => i + 1).map((k) => {
          const ma = isM(a, k), mb = isM(b, k)
          return (
            <button key={k} data-k={k} tabIndex={k === keys.focus ? 0 : -1} aria-label={label(k)} aria-pressed={sel.includes(k)} onClick={() => tap(k)}
              class={`sieve-c ${ma && mb ? 'both' : ma ? 'ma' : mb ? 'mb' : ''} ${sel.includes(k) ? 'sel' : ''} ${k === lcm ? 'lcm' : ''}`}>{k}</button>
          )
        })}
      </div>
      <div aria-live="polite" class="sieve-info">
        {!a && <div class="sub">Klepni na číslo – vybarví se jeho násobky. Klepni na druhé a uvidíš společné násobky.</div>}
        {sel.map((x, i) => {
          const ms = Array.from({ length: Math.floor(n / x) }, (_, j) => (j + 1) * x)
          const ds = divisors(x)
          return (
            <div key={x} class="sieve-line">
              <i class={i ? 'mb' : 'ma'} />
              <span>Násobky {x}: {list(ms)} ({count(ms.length, 'číslo', 'čísla', 'čísel')} do {n}). Dělitelé {x}: {ds.join(', ')}{ds.length === 2 ? ' – je to prvočíslo' : ''}.</span>
            </div>
          )
        })}
        {a && b && (
          <>
            <div class="sieve-line"><i class="both" /><span>Společné násobky: {common.length ? list(common) : `žádný do ${n}`} → nejmenší společný násobek <b>n({a}, {b}) = {lcm}</b></span></div>
            <div class="sieve-line"><i class="none" /><span>Společní dělitelé: {divisors(gcd(a, b)).join(', ')} → největší společný dělitel <b>D({a}, {b}) = {gcd(a, b)}</b>{gcd(a, b) === 1 ? ' – čísla jsou nesoudělná' : ''}</span></div>
          </>
        )}
      </div>
      {sel.length > 0 && <div class="ctrls"><button class="reveal" onClick={() => setSel([])}>Zrušit výběr</button></div>}
    </>
  )
}

function PrimeSieve({ n, mode, marked }: P) {
  const [m, setM] = useState(mode ?? 'sieve')
  return (
    <div class="w prime-sieve">
      <div class="chips" role="group" aria-label="Režim">
        <button class={`chip ${m === 'sieve' ? 'sel' : ''}`} aria-pressed={m === 'sieve'} onClick={() => setM('sieve')}>Síto</button>
        <button class={`chip ${m === 'multiples' ? 'sel' : ''}`} aria-pressed={m === 'multiples'} onClick={() => setM('multiples')}>Násobky a dělitelé</button>
      </div>
      {m === 'sieve' ? <Sieve n={n} /> : <Multiples n={n} marked={(marked ?? []).filter((k) => k <= n)} />}
    </div>
  )
}

export default defineWidget({
  name: 'prime-sieve',
  title: 'Eratosthenovo síto',
  summary: 'Tabulka čísel 1…n. V sítu dítě postupně škrtá násobky 2, 3, 5, 7… (tlačítkem nebo klepnutím) a zbydou prvočísla. V režimu násobků klepnutím vybarví násobky jednoho nebo dvou čísel a vidí společné násobky, nejmenší společný násobek i největšího společného dělitele.',
  use: 'Prvočísla a čísla složená, násobky a dělitelé, znaky dělitelnosti, nejmenší společný násobek a největší společný dělitel (6.–7. třída).',
  props,
  examples: [
    { title: 'Síto do 100', props: { n: 100 } },
    { title: 'Společné násobky 4 a 6', props: { n: 60, mode: 'multiples', marked: [4, 6] } },
    { title: 'Síto do 200', props: { n: 200 } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.marked && p.mode !== 'multiples') e.push('marked works only with mode "multiples"')
    for (const k of p.marked ?? []) if (k > p.n) e.push(`marked: ${k} is more than n (${p.n})`)
    if (p.marked && new Set(p.marked).size !== p.marked.length) e.push('marked: duplicates')
    return e
  },
  Component: PrimeSieve,
  html: (p) => {
    const ps = primesTo(p.n)
    return `<p>Prvočísla do ${p.n} (${ps.length}): ${ps.join(', ')}.</p>`
  },
})
