import { useMemo, useRef, useState, useEffect } from 'preact/hooks'
import type { Question, Topic } from '../content/types'
import { useGrading } from '../grading'
import { build, strictFor, grade, GRADE_WORD, MODES, answerText, verbal, type Item, type ModeId } from '../quiz/engine'
import { QuestionView } from '../quiz/QuestionView'
import { answered, answeredToday, getProgress, goalOf, isMistake, recordTopic, stars, useProgress } from '../progress/store'
import { dropRound, packRound, savedRoundAt, saveRound, unpackRound } from '../progress/resume'
import { back, query, setQuery } from '../router'
import { BigStars } from '../ui/Bar'
import { IClose, ICheck, IX } from '../ui/icons'
import { QrButton } from '../ui/QrShare'
import { Mascot } from '../ui/Mascot'
import { Inline } from '../ui/Inline'
import { questionTarget, Reportable, ReportButton } from '../ui/Report'
import { digit, onControl, useKeys } from '../ui/keys'

interface Answer { item: Item; ok: boolean; hint: boolean }

/** A right answer after a hint counts half. */
const points = (a: Answer) => (a.ok ? (a.hint ? 0.5 : 1) : 0)

/**
 * One round of questions. `pick` chooses them instead of the mode's rules (review rounds: Sešit chyb, Dnešní opakování),
 * and `record` = the round counts as practice of its topics (stars, recommendations). An unfinished round is saved
 * after every answer and offered again at the same address (progress/resume.ts); `label` names it on the home screen.
 */
export function Quiz({ mode, topics, pick, record = true, empty, label }: { mode: ModeId; topics: { key: string; t: Topic }[]; pick?: () => Item[]; record?: boolean; empty?: string; label?: string }) {
  const [path] = useState(() => location.pathname)
  // A round saved here before: arriving from „Pokračovat“ (?pokracovat) resumes it at once, otherwise ask.
  const [saved] = useState(() => {
    const r = savedRoundAt(path)
    const u = r?.mode === mode ? unpackRound(r, topics) : undefined
    if (r && !u) dropRound(path)
    return u
  })
  const [asking, setAsking] = useState(() => !!saved && !query().has('pokracovat'))
  useEffect(() => { if (query().has('pokracovat')) setQuery(new URLSearchParams()) }, [])
  const [round, setRound] = useState(0)
  const items = useMemo(() => (pick ? pick() : build(mode, topics)), [mode, topics, round])
  const [queue, setQueue] = useState<Item[]>(saved?.queue ?? items)
  const [i, setI] = useState(saved?.answers.length ?? 0)
  const [answers, setAnswers] = useState<Answer[]>(saved?.answers ?? [])
  const [last, setLast] = useState<boolean | null>(null)
  const [start, setStart] = useState(() => Date.now() - (saved?.ms ?? 0))
  const m = MODES[mode]
  const grading = useGrading()
  const name = label ?? (topics.length === 1 ? topics[0].t.title : m.name)

  // A new round (Znovu, Začít znovu); not on the first render, which may carry a resumed round.
  const fresh = useRef(true)
  useEffect(() => {
    if (fresh.current) { fresh.current = false; return }
    setQueue(items); setI(0); setAnswers([]); setLast(null); setStart(Date.now())
  }, [items])

  // First attempt of each item counts for the score; in Opakování wrong items come back later.
  const firstTry = useMemo(() => { const seen = new Set<Item>(); return answers.filter((a) => (seen.has(a.item) ? false : (seen.add(a.item), true))) }, [answers])
  const finished = queue.length > 0 && i >= queue.length

  // Save after every answer (the position is the number of answers: each place in the queue is answered once).
  useEffect(() => {
    if (asking) return
    if (finished) dropRound(path)
    else if (answers.length) saveRound(packRound({ path, mode, label: name, ...(mode === 'test' ? { ms: Date.now() - start } : {}) }, queue, answers.length, answers))
  }, [answers, finished, asking])

  useEffect(() => {
    if (!finished || !firstTry.length || !record) return
    const by = new Map<string, { ok: number; n: number }>()
    for (const a of firstTry) { const s = by.get(a.item.topic) ?? { ok: 0, n: 0 }; s.n++; s.ok += points(a); by.set(a.item.topic, s) }
    by.forEach((s, key) => recordTopic(key, (s.ok / s.n) * 100))
  }, [finished])

  const next = () => { setLast(null); setI(i + 1) }
  // Enter, Space or → on the feedback sheet goes on (a focused button handles Enter and Space itself).
  useKeys((e) => { if (e.key !== 'ArrowRight' && (!['Enter', ' '].includes(e.key) || onControl(e.target))) return; next(); return true }, last !== null)

  if (asking && saved) {
    return (
      <div class="page">
        <div class="empty resume-ask">
          <Mascot mood="wow" size={96} />
          <b>Máš rozdělané kolo</b>
          <span class="muted">{m.name} · odpovězeno {saved.answers.length} z {saved.queue.length}</span>
          <button class="btn block" autoFocus onClick={() => { setStart(Date.now() - saved.ms); setAsking(false) }}>Pokračovat</button>
          <button class="btn ghost block" onClick={() => { dropRound(path); setAsking(false); setRound(round + 1) }}>Začít znovu</button>
        </div>
      </div>
    )
  }

  if (!queue.length) return <div class="page"><div class="empty"><Mascot mood={empty ? 'happy' : 'sad'} size={96} />{empty ?? 'Tady zatím nejsou otázky.'}<button class="btn" onClick={back}>Zpět</button></div></div>

  if (finished) {
    const pct = Math.round((firstTry.reduce((n, a) => n + points(a), 0) / firstTry.length) * 100)
    const right = firstTry.filter((a) => a.ok).length, hinted = firstTry.filter((a) => a.ok && a.hint).length
    const g = grade(pct)
    const wrong = firstTry.filter((a) => !a.ok)
    // Marks turned off (by default in Waldorf): a sentence instead of a grade.
    const words = !m.instant && grading === 'verbal'
    return (
      <div class="page">
        <div class="result">
          <Mascot mood={pct >= 90 ? 'happy' : pct >= 60 ? 'wow' : 'sad'} size={96} />
          {m.instant || words ? <BigStars n={stars(pct)} /> : <div class={`mark m${g}`}>{g}</div>}
          <h2>{words ? verbal(pct) : m.instant ? (pct >= 90 ? 'Výborně!' : pct >= 60 ? 'Dobře!' : 'Ještě to procvič') : GRADE_WORD[g]}</h2>
          <div class="pct">{right} / {firstTry.length}{hinted > 0 && ` (${hinted} s nápovědou)`} · {pct} %</div>
          <Goal />
          {mode === 'chyby' && <MistakesLeft />}
          <div class="actions">
            <button class="btn block" onClick={() => setRound(round + 1)}>Znovu</button>
            <button class="btn ghost block" onClick={back}>Hotovo</button>
          </div>
          {!m.instant && wrong.length > 0 && (
            <div class="mistakes">
              {wrong.map((a, k) => (
                <div key={k} class="card">
                  <Reportable topic={a.item.topic} target={questionTarget(a.item)}>
                    <b><Inline text={a.item.q.question} /></b><span><Inline text={answerText(a.item.q)} /></span>
                  </Reportable>
                  {a.item.index !== undefined && <ReportButton topic={a.item.topic} target={{ kind: 'question', index: a.item.index, text: a.item.q.question }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const item = queue[i]
  const onAnswer = (ok: boolean, hint = false) => {
    answered(item.id, ok, hint, !answers.some((a) => a.item === item))
    setAnswers([...answers, { item, ok, hint }])
    if (mode === 'opakovani' && !ok) setQueue([...queue, item])
    if (m.instant) setLast(ok)
    else setTimeout(next, 350)
  }
  const hint = answers.at(-1)?.hint ?? false

  return (
    <div class="page" key={i}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <Progress queue={queue} answers={answers} i={i} instant={m.instant} />
        {mode === 'test' ? <Timer since={start} /> : <span class="timer">{i + 1}/{queue.length}</span>}
        <QrButton />
      </div>
      <Reportable topic={item.topic} target={questionTarget(item)}>
        {mode === 'zkouseni' ? <Oral q={item.q} onAnswer={(ok) => { answered(undefined, ok, false, true); setAnswers([...answers, { item, ok, hint: false }]); next() }} />
          : <QuestionView q={item.q} reveal={m.instant} strict={strictFor(item.topic)} hints={m.instant} onAnswer={onAnswer} />}
      </Reportable>
      <div class="pad-dock" />
      {last !== null && (
        <div class={`sheet ${last ? 'ok' : 'bad'}`}>
          <div>
            <div class="verdict">{last ? <ICheck /> : <IX />}{last ? 'Správně' : 'Špatně'}{last && hint && <small>s nápovědou</small>}</div>
            <Reportable topic={item.topic} target={questionTarget(item)}>
            {!last && <div class="why"><b><Inline text={answerText(item.q)} /></b>{'explanation' in item.q && item.q.explanation ? <> — <Inline text={item.q.explanation} /></> : null}</div>}
            {last && 'explanation' in item.q && item.q.explanation && <div class="why"><Inline text={item.q.explanation} /></div>}
            </Reportable>
            <button class="btn block" onClick={next} autoFocus>Dál</button>
            {item.index !== undefined && <ReportButton topic={item.topic} target={{ kind: 'question', index: item.index, text: item.q.question }} />}
          </div>
        </div>
      )}
    </div>
  )
}

/** Today's answers against the daily goal, once the round is over. */
function Goal() {
  const p = useProgress()
  const goal = goalOf(p), n = answeredToday(p)
  if (!goal) return null
  return n >= goal
    ? <div class="goal-done">🎯 Dnešní cíl splněn: {n} odpovědí</div>
    : <div class="goal-left">Do dnešního cíle zbývá {goal - n} {goal - n === 1 ? 'odpověď' : goal - n <= 4 ? 'odpovědi' : 'odpovědí'}</div>
}

function MistakesLeft() {
  const n = Object.values(getProgress().q ?? {}).filter(isMistake).length
  return <div class="muted">{n ? `V sešitu chyb zbývá ${n} ${n === 1 ? 'otázka' : n <= 4 ? 'otázky' : 'otázek'}. Zmizí, až je dvakrát zodpovíš správně.` : 'Sešit chyb je prázdný. Paráda!'}</div>
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
  useKeys((e) => {
    const n = digit(e), k = e.key.toLowerCase()
    if (!shown) { if ((e.key === 'Enter' || e.key === ' ') && !onControl(e.target)) { setShown(true); return true } return }
    if (n === 1 || k === 'n') onAnswer(false)
    else if (n === 2 || k === 'v') onAnswer(true)
    else return
    return true
  })
  return (
    <div class="oral">
      <h2 class="question"><Inline text={q.question} /></h2>
      {q.type === 'choice' && !shown && <div class="muted">Odpověz nahlas, bez možností.</div>}
      {!shown ? <button class="btn block" onClick={() => setShown(true)}>Ukázat odpověď</button> : (
        <>
          <div class="card ans"><Inline text={answerText(q)} /></div>
          <div class="self">
            <button class="btn" onClick={() => onAnswer(false)}><IX /> Nevěděl/a<kbd class="key-hint">1</kbd></button>
            <button class="btn" onClick={() => onAnswer(true)}><ICheck /> Věděl/a<kbd class="key-hint">2</kbd></button>
          </div>
        </>
      )}
    </div>
  )
}
