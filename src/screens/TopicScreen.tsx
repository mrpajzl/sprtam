import { useEffect, useMemo, useState } from 'preact/hooks'
import { CONTENT_AUTHOR, dateCs, joinHref, profileHref, verifierNames, type Verified } from '../content/verified'
import { GRADE_NAME, type KeyColor, subjectMeta } from '../content/curriculum'
import { approachById, listed, useApproach } from '../approach'
import { loadSubject, loadTopic, topicKey } from '../content'
import { loadIndex, refFor } from '../content/library'
import type { GradeId, SubjectId, Topic } from '../content/types'
import { MODES, type ModeId } from '../quiz/engine'
import { getProgress, isPinned, pinnedKeys, preferExplanation, togglePin, useProgress } from '../progress/store'
import { back, Link, query } from '../router'
import { titles, useTitle } from '../seo'
import { Bar } from '../ui/Bar'
import { keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, IBolt, IBulb, IMic, IPencil, IPin, IRepeat } from '../ui/icons'
import { ReportButton } from '../ui/Report'
import { useAsync } from '../ui/useAsync'
import { Blocks } from './Blocks'
import { Quiz } from './Quiz'

const MODE_KEY: Partial<Record<ModeId, [() => preact.JSX.Element, KeyColor]>> = {
  kviz: [IBolt, 'orange'], opakovani: [IRepeat, 'blue'], pisemka: [IPencil, 'yellow'], zkouseni: [IMic, 'green'],
}

export function TopicScreen({ g, s, id }: { g: GradeId; s: SubjectId; id: string }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const p = useProgress()
  const key = topicKey(g, s, id)
  const approach = useApproach()
  const topic = subj?.topics.find((t) => t.id === id)
  // The two general explanations, plus the one for the child's teaching approach – shown first.
  const general = topic ? topic.explanations.flatMap((x, i) => (x.approach ? [] : [i])) : []
  const own = topic && approach ? topic.explanations.findIndex((x) => x.approach === approach) : -1
  const shown = own >= 0 ? [own, ...general] : general
  const initial = () => {
    const q = query().get('ex')
    if (q === '0' || q === '1') return general[Number(q)] ?? 0
    return own >= 0 ? own : general[p.t[key]?.e ?? 0] ?? 0
  }
  const [ex, setEx] = useState(initial)
  // Re-evaluate once the topic has loaded: the choice depends on its explanations.
  useEffect(() => setEx(initial()), [key, own, !!topic])
  useTitle(topic && titles.topic(g, s, topic.title))
  if (subj === undefined) return <div class="page" />
  if (!topic) return <div class="page"><Bar title={subjectMeta(s).name} /><div class="empty">Téma nenalezeno.</div></div>

  const switchTo = (i: number) => {
    setEx(i)
    if (general.includes(i)) preferExplanation(key, general.indexOf(i) as 0 | 1)
    scrollTo({ top: 0, behavior: 'smooth' })
  }
  const current = shown.includes(ex) ? ex : shown[0]
  const other = shown[(shown.indexOf(current) + 1) % shown.length]
  const rest = (subj?.topics ?? []).filter(listed)
  const next = listed(topic) ? rest[rest.indexOf(topic) + 1] : undefined

  return (
    <div class="page" style={subjectStyle(s)}>
      <Bar title={`${topic.emoji} ${topic.title}`} crumbs={[{ href: `/g/${g}`, label: GRADE_NAME[g] }, { href: `/g/${g}/${s}`, label: subjectMeta(s).name }]} right={<PinButton k={key} />} />
      <div class="seg" role="tablist">
        {shown.map((i) => <button key={i} role="tab" aria-selected={current === i} class={current === i ? 'on' : ''} onClick={() => switchTo(i)}>{i === own ? `${approachById(approach)?.emoji} ` : ''}{topic.explanations[i].title}</button>)}
      </div>
      <Blocks key={current} blocks={topic.explanations[current].blocks} />
      <button class="other" onClick={() => switchTo(other)}><IBulb />Nerozumím – vysvětli to jinak: {topic.explanations[other].title}</button>
      <CheckNote verified={topic.verified} topic={key} />
      <div class="topic-report"><ReportButton topic={key} target={{ kind: 'explanation', index: current, text: topic.explanations[current].title }} label="Chyba ve vysvětlení? Nahlásit" /></div>
      <div class="modes">
        {(['kviz', 'opakovani', 'pisemka', 'zkouseni'] as ModeId[]).map((m) => {
          const [I, c] = MODE_KEY[m]!
          return (
            <Link key={m} class="mode" href={`/g/${g}/${s}/${id}/${m}`} rel="nofollow">
              <span class="skey m" style={keyStyle(c)}><I /></span><b>{MODES[m].name}</b><small>{MODES[m].hint}</small>
            </Link>
          )
        })}
      </div>
      {next && (
        <>
          <h2 class="label next-label">Další téma</h2>
          <Link class="row" href={`/g/${g}/${s}/${next.id}`}><span class="em">{next.emoji}</span><b>{next.title}</b><IArrow /></Link>
        </>
      )}
    </div>
  )
}

export function QuizScreen({ g, s, id, mode }: { g: GradeId; s: SubjectId; id: string; mode: ModeId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const topics = useMemo(() => subj && (id === '~test' ? subj.topics.filter(listed) : subj.topics.filter((t) => t.id === id)).map((t) => ({ key: topicKey(g, s, t), t })), [subj, id])
  if (!topics) return <div class="page" />
  return <div style={subjectStyle(s)}><Quiz key={`${id}/${mode}`} mode={mode} topics={topics} /></div>
}

export function PinButton({ k }: { k: string }) {
  const on = isPinned(useProgress(), k)
  return (
    <button class={`icon-btn pin ${on ? 'on' : ''}`} onClick={() => togglePin(k)} aria-pressed={on} aria-label={on ? 'Odepnout' : 'Připnout k opakování'}>
      <IPin on={on} />
    </button>
  )
}

/** One round across all pinned topics. */
export function MixScreen() {
  const topics = useAsync(async () => {
    await loadIndex()
    const refs = pinnedKeys(getProgress()).flatMap((k) => refFor(k) ?? [])
    const topics = await Promise.all(refs.map((r) => loadTopic(r.g, r.s, r.id).catch(() => null)))
    return refs.flatMap((r, i) => { const t = topics[i]; return t ? [{ key: r.key, t }] : [] as { key: string; t: Topic }[] })
  }, [])
  if (topics === undefined) return <div class="page" />
  if (!topics?.length) return <div class="page"><Bar title="Mix" /><div class="empty">Nejdřív si připni nějaké téma.<button class="btn" onClick={back}>Zpět</button></div></div>
  return <Quiz mode="mix" topics={topics} />
}

/** Who wrote the topic and whether a person has checked it (src/content/verified.ts); a checker's name opens their
 *  profile in moderation, unchecked topics ask for help. */
export function CheckNote({ verified, topic }: { verified?: Verified; topic: string }) {
  return (
    <aside class={`check-note ${verified ? 'ok' : ''}`} aria-label="Kdo téma napsal a zkontroloval">
      <p><i aria-hidden="true">AI</i><span>Autor: <b>{CONTENT_AUTHOR}</b> (umělá inteligence)</span></p>
      {verified
        ? <p><i aria-hidden="true">✓</i><span>Zkontrolováno člověkem: {verifierNames(verified.by).map((n, i) => <>{i ? ', ' : ''}<a href={profileHref(n)} target="_blank" rel="noopener"><b>{n}</b></a></>)}, {dateCs(verified.at)}</span></p>
        : <>
          <p><i aria-hidden="true">!</i><span>Čeká na kontrolu člověkem. Když najdeš chybu, nahlas ji.</span></p>
          <a class="btn ghost block" href={joinHref(topic)} target="_blank" rel="noopener">Chci to zkontrolovat a schválit</a>
        </>}
    </aside>
  )
}
