// Subject and obor glyphs: one geometric family on a 24 grid, 2px round strokes plus a few solid shapes and
// 25 % tints, drawn to sit on a coloured key (<SubjectKey>, .tile-face). Plain SVG markup, so the app
// (src/ui/glyphs.tsx) and the server-rendered pages (server/pages.ts) draw exactly the same thing.

const dot = (cx: number, cy: number, r = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`
const tint = (d: string) => `<path d="${d}" fill="currentColor" fill-opacity=".25"/>`
const p = (...d: string[]) => d.map((x) => `<path d="${x}"/>`).join('')
const BUBBLE = 'M4 4.5h16v11.5h-9l-5 4v-4H4z'
// Four-point sparkle, top right (kosmetika, kosmetické služby).
const SPARKLE = '<path d="M19.5 1.8c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7z" fill="currentColor" stroke-width="1"/>'
const WINDOW = '<rect x="3" y="4.5" width="18" height="15" rx="2"/>'

/** Core subjects (src/content/curriculum.ts SUBJECTS). */
const CORE: Record<string, string> = {
  cestina: p('M4.5 19.5l1.2-4.6L15.6 5a2 2 0 0 1 2.9 0l.5.5a2 2 0 0 1 0 2.9l-9.9 9.9z', 'M14 6.6l3.4 3.4', 'M13 19.5h6.5'),
  literatura: p('M3 5.5c3.2-1.3 6.2-1 9 1v13c-2.8-2-5.8-2.3-9-1z', 'M21 5.5c-3.2-1.3-6.2-1-9 1v13c2.8-2 5.8-2.3 9-1z', 'M6 9.5c1.3-.3 2.6-.2 3.6.4M6 13c1.3-.3 2.6-.2 3.6.4'),
  matematika: p('M7 3.8v6.4M3.8 7h6.4', 'M14.6 4.6l4.8 4.8M19.4 4.6l-4.8 4.8', 'M4 15.5h6M4 19h6', 'M14 17.2h6') + dot(17, 14) + dot(17, 20.4),
  anglictina: p(BUBBLE, 'M8 8.5h8M8 12h5'),
  // The other languages: the same speech bubble with their typical mark (umlaut, accent, tilde).
  nemcina: p(BUBBLE) + dot(10, 8.4, 1.1) + dot(14, 8.4, 1.1) + p('M8 12.2h8'),
  francouzstina: p(BUBBLE, 'M11 10l2.6-2.8', 'M8 12.6h8'),
  spanelstina: p(BUBBLE, 'M8.3 9.6c1.1-1.4 2.3-1.4 3.7 0s2.6 1.4 3.7 0', 'M8 12.8h8'),
  prvouka: p('M12 20.5V11') + tint('M12 11.5C12 7.4 9.3 5 5 5c0 4.1 2.7 6.5 7 6.5z') + p('M12 9.5c0-3 2-5 5.5-5 0 3-2 5-5.5 5z', 'M6.5 20.5h11'),
  prirodoveda: tint('M5 19C5 10.5 10.5 5 20 4c-.9 9.6-6.5 15-15 15z') + p('M5 19l8.5-8.5M10.5 13.5H15M13.5 10.5V7'),
  vlastiveda: p('M5 20.5V8h2.6v2.6H10V8h4v2.6h2.4V8H19v12.5z', 'M10 20.5v-3.8a2 2 0 0 1 4 0v3.8', 'M12 8V3.5l3 1.3-3 1.3'),
  dejepis: tint('M3.5 8.5L12 4l8.5 4.5z') + p('M6 11v6.5M10 11v6.5M14 11v6.5M18 11v6.5', 'M3.5 20.5h17'),
  zemepis: '<circle cx="12" cy="12" r="8.5"/>' + p('M3.5 12h17', 'M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5s1.2-6.2 3.6-8.5z'),
  prirodopis: p('M12 7.5v12') + tint('M12 11C10.5 6 7.5 4 4.6 4.6c-1.6 3.2-.3 6.8 3 7.4 1.6.3 3.1 0 4.4-1z') + tint('M12 11c1.5-5 4.5-7 7.4-6.4 1.6 3.2.3 6.8-3 7.4-1.6.3-3.1 0-4.4-1z') + p('M12 13c-2.6.2-5 1.8-5 4.3 0 1.6 1.6 2.3 3 1.4 1.2-.8 1.8-2.8 2-5.7.2 2.9.8 4.9 2 5.7 1.4.9 3 .2 3-1.4 0-2.5-2.4-4.1-5-4.3z', 'M10.5 4.5L12 7.5l1.5-3'),
  biologie: p('M7 3.5c0 4.8 10 4.2 10 8.5s-10 3.7-10 8.5', 'M17 3.5c0 4.8-10 4.2-10 8.5s10 3.7 10 8.5', 'M9 6.5h6M9 17.5h6'),
  fyzika: '<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/>' + dot(12, 12, 1.6),
  chemie: p('M9 3.5h6M10 3.5v6L4.6 18.8A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9.5v-6') + '<path d="M6.8 15h10.4l1.6 3.8a.9.9 0 0 1-.8 1.2H6a.9.9 0 0 1-.8-1.2z" fill="currentColor" stroke="none"/>' + dot(13, 12, 0.9),
  obcanska: '<circle cx="8.5" cy="7.5" r="3"/><circle cx="16.5" cy="9" r="2.5"/>' + p('M3 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6', 'M14.5 14.4c.6-.3 1.3-.4 2-.4 2.6 0 4.5 2 4.5 5'),
  zsv: p('M12 4.5v15.5M8 20h8M5 7.5h14') + dot(12, 4, 1.2) + p('M5 7.5l-2.8 6h5.6zM19 7.5l-2.8 6h5.6z') + tint('M2.2 13.5a2.8 2.8 0 0 0 5.6 0M16.2 13.5a2.8 2.8 0 0 0 5.6 0'),
  informatika: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".8" fill="currentColor" stroke="none"/>' + p('M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3'),
}

/** Odborné předměty (content at topics/odb/<id>, listed per obor in src/obory.ts). A předmět without a glyph here
 *  shows the emoji from its _subject, so the content can found new ones before they get drawn. */
const VOCATIONAL: Record<string, string> = {
  // Informační technologie
  hardware: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/>' + p('M9.5 6.5h5M9.5 9.5h5') + '<circle cx="12" cy="16" r="2" fill="currentColor" fill-opacity=".25"/>',
  'operacni-systemy': WINDOW + p('M3 9h18') + dot(6, 6.8, 0.9) + dot(8.6, 6.8, 0.9) + '<rect x="6.5" y="12" width="4.5" height="4.5" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="13" y="12" width="4.5" height="4.5" rx="1"/>',
  programovani: p('M8 7l-5 5 5 5', 'M16 7l5 5-5 5', 'M13.5 4.5l-3 15'),
  web: WINDOW + '<rect x="6" y="7.5" width="12" height="3" rx="1.5"/>' + '<path d="M10.5 12.5v6.2l1.7-1.6 1.3 2.7 1.6-.8-1.3-2.6h2.3z" fill="currentColor" stroke-width="1"/>',
  site: '<rect x="8.5" y="2.5" width="7" height="5" rx="1.2"/>' + p('M12 7.5V12M4.5 12h15M4.5 12v3.5M12 12v3.5M19.5 12v3.5') + '<rect x="2.5" y="15.5" width="4" height="4" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="10" y="15.5" width="4" height="4" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="17.5" y="15.5" width="4" height="4" rx="1" fill="currentColor" fill-opacity=".25"/>',
  elektronika: p('M2.5 12h4M17.5 12h4') + '<rect x="6.5" y="8.5" width="11" height="7" rx="3.5" fill="currentColor" fill-opacity=".25"/>' + p('M10 8.7v6.6M13.5 8.7v6.6'),
  databaze: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5" fill="currentColor" fill-opacity=".25"/>' + p('M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13', 'M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5'),
  kyberbezpecnost: p('M12 2.8l7.5 3v5.7c0 4.6-3.2 8.4-7.5 9.7-4.3-1.3-7.5-5.1-7.5-9.7V5.8z') + dot(12, 10.5, 2) + p('M12 12v3.8'),
  ekonomika: '<rect x="2.5" y="6" width="19" height="12" rx="2"/>' + '<circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity=".25"/>' + dot(6, 9.5) + dot(18, 14.5),
  // Strojírenství a mechatronika
  'technicke-kresleni': p('M4 20.5V3.5l17 17z', 'M8 16.5v-5l5 5z', 'M4 7.5h2M4 11h2M4 14.5h2'),
  materialy: tint('M5 3.5h14V7h-5v10h5v3.5H5V17h5V7H5z') + p('M5 3.5h14V7h-5v10h5v3.5H5V17h5V7H5z'),
  mechanika: p('M6.5 3h11M12 3v.5') + '<circle cx="12" cy="7.5" r="3.5"/>' + dot(12, 7.5) + p('M8.5 7.5v7.5M15.5 7.5v11', 'M13.5 16.5l2 2 2-2') + '<rect x="5.5" y="15" width="6" height="5.5" rx="1" fill="currentColor" fill-opacity=".25"/>',
  technologie: tint('M3.5 7.5h14c1.7 0 3-.7 3.5-1.2-.2 3-2.6 5.2-5.5 5.2H14V15h2.5v3.5h-9V15H10v-3.5H8.5C5.8 11.5 3.8 9.9 3.5 7.5z') + p('M3.5 7.5h14c1.7 0 3-.7 3.5-1.2-.2 3-2.6 5.2-5.5 5.2H14V15h2.5v3.5h-9V15H10v-3.5H8.5C5.8 11.5 3.8 9.9 3.5 7.5z', 'M5 21h14'),
  stroje: p('M17.6 7.9L19.9 7.3L20.9 9.7L18.8 11A6.9 6.9 0 0 1 18.8 13L20.9 14.3L19.9 16.7L17.6 16.1A6.9 6.9 0 0 1 16.1 17.6L16.7 19.9L14.3 20.9L13 18.8A6.9 6.9 0 0 1 11 18.8L9.7 20.9L7.3 19.9L7.9 17.6A6.9 6.9 0 0 1 6.4 16.1L4.1 16.7L3.1 14.3L5.2 13A6.9 6.9 0 0 1 5.2 11L3.1 9.7L4.1 7.3L6.4 7.9A6.9 6.9 0 0 1 7.9 6.4L7.3 4.1L9.7 3.1L11 5.2A6.9 6.9 0 0 1 13 5.2L14.3 3.1L16.7 4.1L16.1 6.4A6.9 6.9 0 0 1 17.6 7.9z') + '<circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity=".25"/>',
  elektrotechnika: p('M9 2.5V7M15 2.5V7') + tint('M6 7h12v3a6 6 0 0 1-12 0z') + p('M6 7h12v3a6 6 0 0 1-12 0z', 'M12 16v5.5'),
  cnc: '<rect x="7.5" y="2.5" width="9" height="5" rx="1"/>' + p('M10 7.5l.8 3h2.4l.8-3', 'M12 10.5V16', 'M10.8 12.3l2.4 1M10.8 14.3l2.4 1') + '<rect x="3.5" y="17" width="17" height="4" rx="1" fill="currentColor" fill-opacity=".25"/>' + p('M3.5 17h17'),
  automatizace: '<rect x="2.5" y="14.5" width="19" height="5.5" rx="2.75"/>' + dot(5.3, 17.25) + dot(18.7, 17.25) + dot(12, 17.25) + '<rect x="5" y="7.5" width="6" height="7" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="13.5" y="10" width="4.5" height="4.5" rx="1"/>' + p('M14 6h5.5M17.5 4l2 2-2 2'),
  // Kosmetické služby
  zdravoveda: p('M12 20s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.4C20 15.3 12 20 12 20z', 'M3 12.5h4.5l1.5-2.5 2.5 5 1.8-3h7.7'),
  kosmetika: tint('M11 3.5c3.6 4 6 7.3 6 10.5a6 6 0 0 1-12 0c0-3.2 2.4-6.5 6-10.5z') + p('M11 3.5c3.6 4 6 7.3 6 10.5a6 6 0 0 1-12 0c0-3.2 2.4-6.5 6-10.5z', 'M8.5 14a2.5 2.5 0 0 0 2.5 2.5') + SPARKLE,
  'kosmeticke-pripravky': '<rect x="5" y="4" width="14" height="4.5" rx="1.5" fill="currentColor" fill-opacity=".25"/>' + p('M6.5 8.5h11v10a2.5 2.5 0 0 1-2.5 2.5H9a2.5 2.5 0 0 1-2.5-2.5z', 'M9.5 14h5'),
  komunikace: p('M3 4.5h11.5v8H8.5l-3.5 3v-3H3z', 'M14.5 9H21v8h-2v3l-3.5-3h-5.5v-4.5'),
  manikura: '<rect x="9.5" y="2.5" width="5" height="7" rx="1"/>' + tint('M6.5 12a2.5 2.5 0 0 1 2.5-2.5h6a2.5 2.5 0 0 1 2.5 2.5v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z') + p('M6.5 12a2.5 2.5 0 0 1 2.5-2.5h6a2.5 2.5 0 0 1 2.5 2.5v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z', 'M10 13.5v4'),
  vizaz: '<rect x="7.5" y="13.5" width="9" height="8" rx="1.2"/>' + p('M9 13.5v-3h6v3') + tint('M10 10.5V6.8L14 3.5v7z') + p('M10 10.5V6.8L14 3.5v7'),
  // Starožitník
  'dejiny-umeni': p('M5.5 20.5V11.5C5.5 7.6 8.2 4.6 12 2.8c3.8 1.8 6.5 4.8 6.5 8.7v9', 'M3.5 20.5h17', 'M9 20.5v-5.5a3 3 0 0 1 6 0v5.5') + '<circle cx="12" cy="8.6" r="1.7" fill="currentColor" fill-opacity=".25"/>',
  nabytek: '<rect x="4" y="4.5" width="16" height="13" rx="1.5"/>' + p('M4 11h16', 'M6.5 17.5v3M17.5 17.5v3') + dot(12, 7.75, 1.1) + dot(12, 14.25, 1.1),
  'sklo-porcelan': tint('M5 8.5h11v4a5.5 5.5 0 0 1-11 0z') + p('M5 8.5h11v4a5.5 5.5 0 0 1-11 0z', 'M16 10h1.5a2.5 2.5 0 0 1 0 5h-2.2', 'M3.5 21h14', 'M8.5 3.5c-.8 1 .8 1.7 0 2.7M12.5 3.5c-.8 1 .8 1.7 0 2.7'),
  'kovy-sperky': '<circle cx="12" cy="15" r="6"/>' + tint('M9.2 5.2l1.4-2.2h2.8l1.4 2.2L12 9z') + p('M9.2 5.2l1.4-2.2h2.8l1.4 2.2L12 9z', 'M9.2 5.2h5.6'),
  'obrazy-grafika': '<rect x="3" y="4" width="18" height="16" rx="1.5"/><rect x="6" y="7" width="12" height="10" rx=".5"/>' + tint('M6 17l4-5 3 3.5 2-2 3 3.5z') + dot(14.8, 9.8, 1.1),
  starozitnictvi: tint('M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7l8.6 8.6a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0z') + p('M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7l8.6 8.6a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0z') + '<circle cx="7.5" cy="7.5" r="1.6"/>',
}

/** Obory (src/obory.ts) and the odborné školy as a whole. */
const OBORY: Record<string, string> = {
  'odborne-skoly': p('M3 9.5h18v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z', 'M9 9.5V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5v3', 'M3 14h18') + '<rect x="10" y="12.3" width="4" height="3.4" rx=".8" fill="currentColor" stroke="none"/>',
  'informacni-technologie': '<rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5"/>' + p('M2.5 19h19l-2-4h-15z', 'M8.5 8l2.2 1.8-2.2 1.8', 'M12.5 11.6h3'),
  strojirenstvi: '<rect x="3" y="3.5" width="18" height="4.5" rx="1" fill="currentColor" fill-opacity=".25"/>' + p('M3 3.5h18v4.5H3z', 'M5 8v12l3-4V8', 'M13 8v12l3-4V8', 'M11.5 3.5v4.5M17.5 3.5v4.5'),
  mechatronik: p('M4 20.5h8', 'M8 20.5v-3', 'M9 14.3l3.8-5.3', 'M15.8 7.8l3.4 2', 'M19.2 9.8l1.6 2.4M19.2 9.8l-.4 2.9') + '<circle cx="8" cy="15.5" r="2" fill="currentColor" fill-opacity=".25"/><circle cx="14" cy="7.5" r="2" fill="currentColor" fill-opacity=".25"/>',
  'kosmeticke-sluzby': '<circle cx="11" cy="13" r="7.5"/>' + p('M7.6 12.2c.6.7 1.7.7 2.3 0M12.1 12.2c.6.7 1.7.7 2.3 0', 'M9 16.3c1.2.9 2.8.9 4 0') + SPARKLE,
  starozitnik: tint('M10 6c-3 1.5-4.5 4-4.5 7.5 0 4 2.6 6.5 6.5 7.5 3.9-1 6.5-3.5 6.5-7.5 0-3.5-1.5-6-4.5-7.5z') + p('M9 3h6', 'M10 3v3c-3 1.5-4.5 4-4.5 7.5 0 4 2.6 6.5 6.5 7.5 3.9-1 6.5-3.5 6.5-7.5 0-3.5-1.5-6-4.5-7.5V3', 'M6 11.5h12M6.6 16h10.8'),
}

export const SUBJECT_GLYPHS: Record<string, string> = { ...CORE, ...VOCATIONAL }
export const OBOR_GLYPHS = OBORY

const ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'

/** A glyph as a whole <svg> element (for server-rendered markup). */
export const glyphSvg = (inner: string) => `<svg ${ATTRS}>${inner}</svg>`
