import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Level, VocabLang, Word } from '../vocab/types'
import { levelsOf, loadLevel, loadWordRefs, vocabLangs } from '../vocab'
import { langById, vocabPath, wordKey, type LangMeta } from '../vocab/langs'
import { check, mask } from '../vocab/check'
import { preload, speak } from '../vocab/speak'
import { setWordBox, useProgress, getProgress } from '../progress/store'
import { back, go, Link } from '../router'
import { Bar, BigStars, Meter } from '../ui/Bar'
import { keyStyle, SubjectKey, subjectStyle } from '../ui/glyphs'
import { IArrow, IClose, IShuffle } from '../ui/icons'
import { QrButton } from '../ui/QrShare'
import { useAsync } from '../ui/useAsync'

export const LEVELS: { id: Level; hint: string }[] = [
  { id: 'A1', hint: 'začátečník · 1. stupeň' },
  { id: 'A2', hint: 'mírně pokročilý · 2. stupeň' },
  { id: 'B1', hint: 'středně pokročilý · konec ZŠ' },
  { id: 'B2', hint: 'pokročilý · maturita' },
  { id: 'C1', hint: 'velmi pokročilý' },
]

/** A second language starts in the 7th grade: its levels come later than English ones. */
const SECOND_HINTS: Partial<Record<Level, string>> = {
  A1: 'začátečník · 7.–9. třída',
  A2: 'mírně pokročilý · 1.–2. ročník SŠ',
  B1: 'středně pokročilý · 3.–4. ročník SŠ',
}
const hintOf = (lang: VocabLang, l: Level) => (lang === 'en' ? LEVELS.find((x) => x.id === l)!.hint : SECOND_HINTS[l] ?? l)

/** Accent of a language's screens: English keeps its purple, the others their subject's colour. */
export const langStyle = (m: LangMeta) => (m.id === 'en' ? keyStyle('purple') : subjectStyle(m.subject))

/** A word counts as learned from this Leitner box on. */
export const MASTERED = 3
/** Practised words (right at least once) and progress towards learning them all, 0–100. Every right answer moves the meter. */
function vocabProgress(lang: VocabLang, ws: Word[], box: Record<string, number>) {
  let seen = 0, sum = 0
  for (const w of ws) { const b = box[wordKey(lang, w.word)] ?? 0; if (b > 0) seen++; sum += Math.min(b, MASTERED) }
  return { seen, pct: ws.length ? (sum / (ws.length * MASTERED)) * 100 : 0 }
}
const SESSION = 15
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

/** /slovicka: English levels right away (as always), the other languages one tap further. */
export function VocabHome() {
  const others = vocabLangs().filter((l) => l.id !== 'en')
  return (
    <div class="page" style={keyStyle('purple')}>
      <Bar title="Slovíčka" />
      {others.length > 0 && <h2 class="label">Angličtina</h2>}
      <div class="levels">{levelsOf('en').map((l) => <LevelRow key={l} lang="en" id={l} />)}</div>
      {others.length > 0 && (
        <>
          <h2 class="label next-label">Další jazyky</h2>
          <div class="list">{others.map((m) => <LangRow key={m.id} m={m} />)}</div>
        </>
      )}
    </div>
  )
}

function LangRow({ m }: { m: LangMeta }) {
  const refs = useAsync(loadWordRefs, [])
  const p = useProgress()
  const levels = levelsOf(m.id)
  const of = refs?.filter((w) => w.lang === m.id) ?? []
  const pct = of.length ? (of.reduce((n, w) => n + Math.min(p.w[wordKey(m.id, w.word)] ?? 0, MASTERED), 0) / (of.length * MASTERED)) * 100 : 0
  return (
    <Link class="row lang-row" style={langStyle(m)} href={vocabPath(m.id)}>
      <SubjectKey s={m.subject} />
      <span style={{ flex: 1, display: 'grid', gap: '6px' }}>
        <b>{m.name}<small class="lang-levels">{levels.length > 1 ? `${levels[0]}–${levels[levels.length - 1]}` : levels[0]}</small></b>
        <span class="meter"><i style={{ width: `${pct}%` }} /></span>
      </span>
      <IArrow />
    </Link>
  )
}

/** /slovicka/<language>: the levels of one language other than English. */
export function VocabLangHome({ lang }: { lang: VocabLang }) {
  const m = langById(lang)
  const levels = levelsOf(lang)
  return (
    <div class="page" style={langStyle(m)}>
      <Bar title={m.name} crumbs={[{ href: '/slovicka', label: 'Slovíčka' }]} />
      {levels.length ? <div class="levels">{levels.map((l) => <LevelRow key={l} lang={lang} id={l} />)}</div> : <div class="empty">Připravujeme.</div>}
    </div>
  )
}

function LevelRow({ lang, id }: { lang: VocabLang; id: Level }) {
  const set = useAsync(() => loadLevel(lang, id), [lang, id])
  const p = useProgress()
  if (set === null) return null
  const { pct } = vocabProgress(lang, set?.groups.flatMap((g) => g.words) ?? [], p.w)
  return (
    <Link class="row" href={vocabPath(lang, id)}>
      <span class="skey m"><b>{id}</b></span>
      <span style={{ flex: 1, display: 'grid', gap: '6px' }}>
        <b>{hintOf(lang, id)}</b>
        <span class="meter"><i style={{ width: `${pct}%` }} /></span>
      </span>
    </Link>
  )
}

export function VocabLevel({ lang, level }: { lang: VocabLang; level: Level }) {
  const set = useAsync(() => loadLevel(lang, level), [lang, level])
  const p = useProgress()
  const m = langById(lang)
  if (set === null) return <div class="page"><Bar title={level} crumbs={[{ href: '/slovicka', label: 'Slovíčka' }]} /><div class="empty">Připravujeme.</div></div>
  if (!set) return <div class="page" />
  const total = set.groups.reduce((n, g) => n + g.words.length, 0)
  const crumbs = [{ href: '/slovicka', label: 'Slovíčka' }, ...(lang === 'en' ? [] : [{ href: vocabPath(lang), label: m.name }])]
  return (
    <div class="page" style={langStyle(m)}>
      <Bar title={lang === 'en' ? level : `${m.name} ${level}`} crumbs={crumbs} />
      <button class="btn block mix" onClick={() => go(vocabPath(lang, level, 'vse'))}>
        <IShuffle />Míchat vše<small class="btn-count">{total}</small>
      </button>
      <div class="tiles">
        {set.groups.map((g, i) => {
          const { seen, pct } = vocabProgress(lang, g.words, p.w)
          return (
            <Link key={i} class="tile vocab-tile" href={vocabPath(lang, level, i)}>
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

interface Card { w: Word; type: boolean; again: boolean; voice?: string }

export function VocabDrill({ lang, level, group }: { lang: VocabLang; level: Level; group: string }) {
  const set = useAsync(() => loadLevel(lang, level), [lang, level])
  const m = langById(lang)
  const [round, setRound] = useState(0)
  const first = useMemo(() => {
    if (!set) return []
    const groups = group === 'vse' ? set.groups : set.groups.slice(Number(group), Number(group) + 1)
    const pool = groups.flatMap((g) => g.words.map((w) => [w, g.lang] as const))
    // Weakest words first (Leitner box), random among equals.
    const box = getProgress().w
    const b = (w: Word) => box[wordKey(lang, w.word)] ?? 0
    return shuffle(pool).sort((x, y) => b(x[0]) - b(y[0])).slice(0, SESSION)
      .map(([w, voice]): Card => ({ w, voice, type: b(w) >= TYPE_FROM, again: false }))
  }, [set, group, round])
  useEffect(() => preload(lang, first.map((c) => c.w.word)), [first])
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
      <div class="page" style={langStyle(m)}>
        <div class="result">
          <BigStars n={Math.round((score / total) * 3)} />
          <h2>{score === total ? 'Perfektní!' : score / total >= 0.7 ? 'Dobře!' : 'Ještě jednou?'}</h2>
          <div class="pct">{score} / {total}</div>
          {missed.length > 0 && (
            <div class="mistakes">{missed.map((w) => <div key={w.word} class="card"><b>{w.cz}</b><span lang={lang}>{w.word}</span></div>)}</div>
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
    <div class="page" style={langStyle(m)}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter">{queue.map((_, k) => <i key={k} class={k < i ? (marks[k] ? 'ok' : 'bad') : k === i ? 'now' : ''} />)}</div>
        <span class="timer">{i + 1}/{queue.length}</span>
        <QrButton />
      </div>
      {c && <WordCard key={`${round}-${i}`} m={m} c={c} onDone={(ok) => {
        if (!c.again) {
          const k = wordKey(lang, c.w.word)
          const box = getProgress().w[k] ?? 0
          setWordBox(k, ok ? box + 1 : 0)
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

/** One word: pick it from three (new words) or type it (known words). */
function WordCard({ m, c, onDone }: { m: LangMeta; c: Card; onDone: (ok: boolean) => void }) {
  const { cz, word, similar, related } = c.w
  const opts = useMemo(() => shuffle([word, similar, related]), [c])
  const [res, setRes] = useState<'ok' | 'typo' | 'bad' | null>(null)
  const [pick, setPick] = useState<string | null>(null)
  const [v, setV] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const ok = res === 'ok' || res === 'typo'
  const say = () => speak(m.id, word, c.voice ?? m.speech)

  const answer = (r: 'ok' | 'typo' | 'bad') => {
    if (res) return
    setRes(r); say()
    if (r === 'ok') setTimeout(() => onDone(true), 900)
  }
  useEffect(() => { if (c.type) input.current?.focus() }, [c])
  useEffect(() => { if (res && res !== 'ok') next.current?.focus() }, [res])
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!c.type && !res && ['1', '2', '3'].includes(e.key)) { const o = opts[Number(e.key) - 1]; setPick(o); answer(o === word ? 'ok' : 'bad') }
    }
    addEventListener('keydown', on); return () => removeEventListener('keydown', on)
  })

  return (
    <div class="drill">
      <div class="ask"><small>Jak se řekne</small><h2>{cz}</h2></div>
      {c.type ? (
        <form class="type" onSubmit={(e) => { e.preventDefault(); answer(check(v, word)) }}>
          <div class={`lethint ${res ? 'shown' : ''}`} lang={m.id} onClick={() => res && say()}>{res ? word : mask(word)}</div>
          <input ref={input} class={`answer-input ${res ? (ok ? 'ok' : 'bad') : ''}`} value={v} onInput={(e) => setV(e.currentTarget.value)} readOnly={!!res}
            autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck={false} enterKeyHint="done" lang={m.id} aria-label={m.adverb} />
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
            <button key={o} lang={m.id} class={`opt ${res && o === word ? 'ok' : ''} ${res && o === pick && o !== word ? 'bad' : ''}`}
              onClick={() => { if (res) return; setPick(o); answer(o === word ? 'ok' : 'bad') }}>{o}</button>
          ))}
        </div>
      )}
      {res && res !== 'ok' && <button ref={next} class="btn block reveal" onClick={() => onDone(ok)}>Dál</button>}
    </div>
  )
}
