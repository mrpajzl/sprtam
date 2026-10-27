import { render } from 'preact'
import { App } from './app'
import { initContent, keepOffline } from './content/remote'
import './styles.css'

// A chunk from a previous deploy failed to load: clear the stale caches and reload (public/boot-check.js).
addEventListener('vite:preloadError', () => (window as { sprtamHeal?: () => void }).sprtamHeal?.())

// Leftover of the removed daily usage ping (the date it last ran). The app no longer sends or keeps anything like it.
localStorage.removeItem('sprtam:seen')

const root = document.getElementById('app')!

initContent().then((ok) => {
  if (!ok) {
    // No manifest at all: first visit while offline, or the server has no content yet. Keep the page the
    // server sent (if any) and say what happened.
    root.insertAdjacentHTML('afterbegin', '<p class="boot-error" role="alert">Učivo se nepodařilo načíst. Zkontroluj připojení k internetu a zkus to znovu.</p>')
    document.documentElement.setAttribute('data-app', '')
    return
  }
  root.textContent = '' // drop the page rendered by the server (server/pages.ts); the app renders the same screen
  render(<App />, root)
  document.documentElement.setAttribute('data-app', '')
  keepOffline()
})
