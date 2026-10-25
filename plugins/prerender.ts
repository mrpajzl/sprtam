import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import type { Plugin } from 'vite'
import type * as Curriculum from '../src/content/curriculum'
import type * as Seo from '../src/seo'
import type * as Widgets from '../src/widgets'
import type { Block, Subject, SubjectId, YearBlock } from '../src/content/types'
import { readApproaches, readSubjects, readVocab } from './content'

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
const icon = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
// Same paths as src/ui/icons.tsx.
const BACK = icon('M15 5l-7 7 7 7')
const HOME = icon('M4 11l8-7 8 7M6.5 9v11h11V9M10 20v-5h4v5')
const GRID = icon('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z')
const SEARCH = icon('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20')

function block(b: Block, widgets: typeof Widgets.WIDGETS): string {
  switch (b.type) {
    case 'heading': return `<h3 class="bh">${inline(b.text)}</h3>`
    case 'text': return `<p>${inline(b.text)}</p>`
    case 'term': return `<div class="term"><b>${inline(b.term)}</b><span>${inline(b.definition)}</span>${b.example ? `<small>${inline(b.example)}</small>` : ''}</div>`
    case 'mistake': return `<div class="card mistake"><div class="wrong"><span>✗</span><span>${inline(b.wrong)}</span></div><div class="right"><span>✓</span><span>${inline(b.right)}</span></div><p>${inline(b.why)}</p></div>`
    case 'summary': return `<div class="key">${inline(b.text)}</div>`
    case 'list': return `<ul>${b.items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`
    case 'steps': return `<div class="card steps">${b.items.map((x) => `<div class="s"><span>${inline(x)}</span></div>`).join('')}</div>`
    case 'example': return `<div class="card example"><div class="q">${inline(b.question)}</div><div class="a">${inline(b.answer)}</div></div>`
    case 'picture': return `<div class="pic" role="img"${b.caption ? ` aria-label="${esc(b.caption)}"` : ''}>${esc(b.items.join(' '))}${b.caption ? `<small>${esc(b.caption)}</small>` : ''}</div>`
    case 'table': return `<div class="card table-wrap"><table><thead><tr>${b.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    // Interactive widgets: only those that carry text worth reading (WidgetDef.html).
    case 'widget': return widgets[b.widget]?.html?.(b.props, inline) ?? ''
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

/** The app's Bar: back (up), the path to this screen as links, the title. */
const bar = (title: string, up?: string, crumbs: [string, string][] = []) =>
  `<header class="bar">${up ? `<a class="icon-btn" href="${up}" aria-label="Zpět">${BACK}</a>` : '<span class="spacer"></span>'}<div class="bar-title">${crumbs.length ? `<nav class="crumbs" aria-label="Kde jsem">${crumbs.map(([name, path]) => `<a href="${path}">${esc(name)}</a>`).join('')}</nav>` : ''}<h1>${esc(title)}</h1></div><span class="spacer"></span></header>`

/** The app's TabBar (src/ui/TabBar.tsx); the class tab only where the grade is known. */
const tabbar = (active: 'home' | 'grade' | 'vocab' | undefined, grade?: [string, string]) => {
  const tab = (t: string, href: string, glyph: string, label: string) => `<a href="${href}"${t === active ? ' aria-current="page"' : ''}>${glyph}<span>${esc(label)}</span></a>`
  return `<nav class="tabbar" aria-label="Hlavní nabídka">${tab('home', '/', HOME, 'Domů')}${grade ? tab('grade', grade[1], GRID, grade[0]) : ''}${tab('search', '/hledat', SEARCH, 'Hledat')}${tab('vocab', '/slovicka', '<b class="aa" aria-hidden="true">Aa</b>', 'Slovíčka')}</nav>`
}

async function pages(): Promise<Page[]> {
  const { STAGES, GRADE_NAME, GRADE_SUBJECTS, SUBJECTS } = await tsImport(src('content/curriculum.ts'), import.meta.url) as typeof Curriculum
  const { titles, summary, plain, gradeLabel, gradeFor, SITE_NAME } = await tsImport(src('seo.ts'), import.meta.url) as typeof Seo

  const { WIDGETS } = await tsImport(src('widgets/index.tsx'), import.meta.url) as typeof Widgets
  const subjects = new Map<string, Subject>(readSubjects().map((s) => [`${s.grade}/${s.subject}`, s]))
  const vocab = readVocab()

  const home: [string, string] = [SITE_NAME, '/']
  const out: Page[] = []

  out.push({
    path: '/',
    title: titles.home(),
    description: 'Opakování učiva základní a střední školy: vysvětlení od úplných základů, kvízy, písemky a anglická slovíčka. Zdarma, bez účtů a bez reklam.',
    crumbs: [home],
    body: `<div class="page home"><header class="bar"><h1 class="brand">šprtám</h1></header>
<section class="sec"><h2 class="label">Třída</h2><div class="pad">${STAGES.map((st) => `<div class="pad-group"><small>${STAGE_LABEL[st.id]}</small><div class="pad-keys">${st.grades.map((g) => `<a class="num-key" href="/g/${g}" aria-label="${esc(gradeLabel(g))}">${GRADE_NAME[g].split('.')[0]}</a>`).join('')}</div></div>`).join('')}</div></section>
<a class="row vocab-key" style="${style('purple')}" href="/slovicka"><span class="skey m"><b>Aa</b></span><span class="txt"><b>Anglická slovíčka</b><small>A1–C1</small></span></a></div>${tabbar('home')}`,
  })

  for (const g of STAGES.flatMap((st) => st.grades)) {
    const gPath = `/g/${g}`
    const gCrumbs: [string, string][] = [home, [gradeLabel(g), gPath]]
    const present = GRADE_SUBJECTS[g].filter((s) => subjects.has(`${g}/${s}`))
    const gTab = tabbar('grade', [GRADE_NAME[g], gPath])
    out.push({
      path: gPath,
      title: titles.grade(g),
      description: `Učivo pro ${gradeFor(g)}: ${present.map((s) => SUBJECTS[s].name).join(', ')}. Vysvětlení, kvízy a písemky na procvičení.`,
      crumbs: gCrumbs,
      body: `<div class="page">${bar(GRADE_NAME[g], '/')}<div class="tiles">${present.map((s) => `<a class="tile" style="${style(SUBJECTS[s].c)}" href="${gPath}/${s}"><span class="tile-face"></span><b>${esc(SUBJECTS[s].name)}</b></a>`).join('')}${GRADE_SUBJECTS[g].includes('anglictina') ? `<a class="tile" style="${style('purple')}" href="/slovicka"><span class="tile-face"><b class="aa">Aa</b></span><b>Slovíčka</b></a>` : ''}</div></div>${gTab}`,
    })

    for (const s of present as SubjectId[]) {
      const subj = subjects.get(`${g}/${s}`)!
      const sPath = `${gPath}/${s}`
      const sCrumbs: [string, string][] = [...gCrumbs, [SUBJECTS[s].name, sPath]]
      // Approach-only topics (docs/PRISTUPY.md) have pages, but are listed only in their approach's plan.
      const listedTopics = subj.topics.filter((t) => !t.approach)
      const names = listedTopics.map((t) => t.title)
      out.push({
        path: sPath,
        title: titles.subject(g, s),
        description: `${SUBJECTS[s].name} pro ${gradeFor(g)}: ${names.slice(0, 6).join(', ')}${names.length > 6 ? ' a další' : ''}. ${listedTopics.length} ${listedTopics.length <= 4 ? 'témata' : 'témat'} s vysvětlením a kvízy.`,
        crumbs: sCrumbs,
        body: `<div class="page" style="${style(SUBJECTS[s].c)}">${bar(SUBJECTS[s].name, gPath, [[GRADE_NAME[g], gPath]])}<div class="list">${listedTopics.map((t, i) => `<a class="row" href="${sPath}/${t.id}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="em">${t.emoji}</span><b>${esc(t.title)}</b></a>`).join('')}</div></div>${gTab}`,
        ld: { '@type': 'ItemList', itemListElement: listedTopics.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${sPath}/${t.id}`, name: t.title })) },
      })

      subj.topics.forEach((t) => {
        // As in the app: the general explanations only (an approach's own explanation shows to its pupils).
        const explanations = t.explanations.filter((x) => !x.approach)
        const key = explanations[0].blocks.find((b): b is Extract<Block, { type: 'summary' }> => b.type === 'summary')
        const tPath = `${sPath}/${t.id}`
        const i = listedTopics.indexOf(t)
        const prev = i > 0 ? listedTopics[i - 1] : undefined, next = i >= 0 ? listedTopics[i + 1] : undefined
        const nav = [prev && `<a class="row" href="${sPath}/${prev.id}"><span class="em">${prev.emoji}</span><b>${esc(prev.title)}</b></a>`, next && `<a class="row" href="${sPath}/${next.id}"><span class="em">${next.emoji}</span><b>${esc(next.title)}</b></a>`].filter(Boolean).join('')
        out.push({
          path: tPath,
          title: titles.topic(g, s, t.title),
          description: summary(explanations[0].blocks) || `${t.title} – ${SUBJECTS[s].name}, ${gradeLabel(g)}.`,
          crumbs: [...sCrumbs, [t.title, tPath]],
          type: 'article',
          body: `<div class="page" style="${style(SUBJECTS[s].c)}">${bar(`${t.emoji} ${t.title}`, sPath, [[GRADE_NAME[g], gPath], [SUBJECTS[s].name, sPath]])}${explanations.map((x) => `<section><h2 class="label">${esc(x.title)}</h2><div class="blocks">${x.blocks.map((b) => block(b, WIDGETS)).join('')}</div></section>`).join('')}${nav ? `<div class="list">${nav}</div>` : ''}</div>${gTab}`,
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
    body: `<div class="page" style="${style('purple')}">${bar('Slovíčka', '/')}<div class="levels">${vocab.map((v) => `<a class="row" href="/slovicka/${v.level}"><span class="skey m"><b>${v.level}</b></span><b>${v.groups.length} okruhů</b></a>`).join('')}</div></div>${tabbar('vocab')}`,
  })
  for (const v of vocab) {
    const path = `/slovicka/${v.level}`
    out.push({
      path,
      title: titles.vocabLevel(v.level),
      description: `Anglická slovíčka ${v.level}: ${v.groups.map((gr) => gr.name.toLowerCase()).slice(0, 8).join(', ')}${v.groups.length > 8 ? ' a další' : ''}. Například ${v.groups[0].words.slice(0, 4).map((w) => `${w.cz} – ${w.en}`).join(', ')}.`,
      crumbs: [...vCrumbs, [v.level, path]],
      body: `<div class="page" style="${style('purple')}">${bar(v.level, '/slovicka', [['Slovíčka', '/slovicka']])}<a class="btn block mix" href="${path}/vse">Míchat vše<small class="btn-count">${v.groups.reduce((n, gr) => n + gr.words.length, 0)}</small></a><div class="tiles">${v.groups.map((gr, i) => `<a class="tile vocab-tile" href="${path}/${i}"><span class="tile-face em">${gr.emoji}</span><b>${esc(gr.name)}</b><small class="sample">${esc(gr.words.slice(0, 6).map((w) => `${w.cz} – ${w.en}`).join(', '))}…</small></a>`).join('')}</div></div>${tabbar('vocab')}`,
    })
  }
  // Teaching approaches: /waldorf, /waldorf/<grade>, /waldorf/<grade>/<epoch> (markup as src/screens/Approach.tsx).
  const topicRef = new Map<string, { t: Subject['topics'][number]; g: string; s: SubjectId }>()
  for (const subj of subjects.values()) for (const t of subj.topics) topicRef.set(`${subj.grade}/${subj.subject}/${t.id}`, { t, g: subj.grade, s: subj.subject })
  const green = style('green')
  const ARROW = icon('M9 5l7 7-7 7')
  for (const a of readApproaches(STAGES.flatMap((st) => st.grades))) {
    const aPath = `/${a.id}`
    const aCrumbs: [string, string][] = [home, [a.name, aPath]]
    out.push({
      path: aPath,
      title: titles.approach(a.name),
      description: plain(a.about[0]).slice(0, 155),
      crumbs: aCrumbs,
      body: `<div class="page" style="${green}">${bar(`${a.emoji} ${a.name}`, '/')}<div class="blocks approach-about">${a.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div><h2 class="label">Ročníky</h2><div class="list">${a.years.map(([g, y]) => `<a class="row" href="${aPath}/${g}"><span class="num">${esc(y.title.split('.')[0])}</span><span class="txt"><b>${esc(y.title)}</b><small>${esc(y.epochs.map((e) => e.title).slice(0, 3).join(' · '))}…</small></span>${ARROW}</a>`).join('')}</div></div>${tabbar(undefined)}`,
    })
    for (const [g, y] of a.years) {
      const yPath = `${aPath}/${g}`
      const yCrumbs: [string, string][] = [...aCrumbs, [y.title, yPath]]
      const gTab = tabbar('grade', [GRADE_NAME[g], `/g/${g}`])
      const row = (b: YearBlock) => `<a class="row epoch" href="${yPath}/${b.id}"><span class="em">${b.emoji}</span><span class="txt"><b>${esc(b.title)}</b>${b.month ? `<small>${esc(b.month)}</small>` : ''}</span></a>`
      out.push({
        path: yPath,
        title: titles.approachYear(a.name, y.title),
        description: `${a.name}, ${y.title}: ${y.epochs.map((e) => (e.month ? `${e.title} (${e.month})` : e.title)).slice(0, 6).join(', ')}. Témata k procvičení ke každé epoše.`,
        crumbs: yCrumbs,
        body: `<div class="page" style="${green}">${bar(y.title, aPath, [[a.short, aPath]])}<h2 class="label">${a.emoji} Epochy</h2><div class="list">${y.epochs.map(row).join('')}</div>${y.ongoing?.length ? `<h2 class="label next-label">Celý rok</h2><div class="list">${y.ongoing.map(row).join('')}</div>` : ''}</div>${gTab}`,
        ld: { '@type': 'ItemList', itemListElement: y.epochs.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${yPath}/${e.id}`, name: e.title })) },
      })
      for (const b of [...y.epochs, ...(y.ongoing ?? [])]) {
        const bPath = `${yPath}/${b.id}`
        const refs = b.topics.map((k) => ({ k, ...topicRef.get(k)! }))
        out.push({
          path: bPath,
          title: titles.approachBlock(a.name, y.title, b.title),
          description: `${b.month ? `${b.month}: ` : ''}${plain(b.about.join(' '))}`.slice(0, 155),
          crumbs: [...yCrumbs, [b.title, bPath]],
          type: 'article',
          body: `<div class="page" style="${green}">${bar(`${b.emoji} ${b.title}`, yPath, [[a.short, aPath], [y.title, yPath]])}${b.month ? `<div class="label">${esc(b.month)}</div>` : ''}<div class="blocks approach-about">${b.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div>${refs.length ? `<h2 class="label">Témata</h2><div class="list">${refs.map((r) => `<a class="row rec" style="${style(SUBJECTS[r.s].c)}" href="/g/${r.k}"><span class="txt"><b>${esc(r.t.title)}</b><small>${esc(GRADE_NAME[r.g as keyof typeof GRADE_NAME])} · ${esc(SUBJECTS[r.s].name)}</small></span></a>`).join('')}</div>` : '<p class="muted epoch-empty">K téhle epoše zatím v aplikaci nejsou témata k procvičení.</p>'}</div>${gTab}`,
        })
      }
    }
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
