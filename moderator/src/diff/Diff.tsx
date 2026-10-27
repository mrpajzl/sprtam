import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import { diffBlocks, diffJson, diffList, diffText, diffTopic, type Op } from '../../../src/content/diff'
import type { Block, Question, TopicFile } from '../../../src/content/types'
import { WIDGETS } from '../../../src/widgets'
import { blockLabel, questionLabel } from '../editor/model'
import { I } from '../ui/kit'

// What changed between two versions of a topic, for a reviewer: only the changed blocks and questions,
// inside them the changed words. Every changed item can carry comments (anchored by its place in the new
// version: explanations[0].blocks[3], questions[2]).

/** One line of a block or a question: [label, text]. Changes are compared line by line. */
type Line = [string, string]

const LETTERS = 'ABCD'

function blockLines(b: Block): Line[] {
  switch (b.type) {
    case 'heading': case 'text': case 'summary': return [['', b.text]]
    case 'term': return [['Pojem', b.term], ['Význam', b.definition], ...(b.example ? [['Příklad', b.example] as Line] : [])]
    case 'mistake': return [['Špatně', b.wrong], ['Správně', b.right], ['Proč', b.why]]
    case 'list': case 'steps': return b.items.map((x, i) => [`${i + 1}.`, x])
    case 'example': return [['Zadání', b.question], ['Řešení', b.answer], ...(b.widget ? widgetLines(b.widget) : [])]
    case 'table': return [['Záhlaví', b.head.join(' | ')], ...b.rows.map((r, i): Line => [`Řádek ${i + 1}`, r.join(' | ')])]
    case 'picture': return [['Obrázek', b.items.join(' ')], ...(b.caption ? [['Popisek', b.caption] as Line] : [])]
    case 'widget': return widgetLines(b)
  }
}

function widgetLines(w: { widget: string; props: Record<string, unknown> }): Line[] {
  return [['Pomůcka', WIDGETS[w.widget]?.title ?? w.widget], ...Object.entries(w.props).map(([k, v]): Line => [k, typeof v === 'string' ? v : JSON.stringify(v)])]
}

function questionLines(q: Question): Line[] {
  const why: Line[] = 'explanation' in q && q.explanation ? [['Proč', q.explanation]] : []
  if ('hints' in q && q.hints) why.unshift(...q.hints.map((h, i): Line => [`Nápověda ${i + 1}`, h]))
  switch (q.type) {
    case 'choice': return [['Otázka', q.question], ...q.options.map((o, i): Line => [`${LETTERS[i]}${i === q.answer ? ' ✓' : ''}`, o]), ...why]
    case 'truefalse': return [['Tvrzení', q.question], ['Odpověď', q.answer ? 'Pravda' : 'Nepravda'], ...why]
    case 'input': return [['Otázka', q.question], ['Odpovědi', q.answers.join(' · ')], ...(q.widget ? widgetLines(q.widget) : []), ...why]
    case 'order': return [['Zadání', q.question], ...q.items.map((x, i): Line => [`${i + 1}.`, x]), ...why]
    case 'match': return [['Zadání', q.question], ...q.pairs.map(([a, b], i): Line => [`${i + 1}.`, `${a} – ${b}`]), ...why]
    case 'open': return [['Otázka', q.question], ['Vzorová odpověď', q.answer]]
  }
}

export function TextDiff({ a, b }: { a: string; b: string }) {
  return <>{diffText(a, b).map((s, i) => (s.t === 'same' ? <span key={i}>{s.s}</span> : s.t === 'add' ? <ins key={i}>{s.s}</ins> : <del key={i}>{s.s}</del>))}</>
}

function Lines({ a, b }: { a?: Line[]; b?: Line[] }) {
  if (!a || !b) {
    const lines = (a ?? b)!
    return <dl class="d-lines">{lines.map(([k, v], i) => <div key={i}>{k && <dt>{k}</dt>}<dd>{v}</dd></div>)}</dl>
  }
  const ops = diffList(a, b, (x, y) => x[0] === y[0])
  return (
    <dl class="d-lines">
      {ops.map((o, i) => {
        if (o.op === 'same') return <div key={i}>{o.b[0] && <dt>{o.b[0]}</dt>}<dd>{o.b[1]}</dd></div>
        if (o.op === 'add') return <div key={i} class="l-add">{o.b[0] && <dt>{o.b[0]}</dt>}<dd><ins>{o.b[1]}</ins></dd></div>
        if (o.op === 'del') return <div key={i} class="l-del">{o.a[0] && <dt>{o.a[0]}</dt>}<dd><del>{o.a[1]}</del></dd></div>
        return <div key={i} class="l-mod">{(o.b[0] || o.a[0]) && <dt>{o.a[0] === o.b[0] ? o.b[0] : <TextDiff a={o.a[0]} b={o.b[0]} />}</dt>}<dd><TextDiff a={o.a[1]} b={o.b[1]} /></dd></div>
      })}
    </dl>
  )
}

export interface Anchored {
  /** Comments and a way to add one, for the item at `anchor` (a path in the new version). */
  render?: (anchor: string) => ComponentChildren
  /** Show the item at `anchor` in the phone. */
  pick?: (anchor: string) => void
}

const OP_LABEL = { add: 'přidáno', del: 'odebráno', mod: 'změněno' } as const

function Item({ op, label, lines, anchor, ctx }: { op: 'add' | 'del' | 'mod' | 'same'; label: string; lines: { a?: Line[]; b?: Line[] }; anchor: string | null; ctx: Anchored }) {
  return (
    <div class={`d-item d-${op}`}>
      <div class="d-head">
        {op !== 'same' && <span class={`d-tag t-${op}`}>{OP_LABEL[op]}</span>}<b>{label}</b>
        {anchor && ctx.pick && <button class="icon s d-pick" onClick={() => ctx.pick!(anchor)} title="Ukázat v telefonu" aria-label="Ukázat v telefonu"><I.phone /></button>}
      </div>
      <Lines {...lines} />
      {anchor && ctx.render?.(anchor)}
    </div>
  )
}

/** Unchanged items between changes, folded: "3 beze změny" (a click shows them). */
function Same({ n, children }: { n: number; children: ComponentChildren }) {
  const [open, setOpen] = useState(false)
  if (!n) return null
  return open ? <div class="d-same-open">{children}</div> : (
    <button class="d-same" onClick={() => setOpen(true)}>{n} {n === 1 ? 'položka' : n < 5 ? 'položky' : 'položek'} beze změny</button>
  )
}

/** Ops with runs of unchanged items folded. */
function Ops<T>({ ops, item, same }: { ops: Op<T>[]; item: (o: Exclude<Op<T>, { op: 'same' }>, k: number) => ComponentChildren; same: (o: Extract<Op<T>, { op: 'same' }>, k: number) => ComponentChildren }) {
  const out: ComponentChildren[] = []
  let run: Extract<Op<T>, { op: 'same' }>[] = []
  const flush = (k: number) => { if (run.length) out.push(<Same key={`s${k}`} n={run.length}>{run.map((o, j) => same(o, j))}</Same>); run = [] }
  ops.forEach((o, k) => { if (o.op === 'same') run.push(o); else { flush(k); out.push(item(o, k)) } })
  flush(ops.length)
  return <>{out}</>
}

const FIELD: Record<string, string> = { title: 'Název', emoji: 'Emoji', generator: 'Generátor příkladů', approach: 'Přístup k výuce' }

/** Two versions of a topic. `a` null = a new topic. */
export function TopicDiff({ a, b, ctx = {} }: { a: TopicFile | null; b: TopicFile; ctx?: Anchored }) {
  const d = diffTopic(a, b)
  if (!d.fields.length && d.explanations.every((o) => o.op === 'same') && d.questions.every((o) => o.op === 'same')) {
    return <p class="muted">Obsah je stejný jako v porovnávané verzi.</p>
  }
  return (
    <div class="diff">
      {d.fields.length > 0 && (
        <section class="d-sec">
          <h3 class="label">Název a zařazení</h3>
          {d.fields.map((f) => (
            <div key={f.field} class="d-item d-mod">
              <div class="d-head"><span class="d-tag t-mod">změněno</span><b>{FIELD[f.field]}</b></div>
              <p class="d-field"><TextDiff a={f.a ?? ''} b={f.b ?? ''} /></p>
            </div>
          ))}
        </section>
      )}
      {d.explanations.map((o, k) => {
        if (o.op === 'same') return null
        const title = o.op === 'del' ? o.a.title : o.b.title
        const where = o.op === 'del' ? null : `explanations[${o.bi}]`
        const blocks = o.op === 'mod' ? diffBlocks(o.a.blocks, o.b.blocks) : o.op === 'add' ? o.b.blocks.map((x, i) => ({ op: 'add' as const, b: x, bi: i })) : o.a.blocks.map((x, i) => ({ op: 'del' as const, a: x, ai: i }))
        return (
          <section key={k} class="d-sec">
            <h3 class="label">
              {o.op === 'add' ? 'Nové vysvětlení' : o.op === 'del' ? 'Odebrané vysvětlení' : 'Vysvětlení'} · {o.op === 'mod' && o.a.title !== o.b.title ? <TextDiff a={o.a.title} b={o.b.title} /> : title}
            </h3>
            <Ops ops={blocks as Op<Block>[]}
              same={(x, j) => <Item key={j} op="same" label={blockLabel(x.b.type)} lines={{ b: blockLines(x.b) }} anchor={null} ctx={{}} />}
              item={(x, j) => (
                <Item key={j} op={x.op} label={blockLabel(x.op === 'del' ? x.a.type : x.b.type)} ctx={ctx}
                  anchor={x.op === 'del' || !where ? null : `${where}.blocks[${x.bi}]`}
                  lines={x.op === 'add' ? { b: blockLines(x.b) } : x.op === 'del' ? { a: blockLines(x.a) } : { a: blockLines(x.a), b: blockLines(x.b) }} />
              )} />
          </section>
        )
      })}
      {d.questions.some((o) => o.op !== 'same') && (
        <section class="d-sec">
          <h3 class="label">Otázky</h3>
          <Ops ops={d.questions}
            same={(x, j) => <Item key={j} op="same" label={`${x.bi + 1}. ${questionLabel(x.b.type)}`} lines={{ b: questionLines(x.b) }} anchor={null} ctx={{}} />}
            item={(x, j) => (
              <Item key={j} op={x.op} label={x.op === 'del' ? `${questionLabel(x.a.type)} (byla ${x.ai + 1}.)` : `${x.bi + 1}. ${questionLabel(x.b.type)}`} ctx={ctx}
                anchor={x.op === 'del' ? null : `questions[${x.bi}]`}
                lines={x.op === 'add' ? { b: questionLines(x.b) } : x.op === 'del' ? { a: questionLines(x.a) } : { a: questionLines(x.a), b: questionLines(x.b) }} />
            )} />
        </section>
      )}
    </div>
  )
}

/** Any other document (topic list, vocabulary, a plan): the changed values with their paths. */
export function JsonDiff({ a, b }: { a: unknown; b: unknown }) {
  const changes = diffJson(a, b)
  if (!changes.length) return <p class="muted">Beze změny.</p>
  const show = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))
  return (
    <div class="diff">
      {changes.slice(0, 300).map((c, i) => (
        <div key={i} class={`d-item d-${c.op}`}>
          <div class="d-head"><span class={`d-tag t-${c.op}`}>{OP_LABEL[c.op]}</span><code>{c.path || '(celé)'}</code></div>
          <p class="d-field">{c.op === 'add' ? <ins>{show(c.b)}</ins> : c.op === 'del' ? <del>{show(c.a)}</del> : typeof c.a === 'string' && typeof c.b === 'string' ? <TextDiff a={c.a} b={c.b} /> : <><del>{show(c.a)}</del> → <ins>{show(c.b)}</ins></>}</p>
        </div>
      ))}
      {changes.length > 300 && <p class="fine">…a dalších {changes.length - 300} změn.</p>}
    </div>
  )
}

/** "3 přidáno, 1 odebráno, 2 změněno" */
export function DiffStats({ a, b }: { a: TopicFile | null; b: TopicFile }) {
  const { stats } = diffTopic(a, b)
  const parts = [stats.added && `${stats.added} přidáno`, stats.removed && `${stats.removed} odebráno`, stats.changed && `${stats.changed} změněno`].filter(Boolean)
  return <span class="d-stats">{parts.length ? parts.join(' · ') : 'beze změny'}</span>
}
