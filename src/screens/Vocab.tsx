import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Level, Word } from '../vocab/types'
import { loadLevel } from '../vocab'
import { preload, speak } from '../vocab/speak'
import { setWordBox, useProgress, getProgress } from '../progress/store'
import { back, go, Link } from '../router'
import { Bar, BigStars, Meter } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IClose, IShuffle } from '../ui/icons'
import { useAsync } from '../ui/useAsync'

const load = loadLevel

export const LEVELS: { id: Level; hint: string }[] = [
  { id: 'A1', hint: 'začátečník · 1. stupeň' },
  { id: 'A2', hint: 'mírně pokročilý · 2. stupeň' },
  { id: 'B1', hint: 'středně pokročilý · konec ZŠ' },
  { id: 'B2', hint: 'pokročilý · maturita' },
  { id: 'C1', hint: 'velmi pokročilý' },
]

/** A word counts as learned from this Leitner box on. */
const MASTERED = 3
/** Practised words (right at least once) and progress towards learning them all, 0–100. Every right answer moves the meter. */
function vocabProgress(ws: Word[], box: Record<string, number>) {
  let seen = 0, sum = 0
  for (const w of ws) { const b = box[w[1]] ?? 0; if (b > 0) seen++; sum += Math.min(b, MASTERED) }
  return { seen, pct: ws.length ? (sum / (ws.length * MASTERED)) * 100 : 0 }
}
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
  const { pct } = vocabProgress(set?.groups.flatMap((g) => g.words) ?? [], p.w)
  return (
    <Link class="row" href={`/slovicka/${id}`}>
      <span class="skey m"><b>{id}</b></span>
      <span style={{ flex: 1, display: 'grid', gap: '6px' }}>
        <b>{hint}</b>
        <span class="meter"><i style={{ width: `${pct}%` }} /></span>
      </span>
    </Link>
  )
}

export function VocabLevel({ level }: { level: Level }) {
  const set = useAsync(() => load(level), [level])
  const p = useProgress()
  if (!set) return <div class="page" />
  const total = set.groups.reduce((n, g) => n + g.words.length, 0)
  return (
    <div class="page" style={keyStyle('purple')}>
      <Bar title={level} crumbs={[{ href: '/slovicka', label: 'Slovíčka' }]} />
      <button class="btn block mix" onClick={() => go(`/slovicka/${level}/vse`)}>
        <IShuffle />Míchat vše<small class="btn-count">{total}</small>
      </button>
      <div class="tiles">
        {set.groups.map((g, i) => {
          const { seen, pct } = vocabProgress(g.words, p.w)
          return (
            <Link key={i} class="tile vocab-tile" href={`/slovicka/${level}/${i}`}>
              <span class="tile-face em">{g.emoji}</span>
              <b>{g.name}</b>
              <span class="foot"><Meter pct={pct} /><small>{seen}/{g.words.length}</small></span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/** Words known well enough (Leitner box) are typed instead of picked. */
const TYPE_FROM = 2
/** A missed word comes back this many cards later. */
const AGAIN = 3

interface Card { w: Word; type: boolean; again: boolean; lang?: string }

export function VocabDrill({ level, group }: { level: Level; group: string }) {
  const set = useAsync(() => load(level), [level])
  const [round, setRound] = useState(0)
  const first = useMemo(() => {
    if (!set) return []
    const groups = group === 'vse' ? set.groups : set.groups.slice(Number(group), Number(group) + 1)
    const pool = groups.flatMap((g) => g.words.map((w) => [w, g.lang] as const))
    // Weakest words first (Leitner box), random among equals.
    const box = getProgress().w
    return shuffle(pool).sort((a, b) => (box[a[0][1]] ?? 0) - (box[b[0][1]] ?? 0)).slice(0, SESSION)
      .map(([w, lang]): Card => ({ w, lang, type: (box[w[1]] ?? 0) >= TYPE_FROM, again: false }))
  }, [set, group, round])
  useEffect(() => preload(first.map((c) => c.w[1])), [first])
  const [src, setSrc] = useState(first)
  const [queue, setQueue] = useState(first)
  const [i, setI] = useState(0)
  const [missed, setMissed] = useState<Word[]>([])
  const [marks, setMarks] = useState<boolean[]>([])
  // New round (or words just loaded): start over without rendering the old state.
  if (src !== first) { setSrc(first); setQueue(first); setI(0); setMissed([]); setMarks([]); return <div class="page" /> }

  if (!set) return <div class="page" />
  const total = first.length
  if (i >= queue.length && total) {
    const score = total - missed.length
    return (
      <div class="page" style={keyStyle('purple')}>
        <div class="result">
          <BigStars n={Math.round((score / total) * 3)} />
          <h2>{score === total ? 'Perfektní!' : score / total >= 0.7 ? 'Dobře!' : 'Ještě jednou?'}</h2>
          <div class="pct">{score} / {total}</div>
          {missed.length > 0 && (
            <div class="mistakes">{missed.map((w) => <div key={w[1]} class="card"><b>{w[0]}</b><span>{w[1]}</span></div>)}</div>
          )}
          <div class="actions">
            <button class="btn block" onClick={() => setRound(round + 1)}>Další kolo</button>
            <button class="btn ghost block" onClick={back}>Hotovo</button>
          </div>
        </div>
      </div>
    )
  }
  const c = queue[i]
  return (
    <div class="page" style={keyStyle('purple')}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter">{queue.map((_, k) => <i key={k} class={k < i ? (marks[k] ? 'ok' : 'bad') : k === i ? 'now' : ''} />)}</div>
        <span class="timer">{i + 1}/{queue.length}</span>
      </div>
      {c && <WordCard key={`${round}-${i}`} c={c} onDone={(ok) => {
        if (!c.again) {
          const box = getProgress().w[c.w[1]] ?? 0
          setWordBox(c.w[1], ok ? box + 1 : 0)
          if (!ok) setMissed([...missed, c.w])
        }
        // Missed words come back a few cards later, typed, until they are right.
        setMarks([...marks, ok])
        if (!ok) setQueue((q) => [...q.slice(0, i + 1 + AGAIN), { ...c, type: true, again: true }, ...q.slice(i + 1 + AGAIN)])
        setI(i + 1)
      }} />}
    </div>
  )
}

const norm = (s: string) => s.toLowerCase().replace(/[’`]/g, "'").replace(/[\s\-.!?,]+/g, '')

function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

/** Exact, or a small typo (1 letter from 5 letters, 2 from 12). */
export function check(typed: string, en: string): 'ok' | 'typo' | 'bad' {
  const a = norm(typed), b = norm(en)
  if (!a) return 'bad'
  if (a === b) return 'ok'
  return distance(a, b) <= (b.length >= 12 ? 2 : b.length >= 5 ? 1 : 0) ? 'typo' : 'bad'
}

/** „h _ _ _ _“: first letter of every word, the rest hidden. */
const mask = (en: string) => en.split(' ').map((p) => [...p].map((ch, k) => (k === 0 || !/[a-z]/i.test(ch) ? ch : '_')).join(' ')).join('   ')

/** One word: pick it from three (new words) or type it (known words). */
function WordCard({ c, onDone }: { c: Card; onDone: (ok: boolean) => void }) {
  const [cz, en, near, rel] = c.w
  const opts = useMemo(() => shuffle([en, near, rel]), [c])
  const [res, setRes] = useState<'ok' | 'typo' | 'bad' | null>(null)
  const [pick, setPick] = useState<string | null>(null)
  const [v, setV] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const ok = res === 'ok' || res === 'typo'

  const answer = (r: 'ok' | 'typo' | 'bad') => {
    if (res) return
    setRes(r); speak(en, c.lang)
    if (r === 'ok') setTimeout(() => onDone(true), 900)
  }
  useEffect(() => { if (c.type) input.current?.focus() }, [c])
  useEffect(() => { if (res && res !== 'ok') next.current?.focus() }, [res])
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!c.type && !res && ['1', '2', '3'].includes(e.key)) { const o = opts[Number(e.key) - 1]; setPick(o); answer(o === en ? 'ok' : 'bad') }
    }
    addEventListener('keydown', on); return () => removeEventListener('keydown', on)
  })

  return (
    <div class="drill">
      <div class="ask"><small>Jak se řekne</small><h2>{cz}</h2></div>
      {c.type ? (
        <form class="type" onSubmit={(e) => { e.preventDefault(); answer(check(v, en)) }}>
          <div class={`lethint ${res ? 'shown' : ''}`} onClick={() => res && speak(en, c.lang)}>{res ? en : mask(en)}</div>
          <input ref={input} class={`answer-input ${res ? (ok ? 'ok' : 'bad') : ''}`} value={v} onInput={(e) => setV(e.currentTarget.value)} readOnly={!!res}
            autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck={false} enterKeyHint="done" lang="en" aria-label="Anglicky" />
          {!res && (
            <div class="type-btns">
              <button type="button" class="btn ghost" onClick={() => answer('bad')}>Nevím</button>
              <button class="btn" disabled={!v.trim()}>Ověřit</button>
            </div>
          )}
        </form>
      ) : (
        <div class="opts">
          {opts.map((o) => (
            <button key={o} class={`opt ${res && o === en ? 'ok' : ''} ${res && o === pick && o !== en ? 'bad' : ''}`}
              onClick={() => { if (res) return; setPick(o); answer(o === en ? 'ok' : 'bad') }}>{o}</button>
          ))}
        </div>
      )}
      {res && res !== 'ok' && <button ref={next} class="btn block reveal" onClick={() => onDone(ok)}>Dál</button>}
    </div>
  )
}
