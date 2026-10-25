import { useEffect, useState } from 'preact/hooks'
import { ApiError, api, get, post } from '../api'
import { addKey, withConfirm, type Me } from '../passkey'
import { ago, Busy, dateTime, I, toast } from '../ui/kit'

interface Key { id: string; label: string; createdAt: number; lastUsedAt: number | null; synced: boolean }

export function Account({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [keys, setKeys] = useState<Key[] | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => get<Key[]>('/api/me/keys').then(setKeys, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])
  const act = async (f: () => Promise<unknown>, ok: string) => {
    setBusy(true)
    try { await withConfirm(f); toast(ok); load() } catch (e) { toast(e instanceof ApiError ? e.message : 'Akce se nepovedla.', 'bad') } finally { setBusy(false) }
  }
  return (
    <div class="page-narrow">
      <h1>{me.name}</h1>
      <p class="muted">{me.role === 'admin' ? 'Správce' : 'Moderátor'}</p>

      <h2 class="label">Přístupové klíče</h2>
      <p class="muted">Klíčem se přihlašuješ. Přidej si druhý (třeba v telefonu), ať se přihlásíš i při ztrátě jednoho zařízení.</p>
      <div class="users">
        {keys?.map((k) => (
          <div key={k.id} class="user">
            <div class="u-main"><b><I.key /> {k.label}</b><small>přidán {dateTime(k.createdAt)} · naposledy {ago(k.lastUsedAt)}{k.synced ? ' · synchronizovaný' : ''}</small></div>
            <button class="btn small" disabled={busy || keys.length < 2} title={keys.length < 2 ? 'Poslední klíč odebrat nejde' : 'Odebrat klíč'}
              onClick={() => confirm(`Odebrat klíč „${k.label}“? Tímto zařízením se pak nepřihlásíš.`) && act(() => api('DELETE', `/api/me/keys/${encodeURIComponent(k.id)}`), 'Klíč odebrán')}>Odebrat</button>
          </div>
        ))}
      </div>
      <Busy class="btn" on={busy} onClick={() => act(addKey, 'Klíč přidán')}><I.plus />Přidat klíč</Busy>

      <h2 class="label">Přihlášení</h2>
      <div class="actions-row">
        <button class="btn" disabled={busy} onClick={() => act(() => post('/api/me/sessions/end-others'), 'Odhlášeno ze všech ostatních zařízení')}>Odhlásit ostatní zařízení</button>
        <button class="btn" onClick={onLogout}><I.logout />Odhlásit se</button>
      </div>
      <p class="fine">Přihlášení vyprší po 12 hodinách nečinnosti, nejpozději za 7 dní.</p>
    </div>
  )
}
