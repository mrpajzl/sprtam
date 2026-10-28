// Map outlines for the Slepá mapa game (src/maps/): Natural Earth (public domain, naturalearthdata.com)
// → simplified with mapshaper (topology-aware, so neighbours keep a shared border) → projected here →
// src/maps/data/<map>.json (SVG path per country / region, its label point and the box of its largest part).
//
//   npx tsx scripts/maps-generate.ts [cache-dir]
//
// Downloads the Natural Earth files into cache-dir (default /tmp/natural-earth) once. Needs network and
// npx (mapshaper is run with npx, it is not a dependency of the project). The output is committed.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const CACHE = resolve(process.argv[2] ?? '/tmp/natural-earth')
const OUT = resolve(import.meta.dirname, '../src/maps/data')
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const MAPSHAPER = 'mapshaper@0.7.100'

type Pos = [number, number]
type Ring = Pos[]
interface Geo { type: 'Polygon' | 'MultiPolygon'; coordinates: Ring[] | Ring[][] }
interface Feature { properties: Record<string, unknown>; geometry: Geo | null }

function source(name: string): string {
  mkdirSync(CACHE, { recursive: true })
  const file = join(CACHE, `${name}.geojson`)
  if (!existsSync(file)) execFileSync('curl', ['-sfL', '-o', file, `${NE}/${name}.geojson`], { stdio: 'inherit' })
  return file
}

/** mapshaper: filter, give every feature an `id` (merging parts with the same id) and simplify. */
function shape(input: string, cmds: string[]): Feature[] {
  const out = join(CACHE, 'out.json')
  execFileSync('npx', ['-y', MAPSHAPER, '-i', input, ...cmds, '-o', out, 'format=geojson', 'precision=0.0001', 'force'], { stdio: 'inherit' })
  return JSON.parse(readFileSync(out, 'utf8')).features
}

const rad = Math.PI / 180

// Equal Earth (Šavrič, Patterson, Jenny 2018): equal-area, pleasant shapes for a world map.
function equalEarth([lon, lat]: Pos): Pos {
  const [A1, A2, A3, A4, M] = [1.340264, -0.081106, 0.000893, 0.003796, Math.sqrt(3) / 2]
  const t = Math.asin(M * Math.sin(lat * rad))
  const t2 = t * t, t6 = t2 * t2 * t2
  return [(lon * rad * Math.cos(t)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))), -t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))]
}

// Lambert azimuthal equal-area centred on Europe (like EPSG:3035).
function laea(lon0: number, lat0: number) {
  const s0 = Math.sin(lat0 * rad), c0 = Math.cos(lat0 * rad)
  return ([lon, lat]: Pos): Pos => {
    const l = (lon - lon0) * rad, s = Math.sin(lat * rad), c = Math.cos(lat * rad)
    const k = Math.sqrt(2 / (1 + s0 * s + c0 * c * Math.cos(l)))
    return [k * c * Math.sin(l), -k * (c0 * s - s0 * c * Math.cos(l))]
  }
}

// Small area: plain longitude/latitude, longitude shortened by the cosine of the middle latitude.
const plate = (lat0: number): ((p: Pos) => Pos) => ([lon, lat]) => [lon * Math.cos(lat0 * rad), -lat]

/** Sutherland–Hodgman: a ring clipped to a rectangle. */
function clip(ring: Ring, [x0, y0, x1, y1]: number[]): Ring {
  const edges: [(p: Pos) => boolean, (a: Pos, b: Pos) => Pos][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ]
  let out = ring
  for (const [inside, cut] of edges) {
    const src = out
    out = []
    for (let i = 0; i < src.length; i++) {
      const a = src[(i + src.length - 1) % src.length], b = src[i]
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b) } else if (inside(a)) out.push(cut(a, b))
    }
    if (!out.length) break
  }
  return out
}

interface MapSpec {
  id: string
  project: (p: Pos) => Pos
  features: Feature[]
  /** Label point of a feature in lon/lat. */
  label: (id: string) => Pos | undefined
  /** Visible part in lon/lat corners (clips the projected map to their bounding box). */
  frame?: Pos[]
  width: number
}

function build({ id, project, features, label, frame, width }: MapSpec) {
  const rings = (g: Geo): Ring[] => (g.type === 'Polygon' ? (g.coordinates as Ring[]) : (g.coordinates as Ring[][]).flat())
  const projected = features.filter((f) => f.geometry).map((f) => ({ id: String(f.properties.id), rings: rings(f.geometry!).map((r) => r.map(project)) }))
  let box: number[]
  if (frame) {
    const pts = frame.map(project)
    box = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))]
    for (const f of projected) f.rings = f.rings.map((r) => clip(r, box)).filter((r) => r.length > 2)
  } else {
    const all = projected.flatMap((f) => f.rings.flat())
    box = [Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1]))]
  }
  const k = width / (box[2] - box[0])
  const height = Math.round((box[3] - box[1]) * k)
  const at = (p: Pos): Pos => [Math.round((p[0] - box[0]) * k * 10), Math.round((p[1] - box[1]) * k * 10)] // tenths of a unit
  const num = (n: number) => (n / 10).toString().replace(/^(-?)0\./, '$1.')
  const f = projected.map((x) => {
    // Relative path from rounded absolute points: no drift, short numbers.
    let d = ''
    const pts = x.rings.map((r) => r.map(at))
    // Bounding box of the largest ring: the mainland the game zooms to (not Alaska's islands across the date line).
    let main: number[] | undefined, most = -1
    for (const r of pts) {
      const ring = r.filter((p, i) => i === 0 || p[0] !== r[i - 1][0] || p[1] !== r[i - 1][1])
      if (ring.length > 1 && ring[0][0] === ring.at(-1)![0] && ring[0][1] === ring.at(-1)![1]) ring.pop()
      if (ring.length < 3) continue
      d += `M${num(ring[0][0])} ${num(ring[0][1])}l`
      d += ring.slice(1).map((p, i) => { const dx = num(p[0] - ring[i][0]), dy = num(p[1] - ring[i][1]); return `${dx}${dy.startsWith('-') ? '' : ' '}${dy}` }).join(' ').replace(/ -/g, '-')
      d += 'z'
      const area = Math.abs(ring.reduce((a, p, i) => { const q = ring[(i + 1) % ring.length]; return a + p[0] * q[1] - q[0] * p[1] }, 0))
      if (area > most) {
        most = area
        main = [Math.min(...ring.map((p) => p[0])), Math.min(...ring.map((p) => p[1])), Math.max(...ring.map((p) => p[0])), Math.max(...ring.map((p) => p[1]))]
      }
    }
    // A state smaller than the rounding (Vatican) keeps just its label point: the game draws it as a dot.
    const l = label(x.id)
    const lp = l ? at(project(l)) : main ? [(main[0] + main[2]) / 2, (main[1] + main[3]) / 2] : undefined
    if (!lp || (!d && (lp[0] < 0 || lp[1] < 0 || lp[0] > width * 10 || lp[1] > height * 10))) return null
    return { id: x.id, d, x: Math.round(lp[0]) / 10, y: Math.round(lp[1]) / 10, b: (main ?? [lp[0], lp[1], lp[0], lp[1]]).map((n) => Math.round(n) / 10) }
  }).filter((x) => x !== null)
  f.sort((a, b) => a.id.localeCompare(b.id))
  const json = JSON.stringify({ w: width, h: height, f })
  writeFileSync(join(OUT, `${id}.json`), json + '\n')
  console.log(`${id}: ${f.length} areas, ${width}×${height}, ${(json.length / 1024).toFixed(0)} kB`)
}

mkdirSync(OUT, { recursive: true })

// Countries: one feature per state. Parts Natural Earth splits off are merged back into the state they belong to.
const MERGE: Record<string, string> = { SOL: 'SOM', CYN: 'CYP', ALD: 'FIN' }
const idExpr = `id = (${JSON.stringify(MERGE)})[ADM0_A3] || ADM0_A3`
const countryLabels = (file: string) => {
  const m = new Map<string, Pos>()
  for (const f of JSON.parse(readFileSync(file, 'utf8')).features as Feature[]) m.set(String(f.properties.ADM0_A3), [Number(f.properties.LABEL_X), Number(f.properties.LABEL_Y)])
  return (id: string) => m.get(id)
}

{
  const file = source('ne_50m_admin_0_countries')
  build({
    id: 'svet',
    project: equalEarth,
    width: 1000,
    features: shape(file, ['-filter', 'CONTINENT != "Antarctica"', '-each', idExpr, '-dissolve', 'id', '-simplify', 'interval=6000', 'keep-shapes']),
    label: countryLabels(file),
  })
}
{
  const file = source('ne_10m_admin_0_countries')
  build({
    id: 'evropa',
    project: laea(14, 52),
    width: 1000,
    frame: [[-24, 63], [-12, 35], [14, 34.6], [34, 33.9], [60, 56], [36, 71.5], [-24, 66.6]],
    features: shape(file, ['-clip', 'bbox=-40,25,90,85', '-each', idExpr, '-dissolve', 'id', '-simplify', 'interval=1500', 'keep-shapes']),
    label: countryLabels(file),
  })
}
{
  const file = source('ne_10m_admin_1_states_provinces')
  const labels = new Map<string, Pos>()
  for (const f of JSON.parse(readFileSync(file, 'utf8')).features as Feature[]) {
    if (f.properties.iso_a2 === 'CZ') labels.set(String(f.properties.iso_3166_2), [Number(f.properties.longitude), Number(f.properties.latitude)])
  }
  build({
    id: 'kraje',
    project: plate(49.8),
    width: 1000,
    features: shape(file, ['-filter', 'iso_a2 == "CZ"', '-each', 'id = iso_3166_2', '-simplify', 'interval=200', 'keep-shapes']),
    label: (id) => labels.get(id),
  })
}
