import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Level, Word } from '../vocab/types'
import { loadLevel } from '../vocab'
import { setWordBox, useProgress, getProgress } from '../progress/store'
import { back, go, Link } from '../router'
import { Bar, BigStars } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { ICheck, IClose, IX } from '../ui/icons'
import { useAsync } from '../ui/useAsync'

const load = loadLevel

export const LEVELS: { id: Level; hint: string }[] = [
  { id: 'A1', hint: 'začátečník · 1. stupeň' },
  { id: 'A2', hint: 'mírně pokročilý · 2. stupeň' },
  { id: 'B1', hint: 'středně pokročilý · konec ZŠ' },
  { id: 'B2', hint: 'pokročilý · maturita' },
  { id: 'C1', hint: 'velmi pokročilý' },
]

const MASTERED = 3
const SESSION = 15
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

export function VocabHome() {
  return (
    <div class="page" style={keyStyle('purple')}>
      <Bar title="Slovíčka" />
      <div class="levels">{LEVELS.map((l) => <LevelRow key={l.id} id={l.id} hint={l.hint} />)}</div>
    </div>
  )
}

function LevelRow({ id, hint }: { id: Level; hint: string }) {
  const set = useAsync(() => load(id), [id])
  const p = useProgress()
  if (set === null) return null
  const words = set?.groups.flatMap((g) => g.words) ?? []
  const done = words.filter((w) => (p.w[w[1]] ?? 0) >= MASTERED).length
  return (
    <Link class="row" href={`/slovicka/${id}`}>
      <span class="skey m"><b>{id}</b></span>
      <span style={{ flex: 1, display: 'grid', gap: 6 }}>
        <b>{hint}</b>
        <span class="meter"><i style={{ width: `${words.length ? (done / words.length) * 100 : 0}%` }} /></span>
      </span>
    </Link>
  )
}

export function VocabLevel({ level }: { level: Level }) {
  const set = useAsync(() => load(level), [level])
  const p = useProgress()
  if (!set) return <div class="page" />
  const pct = (ws: Word[]) => (ws.filter((w) => (p.w[w[1]] ?? 0) >= MASTERED).length / ws.length) * 100
  return (
    <div class="page" style={keyStyle('purple')}>
      <Bar title={level} onBack={() => go('/slovicka')} />
      <button class="btn block" onClick={() => go(`/slovicka/${level}/vse`)} style={{ marginBottom: 16 }}>Míchat vše</button>
      <div class="list">
        {set.groups.map((g, i) => (
          <Link key={i} class="row" href={`/slovicka/${level}/${i}`}>
            <span class="em">{g.emoji}</span>
            <span style={{ flex: 1, display: 'grid', gap: 6 }}><b>{g.name}</b><span class="meter"><i style={{ width: `${pct(g.words)}%` }} /></span></span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { /* no TTS */ }
}

export function VocabSwipe({ level, group }: { level: Level; group: string }) {
  const set = useAsync(() => load(level), [level])
  const [round, setRound] = useState(0)
  const words = useMemo(() => {
    if (!set) return []
    const pool = group === 'vse' ? set.groups.flatMap((g) => g.words) : set.groups[Number(group)]?.words ?? []
    // Weakest words first (Leitner box), random among equals.
    const box = getProgress().w
    return shuffle(pool).sort((a, b) => (box[a[1]] ?? 0) - (box[b[1]] ?? 0)).slice(0, SESSION)
  }, [set, group, round])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  useEffect(() => { setI(0); setScore(0) }, [words])

  if (!set) return <div class="page" />
  if (i >= words.length && words.length) {
    return (
      <div class="page" style={keyStyle('purple')}>
        <div class="result">
          <BigStars n={Math.round((score / words.length) * 3)} />
          <h2>{score === words.length ? 'Perfektní!' : score / words.length >= 0.7 ? 'Dobře!' : 'Ještě jednou?'}</h2>
          <div class="pct">{score} / {words.length}</div>
          <div class="actions">
            <button class="btn block" onClick={() => setRound(round + 1)}>Další kolo</button>
            <button class="btn ghost block" onClick={back}>Hotovo</button>
          </div>
        </div>
      </div>
    )
  }
  const w = words[i]
  return (
    <div class="page" style={keyStyle('purple')}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <div class="meter"><i style={{ width: `${(i / words.length) * 100}%` }} /></div>
        <span class="timer">{i + 1}/{words.length}</span>
      </div>
      {w && <WordRound key={`${round}-${i}`} w={w} onDone={(ok) => {
        const box = getProgress().w[w[1]] ?? 0
        setWordBox(w[1], ok ? box + 1 : 0)
        if (ok) setScore(score + 1)
        setI(i + 1)
      }} />}
    </div>
  )
}

/** One word: candidate cards one by one; swipe right = this is it, left = not it. */
function WordRound({ w, onDone }: { w: Word; onDone: (ok: boolean) => void }) {
  const [cz, en, near, rel] = w
  const cards = useMemo(() => shuffle([en, near, rel]), [w])
  const [k, setK] = useState(0)
  const [miss, setMiss] = useState(false)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [found, setFound] = useState(false)
  const [dx, setDx] = useState(0)
  const [fly, setFly] = useState(0)
  const start = useRef<number | null>(null)

  const decide = (yes: boolean) => {
    if (found || fly) return
    const card = cards[k], right = card === en
    if (yes === right) {
      setFlash('ok')
      if (right) { setFound(true); speak(en); setTimeout(() => onDone(!miss), 900); return }
    } else {
      setMiss(true); setFlash('bad')
      if (right) { setFound(true); speak(en); setTimeout(() => onDone(false), 1500); return }
    }
    setFly(yes ? 1 : -1)
    setTimeout(() => { setFly(0); setDx(0); setFlash(null); setK(k + 1) }, 300)
  }

  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') decide(true); if (e.key === 'ArrowLeft') decide(false) }
    addEventListener('keydown', on); return () => removeEventListener('keydown', on)
  })

  const x = fly ? fly * 500 : dx
  const tilt = Math.max(-1, Math.min(1, x / 120))
  return (
    <div class="swipe">
      <div class="ask"><small>Jak se řekne</small><h2>{cz}</h2></div>
      <div class="deck">
        {k + 1 < cards.length && !found && <div class="scard back">{cards[k + 1]}</div>}
        <div
          class={`scard ${flash ? `flash-${flash}` : ''}`}
          style={{ transform: `translateX(${x}px) rotate(${x / 18}deg)`, transition: start.current !== null ? 'none' : undefined, opacity: fly ? 0 : 1 }}
          onPointerDown={(e) => { if (found) return; start.current = e.clientX; (e.currentTarget as Element).setPointerCapture(e.pointerId) }}
          onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current) }}
          onPointerUp={() => { const d = dx; start.current = null; if (Math.abs(d) > 90) decide(d > 0); else setDx(0) }}
          onPointerCancel={() => { start.current = null; setDx(0) }}
        >
          <span class="stamp yes" style={{ opacity: Math.max(0, tilt) }}>Ano</span>
          <span class="stamp no" style={{ opacity: Math.max(0, -tilt) }}>Ne</span>
          {found ? en : cards[k]}
        </div>
      </div>
      <div class="swipe-btns">
        <button class="round no" onClick={() => decide(false)} aria-label="Ne, to není ono"><IX /></button>
        <button class="round yes" onClick={() => decide(true)} aria-label="Ano, to je ono"><ICheck /></button>
      </div>
    </div>
  )
}
