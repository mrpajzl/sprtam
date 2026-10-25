import { APPROACHES, setApproach, useApproach } from '../approach'
import { Link } from '../router'
import { useTheme, type Theme } from '../theme'
import { Bar } from '../ui/Bar'
import { IArrow, ICheck } from '../ui/icons'

// /nastaveni – device settings (localStorage only, never sent anywhere): appearance and school.

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
    </div>
  )
}
