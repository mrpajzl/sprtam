import type { Subject } from '../../types'

export default {
  grade: 's2',
  subject: 'literatura',
  topics: [
    {
      id: 'klasicismus',
      title: 'Klasicismus',
      emoji: '🎭',
      ex: [
        {
          title: 'Pravidla',
          blocks: [
            { t: 'p', text: 'Francie, 17. století. Vzor: antika. Vládne **rozum**, řád a pravidla – obraz absolutistického státu.' },
            {
              t: 'list', items: [
                'Pravidlo **tří jednot**: jednota místa, času (jeden den) a děje.',
                'Vysoké žánry: tragédie, óda, epos – hrdinové šlechtici, vznešený jazyk.',
                'Nízké žánry: komedie, bajka, satira – měšťané a prostý lid.',
                'Teoretik: Nicolas Boileau – *Básnické umění* (1674).',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['vysoký žánr', 'nízký žánr'],
                items: [
                  { text: 'tragédie', b: 0 }, { text: 'óda', b: 0 }, { text: 'epos', b: 0 },
                  { text: 'komedie', b: 1 }, { text: 'bajka', b: 1 }, { text: 'satira', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Klasicismus = rozum, řád, antický vzor, tři jednoty, přísné oddělení žánrů.' },
          ],
        },
        {
          title: 'Autoři a díla',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Molière', back: '*Lakomec, Tartuffe, Misantrop, Zdravý nemocný* – komedie' },
                  { front: 'Pierre Corneille', back: '*Cid* – tragédie' },
                  { front: 'Jean Racine', back: '*Faidra* – tragédie' },
                  { front: 'Jean de La Fontaine', back: '*Bajky*' },
                  { front: 'Nicolas Boileau', back: '*Básnické umění*' },
                ],
              },
            },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1637, label: 'Cid' }, { year: 1664, label: 'Tartuffe' }, { year: 1668, label: 'Lakomec' },
                  { year: 1674, label: 'Básnické umění' }, { year: 1677, label: 'Faidra' },
                ],
              },
            },
            { t: 'example', q: 'Kdo je Harpagon?', a: 'Hlavní postava Molièrova *Lakomce* – otec, kterému jsou peníze dražší než vlastní děti.' },
            { t: 'key', text: 'Molière = komedie charakterů, které zesměšňují lidské vady (lakotu, pokrytectví).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které pravidlo platí v klasicistním dramatu?', o: ['tři jednoty', 'volnost formy', 'mísení žánrů'], a: 0 },
        { t: 'choice', q: 'Kdo napsal *Lakomce*?', o: ['Molière', 'Racine', 'Corneille'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje lakomec z Molièrovy komedie?', a: ['Harpagon'] },
        { t: 'tf', q: 'Tragédie patří mezi vysoké žánry.', a: true },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Corneille', 'Cid'], ['Racine', 'Faidra'], ['Boileau', 'Básnické umění'], ['Molière', 'Tartuffe']] },
        { t: 'choice', q: 'Tartuffe je typem:', o: ['pokrytce', 'lakomce', 'hypochondra'], a: 0 },
        { t: 'choice', q: 'Ve které zemi se klasicismus nejvíc rozvinul?', o: ['Francie', 'Rusko', 'Čechy'], a: 0 },
        { t: 'tf', q: 'Klasicismus staví cit nad rozum.', a: false, why: 'Naopak – rozum je nejvyšší hodnota.' },
        { t: 'choice', q: 'Bajky psal:', o: ['La Fontaine', 'Molière', 'Racine'], a: 0 },
        { t: 'order', q: 'Seřaď díla chronologicky.', items: ['Cid (Corneille)', 'Lakomec (Molière)', 'Faidra (Racine)'] },
        { t: 'open', q: 'Charakterizuj klasicismus a jeho pravidla.', a: 'Směr 17. stol. (hlavně Francie). Opírá se o rozum a antický vzor, vyžaduje řád a pravidla: tři jednoty v dramatu, oddělení vysokých žánrů (tragédie, óda, epos) a nízkých (komedie, bajka, satira). Autoři: Corneille, Racine, Molière, La Fontaine, Boileau.' },
        { t: 'open', q: 'Přibliž Molièrova *Lakomce* – žánr, postavy, téma.', a: 'Komedie charakterů (1668). Lakomý Harpagon chce dceru Elišku provdat za bohatého Anselma a sám si vzít Marianu, kterou miluje jeho syn Kleant. Krádež truhlice s penězi ukáže, že peníze miluje víc než děti. Zesměšňuje lakotu.' },
      ],
    },
    {
      id: 'osvicenstvi',
      title: 'Osvícenství',
      emoji: '💡',
      ex: [
        {
          title: 'V souvislostech',
          blocks: [
            { t: 'p', text: '18. století. Víra v **rozum, vědu a pokrok**. Kritika církve, absolutismu a předsudků. Vyvrcholí Velkou francouzskou revolucí.' },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1719, label: 'Robinson Crusoe' }, { year: 1726, label: 'Gulliverovy cesty' },
                  { year: 1751, label: 'Encyklopedie – 1. svazek' }, { year: 1759, label: 'Candide' },
                  { year: 1762, label: 'Emil, Společenská smlouva' }, { year: 1789, label: 'Velká francouzská revoluce' },
                ],
              },
            },
            { t: 'list', items: ['*Encyklopedie* (Diderot, d’Alembert) – shrnutí veškerého vědění.', 'Rousseau: návrat k přírodě a citu – předchůdce romantismu.', 'Oblíbené žánry: filozofická povídka, román, satira.'] },
            { t: 'key', text: 'Osvícenství chce „osvítit“ lidi rozumem a vzděláním.' },
          ],
        },
        {
          title: 'Autoři',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Voltaire', back: '*Candide aneb Optimismus* – filozofická povídka' },
                  { front: 'Denis Diderot', back: 'redaktor *Encyklopedie*; *Jeptiška*' },
                  { front: 'Jean-Jacques Rousseau', back: '*Emil čili O výchově*, *Společenská smlouva*' },
                  { front: 'Daniel Defoe', back: '*Robinson Crusoe*' },
                  { front: 'Jonathan Swift', back: '*Gulliverovy cesty*' },
                ],
              },
            },
            { t: 'example', q: 'Proč nejsou *Gulliverovy cesty* jen dobrodružná kniha?', a: 'Liliput a další země jsou satirou na anglickou politiku, spory a lidskou pýchu.' },
            { t: 'key', text: 'Francie = filozofové (Voltaire, Diderot, Rousseau); Anglie = román (Defoe, Swift).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Hlavní hodnota osvícenství je:', o: ['rozum', 'víra v osud', 'cit'], a: 0 },
        { t: 'choice', q: 'Kdo napsal *Robinsona Crusoe*?', o: ['Defoe', 'Swift', 'Voltaire'], a: 0 },
        { t: 'input', q: 'Kdo napsal *Candida*?', a: ['Voltaire'] },
        { t: 'tf', q: '*Encyklopedii* redigoval Denis Diderot.', a: true },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Swift', 'Gulliverovy cesty'], ['Rousseau', 'Emil čili O výchově'], ['Voltaire', 'Candide'], ['Defoe', 'Robinson Crusoe']] },
        { t: 'choice', q: 'Kdo hlásal „návrat k přírodě“?', o: ['Rousseau', 'Voltaire', 'Swift'], a: 0 },
        { t: 'choice', q: 'Žánr *Gulliverových cest*:', o: ['satirický cestopisný román', 'historický román', 'tragédie'], a: 0 },
        { t: 'tf', q: '*Candide* zesměšňuje názor, že žijeme v nejlepším z možných světů.', a: true },
        { t: 'order', q: 'Seřaď díla chronologicky.', items: ['Robinson Crusoe', 'Gulliverovy cesty', 'Candide'] },
        { t: 'choice', q: 'Jak se jmenuje země trpaslíků v *Gulliverových cestách*?', o: ['Liliput', 'Brobdingnag', 'Laputa'], a: 0 },
        { t: 'open', q: 'Co je osvícenství a jak se projevilo v literatuře?', a: 'Myšlenkový proud 18. stol. založený na rozumu, vědě a pokroku; kritizoval církev, absolutismus a předsudky. V literatuře filozofická povídka (Voltaire), *Encyklopedie* (Diderot), román (Defoe, Swift), výchovné spisy (Rousseau).' },
        { t: 'open', q: 'Přibliž román *Robinson Crusoe*.', a: 'Defoe (1719). Ztroskotaný Robinson přežije 28 let na pustém ostrově díky práci, rozumu a vynalézavosti, zachrání domorodce Pátka. Oslava lidské pracovitosti a rozumu.' },
      ],
    },
    {
      id: 'preromantismus',
      title: 'Preromantismus',
      emoji: '🌩️',
      ex: [
        {
          title: 'Bouře a vzdor',
          blocks: [
            { t: 'p', text: 'Konec 18. stol. Reakce na chladný rozum: do popředí jde **cit, příroda, svoboda** a vzdor proti společnosti.' },
            {
              t: 'list', items: [
                'Německo: hnutí **Sturm und Drang** (Bouře a vzdor), 70.–80. léta 18. stol.',
                'Anglie: sentimentalismus – citlivost, venkov, příroda.',
                'Gotický román – tajemno, hrůza: Walpole, *Otrantský zámek*.',
                '*Ossianovy zpěvy* – údajně staré keltské písně, ve skutečnosti dílo Macphersona.',
              ],
            },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1764, label: 'Otrantský zámek' }, { year: 1774, label: 'Utrpení mladého Werthera' },
                  { year: 1781, label: 'Loupežníci' }, { year: 1784, label: 'Úklady a láska' }, { year: 1808, label: 'Faust I' },
                ],
              },
            },
            { t: 'key', text: 'Preromantismus = most mezi klasicismem a romantismem: cit místo rozumu.' },
          ],
        },
        {
          title: 'Goethe a Schiller',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'J. W. Goethe', back: '*Utrpení mladého Werthera*, *Faust*' },
                  { front: 'Friedrich Schiller', back: '*Loupežníci*, *Úklady a láska*, *Valdštejn*' },
                  { front: 'Horace Walpole', back: '*Otrantský zámek*' },
                  { front: 'James Macpherson', back: '*Ossianovy zpěvy*' },
                ],
              },
            },
            { t: 'example', q: 'Jak končí Werther?', a: 'Nešťastně zamilovaný do zasnoubené Lotty spáchá sebevraždu. Román v dopisech vyvolal vlnu napodobování.' },
            { t: 'example', q: 'O čem jsou *Loupežníci*?', a: 'Karel Moor se kvůli intrikám bratra Františka stane vůdcem loupežníků – vzdor jedince proti nespravedlnosti.' },
            { t: 'key', text: 'Goethe a Schiller začínali ve Sturm und Drang, později vytvořili výmarskou klasiku.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co v preromantismu nahrazuje rozum?', o: ['cit', 'řád', 'vědecké poznání'], a: 0 },
        { t: 'choice', q: 'Kdo napsal *Utrpení mladého Werthera*?', o: ['Goethe', 'Schiller', 'Burns'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje Goethovo drama o učenci, který uzavře smlouvu s ďáblem?', a: ['Faust'] },
        { t: 'choice', q: 'Formou je *Werther*:', o: ['román v dopisech', 'drama', 'sbírka básní'], a: 0 },
        { t: 'tf', q: 'Schillerovi *Loupežníci* jsou drama o bratrech Karlovi a Františkovi Moorových.', a: true },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Schiller', 'Úklady a láska'], ['Goethe', 'Faust'], ['Walpole', 'Otrantský zámek'], ['Macpherson', 'Ossianovy zpěvy']] },
        { t: 'choice', q: 'Co znamená Sturm und Drang?', o: ['Bouře a vzdor', 'Rozum a cit', 'Návrat k přírodě'], a: 0 },
        { t: 'tf', q: '*Ossianovy zpěvy* jsou pravé staré keltské básně.', a: false, why: 'Šlo převážně o dílo Jamese Macphersona.' },
        { t: 'choice', q: 'Gotický román je typický:', o: ['tajemnem a hrůzou', 'oslavou rozumu', 'vtipnými dialogy'], a: 0 },
        { t: 'order', q: 'Seřaď díla chronologicky.', items: ['Utrpení mladého Werthera', 'Loupežníci', 'Faust (1. díl)'] },
        { t: 'open', q: 'Co je preromantismus a čím se liší od klasicismu?', a: 'Proud konce 18. stol. (Sturm und Drang, sentimentalismus, gotický román). Místo rozumu a pravidel staví cit, přírodu, svobodu a vzdor jedince. Autoři: Goethe, Schiller, Walpole, Macpherson.' },
        { t: 'open', q: 'Charakterizuj Werthera jako literárního hrdinu.', a: 'Citlivý mladý muž, který vnímá svět srdcem, ne rozumem. Nešťastně miluje zasnoubenou Lottu, nezapadá do společnosti a nakonec spáchá sebevraždu. Předchůdce romantického hrdiny.' },
      ],
    },
    {
      id: 'narodni-obrozeni-pocatky',
      title: 'Národní obrození: počátky',
      emoji: '📜',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Konec 18. stol.: čeština mizí z úřadů a škol, vzdělanci mluví německy (centralizace za Josefa II.). Vlastenci chtějí jazyk zachránit.' },
            {
              t: 'steps', items: [
                '1. fáze (cca do 1805) – obranná: dokázat hodnotu češtiny, vědecky ji popsat (Dobrovský).',
                '2. fáze (cca 1805–1830) – ofenzivní: čeština pro vědu i umění (Jungmann).',
                '3. fáze (1830–1848) – vrcholná: literatura, divadlo, politika (Mácha, Tyl, Palacký).',
              ],
            },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1792, label: 'Dobrovský: Dějiny české řeči a literatury' }, { year: 1809, label: 'Zevrubná mluvnice' },
                  { year: 1817, label: '„Objev“ Rukopisu královédvorského' }, { year: 1818, label: 'Národní muzeum' },
                  { year: 1834, label: 'Jungmannův slovník (1. díl)' },
                ],
              },
            },
            { t: 'key', text: 'Obrození: nejdřív jazyk zachránit, pak rozvinout, nakonec tvořit literaturu a politiku.' },
          ],
        },
        {
          title: 'Osobnosti',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Josef Dobrovský', back: '*Dějiny české řeči a literatury*, *Zevrubná mluvnice jazyka českého* (psal německy)' },
                  { front: 'Josef Jungmann', back: '*Slovník česko-německý* (5 dílů), překlad Miltonova *Ztraceného ráje*' },
                  { front: 'V. M. Kramerius', back: 'nakladatelství *Česká expedice*, vlastenecké noviny' },
                  { front: 'Václav Thám', back: 'almanach *Básně v řeči vázané* (1785)' },
                  { front: 'Václav Hanka', back: '„objevitel“ padělaných Rukopisů' },
                ],
              },
            },
            { t: 'list', items: ['Rukopis královédvorský a zelenohorský – padělky, které měly dokázat starobylost české literatury.', 'Pravost zpochybnili v 80. letech 19. stol. Gebauer a Masaryk.'] },
            { t: 'key', text: 'Dobrovský jazyk popsal, Jungmann ho rozvinul.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo napsal *Zevrubnou mluvnici jazyka českého*?', o: ['Dobrovský', 'Jungmann', 'Palacký'], a: 0 },
        { t: 'tf', q: 'Dobrovský psal svá vědecká díla hlavně německy a latinsky.', a: true },
        { t: 'choice', q: 'Jungmannovo hlavní dílo je:', o: ['Slovník česko-německý', 'Slovanské starožitnosti', 'Dějiny národu českého'], a: 0 },
        { t: 'input', q: 'Jak se jmenovalo Krameriusovo nakladatelství?', a: ['Česká expedice'] },
        { t: 'tf', q: 'Rukopis královédvorský a zelenohorský jsou pravé středověké památky.', a: false, why: 'Jsou to padělky z 19. století.' },
        { t: 'choice', q: 'Které dílo přeložil Jungmann do češtiny?', o: ['Ztracený ráj', 'Faust', 'Hamlet'], a: 0 },
        { t: 'order', q: 'Seřaď fáze obrození.', items: ['obranná (Dobrovský)', 'ofenzivní (Jungmann)', 'vrcholná (Mácha, Tyl)'] },
        { t: 'choice', q: 'Proč byla čeština na konci 18. stol. ohrožena?', o: ['germanizace a centralizace monarchie', 'zákaz tisku knih', 'vymření mluvčích'], a: 0 },
        { t: 'pair', q: 'Spoj osobnost s přínosem.', pairs: [['Dobrovský', 'mluvnice'], ['Jungmann', 'slovník'], ['Kramerius', 'noviny a lidové knihy'], ['Thám', 'Básně v řeči vázané']] },
        { t: 'input', q: 'Ve kterém roce bylo založeno (Vlastenecké) Národní muzeum?', a: ['1818'] },
        { t: 'open', q: 'Popiš fáze národního obrození a jejich představitele.', a: 'Obranná fáze (do cca 1805) – vědecký popis jazyka, Dobrovský, Kramerius. Ofenzivní (cca 1805–1830) – rozvoj jazyka pro vědu a umění, Jungmann, Kollár. Vrcholná (1830–1848) – literatura, divadlo a politika: Mácha, Tyl, Palacký, Havlíček.' },
        { t: 'open', q: 'Porovnej přístup Dobrovského a Jungmanna k češtině.', a: 'Dobrovský byl vědec: češtinu popsal (mluvnice, dějiny jazyka), psal německy a o její budoucnosti jako jazyka vědy pochyboval. Jungmann chtěl plnohodnotnou češtinu pro vědu i umění – vytvořil velký slovník, překládal a obohacoval slovní zásobu.' },
      ],
    },
    {
      id: 'narodni-obrozeni-vrchol',
      title: 'Národní obrození: vrchol',
      emoji: '🎻',
      ex: [
        {
          title: 'Autoři',
          blocks: [
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Ján Kollár', back: '*Slávy dcera* (1824) – sonety, slovanská vzájemnost' },
                  { front: 'F. L. Čelakovský', back: '*Ohlas písní ruských*, *Ohlas písní českých*, *Růže stolistá*' },
                  { front: 'P. J. Šafařík', back: '*Slovanské starožitnosti*' },
                  { front: 'František Palacký', back: '*Dějiny národu českého v Čechách a v Moravě*' },
                  { front: 'J. K. Tyl', back: '*Fidlovačka*, *Strakonický dudák*, *Jan Hus*' },
                  { front: 'V. K. Klicpera', back: 'veselohry *Zlý jelen*, *Hadrián z Římsů*' },
                ],
              },
            },
            { t: 'p', text: '**Ohlasová poezie** (Čelakovský): umělé básně napodobující lidovou píseň.' },
            { t: 'key', text: 'Kollár = slovanská vzájemnost, Čelakovský = ohlasy, Tyl = divadlo.' },
          ],
        },
        {
          title: 'Přes divadlo',
          blocks: [
            { t: 'p', text: 'Divadlo bylo nejrychlejší cestou k lidem: hra v češtině posilovala vlastenectví i mezi těmi, kdo nečetli.' },
            {
              t: 'list', items: [
                'Tyl, *Fidlovačka* (1834): zazněla píseň *Kde domov můj* (hudba František Škroup) – dnes hymna.',
                'Tyl, *Strakonický dudák* (1847): dramatická báchorka o dudákovi Švandovi.',
                'Klicpera: veselohry a hry pro lidové publikum.',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['Tyl', 'Kollár', 'Čelakovský'],
                items: [
                  { text: 'Fidlovačka', b: 0 }, { text: 'Strakonický dudák', b: 0 }, { text: 'Kutnohorští havíři', b: 0 },
                  { text: 'Slávy dcera', b: 1 }, { text: 'O literní vzájemnosti', b: 1 },
                  { text: 'Ohlas písní ruských', b: 2 }, { text: 'Ohlas písní českých', b: 2 }, { text: 'Růže stolistá', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Česká hymna pochází z Tylovy hry *Fidlovačka*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo napsal *Slávy dceru*?', o: ['Kollár', 'Čelakovský', 'Šafařík'], a: 0 },
        { t: 'choice', q: 'Ve které hře poprvé zazněla píseň *Kde domov můj*?', o: ['Fidlovačka', 'Strakonický dudák', 'Paličova dcera'], a: 0 },
        { t: 'input', q: 'Kdo složil hudbu k písni *Kde domov můj*? (příjmení)', a: ['Škroup', 'František Škroup'] },
        { t: 'tf', q: '*Slávy dcera* je skladba tvořená převážně sonety.', a: true },
        { t: 'choice', q: 'Ohlasová poezie je:', o: ['umělá poezie napodobující lidovou píseň', 'překlad antických básní', 'politická satira'], a: 0 },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Šafařík', 'Slovanské starožitnosti'], ['Palacký', 'Dějiny národu českého'], ['Čelakovský', 'Ohlas písní českých'], ['Klicpera', 'Zlý jelen']] },
        { t: 'choice', q: 'Hlavní postava *Strakonického dudáka*:', o: ['Švanda', 'Jan Hus', 'Lávra'], a: 0 },
        { t: 'tf', q: 'Kollár byl Slovák, ale psal česky.', a: true },
        { t: 'choice', q: 'Kterou myšlenku propagoval Kollár?', o: ['slovanskou vzájemnost', 'návrat k přírodě', 'umění pro umění'], a: 0 },
        { t: 'order', q: 'Seřaď díla chronologicky.', items: ['Slávy dcera', 'Fidlovačka', 'Strakonický dudák'] },
        { t: 'open', q: 'Přibliž Kollárovu *Slávy dceru* – formu a myšlenky.', a: 'Lyrickoepická skladba (1824, rozšířená 1832): předzpěv a zpěvy ze sonetů. Básník putuje slovanskými zeměmi, oplakává zaniklé Slovany, opěvuje milou Mínu a hlásá slovanskou vzájemnost.' },
        { t: 'open', q: 'Jakou roli hrálo divadlo v národním obrození? Uveď autory a hry.', a: 'Divadlo oslovilo i lidi, kteří nečetli, a šířilo češtinu a vlastenectví. Tyl: *Fidlovačka* (píseň *Kde domov můj*), *Strakonický dudák*, *Jan Hus*; Klicpera: veselohry *Zlý jelen*, *Hadrián z Římsů*.' },
      ],
    },
    {
      id: 'romantismus-svetovy',
      title: 'Světový romantismus',
      emoji: '🌹',
      ex: [
        {
          title: 'Romantický hrdina',
          blocks: [
            { t: 'p', text: 'Přelom 18. a 19. stol. Zklamání z revoluce a z rozumu. Únik do citu, snu, přírody, minulosti či exotiky.' },
            {
              t: 'list', items: [
                'Výjimečný jedinec v konfliktu se společností.',
                'Nešťastná láska, osamělost, vzdor.',
                'Útěk do přírody, minulosti (středověk), exotiky.',
                'Kontrasty: krása × ošklivost, dobro × zlo.',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['klasicismus', 'romantismus'],
                items: [
                  { text: 'rozum', b: 0 }, { text: 'cit a fantazie', b: 1 }, { text: 'pravidla', b: 0 }, { text: 'svoboda tvorby', b: 1 },
                  { text: 'antika jako vzor', b: 0 }, { text: 'lidová slovesnost a středověk', b: 1 },
                  { text: 'tři jednoty', b: 0 }, { text: 'výjimečný hrdina', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Romantismus = cit, svoboda, výjimečný hrdina v rozporu se světem.' },
          ],
        },
        {
          title: 'Mapa autorů',
          blocks: [
            {
              t: 'table',
              head: ['Země', 'Autor', 'Dílo'],
              rows: [
                ['Anglie', 'G. G. Byron', '*Childe Haroldova pouť*, *Don Juan*'],
                ['Skotsko', 'Walter Scott', '*Ivanhoe*'],
                ['Francie', 'Victor Hugo', '*Chrám Matky Boží v Paříži*, *Bídníci*'],
                ['Rusko', 'A. S. Puškin', '*Evžen Oněgin*'],
                ['Rusko', 'M. J. Lermontov', '*Hrdina naší doby*'],
                ['Polsko', 'Adam Mickiewicz', '*Pan Tadeáš*'],
                ['USA', 'E. A. Poe', '*Havran*, *Jáma a kyvadlo*'],
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Quasimodo', back: '*Chrám Matky Boží v Paříži* (Hugo)' },
                  { front: 'Jean Valjean', back: '*Bídníci* (Hugo)' },
                  { front: 'Pečorin', back: '*Hrdina naší doby* (Lermontov)' },
                  { front: 'Oněgin a Taťána', back: '*Evžen Oněgin* (Puškin)' },
                  { front: 'Childe Harold', back: '*Childe Haroldova pouť* (Byron)' },
                ],
              },
            },
            { t: 'key', text: 'Byron = Anglie, Hugo = Francie, Puškin = Rusko, Poe = USA, Mickiewicz = Polsko.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo napsal *Evžena Oněgina*?', o: ['Puškin', 'Lermontov', 'Gogol'], a: 0 },
        { t: 'choice', q: '*Evžen Oněgin* je:', o: ['román ve verších', 'drama', 'sbírka balad'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje hrbatý zvoník z Hugova románu?', a: ['Quasimodo'] },
        { t: 'tf', q: 'E. A. Poe je považován za zakladatele detektivky.', a: true, why: 'Povídka *Vraždy v ulici Morgue*.' },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Byron', 'Childe Haroldova pouť'], ['Mickiewicz', 'Pan Tadeáš'], ['Lermontov', 'Hrdina naší doby'], ['Scott', 'Ivanhoe']] },
        { t: 'choice', q: 'Báseň *Havran* napsal:', o: ['E. A. Poe', 'G. G. Byron', 'Victor Hugo'], a: 0 },
        { t: 'choice', q: 'Hlavní hrdina *Bídníků*:', o: ['Jean Valjean', 'Julien Sorel', 'Quasimodo'], a: 0 },
        { t: 'tf', q: 'Romantismus obdivuje lidovou slovesnost a středověk.', a: true },
        { t: 'choice', q: 'Puškin zemřel:', o: ['na následky souboje', 've vězení', 'v exilu v Itálii'], a: 0 },
        { t: 'choice', q: 'Kdo napsal *Frankensteina*?', o: ['Mary Shelleyová', 'G. G. Byron', 'E. A. Poe'], a: 0 },
        { t: 'open', q: 'Charakterizuj romantického hrdinu.', a: 'Výjimečný, osamělý jedinec, který se nesmíří se společností. Je hrdý, vzdorovitý, často nešťastně zamilovaný a zklamaný světem; utíká do přírody, snu či exotiky. Typ: byronský hrdina, Oněgin, Pečorin.' },
        { t: 'open', q: 'Přibliž román *Chrám Matky Boží v Paříži*.', a: 'Victor Hugo (1831), Paříž 15. stol. Do cikánky Esmeraldy jsou zamilovaní arcijáhen Frollo, hrbatý zvoník Quasimodo i kapitán Phoebus. Frollo ji nechá popravit, Quasimodo ho svrhne z věže. Kontrast ošklivého zevnějšku a dobré duše.' },
      ],
    },
    {
      id: 'cesky-romantismus',
      title: 'Český romantismus: Mácha a Erben',
      emoji: '🌙',
      ex: [
        {
          title: 'Mácha a Máj',
          blocks: [
            { t: 'p', text: 'Karel Hynek Mácha (1810–1836) – vrchol českého romantismu. Zemřel ve 25 letech v Litoměřicích.' },
            {
              t: 'list', items: [
                '*Máj* (1836): lyrickoepická báseň, 4 zpěvy a 2 intermezza.',
                'Vilém, „strašný lesů pán“, zabil svůdce Jarmily – jak se ukáže, vlastního otce.',
                'Noc před popravou rozjímá o smrti a nicotě.',
                'Kontrast krásné jarní přírody a smrti.',
                'Další díla: román *Cikáni*, povídky *Marinka*, *Křivoklad*.',
              ],
            },
            {
              t: 'w', w: 'gap', p: {
                items: [
                  { before: 'Byl pozdní ', after: ' – první máj –', options: ['večer', 'podvečer'], a: 0 },
                  { before: 'večerní máj – byl lásky ', after: '.', options: ['čas', 'hlas'], a: 0 },
                  { before: 'Hrdliččin zval ku lásce ', after: ',', options: ['hlas', 'čas'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Mácha = subjektivní romantismus, vzdor, otázka smrti a nekonečna.' },
          ],
        },
        {
          title: 'Erben a Kytice',
          blocks: [
            { t: 'p', text: 'Karel Jaromír Erben (1811–1870) – archivář a sběratel lidové slovesnosti. *Kytice z pověstí národních* (1853) – sbírka balad.' },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Vodník', back: 'Dívka neposlechne matku, stane se ženou vodníka; ten nakonec zabije jejich dítě.' },
                  { front: 'Polednice', back: 'Matka zavolá na zlobivé dítě polednici – ta přijde a dítě zemře.' },
                  { front: 'Svatební košile', back: 'Pro dívku přijde mrtvý milý; zachrání ji modlitba.' },
                  { front: 'Vrba', back: 'Žena žije duší ve vrbě; muž strom pokácí a ona zemře.' },
                  { front: 'Štědrý den', back: 'Dvě dívky věští budoucnost z hladiny jezera.' },
                ],
              },
            },
            { t: 'key', text: 'Erben = řád, vina a trest; kdo poruší přirozený řád, je potrestán.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdy vyšel *Máj*?', o: ['1836', '1853', '1820'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje dívka v *Máji*?', a: ['Jarmila'] },
        { t: 'choice', q: 'Koho Vilém zabil?', o: ['svůdce Jarmily, vlastního otce', 'soka v lásce, svého bratra', 'zrádného přítele'], a: 0 },
        { t: 'tf', q: '*Máj* byl po vydání nadšeně přijat kritikou.', a: false, why: 'Současníci mu vyčítali nevlasteneckost a pesimismus; uznání přišlo až s májovci.' },
        { t: 'choice', q: '*Kytice* je sbírka:', o: ['balad', 'sonetů', 'ód'], a: 0 },
        { t: 'pair', q: 'Spoj baladu s motivem.', pairs: [['Polednice', 'matka přivolá na dítě strašidlo'], ['Vodník', 'dívka neposlechne matku'], ['Svatební košile', 'mrtvý milý přijde pro dívku'], ['Vrba', 'žena žije duší ve stromě']] },
        { t: 'choice', q: 'Hlavní myšlenka *Kytice*:', o: ['porušení řádu je potrestáno', 'svoboda nade vše', 'rozum vítězí nad pověrou'], a: 0 },
        { t: 'input', q: 'Ve kterém městě Mácha zemřel?', a: ['Litoměřice', 'v Litoměřicích', 'Litoměřicích'] },
        { t: 'tf', q: 'Erben sbíral lidové písně a pohádky.', a: true },
        { t: 'order', q: 'Seřaď chronologicky.', items: ['Mácha se narodil', 'vyšel Máj', 'vyšla Kytice'] },
        { t: 'open', q: 'Rozeber Máchův *Máj* – děj, kompozici a hlavní motivy.', a: 'Lyrickoepická báseň (1836), 4 zpěvy a 2 intermezza. Vilém zabije svůdce Jarmily, který je jeho otcem, a je popraven; Jarmila se utopí. Motivy: kontrast jarní přírody a smrti, vina, nicota, otázka posmrtného života. V závěru vstupuje autor (Hynek).' },
        { t: 'open', q: 'Porovnej Máchu a Erbena.', a: 'Mácha: subjektivní romantik, vzdor, rozervaný hrdina, úvahy o smrti a nicotě (*Máj*). Erben: vychází z lidové slovesnosti, zdůrazňuje řád, vinu a trest, objektivnější a sevřená forma balad (*Kytice*).' },
      ],
    },
    {
      id: 'nemcova-havlicek',
      title: 'Němcová a Havlíček',
      emoji: '🏡',
      ex: [
        {
          title: 'Božena Němcová',
          blocks: [
            { t: 'p', text: 'Božena Němcová (1820–1862) – zakladatelka moderní české prózy. Přechod od romantismu k realismu.' },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Babička (1855)', back: 'idealizovaný obraz venkova, Staré bělidlo u Ratibořic' },
                  { front: 'Divá Bára', back: 'nespoutaná dívka odlišná od okolí' },
                  { front: 'V zámku a podzámčí', back: 'kontrast bohatého panstva a chudých' },
                  { front: 'Pohorská vesnice', back: 'román o životě vesnice' },
                  { front: 'Národní báchorky a pověsti', back: 'sbírka pohádek' },
                ],
              },
            },
            { t: 'example', q: 'Kdo je babička?', a: 'Moudrá, laskavá a zbožná stařena, která vnoučatům předává lidové tradice a všem radí. Ideál člověka.' },
            { t: 'key', text: 'Němcová: venkov, lidová tradice, ideál dobrého člověka.' },
          ],
        },
        {
          title: 'Karel Havlíček',
          blocks: [
            { t: 'p', text: 'Karel Havlíček Borovský (1821–1856) – novinář a satirik, zakladatel české žurnalistiky.' },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1848, label: 'Národní noviny' }, { year: 1851, label: 'deportace do Brixenu' },
                  { year: 1855, label: 'návrat; vychází Babička' }, { year: 1856, label: 'Havlíčkova smrt' },
                ],
              },
            },
            {
              t: 'list', items: [
                '*Tyrolské elegie* – ironicky o nočním odvezení do vyhnanství.',
                '*Král Lávra* – král s oslíma ušima; kritika moci.',
                '*Křest svatého Vladimíra* – satira na spojení církve a státu.',
                '*Epigramy* – krátké satirické básně s pointou.',
              ],
            },
            { t: 'key', text: 'Havlíček = satira a novinařina proti absolutismu.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdy vyšla *Babička*?', o: ['1855', '1836', '1878'], a: 0 },
        { t: 'input', q: 'Kam byl Havlíček deportován?', a: ['Brixen', 'Brixenu', 'do Brixenu', 'Bressanone'] },
        { t: 'choice', q: 'Satiru *Král Lávra* napsal:', o: ['Havlíček', 'Neruda', 'Erben'], a: 0 },
        { t: 'tf', q: '*Babička* zobrazuje venkov drsně a bez idealizace.', a: false, why: 'Venkov je v ní idealizovaný.' },
        { t: 'pair', q: 'Spoj dílo s obsahem.', pairs: [['Tyrolské elegie', 'odvezení do vyhnanství'], ['Král Lávra', 'král s oslíma ušima'], ['Křest svatého Vladimíra', 'církev a stát'], ['Epigramy', 'krátké básně s pointou']] },
        { t: 'choice', q: 'Kde se odehrává *Babička*?', o: ['na Starém bělidle u Ratibořic', 'na Malé Straně', 'v Krkonoších'], a: 0 },
        { t: 'tf', q: 'Havlíček vydával *Národní noviny*.', a: true },
        { t: 'choice', q: 'Podtitul *Babičky* zní:', o: ['Obrazy venkovského života', 'Román z doby obrození', 'Pohádky pro děti'], a: 0 },
        { t: 'input', q: 'Jak se nazývá krátká satirická báseň s pointou, kterou Havlíček proslul?', a: ['epigram', 'epigramy'] },
        { t: 'choice', q: 'Co Němcová sbírala?', o: ['pohádky a pověsti', 'lidové kroje', 'středověké rukopisy'], a: 0 },
        { t: 'open', q: 'Charakterizuj postavu babičky.', a: 'Moudrá, laskavá, pracovitá a zbožná žena, která žije v souladu s přírodou a lidovými zvyky. Pomáhá a radí všem, od chudých po kněžnu. Je ideálem dobrého člověka.' },
        { t: 'open', q: 'Proč je Havlíček považován za zakladatele české žurnalistiky a satiry?', a: 'Vydával *Národní noviny* a *Slovan*, psal politické články a kritizoval absolutismus. Satirami (*Král Lávra*, *Křest svatého Vladimíra*, *Tyrolské elegie*, epigramy) zesměšňoval moc. Za to byl deportován do Brixenu.' },
      ],
    },
    {
      id: 'realismus-svetovy',
      title: 'Světový realismus a naturalismus',
      emoji: '🔍',
      ex: [
        {
          title: 'Proti romantismu',
          blocks: [
            { t: 'p', text: '19. století. Cíl: **pravdivě zobrazit skutečnost** a společnost. Typický hrdina v typických okolnostech.' },
            {
              t: 'list', items: [
                'Hlavní žánr: román (společenský, psychologický).',
                'Kritika společnosti, psychologie postav, objektivní vypravěč.',
                'Naturalismus (Zola): člověk je určen dědičností a prostředím, drsné detaily.',
              ],
            },
            {
              t: 'w', w: 'sort', p: {
                buckets: ['romantismus', 'realismus'],
                items: [
                  { text: 'výjimečný hrdina', b: 0 }, { text: 'typický hrdina', b: 1 }, { text: 'únik do snu', b: 0 },
                  { text: 'kritika společnosti', b: 1 }, { text: 'exotika', b: 0 }, { text: 'objektivní vypravěč', b: 1 },
                  { text: 'cit a fantazie', b: 0 }, { text: 'všední život', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Realismus = pravdivý obraz společnosti a typických lidí.' },
          ],
        },
        {
          title: 'Autoři podle zemí',
          blocks: [
            {
              t: 'table',
              head: ['Země', 'Autor', 'Dílo'],
              rows: [
                ['Francie', 'Stendhal', '*Červený a černý*'],
                ['Francie', 'Honoré de Balzac', '*Otec Goriot* (cyklus *Lidská komedie*)'],
                ['Francie', 'Gustave Flaubert', '*Paní Bovaryová*'],
                ['Francie', 'Émile Zola', '*Zabiják*, *Germinal* (naturalismus)'],
                ['Anglie', 'Charles Dickens', '*Oliver Twist*'],
                ['Rusko', 'N. V. Gogol', '*Revizor*, *Mrtvé duše*'],
                ['Rusko', 'L. N. Tolstoj', '*Vojna a mír*, *Anna Kareninová*'],
                ['Rusko', 'F. M. Dostojevskij', '*Zločin a trest*'],
                ['Rusko', 'A. P. Čechov', '*Višňový sad*, *Racek*'],
              ],
            },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Raskolnikov', back: '*Zločin a trest* (Dostojevskij)' },
                  { front: 'Emma', back: '*Paní Bovaryová* (Flaubert)' },
                  { front: 'Julien Sorel', back: '*Červený a černý* (Stendhal)' },
                  { front: 'Chlestakov', back: '*Revizor* (Gogol)' },
                  { front: 'Anna Kareninová', back: 'román L. N. Tolstého' },
                ],
              },
            },
            { t: 'key', text: 'Francie = společenský román, Rusko = psychologie a morální otázky.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo napsal *Zločin a trest*?', o: ['Dostojevskij', 'Tolstoj', 'Čechov'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje hlavní hrdina *Zločinu a trestu*? (příjmení)', a: ['Raskolnikov', 'Rodion Raskolnikov'] },
        { t: 'choice', q: 'Cyklus *Lidská komedie* napsal:', o: ['Balzac', 'Zola', 'Flaubert'], a: 0 },
        { t: 'tf', q: 'Naturalismus zdůrazňuje vliv dědičnosti a prostředí.', a: true },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Stendhal', 'Červený a černý'], ['Flaubert', 'Paní Bovaryová'], ['Gogol', 'Revizor'], ['Tolstoj', 'Anna Kareninová']] },
        { t: 'choice', q: 'Hlavní představitel naturalismu:', o: ['Émile Zola', 'Victor Hugo', 'G. G. Byron'], a: 0 },
        { t: 'choice', q: 'Čechov psal hlavně:', o: ['povídky a dramata', 'eposy', 'romány ve verších'], a: 0 },
        { t: 'tf', q: 'Realistický hrdina je výjimečný jedinec stojící mimo společnost.', a: false, why: 'To je hrdina romantický; realismus zobrazuje typické postavy.' },
        { t: 'choice', q: '*Vojna a mír* se odehrává v době:', o: ['napoleonských válek', 'krymské války', 'první světové války'], a: 0 },
        { t: 'input', q: 'Kdo napsal *Olivera Twista*? (příjmení)', a: ['Dickens', 'Charles Dickens'] },
        { t: 'order', q: 'Seřaď díla chronologicky.', items: ['Červený a černý', 'Paní Bovaryová', 'Zločin a trest'] },
        { t: 'open', q: 'Charakterizuj realismus a porovnej ho s romantismem.', a: 'Realismus (19. stol.) pravdivě zobrazuje společnost a typické postavy, kritizuje poměry, vypravěč je objektivní, hlavním žánrem je román. Romantismus naopak staví na citu, fantazii a výjimečném hrdinovi, který uniká ze skutečnosti.' },
        { t: 'open', q: 'Přibliž jeden realistický román – téma, postavu, myšlenku.', a: 'Např. Flaubert, *Paní Bovaryová* (1857): Emma, žena venkovského lékaře Charlese, sní o romantické lásce z knih, má milence, zadluží se a otráví se arzenem. Kritika maloměšťáctví a romantických iluzí.' },
      ],
    },
    {
      id: 'cesky-realismus',
      title: 'Májovci, ruchovci, lumírovci a český realismus',
      emoji: '🏙️',
      ex: [
        {
          title: 'Generace',
          blocks: [
            {
              t: 'table',
              head: ['Skupina', 'Program', 'Autoři'],
              rows: [
                ['májovci (almanach *Máj*, 1858)', 'navazují na Máchu; současnost, sociální témata', 'Neruda, Hálek, Světlá, Arbes'],
                ['ruchovci (almanach *Ruch*, 1868)', 'národní a slovanská témata', 'S. Čech, E. Krásnohorská'],
                ['lumírovci (časopis *Lumír*)', 'světovost, překlady, dokonalá forma', 'Vrchlický, Zeyer, Sládek'],
              ],
            },
            {
              t: 'w', w: 'timeline', p: {
                events: [
                  { year: 1858, label: 'almanach Máj' }, { year: 1868, label: 'almanach Ruch' },
                  { year: 1878, label: 'Povídky malostranské' }, { year: 1894, label: 'Maryša, Staré pověsti české' },
                ],
              },
            },
            { t: 'key', text: 'Májovci = současnost, ruchovci = národ, lumírovci = svět.' },
          ],
        },
        {
          title: 'Autoři a díla',
          blocks: [
            { t: 'p', text: 'Realismus (80.–90. léta 19. stol.): venkov, historie a sociální drama.' },
            {
              t: 'w', w: 'flip', p: {
                cards: [
                  { front: 'Jan Neruda', back: '*Povídky malostranské*, *Písně kosmické*, *Balady a romance*' },
                  { front: 'Vítězslav Hálek', back: '*Muzikantská Liduška*, *Večerní písně*' },
                  { front: 'Karolina Světlá', back: '*Kříž u potoka*, *Vesnický román*' },
                  { front: 'Svatopluk Čech', back: '*Výlety pana Broučka*, *Ve stínu lípy*' },
                  { front: 'Jaroslav Vrchlický', back: '*Noc na Karlštejně*' },
                  { front: 'Alois Jirásek', back: '*Staré pověsti české*, *Psohlavci*, *Temno*' },
                  { front: 'A. a V. Mrštíkové', back: 'drama *Maryša*' },
                  { front: 'K. V. Rais', back: '*Zapadlí vlastenci*' },
                ],
              },
            },
            { t: 'key', text: 'Neruda = Malá Strana a fejeton, Jirásek = historie, Mrštíkové = venkovské drama.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo napsal *Povídky malostranské*?', o: ['Neruda', 'Hálek', 'Arbes'], a: 0 },
        { t: 'choice', q: 'Drama *Maryša* napsali:', o: ['bratři Mrštíkové', 'Alois Jirásek', 'Gabriela Preissová'], a: 0 },
        { t: 'input', q: 'Podle kterého almanachu se jmenuje generace Nerudy a Hálka?', a: ['Máj'] },
        { t: 'pair', q: 'Spoj autora s dílem.', pairs: [['Vrchlický', 'Noc na Karlštejně'], ['Čech', 'Výlety pana Broučka'], ['Jirásek', 'Psohlavci'], ['Rais', 'Zapadlí vlastenci']] },
        { t: 'tf', q: 'Lumírovci usilovali o to, aby česká literatura dosáhla světové úrovně.', a: true },
        { t: 'choice', q: 'Ruchovci zdůrazňovali:', o: ['národní a slovanská témata', 'umění pro umění', 'vědecký naturalismus'], a: 0 },
        { t: 'choice', q: 'Romaneto je typické pro:', o: ['Jakuba Arbese', 'Jana Nerudu', 'Aloise Jiráska'], a: 0 },
        { t: 'tf', q: 'Jirásek psal hlavně historické romány.', a: true },
        { t: 'choice', q: 'Jak končí *Maryša*?', o: ['otráví manžela Vávru', 'uteče s Francem do Ameriky', 'vrátí se k rodičům'], a: 0 },
        { t: 'order', q: 'Seřaď chronologicky.', items: ['almanach Máj', 'almanach Ruch', 'Maryša'] },
        { t: 'input', q: 'Kdo napsal *Kříž u potoka*? (příjmení)', a: ['Světlá', 'Karolina Světlá'] },
        { t: 'open', q: 'Představ májovce – program a hlavní autory.', a: 'Generace almanachu *Máj* (1858), hlásila se k Máchovi. Chtěli psát o současnosti a sociálních otázkách, přiblížit literaturu Evropě. Autoři: Jan Neruda, Vítězslav Hálek, Karolina Světlá, Jakub Arbes.' },
        { t: 'open', q: 'Přibliž *Povídky malostranské*.', a: 'Jan Neruda (1878). Soubor povídek z pražské Malé Strany první poloviny 19. stol. S humorem i ironií zobrazuje maloměšťáky, jejich klepy a lhostejnost. Např. *Týden v tichém domě*, *Pan Ryšánek a pan Šlégl*, *Figurky*.' },
      ],
    },
  ],
} satisfies Subject
