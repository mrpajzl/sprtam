import { useEffect, useState } from 'preact/hooks'
import { get, onSignedOut, post } from './api'
import type { Me } from './passkey'
import { go, nav, useRoute } from './router'
import { Account } from './screens/Account'
import { Drafts } from './screens/Drafts'
import { Invite } from './screens/Invite'
import { Library } from './screens/Library'
import { Login } from './screens/Login'
import { TopicView } from './screens/Topic'
import { Users } from './screens/Users'
import { Editor } from './editor/Editor'
import { refreshIndex } from './store'
import { I, Toasts } from './ui/kit'

// Screens: /ucivo[/<grade>[/<subject>[/<topic>]]] library and a topic read only – open to everyone · /navrh/<id> editor ·
// /navrhy drafts · /uzivatele admin · /ucet own account · /prihlaseni[?dalsi=<path>] sign-in · /pozvanka#<token> invite.
// Everything except the library needs a signed-in moderator.

const PUBLIC = ['ucivo']

/** Where to go after signing in: only a path of this app, never another site. */
const nextPath = () => { const p = new URLSearchParams(location.search).get('dalsi') ?? '/'; return /^\/(?![/\\])/.test(p) ? p : '/' }

export interface SessionInfo { user: Me | null; github: boolean }

export function App() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const route = useRoute()

  const load = () => get<SessionInfo>('/api/session').then(setSession, () => setSession({ user: null, github: false }))
  useEffect(() => { load() }, [])
  // Signed in on /prihlaseni (just now or already before): back to where the visitor came from.
  useEffect(() => { if (session?.user && route[0] === 'prihlaseni') go(nextPath(), true) }, [session?.user, route[0]])
  // Who is editing what is only sent to moderators: reload the catalogue when that changes.
  useEffect(() => refreshIndex(), [session?.user?.id])
  useEffect(() => onSignedOut(() => setSession((s) => ({ github: s?.github ?? false, user: null }))), [])

  if (!session) return <div class="boot" />
  const screen = route[0] ?? 'ucivo'
  const signedIn = (user: Me) => { setSession({ ...session, user }); if (screen === 'pozvanka') go('/', true) }

  if (screen === 'pozvanka') return <><Invite onDone={signedIn} /><Toasts /></>
  const user = session.user
  if (!user && (screen === 'prihlaseni' || !PUBLIC.includes(screen))) return <><Login onDone={signedIn} /><Toasts /></>
  if (user && screen === 'prihlaseni') return <div class="boot" />
  if (user && screen === 'navrh' && route[1]) return <><Editor id={route[1]} me={user} github={session.github} /><Toasts /></>

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
          {user && link('/navrhy', 'Návrhy', <I.inbox />, screen === 'navrhy')}
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
        {user && !session.github && <div class="banner warn"><I.warn />Moderace zatím není připojená ke GitHubu – návrhy se ukládají, ale odeslat ke schválení půjdou, až to správce nastaví.</div>}
        {screen === 'ucivo' && (route[3]
          ? <TopicView key={route.slice(1, 4).join('/')} g={route[1]} s={route[2]} id={route[3]} me={user} />
          : <Library g={route[1]} s={route[2]} me={user} />)}
        {user && screen === 'navrhy' && <Drafts me={user} />}
        {user?.role === 'admin' && screen === 'uzivatele' && <Users me={user} />}
        {user && screen === 'ucet' && <Account me={user} onLogout={logout} />}
        {!['ucivo', 'navrhy', 'uzivatele', 'ucet'].includes(screen) && <div class="empty-state">Tahle stránka neexistuje. <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>}
      </main>
      <Toasts />
    </div>
  )
}
