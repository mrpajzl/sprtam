import { useMemo, useState } from 'preact/hooks'
import { s, type Infer } from '../content/schema'
import { defineWidget } from './kit'

// A code sample, shown – never run. Line numbers, kept indentation, simple syntax colouring.
// Optional: the program's output behind a button, author-written steps (line, variables, printed
// text) to walk through with „Další krok“/„Zpět“, and notes on lines (tap the line number).

const LANGS = ['python', 'javascript', 'sql', 'html', 'css', 'bash', 'gcode', 'st', 'text'] as const
type Lang = (typeof LANGS)[number]
const LANG_NAME: Record<Lang, string> = {
  python: 'Python', javascript: 'JavaScript', sql: 'SQL', html: 'HTML', css: 'CSS', bash: 'Bash', gcode: 'G-kód', st: 'PLC – strukturovaný text', text: 'Text',
}

const props = s.object({
  language: s.enum(LANGS, { description: 'Jazyk kódu (podle něj se obarví klíčová slova): python, javascript, sql, html, css, bash, gcode (G-kód CNC), st (PLC, strukturovaný text IEC 61131-3), text (bez obarvení).' }),
  code: s.string({ description: 'Kód. Řádky odděluj \\n, odsazení mezerami se zachová. Nejvýš 60 řádků.' }),
  title: s.optional(s.string({ description: 'Nadpis nad kódem, např. název souboru „pozdrav.py“.' })),
  output: s.optional(s.string({ description: 'Co program vypíše. Skryje se za tlačítko „Ukaž výstup“.' })),
  steps: s.optional(s.array(s.object({
    line: s.int({ min: 1, max: 60, description: 'Číslo řádku, který se v tomto kroku provede (od 1).' }),
    vars: s.optional(s.array(s.object({
      name: s.string({ description: 'Název proměnné, např. „i“.' }),
      value: s.string({ description: 'Hodnota po provedení řádku, např. „3“ nebo „\'Ahoj\'“.' }),
    }), { min: 1, max: 8, description: 'Proměnné, které se v tomto kroku změnily (ostatní zůstávají z předchozích kroků).' })),
    print: s.optional(s.string({ description: 'Text, který program v tomto kroku vypíše (přidá se do výpisu).' })),
    note: s.optional(s.string({ description: 'Krátký komentář ke kroku, např. „Podmínka platí, jdeme dovnitř.“' })),
  }), { min: 1, max: 40, description: 'Krokování: autor ručně zapíše, co program dělá krok za krokem. Nic se nespouští.' })),
  notes: s.optional(s.array(s.object({
    line: s.int({ min: 1, max: 60, description: 'Číslo řádku (od 1).' }),
    text: s.string({ description: 'Poznámka, která se ukáže po klepnutí na číslo řádku.' }),
  }), { min: 1, max: 20, description: 'Poznámky k řádkům. Řádek s poznámkou má u čísla tečku.' })),
}, { description: 'Ukázka kódu: jen se zobrazí, nikdy se nespouští.' })
type P = Infer<typeof props>

// ——— Syntax colouring: one sticky regex per language, words checked against a keyword list ———

type Cls = '' | 'k' | 's' | 'n' | 'c' | 'f' | 'a'
type Tok = { t: Cls; v: string }
interface Spec { rules: [Cls | 'w', string][]; kw?: string; fn?: string; ci?: boolean }

const WORD: [Cls | 'w', string] = ['w', '[A-Za-z_][A-Za-z0-9_]*']
const NUM: [Cls | 'w', string] = ['n', '0[xX][0-9a-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?']
const DQ = '"(?:\\\\.|[^"\\\\\\n])*"?', SQ = "'(?:\\\\.|[^'\\\\\\n])*'?"

const SPECS: Record<Lang, Spec> = {
  python: {
    rules: [['c', '#.*'], ['s', `[rRbBfFuU]{0,2}(?:"""[\\s\\S]*?(?:"""|$)|'''[\\s\\S]*?(?:'''|$)|${DQ}|${SQ})`], NUM, WORD],
    kw: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield',
    fn: 'print input len range int str float list dict set tuple bool abs min max sum round sorted enumerate zip open type',
  },
  javascript: {
    rules: [['c', '//.*|/\\*[\\s\\S]*?(?:\\*/|$)'], ['s', `${DQ}|${SQ}|\`(?:\\\\.|[^\`\\\\])*\`?`], NUM, ['w', '[A-Za-z_$][A-Za-z0-9_$]*']],
    kw: 'break case catch class const continue default delete do else export extends false finally for function if import in instanceof let new null of return switch this throw true try typeof undefined var void while async await',
    fn: 'console log alert prompt Math Number String parseInt parseFloat document window Array Object JSON',
  },
  sql: {
    rules: [['c', '--.*|/\\*[\\s\\S]*?(?:\\*/|$)'], ['s', `'(?:''|[^'\\n])*'?|"[^"\\n]*"?`], NUM, WORD],
    kw: 'select from where and or not insert into values update set delete create table primary key foreign references join inner left right outer full on group by order asc desc having limit offset as distinct null is in like between int integer varchar char text date decimal boolean alter drop add unique default check constraint index view union all exists case when then else end auto_increment',
    fn: 'count sum avg min max upper lower length round now coalesce',
    ci: true,
  },
  html: {
    rules: [['c', '<!--[\\s\\S]*?(?:-->|$)'], ['k', '</?[A-Za-z][A-Za-z0-9-]*|/?>|<!DOCTYPE[^>]*>'], ['a', '[A-Za-z-]+(?==)'], ['s', '"[^"]*"?|\'[^\']*\'?'], ['n', '&[A-Za-z0-9#]+;']],
  },
  css: {
    rules: [['c', '/\\*[\\s\\S]*?(?:\\*/|$)'], ['s', `${DQ}|${SQ}`], ['k', '@[A-Za-z-]+|!important'], ['a', '-?[A-Za-z][A-Za-z0-9-]*(?=\\s*:[^;{}]*[;}])'], ['n', '#[0-9a-fA-F]{3,8}\\b|-?\\d*\\.?\\d+(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?'], ['w', '[A-Za-z_-][A-Za-z0-9_-]*']],
  },
  bash: {
    rules: [['c', '#.*'], ['s', `${DQ}|'[^'\\n]*'?`], ['a', '\\$\\{[^}\\n]*\\}?|\\$[A-Za-z_][A-Za-z0-9_]*|\\$[@#?$!*0-9]'], NUM, ['w', '[A-Za-z_][A-Za-z0-9_-]*']],
    kw: 'if then else elif fi for in do done while until case esac function return break continue exit local export',
    fn: 'echo read cd ls mkdir rm cp mv cat grep chmod sudo apt pwd touch',
  },
  gcode: {
    rules: [['c', ';.*|\\([^)\\n]*\\)?'], ['k', '[GgMm]\\d+(?:\\.\\d+)?'], ['a', '[XYZIJKFSTPRNHDOxyzijkfstprnhdo](?=[-+]?\\.?\\d)'], ['n', '[-+]?\\d*\\.?\\d+'], ['k', '%']],
  },
  st: {
    rules: [['c', '\\(\\*[\\s\\S]*?(?:\\*\\)|$)|//.*'], ['s', SQ], ['n', '[A-Za-z]+#[0-9A-Za-z_.]+|\\d+(?:\\.\\d+)?'], ['a', '%[IQM][XBWD]?\\d+(?:\\.\\d+)?'], WORD],
    kw: 'if then else elsif end_if for to by do end_for while end_while repeat until end_repeat case of end_case var var_input var_output var_in_out var_global end_var program end_program function end_function function_block end_function_block and or xor not mod true false return exit at constant retain',
    fn: 'bool int dint uint real lreal time word byte dword string ton tof tp ctu ctd r_trig f_trig sr rs',
    ci: true,
  },
  text: { rules: [] },
}

const COMPILED = new Map<Lang, { re: RegExp | null; kw: Set<string>; fn: Set<string>; cls: (Cls | 'w')[]; ci: boolean }>()
function compiled(lang: Lang) {
  let c = COMPILED.get(lang)
  if (!c) {
    const sp = SPECS[lang]
    c = {
      re: sp.rules.length ? new RegExp(sp.rules.map(([, r]) => `(${r})`).join('|'), 'y') : null,
      kw: new Set((sp.kw ?? '').split(' ')), fn: new Set((sp.fn ?? '').split(' ')), cls: sp.rules.map(([k]) => k), ci: !!sp.ci,
    }
    COMPILED.set(lang, c)
  }
  return c
}

/** The code as lines of coloured tokens. */
export function highlight(code: string, lang: Lang): Tok[][] {
  const c = compiled(lang)
  const toks: Tok[] = []
  const push = (t: Cls, v: string) => { const last = toks[toks.length - 1]; if (last && last.t === t) last.v += v; else toks.push({ t, v }) }
  if (!c.re) push('', code)
  else {
    let i = 0
    while (i < code.length) {
      c.re.lastIndex = i
      const m = c.re.exec(code)
      if (!m || !m[0]) { push('', code[i]); i++; continue }
      const g = m.findIndex((x, k) => k > 0 && x !== undefined)
      let t = c.cls[g - 1]
      if (t === 'w') { const w = c.ci ? m[0].toLowerCase() : m[0]; t = c.kw.has(w) ? 'k' : c.fn.has(w) ? 'f' : '' }
      push(t, m[0])
      i += m[0].length
    }
  }
  const lines: Tok[][] = [[]]
  for (const tk of toks) {
    tk.v.split('\n').forEach((part, k) => {
      if (k > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ t: tk.t, v: part })
    })
  }
  return lines
}

const lineCount = (code: string) => code.replace(/\n+$/, '').split('\n').length
const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ——— Component ———

function Lines({ lines, cur, notes, open, setOpen }: { lines: Tok[][]; cur?: number; notes?: Map<number, string>; open?: number | null; setOpen?: (n: number | null) => void }) {
  return (
    <div class="code-scroll" tabIndex={0} role="region" aria-label="Kód">
      <pre class="code-pre"><code class="code-code">
        {lines.map((l, i) => {
          const n = i + 1
          const note = notes?.get(n)
          return (
            <span key={i} class={`code-line ${cur === n ? 'on' : ''} ${open === n ? 'noted' : ''}`}>
              {note && setOpen
                ? <button class="code-no has" aria-label={`Poznámka k řádku ${n}`} aria-expanded={open === n} onClick={() => setOpen(open === n ? null : n)}>{n}</button>
                : <span class="code-no" aria-hidden="true">{cur === n ? '▶' : n}</span>}
              <span class="code-txt">{l.length ? l.map((tk, k) => (tk.t ? <span key={k} class={`code-${tk.t}`}>{tk.v}</span> : tk.v)) : ' '}</span>
            </span>
          )
        })}
      </code></pre>
    </div>
  )
}

function Code({ language, code, title, output, steps, notes }: P) {
  const lines = useMemo(() => highlight(code.replace(/\n+$/, ''), language), [code, language])
  const noteMap = useMemo(() => new Map((notes ?? []).map((x) => [x.line, x.text])), [notes])
  const [open, setOpen] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const [k, setK] = useState(0) // 0 = before the first step
  const step = steps && k > 0 ? steps[k - 1] : null
  // Variables and printed text accumulated up to step k (a few entries; cheap).
  const state = useMemo(() => {
    const vars = new Map<string, string>()
    const printed: string[] = []
    for (const st of (steps ?? []).slice(0, k)) {
      for (const v of st.vars ?? []) vars.set(v.name, v.value)
      if (st.print !== undefined) printed.push(st.print)
    }
    return { vars: [...vars], printed }
  }, [steps, k])
  const changed = new Set((step?.vars ?? []).map((v) => v.name))
  const n = steps?.length ?? 0
  return (
    <div class="w code-w">
      <div class="code-head">
        <span class="code-lang">{LANG_NAME[language]}</span>
        {title && <span class="code-title">{title}</span>}
      </div>
      <Lines lines={lines} cur={step?.line} notes={noteMap} open={open} setOpen={setOpen} />
      {open !== null && noteMap.has(open) && (
        <div class="code-note" role="status">
          <b>Řádek {open}</b>
          <span>{noteMap.get(open)}</span>
          <button class="code-x" aria-label="Zavřít poznámku" onClick={() => setOpen(null)}>×</button>
        </div>
      )}
      {noteMap.size > 0 && open === null && <div class="sub">Klepni na číslo řádku s tečkou.</div>}
      {steps && (
        <div class="code-steps">
          <div class="code-now" aria-live="polite">
            {k === 0 ? 'Klepni na „Další krok“ a sleduj, co program dělá.' : <><b>Krok {k} z {n}</b> · řádek {step!.line}{step!.note ? <span class="code-why">{step!.note}</span> : null}</>}
          </div>
          {state.vars.length > 0 && (
            <table class="code-vars">
              <thead><tr><th>Proměnná</th><th>Hodnota</th></tr></thead>
              <tbody>
                {state.vars.map(([name, value]) => <tr key={name} class={changed.has(name) ? 'chg' : ''}><td>{name}</td><td>{value}</td></tr>)}
              </tbody>
            </table>
          )}
          {state.printed.length > 0 && (
            <div class="code-console" aria-label="Výpis programu"><small>Výpis</small><pre>{state.printed.join('\n')}</pre></div>
          )}
          <div class="ctrls">
            <button class="reveal" disabled={k === 0} aria-label="Krok zpět" onClick={() => setK(k - 1)}>◀ Zpět</button>
            {k < n
              ? <button class="reveal" aria-label="Další krok" onClick={() => setK(k + 1)}>Další krok ▶</button>
              : <button class="reveal" aria-label="Znovu od začátku" onClick={() => setK(0)}>Znovu</button>}
          </div>
        </div>
      )}
      {output !== undefined && (
        shown
          ? <div class="code-console out"><small>Výstup</small><pre aria-live="polite">{output}</pre></div>
          : <div class="ctrls"><button class="reveal" onClick={() => setShown(true)}>Ukaž výstup</button></div>
      )}
    </div>
  )
}

/** Quiz task: just the code (no output, steps or notes), e.g. „Co program vypíše?“. */
function CodeQuestion({ language, code, title }: P) {
  const lines = useMemo(() => highlight(code.replace(/\n+$/, ''), language), [code, language])
  return (
    <div class="w code-w">
      <div class="code-head"><span class="code-lang">{LANG_NAME[language]}</span>{title && <span class="code-title">{title}</span>}</div>
      <Lines lines={lines} />
    </div>
  )
}

const norm = (x: string) => x.trim().replace(/\s+/g, ' ').toLowerCase()

export default defineWidget({
  name: 'code',
  title: 'Ukázka kódu',
  summary: 'Blok kódu s čísly řádků a obarvenými klíčovými slovy, řetězci, čísly a komentáři. Nic se nespouští. Volitelně výstup za tlačítkem, krokování programu s tabulkou proměnných a poznámky k řádkům.',
  use: 'Programování (Python, JavaScript), databáze (SQL), weby (HTML, CSS), příkazová řádka (bash), CNC (G-kód), PLC (strukturovaný text). Místo odrážek s kódem; krokování pro cykly a podmínky.',
  props,
  examples: [
    {
      title: 'Cyklus v Pythonu krok za krokem',
      props: {
        language: 'python',
        title: 'soucet.py',
        code: 'soucet = 0\nfor i in range(1, 4):\n    soucet = soucet + i\nprint("Součet je", soucet)',
        output: 'Součet je 6',
        steps: [
          { line: 1, vars: [{ name: 'soucet', value: '0' }], note: 'Na začátku je součet 0.' },
          { line: 2, vars: [{ name: 'i', value: '1' }], note: 'Cyklus začíná, i = 1.' },
          { line: 3, vars: [{ name: 'soucet', value: '1' }], note: '0 + 1 = 1' },
          { line: 2, vars: [{ name: 'i', value: '2' }] },
          { line: 3, vars: [{ name: 'soucet', value: '3' }], note: '1 + 2 = 3' },
          { line: 2, vars: [{ name: 'i', value: '3' }] },
          { line: 3, vars: [{ name: 'soucet', value: '6' }], note: '3 + 3 = 6' },
          { line: 4, print: 'Součet je 6', note: 'range(1, 4) skončil před 4, cyklus končí.' },
        ],
      },
    },
    {
      title: 'SQL dotaz s poznámkami',
      props: {
        language: 'sql',
        code: '-- žáci z 9.A seřazení podle příjmení\nSELECT jmeno, prijmeni\nFROM zaci\nWHERE trida = \'9.A\'\nORDER BY prijmeni ASC;',
        notes: [
          { line: 2, text: 'SELECT vybere sloupce, které chceme vidět.' },
          { line: 3, text: 'FROM říká, ze které tabulky čteme.' },
          { line: 4, text: 'WHERE nechá jen řádky, kde platí podmínka.' },
          { line: 5, text: 'ORDER BY řadí výsledek, ASC = vzestupně (A → Z).' },
        ],
      },
    },
    {
      title: 'G-kód: vrtání díry',
      props: {
        language: 'gcode',
        code: '%\nO1001 (VRTANI)\nG21 G90 G17      ; mm, absolutne, rovina XY\nT1 M06           ; vymena nastroje\nS1200 M03        ; otacky 1200, vreteno vpravo\nG00 X20 Y15 Z5   ; rychloposuv nad diru\nG01 Z-10 F80     ; vrtani posuvem 80 mm/min\nG00 Z5\nM05\nM30\n%',
        notes: [
          { line: 6, text: 'G00 = rychloposuv, nástroj se přesune mimo materiál.' },
          { line: 7, text: 'G01 = pracovní posuv po přímce, tady do hloubky 10 mm.' },
          { line: 10, text: 'M30 = konec programu a návrat na začátek.' },
        ],
      },
    },
  ],
  check: (p) => {
    const e: string[] = []
    const n = lineCount(p.code)
    if (n > 60) e.push(`code has ${n} lines, at most 60`)
    const lines = p.code.split('\n')
    p.steps?.forEach((st, i) => {
      if (st.line > n) e.push(`steps[${i}]: line ${st.line} does not exist (the code has ${n} lines)`)
      else if (!lines[st.line - 1].trim()) e.push(`steps[${i}]: line ${st.line} is empty`)
      if (!st.vars && st.print === undefined && !st.note) e.push(`steps[${i}]: give vars, print or note – otherwise the step shows nothing new`)
      const names = (st.vars ?? []).map((v) => v.name)
      if (new Set(names).size !== names.length) e.push(`steps[${i}]: duplicate variable`)
    })
    const seen = new Set<number>()
    p.notes?.forEach((x, i) => {
      if (x.line > n) e.push(`notes[${i}]: line ${x.line} does not exist (the code has ${n} lines)`)
      if (seen.has(x.line)) e.push(`notes[${i}]: second note on line ${x.line}`)
      seen.add(x.line)
    })
    if (p.output !== undefined && p.steps) {
      const printed = p.steps.filter((st) => st.print !== undefined).map((st) => st.print).join('\n')
      if (printed && norm(printed) !== norm(p.output)) e.push('the printed text of the steps differs from output')
    }
    return e
  },
  Component: Code,
  Question: CodeQuestion,
  checkQuestion: (p, answers) => {
    if (p.output === undefined || p.output.trim().includes('\n')) return []
    return answers.some((a) => norm(a) === norm(p.output!)) ? [] : [`the output „${p.output.trim()}“ is not among the answers`]
  },
  html: (p) => {
    const head = `<p><b>${esc(LANG_NAME[p.language])}</b>${p.title ? ` – ${esc(p.title)}` : ''}</p>`
    const notes = p.notes?.length ? `<ul>${[...p.notes].sort((a, b) => a.line - b.line).map((x) => `<li>Řádek ${x.line}: ${esc(x.text)}</li>`).join('')}</ul>` : ''
    const out = p.output !== undefined ? `<p>Výstup:</p><pre><samp>${esc(p.output)}</samp></pre>` : ''
    return `${head}<pre><code>${esc(p.code.replace(/\n+$/, ''))}</code></pre>${notes}${out}`
  },
})
