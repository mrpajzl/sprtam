import { useEffect, useState } from 'preact/hooks'
import { get, onSignedOut, post } from './api'
import type { Me } from './passkey'
import { go, nav, useRoute } from './router'
import { Account } from './screens/Account'
import { Drafts } from './screens/Drafts'
import { History } from './screens/History'
import { Invite } from './screens/Invite'
import { Library } from './screens/Library'
import { Login } from './screens/Login'
import { Releases } from './screens/Releases'
import { Requests } from './screens/Requests'
import { Review, ReviewQueue } from './screens/Review'
import { TopicView } from './screens/Topic'
import { Users } from './screens/Users'
import { Editor } from './editor/Editor'
import { refreshIndex } from './store'
import { I, Toasts } from './ui/kit'

// Screens: /ucivo[/<grade>[/<subject>[/<topic>]]] library and a topic read only – open to everyone · /navrh/<id> editor ·
// /navrhy own drafts · /kontrola review queue · /kontrola/<id> review of one change · /historie/<grade>/<subject>/<topic> versions ·
// /pomucky widget requests · /vydani releases (admin) · /uzivatele moderators (admin) · /ucet own account ·
// /prihlaseni[?dalsi=<path>] sign-in · /pozvanka#<token> invite. Everything except the library needs a signed-in moderator.

const PUBLIC = ['ucivo']
const SCREENS = ['ucivo', 'navrhy', 'kontrola', 'historie', 'pomucky', 'vydani', 'uzivatele', 'ucet']

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
  useEffect(() => {
    if (!session?.user) return
    get<{ mine: boolean; myVerdict: string | null }[]>('/api/reviews').then((l) => setWaiting(l.filter((d) => !d.mine && !d.myVerdict).length), () => {})
  }, [session?.user?.id, route.join('/')])

  if (!session) return <div class="boot" />
  const screen = route[0] ?? 'ucivo'
  const signedIn = (user: Me) => { setSession({ ...session, user }); if (screen === 'pozvanka') go('/', true) }

  if (screen === 'pozvanka') return <><Invite onDone={signedIn} /><Toasts /></>
  const user = session.user
  if (!user && (screen === 'prihlaseni' || !PUBLIC.includes(screen))) return <><Login onDone={signedIn} /><Toasts /></>
  if (user && screen === 'prihlaseni') return <div class="boot" />
  if (user && screen === 'navrh' && route[1]) return <><Editor id={route[1]} me={user} /><Toasts /></>

  const logout = async () => { await post('/api/auth/logout').catch(() => {}); setSession({ ...session, user: null }); go('/', true) }
  const link = (href: string, label: string, icon: preact.JSX.Element, on: boolean) => (
    <a href={href} onClick={nav(href)} class={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>{icon}<span>{label}</span></a>
  )
  return (
    <div class="shell">
      <header class="top">
        <a class="brand" href="/" onClick={nav('/')}><b>šprtám</b><span>moderace</span></a>
        <nav class="tabs">
          {link('/', 'Učivo', <I.book />, screen === 'ucivo')}
          {user && link('/kontrola', waiting ? `Ke kontrole · ${waiting}` : 'Ke kontrole', <I.check />, screen === 'kontrola')}
          {user && link('/navrhy', 'Moje návrhy', <I.inbox />, screen === 'navrhy')}
          {user && link('/pomucky', 'Pomůcky', <I.bulb />, screen === 'pomucky')}
          {user?.role === 'admin' && link('/vydani', 'Vydání', <I.layers />, screen === 'vydani')}
          {user?.role === 'admin' && link('/uzivatele', 'Moderátoři', <I.users />, screen === 'uzivatele')}
        </nav>
        <div class="who">
          {user ? <>
            {link('/ucet', user.name, <I.user />, screen === 'ucet')}
            <button class="icon" onClick={logout} title="Odhlásit se" aria-label="Odhlásit se"><I.logout /></button>
          </> : (
            <a href={`/prihlaseni?dalsi=${encodeURIComponent(location.pathname)}`} onClick={nav(`/prihlaseni?dalsi=${encodeURIComponent(location.pathname)}`)} title="Přihlášení pro moderátory"><I.key /><span>Přihlásit se</span></a>
          )}
        </div>
      </header>
      <main class="main">
        {screen === 'ucivo' && (route[3]
          ? <TopicView key={route.slice(1, 4).join('/')} g={route[1]} s={route[2]} id={route[3]} me={user} />
          : <Library g={route[1]} s={route[2]} me={user} />)}
        {user && screen === 'navrhy' && <Drafts me={user} />}
        {user && screen === 'kontrola' && (route[1] ? <Review key={route[1]} id={route[1]} me={user} /> : <ReviewQueue />)}
        {user && screen === 'historie' && route[3] && <History key={route.slice(1, 4).join('/')} g={route[1]} s={route[2]} id={route[3]} me={user} />}
        {user && screen === 'pomucky' && <Requests me={user} />}
        {user?.role === 'admin' && screen === 'vydani' && <Releases />}
        {user?.role === 'admin' && screen === 'uzivatele' && <Users me={user} />}
        {user && screen === 'ucet' && <Account me={user} onLogout={logout} />}
        {!SCREENS.includes(screen) && <div class="empty-state">Tahle stránka neexistuje. <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>}
      </main>
      <Toasts />
    </div>
  )
}
