import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { subjectMeta } from '../content/curriculum'
import { CROSSWORD_INTRO, CROSSWORD_PATH, generate, levelById, levelFor, LEVELS, num, saveBest, useBest, type Cell, type Level, type Puzzle } from '../crossword'
import { stars, useProgress } from '../progress/store'
import { back, Link } from '../router'
import { titles, useTitle } from '../seo'
import { Bar, Stars } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IArrow, IBulb, IClose } from '../ui/icons'
import { isTyping, useKeys } from '../ui/keys'
import { RoundResult } from '../ui/RoundResult'

// Matematické křížovky (src/crossword): /matematicke-krizovky (the levels) and the game /matematicke-krizovky/<level>.
// A tile is placed by tapping an empty cell and then a tile (or just a tile: it goes to the selected cell); a placed
// tile goes back by tapping its cell again. An equation turns green or red once all its numbers are filled in.

const STYLE = keyStyle(subjectMeta('matematika').c)

/** The example on the level page: 3 + 4 = 7 crossing 7 − 2 = 5, two numbers missing. */
const EXAMPLE: Cell[] = [
  { kind: 'num', r: 0, c: 0, key: '0,0', value: 3, blank: false }, { kind: 'op', r: 0, c: 1, text: '+' },
  { kind: 'num', r: 0, c: 2, key: '0,2', value: 4, blank: true }, { kind: 'op', r: 0, c: 3, text: '=' },
  { kind: 'num', r: 0, c: 4, key: '0,4', value: 7, blank: false }, { kind: 'op', r: 1, c: 4, text: '−' },
  { kind: 'num', r: 2, c: 4, key: '2,4', value: 2, blank: false }, { kind: 'op', r: 3, c: 4, text: '=' },
  { kind: 'num', r: 4, c: 4, key: '4,4', value: 5, blank: true },
]

export function CrosswordScreen() {
  useTitle(titles.crosswords())
  const best = useBest()
  const p = useProgress()
  const mine = levelFor(p.g)
  return (
    <div class="page" style={STYLE}>
      <Bar title="🔢 Matematické křížovky" />
      <div class="blocks approach-about"><p>{CROSSWORD_INTRO}</p></div>
      <div class="cw-example" aria-hidden="true">
        <Grid rows={5} cols={5} cells={EXAMPLE} placed={{ '0,2': 4 }} />
      </div>
      <h2 class="label">Vyber si úroveň</h2>
      <div class="list">
        {LEVELS.map((lv) => {
          const b = best[lv.id]
          return (
            <Link key={lv.id} class="row map-mode" href={`${CROSSWORD_PATH}/${lv.id}`} rel="nofollow">
              <span class="txt"><b>{lv.title}{lv === mine && <span class="tag cw-mine">pro tebe</span>}</b><small>{lv.who} · {lv.hint}</small></span>
              {b !== undefined ? <Stars n={stars(b)} /> : <IArrow />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CrosswordGame({ level }: { level: string }) {
  useTitle(titles.crosswords())
  const lv = levelById(level)
  const [round, setRound] = useState(0)
  if (!lv) return <div class="page" style={STYLE}><Bar title="Matematické křížovky" /><div class="empty">Tahle úroveň tu není.<Link class="btn" href={CROSSWORD_PATH}>Matematické křížovky</Link></div></div>
  return <Game key={`${lv.id}/${round}`} lv={lv} onAgain={() => setRound((n) => n + 1)} />
}

/** The grid: numbers, operators, empty and filled cells. `placed` = the value shown in a blank cell. */
function Grid({ rows, cols, cells, placed, sel, marks, locked, onCell, onGrab, drop }: {
  rows: number; cols: number; cells: Cell[]; placed: Record<string, number>
  sel?: string | null; marks?: Record<string, 'ok' | 'bad'>; locked?: Set<string>; onCell?: (key: string) => void
  /** A finger or the mouse goes down on a filled cell: its number may be dragged elsewhere. */
  onGrab?: (key: string, e: PointerEvent) => void
  /** The cell a dragged number would land in. */
  drop?: string | null
}) {
  return (
    <div class="cw-grid" style={{ '--cols': cols, '--rows': rows }} role={onCell ? 'group' : undefined} aria-label={onCell ? 'Křížovka' : undefined}>
      {cells.map((x) => {
        const style = { gridRow: x.r + 1, gridColumn: x.c + 1 }
        if (x.kind === 'op') return <span key={`${x.r},${x.c}`} data-k={`${x.r},${x.c}`} class={`cw-cell op ${x.text === '=' ? 'eq' : ''} ${marks?.[`${x.r},${x.c}`] === 'ok' ? 'ok' : ''}`} style={style} aria-hidden="true">{x.text}</span>
        const text = x.blank ? (placed[x.key] !== undefined ? num(placed[x.key]) : '') : num(x.value)
        const cls = `cw-cell num ${text.length >= 4 ? 'long' : text.length === 3 ? 'mid' : ''} ${x.blank ? 'blank' : ''} ${x.blank && placed[x.key] !== undefined ? 'filled' : ''} ${sel === x.key ? 'sel' : ''} ${marks?.[x.key] ?? ''} ${locked?.has(x.key) ? 'hint' : ''} ${drop === x.key ? 'drop' : ''}`
        if (!x.blank || !onCell) return <span key={x.key} data-k={x.key} class={cls} style={style} aria-hidden={onCell ? 'true' : undefined}>{text}</span>
        return (
          <button key={x.key} data-k={x.key} type="button" class={cls} style={style} onClick={() => onCell(x.key)} onPointerDown={placed[x.key] !== undefined && onGrab ? (e) => onGrab(x.key, e) : undefined} aria-pressed={sel === x.key}
            aria-label={`Řádek ${x.r + 1}, sloupec ${x.c + 1}: ${text ? num(placed[x.key]) : 'prázdné'}`}>{text}</button>
        )
      })}
    </div>
  )
}

const status = (pz: Puzzle, value: (k: string) => number | undefined) => pz.eqs.map((e, i) => {
  const v = pz.numKeys[i].map(value)
  if (v.some((x) => x === undefined)) return null
  const [a, b, c] = v as number[]
  const r = e.op === '+' ? a + b : e.op === '−' ? a - b : e.op === '×' ? a * b : b !== 0 ? a / b : NaN
  return r === c
})

function Game({ lv, onAgain }: { lv: Level; onAgain: () => void }) {
  const pz = useMemo(() => generate(lv), [lv])
  const cellOf = useMemo(() => new Map(pz.cells.flatMap((c) => (c.kind === 'num' ? [[c.key, c] as const] : []))), [pz])
  /** Blank cells in reading order. */
  const blanks = useMemo(() => pz.cells.filter((c) => c.kind === 'num' && c.blank).map((c) => (c as { key: string }).key), [pz])
  /** Cell → index of the tile placed there. */
  const [placed, setPlaced] = useState<Record<string, number>>({})
  const [sel, setSel] = useState<string | null>(blanks[0] ?? null)
  const [helped, setHelped] = useState<Set<string>>(new Set())
  /** Per equation: right at the first try (true), not (false), not finished yet (undefined). */
  const [first, setFirst] = useState<(boolean | undefined)[]>([])
  /** Equations with a missing number: only those count (one with all numbers given is no task). */
  const scored = useMemo(() => pz.numKeys.map((ks) => ks.some((k) => blanks.includes(k))), [pz])
  const [start] = useState(Date.now())
  const [done, setDone] = useState<number | null>(null) // seconds, once solved
  const [finished, setFinished] = useState(false) // the result is shown
  const typed = useRef('')
  /** A number being dragged (a tile from the bank, or the number of a filled cell) and where it would land. */
  const [drag, setDrag] = useState<{ tile: number; x: number; y: number; over: string | null } | null>(null)
  /** After a drag the browser still sends a click: it must not also tap the tile or the cell. */
  const dragged = useRef(false)

  const shown: Record<string, number> = {}
  for (const k in placed) shown[k] = pz.tiles[placed[k]]
  const value = (k: string) => { const c = cellOf.get(k)!; return c.kind === 'num' && !c.blank ? c.value : shown[k] }
  const st = status(pz, value)
  const used = new Set(Object.values(placed))
  const right = (k: string) => shown[k] !== undefined && shown[k] === (cellOf.get(k) as { value: number }).value
  const solved = blanks.every(right)

  const marks: Record<string, 'ok' | 'bad'> = {}
  // A wrong equation shows its filled-in numbers red (the given ones are right), a right one all green.
  st.forEach((s, i) => {
    if (s === null) return
    // A right equation turns green as a whole, operators too.
    const e = pz.eqs[i], [dr, dc] = e.dir === 'h' ? [0, 1] : [1, 0]
    const ks = s ? [0, 1, 2, 3, 4].map((j) => `${e.r + dr * j},${e.c + dc * j}`) : pz.numKeys[i]
    for (const k of ks) if (s ? marks[k] !== 'bad' : blanks.includes(k) && !helped.has(k)) marks[k] = s ? 'ok' : 'bad'
  })

  // An equation is judged when it is filled in for the first time; one with a hinted number does not count as right.
  useEffect(() => {
    if (st.every((s, i) => s === null || first[i] !== undefined)) return
    setFirst((f) => st.map((s, i) => f[i] ?? (s === null ? undefined : s && !pz.numKeys[i].some((k) => helped.has(k)))))
  }, [placed])

  useEffect(() => {
    if (!solved || done !== null) return
    setDone(Math.round((Date.now() - start) / 1000))
    setSel(null)
    const t = window.setTimeout(() => setFinished(true), 1400)
    return () => clearTimeout(t)
  }, [solved])

  /** The next empty cell after `from`: in the same equations first, then in reading order. */
  const nextEmpty = (p: Record<string, number>, from: string) => {
    const empty = (k: string) => p[k] === undefined
    const near = pz.numKeys.filter((ks) => ks.includes(from)).flat().filter((k) => blanks.includes(k) && empty(k))
    if (near.length) return near[0]
    const i = blanks.indexOf(from)
    return [...blanks.slice(i + 1), ...blanks.slice(0, i)].find(empty) ?? null
  }

  const place = (tile: number, at = sel ?? blanks.find((k) => placed[k] === undefined)) => {
    if (!at || done !== null || helped.has(at)) return
    const p = { ...placed }
    for (const k in p) if (p[k] === tile) delete p[k]
    p[at] = tile
    setPlaced(p)
    setSel(nextEmpty(p, at))
  }
  const clear = (k: string) => {
    if (helped.has(k) || placed[k] === undefined) return
    const p = { ...placed }
    delete p[k]
    setPlaced(p)
    setSel(k)
  }
  const onCell = (k: string) => {
    if (dragged.current || done !== null || helped.has(k)) return
    if (sel === k && placed[k] !== undefined) clear(k)
    else setSel(k)
  }
  const onTile = (tile: number) => {
    if (dragged.current || done !== null) return
    // A placed tile goes back to the bank.
    const at = Object.keys(placed).find((k) => placed[k] === tile)
    if (at) return clear(at)
    place(tile)
  }

  /** Drag and drop: a tile (or a placed number) follows the finger and lands in the empty cell under it; a placed
   *  number dropped outside the crossword goes back to the bank. A short tap stays a tap (onClick). */
  const grab = (tile: number, from: string | null, e: PointerEvent) => {
    if (done !== null || (from && helped.has(from)) || (e.pointerType === 'mouse' && e.button !== 0)) return
    const x0 = e.clientX, y0 = e.clientY
    let moving = false
    const target = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('.cw-board button[data-k]')
      const k = el?.dataset.k
      return k && !helped.has(k) ? k : null
    }
    const move = (ev: PointerEvent) => {
      if (!moving && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return
      moving = true
      ev.preventDefault()
      setDrag({ tile, x: ev.clientX, y: ev.clientY, over: target(ev.clientX, ev.clientY) })
    }
    const up = (ev: PointerEvent) => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', up)
      if (!moving) return
      dragged.current = true
      setTimeout(() => { dragged.current = false }, 0)
      setDrag(null)
      if (ev.type === 'pointercancel') return
      const at = target(ev.clientX, ev.clientY)
      if (at) place(tile, at)
      else if (from) clear(from)
    }
    addEventListener('pointermove', move, { passive: false })
    addEventListener('pointerup', up)
    addEventListener('pointercancel', up)
  }

  /** Nápověda: the right number into the selected cell (or the first one that is not right yet). */
  const hint = () => {
    if (done !== null) return
    const at = sel && !right(sel) ? sel : blanks.find((k) => !right(k))
    if (!at) return
    const want = (cellOf.get(at) as { value: number }).value
    // A free tile of that value, else one placed where it does not belong.
    const tiles = pz.tiles.map((v, i) => i).filter((i) => pz.tiles[i] === want)
    const tile = tiles.find((i) => !used.has(i)) ?? tiles.find((i) => { const k = Object.keys(placed).find((x) => placed[x] === i)!; return !right(k) || k === at })
    if (tile === undefined) return
    const h = new Set(helped)
    h.add(at)
    setHelped(h)
    const p = { ...placed }
    for (const k in p) if (p[k] === tile || k === at) delete p[k]
    p[at] = tile
    setPlaced(p)
    setSel(nextEmpty(p, at))
  }

  // Keyboard: type the number (Enter when it could go on), Backspace takes the tile back, arrows move, H = hint.
  useKeys((ev) => {
    if (isTyping(ev.target)) return
    const free = pz.tiles.map((v, i) => i).filter((i) => !used.has(i))
    const text = (i: number) => String(pz.tiles[i])
    if (/^[0-9-]$/.test(ev.key) || ev.key === '−') {
      let t = typed.current + (ev.key === '−' ? '-' : ev.key)
      if (!free.some((i) => text(i).startsWith(t))) t = ev.key === '−' ? '-' : ev.key
      const match = free.filter((i) => text(i).startsWith(t))
      const exact = match.find((i) => text(i) === t)
      if (exact !== undefined && match.every((i) => text(i) === t)) { place(exact); t = '' }
      typed.current = match.length ? t : ''
      return true
    }
    if (ev.key === 'Enter' && typed.current) {
      const exact = free.find((i) => text(i) === typed.current)
      typed.current = ''
      if (exact !== undefined) place(exact)
      return true
    }
    if ((ev.key === 'Backspace' || ev.key === 'Delete') && sel) { typed.current = ''; clear(sel); return true }
    if (ev.key === 'h' || ev.key === 'H') { hint(); return true }
    const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[ev.key]
    if (d && sel) {
      const [r, c] = sel.split(',').map(Number)
      // The nearest blank in that direction (a step along it counts more than a step aside).
      const to = blanks.filter((k) => { const [rr, cc] = k.split(',').map(Number); return (rr - r) * d[0] + (cc - c) * d[1] > 0 })
        .sort((a, b) => { const f = (k: string) => { const [rr, cc] = k.split(',').map(Number); return Math.abs((rr - r) * d[0] + (cc - c) * d[1]) + 2 * Math.abs((rr - r) * d[1] + (cc - c) * d[0]) }; return f(a) - f(b) })[0]
      if (to) setSel(to)
      return true
    }
  }, done === null)

  if (finished && done !== null) {
    const total = scored.filter(Boolean).length
    const ok = first.filter((f, i) => f && scored[i]).length
    const pct = Math.round((ok / total) * 100)
    return <div class="page" style={STYLE}><Result lv={lv} pct={pct} ok={ok} total={total} secs={done} hints={helped.size} onAgain={onAgain} /></div>
  }

  const shownOf = (i: number) => pz.numKeys[i].map((k) => { const v = value(k); return v === undefined ? 'prázdné' : num(v) })
  return (
    <div class="page game cw-game" style={STYLE}>
      <div class="qtop">
        <button class="icon-btn" onClick={() => back(CROSSWORD_PATH)} aria-label="Ukončit"><IClose /></button>
        <div class="steps-meter" role="img" aria-label={`Hotové příklady: ${st.filter(Boolean).length} z ${pz.eqs.length}`}>
          {pz.eqs.map((_, i) => <i key={i} class={st[i] ? 'ok' : st[i] === false ? 'bad' : ''} />)}
        </div>
        <button class="icon-btn cw-hint" onClick={hint} disabled={done !== null} aria-label="Nápověda (H)" title="Nápověda"><IBulb />{helped.size > 0 && <small>{helped.size}</small>}</button>
      </div>
      <div class="map-ask cw-ask" aria-live="polite">
        <small>{lv.title}</small>
        <b>{done !== null ? 'Hotovo, všechno platí!' : st.some((s) => s === false) ? 'Červený příklad neplatí – oprav ho' : 'Doplň čísla do křížovky'}</b>
      </div>
      <ol class="sr-only" aria-label="Příklady">
        {pz.eqs.map((e, i) => { const [a, b, c] = shownOf(i); return <li key={i}>{e.dir === 'h' ? 'Vodorovně' : 'Svisle'}: {a} {e.op} {b} = {c}{st[i] === false ? ', neplatí' : st[i] ? ', platí' : ''}</li> })}
      </ol>
      <div class="cw-board">
        <Grid rows={pz.rows} cols={pz.cols} cells={pz.cells} placed={shown} sel={sel} marks={marks} locked={helped} onCell={onCell} onGrab={(k, e) => grab(placed[k], k, e)} drop={drag?.over} />
      </div>
      <div class="cw-bank" role="group" aria-label="Čísla k doplnění">
        {pz.tiles.map((v, i) => (
          <button key={i} type="button" class={`cw-tile ${used.has(i) ? 'used' : ''} ${num(v).length >= 4 ? 'long' : ''}`} onClick={() => onTile(i)} onPointerDown={used.has(i) ? undefined : (e) => grab(i, null, e)} disabled={done !== null}
            aria-label={used.has(i) ? `${num(v)}, vrátit z křížovky` : num(v)}>{num(v)}</button>
        ))}
      </div>
      <p class="muted cw-help">{sel ? 'Přetáhni číslo do políčka, nebo na něj klepni.' : 'Klepni na prázdné políčko.'} Vyplněné políčko klepnutím vyprázdníš.</p>
      {drag && <span class={`cw-tile cw-ghost ${num(pz.tiles[drag.tile]).length >= 4 ? 'long' : ''}`} style={{ left: `${drag.x}px`, top: `${drag.y}px` }} aria-hidden="true">{num(pz.tiles[drag.tile])}</span>}
    </div>
  )
}

function Result({ lv, pct, ok, total, secs, hints, onAgain }: { lv: Level; pct: number; ok: number; total: number; secs: number; hints: number; onAgain: () => void }) {
  const [record] = useState(() => saveBest(lv.id, pct))
  const i = LEVELS.indexOf(lv)
  const harder = pct >= 90 ? LEVELS[i + 1] : undefined
  return (
    <>
      <RoundResult pct={pct} first={ok} total={total} secs={secs} record={record} missed={0} onRetry={onAgain} onAgain={onAgain} done={CROSSWORD_PATH} />
      <p class="muted cw-after">{hints ? `Nápověda ${hints}×. ` : ''}Body jsou za příklady, které platily hned napoprvé.</p>
      {harder && <Link class="row map-mode cw-next" href={`${CROSSWORD_PATH}/${harder.id}`} rel="nofollow"><span class="txt"><b>Zkus těžší: {harder.title}</b><small>{harder.who} · {harder.hint}</small></span><IArrow /></Link>}
    </>
  )
}
