import { GRADE_NAME, STAGES, SUBJECTS } from '../content/curriculum'
import { useIndex, refFor, type TopicRef } from '../content/library'
import { recommend, streak, type Why } from '../progress/recommend'
import { pinnedKeys, stars, today, useProgress, type Progress } from '../progress/store'
import { go } from '../router'
import { useTheme } from '../theme'
import { Stars } from '../ui/Bar'
import { SubjectKey, keyStyle, subjectStyle } from '../ui/glyphs'
import { IArrow, IMoon, IPin, ISearch, IShuffle, ISun, ISync } from '../ui/icons'
import { Mascot } from '../ui/Mascot'

const STAGE_LABEL = { zs1: 'ZŠ · 1. stupeň', zs2: 'ZŠ · 2. stupeň', ss: 'SŠ · ročník' }

export const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`

export function Home() {
  const p = useProgress()
  const all = useIndex()
  const [theme, toggleTheme] = useTheme()
  const dark = theme === 'dark'
  const pins = all ? pinnedKeys(p).flatMap((k) => refFor(k) ?? []) : []
  const recs = all ? recommend(p, all) : []

  return (
    <div class="page home">
      <header class="bar">
        <div class="brand"><Mascot size={38} /><span>šprtám</span></div>
        <span class="grow" />
        <button class="icon-btn" onClick={toggleTheme} aria-label={dark ? 'Světlý režim' : 'Tmavý režim'} aria-pressed={dark}>{dark ? <ISun /> : <IMoon />}</button>
        <button class="icon-btn" onClick={() => go('/sdilet')} aria-label="Přenést pokrok"><ISync /></button>
      </header>

      <button class="search-key" onClick={() => go('/hledat')}>
        <ISearch /><span>Hledat téma nebo slovíčko</span><kbd>/</kbd>
      </button>

      <Display p={p} />

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
              <button key={ref.key} class="row rec" style={subjectStyle(ref.s)} onClick={() => go(topicPath(ref))}>
                <SubjectKey s={ref.s} />
                <span class="txt"><b>{ref.title}</b><small>{GRADE_NAME[ref.g]} · {SUBJECTS[ref.s].name}</small></span>
                <WhyTag why={why} />
              </button>
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
                  <button key={g} class={`num-key ${p.g === g ? 'on' : ''}`} onClick={() => go(`/g/${g}`)} aria-label={GRADE_NAME[g]}>{GRADE_NAME[g].split('.')[0]}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button class="row vocab-key" style={keyStyle('purple')} onClick={() => go('/slovicka')}>
        <span class="skey m" style={keyStyle('purple')}><b>Aa</b></span>
        <span class="txt"><b>Anglická slovíčka</b><small>A1–C1</small></span>
        <IArrow />
      </button>
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
    <button class="cart" style={subjectStyle(r.s)} onClick={() => go(topicPath(r))}>
      <span class="cart-top"><SubjectKey s={r.s} size="s" /><small>{GRADE_NAME[r.g].split('.')[0]}.</small></span>
      <b>{r.title}</b>
      <Stars n={st} />
    </button>
  )
}

const DAYS = 14

/** The device screen: Šprťa and the last two weeks as a row of LEDs. */
function Display({ p }: { p: Progress }) {
  const days = new Set(p.a ?? [])
  const now = today()
  const n = streak(p)
  return (
    <div class="display" role="img" aria-label={`${n} dní v řadě`}>
      <Mascot mood={days.has(now) ? 'happy' : 'idle'} size={68} />
      <div class="leds" aria-hidden="true">
        {Array.from({ length: DAYS }, (_, i) => now - DAYS + 1 + i).map((d) => <i key={d} class={`${days.has(d) ? 'on' : ''} ${d === now ? 'now' : ''}`} />)}
      </div>
      <div class="streak"><b>{n}</b><small>{n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní'} v řadě</small></div>
    </div>
  )
}
