import { useEffect, useState } from 'preact/hooks'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): T | undefined | null {
  const [v, setV] = useState<T | undefined | null>(undefined)
  useEffect(() => {
    let live = true
    setV(undefined)
    fn().then((x) => live && setV(x), () => live && setV(null))
    return () => { live = false }
  }, deps)
  return v
}
