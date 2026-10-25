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
export const ISun = P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4')
export const IMoon = P('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')
export const ISearch = P('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20')
export const IShuffle = P('M3 7h3.5c4 0 6.5 10 11 10H21M3 17h3.5c1.6 0 2.9-1.6 4-3.6M13.5 9.6c1.1-1.5 2.4-2.6 4-2.6H21M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5')
export const IHome = P('M4 11l8-7 8 7M6.5 9v11h11V9M10 20v-5h4v5')
export const IGrid = P('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z')
export const IArrow = P('M5 12h14M13 6l6 6-6 6')

/** Push pin; filled when the topic is pinned. */
export function IPin({ on }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 3.5h6l-1 5.5 3.5 3.5h-11L10 9z" fill={on ? 'currentColor' : 'none'} /><path d="M12 12.5V21" />
    </svg>
  )
}

/** Chunky five-point star. */
export function IStar({ on }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.6l-5.6 3.2 1.3-6.2L3 9.3l6.3-.7z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>
  )
}
