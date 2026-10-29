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

// Every topic says openly who wrote it. So far all the content was written by AI; a person checks it afterwards.
// Change this once people write topics themselves (then the author belongs into the topic).
/** Who wrote the content. */
export const CONTENT_AUTHOR = 'Claude Opus 5.5'

/** The form for people who want to check the content as moderators (moderation, /zapojit-se, docs/MODERACE.md). */
export const JOIN_URL = 'https://moderace.sprtam.cz/zapojit-se'
/** …coming from one topic ("<grade>/<subject>/<id>"), which the form then mentions. */
export const joinHref = (topic?: string) => (topic ? `${JOIN_URL}?tema=${topic}` : JOIN_URL)

/** Several checkers in one `verified.by` ("Jana Nováková, Petr Svoboda"); names never contain a comma. */
export const verifierNames = (by: string) => by.split(', ').map((n) => n.trim()).filter(Boolean)

/** Who checks the content: moderators' profiles in moderation (/moderatori, moderator/server/profiles.ts)… */
export const MODERATORS_URL = 'https://moderace.sprtam.cz/moderatori'
/** …and the profile of one checker by name (a name without a public profile shows the list). */
export const profileHref = (name: string) => `${MODERATORS_URL}?jmeno=${encodeURIComponent(name)}`
