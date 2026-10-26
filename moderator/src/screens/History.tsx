import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } from '../../../src/content/curriculum'
import type { GradeId, SubjectId, TopicFile } from '../../../src/content/types'
import { ApiError, get, post } from '../api'
import { TopicDiff } from '../diff/Diff'
import { withConfirm, type Me } from '../passkey'
import { go, nav } from '../router'
import { refreshIndex } from '../store'
import { Busy, dateTime, Empty, I, Modal, toast } from '../ui/kit'

// Every published version of one topic (/historie/<grade>/<subject>/<topic>): who changed it, who approved
// it, and what each version changed. Going back to an earlier version is a new change reviewed like any
// other; admins can, in an emergency, publish an earlier version at once.

interface Version {
  id: number; key: string; n: number; deleted: boolean; createdAt: number; reason: 'import' | 'change' | 'rollback' | 'restore'; release: number
  author: string | null; approvedBy: string[]; draftId: string | null; current: boolean
}
interface VersionData { version: Version; data: TopicFile | null; previous: { id: number; data: TopicFile | null } | null }

export const REASON: Record<Version['reason'], string> = { import: 'Převzato z repozitáře', change: 'Změna', rollback: 'Návrat ke starší verzi', restore: 'Obnova celého vydání' }

export function History({ g, s, id, me }: { g: string; s: string; id: string; me: Me }) {
  const [list, setList] = useState<Version[] | null>(null)
  const [error, setError] = useState('')
  const [sel, setSel] = useState<number | null>(null)
  const [shown, setShown] = useState<VersionData | null>(null)
  const [current, setCurrent] = useState<TopicFile | null>(null)
  const [against, setAgainst] = useState<'previous' | 'current'>('previous')
  const [busy, setBusy] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const load = () => get<Version[]>(`/api/history/${g}/${s}/${id}`).then((l) => { setList(l); setSel((x) => x ?? l[0]?.id ?? null) }, (e) => setError(e instanceof ApiError ? e.message : 'Historii se nepodařilo načíst.'))
  useEffect(() => { setList(null); setSel(null); load() }, [g, s, id])
  useEffect(() => { get<{ topic: TopicFile }>(`/api/content/topic/${g}/${s}/${id}`).then((r) => setCurrent(r.topic), () => setCurrent(null)) }, [g, s, id, list])
  useEffect(() => { if (sel !== null) { setShown(null); get<VersionData>(`/api/versions/${sel}`).then(setShown, (e) => toast(e.message, 'bad')) } }, [sel])

  const known = Object.hasOwn(GRADE_SUBJECTS, g) && (GRADE_SUBJECTS[g as GradeId] as string[]).includes(s)
  if (error || !known) return <div class="empty-state">{error || 'Téma nenalezeno.'} <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>
  const back = `/ucivo/${g}/${s}/${id}`

  const propose = async () => {
    setBusy(true)
    try {
      const r = await post<{ draft: { id: string } }>(`/api/versions/${sel}/rollback`)
      refreshIndex()
      toast('Návrat je připravený jako návrh. Zkontroluj ho a pošli ke kontrole.')
      go(`/navrh/${r.draft.id}`)
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad') } finally { setBusy(false) }
  }

  const v = shown?.version
  return (
    <div class="viewer">
      <header class="v-head">
        <a class="v-up" href={back} onClick={nav(back)}><I.back />Zpět na téma</a>
        <div class="v-title">
          <span class="v-em">{current?.emoji ?? '📜'}</span>
          <div><h1>Historie: {current?.title ?? id}</h1><small>{GRADE_NAME[g as GradeId]} · {SUBJECTS[s as SubjectId].name} · {list?.length ?? '…'} verzí</small></div>
        </div>
      </header>
      <div class="h-body">
        <ol class="h-list">
          {!list ? <li class="muted">Načítám…</li> : list.map((x) => (
            <li key={x.id}>
              <button class={`h-ver ${x.id === sel ? 'on' : ''}`} onClick={() => setSel(x.id)} aria-pressed={x.id === sel}>
                <span class="h-n">v{x.n}</span>
                <span class="h-t">
                  <b>{REASON[x.reason]}{x.current && <span class="pill st-published">zveřejněná</span>}</b>
                  <small>{dateTime(x.createdAt)}{x.author ? ` · ${x.author}` : ''}{x.approvedBy.length ? ` · schválil/a ${x.approvedBy.join(', ')}` : ''}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div class="h-main">
          {!shown || !v ? <p class="muted">Načítám…</p> : (
            <>
              <div class="row-head">
                <h2>Verze {v.n} <small class="muted">· vydání {v.release}</small></h2>
                {v.draftId && <a class="btn small" href={`/kontrola/${v.draftId}`} onClick={nav(`/kontrola/${v.draftId}`)}>Kontrola a komentáře</a>}
              </div>
              {!v.current && (
                <div class="actions-row">
                  <Busy class="btn" on={busy} onClick={propose}><I.undo />Navrhnout návrat k této verzi</Busy>
                  {me.role === 'admin' && <button class="btn danger" onClick={() => setRestoring(true)}>Vrátit hned bez kontroly</button>}
                </div>
              )}
              <div class="seg-pick small">
                <button class={against === 'previous' ? 'on' : ''} onClick={() => setAgainst('previous')}>Co tahle verze změnila</button>
                <button class={against === 'current' ? 'on' : ''} disabled={v.current} onClick={() => setAgainst('current')}>Rozdíl proti zveřejněné</button>
              </div>
              {shown.data === null ? <Empty>V této verzi bylo téma odebrané.</Empty>
                : against === 'current' && !v.current ? (current ? <TopicDiff a={shown.data} b={current} /> : <p class="muted">Téma teď není zveřejněné.</p>)
                : <TopicDiff a={shown.previous?.data ?? null} b={shown.data} />}
            </>
          )}
        </div>
      </div>
      {restoring && v && <RestoreNow version={v} onClose={() => setRestoring(false)} onDone={() => { setRestoring(false); refreshIndex(); load() }} />}
    </div>
  )
}

function RestoreNow({ version, onClose, onDone }: { version: Version; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setBusy(true)
    try {
      const r = await withConfirm(() => post<{ release: number }>(`/api/admin/versions/${version.id}/restore`, { note: note.trim() }))
      toast(`Verze ${version.n} je zpátky na sprtam.cz (vydání ${r.release}).`)
      onDone()
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se.', 'bad') } finally { setBusy(false) }
  }
  return (
    <Modal title={`Vrátit verzi ${version.n} hned`} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zpět</button><Busy class="btn danger" on={busy} disabled={note.trim().length < 3} onClick={send}>Vrátit a zveřejnit</Busy></>}>
      <p>Jen pro naléhavé případy (chyba, která nesmí zůstat ani chvíli). Verze se zveřejní <b>bez kontroly</b> dalším moderátorem. Nic se neztratí – vznikne nová verze a dá se zase vrátit.</p>
      <label class="field"><span>Důvod (zůstane v historii)</span><textarea rows={3} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={500} autoFocus /></label>
    </Modal>
  )
}
