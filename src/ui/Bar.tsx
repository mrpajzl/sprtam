import type { ComponentChildren } from 'preact'
import { back } from '../router'
import { IBack } from './icons'

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
  return <span class="stars" aria-label={`${n} ze 3`}>{[0, 1, 2].map((i) => <span key={i} class={i < n ? '' : 'off'}>★</span>)}</span>
}
