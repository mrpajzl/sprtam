import type { Question } from '../content/types'

// Procedural maths questions so practice never runs out.
// A topic opts in with `"generator": "<name>"` (content/topics/…/<topic>.json).

const r = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const fmt = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',')
type Input = Extract<Question, { type: 'input' }>
const num = (question: string, a: number, explanation?: string, hints?: string[]): Input => ({ type: 'input', question, answers: [fmt(a)], explanation, ...(hints ? { hints } : {}) })
/** A written-arithmetic question: the problem is shown „pod sebou“ above the answer field (widget column). */
const written = (q: Input, a: number, b: number, op: '+' | '-' | '·' | ':'): Input => ({ ...q, widget: { widget: 'column', props: { a, b, op } } })

function choiceOf(q: string, correct: string, wrong: string[], why?: string): Question {
  const o = [correct, ...Array.from(new Set(wrong.filter((w) => w !== correct))).slice(0, 3)]
  const shuffled = [...o].sort(() => Math.random() - 0.5)
  return { type: 'choice', question: q, options: shuffled, answer: shuffled.indexOf(correct), explanation: why }
}

const sp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// Convert between two units in either direction, with decimals.
function convert(units: [string, string, number][]): Question {
  const [big, small, f] = pick(units)
  if (Math.random() < 0.5) {
    const n = r(1, 99) / 10
    return num(`${fmt(n)} ${big} = ? ${small}`, n * f, `1 ${big} = ${sp(f)} ${small}, na menší jednotku násobím: ${fmt(n)} · ${sp(f)}`, [`Kolik ${small} je 1 ${big}?`, `Na menší jednotku násobíš: ${fmt(n)} · ${sp(f)}.`])
  }
  const n = r(1, f >= 1000 ? 9999 : 999)
  return num(`${sp(n)} ${small} = ? ${big}`, n / f, `1 ${big} = ${sp(f)} ${small}, na větší jednotku dělím: ${sp(n)} : ${sp(f)}`, [`Kolik ${small} je 1 ${big}?`, `Na větší jednotku dělíš: ${sp(n)} : ${sp(f)}.`])
}

export const GENERATORS: Record<string, () => Question> = {
  add10: () => { const a = r(0, 10); const b = r(0, 10 - a); return num(`${a} + ${b} =`, a + b) },
  sub10: () => { const a = r(0, 10); const b = r(0, a); return num(`${a} − ${b} =`, a - b) },
  add20: () => { const a = r(2, 18); const b = r(1, 20 - a); return num(`${a} + ${b} =`, a + b, undefined, a < 10 && a + b > 10 ? [`Nejdřív doplň ${a} do 10: přičti ${10 - a}.`, `Zbývá přičíst ještě ${b - (10 - a)}.`] : undefined) },
  sub20: () => { const a = r(5, 20); const b = r(1, a); return num(`${a} − ${b} =`, a - b, undefined, a > 10 && a - b < 10 ? [`Nejdřív odečti ${a - 10}, ať jsi na 10.`, `Zbývá odečíst ještě ${b - (a - 10)}.`] : undefined) },
  add100: () => { const a = r(10, 90); const b = r(1, 100 - a); return num(`${a} + ${b} =`, a + b) },
  sub100: () => { const a = r(20, 100); const b = r(1, a); return num(`${a} − ${b} =`, a - b) },
  add1000: () => { const a = r(100, 800); const b = r(10, 1000 - a); return pick([written(num(`Vypočítej písemně: ${a} + ${b} =`, a + b), a, b, '+'), written(num(`Vypočítej písemně: ${a + b} − ${b} =`, a), a + b, b, '-')]) },
  'mul-table': () => { const a = r(1, 10); const b = r(1, 10); return num(`${a} · ${b} =`, a * b, undefined, a > 1 && b > 1 ? [`${a} · ${b} je ${a}krát ${b}: ${Array(Math.min(a, 3)).fill(b).join(' + ')}${a > 3 ? ' + …' : ''}`, `Pomůže, když víš ${a - 1} · ${b} = ${(a - 1) * b}. Přidej ještě jednou ${b}.`] : undefined) },
  'div-table': () => { const a = r(1, 10); const b = r(1, 10); return num(`${a * b} : ${b} =`, a, undefined, [`Kolikrát ${b} je ${a * b}? Hledej v násobilce ${b}.`]) },
  'written-mul': () => { const a = r(12, 999); const b = r(2, 9); return written(num(`Vypočítej písemně: ${a} · ${b} =`, a * b, 'Násob od jednotek, co přeteče, si pamatuj.', ['Začni vpravo: jednotky krát ' + b + '.', 'Píšeš jen jednotky výsledku, desítky si pamatuješ a přičteš k dalšímu násobku.']), a, b, '·') },
  'written-div': () => { const b = r(2, 9); const a = r(11, 120); return written(num(`Vypočítej písemně: ${a * b} : ${b} =`, a, undefined, [`Začni zleva: kolikrát se ${b} vejde do první číslice (nebo prvních dvou)?`, 'Zbytek napiš pod, připiš další číslici a děl znovu.']), a * b, b, ':') },
  round: () => {
    const n = r(101, 9999); const to = pick([10, 100])
    return num(`Zaokrouhli ${n} na ${to === 10 ? 'desítky' : 'stovky'}.`, Math.round(n / to) * to, '0–4 dolů, 5–9 nahoru.', [`Podívej se na číslici hned za ${to === 10 ? 'desítkami (jednotky)' : 'stovkami (desítky)'}.`, '0–4 zaokrouhlíš dolů, 5–9 nahoru.'])
  },
  compare: () => {
    const a = r(0, 1000); const b = r(0, 1000)
    return choiceOf(`${a} ? ${b}`, a > b ? '>' : a < b ? '<' : '=', ['<', '>', '='])
  },
  'frac-of': () => { const d = pick([2, 3, 4, 5, 10]); const n = r(1, d - 1); const k = r(2, 10) * d; return num(`Kolik je ${n}/${d} z ${k}?`, (k / d) * n, `Vyděl jmenovatelem (${k} : ${d}) a vynásob čitatelem.`, [`Nejdřív najdi 1/${d} z ${k}: ${k} : ${d}.`, `Pak to vezmi ${n}krát.`]) },
  'frac-add': () => {
    const d = pick([3, 4, 5, 6, 8, 10]); const a = r(1, d - 1); const b = r(1, d - a)
    return { type: 'input', question: `${a}/${d} + ${b}/${d} =`, answers: [`${a + b}/${d}`, ...(gcd(a + b, d) > 1 ? [`${(a + b) / gcd(a + b, d)}/${d / gcd(a + b, d)}`] : []), ...((a + b) === d ? ['1'] : [])], explanation: 'Stejný jmenovatel: sečti jen čitatele.', hints: ['Oba zlomky mají stejný jmenovatel.', `Sečti jen čitatele, jmenovatel ${d} opiš.`] }
  },
  'frac-simplify': () => {
    const d0 = pick([2, 3, 4, 5, 7]); const n0 = r(1, d0 - 1); const k = r(2, 6)
    if (gcd(n0, d0) !== 1) return GENERATORS['frac-simplify']()
    return { type: 'input', question: `Zkrať na základní tvar: ${n0 * k}/${d0 * k}`, answers: [`${n0}/${d0}`], explanation: `Vyděl čitatele i jmenovatele číslem ${k}.`, hints: ['Najdi číslo, kterým jde vydělit čitatel i jmenovatel.', `Zkus to s číslem ${k}.`] }
  },
  decimal: () => { const a = r(1, 999) / 10; const b = r(1, 999) / 100; return pick([num(`${fmt(a)} + ${fmt(b)} =`, a + b), num(`${fmt(a + b)} − ${fmt(b)} =`, a)]) },
  percent: () => { const p = pick([5, 10, 20, 25, 30, 40, 50, 75]); const z = pick([40, 80, 120, 200, 360, 500, 800]); return num(`Kolik je ${p} % z ${z}?`, (z * p) / 100, `1 % = ${fmt(z / 100)}, pak · ${p}.`, [`Nejdřív spočítej 1 %: ${z} : 100.`, `Pak to vynásob ${p}.`]) },
  integers: () => {
    const a = r(-12, 12); const b = r(-12, 12); const op = pick(['+', '−', '·'])
    const res = op === '+' ? a + b : op === '−' ? a - b : a * b
    const s = (n: number) => (n < 0 ? `(${n})` : String(n))
    return num(`${s(a)} ${op} ${s(b)} =`, res, op === '·' ? 'Mínus krát mínus je plus.' : 'Odečíst záporné číslo = přičíst kladné.', op === '·' ? ['Nejdřív vynásob čísla bez znamének.', 'Znaménko: stejná znaménka dají plus, různá mínus.'] : op === '−' && b < 0 ? ['Odečíst záporné číslo je totéž jako přičíst kladné.'] : ['Představ si číselnou osu: plus jde doprava, mínus doleva.'])
  },
  power: () => { const a = r(2, 12); const e = a <= 5 ? pick([2, 3]) : 2; return num(`${a}${e === 2 ? '²' : '³'} =`, a ** e) },
  sqrt: () => { const a = r(1, 20); return num(`√${a * a} =`, a, undefined, [`Hledáš číslo, které vynásobené samo sebou dá ${a * a}.`]) },
  'linear-eq': () => {
    const x = r(-9, 9); const a = pick([2, 3, 4, 5, -2, -3]); const b = r(-10, 10); const c = a * x + b
    return num(`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}, x =`, x, `Odečti ${b} od obou stran, pak vyděl ${a}.`, [...(b ? [`Nejdřív se zbav „${b < 0 ? '−' : '+'} ${Math.abs(b)}“ na levé straně: ${b < 0 ? 'přičti' : 'odečti'} ${Math.abs(b)} na obou stranách.`] : []), `Zbude ${a}x = ${c - b}. Vyděl obě strany číslem ${a}.`])
  },
  pythagoras: () => {
    const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]])
    return pick([num(`Odvěsny ${a} a ${b}. Přepona c =`, c, `c² = ${a}² + ${b}² = ${c * c}`, ['c² = a² + b²', `${a}² + ${b}² = ${a * a + b * b}. Odmocni.`]), num(`Přepona ${c}, odvěsna ${a}. Druhá odvěsna =`, b, `b² = ${c}² − ${a}²`, ['b² = c² − a²', `${c}² − ${a}² = ${c * c - a * a}. Odmocni.`])])
  },
  'perimeter-area': () => {
    const a = r(2, 15); const b = r(2, 15)
    return pick([num(`Obdélník ${a} cm × ${b} cm. Obvod (cm) =`, 2 * (a + b), 'o = 2 · (a + b)', ['Obvod je délka všech čtyř stran dohromady.', 'o = 2 · (a + b)']), num(`Obdélník ${a} cm × ${b} cm. Obsah (cm²) =`, a * b, 'S = a · b', ['Obsah = kolik čtverečků 1 cm × 1 cm se vejde dovnitř.', 'S = a · b']), num(`Čtverec se stranou ${a} cm. Obsah (cm²) =`, a * a, 'S = a · a', ['S = a · a'])])
  },
  circle: () => { const rr = r(1, 10); return pick([num(`Kruh r = ${rr} cm. Obsah (π = 3,14) =`, 3.14 * rr * rr, 'S = π · r²', ['S = π · r²', `r² = ${rr * rr}, vynásob 3,14.`]), num(`Kružnice r = ${rr} cm. Obvod (π = 3,14) =`, 2 * 3.14 * rr, 'o = 2 · π · r', ['o = 2 · π · r', `2 · ${rr} = ${2 * rr}, vynásob 3,14.`])]) },
  units: () => {
    const [q, f, why] = pick<[string, number, string]>([
      ['m na cm', 100, '1 m = 100 cm'], ['km na m', 1000, '1 km = 1 000 m'], ['kg na g', 1000, '1 kg = 1 000 g'],
      ['l na ml', 1000, '1 l = 1 000 ml'], ['h na min', 60, '1 h = 60 min'], ['dm na mm', 100, '1 dm = 100 mm'],
    ])
    const n = r(2, 15)
    return num(`Převeď ${n} ${q.split(' na ')[0]} na ${q.split(' na ')[1]}.`, n * f, why)
  },
  'units-dec': () => {
    if (Math.random() < 0.2) {
      const [h, why] = pick<[number, string]>([[0.25, 'čtvrt hodiny'], [0.5, 'půl hodiny'], [0.75, 'tři čtvrtě hodiny'], [1.5, 'hodina a půl'], [2.5, 'dvě a půl hodiny']])
      return num(`${fmt(h)} h = ? min`, h * 60, `${why}: ${fmt(h)} · 60`)
    }
    return convert([['km', 'm', 1000], ['m', 'cm', 100], ['m', 'dm', 10], ['cm', 'mm', 10], ['m', 'mm', 1000], ['t', 'kg', 1000], ['kg', 'g', 1000], ['g', 'mg', 1000], ['hl', 'l', 100], ['l', 'dl', 10], ['l', 'ml', 1000]])
  },
  volume: () => {
    if (Math.random() < 0.3) { const a = r(2, 10); const b = r(2, 10); const c = r(2, 10); return num(`Kvádr ${a} cm × ${b} cm × ${c} cm. Objem (cm³) =`, a * b * c, 'V = a · b · c') }
    return convert([['m³', 'dm³', 1000], ['dm³', 'cm³', 1000], ['cm³', 'mm³', 1000], ['l', 'ml', 1000], ['hl', 'l', 100], ['m³', 'l', 1000], ['l', 'cm³', 1000]])
  },
  ratio: () => { const a = r(1, 5); const b = r(1, 5); const k = r(2, 8); return num(`Rozděl ${(a + b) * k} v poměru ${a} : ${b}. Větší díl =`, Math.max(a, b) * k, `Jeden díl = ${(a + b) * k} : ${a + b} = ${k}`, [`Kolik je dílů dohromady? ${a} + ${b} = ${a + b}.`, `Jeden díl = ${(a + b) * k} : ${a + b}. Větší část má ${Math.max(a, b)} dílů.`]) },
  expressions: () => { const a = r(2, 9); const b = r(1, 9); const x = r(-5, 5); return num(`Dosaď x = ${x} do ${a}x + ${b}`, a * x + b, undefined, [`${a}x znamená ${a} · x. Místo x napiš ${x < 0 ? `(${x})` : x}.`, 'Nejdřív násob, pak sčítej.']) },
  quadratic: () => {
    const x1 = r(-6, 6); const x2 = r(-6, 6); const b = -(x1 + x2); const c = x1 * x2
    const t = (n: number, s: string) => (n === 0 ? '' : `${n < 0 ? ' − ' : ' + '}${Math.abs(n) === 1 && s ? '' : Math.abs(n)}${s}`)
    return num(`x²${t(b, 'x')}${t(c, '')} = 0. Větší kořen x =`, Math.max(x1, x2), `Vietovy vzorce: x₁ + x₂ = ${-b}, x₁ · x₂ = ${c}`, ['Hledej dvě čísla: jejich součet je minus koeficient u x, součin je absolutní člen.', `x₁ + x₂ = ${-b}, x₁ · x₂ = ${c}`])
  },
  log: () => { const b = pick([2, 3, 10]); const e = r(0, b === 10 ? 4 : 6); return num(`log${b === 10 ? '' : '_' + b} ${b ** e} =`, e) },
}

export const GENERATOR_NAMES = Object.keys(GENERATORS)
