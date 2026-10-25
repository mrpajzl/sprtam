// Talking to the moderation server: JSON in and out, Czech error messages from the server,
// and one place that reacts to an expired session or a needed passkey confirmation.

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public data: Record<string, unknown> = {}) { super(message) }
}

type Listener = (e: ApiError) => void
const listeners = new Set<Listener>()
/** Called for every 401 (signed out) – the app shows the login screen. */
export const onSignedOut = (f: Listener) => { listeners.add(f); return () => listeners.delete(f) }

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Není spojení se serverem. Zkontroluj internet.', 'offline')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = new ApiError(res.status, data.error ?? `Chyba ${res.status}`, data.code, data)
    if (res.status === 401 && data.code === 'login') listeners.forEach((f) => f(e))
    throw e
  }
  return data as T
}

export const get = <T,>(path: string) => api<T>('GET', path)
export const post = <T,>(path: string, body: unknown = {}) => api<T>('POST', path, body)
