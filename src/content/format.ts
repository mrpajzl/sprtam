import { s, type Infer, type ObjectS } from './schema'
import { WIDGETS } from '../widgets'
import { KEY_COLORS } from './curriculum'

// The content format (version FORMAT). The only definition of what a content file may contain:
// TypeScript types, the validator (scripts/check-content.ts) and the JSON Schemas in content/schema/
// (npm run content:generate) all come from here. Rules for authors: docs/CONTENT.md.
//
//   content/topics/<grade>/<subject>/_subject.json   order of the topics   → SubjectFile
//                                                    (grade odb: odborné předměty, the file also names the subject)
//   content/topics/<grade>/<subject>/<topic-id>.json  one topic             → TopicFile
//   content/vocab/<level>.json                        English vocabulary    → VocabFile
//   content/vocab/<lang>/<level>.json                 vocabulary of another language (de, fr, es) → WordsFile
//   content/approaches/<id>/approach.json             a teaching approach   → ApproachFile
//   content/approaches/<id>/<grade>.json              its plan of one year  → ApproachYearFile
//
// Compatibility: an app build only reads the format it was built with. Adding an optional field or a new
// block/widget/question type keeps FORMAT. Anything that changes the meaning of existing files (a renamed
// or removed field) bumps FORMAT and comes with a script that migrates every file at once (docs/CONTENT.md).

export const FORMAT = 1

/** Text with inline markup: **tučně**, *kurzíva*, `vzorec`, horní index ^2. */
const text = (description = 'Text; smí obsahovat **tučné**, *kurzívu*, `vzorec` a horní index ^2.') => s.string({ description })

// ——— Widgets: one case per widget in src/widgets ———

const widgetCases = Object.fromEntries(Object.values(WIDGETS).map((w) => [w.name, s.object({ props: w.props }, { description: `${w.title}: ${w.summary}` })])) as Record<string, ObjectS<{ props: Record<string, unknown> }>>

/** `{ "widget": "fraction", "props": {…} }` – any widget. */
export const widgetRef = s.variants('widget', widgetCases, { description: 'Interaktivní widget: název (viz galerie /widgety) a jeho vlastnosti.' })
/** Only widgets that can show a task without its answer (WidgetDef.Question). */
export const questionWidgetRef = s.variants('widget', Object.fromEntries(Object.entries(widgetCases).filter(([n]) => WIDGETS[n].Question)), {
  description: 'Widget nad otázkou – ukáže jen zadání, ne výsledek. Smí jen widgety s režimem pro otázky (column).',
})

// ——— Blocks of an explanation ———

export const block = s.variants('type', {
  heading: s.object({ text: text('Krátký nadpis části výkladu, např. "O čem to je".') }, { description: 'Nadpis uvnitř vysvětlení.' }),
  text: s.object({ text: text('Odstavec.') }, { description: 'Odstavec textu.' }),
  term: s.object({
    term: text('Pojem, např. "Jmenovatel".'),
    definition: text('Co pojem znamená, obyčejnými slovy.'),
    example: s.optional(text('Konkrétní příklad.')),
  }, { description: 'Nový pojem – vysvětlený dřív, než se poprvé použije.' }),
  mistake: s.object({
    wrong: text('Chybné řešení nebo tvrzení.'),
    right: text('Správné řešení.'),
    why: text('Proč je to tak – krátce.'),
  }, { description: 'Častá chyba: špatně, správně a proč.' }),
  summary: s.object({ text: text('Pravidlo nebo shrnutí v 1–3 větách.') }, { description: 'To hlavní k zapamatování, zvýrazněné.' }),
  list: s.object({ items: s.array(text('Položka.'), { min: 1 }) }, { description: 'Odrážkový seznam.' }),
  steps: s.object({ items: s.array(text('Krok.'), { min: 1 }) }, { description: 'Postup krok za krokem; kroky se odkrývají postupně.' }),
  example: s.object({
    question: text('Zadání řešeného příkladu.'),
    answer: text('Řešení i s postupem.'),
    widget: s.optional(widgetRef),
  }, { description: 'Řešený příklad; řešení se ukáže po klepnutí. Volitelný widget se ukáže spolu s řešením (např. column).' }),
  table: s.object({
    head: s.array(s.string({ min: 0, description: 'Záhlaví sloupce (smí být prázdné, např. roh tabulky).' }), { min: 1 }),
    rows: s.array(s.array(s.string({ min: 0, description: 'Buňka (smí být prázdná).' })), { min: 1, description: 'Řádky; každý má stejně buněk jako head.' }),
  }, { description: 'Tabulka.' }),
  picture: s.object({
    items: s.array(s.string(), { min: 1, description: 'Emoji v řadě, např. ["🍎", "🍎", "➕", "🍐"].' }),
    caption: s.optional(s.string({ description: 'Popisek pod obrázkem (čte ho i čtečka obrazovky).' })),
  }, { description: 'Obrázek složený z emoji.' }),
  widget: widgetRef,
}, { description: 'Blok vysvětlení.' })

const ID = '^[a-z0-9]+(-[a-z0-9]+)*$'
const approachRef = (description: string) => s.string({ pattern: ID, description })

export const explanation = s.object({
  title: s.string({ description: 'Krátký název přístupu, 1–3 slova: "Na pizze", "Krok za krokem".' }),
  approach: s.optional(approachRef('Vysvětlení v duchu jednoho přístupu k výuce (složka v content/approaches), např. "waldorf". Dětem, které ten přístup zvolily, se ukáže jako první; ostatním se neukazuje.')),
  blocks: s.array(block, { min: 1 }),
})

// ——— Questions ———

const why = s.optional(text('Krátké vysvětlení správné odpovědi (ukáže se po odpovědi).'))
const hints = s.optional(s.array(text('Nápověda: jeden krok k řešení, ne odpověď.'), { min: 1, max: 3, description: 'Nápovědy od nejobecnější po nejkonkrétnější; dítě si je odkrývá po jedné před odpovědí (ne v písemce a testu). Nesmí prozradit odpověď.' }))

export const question = s.variants('type', {
  choice: s.object({
    question: text('Otázka.'),
    options: s.array(text('Možnost.'), { min: 2, max: 4, description: '2–4 možnosti; aplikace je zamíchá.' }),
    answer: s.int({ min: 0, description: 'Pořadí správné možnosti v options, od 0.' }),
    explanation: why,
    hints,
  }, { description: 'Výběr jedné ze 2–4 možností.' }),
  truefalse: s.object({
    question: text('Tvrzení.'),
    answer: s.boolean({ description: 'true = pravda, false = nepravda.' }),
    explanation: why,
  }, { description: 'Pravda, nebo nepravda.' }),
  input: s.object({
    question: text('Otázka s krátkou odpovědí (číslo nebo slovo).'),
    answers: s.array(s.string(), { min: 1, description: 'Všechny přijatelné odpovědi. Velikost písmen a mezery se ignorují, čísla se porovnávají jako čísla (0,5 = 0.5), diakritika se ignoruje mimo češtinu a literaturu.' }),
    explanation: why,
    widget: s.optional(questionWidgetRef),
    hints,
  }, { description: 'Napsaná krátká odpověď.' }),
  order: s.object({
    question: text('Zadání.'),
    items: s.array(text('Položka.'), { min: 3, max: 8, description: 'Položky ve SPRÁVNÉM pořadí; aplikace je zamíchá.' }),
    explanation: why,
    hints,
  }, { description: 'Seřazení položek.' }),
  match: s.object({
    question: text('Zadání.'),
    pairs: s.array(s.tuple([text('Levá strana.'), text('Pravá strana.')]), { min: 3, max: 6, description: 'Správně spárované dvojice; aplikace zamíchá pravou stranu.' }),
    explanation: why,
    hints,
  }, { description: 'Spojování dvojic.' }),
  open: s.object({
    question: text('Ústní otázka.'),
    answer: text('Vzorová odpověď v 1–3 větách.'),
  }, { description: 'Otázka pro ústní zkoušení; dítě odpoví nahlas a samo se ohodnotí.' }),
}, { description: 'Otázka.' })

// ——— Files ———

export const topicFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  id: s.string({ pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', description: 'Stejné jako název souboru. Kebab-case ASCII. NIKDY SE NEMĚNÍ – je na něm uložený pokrok.' }),
  title: s.string({ description: 'Název tématu.' }),
  emoji: s.string({ description: 'Jedno výstižné emoji.' }),
  generator: s.optional(s.string({ description: 'Generátor dalších příkladů z src/quiz/generators.ts (jen matematika a fyzika).' })),
  approach: s.optional(approachRef('Téma jen pro jeden přístup k výuce (např. "waldorf"): v běžném seznamu předmětu se neukáže, jen v plánu toho přístupu.')),
  explanations: s.array(explanation, { min: 2, max: 6, description: 'Přesně dvě obecná vysvětlení (bez "approach"), každé jinou cestou. Navíc nejvýš jedno pro každý přístup k výuce.' }),
  questions: s.array(question, { min: 8 }),
  verified: s.optional(s.object({
    by: s.string({ description: 'Kdo téma zkontroloval (jméno moderátora, případně víc jmen oddělených čárkou).' }),
    at: s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Kdy, RRRR-MM-DD.' }),
  }, { description: 'Prošlo kontrolou člověkem. Nastavuje jen moderace (tlačítko „Ověřit“ nebo schválení změny); každá další změna bez kontroly ho smaže. Chybí = neověřeno.' })),
}, { description: 'Jedno téma: dvě vysvětlení a otázky.' })

export const subjectFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  topics: s.array(s.string({ pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' }), { min: 1, description: 'Id témat v pořadí, v jakém se během roku učí. Každé má soubor <id>.json vedle.' }),
  name: s.optional(s.string({ description: 'Jen odborné předměty (topics/odb): název předmětu, např. "Technické kreslení".' })),
  emoji: s.optional(s.string({ description: 'Jen odborné předměty: jedno emoji předmětu.' })),
  color: s.optional(s.enum(KEY_COLORS, { description: 'Jen odborné předměty: barva klávesy předmětu.' })),
}, { description: 'Pořadí témat jednoho předmětu v jednom ročníku. Odborný předmět (topics/odb/<id>) tu má i svůj název, emoji a barvu.' })

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export const vocabFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  level: s.enum(LEVELS, { description: 'Úroveň podle SERR, stejná jako název souboru.' }),
  groups: s.array(s.object({
    name: s.string({ description: 'Název okruhu, např. "Zvířata".' }),
    emoji: s.string({ description: 'Jedno emoji okruhu.' }),
    lang: s.optional(s.enum(['en-GB', 'en-US', 'en-AU'], { description: 'Přízvuk výslovnosti; výchozí en-GB.' })),
    words: s.array(s.object({
      cz: s.string({ description: 'Česky – na tohle se aplikace ptá.' }),
      en: s.string({ description: 'Správně anglicky. Musí být jedinečné napříč všemi úrovněmi (je na něm uložený pokrok).' }),
      similar: s.string({ description: 'Špatná možnost, která podobně vypadá nebo zní (bird → bard).' }),
      related: s.string({ description: 'Špatná možnost, která souvisí významem (bird → parrot).' }),
    }), { min: 1 }),
  }), { min: 1, description: 'Okruhy. Odkazují se pořadím (/slovicka/A1/0) – nové přidávej na konec.' }),
}, { description: 'Anglická slovíčka jedné úrovně.' })

/** Languages with vocabulary besides English (content/vocab/<lang>/<level>.json). */
export const WORD_LANGS = ['de', 'fr', 'es'] as const

export const wordsFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  lang: s.enum(WORD_LANGS, { description: 'Jazyk, stejný jako složka: de němčina, fr francouzština, es španělština.' }),
  level: s.enum(LEVELS, { description: 'Úroveň podle SERR, stejná jako název souboru.' }),
  groups: s.array(s.object({
    name: s.string({ description: 'Název okruhu, např. "Zvířata".' }),
    emoji: s.string({ description: 'Jedno emoji okruhu.' }),
    words: s.array(s.object({
      cz: s.string({ description: 'Česky – na tohle se aplikace ptá.' }),
      word: s.string({ description: 'Správně v cizím jazyce, podstatná jména se členem (der Hund, le chien, el perro; před samohláskou l\'arbre (m)). Část v závorce se při psaní nevyžaduje. Musí být jedinečné napříč úrovněmi jazyka (je na něm uložený pokrok).' }),
      similar: s.string({ description: 'Špatná možnost, která podobně vypadá nebo zní (der Hund → der Mund).' }),
      related: s.string({ description: 'Špatná možnost, která souvisí významem (der Hund → die Katze).' }),
    }), { min: 1 }),
  }), { min: 1, description: 'Okruhy. Odkazují se pořadím (/slovicka/nemcina/A1/0) – nové přidávej na konec.' }),
}, { description: 'Slovíčka jednoho jazyka (kromě angličtiny) jedné úrovně.' })

const blockOfYear = s.object({
  id: s.string({ pattern: ID, description: 'Kebab-case ASCII, jedinečné v roce. Je v adrese (/waldorf/z1/<id>), nemění se.' }),
  title: s.string({ description: 'Název epochy, např. "Svět rovných a oblých čar".' }),
  emoji: s.string({ description: 'Jedno emoji.' }),
  about: s.array(text('Odstavec.'), { min: 1, description: 'Co se v epoše dělá, pro děti a rodiče; 1–3 krátké odstavce.' }),
  topics: s.array(s.string({ pattern: '^[a-z0-9]+/[a-z]+/[a-z0-9]+(-[a-z0-9]+)*$', description: 'Téma jako <ročník>/<předmět>/<id>, třeba z jiného ročníku.' }), { description: 'Témata aplikace, která k epoše patří, v pořadí probírání. Smí být prázdné.' }),
})

export const approachFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  name: s.string({ description: 'Celý název, např. "Waldorfská škola".' }),
  short: s.string({ description: 'Krátký název do lišty, např. "Waldorf".' }),
  emoji: s.string({ description: 'Jedno emoji.' }),
  choose: s.string({ description: 'Text přepínače, kterým si dítě přístup zvolí, např. "Chodím do waldorfské školy".' }),
  about: s.array(text('Odstavec.'), { min: 1, description: 'Co je pro přístup typické a jak s ním aplikace pracuje.' }),
  grading: s.enum(['marks', 'verbal'], { description: 'Hodnocení písemky a testu: "marks" známka 1–5, "verbal" slovní hodnocení.' }),
}, { description: 'Přístup k výuce (např. waldorfská škola): jeho popis. Plány ročníků jsou v souborech <ročník>.json vedle.' })

export const approachYearFile = s.object({
  format: s.int({ min: FORMAT, max: FORMAT, description: `Verze formátu, teď ${FORMAT}.` }),
  title: s.string({ description: 'Název ročníku v tomto přístupu, např. "1. třída" nebo "11. třída (lyceum)".' }),
  about: s.optional(s.array(text('Odstavec.'), { min: 1, description: 'Poznámka k celému ročníku, např. odkud plán pochází.' })),
  epochs: s.array(blockOfYear, { min: 1, description: 'Epochy hlavního vyučování v obvyklém pořadí. Třídy si je každý rok skládají jinak, proto bez měsíců.' }),
  ongoing: s.optional(s.array(blockOfYear, { description: 'Předměty, které běží celý rok mimo epochy (cizí jazyky, cvičné hodiny).' })),
}, { description: 'Plán jednoho ročníku v přístupu k výuce: epochy a průběžné předměty, každé s tématy aplikace.' })

export type Block = Infer<typeof block>
export type Explanation = Infer<typeof explanation>
export type Question = Infer<typeof question>
export type TopicFile = Infer<typeof topicFile>
export type SubjectFile = Infer<typeof subjectFile>
export type VocabFile = Infer<typeof vocabFile>
export type WordsFile = Infer<typeof wordsFile>
export type ApproachFile = Infer<typeof approachFile>
export type ApproachYearFile = Infer<typeof approachYearFile>
export type YearBlock = ApproachYearFile['epochs'][number]
