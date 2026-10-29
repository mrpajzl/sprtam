import { useEffect, useRef } from 'preact/hooks'
import { getReading } from '../reading'

// Keyboard shortcuts of practice (1–9 pick an answer, H a hint, Enter goes on…). Keys never fire while typing,
// with a modifier held or while a dialog is open (e.g. Nahlásit chybu): those keys belong to the field or the dialog.
// They can be turned off (Nastavení → Ovládání): speech input may type a digit (WCAG 2.1.4).

export const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)

/** Enter and Space on a focused button or link already click it. */
export const onControl = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('button, a, summary')

/** `handler` returns true when it used the key (then the browser's default is prevented). The latest handler is used. */
export function useKeys(handler: (e: KeyboardEvent) => boolean | void, active = true) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => {
      if (e.defaultPrevented || getReading().nokeys || e.ctrlKey || e.metaKey || e.altKey || e.repeat || isTyping(e.target) || document.querySelector('dialog[open]')) return
      if (ref.current(e)) e.preventDefault()
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [active])
}

/** The digit of a key press 1–9 (also on the numeric keypad), else 0. */
export const digit = (e: KeyboardEvent) => (/^Digit[1-9]$|^Numpad[1-9]$/.test(e.code) ? Number(e.code.at(-1)) : /^[1-9]$/.test(e.key) ? Number(e.key) : 0)
