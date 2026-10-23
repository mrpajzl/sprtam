import { useEffect, useState } from 'preact/hooks'
import { ALL_GRADES, GRADE_SUBJECTS } from './content/curriculum'
import type { GradeId, SubjectId } from './content/types'
import { decodeProgress } from './progress/code'
import { importProgress } from './progress/store'
import { MODES, type ModeId } from './quiz/engine'
import { go, useRoute } from './router'
import { GradeScreen, Home, SubjectScreen } from './screens/Browse'
import { SyncScreen } from './screens/Sync'
import { QuizScreen, TopicScreen } from './screens/TopicScreen'
import { LEVELS, VocabHome, VocabLevel, VocabSwipe } from './screens/Vocab'
import type { Level } from './vocab/types'

export function App() {
  const r = useRoute()
  const [a, b, c, d, e] = r

  if (a === 'p' && b) return <ImportLink code={b} />
  if (a === 'spojit' && b) return <SyncScreen offer={b} />
  if (a === 'sdilet') return <SyncScreen />
  if (a === 'slovicka') {
    const lvl = LEVELS.find((l) => l.id === b)?.id as Level | undefined
    if (lvl && c) return <VocabSwipe level={lvl} group={c} />
    if (lvl) return <VocabLevel level={lvl} />
    return <VocabHome />
  }
  if (a === 'g' && ALL_GRADES.includes(b as GradeId)) {
    const g = b as GradeId
    if (c && GRADE_SUBJECTS[g].includes(c as SubjectId)) {
      const s = c as SubjectId
      if (d === '~test') return <QuizScreen g={g} s={s} id="~test" mode="test" />
      if (d && e && e in MODES) return <QuizScreen g={g} s={s} id={d} mode={e as ModeId} />
      if (d) return <TopicScreen g={g} s={s} id={d} />
      return <SubjectScreen g={g} s={s} />
    }
    return <GradeScreen g={g} />
  }
  return <Home />
}

/** Opening a shared progress link imports it (the code is in the #fragment, never sent to a server). */
function ImportLink({ code }: { code: string }) {
  const [err, setErr] = useState('')
  useEffect(() => {
    decodeProgress(code).then((p) => { importProgress(p); history.replaceState(null, '', '#/'); go(p.g ? `/g/${p.g}` : '/') }, (e) => setErr(e.message))
  }, [code])
  return <div class="page"><div class="empty"><div class="big">{err ? '⚠️' : '⏳'}</div>{err || 'Načítám pokrok…'}{err && <button class="btn" onClick={() => go('/')}>Domů</button>}</div></div>
}
