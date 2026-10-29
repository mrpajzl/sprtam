import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { BY_SYMBOL, CAT_KEYS, CATEGORIES, config, ELEMENTS, groupText, massText, SHELL, state, valence, type Cat, type Element } from '../chem/elements'
import { defineWidget } from './kit'

// The periodic table of all 118 elements (data in src/chem/elements.ts).

const props = s.object({
  count: s.optional(s.int({ min: 2, max: 118, description: 'Ukázat jen prvních N prvků (podle protonového čísla). Pro ZŠ třeba 20 (do vápníku), pak se tabulka vejde na telefon bez posouvání. Bez vyplnění celá tabulka.' })),
  highlight: s.optional(s.array(s.string({ pattern: '^[A-Z][a-z]?$' }), { min: 1, max: 60, description: 'Zvýrazněné prvky podle značky, např. ["Na", "K"]. Ostatní se ztlumí.' })),
  group: s.optional(s.int({ min: 1, max: 18, description: 'Zvýrazněná skupina 1–18 (např. 17 = halogeny). Ostatní prvky se ztlumí.' })),
  open: s.optional(s.string({ pattern: '^[A-Z][a-z]?$', description: 'Značka prvku, jehož detail je otevřený hned na začátku, např. "O".' })),
}, { description: 'Periodická tabulka prvků.' })
type P = Infer<typeof props>

const compactCol = (g: number) => (g <= 2 ? g : g - 10)

function Periodic({ count = 118, highlight, group, open }: P) {
  const els = ELEMENTS.filter((e) => e.z <= count)
  const compact = count <= 20 // only main-group elements: 8 columns, fits a phone
  const periods = els[els.length - 1].period
  const cols = compact ? 8 : 18
  const [sel, setSel] = useState<Element | null>(open ? BY_SYMBOL.get(open) ?? null : null)
  const [cat, setCat] = useState<Cat | null>(null)
  const [zoom, setZoom] = useState(false)
  const hl = new Set(highlight ?? [])
  const lit = (e: Element) => (cat ? e.cat === cat : hl.size || group ? hl.has(e.symbol) || e.group === group : true)
  const cats = CAT_KEYS.filter((c) => els.some((e) => e.cat === c))
  const groups = compact ? [1, 2, 13, 14, 15, 16, 17, 18] : Array.from({ length: 18 }, (_, i) => i + 1)
  const c = sel && config(sel.z)
  const v = sel && valence(sel)
  return (
    <div class="w">
      <div class={`periodic-scroll ${zoom ? 'zoom' : ''}`}>
        <div class={`periodic-grid ${compact ? 'compact' : ''}`} style={{ gridTemplateColumns: `1.1em repeat(${cols}, 1fr)` }} role="group" aria-label="Periodická tabulka">
          {groups.map((g, i) => <span key={`g${g}`} class="periodic-head" style={{ gridColumn: String(i + 2), gridRow: '1' }}>{g}</span>)}
          {Array.from({ length: periods }, (_, i) => <span key={`p${i}`} class="periodic-head" style={{ gridColumn: '1', gridRow: String(i + 2) }}>{i + 1}</span>)}
          {count >= 57 && <span class="periodic-gap" style={{ gridColumn: '4', gridRow: '7' }} aria-hidden="true">57–71</span>}
          {count >= 89 && <span class="periodic-gap" style={{ gridColumn: '4', gridRow: '8' }} aria-hidden="true">89–103</span>}
          {els.map((e) => (
            <button
              key={e.z}
              class={`periodic-el periodic-${e.cat} ${lit(e) ? '' : 'dim'} ${sel?.z === e.z ? 'sel' : ''} ${e.row === 8 ? 'frow' : ''}`}
              style={{ gridColumn: String((compact ? compactCol(e.col) : e.col) + 1), gridRow: String(e.row <= 7 ? e.row + 1 : e.row + 2) }}
              onClick={() => setSel(sel?.z === e.z ? null : e)}
              aria-label={`${e.name}, ${e.symbol}, protonové číslo ${e.z}`}
              aria-pressed={sel?.z === e.z}
            >
              <span class="periodic-z">{e.z}</span>
              <b>{e.symbol}</b>
            </button>
          ))}
        </div>
      </div>
      {!compact && <div class="ctrls"><button class="chip" onClick={() => setZoom(!zoom)} aria-pressed={zoom}>{zoom ? '− Celá tabulka' : '+ Zvětšit'}</button></div>}
      <div class="periodic-detail" aria-live="polite">
        {sel ? (
          <>
            <div class={`periodic-big periodic-${sel.cat}`}><span>{sel.z}</span><b>{sel.symbol}</b><span>{massText(sel)}</span></div>
            <div class="periodic-facts">
              <b class="periodic-name">{sel.name}</b>
              <span>{CATEGORIES[sel.cat]}</span>
              <dl>
                <dt>protonové číslo Z</dt><dd>{sel.z}</dd>
                <dt>relativní atomová hmotnost A<sub>r</sub></dt><dd>{massText(sel)}{sel.stable ? '' : ' *'}</dd>
                <dt>skupina</dt><dd>{groupText(sel)}</dd>
                <dt>perioda</dt><dd>{sel.period}.</dd>
                <dt>skupenství (25 °C)</dt><dd>{state(sel.z)}</dd>
                {c && <><dt>elektrony ve slupkách</dt><dd>{c.shells.map((n, i) => `${SHELL[i]}\u00a0${n}`).join(' · ')}</dd></>}
                {c && <><dt>konfigurace</dt><dd>{c.text}</dd></>}
                {v !== null && <><dt>valenční elektrony</dt><dd>{v}</dd></>}
              </dl>
              {!sel.stable && <small>* Nemá stálý izotop: nukleonové číslo nejstálejšího izotopu.</small>}
            </div>
          </>
        ) : <div class="sub">Klepni na prvek a uvidíš o něm víc.</div>}
      </div>
      <div class="periodic-legend" role="group" aria-label="Kategorie prvků">
        {cats.map((k) => (
          <button key={k} class={`periodic-key ${cat === k ? 'on' : ''}`} onClick={() => setCat(cat === k ? null : k)} aria-pressed={cat === k}>
            <i class={`periodic-${k}`} />{CATEGORIES[k]}
          </button>
        ))}
      </div>
    </div>
  )
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

export default defineWidget({
  name: 'periodic',
  title: 'Periodická tabulka',
  summary: 'Periodická tabulka 118 prvků barevně podle kategorií s legendou. Klepnutím na prvek se ukáže detail: název, protonové číslo, atomová hmotnost, skupina, perioda, skupenství a u lehkých prvků elektrony ve slupkách a valenční elektrony. Klepnutím na kategorii v legendě se zvýrazní její prvky.',
  use: 'Chemické prvky a jejich značky, stavba atomu, skupiny a periody, kovy a nekovy, alkalické kovy, halogeny, vzácné plyny, valenční elektrony.',
  props,
  examples: [
    { title: 'Prvních 20 prvků (ZŠ)', props: { count: 20, open: 'Na' } },
    { title: 'Halogeny', props: { group: 17 } },
    { title: 'Celá tabulka', props: { highlight: ['Fe', 'Cu', 'Ag', 'Au'] } },
  ],
  check: (p) => {
    const e: string[] = []
    const count = p.count ?? 118
    for (const sym of p.highlight ?? []) {
      const el = BY_SYMBOL.get(sym)
      if (!el) e.push(`highlight: unknown element ${sym}`)
      else if (el.z > count) e.push(`highlight: ${sym} is beyond count ${count}`)
    }
    if (p.highlight && new Set(p.highlight).size !== p.highlight.length) e.push('highlight: duplicate elements')
    if (p.group && !ELEMENTS.some((el) => el.group === p.group && el.z <= count)) e.push(`group ${p.group} has no element within count ${count}`)
    if (p.open) {
      const el = BY_SYMBOL.get(p.open)
      if (!el) e.push(`open: unknown element ${p.open}`)
      else if (el.z > count) e.push(`open: ${p.open} is beyond count ${count}`)
    }
    return e
  },
  Component: Periodic,
  html: (p) => {
    const count = p.count ?? 118
    const hl = new Set(p.highlight ?? [])
    const pick = ELEMENTS.filter((e) => e.z <= count && (hl.size || p.group ? hl.has(e.symbol) || e.group === p.group : true))
    return `<table><thead><tr><th>Z</th><th>Značka</th><th>Název</th><th>A<sub>r</sub></th><th>Skupina</th><th>Perioda</th><th>Kategorie</th></tr></thead><tbody>${pick
      .map((e) => `<tr><td>${e.z}</td><td>${e.symbol}</td><td>${esc(e.name)}</td><td>${massText(e)}</td><td>${e.group ?? '–'}</td><td>${e.period}</td><td>${CATEGORIES[e.cat]}</td></tr>`)
      .join('')}</tbody></table>`
  },
})
