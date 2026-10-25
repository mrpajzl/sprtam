import { join } from 'node:path'
import type { Plugin } from 'vite'
import type { SubjectFile } from '../src/content/types'
import { readJson, subjectDirs, TOPICS } from './content'

// Bundles content/topics into one chunk per subject (as many requests as before the JSON format,
// and a small main bundle):
//   `virtual:content`               { 'z5/matematika': () => import('virtual:content/z5/matematika'), … }
//   `virtual:content/<g>/<s>`       default export: the subject's topics in the order of _subject.json
// Topic files are plain JSON imports, so Vite reloads them in dev like any other module.

const ID = 'virtual:content'

export function contentModules(): Plugin {
  return {
    name: 'content-modules',
    resolveId: (id) => (id === ID || id.startsWith(`${ID}/`) ? `\0${id}` : undefined),
    load(id) {
      if (id === `\0${ID}`) {
        return `export default {\n${subjectDirs().map(([g, s]) => `  ${JSON.stringify(`${g}/${s}`)}: () => import(${JSON.stringify(`${ID}/${g}/${s}`)}),`).join('\n')}\n}`
      }
      if (!id.startsWith(`\0${ID}/`)) return
      const [g, s] = id.slice(ID.length + 2).split('/')
      const list = join(TOPICS, g, s, '_subject.json')
      this.addWatchFile(list)
      const ids = readJson<SubjectFile>(list).topics
      return `${ids.map((t, i) => `import t${i} from ${JSON.stringify(join(TOPICS, g, s, `${t}.json`))}`).join('\n')}\nexport default [${ids.map((_, i) => `t${i}`).join(', ')}]`
    },
    // A new or deleted subject folder or topic file changes the module list: reload.
    configureServer(server) {
      const changed = (file: string) => {
        if (!file.startsWith(TOPICS)) return
        for (const m of server.moduleGraph.idToModuleMap.values()) if (m.id?.startsWith(`\0${ID}`) || m.id?.startsWith('\0virtual:topic-')) server.moduleGraph.invalidateModule(m)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', changed).on('unlink', changed)
    },
  }
}
