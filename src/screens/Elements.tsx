import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { askable, bestKey, distractors, ELEMENTS_INTRO, ELEMENTS_PATH, KINDS, kindOf, MODES, ROUND, saveBest, setById, SETS, useBest, type ElementSet, type Kind, type ModeId, type SetId } from '../chem'
import { CATEGORIES, ELEMENTS, type Element } from '../chem/elements'
import { BlindTable, cellPlace } from '../chem/Table'
import { stars } from '../progress/store'
import { back, Link, query, setQuery } from '../router'
import { titles, useTitle } from '../seo'
import { Bar, Stars } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IArrow, IClose } from '../ui/icons'
import { digit, onControl, useKeys } from '../ui/keys'
import { RoundResult } from '../ui/RoundResult'
import { WidgetView } from '../widgets/view'

// Periodická tabulka (src/chem): /periodicka-tabulka (explore the table, choose a set and a game; ?sada=<set>) and
// the game /periodicka-tabulka/<set>/<mode> (?vse = every element of the set instead of a quick round).

const STYLE = keyStyle('green')
const el = (z: number) => ELEMENTS[z - 1]
const DEFAULT_SET: SetId = 'zs'
/** The page of a set, where a game opened directly goes back to. */
const homeOf = (set: ElementSet) => (set.id === DEFAULT_SET ? ELEMENTS_PATH : `${ELEMENTS_PATH}?sada=${set.id}`)

const count = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** Props of the widget periodic for exploring a set (its own detail panel opens on a tap). */
const tableProps = (set: ElementSet, open?: string) => ({
  ...(set.compact ? { count: 20 } : set.id === 'zs' ? { highlight: set.zs.map((z) => el(z).symbol) } : {}),
  ...(open ? { open } : {}),
})

export function ElementsScreen() {
  useTitle(titles.elements())
  const best = useBest()
  const [setId, setSetId] = useState<SetId>(() => setById(query().get('sada') ?? undefined)?.id ?? DEFAULT_SET)
  const [all, setAll] = useState(false)
  const [open, setOpen] = useState<string | undefined>()
  // Remounts the table with `open` even when the same element is picked again after a tap inside the table.
  const [nonce, setNonce] = useState(0)
  const tableRef = useRef<HTMLDivElement>(null)
  const set = setById(setId)!
  const pick = (id: SetId) => {
    setSetId(id)
    setOpen(undefined)
    const qs = query()
    if (id === DEFAULT_SET) qs.delete('sada')
    else qs.set('sada', id)
    setQuery(qs)
  }
  const show = (symbol: string) => { setOpen(symbol); setNonce((n) => n + 1); tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  return (
    <div class="page" style={STYLE}>
      <Bar title="🧪 Periodická tabulka" />
      <div class="blocks approach-about"><p>{ELEMENTS_INTRO}</p></div>

      <div class="chips scope el-sets" role="radiogroup" aria-label="Které prvky">
        {SETS.map((x) => <button key={x.id} type="button" role="radio" aria-checked={x.id === setId} class={`chip ${x.id === setId ? 'sel' : ''}`} onClick={() => pick(x.id)}>{x.short}</button>)}
      </div>
      <p class="muted el-set-hint">{set.title}: {set.hint}.</p>
      <div class="el-explore" ref={tableRef}>
        <WidgetView key={`${setId}/${nonce}`} w={{ widget: 'periodic', props: tableProps(set, open) }} />
      </div>

      <h2 class="label">Hrát</h2>
      <div class="chips scope map-len" role="radiogroup" aria-label="Kolik otázek">
        <button type="button" role="radio" aria-checked={!all} class={`chip ${!all ? 'sel' : ''}`} onClick={() => setAll(false)}>{ROUND} otázek</button>
        <button type="button" role="radio" aria-checked={all} class={`chip ${all ? 'sel' : ''}`} onClick={() => setAll(true)}>všechny prvky</button>
      </div>
      <div class="list">
        {MODES.map((mode) => {
          const n = all ? askable(set, mode.id).length : Math.min(ROUND, askable(set, mode.id).length)
          const b = best[bestKey(setId, mode.id, all)]
          return (
            <Link key={mode.id} class="row map-mode" href={`${ELEMENTS_PATH}/${setId}/${mode.id}${all ? '?vse' : ''}`} rel="nofollow">
              <span class="txt"><b>{mode.title}</b><small>{mode.hint} · {n} {count(n, 'otázka', 'otázky', 'otázek')}</small></span>
              {b !== undefined ? <Stars n={stars(b)} /> : <IArrow />}
            </Link>
          )
        })}
      </div>

      <h2 class="label">{set.title}</h2>
      <div class="el-list">
        {set.zs.map((z) => {
          const e = el(z)
          return (
            <button key={z} type="button" class={`el-item periodic-${e.cat} ${open === e.symbol ? 'on' : ''}`} onClick={() => show(e.symbol)}>
              <span class="el-sym">{e.symbol}</span><b>{e.name}</b><small>{z}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Missing() {
  return <div class="page" style={STYLE}><Bar title="Periodická tabulka" /><div class="empty">Tahle hra tu není.<Link class="btn" href={ELEMENTS_PATH}>Periodická tabulka</Link></div></div>
}

export function ElementsGame({ set, mode }: { set: string; mode: ModeId }) {
  const s = setById(set)
  useTitle(titles.elements())
  if (!s) return <Missing />
  return <Game key={`${set}/${mode}`} set={s} mode={mode} all={query().has('vse')} />
}

interface Answer { z: number; pts: number }

/** „Najdi v tabulce“: points for an element found at the first try 1, at the second ½, later or shown 0. */
const TRIES = 3
/** „nekov · halogeny“; just „nekovy“ where the category already says it. */
const kindText = (e: Element) => { const k = kindOf(e); return CATEGORIES[e.cat].includes(k) ? CATEGORIES[e.cat] : `${k} · ${CATEGORIES[e.cat]}` }

function Game({ set, mode, all }: { set: ElementSet; mode: ModeId; all: boolean }) {
  const pool = useMemo(() => askable(set, mode), [set, mode])
  const fresh = () => shuffle(pool).slice(0, all ? pool.length : ROUND)
  const [round, setRound] = useState<{ zs: number[]; retry: boolean }>(() => ({ zs: fresh(), retry: false }))
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [tries, setTries] = useState(0)
  const [say, setSay] = useState<{ text: string; tone: 'ok' | 'bad' | 'show'; z: number } | null>(null)
  const [shown, setShown] = useState(false) // the answer is shown, waiting for „Dál“
  const [chosen, setChosen] = useState<number | string | null>(null) // the option tapped
  const [start, setStart] = useState(Date.now())
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const zs = round.zs
  const z = zs[i]
  const done = i >= zs.length
  const e = z ? el(z) : undefined
  const table = mode === 'najdi' || mode === 'poznej'
  const answered = answers.length > i

  const options = useMemo<(number | Kind)[]>(() => {
    if (!z || mode === 'najdi') return []
    if (mode === 'druh') return KINDS
    return shuffle([z, ...distractors(z, pool.length >= 4 ? pool : ELEMENTS.map((x) => x.z), mode)])
  }, [z, mode])
  const right = mode === 'druh' && e ? kindOf(e) : z

  // Answered cells keep their colour and show their symbol; the asked one is highlighted in „Poznáš prvek?“.
  const marks = useMemo(() => {
    const k: Record<number, string> = {}
    for (const a of answers) k[a.z] = a.pts > 0 ? 'ok' : 'miss'
    if (z && mode === 'poznej' && !answered) k[z] = 'pick'
    if (z && shown) k[z] = 'show'
    if (say?.tone === 'bad') k[say.z] = `${k[say.z] ?? ''} bad`
    return k
  }, [answers, z, shown, say, mode, answered])
  const open = useMemo(() => {
    const o = new Set(answers.map((a) => a.z))
    if (say) o.add(say.z)
    return o
  }, [answers, say])

  const next = () => { clearTimeout(timer.current); setSay(null); setShown(false); setChosen(null); setTries(0); setI(i + 1) }
  const answer = (pts: number) => setAnswers((a) => [...a, { z, pts }])
  const good = (pts: number) => {
    answer(pts)
    setSay({ z, text: `${e!.symbol} – ${e!.name}`, tone: 'ok' })
    timer.current = window.setTimeout(next, mode === 'najdi' ? 900 : 1300)
  }
  const reveal = () => { answer(0); setShown(true); setSay({ z, text: `${e!.symbol} – ${e!.name} je tady`, tone: 'show' }) }

  const onPick = (picked: number) => {
    if (done || shown || answered || mode !== 'najdi') return
    clearTimeout(timer.current) // a pending „To je …“ of an earlier tap must not clear the next message
    if (picked === z) return good(tries === 0 ? 1 : tries === 1 ? 0.5 : 0)
    const t = tries + 1
    setTries(t)
    if (t >= TRIES) return reveal()
    const p = el(picked)
    setSay({ z: picked, text: `To je ${p.symbol} – ${p.name}`, tone: 'bad' })
    timer.current = window.setTimeout(() => setSay(null), 1400)
  }

  const choose = (o: number | Kind) => {
    if (chosen !== null || answered) return
    setChosen(o)
    if (o === right) good(1)
    else { answer(0); setShown(true) }
  }

  useKeys((ev) => {
    if (shown) {
      if (ev.key !== 'ArrowRight' && (!['Enter', ' '].includes(ev.key) || onControl(ev.target))) return
      next()
      return true
    }
    const n = digit(ev)
    if (!n || n > options.length) return
    choose(options[n - 1])
    return true
  }, !done && (shown || options.length > 0))

  const again = (only?: number[]) => { clearTimeout(timer.current); setRound({ zs: only ? shuffle(only) : fresh(), retry: !!only }); setI(0); setAnswers([]); setTries(0); setSay(null); setShown(false); setChosen(null); setStart(Date.now()) }

  if (done) return <Result set={set} mode={mode} all={all} answers={answers} retry={round.retry} secs={Math.round((Date.now() - start) / 1000)} onAgain={again} />

  const score = answers.reduce((n, a) => n + a.pts, 0)
  const label = (o: number | Kind) => (typeof o === 'string' ? o : mode === 'znacky' ? el(o).symbol : mode === 'poznej' ? `${el(o).name} (${el(o).symbol})` : el(o).name)
  return (
    <div class={`page game el-game ${table ? 'with-table' : ''}`} style={STYLE}>
      <div class="qtop">
        <button class="icon-btn" onClick={() => back(homeOf(set))} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter" role="progressbar" aria-valuemin={0} aria-valuemax={zs.length} aria-valuenow={i}>
          {zs.map((_, k) => <i key={k} class={k < answers.length ? (answers[k].pts === 1 ? 'ok' : answers[k].pts > 0 ? 'half' : 'bad') : k === i ? 'now' : ''} />)}
        </div>
        <span class="timer" aria-label="Body">{String(score).replace('.', ',')} b</span>
      </div>
      <div class="map-ask el-ask" aria-live="polite">
        {mode === 'znacky' && <><small>Jakou značku má</small><b>{e!.name}</b></>}
        {mode === 'nazvy' && <><small>Který prvek má značku</small><b class="el-q-sym">{e!.symbol}</b></>}
        {mode === 'najdi' && <><small>Najdi v tabulce</small><b>{e!.name}</b></>}
        {mode === 'poznej' && <><small>Který prvek je v tabulce vyznačený?</small><span class="sr-only">Vyznačené pole: {cellPlace(e!)}.</span></>}
        {mode === 'druh' && <><small>Kov, polokov, nebo nekov?</small><b>{e!.name} <span class="el-q-aside">{e!.symbol}</span></b></>}
        {mode === 'najdi' && !answered && tries > 0 && <span class="map-tries">{TRIES - tries === 1 ? 'poslední pokus' : `ještě ${TRIES - tries} pokusy`}</span>}
      </div>
      {table && <BlindTable set={set} marks={marks} open={open} focus={mode === 'poznej' || shown ? z : null} onPick={onPick} label={`Slepá periodická tabulka: ${set.title}`} />}
      {mode === 'najdi' && <div class={`el-say ${say?.tone ?? ''}`} role="status">{say?.text ?? ' '}</div>}
      {options.length > 0 && (
        <div class={`opts map-opts el-opts ${mode === 'znacky' ? 'sym' : ''} ${mode === 'druh' ? 'three' : ''}`}>
          {options.map((o, k) => (
            <button key={o} type="button" class={`opt ${chosen !== null && o === right ? 'ok' : chosen === o ? 'bad' : ''}`} onClick={() => choose(o)} disabled={chosen !== null && o !== chosen && o !== right}>
              <kbd class="key-hint">{k + 1}</kbd>{label(o)}
            </button>
          ))}
        </div>
      )}
      {mode !== 'najdi' && answered && <Fact e={e!} kind={mode === 'druh'} />}
      {shown && <div class="map-next"><button class="btn block" onClick={next} autoFocus>Dál</button></div>}
    </div>
  )
}

/** What to remember about the element after an answer. */
function Fact({ e, kind }: { e: Element; kind?: boolean }) {
  return (
    <div class="el-fact" role="status">
      <span class={`el-cell periodic-${e.cat}`}><small>{e.z}</small><b>{e.symbol}</b></span>
      <span class="txt">
        <b>{e.name}</b>
        <small>{kind ? kindText(e) : CATEGORIES[e.cat]} · {e.period}. perioda{e.row <= 7 ? `, ${e.group}. skupina` : ''}</small>
      </span>
    </div>
  )
}

function Result({ set, mode, all, answers, retry, secs, onAgain }: { set: ElementSet; mode: ModeId; all: boolean; answers: Answer[]; retry: boolean; secs: number; onAgain: (only?: number[]) => void }) {
  const pts = answers.reduce((n, a) => n + a.pts, 0)
  const pct = Math.round((pts / answers.length) * 100)
  const missed = answers.filter((a) => a.pts < 1).map((a) => a.z)
  // Only a whole round counts as a record, not a replay of the mistakes.
  const [record] = useState(() => !retry && saveBest(bestKey(set.id, mode, all), pct))
  return (
    <div class="page" style={STYLE}>
      <RoundResult pct={pct} first={answers.length - missed.length} total={answers.length} secs={secs} record={record} missed={missed.length} onRetry={() => onAgain(missed)} onAgain={() => onAgain()} done={homeOf(set)}>
        {missed.map((z) => { const e = el(z); return <div key={z} class="card"><b>{e.symbol} – {e.name}</b><span>{mode === 'druh' ? `${kindText(e)} · ` : ''}{e.period}. perioda{e.row <= 7 ? `, ${e.group}. skupina` : mode === 'druh' ? '' : `, ${CATEGORIES[e.cat]}`}</span></div> })}
      </RoundResult>
    </div>
  )
}
