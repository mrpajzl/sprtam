import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { askable, bestKey, bestOf, MAPS, MAPS_INTRO, MAPS_PATH, mapById, modesOf, nameOf, PARTS, place, ROUND, saveBest, useBest, type GameMap, type MapData, type ModeId } from '../maps'
import { loadMap } from '../maps/load'
import { MapView, type Tag } from '../maps/MapView'
import { stars } from '../progress/store'
import { back, Link, query } from '../router'
import { titles, useTitle } from '../seo'
import { Bar, Meter, Stars } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IArrow, IClose } from '../ui/icons'
import { RoundResult } from '../ui/RoundResult'
import { useAsync } from '../ui/useAsync'

// Slepá mapa (src/maps): /slepa-mapa (the maps), /slepa-mapa/<map> (explore the map, choose a game) and the game
// /slepa-mapa/<map>/<mode> (?vse = every place of the map instead of a quick round).

const STYLE = keyStyle('teal')

export function MapsScreen({ map }: { map?: string }) {
  if (!map) return <MapsHome />
  const m = mapById(map)
  return m ? <MapPage m={m} /> : <Missing />
}

function Missing() {
  return <div class="page" style={STYLE}><Bar title="Slepá mapa" /><div class="empty">Tahle mapa tu není.<Link class="btn" href={MAPS_PATH}>Slepá mapa</Link></div></div>
}

function MapRow({ m }: { m: GameMap }) {
  const best = useBest()
  return (
    <Link class="row map-row" href={`${MAPS_PATH}/${m.id}`}>
      <span class="em">{m.emoji}</span>
      <span class="txt"><b>{m.title}</b><small>{m.hint}</small></span>
      <Meter pct={bestOf(best, m.id)} n={5} />
    </Link>
  )
}

function MapsHome() {
  useTitle(titles.maps())
  return (
    <div class="page" style={STYLE}>
      <Bar title="🗺️ Slepá mapa" />
      <div class="blocks approach-about"><p>{MAPS_INTRO}</p></div>
      <h2 class="label">Mapy</h2>
      <div class="list">{MAPS.filter((m) => !PARTS.includes(m.id)).map((m) => <MapRow key={m.id} m={m} />)}</div>
      <h2 class="label map-parts">Světadíly</h2>
      <div class="list">{MAPS.filter((m) => PARTS.includes(m.id)).map((m) => <MapRow key={m.id} m={m} />)}</div>
    </div>
  )
}

/** One map: explore it (tap a place to see its name), then pick a game. */
function MapPage({ m }: { m: GameMap }) {
  const data = useAsync(() => loadMap(m.source), [m.source])
  const best = useBest()
  const [sel, setSel] = useState<string | null>(null)
  const [all, setAll] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  useTitle(titles.map(m.title, m.kind))
  const marks = useMemo(() => (sel ? { [sel]: 'pick' } : {}), [sel])
  const info = sel ? place(sel) : undefined
  const tag: Tag | null = sel ? { id: sel, text: info?.capital ? `${info.name} · ${info.capital}` : nameOf(sel)!, tone: 'show' } : null
  const choose = (id: string) => { setSel(id); mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }
  return (
    <div class="page" style={STYLE}>
      <Bar title={`${m.emoji} ${m.title}`} crumbs={[{ href: MAPS_PATH, label: 'Slepá mapa' }]} />
      <div class="blocks approach-about"><p>{m.about}</p></div>
      <div class="map-frame" ref={mapRef} style={data ? { '--ar': `${data.w} / ${data.h}` } : undefined}>
        {data ? <MapView data={data} ids={m.ids} fit={m.source === 'svet' && m.id !== 'svet' ? m.ids : undefined} marks={marks} tag={tag} focus={sel}
          onPick={(id) => setSel(id && nameOf(id) ? id : null)} label={`Mapa: ${m.title}. Klepni na místo a uvidíš jeho název.`} /> : <div class="map" />}
      </div>
      <p class="muted map-tip">Klepni na mapu a uvidíš, co kde je. Mapu posuneš tažením a přiblížíš dvěma prsty, kolečkem myši nebo tlačítkem +.</p>

      <h2 class="label">Hrát</h2>
      <div class="chips scope map-len" role="radiogroup" aria-label="Kolik otázek">
        <button type="button" role="radio" aria-checked={!all} class={`chip ${!all ? 'sel' : ''}`} onClick={() => setAll(false)}>{ROUND} otázek</button>
        <button type="button" role="radio" aria-checked={all} class={`chip ${all ? 'sel' : ''}`} onClick={() => setAll(true)}>celá mapa</button>
      </div>
      <div class="list">
        {modesOf(m).map((mode) => {
          const n = askable(m, mode.id).length
          const b = best[bestKey(m.id, mode.id, all)]
          return (
            <Link key={mode.id} class="row map-mode" href={`${MAPS_PATH}/${m.id}/${mode.id}${all ? '?vse' : ''}`} rel="nofollow">
              <span class="txt"><b>{mode.title}</b><small>{mode.hint} · {all ? n : Math.min(ROUND, n)} {count(all ? n : Math.min(ROUND, n), 'otázka', 'otázky', 'otázek')}</small></span>
              {b !== undefined ? <Stars n={stars(b)} /> : <IArrow />}
            </Link>
          )
        })}
      </div>

      <h2 class="label">{m.kind === 'stat' ? 'Státy a hlavní města' : 'Kraje a krajská města'}</h2>
      <div class="map-list">
        {m.ids.map((id) => {
          const pl = place(id)!
          return <button key={id} type="button" class={`map-place ${sel === id ? 'on' : ''}`} onClick={() => choose(id)}><b>{pl.name}</b><span>{pl.capital ?? (id === 'CZ-ST' ? 'sídlo v Praze' : '–')}</span></button>
        })}
      </div>
    </div>
  )
}

const count = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export function MapGame({ map, mode }: { map: string; mode: ModeId }) {
  const m = mapById(map)
  const data = useAsync(() => (m ? loadMap(m.source) : Promise.resolve(null)), [m?.source])
  const all = query().has('vse')
  useTitle(m ? titles.map(m.title, m.kind) : undefined)
  if (!m) return <Missing />
  if (!data) return <div class="page game" style={STYLE} />
  return <Game key={`${map}/${mode}`} m={m} mode={mode} data={data} all={all} />
}

interface Answer { id: string; pts: number }

/** Points for a place: found at the first try 1, at the second ½, later or shown 0. */
const TRIES = 3

function Game({ m, mode, data, all }: { m: GameMap; mode: ModeId; data: MapData; all: boolean }) {
  const pool = useMemo(() => askable(m, mode).filter((id) => data.f.some((a) => a.id === id)), [m, mode, data])
  const fresh = () => shuffle(pool).slice(0, all ? pool.length : ROUND)
  const [round, setRound] = useState<{ ids: string[]; retry: boolean }>(() => ({ ids: fresh(), retry: false }))
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [tries, setTries] = useState(0)
  const [flash, setFlash] = useState<{ id: string; tag: Tag } | null>(null)
  const [shown, setShown] = useState(false) // the answer is shown, waiting for „Dál“
  const [chosen, setChosen] = useState<string | null>(null) // poznej: the option tapped
  const [start, setStart] = useState(Date.now())
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const ids = round.ids
  const id = ids[i]
  const done = i >= ids.length
  const pl = id ? place(id)! : undefined
  const state = m.kind === 'stat'

  // Every place answered so far keeps its colour; the asked one is highlighted in „Poznáš?“.
  const marks = useMemo(() => {
    const k: Record<string, string> = {}
    for (const a of answers) k[a.id] = a.pts > 0 ? 'ok' : 'miss'
    if (id && mode === 'poznej' && !shown) k[id] = 'pick'
    if (id && shown) k[id] = 'show'
    if (flash?.tag.tone === 'bad') k[flash.id] = `${k[flash.id] ?? ''} bad`
    return k
  }, [answers, id, shown, flash, mode])

  const options = useMemo(() => {
    if (mode !== 'poznej' || !id) return []
    const a = data.f.find((x) => x.id === id)!
    const near = pool.filter((x) => x !== id).map((x) => { const b = data.f.find((f) => f.id === x)!; return { x, d: Math.hypot(a.x - b.x, a.y - b.y) } }).sort((p, q) => p.d - q.d).slice(0, 6)
    return shuffle([id, ...shuffle(near).slice(0, 3).map((n) => n.x)])
  }, [id, mode])

  const next = () => { clearTimeout(timer.current); setFlash(null); setShown(false); setChosen(null); setTries(0); setI(i + 1) }
  const answer = (pts: number) => setAnswers((a) => [...a, { id, pts }])
  const right = (pts: number) => {
    answer(pts)
    setFlash({ id, tag: { id, text: mode === 'mesta' ? `${pl!.name} · ${pl!.capital}` : pl!.name, tone: 'ok' } })
    timer.current = window.setTimeout(next, 900)
  }
  const reveal = () => { answer(0); setShown(true); setFlash({ id, tag: { id, text: mode === 'mesta' ? `${pl!.name} · ${pl!.capital}` : `Tohle je ${pl!.name}`, tone: 'show' } }) }

  const onPick = (picked: string | null) => {
    if (done || shown || mode === 'poznej' || !picked) return
    if (answers.length > i) return // already right, moving on
    // A pending „To je …“ of an earlier tap must not clear the next message.
    if (picked === id) { clearTimeout(timer.current); return right(tries === 0 ? 1 : tries === 1 ? 0.5 : 0) }
    const name = nameOf(picked)
    if (!name) return // a tiny territory without a name: no answer
    clearTimeout(timer.current)
    const t = tries + 1
    setTries(t)
    if (t >= TRIES) return reveal()
    setFlash({ id: picked, tag: { id: picked, text: `To je ${name}`, tone: 'bad' } })
    timer.current = window.setTimeout(() => setFlash(null), 1400)
  }

  const choose = (opt: string) => {
    if (chosen) return
    setChosen(opt)
    if (opt === id) right(1)
    else { answer(0); setShown(true); setFlash({ id, tag: { id, text: pl!.name, tone: 'show' } }) }
  }

  const again = (only?: string[]) => { clearTimeout(timer.current); setRound({ ids: only ? shuffle(only) : fresh(), retry: !!only }); setI(0); setAnswers([]); setTries(0); setFlash(null); setShown(false); setChosen(null); setStart(Date.now()) }

  if (done) return <Result m={m} mode={mode} all={all} answers={answers} retry={round.retry} secs={Math.round((Date.now() - start) / 1000)} onAgain={again} />

  const score = answers.reduce((n, a) => n + a.pts, 0)
  return (
    <div class="page game" style={STYLE}>
      <div class="qtop">
        <button class="icon-btn" onClick={back} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={i}>
          {ids.map((_, k) => <i key={k} class={k < answers.length ? (answers[k].pts === 1 ? 'ok' : answers[k].pts > 0 ? 'half' : 'bad') : k === i ? 'now' : ''} />)}
        </div>
        <span class="timer" aria-label="Body">{fmt(score)} b</span>
      </div>
      <div class="map-ask" aria-live="polite">
        {mode === 'poznej' ? <><small>{state ? 'Který stát je vyznačený?' : 'Který kraj je vyznačený?'}</small></>
          : <><small>{mode === 'mesta' ? (state ? 'Kde je hlavní město' : 'Ve kterém kraji je') : 'Najdi'}</small><b>{mode === 'mesta' ? pl!.capital : pl!.name}</b></>}
        {mode !== 'poznej' && !shown && tries > 0 && <span class="map-tries">{TRIES - tries === 1 ? 'poslední pokus' : `ještě ${TRIES - tries} pokusy`}</span>}
      </div>
      <MapView data={data} ids={m.ids} fit={m.source === 'svet' && m.id !== 'svet' ? m.ids : undefined} marks={marks} tag={flash?.tag}
        focus={mode === 'poznej' || shown ? id : null} onPick={onPick} label={`Slepá mapa: ${m.title}`} />
      {mode === 'poznej' && (
        <div class="opts map-opts">
          {options.map((o) => <button key={o} type="button" class={`opt ${chosen && o === id ? 'ok' : chosen === o ? 'bad' : ''}`} onClick={() => choose(o)} disabled={!!chosen && o !== chosen && o !== id}>{place(o)!.name}</button>)}
        </div>
      )}
      {shown && <div class="map-next"><button class="btn block" onClick={next} autoFocus>Dál</button></div>}
    </div>
  )
}

const fmt = (n: number) => String(n).replace('.', ',')

function Result({ m, mode, all, answers, retry, secs, onAgain }: { m: GameMap; mode: ModeId; all: boolean; answers: Answer[]; retry: boolean; secs: number; onAgain: (only?: string[]) => void }) {
  const pts = answers.reduce((n, a) => n + a.pts, 0)
  const pct = Math.round((pts / answers.length) * 100)
  const missed = answers.filter((a) => a.pts < 1).map((a) => a.id)
  // Only a whole round counts as a record, not a replay of the mistakes.
  const [record] = useState(() => !retry && saveBest(bestKey(m.id, mode, all), pct))
  return (
    <div class="page" style={STYLE}>
      <RoundResult pct={pct} first={answers.length - missed.length} total={answers.length} secs={secs} record={record} missed={missed.length} onRetry={() => onAgain(missed)} onAgain={() => onAgain()}>
        {missed.map((id) => { const pl = place(id)!; return <div key={id} class="card"><b>{pl.name}</b>{pl.capital && <span>{m.kind === 'stat' ? 'hlavní město' : 'krajské město'} {pl.capital}</span>}</div> })}
      </RoundResult>
    </div>
  )
}
