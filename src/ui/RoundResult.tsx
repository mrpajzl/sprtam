import type { ComponentChildren } from 'preact'
import { stars } from '../progress/store'
import { back } from '../router'
import { BigStars } from './Bar'
import { Mascot } from './Mascot'

/** The end of a round of a game (Slepá mapa, Periodická tabulka): stars, score, record, play again, and the mistakes (children). */
export function RoundResult({ pct, first, total, secs, record, missed, onRetry, onAgain, done, children }: {
  pct: number; first: number; total: number; secs: number; record: boolean
  /** How many answers were not right at the first try. */
  missed: number
  onRetry: () => void; onAgain: () => void
  /** Where „Hotovo“ goes when the game was opened directly (no screen behind it); else one level up. */
  done?: string
  children?: ComponentChildren
}) {
  return (
    <div class="result">
      <Mascot mood={pct >= 90 ? 'happy' : pct >= 60 ? 'wow' : 'sad'} size={96} />
      <BigStars n={stars(pct)} />
      <h2>{pct >= 90 ? 'Výborně!' : pct >= 60 ? 'Dobře!' : 'Ještě to procvič'}</h2>
      <div class="pct">{first} / {total} napoprvé · {pct} % · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div>
      {record && <div class="goal-done">🏆 Nový rekord!</div>}
      <div class="actions">
        {missed > 0 && <button class="btn block" onClick={onRetry}>Procvičit chyby ({missed})</button>}
        <button class={`btn block ${missed ? 'ghost' : ''}`} onClick={onAgain}>Hrát znovu</button>
        <button class="btn ghost block" onClick={() => back(done)}>Hotovo</button>
      </div>
      {missed > 0 && <div class="mistakes">{children}</div>}
    </div>
  )
}
