import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } from '../../../src/content/curriculum'
import type { GradeId, Question, SubjectId, TopicFile } from '../../../src/content/types'
import { Inline } from '../../../src/ui/Inline'
import { ApiError, get } from '../api'
import { Preview } from '../editor/Preview'
import { questionLabel } from '../editor/model'
import type { Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { nav } from '../router'
import { useIndex } from '../store'
import { Busy, I } from '../ui/kit'
import { editTopic } from './Library'

// One published topic, read only: the phone shows it exactly as pupils get it, next to it the whole topic
// at a glance – explanations and every question with its correct answer. Open to everyone (teachers check
// the content here); signed-in moderators switch to the editor with "Upravit".

export function TopicView({ g, s, id, me }: { g: string; s: string; id: string; me: Me | null }) {
  const index = useIndex()
  const [topic, setTopic] = useState<TopicFile | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<PreviewMode>({ kind: 'topic', ex: 0 })
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    setTopic(null); setError(''); setMode({ kind: 'topic', ex: 0 })
    get<{ topic: TopicFile }>(`/api/content/topic/${g}/${s}/${id}`).then((r) => setTopic(r.topic), (e) => setError(e instanceof ApiError ? e.message : 'Téma se nepodařilo načíst.'))
  }, [g, s, id])

  const known = Object.hasOwn(GRADE_SUBJECTS, g) && (GRADE_SUBJECTS[g as GradeId] as string[]).includes(s)
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
        <a class="v-up" href={here} onClick={nav(here)}><I.back />{SUBJECTS[subject].name} · {GRADE_NAME[grade]}</a>
        <div class="v-title">
          <span class="v-em">{topic.emoji}</span>
          <div>
            <h1>{topic.title}</h1>
            <small>
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
          {me && <Busy class="btn primary" on={opening} onClick={edit}><I.pencil />{mine ? 'Pokračovat v úpravách' : 'Upravit'}</Busy>}
        </div>
      </header>
      {me && others.length > 0 && <div class="banner info"><I.eye />Téma právě upravuje {others.map((o) => o.name).join(', ')}. Změny se ukážou tady, až je správce schválí.</div>}
      {mine && <div class="banner info"><I.pencil />Máš tu rozpracované úpravy{mine.status === 'submitted' ? ', které čekají na schválení' : ''}. Tady vidíš zveřejněnou verzi.</div>}

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
