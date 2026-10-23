import type { Subject } from '../../types'

export default {
  grade: 'z5',
  subject: 'anglictina',
  topics: [
    {
      id: 'present-simple-otazky-zapory',
      title: 'Present simple: do / does',
      emoji: '❓',
      ex: [
        {
          title: 'Pomocník do',
          blocks: [
            { t: 'p', text: 'Pro otázku a zápor potřebuješ pomocníka **do**. U *he/she/it* je to **does**.' },
            { t: 'p', text: '**does** si vezme **-s** na sebe, sloveso je pak bez -s: *She plays.* → *Does she **play**?*' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'You like tea.', back: 'Do you like tea?' },
              { front: 'He likes tea.', back: 'Does he like tea?' },
              { front: 'I like tea.', back: 'I don’t like tea.' },
              { front: 'She likes tea.', back: 'She doesn’t like tea.' },
            ] } },
            { t: 'key', text: 'Po **does / doesn’t** je sloveso **bez -s**.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'I / you / we / they', 'he / she / it'], rows: [
              ['Zápor', 'don’t play', 'doesn’t play'],
              ['Otázka', 'Do you play?', 'Does she play?'],
              ['Krátce', 'Yes, I do. / No, I don’t.', 'Yes, she does. / No, she doesn’t.'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' your dad work in an office?', options: ['Do', 'Does'], a: 1 },
              { before: 'We ', after: ' have dogs.', options: ['don’t', 'doesn’t'], a: 0 },
              { before: 'Does Eva ', after: ' French?', options: ['speak', 'speaks'], a: 0 },
              { before: 'He ', after: ' eat meat.', options: ['don’t', 'doesn’t'], a: 1 },
            ] } },
            { t: 'key', text: '**don’t** = do not, **doesn’t** = does not.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '___ you like pizza?', o: ['Do', 'Does', 'Are'], a: 0 },
        { t: 'choice', q: '___ she play the piano?', o: ['Do', 'Does', 'Is'], a: 1 },
        { t: 'choice', q: 'He ___ like fish.', o: ['don’t', 'doesn’t', 'isn’t'], a: 1 },
        { t: 'choice', q: 'Co je správně?', o: ['Does he play tennis?', 'Does he plays tennis?', 'Do he play tennis?'], a: 0, why: 'Po does sloveso bez -s.' },
        { t: 'input', q: 'Zápor: I ___ watch TV in the morning.', a: ['don’t', "don't", 'do not', 'dont'] },
        { t: 'input', q: 'Does your cat sleep a lot? (ano) – Yes, it ___.', a: ['does'] },
        { t: 'tf', q: '„She doesn’t likes milk.“ je správně.', a: false, why: 'Správně: She doesn’t like milk.' },
        { t: 'tf', q: '„They don’t live here.“ je správně.', a: true },
        { t: 'order', q: 'Slož otázku.', items: ['Does', 'your', 'brother', 'play', 'football?'] },
        { t: 'pair', q: 'Spoj otázku s odpovědí.', pairs: [['Do you swim?', 'Yes, I do.'], ['Does he swim?', 'No, he doesn’t.'], ['Do they swim?', 'Yes, they do.']] },
        { t: 'input', q: 'Doplň: Where ___ Tom live?', a: ['does'] },
        { t: 'open', q: 'Jak uděláš otázku z věty „She reads comics.“? Vysvětli.', a: 'Does she read comics? Na začátek dám does a sloveso už nemá -s.' },
        { t: 'open', q: 'Řekni anglicky 2 věci, které nedělá tvůj kamarád.', a: 'He doesn’t play tennis. He doesn’t like broccoli.' },
      ],
    },
    {
      id: 'frekvencni-prislovce',
      title: 'Always, usually, never',
      emoji: '📅',
      ex: [
        {
          title: 'Teploměr',
          blocks: [
            { t: 'p', text: 'Jak často? Od 100 % po 0 %:' },
            { t: 'w', w: 'bars', p: { unit: '%', items: [
              { label: 'always', value: 100 }, { label: 'usually', value: 80 }, { label: 'often', value: 60 },
              { label: 'sometimes', value: 40 }, { label: 'never', value: 0 },
            ] } },
            { t: 'key', text: '**always** = vždy, **never** = nikdy.' },
          ],
        },
        {
          title: 'Kam patří',
          blocks: [
            { t: 'p', text: 'Příslovce stojí **před** běžným slovesem, ale **za** *am/is/are*.' },
            { t: 'example', q: 'I / always / get up / at 7', a: 'I always get up at 7.' },
            { t: 'example', q: 'She / is / never / late', a: 'She is never late.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I ', after: ' eat breakfast. (vždy)', options: ['always', 'never'], a: 0 },
              { before: 'He is ', after: ' tired. (často)', options: ['often', 'sometimes'], a: 0 },
              { before: 'We ', after: ' go to the cinema. (někdy)', options: ['usually', 'sometimes'], a: 1 },
            ] } },
            { t: 'key', text: '*I **often** play.* ale *I am **often** late.*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co znamená „never“?', o: ['nikdy', 'někdy', 'vždy'], a: 0 },
        { t: 'choice', q: 'Co je správně?', o: ['I usually walk to school.', 'I walk usually to school.', 'Usually I walk school.'], a: 0 },
        { t: 'choice', q: 'Co je správně?', o: ['She is always happy.', 'She always is happy.', 'Always she happy.'], a: 0, why: 'S be stojí příslovce za slovesem.' },
        { t: 'order', q: 'Seřaď od nejčastějšího.', items: ['always', 'usually', 'often', 'sometimes', 'never'] },
        { t: 'input', q: 'Jak se řekne „někdy“?', a: ['sometimes'] },
        { t: 'input', q: 'Jak se řekne „obvykle“?', a: ['usually'] },
        { t: 'tf', q: '„often“ znamená „často“.', a: true },
        { t: 'tf', q: '„He never doesn’t eat meat.“ je správně.', a: false, why: 'never už je zápor: He never eats meat.' },
        { t: 'pair', q: 'Spoj.', pairs: [['always', 'vždy'], ['usually', 'obvykle'], ['sometimes', 'někdy'], ['never', 'nikdy']] },
        { t: 'order', q: 'Slož větu.', items: ['My', 'dad', 'often', 'cooks', 'dinner.'] },
        { t: 'open', q: 'Řekni anglicky, co děláš vždy, často a nikdy.', a: 'I always brush my teeth. I often play games. I never drink coffee.' },
        { t: 'open', q: 'Kam ve větě dáváme slova always, never apod.?', a: 'Před běžné sloveso (I always play), ale za am/is/are (I am always late).' },
      ],
    },
    {
      id: 'present-continuous',
      title: 'Present continuous (právě teď)',
      emoji: '⏯️',
      ex: [
        {
          title: 'Telefonát',
          blocks: [
            { t: 'p', text: 'Mamka volá: *What are you doing?* Ty: *I **am watching** TV.* Brácha **is sleeping**.' },
            { t: 'p', text: 'Děje se to **teď**, v tuto chvíli.' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'am', label: 'be' }, { text: 'play', label: 'sloveso' }, { text: 'ing', label: '-ing' }] },
              { parts: [{ text: 'is', label: 'be' }, { text: 'read', label: 'sloveso' }, { text: 'ing', label: '-ing' }] },
            ] } },
            { t: 'key', text: '**am / is / are** + sloveso **-ing**.' },
          ],
        },
        {
          title: 'Pravopis -ing',
          blocks: [
            { t: 'list', items: ['většinou + ing: play → playing', 'němé -e pryč: make → making', 'krátké slovo: zdvoj: swim → swimming, run → running'] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'write', back: 'writing' }, { front: 'sit', back: 'sitting' }, { front: 'dance', back: 'dancing' },
              { front: 'read', back: 'reading' }, { front: 'get', back: 'getting' },
            ] } },
            { t: 'key', text: 'Otázka: ***Are** you **eating**?* Zápor: *I’m **not** eating.*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Look! The baby ___.', o: ['is sleeping', 'sleeps', 'are sleeping'], a: 0 },
        { t: 'choice', q: 'We ___ a film now.', o: ['are watching', 'is watching', 'watching'], a: 0 },
        { t: 'input', q: 'Tvar -ing od „swim“:', a: ['swimming'] },
        { t: 'input', q: 'Tvar -ing od „make“:', a: ['making'] },
        { t: 'input', q: 'Doplň: I ___ doing my homework. (be)', a: ['am', '’m', "'m"] },
        { t: 'tf', q: '„She is play the guitar.“ je správně.', a: false, why: 'Chybí -ing: She is playing.' },
        { t: 'tf', q: '„They aren’t listening.“ je správně.', a: true },
        { t: 'choice', q: 'What ___ you doing?', o: ['are', 'do', 'is'], a: 0 },
        { t: 'order', q: 'Slož otázku.', items: ['Is', 'Tom', 'running', 'now?'] },
        { t: 'pair', q: 'Spoj.', pairs: [['run', 'running'], ['ride', 'riding'], ['eat', 'eating'], ['stop', 'stopping']] },
        { t: 'open', q: 'Co právě teď děláš? Řekni anglicky 2 věty.', a: 'I am sitting at home. I am learning English.' },
        { t: 'open', q: 'Jak se tvoří present continuous?', a: 'am, is nebo are a sloveso s koncovkou -ing, například She is reading.' },
      ],
    },
    {
      id: 'simple-vs-continuous',
      title: 'Obvykle × právě teď',
      emoji: '⚖️',
      ex: [
        {
          title: 'Fotbalista',
          blocks: [
            { t: 'p', text: 'Petr **plays** football every Saturday. (obvykle)' },
            { t: 'p', text: 'But today he **is watching** TV. (teď, výjimečně)' },
            { t: 'w', w: 'sort', p: { buckets: ['obvykle (simple)', 'teď (continuous)'], items: [
              { text: 'every day', b: 0 }, { text: 'now', b: 1 }, { text: 'usually', b: 0 }, { text: 'at the moment', b: 1 },
              { text: 'on Mondays', b: 0 }, { text: 'Look!', b: 1 }, { text: 'never', b: 0 }, { text: 'right now', b: 1 },
            ] } },
            { t: 'key', text: 'Pravidelně → **simple**. Právě teď → **continuous**.' },
          ],
        },
        {
          title: 'Signální slova',
          blocks: [
            { t: 'table', head: ['Present simple', 'Present continuous'], rows: [
              ['I play', 'I am playing'],
              ['every day, always, often', 'now, at the moment, Look!'],
              ['zvyky, fakta', 'děj teď'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She ', after: ' to school every day.', options: ['walks', 'is walking'], a: 0 },
              { before: 'Listen! Somebody ', after: '.', options: ['sings', 'is singing'], a: 1 },
              { before: 'I ', after: ' tea now.', options: ['drink', 'am drinking'], a: 1 },
              { before: 'Cats ', after: ' milk.', options: ['like', 'are liking'], a: 0 },
            ] } },
            { t: 'key', text: 'Hledej signální slovo: **every day** × **now**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ my bike every day.', o: ['ride', 'am riding'], a: 0 },
        { t: 'choice', q: 'Look! It ___.', o: ['snows', 'is snowing'], a: 1 },
        { t: 'choice', q: 'My mum ___ in a hospital. (je to její práce)', o: ['works', 'is working'], a: 0 },
        { t: 'choice', q: 'Shh! The baby ___.', o: ['sleeps', 'is sleeping'], a: 1 },
        { t: 'input', q: 'Doplň (read): At the moment, I am ___ a book.', a: ['reading'] },
        { t: 'input', q: 'Doplň (go): He usually ___ to bed at 9.', a: ['goes'] },
        { t: 'tf', q: '„every Monday“ patří k present simple.', a: true },
        { t: 'tf', q: '„I am going to school every day.“ je správně pro pravidelný zvyk.', a: false, why: 'Zvyk = present simple: I go to school every day.' },
        { t: 'pair', q: 'Spoj signální slovo a čas.', pairs: [['I play', 'hraju (obvykle)'], ['I am playing', 'hraju (teď)'], ['She reads', 'čte (obvykle)'], ['She is reading', 'čte (teď)']] },
        { t: 'order', q: 'Slož větu.', items: ['They', 'are', 'playing', 'chess', 'now.'] },
        { t: 'open', q: 'Jaký je rozdíl mezi „I play tennis“ a „I am playing tennis“?', a: 'I play tennis = hraju tenis pravidelně. I am playing tennis = hraju ho právě teď.' },
        { t: 'open', q: 'Řekni anglicky, co obvykle děláš v sobotu a co děláš teď.', a: 'On Saturdays I usually play football. Now I am doing my homework.' },
      ],
    },
    {
      id: 'otazkova-slova',
      title: 'Otázky: what, where, when…',
      emoji: '🔍',
      ex: [
        {
          title: 'Detektiv',
          blocks: [
            { t: 'p', text: 'Detektiv se ptá: **Who?** **Where?** **When?** **Why?**' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'What?', back: 'Co?' }, { front: 'Who?', back: 'Kdo?' }, { front: 'Where?', back: 'Kde?' },
              { front: 'When?', back: 'Kdy?' }, { front: 'Why?', back: 'Proč?' }, { front: 'How?', back: 'Jak?' },
              { front: 'How old?', back: 'Kolik let?' }, { front: 'Whose?', back: 'Čí?' },
            ] } },
            { t: 'key', text: 'Otázkové slovo je vždy **na začátku**.' },
          ],
        },
        {
          title: 'Skládačka',
          blocks: [
            { t: 'steps', items: ['Otázkové slovo: **Where**', 'Pomocné sloveso: **do / does / is / are**', 'Kdo: **you**', 'Sloveso: **live**?', '→ Where do you live?'] },
            { t: 'w', w: 'gap', p: { items: [
              { before: '', after: ' is your birthday? – In May.', options: ['When', 'Where', 'Who'], a: 0 },
              { before: '', after: ' is that girl? – My sister.', options: ['What', 'Who', 'How'], a: 1 },
              { before: '', after: ' are you sad? – Because…', options: ['Why', 'When', 'Where'], a: 0 },
              { before: 'Where ', after: ' she live?', options: ['do', 'does', 'is'], a: 1 },
            ] } },
            { t: 'key', text: '**Otázkové slovo + pomocné sloveso + kdo + sloveso?**' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '___ do you live? – In Brno.', o: ['Where', 'When', 'Who'], a: 0 },
        { t: 'choice', q: '___ old are you? – I’m eleven.', o: ['How', 'What', 'Who'], a: 0 },
        { t: 'choice', q: '___ is your favourite colour? – Blue.', o: ['What', 'Who', 'Why'], a: 0 },
        { t: 'input', q: 'Jak se řekne „Proč?“', a: ['why'] },
        { t: 'input', q: 'Doplň: ___ is this bag? – It’s Tom’s. (Čí?)', a: ['whose'] },
        { t: 'tf', q: '„Who“ znamená „kdo“.', a: true },
        { t: 'tf', q: '„Where you live?“ je správná otázka.', a: false, why: 'Chybí do: Where do you live?' },
        { t: 'pair', q: 'Spoj otázku a odpověď.', pairs: [['When?', 'at 8 o’clock'], ['Where?', 'in the park'], ['Who?', 'my teacher'], ['Why?', 'because I’m ill']] },
        { t: 'order', q: 'Slož otázku.', items: ['What', 'does', 'your', 'mum', 'do?'] },
        { t: 'choice', q: '___ do you go to school? – By bus.', o: ['How', 'Where', 'What'], a: 0 },
        { t: 'open', q: 'Polož anglicky 3 otázky novému spolužákovi.', a: 'What’s your name? How old are you? Where do you live?' },
        { t: 'open', q: 'Jaké je pořadí slov v anglické otázce s „where“?', a: 'Where, pak pomocné sloveso (do/does), pak kdo, pak sloveso: Where do you live?' },
      ],
    },
    {
      id: 'privlastnovaci-tvary',
      title: 'My, your… a Tom’s',
      emoji: '🧸',
      ex: [
        {
          title: 'Čí to je?',
          blocks: [
            { t: 'p', text: 'To je pes Toma: **Tom’s** dog. To je kolo mojí sestry: **my sister’s** bike.' },
            { t: 'p', text: 'Více vlastníků s -s: **my parents’** car (apostrof až za s).' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'Tom', label: 'kdo' }, { text: '’s', label: 'čí' }] },
              { parts: [{ text: 'parents', label: 'kdo' }, { text: '’', label: 'čí' }] },
            ] } },
            { t: 'key', text: '**jméno + ’s** = čí to je.' },
          ],
        },
        {
          title: 'Dvojice',
          blocks: [
            { t: 'table', head: ['Osoba', 'Přivlastnění'], rows: [
              ['I', 'my'], ['you', 'your'], ['he', 'his'], ['she', 'her'], ['it', 'its'], ['we', 'our'], ['they', 'their'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Eva loves ', after: ' cat.', options: ['her', 'his', 'she'], a: 0 },
              { before: 'Tom and Jan play with ', after: ' dog.', options: ['their', 'there', 'our'], a: 0 },
              { before: 'The dog is eating ', after: ' food.', options: ['it’s', 'its'], a: 1 },
            ] } },
            { t: 'key', text: 'Pozor: **its** = jeho (zvířete), **it’s** = it is.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'This is Anna. ___ bike is red.', o: ['Her', 'His', 'She'], a: 0 },
        { t: 'choice', q: 'This is Petr. ___ dog is big.', o: ['His', 'Her', 'He'], a: 0 },
        { t: 'choice', q: 'We love ___ school.', o: ['our', 'us', 'we'], a: 0 },
        { t: 'input', q: 'Přivlastňovací tvar od „they“:', a: ['their'] },
        { t: 'input', q: 'Doplň: This is my brother___ room. (pokoj mého bratra)', a: ['’s', "'s", 's'] },
        { t: 'tf', q: '„its“ a „it’s“ znamenají totéž.', a: false, why: 'its = jeho (věci, zvířete), it’s = it is.' },
        { t: 'tf', q: '„my parents’ house“ je správně.', a: true },
        { t: 'pair', q: 'Spoj.', pairs: [['I', 'my'], ['you', 'your'], ['we', 'our'], ['she', 'her']] },
        { t: 'choice', q: 'Jak se řekne „Mámino auto“?', o: ['Mum’s car', 'Mum car', 'Car’s mum'], a: 0 },
        { t: 'order', q: 'Slož větu.', items: ['This', 'is', 'Lucy’s', 'pencil.'] },
        { t: 'open', q: 'Řekni anglicky, jak se jmenuje tvoje máma a tvůj nejlepší kamarád.', a: 'My mum’s name is Jana. My best friend’s name is Ondra.' },
        { t: 'open', q: 'Jaký je rozdíl mezi „his“ a „her“?', a: 'His = jeho (patří muži nebo klukovi), her = její (patří ženě nebo holce).' },
      ],
    },
    {
      id: 'hodiny',
      title: 'Kolik je hodin?',
      emoji: '🕒',
      ex: [
        {
          title: 'Na ciferníku',
          blocks: [
            { t: 'p', text: 'Celá: **It’s three o’clock.** Do půlky: **past** (po). Od půlky: **to** (do).' },
            { t: 'w', w: 'clock', p: { h: 3, m: 15 } },
            { t: 'list', items: ['3:15 = quarter **past** three', '3:30 = half **past** three', '3:45 = quarter **to** four'] },
            { t: 'key', text: 'Pozor: half past three = **3:30** (česky půl čtvrté).' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '7:00', back: 'seven o’clock' }, { front: '7:10', back: 'ten past seven' }, { front: '7:30', back: 'half past seven' },
              { front: '7:45', back: 'quarter to eight' }, { front: '7:50', back: 'ten to eight' },
            ] } },
            { t: 'p', text: 'Ptáš se: **What time is it?** Kdy: **at** seven o’clock.' },
            { t: 'key', text: 'Minuty **past** hodina (do :30), minuty **to** další hodina.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik je „half past six“?', o: ['6:30', '5:30', '6:15'], a: 0, why: 'half past six = půl hodiny po šesté.' },
        { t: 'choice', q: '9:45 je:', o: ['quarter to ten', 'quarter past nine', 'quarter to nine'], a: 0 },
        { t: 'choice', q: '2:15 je:', o: ['quarter past two', 'quarter to two', 'half past two'], a: 0 },
        { t: 'input', q: 'Doplň: 4:00 = four ___', a: ['o’clock', "o'clock", 'oclock'] },
        { t: 'input', q: 'Doplň: 8:20 = twenty ___ eight', a: ['past'] },
        { t: 'input', q: 'Doplň: 11:50 = ten ___ twelve', a: ['to'] },
        { t: 'tf', q: '„half past seven“ je 6:30.', a: false, why: 'half past seven = 7:30.' },
        { t: 'tf', q: 'Kolik je hodin? = What time is it?', a: true },
        { t: 'order', q: 'Seřaď časy od nejdřívějšího.', items: ['quarter past five', 'half past five', 'quarter to six', 'six o’clock'] },
        { t: 'pair', q: 'Spoj.', pairs: [['1:30', 'half past one'], ['1:15', 'quarter past one'], ['12:45', 'quarter to one'], ['1:00', 'one o’clock']] },
        { t: 'choice', q: 'Jak se řekne „ve 3 hodiny“?', o: ['at three o’clock', 'in three o’clock', 'on three o’clock'], a: 0 },
        { t: 'open', q: 'V kolik vstáváš a v kolik začíná škola? Odpověz anglicky.', a: 'I get up at half past six. School starts at eight o’clock.' },
        { t: 'open', q: 'Kdy říkáme „past“ a kdy „to“?', a: 'Past do půl hodiny (minuty po celé), to po půl hodině (minuty do další celé).' },
      ],
    },
    {
      id: 'radove-cislovky-datum',
      title: 'Datum: first, second…',
      emoji: '🎂',
      ex: [
        {
          title: 'Kalendář',
          blocks: [
            { t: 'p', text: 'Kdy máš narozeniny? *My birthday is **on** the **fifth** of May.*' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '1st', back: 'first' }, { front: '2nd', back: 'second' }, { front: '3rd', back: 'third' },
              { front: '5th', back: 'fifth' }, { front: '12th', back: 'twelfth' }, { front: '20th', back: 'twentieth' },
            ] } },
            { t: 'key', text: 'Datum: **on** + den, **in** + měsíc.' },
          ],
        },
        {
          title: 'Pravidlo -th',
          blocks: [
            { t: 'p', text: 'Většina řadových číslovek = číslo + **-th**: *four → fourth, six → sixth*.' },
            { t: 'p', text: 'Výjimky: **first, second, third** (a 21st, 22nd, 23rd).' },
            { t: 'w', w: 'sort', p: { buckets: ['in', 'on'], items: [
              { text: 'May', b: 0 }, { text: 'Monday', b: 1 }, { text: 'the first of June', b: 1 }, { text: 'winter', b: 0 },
              { text: '2015', b: 0 }, { text: 'my birthday', b: 1 }, { text: 'July', b: 0 }, { text: 'Friday', b: 1 },
            ] } },
            { t: 'key', text: '**in** May, **on** Monday, **on** the 5th of May.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Řadová číslovka od 3:', o: ['third', 'threeth', 'thirth'], a: 0 },
        { t: 'choice', q: 'Řadová číslovka od 2:', o: ['second', 'twoth', 'secondth'], a: 0 },
        { t: 'input', q: 'Řadová číslovka od 1:', a: ['first'] },
        { t: 'input', q: 'Řadová číslovka od 4:', a: ['fourth'] },
        { t: 'input', q: 'Doplň předložku: My birthday is ___ June.', a: ['in'] },
        { t: 'choice', q: 'I have English ___ Tuesday.', o: ['on', 'in', 'at'], a: 0 },
        { t: 'tf', q: '„the twelfth“ je 12.', a: true },
        { t: 'tf', q: 'Správně je „in Monday“.', a: false, why: 'Dny v týdnu: on Monday.' },
        { t: 'pair', q: 'Spoj.', pairs: [['1st', 'first'], ['3rd', 'third'], ['9th', 'ninth'], ['20th', 'twentieth']] },
        { t: 'order', q: 'Seřaď.', items: ['first', 'second', 'third', 'fourth', 'fifth'] },
        { t: 'open', q: 'Kdy máš narozeniny? Odpověz celou anglickou větou.', a: 'My birthday is on the tenth of March.' },
        { t: 'open', q: 'Kdy použiješ „in“ a kdy „on“ u data?', a: 'In u měsíců, ročních období a roků (in May). On u dnů a konkrétních dat (on Monday, on the 5th of May).' },
      ],
    },
  ],
} satisfies Subject
