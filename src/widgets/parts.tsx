import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const props = s.object({
  words: s.array(s.object({
    parts: s.array(s.object({
      text: s.string({ description: 'Část slova, např. "pod".' }),
      label: s.string({ description: 'Název části, např. "předpona". Stejné názvy mají stejnou barvu.' }),
    }), { min: 1, max: 8, description: 'Části slova zleva doprava; dohromady dají celé slovo.' }),
  }), { min: 1, max: 5, description: 'Slova. Ideálně 1–3.' }),
})
type P = Infer<typeof props>

const HUES = [350, 210, 140, 35, 280, 180]

function Parts({ words }: P) {
  const [show, setShow] = useState(false)
  // Same label → same colour within this widget.
  const labels = [...new Set(words.flatMap((w) => w.parts.map((p) => p.label)))]
  const hue = (label: string) => HUES[labels.indexOf(label) % HUES.length]
  return (
    <div class="w" onClick={() => setShow(!show)}>
      {words.map((w, i) => (
        <div key={i} class={`parts-word ${show ? 'show' : ''}`}>
          {w.parts.map((p, j) => (
            <button key={j} style={{ color: `hsl(${hue(p.label)} 70% 45%)`, background: show ? `hsl(${hue(p.label)} 80% 50% / 0.12)` : 'transparent' }}>
              <span>{p.text}</span><small>{p.label}</small>
            </button>
          ))}
        </div>
      ))}
      <div class="sub">{show ? '' : 'Klepni a uvidíš části'}</div>
    </div>
  )
}

export default defineWidget({
  name: 'parts',
  title: 'Stavba slova',
  summary: 'Slova rozdělená na barevné části; klepnutím se ukážou jejich názvy (předpona, kořen, přípona, koncovka…).',
  use: 'Stavba slova, slovotvorba, kořen a odvozená slova; i chemické vzorce nebo složená slova rozdělená na části.',
  props,
  examples: [{ title: 'Podstavec', props: { words: [{ parts: [{ text: 'pod', label: 'předpona' }, { text: 'stav', label: 'kořen' }, { text: 'ec', label: 'přípona' }] }] } }],
  Component: Parts,
})
