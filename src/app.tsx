import { useEffect, useState } from 'preact/hooks'
import { ALL_GRADES, GRADE_SUBJECTS } from './content/curriculum'
import type { GradeId, SubjectId } from './content/types'
import { decodeProgress, unpack } from './progress/code'
import { importProgress, type Progress } from './progress/store'
import { MODES, type ModeId } from './quiz/engine'
import { go, useRoute } from './router'
import { fullTitle, titles } from './seo'
import { setTheme } from './theme'
import { GradeScreen, SubjectScreen } from './screens/Browse'
import { Home } from './screens/Home'
import { Search } from './screens/Search'
import { SyncScreen } from './screens/Sync'
import { MixScreen, QuizScreen, TopicScreen } from './screens/TopicScreen'
import { LEVELS, VocabHome, VocabLevel, VocabDrill } from './screens/Vocab'
import type { Level } from './vocab/types'
import { TabBar } from './ui/TabBar'

export function App() {
  const r = useRoute()
  const [a, b, c, d, e] = r
  const title = routeTitle(r)
  useEffect(() => { if (title !== null) document.title = fullTitle(title) }, [title])

  // „/“ opens search from anywhere (except while typing).
  useEffect(() => {
    const on = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement
      if (ev.key === '/' && !ev.metaKey && !ev.ctrlKey && !/^(INPUT|TEXTAREA)$/.test(t.tagName) && !t.isContentEditable) { ev.preventDefault(); go('/hledat') }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])

  // Practice (quiz, drill) and one-off flows get the whole screen; everything else has the tab bar.
  if (a === 'mix') return <MixScreen />
  if (a === 'p' && b) return <ImportLink code={b} />
  if (a === 'presun' && b) return <MoveIn code={b} />
  if (a === 'spojit' && b) return <SyncScreen offer={b} />
  if (a === 'hledat') return <><Search /><TabBar active="search" /></>
  if (a === 'sdilet') return <><SyncScreen /><TabBar /></>
  if (a === 'slovicka') {
    const lvl = LEVELS.find((l) => l.id === b)?.id as Level | undefined
    if (lvl && c) return <VocabDrill level={lvl} group={c} />
    return <>{lvl ? <VocabLevel level={lvl} /> : <VocabHome />}<TabBar active="vocab" /></>
  }
  if (a === 'g' && ALL_GRADES.includes(b as GradeId)) {
    const g = b as GradeId
    const s = GRADE_SUBJECTS[g].includes(c as SubjectId) ? (c as SubjectId) : undefined
    if (s && d === '~test') return <QuizScreen g={g} s={s} id="~test" mode="test" />
    if (s && d && e && e in MODES) return <QuizScreen g={g} s={s} id={d} mode={e as ModeId} />
    const screen = !s ? <GradeScreen g={g} /> : d ? <TopicScreen g={g} s={s} id={d} /> : <SubjectScreen g={g} s={s} />
    return <>{screen}<TabBar active="grade" grade={g} /></>
  }
  return <><Home /><TabBar active="home" /></>
}

/** Title of screens that know it without loading content; `null` = the screen sets it (topics). */
function routeTitle([a, b, c, d]: string[]): string | null | undefined {
  if (a === 'hledat') return 'Hledat'
  if (a === 'slovicka') return b ? titles.vocabLevel(b) : titles.vocab()
  if (a === 'g' && ALL_GRADES.includes(b as GradeId)) {
    const g = b as GradeId
    if (c && GRADE_SUBJECTS[g].includes(c as SubjectId)) return d === '~test' || !d ? titles.subject(g, c as SubjectId) : null
    return titles.grade(g)
  }
  return undefined
}

/** Opening a shared progress link imports it (the code is in the #fragment, never sent to a server). */
function ImportLink({ code }: { code: string }) {
  const [err, setErr] = useState('')
  useEffect(() => {
    decodeProgress(code).then((p) => { importProgress(p); go(p.g ? `/g/${p.g}` : '/', true) }, (e) => setErr(e.message))
  }, [code])
  return <div class="page"><div class="empty">{err || 'Načítám pokrok…'}{err && <button class="btn" onClick={() => go('/')}>Domů</button>}</div></div>
}

/** Arrival from the old domain (public/move.js): take over its progress and theme, then show the page that was open. */
function MoveIn({ code }: { code: string }) {
  useEffect(() => {
    const done = () => go(location.pathname + location.search, true)
    unpack<{ p?: Progress; t?: 'dark'; h?: string }>(code).then((d) => {
      if (d.p?.v === 1) importProgress(d.p)
      if (d.t === 'dark') setTheme('dark')
      if (d.h && /^#\/(p|spojit)\//.test(d.h)) go(location.pathname + location.search + d.h, true)
      else done()
    }, done)
  }, [code])
  return <div class="page"><div class="empty">Načítám pokrok…</div></div>
}
