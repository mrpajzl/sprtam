# Formát obsahu – reference

> Generováno z src/content/format.ts a src/widgets/ (npm run content:generate). Needitovat ručně.
> Jak obsah psát: [CONTENT.md](CONTENT.md). Widgety: [WIDGETY.md](WIDGETY.md).

Verze formátu: **1** (pole `format` v každém souboru).

## Soubory

| Soubor | Co obsahuje | Schéma |
|---|---|---|
| `content/topics/<ročník>/<předmět>/_subject.json` | pořadí témat předmětu v ročníku | `content/schema/subject.schema.json` |
| `content/topics/<ročník>/<předmět>/<id-tématu>.json` | jedno téma | `content/schema/topic.schema.json` |
| `content/vocab/<úroveň>.json` | anglická slovíčka jedné úrovně (a1–c1) | `content/schema/vocab.schema.json` |

Ročníky: `z1`–`z9` (základní škola), `s1`–`s4` (gymnázium). Předměty ročníku: `GRADE_SUBJECTS` v `src/content/curriculum.ts`.
Každý soubor začíná polem `"$schema"` s relativní cestou ke schématu – editor (VS Code, JetBrains) pak sám napovídá a hlásí chyby.

### Téma (`<id-tématu>.json`)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `format` | celé číslo 1 | ano | Verze formátu, teď 1. |
| `id` | text | ano | Stejné jako název souboru. Kebab-case ASCII. NIKDY SE NEMĚNÍ – je na něm uložený pokrok. |
| `title` | text | ano | Název tématu. |
| `emoji` | text | ano | Jedno výstižné emoji. |
| `generator` | text | – | Generátor dalších příkladů z src/quiz/generators.ts (jen matematika a fyzika). |
| `explanations` | seznam (objekt) 2 položek | ano | Přesně dvě vysvětlení, každé jinou cestou. |
| `explanations[].title` | text | ano | Krátký název přístupu, 1–3 slova: "Na pizze", "Krok za krokem". |
| `explanations[].blocks` | seznam (objekt podle "type") ≥ 1 položek | ano |  |
| `questions` | seznam (objekt podle "type") ≥ 8 položek | ano |  |

### Seznam témat (`_subject.json`)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `format` | celé číslo 1 | ano | Verze formátu, teď 1. |
| `topics` | seznam (text) ≥ 1 položek | ano | Id témat v pořadí, v jakém se během roku učí. Každé má soubor <id>.json vedle. |

### Slovíčka (`content/vocab/<úroveň>.json`)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `format` | celé číslo 1 | ano | Verze formátu, teď 1. |
| `level` | "A1" \| "A2" \| "B1" \| "B2" \| "C1" | ano | Úroveň podle SERR, stejná jako název souboru. |
| `groups` | seznam (objekt) ≥ 1 položek | ano | Okruhy. Odkazují se pořadím (/slovicka/A1/0) – nové přidávej na konec. |
| `groups[].name` | text | ano | Název okruhu, např. "Zvířata". |
| `groups[].emoji` | text | ano | Jedno emoji okruhu. |
| `groups[].lang` | "en-GB" \| "en-US" \| "en-AU" | – | Přízvuk výslovnosti; výchozí en-GB. |
| `groups[].words` | seznam (objekt) ≥ 1 položek | ano |  |
| `groups[].words[].cz` | text | ano | Česky – na tohle se aplikace ptá. |
| `groups[].words[].en` | text | ano | Správně anglicky. Musí být jedinečné napříč všemi úrovněmi (je na něm uložený pokrok). |
| `groups[].words[].similar` | text | ano | Špatná možnost, která podobně vypadá nebo zní (bird → bard). |
| `groups[].words[].related` | text | ano | Špatná možnost, která souvisí významem (bird → parrot). |

## Bloky vysvětlení (`explanations[].blocks[]`)

Každý blok má pole `type` a další pole podle typu. Text smí obsahovat **tučné** (`**…**`), *kurzívu* (`*…*`), `vzorec` (`\`…\``) a horní index (`^2`, `^II`).

### `heading`

Nadpis uvnitř vysvětlení.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `text` | text | ano | Krátký nadpis části výkladu, např. "O čem to je". |

```json
{
  "type": "heading",
  "text": "O čem to je"
}
```

### `text`

Odstavec textu.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `text` | text | ano | Odstavec. |

```json
{
  "type": "text",
  "text": "Když krájíš pizzu na **stejné** díly, každý díl je *zlomek* celé pizzy."
}
```

### `term`

Nový pojem – vysvětlený dřív, než se poprvé použije.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `term` | text | ano | Pojem, např. "Jmenovatel". |
| `definition` | text | ano | Co pojem znamená, obyčejnými slovy. |
| `example` | text | – | Konkrétní příklad. |

```json
{
  "type": "term",
  "term": "Jmenovatel",
  "definition": "Číslo **pod** čarou. Říká, na kolik stejných dílů je celek rozdělený.",
  "example": "Ve zlomku 3/4 je jmenovatel 4."
}
```

### `mistake`

Častá chyba: špatně, správně a proč.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `wrong` | text | ano | Chybné řešení nebo tvrzení. |
| `right` | text | ano | Správné řešení. |
| `why` | text | ano | Proč je to tak – krátce. |

```json
{
  "type": "mistake",
  "wrong": "1/2 + 1/3 = 2/5",
  "right": "1/2 + 1/3 = 3/6 + 2/6 = 5/6",
  "why": "Sčítat jde jen díly stejné velikosti – nejdřív stejný jmenovatel."
}
```

### `summary`

To hlavní k zapamatování, zvýrazněné.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `text` | text | ano | Pravidlo nebo shrnutí v 1–3 větách. |

```json
{
  "type": "summary",
  "text": "Zlomek = kolik dílů máš (nahoře) z kolika stejných dílů (dole)."
}
```

### `list`

Odrážkový seznam.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `items` | seznam (text) ≥ 1 položek | ano |  |

```json
{
  "type": "list",
  "items": [
    "čitatel je nahoře",
    "jmenovatel je dole",
    "zlomková čára znamená „děleno“"
  ]
}
```

### `steps`

Postup krok za krokem; kroky se odkrývají postupně.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `items` | seznam (text) ≥ 1 položek | ano |  |

```json
{
  "type": "steps",
  "items": [
    "Najdi společný jmenovatel.",
    "Rozšiř oba zlomky.",
    "Sečti čitatele, jmenovatel opiš."
  ]
}
```

### `example`

Řešený příklad; řešení se ukáže po klepnutí. Volitelný widget se ukáže spolu s řešením (např. column).

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Zadání řešeného příkladu. |
| `answer` | text | ano | Řešení i s postupem. |
| `widget` | objekt podle "widget" | – | Interaktivní widget: název (viz galerie /widgety) a jeho vlastnosti. |

```json
{
  "type": "example",
  "question": "Vypočítej písemně 832 − 457.",
  "answer": "Odčítám od jednotek a doplňuji: **375**.",
  "widget": {
    "widget": "column",
    "props": {
      "a": 832,
      "b": 457,
      "op": "-"
    }
  }
}
```

### `table`

Tabulka.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `head` | seznam (text) ≥ 1 položek | ano |  |
| `rows` | seznam (seznam (text)) ≥ 1 položek | ano | Řádky; každý má stejně buněk jako head. |

```json
{
  "type": "table",
  "head": [
    "",
    "čitatel",
    "jmenovatel"
  ],
  "rows": [
    [
      "3/4",
      "3",
      "4"
    ],
    [
      "5/8",
      "5",
      "8"
    ]
  ]
}
```

### `picture`

Obrázek složený z emoji.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `items` | seznam (text) ≥ 1 položek | ano | Emoji v řadě, např. ["🍎", "🍎", "➕", "🍐"]. |
| `caption` | text | – | Popisek pod obrázkem (čte ho i čtečka obrazovky). |

```json
{
  "type": "picture",
  "items": [
    "🍕",
    "🍕",
    "🍕",
    "⬜"
  ],
  "caption": "Tři čtvrtiny pizzy"
}
```

### `widget`

Interaktivní widget: název (viz galerie /widgety) a jeho vlastnosti.

Vlastnosti podle widgetu – viz [WIDGETY.md](WIDGETY.md).

```json
{
  "type": "widget",
  "widget": "fraction",
  "props": {
    "numerator": 3,
    "denominator": 4
  }
}
```

## Otázky (`questions[]`)

### `choice`

Výběr jedné ze 2–4 možností.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Otázka. |
| `options` | seznam (text) 2–4 položek | ano | 2–4 možnosti; aplikace je zamíchá. |
| `answer` | celé číslo ≥ 0 | ano | Pořadí správné možnosti v options, od 0. |
| `explanation` | text | – | Krátké vysvětlení správné odpovědi (ukáže se po odpovědi). |

```json
{
  "type": "choice",
  "question": "Který zlomek je největší?",
  "options": [
    "1/2",
    "1/3",
    "1/4"
  ],
  "answer": 0,
  "explanation": "Čím méně dílů, tím je každý větší."
}
```

### `truefalse`

Pravda, nebo nepravda.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Tvrzení. |
| `answer` | true / false | ano | true = pravda, false = nepravda. |
| `explanation` | text | – | Krátké vysvětlení správné odpovědi (ukáže se po odpovědi). |

```json
{
  "type": "truefalse",
  "question": "2/4 je totéž co 1/2.",
  "answer": true,
  "explanation": "Čitatel i jmenovatel jde vydělit dvěma."
}
```

### `input`

Napsaná krátká odpověď.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Otázka s krátkou odpovědí (číslo nebo slovo). |
| `answers` | seznam (text) ≥ 1 položek | ano | Všechny přijatelné odpovědi. Velikost písmen a mezery se ignorují, čísla se porovnávají jako čísla (0,5 = 0.5), diakritika se ignoruje mimo češtinu a literaturu. |
| `explanation` | text | – | Krátké vysvětlení správné odpovědi (ukáže se po odpovědi). |
| `widget` | objekt podle "widget" | – | Widget nad otázkou – ukáže jen zadání, ne výsledek. Smí jen widgety s režimem pro otázky (column). |

```json
{
  "type": "input",
  "question": "Vypočítej písemně: 345 + 278 =",
  "answers": [
    "623"
  ],
  "explanation": "Sčítej od jednotek, 1 si pamatuj.",
  "widget": {
    "widget": "column",
    "props": {
      "a": 345,
      "b": 278,
      "op": "+"
    }
  }
}
```

### `order`

Seřazení položek.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Zadání. |
| `items` | seznam (text) 3–8 položek | ano | Položky ve SPRÁVNÉM pořadí; aplikace je zamíchá. |
| `explanation` | text | – | Krátké vysvětlení správné odpovědi (ukáže se po odpovědi). |

```json
{
  "type": "order",
  "question": "Seřaď od nejmenšího.",
  "items": [
    "1/8",
    "1/4",
    "1/2",
    "1"
  ]
}
```

### `match`

Spojování dvojic.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Zadání. |
| `pairs` | seznam ([text, text]) 3–6 položek | ano | Správně spárované dvojice; aplikace zamíchá pravou stranu. |
| `explanation` | text | – | Krátké vysvětlení správné odpovědi (ukáže se po odpovědi). |

```json
{
  "type": "match",
  "question": "Spoj zlomek s desetinným číslem.",
  "pairs": [
    [
      "1/2",
      "0,5"
    ],
    [
      "1/4",
      "0,25"
    ],
    [
      "3/4",
      "0,75"
    ]
  ]
}
```

### `open`

Otázka pro ústní zkoušení; dítě odpoví nahlas a samo se ohodnotí.

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `question` | text | ano | Ústní otázka. |
| `answer` | text | ano | Vzorová odpověď v 1–3 větách. |

```json
{
  "type": "open",
  "question": "Vysvětli, co znamená jmenovatel.",
  "answer": "Jmenovatel je číslo pod zlomkovou čarou. Říká, na kolik stejných dílů je celek rozdělený."
}
```
