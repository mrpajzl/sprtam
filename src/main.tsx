import { render } from 'preact'
import { App } from './app'
import { ping } from './stats'
import './styles.css'

render(<App />, document.getElementById('app')!)
ping()
