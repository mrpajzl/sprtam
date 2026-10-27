import type { ComponentChildren, JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import type { TopicFile } from '../../../src/content/types'
import { TextDiff } from '../diff/Diff'
import { getIn } from '../editor/model'
import type { Me } from '../passkey'
import type { DraftView, ReviewView } from '../store'
import { ago, Busy, dateTime, I } from '../ui/kit'

// The conversation about a change (docs/MODERACE.md): threads of messages at a block, a question or the whole
// change, replies, light formatting (Markdown-like, rendered without HTML) and suggested wording of one text field
// that the author takes over with a click.

// ——— Formatting ———

const INLINE_SRC = /\*\*(.+?)\*\*|~~(.+?)~~|`([^`]+)`|\*([^*\s][^*]*?)\*|(?<!\w)_([^_\s][^_]*?)_(?!\w)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?"'])/g

function inline(text: string): ComponentChildren {
  const out: (string | JSX.Element)[] = []
  // A fresh expression per call: the parts are formatted recursively.
  const re = new RegExp(INLINE_SRC.source, 'g')
  let last = 0, i = 0, m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = i++
    if (m[1]) out.push(<strong key={k}>{inline(m[1])}</strong>)
    else if (m[2]) out.push(<s key={k}>{inline(m[2])}</s>)
    else if (m[3]) out.push(<code key={k}>{m[3]}</code>)
    else if (m[4] || m[5]) out.push(<em key={k}>{inline(m[4] || m[5])}</em>)
    else out.push(<a key={k} href={m[7] ?? m[8]} target="_blank" rel="noopener noreferrer nofollow">{m[6] ?? m[8]}</a>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const withBreaks = (lines: string[]) => lines.flatMap((l, i) => (i ? [<br key={`b${i}`} />, inline(l)] : [inline(l)]))

/** **tučně**, *kurzíva*, ~~škrtnuté~~, `kód`, odkazy, odrážky (- / 1.), citace (>) a bloky kódu (```). */
export function Rich({ text }: { text: string }) {
  const lines = text.split('\n')
  const out: JSX.Element[] = []
  let i = 0
  const take = (re: RegExp) => { const got: string[] = []; while (i < lines.length && re.test(lines[i])) got.push(lines[i++].replace(re, '')); return got }
  while (i < lines.length) {
    const l = lines[i], k = out.length
    if (!l.trim()) { i++; continue }
    if (l.startsWith('```')) {
      i++
      const code: string[] = []
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      i++
      out.push(<pre key={k}><code>{code.join('\n')}</code></pre>)
    } else if (/^>\s?/.test(l)) out.push(<blockquote key={k}>{withBreaks(take(/^>\s?/))}</blockquote>)
    else if (/^\s*[-*•]\s+/.test(l)) out.push(<ul key={k}>{take(/^\s*[-*•]\s+/).map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>)
    else if (/^\s*\d+[.)]\s+/.test(l)) {
      const start = Number(/\d+/.exec(l)![0])
      out.push(<ol key={k} start={start}>{take(/^\s*\d+[.)]\s+/).map((x, j) => <li key={j}>{inline(x)}</li>)}</ol>)
    } else {
      const para: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(```|>|\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(lines[i])) para.push(lines[i++])
      out.push(<p key={k}>{withBreaks(para)}</p>)
    }
  }
  return <div class="rich">{out}</div>
}

// ——— Text fields of one block or question (what a suggestion can change) ———

const FIELD: Record<string, string> = {
  text: 'Text', term: 'Pojem', definition: 'Význam', example: 'Příklad', wrong: 'Špatně', right: 'Správně', why: 'Proč',
  question: 'Zadání', answer: 'Odpověď', explanation: 'Vysvětlení', caption: 'Popisek', items: 'Položka', options: 'Možnost',
  answers: 'Správná odpověď', hints: 'Nápověda', head: 'Záhlaví', rows: 'Řádek', pairs: 'Dvojice',
}
const SKIP = new Set(['type', 'widget', 'props'])

export interface Field { path: string; label: string }

/** Every text of the item at `anchor` with its path, in reading order ("explanations[0].blocks[2].text"). */
export function fieldsAt(topic: TopicFile, anchor: string): Field[] {
  const item = getIn(topic, [...anchor.matchAll(/([a-z]+)|\[(\d+)\]/gi)].map((m) => (m[1] ? m[1] : Number(m[2]))))
  const out: Field[] = []
  const walk = (v: unknown, path: string, label: string) => {
    if (typeof v === 'string') out.push({ path, label })
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, `${label} ${i + 1}`))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, `${path}.${k}`, label ? `${label} · ${FIELD[k] ?? k}` : FIELD[k] ?? k)
  }
  if (item && typeof item === 'object') for (const [k, x] of Object.entries(item)) if (!SKIP.has(k) && (k !== 'items' || (item as { type?: string }).type !== 'picture')) walk(x, `${anchor}.${k}`, FIELD[k] ?? k)
  return out
}

const textAt = (topic: TopicFile, path: string) => {
  const v = getIn(topic, [...path.matchAll(/([a-z]+)|\[(\d+)\]/gi)].map((m) => (m[1] ? m[1] : Number(m[2]))))
  return typeof v === 'string' ? v : undefined
}

// ——— Writing ———

export interface Outgoing { body: string; parent?: number; suggestion?: { path: string; text: string } }

function surround(el: HTMLTextAreaElement, set: (v: string) => void, before: string, after = before, placeholder = '') {
  const s = el.selectionStart, e = el.selectionEnd
  const sel = el.value.slice(s, e) || placeholder
  set(el.value.slice(0, s) + before + sel + after + el.value.slice(e))
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length) })
}

/** Puts `prefix` in front of every selected line (or the current one). */
function prefixLines(el: HTMLTextAreaElement, set: (v: string) => void, prefix: (i: number) => string) {
  const v = el.value
  const s = v.lastIndexOf('\n', el.selectionStart - 1) + 1
  const e = v.indexOf('\n', el.selectionEnd) === -1 ? v.length : v.indexOf('\n', el.selectionEnd)
  const block = v.slice(s, e).split('\n').map((l, i) => prefix(i) + l).join('\n')
  set(v.slice(0, s) + block + v.slice(e))
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + block.length, s + block.length) })
}

export function Composer({ initial = '', placeholder, fields, topic, initialSuggestion, sendLabel, busy, onSend, onCancel, autoFocus }: {
  initial?: string; placeholder: string; fields?: Field[]; topic?: TopicFile; initialSuggestion?: { path: string; text: string }
  sendLabel: string; busy: boolean; onSend: (m: Outgoing) => void; onCancel?: () => void; autoFocus?: boolean
}) {
  const [text, setText] = useState(initial)
  const [sg, setSg] = useState<{ path: string; text: string } | null>(initialSuggestion ?? null)
  const [preview, setPreview] = useState(false)
  const ta = useRef<HTMLTextAreaElement>(null)
  const canSend = !!text.trim() || (!!sg && !!topic && sg.text !== textAt(topic, sg.path))
  const send = () => { if (canSend && !busy) onSend({ body: text.trim(), ...(sg ? { suggestion: sg } : {}) }) }
  const tool = (label: ComponentChildren, title: string, f: (el: HTMLTextAreaElement) => void) => (
    <button type="button" class="fmt" title={title} aria-label={title} disabled={preview} onMouseDown={(e) => e.preventDefault()} onClick={() => ta.current && f(ta.current)}>{label}</button>
  )
  const startSuggestion = (path: string) => topic && setSg({ path, text: textAt(topic, path) ?? '' })
  const editingSuggestion = !!initialSuggestion
  return (
    <div class="c-write">
      {sg && topic && (
        <div class="c-suggest">
          <div class="c-suggest-head">
            <b><I.bulb />Návrh textu</b>
            {fields && fields.length > 1 && !editingSuggestion
              ? <select value={sg.path} onChange={(e) => startSuggestion(e.currentTarget.value)} aria-label="Co navrhuješ změnit">{fields.map((f) => <option key={f.path} value={f.path}>{f.label}</option>)}</select>
              : <span>{fields?.find((f) => f.path === sg.path)?.label}</span>}
            {!editingSuggestion && <button type="button" class="icon s" title="Zrušit návrh textu" aria-label="Zrušit návrh textu" onClick={() => setSg(null)}><I.close /></button>}
          </div>
          <textarea rows={3} value={sg.text} onInput={(e) => setSg({ ...sg, text: e.currentTarget.value })} maxLength={4000} aria-label="Navržený text" />
          {sg.text !== textAt(topic, sg.path) && <div class="c-suggest-diff"><TextDiff a={textAt(topic, sg.path) ?? ''} b={sg.text} /></div>}
        </div>
      )}
      <div class="c-tools" role="toolbar" aria-label="Formátování zprávy">
        {tool(<I.bold />, 'Tučně (**text**)', (el) => surround(el, setText, '**', '**', 'tučně'))}
        {tool(<I.italic />, 'Kurzíva (*text*)', (el) => surround(el, setText, '*', '*', 'kurzíva'))}
        {tool(<s>S</s>, 'Přeškrtnout (~~text~~)', (el) => surround(el, setText, '~~', '~~', 'škrtnuté'))}
        {tool(<span class="code">x+1</span>, 'Kód nebo vzorec (`text`)', (el) => surround(el, setText, '`', '`', 'vzorec'))}
        {tool(<I.list />, 'Odrážky (- )', (el) => prefixLines(el, setText, () => '- '))}
        {tool(<span>1.</span>, 'Číslovaný seznam (1. )', (el) => prefixLines(el, setText, (i) => `${i + 1}. `))}
        {tool(<span>❝</span>, 'Citace (> )', (el) => prefixLines(el, setText, () => '> '))}
        {tool(<I.external />, 'Odkaz ([text](https://…))', (el) => surround(el, setText, '[', '](https://)', 'text odkazu'))}
        {fields && fields.length > 0 && topic && !sg && (
          <button type="button" class="fmt wide" title="Navrhnout, jak má text znít – autor ho převezme jedním klikem" onClick={() => startSuggestion(fields[0].path)}><I.bulb />Navrhnout text</button>
        )}
        <button type="button" class={`fmt wide ${preview ? 'on' : ''}`} aria-pressed={preview} onClick={() => setPreview(!preview)}><I.eye />Náhled</button>
      </div>
      {preview
        ? <div class="c-preview">{text.trim() ? <Rich text={text} /> : <span class="fine">Zatím nic nenapsáno.</span>}</div>
        : <textarea ref={ta} rows={3} value={text} onInput={(e) => setText(e.currentTarget.value)} placeholder={placeholder} maxLength={4000} autoFocus={autoFocus}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() } else if (e.key === 'Escape' && onCancel) onCancel() }} />}
      <div class="actions-row">
        <Busy class="btn small primary" on={busy} disabled={!canSend} onClick={send}><I.send />{sendLabel}</Busy>
        {onCancel && <button class="btn small" onClick={onCancel}>Zrušit</button>}
        <span class="fine c-hint">Ctrl+Enter odešle</span>
      </div>
    </div>
  )
}

// ——— Threads ———

const VERDICT = { approve: 'schválil/a', changes: 'žádá úpravy', comment: '' }

export interface ThreadActions {
  send: (m: Outgoing, anchor: string | null) => Promise<boolean>
  edit: (r: ReviewView, body: string, suggestion?: string) => Promise<boolean>
  remove: (r: ReviewView) => void
  resolve: (r: ReviewView) => void
  apply: (r: ReviewView) => void
}

function SuggestionView({ r, topic, canApply, busy, onApply }: { r: ReviewView; topic: TopicFile; canApply: boolean; busy: boolean; onApply: () => void }) {
  const sg = r.suggestion!
  const now = textAt(topic, sg.path)
  const label = fieldsAt(topic, r.anchor ?? '').find((f) => f.path === sg.path)?.label
  const moved = !r.appliedAt && now !== sg.from
  return (
    <div class={`c-suggest view ${r.appliedAt ? 'applied' : ''}`}>
      <div class="c-suggest-head">
        <b><I.bulb />Návrh textu</b>{label && <span>{label}</span>}
        {r.appliedAt && <span class="pill st-published">převzato</span>}
        {canApply && !r.appliedAt && !moved && <Busy class="btn small primary" on={busy} onClick={onApply}><I.check />Převzít návrh</Busy>}
      </div>
      <div class="c-suggest-diff"><TextDiff a={sg.from} b={sg.to} /></div>
      {moved && <small class="fine">Text se od návrhu změnil{now === undefined ? ' (blok nebo otázka se přesunuly)' : ''} – převezmi ho případně ručně v editoru.</small>}
    </div>
  )
}

function Message({ r, me, draft, topic, busy, act }: { r: ReviewView; me: Me; draft: DraftView; topic: TopicFile; busy: boolean; act: ThreadActions }) {
  const [editing, setEditing] = useState(false)
  const open = draft.status === 'draft' || draft.status === 'review'
  const mine = r.user.id === me.id
  if (editing) {
    return (
      <div class="comment editing">
        <Composer initial={r.body} placeholder="Zpráva…" topic={topic} fields={r.anchor ? fieldsAt(topic, r.anchor) : []} sendLabel="Uložit" busy={busy} autoFocus
          initialSuggestion={r.suggestion && !r.appliedAt ? { path: r.suggestion.path, text: r.suggestion.to } : undefined}
          onCancel={() => setEditing(false)} onSend={async (m) => { if (await act.edit(r, m.body, m.suggestion?.text)) setEditing(false) }} />
      </div>
    )
  }
  return (
    <div class={`comment v-${r.verdict} ${r.parent ? 'reply' : ''}`}>
      <div class="c-head">
        <b>{r.user.name}</b>
        {VERDICT[r.verdict] && <span class={`pill ${r.verdict === 'approve' ? 'st-published' : 'warn'}`}>{VERDICT[r.verdict]}</span>}
        <small title={dateTime(r.createdAt)}>{ago(r.createdAt)}{r.editedAt ? ' · upraveno' : ''}{r.stale ? ' · k dřívější verzi' : ''}</small>
        {open && mine && (
          <span class="c-tools-own">
            <button class="icon s" title="Upravit zprávu" aria-label="Upravit zprávu" onClick={() => setEditing(true)}><I.pencil /></button>
            {r.verdict === 'comment' && !r.appliedAt && <button class="icon s" title="Smazat zprávu" aria-label="Smazat zprávu" onClick={() => act.remove(r)}><I.trash /></button>}
          </span>
        )}
      </div>
      {r.body && <Rich text={r.body} />}
      {r.suggestion && <SuggestionView r={r} topic={topic} canApply={open && draft.author.id === me.id} busy={busy} onApply={() => act.apply(r)} />}
    </div>
  )
}

function One({ root, replies, me, draft, topic, busy, act }: { root: ReviewView; replies: ReviewView[]; me: Me; draft: DraftView; topic: TopicFile; busy: boolean; act: ThreadActions }) {
  const [replying, setReplying] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const open = draft.status === 'draft' || draft.status === 'review'
  const canResolve = open && (draft.author.id === me.id || root.user.id === me.id) && (root.verdict === 'comment' || replies.length > 0)
  const resolved = !!root.resolvedAt
  if (resolved && !showResolved) {
    return (
      <button class="c-collapsed" onClick={() => setShowResolved(true)}>
        <I.check /><span><b>{root.user.name}</b>: {root.body || (root.suggestion ? 'návrh textu' : '')}</span><small>vyřešeno · {replies.length + 1} {replies.length ? (replies.length < 4 ? 'zprávy' : 'zpráv') : 'zpráva'}</small>
      </button>
    )
  }
  return (
    <div class={`c-thread ${resolved ? 'resolved' : ''}`}>
      <Message r={root} me={me} draft={draft} topic={topic} busy={busy} act={act} />
      {replies.length > 0 && (
        <div class="c-replies">
          {replies.map((r) => <Message key={r.id} r={r} me={me} draft={draft} topic={topic} busy={busy} act={act} />)}
        </div>
      )}
      {replying && (
        <div class="c-replies">
          <Composer placeholder={`Odpověď pro ${root.user.id === me.id ? 'vlákno' : root.user.name}…`} topic={topic} fields={root.anchor ? fieldsAt(topic, root.anchor) : []} sendLabel="Odpovědět" busy={busy} autoFocus
            onCancel={() => setReplying(false)} onSend={async (m) => { if (await act.send({ ...m, parent: root.id }, root.anchor)) setReplying(false) }} />
        </div>
      )}
      {((open && !replying) || canResolve || resolved) && (
        <div class="c-foot">
          {open && !replying && <button class="link-btn" onClick={() => setReplying(true)}>Odpovědět</button>}
          {resolved && <button class="link-btn" onClick={() => setShowResolved(false)}>Sbalit vyřešené</button>}
          {canResolve && <button class="btn small" onClick={() => act.resolve(root)}>{resolved ? 'Otevřít znovu' : <><I.check />Vyřešeno</>}</button>}
        </div>
      )}
    </div>
  )
}

/** All threads at one place (`anchor`, or the whole change for null), and a way to start a new one. */
export function Threads({ reviews, anchor, me, draft, topic, busy, act, decisions }: {
  reviews: ReviewView[]; anchor: string | null; me: Me; draft: DraftView; topic: TopicFile; busy: boolean; act: ThreadActions; decisions?: boolean
}) {
  const [writing, setWriting] = useState(false)
  const roots = reviews.filter((r) => r.parent === null && (decisions || r.verdict === 'comment' || r.body || reviews.some((x) => x.parent === r.id)))
  const canWrite = draft.status === 'draft' || draft.status === 'review'
  const fields = anchor ? fieldsAt(topic, anchor) : []
  if (!roots.length && !canWrite) return decisions ? <p class="fine">Žádné zprávy.</p> : null
  return (
    <div class={`thread ${anchor ? 'anchored' : ''}`}>
      {roots.map((r) => <One key={r.id} root={r} replies={reviews.filter((x) => x.parent === r.id)} me={me} draft={draft} topic={topic} busy={busy} act={act} />)}
      {canWrite && (writing ? (
        <Composer placeholder={anchor ? 'Zpráva k tomuhle místu…' : 'Zpráva k celé změně…'} fields={fields} topic={topic} sendLabel="Odeslat" busy={busy} autoFocus
          onCancel={() => setWriting(false)} onSend={async (m) => { if (await act.send(m, anchor)) setWriting(false) }} />
      ) : (
        <div class="c-start">
          <button class="add-line" onClick={() => setWriting(true)}><I.plus />{anchor ? 'Komentovat' : 'Napsat zprávu'}</button>
        </div>
      ))}
    </div>
  )
}
