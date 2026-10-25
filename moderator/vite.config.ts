import { resolve } from 'node:path'
import { defineConfig, type BuildEnvironmentOptions } from 'vite'
import preact from '@preact/preset-vite'

// The moderation app: the editor (index.html) and the preview frame (preview.html) as static files,
// plus the server bundled into one file per entry (vite build --ssr, see package.json).
// Dev: npm run moderator:dev (Vite on :5180 proxying /api to the server on :8095).

const root = import.meta.dirname

const server: BuildEnvironmentOptions = {
  outDir: resolve(root, 'dist-server'),
  emptyOutDir: true,
  target: 'node24',
  ssr: true,
  rollupOptions: { input: { index: resolve(root, 'server/index.ts'), cli: resolve(root, 'server/cli.ts') }, output: { entryFileNames: '[name].mjs', chunkFileNames: 'chunks/[name]-[hash].mjs' } },
}
const client: BuildEnvironmentOptions = {
  outDir: resolve(root, 'dist'),
  emptyOutDir: true,
  target: 'es2022',
  rollupOptions: { input: { index: resolve(root, 'index.html'), preview: resolve(root, 'preview.html') } },
}

export default defineConfig(({ isSsrBuild }) => ({
  root,
  plugins: [preact()],
  server: { port: 5180, strictPort: true, proxy: { '/api': `http://localhost:${process.env.API_PORT ?? 8095}` }, fs: { allow: [resolve(root, '..')] } },
  build: isSsrBuild ? server : client,
  // The server bundle carries its dependencies: the image needs no node_modules.
  ssr: { noExternal: true, target: 'node' },
}))
