# Jak se zapojit

Díky, že chceš Šprtám vylepšit. Tady je, jak na to.

## Chyba v učivu

Učivo (výklady, otázky, slovíčka) není v tomhle repozitáři. Je v [obsahové službě](docs/OBSAH.md) a mění se přes [moderaci](docs/MODERACE.md), kde každou změnu schvaluje jiný moderátor.

- Nejrychlejší je tlačítko **Nahlásit chybu** přímo u otázky v aplikaci.
- Nebo založ [issue „Chyba v učivu“](https://github.com/mrpajzl/sprtam/issues/new?template=chyba-v-ucivu.yml) s odkazem na téma, zněním otázky a tím, jak by to mělo být správně.
- Chceš učivo psát a opravovat pravidelně? Napiš na [info@sprtam.cz](mailto:info@sprtam.cz), pozveme tě do moderace.

## Chyba v aplikaci nebo nápad

Založ [issue](https://github.com/mrpajzl/sprtam/issues/new/choose). Nejdřív se prosím podívej, jestli už stejné neexistuje.

Bezpečnostní chyby nehlas veřejně, postup je v [SECURITY.md](SECURITY.md).

## Změna kódu

1. U větší změny nejdřív založ issue a domluvme se, ať práce nepřijde vniveč.
2. Udělej fork a větev, spusť projekt podle [README](README.md#vývoj).
3. Před odesláním: `npm run build` a `npm run check:content` musí projít. Testy pro jednotlivé části jsou ve `scripts/`, popsané v [Architektuře](docs/ARCHITEKTURA.md).
4. Pošli pull request do `main`. Popiš, co a proč se mění, a u změn vzhledu přidej snímek obrazovky (světlý i tmavý režim).

Každý pull request musí schválit správce projektu, sloučit ho může jen správce. Produkce se staví automaticky z `main`.

Co do Šprtámu nepatří: účty, sledování, analytika, reklamy a skripty třetích stran. Šprtám o žácích nic neví a nic nikam neposílá ([Soukromí](docs/SOUKROMI.md)). Pull requesty, které tohle mění, nepřijmeme.

## Licence

Odesláním příspěvku souhlasíš, že bude šířen pod licencí projektu: kód pod [MIT](LICENSE), učivo (i to, co napíšeš v moderaci) pod [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.cs).

Pravidla chování: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
