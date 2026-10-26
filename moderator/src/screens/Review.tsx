import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, SUBJECTS } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { ApiError, get, post } from '../api'
import { DiffStats, TopicDiff } from '../diff/Diff'
import { Preview } from '../editor/Preview'
import type { Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { go, nav } from '../router'
import { approvalText, refreshIndex, STATUS, useIndex, type DraftFull, type DraftView, type ReviewView } from '../store'
import { ago, Busy, dateTime, Empty, I, Modal, toast } from '../ui/kit'

// Review of other moderators' changes (docs/MODERACE.md): /kontrola is the queue, /kontrola/<id> one change –
// what changed against the published version, the draft in the phone, comments on single blocks and questions,
// and the decision. Enough approvals of the current revision publish the change at once.

type QueueItem = DraftView & { mine: boolean; myVerdict: 'approve' | 'changes' | null }

/** explanations[1].blocks[4] → that block in the phone; questions[3] → that question. */
function modeOf(anchor: string): PreviewMode {
  const q = /^questions\[(\d+)\]/.exec(anchor)
  if (q) return { kind: 'quiz', q: Number(q[1]) }
  const b = /^explanations\[(\d+)\](?:\.blocks\[(\d+)\])?/.exec(anchor)
  return { kind: 'topic', ex: Number(b?.[1] ?? 0), ...(b?.[2] !== undefined ? { block: Number(b[2]) } : {}) }
}

const where = (d: DraftView) => `${GRADE_NAME[d.grade as GradeId]} · ${SUBJECTS[d.subject as SubjectId]?.name}`

export function ReviewQueue() {
  const [list, setList] = useState<QueueItem[] | null>(null)
  useEffect(() => { get<QueueItem[]>('/api/reviews').then(setList, (e) => toast(e.message, 'bad')) }, [])
  if (!list) return <div class="page-narrow"><h1>Ke kontrole</h1><p class="muted">Načítám…</p></div>
  const waiting = list.filter((d) => !d.mine && !d.myVerdict)
  const done = list.filter((d) => !d.mine && d.myVerdict)
  const mine = list.filter((d) => d.mine)
  const Row = ({ d }: { d: QueueItem }) => (
    <a class="draft" href={`/kontrola/${d.id}`} onClick={nav(`/kontrola/${d.id}`)}>
      <span class="d-main">
        <b>{d.kind === 'new' && <span class="pill">nové</span>} {d.rollbackOf && <span class="pill">návrat</span>} {d.title}</b>
        <small>{where(d)} · {d.author.name} · odesláno {ago(d.submittedAt)}</small>
      </span>
      {d.conflict && <span class="pill warn">konflikt</span>}
      {d.changes.length > 0 && <span class="pill warn">požadavek na úpravy</span>}
      {d.myVerdict === 'approve' && <span class="pill st-published">schválil/a jsi</span>}
      <span class="pill st-review">{approvalText(d)}</span>
      <I.right />
    </a>
  )
  return (
    <div class="page-narrow">
      <h1>Ke kontrole</h1>
      <p class="muted">Změny učiva od ostatních moderátorů. Každá se zveřejní, až ji schválí {list[0]?.needed === 1 || !list.length ? 'někdo další' : `${list[0].needed} další`} – vlastní změnu schválit nejde.</p>
      {!list.length && <Empty>Teď nic nečeká na kontrolu. 🎉</Empty>}
      {[['Čeká na tebe', waiting], ['Už jsi to viděl/a', done], ['Tvoje změny v kontrole', mine]].map(([name, ds]) => (ds as QueueItem[]).length > 0 && (
        <section key={name as string} class="draft-group">
          <h2 class="label">{name as string} · {(ds as QueueItem[]).length}</h2>
          <div class="drafts">{(ds as QueueItem[]).map((d) => <Row key={d.id} d={d} />)}</div>
        </section>
      ))}
    </div>
  )
}

export function Review({ id, me }: { id: string; me: Me }) {
  const index = useIndex()
  const [data, setData] = useState<DraftFull | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<PreviewMode>({ kind: 'topic', ex: 0 })
  const [ask, setAsk] = useState<null | 'changes' | 'reject'>(null)
  const [busy, setBusy] = useState(false)
  const load = () => get<DraftFull>(`/api/drafts/${id}`).then(setData, (e) => setError(e instanceof ApiError ? e.message : 'Návrh se nepodařilo načíst.'))
  useEffect(() => { setData(null); load() }, [id])

  if (error) return <div class="empty-state">{error} <a href="/kontrola" onClick={nav('/kontrola')}>Zpět ke kontrole</a></div>
  if (!data) return <div class="boot" />
  const d = data.draft
  const own = d.author.id === me.id
  const inReview = d.status === 'review'
  const g = d.grade as GradeId, s = d.subject as SubjectId
  const myDecision = data.reviews.filter((r) => !r.stale && r.user.id === me.id && r.verdict !== 'comment').pop()?.verdict
  const willPublish = d.approvals.filter((a) => a.id !== me.id).length + 1 >= d.needed && !d.changes.some((c) => c.id !== me.id)

  const act = async (path: string, body: object, ok: string) => {
    setBusy(true)
    try {
      const r = await post<DraftFull & { released?: number | null }>(`/api/drafts/${d.id}/${path}`, body)
      setData(r); refreshIndex()
      toast(r.released ? `Zveřejněno! Na sprtam.cz je to jako vydání ${r.released}.` : ok)
      return true
    } catch (e) {
      const ex = e as ApiError
      toast(ex.message ?? 'Akce se nepovedla.', 'bad')
      if (ex.code === 'stale') load()
      return false
    } finally { setBusy(false) }
  }
  const comment = (body: string, anchor: string | null) => act('review', { verdict: 'comment', body, anchor }, 'Komentář přidán')

  const anchored = (anchor: string) => <Thread reviews={data.reviews.filter((r) => r.anchor === anchor)} anchor={anchor} me={me} draft={d} onComment={comment} onResolve={(r) => act(`reviews/${r.id}/resolve`, {}, r.resolvedAt ? 'Znovu otevřeno' : 'Vyřešeno')} />

  return (
    <div class="review">
      <header class="v-head">
        <a class="v-up" href={own ? '/navrhy' : '/kontrola'} onClick={nav(own ? '/navrhy' : '/kontrola')}><I.back />{own ? 'Moje návrhy' : 'Ke kontrole'}</a>
        <div class="v-title">
          <span class="v-em">{data.topic.emoji}</span>
          <div>
            <h1>{data.topic.title}</h1>
            <small>{where(d)} · {d.kind === 'new' ? 'nové téma' : d.rollbackOf ? 'návrat ke starší verzi' : 'úprava'} · {d.author.name}{d.submittedAt ? ` · odesláno ${ago(d.submittedAt)}` : ''} · <DiffStats a={data.base} b={data.topic} /></small>
          </div>
        </div>
        <div class="v-actions">
          <span class={`pill st-${d.status}`}>{STATUS[d.status]}</span>
          {inReview && <span class="pill">{approvalText(d)}</span>}
        </div>
      </header>

      <Banners data={data} own={own} busy={busy} onRebase={() => act('rebase', {}, 'Návrh teď vychází ze zveřejněné verze. Zkontroluj ho a pošli znovu.')} />

      {d.note && <blockquote class="r-note"><b>{d.author.name}:</b> {d.note}</blockquote>}
      {data.problems.length > 0 && (inReview || d.status === 'draft') && (
        <div class="banner bad"><I.warn />Téma ještě není v pořádku, schválit ho nejde: {data.problems.slice(0, 3).map((p) => p.message).join(' · ')}{data.problems.length > 3 ? ` (+${data.problems.length - 3})` : ''}</div>
      )}

      <div class="r-actions">
        {inReview && !own && <>
          <Busy class="btn primary" on={busy} disabled={d.conflict || data.problems.length > 0 || myDecision === 'approve'} onClick={() => act('review', { verdict: 'approve', rev: d.rev }, 'Schváleno')}>
            <I.check />{myDecision === 'approve' ? 'Schválil/a jsi' : willPublish ? 'Schválit a zveřejnit' : 'Schválit'}
          </Busy>
          <button class="btn" disabled={busy} onClick={() => setAsk('changes')}><I.pencil />Požádat o úpravy</button>
        </>}
        {own && (d.status === 'draft' || inReview) && <a class="btn" href={`/navrh/${d.id}`} onClick={nav(`/navrh/${d.id}`)}><I.pencil />Upravit</a>}
        {own && inReview && <Busy class="btn" on={busy} onClick={() => act('withdraw', {}, 'Návrh je zpátky v rozpracovaných')}>Vrátit do rozpracovaných</Busy>}
        {me.role === 'admin' && (d.status === 'draft' || inReview) && !own && <button class="btn danger" disabled={busy} onClick={() => setAsk('reject')}>Zamítnout</button>}
        {d.kind === 'edit' && <a class="btn" href={`/historie/${g}/${s}/${d.topicId}`} onClick={nav(`/historie/${g}/${s}/${d.topicId}`)}><I.undo />Historie tématu</a>}
      </div>
      {inReview && !own && willPublish && !d.conflict && !data.problems.length && myDecision !== 'approve' && <p class="fine">Tvým schválením se změna hned zveřejní na sprtam.cz. Schvaluješ přesně verzi, kterou vidíš.</p>}

      <div class="r-body">
        <div class="r-main">
          <h2 class="label">{data.base ? 'Změny proti verzi, ze které autor vycházel' : 'Celé nové téma'}</h2>
          <TopicDiff a={data.base} b={data.topic} ctx={{ render: anchored, pick: (a) => setMode(modeOf(a)) }} />
          <h2 class="label">Komentáře k celé změně</h2>
          <Thread reviews={data.reviews.filter((r) => !r.anchor)} anchor={null} me={me} draft={d} onComment={comment} onResolve={(r) => act(`reviews/${r.id}/resolve`, {}, r.resolvedAt ? 'Znovu otevřeno' : 'Vyřešeno')} decisions />
        </div>
        <aside class="v-phone">
          <Preview topic={data.topic} grade={g} subject={s} approaches={index?.approaches ?? []} mode={mode} onMode={setMode} />
        </aside>
      </div>

      {ask && <Ask kind={ask} busy={busy} onClose={() => setAsk(null)} onSend={async (text) => {
        const ok = ask === 'changes' ? await act('review', { verdict: 'changes', body: text }, 'Autor uvidí, co upravit') : await act('reject', { note: text }, 'Návrh zamítnut')
        if (ok) setAsk(null)
      }} />}
    </div>
  )
}

function Banners({ data, own, busy, onRebase }: { data: DraftFull; own: boolean; busy: boolean; onRebase: () => void }) {
  const d = data.draft
  if (d.status === 'published') return <div class="banner ok"><I.check />Zveřejněno {d.decidedAt ? dateTime(d.decidedAt) : ''}{d.release ? ` jako vydání ${d.release}` : ''}{d.decidedBy ? ` – rozhodl/a ${d.decidedBy}` : ''}. {d.legacyPrUrl && <a href={d.legacyPrUrl} target="_blank" rel="noopener noreferrer">pull request</a>}</div>
  if (d.status === 'rejected') return <div class="banner bad"><I.warn />Zamítnuto ({d.decidedBy}): {d.decisionNote}</div>
  if (d.status === 'withdrawn') return <div class="banner warn"><I.warn />Návrh byl stažen.</div>
  if (d.conflict) {
    return (
      <div class="banner warn">
        <I.warn />{d.kind === 'edit' ? 'Téma mezitím někdo jiný změnil a jeho změna je už zveřejněná.' : 'Téma s tímto id už v učivu mezitím je.'}
        {own && d.kind === 'edit' ? <>{' '}Podívej se, co se změnilo, přenes to do svého návrhu a pak ho převeď na novou verzi.<Busy class="btn small" on={busy} onClick={onRebase}>Převést na novou verzi</Busy></> : ' Autor ho musí nejdřív převést na novou verzi.'}
        {d.kind === 'edit' && data.published && (
          <details class="r-conflict"><summary>Co se mezitím zveřejnilo</summary><TopicDiff a={data.base} b={data.published} /></details>
        )}
      </div>
    )
  }
  if (d.status === 'draft') return <div class="banner info"><I.pencil />{own ? 'Rozpracováno – ostatní to uvidí, až to odešleš ke kontrole.' : 'Autor návrh vrátil do rozpracovaných.'}</div>
  if (d.changes.length) return <div class="banner warn"><I.warn />O úpravy žádá {d.changes.map((c) => c.name).join(', ')}. {own ? 'Po úpravě se kontrola počítá znovu.' : ''}</div>
  return null
}

const VERDICT = { approve: 'schválil/a', changes: 'žádá úpravy', comment: '' }

function Thread({ reviews, anchor, me, draft, onComment, onResolve, decisions }: {
  reviews: ReviewView[]; anchor: string | null; me: Me; draft: DraftView; onComment: (body: string, anchor: string | null) => Promise<boolean>; onResolve: (r: ReviewView) => void; decisions?: boolean
}) {
  const [writing, setWriting] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const shown = decisions ? reviews : reviews.filter((r) => r.verdict === 'comment' || r.body)
  const canWrite = draft.status === 'review' || draft.status === 'draft'
  const send = async () => { setBusy(true); if (await onComment(text.trim(), anchor)) { setText(''); setWriting(false) } setBusy(false) }
  if (!shown.length && !canWrite) return decisions ? <p class="fine">Žádné komentáře.</p> : null
  return (
    <div class={`thread ${anchor ? 'anchored' : ''}`}>
      {shown.map((r) => (
        <div key={r.id} class={`comment ${r.resolvedAt ? 'resolved' : ''} v-${r.verdict}`}>
          <div class="c-head">
            <b>{r.user.name}</b>
            {VERDICT[r.verdict] && <span class={`pill ${r.verdict === 'approve' ? 'st-published' : 'warn'}`}>{VERDICT[r.verdict]}</span>}
            <small>{ago(r.createdAt)}{r.stale ? ' · k dřívější verzi' : ''}{r.resolvedAt ? ' · vyřešeno' : ''}</small>
            {r.verdict === 'comment' && (draft.author.id === me.id || r.user.id === me.id) && (
              <button class="btn small" onClick={() => onResolve(r)}>{r.resolvedAt ? 'Otevřít' : <><I.check />Vyřešeno</>}</button>
            )}
          </div>
          {r.body && <p>{r.body}</p>}
        </div>
      ))}
      {canWrite && (writing ? (
        <div class="c-write">
          <textarea rows={3} value={text} onInput={(e) => setText(e.currentTarget.value)} placeholder={anchor ? 'Komentář k tomuhle místu…' : 'Komentář k celé změně…'} maxLength={4000} autoFocus />
          <div class="actions-row"><Busy class="btn small primary" on={busy} disabled={!text.trim()} onClick={send}>Přidat komentář</Busy><button class="btn small" onClick={() => setWriting(false)}>Zrušit</button></div>
        </div>
      ) : <button class="add-line" onClick={() => setWriting(true)}><I.plus />{anchor ? 'Komentovat' : 'Napsat komentář'}</button>)}
    </div>
  )
}

function Ask({ kind, busy, onClose, onSend }: { kind: 'changes' | 'reject'; busy: boolean; onClose: () => void; onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <Modal title={kind === 'changes' ? 'Požádat o úpravy' : 'Zamítnout návrh'} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zpět</button><Busy class={`btn ${kind === 'reject' ? 'danger' : 'primary'}`} on={busy} disabled={!text.trim()} onClick={() => onSend(text.trim())}>{kind === 'changes' ? 'Odeslat autorovi' : 'Zamítnout'}</Busy></>}>
      <p>{kind === 'changes' ? 'Napiš autorovi, co je potřeba upravit. Konkrétní místa můžeš okomentovat přímo u bloků a otázek.' : 'Návrh se uzavře a nezveřejní. Autor uvidí důvod.'}</p>
      <label class="field"><span>{kind === 'changes' ? 'Co upravit' : 'Důvod'}</span><textarea rows={4} value={text} onInput={(e) => setText(e.currentTarget.value)} maxLength={kind === 'changes' ? 4000 : 2000} autoFocus /></label>
    </Modal>
  )
}

/** Opens the review of a draft (used after sending it). */
export const openReview = (id: string) => go(`/kontrola/${id}`)
