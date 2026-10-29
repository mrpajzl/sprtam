import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, isGrade, subjectMeta } from '../../../src/content/curriculum'
import { isSubjectOf } from '../../../src/content/docs'
import type { GradeId, Question, SubjectId, TopicFile } from '../../../src/content/types'
import { Inline } from '../../../src/ui/Inline'
import { ApiError, get, post } from '../api'
import { dateCs } from '../../../src/content/verified'
import { Preview } from '../editor/Preview'
import { questionLabel } from '../editor/model'
import type { Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { nav } from '../router'
import { refreshIndex, useIndex } from '../store'
import { Busy, I, Modal, toast } from '../ui/kit'
import { editTopic } from './Library'
import { reportsHref } from './Reports'

// One published topic, read only: the phone shows it exactly as pupils get it, next to it the whole topic
// at a glance – explanations and every question with its correct answer. Open to everyone (teachers check
// the content here); signed-in moderators switch to the editor with "Upravit".

export function TopicView({ g, s, id, me }: { g: string; s: string; id: string; me: Me | null }) {
  const index = useIndex()
  const [topic, setTopic] = useState<TopicFile | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<PreviewMode>({ kind: 'topic', ex: 0 })
  const [opening, setOpening] = useState(false)
  const [reports, setReports] = useState(0)
  const [version, setVersion] = useState(0)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    setTopic(null); setError(''); setMode({ kind: 'topic', ex: 0 })
    get<{ topic: TopicFile; version: number }>(`/api/content/topic/${g}/${s}/${id}`).then((r) => { setTopic(r.topic); setVersion(r.version) }, (e) => setError(e instanceof ApiError ? e.message : 'Téma se nepodařilo načíst.'))
  }, [g, s, id])
  useEffect(() => {
    setReports(0)
    if (me) get<{ open: number }>(`/api/reports/counts?topic=${encodeURIComponent(`${g}/${s}/${id}`)}`).then((c) => setReports(c.open), () => {})
  }, [g, s, id, me?.id])

  const known = isGrade(g) && isSubjectOf(g, s)
  if (error || !known) return <div class="empty-state">{error || 'Téma nenalezeno.'} <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>
  if (!topic) return <div class="boot" />

  const grade = g as GradeId, subject = s as SubjectId
  const list = index?.subjects[`${g}/${s}`] ?? []
  const at = list.findIndex((t) => t.id === id)
  const prev = at > 0 ? list[at - 1] : undefined
  const next = at >= 0 && at < list.length - 1 ? list[at + 1] : undefined
  const here = `/ucivo/${g}/${s}`
  const active = index?.active.filter((a) => a.key === `${g}/${s}/${id}`) ?? []
  const mine = me && active.find((a) => a.userId === me.id)
  const others = active.filter((a) => a.userId !== me?.id)
  const approaches = index?.approaches ?? []
  // On a phone the preview is above the list: bring it into view after picking what it shows.
  const show = (m: PreviewMode) => { setMode(m); if (matchMedia('(max-width: 900px)').matches) document.querySelector('.v-phone')?.scrollIntoView({ behavior: 'smooth' }) }
  const edit = async () => { setOpening(true); await editTopic(g, s, id); setOpening(false) }

  return (
    <div class="viewer">
      <header class="v-head">
        <a class="v-up" href={here} onClick={nav(here)}><I.back />{subjectMeta(subject).name} · {GRADE_NAME[grade]}</a>
        <div class="v-title">
          <span class="v-em">{topic.emoji}</span>
          <div>
            <h1>{topic.title}</h1>
            <small>
              {topic.verified ? <span class="v-verified"><I.check />Prošlo kontrolou · {topic.verified.by} · {dateCs(topic.verified.at)} · </span> : <span class="pill unverified">neověřeno</span>}{' '}
              {at >= 0 ? `${at + 1}. téma z ${list.length}` : ''}
              {topic.approach ? ` · jen pro přístup ${approaches.find((a) => a.id === topic.approach)?.short ?? topic.approach}` : ''}
            </small>
          </div>
        </div>
        <div class="v-actions">
          <nav class="v-step" aria-label="Sousední témata">
            {prev ? <a class="icon" href={`${here}/${prev.id}`} onClick={nav(`${here}/${prev.id}`)} title={`Předchozí: ${prev.title}`} aria-label={`Předchozí téma: ${prev.title}`}><I.left /></a> : <span class="icon" aria-hidden="true" />}
            {next ? <a class="icon" href={`${here}/${next.id}`} onClick={nav(`${here}/${next.id}`)} title={`Další: ${next.title}`} aria-label={`Další téma: ${next.title}`}><I.right /></a> : <span class="icon" aria-hidden="true" />}
          </nav>
          {me && <a class="btn" href={`/historie/${g}/${s}/${id}`} onClick={nav(`/historie/${g}/${s}/${id}`)}><I.undo />Historie</a>}
          {me && <Busy class="btn primary" on={opening} onClick={edit}><I.pencil />{mine ? 'Pokračovat v úpravách' : 'Upravit'}</Busy>}
        </div>
      </header>
      {/* Others' changes: one sent for review is waiting for you (a clear way in), work in progress is just a heads-up. */}
      {me && others.filter((o) => o.status === 'review').map((o) => (
        <div key={o.id} class="banner warn"><I.check /><span><b>{o.name}</b> poslal/a úpravu tohoto tématu ke kontrole. Podívej se, co změnil/a, a schval ji – pak se zveřejní.</span><a class="btn small primary" href={`/kontrola/${o.id}`} onClick={nav(`/kontrola/${o.id}`)}>Zkontrolovat a schválit</a></div>
      ))}
      {me && others.some((o) => o.status !== 'review') && <div class="banner info"><I.pencil />Téma právě upravuje {others.filter((o) => o.status !== 'review').map((o) => o.name).join(', ')}. Úpravu zatím neposlal/a ke kontrole.</div>}
      {reports > 0 && (
        <div class="banner warn"><I.warn /><span>{reports === 1 ? '1 otevřené hlášení' : `${reports} ${reports < 5 ? 'otevřená hlášení' : 'otevřených hlášení'}`} od žáků k tomuto tématu.</span>
          <a class="btn small" href={reportsHref('open', { topic: `${g}/${s}/${id}` })} onClick={nav(reportsHref('open', { topic: `${g}/${s}/${id}` }))}>Zobrazit</a></div>
      )}
      {!topic.verified && (
        <div class="banner warn"><I.warn /><span><b>Neověřeno.</b> Téma připravila AI nebo se změnilo bez kontroly. Děti ho už vidí, s poznámkou „neověřeno“. Přečti výklad v telefonu i všechny otázky s odpověďmi vedle.</span>
          {me && <button class="btn small primary" onClick={() => setVerifying(true)}><I.check />Ověřit</button>}</div>
      )}
      {verifying && <VerifyDialog g={g} s={s} id={id} version={version} title={topic.title} onClose={() => setVerifying(false)} onDone={(t) => { setTopic(t.topic); setVersion(t.version); setVerifying(false); refreshIndex() }} />}
      {mine && <div class="banner info"><I.pencil />{mine.status === 'review' ? 'Tvoje úprava čeká na kontrolu jiného moderátora.' : 'Máš tu rozpracované úpravy, ještě nejsou odeslané ke kontrole.'} Tady vidíš zveřejněnou verzi.</div>}

      <div class="v-body">
        <aside class="v-phone">
          <Preview topic={topic} grade={grade} subject={subject} approaches={approaches} mode={mode} onMode={setMode} />
        </aside>
        <div class="v-sheet">
          <section class="v-sec">
            <h2 class="label">Vysvětlení · {topic.explanations.length}</h2>
            <div class="v-exs">
              {topic.explanations.map((x, i) => {
                const a = approaches.find((y) => y.id === x.approach)
                const on = mode.kind === 'topic' && mode.ex === i
                return (
                  <button key={i} class={`v-ex ${on ? 'on' : ''}`} onClick={() => show({ kind: 'topic', ex: i })} aria-pressed={on}>
                    <span class="ol-em">{a ? a.emoji : i + 1}</span>
                    <span><b>{x.title}</b><small>{a ? `pro přístup ${a.short} · ` : ''}{x.blocks.length} bloků</small></span>
                  </button>
                )
              })}
            </div>
            <p class="fine">Celý výklad si přečti v telefonu. Pomůcky v něm fungují stejně jako v aplikaci.</p>
          </section>
          <section class="v-sec">
            <h2 class="label">Otázky a správné odpovědi · {topic.questions.length}</h2>
            <ol class="v-qs">
              {topic.questions.map((q, i) => {
                const on = mode.kind === 'quiz' && mode.q === i
                return (
                  <li key={i} class={on ? 'on' : ''}>
                    <button class="v-q" onClick={() => show({ kind: 'quiz', q: i })} aria-pressed={on} title="Zkusit v telefonu">
                      <span class="v-n">{i + 1}</span>
                      <span class="v-qb">
                        <small>{questionLabel(q.type)}{'widget' in q && q.widget ? ' · s pomůckou' : ''}</small>
                        <b><Inline text={q.question} /></b>
                        <Answer q={q} />
                        {'explanation' in q && q.explanation && <span class="v-why"><Inline text={q.explanation} /></span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {topic.generator && <p class="fine">K otázkám aplikace přidává i náhodně vytvořené příklady (generátor <code>{topic.generator}</code>).</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

/** The correct answer, written out for a quick check. */
function Answer({ q }: { q: Question }) {
  switch (q.type) {
    case 'choice': return <ul class="v-opts">{q.options.map((o, i) => <li key={i} class={i === q.answer ? 'ok' : ''}>{i === q.answer ? <I.check /> : <span class="dot" />}<Inline text={o} /></li>)}</ul>
    case 'truefalse': return <span class="v-ans">{q.answer ? 'Pravda' : 'Nepravda'}</span>
    case 'input': return <span class="v-ans">{q.answers.join(' · ')}</span>
    case 'order': return <ol class="v-order">{q.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ol>
    case 'match': return <ul class="v-pairs">{q.pairs.map(([a, b], i) => <li key={i}><Inline text={a} /><span>–</span><Inline text={b} /></li>)}</ul>
    case 'open': return <span class="v-ans"><Inline text={q.answer} /></span>
  }
}

/** Confirms that the moderator went through the whole topic; then it is marked as checked by them. */
function VerifyDialog({ g, s, id, version, title, onClose, onDone }: { g: string; s: string; id: string; version: number; title: string; onClose: () => void; onDone: (r: { topic: TopicFile; version: number }) => void }) {
  const [busy, setBusy] = useState(false)
  const go = async () => {
    setBusy(true)
    try {
      const r = await post<{ version: number }>('/api/content/verify', { grade: g, subject: s, topicId: id, version })
      const fresh = await get<{ topic: TopicFile; version: number }>(`/api/content/topic/${g}/${s}/${id}`)
      toast('Ověřeno. Děti uvidí, že téma prošlo kontrolou.')
      onDone({ topic: fresh.topic, version: fresh.version ?? r.version })
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Ověření se nepovedlo.', 'bad'); setBusy(false) }
  }
  return (
    <Modal title={`Ověřit téma „${title}“`} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zpět</button><Busy class="btn primary" on={busy} onClick={go}><I.check />Ověřit</Busy></>}>
      <p>Potvrzuješ, že jsi prošel/prošla <b>celý výklad i všechny otázky</b> se správnými odpověďmi a že jsou věcně správně a srozumitelné?</p>
      <p class="muted">U tématu se pak ukáže tvoje jméno a dnešní datum (v moderaci, v aplikaci i ve veřejné historii učiva). Když něco nesedí, téma raději uprav – schválená úprava se počítá jako ověřená.</p>
    </Modal>
  )
}
