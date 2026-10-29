import { useState } from 'preact/hooks'
import { ABOUT } from '../about'
import { activeProfile } from '../profiles'
import { cleanTime, dailyReminder, saveCalendar } from '../calendar'
import { APPROACHES, setApproach, useApproach } from '../approach'
import { DEFAULT_GOAL, GOALS, goalOf, setGoal, today, useProgress } from '../progress/store'
import { Link } from '../router'
import { useReading } from '../reading'
import { useTheme, type Theme } from '../theme'
import { Bar } from '../ui/Bar'
import { IArrow, ICalendar, ICheck } from '../ui/icons'
import { ProfilesSettings } from './Profiles'

// /nastaveni – device settings (localStorage only, never sent anywhere): who is learning, appearance, reading, school,
// the daily goal with a reminder in the calendar and the way to move progress to another device.

function Toggle({ on, label, hint, onFlip }: { on: boolean; label: string; hint?: string; onFlip: () => void }) {
  return (
    <button class={`row choice ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={onFlip}>
      <span class="txt"><b>{label}</b>{hint && <small>{hint}</small>}</span>
      <span class="tick" aria-hidden="true">{on && <ICheck />}</span>
    </button>
  )
}

function Choice({ on, label, hint, onPick }: { on: boolean; label: string; hint?: string; onPick: () => void }) {
  return (
    <button class={`row choice ${on ? 'on' : ''}`} role="radio" aria-checked={on} onClick={onPick}>
      <span class="txt"><b>{label}</b>{hint && <small>{hint}</small>}</span>
      <span class="tick" aria-hidden="true">{on && <ICheck />}</span>
    </button>
  )
}

export function Settings() {
  const [theme, , choose] = useTheme()
  const approach = useApproach()
  const themes: [Theme, string][] = [['light', 'Světlý'], ['dark', 'Tmavý']]
  const goal = goalOf(useProgress())
  return (
    <div class="page settings">
      <Bar title="Nastavení" />
      <ProfilesSettings />
      <h2 class="label next-label">Vzhled</h2>
      <div class="list" role="radiogroup" aria-label="Vzhled">
        {themes.map(([t, label]) => <Choice key={t} on={theme === t} label={label} onPick={() => choose(t)} />)}
      </div>
      <Reading />
      <h2 class="label next-label">Škola</h2>
      <div class="list" role="radiogroup" aria-label="Škola">
        <Choice on={!approach} label="Běžná škola" hint="učivo po předmětech" onPick={() => setApproach(undefined)} />
        {APPROACHES.map((a) => <Choice key={a.id} on={approach === a.id} label={`${a.emoji} ${a.name}`} hint="epochy, vlastní výklad, slovní hodnocení" onPick={() => setApproach(a.id)} />)}
      </div>
      {APPROACHES.map((a) => (
        <Link key={a.id} class="row test-key" href={`/${a.id}`}>
          <span class="txt"><b>{a.short}: plán ročníků</b><small>co {a.name.toLowerCase()} mění</small></span><IArrow />
        </Link>
      ))}
      <h2 class="label next-label">Denní cíl</h2>
      <div class="list" role="radiogroup" aria-label="Denní cíl">
        {GOALS.map((n) => <Choice key={n} on={goal === n} label={n ? `${n} odpovědí denně` : 'Bez cíle'} hint={n === DEFAULT_GOAL ? 'výchozí' : n === 10 ? 'na rozjezd' : n === 40 ? 'pro dříče' : n === 0 ? 'jen série dní' : undefined} onPick={() => setGoal(n)} />)}
      </div>
      <p class="muted note">Počítá se každá odpověď v kvízu i u slovíček. Série dní vydrží i jeden vynechaný den za týden.</p>
      <Reminder />
      <h2 class="label next-label">Pokrok</h2>
      <div class="list">
        <Link class="row" href="/prehled">
          <span class="txt"><b>Přehled</b><small>co máš procvičené, po předmětech</small></span><IArrow />
        </Link>
        <Link class="row" href="/chyby">
          <span class="txt"><b>Sešit chyb</b><small>otázky, které se ti spletly</small></span><IArrow />
        </Link>
        <Link class="row" href="/sdilet">
          <span class="txt"><b>Přenést pokrok</b><small>na jiné zařízení</small></span><IArrow />
        </Link>
      </div>
      <h2 class="label next-label">Šprtám</h2>
      <div class="list">
        <Link class="row" href="/o-aplikaci">
          <span class="txt"><b>O aplikaci</b><small>jak funguje a co o tobě (ne)ví</small></span><IArrow />
        </Link>
        <a class="row" href={ABOUT.code.repo} rel="noopener">
          <span class="txt"><b>Zdrojový kód</b><small>GitHub · licence MIT</small></span><IArrow />
        </a>
      </div>
    </div>
  )
}

const SIZES: [0 | 1 | 2, string][] = [[0, 'Normální písmo'], [1, 'Větší písmo'], [2, 'Největší písmo']]

/** Bigger text, more space and a typeface that is easier to read (src/reading.ts). */
function Reading() {
  const [r, change] = useReading()
  return (
    <>
      <h2 class="label next-label">Čtení</h2>
      <p class="reading-sample">Když první vysvětlení nesedí, zkus to druhé. Bdí, dbá, 1 l, Il.</p>
      <div class="list" role="radiogroup" aria-label="Velikost písma">
        {SIZES.map(([n, label]) => <Choice key={n} on={r.size === n} label={label} onPick={() => change({ size: n })} />)}
      </div>
      <div class="list next-list">
        <Toggle on={r.wide} label="Víc místa mezi řádky" hint="i mezi písmeny a slovy" onFlip={() => change({ wide: !r.wide })} />
        <Toggle on={r.legible} label="Písmo pro snadné čtení" hint="písmena, která se nepletou (b/d, I/l/1)" onFlip={() => change({ legible: !r.legible })} />
      </div>
      <h2 class="label next-label">Ovládání</h2>
      <div class="list">
        <Toggle on={!r.nokeys} label="Klávesové zkratky v kvízu" hint="1–9 vybere odpověď, H nápověda, Enter dál" onFlip={() => change({ nokeys: !r.nokeys })} />
      </div>
      <p class="muted note">Vypni, když ovládáš aplikaci hlasem: diktované číslo by jinak mohlo vybrat odpověď.</p>
    </>
  )
}

/** A daily reminder in the pupil's own calendar (calendar.ts): no notifications from a server that knows nobody. */
function Reminder() {
  const [time, setTime] = useState('17:00')
  return (
    <>
      <h2 class="label next-label">Připomínka</h2>
      <div class="plan-cal reminder">
        <label>Každý den v <input type="time" value={time} onInput={(e) => setTime(e.currentTarget.value)} /></label>
        <button class="btn" onClick={() => saveCalendar('sprtam-pripominka', dailyReminder(cleanTime(time), today(), activeProfile()?.id))}><ICalendar />Přidat do kalendáře</button>
      </div>
      <p class="muted note">Šprtám nemá server, který by ti posílal upozornění, a o tobě nic neví. Připomínka proto přijde z tvého kalendáře: stáhne se soubor, který kalendář přidá. Vznikne v zařízení a zrušíš ji v kalendáři.</p>
    </>
  )
}
