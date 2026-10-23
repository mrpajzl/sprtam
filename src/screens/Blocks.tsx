import { useState } from 'preact/hooks'
import type { Block } from '../content/types'
import { Inline } from '../ui/Inline'
import { WidgetView } from '../widgets'

export function Blocks({ blocks }: { blocks: Block[] }) {
  return <div class="blocks">{blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p': return <p><Inline text={b.text} /></p>
    case 'key': return <div class="key"><Inline text={b.text} /></div>
    case 'list': return <ul>{b.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>
    case 'steps': return <Steps items={b.items} />
    case 'example': return <Example q={b.q} a={b.a} />
    case 'pic': return <div class="pic" role="img" aria-label={b.caption}>{b.items.join(' ')}{b.caption && <small>{b.caption}</small>}</div>
    case 'table': return (
      <div class="card table-wrap"><table>
        <thead><tr>{b.head.map((h, i) => <th key={i}><Inline text={h} /></th>)}</tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>)}</tbody>
      </table></div>
    )
    case 'w': return <WidgetView w={b} />
  }
}

function Steps({ items }: { items: string[] }) {
  const [n, setN] = useState(1)
  return (
    <div class="card steps">
      {items.slice(0, n).map((s, i) => <div key={i} class="s"><span><Inline text={s} /></span></div>)}
      {n < items.length && <button class="reveal" onClick={() => setN(n + 1)}>Další krok</button>}
    </div>
  )
}

function Example({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div class="card example">
      <div class="q"><Inline text={q} /></div>
      {open ? <div class="a"><Inline text={a} /></div> : <button class="reveal" onClick={() => setOpen(true)}>Ukázat řešení</button>}
    </div>
  )
}
