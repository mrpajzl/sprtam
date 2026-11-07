// Neuronová síť (src/neuro): the network learns shapes drawn the way a hand draws them (shaky, turned a bit, of any
// size and place, squares not quite square), the learning curve and saving. Run: npx tsx scripts/neuro-test.ts
import { createNet, curve, decode, encode, examplesOf, gotItAt, GRID, isBlank, predict, rasterize, relearn, rng, SHAPES, train, type Example, type Stroke, type Taught } from '../src/neuro'

let failed = 0
const check = (ok: boolean, what: string) => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${what}`) }

/** A shape as a hand draws it: random size, place, a slight turn and shake; rectangles 1.7–2.6 times wider than tall (or taller). */
function hand(shape: number, rnd: () => number): Stroke[] {
  const size = 0.3 + rnd() * 0.5, cx = 0.3 + rnd() * 0.4, cy = 0.3 + rnd() * 0.4
  const turn = (rnd() - 0.5) * 0.25, shake = 0.012
  let pts: [number, number][] = []
  const line = (a: [number, number], b: [number, number]) => { for (let i = 0; i <= 12; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / 12, a[1] + ((b[1] - a[1]) * i) / 12]) }
  const poly = (corners: [number, number][]) => corners.forEach((c, i) => line(c, corners[(i + 1) % corners.length]))
  if (shape === 0) poly([[0, -0.5], [0.5, 0.4], [-0.5, 0.4]].map(([x, y]) => [x + (rnd() - 0.5) * 0.15, y + (rnd() - 0.5) * 0.1]) as [number, number][])
  else if (shape === 1) { const a = 0.5, r = 0.9 + rnd() * 0.2; poly([[-a, -a * r], [a, -a * r], [a, a * r], [-a, a * r]]) }
  else if (shape === 2) { const r = 0.9 + rnd() * 0.2; for (let i = 0; i <= 48; i++) { const t = (i / 48) * Math.PI * 2; pts.push([Math.cos(t) * 0.5, Math.sin(t) * 0.5 * r]) } }
  else { const ratio = 1.7 + rnd() * 0.9, w = 0.5, h = w / ratio; const c: [number, number][] = [[-w, -h], [w, -h], [w, h], [-w, h]]; poly(rnd() < 0.3 ? c.map(([x, y]) => [y, x]) : c) }
  const c = Math.cos(turn), s = Math.sin(turn)
  pts = pts.map(([x, y]) => [cx + (x * c - y * s) * size + (rnd() - 0.5) * shake, cy + (x * s + y * c) * size + (rnd() - 0.5) * shake])
  return [pts]
}

// Rasterising
const sq = rasterize(hand(1, rng(1)))
check(sq.length === GRID * GRID && Math.max(...sq) <= 1 && Math.min(...sq) >= 0, 'the picture is 16 × 16 values 0–1')
check(sq.some((v) => v > 0.9), 'the strokes are inked')
check(isBlank([]) && isBlank([[[0.5, 0.5], [0.51, 0.5]]]) && !isBlank(hand(2, rng(2))), 'an empty pad or a dot is not a shape')
const wide = rasterize([[[0.1, 0.4], [0.9, 0.4], [0.9, 0.6], [0.1, 0.6], [0.1, 0.4]]])
const rowsInk = Array.from({ length: GRID }, (_, r) => wide.slice(r * GRID, r * GRID + GRID).some((v) => v > 0.5)).filter(Boolean).length
check(rowsInk < 8, `a wide rectangle stays wide (${rowsInk} of 16 rows inked)`)

// Learning as the pupil teaches: draw, the network guesses, then learns from it.
for (const seed of [11, 23, 37]) {
  const rnd = rng(seed)
  const net = createNet()
  const examples: Example[] = []
  const log: boolean[] = [], shapes: number[] = []
  const t0 = performance.now()
  let slowest = 0
  for (let i = 0; i < 60; i++) {
    const shape = i % 4 === 0 ? Math.floor(rnd() * 4) : (i * 3 + Math.floor(rnd() * 2)) % 4
    const strokes = hand(shape, rnd)
    log.push(predict(net, rasterize(strokes)).best === shape)
    shapes.push(shape)
    examples.push(...examplesOf([{ shape, strokes, ok: false }]))
    const t = performance.now()
    train(net, examples, i)
    slowest = Math.max(slowest, performance.now() - t)
  }
  const at = gotItAt(log, shapes)
  // A fresh test: 200 new drawings it has never seen.
  let right = 0
  const confusion = SHAPES.map(() => SHAPES.map(() => 0))
  for (let i = 0; i < 200; i++) { const shape = i % 4; const g = predict(net, rasterize(hand(shape, rnd))).best; confusion[shape][g]++; if (g === shape) right++ }
  console.log(`  seed ${seed}: got it after ${at + 1} examples, last curve ${curve(log).at(-1)!.toFixed(2)}, test ${right}/200, slowest training ${slowest.toFixed(0)} ms, all ${(performance.now() - t0).toFixed(0)} ms`)
  console.log(`  confusion (rows = drawn): ${confusion.map((r) => r.join(' ')).join(' | ')}`)
  check(at >= 0 && at < 45, `seed ${seed}: the network gets it within 45 examples`)
  check(right >= 170, `seed ${seed}: at least 85 % of new drawings right after 60 examples`)
  check(slowest < 400, `seed ${seed}: learning from one more example takes under 400 ms`)
}

// The curve and the moment it got it
check(JSON.stringify(curve([false, true, true])) === JSON.stringify([0, 0.5, 2 / 3]), 'the curve is the share of right guesses so far')
check(gotItAt([true, true, true, true, true, true, true, true], [0, 0, 0, 0, 0, 0, 0, 0]) === -1, 'it has not got it without seeing every shape')
check(gotItAt([false, false, true, true, true, true, true, true, true, false], [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]) === 8, 'it got it at the first 7 of 8 right')

// Saving
const taught: Taught[] = [0, 1, 2, 3].map((shape) => ({ shape, ok: shape % 2 === 0, strokes: hand(shape, rng(shape + 5)) }))
const raw = encode(taught)
const back = decode(raw)
check(back.length === 4 && back.every((t, i) => t.shape === taught[i].shape && t.ok === taught[i].ok), 'saved examples come back')
check(back.every((t, i) => Math.abs(t.strokes[0][0][0] - taught[i].strokes[0][0][0]) < 0.001), 'their drawings too')
check(raw.length < 4 * 1200, `an example takes little space (${Math.round(raw.length / 4)} characters)`)
check(decode('{"v":1,"t":[[9,1,[[1,2]]],["x"],[0,1,[["a"]]]]}').length === 0 && decode('nonsense').length === 0 && decode(null).length === 0, 'broken saved data is ignored')
const a = relearn(back), b = relearn(back)
const x = rasterize(taught[2].strokes)
check(predict(a.net, x).probs.every((p, i) => p === predict(b.net, x).probs[i]), 'learning again from the same examples gives the same network')

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
