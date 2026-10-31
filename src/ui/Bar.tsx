import type { ComponentChildren } from 'preact'
import { back, Link } from '../router'
import { IBack, IStar } from './icons'
import { QrButton } from './QrShare'

/** A step up the path to the current screen. */
export interface Crumb { href: string; label: string }

export function Bar({ title, crumbs, onBack = back, right }: { title?: string; crumbs?: Crumb[]; onBack?: () => void; right?: ComponentChildren }) {
  return (
    <header class="bar">
      <button class="icon-btn" onClick={onBack} aria-label="Zpět"><IBack /></button>
      {right && <span class="spacer balance" />}
      <div class="bar-title">
        {crumbs?.length ? <nav class="crumbs" aria-label="Kde jsem">{crumbs.map((c) => <Link key={c.href} href={c.href} jump>{c.label}</Link>)}</nav> : null}
        <h1>{title}</h1>
      </div>
      {right}
      <QrButton />
    </header>
  )
}

/** The top of a tab's own screen (Učivo, Hry, Já): its name, nothing to go back to. */
export function TabHead({ title, right }: { title: string; right?: ComponentChildren }) {
  return (
    <header class="bar">
      <h1 class="brand">{title}</h1>
      <span class="grow" />
      <QrButton />
      {right}
    </header>
  )
}

export function Stars({ n }: { n: number }) {
  return <span class="stars" role="img" aria-label={`${n} ze 3`}>{[0, 1, 2].map((i) => <span key={i} class={i < n ? 'on' : ''}><IStar on={i < n} /></span>)}</span>
}

/** Segmented LED meter, 0–100. */
export function Meter({ pct, n = 10 }: { pct: number; n?: number }) {
  const lit = Math.round((pct / 100) * n)
  return <span class="seg-meter" role="img" aria-label={`${Math.round(pct)} %`}>{Array.from({ length: n }, (_, i) => <i key={i} class={i < lit ? 'on' : ''} />)}</span>
}

/** Result stars, popping in one after another. */
export function BigStars({ n }: { n: number }) {
  return <div class="big-stars" role="img" aria-label={`${n} ze 3`}>{[0, 1, 2].map((i) => <span key={i} class={i < n ? 'on' : ''} style={{ animationDelay: `${0.15 + i * 0.12}s` }}><IStar on={i < n} /></span>)}</div>
}
