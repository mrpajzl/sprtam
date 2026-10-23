import { useRef, useState } from 'preact/hooks'

export function Step({ label, value, set, min, max }: { label?: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div class="step">
      <button onClick={() => set(Math.max(min, value - 1))} aria-label="Méně">−</button>
      <span>{label ?? value}</span>
      <button onClick={() => set(Math.min(max, value + 1))} aria-label="Více">+</button>
    </div>
  )
}

export function Slider({ name, value, set, min, max, step = 1 }: { name: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label class="slider">
      <span>{name}</span>
      <input type="range" min={min} max={max} step={step} value={value} onInput={(e) => set(Number(e.currentTarget.value))} />
      <output>{fmt(value)}</output>
    </label>
  )
}

export const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',').replace('-', '−')
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

export function Counter({ emoji, start = 3, max = 20 }: { emoji: string; start?: number; max?: number }) {
  const [n, set] = useState(start)
  return (
    <div class="w">
      <div class="counter-items">{Array.from({ length: n }, (_, i) => <span key={i}>{emoji}</span>)}</div>
      <div class="val">{n}</div>
      <div class="ctrls"><Step value={n} set={set} min={0} max={max} label={`${n}`} /></div>
    </div>
  )
}

export function NumberLine({ min, max, step = 1, start, hop }: { min: number; max: number; step?: number; start?: number; hop?: number }) {
  const [v, setV] = useState(start ?? min)
  const [hops, setHops] = useState(0)
  const W = 320, pad = 16, n = Math.round((max - min) / step)
  const x = (val: number) => pad + ((val - min) / (max - min)) * (W - 2 * pad)
  const svg = useRef<SVGSVGElement>(null)
  const pos = start !== undefined && hop ? start + hop * hops : v
  const drag = (e: PointerEvent) => {
    if (hop) return
    const r = svg.current!.getBoundingClientRect()
    const rel = ((e.clientX - r.left) / r.width) * W
    const val = min + Math.round(((rel - pad) / (W - 2 * pad)) * n) * step
    setV(Math.max(min, Math.min(max, Math.round(val * 1000) / 1000)))
  }
  const label = (i: number) => fmt(min + i * step)
  const every = n > 10 ? Math.ceil(n / 10) : 1
  return (
    <div class="w">
      <svg ref={svg} viewBox={`0 0 ${W} 86`} onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); drag(e) }} onPointerMove={(e) => e.buttons && drag(e)} style={{ touchAction: 'none' }}>
        <line x1={pad} x2={W - pad} y1={50} y2={50} stroke="var(--ink-3)" stroke-width="3" stroke-linecap="round" />
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={i}>
            <line x1={x(min + i * step)} x2={x(min + i * step)} y1={43} y2={57} stroke="var(--ink-3)" stroke-width={i % every ? 1.5 : 2.5} />
            {i % every === 0 && <text x={x(min + i * step)} y={76} text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">{label(i)}</text>}
          </g>
        ))}
        {hop && start !== undefined && Array.from({ length: hops }, (_, i) => {
          const a = x(start + hop * i), b = x(start + hop * (i + 1))
          return <path key={i} d={`M${a},44 Q${(a + b) / 2},${10} ${b},44`} fill="none" stroke="var(--accent)" stroke-width="2.5" />
        })}
        <circle cx={x(pos)} cy={50} r={10} fill="var(--accent)" stroke="var(--card)" stroke-width="3" style={{ transition: 'cx 0.3s' }} />
      </svg>
      <div class="val">{hop && start !== undefined ? `${fmt(start)} ${hop < 0 ? '−' : '+'} ${fmt(Math.abs(hop * hops))} = ${fmt(pos)}` : fmt(pos)}</div>
      {hop && start !== undefined ? (
        <div class="ctrls">
          <button class="reveal" onClick={() => setHops(0)}>Znovu</button>
          <button class="reveal" onClick={() => { const nx = start + hop * (hops + 1); if (nx >= min && nx <= max) setHops(hops + 1) }}>{hop > 0 ? `+${fmt(hop)}` : `−${fmt(-hop)}`}</button>
        </div>
      ) : <div class="sub">Posuň tečku</div>}
    </div>
  )
}

export function Fraction({ n: n0, d: d0 }: { n: number; d: number }) {
  const [d, setD] = useState(Math.max(1, d0))
  const [n, setN] = useState(Math.min(n0, Math.max(1, d0) * 2))
  const R = 70, cx = 80, cy = 80
  const whole = Math.max(1, Math.ceil(n / d))
  const pies = Array.from({ length: whole }, (_, p) => {
    const filled = Math.max(0, Math.min(d, n - p * d))
    return (
      <svg key={p} viewBox="0 0 160 160" width={whole > 1 ? 120 : 160}>
        {Array.from({ length: d }, (_, i) => {
          if (d === 1) return <circle key={i} cx={cx} cy={cy} r={R} fill={i < filled ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--card)" stroke-width="3" />
          const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2
          const large = a1 - a0 > Math.PI ? 1 : 0
          return <path key={i} d={`M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`} fill={i < filled ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--card)" stroke-width="3" style={{ transition: 'fill 0.25s' }} />
        })}
      </svg>
    )
  })
  const g = gcd(n, d)
  return (
    <div class="w">
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>{pies}</div>
      <div class="val" style={{ fontSize: '2rem', lineHeight: 1.1 }}>
        <span style={{ display: 'inline-grid', justifyItems: 'center' }}><span>{n}</span><span style={{ borderTop: '3px solid currentColor', padding: '0 6px' }}>{d}</span></span>
      </div>
      <div class="sub">{g > 1 && n > 0 ? `= ${n / g}/${d / g}` : ' '}{n / d ? ` · ${fmt(n / d)}` : ''}</div>
      <div class="ctrls">
        <Step value={n} set={setN} min={0} max={d * 3} label={`nahoře ${n}`} />
        <Step value={d} set={(v) => { setD(v); setN(Math.min(n, v * 3)) }} min={1} max={12} label={`dole ${d}`} />
      </div>
    </div>
  )
}

export function PlaceValue({ value }: { value: number }) {
  const [v, setV] = useState(Math.max(0, Math.min(999, value)))
  const h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), u = v % 10
  const col = (count: number, kind: 'h' | 't' | 'u', name: string, mul: number) => (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6, flex: 1 }}>
      <svg viewBox="0 0 90 120" width="90">
        {kind === 'h' && Array.from({ length: count }, (_, i) => <rect key={i} x={6 + (i % 3) * 4} y={6 + i * 10} width={60} height={60} rx="4" fill="var(--accent)" opacity={0.25 + 0.75 / (i + 1)} stroke="var(--card)" stroke-width="2" />)}
        {kind === 't' && Array.from({ length: count }, (_, i) => <rect key={i} x={4 + i * 9} y={4} width={7} height={100} rx="3" fill="var(--accent)" />)}
        {kind === 'u' && Array.from({ length: count }, (_, i) => <rect key={i} x={10 + (i % 3) * 25} y={8 + Math.floor(i / 3) * 25} width={20} height={20} rx="4" fill="var(--accent)" />)}
      </svg>
      <b style={{ fontSize: '1.6rem' }}>{count}</b>
      <span class="sub">{name}</span>
      <div class="step"><button onClick={() => setV(Math.max(0, v - mul))}>−</button><button onClick={() => setV(Math.min(999, v + mul))}>+</button></div>
    </div>
  )
  return (
    <div class="w">
      <div style={{ display: 'flex', gap: 6 }}>{col(h, 'h', 'stovky', 100)}{col(t, 't', 'desítky', 10)}{col(u, 'u', 'jednotky', 1)}</div>
      <div class="val">{v}</div>
    </div>
  )
}

export function Clock({ h: h0, m: m0 }: { h: number; m: number }) {
  const [mins, setMins] = useState((h0 % 12) * 60 + m0)
  const svg = useRef<SVGSVGElement>(null)
  const h = Math.floor(mins / 60) % 12, m = mins % 60
  const drag = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const ang = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)))
    const mm = Math.round((((ang / (2 * Math.PI)) * 60 + 60) % 60) / 5) * 5 % 60
    let hh = h
    if (m >= 45 && mm <= 15) hh = (h + 1) % 12
    if (m <= 15 && mm >= 45) hh = (h + 11) % 12
    setMins(hh * 60 + mm)
  }
  const hand = (deg: number, len: number, w: number, c: string) => <line x1="100" y1="100" x2={100 + len * Math.sin((deg * Math.PI) / 180)} y2={100 - len * Math.cos((deg * Math.PI) / 180)} stroke={c} stroke-width={w} stroke-linecap="round" />
  const words = m === 0 ? `${h || 12} hodin` : m === 15 ? `čtvrt na ${(h % 12) + 1}` : m === 30 ? `půl ${(h % 12) + 1}` : m === 45 ? `tři čtvrtě na ${(h % 12) + 1}` : ''
  return (
    <div class="w">
      <svg ref={svg} viewBox="0 0 200 200" width="220" style={{ touchAction: 'none' }} onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); drag(e) }} onPointerMove={(e) => e.buttons && drag(e)}>
        <circle cx="100" cy="100" r="94" fill="var(--bg)" stroke="var(--accent)" stroke-width="5" />
        {Array.from({ length: 60 }, (_, i) => <line key={i} x1="100" y1={i % 5 ? 12 : 10} x2="100" y2={i % 5 ? 16 : 22} stroke="var(--ink-3)" stroke-width={i % 5 ? 1 : 3} transform={`rotate(${i * 6} 100 100)`} />)}
        {Array.from({ length: 12 }, (_, i) => <text key={i} x={100 + 68 * Math.sin(((i + 1) * Math.PI) / 6)} y={100 - 68 * Math.cos(((i + 1) * Math.PI) / 6) + 7} text-anchor="middle" font-size="19" font-weight="800" fill="var(--ink)">{i + 1}</text>)}
        {hand((h + m / 60) * 30, 46, 7, 'var(--ink)')}
        {hand(m * 6, 58, 4, 'var(--accent)')}
        <circle cx="100" cy="100" r="6" fill="var(--ink)" />
      </svg>
      <div class="val">{h || 12}:{String(m).padStart(2, '0')}</div>
      <div class="sub">{words || 'Táhni velkou ručičku'}</div>
    </div>
  )
}

export function Multiply({ a: a0, b: b0, max = 10 }: { a: number; b: number; max?: number }) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0)
  const s = 22
  return (
    <div class="w">
      <svg viewBox={`0 0 ${max * s + 4} ${max * s + 4}`} width="240">
        {Array.from({ length: max * max }, (_, i) => {
          const r = Math.floor(i / max), c = i % max, on = r < a && c < b
          return <circle key={i} cx={c * s + s / 2 + 2} cy={r * s + s / 2 + 2} r={on ? 8 : 3} fill={on ? 'var(--accent)' : 'var(--line)'} style={{ transition: 'r 0.2s, fill 0.2s' }} />
        })}
      </svg>
      <div class="val">{a} · {b} = {a * b}</div>
      <Slider name="řádky" value={a} set={setA} min={1} max={max} />
      <Slider name="sloupce" value={b} set={setB} min={1} max={max} />
    </div>
  )
}

export function Balance({ a, b, c }: { a: number; b: number; c: number }) {
  // State: left = A·x + B, right = C. Each tap applies the same step to both sides.
  const [s, setS] = useState({ A: a, B: b, C: c })
  const done = s.A === 1 && s.B === 0
  const tilt = 0
  const side = (x: number, k: number) => `${x !== 0 ? (x === 1 ? 'x' : `${fmt(x)}x`) : ''}${k !== 0 ? `${x !== 0 ? (k > 0 ? ' + ' : ' − ') : k < 0 ? '−' : ''}${fmt(Math.abs(k))}` : x === 0 ? '0' : ''}`
  return (
    <div class="w">
      <svg viewBox="0 0 300 130" width="300">
        <g transform={`rotate(${tilt} 150 60)`}>
          <line x1="30" y1="60" x2="270" y2="60" stroke="var(--ink-2)" stroke-width="5" stroke-linecap="round" />
          <rect x="10" y="20" width="110" height="40" rx="10" fill="var(--accent-soft)" />
          <rect x="180" y="20" width="110" height="40" rx="10" fill="var(--accent-soft)" />
          <text x="65" y="47" text-anchor="middle" font-size="20" font-weight="900" fill="var(--accent-ink)">{side(s.A, s.B)}</text>
          <text x="235" y="47" text-anchor="middle" font-size="20" font-weight="900" fill="var(--accent-ink)">{fmt(s.C)}</text>
        </g>
        <path d="M150 62 L130 120 L170 120 Z" fill="var(--ink-3)" />
      </svg>
      <div class="val">{done ? `x = ${fmt(s.C)} ✓` : `${side(s.A, s.B)} = ${fmt(s.C)}`}</div>
      <div class="ctrls">
        {s.B !== 0 && <button class="reveal" onClick={() => setS({ ...s, B: 0, C: s.C - s.B })}>{s.B > 0 ? `− ${fmt(s.B)}` : `+ ${fmt(-s.B)}`} na obou stranách</button>}
        {s.B === 0 && s.A !== 1 && <button class="reveal" onClick={() => setS({ A: 1, B: 0, C: s.C / s.A })}>: {fmt(s.A)} na obou stranách</button>}
        {done && <button class="reveal" onClick={() => setS({ A: a, B: b, C: c })}>Znovu</button>}
      </div>
    </div>
  )
}

export function Angle({ deg }: { deg: number }) {
  const [d, setD] = useState(deg)
  const r = Math.PI / 180
  const kind = d === 0 ? 'nulový' : d < 90 ? 'ostrý' : d === 90 ? 'pravý' : d < 180 ? 'tupý' : d === 180 ? 'přímý' : 'nekonvexní'
  const x = 150 + 110 * Math.cos(-d * r), y = 130 + 110 * Math.sin(-d * r)
  const ax = 150 + 36 * Math.cos(-d * r), ay = 130 + 36 * Math.sin(-d * r)
  return (
    <div class="w">
      <svg viewBox={d > 180 ? "0 10 300 240" : "0 10 300 135"} width="280">
        <line x1="150" y1="130" x2="270" y2="130" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
        <line x1="150" y1="130" x2={x} y2={y} stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
        {d === 90 ? <path d="M172 130 V108 H150" fill="none" stroke="var(--accent)" stroke-width="2.5" /> :
          d > 0 && <path d={`M186 130 A36 36 0 ${d > 180 ? 1 : 0} 0 ${ax} ${ay}`} fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5" />}
        <circle cx="150" cy="130" r="5" fill="var(--ink)" />
      </svg>
      <div class="val">{d}° · {kind}</div>
      <Slider name="α" value={d} set={setD} min={0} max={360} step={5} />
    </div>
  )
}

export function Pythagoras({ a: a0, b: b0 }: { a: number; b: number }) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0)
  const c = Math.sqrt(a * a + b * b)
  const k = 150 / (a + b + Math.max(a, b))
  const A = a * k, B = b * k
  const ox = A + 8, oy = 8 + B
  // right angle at (ox, oy+A); legs: vertical a (up), horizontal b (right)
  const P1 = [ox, oy], P2 = [ox, oy + A], P3 = [ox + B, oy + A]
  const dx = P3[0] - P1[0], dy = P3[1] - P1[1]
  const sq = `M${P1} L${P3} L${P3[0] + dy},${P3[1] - dx} L${P1[0] + dy},${P1[1] - dx} Z`
  const W = ox + B + A + 20, H = oy + A + B + 10
  return (
    <div class="w">
      <svg viewBox={`0 0 ${W} ${H}`} width="280">
        <path d={`M${ox - A},${oy} h${A} v${A} h${-A} Z`} fill="hsl(var(--h) 80% 60% / 0.35)" />
        <path d={`M${ox},${oy + A} h${B} v${B} h${-B} Z`} fill="hsl(var(--h) 80% 50% / 0.35)" />
        <path d={sq} fill="hsl(var(--h) 80% 40% / 0.3)" />
        <path d={`M${P1} L${P2} L${P3} Z`} fill="var(--card)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" />
        <text x={ox - A / 2} y={oy + A / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">a²={a * a}</text>
        <text x={ox + B / 2} y={oy + A + B / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">b²={b * b}</text>
        <text x={(P1[0] + P3[0]) / 2 + dy / 2} y={(P1[1] + P3[1]) / 2 - dx / 2 + 6} text-anchor="middle" font-weight="900" font-size="15" fill="var(--ink)">c²={a * a + b * b}</text>
      </svg>
      <div class="val">c = √{a * a + b * b} {Number.isInteger(c) ? `= ${c}` : `≈ ${fmt(c)}`}</div>
      <Slider name="a" value={a} set={setA} min={1} max={12} />
      <Slider name="b" value={b} set={setB} min={1} max={12} />
    </div>
  )
}

function Graph({ f, children }: { f: (x: number) => number; children?: preact.ComponentChildren }) {
  const S = 20, N = 6, W = 2 * N * S
  const X = (x: number) => W / 2 + x * S, Y = (y: number) => W / 2 - y * S
  let d = ''
  for (let i = 0; i <= 240; i++) {
    const x = -N + (i / 240) * 2 * N, y = f(x)
    if (Math.abs(y) > N * 3) { d += ' '; continue }
    d += `${d.endsWith(' ') || !d ? 'M' : 'L'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`
  }
  return (
    <svg viewBox={`0 0 ${W} ${W}`} width="260">
      <defs><clipPath id="gc"><rect width={W} height={W} /></clipPath></defs>
      {Array.from({ length: 2 * N + 1 }, (_, i) => <g key={i}><line x1={i * S} x2={i * S} y1={0} y2={W} stroke="var(--line)" /><line y1={i * S} y2={i * S} x1={0} x2={W} stroke="var(--line)" /></g>)}
      <line x1={0} x2={W} y1={W / 2} y2={W / 2} stroke="var(--ink-3)" stroke-width="2" />
      <line y1={0} y2={W} x1={W / 2} x2={W / 2} stroke="var(--ink-3)" stroke-width="2" />
      <text x={W - 10} y={W / 2 - 6} font-size="12" font-weight="800" fill="var(--ink-2)">x</text>
      <text x={W / 2 + 6} y={12} font-size="12" font-weight="800" fill="var(--ink-2)">y</text>
      <path d={d.replace(/ M/g, 'M').trim()} fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round" clip-path="url(#gc)" />
      {children}
    </svg>
  )
}

export function Linear({ k: k0, q: q0 }: { k: number; q: number }) {
  const [k, setK] = useState(k0), [q, setQ] = useState(q0)
  const sgn = (n: number) => (n < 0 ? ` − ${fmt(-n)}` : ` + ${fmt(n)}`)
  return (
    <div class="w">
      <Graph f={(x) => k * x + q} />
      <div class="val">y = {k === 0 ? '' : k === 1 ? 'x' : k === -1 ? '−x' : `${fmt(k)}x`}{k === 0 ? fmt(q) : q ? sgn(q) : ''}</div>
      <div class="sub">{k > 0 ? 'rostoucí' : k < 0 ? 'klesající' : 'konstantní'}</div>
      <Slider name="k" value={k} set={setK} min={-5} max={5} step={0.5} />
      <Slider name="q" value={q} set={setQ} min={-5} max={5} step={0.5} />
    </div>
  )
}

export function Quadratic({ a: a0, b: b0, c: c0 }: { a: number; b: number; c: number }) {
  const [a, setA] = useState(a0 || 1), [b, setB] = useState(b0), [c, setC] = useState(c0)
  const D = b * b - 4 * a * c
  const roots = D < 0 ? 'žádný reálný kořen' : D === 0 ? `x = ${fmt(-b / (2 * a))}` : `x₁ = ${fmt((-b - Math.sqrt(D)) / (2 * a))}, x₂ = ${fmt((-b + Math.sqrt(D)) / (2 * a))}`
  const t = (n: number, s: string) => (n === 0 ? '' : `${n < 0 ? ' − ' : ' + '}${Math.abs(n) === 1 && s ? '' : fmt(Math.abs(n))}${s}`)
  return (
    <div class="w">
      <Graph f={(x) => a * x * x + b * x + c} />
      <div class="val">y = {a === 1 ? '' : a === -1 ? '−' : fmt(a)}x²{t(b, 'x')}{t(c, '')}</div>
      <div class="sub">D = {fmt(D)} · {roots}</div>
      <Slider name="a" value={a} set={(v) => setA(v || 0.5)} min={-3} max={3} step={0.5} />
      <Slider name="b" value={b} set={setB} min={-6} max={6} step={1} />
      <Slider name="c" value={c} set={setC} min={-6} max={6} step={1} />
    </div>
  )
}

export function Percent({ p: p0, of }: { p: number; of?: number }) {
  const [p, setP] = useState(p0)
  return (
    <div class="w">
      <svg viewBox="0 0 200 200" width="220">
        {Array.from({ length: 100 }, (_, i) => <rect key={i} x={(i % 10) * 20 + 1} y={Math.floor(i / 10) * 20 + 1} width="18" height="18" rx="4" fill={i < p ? 'var(--accent)' : 'var(--accent-soft)'} style={{ transition: 'fill 0.2s' }} />)}
      </svg>
      <div class="val">{p} %{of ? ` z ${fmt(of)} = ${fmt((of * p) / 100)}` : ` = ${fmt(p / 100)}`}</div>
      <Slider name="%" value={p} set={setP} min={0} max={100} />
    </div>
  )
}

export function Shape({ shape, a: a0 = 4, b: b0 = 3 }: { shape: 'square' | 'rect' | 'triangle' | 'circle'; a?: number; b?: number }) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0)
  const s = 16
  let fig, o = '', S = ''
  if (shape === 'square') { fig = <rect x={10} y={10} width={a * s} height={a * s} rx="3" />; o = `o = 4 · ${a} = ${4 * a}`; S = `S = ${a} · ${a} = ${a * a}` }
  else if (shape === 'rect') { fig = <rect x={10} y={10} width={a * s} height={b * s} rx="3" />; o = `o = 2 · (${a} + ${b}) = ${2 * (a + b)}`; S = `S = ${a} · ${b} = ${a * b}` }
  else if (shape === 'triangle') { fig = <path d={`M10,${10 + b * s} h${a * s} L${10 + (a * s) / 3},10 Z`} />; S = `S = ${a} · ${b} : 2 = ${fmt((a * b) / 2)}`; o = `základna a = ${a}, výška v = ${b}` }
  else { fig = <circle cx={10 + a * s} cy={10 + a * s} r={a * s} />; o = `o = 2 · π · ${a} ≈ ${fmt(2 * Math.PI * a)}`; S = `S = π · ${a}² ≈ ${fmt(Math.PI * a * a)}` }
  const W = 20 + (shape === 'circle' ? 2 * a : a) * s, H = 20 + (shape === 'circle' ? 2 * a : shape === 'square' ? a : b) * s
  return (
    <div class="w">
      <svg viewBox={`0 0 ${Math.max(W, 60)} ${Math.max(H, 60)}`} width={Math.min(280, Math.max(W, 60) * 1.4)}>
        <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round">{fig}</g>
        {shape !== 'circle' && Array.from({ length: a - 1 }, (_, i) => <line key={i} x1={10 + (i + 1) * s} x2={10 + (i + 1) * s} y1={10} y2={H - 10} stroke="var(--accent)" stroke-opacity={shape === 'triangle' ? 0 : 0.25} />)}
        {(shape === 'rect' || shape === 'square') && Array.from({ length: (shape === 'square' ? a : b) - 1 }, (_, i) => <line key={i} y1={10 + (i + 1) * s} y2={10 + (i + 1) * s} x1={10} x2={W - 10} stroke="var(--accent)" stroke-opacity="0.25" />)}
      </svg>
      <div class="val" style={{ fontSize: '1.1rem' }}>{S}</div>
      <div class="sub">{o}</div>
      <Slider name={shape === 'circle' ? 'r' : 'a'} value={a} set={setA} min={1} max={shape === 'circle' ? 6 : 12} />
      {(shape === 'rect' || shape === 'triangle') && <Slider name={shape === 'triangle' ? 'v' : 'b'} value={b} set={setB} min={1} max={10} />}
    </div>
  )
}
