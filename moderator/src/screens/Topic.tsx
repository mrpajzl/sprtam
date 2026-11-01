import { useEffect, useMemo, useState } from 'preact/hooks'
import { GRADE_NAME, isGrade, subjectMeta } from '../../../src/content/curriculum'
import { isSubjectOf } from '../../../src/content/docs'
import type { GradeId, Question, SubjectId, TopicFile } from '../../../src/content/types'
import { Inline } from '../../../src/ui/Inline'
import { ApiError, api, get, post } from '../api'
import { claimOf, release, take, untilText, useClaims } from '../claims'
import { qualityTips, type Tip } from '../editor/quality'
import { step, useKeys } from '../ui/keys'
import { CONTENT_AUTHOR, dateCs, verifierNames } from '../../../src/content/verified'
import { profileHref } from './Profiles'
import { Preview } from '../editor/Preview'
import { questionLabel } from '../editor/model'
import type { Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { go, nav } from '../router'
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
  const [verified, setVerified] = useState(false)
  // Verifying: which explanations and questions I already went through (moderator/server/verify.ts).
  const [progress, setProgress] = useState<{ done: string[]; total: number } | null>(null)
  const [cur, setCur] = useState(-1)
  const claims = useClaims(!!me)

  useEffect(() => {
    setTopic(null); setError(''); setMode({ kind: 'topic', ex: 0 })
    get<{ topic: TopicFile; version: number }>(`/api/content/topic/${g}/${s}/${id}`).then((r) => { setTopic(r.topic); setVersion(r.version) }, (e) => setError(e instanceof ApiError ? e.message : 'Téma se nepodařilo načíst.'))
  }, [g, s, id])
  useEffect(() => {
    setProgress(null); setVerified(false); setCur(-1)
    if (me) get<{ done: string[]; total: number }>(`/api/verify/progress/${g}/${s}/${id}`).then(setProgress, () => {})
  }, [g, s, id, me?.id])
  useEffect(() => {
    setReports(0)
    if (me) get<{ open: number }>(`/api/reports/counts?topic=${encodeURIComponent(`${g}/${s}/${id}`)}`).then((c) => setReports(c.open), () => {})
  }, [g, s, id, me?.id])

  const parts = topic ? [...topic.explanations.map((_, i) => `ex:${i}`), ...topic.questions.map((_, i) => `q:${i}`)] : []
  const checking = !!me && !!topic && !topic.verified && !!progress
  const tick = async (part: string, done?: boolean) => {
    if (!checking) return
    const on = done ?? !progress!.done.includes(part)
    setProgress({ ...progress!, done: on ? [...progress!.done, part] : progress!.done.filter((x) => x !== part) })
    try { setProgress(await api('PUT', `/api/verify/progress/${g}/${s}/${id}`, { parts: [part], done: on })) }
    catch (e) { toast(e instanceof ApiError ? e.message : 'Nepovedlo se uložit.', 'bad') }
  }
  const showPart = (k: number) => {
    const part = parts[k]
    if (!part) return
    setCur(k)
    const [kind, n] = part.split(':')
    show(kind === 'ex' ? { kind: 'topic', ex: Number(n) } : { kind: 'quiz', q: Number(n) }, false)
    document.getElementById(`part-${part.replace(':', '-')}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  const complete = !!progress && progress.done.length >= progress.total
  const help = useKeys([
    { key: 'j', label: 'Další vysvětlení nebo otázka', run: () => showPart(step(parts, cur, 1)) },
    { key: 'k', label: 'Předchozí', run: () => showPart(step(parts, cur, -1)) },
    { key: 'x', label: 'Odškrtnout jako prošlé (a jít na další)', when: checking, run: () => { if (cur >= 0) { const p = parts[cur]; const was = progress!.done.includes(p); tick(p, !was); if (!was) showPart(step(parts, cur, 1)) } } },
    { key: 'o', label: 'Ověřit (až je všechno odškrtnuté)', when: checking && complete, run: () => setVerifying(true) },
  ], 'Zkratky při ověřování')
  const tips = useMemo(() => (me && topic && isGrade(g) ? qualityTips(topic, g, s) : []), [topic, me?.id])

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
  function show(m: PreviewMode, scroll = true) { setMode(m); if (scroll && matchMedia('(max-width: 900px)').matches) document.querySelector('.v-phone')?.scrollIntoView({ behavior: 'smooth' }) }
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
              Autor: {CONTENT_AUTHOR} (AI) · {topic.verified ? <span class="v-verified"><I.check />Zkontroloval/a {verifierNames(topic.verified.by).map((n, i) => <>{i ? ', ' : ''}<a class="p-name" href={profileHref(n)} onClick={nav(profileHref(n))}>{n}</a></>)} · {dateCs(topic.verified.at)} · </span> : <span class="pill unverified">čeká na kontrolu</span>}{' '}
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
      {verified && me && <NextToVerify current={`${g}/${s}/${id}`} me={me} />}
      {!topic.verified && (
        me ? (
          <div class="banner warn verify-box">
            <I.warn />
            <div class="vb-main">
              <span><b>Neověřeno.</b> Téma napsala AI ({CONTENT_AUTHOR}) nebo se změnilo bez kontroly. Děti ho už vidí s poznámkou „čeká na kontrolu člověkem“. Projdi každé vysvětlení v telefonu a každou otázku s odpovědí a odškrtni je <span class="tick-demo" aria-hidden="true"><I.check /></span>. Ověřit půjde, až bude odškrtnuté všechno.</span>
              {progress && <div class="vb-progress"><progress max={progress.total} value={progress.done.length} aria-label="Prošlé části tématu" /><small>Prošel/a jsi {progress.done.length} z {progress.total}</small></div>}
              <ClaimLine claim={claimOf(claims, 'topic', `${g}/${s}/${id}`)} me={me} topic={`${g}/${s}/${id}`} />
            </div>
            <button class="btn small primary" disabled={!complete} title={complete ? '' : 'Nejdřív odškrtni všechna vysvětlení a otázky'} onClick={() => setVerifying(true)}><I.check />Ověřit</button>
          </div>
        ) : (
          <div class="banner warn"><I.warn /><span><b>Čeká na kontrolu člověkem.</b> Téma napsala AI ({CONTENT_AUTHOR}). Učíš, nebo se v tom vyznáš? Přidej se k moderátorům a pomoz ho zkontrolovat.</span>
            <a class="btn small primary" href={`/zapojit-se?tema=${g}/${s}/${id}`} onClick={nav(`/zapojit-se?tema=${g}/${s}/${id}`)}>Chci to schválit</a></div>
        )
      )}
      {verifying && <VerifyDialog g={g} s={s} id={id} version={version} title={topic.title} onClose={() => setVerifying(false)} onDone={(t) => { setTopic(t.topic); setVersion(t.version); setVerifying(false); setVerified(true); refreshIndex() }} />}
      {tips.length > 0 && <Tips tips={tips} pick={(t) => { const k = t.question !== undefined ? parts.indexOf(`q:${t.question}`) : t.section.kind === 'ex' ? parts.indexOf(`ex:${t.section.i}`) : -1; if (k >= 0) showPart(k) }} />}
      {help}
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
                const part = `ex:${i}`
                return (
                  <div key={i} id={`part-ex-${i}`} class={`v-ex-row ${cur === parts.indexOf(part) ? 'cur' : ''}`}>
                    <button class={`v-ex ${on ? 'on' : ''}`} onClick={() => { setCur(parts.indexOf(part)); show({ kind: 'topic', ex: i }) }} aria-pressed={on}>
                      <span class="ol-em">{a ? a.emoji : i + 1}</span>
                      <span><b>{x.title}</b><small>{a ? `pro přístup ${a.short} · ` : ''}{x.blocks.length} bloků</small></span>
                    </button>
                    {checking && <Tick on={progress!.done.includes(part)} label={`Vysvětlení ${i + 1} jsem prošel/a`} onClick={() => tick(part)} />}
                  </div>
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
                const part = `q:${i}`
                return (
                  <li key={i} id={`part-q-${i}`} class={`${on ? 'on' : ''} ${cur === parts.indexOf(part) ? 'cur' : ''}`}>
                    {checking && <Tick on={progress!.done.includes(part)} label={`Otázku ${i + 1} jsem prošel/a`} onClick={() => tick(part)} />}
                    <button class="v-q" onClick={() => { setCur(parts.indexOf(part)); show({ kind: 'quiz', q: i }) }} aria-pressed={on} title="Zkusit v telefonu">
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
      <p>Prošel/prošla jsi a odškrtl/a <b>celý výklad i všechny otázky</b> se správnými odpověďmi. Potvrzuješ, že jsou věcně správně a srozumitelné?</p>
      <p class="muted">U tématu se pak ukáže tvoje jméno a dnešní datum (v moderaci, v aplikaci i ve veřejné historii učiva). Když něco nesedí, téma raději uprav – schválená úprava se počítá jako ověřená.</p>
    </Modal>
  )
}

/** "Prošel/a jsem": a tick next to an explanation or a question while verifying. */
function Tick({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return <button class={`v-tick ${on ? 'on' : ''}`} onClick={onClick} role="checkbox" aria-checked={on} aria-label={label} title={on ? 'Prošel/a jsem (klikni pro zrušení)' : 'Odškrtnout jako prošlé'}><I.check /></button>
}

/** Who is checking the topic: "Beru si to", or my claim with a way to give it up, or someone else's. */
export function ClaimLine({ claim, me, topic }: { claim?: { userId: string; name: string; until: number }; me: Me; topic: string }) {
  if (!claim) return <span class="claim-line">Nikdo si téma nebere. <button class="btn small" onClick={() => take('topic', topic)}><I.flag />Beru si to</button></span>
  if (claim.userId === me.id) return <span class="claim-line mine"><I.flag />Máš zamluveno do {untilText(claim.until)}. <button class="link-btn" onClick={() => release('topic', topic)}>Uvolnit</button></span>
  return <span class="claim-line other"><I.flag />Téma si bere <b>{claim.name}</b> (do {untilText(claim.until)}).{me.role === 'admin' && <> <button class="link-btn" onClick={() => release('topic', topic)}>Uvolnit</button></>}</span>
}

/** Automatic tips (editor/quality.ts): never blocking, worth a look while checking. */
export function Tips({ tips, pick }: { tips: Tip[]; pick?: (t: Tip) => void }) {
  return (
    <details class="banner info tips-box">
      <summary><I.bulb /><span><b>Automatická kontrola: {tips.length} {tips.length === 1 ? 'tip' : tips.length < 5 ? 'tipy' : 'tipů'}</b> – možné překlepy, výpočty a prozrazené odpovědi. Nic z toho nebrání schválení.</span></summary>
      <ul>{tips.slice(0, 30).map((t, i) => <li key={i}>{pick ? <button class="link-btn" onClick={() => pick(t)}>{placeOfTip(t)}</button> : <b>{placeOfTip(t)}</b>}: {t.cs}</li>)}</ul>
      {tips.length > 30 && <p class="fine">…a dalších {tips.length - 30}.</p>}
    </details>
  )
}

const placeOfTip = (t: Tip) => t.question !== undefined ? `Otázka ${t.question + 1}` : t.section.kind === 'qs' ? 'Otázky' : t.section.kind === 'ex' ? `Vysvětlení ${t.section.i + 1}${t.block !== undefined ? `, blok ${t.block + 1}` : ''}` : 'Téma'

/** After verifying: the next topic worth checking, one click away. */
function NextToVerify({ current, me }: { current: string; me: Me }) {
  const [next, setNext] = useState<{ key: string; title: string; emoji: string } | null | undefined>(undefined)
  useEffect(() => {
    get<{ topics: { key: string; title: string; emoji: string; claim: { userId: string } | null }[]; mySubjects: string[] }>('/api/verify/queue').then((q) => {
      setNext(q.topics.find((t) => t.key !== current && (!t.claim || t.claim.userId === me.id)) ?? null)
    }, () => setNext(null))
  }, [current])
  return (
    <div class="banner ok"><I.check /><span><b>Ověřeno, díky!</b> Děti uvidí, že téma prošlo kontrolou.{next === null ? ' Ve frontě už nic neověřeného nezbývá. 🎉' : ''}</span>
      {next && <button class="btn small primary" onClick={() => go(`/ucivo/${next.key}`)}>Další k ověření: {next.emoji} {next.title}<I.right /></button>}
      <a class="btn small" href="/overovani" onClick={nav('/overovani')}>Fronta ověřování</a>
    </div>
  )
}
