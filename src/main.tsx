import { render } from 'preact'
import { App } from './app'
import { ping } from './stats'
import './styles.css'

// A chunk from a previous deploy failed to load: reload once into the current version.
addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('sprtam-stale')) return
  sessionStorage.setItem('sprtam-stale', '1')
  location.reload()
})
// The app started fine, so a later stale chunk may reload again.
setTimeout(() => sessionStorage.removeItem('sprtam-stale'), 10_000)

const root = document.getElementById('app')!
root.textContent = '' // drop the prerendered page (plugins/prerender.ts); the app renders the same screen
render(<App />, root)
ping()
