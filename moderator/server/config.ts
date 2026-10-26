import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

// Everything the server reads from the environment (docs/MODERACE.md).

const env = process.env
/** The repository root (holds content/ and moderator/) – found upwards from this file, wherever the bundler put it. */
function findRoot(dir: string): string {
  for (let d = dir; d !== dirname(d); d = dirname(d)) if (existsSync(join(d, 'moderator')) && existsSync(join(d, 'content'))) return d
  return process.cwd()
}
const ROOT = env.APP_ROOT ?? findRoot(import.meta.dirname)

const origin = (env.ORIGIN ?? 'http://localhost:5180').replace(/\/$/, '')

export const CONFIG = {
  port: Number(env.PORT ?? 8090),
  /** The exact public origin, e.g. https://moderace.sprtam.cz. Passkeys and the CSRF check are bound to it. */
  origin,
  rpId: env.RP_ID ?? new URL(origin).hostname,
  rpName: 'Šprtám – moderace',
  secure: origin.startsWith('https://'),
  dataDir: env.DATA_DIR ?? join(ROOT, 'moderator', 'data'),
  contentDir: env.CONTENT_DIR ?? join(ROOT, 'content'),
  staticDir: env.STATIC_DIR ?? join(ROOT, 'moderator', 'dist'),
  /** How many other moderators must approve a change before it is published. */
  approvals: Math.max(1, Number(env.REQUIRED_APPROVALS ?? 1) || 1),
  /** Bearer token of the backup puller (docs/OBSAH.md, Zálohy); empty = backups off. */
  backupToken: env.BACKUP_TOKEN ?? '',
  /** Commit the image was built from (Coolify sets SOURCE_COMMIT). */
  commit: env.SOURCE_COMMIT ?? '',
  /** Behind Cloudflare: the client address is in CF-Connecting-IP. */
  trustProxy: env.TRUST_PROXY === '1',
}

export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export const LIMITS = {
  /** A session ends after this long without a request… */
  sessionIdle: 12 * HOUR,
  /** …and in any case this long after the login. */
  sessionMax: 7 * DAY,
  /** Managing users and passkeys needs a passkey confirmation this fresh. */
  recentAuth: 15 * MINUTE,
  invite: 72 * HOUR,
  challenge: 5 * MINUTE,
  /** Request bodies: a topic is at most a few tens of kB. */
  body: 512 * 1024,
  /** Bodies of requests without a session (sign-in, invites). */
  openBody: 16 * 1024,
  /** Open drafts one moderator may have. */
  drafts: 50,
  /** API tokens (for scripts and agents proposing content) live at most this long. */
  apiToken: 180 * DAY,
  /** Open widget requests one moderator may have. */
  widgetRequests: 20,
}
