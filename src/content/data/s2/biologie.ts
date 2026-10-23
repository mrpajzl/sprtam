import type { Subject } from '../../types'

export default {
  grade: 's2',
  subject: 'biologie',
  topics: [
    {
      id: 'zivocichove-uvod',
      title: 'Stavba těla živočichů',
      emoji: '🐾',
      ex: [
        {
          title: 'Stavební plány',
          blocks: [
            { t: 'table', head: ['Znak', 'Možnosti', 'Příklad'], rows: [
              ['souměrnost', 'radiální / bilaterální', 'medúza / člověk'],
              ['zárodečné listy', 'dva (diblastika) / tři (triblastika)', 'žahavci / ostatní'],
              ['tělní dutina', 'chybí / nepravá / pravá (coelom)', 'ploštěnci / hlístice / kroužkovci'],
              ['vznik úst', 'prvoústí / druhoústí', 'členovci / strunatci'],
            ] },
            { t: 'key', text: 'Ektoderm → kůže, nervy. Mezoderm → svaly, kosti, krev. Entoderm → trávicí trubice.' },
          ],
        },
        {
          title: 'Rodokmen',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Prvoústí', 'Druhoústí', 'Bez rozlišení (diblastika a houbovci)'], items: [
              { text: 'měkkýši', b: 0 }, { text: 'ostnokožci', b: 1 }, { text: 'žahavci', b: 2 }, { text: 'členovci', b: 0 },
              { text: 'strunatci', b: 1 }, { text: 'houbovci', b: 2 }, { text: 'kroužkovci', b: 0 },
            ] } },
            { t: 'p', text: 'U **prvoústých** se z prvoúst (blastoporu) stanou ústa, u **druhoústých** řitní otvor a ústa vzniknou nově.' },
            { t: 'key', text: 'Ostnokožci jsou druhoústí – příbuznější strunatcům než hmyzu.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Ze kterého zárodečného listu vzniká nervová soustava?', o: ['ektoderm', 'entoderm', 'mezoderm'], a: 0 },
        { t: 'choice', q: 'Diblastičtí živočichové jsou…', o: ['žahavci', 'ploštěnci', 'měkkýši'], a: 0 },
        { t: 'tf', q: 'Ostnokožci patří mezi druhoústé.', a: true },
        { t: 'input', q: 'Pravá tělní dutina se nazývá…', a: ['coelom', 'célom', 'celom'] },
        { t: 'pair', q: 'Spoj skupinu s typem tělní dutiny.', pairs: [['ploštěnci', 'bez dutiny'], ['hlístice', 'nepravá (pseudocoel)'], ['kroužkovci', 'pravá (coelom)']] },
        { t: 'choice', q: 'Dospělé žahavce charakterizuje souměrnost…', o: ['radiální', 'bilaterální', 'žádná'], a: 0 },
        { t: 'tf', q: 'Houbovci mají pravé tkáně a orgány.', a: false, why: 'Houbovci nemají pravé tkáně.' },
        { t: 'choice', q: 'Svaly vznikají hlavně z…', o: ['mezodermu', 'ektodermu', 'entodermu'], a: 0 },
        { t: 'choice', q: 'Kdo patří mezi prvoústé?', o: ['hmyz', 'člověk', 'hvězdice'], a: 0 },
        { t: 'tf', q: 'Bilaterální souměrnost souvisí s aktivním pohybem jedním směrem.', a: true },
        { t: 'open', q: 'Vysvětli rozdíl mezi prvoústými a druhoústými.', a: 'U prvoústých se blastopor (prvoústa) mění v ústa, u druhoústých v řitní otvor a ústa vznikají druhotně. Prvoústí jsou např. měkkýši, členovci; druhoústí ostnokožci a strunatci.' },
        { t: 'open', q: 'Co vzniká z jednotlivých zárodečných listů?', a: 'Z ektodermu pokožka a nervová soustava, z entodermu výstelka trávicí trubice a žlázy, z mezodermu svaly, kostra, cévní soustava a vylučovací orgány.' },
      ],
    },
    {
      id: 'houbovci-zahavci',
      title: 'Houbovci a žahavci',
      emoji: '🪸',
      ex: [
        {
          title: 'Polyp a medúza',
          blocks: [
            { t: 'p', text: 'Žahavci mají dvě podoby: přisedlý **polyp** (váček ústy nahoru) a volně plovoucí **medúza** (zvon ústy dolů).' },
            { t: 'w', w: 'cycle', p: { steps: ['medúza (pohlavně)', 'oplozené vajíčko', 'larva planula', 'polyp', 'pučení / strobilace (nepohlavně)'] } },
            { t: 'key', text: 'Střídání polypa a medúzy = metageneze.' },
          ],
        },
        {
          title: 'Přehled',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'houbovci', back: 'filtrují vodu límečkovými buňkami (choanocyty), bez tkání' },
              { front: 'žahavé buňky (knidocyty)', back: 'vymrštitelné vlákno s jedem – lov a obrana' },
              { front: 'polypovci', back: 'nezmar – sladká voda' },
              { front: 'medúzovci', back: 'talířovka ušatá – převládá medúza' },
              { front: 'korálnatci', back: 'sasanky, korály – jen polyp' },
            ] } },
            { t: 'key', text: 'Žahavci: dvě vrstvy buněk, mezi nimi rosolovitá mezoglea, jeden otvor do trávicí dutiny.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Čím filtrují houbovci vodu?', o: ['límečkovými buňkami', 'žahavými buňkami', 'žábrami'], a: 0 },
        { t: 'choice', q: 'Nezmar patří mezi…', o: ['polypovce', 'medúzovce', 'korálnatce'], a: 0 },
        { t: 'tf', q: 'Korálnatci mají jen stadium polypa.', a: true },
        { t: 'input', q: 'Rosolovitá vrstva mezi buněčnými vrstvami žahavců je…', a: ['mezoglea'] },
        { t: 'pair', q: 'Spoj živočicha se skupinou.', pairs: [['houba mycí', 'houbovci'], ['talířovka ušatá', 'medúzovci'], ['sasanka', 'korálnatci'], ['nezmar', 'polypovci']] },
        { t: 'choice', q: 'Trávicí dutina žahavců má…', o: ['jeden otvor', 'dva otvory', 'žádný otvor'], a: 0 },
        { t: 'tf', q: 'Korálové útesy jsou tvořeny vápenitými schránkami korálů.', a: true },
        { t: 'choice', q: 'Larva žahavců je…', o: ['planula', 'trochofora', 'nauplius'], a: 0 },
        { t: 'tf', q: 'Nervová soustava žahavců je rozptýlená (difúzní).', a: true },
        { t: 'choice', q: 'Co ohrožuje korálové útesy?', o: ['oteplování a okyselování oceánů', 'nízká teplota vody', 'nedostatek světla v tropech'], a: 0, why: 'Při přehřátí korály vypuzují symbiotické řasy a blednou.' },
        { t: 'open', q: 'Popiš stavbu těla nezmara.', a: 'Váčkovité tělo ze dvou vrstev buněk (ektoderm a entoderm) s mezogleou. Jediný otvor obklopený chapadly se žahavými buňkami. Nervová soustava rozptýlená.' },
        { t: 'open', q: 'Co je metageneze u žahavců?', a: 'Střídání pohlavně se rozmnožující medúzy a nepohlavně se rozmnožujícího polypa v životním cyklu.' },
      ],
    },
    {
      id: 'plostenci-hlistice',
      title: 'Ploštěnci a hlístice',
      emoji: '🪱',
      ex: [
        {
          title: 'Cyklus tasemnice',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['dospělá tasemnice ve střevě člověka', 'články s vajíčky odcházejí trusem', 'prase pozře vajíčka', 'boubel ve svalovině prasete', 'člověk sní nedovařené maso'] } },
            { t: 'p', text: 'Člověk = **definitivní hostitel**, prase = **mezihostitel** (tasemnice dlouhočlenná). U tasemnice bezbranné je mezihostitelem skot.' },
            { t: 'key', text: 'Prevence: maso dobře tepelně upravit, hygiena.' },
          ],
        },
        {
          title: 'Srovnání',
          blocks: [
            { t: 'table', head: ['', 'Ploštěnci', 'Hlístice'], rows: [
              ['tvar', 'plochý', 'válcovitý'],
              ['tělní dutina', 'chybí (parenchym)', 'nepravá (pseudocoel)'],
              ['trávicí trubice', 'slepá nebo chybí', 'průchozí (ústa i řiť)'],
              ['příklad', 'ploštěnka, motolice, tasemnice', 'škrkavka, roup, svalovec'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Ploštěnci', 'Hlístice'], items: [
              { text: 'motolice jaterní', b: 0 }, { text: 'škrkavka dětská', b: 1 }, { text: 'ploštěnka mléčná', b: 0 },
              { text: 'roup dětský', b: 1 }, { text: 'tasemnice bezbranná', b: 0 }, { text: 'svalovec stočený', b: 1 },
            ] } },
            { t: 'key', text: 'Hlístice mají jako první průchozí trávicí trubici.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Mezihostitel tasemnice dlouhočlenné je…', o: ['prase', 'skot', 'pes'], a: 0 },
        { t: 'choice', q: 'Mezihostitelem motolice jaterní je…', o: ['plž (bahnatka malá)', 'komár', 'kapr'], a: 0 },
        { t: 'tf', q: 'Hlístice mají průchozí trávicí trubici.', a: true },
        { t: 'input', q: 'Larvální stadium tasemnice ve svalovině mezihostitele je…', a: ['boubel', 'cysticerkus'] },
        { t: 'pair', q: 'Spoj parazita s nákazou.', pairs: [['roup', 'špinavé ruce'], ['svalovec', 'nedovařené maso divočáka'], ['tasemnice bezbranná', 'syrové hovězí'], ['motolice jaterní', 'pastva u vody']] },
        { t: 'tf', q: 'Ploštěnky jsou parazité.', a: false, why: 'Ploštěnky jsou volně žijící ploštěnci.' },
        { t: 'choice', q: 'Tělo hlístic kryje…', o: ['kutikula', 'krunýř z chitinu', 'šupiny'], a: 0 },
        { t: 'choice', q: 'Trichinelózu způsobuje…', o: ['svalovec stočený', 'roup dětský', 'motolice'], a: 0 },
        { t: 'tf', q: 'Tasemnice nemají trávicí soustavu a živiny přijímají povrchem těla.', a: true },
        { t: 'choice', q: 'Ploštěnci mají souměrnost…', o: ['bilaterální', 'radiální', 'pětipaprsčitou'], a: 0 },
        { t: 'open', q: 'Popiš vývojový cyklus tasemnice dlouhočlenné.', a: 'Dospělec žije ve střevě člověka. Články s vajíčky odcházejí trusem. Prase vajíčka pozře, ve svalovině se vyvinou boubele. Člověk se nakazí nedostatečně upraveným vepřovým masem.' },
        { t: 'open', q: 'Jak jsou paraziti přizpůsobeni svému způsobu života?', a: 'Mají přichycovací orgány (háčky, přísavky), odolný povrch, redukované smysly a trávení, obrovskou plodnost a často složité cykly s mezihostiteli.' },
      ],
    },
    {
      id: 'mekkysi-krouzkovci',
      title: 'Měkkýši a kroužkovci',
      emoji: '🐙',
      ex: [
        {
          title: 'Tři třídy měkkýšů',
          blocks: [
            { t: 'table', head: ['Třída', 'Schránka', 'Radula', 'Příklad'], rows: [
              ['plži', 'ulita (i redukovaná)', 'ano', 'hlemýžď, plovatka, slimák'],
              ['mlži', 'dvě lastury', 'ne', 'škeble, slávka, perlorodka'],
              ['hlavonožci', 'vnitřní nebo chybí', 'ano', 'chobotnice, sépie, krakatice'],
            ] },
            { t: 'key', text: 'Měkkýši: noha, útrobní vak, plášť. Cévní soustava otevřená (hlavonožci uzavřená).' },
          ],
        },
        {
          title: 'Kroužkovci',
          blocks: [
            { t: 'p', text: 'Tělo jako **vlak z vagonů**: každý článek má vlastní pár vylučovacích orgánů a nervových uzlin (metamerie).' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'coelom', back: 'pravá tělní dutina, hydroskelet' },
              { front: 'cévní soustava', back: 'uzavřená' },
              { front: 'nervová soustava', back: 'žebříčková' },
              { front: 'vylučování', back: 'metanefridie' },
              { front: 'žížala', back: 'hermafrodit, opasek, prokypřuje půdu' },
              { front: 'pijavka lékařská', back: 'hirudin – zabraňuje srážení krve' },
            ] } },
            { t: 'key', text: 'Kroužkovci: první s pravou tělní dutinou a uzavřenou cévní soustavou.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která třída měkkýšů nemá radulu?', o: ['mlži', 'plži', 'hlavonožci'], a: 0 },
        { t: 'choice', q: 'Uzavřenou cévní soustavu mají z měkkýšů…', o: ['hlavonožci', 'mlži', 'plži'], a: 0 },
        { t: 'tf', q: 'Žížala je hermafrodit.', a: true, why: 'Přesto se páří s jiným jedincem (vzájemné oplození).' },
        { t: 'input', q: 'Látka pijavky bránící srážení krve je…', a: ['hirudin'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['radula', 'struhadlo v ústech'], ['metanefridie', 'vylučování'], ['metamerie', 'článkování'], ['plášť', 'vylučuje schránku']] },
        { t: 'tf', q: 'Hlavonožci mají nejvyvinutější nervovou soustavu z bezobratlých.', a: true },
        { t: 'choice', q: 'Nervová soustava kroužkovců je…', o: ['žebříčková', 'rozptýlená', 'trubicovitá'], a: 0 },
        { t: 'choice', q: 'Perly tvoří…', o: ['mlži', 'plži', 'kroužkovci'], a: 0 },
        { t: 'tf', q: 'Mlži mají zřetelně oddělenou hlavu.', a: false, why: 'Mlži mají hlavu redukovanou.' },
        { t: 'choice', q: 'Plovatka bahenní dýchá…', o: ['plicním vakem', 'žábrami', 'kůží jako jediným orgánem'], a: 0 },
        { t: 'open', q: 'Porovnej tři třídy měkkýšů.', a: 'Plži mají ulitu a radulu, často torzi útrobního vaku. Mlži mají dvě lastury, filtrují, nemají radulu ani hlavu. Hlavonožci mají chapadla, uzavřenou cévní soustavu, vyvinutý mozek a oči.' },
        { t: 'open', q: 'Jaký pokrok představují kroužkovci oproti hlísticím?', a: 'Pravá tělní dutina (coelom), článkování těla, uzavřená cévní soustava, žebříčková nervová soustava a metanefridie.' },
      ],
    },
    {
      id: 'clenovci',
      title: 'Členovci: klepítkatci, korýši, stonožkovci',
      emoji: '🦀',
      ex: [
        {
          title: 'Brnění',
          blocks: [
            { t: 'p', text: 'Členovci nosí **brnění z chitinu** (exoskelet). Brnění neroste, proto ho musí **svlékat** (ekdyze).' },
            { t: 'table', head: ['Skupina', 'Tělo', 'Tykadla', 'Dýchání'], rows: [
              ['pavoukovci', 'hlavohruď + zadeček', '0', 'plicní vaky, vzdušnice'],
              ['korýši', 'hlavohruď + zadeček', '2 páry', 'žábry'],
              ['stonožkovci', 'hlava + trup', '1 pár', 'vzdušnice'],
              ['hmyz', 'hlava + hruď + zadeček', '1 pár', 'vzdušnice'],
            ] },
            { t: 'key', text: 'Cévní soustava členovců je otevřená.' },
          ],
        },
        {
          title: 'Kdo je kdo',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Klepítkatci', 'Korýši', 'Stonožkovci'], items: [
              { text: 'štír', b: 0 }, { text: 'vodní blecha (perloočka)', b: 1 }, { text: 'mnohonožka', b: 2 }, { text: 'roztoč', b: 0 },
              { text: 'stínka', b: 1 }, { text: 'stonožka', b: 2 }, { text: 'sekáč', b: 0 }, { text: 'buchanka', b: 1 },
            ] } },
            { t: 'p', text: '**Stonožky**: 1 pár nohou na článek, dravé. **Mnohonožky**: 2 páry na článek, býložravé.' },
            { t: 'key', text: 'Klepítkatci mají klepítka (chelicery) místo kusadel a nemají tykadla.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik párů tykadel mají korýši?', o: ['2', '1', '0'], a: 0 },
        { t: 'choice', q: 'Klíště patří mezi…', o: ['roztoče (pavoukovce)', 'hmyz', 'korýše'], a: 0 },
        { t: 'tf', q: 'Cévní soustava členovců je uzavřená.', a: false, why: 'Je otevřená, krvomíza volně omývá orgány.' },
        { t: 'input', q: 'Svlékání pokožky u členovců se odborně nazývá…', a: ['ekdyze', 'ekdýze', 'ekdyse'] },
        { t: 'pair', q: 'Spoj členovce s dýchacím orgánem.', pairs: [['rak', 'žábry'], ['křižák', 'plicní vaky a vzdušnice'], ['stonožka', 'vzdušnice']] },
        { t: 'choice', q: 'Mnohonožky mají na většině článků…', o: ['2 páry nohou', '1 pár nohou', 'žádné nohy'], a: 0 },
        { t: 'tf', q: 'Pavouci mají vnější trávení.', a: true, why: 'Vstříknou trávicí šťávy do kořisti a natrávenou ji vysají.' },
        { t: 'choice', q: 'Pavučinu tvoří…', o: ['snovací bradavky', 'chelicery', 'makadla'], a: 0 },
        { t: 'tf', q: 'Stínky jsou suchozemští korýši.', a: true },
        { t: 'choice', q: 'Vylučovací orgány pavoukovců a hmyzu jsou…', o: ['Malpighiho trubice', 'ledviny', 'metanefridie'], a: 0 },
        { t: 'open', q: 'Jaké jsou výhody a nevýhody vnější kostry členovců?', a: 'Výhody: ochrana, opora, úpon svalů, omezení ztráty vody. Nevýhody: neroste, nutné svlékání, při kterém je živočich zranitelný; omezuje velikost těla.' },
        { t: 'open', q: 'Jak rozlišíš pavoukovce, korýše a stonožkovce?', a: 'Pavoukovci: hlavohruď a zadeček, 4 páry nohou, bez tykadel. Korýši: 2 páry tykadel, dýchají žábrami. Stonožkovci: hlava a článkovaný trup s mnoha páry nohou, 1 pár tykadel.' },
      ],
    },
    {
      id: 'hmyz',
      title: 'Hmyz',
      emoji: '🦋',
      ex: [
        {
          title: 'Dvě proměny',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['vajíčko', 'larva', 'kukla', 'dospělec (imago)'] } },
            { t: 'w', w: 'sort', p: { buckets: ['Proměna dokonalá', 'Proměna nedokonalá'], items: [
              { text: 'brouci', b: 0 }, { text: 'vážky', b: 1 }, { text: 'motýli', b: 0 }, { text: 'rovnokřídlí', b: 1 },
              { text: 'blanokřídlí', b: 0 }, { text: 'ploštice', b: 1 }, { text: 'dvoukřídlí', b: 0 }, { text: 'švábi', b: 1 },
            ] } },
            { t: 'key', text: 'Dokonalá proměna = s kuklou (holometabolie).' },
          ],
        },
        {
          title: 'Ústa podle jídla',
          blocks: [
            { t: 'table', head: ['Ústní ústrojí', 'Řád', 'Příklad'], rows: [
              ['kousací', 'brouci, rovnokřídlí', 'chroust, kobylka'],
              ['lízací', 'blanokřídlí (část)', 'včela'],
              ['sací', 'motýli', 'babočka'],
              ['bodavě sací', 'ploštice, dvoukřídlí (část)', 'kněžice, komár'],
            ] },
            { t: 'p', text: 'Tělo: hlava (1 pár tykadel, složené oči), hruď (3 páry nohou, 2 páry křídel), zadeček.' },
            { t: 'key', text: 'Dvoukřídlí mají druhý pár křídel přeměněný v kyvadélka.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který řád má proměnu nedokonalou?', o: ['vážky', 'brouci', 'motýli'], a: 0 },
        { t: 'choice', q: 'Kyvadélka (haltery) mají…', o: ['dvoukřídlí', 'blanokřídlí', 'brouci'], a: 0 },
        { t: 'tf', q: 'Krovky brouků jsou přeměněný první pár křídel.', a: true },
        { t: 'input', q: 'Dospělý jedinec hmyzu se odborně nazývá…', a: ['imago'] },
        { t: 'pair', q: 'Spoj hmyz s řádem.', pairs: [['chroust', 'brouci'], ['čmelák', 'blanokřídlí'], ['moucha', 'dvoukřídlí'], ['saranče', 'rovnokřídlí']] },
        { t: 'choice', q: 'Komár má ústní ústrojí…', o: ['bodavě sací', 'kousací', 'lízací'], a: 0 },
        { t: 'tf', q: 'Hmyz dýchá vzdušnicemi, které rozvádějí vzduch přímo k tkáním.', a: true },
        { t: 'choice', q: 'Jak se nazývá larva brouka chrousta?', o: ['ponrava', 'housenka', 'nymfa'], a: 0 },
        { t: 'tf', q: 'Motýli mají ústní ústrojí kousací.', a: false, why: 'Dospělí motýli mají sací sosák. Kousací mají housenky.' },
        { t: 'choice', q: 'Kolik párů křídel má typický hmyz?', o: ['2', '1', '3'], a: 0 },
        { t: 'open', q: 'Porovnej dokonalou a nedokonalou proměnu a uveď příklady.', a: 'Dokonalá: vajíčko, larva, kukla, imago – brouci, motýli, blanokřídlí, dvoukřídlí. Nedokonalá: bez kukly, larva podobná dospělci – vážky, rovnokřídlí, ploštice, švábi.' },
        { t: 'open', q: 'Proč je hmyz nejpočetnější skupinou živočichů?', a: 'Malé tělo, schopnost letu, odolný exoskelet, různé typy ústního ústrojí, proměna (larva a dospělec nekonkurují), rychlé rozmnožování.' },
      ],
    },
    {
      id: 'ostnokozci-ryby',
      title: 'Ostnokožci, strunatci a ryby',
      emoji: '🐠',
      ex: [
        {
          title: 'Znaky strunatců',
          blocks: [
            { t: 'list', items: ['struna hřbetní (chorda) – aspoň v zárodku', 'nervová trubice na hřbetní straně', 'žaberní štěrbiny v hltanu', 'svalnatý ocas za řitním otvorem'] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'ostnokožci', back: 'druhoústí bezobratlí, pětipaprsčitá souměrnost, ambulakrální soustava' },
              { front: 'pláštěnci', back: 'sumky – struna jen u larvy' },
              { front: 'bezlebeční', back: 'kopinatec – struna celý život' },
              { front: 'kruhoústí', back: 'mihule – bez čelistí' },
              { front: 'paryby', back: 'žraloci, rejnoci – chrupavčitá kostra' },
              { front: 'ryby', back: 'kostnatá kostra, skřele, plynový měchýř' },
            ] } },
            { t: 'key', text: 'Strunatec = chorda + hřbetní nervová trubice + žaberní štěrbiny.' },
          ],
        },
        {
          title: 'Ryby v číslech',
          blocks: [
            { t: 'table', head: ['Soustava', 'Ryby'], rows: [
              ['srdce', '1 síň + 1 komora (žilní krev)'],
              ['krevní oběh', 'jeden okruh'],
              ['dýchání', 'žábry (protiproud)'],
              ['smysly', 'postranní čára'],
              ['oplození', 'většinou vnější'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Paryby', 'Kostnaté ryby'], items: [
              { text: 'žralok', b: 0 }, { text: 'kapr', b: 1 }, { text: 'rejnok', b: 0 }, { text: 'losos', b: 1 },
              { text: 'chiméra', b: 0 }, { text: 'jeseter', b: 1 }, { text: 'štika', b: 1 },
            ] } },
            { t: 'key', text: 'Srdcem ryb proudí jen odkysličená krev.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kopinatec patří mezi…', o: ['bezlebečné', 'ryby', 'ostnokožce'], a: 0 },
        { t: 'choice', q: 'Ambulakrální soustavu mají…', o: ['ostnokožci', 'žahavci', 'paryby'], a: 0 },
        { t: 'tf', q: 'Srdce ryb má dvě komory.', a: false, why: 'Rybí srdce má jednu síň a jednu komoru.' },
        { t: 'input', q: 'Struna hřbetní se odborně nazývá…', a: ['chorda', 'chorda dorsalis'] },
        { t: 'pair', q: 'Spoj živočicha se skupinou.', pairs: [['hvězdice', 'ostnokožci'], ['mihule', 'kruhoústí'], ['rejnok', 'paryby'], ['sumka', 'pláštěnci']] },
        { t: 'tf', q: 'Paryby nemají plynový měchýř.', a: true, why: 'Vztlak jim dává velká játra s tukem.' },
        { t: 'choice', q: 'Kruhoústí se liší od ryb tím, že…', o: ['nemají čelisti', 'nemají žábry', 'mají peří'], a: 0 },
        { t: 'choice', q: 'Kostěné víčko kryjící žábry ryb je…', o: ['skřele', 'ploutev', 'šupina'], a: 0 },
        { t: 'tf', q: 'Ostnokožci jsou druhoústí.', a: true },
        { t: 'choice', q: 'Kde jsou žaberní štěrbiny u člověka?', o: ['jen v embryonálním vývoji', 'po celý život', 'nikdy'], a: 0 },
        { t: 'open', q: 'Uveď znaky strunatců.', a: 'Struna hřbetní (chorda), nervová trubice na hřbetní straně, žaberní štěrbiny v hltanu a ocas za řitním otvorem – aspoň v některém stadiu vývoje.' },
        { t: 'open', q: 'Jak se liší paryby od kostnatých ryb?', a: 'Paryby mají chrupavčitou kostru, nemají skřele ani plynový měchýř, mají vnitřní oplození. Kostnaté ryby mají kostěnou kostru, skřele, plynový měchýř a většinou vnější oplození.' },
      ],
    },
    {
      id: 'obojzivelnici-plazi',
      title: 'Obojživelníci a plazi',
      emoji: '🐊',
      ex: [
        {
          title: 'Krok na souš',
          blocks: [
            { t: 'table', head: ['', 'Obojživelníci', 'Plazi'], rows: [
              ['kůže', 'holá, žlázy, dýchá', 'suchá, šupiny'],
              ['srdce', '2 síně + 1 komora', '2 síně + neúplně přepažená komora'],
              ['vejce', 'bez obalů, ve vodě', 'amniotické, na souši'],
              ['vývoj', 'proměna (pulec)', 'přímý'],
            ] },
            { t: 'key', text: 'Plazi jsou první amniota – vejce s obaly nezávislé na vodě.' },
          ],
        },
        {
          title: 'Řády',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Obojživelníci', 'Plazi'], items: [
              { text: 'červoři', b: 0 }, { text: 'želvy', b: 1 }, { text: 'ocasatí', b: 0 }, { text: 'krokodýli', b: 1 },
              { text: 'žáby', b: 0 }, { text: 'šupinatí', b: 1 }, { text: 'haterie', b: 1 },
            ] } },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'amnion', back: 'vodní obal chránící zárodek' },
              { front: 'krokodýli', back: 'srdce se 4 oddíly (úplně přepažená komora)' },
              { front: 'haterie', back: '„živoucí fosilie“ z Nového Zélandu' },
              { front: 'Jacobsonův orgán', back: 'čich hadů a ještěrů pomocí jazyka' },
            ] } },
            { t: 'key', text: 'Krokodýli jsou bližší příbuzní ptáků než ještěrů.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik oddílů má srdce obojživelníků?', o: ['3', '2', '4'], a: 0 },
        { t: 'choice', q: 'Úplně přepaženou komoru mají z plazů…', o: ['krokodýli', 'želvy', 'hadi'], a: 0 },
        { t: 'tf', q: 'Plazi mají amniotické vejce.', a: true },
        { t: 'input', q: 'Řád beznohých obojživelníků tropů se nazývá…', a: ['červoři', 'cervori'] },
        { t: 'pair', q: 'Spoj živočicha s řádem.', pairs: [['čolek', 'ocasatí'], ['kuňka', 'žáby'], ['užovka', 'šupinatí'], ['kareta', 'želvy']] },
        { t: 'tf', q: 'Obojživelníci dýchají i kůží.', a: true },
        { t: 'choice', q: 'Plazi vylučují dusík hlavně jako…', o: ['kyselinu močovou', 'amoniak', 'močovinu výhradně'], a: 0, why: 'Šetří tím vodu.' },
        { t: 'choice', q: 'Haterie žije na…', o: ['Novém Zélandu', 'Madagaskaru', 'Galapágách'], a: 0 },
        { t: 'tf', q: 'Slepýš je had.', a: false, why: 'Slepýš je beznohý ještěr.' },
        { t: 'choice', q: 'Nejbližší žijící příbuzní ptáků jsou…', o: ['krokodýli', 'želvy', 'ještěři'], a: 0 },
        { t: 'open', q: 'Jak jsou plazi přizpůsobeni životu na souši?', a: 'Suchá kůže se šupinami proti ztrátám vody, dýchání plícemi, amniotické vejce s obaly, vnitřní oplození, vylučování kyseliny močové.' },
        { t: 'open', q: 'Proč jsou obojživelníci vázáni na vodu?', a: 'Mají holou propustnou kůži, která vysychá, vajíčka bez obalů kladou do vody a larvy (pulci) dýchají žábrami.' },
      ],
    },
    {
      id: 'ptaci',
      title: 'Ptáci',
      emoji: '🦅',
      ex: [
        {
          title: 'Dvojité dýchání',
          blocks: [
            { t: 'p', text: 'Ptačí plíce fungují jako **průtokový ohřívač** – vzduch jimi proudí jedním směrem při nádechu i výdechu díky **vzdušným vakům**.' },
            { t: 'w', w: 'cycle', p: { steps: ['nádech: vzduch do zadních vaků', 'výdech: ze zadních vaků do plic', 'nádech: z plic do předních vaků', 'výdech: z předních vaků ven'] } },
            { t: 'key', text: 'Okysličení krve probíhá při nádechu i výdechu.' },
          ],
        },
        {
          title: 'Přehled znaků',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'srdce', back: '4 oddíly, pravý oblouk aorty' },
              { front: 'kostra', back: 'pneumatizované kosti, hřeben hrudní kosti, srostlé obratle' },
              { front: 'trávení', back: 'vole, žláznatý a svalnatý žaludek, kloaka' },
              { front: 'smysly', back: 'vynikající zrak, slabý čich' },
              { front: 'Archaeopteryx', back: 'pták z jury s ozubenými čelistmi a dlouhým ocasem' },
            ] } },
            { t: 'w', w: 'sort', p: { buckets: ['Krmiví', 'Nekrmiví'], items: [
              { text: 'pěvci', b: 0 }, { text: 'hrabaví', b: 1 }, { text: 'dravci', b: 0 }, { text: 'vrubozobí', b: 1 },
              { text: 'šplhavci', b: 0 }, { text: 'běžci', b: 1 },
            ] } },
            { t: 'key', text: 'Ptáci jsou potomci teropodních dinosaurů.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který oblouk aorty mají ptáci?', o: ['pravý', 'levý', 'oba'], a: 0 },
        { t: 'tf', q: 'U ptáků dochází k výměně plynů při nádechu i výdechu.', a: true },
        { t: 'input', q: 'Společný vývod trávicí, vylučovací a pohlavní soustavy ptáků je…', a: ['kloaka'] },
        { t: 'pair', q: 'Spoj ptáka s řádem.', pairs: [['kachna divoká', 'vrubozobí'], ['strakapoud', 'šplhavci'], ['koroptev', 'hrabaví'], ['pštros', 'běžci']] },
        { t: 'choice', q: 'Nejrozsáhlejší řád ptáků je…', o: ['pěvci', 'dravci', 'sovy'], a: 0 },
        { t: 'tf', q: 'Ptáci mají vyvinutý čich lépe než zrak.', a: false, why: 'Většina ptáků má výborný zrak a slabý čich.' },
        { t: 'choice', q: 'Archaeopteryx žil v…', o: ['juře (druhohory)', 'kambriu', 'čtvrtohorách'], a: 0 },
        { t: 'choice', q: 'Kde se mechanicky drtí potrava ptáků?', o: ['ve svalnatém žaludku', 've voleti', 'v zobáku zuby'], a: 0 },
        { t: 'tf', q: 'Sovy vyvrhují nestravitelné zbytky jako vývržky.', a: true },
        { t: 'choice', q: 'Ptáci vylučují dusík hlavně jako…', o: ['kyselinu močovou', 'amoniak', 'močovinu'], a: 0 },
        { t: 'open', q: 'Popiš přizpůsobení ptáků k letu.', a: 'Peří, pneumatizované kosti, srůsty kostí, hřeben hrudní kosti pro letové svaly, vzdušné vaky a dvojité dýchání, lehký zobák bez zubů, chybí močový měchýř.' },
        { t: 'open', q: 'Proč se ptáci považují za potomky dinosaurů?', a: 'Fosilie jako Archaeopteryx a opeření dinosauři ukazují přechodné znaky; ptáci sdílejí s teropody stavbu kostry, vzdušné vaky a duté kosti.' },
      ],
    },
    {
      id: 'savci',
      title: 'Savci',
      emoji: '🐘',
      ex: [
        {
          title: 'Tři cesty k mláděti',
          blocks: [
            { t: 'table', head: ['Skupina', 'Rozmnožování', 'Příklad'], rows: [
              ['ptakořitní', 'kladou vejce, kloaka', 'ptakopysk, ježura'],
              ['vačnatci', 'nedonošené mládě dorůstá ve vaku', 'klokan, koala, vačice'],
              ['placentálové', 'plod vyživován placentou', 'pes, člověk, velryba'],
            ] },
            { t: 'key', text: 'Všichni savci kojí mláďata mlékem.' },
          ],
        },
        {
          title: 'Řády',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Šelmy', 'Sudokopytníci', 'Hlodavci'], items: [
              { text: 'vydra', b: 0 }, { text: 'los', b: 1 }, { text: 'sysel', b: 2 }, { text: 'tuleň', b: 0 },
              { text: 'hroch', b: 1 }, { text: 'bobr', b: 2 }, { text: 'jezevec', b: 0 }, { text: 'velbloud', b: 1 }, { text: 'veverka', b: 2 },
            ] } },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'srdce', back: '4 oddíly, levý oblouk aorty' },
              { front: 'červené krvinky', back: 'bezjaderné' },
              { front: 'krční obratle', back: 'většinou 7 (i žirafa)' },
              { front: 'chrup', back: 'heterodontní – řezáky, špičáky, třenové zuby, stoličky' },
            ] } },
            { t: 'key', text: 'Savci: levý oblouk aorty, bránice, srst, mléčné žlázy.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který oblouk aorty mají savci?', o: ['levý', 'pravý', 'oba'], a: 0 },
        { t: 'choice', q: 'Ptakopysk patří mezi…', o: ['ptakořitné', 'vačnatce', 'placentály'], a: 0 },
        { t: 'tf', q: 'Žirafa má víc krčních obratlů než člověk.', a: false, why: 'Oba mají 7, žirafa je má jen delší.' },
        { t: 'input', q: 'Orgán zprostředkující výživu plodu placentálů je…', a: ['placenta'] },
        { t: 'pair', q: 'Spoj savce s řádem.', pairs: [['netopýr', 'letouni'], ['delfín', 'kytovci'], ['krtek', 'hmyzožravci'], ['šimpanz', 'primáti']] },
        { t: 'tf', q: 'Červené krvinky savců nemají jádro.', a: true },
        { t: 'choice', q: 'Hroch je z hlediska příbuznosti nejblíže…', o: ['kytovcům', 'koním', 'slonům'], a: 0 },
        { t: 'choice', q: 'Tuleni patří mezi…', o: ['šelmy', 'kytovce', 'sirény'], a: 0 },
        { t: 'tf', q: 'Kůň je sudokopytník.', a: false, why: 'Kůň je lichokopytník.' },
        { t: 'choice', q: 'Který typ zubů slouží šelmám ke stříhání masa?', o: ['trháky', 'řezáky', 'špičáky'], a: 0 },
        { t: 'open', q: 'Porovnej ptakořitné, vačnatce a placentály.', a: 'Ptakořitní kladou vejce a mají kloaku. Vačnatci rodí nedovyvinutá mláďata, která dorůstají ve vaku. Placentálové mají placentu, plod se vyvíjí v děloze déle.' },
        { t: 'open', q: 'Vyjmenuj znaky savců.', a: 'Srst, mléčné žlázy, stálá teplota, bránice, čtyřoddílné srdce s levým obloukem aorty, bezjaderné erytrocyty, heterodontní chrup, většinou živorodost.' },
      ],
    },
  ],
} satisfies Subject
