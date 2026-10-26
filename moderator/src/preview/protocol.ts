import type { GradeId, SubjectId, TopicFile } from '../../../src/content/types'

// Messages between the editor and the preview frame (same origin; both check event.origin and source).

export type PreviewMode = { kind: 'topic'; ex: number; block?: number } | { kind: 'quiz'; q: number }

export interface PreviewState {
  topic: TopicFile
  grade: GradeId
  subject: SubjectId
  approaches: { id: string; emoji: string; short: string }[]
  mode: PreviewMode
  theme: 'light' | 'dark'
}

/** One widget alone, for the widget gallery (moderator/src/ui/Showcase.tsx). */
export interface WidgetDemo {
  widget: string
  props: Record<string, unknown>
  /** Only the task, as above a quiz question. */
  question: boolean
  theme: 'light' | 'dark'
}

export type ToEditor = { type: 'ready' } | { type: 'mode'; mode: PreviewMode } | { type: 'height'; height: number }
export type ToPreview = { type: 'state'; state: PreviewState } | { type: 'widget'; demo: WidgetDemo }
