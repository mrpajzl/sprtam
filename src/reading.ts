import { useState } from 'preact/hooks'

// Easier reading (Nastavení → Čtení): bigger text, more space between lines and letters, a typeface made for
// legibility and whether practice answers to single keys (Nastavení → Ovládání). A device setting like the theme (localStorage, never sent anywhere). public/theme-init.js applies
// the saved choice before first paint, this keeps it in sync afterwards. The CSS is in styles.css ([data-text] …).

export interface Reading {
  /** Text size: 0 normal, 1 bigger, 2 biggest. */
  size: 0 | 1 | 2
  /** More space between lines and letters. */
  wide: boolean
  /** Atkinson Hyperlegible Next instead of Nunito: letters that are hard to mistake (b/d, I/l/1). */
  legible: boolean
  /** Single-key shortcuts in practice turned off (speech input could set them off: WCAG 2.1.4). */
  nokeys: boolean
}

const KEY = 'sprtam-reading'
export const READING_DEFAULT: Reading = { size: 0, wide: false, legible: false, nokeys: false }

export function getReading(): Reading {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {}
    return { size: r.size === 1 || r.size === 2 ? r.size : 0, wide: r.wide === true, legible: r.legible === true, nokeys: r.nokeys === true }
  } catch { return READING_DEFAULT }
}

/** Mirrors public/theme-init.js. */
export function applyReading(r: Reading) {
  const d = document.documentElement.dataset
  if (r.size) d.text = String(r.size); else delete d.text
  if (r.wide) d.spacing = 'wide'; else delete d.spacing
  if (r.legible) d.font = 'legible'; else delete d.font
  if (r.nokeys) d.keys = 'off'; else delete d.keys
}

export function setReading(r: Reading) {
  try {
    if (!r.size && !r.wide && !r.legible && !r.nokeys) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(r))
  } catch { /* private mode: for this visit only */ }
  applyReading(r)
}

export function useReading() {
  const [r, set] = useState(getReading)
  const change = (patch: Partial<Reading>) => { const next = { ...r, ...patch }; setReading(next); set(next) }
  return [r, change] as const
}
