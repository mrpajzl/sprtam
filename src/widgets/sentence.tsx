import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const props = s.object({
  set: s.enum(['clauses', 'pos', 'cases', 'custom'], {
    description: 'Sada kategorií: "clauses" = větné členy (Po, Př, Pt, Pu, Pk, Dop), "pos" = slovní druhy 1–10, "cases" = pády 1–7, "custom" = vlastní seznam v categories.',
  }),
  categories: s.optional(s.array(s.object({
    name: s.string({ description: 'Název kategorie, např. „vlastní jméno“.' }),
    short: s.optional(s.string({ description: 'Zkratka pod slovem, např. „VJ“. Bez ní se použije název.' })),
    hint: s.optional(s.string({ description: 'Nápověda, když dítě kategorii použije špatně, např. „Vlastní jména píšeme s velkým písmenem.“' })),
  }), { min: 2, max: 10, description: 'Jen pro set "custom": vlastní kategorie.' })),
  words: s.array(s.object({
    text: s.string({ description: 'Slovo nebo úsek věty (např. „do školy“). Interpunkci připoj ke slovu („lesa.“).' }),
    cat: s.optional(s.string({ description: 'Správná kategorie: název („podmět“, „sloveso“, „3. pád“) nebo zkratka („Po“; u slovních druhů číslo 1–10, u pádů 1–7). Bez cat se slovo neurčuje (např. předložka u větných členů).' })),
    hint: s.optional(s.string({ description: 'Vlastní nápověda k tomuto slovu, když ho dítě zařadí špatně.' })),
    head: s.optional(s.int({ min: 0, max: 29, description: 'Pořadí řídícího slova ve words (od 0). Ukáže skladební dvojici, např. přívlastek → podstatné jméno, které rozvíjí.' })),
    ask: s.optional(s.string({ description: 'Otázka od řídícího slova k tomuto, např. „jaký?“, „kdy?“. Jen spolu s head.' })),
  }), { min: 2, max: 30, description: 'Slova věty zleva doprava.' }),
})
type P = Infer<typeof props>

interface Cat { name: string; short: string; hint: string }

const SETS: Record<Exclude<P['set'], 'custom'>, Cat[]> = {
  clauses: [
    { name: 'podmět', short: 'Po', hint: 'Podmět je ten, kdo děj koná nebo o kom se mluví. Ptáš se: kdo? co?' },
    { name: 'přísudek', short: 'Př', hint: 'Přísudek říká, co podmět dělá nebo jaký je. Ptáš se: co dělá? co se s ním děje?' },
    { name: 'předmět', short: 'Pt', hint: 'Předmět rozvíjí sloveso. Ptáš se pádovou otázkou: koho? čeho? komu? čemu? koho? co? o kom? s kým?' },
    { name: 'příslovečné určení', short: 'Pu', hint: 'Příslovečné určení rozvíjí sloveso a říká kde, kdy, jak, proč.' },
    { name: 'přívlastek', short: 'Pk', hint: 'Přívlastek rozvíjí podstatné jméno. Ptáš se: jaký? který? čí?' },
    { name: 'doplněk', short: 'Dop', hint: 'Doplněk závisí na slovese i na podstatném jménu zároveň („Vrátil se unavený.“).' },
  ],
  pos: [
    { name: 'podstatné jméno', short: '1', hint: 'Podstatná jména jsou názvy osob, zvířat, věcí, vlastností a dějů. Kdo? Co?' },
    { name: 'přídavné jméno', short: '2', hint: 'Přídavná jména vyjadřují vlastnosti. Jaký? Který? Čí?' },
    { name: 'zájmeno', short: '3', hint: 'Zájmena zastupují nebo ukazují: já, ty, náš, ten, kdo…' },
    { name: 'číslovka', short: '4', hint: 'Číslovky vyjadřují počet nebo pořadí: dva, třetí, kolik…' },
    { name: 'sloveso', short: '5', hint: 'Slovesa vyjadřují činnost nebo stav. Co dělá? Co se s ním děje?' },
    { name: 'příslovce', short: '6', hint: 'Příslovce říkají kde, kdy, jak, proč. Neohýbají se.' },
    { name: 'předložka', short: '7', hint: 'Předložky stojí před podstatným jménem nebo zájmenem: na, do, pod, s…' },
    { name: 'spojka', short: '8', hint: 'Spojky spojují slova nebo věty: a, ale, protože, že…' },
    { name: 'částice', short: '9', hint: 'Částice uvozují větu a vyjadřují postoj mluvčího: ať, kéž, prý, asi…' },
    { name: 'citoslovce', short: '10', hint: 'Citoslovce vyjadřují city a zvuky: ach, haf, bum…' },
  ],
  cases: [
    { name: '1. pád', short: '1.', hint: '1. pád: kdo? co?' },
    { name: '2. pád', short: '2.', hint: '2. pád: (bez) koho? čeho?' },
    { name: '3. pád', short: '3.', hint: '3. pád: (ke) komu? čemu?' },
    { name: '4. pád', short: '4.', hint: '4. pád: (vidím) koho? co?' },
    { name: '5. pád', short: '5.', hint: '5. pád: oslovujeme, voláme.' },
    { name: '6. pád', short: '6.', hint: '6. pád: (o) kom? (o) čem?' },
    { name: '7. pád', short: '7.', hint: '7. pád: (s) kým? (s) čím?' },
  ],
}

const NONE: Record<P['set'], string> = {
  clauses: 'Tohle slovo samo o sobě větný člen není (předložka, spojka…).',
  pos: 'Tohle slovo se neurčuje.',
  cases: 'U tohohle slova pád neurčuješ (není to podstatné jméno, zájmeno ani přídavné jméno).',
  custom: 'Tohle slovo do žádné skupiny nepatří.',
}

const COLORS = ['blue', 'green', 'orange', 'purple', 'teal', 'pink', 'red', 'yellow', 'lime', 'gray']

const catsOf = (p: P): Cat[] => (p.set === 'custom' ? (p.categories ?? []).map((c) => ({ name: c.name, short: c.short ?? c.name, hint: c.hint ?? '' })) : SETS[p.set])
const key = (t: string) => t.trim().toLocaleLowerCase('cs').replace(/\.$/, '').replace(/\s+/g, ' ')
/** Index of the category a word's `cat` names (by name or short form), −1 = unknown. */
const findCat = (cats: Cat[], cat: string) => cats.findIndex((c) => key(c.name) === key(cat) || key(c.short) === key(cat) || key(c.name) === `${key(cat)}. pád`)
const bare = (t: string) => t.replace(/[.,!?;:…“”„"]+$/u, '').replace(/^[„"“]+/u, '')

function Sentence(p: P) {
  const { words, set } = p
  const cats = catsOf(p)
  const answer = words.map((w) => (w.cat ? findCat(cats, w.cat) : -1))
  const [pick, setPick] = useState<number | null>(null)
  const [got, setGot] = useState<Set<number>>(new Set())
  const [shake, setShake] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [solved, setSolved] = useState(false)

  const todo = answer.filter((a) => a >= 0).length
  const done = solved || got.size === todo
  const shown = (i: number) => answer[i] >= 0 && (solved || got.has(i))
  const color = (c: number) => `var(--k-${COLORS[c % COLORS.length]})`

  const tap = (i: number) => {
    if (done || shown(i)) return
    if (pick === null) { setMsg('Nejdřív nahoře vyber, co hledáš.'); return }
    if (answer[i] === pick) {
      const g = new Set(got); g.add(i); setGot(g)
      setMsg(g.size === todo ? 'Výborně, věta je celá rozebraná!' : `Ano, „${bare(words[i].text)}“ je ${cats[pick].name}.`)
    } else {
      setShake(i); setTimeout(() => setShake(null), 400)
      setMsg(words[i].hint ?? (answer[i] < 0 ? NONE[set] : `„${bare(words[i].text)}“ není ${cats[pick].name}. ${cats[pick].hint}`.trim()))
    }
  }
  const reset = () => { setGot(new Set()); setSolved(false); setPick(null); setMsg(''); setShake(null) }

  const used = cats.map((c, i) => ({ c, i })).filter(({ i }) => answer.includes(i))
  const pairs = words.map((w, i) => ({ w, i })).filter(({ w }) => w.head !== undefined && words[w.head])
  return (
    <div class="w">
      {!done && (
        <div class="sen-cats" role="radiogroup" aria-label="Co hledáš">
          {cats.map((c, i) => (
            <button key={i} class={`chip sen-cat ${pick === i ? 'sel' : ''}`} style={{ '--sc': color(i) }} role="radio" aria-checked={pick === i} onClick={() => { setPick(i); setMsg(`Hledáš: ${c.name}. Klepni na slova.`) }}>
              <i aria-hidden="true">{!c.name.startsWith(c.short) && c.short}</i>{c.name}
            </button>
          ))}
        </div>
      )}
      <div class="sen-words">
        {words.map((w, i) => {
          const on = shown(i)
          return (
            <button key={i} class={`sen-word ${on ? 'on' : ''} ${shake === i ? 'bad' : ''}`} style={on ? { '--sc': color(answer[i]) } : undefined}
              aria-label={on ? `${w.text}, ${cats[answer[i]].name}` : w.text} aria-disabled={done || on || undefined} onClick={() => tap(i)}>
              <span>{w.text}</span>
              <small aria-hidden="true">{on ? cats[answer[i]].short : ' '}</small>
            </button>
          )
        })}
      </div>
      <div class={`sen-msg ${done ? 'val' : 'sub'}`} aria-live="polite">{solved && got.size < todo ? 'Řešení' : msg || 'Vyber kategorii a klepej na slova.'}</div>
      {!done && <div class="sen-prog">Hotovo {got.size} z {todo}</div>}
      {done && (
        <>
          <ul class="sen-legend" aria-label="Legenda">
            {used.map(({ c, i }) => <li key={i} style={{ '--sc': color(i) }}><i aria-hidden="true" />{!c.name.startsWith(c.short) && <b>{c.short}</b>}{c.name}</li>)}
          </ul>
          {pairs.length > 0 && (
            <div class="sen-pairs">
              <div class="sen-pairs-t">Skladební dvojice</div>
              {pairs.map(({ w, i }) => (
                <div key={i} class="sen-pair">
                  <b style={answer[w.head!] >= 0 ? { '--sc': color(answer[w.head!]) } : undefined}>{bare(words[w.head!].text)}</b>
                  <span class="sen-arrow" aria-label="řídí">→</span>
                  {w.ask && <em>{w.ask}</em>}
                  {w.ask && <span class="sen-arrow" aria-hidden="true">→</span>}
                  <b style={answer[i] >= 0 ? { '--sc': color(answer[i]) } : undefined}>{bare(w.text)}</b>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div class="ctrls">
        {!done && <button class="reveal" onClick={() => { setSolved(true); setMsg('') }}>Ukaž řešení</button>}
        {(done || got.size > 0) && <button class="reveal" onClick={reset}>Znovu</button>}
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'sentence',
  title: 'Rozbor věty',
  summary: 'Věta rozdělená na slova. Dítě vybere kategorii (podmět, přísudek…, slovní druh nebo pád) a klepe na slova: správně se obarví, špatně zatřese a ukáže nápovědu. Na konci barevná věta s legendou a skladebními dvojicemi.',
  use: 'Čeština 3.–9. třída: větné členy, slovní druhy, pády, skladební dvojice; s vlastními kategoriemi i vlastní jména, vyjmenovaná slova, druhy vět nebo slovní druhy v cizím jazyce.',
  props,
  examples: [
    {
      title: 'Větné členy (7. třída)',
      props: {
        set: 'clauses',
        words: [
          { text: 'Malý', cat: 'Pk', head: 1, ask: 'jaký?' },
          { text: 'Honzík', cat: 'Po' },
          { text: 'včera', cat: 'Pu', head: 3, ask: 'kdy?' },
          { text: 'přinesl', cat: 'Př' },
          { text: 'mamince', cat: 'Pt', head: 3, ask: 'komu?' },
          { text: 'do nemocnice', cat: 'Pu', head: 3, ask: 'kam?' },
          { text: 'krásnou', cat: 'Pk', head: 7, ask: 'jakou?' },
          { text: 'kytici.', cat: 'Pt', head: 3, ask: 'co?' },
        ],
      },
    },
    {
      title: 'Slovní druhy (4. třída)',
      props: {
        set: 'pos',
        words: [
          { text: 'Ach,', cat: '10' },
          { text: 'naše', cat: '3' },
          { text: 'dvě', cat: '4' },
          { text: 'malá', cat: '2' },
          { text: 'koťátka', cat: '1' },
          { text: 'spí', cat: '5' },
          { text: 'na', cat: '7' },
          { text: 'teplé', cat: '2' },
          { text: 'peci', cat: '1' },
          { text: 'a', cat: '8' },
          { text: 'tiše', cat: '6' },
          { text: 'předou.', cat: '5' },
        ],
      },
    },
    {
      title: 'Pády podstatných jmen',
      props: {
        set: 'cases',
        words: [
          { text: 'Petře,', cat: '5' },
          { text: 'podej' },
          { text: 'babičce', cat: '3' },
          { text: 'brýle', cat: '4' },
          { text: 'ze' },
          { text: 'stolu', cat: '2' },
          { text: 'v' },
          { text: 'kuchyni.', cat: '6' },
        ],
      },
    },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.set === 'custom' && !p.categories) e.push('set "custom" needs categories')
    if (p.set !== 'custom' && p.categories) e.push('categories are only used with set "custom"')
    const cats = catsOf(p)
    if (new Set(cats.map((c) => key(c.name))).size !== cats.length) e.push('categories: duplicate names')
    p.words.forEach((w, i) => {
      if (w.cat !== undefined && findCat(cats, w.cat) < 0) e.push(`words[${i}]: unknown category "${w.cat}" (allowed: ${cats.map((c) => c.short !== c.name ? `${c.name}/${c.short}` : c.name).join(', ')})`)
      if (w.head !== undefined && (w.head >= p.words.length || w.head === i)) e.push(`words[${i}]: head must point to another word (0–${p.words.length - 1})`)
      if (w.ask && w.head === undefined) e.push(`words[${i}]: ask needs head`)
    })
    if (!p.words.some((w) => w.cat)) e.push('no word has a category – nothing to find')
    return e
  },
  Component: Sentence,
  html: (p, inline) => `<p><b>${p.words.map((w) => inline(w.text)).join(' ')}</b></p><p>Urči: ${catsOf(p).map((c) => inline(c.name)).join(', ')}.</p>`,
})
