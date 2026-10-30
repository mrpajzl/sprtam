import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, gradeSubjects, ODB, STAGES, subjectMeta, SUBJECTS, vocationalSubjects } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { Inline } from '../../../src/ui/Inline'
import { ApiError, api, get } from '../api'
import { go, nav } from '../router'
import { ago, Busy, dateTime, Empty, I, Modal, toast } from '../ui/kit'

// Error reports from pupils („Nahlásit chybu“ in the app): which question or explanation, what is wrong and an
// optional note. Nothing about who sent it. A moderator opens the topic, fixes it through a normal change and
// closes the report as fixed – or dismisses it when the content is right.

type Status = 'open' | 'fixed' | 'dismissed'
export interface ReportView {
  id: string; topic: string; title: string; emoji: string; target: { kind: 'question' | 'explanation'; index: number; text: string }
  reason: string; note: string; quote: string; release: number | null; status: Status; createdAt: number; decidedAt: number | null; decidedBy: string | null; decisionNote: string | null
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

export function Reports() {
  const { tab, ...f } = now()
  const fq = query(f)
  const [list, setList] = useState<ReportView[] | null>(null)
  const [count, setCount] = useState<{ open: number; closed: number } | null>(null)
  const [dismiss, setDismiss] = useState<ReportView | null>(null)
  const load = () => {
    get<ReportView[]>(`/api/reports?status=${tab}${fq ? `&${fq}` : ''}`).then(setList, (e) => toast(e.message, 'bad'))
    get<{ open: number; closed: number }>(`/api/reports/counts${fq ? `?${fq}` : ''}`).then(setCount, () => {})
  }
  useEffect(() => { setList(null); load() }, [tab, fq])
  const refilter = (change: Partial<Filter>) => go(reportsHref(tab, { ...f, topic: null, ...change }), true)
  const set = async (r: ReportView, status: Status, note = '') => {
    try {
      await api('PATCH', `/api/reports/${r.id}`, { status, note })
      toast(status === 'open' ? 'Hlášení je znovu otevřené.' : status === 'fixed' ? 'Hlášení je vyřízené jako opravené.' : 'Hlášení je zamítnuté.')
      load()
    } catch (e) { toast((e as ApiError).message, 'bad') }
  }
  const subjects = f.grade ? gradeSubjects(f.grade) : [...Object.keys(SUBJECTS), ...vocationalSubjects()]

  return (
    <div class="page-narrow">
      <h1>Hlášení od žáků</h1>
      <p class="muted">
        Žáci můžou u každé otázky a vysvětlení klepnout na „Nahlásit chybu“ nebo v textu označit, co je špatně. O odesílateli tu nic není – jen co nahlásil a proč.
        Otevři téma, oprav ho běžnou úpravou a hlášení pak označ jako opravené. Když je učivo v pořádku, hlášení zamítni.
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
          <select class="q-select" value={f.grade ?? ''} aria-label="Ročník" onChange={(e) => {
            const grade = (e.currentTarget.value || null) as GradeId | null
            refilter({ grade, subject: grade && f.subject && !gradeSubjects(grade).includes(f.subject) ? null : f.subject })
          }}>
            <option value="">Všechny ročníky</option>
            {STAGES.map((st) => <optgroup key={st.id} label={st.name}>{st.grades.map((g) => <option key={g} value={g}>{GRADE_NAME[g]}</option>)}</optgroup>)}
            <option value={ODB}>{GRADE_NAME[ODB]}</option>
          </select>
          <select class="q-select" value={f.subject ?? ''} aria-label="Předmět" disabled={!f.grade} onChange={(e) => refilter({ subject: (e.currentTarget.value || null) as SubjectId | null })}>
            <option value="">Všechny předměty</option>
            {subjects.map((x) => <option key={x} value={x}>{subjectMeta(x).name}</option>)}
          </select>
        </>}
      </div>
      {!list ? <p class="muted">Načítám…</p> : !list.length ? <Empty>{tab === 'open' ? 'Žádné otevřené hlášení. Paráda.' : 'Zatím žádné vyřízené hlášení.'}</Empty> : (
        <div class="requests">
          {list.map((r) => {
            const [g, s, id] = r.topic.split('/')
            const href = `/ucivo/${g}/${s}/${id}`
            return (
              <article key={r.id} class={`request report ${r.status}`}>
                <div class="rq-main">
                  <div class="row-head">
                    <h2><a href={href} onClick={nav(href)}>{r.emoji} {r.title}</a></h2>
                    <span class={`pill ${r.status === 'open' ? 'st-review' : r.status === 'fixed' ? 'st-published' : 'st-withdrawn'}`}>{REASON[r.reason] ?? r.reason}</span>
                  </div>
                  <small class="fine">{GRADE_NAME[g as GradeId] ?? g} · {subjectMeta(s as SubjectId)?.name ?? s}</small>
                  <p class="rq-body">
                    <b>{r.target.kind === 'question' ? `Otázka ${r.target.index + 1}: ` : 'Vysvětlení '}</b>
                    {r.target.kind === 'question' ? <Inline text={r.target.text} /> : `„${r.target.text}“`}
                  </p>
                  {r.quote && <p class="rq-more"><b>Označený text:</b> <mark class="rq-quote">„{r.quote}“</mark></p>}
                  {r.note && <p class="rq-more"><b>Poznámka žáka:</b> {r.note}</p>}
                  {r.status !== 'open' && (
                    <p class={`banner ${r.status === 'fixed' ? 'ok' : 'info'}`}>
                      {r.status === 'fixed' ? <I.check /> : <I.close />}
                      {r.status === 'fixed' ? 'Opraveno' : 'Zamítnuto'}{r.decidedBy ? ` · ${r.decidedBy}` : ''}{r.decidedAt ? ` · ${ago(r.decidedAt)}` : ''}{r.decisionNote ? ` – ${r.decisionNote}` : ''}
                    </p>
                  )}
                  <small class="fine" title={dateTime(r.createdAt)}>Nahlášeno {ago(r.createdAt)}{r.release !== null ? ` · ve vydání ${r.release}` : ''}</small>
                  <div class="actions-row">
                    <a class="btn small" href={href} onClick={nav(href)}><I.eye />Otevřít téma</a>
                    {r.status === 'open' ? <>
                      <button class="btn small primary" onClick={() => set(r, 'fixed')}><I.check />Opraveno</button>
                      <button class="btn small" onClick={() => setDismiss(r)}><I.close />Zamítnout</button>
                    </> : <button class="btn small" onClick={() => set(r, 'open')}><I.undo />Znovu otevřít</button>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {dismiss && <Dismiss r={dismiss} onClose={() => setDismiss(null)} onDone={async (note) => { await set(dismiss, 'dismissed', note); setDismiss(null) }} />}
    </div>
  )
}

function Dismiss({ r, onClose, onDone }: { r: ReportView; onClose: () => void; onDone: (note: string) => Promise<void> }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => { setBusy(true); try { await onDone(note) } finally { setBusy(false) } }
  return (
    <Modal title="Zamítnout hlášení" onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zrušit</button><Busy class="btn primary" on={busy} onClick={send}>Zamítnout</Busy></>}>
      <form class="form" onSubmit={(e) => { e.preventDefault(); send() }}>
        <p class="muted">{r.emoji} {r.title} · {r.target.kind === 'question' ? `otázka ${r.target.index + 1}` : `vysvětlení „${r.target.text}“`}</p>
        <label class="field">
          <span>Proč je učivo v pořádku (nepovinné)</span>
          <textarea rows={3} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={1000} placeholder="Pro ostatní moderátory, žák poznámku neuvidí." autoFocus />
        </label>
      </form>
    </Modal>
  )
}
