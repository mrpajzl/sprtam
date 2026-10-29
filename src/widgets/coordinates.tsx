import { useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt } from './kit'

// A coordinate grid −n…n. "find": the pupil moves a point (tap, arrow buttons or arrow keys) onto a target
// and checks it. "read": letters on the grid, a tap reveals the coordinates. Optionally the points form a
// polygon and/or are reflected in the x or y axis (images A′, B′…).

const point = s.object({
  name: s.optional(s.string({ pattern: '^[A-Z]$', description: 'Písmeno bodu (A–Z). Bez něj se body pojmenují A, B, C… podle pořadí.' })),
  x: s.int({ min: -10, max: 10, description: 'Souřadnice x (vodorovně, kladná doprava).' }),
  y: s.int({ min: -10, max: 10, description: 'Souřadnice y (svisle, kladná nahoru).' }),
}, { description: 'Bod [x; y].' })

const props = s.object({
  mode: s.enum(['find', 'read'], { description: 'Režim: "find" – dítě hledá body podle souřadnic (klepnutím do mřížky nebo šipkami), "read" – body jsou v mřížce a souřadnice se ukážou po klepnutí.' }),
  points: s.array(point, { min: 1, max: 8, description: 'Body v pořadí, v jakém se hledají a spojují. V otázce (Question) se ptá na první bod.' }),
  n: s.optional(s.int({ min: 5, max: 10, description: 'Velikost mřížky: osy jdou od −n do n. Výchozí 6.' })),
  polygon: s.optional(s.boolean({ description: 'Spojit body v pořadí do mnohoúhelníku (aspoň 3 body).' })),
  mirror: s.optional(s.enum(['x', 'y'], { description: 'Osová souměrnost podle osy "x" nebo "y": ukáže i obrazy bodů A′, B′… V režimu "find" dítě hledá obrazy, v otázce se ptá na obraz prvního bodu.' })),
})
type P = Infer<typeof props>
type Pt = { name: string; x: number; y: number }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const named = (pts: P['points']): Pt[] => pts.map((p, i) => ({ name: p.name ?? LETTERS[i % 26], x: p.x, y: p.y }))
const reflect = (p: Pt, axis: 'x' | 'y'): Pt => ({ name: `${p.name}′`, x: axis === 'y' ? -p.x : p.x, y: axis === 'x' ? -p.y : p.y })
/** „[3; −2]“ – the Czech notation (a semicolon, because the comma is the decimal separator). */
export const pair = (x: number, y: number) => `[${fmt(x)}; ${fmt(y)}]`
/** „[3; −2]“, „3;-2“, „(3; −2)“ → [3, −2]; anything else → null. */
export function parsePair(text: string): [number, number] | null {
  const parts = text.replace(/[[\]()]/g, '').replace(/[−–]/g, '-').split(';').map((t) => t.trim().replace(',', '.'))
  if (parts.length !== 2 || parts.some((t) => !/^-?\d+(\.\d+)?$/.test(t))) return null
  return [Number(parts[0]), Number(parts[1])]
}

// ——— The grid ———

const SIZE = 340
function geom(n: number) {
  const S = SIZE / (2 * n + 2) // one unit, with half a unit of margin on every side… plus room for labels
  const X = (x: number) => SIZE / 2 + x * S, Y = (y: number) => SIZE / 2 - y * S
  return { S, X, Y }
}

function Grid({ n, children, onPick, label, onKey }: { n: number; children: ComponentChildren; onPick?: (x: number, y: number) => void; label: string; onKey?: (e: KeyboardEvent) => void }) {
  const { S, X, Y } = geom(n)
  const every = n > 7 ? 2 : 1
  const ticks = Array.from({ length: 2 * n + 1 }, (_, i) => i - n)
  const click = (e: MouseEvent) => {
    if (!onPick) return
    const svg = e.currentTarget as SVGSVGElement
    const m = svg.getScreenCTM()
    if (!m) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    const x = Math.round((p.x - SIZE / 2) / S), y = Math.round((SIZE / 2 - p.y) / S)
    onPick(Math.max(-n, Math.min(n, x)), Math.max(-n, Math.min(n, y)))
  }
  const q = (n / 2 + 0.5)
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} class={`coordinates-grid${onPick ? ' pick' : ''}`} onClick={click} onKeyDown={onKey}
      tabIndex={onKey ? 0 : undefined} role={onKey ? 'application' : 'img'} aria-label={label}>
      {ticks.map((i) => <g key={i}>
        <line x1={X(i)} x2={X(i)} y1={Y(n)} y2={Y(-n)} stroke="var(--line)" />
        <line y1={Y(i)} y2={Y(i)} x1={X(-n)} x2={X(n)} stroke="var(--line)" />
      </g>)}
      {[['I', q, q], ['II', -q, q], ['III', -q, -q], ['IV', q, -q]].map(([t, x, y]) => (
        <text key={t as string} x={X(x as number)} y={Y(y as number) + 9} class="coordinates-quad" text-anchor="middle">{t}</text>
      ))}
      <line x1={X(-n) - S * 0.4} x2={X(n) + S * 0.55} y1={Y(0)} y2={Y(0)} stroke="var(--ink-2)" stroke-width="2" />
      <line y1={Y(-n) + S * 0.4} y2={Y(n) - S * 0.55} x1={X(0)} x2={X(0)} stroke="var(--ink-2)" stroke-width="2" />
      <path d={`M${X(n) + S * 0.55},${Y(0)} l-8,-4 v8 Z M${X(0)},${Y(n) - S * 0.55} l-4,8 h8 Z`} fill="var(--ink-2)" />
      <text x={X(n) + S * 0.5} y={Y(0) + 15} class="coordinates-axis" text-anchor="end">x</text>
      <text x={X(0) - 7} y={Y(n) - S * 0.3} class="coordinates-axis" text-anchor="end">y</text>
      {ticks.filter((i) => i !== 0 && i % every === 0).map((i) => <g key={`t${i}`}>
        <text x={X(i)} y={Y(0) + 13} class="coordinates-tick" text-anchor="middle">{fmt(i)}</text>
        <text x={X(0) - 5} y={Y(i) + 4} class="coordinates-tick" text-anchor="end">{fmt(i)}</text>
      </g>)}
      <text x={X(0) - 5} y={Y(0) + 13} class="coordinates-tick" text-anchor="end">0</text>
      {children}
    </svg>
  )
}

function Dot({ p, n, cls, show, onClick }: { p: Pt; n: number; cls: string; show?: boolean; onClick?: () => void }) {
  const { S, X, Y } = geom(n)
  const right = p.x < n - 2
  const up = p.y < n - 1
  const tx = X(p.x) + (right ? 7 : -7), ty = Y(p.y) + (up ? -7 : 16)
  return (
    <g class={`coordinates-dot ${cls}${onClick ? ' tap' : ''}`} onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined}>
      {onClick && <circle cx={X(p.x)} cy={Y(p.y)} r={Math.max(S * 0.6, 12)} class="hit" />}
      <circle cx={X(p.x)} cy={Y(p.y)} r="5.5" class="pt" />
      <text x={tx} y={ty} text-anchor={right ? 'start' : 'end'}>{p.name}{show ? ` ${pair(p.x, p.y)}` : ''}</text>
    </g>
  )
}

const poly = (pts: Pt[], n: number, closed: boolean) => {
  const { X, Y } = geom(n)
  return pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x)},${Y(p.y)}`).join(' ') + (closed && pts.length > 2 ? ' Z' : '')
}

function MirrorAxis({ axis, n }: { axis: 'x' | 'y'; n: number }) {
  const { X, Y } = geom(n)
  return axis === 'x'
    ? <line x1={X(-n)} x2={X(n)} y1={Y(0)} y2={Y(0)} class="coordinates-mirror" />
    : <line y1={Y(-n)} y2={Y(n)} x1={X(0)} x2={X(0)} class="coordinates-mirror" />
}

// ——— Modes ———

function Read({ pts, n, polygon, mirror }: { pts: Pt[]; n: number; polygon: boolean; mirror?: 'x' | 'y' }) {
  const images = mirror ? pts.map((p) => reflect(p, mirror)) : []
  const all = [...pts, ...images]
  const [open, setOpen] = useState<string[]>([])
  const toggle = (name: string) => setOpen(open.includes(name) ? open.filter((x) => x !== name) : [...open, name])
  const last = open[open.length - 1]
  const lp = all.find((p) => p.name === last)
  return (
    <div class="w">
      <Grid n={n} label={`Soustava souřadnic s body ${all.map((p) => p.name).join(', ')}`}>
        {mirror && <MirrorAxis axis={mirror} n={n} />}
        {polygon && <path d={poly(pts, n, true)} class="coordinates-poly" />}
        {polygon && mirror && <path d={poly(images, n, true)} class="coordinates-poly image" />}
        {all.map((p, i) => <Dot key={p.name} p={p} n={n} cls={i >= pts.length ? 'image' : ''} show={open.includes(p.name)} onClick={() => toggle(p.name)} />)}
      </Grid>
      <div class="val" aria-live="polite">{lp ? `${lp.name} ${pair(lp.x, lp.y)}` : 'Klepni na bod'}</div>
      <div class="sub">{lp ? `${lp.x === 0 ? 'x = 0, bod leží na ose y' : `x = ${fmt(lp.x)}: o ${fmt(Math.abs(lp.x))} ${lp.x > 0 ? 'doprava' : 'doleva'}`} · ${lp.y === 0 ? 'y = 0, na ose x' : `y = ${fmt(lp.y)}: o ${fmt(Math.abs(lp.y))} ${lp.y > 0 ? 'nahoru' : 'dolů'}`}` : 'Nejdřív x (doprava/doleva), pak y (nahoru/dolů).'}</div>
      <div class="ctrls coordinates-names">
        {all.map((p) => (
          <button key={p.name} class={`coordinates-name${open.includes(p.name) ? ' on' : ''}`} aria-pressed={open.includes(p.name)} aria-label={`Bod ${p.name}${open.includes(p.name) ? ` ${pair(p.x, p.y)}` : ', ukázat souřadnice'}`} onClick={() => toggle(p.name)}>
            {p.name}{open.includes(p.name) ? ` ${pair(p.x, p.y)}` : ''}
          </button>
        ))}
        {all.length > 1 && <button class="reveal" onClick={() => setOpen(open.length === all.length ? [] : all.map((p) => p.name))}>{open.length === all.length ? 'Skrýt' : 'Ukázat vše'}</button>}
      </div>
    </div>
  )
}

function hint(c: [number, number], t: Pt, orig?: Pt, axis?: 'x' | 'y') {
  const [x, y] = c
  if (orig && x === orig.x && y === orig.y) return `To je původní bod ${orig.name}. Obraz leží na druhé straně osy ${axis}.`
  if (x === t.y && y === t.x) return 'Máš prohozené souřadnice. První číslo je x (doprava/doleva), druhé y (nahoru/dolů).'
  if (x === -t.x && y === t.y) return `y sedí, ale x má špatné znaménko. ${t.x < 0 ? 'Záporné x je vlevo.' : 'Kladné x je vpravo.'}`
  if (x === t.x && y === -t.y) return `x sedí, ale y má špatné znaménko. ${t.y < 0 ? 'Záporné y je dole.' : 'Kladné y je nahoře.'}`
  if (x === t.x) return 'x sedí. Teď posuň bod nahoru nebo dolů (y).'
  if (y === t.y) return 'y sedí. Teď posuň bod doprava nebo doleva (x).'
  return 'Ještě ne. Začni v počátku [0; 0], jdi o x doprava nebo doleva, pak o y nahoru nebo dolů.'
}

function Find({ pts, n, polygon, mirror }: { pts: Pt[]; n: number; polygon: boolean; mirror?: 'x' | 'y' }) {
  const [base, setBase] = useState(pts)
  const targets = mirror ? base.map((p) => reflect(p, mirror)) : base
  const [k, setK] = useState(0) // how many targets are found
  const [cur, setCur] = useState<[number, number]>([0, 0])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const t = targets[k]
  const done = k >= targets.length
  const move = (dx: number, dy: number) => { setCur([Math.max(-n, Math.min(n, cur[0] + dx)), Math.max(-n, Math.min(n, cur[1] + dy))]); setMsg(null) }
  const check = () => {
    if (!t) return
    if (cur[0] === t.x && cur[1] === t.y) {
      const next = targets[k + 1]
      setK(k + 1)
      setMsg({ ok: true, text: `Správně, ${t.name} ${pair(t.x, t.y)}. ${next ? `Teď najdi ${next.name}.` : 'Všechny body jsou na místě.'}` })
    } else setMsg({ ok: false, text: hint(cur, t, mirror ? base[k] : undefined, mirror) })
  }
  const restart = (random: boolean) => {
    if (random) {
      const r = () => Math.floor(Math.random() * (2 * n - 1)) - (n - 1)
      let p: Pt
      do p = { name: 'A', x: r(), y: r() }; while (p.x === 0 && p.y === 0 || (mirror === 'x' && p.y === 0) || (mirror === 'y' && p.x === 0))
      setBase([p])
    } else setBase(pts)
    setK(0); setCur([0, 0]); setMsg(null)
  }
  const key = (e: KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }
    if (d[e.key]) { e.preventDefault(); move(...d[e.key]) } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); check() }
  }
  const found = targets.slice(0, k)
  const { X, Y } = geom(n)
  const task = t && (mirror ? `Najdi obraz bodu ${base[k].name} ${pair(base[k].x, base[k].y)} podle osy ${mirror}` : `Najdi bod ${t.name} ${pair(t.x, t.y)}`)
  return (
    <div class="w">
      <div class="val coordinates-task">{done ? 'Hotovo ✓' : task}</div>
      <Grid n={n} onPick={done ? undefined : (x, y) => { setCur([x, y]); setMsg(null) }} onKey={done ? undefined : key}
        label={done ? 'Soustava souřadnic, všechny body nalezené' : `Soustava souřadnic. Tvůj bod je ${pair(cur[0], cur[1])}. Šipkami ho posuneš, Enter zkontroluje.`}>
        {mirror && <MirrorAxis axis={mirror} n={n} />}
        {mirror && polygon && <path d={poly(base, n, true)} class="coordinates-poly" />}
        {polygon && found.length > 1 && <path d={poly(found, n, done)} class={`coordinates-poly${mirror ? ' image' : ''}`} />}
        {mirror && base.map((p) => <Dot key={p.name} p={p} n={n} cls="" show />)}
        {found.map((p) => <Dot key={`f${p.name}`} p={p} n={n} cls={mirror ? 'image' : 'found'} show />)}
        {!done && <g class="coordinates-cursor" style={{ transform: `translate(${X(cur[0]) - SIZE / 2}px, ${Y(cur[1]) - SIZE / 2}px)` }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r="11" />
          <circle cx={SIZE / 2} cy={SIZE / 2} r="4" class="core" />
        </g>}
      </Grid>
      {!done && <>
        <div class="sub">Tvůj bod: <b class="coordinates-mono">{pair(cur[0], cur[1])}</b> · klepni do mřížky nebo posouvej šipkami</div>
        <div class="coordinates-pad">
          <button aria-label="Posunout doleva" onClick={() => move(-1, 0)}>←</button>
          <button aria-label="Posunout nahoru" onClick={() => move(0, 1)}>↑</button>
          <button aria-label="Posunout dolů" onClick={() => move(0, -1)}>↓</button>
          <button aria-label="Posunout doprava" onClick={() => move(1, 0)}>→</button>
          <button class="reveal" onClick={check}>Tady je!</button>
        </div>
      </>}
      <div class={`coordinates-msg${msg ? (msg.ok ? ' ok' : ' bad') : ''}`} aria-live="polite">{msg?.text ?? ''}</div>
      {done && <div class="ctrls">
        <button class="reveal" onClick={() => restart(false)}>Znovu</button>
        <button class="reveal" onClick={() => restart(true)}>Náhodný bod</button>
      </div>}
    </div>
  )
}

function Coordinates({ mode, points, n = 6, polygon = false, mirror }: P) {
  const pts = named(points)
  return mode === 'find' ? <Find pts={pts} n={n} polygon={polygon} mirror={mirror} /> : <Read pts={pts} n={n} polygon={polygon} mirror={mirror} />
}

/** The task for a quiz question: the points with their letters, no coordinates. */
function CoordinatesQuestion({ points, n = 6, polygon = false, mirror }: P) {
  const pts = named(points)
  return (
    <div class="w">
      <Grid n={n} label={`Soustava souřadnic s body ${pts.map((p) => p.name).join(', ')}`}>
        {mirror && <MirrorAxis axis={mirror} n={n} />}
        {polygon && <path d={poly(pts, n, true)} class="coordinates-poly" />}
        {pts.map((p, i) => <Dot key={p.name} p={p} n={n} cls={i === 0 ? 'target' : ''} />)}
      </Grid>
      <div class="sub">Souřadnice zapiš jako [x; y]{mirror ? `, obraz podle osy ${mirror}` : ''}.</div>
    </div>
  )
}

const target = (p: P) => { const a = named(p.points)[0]; return p.mirror ? reflect(a, p.mirror) : a }

export default defineWidget({
  name: 'coordinates',
  title: 'Souřadnice v rovině',
  summary: 'Mřížka s osami x a y a kvadranty I–IV. Dítě buď hledá bod podle souřadnic (klepnutím nebo šipkami) a dostane zpětnou vazbu, nebo klepe na body a čte jejich souřadnice. Body se dají spojit do mnohoúhelníku a zrcadlit podle osy x nebo y.',
  use: 'Pravoúhlá soustava souřadnic, zápis bodu [x; y], kvadranty, osová souměrnost v soustavě souřadnic, mnohoúhelník zadaný vrcholy.',
  props,
  examples: [
    { title: 'Najdi bod', props: { mode: 'find', points: [{ x: 3, y: -2 }, { x: -4, y: 1 }] } },
    { title: 'Přečti souřadnice', props: { mode: 'read', points: [{ x: 2, y: 4 }, { x: -3, y: 2 }, { x: -1, y: -3 }, { x: 4, y: -1 }], polygon: true } },
    { title: 'Obraz trojúhelníku podle osy y', props: { mode: 'find', n: 8, points: [{ x: 2, y: 1 }, { x: 6, y: 2 }, { x: 3, y: 6 }], polygon: true, mirror: 'y' } },
  ],
  check: (p) => {
    const e: string[] = []
    const n = p.n ?? 6
    const pts = named(p.points)
    pts.forEach((q, i) => { if (Math.abs(q.x) > n || Math.abs(q.y) > n) e.push(`points[${i}] is outside the grid −${n}…${n}`) })
    const names = pts.map((q) => q.name)
    if (new Set(names).size !== names.length) e.push('point names must be unique')
    const at = pts.map((q) => `${q.x};${q.y}`)
    if (new Set(at).size !== at.length) e.push('two points share the same position')
    if (p.polygon && pts.length < 3) e.push('polygon needs at least 3 points')
    return e
  },
  Component: Coordinates,
  Question: CoordinatesQuestion,
  checkQuestion: (p, answers) => {
    const t = target(p)
    const e: string[] = []
    let hit = false
    for (const a of answers) {
      const v = parsePair(a)
      if (!v) e.push(`answer "${a}" is not a point like [3; −2]`)
      else if (v[0] === t.x && v[1] === t.y) hit = true
      else e.push(`answer "${a}" is not ${t.name} ${pair(t.x, t.y)}`)
    }
    if (!hit) e.push(`the answers must contain ${t.name} ${pair(t.x, t.y)}`)
    return e
  },
  html: (p, inline) => {
    const pts = named(p.points)
    const imgs = p.mirror ? pts.map((q) => reflect(q, p.mirror!)) : []
    return `<ul>${[...pts, ...imgs].map((q) => `<li>${inline(`${q.name} ${pair(q.x, q.y)}`)}</li>`).join('')}</ul>`
  },
})
