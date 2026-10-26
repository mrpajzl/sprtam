import type { AnchorHTMLAttributes } from 'preact'
import { useEffect, useState } from 'preact/hooks'

// Path routing (History API): every screen has a real, shareable URL that the server
// answers with a prerendered page (server/pages.ts).
// Two routes stay in the #fragment on purpose, because the fragment is never sent to a server:
// `#/p/<code>` (progress code), `#/spojit/<offer>` (device pairing) and `#/presun/<code>` (progress
// carried over from the old domain, public/move.js).

const PRIVATE = /^#\/(p|spojit|presun)\//

const parse = (path: string) => path.split('?')[0].split('/').filter(Boolean).map((x) => { try { return decodeURIComponent(x) } catch { return x } })

function read(): string[] {
  if (PRIVATE.test(location.hash)) return parse(location.hash.slice(1))
  return parse(location.pathname)
}

// Old links used hash routing (`/#/g/z5`): move them to the real path (on load and when one is followed later).
function fromLegacyHash() {
  if (location.hash.startsWith('#/') && !PRIVATE.test(location.hash)) history.replaceState(history.state, '', location.hash.slice(1) || '/')
}
fromLegacyHash()
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

interface State { i: number; y?: number }
const state = (): State => (history.state as State | null) ?? { i: 0 }
const NAV = 'sprtam:navigate'

// The path of every in-app history entry (index = State.i), so `jump` can return to a screen
// that is already behind us instead of stacking a new copy on top of it.
const TRAIL = 'sprtam:trail'
const here = () => location.pathname + location.search
function trail(): string[] {
  try { return JSON.parse(sessionStorage.getItem(TRAIL) ?? '[]') } catch { return [] }
}
function mark(cut = false) {
  const { i } = state()
  const t = cut ? trail().slice(0, i) : trail()
  t[i] = here()
  try { sessionStorage.setItem(TRAIL, JSON.stringify(t)) } catch { /* private mode: plain navigation */ }
}
// A fresh entry (no state yet) starts a new trail; a reload keeps it.
mark(history.state === null)

export function useRoute(): string[] {
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const on = (e: Event) => {
      fromLegacyHash()
      if (e.type !== NAV) mark()
      setParts(read())
      // Back/forward: return to where the user was once the screen has rendered.
      const y = e.type === 'popstate' ? state().y ?? 0 : 0
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)))
    }
    addEventListener('popstate', on)
    addEventListener('hashchange', on)
    addEventListener(NAV, on)
    return () => { removeEventListener('popstate', on); removeEventListener('hashchange', on); removeEventListener(NAV, on) }
  }, [])
  return parts
}

export function go(path: string, replace = false) {
  if (path === location.pathname + location.search && !location.hash) return
  const s = state()
  if (replace) history.replaceState({ i: s.i }, '', path)
  else {
    history.replaceState({ ...s, y: scrollY }, '')
    history.pushState({ i: s.i + 1 }, '', path)
  }
  mark(!replace)
  dispatchEvent(new Event(NAV))
}

const pathOf = (p: string) => p.split(/[?#]/)[0].replace(/(.)\/$/, '$1')

/** Go to a main screen: back through history when it is already behind us (like a native tab bar), otherwise forward. */
export function jump(path: string) {
  const want = pathOf(path)
  if (pathOf(location.pathname) === want && !location.hash) return scrollTo({ top: 0, behavior: 'smooth' })
  const { i } = state()
  const t = trail()
  for (let j = i - 1; j >= 0; j--) if (t[j] && pathOf(t[j]) === want) return history.go(j - i)
  go(path)
}

/** Back within the app; a page opened directly from a link goes one level up instead of leaving the app. */
export function back(fallback?: unknown) {
  if (state().i > 0) return history.back()
  const up = location.pathname.replace(/\/[^/]*\/?$/, '')
  go(typeof fallback === 'string' ? fallback : up === '/g' ? '/' : up || '/', true)
}

export const query = () => new URLSearchParams(location.search)

/** Rewrite the current URL without navigating (e.g. the search query). */
export const setQuery = (qs: URLSearchParams) => history.replaceState(history.state, '', `${location.pathname}${qs.size ? `?${qs}` : ''}`)

/** A real link (crawlable, opens in a new tab with ⌘/Ctrl), handled in-app on a plain click. */
export function Link({ href, onClick, jump: j, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; jump?: boolean }) {
  return (
    <a href={href} {...rest} onClick={(e) => {
      onClick?.(e)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (j) jump(href)
      else go(href)
    }} />
  )
}
