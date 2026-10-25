# Jak psát obsah pro Šprtám

Šprtám je PWA pro opakování učiva ZŠ a SŠ. Obsah odpovídá **RVP ZV** (základní škola) a **RVP G** (gymnázium) a běžným ŠVP. Rozdělení: stupeň → třída → předmět → téma.

Schéma je v `src/content/types.ts` (přečti ho celé, je to zdroj pravdy). Seznam předmětů v ročnících je v `src/content/curriculum.ts` (`GRADE_SUBJECTS`).

## Soubory

`src/content/data/<grade>/<subject>.ts`, např. `src/content/data/z6/matematika.ts`:

```ts
import type { Subject } from '../../types'

export default {
  grade: 'z6',
  subject: 'matematika',
  topics: [ /* … */ ],
} satisfies Subject
```

Ověření: `npm run check:content -- data/z6` (filtr podle cesty). Musí skončit s `0 errors`. Typy: `npx tsc --noEmit`.

## Téma (Topic)

- **Pořadí témat** = pořadí, v jakém se učí během školního roku. 6–10 témat na předmět a ročník, pokryj celé učivo ročníku podle RVP/běžného ŠVP. Témata nesmí být příliš široká („Celá mluvnice“) ani mikroskopická.
- `id` kebab-case ASCII (`vyjmenovana-slova-b`), unikátní v souboru. **Jednou zvolené id se už nemění** (je na něm uložený pokrok).
- `emoji` – jedno výstižné emoji.
- `ex` – **přesně dvě vysvětlení, každé jiným způsobem** (viz Výklad níže).
- `qs` – **alespoň 10 otázek** (min. 8 je tvrdý limit validátoru), mix typů. **Alespoň 2 otázky `open`** (pro režim Zkoušení – ústní otázka a vzorová odpověď v 1–3 větách). Otázky od lehkých po těžší.
- `gen` – jen u matematiky/fyziky, pokud se hodí některý generátor z `src/quiz/generators.ts` (`GENERATOR_NAMES`): add10, sub10, add20, sub20, add100, sub100, add1000, mul-table, div-table, written-mul, written-div, round, compare, frac-of, frac-add, frac-simplify, decimal, percent, integers, power, sqrt, linear-eq, pythagoras, perimeter-area, circle, units, units-dec, volume, ratio, expressions, quadratic, log.

## Výklad – nejdůležitější pravidlo: OD ÚPLNÉ NULY

Každé vysvětlení musí pochopit **kdokoli, kdo o tématu nikdy nic neslyšel** – i dítě, které chybělo celý měsíc, i rodič, který to zapomněl. Nepředpokládej žádné znalosti kromě běžného života a toho, co je výslovně zopakované v textu.

**Zakázáno:** použít odborný pojem dřív, než je vysvětlený. Každé slovo, které by dítě nemuselo znát (vrchol, reaktant, koeficient, přísudek, polopřímka, jmenovatel…), musí mít vlastní blok `term` **předtím**, než se poprvé použije. Platí to v **každém z obou vysvětlení zvlášť** – dítě může číst jen jedno.

Pojmy z dřívějších témat se smí použít jen s krátkým připomenutím (blok `term` nebo věta „Připomenutí: …“).

### Povinná stavba každého vysvětlení (obě vysvětlení, každé zvlášť)

1. `{ t: 'h', text: 'O čem to je' }` + 1–3 odstavce `p`: navaž na něco, co dítě zná ze života, a řekni, **k čemu to je**. Žádné „V této lekci se naučíme“.
2. `{ t: 'h', text: 'Nové pojmy' }` (nebo pojmy postupně tam, kde jsou potřeba) – blok `term` pro **každý** nový pojem: `term` (název), `def` (vysvětlení obyčejnými slovy, jako kamarádovi), `ex` (konkrétní příklad).
3. Výklad **krok za krokem** s nadpisy `h`. Jedna myšlenka za druhou, nic nepřeskakuj. Používej `steps` pro postupy a aspoň jeden **widget**, na kterém si to dítě samo vyzkouší (s větou, co má zkusit).
4. Aspoň **2 řešené příklady** (`example`), od lehkého k těžšímu. V odpovědi ukaž **postup**, ne jen výsledek.
5. Aspoň jeden blok `mistake` – nejčastější chyba: `wrong`, `right`, `why`.
6. Na konci `key` – shrnutí v 1–3 větách.

Rozsah: typicky **12–25 bloků** na vysvětlení (minimum 8). Delší je v pořádku, pokud je každá věta srozumitelná.

### Dvě vysvětlení = dvě různé cesty k témuž

Obě vysvětlí **celé** téma (ne každé půlku), ale jiným přístupem. Druhé je pro dítě, kterému první nesedlo – nesmí to být zkrácená kopie. Příklady dvojic:
- příběh / situace ze života ↔ přesný postup krok za krokem,
- obrázek / widget / pokus ↔ pravidlo a tabulka,
- přirovnání (buňka jako továrna) ↔ schéma a pojmy,
- „proč to tak je“ ↔ „jak se to dělá“.

`title` = 1–3 slova („Otáčením“, „Krok za krokem“, „Šuplíky“, „Otázkou“, „Jako recept“).

### Jazyk

- Krátké věty (do ~15 slov), běžná slova, tykání. Raději tři jednoduché věty než jedna složitá.
- Věk: 1.–2. třída = velmi krátké věty, hodně `pic` a widgetů, rodič může číst nahlas; pojmy vysvětluj přes věci z domova. SŠ = věcně a přesně, ale pořád od nuly.
- Konkrétní příklady s čísly, jmény, věcmi – ne abstraktní „nějaké x“.
- Fakta musí být **správně** (data, vzorce, pravopis). Raději méně a přesně. Čeština bezchybně.
- Inline: `**tučně**` (nový pojem, důležité), `*kurzíva*`, `` `vzorec` ``, horní index `^2`, `^II`. Matematiku piš Unicode: `·`, `−`, `²`, `√`, `≤`, `π`. Desetinná čárka (`3,14`).
- `why` u otázek = krátké vysvětlení správné odpovědi (u většiny otázek).

### Vzory

Hotová témata podle tohoto standardu – přečti si je, než začneš:
- `src/content/data/z3/cestina.ts` → téma `slovni-druhy` (malé děti)
- `src/content/data/z6/matematika.ts` → téma `uhel`

Validátor kontroluje minimum: každé vysvětlení ≥ 8 bloků, začíná nadpisem `h` a odstavcem `p`, obsahuje `term`, `key` a aspoň jeden `example`/`steps`/widget; téma má aspoň jeden `mistake`.

## Typy otázek

- `choice` – 2–4 možnosti `o`, `a` = index správné. Distraktory věrohodné (typické chyby), ne hloupé.
- `tf` – pravda/nepravda.
- `input` – krátká odpověď (číslo, slovo). `a` = všechny přijatelné varianty. Jednotky se neignorují – ptej se tak, aby odpověď byla jen číslo nebo jedno slovo („Obsah v cm² =“). Velikost písmen a mezery se při porovnání ignorují. Diakritika se ignoruje všude **kromě češtiny a literatury**, kde rozhoduje (pravopis); čísla se porovnávají numericky (`0,5` = `0.5`).
- `order` – `items` ve **správném** pořadí (aplikace je zamíchá). 3–6 položek.
- `pair` – `pairs` správně spárované (aplikace zamíchá pravou stranu). 3–5 párů, krátké texty.
- `open` – ústní otázka, `a` = vzorová odpověď.

## Ukázka

Celé vzorové téma najdeš v `src/content/data/z6/matematika.ts` (id `uhel`) a `src/content/data/z3/cestina.ts` (id `slovni-druhy`).

## Parametry widgetů – připomínka

Přesné typy jsou v `types.ts`. Rozumné rozsahy: `multiply` a, b ≤ 10; `numberline` max − min ≤ 20 dílků (`(max-min)/step ≤ 20`); `placevalue` value ≤ 999; `balance` celá čísla, `(c - b) / a` celé číslo; `pythagoras` a, b ≤ 12; `linear` k, q ∈ ⟨−5, 5⟩; `quadratic` a ∈ ⟨−3, 3⟩ ≠ 0; `sort` 2–3 kbelíky, 6–10 položek; `flip` 3–8 karet; `gap` 3–6 položek; `timeline` 3–8 událostí (rok může být záporný = př. n. l.); `cycle` 3–6 kroků; `bars` 3–8 položek; `parts` 1–3 slova.
