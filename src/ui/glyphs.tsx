import type { JSX } from 'preact'
import { isCoreSubject, type KeyColor, subjectMeta } from '../content/curriculum'
import type { CoreSubjectId, SubjectId } from '../content/types'

// Subject glyphs: one geometric family on a 24 grid, 2px strokes plus a few solid
// shapes, drawn to sit on a coloured key (see <SubjectKey>).

const S = (children: JSX.Element) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{children}</svg>
)

export const GLYPHS: Record<CoreSubjectId, () => JSX.Element> = {
  cestina: S(<><path d="M4.5 19.5l1.2-4.6L15.6 5a2 2 0 0 1 2.9 0l.5.5a2 2 0 0 1 0 2.9l-9.9 9.9z" /><path d="M14 6.6l3.4 3.4" /><path d="M13 19.5h6.5" /></>),
  literatura: S(<><path d="M3 5.5c3.2-1.3 6.2-1 9 1v13c-2.8-2-5.8-2.3-9-1z" /><path d="M21 5.5c-3.2-1.3-6.2-1-9 1v13c2.8-2 5.8-2.3 9-1z" /><path d="M6 9.5c1.3-.3 2.6-.2 3.6.4M6 13c1.3-.3 2.6-.2 3.6.4" /></>),
  matematika: S(<><path d="M7 3.8v6.4M3.8 7h6.4" /><path d="M14.6 4.6l4.8 4.8M19.4 4.6l-4.8 4.8" /><path d="M4 15.5h6M4 19h6" /><path d="M14 17.2h6" /><circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="20.4" r="1" fill="currentColor" stroke="none" /></>),
  anglictina: S(<><path d="M4 4.5h16v11.5h-9l-5 4v-4H4z" /><path d="M8 8.5h8M8 12h5" /></>),
  // The other languages: the same speech bubble with their typical mark (umlaut, accent, tilde).
  nemcina: S(<><path d="M4 4.5h16v11.5h-9l-5 4v-4H4z" /><circle cx="10" cy="8.4" r="1.1" fill="currentColor" stroke="none" /><circle cx="14" cy="8.4" r="1.1" fill="currentColor" stroke="none" /><path d="M8 12.2h8" /></>),
  francouzstina: S(<><path d="M4 4.5h16v11.5h-9l-5 4v-4H4z" /><path d="M11 10l2.6-2.8" /><path d="M8 12.6h8" /></>),
  spanelstina: S(<><path d="M4 4.5h16v11.5h-9l-5 4v-4H4z" /><path d="M8.3 9.6c1.1-1.4 2.3-1.4 3.7 0s2.6 1.4 3.7 0" /><path d="M8 12.8h8" /></>),
  prvouka: S(<><path d="M12 20.5V11" /><path d="M12 11.5C12 7.4 9.3 5 5 5c0 4.1 2.7 6.5 7 6.5z" fill="currentColor" fill-opacity=".25" /><path d="M12 9.5c0-3 2-5 5.5-5 0 3-2 5-5.5 5z" /><path d="M6.5 20.5h11" /></>),
  prirodoveda: S(<><path d="M5 19C5 10.5 10.5 5 20 4c-.9 9.6-6.5 15-15 15z" fill="currentColor" fill-opacity=".25" /><path d="M5 19l8.5-8.5M10.5 13.5H15M13.5 10.5V7" /></>),
  vlastiveda: S(<><path d="M5 20.5V8h2.6v2.6H10V8h4v2.6h2.4V8H19v12.5z" /><path d="M10 20.5v-3.8a2 2 0 0 1 4 0v3.8" /><path d="M12 8V3.5l3 1.3-3 1.3" /></>),
  dejepis: S(<><path d="M3.5 8.5L12 4l8.5 4.5z" fill="currentColor" fill-opacity=".25" /><path d="M6 11v6.5M10 11v6.5M14 11v6.5M18 11v6.5" /><path d="M3.5 20.5h17" /></>),
  zemepis: S(<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5s1.2-6.2 3.6-8.5z" /></>),
  prirodopis: S(<><path d="M12 7.5v12" /><path d="M12 11C10.5 6 7.5 4 4.6 4.6c-1.6 3.2-.3 6.8 3 7.4 1.6.3 3.1 0 4.4-1z" fill="currentColor" fill-opacity=".25" /><path d="M12 11c1.5-5 4.5-7 7.4-6.4 1.6 3.2.3 6.8-3 7.4-1.6.3-3.1 0-4.4-1z" fill="currentColor" fill-opacity=".25" /><path d="M12 13c-2.6.2-5 1.8-5 4.3 0 1.6 1.6 2.3 3 1.4 1.2-.8 1.8-2.8 2-5.7.2 2.9.8 4.9 2 5.7 1.4.9 3 .2 3-1.4 0-2.5-2.4-4.1-5-4.3z" /><path d="M10.5 4.5L12 7.5l1.5-3" /></>),
  biologie: S(<><path d="M7 3.5c0 4.8 10 4.2 10 8.5s-10 3.7-10 8.5" /><path d="M17 3.5c0 4.8-10 4.2-10 8.5s10 3.7 10 8.5" /><path d="M9 6.5h6M9 17.5h6" /></>),
  fyzika: S(<><ellipse cx="12" cy="12" rx="9" ry="3.6" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></>),
  chemie: S(<><path d="M9 3.5h6M10 3.5v6L4.6 18.8A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9.5v-6" /><path d="M6.8 15h10.4l1.6 3.8a.9.9 0 0 1-.8 1.2H6a.9.9 0 0 1-.8-1.2z" fill="currentColor" stroke="none" /><circle cx="13" cy="12" r=".9" fill="currentColor" stroke="none" /></>),
  obcanska: S(<><circle cx="8.5" cy="7.5" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M3 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M14.5 14.4c.6-.3 1.3-.4 2-.4 2.6 0 4.5 2 4.5 5" /></>),
  zsv: S(<><path d="M12 4.5v15.5M8 20h8M5 7.5h14" /><circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none" /><path d="M5 7.5l-2.8 6h5.6zM19 7.5l-2.8 6h5.6z" /><path d="M2.2 13.5a2.8 2.8 0 0 0 5.6 0M16.2 13.5a2.8 2.8 0 0 0 5.6 0" fill="currentColor" fill-opacity=".25" /></>),
  informatika: S(<><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx=".8" fill="currentColor" stroke="none" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>),
}

/** Inline style that switches the accent (buttons, meters, soft backgrounds) to a key colour. */
export const keyStyle = (c: KeyColor) => ({ '--c': `var(--k-${c})`, '--on-c': `var(--k-${c}-on)` }) as Record<string, string>
export const subjectStyle = (s: SubjectId) => keyStyle(subjectMeta(s).c)

/** The subject's glyph; odborné předměty (content, not code) show their emoji instead. */
export function SubjectGlyph({ s }: { s: SubjectId }) {
  if (isCoreSubject(s)) { const G = GLYPHS[s]; return <G /> }
  return <b class="em glyph-em" aria-hidden="true">{subjectMeta(s).emoji ?? '📘'}</b>
}

/** A small coloured key with the subject glyph. */
export function SubjectKey({ s, size = 'm' }: { s: SubjectId; size?: 's' | 'm' | 'l' }) {
  return <span class={`skey ${size}`} style={subjectStyle(s)}><SubjectGlyph s={s} /></span>
}
