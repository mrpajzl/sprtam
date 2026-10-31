# Odborné školy: obory a odborné předměty

Šprtám pokrývá kromě ZŠ a gymnázia i **střední odborné školy**. Žák si na [sprtam.cz/obor](https://sprtam.cz/obor) nebo v Moje škola (Já → Moje škola) vybere svůj obor. Úvodní obrazovka a ročníky SŠ (`/g/s1` až `/g/s4`) mu pak ukážou předměty tohoto oboru: nahoře odborné, pod nimi všeobecné. Volba oboru je nastavení zařízení jako motiv (`localStorage`, klíč `sprtam-obor`) a nikam se neposílá.

## Dvě vrstvy

| Co | Kde | Kdo mění |
|---|---|---|
| **Odborné předměty a jejich témata** | obsah: `topics/odb/<předmět>/…` (databáze moderace) | moderátoři, přes kontrolu jako každé jiné téma |
| **Obor**: kód, název, popis a které předměty má v kterém ročníku | kód: [`src/obory.ts`](../src/obory.ts) | pull request, stejně jako osnovy (`curriculum.ts`) a přijímačky (`exam.ts`) |

### Odborné předměty (obsah)

Leží v „ročníku“ `odb`, protože nepatří jednomu ročníku ani jednomu oboru. Technické kreslení se učí na strojírenství i mechatronice, ekonomika skoro všude. Téma se tak píše a kontroluje jednou a pokrok žáka v něm platí ve všech oborech (`odb/<předmět>/<téma>`).

- Adresy: `/g/odb` (všechny odborné předměty), `/g/odb/<předmět>`, `/g/odb/<předmět>/<téma>`.
- `_subject.json` odborného předmětu kromě pořadí témat obsahuje i `name`, `emoji` a `color`. U předmětů ZŠ a gymnázia tato pole být nesmí. Id předmětu je kebab-case a nesmí se shodovat s předmětem osnov (`matematika`, `cestina`…).
- Vydání nese seznam odborných předmětů v manifestu (`vocational`: id → název, emoji, barva), protože aplikace je potřebuje hned při startu.
- Nový odborný předmět nevyžaduje žádnou změnu kódu. Založí ho první schválené téma (viz [OBSAH.md](OBSAH.md), „Nový odborný předmět“).

### Obory (kód)

Každý obor v `OBORY` má id (adresa `/obor/<id>`, nemění se), kód oboru vzdělání podle RVP SOV (např. `18-20-M/01`), název, emoji, druh (`M` maturitní, `L` maturitní s odborným výcvikem, `H` s výučním listem), krátký popis a ročníky. Každý ročník uvádí:

- `odb`: odborné předměty (id z `topics/odb`) v pořadí, v jakém se ukazují;
- `general`: všeobecné předměty. Bere se učivo gymnázia stejného ročníku (1. ročník oboru = `s1`).

Obor se v aplikaci ukáže, až když obsah má aspoň jeden z jeho odborných předmětů. Předmět, který plán uvádí, ale obsah ho ještě nemá, se nezobrazí, jen poznámka „připravujeme“. Plán tedy nikdy neblokuje zveřejňování učiva. `npm run check:content` hlídá, že všeobecné předměty v daném ročníku existují a že kódy a id dávají smysl. Bez filtru vypíše i seznam odborných předmětů, na které obory zatím čekají.

## Nový obor

1. Projdi RVP oboru (edu.cz → RVP SOV) a běžné ŠVP. Rozhodni, které odborné předměty má po ročnících. Co už existuje, použij znovu (`/g/odb`). Nové předměty dělej tak, aby se daly sdílet s příbuznými obory.
2. Přidej obor do `OBORY` v `src/obory.ts`, spusť `npm run check:content` a pošli pull request.
3. Učivo nových předmětů napiš do `content/topics/odb/<předmět>/` (`npm run check:content -- topics/odb/<předmět>` musí skončit bez chyb). Pak ho pošli do moderace: `npx tsx scripts/content-propose.ts --unverified topics/odb/<předmět> …` ho rovnou zveřejní jako neověřené (moderátoři ho pak ověřují), bez `--unverified` půjde jako návrhy ke kontrole. Obojí zakládá předmět. Token je v `SPRTAM_TOKEN` nebo v `~/.config/sprtam/api-token` ([OBSAH.md](OBSAH.md)); opakované spuštění pošle jen to, co v moderaci ještě není. Jakmile je zveřejněné první téma, obor se objeví v aplikaci.

## Obory teď

| Obor | Kód | Odborné předměty |
|---|---|---|
| 💻 Informační technologie | 18-20-M/01 | hardware, operační systémy, programování, webové technologie, sítě, elektronika, databáze, kybernetická bezpečnost, ekonomika |
| ⚙️ Strojírenství | 23-41-M/01 | technické kreslení, materiály, technická mechanika, technologie, části strojů, elektrotechnika, CNC a CAD/CAM, automatizace, ekonomika |
| 🦾 Mechatronik (Mechanik seřizovač) | 23-45-L/01 | technické kreslení, materiály, elektrotechnika, technologie, elektronika, mechanika, části strojů, automatizace, CNC, ekonomika |
| 💆 Kosmetické služby | 69-41-L/01 | zdravověda a dermatologie, kosmetika, kosmetické přípravky, psychologie a komunikace, manikúra a pedikúra, líčení a vizáž, ekonomika |
| 🏺 Starožitník | 82-48-L/01 | dějiny umění a slohy, nábytek, sklo a porcelán, kovy a šperky, obrazy a grafika, starožitnický obchod, komunikace, ekonomika |

Všeobecné předměty zatím vycházejí z učiva gymnázia. Pro maturitní obory je to dobrá příprava, jen místy jde do větší hloubky, než SOŠ vyžaduje.
