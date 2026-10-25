import { useEffect, useState } from 'preact/hooks'

// Path routing for the editor's screens (the server answers every path without a file extension with the app).

const EVENT = 'moderace:navigate'

export function useRoute(): string[] {
  const read = () => location.pathname.split('/').filter(Boolean).map(decodeURIComponent)
  const [parts, set] = useState(read)
  useEffect(() => {
    const on = () => set(read())
    addEventListener('popstate', on)
    addEventListener(EVENT, on)
    return () => { removeEventListener('popstate', on); removeEventListener(EVENT, on) }
  }, [])
  return parts
}

export function go(path: string, replace = false) {
  if (path === location.pathname + location.search) return
  if (replace) history.replaceState(null, '', path)
  else history.pushState(null, '', path)
  scrollTo(0, 0)
  dispatchEvent(new Event(EVENT))
}

/** A real link that navigates inside the app on a plain click. */
export const nav = (href: string) => (e: MouseEvent) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  go(href)
}
