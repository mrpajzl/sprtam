import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget } from './kit'

const props = s.object({
  events: s.array(s.object({
    year: s.int({ description: 'Rok; záporný = před naším letopočtem (−753 = 753 př. n. l.).' }),
    label: s.string({ description: 'Co se stalo (krátce, smí obsahovat **tučné**).' }),
  }), { min: 2, max: 12, description: 'Události; seřadí se samy podle roku. Ideálně 3–8.' }),
})
type P = Infer<typeof props>

const year = (n: number) => (n < 0 ? `${-n} př. n. l.` : `${n}`)

function Timeline({ events }: P) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events])
  const [on, setOn] = useState(-1)
  return (
    <div class="w">
      <div class="tl">
        <div class="tl-track">
          {sorted.map((e, i) => (
            <button key={i} class={`tl-ev ${on === i ? 'on' : ''}`} onClick={() => setOn(i)}>
              <b>{year(e.year)}</b><span><Inline text={e.label} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default defineWidget({
  name: 'timeline',
  title: 'Časová osa',
  summary: 'Vodorovná osa s událostmi seřazenými podle roku; klepnutím se událost zvýrazní.',
  use: 'Dějepis, literatura, vývoj vědy – pořadí a odstup událostí v čase.',
  props,
  examples: [{
    title: 'Přemyslovci',
    props: { events: [{ year: 935, label: 'Zavraždění **sv. Václava**' }, { year: 1212, label: 'Zlatá bula sicilská' }, { year: 1306, label: 'Vymření Přemyslovců po meči' }] },
  }],
  Component: Timeline,
  html: (p, inline) => `<ul>${p.events.map((e) => `<li><b>${e.year}</b> ${inline(e.label)}</li>`).join('')}</ul>`,
})
