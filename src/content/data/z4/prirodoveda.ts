import type { Subject } from '../../types'

export default {
  grade: 'z4',
  subject: 'prirodoveda',
  topics: [
    {
      id: 'voda-a-vzduch',
      title: 'Neživá příroda: voda a vzduch',
      emoji: '💧',
      ex: [
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'p', text: '**Živá příroda** dýchá, přijímá potravu, roste, rozmnožuje se a umírá. **Neživá** ne.' },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['Živá příroda', 'Neživá příroda'],
                items: [
                  { text: 'strom', b: 0 }, { text: 'kámen', b: 1 }, { text: 'žába', b: 0 }, { text: 'voda', b: 1 },
                  { text: 'houba', b: 0 }, { text: 'vzduch', b: 1 }, { text: 'písek', b: 1 }, { text: 'člověk', b: 0 },
                ],
              },
            },
            { t: 'p', text: 'Bez neživé přírody by živá nepřežila. Potřebuje **vzduch, vodu, světlo, teplo a půdu**.' },
            { t: 'key', text: 'Voda, vzduch, světlo, teplo a půda = podmínky života.' },
          ],
        },
        {
          title: 'Voda dokola',
          blocks: [
            { t: 'p', text: 'Voda má tři **skupenství**.' },
            { t: 'table', head: ['Skupenství', 'Příklad'], rows: [['pevné', 'led, sníh'], ['kapalné', 'voda v řece'], ['plynné', 'vodní pára']] },
            { t: 'p', text: 'Voda **mrzne při 0 °C** a **vře při 100 °C**.' },
            { t: 'w', w: 'cycle', p: { steps: ['Slunce ohřeje vodu – vypařuje se', 'Pára stoupá a tvoří mraky', 'Z mraků padá déšť a sníh', 'Voda teče řekami do moře'] } },
            { t: 'p', text: 'Vzduch je směs plynů. Nejvíc je **dusíku**, pro dýchání potřebujeme **kyslík**.' },
            { t: 'w', w: 'bars', p: { unit: '%', items: [{ label: 'dusík', value: 78 }, { label: 'kyslík', value: 21 }, { label: 'ostatní plyny', value: 1 }] } },
            { t: 'key', text: 'Voda v přírodě stále koluje: výpar → mraky → srážky → řeky → moře.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Kámen patří do živé přírody.', a: false, why: 'Kámen neroste, nedýchá a nerozmnožuje se.' },
        { t: 'choice', q: 'Při jaké teplotě mrzne voda?', o: ['0 °C', '10 °C', '100 °C', '−10 °C'], a: 0, why: 'Voda mrzne při 0 °C a vře při 100 °C.' },
        { t: 'input', q: 'Při kolika °C vře voda? Napiš číslo.', a: ['100'], why: 'Voda vře při 100 °C.' },
        { t: 'choice', q: 'Kterého plynu je ve vzduchu nejvíc?', o: ['kyslíku', 'dusíku', 'oxidu uhličitého'], a: 1, why: 'Dusíku je ve vzduchu asi 78 %.' },
        { t: 'pair', q: 'Spoj skupenství s příkladem.', pairs: [['pevné', 'led'], ['kapalné', 'déšť'], ['plynné', 'pára']] },
        { t: 'order', q: 'Seřaď koloběh vody.', items: ['výpar z moře', 'mraky', 'déšť', 'voda v řece'], why: 'Voda se vypaří, vytvoří mraky, spadne a odteče zpět.' },
        { t: 'choice', q: 'Co NENÍ podmínkou života?', o: ['voda', 'světlo', 'hluk', 'teplo'], a: 2, why: 'Podmínky života jsou voda, vzduch, světlo, teplo a půda.' },
        { t: 'tf', q: 'Sníh je voda v pevném skupenství.', a: true },
        { t: 'choice', q: 'Jak se jmenuje přechod vody v páru?', o: ['tání', 'vypařování', 'tuhnutí'], a: 1, why: 'Kapalina se mění v plyn = vypařování.' },
        { t: 'tf', q: 'Kyslík potřebujeme k dýchání.', a: true },
        { t: 'open', q: 'Popiš, jak koluje voda v přírodě.', a: 'Slunce ohřeje vodu a ta se vypaří. Pára stoupá a tvoří mraky. Z mraků padá déšť nebo sníh, voda teče řekami do moře a vše se opakuje.' },
        { t: 'open', q: 'Jak poznáš živou přírodu od neživé?', a: 'Živé organismy dýchají, přijímají potravu, rostou, rozmnožují se a umírají. Neživá příroda (kámen, voda, vzduch) to nedělá.' },
      ],
    },
    {
      id: 'horniny-nerosty-puda',
      title: 'Horniny, nerosty a půda',
      emoji: '🪨',
      ex: [
        {
          title: 'Jako těsto',
          blocks: [
            { t: 'p', text: '**Nerost** (minerál) je jako jedna surovina. **Hornina** je jako těsto z více surovin.' },
            { t: 'pic', items: ['⚪', '🟤', '✨', '➡️', '🪨'], caption: 'křemen + živec + slída = žula' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'žula', back: 'hornina – stavby, dlažba' },
              { front: 'vápenec', back: 'hornina – vyrábí se z něj vápno a cement' },
              { front: 'pískovec', back: 'hornina ze slepených zrnek písku' },
              { front: 'křemen', back: 'nerost – tvrdý, často bílý nebo průhledný' },
              { front: 'sůl kamenná', back: 'nerost – solíme jím jídlo' },
            ] } },
            { t: 'key', text: 'Hornina se skládá z nerostů.' },
          ],
        },
        {
          title: 'Jak vzniká půda',
          blocks: [
            { t: 'steps', items: [
              'Horniny praská mráz, voda a vítr – **zvětrávají**.',
              'Vznikají drobné kamínky a písek.',
              'Odumřelé rostliny a živočichové tlí na **humus**.',
              'Žížaly vše promíchají – vzniká **půda**.',
            ] },
            { t: 'p', text: 'Půda vzniká **stovky let**. Proto ji musíme chránit.' },
            { t: 'w', w: 'sort', p: { buckets: ['Hornina', 'Nerost'], items: [
              { text: 'žula', b: 0 }, { text: 'křemen', b: 1 }, { text: 'vápenec', b: 0 }, { text: 'slída', b: 1 },
              { text: 'pískovec', b: 0 }, { text: 'sůl kamenná', b: 1 },
            ] } },
            { t: 'key', text: 'Půda = zvětralé horniny + humus. Vzniká velmi pomalu.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Žula je hornina.', a: true },
        { t: 'choice', q: 'Co je nerost?', o: ['křemen', 'žula', 'pískovec'], a: 0, why: 'Křemen je nerost. Žula a pískovec jsou horniny.' },
        { t: 'choice', q: 'Ze kterých nerostů se skládá žula?', o: ['křemen, živec, slída', 'sůl, vápenec, písek', 'uhlí, železo, zlato'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje tmavá vrstva půdy z odumřelých rostlin a živočichů?', a: ['humus'], why: 'Humus vzniká tlením zbytků organismů.' },
        { t: 'choice', q: 'Jak se jmenuje rozpad hornin vlivem mrazu, vody a větru?', o: ['zvětrávání', 'tání', 'tlení'], a: 0 },
        { t: 'tf', q: 'Půda vznikne za pár dní.', a: false, why: 'Půda vzniká stovky let.' },
        { t: 'pair', q: 'Spoj s použitím.', pairs: [['sůl kamenná', 'solení jídla'], ['vápenec', 'výroba vápna'], ['žula', 'dlažební kostky']] },
        { t: 'choice', q: 'Které zvíře pomáhá promíchávat půdu?', o: ['žížala', 'kapr', 'vrabec'], a: 0, why: 'Žížaly provrtávají a provzdušňují půdu.' },
        { t: 'order', q: 'Seřaď vznik půdy.', items: ['pevná hornina', 'hornina zvětrává', 'drobné kamínky a písek', 'přidá se humus – půda'] },
        { t: 'tf', q: 'Hornina se skládá z nerostů.', a: true },
        { t: 'open', q: 'Jaký je rozdíl mezi horninou a nerostem?', a: 'Nerost je jedna stejnorodá látka, například křemen. Hornina se skládá z jednoho nebo více nerostů, například žula z křemene, živce a slídy.' },
        { t: 'open', q: 'Proč musíme chránit půdu?', a: 'Půda vzniká velmi pomalu, stovky let. Rostou v ní rostliny, které nás živí. Když ji zničíme, rychle se neobnoví.' },
      ],
    },
    {
      id: 'stavba-rostlin',
      title: 'Stavba rostlin',
      emoji: '🌻',
      ex: [
        {
          title: 'Rostlina jako dům',
          blocks: [
            { t: 'p', text: '**Kořen** je jako sklep a pumpa. **Stonek** jako výtah. **List** jako kuchyně. **Květ** jako kolébka pro semínka.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'kořen', back: 'drží rostlinu v zemi, saje vodu' },
              { front: 'stonek', back: 'nese listy a vede vodu' },
              { front: 'list', back: 'na světle vyrábí živiny' },
              { front: 'květ', back: 'slouží k rozmnožování' },
              { front: 'plod', back: 'chrání semena' },
            ] } },
            { t: 'key', text: 'Kořen, stonek, list, květ, plod – každá část má svou práci.' },
          ],
        },
        {
          title: 'Druhy stonků',
          blocks: [
            { t: 'table', head: ['Stonek', 'Kde ho najdeš'], rows: [['kmen', 'stromy – dřevnatý'], ['lodyha', 'byliny – měkká, zelená'], ['stéblo', 'trávy a obilí – duté, s kolénky']] },
            { t: 'p', text: '**Byliny** mají měkký stonek. **Dřeviny** (stromy, keře) mají dřevnatý.' },
            { t: 'w', w: 'sort', p: { buckets: ['Bylina', 'Dřevina'], items: [
              { text: 'pampeliška', b: 0 }, { text: 'dub', b: 1 }, { text: 'kopretina', b: 0 }, { text: 'líska', b: 1 },
              { text: 'jetel', b: 0 }, { text: 'bříza', b: 1 }, { text: 'šípek', b: 1 }, { text: 'mák', b: 0 },
            ] } },
            { t: 'p', text: 'Listy z vody a vzduchu za pomoci světla vyrábějí živiny a uvolňují **kyslík**.' },
            { t: 'key', text: 'Strom má kmen, bylina lodyhu, tráva stéblo.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která část rostliny saje vodu ze země?', o: ['kořen', 'list', 'květ'], a: 0 },
        { t: 'choice', q: 'Jak se jmenuje stonek trav?', o: ['stéblo', 'kmen', 'lodyha'], a: 0, why: 'Stéblo je duté a má kolénka.' },
        { t: 'tf', q: 'Listy na světle vyrábějí živiny a uvolňují kyslík.', a: true },
        { t: 'pair', q: 'Spoj část rostliny s úkolem.', pairs: [['kořen', 'drží v zemi'], ['list', 'vyrábí živiny'], ['květ', 'rozmnožování'], ['plod', 'chrání semena']] },
        { t: 'input', q: 'Jak se jmenuje stonek stromu?', a: ['kmen'] },
        { t: 'tf', q: 'Keř je bylina.', a: false, why: 'Keř má dřevnatý stonek, je to dřevina.' },
        { t: 'choice', q: 'Co vznikne z květu po opylení?', o: ['plod se semeny', 'kořen', 'nový list'], a: 0 },
        { t: 'choice', q: 'Kdo často přenáší pyl z květu na květ?', o: ['včely a čmeláci', 'žížaly', 'ryby'], a: 0, why: 'Hmyz opyluje květy. Některé rostliny opyluje vítr.' },
        { t: 'order', q: 'Seřaď od země nahoru.', items: ['kořen', 'stonek', 'list', 'květ'] },
        { t: 'tf', q: 'Bez světla rostlina nemůže vyrábět živiny.', a: true },
        { t: 'open', q: 'Vyjmenuj části rostliny a řekni, k čemu slouží.', a: 'Kořen drží rostlinu a saje vodu. Stonek nese listy a vede vodu. List vyrábí živiny. Květ slouží k rozmnožování a plod chrání semena.' },
        { t: 'open', q: 'Jaký je rozdíl mezi bylinou a dřevinou?', a: 'Bylina má měkký zelený stonek, například pampeliška. Dřevina má dřevnatý stonek – to jsou stromy a keře.' },
      ],
    },
    {
      id: 'houby',
      title: 'Houby',
      emoji: '🍄',
      ex: [
        {
          title: 'Co je pod zemí',
          blocks: [
            { t: 'p', text: 'Houba, kterou sbíráš, je jen **plodnice**. Hlavní část je **podhoubí** – tenká vlákna v půdě.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'klobouk', back: 'horní část plodnice' },
              { front: 'třeň', back: 'noha houby' },
              { front: 'podhoubí', back: 'vlákna v zemi – houba žije hlavně tady' },
              { front: 'výtrusy', back: 'drobná zrníčka, ze kterých roste nová houba' },
            ] } },
            { t: 'p', text: 'Houby **nejsou rostliny** – nemají zelené listy a samy si potravu nevyrobí.' },
            { t: 'key', text: 'Houba = podhoubí v zemi + plodnice nad zemí.' },
          ],
        },
        {
          title: 'Jedlá, nebo jedovatá?',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Jedlá', 'Jedovatá'], items: [
              { text: 'hřib smrkový', b: 0 }, { text: 'muchomůrka zelená', b: 1 }, { text: 'bedla vysoká', b: 0 },
              { text: 'muchomůrka červená', b: 1 }, { text: 'liška obecná', b: 0 }, { text: 'muchomůrka tygrovaná', b: 1 },
            ] } },
            { t: 'p', text: '**Muchomůrka zelená** je smrtelně jedovatá. Má bílé lupeny a hlízu u země.' },
            { t: 'key', text: 'Houbu, kterou bezpečně neznáš, nesbírej.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Houby jsou rostliny.', a: false, why: 'Houby nemají zelené barvivo a potravu si nevyrobí. Jsou samostatná říše.' },
        { t: 'choice', q: 'Jak se jmenuje noha houby?', o: ['třeň', 'stonek', 'kořen'], a: 0 },
        { t: 'input', q: 'Jak se jmenují vlákna houby v půdě?', a: ['podhoubí', 'mycelium'] },
        { t: 'choice', q: 'Která houba je smrtelně jedovatá?', o: ['muchomůrka zelená', 'hřib smrkový', 'liška obecná'], a: 0 },
        { t: 'choice', q: 'Čím se houby rozmnožují?', o: ['výtrusy', 'semeny', 'cibulkami'], a: 0 },
        { t: 'tf', q: 'Neznámou houbu je lepší nesbírat.', a: true },
        { t: 'pair', q: 'Spoj houbu s tím, jaká je.', pairs: [['hřib smrkový', 'jedlý'], ['muchomůrka zelená', 'smrtelně jedovatá'], ['bedla vysoká', 'jedlá']] },
        { t: 'tf', q: 'Plíseň na chlebu je také houba.', a: true, why: 'Plísně i kvasinky patří mezi houby.' },
        { t: 'choice', q: 'Co dělá většina hub v lese?', o: ['rozkládá spadané listí a dřevo', 'vyrábí kyslík', 'loví hmyz'], a: 0, why: 'Houby rozkládají odumřelé zbytky a vrací živiny do půdy.' },
        { t: 'order', q: 'Seřaď části houby odshora.', items: ['klobouk', 'třeň', 'podhoubí'] },
        { t: 'open', q: 'Jak se správně chovat při sbírání hub?', a: 'Sbírám jen houby, které bezpečně znám. Houbu opatrně vykroutím nebo uříznu a nešlapu po podhoubí. Neznámé a staré houby nechám v lese.' },
        { t: 'open', q: 'Proč houby nejsou rostliny?', a: 'Nemají zelené barvivo a listy, takže si na světle nevyrobí potravu. Živí se rozkladem zbytků nebo žijí s kořeny stromů.' },
      ],
    },
    {
      id: 'les',
      title: 'Les',
      emoji: '🌲',
      ex: [
        {
          title: 'Les má patra',
          blocks: [
            { t: 'p', text: 'Les je jako dům s **patry**. Každé patro má své obyvatele.' },
            { t: 'table', head: ['Patro', 'Co tam je'], rows: [['stromové', 'smrk, buk, dub, datel'], ['keřové', 'líska, bez, šípek'], ['bylinné', 'borůvky, kapradí, jahody'], ['mechové', 'mech, houby, mravenci'], ['kořenové', 'kořeny, žížaly, krtek']] },
            { t: 'w', w: 'sort', p: { buckets: ['Jehličnatý strom', 'Listnatý strom'], items: [
              { text: 'smrk', b: 0 }, { text: 'dub', b: 1 }, { text: 'borovice', b: 0 }, { text: 'buk', b: 1 },
              { text: 'jedle', b: 0 }, { text: 'bříza', b: 1 }, { text: 'modřín', b: 0 }, { text: 'lípa', b: 1 },
            ] } },
            { t: 'key', text: 'Patra lesa: stromové, keřové, bylinné, mechové a kořenové.' },
          ],
        },
        {
          title: 'Kdo koho jí',
          blocks: [
            { t: 'p', text: 'V lese jeden živí druhého. Tomu se říká **potravní řetězec**.' },
            { t: 'pic', items: ['🌿', '➡️', '🐛', '➡️', '🐦', '➡️', '🦅'], caption: 'list → housenka → sýkora → jestřáb' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'smrk, nebo jedle?', back: 'Smrku šišky visí, jedli stojí nahoru.' },
              { front: 'modřín', back: 'jehličnan, který na zimu shazuje jehlice' },
              { front: 'datel', back: 'tluče do kůry a vybírá hmyz' },
              { front: 'mravenec lesní', back: 'staví mraveniště, je chráněný' },
            ] } },
            { t: 'key', text: 'Les čistí vzduch, zadržuje vodu a je domovem zvířat.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který strom je jehličnatý?', o: ['smrk', 'dub', 'bříza', 'buk'], a: 0 },
        { t: 'tf', q: 'Modřín na zimu shazuje jehlice.', a: true, why: 'Modřín je jediný náš jehličnan, který na zimu opadá.' },
        { t: 'choice', q: 'Ve kterém patře lesa rostou borůvky?', o: ['bylinném', 'stromovém', 'kořenovém'], a: 0 },
        { t: 'order', q: 'Seřaď patra lesa odshora.', items: ['stromové', 'keřové', 'bylinné', 'mechové'] },
        { t: 'choice', q: 'Kterému stromu šišky stojí vzhůru?', o: ['jedli', 'smrku', 'borovici'], a: 0, why: 'Šišky jedle stojí, šišky smrku visí.' },
        { t: 'pair', q: 'Spoj zvíře s tím, co dělá.', pairs: [['datel', 'tluče do kůry'], ['veverka', 'schovává oříšky'], ['mravenec', 'staví mraveniště']] },
        { t: 'order', q: 'Seřaď potravní řetězec.', items: ['list', 'housenka', 'sýkora', 'jestřáb'] },
        { t: 'tf', q: 'Líska je keř.', a: true },
        { t: 'input', q: 'Jak se jmenuje strom, který má plody žaludy?', a: ['dub'] },
        { t: 'choice', q: 'Co les NEdělá?', o: ['vyrábí kyslík', 'zadržuje vodu', 'vyrábí plast'], a: 2 },
        { t: 'open', q: 'Proč je les pro člověka důležitý?', a: 'Les vyrábí kyslík a čistí vzduch. Zadržuje vodu a chrání půdu. Dává dřevo, plody a je domovem mnoha zvířat.' },
        { t: 'open', q: 'Jak se máš chovat v lese?', a: 'Neodhazuji odpadky, nekřičím a neruším zvířata. Nerozdělávám oheň, kde se nesmí, a nelámu stromy.' },
      ],
    },
    {
      id: 'louka',
      title: 'Louka',
      emoji: '🌼',
      ex: [
        {
          title: 'Procházka',
          blocks: [
            { t: 'p', text: 'Na louce rostou hlavně **trávy** a kvetoucí **byliny**. Člověk louku **kosí**.' },
            { t: 'pic', items: ['🌼', '🌾', '🦗', '🐝', '🦋', '🐞'] },
            { t: 'p', text: 'Usušená tráva je **seno** – krmivo pro krávy a koně.' },
            { t: 'w', w: 'sort', p: { buckets: ['Rostlina louky', 'Živočich louky'], items: [
              { text: 'kopretina', b: 0 }, { text: 'kobylka', b: 1 }, { text: 'jetel', b: 0 }, { text: 'čmelák', b: 1 },
              { text: 'pampeliška', b: 0 }, { text: 'krtek', b: 1 }, { text: 'zvonek', b: 0 }, { text: 'motýl', b: 1 },
            ] } },
            { t: 'key', text: 'Louka = trávy + byliny. Člověk ji kosí na seno.' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'pampeliška', back: 'správně smetánka lékařská, žlutý květ, chmýří' },
              { front: 'jetel', back: 'trojčetné lístky, krmivo pro dobytek' },
              { front: 'krtek', back: 'žije pod zemí, žere žížaly a larvy' },
              { front: 'čáp bílý', back: 'loví na louce žáby a hraboše' },
              { front: 'čmelák', back: 'opyluje květy' },
            ] } },
            { t: 'p', text: 'Když se louka nekosí, zaroste keři a pak lesem.' },
            { t: 'key', text: 'Hmyz na louce opyluje květy.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co roste na louce nejvíc?', o: ['trávy a byliny', 'stromy', 'mechy'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje usušená posečená tráva?', a: ['seno'] },
        { t: 'tf', q: 'Krtek se živí žížalami a larvami.', a: true, why: 'Krtek je hmyzožravec, rostliny nežere.' },
        { t: 'choice', q: 'Jak se správně jmenuje pampeliška?', o: ['smetánka lékařská', 'kopretina bílá', 'jetel luční'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['čmelák', 'opyluje květy'], ['krtek', 'žije pod zemí'], ['čáp', 'loví žáby']] },
        { t: 'tf', q: 'Neposečená louka časem zaroste keři a stromy.', a: true },
        { t: 'choice', q: 'Které zvíře NEžije na louce?', o: ['kapr', 'kobylka', 'hraboš'], a: 0 },
        { t: 'choice', q: 'Kolik lístků má většinou jetel?', o: ['3', '5', '7'], a: 0 },
        { t: 'order', q: 'Seřaď, jak vzniká seno.', items: ['tráva roste', 'louka se poseče', 'tráva schne', 'seno se uskladní'] },
        { t: 'tf', q: 'Kopretina je strom.', a: false, why: 'Kopretina je bylina.' },
        { t: 'open', q: 'Proč je na louce tolik hmyzu?', a: 'Na louce kvete mnoho bylin. Hmyz z květů sbírá nektar a pyl a přitom je opyluje.' },
        { t: 'open', q: 'Proč člověk louky kosí?', a: 'Získá seno pro zvířata. Kosení také brání tomu, aby louka zarostla keři a lesem.' },
      ],
    },
    {
      id: 'rybnik-a-potok',
      title: 'Rybník a potok',
      emoji: '🐸',
      ex: [
        {
          title: 'Od břehu k vodě',
          blocks: [
            { t: 'p', text: '**Rybník** postavil člověk pro chov ryb. **Jezero** vzniklo samo.' },
            { t: 'table', head: ['Kde', 'Rostliny', 'Živočichové'], rows: [['na břehu', 'vrba, olše, rákos', 'volavka, ondatra'], ['na hladině', 'leknín, okřehek', 'kachna, labuť, bruslařka'], ['ve vodě', 'stulík, řasy', 'kapr, štika, žába, čolek']] },
            { t: 'p', text: 'Největší český rybník je **Rožmberk** na Třeboňsku.' },
            { t: 'key', text: 'Rybník je umělá vodní nádrž pro chov ryb, hlavně kaprů.' },
          ],
        },
        {
          title: 'Ze žabky',
          blocks: [
            { t: 'p', text: 'Žába se mění. Sleduj její **vývoj**.' },
            { t: 'w', w: 'cycle', p: { steps: ['Žába naklade vajíčka (žabí kuřičku)', 'Z vajíček se líhnou pulci', 'Pulcům rostou nohy, mizí ocásek', 'Malá žabka vyleze na břeh', 'Dospělá žába'] } },
            { t: 'p', text: 'V čistém **potoce** žije **pstruh**, **rak říční** a loví tam **ledňáček**.' },
            { t: 'w', w: 'sort', p: { buckets: ['Rybník', 'Potok'], items: [
              { text: 'kapr', b: 0 }, { text: 'pstruh', b: 1 }, { text: 'leknín', b: 0 }, { text: 'rak říční', b: 1 },
              { text: 'labuť', b: 0 }, { text: 'skorec vodní', b: 1 },
            ] } },
            { t: 'key', text: 'Žába: vajíčko → pulec → žabka → žába.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Rybník postavil člověk.', a: true },
        { t: 'choice', q: 'Kterou rybu chováme v rybnících nejvíc?', o: ['kapra', 'pstruha', 'žraloka'], a: 0 },
        { t: 'order', q: 'Seřaď vývoj žáby.', items: ['vajíčko', 'pulec', 'žabka', 'žába'] },
        { t: 'input', q: 'Jak se jmenuje larva žáby?', a: ['pulec'] },
        { t: 'choice', q: 'Která rostlina plave na hladině?', o: ['leknín', 'smrk', 'jetel'], a: 0 },
        { t: 'choice', q: 'Který pták loví ryby v potoce a má modré peří?', o: ['ledňáček', 'vrabec', 'čáp'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['štika', 'dravá ryba'], ['rákos', 'roste u břehu'], ['volavka', 'brodí se a loví']] },
        { t: 'tf', q: 'Pstruh potřebuje čistou studenou vodu.', a: true },
        { t: 'input', q: 'Jak se jmenuje největší rybník v Česku?', a: ['Rožmberk'] },
        { t: 'choice', q: 'Čím se liší jezero od rybníka?', o: ['jezero vzniklo přirozeně', 'jezero je vždy menší', 'v jezeře nejsou ryby'], a: 0 },
        { t: 'open', q: 'Popiš vývoj žáby.', a: 'Žába naklade vajíčka do vody. Vylíhnou se pulci, kteří dýchají žábrami. Narostou jim nohy, ztratí ocásek a vyleze malá žabka, která doroste v žábu.' },
        { t: 'open', q: 'Jmenuj tři živočichy a tři rostliny rybníka.', a: 'Živočichové: kapr, štika, žába, kachna, labuť, volavka. Rostliny: rákos, orobinec, leknín, okřehek.' },
      ],
    },
    {
      id: 'pole-a-zahrada',
      title: 'Pole a zahrada',
      emoji: '🌾',
      ex: [
        {
          title: 'Co se pěstuje',
          blocks: [
            { t: 'p', text: 'Na poli pěstuje člověk plodiny pro jídlo a krmení zvířat.' },
            { t: 'table', head: ['Skupina', 'Příklady', 'Co z nich je'], rows: [['obilniny', 'pšenice, žito, ječmen, oves, kukuřice', 'mouka, chléb, krmivo'], ['okopaniny', 'brambory, cukrová řepa', 'jídlo, cukr'], ['olejniny', 'řepka olejka, slunečnice', 'olej']] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'pšenice', back: 'mouka na chléb a pečivo' },
              { front: 'ječmen', back: 'kroupy, slad, krmivo' },
              { front: 'cukrová řepa', back: 'cukr' },
              { front: 'řepka olejka', back: 'žlutě kvete, olej' },
            ] } },
            { t: 'key', text: 'Obilniny, okopaniny, olejniny – hlavní plodiny polí.' },
          ],
        },
        {
          title: 'Na zahradě',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Ovoce', 'Zelenina'], items: [
              { text: 'jablko', b: 0 }, { text: 'mrkev', b: 1 }, { text: 'hruška', b: 0 }, { text: 'okurka', b: 1 },
              { text: 'třešně', b: 0 }, { text: 'cibule', b: 1 }, { text: 'švestky', b: 0 }, { text: 'salát', b: 1 },
            ] } },
            { t: 'p', text: '**Mšice** sají šťávy rostlin. **Slunéčko sedmitečné** mšice žere – je to pomocník.' },
            { t: 'p', text: 'Na poli žije zajíc polní, koroptev, bažant, skřivan a hraboš.' },
            { t: 'key', text: 'Zahrada užitková = ovoce a zelenina. Okrasná = květiny.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která rostlina je obilnina?', o: ['pšenice', 'brambora', 'řepka'], a: 0 },
        { t: 'choice', q: 'Z čeho se vyrábí cukr?', o: ['z cukrové řepy', 'z ovsa', 'z mrkve'], a: 0 },
        { t: 'tf', q: 'Řepka olejka kvete žlutě a vyrábí se z ní olej.', a: true },
        { t: 'pair', q: 'Spoj plodinu se skupinou.', pairs: [['žito', 'obilnina'], ['brambory', 'okopanina'], ['slunečnice', 'olejnina']] },
        { t: 'choice', q: 'Kdo je na zahradě pomocník, protože žere mšice?', o: ['slunéčko sedmitečné', 'slimák', 'hraboš'], a: 0 },
        { t: 'tf', q: 'Okurka je ovoce.', a: false, why: 'Okurku pěstujeme a jíme jako zeleninu.' },
        { t: 'choice', q: 'Které zvíře žije na poli?', o: ['zajíc polní', 'pstruh', 'veverka'], a: 0 },
        { t: 'order', q: 'Seřaď cestu od zrna k chlebu.', items: ['pšenice roste', 'sklizeň kombajnem', 'mletí na mouku', 'pečení chleba'] },
        { t: 'input', q: 'Z obilí se ve mlýně mele…', a: ['mouka'] },
        { t: 'tf', q: 'Kukuřice patří mezi obilniny.', a: true },
        { t: 'open', q: 'Jmenuj tři obilniny a co z nich člověk má.', a: 'Pšenice – mouka na chléb. Žito – žitná mouka. Ječmen – krmivo a slad. Oves – ovesné vločky. Kukuřice – krmivo a jídlo.' },
        { t: 'open', q: 'Jaký je rozdíl mezi užitkovou a okrasnou zahradou?', a: 'Na užitkové zahradě pěstujeme ovoce a zeleninu k jídlu. Okrasná zahrada má květiny a keře pro krásu.' },
      ],
    },
    {
      id: 'trideni-zivocichu',
      title: 'Třídění živočichů',
      emoji: '🐾',
      ex: [
        {
          title: 'Podle páteře',
          blocks: [
            { t: 'p', text: '**Obratlovci** mají páteř. **Bezobratlí** ji nemají.' },
            { t: 'table', head: ['Obratlovci', 'Poznávací znak'], rows: [['ryby', 'šupiny, žábry, ploutve'], ['obojživelníci', 'holá vlhká kůže, pulci ve vodě'], ['plazi', 'suchá kůže se šupinami'], ['ptáci', 'peří, zobák, křídla'], ['savci', 'srst, mláďata sají mléko']] },
            { t: 'w', w: 'sort', p: { buckets: ['Savec', 'Pták', 'Plaz'], items: [
              { text: 'netopýr', b: 0 }, { text: 'tučňák', b: 1 }, { text: 'ještěrka', b: 2 }, { text: 'velryba', b: 0 },
              { text: 'čáp', b: 1 }, { text: 'želva', b: 2 }, { text: 'ježek', b: 0 }, { text: 'slepýš', b: 2 }, { text: 'sova', b: 1 },
            ] } },
            { t: 'key', text: 'Obratlovci: ryby, obojživelníci, plazi, ptáci, savci.' },
          ],
        },
        {
          title: 'Počítej nohy',
          blocks: [
            { t: 'p', text: 'Bezobratlé poznáš často podle nohou.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'hmyz', back: '6 nohou, tělo ze 3 částí (moucha, včela, brouk)' },
              { front: 'pavouci', back: '8 nohou' },
              { front: 'korýši', back: 'krunýř, např. rak' },
              { front: 'měkkýši', back: 'měkké tělo, často ulita (hlemýžď)' },
              { front: 'kroužkovci', back: 'tělo z kroužků (žížala)' },
            ] } },
            { t: 'w', w: 'sort', p: { buckets: ['Obratlovec', 'Bezobratlý'], items: [
              { text: 'kapr', b: 0 }, { text: 'žížala', b: 1 }, { text: 'skokan', b: 0 }, { text: 'pavouk', b: 1 },
              { text: 'vrabec', b: 0 }, { text: 'hlemýžď', b: 1 }, { text: 'liška', b: 0 }, { text: 'motýl', b: 1 },
            ] } },
            { t: 'key', text: 'Hmyz má 6 nohou, pavouk 8.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'Netopýr je pták.', a: false, why: 'Netopýr má srst a mláďata kojí – je to savec.' },
        { t: 'choice', q: 'Kolik nohou má hmyz?', o: ['6', '8', '4', '10'], a: 0 },
        { t: 'input', q: 'Kolik nohou má pavouk? Napiš číslo.', a: ['8'] },
        { t: 'choice', q: 'Kam patří velryba?', o: ['savci', 'ryby', 'obojživelníci'], a: 0, why: 'Velryba dýchá plícemi a kojí mláďata.' },
        { t: 'choice', q: 'Kdo je obojživelník?', o: ['čolek', 'ještěrka', 'kapr'], a: 0, why: 'Čolek má vlhkou kůži a larvy ve vodě.' },
        { t: 'pair', q: 'Spoj skupinu se znakem.', pairs: [['ptáci', 'peří'], ['savci', 'srst'], ['ryby', 'žábry'], ['plazi', 'suché šupiny']] },
        { t: 'tf', q: 'Slepýš je had.', a: false, why: 'Slepýš je beznohá ještěrka. Je to ale plaz.' },
        { t: 'choice', q: 'Kdo je bezobratlý?', o: ['žížala', 'žába', 'vrána'], a: 0 },
        { t: 'tf', q: 'Tučňák je pták, i když nelétá.', a: true },
        { t: 'order', q: 'Seřaď části těla hmyzu odpředu.', items: ['hlava', 'hruď', 'zadeček'] },
        { t: 'open', q: 'Podle čeho poznáš savce?', a: 'Savci mají srst a mláďata krmí mlékem. Dýchají plícemi a většina rodí živá mláďata.' },
        { t: 'open', q: 'Jaký je rozdíl mezi obratlovci a bezobratlými? Uveď příklady.', a: 'Obratlovci mají páteř, například ryba, žába, pták nebo pes. Bezobratlí páteř nemají, například hmyz, pavouk, žížala nebo hlemýžď.' },
      ],
    },
    {
      id: 'ochrana-prirody',
      title: 'Ochrana přírody',
      emoji: '♻️',
      ex: [
        {
          title: 'Co můžu já',
          blocks: [
            { t: 'list', items: ['Třídím odpad.', 'Šetřím vodou a světlem.', 'V přírodě neodhazuji odpadky.', 'Netrhám chráněné rostliny.'] },
            { t: 'w', w: 'sort', p: { buckets: ['Žlutý – plast', 'Modrý – papír', 'Zelený – sklo'], items: [
              { text: 'PET láhev', b: 0 }, { text: 'noviny', b: 1 }, { text: 'sklenice od okurek', b: 2 }, { text: 'kelímek od jogurtu', b: 0 },
              { text: 'krabice z kartonu', b: 1 }, { text: 'láhev od sirupu (sklo)', b: 2 },
            ] } },
            { t: 'key', text: 'Žlutá = plast, modrá = papír, zelená = sklo.' },
          ],
        },
        {
          title: 'Chráněná území',
          blocks: [
            { t: 'p', text: 'Nejvzácnější příroda je chráněná v **národních parcích**. V Česku jsou čtyři.' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1963, label: 'Krkonošský národní park' },
              { year: 1991, label: 'Šumava a Podyjí' },
              { year: 2000, label: 'České Švýcarsko' },
            ] } },
            { t: 'p', text: 'Další chráněná území jsou **CHKO** – chráněné krajinné oblasti, třeba Český ráj.' },
            { t: 'p', text: 'Chráněná zvířata: rys ostrovid, vydra říční, čáp černý.' },
            { t: 'key', text: 'Česko má 4 národní parky.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Do jaké barvy kontejneru patří plast?', o: ['žluté', 'modré', 'zelené'], a: 0 },
        { t: 'choice', q: 'Do jaké barvy kontejneru patří papír?', o: ['modré', 'žluté', 'hnědé'], a: 0 },
        { t: 'input', q: 'Kolik národních parků má Česko? Napiš číslo.', a: ['4'] },
        { t: 'choice', q: 'Který národní park je u nás nejstarší?', o: ['Krkonošský', 'Šumava', 'České Švýcarsko'], a: 0, why: 'Krkonošský národní park vznikl roku 1963.' },
        { t: 'tf', q: 'V národním parku se smí trhat všechny rostliny.', a: false },
        { t: 'pair', q: 'Spoj odpad s kontejnerem.', pairs: [['noviny', 'modrý'], ['PET láhev', 'žlutý'], ['sklenice', 'zelený']] },
        { t: 'choice', q: 'Co znamená zkratka CHKO?', o: ['chráněná krajinná oblast', 'chráněná krásná obec', 'chovná krajina oblasti'], a: 0 },
        { t: 'tf', q: 'Rys ostrovid je u nás chráněný.', a: true },
        { t: 'order', q: 'Seřaď národní parky podle vzniku.', items: ['Krkonošský', 'Šumava', 'České Švýcarsko'] },
        { t: 'choice', q: 'Co pomáhá přírodě?', o: ['zhasnout, když odcházím', 'nechat téct vodu', 'vyhodit láhev do lesa'], a: 0 },
        { t: 'open', q: 'Jak můžeš ty sám chránit přírodu?', a: 'Třídím odpad a neodhazuji ho v přírodě. Šetřím vodou a elektřinou. Netrhám chráněné rostliny a neruším zvířata.' },
        { t: 'open', q: 'Proč se odpad třídí?', a: 'Z vytříděného papíru, plastu a skla se vyrobí nové věci. Ušetří se suroviny a na skládkách je méně odpadu.' },
      ],
    },
  ],
} satisfies Subject
