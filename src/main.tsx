import { render } from 'preact'
import { App } from './app'
import { ping } from './stats'
import './styles.css'

// A chunk from a previous deploy failed to load: clear the stale caches and reload (public/boot-check.js).
addEventListener('vite:preloadError', () => (window as { sprtamHeal?: () => void }).sprtamHeal?.())

const root = document.getElementById('app')!
root.textContent = '' // drop the prerendered page (plugins/prerender.ts); the app renders the same screen
render(<App />, root)
document.documentElement.setAttribute('data-app', '')
ping()
