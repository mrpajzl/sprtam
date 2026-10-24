declare module 'virtual:topic-index' {
  import type { GradeId, SubjectId } from './types'
  const rows: [GradeId, SubjectId, string, string, string][]
  export default rows
}
declare module 'virtual:topic-text' {
  const text: string[]
  export default text
}
