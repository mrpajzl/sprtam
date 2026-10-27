import { BLOCK_EXAMPLES, QUESTION_EXAMPLES } from '../content/examples'
import { fieldRows } from '../content/schema'
import { QuestionView } from '../quiz/QuestionView'
import { Link } from '../router'
import { Bar } from '../ui/Bar'
import { WIDGET_GROUPS, WIDGETS, WidgetQuestion, WidgetView } from '../widgets'
import type { WidgetDef } from '../widgets/kit'
import { BlockView } from './Blocks'

// /widgety – every widget with live examples, its props and the JSON to paste into a topic,
// plus every block and question type. For authors; reference: docs/WIDGETY.md, docs/FORMAT.md.
// /widgety/<name> – one widget alone (linked from the docs).

// In-page jumps without #fragments (the router treats a hash change as navigation and scrolls to the top).
const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const Json = ({ value }: { value: unknown }) => <pre class="json"><code>{JSON.stringify(value, null, 2)}</code></pre>

function Props({ w }: { w: WidgetDef }) {
  return (
    <div class="table-wrap"><table>
      <thead><tr><th>Pole</th><th>Typ</th><th>Popis</th></tr></thead>
      <tbody>{fieldRows(w.props).map(([name, type, req, desc]) => (
        <tr key={name}><td><code>{name}</code>{req ? '' : <small class="muted"> nepovinné</small>}</td><td>{type}</td><td>{desc}</td></tr>
      ))}</tbody>
    </table></div>
  )
}

function WidgetCard({ w }: { w: WidgetDef }) {
  return (
    <section class="gal" id={w.name}>
      <div class="gal-head">
        <h2><Link href={`/widgety/${w.name}`}>{w.title}</Link></h2>
        <code>{w.name}</code>
        {w.Question && <span class="tag">i v otázkách</span>}
      </div>
      <p>{w.summary}</p>
      <p class="muted"><b>Kdy:</b> {w.use}</p>
      {w.examples.map((x, i) => (
        <div key={i} class="gal-ex">
          <h3 class="label">{x.title}</h3>
          <WidgetView key={`${w.name}-${i}`} w={{ widget: w.name, props: x.props as Record<string, unknown> }} />
          <details><summary>JSON</summary><Json value={{ type: 'widget', widget: w.name, props: x.props }} /></details>
        </div>
      ))}
      {w.Question && (
        <div class="gal-ex">
          <h3 class="label">V otázce (jen zadání)</h3>
          <div class="card"><WidgetQuestion w={{ widget: w.name, props: w.examples[0].props as Record<string, unknown> }} /></div>
        </div>
      )}
      <details><summary>Vlastnosti (props)</summary><Props w={w} /></details>
    </section>
  )
}

export function Gallery({ name }: { name?: string }) {
  const one = name ? WIDGETS[name] : undefined
  if (name) {
    return (
      <div class="page gallery">
        <Bar title={one?.title ?? name} crumbs={[{ href: '/widgety', label: 'Galerie' }]} />
        {one ? <WidgetCard w={one} /> : <div class="empty">Takový widget není.<Link class="btn" href="/widgety">Všechny widgety</Link></div>}
      </div>
    )
  }
  return (
    <div class="page gallery">
      <Bar title="Galerie widgetů" />
      <p class="muted">Všechno, z čeho se skládá výklad a otázky – s živou ukázkou a JSON pro soubory v <code>content/</code>. Jak psát obsah: <code>docs/CONTENT.md</code>.</p>
      <nav class="gal-toc" aria-label="Obsah">
        {WIDGET_GROUPS.map((g) => (
          <div key={g.name}><small>{g.name}</small><div class="chips">{g.widgets.map((w) => <button key={w.name} class="chip" onClick={() => jump(w.name)}>{w.title}</button>)}</div></div>
        ))}
        <div><small>Ostatní</small><div class="chips"><button class="chip" onClick={() => jump('bloky')}>Bloky výkladu</button><button class="chip" onClick={() => jump('otazky')}>Otázky</button></div></div>
      </nav>
      {WIDGET_GROUPS.map((g) => (
        <div key={g.name}>
          <h2 class="section-title">{g.name}</h2>
          <div class="gal-list">{g.widgets.map((w) => <WidgetCard key={w.name} w={w} />)}</div>
        </div>
      ))}
      <h2 class="section-title" id="bloky">Bloky výkladu</h2>
      <div class="gal-list">
        {Object.entries(BLOCK_EXAMPLES).map(([type, b]) => (
          <section key={type} class="gal">
            <div class="gal-head"><h2>{type}</h2></div>
            <div class="blocks"><BlockView b={b} /></div>
            <details><summary>JSON</summary><Json value={b} /></details>
          </section>
        ))}
      </div>
      <h2 class="section-title" id="otazky">Otázky</h2>
      <div class="gal-list">
        {Object.entries(QUESTION_EXAMPLES).map(([type, q]) => (
          <section key={type} class="gal">
            <div class="gal-head"><h2>{type}</h2></div>
            {q.type === 'open' ? <><h2 class="question">{q.question}</h2><p class="muted">{q.answer}</p></> : <QuestionView q={q} reveal hints onAnswer={() => {}} />}
            <details><summary>JSON</summary><Json value={q} /></details>
          </section>
        ))}
      </div>
    </div>
  )
}
