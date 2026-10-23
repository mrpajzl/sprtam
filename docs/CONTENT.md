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
- `ex` – **přesně dvě vysvětlení, každé jiným způsobem**. Když dítěti nesedne první, nabídne se druhé. Například:
  - obrazem/hrou vs. pravidlem a postupem,
  - příběhem/přirovnáním z běžného života vs. tabulkou/schématem,
  - na pizze vs. na číselné ose.
  `title` vysvětlení je 1–3 slova („Na pizze“, „Krok za krokem“, „Příběhem“, „Obrázkem“).
- `qs` – **alespoň 10 otázek** (min. 8 je tvrdý limit validátoru), mix typů. **Alespoň 2 otázky `open`** (pro režim Zkoušení – ústní otázka a vzorová odpověď v 1–3 větách). Otázky od lehkých po těžší.
- `gen` – jen u matematiky/fyziky, pokud se hodí některý generátor z `src/quiz/generators.ts` (`GENERATOR_NAMES`): add10, sub10, add20, sub20, add100, sub100, add1000, mul-table, div-table, written-mul, written-div, round, compare, frac-of, frac-add, frac-simplify, decimal, percent, integers, power, sqrt, linear-eq, pythagoras, perimeter-area, circle, units, ratio, expressions, quadratic, log.

## Styl textu – nejdůležitější

- **Absolutně jednoduché a krátké.** Ani slovo navíc. Věty do ~15 slov. Žádné „V této lekci se naučíme…“, žádné úvody, žádné oslovení „Ahoj děti“.
- Jazyk přiměřený věku: 1. třída = velmi jednoduché věty (dítě teprve čte!), SŠ = věcný, přesný.
- Každé vysvětlení: 3–7 bloků. Vždy jeden blok `key` s tím jediným, co si zapamatovat.
- **Interaktivita je jádro.** Každé téma má aspoň jeden widget (`t: 'w'`), ideálně v obou vysvětleních jiný. Widgety: counter, numberline, fraction, placevalue, clock, multiply, balance, angle, pythagoras, linear, quadratic, percent, shape, timeline, flip, sort, cycle, parts, gap, bars. Univerzálně použitelné pro každý předmět: `sort` (roztřiď do skupin), `flip` (otoč kartu), `gap` (doplň), `timeline`, `cycle`, `bars`, `parts`.
- `example` = řešený příklad (odpověď se ukáže po klepnutí). `steps` = postup odhalovaný krok za krokem.
- `pic` = řada emoji jako obrázek (např. `['🍎','🍎','🍎']`).
- Inline: `**tučně**`, `*kurzíva*`, `` `vzorec` ``. Matematiku piš Unicode: `·`, `−`, `²`, `√`, `≤`, `π`, `½`. Čárka jako desetinná tečka (`3,14`).
- Fakta musí být **správně** (data, vzorce, pravopis). Raději méně a přesně. Čeština bezchybně.
- `why` u otázky = krátké vysvětlení správné odpovědi (zobrazí se po chybě). Dávej ho u většiny otázek.

## Typy otázek

- `choice` – 2–4 možnosti `o`, `a` = index správné. Distraktory věrohodné (typické chyby), ne hloupé.
- `tf` – pravda/nepravda.
- `input` – krátká odpověď (číslo, slovo). `a` = všechny přijatelné varianty. Jednotky se neignorují – ptej se tak, aby odpověď byla jen číslo nebo jedno slovo („Obsah v cm² =“). Velikost písmen a mezery se při porovnání ignorují. Diakritika se ignoruje všude **kromě češtiny a literatury**, kde rozhoduje (pravopis); čísla se porovnávají numericky (`0,5` = `0.5`).
- `order` – `items` ve **správném** pořadí (aplikace je zamíchá). 3–6 položek.
- `pair` – `pairs` správně spárované (aplikace zamíchá pravou stranu). 3–5 párů, krátké texty.
- `open` – ústní otázka, `a` = vzorová odpověď.

## Ukázka jednoho tématu

```ts
{
  id: 'zlomky-uvod',
  title: 'Co je zlomek',
  emoji: '🍕',
  ex: [
    {
      title: 'Na pizze',
      blocks: [
        { t: 'p', text: 'Pizzu rozkrojíš na **4 stejné dílky**. Sníš **1**.' },
        { t: 'w', w: 'fraction', p: { n: 1, d: 4 } },
        { t: 'key', text: 'Spodní číslo = na kolik dílů. Horní = kolik jich máš.' },
        { t: 'example', q: 'Kolik pizzy zbylo?', a: '3/4 – tři čtvrtiny.' },
      ],
    },
    {
      title: 'Na čáře',
      blocks: [
        { t: 'p', text: 'Úsečku od 0 do 1 rozděl na stejné kousky.' },
        { t: 'w', w: 'numberline', p: { min: 0, max: 1, step: 0.25 } },
        { t: 'key', text: '1/4 je první dílek ze čtyř.' },
      ],
    },
  ],
  qs: [
    { t: 'choice', q: 'Dort je na 8 dílků, snědl jsi 3. Jaký zlomek jsi snědl?', o: ['3/8', '8/3', '5/8'], a: 0, why: 'Dole celkem (8), nahoře snědené (3).' },
    { t: 'tf', q: '1/2 je víc než 1/3.', a: true, why: 'Čím na méně dílů, tím větší dílek.' },
    { t: 'input', q: 'Kolik čtvrtin je jeden celek?', a: ['4'] },
    { t: 'order', q: 'Seřaď od nejmenšího.', items: ['1/8', '1/4', '1/2'] },
    { t: 'pair', q: 'Spoj stejné.', pairs: [['1/2', 'polovina'], ['1/4', 'čtvrtina'], ['1/3', 'třetina']] },
    { t: 'open', q: 'Co znamená čitatel a jmenovatel?', a: 'Jmenovatel (dole) říká, na kolik stejných dílů je celek rozdělen. Čitatel (nahoře) říká, kolik dílů máme.' },
    // … celkem aspoň 10
  ],
  gen: 'frac-of',
}
```

## Parametry widgetů – připomínka

Přesné typy jsou v `types.ts`. Rozumné rozsahy: `multiply` a, b ≤ 10; `numberline` max − min ≤ 20 dílků (`(max-min)/step ≤ 20`); `placevalue` value ≤ 999; `balance` celá čísla, `(c - b) / a` celé číslo; `pythagoras` a, b ≤ 12; `linear` k, q ∈ ⟨−5, 5⟩; `quadratic` a ∈ ⟨−3, 3⟩ ≠ 0; `sort` 2–3 kbelíky, 6–10 položek; `flip` 3–8 karet; `gap` 3–6 položek; `timeline` 3–8 událostí (rok může být záporný = př. n. l.); `cycle` 3–6 kroků; `bars` 3–8 položek; `parts` 1–3 slova.
