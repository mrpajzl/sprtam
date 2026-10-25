import { CONFIG } from './config'
import { HttpError } from './http'

// The few GitHub REST calls the moderation needs: read a file on a branch, write files as one commit on
// a moderace/* branch, open and read pull requests. The token never leaves the server.

const API = 'https://api.github.com'

export const githubReady = () => !!CONFIG.githubToken

async function gh<T>(method: string, path: string, body?: unknown, okMissing = false): Promise<T | null> {
  if (!githubReady()) throw new HttpError(503, 'Moderace zatím není připojená ke GitHubu. Dej vědět správci.', 'github')
  const res = await fetch(`${API}/repos/${CONFIG.githubRepo}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${CONFIG.githubToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'sprtam-moderace',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  }).catch(() => { throw new HttpError(502, 'GitHub teď neodpovídá. Zkus to za chvíli.', 'github') })
  if (res.status === 404 && okMissing) return null
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`GitHub ${method} ${path} → ${res.status} ${text.slice(0, 300)}`)
    throw new HttpError(502, `GitHub odmítl požadavek (${res.status}). Zkus to za chvíli, nebo dej vědět správci.`, 'github')
  }
  return res.status === 204 ? (null as T) : ((await res.json()) as T)
}

const enc = (path: string) => path.split('/').map(encodeURIComponent).join('/')

export async function branchHead(branch: string): Promise<string | null> {
  const r = await gh<{ object: { sha: string } }>('GET', `/git/ref/heads/${enc(branch)}`, undefined, true)
  return r?.object.sha ?? null
}

export async function commitTree(sha: string): Promise<string> {
  return (await gh<{ tree: { sha: string } }>('GET', `/git/commits/${sha}`))!.tree.sha
}

/** A file's text and blob sha at a commit, or null when it does not exist there. */
export async function fileAt(path: string, ref: string): Promise<{ text: string; sha: string } | null> {
  const r = await gh<{ content?: string; encoding?: string; sha: string; type: string }>('GET', `/contents/${enc(path)}?ref=${encodeURIComponent(ref)}`, undefined, true)
  if (!r || r.type !== 'file') return null
  // Files over 1 MB come without content: read the blob.
  const content = r.content ?? (await gh<{ content: string }>('GET', `/git/blobs/${r.sha}`))!.content
  return { text: Buffer.from(content, 'base64').toString('utf8'), sha: r.sha }
}

/** One commit with the given files on top of `parent`; returns its sha. */
export async function commitFiles(parent: string, files: { path: string; text: string }[], message: string, author: { name: string; email: string }): Promise<string> {
  const base = await commitTree(parent)
  const tree = await gh<{ sha: string }>('POST', '/git/trees', { base_tree: base, tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.text })) })
  const commit = await gh<{ sha: string }>('POST', '/git/commits', { message, tree: tree!.sha, parents: [parent], author: { ...author, date: new Date().toISOString() } })
  return commit!.sha
}

export async function createBranch(branch: string, sha: string) {
  await gh('POST', '/git/refs', { ref: `refs/heads/${branch}`, sha })
}

/** Moves a branch forward (never forced: a branch somebody else changed is not overwritten). */
export async function moveBranch(branch: string, sha: string) {
  await gh('PATCH', `/git/refs/heads/${enc(branch)}`, { sha, force: false })
}

export interface Pull { number: number; html_url: string; state: 'open' | 'closed'; merged_at: string | null; head: { ref: string } }

export async function openPull(branch: string, title: string, body: string): Promise<Pull> {
  return (await gh<Pull>('POST', '/pulls', { title, head: branch, base: CONFIG.githubBase, body, maintainer_can_modify: true }))!
}

export async function getPull(n: number): Promise<Pull | null> {
  return gh<Pull>('GET', `/pulls/${n}`, undefined, true)
}

export async function commentPull(n: number, body: string) {
  await gh('POST', `/issues/${n}/comments`, { body }).catch((e) => console.error('comment failed', e))
}
