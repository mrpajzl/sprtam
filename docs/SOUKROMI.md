# Soukromí: co Šprtám ví a co ne

> **Ve zkratce: nesledujeme tě.** Šprtám nemá účty, nepoužívá cookies, reklamy, analytiku ani anonymní statistiky. Tvůj pokrok zůstává v tvém zařízení. Aplikace o tobě nikam nic neposílá: ven jdou jen běžné požadavky na stránky a učivo.

Tenhle dokument popisuje úplně všechno, co aplikace ukládá a posílá. Každé tvrzení odkazuje na kód, takže si ho může kdokoli ověřit.

## Co se ukládá ve tvém zařízení

Aplikace používá úložiště prohlížeče (`localStorage`). Data v něm vidí jen tvůj prohlížeč na adrese `sprtam.cz`. Nikam se samy neposílají.

| Klíč | Co obsahuje | Kód |
|---|---|---|
| `sprtam:progress` | Tvůj pokrok: u každého procvičeného tématu nejlepší výsledek, výsledek posledního kola, počet kol a den posledního procvičení, které z obou vysvětlení ti víc sedí; přihrádky slovíček (0–5); připnutá i odepnutá témata (s časem změny); posledních 120 dní, kdy jsi procvičoval (kvůli sérii dní); naposledy zvolený ročník; u každé zodpovězené otázky z učiva přihrádku (0–5), den poslední odpovědi a kolikrát se spletla (kvůli Sešitu chyb a Dnešnímu opakování, nejvýš 4 000 otázek); denní cíl a kolik odpovědí jsi dal dnes; plány před písemkou (název, den písemky, témata, čas poslední změny). | [`src/progress/store.ts`](../src/progress/store.ts) |
| `sprtam:mapy` | Nejlepší výsledek (0–100 %) každé hry Slepé mapy, např. `evropa/najdi`. | [`src/maps/index.ts`](../src/maps/index.ts) |
| `sprtam:prvky` | Nejlepší výsledek (0–100 %) každé hry Periodické tabulky, např. `zs/znacky`. | [`src/chem/index.ts`](../src/chem/index.ts) |
| `sprtam:resume` | Rozdělané kolo: adresa, režim, název, které otázky kolo mělo (téma a otázka, vygenerovaný příklad celý), jak dopadly odpovědi a u testů na čas uplynulý čas. Smaže se po dokončení kola nebo po týdnu. | [`src/progress/resume.ts`](../src/progress/resume.ts) |
| `sprtam:profiles` | Jen když se na zařízení učí víc dětí: jména (přezdívky) a obrázky profilů a kdo se učí teď. | [`src/profiles.ts`](../src/profiles.ts) |
| `sprtam:switching` | Jen na okamžik při přepínání profilu, aby ostatní otevřené záložky přestaly ukládat a načetly se znovu. | [`src/profiles.ts`](../src/profiles.ts) |
| `sprtam:profile:<id>` | Odložená data ostatních profilů: jejich `sprtam:progress`, `sprtam:resume`, `sprtam:mapy`, `sprtam:prvky`, `sprtam-obor` a `sprtam-approach`. Smazáním profilu zmizí. | [`src/profiles.ts`](../src/profiles.ts) |
| `sprtam-reading` | Nastavení čtení a ovládání, pokud sis ho změnil: velikost písma, víc místa, písmo pro snadné čtení, vypnuté klávesové zkratky. | [`src/reading.ts`](../src/reading.ts) |
| `sprtam-theme` | `dark` nebo `light`, pokud sis přepnul vzhled. | [`src/theme.ts`](../src/theme.ts) |
| `sprtam-approach` | `waldorf`, pokud sis zapnul waldorfskou školu. | [`src/approach.ts`](../src/approach.ts) |
| `sprtam-heal` | Čas posledního automatického „uzdravení“ po nasazení nové verze (aby se stránka nepřenačítala dokola). | [`public/boot-check.js`](../public/boot-check.js) |

Kromě toho:

- `sessionStorage` → `sprtam:trail`: seznam obrazovek, kterými jsi v aktuální záložce prošel, aby fungovalo tlačítko Zpět. Smaže se zavřením záložky. Kód: [`src/router.tsx`](../src/router.tsx).
- **Cache service workeru**: kopie aplikace a veškerého učiva, aby fungovala offline, a navíc až 30 naposledy otevřených stránek (jde z nich poznat, která témata jsi otevřel, ale zůstávají jen v zařízení).

**Nic z toho nevíme my.** Neexistuje žádná databáze uživatelů. Když vymažeš data prohlížeče nebo aplikaci odinstaluješ, pokrok zmizí a nikdo ho neobnoví. Proto existuje [kód pokroku a propojení zařízení](PROPOJENI-ZARIZENI.md).

### Jak data smazat

- V nastavení prohlížeče vymaž data webu `sprtam.cz` (Chrome: Nastavení → Soukromí a zabezpečení → Data webů; Safari na iPhonu: Nastavení → Safari → Pokročilé → Data webových stránek).
- **Android:** aplikace na ploše sdílí data s Chromem, maže se tedy stejně. Samotné odebrání ikony data nesmaže.
- **iPhone:** aplikace přidaná na plochu má vlastní úložiště, oddělené od Safari. Smazáním ikony se smaže i její pokrok.

## Co se posílá ven

Úplný seznam. Nic jiného aplikace sama neposílá.

| Kam | Kdy | Co | Podrobně |
|---|---|---|---|
| `sprtam.cz` (náš server) | Při otevření nebo přenačtení stránky | Běžné stažení aplikace a učiva (HTML, JS, CSS, obrázky). Server přitom vidí adresu stránky, viz [níže](#co-vidí-server-a-síť). | [Architektura](ARCHITEKTURA.md) |
| Druhé zařízení (napřímo) | Jen když sám spustíš **Propojit dvě zařízení** | Tvůj pokrok, šifrovaně, přímo do druhého zařízení. To se přitom dozví tvou veřejnou IP adresu. | [Propojení zařízení](PROPOJENI-ZARIZENI.md) |
| `sprtam.cz/api/report` → moderátoři | Jen když sám odešleš **Nahlásit chybu** | Které téma, která otázka nebo vysvětlení (číslo a text), důvod, tvoje poznámka a číslo vydání učiva. Žádný pokrok ani nic o zařízení. Server hlášení předá obsahové službě bez tvé IP adresy a prohlížeče; IP adresu drží jen chvíli v paměti kvůli limitu (nejvýš 5 hlášení za 10 minut, 20 za den) a neukládá ji. | [Obsah a jeho API](OBSAH.md#hlášení-chyb-od-žáků) |
| `moderace.sprtam.cz` (formulář) | Jen když sám otevřeš **Chci to zkontrolovat a schválit** u tématu (nebo **Chci kontrolovat učivo** v O aplikaci) a odešleš formulář | Odkaz otevře moderaci v novém okně s adresou tématu, ze kterého přicházíš. Až formulář odešleš: jméno, e-mail, jestli učíš a co, tvoje poznámka. Uvidí to jen správci; vyřízenou žádost moderace po půl roce smaže. Pokrok ani nic z aplikace se neposílá. | [Moderace](MODERACE.md#žádosti-o-moderátorství) |
| `moderace.sprtam.cz` (profil) | Jen když sám klepneš na jméno u *Zkontrolováno člověkem* (nebo na **Kdo učivo kontroluje** v O aplikaci) | Odkaz otevře v novém okně profil toho moderátora; v adrese je jen jeho jméno. Nic z aplikace se neposílá. | [Moderace](MODERACE.md#profil-moderátora) |
| STUN server Googlu a Cloudflaru | Jen při **Propojit dvě zařízení** | Dotaz „jakou mám veřejnou adresu?“ Žádná data o tobě ani o pokroku. | [Propojení zařízení](PROPOJENI-ZARIZENI.md#stun-server) |

Co aplikace **nedělá**:

- Nepočítá uživatele ani návštěvy, ani anonymně. Žádné statistiky nevedeme. (Cloudflare jako každá síť provoz vidí, viz [níže](#co-vidí-server-a-síť).)
- Nepoužívá cookies. Aplikace ani server žádné nenastavují, takže se žádné ani neposílají.
- Nenačítá nic z cizích domén: písma, ikony i knihovny jsou součástí aplikace. Vynucuje to hlavička `Content-Security-Policy` (mimo jiné `default-src 'self'` a `connect-src 'self'`; kromě vlastní domény povoluje jen obsah vytvořený přímo v zařízení, `data:` a `blob:`), viz [`server/index.ts`](../server/index.ts). Prohlížeč by požadavek na cizí server zablokoval. Na dvě věci se tato hlavička nevztahuje: dotaz na STUN server při propojování zařízení (je v tabulce výše) a případné online hlasy prohlížeče, když nahrávka výslovnosti není k dispozici (viz níže).
- Neobsahuje Google Analytics, Facebook Pixel, Sentry, reklamy ani nic podobného.
- Neposílá, jak ti to jde, jak dlouho se učíš ani na jakém zařízení. Které stránky otevíráš, server vidí jen při jejich stažení (viz [níže](#co-vidí-server-a-síť)). Procvičování samo nic neposílá. Nápovědy, Sešit chyb, Dnešní opakování, Přehled i denní cíl se počítají jen v zařízení.
- **Výslovnost slovíček** jsou nahrávky uložené přímo na našem serveru (`/audio/en/…mp3`, u dalších jazyků `/audio/de/…` atd.), jedna pro každé slovíčko. Vytvořili jsme je předem jednou službou ElevenLabs; aplikace ji za běhu nevolá a nic jí neposílá. Stahují se jako ostatní soubory aplikace, server tedy vidí jen to, jaký soubor se stáhl (viz [níže](#co-vidí-server-a-síť)). Když nahrávku nejde přehrát (např. offline, než se kdy stáhla), použije se hlasová syntéza prohlížeče (`speechSynthesis`). Většinou je hlas přímo v zařízení, některé prohlížeče (např. Chrome nebo Edge s online hlasy Googlu či Microsoftu) ale mohou samotné slovo poslat ke zpracování svému poskytovateli. Kód: [`src/vocab/speak.ts`](../src/vocab/speak.ts).
- **Připomínka v kalendáři a pracovní list** vznikají v zařízení: soubor `.ics` i stránka k tisku se skládají v prohlížeči a nic se při tom neposílá. Co s nimi uděláš (přidáš do kalendáře, který se synchronizuje třeba přes iCloud nebo Google), je už na tvém kalendáři. Kód: [`src/calendar.ts`](../src/calendar.ts), [`src/screens/Worksheet.tsx`](../src/screens/Worksheet.tsx).
- **Kamera** (skenování QR kódu) se zapne jen na obrazovce skenování. Obraz se zpracovává v zařízení a nikam se neposílá.

## Co vidí server a síť

Když otevřeš jakoukoli webovou stránku, server se nutně dozví tvou IP adresu a typ prohlížeče, jinak by ti nemohl odpovědět. U Šprtámu je to takhle:

1. **Cloudflare.** Doména `sprtam.cz` jde přes síť Cloudflare (ochrana a zrychlení). Cloudflare vidí IP adresy návštěvníků a zpracovává je podle [svých zásad](https://www.cloudflare.com/privacypolicy/). Nevkládá do stránky žádné skripty ani cookies (ověřeno 25. 10. 2026).
2. **Reverzní proxy** (Traefik v Coolify na našem serveru) předává požadavky aplikaci. Přístupové logy má vypnuté (ověřeno 25. 10. 2026).
3. **Server aplikace** ([`server/index.ts`](../server/index.ts)) nevede žádný log požadavků, neukládá IP adresy a nemá žádnou databázi uživatelů. Na disk zapisuje jen kopii učiva. Učivo si sám stahuje z naší obsahové služby (moderace). Ta se o návštěvnících nic nedozví, protože aplikace v prohlížeči se s ní nikdy nespojuje ([Obsah a jeho API](OBSAH.md)).

Při stažení stránky se server a Cloudflare dozví i její adresu, například `/g/z5/matematika/zlomky` nebo `/hledat?q=zlomky`. To se stane, když stránku otevřeš z odkazu, přenačteš ji nebo když se poprvé stahuje učivo předmětu (soubor `/api/content/f/…` daného předmětu). Hned potom si aplikace stáhne učivo všech předmětů najednou. Při klikání uvnitř už spuštěné aplikace se nic neposílá a po uložení učiva do zařízení funguje i úplně offline. Tyto adresy nikde neukládáme.

## Odkazy s kódem

Kód pokroku (`/#/p/…`), párovací kód (`/#/spojit/…`) a přenos ze staré domény (`/#/presun/…`) jsou vždy za znakem `#`. Část adresy za `#` (fragment) prohlížeč **nikdy neposílá na server**, takže je server ani Cloudflare nevidí.

Pozor ale na jednu věc: když odkaz zkopíruješ nebo pošleš tlačítkem Sdílet přes WhatsApp, Messenger nebo e-mail, vidí ho celý ta služba, přes kterou ho posíláš. Kód **není šifrovaný**, jen zabalený (podrobně v [Propojení zařízení](PROPOJENI-ZARIZENI.md#je-kód-tajný)). Obsahuje ale jen učební pokrok, nic osobního.

## Jak si to ověřit sám

1. Otevři `sprtam.cz` na počítači a stiskni **F12** (vývojářské nástroje).
2. Záložka **Network (Síť)**: uvidíš, že všechny požadavky jdou jen na `sprtam.cz`.
3. Záložka **Application → Local Storage**: uvidíš přesně klíče z tabulky výše.
4. Záložka **Application → Cookies**: prázdno.

Zdrojový kód je celý veřejný v tomto repozitáři. Produkční verze se staví přímo z něj ([`Dockerfile`](../Dockerfile)).
