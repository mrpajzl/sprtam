import { useEffect, useState } from 'preact/hooks'

// Best results of the games (Slepá mapa, Periodická tabulka): one localStorage key per game holding the best
// result 0–100 per round, e.g. `evropa/najdi`. They stay in this device only, like the rest of the progress
// (docs/SOUKROMI.md).

export type Best = Record<string, number>

export function records(key: string) {
  const get = (): Best => {
    try { return JSON.parse(localStorage.getItem(key) ?? '{}') ?? {} } catch { return {} }
  }
  /** Saves a result; true = a new record. */
  const save = (round: string, pct: number): boolean => {
    const b = get()
    if ((b[round] ?? -1) >= pct) return false
    b[round] = pct
    try { localStorage.setItem(key, JSON.stringify(b)) } catch { /* private mode: no records */ }
    dispatchEvent(new Event(key))
    return true
  }
  const use = (): Best => {
    const [b, set] = useState(get)
    useEffect(() => {
      const on = () => set(get())
      addEventListener(key, on)
      addEventListener('storage', on)
      return () => { removeEventListener(key, on); removeEventListener('storage', on) }
    }, [])
    return b
  }
  return { get, save, use }
}
