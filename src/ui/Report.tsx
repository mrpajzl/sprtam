import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { QUOTE_MAX } from '../../server/report'
import { manifest } from '../content/remote'
import { IClose, IFlag } from './icons'

// „Nahlásit chybu“ under a question or an explanation, or next to words marked in one (SelectionReport). The report
// goes to sprtam.cz (POST /api/report), which passes it on to the moderators (docs/SOUKROMI.md): only the topic, which
// question or explanation, the reason, the note and the marked words. No progress, no device or person.

export type ReportTarget = { kind: 'question' | 'explanation'; index: number; text: string }

/** A question as a report target; generated questions (no index in the topic) cannot be reported. */
export const questionTarget = (x: { index?: number; q: { question: string } }): ReportTarget | undefined =>
  x.index === undefined ? undefined : { kind: 'question', index: x.index, text: x.q.question }

const REASONS = [
  ['wrong', 'Špatná odpověď nebo chyba ve faktech'],
  ['unclear', 'Nejasné zadání'],
  ['typo', 'Překlep'],
  ['other', 'Něco jiného'],
] as const
type Reason = (typeof REASONS)[number][0]

export const NOTE_MAX = 500

export async function sendReport(topic: string, target: ReportTarget, reason: Reason, note: string, quote = ''): Promise<void> {
  let res: Response
  try {
    res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, target: { ...target, text: target.text.slice(0, 1000) }, reason, note: note.trim().slice(0, NOTE_MAX), ...(quote && { quote }), release: manifest().release }),
    })
  } catch {
    throw new Error('Nejde se spojit se serverem. Zkus to, až budeš na internetu.')
  }
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Hlášení se nepovedlo odeslat. Zkus to později.')
}

/** A quiet link that opens the report form. */
export function ReportButton({ topic, target, label = 'Nahlásit chybu' }: { topic: string; target: ReportTarget; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" class="report-key" onClick={() => setOpen(true)} aria-haspopup="dialog"><IFlag />{label}</button>
      {open && <ReportDialog topic={topic} target={target} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportDialog({ topic, target, quote = '', onClose }: { topic: string; target: ReportTarget; quote?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [reason, setReason] = useState<Reason | null>(null)
  const [note, setNote] = useState('')
  const [state, setState] = useState<'edit' | 'sending' | 'sent'>('edit')
  const [err, setErr] = useState('')
  useEffect(() => { ref.current?.showModal() }, [])
  useEffect(() => {
    addEventListener('popstate', onClose)
    return () => removeEventListener('popstate', onClose)
  }, [])
  const close = () => ref.current?.close()
  const submit = async (e: Event) => {
    e.preventDefault()
    if (!reason || state !== 'edit') return
    setState('sending'); setErr('')
    try { await sendReport(topic, target, reason, note, quote); setState('sent') } catch (x) { setErr((x as Error).message); setState('edit') }
  }
  // Keys stay in the dialog: typing a note must not answer the question behind it or open search.
  return (
    <dialog ref={ref} class="report-sheet" aria-labelledby="report-title" onClose={onClose} onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div class="report-body">
        <button type="button" class="icon-btn report-x" onClick={close} aria-label="Zavřít"><IClose /></button>
        {state === 'sent' ? (
          <div class="report-done">
            <h2 id="report-title">Díky, předáno!</h2>
            <p class="muted">Moderátoři se na to podívají a opraví to. Opravu uvidíš v aplikaci sám, nic dalšího dělat nemusíš.</p>
            <button type="button" class="btn block" onClick={close} autoFocus>Hotovo</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="report-title">Nahlásit chybu</h2>
            <p class="report-what"><small>{target.kind === 'question' ? 'Otázka' : 'Vysvětlení'}</small>{target.text}</p>
            {quote && <p class="report-quote"><small>Označený text</small><mark>{quote}</mark></p>}
            <div class="report-reasons" role="radiogroup" aria-label="Co je špatně">
              {REASONS.map(([id, label]) => (
                <label key={id} class={`report-reason ${reason === id ? 'on' : ''}`}>
                  <input type="radio" name="reason" value={id} checked={reason === id} onChange={() => setReason(id)} />{label}
                </label>
              ))}
            </div>
            <label class="report-note">
              <span>Co přesně je špatně? <small>(nepovinné)</small></span>
              <textarea value={note} maxLength={NOTE_MAX} rows={3} onInput={(e) => setNote(e.currentTarget.value)} placeholder="Třeba: správně má být 12, protože…" />
              <small class="muted">Nepiš sem své jméno ani nic o sobě. Hlášení je anonymní.</small>
            </label>
            {err && <p class="report-err" role="alert">{err}</p>}
            <button type="submit" class="btn block" disabled={!reason || state === 'sending'}>{state === 'sending' ? 'Odesílám…' : 'Odeslat'}</button>
          </form>
        )}
      </div>
    </dialog>
  )
}

// ——— Reporting from a selection ———
// Marking words in a question or an explanation shows a small „Nahlásit chybu“ key under them. The browser's own
// menu (copy, share, look up) stays as it is: nothing is prevented, the key only appears next to it – below the
// marked words, because phones put their menu above. Content that can be reported this way is wrapped in
// <Reportable>; the explicit buttons stay for keyboards and screen readers.

type Found = { topic: string; target: ReportTarget; quote: string }

/** Marks its children as part of a question or an explanation, so words selected in them can be reported. */
export function Reportable({ topic, target, children }: { topic: string; target?: ReportTarget; children: ComponentChildren }) {
  if (!target) return <>{children}</>
  return <div class="reportable" data-report={JSON.stringify({ topic, target })}>{children}</div>
}

const asElement = (n: Node) => (n instanceof Element ? n : n.parentElement)

function selected(): { found: Found; first: DOMRect; last: DOMRect } | null {
  const sel = getSelection()
  // One range only: Firefox can hold several (Ctrl + drag), and its text could reach outside the question.
  if (!sel || sel.isCollapsed || sel.rangeCount !== 1) return null
  const quote = sel.toString().replace(/\s+/g, ' ').trim()
  if (!quote) return null
  const range = sel.getRangeAt(0)
  const box = asElement(range.startContainer)?.closest<HTMLElement>('[data-report]')
  // Both ends in the same question or explanation, and not text typed into an answer.
  if (!box || box !== asElement(range.endContainer)?.closest('[data-report]')) return null
  if (document.activeElement?.matches('input, textarea, [contenteditable]') || asElement(range.commonAncestorContainer)?.closest('dialog')) return null
  let at: Omit<Found, 'quote'>
  try { at = JSON.parse(box.dataset.report!) } catch { return null }
  const lines = [...range.getClientRects()].filter((r) => r.width > 0)
  if (!lines.length) return null
  return { found: { ...at, quote: quote.length > QUOTE_MAX ? `${quote.slice(0, QUOTE_MAX - 1)}…` : quote }, first: lines[0], last: lines.at(-1)! }
}

const KEY_H = 40, KEY_W = 160, EDGE = 8
// Below the words far enough to clear the selection handles (Android's hang ~22 px under the line).
const BELOW = 28, SIDE = 14
// Near the top there is no room for the browser's own menu above the words, so it goes below them: keep off that.
const MENU_ROOM = 96
const INTERACTIVE = 'button, a, input, textarea, select, label, summary, [role=button], [role=radio], [tabindex]:not([tabindex="-1"])'

/** Where the key goes (its centre x and top y), or null when every spot would cover something to tap. */
function spot(first: DOMRect, last: DOMRect): { x: number; y: number } | null {
  const fits = (x: number, y: number) => {
    const l = x - KEY_W / 2, r = x + KEY_W / 2
    if (l < EDGE || r > innerWidth - EDGE || y < EDGE || y + KEY_H > innerHeight - EDGE) return false
    // Never over an answer, „Dál“ or a link: a tap meant for them would land on the key.
    for (const [px, py] of [[l, y], [r, y], [l, y + KEY_H], [r, y + KEY_H], [x, y + KEY_H / 2]]) {
      for (const el of document.elementsFromPoint(px, py)) {
        if (el.closest('.sel-report')) continue
        if (el.closest(INTERACTIVE)) return false
        break
      }
    }
    return true
  }
  const clampX = (x: number) => Math.min(Math.max(x, EDGE + KEY_W / 2), innerWidth - EDGE - KEY_W / 2)
  const below = { x: clampX(last.left + last.width / 2), y: last.bottom + BELOW }
  const after = { x: last.right + SIDE + KEY_W / 2, y: last.top + last.height / 2 - KEY_H / 2 }
  const before = { x: first.left - SIDE - KEY_W / 2, y: first.top + first.height / 2 - KEY_H / 2 }
  const above = { x: clampX(first.left + first.width / 2), y: first.top - BELOW - KEY_H }
  const order = first.top < MENU_ROOM ? [after, before, below, above] : [below, after, before, above]
  return order.find((p) => fits(p.x, p.y)) ?? null
}

/** The key under a selection; mounted once next to the app. */
export function SelectionReport() {
  const [key, setKey] = useState<{ found: Found; x: number; y: number } | null>(null)
  const [open, setOpen] = useState<Found | null>(null)
  useEffect(() => {
    // A mouse drag shows the key once the button is released; on touch screens the selection settles without
    // reliable pointer events (a long press ends in pointercancel or nothing), so only the pause counts there.
    let dragging = false, pressing = false, shown = false, timer = 0, frame = 0
    const show = (k: { found: Found; x: number; y: number } | null) => { shown = !!k; setKey(k) }
    const place = () => {
      const s = selected()
      if (!s) return show(null)
      const at = spot(s.first, s.last)
      show(at && { found: s.found, ...at })
    }
    const later = (ms: number) => { clearTimeout(timer); timer = window.setTimeout(() => { if (!dragging) place() }, ms) }
    const onSelection = () => {
      const sel = getSelection()
      // A tap on the key itself may clear the selection on a phone before the click arrives: keep the key.
      if (!sel || sel.isCollapsed) { clearTimeout(timer); return pressing || show(null) }
      if (shown && !pressing) show(null) // the handles are moving: out of their way until they stop
      later(350) // phones move the handles a while; wait until they settle
    }
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest?.('.sel-report')) { pressing = true; return }
      // A mouse press starts a new selection or ends this one. A finger may only be scrolling: the key follows,
      // and a tap elsewhere clears the selection, which hides it.
      if (e.pointerType === 'mouse' && e.button === 0) { dragging = true; if (shown) show(null) }
    }
    // A press on a scrollbar may never send pointerup: the first move without a button ends the drag.
    const onHover = (e: PointerEvent) => { if (dragging && e.pointerType === 'mouse' && !e.buttons) { dragging = false; later(60) } }
    const onUp = () => {
      if (pressing) setTimeout(() => { pressing = false; if (!getSelection()?.toString()) show(null) }, 400)
      if (dragging) { dragging = false; later(60) }
    }
    const onMove = () => { if (!shown) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(place) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && shown) show(null) }
    document.addEventListener('selectionchange', onSelection)
    addEventListener('pointerdown', onDown, true)
    addEventListener('pointerup', onUp, true)
    addEventListener('pointercancel', onUp, true)
    addEventListener('pointermove', onHover, { capture: true, passive: true })
    addEventListener('scroll', onMove, { capture: true, passive: true })
    addEventListener('resize', onMove)
    addEventListener('keydown', onKey)
    const onNav = () => show(null)
    addEventListener('popstate', onNav)
    return () => {
      clearTimeout(timer); cancelAnimationFrame(frame)
      document.removeEventListener('selectionchange', onSelection)
      removeEventListener('pointerdown', onDown, true)
      removeEventListener('pointerup', onUp, true)
      removeEventListener('pointercancel', onUp, true)
      removeEventListener('pointermove', onHover, { capture: true })
      removeEventListener('scroll', onMove, { capture: true })
      removeEventListener('resize', onMove)
      removeEventListener('keydown', onKey)
      removeEventListener('popstate', onNav)
    }
  }, [])
  return (
    <>
      {key && !open && (
        // Pressing the key must not clear the selection before the click (desktop browsers do that on mousedown).
        <button type="button" class="sel-report" style={{ left: `${key.x}px`, top: `${key.y}px` }} aria-haspopup="dialog"
          onMouseDown={(e) => e.preventDefault()} onPointerDown={(e) => e.preventDefault()}
          onClick={() => { setOpen(key.found); setKey(null); getSelection()?.removeAllRanges() }}>
          <IFlag />Nahlásit chybu
        </button>
      )}
      {open && <ReportDialog topic={open.topic} target={open.target} quote={open.quote} onClose={() => setOpen(null)} />}
    </>
  )
}
