import type { Subject } from '../../types'

export default {
  grade: 'z4',
  subject: 'anglictina',
  topics: [
    {
      id: 'to-be',
      title: 'Sloveso be (am, is, are)',
      emoji: '🧍',
      ex: [
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'Ano', 'Ne', 'Otázka'], rows: [
              ['I', 'I am', 'I’m not', 'Am I?'],
              ['he / she / it', 'is', 'isn’t', 'Is she?'],
              ['you / we / they', 'are', 'aren’t', 'Are you?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'We ', after: ' friends.', options: ['am', 'is', 'are'], a: 2 },
              { before: 'It ', after: ' cold.', options: ['am', 'is', 'are'], a: 1 },
              { before: 'They ', after: ' at school.', options: ['isn’t', 'aren’t', 'am not'], a: 1 },
              { before: '', after: ' you happy?', options: ['Is', 'Are', 'Am'], a: 1 },
            ] } },
            { t: 'key', text: 'Otázka: sloveso **dopředu**. *She is.* → *Is she?*' },
          ],
        },
        {
          title: 'Přehazování',
          blocks: [
            { t: 'p', text: 'Oznámení: *Tom **is** ill.* Otázka: ***Is** Tom ill?* Slova si jen vymění místo.' },
            { t: 'p', text: 'Zápor: přidej **not**. *Tom is **not** ill.* = *Tom isn’t ill.*' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'He is tall.', back: 'Is he tall?' },
              { front: 'You are ten.', back: 'Are you ten?' },
              { front: 'It is a dog.', back: 'Is it a dog?' },
              { front: 'They are here.', back: 'Are they here?' },
            ] } },
            { t: 'key', text: 'Krátká odpověď: **Yes, I am. / No, he isn’t.**' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'They ___ my friends.', o: ['am', 'is', 'are'], a: 2 },
        { t: 'choice', q: 'My dog ___ black.', o: ['am', 'is', 'are'], a: 1 },
        { t: 'input', q: 'Zápor: She ___ at home. (není)', a: ['isn’t', "isn't", 'is not', 'isnt'] },
        { t: 'input', q: 'Doplň otázku: ___ you nine?', a: ['are'] },
        { t: 'choice', q: 'Is he your brother? (ano)', o: ['Yes, he is.', 'Yes, he are.', 'Yes, is he.'], a: 0 },
        { t: 'choice', q: 'Are you hungry? (ne)', o: ['No, I’m not.', 'No, I isn’t.', 'No, I aren’t.'], a: 0 },
        { t: 'tf', q: '„We is happy.“ je správně.', a: false, why: 'we → are: We are happy.' },
        { t: 'tf', q: '„aren’t“ = „are not“.', a: true },
        { t: 'order', q: 'Slož otázku.', items: ['Is', 'your', 'cat', 'black?'] },
        { t: 'pair', q: 'Spoj.', pairs: [['I', 'am'], ['she', 'is'], ['we', 'are']] },
        { t: 'input', q: 'Doplň: I ___ not tired.', a: ['am'] },
        { t: 'open', q: 'Jak z věty „You are tall.“ uděláš otázku a zápor?', a: 'Otázka: Are you tall? Zápor: You aren’t tall (You are not tall).' },
        { t: 'open', q: 'Popiš anglicky kamaráda 2 větami se slovesem be.', a: 'He is ten. He is funny and tall.' },
      ],
    },
    {
      id: 'have-got-otazky',
      title: 'Have you got…?',
      emoji: '🐹',
      ex: [
        {
          title: 'V obchodě se zvířaty',
          blocks: [
            { t: 'p', text: 'Ptáš se kamaráda: ***Have** you **got** a pet?* – *Yes, I **have**.*' },
            { t: 'p', text: 'Na Evu: ***Has** she **got** a hamster?* – *No, she **hasn’t**.*' },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' you got a sister?', options: ['Have', 'Has'], a: 0 },
              { before: '', after: ' he got a bike?', options: ['Have', 'Has'], a: 1 },
              { before: 'Yes, I ', after: '.', options: ['have', 'has', 'got'], a: 0 },
              { before: 'No, she ', after: '.', options: ['haven’t', 'hasn’t', 'isn’t'], a: 1 },
            ] } },
            { t: 'key', text: 'Otázka: **Have/Has** + kdo + **got** …?' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'You have got a cat.', back: 'Have you got a cat?' },
              { front: 'She has got a phone.', back: 'Has she got a phone?' },
              { front: 'They have got a car.', back: 'Have they got a car?' },
            ] } },
            { t: 'table', head: ['Otázka', 'Ano', 'Ne'], rows: [
              ['Have you got…?', 'Yes, I have.', 'No, I haven’t.'],
              ['Has he got…?', 'Yes, he has.', 'No, he hasn’t.'],
            ] },
            { t: 'key', text: 'V krátké odpovědi **got** není.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '___ you got a brother?', o: ['Have', 'Has', 'Are'], a: 0 },
        { t: 'choice', q: '___ your dad got a car?', o: ['Have', 'Has', 'Is'], a: 1, why: 'dad = he → has.' },
        { t: 'choice', q: 'Have you got a pen? (ano)', o: ['Yes, I have.', 'Yes, I have got.', 'Yes, I has.'], a: 0 },
        { t: 'input', q: 'Has she got a dog? (ne) – No, she ___.', a: ['hasn’t', "hasn't", 'has not', 'hasnt'] },
        { t: 'input', q: 'Doplň: Have they ___ a garden?', a: ['got'] },
        { t: 'tf', q: '„Has you got a pet?“ je správně.', a: false, why: 'you → Have you got…?' },
        { t: 'tf', q: 'Na „Has he got a bike?“ odpovíš „Yes, he has.“', a: true },
        { t: 'order', q: 'Slož otázku.', items: ['Has', 'Tom', 'got', 'a', 'hamster?'] },
        { t: 'pair', q: 'Spoj otázku s odpovědí.', pairs: [['Have you got a cat?', 'Yes, I have.'], ['Has she got a cat?', 'No, she hasn’t.'], ['Have they got a cat?', 'Yes, they have.']] },
        { t: 'choice', q: 'Jak se zeptáš „Má Petr kolo?“', o: ['Has Petr got a bike?', 'Have Petr got a bike?', 'Petr has got a bike?'], a: 0 },
        { t: 'open', q: 'Zeptej se anglicky kamaráda na 2 věci, které má (nebo nemá).', a: 'Have you got a dog? Have you got a bike?' },
        { t: 'open', q: 'Jak odpovíš krátce ano a ne na „Have you got a sister?“', a: 'Yes, I have. / No, I haven’t.' },
      ],
    },
    {
      id: 'mnozne-cislo',
      title: 'Množné číslo',
      emoji: '🐑',
      ex: [
        {
          title: 'Přidej -s',
          blocks: [
            { t: 'pic', items: ['🐱', '➡️', '🐱', '🐱'], caption: 'a cat → two cats' },
            { t: 'p', text: 'Většinou stačí **-s**. Po s, x, sh, ch je **-es**: *box → boxes*.' },
            { t: 'p', text: 'Souhláska + **y** → **-ies**: *baby → babies*.' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'dog', label: 'slovo' }, { text: 's', label: 'množné č.' }] },
              { parts: [{ text: 'box', label: 'slovo' }, { text: 'es', label: 'množné č.' }] },
              { parts: [{ text: 'bab', label: 'slovo' }, { text: 'ies', label: 'množné č.' }] },
            ] } },
            { t: 'key', text: 'Pravidlo: **-s**, po sykavce **-es**.' },
          ],
        },
        {
          title: 'Výjimky',
          blocks: [
            { t: 'p', text: 'Některá slova se mění úplně. Ty se musíš naučit.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'man', back: 'men' }, { front: 'woman', back: 'women' }, { front: 'child', back: 'children' },
              { front: 'foot', back: 'feet' }, { front: 'tooth', back: 'teeth' }, { front: 'mouse', back: 'mice' },
              { front: 'sheep', back: 'sheep' },
            ] } },
            { t: 'key', text: '**child → children**, **man → men**, **sheep → sheep**.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Množné číslo: book', a: ['books'] },
        { t: 'input', q: 'Množné číslo: bus', a: ['buses'] },
        { t: 'input', q: 'Množné číslo: child', a: ['children'] },
        { t: 'choice', q: 'Množné číslo: baby', o: ['babies', 'babys', 'babyes'], a: 0, why: 'souhláska + y → ies' },
        { t: 'choice', q: 'Množné číslo: foot', o: ['feet', 'foots', 'feets'], a: 0 },
        { t: 'choice', q: 'Množné číslo: mouse', o: ['mice', 'mouses', 'mices'], a: 0 },
        { t: 'tf', q: 'Množné číslo od „sheep“ je „sheep“.', a: true },
        { t: 'tf', q: 'Množné číslo od „man“ je „mans“.', a: false, why: 'man → men' },
        { t: 'pair', q: 'Spoj.', pairs: [['woman', 'women'], ['tooth', 'teeth'], ['box', 'boxes'], ['toy', 'toys']] },
        { t: 'choice', q: 'Co je správně?', o: ['three dogs', 'three dog', 'three doges'], a: 0 },
        { t: 'input', q: 'Množné číslo: watch', a: ['watches'] },
        { t: 'open', q: 'Jak se v angličtině tvoří množné číslo? Řekni pravidlo a 2 výjimky.', a: 'Většinou přidáme -s, po s, x, sh, ch -es. Výjimky: child – children, man – men.' },
        { t: 'open', q: 'Řekni anglicky, kolik máš rukou, nohou a zubů (přibližně).', a: 'I have got two hands, two feet and about twenty teeth.' },
      ],
    },
    {
      id: 'there-is-are',
      title: 'There is / there are',
      emoji: '🏠',
      ex: [
        {
          title: 'V pokoji',
          blocks: [
            { t: 'pic', items: ['🛏️', '🪑', '🪑', '🧸'] },
            { t: 'p', text: '**There is** a bed. (jedna věc) **There are** two chairs. (víc věcí)' },
            { t: 'w', w: 'sort', p: { buckets: ['There is', 'There are'], items: [
              { text: 'a lamp', b: 0 }, { text: 'three books', b: 1 }, { text: 'a teddy bear', b: 0 }, { text: 'two windows', b: 1 },
              { text: 'a desk', b: 0 }, { text: 'some toys', b: 1 }, { text: 'a computer', b: 0 }, { text: 'four pens', b: 1 },
            ] } },
            { t: 'key', text: 'Jedna věc **is**, víc věcí **are**.' },
          ],
        },
        {
          title: 'Ptáme se',
          blocks: [
            { t: 'table', head: ['', 'Jedna věc', 'Víc věcí'], rows: [
              ['Ano', 'There is (There’s)', 'There are'],
              ['Ne', 'There isn’t', 'There aren’t'],
              ['Otázka', 'Is there…?', 'Are there…?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' a cat in the garden?', options: ['Is there', 'Are there'], a: 0 },
              { before: 'There ', after: ' any apples.', options: ['isn’t', 'aren’t'], a: 1 },
              { before: 'Yes, there ', after: '.', options: ['is', 'are'], a: 0 },
            ] } },
            { t: 'key', text: '**There is/are** = v češtině „je/jsou tam“, „nachází se“.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'There ___ a ball under the bed.', o: ['is', 'are'], a: 0 },
        { t: 'choice', q: 'There ___ five pencils on the desk.', o: ['is', 'are'], a: 1 },
        { t: 'input', q: 'Doplň otázku: ___ there a TV in your room?', a: ['is'] },
        { t: 'input', q: 'Zápor: There ___ any trees. (nejsou)', a: ['aren’t', "aren't", 'are not', 'arent'] },
        { t: 'choice', q: 'Are there any cats? (ano)', o: ['Yes, there are.', 'Yes, they are.', 'Yes, there is.'], a: 0 },
        { t: 'tf', q: '„There are a dog.“ je správně.', a: false, why: 'Jeden pes → There is a dog.' },
        { t: 'tf', q: '„There’s“ je zkratka z „There is“.', a: true },
        { t: 'order', q: 'Slož větu.', items: ['There', 'are', 'two', 'cats', 'here.'] },
        { t: 'pair', q: 'Spoj.', pairs: [['There is', 'a book'], ['There are', 'two books'], ['Is there', 'a book?'], ['Are there', 'any books?']] },
        { t: 'choice', q: 'Jak se řekne „Je v kuchyni stůl?“', o: ['Is there a table in the kitchen?', 'Are there a table in the kitchen?', 'There is a table in the kitchen?'], a: 0 },
        { t: 'open', q: 'Popiš anglicky svůj pokoj (aspoň 3 věty s there is/are).', a: 'There is a bed. There is a desk. There are two windows.' },
        { t: 'open', q: 'Kdy použiješ „there is“ a kdy „there are“?', a: 'There is u jedné věci, there are u více věcí.' },
      ],
    },
    {
      id: 'predlozky-mista',
      title: 'Kde to je? (in, on, under…)',
      emoji: '📦',
      ex: [
        {
          title: 'Kočka a krabice',
          blocks: [
            { t: 'p', text: 'Kočka a krabice 📦🐱:' },
            { t: 'list', items: ['**in** the box = v krabici', '**on** the box = na krabici', '**under** the box = pod krabicí', '**next to** the box = vedle krabice', '**behind** the box = za krabicí', '**in front of** the box = před krabicí'] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'in', back: 'v' }, { front: 'on', back: 'na' }, { front: 'under', back: 'pod' },
              { front: 'next to', back: 'vedle' }, { front: 'behind', back: 'za' }, { front: 'in front of', back: 'před' },
            ] } },
            { t: 'key', text: 'Předložka stojí **před** místem: *on the table*.' },
          ],
        },
        {
          title: 'Kde je míč?',
          blocks: [
            { t: 'p', text: 'Otázka: **Where is** the ball? Odpověď: **It’s** under the chair.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'The book is ', after: ' the table. (na)', options: ['on', 'in', 'under'], a: 0 },
              { before: 'The cat is ', after: ' the bed. (pod)', options: ['on', 'under', 'behind'], a: 1 },
              { before: 'The pen is ', after: ' the bag. (v)', options: ['in', 'on', 'next to'], a: 0 },
              { before: 'The dog is ', after: ' the door. (za)', options: ['in front of', 'behind', 'on'], a: 1 },
            ] } },
            { t: 'key', text: '**Where is…?** = Kde je…?' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jablko je v tašce: The apple is ___ the bag.', o: ['in', 'on', 'under'], a: 0 },
        { t: 'choice', q: 'Lampa je na stole: The lamp is ___ the table.', o: ['in', 'on', 'behind'], a: 1 },
        { t: 'choice', q: 'Co znamená „behind“?', o: ['za', 'před', 'vedle'], a: 0 },
        { t: 'input', q: 'Jak se řekne „pod“?', a: ['under'] },
        { t: 'input', q: 'Doplň: Tom sits ___ to Eva. (vedle)', a: ['next'] },
        { t: 'tf', q: '„in front of“ znamená „před“.', a: true },
        { t: 'tf', q: '„on“ znamená „pod“.', a: false, why: 'on = na, under = pod.' },
        { t: 'pair', q: 'Spoj.', pairs: [['in', 'v'], ['on', 'na'], ['under', 'pod'], ['behind', 'za']] },
        { t: 'order', q: 'Slož otázku.', items: ['Where', 'is', 'my', 'pencil?'] },
        { t: 'choice', q: 'Where is the cat? 🐱 je pod stolem.', o: ['It’s under the table.', 'It’s on the table.', 'It’s in the table.'], a: 0 },
        { t: 'open', q: 'Řekni anglicky, kde máš ve třídě tašku a kde sedí kamarád.', a: 'My bag is under the desk. My friend is next to me.' },
        { t: 'open', q: 'Vyjmenuj 4 předložky místa a co znamenají.', a: 'In = v, on = na, under = pod, next to = vedle, behind = za, in front of = před.' },
      ],
    },
    {
      id: 'can',
      title: 'Can / can’t',
      emoji: '🏊',
      ex: [
        {
          title: 'Co umím',
          blocks: [
            { t: 'pic', items: ['🏊', '🚴', '🎸'] },
            { t: 'p', text: '**I can swim.** = Umím plavat. **I can’t sing.** = Neumím zpívat.' },
            { t: 'p', text: '**can** je pro všechny stejné: *he can*, *she can* – žádné -s!' },
            { t: 'w', w: 'sort', p: { buckets: ['správně ✅', 'špatně ❌'], items: [
              { text: 'She can swim.', b: 0 }, { text: 'She cans swim.', b: 1 }, { text: 'He can’t ski.', b: 0 },
              { text: 'He can skis.', b: 1 }, { text: 'Can you dance?', b: 0 }, { text: 'Do you can dance?', b: 1 },
            ] } },
            { t: 'key', text: '**can** + sloveso bez změny. Nikdy *cans*.' },
          ],
        },
        {
          title: 'Otázka',
          blocks: [
            { t: 'steps', items: ['You can ride a bike.', '→ **Can** you ride a bike?', '→ Yes, I **can**. / No, I **can’t**.'] },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' you play the piano?', options: ['Can', 'Do', 'Are'], a: 0 },
              { before: 'My dog can ', after: '.', options: ['run', 'runs', 'running'], a: 0 },
              { before: 'Fish ', after: ' walk.', options: ['can’t', 'don’t can', 'not can'], a: 0 },
            ] } },
            { t: 'key', text: 'Otázka: **Can** + kdo + sloveso?' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'She ___ swim very well.', o: ['can', 'cans', 'can to'], a: 0 },
        { t: 'choice', q: 'Can you ski? (ne)', o: ['No, I can’t.', 'No, I don’t.', 'No, I can.'], a: 0 },
        { t: 'input', q: 'Doplň: Birds ___ fly.', a: ['can'] },
        { t: 'input', q: 'Doplň zápor: Penguins ___ fly.', a: ['can’t', "can't", 'cannot', 'cant', 'can not'] },
        { t: 'tf', q: '„He can plays football.“ je správně.', a: false, why: 'Po can sloveso beze změny: He can play.' },
        { t: 'tf', q: '„cannot“ znamená totéž co „can’t“.', a: true },
        { t: 'order', q: 'Slož otázku.', items: ['Can', 'you', 'ride', 'a', 'horse?'] },
        { t: 'choice', q: 'Jak se řekne „Umí tvůj brácha vařit?“', o: ['Can your brother cook?', 'Does your brother can cook?', 'Your brother cans cook?'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['I can', 'umím'], ['I can’t', 'neumím'], ['Can you…?', 'Umíš…?']] },
        { t: 'choice', q: 'Co umí ryba?', o: ['A fish can swim.', 'A fish can climb.', 'A fish can sing.'], a: 0 },
        { t: 'open', q: 'Řekni anglicky 2 věci, které umíš, a 1, kterou neumíš.', a: 'I can swim. I can play football. I can’t play the guitar.' },
        { t: 'open', q: 'Zeptej se kamaráda anglicky, jestli umí plavat, a odpověz za něj.', a: 'Can you swim? Yes, I can. / No, I can’t.' },
      ],
    },
    {
      id: 'present-simple-uvod',
      title: 'Přítomný čas prostý',
      emoji: '🔁',
      ex: [
        {
          title: 'Můj den',
          blocks: [
            { t: 'p', text: 'Co dělám **každý den**: *I **get up** at 7. I **go** to school.*' },
            { t: 'p', text: 'O Tomovi: *He **gets** up at 7. He **goes** to school.*' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I ', after: ' milk every day.', options: ['drink', 'drinks'], a: 0 },
              { before: 'She ', after: ' tennis.', options: ['play', 'plays'], a: 1 },
              { before: 'We ', after: ' in Prague.', options: ['live', 'lives'], a: 0 },
              { before: 'My dad ', after: ' TV in the evening.', options: ['watch', 'watches'], a: 1 },
            ] } },
            { t: 'key', text: '**he / she / it** → sloveso + **-s**.' },
          ],
        },
        {
          title: 'Hadí s',
          blocks: [
            { t: 'p', text: 'Představ si hada 🐍, co syčí **s** za *he, she, it*.' },
            { t: 'table', head: ['Kdo', 'Sloveso'], rows: [
              ['I / you / we / they', 'play, go, watch'],
              ['he / she / it', 'plays, goes, watches'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I play', back: 'he plays' }, { front: 'I go', back: 'she goes' }, { front: 'I watch', back: 'he watches' },
              { front: 'I do', back: 'she does' }, { front: 'I have', back: 'it has' },
            ] } },
            { t: 'key', text: 'Pozor: **have → has**, **go → goes**, **do → does**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'He ___ football every day.', o: ['play', 'plays', 'playing'], a: 1 },
        { t: 'choice', q: 'They ___ in a big house.', o: ['live', 'lives', 'living'], a: 0 },
        { t: 'input', q: 'Doplň (go): She ___ to school by bus.', a: ['goes'] },
        { t: 'input', q: 'Doplň (watch): My mum ___ films.', a: ['watches'] },
        { t: 'input', q: 'Doplň (have): Tom ___ breakfast at 7.', a: ['has'] },
        { t: 'tf', q: '„I likes cats.“ je správně.', a: false, why: 'U I je sloveso bez -s: I like cats.' },
        { t: 'tf', q: '„It eats fish.“ je správně.', a: true },
        { t: 'pair', q: 'Spoj.', pairs: [['I', 'swim'], ['she', 'swims'], ['we', 'read'], ['he', 'reads']] },
        { t: 'order', q: 'Slož větu.', items: ['My', 'sister', 'reads', 'books', 'every', 'day.'] },
        { t: 'choice', q: 'Kdy používáme přítomný čas prostý?', o: ['Co dělám pravidelně, obvykle.', 'Co dělám právě teď.', 'Co jsem dělal včera.'], a: 0 },
        { t: 'open', q: 'Řekni anglicky 3 věty o tom, co děláš každý den.', a: 'I get up at seven. I go to school. I play with my dog.' },
        { t: 'open', q: 'Kdy přidáváme ke slovesu -s? Uveď příklad.', a: 'U he, she, it (jeden člověk, zvíře, věc). Například: She plays tennis.' },
      ],
    },
  ],
} satisfies Subject
