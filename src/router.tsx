import type { AnchorHTMLAttributes } from 'preact'
import { useEffect, useState } from 'preact/hooks'

// Path routing (History API): every screen has a real, shareable URL that the server
// answers with a prerendered page (see plugins/prerender.ts).
// Two routes stay in the #fragment on purpose, because the fragment is never sent to a server:
// `#/p/<code>` (progress code) and `#/spojit/<offer>` (device pairing).

const PRIVATE = /^#\/(p|spojit)\//

const parse = (path: string) => path.split('?')[0].split('/').filter(Boolean).map((x) => { try { return decodeURIComponent(x) } catch { return x } })

function read(): string[] {
  if (PRIVATE.test(location.hash)) return parse(location.hash.slice(1))
  return parse(location.pathname)
}

// Old links used hash routing (`/#/g/z5`): move them to the real path.
if (location.hash.startsWith('#/') && !PRIVATE.test(location.hash)) {
  history.replaceState(history.state, '', location.hash.slice(1) || '/')
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

interface State { i: number; y?: number }
const state = (): State => (history.state as State | null) ?? { i: 0 }
const NAV = 'sprtam:navigate'

export function useRoute(): string[] {
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const on = (e: Event) => {
      setParts(read())
      // Back/forward: return to where the user was once the screen has rendered.
      const y = e.type === 'popstate' ? state().y ?? 0 : 0
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)))
    }
    addEventListener('popstate', on)
    addEventListener(NAV, on)
    return () => { removeEventListener('popstate', on); removeEventListener(NAV, on) }
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
  dispatchEvent(new Event(NAV))
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
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} {...rest} onClick={(e) => {
      onClick?.(e)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      go(href)
    }} />
  )
}
