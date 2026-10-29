import { useEffect, useState } from 'preact/hooks'
import { GRADE_NAME, isGrade, SUBJECTS, subjectMeta } from '../../../src/content/curriculum'
import { dateCs } from '../../../src/content/verified'
import { ApiError, api, get } from '../api'
import type { Me } from '../passkey'
import { AVATARS, initials, PROFILE_LIMITS, type Profile, type ProfileDetail } from '../profile'
import { go, nav } from '../router'
import { useIndex } from '../store'
import { Busy, I, toast } from '../ui/kit'

// /moderatori: who checks the content – the moderators who made their profile public (signed-in moderators see all
// active colleagues). /moderatori/<id>: one profile with the topics its owner checked. /moderatori?jmeno=<name>
// opens the profile of that name: the app at sprtam.cz links the names at checked topics here. The own profile is
// edited in Účet (ProfileForm). Server: moderator/server/profiles.ts.

/** The profile of a checker named at a topic ("Zkontroloval/a Jana Nováková"). */
export const profileHref = (name: string) => `/moderatori?jmeno=${encodeURIComponent(name)}`

export function Avatar({ p, size = 'm' }: { p: Pick<Profile, 'name' | 'avatar' | 'id'>; size?: 's' | 'm' | 'l' }) {
  // A steady colour per account for the initials: the same person always looks the same.
  const hue = [...p.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
  return p.avatar
    ? <span class={`avatar ${size} pic`} aria-hidden="true">{p.avatar}</span>
    : <span class={`avatar ${size}`} aria-hidden="true" style={{ background: `hsl(${hue} 55% 88%)`, color: `hsl(${hue} 45% 28%)` }}>{initials(p.name)}</span>
}

const host = (url: string) => { try { return new URL(url).host.replace(/^www\./, '') } catch { return url } }
const year = (t: number) => new Date(t).getFullYear()
const topicsText = (n: number) => (n === 1 ? '1 zkontrolované téma' : n >= 2 && n <= 4 ? `${n} zkontrolovaná témata` : `${n} zkontrolovaných témat`)

function Subjects({ ids }: { ids: string[] }) {
  if (!ids.length) return null
  return <div class="p-subjects">{ids.map((s) => <span key={s} class="p-subject" style={{ '--k': `var(--k-${subjectMeta(s).c})` }}>{subjectMeta(s).emoji ? `${subjectMeta(s).emoji} ` : ''}{subjectMeta(s).name}</span>)}</div>
}

export function ProfileList({ me }: { me: Me | null }) {
  useIndex() // names and colours of odborné předměty
  const [list, setList] = useState<Profile[] | null>(null)
  const [error, setError] = useState('')
  const [wanted] = useState(() => new URLSearchParams(location.search).get('jmeno')?.trim() ?? '')
  // A link from a topic: straight to that person's profile when it can be shown (also by a name they had before).
  const [looking, setLooking] = useState(!!wanted)
  useEffect(() => {
    if (!wanted) return
    get<{ id: string }>(`/api/moderators/by-name?name=${encodeURIComponent(wanted)}`).then((r) => go(`/moderatori/${r.id}`, true), () => setLooking(false))
  }, [])
  useEffect(() => { get<Profile[]>('/api/moderators').then(setList, (e) => setError(e.message)) }, [me?.id])
  if (looking) return <div class="boot" />

  return (
    <div class="page-narrow profiles">
      <div class="intro">
        <h1>Kdo kontroluje učivo</h1>
        <p class="lead">Učivo Šprtámu napsala umělá inteligence. Tihle lidé ho čtou, opravují a schvalují. Jejich jméno je pak u každého tématu, které zkontrolovali.</p>
        {!me && <p><a class="btn" href="/zapojit-se" onClick={nav('/zapojit-se')}><I.users />Chci se přidat</a></p>}
      </div>
      {wanted && list && <div class="banner info"><I.user /><span>{me ? <>Moderátora <b>{wanted}</b> jsme nenašli. Možná už účet nemá.</> : <><b>{wanted}</b> nemá veřejný profil. Témata ale kontroluje stejně jako ostatní.</>}</span></div>}
      {me && <p class="fine">Jako moderátor/ka vidíš i kolegy, kteří svůj profil nezveřejnili (označení „jen pro moderátory“). Svůj profil upravíš v <a href="/ucet" onClick={nav('/ucet')}>Účtu</a>.</p>}
      {error && <div class="banner bad" role="alert">{error}</div>}
      {list && !list.length && <div class="empty-state">Zatím tu nikdo nemá veřejný profil.</div>}
      <div class="p-grid">
        {list?.map((p) => (
          <a key={p.id} class="p-card" href={`/moderatori/${p.id}`} onClick={nav(`/moderatori/${p.id}`)}>
            <Avatar p={p} />
            <div class="p-main">
              <b>{p.name}</b>
              {p.headline && <span class="p-headline">{p.headline}</span>}
              <Subjects ids={p.subjects.slice(0, 4)} />
              <small>{topicsText(p.verified)}{me && !p.public ? ' · jen pro moderátory' : ''}</small>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export function ProfilePage({ id, me }: { id: string; me: Me | null }) {
  useIndex()
  const [p, setP] = useState<ProfileDetail | null>(null)
  const [error, setError] = useState('')
  const [all, setAll] = useState(false)
  useEffect(() => { get<ProfileDetail>(`/api/moderators/${encodeURIComponent(id)}`).then(setP, (e) => setError(e.message)) }, [id, me?.id])
  const back = <a class="v-up" href="/moderatori" onClick={nav('/moderatori')}><I.back />Kdo kontroluje učivo</a>
  if (error) return <div class="page-narrow">{back}<div class="empty-state">{error}</div></div>
  if (!p) return <div class="page-narrow">{back}</div>
  const shown = all ? p.topics : p.topics.slice(0, 30)
  return (
    <div class="page-narrow profile">
      {back}
      <section class="card plain p-head">
        <Avatar p={p} size="l" />
        <div class="p-main">
          <h1>{p.name}</h1>
          {p.headline && <p class="p-headline">{p.headline}</p>}
          <Subjects ids={p.subjects} />
          <p class="fine">{p.role === 'admin' ? 'Správce Šprtámu' : 'Moderátor/ka'} od roku {year(p.since)} · {topicsText(p.verified)}{p.published ? ` · ${p.published} zveřejněných úprav` : ''}</p>
          {p.web && <p><a class="btn small" href={p.web} target="_blank" rel="nofollow ugc noopener noreferrer"><I.external />{host(p.web)}</a></p>}
        </div>
        {me?.id === p.id && <a class="btn small p-edit" href="/ucet" onClick={nav('/ucet')}><I.pencil />Upravit profil</a>}
      </section>
      {me?.id === p.id && !p.public && <div class="banner warn"><I.lock /><span>Profil vidí jen přihlášení moderátoři. Zveřejníš ho v Účtu.</span></div>}
      {p.bio && <section class="card plain"><h2 class="label">O mně</h2><p class="p-bio">{p.bio}</p></section>}
      <section class="card plain">
        <h2 class="label">Zkontrolovaná témata</h2>
        {!p.topics.length && <p class="muted">Zatím žádné.</p>}
        <ul class="p-topics">
          {shown.map((t) => {
            const [g, s] = t.key.split('/')
            return (
              <li key={t.key}><a href={`/ucivo/${t.key}`} onClick={nav(`/ucivo/${t.key}`)}>
                <span class="p-em" aria-hidden="true">{t.emoji}</span>
                <span><b>{t.title}</b><small>{isGrade(g) ? GRADE_NAME[g] : g} · {subjectMeta(s).name} · {dateCs(t.at)}</small></span>
              </a></li>
            )
          })}
        </ul>
        {!all && p.topics.length > shown.length && <button class="btn small" onClick={() => setAll(true)}>Zobrazit všech {p.topics.length}</button>}
      </section>
    </div>
  )
}

/** The own profile in Účet. `onSaved` passes the (maybe new) name up: the header shows it. */
export function ProfileForm({ me, onSaved }: { me: Me; onSaved: (name: string) => void }) {
  const index = useIndex()
  const [p, setP] = useState<ProfileDetail | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  useEffect(() => { get<ProfileDetail>('/api/me/profile').then(setP, (e) => setError(e.message)) }, [me.id])
  if (!p) return error ? <div class="banner bad">{error}</div> : null

  const set = <K extends keyof ProfileDetail>(k: K, v: ProfileDetail[K]) => { setP({ ...p, [k]: v }); setDirty(true) }
  const toggle = (s: string) => set('subjects', p.subjects.includes(s) ? p.subjects.filter((x) => x !== s) : [...p.subjects, s])
  const vocational = index ? Object.keys(index.vocational).sort((a, b) => subjectMeta(a).name.localeCompare(subjectMeta(b).name, 'cs')) : []
  const chip = (s: string) => (
    <button type="button" key={s} class={`chip ${p.subjects.includes(s) ? 'on' : ''}`} aria-pressed={p.subjects.includes(s)}
      disabled={!p.subjects.includes(s) && p.subjects.length >= PROFILE_LIMITS.subjects} onClick={() => toggle(s)}>{subjectMeta(s).emoji ? `${subjectMeta(s).emoji} ` : ''}{subjectMeta(s).name}</button>
  )
  const save = async (e: Event) => {
    e.preventDefault()
    setError('')
    if (p.name.trim().length < 2) return setError('Napiš jméno.')
    setBusy(true)
    try {
      const r = await api<ProfileDetail>('PUT', '/api/me/profile', { name: p.name, headline: p.headline, bio: p.bio, subjects: p.subjects, web: p.web, avatar: p.avatar, public: p.public })
      setP(r); setDirty(false); onSaved(r.name); toast('Profil uložen')
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Profil se nepodařilo uložit.') } finally { setBusy(false) }
  }

  return (
    <form class="card plain form profile-form" onSubmit={save} noValidate>
      <div class="p-form-head">
        <Avatar p={p} size="l" />
        <div>
          <h2>Můj profil</h2>
          <p class="muted">Jak se chceš představit lidem, kteří používají Šprtám. Vyplň jen to, co chceš.</p>
        </div>
      </div>
      <label class="field"><span>Jméno</span>
        <input value={p.name} onInput={(e) => set('name', e.currentTarget.value)} maxLength={PROFILE_LIMITS.name} autoComplete="name" required />
        <small>Ukazuje se u témat, která zkontroluješ, v historii a ve veřejném učivu ke stažení. Klidně s titulem. U témat zkontrolovaných dřív zůstane to předchozí.</small></label>
      <label class="field"><span>Kdo jsem <em>(jedna věta)</em></span>
        <input value={p.headline} onInput={(e) => set('headline', e.currentTarget.value)} maxLength={PROFILE_LIMITS.headline} placeholder="Např. Učitelka matematiky a fyziky na ZŠ v Brně" /></label>
      <label class="field"><span>O mně <em>(nepovinné)</em></span>
        <textarea rows={5} value={p.bio} onInput={(e) => set('bio', e.currentTarget.value)} maxLength={PROFILE_LIMITS.bio} style={{ overflow: 'auto', resize: 'vertical' }}
          placeholder="Co učíš nebo děláš, proč pomáháš se Šprtámem, na co si u učiva dáváš pozor…" />
        <small>{p.bio.length} / {PROFILE_LIMITS.bio} znaků. Prázdný řádek oddělí odstavce.</small></label>
      <fieldset class="field">
        <legend>Předměty, kterým se věnuješ <em>(nejvýš {PROFILE_LIMITS.subjects})</em></legend>
        <div class="chips small p-pick">{Object.keys(SUBJECTS).map(chip)}</div>
        {vocational.length > 0 && (
          <details class="p-more" open={p.subjects.some((s) => vocational.includes(s))}>
            <summary>Odborné předměty</summary>
            <div class="chips small p-pick">{vocational.map(chip)}</div>
          </details>
        )}
      </fieldset>
      <label class="field"><span>Web <em>(nepovinné)</em></span>
        <input type="url" inputMode="url" value={p.web} onInput={(e) => set('web', e.currentTarget.value)} maxLength={PROFILE_LIMITS.web} placeholder="https://…" />
        <small>Třeba stránky školy, tvůj blog nebo profil na LinkedIn. E-mail ani telefon sem nepiš.</small></label>
      <fieldset class="field">
        <legend>Obrázek</legend>
        <div class="avatar-pick" role="radiogroup" aria-label="Obrázek">
          <label class={`ap ${!p.avatar ? 'on' : ''}`} title="Iniciály"><input type="radio" name="avatar" checked={!p.avatar} onChange={() => set('avatar', '')} /><Avatar p={{ ...p, avatar: '' }} size="s" /></label>
          {AVATARS.map((a) => (
            <label key={a} class={`ap ${p.avatar === a ? 'on' : ''}`}><input type="radio" name="avatar" checked={p.avatar === a} onChange={() => set('avatar', a)} aria-label={a} /><span class="avatar s pic" aria-hidden="true">{a}</span></label>
          ))}
        </div>
      </fieldset>
      <label class="radio p-public"><input type="checkbox" checked={p.public} onChange={(e) => set('public', e.currentTarget.checked)} />
        <span><b>Zobrazit profil veřejně</b><br /><small class="muted">Na stránce <a href="/moderatori" onClick={nav('/moderatori')}>Kdo kontroluje učivo</a> a po kliknutí na tvoje jméno u tématu v aplikaci Šprtám. Bez toho ho vidí jen ostatní moderátoři.</small></span></label>
      {error && <div class="banner bad" role="alert">{error}</div>}
      <div class="actions-row">
        <Busy class="btn primary" type="submit" on={busy} disabled={!dirty}><I.check />Uložit profil</Busy>
        <a class="btn" href={`/moderatori/${p.id}`} onClick={nav(`/moderatori/${p.id}`)}><I.eye />Zobrazit profil</a>
      </div>
    </form>
  )
}
