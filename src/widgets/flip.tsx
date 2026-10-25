import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget } from './kit'

const props = s.object({
  cards: s.array(s.object({
    front: s.string({ description: 'Líc – otázka, pojem nebo slovo.' }),
    back: s.string({ description: 'Rub – odpověď, která se ukáže po otočení.' }),
  }), { min: 1, max: 12, description: 'Karty. Ideálně 3–8.' }),
})
type P = Infer<typeof props>

function Flip({ cards }: P) {
  const [on, setOn] = useState<Set<number>>(new Set())
  const toggle = (i: number) => { const n = new Set(on); n.has(i) ? n.delete(i) : n.add(i); setOn(n) }
  return (
    <div class="w">
      <div class="flips">
        {cards.map((c, i) => (
          <button key={i} class={`flip ${on.has(i) ? 'on' : ''}`} onClick={() => toggle(i)} aria-label={on.has(i) ? c.back : c.front}>
            <div><span class="f"><Inline text={c.front} /></span><span class="b"><Inline text={c.back} /></span></div>
          </button>
        ))}
      </div>
      <div class="sub">Klepni na kartu</div>
    </div>
  )
}

export default defineWidget({
  name: 'flip',
  title: 'Otáčecí kartičky',
  summary: 'Kartičky s otázkou na líci; klepnutím se otočí a ukážou odpověď. Dítě si samo ověří, co ví.',
  use: 'Pojmy a jejich význam, vzorce, data, překlady – cokoli ve dvojici „otázka → odpověď“.',
  props,
  examples: [{ title: 'Vyjmenovaná slova', props: { cards: [{ front: 'b_dlit', back: 'b**y**dlit' }, { front: 'b_k', back: 'b**ý**k' }, { front: 'ob_čej', back: 'ob**y**čej' }] } }],
  Component: Flip,
  html: (p, inline) => `<ul>${p.cards.map((c) => `<li><b>${inline(c.front)}</b> – ${inline(c.back)}</li>`).join('')}</ul>`,
})
