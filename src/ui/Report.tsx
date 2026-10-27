import { useEffect, useRef, useState } from 'preact/hooks'
import { manifest } from '../content/remote'
import { IClose, IFlag } from './icons'

// „Nahlásit chybu“ under a question or an explanation. The report goes to sprtam.cz (POST /api/report), which passes
// it on to the moderators (docs/SOUKROMI.md): only the topic, which question or explanation, the reason and the note.
// No progress, no device or person.

export type ReportTarget = { kind: 'question' | 'explanation'; index: number; text: string }

const REASONS = [
  ['wrong', 'Špatná odpověď nebo chyba ve faktech'],
  ['unclear', 'Nejasné zadání'],
  ['typo', 'Překlep'],
  ['other', 'Něco jiného'],
] as const
type Reason = (typeof REASONS)[number][0]

export const NOTE_MAX = 500

export async function sendReport(topic: string, target: ReportTarget, reason: Reason, note: string): Promise<void> {
  let res: Response
  try {
    res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, target: { ...target, text: target.text.slice(0, 1000) }, reason, note: note.trim().slice(0, NOTE_MAX), release: manifest().release }),
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

function ReportDialog({ topic, target, onClose }: { topic: string; target: ReportTarget; onClose: () => void }) {
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
    try { await sendReport(topic, target, reason, note); setState('sent') } catch (x) { setErr((x as Error).message); setState('edit') }
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
