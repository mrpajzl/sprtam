import { Link } from '../router'
import { IBook, IDice, IHome, IUser } from './icons'

export type Tab = 'home' | 'learn' | 'games' | 'me'

/** Always at hand: one tap to home (the pupil's school), all the učivo, the games or the pupil's own things. */
export function TabBar({ active }: { active?: Tab }) {
  const cur = (t: Tab) => (active === t ? 'page' : undefined)
  return (
    <nav class="tabbar" aria-label="Hlavní nabídka">
      <Link href="/" jump aria-current={cur('home')}><IHome /><span>Domů</span></Link>
      <Link href="/ucivo" jump aria-current={cur('learn')}><IBook /><span>Učivo</span></Link>
      <Link href="/hry" jump aria-current={cur('games')}><IDice /><span>Hry</span></Link>
      <Link href="/ja" jump aria-current={cur('me')}><IUser /><span>Já</span></Link>
    </nav>
  )
}
