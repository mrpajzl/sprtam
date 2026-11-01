import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, gradeSubjects, subjectMeta, SUBJECTS, vocationalSubjects } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { Select } from '../../../src/ui/Select'
import { ApiError, get, post } from '../api'
import type { Me } from '../passkey'
import { go, nav } from '../router'
import { refreshIndex } from '../store'
import { gradeOptions, subjectOptions } from '../ui/filters'
import { Busy, Empty, I, toast } from '../ui/kit'

// Searching the text of every published topic (moderator/server/search.ts) – explanations, questions, options, answers
// and hints – and for moderators replacing it: the chosen topics become drafts (sent for review right away if asked),
// reviewed like any other change. Address: /hledat?q=…&rocnik=&predmet=&presne=1.

interface Hit { path: string; place: string; before: string; match: string; after: string }
interface Found { key: string; grade: GradeId; subject: SubjectId; id: string; title: string; emoji: string; hits: Hit[]; count: number }
interface Result { q: string; topics: Found[]; matches: number; truncated: boolean }
interface Done { key: string; title: string; draft: string | null; replaced: number; submitted: boolean; error: string | null }

const MAX = 50

function now() {
  const p = new URLSearchParams(location.search)
  const grade = p.get('rocnik'), subject = p.get('predmet')
  return {
    q: p.get('q') ?? '', exact: p.get('presne') === '1',
    grade: grade && grade in GRADE_NAME ? grade as GradeId : null,
    subject: subject && (subject in SUBJECTS || vocationalSubjects().includes(subject as SubjectId)) ? subject as SubjectId : null,
  }
}
export function searchHref(f: { q?: string; exact?: boolean; grade?: GradeId | null; subject?: SubjectId | null }) {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.grade) p.set('rocnik', f.grade)
  if (f.subject) p.set('predmet', f.subject)
  if (f.exact) p.set('presne', '1')
  return `/hledat${p.size ? `?${p}` : ''}`
}

export function Search({ me }: { me: Me | null }) {
  const f = now()
  const [text, setText] = useState(f.q)
  const [res, setRes] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [by, setBy] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [submit, setSubmit] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Done[] | null>(null)
  // Replacing is exact (case and diacritics count), so the search is exact too.
  const exact = f.exact || replacing
  const refilter = (c: Partial<ReturnType<typeof now>>) => go(searchHref({ ...f, ...c }), true)

  useEffect(() => {
    if (text.trim() === f.q) return
    const t = setTimeout(() => refilter({ q: text.trim() }), 350)
    return () => clearTimeout(t)
  }, [text])
  useEffect(() => {
    setDone(null)
    if ([...f.q].length < 2) { setRes(null); return }
    const p = new URLSearchParams({ q: f.q })
    if (f.grade) p.set('grade', f.grade)
    if (f.subject) p.set('subject', f.subject)
    if (exact) p.set('exact', '1')
    setLoading(true)
    get<Result>(`/api/search?${p}`).then((r) => { setRes(r); setPicked(new Set(r.topics.slice(0, MAX).map((t) => t.key))) }, (e) => toast(e.message, 'bad')).finally(() => setLoading(false))
  }, [location.search, exact])

  const subjects = f.grade ? gradeSubjects(f.grade) : [...Object.keys(SUBJECTS) as SubjectId[], ...vocationalSubjects()]
  // Replacing is exact: the text found loosely ("podle hlaseni") becomes the exact one in the topics ("podle hlášení").
  const startReplace = () => {
    if (replacing) { setReplacing(false); return }
    const m = !f.exact && res?.topics[0]?.hits[0]?.match
    if (m && m !== f.q) { setText(m); refilter({ q: m }) }
    setReplacing(true)
  }
  const toggle = (k: string) => setPicked((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const run = async () => {
    setBusy(true)
    try {
      const r = await post<{ results: Done[] }>('/api/replace', { find: f.q, replace: by, topics: [...picked], submit, note })
      setDone(r.results); refreshIndex()
      const ok = r.results.filter((x) => x.draft).length
      toast(ok ? `Hotovo: ${ok} ${ok === 1 ? 'návrh' : ok < 5 ? 'návrhy' : 'návrhů'}${submit ? ' ke kontrole' : ''}.` : 'Nic se nenahradilo.', ok ? 'ok' : 'bad')
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Nahrazení se nepovedlo.', 'bad') } finally { setBusy(false) }
  }

  return (
    <div class="page-narrow search-page">
      <h1>{replacing ? 'Najít a nahradit' : 'Hledat v učivu'}</h1>
      <p class="muted">Hledá v celém textu zveřejněných témat: ve výkladu, otázkách, možnostech, odpovědích i nápovědách. {exact ? 'Velká písmena a diakritika rozhodují.' : 'Na velkých písmenech a diakritice nezáleží.'}</p>
      <div class="q-filters">
        <label class="search grow"><I.search /><input type="search" value={text} onInput={(e) => setText(e.currentTarget.value)} placeholder="Co hledáš…" aria-label="Hledaný text" autoFocus /></label>
        <Select class="q-select" label="Ročník" value={f.grade ?? ''} options={gradeOptions} onChange={(v) => {
          const grade = (v || null) as GradeId | null
          refilter({ grade, subject: grade && f.subject && !gradeSubjects(grade).includes(f.subject) ? null : f.subject })
        }} />
        <Select class="q-select" label="Předmět" value={f.subject ?? ''} options={subjectOptions(subjects)} onChange={(v) => refilter({ subject: (v || null) as SubjectId | null })} />
        {!replacing && <label class="toggle"><input type="checkbox" checked={f.exact} onChange={(e) => refilter({ exact: e.currentTarget.checked })} />Přesně</label>}
        {me && <button class={`btn ${replacing ? 'on' : ''}`} aria-pressed={replacing} onClick={startReplace}><I.swap />Nahradit…</button>}
      </div>

      {replacing && me && (
        <div class="card plain replace-box">
          <label class="field"><span>Nahradit „{f.q || '…'}“ za</span><input value={by} onInput={(e) => setBy(e.currentTarget.value)} maxLength={200} placeholder="nový text (prázdné = smazat)" /></label>
          <label class="field"><span>Vzkaz pro kontrolu (nepovinné)</span><input value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={500} placeholder="Proč to měníš" /></label>
          <label class="toggle"><input type="checkbox" checked={submit} onChange={(e) => setSubmit(e.currentTarget.checked)} />Rovnou odeslat ke kontrole</label>
          <p class="fine">Každé vybrané téma se stane tvým návrhem (rozpracovaný návrh tématu se doplní). Zveřejní se, až ho schválí jiný moderátor. Najednou jde nejvýš {MAX} témat. Nahrazuje se jen text pro žáky, ne nastavení pomůcek.</p>
          <div class="actions-row">
            <Busy class="btn primary" on={busy} disabled={!res || !picked.size || picked.size > MAX || by === f.q || [...f.q].length < 2} onClick={run}><I.swap />Vytvořit návrhy · {picked.size}</Busy>
            {res && <button class="btn small" onClick={() => setPicked(new Set(res.topics.slice(0, MAX).map((t) => t.key)))}>Vybrat vše</button>}
            {res && <button class="btn small" onClick={() => setPicked(new Set())}>Nic</button>}
          </div>
          {picked.size > MAX && <p class="banner warn"><I.warn />Vybráno {picked.size} témat, najednou jde nejvýš {MAX}.</p>}
        </div>
      )}

      {done && (
        <section class="draft-group">
          <h2 class="label">Výsledek nahrazení</h2>
          <ul class="replace-done">
            {done.map((d) => (
              <li key={d.key} class={d.error && !d.draft ? 'bad' : ''}>
                <b>{d.title}</b> – {d.draft ? <>{d.replaced}× nahrazeno, {d.submitted ? 'odesláno ke kontrole' : 'uloženo jako návrh'} · <a href={d.submitted ? `/kontrola/${d.draft}` : `/navrh/${d.draft}`} onClick={nav(d.submitted ? `/kontrola/${d.draft}` : `/navrh/${d.draft}`)}>otevřít</a></> : null}
                {d.error && <span class="muted"> {d.error}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {[...f.q].length < 2 ? <p class="fine">Napiš aspoň 2 znaky.</p> : loading && !res ? <p class="muted">Hledám…</p> : res && !res.topics.length ? <Empty>Nic nenalezeno.{exact ? ' Hledá se přesně – napiš text i s velkými písmeny a diakritikou.' : ''}</Empty> : res && (
        <>
          <p class="fine">{res.matches} {res.matches === 1 ? 'výskyt' : res.matches < 5 ? 'výskyty' : 'výskytů'} v {res.topics.length}{res.truncated ? '+' : ''} tématech.</p>
          <div class="search-results">
            {res.topics.map((t) => (
              <article key={t.key} class="sr-topic">
                <header>
                  {replacing && <input type="checkbox" checked={picked.has(t.key)} onChange={() => toggle(t.key)} aria-label={`Nahradit v tématu ${t.title}`} />}
                  <a href={`/ucivo/${t.key}`} onClick={nav(`/ucivo/${t.key}`)}><span class="em">{t.emoji}</span><b>{t.title}</b></a>
                  <small>{GRADE_NAME[t.grade]} · {subjectMeta(t.subject)?.name ?? t.subject} · {t.count}×</small>
                </header>
                <ul>
                  {t.hits.map((h, i) => (
                    <li key={i}><small>{h.place}</small><span>{h.before}{replacing ? <><del>{h.match}</del><ins>{by}</ins></> : <mark>{h.match}</mark>}{h.after}</span></li>
                  ))}
                  {t.count > t.hits.length && <li class="fine">…a dalších {t.count - t.hits.length}</li>}
                </ul>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
