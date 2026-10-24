import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'
// Maskable and Apple icons sit on the brand orange instead of white.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#ff5b14' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#ff5b14' } },
  },
  images: ['public/icon.svg'],
})
