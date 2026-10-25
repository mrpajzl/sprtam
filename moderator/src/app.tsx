import { useEffect, useState } from 'preact/hooks'
import { get, onSignedOut, post } from './api'
import type { Me } from './passkey'
import { go, nav, useRoute } from './router'
import { Account } from './screens/Account'
import { Drafts } from './screens/Drafts'
import { Invite } from './screens/Invite'
import { Library } from './screens/Library'
import { Login } from './screens/Login'
import { Users } from './screens/Users'
import { Editor } from './editor/Editor'
import { I, Toasts } from './ui/kit'

// Screens: /ucivo[/<grade>[/<subject>]] library · /navrh/<id> editor · /navrhy drafts · /uzivatele admin · /ucet own
// account · /pozvanka#<token> invite · everything else needs a signed-in moderator.

export interface SessionInfo { user: Me | null; github: boolean }

export function App() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const route = useRoute()

  const load = () => get<SessionInfo>('/api/session').then(setSession, () => setSession({ user: null, github: false }))
  useEffect(() => { load() }, [])
  useEffect(() => onSignedOut(() => setSession((s) => ({ github: s?.github ?? false, user: null }))), [])

  if (!session) return <div class="boot" />
  const signedIn = (user: Me) => { setSession({ ...session, user }); if (route[0] === 'pozvanka' || route[0] === 'prihlaseni') go('/', true) }

  if (route[0] === 'pozvanka') return <><Invite onDone={signedIn} /><Toasts /></>
  if (!session.user) return <><Login onDone={signedIn} /><Toasts /></>

  const user = session.user
  const screen = route[0] ?? 'ucivo'
  if (screen === 'navrh' && route[1]) return <><Editor id={route[1]} me={user} github={session.github} /><Toasts /></>

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
          {link('/navrhy', 'Návrhy', <I.inbox />, screen === 'navrhy')}
          {user.role === 'admin' && link('/uzivatele', 'Moderátoři', <I.users />, screen === 'uzivatele')}
        </nav>
        <div class="who">
          {link('/ucet', user.name, <I.user />, screen === 'ucet')}
          <button class="icon" onClick={logout} title="Odhlásit se" aria-label="Odhlásit se"><I.logout /></button>
        </div>
      </header>
      <main class="main">
        {!session.github && <div class="banner warn"><I.warn />Moderace zatím není připojená ke GitHubu – návrhy se ukládají, ale odeslat ke schválení půjdou, až to správce nastaví.</div>}
        {screen === 'ucivo' && <Library g={route[1]} s={route[2]} me={user} />}
        {screen === 'navrhy' && <Drafts me={user} />}
        {screen === 'uzivatele' && user.role === 'admin' && <Users me={user} />}
        {screen === 'ucet' && <Account me={user} onLogout={logout} />}
        {!['ucivo', 'navrhy', 'uzivatele', 'ucet'].includes(screen) && <div class="empty-state">Tahle stránka neexistuje. <a href="/" onClick={nav('/')}>Zpět na učivo</a></div>}
      </main>
      <Toasts />
    </div>
  )
}
