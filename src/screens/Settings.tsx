import { ABOUT } from '../about'
import { APPROACHES, setApproach, useApproach } from '../approach'
import { DEFAULT_GOAL, GOALS, goalOf, setGoal, useProgress } from '../progress/store'
import { Link } from '../router'
import { useTheme, type Theme } from '../theme'
import { Bar } from '../ui/Bar'
import { IArrow, ICheck } from '../ui/icons'

// /nastaveni – device settings (localStorage only, never sent anywhere): appearance, school, the daily goal
// and the way to move progress to another device.

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
      <h2 class="label">Vzhled</h2>
      <div class="list" role="radiogroup" aria-label="Vzhled">
        {themes.map(([t, label]) => <Choice key={t} on={theme === t} label={label} onPick={() => choose(t)} />)}
      </div>
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
