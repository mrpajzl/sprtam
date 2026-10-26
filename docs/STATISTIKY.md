# Statistiky používání

> **Ve zkratce:** Chceme vědět jediné: kolik lidí aplikaci denně otevře a kolik z nich je nových. Proto aplikace nejvýš jednou denně pošle na náš server zprávu `{"new":true}` nebo `{"new":false}`. Nic dalšího se nesleduje: žádné ID, žádná cookie, žádné výsledky ani témata. Server si ukládá jen dvě čísla za den.

## Co přesně se posílá

Celý kód na straně aplikace má necelých 20 řádků: [`src/stats.ts`](../src/stats.ts).

```http
POST /api/ping
Content-Type: text/plain

{"new":false}
```

To je celá zpráva. `new` je `true`, pokud tohle zařízení posílá ping úplně poprvé, jinak `false`.

### Kdy

1. Při každém spuštění se aplikace podívá do svého úložiště na klíč `sprtam:seen` (datum posledního pingu).
2. Pokud je to dnešní datum, **nepošle nic**.
3. Jinak uloží dnešní datum a pošle ping. Pokud předchozí datum chybělo, pošle `new: true`.

„Dnes“ se počítá v čase UTC, takže nový den pro statistiky začíná v 1:00 (v zimě) nebo ve 2:00 (v létě) českého času.

### Kdy se neposílá vůbec

- Prohlížeč žádá o nesledování: **Do Not Track** nebo **Global Privacy Control**.
- Jsi offline. Ping se nikam neukládá a nedoposílá se později. Datum se ale uloží už před odesláním, takže ten den se už nezapočítáš.
- Ve vývojové verzi aplikace. Ping je zapnutý jen v produkčním buildu proměnnou `VITE_STATS_URL=/api/ping` v [`Dockerfile`](../Dockerfile).

## Co se neposílá

- **Žádný identifikátor** zařízení ani uživatele. Dva pingy od stejného člověka nejdou od sebe odlišit od pingů dvou různých lidí.
- **Žádné cookies.** Ping se posílá přes `navigator.sendBeacon` (záložně `fetch` s `credentials: 'omit'`). Aplikace ani server žádné cookies nenastavují, takže se žádné neposílají.
- **Nic o učení:** která témata, výsledky, kolik času, který ročník.
- **Nic o zařízení:** aplikace sama neposílá typ telefonu, rozlišení ani jazyk. Prohlížeč k požadavku jako ke každému jinému přidá běžné hlavičky (např. typ prohlížeče), ale server je nečte ani neukládá.

## Co server ukládá

Kód serveru: funkce `ping` v [`server/index.ts`](../server/index.ts). Server z celého požadavku přečte jen tělo (nejvýš zhruba 100 znaků) a zvýší dvě počítadla pro dnešní den:

```json
{
  "2026-10-24": { "users": 412, "new": 37 },
  "2026-10-25": { "users": 398, "new": 29 }
}
```

(Čísla jsou jen ilustrační.)

- `users` = kolik pingů ten den přišlo ≈ kolik zařízení aplikaci otevřelo.
- `new` = kolik z nich ji otevřelo poprvé.

Soubor `stats.json` leží na disku serveru (v produkci ve složce `/data`) a zapisuje se nejvýš jednou za 10 sekund. **IP adresa, čas ani nic jiného se neukládá.** Server nevede žádný log požadavků.

## Jak přesná ta čísla jsou

Záměrně nepřesná. Bez identifikátoru nejde poznat, kdo je kdo:

- Kdo používá Šprtám na telefonu i na počítači, započítá se dvakrát.
- Kdo si vymaže data prohlížeče nebo používá anonymní okno, započítá se jako nový.
- Kdo má zapnuté Do Not Track či Global Privacy Control nebo blokuje `/api/ping`, nezapočítá se vůbec.
- Kdo poprvé otevře aplikaci offline, nikdy se nezapočítá jako nový.
- Kdokoli může poslat falešný ping. Server nijak neověřuje, že přišel z aplikace.

Pro náš účel to stačí: vidíme, jestli aplikaci lidé používají a jestli roste.

## Kdo statistiky vidí

Souhrn je na adrese `/api/stats`, kterou na produkčním serveru chrání tajný token (proměnná `STATS_TOKEN`). Vidí ho jen provozovatel. Data v něm ale ani nic citlivého neobsahují: jsou to jen dvě čísla za den, přesně ve formátu výše.

## A co síť po cestě?

Ping jde přes stejnou cestu jako načtení stránky: Cloudflare → reverzní proxy na serveru → aplikace. Co z toho kdo vidí, popisuje [Soukromí](SOUKROMI.md#co-vidí-server-a-síť).

## Jak ping vypnout

- **Chrome a Edge:** zapni Do Not Track (Chrome: Nastavení → Soukromí a zabezpečení → Soubory cookie → „Spolu s provozem odesílat požadavek Nesledovat“).
- **Firefox:** zapni „Říct webům, aby neprodávaly ani nesdílely moje data“ (Global Privacy Control) v Nastavení → Soukromí a zabezpečení.
- **Brave:** Global Privacy Control je zapnutý automaticky.
- **Safari a ostatní:** zablokuj adresu `sprtam.cz/api/ping` v blokátoru obsahu.

Aplikace pak funguje úplně stejně.
