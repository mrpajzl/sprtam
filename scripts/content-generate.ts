// Generates everything derived from the format definition (src/content/format.ts) and the widgets:
//   content/schema/*.schema.json   JSON Schema – editors validate and autocomplete content files with it
//   docs/FORMAT.md                 reference of every file, block and question field
//   docs/WIDGETY.md                reference of every widget
// npm run content:generate writes them; npm run check:content fails when they are out of date.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { BLOCK_EXAMPLES, QUESTION_EXAMPLES } from '../src/content/examples'
import { block, FORMAT, question, subjectFile, topicFile, vocabFile } from '../src/content/format'
import { fieldRows, toJsonSchema, type ObjectS, type S, type VariantsS } from '../src/content/schema'
import { WIDGET_GROUPS } from '../src/widgets'
import type { WidgetDef } from '../src/widgets/kit'

const ROOT = join(import.meta.dirname, '..')
const HEADER = 'Generováno z src/content/format.ts a src/widgets/ (npm run content:generate). Needitovat ručně.'

const schemaFile = (s: S, id: string, title: string) => JSON.stringify({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `https://sprtam.cz/schema/${id}`,
  title,
  $comment: HEADER,
  ...toJsonSchema(s),
}, null, 2) + '\n'

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const table = (o: ObjectS) => {
  const rows = fieldRows(o)
  if (!rows.length) return '_bez vlastností_\n'
  return ['| Pole | Typ | Povinné | Popis |', '|---|---|---|---|', ...rows.map(([name, type, req, desc]) => `| \`${name}\` | ${cell(type)} | ${req ? 'ano' : '–'} | ${cell(desc)} |`)].join('\n') + '\n'
}
const json = (x: unknown) => '```json\n' + JSON.stringify(x, null, 2) + '\n```\n'

function cases(v: VariantsS, examples: Record<string, unknown>) {
  return Object.entries(v.cases).map(([tag, c]) => {
    const body = c.kind === 'object' ? table(c) : 'Vlastnosti podle widgetu – viz [WIDGETY.md](WIDGETY.md).\n'
    return `### \`${tag}\`\n\n${c.description ?? ''}\n\n${body}\n${json(examples[tag])}`
  }).join('\n')
}

function formatDoc() {
  return `# Formát obsahu – reference

> ${HEADER}
> Jak obsah psát: [CONTENT.md](CONTENT.md). Widgety: [WIDGETY.md](WIDGETY.md).

Verze formátu: **${FORMAT}** (pole \`format\` v každém souboru).

## Soubory

| Soubor | Co obsahuje | Schéma |
|---|---|---|
| \`content/topics/<ročník>/<předmět>/_subject.json\` | pořadí témat předmětu v ročníku | \`content/schema/subject.schema.json\` |
| \`content/topics/<ročník>/<předmět>/<id-tématu>.json\` | jedno téma | \`content/schema/topic.schema.json\` |
| \`content/vocab/<úroveň>.json\` | anglická slovíčka jedné úrovně (a1–c1) | \`content/schema/vocab.schema.json\` |

Ročníky: \`z1\`–\`z9\` (základní škola), \`s1\`–\`s4\` (gymnázium). Předměty ročníku: \`GRADE_SUBJECTS\` v \`src/content/curriculum.ts\`.
Každý soubor začíná polem \`"$schema"\` s relativní cestou ke schématu – editor (VS Code, JetBrains) pak sám napovídá a hlásí chyby.

### Téma (\`<id-tématu>.json\`)

${table(topicFile)}
### Seznam témat (\`_subject.json\`)

${table(subjectFile)}
### Slovíčka (\`content/vocab/<úroveň>.json\`)

${table(vocabFile)}
## Bloky vysvětlení (\`explanations[].blocks[]\`)

Každý blok má pole \`type\` a další pole podle typu. Text smí obsahovat **tučné** (\`**…**\`), *kurzívu* (\`*…*\`), \`vzorec\` (\`\\\`…\\\`\`) a horní index (\`^2\`, \`^II\`).

${cases(block as VariantsS, BLOCK_EXAMPLES)}
## Otázky (\`questions[]\`)

${cases(question as VariantsS, QUESTION_EXAMPLES)}`
}

function widgetDoc() {
  const one = (w: WidgetDef) => `<a id="${w.name}"></a>

### \`${w.name}\` – ${w.title}

${w.summary}

**Kdy ho použít:** ${w.use}${w.Question ? '\n\n**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.' : ''}

Živá ukázka: [/widgety/${w.name}](https://sprtam.cz/widgety/${w.name})

${table(w.props)}
${json({ type: 'widget', widget: w.name, props: w.examples[0].props })}`
  return `# Widgety – reference

> ${HEADER}
> Galerie se živými ukázkami všech widgetů: [sprtam.cz/widgety](https://sprtam.cz/widgety) (lokálně http://localhost:5173/widgety).

Widget je interaktivní blok vysvětlení:

${json({ type: 'widget', widget: '<název>', props: {} })}
V řešeném příkladu (blok \`example\`) se widget ukáže spolu s řešením (\`"widget": { "widget": …, "props": … }\`), u otázky \`input\` jen zadání (jen widgety s režimem pro otázky).

Než vytvoříš nový widget, projdi tenhle seznam – nejspíš už existuje. Jak napsat nový: [CONTENT.md](CONTENT.md#nový-widget).

${WIDGET_GROUPS.map((g) => `## ${g.name}\n\n${g.widgets.map((w) => `- [\`${w.name}\`](#${w.name}) – ${w.title}`).join('\n')}\n\n${g.widgets.map(one).join('\n')}`).join('\n')}`
}

/** Path (relative to the repo) → expected content. */
export function generated(): Record<string, string> {
  return {
    'content/schema/topic.schema.json': schemaFile(topicFile, 'topic.schema.json', 'Šprtám – téma'),
    'content/schema/subject.schema.json': schemaFile(subjectFile, 'subject.schema.json', 'Šprtám – seznam témat předmětu'),
    'content/schema/vocab.schema.json': schemaFile(vocabFile, 'vocab.schema.json', 'Šprtám – anglická slovíčka'),
    'docs/FORMAT.md': formatDoc(),
    'docs/WIDGETY.md': widgetDoc(),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [rel, text] of Object.entries(generated())) {
    mkdirSync(dirname(join(ROOT, rel)), { recursive: true })
    writeFileSync(join(ROOT, rel), text)
    console.log('✓', rel)
  }
}
