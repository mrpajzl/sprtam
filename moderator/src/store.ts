import { useEffect, useState } from 'preact/hooks'
import { get } from './api'
import type { TopicFile } from '../../src/content/types'
import type { ContentIndex } from '../server/content'

// The content catalogue (titles of every topic) and who is working on what – loaded once per visit
// and refreshed after creating or sending a draft.

export interface Active { key: string; userId: string; name: string; status: string; kind: string; id: string | null }
export type Index = ContentIndex & { active: Active[] }

let cached: Promise<Index> | undefined
const listeners = new Set<() => void>()

export const loadIndex = () => (cached ??= get<Index>('/api/content/index').catch((e) => { cached = undefined; throw e }))
export function refreshIndex() { cached = undefined; listeners.forEach((f) => f()) }

export function useIndex(): Index | undefined {
  const [v, set] = useState<Index>()
  useEffect(() => {
    const load = () => { loadIndex().then(set, () => set(undefined)) }
    load()
    listeners.add(load)
    return () => { listeners.delete(load) }
  }, [])
  return v
}

export type DraftStatus = 'draft' | 'review' | 'published' | 'withdrawn' | 'rejected'
export interface Person { id: string; name: string }

export interface DraftView {
  id: string; kind: 'edit' | 'new'; grade: string; subject: string; topicId: string; title: string; rev: number
  status: DraftStatus; note: string | null
  author: Person; createdAt: number; updatedAt: number; submittedAt: number | null
  decidedAt: number | null; decidedBy: string | null; decisionNote: string | null; release: number | null
  baseVersion: number | null; rollbackOf: number | null
  conflict: boolean; changed: boolean; approvals: Person[]; changes: Person[]; needed: number
  legacyPrUrl: string | null
}

export interface ReviewView {
  id: number; rev: number; stale: boolean; user: Person; verdict: 'approve' | 'changes' | 'comment'; body: string; anchor: string | null
  createdAt: number; resolvedAt: number | null
  parent: number | null; suggestion: { path: string; from: string; to: string } | null; appliedAt: number | null; editedAt: number | null
}

export interface Problem { path: string; message: string }

/** GET /api/drafts/:id */
export interface DraftFull {
  draft: DraftView; topic: TopicFile; after: string | null; base: TopicFile | null; published: TopicFile | null; publishedVersion: number | null
  reviews: ReviewView[]; problems: Problem[]
}

export const STATUS: Record<DraftStatus, string> = {
  draft: 'Rozpracováno', review: 'Ke kontrole', published: 'Zveřejněno', withdrawn: 'Staženo', rejected: 'Zamítnuto',
}

/** "Schváleno 1 z 2" while in review. */
export const approvalText = (d: DraftView) => `schváleno ${d.approvals.length} z ${d.needed}`
