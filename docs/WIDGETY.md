# Widgety – reference

> Generováno z src/content/format.ts a src/widgets/ (npm run content:generate). Needitovat ručně.
> Galerie se živými ukázkami všech widgetů: [sprtam.cz/widgety](https://sprtam.cz/widgety) (lokálně http://localhost:5173/widgety).

Widget je interaktivní blok vysvětlení:

```json
{
  "type": "widget",
  "widget": "<název>",
  "props": {}
}
```

V řešeném příkladu (blok `example`) se widget ukáže spolu s řešením (`"widget": { "widget": …, "props": … }`), u otázky `input` jen zadání (jen widgety s režimem pro otázky).

Než vytvoříš nový widget, projdi tenhle seznam – nejspíš už existuje. Jak napsat nový: [CONTENT.md](CONTENT.md#nový-widget).

## Čísla a počítání

- [`counter`](#counter) – Počítadlo
- [`number-line`](#number-line) – Číselná osa
- [`place-value`](#place-value) – Stovky, desítky, jednotky
- [`column`](#column) – Písemné počítání pod sebou
- [`multiply`](#multiply) – Násobení v mřížce
- [`multiple-circle`](#multiple-circle) – Kruh násobků
- [`fraction`](#fraction) – Zlomek
- [`percent`](#percent) – Procenta
- [`clock`](#clock) – Hodiny

<a id="counter"></a>

### `counter` – Počítadlo

Řada obrázků (emoji); tlačítky + a − dítě přidává a ubírá a vidí, kolik jich je.

**Kdy ho použít:** Počítání do 20, sčítání a odčítání přidáváním a ubíráním, porovnávání v 1. třídě.

Živá ukázka: [/widgety/counter](https://sprtam.cz/widgety/counter)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `emoji` | text | ano | Co se počítá – jedno emoji, např. "🍎". |
| `start` | celé číslo 0–50 | – | Kolik věcí je vidět na začátku. Výchozí 3. |
| `max` | celé číslo 1–50 | – | Nejvíc věcí, kolik jde přidat. Výchozí 20. |

```json
{
  "type": "widget",
  "widget": "counter",
  "props": {
    "emoji": "🍎",
    "start": 3,
    "max": 10
  }
}
```

<a id="number-line"></a>

### `number-line` – Číselná osa

Osa s dílky a tečkou. Dítě tečku táhne (a vidí číslo), nebo s ní tlačítkem skáče o zadaný krok.

**Kdy ho použít:** Pořadí čísel, záporná čísla, desetinná čísla, zaokrouhlování; s hop sčítání a odčítání po skocích.

Živá ukázka: [/widgety/number-line](https://sprtam.cz/widgety/number-line)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `min` | číslo | ano | Číslo na levém konci osy. |
| `max` | číslo | ano | Číslo na pravém konci osy. |
| `step` | číslo ≥ 0.001 | – | Vzdálenost mezi dílky. Výchozí 1. Nejvýš 40 dílků: (max − min) / step ≤ 40. |
| `start` | číslo | – | Kde stojí tečka na začátku. Výchozí min. |
| `hop` | číslo | – | Délka skoku. Když je zadaný spolu se start, dítě tečku neposouvá, ale tlačítkem skáče od start o hop (záporný = doleva) – sčítání a odčítání na ose. |

```json
{
  "type": "widget",
  "widget": "number-line",
  "props": {
    "min": -5,
    "max": 5
  }
}
```

<a id="place-value"></a>

### `place-value` – Stovky, desítky, jednotky

Číslo rozložené na čtverce (stovky), tyčky (desítky) a kostičky (jednotky). Tlačítky + a − u každého řádu se číslo mění.

**Kdy ho použít:** Zápis čísel do 1000, řády, rozklad čísla, přechod přes desítku.

Živá ukázka: [/widgety/place-value](https://sprtam.cz/widgety/place-value)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `value` | celé číslo 0–999 | ano | Počáteční číslo (0–999). |

```json
{
  "type": "widget",
  "widget": "place-value",
  "props": {
    "value": 254
  }
}
```

<a id="column"></a>

### `column` – Písemné počítání pod sebou

Příklad zapsaný pod sebou jako v sešitě. Dítě jde tlačítkem krok za krokem, každý krok je okomentovaný („7 a kolik je 12? 5, 1 si pamatuji“).

**Kdy ho použít:** Písemné sčítání, odčítání, násobení a dělení; v příkladech (example) jako řešení, v otázkách (input) jako zadání.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/column](https://sprtam.cz/widgety/column)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `a` | číslo ≥ 0 \| text | ano | Číslo; jako text i s mezerami mezi řády nebo s desetinnou čárkou: 12500, "12 500", "3,75". |
| `b` | číslo ≥ 0 \| text | ano | Číslo; jako text i s mezerami mezi řády nebo s desetinnou čárkou: 12500, "12 500", "3,75". |
| `op` | "+" \| "-" \| "·" \| ":" | ano | Početní operace: "+" sčítání, "-" odčítání (doplňováním), "·" násobení (i víceciferným číslem), ":" dělení (jednociferným i víceciferným dělitelem). · a : jen s celými čísly. |

```json
{
  "type": "widget",
  "widget": "column",
  "props": {
    "a": 832,
    "b": 457,
    "op": "-"
  }
}
```

<a id="multiply"></a>

### `multiply` – Násobení v mřížce

Mřížka teček: obarvené tečky tvoří obdélník řádky × sloupce. Posuvníky mění oba činitele a výsledek se hned přepočítá.

**Kdy ho použít:** Malá násobilka, záměna činitelů, násobení jako opakované sčítání, obsah obdélníku ve čtverečcích.

Živá ukázka: [/widgety/multiply](https://sprtam.cz/widgety/multiply)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `rows` | celé číslo 1–12 | ano | Počet řádků teček na začátku (první činitel). |
| `columns` | celé číslo 1–12 | ano | Počet sloupců teček na začátku (druhý činitel). |
| `max` | celé číslo 2–12 | – | Velikost mřížky – nejvíc řádků i sloupců. Výchozí 10. |

```json
{
  "type": "widget",
  "widget": "multiply",
  "props": {
    "rows": 3,
    "columns": 4
  }
}
```

<a id="multiple-circle"></a>

### `multiple-circle` – Kruh násobků

Kruh s deseti body 0–9. Dítě po jednom přidává násobky a čára spojuje jejich poslední číslice; každá násobková řada nakreslí svůj obrazec (řada 3 hvězdu, řada 2 pětiúhelník).

**Kdy ho použít:** Násobilka a násobkové řady, rytmus násobků, souvislost řad (2 a 8, 3 a 7 kreslí stejný obrazec opačným směrem); typická pomůcka waldorfské školy.

Živá ukázka: [/widgety/multiple-circle](https://sprtam.cz/widgety/multiple-circle)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `number` | celé číslo 1–9 | ano | Které násobky se kreslí (násobková řada 1–9). Dítě ho může tlačítky změnit. |

```json
{
  "type": "widget",
  "widget": "multiple-circle",
  "props": {
    "number": 3
  }
}
```

<a id="fraction"></a>

### `fraction` – Zlomek

Koláč rozdělený na dílky s obarvenou částí a zlomkem pod ním. Dítě mění čitatel i jmenovatel a vidí krácení a desetinné číslo.

**Kdy ho použít:** Co je zlomek, porovnávání a krácení zlomků, smíšená čísla, převod na desetinné číslo.

Živá ukázka: [/widgety/fraction](https://sprtam.cz/widgety/fraction)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `numerator` | celé číslo 0–36 | ano | Čitatel – kolik dílků je obarvených. Smí být víc než jmenovatel (pak se ukáže víc celků), nejvýš 3× jmenovatel. |
| `denominator` | celé číslo 1–12 | ano | Jmenovatel – na kolik stejných dílů je celek rozdělený. |

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

<a id="percent"></a>

### `percent` – Procenta

Čtverec ze 100 políček; obarvená políčka jsou procenta. Posuvník mění počet procent a ukazuje desetinné číslo nebo část z celku.

**Kdy ho použít:** Co je procento, procenta jako setiny, výpočet části z celku.

Živá ukázka: [/widgety/percent](https://sprtam.cz/widgety/percent)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `percent` | celé číslo 0–100 | ano | Kolik procent je obarvených na začátku. |
| `of` | číslo ≥ 0 | – | Celek (základ). Když je zadaný, ukáže se i výsledek, např. 20 % z 300 = 60. |

```json
{
  "type": "widget",
  "widget": "percent",
  "props": {
    "percent": 25
  }
}
```

<a id="clock"></a>

### `clock` – Hodiny

Ručičkové hodiny. Dítě táhne velkou ručičku, malá jde s ní; pod ciferníkem je čas číslem i slovy (čtvrt, půl, tři čtvrtě).

**Kdy ho použít:** Čtení času na ručičkových hodinách, celé hodiny, čtvrt, půl, tři čtvrtě.

Živá ukázka: [/widgety/clock](https://sprtam.cz/widgety/clock)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `hours` | celé číslo 0–23 | ano | Hodiny na začátku (ciferník ukazuje 12 hodin, 15 = 3). |
| `minutes` | celé číslo 0–59 | ano | Minuty na začátku. Ručičkou jde nastavit po 5 minutách. |

```json
{
  "type": "widget",
  "widget": "clock",
  "props": {
    "hours": 3,
    "minutes": 30
  }
}
```

## Geometrie a funkce

- [`angle`](#angle) – Úhel
- [`shape`](#shape) – Obvod a obsah útvaru
- [`pythagoras`](#pythagoras) – Pythagorova věta
- [`balance`](#balance) – Rovnice jako váhy
- [`linear`](#linear) – Lineární funkce
- [`quadratic`](#quadratic) – Kvadratická funkce

<a id="angle"></a>

### `angle` – Úhel

Úhel se dvěma rameny; posuvníkem se otevírá po 5° a pod ním je velikost a druh úhlu (ostrý, pravý, tupý, přímý…).

**Kdy ho použít:** Druhy úhlů, měření úhlů, odhad velikosti úhlu.

Živá ukázka: [/widgety/angle](https://sprtam.cz/widgety/angle)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `degrees` | celé číslo 0–360 | ano | Velikost úhlu na začátku ve stupních. |

```json
{
  "type": "widget",
  "widget": "angle",
  "props": {
    "degrees": 40
  }
}
```

<a id="shape"></a>

### `shape` – Obvod a obsah útvaru

Čtverec, obdélník, trojúhelník nebo kruh se čtverečkovou sítí. Posuvníky mění rozměry; pod útvarem je výpočet obsahu S a obvodu o.

**Kdy ho použít:** Obvod a obsah čtverce, obdélníku, trojúhelníku a kruhu, jednotky obsahu.

Živá ukázka: [/widgety/shape](https://sprtam.cz/widgety/shape)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `shape` | "square" \| "rect" \| "triangle" \| "circle" | ano | Útvar: "square" čtverec, "rect" obdélník, "triangle" trojúhelník, "circle" kruh. |
| `a` | celé číslo 1–12 | – | Strana a (u trojúhelníku základna, u kruhu poloměr r, nejvýš 6). Výchozí 4. |
| `b` | celé číslo 1–10 | – | Strana b obdélníku nebo výška v trojúhelníku. Výchozí 3. |

```json
{
  "type": "widget",
  "widget": "shape",
  "props": {
    "shape": "rect",
    "a": 5,
    "b": 3
  }
}
```

<a id="pythagoras"></a>

### `pythagoras` – Pythagorova věta

Pravoúhlý trojúhelník se čtverci nad všemi stranami a jejich obsahy. Posuvníky mění odvěsny a ukazuje se c = √(a² + b²).

**Kdy ho použít:** Pythagorova věta, výpočet přepony, druhá mocnina a odmocnina v geometrii.

Živá ukázka: [/widgety/pythagoras](https://sprtam.cz/widgety/pythagoras)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `a` | celé číslo 1–12 | ano | Délka první odvěsny na začátku. |
| `b` | celé číslo 1–12 | ano | Délka druhé odvěsny na začátku. |

```json
{
  "type": "widget",
  "widget": "pythagoras",
  "props": {
    "a": 3,
    "b": 4
  }
}
```

<a id="balance"></a>

### `balance` – Rovnice jako váhy

Rovnice a · x + b = c na rovnoramenných vahách. Dítě tlačítky dělá stejnou úpravu na obou stranách, dokud nezůstane x = …

**Kdy ho použít:** Lineární rovnice, ekvivalentní úpravy („co udělám vlevo, udělám i vpravo“).

Živá ukázka: [/widgety/balance](https://sprtam.cz/widgety/balance)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `a` | číslo | ano | Kolikrát x je vlevo (a v rovnici a · x + b = c). Nesmí být 0. |
| `b` | číslo | ano | Číslo přičtené k x vlevo (b; záporné = odečtené). |
| `c` | číslo | ano | Číslo vpravo (c). |

```json
{
  "type": "widget",
  "widget": "balance",
  "props": {
    "a": 3,
    "b": 4,
    "c": 19
  }
}
```

<a id="linear"></a>

### `linear` – Lineární funkce

Graf přímky y = k · x + q v mřížce. Posuvníky k a q přímku naklánějí a posouvají; pod grafem je předpis a jestli roste, nebo klesá.

**Kdy ho použít:** Lineární funkce, přímá úměrnost (q = 0), význam k a q, rostoucí a klesající funkce.

Živá ukázka: [/widgety/linear](https://sprtam.cz/widgety/linear)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `k` | číslo -5–5 | ano | Směrnice k v y = k · x + q (po 0,5). |
| `q` | číslo -6–6 | ano | Posun q – kde přímka protne osu y. |

```json
{
  "type": "widget",
  "widget": "linear",
  "props": {
    "k": 2,
    "q": -1
  }
}
```

<a id="quadratic"></a>

### `quadratic` – Kvadratická funkce

Graf paraboly y = a · x² + b · x + c. Posuvníky mění koeficienty; pod grafem je diskriminant a kořeny.

**Kdy ho použít:** Kvadratická funkce, vliv koeficientů na parabolu, diskriminant a počet řešení kvadratické rovnice.

Živá ukázka: [/widgety/quadratic](https://sprtam.cz/widgety/quadratic)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `a` | číslo -3–3 | ano | Koeficient a u x² (po 0,5, nesmí být 0): kladné = parabola otevřená nahoru. |
| `b` | číslo -6–6 | ano | Koeficient b u x. |
| `c` | číslo -6–6 | ano | Absolutní člen c – kde parabola protne osu y. |

```json
{
  "type": "widget",
  "widget": "quadratic",
  "props": {
    "a": 1,
    "b": -2,
    "c": -3
  }
}
```

## Text, třídění a souvislosti

- [`flip`](#flip) – Otáčecí kartičky
- [`sort`](#sort) – Třídění do skupin
- [`gap`](#gap) – Doplňovačka
- [`parts`](#parts) – Stavba slova
- [`cycle`](#cycle) – Koloběh
- [`timeline`](#timeline) – Časová osa
- [`bars`](#bars) – Sloupcový graf

<a id="flip"></a>

### `flip` – Otáčecí kartičky

Kartičky s otázkou na líci; klepnutím se otočí a ukážou odpověď. Dítě si samo ověří, co ví.

**Kdy ho použít:** Pojmy a jejich význam, vzorce, data, překlady – cokoli ve dvojici „otázka → odpověď“.

Živá ukázka: [/widgety/flip](https://sprtam.cz/widgety/flip)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `cards` | seznam (objekt) 1–12 položek | ano | Karty. Ideálně 3–8. |
| `cards[].front` | text | ano | Líc – otázka, pojem nebo slovo. |
| `cards[].back` | text | ano | Rub – odpověď, která se ukáže po otočení. |

```json
{
  "type": "widget",
  "widget": "flip",
  "props": {
    "cards": [
      {
        "front": "b_dlit",
        "back": "b**y**dlit"
      },
      {
        "front": "b_k",
        "back": "b**ý**k"
      },
      {
        "front": "ob_čej",
        "back": "ob**y**čej"
      }
    ]
  }
}
```

<a id="sort"></a>

### `sort` – Třídění do skupin

Zamíchané kartičky a 2–4 krabičky. Dítě vybere kartičku a pak krabičku; špatná volba zatřese, správná kartičku uloží.

**Kdy ho použít:** Rozlišování a třídění: slovní druhy, živé × neživé, kov × nekov, sudá × lichá čísla…

Živá ukázka: [/widgety/sort](https://sprtam.cz/widgety/sort)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `groups` | seznam (text) 2–4 položek | ano | Názvy skupin (krabiček), do kterých se třídí. |
| `items` | seznam (objekt) 2–14 položek | ano | Položky; zobrazí se zamíchané. Ideálně 6–10. |
| `items[].text` | text | ano | Co se třídí. |
| `items[].group` | celé číslo ≥ 0 | ano | Pořadí správné skupiny v groups, od 0. |

```json
{
  "type": "widget",
  "widget": "sort",
  "props": {
    "groups": [
      "živé",
      "neživé"
    ],
    "items": [
      {
        "text": "pes",
        "group": 0
      },
      {
        "text": "kámen",
        "group": 1
      },
      {
        "text": "strom",
        "group": 0
      },
      {
        "text": "auto",
        "group": 1
      }
    ]
  }
}
```

<a id="gap"></a>

### `gap` – Doplňovačka

Věty nebo slova s mezerou; dítě klepne na správnou možnost a mezera se doplní. Špatná možnost zatřese.

**Kdy ho použít:** Pravopis (i/y, s/z, mě/mně…), koncovky, správný tvar slova, doplnění čísla do vzorce.

Živá ukázka: [/widgety/gap](https://sprtam.cz/widgety/gap)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `items` | seznam (objekt) 1–8 položek | ano | Řádky k doplnění. Ideálně 3–6. |
| `items[].before` | text | ano | Text před mezerou (smí být prázdný). |
| `items[].after` | text | ano | Text za mezerou (smí být prázdný). |
| `items[].options` | seznam (text) 2–4 položek | ano | Možnosti k doplnění, např. ["i", "y"]. |
| `items[].answer` | celé číslo ≥ 0 | ano | Pořadí správné možnosti v options, od 0. |

```json
{
  "type": "widget",
  "widget": "gap",
  "props": {
    "items": [
      {
        "before": "b",
        "after": "dlit",
        "options": [
          "i",
          "y"
        ],
        "answer": 1
      },
      {
        "before": "p",
        "after": "vo",
        "options": [
          "i",
          "y"
        ],
        "answer": 0
      }
    ]
  }
}
```

<a id="parts"></a>

### `parts` – Stavba slova

Slova rozdělená na barevné části; klepnutím se ukážou jejich názvy (předpona, kořen, přípona, koncovka…).

**Kdy ho použít:** Stavba slova, slovotvorba, kořen a odvozená slova; i chemické vzorce nebo složená slova rozdělená na části.

Živá ukázka: [/widgety/parts](https://sprtam.cz/widgety/parts)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `words` | seznam (objekt) 1–5 položek | ano | Slova. Ideálně 1–3. |
| `words[].parts` | seznam (objekt) 1–8 položek | ano | Části slova zleva doprava; dohromady dají celé slovo. |
| `words[].parts[].text` | text | ano | Část slova, např. "pod". |
| `words[].parts[].label` | text | ano | Název části, např. "předpona". Stejné názvy mají stejnou barvu. |

```json
{
  "type": "widget",
  "widget": "parts",
  "props": {
    "words": [
      {
        "parts": [
          {
            "text": "pod",
            "label": "předpona"
          },
          {
            "text": "stav",
            "label": "kořen"
          },
          {
            "text": "ec",
            "label": "přípona"
          }
        ]
      }
    ]
  }
}
```

<a id="cycle"></a>

### `cycle` – Koloběh

Kroky v kruhu, které se samy postupně zvýrazňují; šipkami nebo klepnutím jde dítě krok po kroku.

**Kdy ho použít:** Děje, které se opakují dokola: koloběh vody, roční období, životní cyklus, oběh látek.

Živá ukázka: [/widgety/cycle](https://sprtam.cz/widgety/cycle)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `steps` | seznam (text) 2–8 položek | ano | Kroky koloběhu v pořadí; po posledním následuje zase první. Ideálně 3–6, krátce. |

```json
{
  "type": "widget",
  "widget": "cycle",
  "props": {
    "steps": [
      "Voda se vypaří",
      "Pára vytvoří mraky",
      "Prší nebo sněží",
      "Voda steče do řek a moří"
    ]
  }
}
```

<a id="timeline"></a>

### `timeline` – Časová osa

Vodorovná osa s událostmi seřazenými podle roku; klepnutím se událost zvýrazní.

**Kdy ho použít:** Dějepis, literatura, vývoj vědy – pořadí a odstup událostí v čase.

Živá ukázka: [/widgety/timeline](https://sprtam.cz/widgety/timeline)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `events` | seznam (objekt) 2–12 položek | ano | Události; seřadí se samy podle roku. Ideálně 3–8. |
| `events[].year` | celé číslo | ano | Rok; záporný = před naším letopočtem (−753 = 753 př. n. l.). |
| `events[].label` | text | ano | Co se stalo (krátce, smí obsahovat **tučné**). |

```json
{
  "type": "widget",
  "widget": "timeline",
  "props": {
    "events": [
      {
        "year": 935,
        "label": "Zavraždění **sv. Václava**"
      },
      {
        "year": 1212,
        "label": "Zlatá bula sicilská"
      },
      {
        "year": 1306,
        "label": "Vymření Přemyslovců po meči"
      }
    ]
  }
}
```

<a id="bars"></a>

### `bars` – Sloupcový graf

Vodorovné pruhy, jejichž délka odpovídá hodnotě; pruhy při zobrazení vyrostou.

**Kdy ho použít:** Porovnání čísel: počty obyvatel, rozlohy, teploty, výsledky měření, statistika.

Živá ukázka: [/widgety/bars](https://sprtam.cz/widgety/bars)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `unit` | text | – | Jednotka za hodnotou, např. "mil. obyvatel" nebo "°C". |
| `items` | seznam (objekt) 2–12 položek | ano | Porovnávané hodnoty. Ideálně 3–8. |
| `items[].label` | text | ano | Popisek sloupce. |
| `items[].value` | číslo | ano | Hodnota; délka pruhu je poměrná k největší hodnotě. |

```json
{
  "type": "widget",
  "widget": "bars",
  "props": {
    "unit": "tis. obyvatel",
    "items": [
      {
        "label": "Praha",
        "value": 1384
      },
      {
        "label": "Brno",
        "value": 402
      },
      {
        "label": "Ostrava",
        "value": 284
      }
    ]
  }
}
```
