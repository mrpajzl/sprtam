import { useEffect, useState } from 'preact/hooks'
import { api, get, post } from '../api'
import { I } from './kit'

// Saved replies (moderator/server/work.ts): texts one keeps writing – why a report is dismissed, what to change in a
// draft – inserted with a click. Each moderator has their own.

export type ReplyKind = 'report' | 'review'
interface Reply { id: string; text: string }

/** The saved replies above a text field, and a tick to keep the current text as one. */
export function SavedReplies({ kind, text, setText, keep, setKeep }: { kind: ReplyKind; text: string; setText: (t: string) => void; keep: boolean; setKeep: (v: boolean) => void }) {
  const [list, setList] = useState<Reply[]>([])
  useEffect(() => { get<Reply[]>(`/api/me/replies?kind=${kind}`).then(setList, () => {}) }, [kind])
  const remove = async (r: Reply) => { await api('DELETE', `/api/me/replies/${r.id}`).catch(() => {}); setList((l) => l.filter((x) => x.id !== r.id)) }
  const saved = list.some((r) => r.text === text.trim())
  return (
    <div class="replies">
      {list.length > 0 && (
        <div class="reply-chips" aria-label="Uložené odpovědi">
          {list.map((r) => (
            <span key={r.id} class={`reply-chip ${r.text === text.trim() ? 'on' : ''}`}>
              <button type="button" onClick={() => setText(r.text)} title={r.text}>{r.text.length > 48 ? `${r.text.slice(0, 47)}…` : r.text}</button>
              <button type="button" class="x" onClick={() => remove(r)} aria-label={`Smazat uloženou odpověď: ${r.text.slice(0, 40)}`}><I.close /></button>
            </span>
          ))}
        </div>
      )}
      {text.trim() && !saved && <label class="toggle fine"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.currentTarget.checked)} />Uložit tenhle text jako odpověď pro příště</label>}
    </div>
  )
}

/** Keeps a text as a saved reply (after sending it, when asked to). */
export const saveReply = (kind: ReplyKind, text: string) => post('/api/me/replies', { kind, text }).catch(() => {})
