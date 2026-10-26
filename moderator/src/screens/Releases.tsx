import { useEffect, useState } from 'preact/hooks'
import { ApiError, get, post } from '../api'
import { withConfirm } from '../passkey'
import { nav } from '../router'
import { refreshIndex } from '../store'
import { ago, Busy, dateTime, I, Modal, toast } from '../ui/kit'
import { REASON } from './History'

// Admins: the state of the content service (current release, the history's hash chain, backups) and every
// release, with the possibility to bring the whole content back to how it was after one of them.

interface System {
  release: number | null; publishedAt: number | null; docs: number; versions: number; chainOk: boolean; approvals: number; reviews: number; commit: string
  backup: { configured: boolean; lastAt: number | null; lastBytes: number | null; last24h: number; lastVerified: number | null; lastNote: string | null; lastGoodAt: number | null; mirrored: number | null }
}
interface Release { id: number; createdAt: number; reason: keyof typeof REASON; note: string | null; author: string | null; draftId: string | null; docs: number; keys: string[] }

const HOUR = 3_600_000
const mb = (b: number) => `${(b / 1_048_576).toFixed(1)} MB`

/** topics/z5/matematika/zlomky → /historie/z5/matematika/zlomky */
const historyOf = (key: string) => { const m = /^topics\/([^/]+)\/([^/]+)\/([^/_][^/]*)$/.exec(key); return m ? `/historie/${m[1]}/${m[2]}/${m[3]}` : null }

export function Releases() {
  const [sys, setSys] = useState<System | null>(null)
  const [list, setList] = useState<Release[] | null>(null)
  const [more, setMore] = useState(true)
  const [restore, setRestore] = useState<Release | null>(null)
  const load = (before?: number) => get<Release[]>(`/api/admin/releases${before ? `?before=${before}` : ''}`).then((xs) => { setList((l) => [...(before ? l ?? [] : []), ...xs]); setMore(xs.length === 50) }, (e) => toast(e.message, 'bad'))
  const reload = () => { get<System>('/api/admin/system').then(setSys, (e) => toast(e.message, 'bad')); load() }
  useEffect(reload, [])

  const goodAge = sys?.backup.lastGoodAt ? Date.now() - sys.backup.lastGoodAt : null
  return (
    <div class="page-narrow">
      <h1>Vydání učiva</h1>
      {sys && (
        <div class="sys">
          <div><small class="label">Zveřejněno</small><b>vydání {sys.release ?? '–'}</b><small>{sys.publishedAt ? ago(sys.publishedAt) : ''}</small></div>
          <div><small class="label">Obsah</small><b>{sys.docs} dokumentů</b><small>{sys.versions} verzí v historii</small></div>
          <div class={sys.chainOk ? '' : 'bad'}><small class="label">Historie</small><b>{sys.chainOk ? 'neporušená' : 'POŠKOZENÁ'}</b><small>kontrolní řetězec verzí</small></div>
          <div class={!sys.backup.configured || goodAge === null || goodAge > 2 * HOUR || sys.backup.lastVerified === 0 ? 'bad' : ''} title={sys.backup.lastNote ?? ''}>
            <small class="label">Záloha</small>
            <b>{!sys.backup.configured ? 'vypnutá' : sys.backup.lastVerified === 0 ? 'CHYBA' : sys.backup.lastGoodAt ? `ověřená ${ago(sys.backup.lastGoodAt)}` : 'zatím žádná'}</b>
            <small>{sys.backup.lastVerified === 0 && sys.backup.lastNote ? sys.backup.lastNote : sys.backup.lastBytes ? `${mb(sys.backup.lastBytes)} · ${sys.backup.last24h}× za 24 h${sys.backup.mirrored ? ` · zrcadlo do vydání ${sys.backup.mirrored}` : ''}` : 'stahuje si ji druhý server'}</small>
          </div>
          <div><small class="label">Schvalování</small><b>{sys.approvals}× schválení</b><small>{sys.reviews} ke kontrole</small></div>
        </div>
      )}
      <p class="muted">Každé zveřejnění je nové vydání. Nic se nepřepisuje: návrat zpátky je zase nové vydání, takže jde vrátit i ten.</p>
      {!list ? <p class="muted">Načítám…</p> : (
        <div class="drafts">
          {list.map((r, i) => (
            <div key={r.id} class="draft">
              <div class="d-main">
                <b>Vydání {r.id} · {REASON[r.reason]}{i === 0 && <span class="pill st-published">aktuální</span>}</b>
                <small>{dateTime(r.createdAt)}{r.author ? ` · ${r.author}` : ''} · {r.docs} {r.docs === 1 ? 'dokument' : r.docs < 5 ? 'dokumenty' : 'dokumentů'}{r.note ? ` · ${r.note}` : ''}</small>
                {r.keys.length > 0 && (
                  <small class="keys">{r.keys.map((k) => { const h = historyOf(k); return h ? <a key={k} href={h} onClick={nav(h)}>{k.replace(/^topics\//, '')}</a> : <span key={k}>{k}</span> })}</small>
                )}
              </div>
              {r.draftId && <a class="btn small" href={`/kontrola/${r.draftId}`} onClick={nav(`/kontrola/${r.draftId}`)}>Kontrola</a>}
              {i > 0 && <button class="btn small" onClick={() => setRestore(r)}><I.undo />Obnovit</button>}
            </div>
          ))}
          {more && list.length > 0 && <button class="btn" onClick={() => load(list[list.length - 1].id)}>Starší</button>}
        </div>
      )}
      {restore && <RestoreRelease release={restore} onClose={() => setRestore(null)} onDone={() => { setRestore(null); refreshIndex(); reload() }} />}
    </div>
  )
}

function RestoreRelease({ release, onClose, onDone }: { release: Release; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setBusy(true)
    try {
      const r = await withConfirm(() => post<{ release: number; docs: number }>(`/api/admin/releases/${release.id}/restore`, { note: note.trim() }))
      toast(`Obnoveno: vydání ${r.release} vrací ${r.docs} dokumentů do stavu po vydání ${release.id}.`)
      onDone()
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad') } finally { setBusy(false) }
  }
  return (
    <Modal title={`Obnovit stav po vydání ${release.id}`} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zpět</button><Busy class="btn danger" on={busy} disabled={note.trim().length < 3} onClick={send}>Obnovit celé učivo</Busy></>}>
      <p>Celé učivo se vrátí do stavu z {dateTime(release.createdAt)} – <b>bez kontroly</b>, hned na sprtam.cz. Všechno zveřejněné potom zůstane v historii a dá se vrátit.</p>
      <p class="fine">Rozpracované návrhy, které vycházejí z novější verze, se ocitnou v konfliktu a autoři je budou muset převést.</p>
      <label class="field"><span>Důvod (zůstane v historii)</span><textarea rows={3} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={500} autoFocus /></label>
    </Modal>
  )
}
