<img src="assets/icon.svg" width="64" height="64" alt="">

# Šprtám

**Opakování učiva základní a střední školy. Zdarma, bez účtů, bez reklam a bez sledování.**

👉 **[sprtam.cz](https://sprtam.cz)**

Šprtám vysvětlí každé téma dvěma různými způsoby, nechá tě ho procvičit v kvízu, písemce nebo ústním zkoušení a podle výsledků ti řekne, co zopakovat. Funguje v prohlížeči i jako aplikace na ploše, online i offline.

- **13 ročníků:** 1.–9. třída ZŠ a 1.–4. ročník gymnázia, přes 800 témat a přes 10 000 otázek.
- **Dvě vysvětlení ke každému tématu** a 21 interaktivních pomůcek (číselná osa, zlomky, rovnice na vahách, hodiny…) – všechny v **[galerii](https://sprtam.cz/widgety)**.
- **Šest režimů:** Rychlý kvíz, Opakování, Písemka se známkou, Zkoušení nahlas, Test z předmětu a Mix.
- **Anglická slovíčka A1–C1** s výslovností a opakováním podle Leitnerova systému.
- **Doporučení „Na řadě“:** co zopakovat, co ti nejde a na jakém základu z nižšího ročníku to stojí.
- **Hledání** ve všech ročnících a předmětech.

Podrobně: **[Jak Šprtám funguje](docs/JAK-TO-FUNGUJE.md)**

## Transparentnost

Šprtám je postavený tak, aby o tobě nemusel nic vědět. A protože je zdrojový kód veřejný, nemusíš nám to věřit, můžeš si to ověřit.

| | |
|---|---|
| 👤 **Účty** | Žádné. Nikde se nepřihlašuješ a nic o sobě nevyplňuješ. |
| 💾 **Tvůj pokrok** | Jen ve tvém zařízení (`localStorage`). Na serveru není žádná databáze uživatelů. |
| 🍪 **Cookies, reklamy, analytika** | Žádné. Žádný Google Analytics, žádné skripty třetích stran. |
| 📊 **Statistiky** | Jednou denně zpráva `{"new":true}` nebo `{"new":false}`, bez ID. Server si pamatuje jen dvě čísla za den. → [Statistiky](docs/STATISTIKY.md) |
| 📱 **Přenos mezi zařízeními** | Napřímo ze zařízení do zařízení přes QR kódy, šifrovaně, bez našeho serveru. → [Propojení zařízení](docs/PROPOJENI-ZARIZENI.md) |
| 🔍 **Ověřitelnost** | Produkční verze se staví přímo z tohoto repozitáře. → [Architektura](docs/ARCHITEKTURA.md) |

Úplný seznam toho, co se kde ukládá a kam se co posílá: **[Soukromí](docs/SOUKROMI.md)**

## Dokumentace

| Dokument | Pro koho | O čem |
|---|---|---|
| [Jak Šprtám funguje](docs/JAK-TO-FUNGUJE.md) | žáci, rodiče, učitelé | Učivo, režimy, známky, doporučení, slovíčka |
| [Soukromí](docs/SOUKROMI.md) | všichni | Co aplikace ukládá, co posílá a komu, jak si to ověřit |
| [Propojení zařízení](docs/PROPOJENI-ZARIZENI.md) | všichni | Přenos pokroku přes QR kódy a WebRTC, kód pokroku |
| [Statistiky](docs/STATISTIKY.md) | všichni | Jak přesně funguje počítání uživatelů |
| [Architektura](docs/ARCHITEKTURA.md) | vývojáři | Technologie, struktura kódu, server, nasazení, testy |
| [Jak psát učivo](docs/CONTENT.md) | autoři obsahu | Postup, pravidla výkladu, nový widget, změny formátu |
| [Formát obsahu](docs/FORMAT.md) | autoři obsahu | Reference všech polí JSON souborů v `content/` (generovaná) |
| [Widgety](docs/WIDGETY.md) | autoři obsahu | Reference interaktivních pomůcek (generovaná), živě v [galerii](https://sprtam.cz/widgety) |

## Našli jste chybu?

Ať už jde o chybu v učivu, nebo v aplikaci, založte prosím **[issue](https://github.com/mrpajzl/sprtam/issues/new)**. U chyby v učivu pomůže odkaz na téma, znění otázky a jak by to mělo být správně.

## Vývoj

```sh
npm install
npm run dev              # http://localhost:5173
npm run check:content    # kontrola učiva (formát, widgety, odpovědi, pravidla výkladu)
npm run content:generate # JSON Schema a reference (FORMAT.md, WIDGETY.md) po změně formátu nebo widgetu
npm run content:format   # sjednotí formátování JSON v content/
npm run build            # kontrola typů + produkční build do dist/
```

Učivo jsou JSON soubory v [`content/`](content) – jedno téma = jeden soubor. Widgety jsou v `src/widgets/`, každý ve vlastním souboru.
Struktura kódu, testy a nasazení: [Architektura](docs/ARCHITEKTURA.md). Jak přidat učivo nebo widget: [CONTENT.md](docs/CONTENT.md).
