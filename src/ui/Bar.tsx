import type { ComponentChildren } from 'preact'
import { back } from '../router'
import { IBack, IStar } from './icons'

export function Bar({ title, onBack = back, right }: { title?: string; onBack?: () => void; right?: ComponentChildren }) {
  return (
    <header class="bar">
      <button class="icon-btn" onClick={onBack} aria-label="Zpět"><IBack /></button>
      <h1>{title}</h1>
      {right ?? <span class="spacer" />}
    </header>
  )
}

export function Stars({ n }: { n: number }) {
  return <span class="stars" role="img" aria-label={`${n} ze 3`}>{[0, 1, 2].map((i) => <span key={i} class={i < n ? 'on' : ''}><IStar on={i < n} /></span>)}</span>
}

/** Result stars, popping in one after another. */
export function BigStars({ n }: { n: number }) {
  return <div class="big-stars" role="img" aria-label={`${n} ze 3`}>{[0, 1, 2].map((i) => <span key={i} class={i < n ? 'on' : ''} style={{ animationDelay: `${0.15 + i * 0.12}s` }}><IStar on={i < n} /></span>)}</div>
}
