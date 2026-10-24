import { useState } from 'preact/hooks'
import type { Block } from '../content/types'
import { Inline } from '../ui/Inline'
import { WidgetView } from '../widgets'
import { Column } from '../widgets/column'

export function Blocks({ blocks }: { blocks: Block[] }) {
  return <div class="blocks">{blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'h': return <h3 class="bh"><Inline text={b.text} /></h3>
    case 'p': return <p><Inline text={b.text} /></p>
    case 'term': return (
      <div class="term">
        <b><Inline text={b.term} /></b>
        <span><Inline text={b.def} /></span>
        {b.ex && <small><Inline text={b.ex} /></small>}
      </div>
    )
    case 'mistake': return (
      <div class="card mistake">
        <div class="wrong"><span>✗</span><span><Inline text={b.wrong} /></span></div>
        <div class="right"><span>✓</span><span><Inline text={b.right} /></span></div>
        <p><Inline text={b.why} /></p>
      </div>
    )
    case 'key': return <div class="key"><Inline text={b.text} /></div>
    case 'list': return <ul>{b.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>
    case 'steps': return <Steps items={b.items} />
    case 'example': return <Example q={b.q} a={b.a} col={b.col} />
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

function Example({ q, a, col }: { q: string; a: string; col?: Extract<Block, { t: 'example' }>['col'] }) {
  const [open, setOpen] = useState(false)
  return (
    <div class="card example">
      <div class="q"><Inline text={q} /></div>
      {open ? <><div class="a"><Inline text={a} /></div>{col && <Column {...col} />}</> : <button class="reveal" onClick={() => setOpen(true)}>Ukázat řešení</button>}
    </div>
  )
}
