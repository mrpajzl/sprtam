import { APPROACHES } from '../approach'
import { hasSubject } from '../content'
import { ODB } from '../content/curriculum'
import { OBOR_PATH, readyObory, useObor } from '../obory'
import { useProgress } from '../progress/store'
import { Link } from '../router'
import { TabHead } from '../ui/Bar'
import { appExtras, ExtraList } from '../ui/Extras'
import { keyStyle } from '../ui/glyphs'
import { IArrow, ISearch } from '../ui/icons'
import { GradePad } from './School'

// Učivo (/ucivo): everything there is to learn, whatever the pupil's school: every grade, the obory of odborné
// školy, the teaching approaches and the preparation for exams (src/games.ts). The pupil's own year is on the home screen.

export function LearnScreen() {
  const p = useProgress()
  const obor = useObor()
  const obory = obor || readyObory((s) => hasSubject(ODB, s)).length > 0
  return (
    <div class="page learn">
      <TabHead title="Učivo" />
      <Link class="search-key" href="/hledat">
        <ISearch /><span>Hledat téma nebo slovíčko</span><kbd>/</kbd>
      </Link>
      <section class="sec">
        <h2 class="label">Třídy</h2>
        <GradePad on={p.g} link />
      </section>
      {(obory || APPROACHES.length > 0) && (
        <section class="sec">
          <h2 class="label">Školy</h2>
          <div class="list">
            {obory && (
              <Link class="row obor-key" style={keyStyle('ink')} href={obor ? `${OBOR_PATH}/${obor.id}` : OBOR_PATH}>
                <span class="skey m"><b class="em">{obor?.emoji ?? '🛠️'}</b></span>
                <span class="txt"><b>{obor?.name ?? 'Odborné školy'}</b><small>{obor ? `můj obor · ${obor.code}` : 'IT, strojírenství, kosmetika a další obory'}</small></span>
                <IArrow />
              </Link>
            )}
            {APPROACHES.map((a) => (
              <Link key={a.id} class="row obor-key" style={keyStyle('green')} href={`/${a.id}`}>
                <span class="skey m"><b class="em">{a.emoji}</b></span>
                <span class="txt"><b>{a.name}</b><small>epochy a učivo po ročnících</small></span>
                <IArrow />
              </Link>
            ))}
          </div>
        </section>
      )}
      <ExtraList list={appExtras().filter((x) => x.kind === 'priprava')} />
    </div>
  )
}
