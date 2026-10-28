import { useEffect, useMemo, useState } from 'preact/hooks'
import { GRADE_NAME, gradeSubjects, isGrade, ODB, STAGES, subjectMeta } from '../../../src/content/curriculum'
import { isSubjectOf } from '../../../src/content/docs'
import type { GradeId, SubjectId } from '../../../src/content/types'
import { ApiError, post } from '../api'
import { newTopic, slugify } from '../editor/model'
import type { Me } from '../passkey'
import { go, nav } from '../router'
import { refreshIndex, useIndex, type Index } from '../store'
import { Busy, Empty, I, Modal, toast } from '../ui/kit'
import { EmojiField } from '../editor/fields'

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

/** Opens the editor on a topic: continues my open draft of it, or starts one. */
export async function editTopic(g: string, s: string, id: string) {
  try {
    const { draft } = await post<{ draft: { id: string } }>('/api/drafts', { kind: 'edit', grade: g, subject: s, topicId: id })
    go(`/navrh/${draft.id}`)
  } catch (e) { toast(e instanceof ApiError ? e.message : 'Téma se nepodařilo otevřít.', 'bad') }
}

export function Library({ g, s, me }: { g?: string; s?: string; me: Me | null }) {
  const index = useIndex()
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const grade = isGrade(g) ? g : undefined
  const subject = (grade && s && isSubjectOf(grade, s) ? s : undefined) as SubjectId | undefined

  const hits = useMemo(() => {
    if (!index || q.trim().length < 2) return null
    const words = fold(q).split(/\s+/).filter(Boolean)
    return Object.entries(index.subjects).flatMap(([key, list]) => list.filter((t) => words.every((w) => fold(t.title).includes(w) || t.id.includes(w))).map((t) => ({ key, t }))).slice(0, 80)
  }, [index, q])

  // Phones show grades and subjects as scrolling strips once one is picked: keep the picked ones in view.
  useEffect(() => {
    for (const el of document.querySelectorAll('.grades .chip.on, .subjects .subject.on')) el.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [grade, subject, !!index])

  return (
    <div class="library">
      <aside class="grades">
        <label class="search">
          <I.search />
          <input type="search" placeholder="Hledat téma…" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Hledat téma ve všech ročnících" />
        </label>
        {STAGES.map((st) => (
          <div key={st.id} class="stage">
            <h3 class="label">{st.name}</h3>
            <div class="chips">
              {st.grades.map((x) => <a key={x} href={`/ucivo/${x}`} onClick={nav(`/ucivo/${x}`)} class={`chip ${x === grade ? 'on' : ''}`}>{GRADE_NAME[x]}</a>)}
            </div>
          </div>
        ))}
        <div class="stage">
          <h3 class="label">Odborné školy</h3>
          <div class="chips"><a href={`/ucivo/${ODB}`} onClick={nav(`/ucivo/${ODB}`)} class={`chip ${grade === ODB ? 'on' : ''}`}>{GRADE_NAME[ODB]}</a></div>
        </div>
      </aside>
      <section class="lib-main">
        {hits ? (
          <>
            <h1>Hledání: „{q.trim()}“</h1>
            {hits.length ? <TopicRows index={index!} rows={hits.map(({ key, t }) => ({ key, ...t }))} me={me} showWhere /> : <Empty>Nic nenalezeno.</Empty>}
          </>
        ) : !grade ? (
          <Intro index={index} me={me} />
        ) : (
          <>
            <h1>{GRADE_NAME[grade]}</h1>
            <div class="subjects">
              {gradeSubjects(grade).map((x) => (
                <a key={x} href={`/ucivo/${grade}/${x}`} onClick={nav(`/ucivo/${grade}/${x}`)} class={`subject ${x === subject ? 'on' : ''}`} style={{ '--k': `var(--k-${subjectMeta(x).c})` }}>
                  <b>{subjectMeta(x).name}</b><small>{index?.subjects[`${grade}/${x}`]?.length ?? '…'} témat</small>
                </a>
              ))}
            </div>
            {subject && index && (
              <>
                <div class="row-head">
                  <h2>{subjectMeta(subject).name} · {GRADE_NAME[grade]}</h2>
                  {me && <button class="btn primary" onClick={() => setAdding(true)}><I.plus />Nové téma</button>}
                </div>
                <p class="muted">Témata jsou v pořadí, v jakém se během roku učí. Klikni na téma: uvidíš ho jako děti, se všemi otázkami a správnými odpověďmi.</p>
                <TopicRows index={index} rows={index.subjects[`${grade}/${subject}`].map((t) => ({ key: `${grade}/${subject}`, ...t }))} me={me} />
                {adding && <NewTopic g={grade} s={subject} index={index} onClose={() => setAdding(false)} />}
              </>
            )}
            {!subject && <p class="muted">Vyber předmět.</p>}
          </>
        )}
      </section>
    </div>
  )
}

function Intro({ index, me }: { index?: Index; me: Me | null }) {
  const total = index ? Object.values(index.subjects).reduce((n, l) => n + l.length, 0) : 0
  if (!me) return (
    <div class="intro">
      <h1>Učivo Šprtámu</h1>
      <p class="lead">Projdi si všechno učivo aplikace <a href="https://sprtam.cz" target="_blank" rel="noopener">sprtam.cz</a> přesně tak, jak ho vidí děti: výklad, pomůcky i otázky se správnými odpověďmi.</p>
      <ol class="how">
        <li><b>Vyber</b> ročník a předmět, nebo téma vyhledej.</li>
        <li><b>Otevři téma.</b> V telefonu si přečteš výklad a vyzkoušíš otázky. Vedle je přehled všech otázek se správnými odpověďmi.</li>
      </ol>
      <p class="muted">Učivo upravují pozvaní moderátoři a každou změnu před zveřejněním někdo schvaluje.{index ? ` V učivu je ${total} témat.` : ''} Je pod licencí <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.cs" target="_blank" rel="noopener">CC BY-SA 4.0</a>, celé ke stažení na <a href="https://github.com/mrpajzl/sprtam-content" target="_blank" rel="noopener">GitHubu</a>.</p>
    </div>
  )
  const mine = index?.active.filter((a) => a.userId === me.id).length ?? 0
  return (
    <div class="intro">
      <h1>Ahoj, {me.name.split(' ')[0]}!</h1>
      <p class="lead">Vyber ročník a předmět, pak téma, které chceš upravit – nebo přidej nové. Každou změnu před zveřejněním schvaluje jiný moderátor.</p>
      <ol class="how">
        <li><b>Uprav</b> výklad a otázky v editoru. Vpravo hned vidíš, jak to bude vypadat v aplikaci.</li>
        <li><b>Oprav</b>, na co tě editor upozorní (červeně). Ukládá se samo.</li>
        <li><b>Odešli ke kontrole.</b> Až změnu schválí jiný moderátor, sama se zveřejní na sprtam.cz.</li>
      </ol>
      {index && <p class="muted">V učivu je {total} témat.{mine ? <> Máš rozpracováno {mine} – najdeš je v <a href="/kontrola?moje=1" onClick={nav('/kontrola?moje=1')}>Kontrole</a> pod Pouze moje.</> : null}</p>}
    </div>
  )
}

interface Row { key: string; id: string; title: string; emoji: string; approach?: string }

function TopicRows({ index, rows, me, showWhere }: { index: Index; rows: Row[]; me: Me | null; showWhere?: boolean }) {
  return (
    <div class="topics">
      {rows.map((t, i) => {
        const [g, s] = t.key.split('/') as [GradeId, SubjectId]
        const k = `${t.key}/${t.id}`
        const others = index.active.filter((a) => a.key === k)
        const mine = me && others.find((a) => a.userId === me.id)
        const rest = others.filter((a) => a.userId !== me?.id)
        const href = `/ucivo/${k}`
        return (
          <a key={k} class="topic" href={href} onClick={nav(href)}>
            <span class="n">{showWhere ? '' : i + 1}</span>
            <span class="em">{t.emoji}</span>
            <span class="t">
              <b>{t.title}</b>
              {showWhere && <small>{GRADE_NAME[g]} · {subjectMeta(s).name}</small>}
              {t.approach && <small>jen pro přístup {index.approaches.find((a) => a.id === t.approach)?.short ?? t.approach}</small>}
            </span>
            {mine && <span class="pill mine">{mine.status === 'review' ? 'tvůj návrh v kontrole' : 'rozpracováno'}</span>}
            {rest.some((r) => r.status === 'review') && <span class="pill st-review">ke kontrole</span>}
            {rest.some((r) => r.status !== 'review') && <span class="pill" title={rest.map((r) => r.name).join(', ')}>upravuje {rest.find((r) => r.status !== 'review')!.name}</span>}
            <I.right />
          </a>
        )
      })}
    </div>
  )
}

const EMOJIS = ['📘', '🔢', '➗', '📐', '📏', '🧮', '🔺', '⚖️', '🕐', '🧪', '⚗️', '🔬', '🧬', '🌱', '🌍', '🗺️', '🏰', '👑', '⚔️', '📜', '✍️', '📖', '🔤', '💬', '🎭', '🎨', '🎵', '⚡', '🧲', '💡', '🌡️', '🚀', '🪐', '🦠', '🐾', '🌳', '💧', '🔥', '🏛️', '🧠']

function NewTopic({ g, s, index, onClose }: { g: GradeId; s: SubjectId; index: Index; onClose: () => void }) {
  const list = index.subjects[`${g}/${s}`]
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📘')
  const [id, setId] = useState('')
  const [idTouched, setIdTouched] = useState(false)
  const [after, setAfter] = useState<string>(list.length ? list[list.length - 1].id : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const finalId = idTouched ? id : slugify(title)
  const taken = list.some((t) => t.id === finalId) || index.active.some((a) => a.key === `${g}/${s}/${finalId}`)
  const valid = title.trim().length > 1 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(finalId) && !taken && emoji.trim()

  const create = async () => {
    setBusy(true); setError('')
    try {
      const { draft } = await post<{ draft: { id: string } }>('/api/drafts', { kind: 'new', grade: g, subject: s, topic: newTopic(finalId, title.trim(), emoji.trim()), after: after || null })
      refreshIndex()
      go(`/navrh/${draft.id}`)
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Téma se nepodařilo založit.'); setBusy(false) }
  }
  return (
    <Modal title={`Nové téma – ${subjectMeta(s).name}, ${GRADE_NAME[g]}`} onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zrušit</button><Busy class="btn primary" on={busy} disabled={!valid} onClick={create}>Založit a upravit</Busy></>}>
      <form class="form" onSubmit={(e) => { e.preventDefault(); if (valid) create() }}>
        <label class="field"><span>Název tématu</span><input value={title} onInput={(e) => setTitle(e.currentTarget.value)} placeholder="např. Zlomky" maxLength={80} autoFocus /></label>
        <EmojiField value={emoji} set={setEmoji} choices={EMOJIS} />
        <label class="field">
          <span>Zařadit za</span>
          <select value={after} onChange={(e) => setAfter(e.currentTarget.value)}>
            <option value="">na začátek</option>
            {list.map((t, i) => <option key={t.id} value={t.id}>{i + 1}. {t.emoji} {t.title}</option>)}
          </select>
          <small>Pořadí, v jakém se téma během roku učí.</small>
        </label>
        <details class="advanced">
          <summary>Id tématu: <code>{finalId || '…'}</code></summary>
          <label class="field">
            <span>Id (v adrese, nikdy se nemění)</span>
            <input value={finalId} onInput={(e) => { setIdTouched(true); setId(slugify(e.currentTarget.value)) }} />
            <small>Vznikne z názvu. Měň ho jen, když je moc dlouhé. Po založení už změnit nejde – je na něm uložený pokrok dětí.</small>
          </label>
        </details>
        {taken && <div class="banner bad">Téma s id „{finalId}“ už v předmětu je. Zvol jiný název.</div>}
        {error && <div class="banner bad">{error}</div>}
        <p class="fine">Téma dostane kostru dvou vysvětlení a pár otázek – stačí je vyplnit.</p>
      </form>
    </Modal>
  )
}
