import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { createNet, curve, decode, encode, exampleOf, gotItAt, GRID, HIDDEN, isBlank, MAX_EXAMPLES, NEURO_INTRO, OUTPUTS, predict, rasterize, relearn, SHAPES, STORE_KEY, train, WINDOW, type Example, type Guess, type Net, type Stroke, type Taught } from '../neuro'
import { titles, useTitle } from '../seo'
import { Bar } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { digit, onControl, useKeys } from '../ui/keys'

// Neuronová síť (src/neuro): /neuronova-sit. The pupil draws on the pad and names the shape with one of four keys;
// the network guesses while the pupil draws (the display and the bars), learns from every named drawing, and the
// learning curve shows how its guesses got better. The drawings are saved in this device so the network can learn
// them again on the next visit; „Vymazat síť“ forgets everything.

const STYLE = keyStyle('magenta')
/** Below this many examples the network only guesses blindly; the display says so. */
const BLIND = 4
/** How sure the network must be to say „Je to …“ instead of „Možná …“. */
const SURE = 0.75

const load = () => { try { return decode(localStorage.getItem(STORE_KEY)) } catch { return [] } }
const save = (t: Taught[]) => { try { if (t.length) localStorage.setItem(STORE_KEY, encode(t)); else localStorage.removeItem(STORE_KEY) } catch { /* private mode: not saved */ } }
/** Never „100 %“: the network is never completely sure. */
const pct = (p: number) => `${Math.min(99, Math.round(p * 100))} %`
const count = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

export function NeuroScreen() {
  useTitle(titles.neuro())
  const [taught, setTaught] = useState<Taught[]>([])
  const [ready, setReady] = useState(false)
  const net = useRef<Net>(createNet())
  const examples = useRef<Example[]>([])
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirm, setConfirm] = useState(false)
  // The network learns what was taught before in a moment after the first paint.
  useEffect(() => {
    const id = setTimeout(() => {
      const t = load()
      const r = relearn(t)
      net.current = r.net
      examples.current = r.examples
      setTaught(t)
      setReady(true)
    }, 30)
    return () => clearTimeout(id)
  }, [])

  const blank = isBlank(strokes)
  const x = useMemo(() => rasterize(strokes), [strokes])
  // `taught` is a dependency: after learning, the same drawing gets a new guess.
  const guess = useMemo(() => (ready && !blank ? predict(net.current, x) : null), [x, ready, blank, taught])
  const log = taught.map((t) => t.ok)
  const at = gotItAt(log, taught.map((t) => t.shape))

  const clear = () => setStrokes([])
  const teach = (shape: number) => {
    if (!ready) return
    if (blank) { setSaid({ ok: false, text: 'Nejdřív nakresli tvar, pak řekni, co to je.' }); return }
    const before = predict(net.current, x).best
    const ok = before === shape
    let next = [...taught, { shape, strokes, ok }]
    if (next.length > MAX_EXAMPLES) {
      // Full: the oldest example goes and the network learns the rest again (as after a reload).
      next = next.slice(-MAX_EXAMPLES)
      const r = relearn(next)
      net.current = r.net
      examples.current = r.examples
    } else {
      // Seeded by position, so the copies are the same as after a reload.
      examples.current = [...examples.current, exampleOf(next[next.length - 1], next.length - 1)]
      train(net.current, examples.current, next.length)
    }
    save(next)
    setTaught(next)
    setStrokes([])
    setConfirm(false)
    const name = SHAPES[shape].acc
    setSaid(taught.length < BLIND
      ? { ok, text: `Díky, síť si ${name} zapamatuje. Zatím hádá naslepo, nauč ji všechny čtyři tvary.` }
      : ok ? { ok, text: `Síť hádala správně: ${name}. I ze správné odpovědi se ještě něco naučí.` }
      : { ok, text: `Síť si myslela ${SHAPES[before].acc}. Teď už ví, že tohle je ${name}.` })
  }
  const undo = () => {
    if (!taught.length) return
    const next = taught.slice(0, -1)
    const r = relearn(next)
    net.current = r.net
    examples.current = r.examples
    save(next)
    setTaught(next)
    setSaid({ ok: true, text: 'Poslední příklad je pryč, síť se naučila všechno znovu bez něj.' })
  }
  const reset = () => {
    net.current = createNet()
    examples.current = []
    save([])
    setTaught([])
    setStrokes([])
    setConfirm(false)
    setSaid({ ok: true, text: 'Síť je vymazaná a neumí nic. Můžeš ji učit znovu od začátku.' })
  }
  useKeys((e) => {
    const d = digit(e)
    if (d >= 1 && d <= OUTPUTS) { teach(d - 1); return true }
    if ((e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace') && !onControl(e.target)) { clear(); return true }
  })

  return (
    <div class="page nn" style={STYLE}>
      <Bar title="🧠 Neuronová síť" />
      <div class="blocks approach-about"><p>{NEURO_INTRO}</p></div>

      <Display ready={ready} n={taught.length} guess={guess} blank={blank} gotIt={at >= 0} />
      <Pad strokes={strokes} onChange={(s) => { setStrokes(s); setSaid(null) }} />
      <div class="nn-pad-row">
        <span class="muted">{taught.length ? `Naučeno: ${taught.length} ${count(taught.length, 'příklad', 'příklady', 'příkladů')}` : 'Síť zatím neviděla žádný příklad.'}</span>
        <button type="button" class="btn ghost nn-clear" onClick={clear} disabled={blank}>Smazat kresbu</button>
      </div>

      <h2 class="label">Co jsi nakreslil?</h2>
      <div class="nn-shapes" role="group" aria-label="Řekni síti, co jsi nakreslil">
        {SHAPES.map((s, i) => (
          <button key={s.id} type="button" class={`nn-shape ${guess && !blank && taught.length >= BLIND && guess.best === i ? 'guess' : ''}`} onClick={() => teach(i)} disabled={!ready} aria-keyshortcuts={String(i + 1)}>
            <ShapeIcon i={i} />
            <b>{s.name}</b>
            <small>{taught.filter((t) => t.shape === i).length}×</small>
          </button>
        ))}
      </div>
      <p class={`nn-said ${said ? (said.ok ? 'ok' : 'bad') : ''}`} role="status" aria-live="polite">{said?.text ?? ''}</p>

      <h2 class="label">Křivka učení</h2>
      <Curve taught={taught} at={at} />

      <h2 class="label">Uvnitř sítě</h2>
      <NetView x={x} guess={guess} net={net.current} />

      <h2 class="label">Jak to funguje</h2>
      <div class="blocks nn-how">
        <p><b>Co síť vidí.</b> Tvoje kresba se ořízne, zmenší na mřížku {GRID} × {GRID} políček a z každého políčka je jedno číslo od 0 (prázdné) do 1 (čára). Síť tedy dostane {GRID * GRID} čísel, nic jiného o obrázku neví.</p>
        <p><b>Neurony.</b> Každý z {HIDDEN} neuronů uprostřed vynásobí všech {GRID * GRID} čísel svými <i>vahami</i>, sečte je a podle součtu se víc nebo míň „rozsvítí“. Čtyři neurony vpravo pak ze svitu těch uprostřed spočítají, jak moc je obrázek trojúhelník, čtverec, kruh nebo obdélník. Na začátku jsou váhy náhodné, a tak síť hádá naslepo.</p>
        <p><b>Učení.</b> Když síti řekneš, co jsi nakreslil, porovná svůj tip se správnou odpovědí a všechny váhy kousek posune tak, aby příště hádala o trochu líp. Tomu se říká <i>zpětné šíření chyby</i>. Aby jí stačilo méně obrázků, učí se z každého ještě ze čtyř kopií mírně pootočených a posunutých.</p>
        <p><b>Křivka učení.</b> Než se síť z obrázku učí, nejdřív ho zkusí uhodnout. Ten tip je poctivá zkouška, protože obrázek ještě nikdy neviděla. Křivka ukazuje, kolik z posledních {WINDOW} tipů vyšlo. Ze začátku je kolem 25 %, což je náhoda (jeden ze čtyř tvarů). Ve chvíli, kdy síť uhodne aspoň 7 z {WINDOW}, tvary pochopila: pozná i obrázky, které nikdy neviděla.</p>
        <p><b>Na co si dát pozor.</b> Síť umí jen to, co jsi ji naučil. Když budeš kreslit jen malé kruhy, velký kruh ji může zmást, a když jí omylem řekneš špatný tvar, naučí se chybu. Čtverec a obdélník se liší jen poměrem stran, proto se je síť učí nejdéle. Stejně se učí i velké sítě, které poznávají obličeje nebo překládají texty, jen mají miliardy vah a učí se z obrovského množství příkladů.</p>
      </div>

      <div class="nn-reset">
        <button type="button" class="btn ghost" onClick={undo} disabled={!taught.length}>Vzít zpět poslední příklad</button>
        {confirm
          ? <div class="nn-confirm"><span>Síť zapomene všech {taught.length} {count(taught.length, 'příklad', 'příklady', 'příkladů')}.</span><button type="button" class="btn nn-danger" onClick={reset}>Vymazat</button><button type="button" class="btn ghost" onClick={() => setConfirm(false)}>Nechat</button></div>
          : <button type="button" class="btn ghost" onClick={() => setConfirm(true)} disabled={!taught.length}>Vymazat síť</button>}
      </div>
      <p class="muted nn-note">Obrázky, které síť naučíš, zůstávají jen v tomhle zařízení.</p>
    </div>
  )
}

/** The display above the pad: the network's guess while you draw. */
function Display({ ready, n, guess, blank, gotIt }: { ready: boolean; n: number; guess: Guess | null; blank: boolean; gotIt: boolean }) {
  let big: string, small: string
  if (!ready) { big = 'Vzpomínám…'; small = 'síť se znovu učí tvoje obrázky' }
  else if (blank || !guess) { big = n ? 'Kresli' : 'Nakresli tvar'; small = gotIt ? 'pochopila to: pozná tvar sama' : n < BLIND ? 'a řekni síti, co to je' : 'síť bude hádat už během kreslení' }
  else if (n < BLIND) { big = SHAPES[guess.best].name; small = 'hádám naslepo, nic jsem se ještě nenaučila' }
  else if (guess.probs[guess.best] >= SURE) { big = `Je to ${SHAPES[guess.best].acc}!`; small = `jsem si jistá na ${pct(guess.probs[guess.best])}` }
  else { big = `Možná ${SHAPES[guess.best].acc}?`; small = `jen na ${pct(guess.probs[guess.best])}` }
  return (
    <div class="nn-display">
      <div class="nn-lcd" aria-live="polite"><b>{big}</b><small>{small}</small></div>
      <div class="nn-bars" aria-label="Jak moc si je síť jistá">
        {SHAPES.map((s, i) => {
          const p = guess && !blank ? guess.probs[i] : 0
          return (
            <div key={s.id} class={`nn-bar ${guess && !blank && guess.best === i ? 'best' : ''}`}>
              <span>{s.name}</span><i><b style={{ width: `${(p * 100).toFixed(1)}%` }} /></i><em>{guess && !blank ? pct(p) : '–'}</em>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The drawing pad: a finger, a pen or the mouse draws strokes (points 0–1 of the pad). */
function Pad({ strokes, onChange }: { strokes: Stroke[]; onChange: (s: Stroke[]) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef<Stroke[]>(strokes)
  const drawing = useRef<number | null>(null)
  const frame = useRef(0)
  const paint = () => {
    const c = canvas.current
    if (!c) return
    // Sized by the pad, never by the canvas itself: a canvas measured before the stylesheet applies has the size of
    // its own bitmap, and growing the bitmap from that would double it on every resize.
    const r = c.parentElement!.getBoundingClientRect(), dpr = Math.min(3, devicePixelRatio || 1)
    const w = Math.min(2048, Math.round(r.width * dpr)), h = Math.min(2048, Math.round(r.height * dpr))
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
    const g = c.getContext('2d')
    if (!g) return
    g.clearRect(0, 0, w, h)
    g.strokeStyle = getComputedStyle(c).color
    g.lineWidth = Math.max(3, w / 70)
    g.lineCap = 'round'
    g.lineJoin = 'round'
    for (const s of live.current) {
      g.beginPath()
      s.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)))
      if (s.length === 1) g.lineTo(s[0][0] * w + 0.1, s[0][1] * h)
      g.stroke()
    }
  }
  // A new drawing from outside (cleared after teaching) replaces the one on the pad.
  useEffect(() => { if (drawing.current === null) { live.current = strokes; paint() } }, [strokes])
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ro = new ResizeObserver(paint)
    ro.observe(c.parentElement!)
    return () => { ro.disconnect(); cancelAnimationFrame(frame.current) }
  }, [])
  const at = (e: PointerEvent): [number, number] => {
    const r = canvas.current!.getBoundingClientRect()
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]
  }
  // The network guesses at most once a frame while drawing.
  const publish = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => { frame.current = 0; onChange(live.current.map((s) => [...s])) })
  }
  return (
    <div class="nn-pad">
      <canvas
        ref={canvas}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        role="img"
        aria-label={strokes.length ? 'Tvoje kresba' : 'Kreslicí plocha: kresli prstem nebo myší'}
        onPointerDown={(e) => {
          if (e.button !== 0 || drawing.current !== null) return
          e.preventDefault()
          canvas.current!.setPointerCapture(e.pointerId)
          drawing.current = e.pointerId
          live.current = [...live.current, [at(e)]]
          paint()
          publish()
        }}
        onPointerMove={(e) => {
          if (drawing.current !== e.pointerId) return
          const evs = (e as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] }).getCoalescedEvents?.() ?? [e]
          const last = live.current[live.current.length - 1]
          for (const ev of evs.length ? evs : [e]) last.push(at(ev))
          paint()
          publish()
        }}
        onPointerUp={(e) => { if (drawing.current === e.pointerId) { drawing.current = null; publish() } }}
        onPointerCancel={(e) => { if (drawing.current === e.pointerId) { drawing.current = null; publish() } }}
      />
      {!strokes.length && <span class="nn-pad-hint" aria-hidden="true">kresli sem</span>}
    </div>
  )
}

export function ShapeIcon({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" class="nn-icon">
      {i === 0 && <path d="M20 6 L35 33 H5 Z" />}
      {i === 1 && <rect x="8" y="8" width="24" height="24" rx="1.5" />}
      {i === 2 && <circle cx="20" cy="20" r="13" />}
      {i === 3 && <rect x="3" y="12" width="34" height="16" rx="1.5" />}
    </svg>
  )
}

/** The learning curve: the share of right guesses over the last few examples, after every example. */
function Curve({ taught, at }: { taught: Taught[]; at: number }) {
  const log = taught.map((t) => t.ok)
  const W = 320, H = 150, L = 34, R = 10, T = 12, B = 34
  const n = Math.max(20, log.length)
  const xs = (i: number) => L + ((W - L - R) * (i + 0.5)) / n
  const ys = (v: number) => T + (H - T - B) * (1 - v)
  const c = curve(log)
  const path = c.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('')
  const last = log.slice(-WINDOW)
  return (
    <div class="card nn-curve">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={log.length ? `Křivka učení: z posledních ${last.length} tipů vyšlo ${last.filter(Boolean).length}.${at >= 0 ? ` Síť tvary pochopila po ${at + 1}. příkladu.` : ''}` : 'Křivka učení, zatím prázdná'}>
        {[0, 0.5, 1].map((v) => <g key={v}><line class="grid" x1={L} x2={W - R} y1={ys(v)} y2={ys(v)} /><text x={L - 6} y={ys(v) + 4} text-anchor="end">{v * 100}</text></g>)}
        <line class="chance" x1={L} x2={W - R} y1={ys(0.25)} y2={ys(0.25)} />
        <text class="chance-t" x={W - R} y={ys(0.25) - 4} text-anchor="end">náhoda</text>
        {at >= 0 && <g class="got"><line x1={xs(at)} x2={xs(at)} y1={T - 4} y2={H - B} /><text x={Math.min(xs(at) + 4, W - R - 60)} y={T + 8}>pochopila!</text></g>}
        {c.length > 1 && <path class="line" d={path} />}
        {c.length === 1 && <circle class="dot-line" cx={xs(0)} cy={ys(c[0])} r="2.5" />}
        {log.map((ok, i) => <rect key={i} class={ok ? 'ok' : 'bad'} x={xs(i) - Math.min(4, (W - L - R) / n / 2 - 0.5)} width={Math.min(8, (W - L - R) / n - 1)} y={H - B + 6} height="7" rx="1" />)}
        <text x={L} y={H - 4}>1</text>
        <text x={W - R} y={H - 4} text-anchor="end">{n}. příklad</text>
        <text class="axis" x="2" y={T - 2}>%</text>
      </svg>
      <p class="muted">
        {!log.length ? 'Tady uvidíš, jak se síť zlepšuje. Každý obrázek, který jí ukážeš, je jeden sloupek: zelený, když ho uhodla dřív, než jsi jí to řekl, červený, když ne.'
          : at >= 0 ? `Síť tvary pochopila po ${at + 1}. příkladu. Z posledních ${last.length} tipů vyšlo ${last.filter(Boolean).length}. Teď už jen kresli, pozná to sama.`
          : `Z posledních ${last.length} tipů vyšlo ${last.filter(Boolean).length}. Pochopila to, až jich vyjde aspoň 7 z ${WINDOW}${new Set(taught.map((t) => t.shape)).size < OUTPUTS ? ' a uvidí všechny čtyři tvary' : ''}.`}
      </p>
    </div>
  )
}

/** Inside the network: what it sees (16 × 16), how much each hidden neuron lights up and how sure each output is. */
function NetView({ x, guess, net }: { x: Float32Array; guess: Guess | null; net: Net }) {
  const W = 336, H = 210
  const px = 6, gx = 4, gy = (H - GRID * px) / 2
  const cols = 2, per = HIDDEN / cols
  const hx = (h: number) => 160 + (Math.floor(h / per) - 0.5) * 22
  const hy = (h: number) => 14 + ((H - 28) * ((h % per) + 0.5)) / per
  const ox = 256, oy = (k: number) => 30 + ((H - 60) * (k + 0.5)) / OUTPUTS
  const act = guess?.hidden
  let maxW = 1e-6
  if (act) for (let k = 0; k < OUTPUTS; k++) for (let h = 0; h < HIDDEN; h++) maxW = Math.max(maxW, Math.abs(net.w2[k * HIDDEN + h] * act[h]))
  return (
    <div class="card nn-net">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={guess ? `Síť vidí tvoji kresbu jako ${GRID} × ${GRID} políček, ${HIDDEN} neuronů se rozsvítí a nejvíc vychází ${SHAPES[guess.best].acc}.` : `Síť: ${GRID * GRID} vstupů, ${HIDDEN} neuronů a ${OUTPUTS} výstupy. Nakresli tvar a uvidíš, jak se rozsvítí.`}>
        {Array.from({ length: HIDDEN }, (_, h) => <line key={h} class="in" x1={gx + GRID * px} y1={H / 2} x2={hx(h)} y2={hy(h)} />)}
        {act && Array.from({ length: HIDDEN * OUTPUTS }, (_, j) => {
          const k = Math.floor(j / HIDDEN), h = j % HIDDEN, v = net.w2[k * HIDDEN + h] * act[h]
          const o = Math.abs(v) / maxW
          return o > 0.08 ? <line key={j} class={v > 0 ? 'pos' : 'neg'} x1={hx(h)} y1={hy(h)} x2={ox} y2={oy(k)} style={{ opacity: (0.15 + 0.85 * o).toFixed(2), strokeWidth: (0.6 + 2 * o).toFixed(2) }} /> : null
        })}
        <rect class="frame" x={gx - 1} y={gy - 1} width={GRID * px + 2} height={GRID * px + 2} />
        {Array.from(x, (v, i) => (v > 0.02 ? <rect key={i} class="px" x={gx + (i % GRID) * px} y={gy + Math.floor(i / GRID) * px} width={px} height={px} style={{ opacity: v.toFixed(2) }} /> : null))}
        <text x={gx + (GRID * px) / 2} y={gy - 8} text-anchor="middle">co síť vidí</text>
        <text x={gx + (GRID * px) / 2} y={gy + GRID * px + 16} text-anchor="middle">{GRID * GRID} čísel</text>
        {Array.from({ length: HIDDEN }, (_, h) => {
          const a = act?.[h] ?? 0
          return <circle key={h} class={`neuron ${a > 0 ? 'pos' : 'neg'}`} cx={hx(h)} cy={hy(h)} r="6" style={{ fillOpacity: Math.abs(a).toFixed(2) }} />
        })}
        {SHAPES.map((s, k) => {
          const p = guess?.probs[k] ?? 0
          return (
            <g key={s.id} class={`out ${guess?.best === k ? 'best' : ''}`}>
              <circle cx={ox} cy={oy(k)} r="9" style={{ fillOpacity: p.toFixed(2) }} />
              <text x={ox + 14} y={oy(k) - 1}>{s.name}</text>
              <text class="p" x={ox + 14} y={oy(k) + 11}>{guess ? pct(p) : '–'}</text>
            </g>
          )
        })}
      </svg>
      <p class="muted">Vlevo je tvoje kresba tak, jak ji síť vidí. Uprostřed {HIDDEN} neuronů: čím sytější, tím víc se rozsvítily (barevné kladně, šedé záporně). Čáry vpravo ukazují, které neurony nejvíc hlasují pro který tvar.</p>
    </div>
  )
}
