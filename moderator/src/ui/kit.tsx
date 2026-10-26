import type { ButtonHTMLAttributes, ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

// Small shared pieces of the moderation UI: icons, modal, toasts, time formatting.

const P = (d: string) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={d} /></svg>
)
export const I = {
  plus: P('M12 5v14M5 12h14'),
  up: P('M12 19V5M6 11l6-6 6 6'),
  down: P('M12 5v14M6 13l6 6 6-6'),
  copy: P('M9 9h11v11H9zM5 15H4V4h11v1'),
  trash: P('M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3'),
  grip: P('M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01'),
  back: P('M15 5l-7 7 7 7'),
  close: P('M6 6l12 12M18 6L6 18'),
  check: P('M5 12.5l4.5 4.5L19 7.5'),
  undo: P('M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3'),
  redo: P('M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3'),
  send: P('M4 12l16-8-6 16-2.5-6.5z'),
  key: P('M15 7a4 4 0 1 1-3.9 4.8L4 19v-3h3v-3h3l1.2-1.2A4 4 0 0 1 15 7zM16 9.5h.01'),
  user: P('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'),
  users: P('M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18.5 14.5A7 7 0 0 1 22 21'),
  book: P('M4 5.5C7 4.2 9.7 4.5 12 6.5v13c-2.3-2-5-2.3-8-1zM20 5.5c-3-1.3-5.7-1-8 1v13c2.3-2 5-2.3 8-1z'),
  inbox: P('M4 13h4l1.5 3h5L16 13h4M5 5h14l1 8v6H4v-6z'),
  search: P('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20'),
  external: P('M14 4h6v6M20 4l-9 9M18 14v6H4V6h6'),
  eye: P('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'),
  sun: P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'),
  moon: P('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'),
  warn: P('M12 4l9 16H3zM12 10v4M12 17.5h.01'),
  lock: P('M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3'),
  logout: P('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10'),
  left: P('M15 5l-7 7 7 7'),
  right: P('M9 5l7 7-7 7'),
  play: P('M7 4l13 8-13 8z'),
  refresh: P('M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4'),
  bold: P('M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z'),
  italic: P('M10 5h8M6 19h8M14 5l-4 14'),
  pencil: P('M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4'),
  list: P('M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01'),
  more: P('M5 12h.01M12 12h.01M19 12h.01'),
  phone: P('M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2'),
  bulb: P('M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z'),
  layers: P('M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5'),
}

export function Modal({ title, onClose, children, wide, actions }: { title: string; onClose: () => void; children: ComponentChildren; wide?: boolean; actions?: ComponentChildren }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current!
    d.showModal()
    const first = d.querySelector<HTMLElement>('[autofocus], input, textarea, select')
    first?.focus()
    return () => d.close()
  }, [])
  return (
    <dialog ref={ref} class={`modal ${wide ? 'wide' : ''}`} onCancel={(e) => { e.preventDefault(); onClose() }} onClick={(e) => { if (e.target === ref.current) onClose() }}>
      <div class="modal-in">
        <header><h2>{title}</h2><button class="icon" onClick={onClose} aria-label="Zavřít"><I.close /></button></header>
        <div class="modal-body">{children}</div>
        {actions && <footer>{actions}</footer>}
      </div>
    </dialog>
  )
}

// ——— Toasts ———

interface Toast { id: number; text: string; kind: 'ok' | 'bad' | 'info'; action?: { label: string; run: () => void } }
let push: ((t: Omit<Toast, 'id'>) => void) | undefined
export const toast = (text: string, kind: Toast['kind'] = 'ok', action?: Toast['action']) => push?.({ text, kind, action })

export function Toasts() {
  const [list, setList] = useState<Toast[]>([])
  useEffect(() => {
    let n = 0
    push = (t) => {
      const id = ++n
      setList((l) => [...l.slice(-3), { ...t, id }])
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), t.kind === 'bad' ? 9000 : 5000)
    }
    return () => { push = undefined }
  }, [])
  return (
    <div class="toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} class={`toast ${t.kind}`}>
          <span>{t.text}</span>
          {t.action && <button onClick={() => { t.action!.run(); setList((l) => l.filter((x) => x.id !== t.id)) }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  )
}

// ——— Formatting ———

const rtf = new Intl.RelativeTimeFormat('cs', { numeric: 'auto' })
export function ago(t: number | null | undefined): string {
  if (!t) return '–'
  const s = (t - Date.now()) / 1000
  const a = Math.abs(s)
  if (a < 45) return 'právě teď'
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), 'day')
  return new Date(t).toLocaleDateString('cs')
}
export const dateTime = (t: number) => new Date(t).toLocaleString('cs', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Copies text and says so. */
export function copy(text: string, what = 'Zkopírováno') {
  navigator.clipboard?.writeText(text).then(() => toast(what), () => toast('Kopírování se nepovedlo – označ text a zkopíruj ho ručně.', 'bad'))
}

export function Busy({ on, children, ...rest }: ButtonHTMLAttributes & { on: boolean }) {
  return <button {...rest} disabled={on || rest.disabled} aria-busy={on}>{on ? <span class="spin" aria-hidden="true" /> : null}{children}</button>
}

export function Empty({ children }: { children: ComponentChildren }) {
  return <div class="empty-state">{children}</div>
}
