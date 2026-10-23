import { useEffect } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, STAGES, SUBJECTS } from '../content/curriculum'
import { hasSubject, loadSubject, topicKey } from '../content'
import type { GradeId, SubjectId, Subject } from '../content/types'
import { setGrade, stars, useProgress } from '../progress/store'
import { go } from '../router'
import { Bar, Stars } from '../ui/Bar'
import { ISync, ITest } from '../ui/icons'
import { useAsync } from '../ui/useAsync'

export const hue = (s: SubjectId) => ({ '--h': SUBJECTS[s].hue }) as Record<string, number>

export function Home() {
  const p = useProgress()
  return (
    <div class="page">
      <header class="bar">
        <div class="brand"><img src="./icon.svg" alt="" />Šprtám</div>
        <span style={{ flex: 1 }} />
        <button class="icon-btn" onClick={() => go('/sdilet')} aria-label="Přenést pokrok"><ISync /></button>
      </header>
      {STAGES.map((s) => (
        <section key={s.id} class="stage" style={{ '--h': { zs1: 150, zs2: 205, ss: 265 }[s.id] }}>
          <h2>{s.name}</h2>
          <div class="grades">
            {s.grades.map((g) => (
              <button key={g} class={`grade ${p.g === g ? 'on' : ''}`} onClick={() => go(`/g/${g}`)} aria-label={GRADE_NAME[g]}>{GRADE_NAME[g].split('.')[0]}</button>
            ))}
          </div>
        </section>
      ))}
      <section class="stage">
        <button class="tile wide" style={{ '--h': 230 }} onClick={() => go('/slovicka')}>
          <span class="em">🇬🇧</span><b>Anglická slovíčka</b>
        </button>
      </section>
    </div>
  )
}

/** Average stars → 0–100 for a subject's meter. */
function useSubjectPct(g: GradeId, s: SubjectId, subj: Subject | undefined | null) {
  const p = useProgress()
  if (!subj) return 0
  const total = subj.topics.reduce((sum, t) => sum + stars(p.t[topicKey(g, s, t)]?.s), 0)
  return (total / (subj.topics.length * 3)) * 100
}

function SubjectTile({ g, s }: { g: GradeId; s: SubjectId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const pct = useSubjectPct(g, s, subj)
  return (
    <button class="tile" style={hue(s)} onClick={() => go(`/g/${g}/${s}`)}>
      <span class="em">{SUBJECTS[s].emoji}</span>
      <b>{SUBJECTS[s].name}</b>
      <div class="meter"><i style={{ width: `${pct}%` }} /></div>
    </button>
  )
}

export function GradeScreen({ g }: { g: GradeId }) {
  useEffect(() => setGrade(g), [g])
  const subjects = GRADE_SUBJECTS[g].filter((s) => hasSubject(g, s))
  return (
    <div class="page">
      <Bar title={GRADE_NAME[g]} onBack={() => go('/')} />
      {subjects.length ? (
        <div class="tiles">
          {subjects.map((s) => <SubjectTile key={s} g={g} s={s} />)}
          {GRADE_SUBJECTS[g].includes('anglictina') && (
            <button class="tile wide" style={{ '--h': 230 }} onClick={() => go('/slovicka')}><span class="em">🃏</span><b>Slovíčka</b></button>
          )}
        </div>
      ) : <div class="empty"><div class="big">🚧</div>Připravujeme.</div>}
    </div>
  )
}

export function SubjectScreen({ g, s }: { g: GradeId; s: SubjectId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const p = useProgress()
  return (
    <div class="page" style={hue(s)}>
      <Bar title={SUBJECTS[s].name} onBack={() => go(`/g/${g}`)} />
      {subj === null && <div class="empty"><div class="big">🚧</div>Připravujeme.</div>}
      {subj && (
        <>
          <div class="list">
            {subj.topics.map((t, i) => (
              <button key={t.id} class="row" onClick={() => go(`/g/${g}/${s}/${t.id}`)}>
                <span class="num">{i + 1}</span>
                <span class="em">{t.emoji}</span>
                <b>{t.title}</b>
                <Stars n={stars(p.t[topicKey(g, s, t)]?.s)} />
              </button>
            ))}
          </div>
          <div class="modes" style={{ gridTemplateColumns: '1fr' }}>
            <button class="mode" style={{ flexDirection: 'row', alignItems: 'center' }} onClick={() => go(`/g/${g}/${s}/~test`)}>
              <span class="ic"><ITest /></span>
              <span style={{ display: 'grid', gap: 2 }}><b>Test</b><small style={{ margin: 0 }}>celý předmět · 20 otázek</small></span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
