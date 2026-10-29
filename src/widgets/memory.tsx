import { useEffect, useRef, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { Inline } from '../ui/Inline'
import { defineWidget, shuffle } from './kit'

const props = s.object({
  pairs: s.array(s.object({
    a: s.string({ description: 'První karta dvojice, např. pojem, slovo, vzorec nebo emoji.' }),
    b: s.string({ description: 'Druhá karta dvojice, např. význam, překlad, název nebo značka.' }),
  }), { min: 3, max: 10, description: 'Dvojice karet. Všech 2 × N karet musí mít různý text. Ideálně 4–8 dvojic, krátké texty (do ~20 znaků).' }),
})
type P = Infer<typeof props>

interface Card { pair: number; text: string }

const deal = (pairs: P['pairs']): Card[] => shuffle(pairs.flatMap((p, i) => [{ pair: i, text: p.a }, { pair: i, text: p.b }]))
const plain = (t: string) => t.replace(/\*\*|\*|`|\^/g, '')
const norm = (t: string) => plain(t).trim().toLocaleLowerCase('cs')
/** 1 tah, 2–4 tahy, 5 tahů */
const tahy = (n: number) => `${n} ${n === 1 ? 'tah' : n >= 2 && n <= 4 ? 'tahy' : 'tahů'}`
const EMOJI = /^\p{Extended_Pictographic}/u

function Memory({ pairs }: P) {
  const [deck, setDeck] = useState(() => deal(pairs))
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [msg, setMsg] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const n = pairs.length
  const done = found.length === n
  const longest = Math.max(...pairs.flatMap((p) => [plain(p.a).length, plain(p.b).length]))
  const cols = 2 * n <= 6 || longest > 14 ? 3 : 4

  const restart = () => {
    clearTimeout(timer.current)
    setDeck(deal(pairs)); setOpen([]); setFound([]); setMoves(0); setMsg('')
  }
  // New cards (e.g. edited in the moderation preview) → deal again.
  const sig = JSON.stringify(pairs), dealt = useRef(sig)
  useEffect(() => { if (dealt.current !== sig) { dealt.current = sig; restart() } }, [sig])

  const turn = (i: number) => {
    const c = deck[i]
    if (found.includes(c.pair) || open.includes(i)) return
    // A third tap while a wrong pair is still showing turns it back at once.
    let cur = open
    if (cur.length === 2) { clearTimeout(timer.current); cur = [] }
    const next = [...cur, i]
    setOpen(next)
    if (next.length < 2) { setMsg(`Otočeno: ${plain(c.text)}`); return }
    setMoves(moves + 1)
    const o = deck[next[0]]
    if (o.pair === c.pair) {
      const f = [...found, c.pair]
      setFound(f); setOpen([])
      setMsg(f.length === n ? 'Všechny dvojice nalezeny!' : `Dvojice! ${plain(pairs[c.pair].a)} – ${plain(pairs[c.pair].b)}`)
    } else {
      setMsg(`${plain(o.text)} a ${plain(c.text)} k sobě nepatří.`)
      timer.current = setTimeout(() => setOpen([]), 1100)
    }
  }

  // Arrow keys move between cards in the grid.
  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key]
    if (!step) return
    const btns = [...(e.currentTarget as HTMLElement).querySelectorAll('button')]
    const k = btns.indexOf(document.activeElement as HTMLButtonElement)
    const to = btns[k + step]
    if (k >= 0 && to) { e.preventDefault(); to.focus() }
  }

  const praise = moves === n ? 'Bez jediné chyby! 🏆' : moves <= Math.ceil(n * 1.6) ? 'Výborně! 🎉' : 'Hotovo! 👏'
  return (
    <div class="w">
      <div class="mem-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} onKeyDown={onKey} role="group" aria-label="Karty pexesa">
        {deck.map((c, i) => {
          const isFound = found.includes(c.pair), isOpen = open.includes(i)
          const wrong = isOpen && open.length === 2
          const t = plain(c.text)
          const state = isFound ? `nalezená: ${t}` : isOpen ? `otočená: ${t}` : 'skrytá'
          return (
            <button key={i} class={`mem-card ${isFound || isOpen ? 'up' : ''} ${isFound ? 'found' : ''} ${wrong ? 'wrong' : ''}`} onClick={() => turn(i)} aria-label={`karta ${i + 1}, ${state}`} aria-disabled={isFound || undefined}>
              <span class="mem-in" aria-hidden="true">
                <span class="mem-back">?</span>
                <span class={`mem-face ${t.length > 12 ? 'long' : ''} ${EMOJI.test(t) && t.length <= 4 ? 'emoji' : ''}`}><Inline text={c.text} /></span>
              </span>
            </button>
          )
        })}
      </div>
      {done ? (
        <>
          <div class="val">{praise}</div>
          <div class="sub">Všech {n} dvojic za {tahy(moves)}.</div>
          <div class="ctrls"><button class="reveal" onClick={restart}>Hrát znovu</button></div>
        </>
      ) : (
        <div class="mem-stat"><span>Tahy: <b>{moves}</b></span><span>Dvojice: <b>{found.length}</b> z {n}</span></div>
      )}
      <div class="mem-sr" aria-live="polite">{msg}</div>
    </div>
  )
}

export default defineWidget({
  name: 'memory',
  title: 'Pexeso',
  summary: 'Zamíchané karty rubem nahoru. Dítě otáčí po dvou a hledá dvojice (pojem – význam, slovo – překlad…). Shodné zůstanou otočené, neshodné se otočí zpět. Počítá tahy.',
  use: 'Opakování dvojic hrou: pojmy a významy, slovíčka a překlady, prvky a značky, vzorce a názvy, emoji a slova, autor a dílo, země a hlavní město.',
  props,
  examples: [
    { title: 'Zvířata anglicky (emoji)', props: { pairs: [{ a: '🐶', b: 'dog' }, { a: '🐱', b: 'cat' }, { a: '🐟', b: 'fish' }, { a: '🐦', b: 'bird' }, { a: '🐴', b: 'horse' }, { a: '🐮', b: 'cow' }] } },
    { title: 'Prvky a značky', props: { pairs: [{ a: 'kyslík', b: 'O' }, { a: 'vodík', b: 'H' }, { a: 'uhlík', b: 'C' }, { a: 'železo', b: 'Fe' }, { a: 'sodík', b: 'Na' }, { a: 'dusík', b: 'N' }, { a: 'vápník', b: 'Ca' }, { a: 'stříbro', b: 'Ag' }] } },
    { title: 'Vzorce obsahů', props: { pairs: [{ a: '`a · a`', b: 'čtverec' }, { a: '`a · b`', b: 'obdélník' }, { a: '`a · v : 2`', b: 'trojúhelník' }, { a: '`π · r²`', b: 'kruh' }] } },
  ],
  check: (p) => {
    const e: string[] = []
    const seen = new Map<string, string>()
    p.pairs.forEach((pair, i) => {
      for (const side of ['a', 'b'] as const) {
        const k = norm(pair[side])
        const where = `pairs[${i}].${side}`
        if (seen.has(k)) e.push(`${where}: same text as ${seen.get(k)} – every card must be different`)
        else seen.set(k, where)
      }
    })
    return e
  },
  Component: Memory,
  html: (p, inline) => `<ul>${p.pairs.map((c) => `<li><b>${inline(c.a)}</b> – ${inline(c.b)}</li>`).join('')}</ul>`,
})
