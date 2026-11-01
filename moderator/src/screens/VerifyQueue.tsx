import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, gradeSubjects, subjectMeta, SUBJECTS, vocationalSubjects } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { Select } from '../../../src/ui/Select'
import { get } from '../api'
import { release, take, untilText, type Claim } from '../claims'
import type { Me } from '../passkey'
import { go, nav } from '../router'
import { gradeOptions, subjectOptions } from '../ui/filters'
import { step, useKeys, KeysHint } from '../ui/keys'
import { Empty, I, toast } from '../ui/kit'

// The queue of unverified topics (moderator/server/verify.ts): what I took or started first, then my subjects (from my
// profile), then topics pupils reported mistakes in. "Beru si to" tells the others I am checking a topic.
// Filters in the address: /overovani?rocnik=z6&predmet=matematika&vse=1 (vse = not only my subjects).

interface Row { key: string; grade: GradeId; subject: SubjectId; id: string; title: string; emoji: string; reports: number; claim: Claim | null; progress: { done: number; total: number } | null; mySubject: boolean }
interface Queue { topics: Row[]; total: number; mySubjects: string[] }
interface Filter { grade: GradeId | null; subject: SubjectId | null; all: boolean }

export function verifyHref(f: Partial<Filter> = {}) {
  const q = new URLSearchParams()
  if (f.grade) q.set('rocnik', f.grade)
  if (f.subject) q.set('predmet', f.subject)
  if (f.all) q.set('vse', '1')
  return `/overovani${q.size ? `?${q}` : ''}`
}
function now(): Filter {
  const q = new URLSearchParams(location.search)
  const grade = q.get('rocnik'), subject = q.get('predmet')
  return { grade: grade && grade in GRADE_NAME ? grade as GradeId : null, subject: subject && (subject in SUBJECTS || vocationalSubjects().includes(subject as SubjectId)) ? subject as SubjectId : null, all: q.get('vse') === '1' }
}

export function VerifyQueue({ me }: { me: Me }) {
  const f = now()
  const [q, setQ] = useState<Queue | null>(null)
  const [cur, setCur] = useState(-1)
  const [shown, setShown] = useState(60)
  const key = location.search
  const load = () => {
    const p = new URLSearchParams()
    if (f.grade) p.set('grade', f.grade)
    if (f.subject) p.set('subject', f.subject)
    // Only my subjects, unless I want everything or have not said which subjects are mine.
    get<Queue>(`/api/verify/queue?${p}`).then((all) => {
      if (f.all || !all.mySubjects.length) return setQ(all)
      setQ({ ...all, topics: all.topics.filter((t) => t.mySubject || t.claim?.userId === me.id || t.progress) })
    }, (e) => toast(e.message, 'bad'))
  }
  useEffect(() => { setQ(null); setCur(-1); load() }, [key])
  const refilter = (c: Partial<Filter>) => go(verifyHref({ ...f, ...c }), true)
  const subjects = f.grade ? gradeSubjects(f.grade) : [...Object.keys(SUBJECTS) as SubjectId[], ...vocationalSubjects()]
  const list = q?.topics ?? []
  const toggle = async (t: Row) => { if (t.claim?.userId === me.id) await release('topic', t.key); else await take('topic', t.key); load() }
  const help = useKeys([
    { key: 'j', label: 'Další téma', run: () => { const k = step(list, cur, 1); if (k >= shown) setShown(k + 1); setCur(k) } },
    { key: 'k', label: 'Předchozí téma', run: () => setCur(step(list, cur, -1)) },
    { key: 'o', label: 'Otevřít téma a ověřovat', when: cur >= 0, run: () => go(`/ucivo/${list[cur].key}`) },
    { key: 'b', label: 'Beru si to / uvolnit', when: cur >= 0, run: () => toggle(list[cur]) },
  ], 'Zkratky ve frontě ověřování')
  useEffect(() => { if (cur >= 0) document.getElementById(`vq-${cur}`)?.scrollIntoView({ block: 'nearest' }) }, [cur])

  const mineOnly = !f.all && !!q?.mySubjects.length
  return (
    <div class="page-narrow">
      <div class="row-head">
        <h1>Ověřování{q ? ` · ${list.length}` : ''}</h1>
        <a class="btn" href="/pokryti" onClick={nav('/pokryti')}><I.chart />Přehled pokrytí</a>
      </div>
      <p class="muted">
        Témata, která připravila AI nebo se změnila bez kontroly. Děti je v aplikaci vidí s poznámkou „čeká na kontrolu člověkem“. Nahoře je, co sis vzal/a nebo
        rozpracoval/a, pak {q?.mySubjects.length ? 'tvoje předměty' : 'předměty'} a témata, ke kterým žáci hlásí chyby. <b>Beru si to</b> řekne ostatním, že téma kontroluješ (na 2 dny).
      </p>
      <div class="q-filters">
        <Select class="q-select" label="Ročník" value={f.grade ?? ''} options={gradeOptions} onChange={(v) => {
          const grade = (v || null) as GradeId | null
          refilter({ grade, subject: grade && f.subject && !gradeSubjects(grade).includes(f.subject) ? null : f.subject })
        }} />
        <Select class="q-select" label="Předmět" value={f.subject ?? ''} options={subjectOptions(subjects)} onChange={(v) => refilter({ subject: (v || null) as SubjectId | null })} />
        {q && (q.mySubjects.length
          ? <label class="toggle"><input type="checkbox" checked={mineOnly} onChange={(e) => refilter({ all: !e.currentTarget.checked })} />Jen moje předměty</label>
          : <a class="fine" href="/ucet" onClick={nav('/ucet')}>Nastav si v profilu svoje předměty – budou nahoře</a>)}
      </div>
      <KeysHint />
      {!q ? <p class="muted">Načítám…</p> : !list.length ? (
        <Empty>{mineOnly ? <>Ve tvých předmětech nic neověřeného není. <a href={verifyHref({ ...f, all: true })} onClick={nav(verifyHref({ ...f, all: true }))}>Ukázat všechny předměty</a></> : 'Všechno je ověřené. 🎉'}</Empty>
      ) : (
        <div class="topics vq">
          {list.slice(0, shown).map((t, i) => {
            const href = `/ucivo/${t.key}`
            const mine = t.claim?.userId === me.id
            return (
              <div key={t.key} id={`vq-${i}`} class={`topic vq-row ${cur === i ? 'cur' : ''}`}>
                <a class="vq-link" href={href} onClick={nav(href)}>
                  <span class="em">{t.emoji}</span>
                  <span class="t"><b>{t.title}</b><small>{GRADE_NAME[t.grade]} · {subjectMeta(t.subject)?.name ?? t.subject}</small></span>
                </a>
                {t.reports > 0 && <span class="pill warn" title="Otevřená hlášení od žáků">{t.reports} {t.reports === 1 ? 'hlášení' : 'hlášení'}</span>}
                {t.progress && <span class="pill" title="Kolik částí jsi už prošel/a">prošel/a jsi {t.progress.done}/{t.progress.total}</span>}
                {t.claim && !mine && <span class="pill" title={`do ${untilText(t.claim.until)}`}><I.flag />bere si {t.claim.name}</span>}
                {(!t.claim || mine) && <button class={`btn small ${mine ? 'on' : ''}`} onClick={() => toggle(t)} aria-pressed={mine} title={mine ? `Zamluveno do ${untilText(t.claim!.until)} – klikni pro uvolnění` : 'Řekni ostatním, že téma kontroluješ'}><I.flag />{mine ? 'Moje' : 'Beru si to'}</button>}
                <a class="btn small primary" href={href} onClick={nav(href)}>Ověřovat</a>
              </div>
            )
          })}
          {list.length > shown && <button class="btn" onClick={() => setShown(shown + 100)}>Ukázat další ({list.length - shown})</button>}
          {q.total > list.length && !mineOnly && <p class="fine">Server poslal prvních {list.length} z {q.total}. Zúži výběr ročníkem nebo předmětem.</p>}
        </div>
      )}
      {help}
    </div>
  )
}
