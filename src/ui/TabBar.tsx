import { Link } from '../router'
import { IBook, IDice, IHome, ISearch } from './icons'

export type Tab = 'home' | 'learn' | 'games' | 'search'

/** Always at hand: one tap to home (the pupil's school), all the učivo, the games or search. The pupil's own things
 * (Já) are behind the chip in the header (MeChip in screens/School.tsx). */
export function TabBar({ active }: { active?: Tab }) {
  const cur = (t: Tab) => (active === t ? 'page' : undefined)
  return (
    <nav class="tabbar" aria-label="Hlavní nabídka">
      <Link href="/" jump aria-current={cur('home')}><IHome /><span>Dnes</span></Link>
      <Link href="/ucivo" jump aria-current={cur('learn')}><IBook /><span>Učivo</span></Link>
      <Link href="/hry" jump aria-current={cur('games')}><IDice /><span>Hry</span></Link>
      <Link href="/hledat" jump aria-current={cur('search')}><ISearch /><span>Hledat</span></Link>
    </nav>
  )
}
