import { GRADE_NAME, gradeSubjects, ODB, STAGES, subjectMeta } from '../src/content/curriculum'
import { kindName, OBOR_PATH, oboryOf, readyObory, yearGrade } from '../src/obory'
import type { ApproachMeta } from '../src/content/manifest'
import type { ApproachYearFile, Block, Subject, SubjectId, VocabFile, WordsFile, YearBlock, YearId } from '../src/content/types'
import { LANGS, langById, LEVEL_IDS, vocabPath, type LangMeta } from '../src/vocab/langs'
import type { Level, VocabLang } from '../src/vocab/types'
import { extras, extrasFor, extrasOf, merged, type Extra } from '../src/games'
import { ABOUT } from '../src/about'
import { EXAM, partTopics } from '../src/exam'
import { askable, MAPS, MAPS_INTRO, MAPS_PATH, modesOf, PARTS, place, ROUND } from '../src/maps'
import { askable as askableElements, ELEMENTS_INTRO, ELEMENTS_PATH, MODES as ELEMENT_MODES, ROUND as ELEMENT_ROUND, setById } from '../src/chem'
import { fullTitle, gradeFor, gradeLabel, plain, SITE_NAME, summary, titles } from '../src/seo'
import { WIDGETS } from '../src/widgets'
import { CONTENT_AUTHOR, dateCs, joinHref, profileHref, verifierNames, type Verified } from '../src/content/verified'

// A real HTML page for every public route, so links are shareable with proper previews and search
// engines get content, titles and descriptions without running JS:
//   /  /ucivo  /hry  /o-aplikaci  /g/<grade>  /g/<grade>/<subject>  /g/<grade>/<subject>/<topic>  /slovicka  /slovicka/<level>
//   /slovicka/<language>  /slovicka/<language>/<level>
//   /<approach>  /<approach>/<grade>  /<approach>/<grade>/<epoch>  /prijimacky  /prijimacky/<subject>  /prijimacky/<subject>/<area>
//   /obor  /obor/<id>  (odborné předměty themselves are /g/odb/<subject>/<topic>)
//   /slepa-mapa  /slepa-mapa/<map>  /periodicka-tabulka
// plus the app.html shell for the remaining in-app routes, sitemap.xml and robots.txt. Rendered by the
// server from the current content release (server/content.ts). The markup uses the app's own classes,
// so it looks like the screen the app then renders over it.

/** The content of a release in the shape the pages need. */
export interface SiteContent {
  subjects: Subject[]
  vocab: VocabFile[]
  /** Vocabulary of the other languages. */
  words: WordsFile[]
  approaches: (ApproachMeta & { years: [YearId, ApproachYearFile][] })[]
}

const SITE = (process.env.SITE_URL ?? 'https://sprtam.cz').replace(/\/$/, '')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Inline markup (**bold**, *italic*, `code`, ^sup) → HTML, as src/ui/Inline.tsx renders it. */
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*|\^([+−-]?(?:[IVX]+|[0-9]+)[+−-]?|[+−-])/g, (_, b, c, i, sup) =>
  b ? `<strong>${b}</strong>` : c ? `<code>${c}</code>` : i ? `<em>${i}</em>` : `<sup>${sup}</sup>`)
/** Who wrote the topic and whether a person has checked it, as in the app (src/screens/TopicScreen.tsx, CheckNote). */
const checkNote = (v: Verified | undefined, topic: string) => `<aside class="check-note${v ? ' ok' : ''}" aria-label="Kdo téma napsal a zkontroloval"><p><i aria-hidden="true">AI</i><span>Autor: <b>${esc(CONTENT_AUTHOR)}</b> (umělá inteligence)</span></p>${v
  ? `<p><i aria-hidden="true">✓</i><span>Zkontrolováno člověkem: ${verifierNames(v.by).map((n) => `<a href="${esc(profileHref(n))}" target="_blank" rel="noopener"><b>${esc(n)}</b></a>`).join(', ')}, ${esc(dateCs(v.at))}</span></p>`
  : `<p><i aria-hidden="true">!</i><span>Čeká na kontrolu člověkem. Když najdeš chybu, nahlas ji.</span></p><a class="btn ghost block" href="${esc(joinHref(topic))}" target="_blank" rel="noopener">Chci to zkontrolovat a schválit</a>`}</aside>`
const style = (c: string) => `--c:var(--k-${c});--on-c:var(--k-${c}-on)`
const STAGE_LABEL = { zs1: 'ZŠ · 1. stupeň', zs2: 'ZŠ · 2. stupeň', ss: 'SŠ · ročník' } // as in GradePad (src/screens/School.tsx)
const icon = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
// Same paths as src/ui/icons.tsx.
const BACK = icon('M15 5l-7 7 7 7')
const HOME = icon('M4 11l8-7 8 7M6.5 9v11h11V9M10 20v-5h4v5')
const SEARCH = icon('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20')
const BOOK = icon('M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10')
const DICE = icon('M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01')
const USER = icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0')
const FORWARD = icon('M5 12h14M13 6l6 6-6 6')

function block(b: Block, widgets: typeof WIDGETS): string {
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

export interface Page {
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
  `<header class="bar">${up ? `<a class="icon-btn" href="${esc(up)}" aria-label="Zpět">${BACK}</a>` : '<span class="spacer"></span>'}<div class="bar-title">${crumbs.length ? `<nav class="crumbs" aria-label="Kde jsem">${crumbs.map(([name, path]) => `<a href="${esc(path)}">${esc(name)}</a>`).join('')}</nav>` : ''}<h1>${esc(title)}</h1></div><span class="spacer"></span></header>`

/** The app's TabBar (src/ui/TabBar.tsx). */
const tabbar = (active: 'home' | 'learn' | 'games' | 'search' | undefined) => {
  const tab = (t: string, href: string, glyph: string, label: string) => `<a href="${esc(href)}"${t === active ? ' aria-current="page"' : ''}>${glyph}<span>${esc(label)}</span></a>`
  return `<nav class="tabbar" aria-label="Hlavní nabídka">${tab('home', '/', HOME, 'Dnes')}${tab('learn', '/ucivo', BOOK, 'Učivo')}${tab('games', '/hry', DICE, 'Hry')}${tab('search', '/hledat', SEARCH, 'Hledat')}</nav>`
}
/** Já in the header (MeChip in src/screens/School.tsx); without the app it is the /ja page. */
const meChip = `<a class="school-chip" href="/ja" aria-label="Já"><span class="me-av" aria-hidden="true">${USER}</span><b>Já</b></a>`
/** The top of a tab's own screen (TabHead in src/ui/Bar.tsx). */
const tabHead = (title: string) => `<header class="bar"><h1 class="brand">${esc(title)}</h1><span class="grow"></span>${meChip}</header>`

/** An extra of src/games.ts as a key (ExtraRow in src/ui/Extras.tsx). */
const extraRow = (x: Extra) => `<a class="row extra-key" style="${style(x.c)}" href="${esc(x.path)}"><span class="skey m">${x.emoji ? `<b class="em">${esc(x.emoji)}</b>` : `<b>${esc(x.glyph ?? '')}</b>`}</span><span class="txt"><b>${esc(x.name)}</b><small>${esc(x.hint)}</small></span>${FORWARD}</a>`
/** Extras placed on a page under a label (ExtraList). */
const extraList = (list: Extra[]) => {
  if (!list.length) return ''
  const games = list.some((x) => x.kind === 'hra'), prep = list.some((x) => x.kind === 'priprava')
  return `<section class="sec extras"><h2 class="label">${games && prep ? 'Hry a příprava' : games ? 'Hry' : 'Příprava'}</h2><div class="list">${list.map(extraRow).join('')}</div></section>`
}
/** The grade keys, each a link to its grade (GradePad in src/screens/School.tsx). */
const gradePad = () => `<div class="pad">${STAGES.map((st) => `<div class="pad-group"><small>${STAGE_LABEL[st.id]}</small><div class="pad-keys">${st.grades.map((g) => `<a class="num-key" href="${esc(`/g/${g}`)}" aria-label="${esc(gradeLabel(g))}">${GRADE_NAME[g].split('.')[0]}</a>`).join('')}</div></div>`).join('')}</div>`

/** Every public page of the content. */
export function pages(site: SiteContent): Page[] {
  const subjects = new Map<string, Subject>(site.subjects.map((s) => [`${s.grade}/${s.subject}`, s]))
  const vocab = site.vocab
  /** Languages with words in this release, English first (as vocabLangs() in the app). */
  const langs = LANGS.filter((m) => m.id === 'en' ? vocab.length > 0 : site.words.some((w) => w.lang === m.id))
  const range = (ls: string[]) => (ls.length > 1 ? `${ls[0]}–${ls[ls.length - 1]}` : ls[0] ?? '')
  const wordsOf = (m: LangMeta) => site.words.filter((w) => w.lang === m.id).sort((a, b) => LEVEL_IDS.indexOf(a.level) - LEVEL_IDS.indexOf(b.level))

  const home: [string, string] = [SITE_NAME, '/']
  const obory = readyObory((s) => subjects.has(`${ODB}/${s}`))
  const out: Page[] = []

  /** Levels of a language's words in this release (as levelsOf in the app). */
  const levelsOf = (lang: VocabLang): Level[] => (lang === 'en' ? vocab.map((v) => v.level as Level).sort((x, y) => LEVEL_IDS.indexOf(x) - LEVEL_IDS.indexOf(y)) : wordsOf(langById(lang)).map((w) => w.level as Level))
  const allExtras = extras(levelsOf)
  const games = allExtras.filter((x) => x.kind === 'hra')

  // Home without JS (and for crawlers): the app then shows the pupil's own school, or asks for it like this.
  out.push({
    path: '/',
    title: titles.home(),
    description: 'Opakování učiva základní a střední školy: vysvětlení od úplných základů, kvízy, písemky, slovíčka a hry. Zdarma, bez účtů a bez reklam.',
    crumbs: [home],
    body: `<div class="page home"><header class="bar"><h1 class="brand">šprtám</h1><span class="grow"></span>${meChip}</header>
<section class="sec welcome"><h2 class="label">Kam chodíš do školy?</h2>${gradePad()}<a class="row welcome-skip" href="/ucivo"><span class="txt"><b>Všechno učivo</b><small>třídy, obory a přijímačky</small></span>${FORWARD}</a></section>
${extraList(games)}
<a class="row about-key" style="${style('ink')}" href="/o-aplikaci"><span class="skey m"><b>?</b></span><span class="txt"><b>Co je Šprtám?</b><small>jak funguje a co o tobě (ne)ví</small></span></a></div>${tabbar('home')}`,
  })

  out.push({
    path: '/ucivo',
    title: titles.learn(),
    description: 'Všechno učivo Šprtámu: třídy základní školy, ročníky střední školy, obory odborných škol, waldorfský plán a příprava na přijímačky.',
    crumbs: [home, ['Učivo', '/ucivo']],
    body: `<div class="page learn">${tabHead('Učivo')}<a class="search-key" href="/hledat">${SEARCH}<span>Hledat téma nebo slovíčko</span></a><section class="sec"><h2 class="label">Třídy</h2>${gradePad()}</section>${obory.length || site.approaches.length ? `<section class="sec"><h2 class="label">Školy</h2><div class="list">${obory.length ? `<a class="row obor-key" style="${style('ink')}" href="${OBOR_PATH}"><span class="skey m"><b class="em">🛠️</b></span><span class="txt"><b>Odborné školy</b><small>IT, strojírenství, kosmetika a další obory</small></span>${FORWARD}</a>` : ''}${site.approaches.map((a) => `<a class="row obor-key" style="${style('green')}" href="${esc(`/${a.id}`)}"><span class="skey m"><b class="em">${esc(a.emoji)}</b></span><span class="txt"><b>${esc(a.name)}</b><small>epochy a učivo po ročnících</small></span>${FORWARD}</a>`).join('')}</div></section>` : ''}${extraList(allExtras.filter((x) => x.kind === 'priprava'))}</div>${tabbar('learn')}`,
  })

  out.push({
    path: '/hry',
    title: titles.games(),
    description: `Procvičování hrou: ${games.map((x) => x.name.toLowerCase()).join(', ')}.`,
    crumbs: [home, ['Hry', '/hry']],
    body: `<div class="page games">${tabHead('Hry')}<p class="muted lead">Procvičování hrou. Každou hru najdeš i u předmětu, ke kterému patří.</p><section class="sec"><h2 class="label">Všechny hry</h2><div class="list">${games.map(extraRow).join('')}</div></section></div>${tabbar('games')}`,
  })

  out.push({
    path: '/o-aplikaci',
    title: ABOUT.title,
    description: ABOUT.description,
    crumbs: [home, [ABOUT.title, '/o-aplikaci']],
    body: `<div class="page about">${bar(ABOUT.title, '/')}<div class="about-lead"><p>${inline(ABOUT.lead)}</p></div>${ABOUT.sections.map((x) => `<section><h2 class="label next-label">${esc(x.title)}</h2><ul class="about-list">${x.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul></section>`).join('')}
<section><h2 class="label next-label">${esc(ABOUT.code.title)}</h2><div class="list">${ABOUT.code.links.map((l) => `<a class="row" href="${esc(l.href)}" rel="noopener"><span class="txt"><b>${esc(l.label)}</b><small>${esc(l.hint)}</small></span>${FORWARD}</a>`).join('')}</div></section>
<section class="about-join card"><h2>${esc(ABOUT.join.title)}</h2><p>${esc(ABOUT.join.lead)}</p><ul>${ABOUT.join.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul><a class="btn block" href="${esc(ABOUT.join.form.href)}" target="_blank" rel="noopener">${esc(ABOUT.join.form.label)}</a><a class="btn ghost block" href="mailto:${esc(ABOUT.join.email)}">Napiš na ${esc(ABOUT.join.email)}</a></section></div>${tabbar(undefined)}`,
  })

  // Subject tiles: core subjects get their glyph from the app; odborné předměty show their emoji.
  const face = (s: SubjectId) => `<span class="tile-face">${subjectMeta(s).emoji ? `<b class="em glyph-em">${esc(subjectMeta(s).emoji!)}</b>` : ''}</span>`
  const tile = (g: string, s: SubjectId) => `<a class="tile" style="${style(subjectMeta(s).c)}" href="${esc(`/g/${g}/${s}`)}">${face(s)}<b>${esc(subjectMeta(s).name)}</b></a>`
  for (const g of [...STAGES.flatMap((st) => st.grades), ODB]) {
    const gPath = `/g/${g}`
    const odb = g === ODB
    const gCrumbs: [string, string][] = odb ? [home, ['Odborné školy', OBOR_PATH], [GRADE_NAME[g], gPath]] : [home, [gradeLabel(g), gPath]]
    const present = gradeSubjects(g).filter((s) => subjects.has(`${g}/${s}`))
    // No odborné předměty yet: no page for them (the app shows "Připravujeme" there).
    if (odb && !present.length) continue
    const gTab = tabbar('learn')
    out.push({
      path: gPath,
      title: titles.grade(g),
      description: `Učivo pro ${gradeFor(g)}: ${present.map((s) => subjectMeta(s).name).join(', ')}. Vysvětlení, kvízy a písemky na procvičení.`,
      crumbs: gCrumbs,
      body: `<div class="page">${bar(GRADE_NAME[g], odb ? OBOR_PATH : '/', odb ? [['Odborné školy', OBOR_PATH]] : [])}<div class="tiles">${present.map((s) => tile(g, s)).join('')}</div>${odb ? '' : extraList(merged(extrasFor(allExtras, g, present)))}</div>${gTab}`,
    })

    for (const s of present as SubjectId[]) {
      const subj = subjects.get(`${g}/${s}`)!
      const sPath = `${gPath}/${s}`
      const sCrumbs: [string, string][] = [...gCrumbs, [subjectMeta(s).name, sPath]]
      // Approach-only topics (docs/PRISTUPY.md) have pages, but are listed only in their approach's plan.
      const listedTopics = subj.topics.filter((t) => !t.approach)
      const names = listedTopics.map((t) => t.title)
      out.push({
        path: sPath,
        title: titles.subject(g, s),
        description: `${subjectMeta(s).name} pro ${gradeFor(g)}: ${names.slice(0, 6).join(', ')}${names.length > 6 ? ' a další' : ''}. ${listedTopics.length} ${listedTopics.length <= 4 ? 'témata' : 'témat'} s vysvětlením a kvízy.`,
        crumbs: sCrumbs,
        body: `<div class="page" style="${style(subjectMeta(s).c)}">${bar(subjectMeta(s).name, gPath, [[GRADE_NAME[g], gPath]])}${odb && oboryOf(s).length ? `<p class="obor-of muted">Učí se v oborech: ${oboryOf(s).map((o) => `<a href="${esc(`${OBOR_PATH}/${o.id}`)}">${esc(o.name)}</a>`).join(', ')}</p>` : ''}<div class="list">${listedTopics.map((t, i) => `<a class="row" href="${esc(`${sPath}/${t.id}`)}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="em">${esc(t.emoji)}</span><b>${esc(t.title)}</b></a>`).join('')}</div>${extraList(extrasOf(allExtras, g, s))}</div>${gTab}`,
        ld: { '@type': 'ItemList', itemListElement: listedTopics.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${sPath}/${t.id}`, name: t.title })) },
      })

      subj.topics.forEach((t) => {
        // As in the app: the general explanations only (an approach's own explanation shows to its pupils).
        const explanations = t.explanations.filter((x) => !x.approach)
        const key = explanations[0].blocks.find((b): b is Extract<Block, { type: 'summary' }> => b.type === 'summary')
        const tPath = `${sPath}/${t.id}`
        const i = listedTopics.indexOf(t)
        const prev = i > 0 ? listedTopics[i - 1] : undefined, next = i >= 0 ? listedTopics[i + 1] : undefined
        const nav = [prev && `<a class="row" href="${esc(`${sPath}/${prev.id}`)}"><span class="em">${esc(prev.emoji)}</span><b>${esc(prev.title)}</b></a>`, next && `<a class="row" href="${esc(`${sPath}/${next.id}`)}"><span class="em">${esc(next.emoji)}</span><b>${esc(next.title)}</b></a>`].filter(Boolean).join('')
        out.push({
          path: tPath,
          title: titles.topic(g, s, t.title),
          description: summary(explanations[0].blocks) || `${t.title} – ${subjectMeta(s).name}, ${gradeLabel(g)}.`,
          crumbs: [...sCrumbs, [t.title, tPath]],
          type: 'article',
          body: `<div class="page" style="${style(subjectMeta(s).c)}">${bar(`${t.emoji} ${t.title}`, sPath, [[GRADE_NAME[g], gPath], [subjectMeta(s).name, sPath]])}${explanations.map((x) => `<section><h2 class="label">${esc(x.title)}</h2><div class="blocks">${x.blocks.map((b) => block(b, WIDGETS)).join('')}</div></section>`).join('')}${checkNote(t.verified, `${g}/${s}/${t.id}`)}${nav ? `<div class="list">${nav}</div>` : ''}</div>${gTab}`,
          ld: {
            '@type': 'LearningResource', name: t.title, inLanguage: 'cs', learningResourceType: 'Explanation', isAccessibleForFree: true,
            educationalLevel: GRADE_NAME[g], about: subjectMeta(s).name, url: `${SITE}${tPath}`,
            teaches: key ? plain(key.text) : t.title,
          },
        })
      })
    }
  }

  const vCrumbs: [string, string][] = [home, ['Slovíčka', '/slovicka']]
  const count = (vs: { groups: { words: unknown[] }[] }[]) => vs.reduce((n, v) => n + v.groups.reduce((m, gr) => m + gr.words.length, 0), 0)
  const others = langs.filter((m) => m.id !== 'en')
  out.push({
    path: '/slovicka',
    title: titles.vocab(),
    description: `Anglická slovíčka podle úrovně A1–C1 (${count(vocab)} slov)${others.length ? ` a ${others.map((m) => m.name.toLowerCase()).join(', ')}` : ''}. Nová slova vybíráš ze tří, známá píšeš; slova se vracejí, dokud je neumíš.`,
    crumbs: vCrumbs,
    body: `<div class="page" style="${style('purple')}">${bar('Slovíčka', '/')}${others.length ? '<h2 class="label">Angličtina</h2>' : ''}<div class="levels">${vocab.map((v) => `<a class="row" href="${esc(`/slovicka/${v.level}`)}"><span class="skey m"><b>${esc(v.level)}</b></span><b>${v.groups.length} okruhů</b></a>`).join('')}</div>${others.length ? `<h2 class="label next-label">Další jazyky</h2><div class="list">${others.map((m) => `<a class="row lang-row" style="${style(subjectMeta(m.subject).c)}" href="${esc(vocabPath(m.id))}"><span class="skey m"></span><b>${esc(m.name)}<small class="lang-levels">${esc(range(wordsOf(m).map((w) => w.level)))}</small></b>${FORWARD}</a>`).join('')}</div>` : ''}</div>${tabbar('games')}`,
  })
  const levelPage = (m: LangMeta, v: { level: string; groups: { name: string; emoji: string; words: { cz: string; word: string }[] }[] }, crumbs: [string, string][]) => {
    const path = vocabPath(m.id, v.level as never)
    const name = m.id === 'en' ? v.level : `${m.name} ${v.level}`
    out.push({
      path,
      title: titles.vocabLevel(v.level, m.title),
      description: `${m.title} ${v.level}: ${v.groups.map((gr) => gr.name.toLowerCase()).slice(0, 8).join(', ')}${v.groups.length > 8 ? ' a další' : ''}. Například ${v.groups[0].words.slice(0, 4).map((w) => `${w.cz} – ${w.word}`).join(', ')}.`,
      crumbs: [...crumbs, [name, path]],
      body: `<div class="page" style="${style(m.id === 'en' ? 'purple' : subjectMeta(m.subject).c)}">${bar(name, crumbs[crumbs.length - 1][1], crumbs.slice(1))}<a class="btn block mix" href="${esc(`${path}/vse`)}">Míchat vše<small class="btn-count">${count([v])}</small></a><div class="tiles">${v.groups.map((gr, i) => `<a class="tile vocab-tile" href="${esc(`${path}/${i}`)}"><span class="tile-face em">${esc(gr.emoji)}</span><b>${esc(gr.name)}</b><small class="sample" lang="${m.id}">${esc(gr.words.slice(0, 6).map((w) => `${w.cz} – ${w.word}`).join(', '))}…</small></a>`).join('')}</div></div>${tabbar('games')}`,
    })
  }
  for (const v of vocab) levelPage(LANGS[0], { level: v.level, groups: v.groups.map((gr) => ({ ...gr, words: gr.words.map((w) => ({ cz: w.cz, word: w.en })) })) }, vCrumbs)
  for (const m of others) {
    const lPath = vocabPath(m.id)
    const lCrumbs: [string, string][] = [...vCrumbs, [m.name, lPath]]
    const ws = wordsOf(m)
    out.push({
      path: lPath,
      title: titles.vocab(m.title),
      description: `${m.title} podle úrovně ${range(ws.map((w) => w.level))} (${count(ws)} slov), od začátečníků v 7. třídě po střední školu. Nová slova vybíráš ze tří, známá píšeš.`,
      crumbs: lCrumbs,
      body: `<div class="page" style="${style(subjectMeta(m.subject).c)}">${bar(m.name, '/slovicka', [['Slovíčka', '/slovicka']])}<div class="levels">${ws.map((v) => `<a class="row" href="${esc(vocabPath(m.id, v.level))}"><span class="skey m"><b>${esc(v.level)}</b></span><b>${v.groups.length} okruhů</b></a>`).join('')}</div></div>${tabbar('games')}`,
    })
    for (const v of ws) levelPage(m, v, lCrumbs)
  }
  // Teaching approaches: /waldorf, /waldorf/<grade>, /waldorf/<grade>/<epoch> (markup as src/screens/Approach.tsx).
  const topicRef = new Map<string, { t: Subject['topics'][number]; g: string; s: SubjectId }>()
  for (const subj of subjects.values()) for (const t of subj.topics) topicRef.set(`${subj.grade}/${subj.subject}/${t.id}`, { t, g: subj.grade, s: subj.subject })
  const green = style('green')
  const ARROW = icon('M9 5l7 7-7 7')
  for (const a of site.approaches) {
    const aPath = `/${a.id}`
    const aCrumbs: [string, string][] = [home, [a.name, aPath]]
    out.push({
      path: aPath,
      title: titles.approach(a.name),
      description: plain(a.about[0]).slice(0, 155),
      crumbs: aCrumbs,
      body: `<div class="page" style="${green}">${bar(`${a.emoji} ${a.name}`, '/')}<div class="blocks approach-about">${a.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div><h2 class="label">Ročníky</h2><div class="list">${a.years.map(([g, y]) => `<a class="row" href="${esc(`${aPath}/${g}`)}"><span class="num">${esc(y.title.split('.')[0])}</span><span class="txt"><b>${esc(y.title)}</b><small>${esc(y.epochs.map((e) => e.title).slice(0, 3).join(' · '))}…</small></span>${ARROW}</a>`).join('')}</div></div>${tabbar('learn')}`,
    })
    for (const [g, y] of a.years) {
      const yPath = `${aPath}/${g}`
      const yCrumbs: [string, string][] = [...aCrumbs, [y.title, yPath]]
      const gTab = tabbar('learn')
      const row = (b: YearBlock) => `<a class="row epoch" href="${esc(`${yPath}/${b.id}`)}"><span class="em">${esc(b.emoji)}</span><b>${esc(b.title)}</b></a>`
      out.push({
        path: yPath,
        title: titles.approachYear(a.name, y.title),
        description: `${a.name}, ${y.title}: ${y.epochs.map((e) => e.title).slice(0, 6).join(', ')}. Témata k procvičení ke každé epoše.`,
        crumbs: yCrumbs,
        body: `<div class="page" style="${green}">${bar(y.title, aPath, [[a.short, aPath]])}${y.about ? `<div class="blocks approach-about">${y.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div>` : ''}<h2 class="label">${esc(a.emoji)} Epochy</h2><div class="list">${y.epochs.map(row).join('')}</div>${y.ongoing?.length ? `<h2 class="label next-label">Celý rok</h2><div class="list">${y.ongoing.map(row).join('')}</div>` : ''}</div>${gTab}`,
        ld: { '@type': 'ItemList', itemListElement: y.epochs.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${yPath}/${e.id}`, name: e.title })) },
      })
      for (const b of [...y.epochs, ...(y.ongoing ?? [])]) {
        const bPath = `${yPath}/${b.id}`
        const refs = b.topics.map((k) => ({ k, ...topicRef.get(k)! }))
        out.push({
          path: bPath,
          title: titles.approachBlock(a.name, y.title, b.title),
          description: plain(b.about.join(' ')).slice(0, 155),
          crumbs: [...yCrumbs, [b.title, bPath]],
          type: 'article',
          body: `<div class="page" style="${green}">${bar(`${b.emoji} ${b.title}`, yPath, [[a.short, aPath], [y.title, yPath]])}<div class="blocks approach-about">${b.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div>${refs.length ? `<h2 class="label">Témata</h2><div class="list">${refs.map((r) => `<a class="row rec" style="${style(subjectMeta(r.s).c)}" href="${esc(`/g/${r.k}`)}"><span class="txt"><b>${esc(r.t.title)}</b><small>${esc(GRADE_NAME[r.g as keyof typeof GRADE_NAME])} · ${esc(subjectMeta(r.s).name)}</small></span></a>`).join('')}</div>` : '<p class="muted epoch-empty">K téhle epoše zatím v aplikaci nejsou témata k procvičení.</p>'}</div>${gTab}`,
        })
      }
    }
  }

  // Příprava na přijímačky: /prijimacky, /prijimacky/<subject>, /prijimacky/<subject>/<area> (markup as src/screens/Exam.tsx).
  const ePath = `/${EXAM.id}`
  const eCrumbs: [string, string][] = [home, [EXAM.name, ePath]]
  const orange = style('orange')
  out.push({
    path: ePath,
    title: titles.exam(),
    description: plain(`${EXAM.about[0]} ${EXAM.about[1]}`).slice(0, 155).replace(/\s+\S*$/, '') + '…',
    crumbs: eCrumbs,
    body: `<div class="page" style="${orange}">${bar(`${EXAM.emoji} ${EXAM.name}`, '/')}<div class="blocks approach-about">${EXAM.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div><h2 class="label">Testy</h2><div class="list">${EXAM.parts.map((pt) => `<a class="row rec exam-part" style="${style(subjectMeta(pt.s).c)}" href="${esc(`${ePath}/${pt.s}`)}"><span class="txt"><b>${esc(pt.title)}</b><small>${pt.minutes} minut · ${pt.points} bodů</small></span></a>`).join('')}</div></div>${tabbar('learn')}`,
  })
  for (const pt of EXAM.parts) {
    const pPath = `${ePath}/${pt.s}`
    const pCrumbs: [string, string][] = [...eCrumbs, [pt.title, pPath]]
    const pStyle = style(subjectMeta(pt.s).c)
    out.push({
      path: pPath,
      title: titles.examPart(pt.title),
      description: `${pt.title} u jednotné přijímací zkoušky (${pt.minutes} minut, ${pt.points} bodů): ${pt.areas.map((a) => a.title.toLowerCase()).join(', ')}. ${partTopics(pt).length} témat k procvičení a cvičný test.`,
      crumbs: pCrumbs,
      body: `<div class="page" style="${pStyle}">${bar(pt.title, ePath, [[EXAM.name, ePath]])}<p class="exam-facts"><span>${pt.minutes} minut</span><span>${pt.points} bodů</span></p><div class="blocks approach-about">${pt.about.map((x) => `<p>${inline(x)}</p>`).join('')}</div><h2 class="label">Oblasti</h2><div class="list">${pt.areas.map((a) => `<a class="row epoch" href="${esc(`${pPath}/${a.id}`)}"><span class="em">${esc(a.emoji)}</span><b>${esc(a.title)}</b></a>`).join('')}</div></div>${tabbar('learn')}`,
      ld: { '@type': 'ItemList', itemListElement: pt.areas.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${pPath}/${a.id}`, name: a.title })) },
    })
    for (const a of pt.areas) {
      const aPath = `${pPath}/${a.id}`
      const refs = a.topics.flatMap((k) => (topicRef.has(k) ? [{ k, ...topicRef.get(k)! }] : []))
      out.push({
        path: aPath,
        title: titles.examArea(a.title, pt.title),
        description: plain(a.about).slice(0, 155),
        crumbs: [...pCrumbs, [a.title, aPath]],
        type: 'article',
        body: `<div class="page" style="${pStyle}">${bar(`${a.emoji} ${a.title}`, pPath, [[EXAM.name, ePath], [pt.title, pPath]])}<div class="blocks approach-about"><p>${inline(a.about)}</p></div><h2 class="label">Témata</h2><div class="list">${refs.map((r) => `<a class="row rec" style="${style(subjectMeta(r.s).c)}" href="${esc(`/g/${r.k}`)}"><span class="txt"><b>${esc(r.t.title)}</b><small>${esc(GRADE_NAME[r.g as keyof typeof GRADE_NAME])} · ${esc(subjectMeta(r.s).name)}</small></span></a>`).join('')}</div></div>${tabbar('learn')}`,
      })
    }
  }
  // Odborné školy: /obor, /obor/<id> (markup as src/screens/Obor.tsx).
  const ink = style('ink')
  const oCrumbs: [string, string][] = [home, ['Odborné školy', OBOR_PATH]]
  out.push({
    path: OBOR_PATH,
    title: titles.obory(),
    description: `Odborné předměty středních odborných škol po ročnících: ${obory.map((o) => o.name).join(', ')}. Vysvětlení od základů, kvízy a písemky.`,
    crumbs: oCrumbs,
    body: `<div class="page" style="${ink}">${bar('🛠️ Odborné školy', '/')}<div class="blocks approach-about"><p>Vyber si svůj obor a ukážeme ti jeho odborné předměty ročník po ročníku. Všeobecné předměty (čeština, matematika, angličtina…) procvičíš s učivem gymnázia stejného ročníku.</p></div><h2 class="label">Obory</h2>${obory.length ? '' : '<div class="empty">Připravujeme.</div>'}<div class="list">${obory.map((o) => `<a class="row obor-row" href="${esc(`${OBOR_PATH}/${o.id}`)}"><span class="em">${esc(o.emoji)}</span><span class="txt"><b>${esc(o.name)}</b><small>${esc(`${o.code} · ${kindName(o)}`)}</small></span></a>`).join('')}</div>${[...subjects.keys()].some((k) => k.startsWith(`${ODB}/`)) ? `<a class="row obor-all" href="/g/${ODB}"><span class="txt"><b>Všechny odborné předměty</b><small>bez ohledu na obor</small></span></a>` : ''}</div>${tabbar('learn')}`,
    ld: { '@type': 'ItemList', itemListElement: obory.map((o, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${OBOR_PATH}/${o.id}`, name: o.name })) },
  })
  for (const o of obory) {
    const path = `${OBOR_PATH}/${o.id}`
    const odbTiles = (list: string[]) => {
      const ready = list.filter((s) => subjects.has(`${ODB}/${s}`))
      return `${ready.length ? `<div class="tiles">${ready.map((s) => tile(ODB, s)).join('')}</div>` : ''}${ready.length < list.length ? `<p class="muted obor-soon">${ready.length ? 'Další odborné předměty připravujeme.' : 'Odborné předměty tohoto ročníku připravujeme.'}</p>` : ''}`
    }
    out.push({
      path,
      title: titles.obor(o.name),
      description: `${o.name} (${o.code}): ${plain(o.about)}`.slice(0, 155).replace(/\s+\S*$/, '') + '…',
      crumbs: [...oCrumbs, [o.name, path]],
      body: `<div class="page" style="${ink}">${bar(`${o.emoji} ${o.name}`, OBOR_PATH, [['Odborné školy', OBOR_PATH]])}<p class="exam-facts"><span>${esc(o.code)}</span><span>${esc(kindName(o))}</span><span>${o.years.length} ročníky</span></p><div class="blocks approach-about"><p>${inline(o.about)}</p></div>${o.years.map((y, i) => {
        const g = yearGrade(i)
        const general = y.general.filter((s) => subjects.has(`${g}/${s}`))
        return `<section class="obor-year"><h2 class="label">${esc(GRADE_NAME[g])}</h2>${odbTiles(y.odb)}${general.length ? `<p class="obor-general muted">Všeobecné: ${general.map((s) => `<a href="${esc(`/g/${g}/${s}`)}">${esc(subjectMeta(s).name)}</a>`).join(', ')}</p>` : ''}</section>`
      }).join('')}</div>${tabbar('learn')}`,
    })
  }

  // Slepá mapa: /slepa-mapa, /slepa-mapa/<map> (markup as src/screens/Maps.tsx; the map itself needs the app,
  // the page lists its places).
  const teal = style('teal')
  const mCrumbs: [string, string][] = [home, ['Slepá mapa', MAPS_PATH]]
  const mapRow = (m: (typeof MAPS)[number]) => `<a class="row map-row" href="${esc(`${MAPS_PATH}/${m.id}`)}"><span class="em">${esc(m.emoji)}</span><span class="txt"><b>${esc(m.title)}</b><small>${esc(m.hint)}</small></span></a>`
  out.push({
    path: MAPS_PATH,
    title: titles.maps(),
    description: MAPS_INTRO,
    crumbs: mCrumbs,
    body: `<div class="page" style="${teal}">${bar('🗺️ Slepá mapa', '/')}<div class="blocks approach-about"><p>${esc(MAPS_INTRO)}</p></div><h2 class="label">Mapy</h2><div class="list">${MAPS.filter((m) => !PARTS.includes(m.id)).map(mapRow).join('')}</div><h2 class="label map-parts">Světadíly</h2><div class="list">${MAPS.filter((m) => PARTS.includes(m.id)).map(mapRow).join('')}</div></div>${tabbar('games')}`,
    ld: { '@type': 'ItemList', itemListElement: MAPS.map((m, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${MAPS_PATH}/${m.id}`, name: m.title })) },
  })
  for (const m of MAPS) {
    const path = `${MAPS_PATH}/${m.id}`
    const state = m.kind === 'stat'
    out.push({
      path,
      title: titles.map(m.title, m.kind),
      description: m.about,
      crumbs: [...mCrumbs, [m.title, path]],
      type: 'article',
      body: `<div class="page" style="${teal}">${bar(`${m.emoji} ${m.title}`, MAPS_PATH, [['Slepá mapa', MAPS_PATH]])}<div class="blocks approach-about"><p>${esc(m.about)}</p></div>`
        + `<h2 class="label">Hrát</h2><div class="list">${modesOf(m).map((mode) => `<a class="row map-mode" href="${esc(`${path}/${mode.id}`)}" rel="nofollow"><span class="txt"><b>${esc(mode.title)}</b><small>${esc(mode.hint)} · ${Math.min(ROUND, askable(m, mode.id).length)} otázek</small></span></a>`).join('')}</div>`
        + `<h2 class="label">${state ? 'Státy a hlavní města' : 'Kraje a krajská města'}</h2><div class="map-list">${m.ids.map((id) => { const pl = place(id)!; return `<div class="map-place"><b>${esc(pl.name)}</b><span>${esc(pl.capital ?? (id === 'CZ-ST' ? 'sídlo v Praze' : '–'))}</span></div>` }).join('')}</div></div>${tabbar('games')}`,
    })
  }
  // Periodická tabulka: /periodicka-tabulka (markup as src/screens/Elements.tsx; the games need the app, the page
  // lists every element as the widget periodic does without JS).
  const zs = setById('zs')!
  out.push({
    path: ELEMENTS_PATH,
    title: titles.elements(),
    description: ELEMENTS_INTRO,
    crumbs: [home, ['Periodická tabulka', ELEMENTS_PATH]],
    body: `<div class="page" style="${style('green')}">${bar('🧪 Periodická tabulka', '/')}<div class="blocks approach-about"><p>${esc(ELEMENTS_INTRO)}</p></div>`
      + `<h2 class="label">Hrát: ${esc(zs.title.toLowerCase())}</h2><div class="list">${ELEMENT_MODES.map((mode) => `<a class="row map-mode" href="${esc(`${ELEMENTS_PATH}/${zs.id}/${mode.id}`)}" rel="nofollow"><span class="txt"><b>${esc(mode.title)}</b><small>${esc(mode.hint)} · ${Math.min(ELEMENT_ROUND, askableElements(zs, mode.id).length)} otázek</small></span></a>`).join('')}</div>`
      + `<h2 class="label">Všech 118 prvků</h2><div class="blocks">${WIDGETS.periodic.html?.({}, esc) ?? ''}</div></div>${tabbar('games')}`,
  })
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
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${p.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="Šprtám" />`,
    `<meta property="og:locale" content="cs_CZ" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:image" content="${SITE}/pwa-512x512.png" />`,
    `<meta name="twitter:card" content="summary" />`,
    // A data block, not a script: the CSP (script-src 'self') does not apply to it.
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

/** The page in the app's HTML (dist/index.html). */
export function render(template: string, p: Page): string {
  return template
    // Replacer functions: content may contain `$&` and similar, which a replacement string would expand.
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(fullTitle(p.title))}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, () => `<meta name="description" content="${esc(p.description)}" />`)
    .replace('</head>', () => `  ${head(p)}\n  </head>`)
    .replace('<div id="app"></div>', () => `<div id="app">${p.body}</div>`)
}

export const sitemap = (all: Page[]) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map((p) => `  <url><loc>${esc(SITE + p.path)}</loc></url>`).join('\n')}\n</urlset>\n`

export const robots = () => `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`
