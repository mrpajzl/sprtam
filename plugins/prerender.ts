import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import type { Plugin } from 'vite'
import type * as Curriculum from '../src/content/curriculum'
import type * as Seo from '../src/seo'
import type { Block, Subject, SubjectId } from '../src/content/types'
import type { VocabSet } from '../src/vocab/types'

// Writes a real HTML page for every public route, so links are shareable with proper
// previews and search engines get content, titles and descriptions without running JS:
//   /  /g/<grade>  /g/<grade>/<subject>  /g/<grade>/<subject>/<topic>  /slovicka  /slovicka/<level>
// plus app.html (empty shell for the remaining in-app routes), sitemap.xml and robots.txt.
// The markup uses the app's own classes, so it looks like the screen the app then renders over it.

const SITE = (process.env.SITE_URL ?? 'https://sprtam.cz').replace(/\/$/, '')
const root = join(import.meta.dirname, '..')
const src = (f: string) => pathToFileURL(join(root, 'src', f)).href

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Inline markup (**bold**, *italic*, `code`, ^sup) → HTML, as src/ui/Inline.tsx renders it. */
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*|\^([+−-]?(?:[IVX]+|[0-9]+)[+−-]?|[+−-])/g, (_, b, c, i, sup) =>
  b ? `<strong>${b}</strong>` : c ? `<code>${c}</code>` : i ? `<em>${i}</em>` : `<sup>${sup}</sup>`)
const style = (c: string) => `--c:var(--k-${c});--on-c:var(--k-${c}-on)`
const STAGE_LABEL = { zs1: 'ZŠ · 1. stupeň', zs2: 'ZŠ · 2. stupeň', ss: 'SŠ · ročník' } // as on the Home screen
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'

function block(b: Block): string {
  switch (b.t) {
    case 'h': return `<h3 class="bh">${inline(b.text)}</h3>`
    case 'p': return `<p>${inline(b.text)}</p>`
    case 'term': return `<div class="term"><b>${inline(b.term)}</b><span>${inline(b.def)}</span>${b.ex ? `<small>${inline(b.ex)}</small>` : ''}</div>`
    case 'mistake': return `<div class="card mistake"><div class="wrong"><span>✗</span><span>${inline(b.wrong)}</span></div><div class="right"><span>✓</span><span>${inline(b.right)}</span></div><p>${inline(b.why)}</p></div>`
    case 'key': return `<div class="key">${inline(b.text)}</div>`
    case 'list': return `<ul>${b.items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`
    case 'steps': return `<div class="card steps">${b.items.map((x) => `<div class="s"><span>${inline(x)}</span></div>`).join('')}</div>`
    case 'example': return `<div class="card example"><div class="q">${inline(b.q)}</div><div class="a">${inline(b.a)}</div></div>`
    case 'pic': return `<div class="pic" role="img"${b.caption ? ` aria-label="${esc(b.caption)}"` : ''}>${esc(b.items.join(' '))}${b.caption ? `<small>${esc(b.caption)}</small>` : ''}</div>`
    case 'table': return `<div class="card table-wrap"><table><thead><tr>${b.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    case 'w':
      // Interactive widgets: only those that carry text worth reading.
      if (b.w === 'timeline') return `<ul>${b.p.events.map((e) => `<li><b>${e.year}</b> ${inline(e.label)}</li>`).join('')}</ul>`
      if (b.w === 'flip') return `<ul>${b.p.cards.map((c) => `<li><b>${inline(c.front)}</b> – ${inline(c.back)}</li>`).join('')}</ul>`
      if (b.w === 'cycle') return `<ol>${b.p.steps.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`
      return ''
  }
}

interface Page {
  path: string
  title: string
  description: string
  body: string
  crumbs: [string, string][] // [name, path], ending with this page
  type?: 'website' | 'article'
  ld?: object
}

const bar = (title: string, up?: string) =>
  `<header class="bar">${up ? `<a class="icon-btn" href="${up}" aria-label="Zpět">${BACK}</a>` : '<span class="spacer"></span>'}<h1>${esc(title)}</h1><span class="spacer"></span></header>`

async function pages(): Promise<Page[]> {
  const { STAGES, GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } = await tsImport(src('content/curriculum.ts'), import.meta.url) as typeof Curriculum
  const { titles, summary, plain, gradeLabel, gradeFor, SITE_NAME } = await tsImport(src('seo.ts'), import.meta.url) as typeof Seo

  const dataDir = join(root, 'src', 'content', 'data')
  const subjects = new Map<string, Subject>()
  for (const g of readdirSync(dataDir)) for (const f of readdirSync(join(dataDir, g))) {
    const s = (await tsImport(pathToFileURL(join(dataDir, g, f)).href, import.meta.url) as { default: Subject }).default
    subjects.set(`${s.grade}/${s.subject}`, s)
  }
  const vocabDir = join(root, 'src', 'vocab', 'data')
  const vocab = await Promise.all(readdirSync(vocabDir).sort().map(async (f) => (await tsImport(pathToFileURL(join(vocabDir, f)).href, import.meta.url) as { default: VocabSet }).default))

  const home: [string, string] = [SITE_NAME, '/']
  const out: Page[] = []

  out.push({
    path: '/',
    title: titles.home(),
    description: 'Opakování učiva základní a střední školy: vysvětlení od úplných základů, kvízy, písemky a anglická slovíčka. Zdarma, bez účtů a bez reklam.',
    crumbs: [home],
    body: `<div class="page home"><header class="bar"><h1 class="brand">šprtám</h1></header>
<section class="sec"><h2 class="label">Třída</h2><div class="pad">${STAGES.map((st) => `<div class="pad-group"><small>${STAGE_LABEL[st.id]}</small><div class="pad-keys">${st.grades.map((g) => `<a class="num-key" href="/g/${g}" aria-label="${esc(gradeLabel(g))}">${GRADE_NAME[g].split('.')[0]}</a>`).join('')}</div></div>`).join('')}</div></section>
<a class="row vocab-key" style="${style('purple')}" href="/slovicka"><span class="skey m"><b>Aa</b></span><span class="txt"><b>Anglická slovíčka</b><small>A1–C1</small></span></a></div>`,
  })

  for (const g of STAGES.flatMap((st) => st.grades)) {
    const gPath = `/g/${g}`
    const gCrumbs: [string, string][] = [home, [gradeLabel(g), gPath]]
    const present = GRADE_SUBJECTS[g].filter((s) => subjects.has(`${g}/${s}`))
    out.push({
      path: gPath,
      title: titles.grade(g),
      description: `Učivo pro ${gradeFor(g)}: ${present.map((s) => SUBJECTS[s].name).join(', ')}. Vysvětlení, kvízy a písemky na procvičení.`,
      crumbs: gCrumbs,
      body: `<div class="page">${bar(GRADE_NAME[g], '/')}<div class="tiles">${present.map((s) => `<a class="tile" style="${style(SUBJECTS[s].c)}" href="${gPath}/${s}"><span class="tile-face"></span><b>${esc(SUBJECTS[s].name)}</b></a>`).join('')}${GRADE_SUBJECTS[g].includes('anglictina') ? `<a class="tile" style="${style('purple')}" href="/slovicka"><span class="tile-face"><b class="aa">Aa</b></span><b>Slovíčka</b></a>` : ''}</div></div>`,
    })

    for (const s of present as SubjectId[]) {
      const subj = subjects.get(`${g}/${s}`)!
      const sPath = `${gPath}/${s}`
      const sCrumbs: [string, string][] = [...gCrumbs, [SUBJECTS[s].name, sPath]]
      const names = subj.topics.map((t) => t.title)
      out.push({
        path: sPath,
        title: titles.subject(g, s),
        description: `${SUBJECTS[s].name} pro ${gradeFor(g)}: ${names.slice(0, 6).join(', ')}${names.length > 6 ? ' a další' : ''}. ${subj.topics.length} ${subj.topics.length <= 4 ? 'témata' : 'témat'} s vysvětlením a kvízy.`,
        crumbs: sCrumbs,
        body: `<div class="page" style="${style(SUBJECTS[s].c)}">${bar(SUBJECTS[s].name, gPath)}<div class="list">${subj.topics.map((t, i) => `<a class="row" href="${sPath}/${t.id}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="em">${t.emoji}</span><b>${esc(t.title)}</b></a>`).join('')}</div></div>`,
        ld: { '@type': 'ItemList', itemListElement: subj.topics.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${sPath}/${t.id}`, name: t.title })) },
      })

      subj.topics.forEach((t, i) => {
        const key = t.ex[0].blocks.find((b): b is Extract<Block, { t: 'key' }> => b.t === 'key')
        const tPath = `${sPath}/${t.id}`
        const prev = subj.topics[i - 1], next = subj.topics[i + 1]
        const nav = [prev && `<a class="row" href="${sPath}/${prev.id}"><span class="em">${prev.emoji}</span><b>${esc(prev.title)}</b></a>`, next && `<a class="row" href="${sPath}/${next.id}"><span class="em">${next.emoji}</span><b>${esc(next.title)}</b></a>`].filter(Boolean).join('')
        out.push({
          path: tPath,
          title: titles.topic(g, s, t.title),
          description: summary(t.ex[0].blocks) || `${t.title} – ${SUBJECTS[s].name}, ${gradeLabel(g)}.`,
          crumbs: [...sCrumbs, [t.title, tPath]],
          type: 'article',
          body: `<div class="page" style="${style(SUBJECTS[s].c)}">${bar(`${t.emoji} ${t.title}`, sPath)}${t.ex.map((x) => `<section><h2 class="label">${esc(x.title)}</h2><div class="blocks">${x.blocks.map(block).join('')}</div></section>`).join('')}${nav ? `<div class="list">${nav}</div>` : ''}</div>`,
          ld: {
            '@type': 'LearningResource', name: t.title, inLanguage: 'cs', learningResourceType: 'Explanation', isAccessibleForFree: true,
            educationalLevel: GRADE_NAME[g], about: SUBJECTS[s].name, url: `${SITE}${tPath}`,
            teaches: key ? plain(key.text) : t.title,
          },
        })
      })
    }
  }

  const vCrumbs: [string, string][] = [home, ['Anglická slovíčka', '/slovicka']]
  out.push({
    path: '/slovicka',
    title: titles.vocab(),
    description: `Anglická slovíčka podle úrovně A1–C1 (${vocab.reduce((n, v) => n + v.groups.reduce((m, gr) => m + gr.words.length, 0), 0)} slov). Nová slova vybíráš ze tří, známá píšeš; slova se vracejí, dokud je neumíš.`,
    crumbs: vCrumbs,
    body: `<div class="page" style="${style('purple')}">${bar('Slovíčka', '/')}<div class="levels">${vocab.map((v) => `<a class="row" href="/slovicka/${v.level}"><span class="skey m"><b>${v.level}</b></span><b>${v.groups.length} okruhů</b></a>`).join('')}</div></div>`,
  })
  for (const v of vocab) {
    const path = `/slovicka/${v.level}`
    out.push({
      path,
      title: titles.vocabLevel(v.level),
      description: `Anglická slovíčka ${v.level}: ${v.groups.map((gr) => gr.name.toLowerCase()).slice(0, 8).join(', ')}${v.groups.length > 8 ? ' a další' : ''}. Například ${v.groups[0].words.slice(0, 4).map((w) => `${w[0]} – ${w[1]}`).join(', ')}.`,
      crumbs: [...vCrumbs, [v.level, path]],
      body: `<div class="page" style="${style('purple')}">${bar(v.level, '/slovicka')}<a class="btn block mix" href="${path}/vse">Míchat vše<small class="btn-count">${v.groups.reduce((n, gr) => n + gr.words.length, 0)}</small></a><div class="tiles">${v.groups.map((gr, i) => `<a class="tile vocab-tile" href="${path}/${i}"><span class="tile-face em">${gr.emoji}</span><b>${esc(gr.name)}</b><small class="sample">${esc(gr.words.slice(0, 6).map((w) => `${w[0]} – ${w[1]}`).join(', '))}…</small></a>`).join('')}</div></div>`,
    })
  }
  return out
}

function head(p: Page): string {
  const url = `${SITE}${p.path}`
  const graph = [
    p.crumbs.length > 1 && { '@type': 'BreadcrumbList', itemListElement: p.crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })) },
    p.path === '/' && { '@type': 'WebSite', name: 'Šprtám', url: `${SITE}/`, inLanguage: 'cs' },
    p.ld,
  ].filter(Boolean)
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${p.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="Šprtám" />`,
    `<meta property="og:locale" content="cs_CZ" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:image" content="${SITE}/pwa-512x512.png" />`,
    `<meta name="twitter:card" content="summary" />`,
    // A data block, not a script: the CSP (script-src 'self') does not apply to it.
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

function render(template: string, p: Page, fullTitle: (t: string) => string): string {
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle(p.title))}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(p.description)}" />`)
    .replace('</head>', `  ${head(p)}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${p.body}</div>`)
}

export function prerender(): Plugin {
  let outDir = ''
  return {
    name: 'prerender',
    apply: 'build',
    configResolved: (c) => { outDir = join(c.root, c.build.outDir) },
    async writeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      if (!template.includes('<div id="app"></div>')) throw new Error('prerender: #app placeholder not found in index.html')
      const { fullTitle } = await tsImport(src('seo.ts'), import.meta.url) as typeof Seo
      // Shell for in-app routes (quiz, search, …): no canonical, kept out of search results.
      writeFileSync(join(outDir, 'app.html'), template.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>'))
      const all = await pages()
      for (const p of all) {
        const file = join(outDir, p.path, 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, render(template, p, fullTitle))
      }
      writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map((p) => `  <url><loc>${SITE}${p.path}</loc></url>`).join('\n')}\n</urlset>\n`)
      writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`)
      this.info?.(`prerendered ${all.length} pages`)
    },
  }
}
