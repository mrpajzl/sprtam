import { useEffect } from 'preact/hooks'
import { GRADE_NAME, GRADE_SUBJECTS, gradeSubjects, ODB, subjectMeta } from '../content/curriculum'
import { approachById, listed, useApproach } from '../approach'
import { hasSubject, loadSubject, topicKey } from '../content'
import type { GradeId, SubjectId, YearId } from '../content/types'
import { kindName, OBOR_PATH, oboryOf, useObor, yearOf, type Obor } from '../obory'
import { getProgress, isPinned, setGrade, stars, useProgress } from '../progress/store'
import { Link } from '../router'
import { Bar, Meter, Stars } from '../ui/Bar'
import { keyStyle, SubjectGlyph, subjectStyle } from '../ui/glyphs'
import { IArrow, IPin, ITest } from '../ui/icons'
import { useAsync } from '../ui/useAsync'
import { extrasFor, extrasOf, merged } from '../games'
import { appExtras, ExtraList } from '../ui/Extras'
import { YearBlocks } from './Approach'

/** Average stars → 0–100 for a subject's meter. */
function useSubjectPct(g: GradeId, s: SubjectId, ids: string[] | undefined | null) {
  const p = useProgress()
  if (!ids?.length) return 0
  const total = ids.reduce((sum, id) => sum + stars(p.t[topicKey(g, s, id)]?.s), 0)
  return (total / (ids.length * 3)) * 100
}

export function SubjectTile({ g, s }: { g: GradeId; s: SubjectId }) {
  const ids = useAsync(() => loadSubject(g, s).then((subj) => subj.topics.filter(listed).map((t) => t.id)), [g, s])
  const pct = useSubjectPct(g, s, ids)
  return (
    <Link class="tile" style={subjectStyle(s)} href={`/g/${g}/${s}`}>
      <span class="tile-face"><SubjectGlyph s={s} /></span>
      <b>{subjectMeta(s).name}</b>
      <Meter pct={pct} />
    </Link>
  )
}

/** Odborné předměty of a year of an obor: those the content has, and a note when some are still on their way. */
export function OdbTiles({ subjects }: { subjects: string[] }) {
  const ready = subjects.filter((s) => hasSubject(ODB, s))
  return (
    <>
      {ready.length > 0 && <div class="tiles">{ready.map((s) => <SubjectTile key={s} g={ODB} s={s} />)}</div>}
      {ready.length < subjects.length && <p class="muted obor-soon">{ready.length ? 'Další odborné předměty připravujeme.' : 'Odborné předměty tohoto ročníku připravujeme.'}</p>}
    </>
  )
}

export function GradeScreen({ g }: { g: GradeId }) {
  if (g === ODB) return <OdbScreen />
  return <YearScreen g={g} />
}

/** /g/odb: every odborný předmět of the release, whatever obor teaches it. */
function OdbScreen() {
  const subjects = gradeSubjects(ODB).filter((s) => hasSubject(ODB, s))
  return (
    <div class="page">
      <Bar title={GRADE_NAME[ODB]} crumbs={[{ href: OBOR_PATH, label: 'Odborné školy' }]} />
      {subjects.length ? <div class="tiles">{subjects.map((s) => <SubjectTile key={s} g={ODB} s={s} />)}</div> : <div class="empty">Připravujeme.</div>}
    </div>
  )
}

function YearScreen({ g }: { g: YearId }) {
  // The first grade opened becomes the pupil's own until they choose one (Moje škola, /skola).
  useEffect(() => { if (!getProgress().g) setGrade(g) }, [g])
  const p = useProgress()
  const a = approachById(useApproach())
  const plan = a?.grades.includes(g) ? a : undefined
  const o = useObor()
  const i = o ? yearOf(o, g) : -1
  if (o && i >= 0) return <OborYearScreen o={o} g={g} i={i} />
  const subjects = GRADE_SUBJECTS[g].filter((s) => hasSubject(g, s))
  return (
    <div class="page">
      <Bar title={GRADE_NAME[g]} />
      {plan && <div class="approach-year"><YearBlocks a={plan} g={g} p={p} /><h2 class="label next-label">Předměty</h2></div>}
      {subjects.length ? (
        <div class="tiles">
          {subjects.map((s) => <SubjectTile key={s} g={g} s={s} />)}
        </div>
      ) : <div class="empty">Připravujeme.</div>}
      <ExtraList list={merged(extrasFor(appExtras(), g, subjects))} />
      {g[0] === 's' && (
        <Link class="row obor-key" style={keyStyle('ink')} href={OBOR_PATH}>
          <span class="skey m"><b class="em">🛠️</b></span>
          <span class="txt"><b>Chodíš na odbornou školu?</b><small>Vyber obor a uvidíš jeho odborné předměty</small></span>
          <IArrow />
        </Link>
      )}
    </div>
  )
}

/** A year of the pupil's obor: its odborné předměty, then the general subjects it takes from the gymnázium. */
function OborYearScreen({ o, g, i }: { o: Obor; g: YearId; i: number }) {
  const y = o.years[i]
  const general = y.general.filter((s) => hasSubject(g, s))
  return (
    <div class="page">
      <Bar title={GRADE_NAME[g]} />
      <Link class="row obor-key" style={keyStyle('ink')} href={`${OBOR_PATH}/${o.id}`}>
        <span class="skey m"><b class="em">{o.emoji}</b></span>
        <span class="txt"><b>{o.name}</b><small>{o.code} · {kindName(o)}</small></span>
        <IArrow />
      </Link>
      <h2 class="label">Odborné předměty</h2>
      <OdbTiles subjects={y.odb} />
      {general.length > 0 && (
        <>
          <h2 class="label next-label">Všeobecné předměty</h2>
          <div class="tiles">
            {general.map((s) => <SubjectTile key={s} g={g} s={s} />)}
          </div>
        </>
      )}
      <ExtraList list={merged(extrasFor(appExtras(), g, [...y.odb, ...general]))} />
    </div>
  )
}

export function SubjectScreen({ g, s }: { g: GradeId; s: SubjectId }) {
  const subj = useAsync(() => loadSubject(g, s), [g, s])
  const p = useProgress()
  return (
    <div class="page" style={subjectStyle(s)}>
      <Bar title={subjectMeta(s).name} crumbs={[{ href: `/g/${g}`, label: GRADE_NAME[g] }]} />
      {g === ODB && <OborsOf s={s} />}
      {subj === null && <div class="empty">Připravujeme.</div>}
      {subj && (
        <>
          <div class="list">
            {subj.topics.filter(listed).map((t, i) => {
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
          <ExtraList list={extrasOf(appExtras(), g, s)} />
        </>
      )}
    </div>
  )
}

/** Which obory teach an odborný předmět (links to them). */
function OborsOf({ s }: { s: string }) {
  const os = oboryOf(s)
  if (!os.length) return null
  return <p class="obor-of muted">Učí se v oborech: {os.map((o, i) => <span key={o.id}>{i > 0 && ', '}<Link href={`${OBOR_PATH}/${o.id}`}>{o.name}</Link></span>)}</p>
}
