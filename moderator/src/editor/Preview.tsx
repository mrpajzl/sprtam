import { useEffect, useRef, useState } from 'preact/hooks'
import type { GradeId, SubjectId, TopicFile } from '../../../src/content/types'
import type { PreviewMode, PreviewState, ToEditor, ToPreview } from '../preview/protocol'
import { I } from '../ui/kit'

// The phone on the right: an iframe with the app's own components (moderator/src/preview), fed the
// current topic on every change.

export function Preview({ topic, grade, subject, approaches, mode, onMode }: {
  topic: TopicFile; grade: GradeId; subject: SubjectId; approaches: PreviewState['approaches']; mode: PreviewMode; onMode: (m: PreviewMode) => void
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('moderace-preview-theme') === 'dark' ? 'dark' : 'light'))
  const onModeRef = useRef(onMode)
  onModeRef.current = onMode

  useEffect(() => {
    const on = (e: MessageEvent<ToEditor>) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.type === 'ready') setReady(true)
      if (e.data?.type === 'mode') onModeRef.current(e.data.mode)
    }
    addEventListener('message', on)
    return () => removeEventListener('message', on)
  }, [])

  useEffect(() => {
    if (!ready) return
    // Coalesce fast typing into one redraw per frame.
    const t = requestAnimationFrame(() => {
      const msg: ToPreview = { type: 'state', state: { topic, grade, subject, approaches, mode, theme } }
      frame.current?.contentWindow?.postMessage(msg, location.origin)
    })
    return () => cancelAnimationFrame(t)
  }, [ready, topic, grade, subject, mode, theme])

  const qs = topic.questions.length
  return (
    <div class="preview">
      <div class="pv-bar">
        <div class="seg-pick small">
          <button class={mode.kind === 'topic' ? 'on' : ''} onClick={() => onMode({ kind: 'topic', ex: mode.kind === 'topic' ? mode.ex : 0 })}>Výklad</button>
          <button class={mode.kind === 'quiz' ? 'on' : ''} onClick={() => onMode({ kind: 'quiz', q: mode.kind === 'quiz' ? mode.q : 0 })}>Otázky</button>
        </div>
        {mode.kind === 'quiz' && qs > 0 && (
          <div class="pv-nav">
            <button class="icon s" disabled={mode.q <= 0} onClick={() => onMode({ kind: 'quiz', q: mode.q - 1 })} aria-label="Předchozí otázka"><I.left /></button>
            <span>{Math.min(mode.q, qs - 1) + 1}/{qs}</span>
            <button class="icon s" disabled={mode.q >= qs - 1} onClick={() => onMode({ kind: 'quiz', q: mode.q + 1 })} aria-label="Další otázka"><I.right /></button>
          </div>
        )}
        <button class="icon s" onClick={() => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); localStorage.setItem('moderace-preview-theme', t) }}
          title={theme === 'dark' ? 'Světlý vzhled' : 'Tmavý vzhled'} aria-label="Přepnout světlý a tmavý vzhled">{theme === 'dark' ? <I.sun /> : <I.moon />}</button>
      </div>
      <div class="phone">
        <iframe ref={frame} src="/preview.html" title="Náhled v aplikaci" />
      </div>
      <p class="pv-note">Takhle to uvidí děti. Všechno je klikací – vyzkoušej pomůcky i otázky.</p>
    </div>
  )
}
