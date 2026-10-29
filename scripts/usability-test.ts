// The rules behind Plán před písemkou, Ostrá simulace, the unfinished round, calendar reminders and profiles.
// npx tsx scripts/usability-test.ts
import type { Topic } from '../src/content/types'

// The modules live in the browser: a minimal localStorage, window events and location.
const mem = new Map<string, string>()
let assigned = ''
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, String(v)), removeItem: (k: string) => mem.delete(k) },
  addEventListener: () => {},
  location: { assign: (u: string) => { assigned = u }, reload: () => {} },
})
const store = await import('../src/progress/store')
const plan = await import('../src/progress/plan')
const { buildAreas, build } = await import('../src/quiz/engine')
const resume = await import('../src/progress/resume')
const cal = await import('../src/calendar')
const profiles = await import('../src/profiles')

let failed = 0
const check = (name: string, ok: boolean, detail = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` ${detail}`}`) }
const T = store.today()

// ——— Plán před písemkou ———
const keys = ['z5/m/a', 'z5/m/b', 'z5/m/c', 'z5/m/d', 'z5/m/e', 'z5/m/f']
const P = (d: number) => ({ n: 'Písemka', d, t: keys, u: 1 })
const tp = (l: number, ago: number) => ({ s: l, l, n: 1, d: T - ago })
check('state: new, weak, stale, ready', plan.topicState(undefined, T) === 'new' && plan.topicState(tp(60, 0), T) === 'weak'
  && plan.topicState(tp(90, 9), T) === 'stale' && plan.topicState(tp(80, 2), T) === 'ready')
let day = plan.planDay(P(T + 4), {}, T)
check('6 new topics, test in 4 days: 2 today (3 days to learn)', day.phase === 'learn' && day.today.length === 2 && day.today[0] === 'z5/m/a', JSON.stringify(day))
day = plan.planDay(P(T + 10), {}, T)
check('plenty of time: one a day at least', day.today.length === 1)
day = plan.planDay(P(T + 2), {}, T)
check('little time: at most 4 a day', day.today.length === 4)
day = plan.planDay(P(T + 4), { 'z5/m/a': tp(95, 0), 'z5/m/b': tp(50, 0) }, T)
check('practised today counts against the quota and is not offered again', day.doneToday.length === 2 && !day.today.length, JSON.stringify(day))
day = plan.planDay(P(T + 6), { 'z5/m/a': tp(40, 3), 'z5/m/b': tp(70, 2), 'z5/m/c': tp(90, 20), 'z5/m/d': tp(90, 1), 'z5/m/e': tp(90, 1), 'z5/m/f': tp(90, 1) }, T)
check('order: new, weakest, longest unpractised', JSON.stringify(day.today) === JSON.stringify(['z5/m/a']) && day.ready === 3, JSON.stringify(day))
check('phases: final the day before, exam on the day, past after', plan.planDay(P(T + 1), {}, T).phase === 'final' && plan.planDay(P(T), {}, T).phase === 'exam' && plan.planDay(P(T - 1), {}, T).phase === 'past')
check('final day still lists what is not ready', plan.planDay(P(T + 1), {}, T).today.length === 4)
check('exam day: nothing more to learn', plan.planDay(P(T), {}, T).today.length === 0)
const plans = { a: { ...P(T + 3), u: 5 }, b: { ...P(T - 5), u: 1 }, c: { ...P(T + 1), u: 1, x: 1 as const }, d: { ...P(T - 1), u: 1 } }
check('active plans: nearest first, no deleted, past only shortly', JSON.stringify(plan.activePlans(plans, T).map(([id]) => id)) === '["d","a"]')
const merged = plan.mergePlans({ a: { ...P(T + 3), n: 'old', u: 1 } }, { a: { ...P(T + 3), n: 'new', u: 2 }, b: P(T) })!
check('merge plans: newer wins, both kept', merged.a.n === 'new' && !!merged.b)
check('merge plans: a deletion wins when newer', plan.mergePlans({ a: { ...P(T), u: 1 } }, { a: { n: '', d: T, t: [], u: 3, x: 1 } })!.a.x === 1)
check('day of a date input and back', plan.isoOf(plan.dayOf('2026-11-06')) === '2026-11-06')
store.savePlan('p1', { n: 'Zlomky', d: T + 3, t: ['z7/matematika/zlomky-zaklad'] })
check('store: a plan is saved', store.getProgress().k?.p1.n === 'Zlomky')
const other = { v: 1 as const, t: {}, w: {}, k: { p2: { ...P(T + 2), u: Date.now() } } }
check('store merge keeps plans of both devices', !!store.merge(store.getProgress(), other).k?.p1 && !!store.merge(store.getProgress(), other).k?.p2)
store.deletePlan('p1')
check('store: deleting leaves a tombstone', store.getProgress().k?.p1.x === 1 && !plan.activePlans(store.getProgress().k, T).length)

// ——— Ostrá simulace: spread over the areas ———
const q = (i: number) => ({ type: 'truefalse' as const, question: `Q${i}`, answer: true })
const topic = (id: string, n: number): Topic => ({ id, title: id, emoji: '•', explanations: [], questions: Array.from({ length: n }, (_, i) => ({ ...q(i), question: `${id} ${i}` })) } as unknown as Topic)
const tps = [['g/s/a1', 20], ['g/s/a2', 20], ['g/s/b1', 2], ['g/s/c1', 30]].map(([k, n]) => ({ key: k as string, t: topic(k as string, n as number) }))
const items = buildAreas([['g/s/a1', 'g/s/a2'], ['g/s/b1'], ['g/s/c1']], tps, 30)
const per = (pre: string) => items.filter((x) => x.topic.startsWith(pre)).length
check('30 questions, no repeats', items.length === 30 && new Set(items.map((x) => x.id)).size === 30)
check('a short area gives its share to the others', per('g/s/b1') === 2 && per('g/s/a') === 14 && per('g/s/c1') === 14, `${per('g/s/a')}/${per('g/s/b1')}/${per('g/s/c1')}`)
check('inside an area spread over its topics', Math.abs(items.filter((x) => x.topic === 'g/s/a1').length - items.filter((x) => x.topic === 'g/s/a2').length) <= 1)
check('asked area by area', items.map((x) => x.topic[4]).join('').replace(/(.)\1*/g, '$1') === 'abc')
check('too few questions: all of them', buildAreas([['g/s/b1']], tps, 30).length === 2)
const multi = build('pisemka', tps)
check('a písemka of several topics spreads over them', new Set(multi.map((x) => x.topic)).size >= 3 && multi.length === 10)

// ——— The unfinished round ———
const ts = [{ key: 'g/s/a1', t: topic('g/s/a1', 5) }]
const qs = build('opakovani', ts).slice(0, 3)
const gen = { q: { type: 'input' as const, question: '2 + 2', answers: ['4'] }, topic: 'g/s/a1' }
const queue = [...qs, gen, qs[0]]
const packed = resume.packRound({ path: '/g/s/a1/opakovani', mode: 'opakovani', label: 'A1' }, queue, 5, queue.map((item, k) => ({ item, ok: k !== 0, hint: k === 2 })))
check('saved round: distinct questions, generated ones whole', packed.items.length === 4 && !!packed.items[3].q && packed.queue.join() === '0,1,2,3,0')
const back = resume.unpackRound(JSON.parse(JSON.stringify(packed)), ts)!
check('restored round: same questions and answers, repeats are the same item', back.queue.length === 5 && back.queue[0] === back.queue[4] && back.queue[0].id === qs[0].id && back.answers[2].hint && !back.answers[0].ok)
check('restored round: gone when a question changed', resume.unpackRound(packed, [{ key: 'g/s/a1', t: topic('g/s/a1', 0) }]) === undefined)
resume.saveRound(packed)
check('saved at its path only', !!resume.savedRoundAt('/g/s/a1/opakovani') && !resume.savedRoundAt('/jinde'))
resume.dropRound('/jinde')
check('dropping another path keeps it', !!resume.savedRound())
resume.saveRound({ ...packed, at: Date.now() - 8 * 86_400_000 })
check('older than a week is forgotten', !resume.savedRound())

// ——— Calendar ———
const daily = cal.dailyReminder('7:5', T)
check('daily reminder: valid calendar, CRLF, default time for a bad one', daily.startsWith('BEGIN:VCALENDAR\r\n') && daily.endsWith('END:VCALENDAR\r\n') && daily.includes('RRULE:FREQ=DAILY') && daily.includes('T170000'))
check('daily reminder: same UID each time (imported again it replaces itself)', daily.includes('UID:denni-opakovani@sprtam.cz'))
const long = cal.planCalendar('ab12', { n: 'Písemka; z češtiny, vyjmenovaná slova po B a L a ještě něco navíc, aby to bylo dlouhé', d: T + 3, t: [], u: 1 }, '18:30', T)
const lines = long.split('\r\n')
check('plan: daily until the day before, the test all day', long.includes(`RRULE:FREQ=DAILY;UNTIL=${plan.isoOf(T + 2).replace(/-/g, '')}T183000`) && long.includes(`DTSTART;VALUE=DATE:${plan.isoOf(T + 3).replace(/-/g, '')}`))
check('plan: text escaped', long.includes('Písemka\\; z češtiny\\,'))
check('lines folded at 75 bytes, never inside a character', lines.every((l) => new TextEncoder().encode(l).length <= 75) && !long.includes('�'))
check('plan for tomorrow: a reminder today only', cal.planCalendar('x', { n: 'X', d: T + 1, t: [], u: 1 }, '17:00', T).includes(`UNTIL=${plan.isoOf(T).replace(/-/g, '')}T170000`))
check('daily reminder: a UID per pupil', cal.dailyReminder('17:00', T, 'ab').includes('UID:denni-opakovani-ab@sprtam.cz'))
check('backslash escaped', cal.planCalendar('x', { n: 'A\\B', d: T, t: [], u: 1 }, '17:00', T).includes('SUMMARY:A\\\\B'))
check('plan for today: only the test', !cal.planCalendar('x', { n: 'X', d: T, t: [], u: 1 }, '17:00', T).includes('RRULE'))

// ——— Profiles ———
mem.clear()
mem.set('sprtam:progress', '{"v":1,"t":{"a":{"s":90,"n":1,"d":1}},"w":{}}')
mem.set('sprtam-obor', 'it')
mem.set('sprtam-theme', 'dark')
check('no profiles at first', profiles.getProfiles() === undefined)
profiles.addProfile('  Ben  ', '🐻', { n: '', e: '🦊' })
const r = profiles.getProfiles()!
check('first extra profile names the current one too', r.l.length === 2 && r.l[0].n === 'Já' && r.l[1].n === 'Ben' && r.a === r.l[0].id)
profiles.switchProfile(r.l[1].id)
check('switching parks the progress, the new one starts empty, settings stay', !mem.has('sprtam:progress') && !mem.has('sprtam-obor') && mem.get('sprtam-theme') === 'dark' && assigned === '/')
check('switching marks the new one active', profiles.getProfiles()!.a === r.l[1].id && mem.has(`sprtam:profile:${r.l[0].id}`) && !mem.has('sprtam:switching'))
const frozenNow = (await import('../src/progress/freeze')).frozen
check('nothing saves while switching (the page reloads)', frozenNow && (store.recordTopic('z1/x/y', 50), !mem.has('sprtam:progress')))
mem.set('sprtam:progress', '{"v":1,"t":{},"w":{"dog":3}}')
profiles.switchProfile(r.l[0].id)
check('switching back brings it back', JSON.parse(mem.get('sprtam:progress')!).t.a.s === 90 && mem.get('sprtam-obor') === 'it' && !mem.has(`sprtam:profile:${r.l[0].id}`))
check('…and parks the other one', JSON.parse(JSON.parse(mem.get(`sprtam:profile:${r.l[1].id}`)!)['sprtam:progress']).w.dog === 3)
profiles.removeProfile(r.l[0].id)
check('the active profile cannot be deleted', profiles.getProfiles()!.l.length === 2)
profiles.removeProfile(r.l[1].id)
check('deleting the last other one ends profiles, its data goes', profiles.getProfiles() === undefined && ![...mem.keys()].some((k) => k.startsWith('sprtam:profile:')) && JSON.parse(mem.get('sprtam:progress')!).t.a.s === 90)

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
