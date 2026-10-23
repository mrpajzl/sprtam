import type { Subject } from '../../types'

export default {
  grade: 'z4',
  subject: 'cestina',
  topics: [
    {
      id: 'vyznam-slova',
      title: 'Význam slov',
      emoji: '🧠',
      ex: [
        {
          title: 'Dvojice slov',
          blocks: [
            { t: 'list', items: ['**Slova souznačná** (synonyma) – stejný význam: *velký – veliký – obrovský*.', '**Slova protikladná** (antonyma) – opačný význam: *den – noc*.', '**Slova mnohoznačná** – víc významů: *koruna* (stromu, královská, peníz).'] },
            { t: 'key', text: 'Souznačná = stejně. Protikladná = opačně. Mnohoznačná = víc významů.' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            { t: 'p', text: 'Najdi k slovu opak.' },
            {
              t: 'w',
              w: 'flip',
              p: {
                cards: [
                  { front: 'teplý', back: 'studený' },
                  { front: 'rychle', back: 'pomalu' },
                  { front: 'začátek', back: 'konec' },
                  { front: 'smát se', back: 'plakat' },
                  { front: 'vysoký', back: 'nízký' },
                ],
              },
            },
            { t: 'example', q: 'Řekni jinak (souznačně): *běžet*', a: 'utíkat, pádit, uhánět' },
            { t: 'key', text: 'Souznačná slova pomůžou, aby se v textu slova neopakovala.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je souznačné ke slovu „hezký“?', o: ['pěkný', 'ošklivý', 'velký'], a: 0 },
        { t: 'choice', q: 'Které slovo je protikladné ke slovu „starý“?', o: ['dávný', 'mladý', 'stařičký'], a: 1 },
        { t: 'choice', q: 'Které slovo je mnohoznačné?', o: ['koruna', 'kočka', 'pondělí'], a: 0, why: 'Koruna stromu, královská koruna, peníz.' },
        { t: 'input', q: 'Napiš opak slova „den“.', a: ['noc'] },
        { t: 'input', q: 'Napiš opak slova „černý“.', a: ['bílý'] },
        { t: 'tf', q: '„Malý“ a „drobný“ jsou slova souznačná.', a: true },
        { t: 'tf', q: '„Mluvit“ a „hovořit“ jsou slova protikladná.', a: false, why: 'Mají stejný význam – jsou souznačná.' },
        { t: 'pair', q: 'Spoj protiklady.', pairs: [['světlo', 'tma'], ['nahoru', 'dolů'], ['přijít', 'odejít'], ['plný', 'prázdný']] },
        { t: 'pair', q: 'Spoj slova souznačná.', pairs: [['kluk', 'chlapec'], ['dívat se', 'koukat'], ['smutný', 'zarmoucený'], ['brzy', 'záhy']] },
        { t: 'choice', q: 'Co znamená „oko“ ve větě „Na punčoše je očko.“?', o: ['část těla', 'smyčka v pletení', 'okno'], a: 1 },
        { t: 'open', q: 'Co jsou slova souznačná? Řekni příklad.', a: 'Slova se stejným nebo podobným významem, například kluk – chlapec, mluvit – hovořit.' },
        { t: 'open', q: 'Řekni dva významy slova „hlava“.', a: 'Například hlava člověka a hlava rodiny (nebo hlava zelí).' },
      ],
    },
    {
      id: 'koren-slova-pribuzna',
      title: 'Kořen a slova příbuzná',
      emoji: '🌱',
      ex: [
        {
          title: 'Rodina slov',
          blocks: [
            { t: 'p', text: 'Slova jedné rodiny mají společnou část – **kořen**.' },
            { t: 'pic', items: ['🌲 les', '🧑‍🌾 lesník', '🍄 lesní', '🌳 zalesnit'] },
            { t: 'p', text: 'Kořen je **les**. Ta slova jsou **příbuzná**.' },
            { t: 'key', text: 'Příbuzná slova mají stejný kořen a podobný význam.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'p', text: 'Pozor na **slova podobná**: znějí podobně, ale význam nesouvisí.' },
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['příbuzné k „voda“', 'jen podobné'],
                items: [
                  { text: 'vodník', b: 0 },
                  { text: 'vodní', b: 0 },
                  { text: 'zavodnit', b: 0 },
                  { text: 'vodovod', b: 0 },
                  { text: 'vodit', b: 1 },
                  { text: 'podvod', b: 1 },
                  { text: 'vodítko', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Zeptej se: souvisí to s významem?' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký je kořen slov: rybník, rybář, rybička?', o: ['ryb', 'rybn', 'ník'], a: 0 },
        { t: 'choice', q: 'Které slovo NENÍ příbuzné ke slovu „hrad“?', o: ['hradní', 'hradby', 'hrách'], a: 2 },
        { t: 'choice', q: 'Které slovo je příbuzné ke slovu „škola“?', o: ['školák', 'skála', 'kolo'], a: 0 },
        { t: 'input', q: 'Napiš kořen slova „lesník“.', a: ['les'] },
        { t: 'input', q: 'Napiš kořen slova „vodník“.', a: ['vod'] },
        { t: 'tf', q: '„Podvodník“ je příbuzné se slovem „voda“.', a: false, why: 'Podvodník souvisí s podvodem, ne s vodou.' },
        { t: 'tf', q: '„Domov“ a „domácí“ jsou slova příbuzná.', a: true },
        { t: 'pair', q: 'Spoj slovo s jeho kořenem.', pairs: [['sněhulák', 'sněh'], ['zimní', 'zim'], ['kamarádka', 'kamarád'], ['pekař', 'pek']] },
        { t: 'choice', q: 'Která skupina obsahuje jen příbuzná slova?', o: ['zima, zimní, zimovat', 'zima, zítra, zisk', 'kos, kost, kostel'], a: 0 },
        { t: 'order', q: 'Seřaď od nejkratšího slova.', items: ['les', 'lesy', 'lesník', 'zalesnit'] },
        { t: 'open', q: 'Co jsou slova příbuzná? Řekni příklad.', a: 'Slova se stejným kořenem a souvisejícím významem, například voda, vodní, vodník.' },
        { t: 'open', q: 'Proč nám slova příbuzná pomáhají při psaní?', a: 'Když nevím, jak se slovo píše, najdu příbuzné slovo. Třeba bydliště – bydlit, tak píšu y.' },
      ],
    },
    {
      id: 'stavba-slova-z4',
      title: 'Předpona, kořen, přípona',
      emoji: '🧩',
      ex: [
        {
          title: 'Barvy',
          blocks: [
            { t: 'p', text: 'Slovo se skládá z dílů.' },
            {
              t: 'w',
              w: 'parts',
              p: {
                words: [
                  { parts: [{ text: 'pře', label: 'předpona' }, { text: 'běh', label: 'kořen' }, { text: 'nout', label: 'příponová část' }] },
                  { parts: [{ text: 'do', label: 'předpona' }, { text: 'pis', label: 'kořen' }] },
                  { parts: [{ text: 'les', label: 'kořen' }, { text: 'ník', label: 'příponová část' }] },
                ],
              },
            },
            { t: 'key', text: 'Předpona – před kořenem. Přípona – za kořenem.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            { t: 'steps', items: ['Najdi příbuzná slova: *vyletět – let – letadlo*.', 'Co mají společné, je **kořen**: *let*.', 'Co je před ním, je **předpona**: *vy*.', 'Co je za ním, je **příponová část**: *ět*.'] },
            { t: 'example', q: 'Rozděl: podvozek', a: 'pod – voz – ek' },
            { t: 'example', q: 'Rozděl: rybář', a: 'ryb – ář' },
            { t: 'key', text: 'Nejdřív najdi kořen, pak zbytek.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaká je předpona ve slově „odjet“?', o: ['od', 'je', 'odje'], a: 0 },
        { t: 'choice', q: 'Jaký je kořen ve slově „rybník“?', o: ['ryb', 'ník', 'rybn'], a: 0 },
        { t: 'choice', q: 'Které slovo má předponu?', o: ['přepsat', 'psát', 'písař'], a: 0 },
        { t: 'input', q: 'Napiš předponu slova „vyskočit“.', a: ['vy'] },
        { t: 'input', q: 'Napiš předponu slova „podzemí“.', a: ['pod'] },
        { t: 'tf', q: 'Předpona stojí před kořenem.', a: true },
        { t: 'tf', q: 'Ve slově „nosič“ je „ič“ předpona.', a: false, why: '-ič je za kořenem nos – je to přípona.' },
        { t: 'order', q: 'Slož slovo „zalesnit“.', items: ['za', 'les', 'nit'] },
        { t: 'pair', q: 'Spoj slovo s předponou.', pairs: [['nalít', 'na'], ['rozbít', 'roz'], ['přiletět', 'při'], ['ubrat', 'u']] },
        { t: 'choice', q: 'Která slova mají stejný kořen?', o: ['nosit, nosič, přenos', 'nos, noc, nosit', 'pes, peří, pec'], a: 0 },
        { t: 'open', q: 'Z jakých částí se skládá slovo „předběhnout“?', a: 'Z předpony před, kořene běh a příponové části nout.' },
        { t: 'open', q: 'Řekni tři slova s předponou „vy-“.', a: 'Například vyletět, vyskočit, vyprávět.' },
      ],
    },
    {
      id: 'predlozky-a-predpony',
      title: 'Předložky a předpony',
      emoji: '🔗',
      ex: [
        {
          title: 'Zvlášť a dohromady',
          blocks: [
            { t: 'table', head: ['', 'předložka', 'předpona'], rows: [['co je', 'samostatné slovo', 'část slova'], ['kde', 'před podst. jménem, zájmenem', 'před kořenem slovesa…'], ['píšu', 'zvlášť: *na stůl*', 'dohromady: *nalít*']] },
            { t: 'p', text: 'Test: mezi předložku a slovo můžeš vložit jiné slovo: *na (velký) stůl*.' },
            { t: 'key', text: 'Předložka zvlášť, předpona dohromady.' },
          ],
        },
        {
          title: 'Doplň',
          blocks: [
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'Kočka skočila ', after: '.', options: ['na stůl', 'nastůl'], a: 0 },
                  { before: 'Musím ', after: ' úkol.', options: ['na psát', 'napsat'], a: 1 },
                  { before: 'Šli jsme ', after: '.', options: ['do lesa', 'dolesa'], a: 0 },
                  { before: 'Vlak ', after: ' včas.', options: ['od jel', 'odjel'], a: 1 },
                  { before: 'Sedím ', after: '.', options: ['pod stromem', 'podstromem'], a: 0 },
                ],
              },
            },
            { t: 'example', q: 'Předložky s/se, k/ke, v/ve, z/ze: kdy „ke“?', a: 'Když by se špatně vyslovovalo: *ke kamarádovi, ve vodě, se sestrou, ze zahrady*.' },
            { t: 'key', text: 'Vlož slovo mezi. Jde to? Je to předložka.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Ve které větě je předložka?', o: ['Jdu do školy.', 'Dopiš úkol.', 'Odešel.'], a: 0 },
        { t: 'choice', q: 'Ve kterém slově je předpona?', o: ['na stole', 'nalít', 'na zahradě'], a: 1 },
        { t: 'choice', q: 'Co je napsané správně?', o: ['ke kamarádovi', 'k kamarádovi', 'kekamarádovi'], a: 0 },
        { t: 'choice', q: 'Co je napsané správně?', o: ['v vodě', 've vodě', 'vevodě'], a: 1 },
        { t: 'tf', q: 'Předložku píšeme se slovem dohromady.', a: false, why: 'Předložka je samostatné slovo – píšeme ji zvlášť.' },
        { t: 'tf', q: 'Ve slově „přiletěl“ je „při“ předpona.', a: true },
        { t: 'input', q: 'Je „pod“ ve spojení „pod mostem“ předložka, nebo předpona?', a: ['předložka', 'predlozka'] },
        { t: 'input', q: 'Je „pod“ ve slově „podepsat“ předložka, nebo předpona?', a: ['předpona', 'predpona'] },
        { t: 'pair', q: 'Spoj.', pairs: [['nad městem', 'předložka'], ['nadepsat', 'předpona'], ['u domu', 'předložka'], ['utéct', 'předpona']] },
        {
          t: 'choice',
          q: 'Která věta je napsaná správně?',
          o: ['Odešel od nás brzy.', 'Odešel odnás brzy.', 'Od šel od nás brzy.'],
          a: 0,
        },
        { t: 'open', q: 'Jak poznáš předložku od předpony?', a: 'Předložka je samostatné slovo před podstatným jménem nebo zájmenem a dá se mezi ně vložit jiné slovo. Předpona je část slova.' },
        { t: 'open', q: 'Řekni větu, kde bude „na“ jako předložka i jako předpona.', a: 'Například: Nalil jsem vodu na zahradu.' },
      ],
    },
    {
      id: 'vzory-muzsky-rod',
      title: 'Vzory rodu mužského',
      emoji: '🤴',
      ex: [
        {
          title: 'Tabulka',
          blocks: [
            { t: 'table', head: ['', 'tvrdé', 'měkké', 'na -a', 'na -e'], rows: [['životné', 'pán', 'muž', 'předseda', 'soudce'], ['neživotné', 'hrad', 'stroj', '', '']] },
            { t: 'p', text: '**Životné** = živé bytosti (pán, pes). **Neživotné** = věci (hrad, stůl).' },
            { t: 'key', text: 'Pán, hrad, muž, stroj, předseda, soudce.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            { t: 'steps', items: ['Je to živé? → životné. Věc? → neživotné.', 'Na co končí v 1. pádě?', 'Tvrdá souhláska → pán / hrad. Měkká → muž / stroj.', 'Na -a → předseda. Na -e → soudce.'] },
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['pán', 'hrad', 'stroj'],
                items: [
                  { text: 'kluk', b: 0 },
                  { text: 'strom', b: 1 },
                  { text: 'klíč', b: 2 },
                  { text: 'bratr', b: 0 },
                  { text: 'stůl', b: 1 },
                  { text: 'pokoj', b: 2 },
                  { text: 'pes', b: 0 },
                  { text: 'nůž', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Vzor = slovo, podle kterého skloňuješ.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „kluk“?', o: ['pán', 'hrad', 'muž'], a: 0 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „učitel“?', o: ['pán', 'muž', 'soudce'], a: 1, why: 'Životné, končí na měkkou souhlásku l (učitele) → muž.' },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „hrdina“?', o: ['předseda', 'pán', 'žena'], a: 0, why: 'Mužský rod životný na -a → předseda.' },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „vůdce“?', o: ['muž', 'soudce', 'moře'], a: 1 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „míč“?', o: ['hrad', 'stroj', 'muž'], a: 1, why: 'Neživotné, končí měkce → stroj.' },
        { t: 'input', q: 'Napiš vzor pro slovo „les“.', a: ['hrad'] },
        { t: 'input', q: 'Napiš vzor pro slovo „lékař“.', a: ['muž', 'muz'] },
        { t: 'tf', q: '„Strom“ je životné podstatné jméno.', a: false, why: 'Strom je věc (roste, ale gramaticky je neživotný) → vzor hrad.' },
        { t: 'tf', q: 'Rod mužský má 6 vzorů.', a: true },
        { t: 'pair', q: 'Spoj slovo se vzorem.', pairs: [['pes', 'pán'], ['dům', 'hrad'], ['kůň', 'muž'], ['starosta', 'předseda'], ['soudce', 'soudce']] },
        { t: 'choice', q: 'Jak se píše 1. pád množného čísla: „Ti klu_ si hrají.“', o: ['kluci', 'klucy'], a: 0, why: 'Vzor pán: páni → kluci (i).' },
        { t: 'open', q: 'Vyjmenuj vzory rodu mužského.', a: 'Životné: pán, muž, předseda, soudce. Neživotné: hrad, stroj.' },
        { t: 'open', q: 'Jak určíš vzor slova „hrad“ a „stroj“?', a: 'Obě jsou neživotná. Hrad končí tvrdou souhláskou, stroj měkkou (j). Pomůže i 2. pád: hradu, stroje.' },
      ],
    },
    {
      id: 'vzory-zensky-rod',
      title: 'Vzory rodu ženského',
      emoji: '👸',
      ex: [
        {
          title: 'Tabulka',
          blocks: [
            { t: 'table', head: ['vzor', 'konec v 1. p.', '2. pád', 'příklad'], rows: [['žena', '-a', 'ženy', 'škola, kniha'], ['růže', '-e/-ě', 'růže', 'židle, ulice'], ['píseň', 'souhláska', 'písně', 'dlaň, postel'], ['kost', 'souhláska', 'kosti', 'noc, myš']] },
            { t: 'key', text: 'Píseň × kost: rozhodne 2. pád (-e/-ě, nebo -i).' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['žena', 'růže', 'píseň / kost'],
                items: [
                  { text: 'kočka', b: 0 },
                  { text: 'ulice', b: 1 },
                  { text: 'báseň', b: 2 },
                  { text: 'lavice', b: 1 },
                  { text: 'kniha', b: 0 },
                  { text: 'noc', b: 2 },
                  { text: 'košile', b: 1 },
                  { text: 'voda', b: 0 },
                ],
              },
            },
            {
              t: 'w',
              w: 'flip',
              p: {
                cards: [
                  { front: 'dlaň', back: 'bez dlaně → píseň' },
                  { front: 'věc', back: 'bez věci → kost' },
                  { front: 'tvář', back: 'bez tváře → píseň' },
                  { front: 'sůl', back: 'bez soli → kost' },
                ],
              },
            },
            { t: 'key', text: 'Řekni „bez …“ a poslouchej konec.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „škola“?', o: ['žena', 'růže', 'kost'], a: 0 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „židle“?', o: ['žena', 'růže', 'píseň'], a: 1 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „myš“?', o: ['píseň', 'kost', 'růže'], a: 1, why: 'Bez myši – 2. pád na -i → kost.' },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „postel“?', o: ['píseň', 'kost', 'žena'], a: 0, why: 'Bez postele – 2. pád na -e → píseň.' },
        { t: 'input', q: 'Napiš vzor pro slovo „kniha“.', a: ['žena', 'zena'] },
        { t: 'input', q: 'Napiš vzor pro slovo „ulice“.', a: ['růže', 'ruze'] },
        { t: 'tf', q: 'Ženský rod má 4 vzory.', a: true },
        { t: 'tf', q: '„Noc“ se skloňuje podle vzoru píseň.', a: false, why: 'Bez noci – 2. pád na -i → kost.' },
        { t: 'pair', q: 'Spoj slovo se vzorem.', pairs: [['ryba', 'žena'], ['práce', 'růže'], ['báseň', 'píseň'], ['řeč', 'kost']] },
        { t: 'order', q: 'Seřaď vzory ženského rodu, jak se učí.', items: ['žena', 'růže', 'píseň', 'kost'] },
        { t: 'open', q: 'Vyjmenuj vzory rodu ženského.', a: 'Žena, růže, píseň, kost.' },
        { t: 'open', q: 'Jak rozlišíš vzor píseň a kost?', a: 'Obě končí v 1. pádě souhláskou. Ve 2. pádě má píseň koncovku -e/-ě (bez písně), kost koncovku -i (bez kosti).' },
      ],
    },
    {
      id: 'vzory-stredni-rod',
      title: 'Vzory rodu středního',
      emoji: '🐣',
      ex: [
        {
          title: 'Tabulka',
          blocks: [
            { t: 'table', head: ['vzor', 'konec v 1. p.', '2. pád', 'příklad'], rows: [['město', '-o', 'města', 'auto, okno'], ['moře', '-e', 'moře', 'pole, srdce'], ['kuře', '-e', 'kuřete', 'kotě, štěně'], ['stavení', '-í', 'stavení', 'náměstí, nádraží']] },
            { t: 'key', text: 'Moře × kuře: kuře má ve 2. pádě -ete (bez kuřete).' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['město', 'moře', 'kuře'],
                items: [
                  { text: 'kolo', b: 0 },
                  { text: 'pole', b: 1 },
                  { text: 'kotě', b: 2 },
                  { text: 'jablko', b: 0 },
                  { text: 'slunce', b: 1 },
                  { text: 'štěně', b: 2 },
                  { text: 'okno', b: 0 },
                  { text: 'srdce', b: 1 },
                ],
              },
            },
            { t: 'p', text: 'Kuře, kotě, štěně = **mláďata**.' },
            { t: 'key', text: 'Mládě → většinou vzor kuře.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „auto“?', o: ['město', 'moře', 'kuře'], a: 0 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „hříbě“?', o: ['moře', 'kuře', 'stavení'], a: 1, why: 'Bez hříběte → kuře.' },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „náměstí“?', o: ['stavení', 'moře', 'město'], a: 0 },
        { t: 'choice', q: 'Podle jakého vzoru skloňujeme „vejce“?', o: ['kuře', 'moře', 'město'], a: 1, why: 'Bez vejce → moře.' },
        { t: 'input', q: 'Napiš vzor pro slovo „kotě“.', a: ['kuře', 'kure'] },
        { t: 'input', q: 'Napiš vzor pro slovo „kolo“.', a: ['město', 'mesto'] },
        { t: 'tf', q: 'Střední rod má 4 vzory.', a: true },
        { t: 'tf', q: '„Pole“ se skloňuje podle vzoru kuře.', a: false, why: 'Bez pole (ne „bez polete“) → moře.' },
        { t: 'pair', q: 'Spoj slovo se vzorem.', pairs: [['víno', 'město'], ['letiště', 'moře'], ['tele', 'kuře'], ['nádraží', 'stavení']] },
        { t: 'order', q: 'Seřaď vzory středního rodu, jak se učí.', items: ['město', 'moře', 'kuře', 'stavení'] },
        { t: 'open', q: 'Vyjmenuj vzory rodu středního.', a: 'Město, moře, kuře, stavení.' },
        { t: 'open', q: 'Jak poznáš, jestli je slovo podle vzoru moře, nebo kuře?', a: 'Řeknu 2. pád. Bez moře – zůstane -e. Bez kuřete – přibude -ete. Slova jako kotě, štěně jsou podle kuře.' },
      ],
    },
    {
      id: 'slovesa-urcovani',
      title: 'Slovesa: osoba, číslo, čas, způsob',
      emoji: '⏳',
      ex: [
        {
          title: 'Mluvnické kategorie',
          blocks: [
            { t: 'list', items: ['**osoba**: 1., 2., 3.', '**číslo**: jednotné, množné', '**čas**: minulý, přítomný, budoucí', '**způsob**: oznamovací, rozkazovací, podmiňovací'] },
            { t: 'table', head: ['způsob', 'příklad'], rows: [['oznamovací', 'píšu, psal jsem, budu psát'], ['rozkazovací', 'piš! pište!'], ['podmiňovací', 'psal bych, psali bychom']] },
            { t: 'key', text: 'Urči: osoba – číslo – čas – způsob.' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            { t: 'p', text: 'Urči a otoč.' },
            {
              t: 'w',
              w: 'flip',
              p: {
                cards: [
                  { front: 'čteme', back: '1. os., č. mn., přítomný, oznamovací' },
                  { front: 'kreslil', back: '3. os., č. j., minulý, oznamovací' },
                  { front: 'zpívej!', back: '2. os., č. j., rozkazovací' },
                  { front: 'šli bychom', back: '1. os., č. mn., podmiňovací' },
                  { front: 'budete spát', back: '2. os., č. mn., budoucí, oznamovací' },
                ],
              },
            },
            { t: 'key', text: 'Pozor: spisovně „bychom“, ne „bysme“.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký způsob má „Zavři dveře!“?', o: ['oznamovací', 'rozkazovací', 'podmiňovací'], a: 1 },
        { t: 'choice', q: 'Jaký způsob má „Jel bych k moři.“?', o: ['oznamovací', 'rozkazovací', 'podmiňovací'], a: 2 },
        { t: 'choice', q: 'Jaký čas má „ponesu“?', o: ['minulý', 'přítomný', 'budoucí'], a: 2 },
        { t: 'choice', q: 'Která osoba a číslo je „píšete“?', o: ['2. os. č. mn.', '3. os. č. j.', '1. os. č. mn.'], a: 0 },
        { t: 'choice', q: 'Co je spisovně správně?', o: ['šli bysme', 'šli bychom'], a: 1 },
        { t: 'input', q: 'Napiš rozkazovací způsob 2. os. č. j. slovesa „psát“.', a: ['piš'] },
        { t: 'input', q: 'Napiš infinitiv slovesa „nesu“.', a: ['nést', 'nésti'] },
        { t: 'tf', q: '„Běhali“ je čas minulý.', a: true },
        { t: 'tf', q: '„Uklidil bych“ je způsob oznamovací.', a: false, why: 'Bych = podmiňovací způsob.' },
        { t: 'pair', q: 'Spoj tvar s podmiňovacím způsobem.', pairs: [['já', 'hrál bych'], ['ty', 'hrál bys'], ['my', 'hráli bychom'], ['vy', 'hráli byste']] },
        { t: 'order', q: 'Seřaď od minulosti do budoucnosti.', items: ['skákal', 'skáče', 'bude skákat'] },
        { t: 'open', q: 'Urči sloveso „půjdeme“.', a: '1. osoba, číslo množné, čas budoucí, způsob oznamovací.' },
        { t: 'open', q: 'Jaké znáš slovesné způsoby? Řekni ke každému příklad.', a: 'Oznamovací (čtu), rozkazovací (čti!), podmiňovací (četl bych).' },
      ],
    },
    {
      id: 'podmet-a-prisudek',
      title: 'Podmět a přísudek',
      emoji: '🤝',
      ex: [
        {
          title: 'Dvojice',
          blocks: [
            { t: 'p', text: 'Každá věta má svou **kostru** – dvojici.' },
            { t: 'list', items: ['**Podmět** – kdo? co? *Pes* štěká.', '**Přísudek** – co dělá? Pes *štěká*.'] },
            { t: 'p', text: 'Podmět podtrhujeme jednou čarou, přísudek dvěma.' },
            { t: 'key', text: 'Podmět + přísudek = základní skladební dvojice.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            { t: 'steps', items: ['Najdi sloveso – co se děje? → **přísudek**.', 'Zeptej se: kdo/co to dělá? → **podmět**.', 'Nenajdeš podmět? Je **nevyjádřený**: *Jdeme ven.* (my)'] },
            { t: 'example', q: 'Malá Ema kreslí obrázek.', a: 'Podmět: Ema. Přísudek: kreslí.' },
            { t: 'example', q: 'Na zahradě kvetou růže.', a: 'Podmět: růže. Přísudek: kvetou.' },
            { t: 'key', text: 'Začni přísudkem, pak hledej podmět.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co je podmět ve větě „Kočka spí.“?', o: ['kočka', 'spí'], a: 0 },
        { t: 'choice', q: 'Co je přísudek ve větě „Ptáci zpívají.“?', o: ['ptáci', 'zpívají'], a: 1 },
        { t: 'choice', q: 'Co je podmět ve větě „Ráno nás vzbudil budík.“?', o: ['ráno', 'nás', 'budík'], a: 2, why: 'Kdo nás vzbudil? Budík.' },
        { t: 'choice', q: 'Co je přísudek ve větě „Děti si hrají na hřišti.“?', o: ['děti', 'hrají si', 'hřišti'], a: 1 },
        { t: 'input', q: 'Najdi podmět: „Po obloze letí letadlo.“', a: ['letadlo'] },
        { t: 'input', q: 'Najdi přísudek: „Tatínek opravuje kolo.“', a: ['opravuje'] },
        { t: 'tf', q: 'Ve větě „Půjdu domů.“ je podmět nevyjádřený.', a: true, why: 'Podmět je „já“, ale není napsaný.' },
        { t: 'tf', q: 'Podmět odpovídá na otázku „co dělá?“.', a: false, why: 'Na „co dělá?“ odpovídá přísudek. Podmět: kdo? co?' },
        { t: 'pair', q: 'Spoj podmět s přísudkem.', pairs: [['Pes', 'štěká.'], ['Slunce', 'svítí.'], ['Vítr', 'fouká.'], ['Ryba', 'plave.']] },
        { t: 'choice', q: 'Kolika čarami podtrhujeme přísudek?', o: ['jednou', 'dvěma', 'třemi'], a: 1 },
        { t: 'open', q: 'Co je základní skladební dvojice?', a: 'Podmět a přísudek. Podmět říká, kdo nebo co něco dělá, přísudek říká, co dělá.' },
        { t: 'open', q: 'Najdi podmět a přísudek ve větě „Babička peče koláče.“', a: 'Podmět je babička, přísudek je peče.' },
      ],
    },
    {
      id: 'veta-jednoducha-souveti',
      title: 'Věta jednoduchá a souvětí',
      emoji: '🚃',
      ex: [
        {
          title: 'Vláček',
          blocks: [
            { t: 'p', text: '**Věta jednoduchá** má jedno sloveso v určitém tvaru: *Pes štěká.*' },
            { t: 'p', text: '**Souvětí** má víc vět spojených dohromady: *Pes štěká a kočka utíká.*' },
            { t: 'pic', items: ['🚃', '🔗', '🚃'], caption: 'věta + spojka + věta = souvětí' },
            { t: 'key', text: 'Kolik určitých sloves, tolik vět.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['věta jednoduchá', 'souvětí'],
                items: [
                  { text: 'Prší.', b: 0 },
                  { text: 'Prší, proto jsem doma.', b: 1 },
                  { text: 'Ema čte knihu.', b: 0 },
                  { text: 'Ema čte a Petr kreslí.', b: 1 },
                  { text: 'Ráno jsme jeli k babičce.', b: 0 },
                  { text: 'Když přijdeš, půjdeme ven.', b: 1 },
                ],
              },
            },
            { t: 'p', text: 'Věty spojují **spojky**: *a, ale, protože, když, že…*' },
            { t: 'key', text: 'Před „ale“, „protože“, „když“, „že“ píšeme čárku.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co je „Maminka vaří a tatínek uklízí.“?', o: ['věta jednoduchá', 'souvětí'], a: 1, why: 'Dvě slovesa: vaří, uklízí.' },
        { t: 'choice', q: 'Co je „Na stromě sedí kos.“?', o: ['věta jednoduchá', 'souvětí'], a: 0 },
        { t: 'input', q: 'Kolik vět má souvětí „Přišel jsem domů, najedl jsem se a šel jsem spát.“?', a: ['3', 'tři'] },
        { t: 'input', q: 'Kolik vět má „Venku sněží.“?', a: ['1', 'jedna', 'jednu'] },
        { t: 'choice', q: 'Kam patří čárka? „Chtěl jsem jít ven ale pršelo.“', o: ['před „ale“', 'za „ale“', 'nikam'], a: 0 },
        { t: 'choice', q: 'Která spojka spojuje věty v souvětí „Nešel jsem ven, protože jsem byl nemocný.“?', o: ['protože', 'jsem', 'ven'], a: 0 },
        { t: 'tf', q: 'Souvětí obsahuje aspoň dvě slovesa v určitém tvaru.', a: true },
        { t: 'tf', q: 'Před spojkou „a“ píšeme vždy čárku.', a: false, why: 'Před „a“ v běžném výčtu ani v jednoduchém spojení čárku nepíšeme.' },
        { t: 'order', q: 'Slož souvětí.', items: ['Když', 'zazvoní', 'zvonek,', 'jdeme', 'na', 'oběd.'] },
        { t: 'pair', q: 'Spoj začátek s koncem souvětí.', pairs: [['Venku prší,', 'proto jsem doma.'], ['Vím,', 'že zítra je test.'], ['Chtěl jsem psa,', 'ale máme kočku.']] },
        { t: 'open', q: 'Jaký je rozdíl mezi větou jednoduchou a souvětím?', a: 'Věta jednoduchá má jedno sloveso v určitém tvaru. Souvětí má dvě nebo více vět, tedy víc určitých sloves.' },
        { t: 'open', q: 'Spoj dvě věty do souvětí: „Bylo teplo.“ „Šli jsme k vodě.“', a: 'Například: Bylo teplo, a tak jsme šli k vodě. / Protože bylo teplo, šli jsme k vodě.' },
      ],
    },
  ],
} satisfies Subject
