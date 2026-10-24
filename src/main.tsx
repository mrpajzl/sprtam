import { render } from 'preact'
import { App } from './app'
import { ping } from './stats'
import './styles.css'

const root = document.getElementById('app')!
root.textContent = '' // drop the prerendered page (plugins/prerender.ts); the app renders the same screen
render(<App />, root)
ping()
