import { GRADE_NAME, GRADE_SHORT, ODB, STAGES, subjectMeta } from '../content/curriculum'
import { EXAM } from '../exam'
import { OBOR_PATH, readyObory, useObor } from '../obory'
import { hasSubject } from '../content'
import { MAPS_PATH } from '../maps'
import { useIndex, refFor, type TopicRef } from '../content/library'
import { recommend, streakOf, type Why } from '../progress/recommend'
import { answeredToday, goalOf, isDue, isMistake, pinnedKeys, stars, today, useProgress, type Progress } from '../progress/store'
import { go, Link } from '../router'
import { Stars } from '../ui/Bar'
import { SubjectKey, keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, IBook, IGear, IPin, IRepeat, ISearch, IShuffle } from '../ui/icons'
import { Mascot } from '../ui/Mascot'
import { QrButton } from '../ui/QrShare'
import { vocabLangs } from '../vocab'

const STAGE_LABEL = { zs1: 'ZŠ · 1. stupeň', zs2: 'ZŠ · 2. stupeň', ss: 'SŠ · ročník' }

export const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`

export function Home() {
  const p = useProgress()
  const all = useIndex()
  const pins = all ? pinnedKeys(p).flatMap((k) => refFor(k) ?? []) : []
  const recs = all ? recommend(p, all.filter((r) => !r.approach)) : []
  const obor = useObor()
  const langs = vocabLangs()

  return (
    <div class="page home">
      <header class="bar">
        <h1 class="brand"><Mascot size={38} /><span>šprtám</span></h1>
        <span class="grow" />
        <Link class="icon-btn" href="/nastaveni" aria-label="Nastavení"><IGear /></Link>
        <QrButton />
      </header>

      <Link class="search-key" href="/hledat">
        <ISearch /><span>Hledat téma nebo slovíčko</span><kbd>/</kbd>
      </Link>

      <Display p={p} />
      <ReviewKeys p={p} />

      <section class="sec">
        <div class="sec-head">
          <h2 class="label">Připnuté</h2>
          {pins.length > 0 && <button class="mini-key" style={keyStyle('orange')} onClick={() => go('/mix')}><IShuffle />Mix</button>}
        </div>
        {pins.length > 0 ? (
          <div class="carts">{pins.map((r) => <Cart key={r.key} r={r} st={stars(p.t[r.key]?.s)} />)}</div>
        ) : all && <div class="slot"><IPin /><span>Připni si téma, které chceš opakovat.</span></div>}
      </section>

      {recs.length > 0 && (
        <section class="sec">
          <h2 class="label">Na řadě</h2>
          <div class="list">
            {recs.map(({ ref, why }) => (
              <Link key={ref.key} class="row rec" style={subjectStyle(ref.s)} href={topicPath(ref)}>
                <SubjectKey s={ref.s} />
                <span class="txt"><b>{ref.title}</b><small>{GRADE_NAME[ref.g]} · {subjectMeta(ref.s).name}</small></span>
                <WhyTag why={why} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section class="sec">
        <h2 class="label">Třída</h2>
        <div class="pad">
          {STAGES.map((s) => (
            <div key={s.id} class="pad-group">
              <small>{STAGE_LABEL[s.id]}</small>
              <div class="pad-keys">
                {s.grades.map((g) => (
                  <Link key={g} class={`num-key ${p.g === g ? 'on' : ''}`} href={`/g/${g}`} aria-label={GRADE_NAME[g]}>{GRADE_NAME[g].split('.')[0]}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {(obor || readyObory((s) => hasSubject(ODB, s)).length > 0) && <Link class="row obor-key" style={keyStyle('ink')} href={obor ? `${OBOR_PATH}/${obor.id}` : OBOR_PATH}>
          <span class="skey m"><b class="em">{obor?.emoji ?? '🛠️'}</b></span>
          <span class="txt"><b>{obor?.name ?? 'Odborná škola'}</b><small>{obor ? `můj obor · ${obor.code}` : 'IT, strojírenství, kosmetika a další obory'}</small></span>
          <IArrow />
        </Link>}
      </section>

      <Link class="row exam-key" style={keyStyle('orange')} href={`/${EXAM.id}`}>
        <span class="skey m" style={keyStyle('orange')}><b class="em">{EXAM.emoji}</b></span>
        <span class="txt"><b>{EXAM.name}</b><small>{EXAM.hint}</small></span>
        <IArrow />
      </Link>

      <Link class="row vocab-key map-key" style={keyStyle('teal')} href={MAPS_PATH}>
        <span class="skey m" style={keyStyle('teal')}><b class="em">🗺️</b></span>
        <span class="txt"><b>Slepá mapa</b><small>kraje, Evropa, svět</small></span>
        <IArrow />
      </Link>

      <Link class="row vocab-key" style={keyStyle('purple')} href="/slovicka">
        <span class="skey m" style={keyStyle('purple')}><b>Aa</b></span>
        <span class="txt">{langs.length > 1 ? <><b>Slovíčka</b><small>{langs.map((m) => m.name.toLowerCase()).join(', ')}</small></> : <><b>Anglická slovíčka</b><small>A1–C1</small></>}</span>
        <IArrow />
      </Link>

      <Link class="row about-key" style={keyStyle('ink')} href="/o-aplikaci">
        <span class="skey m" style={keyStyle('ink')}><b>?</b></span>
        <span class="txt"><b>Co je Šprtám?</b><small>jak funguje a co o tobě (ne)ví</small></span>
        <IArrow />
      </Link>

    </div>
  )
}

const WHY: Record<Why['k'], (w: Why) => string> = {
  due: (w) => `↻ ${(w as { days: number }).days} d`,
  weak: (w) => `${(w as { pct: number }).pct} %`,
  next: () => 'další',
  base: () => 'základ',
  start: () => 'start',
}
const WHY_TITLE: Record<Why['k'], string> = {
  due: 'Je čas zopakovat',
  weak: 'Minule to nešlo',
  next: 'Další téma v pořadí',
  base: 'Na tomhle staví téma, které ti nešlo',
  start: 'Začni tady',
}

function WhyTag({ why }: { why: Why }) {
  return <span class={`tag ${why.k}`} title={WHY_TITLE[why.k]}>{WHY[why.k](why)}</span>
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

/** Review across topics: questions due today and the open mistakes. Only once there is something to review. */
function ReviewKeys({ p }: { p: Progress }) {
  const qs = Object.values(p.q ?? {})
  const now = today()
  const due = qs.filter((v) => isDue(v, now)).length
  const mistakes = qs.filter(isMistake).length
  if (!due && !mistakes) return null
  return (
    <div class="review-keys">
      {due > 0 && (
        <Link class="row review-key" style={keyStyle('blue')} href="/dnes" rel="nofollow">
          <span class="skey m"><IRepeat /></span>
          <span class="txt"><b>Dnešní opakování</b><small>{Math.min(due, 10)} {plural(Math.min(due, 10), 'otázka', 'otázky', 'otázek')}, co ti vypadávají z hlavy</small></span>
        </Link>
      )}
      {mistakes > 0 && (
        <Link class="row review-key" style={keyStyle('red')} href="/chyby">
          <span class="skey m"><IBook /></span>
          <span class="txt"><b>Sešit chyb</b><small>{mistakes} {plural(mistakes, 'otázka', 'otázky', 'otázek')} k opravení</small></span>
        </Link>
      )}
    </div>
  )
}
