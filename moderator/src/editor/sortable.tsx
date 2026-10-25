import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'

// Reordering cards by dragging their handle (mouse) – the arrow buttons on each card do the same by keyboard.

export function useSortable(onMove: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null)
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<{ i: number; after: boolean } | null>(null)
  const end = () => { setArmed(null); setDrag(null); setOver(null) }
  return {
    handle: (i: number) => ({
      onMouseDown: () => setArmed(i),
      onMouseUp: () => setArmed(null),
      onTouchStart: () => setArmed(i),
    }),
    item: (i: number) => ({
      draggable: armed === i,
      class: `${drag === i ? 'dragging' : ''} ${over?.i === i ? (over.after ? 'drop-after' : 'drop-before') : ''}`,
      onDragStart: (e: DragEvent) => { if (armed !== i) { e.preventDefault(); return } setDrag(i); e.dataTransfer!.effectAllowed = 'move'; e.dataTransfer!.setData('text/plain', String(i)) },
      onDragOver: (e: DragEvent) => {
        if (drag === null) return
        e.preventDefault()
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const after = e.clientY > r.top + r.height / 2
        if (over?.i !== i || over.after !== after) setOver({ i, after })
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        if (drag !== null && over) {
          let to = over.i + (over.after ? 1 : 0)
          if (drag < to) to--
          if (to !== drag) onMove(drag, to)
        }
        end()
      },
      onDragEnd: end,
    }),
  }
}

export function Insert({ onClick, label }: { onClick: () => void; label: string }) {
  return <div class="insert"><button type="button" onClick={onClick} aria-label={label} title={label}>+</button></div>
}

export function Menu<T extends string>({ items, onPick, onClose, title }: { items: { type: T; label: string; hint: string }[]; onPick: (t: T) => void; onClose: () => void; title: string }) {
  return (
    <div class="menu-pop" role="dialog" aria-label={title} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <div class="menu-head"><span class="label">{title}</span><button type="button" class="icon s" onClick={onClose} aria-label="Zavřít">×</button></div>
      <div class="menu-grid">
        {items.map((it, i) => (
          <button type="button" key={it.type} onClick={() => onPick(it.type)} autoFocus={i === 0}>
            <b>{it.label}</b><small>{it.hint}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

export function Card({ children, ...rest }: { children: ComponentChildren } & Record<string, unknown>) {
  return <div {...rest}>{children}</div>
}
