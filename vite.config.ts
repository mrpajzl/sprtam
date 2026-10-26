import { resolve } from 'node:path'
import { defineConfig, type UserConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import { appShell, contentDev } from './plugins/content-dev'

// Two builds (package.json): the app (dist/) and the server (vite build --ssr → dist-server/index.mjs, one file
// without dependencies). The app has no content inside: it reads the content API (src/content/remote.ts,
// docs/OBSAH.md); in development plugins/content-dev.ts serves that API from content/.

const server: UserConfig = {
  publicDir: false,
  build: {
    outDir: 'dist-server',
    emptyOutDir: true,
    target: 'node24',
    ssr: true,
    rollupOptions: { input: { index: resolve(import.meta.dirname, 'server/index.ts') }, output: { entryFileNames: '[name].mjs', chunkFileNames: 'chunks/[name]-[hash].mjs' } },
  },
  // The server bundle carries its dependencies: the image needs no node_modules.
  ssr: { noExternal: true, target: 'node' },
}

const app: UserConfig = {
  plugins: [
    preact(),
    contentDev(),
    appShell(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon-180x180.png', 'favicon.ico'],
      manifest: {
        name: 'Šprtám',
        short_name: 'Šprtám',
        description: 'Opakování učiva ZŠ a SŠ',
        lang: 'cs',
        theme_color: '#ff5b14',
        background_color: '#e9eaec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app itself is precached. Content works offline too: its files are not part of the build, the app
        // puts every file of the current release into the `content` cache (src/content/remote.ts).
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Pages are never served from the precache while online (a cached page can point at assets of an
        // older deploy). Only the empty shell app.html is precached, as the offline fallback for any route.
        globIgnores: ['audio/**', 'index.html', 'boot-check.js', 'move.js'],
        navigateFallback: null,
        runtimeCaching: [{
          // Files of content releases are named by the hash of their contents: they never change.
          urlPattern: ({ url }) => url.pathname.startsWith('/api/content/f/'),
          handler: 'CacheFirst',
          options: { cacheName: 'content', cacheableResponse: { statuses: [200] } },
        }, {
          urlPattern: ({ url }) => url.pathname === '/api/content/manifest',
          handler: 'NetworkFirst',
          options: { cacheName: 'content-manifest', networkTimeoutSeconds: 3, cacheableResponse: { statuses: [200] } },
        }, {
          urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api/') && !/\.(xml|txt)$/.test(url.pathname),
          handler: 'NetworkFirst',
          options: { cacheName: 'pages', networkTimeoutSeconds: 5, expiration: { maxEntries: 30 }, precacheFallback: { fallbackURL: 'app.html' } },
        }, {
          // Word recordings (~10 MB together) are not precached: each is kept once a drill has loaded it.
          urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
          handler: 'CacheFirst',
          options: { cacheName: 'audio', expiration: { maxEntries: 2000 }, cacheableResponse: { statuses: [200] }, rangeRequests: true },
        }],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  base: '/',
  build: { target: 'es2022' },
}

export default defineConfig(({ isSsrBuild }) => (isSsrBuild ? server : app))
