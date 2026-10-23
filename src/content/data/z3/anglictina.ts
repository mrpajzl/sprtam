import type { Subject } from '../../types'

export default {
  grade: 'z3',
  subject: 'anglictina',
  topics: [
    {
      id: 'pozdravy',
      title: 'Pozdravy a představení',
      emoji: '👋',
      ex: [
        {
          title: 'Ve třídě',
          blocks: [
            { t: 'p', text: 'Ráno přijdeš do třídy. Řekneš **Good morning!**' },
            { t: 'p', text: 'Tom se ptá: *What’s your name?* Ty odpovíš: *My name is Eva.*' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Hello! / Hi!', back: 'Ahoj!' },
              { front: 'Goodbye! / Bye!', back: 'Na shledanou! / Ahoj!' },
              { front: 'How are you?', back: 'Jak se máš?' },
              { front: 'I’m fine, thank you.', back: 'Mám se dobře, děkuji.' },
              { front: 'Nice to meet you.', back: 'Rád tě poznávám.' },
            ] } },
            { t: 'key', text: 'Když přijdeš: **Hello**. Když odcházíš: **Goodbye**.' },
          ],
        },
        {
          title: 'Podle času',
          blocks: [
            { t: 'table', head: ['Kdy', 'Anglicky'], rows: [
              ['ráno, dopoledne', 'Good morning'],
              ['odpoledne', 'Good afternoon'],
              ['večer', 'Good evening'],
              ['před spaním', 'Good night'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'My ', after: ' is Petr.', options: ['name', 'nice', 'fine'], a: 0 },
              { before: 'How ', after: ' you?', options: ['is', 'are', 'am'], a: 1 },
              { before: 'I’m fine, ', after: ' you.', options: ['thank', 'good', 'hello'], a: 0 },
            ] } },
            { t: 'key', text: '**Good night** říkáš jen při loučení před spaním.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Je 8 hodin ráno. Jak pozdravíš paní učitelku?', o: ['Good morning!', 'Good night!', 'Goodbye!'], a: 0, why: 'Ráno = morning.' },
        { t: 'choice', q: 'Jak se zeptáš na jméno?', o: ['What’s your name?', 'How are you?', 'How old are you?'], a: 0, why: 'name = jméno.' },
        { t: 'tf', q: '„Goodbye“ říkáš, když odcházíš.', a: true },
        { t: 'tf', q: '„Good night“ je pozdrav, když ráno přijdeš do školy.', a: false, why: 'Good night říkáš před spaním.' },
        { t: 'input', q: 'Doplň: My ___ is Anna.', a: ['name'] },
        { t: 'input', q: 'Doplň odpověď: How are you? – I’m ___, thank you.', a: ['fine', 'good', 'ok', 'okay'] },
        { t: 'pair', q: 'Spoj pozdrav s časem.', pairs: [['Good morning', 'ráno'], ['Good afternoon', 'odpoledne'], ['Good evening', 'večer'], ['Good night', 'před spaním']] },
        { t: 'order', q: 'Seřaď rozhovor.', items: ['Hello! What’s your name?', 'My name is Tom.', 'Nice to meet you, Tom.', 'Nice to meet you, too.'] },
        { t: 'choice', q: 'Co znamená „Nice to meet you“?', o: ['Rád tě poznávám.', 'Mám se dobře.', 'Na shledanou.'], a: 0 },
        { t: 'choice', q: 'Kamarád se ptá „How are you?“. Co odpovíš?', o: ['I’m fine, thanks.', 'My name is Jan.', 'Good night.'], a: 0, why: 'How are you? = Jak se máš?' },
        { t: 'open', q: 'Představ se anglicky: pozdrav a řekni své jméno.', a: 'Hello! My name is Jakub. Nice to meet you.' },
        { t: 'open', q: 'Jak anglicky pozdravíš ráno, odpoledne a večer?', a: 'Good morning, good afternoon, good evening.' },
      ],
    },
    {
      id: 'cisla-barvy',
      title: 'Čísla a barvy',
      emoji: '🎨',
      ex: [
        {
          title: 'Pastelky',
          blocks: [
            { t: 'pic', items: ['🔴', '🔵', '🟢', '🟡'], caption: 'red, blue, green, yellow' },
            { t: 'p', text: 'Barva stojí **před** věcí: *a red apple* = červené jablko.' },
            { t: 'w', w: 'sort', p: { buckets: ['barva', 'číslo'], items: [
              { text: 'red', b: 0 }, { text: 'seven', b: 1 }, { text: 'blue', b: 0 }, { text: 'ten', b: 1 },
              { text: 'green', b: 0 }, { text: 'three', b: 1 }, { text: 'black', b: 0 }, { text: 'twelve', b: 1 },
            ] } },
            { t: 'key', text: 'Barva jde před věc: **a blue car**.' },
          ],
        },
        {
          title: 'Počítáme',
          blocks: [
            { t: 'p', text: 'Ptáš se: **How many?** = Kolik?' },
            { t: 'example', q: 'How many apples? 🍎🍎🍎', a: 'Three apples.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '11', back: 'eleven' }, { front: '12', back: 'twelve' }, { front: '13', back: 'thirteen' },
              { front: '15', back: 'fifteen' }, { front: '20', back: 'twenty' },
            ] } },
            { t: 'key', text: 'Čísla 13–19 končí na **-teen**.' },
          ],
        },
      ],
      qs: [
        { t: 'pair', q: 'Spoj číslo a slovo.', pairs: [['3', 'three'], ['5', 'five'], ['8', 'eight'], ['10', 'ten']] },
        { t: 'input', q: 'Napiš anglicky číslo 2.', a: ['two'] },
        { t: 'input', q: 'Jakou barvu má banán? (anglicky)', a: ['yellow'] },
        { t: 'choice', q: 'Jak se řekne „zelený“?', o: ['green', 'grey', 'brown'], a: 0 },
        { t: 'choice', q: 'Co je správně?', o: ['a red ball', 'a ball red', 'red a ball'], a: 0, why: 'Barva jde před věc.' },
        { t: 'tf', q: '„Twelve“ je 12.', a: true },
        { t: 'tf', q: '„Thirteen“ je 30.', a: false, why: 'Thirteen = 13. Třicet je thirty.' },
        { t: 'order', q: 'Seřaď od nejmenšího.', items: ['one', 'four', 'nine', 'eleven', 'twenty'] },
        { t: 'input', q: '🐱🐱🐱🐱 How many cats? (slovem)', a: ['four'] },
        { t: 'choice', q: 'Jak se zeptáš „Kolik?“', o: ['How many?', 'How are you?', 'What colour?'], a: 0 },
        { t: 'open', q: 'Vyjmenuj anglicky 5 barev.', a: 'Red, blue, green, yellow, black (také white, pink, orange, brown, grey, purple).' },
        { t: 'open', q: 'Počítej anglicky od 1 do 10.', a: 'One, two, three, four, five, six, seven, eight, nine, ten.' },
      ],
    },
    {
      id: 'i-am-you-are',
      title: 'I am, you are, he is',
      emoji: '🙋',
      ex: [
        {
          title: 'O sobě',
          blocks: [
            { t: 'p', text: 'O sobě: **I am** Tom. = Já jsem Tom.' },
            { t: 'p', text: 'O tobě: **You are** tall. O klukovi: **He is** happy. O holce: **She is** nine.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I ', after: ' eight.', options: ['am', 'is', 'are'], a: 0 },
              { before: 'You ', after: ' my friend.', options: ['am', 'is', 'are'], a: 2 },
              { before: 'She ', after: ' happy.', options: ['am', 'is', 'are'], a: 1 },
              { before: 'He ', after: ' tall.', options: ['am', 'is', 'are'], a: 1 },
            ] } },
            { t: 'key', text: '**I am**, **you are**, **he/she/it is**.' },
          ],
        },
        {
          title: 'Zkrácené tvary',
          blocks: [
            { t: 'table', head: ['Dlouze', 'Krátce', 'Česky'], rows: [
              ['I am', 'I’m', 'já jsem'],
              ['you are', 'you’re', 'ty jsi'],
              ['he is', 'he’s', 'on je'],
              ['she is', 'she’s', 'ona je'],
              ['it is', 'it’s', 'ono je'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I am', back: 'I’m' }, { front: 'you are', back: 'you’re' }, { front: 'she is', back: 'she’s' }, { front: 'it is', back: 'it’s' },
            ] } },
            { t: 'key', text: 'Apostrof **’** nahrazuje vynechané písmeno.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ ten.', o: ['am', 'is', 'are'], a: 0 },
        { t: 'choice', q: 'She ___ my sister.', o: ['am', 'is', 'are'], a: 1 },
        { t: 'choice', q: 'You ___ funny.', o: ['am', 'is', 'are'], a: 2 },
        { t: 'input', q: 'Doplň: He ___ nine.', a: ['is'] },
        { t: 'input', q: 'Zkrať: I am', a: ['I’m', "I'm", 'im'] },
        { t: 'tf', q: '„She are happy.“ je správně.', a: false, why: 'Správně: She is happy.' },
        { t: 'tf', q: '„It’s“ je zkratka z „it is“.', a: true },
        { t: 'pair', q: 'Spoj.', pairs: [['I', 'am'], ['you', 'are'], ['he', 'is']] },
        { t: 'choice', q: 'Jak se řekne „Ona je moje kamarádka“?', o: ['She is my friend.', 'He is my friend.', 'I am my friend.'], a: 0, why: 'she = ona, he = on.' },
        { t: 'order', q: 'Slož větu.', items: ['I', 'am', 'eight', 'years', 'old.'] },
        { t: 'open', q: 'Řekni anglicky 2 věty o sobě (jméno a věk).', a: 'I am Lucie. I am nine years old.' },
        { t: 'open', q: 'Kdy použiješ „is“?', a: 'Když mluvím o jednom člověku nebo věci: he is, she is, it is.' },
      ],
    },
    {
      id: 'a-an',
      title: 'a / an',
      emoji: '🍎',
      ex: [
        {
          title: 'Poslouchej',
          blocks: [
            { t: 'p', text: 'Řekni nahlas: *a apple* – drhne to. *an apple* – jde to hladce.' },
            { t: 'p', text: 'Před samohláskou (**a, e, i, o, u**) je **an**.' },
            { t: 'w', w: 'sort', p: { buckets: ['a', 'an'], items: [
              { text: 'dog', b: 0 }, { text: 'apple', b: 1 }, { text: 'cat', b: 0 }, { text: 'egg', b: 1 },
              { text: 'orange', b: 1 }, { text: 'ball', b: 0 }, { text: 'elephant', b: 1 }, { text: 'pen', b: 0 },
            ] } },
            { t: 'key', text: '**an** + samohláska, **a** + ostatní.' },
          ],
        },
        {
          title: 'Jeden kus',
          blocks: [
            { t: 'p', text: '**a/an** znamená „jeden“. Česky se nepřekládá.' },
            { t: 'example', q: '🐶 = ?', a: 'a dog' },
            { t: 'example', q: '🥚 = ?', a: 'an egg' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'It’s ', after: ' cat.', options: ['a', 'an'], a: 0 },
              { before: 'It’s ', after: ' orange.', options: ['a', 'an'], a: 1 },
              { before: 'It’s ', after: ' umbrella.', options: ['a', 'an'], a: 1 },
            ] } },
            { t: 'key', text: 'U jedné věci dáš před slovo **a** nebo **an**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '___ apple', o: ['a', 'an'], a: 1, why: 'apple začíná samohláskou a.' },
        { t: 'choice', q: '___ book', o: ['a', 'an'], a: 0 },
        { t: 'choice', q: '___ egg', o: ['a', 'an'], a: 1 },
        { t: 'choice', q: '___ house', o: ['a', 'an'], a: 0 },
        { t: 'input', q: 'Doplň a/an: It’s ___ elephant.', a: ['an'] },
        { t: 'input', q: 'Doplň a/an: It’s ___ dog.', a: ['a'] },
        { t: 'tf', q: '„an orange“ je správně.', a: true },
        { t: 'tf', q: '„an pen“ je správně.', a: false, why: 'pen začíná souhláskou → a pen.' },
        { t: 'choice', q: 'Ve které řadě je všechno správně?', o: ['a cat, an owl, a banana', 'an cat, a owl, a banana', 'a cat, a owl, an banana'], a: 0, why: 'owl začíná samohláskou → an owl.' },
        { t: 'choice', q: 'Které je špatně?', o: ['an umbrella', 'a car', 'an ball'], a: 2, why: 'ball začíná b → a ball.' },
        { t: 'open', q: 'Kdy píšeš „an“ místo „a“?', a: 'Když slovo začíná samohláskou, třeba an apple, an egg.' },
        { t: 'open', q: 'Řekni anglicky, co máš na lavici (3 věci s a/an).', a: 'A pen, a book, an eraser.' },
      ],
    },
    {
      id: 'this-that',
      title: 'This / that',
      emoji: '👉',
      ex: [
        {
          title: 'Blízko a daleko',
          blocks: [
            { t: 'pic', items: ['🧒', '✋', '🍎', '➡️', '➡️', '🌳'], caption: 'this apple … that tree' },
            { t: 'p', text: 'Co máš **u sebe**: **this** (tohle). Co je **daleko**: **that** (tamto).' },
            { t: 'w', w: 'sort', p: { buckets: ['this (blízko)', 'that (daleko)'], items: [
              { text: 'pero v ruce', b: 0 }, { text: 'letadlo na nebi', b: 1 }, { text: 'tvoje taška', b: 0 },
              { text: 'dům za řekou', b: 1 }, { text: 'kniha na klíně', b: 0 }, { text: 'pták na stromě', b: 1 },
            ] } },
            { t: 'key', text: '**this** = blízko, **that** = daleko.' },
          ],
        },
        {
          title: 'Otázka a odpověď',
          blocks: [
            { t: 'steps', items: ['What is this? = Co je tohle?', 'It’s a pencil. = Je to tužka.', 'What is that? = Co je tamto?', 'It’s a bird. = Je to pták.'] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'What is ', after: '? (v ruce)', options: ['this', 'that'], a: 0 },
              { before: 'What is ', after: '? (na nebi)', options: ['this', 'that'], a: 1 },
              { before: '', after: ' a bird.', options: ['It’s', 'Is'], a: 0 },
            ] } },
            { t: 'key', text: 'Odpovídáš: **It’s a …**' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Ukazuješ na hvězdu na nebi. What is ___?', o: ['this', 'that'], a: 1, why: 'Hvězda je daleko.' },
        { t: 'choice', q: 'Držíš míč. ___ is my ball.', o: ['This', 'That'], a: 0 },
        { t: 'tf', q: '„this“ znamená tohle (blízko).', a: true },
        { t: 'tf', q: '„that“ používáme pro věc v ruce.', a: false, why: 'Věc v ruce je blízko → this.' },
        { t: 'input', q: 'Odpověz: What is this? 🍌 – It’s a ___.', a: ['banana'] },
        { t: 'input', q: 'Doplň: What ___ that?', a: ['is'] },
        { t: 'order', q: 'Slož otázku.', items: ['What', 'is', 'this?'] },
        { t: 'choice', q: 'What is that? 🐦', o: ['It’s a bird.', 'It a bird.', 'Is a bird.'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['this', 'tohle'], ['that', 'tamto'], ['What is it?', 'Co je to?']] },
        { t: 'choice', q: 'Jak se řekne „Tohle je moje taška“?', o: ['This is my bag.', 'That is my bag.', 'It my bag.'], a: 0 },
        { t: 'open', q: 'Kdy řekneš „this“ a kdy „that“?', a: 'This řeknu u věci blízko u mě, that u věci daleko.' },
        { t: 'open', q: 'Ukaž na věc ve třídě a zeptej se a odpověz anglicky.', a: 'What is this? It’s a chair.' },
      ],
    },
    {
      id: 'have-got',
      title: 'I have got',
      emoji: '🎒',
      ex: [
        {
          title: 'Moje taška',
          blocks: [
            { t: 'pic', items: ['🎒', '📕', '✏️', '🍎'] },
            { t: 'p', text: '**I have got** a book. = Mám knihu.' },
            { t: 'p', text: 'O jiném člověku: **She has got** a dog. **He has got** a bike.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I ', after: ' got a pen.', options: ['have', 'has'], a: 0 },
              { before: 'Tom ', after: ' got a cat.', options: ['have', 'has'], a: 1 },
              { before: 'We ', after: ' got a ball.', options: ['have', 'has'], a: 0 },
              { before: 'She ', after: ' got a doll.', options: ['have', 'has'], a: 1 },
            ] } },
            { t: 'key', text: '**he/she/it has got**, ostatní **have got**.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Kdo', 'Má', 'Nemá'], rows: [
              ['I / you / we / they', 'have got (’ve got)', 'haven’t got'],
              ['he / she / it', 'has got (’s got)', 'hasn’t got'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I have got', back: 'I’ve got' },
              { front: 'she has got', back: 'she’s got' },
              { front: 'I have not got', back: 'I haven’t got' },
              { front: 'he has not got', back: 'he hasn’t got' },
            ] } },
            { t: 'key', text: 'Nemám = **haven’t got**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ got a brother.', o: ['have', 'has'], a: 0 },
        { t: 'choice', q: 'My sister ___ got a cat.', o: ['have', 'has'], a: 1, why: 'sister = she → has.' },
        { t: 'input', q: 'Doplň: He ___ got a bike.', a: ['has'] },
        { t: 'input', q: 'Zápor: I ___ got a dog. (nemám)', a: ['haven’t', "haven't", 'have not', 'havent'] },
        { t: 'tf', q: '„She have got a pen.“ je správně.', a: false, why: 'Správně: She has got a pen.' },
        { t: 'tf', q: '„We’ve got“ = we have got.', a: true },
        { t: 'pair', q: 'Spoj.', pairs: [['I have got', 'mám'], ['she has got', 'ona má'], ['I haven’t got', 'nemám'], ['he hasn’t got', 'on nemá']] },
        { t: 'order', q: 'Slož větu.', items: ['I', 'have', 'got', 'a', 'red', 'bag.'] },
        { t: 'choice', q: 'Jak se řekne „On nemá kolo“?', o: ['He hasn’t got a bike.', 'He haven’t got a bike.', 'He not got a bike.'], a: 0 },
        { t: 'input', q: 'Zkrať: she has got → she___ got', a: ['’s', "'s", 's'] },
        { t: 'open', q: 'Řekni anglicky, co máš v aktovce (aspoň 3 věci).', a: 'I have got a book, a pencil and a ruler.' },
        { t: 'open', q: 'Kdy řekneš „has got“ a kdy „have got“?', a: 'Has got u he, she, it (jeden člověk nebo věc). Have got u I, you, we, they.' },
      ],
    },
    {
      id: 'i-like',
      title: 'I like / I don’t like',
      emoji: '❤️',
      ex: [
        {
          title: 'Smajlíky',
          blocks: [
            { t: 'pic', items: ['😀', '🍕'], caption: 'I like pizza.' },
            { t: 'pic', items: ['😖', '🥦'], caption: 'I don’t like broccoli.' },
            { t: 'w', w: 'sort', p: { buckets: ['😀 like', '😖 don’t like'], items: [
              { text: 'I like cats.', b: 0 }, { text: 'I don’t like rain.', b: 1 }, { text: 'I like ice cream.', b: 0 },
              { text: 'I don’t like spiders.', b: 1 }, { text: 'I like football.', b: 0 }, { text: 'I don’t like milk.', b: 1 },
            ] } },
            { t: 'key', text: '**I like** = mám rád. **I don’t like** = nemám rád.' },
          ],
        },
        {
          title: 'Otázka',
          blocks: [
            { t: 'steps', items: ['Do you like apples? = Máš rád jablka?', 'Yes, I do. = Ano.', 'No, I don’t. = Ne.'] },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' you like dogs?', options: ['Do', 'Are', 'Is'], a: 0 },
              { before: 'Yes, I ', after: '.', options: ['do', 'like', 'am'], a: 0 },
              { before: 'No, I ', after: '.', options: ['don’t', 'not', 'isn’t'], a: 0 },
            ] } },
            { t: 'key', text: 'Krátká odpověď: **Yes, I do. / No, I don’t.**' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Máš rád čokoládu. Řekneš:', o: ['I like chocolate.', 'I don’t like chocolate.', 'I am chocolate.'], a: 0 },
        { t: 'choice', q: 'Do you like cats? (ano)', o: ['Yes, I do.', 'Yes, I am.', 'Yes, I like.'], a: 0 },
        { t: 'input', q: 'Doplň: I ___ like spiders. (nemám rád)', a: ['don’t', "don't", 'do not', 'dont'] },
        { t: 'input', q: 'Doplň otázku: ___ you like music?', a: ['do'] },
        { t: 'tf', q: '„I don’t like“ znamená „nemám rád“.', a: true },
        { t: 'tf', q: 'Na „Do you like pizza?“ odpovíš „No, I am not.“', a: false, why: 'Správně: No, I don’t.' },
        { t: 'order', q: 'Slož otázku.', items: ['Do', 'you', 'like', 'apples?'] },
        { t: 'pair', q: 'Spoj.', pairs: [['I like', 'mám rád'], ['I don’t like', 'nemám rád'], ['Do you like…?', 'Máš rád…?']] },
        { t: 'choice', q: 'Jak se řekne „Nemám rád mléko“?', o: ['I don’t like milk.', 'I not like milk.', 'I no like milk.'], a: 0 },
        { t: 'choice', q: 'Do you like broccoli? (ne)', o: ['No, I don’t.', 'No, I doesn’t.', 'No, I not.'], a: 0 },
        { t: 'open', q: 'Řekni anglicky 2 věci, které máš rád, a 1, kterou nemáš rád.', a: 'I like pizza. I like dogs. I don’t like rain.' },
        { t: 'open', q: 'Zeptej se kamaráda anglicky, jestli má rád fotbal, a odpověz za něj.', a: 'Do you like football? Yes, I do. / No, I don’t.' },
      ],
    },
  ],
} satisfies Subject
