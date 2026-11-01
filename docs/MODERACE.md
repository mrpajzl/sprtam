# Moderace

Samostatná aplikace pro úpravy a tvorbu učiva: **[moderace.sprtam.cz](https://moderace.sprtam.cz)**.

- Učivo si v ní kdokoli prohlédne bez přihlášení.
- Pozvaní moderátoři v ní upravují témata v editoru s živým náhledem. Hotovou změnu pošlou **ke kontrole**.
- Jakmile ji schválí jiný moderátor, je hned na sprtam.cz. Správce může svou změnu schválit i sám.

Učivo je pod licencí **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.cs)** a je veřejně ke stažení i s historií ([OBSAH.md](OBSAH.md#licence)). Moderátor to odsouhlasí při každém odeslání změny ke kontrole. Jeho jméno je v historii tématu i ve veřejném zrcadle učiva jako jméno autora nebo schvalovatele.

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
7. Vlastní změny najdeš v **Kontrole** se zaškrtnutým **Pouze moje** (stará adresa `/navrhy` vede tam): rozpracované a odeslané v kartě *Otevřeno*, vyřízené ve *Schváleno* a *Zamítnuto*. Z detailu své změny **pokračuješ v úpravách** (rozpracovaný návrh jde i smazat), u vyřízené změny tématu je **Upravit znovu**.

## Kontrola

- **Kontrola** (číslo v liště říká, kolik změn čeká na tebe) má tři karty: **Otevřeno** (změny čekající na kontrolu a rozpracované návrhy všech moderátorů; u každé, která čeká na tebe, je tlačítko **Zkontrolovat**), **Schváleno** a **Zamítnuto** (kdo rozhodl, kdy, ve kterém vydání, u zamítnutí i důvod; ukazuje posledních 200). Filtry: **ročník**, **předmět** a **Pouze moje** (jen tvoje změny); zůstávají v adrese, takže jde poslat odkaz. Všechny karty vidí každý moderátor, i s celou konverzací u změny. Na stránce tématu je změna poslaná ke kontrole vidět taky (**Zkontrolovat a schválit**).
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
- Nad změnou je rámeček **automatické kontroly** s tipy ([Ověřování](#ověřování)) a u opravy hlášení seznam hlášení, která změna opravuje. Klávesové zkratky ukáže **?** ([níže](#klávesové-zkratky-a-uložené-odpovědi)).
- **Požádat o úpravy** blokuje zveřejnění, dokud autor návrh neupraví.
- **Schválit** (u posledního potřebného schválení **Schválit a zveřejnit**) změnu hned zveřejní jako nové vydání.
- Moderátor vlastní změnu schválit nemůže. **Správce** může: rámeček mu ukáže *Jako správce ji můžeš schválit sám/sama*, a protože tím změnu zveřejní bez druhého páru očí, aplikace si řekne o potvrzení klíčem (přihlášení v posledních 15 minutách). API tokenem to nejde. Schvaluje se přesně ta verze, kterou vidíš: když ji autor mezitím upraví, je potřeba podívat se znovu.
- **Konflikt:** téma mezitím změnil a zveřejnil někdo jiný. Autor uvidí, co se zveřejnilo, přenese to do svého návrhu a převede ho na novou verzi.

## Ověřování

Učivo od AI se zveřejní hned jako **neověřené** ([OBSAH.md](OBSAH.md#neověřené-učivo)). Úvodní stránka ukáže, kolik témat čeká na ověření; **Ověřovat** vede na frontu **Ověřování** (`/overovani`, stará adresa `/ucivo?neovereno=1` vede tam).

- **Fronta** řadí témata tak, jak se vyplatí je kontrolovat: nahoře co sis vzal/a nebo rozpracoval/a, pak **tvoje předměty** (z Můj profil), pak témata, ke kterým žáci hlásí chyby, a dál v pořadí učiva. Filtry: ročník, předmět a **Jen moje předměty** (`?rocnik=&predmet=`, `?vse=1` všechny předměty). Témata, která si bere někdo jiný, jsou na konci.
- **Beru si to** řekne ostatním, že téma kontroluješ (ve frontě i na stránce tématu). Platí 2 dny, jde ho prodloužit nebo uvolnit; správce může uvolnit i cizí. Najednou jde mít zamluveno nejvýš 40 věcí. Ověřením se uvolní samo.
- **Ověřovat po částech:** u neověřeného tématu je vedle každého vysvětlení a každé otázky zaškrtávátko. Projdi vysvětlení v telefonu, otázku i s odpovědí a odškrtni je. Rámeček ukazuje, kolik jsi prošel/a; průběh se ukládá, takže jde pokračovat jindy (i na jiném zařízení). Odškrtnutí patří k textu, který jsi viděl/a: když se téma mezitím změní, je potřeba se znovu podívat jen na změněné části. Každý moderátor má svoje odškrtnutí.
- **Ověřit** jde, až je odškrtnuté všechno (server to hlídá). U tématu se pak ukáže *Prošlo kontrolou*, tvoje jméno a datum (v moderaci, v aplikaci i ve veřejné historii). Hned nabídne **další téma k ověření** z fronty.
- Když něco nesedí, téma raději uprav a pošli ke kontrole – schválená úprava se počítá jako ověřená.
- **Automatická kontrola** (rámeček s tipy) upozorní na možné překlepy (dvojí mezery, slovo dvakrát, mezera před čárkou, neuzavřené `**`, vzorce a uvozovky), výpočet, který nesedí s odpovědí (např. „Kolik je 12 · 3 + 4?“ s odpovědí 41), správnou možnost, která se prozrazuje délkou, stejnou otázku dvakrát, všechny otázky pravda/nepravda se stejnou odpovědí a moc dlouhé věty na daný ročník. Jsou to jen tipy, nic neblokují. Pořadí možností u otázek s výběrem nehlídá – aplikace je dětem míchá sama. Pravopis podtrhává prohlížeč přímo v polích editoru.
- **Přehled pokrytí** (`/pokryti`, z fronty nebo pod **Více**): pro každý ročník a předmět kolik témat je, kolik ověřil člověk, otevřená hlášení, rozpracované změny a témata, která někdo právě kontroluje. Řazení podle ročníků nebo od nejméně ověřených; klik vede na příslušný seznam.

## Na mně

**Na mně** (`/na-mne`, číslo v liště = nové věci) je jedno místo pro všechno, co se týká tebe:

- **Čeká na tvoje rozhodnutí:** změny ostatních odeslané ke kontrole, ke kterým ses ještě nevyjádřil/a.
- **Novinky** za posledních 30 dní: zprávy a rozhodnutí u tvých změn (komentář, žádost o úpravy, schválení, zveřejnění, zamítnutí), odpovědi ve vláknech, kam jsi psal/a, a nová hlášení od žáků k tématům, která jsi napsal/a, schválil/a nebo ověřil/a (jejich zveřejněná verze je tvoje).
- Otevřením položky (nebo změny v Kontrole) se položka označí jako přečtená; **Označit vše jako přečtené** všechno najednou, **Jen nové** schová přečtené.
- **Máš zamluveno:** co sis vzal/a přes Beru si to.

Moderace nic neposílá e-mailem ani jinak – Na mně je vidět jen v ní.

## Žádosti o moderátorství

Celé učivo zatím napsala AI (Claude Opus 5.5) a nechceme to skrývat: každé téma v aplikaci ukazuje autora a jestli ho už zkontroloval člověk (a kdo). U nezkontrolovaného je tlačítko **Chci to zkontrolovat a schválit**, v moderaci u tématu **Chci to schválit** a v hlavičce **Zapojit se**.

- Vedou na **[moderace.sprtam.cz/zapojit-se](https://moderace.sprtam.cz/zapojit-se)** (`?tema=<ročník>/<předmět>/<téma>`, když se přichází od tématu). Krátký formulář bez přihlášení: jméno, e-mail, jestli je pedagog, a když ano, jaké předměty učí, a volný text.
- Formulář jde poslat jen z moderace samotné (stejná kontrola původu jako jinde), nejvýš 5× za hodinu z jedné adresy a 200× za den celkem. S jedním e-mailem čeká vždy nejvýš jedna žádost. Skryté pole chytá jednoduché roboty.
- **Žádosti** (jen správce, s počtem čekajících; na telefonu pod **Více**): kdo, e-mail, jestli učí a co, poznámka a téma, od kterého přišel.
  - **Schválit a vytvořit pozvánku** (s čerstvým potvrzením klíčem) vytvoří jednorázovou pozvánku na jméno žadatele s rolí Moderátor. Odkaz jde zkopírovat, nebo tlačítkem **Napsat e-mail s odkazem** otevřít připravený e-mail ve vlastní poště. Moderace sama nic neposílá.
  - Ve **Vyřízených** je vidět, kdo žádost vyřídil a jestli si žadatel už účet vytvořil. Dokud ne, **Nový odkaz** vydá nový a starý přestane platit.
  - **Zamítnout** (s nepovinnou poznámkou pro ostatní správce) žadateli nic nepošle.
- Vyřízené žádosti se i s e-mailem po 180 dnech smažou. V záznamu událostí je jen to, že žádost přišla nebo byla vyřízena, bez osobních údajů.

## Profil moderátora

Každý moderátor se může představit tak, jak chce. V **Účtu** je **Můj profil**:

- **Jméno**: ukazuje se u témat, která zkontroluješ, v historii a ve veřejném zrcadle učiva. Jde změnit (třeba přidat titul). Nesmí obsahovat čárku (víc kontrolorů jednoho tématu se odděluje čárkou) a nesmí být stejné jako současné ani dřívější jméno jiného moderátora (bez ohledu na velká a malá písmena). U témat zkontrolovaných dřív zůstane předchozí jméno, odkaz z nich ale vede na tvůj profil dál.
- **Kdo jsem** (jedna věta), **O mně** (pár odstavců), **předměty**, kterým se věnuješ (nejvýš 8, i odborné), **web** (jen `https://`) a **obrázek**: jeden z nabídnutých obrázků, nebo iniciály. Fotky se nenahrávají a e-mail ani telefon tu nejsou.
- **Zobrazit profil veřejně**: bez zaškrtnutí profil vidí jen přihlášení moderátoři.

Veřejné profily jsou na **[moderace.sprtam.cz/moderatori](https://moderace.sprtam.cz/moderatori)** (*Kdo kontroluje učivo*; v hlavičce bez přihlášení, na telefonu pod **Více**, v aplikaci v *O aplikaci*). Profil ukazuje i počet a seznam témat, která moderátor zkontroloval (podle účtu: schválení změny nebo **Ověřit** u aktuální verze tématu), a od kdy moderuje. Jméno u *Zkontrolováno člověkem* v aplikaci i v moderaci vede na profil (`/moderatori?jmeno=<jméno>`). Bez veřejného profilu ukáže seznam.

API tokenem profil změnit nejde. Záznam událostí si pamatuje změnu jména a zveřejnění profilu, ne texty.

## Hlášení od žáků

Žáci v aplikaci u každé otázky (po odpovědi) a u každého vysvětlení klepnou na **Nahlásit chybu**, nebo v otázce či vysvětlení označí slova a klepnou na **Nahlásit chybu**, které se pod nimi objeví, vyberou, co je špatně (*Špatná odpověď nebo chyba*, *Nejasné zadání*, *Překlep*, *Jiné*), a můžou připsat krátkou poznámku. Hlášení se objeví na záložce **Hlášení** (na telefonu ve spodní liště, s počtem otevřených).

- Každé hlášení ukazuje téma, kterou otázku (číslo a znění, jak ho žák viděl) nebo které vysvětlení, označený text (když žák hlásil z označení), důvod, poznámku a číslo vydání učiva, ve kterém to žák viděl. Když se téma mezitím změnilo, otázka může mít jiné číslo, proto je tam i znění.
- **Stejná hlášení** k témuž místu tématu od více žáků jsou spojená v jednu kartu (*3× nahlášeno*) se všemi poznámkami a vyřizují se najednou.
- O odesílateli tam nic není: žádná adresa, zařízení ani jméno. Server sprtam.cz hlášení zkontroluje a pošle dál jen jeho obsah ([OBSAH.md](OBSAH.md#hlášení-chyb-od-žáků)).
- **Opravit** otevře tvůj návrh tématu (rozpracovaný pokračuje) přímo na nahlášené otázce a hlášení jsou připnutá nad editorem. Oprava jde běžnou kontrolou; kontrolor vidí, která hlášení změna opravuje. **Až se změna zveřejní, hlášení se sama vyřídí jako opravená** (s číslem vydání). Ostatní u hlášení vidí, kdo ho opravuje. Když z editoru odejdeš bez úpravy, návrh zmizí a hlášení zůstane volné.
- **Opraveno** vyřídí hlášení ručně (třeba když už to opravil někdo jiný). Když je učivo v pořádku, **Zamítnout** (s nepovinnou poznámkou pro ostatní moderátory; časté texty jde uložit jako **uloženou odpověď** a příště vložit klepnutím). Vyřízené hlášení jde **znovu otevřít**.
- **Beru si to** u hlášení řekne ostatním, že ho řešíš (na 2 dny). Opravit si hlášení bere samo.
- U tématu, ke kterému jsou otevřená hlášení, je nahoře upozornění s odkazem na ně. Filtrovat jde i podle ročníku a předmětu.

## Hledat a nahradit

**Hledat** (`/hledat`, pod **Více**, nebo z hledání v Učivu tlačítkem *Hledat i v textu témat*) prohledá celý text zveřejněných témat: výklad, otázky, možnosti, odpovědi i nápovědy. Na velkých písmenech a diakritice nezáleží (zaškrtnutím **Přesně** ano). Hledat může i nepřihlášený, je to stejné učivo, jaké je veřejné.

**Nahradit…** (jen moderátoři) nahradí přesný text ve vybraných tématech (nejvýš 50 najednou). Hledaný text se při přepnutí převezme přesně tak, jak je v tématech. U každého výskytu je vidět, jak bude vypadat. Každé vybrané téma se stane **tvým návrhem** (rozpracovaný návrh tématu se doplní; téma s tvým návrhem v kontrole se přeskočí) a s **Rovnou odeslat ke kontrole** se rovnou odešle se vzkazem, co se nahradilo. Zveřejní se, až ho schválí jiný moderátor. Nahrazuje se jen text pro žáky, nikdy id, nastavení pomůcek ani emoji.

## Klávesové zkratky a uložené odpovědi

Na obrazovkách **Kontrola** (změna), **Hlášení**, **Ověřování** a na stránce tématu fungují zkratky jednou klávesou; **?** je vypíše. Nefungují při psaní do pole.

- Kontrola: **J/K** další/předchozí změněný blok nebo otázka (ukáže ji i v telefonu), **A** schválit (zeptá se), **R** požádat o úpravy, **N** další změna, která čeká na tebe. Po schválení nebo žádosti o úpravy se rovnou otevře další změna, která čeká na tebe.
- Hlášení: **J/K** pohyb mezi kartami, **O** opravit, **T** otevřít téma, **F** opraveno, **Z** zamítnout, **B** beru si to.
- Ověřování: **J/K** pohyb, **O** otevřít, **B** beru si to; na stránce tématu **J/K** vysvětlení a otázky, **X** odškrtnout a jít na další, **O** ověřit.

**Uložené odpovědi:** v okně *Požádat o úpravy* a *Zamítnout hlášení* jde text zaškrtnutím uložit a příště ho vložit jedním klepnutím. Každý moderátor má svoje (nejvýš 30 na druh), smazat jde křížkem.

## Historie a pomůcky

- **Historie** tématu (tlačítko u tématu):
  - každá zveřejněná verze, kdo ji změnil a kdo schválil, a co změnila;
  - **Navrhnout návrat k této verzi** založí návrh se starým obsahem, který jde normálně ke kontrole.
- **Pomůcky:** chybí ti při vysvětlování interaktivní pomůcka (váhy, mapa, osa…)? Navrhni ji: co si s ní mají děti vyzkoušet a ke kterým tématům patří. Ostatní ji můžou podpořit, správce ji naplánuje a po dokončení ji najdeš v editoru. Pod žádostmi je galerie všech pomůcek, které už jsou, naživo – často jde potřebná pomůcka nastavit z existující.
- **API tokeny** (Účet) jsou pro skripty a AI agenty, kteří připravují učivo jako tvoje návrhy. Schválit je musí někdo jiný ([OBSAH.md](OBSAH.md#api-pro-moderování)).

Pravidla pro obsah: [CONTENT.md](CONTENT.md). Editor je hlídá za tebe a ukazuje je u každého vysvětlení.

## Pro správce

- **Žádosti** o moderátorství z formuláře `/zapojit-se` ([výše](#žádosti-o-moderátorství)).
- **Moderátoři** (jen pro roli *Správce*): pozvat moderátora, změnit roli, vypnout účet, poslat odkaz na nový klíč, zrušit všechny klíče (ztracené nebo ukradené zařízení), odhlásit ze všech zařízení. Je tam i záznam událostí: přihlášení včetně neúspěšných, pozvánky, návrhy, kontroly, zveřejnění a další. Jde filtrovat podle toho, kdo akci udělal (i „bez účtu“ – CLI, uchazeči, neznámé klíče), podle druhu události (celá skupina nebo jedna akce) a hledáním v podrobnostech a IP adrese.
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
| Veřejná část | Bez přihlášení jde jen číst zveřejněné učivo (`GET /api/content/index`, `/api/content/topic/…` a veřejné API `/api/public/v1/…`) a poslat žádost o moderátorství (`POST /api/applications`, s limity). Veřejné profily moderátorů (`GET /api/moderators…`) jen těch, kdo je zveřejnili. Učivo je totéž, co ukazuje sprtam.cz. Návrhy, historii a jejich autory dostane jen přihlášený moderátor. Přihlášený moderátor vidí všechny návrhy včetně rozpracovaných (upravovat je smí jen autor, schvalovat až po odeslání ke kontrole). API token vidí svoje návrhy a cizí až po odeslání ke kontrole. Všechno ostatní chce session. |
| Cizí stránky | Každý požadavek, který něco mění, musí mít přesně náš `Origin` a `Sec-Fetch-Site: same-origin` a tělo jen jako JSON. CORS není povolené. Výjimkou jsou požadavky s API tokenem v hlavičce `Authorization`: nenesou cookies a prohlížeč je za cizí stránku bez CORS neodešle. |
| Zveřejnění | Jen schválením jiného moderátora (aktuální revize, bez konfliktu, celé učivo projde kontrolou), schválením vlastní změny správcem v prohlížeči s čerstvým potvrzením klíčem (v historii je vidět, kdo schválil), nebo nouzovou obnovou správcem s čerstvým potvrzením klíčem. Historie jde jen doplňovat a je chráněná hash řetězem ([OBSAH.md](OBSAH.md#bezpečnost)). |
| Hlavičky | Přísná CSP (jen `'self'`, žádné cizí skripty), HSTS, `frame-ancestors 'self'`, COOP/CORP, `no-referrer`, `noindex`. |
| Omezení | Rate limit přihlašování, pozvánek, zakládání, ukládání a odesílání návrhů (IPv6 po celých /64). Požadavky bez přihlášení mají nejvýš 16 kB, ostatní 512 kB. Jeden moderátor má nejvýš 50 otevřených návrhů. Adresu klienta z `CF-Connecting-IP` server bere jen od adres Cloudflare. |
| Vypnutý účet, zrušené klíče | Session se mažou okamžitě, klíč dál nefunguje a nepoužité odkazy na nový klíč propadnou. Vždy musí zůstat aspoň jeden správce, který se může přihlásit. |
| API tokeny | V databázi jen SHA-256, s platností, jen vybrané akce nad vlastními návrhy. Vypnutí účtu, zrušení klíčů a odhlášení ruší i tokeny. |
| Data | Jeden SQLite soubor ve volume `/data`. Obsahuje učivo se všemi verzemi, jména a profily moderátorů, žádosti o moderátorství (jméno, e-mail, vyřízené se po 180 dnech mažou), veřejné klíče, hashe session, tokenů a pozvánek, návrhy, kontroly a záznam událostí. Každou hodinu si ho zašifrovaně zálohuje druhý server ([OBSAH.md](OBSAH.md#zálohy)). |

## Nasazení

Samostatná aplikace v Coolify (projekt Šprtám) ze stejného repozitáře:

- Dockerfile `moderator/Dockerfile`, build context je kořen repozitáře, port 8090, healthcheck `/healthz`, volume `/data`.
- Doména `moderace.sprtam.cz` (Cloudflare, proxied). Nasazuje se automaticky po pushi do `main`, stejně jako hlavní aplikace.

| Proměnná | Význam |
|---|---|
| `ORIGIN` | Přesná veřejná adresa, `https://moderace.sprtam.cz`. Jsou na ni vázané passkeys, proto se nesmí měnit, jinak se nikdo nepřihlásí. |
| `REQUIRED_APPROVALS` | Kolik jiných moderátorů musí změnu schválit, výchozí 1. |
| `BACKUP_TOKEN` | Token, kterým si zálohy stahuje `hetzner-1` ([OBSAH.md](OBSAH.md#zálohy)). Bez něj jsou zálohy vypnuté. |
| `REPORT_TOKEN` | Token, se kterým server sprtam.cz posílá hlášení chyb od žáků ([OBSAH.md](OBSAH.md#hlášení-chyb-od-žáků)). Stejná hodnota musí být u aplikace sprtam.cz. Bez něj jsou hlášení vypnutá. |
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
- API tokeny, žádosti o pomůcky, žádosti o moderátorství a zálohy;
- správu účtů.

| Kde | Co |
|---|---|
| `moderator/server/` | HTTP server bez frameworku: `auth.ts` (passkeys, session, pozvánky, API tokeny), `admin.ts`, `store.ts` (učivo, verze, vydání, hash řetěz), `drafts.ts` (návrhy, kontrola, návraty), `requests.ts` (žádosti o pomůcky), `applications.ts` (žádosti o moderátorství), `backup.ts`, `content.ts`, `db.ts` (SQLite a migrace), `cli.ts` |
| `src/content/check.ts`, `diff.ts`, `release.ts` | Kontrola celého učiva (sdílená s `check:content`), rozdíly verzí, soubory vydání pro aplikaci |
| `ops/backup/` | Zálohy na druhém serveru ([OBSAH.md](OBSAH.md#zálohy)) |
| `moderator/src/` | Editor (Preact): `editor/` (karty bloků a otázek, formulář pomůcky generovaný z jejího schématu, kontrola, historie změn, náhled), `ui/Showcase.tsx` (galerie pomůcek naživo v rámečku náhledu), `screens/`, `passkey.ts` |
| `moderator/src/preview/` | Náhled v iframe nad komponentami aplikace (`src/screens/Blocks.tsx`, `src/quiz/QuestionView.tsx`, `src/styles.css`) |
| `src/content/rules.ts` | Pravidla tématu, sdílená s `scripts/check-content.ts` (anglicky pro skript, česky pro editor) |
| `src/content/canonical.ts` | Zápis souboru ve stejném pořadí klíčů jako v repozitáři, aby diff v PR obsahoval jen skutečné změny |
