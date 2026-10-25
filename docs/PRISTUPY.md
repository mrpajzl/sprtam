# Přístupy k výuce (waldorfská škola)

Šprtám umí kromě běžného pořadí učiva ukázat i učivo **tak, jak se probírá v jiném přístupu k výuce**. Prvním přístupem je **waldorfská škola**. Další (Montessori, Hejného metoda…) se přidají stejně.

Co přístup v aplikaci mění:

| Co | Jak |
|---|---|
| Pořadí látky | Ročník se ukazuje jako **epochy** v obvyklém pořadí (třídy si je každý rok skládají jinak, proto bez měsíců), každá s tématy aplikace, i z jiných ročníků ([`/waldorf`](https://sprtam.cz/waldorf)). |
| Výklad | Téma může mít navíc **vysvětlení v duchu přístupu**. Dětem, které přístup zvolily, se ukáže jako první. |
| Vlastní témata | Přístup smí mít témata, která v běžném učivu nejsou (např. Parsifal). V běžném seznamu předmětu se neukazují. |
| Hodnocení | Písemka končí **slovním hodnocením** místo známky (když to přístup a ročník chce). |

Přístup si dítě zvolí na úvodní obrazovce. Volba se pamatuje jen v zařízení, jako ostatní nastavení. Stejně jako učivo se dá prohlížet i bez volby: plán každého přístupu je veřejná stránka.

## Soubory

```
content/approaches/waldorf/
  approach.json    název, popis, výchozí hodnocení
  z1.json … z9.json, s1.json, s2.json, s3.json
                   plán ročníku: epochy (popis, témata) a průběžné předměty
```

Ročníky se jmenují jako v aplikaci: `z1`–`z9` je 1.–9. třída, waldorfské lyceum 10.–12. třída je `s1`–`s3` (1.–3. ročník SŠ). Pole viz [FORMAT.md](FORMAT.md#přístup-k-výuce-contentapproachespřístupapproachjson).

Téma v epoše se zapisuje jako `<ročník>/<předmět>/<id>`, třeba `z2/matematika/nasobilka-2-3`. Tím se řeší, že se učivo **protíná**: waldorfská 1. třída probírá násobkové řady a čísla do 100, které jsou v aplikaci ve 2. třídě. Epocha na ně jen odkáže a pokrok je pořád jeden.

Vysvětlení pro přístup je běžné vysvětlení s polem `"approach": "waldorf"` v souboru tématu, vedle dvou obecných. Téma jen pro přístup má pole `"approach": "waldorf"` přímo v tématu; je normálně v `_subject.json` svého předmětu, ale ukáže se jen v plánu přístupu.

## Podklady

Plány ročníků vycházejí z tematických plánů waldorfské základní školy a lycea (školní roky 2023/24–2025/26), které poskytla učitelka waldorfské školy. Převzatá jsou **jen témata a jejich pořadí**, žádná jména ani údaje o konkrétní škole. Místní látka (dějiny a pověsti vlastního města) je zobecněná. Měsíce epoch převzaté nejsou: třídy si epochy každý rok skládají jinak.

Plán 10. třídy obsahoval jen němčinu (ta je v plánu převzatá). Epochy 10. třídy proto vycházejí z veřejných dokumentů: [školní vzdělávací program Waldorfského lycea](https://wlyceum.cz/soubory/svp-2023.pdf) (1. ročník: poetika, starověká literatura a antika, starověké civilizace, egyptské a řecké umění, antropologie, soli, kyseliny a zásady, mechanika, planeta Země, goniometrie a trigonometrie, planimetrie, zeměměřičské praktikum) a [waldorfský učební plán (Richter)](https://wlyceum.cz/soubory/0richter.pdf) pro 10. třídu. Stránka ročníku to uvádí.

Plány se ve třídách liší rok od roku i škola od školy. Plán v aplikaci je proto vzor, ne předpis. Úprava = upravit JSON a `npm run check:content`.

## Jak psát v duchu waldorfské školy

Platí všechna pravidla z [CONTENT.md](CONTENT.md), hlavně **od úplné nuly**, pojmy před použitím a povinná stavba vysvětlení. Waldorfské vysvětlení je **třetí cesta k témuž**, ne jiná látka: dítě po něm musí umět totéž, na co se ptají otázky tématu.

Co je pro waldorfský výklad typické:

1. **Od celku k částem.** Nejdřív celek, pak jeho části. Místo „5 + 7 = ?“ začni dvanácti kaštany a hledej, jak se dají rozdělit: 12 = 5 + 7 = 6 + 6 = 10 + 2. Zlomek začíná celým bochníkem, ne dílkem.
2. **Kvalita čísel.** Každé číslo má svůj obraz, než se z něj stane množství: 1 je celek (jedno slunce, já), 2 dvojice a protiklad (den a noc, dvě ruce), 3 trojice (táta, máma, dítě; pohádkové tři úkoly), 4 roční období a světové strany, 5 prsty ruky a hvězda, 12 měsíce roku.
3. **Rytmus a pohyb.** Počítání krokem, tleskáním, dupáním a skákáním. Násobková řada je rytmus: „raz, dva, **TŘI**, raz, dva, **ŠEST**…“. Řady se recitují tam i zpět.
4. **Příběh a obraz.** Látka přichází nejdřív jako příběh a obraz, až potom jako pojem a zápis. Čtyři početní operace jako čtyři postavy: štědrý Plus všechno sbírá, Mínus ztrácí a ubírá, rychlý Krát násobí, spravedlivé Děleno rozděluje všem stejně. Písmena vznikají z obrázků (M jako hory, V jako ptačí křídla).
5. **Ruce a přírodniny.** Kaštany, žaludy, kamínky, šišky, fazole. Měří se tělem (loket, píď, stopa, krok) a vlastními měřidly, teprve pak metrem.
6. **Krása a forma.** Kreslení forem, souměrnost, obrazce násobků v kruhu (widget [`multiple-circle`](https://sprtam.cz/widgety/multiple-circle)), úhledný zápis do epochového sešitu.
7. **Rok a příroda.** Příklady z ročních období, polních prací, řemesel a svátků (sklizeň, svatý Martin, advent).
8. **Bez spěchu a bez srovnávání.** Žádné závody a body. Chyba je součást učení. Tón je laskavý a klidný.

Prakticky:

- `title`: 1–3 slova podle cesty, třeba „Rytmem“, „Od celku“, „Příběhem“, „Kaštany“.
- Stavba je stejná jako u ostatních vysvětlení: „O čem to je“, pojmy (`term`), výklad krok za krokem, aspoň 2 řešené příklady, aspoň jeden widget, `mistake`, `summary`. Rytmus a pohyb popiš tak, aby si je dítě mohlo zkusit doma: „Postav se. Při každém třetím kroku tleskni.“
- Výsledek musí být matematicky i fakticky přesný. Obraz a příběh pomáhají, ale nesmí plést. Kvalita čísel je obraz, ne tvrzení o světě.
- Žádná esoterika, žádné náboženské výklady jako fakta (biblické příběhy v epoše Stvoření světa jsou vyprávěcí látka, ne přírodověda).
- Žádná jména učitelů, škol ani míst konkrétní školy.
