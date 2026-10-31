import type { JSX } from 'preact'
import { approachById, useApproach } from '../approach'
import { GRADE_NAME, GRADE_SHORT, ODB, subjectMeta } from '../content/curriculum'
import type { GradeId, YearId } from '../content/types'
import { readyObory, useObor, type Obor } from '../obory'
import { hasSubject } from '../content'
import { extrasFor, merged } from '../games'
import { useIndex, refFor, type TopicRef } from '../content/library'
import { recommend, streakOf, type Rec, type Why } from '../progress/recommend'
import { activePlans, planDay } from '../progress/plan'
import { dropRound, useSavedRound } from '../progress/resume'
import { MODES } from '../quiz/engine'
import { answeredToday, goalOf, isDue, isMistake, pinnedKeys, setGrade, stars, today, useProgress, type Progress } from '../progress/store'
import { go, Link } from '../router'
import { Stars } from '../ui/Bar'
import { appExtras, ExtraList } from '../ui/Extras'
import { SubjectKey, keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, IBook, IClose, IPlay, IRepeat, ISearch, IShuffle } from '../ui/icons'
import { PlanRow } from './Plan'
import { WhoKey } from './Profiles'
import { SubjectTile } from './Browse'
import { GradePad } from './School'
import { schoolName, schoolSubjects, useLanguage } from '../school'
import { Mascot } from '../ui/Mascot'
import { QrButton } from '../ui/QrShare'

// Domů: the pupil's day and their school. The streak, the one thing to do now (Teď na řadě), plans before a test,
// the subjects of their year with the games that belong to them (src/games.ts) and pinned topics. Everything else
// is a tab away: Učivo (every grade), Hry, Já (progress, settings). Without a school yet it asks for the grade.

export const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`

export function Home() {
  const p = useProgress()
  const all = useIndex()
  const pins = all ? pinnedKeys(p).flatMap((k) => refFor(k) ?? []) : []
  const o = useObor()
  const mine = p.g ? schoolSubjects(p.g, o, useLanguage()) : undefined
  // A pupil who has not practised yet starts with the subjects of their own school.
  const start = p.g && mine ? [...mine.odb.map((s): [GradeId, string] => [ODB, s]), ...mine.general.map((s): [GradeId, string] => [p.g!, s])] : undefined
  const recs = all ? recommend(p, all.filter((r) => !r.approach), 4, start) : []
  const plans = activePlans(p.k, today())

  return (
    <div class="page home">
      <header class="bar">
        <h1 class="brand"><Mascot size={38} /><span>šprtám</span></h1>
        <span class="grow" />
        <WhoKey />
        <Link class="icon-btn" href="/hledat" aria-label="Hledat téma nebo slovíčko" title="Hledat (/)"><ISearch /></Link>
        <QrButton />
      </header>

      <Display p={p} />
      <NextUp p={p} recs={recs} />
      {plans.length > 0 && <div class="list home-plans">{plans.map(([id, plan]) => <PlanRow key={id} id={id} plan={plan} day={planDay(plan, p.t, today())} />)}</div>}
      {p.g && mine ? <MySchool g={p.g} o={o} mine={mine} /> : <Welcome />}

      {pins.length > 0 && (
        <section class="sec">
          <div class="sec-head">
            <h2 class="label">Připnuté</h2>
            <button class="mini-key" style={keyStyle('orange')} onClick={() => go('/mix')}><IShuffle />Mix</button>
          </div>
          <div class="carts">{pins.map((r) => <Cart key={r.key} r={r} st={stars(p.t[r.key]?.s)} />)}</div>
        </section>
      )}
    </div>
  )
}

/** No school yet: pick the grade right here (or just look around in Učivo). */
function Welcome() {
  return (
    <section class="sec welcome">
      <h2 class="label">Kam chodíš do školy?</h2>
      <p class="muted welcome-lead">Vyber třídu a tady uvidíš své předměty. Změnit to jde kdykoli.</p>
      <GradePad onPick={setGrade} />
      <Link class="row welcome-skip" href="/ucivo">
        <span class="txt"><b>Jen se rozhlížím</b><small>všechno učivo, třídy i obory</small></span><IArrow />
      </Link>
    </section>
  )
}

/** The pupil's year: its subjects (with an obor its odborné předměty first) and the extras that belong to them. */
function MySchool({ g, o, mine: { odb, general } }: { g: YearId; o: Obor | undefined; mine: ReturnType<typeof schoolSubjects> }) {
  const a = approachById(useApproach())
  const extras = merged(extrasFor(appExtras(), g, [...odb, ...general]))
  const oborHint = g[0] === 's' && !o && readyObory((s) => hasSubject(ODB, s)).length > 0
  return (
    <>
      <section class="sec">
        <div class="sec-head">
          <h2 class="label">{schoolName(g, o)}</h2>
          <Link class="mini-key quiet" href="/skola" aria-label={`Moje škola: ${schoolName(g, o)}. Změnit`}>Změnit</Link>
        </div>
        {a?.grades.includes(g) && (
          <Link class="row approach-key my-approach" style={keyStyle('green')} href={`/${a.id}/${g}`}>
            <span class="skey m"><b class="em">{a.emoji}</b></span>
            <span class="txt"><b>{a.name}</b><small>epochy {GRADE_NAME[g].replace('třída', 'třídy').replace('ročník', 'ročníku')}</small></span>
            <IArrow />
          </Link>
        )}
        {odb.length + general.length > 0 ? (
          <div class="tiles my-tiles">
            {odb.map((s) => <SubjectTile key={s} g={ODB} s={s} />)}
            {general.map((s) => <SubjectTile key={s} g={g} s={s} />)}
          </div>
        ) : <div class="empty">Učivo tohohle ročníku připravujeme.</div>}
        {oborHint && (
          <Link class="row obor-key" style={keyStyle('ink')} href="/skola">
            <span class="skey m"><b class="em">🛠️</b></span>
            <span class="txt"><b>Chodíš na odbornou školu?</b><small>vyber obor a uvidíš jeho předměty</small></span>
            <IArrow />
          </Link>
        )}
      </section>
      <ExtraList list={extras} />
    </>
  )
}

const WHY_TITLE: Record<Why['k'], string> = {
  due: 'Je čas zopakovat',
  weak: 'Minule to nešlo',
  next: 'Další téma v pořadí',
  base: 'Na tomhle staví téma, které ti nešlo',
  start: 'Začni tady',
}

function Cart({ r, st }: { r: TopicRef; st: number }) {
  return (
    <Link class="cart" style={subjectStyle(r.s)} href={topicPath(r)}>
      <span class="cart-top"><SubjectKey s={r.s} size="s" /><small>{GRADE_SHORT[r.g]}</small></span>
      <b>{r.title}</b>
      <Stars n={st} />
    </Link>
  )
}

const DAYS = 14
const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

/** The device screen: Šprťa, the last two weeks as a row of LEDs and today's answers against the daily goal. Opens the overview. */
function Display({ p }: { p: Progress }) {
  const days = new Set(p.a ?? [])
  const now = today()
  const { n, frozen } = streakOf(p)
  const goal = goalOf(p), done = answeredToday(p)
  const frz = new Set(frozen)
  const label = `${n} ${plural(n, 'den', 'dny', 'dní')} v řadě${goal ? `, dnes ${done} z ${goal} odpovědí` : ''}. Otevřít přehled.`
  return (
    <Link class="display" href="/prehled" aria-label={label}>
      <Mascot mood={goal && done >= goal ? 'wow' : days.has(now) ? 'happy' : 'idle'} size={68} />
      <span class="disp-mid" aria-hidden="true">
        <span class="leds">
          {Array.from({ length: DAYS }, (_, i) => now - DAYS + 1 + i).map((d) => <i key={d} class={`${days.has(d) ? 'on' : frz.has(d) ? 'frz' : ''} ${d === now ? 'now' : ''}`} />)}
        </span>
        {goal > 0 && (
          <span class={`goal ${done >= goal ? 'done' : ''}`}>
            <span class="goal-bar"><i style={{ width: `${Math.min(100, (done / goal) * 100)}%` }} /></span>
            <small>{done >= goal ? 'cíl splněn' : `dnes ${done}/${goal}`}</small>
          </span>
        )}
      </span>
      <span class="streak" aria-hidden="true"><b>{n}</b><small>{plural(n, 'den', 'dny', 'dní')} v řadě</small></span>
    </Link>
  )
}

interface Step { href: string; title: string; hint: string; short: string; key: JSX.Element; style: Record<string, string>; nofollow?: boolean; resume?: boolean }

/**
 * Teď na řadě: the one thing to do now, the others as small keys under it. In this order: the unfinished round
 * (progress/resume.ts), questions due today, the open mistakes, then the recommended topics.
 */
function NextUp({ p, recs }: { p: Progress; recs: Rec[] }) {
  const r = useSavedRound()
  const qs = Object.values(p.q ?? {})
  const now = today()
  const due = Math.min(10, qs.filter((v) => isDue(v, now)).length)
  const mistakes = qs.filter(isMistake).length
  const steps: Step[] = []
  if (r) steps.push({ href: `${r.path}?pokracovat`, title: `Pokračovat: ${r.label}`, hint: `${MODES[r.mode]?.name ?? 'Kolo'} · hotovo ${r.answers.length} z ${r.queue.length}`, short: 'Rozdělané kolo', key: <span class="skey m"><IPlay /></span>, style: keyStyle('green'), nofollow: true, resume: true })
  if (due) steps.push({ href: '/dnes', title: 'Dnešní opakování', hint: `${due} ${plural(due, 'otázka', 'otázky', 'otázek')}, co ti vypadávají z hlavy`, short: `Opakování · ${due}`, key: <span class="skey m"><IRepeat /></span>, style: keyStyle('blue'), nofollow: true })
  if (mistakes) steps.push({ href: '/chyby', title: 'Sešit chyb', hint: `${mistakes} ${plural(mistakes, 'otázka', 'otázky', 'otázek')} k opravení`, short: `Chyby · ${mistakes}`, key: <span class="skey m"><IBook /></span>, style: keyStyle('red') })
  for (const { ref, why } of recs) {
    steps.push({ href: topicPath(ref), title: ref.title, hint: `${WHY_TITLE[why.k]} · ${GRADE_NAME[ref.g]}, ${subjectMeta(ref.s).name.toLowerCase()}`, short: ref.title, key: <SubjectKey s={ref.s} />, style: subjectStyle(ref.s) })
  }
  if (!steps.length) return null
  const [first, ...rest] = steps
  return (
    <section class="next" aria-label="Teď na řadě">
      <div class="next-top">
        <Link class="row next-key" style={first.style} href={first.href} rel={first.nofollow ? 'nofollow' : undefined}>
          {first.key}
          <span class="txt"><small class="kicker">Teď na řadě</small><b>{first.title}</b><small>{first.hint}</small></span>
          <IArrow />
        </Link>
        {first.resume && <button class="icon-btn" onClick={() => dropRound()} aria-label="Zahodit rozdělané kolo"><IClose /></button>}
      </div>
      {rest.length > 0 && (
        <div class="next-more">
          <small>Pak</small>
          {rest.slice(0, 3).map((s) => <Link key={s.href} class="next-chip" style={s.style} href={s.href} rel={s.nofollow ? 'nofollow' : undefined}>{s.short}</Link>)}
        </div>
      )}
    </section>
  )
}
