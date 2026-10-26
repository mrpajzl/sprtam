// What Šprtám is and how it works, in a few lines. One text for the app's /o-aplikaci screen
// (src/screens/About.tsx) and the page the server renders (server/pages.ts). Inline markup as in content.

export const ABOUT = {
  title: 'O aplikaci',
  description: 'Co je Šprtám a jak funguje: vysvětlení, procvičování a doporučení, co zopakovat. Zdarma, bez účtů, bez reklam a bez sledování.',
  lead: '**Šprtám** je na opakování učiva od 1. třídy ZŠ po 4. ročník gymnázia. Je zdarma, nemá účty ani reklamy a nic o tobě nesbírá.',
  sections: [
    {
      title: 'Jak to funguje',
      items: [
        '**Vyber si ročník a téma.** Každé téma je vysvětlené dvěma různými způsoby, od úplných základů.',
        '**Procvič si ho:** rychlý kvíz, opakování, písemka se známkou nebo zkoušení nahlas.',
        '**Podívej se do „Na řadě“.** Podle výsledků ti Šprtám řekne, co zopakovat, co ti nejde a na čem z nižšího ročníku to stojí.',
        '**Anglická slovíčka** od A1 do C1, s výslovností.',
      ],
    },
    {
      title: 'Soukromí',
      items: [
        'Nikde se nepřihlašuješ a nic o sobě nevyplňuješ.',
        'Pokrok je jen v tomhle zařízení. Na jiné ho přeneseš přes QR kód, napřímo a šifrovaně.',
        'Žádné cookies, reklamy ani analytika. Server si za den pamatuje jen dvě čísla: kolik lidí appku otevřelo a kolik z nich poprvé.',
      ],
    },
    {
      title: 'Tipy',
      items: [
        'Přidej si Šprtám na plochu. Pak se otevírá jako aplikace a funguje i offline.',
        'Klávesa `/` otevře hledání odkudkoli.',
        'Téma, které chceš opakovat, si připni. Uvidíš ho hned na úvodní obrazovce.',
      ],
    },
  ],
}
