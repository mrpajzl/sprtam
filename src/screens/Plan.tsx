import { useState } from 'preact/hooks'
import { cleanTime, planCalendar, saveCalendar } from '../calendar'
import { hasSubject, loadTopic } from '../content'
import { GRADE_NAME, gradeSubjects, GRADES, subjectMeta } from '../content/curriculum'
import { loadIndex, refFor, useIndex, type TopicRef } from '../content/library'
import type { GradeId, Topic } from '../content/types'
import { activePlans, dayName, dayOf, isoOf, planDay, type Plan, type PlanDay, type TopicState } from '../progress/plan'
import { deletePlan, newPlanId, savePlan, stars, today, useProgress, type Progress } from '../progress/store'
import { MODES } from '../quiz/engine'
import { go, Link, query } from '../router'
import { useTitle } from '../seo'
import { Bar, Meter, Stars } from '../ui/Bar'
import { keyStyle, SubjectKey, subjectStyle } from '../ui/glyphs'
import { IArrow, ICalendar, ICheck, IPencil, IPrint } from '../ui/icons'
import { Mascot } from '../ui/Mascot'
import { useAsync } from '../ui/useAsync'
import { Quiz } from './Quiz'
import { Worksheet } from './Worksheet'

// Plán před písemkou (progress/plan.ts):
//   /plan               the plans and a new one
//   /plan/novy          a new plan (?tema=<key> picks that topic)
//   /plan/<id>          the plan: what to practise today, every topic and how ready it is
//   /plan/<id>/upravit  change it
//   /plan/<id>/pisemka  a practice test of all its topics
//   /plan/<id>/tisk     a worksheet of all its topics

export const PLAN_PATH = '/plan'
const STYLE = keyStyle('yellow')
const topicPath = (r: TopicRef) => `/g/${r.g}/${r.s}/${r.id}`
const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

/** „za 3 dny“, „zítra“, „dnes“, „před 2 dny“ */
export function whenText(left: number) {
  if (left === 0) return 'dnes'
  if (left === 1) return 'zítra'
  if (left > 1) return `za ${left} ${plural(left, 'den', 'dny', 'dní')}`
  return left === -1 ? 'včera' : `před ${-left} ${plural(-left, 'dnem', 'dny', 'dny')}`
}

const STATE: Record<TopicState, [string, string]> = {
  new: ['nové', 'Ještě jsi neprocvičoval'],
  weak: ['procvičit', 'Minule pod 75 %'],
  stale: ['zopakovat', 'Umíš, ale už je to přes týden'],
  ready: ['umíš', 'Minule aspoň 75 % a nedávno'],
}

export function PlanRoute({ id, sub }: { id?: string; sub?: string }) {
  const p = useProgress()
  if (!id) return <PlanList p={p} />
  if (id === 'novy') return <PlanEditor />
  const plan = p.k?.[id]
  if (!plan || plan.x) return <div class="page" style={STYLE}><Bar title="Plán" /><div class="empty">Tenhle plán tu není. Možná byl smazaný nebo je na jiném zařízení.<Link class="btn" href={PLAN_PATH}>Plány</Link></div></div>
  if (sub === 'upravit') return <PlanEditor id={id} plan={plan} />
  if (sub === 'pisemka') return <PlanQuiz plan={plan} />
  if (sub === 'tisk') return <PlanWorksheet plan={plan} />
  return <PlanDetail id={id} plan={plan} p={p} />
}

/** Is the route full-screen (practice, printing)? */
export const planFullScreen = (sub?: string) => sub === 'pisemka' || sub === 'tisk'

function PlanList({ p }: { p: Progress }) {
  useTitle('Plán před písemkou')
  const now = today()
  const plans = activePlans(p.k, now)
  return (
    <div class="page" style={STYLE}>
      <Bar title="📅 Plán před písemkou" />
      <div class="blocks approach-about">
        <p>Vyber témata a den písemky. Šprtám ti opakování rozvrhne do zbývajících dní: každý den ukáže, co procvičit, a den předem tě nechá napsat cvičnou písemku.</p>
      </div>
      {plans.length > 0 && <div class="list">{plans.map(([id, plan]) => <PlanRow key={id} id={id} plan={plan} day={planDay(plan, p.t, now)} />)}</div>}
      <Link class="btn block plan-add" href={`${PLAN_PATH}/novy`}>Nový plán</Link>
    </div>
  )
}

/** A plan as a row (the list, the home screen). */
export function PlanRow({ id, plan, day }: { id: string; plan: Plan; day: PlanDay }) {
  const todo = day.today.length
  const what = day.phase === 'learn' ? (todo ? `dnes ${todo} ${plural(todo, 'téma', 'témata', 'témat')}` : 'na dnešek hotovo')
    : day.phase === 'final' ? 'cvičná písemka' : day.phase === 'exam' ? 'hodně štěstí!' : 'jak to dopadlo?'
  return (
    <Link class="row rec plan-row" style={STYLE} href={`${PLAN_PATH}/${id}`}>
      <span class="skey m"><ICalendar /></span>
      <span class="txt"><b>{plan.n}</b><small>{whenText(day.left)} · {what}</small></span>
      <Meter pct={plan.t.length ? (day.ready / plan.t.length) * 100 : 0} n={5} />
    </Link>
  )
}

function PlanDetail({ id, plan, p }: { id: string; plan: Plan; p: Progress }) {
  useTitle(plan.n)
  const all = useIndex()
  const now = today()
  const day = planDay(plan, p.t, now)
  const [time, setTime] = useState('17:00')
  const [sure, setSure] = useState(false)
  const ref = (k: string) => (all ? refFor(k) : undefined)
  const row = (k: string, done?: boolean) => {
    const r = ref(k)
    if (!r) return null
    const st = day.states[k]
    return (
      <Link key={k} class="row rec" style={subjectStyle(r.s)} href={topicPath(r)}>
        <SubjectKey s={r.s} />
        <span class="txt"><b>{r.title}</b><small>{GRADE_NAME[r.g]} · {subjectMeta(r.s).name}</small></span>
        {done ? <span class="tag plan-done" title="Dnes procvičeno"><ICheck /></span> : <span class={`tag plan-${st}`} title={STATE[st][1]}>{STATE[st][0]}</span>}
      </Link>
    )
  }
  return (
    <div class="page" style={STYLE}>
      <Bar title={plan.n} crumbs={[{ href: PLAN_PATH, label: 'Plán před písemkou' }]} right={<Link class="icon-btn" href={`${PLAN_PATH}/${id}/upravit`} aria-label="Upravit plán"><IPencil /></Link>} />
      <div class="plan-head">
        <div><b>{whenText(day.left)}</b><small>{dayName(plan.d)}</small></div>
        <div class="plan-ready"><Meter pct={plan.t.length ? (day.ready / plan.t.length) * 100 : 0} n={10} /><small>umíš {day.ready} z {plan.t.length}</small></div>
      </div>

      {day.phase === 'learn' && (
        <section class="sec">
          <h2 class="label">Dnes procvič</h2>
          {day.today.length + day.doneToday.length > 0 ? <div class="list">{day.today.map((k) => row(k))}{day.doneToday.map((k) => row(k, true))}</div> : null}
          {!day.today.length && <div class="slot plan-slot"><Mascot mood="happy" size={44} /><span>{day.ready === plan.t.length ? 'Všechno umíš. Do písemky si témata občas zopakuj.' : 'Na dnešek máš hotovo. Zítra tu bude další várka.'}</span></div>}
        </section>
      )}
      {day.phase === 'final' && (
        <section class="sec">
          <h2 class="label">Zítra píšeš</h2>
          <p class="plan-say">Zkus si cvičnou písemku ze všech témat. Co nepůjde, ještě dnes zopakuj.</p>
          {day.today.length > 0 && <div class="list">{day.today.map((k) => row(k))}</div>}
        </section>
      )}
      {day.phase === 'exam' && <div class="slot plan-slot"><Mascot mood="wow" size={44} /><span>Dnes píšeš. Hodně štěstí! Na rozehřátí stačí pár otázek z cvičné písemky.</span></div>}
      {day.phase === 'past' && <div class="slot plan-slot"><Mascot mood="happy" size={44} /><span>Písemka je za tebou. Plán z úvodní obrazovky za pár dní zmizí sám, nebo ho smaž.</span></div>}

      <Link class="row test-key" href={`${PLAN_PATH}/${id}/pisemka`} rel="nofollow">
        <span class="skey m"><IPencil /></span>
        <span class="txt"><b>Cvičná písemka</b><small>{MODES.pisemka.count} otázek ze všech témat, známka</small></span>
        <IArrow />
      </Link>

      <h2 class="label next-label">Všechna témata</h2>
      <div class="list">{plan.t.map((k) => row(k))}</div>

      <h2 class="label next-label">Připomínat v kalendáři</h2>
      <div class="plan-cal">
        <label>Každý den v <input type="time" value={time} onInput={(e) => setTime(e.currentTarget.value)} /></label>
        <button class="btn" onClick={() => saveCalendar(`sprtam-${id}`, planCalendar(id, plan, cleanTime(time), now))}><ICalendar />Přidat do kalendáře</button>
      </div>
      <p class="muted note">Stáhne se soubor do kalendáře: připomínka každý den do písemky a písemka sama. Vznikne v zařízení, nic se nikam neposílá. Zrušíš ji v kalendáři.</p>

      <div class="list next-list">
        <Link class="row print-key" href={`${PLAN_PATH}/${id}/tisk`} rel="nofollow"><IPrint /><span class="txt"><b>Pracovní list</b><small>ze všech témat, k vytištění</small></span><IArrow /></Link>
      </div>
      {sure ? (
        <div class="sim-sure plan-delete"><span>Smazat plán „{plan.n}“? Pokrok v tématech zůstane.</span><div class="self"><button class="btn ghost" onClick={() => setSure(false)}>Nechat</button><button class="btn" onClick={() => { deletePlan(id); go(PLAN_PATH, true) }}>Smazat</button></div></div>
      ) : <button class="btn ghost block plan-delete" onClick={() => setSure(true)}>Smazat plán</button>}
    </div>
  )
}

function PlanEditor({ id, plan }: { id?: string; plan?: Plan }) {
  const all = useIndex()
  useTitle(plan ? `Upravit: ${plan.n}` : 'Nový plán')
  // The editor starts at the grade and subject of the first topic: wait for the index that knows them.
  return all ? <Editor id={id} plan={plan} all={all} /> : <div class="page" style={STYLE} />
}

function Editor({ id, plan, all }: { id?: string; plan?: Plan; all: TopicRef[] }) {
  const p = useProgress()
  const first = query().get('tema')
  const from = first ? refFor(first) : undefined
  const now = today()
  const [name, setName] = useState(plan?.n ?? '')
  const [date, setDate] = useState(isoOf(plan?.d ?? now + 7))
  const [picked, setPicked] = useState<string[]>(plan?.t ?? (first ? [first] : []))
  const start = plan?.t[0] ? refFor(plan.t[0]) : from
  const [g, setG] = useState<GradeId>(start?.g ?? p.g ?? 'z5')
  const subjects = gradeSubjects(g).filter((s) => hasSubject(g, s))
  const [s, setS] = useState(start?.s ?? subjects[0])
  const subject = subjects.includes(s) ? s : subjects[0]
  const topics = all.filter((r) => r.g === g && r.s === subject && !r.approach)
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? dayOf(date) : NaN
  const others = picked.filter((k) => !topics.some((r) => r.key === k))
  const problem = !picked.length ? 'Vyber aspoň jedno téma.' : !(day >= now) ? 'Den písemky musí být dnes nebo později.' : ''
  const toggle = (k: string) => setPicked(picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k])
  const save = () => {
    if (problem) return
    const pid = id ?? newPlanId()
    const firstRef = refFor(picked[0])
    savePlan(pid, { n: name.trim().slice(0, 60) || `Písemka${firstRef ? ` · ${subjectMeta(firstRef.s).name}` : ''}`, d: day, t: picked })
    go(`${PLAN_PATH}/${pid}`, true)
  }
  return (
    <div class="page plan-editor" style={STYLE}>
      <Bar title={plan ? 'Upravit plán' : 'Nový plán'} crumbs={[{ href: PLAN_PATH, label: 'Plán před písemkou' }]} />
      <label class="field"><span>Co píšeš</span><input value={name} maxLength={60} placeholder="Písemka ze zlomků" onInput={(e) => setName(e.currentTarget.value)} /></label>
      <label class="field"><span>Kdy</span><input type="date" value={date} min={isoOf(now)} onInput={(e) => setDate(e.currentTarget.value)} /></label>
      <h2 class="label next-label">Témata · vybráno {picked.length}</h2>
      <div class="plan-pick">
        <label class="field"><span>Ročník</span>
          <select value={g} onChange={(e) => setG(e.currentTarget.value as GradeId)}>
            {GRADES.map((x) => <option key={x} value={x}>{GRADE_NAME[x]}</option>)}
          </select>
        </label>
        <label class="field"><span>Předmět</span>
          <select value={subject} onChange={(e) => setS(e.currentTarget.value)}>
            {subjects.map((x) => <option key={x} value={x}>{subjectMeta(x).name}</option>)}
          </select>
        </label>
      </div>
      <div class="list plan-topics">
        {topics.map((r) => {
          const on = picked.includes(r.key)
          return (
            <button key={r.key} class={`row choice ${on ? 'on' : ''}`} role="checkbox" aria-checked={on} onClick={() => toggle(r.key)}>
              <span class="em">{r.emoji}</span>
              <span class="txt"><b>{r.title}</b></span>
              <Stars n={stars(p.t[r.key]?.s)} />
              <span class="tick" aria-hidden="true">{on && <ICheck />}</span>
            </button>
          )
        })}
        {!topics.length && <p class="muted">Tady zatím nejsou témata.</p>}
      </div>
      {others.length > 0 && (
        <>
          <h2 class="label next-label">Vybráno jinde</h2>
          <div class="list">
            {others.map((k) => {
              const r = refFor(k)
              return (
                <button key={k} class="row choice on" role="checkbox" aria-checked onClick={() => toggle(k)}>
                  <span class="txt"><b>{r?.title ?? k}</b>{r && <small>{GRADE_NAME[r.g]} · {subjectMeta(r.s).name}</small>}</span>
                  <span class="tick" aria-hidden="true"><ICheck /></span>
                </button>
              )
            })}
          </div>
        </>
      )}
      <div class="plan-save">
        {problem && <p class="muted">{problem}</p>}
        <button class="btn block" disabled={!!problem} onClick={save}>{plan ? 'Uložit' : 'Vytvořit plán'}</button>
      </div>
    </div>
  )
}

async function loadTopics(keys: string[]): Promise<{ key: string; t: Topic }[]> {
  await loadIndex()
  const refs = keys.flatMap((k) => refFor(k) ?? [])
  const loaded = await Promise.all(refs.map((r) => loadTopic(r.g, r.s, r.id).catch(() => null)))
  return refs.flatMap((r, i) => (loaded[i] ? [{ key: r.key, t: loaded[i]! }] : []))
}

function PlanQuiz({ plan }: { plan: Plan }) {
  useTitle(`Cvičná písemka: ${plan.n}`)
  const topics = useAsync(() => loadTopics(plan.t), [plan.t.join()])
  if (!topics) return <div class="page" />
  return <div style={STYLE}><Quiz mode="pisemka" topics={topics} label={plan.n} /></div>
}

function PlanWorksheet({ plan }: { plan: Plan }) {
  useTitle(`Pracovní list: ${plan.n}`)
  const topics = useAsync(() => loadTopics(plan.t), [plan.t.join()])
  if (!topics) return <div class="page" />
  return <div style={STYLE}><Worksheet title={plan.n} sub={`${dayName(plan.d)} · ${topics.length} ${plural(topics.length, 'téma', 'témata', 'témat')}`} topics={topics.map((x) => x.t)} /></div>
}
