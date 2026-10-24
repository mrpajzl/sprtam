<img src="assets/icon.svg" width="64" height="64" alt="">

# Šprtám

Opakování učiva základní a střední školy jako PWA. Bez účtů, bez reklam, bez ukládání dat na server.

- **Stupeň → třída → předmět → téma**, obsah podle RVP ZV a RVP G (`src/content/data/<třída>/<předmět>.ts`).
- Každé téma má **dvě různá vysvětlení** („Nerozumím – vysvětli to jinak“) s interaktivními widgety.
- Režimy: **Rychlý kvíz**, **Opakování** (chyby se vracejí, dokud to neumíš), **Písemka** (známka 1–5), **Zkoušení** (ústní otázky, sebehodnocení) a **Test** z celého předmětu.
- **Anglická slovíčka** podle úrovně A1–C1: „Jak se řekne ‚pták‘?“ → swipe doprava = správně, doleva = špatně. Slova se opakují podle Leitnerova systému.
- **Hledání v celé databázi** (`/` nebo lupa): všechna témata všech ročníků podle názvu, pojmů a hlavních pravidel, plus všechna anglická slovíčka. Bez diakritiky, s filtrem stupně. Index staví při buildu `plugins/topic-index.ts` (`virtual:topic-index`, `virtual:topic-text`), takže se nenačítají všechny předměty.
- **Připnutá témata** (špendlík u tématu) a **Mix**: jedno kolo otázek ze všech připnutých témat.
- **Na řadě**: doporučení podle toho, co si žák opakoval (`src/progress/recommend.ts`): opakování s rozestupy podle posledního výsledku (připnutá dřív), slabá témata, další téma v pořadí a základ z nižšího ročníku, na kterém slabé téma staví.
- Vzhled ve stylu malého přístroje (inspirace Teenage Engineering): barevné klávesy předmětů s vlastními SVG glyfy (`src/ui/glyphs.tsx`), maskot Šprťa (`src/ui/Mascot.tsx`), displej se sérií dní.
- Funguje **offline** (service worker má v cache celý obsah).

## Soukromí

- Pokrok je jen v `localStorage` zařízení.
- **Kód pokroku**: kompaktní binární zápis (3 bajty na položku: 21bitový hash názvu + stav) s kontrolním součtem SHA-256, jako QR kód nebo odkaz `#/p/<kód>`. Kód je ve fragmentu URL, takže se nikdy neposílá na server.
- **Propojení dvou zařízení (peer-to-peer)**: WebRTC DataChannel. Nabídku a odpověď si zařízení vymění naskenováním QR kódů (žádný signalizační server). Data jdou přímo mezi zařízeními, šifrovaně (DTLS). Veřejný STUN server (Google/Cloudflare) zařízení jen sdělí jeho veřejnou adresu, data nevidí. Pokrok obou zařízení se sloučí (lepší výsledek vyhrává).
- **Statistiky**: jednou denně anonymní `POST /api/ping` s `{ "new": true|false }`, bez ID, cookies a IP. Server ukládá jen denní součty (`data/stats.json`). Vypnuto, pokud chybí `VITE_STATS_URL`; respektuje Do Not Track.

## Vývoj

```sh
npm install
npm run dev              # http://localhost:5173
npm run check:content    # validace obsahu (schéma, odpovědi, počty otázek)
npm run build            # typy + produkční build do dist/
```

Pravidla pro psaní obsahu: [docs/CONTENT.md](docs/CONTENT.md).

Pomocné skripty pro vývoj (potřebují běžící dev server na :5179 a Playwright Chromium): `scripts/shots.mjs` (snímky obrazovek), `scripts/flow.mjs` (průchod kvízem), `scripts/p2p-test.mjs` (spojení dvou prohlížečů), `scripts/code-test.mjs` (kód pokroku), `scripts/widget-sheet.mjs` (přehled widgetů).

## Nasazení

`Dockerfile` sestaví aplikaci a spustí malý Node server (`server/index.mjs`): statické soubory + `/api/ping`, `/api/stats` (volitelně chráněné `STATS_TOKEN`) a `/healthz`. Data statistik ve volume `/data`.
