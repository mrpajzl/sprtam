import { useEffect, useState } from 'preact/hooks'
import type { WidgetDef } from './kit'
import type { WidgetRef } from '.'

// The app shows widgets through these, not through the registry (index.tsx): each widget's code is its own
// chunk, loaded when a topic uses it, so the dozens of widgets do not weigh down the first load. The service
// worker precaches every chunk, so they work offline too. The gallery, checks, server and moderation use the
// registry with everything at once.

const modules = import.meta.glob<{ default: WidgetDef }>(['./*.tsx', '!./index.tsx', '!./kit.tsx', '!./view.tsx'])
const loaded = new Map<string, WidgetDef>()
const loading = new Map<string, Promise<WidgetDef | undefined>>()

function load(name: string): Promise<WidgetDef | undefined> {
  const m = modules[`./${name}.tsx`]
  if (!m) return Promise.resolve(undefined)
  if (!loading.has(name)) loading.set(name, m().then((x) => { loaded.set(name, x.default); return x.default }, () => { loading.delete(name); return undefined }))
  return loading.get(name)!
}

function useWidget(name: string): WidgetDef | undefined {
  const [def, setDef] = useState(() => loaded.get(name))
  useEffect(() => {
    if (def?.name === name) return
    let on = true
    load(name).then((d) => { if (on) setDef(d) })
    return () => { on = false }
  }, [name])
  return def?.name === name ? def : undefined
}

export function WidgetView({ w }: { w: WidgetRef }) {
  const def = useWidget(w.widget)
  const C = def?.Component
  return C ? <C {...w.props} /> : <div class="w w-loading" aria-busy="true" />
}

/** The widget's task above a quiz question (never shows the answer). */
export function WidgetQuestion({ w }: { w: WidgetRef }) {
  const def = useWidget(w.widget)
  const C = def?.Question
  return C ? <C {...w.props} /> : def ? null : <div class="w w-loading" aria-busy="true" />
}
