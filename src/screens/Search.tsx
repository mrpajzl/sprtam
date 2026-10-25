import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { GRADE_NAME, STAGES, SUBJECTS } from '../content/curriculum'
import { fold, loadTexts, searchTopics, useIndex, type Hit } from '../content/library'
import { stars, useProgress } from '../progress/store'
import { back, go, Link, query, setQuery } from '../router'
import { Stars } from '../ui/Bar'
import { SubjectKey, subjectStyle } from '../ui/glyphs'
import { IBack, IClose, ISearch } from '../ui/icons'
import { QrButton } from '../ui/QrShare'
import { useAsync } from '../ui/useAsync'
import { loadWordRefs, type WordRef } from '../vocab'
import { topicPath } from './Home'
import { PinButton } from './TopicScreen'

type Scope = 'all' | 'zs1' | 'zs2' | 'ss'
const SCOPES: [Scope, string][] = [['all', 'Vše'], ['zs1', '1.–5.'], ['zs2', '6.–9.'], ['ss', 'SŠ']]
const IDEAS = ['zlomky', 'vyjmenovaná slova', 'fotosyntéza', 'present simple', 'Karel IV.', 'Pythagorova věta', 'slovní druhy', 'atom']

/** Search across every grade, subject and topic, plus all English words. */
export function Search() {
  const p = useProgress()
  const all = useIndex()
  const text = useAsync(loadTexts, [])
  const words = useAsync(loadWordRefs, [])
  const [q, setQ] = useState(() => query().get('q') ?? '')
  const [scope, setScope] = useState<Scope>(() => (query().get('in') as Scope) || 'all')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { input.current?.focus() }, [])
  // Keep the query in the URL, so coming back from a topic restores the results.
  useEffect(() => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (scope !== 'all') qs.set('in', scope)
    setQuery(qs)
  }, [q, scope])

  const hits = useMemo(() => {
    if (!all) return []
    const grades = scope === 'all' ? null : STAGES.find((s) => s.id === scope)!.grades
    return searchTopics(q, all, text ?? undefined, p.g).filter((h) => !grades || grades.includes(h.ref.g))
  }, [q, all, text, scope])
  const vocab = useMemo(() => searchWords(q, words ?? []), [q, words])
  const term = q.trim()

  return (
    <div class="page search">
      <div class="search-bar">
        <button class="icon-btn" onClick={back} aria-label="Zpět"><IBack /></button>
        <label class="search-field">
          <ISearch />
          <input ref={input} type="search" enterkeyhint="search" autocomplete="off" spellcheck={false} placeholder="Hledat" aria-label="Hledat téma nebo slovíčko" value={q}
            onInput={(e) => setQ(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) go(topicPath(hits[0].ref)); if (e.key === 'Escape') q ? setQ('') : back() }} />
          {q && <button class="clear" onClick={() => { setQ(''); input.current?.focus() }} aria-label="Smazat"><IClose /></button>}
        </label>
        <QrButton />
      </div>

      <div class="chips scope" role="radiogroup" aria-label="Kde hledat">
        {SCOPES.map(([id, name]) => <button key={id} role="radio" aria-checked={scope === id} class={`chip ${scope === id ? 'sel' : ''}`} onClick={() => setScope(id)}>{name}</button>)}
      </div>

      {!term && (
        <div class="ideas">
          {IDEAS.map((x) => <button key={x} class="chip" onClick={() => setQ(x)}>{x}</button>)}
        </div>
      )}

      {term && all && (
        <>
          <div class="count" aria-live="polite">{hits.length === 60 ? '60+' : hits.length} {hits.length === 1 ? 'téma' : hits.length >= 2 && hits.length <= 4 ? 'témata' : 'témat'}</div>
          <div class="list">
            {hits.map((h) => <HitRow key={h.ref.key} h={h} q={term} st={stars(p.t[h.ref.key]?.s)} />)}
          </div>
          {vocab.length > 0 && (
            <>
              <h2 class="label">Slovíčka</h2>
              <div class="words">
                {vocab.map((w) => (
                  <Link key={w.level + w.en + w.cz} class="word" href={`/slovicka/${w.level}/${w.group}`}>
                    <span><Mark text={w.cz} q={term} /></span><b><Mark text={w.en} q={term} /></b><small>{w.level}</small>
                  </Link>
                ))}
              </div>
            </>
          )}
          {!hits.length && !vocab.length && <div class="empty">Nic jsme nenašli. Zkus jiné slovo.</div>}
        </>
      )}
    </div>
  )
}

function HitRow({ h, q, st }: { h: Hit; q: string; st: number }) {
  const r = h.ref
  return (
    <div class="hit" style={subjectStyle(r.s)}>
      <Link class="row" href={topicPath(r)}>
        <SubjectKey s={r.s} />
        <span class="txt">
          <b><Mark text={r.title} q={q} /></b>
          <small>{GRADE_NAME[r.g]} · {SUBJECTS[r.s].name}</small>
          {h.via && <small class="via"><Mark text={excerpt(h.via, q)} q={q} /></small>}
        </span>
        {st > 0 && <Stars n={st} />}
      </Link>
      <PinButton k={r.key} />
    </div>
  )
}

/** Highlights query words (diacritics-insensitive; folding keeps string length). */
function Mark({ text, q }: { text: string; q: string }) {
  const f = fold(text)
  const marks = new Array<boolean>(text.length).fill(false)
  for (const w of fold(q).split(/[\s,]+/).filter(Boolean)) {
    for (let i = f.indexOf(w); i >= 0; i = f.indexOf(w, i + 1)) marks.fill(true, i, i + w.length)
  }
  if (f.length !== text.length) return <>{text}</>
  const out: preact.JSX.Element[] = []
  let i = 0
  while (i < text.length) {
    let j = i
    while (j < text.length && marks[j] === marks[i]) j++
    out.push(marks[i] ? <mark key={i}>{text.slice(i, j)}</mark> : <span key={i}>{text.slice(i, j)}</span>)
    i = j
  }
  return <>{out}</>
}

/** About 90 characters of a line, around the first matching query word. */
function excerpt(line: string, q: string, max = 90) {
  if (line.length <= max) return line
  const f = fold(line)
  const at = Math.min(...fold(q).split(/[\s,]+/).filter(Boolean).map((w) => f.indexOf(w)).filter((i) => i >= 0), line.length)
  const start = at > max - 30 ? Math.max(0, Math.min(at - 30, line.length - max)) : 0
  return `${start ? '…' : ''}${line.slice(start, start + max).trim()}${start + max < line.length ? '…' : ''}`
}

function searchWords(q: string, words: WordRef[]): WordRef[] {
  const w = fold(q.trim())
  if (w.length < 2) return []
  const scored = words.flatMap((x) => {
    const cz = fold(x.cz), en = x.en.toLowerCase()
    const s = cz === w || en === w ? 3 : cz.startsWith(w) || en.startsWith(w) ? 2 : cz.includes(w) || en.includes(w) ? 1 : 0
    return s ? [{ x, s }] : []
  })
  return scored.sort((a, b) => b.s - a.s).slice(0, 8).map((s) => s.x)
}
