import type { TopicFile } from './types'

// Was a topic checked by a person? Content added by AI (or changed without a review) is published at once but
// marked unverified – it shows in the app with a note. A moderator then checks it ("Ověřit" in moderation), or a
// reviewed change publishes it already checked: then the topic carries `verified` (who, when). Any later change
// that nobody reviewed removes it again. docs/OBSAH.md, "Neověřené učivo".

export type Verified = NonNullable<TopicFile['verified']>

/** The topic without its verification: what an edit changes and what conflicts compare. */
export function withoutVerified<T>(t: T): T {
  if (!t || typeof t !== 'object' || !('verified' in t)) return t
  const { verified: _, ...rest } = t as Record<string, unknown>
  return rest as T
}

/** Today in Prague as RRRR-MM-DD. */
export const today = (now = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague' }).format(now)

/** „12. 3. 2026“ */
export const dateCs = (at: string) => { const [y, m, d] = at.split('-').map(Number); return `${d}. ${m}. ${y}` }
