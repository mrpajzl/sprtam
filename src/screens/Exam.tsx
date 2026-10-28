import { loadTopic } from '../content'
import { GRADE_NAME, subjectMeta } from '../content/curriculum'
import { loadIndex, refFor, useIndex, type TopicRef } from '../content/library'
import { EXAM, examArea, examPart, partTopics, type ExamArea, type ExamPart } from '../exam'
import { stars, useProgress, type Progress } from '../progress/store'
import { Link } from '../router'
import { titles, useTitle } from '../seo'
import { Bar, Meter, Stars } from '../ui/Bar'
import { SubjectKey, keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, ITest } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { useAsync } from '../ui/useAsync'
import { MODES } from '../quiz/engine'
import { Quiz } from './Quiz'

// Příprava na přijímačky (src/exam.ts): /prijimacky (about the exam, its two tests), /prijimacky/<subject>
// (the areas of one test), /prijimacky/<subject>/<area> (its topics from any grade) and practice:
// /prijimacky/<subject>/<area>/test (one area) and /prijimacky/<subject>/test (a practice test of the whole part).

const BASE = `/${EXAM.id}`
const STYLE = keyStyle('orange')
const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`

/** Average stars of the topics → 0–100. */
const pctOf = (keys: string[], p: Progress) => (keys.length ? (keys.reduce((n, k) => n + stars(p.t[k]?.s), 0) / (keys.length * 3)) * 100 : 0)

export function ExamScreen({ part, area, test }: { part?: string; area?: string; test?: boolean }) {
  if (!part) return <ExamHome />
  const pt = examPart(part)
  if (!pt) return <Missing />
  if (!area) return <PartScreen pt={pt} />
  if (area === 'test' && !test) return <ExamQuiz keys={partTopics(pt)} />
  const ar = examArea(pt, area)
  if (!ar) return <Missing />
  return test ? <ExamQuiz keys={ar.topics} /> : <AreaScreen pt={pt} ar={ar} />
}

function Missing() {
  return <div class="page" style={STYLE}><Bar title={EXAM.name} /><div class="empty">Tohle tu není.<Link class="btn" href={BASE}>{EXAM.name}</Link></div></div>
}

function ExamHome() {
  const p = useProgress()
  useTitle(titles.exam())
  return (
    <div class="page" style={STYLE}>
      <Bar title={`${EXAM.emoji} ${EXAM.name}`} />
      <div class="blocks approach-about">{EXAM.about.map((x, i) => <p key={i}><Inline text={x} /></p>)}</div>
      <h2 class="label">Testy</h2>
      <div class="list">
        {EXAM.parts.map((pt) => (
          <Link key={pt.s} class="row rec exam-part" style={subjectStyle(pt.s)} href={`${BASE}/${pt.s}`}>
            <SubjectKey s={pt.s} />
            <span class="txt"><b>{pt.title}</b><small>{pt.minutes} minut · {pt.points} bodů</small></span>
            <Meter pct={pctOf(partTopics(pt), p)} n={5} />
          </Link>
        ))}
      </div>
    </div>
  )
}

function PartScreen({ pt }: { pt: ExamPart }) {
  const p = useProgress()
  useTitle(titles.examPart(pt.title))
  return (
    <div class="page" style={subjectStyle(pt.s)}>
      <Bar title={pt.title} crumbs={[{ href: BASE, label: EXAM.name }]} />
      <p class="exam-facts"><span>{pt.minutes} minut</span><span>{pt.points} bodů</span></p>
      <div class="blocks approach-about">{pt.about.map((x, i) => <p key={i}><Inline text={x} /></p>)}</div>
      <h2 class="label">Oblasti</h2>
      <div class="list">
        {pt.areas.map((a) => (
          <Link key={a.id} class="row epoch" href={`${BASE}/${pt.s}/${a.id}`}>
            <span class="em">{a.emoji}</span>
            <b>{a.title}</b>
            <Meter pct={pctOf(a.topics, p)} n={5} />
          </Link>
        ))}
      </div>
      <Link class="row test-key" href={`${BASE}/${pt.s}/test`} rel="nofollow">
        <span class="skey m"><ITest /></span>
        <span class="txt"><b>Cvičný test</b><small>{MODES.test.count} otázek ze všech oblastí</small></span>
        <IArrow />
      </Link>
    </div>
  )
}

function AreaScreen({ pt, ar }: { pt: ExamPart; ar: ExamArea }) {
  const p = useProgress()
  const all = useIndex()
  useTitle(titles.examArea(ar.title, pt.title))
  const refs = all ? ar.topics.flatMap((k) => refFor(k) ?? []) : []
  return (
    <div class="page" style={subjectStyle(pt.s)}>
      <Bar title={`${ar.emoji} ${ar.title}`} crumbs={[{ href: BASE, label: EXAM.name }, { href: `${BASE}/${pt.s}`, label: pt.title }]} />
      <div class="blocks approach-about"><p><Inline text={ar.about} /></p></div>
      <h2 class="label">Témata</h2>
      <div class="list">
        {refs.map((r) => (
          <Link key={r.key} class="row rec" style={subjectStyle(r.s)} href={topicPath(r)}>
            <SubjectKey s={r.s} />
            <span class="txt"><b>{r.title}</b><small>{GRADE_NAME[r.g]} · {subjectMeta(r.s).name}</small></span>
            <Stars n={stars(p.t[r.key]?.s)} />
          </Link>
        ))}
      </div>
      <Link class="row test-key" href={`${BASE}/${pt.s}/${ar.id}/test`} rel="nofollow">
        <span class="skey m"><ITest /></span>
        <span class="txt"><b>Procvičit oblast</b><small>{ar.topics.length > 1 ? 'otázky ze všech témat' : 'kvíz z tématu'}</small></span>
      </Link>
    </div>
  )
}

/** One test across topics from different grades. */
function ExamQuiz({ keys }: { keys: string[] }) {
  const topics = useAsync(async () => {
    await loadIndex()
    const refs = keys.flatMap((k) => refFor(k) ?? [])
    const loaded = await Promise.all(refs.map((r) => loadTopic(r.g, r.s, r.id).catch(() => null)))
    return refs.flatMap((r, i) => (loaded[i] ? [{ key: r.key, t: loaded[i]! }] : []))
  }, [keys.join()]) // a part's topics are a new array on every render
  if (!topics) return <div class="page" />
  return <div style={STYLE}><Quiz mode="test" topics={topics} /></div>
}
