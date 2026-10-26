import { useEffect, useState } from 'preact/hooks'
import { ApiError, api, get, post } from '../api'
import { addKey, withConfirm, type Me } from '../passkey'
import { ago, Busy, copy, dateTime, I, Modal, toast } from '../ui/kit'

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

      <Tokens />
    </div>
  )
}

interface Token { id: string; label: string; createdAt: number; expiresAt: number; lastUsedAt: number | null; expired: boolean }

/** API tokens: scripts and AI agents send content as drafts in the owner's name (docs/OBSAH.md, API pro moderování). */
function Tokens() {
  const [list, setList] = useState<Token[] | null>(null)
  const [label, setLabel] = useState('')
  const [days, setDays] = useState(30)
  const [busy, setBusy] = useState(false)
  const [fresh, setFresh] = useState<{ token: string; expiresAt: number } | null>(null)
  const load = () => get<Token[]>('/api/me/tokens').then(setList, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])
  const create = async () => {
    setBusy(true)
    try { const r = await withConfirm(() => post<{ token: string; expiresAt: number }>('/api/me/tokens', { label, days })); setFresh(r); setLabel(''); load() }
    catch (e) { toast(e instanceof ApiError ? e.message : 'Token se nepodařilo vytvořit.', 'bad') } finally { setBusy(false) }
  }
  const remove = async (t: Token) => {
    if (!confirm(`Zrušit token „${t.label}“? Co ho používá, přestane fungovat.`)) return
    try { await api('DELETE', `/api/me/tokens/${t.id}`); toast('Token zrušen'); load() } catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad') }
  }
  return (
    <>
      <h2 class="label">API tokeny</h2>
      <p class="muted">Pro skripty a AI agenty, kteří připravují učivo: s tokenem umí číst učivo a zakládat, upravovat a posílat ke kontrole <b>tvoje</b> návrhy. Schvalovat, zveřejňovat ani nic spravovat neumí. Návrhy pak schvaluje někdo jiný.</p>
      {list && list.length > 0 && (
        <div class="users">
          {list.map((t) => (
            <div key={t.id} class={`user ${t.expired ? 'off' : ''}`}>
              <div class="u-main"><b><I.key /> {t.label}</b><small>{t.expired ? 'prošlý' : `platí do ${dateTime(t.expiresAt)}`} · naposledy {ago(t.lastUsedAt)}</small></div>
              <button class="btn small" onClick={() => remove(t)}>Zrušit</button>
            </div>
          ))}
        </div>
      )}
      <form class="actions-row" onSubmit={(e) => { e.preventDefault(); if (label.trim().length >= 2) create() }}>
        <input class="inp" value={label} onInput={(e) => setLabel(e.currentTarget.value)} placeholder="K čemu (např. Agent – matematika 6)" maxLength={60} aria-label="Název tokenu" />
        <select value={days} onChange={(e) => setDays(Number(e.currentTarget.value))} aria-label="Platnost">
          {[7, 30, 90, 180].map((d) => <option key={d} value={d}>{d} dní</option>)}
        </select>
        <Busy class="btn" on={busy} disabled={label.trim().length < 2}><I.plus />Vytvořit token</Busy>
      </form>
      {fresh && (
        <Modal title="Nový API token" onClose={() => setFresh(null)} actions={<button class="btn primary" onClick={() => setFresh(null)}>Hotovo</button>}>
          <p>Zkopíruj si ho teď – <b>znovu se nezobrazí</b>. Patří jen do prostředí skriptu (proměnná <code>SPRTAM_TOKEN</code>), nikdy do repozitáře ani chatu.</p>
          <div class="linkbox"><code>{fresh.token}</code><button class="btn" onClick={() => copy(fresh.token, 'Token zkopírován')}><I.copy />Kopírovat</button></div>
          <p class="fine">Platí do {dateTime(fresh.expiresAt)}.</p>
        </Modal>
      )}
    </>
  )
}
