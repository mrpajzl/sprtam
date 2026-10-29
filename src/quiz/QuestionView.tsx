import { useMemo, useRef, useState, useEffect } from 'preact/hooks'
import type { Question } from '../content/types'
import { Inline } from '../ui/Inline'
import { IBulb, IDown, IUp } from '../ui/icons'
import { checkInput, gapChoice } from './engine'
import { WidgetQuestion } from '../widgets/view'

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

/**
 * One question. Calls `onAnswer(correct, hinted)` exactly once.
 * `reveal` = colour the options right/wrong after answering. `hints` = the question's hints may be opened (not in exams).
 */
export function QuestionView({ q, reveal, strict = true, hints = false, onAnswer }: { q: Question; reveal: boolean; strict?: boolean; hints?: boolean; onAnswer: (ok: boolean, hinted: boolean) => void }) {
  const [done, setDone] = useState(false)
  const [shown, setShown] = useState(0)
  const answer = (ok: boolean) => { if (done) return; setDone(true); onAnswer(ok, shown > 0) }
  const list = hints && 'hints' in q ? q.hints ?? [] : []
  const gap = useMemo(() => (q.type === 'input' ? gapChoice(q, strict) : null), [q, strict])
  const [filled, setFilled] = useState<string | null>(null)
  const text = gap ? fillGap(q.question, filled) : q.question
  return (
    <div>
      <h2 class="question"><Inline text={text} /></h2>
      {q.type === 'input' && q.widget && <WidgetQuestion w={q.widget} />}
      {list.length > 0 && (shown > 0 || !done) && (
        <div class="hints" aria-live="polite">
          {list.slice(0, shown).map((h, i) => <p key={i} class="hint"><IBulb /><span><Inline text={h} /></span></p>)}
          {!done && shown < list.length && (
            <button type="button" class="hint-key" onClick={() => setShown(shown + 1)}>
              <IBulb />{shown === 0 ? 'Nápověda' : 'Další nápověda'}{list.length > 1 && <small>{shown + 1}/{list.length}</small>}
            </button>
          )}
        </div>
      )}
      {q.type === 'choice' && <Choice q={q} done={done} reveal={reveal} answer={answer} />}
      {q.type === 'truefalse' && <TrueFalse q={q} done={done} reveal={reveal} answer={answer} />}
      {q.type === 'input' && (gap
        ? <Pick options={gap.options} correct={gap.answer} done={done} reveal={reveal} answer={(i) => { setFilled(gap.options[reveal ? gap.answer : i]); answer(i === gap.answer) }} />
        : <Input q={q} done={done} reveal={reveal} answer={answer} strict={strict} />)}
      {q.type === 'order' && <Order q={q} done={done} reveal={reveal} answer={answer} />}
      {q.type === 'match' && <Pair q={q} done={done} answer={answer} />}
    </div>
  )
}

type P<T> = { q: T; done: boolean; reveal: boolean; answer: (ok: boolean) => void }

function Choice({ q, done, reveal, answer }: P<Extract<Question, { type: 'choice' }>>) {
  const order = useMemo(() => shuffle(q.options.map((_, i) => i)), [q])
  const [pick, setPick] = useState<number | null>(null)
  return (
    <div class="opts">
      {order.map((i) => {
        const cls = !done ? '' : reveal ? (i === q.answer ? 'ok' : i === pick ? 'bad' : '') : i === pick ? 'sel' : ''
        return <button key={i} class={`opt ${cls}`} onClick={() => { if (done) return; setPick(i); answer(i === q.answer) }}><Inline text={q.options[i]} /></button>
      })}
    </div>
  )
}

function TrueFalse({ q, done, reveal, answer }: P<Extract<Question, { type: 'truefalse' }>>) {
  const [pick, setPick] = useState<boolean | null>(null)
  const cls = (v: boolean) => (!done ? '' : reveal ? (v === q.answer ? 'ok' : v === pick ? 'bad' : '') : v === pick ? 'sel' : '')
  return (
    <div class="tf">
      <button class={`opt ${cls(true)}`} onClick={() => { if (done) return; setPick(true); answer(q.answer) }}>Pravda</button>
      <button class={`opt ${cls(false)}`} onClick={() => { if (done) return; setPick(false); answer(!q.answer) }}>Nepravda</button>
    </div>
  )
}

/** The question of a tap-to-fill blank: typing instructions dropped, the blank filled once answered. */
function fillGap(question: string, filled: string | null) {
  const t = question.replace(/\s*Napiš jen písmeno\.?/iu, '').replace(/ a napiš celé slovo/iu, '').replace(/^Napiš správně celé slovo:/u, 'Doplň:')
  return filled === null ? t : t.replace(/_+|…{2,}/u, `**${filled}**`)
}

/** Fill-in-the-blank answered by tapping: „Doplň y/i: t_gr“ → [y] [i], no keyboard. Options keep the question's order. */
function Pick({ options, correct, done, reveal, answer }: { options: string[]; correct: number; done: boolean; reveal: boolean; answer: (i: number) => void }) {
  const [pick, setPick] = useState<number | null>(null)
  const long = options.some((o) => o.length > 3)
  return (
    <div class={`tf pick ${long ? 'long' : ''}`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o, i) => {
        const cls = !done ? '' : reveal ? (i === correct ? 'ok' : i === pick ? 'bad' : '') : i === pick ? 'sel' : ''
        return <button key={i} class={`opt ${cls}`} onClick={() => { if (done) return; setPick(i); answer(i) }}>{o}</button>
      })}
    </div>
  )
}

function Input({ q, done, reveal, answer, strict }: P<Extract<Question, { type: 'input' }>> & { strict: boolean }) {
  const [v, setV] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [q])
  const numeric = q.answers.every((a) => /^[−-]?[\d\s]+([,.]\d+)?$/.test(a))
  const submit = (e?: Event) => { e?.preventDefault(); if (done || !v.trim()) return; const r = checkInput(v, q.answers, strict); setOk(r); answer(r) }
  return (
    <form class="stack" onSubmit={submit}>
      <input ref={ref} class={`answer-input ${done && reveal ? (ok ? 'ok' : 'bad') : ''}`} value={v} onInput={(e) => setV(e.currentTarget.value)} disabled={done}
        inputMode={numeric ? 'decimal' : 'text'} autocomplete="off" autocapitalize="off" spellcheck={false} enterKeyHint="done" aria-label="Odpověď" />
      {!done && <button class="btn block" type="submit" disabled={!v.trim()}>Odpovědět</button>}
    </form>
  )
}

function Order({ q, done, reveal, answer }: P<Extract<Question, { type: 'order' }>>) {
  const [list, setList] = useState(() => { let s = shuffle(q.items); while (s.length > 1 && s.every((x, i) => x === q.items[i])) s = shuffle(q.items); return s })
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; setList(n) }
  return (
    <div class="stack">
      <div class="order">
        {list.map((it, i) => (
          <div key={it} class={`opt ${done && reveal ? (it === q.items[i] ? 'ok' : 'bad') : ''}`}>
            <span><Inline text={it} /></span>
            {!done && <>
              <button class="mv" onClick={() => move(i, -1)} aria-label="Nahoru" disabled={i === 0}><IUp /></button>
              <button class="mv" onClick={() => move(i, 1)} aria-label="Dolů" disabled={i === list.length - 1}><IDown /></button>
            </>}
          </div>
        ))}
      </div>
      {!done && <button class="btn block" onClick={() => answer(list.every((x, i) => x === q.items[i]))}>Hotovo</button>}
    </div>
  )
}

function Pair({ q, done, answer }: Omit<P<Extract<Question, { type: 'match' }>>, 'reveal'>) {
  const right = useMemo(() => shuffle(q.pairs.map((_, i) => i)), [q])
  const [l, setL] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [miss, setMiss] = useState(0)
  const [bad, setBad] = useState<number | null>(null)
  const tapRight = (i: number) => {
    if (l === null || done) return
    if (i === l) {
      const m = new Set(matched).add(i); setMatched(m); setL(null)
      if (m.size === q.pairs.length) answer(miss === 0)
    } else { setMiss(miss + 1); setBad(i); setTimeout(() => setBad(null), 400) }
  }
  return (
    <div class="pairs">
      <div class="col">{q.pairs.map(([a], i) => <button key={i} class={`opt ${matched.has(i) ? 'done' : ''} ${l === i ? 'sel' : ''}`} onClick={() => setL(i)}><Inline text={a} /></button>)}</div>
      <div class="col">{right.map((i) => <button key={i} class={`opt ${matched.has(i) ? 'done' : ''} ${bad === i ? 'bad' : ''}`} onClick={() => tapRight(i)}><Inline text={q.pairs[i][1]} /></button>)}</div>
    </div>
  )
}
