import { useEffect, useState } from 'preact/hooks'
import { ABOUT } from './about'
import { approachById } from './approach'
import { EXAM } from './exam'
import { isMode, MAPS_PATH } from './maps'
import { ELEMENTS_PATH, isMode as isElementsMode } from './chem'
import { hasSubjectIn, isGrade } from './content/curriculum'
import { OBOR_PATH } from './obory'
import { decodeProgress, unpack } from './progress/code'
import { importProgress, type Progress } from './progress/store'
import { TOPIC_MODES, type ModeId } from './quiz/engine'
import { go, useRoute } from './router'
import { fullTitle, titles } from './seo'
import { setTheme } from './theme'
import { About } from './screens/About'
import { ApproachScreen } from './screens/Approach'
import { ExamScreen } from './screens/Exam'
import { MapGame, MapsScreen } from './screens/Maps'
import { ElementsGame, ElementsScreen } from './screens/Elements'
import { GradeScreen, SubjectScreen } from './screens/Browse'
import { Home } from './screens/Home'
import { GamesScreen } from './screens/Games'
import { LearnScreen } from './screens/Learn'
import { MeScreen } from './screens/Me'
import { SchoolScreen } from './screens/School'
import { OborScreen } from './screens/Obor'
import { Overview } from './screens/Overview'
import { planFullScreen, PlanRoute } from './screens/Plan'
import { ProfilesScreen } from './screens/Profiles'
import { MistakesScreen, ReviewQuiz } from './screens/Review'
import { Search } from './screens/Search'
import { Settings } from './screens/Settings'
import { SyncScreen } from './screens/Sync'
import { MixScreen, QuizScreen, TopicScreen } from './screens/TopicScreen'
import { TopicWorksheet } from './screens/Worksheet'
import { LEVELS, VocabHome, VocabLangHome, VocabLevel, VocabDrill } from './screens/Vocab'
import { langByPath } from './vocab/langs'
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
  if (a === 'chyby') return <><MistakesScreen /><TabBar active="me" /></>
  if (a === 'prehled') return <><Overview /><TabBar active="me" /></>
  if (a === 'plan') return planFullScreen(c) ? <PlanRoute key={`${b}/${c}`} id={b} sub={c} /> : <><PlanRoute key={`${b}/${c}`} id={b} sub={c} /><TabBar active="me" /></>
  if (a === 'p' && b) return <ImportLink code={b} />
  if (a === 'presun' && b) return <MoveIn code={b} />
  if (a === 'spojit' && b) return <SyncScreen offer={b} />
  if (a === 'hledat') return <><Search /><TabBar /></>
  if (a === 'ucivo') return <><LearnScreen /><TabBar active="learn" /></>
  if (a === 'hry') return <><GamesScreen /><TabBar active="games" /></>
  if (a === 'ja') return <><MeScreen /><TabBar active="me" /></>
  if (a === 'skola') return <><SchoolScreen /><TabBar active="me" /></>
  if (a === 'sdilet') return <><SyncScreen /><TabBar active="me" /></>
  if (a === 'nastaveni') return <><Settings /><TabBar active="me" /></>
  if (a === 'profily') return <><ProfilesScreen /><TabBar active="me" /></>
  if (a === 'o-aplikaci') return <><About /><TabBar active="me" /></>
  if (a === 'widgety') return <><GalleryScreen key={b} name={b} /><TabBar /></>
  if (a === EXAM.id) {
    // Practice gets the whole screen: /prijimacky/<subject>/test, /prijimacky/<subject>/simulace, /prijimacky/<subject>/<area>/test
    if (c === 'test' || c === 'simulace' || d === 'test') return <ExamScreen part={b} area={c} test={d === 'test'} />
    return <><ExamScreen key={`${b}/${c}`} part={b} area={c} /><TabBar active="learn" /></>
  }
  if (`/${a}` === ELEMENTS_PATH) {
    // The game gets the whole screen: /periodicka-tabulka/<set>/<mode>
    if (b && isElementsMode(c)) return <ElementsGame set={b} mode={c} />
    return <><ElementsScreen /><TabBar active="games" /></>
  }
  if (`/${a}` === MAPS_PATH) {
    // The game gets the whole screen: /slepa-mapa/<map>/<mode>
    if (b && isMode(c)) return <MapGame map={b} mode={c} />
    return <><MapsScreen key={b} map={b} /><TabBar active="games" /></>
  }
  if (approachById(a)) {
    if (c && d === 'test') return <ApproachScreen id={a} g={b} block={c} test />
    return <><ApproachScreen key={`${b}/${c}`} id={a} g={b} block={c} /><TabBar active="learn" /></>
  }
  if (a === 'slovicka') {
    // English: /slovicka/<level>/<group>; other languages: /slovicka/<language>/<level>/<group>
    const m = langByPath(b)
    const [lang, lv, grp] = m ? [m.id, c, d] : ['en' as const, b, c]
    const lvl = LEVELS.find((l) => l.id === lv)?.id as Level | undefined
    if (lvl && grp) return <VocabDrill key={`${lang}/${lvl}`} lang={lang} level={lvl} group={grp} />
    const screen = lvl ? <VocabLevel key={`${lang}/${lvl}`} lang={lang} level={lvl} /> : m ? <VocabLangHome lang={m.id} /> : <VocabHome />
    return <>{screen}<TabBar active="games" /></>
  }
  if (a === OBOR_PATH.slice(1)) return <><OborScreen key={b} id={b} /><TabBar active="learn" /></>
  if (a === 'g' && isGrade(b)) {
    const g = b
    const s = hasSubjectIn(g, c) ? c : undefined
    if (s && d === '~test') return <QuizScreen g={g} s={s} id="~test" mode="test" />
    if (s && d && e && TOPIC_MODES.includes(e as ModeId)) return <QuizScreen g={g} s={s} id={d} mode={e as ModeId} />
    if (s && d && e === 'tisk') return <TopicWorksheet g={g} s={s} id={d} />
    const screen = !s ? <GradeScreen g={g} /> : d ? <TopicScreen g={g} s={s} id={d} /> : <SubjectScreen g={g} s={s} />
    return <>{screen}<TabBar active="learn" /></>
  }
  return <><Home /><TabBar active="home" /></>
}

/** Title of screens that know it without loading content; `null` = the screen sets it (topics). */
function routeTitle([a, b, c, d]: string[]): string | null | undefined {
  if (a === 'hledat') return 'Hledat'
  if (a === 'ucivo') return titles.learn()
  if (a === 'hry') return titles.games()
  if (a === 'ja') return 'Já'
  if (a === 'skola') return 'Moje škola'
  if (a === 'nastaveni') return 'Nastavení'
  if (a === 'profily') return 'Kdo se učí?'
  if (a === 'prehled') return 'Přehled'
  if (a === 'chyby') return 'Sešit chyb'
  if (a === 'dnes') return 'Dnešní opakování'
  if (a === 'plan') return null
  if (a === 'o-aplikaci') return ABOUT.title
  if (a === 'widgety') return 'Galerie widgetů'
  if (a === EXAM.id || `/${a}` === MAPS_PATH || `/${a}` === ELEMENTS_PATH || approachById(a)) return null
  if (a === 'slovicka') {
    const m = langByPath(b)
    if (m) return c ? titles.vocabLevel(c, m.title) : titles.vocab(m.title)
    return b ? titles.vocabLevel(b) : titles.vocab()
  }
  if (a === 'g' && isGrade(b)) {
    const g = b
    if (hasSubjectIn(g, c)) return d === '~test' || !d ? titles.subject(g, c) : null
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
