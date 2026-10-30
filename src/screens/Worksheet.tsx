import { useMemo, useState } from 'preact/hooks'
import { loadSubject } from '../content'
import { GRADE_NAME, subjectMeta } from '../content/curriculum'
import type { GradeId, Question, SubjectId, Topic } from '../content/types'
import { listed } from '../approach'
import { GENERATORS } from '../quiz/generators'
import { titles, useTitle } from '../seo'
import { Bar } from '../ui/Bar'
import { subjectStyle } from '../ui/glyphs'
import { IPrint, IShuffle } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { useAsync } from '../ui/useAsync'

// Pracovní list (/g/<grade>/<subject>/<topic>/tisk, a plan's /plan/<id>/tisk): questions of topics to print or save as
// PDF, with room for the answers and the solutions on a page of their own. Made in the device (window.print), nothing
// is sent anywhere. Questions with an interactive widget are left out: paper cannot show them.

const COUNTS = [10, 20, 0] as const
type Count = (typeof COUNTS)[number]
const LETTERS = 'abcdefghij'

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

interface Sheet { q: Question; order?: number[] }

/** Questions for the sheet: as many as asked for (0 = all), spread over the topics, a third generated where a topic has a generator. */
const paper = (q: Question) => !(q.type === 'input' && q.widget)
const generates = (t: Topic) => !!(t.generator && GENERATORS[t.generator])

function pick(topics: Topic[], count: number): Sheet[] {
  const pools = topics.map((t) => shuffle(t.questions.filter(paper)))
  const all = pools.flat()
  const gen = topics.flatMap((t) => (generates(t) ? [GENERATORS[t.generator!]] : []))
  let qs: Question[]
  if (!count) qs = all
  else {
    const made = gen.length ? Math.ceil(count / 3) : 0
    const per = Math.max(1, Math.ceil((count - made) / Math.max(1, pools.length)))
    // Generated examples may come with a widget (written calculation): only those that go on paper.
    const made_: Question[] = []
    for (let i = 0; made_.length < made && i < made * 5; i++) { const q = gen[i % gen.length](); if (paper(q)) made_.push(q) }
    qs = [...shuffle(pools.flatMap((p) => p.slice(0, per))).slice(0, count - made_.length), ...made_]
  }
  return shuffle(qs).map((q) => ({ q, order: q.type === 'choice' ? shuffle(q.options.map((_, i) => i)) : q.type === 'order' || q.type === 'match' ? shuffle(q.type === 'order' ? q.items.map((_, i) => i) : q.pairs.map((_, i) => i)) : undefined }))
}

export function TopicWorksheet({ g, s, id }: { g: GradeId; s: SubjectId; id: string }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const topic = subj?.topics.find((t) => t.id === id)
  useTitle(topic && `Pracovní list: ${titles.topic(g, s, topic.title)}`)
  if (subj === undefined) return <div class="page" />
  if (!topic) return <div class="page"><Bar title="Pracovní list" /><div class="empty">Téma nenalezeno.</div></div>
  return (
    <div style={subjectStyle(s)}>
      <Worksheet title={`${topic.emoji} ${topic.title}`} sub={`${GRADE_NAME[g]} · ${subjectMeta(s).name}`} topics={[topic]} />
    </div>
  )
}

/** A sheet of questions from the given topics. */
export function Worksheet({ title, sub, topics }: { title: string; sub: string; topics: Topic[] }) {
  const [chosen, setCount] = useState<Count>(10)
  const [solutions, setSolutions] = useState(true)
  const [seed, setSeed] = useState(0)
  const usable = topics.filter((t) => listed(t) || topics.length === 1)
  // Only counts the topics can fill: a topic of 15 questions offers 10 and all 15, not 20 (generated examples have no end).
  const onPaper = usable.reduce((n, t) => n + t.questions.filter(paper).length, 0)
  const endless = usable.some(generates)
  const counts = COUNTS.filter((n) => !n || endless || n < onPaper)
  const count = counts.includes(chosen) ? chosen : counts[0]
  const sheet = useMemo(() => pick(usable, count), [count, seed, usable.map((t) => t.id).join()])
  return (
    <div class="page worksheet-page">
      <Bar title="Pracovní list" />
      <div class="ws-controls">
        <div class="seg" role="radiogroup" aria-label="Počet otázek">
          {counts.map((n) => <button key={n} role="radio" aria-checked={count === n} class={count === n ? 'on' : ''} onClick={() => setCount(n)}>{n ? `${n} otázek` : endless ? 'Všechny' : `Všech ${onPaper}`}</button>)}
        </div>
        <label class="ws-check"><input type="checkbox" checked={solutions} onChange={(e) => setSolutions(e.currentTarget.checked)} />Řešení na zvláštní stránce</label>
        <div class="ws-actions">
          <button class="btn ghost" onClick={() => setSeed(seed + 1)}><IShuffle />Jiné otázky</button>
          <button class="btn" onClick={() => print()}><IPrint />Vytisknout</button>
        </div>
        <p class="muted note">Do PDF ho uložíš v okně tisku (Uložit jako PDF). Otázky s interaktivní pomůckou na papír nejdou, ty tu nejsou.</p>
      </div>
      <article class="worksheet" aria-label="Náhled pracovního listu">
        <header class="ws-head">
          <div><h1>{title}</h1><small>{sub}</small></div>
          <div class="ws-name"><span>Jméno:</span><span>Datum:</span></div>
        </header>
        {sheet.length ? <ol class="ws-qs">{sheet.map((x, i) => <li key={`${seed}/${i}`}><PaperQuestion x={x} /></li>)}</ol> : <p class="muted">K tomuhle tématu nejsou otázky, které jdou na papír.</p>}
        {solutions && sheet.length > 0 && (
          <section class="ws-solutions">
            <h2>Řešení: {title}</h2>
            <ol>{sheet.map((x, i) => <li key={i}><Inline text={solution(x)} /></li>)}</ol>
          </section>
        )}
        <footer class="ws-foot">sprtam.cz · učivo pod licencí CC BY-SA 4.0</footer>
      </article>
    </div>
  )
}

function PaperQuestion({ x }: { x: Sheet }) {
  const { q, order = [] } = x
  return (
    <>
      <p class="ws-q"><Inline text={q.question} /></p>
      {q.type === 'choice' && <ul class="ws-opts">{order.map((o, k) => <li key={o}><span class="ws-box" />{LETTERS[k]}) <Inline text={q.options[o]} /></li>)}</ul>}
      {q.type === 'truefalse' && <ul class="ws-opts ws-row"><li><span class="ws-box" />Pravda</li><li><span class="ws-box" />Nepravda</li></ul>}
      {q.type === 'input' && <div class="ws-line">Odpověď:</div>}
      {q.type === 'open' && <><div class="ws-line" /><div class="ws-line" /><div class="ws-line" /></>}
      {q.type === 'order' && <><small class="ws-how">Očísluj ve správném pořadí.</small><ul class="ws-opts">{order.map((o) => <li key={o}><span class="ws-box wide" /><Inline text={q.items[o]} /></li>)}</ul></>}
      {q.type === 'match' && (
        <>
          <small class="ws-how">Ke každému číslu napiš písmeno, které k němu patří.</small>
          <div class="ws-match">
            <ol>{q.pairs.map(([a], k) => <li key={k}><Inline text={a} /> <span class="ws-gap" /></li>)}</ol>
            <ul>{order.map((o, k) => <li key={o}>{LETTERS[k].toUpperCase()}) <Inline text={q.pairs[o][1]} /></li>)}</ul>
          </div>
        </>
      )}
    </>
  )
}

/** The answer key of one question, as inline markup. */
function solution({ q, order = [] }: Sheet): string {
  switch (q.type) {
    case 'choice': return `${LETTERS[order.indexOf(q.answer)]}) ${q.options[q.answer]}`
    case 'truefalse': return q.answer ? 'Pravda' : 'Nepravda'
    case 'input': return q.answers[0]
    case 'open': return q.answer
    case 'order': return order.map((o) => `${o + 1}`).join(', ') + ` (${q.items.join(' → ')})`
    case 'match': return q.pairs.map((_, k) => `${k + 1} – ${LETTERS[order.indexOf(k)].toUpperCase()}`).join(', ')
  }
}
