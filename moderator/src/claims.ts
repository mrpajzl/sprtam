import { useEffect, useState } from 'preact/hooks'
import { ApiError, api, get, post } from './api'
import { toast } from './ui/kit'

// "Beru si to" (moderator/server/claims.ts): who is working on which report or unverified topic. One small list,
// loaded once and refreshed after every change of it.

export interface Claim { kind: 'report' | 'topic'; ref: string; userId: string; name: string; until: number }

let cached: Promise<Claim[]> | undefined
const listeners = new Set<() => void>()
const load = () => (cached ??= get<Claim[]>('/api/claims').catch((e) => { cached = undefined; throw e }))
const refresh = () => { cached = undefined; listeners.forEach((f) => f()) }

export function useClaims(on = true): Claim[] {
  const [v, set] = useState<Claim[]>([])
  useEffect(() => {
    if (!on) return
    const f = () => { load().then(set, () => {}) }
    f()
    listeners.add(f)
    return () => { listeners.delete(f) }
  }, [on])
  return v
}

export const claimOf = (list: Claim[], kind: Claim['kind'], ref: string) => list.find((c) => c.kind === kind && c.ref === ref)

/** Takes a claim (says so); false when somebody else has it. */
export async function take(kind: Claim['kind'], ref: string): Promise<boolean> {
  try { await post('/api/claims', { kind, ref }); refresh(); toast('Máš to zamluvené na 2 dny. Ostatní uvidí, že na tom pracuješ.'); return true }
  catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad'); refresh(); return false }
}

export async function release(kind: Claim['kind'], ref: string) {
  try { await api('DELETE', `/api/claims/${kind}/${encodeURIComponent(ref)}`); refresh(); toast('Uvolněno.') }
  catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad') }
}

export const refreshClaims = refresh

/** "do čtvrtka 14:00" */
export const untilText = (t: number) => new Date(t).toLocaleString('cs', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
