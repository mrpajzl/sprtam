import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Area, MapData } from '.'

// A blind map you can pan and zoom (drag, pinch, wheel, buttons) and tap. States too small to tap at the current
// zoom get a dot. Everything is in map units (src/maps/data/*.json); `s` = screen pixels per map unit.

export interface Tag { id: string; text: string; tone?: 'ok' | 'bad' | 'show' }

interface View { cx: number; cy: number; w: number }
interface Size { W: number; H: number }

const DOT = 4.5 // px, radius of a tiny state's dot
const TINY = 8 // px, a state smaller than this on screen gets a dot
const HIT = 18 // px, radius of the smallest tap area: a circle around a small state (Monaco next to France)
const REACH = 12 // px, a tap on the sea this close to any state of the game picks it
const MAX_ZOOM = 60 // the whole map ÷ this = the closest view (Monaco fills a finger)
const TAP_SIZE = 24 // px, a typical place should be at least this big when the map opens…
const START_ZOOM = 2.2 // …zooming in at most this much

type Box = [number, number, number, number]
const boxOf = (areas: Area[]): Box => [Math.min(...areas.map((a) => a.b[0])), Math.min(...areas.map((a) => a.b[1])), Math.max(...areas.map((a) => a.b[2])), Math.max(...areas.map((a) => a.b[3]))]

export function MapView({ data, ids, fit, marks, tag, focus, onPick, label }: {
  data: MapData
  /** The places of the game: the rest is drawn grey. */
  ids: string[]
  /** The view starts fitted to these places (default: the whole map). */
  fit?: string[]
  /** State of a place: ok (found), miss (not found), bad (wrong tap, for a moment), show (shown answer), pick (asked about). */
  marks?: Record<string, string>
  tag?: Tag | null
  /** Zoom to this place when it changes. */
  focus?: string | null
  onPick?: (id: string | null) => void
  label: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [view, setView] = useState<View | null>(null)
  const live = useRef<{ view: View | null; size: Size | null }>({ view: null, size: null })
  live.current = { view, size }

  const play = useMemo(() => new Set(ids), [ids])
  const byId = useMemo(() => new Map(data.f.map((a) => [a.id, a])), [data])

  // The view that shows all the fitted places (with a margin), in the shape of the element.
  const fitted = useMemo(() => {
    const areas = (fit ?? []).flatMap((id) => byId.get(id) ?? [])
    const [x0, y0, x1, y1] = areas.length ? boxOf(areas) : [0, 0, data.w, data.h]
    const pad = areas.length ? 0.06 : 0
    const bw = (x1 - x0) * (1 + pad * 2) || 1, bh = (y1 - y0) * (1 + pad * 2) || 1
    const sizes = ids.flatMap((id) => { const a = byId.get(id); return a ? [Math.max(a.b[2] - a.b[0], a.b[3] - a.b[1])] : [] }).sort((p, q) => p - q)
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, bw, bh, median: sizes[sizes.length >> 1] || 1 }
  }, [fit, ids, byId, data])
  const whole = (sz: Size): View => ({ cx: fitted.cx, cy: fitted.cy, w: Math.max(fitted.bw, (fitted.bh * sz.W) / sz.H) })
  // Where the map starts: the whole map, unless its places would be too small to tap (the world on a phone).
  // Then zoomed in, at most until the map fills the element; − or dragging shows the rest. A part of the map
  // (a continent) always starts whole, so that no island state is out of sight.
  const home = (sz: Size): View => {
    const all = whole(sz), fill = Math.min(fitted.bw, (fitted.bh * sz.W) / sz.H)
    if (fit) return all
    const k = Math.min(START_ZOOM, all.w / fill, Math.max(1, (TAP_SIZE * all.w) / (fitted.median * sz.W)))
    return { ...all, w: all.w / k }
  }

  const limits = (sz: Size) => { const h = whole(sz); return { min: h.w / MAX_ZOOM, max: h.w } }
  const clamp = (v: View, sz: Size): View => {
    const { min, max } = limits(sz)
    const w = Math.min(max, Math.max(min, v.w))
    return { w, cx: Math.min(data.w, Math.max(0, v.cx)), cy: Math.min(data.h, Math.max(0, v.cy)) }
  }

  useLayoutEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => {
      const sz = { W: el.clientWidth, H: el.clientHeight }
      if (!sz.W || !sz.H) return
      setSize(sz)
      setView((v) => (v ? clamp(v, sz) : home(sz)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitted])

  // Smooth move to a view.
  const anim = useRef(0)
  const flyTo = (to: View) => {
    cancelAnimationFrame(anim.current)
    const from = live.current.view
    if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return setView(to)
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 380), e = 1 - (1 - k) ** 3
      setView({ cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, w: from.w * (to.w / from.w) ** e })
      if (k < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }
  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  // Focus: bring the place into view, big enough to see.
  useEffect(() => {
    const a = focus && byId.get(focus)
    const { view: v, size: sz } = live.current
    if (!a || !v || !sz) return
    const s = sz.W / v.w, aw = a.b[2] - a.b[0], ah = a.b[3] - a.b[1]
    const vx = v.cx - v.w / 2, vy = v.cy - (v.w * sz.H) / sz.W / 2
    const inside = a.b[0] >= vx && a.b[2] <= vx + v.w && a.b[1] >= vy && a.b[3] <= vy + (v.w * sz.H) / sz.W
    if (inside && Math.max(aw, ah) * s >= 40) return
    const want = Math.max(aw * 2.2, (ah * 2.2 * sz.W) / sz.H, home(sz).w / 6)
    flyTo(clamp({ cx: (a.b[0] + a.b[2]) / 2, cy: (a.b[1] + a.b[3]) / 2, w: Math.min(v.w, want) }, sz))
  }, [focus, byId, !view])

  // Gestures: one pointer pans, two pinch, a tap without movement picks.
  const ptrs = useRef(new Map<number, { x: number; y: number }>())
  const start = useRef<{ view: View; pts: { x: number; y: number }[]; moved: boolean } | null>(null)
  const local = (e: PointerEvent | WheelEvent) => { const r = box.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const restart = (moved = false) => { const v = live.current.view; start.current = v ? { view: v, pts: [...ptrs.current.values()], moved } : null }

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    cancelAnimationFrame(anim.current)
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    if (e.isPrimary) ptrs.current.clear() // a first finger: forget any pointer whose end got lost
    ptrs.current.set(e.pointerId, local(e))
    restart(ptrs.current.size > 1) // a second finger is never a tap
  }
  const onMove = (e: PointerEvent) => {
    if (!ptrs.current.has(e.pointerId) || !start.current || !size) return
    ptrs.current.set(e.pointerId, local(e))
    const st = start.current, pts = [...ptrs.current.values()]
    const s0 = size.W / st.view.w
    const vx0 = st.view.cx - st.view.w / 2, vy0 = st.view.cy - (st.view.w * size.H) / size.W / 2
    if (pts.length === 1 && st.pts.length === 1) {
      const dx = pts[0].x - st.pts[0].x, dy = pts[0].y - st.pts[0].y
      if (!st.moved && Math.hypot(dx, dy) < 6) return
      st.moved = true
      setView(clamp({ ...st.view, cx: st.view.cx - dx / s0, cy: st.view.cy - dy / s0 }, size))
    } else if (pts.length >= 2 && st.pts.length >= 2) {
      st.moved = true
      const mid = (p: { x: number; y: number }[]) => ({ x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 })
      const dist = (p: { x: number; y: number }[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1
      const m0 = mid(st.pts), m1 = mid(pts)
      const { min, max } = limits(size)
      const w = Math.min(max, Math.max(min, (st.view.w * dist(st.pts)) / dist(pts)))
      const s1 = size.W / w
      const wx = vx0 + m0.x / s0, wy = vy0 + m0.y / s0
      setView(clamp({ w, cx: wx - m1.x / s1 + w / 2, cy: wy - m1.y / s1 + (w * size.H) / size.W / 2 }, size))
    }
  }
  const onUp = (e: PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return
    const tap = ptrs.current.size === 1 && start.current && !start.current.moved && e.type === 'pointerup'
    ptrs.current.delete(e.pointerId)
    if (tap && onPick) onPick(pickAt(e))
    // The finger left after a pinch keeps panning from where it is.
    if (ptrs.current.size) restart(true)
    else start.current = null
  }

  // What a tap means. Every state of the game can be tapped at least within a circle of HIT around its middle,
  // above its big neighbours (the nearest middle wins); a tap right on a small state stays there. Otherwise the place under the finger, and a tap on the sea
  // next to a state picks that state.
  const pickAt = (e: PointerEvent): string | null => {
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-id]')?.getAttribute('data-id') ?? null
    const { view: v, size: sz } = live.current
    if (!v || !sz) return hit
    const s = sz.W / v.w, p = local(e)
    const x = v.cx - v.w / 2 + p.x / s, y = v.cy - (v.w * sz.H) / sz.W / 2 + p.y / s
    let small: string | null = null, smallD = HIT, near: string | null = null, nearD = REACH
    for (const id of ids) {
      const a = byId.get(id)
      if (!a) continue
      const d = Math.hypot(Math.max(a.b[0] - x, 0, x - a.b[2]), Math.max(a.b[1] - y, 0, y - a.b[3])) * s
      const mid = Math.hypot((a.b[0] + a.b[2]) / 2 - x, (a.b[1] + a.b[3]) / 2 - y) * s
      if (Math.max(a.b[2] - a.b[0], a.b[3] - a.b[1]) * s < HIT * 2 && mid < smallD) { small = id; smallD = mid }
      if (d < nearD) { near = id; nearD = d }
    }
    const tiny = (id: string) => { const a = byId.get(id)!; return Math.max(a.b[2] - a.b[0], a.b[3] - a.b[1]) * s < HIT * 2 }
    if (small && !(hit && play.has(hit) && tiny(hit))) return small
    return hit && play.has(hit) ? hit : near ?? hit
  }

  const zoomAt = (k: number, at?: { x: number; y: number }) => {
    const { view: v, size: sz } = live.current
    if (!v || !sz) return
    const p = at ?? { x: sz.W / 2, y: sz.H / 2 }
    const s0 = sz.W / v.w, { min, max } = limits(sz)
    const w = Math.min(max, Math.max(min, v.w * k)), s1 = sz.W / w
    const wx = v.cx - v.w / 2 + p.x / s0, wy = v.cy - (v.w * sz.H) / sz.W / 2 + p.y / s0
    setView(clamp({ w, cx: wx - p.x / s1 + w / 2, cy: wy - p.y / s1 + (w * sz.H) / sz.W / 2 }, sz))
  }
  useEffect(() => {
    const el = box.current!
    const on = (e: WheelEvent) => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), local(e)) }
    el.addEventListener('wheel', on, { passive: false })
    return () => el.removeEventListener('wheel', on)
  }, [fitted])

  // The outlines change only with the game's state, not while panning.
  const shapes = useMemo(() => data.f.map((a) => (a.d ? <path key={a.id} d={a.d} data-id={a.id} class={`${play.has(a.id) ? 'p' : 'c'} ${marks?.[a.id] ?? ''}`} /> : null)), [data, play, marks])

  const v = view, sz = size
  const s = v && sz ? sz.W / v.w : 1
  const vh = v && sz ? (v.w * sz.H) / sz.W : 0
  const vx = v ? v.cx - v.w / 2 : 0, vy = v ? v.cy - vh / 2 : 0
  const dots = v && sz ? ids.flatMap((id) => {
    const a = byId.get(id)
    if (!a || Math.max(a.b[2] - a.b[0], a.b[3] - a.b[1]) * s >= TINY) return []
    return [<circle key={id} cx={a.x} cy={a.y} r={DOT / s} data-id={id} class={`dot ${marks?.[id] ?? ''}`} />]
  }) : null
  const tagged = tag && byId.get(tag.id)

  return (
    <div class="map" ref={box}>
      <svg
        viewBox={v ? `${vx} ${vy} ${v.w} ${vh}` : `0 0 ${data.w} ${data.h}`}
        role="img" aria-label={label}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <g class="areas">{shapes}</g>
        <g class="dots">{dots}</g>
      </svg>
      {tagged && v && (
        <span key={`${tag.id}-${tag.text}`} class={`map-tag ${tag.tone ?? ''}`} style={{ left: `${Math.min(sz!.W - 12, Math.max(12, (tagged.x - vx) * s))}px`, top: `${Math.min(sz!.H - 12, Math.max(36, (tagged.y - vy) * s))}px` }}>{tag.text}</span>
      )}
      <div class="map-zoom">
        <button type="button" class="icon-btn" onClick={() => zoomAt(1 / 1.7)} aria-label="Přiblížit">+</button>
        <button type="button" class="icon-btn" onClick={() => zoomAt(1.7)} aria-label="Oddálit">−</button>
        <button type="button" class="icon-btn" onClick={() => sz && flyTo(home(sz))} aria-label="Celá mapa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button>
      </div>
    </div>
  )
}
