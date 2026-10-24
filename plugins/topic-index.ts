import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import type { Plugin } from 'vite'
import type { Subject } from '../src/content/types'

// Lightweight views of all content, so search and recommendations work without
// loading every subject chunk:
//   `virtual:topic-index` – one row per topic: [grade, subject, id, title, emoji]
//   `virtual:topic-text`  – same order: explanation titles, terms and key rules (search only)

const MODULES = ['virtual:topic-index', 'virtual:topic-text']
const dataDir = join(import.meta.dirname, '..', 'src', 'content', 'data')

export async function buildTopicIndex() {
  const files = readdirSync(dataDir).sort().flatMap((g) => readdirSync(join(dataDir, g)).sort().map((f) => join(dataDir, g, f)))
  const subjects = await Promise.all(files.map((f) => tsImport(pathToFileURL(f).href, import.meta.url).then((m: { default: Subject }) => m.default)))
  return {
    files,
    rows: subjects.flatMap((s) => s.topics.map((t) => {
      const text = t.ex.flatMap((x) => [x.title, ...x.blocks.flatMap((b) => (b.t === 'term' ? [b.term] : b.t === 'key' ? [b.text] : []))])
      return [[s.grade, s.subject, t.id, t.title, t.emoji], [...new Set(text)].join('\n').replace(/[*`]/g, '')] as const
    })),
  }
}

export function topicIndex(): Plugin {
  let cached: ReturnType<typeof buildTopicIndex> | undefined
  return {
    name: 'topic-index',
    watchChange: (id) => { if (id.startsWith(dataDir)) cached = undefined },
    resolveId: (id) => (MODULES.includes(id) ? `\0${id}` : undefined),
    async load(id) {
      const which = MODULES.indexOf(id.slice(1))
      if (id[0] !== '\0' || which < 0) return
      const { files, rows } = await (cached ??= buildTopicIndex())
      files.forEach((f) => this.addWatchFile(f))
      return `export default ${JSON.stringify(rows.map((r) => r[which]))}`
    },
  }
}
