import type { Subject } from '../../types'

export default {
  grade: 's1',
  subject: 'anglictina',
  topics: [
    {
      id: 'present-simple-continuous-stative',
      title: 'Present simple vs. continuous',
      emoji: '🔄',
      ex: [
        {
          title: 'Situací',
          blocks: [
            { t: 'p', text: '*I work in a bank.* – obecně, trvale. *I\'m working from home this week.* – právě teď, dočasně.' },
            { t: 'p', text: 'Stavová slovesa (*know, like, want, believe, belong*) průběhový tvar nemají: *I know*, ne *I\'m knowing*.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Water', after: 'at 100 °C.', options: ['boils', 'is boiling'], a: 0 },
              { before: 'Look! It', after: '.', options: ['snows', 'is snowing'], a: 1 },
              { before: 'I', after: 'what you mean.', options: ['understand', 'am understanding'], a: 0 },
              { before: 'She', after: 'with her aunt until she finds a flat.', options: ['stays', 'is staying'], a: 1 },
            ] } },
            { t: 'key', text: 'Pravidelně a trvale → simple. Teď a dočasně → continuous. Stavy → vždy simple.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Present simple', 'Present continuous'], rows: [
              ['zvyky, fakta', 'děj právě probíhá'],
              ['always, usually, every day', 'now, at the moment, this week'],
              ['trvalé situace', 'dočasné situace, změny'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['Stavové sloveso', 'Dějové sloveso'], items: [
              { text: 'know', b: 0 }, { text: 'believe', b: 0 }, { text: 'own', b: 0 }, { text: 'prefer', b: 0 },
              { text: 'run', b: 1 }, { text: 'cook', b: 1 }, { text: 'write', b: 1 }, { text: 'build', b: 1 },
            ] } },
            { t: 'key', text: 'Některá slovesa mění význam: *I think so* (názor) × *I\'m thinking about it* (přemýšlím).' },
            { t: 'example', q: 'I have a car × I\'m having lunch – proč obojí?', a: '*have* = vlastnit (stav) → simple; *have lunch* = děj → continuous.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'She usually ___ to school by bus.', o: ['goes', 'is going', 'go'], a: 0, why: '*usually* = zvyk → present simple, 3. os. -s.' },
        { t: 'choice', q: 'Be quiet! The baby ___.', o: ['sleeps', 'is sleeping', 'sleep'], a: 1, why: 'Děj právě probíhá.' },
        { t: 'choice', q: 'This book ___ to my brother.', o: ['belongs', 'is belonging', 'belong'], a: 0, why: '*belong* je stavové sloveso.' },
        { t: 'tf', q: '„I\'m wanting a new phone.“ je správně.', a: false, why: '*want* je stavové: *I want a new phone.*' },
        { t: 'tf', q: '„What are you thinking about?“ je správně.', a: true, why: '*think about* = přemýšlet, děj → continuous je v pořádku.' },
        { t: 'input', q: 'Doplň: The Earth ___ (go) round the Sun.', a: ['goes'], why: 'Obecná pravda → present simple.' },
        { t: 'input', q: 'Doplň: Prices ___ (rise) at the moment.', a: ['are rising', "'re rising"], why: '*at the moment*, probíhající změna → continuous.' },
        { t: 'choice', q: 'This soup ___ delicious.', o: ['tastes', 'is tasting', 'taste'], a: 0, why: '*taste* jako vlastnost = stav → simple.' },
        { t: 'pair', q: 'Spoj výraz s časem.', pairs: [['She works in a bank.', 'trvale, obvykle'], ['She’s working from home this week.', 'dočasně'], ['Water boils at 100 °C.', 'obecná pravda'], ['Look! It’s snowing.', 'právě teď']] },
        { t: 'choice', q: 'He ___ always ___ his keys! (rozčílení nad opakovaným zvykem)', o: ['is … losing', 'does … lose', 'has … lose'], a: 0, why: '*always* + continuous vyjadřuje podráždění.' },
        { t: 'open', q: 'Kdy použiješ present simple a kdy present continuous?', a: 'Present simple pro zvyky, fakta a trvalé stavy (*I live in Brno*). Present continuous pro děj probíhající teď nebo dočasně (*I\'m living with friends this year*).' },
        { t: 'open', q: 'Co jsou stavová slovesa? Uveď příklady.', a: 'Slovesa popisující stav, ne děj – pocity, myšlení, vlastnictví, smysly (*know, like, want, own, seem*). Obvykle se nepoužívají v průběhovém tvaru.' },
      ],
    },
    {
      id: 'past-tenses',
      title: 'Minulé časy ve vyprávění',
      emoji: '📖',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: '*It **was raining**. I **was walking** home. Suddenly I **saw** that someone **had broken** my car window.*' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1, label: 'someone had broken the window' },
              { year: 2, label: 'it was raining (pozadí)' },
              { year: 3, label: 'I saw it' },
            ] } },
            { t: 'list', items: ['past continuous = kulisa, děj v průběhu', 'past simple = hlavní události za sebou', 'past perfect = co se stalo ještě dřív'] },
            { t: 'key', text: 'Kulisa → continuous, děj → simple, „předminulost“ → past perfect.' },
          ],
        },
        {
          title: 'Tvary',
          blocks: [
            { t: 'table', head: ['Čas', 'Tvar', 'Příklad'], rows: [
              ['past simple', 'V-ed / 2. tvar', 'I left.'],
              ['past continuous', 'was/were + V-ing', 'I was leaving.'],
              ['past perfect', 'had + 3. tvar', 'I had left.'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'go', back: 'went – gone' },
              { front: 'break', back: 'broke – broken' },
              { front: 'see', back: 'saw – seen' },
              { front: 'write', back: 'wrote – written' },
              { front: 'begin', back: 'began – begun' },
            ] } },
            { t: 'key', text: '*when* + past simple přeruší děj v průběhu: *I was cooking when the phone rang.*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ TV when the lights went out.', o: ['was watching', 'watched', 'had watched'], a: 0, why: 'Probíhající děj přerušený jiným.' },
        { t: 'choice', q: 'When we arrived, the film ___ already ___.', o: ['had … started', 'was … starting', 'has … started'], a: 0, why: 'Začal dřív než náš příchod → past perfect.' },
        { t: 'choice', q: 'She opened the door, ___ in and sat down.', o: ['came', 'was coming', 'had come'], a: 0, why: 'Řada událostí za sebou → past simple.' },
        { t: 'input', q: 'Doplň 2. tvar: catch → ___', a: ['caught'] },
        { t: 'input', q: 'Doplň: While I ___ (read), I fell asleep.', a: ['was reading'], why: '*while* + děj v průběhu → past continuous.' },
        { t: 'input', q: 'Doplň: He was tired because he ___ (not sleep) well.', a: ["hadn't slept", 'had not slept'], why: 'Příčina v předminulosti → past perfect.' },
        { t: 'tf', q: '„I was knowing the answer.“ je správně.', a: false, why: '*know* je stavové → *I knew the answer.*' },
        { t: 'order', q: 'Seřaď události chronologicky: „When I got to the station, the train had left, so I took a taxi.“', items: ['the train left', 'I got to the station', 'I took a taxi'] },
        { t: 'pair', q: 'Spoj čas s funkcí.', pairs: [['past simple', 'hlavní událost'], ['past continuous', 'kulisa příběhu'], ['past perfect', 'dřívější událost']] },
        { t: 'choice', q: 'Které je správně?', o: ['I had finished my homework before I went out.', 'I finished my homework before I had gone out.', 'I was finishing my homework before I had went out.'], a: 0, why: 'Dřívější děj → past perfect, pozdější → past simple.' },
        { t: 'open', q: 'Jak se liší past simple a past perfect? Uveď příklad.', a: 'Past simple vyjadřuje událost v minulosti, past perfect událost, která proběhla ještě před ní. *When I arrived, she had left.* – odešla dřív, než jsem přišel.' },
        { t: 'open', q: 'K čemu slouží past continuous ve vyprávění?', a: 'Popisuje pozadí a děje, které právě probíhaly, když se stalo něco jiného. *The sun was shining and birds were singing when…*' },
      ],
    },
    {
      id: 'present-perfect-simple-continuous',
      title: 'Present perfect simple a continuous',
      emoji: '⏳',
      ex: [
        {
          title: 'Situací',
          blocks: [
            { t: 'p', text: 'Máš barvu na rukou: *I\'ve been painting.* (důraz na činnost). Hotový pokoj: *I\'ve painted the room.* (výsledek).' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 2020, label: 'začal jsem se učit kytaru' },
              { year: 2023, label: 'naučil jsem se 20 písní' },
              { year: 2026, label: 'teď: I\'ve been playing for 6 years' },
            ] } },
            { t: 'key', text: 'Simple = výsledek, kolik. Continuous = jak dlouho, činnost.' },
            { t: 'example', q: 'Kolik knih? / Jak dlouho čteš?', a: '*I\'ve read three books.* / *I\'ve been reading for two hours.*' },
          ],
        },
        {
          title: 'Pravidla',
          blocks: [
            { t: 'table', head: ['', 'Tvar', 'Signální slova'], rows: [
              ['simple', 'have/has + 3. tvar', 'already, yet, ever, never, just'],
              ['continuous', 'have/has been + V-ing', 'for, since, all day, lately'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['for', 'since'], items: [
              { text: 'two years', b: 0 }, { text: 'ages', b: 0 }, { text: 'a week', b: 0 }, { text: 'ten minutes', b: 0 },
              { text: '2019', b: 1 }, { text: 'Monday', b: 1 }, { text: 'I was a child', b: 1 }, { text: 'last summer', b: 1 },
            ] } },
            { t: 'key', text: '*for* + doba trvání, *since* + začátek. S určeným minulým časem (*yesterday, in 2010*) → past simple.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ here since 2020.', o: ['have lived', 'live', 'lived'], a: 0, why: 'Trvá do teď → present perfect.' },
        { t: 'choice', q: 'You look tired. ___ you ___ running?', o: ['Have … been', 'Did … been', 'Are … been'], a: 0, why: 'Viditelný následek činnosti → present perfect continuous.' },
        { t: 'choice', q: 'She ___ three emails this morning (a ještě je dopoledne).', o: ['has written', 'has been writing', 'wrote'], a: 0, why: 'Počet = výsledek → simple.' },
        { t: 'choice', q: 'I ___ him yesterday.', o: ['saw', 'have seen', 'have been seeing'], a: 0, why: '*yesterday* = ukončený čas → past simple.' },
        { t: 'input', q: 'Doplň for/since: I\'ve known her ___ primary school.', a: ['since'] },
        { t: 'input', q: 'Doplň for/since: We\'ve been waiting ___ an hour.', a: ['for'] },
        { t: 'input', q: 'Doplň 3. tvar: Have you ever ___ (be) to Scotland?', a: ['been'] },
        { t: 'tf', q: '„I\'ve been knowing him for years.“ je správně.', a: false, why: 'Stavové *know* → *I\'ve known him for years.*' },
        { t: 'tf', q: 'Present perfect continuous zdůrazňuje trvání činnosti.', a: true },
        { t: 'pair', q: 'Spoj začátek s koncem.', pairs: [['I\'ve just', 'finished.'], ['Have you finished', 'yet?'], ['She has never', 'flown.'], ['It\'s been raining', 'all day.']] },
        { t: 'open', q: 'Jaký je rozdíl mezi „I\'ve read your book“ a „I\'ve been reading your book“?', a: 'První: knihu jsem dočetl (výsledek). Druhá: čtu ji nějakou dobu a možná ještě nejsem hotový (důraz na činnost).' },
        { t: 'open', q: 'Kdy nelze použít present perfect a musí být past simple?', a: 'Když je uveden konkrétní ukončený čas v minulosti, např. *yesterday, last week, in 2015, ago*. *I met her in 2015.*' },
      ],
    },
    {
      id: 'future-forms',
      title: 'Vyjádření budoucnosti',
      emoji: '🔮',
      ex: [
        {
          title: 'Diářem',
          blocks: [
            { t: 'list', items: [
              '*I\'m meeting Tom at 6.* – domluveno, v diáři',
              '*I\'m going to study medicine.* – můj plán, záměr',
              '*I\'ll help you!* – rozhodnutí teď, slib',
              '*The train leaves at 7.15.* – jízdní řád',
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'The phone is ringing. I', after: 'get it.', options: ['\'ll', '\'m going to'], a: 0 },
              { before: 'Look at those clouds! It', after: 'rain.', options: ['will', 'is going to'], a: 1 },
              { before: 'The concert', after: 'at 8 p.m.', options: ['starts', 'will be starting'], a: 0 },
              { before: 'We', after: 'to Italy next week – flights are booked.', options: ['are flying', 'fly'], a: 0 },
            ] } },
            { t: 'key', text: 'Rozhodnutí teď → *will*. Plán → *going to*. Domluva → present continuous.' },
          ],
        },
        {
          title: 'Podle jistoty',
          blocks: [
            { t: 'table', head: ['Tvar', 'Kdy', 'Příklad'], rows: [
              ['will', 'názor, odhad (*I think…*)', 'I think she\'ll win.'],
              ['going to', 'předpověď z důkazu', 'He\'s going to fall!'],
              ['present continuous', 'pevná domluva', 'I\'m seeing the dentist on Friday.'],
              ['present simple', 'rozvrh, jízdní řád', 'School starts on 1 September.'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['will', 'going to'], items: [
              { text: 'slib', b: 0 }, { text: 'okamžité rozhodnutí', b: 0 }, { text: 'nabídka pomoci', b: 0 }, { text: 'odhad s I think', b: 0 },
              { text: 'dřívější záměr', b: 1 }, { text: 'předpověď z toho, co vidím', b: 1 }, { text: 'plán na léto', b: 1 },
            ] } },
            { t: 'key', text: 'Po *when, if, before, as soon as* je budoucnost v present simple: *I\'ll call you when I arrive.*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '„I\'m cold.“ – „___ close the window.“', o: ['I\'ll', 'I\'m going to', 'I close'], a: 0, why: 'Okamžité rozhodnutí → *will*.' },
        { t: 'choice', q: 'Our flight ___ at 6.30 tomorrow morning.', o: ['leaves', 'will leave', 'is going to leave'], a: 0, why: 'Jízdní řád → present simple.' },
        { t: 'choice', q: 'She\'s bought paint. She ___ her room.', o: ['is going to paint', 'will paint', 'paints'], a: 0, why: 'Záměr připravený předem → *going to*.' },
        { t: 'choice', q: 'I\'ll text you as soon as I ___ home.', o: ['get', 'will get', 'am going to get'], a: 0, why: 'Po *as soon as* present simple.' },
        { t: 'tf', q: '„What are you doing on Saturday?“ se ptá na plány.', a: true },
        { t: 'tf', q: '„If it will rain, we\'ll stay at home.“ je správně.', a: false, why: 'Po *if* present simple: *If it rains…*' },
        { t: 'input', q: 'Doplň: Watch out! You ___ going to drop it!', a: ['are', "'re"], why: 'Předpověď z toho, co vidím → *be going to*.' },
        { t: 'input', q: 'Doplň: I promise I ___ tell anyone. (záporný slib)', a: ["won't", 'will not'] },
        { t: 'pair', q: 'Spoj větu s funkcí.', pairs: [['I\'ll carry it for you.', 'nabídka'], ['I\'m meeting Jo at 5.', 'domluva'], ['The bus leaves at 9.', 'jízdní řád'], ['It\'s going to crash!', 'předpověď z důkazu']] },
        { t: 'choice', q: 'I think people ___ on Mars one day.', o: ['will live', 'are living', 'live'], a: 0, why: 'Názor, odhad → *will*.' },
        { t: 'open', q: 'Jaký je rozdíl mezi will a going to?', a: '*Will* vyjadřuje okamžité rozhodnutí, slib, nabídku nebo odhad. *Going to* vyjadřuje předem promyšlený záměr nebo předpověď podloženou tím, co vidíme.' },
        { t: 'open', q: 'Jak vyjádříš budoucnost, když je něco pevně domluveno nebo dané rozvrhem?', a: 'Domluvu vyjádříme present continuous (*I\'m meeting her tonight*), rozvrh a jízdní řád present simple (*The film starts at 8*).' },
      ],
    },
    {
      id: 'articles',
      title: 'Členy a, an, the',
      emoji: '🅰️',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: '*I saw **a** dog in the park. **The** dog was huge.* – poprvé *a*, podruhé už víme který → *the*.' },
            { t: 'p', text: 'Obecně a v množném čísle bez členu: ***Dogs** are loyal.*' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She is', after: 'engineer.', options: ['a', 'an', 'the'], a: 1 },
              { before: '', after: 'sun is shining.', options: ['A', 'The', '–'], a: 1 },
              { before: 'I love', after: 'music.', options: ['the', 'a', '–'], a: 2 },
              { before: 'It\'s', after: 'university in Prague.', options: ['a', 'an', 'the'], a: 0 },
            ] } },
            { t: 'key', text: 'Nové, jedno z mnoha → *a/an*. Známé, jedinečné → *the*. Obecně → nic.' },
          ],
        },
        {
          title: 'Pravidla',
          blocks: [
            { t: 'table', head: ['Člen', 'Použití', 'Příklad'], rows: [
              ['a / an', 'poprvé zmíněné, povolání', 'a job, an hour'],
              ['the', 'známé, jedinečné, 3. stupeň', 'the moon, the best'],
              ['–', 'obecně, jména, jídla, jazyky', 'Czech, breakfast'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['the', 'bez členu'], items: [
              { text: 'Thames', b: 0 }, { text: 'Alps', b: 0 }, { text: 'United Kingdom', b: 0 }, { text: 'Atlantic', b: 0 },
              { text: 'France', b: 1 }, { text: 'Lake Como', b: 1 }, { text: 'Mount Everest', b: 1 }, { text: 'Oxford Street', b: 1 },
            ] } },
            { t: 'key', text: '*an* se řídí výslovností: *an hour, an MP*, ale *a university, a European*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'It took ___ hour.', o: ['an', 'a', 'the'], a: 0, why: '*h* se nevyslovuje → samohláska → *an*.' },
        { t: 'choice', q: 'He wants to be ___ doctor.', o: ['a', 'the', '–'], a: 0, why: 'Povolání → *a/an*.' },
        { t: 'choice', q: '___ Danube flows through Vienna.', o: ['The', 'A', '–'], a: 0, why: 'Řeky mají *the*.' },
        { t: 'choice', q: 'I usually have ___ breakfast at 7.', o: ['–', 'a', 'the'], a: 0, why: 'Jídla dne bez členu.' },
        { t: 'input', q: 'Doplň člen: Everest is ___ highest mountain in the world.', a: ['the'], why: '3. stupeň → *the*.' },
        { t: 'input', q: 'Doplň a/an: ___ useful tip', a: ['a'], why: '*useful* začíná hláskou /j/ → *a*.' },
        { t: 'tf', q: '„The life is beautiful.“ je správně (obecně).', a: false, why: 'Obecné pojmy bez členu: *Life is beautiful.*' },
        { t: 'tf', q: '„She plays the piano.“ je správně.', a: true, why: 'Hudební nástroje mají *the*.' },
        { t: 'pair', q: 'Spoj se správným členem.', pairs: [['___ honest man', 'an'], ['___ one-way ticket', 'a'], ['___ Czech Republic', 'the'], ['___ Germany', '–']] },
        { t: 'choice', q: 'Která věta je správně?', o: ['I go to school by bus.', 'I go to the school by the bus.', 'I go to a school by a bus.'], a: 0, why: '*go to school* (instituce) a *by bus* bez členu.' },
        { t: 'open', q: 'Kdy použiješ neurčitý a kdy určitý člen?', a: 'Neurčitý *a/an* u počitatelného podstatného jména v jednotném čísle, když ho zmiňujeme poprvé nebo jde o kterékoli. Určitý *the*, když je jasné, o kterou věc jde, nebo je jedinečná.' },
        { t: 'open', q: 'Kdy se člen nepoužívá vůbec?', a: 'Při obecných tvrzeních s množným číslem a nepočitatelnými slovy (*Cats like milk*), u většiny jmen osob, zemí, měst, jazyků a u jídel dne.' },
      ],
    },
    {
      id: 'comparison-advanced',
      title: 'Stupňování pokročile',
      emoji: '📊',
      ex: [
        {
          title: 'Grafem',
          blocks: [
            { t: 'w', w: 'bars', p: { unit: 'Kč', items: [
              { label: 'pen', value: 20 }, { label: 'book', value: 300 }, { label: 'phone', value: 9000 },
            ] } },
            { t: 'list', items: [
              'The book is **much / far more expensive** than the pen. (o hodně)',
              'The book is **slightly / a bit more expensive** than… (o trochu)',
              'The pen is **nowhere near as expensive as** the phone.',
            ] },
            { t: 'key', text: 'Rozdíl zesílíš *much, far, a lot*, zmírníš *a bit, slightly*.' },
          ],
        },
        {
          title: 'Vzorci',
          blocks: [
            { t: 'table', head: ['Konstrukce', 'Význam', 'Příklad'], rows: [
              ['the + 2. st., the + 2. st.', 'čím…, tím…', 'The sooner, the better.'],
              ['2. st. and 2. st.', 'čím dál', 'It\'s getting colder and colder.'],
              ['as … as', 'stejně', 'She\'s as tall as me.'],
              ['not as/so … as', 'méně', 'It\'s not as cold as yesterday.'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'good', back: 'better – the best' },
              { front: 'bad', back: 'worse – the worst' },
              { front: 'far', back: 'further – the furthest' },
              { front: 'little', back: 'less – the least' },
              { front: 'many / much', back: 'more – the most' },
            ] } },
            { t: 'key', text: 'Nikdy *more better* ani *very bigger* – před 2. stupněm patří *much*, ne *very*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'This test was ___ easier than the last one.', o: ['much', 'very', 'more'], a: 0, why: '2. stupeň zesiluje *much*, ne *very*.' },
        { t: 'choice', q: 'The more you practise, ___ you get.', o: ['the better', 'better', 'the best'], a: 0, why: 'Čím…, tím… = *the + 2. st., the + 2. st.*' },
        { t: 'choice', q: 'The traffic is getting ___.', o: ['worse and worse', 'more and more bad', 'worst and worst'], a: 0, why: '*bad – worse*, čím dál = opakování 2. stupně.' },
        { t: 'input', q: 'Doplň 2. stupeň: Prague is ___ (far) from Ostrava than Brno is.', a: ['farther', 'further'] },
        { t: 'input', q: 'Doplň: My phone isn\'t ___ expensive as yours.', a: ['as', 'so'] },
        { t: 'tf', q: '„She is more cleverer than me.“ je správně.', a: false, why: 'Buď *cleverer*, nebo *more clever*, nikdy obojí.' },
        { t: 'tf', q: '„It was by far the best film of the year.“ je správně.', a: true, why: '*by far* zesiluje 3. stupeň.' },
        { t: 'order', q: 'Seřaď slova do věty.', items: ['The more', 'you read,', 'the more', 'you know.'] },
        { t: 'pair', q: 'Spoj 1. a 2. stupeň.', pairs: [['good', 'better'], ['bad', 'worse'], ['little', 'less'], ['many', 'more']] },
        { t: 'choice', q: 'Která věta znamená „Jan je mnohem méně trpělivý než Eva“?', o: ['Jan is far less patient than Eva.', 'Jan is far more patient than Eva.', 'Jan is as patient as Eva.'], a: 0 },
        { t: 'open', q: 'Jak v angličtině řekneš „čím víc, tím líp“ a jak se tvoří tato konstrukce?', a: '*The more, the better.* Tvoří se *the + 2. stupeň…, the + 2. stupeň…*, např. *The older he gets, the wiser he becomes.*' },
        { t: 'open', q: 'Jak zesílit nebo zmírnit rozdíl při srovnání?', a: 'Před 2. stupeň dáme *much, far, a lot* (velký rozdíl) nebo *slightly, a bit, a little* (malý rozdíl). *Very* se s 2. stupněm nepoužívá.' },
      ],
    },
    {
      id: 'modals-obligation-permission',
      title: 'Povinnost a svolení',
      emoji: '🚦',
      ex: [
        {
          title: 'Ve škole',
          blocks: [
            { t: 'list', items: [
              '*You **must** be quiet in the library.* – pravidlo / mluvčí to vyžaduje',
              '*I **have to** wear a uniform.* – vnější povinnost',
              '*You **mustn\'t** use phones in exams.* – zákaz',
              '*You **don\'t have to / needn\'t** come.* – není nutné',
              '*Students **are allowed to / can** leave early.* – smí',
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['zakázáno', 'není nutné'], items: [
              { text: 'You mustn\'t smoke here.', b: 0 }, { text: 'You can\'t park here.', b: 0 }, { text: 'You aren\'t allowed to swim.', b: 0 },
              { text: 'You don\'t have to pay.', b: 1 }, { text: 'You needn\'t hurry.', b: 1 }, { text: 'You don\'t need to bring food.', b: 1 },
            ] } },
            { t: 'key', text: '*mustn\'t* = nesmíš. *don\'t have to* = nemusíš.' },
          ],
        },
        {
          title: 'V časech',
          blocks: [
            { t: 'p', text: '*Must* a *can* nemají všechny časy – nahradí je *have to* a *be allowed to*.' },
            { t: 'table', head: ['Teď', 'Minulost', 'Budoucnost'], rows: [
              ['must / have to', 'had to', 'will have to'],
              ['can / am allowed to', 'could / was allowed to', 'will be allowed to'],
              ['don\'t have to', 'didn\'t have to', 'won\'t have to'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Yesterday I', after: 'work late.', options: ['had to', 'must'], a: 0 },
              { before: 'Next year we', after: 'wear uniforms.', options: ['will have to', 'will must'], a: 0 },
              { before: 'When I was 15, I', after: 'stay out late.', options: ['wasn\'t allowed to', 'mustn\'t'], a: 0 },
            ] } },
            { t: 'key', text: 'Minulost od *must* = *had to*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Tomorrow is a holiday, so we ___ get up early.', o: ['don\'t have to', 'mustn\'t', 'can\'t'], a: 0, why: 'Není nutné → *don\'t have to*.' },
        { t: 'choice', q: 'You ___ touch that wire – it\'s dangerous!', o: ['mustn\'t', 'don\'t have to', 'needn\'t'], a: 0, why: 'Zákaz → *mustn\'t*.' },
        { t: 'choice', q: 'Last year I ___ walk to school every day.', o: ['had to', 'must', 'have to'], a: 0, why: 'Minulost od *must* je *had to*.' },
        { t: 'choice', q: '___ I open the window? (zdvořile žádám o svolení)', o: ['May', 'Must', 'Have'], a: 0 },
        { t: 'tf', q: '„You mustn\'t come“ a „You don\'t have to come“ znamenají totéž.', a: false, why: 'První = nesmíš přijít, druhé = nemusíš přijít.' },
        { t: 'tf', q: '„Will must“ je gramaticky správný tvar.', a: false, why: 'Dvě modální slovesa za sebou nejdou → *will have to*.' },
        { t: 'input', q: 'Doplň: She ___ (not need) to worry. – jedno modální sloveso, zápor', a: ["needn't", 'need not'] },
        { t: 'input', q: 'Doplň: We ___ allowed to use calculators in yesterday\'s test. (zápor)', a: ["weren't", 'were not'] },
        { t: 'pair', q: 'Spoj s významem.', pairs: [['must', 'musíš (pravidlo)'], ['mustn\'t', 'nesmíš'], ['don\'t have to', 'nemusíš'], ['can', 'smíš']] },
        { t: 'choice', q: 'Která věta je správně?', o: ['Do you have to wear a tie at work?', 'Do you must wear a tie at work?', 'Have you to wear a tie at work?'], a: 0 },
        { t: 'open', q: 'Vysvětli rozdíl mezi mustn\'t a don\'t have to.', a: '*Mustn\'t* vyjadřuje zákaz – nesmíš to udělat. *Don\'t have to* znamená, že to není nutné, ale můžeš.' },
        { t: 'open', q: 'Popiš anglicky tři pravidla své školy.', a: 'Např.: *We have to be at school at 8. We mustn\'t use phones in lessons. We don\'t have to wear a uniform.*' },
      ],
    },
    {
      id: 'question-formation',
      title: 'Tvoření otázek',
      emoji: '❓',
      ex: [
        {
          title: 'Kdo co komu',
          blocks: [
            { t: 'p', text: '*Tom called Anna.*' },
            { t: 'list', items: [
              'Ptám se na podmět (kdo volal?): ***Who called** Anna?* – bez *did*',
              'Ptám se na předmět (koho volal?): ***Who did** Tom **call**?* – s *did*',
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Who', after: 'the window? – Peter broke it.', options: ['broke', 'did break'], a: 0 },
              { before: 'What', after: 'you buy? – A jacket.', options: ['did', 'was'], a: 0 },
              { before: 'What', after: '? – A car crash happened.', options: ['happened', 'did happen'], a: 0 },
              { before: 'Who', after: 'you invite? – Jane.', options: ['did', 'have'], a: 0 },
            ] } },
            { t: 'key', text: 'Když *who/what* je podmět, pomocné sloveso se nepoužívá.' },
          ],
        },
        {
          title: 'Nepřímé otázky',
          blocks: [
            { t: 'p', text: 'Zdvořilý úvod (*Could you tell me…, Do you know…*) → pořadí jako v oznamovací větě.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Where is the station?', back: 'Could you tell me where the station is?' },
              { front: 'What time does it start?', back: 'Do you know what time it starts?' },
              { front: 'Is it open?', back: 'I wonder if it is open.' },
              { front: 'Did she pass?', back: 'Do you know whether she passed?' },
            ] } },
            { t: 'key', text: 'V nepřímé otázce: podmět + sloveso, žádné *do/does/did*. Bez tázacího slova → *if/whether*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Who ___ the Mona Lisa?', o: ['painted', 'did paint', 'did painted'], a: 0, why: 'Ptáme se na podmět → bez *did*.' },
        { t: 'choice', q: 'Who ___ you meet at the party?', o: ['did', 'have', 'was'], a: 0, why: 'Ptáme se na předmět → *did*.' },
        { t: 'choice', q: 'Can you tell me where ___?', o: ['the toilets are', 'are the toilets', 'do the toilets are'], a: 0, why: 'Nepřímá otázka → oznamovací pořadí.' },
        { t: 'choice', q: 'Do you know ___ the bus has left?', o: ['if', 'that', 'what'], a: 0, why: 'Zjišťovací otázka → *if/whether*.' },
        { t: 'input', q: 'Doplň pomocné sloveso: Where ___ you go last summer?', a: ['did'] },
        { t: 'input', q: 'Doplň: What ___ (happen) at school yesterday? – jedno slovo', a: ['happened'], why: '*What* je podmět → bez *did*.' },
        { t: 'tf', q: '„Could you tell me what time is it?“ je správně.', a: false, why: 'Správně: *what time it is*.' },
        { t: 'order', q: 'Seřaď slova do otázky.', items: ['How long', 'have', 'you', 'lived', 'here?'] },
        { t: 'pair', q: 'Spoj otázku s odpovědí.', pairs: [['Who saw you?', 'My teacher saw me.'], ['Who did you see?', 'I saw my teacher.'], ['What fell?', 'A vase fell.']] },
        { t: 'choice', q: 'Která otázka je správně?', o: ['How often do you go swimming?', 'How often you go swimming?', 'How often are you go swimming?'], a: 0 },
        { t: 'open', q: 'Jaký je rozdíl mezi „Who loves Jack?“ a „Who does Jack love?“?', a: 'V první se ptáme na podmět – kdo miluje Jacka. Ve druhé na předmět – koho miluje Jack; proto je tam pomocné sloveso *does*.' },
        { t: 'open', q: 'Jak se tvoří nepřímé otázky?', a: 'Po zdvořilém úvodu (*Could you tell me, Do you know*) následuje tázací slovo nebo *if/whether* a slovosled oznamovací věty bez *do/does/did*: *Do you know where she lives?*' },
      ],
    },
  ],
} satisfies Subject
