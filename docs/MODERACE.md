# Moderace

Samostatná aplikace pro úpravy a tvorbu učiva: **[moderace.sprtam.cz](https://moderace.sprtam.cz)**. Učivo si v ní kdokoli prohlédne bez přihlášení. Pozvaní moderátoři v ní upravují témata v editoru s živým náhledem. Hotovou změnu pošlou ke schválení a aplikace z ní otevře pull request na GitHubu. Po sloučení se změna sama nasadí na sprtam.cz.

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
4. **Ukládá se samo.** Neuložené změny se při pádu prohlížeče nabídnou k obnovení.
5. **Odeslat ke schválení** jde, až editor nehlásí žádnou chybu. Kontroluje to stejná pravidla jako `npm run check:content` při nasazení, takže návrh z moderace nikdy nerozbije build. Další odeslání stejného návrhu přidá úpravy do téhož pull requestu.
6. Stav návrhů je v **Návrzích**: *Rozpracováno*, *Čeká na schválení*, *Schváleno*, *Zamítnuto*.

Pravidla pro obsah: [CONTENT.md](CONTENT.md). Editor je hlídá za tebe a ukazuje je u každého vysvětlení.

## Pro správce

- **Moderátoři** (jen pro roli *Správce*): pozvat moderátora, změnit roli, vypnout účet, poslat odkaz na nový klíč, zrušit všechny klíče (ztracené nebo ukradené zařízení), odhlásit ze všech zařízení. Je tam i záznam událostí: přihlášení včetně neúspěšných, pozvánky a odeslané návrhy.
- Každá změna v této části chce **čerstvé potvrzení klíčem** (přihlášení v posledních 15 minutách). Aplikace si o něj sama řekne.
- Aspoň jeden aktivní správce musí zůstat vždy. Sám sebe správce vypnout nemůže.
- **Schvalování** probíhá na GitHubu. Pull requesty z moderace mají větev `moderace/<id-tématu>-…` a v popisu autora a souhrn změn. Sloučením se změna nasadí.

### První správce

První účet se zakládá v kontejneru (v Coolify: aplikace → Terminal):

```sh
node moderator/dist-server/cli.mjs invite "Jméno Příjmení" admin
```

Příkaz vypíše jednorázový odkaz. Další příkazy jsou `users` (seznam účtů) a `disable <id>` (vypne účet a hned ho odhlásí). Všechno ostatní se dělá v aplikaci.

## Bezpečnost

| | |
|---|---|
| Přihlášení | Jen passkeys (WebAuthn) s povinným ověřením uživatele. Není co uhodnout, vylákat ani použít z úniku jinde. Knihovna [`@simplewebauthn`](https://simplewebauthn.dev). |
| Účty | Jen přes jednorázovou pozvánku (72 h). Token je v `#` části odkazu, takže ho prohlížeč nikam neposílá, a aplikace ho po načtení smaže z adresního řádku. V databázi je jen jeho SHA-256. |
| Session | Náhodný 256bitový token v cookie `__Host-moderace` (`HttpOnly`, `Secure`, `SameSite=Strict`). V databázi je jen SHA-256. Vyprší po 12 h nečinnosti, nejpozději po 7 dnech. Přihlášení vždy vytvoří novou session. Odebrání klíče ukončí session, které z něj vznikly. |
| Výzvy | Přihlašovací výzvy si server neukládá: podepisuje je klíčem, který existuje jen v běžícím procesu, a pamatuje si jen ty už použité. Kdokoli z internetu tak nemůže zahltit paměť a přihlašování zablokovat. Výzvy k registraci vyžadují platnou pozvánku nebo přihlášení. |
| Veřejná část | Bez přihlášení jde jen číst zveřejněné učivo (`GET /api/content/index` a `/api/content/topic/…`). Jsou to tytéž soubory, které stejně posílá sprtam.cz. Seznam rozpracovaných návrhů a jejich autorů dostane jen přihlášený moderátor. Všechno ostatní chce session. |
| Cizí stránky | Každý požadavek, který něco mění, musí mít přesně náš `Origin` a `Sec-Fetch-Site: same-origin` a tělo jen jako JSON. CORS není povolené. |
| Hlavičky | Přísná CSP (jen `'self'`, žádné cizí skripty), HSTS, `frame-ancestors 'self'`, COOP/CORP, `no-referrer`, `noindex`. |
| Omezení | Rate limit přihlašování, pozvánek, zakládání, ukládání a odesílání návrhů (IPv6 po celých /64). Požadavky bez přihlášení mají nejvýš 16 kB, ostatní 512 kB. Jeden moderátor má nejvýš 50 otevřených návrhů. Adresu klienta z `CF-Connecting-IP` server bere jen od adres Cloudflare. |
| Vypnutý účet, zrušené klíče | Session se mažou okamžitě, klíč dál nefunguje a nepoužité odkazy na nový klíč propadnou. Vždy musí zůstat aspoň jeden správce, který se může přihlásit. |
| GitHub | Token má jen server, prohlížeč ho nikdy nevidí. Server zapisuje jen `content/topics/<ročník>/<předmět>/<id>.json` a `_subject.json` a jen do nových větví `moderace/*`. Do `main` nikdy nepíše, slučuje vždy člověk. |
| Data | Jeden SQLite soubor ve volume `/data`. Obsahuje jména moderátorů, veřejné klíče, hashe session a pozvánek, návrhy a záznam událostí. |

## Nasazení

Samostatná aplikace v Coolify (projekt Šprtám) ze stejného repozitáře:

- Dockerfile `moderator/Dockerfile`, build context je kořen repozitáře, port 8090, healthcheck `/healthz`, volume `/data`.
- Doména `moderace.sprtam.cz` (Cloudflare, proxied). Nasazuje se automaticky po pushi do `main`, stejně jako hlavní aplikace.

| Proměnná | Význam |
|---|---|
| `ORIGIN` | Přesná veřejná adresa, `https://moderace.sprtam.cz`. Jsou na ni vázané passkeys, proto se nesmí měnit, jinak se nikdo nepřihlásí. |
| `GITHUB_TOKEN` | Fine-grained token jen pro `mrpajzl/sprtam` s oprávněními *Contents: read and write*, *Pull requests: read and write* a *Metadata: read*. Bez něj se návrhy jen ukládají. |
| `GITHUB_REPO`, `GITHUB_BASE` | Výchozí `mrpajzl/sprtam` a `main`. |
| `TRUST_PROXY` | `1` za Cloudflare: IP adresa klienta se bere z `CF-Connecting-IP` (pro limity a záznam událostí). V Dockerfile je zapnutá. |
| `DATA_DIR`, `PORT` | `/data` a `8090`. |

## Vývoj

```sh
npm run moderator:dev     # server :8095 (tsx watch) + editor :5180 (Vite)
npm run moderator:build   # typy + editor do moderator/dist + server do moderator/dist-server
node moderator/dist-server/cli.mjs invite "Já" admin   # první účet lokálně (odkaz na localhost:5180)
```

Passkeys fungují i na `http://localhost`. Server bez `GITHUB_TOKEN` návrhy jen ukládá.

Test celého toku a bezpečnostních pravidel: `npm run moderator:build && node scripts/moderator-test.mjs`. Test spustí vlastní server s prázdnou databází a v Chromiu s virtuálními klíči projde pozvánku, přihlášení, podvržené výzvy a požadavky z cizích stránek, editor s náhledem, oddělení návrhů mezi moderátory i správu účtů.

| Kde | Co |
|---|---|
| `moderator/server/` | HTTP server bez frameworku: `auth.ts` (passkeys, session, pozvánky), `admin.ts`, `drafts.ts` (návrhy a pull requesty), `github.ts`, `content.ts`, `db.ts` (SQLite), `cli.ts` |
| `moderator/src/` | Editor (Preact): `editor/` (karty bloků a otázek, formulář pomůcky generovaný z jejího schématu, kontrola, historie změn, náhled), `screens/`, `passkey.ts` |
| `moderator/src/preview/` | Náhled v iframe nad komponentami aplikace (`src/screens/Blocks.tsx`, `src/quiz/QuestionView.tsx`, `src/styles.css`) |
| `src/content/rules.ts` | Pravidla tématu, sdílená s `scripts/check-content.ts` (anglicky pro skript, česky pro editor) |
| `src/content/canonical.ts` | Zápis souboru ve stejném pořadí klíčů jako v repozitáři, aby diff v PR obsahoval jen skutečné změny |
