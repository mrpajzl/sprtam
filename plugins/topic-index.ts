import type { Plugin } from 'vite'
import { readSubjects, topicFiles, TOPICS } from './content'

// Lightweight views of all content, so search and recommendations work without
// loading every subject chunk:
//   `virtual:topic-index` – one row per topic: [grade, subject, id, title, emoji, approach?] (approach only for approach-only topics)
//   `virtual:topic-text`  – same order: explanation titles, terms and summaries (search only)

const MODULES = ['virtual:topic-index', 'virtual:topic-text']

export function buildTopicIndex() {
  return {
    rows: readSubjects().flatMap((s) => s.topics.map((t) => {
      const text = t.explanations.filter((x) => !x.approach).flatMap((x) => [x.title, ...x.blocks.flatMap((b) => (b.type === 'term' ? [b.term] : b.type === 'summary' ? [b.text] : []))])
      return [[s.grade, s.subject, t.id, t.title, t.emoji, ...(t.approach ? [t.approach] : [])], [...new Set(text)].join('\n').replace(/[*`]/g, '')] as const
    })),
  }
}

export function topicIndex(): Plugin {
  let cached: ReturnType<typeof buildTopicIndex> | undefined
  return {
    name: 'topic-index',
    watchChange: (id) => { if (id.startsWith(TOPICS)) cached = undefined },
    resolveId: (id) => (MODULES.includes(id) ? `\0${id}` : undefined),
    load(id) {
      const which = MODULES.indexOf(id.slice(1))
      if (id[0] !== '\0' || which < 0) return
      const { rows } = (cached ??= buildTopicIndex())
      topicFiles().forEach((f) => this.addWatchFile(f))
      return `export default ${JSON.stringify(rows.map((r) => r[which]))}`
    },
  }
}
