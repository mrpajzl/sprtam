import { useEffect, useRef, useState } from 'preact/hooks'
import { GRADE_NAME, SUBJECTS } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { api, ApiError, get } from '../api'
import { DiffStats, TopicDiff } from '../diff/Diff'
import { Preview } from '../editor/Preview'
import { withConfirm, type Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { go, nav } from '../router'
import { approvalText, refreshIndex, STATUS, useIndex, type DraftFull, type DraftView, type ReviewView } from '../store'
import { Threads, type ThreadActions } from '../review/Chat'
import { ago, Busy, dateTime, Empty, I, Modal, toast } from '../ui/kit'
import { editTopic } from './Library'

// Review of other moderators' changes (docs/MODERACE.md): /kontrola is the queue (tabs open / approved / rejected,
// all visible to every moderator), /kontrola/<id> one change –
// what changed against the published version, the draft in the phone, conversations at single blocks and questions
// (review/Chat.tsx), and the decision. Enough approvals of the current revision publish the change at once.

type QueueItem = DraftView & { mine: boolean; myVerdict: 'approve' | 'changes' | null }
type Tab = 'open' | 'published' | 'rejected'

/** The tab and the "only mine" filter live in the address (?stav=…&moje=1), so Back and links return to them. */
const TABS: { id: Tab; slug: string; name: string }[] = [
  { id: 'open', slug: '', name: 'Otevřeno' },
  { id: 'published', slug: 'schvaleno', name: 'Schváleno' },
  { id: 'rejected', slug: 'zamitnuto', name: 'Zamítnuto' },
]
export function queueHref(tab: Tab, mine: boolean) {
  const q = new URLSearchParams()
  const slug = TABS.find((x) => x.id === tab)!.slug
  if (slug) q.set('stav', slug)
  if (mine) q.set('moje', '1')
  return `/kontrola${q.size ? `?${q}` : ''}`
}
const queueNow = () => {
  const q = new URLSearchParams(location.search)
  return { tab: TABS.find((x) => x.slug && x.slug === q.get('stav'))?.id ?? 'open', mine: q.get('moje') === '1' }
}
/** The tab a change is listed in. */
const tabOf = (d: DraftView): Tab => d.status === 'published' ? 'published' : d.status === 'rejected' || d.status === 'withdrawn' ? 'rejected' : 'open'

/** explanations[1].blocks[4] → that block in the phone; questions[3] → that question. */
function modeOf(anchor: string): PreviewMode {
  const q = /^questions\[(\d+)\]/.exec(anchor)
  if (q) return { kind: 'quiz', q: Number(q[1]) }
  const b = /^explanations\[(\d+)\](?:\.blocks\[(\d+)\])?/.exec(anchor)
  return { kind: 'topic', ex: Number(b?.[1] ?? 0), ...(b?.[2] !== undefined ? { block: Number(b[2]) } : {}) }
}

const where = (d: DraftView) => `${GRADE_NAME[d.grade as GradeId]} · ${SUBJECTS[d.subject as SubjectId]?.name}`

export function ReviewQueue({ me }: { me: Me }) {
  const { tab, mine } = queueNow()
  const key = `${tab}/${mine}`
  const [lists, setLists] = useState<Record<string, QueueItem[]>>({})
  const [counts, setCounts] = useState<Record<string, Record<Tab, number>>>({})
  useEffect(() => {
    get<Record<Tab, number>>(`/api/reviews/counts${mine ? '?mine=1' : ''}`).then((c) => setCounts((x) => ({ ...x, [String(mine)]: c })), () => {})
    get<QueueItem[]>(`/api/reviews?tab=${tab}${mine ? '&mine=1' : ''}`).then((l) => setLists((x) => ({ ...x, [key]: l })), (e) => toast(e.message, 'bad'))
  }, [key])
  const list = lists[key]
  const count = counts[String(mine)]

  const Row = ({ d, act }: { d: QueueItem; act?: boolean }) => (
    <a class="draft" href={`/kontrola/${d.id}`} onClick={nav(`/kontrola/${d.id}`)}>
      <span class="d-main">
        <b>{d.kind === 'new' && <span class="pill">nové</span>} {d.rollbackOf && <span class="pill">návrat</span>} {d.title}</b>
        <small>{where(d)} · {d.author.name}{d.mine ? ' (ty)' : ''} · {d.status === 'draft' ? `upraveno ${ago(d.updatedAt)}`
          : d.status === 'review' ? `odesláno ${ago(d.submittedAt)}`
          : d.status === 'published' ? `schválil/a ${d.decidedBy ?? '?'} ${ago(d.decidedAt)}${d.release ? ` · vydání ${d.release}` : ''}`
          : d.status === 'rejected' ? `zamítl/a ${d.decidedBy ?? '?'} ${ago(d.decidedAt)}` : 'staženo'}</small>
        {d.status === 'rejected' && d.decisionNote && <small class="d-note">„{d.decisionNote}“</small>}
      </span>
      {d.conflict && <span class="pill warn">konflikt</span>}
      {d.status === 'review' && <>
        {d.changes.length > 0 && <span class="pill warn">požadavek na úpravy</span>}
        {d.myVerdict === 'approve' && <span class="pill st-published">schválil/a jsi</span>}
      </>}
      <span class={`pill st-${d.status}`}>{d.status === 'review' ? approvalText(d) : STATUS[d.status]}</span>
      {act ? <span class="btn small primary">Zkontrolovat</span> : <I.right />}
    </a>
  )

  let body: preact.ComponentChildren
  if (!list) body = <p class="muted">Načítám…</p>
  else if (tab !== 'open') {
    const total = count?.[tab]
    body = !list.length ? <Empty>{tab === 'published' ? 'Zatím nebyla schválena žádná změna.' : 'Zatím nebyla zamítnuta žádná změna.'}</Empty> : (
      <section class="draft-group">
        <h2 class="label">{tab === 'published' ? 'Naposledy schválené a zveřejněné' : 'Naposledy zamítnuté'} · {list.length}{total && total > list.length ? ` z ${total}` : ''}</h2>
        <div class="drafts">{list.map((d) => <Row key={d.id} d={d} />)}</div>
      </section>
    )
  } else {
    const waiting = list.filter((d) => !d.mine && d.status === 'review' && !d.myVerdict)
    const groups: [string, QueueItem[]][] = [
      ['Čeká na tebe', waiting],
      ['Už jsi to viděl/a', list.filter((d) => !d.mine && d.myVerdict)],
      [mine ? 'V kontrole' : 'Tvoje změny v kontrole', list.filter((d) => d.mine && d.status === 'review')],
      ['Rozpracované', list.filter((d) => d.status === 'draft')],
    ]
    body = <>
      {!mine && <>
        <p class="muted">Změny učiva od ostatních moderátorů. Každá se zveřejní, až ji schválí {list[0]?.needed === 1 || !list.length ? 'někdo další' : `${list[0].needed} další`} – {me.role === 'admin' ? 'svou změnu můžeš jako správce schválit i sám/sama (potvrdíš to klíčem)' : 'vlastní změnu schválit nejde'}.</p>
        <ol class="steps-how">
          <li><b>Otevři</b> změnu ze seznamu.</li>
          <li><b>Projdi</b>, co se změnilo (zeleně přidané, přeškrtnuté odebrané), a vyzkoušej to v telefonu.</li>
          <li><b>Klikni</b> na <b>Schválit</b> – změna se hned zveřejní. Nebo na <b>Požádat o úpravy</b> a napiš autorovi, co opravit.</li>
        </ol>
      </>}
      {!list.length && <Empty>{mine ? <>Nemáš žádné otevřené změny. <a href="/" onClick={nav('/')}>Vyber téma v učivu</a> a začni upravovat.</> : 'Teď nic nečeká na kontrolu. 🎉'}</Empty>}
      {groups.map(([name, ds]) => ds.length > 0 && (
        <section key={name} class="draft-group">
          <h2 class="label">{name} · {ds.length}</h2>
          <div class="drafts">{ds.map((d) => <Row key={d.id} d={d} act={ds === waiting} />)}</div>
        </section>
      ))}
    </>
  }

  return (
    <div class="page-narrow">
      <h1>Kontrola změn</h1>
      <div class="q-filters">
        <nav class="seg-tabs" aria-label="Změny podle stavu">
          {TABS.map((t) => {
            const n = t.id === tab && list ? list.length : count?.[t.id]
            return <a key={t.id} href={queueHref(t.id, mine)} onClick={nav(queueHref(t.id, mine))} class={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined}>{t.name}{n !== undefined && ` · ${n}`}</a>
          })}
        </nav>
        <label class="toggle"><input type="checkbox" checked={mine} onChange={(e) => go(queueHref(tab, e.currentTarget.checked), true)} />Pouze moje</label>
      </div>
      {body}
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
  // New messages (and a new revision or decision) show up on their own while the change is open.
  const live = useRef({ data, busy })
  live.current = { data, busy }
  useEffect(() => {
    const t = setInterval(async () => {
      const cur = live.current.data
      if (!cur || live.current.busy || document.hidden || (cur.draft.status !== 'draft' && cur.draft.status !== 'review')) return
      try {
        const th = await get<{ rev: number; status: string; reviews: ReviewView[] }>(`/api/drafts/${id}/thread`)
        const now = live.current.data
        if (!now || now !== cur) return
        if (th.rev !== now.draft.rev || th.status !== now.draft.status || th.reviews.some((r) => r.verdict !== 'comment' && !now.reviews.some((x) => x.id === r.id))) load()
        else if (JSON.stringify(th.reviews) !== JSON.stringify(now.reviews)) setData({ ...now, reviews: th.reviews })
      } catch { /* offline for a moment: next time */ }
    }, 8000)
    return () => clearInterval(t)
  }, [id])

  if (error) return <div class="empty-state">{error} <a href="/kontrola" onClick={nav('/kontrola')}>Zpět na kontrolu změn</a></div>
  if (!data) return <div class="boot" />
  const d = data.draft
  const own = d.author.id === me.id
  const inReview = d.status === 'review'
  const g = d.grade as GradeId, s = d.subject as SubjectId
  const up = queueHref(tabOf(d), own)
  const myDecision = data.reviews.filter((r) => !r.stale && r.user.id === me.id && r.verdict !== 'comment').pop()?.verdict
  const willPublish = d.approvals.filter((a) => a.id !== me.id).length + 1 >= d.needed && !d.changes.some((c) => c.id !== me.id)

  const act = async (path: string, body: object, ok: string, method = 'POST', reauth = false) => {
    setBusy(true)
    try {
      const call = () => api<DraftFull & { released?: number | null }>(method, `/api/drafts/${d.id}/${path}`, body)
      const r = await (reauth ? withConfirm(call) : call())
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
  const chat: ThreadActions = {
    send: (m, anchor) => act('review', { verdict: 'comment', anchor, ...m }, m.parent ? 'Odpověď odeslána' : 'Zpráva odeslána'),
    edit: (r, body, suggestion) => act(`reviews/${r.id}`, { body, ...(suggestion !== undefined ? { suggestion } : {}) }, 'Zpráva upravena', 'PATCH'),
    remove: (r) => { if (confirm('Smazat zprávu?')) act(`reviews/${r.id}`, {}, 'Zpráva smazána', 'DELETE') },
    resolve: (r) => act(`reviews/${r.id}/resolve`, {}, r.resolvedAt ? 'Znovu otevřeno' : 'Vyřešeno'),
    apply: (r) => act(`reviews/${r.id}/apply`, { rev: d.rev }, 'Návrh převzat – je v návrhu jako nová verze'),
  }
  const remove = async () => {
    if (!confirm(`Smazat rozpracovaný návrh „${d.title}“? Tohle nejde vrátit.`)) return
    setBusy(true)
    try { await api('DELETE', `/api/drafts/${d.id}`); refreshIndex(); toast('Návrh smazán'); go(queueHref('open', true), true) }
    catch (e) { toast(e instanceof ApiError ? e.message : 'Smazání se nepovedlo.', 'bad') }
    finally { setBusy(false) }
  }
  const anchored = (anchor: string) => <Threads reviews={data.reviews.filter((r) => r.anchor === anchor)} anchor={anchor} me={me} draft={d} topic={data.topic} busy={busy} act={chat} />

  return (
    <div class="review">
      <header class="v-head">
        <a class="v-up" href={up} onClick={nav(up)}><I.back />{own ? 'Moje změny' : 'Kontrola změn'}</a>
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
          {own && d.kind === 'edit' && tabOf(d) !== 'open' && <button class="btn small" onClick={() => editTopic(g, s, d.topicId)}><I.pencil />Upravit znovu</button>}
          {d.kind === 'edit' && <a class="btn small" href={`/historie/${g}/${s}/${d.topicId}`} onClick={nav(`/historie/${g}/${s}/${d.topicId}`)}><I.undo />Historie tématu</a>}
        </div>
      </header>

      <Banners data={data} own={own} busy={busy} onRebase={() => act('rebase', {}, 'Návrh teď vychází ze zveřejněné verze. Zkontroluj ho a pošli znovu.')} />

      {d.note && <blockquote class="r-note"><b>{d.author.name}:</b> {d.note}</blockquote>}
      {data.problems.length > 0 && (inReview || d.status === 'draft') && (
        <div class="banner bad"><I.warn />Téma ještě není v pořádku, schválit ho nejde: {data.problems.slice(0, 3).map((p) => p.message).join(' · ')}{data.problems.length > 3 ? ` (+${data.problems.length - 3})` : ''}</div>
      )}

      <Decision data={data} me={me} busy={busy} willPublish={willPublish} myDecision={myDecision}
        approve={() => act('review', { verdict: 'approve', rev: d.rev }, 'Schváleno', 'POST', own)} ask={setAsk}
        withdraw={() => act('withdraw', {}, 'Návrh je zpátky v rozpracovaných')} remove={remove} />

      <div class="r-body">
        <div class="r-main">
          <h2 class="label">{data.base ? 'Změny proti verzi, ze které autor vycházel' : 'Celé nové téma'}</h2>
          <TopicDiff a={data.base} b={data.topic} ctx={{ render: anchored, pick: (a) => setMode(modeOf(a)) }} />
          <h2 class="label">Konverzace k celé změně</h2>
          <Threads reviews={data.reviews.filter((r) => !r.anchor)} anchor={null} me={me} draft={d} topic={data.topic} busy={busy} act={chat} decisions />
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
  if (d.status === 'published') return <div class="banner ok"><I.check />Zveřejněno {d.decidedAt ? dateTime(d.decidedAt) : ''}{d.release ? ` jako vydání ${d.release}` : ''}{d.decidedBy ? ` – rozhodl/a ${d.decidedBy}` : ''}. {d.legacyPrUrl?.startsWith('https://github.com/') && <a href={d.legacyPrUrl} target="_blank" rel="noopener noreferrer">pull request</a>}</div>
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
  if (d.changes.length) return <div class="banner warn"><I.warn />O úpravy žádá {d.changes.map((c) => c.name).join(', ')}. {own ? 'Po úpravě se kontrola počítá znovu.' : ''}</div>
  return null
}

/**
 * What this moderator can do with the change, said in one place: a headline, why, and the buttons. While the
 * box is scrolled away (reading a long diff), the same decision stays at the bottom of the screen.
 */
function Decision({ data, me, busy, willPublish, myDecision, approve, ask, withdraw, remove }: {
  data: DraftFull; me: Me; busy: boolean; willPublish: boolean; myDecision: string | undefined
  approve: () => void; ask: (k: 'changes' | 'reject') => void; withdraw: () => void; remove: () => void
}) {
  const d = data.draft
  const own = d.author.id === me.id
  const box = useRef<HTMLElement>(null)
  const [away, setAway] = useState(false)
  useEffect(() => {
    if (!box.current) return
    const io = new IntersectionObserver(([e]) => setAway(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(box.current)
    return () => io.disconnect()
  }, [])
  if (d.status !== 'draft' && d.status !== 'review') return null

  const blocked = d.conflict ? 'Téma mezitím změnil někdo jiný. Autor musí návrh nejdřív převést na novou verzi.'
    : data.problems.length ? 'Téma ještě není v pořádku (viz červené upozornění). Autor ho musí opravit.'
    : !d.changed ? 'V návrhu není žádná změna.' : ''
  const approveBtn = (
    <Busy class="btn primary" on={busy} disabled={!!blocked} onClick={approve}><I.check />{willPublish ? 'Schválit a zveřejnit' : 'Schválit'}</Busy>
  )
  const changesBtn = <button class="btn" disabled={busy} onClick={() => ask('changes')}><I.pencil />Požádat o úpravy</button>
  const rejectBtn = me.role === 'admin' && !own && <button class="btn danger" disabled={busy} onClick={() => ask('reject')}>Zamítnout</button>
  const edit = <a class={`btn ${d.status === 'draft' ? 'primary' : ''}`} href={`/navrh/${d.id}`} onClick={nav(`/navrh/${d.id}`)}><I.pencil />{d.status === 'draft' ? 'Pokračovat v úpravách' : 'Upravit'}</a>

  let tone = 'info', head: string, text: string, actions: preact.ComponentChildren = null, sticky = false
  if (d.status === 'draft') {
    head = 'Rozpracováno – zatím není co schvalovat'
    text = own ? 'Ostatní moderátoři to uvidí, až to v editoru odešleš ke kontrole (tlačítko Odeslat).' : `${d.author.name} to ještě neposlal/a ke kontrole. Až to pošle, objeví se to v Ke kontrole.`
    actions = own ? <>{edit}<Busy class="btn" on={busy} onClick={remove}><I.trash />Smazat návrh</Busy></> : rejectBtn
  } else if (own && me.role === 'admin') {
    const rest = <>{edit}<Busy class="btn" on={busy} onClick={withdraw}>Vrátit do rozpracovaných</Busy></>
    if (myDecision === 'approve') {
      tone = 'ok'; head = 'Schválil/a jsi svou změnu'
      text = `Čeká se na další schválení (${approvalText(d)}). Když změnu upravíš, je potřeba ji schválit znovu.`
      actions = rest
    } else if (blocked) {
      tone = 'warn'; head = 'Zatím nejde schválit'; text = blocked; actions = rest
    } else {
      tone = 'act'; head = 'Čeká na kontrolu – jako správce ji můžeš schválit sám/sama'
      text = `Nejlepší je, když se na změnu podívá ještě někdo. Když to spěchá, klikni na ${willPublish ? 'Schválit a zveřejnit' : 'Schválit'} – aplikace si řekne o potvrzení klíčem${willPublish ? ' a změna se hned objeví na sprtam.cz' : ''}.`
      actions = <>{approveBtn}{rest}</>
    }
  } else if (own) {
    head = 'Čeká na kontrolu jiného moderátora'
    text = `Svou vlastní změnu schválit nejde. Jakmile ji schválí ${d.needed === 1 ? 'někdo další' : `${d.needed} další`}, sama se zveřejní na sprtam.cz. Do té doby ji můžeš ještě upravit.`
    actions = <>{edit}<Busy class="btn" on={busy} onClick={withdraw}>Vrátit do rozpracovaných</Busy></>
  } else if (myDecision === 'approve') {
    tone = 'ok'; head = 'Schválil/a jsi'
    text = `Čeká se na další schválení (${approvalText(d)}). Když autor změnu upraví, je potřeba ji schválit znovu.`
  } else if (blocked) {
    tone = 'warn'; head = 'Zatím nejde schválit'; text = blocked
    actions = <>{changesBtn}{rejectBtn}</>
  } else {
    tone = 'act'; head = myDecision === 'changes' ? 'Požádal/a jsi o úpravy – můžeš schválit, až budou hotové' : 'Čeká na tvoje rozhodnutí'
    text = `Projdi změny níže (zeleně přidané, přeškrtnuté odebrané) a vyzkoušej je v telefonu. Pak klikni na ${willPublish ? 'Schválit a zveřejnit – změna se hned objeví na sprtam.cz' : 'Schválit'}, nebo na Požádat o úpravy a napiš autorovi, co opravit.`
    actions = <>{approveBtn}{changesBtn}{rejectBtn}</>
    sticky = true
  }
  return (
    <>
      <section ref={box} class={`decide t-${tone}`} aria-label="Rozhodnutí">
        <div><b>{head}</b><p>{text}</p></div>
        {actions && <div class="decide-actions">{actions}</div>}
      </section>
      {sticky && away && (
        <div class="decide-bar" role="region" aria-label="Rozhodnutí">
          <span class="pill st-review">{approvalText(d)}</span>
          {approveBtn}{changesBtn}
        </div>
      )}
    </>
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
