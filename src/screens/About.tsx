import { ABOUT } from '../about'
import { Bar } from '../ui/Bar'
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
    </div>
  )
}
