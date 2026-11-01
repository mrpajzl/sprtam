import { useEffect, useRef, useState } from 'preact/hooks'
import { Modal } from './kit'

// Keyboard shortcuts of the work screens (review, reports, verifying): single keys without modifiers, never while
// typing into a field or with a dialog open. "?" lists the screen's shortcuts.

export interface Key { key: string; label: string; run: () => void; when?: boolean }

const typing = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || !!t.closest('[role="listbox"], [role="combobox"]'))
}

/** Binds the keys while the screen is shown; returns the help dialog to render (open with "?"). */
export function useKeys(keys: Key[], title = 'Klávesové zkratky') {
  const [help, setHelp] = useState(false)
  const live = useRef(keys)
  live.current = keys
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || typing(e) || document.querySelector('dialog[open]')) return
      if (e.key === '?') { e.preventDefault(); setHelp(true); return }
      const k = live.current.find((x) => x.when !== false && x.key === e.key.toLowerCase())
      if (k) { e.preventDefault(); k.run() }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])
  return help ? (
    <Modal title={title} onClose={() => setHelp(false)}>
      <dl class="keys-help">
        {keys.map((k) => <div key={k.key}><dt><kbd>{k.key.toUpperCase()}</kbd></dt><dd>{k.label}</dd></div>)}
        <div><dt><kbd>?</kbd></dt><dd>Tahle nápověda</dd></div>
      </dl>
      <p class="fine">Zkratky nefungují, když píšeš do pole.</p>
    </Modal>
  ) : null
}

/** A small hint that the screen has shortcuts (desktop only). */
export const KeysHint = () => <p class="keys-hint wide-only">Tip: zkratky klávesnicí ukáže <kbd>?</kbd></p>

/** Moves the "current" item of a list (J/K) and keeps it in view. */
export function step<T>(list: T[], cur: number, by: number): number {
  if (!list.length) return -1
  return Math.max(0, Math.min(list.length - 1, cur < 0 ? (by > 0 ? 0 : list.length - 1) : cur + by))
}
