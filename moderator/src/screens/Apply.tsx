import { useEffect, useState } from 'preact/hooks'
import type { TopicFile } from '../../../src/content/types'
import { CONTENT_AUTHOR } from '../../../src/content/verified'
import { ApiError, get, post } from '../api'
import type { Me } from '../passkey'
import { nav } from '../router'
import { Busy, I } from '../ui/kit'

// /zapojit-se[?tema=<grade>/<subject>/<id>]: anyone may ask to become a moderator and check the content. The app
// links here from every topic nobody has checked yet ("Chci to zkontrolovat a schválit"). An admin approves the
// application with an invite link (screens/Applications.tsx).

const TOPIC = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/

export function Apply({ me }: { me: Me | null }) {
  const [topicKey] = useState(() => { const t = new URLSearchParams(location.search).get('tema'); return t && TOPIC.test(t) ? t : null })
  const [topic, setTopic] = useState<TopicFile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [teacher, setTeacher] = useState<boolean | null>(null)
  const [subjects, setSubjects] = useState('')
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (topicKey) get<{ topic: TopicFile }>(`/api/content/topic/${topicKey}`).then((r) => setTopic(r.topic), () => {})
  }, [topicKey])

  const send = async (e: Event) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Napiš své jméno.')
    if (!/^\S+@\S+\.\S{2,}$/.test(email.trim())) return setError('Napiš e-mail, na který ti můžeme odpovědět.')
    if (teacher === null) return setError('Vyber, jestli učíš.')
    if (teacher && subjects.trim().length < 2) return setError('Napiš, jaké předměty učíš.')
    setBusy(true)
    try {
      await post('/api/applications', { name, email, teacher, subjects: teacher ? subjects : '', note, topic: topicKey, website })
      setSent(true)
      scrollTo(0, 0)
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Žádost se nepodařilo odeslat. Zkus to znovu.') } finally { setBusy(false) }
  }

  if (me) return (
    <div class="page-narrow apply">
      <div class="card plain">
        <h1>Už jsi moderátor/ka</h1>
        <p>Témata, která ještě nikdo nezkontroloval, najdeš v seznamu <a href="/ucivo?neovereno=1" onClick={nav('/ucivo?neovereno=1')}>Neověřená témata</a>.
          {topicKey && <> Téma, ze kterého jsi přišel/přišla, je <a href={`/ucivo/${topicKey}`} onClick={nav(`/ucivo/${topicKey}`)}>tady</a>.</>}</p>
      </div>
    </div>
  )

  if (sent) return (
    <div class="page-narrow apply">
      <div class="card plain" role="status">
        <h1><I.check /> Díky, žádost máme</h1>
        <p>Přečte si ji správce Šprtámu. Když ji schválí, pošle ti na <b>{email.trim()}</b> odkaz, kterým si vytvoříš účet v moderaci. Přihlašuje se přístupovým klíčem (otiskem prstu, obličejem nebo PINem zařízení), žádné heslo.</p>
        <p class="muted">Mezitím si můžeš učivo prohlížet: <a href={topicKey ? `/ucivo/${topicKey}` : '/'} onClick={nav(topicKey ? `/ucivo/${topicKey}` : '/')}>{topicKey && topic ? `${topic.emoji} ${topic.title}` : 'Učivo Šprtámu'}</a>.</p>
      </div>
    </div>
  )

  return (
    <div class="page-narrow apply">
      <div class="intro">
        <h1>Pomoz zkontrolovat učivo</h1>
        <p class="lead">Učivo Šprtámu zatím celé napsala umělá inteligence <b>{CONTENT_AUTHOR}</b>. Nechceme to skrývat: u každého tématu je vidět, jestli ho už zkontroloval člověk a kdo.</p>
        <p>Moderátoři čtou výklad i otázky se správnými odpověďmi a téma <b>schválí</b>, nebo ho rovnou opraví v editoru. Jejich jméno se pak u tématu ukáže. Hodí se nám hlavně učitelé, ale i kdokoli, kdo se v oboru vyzná.</p>
        {topic && <div class="banner info"><I.book /><span>Přicházíš od tématu <b>{topic.emoji} {topic.title}</b>. Pošleme ti ho k ověření jako první.</span></div>}
      </div>
      <form class="card plain form" onSubmit={send} noValidate>
        <h2>Žádost o účet moderátora</h2>
        <label class="field"><span>Jméno a příjmení</span>
          <input value={name} onInput={(e) => setName(e.currentTarget.value)} autoComplete="name" maxLength={80} required />
          <small>Uvidí ho ostatní moderátoři a objeví se u témat, která zkontroluješ.</small></label>
        <label class="field"><span>E-mail</span>
          <input type="email" value={email} onInput={(e) => setEmail(e.currentTarget.value)} autoComplete="email" maxLength={200} required />
          <small>Jen pro odpověď na žádost. Nikde se neukazuje a nikomu ho nedáme.</small></label>
        <fieldset class="field">
          <legend>Jsi pedagog/pedagožka?</legend>
          <label class="radio"><input type="radio" name="teacher" checked={teacher === true} onChange={() => setTeacher(true)} /><span>Ano, učím</span></label>
          <label class="radio"><input type="radio" name="teacher" checked={teacher === false} onChange={() => setTeacher(false)} /><span>Ne</span></label>
        </fieldset>
        {teacher && (
          <label class="field"><span>Jaké předměty učíš?</span>
            <input value={subjects} onInput={(e) => setSubjects(e.currentTarget.value)} placeholder="Např. matematika a fyzika na 2. stupni ZŠ" maxLength={300} /></label>
        )}
        <label class="field"><span>Něco dalšího? <em>(nepovinné)</em></span>
          <textarea rows={4} value={note} onInput={(e) => setNote(e.currentTarget.value)} maxLength={2000} placeholder={teacher === false ? 'Co tě k tomu vede, v čem se vyznáš…' : 'Kde učíš, co bys chtěl/a kontrolovat…'} /></label>
        {/* Hidden from people; only bots fill it in. */}
        <label class="hp" aria-hidden="true">Web<input tabIndex={-1} autoComplete="off" value={website} onInput={(e) => setWebsite(e.currentTarget.value)} /></label>
        {error && <div class="banner bad" role="alert">{error}</div>}
        <Busy class="btn primary" type="submit" on={busy}>Odeslat žádost</Busy>
        <p class="fine">Žádost uvidí jen správci Šprtámu. Vyřízenou žádost (i s e-mailem) po půl roce smažeme. Učivo je pod licencí <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.cs" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</p>
      </form>
    </div>
  )
}
