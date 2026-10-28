<img src="assets/icon.svg" width="64" height="64" alt="">

# Šprtám

**Opakování učiva základní a střední školy. Zdarma, bez účtů, bez reklam a bez sledování.**

👉 **[sprtam.cz](https://sprtam.cz)**

Šprtám vysvětlí každé téma dvěma různými způsoby, nechá tě ho procvičit v kvízu, písemce nebo ústním zkoušení a podle výsledků ti řekne, co zopakovat. Funguje v prohlížeči i jako aplikace na ploše, online i offline.

- **13 ročníků:** 1.–9. třída ZŠ a 1.–4. ročník gymnázia, přes 800 témat a přes 10 000 otázek.
- **Odborné školy:** obory (IT, strojírenství, mechatronik, kosmetické služby, starožitník) s odbornými předměty po ročnících – **[sprtam.cz/obor](https://sprtam.cz/obor)** ([jak to funguje](docs/OBORY.md)).
- **Dvě vysvětlení ke každému tématu** a 21 interaktivních pomůcek (číselná osa, zlomky, rovnice na vahách, hodiny…) – všechny v **[galerii](https://sprtam.cz/widgety)**.
- **Šest režimů:** Rychlý kvíz, Opakování, Písemka se známkou, Zkoušení nahlas, Test z předmětu a Mix.
- **Přijímačky na SŠ:** příprava na jednotnou přijímací zkoušku z češtiny a matematiky po oblastech a cvičné testy – **[sprtam.cz/prijimacky](https://sprtam.cz/prijimacky)**.
- **Slepá mapa:** hra na hledání krajů Česka, států Evropy a světa a jejich hlavních měst – **[sprtam.cz/slepa-mapa](https://sprtam.cz/slepa-mapa)**.
- **Anglická slovíčka A1–C1** s výslovností a opakováním podle Leitnerova systému.
- **Waldorfská škola:** učivo po epochách podle waldorfského plánu, vysvětlení v duchu waldorfské pedagogiky a slovní hodnocení – **[sprtam.cz/waldorf](https://sprtam.cz/waldorf)**.
- **Doporučení „Na řadě“:** co zopakovat, co ti nejde a na jakém základu z nižšího ročníku to stojí.
- **Sešit chyb a Dnešní opakování:** každá spletená otázka se vrací, dokud ji dvakrát neodpovíš správně, a co ti vypadává z hlavy, přijde na řadu podle opakování s rozestupy. K tomu **nápovědy** po krocích, **přehled** po předmětech a **denní cíl**.
- **Nahlásit chybu** přímo u otázky nebo vysvětlení, anonymně, rovnou moderátorům.
- **Hledání** ve všech ročnících a předmětech.

Podrobně: **[Jak Šprtám funguje](docs/JAK-TO-FUNGUJE.md)**

## Transparentnost

Šprtám je postavený tak, aby o tobě nemusel nic vědět. A protože je zdrojový kód veřejný, nemusíš nám to věřit, můžeš si to ověřit.

| | |
|---|---|
| 👤 **Účty** | Žádné. Nikde se nepřihlašuješ a nic o sobě nevyplňuješ. |
| 💾 **Tvůj pokrok** | Jen ve tvém zařízení (`localStorage`). Na serveru není žádná databáze uživatelů. |
| 🍪 **Cookies, reklamy, analytika** | Žádné. Žádný Google Analytics, žádné skripty třetích stran. |
| 📊 **Statistiky** | Žádné, ani anonymní. Nepočítáme uživatele ani návštěvy. Aplikace o tobě nikam nic neposílá. |
| 📱 **Přenos mezi zařízeními** | Napřímo ze zařízení do zařízení přes QR kódy, šifrovaně, bez našeho serveru. → [Propojení zařízení](docs/PROPOJENI-ZARIZENI.md) |
| 🔍 **Ověřitelnost** | Produkční verze se staví přímo z tohoto repozitáře. → [Architektura](docs/ARCHITEKTURA.md) |

Úplný seznam toho, co se kde ukládá a kam se co posílá: **[Soukromí](docs/SOUKROMI.md)**

## Dokumentace

| Dokument | Pro koho | O čem |
|---|---|---|
| [Jak Šprtám funguje](docs/JAK-TO-FUNGUJE.md) | žáci, rodiče, učitelé | Učivo, režimy, známky, doporučení, slovíčka |
| [Soukromí](docs/SOUKROMI.md) | všichni | Co aplikace ukládá, co posílá a komu, jak si to ověřit |
| [Propojení zařízení](docs/PROPOJENI-ZARIZENI.md) | všichni | Přenos pokroku přes QR kódy a WebRTC, kód pokroku |
| [Architektura](docs/ARCHITEKTURA.md) | vývojáři | Technologie, struktura kódu, server, nasazení, testy |
| [Jak psát učivo](docs/CONTENT.md) | autoři obsahu | Postup, pravidla výkladu, nový widget, změny formátu |
| [Formát obsahu](docs/FORMAT.md) | autoři obsahu | Reference všech polí JSON dokumentů učiva (generovaná) |
| [Obsah a jeho API](docs/OBSAH.md) | vývojáři | Kde je učivo uložené, vydání, API pro aplikaci |
| [Přístupy k výuce](docs/PRISTUPY.md) | autoři obsahu, rodiče | Waldorfská škola: epochy, vlastní výklad a témata |
| [Widgety](docs/WIDGETY.md) | autoři obsahu | Reference interaktivních pomůcek (generovaná), živě v [galerii](https://sprtam.cz/widgety) |
| [Moderace](docs/MODERACE.md) | moderátoři, správci | Editor učiva s živým náhledem, přihlášení klíčem, kontrola a schvalování jinými moderátory |
| [Obsah a jeho API](docs/OBSAH.md) | vývojáři, správci | Učivo v databázi: verze, vydání, historie, API pro aplikaci a pro moderování, zálohy |

## Našli jste chybu?

Ať už jde o chybu v učivu, nebo v aplikaci, založte prosím **[issue](https://github.com/mrpajzl/sprtam/issues/new/choose)**. U chyby v učivu pomůže odkaz na téma, znění otázky a jak by to mělo být správně. Chybu v otázce nahlásíte i přímo v aplikaci.

Chcete pomoct s kódem nebo s učivem? Postup je v **[CONTRIBUTING.md](CONTRIBUTING.md)**. Bezpečnostní chyby hlaste soukromě podle **[SECURITY.md](SECURITY.md)**.

## Vývoj

```sh
npm install
npm run content:pull     # místní kopie aktuálního učiva do content/
npm run dev              # http://localhost:5173
npm run check:content    # kontrola učiva (formát, widgety, odpovědi, pravidla výkladu)
npm run content:generate # JSON Schema a reference (FORMAT.md, WIDGETY.md) po změně formátu nebo widgetu
npm run content:format   # sjednotí formátování JSON v content/
npm run build            # kontrola typů + produkční build aplikace (dist/) a serveru (dist-server/)
```

Učivo jsou JSON dokumenty v obsahové službě (moderace) a aplikace je čte za běhu: [Obsah a jeho API](docs/OBSAH.md). Widgety jsou v `src/widgets/`, každý ve vlastním souboru.
Struktura kódu, testy a nasazení: [Architektura](docs/ARCHITEKTURA.md). Jak přidat učivo nebo widget: [CONTENT.md](docs/CONTENT.md).

## Licence

- **Kód** je pod licencí **[MIT](LICENSE)**.
- **Učivo** (výklady, otázky, slovíčka, plány přístupů) a výslovnost slovíček v `public/audio/` jsou pod licencí **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.cs)**. Smíš je používat, upravovat a šířit, i komerčně, když uvedeš původ (*Učivo: [Šprtám](https://sprtam.cz), CC BY-SA 4.0*) a úpravy zveřejníš pod stejnou licencí. Celé učivo i s historií je v repozitáři **[mrpajzl/sprtam-content](https://github.com/mrpajzl/sprtam-content)**, aktuální vydání i v [API](docs/OBSAH.md#veřejné-api-obsahové-služby).
- **Mapy** ve Slepé mapě jsou z [Natural Earth](https://www.naturalearthdata.com) (volné dílo), zjednodušené skriptem [`scripts/maps-generate.ts`](scripts/maps-generate.ts).

Pravidla chování v projektu: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
