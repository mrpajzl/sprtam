import { useEffect, useState } from 'preact/hooks'
import { ApiError, post } from '../api'
import { redeemInvite, supported, type Me } from '../passkey'
import { Busy, I } from '../ui/kit'

interface Info { kind: 'user' | 'key'; name: string; role: string; expiresAt: number }

/** /pozvanka#<token>: the token stays in the fragment, which browsers never send anywhere. */
export function Invite({ onDone }: { onDone: (u: Me) => void }) {
  const [token] = useState(() => location.hash.slice(1))
  const [info, setInfo] = useState<Info | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    // Keep the token out of the address bar (history, screenshots) once read.
    history.replaceState(null, '', '/pozvanka')
    if (!token) { setError('Odkaz pozvánky je neúplný. Otevři ho celý tak, jak ti přišel.'); return }
    post<Info>('/api/invite/info', { token }).then(setInfo, (e) => setError(e instanceof ApiError ? e.message : 'Pozvánku se nepodařilo ověřit.'))
  }, [])
  const create = async () => {
    setBusy(true); setError('')
    try { onDone(await redeemInvite(token)) } catch (e) { setError(e instanceof ApiError ? e.message : 'Klíč se nepodařilo vytvořit.') } finally { setBusy(false) }
  }
  return (
    <div class="gate">
      <div class="gate-card">
        <div class="brand big"><b>šprtám</b><span>moderace</span></div>
        {info ? (
          <>
            <h1>{info.kind === 'user' ? `Vítej, ${info.name}!` : `Nový klíč pro ${info.name}`}</h1>
            <p class="muted">
              {info.kind === 'user' ? 'Byl/a jsi pozván/a k úpravám učiva Šprtámu. ' : ''}
              Vytvoř si přístupový klíč. Uloží se do tohoto zařízení (nebo do iCloud / Google klíčenky) a odemyká se otiskem prstu, obličejem nebo PINem. Žádné heslo si pamatovat nemusíš.
            </p>
            {supported()
              ? <Busy class="btn primary block" on={busy} onClick={create} autoFocus><I.key />Vytvořit přístupový klíč</Busy>
              : <div class="banner bad">Tento prohlížeč přístupové klíče neumí. Otevři odkaz v aktuálním Safari, Chrome, Edge nebo Firefoxu.</div>}
            <p class="fine">Odkaz platí do {new Date(info.expiresAt).toLocaleString('cs')} a jde použít jen jednou.</p>
          </>
        ) : !error && <p class="muted">Ověřuji pozvánku…</p>}
        {error && <div class="banner bad" role="alert">{error}</div>}
      </div>
    </div>
  )
}
