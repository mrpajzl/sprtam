import type { ComponentChildren } from 'preact'
import { ABOUT } from '../about'
import { useObor } from '../obory'
import { useProfiles } from '../profiles'
import { activePlans } from '../progress/plan'
import { streakOf } from '../progress/recommend'
import { isMistake, today, useProgress } from '../progress/store'
import { Link } from '../router'
import { TabHead } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IArrow, IBook, ICalendar, IChart, IGear, ISync, IUser } from '../ui/icons'
import { PLAN_PATH } from './Plan'
import { schoolName } from '../school'

// Já: the pupil and the device. Their progress, mistakes and plans; who is learning on this device, moving progress
// elsewhere, settings and what Šprtám is. Mostly in the sheet of the chip in the header (MeChip in School.tsx);
// /ja is the same as a page (links from outside, no JS).

const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

function Key({ href, icon, title, hint }: { href: string; icon: ComponentChildren; title: string; hint: string }) {
  return (
    <Link class="me-tile" href={href}>
      <span class="skey s me-icon">{icon}</span>
      <span class="txt"><b>{title}</b><small>{hint}</small></span>
    </Link>
  )
}

/** The pupil's things as a grid of keys: progress first, then the device. */
export function MeKeys() {
  const p = useProgress()
  const r = useProfiles()
  const n = streakOf(p).n
  const mistakes = Object.values(p.q ?? {}).filter(isMistake).length
  const plans = activePlans(p.k, today()).length
  return (
    <div class="me-grid">
      <Key href="/prehled" icon={<IChart />} title="Přehled" hint={`${n} ${plural(n, 'den', 'dny', 'dní')} v řadě`} />
      <Key href="/chyby" icon={<IBook />} title="Sešit chyb" hint={mistakes ? `${mistakes} k opravení` : 'prázdný'} />
      <Key href={PLAN_PATH} icon={<ICalendar />} title="Před písemkou" hint={plans ? `${plans} ${plural(plans, 'plán', 'plány', 'plánů')}` : 'plán opakování'} />
      <Key href="/profily" icon={<IUser />} title="Kdo se učí" hint={r ? `${r.l.length} ${plural(r.l.length, 'profil', 'profily', 'profilů')}` : 'víc dětí'} />
      <Key href="/sdilet" icon={<ISync />} title="Přenést" hint="na jiné zařízení" />
      <Key href="/nastaveni" icon={<IGear />} title="Nastavení" hint="vzhled, písmo" />
    </div>
  )
}

export function MeScreen() {
  const p = useProgress()
  const o = useObor()
  const r = useProfiles()
  const me = r?.l.find((x) => x.id === r.a)
  return (
    <div class="page me">
      <TabHead title="Já" />
      <Link class="row me-key" style={keyStyle('orange')} href="/skola">
        <span class="skey m">{me ? <b class="em">{me.e}</b> : <IUser />}</span>
        <span class="txt"><b>{me?.n ?? 'Moje škola'}</b><small>{p.g ? schoolName(p.g, o) : 'vyber, kam chodíš'}</small></span>
        <span class="tag">změnit</span>
      </Link>
      <h2 class="label next-label">Moje věci</h2>
      <MeKeys />
      <h2 class="label next-label">Šprtám</h2>
      <div class="list">
        <Link class="row" href="/o-aplikaci"><span class="txt"><b>Co je Šprtám?</b><small>jak funguje a co o tobě (ne)ví</small></span><IArrow /></Link>
        <a class="row" href={ABOUT.code.repo} rel="noopener"><span class="txt"><b>Zdrojový kód</b><small>GitHub · licence MIT</small></span><IArrow /></a>
      </div>
    </div>
  )
}
