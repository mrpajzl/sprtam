import { render } from 'preact'
import { App } from './app'
import { getProgress } from './progress/store'
import { ping } from './stats'
import './styles.css'

// Open straight into the last used grade.
if (!location.hash || location.hash === '#/') {
  const g = getProgress().g
  if (g) { history.replaceState(null, '', '#/'); history.pushState(null, '', `#/g/${g}`) }
}

render(<App />, document.getElementById('app')!)
ping()
