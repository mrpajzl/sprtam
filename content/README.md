# Učivo

Učivo Šprtám je uložené v obsahové službě (moderace, databáze s verzemi) a aplikace ho čte za běhu: [docs/OBSAH.md](../docs/OBSAH.md). V gitu je z této složky jen `schema/` (JSON Schema pro editory, generované) a tento soubor.

`npm run content:pull` sem stáhne aktuální vydání jako soubory: `topics/<ročník>/<předmět>/` (témata a jejich pořadí v `_subject.json`), `vocab/` (anglická slovíčka), `approaches/` (přístupy k výuce, např. waldorfská škola, viz [docs/PRISTUPY.md](../docs/PRISTUPY.md)). Je to jen místní kopie pro vývoj, testy a skripty: není v gitu a další `content:pull` ji přepíše. Změny učiva jdou přes [moderaci](../docs/MODERACE.md).

- Jak psát obsah: [docs/CONTENT.md](../docs/CONTENT.md)
- Reference polí: [docs/FORMAT.md](../docs/FORMAT.md), widgety: [docs/WIDGETY.md](../docs/WIDGETY.md), galerie: [sprtam.cz/widgety](https://sprtam.cz/widgety)
- Kontrola místní kopie: `npm run check:content`
