# Učivo Šprtámu

Veškeré učivo aplikace **[Šprtám](https://sprtam.cz)**: výklady a otázky ke všem tématům 1.–9. třídy ZŠ a 1.–4. ročníku gymnázia, anglická slovíčka A1–C1 a plány přístupů k výuce (waldorfská škola).

Učivo je pod licencí **[Creative Commons Uveďte původ-Zachovejte licenci 4.0 Mezinárodní (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.cs)**. Smíš ho volně používat, upravovat a šířit, i komerčně, pokud:

- **uvedeš původ**, například: *Učivo: [Šprtám](https://sprtam.cz), licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.cs)*, a označíš, co jsi změnil/a;
- svoje úpravy zveřejníš **pod stejnou licencí**.

Úplné znění licence je v souboru [LICENSE](LICENSE).

## Co tu je

Každý soubor v `content/` je jeden JSON dokument ([formát](https://github.com/mrpajzl/sprtam/blob/main/docs/FORMAT.md)):

| Cesta | Obsah |
|---|---|
| `content/topics/<ročník>/<předmět>/<id>.json` | jedno téma: dvě vysvětlení a otázky |
| `content/topics/<ročník>/<předmět>/_subject.json` | pořadí témat předmětu |
| `content/vocab/<a1…c1>.json` | anglická slovíčka jedné úrovně |
| `content/approaches/<id>/…` | přístup k výuce a jeho plán ročníků |

Repozitář je **jen pro čtení**. Plní ho automaticky záloha obsahové služby: každý commit je jedno vydání učiva tak, jak se zveřejnilo na sprtam.cz, i s autorem a tím, kdo změnu schválil. Aktuální vydání je i v API: `https://moderace.sprtam.cz/api/public/v1/export`.

## Našel/našla jsi chybu?

Pull requesty sem nepřijímáme, učivo se mění v [moderaci](https://moderace.sprtam.cz), kde každou změnu schvaluje jiný moderátor.

- V aplikaci u otázky klikni na **Nahlásit chybu**, nebo
- založ [issue v repozitáři aplikace](https://github.com/mrpajzl/sprtam/issues/new?template=chyba-v-ucivu.yml).

Chceš učivo psát a opravovat? Napiš na [info@sprtam.cz](mailto:info@sprtam.cz). Kód aplikace je v [mrpajzl/sprtam](https://github.com/mrpajzl/sprtam) (MIT).
