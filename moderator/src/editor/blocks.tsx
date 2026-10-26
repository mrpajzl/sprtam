import { useState } from 'preact/hooks'
import type { Block, Explanation } from '../../../src/content/types'
import { I } from '../ui/kit'
import { Errors, Text, TextList, useEd, type EditorCtx } from './fields'
import type { Issue } from './issues'
import { arrayInsert, arrayMove, arrayRemove, BLOCK_TYPES, blockLabel, getIn, newBlock, newWidget, type Path } from './model'
import { Insert, Menu, useSortable } from './sortable'
import { WidgetEditor, WidgetPicker } from './widgets'

// The blocks of one explanation as a column of cards: add between any two, drag or arrow to reorder,
// duplicate, delete (undo brings it back). Each card is a small form for its block type.

const HEADINGS = ['O čem to je', 'Nové pojmy', 'Jak na to', 'Příklady', 'Pozor na chybu', 'Zkus si to', 'Shrnutí']

export function BlockList({ ex, issues }: { ex: number; issues: Issue[] }) {
  const ed = useEd()
  const path: Path = ['explanations', ex, 'blocks']
  const blocks = (getIn(ed.topic, path) as Block[]) ?? []
  const [menuAt, setMenuAt] = useState<number | null>(null)
  // A widget block starts in the gallery, so the author sees the widgets working before choosing one.
  const [widgetAt, setWidgetAt] = useState<number | null>(null)
  const set = (xs: Block[]) => ed.update(path, xs)
  const sort = useSortable((from, to) => { set(arrayMove(blocks, from, to)); ed.setFocus({ ex, block: to }) })
  const insert = (at: number, b: Block) => { set(arrayInsert(blocks, at, b)); ed.setFocus({ ex, block: at }) }
  const add = (at: number, type: Block['type']) => { setMenuAt(null); if (type === 'widget') setWidgetAt(at); else insert(at, newBlock(type)) }

  return (
    <div class="cards">
      {blocks.map((b, i) => (
        <div key={i} class="card-slot">
          {!ed.readOnly && (menuAt === i ? <Menu title="Vložit blok" items={BLOCK_TYPES} onPick={(t) => add(i, t)} onClose={() => setMenuAt(null)} /> : i > 0 && <Insert label="Vložit blok sem" onClick={() => setMenuAt(i)} />)}
          <BlockCard ed={ed} ex={ex} i={i} b={b} count={blocks.length} sort={sort} issues={issues.filter((x) => x.block === i)}
            onMove={(d) => { set(arrayMove(blocks, i, i + d)); ed.setFocus({ ex, block: i + d }) }}
            onCopy={() => { set(arrayInsert(blocks, i + 1, structuredClone(b))); ed.setFocus({ ex, block: i + 1 }) }}
            onRemove={() => set(arrayRemove(blocks, i))} />
        </div>
      ))}
      {!ed.readOnly && (menuAt === blocks.length
        ? <Menu title="Přidat blok" items={BLOCK_TYPES} onPick={(t) => add(blocks.length, t)} onClose={() => setMenuAt(null)} />
        : <button type="button" class="add-card" onClick={() => setMenuAt(blocks.length)}><I.plus />Přidat blok</button>)}
      {widgetAt !== null && <WidgetPicker onClose={() => setWidgetAt(null)} onPick={(w) => { insert(widgetAt, { type: 'widget', ...w } as Block); setWidgetAt(null) }} />}
    </div>
  )
}

interface CardProps {
  ed: EditorCtx; ex: number; i: number; b: Block; count: number; issues: Issue[]; sort: ReturnType<typeof useSortable>
  onMove: (d: number) => void; onCopy: () => void; onRemove: () => void
}

function BlockCard({ ed, ex, i, b, count, issues, sort, onMove, onCopy, onRemove }: CardProps) {
  const p: Path = ['explanations', ex, 'blocks', i]
  const focused = ed.focus.ex === ex && ed.focus.block === i
  const it = sort.item(i)
  // Fields show their own problems; the block as a whole (a widget rule, a missing field) under the card.
  const own = issues.filter((x) => x.path === `explanations[${ex}].blocks[${i}]`).map((x) => x.cs)
  return (
    <section {...it} class={`card block t-${b.type} ${focused ? 'focused' : ''} ${issues.length ? 'has-issues' : ''} ${it.class}`}
      id={`block-${ex}-${i}`} onFocusIn={() => !focused && ed.setFocus({ ex, block: i })} onClick={() => !focused && ed.setFocus({ ex, block: i })}>
      <header>
        {!ed.readOnly && <span class="grip" {...sort.handle(i)} title="Přetáhni a přesuň" aria-hidden="true"><I.grip /></span>}
        <span class="kind">{blockLabel(b.type)}</span>
        <span class="n">{i + 1}</span>
        {issues.length > 0 && <span class="badge bad" title={issues.map((x) => x.cs).join('\n')}>{issues.length}</span>}
        {!ed.readOnly && (
          <span class="tools">
            <button type="button" class="icon s" disabled={i === 0} onClick={(e) => { e.stopPropagation(); onMove(-1) }} aria-label="Posunout nahoru" title="Nahoru"><I.up /></button>
            <button type="button" class="icon s" disabled={i === count - 1} onClick={(e) => { e.stopPropagation(); onMove(1) }} aria-label="Posunout dolů" title="Dolů"><I.down /></button>
            <button type="button" class="icon s" onClick={(e) => { e.stopPropagation(); onCopy() }} aria-label="Duplikovat" title="Duplikovat"><I.copy /></button>
            <button type="button" class="icon s" onClick={(e) => { e.stopPropagation(); onRemove() }} aria-label="Smazat blok" title="Smazat (jde vrátit Ctrl+Z)"><I.trash /></button>
          </span>
        )}
      </header>
      <div class="body"><BlockForm b={b} p={p} /></div>
      {own.length > 0 && <Errors list={own} />}
    </section>
  )
}

function BlockForm({ b, p }: { b: Block; p: Path }) {
  const ed = useEd()
  switch (b.type) {
    case 'heading':
      return (
        <>
          <Text path={[...p, 'text']} placeholder="Nadpis části" class="as-heading" />
          {!ed.readOnly && <div class="chips small">{HEADINGS.map((h) => <button type="button" key={h} class={`chip ${b.text === h ? 'on' : ''}`} onClick={() => ed.update([...p, 'text'], h)}>{h}</button>)}</div>}
        </>
      )
    case 'text':
      return <Text path={[...p, 'text']} multiline placeholder="Krátké věty, běžná slova, tykání. Nový pojem **tučně**." />
    case 'summary':
      return <Text path={[...p, 'text']} multiline placeholder="To hlavní v 1–3 větách." />
    case 'term':
      return (
        <div class="grid-2">
          <Text path={[...p, 'term']} label="Pojem" placeholder="např. Jmenovatel" />
          <Text path={[...p, 'definition']} label="Co to znamená – obyčejnými slovy" multiline placeholder="Číslo pod čarou. Říká, na kolik dílů je celek rozdělený." class="span" />
          <Text path={[...p, 'example']} label="Příklad" optional multiline placeholder="Ve zlomku 3/4 je jmenovatel 4." class="span" />
        </div>
      )
    case 'mistake':
      return (
        <div class="grid-2">
          <Text path={[...p, 'wrong']} label="✗ Špatně" multiline placeholder="1/2 + 1/3 = 2/5" />
          <Text path={[...p, 'right']} label="✓ Správně" multiline placeholder="1/2 + 1/3 = 5/6" />
          <Text path={[...p, 'why']} label="Proč" multiline placeholder="Sčítat jde jen stejně velké díly." class="span" />
        </div>
      )
    case 'list':
      return <TextList path={[...p, 'items']} label="Položky" multiline addLabel="Přidat položku" />
    case 'steps':
      return <TextList path={[...p, 'items']} label="Kroky (dítě je odkrývá jeden po druhém)" numbered multiline placeholder={(i) => `${i + 1}. krok`} addLabel="Přidat krok" />
    case 'example':
      return (
        <>
          <Text path={[...p, 'question']} label="Zadání" multiline placeholder="Vypočítej 3/4 z 12." />
          <Text path={[...p, 'answer']} label="Řešení i s postupem (ukáže se po klepnutí)" multiline placeholder="12 : 4 = 3, 3 · 3 = **9**." />
          {b.widget
            ? <WidgetEditor path={[...p, 'widget']} removable onRemove={() => ed.update([...p, 'widget'], undefined)} />
            : !ed.readOnly && <button type="button" class="add-line" onClick={() => ed.update([...p, 'widget'], newWidget('column'))}><I.plus />Ukázat k řešení pomůcku (třeba výpočet pod sebou)</button>}
        </>
      )
    case 'table':
      return <TableForm p={p} b={b} />
    case 'picture':
      return (
        <div class="grid-2">
          <label class="field span">
            <span>Emoji v řadě (odděl mezerou)</span>
            <input class="emoji-line" value={b.items.join(' ')} disabled={ed.readOnly} placeholder="🍎 🍎 ➕ 🍐 = ❓" onInput={(e) => ed.update([...p, 'items'], e.currentTarget.value.split(/\s+/).filter(Boolean), 'pic')} />
            <Errors list={ed.errors.get(`explanations[${p[1]}].blocks[${p[3]}].items`) ?? []} />
          </label>
          <Text path={[...p, 'caption']} label="Popisek" optional placeholder="Dvě jablka a hruška" class="span" hint="Přečte ho i čtečka obrazovky." />
        </div>
      )
    case 'widget':
      return <WidgetEditor path={p} />
  }
}

function TableForm({ p, b }: { p: Path; b: Extract<Block, { type: 'table' }> }) {
  const ed = useEd()
  const cols = b.head.length
  const setAll = (head: string[], rows: string[][]) => ed.update(p, { ...b, head, rows })
  return (
    <div class="table-edit">
      <div class="tscroll">
        <table>
          <thead>
            <tr>{b.head.map((_, c) => <th key={c}><Text path={[...p, 'head', c]} placeholder={`Sloupec ${c + 1}`} /></th>)}
              {!ed.readOnly && <th class="t-tool"><button type="button" class="icon s" title="Přidat sloupec" aria-label="Přidat sloupec" onClick={() => setAll([...b.head, ''], b.rows.map((r) => [...r, '']))}><I.plus /></button></th>}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={ri}>
                {Array.from({ length: Math.max(cols, r.length) }, (_, c) => <td key={c}><Text path={[...p, 'rows', ri, c]} /></td>)}
                {!ed.readOnly && <td class="t-tool"><button type="button" class="icon s" disabled={b.rows.length < 2} title="Odebrat řádek" aria-label="Odebrat řádek" onClick={() => setAll(b.head, b.rows.filter((_, j) => j !== ri))}><I.close /></button></td>}
              </tr>
            ))}
            {!ed.readOnly && (
              <tr class="t-foot">{b.head.map((_, c) => <td key={c}><button type="button" class="icon s" disabled={cols < 2} title="Odebrat sloupec" aria-label="Odebrat sloupec" onClick={() => setAll(b.head.filter((_, j) => j !== c), b.rows.map((row) => row.filter((_, j) => j !== c)))}><I.close /></button></td>)}<td /></tr>
            )}
          </tbody>
        </table>
      </div>
      {!ed.readOnly && <button type="button" class="add-line" onClick={() => setAll(b.head, [...b.rows, b.head.map(() => '')])}><I.plus />Přidat řádek</button>}
      <p class="fine">Prázdná buňka je v pořádku (třeba roh tabulky). Text smí mít **tučné** a `vzorce`.</p>
    </div>
  )
}

export const explanationTitle = (x: Explanation, i: number) => x.title || `Vysvětlení ${i + 1}`
