import { useEffect } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } from '../content/curriculum'
import { hasSubject, loadSubject, topicKey } from '../content'
import type { GradeId, SubjectId, Subject } from '../content/types'
import { isPinned, setGrade, stars, useProgress } from '../progress/store'
import { go, Link } from '../router'
import { Bar, Stars } from '../ui/Bar'
import { GLYPHS, keyStyle, subjectStyle } from '../ui/glyphs'
import { IPin, ISearch, ITest } from '../ui/icons'
import { useAsync } from '../ui/useAsync'

/** Segmented LED meter, 0–100. */
export function Meter({ pct, n = 10 }: { pct: number; n?: number }) {
  const lit = Math.round((pct / 100) * n)
  return <span class="seg-meter" role="img" aria-label={`${Math.round(pct)} %`}>{Array.from({ length: n }, (_, i) => <i key={i} class={i < lit ? 'on' : ''} />)}</span>
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
      <Bar title={GRADE_NAME[g]} onBack={() => go('/')} right={<button class="icon-btn" onClick={() => go('/hledat')} aria-label="Hledat"><ISearch /></button>} />
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
      <Bar title={SUBJECTS[s].name} onBack={() => go(`/g/${g}`)} />
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
