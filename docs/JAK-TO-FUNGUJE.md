# Jak Šprtám funguje

Průvodce aplikací pro žáky, rodiče a učitele. Popisuje, co aplikace umí a podle jakých pravidel se rozhoduje, třeba co doporučí procvičit nebo kdy dá jedničku.

## Obsah učiva

Učivo je rozdělené **stupeň → ročník → předmět → téma**:

- **1. stupeň ZŠ** (1.–5. třída), **2. stupeň ZŠ** (6.–9. třída), **střední škola** (gymnázium, 1.–4. ročník),
- přes 800 témat a přes 10 000 otázek, podle rámcových vzdělávacích programů (RVP ZV a RVP G) a běžných školních vzdělávacích programů.

Každé téma má:

- **dvě různá vysvětlení**. Když první nesedí, tlačítko *„Nerozumím – vysvětli to jinak“* ukáže druhé, třeba „na pizze“ místo „na číselné ose“. Aplikace si zapamatuje, které ti víc pomohlo.
- **interaktivní pomůcky**: číselnou osu, zlomky na koláči, váhy na rovnice, hodiny, časovou osu, třídění do skupin, písemné počítání pod sebou krok za krokem a další.
- **otázky** různých typů: výběr z možností, pravda/nepravda, napiš odpověď, seřaď, spoj dvojice a ústní otázky.

Obsah je v souborech [`src/content/data/<ročník>/<předmět>.ts`](../src/content/data). Pravidla, podle kterých se píše, jsou v [CONTENT.md](CONTENT.md). Před každým nasazením ho automaticky kontroluje `npm run check:content`, aby u každé otázky existovala správná odpověď a bylo dost otázek.

## Režimy procvičování

| Režim | Otázek | Jak to probíhá |
|---|---|---|
| **Rychlý kvíz** | 5 | Hned po každé odpovědi uvidíš, jestli je správně a proč. |
| **Opakování** | všechny otázky tématu kromě ústních (aspoň 12) | Co spleteš, vrátí se později znovu, dokud to neumíš. |
| **Písemka** | 10 | Výsledek a **známka** až na konci, jako ve škole. |
| **Zkoušení** | 8 | Ústní otázky: odpovíš nahlas, pak uvidíš vzorovou odpověď a sám řekneš, jestli to bylo dobře. |
| **Test** | 20 | Z celého předmětu ročníku, rovnoměrně ze všech témat. Výsledek na konci. |
| **Mix** | 15 | Ze všech připnutých témat (špendlík u tématu). |

U některých témat z matematiky a fyziky se v Rychlém kvízu, Opakování a Písemce k ručně napsaným otázkám přidávají **automaticky generované příklady** (např. násobilka, zlomky, rovnice), takže se neopakují pořád stejná čísla. Kód: [`src/quiz/generators.ts`](../src/quiz/generators.ts).

### Kontrola napsaných odpovědí

- Nezáleží na velkých písmenech ani mezerách navíc.
- Čísla se porovnávají jako čísla: `2,5` = `2.5`.
- **V češtině a literatuře záleží na diakritice** (*býk* ≠ *bik*), v ostatních předmětech ne (*Premyslovci* projde jako *Přemyslovci*).

Kód: funkce `checkInput` v [`src/quiz/engine.ts`](../src/quiz/engine.ts).

### Známky a hvězdičky

Do výsledku se počítá jen **první pokus** u každé otázky. Opravené odpovědi v Opakování se počítají jako chyba.

| Úspěšnost | Známka (Písemka, Test) | Hvězdičky u tématu |
|---|---|---|
| 90 % a víc | 1 – výborně | ★★★ |
| 75–89 % | 2 – chvalitebně | ★★ |
| 70–74 % | 3 – dobře | ★★ |
| 50–69 % | 3 – dobře | ★ |
| 40–49 % | 4 – dostatečně | ★ |
| 30–39 % | 4 – dostatečně | žádná |
| pod 30 % | 5 – nedostatečně | žádná |

U tématu se drží **nejlepší** dosažený výsledek ze všech režimů.

## „Na řadě“: co procvičit dál

Na úvodní obrazovce aplikace doporučí až 5 témat, nejvýš 2 z jednoho předmětu. Rozhoduje se **jen podle pokroku uloženého ve tvém zařízení**. Kód: [`src/progress/recommend.ts`](../src/progress/recommend.ts).

1. **Zopakovat**: téma, které jsi už procvičoval, se vrací po čase podle posledního výsledku (opakování s rozestupy):

   | Poslední kolo | Vrátí se po |
   |---|---|
   | 0–1 hvězdička | 1 dni |
   | 2 hvězdičky | 3 dnech |
   | 3 hvězdičky | 7 dnech |
   | 3 hvězdičky a téma procvičené aspoň 3× | 14 dnech |

   Připnutá témata se vracejí dvakrát dřív.
2. **Slabé téma**: poslední kolo pod 60 %. Vrátí se hned druhý den.
3. **Základy**: když ti nejde téma, aplikace najde ve stejném předmětu příbuzné téma z nižšího ročníku (podle podobných slov v názvu) a nabídne ho, pokud ho ještě nemáš na 3 hvězdičky.
4. **Další v pořadí**: další neprocvičené téma v předmětech, které zrovna probíráš.
5. **Začátek**: dokud nic neprocvičíš, první témata zvoleného ročníku.

## Anglická slovíčka

Přes 1 400 slovíček v úrovních **A1–C1** podle Evropského referenčního rámce, rozdělených do tematických skupin. Kód: [`src/screens/Vocab.tsx`](../src/screens/Vocab.tsx), data v [`src/vocab/data`](../src/vocab/data).

- Otázka zní česky: *„Jak se řekne ‚pták‘?“*
- **Nové slovo** vybíráš ze tří podobných možností (*bird / bard / parrot*): správné, podobně vypadající a příbuzné.
- **Slovo, které už umíš**, píšeš sám s nápovědou prvního písmene. U slov od 5 písmen projde jeden překlep, od 12 písmen dva. Kratší slova musí být přesně.
- Když se spleteš, slovo se **ve stejném kole vrátí o 3 karty později** k napsání.
- Po odpovědi se přehraje **výslovnost**: nahrávka rodilého hlasu (britský, u amerických a australských idiomů americký a australský). Slovíčka z rozehraného kola se uloží, takže hrají i offline. Bez nahrávky mluví hlas prohlížeče (podrobnosti v [Soukromí](SOUKROMI.md#co-se-posílá-ven)).
- Slova se opakují podle **Leitnerova systému**: každé slovo má přihrádku 0–5. Správná odpověď ho posune o přihrádku výš, chyba vrátí na 0. V kole přijdou na řadu nejdřív slova z nejnižších přihrádek. Od přihrádky 2 se slovo píše.
- **Postup** u každé skupiny a úrovně: číslo ukazuje, kolik slov jsi už aspoň jednou trefil, ukazatel se posune s každou správnou odpovědí a zaplní se, až jsou všechna slova aspoň v přihrádce 3 (naučená). Chyba slovo vrátí na začátek.

## Další funkce

- **Hledání** (lupa nebo klávesa `/`): ve všech tématech všech ročníků podle názvu, pojmů a pravidel a ve všech slovíčkách. Funguje i bez diakritiky a dá se filtrovat podle stupně.
- **Připnutá témata**: špendlíkem si označíš, co se zrovna učíš. Připnutá témata se vracejí dřív a jdou procvičit najednou v Mixu.
- **Série dní**: kolik dní po sobě jsi procvičoval (počítá se, pokud jsi procvičoval dnes nebo včera).
- **Tmavý vzhled**: přepínač na úvodní obrazovce.
- **Offline**: po první návštěvě má aplikace v zařízení celé učivo všech ročníků a funguje i bez internetu.
- **Instalace**: v prohlížeči jde aplikace „přidat na plochu“ a pak se chová jako běžná aplikace.
- **Sdílitelné adresy**: každé téma má vlastní odkaz, např. [`sprtam.cz/g/z5/matematika/zlomky`](https://sprtam.cz/g/z5/matematika/zlomky). Učitel ho může poslat žákům.
- **QR kód stránky**: tlačítko vpravo nahoře na každé obrazovce ukáže QR kód právě otevřené stránky v rukou maskota Šprti. Učitel ho může promítnout ve třídě, nebo si ho uložit jako obrázek (PNG) a vytisknout. Kód se vytváří v zařízení a obsahuje jen adresu stránky (nikdy kód pokroku).
- **Přenos pokroku** mezi zařízeními bez účtu: viz [Propojení zařízení](PROPOJENI-ZARIZENI.md).

## Našli jste chybu v učivu?

Budeme rádi za každé upozornění. Založte prosím [issue na GitHubu](https://github.com/mrpajzl/sprtam/issues/new) a uveďte:

- odkaz na téma (zkopírujte adresu ze stránky tématu),
- co přesně je špatně (u otázky její znění),
- jak by to mělo být správně, ideálně se zdrojem.
