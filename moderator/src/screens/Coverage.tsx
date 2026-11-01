import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, ODB, STAGES, subjectMeta } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { SubjectGlyph } from '../../../src/ui/glyphs'
import { get } from '../api'
import { nav } from '../router'
import { reportsHref } from './Reports'
import { queueHref } from './Review'
import { verifyHref } from './VerifyQueue'
import { I, toast } from '../ui/kit'

// How far the content is (moderator/server/work.ts coverage): per grade and subject how many topics a person checked,
// open reports from pupils, changes in progress and topics someone is checking. Shows where help is needed.

interface Row { grade: GradeId; subject: SubjectId; topics: number; verified: number; reports: number; drafts: number; claimed: number }

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0)

export function Coverage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [sort, setSort] = useState<'order' | 'least'>('order')
  useEffect(() => { get<Row[]>('/api/coverage').then(setRows, (e) => toast(e.message, 'bad')) }, [])
  if (!rows) return <div class="page-narrow"><h1>Přehled pokrytí</h1><p class="muted">Načítám…</p></div>
  const sum = (k: keyof Row) => rows.reduce((n, r) => n + (r[k] as number), 0)
  const total = sum('topics'), verified = sum('verified')
  const groups = [...STAGES.map((st) => ({ name: st.name, grades: st.grades as GradeId[] })), { name: GRADE_NAME[ODB], grades: [ODB] as GradeId[] }]
  const line = (r: Row) => {
    const p = pct(r.verified, r.topics)
    return (
      <tr key={`${r.grade}/${r.subject}`}>
        <th scope="row"><a href={verifyHref({ grade: r.grade, subject: r.subject, all: true })} onClick={nav(verifyHref({ grade: r.grade, subject: r.subject, all: true }))}><SubjectGlyph s={r.subject} />{subjectMeta(r.subject)?.name ?? r.subject}</a>{sort === 'least' && <small> · {GRADE_NAME[r.grade]}</small>}</th>
        <td class="num">{r.topics}</td>
        <td><div class="cov-bar"><span class="meter" role="img" aria-label={`ověřeno ${p} %`}><i style={{ width: `${p}%` }} /></span><span class="num">{r.verified} · {p} %</span></div></td>
        <td class="num">{r.reports ? <a href={reportsHref('open', { grade: r.grade, subject: r.subject })} onClick={nav(reportsHref('open', { grade: r.grade, subject: r.subject }))}>{r.reports}</a> : <span class="muted">–</span>}</td>
        <td class="num">{r.drafts ? <a href={queueHref('open', { grade: r.grade, subject: r.subject })} onClick={nav(queueHref('open', { grade: r.grade, subject: r.subject }))}>{r.drafts}</a> : <span class="muted">–</span>}</td>
        <td class="num">{r.claimed || <span class="muted">–</span>}</td>
      </tr>
    )
  }
  const head = <thead><tr><th>Předmět</th><th class="num">Témat</th><th>Ověřeno člověkem</th><th class="num">Hlášení</th><th class="num">Rozpracováno</th><th class="num">Kontroluje se</th></tr></thead>
  return (
    <div class="page-narrow coverage">
      <div class="row-head">
        <h1>Přehled pokrytí</h1>
        <a class="btn primary" href="/overovani" onClick={nav('/overovani')}><I.check />Ověřovat</a>
      </div>
      <div class="stat-tiles">
        <div><b>{pct(verified, total)} %</b><small>ověřeno ({verified} z {total} témat)</small></div>
        <div><b>{sum('reports')}</b><small>otevřených hlášení</small></div>
        <div><b>{sum('drafts')}</b><small>rozpracovaných změn</small></div>
        <div><b>{sum('claimed')}</b><small>témat právě někdo kontroluje</small></div>
      </div>
      <div class="q-filters">
        <nav class="seg-tabs" aria-label="Řazení">
          <button class={sort === 'order' ? 'on' : ''} aria-pressed={sort === 'order'} onClick={() => setSort('order')}>Podle ročníků</button>
          <button class={sort === 'least' ? 'on' : ''} aria-pressed={sort === 'least'} onClick={() => setSort('least')}>Nejméně ověřené</button>
        </nav>
      </div>
      {sort === 'least' ? (
        <div class="audit"><table>{head}<tbody>{[...rows].sort((a, b) => pct(a.verified, a.topics) - pct(b.verified, b.topics) || b.topics - a.topics).map(line)}</tbody></table></div>
      ) : groups.map((gr) => gr.grades.filter((g) => rows.some((r) => r.grade === g)).map((g) => (
        <section key={g} class="cov-grade">
          <h2 class="label">{GRADE_NAME[g]}{gr.grades.length > 1 ? ` · ${gr.name}` : ''}</h2>
          <div class="audit"><table>{head}<tbody>{rows.filter((r) => r.grade === g).map(line)}</tbody></table></div>
        </section>
      )))}
      <p class="fine">Klik na předmět otevře jeho neověřená témata, na číslo hlášení nebo změn příslušný seznam.</p>
    </div>
  )
}
