import type { Subject } from '../../types'

export default {
  grade: 'z7',
  subject: 'prirodopis',
  topics: [
    {
      id: 'strunatci-obratlovci',
      title: 'Strunatci a obratlovci',
      emoji: '🦴',
      ex: [
        {
          title: 'Páteř jako sloup',
          blocks: [
            { t: 'p', text: 'Tělo obratlovce drží **páteř** – sloupec z obratlů. Chrání míchu jako trubka kabel.' },
            { t: 'w', w: 'sort', p: { buckets: ['Obratlovci', 'Bezobratlí'], items: [
              { text: 'kapr', b: 0 }, { text: 'žížala', b: 1 }, { text: 'skokan', b: 0 }, { text: 'hlemýžď', b: 1 },
              { text: 'ještěrka', b: 0 }, { text: 'včela', b: 1 }, { text: 'kos', b: 0 }, { text: 'rak', b: 1 },
            ] } },
            { t: 'key', text: 'Obratlovci mají vnitřní kostru s páteří. Bezobratlí páteř nemají.' },
          ],
        },
        {
          title: 'Přehled tříd',
          blocks: [
            { t: 'p', text: 'Strunatci mají v zárodku **strunu hřbetní**. U obratlovců ji nahradí páteř.' },
            { t: 'table', head: ['Třída', 'Pokryv těla', 'Dýchání', 'Teplota těla'], rows: [
              ['ryby', 'šupiny', 'žábry', 'proměnlivá'],
              ['obojživelníci', 'holá vlhká kůže', 'plíce, kůže', 'proměnlivá'],
              ['plazi', 'šupiny, štítky', 'plíce', 'proměnlivá'],
              ['ptáci', 'peří', 'plíce', 'stálá'],
              ['savci', 'srst', 'plíce', 'stálá'],
            ] },
            { t: 'key', text: 'Stálou teplotu těla mají jen ptáci a savci.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Žížala je obratlovec.', a: false, why: 'Žížala nemá páteř, je bezobratlá.' },
        { t: 'choice', q: 'Kteří obratlovci mají stálou teplotu těla?', o: ['ptáci a savci', 'ryby a plazi', 'obojživelníci'], a: 0 },
        { t: 'choice', q: 'Co chrání páteř?', o: ['míchu', 'srdce', 'plíce'], a: 0 },
        { t: 'input', q: 'Kolik tříd obratlovců se učí ve škole (ryby, obojživelníci, …)?', a: ['5', 'pět'] },
        { t: 'pair', q: 'Spoj třídu s pokryvem těla.', pairs: [['ryby', 'šupiny'], ['ptáci', 'peří'], ['savci', 'srst'], ['obojživelníci', 'holá kůže']] },
        { t: 'tf', q: 'Plazi mají proměnlivou teplotu těla.', a: true },
        { t: 'choice', q: 'Kopinatec je…', o: ['strunatec bez páteře', 'ryba', 'měkkýš'], a: 0, why: 'Kopinatec má celý život struny hřbetní, ale nemá páteř.' },
        { t: 'choice', q: 'Čím dýchají ryby?', o: ['žábrami', 'plícemi', 'vzdušnicemi'], a: 0 },
        { t: 'tf', q: 'Bezobratlých druhů je na Zemi mnohem víc než obratlovců.', a: true },
        { t: 'order', q: 'Seřaď třídy obratlovců podle vývoje (od nejstarší).', items: ['ryby', 'obojživelníci', 'plazi', 'savci'] },
        { t: 'open', q: 'Jaký je rozdíl mezi obratlovcem a bezobratlým?', a: 'Obratlovec má vnitřní kostru s páteří, která chrání míchu. Bezobratlý páteř nemá.' },
        { t: 'open', q: 'Vyjmenuj třídy obratlovců a ke každé jeden příklad.', a: 'Ryby – kapr, obojživelníci – skokan, plazi – ještěrka, ptáci – kos, savci – pes.' },
      ],
    },
    {
      id: 'ryby',
      title: 'Ryby',
      emoji: '🐟',
      ex: [
        {
          title: 'Stavba těla',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'žábry', back: 'dýchání – berou kyslík z vody' },
              { front: 'postranní čára', back: 'vnímá proudění a tlak vody' },
              { front: 'plynový měchýř', back: 'nadnáší rybu ve vodě' },
              { front: 'ploutve', back: 'pohyb a řízení směru' },
              { front: 'šupiny + sliz', back: 'ochrana, snadný pohyb ve vodě' },
            ] } },
            { t: 'key', text: 'Ryba dýchá žábrami, plave ploutvemi a „slyší“ proudění postranní čarou.' },
          ],
        },
        {
          title: 'Kde žijí',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Sladkovodní', 'Mořské'], items: [
              { text: 'kapr', b: 0 }, { text: 'treska', b: 1 }, { text: 'štika', b: 0 }, { text: 'sleď', b: 1 },
              { text: 'pstruh obecný', b: 0 }, { text: 'tuňák', b: 1 }, { text: 'sumec', b: 0 },
            ] } },
            { t: 'p', text: '**Úhoř** a **losos** jsou tažné ryby – putují mezi mořem a řekami.' },
            { t: 'p', text: 'Ryby kladou do vody **jikry**, samci je oplodní **mlíčím**. Oplození je **vnější**.' },
            { t: 'key', text: 'Žraloci a rejnoci mají kostru z chrupavky.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'K čemu slouží plynový měchýř?', o: ['k nadnášení', 'k dýchání', 'k trávení'], a: 0 },
        { t: 'choice', q: 'Jak se nazývají vajíčka ryb?', o: ['jikry', 'mlíčí', 'kukly'], a: 0 },
        { t: 'tf', q: 'Ryby mají většinou vnější oplození.', a: true },
        { t: 'input', q: 'Smyslový orgán ryb vnímající proudění vody je postranní…', a: ['čára', 'cara'] },
        { t: 'choice', q: 'Kterou rybu chováme v rybnících na Vánoce?', o: ['kapr', 'treska', 'žralok'], a: 0 },
        { t: 'tf', q: 'Žralok má kostru z chrupavky.', a: true },
        { t: 'pair', q: 'Spoj rybu s prostředím.', pairs: [['pstruh', 'čistý potok'], ['kapr', 'rybník'], ['sleď', 'moře']] },
        { t: 'choice', q: 'Která ryba je dravá?', o: ['štika', 'kapr', 'karas'], a: 0 },
        { t: 'tf', q: 'Ryby mají stálou teplotu těla.', a: false, why: 'Mají proměnlivou teplotu podle vody.' },
        { t: 'choice', q: 'Úhoř říční se rozmnožuje v…', o: ['Sargasovém moři', 'Vltavě', 'Baltském moři'], a: 0 },
        { t: 'open', q: 'Jak jsou ryby přizpůsobeny životu ve vodě?', a: 'Proudnicové tělo se šupinami a slizem, ploutve, dýchání žábrami, plynový měchýř a postranní čára.' },
        { t: 'open', q: 'Jak se ryby rozmnožují?', a: 'Samice klade jikry do vody, samec je oplodní mlíčím. Oplození je vnější, z jiker se líhnou plůdky.' },
      ],
    },
    {
      id: 'obojzivelnici',
      title: 'Obojživelníci',
      emoji: '🐸',
      ex: [
        {
          title: 'Z pulce žába',
          blocks: [
            { t: 'p', text: 'Obojživelník žije „oboje“ – mládě ve vodě, dospělec často na souši.' },
            { t: 'w', w: 'cycle', p: { steps: ['vajíčka (snůška)', 'pulec se žábrami', 'pulec s nožkami', 'žabka', 'dospělá žába'] } },
            { t: 'key', text: 'Pulec dýchá žábrami, dospělá žába plícemi a kůží.' },
          ],
        },
        {
          title: 'Ocasatí a žáby',
          blocks: [
            { t: 'table', head: ['Skupina', 'Znak', 'Příklad'], rows: [
              ['žáby', 'bez ocasu, skáčou', 'skokan, ropucha, rosnička, kuňka'],
              ['ocasatí', 'mají ocas po celý život', 'čolek, mlok skvrnitý'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Žáby', 'Ocasatí'], items: [
              { text: 'rosnička zelená', b: 0 }, { text: 'čolek obecný', b: 1 }, { text: 'ropucha obecná', b: 0 },
              { text: 'mlok skvrnitý', b: 1 }, { text: 'kuňka', b: 0 }, { text: 'čolek velký', b: 1 },
            ] } },
            { t: 'key', text: 'Všichni naši obojživelníci jsou chránění.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď vývoj žáby.', items: ['vajíčko', 'pulec', 'pulec s nohama', 'dospělá žába'] },
        { t: 'choice', q: 'Čím dýchá pulec?', o: ['žábrami', 'plícemi', 'vzdušnicemi'], a: 0 },
        { t: 'tf', q: 'Dospělé žáby dýchají i kůží.', a: true, why: 'Proto musí mít kůži stále vlhkou.' },
        { t: 'choice', q: 'Mlok skvrnitý patří mezi…', o: ['ocasaté obojživelníky', 'plazy', 'žáby'], a: 0 },
        { t: 'tf', q: 'Obojživelníci mají suchou kůži se šupinami.', a: false, why: 'Mají holou, vlhkou kůži se žlázami.' },
        { t: 'input', q: 'Malá zelená žába s přísavkami na prstech, která leze po stromech, je…', a: ['rosnička', 'rosnicka', 'rosnička zelená'] },
        { t: 'pair', q: 'Spoj obojživelníka se znakem.', pairs: [['ropucha', 'bradavičnatá kůže'], ['rosnička', 'přísavky na prstech'], ['mlok', 'žlutočerné skvrny']] },
        { t: 'choice', q: 'Jak přezimují naši obojživelníci?', o: ['strnulí v úkrytu', 'odlétají na jih', 'jsou celou zimu aktivní'], a: 0 },
        { t: 'tf', q: 'Obojživelníci mají proměnlivou teplotu těla.', a: true },
        { t: 'choice', q: 'Proč obojživelníci ubývají?', o: ['mizí mokřady a tůně', 'mají moc potravy', 'je jim zima'], a: 0 },
        { t: 'open', q: 'Proč se obojživelníci jmenují právě takto?', a: 'Žijí ve vodě i na souši – larvy ve vodě se žábrami, dospělci často na souši s plícemi.' },
        { t: 'open', q: 'Popiš vývoj žáby od vajíčka.', a: 'Z vajíček ve vodě se líhnou pulci se žábrami. Postupně jim narostou nohy, zmizí ocas a žábry, vyvinou se plíce a vzniká žabka.' },
      ],
    },
    {
      id: 'plazi',
      title: 'Plazi',
      emoji: '🦎',
      ex: [
        {
          title: 'Plaz na souši',
          blocks: [
            { t: 'p', text: 'Plaz už nepotřebuje vodu k rozmnožování. Klade **vejce s kožovitou skořápkou** na souši.' },
            { t: 'list', items: ['suchá kůže se šupinami nebo štítky', 'dýchá jen plícemi', 'proměnlivá teplota – vyhřívá se na slunci', 'svléká kůži'] },
            { t: 'key', text: 'Šupiny chrání před vyschnutím, vejce s obalem umožnila život na souši.' },
          ],
        },
        {
          title: 'Skupiny a poznávání',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Ještěři', 'Hadi', 'Želvy a krokodýli'], items: [
              { text: 'ještěrka obecná', b: 0 }, { text: 'zmije obecná', b: 1 }, { text: 'želva bahenní', b: 2 },
              { text: 'slepýš křehký', b: 0 }, { text: 'užovka obojková', b: 1 }, { text: 'aligátor', b: 2 }, { text: 'gekon', b: 0 },
            ] } },
            { t: 'table', head: ['', 'Zmije obecná', 'Užovka obojková'], rows: [
              ['jed', 'jedovatá', 'nejedovatá'],
              ['zornice', 'svislá štěrbina', 'kulatá'],
              ['znak', 'klikatá čára na hřbetě', 'žluté skvrny za hlavou'],
            ] },
            { t: 'key', text: 'Slepýš není had – je to beznohý ještěr (má víčka, umí odhodit ocas).' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Slepýš křehký je had.', a: false, why: 'Je to beznohý ještěr.' },
        { t: 'choice', q: 'Jediný jedovatý had v ČR je…', o: ['zmije obecná', 'užovka obojková', 'užovka hladká'], a: 0 },
        { t: 'choice', q: 'Čím dýchají plazi?', o: ['plícemi', 'žábrami', 'kůží'], a: 0 },
        { t: 'tf', q: 'Plazi kladou vejce na souši.', a: true },
        { t: 'input', q: 'Ještěrky umí při útoku odhodit…', a: ['ocas'] },
        { t: 'pair', q: 'Spoj plaza se skupinou.', pairs: [['zmije', 'hadi'], ['slepýš', 'ještěři'], ['želva bahenní', 'želvy'], ['kajman', 'krokodýli']] },
        { t: 'choice', q: 'Podle čeho poznáš užovku obojkovou?', o: ['žluté skvrny za hlavou', 'klikatá čára na hřbetě', 'chrastítko na ocase'], a: 0 },
        { t: 'tf', q: 'Plazi se vyhřívají na slunci, protože mají proměnlivou teplotu těla.', a: true },
        { t: 'choice', q: 'Proč plazi svlékají kůži?', o: ['kvůli růstu', 'kvůli dýchání', 'kvůli zimě'], a: 0 },
        { t: 'choice', q: 'Jak přezimují naši plazi?', o: ['zimní strnulostí v úkrytu', 'odlétají', 'aktivně loví'], a: 0 },
        { t: 'open', q: 'Čím jsou plazi lépe přizpůsobeni životu na souši než obojživelníci?', a: 'Mají suchou kůži se šupinami proti vysychání, dýchají jen plícemi a kladou vejce s obalem na souši.' },
        { t: 'open', q: 'Jak rozlišíš zmiji obecnou a užovku obojkovou?', a: 'Zmije má klikatou čáru na hřbetě a svislou zornici, je jedovatá. Užovka má žluté půlměsíčité skvrny za hlavou a kulatou zornici.' },
      ],
    },
    {
      id: 'ptaci',
      title: 'Ptáci',
      emoji: '🐦',
      ex: [
        {
          title: 'Stavěný na let',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'peří', back: 'let, tepelná izolace' },
              { front: 'duté kosti', back: 'lehká kostra' },
              { front: 'vzdušné vaky', back: 'dýchání při letu, lehčí tělo' },
              { front: 'hřeben hrudní kosti', back: 'úpon silných letových svalů' },
              { front: 'zobák', back: 'místo zubů, lehký' },
              { front: 'vole a svalnatý žaludek', back: 'skladování a rozmělnění potravy' },
            ] } },
            { t: 'key', text: 'Pták je lehký a silný: duté kosti, peří, vzdušné vaky.' },
          ],
        },
        {
          title: 'Podle zobáku a hnízda',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Krmiví (holá mláďata)', 'Nekrmiví (opeřená, hned chodí)'], items: [
              { text: 'sýkora', b: 0 }, { text: 'kachna', b: 1 }, { text: 'kos', b: 0 }, { text: 'slepice', b: 1 },
              { text: 'vlaštovka', b: 0 }, { text: 'bažant', b: 1 }, { text: 'holub', b: 0 },
            ] } },
            { t: 'p', text: '**Tažní ptáci** na zimu odlétají (vlaštovka, čáp). **Stálí** zůstávají (sýkora, vrabec).' },
            { t: 'key', text: 'Ptáci mají stálou teplotu, kladou vejce s vápenitou skořápkou a sedí na nich.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Ptáci mají duté kosti.', a: true },
        { t: 'choice', q: 'Který pták je tažný?', o: ['vlaštovka', 'sýkora koňadra', 'vrabec domácí'], a: 0 },
        { t: 'choice', q: 'Mláďata kachny jsou…', o: ['nekrmivá', 'krmivá', 'slepá a holá'], a: 0, why: 'Hned po vylíhnutí jsou opeřená a sama se živí.' },
        { t: 'input', q: 'Čím je pokryto tělo ptáků?', a: ['peřím', 'peri', 'peří'] },
        { t: 'pair', q: 'Spoj ptáka se zobákem.', pairs: [['dlask', 'silný na semena'], ['datel', 'dlátovitý'], ['káně', 'hákovitý'], ['kachna', 'ploský']] },
        { t: 'tf', q: 'Ptáci mají proměnlivou teplotu těla.', a: false, why: 'Ptáci mají stálou teplotu těla.' },
        { t: 'choice', q: 'Co mají ptáci místo zubů?', o: ['zobák', 'čelisti se zuby', 'tykadla'], a: 0 },
        { t: 'choice', q: 'Která skupina jsou dravci?', o: ['káně, jestřáb, sokol', 'kos, drozd, sýkora', 'kachna, husa, labuť'], a: 0 },
        { t: 'tf', q: 'Sovy loví hlavně v noci.', a: true },
        { t: 'choice', q: 'K čemu slouží vzdušné vaky?', o: ['dýchání a odlehčení', 'trávení', 'zpěv'], a: 0 },
        { t: 'open', q: 'Jak je tělo ptáka přizpůsobeno letu?', a: 'Peří, duté lehké kosti, vzdušné vaky, silné prsní svaly upnuté na hřeben hrudní kosti, lehký zobák bez zubů.' },
        { t: 'open', q: 'Proč někteří ptáci na zimu odlétají?', a: 'V zimě u nás nenajdou potravu – hmyz. Proto tažní ptáci jako vlaštovka nebo čáp odlétají do teplých krajin.' },
      ],
    },
    {
      id: 'stavba-rostlin',
      title: 'Stavba rostlin',
      emoji: '🌿',
      ex: [
        {
          title: 'Rostlina jako dům',
          blocks: [
            { t: 'p', text: '**Kořen** = základy (drží, saje vodu). **Stonek** = výtah (vede vodu nahoru, cukry dolů). **List** = kuchyně (fotosyntéza).' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'kořen', back: 'upevnění, příjem vody a minerálních látek' },
              { front: 'stonek', back: 'opora, vedení látek' },
              { front: 'list', back: 'fotosyntéza, dýchání, odpařování' },
              { front: 'průduchy', back: 'otvory v listu pro výměnu plynů' },
              { front: 'květ', back: 'rozmnožování' },
            ] } },
            { t: 'key', text: 'Kořen, stonek, list = vegetativní orgány. Květ, plod, semeno = rozmnožovací.' },
          ],
        },
        {
          title: 'Fotosyntéza rovnicí',
          blocks: [
            { t: 'p', text: 'V listech se ze světla vyrábí cukr:' },
            { t: 'p', text: '`oxid uhličitý + voda → (světlo, chlorofyl) → cukr (glukóza) + kyslík`' },
            { t: 'steps', items: ['Kořen nasaje vodu.', 'Průduchy přijmou CO₂ ze vzduchu.', 'Chlorofyl zachytí světlo.', 'Vznikne glukóza a kyslík se uvolní.'] },
            { t: 'key', text: 'Fotosyntéza: CO₂ + voda + světlo → cukr + kyslík.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kde probíhá hlavně fotosyntéza?', o: ['v listech', 'v kořenech', 'v semenech'], a: 0 },
        { t: 'choice', q: 'Co vzniká při fotosyntéze?', o: ['cukr a kyslík', 'oxid uhličitý a voda', 'jen voda'], a: 0 },
        { t: 'tf', q: 'Kořen přijímá vodu s minerálními látkami.', a: true },
        { t: 'input', q: 'Otvory na listu pro výměnu plynů jsou…', a: ['průduchy', 'pruduchy'] },
        { t: 'pair', q: 'Spoj orgán s úkolem.', pairs: [['kořen', 'příjem vody'], ['stonek', 'vedení látek'], ['list', 'fotosyntéza'], ['květ', 'rozmnožování']] },
        { t: 'choice', q: 'Který orgán je rozmnožovací?', o: ['květ', 'list', 'kořen'], a: 0 },
        { t: 'tf', q: 'Bramborová hlíza je přeměněný stonek.', a: true, why: 'Hlíza je podzemní stonek s očky (pupeny).' },
        { t: 'choice', q: 'Mrkev má…', o: ['bulvu (kořen)', 'hlízu (stonek)', 'cibuli'], a: 0 },
        { t: 'tf', q: 'Rostliny při fotosyntéze spotřebovávají kyslík.', a: false, why: 'Kyslík uvolňují. Spotřebovávají ho při dýchání.' },
        { t: 'choice', q: 'Zelené barvivo v listech je…', o: ['chlorofyl', 'karoten', 'melanin'], a: 0 },
        { t: 'open', q: 'Napiš slovy rovnici fotosyntézy.', a: 'Oxid uhličitý a voda se za pomoci světla a chlorofylu mění na glukózu (cukr) a kyslík.' },
        { t: 'open', q: 'Jakou funkci má stonek?', a: 'Nese listy a květy, vede vodu z kořenů nahoru a cukry z listů do ostatních částí. Může i zásobit látky.' },
      ],
    },
    {
      id: 'kvet-plod',
      title: 'Květ, plod a semeno',
      emoji: '🌸',
      ex: [
        {
          title: 'Koloběh života',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['květ', 'opylení', 'oplození', 'plod se semenem', 'klíčení', 'nová rostlina'] } },
            { t: 'p', text: '**Opylení**: pyl se dostane na bliznu (větrem nebo hmyzem). **Oplození**: splynou samčí a samičí buňky.' },
            { t: 'key', text: 'Nejdřív opylení, potom oplození. Ze semeníku vznikne plod.' },
          ],
        },
        {
          title: 'Části květu',
          blocks: [
            { t: 'table', head: ['Část', 'Úkol'], rows: [
              ['kalich', 'chrání poupě'],
              ['koruna', 'láká hmyz'],
              ['tyčinky', 'tvoří pyl (samčí)'],
              ['pestík (blizna, čnělka, semeník)', 'samičí část, v semeníku vajíčka'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Dužnaté plody', 'Suché plody'], items: [
              { text: 'třešeň (peckovice)', b: 0 }, { text: 'lusk hrachu', b: 1 }, { text: 'rajče (bobule)', b: 0 },
              { text: 'oříšek lísky', b: 1 }, { text: 'jablko (malvice)', b: 0 }, { text: 'obilka pšenice', b: 1 },
            ] } },
            { t: 'key', text: 'Tyčinky = samčí, pestík = samičí.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď.', items: ['opylení', 'oplození', 'vznik plodu', 'klíčení semene'] },
        { t: 'choice', q: 'Samčí část květu je…', o: ['tyčinka', 'pestík', 'kalich'], a: 0 },
        { t: 'choice', q: 'Z čeho vzniká plod?', o: ['ze semeníku', 'z tyčinky', 'z koruny'], a: 0 },
        { t: 'tf', q: 'Opylení je přenos pylu na bliznu.', a: true },
        { t: 'input', q: 'Jak se jmenuje plod třešně, švestky nebo meruňky?', a: ['peckovice'] },
        { t: 'pair', q: 'Spoj plod s rostlinou.', pairs: [['lusk', 'hrách'], ['malvice', 'jabloň'], ['obilka', 'pšenice'], ['bobule', 'rybíz']] },
        { t: 'choice', q: 'Čím jsou opylovány trávy a obilí?', o: ['větrem', 'včelami', 'ptáky'], a: 0 },
        { t: 'tf', q: 'Koruna květu láká opylovače.', a: true },
        { t: 'choice', q: 'Co potřebuje semeno ke klíčení?', o: ['vodu, teplo a vzduch', 'jen tmu', 'jen světlo'], a: 0 },
        { t: 'tf', q: 'Jahoda je botanicky souplodí nažek.', a: true, why: 'Vlastní plody jsou drobné nažky na dužnatém květním lůžku.' },
        { t: 'open', q: 'Jaký je rozdíl mezi opylením a oplozením?', a: 'Opylení je přenos pylu na bliznu pestíku. Oplození je splynutí samčí a samičí pohlavní buňky ve vajíčku.' },
        { t: 'open', q: 'Popiš části květu a jejich úkol.', a: 'Kalich chrání, koruna láká hmyz, tyčinky tvoří pyl, pestík (blizna, čnělka, semeník) obsahuje vajíčka.' },
      ],
    },
    {
      id: 'mechy-kapradiny',
      title: 'Mechy a kapraďorosty',
      emoji: '🌾',
      ex: [
        {
          title: 'Rostliny bez květů',
          blocks: [
            { t: 'p', text: 'Mechy a kapradiny **nekvetou**. Rozmnožují se **výtrusy** a potřebují k tomu vodu.' },
            { t: 'table', head: ['', 'Mechy', 'Kapraďorosty'], rows: [
              ['kořeny', 'ne, jen příchytná vlákna (rhizoidy)', 'ano'],
              ['cévy', 'ne', 'ano'],
              ['velikost', 'malé', 'větší'],
              ['příklad', 'ploník, rašeliník', 'kapraď, přeslička, plavuň'],
            ] },
            { t: 'key', text: 'Mechy a kapradiny = výtrusné rostliny. Nemají květy ani semena.' },
          ],
        },
        {
          title: 'Mech jako houba na nádobí',
          blocks: [
            { t: 'p', text: 'Mech nasaje vodu jako houbička a pomalu ji pouští. Chrání les před suchem a povodněmi.' },
            { t: 'w', w: 'sort', p: { buckets: ['Mechy', 'Kapraďorosty'], items: [
              { text: 'ploník ztenčený', b: 0 }, { text: 'kapraď samec', b: 1 }, { text: 'rašeliník', b: 0 },
              { text: 'přeslička rolní', b: 1 }, { text: 'měřík', b: 0 }, { text: 'plavuň vidlačka', b: 1 },
            ] } },
            { t: 'p', text: 'Z pravěkých kapraďorostů (stromovitých přesliček a plavuní) vzniklo **černé uhlí**.' },
            { t: 'key', text: 'Rašeliník tvoří rašelinu, z prvohorních kapraďorostů je uhlí.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Mechy mají pravé kořeny.', a: false, why: 'Mají jen příchytná vlákna – rhizoidy.' },
        { t: 'choice', q: 'Čím se rozmnožují kapradiny?', o: ['výtrusy', 'semeny', 'hlízami'], a: 0 },
        { t: 'choice', q: 'Která rostlina patří mezi kapraďorosty?', o: ['přeslička', 'ploník', 'smrk'], a: 0 },
        { t: 'input', q: 'Mech, ze kterého vzniká rašelina, je…', a: ['rašeliník', 'raselinik'] },
        { t: 'tf', q: 'Mechy zadržují vodu v krajině.', a: true },
        { t: 'choice', q: 'Kde mají kapradiny výtrusnice?', o: ['na spodní straně listů', 'v květech', 'v kořenech'], a: 0 },
        { t: 'pair', q: 'Spoj rostlinu se skupinou.', pairs: [['ploník', 'mechy'], ['kapraď', 'kapradiny'], ['přeslička', 'přesličky'], ['vidlačka', 'plavuně']] },
        { t: 'choice', q: 'Z čeho vzniklo černé uhlí?', o: ['z prvohorních kapraďorostů', 'z mechů', 'z mořských řas'], a: 0 },
        { t: 'tf', q: 'K rozmnožování potřebují mechy vodu.', a: true },
        { t: 'choice', q: 'Přeslička rolní má jarní lodyhy…', o: ['hnědé s výtrusnými klasy', 'zelené s květy', 'bílé s plody'], a: 0 },
        { t: 'open', q: 'Jaký význam mají mechy v lese?', a: 'Zadržují vodu jako houba, brání vysychání a erozi půdy, poskytují úkryt drobným živočichům.' },
        { t: 'open', q: 'Čím se liší mechy od kapraďorostů?', a: 'Kapraďorosty mají kořeny, stonek, listy a cévy. Mechy kořeny ani cévy nemají, jsou menší. Obě skupiny se množí výtrusy.' },
      ],
    },
    {
      id: 'nahosemenne',
      title: 'Nahosemenné rostliny',
      emoji: '🌲',
      ex: [
        {
          title: 'Semeno bez obalu',
          blocks: [
            { t: 'p', text: '**Nahosemenné** mají semena „nahá“ – volně na šupinách šišek. Nemají plody ani pravé květy.' },
            { t: 'list', items: ['většinou jehlice', 'šišky', 'opylení větrem', 'většinou stálezelené'] },
            { t: 'key', text: 'Nahosemenné = semena na šupinách šišek, žádný plod.' },
          ],
        },
        {
          title: 'Poznávačka',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'smrk ztepilý', back: 'šišky visí, jehlice jednotlivě, ostré' },
              { front: 'jedle bělokorá', back: 'šišky stojí, jehlice ploché s bílými proužky' },
              { front: 'borovice lesní', back: 'jehlice po 2, oranžová kůra nahoře' },
              { front: 'modřín opadavý', back: 'na zimu shazuje jehlice, jehlice ve svazečcích' },
              { front: 'jalovec obecný', back: 'jehlice po 3, „bobule“ jsou šištice' },
              { front: 'tis červený', back: 'jedovatý, červený míšek kolem semene' },
            ] } },
            { t: 'key', text: 'Smrk – šišky visí. Jedle – šišky stojí. Modřín – opadává.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Nahosemenné rostliny mají plody.', a: false, why: 'Semena leží volně na šupinách, plod netvoří.' },
        { t: 'choice', q: 'Který jehličnan na zimu shazuje jehlice?', o: ['modřín', 'smrk', 'borovice'], a: 0 },
        { t: 'choice', q: 'Které stromy mají vzpřímené šišky?', o: ['jedle', 'smrk', 'borovice'], a: 0 },
        { t: 'input', q: 'Kolik jehlic ve svazečku má borovice lesní?', a: ['2', 'dvě', 'dve'] },
        { t: 'choice', q: 'Čím se opylují jehličnany?', o: ['větrem', 'hmyzem', 'vodou'], a: 0 },
        { t: 'tf', q: 'Tis červený je jedovatý.', a: true, why: 'Jedovaté jsou jehlice i semena, ne červený míšek.' },
        { t: 'pair', q: 'Spoj strom se znakem.', pairs: [['smrk', 'visící šišky'], ['borovice', '2 jehlice ve svazečku'], ['modřín', 'opadavý'], ['jalovec', 'modré šištice']] },
        { t: 'choice', q: 'Nejrozšířenější strom v lesích ČR je…', o: ['smrk ztepilý', 'jedle', 'tis'], a: 0 },
        { t: 'tf', q: 'Jinan dvoulaločný je nahosemenná rostlina.', a: true },
        { t: 'choice', q: 'Ze šišek jalovce se vyrábí…', o: ['koření a gin', 'papír', 'pryskyřice'], a: 0 },
        { t: 'open', q: 'Proč se jim říká nahosemenné?', a: 'Jejich semena nejsou uzavřena v plodu, leží volně (nahá) na šupinách šišek.' },
        { t: 'open', q: 'Jak rozeznáš smrk a jedli?', a: 'Smrk má šišky visící dolů a ostré jehlice. Jedle má šišky vzpřímené a ploché jehlice se dvěma bílými proužky na spodu.' },
      ],
    },
    {
      id: 'krytosemenne',
      title: 'Krytosemenné rostliny',
      emoji: '🌻',
      ex: [
        {
          title: 'Jedno-, nebo dvouděložné',
          blocks: [
            { t: 'table', head: ['Znak', 'Jednoděložné', 'Dvouděložné'], rows: [
              ['děloha', '1', '2'],
              ['žilnatina', 'souběžná', 'zpeřená / dlanitá'],
              ['kořen', 'svazčitý', 'hlavní kořen'],
              ['příklad', 'tráva, tulipán, obilí', 'růže, fazol, dub'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Jednoděložné', 'Dvouděložné'], items: [
              { text: 'pšenice', b: 0 }, { text: 'jabloň', b: 1 }, { text: 'tulipán', b: 0 }, { text: 'slunečnice', b: 1 },
              { text: 'kukuřice', b: 0 }, { text: 'hrách', b: 1 }, { text: 'konvalinka', b: 0 }, { text: 'bříza', b: 1 },
            ] } },
            { t: 'key', text: 'Krytosemenné mají semeno uzavřené v plodu.' },
          ],
        },
        {
          title: 'Čeledi',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'růžovité', back: 'jabloň, třešeň, jahodník, růže' },
              { front: 'bobovité', back: 'hrách, fazol, jetel – plod lusk' },
              { front: 'brukvovité', back: 'řepka, zelí, hořčice, ředkvička – plod šešule' },
              { front: 'hvězdnicovité', back: 'slunečnice, pampeliška, kopretina – úbor' },
              { front: 'lipnicovité', back: 'pšenice, žito, kukuřice – obilka' },
              { front: 'liliovité', back: 'tulipán, lilie' },
            ] } },
            { t: 'key', text: 'Krytosemenné = květ, plod a v něm semeno.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik děloh má pšenice?', o: ['1', '2', '3'], a: 0 },
        { t: 'tf', q: 'Dvouděložné rostliny mají obvykle síťnatou (zpeřenou) žilnatinu.', a: true },
        { t: 'choice', q: 'Do které čeledi patří hrách?', o: ['bobovité', 'růžovité', 'lipnicovité'], a: 0 },
        { t: 'choice', q: 'Slunečnice má květenství…', o: ['úbor', 'klas', 'hrozen'], a: 0 },
        { t: 'input', q: 'Plod obilnin (pšenice, žita) se nazývá…', a: ['obilka'] },
        { t: 'pair', q: 'Spoj rostlinu s čeledí.', pairs: [['jabloň', 'růžovité'], ['fazol', 'bobovité'], ['pampeliška', 'hvězdnicovité'], ['žito', 'lipnicovité']] },
        { t: 'tf', q: 'Krytosemenné rostliny mají semena uzavřená v plodu.', a: true },
        { t: 'choice', q: 'Svazčité kořeny mají…', o: ['jednoděložné', 'dvouděložné', 'jehličnany'], a: 0 },
        { t: 'choice', q: 'Která rostlina je jednoděložná?', o: ['tulipán', 'jahodník', 'dub'], a: 0 },
        { t: 'tf', q: 'Bobovité rostliny obohacují půdu o dusík.', a: true, why: 'Na kořenech mají hlízkové bakterie, které váží vzdušný dusík.' },
        { t: 'open', q: 'Jak poznáš jednoděložnou rostlinu od dvouděložné?', a: 'Jednoděložná má jednu dělohu, souběžnou žilnatinu a svazčité kořeny. Dvouděložná má dvě dělohy, síťnatou žilnatinu a hlavní kořen.' },
        { t: 'open', q: 'Čím se liší krytosemenné rostliny od nahosemenných?', a: 'Krytosemenné mají pravé květy a semena uzavřená v plodu. Nahosemenné mají semena volně na šupinách šišek.' },
      ],
    },
  ],
} satisfies Subject
