import { useEffect, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, fmt, Slider } from './kit'

// A cuboid a × b × c built from unit cubes in an isometric view. It fills up layer by layer (CSS transitions),
// below are the volume V = a · b · c and the surface S = 2(ab + bc + ac). "Síť" unfolds it into a net
// whose faces have the same colours as in 3D (a·b blue, a·c orange, b·c green).

const props = s.object({
  a: s.int({ min: 1, max: 10, description: 'Délka a (počet krychliček zleva doprava vpředu).' }),
  b: s.int({ min: 1, max: 10, description: 'Šířka b (počet krychliček dozadu).' }),
  c: s.int({ min: 1, max: 10, description: 'Výška c (počet vrstev).' }),
  cube: s.optional(s.boolean({ description: 'Krychle: jeden posuvník pro hranu a, vzorce V = a³ a S = 6a². Pak musí být a = b = c.' })),
  unit: s.optional(s.enum(['mm', 'cm', 'dm', 'm'], { description: 'Jednotka délky (V vyjde v cm³, S v cm²…). Bez ní se počítají krychličky a čtverečky.' })),
  net: s.optional(s.boolean({ description: 'Začít zobrazením sítě kvádru místo krychliček.' })),
  ask: s.optional(s.enum(['volume', 'surface'], { description: 'Na co se ptá otázka s tímto widgetem: "volume" objem, "surface" povrch. Výchozí "volume".' })),
})
type P = Infer<typeof props>

const C30 = Math.cos(Math.PI / 6)
const W = 320, H = 260
const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)
const cubes = (n: number) => `${fmt(n)} ${plural(n, 'krychlička', 'krychličky', 'krychliček')}`
const volume = (n: number, u?: string) => (u ? `${fmt(n)} ${u}³` : cubes(n))
const area = (n: number, u?: string) => (u ? `${fmt(n)} ${u}²` : `${fmt(n)} ${plural(n, 'čtvereček', 'čtverečky', 'čtverečků')}`)

function iso(a: number, b: number, c: number) {
  const s = Math.min(30, (W - 110) / ((a + b) * C30), (H - 50) / ((a + b) / 2 + c))
  const ox = W / 2 - ((a - b) * C30 * s) / 2 - 24 // room for the „c = …“ label on the right
  const oy = (H - ((a + b) / 2 + c) * s) / 2 + c * s
  const pt = (i: number, j: number, k: number) => [ox + (i - j) * C30 * s, oy + (i + j) * 0.5 * s - k * s] as const
  const pts = (...ps: [number, number, number][]) => ps.map((p) => pt(...p).map((v) => v.toFixed(1)).join(',')).join(' ')
  const ln = (p: [number, number, number], q: [number, number, number]) => `M${pt(...p).map((v) => v.toFixed(1)).join(',')}L${pt(...q).map((v) => v.toFixed(1)).join(',')}`
  return { s, pt, pts, ln }
}

function Solid({ a, b, c, u, animate = true }: { a: number; b: number; c: number; u?: string; animate?: boolean }) {
  const [run, setRun] = useState(0)
  const [filled, setFilled] = useState(!animate)
  useEffect(() => {
    if (!animate) return
    let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => setFilled(true)) })
    return () => cancelAnimationFrame(id)
  }, [run, animate])
  const { pt, pts, ln } = iso(a, b, c)
  const layer = (k: number) => {
    let top = '', front = '', side = ''
    for (let i = 1; i < a; i++) { top += ln([i, 0, k + 1], [i, b, k + 1]); front += ln([i, b, k], [i, b, k + 1]) }
    for (let j = 1; j < b; j++) { top += ln([0, j, k + 1], [a, j, k + 1]); side += ln([a, j, k], [a, j, k + 1]) }
    return (
      <g key={k} class="cuboid-layer" style={{ transitionDelay: filled && animate ? `${(k * 0.12).toFixed(2)}s` : '0s' }}>
        <polygon points={pts([0, 0, k + 1], [a, 0, k + 1], [a, b, k + 1], [0, b, k + 1])} class="cuboid-ab" />
        <polygon points={pts([0, b, k], [a, b, k], [a, b, k + 1], [0, b, k + 1])} class="cuboid-ac" />
        <polygon points={pts([a, 0, k], [a, b, k], [a, b, k + 1], [a, 0, k + 1])} class="cuboid-bc" />
        <path d={top + front + side} class="cuboid-grid" />
      </g>
    )
  }
  const mid = (p: readonly [number, number], q: readonly [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  const [ax, ay] = mid(pt(0, b, 0), pt(a, b, 0)), [bx, by] = mid(pt(a, 0, 0), pt(a, b, 0)), [cx, cy] = mid(pt(a, 0, 0), pt(a, 0, c))
  const lab = (n: string, v: number) => (u ? `${n} = ${fmt(v)} ${u}` : `${n} = ${fmt(v)}`)
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} class={`cuboid-solid${filled ? ' filled' : ''}`} role="img"
        aria-label={`Kvádr z krychliček: ${a} krát ${b} krát ${c}`}>
        <g class="cuboid-ghost">
          <polygon points={pts([0, 0, c], [a, 0, c], [a, b, c], [0, b, c])} />
          <polygon points={pts([0, b, 0], [a, b, 0], [a, b, c], [0, b, c])} />
          <polygon points={pts([a, 0, 0], [a, b, 0], [a, b, c], [a, 0, c])} />
        </g>
        <g key={run}>{Array.from({ length: c }, (_, k) => layer(k))}</g>
        <text x={ax - 8} y={ay + 18} class="cuboid-dim ac" text-anchor="end">{lab('a', a)}</text>
        <text x={bx + 8} y={by + 18} class="cuboid-dim bc" text-anchor="start">{lab('b', b)}</text>
        <text x={cx + 10} y={cy} class="cuboid-dim c" text-anchor="start">{lab('c', c)}</text>
      </svg>
      {animate && <div class="ctrls"><button class="reveal" onClick={() => { setFilled(false); setRun(run + 1) }}>Naplň znovu</button></div>}
    </>
  )
}

function Net({ a, b, c }: { a: number; b: number; c: number }) {
  const NW = 2 * a + 2 * b, NH = 2 * b + c
  const u = Math.min(30, (W - 8) / NW, (H - 8) / NH)
  const ox = (W - NW * u) / 2, oy = (H - NH * u) / 2
  const faces: { x: number; y: number; w: number; h: number; cls: string; name: string }[] = [
    { x: b, y: 0, w: a, h: b, cls: 'ab', name: 'horní' },
    { x: 0, y: b, w: b, h: c, cls: 'bc', name: 'levá' },
    { x: b, y: b, w: a, h: c, cls: 'ac', name: 'přední' },
    { x: a + b, y: b, w: b, h: c, cls: 'bc', name: 'pravá' },
    { x: 2 * b + a, y: b, w: a, h: c, cls: 'ac', name: 'zadní' },
    { x: b, y: b + c, w: a, h: b, cls: 'ab', name: 'dolní' },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} class="cuboid-net" role="img"
      aria-label={`Síť kvádru: dvě stěny ${a} krát ${b}, dvě stěny ${a} krát ${c} a dvě stěny ${b} krát ${c}`}>
      {faces.map((f) => {
        const X = ox + f.x * u, Y = oy + f.y * u
        let d = ''
        for (let i = 1; i < f.w; i++) d += `M${(X + i * u).toFixed(1)},${Y.toFixed(1)}v${(f.h * u).toFixed(1)}`
        for (let j = 1; j < f.h; j++) d += `M${X.toFixed(1)},${(Y + j * u).toFixed(1)}h${(f.w * u).toFixed(1)}`
        const big = Math.min(f.w, f.h) * u >= 22 && f.w * u >= 34
        return (
          <g key={f.name}>
            <rect x={X} y={Y} width={f.w * u} height={f.h * u} class={`cuboid-${f.cls}`} />
            <path d={d} class="cuboid-grid" />
            <rect x={X} y={Y} width={f.w * u} height={f.h * u} class="cuboid-edge" />
            {big && <text x={X + (f.w * u) / 2} y={Y + (f.h * u) / 2 + 5} class="cuboid-area" text-anchor="middle">{f.w * f.h}</text>}
          </g>
        )
      })}
    </svg>
  )
}

function Cuboid({ a: a0, b: b0, c: c0, cube = false, unit, net = false }: P) {
  const [dims, setDims] = useState({ a: a0, b: cube ? a0 : b0, c: cube ? a0 : c0 })
  const [view, setView] = useState<'solid' | 'net'>(net ? 'net' : 'solid')
  const { a, b, c } = dims
  const V = a * b * c, ab = a * b, bc = b * c, ac = a * c, S = 2 * (ab + bc + ac)
  const set = (k: 'a' | 'b' | 'c') => (v: number) => setDims(cube ? { a: v, b: v, c: v } : { ...dims, [k]: v })
  return (
    <div class="w">
      <div class="cuboid-seg" role="group" aria-label="Zobrazení">
        {([['solid', cube ? 'Krychle' : 'Kvádr'], ['net', 'Síť']] as const).map(([v, t]) => (
          <button key={v} class={view === v ? 'on' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{t}</button>
        ))}
      </div>
      {view === 'solid' ? <Solid a={a} b={b} c={c} u={unit} /> : <Net a={a} b={b} c={c} />}
      <div aria-live="polite" class="cuboid-out">
        <div class="val">V = {cube ? <>a³ = {a} · {a} · {a}</> : <>a · b · c = {a} · {b} · {c}</>} = {volume(V, unit)}</div>
        <div class="sub">{view === 'solid'
          ? <>1 vrstva = {a} · {b} = {cubes(ab)}; {c} {plural(c, 'vrstva', 'vrstvy', 'vrstev')} → {cubes(V)}{unit ? <>, každá 1 {unit}³</> : ''}</>
          : <>Stěny jdou do párů: <span class="cuboid-key ab">{a} · {b}</span> <span class="cuboid-key ac">{a} · {c}</span> <span class="cuboid-key bc">{b} · {c}</span></>}</div>
        <div class="cuboid-s">S = {cube
          ? <>6 · a² = 6 · {a}² = 6 · {ab} = <b>{area(S, unit)}</b></>
          : <>2 · (ab + bc + ac) = 2 · (<span class="cuboid-t ab">{ab}</span> + <span class="cuboid-t bc">{bc}</span> + <span class="cuboid-t ac">{ac}</span>) = 2 · {ab + bc + ac} = <b>{area(S, unit)}</b></>}</div>
      </div>
      {cube
        ? <Slider name="a" value={a} set={set('a')} min={1} max={10} />
        : <>
          <Slider name="a" value={a} set={set('a')} min={1} max={10} />
          <Slider name="b" value={b} set={set('b')} min={1} max={10} />
          <Slider name="c" value={c} set={set('c')} min={1} max={10} />
        </>}
    </div>
  )
}

/** The task for a quiz question: the solid with its dimensions, no results. */
function CuboidQuestion({ a, b, c, cube = false, unit }: P) {
  const u = unit ? ` ${unit}` : ''
  return (
    <div class="w">
      <Solid a={a} b={cube ? a : b} c={cube ? a : c} u={unit} animate={false} />
      <div class="sub">{cube ? `Krychle s hranou a = ${a}${u}` : `Kvádr: a = ${a}${u}, b = ${b}${u}, c = ${c}${u}`}</div>
    </div>
  )
}

const results = (p: P) => {
  const b = p.cube ? p.a : p.b, c = p.cube ? p.a : p.c
  return { V: p.a * b * c, S: 2 * (p.a * b + b * c + p.a * c) }
}
const leadNum = (t: string) => { const m = /^\s*([−-]?\d+(?:[.,]\d+)?)/.exec(t.replace(/(\d)\s+(?=\d)/g, '$1')); return m ? Number(m[1].replace(',', '.').replace('−', '-')) : null }

export default defineWidget({
  name: 'cuboid',
  title: 'Kvádr a krychle',
  summary: 'Kvádr z krychliček a × b × c, který se po vrstvách naplní. Posuvníky mění rozměry, pod ním je objem V = a · b · c (počet krychliček) a povrch S = 2(ab + bc + ac). Přepínač „Síť“ kvádr rozloží do sítě s barevnými dvojicemi stěn.',
  use: 'Objem a povrch kvádru a krychle, síť kvádru, jednotky objemu (cm³, m³) a obsahu, krychle jako zvláštní kvádr.',
  props,
  examples: [
    { title: 'Kvádr z krychliček', props: { a: 4, b: 3, c: 2 } },
    { title: 'Krychle a její síť', props: { a: 3, b: 3, c: 3, cube: true, unit: 'cm', net: true } },
    { title: 'Akvárium v dm', props: { a: 8, b: 4, c: 5, unit: 'dm', ask: 'surface' } },
  ],
  check: (p) => (p.cube && (p.a !== p.b || p.a !== p.c) ? ['a cube needs a = b = c'] : []),
  Component: Cuboid,
  Question: CuboidQuestion,
  checkQuestion: (p, answers) => {
    const want = p.ask === 'surface' ? results(p).S : results(p).V
    const what = p.ask === 'surface' ? 'surface' : 'volume'
    const e: string[] = []
    let hit = false
    for (const a of answers) {
      const n = leadNum(a)
      if (n === null) e.push(`answer "${a}" does not start with a number`)
      else if (Math.abs(n - want) < 1e-9) hit = true
      else e.push(`answer "${a}" is not the ${what} ${want}`)
    }
    if (!hit) e.push(`the answers must contain the ${what} ${want}`)
    return e
  },
  html: (p, inline) => {
    const { V, S } = results(p), u = p.unit ? ` ${p.unit}` : ''
    const dims = p.cube ? `Krychle s hranou a = ${p.a}${u}` : `Kvádr a = ${p.a}${u}, b = ${p.b}${u}, c = ${p.c}${u}`
    return `<p>${inline(`${dims}: objem V = ${volume(V, p.unit)}, povrch S = ${area(S, p.unit)}.`)}</p>`
  },
})
