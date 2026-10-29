import { useEffect, useState } from 'preact/hooks'
import { ApiError, api, get, post } from '../api'
import { withConfirm, type Me } from '../passkey'
import { ago, Busy, copy, dateTime, I, Modal, toast } from '../ui/kit'

interface U { id: string; name: string; role: 'admin' | 'moderator'; active: boolean; createdAt: number; lastLoginAt: number | null; keys: number; sessions: number; tokens: number }
interface Inv { id: string; kind: 'user' | 'key'; name: string; role: string; by: string | null; createdAt: number; expiresAt: number }
interface Entry { id: number; at: number; user: string | null; action: string; detail: Record<string, unknown> | null; ip: string | null }

const ROLE = { admin: 'Správce', moderator: 'Moderátor' }
const ACTION: Record<string, string> = {
  login: 'přihlášení', 'login.fail': 'neúspěšné přihlášení', 'user.created': 'nový účet', 'key.added': 'nový klíč', 'key.removed': 'odebraný klíč', 'key.link': 'odkaz na nový klíč',
  'user.keys-reset': 'zrušené klíče + nový odkaz', 'invite.created': 'pozvánka', 'invite.revoked': 'zrušená pozvánka', 'user.disabled': 'vypnutý účet', 'user.enabled': 'zapnutý účet',
  'user.role': 'změna role', 'user.renamed': 'přejmenování', 'sessions.ended': 'odhlášení ze zařízení', 'draft.submitted': 'návrh ke kontrole', 'draft.updated': 'aktualizovaný návrh', 'draft.deleted': 'smazaný návrh',
  'draft.withdrawn': 'návrh vrácen do rozpracovaných', 'draft.rebased': 'návrh převeden na novou verzi', 'draft.published': 'zveřejněno', 'draft.rejected': 'zamítnutý návrh', 'draft.rollback': 'návrh návratu ke starší verzi',
  'review.approve': 'schválení', 'review.changes': 'požadavek na úpravy', 'review.comment': 'komentář', 'review.resolved': 'vyřešený komentář',
  'content.imported': 'import učiva', 'content.restored-version': 'vrácená verze bez kontroly', 'content.restored-release': 'obnova vydání',
  'token.created': 'nový API token', 'token.removed': 'zrušený API token', 'widget-request.created': 'žádost o pomůcku', 'widget-request.updated': 'úprava žádosti o pomůcku', 'widget-request.deleted': 'smazaná žádost o pomůcku',
  'application.created': 'žádost o moderátorství', 'application.approved': 'schválená žádost o moderátorství', 'application.rejected': 'zamítnutá žádost o moderátorství',
}

const run = async (f: () => Promise<unknown>, ok?: string) => {
  try { await withConfirm(f); if (ok) toast(ok); return true } catch (e) { toast(e instanceof ApiError ? e.message : 'Akce se nepovedla.', 'bad'); return false }
}

export function Users({ me }: { me: Me }) {
  const [data, setData] = useState<{ users: U[]; invites: Inv[] } | null>(null)
  const [tab, setTab] = useState<'users' | 'audit'>('users')
  const [inviting, setInviting] = useState(false)
  const [link, setLink] = useState<{ url: string; expiresAt: number; title: string } | null>(null)
  const load = () => get<{ users: U[]; invites: Inv[] }>('/api/admin/users').then(setData, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])

  const patch = (u: U, body: object, ok: string) => run(() => api('PATCH', `/api/admin/users/${u.id}`, body), ok).then(load)
  const keyLink = async (u: U, reset: boolean) => {
    if (reset && !confirm(`Zrušit všechny klíče uživatele ${u.name} a odhlásit ho ze všech zařízení? Pak se přihlásí jen novým odkazem.`)) return
    let out: { url: string; expiresAt: number } | undefined
    if (await run(async () => { out = await post('/api/admin/users/' + u.id + '/key-link', { reset }) })) setLink({ ...out!, title: `Odkaz na nový klíč – ${u.name}` })
    load()
  }

  return (
    <div class="page-narrow">
      <div class="row-head">
        <h1>Moderátoři</h1>
        <button class="btn primary" onClick={() => setInviting(true)}><I.plus />Pozvat moderátora</button>
      </div>
      <div class="seg-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'users'} class={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Účty</button>
        <button role="tab" aria-selected={tab === 'audit'} class={tab === 'audit' ? 'on' : ''} onClick={() => setTab('audit')}>Záznam událostí</button>
      </div>
      {tab === 'audit' ? <Audit /> : !data ? <p class="muted">Načítám…</p> : (
        <>
          <div class="users">
            {data.users.map((u) => (
              <div key={u.id} class={`user ${u.active ? '' : 'off'}`}>
                <div class="u-main">
                  <b>{u.name}{u.id === me.id && <span class="pill">ty</span>}{!u.active && <span class="pill st-closed">vypnutý</span>}</b>
                  <small>{ROLE[u.role]} · {u.keys} {u.keys === 1 ? 'klíč' : u.keys < 5 && u.keys ? 'klíče' : 'klíčů'}{u.tokens ? ` · ${u.tokens} API ${u.tokens === 1 ? 'token' : 'tokeny'}` : ''} · naposledy {ago(u.lastLoginAt)}</small>
                </div>
                <div class="u-actions">
                  <select value={u.role} disabled={u.id === me.id} onChange={(e) => patch(u, { role: e.currentTarget.value }, 'Role změněna')} aria-label="Role">
                    <option value="moderator">Moderátor</option><option value="admin">Správce</option>
                  </select>
                  <button class="btn small" onClick={() => keyLink(u, false)} disabled={!u.active} title="Jednorázový odkaz, kterým si přidá nový klíč (např. nový telefon)"><I.key />Nový klíč</button>
                  {u.id !== me.id && <button class="btn small" onClick={() => keyLink(u, true)} disabled={!u.active} title="Při ztrátě nebo krádeži zařízení">Zrušit klíče</button>}
                  {u.id !== me.id && (u.sessions > 0 || u.tokens > 0) && <button class="btn small" onClick={() => run(() => post(`/api/admin/users/${u.id}/end-sessions`), 'Odhlášeno ze všech zařízení').then(load)}>Odhlásit</button>}
                  {u.id !== me.id && <button class={`btn small ${u.active ? 'danger' : ''}`} onClick={() => (!u.active || confirm(`Vypnout účet ${u.name}? Okamžitě se odhlásí a nepřihlásí se, dokud ho nezapneš.`)) && patch(u, { active: !u.active }, u.active ? 'Účet vypnut' : 'Účet zapnut')}>{u.active ? 'Vypnout' : 'Zapnout'}</button>}
                </div>
              </div>
            ))}
          </div>
          {data.invites.length > 0 && (
            <>
              <h2 class="label">Nepoužité odkazy</h2>
              <div class="users">
                {data.invites.map((i) => (
                  <div key={i.id} class="user">
                    <div class="u-main"><b>{i.name}</b><small>{i.kind === 'user' ? `pozvánka · ${ROLE[i.role as 'admin']}` : 'nový klíč'} · platí do {dateTime(i.expiresAt)}{i.by ? ` · vytvořil/a ${i.by}` : ''}</small></div>
                    <button class="btn small" onClick={() => run(() => api('DELETE', `/api/admin/invites/${i.id}`), 'Odkaz zrušen').then(load)}>Zrušit</button>
                  </div>
                ))}
              </div>
            </>
          )}
          <p class="fine">Každá změna tady vyžaduje potvrzení klíčem, pokud ses nepřihlásil/a v posledních 15 minutách. Odkazy platí 72 hodin a jdou použít jen jednou – posílej je jen přímo dané osobě.</p>
        </>
      )}
      {inviting && <InviteForm onClose={() => setInviting(false)} onLink={(l) => { setInviting(false); setLink(l); load() }} />}
      {link && (
        <Modal title={link.title} onClose={() => setLink(null)} actions={<button class="btn primary" onClick={() => setLink(null)}>Hotovo</button>}>
          <p>Pošli tento odkaz přímo dané osobě (třeba osobně nebo v soukromé zprávě). Kdo ho otevře první, vytvoří si klíč.</p>
          <div class="linkbox"><code>{link.url}</code><button class="btn" onClick={() => copy(link.url, 'Odkaz zkopírován')}><I.copy />Kopírovat</button></div>
          <p class="fine">Platí do {dateTime(link.expiresAt)}, jen jednou. Znovu se už nezobrazí.</p>
        </Modal>
      )}
    </div>
  )
}

function InviteForm({ onClose, onLink }: { onClose: () => void; onLink: (l: { url: string; expiresAt: number; title: string }) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<'moderator' | 'admin'>('moderator')
  const [busy, setBusy] = useState(false)
  const create = async () => {
    setBusy(true)
    let out: { url: string; expiresAt: number } | undefined
    if (await run(async () => { out = await post('/api/admin/invites', { name, role }) })) onLink({ ...out!, title: `Pozvánka pro ${name.trim()}` })
    setBusy(false)
  }
  return (
    <Modal title="Pozvat moderátora" onClose={onClose} actions={<><button class="btn" onClick={onClose}>Zrušit</button><Busy class="btn primary" on={busy} disabled={name.trim().length < 2} onClick={create}>Vytvořit odkaz</Busy></>}>
      <form class="form" onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 2) create() }}>
        <label class="field"><span>Jméno</span><input value={name} onInput={(e) => setName(e.currentTarget.value)} placeholder="Jana Nováková" maxLength={80} autoFocus /><small>Uvidí ho ostatní moderátoři; objeví se u jeho návrhů a v historii učiva.</small></label>
        <fieldset class="field">
          <span>Role</span>
          <label class="radio"><input type="radio" checked={role === 'moderator'} onChange={() => setRole('moderator')} /><span><b>Moderátor</b> – upravuje a navrhuje učivo</span></label>
          <label class="radio"><input type="radio" checked={role === 'admin'} onChange={() => setRole('admin')} /><span><b>Správce</b> – navíc zve a spravuje moderátory</span></label>
        </fieldset>
      </form>
    </Modal>
  )
}

function Audit() {
  const [list, setList] = useState<Entry[] | null>(null)
  const [more, setMore] = useState(true)
  const load = (before?: number) => get<Entry[]>(`/api/admin/audit${before ? `?before=${before}` : ''}`).then((xs) => { setList((l) => [...(before ? l ?? [] : []), ...xs]); setMore(xs.length === 100) }, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])
  if (!list) return <p class="muted">Načítám…</p>
  return (
    <div class="audit">
      <table>
        <thead><tr><th>Kdy</th><th>Kdo</th><th>Co</th><th>Podrobnosti</th><th>IP</th></tr></thead>
        <tbody>
          {list.map((e) => (
            <tr key={e.id} class={e.action === 'login.fail' ? 'bad' : ''}>
              <td>{dateTime(e.at)}</td><td>{e.user ?? '–'}</td><td>{ACTION[e.action] ?? e.action}</td>
              <td>{e.detail ? Object.entries(e.detail).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ') : ''}</td><td>{e.ip ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {more && <button class="btn" onClick={() => load(list[list.length - 1]?.id)}>Starší</button>}
    </div>
  )
}
