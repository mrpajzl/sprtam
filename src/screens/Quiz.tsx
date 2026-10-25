import { useMemo, useState, useEffect } from 'preact/hooks'
import type { Question, Topic } from '../content/types'
import { approachById, getApproach } from '../approach'
import { build, strictFor, grade, GRADE_WORD, MODES, answerText, verbal, type Item, type ModeId } from '../quiz/engine'
import { QuestionView } from '../quiz/QuestionView'
import { recordTopic, stars } from '../progress/store'
import { back } from '../router'
import { BigStars } from '../ui/Bar'
import { IClose, ICheck, IX } from '../ui/icons'
import { QrButton } from '../ui/QrShare'
import { Mascot } from '../ui/Mascot'
import { Inline } from '../ui/Inline'

interface Answer { item: Item; ok: boolean }

export function Quiz({ mode, topics }: { mode: ModeId; topics: { key: string; t: Topic }[] }) {
  const [round, setRound] = useState(0)
  const items = useMemo(() => build(mode, topics), [mode, topics, round])
  const [queue, setQueue] = useState<Item[]>(items)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [last, setLast] = useState<boolean | null>(null)
  const [start] = useState(Date.now())
  const m = MODES[mode]

  useEffect(() => { setQueue(items); setI(0); setAnswers([]); setLast(null) }, [items])

  // First attempt of each item counts for the score; in Opakování wrong items come back later.
  const firstTry = useMemo(() => { const seen = new Set<Item>(); return answers.filter((a) => (seen.has(a.item) ? false : (seen.add(a.item), true))) }, [answers])
  const finished = queue.length > 0 && i >= queue.length

  useEffect(() => {
    if (!finished || !firstTry.length) return
    const by = new Map<string, { ok: number; n: number }>()
    for (const a of firstTry) { const s = by.get(a.item.topic) ?? { ok: 0, n: 0 }; s.n++; if (a.ok) s.ok++; by.set(a.item.topic, s) }
    by.forEach((s, key) => recordTopic(key, (s.ok / s.n) * 100))
  }, [finished])

  if (!queue.length) return <div class="page"><div class="empty"><Mascot mood="sad" size={96} />Tady zatím nejsou otázky.<button class="btn" onClick={back}>Zpět</button></div></div>

  if (finished) {
    const pct = Math.round((firstTry.filter((a) => a.ok).length / firstTry.length) * 100)
    const g = grade(pct)
    const wrong = firstTry.filter((a) => !a.ok)
    // Approaches without marks (Waldorf) get a sentence instead of a grade.
    const words = !m.instant && approachById(getApproach())?.grading === 'verbal'
    return (
      <div class="page">
        <div class="result">
          <Mascot mood={pct >= 90 ? 'happy' : pct >= 60 ? 'wow' : 'sad'} size={96} />
          {m.instant || words ? <BigStars n={stars(pct)} /> : <div class={`mark m${g}`}>{g}</div>}
          <h2>{words ? verbal(pct) : m.instant ? (pct >= 90 ? 'Výborně!' : pct >= 60 ? 'Dobře!' : 'Ještě to procvič') : GRADE_WORD[g]}</h2>
          <div class="pct">{firstTry.filter((a) => a.ok).length} / {firstTry.length} · {pct} %</div>
          <div class="actions">
            <button class="btn block" onClick={() => setRound(round + 1)}>Znovu</button>
            <button class="btn ghost block" onClick={back}>Hotovo</button>
          </div>
          {!m.instant && wrong.length > 0 && (
            <div class="mistakes">
              {wrong.map((a, k) => (
                <div key={k} class="card"><b><Inline text={a.item.q.question} /></b><span><Inline text={answerText(a.item.q)} /></span></div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const item = queue[i]
  const next = () => { setLast(null); setI(i + 1) }
  const onAnswer = (ok: boolean) => {
    setAnswers([...answers, { item, ok }])
    if (mode === 'opakovani' && !ok) setQueue([...queue, item])
    if (m.instant) setLast(ok)
    else setTimeout(next, 350)
  }

  return (
    <div class="page" key={i}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <Progress queue={queue} answers={answers} i={i} instant={m.instant} />
        {mode === 'test' ? <Timer since={start} /> : <span class="timer">{i + 1}/{queue.length}</span>}
        <QrButton />
      </div>
      {mode === 'zkouseni' ? <Oral q={item.q} onAnswer={(ok) => { setAnswers([...answers, { item, ok }]); next() }} />
        : <QuestionView q={item.q} reveal={m.instant} strict={strictFor(item.topic)} onAnswer={onAnswer} />}
      <div class="pad-dock" />
      {last !== null && (
        <div class={`sheet ${last ? 'ok' : 'bad'}`}>
          <div>
            <div class="verdict">{last ? <ICheck /> : <IX />}{last ? 'Správně' : 'Špatně'}</div>
            {!last && <div class="why"><b><Inline text={answerText(item.q)} /></b>{'explanation' in item.q && item.q.explanation ? <> — <Inline text={item.q.explanation} /></> : null}</div>}
            {last && 'explanation' in item.q && item.q.explanation && <div class="why"><Inline text={item.q.explanation} /></div>}
            <button class="btn block" onClick={next} autoFocus>Dál</button>
          </div>
        </div>
      )}
    </div>
  )
}

/** One LED per question: green/red once answered (only where feedback is instant). */
function Progress({ queue, answers, i, instant }: { queue: Item[]; answers: Answer[]; i: number; instant: boolean }) {
  return (
    <div class="steps-meter" role="progressbar" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={i}>
      {queue.map((_, k) => <i key={k} class={k < answers.length ? (instant ? (answers[k].ok ? 'ok' : 'bad') : 'done') : k === i ? 'now' : ''} />)}
    </div>
  )
}

function Timer({ since }: { since: number }) {
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t) }, [])
  const s = Math.floor((Date.now() - since) / 1000)
  return <span class="timer">{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>
}

/** Oral exam: think or say the answer aloud, reveal, then be honest. */
function Oral({ q, onAnswer }: { q: Question; onAnswer: (ok: boolean) => void }) {
  const [shown, setShown] = useState(false)
  return (
    <div class="oral">
      <h2 class="question"><Inline text={q.question} /></h2>
      {q.type === 'choice' && !shown && <div class="muted">Odpověz nahlas, bez možností.</div>}
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
