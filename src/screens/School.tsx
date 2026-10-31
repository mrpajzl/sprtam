import { useState } from 'preact/hooks'
import { APPROACHES, setApproach, useApproach } from '../approach'
import { hasSubject } from '../content'
import { GRADE_NAME, ODB, STAGES, subjectMeta } from '../content/curriculum'
import type { YearId } from '../content/types'
import { kindName, readyObory, setObor, useObor } from '../obory'
import { languagesOf, setLanguage, useLanguage } from '../school'
import { setGrade, useProgress } from '../progress/store'
import { Link } from '../router'
import { Bar } from '../ui/Bar'
import { IArrow } from '../ui/icons'
import { Choice } from './Settings'

// Moje škola (/skola): where the pupil goes to school. The home screen then shows the subjects of that year (and of
// the obor) and the extras that belong to them (src/games.ts). It is the pupil's own (Progress.g, the obor and the
// teaching approach are kept per profile, src/profiles.ts) and never leaves the device. Other grades stay a tab
// away in Učivo.

type Level = 'zs' | 'ss'
const LEVELS: [Level, string][] = [['zs', 'Základní škola'], ['ss', 'Střední škola']]
const STAGE_LABEL = { zs1: '1. stupeň', zs2: '2. stupeň', ss: '' }
const levelOf = (g: YearId | undefined): Level => (g?.[0] === 's' ? 'ss' : 'zs')

/** The grade keys (of one level, or all of them); `on` = the pupil's grade. Keys pick a grade, or with `link` open it. */
export function GradePad({ level, on, onPick, link }: { level?: Level; on?: YearId; onPick?: (g: YearId) => void; link?: boolean }) {
  const stages = STAGES.filter((s) => !level || levelOf(s.grades[0]) === level)
  return (
    <div class="pad">
      {stages.map((s) => (
        <div key={s.id} class="pad-group">
          {(!level || STAGE_LABEL[s.id]) && <small>{level ? STAGE_LABEL[s.id] : { zs1: 'ZŠ · 1. stupeň', zs2: 'ZŠ · 2. stupeň', ss: 'SŠ · ročník' }[s.id]}</small>}
          <div class="pad-keys">
            {s.grades.map((g) => link
              ? <Link key={g} class={`num-key ${on === g ? 'on' : ''}`} href={`/g/${g}`} aria-label={GRADE_NAME[g]}>{GRADE_NAME[g].split('.')[0]}</Link>
              : <button key={g} class={`num-key ${on === g ? 'on' : ''}`} aria-pressed={on === g} aria-label={GRADE_NAME[g]} onClick={() => onPick?.(g)}>{GRADE_NAME[g].split('.')[0]}</button>)}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SchoolScreen() {
  const p = useProgress()
  const [level, setLevel] = useState<Level>(levelOf(p.g))
  const obor = useObor()
  const approach = useApproach()
  const obory = readyObory((s) => hasSubject(ODB, s))
  const lang = useLanguage()
  // With an obor the year has no second language (src/obory.ts).
  const langs = p.g && !(obor && p.g[0] === 's') ? languagesOf(p.g) : []
  return (
    <div class="page school">
      <Bar title="Moje škola" />
      <p class="muted lead">Na úvodní stránce pak uvidíš předměty svého ročníku a hry k nim. Ostatní třídy najdeš v Učivu.</p>
      <div class="seg" role="radiogroup" aria-label="Škola">
        {LEVELS.map(([l, name]) => <button key={l} role="radio" aria-checked={level === l} class={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{name}</button>)}
      </div>
      <h2 class="label">{level === 'zs' ? 'Třída' : 'Ročník'}</h2>
      <GradePad level={level} on={p.g} onPick={setGrade} />
      {level === 'ss' && p.g?.[0] === 's' && obory.length > 0 && (
        <>
          <h2 class="label next-label">Obor</h2>
          <div class="list" role="radiogroup" aria-label="Obor">
            <Choice on={!obor} label="Gymnázium nebo jiná škola" hint="všeobecné předměty" onPick={() => setObor(undefined)} />
            {obory.map((o) => <Choice key={o.id} on={obor?.id === o.id} label={`${o.emoji} ${o.name}`} hint={`${o.code} · ${kindName(o)}`} onPick={() => setObor(o.id)} />)}
          </div>
        </>
      )}
      {langs.length > 1 && (
        <>
          <h2 class="label next-label">Druhý cizí jazyk</h2>
          <div class="list" role="radiogroup" aria-label="Druhý cizí jazyk">
            <Choice on={!lang} label="Ukazovat všechny" hint="nebo se ho ještě neučíš" onPick={() => setLanguage(undefined)} />
            {langs.map((s) => <Choice key={s} on={lang === s} label={subjectMeta(s).name} onPick={() => setLanguage(s)} />)}
          </div>
        </>
      )}
      {APPROACHES.length > 0 && (
        <>
          <h2 class="label next-label">Způsob výuky</h2>
          <div class="list" role="radiogroup" aria-label="Způsob výuky">
            <Choice on={!approach} label="Běžná škola" hint="učivo po předmětech" onPick={() => setApproach(undefined)} />
            {APPROACHES.map((a) => <Choice key={a.id} on={approach === a.id} label={`${a.emoji} ${a.name}`} hint="epochy, vlastní výklad, slovní hodnocení" onPick={() => setApproach(a.id)} />)}
          </div>
          {APPROACHES.map((a) => (
            <Link key={a.id} class="row test-key" href={`/${a.id}`}>
              <span class="txt"><b>{a.short}: plán ročníků</b><small>co {a.name.toLowerCase()} mění</small></span><IArrow />
            </Link>
          ))}
        </>
      )}
      <Link class="btn block school-done" href="/" jump>Hotovo</Link>
    </div>
  )
}
