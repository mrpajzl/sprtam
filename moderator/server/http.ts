import type { IncomingMessage, ServerResponse } from 'node:http'
import { BlockList, isIPv4, isIPv6 } from 'node:net'
import { CONFIG, LIMITS, MINUTE } from './config'

// Small HTTP helpers: JSON in and out, cookies, security headers, rate limits, errors with a Czech message.

export type Req = IncomingMessage
export type Res = ServerResponse

/** An error the client may see: status + Czech message (+ a machine code). */
export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string, public extra?: Record<string, unknown>) { super(message) }
}

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:",
    "connect-src 'self'", "media-src 'self' blob:", "frame-src 'self'", "frame-ancestors 'self'", "base-uri 'none'", "form-action 'self'", "object-src 'none'",
  ].join('; '),
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), publickey-credentials-create=(self), publickey-credentials-get=(self)',
  'X-Robots-Tag': 'noindex, nofollow',
  ...(CONFIG.secure ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' } : {}),
}

export function json(res: Res, status: number, body: unknown, headers: Record<string, string | string[]> = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}

/** The request body as JSON (objects only), at most `max` bytes. */
export function readJson(req: Req, max = LIMITS.body): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const type = req.headers['content-type'] ?? ''
    if (!/^application\/json\b/.test(type)) return reject(new HttpError(415, 'Očekávám JSON.'))
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > max) { reject(new HttpError(413, 'Požadavek je moc velký.')); req.destroy() } else chunks.push(c)
    })
    req.on('end', () => {
      try {
        const v = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error()
        resolve(v)
      } catch { reject(new HttpError(400, 'Neplatný JSON.')) }
    })
    req.on('error', reject)
  })
}

export function cookies(req: Req): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

/** `__Host-` cookies: only over HTTPS, only for this exact host, path /. Plain name in local development. */
export const SESSION_COOKIE = CONFIG.secure ? '__Host-moderace' : 'moderace'

export function sessionCookie(token: string, maxAgeMs: number) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAgeMs / 1000)}${CONFIG.secure ? '; Secure' : ''}`
}
export const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${CONFIG.secure ? '; Secure' : ''}`

// Cloudflare's address ranges (https://www.cloudflare.com/ips/). Only a request that reached our proxy from one
// of them carries a CF-Connecting-IP we can believe; anyone connecting to the origin directly could forge it.
const CLOUDFLARE = new BlockList()
for (const r of [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
]) { const [a, n] = r.split('/'); CLOUDFLARE.addSubnet(a, Number(n), a.includes(':') ? 'ipv6' : 'ipv4') }

const isCloudflare = (ip: string) => (isIPv4(ip) ? CLOUDFLARE.check(ip, 'ipv4') : isIPv6(ip) ? CLOUDFLARE.check(ip, 'ipv6') : false)

/**
 * The client's address. Behind the proxy (TRUST_PROXY=1) the peer that reached the proxy is the last
 * X-Forwarded-For entry; CF-Connecting-IP counts only when that peer is Cloudflare.
 */
export function clientIp(req: Req): string {
  const socket = (req.socket.remoteAddress ?? '?').replace(/^::ffff:/, '')
  if (!CONFIG.trustProxy) return socket
  const xff = String(req.headers['x-forwarded-for'] ?? '').split(',').map((x) => x.trim()).filter(Boolean)
  const peer = (xff[xff.length - 1] ?? socket).replace(/^::ffff:/, '')
  const cf = req.headers['cf-connecting-ip']
  return isCloudflare(peer) && typeof cf === 'string' && (isIPv4(cf) || isIPv6(cf)) ? cf : peer
}

/** Rate-limit key of an address: IPv6 by its /64 (one household or server gets a whole /64). */
export const ipKey = (ip: string) => (isIPv6(ip) ? ip.split(':').slice(0, 4).join(':') : ip)

/**
 * Cross-site request protection for every request that changes something: the browser must say it comes
 * from our own origin. Together with SameSite=Strict cookies and JSON-only bodies (which need a CORS
 * preflight we never grant) a foreign page cannot act in a moderator's name.
 */
export function assertSameOrigin(req: Req) {
  const origin = req.headers.origin
  const site = req.headers['sec-fetch-site']
  if (origin !== CONFIG.origin || (site !== undefined && site !== 'same-origin')) throw new HttpError(403, 'Požadavek nepochází z moderace.')
}

// ——— Rate limits (fixed windows, in memory; one server instance) ———

const windows = new Map<string, { n: number; until: number }>()
setInterval(() => { const now = Date.now(); for (const [k, w] of windows) if (w.until < now) windows.delete(k) }, MINUTE).unref()

/** Throws 429 after `max` hits of `key` within `ms`. */
export function limit(key: string, max: number, ms: number) {
  const now = Date.now()
  let w = windows.get(key)
  if (!w || w.until < now) { w = { n: 0, until: now + ms }; windows.set(key, w) }
  if (++w.n > max) throw new HttpError(429, 'Moc pokusů za sebou. Zkus to za chvíli znovu.', 'rate', { retryAfter: Math.ceil((w.until - now) / 1000) })
}
