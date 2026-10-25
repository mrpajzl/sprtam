import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { ApiError, post } from './api'

// Passkeys in the browser. The server creates every challenge and checks every answer; this only
// hands them to the operating system (Touch ID, Face ID, Windows Hello, a phone, a security key).

export const supported = () => browserSupportsWebAuthn()

function explain(e: unknown): never {
  if (e instanceof ApiError) throw e
  const name = (e as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'AbortError') throw new ApiError(0, 'Ověření bylo zrušené nebo vypršelo. Zkus to znovu.', 'cancelled')
  if (name === 'InvalidStateError') throw new ApiError(0, 'Tenhle klíč už máš zaregistrovaný. Použij jiné zařízení nebo se rovnou přihlas.', 'exists')
  if (name === 'SecurityError') throw new ApiError(0, 'Prohlížeč odmítl klíč pro tuto adresu.', 'security')
  throw new ApiError(0, 'Klíč se nepodařilo použít. Zkus to znovu nebo v jiném prohlížeči.', 'webauthn')
}

export interface Me { id: string; name: string; role: 'admin' | 'moderator' }

/** Sign in (or confirm a sensitive action) with any passkey of an account – no name needed. */
export async function signIn(): Promise<Me> {
  const { challengeId, options } = await post<{ challengeId: string; options: Parameters<typeof startAuthentication>[0]['optionsJSON'] }>('/api/auth/login/options')
  const response = await startAuthentication({ optionsJSON: options }).catch(explain)
  return (await post<{ user: Me }>('/api/auth/login/verify', { challengeId, response })).user
}

/** Create the passkey of an invite (a new account, or a new key for an existing one). */
export async function redeemInvite(token: string): Promise<Me> {
  const { challengeId, options } = await post<{ challengeId: string; options: Parameters<typeof startRegistration>[0]['optionsJSON'] }>('/api/invite/options', { token })
  const response = await startRegistration({ optionsJSON: options }).catch(explain)
  return (await post<{ user: Me }>('/api/invite/verify', { token, challengeId, response })).user
}

/** Add another passkey to the signed-in account. */
export async function addKey() {
  const { challengeId, options } = await post<{ challengeId: string; options: Parameters<typeof startRegistration>[0]['optionsJSON'] }>('/api/me/keys/options')
  const response = await startRegistration({ optionsJSON: options }).catch(explain)
  await post('/api/me/keys/verify', { challengeId, response })
}

/**
 * Runs `f`; when the server asks for a fresh confirmation (code "reauth"), asks for the passkey once and
 * runs `f` again. Used for managing users and keys.
 */
export async function withConfirm<T>(f: () => Promise<T>): Promise<T> {
  try { return await f() } catch (e) {
    if (!(e instanceof ApiError) || e.code !== 'reauth') throw e
    await signIn()
    return f()
  }
}
