import { render } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import '../../../src/styles.css'
import './preview.css'
import { GRADE_NAME, SUBJECTS } from '../../../src/content/curriculum'
import type { Question } from '../../../src/content/types'
import { answerText, MODES, strictFor, type ModeId } from '../../../src/quiz/engine'
import { QuestionView } from '../../../src/quiz/QuestionView'
import { BlockView } from '../../../src/screens/Blocks'
import { Inline } from '../../../src/ui/Inline'
import { keyStyle, subjectStyle } from '../../../src/ui/glyphs'
import { WidgetQuestion } from '../../../src/widgets'
import { IArrow, IBack, IBolt, IBulb, ICheck, IClose, IMic, IPencil, IPin, IQr, IRepeat, IX } from '../../../src/ui/icons'
import type { KeyColor } from '../../../src/content/curriculum'
import type { PreviewMode, PreviewState, ToEditor, ToPreview, WidgetDemo } from './protocol'

// The preview frame: the topic drawn by the app's own components and stylesheet (src/screens/Blocks.tsx,
// src/quiz/QuestionView.tsx, src/styles.css), in the same markup as the topic screen and the quiz –
// what the author sees is what pupils will see.

const send = (m: ToEditor) => parent.postMessage(m, location.origin)

function Preview() {
  const [st, setSt] = useState<PreviewState | null>(null)
  const [demo, setDemo] = useState<WidgetDemo | null>(null)
  useEffect(() => {
    const on = (e: MessageEvent<ToPreview>) => {
      if (e.origin !== location.origin || e.source !== parent) return
      const theme = e.data?.type === 'state' ? e.data.state.theme : e.data?.type === 'widget' ? e.data.demo.theme : null
      if (!theme) return
      if (e.data.type === 'state') setSt(e.data.state)
      if (e.data.type === 'widget') setDemo(e.data.demo)
      document.documentElement.dataset.theme = theme
      if (theme === 'light') delete document.documentElement.dataset.theme
    }
    addEventListener('message', on)
    send({ type: 'ready' })
    return () => removeEventListener('message', on)
  }, [])
  if (demo) return <Demo d={demo} />
  if (!st) return <div class="page" />
  const setMode = (mode: PreviewMode) => send({ type: 'mode', mode })
  return st.mode.kind === 'quiz'
    ? <QuizPreview st={st} q={st.mode.q} setMode={setMode} />
    : <TopicPreview st={st} ex={st.mode.ex} block={st.mode.block} setMode={setMode} />
}

/** One widget as pupils see it – in the explanation, or only its task above a question. Reports its height so the gallery can fit the frame to it. */
function Demo({ d }: { d: WidgetDemo }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => send({ type: 'height', height: Math.ceil(el.getBoundingClientRect().height) }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const key = `${d.widget}:${d.question}:${JSON.stringify(d.props)}`
  return (
    <div class="page demo" ref={ref}>
      {d.question
        ? <div class="card" key={key}><WidgetQuestion w={d} /></div>
        : <div class="blocks" key={key}><BlockView b={{ type: 'widget', widget: d.widget, props: d.props }} /></div>}
    </div>
  )
}

const MODE_KEY: [ModeId, () => preact.JSX.Element, KeyColor][] = [['kviz', IBolt, 'orange'], ['opakovani', IRepeat, 'blue'], ['pisemka', IPencil, 'yellow'], ['zkouseni', IMic, 'green']]

function Bar({ st, title }: { st: PreviewState; title: string }) {
  return (
    <header class="bar">
      <span class="icon-btn"><IBack /></span>
      <span class="spacer balance" />
      <div class="bar-title">
        <nav class="crumbs"><a>{GRADE_NAME[st.grade]}</a><a>{SUBJECTS[st.subject].name}</a></nav>
        <h1>{title}</h1>
      </div>
      <span class="icon-btn pin"><IPin /></span>
      <span class="icon-btn"><IQr /></span>
    </header>
  )
}

function TopicPreview({ st, ex, block, setMode }: { st: PreviewState; ex: number; block?: number; setMode: (m: PreviewMode) => void }) {
  const t = st.topic
  const general = t.explanations.flatMap((x, i) => (x.approach ? [] : [i]))
  const special = t.explanations.flatMap((x, i) => (x.approach ? [i] : []))
  const shown = [...special, ...general]
  const current = t.explanations[ex] ? ex : shown[0] ?? 0
  const other = general.length > 1 ? general[(general.indexOf(current) + 1) % general.length] : undefined
  const blocksRef = useRef<HTMLDivElement>(null)

  // Mark and scroll to the block being edited.
  useLayoutEffect(() => {
    const els = blocksRef.current ? Array.from(blocksRef.current.children) : []
    els.forEach((el, i) => el.classList.toggle('mod-focus', i === block))
    if (block !== undefined && els[block]) els[block].scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [block, ex, st.topic])

  const x = t.explanations[current]
  return (
    <div class="page" style={subjectStyle(st.subject)}>
      <Bar st={st} title={`${t.emoji} ${t.title}`} />
      {shown.length > 0 && (
        <div class="seg" role="tablist">
          {shown.map((i) => {
            const a = st.approaches.find((y) => y.id === t.explanations[i].approach)
            return <button key={i} role="tab" aria-selected={current === i} class={current === i ? 'on' : ''} onClick={() => setMode({ kind: 'topic', ex: i })}>{a ? `${a.emoji} ` : ''}{t.explanations[i].title || '…'}</button>
          })}
        </div>
      )}
      {x && <div class="blocks" ref={blocksRef}>{x.blocks.map((b, i) => <BlockView key={`${current}:${i}:${JSON.stringify(b)}`} b={b} />)}</div>}
      {other !== undefined && other !== current && (
        <button class="other" onClick={() => setMode({ kind: 'topic', ex: other })}><IBulb />Nerozumím – vysvětli to jinak: {t.explanations[other].title}</button>
      )}
      <div class="modes">
        {MODE_KEY.map(([m, I, c]) => (
          <button key={m} class="mode" onClick={() => setMode({ kind: 'quiz', q: 0 })}>
            <span class="skey m" style={keyStyle(c)}><I /></span><b>{MODES[m].name}</b><small>{MODES[m].hint}</small>
          </button>
        ))}
      </div>
      <h2 class="label next-label">Další téma</h2>
      <span class="row"><span class="em">➡️</span><b>…</b><IArrow /></span>
    </div>
  )
}

function QuizPreview({ st, q, setMode }: { st: PreviewState; q: number; setMode: (m: PreviewMode) => void }) {
  const qs = st.topic.questions
  const [results, setResults] = useState<Record<number, boolean>>({})
  const [last, setLast] = useState<boolean | null>(null)
  const item = qs[Math.min(q, qs.length - 1)] as Question | undefined
  const sig = useMemo(() => JSON.stringify(item), [item])
  useEffect(() => setLast(null), [q, sig])
  if (!item) return <div class="page"><div class="empty">Zatím tu nejsou otázky.</div></div>
  const i = Math.min(q, qs.length - 1)
  const next = () => setMode(i + 1 < qs.length ? { kind: 'quiz', q: i + 1 } : { kind: 'topic', ex: 0 })
  const answer = (ok: boolean) => { setResults((r) => ({ ...r, [i]: ok })); setLast(ok) }
  return (
    <div class="page" style={subjectStyle(st.subject)} key={`${i}:${sig}`}>
      <div class="qtop">
        <button class="icon-btn" onClick={() => setMode({ kind: 'topic', ex: 0 })} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter">{qs.map((_, k) => <i key={k} class={k in results && k !== i ? (results[k] ? 'ok' : 'bad') : k === i ? 'now' : ''} />)}</div>
        <span class="timer">{i + 1}/{qs.length}</span>
        <span class="icon-btn"><IQr /></span>
      </div>
      {item.type === 'open'
        ? <Oral q={item} onAnswer={(ok) => { setResults((r) => ({ ...r, [i]: ok })); next() }} />
        : <QuestionView q={item} reveal strict={strictFor(`${st.grade}/${st.subject}/x`)} onAnswer={answer} />}
      <div class="pad-dock" />
      {last !== null && (
        <div class={`sheet ${last ? 'ok' : 'bad'}`}>
          <div>
            <div class="verdict">{last ? <ICheck /> : <IX />}{last ? 'Správně' : 'Špatně'}</div>
            {!last && <div class="why"><b><Inline text={answerText(item)} /></b>{'explanation' in item && item.explanation ? <> — <Inline text={item.explanation} /></> : null}</div>}
            {last && 'explanation' in item && item.explanation && <div class="why"><Inline text={item.explanation} /></div>}
            <button class="btn block" onClick={next}>Dál</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Oral({ q, onAnswer }: { q: Question; onAnswer: (ok: boolean) => void }) {
  const [shown, setShown] = useState(false)
  return (
    <div class="oral">
      <h2 class="question"><Inline text={q.question} /></h2>
      {!shown ? <button class="btn block" onClick={() => setShown(true)}>Ukázat odpověď</button> : (
        <>
          <div class="card ans"><Inline text={answerText(q)} /></div>
          <div class="self">
            <button class="btn" onClick={() => onAnswer(false)}><IX /> Nevěděl/a</button>
            <button class="btn" onClick={() => onAnswer(true)}><ICheck /> Věděl/a</button>
          </div>
        </>
      )}
    </div>
  )
}

render(<Preview />, document.getElementById('app')!)
