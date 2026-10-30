# Jak Šprtám funguje

Průvodce aplikací pro žáky, rodiče a učitele. Popisuje, co aplikace umí a podle jakých pravidel se rozhoduje, třeba co doporučí procvičit nebo kdy dá jedničku.

## Obsah učiva

Učivo je rozdělené **stupeň → ročník → předmět → téma**:

- **1. stupeň ZŠ** (1.–5. třída), **2. stupeň ZŠ** (6.–9. třída), **střední škola** (gymnázium, 1.–4. ročník),
- přes 800 témat a přes 10 000 otázek, podle rámcových vzdělávacích programů (RVP ZV a RVP G) a běžných školních vzdělávacích programů.

Každé téma má:

- **dvě různá vysvětlení**. Když první nesedí, tlačítko *„Nerozumím – vysvětli to jinak“* ukáže druhé, třeba „na pizze“ místo „na číselné ose“. Aplikace si zapamatuje, které ti víc pomohlo.
- **interaktivní pomůcky**: číselnou osu, zlomky na koláči, váhy na rovnice, hodiny, časovou osu, třídění do skupin, písemné počítání pod sebou krok za krokem a další. Všechny jsou v [galerii](https://sprtam.cz/widgety).
- **otázky** různých typů: výběr z možností, pravda/nepravda, napiš odpověď, seřaď, spoj dvojice a ústní otázky.

Obsah je ve složce [`content/`](../content): každé téma je jeden soubor `content/topics/<ročník>/<předmět>/<téma>.json`. Pravidla, podle kterých se píše, jsou v [CONTENT.md](CONTENT.md). Před každým nasazením ho automaticky kontroluje `npm run check:content`, aby u každé otázky existovala správná odpověď, bylo dost otázek a každé vysvětlení začínalo od nuly.

## Waldorfská škola

Kdo chodí do waldorfské školy, zapne si to v nastavení (ozubené kolečko na úvodní obrazovce). Plán ročníků je na [sprtam.cz/waldorf](https://sprtam.cz/waldorf). Pak:

- **Ročník ukazuje epochy** (v obvyklém pořadí – třídy si je každý rok skládají jinak) a ke každé témata k procvičení, i když jsou v aplikaci zařazená v jiném ročníku. Waldorfská 1. třída třeba probírá násobkové řady, které jsou v běžné škole ve 2. třídě.
- **Vysvětlení v duchu waldorfské školy** (od celku k částem, rytmus, příběh, přírodniny) se ukáže jako první. Zatím je u matematiky 1.–3. třídy.
- **Témata navíc**, která běžná škola nemá, např. Od zrna ke chlebu, Stavba domu, Platónská tělesa, Parsifal nebo Faust.
- **Písemka a test končí slovním hodnocením** místo známky.

Plány vycházejí z tematických plánů waldorfské školy. Volba se pamatuje jen v tvém zařízení. Podrobnosti: [Přístupy k výuce](PRISTUPY.md).

## Přijímačky na SŠ

Příprava na jednotnou přijímací zkoušku po 9. třídě je na [sprtam.cz/prijimacky](https://sprtam.cz/prijimacky) (na úvodní obrazovce „Přijímačky na SŠ“). Ke každému testu (matematika 70 minut, čeština a literatura 60 minut, oba za 50 bodů) ukáže:

- **oblasti**, na které se test ptá (zlomky, rovnice, geometrie…, pravopis, skladba, literatura…), každou s tématy aplikace z 5.–9. třídy a ukazatelem, jak ti jdou;
- **procvičení oblasti**: jeden test z otázek všech jejích témat;
- **cvičný test** z celého předmětu: 20 otázek ze všech oblastí se známkou;
- **ostrou simulaci**: celý test na čas jako na přijímačkách (matematika 70 minut, čeština 60 minut), 30 otázek rozložených rovnoměrně do oblastí v jejich pořadí, bez nápověd a bez průběžného vyhodnocení. Otázku můžeš přeskočit a vrátit se k ní (mřížka čísel nahoře ukazuje, co je hotové). Když čas vyprší, test se sám odevzdá; nezodpovězené otázky se počítají jako chyba. Výsledek je v **bodech z 50** a po oblastech. Body jsou odhad: každá otázka má stejnou váhu, ve skutečném testu se úlohy bodují různě. Když simulaci zavřeš, čas se zastaví a příště můžeš pokračovat. Hvězdičky témat se počítají jen ze zodpovězených otázek. Kód: [`src/screens/ExamSim.tsx`](../src/screens/ExamSim.tsx).

Výklad a otázky jsou ty z běžných témat, pokrok je pořád jeden. Rozdělení do oblastí je v kódu ([`src/exam.ts`](../src/exam.ts)) a `check:content` i moderace hlídají, že všechna odkazovaná témata existují. Opravdová zadání z minulých let jsou na prijimacky.cermat.cz.

## Slepá mapa

Hra na [sprtam.cz/slepa-mapa](https://sprtam.cz/slepa-mapa) (na úvodní obrazovce „Slepá mapa“). Mapy: **Kraje Česka** (14 krajů a krajská města), **Evropa** (47 států včetně Ruska a Turecka) a **Svět** (195 států: členové OSN, Vatikán a Kosovo), který jde hrát i po světadílech (Afrika, Asie, Amerika, Austrálie a Oceánie).

Na stránce mapy si ji nejdřív prohlédneš: klepnutím na místo uvidíš jeho název a hlavní město. Pod mapou je seznam všech míst. Pak si vybereš hru, buď na 10 otázek, nebo na celou mapu:

- **Najdi na mapě**: ukaž stát (kraj) podle názvu;
- **Hlavní města / Krajská města**: ukaž stát (kraj) podle jeho hlavního (krajského) města;
- **Poznáš stát / kraj?**: na mapě je jedno místo vyznačené, vyber jeho název ze čtyř sousedních.

Když klepneš vedle, hra ti řekne, kam jsi klepl („To je Německo“). Na každé místo máš tři pokusy: napoprvé je za celý bod, napodruhé za půl. Po třetí chybě ti hra místo ukáže. Na konci uvidíš hvězdičky a místa, která ti nešla, a můžeš si procvičit jen je. Nejlepší výsledek každé hry zůstává jen v zařízení (`sprtam:mapy`, viz [Soukromí](SOUKROMI.md)).

Mapu posuneš tažením a přiblížíš (až 60×) dvěma prsty, kolečkem myši nebo tlačítky. Nejmenší státy (Vatikán, ostrovní státy) mají tečku. Každý malý stát má klikací oblast nejméně 36 px, i když leží uvnitř většího souseda, takže Monako nebo San Marino trefíš prstem i bez přiblížení. Mapy jsou z Natural Earth (volné dílo) a stahují se až při otevření hry; offline fungují taky. Hlavní město chybí u států, kde by odpověď nebyla jednoznačná (Bolívie, Srí Lanka, Izrael, Nauru), a u Středočeského kraje, který sídlí v Praze.

## Periodická tabulka

Hra na [sprtam.cz/periodicka-tabulka](https://sprtam.cz/periodicka-tabulka) (na úvodní obrazovce „Periodická tabulka“). Nahoře si vybereš sadu prvků: **20 prvků** (vodík až vápník, tabulka se vejde na telefon), **ze ZŠ** (41 prvků, které by měl znát každý: prvních 20 a třeba železo, měď, stříbro, zlato, rtuť, olovo, jod nebo uran) a **všech 118**. Tabulku si nejdřív prohlédneš: klepnutím na prvek uvidíš jeho název, protonové číslo, atomovou hmotnost, skupinu, periodu, skupenství a u lehkých prvků elektrony ve slupkách. Pod tabulkou je seznam prvků sady. Pak si vybereš hru, buď na 10 otázek, nebo na všechny prvky sady:

- **Značky**: vyber značku prvku podle názvu (síra → S, Si, Sn, Na…);
- **Názvy**: vyber název prvku podle značky;
- **Najdi v tabulce**: ukaž prvek ve slepé tabulce (bez značek, jen s čísly skupin a period);
- **Poznáš prvek?**: v tabulce je vyznačené jedno pole, vyber, který prvek tam patří (nabídka jsou jeho sousedé);
- **Kov, nebo nekov?**: řekni, jestli je prvek kov, polokov, nebo nekov (bez polonia a astatu, které různé učebnice řadí různě, a bez supertěžkých prvků od rutherfordia, o kterých se to neví).

Špatné odpovědi se nabízejí ty, které se snadno spletou: značky se stejným začátkem, podobné názvy, sousedé v tabulce. Po každé odpovědi hra ukáže, co si o prvku zapamatovat (značka, protonové číslo, kategorie, perioda a skupina). Ve slepé tabulce máš na každý prvek tři pokusy jako ve Slepé mapě: napoprvé je za celý bod, napodruhé za půl a po třetí chybě ti hra prvek ukáže; když klepneš vedle, řekne ti, co je na tom místě. Na konci uvidíš hvězdičky a prvky, které ti nešly, a můžeš si procvičit jen je. Nejlepší výsledek každé hry zůstává jen v zařízení (`sprtam:prvky`, viz [Soukromí](SOUKROMI.md)). Celá tabulka se na telefonu posouvá do strany, aby šla pole pohodlně trefit. Hra funguje i offline.

## Režimy procvičování

| Režim | Otázek | Jak to probíhá |
|---|---|---|
| **Rychlý kvíz** | 5 | Hned po každé odpovědi uvidíš, jestli je správně a proč. |
| **Opakování** | všechny otázky tématu kromě ústních (aspoň 12) | Co spleteš, vrátí se později znovu, dokud to neumíš. |
| **Písemka** | 10 | Výsledek a **známka** až na konci, jako ve škole. |
| **Zkoušení** | 8 | Ústní otázky: odpovíš nahlas, pak uvidíš vzorovou odpověď a sám řekneš, jestli to bylo dobře. |
| **Test** | 20 | Z celého předmětu ročníku, rovnoměrně ze všech témat. Výsledek na konci. |
| **Mix** | 15 | Ze všech připnutých témat (špendlík u tématu). |
| **Dnešní opakování** | 10 | Otázky ze všech témat, které ti podle opakování s rozestupy právě vypadávají z hlavy (viz níže). |
| **Sešit chyb** | 15 | Otázky ze všech témat, které se ti spletly a ještě jsi je neopravil. |

U některých témat z matematiky a fyziky se v Rychlém kvízu, Opakování a Písemce k ručně napsaným otázkám přidávají **automaticky generované příklady** (např. násobilka, zlomky, rovnice), takže se neopakují pořád stejná čísla. Kód: [`src/quiz/generators.ts`](../src/quiz/generators.ts).

### Rozdělané kolo

Kolo, které nedokončíš (zavřená záložka, telefonát, zamčený telefon), se po každé odpovědi uloží. Když se na stejné místo vrátíš, aplikace se zeptá, jestli chceš **pokračovat**, nebo začít znovu. Na úvodní obrazovce je karta *Pokračovat* (křížkem ji zahodíš). Pamatuje se jedno kolo, nejvýš týden. Když se mezitím otázky v učivu změní, kolo začne znovu. Odpovědi už dané jsou v pokroku tak jako tak, uložené kolo si pamatuje jen, které otázky mělo a jak dopadly. Kód: [`src/progress/resume.ts`](../src/progress/resume.ts).

### Klávesnice

Na počítači jde kvíz ovládat klávesami (u možností jsou vidět malé štítky s čísly, na dotykových zařízeních se neukazují):

| Klávesa | Co udělá |
|---|---|
| `1`–`9` | vybere možnost, i v doplňovačkách (pravda/nepravda: `1`/`2`, nebo `P`/`N`) |
| `H` | další nápověda |
| `Enter`, mezerník nebo `→` | po vyhodnocení další otázka |
| `Enter` nebo mezerník, pak `1`/`2` (`N`/`V`) | Zkoušení: ukázat odpověď, pak Nevěděl/a nebo Věděl/a |
| `/` | hledání |

Klávesy nereagují, když píšeš do políčka nebo je otevřený dialog. Kdo ovládá aplikaci hlasem, je vypne v Nastavení → Ovládání (diktované číslo by jinak mohlo vybrat odpověď). Kód: [`src/ui/keys.ts`](../src/ui/keys.ts).

### Nápovědy

Některé otázky mají **nápovědu**: před odpovědí si odkryješ jeden krok k řešení, třeba *„Oba zlomky mají stejný jmenovatel“* a pak *„Sečti jen čitatele, jmenovatel opiš“*. Odpověď nápověda nikdy neprozradí. Mají ji automaticky generované příklady z matematiky a otázky, ke kterým ji napíšou autoři.

- Nápovědy jsou jen v režimech s okamžitou zpětnou vazbou (Rychlý kvíz, Opakování, Mix, Dnešní opakování, Sešit chyb). V **Písemce a Testu nejsou**, jako ve škole.
- Správná odpověď s nápovědou se do výsledku počítá **za půl bodu** a otázka se kvůli ní neposune v opakování s rozestupy.

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

U tématu se drží **nejlepší** dosažený výsledek ze všech režimů. Dnešní opakování a Sešit chyb hvězdičky témat nemění (jsou v nich otázky z mnoha témat najednou), posouvají jen jednotlivé otázky.

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

## Opakování jednotlivých otázek

Kromě celých témat si aplikace pamatuje i **každou otázku z učiva**, na kterou jsi odpověděl (jen v tvém zařízení). Počítá se první pokus v kole; automaticky generované příklady se nepamatují. Kód: [`src/progress/questions.ts`](../src/progress/questions.ts), [`src/quiz/engine.ts`](../src/quiz/engine.ts).

Každá otázka má přihrádku 0–5, podobně jako slovíčka:

| Odpověď | Přihrádka |
|---|---|
| poprvé správně | 2 (umíš ji už) |
| správně | o jednu výš (nejvýš 5) |
| správně s nápovědou | zůstává |
| špatně | 0 |

Podle přihrádky se otázka vrací: 0 hned, 1 po 1 dni, 2 po 3 dnech, 3 po 7 dnech, 4 po 14 dnech, 5 po 30 dnech.

- **Dnešní opakování** (na úvodní obrazovce, když je co opakovat): 10 otázek, které jsou na řadě. Nejdřív chyby, pak nižší přihrádky a nejdéle odkládané.
- **Sešit chyb**: otázky, které se ti spletly, se správnou odpovědí, po tématech. Otázka zmizí, až ji **dvakrát správně** zodpovíš (v jakémkoli režimu). Tlačítkem *Procvičit chyby* je projdeš najednou.
- Když autoři otázku opraví, zůstane jí pokrok, pokud se nezměnilo zadání ani odpověď (oprava vysvětlení nebo nápovědy nevadí). Změněná otázka začíná znovu.

## Přehled a denní cíl

- **Přehled** (klepni na displej se sérií, nebo Nastavení → Přehled): série dní, kolik dní za posledních 30 jsi procvičoval, počet kol, dnešní odpovědi, Sešit chyb a u každého ročníku a předmětu, kolik témat máš na ★, ★★ a ★★★. U slovíček kolik jich máš naučených. Hodí se i rodičům: všechno je jen z tohoto zařízení.
- **Denní cíl**: kolik odpovědí denně chceš dát, 10, 20 (výchozí) nebo 40, nebo bez cíle (Nastavení → Denní cíl). Počítá se každá odpověď v kvízu i u slovíček. Na displeji úvodní obrazovky je vidět, kolik už máš.
- **Série dní** vydrží **jeden vynechaný den za týden**: když jeden den vynecháš a další den zase procvičuješ, série pokračuje (vynechaný den svítí na displeji modře). Dva vynechané dny po sobě sérii ukončí. Vynechané dny se do počtu dní nepočítají. Kód: `streakOf` v [`src/progress/recommend.ts`](../src/progress/recommend.ts).

## Plán před písemkou

Na [sprtam.cz/plan](https://sprtam.cz/plan) (na úvodní obrazovce *Plán před písemkou*, nebo *Píšu z toho písemku* u tématu) si vybereš témata a den písemky. Aplikace opakování rozvrhne do zbývajících dní. Kód: [`src/progress/plan.ts`](../src/progress/plan.ts).

- Téma **umíš**, když poslední kolo mělo aspoň 75 % a procvičoval jsi ho v posledních 7 dnech.
- **Dnes procvič**: každý den do předposledního dne před písemkou nabídne témata, která ještě neumíš: nejdřív nová (v pořadí, jak jsi je vybral), pak ta, která ti nejdou nejvíc, pak ta, která jsi nejdéle neopakoval. Kolik jich je, se řídí tím, kolik zbývá: aby se všechna stihla do předposledního dne, aspoň jedno a nejvýš 4 denně. Co jsi dnes procvičil, se do dnešní dávky počítá a znovu se nenabízí.
- **Den před písemkou**: cvičná písemka (10 otázek ze všech témat, známka) a co ještě nejde.
- **V den písemky**: „Hodně štěstí!“ Po písemce plán za 2 dny sám zmizí z úvodní obrazovky.
- Plán jde upravit, smazat, vytisknout jako **pracovní list** a přidat do **kalendáře** (připomínka každý den v čase, který si zvolíš, až do dne před písemkou, a písemka sama s upozorněním večer předem).
- Plány jsou součástí pokroku: zůstávají jen v zařízení a přenesou se propojením zařízení (ne kódem pokroku).

## Slovíčka

**Angličtina**: přes 1 400 slovíček v úrovních **A1–C1** podle Evropského referenčního rámce, rozdělených do tematických skupin. **Němčina, francouzština a španělština** (druhý cizí jazyk od 7. třídy): úrovně A1–B1, na stránce Slovíčka pod *Další jazyky* a v předmětu jazyka. Kód: [`src/screens/Vocab.tsx`](../src/screens/Vocab.tsx), jazyky v [`src/vocab/langs.ts`](../src/vocab/langs.ts).

- Otázka zní česky: *„Jak se řekne ‚pták‘?“*
- **Nové slovo** vybíráš ze tří podobných možností (*bird / bard / parrot*): správné, podobně vypadající a příbuzné.
- **Slovo, které už umíš**, píšeš sám s nápovědou prvního písmene. U slov od 5 písmen projde jeden překlep, od 12 písmen dva. Kratší slova musí být přesně. Chybějící diakritika (*uber* místo *über*) projde jako překlep, správný tvar se ukáže. Podstatná jména se píšou se členem (*der Hund*).
- Když se spleteš, slovo se **ve stejném kole vrátí o 3 karty později** k napsání.
- Po odpovědi se přehraje **výslovnost**: nahrávka rodilého hlasu (v angličtině britský, u amerických a australských idiomů americký a australský). Slovíčka z rozehraného kola se uloží, takže hrají i offline. Bez nahrávky mluví hlas prohlížeče (podrobnosti v [Soukromí](SOUKROMI.md#co-se-posílá-ven)).
- Slova se opakují podle **Leitnerova systému**: každé slovo má přihrádku 0–5. Správná odpověď ho posune o přihrádku výš, chyba vrátí na 0. V kole přijdou na řadu nejdřív slova z nejnižších přihrádek. Od přihrádky 2 se slovo píše.
- **Postup** u každé skupiny a úrovně: číslo ukazuje, kolik slov jsi už aspoň jednou trefil, ukazatel se posune s každou správnou odpovědí a zaplní se, až jsou všechna slova aspoň v přihrádce 3 (naučená). Chyba slovo vrátí na začátek.

## Další funkce

- **Hledání** (lupa nebo klávesa `/`): ve všech tématech všech ročníků podle názvu, pojmů a pravidel a ve všech slovíčkách. Funguje i bez diakritiky a dá se filtrovat podle stupně.
- **Připnutá témata**: špendlíkem si označíš, co se zrovna učíš. Připnutá témata se vracejí dřív a jdou procvičit najednou v Mixu.
- **Série dní**: kolik dní po sobě jsi procvičoval (počítá se, pokud jsi procvičoval dnes nebo včera; jeden vynechaný den za týden sérii nepřeruší, viz [Přehled a denní cíl](#přehled-a-denní-cíl)).
- **Tmavý vzhled**: v nastavení (ozubené kolečko na úvodní obrazovce).
- **Čtení** (Nastavení → Čtení): větší nebo největší písmo, víc místa mezi řádky, písmeny a slovy a **písmo pro snadné čtení** (Atkinson Hyperlegible Next: písmena jako b/d nebo I/l/1 se nepletou). Platí pro celé zařízení, uloží se v něm. Kód: [`src/reading.ts`](../src/reading.ts).
- **Kdo se učí** (Nastavení → Kdo se učí): na jednom zařízení (rodinný tablet) se může učit víc dětí, každé má svůj pokrok, plány, sérii dní, rekordy Slepé mapy, obor a školu. Nejsou to účty: profil je jen jméno a obrázek v zařízení. Na úvodní obrazovce se nahoře ukáže, kdo se učí, a klepnutím se přepne. Vzhled a čtení jsou společné. Přenos pokroku na jiné zařízení posílá pokrok jen toho, kdo se právě učí. Kód: [`src/profiles.ts`](../src/profiles.ts).
- **Pracovní list** (*Pracovní list* u tématu nebo plánu): otázky k vytištění nebo uložení do PDF, 10, 20 nebo všechny (jen počty, které téma naplní; téma s příklady z generátoru naplní každý), s místem na odpověď a řešením na zvláštní stránce. Otázky s interaktivní pomůckou na papír nejdou, ty se vynechají. List vzniká v zařízení. Kód: [`src/screens/Worksheet.tsx`](../src/screens/Worksheet.tsx).
- **Připomínka** (Nastavení → Připomínka): Šprtám nemá server, který by posílal upozornění. Připomínka proto přijde z tvého kalendáře: tlačítko stáhne soubor `.ics` s událostí každý den v čase, který si vybereš, a kalendář ji přidá. Na iPhonu soubor otevři ze *Stažených* (aplikace Soubory). Zrušíš ji v kalendáři. Kód: [`src/calendar.ts`](../src/calendar.ts).
- **Offline**: po první návštěvě má aplikace v zařízení celé učivo všech ročníků a funguje i bez internetu.
- **Instalace**: v prohlížeči jde aplikace „přidat na plochu“ a pak se chová jako běžná aplikace.
- **Sdílitelné adresy**: každé téma má vlastní odkaz, např. [`sprtam.cz/g/z5/matematika/zlomky`](https://sprtam.cz/g/z5/matematika/zlomky). Učitel ho může poslat žákům.
- **QR kód stránky**: tlačítko vpravo nahoře na každé obrazovce ukáže QR kód právě otevřené stránky v rukou maskota Šprti. Učitel ho může promítnout ve třídě, nebo si ho uložit jako obrázek (PNG) a vytisknout. Kód se vytváří v zařízení a obsahuje jen adresu stránky (nikdy kód pokroku).
- **Přenos pokroku** mezi zařízeními bez účtu: viz [Propojení zařízení](PROPOJENI-ZARIZENI.md).

## Našli jste chybu v učivu?

Budeme rádi za každé upozornění. Nejrychleji přímo v aplikaci: **Nahlásit chybu** je pod každou otázkou (po odpovědi) a pod vysvětlením tématu. Nebo v otázce či vysvětlení označ slovo, které nesedí: pod ním se objeví **Nahlásit chybu** (kopírování a sdílení fungují dál jako obvykle). Vybereš, co je špatně, a můžeš připsat poznámku. Hlášení je anonymní a dostanou ho moderátoři ([Moderace](MODERACE.md), co se posílá: [Soukromí](SOUKROMI.md#co-se-posílá-ven)).

Nebo založte [issue na GitHubu](https://github.com/mrpajzl/sprtam/issues/new) a uveďte:

- odkaz na téma (zkopírujte adresu ze stránky tématu),
- co přesně je špatně (u otázky její znění),
- jak by to mělo být správně, ideálně se zdrojem.
