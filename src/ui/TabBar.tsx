import { GRADE_NAME } from '../content/curriculum'
import type { GradeId } from '../content/types'
import { useProgress } from '../progress/store'
import { Link } from '../router'
import { IGrid, IHome, ISearch } from './icons'

export type Tab = 'home' | 'grade' | 'search' | 'vocab'

/** Always at hand: one tap to home, the class, search or vocabulary from any screen. */
export function TabBar({ active, grade }: { active?: Tab; grade?: GradeId }) {
  const p = useProgress()
  const g = grade ?? p.g
  const cur = (t: Tab) => (active === t ? 'page' : undefined)
  return (
    <nav class="tabbar" aria-label="Hlavní nabídka">
      <Link href="/" jump aria-current={cur('home')}><IHome /><span>Domů</span></Link>
      {g && <Link href={`/g/${g}`} jump aria-current={cur('grade')}><IGrid /><span>{GRADE_NAME[g]}</span></Link>}
      <Link href="/hledat" jump aria-current={cur('search')}><ISearch /><span>Hledat</span></Link>
      <Link href="/slovicka" jump aria-current={cur('vocab')}><b class="aa" aria-hidden="true">Aa</b><span>Slovíčka</span></Link>
    </nav>
  )
}
