import { useObor } from '../obory'
import { extrasFor } from '../games'
import { useProgress } from '../progress/store'
import { TabHead } from '../ui/Bar'
import { appExtras, ExtraRow } from '../ui/Extras'
import { schoolSubjects, useLanguage } from '../school'

// Hry (/hry): every learning game of src/games.ts, those of the pupil's subjects first. Each game also shows up
// by the subjects it belongs to (a grade, a subject, the home screen).

export function GamesScreen() {
  const p = useProgress()
  const o = useObor()
  const lang = useLanguage()
  const all = appExtras().filter((x) => x.kind === 'hra')
  const subjects = p.g ? Object.values(schoolSubjects(p.g, o, lang)).flat() : []
  const mine = p.g ? extrasFor(all, p.g, subjects) : []
  const rest = all.filter((x) => !mine.includes(x))
  return (
    <div class="page games">
      <TabHead title="Hry" />
      <p class="muted lead">Procvičování hrou. Každou hru najdeš i u předmětu, ke kterému patří.</p>
      {mine.length > 0 && (
        <section class="sec">
          <h2 class="label">K tvým předmětům</h2>
          <div class="list">{mine.map((x) => <ExtraRow key={x.id} x={x} />)}</div>
        </section>
      )}
      {rest.length > 0 && (
        <section class="sec">
          <h2 class="label">{mine.length ? 'Další hry' : 'Všechny hry'}</h2>
          <div class="list">{rest.map((x) => <ExtraRow key={x.id} x={x} />)}</div>
        </section>
      )}
    </div>
  )
}
