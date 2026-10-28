# Jak psát obsah pro Šprtám

Šprtám je PWA pro opakování učiva ZŠ a SŠ. Obsah odpovídá **RVP ZV** (základní škola) a **RVP G** (gymnázium) a běžným ŠVP. Rozdělení: stupeň → třída → předmět → téma.

Celé učivo jsou **JSON dokumenty**. Nejsou v nich žádný kód ani žádné výpočty, jen data. Uložené jsou v obsahové službě (moderace, databáze s verzemi), odkud je za běhu čte aplikace i server sprtam.cz ([Obsah a jeho API](OBSAH.md)). Pro práci mimo moderaci je `npm run content:pull` stáhne jako soubory do složky `content/`. Je to jen místní kopie: není v gitu a další `content:pull` ji přepíše. Změny se do učiva dostanou přes moderaci.

| Kde | Co |
|---|---|
| Tento soubor | jak obsah psát: pravidla, postup, nový widget, změny formátu |
| [FORMAT.md](FORMAT.md) | reference všech polí souborů, bloků a otázek (generovaná) |
| [WIDGETY.md](WIDGETY.md) | reference všech widgetů (generovaná) |
| [sprtam.cz/widgety](https://sprtam.cz/widgety) | galerie: každý widget, blok a typ otázky živě, s JSON ke zkopírování |
| [PRISTUPY.md](PRISTUPY.md) | přístupy k výuce (waldorfská škola): plány ročníků, vysvětlení a témata pro přístup |
| [`src/content/format.ts`](../src/content/format.ts) | jediná definice formátu; z ní vznikají typy, kontrola i JSON Schema |

## Soubory

```
content/
  topics/<ročník>/<předmět>/
    _subject.json            pořadí témat
    <id-tématu>.json         jedno téma (vysvětlení + otázky)
  vocab/<úroveň>.json        anglická slovíčka a1, a2, b1, b2, c1
  approaches/<přístup>/      přístup k výuce: approach.json a plán každého ročníku (viz PRISTUPY.md)
  schema/*.schema.json       JSON Schema pro editory (generované)
```

Ročníky: `z1`–`z9` (základní škola), `s1`–`s4` (gymnázium). Které předměty ročník má, určuje `GRADE_SUBJECTS` v [`src/content/curriculum.ts`](../src/content/curriculum.ts) (tam jsou i názvy a barvy předmětů). Odborné předměty středních odborných škol leží v `topics/odb/<předmět>/` a jejich `_subject.json` je pojmenuje sám (`name`, `emoji`, `color`). Které z nich má který obor v kterém ročníku, popisuje [OBORY.md](OBORY.md).

Každý soubor začíná odkazem na své schéma:

```json
{
  "$schema": "../../../schema/topic.schema.json",
  "format": 1,
  "id": "uhel",
  …
}
```

Díky `$schema` editor (VS Code, JetBrains, Zed…) **sám napovídá pole, ukazuje jejich popis a podtrhne chybu**, ještě než spustíš kontrolu. Pole `format` je verze formátu (viz [Změna formátu](#změna-formátu)).

Formátování je pevné: JSON odsazený dvěma mezerami, na konci nový řádek. `npm run content:format` to opraví ve všech souborech.

## Postup

Bez práce se soubory to jde v [moderaci](MODERACE.md): editor s živým náhledem hlídá tato pravidla a hotovou změnu pošle ke kontrole jiným moderátorem. Ruční postup:

### Nové téma

1. Vytvoř `content/topics/<ročník>/<předmět>/<id>.json`. Nejrychleji tak, že zkopíruješ podobné téma, nebo vzorové téma `z6/matematika/uhel.json` (pro malé děti `z3/cestina/slovni-druhy.json`).
2. Přidej `id` do `_subject.json` na místo, kam patří v pořadí výuky.
3. Spusť `npm run check:content -- z6/matematika` (filtr podle cesty) a oprav všechno, co vypíše. Musí skončit `0 errors`.
4. Podívej se na téma v aplikaci: `npm run dev` → http://localhost:5173/g/z6/matematika/uhel (`?ex=1` otevře druhé vysvětlení).

### Nový předmět nebo ročník

1. Doplň předmět do `GRADE_SUBJECTS` v `src/content/curriculum.ts`. Úplně nový předmět potřebuje i záznam v `SUBJECTS` (název, barva) a glyf v `src/ui/glyphs.tsx`.
2. Vytvoř složku `content/topics/<ročník>/<předmět>/` s `_subject.json` a tématy.
3. `npm run check:content`. Kontrola selže, když předmět z `GRADE_SUBJECTS` nemá obsah, nebo když složka nemá předmět v `GRADE_SUBJECTS`.

### Nový odborný předmět

Bez změny kódu: složka `content/topics/odb/<předmět>/` s `_subject.json` (pořadí témat, `name`, `emoji`, `color`) a tématy. V moderaci ho založí první schválené téma ([OBSAH.md](OBSAH.md)). Do oboru ho zařadí `src/obory.ts` ([OBORY.md](OBORY.md)).

### Slovíčka

`content/vocab/<úroveň>.json`, skupiny slov s `name`, `emoji`, volitelně `lang` (přízvuk) a `words`. Každé slovo má `cz`, `en` (správně), `similar` (podobně vypadá: *bird → bard*) a `related` (podobný význam: *bird → parrot*).

- Anglické slovo musí být **jedinečné napříč všemi úrovněmi**: je na něm uložený pokrok. Kontrola to hlídá.
- Skupiny se odkazují pořadím (`/slovicka/A1/0`). Nové přidávej **na konec**.
- Nové nebo změněné slovo potřebuje nahrávku výslovnosti: `ELEVENLABS_API_KEY=… npx tsx scripts/vocab-audio.ts gen`, pak `build` a `check` (viz [ARCHITEKTURA.md](ARCHITEKTURA.md#vývoj)). Nahrávky a `src/vocab/audio.ts` patří do stejného commitu.

### Přístup k výuce (waldorfská škola)

Plán ročníku, vysvětlení v duchu přístupu i témata jen pro přístup: [PRISTUPY.md](PRISTUPY.md). Vysvětlení pro přístup je třetí položka v `explanations` s polem `"approach": "waldorf"` a platí pro ni stejná pravidla jako pro obě obecná.

### Co se nesmí měnit

- **`id` tématu a název jeho souboru.** Je na nich uložený pokrok dětí a vedou na ně odkazy. Téma jde přejmenovat (`title`), přesunout v pořadí i přepsat, ale ne změnit `id`.
- **Anglické slovo (`en`)** a pořadí skupin slovíček (viz výše).
- **Název widgetu** (`"widget": "fraction"`).
- **`id` epochy** v plánu přístupu (je v adrese `/waldorf/z1/<id>`).

## Téma

- **Pořadí témat** = pořadí, v jakém se učí během školního roku. 6–10 témat na předmět a ročník, pokryj celé učivo ročníku podle RVP/běžného ŠVP. Témata nesmí být příliš široká („Celá mluvnice“) ani mikroskopická.
- `id` kebab-case ASCII (`vyjmenovana-slova-b`), stejné jako název souboru.
- `emoji`: jedno výstižné emoji.
- `explanations`: **přesně dvě obecná vysvětlení, každé jiným způsobem** (viz Výklad níže). Navíc smí být jedno pro každý přístup k výuce (`"approach"`).
- `questions`: **alespoň 10 otázek** (8 je tvrdý limit kontroly), mix typů. **Alespoň 2 otázky `open`** (pro režim Zkoušení: ústní otázka a vzorová odpověď v 1–3 větách). Otázky od lehkých po těžší.
- `generator`: jen u matematiky a fyziky, pokud se hodí některý generátor z [`src/quiz/generators.ts`](../src/quiz/generators.ts): add10, sub10, add20, sub20, add100, sub100, add1000, mul-table, div-table, written-mul, written-div, round, compare, frac-of, frac-add, frac-simplify, decimal, percent, integers, power, sqrt, linear-eq, pythagoras, perimeter-area, circle, units, units-dec, volume, ratio, expressions, quadratic, log. Generátor přidává do procvičování nekonečno dalších příkladů.

## Výklad – nejdůležitější pravidlo: OD ÚPLNÉ NULY

Každé vysvětlení musí pochopit **kdokoli, kdo o tématu nikdy nic neslyšel** – i dítě, které chybělo celý měsíc, i rodič, který to zapomněl. Nepředpokládej žádné znalosti kromě běžného života a toho, co je výslovně zopakované v textu.

**Zakázáno:** použít odborný pojem dřív, než je vysvětlený. Každé slovo, které by dítě nemuselo znát (vrchol, reaktant, koeficient, přísudek, polopřímka, jmenovatel…), musí mít vlastní blok `term` **předtím**, než se poprvé použije. Platí to v **každém z obou vysvětlení zvlášť** – dítě může číst jen jedno.

Pojmy z dřívějších témat se smí použít jen s krátkým připomenutím (blok `term` nebo věta „Připomenutí: …“).

### Povinná stavba každého vysvětlení (obě vysvětlení, každé zvlášť)

1. `{ "type": "heading", "text": "O čem to je" }` + 1–3 bloky `text`: navaž na něco, co dítě zná ze života, a řekni, **k čemu to je**. Žádné „V této lekci se naučíme“.
2. `{ "type": "heading", "text": "Nové pojmy" }` (nebo pojmy postupně tam, kde jsou potřeba) – blok `term` pro **každý** nový pojem: `term` (název), `definition` (vysvětlení obyčejnými slovy, jako kamarádovi), `example` (konkrétní příklad).
3. Výklad **krok za krokem** s nadpisy `heading`. Jedna myšlenka za druhou, nic nepřeskakuj. Používej `steps` pro postupy a aspoň jeden **widget**, na kterém si to dítě samo vyzkouší (s větou, co má zkusit).
4. Aspoň **2 řešené příklady** (`example`), od lehkého k těžšímu. V odpovědi ukaž **postup**, ne jen výsledek.
5. Aspoň jeden blok `mistake` – nejčastější chyba: `wrong`, `right`, `why`.
6. Na konci `summary` – shrnutí v 1–3 větách.

Rozsah: typicky **12–25 bloků** na vysvětlení (minimum 8). Delší je v pořádku, pokud je každá věta srozumitelná.

Kontrola hlídá minimum: každé vysvětlení má ≥ 8 bloků, začíná blokem `heading` a `text`, obsahuje `term`, `summary` a aspoň jeden `example`, `steps` nebo widget; téma má aspoň jeden `mistake` a jednu otázku `open`.

### Dvě vysvětlení = dvě různé cesty k témuž

Obě vysvětlí **celé** téma (ne každé půlku), ale jiným přístupem. Druhé je pro dítě, kterému první nesedlo – nesmí to být zkrácená kopie. Příklady dvojic:
- příběh / situace ze života ↔ přesný postup krok za krokem,
- obrázek / widget / pokus ↔ pravidlo a tabulka,
- přirovnání (buňka jako továrna) ↔ schéma a pojmy,
- „proč to tak je“ ↔ „jak se to dělá“.

`title` = 1–3 slova („Otáčením“, „Krok za krokem“, „Šuplíky“, „Otázkou“, „Jako recept“).

### Bloky

`heading`, `text`, `term`, `mistake`, `summary`, `list`, `steps`, `example`, `table`, `picture` a `widget`. Všechna pole s příklady: [FORMAT.md](FORMAT.md#bloky-vysvětlení-explanationsblocks), živě v [galerii](https://sprtam.cz/widgety).

### Widgety

Interaktivní blok, na kterém si dítě věc samo vyzkouší:

```json
{ "type": "widget", "widget": "fraction", "props": { "numerator": 3, "denominator": 4 } }
```

Přehled všech widgetů s popisem, kdy který použít, a vlastnostmi je v [WIDGETY.md](WIDGETY.md) a v [galerii](https://sprtam.cz/widgety). Kontrola u každého widgetu hlídá typy a rozsahy vlastností i jeho vlastní pravidla (správná odpověď v rozsahu možností, řešitelná rovnice…).

Widget může být i součástí řešeného příkladu (ukáže se s řešením) a widget `column` i součástí otázky `input` (ukáže jen zadání pod sebou, kontrola ověří, že výsledek je mezi odpověďmi):

```json
{ "type": "example", "question": "Vypočítej písemně 832 − 457.", "answer": "…", "widget": { "widget": "column", "props": { "a": 832, "b": 457, "op": "-" } } }
```

### Jazyk

- Krátké věty (do ~15 slov), běžná slova, tykání. Raději tři jednoduché věty než jedna složitá.
- Věk: 1.–2. třída = velmi krátké věty, hodně `picture` a widgetů, rodič může číst nahlas; pojmy vysvětluj přes věci z domova. SŠ = věcně a přesně, ale pořád od nuly.
- Konkrétní příklady s čísly, jmény, věcmi – ne abstraktní „nějaké x“.
- Fakta musí být **správně** (data, vzorce, pravopis). Raději méně a přesně. Čeština bezchybně.
- Inline v textu: `**tučně**` (nový pojem, důležité), `*kurzíva*`, `` `vzorec` ``, horní index `^2`, `^II`. Matematiku piš Unicode: `·`, `−`, `²`, `√`, `≤`, `π`. Desetinná čárka (`3,14`). V JSON se uvozovka uvnitř textu píše `\"` – raději používej české „uvozovky“.
- `explanation` u otázek = krátké vysvětlení správné odpovědi (u většiny otázek).
- `hints` u otázek (nepovinné, 1–3) = nápovědy, které si dítě odkryje po jedné před odpovědí. Od obecné po konkrétní, každá je **krok, jak na to přijít, ne odpověď** (kontrola odmítne nápovědu, ve které je správná odpověď). Hodí se hlavně k příkladům, kde se dá zaseknout: *„Najdi společný jmenovatel.“* → *„Společný jmenovatel 4 a 6 je 12.“* V Písemce a Testu se nezobrazují.

## Typy otázek

- `choice` – 2–4 možnosti `options`, `answer` = pořadí správné (od 0). Špatné možnosti věrohodné (typické chyby), ne hloupé.
- `truefalse` – tvrzení, `answer` je `true` nebo `false`.
- `input` – krátká odpověď (číslo, slovo). `answers` = všechny přijatelné varianty. Jednotky se neignorují – ptej se tak, aby odpověď byla jen číslo nebo jedno slovo („Obsah v cm² =“). Velikost písmen a mezery se při porovnání ignorují. Diakritika se ignoruje všude **kromě češtiny a literatury**, kde rozhoduje (pravopis); čísla se porovnávají numericky (`0,5` = `0.5`).
- `order` – `items` ve **správném** pořadí (aplikace je zamíchá). 3–6 položek.
- `match` – `pairs` správně spárované (aplikace zamíchá pravou stranu). 3–5 párů, krátké texty.
- `open` – ústní otázka, `answer` = vzorová odpověď.

Ukázka každého typu: [FORMAT.md](FORMAT.md#otázky-questions), živě v [galerii](https://sprtam.cz/widgety).

## Kontrola

```sh
npm run check:content                  # všechno
npm run check:content -- z6/matematika # jen část (filtr podle cesty)
```

Kontroluje rozložení složek, každý soubor proti formátu (neznámé nebo chybějící pole, typy, rozsahy), pravidla widgetů a otázek, pravidla výkladu výše, jedinečnost slovíček, formátování a aktuálnost generovaných souborů. Kontrolu dokumentů ([`src/content/check.ts`](../src/content/check.ts)) spouští i obsahová služba před každým zveřejněním. S chybou se nic nezveřejní. Hlášky jsou anglicky a obsahují cestu, např. `content/topics/z6/matematika/uhel.json explanations[1].blocks[4]: widget gap: items[0]: answer out of range`.

Dál se hodí `npx tsx scripts/check-quiz.ts` (každý režim kvízu jde sestavit a každá odpověď `input` projde vlastní kontrolou) a `node scripts/crawl.mjs` (otevře každé téma v prohlížeči a hlásí chyby).

## Nový widget

Nejdřív projdi [galerii](https://sprtam.cz/widgety): většinou stačí existující widget s jinými vlastnostmi. Nový vytvoř, jen když žádný neumí to, co dítě potřebuje vyzkoušet – **dva widgety nesmí dělat totéž** (např. graf funkce se přidá jako nový případ, ne jako kopie `linear`).

1. Vytvoř `src/widgets/<název>.tsx` (kebab-case, např. `number-line`). Vzor: [`fraction.tsx`](../src/widgets/fraction.tsx), s textem [`flip.tsx`](../src/widgets/flip.tsx). Soubor default-exportuje `defineWidget({…})` z [`kit.tsx`](../src/widgets/kit.tsx):

   ```tsx
   const props = s.object({
     numerator: s.int({ min: 0, max: 36, description: 'Čitatel – kolik dílků je obarvených.' }),
     denominator: s.int({ min: 1, max: 12, description: 'Jmenovatel – na kolik dílů je celek rozdělený.' }),
   })
   type P = Infer<typeof props>

   function Fraction({ numerator, denominator }: P) { … }

   export default defineWidget({
     name: 'fraction',                   // = název souboru, nikdy se nemění
     title: 'Zlomek',                    // česky, v galerii
     summary: 'Co dítě vidí a dělá.',
     use: 'Na která témata se hodí.',
     props,                              // každá vlastnost s českým popisem
     examples: [{ title: 'Tři čtvrtiny', props: { numerator: 3, denominator: 4 } }],
     check: (p) => [],                   // pravidla, která schéma neumí (anglicky)
     Component: Fraction,
     // volitelně: Question (jen zadání do otázky), checkQuestion, html (text pro stránku od serveru, server/pages.ts)
   })
   ```

2. Přidej ho do `WIDGET_GROUPS` v [`src/widgets/index.tsx`](../src/widgets/index.tsx).
3. Použij sdílené ovládání z `kit.tsx` (`Step`, `Slider`, `Graph`, `fmt`, `shuffle`) a třídy `.w`, `.val`, `.sub`, `.ctrls` ze `src/styles.css`, ať widgety vypadají stejně. Barvy jen přes proměnné (`var(--accent)`, `var(--ink)`…), jinak nebude fungovat tmavý režim. Číselné CSS hodnoty piš s jednotkou (`'8px'`, Preact 11 `px` nedoplňuje).
4. `npm run content:generate` (schéma a WIDGETY.md), `npm run check:content`, zkontroluj widget v galerii (`/widgety/<název>`) ve světlém i tmavém režimu a na šířce telefonu.

Kontrola selže, když soubor widgetu chybí v seznamu, název se liší od souboru, vlastnost nemá popis nebo ukázka neprojde vlastním schématem.

## Změna formátu

Formát (`src/content/format.ts`) i vlastnosti widgetů mění vždy celý obsah naráz, v jednom pull requestu:

- **Zpětně kompatibilní změna** (nové nepovinné pole, nový typ bloku, otázky nebo nový widget): uprav `format.ts` nebo widget, doplň ukázku do [`src/content/examples.ts`](../src/content/examples.ts) (u bloků a otázek) a spusť `npm run content:generate`. `format` zůstává.
- **Nekompatibilní změna** (přejmenované, odebrané nebo jinak míněné pole): zvyš `FORMAT` v `format.ts` a převeď **všechny** dokumenty v obsahové službě naráz ([Obsah a jeho API](OBSAH.md)). Aplikace čte jen jednu verzi formátu, ale učivo se teď nasazuje odděleně od ní: převod obsahu a nasazení aplikace se musí sejít, nebo musí aplikace po přechodnou dobu umět obě verze. Pozor na pole, na kterých je uložený pokrok (`id`, `en`): ta se nepřejmenovávají nikdy.

Po každé změně formátu: `npm run content:generate`, `npm run check:content`, `npm run build`.
