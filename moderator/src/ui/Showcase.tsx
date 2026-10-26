import { useEffect, useRef, useState } from 'preact/hooks'
import { WIDGET_GROUPS, WIDGETS } from '../../../src/widgets'
import type { WidgetDef } from '../../../src/widgets/kit'
import type { ToEditor, ToPreview } from '../preview/protocol'
import { I } from './kit'

// The widget gallery inside moderation: every widget in a list, the chosen one alive next to it – drawn by
// the app itself in the preview frame (moderator/src/preview), so it looks and behaves as pupils will see it.
// Used to pick a widget in the editor and to check what exists before requesting a new one.

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
const THEME_KEY = 'moderace-preview-theme'

export interface Choice { name: string; example: number }

export function Showcase({ questionOnly, current, onChoose, onPick }: {
  /** Only widgets that can stand above a quiz question, shown as the question shows them. */
  questionOnly?: boolean
  current?: string
  /** Called whenever the shown widget or example changes (the picker's „Použít“ button reads it). */
  onChoose?: (c: Choice) => void
  /** Double-click on a widget in the list. */
  onPick?: (c: Choice) => void
}) {
  const [q, setQ] = useState('')
  const all = WIDGET_GROUPS.flatMap((g) => g.widgets).filter((w) => !questionOnly || !!w.Question)
  const [sel, setSel] = useState<Choice>({ name: current && all.some((w) => w.name === current) ? current : all[0].name, example: 0 })
  const [question, setQuestion] = useState(!!questionOnly)
  // Narrow screens show the list or the demo, not both.
  const [detail, setDetail] = useState(false)
  const w = WIDGETS[sel.name]
  const match = (x: WidgetDef) => (!questionOnly || !!x.Question) && (!q || fold(`${x.title} ${x.summary} ${x.use} ${x.name}`).includes(fold(q)))
  const groups = WIDGET_GROUPS.map((g) => ({ name: g.name, widgets: g.widgets.filter(match) })).filter((g) => g.widgets.length)

  const choose = (c: Choice) => { setSel(c); onChoose?.(c) }
  useEffect(() => { onChoose?.(sel) }, [])
  const root = useRef<HTMLDivElement>(null)
  const open = (name: string) => {
    choose({ name, example: 0 })
    setDetail(true)
    if (matchMedia('(max-width: 760px)').matches) requestAnimationFrame(() => root.current?.scrollIntoView({ block: 'start' }))
  }

  return (
    <div class={`showcase ${detail ? 'detail' : ''}`} ref={root}>
      <div class="sc-side">
        <label class="search"><I.search /><input type="search" value={q} onInput={(e) => setQ(e.currentTarget.value)} placeholder="Hledat – zlomek, osa, čas, třídění…" aria-label="Hledat pomůcku" /></label>
        <div class="sc-list">
        {groups.map((g) => (
          <section key={g.name}>
            <h3 class="label">{g.name}</h3>
            {g.widgets.map((x) => (
              <button type="button" key={x.name} class={`sc-item ${x.name === sel.name ? 'on' : ''}`} aria-pressed={x.name === sel.name}
                onClick={() => open(x.name)} onDblClick={() => onPick?.({ name: x.name, example: x.name === sel.name ? sel.example : 0 })}>
                <b>{x.title}{x.name === current && <em> · teď vybraná</em>}</b>
                <span>{x.summary}</span>
              </button>
            ))}
          </section>
        ))}
        {!groups.length && <p class="muted">Nic takového tu není. Chybí ti pomůcka? Navrhni ji v Pomůckách.</p>}
        </div>
      </div>
      <div class="sc-demo" aria-live="polite">
        <button type="button" class="btn small sc-back" onClick={() => setDetail(false)}><I.back />Všechny pomůcky</button>
        <div class="sc-head">
          <h3>{w.title}</h3>
          {w.Question && <span class="pill st-review" title="Dá se dát i nad otázku – ukáže jen zadání">i v otázkách</span>}
          <a class="fine" href={`https://sprtam.cz/widgety/${w.name}`} target="_blank" rel="noopener noreferrer">Galerie <I.external /></a>
        </div>
        <p>{w.summary}</p>
        <p class="muted"><b>Hodí se:</b> {w.use}</p>
        <div class="sc-tools">
          {w.examples.length > 1 && (
            <div class="chips" role="group" aria-label="Příklad">
              {w.examples.map((x, i) => <button type="button" key={x.title} class={`chip ${sel.example === i ? 'on' : ''}`} aria-pressed={sel.example === i} onClick={() => choose({ ...sel, example: i })}>{x.title}</button>)}
            </div>
          )}
          {w.Question && !questionOnly && (
            <div class="seg-pick small" role="group" aria-label="Jak se ukáže">
              <button type="button" class={!question ? 'on' : ''} onClick={() => setQuestion(false)}>Ve výkladu</button>
              <button type="button" class={question ? 'on' : ''} onClick={() => setQuestion(true)}>Nad otázkou</button>
            </div>
          )}
        </div>
        <Demo name={w.name} props={w.examples[sel.example]?.props ?? w.examples[0].props} question={question && !!w.Question} />
        <p class="fine">{question && w.Question ? 'Nad otázkou pomůcka ukáže jen zadání, výsledek neprozradí.' : 'Vyzkoušej si ji – takhle ji uvidí děti.'}</p>
      </div>
    </div>
  )
}

/** The app's preview frame showing one widget, as tall as the widget. */
function Demo({ name, props, question }: { name: string; props: unknown; question: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [height, setHeight] = useState(320)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    const on = (e: MessageEvent<ToEditor>) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.type === 'ready') setReady(true)
      if (e.data?.type === 'height' && e.data.height > 0) setHeight(Math.min(e.data.height, 2000))
    }
    addEventListener('message', on)
    return () => removeEventListener('message', on)
  }, [])

  useEffect(() => {
    if (!ready) return
    const msg: ToPreview = { type: 'widget', demo: { widget: name, props: props as Record<string, unknown>, question, theme } }
    frame.current?.contentWindow?.postMessage(msg, location.origin)
  }, [ready, name, props, question, theme])

  return (
    <div class={`sc-frame ${theme}`}>
      <button type="button" class="icon s sc-theme" onClick={() => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); localStorage.setItem(THEME_KEY, t) }}
        title={theme === 'dark' ? 'Světlý vzhled' : 'Tmavý vzhled'} aria-label="Přepnout světlý a tmavý vzhled">{theme === 'dark' ? <I.sun /> : <I.moon />}</button>
      <iframe ref={frame} src="/preview.html" title="Ukázka pomůcky" style={{ height: `${height}px` }} />
    </div>
  )
}
