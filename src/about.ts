// What Šprtám is and how it works, in a few lines. One text for the app's /o-aplikaci screen
// (src/screens/About.tsx) and the page the server renders (server/pages.ts). Inline markup as in content.

import { CONTENT_AUTHOR, JOIN_URL, MODERATORS_URL } from './content/verified'

export const ABOUT = {
  title: 'O aplikaci',
  description: 'Co je Šprtám a jak funguje: vysvětlení, procvičování a doporučení, co zopakovat. Zdarma, bez účtů, bez reklam a bez sledování.',
  lead: '**Šprtám** je na opakování učiva od 1. třídy ZŠ po 4. ročník gymnázia a odborných předmětů středních odborných škol. Je zdarma, nemá účty ani reklamy a nic o tobě nesbírá.',
  sections: [
    {
      title: 'Jak to funguje',
      items: [
        '**Vyber si ročník a téma.** Každé téma je vysvětlené dvěma různými způsoby, od úplných základů.',
        '**Procvič si ho:** rychlý kvíz, opakování, písemka se známkou nebo slovním hodnocením, zkoušení nahlas.',
        '**Podívej se do „Na řadě“.** Podle výsledků ti Šprtám řekne, co zopakovat, co ti nejde a na čem z nižšího ročníku to stojí.',
        '**Slovíčka** s výslovností: angličtina od A1 do C1, němčina, francouzština a španělština od A1 do B1.',
      ],
    },
    {
      title: 'Soukromí',
      items: [
        'Nikde se nepřihlašuješ a nic o sobě nevyplňuješ.',
        'Pokrok je jen v tomhle zařízení. Na jiné ho přeneseš přes QR kód, napřímo a šifrovaně.',
        'Nesledujeme tě. Žádné cookies, reklamy, analytika ani anonymní statistiky. Aplikace o tobě nikam nic neposílá.',
        'Zdrojový kód je veřejný, takže nám to nemusíš věřit. Můžeš si to ověřit.',
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
  // Open source: the code, the content mirror and the issue tracker (README.md, CONTRIBUTING.md, docs/OBSAH.md).
  code: {
    title: 'Otevřený kód a učivo',
    repo: 'https://github.com/mrpajzl/sprtam',
    links: [
      { label: 'Zdrojový kód', hint: 'GitHub · licence MIT', href: 'https://github.com/mrpajzl/sprtam' },
      { label: 'Učivo ke stažení', hint: 'GitHub · licence CC BY-SA 4.0', href: 'https://github.com/mrpajzl/sprtam-content' },
      { label: 'Kdo učivo kontroluje', hint: 'Profily moderátorů', href: MODERATORS_URL },
      { label: 'Nahlásit chybu nebo nápad', hint: 'GitHub Issues', href: 'https://github.com/mrpajzl/sprtam/issues/new/choose' },
    ],
  },
  join: {
    title: 'Zapoj se',
    lead: 'Pomoz nám, ať je učivo správně a srozumitelně.',
    items: [
      `**Zkontroluj učivo.** Celé ho zatím napsala AI (${CONTENT_AUTHOR}). U každého tématu je vidět, jestli ho už zkontroloval člověk. Učíš, nebo se v oboru vyznáš? Přihlas se jako moderátor/ka.`,
      '**Pomoz s kvalitou obsahu.** Vidíš chybu, nebo víš, jak něco vysvětlit líp?',
      '**Máš pro Šprtám využití**, ale potřebuješ, aby fungoval trochu jinak?',
      '**Zajímá tě víc?** Chceš projekt podpořit?',
    ],
    email: 'info@sprtam.cz',
    form: { label: 'Chci kontrolovat učivo', href: JOIN_URL },
  },
}
