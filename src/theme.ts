import { useState } from 'preact/hooks'

// Light by default; dark only when the user picks it. index.html applies the
// saved choice before first paint, this keeps it in sync afterwards.
export type Theme = 'light' | 'dark'

const KEY = 'sprtam-theme'
const BG: Record<Theme, string> = { light: '#e6e7e9', dark: '#111214' }

const read = (): Theme => { try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' } }

export function setTheme(t: Theme) {
  try { localStorage.setItem(KEY, t) } catch { /* private mode */ }
  apply(t)
}

function apply(t: Theme) {
  const root = document.documentElement
  if (t === 'dark') root.dataset.theme = 'dark'
  else delete root.dataset.theme
  document.querySelector<HTMLMetaElement>('meta[name=theme-color]')?.setAttribute('content', BG[t])
}

export function useTheme() {
  const [theme, set] = useState(read)
  const toggle = () => {
    const t: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    set(t)
  }
  const choose = (t: Theme) => { setTheme(t); set(t) }
  return [theme, toggle, choose] as const
}
