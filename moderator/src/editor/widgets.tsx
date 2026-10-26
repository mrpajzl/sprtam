import { useEffect, useState } from 'preact/hooks'
import type { ObjectS, S } from '../../../src/content/schema'
import { WIDGETS } from '../../../src/widgets'
import { I, Modal } from '../ui/kit'
import { Showcase, type Choice } from '../ui/Showcase'
import { errorsAt, Errors, useEd } from './fields'
import { arrayMove, defaultOf, getIn, pathKey, type Path } from './model'

// Interactive widgets: a gallery with live demos to pick one (ui/Showcase.tsx), and a form for its props generated from the widget's own
// schema (src/widgets/<name>.tsx) – every new widget gets an editor without changes here.

/** Pick a widget from the gallery; `onPick` gets it with the props of the example shown. */
export function WidgetPicker({ onPick, onClose, questionOnly, current }: { onPick: (w: { widget: string; props: Record<string, unknown> }) => void; onClose: () => void; questionOnly?: boolean; current?: string }) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const pick = (c: Choice) => onPick({ widget: c.name, props: structuredClone(WIDGETS[c.name].examples[c.example].props) as Record<string, unknown> })
  return (
    <Modal title={questionOnly ? 'Pomůcka nad otázkou' : 'Vyber interaktivní pomůcku'} onClose={onClose} wide
      actions={<><button class="btn" onClick={onClose}>Zrušit</button><button class="btn primary" disabled={!choice} onClick={() => choice && pick(choice)}>{choice ? `Použít „${WIDGETS[choice.name].title}“` : 'Použít'}</button></>}>
      {questionOnly && <p class="muted">Nad otázkou smí být jen pomůcka, která ukáže zadání a neprozradí výsledek.</p>}
      <Showcase questionOnly={questionOnly} current={current} onChoose={setChoice} onPick={pick} />
    </Modal>
  )
}

/** The widget at `path` ({ widget, props }): which one, its examples and its settings. */
export function WidgetEditor({ path, questionOnly, removable, onRemove }: { path: Path; questionOnly?: boolean; removable?: boolean; onRemove?: () => void }) {
  const ed = useEd()
  const w = getIn(ed.topic, path) as { widget: string; props: Record<string, unknown> } | undefined
  const [picking, setPicking] = useState(false)
  const def = w && WIDGETS[w.widget]
  const choose = (picked: { widget: string; props: Record<string, unknown> }) => {
    setPicking(false)
    const base = path.length ? (getIn(ed.topic, path) as object) : {}
    ed.update(path, { ...base, ...picked })
  }
  return (
    <div class="widget-editor">
      <div class="we-head">
        <div><span class="label">Pomůcka</span><b>{def?.title ?? 'Nevybráno'}</b>{def && <small>{def.summary}</small>}</div>
        {!ed.readOnly && <button type="button" class="btn small" onClick={() => setPicking(true)}>Změnit</button>}
        {!ed.readOnly && removable && <button type="button" class="btn small" onClick={onRemove}>Odebrat</button>}
      </div>
      {def && def.examples.length > 1 && !ed.readOnly && (
        <div class="examples">
          <span class="label">Začít od příkladu</span>
          {def.examples.map((x) => <button type="button" key={x.title} class="chip" onClick={() => ed.update([...path, 'props'], structuredClone(x.props))}>{x.title}</button>)}
        </div>
      )}
      {def && <ObjectFields schema={def.props as ObjectS} path={[...path, 'props']} />}
      <Errors list={errorsAt(ed, path)} />
      {picking && <WidgetPicker onPick={choose} onClose={() => setPicking(false)} questionOnly={questionOnly} current={w?.widget} />}
    </div>
  )
}

/** „Čitatel – kolik dílků je obarvených…“ → label „Čitatel“, hint the rest. */
function labelOf(name: string, x: S): [string, string] {
  const d = x.description ?? ''
  const dash = d.indexOf(' – ')
  if (dash > 0 && dash < 40) return [d.slice(0, dash), d.slice(dash + 3)]
  const dot = d.search(/[.;:](\s|$)/)
  if (dot > 0 && dot < 48) return [d.slice(0, dot), d.slice(dot + 1).trim()]
  if (d && d.length < 48) return [d, '']
  return [name, d]
}

function ObjectFields({ schema, path }: { schema: ObjectS; path: Path }) {
  return (
    <div class="props">
      {Object.entries(schema.fields).map(([k, f]) => <SchemaField key={k} name={k} schema={f} path={[...path, k]} optional={schema.optional.has(k)} />)}
    </div>
  )
}

/** A number typed as text: half-typed values ("", "-", "3,") stay in the box until they are a number. */
function NumberInput({ value, set, disabled, label }: { value: unknown; set: (n: number) => void; disabled: boolean; label: string }) {
  const show = (v: unknown) => (typeof v === 'number' ? String(v).replace('.', ',') : '')
  const [text, setText] = useState(show(value))
  const parse = (t: string) => Number(t.trim().replace(',', '.').replace('−', '-'))
  useEffect(() => { if (parse(text) !== value) setText(show(value)) }, [value])
  return <input type="text" inputMode="decimal" value={text} disabled={disabled} aria-label={label} onInput={(e) => { const t = e.currentTarget.value; setText(t); const n = parse(t); if (t.trim() && Number.isFinite(n)) set(n) }} />
}

function SchemaField({ name, schema, path, optional, bare }: { name: string; schema: S; path: Path; optional?: boolean; bare?: boolean }) {
  const ed = useEd()
  const value = getIn(ed.topic, path)
  const [label, hint] = labelOf(name, schema)
  const errs = errorsAt(ed, path)
  const set = (v: unknown) => ed.update(path, v, pathKey(path))
  const missing = value === undefined

  if (optional && missing) {
    return (
      <div class="field opt-off">
        <span>{label}<em> · nepovinné</em></span>
        {!ed.readOnly && <button type="button" class="add-line" onClick={() => set(defaultOf(schema))}><I.plus />Nastavit</button>}
        {hint && <small>{hint}</small>}
      </div>
    )
  }
  const clear = optional && !ed.readOnly ? <button type="button" class="icon s" onClick={() => ed.update(path, undefined)} title="Vrátit výchozí" aria-label="Vrátit výchozí"><I.close /></button> : null

  if (bare && schema.kind === 'string') {
    return <div class={`field ${errs.length ? 'bad' : ''}`}><input value={(value as string) ?? ''} disabled={ed.readOnly} aria-label={label} onInput={(e) => set(e.currentTarget.value)} /><Errors list={errs} /></div>
  }
  if (bare && schema.kind === 'number') {
    return <div class={`field ${errs.length ? 'bad' : ''}`}><NumberInput value={value} set={set} disabled={ed.readOnly} label={label} /><Errors list={errs} /></div>
  }

  switch (schema.kind) {
    case 'string':
      return (
        <label class={`field ${errs.length ? 'bad' : ''}`}>
          <span>{label}{optional && <em> · nepovinné</em>}</span>
          <div class="with-tool"><input value={(value as string) ?? ''} disabled={ed.readOnly} onInput={(e) => set(e.currentTarget.value)} />{clear}</div>
          {hint && <small>{hint}</small>}<Errors list={errs} />
        </label>
      )
    case 'number': {
      return (
        <label class={`field num ${errs.length ? 'bad' : ''}`}>
          <span>{label}{optional && <em> · nepovinné</em>}</span>
          <div class="with-tool">
            <NumberInput value={value} set={set} disabled={ed.readOnly} label={label} />
            {schema.min !== undefined && schema.max !== undefined && schema.max - schema.min <= 60 && (
              <input type="range" min={schema.min} max={schema.max} step={schema.int ? 1 : (schema.max - schema.min) / 100} value={typeof value === 'number' ? value : schema.min} disabled={ed.readOnly}
                onInput={(e) => set(Number(e.currentTarget.value))} aria-label={label} />
            )}
            {clear}
          </div>
          {hint && <small>{hint}</small>}<Errors list={errs} />
        </label>
      )
    }
    case 'boolean':
      return <label class="field check"><input type="checkbox" checked={!!value} disabled={ed.readOnly} onChange={(e) => set(e.currentTarget.checked)} /><span>{label}</span>{hint && <small>{hint}</small>}</label>
    case 'enum':
      return (
        <div class={`field ${errs.length ? 'bad' : ''}`}>
          <span>{label}</span>
          <div class="seg-pick">{schema.values.map((v) => <button type="button" key={v} class={value === v ? 'on' : ''} disabled={ed.readOnly} onClick={() => set(v)}>{v}</button>)}{clear}</div>
          {hint && <small>{hint}</small>}<Errors list={errs} />
        </div>
      )
    case 'anyOf': {
      // Numbers that may also be written as text ("12 500", "3,75"): one text box, a plain number is stored as a number.
      const text = value === undefined ? '' : String(value)
      return (
        <label class={`field ${errs.length ? 'bad' : ''}`}>
          <span>{label}</span>
          <input value={text} disabled={ed.readOnly} inputMode="decimal" onInput={(e) => { const v = e.currentTarget.value; set(/^\d+(\.\d+)?$/.test(v) ? Number(v) : v) }} />
          {hint && <small>{hint}</small>}<Errors list={errs} />
        </label>
      )
    }
    case 'object':
      return <fieldset class="field group"><legend>{label}</legend><ObjectFields schema={schema} path={path} /></fieldset>
    case 'tuple':
      return (
        <div class="field"><span>{label}</span>
          <div class="tuple">{schema.items.map((x, i) => <SchemaField key={i} name={`${i + 1}.`} schema={x} path={[...path, i]} />)}</div>
        </div>
      )
    case 'array': {
      const items = (value as unknown[]) ?? []
      const simple = schema.item.kind === 'string' || schema.item.kind === 'number'
      const [itemLabel] = labelOf('Položka', schema.item)
      return (
        <div class={`field array ${errs.length ? 'bad' : ''}`}>
          <span>{label}{optional && <em> · nepovinné</em>}</span>
          {hint && <small>{hint}</small>}
          <ol class={simple ? 'simple' : 'cards'}>
            {items.map((_, i) => (
              <li key={i}>
                <div class="arr-item">
                  {simple ? <SchemaField name={itemLabel} schema={schema.item} path={[...path, i]} bare /> : <SchemaField name={`${itemLabel} ${i + 1}`} schema={schema.item} path={[...path, i]} />}
                </div>
                {!ed.readOnly && (
                  <span class="row-tools">
                    <button type="button" class="icon s" disabled={i === 0} onClick={() => set(arrayMove(items, i, i - 1))} aria-label="Nahoru"><I.up /></button>
                    <button type="button" class="icon s" disabled={i === items.length - 1} onClick={() => set(arrayMove(items, i, i + 1))} aria-label="Dolů"><I.down /></button>
                    <button type="button" class="icon s" disabled={items.length <= (schema.min ?? 0)} onClick={() => set(items.filter((_, j) => j !== i))} aria-label="Odebrat"><I.close /></button>
                  </span>
                )}
              </li>
            ))}
          </ol>
          {!ed.readOnly && (schema.max === undefined || items.length < schema.max) && (
            <button type="button" class="add-line" onClick={() => set([...items, items.length && schema.item.kind === 'object' ? structuredClone(items[items.length - 1]) : defaultOf(schema.item)])}><I.plus />Přidat</button>
          )}
          <Errors list={errs} />
        </div>
      )
    }
    default:
      return null
  }
}
