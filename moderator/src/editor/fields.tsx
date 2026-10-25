import { createContext, type ComponentChildren } from 'preact'
import { useContext, useLayoutEffect, useRef, useState } from 'preact/hooks'
import type { TopicFile } from '../../../src/content/types'
import { I } from '../ui/kit'
import { getIn, pathKey, type Path } from './model'

// Form fields bound to a place in the topic: each reads its value from the editor state by path,
// writes back through `update`, and shows the problems the checker found exactly there.

export interface Focus { ex?: number; block?: number; q?: number; meta?: boolean }

export interface EditorCtx {
  topic: TopicFile
  subject: string
  update: (path: Path, value: unknown, group?: string) => void
  errors: Map<string, string[]>
  readOnly: boolean
  focus: Focus
  setFocus: (f: Focus) => void
}

export const Ctx = createContext<EditorCtx>(null as never)
export const useEd = () => useContext(Ctx)

export const errorsAt = (ed: EditorCtx, path: Path) => ed.errors.get(pathKey(path)) ?? []

function Errors({ list }: { list: string[] }) {
  return list.length ? <div class="f-err" role="alert">{list.map((e, i) => <span key={i}><I.warn />{e}</span>)}</div> : null
}

// ——— The formatting toolbar acts on the text field that was focused last ———

type Editable = HTMLTextAreaElement | HTMLInputElement
let active: { el: Editable; set: (v: string) => void } | null = null
const listeners = new Set<(on: boolean) => void>()
function setActive(a: typeof active) { active = a; listeners.forEach((f) => f(!!a)) }

/** Wraps the selection in `before`/`after` (or inserts them around a placeholder). */
function wrap(before: string, after = '', placeholder = '') {
  if (!active) return
  const { el, set } = active
  const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? s
  const sel = el.value.slice(s, e) || placeholder
  const v = el.value.slice(0, s) + before + sel + after + el.value.slice(e)
  set(v)
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length) })
}

const SYMBOLS = ['·', '−', '×', '≤', '≥', '≠', '≈', '²', '³', '√', 'π', '°', '→', '„“', '–']

export function FormatBar() {
  const [on, setOn] = useState(!!active)
  useLayoutEffect(() => { listeners.add(setOn); return () => { listeners.delete(setOn) } }, [])
  const btn = (label: preact.JSX.Element | string, title: string, f: () => void) => (
    <button type="button" class="fmt" title={title} aria-label={title} disabled={!on} onMouseDown={(e) => e.preventDefault()} onClick={f}>{label}</button>
  )
  return (
    <div class="formatbar" role="toolbar" aria-label="Formátování textu">
      {btn(<I.bold />, 'Tučně – nový pojem nebo to důležité (**text**)', () => wrap('**', '**', 'tučně'))}
      {btn(<I.italic />, 'Kurzíva (*text*)', () => wrap('*', '*', 'kurzíva'))}
      {btn(<span class="code">x+1</span>, 'Vzorec (`vzorec`)', () => wrap('`', '`', 'vzorec'))}
      {btn(<span>x<sup>2</sup></span>, 'Horní index (^2)', () => wrap('^', '', '2'))}
      <span class="sep" />
      {SYMBOLS.map((s) => btn(s, `Vložit ${s}`, () => (s === '„“' ? wrap('„', '“') : wrap(s))))}
    </div>
  )
}

// ——— Text ———

function useAutoGrow(ref: { current: HTMLTextAreaElement | null }, value: string) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
}

interface TextProps { path: Path; label?: string; placeholder?: string; multiline?: boolean; hint?: string; optional?: boolean; class?: string; onEnter?: () => void; autoFocus?: boolean }

/** A text of the topic. Multi-line fields grow with their content. */
export function Text({ path, label, placeholder, multiline, hint, optional, class: cls, onEnter, autoFocus }: TextProps) {
  const ed = useEd()
  const value = (getIn(ed.topic, path) as string | undefined) ?? ''
  const ref = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useAutoGrow(ref, value)
  useLayoutEffect(() => { if (autoFocus) (ref.current ?? inputRef.current)?.focus() }, [])
  const errs = errorsAt(ed, path)
  const set = (v: string) => ed.update(path, v, pathKey(path))
  const common = {
    value, placeholder, disabled: ed.readOnly, 'aria-invalid': errs.length > 0, 'aria-label': label ?? placeholder,
    onFocus: (e: FocusEvent) => setActive({ el: e.currentTarget as Editable, set }),
    onInput: (e: Event) => set((e.currentTarget as Editable).value),
  }
  return (
    <label class={`field ${cls ?? ''} ${errs.length ? 'bad' : ''}`}>
      {label && <span>{label}{optional && <em> · nepovinné</em>}</span>}
      {multiline
        ? <textarea ref={ref} rows={1} {...common} spellcheck />
        : <input ref={inputRef} {...common} spellcheck onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter() } }} />}
      {hint && <small>{hint}</small>}
      <Errors list={errs} />
    </label>
  )
}

/** A list of short texts (list items, steps, accepted answers, items to order). */
export function TextList({ path, label, placeholder, min = 1, max = 30, multiline, numbered, hint, addLabel = 'Přidat' }:
  { path: Path; label: string; placeholder?: (i: number) => string; min?: number; max?: number; multiline?: boolean; numbered?: boolean; hint?: string; addLabel?: string }) {
  const ed = useEd()
  const items = (getIn(ed.topic, path) as string[] | undefined) ?? []
  const [focusLast, setFocusLast] = useState(false)
  const set = (xs: string[]) => ed.update(path, xs)
  const add = () => { set([...items, '']); setFocusLast(true) }
  return (
    <div class={`field list ${errorsAt(ed, path).length ? 'bad' : ''}`}>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      <ol class={numbered ? 'numbered' : ''}>
        {items.map((_, i) => (
          <li key={i}>
            {numbered && <span class="num">{i + 1}.</span>}
            <Text path={[...path, i]} placeholder={placeholder?.(i)} multiline={multiline} onEnter={i === items.length - 1 && items.length < max ? add : undefined} autoFocus={focusLast && i === items.length - 1} />
            {!ed.readOnly && (
              <span class="row-tools">
                {numbered && <button type="button" class="icon s" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(n) }} aria-label="Posunout nahoru"><I.up /></button>}
                {numbered && <button type="button" class="icon s" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(n) }} aria-label="Posunout dolů"><I.down /></button>}
                <button type="button" class="icon s" disabled={items.length <= min} onClick={() => set(items.filter((_, j) => j !== i))} aria-label="Odebrat"><I.close /></button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!ed.readOnly && items.length < max && <button type="button" class="add-line" onClick={add}><I.plus />{addLabel}</button>}
      <Errors list={errorsAt(ed, path)} />
    </div>
  )
}

export function EmojiField({ value, set, choices, label = 'Emoji', disabled, errors = [] }: { value: string; set: (v: string) => void; choices: string[]; label?: string; disabled?: boolean; errors?: string[] }) {
  return (
    <div class={`field emoji ${errors.length ? 'bad' : ''}`}>
      <span>{label}</span>
      <div class="emoji-row">
        <input class="emoji-input" value={value} disabled={disabled} maxLength={16} onInput={(e) => set(e.currentTarget.value.trim())} aria-label={label} />
        <div class="emoji-picks">{choices.map((c) => <button type="button" key={c} disabled={disabled} class={c === value ? 'on' : ''} onClick={() => set(c)}>{c}</button>)}</div>
      </div>
      <small>Vyber nebo vlož vlastní (na Macu Ctrl + ⌘ + mezerník, ve Windows Win + .).</small>
      <Errors list={errors} />
    </div>
  )
}

export function Field({ label, hint, children, errors = [] }: { label: string; hint?: string; children: ComponentChildren; errors?: string[] }) {
  return <div class={`field ${errors.length ? 'bad' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}<Errors list={errors} /></div>
}

export { Errors }
