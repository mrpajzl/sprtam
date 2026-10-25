import { approachById, findBlock, loadYear, setApproach, useApproach, type Approach } from '../approach'
import { loadTopic } from '../content'
import { GRADE_NAME, SUBJECTS } from '../content/curriculum'
import { loadIndex, refFor, useIndex, type TopicRef } from '../content/library'
import type { GradeId, YearBlock } from '../content/types'
import { stars, useProgress, type Progress } from '../progress/store'
import { Link } from '../router'
import { titles, useTitle } from '../seo'
import { Bar, Meter, Stars } from '../ui/Bar'
import { SubjectKey, keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, ITest } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { useAsync } from '../ui/useAsync'
import { Quiz } from './Quiz'

// A teaching approach (docs/PRISTUPY.md): /waldorf (about + years), /waldorf/z1 (the year's epochs),
// /waldorf/z1/<epoch> (its topics, from any grade) and /waldorf/z1/<epoch>/test (one round across them).

const STYLE = keyStyle('green')
const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`

/** Average stars of the block's topics → 0–100. */
const blockPct = (b: YearBlock, p: Progress) => (b.topics.length ? (b.topics.reduce((n, k) => n + stars(p.t[k]?.s), 0) / (b.topics.length * 3)) * 100 : 0)

export function ApproachScreen({ id, g, block, test }: { id: string; g?: string; block?: string; test?: boolean }) {
  const a = approachById(id)!
  const year = a.grades.find((x) => x === g)
  if (!g) return <ApproachHome a={a} />
  if (!year) return <div class="page" style={STYLE}><Bar title={a.short} /><div class="empty">Tenhle ročník tu není.<Link class="btn" href={`/${a.id}`}>{a.name}</Link></div></div>
  return block ? <BlockScreen a={a} g={year} id={block} test={test} /> : <YearScreen a={a} g={year} />
}

function ApproachHome({ a }: { a: Approach }) {
  const on = useApproach() === a.id
  useTitle(titles.approach(a.name))
  const years = useAsync(() => Promise.all(a.grades.map((g) => loadYear(a.id, g))), [a.id])
  return (
    <div class="page" style={STYLE}>
      <Bar title={`${a.emoji} ${a.name}`} />
      <div class="blocks approach-about">{a.about.map((x, i) => <p key={i}><Inline text={x} /></p>)}</div>
      <button class="row approach-switch" role="switch" aria-checked={on} onClick={() => setApproach(on ? undefined : a.id)}>
        <span class="txt"><b>{a.choose}</b><small>{on ? 'Epochy ve třídě, waldorfský výklad, slovní hodnocení' : 'Zapni a aplikace se přizpůsobí'}</small></span>
        <span class={`switch ${on ? 'on' : ''}`} aria-hidden="true"><i /></span>
      </button>
      <h2 class="label">Ročníky</h2>
      <div class="list">
        {a.grades.map((g, i) => (
          <Link key={g} class="row" href={`/${a.id}/${g}`}>
            <span class="num">{years?.[i]?.title.split('.')[0] ?? GRADE_NAME[g].split('.')[0]}</span>
            <span class="txt"><b>{years?.[i]?.title ?? GRADE_NAME[g]}</b>{years?.[i] && <small>{years[i].epochs.map((e) => e.title).slice(0, 3).join(' · ')}…</small>}</span>
            <IArrow />
          </Link>
        ))}
      </div>
    </div>
  )
}

/** The year's epochs (and its ongoing subjects) as rows; also used on the grade screen. */
export function YearBlocks({ a, g, p }: { a: Approach; g: GradeId; p: Progress }) {
  const y = useAsync(() => loadYear(a.id, g), [a.id, g])
  if (!y) return null
  const row = (b: YearBlock) => (
    <Link key={b.id} class="row epoch" href={`/${a.id}/${g}/${b.id}`}>
      <span class="em">{b.emoji}</span>
      <span class="txt"><b>{b.title}</b>{b.month && <small>{b.month}</small>}</span>
      {b.topics.length > 0 && <Meter pct={blockPct(b, p)} n={5} />}
    </Link>
  )
  return (
    <>
      <h2 class="label">{a.emoji} Epochy</h2>
      <div class="list">{y.epochs.map(row)}</div>
      {y.ongoing && y.ongoing.length > 0 && <><h2 class="label next-label">Celý rok</h2><div class="list">{y.ongoing.map(row)}</div></>}
    </>
  )
}

function YearScreen({ a, g }: { a: Approach; g: GradeId }) {
  const p = useProgress()
  const y = useAsync(() => loadYear(a.id, g), [a.id, g])
  useTitle(y ? titles.approachYear(a.name, y.title) : undefined)
  return (
    <div class="page" style={STYLE}>
      <Bar title={y?.title ?? ''} crumbs={[{ href: `/${a.id}`, label: a.short }]} />
      <YearBlocks a={a} g={g} p={p} />
      <Link class="row test-key" href={`/g/${g}`}>
        <span class="txt"><b>Všechny předměty</b><small>{GRADE_NAME[g]} v běžném pořadí</small></span><IArrow />
      </Link>
    </div>
  )
}

function BlockScreen({ a, g, id, test }: { a: Approach; g: GradeId; id: string; test?: boolean }) {
  const p = useProgress()
  const y = useAsync(() => loadYear(a.id, g), [a.id, g])
  const b = y ? findBlock(y, id) : undefined
  const all = useIndex()
  useTitle(y && b ? titles.approachBlock(a.name, y.title, b.title) : undefined)
  if (y === undefined) return <div class="page" />
  if (!b) return <div class="page" style={STYLE}><Bar title={a.short} /><div class="empty">Epocha nenalezena.<Link class="btn" href={`/${a.id}/${g}`}>{y?.title ?? a.name}</Link></div></div>
  if (test) return <BlockQuiz b={b} />
  const refs = all ? b.topics.flatMap((k) => refFor(k) ?? []) : []
  return (
    <div class="page" style={STYLE}>
      <Bar title={`${b.emoji} ${b.title}`} crumbs={[{ href: `/${a.id}`, label: a.short }, { href: `/${a.id}/${g}`, label: y!.title }]} />
      {b.month && <div class="label">{b.month}</div>}
      <div class="blocks approach-about">{b.about.map((x, i) => <p key={i}><Inline text={x} /></p>)}</div>
      {b.topics.length > 0 ? (
        <>
          <h2 class="label">Témata</h2>
          <div class="list">
            {refs.map((r) => (
              <Link key={r.key} class="row rec" style={subjectStyle(r.s)} href={topicPath(r)}>
                <SubjectKey s={r.s} />
                <span class="txt"><b>{r.title}</b><small>{GRADE_NAME[r.g]} · {SUBJECTS[r.s].name}</small></span>
                <Stars n={stars(p.t[r.key]?.s)} />
              </Link>
            ))}
          </div>
          <Link class="row test-key" href={`/${a.id}/${g}/${b.id}/test`} rel="nofollow">
            <span class="skey m"><ITest /></span>
            <span class="txt"><b>Procvičit epochu</b><small>{b.topics.length > 1 ? 'otázky ze všech témat' : 'kvíz z tématu'}</small></span>
          </Link>
        </>
      ) : <p class="muted epoch-empty">K téhle epoše zatím v aplikaci nejsou témata k procvičení.</p>}
    </div>
  )
}

/** One round across all topics of an epoch (they can come from different grades and subjects). */
function BlockQuiz({ b }: { b: YearBlock }) {
  const topics = useAsync(async () => {
    await loadIndex()
    const refs = b.topics.flatMap((k) => refFor(k) ?? [])
    const loaded = await Promise.all(refs.map((r) => loadTopic(r.g, r.s, r.id).catch(() => null)))
    return refs.flatMap((r, i) => (loaded[i] ? [{ key: r.key, t: loaded[i]! }] : []))
  }, [b])
  if (!topics) return <div class="page" />
  return <div style={STYLE}><Quiz mode="test" topics={topics} /></div>
}
