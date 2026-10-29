import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

// Saving (simple or compound interest, credited once a year, optional monthly deposits and the
// 15 % Czech withholding tax on interest) and an annuity loan (monthly payments).
//   compound:   K_n = K_0 · (1 + i)^n
//   simple:     K_n = K_0 · (1 + n · i)
//   monthly deposits M at the start of each month earn M · i · 6,5 within the year
//   (12 + 11 + … + 1 months = 78 months, 78 / 12 = 6,5), the Czech textbook formula.
//   annuity:    a = J · q^n · (q − 1) / (q^n − 1), q = 1 + i / 12, n = 12 · years

const props = s.object({
  mode: s.enum(['spoření', 'úvěr'], { description: 'Co se počítá na začátku: spoření (vklad roste o úroky) nebo úvěr (půjčka splácená měsíčně). Dítě může přepnout.' }),
  amount: s.number({ min: 0, max: 50000000, description: 'Vklad (u spoření) nebo jistina, tedy půjčená částka (u úvěru), v Kč.' }),
  rate: s.number({ min: 0, max: 30, description: 'Roční úroková sazba v procentech (p. a.), např. 3,5.' }),
  years: s.int({ min: 1, max: 40, description: 'Doba v letech.' }),
  monthly: s.optional(s.number({ min: 0, max: 100000, description: 'Jen spoření: měsíční vklad v Kč (vkládá se na začátku každého měsíce). Výchozí 0.' })),
  compound: s.optional(s.boolean({ description: 'Jen spoření: true = složené úročení (úroky se přičítají a dál se úročí), false = jednoduché. Výchozí true.' })),
  tax: s.optional(s.boolean({ description: 'Jen spoření: na začátku zapnout srážkovou daň 15 % z úroků (ČR). Výchozí false.' })),
})
type P = Infer<typeof props>

const nf0 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf6 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 6 })
/** 115927.4 → „115 927 Kč“ (spaces between thousands). */
const kc = (x: number) => `${nf0.format(Math.round(x) || 0)} Kč`
const kc2 = (x: number) => `${nf2.format(x)} Kč`
const num = (x: number) => nf6.format(x)
const TAX = 0.15

interface Year { dep: number; int: number; tax: number }

/** Balance after each year (index 0 = the start). */
export function saving(K0: number, ratePct: number, years: number, M = 0, compound = true, tax = false): Year[] {
  const i = ratePct / 100
  let dep = K0, int = 0, paid = 0
  const out: Year[] = [{ dep, int, tax: 0 }]
  for (let y = 1; y <= years; y++) {
    const base = compound ? dep + int : dep
    const gross = base * i + M * i * 6.5
    const t = tax ? gross * TAX : 0
    int += gross - t; paid += t; dep += 12 * M
    out.push({ dep, int, tax: paid })
  }
  return out
}

/** Monthly annuity payment. */
export function annuity(J: number, ratePct: number, years: number) {
  const n = 12 * years, q = 1 + ratePct / 100 / 12
  return ratePct === 0 ? J / n : (J * q ** n * (q - 1)) / (q ** n - 1)
}

const answer = (p: P) => (p.mode === 'úvěr' ? annuity(p.amount, p.rate, p.years) : (() => { const r = saving(p.amount, p.rate, p.years, p.monthly ?? 0, p.compound ?? true, p.tax ?? false).at(-1)!; return r.dep + r.int })())
const parse = (v: string) => Number(v.replace(/[\s ]|Kč/g, '').replace(',', '.').replace('−', '-'))

function Range({ name, value, set, min, max, step, show }: { name: string; value: number; set: (n: number) => void; min: number; max: number; step: number; show: string }) {
  return (
    <label class="interest-sl">
      <span>{name}</span>
      <output>{show}</output>
      <input type="range" min={min} max={max} step={step} value={value} aria-valuetext={show} onInput={(e) => set(Number(e.currentTarget.value))} />
    </label>
  )
}

function Toggle<T extends string>({ label, value, set, options }: { label: string; value: T; set: (v: T) => void; options: [T, string][] }) {
  return (
    <div class="chips interest-chips" role="group" aria-label={label}>
      {options.map(([v, t]) => <button key={v} class={`chip ${v === value ? 'sel' : ''}`} aria-pressed={v === value} onClick={() => set(v)}>{t}</button>)}
    </div>
  )
}

/** A slider maximum that fits the author's value: 1, 2 or 5 · 10^k. */
const niceMax = (x: number, least: number) => { let m = least; while (m < x) m *= String(m)[0] === '2' ? 2.5 : 2; return m }
const yrs = (n: number) => `${n} ${n === 1 ? 'rok' : n < 5 ? 'roky' : 'let'}`
const after = (n: number) => `${n} ${n === 1 ? 'roce' : 'letech'}`

function Interest(p: P) {
  const [mode, setMode] = useState(p.mode)
  const [amount, setAmount] = useState(p.amount)
  const [rate, setRate] = useState(p.rate)
  const [years, setYears] = useState(p.years)
  const [monthly, setMonthly] = useState(p.monthly ?? 0)
  const [compound, setCompound] = useState(p.compound ?? true)
  const [tax, setTax] = useState(p.tax ?? false)
  const maxAmount = niceMax(p.amount, mode === 'úvěr' ? 5000000 : 1000000)
  const amountStep = maxAmount >= 5000000 ? 50000 : maxAmount >= 1000000 ? 10000 : 1000
  return (
    <div class="w interest">
      <Toggle label="Režim" value={mode} set={setMode} options={[['spoření', 'Spoření'], ['úvěr', 'Úvěr']]} />
      {mode === 'spoření'
        ? <Saving {...{ amount, rate, years, monthly, compound, tax }} />
        : <Loan {...{ amount, rate, years }} />}
      <div class="interest-ctrls">
        <Range name={mode === 'úvěr' ? 'Půjčím si' : 'Vklad'} value={amount} set={setAmount} min={0} max={maxAmount} step={amountStep} show={kc(amount)} />
        {mode === 'spoření' && <Range name="Měsíčně vkládám" value={monthly} set={setMonthly} min={0} max={niceMax(p.monthly ?? 0, 10000)} step={100} show={kc(monthly)} />}
        <Range name="Úrok ročně" value={rate} set={setRate} min={0} max={Math.max(15, Math.ceil(p.rate))} step={0.1} show={`${fmt(rate)} %`} />
        <Range name="Doba" value={years} set={setYears} min={1} max={mode === 'úvěr' ? 30 : 40} step={1} show={yrs(years)} />
      </div>
      {mode === 'spoření' && (
        <div class="interest-opts">
          <Toggle label="Úročení" value={compound ? 'c' : 's'} set={(v) => setCompound(v === 'c')} options={[['c', 'Složené'], ['s', 'Jednoduché']]} />
          <Toggle label="Daň z úroků" value={tax ? 'y' : 'n'} set={(v) => setTax(v === 'y')} options={[['n', 'Bez daně'], ['y', 'Daň 15 %']]} />
        </div>
      )}
    </div>
  )
}

function Saving({ amount, rate, years, monthly, compound, tax }: { amount: number; rate: number; years: number; monthly: number; compound: boolean; tax: boolean }) {
  const rows = saving(amount, rate, years, monthly, compound, tax)
  const last = rows[years], total = last.dep + last.int
  const i = rate / 100, ie = tax ? i * (1 - TAX) : i
  const top = Math.max(1, ...rows.map((r) => r.dep + r.int))
  const W = 320, H = 150, L = 4, B = 18, bw = (W - L) / (years + 1)
  const Y = (v: number) => ((H - B - 6) * v) / top
  const iName = tax ? <>i<sub>č</sub></> : 'i'
  return (
    <>
      <div class="val" aria-live="polite">Po {after(years)}: {kc(total)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Zůstatek po letech: vloženo ${kc(last.dep)}, úroky ${kc(last.int)}`}>
        <line x1={L} x2={W} y1={H - B} y2={H - B} stroke="var(--ink-3)" stroke-width="1.5" />
        {rows.map((r, k) => {
          const x = L + k * bw + bw * 0.15, w = bw * 0.7, hd = Y(r.dep), hi = Y(r.int)
          return (
            <g key={k}>
              <rect x={x} y={H - B - hd} width={w} height={hd} fill="var(--accent-soft)" stroke="var(--accent)" stroke-width={bw > 10 ? 1 : 0} />
              <rect x={x} y={H - B - hd - hi} width={w} height={hi} fill="var(--accent)" style={{ transition: 'height 0.15s, y 0.15s' }} />
            </g>
          )
        })}
        {[0, ...(years > 4 ? [Math.round(years / 2)] : []), years].map((k) => <text key={k} x={k === years ? W - 2 : L + k * bw + bw / 2} y={H - 4} text-anchor={k === years ? 'end' : 'middle'} font-size="10" font-weight="700" fill="var(--ink-2)">{k === years ? `${k}. rok` : k}</text>)}
      </svg>
      <div class="interest-legend">
        <span><i class="interest-dep" />vloženo {kc(last.dep)}</span>
        <span><i class="interest-int" />úroky {kc(last.int)}</span>
      </div>
      <div class="interest-calc">
        <div>{fmt(rate)} % ročně: i = {num(i)}</div>
        {tax && <div>Banka strhne 15 % z úroků: i<sub>č</sub> = {num(i)} · 0,85 = {num(ie)}</div>}
        {monthly === 0 && compound && <div>K = K₀ · (1 + {iName})<sup>n</sup> = {nf0.format(amount)} · {num(1 + ie)}<sup>{years}</sup> = <b>{kc(total)}</b></div>}
        {monthly === 0 && !compound && <div>K = K₀ · (1 + n · {iName}) = {nf0.format(amount)} · (1 + {years} · {num(ie)}) = <b>{kc(total)}</b></div>}
        {monthly > 0 && <>
          <div>Každý rok: {compound ? <>K = K · (1 + {iName}) + 12 · M + M · {iName} · 6,5</> : <>úrok = vloženo · {iName} + M · {iName} · 6,5</>}</div>
          <div class="interest-note">M = {kc(monthly)}. Vklad na začátku měsíce leží na účtu průměrně 6,5 měsíce.</div>
          <div>Vloženo {nf0.format(amount)} + {years} · 12 · {nf0.format(monthly)} = {kc(last.dep)}, s úroky <b>{kc(total)}</b></div>
        </>}
        {!compound && <div class="interest-note">Jednoduché úročení: úrok se počítá jen z vložených peněz, úroky se dál neúročí.</div>}
        {tax && <div class="interest-note">Na dani zaplatíš {kc(last.tax)} (srážková daň z úroků v ČR, 2026).</div>}
      </div>
    </>
  )
}

function Loan({ amount, rate, years }: { amount: number; rate: number; years: number }) {
  const n = 12 * years, q = 1 + rate / 100 / 12
  const a = Math.round(annuity(amount, rate, years) * 100) / 100
  const total = a * n, over = total - amount
  const rows: { int: number; princ: number; left: number }[] = []
  let left = amount
  for (let k = 0; k < Math.min(6, n); k++) {
    const int = Math.round(left * (q - 1) * 100) / 100
    const princ = Math.min(left, a - int)
    left -= princ
    rows.push({ int, princ, left })
  }
  const share = total > 0 ? amount / total : 1
  return (
    <>
      <div class="val" aria-live="polite">Splátka {kc2(a)} měsíčně</div>
      <div class="interest-bar" role="img" aria-label={`Zaplatíš ${kc(total)}: jistina ${kc(amount)}, přeplatek ${kc(over)}`}>
        <span class="interest-dep" style={{ width: `${share * 100}%` }} />
        <span class="interest-int" style={{ width: `${(1 - share) * 100}%` }} />
      </div>
      <div class="interest-legend">
        <span><i class="interest-dep" />jistina {kc(amount)}</span>
        <span><i class="interest-int" />přeplatek {kc(over)}</span>
      </div>
      <div class="interest-calc">
        {rate > 0
          ? <>
            <div>q = 1 + {fmt(rate)} % : 12 = {num(Math.round(q * 1e6) / 1e6)}, n = 12 · {years} = {n}</div>
            <div>a = J · q<sup>n</sup> · (q − 1) / (q<sup>n</sup> − 1) = <b>{kc2(a)}</b></div>
          </>
          : <div>Bez úroku: a = J : n = {nf0.format(amount)} : {n} = <b>{kc2(a)}</b></div>}
        <div>Celkem zaplatíš: {n} · {kc2(a)} = <b>{kc(total)}</b></div>
        <div>Přeplatek: {kc(total)} − {kc(amount)} = <b>{kc(over)}</b></div>
      </div>
      <table class="interest-table">
        <caption>První splátky (Kč)</caption>
        <thead><tr><th>Měsíc</th><th>Úrok</th><th>Úmor</th><th>Zbývá</th></tr></thead>
        <tbody>{rows.map((r, k) => <tr key={k}><td>{k + 1}.</td><td>{nf2.format(r.int)}</td><td>{nf2.format(r.princ)}</td><td>{nf0.format(Math.round(r.left))}</td></tr>)}</tbody>
      </table>
      <div class="interest-note">Úrok = zbývající dluh · {fmt(rate)} % : 12. Úmor = splátka − úrok, o tolik dluh klesne.</div>
    </>
  )
}

const task = (p: P) => p.mode === 'úvěr'
  ? [`Úvěr ${kc(p.amount)}`, `úrok ${fmt(p.rate)} % ročně`, yrs(p.years), 'měsíční anuitní splátky']
  : [`Vklad ${kc(p.amount)}`, ...(p.monthly ? [`měsíčně ${kc(p.monthly)}`] : []), `úrok ${fmt(p.rate)} % ročně`, yrs(p.years), (p.compound ?? true) ? 'složené úročení' : 'jednoduché úročení', (p.tax ?? false) ? 'daň z úroků 15 %' : 'bez daně']

export default defineWidget({
  name: 'interest',
  title: 'Úrok, spoření a úvěr',
  summary: 'Spoření: vklad, úrok a doba, graf zůstatku po letech (vloženo a úroky), jednoduché i složené úročení, měsíční vklady a daň z úroků. Úvěr: anuitní splátka, celkem zaplaceno, přeplatek a první splátky rozdělené na úrok a úmor. Vzorce jsou rozepsané.',
  use: 'Finanční gramotnost (8.–9. třída), ekonomika a matematika na SŠ: úrok, jednoduché a složené úročení, spoření, úvěr, anuitní splátka a přeplatek.',
  props,
  examples: [
    { title: 'Spoření 10 000 Kč na 3 %', props: { mode: 'spoření', amount: 10000, rate: 3, years: 10 } },
    { title: 'Měsíčně 1 000 Kč, s daní', props: { mode: 'spoření', amount: 0, rate: 4, years: 15, monthly: 1000, tax: true } },
    { title: 'Hypotéka 3 000 000 Kč', props: { mode: 'úvěr', amount: 3000000, rate: 5, years: 25 } },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.mode === 'úvěr') {
      if (p.amount <= 0) e.push('a loan needs amount > 0')
      if (p.years > 30) e.push('a loan can last at most 30 years (the slider ends there)')
      if (p.monthly !== undefined || p.compound !== undefined || p.tax !== undefined) e.push('monthly, compound and tax only apply to saving')
    } else if (p.amount <= 0 && !p.monthly) e.push('saving needs amount or monthly > 0')
    return e
  },
  Component: Interest,
  Question: (p) => (
    <div class="w">
      <div class="interest-task">{task(p).map((t) => <span key={t}>{t}</span>)}</div>
    </div>
  ),
  checkQuestion: (p, answers) => {
    const want = answer(p)
    return answers.some((v) => Math.abs(parse(v) - want) <= 1) ? [] : [`the ${p.mode === 'úvěr' ? 'monthly payment' : 'final balance'} ${Math.round(want * 100) / 100} is not among the answers (±1 Kč)`]
  },
  html: (p) => `<p>${task(p).join(', ')}: ${p.mode === 'úvěr'
    ? `měsíční splátka ${kc2(answer(p))}, celkem ${kc(answer(p) * 12 * p.years)}. Vzorec anuity: a = J · qⁿ · (q − 1) / (qⁿ − 1), q = 1 + i / 12.`
    : `po ${after(p.years)} ${kc(answer(p))}. ${(p.compound ?? true) ? 'Složené úročení: K = K₀ · (1 + i)ⁿ.' : 'Jednoduché úročení: K = K₀ · (1 + n · i).'}`}</p>`,
})
