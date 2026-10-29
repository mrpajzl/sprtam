import { useEffect, useState } from 'preact/hooks'
import { freeze } from './progress/freeze'

// Kdo se učí? Several pupils on one device (a family tablet), each with their own progress. There are no accounts:
// a profile is just a name and an emoji in this browser (localStorage, never sent anywhere).
//
// The active profile keeps its data in the usual keys (PROFILE_KEYS), so the rest of the app knows nothing about
// profiles. The others are parked under `sprtam:profile:<id>` (a JSON object of those keys). Switching parks the
// active one, unparks the chosen one and reloads the page. Device settings (theme, reading) are shared.
// Without a second profile there is no registry at all and nothing changes.

const REG = 'sprtam:profiles'
/** Set while switching: other tabs stop saving at once and reload when it is gone. */
const SWITCHING = 'sprtam:switching'
const parked = (id: string) => `sprtam:profile:${id}`
/** What belongs to a pupil: progress (with plans), the unfinished round, Slepá mapa records, obor and school. */
export const PROFILE_KEYS = ['sprtam:progress', 'sprtam:resume', 'sprtam:mapy', 'sprtam:prvky', 'sprtam-obor', 'sprtam-approach']

export const AVATARS = ['🦊', '🐻', '🐼', '🐸', '🦄', '🐙', '🐝', '🦉', '🐢', '🐬', '🦖', '🚀']
export const MAX_PROFILES = 8
export const NAME_MAX = 24

export interface Profile { id: string; n: string; e: string }
export interface Profiles { a: string; l: Profile[] }

export function getProfiles(): Profiles | undefined {
  try {
    const r = JSON.parse(localStorage.getItem(REG) ?? 'null') as Profiles | null
    if (r && Array.isArray(r.l) && r.l.length > 1 && r.l.some((x) => x.id === r.a)) return r
  } catch { /* none */ }
  return undefined
}

export const activeProfile = () => { const r = getProfiles(); return r?.l.find((x) => x.id === r.a) }

const newId = () => Math.random().toString(36).slice(2, 8)
const clean = (n: string) => n.trim().replace(/\s+/g, ' ').slice(0, NAME_MAX)
const write = (r: Profiles | undefined) => { if (r) localStorage.setItem(REG, JSON.stringify(r)); else localStorage.removeItem(REG) }

/** A pupil more. The first time also names whoever has been learning here so far (`me`). */
export function addProfile(n: string, e: string, me?: { n: string; e: string }) {
  const r = getProfiles() ?? { a: newId(), l: [] }
  if (!r.l.length) r.l.push({ id: r.a, n: clean(me?.n ?? '') || 'Já', e: me?.e ?? AVATARS[0] })
  if (r.l.length >= MAX_PROFILES) return
  r.l.push({ id: newId(), n: clean(n) || `Profil ${r.l.length + 1}`, e })
  write(r)
  ping()
}

export function editProfile(id: string, n: string, e: string) {
  const r = getProfiles()
  if (!r) return
  write({ ...r, l: r.l.map((x) => (x.id === id ? { ...x, n: clean(n) || x.n, e } : x)) })
  ping()
}

/** Delete another profile with all its progress. The last one left becomes the device's only pupil again. */
export function removeProfile(id: string) {
  const r = getProfiles()
  if (!r || id === r.a) return
  localStorage.removeItem(parked(id))
  const l = r.l.filter((x) => x.id !== id)
  write(l.length > 1 ? { ...r, l } : undefined)
  ping()
}

/** Park the active pupil's data, bring the chosen one's back and start the app again with it. False if it could not be done. */
export function switchProfile(id: string): boolean {
  const r = getProfiles()
  if (!r || id === r.a || !r.l.some((x) => x.id === id)) return false
  freeze()
  const mine: Record<string, string> = {}
  for (const k of PROFILE_KEYS) { const v = localStorage.getItem(k); if (v !== null) mine[k] = v }
  const put = (data: Record<string, string>) => { for (const k of PROFILE_KEYS) { if (typeof data[k] === 'string') localStorage.setItem(k, data[k]); else localStorage.removeItem(k) } }
  let theirs: Record<string, string> = {}
  try { theirs = JSON.parse(localStorage.getItem(parked(id)) ?? '{}') ?? {} } catch { /* broken: start empty */ }
  try {
    localStorage.setItem(SWITCHING, String(Date.now()))
    localStorage.setItem(parked(r.a), JSON.stringify(mine))
    put(theirs)
    write({ ...r, a: id })
  } catch {
    // Storage full: put everything back as it was.
    try { localStorage.removeItem(parked(r.a)); put(mine); write(r) } catch { /* nothing more to do */ }
    localStorage.removeItem(SWITCHING)
    location.reload()
    return false
  }
  localStorage.removeItem(parked(id))
  localStorage.removeItem(SWITCHING)
  location.assign('/')
  return true
}

const subs = new Set<() => void>()
const ping = () => subs.forEach((f) => f())

// Another tab is switching the pupil: stop saving here at once (this tab would put the previous one's progress into
// the next one's) and start again with the new pupil once it is done.
addEventListener('storage', (e) => {
  if (e.key === SWITCHING) { if (e.newValue) freeze(); else location.reload() }
  else if (e.key === REG) ping()
})

export function useProfiles(): Profiles | undefined {
  const [, force] = useState(0)
  useEffect(() => { const f = () => force((x) => x + 1); subs.add(f); return () => { subs.delete(f) } }, [])
  return getProfiles()
}
