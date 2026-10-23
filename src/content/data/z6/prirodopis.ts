import type { Subject } from '../../types'

export default {
  grade: 'z6',
  subject: 'prirodopis',
  topics: [
    {
      id: 'projevy-zivota',
      title: 'Projevy života',
      emoji: '🌱',
      ex: [
        {
          title: 'Živé, nebo neživé?',
          blocks: [
            { t: 'p', text: 'Kámen neroste, nedýchá a nemá potomky. Kočka ano. Proto je **živá**.' },
            { t: 'w', w: 'sort', p: { buckets: ['Živé', 'Neživé'], items: [
              { text: 'houba', b: 0 }, { text: 'kámen', b: 1 }, { text: 'bakterie', b: 0 }, { text: 'voda', b: 1 },
              { text: 'mech', b: 0 }, { text: 'písek', b: 1 }, { text: 'žížala', b: 0 }, { text: 'vzduch', b: 1 },
            ] } },
            { t: 'key', text: 'Živý organismus dýchá, přijímá potravu, roste, rozmnožuje se, reaguje a vylučuje.' },
          ],
        },
        {
          title: 'Seznamem',
          blocks: [
            { t: 'table', head: ['Projev', 'Příklad'], rows: [
              ['dýchání', 'pes vdechuje kyslík'],
              ['výživa', 'rostlina fotosyntetizuje'],
              ['růst a vývin', 'ze žaludu vyroste dub'],
              ['rozmnožování', 'kočka má koťata'],
              ['dráždivost', 'slunečnice se otáčí za sluncem'],
              ['vylučování', 'člověk se potí'],
            ] },
            { t: 'p', text: 'Život potřebuje **vodu, vzduch, světlo, teplo a živiny**.' },
            { t: 'key', text: 'Všechny organismy jsou složené z buněk (kromě virů, ty nejsou buňky).' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Kámen je živý organismus.', a: false, why: 'Kámen nedýchá, neroste ani se nerozmnožuje.' },
        { t: 'choice', q: 'Co NENÍ projev života?', o: ['dýchání', 'rozmnožování', 'tání', 'růst'], a: 2, why: 'Tát umí i led, není to projev života.' },
        { t: 'choice', q: 'Rostlina se otáčí za světlem. Který je to projev?', o: ['dráždivost', 'vylučování', 'rozmnožování'], a: 0, why: 'Reakce na podnět = dráždivost.' },
        { t: 'input', q: 'Nejmenší živá stavební jednotka organismu je…', a: ['buňka', 'bunka'] },
        { t: 'pair', q: 'Spoj projev s příkladem.', pairs: [['dýchání', 'vdech kyslíku'], ['rozmnožování', 'kočka má koťata'], ['vylučování', 'pocení'], ['růst', 'ze semene je strom']] },
        { t: 'tf', q: 'Bez vody nemůže existovat žádný známý život.', a: true },
        { t: 'choice', q: 'Která podmínka života pochází od Slunce?', o: ['světlo a teplo', 'půda', 'kyslík'], a: 0 },
        { t: 'tf', q: 'Houba je živý organismus.', a: true, why: 'Roste, přijímá živiny a rozmnožuje se výtrusy.' },
        { t: 'choice', q: 'Věda o živé přírodě se nazývá…', o: ['geologie', 'biologie', 'astronomie'], a: 1 },
        { t: 'open', q: 'Vyjmenuj aspoň čtyři projevy života.', a: 'Dýchání, výživa, růst a vývin, rozmnožování, dráždivost (reakce na podněty), vylučování.' },
        { t: 'open', q: 'Jaké podmínky potřebuje život na Zemi?', a: 'Vodu, vzduch (kyslík, oxid uhličitý), světlo a teplo ze Slunce a živiny.' },
      ],
    },
    {
      id: 'bunka',
      title: 'Buňka',
      emoji: '🔬',
      ex: [
        {
          title: 'Buňka jako továrna',
          blocks: [
            { t: 'p', text: 'Buňka je malá továrna. Každá část má svou práci.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'jádro', back: 'ředitelství – řídí buňku, má DNA' },
              { front: 'buněčná membrána', back: 'vrátnice – pouští látky dovnitř a ven' },
              { front: 'cytoplazma', back: 'výrobní hala – vnitřní hmota buňky' },
              { front: 'mitochondrie', back: 'elektrárna – uvolňuje energii (dýchání)' },
              { front: 'chloroplast', back: 'solární panel – fotosyntéza (jen rostliny)' },
              { front: 'vakuola', back: 'sklad – voda a látky' },
            ] } },
            { t: 'key', text: 'Jádro řídí, mitochondrie dávají energii, chloroplasty fotosyntetizují.' },
          ],
        },
        {
          title: 'Rostlinná vs. živočišná',
          blocks: [
            { t: 'table', head: ['Část', 'Rostlinná', 'Živočišná'], rows: [
              ['jádro, membrána, cytoplazma', 'ano', 'ano'],
              ['mitochondrie', 'ano', 'ano'],
              ['buněčná stěna', 'ano', 'ne'],
              ['chloroplasty', 'ano', 'ne'],
              ['velká vakuola', 'ano', 'ne'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Jen rostlinná', 'Obě buňky'], items: [
              { text: 'chloroplast', b: 0 }, { text: 'jádro', b: 1 }, { text: 'buněčná stěna', b: 0 },
              { text: 'mitochondrie', b: 1 }, { text: 'velká vakuola', b: 0 }, { text: 'membrána', b: 1 },
            ] } },
            { t: 'key', text: 'Stěna, chloroplasty a velká vakuola = rostlinná buňka.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která část řídí činnost buňky?', o: ['vakuola', 'jádro', 'stěna', 'cytoplazma'], a: 1 },
        { t: 'choice', q: 'Kde probíhá fotosyntéza?', o: ['v mitochondrii', 'v chloroplastu', 'v jádře'], a: 1 },
        { t: 'tf', q: 'Živočišná buňka má buněčnou stěnu.', a: false, why: 'Buněčnou stěnu mají rostliny, houby a bakterie, ne živočichové.' },
        { t: 'tf', q: 'Mitochondrie mají rostlinné i živočišné buňky.', a: true },
        { t: 'input', q: 'Přístroj, kterým pozorujeme buňky, je…', a: ['mikroskop'] },
        { t: 'pair', q: 'Spoj část buňky s úkolem.', pairs: [['jádro', 'řídí buňku'], ['mitochondrie', 'energie'], ['chloroplast', 'fotosyntéza'], ['membrána', 'propouští látky']] },
        { t: 'choice', q: 'Zelenou barvu rostlinám dává…', o: ['chlorofyl', 'hemoglobin', 'DNA'], a: 0, why: 'Chlorofyl je zelené barvivo v chloroplastech.' },
        { t: 'choice', q: 'Organismus z jediné buňky je…', o: ['jednobuněčný', 'mnohobuněčný', 'bezbuněčný'], a: 0 },
        { t: 'tf', q: 'V jádře je uložena dědičná informace (DNA).', a: true },
        { t: 'order', q: 'Seřaď od nejmenšího po největší.', items: ['buňka', 'pletivo / tkáň', 'orgán', 'organismus'] },
        { t: 'open', q: 'Čím se liší rostlinná buňka od živočišné?', a: 'Rostlinná buňka má navíc buněčnou stěnu, chloroplasty a velkou vakuolu.' },
        { t: 'open', q: 'K čemu slouží mitochondrie?', a: 'Probíhá v nich buněčné dýchání – uvolňuje se energie ze živin.' },
      ],
    },
    {
      id: 'viry-bakterie',
      title: 'Viry a bakterie',
      emoji: '🦠',
      ex: [
        {
          title: 'Přirovnáním',
          blocks: [
            { t: 'p', text: '**Virus** je jako zloděj s plánkem. Sám nic neumí. Vnikne do buňky a donutí ji vyrábět nové viry.' },
            { t: 'p', text: '**Bakterie** je malá samostatná buňka. Žije a množí se sama – **dělením**.' },
            { t: 'key', text: 'Virus není buňka a množí se jen v cizí buňce. Bakterie je buňka bez jádra.' },
            { t: 'example', q: 'Pomůže antibiotikum na chřipku?', a: 'Ne. Chřipku způsobuje virus. Antibiotika ničí jen bakterie.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Virus', 'Bakterie'], items: [
              { text: 'chřipka', b: 0 }, { text: 'angína (streptokok)', b: 1 }, { text: 'neštovice', b: 0 },
              { text: 'tetanus', b: 1 }, { text: 'covid-19', b: 0 }, { text: 'borelióza', b: 1 }, { text: 'vzteklina', b: 0 },
            ] } },
            { t: 'list', items: ['Užitečné bakterie: kysané mléko, jogurt, kysané zelí, střeva.', 'Rozkladači: rozkládají odumřelé zbytky na živiny.', 'Ochrana před viry: očkování.'] },
            { t: 'key', text: 'Bakterie nejsou jen škodlivé – většina je užitečná.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Virus je buňka.', a: false, why: 'Virus nemá buněčnou stavbu, je to jen nukleová kyselina v obalu.' },
        { t: 'tf', q: 'Bakterie nemá pravé jádro.', a: true, why: 'Bakterie jsou prokaryota – DNA leží volně v cytoplazmě.' },
        { t: 'choice', q: 'Čím se bakterie rozmnožují?', o: ['dělením', 'výtrusy', 'semeny'], a: 0 },
        { t: 'choice', q: 'Chřipku způsobuje…', o: ['bakterie', 'virus', 'houba'], a: 1 },
        { t: 'choice', q: 'Antibiotika účinkují na…', o: ['viry', 'bakterie', 'obojí'], a: 1 },
        { t: 'input', q: 'Ochrana proti virovým nemocem, při které dostaneme vakcínu, se jmenuje…', a: ['očkování', 'ockovani', 'vakcinace'] },
        { t: 'pair', q: 'Spoj nemoc s původcem.', pairs: [['tetanus', 'bakterie'], ['chřipka', 'virus'], ['plíseň nohou', 'houba']] },
        { t: 'tf', q: 'Bakterie se využívají při výrobě jogurtu.', a: true },
        { t: 'choice', q: 'Které bakterie fotosyntetizují?', o: ['sinice', 'streptokoky', 'salmonely'], a: 0, why: 'Sinice mají chlorofyl a tvoří kyslík.' },
        { t: 'tf', q: 'Viry se mohou množit jen uvnitř živé buňky.', a: true },
        { t: 'open', q: 'Jaký je hlavní rozdíl mezi virem a bakterií?', a: 'Bakterie je samostatná buňka bez jádra, množí se dělením. Virus není buňka a množí se jen uvnitř cizí buňky.' },
        { t: 'open', q: 'Uveď dva příklady, k čemu jsou bakterie užitečné.', a: 'Výroba jogurtu a kysaného zelí, trávení ve střevech, rozklad odumřelých těl na živiny.' },
      ],
    },
    {
      id: 'houby-lisejniky',
      title: 'Houby a lišejníky',
      emoji: '🍄',
      ex: [
        {
          title: 'Stavba houby',
          blocks: [
            { t: 'p', text: 'Co vidíme v lese, je jen **plodnice**. Hlavní část houby je pod zemí – **podhoubí** (mycelium) z tenkých vláken.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'podhoubí', back: 'síť vláken (hyf) v půdě' },
              { front: 'plodnice', back: 'klobouk + třeň, tvoří výtrusy' },
              { front: 'výtrusy', back: 'drobné částice k rozmnožování' },
              { front: 'mykorhiza', back: 'soužití houby s kořeny stromu' },
            ] } },
            { t: 'key', text: 'Houby nemají chlorofyl – nefotosyntetizují. Živí se hotovými látkami.' },
          ],
        },
        {
          title: 'Rozděl a poznej',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Jedlé', 'Jedovaté'], items: [
              { text: 'hřib smrkový', b: 0 }, { text: 'muchomůrka zelená', b: 1 }, { text: 'bedla vysoká', b: 0 },
              { text: 'muchomůrka tygrovaná', b: 1 }, { text: 'liška obecná', b: 0 }, { text: 'hřib satan', b: 1 },
            ] } },
            { t: 'p', text: '**Lišejník** = houba + řasa (nebo sinice). Houba dává vodu a úkryt, řasa vyrábí živiny. Takové soužití je **symbióza**.' },
            { t: 'key', text: 'Lišejníky rostou jen v čistém vzduchu – ukazují jeho čistotu.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Houby provádějí fotosyntézu.', a: false, why: 'Houby nemají chlorofyl.' },
        { t: 'choice', q: 'Hlavní část houby skrytá v půdě je…', o: ['plodnice', 'podhoubí', 'kořen'], a: 1 },
        { t: 'choice', q: 'Nejjedovatější houba našich lesů je…', o: ['muchomůrka zelená', 'hřib smrkový', 'bedla vysoká'], a: 0, why: 'Muchomůrka zelená způsobuje smrtelné otravy.' },
        { t: 'input', q: 'Houby se rozmnožují drobnými…', a: ['výtrusy', 'vytrusy', 'spory'] },
        { t: 'choice', q: 'Lišejník je soužití houby a…', o: ['mechu', 'řasy nebo sinice', 'bakterie tetanu'], a: 1 },
        { t: 'input', q: 'Vzájemně prospěšné soužití dvou organismů je…', a: ['symbióza', 'symbioza'] },
        { t: 'tf', q: 'Kvasinky jsou jednobuněčné houby.', a: true, why: 'Kvasinky se využívají při kynutí těsta a výrobě piva.' },
        { t: 'pair', q: 'Spoj houbu s využitím či vlastností.', pairs: [['kvasinky', 'kynutí těsta'], ['štětičkovec', 'penicilin'], ['plíseň', 'kazí potraviny'], ['hřib', 'jedlá houba']] },
        { t: 'tf', q: 'Lišejníky dobře rostou ve znečištěném ovzduší.', a: false, why: 'Jsou citlivé na znečištění, rostou v čistém vzduchu.' },
        { t: 'choice', q: 'Mykorhiza je soužití houby s…', o: ['kořeny stromů', 'hmyzem', 'lišejníkem'], a: 0 },
        { t: 'open', q: 'Popiš stavbu houby s plodnicí.', a: 'Houba má podhoubí z vláken v půdě a plodnici nad zemí. Plodnice má klobouk a třeň a tvoří výtrusy.' },
        { t: 'open', q: 'Co je lišejník a proč je zajímavý?', a: 'Je to soužití houby a řasy (sinice). Houba dává vodu a oporu, řasa živiny z fotosyntézy. Ukazuje čistotu ovzduší.' },
      ],
    },
    {
      id: 'rasy-prvoci',
      title: 'Řasy a prvoci',
      emoji: '💧',
      ex: [
        {
          title: 'Kdo je kdo',
          blocks: [
            { t: 'p', text: '**Řasy** fotosyntetizují jako rostliny. Žijí hlavně ve vodě.' },
            { t: 'p', text: '**Prvoci** jsou jednobuněční „živočichové“ – živí se hotovou potravou.' },
            { t: 'w', w: 'sort', p: { buckets: ['Řasy', 'Prvoci'], items: [
              { text: 'zelenivka', b: 0 }, { text: 'trepka', b: 1 }, { text: 'krásivka', b: 0 },
              { text: 'měňavka', b: 1 }, { text: 'zrněnka', b: 0 }, { text: 'krvinkovka (malárie)', b: 1 },
            ] } },
            { t: 'key', text: 'Řasy = fotosyntéza. Prvoci = hotová potrava.' },
          ],
        },
        {
          title: 'Karty',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'krásnoočko', back: 'má chloroplasty i bičík – na pomezí řas a prvoků' },
              { front: 'trepka', back: 'pohyb brvami, žije v louži' },
              { front: 'měňavka', back: 'pohyb panožkami, mění tvar' },
              { front: 'krvinkovka', back: 'způsobuje malárii, přenáší komár' },
              { front: 'rozsivky', back: 'řasy s křemitou schránkou' },
            ] } },
            { t: 'key', text: 'Řasy tvoří velkou část kyslíku na Zemi a jsou základem potravy ve vodě.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Řasy obsahují chlorofyl a fotosyntetizují.', a: true },
        { t: 'choice', q: 'Čím se pohybuje trepka?', o: ['brvami', 'panožkami', 'ploutvemi'], a: 0 },
        { t: 'choice', q: 'Čím se pohybuje měňavka?', o: ['bičíkem', 'panožkami', 'brvami'], a: 1 },
        { t: 'choice', q: 'Malárii způsobuje…', o: ['krvinkovka', 'trepka', 'zelenivka'], a: 0, why: 'Krvinkovku přenáší komár rodu Anopheles.' },
        { t: 'tf', q: 'Prvoci jsou mnohobuněční.', a: false, why: 'Prvoci jsou jednobuněční.' },
        { t: 'input', q: 'Zelené povlaky na kůře stromů tvoří řasa…', a: ['zelenivka', 'pleurokokus'] },
        { t: 'pair', q: 'Spoj organismus s pohybovým útvarem.', pairs: [['trepka', 'brvy'], ['měňavka', 'panožky'], ['krásnoočko', 'bičík']] },
        { t: 'tf', q: 'Řasy jsou důležitým zdrojem kyslíku.', a: true },
        { t: 'choice', q: 'Kde nejčastěji žijí řasy?', o: ['ve vodě', 'v poušti', 'v jeskyních'], a: 0 },
        { t: 'tf', q: 'Měňavka nemá stálý tvar těla.', a: true },
        { t: 'open', q: 'Jaký je rozdíl mezi řasami a prvoky ve výživě?', a: 'Řasy si živiny vyrábějí fotosyntézou. Prvoci přijímají hotovou potravu.' },
        { t: 'open', q: 'Proč jsou řasy důležité pro život ve vodě?', a: 'Vyrábějí kyslík a jsou na začátku potravního řetězce – živí se jimi drobní živočichové.' },
      ],
    },
    {
      id: 'zahavci-plostenci-hlisti',
      title: 'Žahavci, ploštěnci, hlísti',
      emoji: '🪼',
      ex: [
        {
          title: 'Tři skupiny',
          blocks: [
            { t: 'table', head: ['Skupina', 'Tělo', 'Příklad'], rows: [
              ['žahavci', 'vak s chapadly, žahavé buňky', 'nezmar, medúza, korál'],
              ['ploštěnci', 'ploché, bez článků', 'tasemnice, ploštěnka, motolice'],
              ['hlísti', 'válcovité, nečlánkované', 'škrkavka, roup'],
            ] },
            { t: 'key', text: 'Žahavci žahají, ploštěnci jsou placatí, hlísti jsou kulatí jako nitka.' },
          ],
        },
        {
          title: 'Parazit, nebo ne?',
          blocks: [
            { t: 'p', text: 'Mnoho ploštěnců a hlístů jsou **cizopasníci** (paraziti) – žijí na úkor hostitele.' },
            { t: 'w', w: 'sort', p: { buckets: ['Cizopasník', 'Volně žijící'], items: [
              { text: 'tasemnice', b: 0 }, { text: 'nezmar', b: 1 }, { text: 'škrkavka', b: 0 },
              { text: 'medúza', b: 1 }, { text: 'roup', b: 0 }, { text: 'ploštěnka', b: 1 }, { text: 'motolice jaterní', b: 0 },
            ] } },
            { t: 'key', text: 'Proti parazitům: myj si ruce, jez dobře tepelně upravené maso.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Nezmar patří mezi…', o: ['žahavce', 'hlísty', 'ploštěnce'], a: 0 },
        { t: 'choice', q: 'Tasemnice patří mezi…', o: ['hlísty', 'ploštěnce', 'kroužkovce'], a: 1 },
        { t: 'choice', q: 'Roup dětský patří mezi…', o: ['hlísty', 'žahavce', 'ploštěnce'], a: 0 },
        { t: 'tf', q: 'Korály jsou žahavci.', a: true, why: 'Korálové útesy tvoří vápenité schránky korálů.' },
        { t: 'tf', q: 'Nezmar žije v moři.', a: false, why: 'Nezmar žije ve sladké vodě.' },
        { t: 'input', q: 'Organismus, který žije na úkor jiného, je cizopasník neboli…', a: ['parazit'] },
        { t: 'pair', q: 'Spoj živočicha s tvarem těla.', pairs: [['ploštěnka', 'ploché'], ['škrkavka', 'válcovité'], ['medúza', 'zvon s chapadly']] },
        { t: 'tf', q: 'Tasemnicí se lze nakazit nedostatečně tepelně upraveným masem.', a: true },
        { t: 'choice', q: 'K čemu slouží žahavé buňky?', o: ['k lovu a obraně', 'k dýchání', 'k trávení'], a: 0 },
        { t: 'tf', q: 'Nezmar umí regenerovat – dorůst z malého kousku.', a: true },
        { t: 'open', q: 'Jak se chránit před nakažením roupy a škrkavkami?', a: 'Mýt si ruce před jídlem a po WC, mýt ovoce a zeleninu, nekousat nehty.' },
        { t: 'open', q: 'Popiš tělo žahavce na příkladu nezmara.', a: 'Tělo je vak se dvěma vrstvami buněk a jedním otvorem. Okolo otvoru má chapadla se žahavými buňkami.' },
      ],
    },
    {
      id: 'mekkysi-krouzkovci',
      title: 'Měkkýši a kroužkovci',
      emoji: '🐌',
      ex: [
        {
          title: 'Na hlemýždi a žížale',
          blocks: [
            { t: 'p', text: '**Hlemýžď** má měkké tělo: hlavu, nohu a útrobní vak. Často je chráněno **ulitou**.' },
            { t: 'p', text: '**Žížala** má tělo z mnoha stejných článků (kroužků). Prokypřuje půdu.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'plži', back: 'ulita (hlemýžď) nebo bez ní (slimák)' },
              { front: 'mlži', back: 'dvě lastury (škeble, slávka, perlorodka)' },
              { front: 'hlavonožci', back: 'chapadla u hlavy (chobotnice, sépie)' },
              { front: 'kroužkovci', back: 'článkované tělo (žížala, pijavka)' },
            ] } },
            { t: 'key', text: 'Měkkýš = měkké tělo, ulita/lastura. Kroužkovec = tělo z článků.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Plži', 'Mlži', 'Hlavonožci'], items: [
              { text: 'hlemýžď zahradní', b: 0 }, { text: 'škeble', b: 1 }, { text: 'chobotnice', b: 2 },
              { text: 'slimák', b: 0 }, { text: 'slávka jedlá', b: 1 }, { text: 'sépie', b: 2 }, { text: 'perlorodka', b: 1 },
            ] } },
            { t: 'key', text: 'Mlži filtrují vodu a tím ji čistí.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Hlemýžď patří mezi…', o: ['plže', 'mlže', 'hlavonožce'], a: 0 },
        { t: 'choice', q: 'Kdo má dvě lastury?', o: ['chobotnice', 'škeble', 'slimák'], a: 1 },
        { t: 'choice', q: 'Žížala patří mezi…', o: ['kroužkovce', 'hlísty', 'měkkýše'], a: 0 },
        { t: 'tf', q: 'Chobotnice je měkkýš.', a: true, why: 'Je to hlavonožec – skupina měkkýšů.' },
        { t: 'tf', q: 'Žížaly škodí půdě.', a: false, why: 'Prokypřují ji a mění zbytky rostlin na humus.' },
        { t: 'input', q: 'Kroužkovec, který saje krev, je…', a: ['pijavka'] },
        { t: 'pair', q: 'Spoj živočicha se skupinou.', pairs: [['slimák', 'plži'], ['slávka', 'mlži'], ['sépie', 'hlavonožci'], ['pijavka', 'kroužkovci']] },
        { t: 'tf', q: 'Mlži se živí filtrováním vody.', a: true },
        { t: 'choice', q: 'Kterým orgánem dýchá hlemýžď zahradní?', o: ['plicním vakem', 'žábrami', 'kůží'], a: 0 },
        { t: 'choice', q: 'Kde žije perlorodka říční?', o: ['v čistých potocích', 'v moři', 'v půdě'], a: 0, why: 'Je kriticky ohrožená, potřebuje velmi čistou vodu.' },
        { t: 'open', q: 'Popiš tělo měkkýše.', a: 'Měkké nečlánkované tělo: hlava, noha a útrobní vak, kryté pláštěm. Často má ulitu nebo lasturu.' },
        { t: 'open', q: 'Proč je žížala užitečná?', a: 'Prokypřuje a provzdušňuje půdu a zpracovává odumřelé zbytky rostlin na humus.' },
      ],
    },
    {
      id: 'clenovci',
      title: 'Členovci: pavoukovci a korýši',
      emoji: '🕷️',
      ex: [
        {
          title: 'Počítej nohy',
          blocks: [
            { t: 'p', text: 'Členovci mají **článkované nohy** a pevnou kostru na povrchu těla (**krunýř** z chitinu).' },
            { t: 'table', head: ['Skupina', 'Nohy', 'Příklad'], rows: [
              ['pavoukovci', '4 páry (8)', 'pavouk, klíště, štír'],
              ['korýši', 'různě, 2 páry tykadel', 'rak, stínka, krab'],
              ['hmyz', '3 páry (6)', 'včela, brouk'],
              ['stonožkovci', 'mnoho párů', 'stonožka, mnohonožka'],
            ] },
            { t: 'key', text: 'Pavouk má 8 nohou, hmyz 6 nohou.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Pavoukovci', 'Korýši', 'Hmyz'], items: [
              { text: 'klíště', b: 0 }, { text: 'rak', b: 1 }, { text: 'moucha', b: 2 }, { text: 'křižák', b: 0 },
              { text: 'stínka', b: 1 }, { text: 'mravenec', b: 2 }, { text: 'sekáč', b: 0 }, { text: 'krab', b: 1 },
            ] } },
            { t: 'key', text: 'Klíště je pavoukovec a přenáší boreliózu a klíšťovou encefalitidu.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik nohou má pavouk?', a: ['8'] },
        { t: 'choice', q: 'Klíště patří mezi…', o: ['hmyz', 'pavoukovce', 'korýše'], a: 1 },
        { t: 'choice', q: 'Stínka patří mezi…', o: ['korýše', 'hmyz', 'stonožkovce'], a: 0, why: 'Stínka je suchozemský korýš.' },
        { t: 'tf', q: 'Kostra členovců je na povrchu těla.', a: true, why: 'Je to chitinový pokryv (krunýř).' },
        { t: 'tf', q: 'Pavouk má tykadla.', a: false, why: 'Pavoukovci tykadla nemají, mají makadla.' },
        { t: 'choice', q: 'Jaké nemoci přenáší klíště?', o: ['boreliózu a encefalitidu', 'chřipku', 'malárii'], a: 0 },
        { t: 'pair', q: 'Spoj skupinu s počtem nohou.', pairs: [['hmyz', '6'], ['pavoukovci', '8'], ['rak', '10']] },
        { t: 'choice', q: 'Čím dýchá rak?', o: ['žábrami', 'plícemi', 'vzdušnicemi'], a: 0 },
        { t: 'tf', q: 'Členovci během růstu svlékají krunýř.', a: true },
        { t: 'choice', q: 'Tělo pavouka se dělí na…', o: ['hlavohruď a zadeček', 'hlavu, hruď a zadeček', 'jen jeden článek'], a: 0 },
        { t: 'open', q: 'Podle čeho poznáš pavoukovce od hmyzu?', a: 'Pavoukovec má 4 páry nohou, hlavohruď a zadeček a nemá tykadla. Hmyz má 3 páry nohou, hlavu, hruď, zadeček a tykadla.' },
        { t: 'open', q: 'Co mají všichni členovci společného?', a: 'Článkované končetiny, článkované tělo a pevný pokryv těla z chitinu, který při růstu svlékají.' },
      ],
    },
    {
      id: 'hmyz',
      title: 'Hmyz',
      emoji: '🐝',
      ex: [
        {
          title: 'Proměna',
          blocks: [
            { t: 'p', text: 'Motýl prochází **dokonalou proměnou** – má stadium kukly.' },
            { t: 'w', w: 'cycle', p: { steps: ['vajíčko', 'larva (housenka)', 'kukla', 'dospělec (motýl)'] } },
            { t: 'p', text: '**Nedokonalá proměna** nemá kuklu: vajíčko → larva (nymfa) → dospělec. Např. kobylka, šváb, vážka.' },
            { t: 'key', text: 'Dokonalá proměna = s kuklou. Nedokonalá = bez kukly.' },
          ],
        },
        {
          title: 'Tělo hmyzu',
          blocks: [
            { t: 'table', head: ['Část', 'Co na ní je'], rows: [
              ['hlava', 'tykadla, oči, ústní ústrojí'],
              ['hruď', '3 páry nohou, křídla'],
              ['zadeček', 'trávení, rozmnožování, vzdušnice'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['S kuklou', 'Bez kukly'], items: [
              { text: 'motýl', b: 0 }, { text: 'kobylka', b: 1 }, { text: 'včela', b: 0 }, { text: 'vážka', b: 1 },
              { text: 'brouk', b: 0 }, { text: 'šváb', b: 1 }, { text: 'moucha', b: 0 },
            ] } },
            { t: 'key', text: 'Hmyz dýchá vzdušnicemi – trubičkami, které vedou vzduch po těle.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik nohou má hmyz?', a: ['6'] },
        { t: 'order', q: 'Seřaď vývoj motýla.', items: ['vajíčko', 'housenka', 'kukla', 'motýl'] },
        { t: 'choice', q: 'Kdo má nedokonalou proměnu?', o: ['kobylka', 'motýl', 'včela'], a: 0 },
        { t: 'choice', q: 'Čím dýchá hmyz?', o: ['vzdušnicemi', 'plícemi', 'žábrami'], a: 0 },
        { t: 'tf', q: 'Tělo hmyzu má hlavu, hruď a zadeček.', a: true },
        { t: 'tf', q: 'Včela je škůdce.', a: false, why: 'Včela opyluje rostliny a dává med.' },
        { t: 'pair', q: 'Spoj hmyz s ústním ústrojím.', pairs: [['motýl', 'sací sosák'], ['brouk', 'kousací'], ['komár', 'bodavě sací'], ['moucha', 'lízací']] },
        { t: 'choice', q: 'Larva motýla se nazývá…', o: ['housenka', 'ponrava', 'nymfa'], a: 0 },
        { t: 'tf', q: 'Mravenci a včely žijí ve společenstvech.', a: true },
        { t: 'choice', q: 'Kde na těle hmyzu jsou křídla?', o: ['na hrudi', 'na hlavě', 'na zadečku'], a: 0 },
        { t: 'open', q: 'Vysvětli rozdíl mezi dokonalou a nedokonalou proměnou.', a: 'Dokonalá proměna má stadium kukly (vajíčko, larva, kukla, dospělec). Nedokonalá kuklu nemá, larva se postupně mění v dospělce.' },
        { t: 'open', q: 'Proč je hmyz pro přírodu a člověka důležitý?', a: 'Opyluje rostliny, je potravou ptáků a dalších živočichů, rozkládá zbytky. Včely dávají med a vosk.' },
      ],
    },
    {
      id: 'ekosystemy',
      title: 'Ekosystémy a potravní řetězce',
      emoji: '🌳',
      ex: [
        {
          title: 'Kdo koho jí',
          blocks: [
            { t: 'p', text: 'Energie putuje od rostlin ke zvířatům. Tak vzniká **potravní řetězec**.' },
            { t: 'w', w: 'cycle', p: { steps: ['rostlina (producent)', 'býložravec (konzument)', 'masožravec (konzument)', 'rozkladač (bakterie, houby)'] } },
            { t: 'example', q: 'Sestav řetězec z: liška, tráva, zajíc.', a: 'tráva → zajíc → liška' },
            { t: 'key', text: 'Producenti vyrábějí, konzumenti jedí, rozkladači vracejí živiny do půdy.' },
          ],
        },
        {
          title: 'Role v lese',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Producent', 'Konzument', 'Rozkladač'], items: [
              { text: 'buk', b: 0 }, { text: 'srnec', b: 1 }, { text: 'plíseň', b: 2 }, { text: 'borůvka', b: 0 },
              { text: 'sova', b: 1 }, { text: 'půdní bakterie', b: 2 }, { text: 'mech', b: 0 }, { text: 'liška', b: 1 },
            ] } },
            { t: 'p', text: '**Ekosystém** = živé organismy + neživé prostředí (voda, půda, světlo) na jednom místě. Např. les, rybník, louka.' },
            { t: 'key', text: 'Ekosystém = společenstvo + prostředí.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo je v ekosystému producent?', o: ['zelená rostlina', 'liška', 'houba'], a: 0 },
        { t: 'order', q: 'Seřaď potravní řetězec.', items: ['tráva', 'kobylka', 'žába', 'čáp'] },
        { t: 'choice', q: 'Houby a bakterie, které rozkládají zbytky, jsou…', o: ['rozkladači', 'producenti', 'predátoři'], a: 0 },
        { t: 'tf', q: 'Ekosystém tvoří jen živé organismy.', a: false, why: 'Patří k němu i neživé prostředí – voda, půda, světlo.' },
        { t: 'input', q: 'Živočich, který jí jen rostliny, je…', a: ['býložravec', 'bylozravec'] },
        { t: 'pair', q: 'Spoj ekosystém s typickým organismem.', pairs: [['rybník', 'kapr'], ['les', 'jelen'], ['louka', 'kobylka'], ['pole', 'křeček']] },
        { t: 'tf', q: 'Bez rozkladačů by se živiny nevracely do půdy.', a: true },
        { t: 'choice', q: 'Kdo stojí na konci řetězce tráva → myš → užovka → …?', o: ['káně', 'zajíc', 'kobylka'], a: 0 },
        { t: 'tf', q: 'Všežravec jí rostliny i živočichy.', a: true, why: 'Například prase divoké, medvěd, člověk.' },
        { t: 'choice', q: 'Odkud pochází energie v potravním řetězci?', o: ['ze Slunce', 'z půdy', 'z vody'], a: 0 },
        { t: 'open', q: 'Co je ekosystém? Uveď příklad.', a: 'Soubor organismů a neživého prostředí na jednom místě, které se navzájem ovlivňují. Např. les, rybník, louka.' },
        { t: 'open', q: 'Co by se stalo, kdyby z lesa zmizeli všichni dravci?', a: 'Přemnožili by se býložravci (myši, srnci), spásali by rostliny a narušila by se rovnováha ekosystému.' },
      ],
    },
  ],
} satisfies Subject
