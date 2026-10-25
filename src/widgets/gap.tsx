import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const props = s.object({
  items: s.array(s.object({
    before: s.string({ min: 0, description: 'Text před mezerou (smí být prázdný).' }),
    after: s.string({ min: 0, description: 'Text za mezerou (smí být prázdný).' }),
    options: s.array(s.string(), { min: 2, max: 4, description: 'Možnosti k doplnění, např. ["i", "y"].' }),
    answer: s.int({ min: 0, description: 'Pořadí správné možnosti v options, od 0.' }),
  }), { min: 1, max: 8, description: 'Řádky k doplnění. Ideálně 3–6.' }),
})
type P = Infer<typeof props>

function Gap({ items }: P) {
  const [got, setGot] = useState<Record<number, boolean>>({})
  const [bad, setBad] = useState<string | null>(null)
  return (
    <div class="w" style={{ gap: '18px' }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gap: '8px' }}>
          <div class="gap-row">
            <span>{it.before}<span class={`hole ${got[i] ? 'ok' : ''}`}>{got[i] ? it.options[it.answer] : '?'}</span>{it.after}</span>
          </div>
          {!got[i] && (
            <div class="chips">
              {it.options.map((o, k) => (
                <button key={k} class={`chip ${bad === `${i}-${k}` ? 'bad' : ''}`} onClick={() => {
                  if (k === it.answer) setGot({ ...got, [i]: true })
                  else { setBad(`${i}-${k}`); setTimeout(() => setBad(null), 400) }
                }}>{o}</button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default defineWidget({
  name: 'gap',
  title: 'Doplňovačka',
  summary: 'Věty nebo slova s mezerou; dítě klepne na správnou možnost a mezera se doplní. Špatná možnost zatřese.',
  use: 'Pravopis (i/y, s/z, mě/mně…), koncovky, správný tvar slova, doplnění čísla do vzorce.',
  props,
  examples: [{
    title: 'I, nebo Y',
    props: { items: [{ before: 'b', after: 'dlit', options: ['i', 'y'], answer: 1 }, { before: 'p', after: 'vo', options: ['i', 'y'], answer: 0 }] },
  }],
  check: (p) => {
    const e: string[] = []
    p.items.forEach((it, i) => {
      if (it.answer >= it.options.length) e.push(`items[${i}]: answer out of range`)
      if (new Set(it.options).size !== it.options.length) e.push(`items[${i}]: duplicate options`)
    })
    return e
  },
  Component: Gap,
})
