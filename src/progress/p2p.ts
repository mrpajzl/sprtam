import { pack, unpack } from './code'

// Direct device-to-device link over WebRTC. There is no signalling server:
// the two devices exchange the connection offer/answer by scanning each other's QR code.
// Progress then flows straight between the devices (encrypted by DTLS).
// The public STUN server only tells a device its own public address; it never sees any data.

const ICE: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }]

type Sig = { k: 'o' | 'a'; s: string }

function slim(sdp: string) {
  // Drop TCP and IPv6 candidates to keep the QR code small.
  return sdp.split('\r\n').filter((l) => !(l.startsWith('a=candidate') && (/ tcp /i.test(l) || / [0-9a-f]*:[0-9a-f:]+ \d+ typ/i.test(l)))).join('\r\n')
}

function gathered(pc: RTCPeerConnection) {
  return new Promise<void>((done) => {
    if (pc.iceGatheringState === 'complete') return done()
    const t = setTimeout(done, 3000)
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); done() } })
  })
}

export class Link {
  pc = new RTCPeerConnection({ iceServers: ICE })
  ch?: RTCDataChannel
  onOpen = () => {}
  onMessage = (_: unknown) => {}
  onFail = () => {}

  constructor() {
    this.pc.addEventListener('connectionstatechange', () => { if (this.pc.connectionState === 'failed') this.onFail() })
  }

  private wire(ch: RTCDataChannel) {
    this.ch = ch
    ch.onopen = () => this.onOpen()
    ch.onmessage = (e) => { try { this.onMessage(JSON.parse(e.data)) } catch { /* ignore */ } }
  }

  send(msg: unknown) { this.ch?.send(JSON.stringify(msg)) }
  close() { this.ch?.close(); this.pc.close() }

  /** Device A: create the offer to show as a QR code. */
  async offer(): Promise<string> {
    this.wire(this.pc.createDataChannel('sprtam'))
    await this.pc.setLocalDescription(await this.pc.createOffer())
    await gathered(this.pc)
    return pack({ k: 'o', s: slim(this.pc.localDescription!.sdp) } satisfies Sig)
  }

  /** Device B: read A's offer, return the answer to show as a QR code. */
  async answer(offerCode: string): Promise<string> {
    const sig = await unpack<Sig>(offerCode)
    if (sig.k !== 'o') throw new Error('Tohle není kód pro spojení')
    this.pc.ondatachannel = (e) => this.wire(e.channel)
    await this.pc.setRemoteDescription({ type: 'offer', sdp: sig.s })
    await this.pc.setLocalDescription(await this.pc.createAnswer())
    await gathered(this.pc)
    return pack({ k: 'a', s: slim(this.pc.localDescription!.sdp) } satisfies Sig)
  }

  /** Device A: read B's answer – the link opens. */
  async accept(answerCode: string) {
    const sig = await unpack<Sig>(answerCode)
    if (sig.k !== 'a') throw new Error('Naskenuj kód z druhého zařízení')
    await this.pc.setRemoteDescription({ type: 'answer', sdp: sig.s })
  }
}

/** Pulls the code out of whatever was scanned (a link or the bare code). */
export const codeFrom = (text: string) => text.trim().split('/').pop()!.split('?')[0]
