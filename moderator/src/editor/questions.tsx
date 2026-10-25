import { useState } from 'preact/hooks'
import type { Question } from '../../../src/content/types'
import { I } from '../ui/kit'
import { Errors, Text, TextList, useEd } from './fields'
import type { Issue } from './issues'
import { arrayInsert, arrayMove, arrayRemove, getIn, newQuestion, newWidget, QUESTION_TYPES, questionLabel, type Path } from './model'
import { Insert, Menu, useSortable } from './sortable'
import { WidgetEditor } from './widgets'

// Quiz questions as cards; the preview on the right lets the author answer the selected one.

export function QuestionList({ issues }: { issues: Issue[] }) {
  const ed = useEd()
  const qs = ed.topic.questions
  const [menuAt, setMenuAt] = useState<number | null>(null)
  const set = (xs: Question[]) => ed.update(['questions'], xs)
  const sort = useSortable((from, to) => { set(arrayMove(qs, from, to)); ed.setFocus({ q: to }) })
  const add = (at: number, type: Question['type']) => { set(arrayInsert(qs, at, newQuestion(type))); setMenuAt(null); ed.setFocus({ q: at }) }
  const open = qs.filter((q) => q.type === 'open').length
  return (
    <div class="cards">
      <div class="q-stats">
        <span class={qs.length >= 8 ? 'ok' : 'bad'}>{qs.length} otázek <small>(aspoň 8, ideálně 10+)</small></span>
        <span class={open >= 1 ? 'ok' : 'bad'}>{open} na ústní zkoušení <small>(aspoň 1, ideálně 2)</small></span>
        <span>{new Set(qs.map((q) => q.type)).size} druhů <small>(střídej je)</small></span>
      </div>
      {qs.map((q, i) => {
        const p: Path = ['questions', i]
        const focused = ed.focus.q === i
        const mine = issues.filter((x) => x.question === i)
        const it = sort.item(i)
        return (
          <div key={i} class="card-slot">
            {!ed.readOnly && (menuAt === i ? <Menu title="Vložit otázku" items={QUESTION_TYPES} onPick={(t) => add(i, t)} onClose={() => setMenuAt(null)} /> : i > 0 && <Insert label="Vložit otázku sem" onClick={() => setMenuAt(i)} />)}
            <section {...it} id={`question-${i}`} class={`card question t-${q.type} ${focused ? 'focused' : ''} ${mine.length ? 'has-issues' : ''} ${it.class}`}
              onFocusIn={() => !focused && ed.setFocus({ q: i })} onClick={() => !focused && ed.setFocus({ q: i })}>
              <header>
                {!ed.readOnly && <span class="grip" {...sort.handle(i)} aria-hidden="true"><I.grip /></span>}
                <span class="kind">{questionLabel(q.type)}</span>
                <span class="n">{i + 1}</span>
                {mine.length > 0 && <span class="badge bad">{mine.length}</span>}
                {!ed.readOnly && (
                  <span class="tools">
                    <select class="type-switch" value={q.type} aria-label="Druh otázky" title="Změnit druh otázky" onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { const t = e.currentTarget.value as Question['type']; ed.update(p, { ...newQuestion(t), question: q.question }) }}>
                      {QUESTION_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                    </select>
                    <button type="button" class="icon s" disabled={i === 0} onClick={(e) => { e.stopPropagation(); set(arrayMove(qs, i, i - 1)); ed.setFocus({ q: i - 1 }) }} aria-label="Nahoru"><I.up /></button>
                    <button type="button" class="icon s" disabled={i === qs.length - 1} onClick={(e) => { e.stopPropagation(); set(arrayMove(qs, i, i + 1)); ed.setFocus({ q: i + 1 }) }} aria-label="Dolů"><I.down /></button>
                    <button type="button" class="icon s" onClick={(e) => { e.stopPropagation(); set(arrayInsert(qs, i + 1, structuredClone(q))); ed.setFocus({ q: i + 1 }) }} aria-label="Duplikovat"><I.copy /></button>
                    <button type="button" class="icon s" onClick={(e) => { e.stopPropagation(); set(arrayRemove(qs, i)) }} aria-label="Smazat otázku" title="Smazat (jde vrátit Ctrl+Z)"><I.trash /></button>
                  </span>
                )}
              </header>
              <div class="body"><QuestionForm q={q} p={p} /></div>
              <Errors list={mine.filter((x) => x.path === `questions[${i}]`).map((x) => x.cs)} />
            </section>
          </div>
        )
      })}
      {!ed.readOnly && (menuAt === qs.length
        ? <Menu title="Přidat otázku" items={QUESTION_TYPES} onPick={(t) => add(qs.length, t)} onClose={() => setMenuAt(null)} />
        : <button type="button" class="add-card" onClick={() => setMenuAt(qs.length)}><I.plus />Přidat otázku</button>)}
    </div>
  )
}

const Why = ({ p }: { p: Path }) => <Text path={[...p, 'explanation']} label="Proč je to tak" optional multiline placeholder="Ukáže se po odpovědi. Krátce vysvětli správnou odpověď." />

function QuestionForm({ q, p }: { q: Question; p: Path }) {
  const ed = useEd()
  switch (q.type) {
    case 'choice': {
      const set = (o: string[], a: number) => ed.update(p, { ...q, options: o, answer: a })
      return (
        <>
          <Text path={[...p, 'question']} label="Otázka" multiline placeholder="Který zlomek je největší?" />
          <div class="field list">
            <span>Možnosti – zaškrtni správnou (aplikace je zamíchá)</span>
            <ol class="options">
              {q.options.map((_, i) => (
                <li key={i} class={q.answer === i ? 'right' : ''}>
                  <label class="radio-dot" title="Správná odpověď"><input type="radio" name={`ans-${p[1]}`} checked={q.answer === i} disabled={ed.readOnly} onChange={() => ed.update([...p, 'answer'], i)} /><span>{q.answer === i ? '✓' : ''}</span></label>
                  <Text path={[...p, 'options', i]} placeholder={q.answer === i ? 'Správná odpověď' : 'Věrohodná špatná odpověď (typická chyba)'} />
                  {!ed.readOnly && <button type="button" class="icon s" disabled={q.options.length <= 2} aria-label="Odebrat možnost"
                    onClick={() => set(q.options.filter((_, j) => j !== i), q.answer === i ? 0 : q.answer > i ? q.answer - 1 : q.answer)}><I.close /></button>}
                </li>
              ))}
            </ol>
            {!ed.readOnly && q.options.length < 4 && <button type="button" class="add-line" onClick={() => set([...q.options, ''], q.answer)}><I.plus />Přidat možnost</button>}
            <Errors list={ed.errors.get(`questions[${p[1]}].options`) ?? []} />
          </div>
          <Why p={p} />
        </>
      )
    }
    case 'truefalse':
      return (
        <>
          <Text path={[...p, 'question']} label="Tvrzení" multiline placeholder="2/4 je totéž co 1/2." />
          <div class="field"><span>Tvrzení je</span>
            <div class="seg-pick">
              <button type="button" class={q.answer ? 'on' : ''} disabled={ed.readOnly} onClick={() => ed.update([...p, 'answer'], true)}>Pravda</button>
              <button type="button" class={!q.answer ? 'on' : ''} disabled={ed.readOnly} onClick={() => ed.update([...p, 'answer'], false)}>Nepravda</button>
            </div>
          </div>
          <Why p={p} />
        </>
      )
    case 'input':
      return (
        <>
          <Text path={[...p, 'question']} label="Otázka" multiline placeholder="Obsah obdélníku 3 cm × 4 cm v cm² =" hint="Ptej se tak, aby odpověď bylo jen číslo nebo jedno slovo." />
          <TextList path={[...p, 'answers']} label="Správné odpovědi – všechny, které uznat" addLabel="Přidat další přijatelnou odpověď"
            hint={`Velikost písmen a mezery se nehlídají, čísla se porovnávají jako čísla (0,5 = 0.5). ${['cestina', 'literatura'].includes(ed.subject) ? 'Diakritika se hlídá – rozhoduje pravopis.' : 'Diakritika se tady nehlídá (jen v češtině a literatuře).'}`} />
          {q.widget
            ? <WidgetEditor path={[...p, 'widget']} questionOnly removable onRemove={() => ed.update([...p, 'widget'], undefined)} />
            : !ed.readOnly && <button type="button" class="add-line" onClick={() => ed.update([...p, 'widget'], newWidget('column'))}><I.plus />Ukázat nad otázkou příklad pod sebou</button>}
          <Why p={p} />
        </>
      )
    case 'order':
      return (
        <>
          <Text path={[...p, 'question']} label="Zadání" multiline placeholder="Seřaď od nejmenšího." />
          <TextList path={[...p, 'items']} label="Položky ve SPRÁVNÉM pořadí (aplikace je zamíchá)" numbered min={3} max={8} addLabel="Přidat položku" />
          <Why p={p} />
        </>
      )
    case 'match': {
      const pairs = (getIn(ed.topic, [...p, 'pairs']) as [string, string][]) ?? []
      return (
        <>
          <Text path={[...p, 'question']} label="Zadání" multiline placeholder="Spoj zlomek s desetinným číslem." />
          <div class="field list">
            <span>Dvojice – správně spárované (pravou stranu aplikace zamíchá)</span>
            <ol class="pairs-edit">
              {pairs.map((_, i) => (
                <li key={i}>
                  <Text path={[...p, 'pairs', i, 0]} placeholder="Vlevo" />
                  <span class="link">↔</span>
                  <Text path={[...p, 'pairs', i, 1]} placeholder="Vpravo" />
                  {!ed.readOnly && <button type="button" class="icon s" disabled={pairs.length <= 3} aria-label="Odebrat dvojici" onClick={() => ed.update([...p, 'pairs'], pairs.filter((_, j) => j !== i))}><I.close /></button>}
                </li>
              ))}
            </ol>
            {!ed.readOnly && pairs.length < 6 && <button type="button" class="add-line" onClick={() => ed.update([...p, 'pairs'], [...pairs, ['', '']])}><I.plus />Přidat dvojici</button>}
            <Errors list={ed.errors.get(`questions[${p[1]}].pairs`) ?? []} />
          </div>
          <Why p={p} />
        </>
      )
    }
    case 'open':
      return (
        <>
          <Text path={[...p, 'question']} label="Otázka na ústní zkoušení" multiline placeholder="Vysvětli, co znamená jmenovatel." />
          <Text path={[...p, 'answer']} label="Vzorová odpověď (1–3 věty)" multiline placeholder="Jmenovatel je číslo pod zlomkovou čarou…" />
        </>
      )
  }
}
