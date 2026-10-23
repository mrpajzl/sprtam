import type { Subject } from '../../types'

export default {
  grade: 'z3',
  subject: 'prvouka',
  topics: [
    {
      id: 'obec-a-mapa',
      title: 'Obec, plán a mapa',
      emoji: '🗺️',
      ex: [
        {
          title: 'Pohled ptáka',
          blocks: [
            { t: 'p', text: '**Plán** a **mapa** ukazují místo shora, jako by ho viděl pták.' },
            { t: 'list', items: ['Plán = malé místo (třída, obec).', 'Mapa = velké území (kraj, stát).'] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'modrá', back: 'voda – řeky, rybníky' },
              { front: 'zelená', back: 'nížiny' },
              { front: 'hnědá', back: 'hory' },
              { front: 'černá čára s příčkami', back: 'železnice' },
            ] } },
            { t: 'key', text: 'Mapa je zmenšený obrázek krajiny shora.' },
          ],
        },
        {
          title: 'Moje obec',
          blocks: [
            { t: 'p', text: 'Obec vede **starosta** a **zastupitelstvo**. Sídlí na **obecním** (městském) **úřadě**.' },
            { t: 'w', w: 'sort', p: { buckets: ['Úřady a služby 🏛️', 'Volný čas ⚽'], items: [
              { text: 'obecní úřad', b: 0 }, { text: 'pošta', b: 0 }, { text: 'lékárna', b: 0 }, { text: 'policie', b: 0 },
              { text: 'hřiště', b: 1 }, { text: 'kino', b: 1 }, { text: 'bazén', b: 1 }, { text: 'park', b: 1 },
            ] } },
            { t: 'key', text: 'Velká obec = město. Malá obec = vesnice.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo vede obec?', o: ['starosta', 'ředitel školy', 'policista'], a: 0 },
        { t: 'choice', q: 'Jakou barvou je na mapě voda?', o: ['modrou', 'hnědou', 'zelenou'], a: 0 },
        { t: 'choice', q: 'Jakou barvou jsou na mapě hory?', o: ['hnědou', 'modrou', 'zelenou'], a: 0 },
        { t: 'tf', q: 'Plán zobrazuje menší místo než mapa.', a: true },
        { t: 'tf', q: 'Mapa zobrazuje krajinu zboku.', a: false, why: 'Mapa ukazuje krajinu shora.' },
        { t: 'input', q: 'Jak se jmenuje vysvětlivka značek na mapě? (začíná na „l“)', a: ['legenda'] },
        { t: 'pair', q: 'Spoj barvu na mapě.', pairs: [['modrá', 'voda'], ['zelená', 'nížina'], ['hnědá', 'hory']] },
        { t: 'order', q: 'Seřaď od nejmenšího.', items: ['třída', 'škola', 'obec', 'stát'] },
        { t: 'choice', q: 'Kde sídlí starosta?', o: ['na obecním úřadě', 'na poště', 'v nemocnici'], a: 0 },
        { t: 'tf', q: 'Každá obec má svůj název.', a: true },
        { t: 'open', q: 'Jaký je rozdíl mezi plánem a mapou?', a: 'Oba ukazují místo shora. Plán ukazuje malé místo (třeba obec), mapa velké území (kraj, stát).' },
        { t: 'open', q: 'Popiš cestu z domova do školy.', a: 'Řeknu, kudy jdu, kolem čeho, kde přecházím silnici a jak dlouho to trvá.' },
      ],
    },
    {
      id: 'svetove-strany',
      title: 'Světové strany a orientace',
      emoji: '🧭',
      ex: [
        {
          title: 'Podle Slunce',
          blocks: [
            { t: 'p', text: 'Slunce ráno **vychází na východě**, v poledne je na **jihu** a večer **zapadá na západě**.' },
            { t: 'w', w: 'cycle', p: { steps: ['ráno: východ ☀️', 'poledne: jih 🌞', 'večer: západ 🌇', 'noc: Slunce není vidět 🌙'] } },
            { t: 'key', text: 'Východ – ráno, západ – večer.' },
          ],
        },
        {
          title: 'Kompas',
          blocks: [
            { t: 'p', text: 'Čtyři hlavní světové strany: **sever (S)**, **jih (J)**, **východ (V)**, **západ (Z)**.' },
            { t: 'steps', items: ['Kompas polož vodorovně.', 'Střelka ukáže na **sever**.', 'Za zády máš jih.', 'Vpravo je východ, vlevo západ.'] },
            { t: 'key', text: 'Na mapě je sever vždy nahoře.' },
            { t: 'example', q: 'Stojíš čelem k severu. Co máš po pravé ruce?', a: 'Východ.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik je hlavních světových stran?', a: ['4', 'čtyři'] },
        { t: 'choice', q: 'Kde Slunce vychází?', o: ['na východě', 'na západě', 'na severu'], a: 0 },
        { t: 'choice', q: 'Kde Slunce zapadá?', o: ['na západě', 'na východě', 'na jihu'], a: 0 },
        { t: 'choice', q: 'Kam ukazuje střelka kompasu?', o: ['na sever', 'na jih', 'na západ'], a: 0 },
        { t: 'tf', q: 'Na mapě je sever nahoře.', a: true },
        { t: 'tf', q: 'V poledne je u nás Slunce na severu.', a: false, why: 'V poledne je Slunce na jihu.' },
        { t: 'pair', q: 'Spoj zkratku.', pairs: [['S', 'sever'], ['J', 'jih'], ['V', 'východ'], ['Z', 'západ']] },
        { t: 'choice', q: 'Která strana je naproti severu?', o: ['jih', 'východ', 'západ'], a: 0 },
        { t: 'order', q: 'Seřaď, kde je Slunce během dne.', items: ['východ', 'jih', 'západ'] },
        { t: 'choice', q: 'Stojíš čelem k severu. Co máš vlevo?', o: ['západ', 'východ', 'jih'], a: 0 },
        { t: 'open', q: 'Jak určíš sever bez kompasu?', a: 'Podle Slunce: v poledne je na jihu, takže sever mám za zády. Ráno je Slunce na východě.' },
        { t: 'open', q: 'Jak se používá kompas?', a: 'Položím ho vodorovně. Střelka ukáže sever, za mnou je jih, vpravo východ a vlevo západ.' },
      ],
    },
    {
      id: 'ceska-republika',
      title: 'Naše vlast – Česká republika',
      emoji: '🇨🇿',
      ex: [
        {
          title: 'Symboly',
          blocks: [
            { t: 'p', text: 'Žijeme v **České republice**. Hlavní město je **Praha**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Státní vlajka', back: 'bílý a červený pruh, modrý klín' },
              { front: 'Státní hymna', back: 'Kde domov můj' },
              { front: 'Státní znak', back: 'český lev, moravská a slezská orlice' },
              { front: 'Hlavní město', back: 'Praha' },
              { front: 'Nejvyšší hora', back: 'Sněžka (1603 m)' },
            ] } },
            { t: 'key', text: 'Česká republika, hlavní město Praha, hymna Kde domov můj.' },
          ],
        },
        {
          title: 'Sousedé',
          blocks: [
            { t: 'p', text: 'Česko leží ve středu **Evropy**. Nemá moře.' },
            { t: 'table', head: ['Kde', 'Soused'], rows: [['na severu', 'Polsko'], ['na západě', 'Německo'], ['na jihu', 'Rakousko'], ['na východě', 'Slovensko']] },
            { t: 'p', text: 'ČR tvoří tři země: **Čechy**, **Morava** a **Slezsko**.' },
            { t: 'key', text: 'Máme 4 sousedy: Německo, Polsko, Slovensko, Rakousko.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Jak se jmenuje hlavní město ČR?', a: ['Praha'] },
        { t: 'choice', q: 'Jak se jmenuje česká hymna?', o: ['Kde domov můj', 'Ach synku', 'Prší, prší'], a: 0 },
        { t: 'choice', q: 'Která hora je u nás nejvyšší?', o: ['Sněžka', 'Říp', 'Praděd'], a: 0 },
        { t: 'input', q: 'Kolik metrů měří Sněžka?', a: ['1603'] },
        { t: 'choice', q: 'Který stát nesousedí s ČR?', o: ['Itálie', 'Polsko', 'Rakousko'], a: 0 },
        { t: 'tf', q: 'Česká republika leží u moře.', a: false, why: 'ČR nemá moře, leží ve vnitrozemí.' },
        { t: 'tf', q: 'Ve státním znaku je český lev.', a: true },
        { t: 'pair', q: 'Spoj souseda a stranu.', pairs: [['Polsko', 'sever'], ['Rakousko', 'jih'], ['Německo', 'západ'], ['Slovensko', 'východ']] },
        { t: 'choice', q: 'Která řeka protéká Prahou?', o: ['Vltava', 'Morava', 'Odra'], a: 0 },
        { t: 'order', q: 'Seřaď od nejmenšího.', items: ['obec', 'kraj', 'Česká republika', 'Evropa'] },
        { t: 'open', q: 'Vyjmenuj státní symboly ČR, které znáš.', a: 'Státní vlajka, státní znak, hymna Kde domov můj, státní barvy (bílá, červená, modrá).' },
        { t: 'open', q: 'Se kterými státy sousedí Česká republika?', a: 'S Německem, Polskem, Slovenskem a Rakouskem.' },
      ],
    },
    {
      id: 'ziva-a-neziva',
      title: 'Živá a neživá příroda',
      emoji: '🌍',
      ex: [
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Živá 🌱', 'Neživá 🪨'], items: [
              { text: 'strom', b: 0 }, { text: 'houba', b: 0 }, { text: 'motýl', b: 0 }, { text: 'člověk', b: 0 },
              { text: 'kámen', b: 1 }, { text: 'voda', b: 1 }, { text: 'vzduch', b: 1 }, { text: 'Slunce', b: 1 },
            ] } },
            { t: 'key', text: 'Živé roste, dýchá, jí a má potomky.' },
          ],
        },
        {
          title: 'Znaky života',
          blocks: [
            { t: 'p', text: 'Co dělá každý živý organismus?' },
            { t: 'list', items: ['dýchá 💨', 'přijímá potravu 🍽️', 'roste 📏', 'rozmnožuje se 🐣', 'reaguje na okolí 👀', 'jednou zemře'] },
            { t: 'w', w: 'cycle', p: { steps: ['semínko 🌰', 'klíček 🌱', 'rostlina 🌿', 'květ 🌸', 'plod se semeny 🍎'] } },
            { t: 'key', text: 'Neživá příroda (voda, vzduch, světlo, půda) je potřebná pro život.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co patří do živé přírody?', o: ['ježek', 'kámen', 'voda'], a: 0 },
        { t: 'choice', q: 'Co patří do neživé přírody?', o: ['vzduch', 'tráva', 'pes'], a: 0 },
        { t: 'tf', q: 'Kámen roste a dýchá.', a: false, why: 'Kámen je neživý – neroste ani nedýchá.' },
        { t: 'tf', q: 'Rostliny také dýchají.', a: true },
        { t: 'tf', q: 'Houby patří do živé přírody.', a: true },
        { t: 'order', q: 'Seřaď růst rostliny.', items: ['semeno', 'klíček', 'rostlina', 'květ', 'plod'] },
        { t: 'choice', q: 'Co potřebuje každý živý organismus?', o: ['vodu', 'televizi', 'peníze'], a: 0 },
        { t: 'input', q: 'Doplň: Živé organismy se ………… (mají potomky). Slovo na „r“.', a: ['rozmnožují', 'rozmnožují se'] },
        { t: 'pair', q: 'Spoj.', pairs: [['Slunce', 'světlo a teplo'], ['voda', 'pití'], ['vzduch', 'dýchání']] },
        { t: 'choice', q: 'Kterou věc vyrobil člověk?', o: ['židle', 'strom', 'kámen'], a: 0, why: 'Židle není příroda, vyrobil ji člověk.' },
        { t: 'open', q: 'Podle čeho poznáš, že je něco živé?', a: 'Živé dýchá, přijímá potravu, roste, rozmnožuje se, reaguje na okolí a jednou zemře.' },
        { t: 'open', q: 'Jmenuj čtyři věci z neživé přírody.', a: 'Voda, vzduch, kameny (horniny), půda, sluneční světlo.' },
      ],
    },
    {
      id: 'voda-vzduch-puda',
      title: 'Voda, vzduch, půda',
      emoji: '💧',
      ex: [
        {
          title: 'Koloběh vody',
          blocks: [
            { t: 'p', text: 'Voda pořád putuje kolem dokola.' },
            { t: 'w', w: 'cycle', p: { steps: ['Slunce ohřeje vodu ☀️', 'voda se vypaří ♨️', 'vzniknou mraky ☁️', 'prší nebo sněží 🌧️', 'voda teče do řek a moří 🌊'] } },
            { t: 'key', text: 'Voda se vypaří, udělá mraky a spadne jako déšť.' },
          ],
        },
        {
          title: 'Tři podoby vody',
          blocks: [
            { t: 'table', head: ['Skupenství', 'Příklad'], rows: [['pevné', 'led, sníh'], ['kapalné', 'voda v řece'], ['plynné', 'pára']] },
            { t: 'list', items: ['Pod 0 °C voda mrzne na led.', 'Při 100 °C se voda vaří.'] },
            { t: 'p', text: '**Vzduch** potřebujeme k dýchání. **Půda** živí rostliny.' },
            { t: 'key', text: 'Voda: led – voda – pára.' },
            { t: 'example', q: 'Co se stane s ledem v teplé místnosti?', a: 'Roztaje a změní se na vodu.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Při kolika stupních mrzne voda?', o: ['0 °C', '100 °C', '20 °C'], a: 0 },
        { t: 'input', q: 'Při kolika °C se voda vaří?', a: ['100'] },
        { t: 'choice', q: 'Led je voda ve skupenství…', o: ['pevném', 'kapalném', 'plynném'], a: 0 },
        { t: 'choice', q: 'Pára je voda ve skupenství…', o: ['plynném', 'pevném', 'kapalném'], a: 0 },
        { t: 'order', q: 'Seřaď koloběh vody.', items: ['vypaření', 'mraky', 'déšť', 'řeka'] },
        { t: 'tf', q: 'Vzduch je vidět.', a: false, why: 'Vzduch je neviditelný, ale cítíme ho třeba jako vítr.' },
        { t: 'tf', q: 'Bez vzduchu nemůžeme žít.', a: true },
        { t: 'tf', q: 'Voda v moři je slaná.', a: true },
        { t: 'pair', q: 'Spoj.', pairs: [['led', 'pevné'], ['voda', 'kapalné'], ['pára', 'plynné']] },
        { t: 'choice', q: 'Kde žijí žížaly a roste kořen?', o: ['v půdě', 've vzduchu', 'v mracích'], a: 0 },
        { t: 'open', q: 'Popiš koloběh vody.', a: 'Slunce ohřeje vodu, ta se vypaří. Pára vytvoří mraky. Z mraků prší nebo sněží a voda teče do řek a moří.' },
        { t: 'open', q: 'Proč musíme šetřit vodou?', a: 'Čisté pitné vody je málo a potřebují ji lidé, zvířata i rostliny.' },
      ],
    },
    {
      id: 'mereni',
      title: 'Měření a jednotky',
      emoji: '📏',
      ex: [
        {
          title: 'Čím měříme',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '📏 metr, pravítko', back: 'délka (m, cm)' },
              { front: '⚖️ váha', back: 'hmotnost (kg, g)' },
              { front: '🌡️ teploměr', back: 'teplota (°C)' },
              { front: '⏱️ hodiny, stopky', back: 'čas (h, min, s)' },
              { front: '🫙 odměrka', back: 'objem (l)' },
            ] } },
            { t: 'key', text: 'Každá veličina má svůj přístroj a jednotku.' },
          ],
        },
        {
          title: 'Převody',
          blocks: [
            { t: 'table', head: ['Veličina', 'Převod'], rows: [['délka', '1 m = 100 cm'], ['délka', '1 km = 1000 m'], ['hmotnost', '1 kg = 1000 g'], ['čas', '1 h = 60 min']] },
            { t: 'w', w: 'bars', p: { unit: 'cm', items: [{ label: 'pravítko', value: 30 }, { label: 'žák 3. třídy', value: 130 }, { label: 'dveře', value: 200 }] } },
            { t: 'key', text: '1 m = 100 cm, 1 kg = 1000 g.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Čím měříme teplotu?', o: ['teploměrem', 'váhou', 'pravítkem'], a: 0 },
        { t: 'choice', q: 'Čím měříme hmotnost?', o: ['váhou', 'teploměrem', 'hodinami'], a: 0 },
        { t: 'input', q: 'Kolik centimetrů má 1 metr?', a: ['100'] },
        { t: 'input', q: 'Kolik gramů má 1 kilogram?', a: ['1000'] },
        { t: 'input', q: 'Kolik metrů má 1 kilometr?', a: ['1000'] },
        { t: 'pair', q: 'Spoj veličinu a jednotku.', pairs: [['délka', 'metr'], ['hmotnost', 'kilogram'], ['teplota', 'stupeň Celsia'], ['čas', 'hodina']] },
        { t: 'tf', q: 'Mléko kupujeme v litrech.', a: true },
        { t: 'tf', q: 'Délku silnice měříme v gramech.', a: false, why: 'Délku měříme v metrech a kilometrech. Gram je hmotnost.' },
        { t: 'order', q: 'Seřaď od nejkratšího.', items: ['1 cm', '1 m', '1 km'] },
        { t: 'choice', q: 'Co je těžší?', o: ['1 kg peří', 'oboje stejně', '1 kg železa'], a: 1, why: 'Kilogram je vždycky kilogram.' },
        { t: 'open', q: 'Jaké přístroje na měření znáš a co měří?', a: 'Pravítko a metr měří délku, váha hmotnost, teploměr teplotu, hodiny čas a odměrka objem.' },
        { t: 'open', q: 'Proč potřebujeme jednotky?', a: 'Aby všichni měřili stejně a rozuměli si, například 2 m nebo 3 kg.' },
      ],
    },
    {
      id: 'rostliny-a-houby',
      title: 'Rostliny a houby',
      emoji: '🍄',
      ex: [
        {
          title: 'Části rostliny',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'kořen', back: 'drží rostlinu v půdě, saje vodu' },
              { front: 'stonek', back: 'nese listy a květy, vede vodu' },
              { front: 'list', back: 'vyrábí potravu ze světla' },
              { front: 'květ', back: 'z něj vznikne plod' },
              { front: 'plod', back: 'chrání semena' },
            ] } },
            { t: 'p', text: '**Byliny** mají měkký stonek. **Dřeviny** (stromy, keře) mají dřevo.' },
            { t: 'key', text: 'Kořen, stonek, list, květ, plod.' },
          ],
        },
        {
          title: 'Houbařem',
          blocks: [
            { t: 'p', text: 'Houba není rostlina. Pod zemí má **podhoubí**, nad zemí **plodnici** (klobouk a třeň).' },
            { t: 'w', w: 'sort', p: { buckets: ['Jedlá 😋', 'Jedovatá ☠️'], items: [
              { text: 'hřib smrkový', b: 0 }, { text: 'bedla vysoká', b: 0 }, { text: 'liška obecná', b: 0 },
              { text: 'muchomůrka zelená', b: 1 }, { text: 'muchomůrka červená', b: 1 }, { text: 'hřib satan', b: 1 },
            ] } },
            { t: 'key', text: 'Houbu, kterou neznám, nesbírám.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která část saje vodu z půdy?', o: ['kořen', 'květ', 'list'], a: 0 },
        { t: 'choice', q: 'Z čeho vznikne plod?', o: ['z květu', 'z kořene', 'ze stonku'], a: 0 },
        { t: 'choice', q: 'Která houba je smrtelně jedovatá?', o: ['muchomůrka zelená', 'hřib smrkový', 'bedla vysoká'], a: 0 },
        { t: 'tf', q: 'Houba je rostlina.', a: false, why: 'Houby jsou samostatná skupina organismů.' },
        { t: 'tf', q: 'Stromy a keře jsou dřeviny.', a: true },
        { t: 'input', q: 'Jak se jmenuje část houby pod zemí?', a: ['podhoubí'] },
        { t: 'pair', q: 'Spoj část rostliny a úkol.', pairs: [['kořen', 'saje vodu'], ['list', 'vyrábí potravu'], ['plod', 'chrání semena']] },
        { t: 'order', q: 'Seřaď zdola nahoru.', items: ['kořen', 'stonek', 'list', 'květ'] },
        { t: 'choice', q: 'Co je bylina?', o: ['pampeliška', 'dub', 'líska'], a: 0 },
        { t: 'tf', q: 'Houby rostou hlavně v teplém a vlhkém počasí.', a: true },
        { t: 'open', q: 'Z jakých částí se skládá rostlina a k čemu slouží?', a: 'Kořen drží rostlinu a saje vodu, stonek ji nese, listy vyrábějí potravu, z květu vznikne plod se semeny.' },
        { t: 'open', q: 'Jak se správně chováš při sběru hub?', a: 'Sbírám jen houby, které dobře znám. Neznámé nechám v lese. Podhoubí neničím.' },
      ],
    },
    {
      id: 'zivocichove',
      title: 'Živočichové a jejich třídění',
      emoji: '🐾',
      ex: [
        {
          title: 'Podle těla',
          blocks: [
            { t: 'table', head: ['Skupina', 'Tělo kryje', 'Příklad'], rows: [['savci', 'srst', 'pes, netopýr'], ['ptáci', 'peří', 'sýkora, tučňák'], ['ryby', 'šupiny', 'kapr'], ['plazi', 'šupiny', 'ještěrka, zmije'], ['obojživelníci', 'holá vlhká kůže', 'žába, čolek']] },
            { t: 'key', text: 'Savci kojí mláďata mlékem.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Savci 🐻', 'Ptáci 🐦', 'Hmyz 🐞'], items: [
              { text: 'medvěd', b: 0 }, { text: 'netopýr', b: 0 }, { text: 'velryba', b: 0 },
              { text: 'čáp', b: 1 }, { text: 'tučňák', b: 1 }, { text: 'sova', b: 1 },
              { text: 'včela', b: 2 }, { text: 'mravenec', b: 2 }, { text: 'beruška', b: 2 },
            ] } },
            { t: 'p', text: 'Hmyz má **6 nohou**. Pavouk má **8 nohou** – není to hmyz.' },
            { t: 'key', text: 'Netopýr i velryba jsou savci.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který živočich je savec?', o: ['netopýr', 'čáp', 'kapr'], a: 0, why: 'Netopýr kojí mláďata – je to savec.' },
        { t: 'choice', q: 'Který živočich je pták?', o: ['tučňák', 'velryba', 'čolek'], a: 0 },
        { t: 'input', q: 'Kolik nohou má hmyz?', a: ['6', 'šest'] },
        { t: 'input', q: 'Kolik nohou má pavouk?', a: ['8', 'osm'] },
        { t: 'tf', q: 'Velryba je ryba.', a: false, why: 'Velryba je savec – dýchá plícemi a kojí mláďata.' },
        { t: 'tf', q: 'Ptáci mají peří a snášejí vejce.', a: true },
        { t: 'choice', q: 'Čím dýchají ryby?', o: ['žábrami', 'plícemi', 'kůží'], a: 0 },
        { t: 'pair', q: 'Spoj živočicha a skupinu.', pairs: [['žába', 'obojživelník'], ['ještěrka', 'plaz'], ['kapr', 'ryba'], ['liška', 'savec']] },
        { t: 'choice', q: 'Jak se jmenuje jediný jedovatý had v ČR?', o: ['zmije obecná', 'užovka', 'slepýš'], a: 0 },
        { t: 'tf', q: 'Pavouk patří mezi hmyz.', a: false, why: 'Pavouk má 8 nohou, hmyz 6.' },
        { t: 'open', q: 'Jak poznáš savce?', a: 'Savci kojí mláďata mlékem, mají většinou srst a dýchají plícemi.' },
        { t: 'open', q: 'Jaký je rozdíl mezi hmyzem a pavoukem?', a: 'Hmyz má 6 nohou a často křídla. Pavouk má 8 nohou a nemá křídla.' },
      ],
    },
    {
      id: 'clovek',
      title: 'Lidské tělo',
      emoji: '🫀',
      ex: [
        {
          title: 'Orgány',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '🧠 mozek', back: 'řídí celé tělo' },
              { front: '🫀 srdce', back: 'pumpuje krev' },
              { front: '🫁 plíce', back: 'dýchání' },
              { front: 'žaludek', back: 'trávení potravy' },
              { front: '🦴 kostra', back: 'opora a ochrana' },
              { front: '💪 svaly', back: 'pohyb' },
            ] } },
            { t: 'key', text: 'Mozek řídí, srdce pumpuje, plíce dýchají.' },
          ],
        },
        {
          title: 'Cestou jídla',
          blocks: [
            { t: 'p', text: 'Kudy putuje rohlík?' },
            { t: 'steps', items: ['ústa – zuby rozkoušou', 'jícen', 'žaludek – rozloží', 'střeva – vstřebají živiny', 'zbytky odejdou ven'] },
            { t: 'p', text: 'Kostra chrání orgány: lebka mozek, hrudník srdce a plíce.' },
            { t: 'key', text: 'Lebka chrání mozek, žebra chrání srdce a plíce.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který orgán pumpuje krev?', o: ['srdce', 'žaludek', 'plíce'], a: 0 },
        { t: 'choice', q: 'Čím dýcháme?', o: ['plícemi', 'srdcem', 'žaludkem'], a: 0 },
        { t: 'choice', q: 'Co řídí celé tělo?', o: ['mozek', 'kůže', 'svaly'], a: 0 },
        { t: 'choice', q: 'Co chrání mozek?', o: ['lebka', 'žebra', 'pánev'], a: 0 },
        { t: 'tf', q: 'Svaly nám umožňují pohyb.', a: true },
        { t: 'tf', q: 'Potrava jde z úst rovnou do plic.', a: false, why: 'Potrava jde jícnem do žaludku, vzduch jde do plic.' },
        { t: 'order', q: 'Seřaď cestu potravy.', items: ['ústa', 'jícen', 'žaludek', 'střeva'] },
        { t: 'pair', q: 'Spoj orgán a úkol.', pairs: [['srdce', 'pumpuje krev'], ['plíce', 'dýchání'], ['žaludek', 'trávení']] },
        { t: 'input', q: 'Kolik smyslů má člověk?', a: ['5', 'pět'] },
        { t: 'choice', q: 'Co chrání srdce a plíce?', o: ['žebra (hrudník)', 'lebka', 'kolena'], a: 0 },
        { t: 'open', q: 'K čemu slouží kostra?', a: 'Kostra je opora těla, chrání vnitřní orgány a spolu se svaly umožňuje pohyb.' },
        { t: 'open', q: 'Popiš, kudy putuje jídlo v těle.', a: 'Z úst, kde ho rozkoušeme, jícnem do žaludku. Pak do střev, kde se vstřebají živiny, a zbytky odejdou ven.' },
      ],
    },
  ],
} satisfies Subject
