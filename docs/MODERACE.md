# Moderace

Samostatná aplikace pro úpravy a tvorbu učiva: **[moderace.sprtam.cz](https://moderace.sprtam.cz)**.

- Učivo si v ní kdokoli prohlédne bez přihlášení.
- Pozvaní moderátoři v ní upravují témata v editoru s živým náhledem. Hotovou změnu pošlou **ke kontrole**.
- Jakmile ji schválí jiný moderátor, je hned na sprtam.cz. Správce může svou změnu schválit i sám.

Moderace je zároveň obsahová služba: učivo i s celou historií je v její databázi ([OBSAH.md](OBSAH.md)).

Funguje i na mobilu: obrazovky jsou ve spodní liště, správcovské (Vydání, Moderátoři) a vlastní účet pod **Více**.

Kód je ve složce [`moderator/`](../moderator). Pro žáky se nic nemění: Šprtám dál nemá účty a o dětech nic neukládá. Účty mají jen moderátoři a jen v moderaci.

## Prohlížení (bez přihlášení)

Pro učitele a kohokoli, kdo chce učivo zkontrolovat. **Učivo** → ročník → předmět → téma (adresa `/ucivo/<ročník>/<předmět>/<téma>`, dá se poslat dál). Vlevo je téma v telefonu, vykreslené stejně jako v aplikaci, včetně pomůcek a zkoušení otázek. Vpravo jsou všechna vysvětlení a **všechny otázky se správnými odpověďmi** a vysvětlením. Kliknutím se otázka otevře v telefonu. Šipky nahoře přepínají na sousední téma.

Prohlížení ukazuje zveřejněnou verzi, tedy totéž, co je na sprtam.cz. Návrhy ani to, kdo co upravuje, nepřihlášený nevidí.

## Pro moderátory

1. **Přihlášení** je jen přístupovým klíčem (passkey), tedy otiskem prstu, obličejem nebo PINem zařízení. Žádné heslo neexistuje. Účet vznikne z pozvánky od správce. Odkaz platí 72 hodin a jde použít jen jednou.
2. **Učivo**: vlevo vyber ročník, pak předmět a téma. Téma se nejdřív otevře jen k prohlížení (jako výše). Editor zapne tlačítko **Upravit**, případně **Pokračovat v úpravách**, když už máš rozpracováno. Tlačítko **Nové téma** založí kostru se dvěma vysvětleními a pár otázkami.
3. **Editor** má tři sloupce:
   - **Vlevo** jsou části tématu (název, vysvětlení, otázky) a seznam toho, co ještě chybí. Kliknutím na položku skočíš na místo, kde se to opravuje.
   - **Uprostřed** jsou bloky jako karty. Přidáš je tlačítkem **+** mezi kartami, přesuneš je tažením nebo šipkami a smazané vrátíš přes Ctrl+Z. Lišta nahoře vkládá **tučné**, *kurzívu*, `vzorec`, horní index a matematické znaky.
   - **Vpravo** je náhled v telefonu. Kreslí ho přímo komponenty a styly Šprtámu, takže vypadá a funguje přesně jako v aplikaci, i ve tmavém vzhledu. Pomůcky jdou zkoušet a otázky odpovídat.
   - **Interaktivní pomůcka** se vybírá z galerie: vlevo seznam, vpravo vybraná pomůcka naživo (i se všemi připravenými příklady a tím, jak vypadá nad otázkou). „Použít“ ji vloží s příkladem, který je právě vidět.
   - **Na mobilu a menším tabletu** je místo sloupců dole lišta. **Části** otevře osnovu se seznamem toho, co chybí, **Náhled** ukáže téma přes celou obrazovku a **Odeslat** pošle změnu ke kontrole.
4. **Ukládá se samo.** Neuložené změny se při pádu prohlížeče nabídnou k obnovení.
5. **Odeslat ke kontrole** jde, až editor nehlásí žádnou chybu. Server pak zkontroluje celé učivo i s touto změnou stejnými pravidly jako `npm run check:content`.
6. Otevřením tématu v editoru vznikne návrh. Dokud v něm nic nezměníš, nikde se neukazuje (ani jako „upravuje…“), nejde odeslat a při odchodu z editoru zmizí. Nedotčené návrhy server po čase maže sám.
7. Stav návrhů je v **Mých návrzích**: *Rozpracováno*, *Ke kontrole* (kolik schválení už má), *Zveřejněno*, *Staženo*, *Zamítnuto*.

## Kontrola

- **Ke kontrole** (číslo v liště říká, kolik změn čeká na tebe) jsou změny ostatních. U každé, která čeká na tebe, je tlačítko **Zkontrolovat**. Na stránce tématu je změna poslaná ke kontrole vidět taky (**Zkontrolovat a schválit**).
- Nahoře na stránce změny je rámeček, který vždy říká, co můžeš udělat: *Čeká na tvoje rozhodnutí* (Schválit / Požádat o úpravy), *Schválil/a jsi*, *Zatím nejde schválit* (a proč), *Čeká na kontrolu jiného moderátora* u vlastní změny, nebo *Rozpracováno – zatím není co schvalovat*. Když rámeček odjede při čtení změn, tlačítka zůstanou dole na obrazovce.
- Každá změna ukazuje jen to, co se změnilo proti verzi, ze které autor vycházel:
  - přidané, odebrané a změněné bloky a otázky;
  - uvnitř změněných textů jednotlivá slova (zeleně přidaná, červeně odebraná);
  - vedle návrh v telefonu, tlačítkem 📱 u změny skočíš přímo na ni.
- **Konverzace:** ke každému změněnému bloku a otázce i k celé změně jde psát zprávy a odpovídat na ně ve vláknu (**Odpovědět**). Nové zprávy se objeví samy během pár vteřin.
  - Formátování: tlačítka nad polem nebo přímo `**tučně**`, `*kurzíva*`, `~~škrtnuté~~`, `` `vzorec` ``, odrážky `- `, číslovaný seznam `1. `, citace `> `, odkazy (`[text](https://…)` nebo jen adresa). **Náhled** ukáže, jak zpráva bude vypadat. Ctrl+Enter odešle.
  - **Navrhnout text:** u bloku nebo otázky vybereš, který text měníš (např. *Možnost 2* nebo *Vysvětlení*), a napíšeš, jak má znít. Zpráva ukáže změnu po slovech a autor ji tlačítkem **Převzít návrh** vloží do návrhu jako novou verzi. Když autor text mezitím změnil, převezme ho ručně v editoru.
  - Vlastní zprávu jde upravit, a dokud na ni nikdo neodpověděl, i smazat. Autor změny a zakladatel vlákna ho označí jako vyřešené (sbalí se); nová odpověď ho zase otevře.
  - Psát jde, dokud je návrh otevřený (i když ho autor vrátil do rozpracovaných).
- **Požádat o úpravy** blokuje zveřejnění, dokud autor návrh neupraví.
- **Schválit** (u posledního potřebného schválení **Schválit a zveřejnit**) změnu hned zveřejní jako nové vydání.
- Moderátor vlastní změnu schválit nemůže. **Správce** může: rámeček mu ukáže *Jako správce ji můžeš schválit sám/sama*, a protože tím změnu zveřejní bez druhého páru očí, aplikace si řekne o potvrzení klíčem (přihlášení v posledních 15 minutách). API tokenem to nejde. Schvaluje se přesně ta verze, kterou vidíš: když ji autor mezitím upraví, je potřeba podívat se znovu.
- **Konflikt:** téma mezitím změnil a zveřejnil někdo jiný. Autor uvidí, co se zveřejnilo, přenese to do svého návrhu a převede ho na novou verzi.

## Historie a pomůcky

- **Historie** tématu (tlačítko u tématu):
  - každá zveřejněná verze, kdo ji změnil a kdo schválil, a co změnila;
  - **Navrhnout návrat k této verzi** založí návrh se starým obsahem, který jde normálně ke kontrole.
- **Pomůcky:** chybí ti při vysvětlování interaktivní pomůcka (váhy, mapa, osa…)? Navrhni ji: co si s ní mají děti vyzkoušet a ke kterým tématům patří. Ostatní ji můžou podpořit, správce ji naplánuje a po dokončení ji najdeš v editoru. Pod žádostmi je galerie všech pomůcek, které už jsou, naživo – často jde potřebná pomůcka nastavit z existující.
- **API tokeny** (Účet) jsou pro skripty a AI agenty, kteří připravují učivo jako tvoje návrhy. Schválit je musí někdo jiný ([OBSAH.md](OBSAH.md#api-pro-moderování)).

Pravidla pro obsah: [CONTENT.md](CONTENT.md). Editor je hlídá za tebe a ukazuje je u každého vysvětlení.

## Pro správce

- **Moderátoři** (jen pro roli *Správce*): pozvat moderátora, změnit roli, vypnout účet, poslat odkaz na nový klíč, zrušit všechny klíče (ztracené nebo ukradené zařízení), odhlásit ze všech zařízení. Je tam i záznam událostí: přihlášení včetně neúspěšných, pozvánky a odeslané návrhy.
- Každá změna v této části chce **čerstvé potvrzení klíčem** (přihlášení v posledních 15 minutách). Aplikace si o něj sama řekne.
- Aspoň jeden aktivní správce musí zůstat vždy. Sám sebe správce vypnout nemůže.
- **Vydání:**
  - stav učiva: aktuální vydání, neporušená historie, poslední ověřená záloha;
  - každé vydání s tím, co změnilo;
  - **Obnovit** vrátí celé učivo do stavu po zvoleném vydání, hned a bez kontroly (jen pro naléhavé případy, s důvodem).

  Totéž umí Historie tématu pro jedno téma (**Vrátit hned bez kontroly**).
- **Zamítnout** jde návrh, který se nezveřejní. Autor uvidí důvod.
- Kolik schválení je potřeba, určuje `REQUIRED_APPROVALS`. Vlastní schválení správce se počítá jako jedno z nich.

### První správce

První účet se zakládá v kontejneru (v Coolify: aplikace → Terminal):

```sh
node moderator/dist-server/cli.mjs invite "Jméno Příjmení" admin
```

Příkaz vypíše jednorázový odkaz. Další příkazy:

- `users`: seznam účtů;
- `disable <id>`: vypne účet a hned ho odhlásí;
- `verify`: kontrola hash řetězu historie;
- `import <složka> "<důvod>"`: obnova učiva ze složky, např. ze zrcadla; potom restart.

Všechno ostatní se dělá v aplikaci.

## Bezpečnost

| | |
|---|---|
| Přihlášení | Jen passkeys (WebAuthn) s povinným ověřením uživatele. Není co uhodnout, vylákat ani použít z úniku jinde. Knihovna [`@simplewebauthn`](https://simplewebauthn.dev). |
| Účty | Jen přes jednorázovou pozvánku (72 h). Token je v `#` části odkazu, takže ho prohlížeč nikam neposílá, a aplikace ho po načtení smaže z adresního řádku. V databázi je jen jeho SHA-256. |
| Session | Náhodný 256bitový token v cookie `__Host-moderace` (`HttpOnly`, `Secure`, `SameSite=Strict`). V databázi je jen SHA-256. Vyprší po 12 h nečinnosti, nejpozději po 7 dnech. Přihlášení vždy vytvoří novou session. Odebrání klíče ukončí session, které z něj vznikly. |
| Výzvy | Přihlašovací výzvy si server neukládá: podepisuje je klíčem, který existuje jen v běžícím procesu, a pamatuje si jen ty už použité. Kdokoli z internetu tak nemůže zahltit paměť a přihlašování zablokovat. Výzvy k registraci vyžadují platnou pozvánku nebo přihlášení. |
| Veřejná část | Bez přihlášení jde jen číst zveřejněné učivo (`GET /api/content/index`, `/api/content/topic/…` a veřejné API `/api/public/v1/…`). Je to totéž, co ukazuje sprtam.cz. Návrhy, historii a jejich autory dostane jen přihlášený moderátor. Rozpracované návrhy vidí jen autor (a správce), ostatní je uvidí až po odeslání ke kontrole. Všechno ostatní chce session. |
| Cizí stránky | Každý požadavek, který něco mění, musí mít přesně náš `Origin` a `Sec-Fetch-Site: same-origin` a tělo jen jako JSON. CORS není povolené. Výjimkou jsou požadavky s API tokenem v hlavičce `Authorization`: nenesou cookies a prohlížeč je za cizí stránku bez CORS neodešle. |
| Zveřejnění | Jen schválením jiného moderátora (aktuální revize, bez konfliktu, celé učivo projde kontrolou), schválením vlastní změny správcem v prohlížeči s čerstvým potvrzením klíčem (v historii je vidět, kdo schválil), nebo nouzovou obnovou správcem s čerstvým potvrzením klíčem. Historie jde jen doplňovat a je chráněná hash řetězem ([OBSAH.md](OBSAH.md#bezpečnost)). |
| Hlavičky | Přísná CSP (jen `'self'`, žádné cizí skripty), HSTS, `frame-ancestors 'self'`, COOP/CORP, `no-referrer`, `noindex`. |
| Omezení | Rate limit přihlašování, pozvánek, zakládání, ukládání a odesílání návrhů (IPv6 po celých /64). Požadavky bez přihlášení mají nejvýš 16 kB, ostatní 512 kB. Jeden moderátor má nejvýš 50 otevřených návrhů. Adresu klienta z `CF-Connecting-IP` server bere jen od adres Cloudflare. |
| Vypnutý účet, zrušené klíče | Session se mažou okamžitě, klíč dál nefunguje a nepoužité odkazy na nový klíč propadnou. Vždy musí zůstat aspoň jeden správce, který se může přihlásit. |
| API tokeny | V databázi jen SHA-256, s platností, jen vybrané akce nad vlastními návrhy. Vypnutí účtu, zrušení klíčů a odhlášení ruší i tokeny. |
| Data | Jeden SQLite soubor ve volume `/data`. Obsahuje učivo se všemi verzemi, jména moderátorů, veřejné klíče, hashe session, tokenů a pozvánek, návrhy, kontroly a záznam událostí. Každou hodinu si ho zašifrovaně zálohuje druhý server ([OBSAH.md](OBSAH.md#zálohy)). |

## Nasazení

Samostatná aplikace v Coolify (projekt Šprtám) ze stejného repozitáře:

- Dockerfile `moderator/Dockerfile`, build context je kořen repozitáře, port 8090, healthcheck `/healthz`, volume `/data`.
- Doména `moderace.sprtam.cz` (Cloudflare, proxied). Nasazuje se automaticky po pushi do `main`, stejně jako hlavní aplikace.

| Proměnná | Význam |
|---|---|
| `ORIGIN` | Přesná veřejná adresa, `https://moderace.sprtam.cz`. Jsou na ni vázané passkeys, proto se nesmí měnit, jinak se nikdo nepřihlásí. |
| `REQUIRED_APPROVALS` | Kolik jiných moderátorů musí změnu schválit, výchozí 1. |
| `BACKUP_TOKEN` | Token, kterým si zálohy stahuje `hetzner-1` ([OBSAH.md](OBSAH.md#zálohy)). Bez něj jsou zálohy vypnuté. |
| `TRUST_PROXY` | `1` za Cloudflare: IP adresa klienta se bere z `CF-Connecting-IP` (pro limity a záznam událostí). V Dockerfile je zapnutá. |
| `DATA_DIR`, `PORT` | `/data` a `8090`. |

## Vývoj

```sh
npm run moderator:dev     # server :8095 (tsx watch) + editor :5180 (Vite)
npm run moderator:build   # typy + editor do moderator/dist + server do moderator/dist-server
node moderator/dist-server/cli.mjs invite "Já" admin   # první účet lokálně (odkaz na localhost:5180)
```

Passkeys fungují i na `http://localhost`. Server při prvním spuštění s prázdnou databází naimportuje učivo z `content/` (`npm run content:pull`).

Test celého toku a bezpečnostních pravidel: `npm run moderator:build && node scripts/moderator-test.mjs`. Test spustí vlastní server s prázdnou databází a v Chromiu s virtuálními klíči projde:

- pozvánku, přihlášení a podvržené výzvy;
- požadavky z cizích stránek;
- editor s náhledem a oddělení návrhů mezi moderátory;
- kontrolu, konverzaci (vlákna, úpravy zpráv, návrhy textu), schválení a zveřejnění včetně vlastního schválení správcem, konflikty;
- historii, návraty a obnovu vydání;
- API tokeny, žádosti o pomůcky a zálohy;
- správu účtů.

| Kde | Co |
|---|---|
| `moderator/server/` | HTTP server bez frameworku: `auth.ts` (passkeys, session, pozvánky, API tokeny), `admin.ts`, `store.ts` (učivo, verze, vydání, hash řetěz), `drafts.ts` (návrhy, kontrola, návraty), `requests.ts` (žádosti o pomůcky), `backup.ts`, `content.ts`, `db.ts` (SQLite a migrace), `cli.ts` |
| `src/content/check.ts`, `diff.ts`, `release.ts` | Kontrola celého učiva (sdílená s `check:content`), rozdíly verzí, soubory vydání pro aplikaci |
| `ops/backup/` | Zálohy na druhém serveru ([OBSAH.md](OBSAH.md#zálohy)) |
| `moderator/src/` | Editor (Preact): `editor/` (karty bloků a otázek, formulář pomůcky generovaný z jejího schématu, kontrola, historie změn, náhled), `ui/Showcase.tsx` (galerie pomůcek naživo v rámečku náhledu), `screens/`, `passkey.ts` |
| `moderator/src/preview/` | Náhled v iframe nad komponentami aplikace (`src/screens/Blocks.tsx`, `src/quiz/QuestionView.tsx`, `src/styles.css`) |
| `src/content/rules.ts` | Pravidla tématu, sdílená s `scripts/check-content.ts` (anglicky pro skript, česky pro editor) |
| `src/content/canonical.ts` | Zápis souboru ve stejném pořadí klíčů jako v repozitáři, aby diff v PR obsahoval jen skutečné změny |
