import { useEffect, useState } from 'preact/hooks'

// Hash routing: works on any static host and keeps everything client-side.
export function useRoute(): string[] {
  const read = () => location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean).map(decodeURIComponent)
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const on = () => { setParts(read()); window.scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return parts
}

export const go = (path: string) => { location.hash = path }
export const back = () => { history.length > 1 ? history.back() : go('/') }
export const query = () => new URLSearchParams(location.hash.split('?')[1] ?? '')
