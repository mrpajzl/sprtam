import { useEffect, useRef, useState } from 'preact/hooks'
import { encode } from 'uqr'
import { SITE_NAME } from '../seo'
import { IClose, ICopy, IDownload, IQr, IShare } from './icons'

// A QR code of the current page, held by Šprťa: the code sits on the mascot's screen
// and his face marks its centre (error correction H keeps it readable).

const INK = '#141518'
const ORANGE = '#ff5b14'
const PAPER = '#fbfbf8'
const MONO = "'JetBrains Mono Variable', ui-monospace, Menlo, monospace"
const W = 300, H = 400
const SCREEN = { x: 32, y: 74, s: 236 }
const QR = { x: 46, y: 88, s: 208 }
const FACE = { cx: 150, cy: 192, w: 68, h: 54 }

/** Address of the page without the #fragment (it carries private codes). */
const pageUrl = () => location.origin + location.pathname + location.search

/** Name of the page as in the tab title, without the site name. */
function pageName() {
  const t = document.title
  if (t.startsWith(SITE_NAME)) return 'opakování učiva ZŠ a SŠ'
  const name = t.replace(new RegExp(` \\| ${SITE_NAME}$`), '')
  // „Zlomky – Matematika, 5. třída“ does not fit on the card: keep the topic.
  return name.length > 24 ? name.split(' – ')[0] : name
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const f = (n: number) => +n.toFixed(2)

function modules(url: string) {
  const { size, data, types } = encode(url, { ecc: 'H', border: 0 })
  const m = QR.s / size
  const half = (v: number) => v / 2 + m * 0.4
  let dots = ''
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!data[r][c] || types[r][c] === 2) continue // finder patterns are drawn whole below
      const x = QR.x + c * m, y = QR.y + r * m
      if (Math.abs(x + m / 2 - FACE.cx) < half(FACE.w) && Math.abs(y + m / 2 - FACE.cy) < half(FACE.h)) continue
      dots += `<rect x="${f(x + m * 0.08)}" y="${f(y + m * 0.08)}" width="${f(m * 0.84)}" height="${f(m * 0.84)}" rx="${f(m * 0.3)}"/>`
    }
  }
  const eye = (r: number, c: number) => {
    const x = QR.x + c * m, y = QR.y + r * m
    return `<rect x="${f(x + m / 2)}" y="${f(y + m / 2)}" width="${f(m * 6)}" height="${f(m * 6)}" rx="${f(m * 1.9)}" fill="none" stroke="${INK}" stroke-width="${f(m)}"/>`
      + `<rect x="${f(x + m * 2)}" y="${f(y + m * 2)}" width="${f(m * 3)}" height="${f(m * 3)}" rx="${f(m * 0.9)}"/>`
  }
  return `<g fill="${INK}">${dots}${eye(0, 0)}${eye(0, size - 7)}${eye(size - 7, 0)}</g>`
}

/** The whole card as SVG; `text: false` leaves out the lettering (drawn on the canvas for the PNG). */
function cardSvg(url: string, name: string, text = true) {
  const words = text
    ? `<text x="34" y="347" font-family="${MONO}" font-size="23" font-weight="800" letter-spacing="-0.4" fill="${INK}">šprtám</text>`
      + `<text x="35" y="367" font-family="${MONO}" font-size="12" font-weight="650" fill="${INK}" fill-opacity="0.72">${esc(clip(name, 24))}</text>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`
    + `<g class="qr-limb" fill="${INK}"><rect x="96" y="372" width="26" height="24" rx="7"/><rect x="178" y="372" width="26" height="24" rx="7"/></g>`
    + `<path class="qr-limb" d="M150 36V16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle class="qr-tip" cx="150" cy="12" r="7.5" fill="${ORANGE}"/>`
    + `<rect x="8" y="30" width="284" height="350" rx="40" fill="${ORANGE}"/>`
    + `<circle cx="264" cy="52" r="5.5" fill="${INK}"/>`
    + `<rect x="${SCREEN.x - 6}" y="${SCREEN.y - 6}" width="${SCREEN.s + 12}" height="${SCREEN.s + 12}" rx="27" fill="${INK}"/>`
    + `<rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.s}" height="${SCREEN.s}" rx="21" fill="${PAPER}"/>`
    + modules(url)
    + `<g transform="translate(${FACE.cx} ${FACE.cy}) scale(1.6) translate(-31 -30.5)">`
    + `<rect x="12" y="16" width="38" height="29" rx="9" fill="${ORANGE}"/><rect x="14" y="18" width="34" height="25" rx="7" fill="${INK}"/>`
    + `<path d="M21.5 30l3-4 3 4M36.5 30l3-4 3 4" fill="none" stroke="#f4f4f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M27 34.5q5 4.5 10 0" fill="none" stroke="#f4f4f1" stroke-width="2.4" stroke-linecap="round"/></g>`
    + `<circle cx="232" cy="352" r="13" fill="${INK}"/><circle cx="264" cy="352" r="13" fill="#f4f4f1"/>`
    + words
    + `</svg>`
}

/** The card as a PNG; the lettering is drawn with the app's own font. */
async function cardPng(url: string, name: string): Promise<Blob> {
  const k = 3
  const img = new Image()
  const src = URL.createObjectURL(new Blob([cardSvg(url, name, false)], { type: 'image/svg+xml' }))
  try {
    await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = src })
  } finally { URL.revokeObjectURL(src) }
  await Promise.all([document.fonts.load(`800 23px 'JetBrains Mono Variable'`, 'šprtám'), document.fonts.load(`650 12px 'JetBrains Mono Variable'`, name)]).catch(() => {})
  const cv = document.createElement('canvas')
  cv.width = W * k; cv.height = H * k
  const g = cv.getContext('2d')!
  g.drawImage(img, 0, 0, cv.width, cv.height)
  g.scale(k, k)
  g.fillStyle = INK
  g.font = `800 23px ${MONO}`
  g.letterSpacing = '-0.4px'
  g.fillText('šprtám', 34, 347)
  g.font = `650 12px ${MONO}`
  g.letterSpacing = '0px'
  g.globalAlpha = 0.72
  g.fillText(clip(name, 24), 35, 367)
  return new Promise((ok, no) => cv.toBlob((b) => (b ? ok(b) : no(new Error('PNG'))), 'image/png'))
}

const fileName = () => `sprtam${location.pathname.replace(/\/+$/, '').replace(/[^\w-]+/g, '-') || '-domu'}.png`

/** Header button that shows the page's QR code. */
export function QrButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button class="icon-btn" onClick={() => setOpen(true)} aria-label="QR kód stránky" aria-haspopup="dialog"><IQr /></button>
      {open && <QrDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function QrDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [url] = useState(pageUrl)
  const [name] = useState(pageName)
  const [toast, setToast] = useState('')
  useEffect(() => { ref.current?.showModal() }, [])
  // Leaving the page (back gesture, a link) closes the code with it.
  useEffect(() => {
    addEventListener('popstate', onClose)
    return () => removeEventListener('popstate', onClose)
  }, [])

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1500) }
  const copy = () => navigator.clipboard.writeText(url).then(() => say('Zkopírováno'), () => say('Nejde zkopírovat'))
  const share = () => navigator.share({ title: name, url }).catch(() => {})
  const save = () => cardPng(url, name).then((b) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(b)
    a.download = fileName()
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  }, () => say('Obrázek nejde uložit'))

  // Keys stay in the dialog: no answering a drill card or jumping to search behind it.
  return (
    <dialog ref={ref} class="qr-sheet" aria-label={`QR kód: ${name}`} onClose={onClose} onKeyDown={(e) => e.stopPropagation()} onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).classList.contains('qr-body')) ref.current?.close() }}>
      <div class="qr-body">
        <button class="icon-btn qr-x" onClick={() => ref.current?.close()} aria-label="Zavřít"><IClose /></button>
        <div class="qr-card" role="img" aria-label={`QR kód odkazu ${url}`} dangerouslySetInnerHTML={{ __html: cardSvg(url, name) }} />
        <div class="qr-actions">
          {'share' in navigator
            ? <button class="btn ghost" onClick={share}><IShare />Sdílet</button>
            : <button class="btn ghost" onClick={copy}><ICopy />Kopírovat</button>}
          <button class="btn ghost" onClick={save}><IDownload />Uložit</button>
        </div>
      </div>
      {toast && <div class="toast">{toast}</div>}
    </dialog>
  )
}
