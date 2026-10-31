import { extras, type Extra } from '../games'
import { Link } from '../router'
import { levelsOf } from '../vocab'
import { keyStyle } from './glyphs'
import { IArrow } from './icons'

/** Every extra of the current release (src/games.ts). */
export const appExtras = () => extras(levelsOf)

/** An extra as a key: its emoji or glyph, name and a hint (by default its own). */
export function ExtraRow({ x, hint }: { x: Extra; hint?: string }) {
  return (
    <Link class="row extra-key" style={keyStyle(x.c)} href={x.path}>
      <span class="skey m">{x.emoji ? <b class="em">{x.emoji}</b> : <b>{x.glyph}</b>}</span>
      <span class="txt"><b>{x.name}</b><small>{hint ?? x.hint}</small></span>
      <IArrow />
    </Link>
  )
}

/** Extras placed on a screen, under a label; nothing when there are none. */
export function ExtraList({ list }: { list: Extra[] }) {
  if (!list.length) return null
  const games = list.some((x) => x.kind === 'hra'), prep = list.some((x) => x.kind === 'priprava')
  return (
    <section class="sec extras">
      <h2 class="label">{games && prep ? 'Hry a příprava' : games ? 'Hry' : 'Příprava'}</h2>
      <div class="list">{list.map((x) => <ExtraRow key={x.id} x={x} />)}</div>
    </section>
  )
}
