import { type KeyColor, subjectMeta } from '../content/curriculum'
import type { SubjectId } from '../content/types'
import { OBOR_GLYPHS, SUBJECT_GLYPHS } from './glyph-svg'

/** A glyph from src/ui/glyph-svg.ts (the server renders the same markup). */
const Svg = ({ inner }: { inner: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
)

/** Inline style that switches the accent (buttons, meters, soft backgrounds) to a key colour. */
export const keyStyle = (c: KeyColor) => ({ '--c': `var(--k-${c})`, '--on-c': `var(--k-${c}-on)` }) as Record<string, string>
export const subjectStyle = (s: SubjectId) => keyStyle(subjectMeta(s).c)

/** The subject's glyph; an odborný předmět not drawn yet (content, not code) shows its emoji instead. */
export function SubjectGlyph({ s }: { s: SubjectId }) {
  if (Object.hasOwn(SUBJECT_GLYPHS, s)) return <Svg inner={SUBJECT_GLYPHS[s]} />
  return <b class="em glyph-em" aria-hidden="true">{subjectMeta(s).emoji ?? '📘'}</b>
}

/** A small coloured key with the subject glyph. */
export function SubjectKey({ s, size = 'm' }: { s: SubjectId; size?: 's' | 'm' | 'l' }) {
  return <span class={`skey ${size}`} style={subjectStyle(s)}><SubjectGlyph s={s} /></span>
}

/** The glyph of an obor (src/obory.ts); without an id, the odborné školy as a whole. */
export function OborGlyph({ id }: { id?: string }) {
  return <Svg inner={OBOR_GLYPHS[id && Object.hasOwn(OBOR_GLYPHS, id) ? id : 'odborne-skoly']} />
}
