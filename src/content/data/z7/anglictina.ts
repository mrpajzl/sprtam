import type { Subject } from '../../types'

export default {
  grade: 'z7',
  subject: 'anglictina',
  topics: [
    {
      id: 'past-continuous',
      title: 'Minulý čas průběhový',
      emoji: '🎬',
      ex: [
        {
          title: 'Jako film',
          blocks: [
            { t: 'p', text: 'Zastav film včera v 8 večer. Co se zrovna dělo?' },
            { t: 'p', text: '*At 8 pm I **was reading**. My parents **were cooking**.*' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 7, label: '7:00 start reading' },
              { year: 8, label: '8:00 I was reading' },
              { year: 9, label: '9:00 stop reading' },
            ] } },
            { t: 'key', text: 'Děj **probíhal** v určitém okamžiku v minulosti.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'table', head: ['', 'Vzorec', 'Příklad'], rows: [
              ['kladně', 'was / were + -ing', 'She was sleeping.'],
              ['zápor', "wasn't / weren't + -ing", "We weren't playing."],
              ['otázka', 'Was / Were + podmět + -ing?', 'Were you working?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I', after: 'watching TV at 6.', options: ['was', 'were'], a: 0 },
              { before: 'They were', after: 'football.', options: ['playing', 'play', 'played'], a: 0 },
              { before: 'It', after: 'raining all day.', options: ['was', 'were'], a: 0 },
              { before: '', after: 'you sleeping at midnight?', options: ['Were', 'Did'], a: 0 },
            ] } },
            { t: 'key', text: '**was/were + sloveso-ing**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'At 7 o\'clock she ___ dinner.', o: ['was having', 'were having', 'was have'], a: 0 },
        { t: 'choice', q: 'We ___ for the bus.', o: ['were waiting', 'was waiting', 'were wait'], a: 0 },
        { t: 'input', q: 'Doplň: They ___ (swim) in the lake at noon.', a: ['were swimming'] },
        { t: 'input', q: 'Doplň: He ___ (not / listen).', a: ["wasn't listening", 'was not listening'] },
        { t: 'tf', q: '„I were sleeping.“ je správně.', a: false, why: 'I → was: I was sleeping.' },
        { t: 'tf', q: 'Minulý průběhový čas popisuje děj, který v daném okamžiku probíhal.', a: true },
        { t: 'order', q: 'Seřaď otázku.', items: ['What', 'were', 'you', 'doing', 'at 9?'] },
        { t: 'input', q: 'Krátká odpověď: Was she running? – Yes, she ___.', a: ['was'] },
        { t: 'choice', q: 'Správný -ing tvar od „sit“:', o: ['sitting', 'siting', 'sitteing'], a: 0, why: 'Krátká slabika → zdvojí se t.' },
        { t: 'pair', q: 'Spoj podmět se správným tvarem.', pairs: [['I was writing', 'psal jsem'], ['you were writing', 'psal jsi'], ['they were writing', 'psali'], ['she was writing', 'psala']] },
        { t: 'open', q: 'Jak se tvoří minulý čas průběhový a kdy ho použiješ?', a: 'Was/were + sloveso s -ing. Použiju ho pro děj, který právě probíhal v určitém okamžiku v minulosti: At 5 pm I was doing my homework.' },
        { t: 'open', q: 'Co jsi dělal(a) včera v 7 večer? Odpověz anglicky.', a: 'At 7 pm yesterday I was having dinner with my family.' },
      ],
    },
    {
      id: 'past-simple-vs-continuous',
      title: 'When / while',
      emoji: '⚡',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: '*I **was having** a bath **when** the phone **rang**.*' },
            { t: 'p', text: 'Dlouhý děj (koupel) přeruší krátký (telefon).' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1, label: 'I was having a bath…' },
              { year: 2, label: '📞 the phone rang!' },
              { year: 3, label: '…still having a bath' },
            ] } },
            { t: 'key', text: 'Dlouhý děj = **průběhový**, krátká událost = **prostý**.' },
          ],
        },
        {
          title: 'Spojkami',
          blocks: [
            { t: 'table', head: ['Spojka', 'Po ní', 'Příklad'], rows: [
              ['when', 'krátký děj (prostý)', 'She was reading **when** I came.'],
              ['while', 'dlouhý děj (průběhový)', '**While** she was reading, I came.'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I was walking home', after: 'it started to rain.', options: ['when', 'while'], a: 0 },
              { before: '', after: 'we were eating, the lights went out.', options: ['While', 'When'], a: 0 },
              { before: 'He fell while he', after: '.', options: ['was skiing', 'skied'], a: 0 },
              { before: 'They were talking when the teacher', after: 'in.', options: ['came', 'was coming'], a: 0 },
            ] } },
            { t: 'key', text: '**when** + past simple, **while** + past continuous.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ TV when you called.', o: ['was watching', 'watched', 'were watching'], a: 0 },
        { t: 'choice', q: 'She was cooking when the dog ___ the meat.', o: ['stole', 'was stealing', 'steals'], a: 0 },
        { t: 'choice', q: '___ I was sleeping, someone knocked.', o: ['While', 'When', 'During'], a: 0, why: 'While + dlouhý (průběhový) děj.' },
        { t: 'input', q: 'Doplň: We were playing when it ___ (start) to snow.', a: ['started'] },
        { t: 'input', q: 'Doplň: While Tom ___ (run), he lost his phone.', a: ['was running'] },
        { t: 'tf', q: 'Ve větě „I met Jan while I was shopping.“ je delší děj „shopping“.', a: true },
        { t: 'tf', q: 'Dva krátké děje jdoucí po sobě dáme oba do past simple: „I opened the door and saw a cat.“', a: true, why: 'Děje se staly jeden po druhém, žádný neprobíhal.' },
        { t: 'order', q: 'Seřaď větu.', items: ['I', 'was reading', 'when', 'the lights', 'went out.'] },
        { t: 'choice', q: 'Dva krátké děje po sobě: She ___ the letter and ___ it.', o: ['opened – read', 'was opening – was reading', 'opened – was reading'], a: 0, why: 'Děje jdou po sobě → oba v prostém čase.' },
        { t: 'pair', q: 'Spoj začátek a konec.', pairs: [['I was sleeping', 'when the alarm rang.'], ['While we were swimming,', 'it got cold.'], ['He broke his leg', 'while he was skiing.']] },
        { t: 'open', q: 'Jaký je rozdíl mezi „I was cooking“ a „I cooked“?', a: 'I was cooking = děj právě probíhal (pozadí příběhu). I cooked = ukončený děj, celý se stal.' },
        { t: 'open', q: 'Vytvoř anglickou větu se spojkou while a dvěma ději v minulosti.', a: 'While I was walking to school, I saw a fox.' },
      ],
    },
    {
      id: 'comparatives',
      title: '2. stupeň přídavných jmen',
      emoji: '⚖️',
      ex: [
        {
          title: 'Porovnáním',
          blocks: [
            { t: 'pic', items: ['🐘', '>', '🐭'], caption: 'An elephant is bigger than a mouse.' },
            { t: 'p', text: 'Krátké slovo + **-er**: *tall → taller*. Dlouhé: **more** + slovo: *more expensive*.' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'small', label: 'slovo' }, { text: 'er', label: '2. stupeň' }] },
              { parts: [{ text: 'big', label: 'slovo' }, { text: 'g', label: 'zdvojení' }, { text: 'er', label: '2. stupeň' }] },
              { parts: [{ text: 'happ', label: 'slovo' }, { text: 'i', label: 'y → i' }, { text: 'er', label: '2. stupeň' }] },
            ] } },
            { t: 'key', text: 'Porovnání: 2. stupeň + **than**.' },
          ],
        },
        {
          title: 'Pravidly',
          blocks: [
            { t: 'table', head: ['Slovo', 'Pravidlo', 'Příklad'], rows: [
              ['1 slabika', '+ er', 'old → older'],
              ['končí -e', '+ r', 'nice → nicer'],
              ['souhláska + y', 'y → ier', 'easy → easier'],
              ['2+ slabiky', 'more + slovo', 'more interesting'],
              ['nepravidelná', '—', 'good → better, bad → worse, far → further/farther'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['+ er', 'more…'], items: [
              { text: 'fast', b: 0 }, { text: 'cheap', b: 0 }, { text: 'funny', b: 0 }, { text: 'hot', b: 0 },
              { text: 'beautiful', b: 1 }, { text: 'difficult', b: 1 }, { text: 'expensive', b: 1 }, { text: 'boring', b: 1 },
            ] } },
            { t: 'key', text: '**good → better, bad → worse** se naučit.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: '2. stupeň: tall →', a: ['taller'] },
        { t: 'input', q: '2. stupeň: big →', a: ['bigger'] },
        { t: 'input', q: '2. stupeň: good →', a: ['better'] },
        { t: 'input', q: '2. stupeň: bad →', a: ['worse'] },
        { t: 'choice', q: 'Maths is ___ than art.', o: ['more difficult', 'difficulter', 'most difficult'], a: 0 },
        { t: 'choice', q: 'Today is ___ than yesterday.', o: ['hotter', 'hoter', 'more hot'], a: 0, why: 'Krátká slabika → zdvojí se t.' },
        { t: 'choice', q: 'My dog is bigger ___ your dog.', o: ['than', 'that', 'then'], a: 0 },
        { t: 'tf', q: '„This test is more easy.“ je správně.', a: false, why: 'Easy → easier.' },
        { t: 'pair', q: 'Spoj s 2. stupněm.', pairs: [['young', 'younger'], ['heavy', 'heavier'], ['modern', 'more modern'], ['nice', 'nicer']] },
        { t: 'order', q: 'Seřaď větu.', items: ['A car', 'is', 'faster', 'than', 'a bike.'] },
        { t: 'open', q: 'Jak se tvoří 2. stupeň krátkých a dlouhých přídavných jmen?', a: 'Krátká přidají -er (cold → colder), dlouhá mají more (more famous). Za porovnáním je than.' },
        { t: 'open', q: 'Porovnej anglicky dvě zvířata.', a: 'A cheetah is faster than a lion. A lion is heavier than a cheetah.' },
      ],
    },
    {
      id: 'superlatives',
      title: '3. stupeň přídavných jmen',
      emoji: '🏆',
      ex: [
        {
          title: 'Na stupních vítězů',
          blocks: [
            { t: 'pic', items: ['🥉', '🥈', '🥇'], caption: 'fast – faster – the fastest' },
            { t: 'p', text: 'Nejlepší ze všech: **the** + **-est** / **the most**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'tall', back: 'the tallest' },
              { front: 'happy', back: 'the happiest' },
              { front: 'big', back: 'the biggest' },
              { front: 'famous', back: 'the most famous' },
              { front: 'good', back: 'the best' },
              { front: 'bad', back: 'the worst' },
            ] } },
            { t: 'key', text: 'Před 3. stupněm vždy **the**.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['1.', '2.', '3.'], rows: [
              ['cold', 'colder', 'the coldest'],
              ['easy', 'easier', 'the easiest'],
              ['interesting', 'more interesting', 'the most interesting'],
              ['good', 'better', 'the best'],
              ['bad', 'worse', 'the worst'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Everest is the', after: 'mountain in the world.', options: ['highest', 'higher', 'most high'], a: 0 },
              { before: 'It\'s the', after: 'film I\'ve ever seen.', options: ['best', 'better', 'goodest'], a: 0 },
              { before: 'She is the most', after: 'girl in our class.', options: ['popular', 'popularest'], a: 0 },
            ] } },
            { t: 'key', text: 'Krátká: **the -est**, dlouhá: **the most**.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: '3. stupeň: small →', a: ['the smallest', 'smallest'] },
        { t: 'input', q: '3. stupeň: good →', a: ['the best', 'best'] },
        { t: 'input', q: '3. stupeň: bad →', a: ['the worst', 'worst'] },
        { t: 'choice', q: 'The blue whale is ___ animal on Earth.', o: ['the biggest', 'the bigest', 'the most big'], a: 0 },
        { t: 'choice', q: 'This is ___ book in the library.', o: ['the most expensive', 'the expensivest', 'more expensive'], a: 0 },
        { t: 'choice', q: 'Monday is the ___ day of the week.', o: ['busiest', 'busyest', 'most busy'], a: 0, why: 'Souhláska + y → iest.' },
        { t: 'tf', q: '„He is the most tall boy.“ je správně.', a: false, why: 'Tall je krátké: the tallest.' },
        { t: 'tf', q: 'Před 3. stupněm přídavného jména obvykle stojí the.', a: true },
        { t: 'order', q: 'Seřaď od nejnižšího stupně.', items: ['bad', 'worse', 'the worst'] },
        { t: 'pair', q: 'Spoj.', pairs: [['fast', 'the fastest'], ['dangerous', 'the most dangerous'], ['pretty', 'the prettiest'], ['far', 'the furthest']] },
        { t: 'open', q: 'Jak se tvoří 3. stupeň? Uveď i dva nepravidelné tvary.', a: 'The + -est u krátkých (the oldest), the most u dlouhých (the most beautiful). Nepravidelné: good – the best, bad – the worst.' },
        { t: 'open', q: 'Řekni anglicky, kdo je nejvyšší ve tvé rodině a co je tvůj nejoblíbenější předmět.', a: 'My dad is the tallest in my family. My favourite subject is English – it\'s the most interesting.' },
      ],
    },
    {
      id: 'as-as',
      title: '(not) as … as',
      emoji: '🟰',
      ex: [
        {
          title: 'Obrázkem',
          blocks: [
            { t: 'pic', items: ['🧍', '=', '🧍'], caption: 'Tom is as tall as Ben.' },
            { t: 'pic', items: ['🐢', '<', '🐇'], caption: 'A tortoise is not as fast as a rabbit.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'My bag is as heavy', after: 'yours.', options: ['as', 'than'], a: 0 },
              { before: 'Cats aren\'t', after: 'loud as dogs.', options: ['as', 'so'], a: 0 },
              { before: 'She is as', after: 'as her sister.', options: ['clever', 'cleverer'], a: 0 },
            ] } },
            { t: 'key', text: '**as + přídavné jméno + as** = stejně.' },
          ],
        },
        {
          title: 'Převodem',
          blocks: [
            { t: 'p', text: '*not as … as* = méně než. Dá se přepsat na 2. stupeň.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Prague is bigger than Brno.', back: 'Brno is not as big as Prague.' },
              { front: 'Bikes are slower than cars.', back: 'Bikes aren\'t as fast as cars.' },
              { front: 'Tea is cheaper than coffee.', back: 'Tea isn\'t as expensive as coffee.' },
            ] } },
            { t: 'key', text: 'Mezi **as … as** je základní tvar, ne 2. stupeň.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jana is ___ tall as Eva.', o: ['as', 'so', 'than'], a: 0 },
        { t: 'choice', q: 'This film isn\'t as good ___ the book.', o: ['as', 'than', 'like'], a: 0 },
        { t: 'choice', q: 'Vyber správně.', o: ['as cold as', 'as colder as', 'as cold than'], a: 0 },
        { t: 'tf', q: '„A mouse is not as big as a cat.“ znamená, že myš je menší.', a: true },
        { t: 'tf', q: '„My room is as bigger as yours.“ je správně.', a: false, why: 'Mezi as … as je základní tvar: as big as.' },
        { t: 'input', q: 'Doplň: Winter isn\'t as warm ___ summer.', a: ['as'] },
        { t: 'input', q: 'Doplň: He runs as fast ___ me.', a: ['as'] },
        { t: 'choice', q: '„Ben is shorter than Tom.“ znamená totéž co:', o: ['Ben isn\'t as tall as Tom.', 'Tom isn\'t as tall as Ben.', 'Ben is as tall as Tom.'], a: 0 },
        { t: 'order', q: 'Seřaď větu.', items: ['English', 'is', 'as easy', 'as', 'Maths.'] },
        { t: 'pair', q: 'Spoj se stejným významem.', pairs: [['as old as', 'stejně starý'], ['not as old as', 'mladší'], ['older than', 'starší']] },
        { t: 'open', q: 'Co znamená „as … as“ a „not as … as“?', a: 'As … as znamená „stejně … jako“ (as tall as). Not as … as znamená „ne tak … jako“, tedy méně (not as tall as = menší).' },
        { t: 'open', q: 'Porovnej anglicky sebe a kamaráda pomocí as … as.', a: 'I am as old as Petr, but I\'m not as tall as him.' },
      ],
    },
    {
      id: 'will-future',
      title: 'Budoucnost s will',
      emoji: '🔮',
      ex: [
        {
          title: 'Situacemi',
          blocks: [
            { t: 'list', items: [
              'Předpověď: *I think it **will** be sunny tomorrow.*',
              'Rozhodnutí teď: *I\'m thirsty. – I**\'ll** get you some water.*',
              'Slib: *I **won\'t** tell anyone.*',
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['předpověď', 'rozhodnutí teď', 'slib'], items: [
              { text: 'People will live on Mars.', b: 0 }, { text: 'You\'ll pass the test.', b: 0 },
              { text: 'The phone is ringing. I\'ll answer it.', b: 1 }, { text: 'I\'ll have the soup, please.', b: 1 },
              { text: 'I promise I\'ll call you.', b: 2 }, { text: 'I won\'t be late again.', b: 2 },
            ] } },
            { t: 'key', text: '**will** = názor, náhlé rozhodnutí, slib.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'table', head: ['', 'Vzorec', 'Příklad'], rows: [
              ['kladně', "will ('ll) + sloveso", "She'll help."],
              ['zápor', "won't (will not) + sloveso", "It won't rain."],
              ['otázka', 'Will + podmět + sloveso?', 'Will you come?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I think he', after: 'win.', options: ['will', 'wills', 'is'], a: 0 },
              { before: 'They won\'t', after: 'here.', options: ['be', 'are', 'being'], a: 0 },
              { before: '', after: 'you help me?', options: ['Will', 'Do', 'Are'], a: 0 },
            ] } },
            { t: 'key', text: 'will je pro **všechny osoby** stejné, bez -s.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Maybe it ___ snow tomorrow.', o: ['will', 'wills', 'is'], a: 0 },
        { t: 'choice', q: 'She will ___ you.', o: ['call', 'calls', 'to call'], a: 0, why: 'Po will je základní tvar bez to.' },
        { t: 'input', q: 'Zápor od „will“ (zkráceně):', a: ["won't"] },
        { t: 'input', q: 'Doplň: I promise I ___ forget. (nezapomenu)', a: ["won't", 'will not'] },
        { t: 'tf', q: '„I\'ll open the window.“ může být rozhodnutí v okamžiku mluvení.', a: true },
        { t: 'tf', q: '„He wills come.“ je správně.', a: false, why: 'Will nemá -s: He will come.' },
        { t: 'order', q: 'Seřaď otázku.', items: ['Will', 'you', 'be', 'at home?'] },
        { t: 'input', q: 'Krátká odpověď: Will they come? – Yes, they ___.', a: ['will'] },
        { t: 'choice', q: 'The bag is heavy. – I ___ carry it for you.', o: ["'ll", "'m", "'d"], a: 0, why: 'Nabídka a rozhodnutí teď → will.' },
        { t: 'pair', q: 'Spoj větu s funkcí.', pairs: [['I\'ll always love you.', 'slib'], ['Robots will drive cars.', 'předpověď'], ['I\'ll take the red one.', 'rozhodnutí']] },
        { t: 'open', q: 'Kdy použiješ will? Uveď tři situace.', a: 'Pro předpověď nebo názor (It will rain), pro rozhodnutí v okamžiku mluvení (I\'ll help you) a pro slib (I won\'t tell anyone).' },
        { t: 'open', q: 'Řekni anglicky dvě předpovědi, jak bude vypadat svět za 50 let.', a: 'People will travel to Mars. Cars will drive themselves.' },
      ],
    },
    {
      id: 'going-to-vs-will',
      title: 'Going to, nebo will?',
      emoji: '🤔',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Petr: *I\'m **going to** bake a cake. I bought eggs yesterday.* – plán.' },
            { t: 'p', text: 'Máma: *Oh, we have no sugar! – I**\'ll** buy some.* – rozhodla se teď.' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1, label: 'včera: plán → going to' },
              { year: 2, label: 'teď: nápad → will' },
              { year: 3, label: 'zítra: děj' },
            ] } },
            { t: 'key', text: 'Rozhodnuto **předem** → going to. Rozhodnuto **teď** → will.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'going to', 'will'], rows: [
              ['rozhodnutí', 'už dříve (plán)', 'právě teď'],
              ['předpověď', 'vidím důkaz', 'názor, odhad'],
              ['příklad', 'Look! He\'s going to fall.', 'I think he\'ll win.'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Look at those clouds! It', after: 'rain.', options: ["'s going to", "'ll"], a: 0 },
              { before: 'The phone is ringing. I', after: 'get it.', options: ["'ll", "'m going to"], a: 0 },
              { before: 'We\'ve got tickets. We', after: 'see a concert.', options: ["'re going to", "'ll"], a: 0 },
            ] } },
            { t: 'key', text: 'Vidím důkaz → **going to**. Jen si myslím → **will**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I\'ve decided. I ___ learn to play the guitar.', o: ["'m going to", "'ll"], a: 0, why: 'Rozhodnuto předem → going to.' },
        { t: 'choice', q: 'I\'m cold. – I ___ close the window.', o: ["'ll", "'m going to"], a: 0, why: 'Rozhodnutí teď → will.' },
        { t: 'choice', q: 'Be careful! You ___ drop the plates!', o: ["'re going to", "'ll"], a: 0, why: 'Vidím důkaz → going to.' },
        { t: 'choice', q: 'I think people ___ live longer in the future.', o: ['will', 'are going to'], a: 0, why: 'Názor (I think) → will.' },
        { t: 'tf', q: 'Going to používáme pro plány, o kterých jsme rozhodli dříve.', a: true },
        { t: 'tf', q: 'Ve větě „Look at that car! It\'ll crash!“ je přirozenější going to.', a: true, why: 'Vidím důkaz: It\'s going to crash!' },
        { t: 'input', q: 'Doplň (teď se rozhodnu): I forgot my pen. – Don\'t worry, I ___ lend you one.', a: ["'ll", 'will'] },
        { t: 'input', q: 'Doplň (plán): We are ___ to visit Spain this summer.', a: ['going'] },
        { t: 'pair', q: 'Spoj situaci s formou.', pairs: [['plán z minulého týdne', 'We’re going to fly to Rome.'], ['nabídka pomoci teď', 'I’ll help you.'], ['tmavé mraky na obloze', 'It’s going to rain.'], ['slib', 'I’ll be careful.']] },
        { t: 'order', q: 'Seřaď větu.', items: ['I', 'think', 'you', 'will', 'like it.'] },
        { t: 'open', q: 'Jaký je rozdíl mezi „I\'m going to buy a bike“ a „I\'ll buy a bike“?', a: 'Going to: plán, rozhodl jsem se dřív. Will: rozhodl jsem se právě teď, v okamžiku mluvení.' },
        { t: 'open', q: 'Uveď anglicky jednu předpověď s going to a jednu s will a vysvětli rozdíl.', a: 'Look at the sky – it\'s going to rain (vidím důkaz). I think Sparta will win (můj názor).' },
      ],
    },
    {
      id: 'must-have-to',
      title: 'Must / have to',
      emoji: '🚦',
      ex: [
        {
          title: 'Značkami',
          blocks: [
            { t: 'pic', items: ['🛑'], caption: 'You must stop.' },
            { t: 'pic', items: ['🚭'], caption: 'You mustn\'t smoke here.' },
            { t: 'pic', items: ['🎒', '🆓'], caption: 'Saturday: I don\'t have to go to school.' },
            { t: 'w', w: 'sort', p: { buckets: ['musíš', 'nesmíš', 'nemusíš'], items: [
              { text: 'You must wear a helmet.', b: 0 }, { text: 'I have to get up at 6.', b: 0 },
              { text: 'You mustn\'t run here.', b: 1 }, { text: 'We mustn\'t be late.', b: 1 },
              { text: 'You don\'t have to pay.', b: 2 }, { text: 'She doesn\'t have to cook.', b: 2 },
            ] } },
            { t: 'key', text: "**mustn't** = nesmíš. **don't have to** = nemusíš." },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Tvar', 'Význam', 'Příklad'], rows: [
              ['must', 'musím (cítím to já)', 'I must study more.'],
              ['have to / has to', 'musím (pravidlo, povinnost)', 'She has to wear a uniform.'],
              ["mustn't", 'nesmím (zákaz)', "You mustn't touch it."],
              ["don't / doesn't have to", 'nemusím', "He doesn't have to work."],
              ['had to', 'musel jsem (minulost)', 'I had to wait.'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'You', after: 'use your phone in the test.', options: ["mustn't", "don't have to"], a: 0 },
              { before: 'It\'s Sunday, I', after: 'get up early.', options: ["don't have to", "mustn't"], a: 0 },
              { before: 'He', after: 'to do his homework.', options: ['has', 'have', 'must'], a: 0 },
            ] } },
            { t: 'key', text: 'V minulosti jen **had to**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Ve škole se nesmí kouřit. Students ___ smoke at school.', o: ["mustn't", "don't have to"], a: 0 },
        { t: 'choice', q: 'Vstup je zdarma. You ___ pay.', o: ["don't have to", "mustn't"], a: 0 },
        { t: 'choice', q: 'My sister ___ to wear glasses.', o: ['has', 'have', 'must'], a: 0, why: 'He/she/it → has to.' },
        { t: 'input', q: 'Minulý čas: Yesterday I ___ to walk home. (musel jsem)', a: ['had'] },
        { t: 'input', q: 'Doplň: You ___ cross the road when it\'s red! (nesmíš)', a: ["mustn't", 'must not'] },
        { t: 'tf', q: '„You don\'t have to shout“ znamená „Nesmíš křičet“.', a: false, why: 'Znamená „Nemusíš křičet“. Nesmíš = mustn\'t.' },
        { t: 'tf', q: '„She musts go.“ je správně.', a: false, why: 'Must nemá -s: She must go.' },
        { t: 'choice', q: 'Otázka:', o: ['Do you have to wear a uniform?', 'Have you to wear a uniform?', 'Do you must wear a uniform?'], a: 0 },
        { t: 'pair', q: 'Spoj s významem.', pairs: [['must', 'musím'], ["mustn't", 'nesmím'], ["don't have to", 'nemusím'], ['had to', 'musel jsem']] },
        { t: 'order', q: 'Seřaď větu.', items: ['We', "don't", 'have to', 'go', 'to school today.'] },
        { t: 'open', q: "Jaký je rozdíl mezi mustn't a don't have to?", a: "Mustn't je zákaz – nesmíš (You mustn't run). Don't have to znamená, že to není nutné – nemusíš (You don't have to run)." },
        { t: 'open', q: 'Řekni anglicky dvě věci, které doma musíš, a jednu, kterou nemusíš.', a: "I have to tidy my room. I have to walk the dog. I don't have to cook." },
      ],
    },
    {
      id: 'adverbs-of-manner',
      title: 'Příslovce způsobu',
      emoji: '🏃',
      ex: [
        {
          title: 'Přirovnáním',
          blocks: [
            { t: 'p', text: 'Přídavné jméno popisuje **věc**: *a **quick** runner*.' },
            { t: 'p', text: 'Příslovce popisuje **děj** (jak?): *He runs **quickly**.*' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'slow', label: 'přídavné jméno' }, { text: 'ly', label: 'příslovce' }] },
              { parts: [{ text: 'eas', label: 'přídavné jméno' }, { text: 'ily', label: 'y → ily' }] },
              { parts: [{ text: 'careful', label: 'přídavné jméno' }, { text: 'ly', label: 'příslovce' }] },
            ] } },
            { t: 'key', text: 'Jak to dělá? → přídavné jméno + **-ly**.' },
          ],
        },
        {
          title: 'Výjimkami',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'good', back: 'well' },
              { front: 'fast', back: 'fast' },
              { front: 'hard', back: 'hard' },
              { front: 'late', back: 'late' },
              { front: 'early', back: 'early' },
            ] } },
            { t: 'table', head: ['Přídavné jméno', 'Příslovce'], rows: [
              ['She is a **good** singer.', 'She sings **well**.'],
              ['He is a **fast** driver.', 'He drives **fast**.'],
            ] },
            { t: 'key', text: '**good → well** (ne *goodly*).' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Příslovce od „quiet“:', a: ['quietly'] },
        { t: 'input', q: 'Příslovce od „happy“:', a: ['happily'] },
        { t: 'input', q: 'Příslovce od „good“:', a: ['well'] },
        { t: 'choice', q: 'She speaks English very ___.', o: ['well', 'good', 'goodly'], a: 0 },
        { t: 'choice', q: 'Please drive ___.', o: ['carefully', 'careful', 'carefuly'], a: 0 },
        { t: 'choice', q: 'He is a ___ swimmer.', o: ['strong', 'strongly'], a: 0, why: 'Popisuje osobu (swimmer) → přídavné jméno.' },
        { t: 'tf', q: '„He works hardly.“ znamená „Pracuje tvrdě.“', a: false, why: 'Hardly = sotva. Tvrdě = hard: He works hard.' },
        { t: 'tf', q: '„She runs fast.“ je správně.', a: true, why: 'Fast má stejný tvar jako příslovce.' },
        { t: 'pair', q: 'Spoj přídavné jméno s příslovcem.', pairs: [['bad', 'badly'], ['loud', 'loudly'], ['easy', 'easily'], ['fast', 'fast']] },
        { t: 'order', q: 'Seřaď větu.', items: ['The children', 'played', 'quietly', 'in the garden.'] },
        { t: 'open', q: 'Jaký je rozdíl mezi „quick“ a „quickly“?', a: 'Quick je přídavné jméno a popisuje věc nebo osobu (a quick dog). Quickly je příslovce a říká, jak se děj dělá (The dog runs quickly).' },
        { t: 'open', q: 'Popiš anglicky, jak něco děláš (aspoň dvě příslovce).', a: 'I swim well, but I run slowly. I write carefully.' },
      ],
    },
  ],
} satisfies Subject
