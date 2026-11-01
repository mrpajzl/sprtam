import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, gradeSubjects, subjectMeta, SUBJECTS, vocationalSubjects } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { Inline } from '../../../src/ui/Inline'
import { ApiError, get, post } from '../api'
import { refreshClaims, release, take, untilText } from '../claims'
import type { Me } from '../passkey'
import { KeysHint, step, useKeys } from '../ui/keys'
import { saveReply, SavedReplies } from '../ui/replies'
import { go, nav } from '../router'
import { ago, Busy, dateTime, Empty, I, Modal, toast } from '../ui/kit'
import { Select } from '../../../src/ui/Select'
import { gradeOptions, subjectOptions } from '../ui/filters'

// Error reports from pupils („Nahlásit chybu“ in the app): which question or explanation, what is wrong and an
// optional note. Nothing about who sent it. A moderator opens the topic, fixes it through a normal change and
// closes the report as fixed – or dismisses it when the content is right.

type Status = 'open' | 'fixed' | 'dismissed'
export interface ReportView {
  id: string; topic: string; title: string; emoji: string; target: { kind: 'question' | 'explanation'; index: number; text: string }
  reason: string; note: string; quote: string; release: number | null; status: Status; createdAt: number; decidedAt: number | null; decidedBy: string | null; decisionNote: string | null
  /** The open draft it is being fixed in ("Opravit"). */
  fix: { draft: string; status: 'draft' | 'review'; author: { id: string; name: string } } | null
  claim: { userId: string; name: string; until: number } | null
}

const REASON: Record<string, string> = { wrong: 'Špatná odpověď nebo chyba', unclear: 'Nejasné zadání', typo: 'Překlep', other: 'Jiné' }
const TABS = [{ id: 'open', name: 'Otevřená', slug: '' }, { id: 'closed', name: 'Vyřízená', slug: 'vyrizena' }] as const
type Tab = (typeof TABS)[number]['id']
interface Filter { grade: GradeId | null; subject: SubjectId | null; topic: string | null }

/** The tab and filters live in the address (?stav=vyrizena&rocnik=z6&predmet=matematika&tema=z6/matematika/zlomky). */
export function reportsHref(tab: Tab, f: Partial<Filter> = {}) {
  const q = new URLSearchParams()
  const slug = TABS.find((x) => x.id === tab)!.slug
  if (slug) q.set('stav', slug)
  if (f.topic) q.set('tema', f.topic)
  else {
    if (f.grade) q.set('rocnik', f.grade)
    if (f.subject) q.set('predmet', f.subject)
  }
  const s = q.toString()
  return `/hlaseni${s ? `?${s}` : ''}`
}

function now(): { tab: Tab } & Filter {
  const q = new URLSearchParams(location.search)
  const grade = q.get('rocnik'), subject = q.get('predmet'), topic = q.get('tema')
  return {
    tab: TABS.find((x) => x.slug && x.slug === q.get('stav'))?.id ?? 'open',
    grade: grade && grade in GRADE_NAME ? grade as GradeId : null,
    subject: subject && subject in SUBJECTS ? subject as SubjectId : null,
    topic: topic && /^[a-z0-9]+\/[a-z]+\/[a-z0-9-]+$/.test(topic) ? topic : null,
  }
}

const query = (f: Filter) => {
  const q = new URLSearchParams()
  if (f.topic) q.set('topic', f.topic)
  if (f.grade) q.set('grade', f.grade)
  if (f.subject) q.set('subject', f.subject)
  return q.toString()
}

/** Reports about the same place of the same topic, as several pupils send them: one card, one decision. */
interface Group { key: string; first: ReportView; all: ReportView[] }
function groups(list: ReportView[]): Group[] {
  const by = new Map<string, Group>()
  for (const r of list) {
    const k = r.status === 'open' ? `${r.topic}|${r.target.kind}|${r.target.index}|${r.target.text}` : r.id
    const gr = by.get(k)
    if (gr) gr.all.push(r)
    else by.set(k, { key: k, first: r, all: [r] })
  }
  return [...by.values()]
}

export function Reports({ me }: { me: Me }) {
  const { tab, ...f } = now()
  const fq = query(f)
  const [list, setList] = useState<ReportView[] | null>(null)
  const [count, setCount] = useState<{ open: number; closed: number } | null>(null)
  const [dismiss, setDismiss] = useState<Group | null>(null)
  const [cur, setCur] = useState(-1)
  const [busy, setBusy] = useState('')
  const load = () => {
    get<ReportView[]>(`/api/reports?status=${tab}${fq ? `&${fq}` : ''}`).then(setList, (e) => toast(e.message, 'bad'))
    get<{ open: number; closed: number }>(`/api/reports/counts${fq ? `?${fq}` : ''}`).then(setCount, () => {})
  }
  useEffect(() => { setList(null); setCur(-1); load() }, [tab, fq])
  const refilter = (change: Partial<Filter>) => go(reportsHref(tab, { ...f, topic: null, ...change }), true)
  const set = async (gr: Group, status: Status, note = '') => {
    try {
      await post('/api/reports/update', { ids: gr.all.map((r) => r.id), status, note })
      const n = gr.all.length > 1 ? ` (${gr.all.length})` : ''
      toast(status === 'open' ? 'Hlášení je znovu otevřené.' : status === 'fixed' ? `Vyřízeno jako opravené${n}.` : `Hlášení zamítnuto${n}.`)
      load()
    } catch (e) { toast((e as ApiError).message, 'bad') }
  }
  // "Opravit": my draft of the topic, with these reports pinned in the editor; publishing it closes them.
  const fix = async (gr: Group) => {
    setBusy(gr.key)
    try {
      const { draft } = await post<{ draft: string }>('/api/reports/fix', { ids: gr.all.map((r) => r.id) })
      refreshClaims()
      go(`/navrh/${draft}?hlaseni=${gr.first.id}`)
    } catch (e) { toast((e as ApiError).message, 'bad'); setBusy('') }
  }
  const claimAll = async (gr: Group) => {
    const mine = gr.first.claim?.userId === me.id
    for (const r of gr.all) mine ? await release('report', r.id) : await take('report', r.id)
    load()
  }
  const subjects = f.grade ? gradeSubjects(f.grade) : [...Object.keys(SUBJECTS), ...vocationalSubjects()]
  const cards = list ? groups(list) : []
  const at = cards[cur]
  const help = useKeys([
    { key: 'j', label: 'Další hlášení', run: () => setCur(step(cards, cur, 1)) },
    { key: 'k', label: 'Předchozí hlášení', run: () => setCur(step(cards, cur, -1)) },
    { key: 'o', label: 'Opravit (otevře editor s hlášením)', when: !!at && tab === 'open', run: () => fix(at!) },
    { key: 't', label: 'Otevřít téma', when: !!at, run: () => go(`/ucivo/${at!.first.topic}`) },
    { key: 'f', label: 'Označit jako opravené', when: !!at && tab === 'open', run: () => set(at!, 'fixed') },
    { key: 'z', label: 'Zamítnout', when: !!at && tab === 'open', run: () => setDismiss(at!) },
    { key: 'b', label: 'Beru si to / uvolnit', when: !!at && tab === 'open', run: () => claimAll(at!) },
  ], 'Zkratky v hlášeních')
  useEffect(() => { if (cur >= 0) document.getElementById(`rp-${cur}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [cur])

  return (
    <div class="page-narrow">
      <h1>Hlášení od žáků</h1>
      <p class="muted">
        Žáci můžou u každé otázky a vysvětlení klepnout na „Nahlásit chybu“ nebo v textu označit, co je špatně. O odesílateli tu nic není – jen co nahlásil a proč.
        <b> Opravit</b> otevře téma v editoru i s hlášením; až se oprava schválí, hlášení se samo vyřídí. Když je učivo v pořádku, hlášení zamítni. Stejná hlášení od více žáků jsou spojená.
      </p>
      <div class="q-filters">
        <nav class="seg-tabs" aria-label="Hlášení podle stavu">
          {TABS.map((t) => {
            const n = count?.[t.id]
            const href = reportsHref(t.id, f)
            return <a key={t.id} href={href} onClick={nav(href)} class={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined}>{t.name}{n !== undefined && ` · ${n}`}</a>
          })}
        </nav>
        {f.topic ? (
          <span class="pill">{f.topic}<button class="icon s" onClick={() => refilter({ topic: null })} aria-label="Zrušit filtr tématu"><I.close /></button></span>
        ) : <>
          <Select class="q-select" label="Ročník" value={f.grade ?? ''} options={gradeOptions} onChange={(v) => {
            const grade = (v || null) as GradeId | null
            refilter({ grade, subject: grade && f.subject && !gradeSubjects(grade).includes(f.subject) ? null : f.subject })
          }} />
          <Select class="q-select" label="Předmět" value={f.subject ?? ''} disabled={!f.grade} options={subjectOptions(subjects)} onChange={(v) => refilter({ subject: (v || null) as SubjectId | null })} />
        </>}
      </div>
      <KeysHint />
      {!list ? <p class="muted">Načítám…</p> : !list.length ? <Empty>{tab === 'open' ? 'Žádné otevřené hlášení. Paráda.' : 'Zatím žádné vyřízené hlášení.'}</Empty> : (
        <div class="requests">
          {cards.map((gr, i) => {
            const r = gr.first
            const [g, s, id] = r.topic.split('/')
            const href = `/ucivo/${g}/${s}/${id}`
            const claim = r.claim
            return (
              <article key={gr.key} id={`rp-${i}`} class={`request report ${r.status} ${cur === i ? 'cur' : ''}`}>
                <div class="rq-main">
                  <div class="row-head">
                    <h2><a href={href} onClick={nav(href)}>{r.emoji} {r.title}</a></h2>
                    {gr.all.length > 1 && <span class="pill warn">{gr.all.length}× nahlášeno</span>}
                    <span class={`pill ${r.status === 'open' ? 'st-review' : r.status === 'fixed' ? 'st-published' : 'st-withdrawn'}`}>{REASON[r.reason] ?? r.reason}</span>
                  </div>
                  <small class="fine">{GRADE_NAME[g as GradeId] ?? g} · {subjectMeta(s as SubjectId)?.name ?? s}</small>
                  <p class="rq-body">
                    <b>{r.target.kind === 'question' ? `Otázka ${r.target.index + 1}: ` : 'Vysvětlení '}</b>
                    {r.target.kind === 'question' ? <Inline text={r.target.text} /> : `„${r.target.text}“`}
                  </p>
                  {gr.all.map((x) => (x.quote || x.note || gr.all.length > 1) && (
                    <div key={x.id} class="rq-pupil">
                      {gr.all.length > 1 && <small class="fine">{REASON[x.reason] ?? x.reason} · {ago(x.createdAt)}</small>}
                      {x.quote && <p class="rq-more"><b>Označený text:</b> <mark class="rq-quote">„{x.quote}“</mark></p>}
                      {x.note && <p class="rq-more"><b>Poznámka žáka:</b> {x.note}</p>}
                    </div>
                  ))}
                  {r.fix && (
                    <p class="banner info"><I.wrench />{r.fix.author.id === me.id ? 'Opravuješ to' : `Opravuje ${r.fix.author.name}`} v návrhu{r.fix.status === 'review' ? ', který čeká na kontrolu' : ''}. Po zveřejnění se hlášení samo vyřídí.
                      <a class="btn small" href={r.fix.status === 'review' ? `/kontrola/${r.fix.draft}` : `/navrh/${r.fix.draft}`} onClick={nav(r.fix.status === 'review' ? `/kontrola/${r.fix.draft}` : `/navrh/${r.fix.draft}`)}>{r.fix.status === 'review' ? 'Kontrola' : 'Návrh'}</a></p>
                  )}
                  {!r.fix && claim && <p class={`claim-line ${claim.userId === me.id ? 'mine' : 'other'}`}><I.flag />{claim.userId === me.id ? `Máš zamluveno do ${untilText(claim.until)}.` : `Bere si ${claim.name} (do ${untilText(claim.until)}).`}</p>}
                  {r.status !== 'open' && (
                    <p class={`banner ${r.status === 'fixed' ? 'ok' : 'info'}`}>
                      {r.status === 'fixed' ? <I.check /> : <I.close />}
                      {r.status === 'fixed' ? 'Opraveno' : 'Zamítnuto'}{r.decidedBy ? ` · ${r.decidedBy}` : ''}{r.decidedAt ? ` · ${ago(r.decidedAt)}` : ''}{r.decisionNote ? ` – ${r.decisionNote}` : ''}
                    </p>
                  )}
                  <small class="fine" title={dateTime(r.createdAt)}>Nahlášeno {ago(r.createdAt)}{r.release !== null ? ` · ve vydání ${r.release}` : ''}</small>
                  <div class="actions-row">
                    {r.status === 'open' ? <>
                      {!r.fix && <Busy class="btn small primary" on={busy === gr.key} onClick={() => fix(gr)}><I.wrench />Opravit</Busy>}
                      <a class="btn small" href={href} onClick={nav(href)}><I.eye />Otevřít téma</a>
                      <button class="btn small" onClick={() => set(gr, 'fixed')}><I.check />Opraveno</button>
                      <button class="btn small" onClick={() => setDismiss(gr)}><I.close />Zamítnout</button>
                      {!r.fix && (!claim || claim.userId === me.id) && <button class={`btn small ${claim ? 'on' : ''}`} aria-pressed={!!claim} onClick={() => claimAll(gr)}><I.flag />{claim ? 'Uvolnit' : 'Beru si to'}</button>}
                    </> : <>
                      <a class="btn small" href={href} onClick={nav(href)}><I.eye />Otevřít téma</a>
                      <button class="btn small" onClick={() => set(gr, 'open')}><I.undo />Znovu otevřít</button>
                    </>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {dismiss && <Dismiss r={dismiss.first} n={dismiss.all.length} onClose={() => setDismiss(null)} onDone={async (note) => { await set(dismiss, 'dismissed', note); setDismiss(null) }} />}
      {help}
    </div>
  )
}

function Dismiss({ r, n, onClose, onDone }: { r: ReportView; n: number; onClose: () => void; onDone: (note: string) => Promise<void> }) {
  const [note, setNote] = useState('')
  const [keep, setKeep] = useState(false)
  const [busy, setBusy] = useState(false)
  const send = async () => { setBusy(true); try { if (keep && note.trim()) await saveReply('report', note); await onDone(note) } finally { setBusy(false) } }
  return (
    <Modal title={n > 1 ? `Zamítnout ${n} hlášení` : 'Zamítnout hlášení'} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zrušit</button><Busy class="btn primary" on={busy} onClick={send}>Zamítnout</Busy></>}>
      <form class="form" onSubmit={(e) => { e.preventDefault(); send() }}>
        <p class="muted">{r.emoji} {r.title} · {r.target.kind === 'question' ? `otázka ${r.target.index + 1}` : `vysvětlení „${r.target.text}“`}</p>
        <label class="field">
          <span>Proč je učivo v pořádku (nepovinné)</span>
          <textarea rows={3} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={1000} placeholder="Pro ostatní moderátory, žák poznámku neuvidí." autoFocus />
        </label>
        <SavedReplies kind="report" text={note} setText={setNote} keep={keep} setKeep={setKeep} />
      </form>
    </Modal>
  )
}
