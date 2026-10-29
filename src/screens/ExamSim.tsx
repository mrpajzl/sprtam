import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { loadTopic } from '../content'
import type { Topic } from '../content/types'
import { loadIndex, refFor } from '../content/library'
import { EXAM, partTopics, type ExamPart } from '../exam'
import { answerText, buildAreas, MODES, strictFor, type Item } from '../quiz/engine'
import { QuestionView } from '../quiz/QuestionView'
import { answered, recordTopic } from '../progress/store'
import { dropRound, packRound, savedRoundAt, saveRound, unpackRound } from '../progress/resume'
import { back, query, setQuery } from '../router'
import { Bar, Meter } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IClose } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { Mascot } from '../ui/Mascot'
import { QrButton } from '../ui/QrShare'
import { ReportButton } from '../ui/Report'
import { useAsync } from '../ui/useAsync'

// Ostrá simulace přijímaček (/prijimacky/<subject>/simulace): one test of the whole part on the clock, like the real
// exam – the part's minutes, MODES.simulace.count questions spread over its areas, no hints and no feedback until the
// end. Questions can be skipped and come back to; when the time is up, the test is handed in. The result is points
// out of the part's points and how each area went. The clock stops while the test is closed (progress/resume.ts).

const STYLE = keyStyle('orange')
const MODE = MODES.simulace

interface Answer { item: Item; ok: boolean; hint: boolean }

export function ExamSim({ pt }: { pt: ExamPart }) {
  const topics = useAsync(async () => {
    await loadIndex()
    const refs = partTopics(pt).flatMap((k) => refFor(k) ?? [])
    const loaded = await Promise.all(refs.map((r) => loadTopic(r.g, r.s, r.id).catch(() => null)))
    return refs.flatMap((r, i) => (loaded[i] ? [{ key: r.key, t: loaded[i]! }] : []))
  }, [pt.s])
  if (!topics) return <div class="page" />
  return <div style={STYLE}><Sim pt={pt} topics={topics} /></div>
}

function Sim({ pt, topics }: { pt: ExamPart; topics: { key: string; t: Topic }[] }) {
  const [path] = useState(() => location.pathname)
  const limit = pt.minutes * 60_000
  const label = `${EXAM.name} · ${pt.title}`
  const [saved] = useState(() => {
    const r = savedRoundAt(path)
    const u = r?.mode === 'simulace' ? unpackRound(r, topics) : undefined
    if (r && !u) dropRound(path)
    return u
  })
  const [round, setRound] = useState(0)
  const [queue, setQueue] = useState<Item[]>(() => saved?.queue ?? [])
  const [answers, setAnswers] = useState<Answer[]>(() => saved?.answers ?? [])
  const [pos, setPos] = useState(saved?.i ?? 0)
  // Time spent before this sitting (a resumed test) and when this sitting started; null = not started yet.
  const [spent, setSpent] = useState(saved?.ms ?? 0)
  const [since, setSince] = useState<number | null>(() => (saved && query().has('pokracovat') ? Date.now() : null))
  const [done, setDone] = useState(false)
  useEffect(() => { if (query().has('pokracovat')) setQuery(new URLSearchParams()) }, [])

  const areaOf = useMemo(() => { const m = new Map<string, number>(); pt.areas.forEach((a, i) => a.topics.forEach((k) => { if (!m.has(k)) m.set(k, i) })); return m }, [pt])
  const elapsed = () => spent + (since === null ? 0 : Date.now() - since)
  const answeredSet = useMemo(() => new Set(answers.map((a) => a.item)), [answers])

  const start = (fresh: boolean) => {
    if (fresh) {
      dropRound(path)
      setQueue(buildAreas(pt.areas.map((a) => a.topics), topics, MODE.count))
      setAnswers([]); setPos(0); setSpent(0); setDone(false); setRound(round + 1)
      over.current = false
    }
    setSince(Date.now())
  }

  // Set at once when the test is handed in: a save still pending in an effect's cleanup must not bring it back.
  const over = useRef(false)
  const finish = () => {
    if (over.current) return
    over.current = true
    setDone(true)
    dropRound(path)
    // Stars of the topics from the answered questions (a question left out for lack of time says nothing about a topic).
    const by = new Map<string, { ok: number; n: number }>()
    for (const a of answers) { const s = by.get(a.item.topic) ?? { ok: 0, n: 0 }; s.n++; s.ok += a.ok ? 1 : 0; by.set(a.item.topic, s) }
    by.forEach((s, key) => recordTopic(key, (s.ok / s.n) * 100))
  }

  // Save after every answer and move, and when the page is hidden (the clock with it).
  useEffect(() => {
    if (since === null || done || !queue.length) return
    const save = () => over.current || saveRound(packRound({ path, mode: 'simulace', label, ms: elapsed() }, queue, pos, answers))
    save()
    const hide = () => { if (document.visibilityState === 'hidden') save() }
    document.addEventListener('visibilitychange', hide)
    return () => { document.removeEventListener('visibilitychange', hide); if (!document.hidden) save() }
  }, [answers, pos, since, done])

  // The clock: hand the test in when the time is up.
  const [, tick] = useState(0)
  useEffect(() => {
    if (since === null || done) return
    const t = setInterval(() => { if (elapsed() >= limit) finish(); else tick((x) => x + 1) }, 1000)
    return () => clearInterval(t)
  }, [since, done, answers])

  if (since === null) {
    return (
      <div class="page">
        <Bar title={`Ostrá simulace · ${pt.title}`} />
        <div class="blocks approach-about">
          <p>Celý test jako na přijímačkách: <b>{pt.minutes} minut</b> a <b>{MODE.count} otázek</b> ze všech oblastí. Bez nápověd, a jestli máš dobře, uvidíš až na konci.</p>
          <p>Otázku můžeš <b>přeskočit</b> a vrátit se k ní. Když čas vyprší, test se sám odevzdá. Výsledek dostaneš v bodech z {pt.points} a po oblastech.</p>
          <p>Když test zavřeš, čas se zastaví a příště můžeš pokračovat.</p>
        </div>
        {saved ? (
          <div class="actions">
            <button class="btn block" autoFocus onClick={() => start(false)}>Pokračovat · zbývá {clock(limit - saved.ms)}, hotovo {saved.answers.length}/{saved.queue.length}</button>
            <button class="btn ghost block" onClick={() => start(true)}>Začít znovu</button>
          </div>
        ) : <button class="btn block" autoFocus onClick={() => start(true)}>Začít test</button>}
      </div>
    )
  }

  if (done) return <Result key={round} pt={pt} queue={queue} answers={answers} areaOf={areaOf} ms={Math.min(limit, elapsed())} again={() => start(true)} />

  const item = queue[pos]
  const left = queue.length - answers.length
  /** The next question without an answer after `from` (wrapping around), or -1. */
  const nextOpen = (from: number, skip?: Item) => {
    for (let k = 1; k <= queue.length; k++) { const j = (from + k) % queue.length; if (!answeredSet.has(queue[j]) && queue[j] !== skip) return j }
    return -1
  }
  const onAnswer = (ok: boolean) => {
    answered(item.id, ok, false, true)
    const next = [...answers, { item, ok, hint: false }]
    setAnswers(next)
    if (next.length === queue.length) return
    setTimeout(() => setPos((p) => { const set = new Set(next.map((a) => a.item)); for (let k = 1; k <= queue.length; k++) { const j = (p + k) % queue.length; if (!set.has(queue[j])) return j } return p }), 350)
  }

  return (
    <div class="page sim">
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Přerušit test"><IClose /></button>
        <span class="sim-count">{answers.length}/{queue.length}</span>
        <span class={`timer ${limit - elapsed() < 5 * 60_000 ? 'low' : ''}`} role="timer"><span class="sr-only">Zbývá </span>{clock(limit - elapsed())}</span>
        <QrButton />
      </div>
      <nav class="sim-grid" aria-label="Otázky">
        {queue.map((x, k) => (
          <button key={k} class={`${answeredSet.has(x) ? 'done' : ''} ${k === pos ? 'now' : ''}`} disabled={answeredSet.has(x)} aria-current={k === pos} aria-label={`Otázka ${k + 1}${answeredSet.has(x) ? ', zodpovězená' : ''}`} onClick={() => setPos(k)}>{k + 1}</button>
        ))}
      </nav>
      {answeredSet.has(item) ? (
        left ? <div class="empty">Tahle je hotová.<button class="btn" onClick={() => setPos(nextOpen(pos))}>Další bez odpovědi</button></div> : <div class="empty"><Mascot mood="happy" size={80} />Máš zodpovězeno všechno.</div>
      ) : (
        <div key={`${round}/${pos}`}>
          <div class="sim-area">{pt.areas[areaOf.get(item.topic) ?? 0]?.emoji} {pt.areas[areaOf.get(item.topic) ?? 0]?.title} · otázka {pos + 1}</div>
          <QuestionView q={item.q} reveal={false} strict={strictFor(item.topic)} onAnswer={onAnswer} />
          {left > 1 && <button class="btn ghost block sim-skip" onClick={() => setPos(nextOpen(pos, item))}>Přeskočit</button>}
        </div>
      )}
      <HandIn left={left} onHandIn={finish} />
    </div>
  )
}

/** Hand the test in; with questions left asks once more. */
function HandIn({ left, onHandIn }: { left: number; onHandIn: () => void }) {
  const [sure, setSure] = useState(false)
  if (!left) return <button class="btn block sim-hand" autoFocus onClick={onHandIn}>Odevzdat test</button>
  return sure
    ? <div class="sim-sure"><span>Bez odpovědi {left === 1 ? 'zbývá 1 otázka' : left <= 4 ? `zbývají ${left} otázky` : `zbývá ${left} otázek`}. Ty se počítají jako chyba.</span><div class="self"><button class="btn ghost" onClick={() => setSure(false)}>Zpět k testu</button><button class="btn" onClick={onHandIn}>Odevzdat</button></div></div>
    : <button class="btn ghost block sim-hand" onClick={() => setSure(true)}>Odevzdat test</button>
}

function Result({ pt, queue, answers, areaOf, ms, again }: { pt: ExamPart; queue: Item[]; answers: Answer[]; areaOf: Map<string, number>; ms: number; again: () => void }) {
  const ok = new Set(answers.filter((a) => a.ok).map((a) => a.item))
  const given = new Set(answers.map((a) => a.item))
  const pct = queue.length ? (ok.size / queue.length) * 100 : 0
  const points = Math.round((pct / 100) * pt.points)
  const areas = pt.areas.map((a, i) => {
    const qs = queue.filter((x) => areaOf.get(x.topic) === i)
    return { a, n: qs.length, ok: qs.filter((x) => ok.has(x)).length }
  }).filter((x) => x.n)
  const wrong = queue.filter((x) => !ok.has(x))
  return (
    <div class="page">
      <div class="result">
        <Mascot mood={pct >= 75 ? 'happy' : pct >= 50 ? 'wow' : 'sad'} size={96} />
        <div class="sim-points"><b>{points}</b><span>bodů z {pt.points}</span></div>
        <div class="pct">{ok.size} / {queue.length} správně · {Math.round(pct)} % · čas {clock(ms)}</div>
        <p class="muted">Body jsou odhad: každá otázka tu má stejnou váhu, ve skutečném testu se úlohy bodují různě.</p>
        <div class="list sim-areas">
          {areas.map(({ a, n, ok: k }) => (
            <div key={a.id} class="row epoch"><span class="em">{a.emoji}</span><b>{a.title}</b><small class="sim-area-n">{k}/{n}</small><Meter pct={(k / n) * 100} n={5} /></div>
          ))}
        </div>
        <div class="actions">
          <button class="btn block" onClick={again}>Nový test</button>
          <button class="btn ghost block" onClick={back}>Hotovo</button>
        </div>
        {wrong.length > 0 && (
          <div class="mistakes">
            {wrong.map((x, k) => (
              <div key={k} class="card">
                <b><Inline text={x.q.question} /></b>
                <span>{!given.has(x) && <em class="sim-none">bez odpovědi · </em>}<Inline text={answerText(x.q)} /></span>
                {x.index !== undefined && <ReportButton topic={x.topic} target={{ kind: 'question', index: x.index, text: x.q.question }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
