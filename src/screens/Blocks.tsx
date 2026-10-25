import { useState } from 'preact/hooks'
import type { Block } from '../content/types'
import { Inline } from '../ui/Inline'
import { WidgetView, type WidgetRef } from '../widgets'

export function Blocks({ blocks }: { blocks: Block[] }) {
  return <div class="blocks">{blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
}

export function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'heading': return <h3 class="bh"><Inline text={b.text} /></h3>
    case 'text': return <p><Inline text={b.text} /></p>
    case 'term': return (
      <div class="term">
        <b><Inline text={b.term} /></b>
        <span><Inline text={b.definition} /></span>
        {b.example && <small><Inline text={b.example} /></small>}
      </div>
    )
    case 'mistake': return (
      <div class="card mistake">
        <div class="wrong"><span>✗</span><span><Inline text={b.wrong} /></span></div>
        <div class="right"><span>✓</span><span><Inline text={b.right} /></span></div>
        <p><Inline text={b.why} /></p>
      </div>
    )
    case 'summary': return <div class="key"><Inline text={b.text} /></div>
    case 'list': return <ul>{b.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>
    case 'steps': return <Steps items={b.items} />
    case 'example': return <Example question={b.question} answer={b.answer} widget={b.widget} />
    case 'picture': return <div class="pic" role="img" aria-label={b.caption}>{b.items.join(' ')}{b.caption && <small>{b.caption}</small>}</div>
    case 'table': return (
      <div class="card table-wrap"><table>
        <thead><tr>{b.head.map((h, i) => <th key={i}><Inline text={h} /></th>)}</tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>)}</tbody>
      </table></div>
    )
    case 'widget': return <WidgetView w={b} />
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

function Example({ question, answer, widget }: { question: string; answer: string; widget?: WidgetRef }) {
  const [open, setOpen] = useState(false)
  return (
    <div class="card example">
      <div class="q"><Inline text={question} /></div>
      {open ? <><div class="a"><Inline text={answer} /></div>{widget && <WidgetView w={widget} />}</> : <button class="reveal" onClick={() => setOpen(true)}>Ukázat řešení</button>}
    </div>
  )
}
