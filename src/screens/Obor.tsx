import { GRADE_NAME, gradeSubjects, ODB, subjectMeta } from '../content/curriculum'
import { hasSubject } from '../content'
import { kindName, OBOR_PATH, readyObory, setObor, useObor, yearGrade, type Obor } from '../obory'
import { Link } from '../router'
import { titles, useTitle } from '../seo'
import { Bar } from '../ui/Bar'
import { keyStyle } from '../ui/glyphs'
import { IArrow } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { OdbTiles } from './Browse'

// Obory odborných škol (src/obory.ts): /obor lists them, /obor/<id> shows one obor year by year. Choosing an obor
// (a device setting, never sent anywhere) turns the SŠ grade screens into that obor's years.

const STYLE = keyStyle('ink')

export function OborScreen({ id }: { id?: string }) {
  if (!id) return <OborList />
  // Only obory with some content are offered (as the server's pages).
  const o = readyObory((s) => hasSubject(ODB, s)).find((x) => x.id === id)
  if (!o) return <div class="page" style={STYLE}><Bar title="Odborné školy" /><div class="empty">Tenhle obor tu není.<Link class="btn" href={OBOR_PATH}>Všechny obory</Link></div></div>
  return <OborHome o={o} />
}

function OborList() {
  const mine = useObor()
  useTitle(titles.obory())
  const obory = readyObory((s) => hasSubject(ODB, s))
  return (
    <div class="page" style={STYLE}>
      <Bar title="🛠️ Odborné školy" />
      <div class="blocks approach-about">
        <p>Vyber si svůj obor a ukážeme ti jeho odborné předměty ročník po ročníku. Všeobecné předměty (čeština, matematika, angličtina…) procvičíš s učivem gymnázia stejného ročníku.</p>
      </div>
      <h2 class="label">Obory</h2>
      {!obory.length && <div class="empty">Připravujeme.</div>}
      <div class="list">
        {obory.map((o) => (
          <Link key={o.id} class={`row obor-row ${mine?.id === o.id ? 'on' : ''}`} href={`${OBOR_PATH}/${o.id}`}>
            <span class="em">{o.emoji}</span>
            <span class="txt"><b>{o.name}</b><small>{o.code} · {kindName(o)}{mine?.id === o.id ? ' · můj obor' : ''}</small></span>
            <IArrow />
          </Link>
        ))}
      </div>
      {gradeSubjects(ODB).length > 0 && <Link class="row obor-all" href={`/g/${ODB}`}>
        <span class="txt"><b>Všechny odborné předměty</b><small>bez ohledu na obor</small></span>
        <IArrow />
      </Link>}
      <p class="muted obor-more">Další obory přibývají. Chybí ti ten tvůj? Napiš nám na <a href="mailto:info@sprtam.cz">info@sprtam.cz</a>.</p>
    </div>
  )
}

function OborHome({ o }: { o: Obor }) {
  const on = useObor()?.id === o.id
  useTitle(titles.obor(o.name))
  return (
    <div class="page" style={STYLE}>
      <Bar title={`${o.emoji} ${o.name}`} crumbs={[{ href: OBOR_PATH, label: 'Odborné školy' }]} />
      <p class="exam-facts"><span>{o.code}</span><span>{kindName(o)}</span><span>{o.years.length} ročníky</span></p>
      <div class="blocks approach-about"><p><Inline text={o.about} /></p></div>
      <button class="row approach-switch" role="switch" aria-checked={on} onClick={() => setObor(on ? undefined : o.id)}>
        <span class="txt"><b>Studuju tenhle obor</b><small>{on ? 'Ročníky SŠ ti ukážou předměty tohohle oboru' : 'Zapni a ročníky SŠ se přizpůsobí oboru'}</small></span>
        <span class={`switch ${on ? 'on' : ''}`} aria-hidden="true"><i /></span>
      </button>
      {o.years.map((y, i) => {
        const g = yearGrade(i)
        const general = y.general.filter((s) => hasSubject(g, s))
        return (
          <section key={g} class="obor-year">
            <h2 class="label">{GRADE_NAME[g]}</h2>
            <OdbTiles subjects={y.odb} />
            {general.length > 0 && (
              <p class="obor-general muted">
                Všeobecné: {general.map((s, k) => <span key={s}>{k > 0 && ', '}<Link href={`/g/${g}/${s}`}>{subjectMeta(s).name}</Link></span>)}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
