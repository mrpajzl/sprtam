import type { Subject } from '../../types'

export default {
  grade: 'z9',
  subject: 'prirodopis',
  topics: [
    {
      id: 'stavba-zeme',
      title: 'Stavba Země',
      emoji: '🌍',
      ex: [
        {
          title: 'Jako broskev',
          blocks: [
            { t: 'p', text: 'Země je jako **broskev**: tenká slupka = **kůra**, dužina = **plášť**, pecka = **jádro**.' },
            { t: 'pic', items: ['🍑', '➡️', '🌍'], caption: 'slupka – dužina – pecka' },
            { t: 'key', text: 'Kůra → plášť → jádro (vnější tekuté, vnitřní pevné).' },
          ],
        },
        {
          title: 'V číslech',
          blocks: [
            { t: 'table', head: ['Vrstva', 'Hloubka', 'Poznámka'], rows: [
              ['zemská kůra', 'do 5–70 km', 'pod oceány tenčí, pod horami silnější'],
              ['zemský plášť', 'do 2 900 km', 'horké horniny, pomalu proudí'],
              ['vnější jádro', 'do 5 100 km', 'tekuté, železo a nikl'],
              ['vnitřní jádro', 'do 6 370 km (střed)', 'pevné, nejteplejší'],
            ] },
            { t: 'w', w: 'bars', p: { unit: 'km tloušťka', items: [
              { label: 'kůra (pevninská)', value: 35 }, { label: 'plášť', value: 2865 }, { label: 'vnější jádro', value: 2200 }, { label: 'vnitřní jádro', value: 1270 },
            ] } },
            { t: 'key', text: '**Litosféra** = kůra + nejsvrchnější pevná část pláště. Je rozlámaná na desky.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď vrstvy od povrchu do středu.', items: ['zemská kůra', 'zemský plášť', 'vnější jádro', 'vnitřní jádro'] },
        { t: 'choice', q: 'Která vrstva je tekutá?', o: ['vnější jádro', 'vnitřní jádro', 'kůra'], a: 0 },
        { t: 'choice', q: 'Kde je zemská kůra nejtenčí?', o: ['pod oceány', 'pod Himálajem', 'pod Alpami'], a: 0 },
        { t: 'tf', q: 'Jádro Země je hlavně ze železa a niklu.', a: true },
        { t: 'input', q: 'Pevný obal Země z kůry a svrchní části pláště je…', a: ['litosféra', 'litosfera'] },
        { t: 'pair', q: 'Spoj obal Země s tím, co tvoří.', pairs: [['litosféra', 'horniny'], ['hydrosféra', 'voda'], ['atmosféra', 'vzduch'], ['biosféra', 'život']] },
        { t: 'tf', q: 'Litosféra je rozdělena na desky, které se pohybují.', a: true },
        { t: 'choice', q: 'Přibližný poloměr Země je…', o: ['6 370 km', '637 km', '63 700 km'], a: 0 },
        { t: 'tf', q: 'Nejsilnější vrstvou Země je kůra.', a: false, why: 'Kůra je nejtenčí. Nejsilnější je plášť.' },
        { t: 'choice', q: 'Jak víme, jak vypadá nitro Země?', o: ['ze šíření zemětřesných vln', 'z vrtů do jádra', 'z fotografií'], a: 0 },
        { t: 'open', q: 'Popiš stavbu Země.', a: 'Na povrchu je tenká zemská kůra, pod ní plášť do hloubky asi 2 900 km. Uprostřed je jádro – vnější tekuté a vnitřní pevné, hlavně ze železa a niklu.' },
        { t: 'open', q: 'Co je litosféra a proč je důležitá?', a: 'Pevný obal Země z kůry a svrchní části pláště. Je rozdělena na desky, jejichž pohyb způsobuje zemětřesení, sopky a vznik pohoří.' },
      ],
    },
    {
      id: 'nerosty',
      title: 'Nerosty',
      emoji: '💎',
      ex: [
        {
          title: 'Stupnice tvrdosti',
          blocks: [
            { t: 'p', text: 'Nerost (minerál) je přírodní látka se stálým složením, často tvoří **krystaly**. Tvrdost se měří **Mohsovou stupnicí**.' },
            { t: 'w', w: 'bars', p: { unit: 'tvrdost (Mohs)', items: [
              { label: 'mastek', value: 1 }, { label: 'sádrovec', value: 2 }, { label: 'kalcit', value: 3 }, { label: 'fluorit', value: 4 },
              { label: 'křemen', value: 7 }, { label: 'topaz', value: 8 }, { label: 'korund', value: 9 }, { label: 'diamant', value: 10 },
            ] } },
            { t: 'key', text: 'Tvrdší nerost rýpe do měkčího. Nejtvrdší je diamant (10).' },
            { t: 'example', q: 'Sklo má tvrdost asi 5,5. Rýpne do něj křemen?', a: 'Ano, křemen (7) je tvrdší.' },
          ],
        },
        {
          title: 'Poznávačka',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'křemen', back: 'SiO₂, tvrdost 7, odrůdy ametyst, záhněda' },
              { front: 'kalcit', back: 'CaCO₃, šumí s kyselinou, tvoří vápenec' },
              { front: 'halit', back: 'NaCl – kamenná sůl, slaná chuť' },
              { front: 'pyrit', back: 'FeS₂, „kočičí zlato“, zlatožlutý' },
              { front: 'grafit', back: 'uhlík, měkký, tuhy do tužek' },
              { front: 'magnetit', back: 'železná ruda, je magnetický' },
            ] } },
            { t: 'p', text: 'Vlastnosti nerostů: barva, **vryp**, lesk, tvrdost, štěpnost, hustota.' },
            { t: 'key', text: 'Diamant i grafit jsou čistý uhlík – liší se uspořádáním atomů.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Jakou tvrdost má diamant na Mohsově stupnici?', a: ['10'] },
        { t: 'choice', q: 'Nejměkčí nerost Mohsovy stupnice je…', o: ['mastek', 'sádrovec', 'kalcit'], a: 0 },
        { t: 'order', q: 'Seřaď od nejměkčího.', items: ['mastek', 'kalcit', 'křemen', 'diamant'] },
        { t: 'choice', q: 'Který nerost šumí po kápnutí kyseliny?', o: ['kalcit', 'křemen', 'grafit'], a: 0 },
        { t: 'pair', q: 'Spoj nerost s využitím.', pairs: [['grafit', 'tužky'], ['halit', 'kuchyňská sůl'], ['sádrovec', 'sádra'], ['magnetit', 'železo']] },
        { t: 'tf', q: 'Diamant a grafit jsou tvořeny uhlíkem.', a: true },
        { t: 'choice', q: 'Barva prášku nerostu (otěr na porcelánu) se nazývá…', o: ['vryp', 'lesk', 'štěpnost'], a: 0 },
        { t: 'tf', q: 'Ametyst je fialová odrůda křemene.', a: true },
        { t: 'choice', q: 'Pyrit se kvůli barvě přezdívá…', o: ['kočičí zlato', 'bílé zlato', 'černé zlato'], a: 0 },
        { t: 'tf', q: 'Nerost a hornina jsou totéž.', a: false, why: 'Hornina je směs jednoho či více nerostů.' },
        { t: 'open', q: 'Jak zjistíš tvrdost neznámého nerostu?', a: 'Zkusím, který nerost Mohsovy stupnice do něj rýpne a do kterého rýpne on. Tvrdost leží mezi nimi.' },
        { t: 'open', q: 'Jaké vlastnosti pomáhají nerosty určit?', a: 'Barva, vryp, lesk, tvrdost, štěpnost, hustota, tvar krystalů, případně magnetismus nebo reakce s kyselinou.' },
      ],
    },
    {
      id: 'horniny',
      title: 'Horniny',
      emoji: '🪨',
      ex: [
        {
          title: 'Tři rodiny',
          blocks: [
            { t: 'table', head: ['Skupina', 'Jak vznikají', 'Příklady'], rows: [
              ['vyvřelé', 'utuhnutím magmatu', 'žula, čedič'],
              ['usazené', 'usazením a zpevněním úlomků či schránek', 'pískovec, vápenec, uhlí'],
              ['přeměněné', 'přeměnou tlakem a teplem', 'rula, svor, mramor'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Vyvřelé', 'Usazené', 'Přeměněné'], items: [
              { text: 'žula', b: 0 }, { text: 'pískovec', b: 1 }, { text: 'rula', b: 2 }, { text: 'čedič', b: 0 },
              { text: 'vápenec', b: 1 }, { text: 'mramor', b: 2 }, { text: 'slepenec', b: 1 }, { text: 'svor', b: 2 },
            ] } },
            { t: 'key', text: 'Vyvřelé z magmatu, usazené z usazenin, přeměněné z jiných hornin.' },
          ],
        },
        {
          title: 'Koloběh hornin',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['magma utuhne – vyvřelá hornina', 'zvětrávání a odnos', 'usazení a zpevnění – usazená hornina', 'tlak a teplo – přeměněná hornina', 'roztavení – magma'] } },
            { t: 'example', q: 'Z čeho vzniká mramor?', a: 'Přeměnou vápence vysokým tlakem a teplotou.' },
            { t: 'key', text: 'Horniny se v přírodě neustále mění jedna v druhou.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Žula je hornina…', o: ['vyvřelá', 'usazená', 'přeměněná'], a: 0 },
        { t: 'choice', q: 'Mramor vzniká přeměnou…', o: ['vápence', 'žuly', 'uhlí'], a: 0 },
        { t: 'tf', q: 'Pískovec je usazená hornina.', a: true },
        { t: 'input', q: 'Roztavená hornina pod povrchem Země je…', a: ['magma'] },
        { t: 'pair', q: 'Spoj horninu se skupinou.', pairs: [['čedič', 'vyvřelá'], ['vápenec', 'usazená'], ['rula', 'přeměněná']] },
        { t: 'choice', q: 'Ze kterých nerostů je žula?', o: ['křemen, živec, slída', 'kalcit a dolomit', 'jen halit'], a: 0 },
        { t: 'tf', q: 'Uhlí je usazená hornina organického původu.', a: true },
        { t: 'choice', q: 'Čedič vzniká utuhnutím lávy…', o: ['na povrchu', 'hluboko pod zemí', 'v moři z ulit'], a: 0 },
        { t: 'tf', q: 'Vápenec vzniká hlavně ze schránek mořských živočichů.', a: true },
        { t: 'choice', q: 'Která hornina je typická pro Adršpašské skály?', o: ['pískovec', 'žula', 'čedič'], a: 0 },
        { t: 'open', q: 'Jak vznikají tři skupiny hornin?', a: 'Vyvřelé utuhnutím magmatu, usazené usazením a zpevněním úlomků nebo schránek, přeměněné přeměnou jiných hornin vlivem tlaku a teploty.' },
        { t: 'open', q: 'Co je koloběh hornin?', a: 'Horniny se postupně mění: vyvřelé zvětrají a vzniknou usazené, ty se tlakem a teplem přemění, roztaví se v magma a z něj vznikají znovu vyvřelé.' },
      ],
    },
    {
      id: 'vnitrni-deje',
      title: 'Vnitřní geologické děje',
      emoji: '🌋',
      ex: [
        {
          title: 'Desky jako kry',
          blocks: [
            { t: 'p', text: 'Litosférické desky plují na plášti jako **kry na řece**. Kde se srazí, vznikají hory. Kde se tře, vzniká zemětřesení.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'desky se rozcházejí', back: 'vzniká nová kůra – středooceánský hřbet' },
              { front: 'desky se srážejí', back: 'vrásnění – pohoří (Himálaj)' },
              { front: 'deska se podsouvá', back: 'sopky a hlubokomořské příkopy' },
              { front: 'desky se posouvají podél sebe', back: 'zemětřesení (zlom San Andreas)' },
            ] } },
            { t: 'key', text: 'Vnitřní děje pohání teplo z nitra Země. Tvoří reliéf.' },
          ],
        },
        {
          title: 'Sopka krok za krokem',
          blocks: [
            { t: 'steps', items: ['magma stoupá z hloubky', 'shromáždí se v magmatickém krbu', 'sopouchem vystoupí na povrch', 'kráterem vyteče jako **láva**, vyletí popel a plyny'] },
            { t: 'p', text: '**Zemětřesení**: náhlý pohyb na zlomu. Místo vzniku = ohnisko, nad ním na povrchu = epicentrum.' },
            { t: 'key', text: 'Magma pod povrchem, láva na povrchu.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Láva je magma, které vyteklo na povrch.', a: true },
        { t: 'choice', q: 'Jak vznikly Himálaje?', o: ['srážkou desek (vrásněním)', 'sopečnou činností', 'větrem'], a: 0 },
        { t: 'input', q: 'Místo na povrchu přímo nad ohniskem zemětřesení je…', a: ['epicentrum'] },
        { t: 'choice', q: 'Co pohání vnitřní geologické děje?', o: ['teplo z nitra Země', 'sluneční záření', 'vítr'], a: 0 },
        { t: 'pair', q: 'Spoj pojem s vysvětlením.', pairs: [['vrásnění', 'zvrásnění vrstev při srážce desek'], ['zlom', 'porušení vrstev s posunem'], ['kráter', 'otvor sopky'], ['seismograf', 'záznam zemětřesení']] },
        { t: 'tf', q: 'V Česku jsou dnes činné sopky.', a: false, why: 'Naše sopky (např. Komorní hůrka) jsou vyhaslé.' },
        { t: 'choice', q: 'Kde je nejvíc sopek a zemětřesení?', o: ['na okrajích desek', 'uprostřed desek', 'na pólech'], a: 0 },
        { t: 'tf', q: 'Na středooceánských hřbetech vzniká nová zemská kůra.', a: true },
        { t: 'choice', q: 'Vyvřelá hornina z lávy je například…', o: ['čedič', 'vápenec', 'rula'], a: 0 },
        { t: 'choice', q: 'Tichomořský „ohnivý kruh“ je oblast…', o: ['častých sopek a zemětřesení', 'pouští', 'korálových útesů'], a: 0 },
        { t: 'open', q: 'Co se děje na hranicích litosférických desek?', a: 'Desky se rozcházejí (vzniká nová kůra), srážejí (vrásnění, pohoří, sopky) nebo se posouvají podél sebe (zemětřesení).' },
        { t: 'open', q: 'Jaký je rozdíl mezi magmatem a lávou?', a: 'Magma je roztavená hornina pod povrchem. Když vystoupí na povrch, nazývá se láva.' },
      ],
    },
    {
      id: 'vnejsi-deje',
      title: 'Vnější geologické děje',
      emoji: '🏞️',
      ex: [
        {
          title: 'Sochaři krajiny',
          blocks: [
            { t: 'p', text: 'Vnitřní děje hory staví, **vnější je obrušují**. Pohání je Slunce a gravitace.' },
            { t: 'w', w: 'sort', p: { buckets: ['Voda', 'Vítr', 'Ledovec'], items: [
              { text: 'údolí tvaru V', b: 0 }, { text: 'písečné duny', b: 1 }, { text: 'údolí tvaru U', b: 2 }, { text: 'krasové jeskyně', b: 0 },
              { text: 'skalní hřiby', b: 1 }, { text: 'morény', b: 2 }, { text: 'meandry', b: 0 }, { text: 'kar (ledovcový kotel)', b: 2 },
            ] } },
            { t: 'key', text: 'Zvětrávání rozruší horninu, eroze ji odnese, sedimentace uloží.' },
          ],
        },
        {
          title: 'Tři kroky',
          blocks: [
            { t: 'steps', items: ['**zvětrávání** – rozpad horniny na místě (mráz, teplo, voda, kořeny)', '**eroze a odnos** – voda, vítr, ledovec přenáší úlomky', '**usazování (sedimentace)** – úlomky se uloží, vznikají usazeniny'] },
            { t: 'table', head: ['Zvětrávání', 'Příklad'], rows: [
              ['mechanické', 'voda zmrzne v puklině a roztrhne skálu'],
              ['chemické', 'voda s CO₂ rozpouští vápenec – kras'],
              ['biologické', 'kořeny rozrušují skálu'],
            ] },
            { t: 'key', text: 'Krasové jevy vznikají rozpouštěním vápence (Moravský kras).' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď vnější děje.', items: ['zvětrávání', 'odnos (eroze)', 'usazování'] },
        { t: 'choice', q: 'Údolí tvaru U vytvořil…', o: ['ledovec', 'potok', 'vítr'], a: 0 },
        { t: 'choice', q: 'Rozpouštěním vápence vzniká…', o: ['kras', 'sopka', 'moréna'], a: 0 },
        { t: 'tf', q: 'Mráz v puklinách je mechanické zvětrávání.', a: true },
        { t: 'input', q: 'Krápník rostoucí ze stropu jeskyně je…', a: ['stalaktit'] },
        { t: 'pair', q: 'Spoj činitele s tvarem.', pairs: [['řeka', 'meandr'], ['vítr', 'duna'], ['ledovec', 'moréna'], ['moře', 'útes (abraze)']] },
        { t: 'tf', q: 'Vnější děje pohání hlavně energie Slunce a gravitace.', a: true },
        { t: 'choice', q: 'Kde v ČR je známá krasová oblast?', o: ['Moravský kras', 'Krkonoše', 'Polabí'], a: 0 },
        { t: 'choice', q: 'Kořeny stromů rozrušující skálu jsou příkladem zvětrávání…', o: ['biologického', 'chemického', 'sopečného'], a: 0 },
        { t: 'tf', q: 'Vnější děje zemský povrch spíše zarovnávají.', a: true },
        { t: 'open', q: 'Jaký je rozdíl mezi zvětráváním a erozí?', a: 'Zvětrávání je rozpad horniny na místě. Eroze je odnos rozrušeného materiálu vodou, větrem nebo ledovcem.' },
        { t: 'open', q: 'Jak vznikají krasové jeskyně?', a: 'Voda s rozpuštěným CO₂ je mírně kyselá a rozpouští vápenec. Vznikají dutiny a jeskyně, z vysrážené látky krápníky.' },
      ],
    },
    {
      id: 'ery-zeme',
      title: 'Vývoj Země – geologické éry',
      emoji: '🦕',
      ex: [
        {
          title: 'Časová osa',
          blocks: [
            { t: 'p', text: 'Čísla = **miliony let zpět** (od dneška do minulosti).' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 0, label: 'dnes' },
              { year: 2.6, label: 'čtvrtohory – doby ledové, člověk' },
              { year: 66, label: 'třetihory – rozvoj savců' },
              { year: 252, label: 'druhohory – dinosauři' },
              { year: 541, label: 'prvohory – trilobiti, ryby, plavuně' },
              { year: 2500, label: 'starohory – mnohobuněční' },
              { year: 4000, label: 'prahory – první život' },
            ] } },
            { t: 'key', text: 'Prahory → starohory → prvohory → druhohory → třetihory → čtvrtohory.' },
          ],
        },
        {
          title: 'Den Země',
          blocks: [
            { t: 'p', text: 'Kdyby celé dějiny Země (asi 4,6 miliardy let) trvaly **24 hodin**:' },
            { t: 'table', head: ['Čas', 'Událost'], rows: [
              ['asi 4:00', 'první život (bakterie)'],
              ['asi 21:10', 'začátek prvohor – rozvoj živočichů'],
              ['asi 22:50', 'první dinosauři'],
              ['23:39', 'vyhynutí dinosaurů'],
              ['23:59:54', 'člověk moudrý'],
            ] },
            { t: 'key', text: 'Dinosauři vymřeli před 66 miliony let na konci druhohor.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď éry od nejstarší.', items: ['prahory', 'starohory', 'prvohory', 'druhohory', 'třetihory', 'čtvrtohory'] },
        { t: 'choice', q: 'Ve které éře žili dinosauři?', o: ['druhohory', 'prvohory', 'čtvrtohory'], a: 0 },
        { t: 'choice', q: 'Kdy vymřeli dinosauři?', o: ['před 66 miliony let', 'před 6 600 lety', 'před 2 miliardami let'], a: 0 },
        { t: 'tf', q: 'Trilobiti jsou typické zkameněliny prvohor.', a: true },
        { t: 'input', q: 'Ve které éře se objevil člověk moudrý? (…hory)', a: ['čtvrtohory', 'ctvrtohory'] },
        { t: 'pair', q: 'Spoj éru s typickým organismem.', pairs: [['prvohory', 'trilobit'], ['druhohory', 'dinosaurus'], ['třetihory', 'rozvoj savců'], ['čtvrtohory', 'mamut']] },
        { t: 'tf', q: 'Černé uhlí v Česku vzniklo hlavně v prvohorách.', a: true, why: 'Z pralesů plavuní a přesliček v karbonu.' },
        { t: 'choice', q: 'Jak stará je Země?', o: ['asi 4,6 miliardy let', 'asi 6 000 let', 'asi 100 milionů let'], a: 0 },
        { t: 'choice', q: 'Zkamenělý otisk nebo zbytek organismu je…', o: ['zkamenělina (fosilie)', 'krystal', 'magma'], a: 0 },
        { t: 'tf', q: 'Ve čtvrtohorách se střídaly doby ledové a meziledové.', a: true },
        { t: 'open', q: 'Vyjmenuj geologické éry od nejstarší a ke každé něco typického.', a: 'Prahory – první život, starohory – mnohobuněční, prvohory – trilobiti a uhlí, druhohory – dinosauři, třetihory – savci, čtvrtohory – doby ledové a člověk.' },
        { t: 'open', q: 'Proč jsou zkameněliny pro geology důležité?', a: 'Podle nich poznáme stáří vrstev hornin a jak se vyvíjel život a prostředí v minulosti.' },
      ],
    },
    {
      id: 'genetika-uvod',
      title: 'Základy genetiky',
      emoji: '🧬',
      ex: [
        {
          title: 'Kuchařka buňky',
          blocks: [
            { t: 'p', text: '**DNA** je kuchařka. **Chromozom** je jeden díl kuchařky. **Gen** je jeden recept (např. na barvu očí).' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'DNA', back: 'molekula s dědičnou informací' },
              { front: 'gen', back: 'úsek DNA pro jeden znak' },
              { front: 'chromozom', back: 'stočená DNA v jádře; člověk má 46' },
              { front: 'dominantní', back: 'silnější, projeví se vždy' },
              { front: 'recesivní', back: 'slabší, projeví se jen ve dvojici' },
              { front: 'mutace', back: 'náhodná změna DNA' },
            ] } },
            { t: 'key', text: 'Od každého rodiče dostaneš jednu sadu chromozomů (23 + 23).' },
          ],
        },
        {
          title: 'Křížení',
          blocks: [
            { t: 'p', text: 'Hnědé oči = **A** (dominantní), modré = **a** (recesivní). Oba rodiče jsou **Aa**.' },
            { t: 'table', head: ['', 'A', 'a'], rows: [
              ['A', 'AA – hnědé', 'Aa – hnědé'],
              ['a', 'Aa – hnědé', 'aa – modré'],
            ] },
            { t: 'example', q: 'Jaká je šance na modré oči?', a: '1 ze 4, tedy 25 %.' },
            { t: 'key', text: 'Pohlaví: XX = žena, XY = muž. Otec Gregor Mendel – pokusy s hrachem v Brně.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik chromozomů má běžná buňka člověka?', a: ['46'] },
        { t: 'choice', q: 'Zakladatel genetiky je…', o: ['Gregor Johann Mendel', 'Charles Darwin', 'Louis Pasteur'], a: 0 },
        { t: 'choice', q: 'Úsek DNA nesoucí informaci o jednom znaku je…', o: ['gen', 'chromozom', 'buňka'], a: 0 },
        { t: 'tf', q: 'Muž má pohlavní chromozomy XY.', a: true },
        { t: 'choice', q: 'Rodiče Aa × Aa. Kolik procent potomků bude aa?', o: ['25 %', '50 %', '75 %'], a: 0 },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['dominantní', 'projeví se vždy'], ['recesivní', 'projeví se jen ve dvojici'], ['mutace', 'změna DNA']] },
        { t: 'tf', q: 'Pohlavní buňky (vajíčko, spermie) mají 23 chromozomů.', a: true },
        { t: 'choice', q: 'Kde v buňce je hlavně uložena DNA?', o: ['v jádře', 'v membráně', 've vakuole'], a: 0 },
        { t: 'tf', q: 'Všechny vlastnosti člověka určují jen geny, prostředí nemá vliv.', a: false, why: 'Mnoho znaků ovlivňuje i prostředí (výživa, pohyb).' },
        { t: 'choice', q: 'S jakou rostlinou dělal Mendel pokusy?', o: ['s hrachem', 's pšenicí', 's růží'], a: 0 },
        { t: 'open', q: 'Vysvětli pojmy DNA, gen a chromozom.', a: 'DNA je molekula s dědičnou informací. Gen je její úsek pro jeden znak. Chromozom je útvar ze stočené DNA v jádře.' },
        { t: 'open', q: 'Proč se dítě podobá oběma rodičům?', a: 'Polovinu chromozomů dostane od matky (vajíčko) a polovinu od otce (spermie), takže má geny obou.' },
      ],
    },
    {
      id: 'ekologie',
      title: 'Ekologie',
      emoji: '🔄',
      ex: [
        {
          title: 'Od jedince k biosféře',
          blocks: [
            { t: 'steps', items: ['**jedinec** – jeden srnec', '**populace** – všichni srnci v lese', '**společenstvo** – všechny organismy lesa', '**ekosystém** – společenstvo + prostředí', '**biosféra** – všechen život na Zemi'] },
            { t: 'p', text: 'Organismy ovlivňují **abiotické** (neživé) podmínky – světlo, teplota, voda – a **biotické** (živé) – ostatní organismy.' },
            { t: 'key', text: 'Ekologie zkoumá vztahy organismů navzájem a k prostředí.' },
          ],
        },
        {
          title: 'Koloběh uhlíku',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['CO₂ ve vzduchu', 'fotosyntéza rostlin', 'potrava pro živočichy', 'dýchání a rozklad', 'CO₂ zpět do vzduchu'] } },
            { t: 'w', w: 'sort', p: { buckets: ['Výhoda pro oba', 'Jeden těží, druhý trpí'], items: [
              { text: 'lišejník (houba + řasa)', b: 0 }, { text: 'tasemnice v člověku', b: 1 }, { text: 'včela a květ', b: 0 },
              { text: 'liška a zajíc', b: 1 }, { text: 'hřib a bříza (mykorhiza)', b: 0 }, { text: 'klíště na psovi', b: 1 },
            ] } },
            { t: 'key', text: 'Látky kolují, energie jen protéká (ze Slunce, odchází jako teplo).' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď od nejmenší úrovně.', items: ['jedinec', 'populace', 'společenstvo', 'ekosystém', 'biosféra'] },
        { t: 'choice', q: 'Všichni jedinci jednoho druhu na jednom místě tvoří…', o: ['populaci', 'společenstvo', 'biosféru'], a: 0 },
        { t: 'choice', q: 'Který faktor je abiotický?', o: ['teplota', 'predátor', 'parazit'], a: 0 },
        { t: 'tf', q: 'Parazitismus je vztah, kde jeden organismus škodí druhému.', a: true },
        { t: 'input', q: 'Soužití výhodné pro oba organismy je…', a: ['symbióza', 'symbioza', 'mutualismus'] },
        { t: 'pair', q: 'Spoj vztah s příkladem.', pairs: [['predace', 'sova loví myš'], ['parazitismus', 'klíště a pes'], ['symbióza', 'houba a řasa v lišejníku'], ['konkurence', 'dva stromy o světlo']] },
        { t: 'tf', q: 'Energie v ekosystému koluje dokola stejně jako látky.', a: false, why: 'Energie proudí od Slunce a odchází jako teplo. Kolují jen látky.' },
        { t: 'choice', q: 'Které organismy vracejí CO₂ do ovzduší?', o: ['všechny při dýchání', 'jen rostliny při fotosyntéze', 'žádné'], a: 0 },
        { t: 'choice', q: 'Organismus, který snáší jen úzké rozmezí podmínek a ukazuje stav prostředí, je…', o: ['bioindikátor', 'producent', 'parazit'], a: 0 },
        { t: 'tf', q: 'Lišejníky jsou bioindikátory čistoty ovzduší.', a: true },
        { t: 'open', q: 'Popiš koloběh uhlíku v přírodě.', a: 'Rostliny berou CO₂ ze vzduchu při fotosyntéze a mění ho na cukry. Ty jedí živočichové. Dýcháním a rozkladem se CO₂ vrací do vzduchu.' },
        { t: 'open', q: 'Jaký je rozdíl mezi populací a společenstvem?', a: 'Populace jsou jedinci jednoho druhu na jednom místě. Společenstvo tvoří populace všech druhů na daném místě.' },
      ],
    },
    {
      id: 'ochrana-prirody',
      title: 'Ochrana přírody a životního prostředí',
      emoji: '♻️',
      ex: [
        {
          title: 'Problém → řešení',
          blocks: [
            { t: 'table', head: ['Problém', 'Příčina', 'Co pomůže'], rows: [
              ['zesilování skleníkového efektu', 'spalování uhlí, ropy, plynu', 'úspory energie, obnovitelné zdroje'],
              ['ztenčování ozonové vrstvy', 'freony', 'zákaz freonů'],
              ['odpady', 'jednorázové obaly', 'třídění, recyklace, méně obalů'],
              ['mizení druhů', 'ničení biotopů', 'chráněná území'],
              ['kyselé deště', 'oxidy síry a dusíku', 'odsíření elektráren'],
            ] },
            { t: 'key', text: 'Nejlepší odpad je ten, který nevznikne.' },
          ],
        },
        {
          title: 'Chráněná území',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'národní park', back: 'nejpřísnější ochrana velkého území (Krkonoše, Šumava, Podyjí, České Švýcarsko)' },
              { front: 'CHKO', back: 'chráněná krajinná oblast – krajina s lidmi (Beskydy, Pálava)' },
              { front: 'Červený seznam', back: 'seznam ohrožených druhů' },
              { front: 'CITES', back: 'úmluva o obchodu s ohroženými druhy' },
            ] } },
            { t: 'w', w: 'sort', p: { buckets: ['Žlutá – plasty', 'Modrá – papír', 'Zelená – sklo'], items: [
              { text: 'PET láhev', b: 0 }, { text: 'noviny', b: 1 }, { text: 'zavařovací sklenice', b: 2 }, { text: 'kelímek od jogurtu', b: 0 },
              { text: 'krabice od bot', b: 1 }, { text: 'láhev od sirupu (sklo)', b: 2 },
            ] } },
            { t: 'key', text: 'Nejstarší národní park ČR je Krkonošský (1963).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Nejstarší národní park v ČR je…', o: ['Krkonošský', 'Šumava', 'Podyjí'], a: 0 },
        { t: 'choice', q: 'Do jaké barvy kontejneru patří papír?', o: ['modré', 'žluté', 'zelené'], a: 0 },
        { t: 'tf', q: 'Spalování fosilních paliv zesiluje skleníkový efekt.', a: true },
        { t: 'input', q: 'Seznam ohrožených druhů se nazývá … seznam.', a: ['červený', 'cerveny'] },
        { t: 'choice', q: 'Ozonovou vrstvu poškozovaly…', o: ['freony', 'kyslík', 'vodní pára'], a: 0 },
        { t: 'pair', q: 'Spoj problém s příčinou.', pairs: [['kyselé deště', 'oxidy síry'], ['ozonová díra', 'freony'], ['skleníkový efekt', 'CO₂ ze spalování'], ['mizení druhů', 'ničení biotopů']] },
        { t: 'tf', q: 'Ozonová vrstva chrání Zemi před UV zářením.', a: true },
        { t: 'choice', q: 'Který zdroj energie je obnovitelný?', o: ['slunce', 'uhlí', 'zemní plyn'], a: 0 },
        { t: 'tf', q: 'V CHKO nesmí žít lidé.', a: false, why: 'V CHKO jsou obce a lidé hospodaří šetrně.' },
        { t: 'choice', q: 'Co znamená zkratka CHKO?', o: ['chráněná krajinná oblast', 'chráněná kulturní oblast', 'centrální hospodářská komora'], a: 0 },
        { t: 'open', q: 'Co můžeš sám udělat pro životní prostředí?', a: 'Třídit odpad, omezit obaly a plasty, šetřit vodou a energií, chodit pěšky nebo jezdit MHD a na kole, nekupovat zbytečnosti.' },
        { t: 'open', q: 'Vysvětli, co je skleníkový efekt a proč se zesiluje.', a: 'Plyny jako CO₂ zadržují teplo u povrchu Země. Spalováním uhlí, ropy a plynu jich přibývá, a tak se Země otepluje.' },
      ],
    },
  ],
} satisfies Subject
