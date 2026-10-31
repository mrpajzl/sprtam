import { type ComponentChildren, Fragment } from 'preact'
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { ICheck, IChevron, ISearch } from './icons'

// Our own dropdown instead of the system <select> (the app and the moderation, styles in ui/select.css): the
// options can carry an icon (an emoji, or an SVG such as a subject glyph or an obor glyph) and a second line,
// and a long list gets a search field. Keyboard as the system one: arrows, Home/End, Enter, Esc, and typing jumps to an
// option. The list opens in the top layer (popover), so a sheet or a dialog around it never clips it.

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  /** A second, smaller line under the label. */
  hint?: string
  /** An emoji (a string) or an SVG element. */
  icon?: ComponentChildren
  /** More words the search finds the option by. */
  keywords?: string
  /** A heading over a run of options (like <optgroup>). */
  group?: string
  disabled?: boolean
}

interface Props<T extends string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** What is picked (the accessible name; also the search placeholder's subject). */
  label: string
  /** Shown when no option has the value. */
  placeholder?: string
  /** The search field; by default when there are more than SEARCH_FROM options. */
  search?: boolean
  class?: string
  disabled?: boolean
  title?: string
  /** For a <form>: a hidden input with the value. */
  name?: string
  /** The trigger's content instead of the picked option (e.g. a settings row). */
  children?: (picked: SelectOption<T> | undefined) => ComponentChildren
}

const SEARCH_FROM = 8
const GAP = 6, EDGE = 8, MAX_H = 380

/** Lower case without diacritics, so "skola" finds "Škola". */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const coarse = () => matchMedia('(pointer: coarse)').matches
const canPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype
let seq = 0

export function OptionIcon({ icon }: { icon: ComponentChildren }) {
  return <span class={`sel-ic ${typeof icon === 'string' ? 'is-em' : 'svg'}`} aria-hidden="true">{icon}</span>
}

export function Select<T extends string>(p: Props<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState<Record<string, string>>({})
  const id = useMemo(() => `sel${++seq}`, [])
  const root = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const typed = useRef({ s: '', t: 0 })
  const optId = (i: number) => `${id}-o${i}`

  const picked = p.options.find((o) => o.value === p.value)
  const searchable = p.search ?? p.options.length > SEARCH_FROM
  const filter = (query: string) => {
    const q = fold(query.trim())
    if (!q) return p.options
    const words = q.split(/\s+/)
    return p.options.filter((o) => {
      const hay = fold(`${o.label} ${o.hint ?? ''} ${o.keywords ?? ''} ${o.value}`)
      return words.every((w) => hay.includes(w))
    })
  }
  const shown = useMemo(() => filter(query), [p.options, query])

  const place = () => {
    const b = root.current?.getBoundingClientRect()
    if (!b) return
    const vw = document.documentElement.clientWidth
    const vh = window.visualViewport?.height ?? innerHeight
    const width = Math.min(Math.max(b.width, 248), vw - 2 * EDGE)
    const left = Math.min(Math.max(b.left, EDGE), vw - width - EDGE)
    const below = vh - b.bottom - GAP - EDGE, above = b.top - GAP - EDGE
    const up = below < 240 && above > below
    setPos({
      left: `${left}px`, width: `${width}px`, 'max-height': `${Math.min(MAX_H, up ? above : below)}px`,
      ...(up ? { bottom: `${vh - b.top + GAP}px`, top: 'auto' } : { top: `${b.bottom + GAP}px`, bottom: 'auto' }),
    })
  }

  const show = () => {
    if (p.disabled) return
    setQuery('')
    setActive(Math.max(0, p.options.findIndex((o) => o.value === p.value)))
    place()
    setOpen(true)
  }
  const hide = (focusBack: boolean) => {
    setOpen(false)
    if (focusBack) root.current?.focus()
  }
  const choose = (o: SelectOption<T> | undefined) => {
    if (!o || o.disabled) return
    hide(true)
    if (o.value !== p.value) p.onChange(o.value)
  }

  // Into the top layer (over a modal dialog too) and focus where the keys go.
  useLayoutEffect(() => {
    const el = panel.current
    if (!open || !el) return
    if (canPopover && !el.matches(':popover-open')) el.showPopover()
    // On a touch screen the search field waits for a tap: the keyboard would cover half the list.
    ;(searchable && !coarse() ? input.current : list.current)?.focus({ preventScroll: true })
    reveal('center')
    return () => { if (canPopover && el.isConnected && el.matches(':popover-open')) el.hidePopover() }
  }, [open])

  // On a touch screen nothing behind the open list scrolls (the page, a sheet around the trigger): a swipe in the
  // list would otherwise also move the sheet, and the list with it. Touch moves outside the list's own scrolling
  // (the search field, the list at its end) go nowhere. (A mouse wheel stays in the list by overscroll-behavior;
  // locking there would make the scrollbars jump.)
  useLayoutEffect(() => {
    const el = panel.current
    if (!open || !el || !coarse()) return
    const locked: [HTMLElement, string][] = []
    for (let n = root.current?.parentElement; n; n = n.parentElement) {
      const o = getComputedStyle(n).overflowY
      if (n === document.documentElement || n === document.body || o === 'auto' || o === 'scroll') locked.push([n, n.style.overflow])
    }
    for (const [n] of locked) n.style.overflow = 'hidden'
    let y = 0
    const start = (e: TouchEvent) => { y = e.touches[0].clientY }
    const move = (e: TouchEvent) => {
      const l = list.current
      const dy = e.touches[0].clientY - y
      y = e.touches[0].clientY
      const inList = l && l.contains(e.target as Node) && l.scrollHeight > l.clientHeight
      const atEnd = l && ((dy > 0 && l.scrollTop <= 0) || (dy < 0 && l.scrollTop + l.clientHeight >= l.scrollHeight - 1))
      if (!inList || atEnd) e.preventDefault()
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    return () => {
      for (const [n, o] of locked) n.style.overflow = o
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
    }
  }, [open])

  // Follow the trigger while the page scrolls or the keyboard resizes it; a click outside closes. (Layout effect:
  // in place before the next click, however quick.)
  useLayoutEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !root.current?.contains(t)) hide(false)
    }
    const moved = (e: Event) => { if (!panel.current?.contains(e.target as Node)) place() }
    const vv = window.visualViewport
    addEventListener('scroll', moved, true)
    addEventListener('resize', place)
    vv?.addEventListener('resize', place)
    document.addEventListener('pointerdown', out, true)
    return () => {
      removeEventListener('scroll', moved, true)
      removeEventListener('resize', place)
      vv?.removeEventListener('resize', place)
      document.removeEventListener('pointerdown', out, true)
    }
  }, [open])

  /** Scrolls the list (only the list – scrollIntoView would move a sheet around it too) to the active option. */
  const reveal = (how: 'nearest' | 'center', i = active) => {
    const l = list.current, o = i >= 0 ? l?.querySelector<HTMLElement>(`#${optId(i)}`) : null
    if (!l || !o) return
    const top = o.offsetTop, bottom = top + o.offsetHeight
    if (how === 'center') l.scrollTop = top - (l.clientHeight - o.offsetHeight) / 2
    else if (top < l.scrollTop) l.scrollTop = top - 4
    else if (bottom > l.scrollTop + l.clientHeight) l.scrollTop = bottom - l.clientHeight + 4
  }
  /** Moves the active option by keys and keeps it in sight. */
  const go = (i: number) => { setActive(i); reveal('nearest', i) }

  const step = (from: number, d: 1 | -1) => {
    for (let i = from + d; i >= 0 && i < shown.length; i += d) if (!shown[i].disabled) return i
    return from
  }

  const onKey = (e: KeyboardEvent) => {
    const k = e.key
    let handled = true
    if (k === 'ArrowDown') go(step(active, 1))
    else if (k === 'ArrowUp') go(step(active, -1))
    else if (k === 'Home' && !searchable) go(step(-1, 1))
    else if (k === 'End' && !searchable) go(step(shown.length, -1))
    else if (k === 'PageDown') go(step(Math.min(active + 7, shown.length), -1))
    else if (k === 'PageUp') go(step(Math.max(active - 7, -1), 1))
    else if (k === 'Enter' || (k === ' ' && !searchable)) choose(shown[active])
    // Esc closes only the list, not a dialog around it.
    else if (k === 'Escape') hide(true)
    else if (k === 'Tab') { hide(false); handled = false }
    else if (!searchable && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now(), t = typed.current
      t.s = now - t.t > 700 ? k : t.s + k
      t.t = now
      const s = fold(t.s)
      const i = shown.findIndex((o) => !o.disabled && fold(o.label).replace(/^\P{L}+/u, '').startsWith(s))
      if (i >= 0) go(i)
    } else handled = false
    if (handled) e.preventDefault()
    // The app's own keys (quiz shortcuts, a sheet's handlers) do not see typing in the list.
    e.stopPropagation()
  }

  const onTriggerKey = (e: KeyboardEvent) => {
    if (open || p.disabled) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show() }
  }

  const name = picked ? `${p.label}: ${picked.label}` : p.label
  const listId = `${id}-l`

  return (
    <>
      <button
        ref={root} type="button" class={`sel ${p.class ?? ''} ${open ? 'open' : ''}`} disabled={p.disabled} title={p.title}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-label={name}
        onClick={(e) => { e.stopPropagation(); open ? hide(true) : show() }} onKeyDown={onTriggerKey}
      >
        {p.children ? p.children(picked) : (
          <>
            {picked?.icon != null && <OptionIcon icon={picked.icon} />}
            <span class={`sel-val ${picked ? '' : 'none'}`}>{picked?.label ?? p.placeholder ?? 'Vyber'}</span>
            <span class="sel-chev" aria-hidden="true"><IChevron /></span>
          </>
        )}
      </button>
      {p.name && <input type="hidden" name={p.name} value={p.value} />}
      {open && (
        <div
          ref={panel} class="sel-panel" popover={canPopover ? 'manual' : undefined} style={pos}
          onKeyDown={onKey} onClick={(e) => e.stopPropagation()}
        >
          {searchable && (
            <label class="sel-search">
              <ISearch />
              <input
                ref={input} type="text" inputMode="search" enterKeyHint="search" value={query} placeholder="Hledat…" autocomplete="off" spellcheck={false}
                role="combobox" aria-label={`Hledat: ${p.label}`} aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? optId(active) : undefined}
                onInput={(e) => {
                  // The first match is active at once, so Enter right after typing picks it.
                  const q = e.currentTarget.value
                  setQuery(q)
                  setActive(filter(q).findIndex((o) => !o.disabled))
                  if (list.current) list.current.scrollTop = 0
                }}
              />
            </label>
          )}
          <ul
            ref={list} id={listId} class="sel-list" role="listbox" aria-label={p.label} tabIndex={-1}
            aria-activedescendant={active >= 0 ? optId(active) : undefined}
          >
            {shown.map((o, i) => {
              const on = o.value === p.value
              const head = o.group && o.group !== shown[i - 1]?.group
              return (
                <Fragment key={o.value}>
                {head && <li class="sel-group" role="presentation">{o.group}</li>}
                <li
                  id={optId(i)} role="option" aria-selected={on} aria-disabled={o.disabled || undefined}
                  class={`sel-opt ${i === active ? 'act' : ''} ${on ? 'on' : ''}`}
                  onPointerMove={(e) => { if (e.pointerType === 'mouse' && !o.disabled && i !== active) setActive(i) }}
                  onClick={() => choose(o)}
                >
                  {o.icon != null && <OptionIcon icon={o.icon} />}
                  <span class="sel-txt"><b>{o.label}</b>{o.hint && <small>{o.hint}</small>}</span>
                  <span class="sel-tick" aria-hidden="true">{on && <ICheck />}</span>
                </li>
                </Fragment>
              )
            })}
          </ul>
          {!shown.length && <p class="sel-empty" role="status">Nic takového tu není.</p>}
        </div>
      )}
    </>
  )
}
