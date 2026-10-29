// A moderator's own profile: how they present themselves on the public page /moderatori (moderator/server/profiles.ts,
// screens/Profiles.tsx). Shared by the server (validation) and the app (the form and the pages).

/** Pictures a moderator may choose instead of their initials. A fixed set: no uploads, nothing to moderate. */
export const AVATARS = [
  '🦉', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐢', '🐙', '🦋', '🐝', '🐞', '🦔', '🐧', '🐳',
  '🌻', '🌳', '🍀', '🌍', '🌙', '⭐', '🔥', '⚡', '📚', '✏️', '🔬', '🧪', '🧮', '📐', '🎨', '🎵',
  '⚽', '🚀', '🧠', '🗺️', '🏛️', '💡', '🧩', '☕',
] as const

export const PROFILE_LIMITS = { name: 80, headline: 100, bio: 1000, web: 200, subjects: 8 }

export interface Profile {
  id: string
  name: string
  /** Správce / moderátor. */
  role: 'admin' | 'moderator'
  /** One line under the name, e.g. "Učitelka matematiky a fyziky, ZŠ Lipová". */
  headline: string
  /** A few sentences about themselves; plain text, paragraphs separated by an empty line. */
  bio: string
  /** Subject ids (core subjects and odborné předměty) they look after. */
  subjects: string[]
  /** Their own web page (https only), shown as a link. */
  web: string
  /** One of AVATARS, or '' for initials. */
  avatar: string
  /** Shown to everyone; otherwise only to signed-in moderators. */
  public: boolean
  since: number
  /** Published topics whose current version this moderator checked (approved in review or "Ověřit"). */
  verified: number
  /** Their changes published after review. */
  published: number
}

export interface ProfileTopic { key: string; title: string; emoji: string; at: string }
export interface ProfileDetail extends Profile { topics: ProfileTopic[] }

/** Initials for the avatar without a picture: "Jana Nováková" → "JN". */
export const initials = (name: string) => name.split(/\s+/).filter((w) => /^\p{L}/u.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'
