import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, subjectMeta } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { get, post } from '../api'
import { untilText } from '../claims'
import { go, nav } from '../router'
import { reportsHref } from './Reports'
import { ago, dateTime, Empty, I, toast } from '../ui/kit'

// "Na mně" (moderator/server/work.ts inbox): one place for what concerns me – changes waiting for my decision, replies
// in my conversations, decisions about my changes, pupils' reports about topics I wrote or checked, and what I took.
// Seen items stay listed (greyed) for 30 days; the number on the tab counts the unseen ones.

type Kind = 'reply' | 'comment' | 'changes' | 'approved' | 'published' | 'rejected' | 'report'
interface Item { id: string; kind: Kind; at: number; by: string | null; text: string; title: string; grade: GradeId; subject: SubjectId; href: string; seen: boolean }
interface Waiting { id: string; title: string; grade: GradeId; subject: SubjectId; author: string; at: number; conflict: boolean; kind: 'edit' | 'new' }
interface Mine { kind: 'report' | 'topic'; ref: string; until: number; topic: string; title: string }
export interface InboxData { waiting: Waiting[]; items: Item[]; unread: number; claims: Mine[] }

const WHAT: Record<Kind, (by: string | null) => string> = {
  reply: (by) => `${by} odpověděl/a ve vlákně`,
  comment: (by) => `${by} napsal/a ke tvé změně`,
  changes: (by) => `${by} žádá o úpravy tvé změny`,
  approved: (by) => `${by} schválil/a tvou změnu`,
  published: (by) => `Tvoje změna je zveřejněná${by ? ` (schválil/a ${by})` : ''}`,
  rejected: (by) => `Tvoje změna byla zamítnuta${by ? ` (${by})` : ''}`,
  report: () => 'Nové hlášení od žáka k tvému tématu',
}
const ICON: Record<Kind, () => preact.JSX.Element> = { reply: I.send, comment: I.send, changes: I.pencil, approved: I.check, published: I.check, rejected: I.close, report: I.warn }

const where = (g: GradeId, s: SubjectId) => `${GRADE_NAME[g] ?? g} · ${subjectMeta(s)?.name ?? s}`

export function Inbox({ onCount }: { onCount: (n: number) => void }) {
  const [data, setData] = useState<InboxData | null>(null)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const load = () => get<InboxData>('/api/inbox').then((d) => { setData(d); onCount(d.unread) }, (e) => toast(e.message, 'bad'))
  useEffect(() => { load() }, [])
  const open = async (i: Item) => {
    if (!i.seen) post('/api/inbox/seen', { items: [i.id] }).catch(() => {})
    go(i.href)
  }
  const allSeen = async () => { await post('/api/inbox/seen', { all: true }).catch(() => {}); load() }
  if (!data) return <div class="page-narrow"><h1>Na mně</h1><p class="muted">Načítám…</p></div>
  const items = unreadOnly ? data.items.filter((i) => !i.seen) : data.items

  return (
    <div class="page-narrow inbox">
      <h1>Na mně</h1>
      <p class="muted">Co se týká tebe: změny, které čekají na tvoje rozhodnutí, odpovědi v tvých konverzacích, rozhodnutí o tvých změnách a hlášení k tématům, která jsi napsal/a nebo zkontroloval/a. Za posledních 30 dní.</p>

      <section class="draft-group">
        <h2 class="label">Čeká na tvoje rozhodnutí · {data.waiting.length}</h2>
        {data.waiting.length ? (
          <div class="drafts">
            {data.waiting.map((w) => (
              <a key={w.id} class="draft" href={`/kontrola/${w.id}`} onClick={nav(`/kontrola/${w.id}`)}>
                <span class="d-main"><b>{w.kind === 'new' && <span class="pill">nové</span>} {w.title}</b><small>{where(w.grade, w.subject)} · {w.author} · odesláno {ago(w.at)}</small></span>
                {w.conflict && <span class="pill warn">konflikt</span>}
                <span class="btn small primary">Zkontrolovat</span>
              </a>
            ))}
          </div>
        ) : <p class="fine">Nic. Až někdo pošle změnu ke kontrole, objeví se tady.</p>}
      </section>

      <section class="draft-group">
        <div class="row-head">
          <h2 class="label">Novinky{data.unread ? ` · ${data.unread} nových` : ''}</h2>
          <span class="inbox-tools">
            <label class="toggle fine"><input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.currentTarget.checked)} />Jen nové</label>
            {data.unread > 0 && <button class="btn small" onClick={allSeen}><I.check />Označit vše jako přečtené</button>}
          </span>
        </div>
        {items.length ? (
          <ul class="inbox-list">
            {items.map((i) => {
              const Icon = ICON[i.kind]
              return (
                <li key={i.id} class={i.seen ? 'seen' : 'new'}>
                  <a href={i.href} onClick={(e) => { if (e.button === 0 && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(i) } }}>
                    <span class={`ib-icon k-${i.kind}`}><Icon /></span>
                    <span class="ib-main">
                      <b>{WHAT[i.kind](i.by)}</b>
                      <small>{i.title} · {where(i.grade, i.subject)} · <span title={dateTime(i.at)}>{ago(i.at)}</span></small>
                      {i.text && <span class="ib-text">{i.text}</span>}
                    </span>
                    {!i.seen && <i class="ib-dot" aria-label="nové" />}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : <Empty>{unreadOnly ? 'Nic nového.' : 'Za posledních 30 dní tu nic není.'}</Empty>}
      </section>

      {data.claims.length > 0 && (
        <section class="draft-group">
          <h2 class="label">Máš zamluveno · {data.claims.length}</h2>
          <div class="drafts">
            {data.claims.map((c) => {
              const href = c.kind === 'topic' ? `/ucivo/${c.topic}` : reportsHref('open', { topic: c.topic })
              return (
                <a key={`${c.kind}:${c.ref}`} class="draft" href={href} onClick={nav(href)}>
                  <span class="d-main"><b><I.flag /> {c.kind === 'topic' ? 'Ověřit' : 'Hlášení'}: {c.title}</b><small>do {untilText(c.until)}</small></span>
                  <I.right />
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
