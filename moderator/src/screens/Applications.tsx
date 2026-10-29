import { useEffect, useState } from 'preact/hooks'
import { ApiError, get, post } from '../api'
import { withConfirm } from '../passkey'
import { nav } from '../router'
import { ago, Busy, copy, dateTime, Empty, I, Modal, toast } from '../ui/kit'

// /zadosti (admins): applications to become a moderator from the public form /zapojit-se (screens/Apply.tsx).
// Approving one creates a single-use invite link in the applicant's name, to send them; rejecting just closes it.

interface Application {
  id: string; name: string; email: string; teacher: boolean; subjects: string; note: string; topic: { key: string; title: string; emoji: string } | null
  status: 'open' | 'approved' | 'rejected'; createdAt: number; decidedAt: number | null; decidedBy: string | null; decisionNote: string | null; joined: boolean | null
}
interface Link { url: string; expiresAt: number; name: string; email: string }

const tabOf = () => (new URLSearchParams(location.search).get('stav') === 'vyrizene' ? 'decided' : 'open')

/** A ready e-mail to the applicant with their link (opens the admin's own mail app; nothing is sent by us). */
const mailto = (l: Link) => `mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent('Účet v moderaci Šprtámu')}&body=${encodeURIComponent(
  `Dobrý den,\n\ndíky za zájem kontrolovat učivo Šprtámu. Vaši žádost jsme schválili.\n\nÚčet si vytvoříte tímto odkazem (platí do ${dateTime(l.expiresAt)} a jde použít jen jednou):\n${l.url}\n\nPřihlašuje se přístupovým klíčem – otiskem prstu, obličejem nebo PINem zařízení, žádné heslo. Témata, která čekají na kontrolu, pak najdete v moderaci pod „Neověřená témata“.\n\nDěkujeme!\n`)}`

export function Applications({ onCount }: { onCount: (n: number) => void }) {
  const tab = tabOf()
  const [list, setList] = useState<Application[] | null>(null)
  const [open, setOpen] = useState(0)
  const [link, setLink] = useState<Link | null>(null)
  const [rejecting, setRejecting] = useState<Application | null>(null)
  const [busy, setBusy] = useState('')
  const load = () => get<{ counts: { open: number }; applications: Application[] }>(`/api/admin/applications?status=${tab}`)
    .then((r) => { setList(r.applications); setOpen(r.counts.open); onCount(r.counts.open) }, (e) => toast(e.message, 'bad'))
  useEffect(() => { setList(null); load() }, [tab])

  const approve = async (a: Application) => {
    setBusy(a.id)
    try { setLink(await withConfirm(() => post<Link>(`/api/admin/applications/${a.id}/approve`))); load() }
    catch (e) { toast(e instanceof ApiError ? e.message : 'Schválení se nepovedlo.', 'bad') } finally { setBusy('') }
  }

  const tabLink = (id: 'open' | 'decided', label: string) => {
    const href = id === 'open' ? '/zadosti' : '/zadosti?stav=vyrizene'
    return <a href={href} onClick={nav(href)} class={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined}>{label}</a>
  }

  return (
    <div class="page-narrow">
      <h1>Žádosti o moderátorství</h1>
      <p class="muted">Posílají je lidé z formuláře <a href="/zapojit-se" onClick={nav('/zapojit-se')}>/zapojit-se</a>, kam vede tlačítko „Chci to zkontrolovat a schválit“ u každého neověřeného tématu v aplikaci. <b>Schválit</b> vytvoří jednorázovou pozvánku (role Moderátor), kterou žadateli pošleš.</p>
      <nav class="seg-tabs">{tabLink('open', open ? `Čekají · ${open}` : 'Čekají')}{tabLink('decided', 'Vyřízené')}</nav>
      {!list ? <p class="muted">Načítám…</p> : !list.length ? <Empty>{tab === 'open' ? 'Žádná žádost nečeká.' : 'Zatím žádné vyřízené žádosti.'}</Empty> : (
        <div class="applications">
          {list.map((a) => (
            <article key={a.id} class="card plain application">
              <header>
                <b>{a.name}</b>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <span class={`pill ${a.teacher ? 'st-published' : ''}`}>{a.teacher ? 'pedagog' : 'není pedagog'}</span>
                <small class="muted">{ago(a.createdAt)}</small>
              </header>
              {a.teacher && a.subjects && <p><span class="muted">Učí:</span> {a.subjects}</p>}
              {a.note && <p class="app-note">{a.note}</p>}
              {a.topic && <p class="muted">Přišel/přišla od tématu <a href={`/ucivo/${a.topic.key}`} onClick={nav(`/ucivo/${a.topic.key}`)}>{a.topic.emoji} {a.topic.title}</a></p>}
              {a.status === 'open' ? (
                <div class="actions">
                  <Busy class="btn primary" on={busy === a.id} onClick={() => approve(a)}><I.check />Schválit a vytvořit pozvánku</Busy>
                  <button class="btn" onClick={() => setRejecting(a)}>Zamítnout</button>
                </div>
              ) : (
                <div class="actions">
                  <small class="muted">
                    {a.status === 'approved' ? 'Schválil/a' : 'Zamítl/a'} {a.decidedBy ?? '–'} {a.decidedAt ? dateTime(a.decidedAt) : ''}
                    {a.status === 'approved' && (a.joined ? ' · účet vytvořen' : ' · účet zatím nevytvořen')}
                    {a.decisionNote ? ` · ${a.decisionNote}` : ''}
                  </small>
                  {a.status === 'approved' && !a.joined && <Busy class="btn small" on={busy === a.id} onClick={() => approve(a)} title="Starý odkaz přestane platit">Nový odkaz</Busy>}
                  {a.status === 'approved' && a.joined && <a class="btn small" href="/uzivatele" onClick={nav('/uzivatele')}>Moderátoři</a>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {link && (
        <Modal title={`Pozvánka pro ${link.name}`} onClose={() => setLink(null)} actions={<button class="btn primary" onClick={() => setLink(null)}>Hotovo</button>}>
          <p>Žádost je schválená. Pošli tento odkaz žadateli na <b>{link.email}</b>. Kdo ho otevře první, vytvoří si účet moderátora.</p>
          <div class="linkbox"><code>{link.url}</code><button class="btn" onClick={() => copy(link.url, 'Odkaz zkopírován')}><I.copy />Kopírovat</button></div>
          <a class="btn block" href={mailto(link)}><I.send />Napsat e-mail s odkazem</a>
          <p class="fine">Platí do {dateTime(link.expiresAt)}, jen jednou. Znovu se už nezobrazí; když se ztratí, dej u žádosti „Nový odkaz“.</p>
        </Modal>
      )}
      {rejecting && <RejectDialog a={rejecting} onClose={() => setRejecting(null)} onDone={() => { setRejecting(null); load() }} />}
    </div>
  )
}

function RejectDialog({ a, onClose, onDone }: { a: Application; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const reject = async () => {
    setBusy(true)
    try { await withConfirm(() => post(`/api/admin/applications/${a.id}/reject`, { note })); toast('Žádost zamítnuta'); onDone() }
    catch (e) { toast(e instanceof ApiError ? e.message : 'Zamítnutí se nepovedlo.', 'bad'); setBusy(false) }
  }
  return (
    <Modal title={`Zamítnout žádost – ${a.name}`} onClose={onClose} actions={<><button class="btn" onClick={onClose}>Zpět</button><Busy class="btn danger" on={busy} onClick={reject}>Zamítnout</Busy></>}>
      <p>Žadatel se o zamítnutí sám nedozví. Když mu chceš odpovědět, napiš mu na <a href={`mailto:${a.email}`}>{a.email}</a>.</p>
      <label class="field"><span>Poznámka pro ostatní správce <em>(nepovinné)</em></span>
        <input value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={1000} /></label>
    </Modal>
  )
}

