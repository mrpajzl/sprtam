import { useCallback, useState } from 'preact/hooks'

// Undo/redo of the whole topic. Typing into one field within a moment counts as one step.

interface H<T> { past: T[]; present: T; future: T[]; group: string; at: number }

export function useHistory<T>(initial: T) {
  const [h, setH] = useState<H<T>>({ past: [], present: initial, future: [], group: '', at: 0 })
  const change = useCallback((f: (v: T) => T, group = '') => setH((s) => {
    const next = f(s.present)
    if (next === s.present) return s
    const now = Date.now()
    const merge = group && group === s.group && now - s.at < 1500
    return { past: merge ? s.past : [...s.past.slice(-199), s.present], present: next, future: [], group, at: now }
  }), [])
  const undo = useCallback(() => setH((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future], group: '', at: 0 } : s)), [])
  const redo = useCallback(() => setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1), group: '', at: 0 } : s)), [])
  const reset = useCallback((v: T) => setH({ past: [], present: v, future: [], group: '', at: 0 }), [])
  return { value: h.present, change, undo, redo, reset, canUndo: h.past.length > 0, canRedo: h.future.length > 0 }
}
