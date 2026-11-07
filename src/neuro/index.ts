// Neuronová síť (/neuronova-sit): a tiny neural network the pupil teaches to recognise four drawn shapes. Everything
// runs in the device: the drawing is turned into 16 × 16 = 256 numbers, a network with one hidden layer of 24 neurons
// guesses the shape while the pupil draws, and every shape the pupil names becomes one more example to learn from.
// No browser API here (the drawing is rasterised by hand), so the logic runs in tests too (scripts/neuro-test.ts).

export const NEURO_PATH = '/neuronova-sit'
export const NEURO_INTRO = 'Nauč počítač poznávat tvary. Nakresli trojúhelník, čtverec, kruh nebo obdélník a řekni síti, co to je. Neuronová síť se z každého obrázku trochu naučí a za chvíli pozná sama, co kreslíš, aniž bys cokoli klikal. Na křivce učení uvidíš, kdy to pochopila.'

export interface Shape { id: string; name: string; /** 4. pád: „Je to …“ is the 1st, „Nakresli …“ the 4th. */ acc: string }
export const SHAPES: Shape[] = [
  { id: 'trojuhelnik', name: 'Trojúhelník', acc: 'trojúhelník' },
  { id: 'ctverec', name: 'Čtverec', acc: 'čtverec' },
  { id: 'kruh', name: 'Kruh', acc: 'kruh' },
  { id: 'obdelnik', name: 'Obdélník', acc: 'obdélník' },
]

/** Side of the picture the network sees. */
export const GRID = 16
export const INPUTS = GRID * GRID
export const HIDDEN = 24
export const OUTPUTS = SHAPES.length

/** A stroke: points [x, y] in the drawing pad, both 0–1. */
export type Stroke = [number, number][]

// ---------------------------------------------------------------------------------------------------------------
// From strokes to 256 numbers

/** Too small to be a shape (a tap, a dot): the longer side of the drawing as a share of the pad. */
const MIN_SIZE = 0.04

export const isBlank = (strokes: Stroke[]) => {
  const b = bounds(strokes)
  return !b || Math.max(b.w, b.h) < MIN_SIZE
}

function bounds(strokes: Stroke[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const s of strokes) for (const [x, y] of s) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  return x0 === Infinity ? null : { x0, y0, w: x1 - x0, h: y1 - y0 }
}

/** A small change of a drawing used to learn from (a slightly turned, moved or shaky copy), so a few examples go further. */
export interface Jitter { angle: number; dx: number; dy: number; noise: number; seed: number }

/**
 * The picture the network sees: the drawing cut to its bounding box and scaled so that the longer side fills the
 * grid (the aspect ratio stays: that is what tells a square from a rectangle), strokes of the same width whatever
 * the size of the drawing. Values 0 (empty) to 1 (ink).
 */
export function rasterize(strokes: Stroke[], jitter?: Jitter): Float32Array {
  const out = new Float32Array(INPUTS)
  let pts = strokes
  if (jitter) {
    const rnd = rng(jitter.seed), c = Math.cos(jitter.angle), s = Math.sin(jitter.angle)
    pts = strokes.map((st) => st.map(([x, y]) => {
      const nx = (rnd() - 0.5) * jitter.noise, ny = (rnd() - 0.5) * jitter.noise
      return [x * c - y * s + nx, x * s + y * c + ny] as [number, number]
    }))
  }
  const b = bounds(pts)
  if (!b || Math.max(b.w, b.h) < MIN_SIZE) return out
  const pad = 1.5, size = GRID - 2 * pad
  const k = size / Math.max(b.w, b.h)
  const ox = pad + (size - b.w * k) / 2 + (jitter?.dx ?? 0), oy = pad + (size - b.h * k) / 2 + (jitter?.dy ?? 0)
  const R = 0.95
  const dab = (px: number, py: number) => {
    const cx0 = Math.max(0, Math.floor(px - R)), cx1 = Math.min(GRID - 1, Math.ceil(px + R))
    const cy0 = Math.max(0, Math.floor(py - R)), cy1 = Math.min(GRID - 1, Math.ceil(py + R))
    for (let gy = cy0; gy <= cy1; gy++) for (let gx = cx0; gx <= cx1; gx++) {
      const d = Math.hypot(gx + 0.5 - px, gy + 0.5 - py)
      const v = Math.min(1, Math.max(0, 1.25 - d / R))
      const i = gy * GRID + gx
      if (v > out[i]) out[i] = v
    }
  }
  for (const st of pts) {
    const p = st.map(([x, y]) => [ox + (x - b.x0) * k, oy + (y - b.y0) * k])
    if (p.length === 1) dab(p[0][0], p[0][1])
    for (let i = 1; i < p.length; i++) {
      const [ax, ay] = p[i - 1], [bx, by] = p[i]
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.3))
      for (let j = 0; j <= n; j++) dab(ax + ((bx - ax) * j) / n, ay + ((by - ay) * j) / n)
    }
  }
  return out
}

/** Copies of one drawing the network learns from: the drawing itself and a few slightly changed ones. */
export const VARIANTS = 5
export function variants(strokes: Stroke[], seed: number): Float32Array[] {
  const rnd = rng(seed)
  const out = [rasterize(strokes)]
  for (let i = 1; i < VARIANTS; i++) {
    out.push(rasterize(strokes, { angle: (rnd() - 0.5) * 0.3, dx: (rnd() - 0.5) * 1.6, dy: (rnd() - 0.5) * 1.6, noise: 0.015, seed: Math.floor(rnd() * 2 ** 31) }))
  }
  return out
}

// ---------------------------------------------------------------------------------------------------------------
// The network: 256 inputs → 24 hidden neurons (tanh) → 4 outputs (softmax = how sure it is of each shape)

export interface Net { w1: Float32Array; b1: Float32Array; w2: Float32Array; b2: Float32Array }

/** A fresh network: small random weights (always the same, so the same examples teach the same network). */
export function createNet(seed = 1): Net {
  const rnd = rng(seed)
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd())
  const w1 = new Float32Array(INPUTS * HIDDEN).map(() => gauss() * Math.sqrt(1 / INPUTS) * 1.5)
  const w2 = new Float32Array(HIDDEN * OUTPUTS).map(() => gauss() * Math.sqrt(1 / HIDDEN))
  return { w1, b1: new Float32Array(HIDDEN), w2, b2: new Float32Array(OUTPUTS) }
}

export interface Guess { hidden: Float32Array; probs: Float32Array; best: number }

export function predict(net: Net, x: Float32Array): Guess {
  const hidden = new Float32Array(HIDDEN)
  for (let h = 0; h < HIDDEN; h++) {
    let s = net.b1[h]
    const o = h * INPUTS
    for (let i = 0; i < INPUTS; i++) if (x[i]) s += net.w1[o + i] * x[i]
    hidden[h] = Math.tanh(s)
  }
  const probs = new Float32Array(OUTPUTS)
  let max = -Infinity
  for (let k = 0; k < OUTPUTS; k++) {
    let s = net.b2[k]
    for (let h = 0; h < HIDDEN; h++) s += net.w2[k * HIDDEN + h] * hidden[h]
    probs[k] = s
    max = Math.max(max, s)
  }
  let sum = 0
  for (let k = 0; k < OUTPUTS; k++) { probs[k] = Math.exp(probs[k] - max); sum += probs[k] }
  let best = 0
  for (let k = 0; k < OUTPUTS; k++) { probs[k] /= sum; if (probs[k] > probs[best]) best = k }
  return { hidden, probs, best }
}

/** One step of learning (backpropagation): nudges every weight so that the right shape gets a bit more sure. Returns the error (cross-entropy). */
function step(net: Net, x: Float32Array, y: number, lr: number): number {
  const { hidden, probs } = predict(net, x)
  const dOut = new Float32Array(OUTPUTS)
  for (let k = 0; k < OUTPUTS; k++) dOut[k] = probs[k] - (k === y ? 1 : 0)
  const dHid = new Float32Array(HIDDEN)
  for (let h = 0; h < HIDDEN; h++) {
    let s = 0
    for (let k = 0; k < OUTPUTS; k++) s += net.w2[k * HIDDEN + h] * dOut[k]
    dHid[h] = s * (1 - hidden[h] * hidden[h])
  }
  for (let k = 0; k < OUTPUTS; k++) {
    for (let h = 0; h < HIDDEN; h++) net.w2[k * HIDDEN + h] -= lr * dOut[k] * hidden[h]
    net.b2[k] -= lr * dOut[k]
  }
  for (let h = 0; h < HIDDEN; h++) {
    const g = lr * dHid[h]
    if (!g) continue
    const o = h * INPUTS
    for (let i = 0; i < INPUTS; i++) if (x[i]) net.w1[o + i] -= g * x[i]
    net.b1[h] -= g
  }
  return -Math.log(Math.max(probs[y], 1e-9))
}

export interface Example { shape: number; x: Float32Array[] }

/**
 * Learns from the examples: rounds over all of them in a shuffled order, at most about `budget` steps (a step is
 * one picture), at least two rounds. Returns the average error of the last round.
 */
export function train(net: Net, examples: Example[], seed: number, budget = 4000): number {
  const items: [Float32Array, number][] = examples.flatMap((e) => e.x.map((x) => [x, e.shape] as [Float32Array, number]))
  if (!items.length) return 0
  const rnd = rng(seed)
  const rounds = Math.max(2, Math.min(30, Math.floor(budget / items.length)))
  let loss = 0
  for (let r = 0; r < rounds; r++) {
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [items[i], items[j]] = [items[j], items[i]] }
    loss = 0
    for (const [x, y] of items) loss += step(net, x, y, 0.04)
    loss /= items.length
  }
  return loss
}

// ---------------------------------------------------------------------------------------------------------------
// The learning curve: before the network learns from a new example, it has guessed it. Those guesses are an honest
// test (the network had never seen the picture), so the share of right guesses over the last few is how well it
// understands by now.

export const WINDOW = 8
/** The network „got it“: at least 7 of the last 8 guesses right (and it has seen every shape). */
export const GOT_IT = 7

/** Share of right guesses (0–1) over the last WINDOW guesses up to each example. */
export const curve = (log: boolean[]) => log.map((_, i) => {
  const w = log.slice(Math.max(0, i - WINDOW + 1), i + 1)
  return w.filter(Boolean).length / w.length
})

/** The example after which the network understood (index into the log), or -1. */
export function gotItAt(log: boolean[], shapes: number[]): number {
  const seen = new Set<number>()
  for (let i = 0; i < log.length; i++) {
    seen.add(shapes[i])
    if (i + 1 < WINDOW || seen.size < OUTPUTS) continue
    if (log.slice(i - WINDOW + 1, i + 1).filter(Boolean).length >= GOT_IT) return i
  }
  return -1
}

// ---------------------------------------------------------------------------------------------------------------
// Saving: the drawings the pupil taught (not the weights: the network learns them again on the next visit, which
// takes a moment). They stay in this device only (docs/SOUKROMI.md): key sprtam:neuronka, in the pupil's profile.

export const STORE_KEY = 'sprtam:neuronka'
export const MAX_EXAMPLES = 150

export interface Taught { shape: number; strokes: Stroke[]; /** Did the network guess it right before learning from it. */ ok: boolean }

/** A stroke for saving: points as whole numbers 0–1000, close points dropped. */
const pack = (strokes: Stroke[]) => strokes.map((s) => {
  const out: number[] = []
  let px = -1e9, py = -1e9
  s.forEach(([x, y], i) => {
    const qx = Math.round(x * 1000), qy = Math.round(y * 1000)
    if (i === s.length - 1 || Math.hypot(qx - px, qy - py) >= 8) { out.push(qx, qy); px = qx; py = qy }
  })
  return out
})
const unpack = (s: number[][]): Stroke[] => s.map((a) => {
  const out: Stroke = []
  for (let i = 0; i + 1 < a.length; i += 2) out.push([a[i] / 1000, a[i + 1] / 1000])
  return out
})

export const encode = (taught: Taught[]) => JSON.stringify({ v: 1, t: taught.slice(-MAX_EXAMPLES).map((t) => [t.shape, t.ok ? 1 : 0, pack(t.strokes)]) })

export function decode(raw: string | null): Taught[] {
  try {
    const d = JSON.parse(raw ?? 'null') as { v?: number; t?: unknown } | null
    if (!d || d.v !== 1 || !Array.isArray(d.t)) return []
    return d.t.flatMap((x): Taught[] => {
      if (!Array.isArray(x) || x.length !== 3) return []
      const [shape, ok, s] = x
      if (!Number.isInteger(shape) || shape < 0 || shape >= OUTPUTS || !Array.isArray(s)) return []
      if (!s.every((a) => Array.isArray(a) && a.every((n) => typeof n === 'number' && Number.isFinite(n)))) return []
      return [{ shape, ok: ok === 1, strokes: unpack(s as number[][]) }]
    }).slice(-MAX_EXAMPLES)
  } catch { return [] }
}

/** The examples of what was taught, ready to learn from (the copies are always the same for the same drawing). */
export const exampleOf = (t: Taught, i: number): Example => ({ shape: t.shape, x: variants(t.strokes, 1000 + i * 7919) })
export const examplesOf = (taught: Taught[]): Example[] => taught.map(exampleOf)

/** A network that has learned everything taught so far (after a reload, or after an example was taken back). */
export function relearn(taught: Taught[]): { net: Net; examples: Example[] } {
  const net = createNet()
  const examples = examplesOf(taught)
  if (examples.length) train(net, examples, 7, 12000)
  return { net, examples }
}

/** A small deterministic random generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
