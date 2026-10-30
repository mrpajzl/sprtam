// An error report from a pupil (button „Nahlásit chybu“ in the app): what was reported and why, nothing about
// who or from where. Checked by the server of sprtam.cz before it forwards it, and again by the content service.

export const QUOTE_MAX = 300

export const REPORT_REASONS = ['wrong', 'unclear', 'typo', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export interface Report {
  /** <grade>/<subject>/<topic id>, e.g. z5/matematika/zlomky. */
  topic: string
  target: { kind: 'question' | 'explanation'; index: number; text: string }
  reason: ReportReason
  note: string
  /** The words the pupil marked in the text (selection → „Nahlásit chybu“); missing when reported with the button. */
  quote?: string
  /** The content release the pupil saw. */
  release: number
}

const TOPIC = /^[a-z0-9]+\/[a-z]+\/[a-z0-9]+(-[a-z0-9]+)*$/

/** A clean report, or a Czech message of what is wrong with it. */
export function parseReport(v: unknown): Report | string {
  if (!v || typeof v !== 'object') return 'Neplatné hlášení.'
  const b = v as Record<string, unknown>
  const t = b.target as Record<string, unknown> | undefined
  if (typeof b.topic !== 'string' || !TOPIC.test(b.topic)) return 'Neznámé téma.'
  if (!t || typeof t !== 'object' || (t.kind !== 'question' && t.kind !== 'explanation')) return 'Není jasné, co hlásíš.'
  if (!Number.isInteger(t.index) || (t.index as number) < 0 || (t.index as number) > 200) return 'Není jasné, co hlásíš.'
  if (typeof t.text !== 'string' || !t.text.trim()) return 'Není jasné, co hlásíš.'
  if (!REPORT_REASONS.includes(b.reason as ReportReason)) return 'Vyber, co je špatně.'
  if (b.note !== undefined && typeof b.note !== 'string') return 'Neplatná poznámka.'
  if (b.quote !== undefined && typeof b.quote !== 'string') return 'Neplatný označený text.'
  if (!Number.isInteger(b.release) || (b.release as number) < 0) return 'Neznámé vydání učiva.'
  const quote = ((b.quote as string | undefined) ?? '').replace(/\s+/g, ' ').trim().slice(0, QUOTE_MAX)
  return {
    topic: b.topic,
    target: { kind: t.kind, index: t.index as number, text: t.text.trim().slice(0, 1000) },
    reason: b.reason as ReportReason,
    note: ((b.note as string | undefined) ?? '').trim().slice(0, 500),
    ...(quote && { quote }),
    release: b.release as number,
  }
}
