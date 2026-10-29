import { useEffect, useState } from 'preact/hooks'
import { get, onSignedOut, post } from './api'
import type { Me } from './passkey'
import { go, nav, useRoute } from './router'
import { Account } from './screens/Account'
import { Applications } from './screens/Applications'
import { Apply } from './screens/Apply'
import { History } from './screens/History'
import { Invite } from './screens/Invite'
import { Library } from './screens/Library'
import { Login } from './screens/Login'
import { Releases } from './screens/Releases'
import { Reports } from './screens/Reports'
import { Requests } from './screens/Requests'
import { Review, ReviewQueue } from './screens/Review'
import { TopicView } from './screens/Topic'
import { Users } from './screens/Users'
import { Editor } from './editor/Editor'
import { refreshIndex } from './store'
import { I, Toasts } from './ui/kit'

// Screens: /ucivo[/<grade>[/<subject>[/<topic>]]] library and a topic read only – open to everyone · /navrh/<id> editor ·
// /kontrola every change by state (open / approved / rejected; ?moje=1 only mine, ?rocnik=&predmet= one grade and subject) · /kontrola/<id> one change · /historie/<grade>/<subject>/<topic> versions ·
// /hlaseni error reports from pupils (?stav=vyrizena, ?rocnik=&predmet=, ?tema=<g>/<s>/<id>) · /pomucky widget requests · /vydani releases (admin) · /uzivatele moderators (admin) ·
// /zadosti applications to become a moderator (admin; ?stav=vyrizene) · /ucet own account · /prihlaseni[?dalsi=<path>] sign-in · /pozvanka#<token> invite ·
// /zapojit-se[?tema=<g>/<s>/<id>] the public application form. Everything except the library and the form needs a signed-in moderator.

const PUBLIC = ['ucivo', 'zapojit-se']
const SCREENS = ['ucivo', 'kontrola', 'historie', 'hlaseni', 'pomucky', 'vydani', 'uzivatele', 'zadosti', 'ucet', 'zapojit-se']

/** Where to go after signing in: only a path of this app, never another site. */
const nextPath = () => { const p = new URLSearchParams(location.search).get('dalsi') ?? '/'; return /^\/(?![/\\])/.test(p) ? p : '/' }

export interface SessionInfo { user: Me | null; approvals: number }

export function App() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const route = useRoute()

  const load = () => get<SessionInfo>('/api/session').then(setSession, () => setSession({ user: null, approvals: 1 }))
  useEffect(() => { load() }, [])
  // Signed in on /prihlaseni (just now or already before): back to where the visitor came from.
  useEffect(() => { if (session?.user && route[0] === 'prihlaseni') go(nextPath(), true) }, [session?.user, route[0]])
  // Who is editing what is only sent to moderators: reload the catalogue when that changes.
  useEffect(() => refreshIndex(), [session?.user?.id])
  useEffect(() => onSignedOut(() => setSession((s) => ({ approvals: s?.approvals ?? 1, user: null }))), [])
  // How many changes of others wait for review: a number on the tab, refreshed whenever the screen changes.
  const [waiting, setWaiting] = useState(0)
  // …and how many error reports from pupils are open.
  const [reports, setReports] = useState(0)
  // …and (admins) how many people ask to become a moderator.
  const [applications, setApplications] = useState(0)
  useEffect(() => {
    if (!session?.user) return
    get<{ mine: boolean; myVerdict: string | null; status: string }[]>('/api/reviews').then((l) => setWaiting(l.filter((d) => d.status === 'review' && !d.mine && !d.myVerdict).length), () => {})
    get<{ open: number }>('/api/reports/counts').then((c) => setReports(c.open), () => {})
    if (session.user.role === 'admin') get<{ open: number }>('/api/admin/applications/counts').then((c) => setApplications(c.open), () => {})
  }, [session?.user?.id, route.join('/')])

  // Phones: the "Více" sheet of the bottom bar closes on every navigation.
  const [more, setMore] = useState(false)
  useEffect(() => setMore(false), [route.join('/')])

  if (!session) return <div class="boot" />
  const screen = route[0] ?? 'ucivo'
  const signedIn = (user: Me) => { setSession({ ...session, user }); if (screen === 'pozvanka') go('/', true) }

  if (screen === 'pozvanka') return <><Invite onDone={signedIn} /><Toasts /></>
  const user = session.user
  if (!user && (screen === 'prihlaseni' || !PUBLIC.includes(screen))) return <><Login onDone={signedIn} /><Toasts /></>
  if (user && screen === 'prihlaseni') return <div class="boot" />
  if (user && screen === 'navrh' && route[1]) return <><Editor id={route[1]} me={user} /><Toasts /></>
  // My drafts moved into the review screen (old links and bookmarks).
  if (screen === 'navrhy') { go('/kontrola?moje=1', true); return <div class="boot" /> }

  const logout = async () => { await post('/api/auth/logout').catch(() => {}); setSession({ ...session, user: null }); go('/', true) }
  const link = (href: string, label: string, icon: preact.JSX.Element, on: boolean, badge = 0) => (
    <a href={href} onClick={nav(href)} class={on ? 'on' : ''} aria-current={on ? 'page' : undefined} title={label}>{icon}<span>{label}</span>{badge > 0 && <i class="dot-n">{badge}</i>}</a>
  )
  const admin = user?.role === 'admin'
  return (
    <div class={`shell ${user ? 'has-bnav' : ''}`}>
      <header class="top">
        <a class="brand" href="/" onClick={nav('/')}><b>šprtám</b><span>moderace</span></a>
        <nav class="tabs">
          {link('/', 'Učivo', <I.book />, screen === 'ucivo')}
          {user && link('/kontrola', waiting ? `Kontrola · ${waiting}` : 'Kontrola', <I.check />, screen === 'kontrola')}
          {user && link('/hlaseni', reports ? `Hlášení · ${reports}` : 'Hlášení', <I.warn />, screen === 'hlaseni')}
          {user && link('/pomucky', 'Pomůcky', <I.bulb />, screen === 'pomucky')}
          {user?.role === 'admin' && link('/vydani', 'Vydání', <I.layers />, screen === 'vydani')}
          {user?.role === 'admin' && link('/uzivatele', 'Moderátoři', <I.users />, screen === 'uzivatele')}
          {user?.role === 'admin' && link('/zadosti', applications ? `Žádosti · ${applications}` : 'Žádosti', <I.inbox />, screen === 'zadosti')}
        </nav>
        <div class="who">
          {user ? <>
            {link('/ucet', user.name, <I.user />, screen === 'ucet')}
            <button class="icon" onClick={logout} title="Odhlásit se" aria-label="Odhlásit se"><I.logout /></button>
          </> : <>
            {screen !== 'zapojit-se' && <a class="join" href="/zapojit-se" onClick={nav('/zapojit-se')} title="Chci kontrolovat učivo"><I.users /><span>Zapojit se</span></a>}
            <a href={`/prihlaseni?dalsi=${encodeURIComponent(location.pathname)}`} onClick={nav(`/prihlaseni?dalsi=${encodeURIComponent(location.pathname)}`)} title="Přihlášení pro moderátory"><I.key /><span>Přihlásit se</span></a>
          </>}
        </div>
      </header>
      <main class="main">
        {screen === 'ucivo' && (route[3]
          ? <TopicView key={route.slice(1, 4).join('/')} g={route[1]} s={route[2]} id={route[3]} me={user} />
          : <Library g={route[1]} s={route[2]} me={user} />)}
        {user && screen === 'kontrola' && (route[1] ? <Review key={route[1]} id={route[1]} me={user} /> : <ReviewQueue me={user} />)}
        {user && screen === 'historie' && route[3] && <History key={route.slice(1, 4).join('/')} g={route[1]} s={route[2]} id={route[3]} me={user} />}
        {user && screen === 'hlaseni' && <Reports />}
        {user && screen === 'pomucky' && <Requests me={user} />}
        {user?.role === 'admin' && screen === 'vydani' && <Releases />}
        {user?.role === 'admin' && screen === 'uzivatele' && <Users me={user} />}
        {user?.role === 'admin' && screen === 'zadosti' && <Applications onCount={setApplications} />}
        {screen === 'zapojit-se' && <Apply me={user} />}
        {user && screen === 'ucet' && <Account me={user} onLogout={logout} />}
        {!SCREENS.includes(screen) && <div class="empty-state">Tahle stránka neexistuje. <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>}
      </main>
      {user && (
        // Phones: the main screens in a bottom bar within thumb reach; widget requests, admin screens and the account under "Více".
        <nav class="bnav" aria-label="Hlavní navigace">
          {link('/', 'Učivo', <I.book />, screen === 'ucivo')}
          {link('/kontrola', 'Kontrola', <I.check />, screen === 'kontrola', waiting)}
          {link('/hlaseni', 'Hlášení', <I.warn />, screen === 'hlaseni', reports)}
          <button class={['pomucky', 'vydani', 'uzivatele', 'zadosti', 'ucet'].includes(screen) || more ? 'on' : ''} onClick={() => setMore(!more)} aria-expanded={more}><I.more /><span>Více</span>{admin && applications > 0 && <i class="dot-n">{applications}</i>}</button>
        </nav>
      )}
      {more && user && (
        <>
          <div class="sheet-backdrop" onClick={() => setMore(false)} />
          <div class="more-sheet" role="dialog" aria-label="Více">
            {link('/pomucky', 'Pomůcky', <I.bulb />, screen === 'pomucky')}
            {admin && link('/vydani', 'Vydání', <I.layers />, screen === 'vydani')}
            {admin && link('/uzivatele', 'Moderátoři', <I.users />, screen === 'uzivatele')}
            {admin && link('/zadosti', 'Žádosti o moderátorství', <I.inbox />, screen === 'zadosti', applications)}
            {link('/ucet', `Můj účet · ${user!.name}`, <I.user />, screen === 'ucet')}
            <button onClick={logout}><I.logout /><span>Odhlásit se</span></button>
          </div>
        </>
      )}
      <Toasts />
    </div>
  )
}
