import { useEffect, useRef } from 'preact/hooks'
import type { ElementSet } from '.'
import { shownOf } from '.'
import type { Element } from './elements'

// The blind periodic table of the game Periodická tabulka: cells without symbols (an answered one shows its symbol),
// group and period numbers around. Same grid as the widget periodic (src/widgets/periodic.tsx, its CSS).

const compactCol = (g: number) => (g <= 2 ? g : g - 10)

/** Where a hidden cell is, for screen readers: „3. perioda, 1. skupina“, „řada lanthanoidů, 1. pole“. */
export const cellPlace = (e: Element) => (e.row > 7 ? `řada ${e.row === 8 ? 'lanthanoidů' : 'aktinoidů'}, ${e.col - 2}. pole` : `${e.period}. perioda, ${e.group}. skupina`)

export function BlindTable({ set, marks, open, focus, onPick, label }: {
  set: ElementSet
  /** Class per Z: ok, miss, pick (asked about), show (the answer), bad (a wrong tap). */
  marks: Record<number, string>
  /** Cells that show their symbol. */
  open: Set<number>
  /** A cell to scroll into view (the asked one in „Poznáš prvek?“). */
  focus?: number | null
  onPick?: (z: number) => void
  label: string
}) {
  const els = shownOf(set)
  const compact = set.compact
  const asked = new Set(set.zs)
  const periods = els[els.length - 1].period
  const groups = compact ? [1, 2, 13, 14, 15, 16, 17, 18] : Array.from({ length: 18 }, (_, i) => i + 1)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cell = focus && scroller.current?.querySelector<HTMLElement>(`[data-z="${focus}"]`)
    if (cell) cell.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [focus])
  return (
    <div class="periodic-scroll el-table" ref={scroller}>
      <div class={`periodic-grid ${compact ? 'compact' : ''}`} style={{ gridTemplateColumns: `1.1em repeat(${groups.length}, 1fr)` }} role="group" aria-label={label}>
        {groups.map((g, i) => <span key={`g${g}`} class="periodic-head" style={{ gridColumn: String(i + 2), gridRow: '1' }}>{g}</span>)}
        {Array.from({ length: periods }, (_, i) => <span key={`p${i}`} class="periodic-head" style={{ gridColumn: '1', gridRow: String(i + 2) }}>{i + 1}</span>)}
        {!compact && <span class="periodic-gap" style={{ gridColumn: '4', gridRow: '7' }} aria-hidden="true">57–71</span>}
        {!compact && <span class="periodic-gap" style={{ gridColumn: '4', gridRow: '8' }} aria-hidden="true">89–103</span>}
        {els.map((e) => {
          const shown = open.has(e.z)
          return (
            <button
              key={e.z}
              type="button"
              data-z={e.z}
              class={`periodic-el blind ${asked.has(e.z) ? '' : 'ctx'} ${marks[e.z] ?? ''} ${e.row === 8 ? 'frow' : ''}`}
              style={{ gridColumn: String((compact ? compactCol(e.col) : e.col) + 1), gridRow: String(e.row <= 7 ? e.row + 1 : e.row + 2) }}
              onClick={() => onPick?.(e.z)}
              aria-label={shown ? `${e.name}, ${e.symbol}` : cellPlace(e)}
              aria-current={marks[e.z]?.includes('pick') ? 'true' : undefined}
            >
              {shown && <b>{e.symbol}</b>}
            </button>
          )
        })}
      </div>
      {!compact && <p class="muted el-scroll-hint">Tabulku posuneš prstem do strany.</p>}
    </div>
  )
}
