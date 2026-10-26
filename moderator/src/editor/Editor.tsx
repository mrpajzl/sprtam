import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { GRADE_NAME, SUBJECTS } from '../../../src/content/curriculum'
import { topicChanged } from '../../../src/content/diff'
import type { GradeId, SubjectId, TopicFile } from '../../../src/content/types'
import { ApiError, api, get, post } from '../api'
import type { Me } from '../passkey'
import type { PreviewMode } from '../preview/protocol'
import { nav } from '../router'
import { approvalText, refreshIndex, STATUS, useIndex, type DraftFull, type DraftView } from '../store'
import { ago, Busy, I, Modal, toast } from '../ui/kit'
import { explanationTitle, BlockList } from './blocks'
import { Ctx, EmojiField, FormatBar, Text, useEd, type EditorCtx, type Focus } from './fields'
import { useHistory } from './history'
import { checkTopic, type Issue, type Section } from './issues'
import { clean, newExplanation, setIn, type Path } from './model'
import { Preview } from './Preview'
import { QuestionList } from './questions'
import { editTopic } from '../screens/Library'

// The topic editor: outline on the left, the section being edited in the middle, the live preview on
// the right. Changes are saved as you type; "Odeslat ke kontrole" shows the change to the other moderators
// (screens/Review.tsx), who approve it – then it is published.

type Loaded = DraftFull
type Save = 'saved' | 'dirty' | 'saving' | 'error'

const EMOJIS = ['📘', '🔢', '➗', '📐', '📏', '🧮', '🔺', '⚖️', '🕐', '🧪', '⚗️', '🔬', '🧬', '🌱', '🌍', '🗺️', '🏰', '👑', '⚔️', '📜', '✍️', '📖', '🔤', '💬', '🎭', '⚡', '🧲', '💡', '🚀', '🧠']
const backupKey = (id: string) => `moderace:draft:${id}`

export function Editor({ id, me }: { id: string; me: Me }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    setLoaded(null)
    get<Loaded>(`/api/drafts/${id}`).then(setLoaded, (e) => setError(e instanceof ApiError ? e.message : 'Návrh se nepodařilo načíst.'))
  }, [id])
  if (error) return <div class="gate"><div class="gate-card"><h1>Návrh nejde otevřít</h1><div class="banner bad">{error}</div><a class="btn" href="/navrhy" onClick={nav('/navrhy')}>Moje návrhy</a></div></div>
  if (!loaded) return <div class="boot" />
  return <Workspace key={id} initial={loaded} me={me} />
}

function Workspace({ initial, me }: { initial: Loaded; me: Me }) {
  const index = useIndex()
  const [draft, setDraft] = useState(initial.draft)
  const hist = useHistory<TopicFile>(initial.topic)
  const topic = hist.value
  const [after, setAfter] = useState<string | null>(initial.after)
  const g = draft.grade as GradeId, s = draft.subject as SubjectId
  const own = draft.author.id === me.id
  const readOnly = !own || (draft.status !== 'draft' && draft.status !== 'review')

  const [section, setSection] = useState<Section>({ kind: 'ex', i: 0 })
  const [focus, setFocusState] = useState<Focus>({ ex: 0 })
  const [pvMode, setPvMode] = useState<PreviewMode>({ kind: 'topic', ex: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(() => matchMedia('(min-width: 1081px)').matches)
  // Narrow screens: the outline is a sheet over the editor, opened from the bottom dock.
  const [parts, setParts] = useState(false)

  // ——— Checks ———
  const cleaned = useMemo(() => clean(topic), [topic])
  const approachIds = useMemo(() => index?.approaches.map((a) => a.id) ?? [], [index])
  const issues = useMemo(() => checkTopic(cleaned, approachIds), [cleaned, approachIds])
  // Opening a topic creates a draft; until something changes there is nothing to send (server: drafts.ts changedOf).
  const base = useMemo(() => (initial.base ? clean(initial.base) : null), [])
  const changed = useMemo(() => draft.kind === 'new' || topicChanged(base, cleaned), [cleaned])
  const untouched = useRef(false)
  untouched.current = own && !changed && draft.status === 'draft' && draft.submittedAt === null
  // Leaving an untouched draft drops it, so it does not show up as work in progress anywhere.
  useEffect(() => () => {
    if (untouched.current && !saving.current) fetch(`/api/drafts/${draft.id}`, { method: 'DELETE', credentials: 'same-origin', keepalive: true }).then(() => refreshIndex(), () => {})
  }, [])
  const errors = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const i of issues) m.set(i.path, [...(m.get(i.path) ?? []), i.cs])
    return m
  }, [issues])

  // ——— Saving ———
  const [save, setSave] = useState<Save>('saved')
  const rev = useRef(draft.rev)
  const first = useRef(true)
  const saving = useRef<Promise<void> | null>(null)
  const latest = useRef({ topic: cleaned, after })
  latest.current = { topic: cleaned, after }

  const flush = useCallback(async (): Promise<void> => {
    if (saving.current) { await saving.current; return flush() }
    const body = latest.current
    setSave('saving')
    saving.current = (async () => {
      try {
        const r = await api<{ rev: number; updatedAt: number }>('PUT', `/api/drafts/${draft.id}`, { topic: body.topic, after: body.after, rev: rev.current })
        rev.current = r.rev
        setDraft((d) => ({ ...d, rev: r.rev, updatedAt: r.updatedAt, approvals: r.rev !== d.rev ? [] : d.approvals }))
        if (latest.current.topic === body.topic && latest.current.after === body.after) { setSave('saved'); localStorage.removeItem(backupKey(draft.id)) } else setSave('dirty')
      } catch (e) {
        setSave('error')
        if (e instanceof ApiError && e.code === 'stale') toast('Návrh se změnil v jiném okně. Načti stránku znovu.', 'bad', { label: 'Načíst', run: () => location.reload() })
        else toast(e instanceof ApiError ? e.message : 'Uložení se nepovedlo.', 'bad')
      } finally { saving.current = null }
    })()
    await saving.current
  }, [draft.id])

  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (readOnly) return
    setSave('dirty')
    try { localStorage.setItem(backupKey(draft.id), JSON.stringify({ topic: cleaned, after, at: Date.now() })) } catch { /* full */ }
    const t = setTimeout(flush, 900)
    return () => clearTimeout(t)
  }, [cleaned, after])

  // Unsaved work from a crashed tab: offer it back.
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(backupKey(draft.id)) ?? 'null') as { topic: TopicFile; after: string | null; at: number } | null
      if (b && !readOnly && b.at > draft.updatedAt && JSON.stringify(b.topic) !== JSON.stringify(clean(initial.topic))) {
        toast('Našel jsem neuložené změny z minula.', 'info', { label: 'Obnovit', run: () => { hist.change(() => b.topic); setAfter(b.after) } })
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (save !== 'saved') { e.preventDefault(); e.returnValue = '' } }
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [save])

  // ——— Undo / redo ———
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (readOnly || !(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); hist.undo() }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); hist.redo() }
      else if (k === 's') { e.preventDefault(); flush() }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [readOnly])

  // ——— Focus, sections and the preview follow each other ———
  const setFocus = useCallback((f: Focus) => {
    setFocusState(f)
    if (f.q !== undefined) { setSection({ kind: 'qs' }); setPvMode({ kind: 'quiz', q: f.q }) }
    else if (f.ex !== undefined) { setSection({ kind: 'ex', i: f.ex }); setPvMode({ kind: 'topic', ex: f.ex, block: f.block }) }
  }, [])
  const jump = (f: Focus | { meta: true }) => {
    if ('meta' in f && f.meta) { setSection({ kind: 'meta' }); setFocusState({ meta: true }); return }
    setFocus(f)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = (f as Focus).q !== undefined ? document.getElementById(`question-${(f as Focus).q}`) : (f as Focus).block !== undefined ? document.getElementById(`block-${(f as Focus).ex}-${(f as Focus).block}`) : null
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true })
    }))
  }
  const fromPreview = (m: PreviewMode) => {
    if (m.kind === 'quiz') jump({ q: Math.max(0, Math.min(m.q, topic.questions.length - 1)) })
    else jump({ ex: m.ex })
    setPvMode(m)
  }
  const goIssue = (i: Issue) => {
    if (i.section.kind === 'meta') jump({ meta: true })
    else if (i.section.kind === 'qs') jump({ q: i.question ?? 0 })
    else jump({ ex: i.section.i, block: i.block })
  }

  const update = useCallback((path: Path, value: unknown, group?: string) => hist.change((t) => setIn(t, path, value), group), [])
  const ctx: EditorCtx = { topic, subject: s, update, errors, readOnly, focus, setFocus }

  // ——— Submit ———
  const onSubmitted = (d: DraftView) => { setDraft(d); rev.current = d.rev; refreshIndex() }
  const status = draft.status === 'review' ? `${STATUS.review} · ${approvalText(draft)}` : draft.status === 'draft' && !changed ? 'zatím beze změny' : STATUS[draft.status]
  // Back to the published topic (a new one is not published yet: its subject).
  const back = draft.kind === 'edit' ? `/ucivo/${g}/${s}/${draft.topicId}` : `/ucivo/${g}/${s}`

  return (
    <Ctx.Provider value={ctx}>
      <div class={`editor ${showPreview ? 'pv-open' : 'no-preview'} ${parts ? 'parts-open' : ''}`}>
        <header class="ed-top">
          <a class="icon" href={back} onClick={nav(back)} aria-label="Zpět na prohlížení" title="Zpět na prohlížení"><I.back /></a>
          <div class="ed-title">
            <small>{GRADE_NAME[g]} · {SUBJECTS[s].name}{draft.kind === 'new' ? ' · nové téma' : ''}{!own ? ` · návrh: ${draft.author.name}` : ''}</small>
            <b>{topic.emoji} {topic.title || 'Bez názvu'}</b>
          </div>
          <span class={`pill st-${draft.status} wide-only`}>{status}</span>
          {!readOnly && <SaveState save={save} at={draft.updatedAt} retry={flush} />}
          <div class="ed-actions">
            {!readOnly && <>
              <button class="icon" onClick={hist.undo} disabled={!hist.canUndo} title="Zpět (Ctrl+Z)" aria-label="Zpět"><I.undo /></button>
              <button class="icon" onClick={hist.redo} disabled={!hist.canRedo} title="Znovu (Ctrl+Shift+Z)" aria-label="Znovu"><I.redo /></button>
            </>}
            <button class={`icon pv-toggle wide-only ${showPreview ? 'on' : ''}`} onClick={() => setShowPreview(!showPreview)} title="Náhled" aria-label="Zobrazit nebo skrýt náhled" aria-pressed={showPreview}><I.phone /></button>
            {draft.status !== 'draft' && <a class="btn wide-only" href={`/kontrola/${draft.id}`} onClick={nav(`/kontrola/${draft.id}`)}><I.check />Kontrola</a>}
            {!readOnly && draft.status === 'draft' && (
              <button class="btn primary wide-only" onClick={() => setSubmitting(true)}><I.send />Odeslat ke kontrole</button>
            )}
          </div>
        </header>
        {readOnly && <ReadOnlyBanner draft={draft} own={own} />}
        {!readOnly && draft.conflict && <div class="banner warn ed-banner"><I.warn />Téma mezitím někdo jiný změnil a zveřejnil. Na <a href={`/kontrola/${draft.id}`} onClick={nav(`/kontrola/${draft.id}`)}>stránce kontroly</a> uvidíš, co se změnilo – přenes to sem a návrh převeď na novou verzi.</div>}
        {!readOnly && !draft.conflict && draft.status === 'review' && <div class="banner info ed-banner"><I.eye />Návrh je v kontrole. Každá úprava je nová verze – kdo už ho schválil, musí ho schválit znovu.</div>}

        {parts && <div class="sheet-backdrop narrow-only" onClick={() => setParts(false)} />}
        <nav class="outline" aria-label="Části tématu">
          <div class="sheet-head narrow-only"><b>Části tématu</b><button class="icon" onClick={() => setParts(false)} aria-label="Zavřít"><I.close /></button></div>
          <Outline section={section} issues={issues} jump={(f) => { setParts(false); jump(f) }} />
        </nav>

        <main class="ed-main">
          {!readOnly && <FormatBar />}
          {section.kind === 'meta' && <Meta draft={draft} after={after} setAfter={setAfter} />}
          {section.kind === 'ex' && topic.explanations[section.i] && <ExplanationSection i={section.i} issues={issues.filter((x) => x.section.kind === 'ex' && x.section.i === section.i)} jump={jump} />}
          {section.kind === 'qs' && (
            <>
              <div class="sec-head"><h1>Otázky</h1><p class="muted">Od lehkých po těžší. Ke každé přidej krátké „proč“ – ukáže se po odpovědi.</p></div>
              <QuestionList issues={issues.filter((x) => x.section.kind === 'qs')} />
            </>
          )}
        </main>

        {showPreview && (
          <aside class="ed-preview">
            <Preview topic={cleaned} grade={g} subject={s} approaches={index?.approaches ?? []} mode={pvMode} onMode={fromPreview} onClose={() => setShowPreview(false)} />
          </aside>
        )}

        {/* Narrow screens: parts, preview and the main action within thumb reach. */}
        <div class="ed-dock narrow-only">
          <button class="dock-btn" onClick={() => setParts(true)} aria-haspopup="dialog">
            <I.list /><span>Části</span>{issues.length > 0 && <i class="badge bad">{issues.length}</i>}
          </button>
          <button class="dock-btn" onClick={() => setShowPreview(true)}><I.phone /><span>Náhled</span></button>
          {!readOnly && draft.status === 'draft'
            ? <button class="btn primary" onClick={() => setSubmitting(true)}><I.send />Odeslat</button>
            : draft.status !== 'draft'
              ? <a class="btn" href={`/kontrola/${draft.id}`} onClick={nav(`/kontrola/${draft.id}`)}><I.check />Kontrola</a>
              : <span />}
        </div>
      </div>
      {submitting && <Submit draft={draft} changed={changed} issues={issues} flush={flush} goIssue={(i) => { setSubmitting(false); goIssue(i) }} onClose={() => setSubmitting(false)} onDone={onSubmitted} />}
    </Ctx.Provider>
  )
}

function SaveState({ save, at, retry }: { save: Save; at: number; retry: () => void }) {
  if (save === 'error') return <button class="save bad" onClick={retry}><I.warn />Neuloženo – zkusit znovu</button>
  return <span class={`save ${save}`} title={`Uloženo ${ago(at)}`}>{save === 'saved' ? <><I.check />Uloženo</> : save === 'saving' ? 'Ukládám…' : 'Neuloženo'}</span>
}

function ReadOnlyBanner({ draft, own }: { draft: DraftView; own: boolean }) {
  const review = <a href={`/kontrola/${draft.id}`} onClick={nav(`/kontrola/${draft.id}`)}>kontrolu a komentáře</a>
  if (!own) return <div class="banner info ed-banner"><I.eye />Prohlížíš návrh, který rozpracoval/a {draft.author.name}. Upravovat ho může jen autor – ty můžeš otevřít {review}.</div>
  if (draft.status === 'published') return <div class="banner ok ed-banner"><I.check />Zveřejněno{draft.release ? ` (vydání ${draft.release})` : ''}. Změna je na sprtam.cz. {draft.kind === 'edit' && <button class="btn small" onClick={() => editTopic(draft.grade, draft.subject, draft.topicId)}>Upravit znovu</button>}</div>
  return (
    <div class="banner warn ed-banner">
      <I.warn />{draft.status === 'rejected' ? `Návrh byl zamítnut${draft.decisionNote ? `: ${draft.decisionNote}` : '.'}` : 'Návrh byl stažen.'} Podívej se na {review}.
      {draft.kind === 'edit' && <button class="btn small" onClick={() => editTopic(draft.grade, draft.subject, draft.topicId)}>Začít znovu</button>}
    </div>
  )
}

// ——— Outline ———

function Outline({ section, issues, jump }: { section: Section; issues: Issue[]; jump: (f: Focus | { meta: true }) => void }) {
  const ed = useEd()
  const index = useIndex()
  const t = ed.topic
  const count = (f: (i: Issue) => boolean) => issues.filter(f).length
  const Badge = ({ n }: { n: number }) => (n ? <span class="badge bad">{n}</span> : <span class="badge ok"><I.check /></span>)
  const missing = (index?.approaches ?? []).filter((a) => !t.explanations.some((x) => x.approach === a.id))
  const addApproach = (id: string, name: string) => {
    ed.update(['explanations'], [...t.explanations, newExplanation(name, id)])
    jump({ ex: t.explanations.length })
  }
  return (
    <>
      <button class={`ol-item ${section.kind === 'meta' ? 'on' : ''}`} onClick={() => jump({ meta: true })}>
        <span class="ol-em">{t.emoji || '·'}</span><span class="ol-t"><b>Název a zařazení</b></span><Badge n={count((i) => i.section.kind === 'meta')} />
      </button>
      <h3 class="label">Vysvětlení</h3>
      {t.explanations.map((x, i) => {
        const a = index?.approaches.find((y) => y.id === x.approach)
        return (
          <button key={i} class={`ol-item ${section.kind === 'ex' && section.i === i ? 'on' : ''}`} onClick={() => jump({ ex: i })}>
            <span class="ol-em">{a ? a.emoji : i + 1}</span>
            <span class="ol-t"><b>{explanationTitle(x, i)}</b><small>{a ? `${a.short} · ` : ''}{x.blocks.length} bloků</small></span>
            <Badge n={count((y) => y.section.kind === 'ex' && y.section.i === i)} />
          </button>
        )
      })}
      {!ed.readOnly && missing.map((a) => <button key={a.id} class="ol-add" onClick={() => addApproach(a.id, a.short)}><I.plus />Vysvětlení pro {a.short}</button>)}
      <h3 class="label">Procvičování</h3>
      <button class={`ol-item ${section.kind === 'qs' ? 'on' : ''}`} onClick={() => jump({ q: 0 })}>
        <span class="ol-em">?</span><span class="ol-t"><b>Otázky</b><small>{t.questions.length} otázek</small></span><Badge n={count((i) => i.section.kind === 'qs')} />
      </button>
      <Checklist issues={issues} jump={jump} />
    </>
  )
}

function Checklist({ issues, jump }: { issues: Issue[]; jump: (f: Focus | { meta: true }) => void }) {
  const ed = useEd()
  const where = (i: Issue) => {
    if (i.section.kind === 'meta') return 'Název'
    if (i.section.kind === 'qs') return i.question !== undefined ? `Otázka ${i.question + 1}` : 'Otázky'
    return `${explanationTitle(ed.topic.explanations[i.section.i] ?? { title: '', blocks: [] }, i.section.i)}${i.block !== undefined ? ` · blok ${i.block + 1}` : ''}`
  }
  const go = (i: Issue) => (i.section.kind === 'meta' ? jump({ meta: true }) : i.section.kind === 'qs' ? jump({ q: i.question ?? 0 }) : jump({ ex: i.section.i, block: i.block }))
  return (
    <div class={`checklist ${issues.length ? '' : 'done'}`}>
      {issues.length ? (
        <>
          <h3 class="label">Zbývá opravit · {issues.length}</h3>
          <ul>
            {issues.slice(0, 12).map((i, k) => <li key={k}><button onClick={() => go(i)}><small>{where(i)}</small>{i.cs}</button></li>)}
          </ul>
          {issues.length > 12 && <p class="fine">…a dalších {issues.length - 12}</p>}
        </>
      ) : <p><I.check /> Všechno v pořádku – můžeš odeslat ke kontrole.</p>}
    </div>
  )
}

// ——— Sections ———

function Meta({ draft, after, setAfter }: { draft: DraftView; after: string | null; setAfter: (v: string | null) => void }) {
  const ed = useEd()
  const index = useIndex()
  const t = ed.topic
  const list = index?.subjects[`${draft.grade}/${draft.subject}`] ?? []
  const showGenerator = !!t.generator || ['matematika', 'fyzika'].includes(draft.subject)
  return (
    <div class="sec">
      <div class="sec-head"><h1>Název a zařazení</h1></div>
      <div class="card plain">
        <Text path={['title']} label="Název tématu" placeholder="např. Zlomky" />
        <EmojiField value={t.emoji} set={(v) => ed.update(['emoji'], v, 'emoji')} choices={EMOJIS} disabled={ed.readOnly} errors={ed.errors.get('emoji') ?? []} />
        <div class="field"><span>Id tématu</span><div class="locked"><I.lock /><code>{t.id}</code></div><small>Je v adrese tématu a je na něm uložený pokrok dětí – proto se nikdy nemění.</small></div>
        {draft.kind === 'new' && (
          <label class="field">
            <span>Zařadit za</span>
            <select value={after ?? ''} disabled={ed.readOnly} onChange={(e) => setAfter(e.currentTarget.value || null)}>
              <option value="">na začátek předmětu</option>
              {list.map((x, i) => <option key={x.id} value={x.id}>{i + 1}. {x.emoji} {x.title}</option>)}
            </select>
            <small>Pořadí, v jakém se téma během roku učí.</small>
          </label>
        )}
        {showGenerator && (
          <label class="field">
            <span>Generátor dalších příkladů</span>
            <select value={t.generator ?? ''} disabled={ed.readOnly} onChange={(e) => ed.update(['generator'], e.currentTarget.value || undefined)}>
              <option value="">žádný</option>
              {(index?.generators ?? []).map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <small>Jen matematika a fyzika: aplikace k otázkám přidá náhodně vytvořené příklady daného druhu.</small>
          </label>
        )}
        {t.approach && <p class="fine">Tohle téma patří jen k přístupu „{index?.approaches.find((a) => a.id === t.approach)?.name ?? t.approach}“ a ukazuje se v jeho plánu.</p>}
      </div>
    </div>
  )
}

function ExplanationSection({ i, issues, jump }: { i: number; issues: Issue[]; jump: (f: Focus) => void }) {
  const ed = useEd()
  const index = useIndex()
  const x = ed.topic.explanations[i]
  const a = index?.approaches.find((y) => y.id === x.approach)
  const general = ed.topic.explanations.filter((y) => !y.approach).length
  const p: Path = ['explanations', i]
  return (
    <div class="sec">
      <div class="sec-head">
        <div class="ex-title">
          <span class="ex-n">{a ? a.emoji : `${i + 1}.`}</span>
          <Text path={[...p, 'title']} placeholder="Název vysvětlení (1–3 slova)" class="as-title" />
          {!ed.readOnly && x.approach && (
            <button class="btn small" onClick={() => { if (confirm('Odebrat celé vysvětlení?')) { ed.update(['explanations'], ed.topic.explanations.filter((_, j) => j !== i)); jump({ ex: 0 }) } }}><I.trash />Odebrat</button>
          )}
        </div>
        <p class="muted">
          {a ? `Vysvětlení v duchu přístupu „${a.name}“ – dětem, které ho zvolily, se ukáže jako první.`
            : `Každé ze ${general} vysvětlení musí samo o sobě vysvětlit celé téma od úplné nuly – jinou cestou než to druhé (příběh × postup, obrázek × pravidlo…).`}
        </p>
        <details class="tips">
          <summary>Jak má vysvětlení vypadat</summary>
          <ol>
            <li>Nadpis <b>O čem to je</b> a odstavec: navaž na něco ze života a řekni, k čemu to je.</li>
            <li><b>Nový pojem</b> pro každé slovo, které dítě nemusí znát – vždy dřív, než ho použiješ.</li>
            <li>Výklad krok za krokem; aspoň jedna <b>pomůcka</b>, <b>postup</b> nebo <b>řešený příklad</b> (ideálně dva, od lehkého k těžšímu).</li>
            <li><b>Častá chyba</b>: špatně, správně a proč.</li>
            <li>Na konec <b>Shrnutí</b> v 1–3 větách. Krátké věty, tykání, aspoň 8 bloků.</li>
          </ol>
        </details>
      </div>
      <BlockList ex={i} issues={issues} />
    </div>
  )
}

// ——— Submit ———

function Submit({ draft, changed, issues, flush, goIssue, onClose, onDone }: {
  draft: DraftView; changed: boolean; issues: Issue[]; flush: () => Promise<void>; goIssue: (i: Issue) => void; onClose: () => void; onDone: (d: DraftView) => void
}) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<DraftView | null>(null)
  const send = async () => {
    setBusy(true); setError('')
    try {
      await flush()
      const r = await post<{ draft: DraftView }>(`/api/drafts/${draft.id}/submit`, { note })
      onDone(r.draft); setDone(r.draft)
    } catch (e) {
      const ex = e as ApiError
      const problems = (ex.data?.problems as { path: string; message: string }[] | undefined) ?? []
      setError(`${ex.message ?? 'Odeslání se nepovedlo.'}${problems.length ? ` (${problems.slice(0, 3).map((p) => p.message).join('; ')})` : ''}`)
    } finally { setBusy(false) }
  }
  const others = draft.needed === 1 ? 'jiný moderátor' : `${draft.needed} další moderátoři`
  if (done) {
    return (
      <Modal title="Odesláno ke kontrole" onClose={onClose} actions={<><a class="btn" href={`/kontrola/${done.id}`} onClick={nav(`/kontrola/${done.id}`)}>Otevřít kontrolu</a><button class="btn primary" onClick={onClose}>Hotovo</button></>}>
        <p class="lead"><I.check /> Díky! Návrh teď vidí ostatní moderátoři.</p>
        <p>Jakmile ho schválí {others}, sám se zveřejní na sprtam.cz. Když budou chtít něco upravit, uvidíš jejich komentáře v kontrole a v <b>Mých návrzích</b>.</p>
      </Modal>
    )
  }
  return (
    <Modal title="Odeslat ke kontrole" onClose={onClose}
      actions={<><button class="btn" onClick={onClose}>Zpět k úpravám</button><Busy class="btn primary" on={busy} disabled={issues.length > 0 || !changed} onClick={send}><I.send />Odeslat</Busy></>}>
      {!changed ? (
        <p>V tématu zatím není žádná změna, takže není co kontrolovat. Uprav výklad nebo otázky a pak ho pošli.</p>
      ) : issues.length > 0 ? (
        <>
          <p>Než téma odešleš, oprav ještě <b>{issues.length}</b> {issues.length === 1 ? 'věc' : issues.length < 5 ? 'věci' : 'věcí'}:</p>
          <ul class="issue-list">{issues.slice(0, 10).map((i, k) => <li key={k}><button onClick={() => goIssue(i)}>{i.cs}</button></li>)}</ul>
        </>
      ) : (
        <>
          <p>Změnu uvidí ostatní moderátoři. Zveřejní se, až ji schválí {others}. Upravovat ji můžeš i potom – každá úprava je ale nová verze, kterou je potřeba schválit znovu.</p>
          <label class="field"><span>Vzkaz pro kontrolu</span><textarea rows={3} value={note} onInput={(e) => setNote(e.currentTarget.value)} placeholder="Co a proč jsi změnil/a (nepovinné)" maxLength={2000} /></label>
        </>
      )}
      {error && <div class="banner bad" role="alert">{error}</div>}
    </Modal>
  )
}
