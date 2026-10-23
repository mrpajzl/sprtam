import type { Subject } from '../../types'

export default {
  grade: 's2',
  subject: 'cestina',
  topics: [
    {
      id: 'slovni-druhy',
      title: 'Slovní druhy',
      emoji: '🧩',
      ex: [
        {
          title: 'Ohebné a neohebné',
          blocks: [
            { t: 'p', text: 'Slovních druhů je **10**. Prvních pět se ohýbá (skloňuje nebo časuje), zbylých pět ne.' },
            {
              t: 'table',
              head: ['Ohebné', 'Neohebné'],
              rows: [
                ['1. podstatná jména', '6. příslovce'],
                ['2. přídavná jména', '7. předložky'],
                ['3. zájmena', '8. spojky'],
                ['4. číslovky', '9. částice'],
                ['5. slovesa', '10. citoslovce'],
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['ohebné', 'neohebné'],
                items: [
                  { text: 'stůl', b: 0 }, { text: 'rychle', b: 1 }, { text: 'my', b: 0 }, { text: 'pět', b: 0 },
                  { text: 'přes', b: 1 }, { text: 'protože', b: 1 }, { text: 'kéž', b: 1 }, { text: 'haf', b: 1 },
                  { text: 'zelený', b: 0 }, { text: 'běžet', b: 0 },
                ],
              },
            },
            { t: 'key', text: 'Ohebné 1–5: podstatná, přídavná jména, zájmena, číslovky, slovesa. Neohebné 6–10: příslovce, předložky, spojky, částice, citoslovce.' },
          ],
        },
        {
          title: 'Na jedné větě',
          blocks: [
            { t: 'p', text: 'Rozeber větu: *Ach, ten náš starý pes dnes nechtěl jít ven, protože pršelo.*' },
            {
              t: 'table',
              head: ['Slovo', 'Slovní druh'],
              rows: [
                ['ach', 'citoslovce'], ['ten, náš', 'zájmena'], ['starý', 'přídavné jméno'], ['pes', 'podstatné jméno'],
                ['dnes, ven', 'příslovce'], ['nechtěl, jít, pršelo', 'slovesa'], ['protože', 'spojka'],
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Předložka', back: 'Pojí se s pádem jména: *do, na, přes, kvůli*' },
                  { front: 'Spojka', back: 'Spojuje větné členy nebo věty: *a, ale, protože, že*' },
                  { front: 'Částice', back: 'Uvozuje větu, vyjadřuje postoj mluvčího: *kéž, ať, prý, asi*' },
                  { front: 'Citoslovce', back: 'Citové a zvukové projevy: *au, haf, bum*' },
                ],
              },
            },
            { t: 'example', q: '*Šel kolem domu.* × *Šel kolem.* Jaký druh je *kolem*?', a: 'Nejdřív předložka (pojí se s pádem), podruhé příslovce (určuje místo).' },
            { t: 'key', text: 'Slovní druh určuje funkce slova v konkrétní větě, ne jen jeho tvar.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik slovních druhů rozlišuje čeština?', o: ['8', '10', '12'], a: 1 },
        { t: 'choice', q: 'Které slovo je číslovka?', o: ['pátý', 'pátek', 'pátrat'], a: 0, why: '*Pátý* je řadová číslovka; *pátek* je podstatné jméno.' },
        { t: 'tf', q: 'Příslovce patří mezi ohebné slovní druhy, protože se dají stupňovat.', a: false, why: 'Stupňování není skloňování ani časování. Příslovce jsou neohebná.' },
        { t: 'input', q: 'Jaký slovní druh je slovo *kéž*?', a: ['částice'], why: 'Uvozuje přací větu.' },
        { t: 'input', q: 'Jaký slovní druh je slovo *bum*?', a: ['citoslovce'] },
        { t: 'choice', q: 'Ve větě *Stál vedle.* je slovo *vedle*:', o: ['předložka', 'příslovce', 'spojka'], a: 1, why: 'Nepojí se s pádem jména, určuje místo.' },
        { t: 'pair', q: 'Spoj slovo se slovním druhem.', pairs: [['přes', 'předložka'], ['ale', 'spojka'], ['prý', 'částice'], ['jejich', 'zájmeno']] },
        { t: 'choice', q: 'Které zájmeno je přivlastňovací?', o: ['svůj', 'sebe', 'kdo', 'tentýž'], a: 0, why: '*Sebe* je osobní zvratné, *kdo* tázací, *tentýž* ukazovací.' },
        { t: 'order', q: 'Seřaď ohebné slovní druhy podle tradičního číslování.', items: ['podstatná jména', 'přídavná jména', 'zájmena', 'číslovky', 'slovesa'] },
        { t: 'tf', q: 'Slovo *protože* je podřadicí spojka.', a: true, why: 'Uvozuje vedlejší větu příčinnou.' },
        { t: 'open', q: 'Jak dělíme slovní druhy? Uveď ke každé skupině příklady.', a: 'Ohebné (skloňují se nebo časují): podstatná jména, přídavná jména, zájmena, číslovky, slovesa. Neohebné: příslovce, předložky, spojky, částice, citoslovce – např. *rychle, do, a, kéž, au*.' },
        { t: 'open', q: 'Proč nelze slovní druh vždy určit bez kontextu? Uveď příklad.', a: 'Stejné slovo může mít ve větě různou funkci. *Vedle domu* – předložka (pojí se s 2. pádem), *stál vedle* – příslovce (určuje místo).' },
      ],
    },
    {
      id: 'kategorie-jmen',
      title: 'Mluvnické kategorie jmen',
      emoji: '📐',
      ex: [
        {
          title: 'Přehled',
          blocks: [
            {
              t: 'table',
              head: ['Kategorie', 'Hodnoty'],
              rows: [
                ['pád', '1.–7. (nominativ … instrumentál)'],
                ['číslo', 'jednotné, množné; zbytky dvojného: *očima, ušima, rukama, nohama*'],
                ['rod', 'mužský životný, mužský neživotný, ženský, střední'],
                ['vzor', 'podle něj jméno skloňujeme'],
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: '1. pád', back: 'nominativ – kdo, co' },
                  { front: '2. pád', back: 'genitiv – koho, čeho' },
                  { front: '3. pád', back: 'dativ – komu, čemu' },
                  { front: '4. pád', back: 'akuzativ – koho, co' },
                  { front: '5. pád', back: 'vokativ – oslovujeme' },
                  { front: '6. pád', back: 'lokál – o kom, o čem' },
                  { front: '7. pád', back: 'instrumentál – kým, čím' },
                ],
              },
            },
            { t: 'key', text: 'Podstatná jména mají pád, číslo, rod a vzor.' },
          ],
        },
        {
          title: 'Přídavná jména',
          blocks: [
            { t: 'p', text: 'Přídavné jméno se shoduje s podstatným jménem v **rodě, čísle a pádě**: *mladého muže, mladé ženě*.' },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['tvrdá (mladý)', 'měkká (jarní)', 'přivlastňovací (otcův, matčin)'],
                items: [
                  { text: 'zelený', b: 0 }, { text: 'cizí', b: 1 }, { text: 'sestřin', b: 2 }, { text: 'malý', b: 0 },
                  { text: 'letní', b: 1 }, { text: 'Petrův', b: 2 }, { text: 'drahý', b: 0 }, { text: 'ranní', b: 1 },
                ],
              },
            },
            { t: 'list', items: ['pozitiv: *dobrý*', 'komparativ: *lepší*', 'superlativ: *nejlepší*'] },
            { t: 'key', text: 'Stupňovat lze jen přídavná jména vyjadřující vlastnost (a od nich odvozená příslovce).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik pádů má čeština?', o: ['6', '7', '8'], a: 1 },
        { t: 'input', q: 'Latinský název 4. pádu?', a: ['akuzativ'] },
        { t: 'choice', q: 'Které slovo je rodu mužského neživotného?', o: ['hrad', 'pán', 'soudce', 'muž'], a: 0 },
        { t: 'tf', q: 'Tvary *očima, ušima* jsou zbytky dvojného čísla.', a: true },
        { t: 'choice', q: 'Podle jakého vzoru se skloňuje *učitel*?', o: ['pán', 'muž', 'předseda', 'soudce'], a: 1, why: 'Měkké zakončení, 1. pád končí souhláskou → muž.' },
        { t: 'choice', q: 'Podle jakého vzoru se skloňuje *kolega*?', o: ['pán', 'předseda', 'soudce'], a: 1, why: 'Mužský životný zakončený na -a.' },
        { t: 'input', q: 'Napiš 2. stupeň přídavného jména *dobrý*.', a: ['lepší'] },
        { t: 'pair', q: 'Spoj pád s otázkou.', pairs: [['2. pád', 'koho, čeho'], ['3. pád', 'komu, čemu'], ['6. pád', 'o kom, o čem'], ['7. pád', 'kým, čím']] },
        { t: 'choice', q: 'Které přídavné jméno je přivlastňovací?', o: ['matčin', 'mateřský', 'jarní'], a: 0, why: 'Odpovídá na otázku *čí?* a má příponu -in/-ův.' },
        { t: 'tf', q: 'Přídavné jméno *jarní* je tvrdé.', a: false, why: 'Je měkké (vzor jarní).' },
        { t: 'order', q: 'Seřaď stupně přídavných jmen.', items: ['pozitiv', 'komparativ', 'superlativ'] },
        { t: 'open', q: 'Vyjmenuj mluvnické kategorie podstatných jmen a jejich hodnoty.', a: 'Pád (7 pádů), číslo (jednotné, množné, zbytky dvojného), rod (mužský životný a neživotný, ženský, střední) a vzor.' },
        { t: 'open', q: 'Jak se dělí přídavná jména? Uveď příklady a vysvětli stupňování.', a: 'Tvrdá (*mladý*), měkká (*jarní*) a přivlastňovací (*otcův, matčin*). Stupňují se: pozitiv *dobrý*, komparativ *lepší*, superlativ *nejlepší*.' },
      ],
    },
    {
      id: 'kategorie-sloves',
      title: 'Mluvnické kategorie sloves',
      emoji: '🏃',
      ex: [
        {
          title: 'Tabulkou',
          blocks: [
            {
              t: 'table',
              head: ['Kategorie', 'Hodnoty', 'Příklad'],
              rows: [
                ['osoba', '1., 2., 3.', '*píšu, píšeš, píše*'],
                ['číslo', 'jednotné, množné', '*píše, píšou*'],
                ['čas', 'minulý, přítomný, budoucí', '*psal, píše, bude psát*'],
                ['způsob', 'oznamovací, rozkazovací, podmiňovací', '*píše, piš, psal by*'],
                ['rod', 'činný, trpný', '*napsal / byl napsán*'],
                ['vid', 'nedokonavý, dokonavý', '*psát / napsat*'],
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['nedokonavý vid', 'dokonavý vid'],
                items: [
                  { text: 'psát', b: 0 }, { text: 'napsat', b: 1 }, { text: 'skočit', b: 1 }, { text: 'skákat', b: 0 },
                  { text: 'koupit', b: 1 }, { text: 'kupovat', b: 0 }, { text: 'přečíst', b: 1 }, { text: 'číst', b: 0 },
                ],
              },
            },
            { t: 'key', text: 'Šest kategorií: osoba, číslo, čas, způsob, rod, vid.' },
          ],
        },
        {
          title: 'Rozbor a pravopis',
          blocks: [
            {
              t: 'steps', items: [
                'Tvar: *byli bychom pozváni*',
                'Osoba 1., číslo množné (my)',
                'Způsob podmiňovací přítomný',
                'Čas neurčujeme – má ho jen způsob oznamovací',
                'Rod trpný, vid dokonavý (*pozvat*)',
              ],
            },
            {
              t: 'w', w: 'gap', p: {
                items: [
                  { before: 'My ', after: ' to nevěděli.', options: ['bysme', 'bychom'], a: 1 },
                  { before: 'Vy ', after: ' to zvládli.', options: ['byste', 'by jste'], a: 0 },
                  { before: 'Byli bychom rádi, ', after: ' přišli.', options: ['kdyby jste', 'kdybyste'], a: 1 },
                  { before: 'Zítra ', after: ' do kina.', options: ['půjdu', 'budu jít'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Spisovně: *bychom, byste, abychom, kdybyste* – nikdy *bysme, by jste*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký vid má sloveso *přečíst*?', o: ['dokonavý', 'nedokonavý'], a: 0, why: 'Vyjadřuje ukončený děj.' },
        { t: 'tf', q: 'Dokonavá slovesa nemají přítomný čas; tvar *přečtu* vyjadřuje budoucnost.', a: true },
        { t: 'choice', q: 'Který tvar je spisovný?', o: ['abysme', 'abychom', 'abychme'], a: 1 },
        { t: 'input', q: 'Urči slovesný rod: *Dům byl postaven loni.* (činný/trpný)', a: ['trpný'] },
        { t: 'choice', q: 'Jaký způsob je *Zavři okno!*?', o: ['oznamovací', 'rozkazovací', 'podmiňovací'], a: 1 },
        { t: 'pair', q: 'Spoj tvar s určením.', pairs: [['četl jsem', 'oznamovací, minulý'], ['budu číst', 'oznamovací, budoucí'], ['četl bych', 'podmiňovací přítomný'], ['byl bych četl', 'podmiňovací minulý']] },
        { t: 'order', q: 'Seřaď tvary od minulosti k budoucnosti.', items: ['psal jsem', 'píšu', 'budu psát'] },
        { t: 'choice', q: 'Která slovesná třída má ve 3. os. j. č. přítomného času zakončení *-ne* (*tiskne*)?', o: ['1.', '2.', '3.', '5.'], a: 1, why: 'Třídy: 1. -e, 2. -ne, 3. -je, 4. -í, 5. -á.' },
        { t: 'input', q: 'Napiš budoucí čas slovesa *jít* v 1. os. j. č.', a: ['půjdu'], why: '*Budu jít* je nesprávně.' },
        { t: 'tf', q: 'Tvar *vidíme* je 1. osoba množného čísla.', a: true },
        { t: 'open', q: 'Vyjmenuj mluvnické kategorie sloves a ke každé uveď příklad.', a: 'Osoba (*píšu/píšeš*), číslo (*píše/píšou*), čas (*psal, píše, bude psát*), způsob (*píše, piš, psal by*), rod (*napsal / byl napsán*), vid (*psát / napsat*).' },
        { t: 'open', q: 'Vysvětli rozdíl mezi dokonavým a nedokonavým videm.', a: 'Nedokonavá slovesa vyjadřují děj probíhající nebo opakovaný (*psát*) a mají tři časy. Dokonavá vyjadřují děj ukončený (*napsat*); tvar přítomného času u nich znamená budoucnost (*napíšu*).' },
      ],
    },
    {
      id: 'vetne-cleny',
      title: 'Větné členy',
      emoji: '🏗️',
      ex: [
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'p', text: 'Základ věty tvoří **základní skladební dvojice**: podmět + přísudek. Ostatní členy ji rozvíjejí.' },
            {
              t: 'table',
              head: ['Člen', 'Otázka', 'Příklad'],
              rows: [
                ['podmět', 'kdo, co?', '*Pes* štěká.'],
                ['přísudek', 'co dělá?', 'Pes *štěká*.'],
                ['předmět', 'pádová otázka (ne 1. a 5. pád)', 'Čtu *knihu*.'],
                ['příslovečné určení', 'kde, kdy, jak, proč…?', 'Přijdu *zítra*.'],
                ['přívlastek', 'jaký, který, čí?', '*Starý* pes.'],
                ['doplněk', 'jaký? (vztah ke jménu i ke slovesu)', 'Vrátil se *unavený*.'],
              ],
            },
            { t: 'list', items: ['Přísudek slovesný: *Petr píše.*', 'Přísudek jmenný se sponou: *Petr je učitelem. Den byl krásný.*'] },
            { t: 'key', text: 'Podmět a přísudek = základ. Předmět, příslovečné určení, přívlastek a doplněk = rozvíjející členy.' },
          ],
        },
        {
          title: 'Rozbor věty',
          blocks: [
            {
              t: 'steps', items: [
                'Věta: *Náš starý soused včera pečlivě opravil rozbitý plot.*',
                'Základ: *soused* (podmět) – *opravil* (přísudek)',
                'Opravil co? → *plot* (předmět)',
                'Kdy? → *včera* (PU času). Jak? → *pečlivě* (PU způsobu)',
                'Jaký soused? → *náš, starý*. Jaký plot? → *rozbitý* (přívlastky shodné)',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['předmět', 'příslovečné určení', 'přívlastek'],
                items: [
                  { text: 'čtu *knihu*', b: 0 }, { text: 'bydlím *v Brně*', b: 1 }, { text: 'dům *s věží*', b: 2 },
                  { text: 'pomáhám *bratrovi*', b: 0 }, { text: 'nepřišel *kvůli dešti*', b: 1 }, { text: '*modré* auto', b: 2 },
                  { text: 'mluvím *o filmu*', b: 0 }, { text: 'běžel *rychle*', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Člen urči otázkou od toho slova, které rozvíjí.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co tvoří základní skladební dvojici?', o: ['podmět a přísudek', 'podmět a předmět', 'přísudek a předmět'], a: 0 },
        { t: 'choice', q: 'Jaký větný člen je *knihu* ve větě *Petr čte knihu.*?', o: ['podmět', 'předmět', 'přívlastek'], a: 1 },
        { t: 'choice', q: 'Ve větě *Otec je lékařem.* je přísudek:', o: ['slovesný', 'jmenný se sponou'], a: 1 },
        { t: 'choice', q: 'Jaký větný člen je *v létě* ve větě *V létě pojedeme k moři.*?', o: ['příslovečné určení času', 'příslovečné určení místa', 'předmět'], a: 0 },
        { t: 'tf', q: 'Ve spojení *dům s věží* je *s věží* přívlastek neshodný.', a: true, why: 'Stojí za jménem a neshoduje se s ním v pádě.' },
        { t: 'choice', q: 'Který člen se vztahuje zároveň k podstatnému jménu a ke slovesu?', o: ['přívlastek', 'doplněk', 'předmět'], a: 1 },
        { t: 'pair', q: 'Spoj větný člen s otázkou.', pairs: [['podmět', 'kdo, co?'], ['přívlastek', 'jaký, který, čí?'], ['příslovečné určení', 'kde, kdy, jak, proč?'], ['předmět', 'koho, co, komu, čím…?']] },
        { t: 'choice', q: 'Věta *Prší.* je:', o: ['věta jednočlenná', 'věta s nevyjádřeným podmětem', 'věta s podmětem *to*'], a: 0, why: 'Podmět nelze doplnit – jde o slovesnou větu jednočlennou.' },
        { t: 'tf', q: 'Ve větě *Šli jsme do kina.* je podmět nevyjádřený (*my*).', a: true },
        { t: 'input', q: 'Jak se nazývá člen, který jinými slovy pojmenovává totéž, např. *Karel IV., český král*?', a: ['přístavek'] },
        { t: 'choice', q: 'Jaké příslovečné určení je *kvůli nemoci*?', o: ['času', 'příčiny', 'účelu'], a: 1 },
        { t: 'open', q: 'Vyjmenuj rozvíjející větné členy a ke každému uveď příklad.', a: 'Předmět (*čtu knihu*), příslovečné určení (*přijdu zítra*), přívlastek (*starý pes*), doplněk (*vrátil se unavený*); případně přístavek (*Praha, hlavní město*).' },
        { t: 'open', q: 'Jaký je rozdíl mezi přívlastkem shodným a neshodným?', a: 'Shodný stojí obvykle před jménem a shoduje se s ním v rodě, čísle a pádě (*modré auto*). Neshodný stojí za jménem a neshoduje se (*dům s věží, kniha bratra*).' },
      ],
    },
    {
      id: 'shoda-podmetu-s-prisudkem',
      title: 'Shoda podmětu s přísudkem',
      emoji: '🤝',
      ex: [
        {
          title: 'Podle rodu',
          blocks: [
            {
              t: 'table',
              head: ['Rod podmětu (mn. č.)', 'Koncovka', 'Příklad'],
              rows: [
                ['mužský životný', '-i', '*Psi štěkali.*'],
                ['mužský neživotný', '-y', '*Stromy rostly.*'],
                ['ženský', '-y', '*Ženy zpívaly.*'],
                ['střední', '-a', '*Města rostla.*'],
              ],
            },
            {
              t: 'w', w: 'gap', p: {
                items: [
                  { before: 'Kluci hrál', after: ' fotbal.', options: ['i', 'y'], a: 0 },
                  { before: 'Lodě plul', after: ' po řece.', options: ['i', 'y'], a: 1 },
                  { before: 'Kuřata pípal', after: '.', options: ['a', 'y'], a: 0 },
                  { before: 'Ponožky ležel', after: ' na zemi.', options: ['i', 'y'], a: 1 },
                  { before: 'Vlaky jezdil', after: ' včas.', options: ['i', 'y'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Najdi podmět → urči rod → mužský živ. -i, mužský neživ. a ženský -y, střední -a.' },
          ],
        },
        {
          title: 'Zrádné případy',
          blocks: [
            {
              t: 'list', items: [
                'Několikanásobný podmět s mužským životným → **-i**: *Muži a ženy přišli.*',
                'Ženský a mužský neživotný → **-y**: *Stoly a židle stály.*',
                'Jen střední rod → **-a**: *Kotě a štěně si hrála.*',
                'Střední + ženský/m. neživ. → **-y**: *Okna a dveře byly otevřené.*',
                '*Děti* jsou v množném čísle rodu ženského → *Děti si hrály.*',
                'Pořadí nerozhoduje: *Pásly se krávy a koně* je chybně – správně *pásli*.',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['-i', '-y', '-a'],
                items: [
                  { text: 'Rodiče přišl_', b: 0 }, { text: 'Děti spal_', b: 1 }, { text: 'Auta stál_', b: 2 },
                  { text: 'Lidé čekal_', b: 0 }, { text: 'Myši utekl_', b: 1 }, { text: 'Koně běžel_', b: 0 },
                  { text: 'Hory se tyčil_', b: 1 }, { text: 'Vejce se vařil_', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Přednost má mužský životný (-i). Koncovka -a jen tehdy, když jsou všechny podměty středního rodu.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '*Vlaky přijížděl_ včas.*', o: ['i', 'y'], a: 1, why: '*Vlak* je mužský neživotný.' },
        { t: 'choice', q: '*Rodiče a děti odešl_.*', o: ['i', 'y', 'a'], a: 0, why: '*Rodiče* jsou mužský životný – ten má přednost.' },
        { t: 'choice', q: '*Kuřata a husy běhal_ po dvoře.*', o: ['i', 'y', 'a'], a: 1, why: 'Střední + ženský → -y.' },
        { t: 'choice', q: '*Dívky a chlapci zpíval_.*', o: ['i', 'y'], a: 0 },
        { t: 'input', q: 'Doplň písmeno: *Děti si hrál_ na zahradě.*', a: ['y'] },
        { t: 'input', q: 'Doplň písmeno: *Slunce a měsíc svítil_.*', a: ['y'], why: 'Střední + mužský neživotný → -y.' },
        { t: 'tf', q: 'Ve větě *Stromy a keře kvetly.* je koncovka správně.', a: true },
        { t: 'tf', q: 'Věta *Psy štěkaly.* je napsaná správně.', a: false, why: 'Správně *Psi štěkali.* – mužský životný.' },
        { t: 'choice', q: '*Vejce a mléko se zkazil_.*', o: ['i', 'y', 'a'], a: 2, why: 'Oba podměty jsou středního rodu.' },
        { t: 'choice', q: '*Na louce se pásl_ krávy a koně.*', o: ['i', 'y'], a: 0, why: '*Koně* jsou mužský životný; na pořadí nezáleží.' },
        { t: 'input', q: 'Doplň písmeno: *Jablka spadl_ ze stromu.*', a: ['a'] },
        { t: 'open', q: 'Vysvětli pravidla shody přísudku s několikanásobným podmětem.', a: 'Je-li mezi podměty mužský životný, píšeme -i. Jinak u ženského a mužského neživotného (i ve spojení se středním) -y. Jen když jsou všechny podměty středního rodu, píšeme -a.' },
        { t: 'open', q: 'Proč píšeme *Děti si hrály* s -y?', a: 'Podstatné jméno *děti* je v množném čísle rodu ženského (skloňuje se podle vzoru kost), proto přísudek končí na -y.' },
      ],
    },
    {
      id: 'souveti-souradne-a-carka',
      title: 'Souřadné souvětí a čárka',
      emoji: '🔗',
      ex: [
        {
          title: 'Poměry',
          blocks: [
            { t: 'p', text: 'V souřadném souvětí jsou věty gramaticky rovnocenné. Vztah mezi nimi = **poměr**.' },
            {
              t: 'table',
              head: ['Poměr', 'Význam', 'Spojky'],
              rows: [
                ['slučovací', 'prosté přidání', 'a, i, ani, nebo (= a)'],
                ['stupňovací', 'druhá věta je silnější', 'ba, ba i, nejen – ale i, dokonce'],
                ['odporovací', 'protiklad', 'ale, avšak, však, nýbrž, jenže'],
                ['vylučovací', 'jedna z možností', 'nebo, anebo, buď – nebo'],
                ['příčinný (důvodový)', 'druhá věta = důvod', 'neboť, vždyť, totiž'],
                ['důsledkový', 'druhá věta = důsledek', 'proto, a proto, tedy, tudíž, a tak'],
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['slučovací', 'odporovací', 'důsledkový'],
                items: [
                  { text: 'Petr čte a Jana píše.', b: 0 }, { text: 'Chtěl jsem jít, ale pršelo.', b: 1 },
                  { text: 'Pršelo, a proto jsme zůstali doma.', b: 2 }, { text: 'Slunce svítí a ptáci zpívají.', b: 0 },
                  { text: 'Byl unavený, avšak pokračoval.', b: 1 }, { text: 'Zaspal, tudíž přišel pozdě.', b: 2 },
                  { text: 'Bylo pozdě, a tak jsme šli spát.', b: 2 }, { text: 'Učil se, jenže neuspěl.', b: 1 },
                ],
              },
            },
            { t: 'example', q: 'Proč je čárka v *Byl nemocný, a proto nepřišel.*?', a: 'Spojka *a* je součástí výrazu *a proto* – poměr je důsledkový, ne slučovací.' },
            { t: 'key', text: 'Před *a, i, ani, nebo* v poměru slučovacím a vylučovacím čárka není; v ostatních poměrech ano.' },
          ],
        },
        {
          title: 'Čárka v praxi',
          blocks: [
            {
              t: 'list', items: [
                'Mezi větami souvětí (kromě slučovacího a vylučovacího *a, i, ani, nebo*).',
                'Vložená vedlejší věta → čárka z obou stran.',
                'Výčet bez spojky: *jablka, hrušky, švestky*.',
                'Před odporovací spojkou: *malý, ale silný*.',
                'Oslovení, přístavek, vsuvka: *Petře, pojď sem.*',
              ],
            },
            {
              t: 'w', w: 'gap', p: {
                items: [
                  { before: '', after: ' máš pravdu.', options: ['Myslím, že', 'Myslím že'], a: 0 },
                  { before: 'Koupil jsem ', after: '.', options: ['chleba a rohlíky', 'chleba, a rohlíky'], a: 0 },
                  { before: 'Kluk', after: ' je můj bratr.', options: [', který přišel včera,', ' který přišel včera,'], a: 0 },
                  { before: 'Byl unavený', after: ' šel spát.', options: [', a proto', ' a proto'], a: 0 },
                  { before: '', after: ' pojď sem!', options: ['Petře,', 'Petře'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Spočítej určitá slovesa → najdi hranice vět → čárka všude, kde to slučovací *a* nezakazuje.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký poměr je v souvětí *Nejen že zpívá, ale i tančí.*?', o: ['slučovací', 'stupňovací', 'odporovací'], a: 1 },
        { t: 'choice', q: '*Neměl peníze, proto nic nekoupil.* – poměr:', o: ['příčinný', 'důsledkový', 'odporovací'], a: 1 },
        { t: 'choice', q: '*Přijdu pozdě, neboť mi ujel autobus.* – poměr:', o: ['příčinný (důvodový)', 'důsledkový', 'slučovací'], a: 0 },
        { t: 'tf', q: '*Půjdeme do kina, nebo zůstaneme doma.* – čárka před *nebo* je správně.', a: false, why: 'Vylučovací *nebo* se čárkou neodděluje.' },
        { t: 'choice', q: 'Která spojka je odporovací?', o: ['nýbrž', 'neboť', 'tudíž', 'ba'], a: 0 },
        { t: 'pair', q: 'Spoj spojku s poměrem.', pairs: [['ba', 'stupňovací'], ['avšak', 'odporovací'], ['tudíž', 'důsledkový'], ['vždyť', 'příčinný']] },
        { t: 'input', q: 'Za kterým slovem chybí čárka? *Bylo zima a proto jsme topili.*', a: ['zima'] },
        { t: 'choice', q: 'Která věta je napsaná správně?', o: ['Řekl, že přijde, a opravdu přišel.', 'Řekl, že přijde a opravdu přišel.'], a: 0, why: 'Vedlejší věta *že přijde* končí před *a*, které spojuje věty hlavní – čárka ji uzavírá.' },
        { t: 'choice', q: 'Která věta je napsaná správně?', o: ['Praha, hlavní město Česka, leží na Vltavě.', 'Praha, hlavní město Česka leží na Vltavě.', 'Praha hlavní město Česka, leží na Vltavě.'], a: 0, why: 'Přístavek se odděluje čárkami z obou stran.' },
        { t: 'tf', q: 'Ve srovnání *bílý jako sníh* se před *jako* čárka nepíše.', a: true },
        { t: 'tf', q: 'Souřadné souvětí tvoří věty, které jsou si gramaticky rovnocenné.', a: true },
        { t: 'open', q: 'Vyjmenuj poměry mezi větami hlavními a ke každému uveď spojku.', a: 'Slučovací (*a, i*), stupňovací (*ba, nejen – ale i*), odporovací (*ale, avšak*), vylučovací (*nebo, buď – nebo*), příčinný (*neboť, vždyť*), důsledkový (*proto, tudíž*).' },
        { t: 'open', q: 'Kdy se píše čárka před spojkou *a*?', a: 'V poměru slučovacím ne. Čárku píšeme, když je *a* součástí jiného poměru (*, a proto*, *, a tak*, *, a přece*) nebo když před *a* končí vložená vedlejší věta.' },
      ],
    },
    {
      id: 'souveti-podradne',
      title: 'Podřadné souvětí a vedlejší věty',
      emoji: '🌳',
      ex: [
        {
          title: 'Otázkou',
          blocks: [
            { t: 'p', text: 'Vedlejší věta (VV) zastupuje větný člen věty řídící. Druh VV zjistíš **otázkou z řídící věty**.' },
            {
              t: 'table',
              head: ['Druh VV', 'Otázka', 'Příklad'],
              rows: [
                ['podmětná', 'kdo, co?', '*Kdo lže, ten krade.*'],
                ['přísudková', 'jaký je? čím je?', '*Byl, jaký byl.*'],
                ['předmětná', 'pádová otázka', '*Řekl, že přijde.*'],
                ['přívlastková', 'jaký, který?', '*Dům, který stojí na kopci, je starý.*'],
                ['příslovečná', 'kde, kdy, jak, proč…?', '*Když prší, zůstanu doma.*'],
                ['doplňková', 'jaký? (ke jménu i slovesu)', '*Viděl ho, jak utíká.*'],
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['předmětná', 'přívlastková', 'příslovečná'],
                items: [
                  { text: 'Vím, *že to zvládneš*.', b: 0 }, { text: 'Kniha, *kterou čtu*, je dlouhá.', b: 1 },
                  { text: 'Odešel, *protože byl unavený*.', b: 2 }, { text: 'Zeptal se, *kolik je hodin*.', b: 0 },
                  { text: 'Místo, *kde jsem vyrůstal*, se změnilo.', b: 1 }, { text: 'Přijdu, *až skončí škola*.', b: 2 },
                  { text: 'Bojím se, *aby nepršelo*.', b: 0 }, { text: 'Učím se, *abych prošel*.', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Neurčuj VV podle spojky, ale podle otázky. *Aby* může uvozovat VV předmětnou i účelovou.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            {
              t: 'steps', items: [
                'Souvětí: *Když jsem přišel domů, zjistil jsem, že mi někdo vzal kolo.*',
                'Určitá slovesa: přišel, zjistil, vzal → 3 věty',
                'Hlavní věta: *zjistil jsem*',
                '*když jsem přišel domů* – zjistil kdy? → příslovečná časová',
                '*že mi někdo vzal kolo* – zjistil co? → předmětná',
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'místní', back: 'kde, kam, odkud? *Jdi, kam chceš.*' },
                  { front: 'časová', back: 'kdy? *Až přijdeš, zavolej.*' },
                  { front: 'způsobová', back: 'jak? *Udělal to, jak uměl.*' },
                  { front: 'příčinná', back: 'proč? *Nepřišel, protože byl nemocný.*' },
                  { front: 'účelová', back: 'za jakým účelem? *Učí se, aby uspěl.*' },
                  { front: 'podmínková', back: 'za jaké podmínky? *Kdyby pršelo, zůstali bychom doma.*' },
                  { front: 'přípustková', back: 'navzdory čemu? *Přestože pršelo, šli jsme ven.*' },
                ],
              },
            },
            { t: 'key', text: 'Vedlejší věta se od řídící odděluje čárkou; vložená čárkami z obou stran.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '*Řekl, že přijde.* – druh VV:', o: ['podmětná', 'předmětná', 'přívlastková'], a: 1, why: 'Řekl co?' },
        { t: 'choice', q: '*Kdo jinému jámu kopá, sám do ní padá.* – druh VV:', o: ['podmětná', 'předmětná', 'příslovečná'], a: 0, why: 'Kdo padá? → podmět.' },
        { t: 'choice', q: '*Pes, který štěká, nekouše.* – druh VV:', o: ['přívlastková', 'doplňková', 'předmětná'], a: 0 },
        { t: 'choice', q: '*Přestože byl unavený, dokončil práci.* – druh VV:', o: ['příčinná', 'přípustková', 'podmínková'], a: 1 },
        { t: 'choice', q: '*Šetří, aby si koupil kolo.* – druh VV:', o: ['účelová', 'příčinná', 'předmětná'], a: 0 },
        { t: 'choice', q: '*Zůstal, kde byl.* – druh VV:', o: ['místní', 'časová', 'způsobová'], a: 0 },
        { t: 'input', q: 'Kolik vět má souvětí *Když skončila hodina, žáci, kteří měli hlad, běželi do jídelny.*?', a: ['3'] },
        { t: 'pair', q: 'Spoj spojku s typickým druhem VV.', pairs: [['protože', 'příčinná'], ['kdyby', 'podmínková'], ['ačkoli', 'přípustková'], ['až', 'časová']] },
        { t: 'tf', q: 'Vztažné zájmeno *který* uvozuje nejčastěji větu přívlastkovou.', a: true },
        { t: 'tf', q: 'Vložená vedlejší věta se odděluje čárkami z obou stran.', a: true },
        { t: 'choice', q: 'Která VV odpovídá na otázku *za jaké podmínky?*', o: ['podmínková', 'přípustková', 'časová'], a: 0 },
        { t: 'open', q: 'Vyjmenuj druhy vedlejších vět a vysvětli, jak je určíš.', a: 'Podmětná, přísudková, předmětná, přívlastková, příslovečná (místní, časová, způsobová, příčinná, účelová, podmínková, přípustková) a doplňková. Určím je otázkou z věty řídící.' },
        { t: 'open', q: 'Rozeber souvětí *Když jsem přišel domů, zjistil jsem, že mi někdo vzal kolo.*', a: 'Tři věty. Hlavní *zjistil jsem*. *Když jsem přišel domů* – VV příslovečná časová (kdy?). *Že mi někdo vzal kolo* – VV předmětná (co?).' },
      ],
    },
    {
      id: 'odborny-styl-vyklad',
      title: 'Odborný styl a výklad',
      emoji: '🔬',
      ex: [
        {
          title: 'Znaky stylu',
          blocks: [
            { t: 'p', text: 'Funkce: **odborně sdělná** – přesně a věcně předat poznatky.' },
            {
              t: 'table',
              head: ['Znak', 'Příklad'],
              rows: [
                ['termíny', '*fotosyntéza, valence*'],
                ['přesnost, objektivita', 'bez citového zabarvení'],
                ['nominální vyjadřování', '*provedení měření* místo *změřili jsme*'],
                ['trpný rod, neosobní tvary', '*bylo zjištěno*'],
                ['citace a odkazy, grafy, tabulky', 'uvedení zdroje'],
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['odborný styl', 'jiný styl'],
                items: [
                  { text: 'výklad', b: 0 }, { text: 'odborný referát', b: 0 }, { text: 'anotace', b: 0 }, { text: 'resumé', b: 0 },
                  { text: 'fejeton', b: 1 }, { text: 'žádost', b: 1 }, { text: 'pohádka', b: 1 }, { text: 'reportáž', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Odborný text je přesný, věcný, logicky členěný a používá termíny.' },
          ],
        },
        {
          title: 'Stavba výkladu',
          blocks: [
            {
              t: 'steps', items: [
                'Úvod: vymezení tématu, definice pojmu.',
                'Stať: příčiny, souvislosti, příklady.',
                'Členění: odstavce, nadpisy, výčty.',
                'Závěr: shrnutí, význam, zdroje.',
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'definice', back: 'Co to je? *Fotosyntéza je proces, při kterém…*' },
                  { front: 'analýza', back: 'rozložení celku na části' },
                  { front: 'syntéza', back: 'spojení částí v celek' },
                  { front: 'indukce', back: 'od jednotlivých případů k obecnému závěru' },
                  { front: 'dedukce', back: 'od obecného k jednotlivému' },
                ],
              },
            },
            { t: 'key', text: 'Výklad neodpovídá jen *co*, ale hlavně **proč a jak**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Hlavní funkce odborného stylu je:', o: ['estetická', 'odborně sdělná', 'přesvědčovací'], a: 1 },
        { t: 'choice', q: 'Který útvar patří do odborného stylu?', o: ['výklad', 'fejeton', 'úvodník'], a: 0 },
        { t: 'tf', q: 'Odborný text by měl obsahovat hodně citově zabarvených slov.', a: false },
        { t: 'choice', q: 'Co je anotace?', o: ['stručná informace o obsahu textu', 'podrobný rozbor díla', 'osobní hodnocení'], a: 0 },
        { t: 'choice', q: 'Postup od jednotlivých případů k obecnému závěru je:', o: ['dedukce', 'indukce', 'analýza'], a: 1 },
        { t: 'tf', q: 'Pro odborný styl je typické nominální vyjadřování (*provádění výzkumu*).', a: true },
        { t: 'input', q: 'Jak se nazývá slovo s přesně vymezeným odborným významem?', a: ['termín', 'odborný termín'] },
        { t: 'choice', q: 'Čím se výklad liší od popisu?', o: ['vysvětluje příčiny a souvislosti', 'líčí vzhled předmětu', 'vypráví děj'], a: 0 },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['anotace', 'krátká informace o obsahu'], ['resumé', 'shrnutí textu'], ['citace', 'doslovně převzatý text se zdrojem'], ['výklad', 'vysvětlení jevu a jeho příčin']] },
        { t: 'tf', q: 'Převzaté myšlenky je v odborném textu nutné doložit zdrojem.', a: true },
        { t: 'open', q: 'Charakterizuj odborný styl a jeho jazykové prostředky.', a: 'Funkce odborně sdělná. Je přesný, objektivní, věcný a logicky členěný. Používá termíny, nominální vyjadřování, trpný rod, složitá souvětí, citace, grafy a tabulky. Útvary: výklad, referát, anotace, resumé.' },
        { t: 'open', q: 'Jak bys postavil výklad na téma „Proč vzniká duha“?', a: 'Úvod: definice duhy. Stať: sluneční světlo se v kapkách vody láme, odráží a rozkládá na barvy; proto je duha vidět se sluncem za zády. Závěr: shrnutí a případně zdroje.' },
      ],
    },
    {
      id: 'publicisticky-styl',
      title: 'Publicistický styl',
      emoji: '📰',
      ex: [
        {
          title: 'Žánry',
          blocks: [
            { t: 'p', text: 'Funkce: **informovat** a **přesvědčovat** (persvazivní). Autor zprávy je neutrální, autor komentáře hodnotí.' },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['zpravodajské', 'analytické', 'beletristické'],
                items: [
                  { text: 'zpráva', b: 0 }, { text: 'oznámení', b: 0 }, { text: 'úvodník', b: 1 }, { text: 'komentář', b: 1 },
                  { text: 'recenze', b: 1 }, { text: 'fejeton', b: 2 }, { text: 'soudnička', b: 2 }, { text: 'causerie', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Zpráva odpovídá: kdo, co, kdy, kde, jak, proč – nejdůležitější informace jde první.' },
          ],
        },
        {
          title: 'Srovnáním',
          blocks: [
            {
              t: 'table',
              head: ['', 'Zpráva', 'Fejeton'],
              rows: [
                ['cíl', 'informovat', 'pobavit a přimět k zamyšlení'],
                ['postoj', 'objektivní', 'subjektivní'],
                ['jazyk', 'neutrální, věcný', 'hravý, vtipný'],
                ['stavba', 'obrácená pyramida', 'volná, pointa na konci'],
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Úvodník', back: 'hodnotí aktuální téma, vyjadřuje stanovisko redakce' },
                  { front: 'Komentář', back: 'podepsaný subjektivní rozbor aktuální události' },
                  { front: 'Reportáž', back: 'autor byl na místě; živé líčení, přímá řeč' },
                  { front: 'Interview', back: 'rozhovor – otázky a odpovědi' },
                  { front: 'Fejeton', back: 'vtipná úvaha o drobném tématu s pointou; mistr žánru Jan Neruda' },
                ],
              },
            },
            { t: 'key', text: 'Zpravodajství informuje, analytická publicistika hodnotí, beletristická baví a zaujme.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Na kterou otázku zpráva NEodpovídá?', o: ['kdo', 'kde', 'co si o tom myslí autor', 'kdy'], a: 2 },
        { t: 'choice', q: 'Žánr vyjadřující stanovisko redakce:', o: ['úvodník', 'zpráva', 'inzerát'], a: 0 },
        { t: 'choice', q: 'Kdo je považován za mistra českého fejetonu 19. století?', o: ['Jan Neruda', 'Josef Jungmann', 'Karel Hynek Mácha'], a: 0 },
        { t: 'tf', q: 'Reportáž je založena na autorově přímém pozorování na místě.', a: true },
        { t: 'tf', q: 'Zpráva má obsahovat autorovo hodnocení.', a: false, why: 'Zpráva je objektivní; hodnotí komentář.' },
        { t: 'input', q: 'Jak se nazývá úvodní zvýrazněný odstavec článku, který shrnuje to podstatné?', a: ['perex', 'lead'] },
        { t: 'pair', q: 'Spoj žánr s popisem.', pairs: [['zpráva', 'objektivní informace'], ['komentář', 'hodnocení události'], ['fejeton', 'vtipná úvaha s pointou'], ['interview', 'rozhovor']] },
        { t: 'choice', q: 'Co je typické pro jazyk publicistiky?', o: ['poutavé titulky a aktualizovaná pojmenování', 'výhradně odborné termíny', 'archaismy'], a: 0 },
        { t: 'choice', q: 'Recenze hodnotí:', o: ['nové umělecké dílo', 'počasí', 'výsledky voleb'], a: 0 },
        { t: 'tf', q: 'Bulvár je typický senzacechtivostí a důrazem na emoce.', a: true },
        { t: 'choice', q: 'Co znamená persvazivní funkce?', o: ['přesvědčovací', 'zábavná', 'popisná'], a: 0 },
        { t: 'open', q: 'Porovnej zprávu a komentář.', a: 'Zpráva objektivně informuje o události (kdo, co, kdy, kde, jak, proč), bez názoru autora. Komentář je podepsaný, událost rozebírá a hodnotí, vyjadřuje autorův názor.' },
        { t: 'open', q: 'Jaké jsou funkce publicistického stylu a jeho hlavní žánry?', a: 'Funkce informativní a persvazivní. Zpravodajské žánry (zpráva, oznámení), analytické (úvodník, komentář, recenze), beletristické (fejeton, soudnička, causerie); dále reportáž a interview.' },
      ],
    },
    {
      id: 'administrativni-styl',
      title: 'Administrativní styl',
      emoji: '🗂️',
      ex: [
        {
          title: 'Šablona žádosti',
          blocks: [
            {
              t: 'steps', items: [
                'Odesílatel: jméno, adresa, kontakt',
                'Adresát: instituce, osoba, adresa',
                'Místo a datum: *V Brně 23. 10. 2026*',
                'Věc: *Žádost o uvolnění z výuky*',
                'Oslovení: *Vážená paní ředitelko,*',
                'Text: co žádám, proč, od kdy do kdy',
                'Pozdrav, podpis, případně přílohy',
              ],
            },
            {
              t: 'w', w: 'gap', p: {
                items: [
                  { before: 'Datum: ', after: '', options: ['23. 10. 2026', '23.10.2026'], a: 0 },
                  { before: '', after: ' Vás o uvolnění z výuky.', options: ['Žádám', 'Chtěl bych tak nějak poprosit'], a: 0 },
                  { before: 'Věc: ', after: '', options: ['Žádost o uvolnění z výuky', 'Potřebuju volno'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Stručně, přesně, věcně – podle ustálené šablony.' },
          ],
        },
        {
          title: 'Druhy písemností',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Žádost', back: 'prosím instituci o něco (přijetí, uvolnění)' },
                  { front: 'Strukturovaný životopis', back: 'vzdělání, praxe, dovednosti v bodech – od nejnovějšího' },
                  { front: 'Motivační dopis', back: 'proč chci právě toto místo a co nabízím' },
                  { front: 'Plná moc', back: 'zmocňuji jinou osobu, aby jednala za mě' },
                  { front: 'Reklamace', back: 'uplatnění vady zboží či služby' },
                  { front: 'Objednávka', back: 'závazná žádost o dodání zboží či služby' },
                ],
              },
            },
            { t: 'list', items: ['Funkce: informovat a řídit (věcně sdělná).', 'Ustálené formule: *Věc:, V příloze zasílám…*', 'Zkratky: *č. j., tzv., tj.*', 'Žádné citové zabarvení.'] },
            { t: 'key', text: 'Úřední písemnost = jasný účel, úplné údaje, zdvořilý a neosobní tón.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co do žádosti nepatří?', o: ['věc', 'datum', 'vtipné úvodní vyprávění', 'podpis'], a: 2 },
        { t: 'choice', q: 'Strukturovaný životopis uvádí vzdělání a praxi:', o: ['od nejnovějšího', 'v souvislém vyprávění od narození', 'abecedně'], a: 0 },
        { t: 'tf', q: 'Motivační dopis vysvětluje, proč se o místo ucházím a co mohu nabídnout.', a: true },
        { t: 'tf', q: 'V administrativním stylu jsou vhodné citově zabarvené výrazy.', a: false },
        { t: 'choice', q: 'Jak správně zapsat datum v dopise?', o: ['23. 10. 2026', '23.10.2026', '23 .10 .2026'], a: 0, why: 'Za tečkou se píše mezera.' },
        { t: 'input', q: 'Jak se nazývá listina, kterou zmocňuji jinou osobu, aby za mě jednala?', a: ['plná moc', 'plnou moc'] },
        { t: 'pair', q: 'Spoj písemnost s účelem.', pairs: [['žádost', 'prosba instituci'], ['reklamace', 'vadné zboží'], ['objednávka', 'dodání zboží'], ['plná moc', 'zmocnění jiné osoby']] },
        { t: 'choice', q: 'Kterou formulaci použiješ v žádosti?', o: ['Žádám Vás o uvolnění z výuky dne 5. 11. 2026.', 'Potřeboval bych tak nějak volno.', 'Dejte mi volno.'], a: 0 },
        { t: 'tf', q: 'V dopise jedné osobě lze z úcty psát *Vás, Váš* s velkým písmenem.', a: true },
        { t: 'choice', q: 'Co obsahuje řádek *Věc:*?', o: ['stručné označení obsahu dopisu', 'jméno odesílatele', 'seznam příloh'], a: 0 },
        { t: 'tf', q: 'Životopis má obsahovat kontaktní údaje.', a: true },
        { t: 'open', q: 'Jaké jsou znaky administrativního stylu?', a: 'Věcnost, stručnost, přesnost a úplnost údajů, neosobní tón bez citového zabarvení, ustálené formule a šablony, zkratky. Útvary: žádost, životopis, plná moc, objednávka, reklamace.' },
        { t: 'open', q: 'Co by měl obsahovat motivační dopis?', a: 'Na jakou pozici či školu se hlásím, proč právě tam, jaké mám zkušenosti a dovednosti a čím mohu přispět. Má být stručný, konkrétní, zdvořilý a s kontaktními údaji.' },
      ],
    },
  ],
} satisfies Subject
