import { ABOUT } from '../about'
import { Bar } from '../ui/Bar'
import { IArrow } from '../ui/icons'
import { Inline } from '../ui/Inline'
import { Mascot } from '../ui/Mascot'

// /o-aplikaci – what Šprtám is, how it works and what it does (not) keep about you.

export function About() {
  return (
    <div class="page about">
      <Bar title={ABOUT.title} />
      <div class="about-lead"><Mascot mood="happy" size={56} /><p><Inline text={ABOUT.lead} /></p></div>
      {ABOUT.sections.map((s) => (
        <section key={s.title}>
          <h2 class="label next-label">{s.title}</h2>
          <ul class="about-list">{s.items.map((x) => <li key={x}><Inline text={x} /></li>)}</ul>
        </section>
      ))}
      <section>
        <h2 class="label next-label">{ABOUT.code.title}</h2>
        <div class="list">
          {ABOUT.code.links.map((l) => (
            <a key={l.href} class="row" href={l.href} rel="noopener">
              <span class="txt"><b>{l.label}</b><small>{l.hint}</small></span><IArrow />
            </a>
          ))}
        </div>
      </section>
      <section class="about-join card">
        <h2>{ABOUT.join.title}</h2>
        <p>{ABOUT.join.lead}</p>
        <ul>{ABOUT.join.items.map((x) => <li key={x}><Inline text={x} /></li>)}</ul>
        <a class="btn block" href={ABOUT.join.form.href} target="_blank" rel="noopener">{ABOUT.join.form.label}</a>
        <a class="btn ghost block" href={`mailto:${ABOUT.join.email}`}>Napiš na {ABOUT.join.email}</a>
      </section>
    </div>
  )
}
