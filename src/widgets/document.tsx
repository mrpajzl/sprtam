import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget } from './kit'

const props = s.object({
  kind: s.enum(['letter', 'email', 'sms', 'poem', 'book'], {
    description: 'Vzhled: "letter" = papír (dopis, žádost, pozvánka, inzerát, životopis), "email" = e-mail s hlavičkou Od/Komu/Předmět, "sms" = bublina zprávy, "poem" = báseň se slokami, "book" = úryvek z knihy (každý řádek je odstavec s odsazeným začátkem).',
  }),
  title: s.optional(s.string({ description: 'Nadpis nad textem, např. „Žádost o uvolnění z vyučování“ nebo název básně.' })),
  from: s.optional(s.string({ description: 'Odesílatel: u e-mailu řádek „Od“, u SMS jméno kontaktu nad bublinou, u básně a knihy autor.' })),
  to: s.optional(s.string({ description: 'Jen u e-mailu: řádek „Komu“.' })),
  subject: s.optional(s.string({ description: 'Jen u e-mailu: řádek „Předmět“.' })),
  parts: s.array(s.object({
    label: s.string({ description: 'Název části, např. „oslovení“, „vlastní sdělení“, „podpis“, „1. sloka“.' }),
    lines: s.array(s.string({ min: 0 }), { min: 1, max: 20, description: 'Řádky textu (u básně verše). Prázdný řádek "" = mezera mezi odstavci. Smí obsahovat **tučně**, *kurzívu*.' }),
    note: s.optional(s.string({ description: 'Poznámka po klepnutí: proč tu část je a jak se píše.' })),
    align: s.optional(s.enum(['left', 'center', 'right'], { description: 'Zarovnání části, např. "right" pro místo a datum nebo podpis. Bez něj podle druhu textu.' })),
  }), { min: 1, max: 12, description: 'Části textu odshora dolů. Stejné názvy mají stejnou barvu.' }),
})
type P = Infer<typeof props>

// Subject colours (they follow light/dark mode). Same label → same colour.
const COLORS = ['blue', 'green', 'orange', 'purple', 'teal', 'pink', 'red', 'yellow', 'lime', 'gray']

function Document({ kind, title, from, to, subject, parts }: P) {
  const [show, setShow] = useState(false)
  const [sel, setSel] = useState<number | null>(null)
  const labels = [...new Set(parts.map((p) => p.label))]
  const color = (label: string) => `var(--k-${COLORS[labels.indexOf(label) % COLORS.length]})`
  const cur = sel === null ? null : parts[sel]
  return (
    <div class="w">
      {title && <div class="doc-title"><Inline text={title} /></div>}
      <div class={`doc-paper doc-${kind} ${show ? 'doc-show' : ''}`}>
        {kind === 'email' && (from || to || subject) && (
          <dl class="doc-head">
            {from && <><dt>Od:</dt><dd>{from}</dd></>}
            {to && <><dt>Komu:</dt><dd>{to}</dd></>}
            {subject && <><dt>Předmět:</dt><dd><b>{subject}</b></dd></>}
          </dl>
        )}
        {kind === 'sms' && from && <div class="doc-contact">{from}</div>}
        <div class="doc-body">
          {parts.map((p, i) => {
            const on = show || sel === i
            return (
              <div key={i} class="doc-part-wrap">
                <button
                  class={`doc-part ${on ? 'on' : ''} ${sel === i ? 'sel' : ''}`}
                  style={{ '--dc': color(p.label), textAlign: p.align }}
                  aria-expanded={sel === i}
                  aria-label={`${p.label}: ${p.lines.filter(Boolean).join(' ').replace(/\*\*|\*|`|\^/g, '')}`}
                  onClick={() => setSel(sel === i ? null : i)}
                >
                  <span class="doc-tag" aria-hidden="true">{p.label}</span>
                  {p.lines.map((l, j) => (l.trim() ? <span key={j} class="doc-line"><Inline text={l} /></span> : <span key={j} class="doc-gap" />))}
                </button>
                {sel === i && p.note && <div class="doc-note" style={{ '--dc': color(p.label) }}><b>{p.label}</b> <Inline text={p.note} /></div>}
              </div>
            )
          })}
        </div>
      </div>
      {kind !== 'email' && kind !== 'sms' && from && <div class="doc-author">{from}</div>}
      <div class="ctrls">
        <button class="reveal" aria-pressed={show} onClick={() => setShow(!show)}>{show ? 'Skryj části' : 'Ukaž části'}</button>
      </div>
      <div class="sub" aria-live="polite">{cur ? (cur.note ? `Část: ${cur.label}` : `Tohle je ${cur.label}.`) : 'Klepni na kteroukoli část textu.'}</div>
    </div>
  )
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineWidget({
  name: 'document',
  title: 'Ukázkový text',
  summary: 'Dopis, e-mail, SMS, báseň nebo úryvek se zachovanými řádky. „Ukaž části“ barevně orámuje části textu (oslovení, sdělení, podpis, sloky) a klepnutí na část ukáže, proč tam je a jak se píše.',
  use: 'Slohová výchova (dopis, žádost, e-mail, SMS, pozvánka, inzerát, životopis, vypravování), literatura (básně a sloky, úryvky), cizí jazyky (dopis a e-mail v angličtině či němčině).',
  props,
  examples: [
    {
      title: 'Omluvný dopis paní učitelce',
      props: {
        kind: 'letter',
        title: 'Omluva z vyučování',
        parts: [
          { label: 'místo a datum', align: 'right', lines: ['V Brně 12. května 2026'], note: 'Píše se vpravo nahoře. Za předložkou „V“ následuje místo, pak datum – měsíc slovem nebo číslem.' },
          { label: 'oslovení', lines: ['Vážená paní učitelko,'], note: 'Za oslovením je **čárka** a další řádek začíná **malým písmenem**. Oslovení je v 5. pádě.' },
          { label: 'vlastní sdělení', lines: ['omlouvám svou dceru Janu Novákovou ze 4. B', 'za nepřítomnost ve škole ve dnech 9. a 10. května.', 'Jana měla horečku a musela zůstat doma.'], note: 'Hlavní část: **co** a **proč**. Krátce, věcně a v celých větách.' },
          { label: 'závěr', lines: ['Děkuji za pochopení.', '', 'S pozdravem'], note: 'Poděkování a pozdrav. Za „S pozdravem“ se čárka nepíše.' },
          { label: 'podpis', align: 'right', lines: ['Petra Nováková'], note: 'Celé jméno toho, kdo píše. U omluvenky podepisuje rodič.' },
        ],
      },
    },
    {
      title: 'E-mail do knihovny',
      props: {
        kind: 'email',
        from: 'tomas.dvorak@example.cz',
        to: 'knihovna@example.cz',
        subject: 'Prodloužení výpůjčky',
        parts: [
          { label: 'oslovení', lines: ['Dobrý den,'], note: 'Když neznáš jméno, napiš „Dobrý den“. Za oslovením čárka, pak se pokračuje malým písmenem.' },
          { label: 'vlastní sdělení', lines: ['chtěl bych poprosit o prodloužení výpůjčky knihy', '*Malý princ*, kterou mám vrátit v pátek 15. května.', 'Ještě jsem ji nestihl dočíst.'], note: 'Napiš přesně, o co žádáš (název knihy, datum). Předmět e-mailu shrnuje obsah do pár slov.' },
          { label: 'závěr', lines: ['Děkuji a přeji hezký den.'], note: 'Zdvořilé poděkování na konci.' },
          { label: 'podpis', lines: ['Tomáš Dvořák', 'čtenářský průkaz č. 10423'], note: 'Jméno a údaje, podle kterých tě poznají. Adresa v řádku „Od“ nestačí.' },
        ],
      },
    },
    {
      title: 'Báseň se dvěma slokami',
      props: {
        kind: 'poem',
        title: 'Podzim',
        parts: [
          { label: '1. sloka', lines: ['Na zahradě padá listí,', 'ježek pelech v trávě čistí.', 'Vítr fouká, drak se točí,', 'slunce mu svítí do očí.'], note: 'Sloka má 4 **verše**. Rýmuje se 1. a 2. verš (listí – čistí) a 3. a 4. verš (točí – očí): **rým sdružený** AABB.' },
          { label: '2. sloka', lines: ['Večer přijde mlha šedá,', 'do oken se dívá,', 'myška teplý koutek hledá,', 'zima už si zpívá.'], note: 'Rýmuje se 1. a 3. verš (šedá – hledá) a 2. a 4. verš (dívá – zpívá): **rým střídavý** ABAB.' },
        ],
      },
    },
  ],
  check: (p) => {
    const e: string[] = []
    if (p.kind !== 'email' && (p.to || p.subject)) e.push('to and subject are only shown with kind "email"')
    p.parts.forEach((part, i) => {
      if (!part.lines.some((l) => l.trim())) e.push(`parts[${i}]: all lines are empty`)
      if (!part.lines[0].trim() || !part.lines[part.lines.length - 1].trim()) e.push(`parts[${i}]: starts or ends with an empty line (parts are already spaced apart)`)
    })
    return e
  },
  Component: Document,
  html: (p, inline) => {
    const head = p.kind === 'email' ? `<p>${[p.from && `Od: ${esc(p.from)}`, p.to && `Komu: ${esc(p.to)}`, p.subject && `Předmět: ${esc(p.subject)}`].filter(Boolean).join('<br>')}</p>` : ''
    const body = p.parts.map((part) => `<p>${part.lines.map((l) => inline(l)).join('<br>')}</p>`).join('')
    const by = p.from && p.kind !== 'email' ? `<p><i>${esc(p.from)}</i></p>` : ''
    return `<div class="doc">${p.title ? `<h4>${inline(p.title)}</h4>` : ''}${head}${body}${by}</div>`
  },
})
