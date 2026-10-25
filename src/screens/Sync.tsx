import { useEffect, useRef, useState } from 'preact/hooks'
import { renderSVG } from 'uqr'
import { decodeProgress, encodeProgress, shareUrl } from '../progress/code'
import { codeFrom, Link } from '../progress/p2p'
import { getProgress, importProgress, type Progress } from '../progress/store'
import { back, jump } from '../router'
import { Bar } from '../ui/Bar'
import { ICamera, ICopy, ILink, IQr, IShare } from '../ui/icons'
import { Mascot } from '../ui/Mascot'

export function Qr({ text }: { text: string }) {
  return <div class="qr" dangerouslySetInnerHTML={{ __html: renderSVG(text, { ecc: 'L', border: 1 }) }} />
}

/** Camera QR scanner (BarcodeDetector where available, otherwise a worker-based decoder). */
export function Scanner({ onCode }: { onCode: (text: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let scanner: { stop(): void; destroy(): void } | undefined, live = true
    import('qr-scanner').then(({ default: QrScanner }) => {
      if (!live) return
      const s = new QrScanner(video.current!, (r) => { s.stop(); onCode(r.data) }, { returnDetailedScanResult: true, preferredCamera: 'environment', maxScansPerSecond: 8 })
      scanner = s
      s.start().catch(() => setErr('Kamera není dostupná.'))
    })
    return () => { live = false; scanner?.stop(); scanner?.destroy() }
  }, [])
  return <div class="stack"><div class="video"><video ref={video} playsInline muted /></div>{err && <div class="err">{err}</div>}</div>
}

type View = 'menu' | 'code' | 'load' | 'host' | 'join' | 'done'

export function SyncScreen({ offer }: { offer?: string }) {
  const [view, setView] = useState<View>(offer ? 'join' : 'menu')
  const title = { menu: 'Přenést pokrok', code: 'Kód pokroku', load: 'Načíst kód', host: 'Propojit', join: 'Propojit', done: 'Hotovo' }[view]
  return (
    <div class="page">
      <Bar title={title} onBack={() => (view === 'menu' ? back() : view === 'done' ? jump('/') : setView('menu'))} />
      {view === 'menu' && (
        <div class="list">
          <button class="row" onClick={() => setView('host')}><span class="skey m"><ILink /></span><b>Propojit dvě zařízení</b></button>
          <button class="row" onClick={() => setView('code')}><span class="skey m"><IQr /></span><b>Ukázat kód pokroku</b></button>
          <button class="row" onClick={() => setView('load')}><span class="skey m"><ICamera /></span><b>Načíst kód</b></button>
          <p class="muted center" style={{ marginTop: '18px', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Bez účtu. Pokrok je jen v tomto zařízení a putuje přímo do druhého.
          </p>
        </div>
      )}
      {view === 'code' && <ShowCode />}
      {view === 'load' && <LoadCode onDone={() => setView('done')} />}
      {view === 'host' && <Host onDone={() => setView('done')} />}
      {view === 'join' && <Join offer={offer} onDone={() => setView('done')} />}
      {view === 'done' && (
        <div class="stack" style={{ paddingTop: '40px' }}>
          <div class="ok-big"><Mascot mood="happy" size={110} /></div>
          <p class="center"><b>Pokrok je spojený.</b></p>
          <button class="btn block" onClick={() => jump('/')}>Hotovo</button>
        </div>
      )}
    </div>
  )
}


function ShowCode() {
  const [code, setCode] = useState('')
  const [toast, setToast] = useState('')
  useEffect(() => { encodeProgress(getProgress()).then(setCode) }, [])
  if (!code) return null
  const url = shareUrl(code)
  const copy = async () => { await navigator.clipboard.writeText(url); setToast('Zkopírováno'); setTimeout(() => setToast(''), 1500) }
  return (
    <div class="stack">
      {url.length < 2800 ? <><Qr text={url} /><p class="muted center">Naskenuj druhým zařízením.</p></>
        : <p class="muted center">Na QR je toho moc. Použij <b>Propojit dvě zařízení</b> nebo pošli odkaz.</p>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button class="btn ghost" style={{ flex: 1 }} onClick={copy}><ICopy />Kopírovat</button>
        {'share' in navigator && <button class="btn ghost" style={{ flex: 1 }} onClick={() => navigator.share({ url }).catch(() => {})}><IShare />Sdílet</button>}
      </div>
      {toast && <div class="toast">{toast}</div>}
    </div>
  )
}

async function applyCode(text: string) {
  importProgress(await decodeProgress(codeFrom(text)))
}

function LoadCode({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [cam, setCam] = useState(true)
  const run = (t: string) => applyCode(t).then(onDone, (e) => { setErr(e.message || 'Neplatný kód'); setCam(false) })
  return (
    <div class="stack">
      {cam ? <Scanner onCode={run} /> : <button class="btn ghost block" onClick={() => { setErr(''); setCam(true) }}><ICamera />Skenovat znovu</button>}
      <textarea class="codebox" placeholder="…nebo vlož kód" value={text} onInput={(e) => setText(e.currentTarget.value)} />
      <button class="btn block" disabled={!text.trim()} onClick={() => run(text)}>Načíst</button>
      {err && <div class="err">{err}</div>}
    </div>
  )
}

/** Exchange progress over an open link, merge, then report done. */
function exchange(link: Link, onDone: () => void) {
  let sent = false, got = false
  const finish = () => { if (sent && got) { setTimeout(() => link.close(), 500); onDone() } }
  link.onOpen = () => { link.send({ p: getProgress() }); sent = true; finish() }
  link.onMessage = (m) => { const p = (m as { p?: Progress }).p; if (p?.v === 1) { importProgress(p); got = true; finish() } }
}

function Host({ onDone }: { onDone: () => void }) {
  const [offer, setOffer] = useState('')
  const [scan, setScan] = useState(false)
  const [state, setState] = useState<'' | 'connecting' | 'fail'>('')
  const [err, setErr] = useState('')
  const link = useRef<Link | undefined>(undefined)
  useEffect(() => {
    const l = new Link(); link.current = l
    exchange(l, onDone)
    l.onFail = () => setState('fail')
    l.offer().then((c) => setOffer(`${location.origin}/#/spojit/${c}`), () => setState('fail'))
    return () => { if (l.pc.connectionState !== 'connected') l.close() }
  }, [])
  if (state === 'fail') return <Failed />
  if (state === 'connecting') return <div class="empty"><Mascot mood="wow" size={96} />Spojuji…</div>
  return (
    <div class="stack">
      {!scan ? (
        <>
          <p class="center"><b>1.</b> Druhým zařízením naskenuj tento kód.</p>
          {offer ? <Qr text={offer} /> : <div class="empty">…</div>}
          <button class="btn block" disabled={!offer} onClick={() => setScan(true)}><ICamera />2. Naskenovat odpověď</button>
        </>
      ) : (
        <>
          <p class="center"><b>2.</b> Naskenuj kód z druhého zařízení.</p>
          <Scanner onCode={(t) => link.current!.accept(codeFrom(t)).then(() => setState('connecting'), (e) => { setErr(e.message); setScan(false) })} />
        </>
      )}
      {err && <div class="err">{err}</div>}
    </div>
  )
}

function Join({ offer, onDone }: { offer?: string; onDone: () => void }) {
  const [answer, setAnswer] = useState('')
  const [err, setErr] = useState('')
  const [fail, setFail] = useState(false)
  const link = useRef<Link | undefined>(undefined)
  const start = (code: string) => {
    const l = new Link(); link.current = l
    exchange(l, onDone)
    l.onFail = () => setFail(true)
    l.answer(codeFrom(code)).then(setAnswer, (e) => setErr(e.message || 'Neplatný kód'))
  }
  useEffect(() => { if (offer) start(offer); return () => { const l = link.current; if (l && l.pc.connectionState !== 'connected') l.close() } }, [])
  if (fail) return <Failed />
  if (answer) return (
    <div class="stack">
      <p class="center">Teď tento kód naskenuj prvním zařízením.</p>
      <Qr text={answer} />
    </div>
  )
  return (
    <div class="stack">
      <p class="center">Naskenuj kód z prvního zařízení.</p>
      {!offer && <Scanner onCode={start} />}
      {err && <div class="err">{err}</div>}
    </div>
  )
}

function Failed() {
  return (
    <div class="empty">
      <Mascot mood="sad" size={96} />
      <p>Přímé spojení se nepovedlo. Zkus obě zařízení na stejné Wi-Fi, nebo použij <b>kód pokroku</b>.</p>
      <button class="btn" onClick={() => location.reload()}>Zkusit znovu</button>
    </div>
  )
}
