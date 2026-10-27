import { loadTopic } from '../content'
import { GRADE_NAME, SUBJECTS } from '../content/curriculum'
import type { GradeId, SubjectId, Topic } from '../content/types'
import { answerText, MODES, reviewIds, reviewItems } from '../quiz/engine'
import { getProgress, isMistake, questionId, topicOf, useProgress } from '../progress/store'
import { back, go, Link } from '../router'
import { Bar } from '../ui/Bar'
import { subjectStyle } from '../ui/glyphs'
import { IArrow, IBook } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { Mascot } from '../ui/Mascot'
import { useAsync } from '../ui/useAsync'
import { Quiz } from './Quiz'

// Review across topics from the progress of single questions (store.ts `q`):
//   /chyby           Sešit chyb – every question that went wrong and was not answered right twice since
//   /chyby/procvicit a round of them
//   /dnes            Dnešní opakování – a short round of the questions due today (spaced repetition)

type Loaded = { key: string; t: Topic }[]

/** The topics the given question ids come from (topics no longer in the content are left out). */
async function topicsOf(ids: string[]): Promise<Loaded> {
  const keys = [...new Set(ids.map(topicOf))]
  const topics = await Promise.all(keys.map((k) => {
    const [g, s, id] = k.split('/')
    return loadTopic(g as GradeId, s as SubjectId, id).then((t) => ({ key: k, t }), () => null)
  }))
  return topics.filter((x) => x !== null)
}

export function ReviewQuiz({ mode }: { mode: 'chyby' | 'dnes' }) {
  // Enough candidates to fill a round even if some of the questions have changed in the content since.
  const topics = useAsync(() => topicsOf(reviewIds(getProgress().q, mode).slice(0, MODES[mode].count * 3)), [mode])
  if (topics === undefined) return <div class="page" />
  return (
    <Quiz mode={mode} topics={topics ?? []} record={false}
      pick={() => reviewItems(reviewIds(getProgress().q, mode), topics ?? [], MODES[mode].count)}
      empty={mode === 'chyby' ? 'V sešitu chyb nic není. Paráda!' : 'Na dnešek máš zopakováno.'} />
  )
}

/** Count of review questions for the home screen (without loading any content). */
export const reviewCount = (mode: 'chyby' | 'dnes') => reviewIds(getProgress().q, mode).length

export function MistakesScreen() {
  const p = useProgress()
  const ids = reviewIds(p.q, 'chyby')
  const topics = useAsync(() => topicsOf(ids), [ids.join()])
  const groups = (topics ?? []).flatMap(({ key, t }) => {
    const qs = t.questions.filter((q) => q.type !== 'open' && isMistake(p.q?.[questionId(key, q)] ?? { b: 9, d: 0, w: 0 }))
    return qs.length ? [{ key, t, qs }] : []
  })
  const n = groups.reduce((sum, g) => sum + g.qs.length, 0)
  return (
    <div class="page mistakes-book">
      <Bar title="Sešit chyb" />
      {topics === undefined ? null : !n ? (
        <div class="empty"><Mascot mood="happy" size={96} />Sešit chyb je prázdný.<span class="muted">Co se ti v kvízu splete, objeví se tady. Zmizí, až to dvakrát zodpovíš správně.</span><button class="btn" onClick={back}>Zpět</button></div>
      ) : (
        <>
          <p class="muted lead">Otázky, které se ti spletly. Každá zmizí, až ji dvakrát zodpovíš správně.</p>
          <button class="btn block" onClick={() => go('/chyby/procvicit')}><IBook />Procvičit chyby<span class="btn-count">{Math.min(n, MODES.chyby.count)}</span></button>
          {groups.map(({ key, t, qs }) => {
            const [g, s, id] = key.split('/') as [GradeId, SubjectId, string]
            return (
              <section key={key} class="sec" style={subjectStyle(s)}>
                <Link class="row" href={`/g/${g}/${s}/${id}`}>
                  <span class="em">{t.emoji}</span>
                  <span class="txt"><b>{t.title}</b><small>{GRADE_NAME[g]} · {SUBJECTS[s].name}</small></span>
                  <IArrow />
                </Link>
                <div class="mistakes">
                  {qs.map((q, k) => <div key={k} class="card"><b><Inline text={q.question} /></b><span><Inline text={answerText(q)} /></span></div>)}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
