import { useState } from 'preact/hooks'
import { addProfile, AVATARS, editProfile, MAX_PROFILES, NAME_MAX, removeProfile, switchProfile, useProfiles, type Profile } from '../profiles'
import { Link } from '../router'
import { useTitle } from '../seo'
import { Bar } from '../ui/Bar'
import { IArrow, ICheck, IPencil } from '../ui/icons'

// Kdo se učí? (profiles.ts): /profily to switch the pupil, and the section in Nastavení to add, rename and delete them.

export function ProfilesScreen() {
  const r = useProfiles()
  useTitle('Kdo se učí?')
  return (
    <div class="page">
      <Bar title="Kdo se učí?" />
      {r ? (
        <div class="who">
          {r.l.map((x) => (
            <button key={x.id} class={`who-key ${x.id === r.a ? 'on' : ''}`} aria-current={x.id === r.a} onClick={() => switchProfile(x.id)}>
              <span class="who-em" aria-hidden="true">{x.e}</span><b>{x.n}</b>{x.id === r.a && <small>teď</small>}
            </button>
          ))}
        </div>
      ) : <p class="muted lead">Na tomhle zařízení se zatím učí jen jeden.</p>}
      <Link class="row next-list" href="/nastaveni">
        <span class="txt"><b>Přidat nebo upravit</b><small>v nastavení</small></span><IArrow />
      </Link>
    </div>
  )
}

/** The header key of the home screen: who is learning now (only with more than one pupil). */
export function WhoKey() {
  const r = useProfiles()
  const me = r?.l.find((x) => x.id === r.a)
  if (!me) return null
  return <Link class="who-chip" href="/profily" aria-label={`Učí se ${me.n}. Přepnout`}><span aria-hidden="true">{me.e}</span><b>{me.n}</b></Link>
}

export function ProfilesSettings() {
  const r = useProfiles()
  const [form, setForm] = useState<'add' | string | null>(null)
  return (
    <>
      <h2 class="label">Kdo se učí</h2>
      {r ? (
        <div class="list">
          {r.l.map((x) => form === x.id
            ? <ProfileForm key={x.id} initial={x} onSave={(n, e) => { editProfile(x.id, n, e); setForm(null) }} onCancel={() => setForm(null)} onDelete={x.id === r.a ? undefined : () => { removeProfile(x.id); setForm(null) }} />
            : (
              <div key={x.id} class="who-row">
                <button class={`row choice ${x.id === r.a ? 'on' : ''}`} role="radio" aria-checked={x.id === r.a} onClick={() => switchProfile(x.id)}>
                  <span class="who-em" aria-hidden="true">{x.e}</span>
                  <span class="txt"><b>{x.n}</b><small>{x.id === r.a ? 'učí se teď' : 'přepnout'}</small></span>
                  <span class="tick" aria-hidden="true">{x.id === r.a && <ICheck />}</span>
                </button>
                <button class="icon-btn" aria-label={`Upravit: ${x.n}`} onClick={() => setForm(x.id)}><IPencil /></button>
              </div>
            ))}
        </div>
      ) : <p class="muted note">Učí se na tomhle zařízení víc dětí? Každé může mít svůj pokrok, plány a sérii dní. Bez účtů, všechno zůstává jen tady.</p>}
      {form === 'add'
        ? <ProfileForm first={!r} onSave={(n, e, me) => { addProfile(n, e, me); setForm(null) }} onCancel={() => setForm(null)} />
        : (!r || r.l.length < MAX_PROFILES) && <button class="btn ghost block next-list" onClick={() => setForm('add')}>Přidat dalšího</button>}
      {r && <p class="muted note">Přenos pokroku na jiné zařízení posílá jen pokrok toho, kdo se právě učí.</p>}
    </>
  )
}

/** Name and emoji of a pupil. `first` = also name whoever has been learning here so far. */
function ProfileForm({ initial, first, onSave, onCancel, onDelete }: {
  initial?: Profile; first?: boolean; onSave: (n: string, e: string, me?: { n: string; e: string }) => void; onCancel: () => void; onDelete?: () => void
}) {
  const [me, setMe] = useState({ n: '', e: AVATARS[0] })
  const [n, setN] = useState(initial?.n ?? '')
  const [e, setE] = useState(initial?.e ?? AVATARS[first ? 1 : Math.floor(Math.random() * AVATARS.length)])
  const [sure, setSure] = useState(false)
  return (
    <form class="who-form" onSubmit={(ev) => { ev.preventDefault(); onSave(n, e, first ? me : undefined) }}>
      {first && <>
        <label class="field"><span>Kdo se tu učí teď (jeho pokrok zůstane jemu)</span><input value={me.n} maxLength={NAME_MAX} placeholder="Já" onInput={(ev) => setMe({ ...me, n: ev.currentTarget.value })} /></label>
        <Avatars value={me.e} onPick={(x) => setMe({ ...me, e: x })} label="Obrázek toho, kdo se učí teď" />
      </>}
      <label class="field"><span>{initial ? 'Jméno' : 'Kdo přibude'}</span><input value={n} maxLength={NAME_MAX} placeholder="Jméno nebo přezdívka" autoFocus={!first} onInput={(ev) => setN(ev.currentTarget.value)} /></label>
      <Avatars value={e} onPick={setE} label="Obrázek" />
      <div class="self who-actions">
        <button type="button" class="btn ghost" onClick={onCancel}>Zrušit</button>
        <button type="submit" class="btn">{initial ? 'Uložit' : 'Přidat'}</button>
      </div>
      {onDelete && (sure
        ? <div class="sim-sure"><span>Smazat {initial?.n} i s celým pokrokem? Nejde to vrátit.</span><div class="self"><button type="button" class="btn ghost" onClick={() => setSure(false)}>Nechat</button><button type="button" class="btn" onClick={onDelete}>Smazat</button></div></div>
        : <button type="button" class="report-key who-delete" onClick={() => setSure(true)}>Smazat profil</button>)}
    </form>
  )
}

function Avatars({ value, onPick, label }: { value: string; onPick: (e: string) => void; label: string }) {
  return (
    <div class="avatars" role="radiogroup" aria-label={label}>
      {AVATARS.map((x) => <button type="button" key={x} role="radio" aria-checked={x === value} class={x === value ? 'on' : ''} onClick={() => onPick(x)}>{x}</button>)}
    </div>
  )
}
