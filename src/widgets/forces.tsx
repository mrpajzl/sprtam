import { useEffect, useRef, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

const force = s.object({
  size: s.number({ min: -10000, max: 10000, description: 'Velikost síly v N (nebo kN, viz unit). Záporná velikost = síla míří opačně, tedy pod úhlem α + 180°. Nejvýš ± max.' }),
  angle: s.number({ min: 0, max: 360, description: 'Úhel ve stupních od kladné osy x proti směru hodinových ručiček (0° doprava, 90° nahoru, 180° doleva, 270° dolů).' }),
}, { description: 'Jedna síla.' })

const props = s.object({
  forces: s.array(force, { min: 2, max: 4, description: 'Síly na začátku (2–4). Dítě může síly přidávat a ubírat (2–4), pokud není fixed.' }),
  max: s.optional(s.number({ min: 1, max: 10000, description: 'Největší velikost síly na posuvníku: rozsah −max až +max. Výchozí 100.' })),
  unit: s.optional(s.enum(['N', 'kN'], { description: 'Jednotka síly: "N" (výchozí) nebo "kN".' })),
  fixed: s.optional(s.boolean({ description: 'Počet sil nejde měnit (velikosti a úhly ano).' })),
  ask: s.optional(s.enum(['size', 'angle'], { description: 'Jen v otázce: na co se ptá – "size" velikost výslednice R (výchozí), "angle" její úhel αR ve stupních (0–360°). Odpovědi se zaokrouhlují na celé číslo nebo jedno desetinné místo.' })),
}, { description: 'Skládání sil v silovém mnohoúhelníku: síly za sebou a výslednice.' })
type P = Infer<typeof props>
type F = { size: number; angle: number }

const COLORS = ['var(--k-blue)', 'var(--k-green)', 'var(--k-purple)', 'var(--k-magenta)']
const SUB = ['₁', '₂', '₃', '₄']
const name = (i: number) => `F${SUB[i]}`
const rad = (deg: number) => (deg * Math.PI) / 180
const norm360 = (a: number) => ((a % 360) + 360) % 360

/** Czech number with at most `d` decimals, real minus, no „−0“. */
const num = (n: number, d = 1) => {
  const r = Math.round(n * 10 ** d) / 10 ** d
  return (Object.is(r, -0) || r === 0 ? '0' : String(r)).replace('.', ',').replace('-', '−')
}

/** „30²“, „(−15,7)²“ – a negative number squared needs brackets. */
const sq = (n: number) => (num(n).startsWith('−') ? `(${num(n)})²` : `${num(n)}²`)

/** Components, sums and the resultant (angle 0–360°, from the +x axis counter-clockwise). */
function solve(fs: F[]) {
  const parts = fs.map((f) => ({ x: f.size * Math.cos(rad(f.angle)), y: f.size * Math.sin(rad(f.angle)) }))
  const x = parts.reduce((a, p) => a + p.x, 0), y = parts.reduce((a, p) => a + p.y, 0)
  const R = Math.hypot(x, y)
  const zero = R < 1e-9 * Math.max(1, ...fs.map((f) => Math.abs(f.size)))
  return { parts, x, y, R: zero ? 0 : R, angle: zero ? 0 : norm360((Math.atan2(y, x) * 180) / Math.PI), zero }
}

/** 1, 2, 5 × 10ⁿ – the smallest grid step at least `min`. */
function nice(min: number) {
  const e = 10 ** Math.floor(Math.log10(min))
  return [1, 2, 5, 10].map((m) => m * e).find((v) => v >= min) ?? 10 * e
}

// ——— Drawing ———

const W = 340, H = 290, PAD = 26

/** Fits the origin, every force drawn from the origin and the whole polygon, so nothing jumps between steps. */
function frame(fs: F[], max: number) {
  const { parts } = solve(fs)
  const pts = [{ x: 0, y: 0 }]
  let cx = 0, cy = 0
  for (const p of parts) { pts.push(p); cx += p.x; cy += p.y; pts.push({ x: cx, y: cy }) }
  let x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x))
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y))
  const minSpan = max * 0.6
  if (x1 - x0 < minSpan) { const m = (x0 + x1) / 2; x0 = m - minSpan / 2; x1 = m + minSpan / 2 }
  if (y1 - y0 < minSpan) { const m = (y0 + y1) / 2; y0 = m - minSpan / 2; y1 = m + minSpan / 2 }
  const k = Math.min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0))
  const ox = W / 2 - ((x0 + x1) / 2) * k, oy = H / 2 + ((y0 + y1) / 2) * k
  return { k, ox, oy, grid: nice(30 / k) }
}

function Arrow({ dx, dy, color, width = 3.5, dashed = false }: { dx: number; dy: number; color: string; width?: number; dashed?: boolean }) {
  const len = Math.hypot(dx, dy)
  if (len < 1) return null
  const ux = dx / len, uy = dy / len
  const head = Math.min(13, len * 0.6), half = head * 0.45
  const bx = dx - ux * head, by = dy - uy * head
  return (
    <g>
      <line x1="0" y1="0" x2={bx.toFixed(1)} y2={by.toFixed(1)} stroke={color} stroke-width={width} stroke-linecap="round" stroke-dasharray={dashed ? '5 5' : undefined} />
      <path d={`M${dx.toFixed(1)} ${dy.toFixed(1)} L${(bx - uy * half).toFixed(1)} ${(by + ux * half).toFixed(1)} L${(bx + uy * half).toFixed(1)} ${(by - ux * half).toFixed(1)} Z`} fill={color} />
    </g>
  )
}

/** Label beside the middle of an arrow, on its left-hand side. */
function Label({ dx, dy, text, color }: { dx: number; dy: number; text: string; color: string }) {
  const len = Math.hypot(dx, dy)
  if (len < 1) return null
  const off = 12
  const x = dx / 2 + (dy / len) * off, y = dy / 2 - (dx / len) * off
  return <text class="forces-label" x={x.toFixed(1)} y={(y + 5).toFixed(1)} text-anchor="middle" style={{ fill: color }}>{text}</text>
}

function Grid({ k, ox, oy, grid, unit }: { k: number; ox: number; oy: number; grid: number; unit: string }) {
  const g = grid * k, lines = []
  for (let x = ox % g; x <= W; x += g) lines.push(<line key={`x${x}`} x1={x.toFixed(1)} x2={x.toFixed(1)} y1="0" y2={H} />)
  for (let y = oy % g; y <= H; y += g) lines.push(<line key={`y${y}`} y1={y.toFixed(1)} y2={y.toFixed(1)} x1="0" x2={W} />)
  return (
    <g>
      <g stroke="var(--line)" stroke-width="1">{lines}</g>
      <line x1="0" x2={W} y1={oy} y2={oy} stroke="var(--ink-3)" stroke-width="1.5" />
      <line y1="0" y2={H} x1={ox} x2={ox} stroke="var(--ink-3)" stroke-width="1.5" />
      {oy > 4 && oy < H - 4 && <text x={W - 6} y={oy - 6} text-anchor="end" class="forces-axis">x</text>}
      {ox > 4 && ox < W - 4 && <text x={ox + 6} y="14" class="forces-axis">y</text>}
      <text x="6" y={H - 6} class="forces-scale">mřížka po {num(grid, 3)} {unit}</text>
    </g>
  )
}

/** Small arc from the +x axis to the resultant, with its angle. */
function AngleArc({ ox, oy, angle }: { ox: number; oy: number; angle: number }) {
  if (angle < 1 || angle > 359) return null
  const r = 22, a = rad(angle)
  const ex = ox + r * Math.cos(a), ey = oy - r * Math.sin(a)
  const mid = rad(angle / 2), lx = ox + (r + 15) * Math.cos(mid), ly = oy - (r + 15) * Math.sin(mid)
  return (
    <g class="forces-fade">
      <path d={`M${ox + r} ${oy} A${r} ${r} 0 ${angle > 180 ? 1 : 0} 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`} fill="none" stroke="var(--accent)" stroke-width="1.5" />
      <text x={lx.toFixed(1)} y={(ly + 4).toFixed(1)} text-anchor="middle" class="forces-arc">αR</text>
    </g>
  )
}

// ——— Controls ———

/** A number box that lets the pupil type freely and only reports valid numbers in range. */
function NumField({ value, set, min, max, label, suffix }: { value: number; set: (n: number) => void; min: number; max: number; label: string; suffix: string }) {
  const [text, setText] = useState(num(value, 2).replace('−', '-'))
  const focused = useRef(false)
  useEffect(() => { if (!focused.current) setText(num(value, 2).replace('−', '-')) }, [value])
  return (
    <label class="forces-num">
      <input type="text" inputMode="decimal" value={text} aria-label={label}
        onFocus={() => { focused.current = true }}
        onBlur={() => { focused.current = false; setText(num(value, 2).replace('−', '-')) }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
        onInput={(e) => {
          const t = e.currentTarget.value
          setText(t)
          const n = Number(t.replace(/\s/g, '').replace(',', '.').replace('−', '-'))
          if (t.trim() !== '' && Number.isFinite(n)) set(Math.min(max, Math.max(min, n)))
        }}
      />
      <span>{suffix}</span>
    </label>
  )
}

/** Rotary knob for an angle: drag around it, or use the arrow keys (±1°, Page Up/Down ±15°). */
function Knob({ angle, set, color, label }: { angle: number; set: (a: number) => void; color: string; label: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const from = (e: PointerEvent) => {
    const b = ref.current!.getBoundingClientRect()
    let a = norm360((Math.atan2(-(e.clientY - (b.top + b.height / 2)), e.clientX - (b.left + b.width / 2)) * 180) / Math.PI)
    a = Math.round(a)
    const snap = Math.round(a / 15) * 15
    if (Math.abs(a - snap) <= 2) a = snap
    set(norm360(a))
  }
  const key = (e: KeyboardEvent) => {
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 15, PageDown: -15 }[e.key]
    if (d !== undefined) { e.preventDefault(); set(norm360(Math.round(angle) + d)) }
    else if (e.key === 'Home') { e.preventDefault(); set(0) }
  }
  const a = rad(angle), r = 20
  return (
    <svg ref={ref} class="forces-knob" viewBox="-28 -28 56 56" width="56" height="56" role="slider" tabIndex={0}
      aria-label={label} aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(angle)} aria-valuetext={`${num(angle)}°`}
      onPointerDown={(e) => { e.preventDefault(); ref.current!.setPointerCapture(e.pointerId); ref.current!.focus(); from(e) }}
      onPointerMove={(e) => { if (ref.current!.hasPointerCapture(e.pointerId)) from(e) }}
      onKeyDown={key}>
      <circle r="25" fill="var(--bg)" stroke="var(--line)" stroke-width="1.5" />
      {Array.from({ length: 8 }, (_, i) => {
        const t = rad(i * 45), big = i % 2 === 0
        return <line key={i} x1={(Math.cos(t) * (big ? 17 : 20)).toFixed(1)} y1={(-Math.sin(t) * (big ? 17 : 20)).toFixed(1)} x2={(Math.cos(t) * 23).toFixed(1)} y2={(-Math.sin(t) * 23).toFixed(1)} stroke="var(--ink-3)" stroke-width={big ? 1.5 : 1} />
      })}
      <line x1="0" y1="0" x2={(Math.cos(a) * r).toFixed(1)} y2={(-Math.sin(a) * r).toFixed(1)} stroke={color} stroke-width="4" stroke-linecap="round" />
      <circle r="4" fill={color} />
    </svg>
  )
}

// ——— The widget ———

function Forces(p: P) {
  const max = p.max ?? 100, unit = p.unit ?? 'N'
  const [fs, setFs] = useState<F[]>(() => p.forces.map((f) => ({ size: f.size, angle: norm360(f.angle) })))
  const n = fs.length
  const [stage, setStage] = useState(n) // 0 = all from one point, k = the first k+1 forces chained, n = with the resultant
  const st = Math.min(stage, n)
  const res = solve(fs)
  const { k, ox, oy, grid } = frame(fs, max)
  const sliderStep = nice(max / 200)

  const update = (i: number, f: Partial<F>) => setFs(fs.map((x, j) => (j === i ? { ...x, ...f } : x)))
  const add = () => { setFs([...fs, { size: Math.round(max / 2), angle: norm360((fs[n - 1]?.angle ?? 0) + 120) }]); setStage(n + 1) }
  const remove = (i: number) => { setFs(fs.filter((_, j) => j !== i)); setStage(n - 1) }

  // Where each force starts: the end of the previous one once it has been moved into the chain.
  const starts: { x: number; y: number }[] = []
  let cx = 0, cy = 0
  res.parts.forEach((q, i) => { starts.push(i <= st && i > 0 ? { x: cx, y: cy } : { x: 0, y: 0 }); cx += q.x; cy += q.y })
  const done = st >= n
  const sum = res.parts.slice(0, st + 1).reduce((a, q) => ({ x: a.x + q.x, y: a.y + q.y }), { x: 0, y: 0 })

  const stepText = st === 0
    ? `Všechny síly působí v jednom bodě. Teď je poskládáme za sebe.`
    : st < n
      ? `${name(st)} posuneme rovnoběžně tak, aby začínala na konci ${name(st - 1)}.`
      : res.zero
        ? 'Konec poslední síly je zpátky v počátku: mnohoúhelník je uzavřený, výslednice je nulová – síly jsou v rovnováze.'
        : `Výslednice R vede od začátku ${name(0)} ke konci ${name(n - 1)}.`

  return (
    <div class="w forces">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img"
        aria-label={`Silový mnohoúhelník: ${fs.map((f, i) => `${name(i)} = ${num(f.size)} ${unit} pod úhlem ${num(f.angle)}°`).join(', ')}. ${res.zero ? 'Výslednice je nulová.' : `Výslednice R = ${num(res.R)} ${unit} pod úhlem ${num(res.angle)}°.`}`}>
        <Grid k={k} ox={ox} oy={oy} grid={grid} unit={unit} />
        {/* where the moved forces were: dashed copies at the common point */}
        {res.parts.map((q, i) => i > 0 && i <= st && (
          <g key={`g${i}`} transform={`translate(${ox} ${oy})`} opacity="0.35"><Arrow dx={q.x * k} dy={-q.y * k} color={COLORS[i]} width={2} dashed /></g>
        ))}
        {/* the polygon: each force moves (animated) to the end of the previous one */}
        {res.parts.map((q, i) => (
          <g key={i} class="forces-move" style={{ transform: `translate(${(ox + starts[i].x * k).toFixed(1)}px, ${(oy - starts[i].y * k).toFixed(1)}px)` }}>
            <Arrow dx={q.x * k} dy={-q.y * k} color={COLORS[i]} />
            <Label dx={q.x * k} dy={-q.y * k} text={name(i)} color={COLORS[i]} />
          </g>
        ))}
        {done && !res.zero && (
          <g class="forces-fade" transform={`translate(${ox} ${oy})`}>
            <Arrow dx={res.x * k} dy={-res.y * k} color="var(--accent)" width={4.5} />
            <Label dx={res.x * k} dy={-res.y * k} text="R" color="var(--accent-ink)" />
          </g>
        )}
        {done && !res.zero && <AngleArc ox={ox} oy={oy} angle={res.angle} />}
        {!done && st > 0 && <circle cx={(ox + sum.x * k).toFixed(1)} cy={(oy - sum.y * k).toFixed(1)} r="4" fill="var(--ink)" class="forces-move" />}
        <circle cx={ox} cy={oy} r="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2" />
      </svg>

      <div class="val" aria-live="polite">{res.zero ? 'R = 0 · rovnováha' : `R = ${num(res.R)} ${unit} · αR = ${num(res.angle)}°`}</div>

      <div class="forces-steps">
        <button class="forces-btn" onClick={() => setStage(0)} disabled={st === 0} aria-label="Od začátku">⏮</button>
        <button class="forces-btn" onClick={() => setStage(st - 1)} disabled={st === 0} aria-label="O krok zpět">◀</button>
        <div class="forces-step-text"><b>Krok {st + 1}/{n + 1}</b> {stepText}</div>
        <button class="forces-btn" onClick={() => setStage(st + 1)} disabled={done} aria-label="Další krok">▶</button>
      </div>

      <div class="forces-list">
        {fs.map((f, i) => (
          <div class="forces-card" key={i} style={{ '--fc': COLORS[i] } as Record<string, string>}>
            <div class="forces-head">
              <span class="forces-chip">{name(i)}</span>
              {!p.fixed && n > 2 && <button class="forces-x" onClick={() => remove(i)} aria-label={`Odebrat sílu ${name(i)}`}>×</button>}
            </div>
            <div class="forces-row">
              <Knob angle={f.angle} set={(a) => update(i, { angle: a })} color={COLORS[i]} label={`Úhel síly ${name(i)}`} />
              <div class="forces-fields">
                <NumField value={f.angle} set={(a) => update(i, { angle: norm360(a) })} min={-360} max={360} label={`Úhel síly ${name(i)} ve stupních`} suffix="°" />
                <NumField value={f.size} set={(v) => update(i, { size: v })} min={-max} max={max} label={`Velikost síly ${name(i)} v ${unit}`} suffix={unit} />
              </div>
            </div>
            <input class="forces-range" type="range" min={-max} max={max} step={sliderStep} value={f.size} aria-label={`Velikost síly ${name(i)}`}
              onInput={(e) => update(i, { size: Number(e.currentTarget.value) })} />
          </div>
        ))}
        {!p.fixed && n < 4 && <button class="forces-add" onClick={add}>+ Přidat sílu</button>}
      </div>

      <table class="forces-table">
        <thead><tr><th></th><th>F</th><th>α</th><th>Fx = F·cos α</th><th>Fy = F·sin α</th></tr></thead>
        <tbody>
          {fs.map((f, i) => (
            <tr key={i}><th style={{ color: `color-mix(in oklab, ${COLORS[i]} 75%, var(--ink))` }}>{name(i)}</th><td>{num(f.size)}</td><td>{num(f.angle)}°</td><td>{num(res.parts[i].x)}</td><td>{num(res.parts[i].y)}</td></tr>
          ))}
          <tr class="forces-total"><th>Σ</th><td></td><td></td><td>{num(res.x)}</td><td>{num(res.y)}</td></tr>
        </tbody>
      </table>
      <div class="sub forces-calc">
        <div>R = √(ΣFx² + ΣFy²) = √({sq(res.x)} + {sq(res.y)}) = <b>{num(res.R)} {unit}</b></div>
        {!res.zero && <div>αR = {num(res.angle)}° (od kladné osy x proti směru hodinových ručiček)</div>}
      </div>
      <div class="sub forces-note">Úhel se měří od osy x proti směru hodinových ručiček. Záporná velikost otočí sílu o 180°. Kolečko otáčej tahem nebo šipkami.</div>
    </div>
  )
}

/** The task only: the forces from one point, no resultant. */
function ForcesQuestion(p: P) {
  const fs = p.forces.map((f) => ({ size: f.size, angle: norm360(f.angle) }))
  const unit = p.unit ?? 'N'
  const { parts } = solve(fs)
  const { k, ox, oy, grid } = frame(fs, p.max ?? 100)
  return (
    <div class="w forces">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Síly z jednoho bodu: ${fs.map((f, i) => `${name(i)} = ${num(f.size)} ${unit} pod úhlem ${num(f.angle)}°`).join(', ')}.`}>
        <Grid k={k} ox={ox} oy={oy} grid={grid} unit={unit} />
        {parts.map((q, i) => (
          <g key={i} transform={`translate(${ox} ${oy})`}>
            <Arrow dx={q.x * k} dy={-q.y * k} color={COLORS[i]} />
            <Label dx={q.x * k} dy={-q.y * k} text={name(i)} color={COLORS[i]} />
          </g>
        ))}
        <circle cx={ox} cy={oy} r="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2" />
      </svg>
      <div class="sub forces-given">
        {fs.map((f, i) => <div key={i}><b style={{ color: `color-mix(in oklab, ${COLORS[i]} 75%, var(--ink))` }}>{name(i)}</b> = {num(f.size)} {unit}, α = {num(f.angle)}°</div>)}
      </div>
    </div>
  )
}

const leadNum = (t: string) => { const m = /^\s*([−-]?\d+(?:[.,]\d+)?)/.exec(t.replace(/(\d)\s+(?=\d)/g, '$1')); return m ? Number(m[1].replace(',', '.').replace('−', '-')) : null }

export default defineWidget({
  name: 'forces',
  title: 'Skládání sil',
  summary: 'Silový mnohoúhelník se 2–4 silami. U každé síly dítě nastaví velikost (posuvníkem nebo číslem, i zápornou) a úhel (otočným kolečkem nebo číslem); síly lze přidávat a ubírat. Tlačítky krok za krokem se síly posunou za sebe a vykreslí se výslednice R s úhlem αR. Pod obrázkem je tabulka složek Fx, Fy, jejich součty a výpočet R = √(ΣFx² + ΣFy²); uzavřený mnohoúhelník ukáže rovnováhu.',
  use: 'Technická mechanika a fyzika SŠ: skládání sil, silový trojúhelník a mnohoúhelník, výslednice, rozklad síly do složek Fx a Fy, rovnováha sil (uzavřený mnohoúhelník); fyzika 7. třída: skládání sil na jedné přímce i pod úhlem.',
  props,
  examples: [
    { title: 'Silový trojúhelník: dvě kolmé síly', props: { forces: [{ size: 30, angle: 0 }, { size: 40, angle: 90 }] } },
    { title: 'Silový mnohoúhelník ze čtyř sil', props: { forces: [{ size: 60, angle: 20 }, { size: 45, angle: 100 }, { size: 50, angle: 170 }, { size: -30, angle: 60 }] } },
    { title: 'Rovnováha tří sil (lano a jeřáb, kN)', props: { forces: [{ size: 4, angle: 30 }, { size: 4, angle: 150 }, { size: 4, angle: 270 }], max: 10, unit: 'kN', fixed: true } },
  ],
  check: (p) => {
    const max = p.max ?? 100, e: string[] = []
    p.forces.forEach((f, i) => { if (Math.abs(f.size) > max) e.push(`forces[${i}].size is beyond ±max (${max})`) })
    return e
  },
  Component: Forces,
  Question: ForcesQuestion,
  checkQuestion: (p, answers) => {
    const r = solve(p.forces)
    const angle = p.ask === 'angle'
    const want = angle ? r.angle : r.R
    const what = angle ? 'resultant angle' : 'resultant size'
    if (angle && r.zero) return ['the resultant is zero, so it has no angle; ask for its size instead']
    const ok = [Math.round(want), Math.round(want * 10) / 10]
    const e: string[] = []
    let hit = false
    for (const a of answers) {
      const n = leadNum(a)
      if (n === null) e.push(`answer "${a}" does not start with a number`)
      else if (ok.some((v) => Math.abs(n - v) < 1e-9) || Math.abs(n - want) < 1e-9) hit = true
      else e.push(`answer "${a}" is not the ${what} ${num(want, 2)} rounded to 0 or 1 decimal`)
    }
    if (!hit) e.push(`the answers must contain the ${what} ${num(want, 2)} (rounded to 0 or 1 decimal)`)
    return e
  },
  html: (p, inline) => {
    const unit = inline(p.unit ?? 'N'), r = solve(p.forces)
    const items = p.forces.map((f, i) => `<li>${name(i)} = ${num(f.size)} ${unit}, α = ${num(norm360(f.angle))}°</li>`).join('')
    const result = r.zero ? 'Výslednice je nulová – síly jsou v rovnováze.' : `Výslednice R = ${num(r.R)} ${unit}, αR = ${num(r.angle)}° (ΣFx = ${num(r.x)} ${unit}, ΣFy = ${num(r.y)} ${unit}).`
    return `<p>Skládání sil:</p><ul>${items}</ul><p>${result}</p>`
  },
})
