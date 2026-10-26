import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import type { Plugin, ViteDevServer } from 'vite'
import { shell } from '../server/shell'
import type { Manifest } from '../src/content/manifest'
import type * as Release from '../src/content/release'

// The content API (docs/OBSAH.md) in development:
//   - with a local copy in content/ (npm run content:pull, or files being written), it is served from there:
//     /api/content/manifest and /api/content/f/<hash>.json, rebuilt whenever a file changes;
//   - without one, requests go to the content service (CONTENT_API, default https://moderace.sprtam.cz).
// Plus appShell: dist/app.html, the offline fallback page of the service worker.

const ROOT = join(import.meta.dirname, '..')
const CONTENT = join(ROOT, 'content')
const local = () => existsSync(join(CONTENT, 'topics'))

const load = <T,>(f: string) => tsImport(pathToFileURL(join(ROOT, f)).href, import.meta.url) as Promise<T>

interface Built { manifest: Manifest; files: Map<string, string> }

export function contentDev(): Plugin {
  let built: Promise<Built> | undefined
  const api = (process.env.CONTENT_API ?? 'https://moderace.sprtam.cz').replace(/\/$/, '')
  const build = () => (built ??= (async () => {
    const { buildRelease } = await load<typeof Release>('src/content/release.ts')
    const { readSnapshot } = await load<typeof import('./content')>('plugins/content.ts')
    const r = buildRelease(readSnapshot(CONTENT))
    return { manifest: { ...r.manifest, release: 0, publishedAt: Date.now() }, files: r.files }
  })())

  return {
    name: 'content-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      if (local()) {
        server.watcher.add(CONTENT)
        const changed = (f: string) => {
          if (!f.startsWith(CONTENT) || !f.endsWith('.json') || f.includes('/schema/')) return
          built = undefined
          server.ws.send({ type: 'full-reload' })
        }
        server.watcher.on('change', changed).on('add', changed).on('unlink', changed)
      }
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (!path.startsWith('/api/content/')) return next()
        try {
          const file = /^\/api\/content\/f\/([0-9a-f]{20})\.json$/.exec(path)
          if (!local()) {
            const to = path === '/api/content/manifest' ? '/api/public/v1/manifest' : file ? `/api/public/v1/files/${file[1]}` : null
            if (!to) { res.statusCode = 404; return res.end() }
            const r = await fetch(api + to)
            res.statusCode = r.status
            res.setHeader('Content-Type', 'application/json')
            return res.end(Buffer.from(await r.arrayBuffer()))
          }
          const b = await build()
          const body = path === '/api/content/manifest' ? JSON.stringify(b.manifest) : file ? b.files.get(file[1]) : undefined
          if (body === undefined) { res.statusCode = 404; return res.end() }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(body)
        } catch (e) {
          server.config.logger.error(`content: ${(e as Error).message}`)
          res.statusCode = 502
          res.end()
        }
      })
    },
  }
}

export function appShell(): Plugin {
  let outDir = ''
  return {
    name: 'app-shell',
    apply: 'build',
    configResolved: (c) => { outDir = join(c.root, c.build.outDir) },
    writeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      if (!template.includes('<div id="app"></div>')) throw new Error('app-shell: #app placeholder not found in index.html')
      writeFileSync(join(outDir, 'app.html'), shell(template))
    },
  }
}
