import { useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// Colour mixing. The colours here are the content itself, so they are written as literal values.
//   rgb   additive (light): three light circles blended with `screen` – overlaps add up exactly.
//   cmyk  subtractive (ink): three ink circles blended with `multiply`; R = 255 · (1 − C) · (1 − K) …
//   wheel Itten's 12-part colour wheel used in Czech art lessons (primary yellow, red, blue).

const WHEEL = [
  { name: 'žlutá', hex: '#f7e21b', kind: 1 },
  { name: 'žlutooranžová', hex: '#f9b219', kind: 3 },
  { name: 'oranžová', hex: '#f28c1e', kind: 2 },
  { name: 'červenooranžová', hex: '#ea5a24', kind: 3 },
  { name: 'červená', hex: '#e0232e', kind: 1 },
  { name: 'červenofialová', hex: '#b5246f', kind: 3 },
  { name: 'fialová', hex: '#6f2c8f', kind: 2 },
  { name: 'modrofialová', hex: '#4a3a97', kind: 3 },
  { name: 'modrá', hex: '#1f5fad', kind: 1 },
  { name: 'modrozelená', hex: '#158c8b', kind: 3 },
  { name: 'zelená', hex: '#3ba846', kind: 2 },
  { name: 'žlutozelená', hex: '#a6c83a', kind: 3 },
] as const
type Name = (typeof WHEEL)[number]['name']
const NAMES = WHEEL.map((c) => c.name) as unknown as readonly Name[]
const KIND = ['', 'primární', 'sekundární', 'terciární']
const RELS = ['doplňková', 'analogické', 'triáda', 'teplé a studené'] as const
type Rel = (typeof RELS)[number]
/** Sectors 0–5 (žlutá … červenofialová) are warm, 6–11 cold. The border is a convention. */
const warm = (k: number) => k < 6

const props = s.object({
  mode: s.enum(['rgb', 'cmyk', 'wheel'], { description: 'Co se ukáže na začátku: rgb = míchání světla (monitor), cmyk = míchání barev pro tisk, wheel = barevný kruh. Dítě může přepnout.' }),
  rgb: s.optional(s.tuple([
    s.int({ min: 0, max: 255, description: 'Červená R, 0–255.' }),
    s.int({ min: 0, max: 255, description: 'Zelená G, 0–255.' }),
    s.int({ min: 0, max: 255, description: 'Modrá B, 0–255.' }),
  ], { description: 'Výchozí světlo [R, G, B]. Výchozí [255, 255, 0] (žlutá).' })),
  cmyk: s.optional(s.tuple([
    s.int({ min: 0, max: 100, description: 'Azurová C v %.' }),
    s.int({ min: 0, max: 100, description: 'Purpurová M v %.' }),
    s.int({ min: 0, max: 100, description: 'Žlutá Y v %.' }),
    s.int({ min: 0, max: 100, description: 'Černá K v %.' }),
  ], { description: 'Výchozí barvy pro tisk [C, M, Y, K] v procentech. Výchozí [100, 0, 100, 0] (zelená).' })),
  pick: s.optional(s.enum(NAMES, { description: 'Barevný kruh: která barva je vybraná na začátku. Výchozí žlutá.' })),
  show: s.optional(s.enum(RELS, { description: 'Barevný kruh: co se ukáže k vybrané barvě. Výchozí doplňková.' })),
})
type P = Infer<typeof props>

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()
const hex = (r: number, g: number, b: number) => `#${hex2(r)}${hex2(g)}${hex2(b)}`
/** Rough name of a mix when every channel is clearly on or off. */
const LIGHT: Record<string, string> = { '000': 'černá', '100': 'červená', '010': 'zelená', '001': 'modrá', '110': 'žlutá', '011': 'azurová', '101': 'purpurová', '111': 'bílá' }
const INK: Record<string, string> = { '000': 'bílá (papír)', '100': 'azurová', '010': 'purpurová', '001': 'žlutá', '110': 'modrá', '011': 'červená', '101': 'zelená', '111': 'skoro černá' }
const pure = (xs: number[], max: number) => (xs.every((x) => x <= max * 0.2 || x >= max * 0.8) ? xs.map((x) => (x >= max * 0.8 ? 1 : 0)).join('') : null)

function Chan({ name, value, set, max, color, unit = '' }: { name: string; value: number; set: (n: number) => void; max: number; color: string; unit?: string }) {
  return (
    <label class="color-sl">
      <span><i style={{ background: color }} />{name}</span>
      <input type="range" min={0} max={max} step={1} value={value} style={{ accentColor: color }} aria-valuetext={`${name} ${value}${unit}`} onInput={(e) => set(Number(e.currentTarget.value))} />
      <output>{value}{unit}</output>
    </label>
  )
}

function Swatch({ r, g, b, label }: { r: number; g: number; b: number; label: string }) {
  const h = hex(r, g, b)
  const dark = 0.299 * r + 0.587 * g + 0.114 * b < 140
  return (
    <div class="color-swatch" style={{ background: h, color: dark ? '#ffffff' : '#141518' }} aria-live="polite" aria-label={`${label}: ${h}`}>
      <b>{h}</b>
      <span>{label}</span>
    </div>
  )
}

function Additive({ init }: { init: [number, number, number] }) {
  const [c, setC] = useState(init)
  const [r, g, b] = c
  const set = (i: number) => (v: number) => setC(c.map((x, k) => (k === i ? v : x)) as typeof c)
  const name = pure(c, 255)
  return (
    <>
      <svg viewBox="0 0 300 220" width="300" role="img" aria-label={`Tři světla: červené ${r}, zelené ${g}, modré ${b}. Uprostřed je ${hex(r, g, b)}.`}>
        <rect width="300" height="220" rx="14" fill="#000000" />
        <g style={{ isolation: 'isolate' }}>
          <circle cx="150" cy="80" r="62" fill={`rgb(${r},0,0)`} style={{ mixBlendMode: 'screen' }} />
          <circle cx="114" cy="142" r="62" fill={`rgb(0,${g},0)`} style={{ mixBlendMode: 'screen' }} />
          <circle cx="186" cy="142" r="62" fill={`rgb(0,0,${b})`} style={{ mixBlendMode: 'screen' }} />
        </g>
        <text x="150" y="40" class="color-venn-t" fill="#ffffff">R</text>
        <text x="72" y="178" class="color-venn-t" fill="#ffffff">G</text>
        <text x="228" y="178" class="color-venn-t" fill="#ffffff">B</text>
      </svg>
      <Swatch r={r} g={g} b={b} label={`rgb(${r}, ${g}, ${b})${name ? ` ≈ ${LIGHT[name]}` : ''}`} />
      <div class="color-ctrls">
        <Chan name="R červená" value={r} set={set(0)} max={255} color="#e0232e" />
        <Chan name="G zelená" value={g} set={set(1)} max={255} color="#1fa64a" />
        <Chan name="B modrá" value={b} set={set(2)} max={255} color="#2f6bff" />
      </div>
      <div class="color-note">Světla se sčítají: čím víc světla, tím světlejší. Všechna tři naplno dají bílou. Hex kód je R, G, B v šestnáctkové soustavě (00–FF).</div>
    </>
  )
}

function Subtractive({ init }: { init: [number, number, number, number] }) {
  const [v, setV] = useState(init)
  const [C, M, Y, K] = v
  const set = (i: number) => (x: number) => setV(v.map((y, k) => (k === i ? x : y)) as typeof v)
  const ch = (x: number) => Math.round(255 * (1 - x / 100) * (1 - K / 100))
  const [r, g, b] = [ch(C), ch(M), ch(Y)]
  const name = K >= 80 ? null : pure([C, M, Y], 100)
  const ink = (x: number) => Math.round(255 * (1 - x / 100))
  return (
    <>
      <svg viewBox="0 0 300 220" width="300" role="img" aria-label={`Tři barvy na papíře: azurová ${C} %, purpurová ${M} %, žlutá ${Y} %. Uprostřed je ${hex(ink(C), ink(M), ink(Y))}.`}>
        <rect width="300" height="220" rx="14" fill="#ffffff" />
        <g style={{ isolation: 'isolate' }}>
          <circle cx="150" cy="80" r="62" fill={`rgb(${ink(C)},255,255)`} style={{ mixBlendMode: 'multiply' }} />
          <circle cx="114" cy="142" r="62" fill={`rgb(255,${ink(M)},255)`} style={{ mixBlendMode: 'multiply' }} />
          <circle cx="186" cy="142" r="62" fill={`rgb(255,255,${ink(Y)})`} style={{ mixBlendMode: 'multiply' }} />
        </g>
        <text x="150" y="40" class="color-venn-t" fill="#141518">C</text>
        <text x="72" y="178" class="color-venn-t" fill="#141518">M</text>
        <text x="228" y="178" class="color-venn-t" fill="#141518">Y</text>
      </svg>
      <Swatch r={r} g={g} b={b} label={`C ${C} · M ${M} · Y ${Y} · K ${K} %${name ? ` ≈ ${INK[name]}` : ''}`} />
      <div class="color-ctrls">
        <Chan name="C azurová" value={C} set={set(0)} max={100} color="#00a6d6" unit=" %" />
        <Chan name="M purpurová" value={M} set={set(1)} max={100} color="#d6007e" unit=" %" />
        <Chan name="Y žlutá" value={Y} set={set(2)} max={100} color="#e6c700" unit=" %" />
        <Chan name="K černá" value={K} set={set(3)} max={100} color="#3a3a3a" unit=" %" />
      </div>
      <div class="color-note">Barvy světlo pohlcují (odečítají): čím víc barvy, tím tmavší. Azurová, purpurová a žlutá dají jen tmavě hnědou, proto tiskárny mají i černou K. Na papíře barvy vycházejí jen přibližně.</div>
    </>
  )
}

const CX = 160, RO = 118, RI = 60
const pt = (k: number, r: number) => { const a = ((k * 30 - 90) * Math.PI) / 180; return [CX + r * Math.cos(a), CX + r * Math.sin(a)] }
const wedge = (k: number) => {
  const a0 = ((k * 30 - 105) * Math.PI) / 180, a1 = ((k * 30 - 75) * Math.PI) / 180
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)},${(CX + r * Math.sin(a)).toFixed(2)}`
  return `M${p(RI, a0)} L${p(RO, a0)} A${RO},${RO} 0 0 1 ${p(RO, a1)} L${p(RI, a1)} A${RI},${RI} 0 0 0 ${p(RI, a0)} Z`
}
const arc = (from: number, to: number, r: number) => {
  const a0 = ((from * 30 - 105) * Math.PI) / 180, a1 = ((to * 30 - 75) * Math.PI) / 180
  return `M${CX + r * Math.cos(a0)},${CX + r * Math.sin(a0)} A${r},${r} 0 0 1 ${CX + r * Math.cos(a1)},${CX + r * Math.sin(a1)}`
}

function related(k: number, rel: Rel): number[] {
  const m = (x: number) => (x + 12) % 12
  return rel === 'doplňková' ? [m(k + 6)] : rel === 'analogické' ? [m(k - 1), m(k + 1)] : rel === 'triáda' ? [m(k + 4), m(k + 8)] : []
}

function Wheel({ pick, show }: { pick: number; show: Rel }) {
  const [k, setK] = useState(pick)
  const [rel, setRel] = useState<Rel>(show)
  const rs = related(k, rel)
  const lit = new Set([k, ...rs])
  const c = WHEEL[k]
  const line = rel === 'doplňková' || rel === 'triáda' ? [k, ...rs].map((x) => pt(x, RI - 4).join(',')).join(' ') : ''
  const text = rel === 'teplé a studené'
    ? `${c.name[0].toUpperCase()}${c.name.slice(1)} je ${warm(k) ? 'teplá' : 'studená'} barva.`
    : rel === 'doplňková' ? `Doplňková k barvě ${c.name}: ${WHEEL[rs[0]].name}`
    : rel === 'analogické' ? `Analogické (sousední): ${rs.map((x) => WHEEL[x].name).join(' a ')}`
    : `Triáda: ${c.name}, ${rs.map((x) => WHEEL[x].name).join(', ')}`
  return (
    <>
      <svg viewBox="16 16 288 288" width="280" class="color-wheel">
        {rel === 'teplé a studené' && <>
          <path d={arc(0, 5, RO + 10)} class="color-arc" stroke="#f28c1e" />
          <path d={arc(6, 11, RO + 10)} class="color-arc" stroke="#1f5fad" />
          <text x="300" y="30" text-anchor="end" class="color-ws" fill="var(--ink)">teplé →</text>
          <text x="20" y="298" class="color-ws" fill="var(--ink)">← studené</text>
        </>}
        {WHEEL.map((w, i) => {
          const dim = rel !== 'teplé a studené' ? !lit.has(i) : warm(i) !== warm(k)
          const [tx, ty] = pt(i, (RO + RI) / 2)
          const darkText = i <= 2 || i === 11
          return (
            <g key={i} class={`color-sec ${dim ? 'dim' : ''} ${i === k ? 'on' : ''}`} role="button" tabIndex={0} aria-pressed={i === k}
              aria-label={`${w.name}, ${KIND[w.kind]}, ${warm(i) ? 'teplá' : 'studená'}`}
              onClick={() => setK(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setK(i) } }}>
              <path d={wedge(i)} fill={w.hex} />
              <text x={tx} y={ty + 5} text-anchor="middle" class="color-num" fill={darkText ? '#141518' : '#ffffff'}>{w.kind}</text>
            </g>
          )
        })}
        <circle cx={CX} cy={CX} r={RI - 14} fill={c.hex} class="color-mid" />
        {line && <polygon points={line} class="color-rel" />}
      </svg>
      <div class="val" aria-live="polite">{c.name} <small>({KIND[c.kind]})</small></div>
      <div class="sub">{text}</div>
      {rs.length > 0 && (
        <div class="color-rels">
          {rs.map((x) => <button key={x} class="chip" onClick={() => setK(x)} aria-label={`Vybrat ${WHEEL[x].name}`}><i style={{ background: WHEEL[x].hex }} />{WHEEL[x].name}</button>)}
        </div>
      )}
      <div class="chips color-chips" role="group" aria-label="Co ukázat">
        {RELS.map((r) => <button key={r} class={`chip ${r === rel ? 'sel' : ''}`} aria-pressed={r === rel} onClick={() => setRel(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
      </div>
      <div class="color-note">1 = primární (žlutá, červená, modrá), 2 = sekundární (smíchání dvou primárních), 3 = terciární (primární + sousední sekundární).{rel === 'teplé a studené' ? ' Hranice mezi teplými a studenými je dohoda, žlutozelená a červenofialová jsou na přechodu.' : ''}</div>
    </>
  )
}

const MODES = [['rgb', 'RGB'], ['cmyk', 'CMYK'], ['wheel', 'Barevný kruh']] as const

function Color(p: P) {
  const [mode, setMode] = useState(p.mode)
  return (
    <div class="w color">
      <div class="chips color-chips" role="group" aria-label="Režim">
        {MODES.map(([m, t]) => <button key={m} class={`chip ${m === mode ? 'sel' : ''}`} aria-pressed={m === mode} onClick={() => setMode(m)}>{t}</button>)}
      </div>
      {mode === 'rgb' && <Additive init={(p.rgb ?? [255, 255, 0]) as [number, number, number]} />}
      {mode === 'cmyk' && <Subtractive init={(p.cmyk ?? [100, 0, 100, 0]) as [number, number, number, number]} />}
      {mode === 'wheel' && <Wheel pick={Math.max(0, NAMES.indexOf(p.pick ?? 'žlutá'))} show={p.show ?? 'doplňková'} />}
    </div>
  )
}

export default defineWidget({
  name: 'color',
  title: 'Míchání barev',
  summary: 'Tři režimy. Světlo RGB: tři posuvníky 0–255, světelné kruhy se v průnicích sčítají, výsledná barva a hex kód. Tisk CMYK: barvy se odečítají. Barevný kruh: 12 barev, klepnutí ukáže doplňkovou, analogické, triádu a teplé a studené barvy.',
  use: 'Výtvarná výchova (barevný kruh, doplňkové, teplé a studené barvy), informatika a grafika (RGB, hex kód, CMYK, tisk), fyzika (skládání světla), vizáž.',
  props,
  examples: [
    { title: 'Barevný kruh: doplňkové barvy', props: { mode: 'wheel', pick: 'modrá', show: 'doplňková' } },
    { title: 'RGB: z červené a zelené je žlutá', props: { mode: 'rgb', rgb: [255, 255, 0] } },
    { title: 'Tisk: azurová a žlutá', props: { mode: 'cmyk', cmyk: [100, 0, 100, 0] } },
  ],
  Component: Color,
  html: (p) => p.mode === 'wheel'
    ? `<p>Barevný kruh (12 dílů). Primární: žlutá, červená, modrá. Sekundární: oranžová, fialová, zelená. Terciární: ${WHEEL.filter((w) => w.kind === 3).map((w) => w.name).join(', ')}. Doplňkové barvy leží naproti sobě: žlutá a fialová, červená a zelená, modrá a oranžová.</p>`
    : p.mode === 'rgb'
      ? `<p>Aditivní míchání světla (RGB): červené, zelené a modré světlo se sčítají. Červená + zelená = žlutá, zelená + modrá = azurová, červená + modrá = purpurová, všechny tři = bílá. Každá složka má hodnotu 0–255, hex kód ji zapisuje šestnáctkově (např. #FFFF00).</p>`
      : `<p>Subtraktivní míchání barev (CMYK): azurová, purpurová a žlutá barva světlo pohlcují. Azurová + žlutá = zelená, purpurová + žlutá = červená, azurová + purpurová = modrá. Černá K se přidává, protože ze tří barev vznikne jen tmavě hnědá.</p>`,
})
