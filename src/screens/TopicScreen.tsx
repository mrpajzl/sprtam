import { useEffect, useMemo, useState } from 'preact/hooks'
import { SUBJECTS } from '../content/curriculum'
import { loadSubject, topicKey } from '../content'
import type { GradeId, SubjectId } from '../content/types'
import { MODES, type ModeId } from '../quiz/engine'
import { preferExplanation, useProgress } from '../progress/store'
import { go, query } from '../router'
import { Bar } from '../ui/Bar'
import { IBolt, IBulb, IMic, IPencil, IRepeat } from '../ui/icons'
import { useAsync } from '../ui/useAsync'
import { Blocks } from './Blocks'
import { hue } from './Browse'
import { Quiz } from './Quiz'

const MODE_ICON: Partial<Record<ModeId, () => preact.JSX.Element>> = { kviz: IBolt, opakovani: IRepeat, pisemka: IPencil, zkouseni: IMic }

export function TopicScreen({ g, s, id }: { g: GradeId; s: SubjectId; id: string }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const p = useProgress()
  const key = topicKey(g, s, id)
  const initial = () => (query().get('ex') === '1' ? 1 : query().get('ex') === '0' ? 0 : p.t[key]?.e ?? 0) as 0 | 1
  const [ex, setEx] = useState<0 | 1>(initial)
  useEffect(() => setEx(initial()), [key])
  const topic = subj?.topics.find((t) => t.id === id)
  if (subj === undefined) return <div class="page" />
  if (!topic) return <div class="page"><Bar title={SUBJECTS[s].name} /><div class="empty"><div class="big">🔍</div>Téma nenalezeno.</div></div>

  const switchTo = (e: 0 | 1) => { setEx(e); preferExplanation(key, e); scrollTo({ top: 0, behavior: 'smooth' }) }
  const other = (1 - ex) as 0 | 1

  return (
    <div class="page" style={hue(s)}>
      <Bar title={`${topic.emoji} ${topic.title}`} onBack={() => go(`/g/${g}/${s}`)} />
      <div class="seg" role="tablist">
        {topic.ex.map((x, i) => <button key={i} role="tab" aria-selected={ex === i} class={ex === i ? 'on' : ''} onClick={() => switchTo(i as 0 | 1)}>{x.title}</button>)}
      </div>
      <Blocks key={ex} blocks={topic.ex[ex].blocks} />
      <button class="other" onClick={() => switchTo(other)}><IBulb />Nerozumím – vysvětli to jinak: {topic.ex[other].title}</button>
      <div class="modes">
        {(['kviz', 'opakovani', 'pisemka', 'zkouseni'] as ModeId[]).map((m) => {
          const I = MODE_ICON[m]!
          return (
            <button key={m} class="mode" onClick={() => go(`/g/${g}/${s}/${id}/${m}`)}>
              <span class="ic"><I /></span><b>{MODES[m].name}</b><small>{MODES[m].hint}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function QuizScreen({ g, s, id, mode }: { g: GradeId; s: SubjectId; id: string; mode: ModeId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const topics = useMemo(() => subj && (id === '~test' ? subj.topics : subj.topics.filter((t) => t.id === id)).map((t) => ({ key: topicKey(g, s, t), t })), [subj, id])
  if (!topics) return <div class="page" />
  return <div style={hue(s)}><Quiz key={`${id}/${mode}`} mode={mode} topics={topics} /></div>
}
