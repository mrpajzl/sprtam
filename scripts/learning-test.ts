// The rules behind the learning loop: progress of single questions, review rounds, the daily goal and the
// streak with forgiven days. npx tsx scripts/learning-test.ts
import { readSubjects } from '../plugins/content'

// store.ts lives in the browser: a minimal localStorage and window events.
const mem = new Map<string, string>()
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) },
  addEventListener: () => {},
})
const store = await import('../src/progress/store')
const { streakOf } = await import('../src/progress/recommend')
const { reviewIds, reviewItems, build } = await import('../src/quiz/engine')
const { questionId, nextBox, isMistake, isDue } = await import('../src/progress/questions')

let failed = 0
const check = (name: string, ok: boolean, detail = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` ${detail}`}`) }
const T = store.today()
const P = (a: number[], extra = {}) => ({ v: 1 as const, t: {}, w: {}, a: a.map((d) => T - d).sort((x, y) => x - y), ...extra })

// ——— Streak ———
check('streak: today and yesterday', streakOf(P([0, 1])).n === 2)
check('streak: today still open', streakOf(P([1, 2, 3])).n === 3)
check('streak: one missed day is forgiven', JSON.stringify(streakOf(P([0, 2, 3]))) === JSON.stringify({ n: 3, frozen: [T - 1] }))
check('streak: yesterday missed, today open – still alive', streakOf(P([2, 3])).n === 2)
check('streak: two missed days in a row end it', streakOf(P([0, 3, 4])).n === 1)
check('streak: one forgiven day a week only', streakOf(P([0, 2, 4, 5])).n === 2, JSON.stringify(streakOf(P([0, 2, 4, 5]))))
check('streak: forgiven again a week later', streakOf(P([0, 2, 3, 4, 5, 6, 7, 8, 10, 11])).n === 10, JSON.stringify(streakOf(P([0, 2, 3, 4, 5, 6, 7, 8, 10, 11]))))
check('streak: nothing', streakOf(P([])).n === 0 && streakOf(P([5])).n === 0)

// ——— Boxes ———
check('box: wrong → 0', nextBox({ b: 4, d: T, w: 0 }, false, false) === 0)
check('box: first right → 2', nextBox(undefined, true, false) === 2)
check('box: right → up, at most 5', nextBox({ b: 2, d: T, w: 1 }, true, false) === 3 && nextBox({ b: 5, d: T, w: 0 }, true, false) === 5)
check('box: right with a hint stays', nextBox({ b: 3, d: T, w: 0 }, true, true) === 3 && nextBox(undefined, true, true) === 1)
check('mistake until right twice', isMistake({ b: 0, d: T, w: 1 }) && isMistake({ b: 1, d: T, w: 1 }) && !isMistake({ b: 2, d: T, w: 1 }) && !isMistake({ b: 0, d: T, w: 0 }))
check('due by box', isDue({ b: 0, d: T, w: 1 }) && !isDue({ b: 2, d: T - 2, w: 0 }) && isDue({ b: 2, d: T - 3, w: 0 }))

// ——— Question ids ———
const q = { type: 'input' as const, question: '2 + 3 =', answers: ['5'], explanation: 'Sečti.' }
check('id ignores explanation and hints', questionId('z1/matematika/x', q) === questionId('z1/matematika/x', { ...q, explanation: 'Jinak.', hints: ['Počítej na prstech.'] }))
check('id changes with the answer', questionId('z1/matematika/x', q) !== questionId('z1/matematika/x', { ...q, answers: ['6'] }))
const subjects = readSubjects()
let dup = 0, total = 0
for (const s of subjects) for (const t of s.topics) {
  const ids = t.questions.map((x) => questionId(`${s.grade}/${s.subject}/${t.id}`, x))
  total += ids.length; dup += ids.length - new Set(ids).size
}
check(`ids unique within topics (${total} questions, ${dup} identical duplicates)`, dup < total / 500)

// ——— Recording answers ———
const subj = subjects.find((s) => s.grade === 'z5' && s.subject === 'matematika') ?? subjects[0]
const topics = subj.topics.slice(0, 3).map((t) => ({ key: `${subj.grade}/${subj.subject}/${t.id}`, t }))
const items = build('kviz', topics.slice(0, 1))
const [a, b, c] = items.filter((i) => i.id)
store.answered(a.id, false, false, true)
store.answered(b.id, true, false, true)
store.answered(c.id, true, true, true)
store.answered(a.id, true, false, false) // a retry in Opakování moves nothing
store.answered(undefined, true, false, true) // a generated question only counts for the goal
let p = store.getProgress()
check('answers count for the goal', store.answeredToday(p) === 5)
check('wrong → mistake, retry ignored', p.q![a.id!].b === 0 && p.q![a.id!].w === 1)
check('right → box 2, with a hint → box 1', p.q![b.id!].b === 2 && p.q![c.id!].b === 1)
check('day counts as active', p.a!.at(-1) === T)
const mistakes = reviewIds(p.q, 'chyby'), due = reviewIds(p.q, 'dnes')
check('Sešit chyb has the wrong one', mistakes.length === 1 && mistakes[0] === a.id)
check('Dnešní opakování: mistakes first', due[0] === a.id && due.length === 1, JSON.stringify(due))
const round = reviewItems(mistakes, topics, 10)
check('review round finds the question in the content', round.length === 1 && round[0].id === a.id && round[0].index !== undefined)
check('review skips ids no longer in the content', reviewItems(['x/y/z#1', a.id!], topics, 10).length === 1)
store.answered(a.id, true, false, true); store.answered(a.id, true, false, true)
check('two right answers clear the mistake', reviewIds(store.getProgress().q, 'chyby').length === 0)

// ——— Goal ———
check('default goal', store.goalOf(store.getProgress()) === store.DEFAULT_GOAL)
store.setGoal(40)
check('goal set', store.goalOf(store.getProgress()) === 40)
store.setGoal(0)
check('goal off', store.goalOf(store.getProgress()) === 0)

// ——— Merge ———
p = store.getProgress()
const other = { v: 1 as const, t: {}, w: {}, q: { [a.id!]: { b: 0, d: T + 1, w: 3 }, 'z9/x/y#1': { b: 1, d: T, w: 1 } }, x: [T, 30] as [number, number], o: 10 }
const m = store.merge(p, other)
check('merge: later answer decides the box, mistakes as the max', m.q![a.id!].b === 0 && m.q![a.id!].w === 3)
check('merge: keeps questions of both', !!m.q!['z9/x/y#1'] && !!m.q![b.id!])
check('merge: today\'s count is the larger one', m.x![1] === 30)
check('merge: own goal wins', m.o === 0)
check('merge: older answer does not win', store.merge(other, p).q![a.id!].d === T + 1)

// ——— Size cap ———
store.answered('z1/x/wrong#1', false, false, true)
for (let i = 0; i < 4010; i++) store.answered(`z1/x/y#${i}`, true, false, true)
const kept = store.getProgress().q!
check('at most 4000 questions remembered, mistakes kept', Object.keys(kept).length === 4000 && !!kept['z1/x/wrong#1'] && !!kept['z1/x/y#4009'])

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
