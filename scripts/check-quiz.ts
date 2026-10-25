// Builds every quiz mode for every topic and checks that each typed answer accepts its own key.
// npx tsx scripts/check-quiz.ts
import { readSubjects } from '../plugins/content'
import { build, checkInput, strictFor, MODES, type ModeId } from '../src/quiz/engine'
import { GENERATORS } from '../src/quiz/generators'
import { WIDGETS } from '../src/widgets'
let n = 0; const errs: string[] = []
for (const s of readSubjects()) {
  const topics = s.topics.map((t) => ({ key: `${s.grade}/${s.subject}/${t.id}`, t }))
  for (const tp of topics) {
    for (const m of Object.keys(MODES) as ModeId[]) { const items = build(m, m === 'test' ? topics : [tp]); if (!items.length) errs.push(`${tp.key} ${m}: empty`); n++ }
    for (const q of tp.t.questions) if (q.type === 'input') for (const a of q.answers) if (!checkInput(a, q.answers, strictFor(tp.key))) errs.push(`${tp.key}: "${a}" rejected`)
  }
}
for (const [name, gen] of Object.entries(GENERATORS)) for (let i = 0; i < 200; i++) {
  const q = gen()
  if (q.type === 'input' && !checkInput(q.answers[0], q.answers)) errs.push(`gen ${name}: own answer rejected ${q.question} ${q.answers}`)
  if (q.type === 'input' && q.answers.some((x) => /NaN|undefined|Infinity/.test(x))) errs.push(`gen ${name}: bad ${q.question} ${q.answers}`)
  if (q.type === 'input' && q.widget) errs.push(...(WIDGETS[q.widget.widget].checkQuestion?.(q.widget.props, q.answers) ?? []).map((e) => `gen ${name}: ${q.question} ${e}`))
  if (q.type === 'choice' && (q.answer < 0 || q.options.length < 2)) errs.push(`gen ${name}: bad choice ${q.question}`)
}
console.log(`${n} quizzes built, ${errs.length} problems`); errs.slice(0, 30).forEach((e) => console.log('✗', e))
