import { useEffect, useRef, useState } from 'preact/hooks'
import { APPROACHES, setApproach, useApproach } from '../approach'
import { hasSubject } from '../content'
import { GRADE_NAME, ODB, STAGES, subjectMeta } from '../content/curriculum'
import type { YearId } from '../content/types'
import { readyObory, setObor, useObor } from '../obory'
import { languagesOf, setLanguage, useLanguage } from '../school'
import { setGrade, useProgress } from '../progress/store'
import { Link } from '../router'
import { Bar } from '../ui/Bar'
import { IArrow, ICheck, IChevron } from '../ui/icons'
import { switchProfile, useProfiles } from '../profiles'

// Moje škola: where the pupil goes to school, in a sheet from the chip in the home screen's header (and at /skola). The home screen then shows the subjects of that year (and of
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

/** A setting as a row; tapping it opens the system picker (a transparent <select> over the row). */
function Pick({ label, value, options, onPick }: { label: string; value: string; options: [string, string][]; onPick: (v: string) => void }) {
  return (
    <label class="row pick">
      <span class="txt"><b>{label}</b><small>{options.find(([v]) => v === value)?.[1]}</small></span>
      <span class="tag">změnit</span>
      <select value={value} onChange={(e) => onPick(e.currentTarget.value)} aria-label={label}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )
}

/** Where the pupil goes to school: the level, the year, and as the year allows the obor, the second language and the approach. */
export function SchoolForm() {
  const p = useProgress()
  const [level, setLevel] = useState<Level>(levelOf(p.g))
  const obor = useObor()
  const approach = useApproach()
  const obory = readyObory((s) => hasSubject(ODB, s))
  const lang = useLanguage()
  // With an obor the year has no second language (src/obory.ts).
  const langs = p.g && !(obor && p.g[0] === 's') ? languagesOf(p.g) : []
  return (
    <div class="school-form">
      <div class="seg" role="radiogroup" aria-label="Škola">
        {LEVELS.map(([l, name]) => <button key={l} role="radio" aria-checked={level === l} class={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{name}</button>)}
      </div>
      <GradePad level={level} on={p.g} onPick={setGrade} />
      <div class="list picks">
        {level === 'ss' && p.g?.[0] === 's' && obory.length > 0 && (
          <Pick label="Obor" value={obor?.id ?? ''} onPick={(v) => setObor(v || undefined)}
            options={[['', 'gymnázium nebo jiná škola'], ...obory.map((o): [string, string] => [o.id, `${o.emoji} ${o.name}`])]} />
        )}
        {langs.length > 1 && (
          <Pick label="Druhý cizí jazyk" value={lang ?? ''} onPick={(v) => setLanguage((v || undefined) as typeof lang)}
            options={[['', 'všechny (nebo žádný)'], ...langs.map((s): [string, string] => [s, subjectMeta(s).name])]} />
        )}
        {APPROACHES.length > 0 && (
          <Pick label="Způsob výuky" value={approach ?? ''} onPick={(v) => setApproach(v || undefined)}
            options={[['', 'běžná škola'], ...APPROACHES.map((a): [string, string] => [a.id, `${a.emoji} ${a.name}`])]} />
        )}
      </div>
    </div>
  )
}

/** "8. tř." / "2. roč." – the pupil's year on the header chip. */
export const shortYear = (g: YearId) => `${GRADE_NAME[g].split('.')[0]}. ${g[0] === 'z' ? 'tř.' : 'roč.'}`

/** The header chip of the home screen: who is learning and where; opens the sheet to change it. */
export function SchoolChip() {
  const [open, setOpen] = useState(false)
  const g = useProgress().g
  const o = useObor()
  const r = useProfiles()
  const me = r?.l.find((x) => x.id === r.a)
  const where = g ? `${shortYear(g)}${o && g[0] === 's' ? ` · ${o.emoji}` : ''}` : 'Kam chodíš?'
  return (
    <>
      <button class="school-chip" aria-haspopup="dialog" aria-label={`${me ? `Učí se ${me.n}, ` : ''}${g ? GRADE_NAME[g] : 'škola nevybraná'}. Změnit`} onClick={() => setOpen(true)}>
        {me && <span class="who-em" aria-hidden="true">{me.e}</span>}
        <b>{me ? `${me.n} · ${where}` : where}</b>
        <IChevron />
      </button>
      {open && <SchoolSheet onClose={() => setOpen(false)} />}
    </>
  )
}

/** Kam chodíš? The school and, on a shared device, who is learning: a sheet over the home screen. */
function SchoolSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const r = useProfiles()
  useEffect(() => { ref.current?.showModal() }, [])
  useEffect(() => {
    addEventListener('popstate', onClose)
    return () => removeEventListener('popstate', onClose)
  }, [])
  const close = () => ref.current?.close()
  return (
    <dialog ref={ref} class="school-sheet" aria-label="Kam chodíš do školy" onClose={onClose} onKeyDown={(e) => e.stopPropagation()} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div class="school-sheet-body">
        <span class="grab" aria-hidden="true" />
        <h2 class="label">Kam chodíš?</h2>
        <SchoolForm />
        {r && (
          <>
            <h2 class="label next-label">Kdo se učí na tomhle zařízení</h2>
            <div class="list">
              {r.l.map((x) => (
                <button key={x.id} class={`row choice ${x.id === r.a ? 'on' : ''}`} role="radio" aria-checked={x.id === r.a} onClick={() => switchProfile(x.id)}>
                  <span class="who-em" aria-hidden="true">{x.e}</span>
                  <span class="txt"><b>{x.n}</b><small>{x.id === r.a ? 'učí se teď' : 'přepnout'}</small></span>
                  <span class="tick" aria-hidden="true">{x.id === r.a && <ICheck />}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <Link class="row sheet-more" href="/nastaveni" onClick={close}>
          <span class="txt"><b>{r ? 'Přidat nebo upravit profily' : 'Učí se tu víc dětí?'}</b><small>v nastavení</small></span><IArrow />
        </Link>
        <button class="btn block school-done" onClick={close}>Hotovo</button>
      </div>
    </dialog>
  )
}

export function SchoolScreen() {
  return (
    <div class="page school">
      <Bar title="Moje škola" />
      <p class="muted lead">Na úvodní stránce pak uvidíš předměty svého ročníku a hry k nim. Ostatní třídy najdeš v Učivu.</p>
      <SchoolForm />
      {APPROACHES.map((a) => (
        <Link key={a.id} class="row test-key" href={`/${a.id}`}>
          <span class="txt"><b>{a.short}: plán ročníků</b><small>co {a.name.toLowerCase()} mění</small></span><IArrow />
        </Link>
      ))}
      <Link class="btn block school-done" href="/" jump>Hotovo</Link>
    </div>
  )
}
