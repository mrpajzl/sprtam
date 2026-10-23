import type { Subject } from '../../types'

export default {
  grade: 'z8',
  subject: 'prirodopis',
  topics: [
    {
      id: 'savci-znaky',
      title: 'Savci – společné znaky',
      emoji: '🐻',
      ex: [
        {
          title: 'Kontrolní seznam',
          blocks: [
            { t: 'list', items: ['srst', 'mléčné žlázy – mláďata sají mléko', 'stálá teplota těla', 'dýchají plícemi, mají bránici', 'zuby rozlišené na řezáky, špičáky, třenové a stoličky', 'většinou živorodí'] },
            { t: 'key', text: 'Savec = srst + kojí mláďata mlékem.' },
            { t: 'example', q: 'Je delfín ryba?', a: 'Ne. Dýchá plícemi a kojí mláďata – je to savec (kytovec).' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Savci', 'Ptáci', 'Plazi'], items: [
              { text: 'netopýr', b: 0 }, { text: 'tučňák', b: 1 }, { text: 'krokodýl', b: 2 }, { text: 'velryba', b: 0 },
              { text: 'pštros', b: 1 }, { text: 'slepýš', b: 2 }, { text: 'ptakopysk', b: 0 }, { text: 'želva', b: 2 }, { text: 'kiwi', b: 1 },
            ] } },
            { t: 'p', text: '**Ptakopysk** a **ježura** kladou vejce, a přesto jsou savci – kojí mláďata.' },
            { t: 'key', text: 'Rozhoduje kojení a srst, ne to, kde zvíře žije nebo zda létá.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Netopýr je pták.', a: false, why: 'Netopýr má srst a kojí mláďata – je to savec (letoun).' },
        { t: 'choice', q: 'Který savec klade vejce?', o: ['ptakopysk', 'klokan', 'delfín'], a: 0 },
        { t: 'choice', q: 'Co mají jen savci?', o: ['mléčné žlázy', 'plíce', 'páteř'], a: 0 },
        { t: 'input', q: 'Sval oddělující hrudní a břišní dutinu savců je…', a: ['bránice', 'branice'] },
        { t: 'pair', q: 'Spoj zub s úkolem.', pairs: [['řezáky', 'ukusování'], ['špičáky', 'trhání'], ['stoličky', 'drcení']] },
        { t: 'tf', q: 'Savci mají stálou teplotu těla.', a: true },
        { t: 'choice', q: 'Klokan patří mezi…', o: ['vačnatce', 'hlodavce', 'šelmy'], a: 0, why: 'Mládě dorůstá ve vaku matky.' },
        { t: 'tf', q: 'Velryba dýchá žábrami.', a: false, why: 'Velryba je savec a dýchá plícemi.' },
        { t: 'choice', q: 'Čím je pokryto tělo savců?', o: ['srstí', 'peřím', 'šupinami'], a: 0 },
        { t: 'tf', q: 'Většina savců je živorodá.', a: true },
        { t: 'open', q: 'Vyjmenuj aspoň čtyři znaky savců.', a: 'Srst, mléčné žlázy a kojení, stálá teplota těla, plíce a bránice, rozlišené zuby, většinou živorodost.' },
        { t: 'open', q: 'Proč je delfín savec, i když žije ve vodě?', a: 'Dýchá vzduch plícemi, je živorodý a kojí mláďata mlékem, má stálou teplotu těla.' },
      ],
    },
    {
      id: 'savci-skupiny',
      title: 'Přehled savců',
      emoji: '🦊',
      ex: [
        {
          title: 'Kartičky řádů',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'hmyzožravci', back: 'ježek, krtek, rejsek' },
              { front: 'letouni', back: 'netopýr, vrápenec – létají, echolokace' },
              { front: 'hlodavci', back: 'myš, veverka, bobr – stále dorůstající řezáky' },
              { front: 'zajícovci', back: 'zajíc, králík – dva páry horních řezáků' },
              { front: 'šelmy', back: 'liška, vlk, rys, medvěd – velké špičáky' },
              { front: 'sudokopytníci', back: 'srnec, jelen, prase, kráva – 2 prsty s kopýtky' },
              { front: 'lichokopytníci', back: 'kůň, nosorožec – lichý počet prstů' },
              { front: 'kytovci', back: 'velryba, delfín – žijí v moři' },
            ] } },
            { t: 'key', text: 'Savce třídíme podle zubů, končetin a potravy.' },
          ],
        },
        {
          title: 'Podle potravy',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Býložravci', 'Masožravci', 'Všežravci'], items: [
              { text: 'srnec', b: 0 }, { text: 'rys', b: 1 }, { text: 'prase divoké', b: 2 }, { text: 'zajíc', b: 0 },
              { text: 'vlk', b: 1 }, { text: 'medvěd hnědý', b: 2 }, { text: 'bobr', b: 0 }, { text: 'kočka', b: 1 },
            ] } },
            { t: 'p', text: '**Přežvýkavci** (kráva, srnec) mají čtyřdílný žaludek: bachor, čepec, kniha, slez.' },
            { t: 'key', text: 'Přežvýkavec potravu vrací do úst a znovu žvýká.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Ježek patří mezi…', o: ['hmyzožravce', 'hlodavce', 'šelmy'], a: 0 },
        { t: 'choice', q: 'Kůň patří mezi…', o: ['lichokopytníky', 'sudokopytníky', 'šelmy'], a: 0 },
        { t: 'tf', q: 'Zajíc je hlodavec.', a: false, why: 'Zajíc patří mezi zajícovce – má dva páry horních řezáků.' },
        { t: 'input', q: 'Jak se jmenuje první oddíl žaludku přežvýkavců?', a: ['bachor'] },
        { t: 'pair', q: 'Spoj savce s řádem.', pairs: [['bobr', 'hlodavci'], ['rys', 'šelmy'], ['jelen', 'sudokopytníci'], ['delfín', 'kytovci']] },
        { t: 'choice', q: 'Jak se netopýři orientují ve tmě?', o: ['echolokací (ultrazvukem)', 'čichem', 'hmatem'], a: 0 },
        { t: 'tf', q: 'Hlodavcům řezáky celý život dorůstají.', a: true },
        { t: 'choice', q: 'Který savec je přežvýkavec?', o: ['kráva', 'prase', 'kůň'], a: 0 },
        { t: 'choice', q: 'Největší žijící živočich je…', o: ['plejtvák obrovský', 'slon africký', 'žirafa'], a: 0 },
        { t: 'tf', q: 'Člověk patří mezi primáty.', a: true },
        { t: 'open', q: 'Jak je krtek přizpůsoben životu pod zemí?', a: 'Má válcovité tělo, krátkou srst, lopatovité přední hrabavé končetiny a zakrnělé oči.' },
        { t: 'open', q: 'Čím se liší šelmy od hlodavců?', a: 'Šelmy jsou masožravé, mají velké špičáky a trháky. Hlodavci jsou většinou býložraví, mají dorůstající řezáky a nemají špičáky.' },
      ],
    },
    {
      id: 'kostra-svaly',
      title: 'Kostra a svaly',
      emoji: '💪',
      ex: [
        {
          title: 'Lešení a lana',
          blocks: [
            { t: 'p', text: 'Kostra je **lešení** těla. Svaly jsou **lana**, která za kosti tahají. Klouby jsou **panty**.' },
            { t: 'p', text: 'Sval umí jen **táhnout** (stahovat se). Proto pracují ve dvojicích: **biceps** ohýbá loket, **triceps** ho natahuje.' },
            { t: 'key', text: 'Dospělý člověk má asi 206 kostí. Svaly se jen stahují.' },
          ],
        },
        {
          title: 'Kde je která kost',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'lebka', back: 'chrání mozek' },
              { front: 'páteř', back: '33–34 obratlů, chrání míchu' },
              { front: 'hrudník (žebra + hrudní kost)', back: 'chrání srdce a plíce' },
              { front: 'stehenní kost', back: 'nejdelší kost těla' },
              { front: 'třmínek', back: 'nejmenší kost – ve středním uchu' },
            ] } },
            { t: 'table', head: ['Druh svaloviny', 'Ovládáme vůlí?', 'Kde'], rows: [
              ['kosterní (příčně pruhovaná)', 'ano', 'ruce, nohy'],
              ['hladká', 'ne', 'střeva, cévy'],
              ['srdeční', 'ne', 'srdce'],
            ] },
            { t: 'key', text: 'Srdeční sval pracuje bez přestávky a bez naší vůle.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik kostí má přibližně dospělý člověk?', o: ['206', '106', '506'], a: 0 },
        { t: 'choice', q: 'Nejdelší kost v těle je…', o: ['stehenní', 'pažní', 'holenní'], a: 0 },
        { t: 'tf', q: 'Svaly umí tlačit i táhnout.', a: false, why: 'Sval se umí jen stáhnout, proto pracují ve dvojicích.' },
        { t: 'input', q: 'Kost chránící mozek je…', a: ['lebka'] },
        { t: 'pair', q: 'Spoj kost s tím, co chrání.', pairs: [['lebka', 'mozek'], ['páteř', 'mícha'], ['hrudník', 'srdce a plíce']] },
        { t: 'choice', q: 'Který sval ohýbá paži v lokti?', o: ['dvojhlavý (biceps)', 'trojhlavý (triceps)', 'lýtkový'], a: 0 },
        { t: 'choice', q: 'Která svalovina nepracuje podle naší vůle?', o: ['hladká', 'kosterní', 'svaly paže'], a: 0 },
        { t: 'tf', q: 'Kostní dřeň tvoří krvinky.', a: true, why: 'Červená kostní dřeň vytváří krvinky.' },
        { t: 'choice', q: 'Kloub mezi pažní kostí a lopatkou je…', o: ['ramenní', 'kyčelní', 'kolenní'], a: 0 },
        { t: 'tf', q: 'Vápník je důležitý pro pevné kosti.', a: true },
        { t: 'open', q: 'Proč svaly pracují ve dvojicích?', a: 'Sval se umí jen stáhnout a táhnout. Jeden sval kloub ohne, druhý (protisval) ho natáhne – např. biceps a triceps.' },
        { t: 'open', q: 'Jaké funkce má kostra?', a: 'Opora těla, ochrana orgánů (mozku, srdce), pohyb spolu se svaly, tvorba krvinek v kostní dřeni a zásoba vápníku.' },
      ],
    },
    {
      id: 'krev-obeh',
      title: 'Krev a oběh krve',
      emoji: '❤️',
      ex: [
        {
          title: 'Okruh srdcem',
          blocks: [
            { t: 'p', text: 'Srdce je **pumpa** se 4 dutinami: 2 síně a 2 komory. Krev jde dvěma okruhy.' },
            { t: 'w', w: 'cycle', p: { steps: ['levá komora', 'tělo (velký oběh)', 'pravá síň', 'pravá komora', 'plíce (malý oběh)', 'levá síň'] } },
            { t: 'key', text: 'Tepny vedou krev OD srdce, žíly K srdci.' },
          ],
        },
        {
          title: 'Co je v krvi',
          blocks: [
            { t: 'table', head: ['Složka', 'Úkol'], rows: [
              ['červené krvinky', 'přenášejí kyslík (hemoglobin)'],
              ['bílé krvinky', 'bojují s choroboplodnými zárodky'],
              ['krevní destičky', 'srážení krve'],
              ['krevní plazma', 'tekutina, rozvádí živiny'],
            ] },
            { t: 'w', w: 'bars', p: { unit: 'tepů za minutu', items: [
              { label: 'v klidu (dospělý)', value: 70 }, { label: 'chůze', value: 100 }, { label: 'běh', value: 160 },
            ] } },
            { t: 'key', text: 'Krevní skupiny: A, B, AB, 0.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik dutin má lidské srdce?', a: ['4', 'čtyři', 'ctyri'] },
        { t: 'choice', q: 'Které krvinky přenášejí kyslík?', o: ['červené', 'bílé', 'destičky'], a: 0 },
        { t: 'choice', q: 'Tepny vedou krev…', o: ['od srdce', 'k srdci', 'jen v plicích'], a: 0 },
        { t: 'tf', q: 'Bílé krvinky chrání tělo před infekcí.', a: true },
        { t: 'pair', q: 'Spoj složku krve s úkolem.', pairs: [['červené krvinky', 'kyslík'], ['bílé krvinky', 'obrana'], ['krevní destičky', 'srážení'], ['plazma', 'rozvod živin']] },
        { t: 'choice', q: 'Malý (plicní) oběh začíná v…', o: ['pravé komoře', 'levé komoře', 'levé síni'], a: 0 },
        { t: 'choice', q: 'Která krevní skupina NEEXISTUJE v systému AB0?', o: ['C', 'AB', '0'], a: 0 },
        { t: 'tf', q: 'Nejsilnější stěnu má levá komora.', a: true, why: 'Pumpuje krev do celého těla.' },
        { t: 'order', q: 'Seřaď cestu krve malým oběhem.', items: ['pravá komora', 'plicní tepna', 'plíce', 'plicní žíly', 'levá síň'] },
        { t: 'choice', q: 'Nejtenčí cévy jsou…', o: ['vlásečnice', 'tepny', 'žíly'], a: 0 },
        { t: 'open', q: 'Popiš velký a malý krevní oběh.', a: 'Velký oběh vede okysličenou krev z levé komory do těla a zpět do pravé síně. Malý oběh vede krev z pravé komory do plic, kde se okysličí, a zpět do levé síně.' },
        { t: 'open', q: 'Jaký je rozdíl mezi tepnou a žílou?', a: 'Tepna vede krev od srdce, má silnou pružnou stěnu a vyšší tlak. Žíla vede krev k srdci, má tenčí stěnu a chlopně.' },
      ],
    },
    {
      id: 'dychani',
      title: 'Dýchací soustava',
      emoji: '🫁',
      ex: [
        {
          title: 'Cesta vzduchu',
          blocks: [
            { t: 'steps', items: ['nosní dutina – ohřeje, zvlhčí a očistí vzduch', 'hltan', 'hrtan – hlasivky', 'průdušnice', 'průdušky', 'plicní sklípky – výměna plynů'] },
            { t: 'key', text: 'V plicních sklípcích přechází kyslík do krve a CO₂ z krve ven.' },
          ],
        },
        {
          title: 'Plíce jako balónky',
          blocks: [
            { t: 'p', text: 'Plíce samy nesají. Když se **bránice** stáhne a klesne, hrudník se zvětší a vzduch vnikne dovnitř.' },
            { t: 'w', w: 'cycle', p: { steps: ['bránice se stáhne, hrudník se zvětší', 'nádech – vzduch do plic', 'výměna plynů ve sklípcích', 'bránice povolí, hrudník se zmenší', 'výdech – CO₂ ven'] } },
            { t: 'w', w: 'bars', p: { unit: '% ve vzduchu', items: [
              { label: 'kyslík – vdechovaný', value: 21 }, { label: 'kyslík – vydechovaný', value: 16 },
              { label: 'CO₂ – vdechovaný', value: 0.04 }, { label: 'CO₂ – vydechovaný', value: 4 },
            ] } },
            { t: 'key', text: 'Nádech dělá hlavně bránice.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď cestu vzduchu.', items: ['nosní dutina', 'hltan', 'hrtan', 'průdušnice', 'průdušky', 'plicní sklípky'] },
        { t: 'choice', q: 'Kde probíhá výměna plynů?', o: ['v plicních sklípcích', 'v průdušnici', 'v hrtanu'], a: 0 },
        { t: 'choice', q: 'Kde jsou hlasivky?', o: ['v hrtanu', 'v hltanu', 'v plicích'], a: 0 },
        { t: 'tf', q: 'Vydechovaný vzduch obsahuje víc CO₂ než vdechovaný.', a: true },
        { t: 'input', q: 'Hlavní dýchací sval je…', a: ['bránice', 'branice'] },
        { t: 'tf', q: 'Dýchání nosem je zdravější než ústy.', a: true, why: 'Nos vzduch ohřeje, zvlhčí a očistí.' },
        { t: 'choice', q: 'Kolik procent kyslíku je ve vzduchu?', o: ['asi 21 %', 'asi 78 %', 'asi 1 %'], a: 0 },
        { t: 'pair', q: 'Spoj nemoc nebo škodlivinu s orgánem.', pairs: [['angína', 'mandle'], ['zápal plic', 'plíce'], ['rýma', 'nosní dutina']] },
        { t: 'tf', q: 'Kouření poškozuje plicní sklípky a zvyšuje riziko rakoviny plic.', a: true },
        { t: 'choice', q: 'Co zabraňuje vdechnutí jídla do průdušnice?', o: ['hrtanová příklopka', 'bránice', 'mandle'], a: 0 },
        { t: 'open', q: 'Popiš, jak probíhá nádech.', a: 'Bránice a mezižeberní svaly se stáhnou, hrudník se zvětší, tlak v plicích klesne a vzduch vnikne do plic.' },
        { t: 'open', q: 'Proč je lepší dýchat nosem?', a: 'Nosní dutina vzduch ohřeje, zvlhčí a chloupky a hlen ho očistí od prachu a mikrobů.' },
      ],
    },
    {
      id: 'traveni',
      title: 'Trávicí soustava a výživa',
      emoji: '🍎',
      ex: [
        {
          title: 'Cesta sousta',
          blocks: [
            { t: 'steps', items: ['ústa – zuby rozmělní, sliny začnou trávit škrob', 'hltan a jícen – posun do žaludku', 'žaludek – kyselina a enzymy štěpí bílkoviny', 'tenké střevo – trávení a vstřebávání živin do krve', 'tlusté střevo – vstřebání vody', 'konečník – odchod nestrávených zbytků'] },
            { t: 'p', text: '**Játra** tvoří žluč (pomáhá trávit tuky). **Slinivka** tvoří trávicí šťávy.' },
            { t: 'key', text: 'Živiny se vstřebávají hlavně v tenkém střevě.' },
          ],
        },
        {
          title: 'Talíř živin',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Hlavně cukry', 'Hlavně bílkoviny', 'Hlavně tuky'], items: [
              { text: 'chléb', b: 0 }, { text: 'tvaroh', b: 1 }, { text: 'máslo', b: 2 }, { text: 'těstoviny', b: 0 },
              { text: 'kuřecí maso', b: 1 }, { text: 'olej', b: 2 }, { text: 'čočka', b: 1 }, { text: 'rýže', b: 0 },
            ] } },
            { t: 'table', head: ['Živina', 'Úkol'], rows: [
              ['cukry (sacharidy)', 'rychlá energie'],
              ['tuky', 'zásoba energie'],
              ['bílkoviny', 'stavba těla'],
              ['vitaminy, minerály, voda', 'správná funkce těla'],
            ] },
            { t: 'key', text: 'Pestrá strava + pitný režim + pohyb.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď cestu potravy.', items: ['ústa', 'jícen', 'žaludek', 'tenké střevo', 'tlusté střevo'] },
        { t: 'choice', q: 'Kde se vstřebává většina živin?', o: ['v tenkém střevě', 'v žaludku', 'v jícnu'], a: 0 },
        { t: 'choice', q: 'Který orgán tvoří žluč?', o: ['játra', 'slinivka', 'žaludek'], a: 0 },
        { t: 'tf', q: 'V tlustém střevě se vstřebává hlavně voda.', a: true },
        { t: 'input', q: 'Kolik zubů má dospělý člověk (se zuby moudrosti)?', a: ['32'] },
        { t: 'pair', q: 'Spoj živinu s úkolem.', pairs: [['bílkoviny', 'stavba těla'], ['cukry', 'rychlá energie'], ['tuky', 'zásoba energie'], ['vitamin C', 'obranyschopnost']] },
        { t: 'choice', q: 'Kterou potravinu řadíme hlavně mezi zdroje bílkovin?', o: ['tvaroh', 'cukr', 'olej'], a: 0 },
        { t: 'tf', q: 'Sliny začínají trávit škrob už v ústech.', a: true },
        { t: 'choice', q: 'Žaludeční šťáva obsahuje…', o: ['kyselinu chlorovodíkovou', 'žluč', 'inzulin'], a: 0 },
        { t: 'tf', q: 'Mléčných zubů má dítě 20.', a: true },
        { t: 'open', q: 'Popiš cestu potravy trávicí soustavou.', a: 'Ústa (rozmělnění, sliny), hltan, jícen, žaludek (kyselina, bílkoviny), tenké střevo (trávení a vstřebání živin), tlusté střevo (voda), konečník.' },
        { t: 'open', q: 'Co znamená zdravě se stravovat?', a: 'Jíst pestře a pravidelně, hodně ovoce a zeleniny, méně cukru, soli a tuku, dost pít vody.' },
      ],
    },
    {
      id: 'nervy-smysly',
      title: 'Nervy, smysly a hormony',
      emoji: '🧠',
      ex: [
        {
          title: 'Řízení těla',
          blocks: [
            { t: 'p', text: '**Nervy** = telefon (rychlé zprávy elektricky). **Hormony** = pošta (pomalejší zprávy krví).' },
            { t: 'w', w: 'cycle', p: { steps: ['podnět (horká plotna)', 'receptor v kůži', 'dostředivý nerv', 'mícha', 'odstředivý nerv', 'sval – ucuknutí'] } },
            { t: 'key', text: 'Reflex je rychlá automatická odpověď – vede ho často jen mícha.' },
          ],
        },
        {
          title: 'Orgány a žlázy',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'neuron', back: 'nervová buňka' },
              { front: 'velký mozek', back: 'myšlení, paměť, řeč' },
              { front: 'mozeček', back: 'rovnováha, souhra pohybů' },
              { front: 'sítnice', back: 'vrstva oka s tyčinkami a čípky' },
              { front: 'inzulin (slinivka)', back: 'snižuje hladinu cukru v krvi' },
              { front: 'adrenalin (nadledviny)', back: 'stres, poplach, zrychlí srdce' },
            ] } },
            { t: 'key', text: 'Pět smyslů: zrak, sluch, čich, chuť, hmat.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Nervová buňka se jmenuje…', a: ['neuron'] },
        { t: 'choice', q: 'Která část mozku řídí rovnováhu?', o: ['mozeček', 'velký mozek', 'prodloužená mícha'], a: 0 },
        { t: 'choice', q: 'Inzulin tvoří…', o: ['slinivka břišní', 'štítná žláza', 'játra'], a: 0 },
        { t: 'tf', q: 'Při cukrovce 1. typu tělo netvoří dost inzulinu.', a: true },
        { t: 'pair', q: 'Spoj smysl s orgánem.', pairs: [['zrak', 'oko'], ['sluch', 'ucho'], ['čich', 'nos'], ['chuť', 'jazyk']] },
        { t: 'choice', q: 'Kde v oku vzniká obraz?', o: ['na sítnici', 'na rohovce', 'v čočce'], a: 0 },
        { t: 'tf', q: 'Hormony se roznášejí krví.', a: true },
        { t: 'choice', q: 'Rovnovážné ústrojí je…', o: ['ve vnitřním uchu', 've středním uchu', 'v nose'], a: 0 },
        { t: 'order', q: 'Seřaď reflexní oblouk.', items: ['receptor', 'dostředivý nerv', 'mícha', 'odstředivý nerv', 'sval'] },
        { t: 'choice', q: 'Který hormon se vyplavuje při strachu?', o: ['adrenalin', 'inzulin', 'tyroxin'], a: 0 },
        { t: 'open', q: 'Co je reflex? Uveď příklad.', a: 'Rychlá, automatická reakce na podnět bez vědomého rozhodnutí. Např. ucuknutí ruky od horké plotny, mrknutí, kýchnutí.' },
        { t: 'open', q: 'Jak se liší řízení nervy a hormony?', a: 'Nervy předávají zprávy rychle elektrickými vzruchy. Hormony jsou látky roznášené krví, působí pomaleji, ale déle.' },
      ],
    },
    {
      id: 'kuze-vylucovani',
      title: 'Kůže a vylučování',
      emoji: '🩺',
      ex: [
        {
          title: 'Ledviny jako filtr',
          blocks: [
            { t: 'p', text: 'Ledviny jsou **čistička** krve. Odfiltrují odpad a přebytečnou vodu – vznikne **moč**.' },
            { t: 'steps', items: ['ledviny – tvoří moč', 'močovody', 'močový měchýř – zásobník', 'močová trubice – ven'] },
            { t: 'key', text: 'Ledviny čistí krev. Pij dost vody.' },
          ],
        },
        {
          title: 'Vrstvy kůže',
          blocks: [
            { t: 'table', head: ['Vrstva', 'Co v ní je'], rows: [
              ['pokožka', 'odumřelé buňky, barvivo melanin'],
              ['škára', 'cévy, nervy, potní a mazové žlázy, vlasové váčky'],
              ['podkožní vazivo', 'tuk – izolace a zásoba'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Funkce kůže', 'Není funkcí kůže'], items: [
              { text: 'ochrana', b: 0 }, { text: 'trávení', b: 1 }, { text: 'hmat', b: 0 }, { text: 'vylučování potu', b: 0 },
              { text: 'tvorba krvinek', b: 1 }, { text: 'řízení teploty', b: 0 }, { text: 'výměna plynů jako plíce', b: 1 },
            ] } },
            { t: 'key', text: 'Kůže chrání, vnímá, chladí potem a tvoří vitamin D.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který orgán tvoří moč?', o: ['ledviny', 'játra', 'močový měchýř'], a: 0 },
        { t: 'order', q: 'Seřaď cestu moči.', items: ['ledviny', 'močovody', 'močový měchýř', 'močová trubice'] },
        { t: 'tf', q: 'Kůže je největší orgán lidského těla.', a: true },
        { t: 'input', q: 'Barvivo kůže, které chrání před UV zářením, je…', a: ['melanin'] },
        { t: 'choice', q: 'Ve které vrstvě kůže jsou potní žlázy?', o: ['ve škáře', 'v pokožce', 'v podkožním vazivu'], a: 0 },
        { t: 'pair', q: 'Spoj vrstvu kůže s obsahem.', pairs: [['pokožka', 'melanin'], ['škára', 'cévy a žlázy'], ['podkožní vazivo', 'tuk']] },
        { t: 'tf', q: 'Pocení pomáhá tělu ochladit se.', a: true },
        { t: 'choice', q: 'Jak se chránit před spálením od slunce?', o: ['opalovací krém, pokrývka hlavy, stín', 'pít kávu', 'opalovat se v poledne'], a: 0 },
        { t: 'tf', q: 'Člověk má jen jednu ledvinu.', a: false, why: 'Člověk má dvě ledviny, ale dá se žít i s jednou.' },
        { t: 'choice', q: 'Co vzniká v kůži působením slunce?', o: ['vitamin D', 'vitamin C', 'inzulin'], a: 0 },
        { t: 'open', q: 'Jaké funkce má kůže?', a: 'Chrání tělo, vnímá dotyk, teplo a bolest, reguluje teplotu potem, vylučuje, tvoří vitamin D.' },
        { t: 'open', q: 'Proč je důležité dost pít?', a: 'Ledviny potřebují vodu, aby z krve odplavily odpadní látky. Voda také chladí tělo potem.' },
      ],
    },
    {
      id: 'rozmnozovani-cloveka',
      title: 'Rozmnožování a vývoj člověka',
      emoji: '👶',
      ex: [
        {
          title: 'Od buňky k dítěti',
          blocks: [
            { t: 'steps', items: ['spermie splyne s vajíčkem ve vejcovodu – oplození', 'vznikne zygota a dělí se', 'zárodek se uhnízdí v děloze', 'plod roste asi 9 měsíců, výživu dostává přes placentu', 'porod'] },
            { t: 'key', text: 'Těhotenství trvá asi 40 týdnů (9 měsíců).' },
          ],
        },
        {
          title: 'Etapy života',
          blocks: [
            { t: 'w', w: 'timeline', p: { events: [
              { year: 0, label: 'novorozenec' }, { year: 1, label: 'batole' }, { year: 3, label: 'předškolní věk' },
              { year: 6, label: 'školní věk' }, { year: 11, label: 'puberta' }, { year: 20, label: 'dospělost' }, { year: 65, label: 'stáří' },
            ] } },
            { t: 'table', head: ['Orgány', 'Žena', 'Muž'], rows: [
              ['pohlavní žlázy', 'vaječníky', 'varlata'],
              ['pohlavní buňky', 'vajíčka', 'spermie'],
              ['hormon', 'estrogen', 'testosteron'],
            ] },
            { t: 'key', text: 'Puberta = dospívání, mění se tělo i psychika.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kde obvykle dochází k oplození?', o: ['ve vejcovodu', 'v děloze', 've vaječníku'], a: 0 },
        { t: 'choice', q: 'Jak dlouho trvá těhotenství?', o: ['asi 40 týdnů', 'asi 20 týdnů', 'asi 12 měsíců'], a: 0 },
        { t: 'input', q: 'Orgán, kterým plod dostává výživu od matky, je…', a: ['placenta', 'plodový koláč'] },
        { t: 'tf', q: 'Mužské pohlavní buňky jsou spermie.', a: true },
        { t: 'pair', q: 'Spoj orgán s funkcí.', pairs: [['vaječník', 'tvoří vajíčka'], ['varle', 'tvoří spermie'], ['děloha', 'vývoj plodu']] },
        { t: 'order', q: 'Seřaď etapy života.', items: ['novorozenec', 'batole', 'školní věk', 'puberta', 'dospělost', 'stáří'] },
        { t: 'tf', q: 'Menstruační cyklus trvá obvykle asi 28 dní.', a: true },
        { t: 'choice', q: 'Splynutím vajíčka a spermie vzniká…', o: ['zygota', 'placenta', 'embryo hned s orgány'], a: 0 },
        { t: 'tf', q: 'V pubertě se tvoří pohlavní hormony.', a: true },
        { t: 'choice', q: 'Co chrání před pohlavně přenosnými chorobami?', o: ['kondom', 'vitaminy', 'antibiotika předem'], a: 0 },
        { t: 'open', q: 'Popiš, co se děje od oplození po porod.', a: 'Spermie oplodní vajíčko ve vejcovodu, vznikne zygota. Ta se dělí a uhnízdí v děloze. Plod se asi 9 měsíců vyvíjí, živí ho placenta. Pak nastane porod.' },
        { t: 'open', q: 'Jaké změny přináší puberta?', a: 'Rychlý růst, vývoj pohlavních znaků (prsa, vousy, ochlupení, mutace hlasu), první menstruace či poluce, změny nálad.' },
      ],
    },
    {
      id: 'zdravi-prvni-pomoc',
      title: 'Zdraví a první pomoc',
      emoji: '🚑',
      ex: [
        {
          title: 'Postup při nehodě',
          blocks: [
            { t: 'steps', items: ['zajisti bezpečí své i zraněného', 'zjisti, zda reaguje a dýchá', 'volej 155 (nebo 112)', 'nedýchá → masáž srdce: 30 stlačení uprostřed hrudníku', 'nepřestávej do příjezdu záchranky'] },
            { t: 'key', text: 'Záchranka 155, tísňová linka 112.' },
          ],
        },
        {
          title: 'Zdravý den',
          blocks: [
            { t: 'w', w: 'bars', p: { unit: 'hodin spánku denně (doporučeno)', items: [
              { label: 'školák 6–12 let', value: 10 }, { label: 'teenager', value: 9 }, { label: 'dospělý', value: 8 },
            ] } },
            { t: 'w', w: 'sort', p: { buckets: ['Prospívá zdraví', 'Škodí zdraví'], items: [
              { text: 'pohyb venku', b: 0 }, { text: 'kouření', b: 1 }, { text: 'dostatek spánku', b: 0 }, { text: 'alkohol', b: 1 },
              { text: 'zelenina', b: 0 }, { text: 'celonoční hraní na mobilu', b: 1 }, { text: 'pitná voda', b: 0 }, { text: 'slazené nápoje', b: 1 },
            ] } },
            { t: 'key', text: 'Spánek, pohyb, pestrá strava, žádné drogy.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Číslo zdravotnické záchranné služby je…', a: ['155'] },
        { t: 'choice', q: 'Co uděláš jako první u nehody?', o: ['zajistím bezpečí', 'dám zraněnému napít', 'odejdu'], a: 0 },
        { t: 'choice', q: 'Kolik stlačení hrudníku je v jednom cyklu u dospělého?', o: ['30', '5', '100'], a: 0 },
        { t: 'tf', q: 'Tepenné krvácení zastavujeme tlakem v ráně nebo tlakovým obvazem.', a: true },
        { t: 'pair', q: 'Spoj číslo se službou.', pairs: [['155', 'záchranka'], ['150', 'hasiči'], ['158', 'policie'], ['112', 'jednotná evropská linka']] },
        { t: 'tf', q: 'Popáleninu chladíme studenou vodou.', a: true },
        { t: 'choice', q: 'Nikotin je obsažen v…', o: ['tabáku', 'kávě', 'čaji'], a: 0 },
        { t: 'tf', q: 'Alkohol je pro dospívající neškodný.', a: false, why: 'Alkohol poškozuje vyvíjející se mozek a játra a vytváří závislost.' },
        { t: 'choice', q: 'Kolik minut pohybu denně se doporučuje dětem?', o: ['aspoň 60', 'aspoň 5', 'žádný'], a: 0 },
        { t: 'tf', q: 'Při masáži srdce tlačíme rychlostí asi 100–120 stlačení za minutu.', a: true },
        { t: 'open', q: 'Jak postupuješ, když najdeš člověka v bezvědomí?', a: 'Zajistím bezpečí, oslovím ho, zjistím dýchání. Zavolám 155. Pokud nedýchá normálně, zahájím masáž srdce a pokračuji do příjezdu záchranky.' },
        { t: 'open', q: 'Co patří ke zdravému životnímu stylu?', a: 'Pestrá strava, pitný režim, pravidelný pohyb, dostatek spánku, hygiena a vyhýbání se kouření, alkoholu a drogám.' },
      ],
    },
  ],
} satisfies Subject
