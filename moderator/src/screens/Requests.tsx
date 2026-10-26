import { useEffect, useState } from 'preact/hooks'
import { WIDGET_GROUPS, WIDGETS } from '../../../src/widgets'
import { ApiError, api, get, post } from '../api'
import type { Me } from '../passkey'
import { ago, Busy, Empty, I, Modal, toast } from '../ui/kit'

// Requests for new interactive widgets (pomůcky). A widget is a piece of the app's code, so a moderator
// describes what pupils should try out and where it would help; others vote; admins plan and build it.

type Status = 'new' | 'planned' | 'building' | 'done' | 'declined'
interface Req {
  id: string; title: string; body: string; example: string; topics: string; status: Status; adminNote: string; widget: string | null
  author: { id: string; name: string }; votes: number; voted: boolean; createdAt: number; updatedAt: number
}

const STATUS: Record<Status, string> = { new: 'Nová', planned: 'V plánu', building: 'Vzniká', done: 'Hotovo', declined: 'Nebude' }
const PILL: Record<Status, string> = { new: 'st-draft', planned: 'st-review', building: 'st-review', done: 'st-published', declined: 'st-rejected' }

export function Requests({ me }: { me: Me }) {
  const [list, setList] = useState<Req[] | null>(null)
  const [edit, setEdit] = useState<Req | 'new' | null>(null)
  const load = () => get<Req[]>('/api/widget-requests').then(setList, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])
  const vote = async (r: Req) => { try { await post(`/api/widget-requests/${r.id}/vote`); load() } catch (e) { toast((e as ApiError).message, 'bad') } }
  const setStatus = async (r: Req, status: Status) => { try { await api('PATCH', `/api/widget-requests/${r.id}`, { status }); load() } catch (e) { toast((e as ApiError).message, 'bad') } }
  const count = Object.keys(WIDGETS).length

  return (
    <div class="page-narrow">
      <div class="row-head">
        <h1>Pomůcky</h1>
        <button class="btn primary" onClick={() => setEdit('new')}><I.plus />Navrhnout novou pomůcku</button>
      </div>
      <p class="muted">
        Interaktivní pomůcky (zlomek, číselná osa, hodiny…) jsou součástí aplikace, takže novou musí naprogramovat vývojář. Popiš, co by si s ní děti měly
        vyzkoušet a ke kterým tématům se hodí – ostatní moderátoři ji můžou podpořit. Teď je v aplikaci {count} pomůcek:{' '}
        <a href="https://sprtam.cz/widgety" target="_blank" rel="noopener noreferrer">galerie <I.external /></a>.
      </p>
      <details class="tips">
        <summary>Pomůcky, které už jsou</summary>
        <ul class="w-have">{WIDGET_GROUPS.flatMap((gr) => gr.widgets).map((w) => <li key={w.name}><b>{w.title}</b> – {w.summary}</li>)}</ul>
      </details>
      {!list ? <p class="muted">Načítám…</p> : !list.length ? <Empty>Zatím žádné žádosti. Chybí ti při vysvětlování nějaká pomůcka? Navrhni ji.</Empty> : (
        <div class="requests">
          {list.map((r) => (
            <article key={r.id} class={`request ${r.status}`}>
              <div class="rq-vote">
                <button class={`btn small ${r.voted ? 'primary' : ''}`} onClick={() => vote(r)} aria-pressed={r.voted} title={r.voted ? 'Zrušit podporu' : 'Taky bych ji chtěl/a'}><I.up />{r.votes}</button>
              </div>
              <div class="rq-main">
                <div class="row-head"><h2>{r.title}</h2><span class={`pill ${PILL[r.status]}`}>{STATUS[r.status]}</span></div>
                <p class="rq-body">{r.body}</p>
                {r.example && <p class="rq-more"><b>Příklad použití:</b> {r.example}</p>}
                {r.topics && <p class="rq-more"><b>Témata:</b> {r.topics}</p>}
                {r.adminNote && <p class="banner info">{r.adminNote}</p>}
                {r.widget && WIDGETS[r.widget] && <p class="banner ok"><I.check />Hotovo: pomůcka „{WIDGETS[r.widget].title}“ je v editoru mezi pomůckami.</p>}
                <small class="fine">{r.author.name} · {ago(r.createdAt)}</small>
                <div class="actions-row">
                  {(me.role === 'admin' || (r.author.id === me.id && r.status === 'new')) && <button class="btn small" onClick={() => setEdit(r)}><I.pencil />Upravit</button>}
                  {me.role === 'admin' && (
                    <select value={r.status} onChange={(e) => setStatus(r, e.currentTarget.value as Status)} aria-label="Stav žádosti">
                      {(Object.keys(STATUS) as Status[]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {edit && <RequestForm me={me} req={edit === 'new' ? null : edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); load() }} />}
    </div>
  )
}

function RequestForm({ me, req, onClose, onDone }: { me: Me; req: Req | null; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState(req?.title ?? '')
  const [body, setBody] = useState(req?.body ?? '')
  const [example, setExample] = useState(req?.example ?? '')
  const [topics, setTopics] = useState(req?.topics ?? '')
  const [note, setNote] = useState(req?.adminNote ?? '')
  const [widget, setWidget] = useState(req?.widget ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const admin = me.role === 'admin' && req
  const send = async () => {
    setBusy(true); setError('')
    try {
      const data = { title, body, example, topics, ...(admin ? { adminNote: note, widget: widget || null } : {}) }
      if (req) await api('PATCH', `/api/widget-requests/${req.id}`, data)
      else await post('/api/widget-requests', data)
      toast(req ? 'Uloženo' : 'Díky! Žádost je mezi pomůckami.')
      onDone()
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Uložení se nepovedlo.') } finally { setBusy(false) }
  }
  const ok = title.trim().length >= 3 && body.trim().length >= 20
  return (
    <Modal title={req ? 'Upravit žádost' : 'Nová pomůcka'} onClose={onClose} wide
      actions={<><button class="btn" onClick={onClose}>Zrušit</button><Busy class="btn primary" on={busy} disabled={!ok} onClick={send}>{req ? 'Uložit' : 'Odeslat žádost'}</Busy></>}>
      <form class="form" onSubmit={(e) => { e.preventDefault(); if (ok) send() }}>
        <label class="field"><span>Název</span><input value={title} onInput={(e) => setTitle(e.currentTarget.value)} placeholder="např. Váhy na rovnice" maxLength={120} autoFocus /></label>
        <label class="field">
          <span>Co by si s ní děti měly vyzkoušet</span>
          <textarea rows={5} value={body} onInput={(e) => setBody(e.currentTarget.value)} maxLength={4000}
            placeholder="Popiš, co se na pomůcce ukazuje a co s ní dítě dělá (táhne, klepe, přepíná…), a co tím pochopí." />
          <small>Aspoň pár vět. Čím konkrétnější, tím líp – vývojář podle toho pomůcku navrhne.</small>
        </label>
        <label class="field"><span>Příklad použití (nepovinné)</span><textarea rows={3} value={example} onInput={(e) => setExample(e.currentTarget.value)} maxLength={4000} placeholder="Třeba konkrétní zadání nebo obrázek, jak by to mohlo vypadat." /></label>
        <label class="field"><span>Ke kterým tématům (nepovinné)</span><input value={topics} onInput={(e) => setTopics(e.currentTarget.value)} maxLength={1000} placeholder="např. 7. třída – rovnice; 8. třída – lineární funkce" /></label>
        {admin && <>
          <label class="field"><span>Poznámka správce (vidí všichni)</span><textarea rows={2} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={2000} /></label>
          <label class="field">
            <span>Hotová pomůcka</span>
            <select value={widget} onChange={(e) => setWidget(e.currentTarget.value)}>
              <option value="">–</option>
              {Object.values(WIDGETS).map((w) => <option key={w.name} value={w.name}>{w.title}</option>)}
            </select>
          </label>
        </>}
        {error && <div class="banner bad">{error}</div>}
      </form>
    </Modal>
  )
}
