import type { Block, Question, TopicFile } from './types'
import { GENERATOR_NAMES } from '../quiz/generators'
import { WIDGETS, type WidgetRef } from '../widgets'

// Authoring rules of one topic (docs/CONTENT.md) that the format alone cannot express. Shared by
// scripts/check-content.ts and the moderator app (editor checklist and the server check before a pull
// request), so content that passes the editor also passes the deploy.
// `path` is relative to the topic ('' = the topic itself), `message` English (script output), `cs` for the editor.

export interface RuleIssue { path: string; message: string; cs: string }

export function widgetIssues(w: WidgetRef, path: string, out: RuleIssue[] = []): RuleIssue[] {
  const def = WIDGETS[w.widget]
  if (!def) return out // reported by the format check
  for (const m of def.check?.(w.props as never) ?? []) out.push({ path, message: `widget ${w.widget}: ${m}`, cs: `Pomůcka „${def.title}“: ${m}` })
  return out
}

function blockIssues(b: Block, path: string, out: RuleIssue[]) {
  if (b.type === 'table' && !b.rows.every((r) => r.length === b.head.length)) out.push({ path, message: 'table row width differs from head', cs: 'Každý řádek tabulky musí mít stejně buněk jako záhlaví.' })
  if (b.type === 'widget') widgetIssues(b, path, out)
  if (b.type === 'example' && b.widget) widgetIssues(b.widget, path, out)
}

/** Does a hint give the answer away? The answer as a whole word or number in it (short answers like „2“ appear in hints naturally). */
const tells = (hint: string, answer: string) => {
  const a = answer.trim().toLowerCase()
  if (a.length < 3) return false
  const at = hint.toLowerCase().indexOf(a)
  const edge = (c: string | undefined) => !c || !/[\p{L}\p{N}]/u.test(c)
  return at >= 0 && edge(hint.toLowerCase()[at - 1]) && edge(hint.toLowerCase()[at + a.length])
}

function questionIssues(q: Question, path: string, out: RuleIssue[]) {
  if ('hints' in q && q.hints) {
    const answers = q.type === 'input' ? q.answers : q.type === 'choice' ? [q.options[q.answer] ?? ''] : []
    q.hints.forEach((h, i) => {
      if (!h.trim()) out.push({ path: `${path}.hints[${i}]`, message: 'empty hint', cs: 'Nápověda je prázdná.' })
      else if (answers.some((a) => tells(h, a))) out.push({ path: `${path}.hints[${i}]`, message: 'hint gives the answer away', cs: 'Nápověda prozrazuje odpověď. Napiš jen krok, jak na ni přijít.' })
    })
  }
  switch (q.type) {
    case 'choice':
      if (q.answer >= q.options.length) out.push({ path, message: 'choice answer out of range', cs: 'Označ, která možnost je správná.' })
      if (new Set(q.options).size !== q.options.length) out.push({ path, message: 'duplicate options', cs: 'Dvě možnosti jsou stejné.' })
      break
    case 'input':
      if (q.widget) {
        widgetIssues(q.widget, path, out)
        const def = WIDGETS[q.widget.widget]
        for (const m of def?.checkQuestion?.(q.widget.props as never, q.answers) ?? []) out.push({ path, message: `widget ${q.widget.widget}: ${m}`, cs: `Pomůcka „${def!.title}“: ${m}` })
      }
      break
  }
}

/** Every rule problem of a topic. `approaches` = ids of the folders in content/approaches. May throw on data that breaks the format. */
export function topicIssues(t: TopicFile, approaches: readonly string[]): RuleIssue[] {
  const out: RuleIssue[] = []
  const general = t.explanations.filter((x) => !x.approach)
  if (general.length !== 2) out.push({ path: '', message: `needs exactly 2 explanations without "approach" (has ${general.length})`, cs: `Téma potřebuje přesně 2 obecná vysvětlení (má ${general.length}).` })
  const seen = new Set<string>()
  t.explanations.forEach((x, i) => {
    if (!x.approach) return
    if (!approaches.includes(x.approach)) out.push({ path: `explanations[${i}]`, message: `unknown approach "${x.approach}" (content/approaches)`, cs: `Neznámý přístup k výuce „${x.approach}“.` })
    if (seen.has(x.approach)) out.push({ path: `explanations[${i}]`, message: `more than one explanation for approach "${x.approach}"`, cs: `Pro přístup „${x.approach}“ smí být jen jedno vysvětlení.` })
    seen.add(x.approach)
  })
  if (t.approach && !approaches.includes(t.approach)) out.push({ path: '', message: `unknown approach "${t.approach}" (content/approaches)`, cs: `Neznámý přístup k výuce „${t.approach}“.` })
  t.explanations.forEach((x, i) => {
    const w = `explanations[${i}]`
    x.blocks.forEach((b, j) => blockIssues(b, `${w}.blocks[${j}]`, out))
    // Depth: every explanation must stand on its own and start from zero (docs/CONTENT.md).
    const has = (k: Block['type']) => x.blocks.some((b) => b.type === k)
    if (x.blocks.length < 8) out.push({ path: w, message: `too shallow (${x.blocks.length} blocks, need ≥ 8)`, cs: `Vysvětlení je moc krátké: ${x.blocks.length} bloků, potřeba aspoň 8.` })
    if (x.blocks[0]?.type !== 'heading' || x.blocks[1]?.type !== 'text') out.push({ path: w, message: 'must start with a heading ("O čem to je") and a text', cs: 'Vysvětlení musí začínat nadpisem („O čem to je“) a hned pod ním odstavcem.' })
    if (!has('term')) out.push({ path: w, message: 'no term block – new terms must be explained', cs: 'Chybí nový pojem – každý odborný pojem musí být vysvětlený.' })
    if (!has('summary')) out.push({ path: w, message: 'no summary', cs: 'Chybí shrnutí na konec.' })
    if (!has('example') && !has('steps') && !has('widget')) out.push({ path: w, message: 'needs an example, steps or a widget', cs: 'Přidej řešený příklad, postup nebo interaktivní pomůcku.' })
  })
  if (!t.explanations.some((x) => x.blocks.some((b) => b.type === 'mistake'))) out.push({ path: '', message: 'needs a mistake block', cs: 'Aspoň jedno vysvětlení musí mít „Častou chybu“.' })
  if (t.generator && !GENERATOR_NAMES.includes(t.generator)) out.push({ path: '', message: `unknown generator ${t.generator} (src/quiz/generators.ts)`, cs: `Neznámý generátor příkladů „${t.generator}“.` })
  if (!t.questions.some((q) => q.type === 'open')) out.push({ path: '', message: 'needs ≥ 1 open question', cs: 'Přidej aspoň jednu otázku na ústní zkoušení.' })
  t.questions.forEach((q, i) => questionIssues(q, `questions[${i}]`, out))
  return out
}
