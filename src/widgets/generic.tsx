import { useEffect, useMemo, useState } from 'preact/hooks'
import { Inline } from '../ui/Inline'
import { fmt } from './math'

const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])

export function Timeline({ events }: { events: { year: number; label: string }[] }) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events])
  const [on, setOn] = useState(-1)
  const y = (n: number) => (n < 0 ? `${-n} př. n. l.` : `${n}`)
  return (
    <div class="w">
      <div class="tl">
        <div class="tl-track">
          {sorted.map((e, i) => (
            <button key={i} class={`tl-ev ${on === i ? 'on' : ''}`} onClick={() => setOn(i)}>
              <b>{y(e.year)}</b><span><Inline text={e.label} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Flip({ cards }: { cards: { front: string; back: string }[] }) {
  const [on, setOn] = useState<Set<number>>(new Set())
  const toggle = (i: number) => { const n = new Set(on); n.has(i) ? n.delete(i) : n.add(i); setOn(n) }
  return (
    <div class="w">
      <div class="flips">
        {cards.map((c, i) => (
          <button key={i} class={`flip ${on.has(i) ? 'on' : ''}`} onClick={() => toggle(i)} aria-label={on.has(i) ? c.back : c.front}>
            <div><span class="f"><Inline text={c.front} /></span><span class="b"><Inline text={c.back} /></span></div>
          </button>
        ))}
      </div>
      <div class="sub">Klepni na kartu</div>
    </div>
  )
}

export function Sort({ buckets, items }: { buckets: string[]; items: { text: string; b: number }[] }) {
  const pool = useMemo(() => shuffle(items.map((it, i) => ({ ...it, i }))), [items])
  const [placed, setPlaced] = useState<Record<number, number>>({})
  const [sel, setSel] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const left = pool.filter((it) => placed[it.i] === undefined)
  const drop = (bucket: number) => {
    if (sel === null) return
    const it = items[sel]
    if (it.b === bucket) { setPlaced({ ...placed, [sel]: bucket }); setSel(null) }
    else { setWrong(sel); setTimeout(() => setWrong(null), 400) }
  }
  return (
    <div class="w">
      {left.length > 0 ? (
        <div class="chips">
          {left.map((it) => (
            <button key={it.i} class={`chip ${sel === it.i ? 'sel' : ''} ${wrong === it.i ? 'bad' : ''}`} onClick={() => setSel(it.i)}><Inline text={it.text} /></button>
          ))}
        </div>
      ) : <div class="val">✓ Hotovo</div>}
      <div class="buckets" style={{ gridTemplateColumns: `repeat(${Math.min(buckets.length, 3)}, minmax(0, 1fr))` }}>
        {buckets.map((b, bi) => (
          <button key={bi} class={`bucket ${sel !== null ? 'target' : ''}`} onClick={() => drop(bi)}>
            <h4>{b}</h4>
            <div class="chips">{items.map((it, i) => placed[i] === bi && <span key={i} class="chip ok"><Inline text={it.text} /></span>)}</div>
          </button>
        ))}
      </div>
      <div class="sub">{left.length ? (sel === null ? 'Vyber slovo, pak skupinu' : 'Kam to patří?') : ''}</div>
      {!left.length && <div class="ctrls"><button class="reveal" onClick={() => setPlaced({})}>Znovu</button></div>}
    </div>
  )
}

export function Cycle({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => { if (!auto) return; const t = setInterval(() => setI((x) => (x + 1) % steps.length), 2200); return () => clearInterval(t) }, [auto, steps.length])
  const n = steps.length, R = 92, C = 130
  return (
    <div class="w">
      <svg viewBox="0 0 260 260" width="260" onClick={() => { setAuto(false); setI((i + 1) % n) }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line)" stroke-width="6" stroke-dasharray="4 10" />
        {steps.map((_, k) => {
          const a = (k / n) * 2 * Math.PI - Math.PI / 2
          return <circle key={k} cx={C + R * Math.cos(a)} cy={C + R * Math.sin(a)} r={k === i ? 22 : 15} fill={k === i ? 'var(--accent)' : 'var(--accent-soft)'} style={{ transition: 'all 0.3s' }} />
        })}
        {steps.map((_, k) => {
          const a = (k / n) * 2 * Math.PI - Math.PI / 2
          return <text key={k} x={C + R * Math.cos(a)} y={C + R * Math.sin(a) + 6} text-anchor="middle" font-size="16" font-weight="900" fill={k === i ? 'var(--on-accent)' : 'var(--accent-ink)'}>{k + 1}</text>
        })}
        <foreignObject x={C - 60} y={C - 46} width="120" height="92">
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', fontWeight: 800, fontSize: '14px', lineHeight: 1.25 }}><Inline text={steps[i]} /></div>
        </foreignObject>
      </svg>
      <div class="ctrls">
        <button class="reveal" onClick={() => { setAuto(false); setI((i + n - 1) % n) }}>←</button>
        <button class="reveal" onClick={() => { setAuto(false); setI((i + 1) % n) }}>→</button>
      </div>
    </div>
  )
}

const PART_HUE: Record<string, number> = {}
const hueFor = (label: string) => (PART_HUE[label] ??= [350, 210, 140, 35, 280, 180][Object.keys(PART_HUE).length % 6])

export function Parts({ words }: { words: { parts: { text: string; label: string }[] }[] }) {
  const [show, setShow] = useState(false)
  return (
    <div class="w" onClick={() => setShow(!show)}>
      {words.map((w, i) => (
        <div key={i} class={`parts-word ${show ? 'show' : ''}`}>
          {w.parts.map((p, j) => (
            <button key={j} style={{ color: `hsl(${hueFor(p.label)} 70% 45%)`, background: show ? `hsl(${hueFor(p.label)} 80% 50% / 0.12)` : 'transparent' }}>
              <span>{p.text}</span><small>{p.label}</small>
            </button>
          ))}
        </div>
      ))}
      <div class="sub">{show ? '' : 'Klepni a uvidíš části'}</div>
    </div>
  )
}

export function Gap({ items }: { items: { before: string; after: string; options: string[]; a: number }[] }) {
  const [got, setGot] = useState<Record<number, boolean>>({})
  const [bad, setBad] = useState<string | null>(null)
  return (
    <div class="w" style={{ gap: 18 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gap: 8 }}>
          <div class="gap-row">
            <span>{it.before}<span class={`hole ${got[i] ? 'ok' : ''}`}>{got[i] ? it.options[it.a] : '?'}</span>{it.after}</span>
          </div>
          {!got[i] && (
            <div class="chips">
              {it.options.map((o, k) => (
                <button key={k} class={`chip ${bad === `${i}-${k}` ? 'bad' : ''}`} onClick={() => {
                  if (k === it.a) setGot({ ...got, [i]: true })
                  else { setBad(`${i}-${k}`); setTimeout(() => setBad(null), 400) }
                }}>{o}</button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function Bars({ unit, items }: { unit?: string; items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1)
  const [grow, setGrow] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setGrow(true)); return () => cancelAnimationFrame(t) }, [])
  return (
    <div class="w">
      <div class="bars-list">
        {items.map((it, i) => (
          <div key={i} class="bar-row">
            <span><Inline text={it.label} /></span>
            <div class="track"><div class="fill" style={{ width: grow ? `${Math.max(2, (Math.abs(it.value) / max) * 100)}%` : '0%' }} /></div>
            <b>{fmt(it.value)}{unit ? ` ${unit}` : ''}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
