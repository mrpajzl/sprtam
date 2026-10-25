import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import { contentModules } from './plugins/content-modules'
import { prerender } from './plugins/prerender'
import { topicIndex } from './plugins/topic-index'

export default defineConfig({
  plugins: [
    preact(),
    contentModules(),
    topicIndex(),
    prerender(),
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
        // Everything (all grades, all subjects) is cached so the app works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Pages are never served from the precache while online (a cached page can point at assets of an
        // older deploy). Only the empty shell app.html is precached, as the offline fallback for any route.
        globIgnores: ['audio/**', 'g/**', 'slovicka/**', 'index.html', 'boot-check.js', 'move.js'],
        navigateFallback: null,
        runtimeCaching: [{
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
})
