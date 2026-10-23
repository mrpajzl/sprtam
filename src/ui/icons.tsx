// Minimal stroke icon set (24×24).
const P = (d: string) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={d} /></svg>
)

export const IBack = P('M15 5l-7 7 7 7')
export const IClose = P('M6 6l12 12M18 6L6 18')
export const ICheck = P('M5 12.5l4.5 4.5L19 7.5')
export const IX = P('M7 7l10 10M17 7L7 17')
export const ISync = P('M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4')
export const IBolt = P('M13 3L5 14h6l-1 7 8-11h-6z')
export const IRepeat = P('M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4')
export const IPencil = P('M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4')
export const IMic = P('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3')
export const ITest = P('M9 4h6M9 4a2 2 0 0 0-2 2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2-2M8 13l2.5 2.5L16 10')
export const IBulb = P('M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z')
export const IUp = P('M12 19V5M6 11l6-6 6 6')
export const IDown = P('M12 5v14M6 13l6 6 6-6')
export const ICamera = P('M4 8h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')
export const IQr = P('M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2h-2z')
export const ILink = P('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1')
export const ICopy = P('M9 9h11v11H9zM5 15H4V4h11v1')
export const IShare = P('M12 3v12M7 8l5-5 5 5M5 14v6h14v-6')
export const IPlay = P('M7 4l13 8-13 8z')
