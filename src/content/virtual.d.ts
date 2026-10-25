declare module 'virtual:topic-index' {
  import type { GradeId, SubjectId } from './types'
  const rows: [GradeId, SubjectId, string, string, string, string?][]
  export default rows
}
declare module 'virtual:topic-text' {
  const text: string[]
  export default text
}
declare module 'virtual:content' {
  import type { Topic } from './types'
  /** 'z5/matematika' → that subject's topics in order (plugins/content-modules.ts). */
  const subjects: Record<string, () => Promise<{ default: Topic[] }>>
  export default subjects
}
