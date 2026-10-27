import { useEffect, useState } from 'preact/hooks'
import { ABOUT } from './about'
import { approachById } from './approach'
import { ALL_GRADES, GRADE_SUBJECTS } from './content/curriculum'
import type { GradeId, SubjectId } from './content/types'
import { decodeProgress, unpack } from './progress/code'
import { importProgress, type Progress } from './progress/store'
import { TOPIC_MODES, type ModeId } from './quiz/engine'
import { go, useRoute } from './router'
import { fullTitle, titles } from './seo'
import { setTheme } from './theme'
import { About } from './screens/About'
import { ApproachScreen } from './screens/Approach'
import { GradeScreen, SubjectScreen } from './screens/Browse'
import { Home } from './screens/Home'
import { Overview } from './screens/Overview'
import { MistakesScreen, ReviewQuiz } from './screens/Review'
import { Search } from './screens/Search'
import { Settings } from './screens/Settings'
import { SyncScreen } from './screens/Sync'
import { MixScreen, QuizScreen, TopicScreen } from './screens/TopicScreen'
import { LEVELS, VocabHome, VocabLevel, VocabDrill } from './screens/Vocab'
import type { Level } from './vocab/types'
import { TabBar } from './ui/TabBar'
import { useAsync } from './ui/useAsync'

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
  if (a === 'dnes') return <ReviewQuiz mode="dnes" />
  if (a === 'chyby' && b === 'procvicit') return <ReviewQuiz mode="chyby" />
  if (a === 'chyby') return <><MistakesScreen /><TabBar /></>
  if (a === 'prehled') return <><Overview /><TabBar /></>
  if (a === 'p' && b) return <ImportLink code={b} />
  if (a === 'presun' && b) return <MoveIn code={b} />
  if (a === 'spojit' && b) return <SyncScreen offer={b} />
  if (a === 'hledat') return <><Search /><TabBar active="search" /></>
  if (a === 'sdilet') return <><SyncScreen /><TabBar /></>
  if (a === 'nastaveni') return <><Settings /><TabBar /></>
  if (a === 'o-aplikaci') return <><About /><TabBar /></>
  if (a === 'widgety') return <><GalleryScreen key={b} name={b} /><TabBar /></>
  if (approachById(a)) {
    if (c && d === 'test') return <ApproachScreen id={a} g={b} block={c} test />
    const g = ALL_GRADES.includes(b as GradeId) ? (b as GradeId) : undefined
    return <><ApproachScreen key={`${b}/${c}`} id={a} g={b} block={c} />{g ? <TabBar active="grade" grade={g} /> : <TabBar />}</>
  }
  if (a === 'slovicka') {
    const lvl = LEVELS.find((l) => l.id === b)?.id as Level | undefined
    if (lvl && c) return <VocabDrill level={lvl} group={c} />
    return <>{lvl ? <VocabLevel level={lvl} /> : <VocabHome />}<TabBar active="vocab" /></>
  }
  if (a === 'g' && ALL_GRADES.includes(b as GradeId)) {
    const g = b as GradeId
    const s = GRADE_SUBJECTS[g].includes(c as SubjectId) ? (c as SubjectId) : undefined
    if (s && d === '~test') return <QuizScreen g={g} s={s} id="~test" mode="test" />
    if (s && d && e && TOPIC_MODES.includes(e as ModeId)) return <QuizScreen g={g} s={s} id={d} mode={e as ModeId} />
    const screen = !s ? <GradeScreen g={g} /> : d ? <TopicScreen g={g} s={s} id={d} /> : <SubjectScreen g={g} s={s} />
    return <>{screen}<TabBar active="grade" grade={g} /></>
  }
  return <><Home /><TabBar active="home" /></>
}

/** Title of screens that know it without loading content; `null` = the screen sets it (topics). */
function routeTitle([a, b, c, d]: string[]): string | null | undefined {
  if (a === 'hledat') return 'Hledat'
  if (a === 'nastaveni') return 'Nastavení'
  if (a === 'prehled') return 'Přehled'
  if (a === 'chyby') return 'Sešit chyb'
  if (a === 'dnes') return 'Dnešní opakování'
  if (a === 'o-aplikaci') return ABOUT.title
  if (a === 'widgety') return 'Galerie widgetů'
  if (approachById(a)) return null
  if (a === 'slovicka') return b ? titles.vocabLevel(b) : titles.vocab()
  if (a === 'g' && ALL_GRADES.includes(b as GradeId)) {
    const g = b as GradeId
    if (c && GRADE_SUBJECTS[g].includes(c as SubjectId)) return d === '~test' || !d ? titles.subject(g, c as SubjectId) : null
    return titles.grade(g)
  }
  return undefined
}

/** The gallery is for authors: its code loads only when opened. */
function GalleryScreen({ name }: { name?: string }) {
  const m = useAsync(() => import('./screens/Gallery'), [])
  return m ? <m.Gallery name={name} /> : <div class="page" />
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
