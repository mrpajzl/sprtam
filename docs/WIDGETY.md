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
- [`coins`](#coins) – Peníze
- [`units`](#units) – Převody jednotek
- [`prime-sieve`](#prime-sieve) – Eratosthenovo síto
- [`dice`](#dice) – Pravděpodobnost: kostka a mince
- [`stats`](#stats) – Průměr, medián, modus

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

<a id="coins"></a>

### `coins` – Peníze

České mince a bankovky jako obrázky. Dítě je klepnutím pokládá na stůl a bere zpět, vidí součet. Se zadanou částkou ji má složit; tlačítko „Nejméně kusů“ ukáže řešení s co nejmenším počtem mincí a bankovek.

**Kdy ho použít:** Počítání s penězi v 1.–3. třídě, sčítání do 20, 100 a 1000, rozklad čísla, placení a vracení; v otázkách (input) hromádka peněz „Kolik je to korun?“.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/coins](https://sprtam.cz/widgety/coins)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `target` | celé číslo 1–10000 | – | Cílová částka v Kč, kterou má dítě složit. Bez ní se mince jen volně sčítají. |
| `values` | seznam (celé číslo 1–5000) 1–12 položek | – | Které mince a bankovky má dítě k dispozici (hodnoty v Kč: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000). Bez toho všechny do max. |
| `max` | celé číslo 1–5000 | – | Nejvyšší mince nebo bankovka, např. 20 pro 1. třídu (jen když není values). Výchozí 5000. |
| `pile` | seznam (celé číslo 1–5000) 1–30 položek | – | Mince a bankovky, které už leží na stole (hodnoty v Kč). V otázce je to hromádka, kterou má dítě sečíst. |

```json
{
  "type": "widget",
  "widget": "coins",
  "props": {
    "values": [
      1,
      2,
      5,
      10,
      20,
      50
    ],
    "pile": [
      20,
      10,
      5,
      2,
      1
    ]
  }
}
```

<a id="units"></a>

### `units` – Převody jednotek

Žebřík jednotek od největší po nejmenší. Dítě napíše číslo, vybere jeho jednotku a klepne na cílovou jednotku; vidí výsledek, čím násobilo nebo dělilo a o kolik míst se posunula desetinná čárka.

**Kdy ho použít:** Převody jednotek délky, hmotnosti, objemu, obsahu a času (3.–7. třída), desetinná čísla a násobení a dělení 10, 100, 1000; v otázkách (input) zadání převodu „2,5 m = ? cm“.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/units](https://sprtam.cz/widgety/units)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `quantity` | "length" \| "mass" \| "volume" \| "area" \| "time" | ano | Veličina: "length" délka (mm–km), "mass" hmotnost (mg–t), "volume" objem (ml–hl, cm³–m³), "area" obsah (mm²–km², a, ha), "time" čas (s, min, h, den). |
| `value` | číslo 0–1000000000 | – | Číslo na začátku, např. 2.5. Výchozí 1. |
| `from` | "km" \| "m" \| "dm" \| "cm" \| "mm" \| "t" \| "kg" \| "dag" \| "g" \| "mg" \| "m³" \| "hl" \| "l" \| "dm³" \| "dl" \| "cl" \| "ml" \| "cm³" \| "km²" \| "ha" \| "a" \| "m²" \| "dm²" \| "cm²" \| "mm²" \| "den" \| "h" \| "min" \| "s" | – | Jednotka zadaného čísla, např. "m". Výchozí m, kg, l, m² nebo h. |
| `to` | "km" \| "m" \| "dm" \| "cm" \| "mm" \| "t" \| "kg" \| "dag" \| "g" \| "mg" \| "m³" \| "hl" \| "l" \| "dm³" \| "dl" \| "cl" \| "ml" \| "cm³" \| "km²" \| "ha" \| "a" \| "m²" \| "dm²" \| "cm²" \| "mm²" \| "den" \| "h" \| "min" \| "s" | – | Cílová jednotka, na kterou se převádí, např. "cm". V otázce povinná. |
| `units` | seznam ("km" \| "m" \| "dm" \| "cm" \| "mm" \| "t" \| "kg" \| "dag" \| "g" \| "mg" \| "m³" \| "hl" \| "l" \| "dm³" \| "dl" \| "cl" \| "ml" \| "cm³" \| "km²" \| "ha" \| "a" \| "m²" \| "dm²" \| "cm²" \| "mm²" \| "den" \| "h" \| "min" \| "s") 2–8 položek | – | Jen tyto jednotky na žebříku, např. ["mm", "cm", "dm", "m"] pro 3. třídu. Bez toho všechny jednotky veličiny. |

```json
{
  "type": "widget",
  "widget": "units",
  "props": {
    "quantity": "length",
    "value": 2.5,
    "from": "m",
    "to": "cm"
  }
}
```

<a id="prime-sieve"></a>

### `prime-sieve` – Eratosthenovo síto

Tabulka čísel 1…n. V sítu dítě postupně škrtá násobky 2, 3, 5, 7… (tlačítkem nebo klepnutím) a zbydou prvočísla. V režimu násobků klepnutím vybarví násobky jednoho nebo dvou čísel a vidí společné násobky, nejmenší společný násobek i největšího společného dělitele.

**Kdy ho použít:** Prvočísla a čísla složená, násobky a dělitelé, znaky dělitelnosti, nejmenší společný násobek a největší společný dělitel (6.–7. třída).

Živá ukázka: [/widgety/prime-sieve](https://sprtam.cz/widgety/prime-sieve)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `n` | celé číslo 10–200 | ano | Do kolika jsou čísla v tabulce (10–200). Pro síto se hodí 100. |
| `mode` | "sieve" \| "multiples" | – | "sieve" Eratosthenovo síto (výchozí), "multiples" násobky a dělitelnost (NSN, NSD). |
| `marked` | seznam (celé číslo 1–200) 1–2 položek | – | Jen pro "multiples": jedno nebo dvě čísla, jejichž násobky jsou na začátku vybarvené, např. [4, 6]. |

```json
{
  "type": "widget",
  "widget": "prime-sieve",
  "props": {
    "n": 100
  }
}
```

<a id="dice"></a>

### `dice` – Pravděpodobnost: kostka a mince

Hod mincí, kostkou nebo dvěma kostkami po 1, 10 nebo 100 hodech. Pruhový graf relativních četností stojí vedle teoretické pravděpodobnosti, takže dítě vidí, jak se s počtem hodů četnost blíží teorii.

**Kdy ho použít:** Pravděpodobnost a statistika: náhodný pokus, jev, relativní četnost, klasická pravděpodobnost (příznivé ÷ všechny možnosti), součet dvou kostek, zákon velkých čísel.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/dice](https://sprtam.cz/widgety/dice)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `mode` | "coin" \| "die" \| "two-dice" | ano | Pokus: coin = hod mincí (výsledek 1 = panna, 2 = orel), die = hod jednou kostkou (1–6), two-dice = hod dvěma kostkami, sleduje se součet (2–12). |
| `event` | objekt | – | Zvýrazněný jev (nepovinné): jeho sloupce se obarví a ukáže se jeho pravděpodobnost i to, jak se k ní blíží relativní četnost. |
| `event.label` | text | ano | Jev slovy, jak ho dítě uvidí, např. „padne 6“, „sudé číslo“, „součet 7“. |
| `event.outcomes` | seznam (celé číslo 1–12) 1–11 položek | ano | Výsledky, které jev tvoří: u mince 1 = panna, 2 = orel; u kostky čísla 1–6; u dvou kostek součty 2–12. Např. sudé číslo = [2, 4, 6]. |

```json
{
  "type": "widget",
  "widget": "dice",
  "props": {
    "mode": "coin",
    "event": {
      "label": "padne panna",
      "outcomes": [
        1
      ]
    }
  }
}
```

<a id="stats"></a>

### `stats` – Průměr, medián, modus

Řada hodnot jako sloupečky. Dítě hodnoty přidává, ubírá a mění a průběžně vidí aritmetický průměr (součet ÷ počet), medián v seřazené řadě, modus a rozpětí. Volitelně ukáže, jak odlehlá hodnota pohne průměrem, ale skoro ne mediánem.

**Kdy ho použít:** Statistika: aritmetický průměr, medián, modus, rozpětí, seřazení dat, vliv odlehlé hodnoty; známky, teploty, ceny, naměřená data.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/stats](https://sprtam.cz/widgety/stats)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `values` | seznam (číslo) 1–15 položek | ano | Hodnoty v pořadí, jak byly naměřené (např. známky z písemky). 1–15 hodnot, všechny mezi min a max. |
| `label` | text | – | Co hodnoty znamenají, např. „Známky z písemky“ nebo „Teplota v poledne“. |
| `unit` | text | – | Jednotka za číslem, např. „°C“, „Kč“, „cm“. U známek vynech. |
| `min` | číslo -1000–1000 | ano | Nejmenší hodnota, kterou jde nastavit (spodek grafu). |
| `max` | číslo -1000–10000 | ano | Největší hodnota, kterou jde nastavit (vršek grafu). |
| `step` | číslo 0.1–1000 | – | O kolik mění hodnotu tlačítka − a +. Výchozí 1. |
| `outlier` | true / false | – | Ukázat tlačítko „odlehlá hodnota“: přidá extrém (min nebo max) a ukáže, že průměr se pohne hodně, medián málo. |
| `ask` | "mean" \| "median" \| "mode" \| "range" | – | Jen pro otázku typu input: co má dítě spočítat (mean = průměr, median = medián, mode = modus, range = rozpětí). Kontrola ověří, že výsledek je mezi odpověďmi. |

```json
{
  "type": "widget",
  "widget": "stats",
  "props": {
    "values": [
      1,
      2,
      2,
      3,
      1,
      4,
      2
    ],
    "label": "Známky z písemky",
    "min": 1,
    "max": 5
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
- [`coordinates`](#coordinates) – Souřadnice v rovině
- [`circle`](#circle) – Kruh a kružnice
- [`cuboid`](#cuboid) – Kvádr a krychle
- [`functions`](#functions) – Graf funkce
- [`unit-circle`](#unit-circle) – Jednotková kružnice

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

<a id="coordinates"></a>

### `coordinates` – Souřadnice v rovině

Mřížka s osami x a y a kvadranty I–IV. Dítě buď hledá bod podle souřadnic (klepnutím nebo šipkami) a dostane zpětnou vazbu, nebo klepe na body a čte jejich souřadnice. Body se dají spojit do mnohoúhelníku a zrcadlit podle osy x nebo y.

**Kdy ho použít:** Pravoúhlá soustava souřadnic, zápis bodu [x; y], kvadranty, osová souměrnost v soustavě souřadnic, mnohoúhelník zadaný vrcholy.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/coordinates](https://sprtam.cz/widgety/coordinates)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `mode` | "find" \| "read" | ano | Režim: "find" – dítě hledá body podle souřadnic (klepnutím do mřížky nebo šipkami), "read" – body jsou v mřížce a souřadnice se ukážou po klepnutí. |
| `points` | seznam (objekt) 1–8 položek | ano | Body v pořadí, v jakém se hledají a spojují. V otázce (Question) se ptá na první bod. |
| `points[].name` | text | – | Písmeno bodu (A–Z). Bez něj se body pojmenují A, B, C… podle pořadí. |
| `points[].x` | celé číslo -10–10 | ano | Souřadnice x (vodorovně, kladná doprava). |
| `points[].y` | celé číslo -10–10 | ano | Souřadnice y (svisle, kladná nahoru). |
| `n` | celé číslo 5–10 | – | Velikost mřížky: osy jdou od −n do n. Výchozí 6. |
| `polygon` | true / false | – | Spojit body v pořadí do mnohoúhelníku (aspoň 3 body). |
| `mirror` | "x" \| "y" | – | Osová souměrnost podle osy "x" nebo "y": ukáže i obrazy bodů A′, B′… V režimu "find" dítě hledá obrazy, v otázce se ptá na obraz prvního bodu. |

```json
{
  "type": "widget",
  "widget": "coordinates",
  "props": {
    "mode": "find",
    "points": [
      {
        "x": 3,
        "y": -2
      },
      {
        "x": -4,
        "y": 1
      }
    ]
  }
}
```

<a id="circle"></a>

### `circle` – Kruh a kružnice

Kruh s poloměrem a průměrem a pod ním výpočet průměru, obvodu o = 2πr a obsahu S = πr² s dosazením. Posuvníkem se mění r nebo d, π jde dosadit jako 3,14 nebo nechat přesně. V režimu „Odvaluj“ se kružnice odvalí po přímce a ukáže, že obvod je asi 3,14 průměru. Volitelně kruhová výseč s obsahem a délkou oblouku.

**Kdy ho použít:** Kruh a kružnice, poloměr a průměr, obvod a obsah kruhu, číslo π, kruhová výseč a délka oblouku.

Živá ukázka: [/widgety/circle](https://sprtam.cz/widgety/circle)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `r` | číslo 0.5–100 | ano | Poloměr na začátku. Do max 20 po půlkách (2,5), jinak celé číslo. |
| `max` | celé číslo 2–100 | – | Největší poloměr na posuvníku. Výchozí 10. |
| `unit` | "mm" \| "cm" \| "dm" \| "m" \| "km" | – | Jednotka délky. Výchozí "cm". |
| `input` | "r" \| "d" | – | Co dítě zadává posuvníkem na začátku: "r" poloměr, nebo "d" průměr. Dá se přepnout. Výchozí "r". |
| `pi` | "3.14" \| "exact" | – | Jak počítat s π na začátku: "3.14" – dosadit π ≈ 3,14, "exact" – nechat π ve výsledku (6π cm ≈ 18,85 cm). Dá se přepnout. Výchozí "3.14". |
| `roll` | true / false | – | Začít v režimu „odvaluj“: kružnice se odvalí po přímce a ukáže, že obvod je asi 3,14 průměru. |
| `sector` | celé číslo 1–359 | – | Kruhová výseč s tímto středovým úhlem α ve stupních: ukáže její obsah a délku oblouku, α jde měnit posuvníkem (SŠ). |

```json
{
  "type": "widget",
  "widget": "circle",
  "props": {
    "r": 3
  }
}
```

<a id="cuboid"></a>

### `cuboid` – Kvádr a krychle

Kvádr z krychliček a × b × c, který se po vrstvách naplní. Posuvníky mění rozměry, pod ním je objem V = a · b · c (počet krychliček) a povrch S = 2(ab + bc + ac). Přepínač „Síť“ kvádr rozloží do sítě s barevnými dvojicemi stěn.

**Kdy ho použít:** Objem a povrch kvádru a krychle, síť kvádru, jednotky objemu (cm³, m³) a obsahu, krychle jako zvláštní kvádr.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/cuboid](https://sprtam.cz/widgety/cuboid)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `a` | celé číslo 1–10 | ano | Délka a (počet krychliček zleva doprava vpředu). |
| `b` | celé číslo 1–10 | ano | Šířka b (počet krychliček dozadu). |
| `c` | celé číslo 1–10 | ano | Výška c (počet vrstev). |
| `cube` | true / false | – | Krychle: jeden posuvník pro hranu a, vzorce V = a³ a S = 6a². Pak musí být a = b = c. |
| `unit` | "mm" \| "cm" \| "dm" \| "m" | – | Jednotka délky (V vyjde v cm³, S v cm²…). Bez ní se počítají krychličky a čtverečky. |
| `net` | true / false | – | Začít zobrazením sítě kvádru místo krychliček. |
| `ask` | "volume" \| "surface" | – | Na co se ptá otázka s tímto widgetem: "volume" objem, "surface" povrch. Výchozí "volume". |

```json
{
  "type": "widget",
  "widget": "cuboid",
  "props": {
    "a": 4,
    "b": 3,
    "c": 2
  }
}
```

<a id="functions"></a>

### `functions` – Graf funkce

Graf nepřímé úměrnosti, absolutní hodnoty, odmocniny, exponenciální, logaritmické a goniometrických funkcí. Dítě posuvníky mění parametry a, b, c; pod grafem je předpis s dosazenými čísly a vlastnosti: definiční obor, obor hodnot, průsečíky s osami, monotonie, perioda a asymptoty.

**Kdy ho použít:** Nepřímá úměrnost (9. třída), funkce na SŠ: absolutní hodnota, odmocnina, exponenciální a logaritmická funkce, sinus, kosinus, tangens; vliv parametrů na graf a vlastnosti funkcí. Lineární a kvadratická funkce mají vlastní widgety linear a quadratic.

Živá ukázka: [/widgety/functions](https://sprtam.cz/widgety/functions)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `type` | "reciprocal" \| "abs" \| "sqrt" \| "exp" \| "log" \| "sin" \| "cos" \| "tan" | ano | Funkce: "reciprocal" nepřímá úměrnost y = a/(x − b) + c, "abs" absolutní hodnota y = a\|x − b\| + c, "sqrt" odmocnina y = a√(x − b) + c, "exp" exponenciální y = a^(x − b) + c, "log" logaritmická y = logₐ(x − b) + c, "sin"/"cos"/"tan" goniometrická y = a sin(bx) + c (tan = tg). |
| `a` | číslo -6–6 | – | Parametr a. Exponenciální a logaritmická: základ 0,25–4 po 0,25, ne 1. Nepřímá úměrnost: −6 až 6 po 0,5. Ostatní: −3 až 3 po 0,5. Nesmí být 0. |
| `b` | číslo -4–4 | – | Parametr b. Goniometrické: číslo u x (0,5–3 po 0,5, mění periodu). Ostatní: posun doprava (celé číslo −4 až 4). |
| `c` | číslo -4–4 | – | Parametr c: posun nahoru (celé číslo −4 až 4). |
| `choices` | seznam ("reciprocal" \| "abs" \| "sqrt" \| "exp" \| "log" \| "sin" \| "cos" \| "tan") 2–8 položek | – | Mezi kterými funkcemi může dítě přepínat (tlačítka nad grafem). Bez toho jen „type“. |

```json
{
  "type": "widget",
  "widget": "functions",
  "props": {
    "type": "reciprocal",
    "a": 6
  }
}
```

<a id="unit-circle"></a>

### `unit-circle` – Jednotková kružnice

Bod P na jednotkové kružnici pod úhlem α (posuvník po 5°, stupně nebo radiány). Sin α je svislá a cos α vodorovná úsečka, pod tím hodnoty sin, cos a tg, kvadrant se znaménky a u význačných úhlů přesné hodnoty (½, √2/2, √3/2). Volitelně se vedle kreslí sinusoida.

**Kdy ho použít:** Goniometrie na SŠ: definice sin a cos na jednotkové kružnici, znaménka v kvadrantech, hodnoty význačných úhlů, oblouková míra, graf funkce sinus a její periodicita.

Živá ukázka: [/widgety/unit-circle](https://sprtam.cz/widgety/unit-circle)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `angle` | celé číslo 0–360 | ano | Úhel α na začátku ve stupních, násobek 5 (posuvník jde po 5°). |
| `radians` | true / false | – | Začít v obloukové míře (radiány: π/6, π/4…) místo stupňů. Přepnout jde i v pomůcce. |
| `graph` | true / false | – | Hned ukázat vedle kružnice graf funkce sin (sinusoidu), který se kreslí, jak bod obíhá. Zapnout jde i v pomůcce. |

```json
{
  "type": "widget",
  "widget": "unit-circle",
  "props": {
    "angle": 30
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
- [`document`](#document) – Ukázkový text
- [`memory`](#memory) – Pexeso
- [`sentence`](#sentence) – Rozbor věty

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

<a id="document"></a>

### `document` – Ukázkový text

Dopis, e-mail, SMS, báseň nebo úryvek se zachovanými řádky. „Ukaž části“ barevně orámuje části textu (oslovení, sdělení, podpis, sloky) a klepnutí na část ukáže, proč tam je a jak se píše.

**Kdy ho použít:** Slohová výchova (dopis, žádost, e-mail, SMS, pozvánka, inzerát, životopis, vypravování), literatura (básně a sloky, úryvky), cizí jazyky (dopis a e-mail v angličtině či němčině).

Živá ukázka: [/widgety/document](https://sprtam.cz/widgety/document)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `kind` | "letter" \| "email" \| "sms" \| "poem" \| "book" | ano | Vzhled: "letter" = papír (dopis, žádost, pozvánka, inzerát, životopis), "email" = e-mail s hlavičkou Od/Komu/Předmět, "sms" = bublina zprávy, "poem" = báseň se slokami, "book" = úryvek z knihy (každý řádek je odstavec s odsazeným začátkem). |
| `title` | text | – | Nadpis nad textem, např. „Žádost o uvolnění z vyučování“ nebo název básně. |
| `from` | text | – | Odesílatel: u e-mailu řádek „Od“, u SMS jméno kontaktu nad bublinou, u básně a knihy autor. |
| `to` | text | – | Jen u e-mailu: řádek „Komu“. |
| `subject` | text | – | Jen u e-mailu: řádek „Předmět“. |
| `parts` | seznam (objekt) 1–12 položek | ano | Části textu odshora dolů. Stejné názvy mají stejnou barvu. |
| `parts[].label` | text | ano | Název části, např. „oslovení“, „vlastní sdělení“, „podpis“, „1. sloka“. |
| `parts[].lines` | seznam (text) 1–20 položek | ano | Řádky textu (u básně verše). Prázdný řádek "" = mezera mezi odstavci. Smí obsahovat **tučně**, *kurzívu*. |
| `parts[].note` | text | – | Poznámka po klepnutí: proč tu část je a jak se píše. |
| `parts[].align` | "left" \| "center" \| "right" | – | Zarovnání části, např. "right" pro místo a datum nebo podpis. Bez něj podle druhu textu. |

```json
{
  "type": "widget",
  "widget": "document",
  "props": {
    "kind": "letter",
    "title": "Omluva z vyučování",
    "parts": [
      {
        "label": "místo a datum",
        "align": "right",
        "lines": [
          "V Brně 12. května 2026"
        ],
        "note": "Píše se vpravo nahoře. Za předložkou „V“ následuje místo, pak datum – měsíc slovem nebo číslem."
      },
      {
        "label": "oslovení",
        "lines": [
          "Vážená paní učitelko,"
        ],
        "note": "Za oslovením je **čárka** a další řádek začíná **malým písmenem**. Oslovení je v 5. pádě."
      },
      {
        "label": "vlastní sdělení",
        "lines": [
          "omlouvám svou dceru Janu Novákovou ze 4. B",
          "za nepřítomnost ve škole ve dnech 9. a 10. května.",
          "Jana měla horečku a musela zůstat doma."
        ],
        "note": "Hlavní část: **co** a **proč**. Krátce, věcně a v celých větách."
      },
      {
        "label": "závěr",
        "lines": [
          "Děkuji za pochopení.",
          "",
          "S pozdravem"
        ],
        "note": "Poděkování a pozdrav. Za „S pozdravem“ se čárka nepíše."
      },
      {
        "label": "podpis",
        "align": "right",
        "lines": [
          "Petra Nováková"
        ],
        "note": "Celé jméno toho, kdo píše. U omluvenky podepisuje rodič."
      }
    ]
  }
}
```

<a id="memory"></a>

### `memory` – Pexeso

Zamíchané karty rubem nahoru. Dítě otáčí po dvou a hledá dvojice (pojem – význam, slovo – překlad…). Shodné zůstanou otočené, neshodné se otočí zpět. Počítá tahy.

**Kdy ho použít:** Opakování dvojic hrou: pojmy a významy, slovíčka a překlady, prvky a značky, vzorce a názvy, emoji a slova, autor a dílo, země a hlavní město.

Živá ukázka: [/widgety/memory](https://sprtam.cz/widgety/memory)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `pairs` | seznam (objekt) 3–10 položek | ano | Dvojice karet. Všech 2 × N karet musí mít různý text. Ideálně 4–8 dvojic, krátké texty (do ~20 znaků). |
| `pairs[].a` | text | ano | První karta dvojice, např. pojem, slovo, vzorec nebo emoji. |
| `pairs[].b` | text | ano | Druhá karta dvojice, např. význam, překlad, název nebo značka. |

```json
{
  "type": "widget",
  "widget": "memory",
  "props": {
    "pairs": [
      {
        "a": "🐶",
        "b": "dog"
      },
      {
        "a": "🐱",
        "b": "cat"
      },
      {
        "a": "🐟",
        "b": "fish"
      },
      {
        "a": "🐦",
        "b": "bird"
      },
      {
        "a": "🐴",
        "b": "horse"
      },
      {
        "a": "🐮",
        "b": "cow"
      }
    ]
  }
}
```

<a id="sentence"></a>

### `sentence` – Rozbor věty

Věta rozdělená na slova. Dítě vybere kategorii (podmět, přísudek…, slovní druh nebo pád) a klepe na slova: správně se obarví, špatně zatřese a ukáže nápovědu. Na konci barevná věta s legendou a skladebními dvojicemi.

**Kdy ho použít:** Čeština 3.–9. třída: větné členy, slovní druhy, pády, skladební dvojice; s vlastními kategoriemi i vlastní jména, vyjmenovaná slova, druhy vět nebo slovní druhy v cizím jazyce.

Živá ukázka: [/widgety/sentence](https://sprtam.cz/widgety/sentence)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `set` | "clauses" \| "pos" \| "cases" \| "custom" | ano | Sada kategorií: "clauses" = větné členy (Po, Př, Pt, Pu, Pk, Dop), "pos" = slovní druhy 1–10, "cases" = pády 1–7, "custom" = vlastní seznam v categories. |
| `categories` | seznam (objekt) 2–10 položek | – | Jen pro set "custom": vlastní kategorie. |
| `categories[].name` | text | ano | Název kategorie, např. „vlastní jméno“. |
| `categories[].short` | text | – | Zkratka pod slovem, např. „VJ“. Bez ní se použije název. |
| `categories[].hint` | text | – | Nápověda, když dítě kategorii použije špatně, např. „Vlastní jména píšeme s velkým písmenem.“ |
| `words` | seznam (objekt) 2–30 položek | ano | Slova věty zleva doprava. |
| `words[].text` | text | ano | Slovo nebo úsek věty (např. „do školy“). Interpunkci připoj ke slovu („lesa.“). |
| `words[].cat` | text | – | Správná kategorie: název („podmět“, „sloveso“, „3. pád“) nebo zkratka („Po“; u slovních druhů číslo 1–10, u pádů 1–7). Bez cat se slovo neurčuje (např. předložka u větných členů). |
| `words[].hint` | text | – | Vlastní nápověda k tomuto slovu, když ho dítě zařadí špatně. |
| `words[].head` | celé číslo 0–29 | – | Pořadí řídícího slova ve words (od 0). Ukáže skladební dvojici, např. přívlastek → podstatné jméno, které rozvíjí. |
| `words[].ask` | text | – | Otázka od řídícího slova k tomuto, např. „jaký?“, „kdy?“. Jen spolu s head. |

```json
{
  "type": "widget",
  "widget": "sentence",
  "props": {
    "set": "clauses",
    "words": [
      {
        "text": "Malý",
        "cat": "Pk",
        "head": 1,
        "ask": "jaký?"
      },
      {
        "text": "Honzík",
        "cat": "Po"
      },
      {
        "text": "včera",
        "cat": "Pu",
        "head": 3,
        "ask": "kdy?"
      },
      {
        "text": "přinesl",
        "cat": "Př"
      },
      {
        "text": "mamince",
        "cat": "Pt",
        "head": 3,
        "ask": "komu?"
      },
      {
        "text": "do nemocnice",
        "cat": "Pu",
        "head": 3,
        "ask": "kam?"
      },
      {
        "text": "krásnou",
        "cat": "Pk",
        "head": 7,
        "ask": "jakou?"
      },
      {
        "text": "kytici.",
        "cat": "Pt",
        "head": 3,
        "ask": "co?"
      }
    ]
  }
}
```

## Fyzika a chemie

- [`circuit`](#circuit) – Elektrický obvod
- [`lever`](#lever) – Páka a momenty sil
- [`periodic`](#periodic) – Periodická tabulka
- [`chem-equation`](#chem-equation) – Vyčíslení chemické rovnice
- [`ph`](#ph) – Stupnice pH

<a id="circuit"></a>

### `circuit` – Elektrický obvod

Schéma se zdrojem, spínačem a 1–3 rezistory nebo žárovkami. Dítě mění napětí, odpory, počet spotřebičů a zapojení (sériově/paralelně); vidí celkový odpor, proud, napětí a proud na každém spotřebiči a výkon. Proud ukazují pohyblivé tečky, žárovky svítí podle výkonu.

**Kdy ho použít:** Fyzika 8. třída a elektrotechnika: Ohmův zákon, sériové a paralelní zapojení, Kirchhoffovy zákony, výkon P = U · I, rozpojený obvod.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/circuit](https://sprtam.cz/widgety/circuit)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `voltage` | číslo 0.5–230 | ano | Napětí zdroje U ve voltech (V), např. 4,5 nebo 12. |
| `resistors` | seznam (číslo 0.1–10000) 1–3 položek | ano | Odpory R1…R3 v ohmech (1 až 3 spotřebiče). |
| `mode` | "series" \| "parallel" | ano | Zapojení: "series" sériově (za sebou), "parallel" paralelně (vedle sebe). |
| `bulbs` | true / false | – | true = místo rezistorů žárovky, které svítí podle výkonu. |
| `ask` | "current" \| "resistance" | – | Jen pro otázku: na co se ptá – "current" celkový proud I v ampérech, "resistance" celkový odpor R v ohmech. Výchozí "current". |

```json
{
  "type": "widget",
  "widget": "circuit",
  "props": {
    "voltage": 4.5,
    "resistors": [
      15
    ],
    "mode": "series",
    "bulbs": true
  }
}
```

<a id="lever"></a>

### `lever` – Páka a momenty sil

Páka na podpěře se závažími. Dítě tlačítky přidává závaží a posouvá je po háčcích, páka se nakloní podle momentů M = F · r; pod ní je výpočet obou momentů a podmínka rovnováhy. Režim „vyrovnej“: levá strana je daná, dítě hledá pravou. Umí i jednozvratnou páku (kolečko) se silou ruky nahoru.

**Kdy ho použít:** Fyzika 7. třída a mechanika SŠ: páka, moment síly, rovnováha na páce, rovnoramenná a nerovnoramenná páka, jednozvratná páka (kolečko, louskáček).

Živá ukázka: [/widgety/lever](https://sprtam.cz/widgety/lever)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `type` | "two-sided" \| "one-sided" | – | Druh páky: "two-sided" dvojzvratná (houpačka, váhy, osa uprostřed – výchozí), "one-sided" jednozvratná (kolečko, louskáček – osa na kraji, břemeno i síla na stejné straně). |
| `left` | objekt | ano | Vlevo (u jednozvratné páky břemeno, které táhne dolů) |
| `left.count` | celé číslo 0–5 | ano | Počet závaží (0–5); u síly ruky kolik závaží by vážila. |
| `left.distance` | celé číslo 1–6 | ano | Na kolikátém háčku od osy otáčení (1 = nejblíž). |
| `right` | objekt | – | Vpravo (u jednozvratné páky síla ruky, která táhne nahoru; počet = kolik závaží by vážila) |
| `right.count` | celé číslo 0–5 | ano | Počet závaží (0–5); u síly ruky kolik závaží by vážila. |
| `right.distance` | celé číslo 1–6 | ano | Na kolikátém háčku od osy otáčení (1 = nejblíž). |
| `leftArm` | celé číslo 2–6 | – | Počet háčků na levém rameni (výchozí 5). Jen u dvojzvratné páky; různá délka ramen = nerovnoramenná páka. |
| `rightArm` | celé číslo 2–6 | – | Počet háčků na pravém rameni (výchozí 5); u jednozvratné páky délka celé páky. |
| `mass` | číslo 10–1000 | – | Hmotnost jednoho závaží v gramech (výchozí 100 g ≐ 1 N, počítá se g ≐ 10 N/kg). |
| `spacing` | číslo 1–100 | – | Vzdálenost sousedních háčků v centimetrech (výchozí 10 cm). |
| `goal` | true / false | – | Režim „vyrovnej“: levá strana (břemeno) je pevně daná, dítě hledá pravou stranu, aby byla páka v rovnováze. |

```json
{
  "type": "widget",
  "widget": "lever",
  "props": {
    "left": {
      "count": 3,
      "distance": 4
    },
    "goal": true
  }
}
```

<a id="periodic"></a>

### `periodic` – Periodická tabulka

Periodická tabulka 118 prvků barevně podle kategorií s legendou. Klepnutím na prvek se ukáže detail: název, protonové číslo, atomová hmotnost, skupina, perioda, skupenství a u lehkých prvků elektrony ve slupkách a valenční elektrony. Klepnutím na kategorii v legendě se zvýrazní její prvky.

**Kdy ho použít:** Chemické prvky a jejich značky, stavba atomu, skupiny a periody, kovy a nekovy, alkalické kovy, halogeny, vzácné plyny, valenční elektrony.

Živá ukázka: [/widgety/periodic](https://sprtam.cz/widgety/periodic)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `count` | celé číslo 2–118 | – | Ukázat jen prvních N prvků (podle protonového čísla). Pro ZŠ třeba 20 (do vápníku), pak se tabulka vejde na telefon bez posouvání. Bez vyplnění celá tabulka. |
| `highlight` | seznam (text) 1–60 položek | – | Zvýrazněné prvky podle značky, např. ["Na", "K"]. Ostatní se ztlumí. |
| `group` | celé číslo 1–18 | – | Zvýrazněná skupina 1–18 (např. 17 = halogeny). Ostatní prvky se ztlumí. |
| `open` | text | – | Značka prvku, jehož detail je otevřený hned na začátku, např. "O". |

```json
{
  "type": "widget",
  "widget": "periodic",
  "props": {
    "count": 20,
    "open": "Na"
  }
}
```

<a id="chem-equation"></a>

### `chem-equation` – Vyčíslení chemické rovnice

Chemická rovnice bez koeficientů. Dítě tlačítky +/− mění stechiometrické koeficienty; tabulka pod rovnicí počítá atomy každého prvku vlevo a vpravo, nesedící zvýrazní a vyrovnanou rovnici pochválí.

**Kdy ho použít:** Chemické rovnice, zákon zachování hmotnosti, vyčíslování rovnic (slučování, rozklad, neutralizace, hoření).

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/chem-equation](https://sprtam.cz/widgety/chem-equation)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `reactants` | seznam (text) 1–4 položek | ano | Reaktanty (výchozí látky) jako vzorce bez koeficientů, např. ["H2", "O2"]. Čísla ve vzorci se zobrazí jako dolní indexy; jde i se závorkami: "Ca(OH)2", "Al2(SO4)3". |
| `products` | seznam (text) 1–4 položek | ano | Produkty jako vzorce bez koeficientů, např. ["H2O"]. |
| `coefficients` | seznam (celé číslo 1–20) 2–8 položek | ano | Správné stechiometrické koeficienty v pořadí reaktanty, pak produkty – nejmenší celá čísla, i jedničky. Např. [2, 1, 2] pro 2 H2 + O2 → 2 H2O. |

```json
{
  "type": "widget",
  "widget": "chem-equation",
  "props": {
    "reactants": [
      "H2",
      "O2"
    ],
    "products": [
      "H2O"
    ],
    "coefficients": [
      2,
      1,
      2
    ]
  }
}
```

<a id="ph"></a>

### `ph` – Stupnice pH

Stupnice pH 0–14 v barvách univerzálního indikátoru. Posuvníkem nebo klepnutím na stupnici dítě nastaví pH a vidí, jestli je roztok kyselý, neutrální, nebo zásaditý; klepnutím na látku (citron, ocet, krev, mýdlo…) se ukáže její přibližné pH. Pro SŠ navíc koncentrace [H⁺] = 10^−pH, pOH a o kolik řádů se liší dva roztoky.

**Kdy ho použít:** Kyseliny a zásady, pH a indikátory, neutralizace, látky z běžného života; na SŠ koncentrace oxoniových kationtů a logaritmická stupnice.

Živá ukázka: [/widgety/ph](https://sprtam.cz/widgety/ph)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `highlight` | seznam ("zaludek" \| "citron" \| "cola" \| "ocet" \| "kava" \| "dest" \| "voda" \| "krev" \| "more" \| "soda" \| "mydlo" \| "cpavek" \| "naoh") 1–13 položek | – | Látky, které se ukážou (ostatní až po klepnutí na „Další látky“): zaludek = žaludeční šťáva, citron = citron, cola = coca-cola, ocet = ocet, kava = káva, dest = déšť, voda = čistá voda, krev = krev, more = mořská voda, soda = jedlá soda (roztok), mydlo = mýdlo, cpavek = čpavek, naoh = hydroxid sodný (roztok). |
| `level` | "zs" \| "ss" | – | "zs" = kyselé, neutrální, zásadité (výchozí); "ss" = navíc koncentrace [H⁺] = 10^−pH, pOH a porovnání dvou roztoků (o kolik řádů se liší). |
| `value` | číslo 0–14 | – | pH, které je nastavené na začátku (výchozí 7). |

```json
{
  "type": "widget",
  "widget": "ph",
  "props": {}
}
```

## Technika a informatika

- [`code`](#code) – Ukázka kódu
- [`binary`](#binary) – Číselné soustavy
- [`logic-gates`](#logic-gates) – Logické členy
- [`subnet`](#subnet) – IP adresa a maska
- [`resistor`](#resistor) – Barevný kód rezistoru
- [`gears`](#gears) – Ozubená kola a převody

<a id="code"></a>

### `code` – Ukázka kódu

Blok kódu s čísly řádků a obarvenými klíčovými slovy, řetězci, čísly a komentáři. Nic se nespouští. Volitelně výstup za tlačítkem, krokování programu s tabulkou proměnných a poznámky k řádkům.

**Kdy ho použít:** Programování (Python, JavaScript), databáze (SQL), weby (HTML, CSS), příkazová řádka (bash), CNC (G-kód), PLC (strukturovaný text). Místo odrážek s kódem; krokování pro cykly a podmínky.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/code](https://sprtam.cz/widgety/code)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `language` | "python" \| "javascript" \| "sql" \| "html" \| "css" \| "bash" \| "gcode" \| "st" \| "text" | ano | Jazyk kódu (podle něj se obarví klíčová slova): python, javascript, sql, html, css, bash, gcode (G-kód CNC), st (PLC, strukturovaný text IEC 61131-3), text (bez obarvení). |
| `code` | text | ano | Kód. Řádky odděluj \n, odsazení mezerami se zachová. Nejvýš 60 řádků. |
| `title` | text | – | Nadpis nad kódem, např. název souboru „pozdrav.py“. |
| `output` | text | – | Co program vypíše. Skryje se za tlačítko „Ukaž výstup“. |
| `steps` | seznam (objekt) 1–40 položek | – | Krokování: autor ručně zapíše, co program dělá krok za krokem. Nic se nespouští. |
| `steps[].line` | celé číslo 1–60 | ano | Číslo řádku, který se v tomto kroku provede (od 1). |
| `steps[].vars` | seznam (objekt) 1–8 položek | – | Proměnné, které se v tomto kroku změnily (ostatní zůstávají z předchozích kroků). |
| `steps[].vars[].name` | text | ano | Název proměnné, např. „i“. |
| `steps[].vars[].value` | text | ano | Hodnota po provedení řádku, např. „3“ nebo „'Ahoj'“. |
| `steps[].print` | text | – | Text, který program v tomto kroku vypíše (přidá se do výpisu). |
| `steps[].note` | text | – | Krátký komentář ke kroku, např. „Podmínka platí, jdeme dovnitř.“ |
| `notes` | seznam (objekt) 1–20 položek | – | Poznámky k řádkům. Řádek s poznámkou má u čísla tečku. |
| `notes[].line` | celé číslo 1–60 | ano | Číslo řádku (od 1). |
| `notes[].text` | text | ano | Poznámka, která se ukáže po klepnutí na číslo řádku. |

```json
{
  "type": "widget",
  "widget": "code",
  "props": {
    "language": "python",
    "title": "soucet.py",
    "code": "soucet = 0\nfor i in range(1, 4):\n    soucet = soucet + i\nprint(\"Součet je\", soucet)",
    "output": "Součet je 6",
    "steps": [
      {
        "line": 1,
        "vars": [
          {
            "name": "soucet",
            "value": "0"
          }
        ],
        "note": "Na začátku je součet 0."
      },
      {
        "line": 2,
        "vars": [
          {
            "name": "i",
            "value": "1"
          }
        ],
        "note": "Cyklus začíná, i = 1."
      },
      {
        "line": 3,
        "vars": [
          {
            "name": "soucet",
            "value": "1"
          }
        ],
        "note": "0 + 1 = 1"
      },
      {
        "line": 2,
        "vars": [
          {
            "name": "i",
            "value": "2"
          }
        ]
      },
      {
        "line": 3,
        "vars": [
          {
            "name": "soucet",
            "value": "3"
          }
        ],
        "note": "1 + 2 = 3"
      },
      {
        "line": 2,
        "vars": [
          {
            "name": "i",
            "value": "3"
          }
        ]
      },
      {
        "line": 3,
        "vars": [
          {
            "name": "soucet",
            "value": "6"
          }
        ],
        "note": "3 + 3 = 6"
      },
      {
        "line": 4,
        "print": "Součet je 6",
        "note": "range(1, 4) skončil před 4, cyklus končí."
      }
    ]
  }
}
```

<a id="binary"></a>

### `binary` – Číselné soustavy

Řada bitů jako přepínače 0/1 s vahami 128, 64, … 1. Klepnutím se mění bity a číslo se hned přepočítá do desítkové, šestnáctkové (i osmičkové) soustavy, výpočet je rozepsaný jako součet vah. Volitelně převod dělením dvěma nebo úkol „nastav číslo“.

**Kdy ho použít:** Informatika ZŠ (dvojková soustava, bit a bajt), hardware a elektronika (šestnáctková soustava, registry, adresy), převody mezi soustavami.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/binary](https://sprtam.cz/widgety/binary)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `value` | celé číslo 0–65535 | ano | Číslo na začátku (desítkově). Musí se vejít do zadaného počtu bitů. |
| `bits` | celé číslo 4–16 | – | Počet bitů: 4, 8 (bajt, výchozí) nebo 16. |
| `octal` | true / false | – | Ukázat i osmičkovou soustavu. |
| `division` | true / false | – | Ukázat převod z desítkové do dvojkové soustavy dělením dvěma (tabulka zbytků). |
| `target` | celé číslo 0–65535 | – | Úkol: dítě má bity nastavit tak, aby vyšlo toto číslo. Zadání čísla tlačítky se pak skryje. |
| `show` | "bin" \| "dec" \| "hex" \| "oct" | – | Jen pro otázku: v jaké soustavě se číslo ukáže v zadání (bin, dec, hex, oct). Výchozí dec. |

```json
{
  "type": "widget",
  "widget": "binary",
  "props": {
    "value": 37,
    "division": true
  }
}
```

<a id="logic-gates"></a>

### `logic-gates` – Logické členy

Logické členy AND, OR, NOT, NAND, NOR, XOR a XNOR ve značkách IEC (nebo amerických ANSI). Dítě klepe na vstupy 0/1, výstup svítí jako LED a v pravdivostní tabulce se zvýrazní aktuální řádek. Volitelně obvod ze 2–3 členů s hodnotami na vodičích.

**Kdy ho použít:** Informatika (logické operace, pravdivostní tabulky), elektronika a číslicová technika (logické obvody, kombinační obvody), automatizace.

Živá ukázka: [/widgety/logic-gates](https://sprtam.cz/widgety/logic-gates)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `gates` | seznam ("and" \| "or" \| "not" \| "nand" \| "nor" \| "xor" \| "xnor") 1–7 položek | – | Členy, mezi kterými dítě přepíná (and, or, not, nand, nor, xor, xnor); první se ukáže na začátku. Bez zadání všechny. |
| `notation` | "iec" \| "ansi" | – | Značky na začátku: iec (evropské podle IEC 60617, výchozí) nebo ansi (americké). Dítě je může přepnout. |
| `circuit` | seznam (objekt) 2–3 položek | – | Obvod ze 2–3 členů. Výstup posledního členu je Y. Např. A AND (NOT B) = [{ gate: not, in: [B] }, { gate: and, in: [A, X1] }]. Místo gates. |
| `circuit[].gate` | "and" \| "or" \| "not" \| "nand" \| "nor" \| "xor" \| "xnor" | ano | Druh členu. |
| `circuit[].in` | seznam (text) 1–2 položek | ano | Vstupy členu: A, B, C nebo výstup dřívějšího členu X1, X2. NOT má jeden vstup, ostatní dva. |

```json
{
  "type": "widget",
  "widget": "logic-gates",
  "props": {}
}
```

<a id="subnet"></a>

### `subnet` – IP adresa a maska

IPv4 adresa s prefixem /0–/32. Dítě mění čísla adresy a prefix a vidí adresu i masku binárně (síťová část barevně), adresu sítě, broadcast, rozsah použitelných adres, počet hostitelů a typ adresy. Umí i rozdělit síť na podsítě.

**Kdy ho použít:** Počítačové sítě (SŠ): IP adresa, maska, prefix (CIDR), adresa sítě a broadcast, počet hostitelů, privátní adresy, dělení na podsítě.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/subnet](https://sprtam.cz/widgety/subnet)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `ip` | text | ano | IPv4 adresa v tečkovém zápisu, např. "192.168.1.130". Každé ze čtyř čísel 0–255. |
| `prefix` | celé číslo 0–32 | ano | Prefix (délka masky): kolik prvních bitů adresy patří síti, např. 24 pro /24 (maska 255.255.255.0). |
| `split` | celé číslo 1–8 | – | Otevře režim „rozděl síť“: síť se rozdělí na 2^split stejných podsítí (1 → 2 podsítě, 2 → 4…). Prefix + split nesmí přesáhnout 32. |
| `ask` | "network" \| "broadcast" \| "first" \| "last" \| "hosts" \| "mask" | – | Jen pro otázku (input): na co se ptá. "network" adresa sítě (výchozí), "broadcast", "first" první a "last" poslední použitelná adresa, "hosts" počet hostitelů, "mask" maska desítkově. |

```json
{
  "type": "widget",
  "widget": "subnet",
  "props": {
    "ip": "192.168.1.25",
    "prefix": 24
  }
}
```

<a id="resistor"></a>

### `resistor` – Barevný kód rezistoru

Rezistor se 4 nebo 5 barevnými proužky (IEC 60062). Dítě klepnutím mění barvy a vidí odpor v Ω, kΩ, MΩ s tolerancí a rozsahem; v opačném režimu skládá barvy k zadané hodnotě. U každého proužku je napsaný název barvy.

**Kdy ho použít:** Elektrotechnika a fyzika (ZŠ i SŠ): rezistor, odpor, jednotky Ω/kΩ/MΩ, barevné značení součástek, tolerance.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/resistor](https://sprtam.cz/widgety/resistor)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `bands` | seznam ("černá" \| "hnědá" \| "červená" \| "oranžová" \| "žlutá" \| "zelená" \| "modrá" \| "fialová" \| "šedá" \| "bílá" \| "zlatá" \| "stříbrná") 4–5 položek | ano | Barvy proužků zleva. 4 proužky: 1. číslice, 2. číslice, násobitel, tolerance. 5 proužků: 3 číslice, násobitel, tolerance. Např. ["žlutá", "fialová", "červená", "zlatá"] = 4,7 kΩ ± 5 %. |
| `mode` | "read" \| "build" | – | "read" (výchozí): dítě mění barvy a čte hodnotu. "build": dítě dostane hodnotu z bands a samo skládá barvy. |

```json
{
  "type": "widget",
  "widget": "resistor",
  "props": {
    "bands": [
      "žlutá",
      "fialová",
      "červená",
      "zlatá"
    ]
  }
}
```

<a id="gears"></a>

### `gears` – Ozubená kola a převody

Dvě nebo tři ozubená kola (nebo dvě řemenice) se otáčejí. Dítě posuvníky mění počty zubů a otáčky a vidí převodový poměr i = z₂ / z₁, otáčky hnaného kola, smysl otáčení a jestli jde o převod do pomala, nebo do rychla.

**Kdy ho použít:** Části strojů a mechanika (ZŠ fyzika, SŠ strojírenství): ozubený a řemenový převod, převodový poměr, otáčky, vložené kolo, jízdní kolo.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/gears](https://sprtam.cz/widgety/gears)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `z1` | celé číslo 6–100 | ano | Počet zubů hnacího kola z₁ (u řemenového převodu průměr hnací řemenice d₁ v cm). |
| `z2` | celé číslo 6–100 | ano | Počet zubů hnaného kola z₂ (u řemenového převodu průměr hnané řemenice d₂ v cm). |
| `idler` | celé číslo 6–100 | – | Počet zubů vloženého kola mezi nimi. Obrátí smysl otáčení, převodový poměr nezmění. Jen u ozubených kol. |
| `n1` | celé číslo 1–10000 | – | Otáčky hnacího kola n₁ za minutu (min⁻¹). Výchozí 120. |
| `belt` | true / false | – | Řemenový převod: místo ozubených kol dvě řemenice spojené řemenem; z₁, z₂ jsou jejich průměry v cm. |
| `ask` | "n2" \| "i" | – | Jen pro otázku (input): "n2" otáčky hnaného kola (výchozí), "i" převodový poměr. |

```json
{
  "type": "widget",
  "widget": "gears",
  "props": {
    "z1": 20,
    "z2": 40,
    "n1": 120
  }
}
```

## Ekonomika a umění

- [`interest`](#interest) – Úrok, spoření a úvěr
- [`supply-demand`](#supply-demand) – Nabídka a poptávka
- [`color`](#color) – Míchání barev

<a id="interest"></a>

### `interest` – Úrok, spoření a úvěr

Spoření: vklad, úrok a doba, graf zůstatku po letech (vloženo a úroky), jednoduché i složené úročení, měsíční vklady a daň z úroků. Úvěr: anuitní splátka, celkem zaplaceno, přeplatek a první splátky rozdělené na úrok a úmor. Vzorce jsou rozepsané.

**Kdy ho použít:** Finanční gramotnost (8.–9. třída), ekonomika a matematika na SŠ: úrok, jednoduché a složené úročení, spoření, úvěr, anuitní splátka a přeplatek.

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/interest](https://sprtam.cz/widgety/interest)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `mode` | "spoření" \| "úvěr" | ano | Co se počítá na začátku: spoření (vklad roste o úroky) nebo úvěr (půjčka splácená měsíčně). Dítě může přepnout. |
| `amount` | číslo 0–50000000 | ano | Vklad (u spoření) nebo jistina, tedy půjčená částka (u úvěru), v Kč. |
| `rate` | číslo 0–30 | ano | Roční úroková sazba v procentech (p. a.), např. 3,5. |
| `years` | celé číslo 1–40 | ano | Doba v letech. |
| `monthly` | číslo 0–100000 | – | Jen spoření: měsíční vklad v Kč (vkládá se na začátku každého měsíce). Výchozí 0. |
| `compound` | true / false | – | Jen spoření: true = složené úročení (úroky se přičítají a dál se úročí), false = jednoduché. Výchozí true. |
| `tax` | true / false | – | Jen spoření: na začátku zapnout srážkovou daň 15 % z úroků (ČR). Výchozí false. |

```json
{
  "type": "widget",
  "widget": "interest",
  "props": {
    "mode": "spoření",
    "amount": 10000,
    "rate": 3,
    "years": 10
  }
}
```

<a id="supply-demand"></a>

### `supply-demand` – Nabídka a poptávka

Graf s klesající poptávkou D a rostoucí nabídkou S. Průsečík je rovnovážná cena a množství. Scénáře a posuvníky posouvají křivky a rovnováha se posune. V režimu pevné ceny je vidět přebytek nebo nedostatek.

**Kdy ho použít:** Ekonomika (SŠ, OA) a základy tržního hospodářství na ZŠ: trh, nabídka, poptávka, tržní rovnováha, posun křivek, cenová regulace (minimální cena, cenový strop).

**V otázkách:** ano – jako `"widget"` otázky typu `input` ukáže jen zadání.

Živá ukázka: [/widgety/supply-demand](https://sprtam.cz/widgety/supply-demand)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `demand` | [číslo 1–10, číslo 0.1–5] | ano | Poptávka D: [a, b], přímka P = a − b · Q. |
| `supply` | [číslo 0–9, číslo 0.1–5] | ano | Nabídka S: [c, d], přímka P = c + d · Q. |
| `good` | text | – | Jaké zboží, např. „jahody“. Ukáže se v nadpisu grafu. |
| `units` | [text, text] | – | Jednotky [množství, cena], např. ["t", "tis. Kč/t"]. Bez nich jsou osy jen Q a P. |
| `scenarios` | seznam (objekt) 1–6 položek | – | Tlačítka se scénáři. Bez nich se ukážou čtyři běžné (příjem, móda, suroviny, technologie). |
| `scenarios[].label` | text | ano | Co se stalo, např. „Lidem roste příjem“. |
| `scenarios[].curve` | "D" \| "S" | ano | Která křivka se posune: D poptávka, S nabídka. |
| `scenarios[].shift` | číslo -3–3 | ano | Posun doprava (+, víc) nebo doleva (−, míň), v jednotkách množství. |
| `mode` | "shift" \| "price" | – | shift = posouvání křivek (výchozí), price = pevná cena nad nebo pod rovnováhou, ukáže přebytek nebo nedostatek. |
| `price` | číslo 0–10 | – | Jen v režimu price: počáteční pevná cena. |
| `ask` | "price" \| "quantity" | – | Jen pro otázku: ptá se na rovnovážnou cenu (výchozí) nebo množství. |

```json
{
  "type": "widget",
  "widget": "supply-demand",
  "props": {
    "demand": [
      9,
      0.8
    ],
    "supply": [
      1,
      0.8
    ],
    "good": "jahody",
    "units": [
      "t",
      "tis. Kč/t"
    ]
  }
}
```

<a id="color"></a>

### `color` – Míchání barev

Tři režimy. Světlo RGB: tři posuvníky 0–255, světelné kruhy se v průnicích sčítají, výsledná barva a hex kód. Tisk CMYK: barvy se odečítají. Barevný kruh: 12 barev, klepnutí ukáže doplňkovou, analogické, triádu a teplé a studené barvy.

**Kdy ho použít:** Výtvarná výchova (barevný kruh, doplňkové, teplé a studené barvy), informatika a grafika (RGB, hex kód, CMYK, tisk), fyzika (skládání světla), vizáž.

Živá ukázka: [/widgety/color](https://sprtam.cz/widgety/color)

| Pole | Typ | Povinné | Popis |
|---|---|---|---|
| `mode` | "rgb" \| "cmyk" \| "wheel" | ano | Co se ukáže na začátku: rgb = míchání světla (monitor), cmyk = míchání barev pro tisk, wheel = barevný kruh. Dítě může přepnout. |
| `rgb` | [celé číslo 0–255, celé číslo 0–255, celé číslo 0–255] | – | Výchozí světlo [R, G, B]. Výchozí [255, 255, 0] (žlutá). |
| `cmyk` | [celé číslo 0–100, celé číslo 0–100, celé číslo 0–100, celé číslo 0–100] | – | Výchozí barvy pro tisk [C, M, Y, K] v procentech. Výchozí [100, 0, 100, 0] (zelená). |
| `pick` | "žlutá" \| "žlutooranžová" \| "oranžová" \| "červenooranžová" \| "červená" \| "červenofialová" \| "fialová" \| "modrofialová" \| "modrá" \| "modrozelená" \| "zelená" \| "žlutozelená" | – | Barevný kruh: která barva je vybraná na začátku. Výchozí žlutá. |
| `show` | "doplňková" \| "analogické" \| "triáda" \| "teplé a studené" | – | Barevný kruh: co se ukáže k vybrané barvě. Výchozí doplňková. |

```json
{
  "type": "widget",
  "widget": "color",
  "props": {
    "mode": "wheel",
    "pick": "modrá",
    "show": "doplňková"
  }
}
```
