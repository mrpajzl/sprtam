import { useEffect, useState } from 'preact/hooks'
import { get } from './api'
import type { ContentIndex } from '../server/content'

// The content catalogue (titles of every topic) and who is working on what – loaded once per visit
// and refreshed after creating or sending a draft.

export interface Active { key: string; userId: string; name: string; status: string; kind: string }
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

export interface DraftView {
  id: string; kind: 'edit' | 'new'; grade: string; subject: string; topicId: string; title: string; rev: number
  status: 'draft' | 'submitted' | 'merged' | 'closed'; prNumber: number | null; prUrl: string | null; unsent: boolean
  author: { id: string; name: string }; createdAt: number; updatedAt: number; submittedAt: number | null
}

export const STATUS: Record<DraftView['status'], string> = { draft: 'Rozpracováno', submitted: 'Čeká na schválení', merged: 'Schváleno', closed: 'Zamítnuto' }
