import { useState } from 'preact/hooks'
import { signIn, supported, type Me } from '../passkey'
import { ApiError } from '../api'
import { Busy, I } from '../ui/kit'

export function Login({ onDone }: { onDone: (u: Me) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const go = async () => {
    setBusy(true); setError('')
    try { onDone(await signIn()) } catch (e) { setError(e instanceof ApiError ? e.message : 'Přihlášení se nepovedlo.') } finally { setBusy(false) }
  }
  return (
    <div class="gate">
      <div class="gate-card">
        <div class="brand big"><b>šprtám</b><span>moderace</span></div>
        <h1>Přihlášení</h1>
        <p class="muted">Úprava učiva Šprtámu je jen pro pozvané moderátory. Přihlásíš se svým přístupovým klíčem – otiskem prstu, obličejem nebo PINem zařízení.</p>
        {supported() ? (
          <Busy class="btn primary block" on={busy} onClick={go} autoFocus><I.key />Přihlásit se klíčem</Busy>
        ) : (
          <div class="banner bad">Tento prohlížeč přístupové klíče neumí. Použij aktuální Safari, Chrome, Edge nebo Firefox.</div>
        )}
        {error && <div class="banner bad" role="alert">{error}</div>}
        <p class="fine">Nemáš klíč nebo jsi přišel/přišla o zařízení? Napiš správci, pošle ti nový odkaz.</p>
      </div>
    </div>
  )
}
