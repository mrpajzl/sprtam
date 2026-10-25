import { useEffect } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } from '../content/curriculum'
import { hasSubject, loadSubject, topicKey } from '../content'
import type { GradeId, SubjectId } from '../content/types'
import { isPinned, setGrade, stars, useProgress } from '../progress/store'
import { Link } from '../router'
import { Bar, Meter, Stars } from '../ui/Bar'
import { GLYPHS, keyStyle, subjectStyle } from '../ui/glyphs'
import { IPin, ITest } from '../ui/icons'
import { useAsync } from '../ui/useAsync'

/** Average stars → 0–100 for a subject's meter. */
function useSubjectPct(g: GradeId, s: SubjectId, ids: string[] | undefined | null) {
  const p = useProgress()
  if (!ids?.length) return 0
  const total = ids.reduce((sum, id) => sum + stars(p.t[topicKey(g, s, id)]?.s), 0)
  return (total / (ids.length * 3)) * 100
}

function SubjectTile({ g, s }: { g: GradeId; s: SubjectId }) {
  const ids = useAsync(() => loadSubject(g, s).then((subj) => subj.topics.map((t) => t.id)), [g, s])
  const pct = useSubjectPct(g, s, ids)
  const G = GLYPHS[s]
  return (
    <Link class="tile" style={subjectStyle(s)} href={`/g/${g}/${s}`}>
      <span class="tile-face"><G /></span>
      <b>{SUBJECTS[s].name}</b>
      <Meter pct={pct} />
    </Link>
  )
}

export function GradeScreen({ g }: { g: GradeId }) {
  useEffect(() => setGrade(g), [g])
  const subjects = GRADE_SUBJECTS[g].filter((s) => hasSubject(g, s))
  return (
    <div class="page">
      <Bar title={GRADE_NAME[g]} />
      {subjects.length ? (
        <div class="tiles">
          {subjects.map((s) => <SubjectTile key={s} g={g} s={s} />)}
          {GRADE_SUBJECTS[g].includes('anglictina') && (
            <Link class="tile" style={keyStyle('purple')} href="/slovicka"><span class="tile-face"><b class="aa">Aa</b></span><b>Slovíčka</b></Link>
          )}
        </div>
      ) : <div class="empty">Připravujeme.</div>}
    </div>
  )
}

export function SubjectScreen({ g, s }: { g: GradeId; s: SubjectId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const p = useProgress()
  return (
    <div class="page" style={subjectStyle(s)}>
      <Bar title={SUBJECTS[s].name} crumbs={[{ href: `/g/${g}`, label: GRADE_NAME[g] }]} />
      {subj === null && <div class="empty">Připravujeme.</div>}
      {subj && (
        <>
          <div class="list">
            {subj.topics.map((t, i) => {
              const key = topicKey(g, s, t)
              return (
                <Link key={t.id} class="row" href={`/g/${g}/${s}/${t.id}`}>
                  <span class="num">{String(i + 1).padStart(2, '0')}</span>
                  <span class="em">{t.emoji}</span>
                  <b>{t.title}</b>
                  {isPinned(p, key) && <span class="pinned" aria-label="Připnuté"><IPin on /></span>}
                  <Stars n={stars(p.t[key]?.s)} />
                </Link>
              )
            })}
          </div>
          <Link class="row test-key" href={`/g/${g}/${s}/~test`} rel="nofollow">
            <span class="skey m"><ITest /></span>
            <span class="txt"><b>Test</b><small>celý předmět · 20 otázek</small></span>
          </Link>
        </>
      )}
    </div>
  )
}
