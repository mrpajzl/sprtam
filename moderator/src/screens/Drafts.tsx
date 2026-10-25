import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, SUBJECTS } from '../../../src/content/curriculum'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { ApiError, api, get } from '../api'
import type { Me } from '../passkey'
import { go, nav } from '../router'
import { refreshIndex, STATUS, type DraftView } from '../store'
import { ago, Empty, I, toast } from '../ui/kit'
import { editTopic } from './Library'

export function Drafts({ me }: { me: Me }) {
  const [everyone, setEveryone] = useState(false)
  const [list, setList] = useState<DraftView[] | null>(null)
  const load = () => get<DraftView[]>(`/api/drafts${everyone ? '?all=1' : ''}`).then(setList, (e) => toast(e.message, 'bad'))
  useEffect(() => { setList(null); load() }, [everyone])

  const remove = async (d: DraftView) => {
    if (!confirm(`Smazat rozpracovaný návrh „${d.title}“? Tohle nejde vrátit.`)) return
    try { await api('DELETE', `/api/drafts/${d.id}`); refreshIndex(); load(); toast('Návrh smazán') } catch (e) { toast(e instanceof ApiError ? e.message : 'Smazání se nepovedlo.', 'bad') }
  }

  const groups: [string, DraftView[]][] = list ? [
    ['Rozpracované', list.filter((d) => d.status === 'draft' || (d.status === 'submitted' && d.unsent))],
    ['Čekají na schválení', list.filter((d) => d.status === 'submitted' && !d.unsent)],
    ['Vyřízené', list.filter((d) => d.status === 'merged' || d.status === 'closed')],
  ] : []

  return (
    <div class="page-narrow">
      <div class="row-head">
        <h1>{everyone ? 'Všechny návrhy' : 'Moje návrhy'}</h1>
        {me.role === 'admin' && <label class="toggle"><input type="checkbox" checked={everyone} onChange={(e) => setEveryone(e.currentTarget.checked)} />Všech moderátorů</label>}
      </div>
      {!list ? <p class="muted">Načítám…</p> : !list.length ? (
        <Empty>Zatím žádné návrhy. <a href="/" onClick={nav('/')}>Vyber téma v učivu</a> a začni upravovat.</Empty>
      ) : groups.map(([name, ds]) => ds.length > 0 && (
        <section key={name} class="draft-group">
          <h2 class="label">{name} · {ds.length}</h2>
          <div class="drafts">
            {ds.map((d) => (
              <div key={d.id} class="draft">
                <a class="d-main" href={`/navrh/${d.id}`} onClick={nav(`/navrh/${d.id}`)}>
                  <b>{d.kind === 'new' && <span class="pill">nové</span>} {d.title}</b>
                  <small>{GRADE_NAME[d.grade as GradeId]} · {SUBJECTS[d.subject as SubjectId]?.name}{everyone ? ` · ${d.author.name}` : ''} · upraveno {ago(d.updatedAt)}</small>
                </a>
                <span class={`pill st-${d.status}`}>{d.status === 'submitted' && d.unsent ? 'neodeslané úpravy' : STATUS[d.status]}</span>
                {d.prUrl && <a class="icon" href={d.prUrl} target="_blank" rel="noopener noreferrer" title={`Pull request #${d.prNumber} na GitHubu`}><I.external /></a>}
                {(d.status === 'merged' || d.status === 'closed') && d.kind === 'edit' && <button class="btn small" onClick={() => editTopic(d.grade, d.subject, d.topicId)}>Upravit znovu</button>}
                {d.status === 'draft' && d.author.id === me.id && <button class="icon" onClick={() => remove(d)} title="Smazat návrh" aria-label="Smazat návrh"><I.trash /></button>}
                {d.status !== 'merged' && d.status !== 'closed' && <button class="btn small" onClick={() => go(`/navrh/${d.id}`)}>{d.author.id === me.id ? 'Pokračovat' : 'Zobrazit'}</button>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
