import { Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget, Slider } from './kit'

// IPv4 address + prefix (CIDR). Shows the address and the mask in binary with the network part
// told apart from the host part, then the network, broadcast, usable range and host count.
// /31 (point-to-point, RFC 3021) and /32 (one host) are the special cases without a broadcast.

const ASK = ['network', 'broadcast', 'first', 'last', 'hosts', 'mask'] as const
type Ask = (typeof ASK)[number]
const ASK_CS: Record<Ask, string> = {
  network: 'adresa sítě',
  broadcast: 'broadcast (všesměrová adresa)',
  first: 'první použitelná adresa',
  last: 'poslední použitelná adresa',
  hosts: 'počet hostitelů',
  mask: 'maska desítkově',
}

const props = s.object({
  ip: s.string({ pattern: '^\\d{1,3}(\\.\\d{1,3}){3}$', description: 'IPv4 adresa v tečkovém zápisu, např. "192.168.1.130". Každé ze čtyř čísel 0–255.' }),
  prefix: s.int({ min: 0, max: 32, description: 'Prefix (délka masky): kolik prvních bitů adresy patří síti, např. 24 pro /24 (maska 255.255.255.0).' }),
  split: s.optional(s.int({ min: 1, max: 8, description: 'Otevře režim „rozděl síť“: síť se rozdělí na 2^split stejných podsítí (1 → 2 podsítě, 2 → 4…). Prefix + split nesmí přesáhnout 32.' })),
  ask: s.optional(s.enum(ASK, { description: 'Jen pro otázku (input): na co se ptá. "network" adresa sítě (výchozí), "broadcast", "first" první a "last" poslední použitelná adresa, "hosts" počet hostitelů, "mask" maska desítkově.' })),
}, { description: 'IPv4 adresa s prefixem, např. 192.168.1.130/26.' })
type P = Infer<typeof props>

// ——— Math (unsigned 32-bit) ———

const parse = (ip: string) => ip.split('.').map(Number)
const toInt = (o: number[]) => ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0
const toIp = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
const maskOf = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0)
/** 16777214 → „16 777 214“ (non-breaking spaces). */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

function calc(ip: number, p: number) {
  const mask = maskOf(p)
  const net = (ip & mask) >>> 0
  const bc = (net | (~mask >>> 0)) >>> 0
  const hosts = p === 32 ? 1 : p === 31 ? 2 : 2 ** (32 - p) - 2
  return { mask, net, bc, hosts, first: p >= 31 ? net : net + 1, last: p >= 31 ? bc : bc - 1 }
}

/** The answer to a question about the widget, as text. */
export function subnetAnswer({ ip, prefix, ask = 'network' }: P) {
  const r = calc(toInt(parse(ip)), prefix)
  return ask === 'hosts' ? String(r.hosts) : toIp(ask === 'mask' ? r.mask : ask === 'network' ? r.net : ask === 'broadcast' ? r.bc : ask === 'first' ? r.first : r.last)
}

function kindOf(o: number[]): { text: string; tag: 'priv' | 'pub' | 'spec' } {
  const [a, b] = o
  if (toInt(o) === 0xffffffff) return { text: 'omezený broadcast (255.255.255.255)', tag: 'spec' }
  if (a === 0) return { text: 'zvláštní: „tato síť“ (0.0.0.0/8)', tag: 'spec' }
  if (a === 10) return { text: 'privátní (10.0.0.0/8)', tag: 'priv' }
  if (a === 172 && b >= 16 && b <= 31) return { text: 'privátní (172.16.0.0/12)', tag: 'priv' }
  if (a === 192 && b === 168) return { text: 'privátní (192.168.0.0/16)', tag: 'priv' }
  if (a === 127) return { text: 'loopback (127.0.0.0/8) – počítač sám sobě', tag: 'spec' }
  if (a === 169 && b === 254) return { text: 'APIPA (169.254.0.0/16) – sám si ji dá, když chybí DHCP', tag: 'spec' }
  if (a === 100 && b >= 64 && b <= 127) return { text: 'sdílená pro CGNAT (100.64.0.0/10)', tag: 'spec' }
  if (a >= 224 && a <= 239) return { text: 'multicast (224.0.0.0/4)', tag: 'spec' }
  if (a >= 240) return { text: 'rezervovaná (240.0.0.0/4)', tag: 'spec' }
  return { text: 'veřejná', tag: 'pub' }
}
const classOf = (a: number) =>
  a < 128 ? 'A (výchozí /8)' : a < 192 ? 'B (výchozí /16)' : a < 224 ? 'C (výchozí /24)' : a < 240 ? 'D (multicast)' : 'E (rezervovaná)'

// ——— View ———

function Bits({ n, p, label }: { n: number; p: number; label: string }) {
  const b = n.toString(2).padStart(32, '0')
  return (
    <div class="subnet-row">
      <div class="subnet-head"><span>{label}</span><b>{toIp(n)}</b></div>
      <div class="subnet-bits" role="img" aria-label={`${label} binárně: ${[0, 1, 2, 3].map((o) => b.slice(o * 8, o * 8 + 8)).join(' ')}`}>
        {[0, 1, 2, 3].map((o) => (
          <span key={o} class="subnet-oct">
            {[...b.slice(o * 8, o * 8 + 8)].map((c, i) => <i key={i} class={o * 8 + i < p ? 'net' : 'host'}>{c}</i>)}
          </span>
        ))}
      </div>
    </div>
  )
}

function Subnet({ ip, prefix, split }: P) {
  const [oct, setOct] = useState(() => parse(ip).map((x) => Math.min(255, Math.max(0, x || 0))))
  const [p, setP] = useState(prefix)
  const [k, setK] = useState(split ?? 0)
  const ipN = toInt(oct)
  const r = calc(ipN, p)
  const kind = kindOf(oct)
  const setO = (i: number, v: number) => setOct(oct.map((x, j) => (j === i ? Math.min(255, Math.max(0, v)) : x)))
  const kMax = Math.min(8, 32 - p)
  const kk = Math.min(k, kMax)
  const role = p < 31 && ipN === r.net ? 'Zadaná adresa je adresa sítě – počítač ji dostat nemůže.'
    : p < 31 && ipN === r.bc ? 'Zadaná adresa je broadcast – počítač ji dostat nemůže.'
    : 'Zadaná adresa je použitelná pro počítač.'
  const hostBits = 32 - p

  // Subnets: list at most 8 rows (first 6, …, last one).
  const subs: { i: number; net: number }[] = []
  if (kk > 0) {
    const cnt = 2 ** kk, size = 2 ** (32 - p - kk)
    const idx = cnt <= 8 ? [...Array(cnt).keys()] : [0, 1, 2, 3, 4, 5, -1, cnt - 1]
    for (const i of idx) subs.push({ i, net: i < 0 ? -1 : r.net + i * size })
  }
  const np = p + kk

  return (
    <div class="w subnet">
      <div class="subnet-ed" role="group" aria-label="IP adresa">
        {oct.map((v, i) => (
          <Fragment key={i}>
            <div class="subnet-oe">
              <button onClick={() => setO(i, v + 1)} aria-label={`${i + 1}. číslo adresy o 1 víc`}>+</button>
              <input
                type="number" inputMode="numeric" min={0} max={255} value={v}
                aria-label={`${i + 1}. číslo adresy (0 až 255)`}
                onInput={(e) => {
                  const raw = e.currentTarget.value
                  if (raw === '') return
                  const n = Math.min(255, Math.max(0, Math.round(Number(raw))))
                  if (!Number.isFinite(n)) return
                  if (String(n) !== raw) e.currentTarget.value = String(n)
                  setO(i, n)
                }}
              />
              <button onClick={() => setO(i, v - 1)} aria-label={`${i + 1}. číslo adresy o 1 míň`}>−</button>
            </div>
            {i < 3 && <span class="subnet-dot" aria-hidden="true">.</span>}
          </Fragment>
        ))}
        <span class="subnet-pre" aria-hidden="true">/{p}</span>
      </div>

      <div class="subnet-prefix">
        <button class="subnet-pm" onClick={() => setP(Math.max(0, p - 1))} aria-label="Prefix o 1 menší">−</button>
        <Slider name="Prefix" value={p} set={setP} min={0} max={32} />
        <button class="subnet-pm" onClick={() => setP(Math.min(32, p + 1))} aria-label="Prefix o 1 větší">+</button>
      </div>

      <div class="subnet-bin">
        <Bits n={ipN} p={p} label="Adresa" />
        <Bits n={r.mask} p={p} label="Maska" />
        <Bits n={r.net} p={p} label="Adresa sítě (adresa AND maska)" />
        <div class="subnet-legend"><span><i class="net" /> síť: {p} {p === 1 ? 'bit' : p >= 2 && p <= 4 ? 'bity' : 'bitů'}</span><span><i class="host" /> hostitel: {hostBits} {hostBits === 1 ? 'bit' : hostBits >= 2 && hostBits <= 4 ? 'bity' : 'bitů'}</span></div>
      </div>

      <div class="val" aria-live="polite">{toIp(r.net)}/{p} · {big(r.hosts)} {r.hosts === 1 ? 'hostitel' : r.hosts <= 4 ? 'hostitelé' : 'hostitelů'}</div>

      <dl class="subnet-res">
        <dt>Maska</dt><dd>{toIp(r.mask)}</dd>
        <dt>Adresa sítě</dt><dd>{toIp(r.net)}</dd>
        <dt>Broadcast</dt><dd>{p >= 31 ? <span class="subnet-note">není ({p === 31 ? '/31 spojuje jen 2 zařízení' : '/32 je jediná adresa'})</span> : toIp(r.bc)}</dd>
        <dt>První použitelná</dt><dd>{toIp(r.first)}</dd>
        <dt>Poslední použitelná</dt><dd>{toIp(r.last)}</dd>
        <dt>Počet hostitelů</dt>
        <dd>{p === 32 ? '1 (jen tato adresa)' : p === 31 ? '2 (zvláštní případ /31)' : <>2<sup>{32 - p}</sup> − 2 = {big(r.hosts)}</>}</dd>
        <dt>Typ adresy</dt><dd><span class={`subnet-tag ${kind.tag}`}>{kind.text}</span></dd>
        <dt>Třída</dt><dd>{classOf(oct[0])}</dd>
      </dl>
      <div class="sub">{role}</div>

      <div class="ctrls">
        <button class="reveal" disabled={kMax === 0} aria-pressed={kk > 0} onClick={() => setK(kk > 0 ? 0 : 1)}>{kk > 0 ? 'Zavřít dělení' : 'Rozdělit síť'}</button>
      </div>
      {kk > 0 && (
        <div class="subnet-split">
          <div class="subnet-prefix">
            <button class="subnet-pm" onClick={() => setK(Math.max(1, kk - 1))} aria-label="Méně podsítí">−</button>
            <span class="subnet-cnt" aria-live="polite">{big(2 ** kk)} podsítě /{np} · půjčeno {kk} {kk === 1 ? 'bit' : kk <= 4 ? 'bity' : 'bitů'}</span>
            <button class="subnet-pm" onClick={() => setK(Math.min(kMax, kk + 1))} aria-label="Více podsítí">+</button>
          </div>
          <div class="sub">Každá má {np === 32 ? '1 adresu' : np === 31 ? '2 adresy' : <>2<sup>{32 - np}</sup> − 2 = {big(2 ** (32 - np) - 2)} hostitelů</>}.</div>
          <ol class="subnet-list">
            {subs.map(({ i, net }) => {
              if (i < 0) return <li key="gap" class="gap">… dalších {big(2 ** kk - 7)} …</li>
              const q = calc(net, np)
              const mine = ipN >= q.net && ipN <= q.bc
              return (
                <li key={i} class={mine ? 'mine' : ''}>
                  <b>{i + 1}. {toIp(q.net)}/{np}</b>
                  <span>{np >= 31 ? `${toIp(q.first)} – ${toIp(q.last)}` : `${toIp(q.first)} – ${toIp(q.last)}, broadcast ${toIp(q.bc)}`}{mine ? ' ← tvoje adresa' : ''}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

function SubnetQuestion({ ip, prefix, ask = 'network' }: P) {
  return (
    <div class="w subnet">
      <div class="val subnet-q">{ip}/{prefix}</div>
      <div class="sub">Hledáš: {ASK_CS[ask]}</div>
    </div>
  )
}

const norm = (x: string) => x.replace(/\s/g, '')

export default defineWidget({
  name: 'subnet',
  title: 'IP adresa a maska',
  summary: 'IPv4 adresa s prefixem /0–/32. Dítě mění čísla adresy a prefix a vidí adresu i masku binárně (síťová část barevně), adresu sítě, broadcast, rozsah použitelných adres, počet hostitelů a typ adresy. Umí i rozdělit síť na podsítě.',
  use: 'Počítačové sítě (SŠ): IP adresa, maska, prefix (CIDR), adresa sítě a broadcast, počet hostitelů, privátní adresy, dělení na podsítě.',
  props,
  examples: [
    { title: 'Domácí síť /24', props: { ip: '192.168.1.25', prefix: 24 } },
    { title: 'Síť /26 ve škole', props: { ip: '192.168.10.77', prefix: 26, ask: 'network' } },
    { title: 'Rozdělení sítě 10.0.0.0/24 na 4 podsítě', props: { ip: '10.0.0.0', prefix: 24, split: 2 } },
  ],
  check: (p) => {
    const e: string[] = []
    const o = parse(p.ip)
    if (o.length !== 4 || o.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) e.push('ip: every number must be 0–255')
    if (/(^|\.)0\d/.test(p.ip)) e.push('ip: no leading zeros (write 10.0.0.1, not 010.000.000.001)')
    if (p.split !== undefined && p.prefix + p.split > 32) e.push('prefix + split must be at most 32')
    if (p.ask === 'broadcast' && p.prefix >= 31) e.push('/31 and /32 have no broadcast address; ask something else')
    return e
  },
  Component: Subnet,
  Question: SubnetQuestion,
  checkQuestion: (p, answers) => {
    const want = subnetAnswer(p)
    return answers.some((a) => norm(a) === want) ? [] : [`the ${ASK_CS[p.ask ?? 'network']} ${want} is not among the answers`]
  },
  html: (p, inline) => {
    const r = calc(toInt(parse(p.ip)), p.prefix)
    // The address comes from content: escaped like any text, though the check only lets real addresses through.
    return `<p>IP adresa ${inline(`${p.ip}/${p.prefix}`)}: maska ${toIp(r.mask)}, adresa sítě ${toIp(r.net)}${p.prefix < 31 ? `, broadcast ${toIp(r.bc)}` : ''}, použitelné adresy ${toIp(r.first)} – ${toIp(r.last)}, počet hostitelů ${big(r.hosts)}.</p>`
  },
})
