import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget, shuffle } from './kit'

const props = s.object({
  groups: s.array(s.string(), { min: 2, max: 4, description: 'Názvy skupin (krabiček), do kterých se třídí.' }),
  items: s.array(s.object({
    text: s.string({ description: 'Co se třídí.' }),
    group: s.int({ min: 0, description: 'Pořadí správné skupiny v groups, od 0.' }),
  }), { min: 2, max: 14, description: 'Položky; zobrazí se zamíchané. Ideálně 6–10.' }),
})
type P = Infer<typeof props>

function Sort({ groups, items }: P) {
  const pool = useMemo(() => shuffle(items.map((it, i) => ({ ...it, i }))), [items])
  const [placed, setPlaced] = useState<Record<number, number>>({})
  const [sel, setSel] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const left = pool.filter((it) => placed[it.i] === undefined)
  const drop = (group: number) => {
    if (sel === null) return
    const it = items[sel]
    if (it.group === group) { setPlaced({ ...placed, [sel]: group }); setSel(null) }
    else { setWrong(sel); setTimeout(() => setWrong(null), 400) }
  }
  return (
    <div class="w">
      {left.length > 0 ? (
        <div class="chips">
          {left.map((it) => (
            <button key={it.i} class={`chip ${sel === it.i ? 'sel' : ''} ${wrong === it.i ? 'bad' : ''}`} onClick={() => setSel(it.i)}><Inline text={it.text} /></button>
          ))}
        </div>
      ) : <div class="val">✓ Hotovo</div>}
      <div class="buckets" style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 3)}, minmax(0, 1fr))` }}>
        {groups.map((b, bi) => (
          <button key={bi} class={`bucket ${sel !== null ? 'target' : ''}`} onClick={() => drop(bi)}>
            <h4>{b}</h4>
            <div class="chips">{items.map((it, i) => placed[i] === bi && <span key={i} class="chip ok"><Inline text={it.text} /></span>)}</div>
          </button>
        ))}
      </div>
      <div class="sub">{left.length ? (sel === null ? 'Vyber slovo, pak skupinu' : 'Kam to patří?') : ''}</div>
      {!left.length && <div class="ctrls"><button class="reveal" onClick={() => setPlaced({})}>Znovu</button></div>}
    </div>
  )
}

export default defineWidget({
  name: 'sort',
  title: 'Třídění do skupin',
  summary: 'Zamíchané kartičky a 2–4 krabičky. Dítě vybere kartičku a pak krabičku; špatná volba zatřese, správná kartičku uloží.',
  use: 'Rozlišování a třídění: slovní druhy, živé × neživé, kov × nekov, sudá × lichá čísla…',
  props,
  examples: [{
    title: 'Živé a neživé',
    props: { groups: ['živé', 'neživé'], items: [{ text: 'pes', group: 0 }, { text: 'kámen', group: 1 }, { text: 'strom', group: 0 }, { text: 'auto', group: 1 }] },
  }],
  check: (p) => (p.items.some((i) => i.group >= p.groups.length) ? ['item group index out of range'] : []),
  Component: Sort,
})
