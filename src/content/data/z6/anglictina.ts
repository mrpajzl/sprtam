import type { Subject } from '../../types'

export default {
  grade: 'z6',
  subject: 'anglictina',
  topics: [
    {
      id: 'was-were',
      title: 'Was / were',
      emoji: '⏪',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Dnes: *I **am** at home.* Včera: *I **was** at school.*' },
            { t: 'p', text: 'Sloveso *be* má v minulosti jen dva tvary: **was** a **were**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I am', back: 'I was' },
              { front: 'he is', back: 'he was' },
              { front: 'we are', back: 'we were' },
              { front: 'they are', back: 'they were' },
              { front: 'you are', back: 'you were' },
            ] } },
            { t: 'key', text: 'am, is → **was**; are → **were**.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'Kladně', 'Zápor', 'Otázka'], rows: [
              ['I / he / she / it', 'was', "wasn't", 'Was he…?'],
              ['you / we / they', 'were', "weren't", 'Were you…?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She', after: 'tired yesterday.', options: ['was', 'were'], a: 0 },
              { before: 'We', after: 'in London last year.', options: ['was', 'were'], a: 1 },
              { before: 'The weather', after: 'nice.', options: ['was', 'were'], a: 0 },
              { before: '', after: 'they at the party?', options: ['Was', 'Were'], a: 1 },
            ] } },
            { t: 'key', text: 'Otázka: was/were jde **před** podmět.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ ill last week.', o: ['was', 'were', 'am'], a: 0, why: 'I → was.' },
        { t: 'choice', q: 'They ___ at the cinema.', o: ['was', 'were', 'is'], a: 1, why: 'They → were.' },
        { t: 'input', q: 'Doplň: My parents ___ at work yesterday.', a: ['were'], why: 'Parents = they → were.' },
        { t: 'input', q: 'Zápor: The film ___ good. (nebyl)', a: ["wasn't", 'was not'], why: 'It → was not = wasn\'t.' },
        { t: 'tf', q: 'Věta „You was late.“ je správně.', a: false, why: 'You → were: You were late.' },
        { t: 'choice', q: 'Vyber správnou otázku.', o: ['Were you at home?', 'Was you at home?', 'You were at home?'], a: 0, why: 'You → were, a were jde před podmět.' },
        { t: 'pair', q: 'Spoj přítomnost s minulostí.', pairs: [['I am', 'I was'], ['she is', 'she was'], ['we are', 'we were'], ["they aren't", "they weren't"]] },
        { t: 'input', q: 'Krátká odpověď: Was it cold? – Yes, it ___.', a: ['was'] },
        { t: 'order', q: 'Seřaď otázku.', items: ['Where', 'were', 'you', 'yesterday?'] },
        { t: 'tf', q: '„There were two cats in the garden.“ je správně.', a: true, why: 'Two cats = množné číslo → were.' },
        { t: 'open', q: 'Kdy použiješ was a kdy were?', a: 'Was u I, he, she, it (jednotné číslo). Were u you, we, they (a množného čísla).' },
        { t: 'open', q: 'Jak se zeptáš „Byl jsi včera ve škole?“ a jak odpovíš záporně?', a: 'Were you at school yesterday? – No, I wasn\'t.' },
      ],
    },
    {
      id: 'past-simple-pravidelna',
      title: 'Minulý čas: pravidelná slovesa',
      emoji: '✅',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: '*Yesterday I **played** football and **watched** TV.*' },
            { t: 'p', text: 'Pravidelné sloveso dostane koncovku **-ed**. Stejně pro všechny osoby.' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'play', label: 'sloveso' }, { text: 'ed', label: 'minulost' }] },
              { parts: [{ text: 'stop', label: 'sloveso' }, { text: 'p', label: 'zdvojení' }, { text: 'ed', label: 'minulost' }] },
              { parts: [{ text: 'stud', label: 'sloveso' }, { text: 'i', label: 'y → i' }, { text: 'ed', label: 'minulost' }] },
            ] } },
            { t: 'key', text: 'Sloveso + **-ed** = minulý čas.' },
          ],
        },
        {
          title: 'Pravidla pravopisu',
          blocks: [
            { t: 'table', head: ['Pravidlo', 'Příklad'], rows: [
              ['většina: + ed', 'walk → walked'],
              ['končí na -e: + d', 'like → liked'],
              ['souhláska + y: y → ied', 'cry → cried'],
              ['krátká slabika: zdvoj', 'stop → stopped'],
            ] },
            { t: 'p', text: 'Výslovnost: /t/ *walked*, /d/ *played*, /ɪd/ po t a d: *wanted, needed*.' },
            { t: 'w', w: 'sort', p: { buckets: ['/t/', '/d/', '/ɪd/'], items: [
              { text: 'walked', b: 0 }, { text: 'helped', b: 0 }, { text: 'watched', b: 0 },
              { text: 'played', b: 1 }, { text: 'opened', b: 1 }, { text: 'lived', b: 1 },
              { text: 'wanted', b: 2 }, { text: 'needed', b: 2 }, { text: 'visited', b: 2 },
            ] } },
            { t: 'key', text: '**-ed** se čte jako slabika /ɪd/ jen po **t** a **d**.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Minulý čas: play →', a: ['played'], why: 'Samohláska + y → jen + ed.' },
        { t: 'input', q: 'Minulý čas: study →', a: ['studied'], why: 'Souhláska + y → ied.' },
        { t: 'input', q: 'Minulý čas: stop →', a: ['stopped'], why: 'Krátká slabika → zdvojí se p.' },
        { t: 'choice', q: 'Minulý čas od „like“:', o: ['liked', 'likeed', 'likd'], a: 0, why: 'Končí na -e → jen + d.' },
        { t: 'choice', q: 'Ve kterém slově se -ed čte jako /ɪd/?', o: ['started', 'cooked', 'cleaned'], a: 0, why: '/ɪd/ jen po t a d: start → started.' },
        { t: 'tf', q: 'V minulém čase má he/she/it koncovku -s: „He playeds.“', a: false, why: 'V minulém čase je tvar pro všechny osoby stejný: he played.' },
        { t: 'choice', q: 'Vyber správně napsaný tvar.', o: ['carried', 'carryed', 'carred'], a: 0, why: 'Carry: souhláska + y → carried.' },
        { t: 'pair', q: 'Spoj sloveso s minulým tvarem.', pairs: [['walk', 'walked'], ['dance', 'danced'], ['try', 'tried'], ['plan', 'planned']] },
        { t: 'input', q: 'Doplň: Last Sunday we ___ (visit) Grandma.', a: ['visited'] },
        { t: 'order', q: 'Seřaď větu.', items: ['I', 'watched', 'a film', 'last night.'] },
        { t: 'open', q: 'Jak vytvoříš minulý čas pravidelného slovesa? Uveď příklady pravopisných změn.', a: 'Přidám -ed: walk → walked. Na -e jen -d (like → liked), souhláska + y → ied (study → studied), krátká slabika zdvojí souhlásku (stop → stopped).' },
        { t: 'open', q: 'Jak se vyslovuje koncovka -ed?', a: 'Jako /t/ (walked), /d/ (played), nebo /ɪd/ – ta jen po t a d (wanted, needed).' },
      ],
    },
    {
      id: 'past-simple-nepravidelna',
      title: 'Minulý čas: nepravidelná slovesa',
      emoji: '🔀',
      ex: [
        {
          title: 'Kartičkami',
          blocks: [
            { t: 'p', text: 'Některá slovesa -ed nemají. Jejich tvar se musíš **naučit**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'go', back: 'went' },
              { front: 'have', back: 'had' },
              { front: 'see', back: 'saw' },
              { front: 'eat', back: 'ate' },
              { front: 'buy', back: 'bought' },
              { front: 'write', back: 'wrote' },
              { front: 'take', back: 'took' },
              { front: 'come', back: 'came' },
            ] } },
            { t: 'key', text: 'Nepravidelná slovesa = 2. tvar z tabulky, naučit nazpaměť.' },
          ],
        },
        {
          title: 'Ve skupinách',
          blocks: [
            { t: 'p', text: 'Lépe se učí ve skupinách podle podobnosti.' },
            { t: 'table', head: ['Skupina', 'Příklady'], rows: [
              ['beze změny', 'put → put, cut → cut'],
              ['-ought / -aught', 'buy → bought, think → thought, teach → taught'],
              ['i → a', 'swim → swam, drink → drank, sing → sang'],
              ['úplně jiné', 'go → went, be → was/were'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['pravidelné', 'nepravidelné'], items: [
              { text: 'jump', b: 0 }, { text: 'cook', b: 0 }, { text: 'open', b: 0 }, { text: 'help', b: 0 },
              { text: 'go', b: 1 }, { text: 'see', b: 1 }, { text: 'drink', b: 1 }, { text: 'make', b: 1 },
            ] } },
            { t: 'key', text: 'Tvar je pro všechny osoby stejný: *I went, she went*.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Minulý čas: go →', a: ['went'] },
        { t: 'input', q: 'Minulý čas: see →', a: ['saw'] },
        { t: 'input', q: 'Minulý čas: buy →', a: ['bought'] },
        { t: 'choice', q: 'Minulý čas od „eat“:', o: ['ate', 'eated', 'eat'], a: 0, why: 'Eat je nepravidelné: eat – ate – eaten.' },
        { t: 'choice', q: 'Které sloveso je nepravidelné?', o: ['write', 'walk', 'play'], a: 0, why: 'write → wrote.' },
        { t: 'tf', q: 'Minulý čas od „put“ je „put“.', a: true, why: 'Put patří ke slovesům beze změny.' },
        { t: 'pair', q: 'Spoj sloveso s minulým tvarem.', pairs: [['make', 'made'], ['take', 'took'], ['come', 'came'], ['think', 'thought'], ['swim', 'swam']] },
        { t: 'choice', q: 'Yesterday she ___ a new bike.', o: ['got', 'getted', 'gets'], a: 0, why: 'Get → got.' },
        { t: 'input', q: 'Doplň: We ___ (have) pizza for lunch.', a: ['had'] },
        { t: 'tf', q: '„I goed to school.“ je správně.', a: false, why: 'Go je nepravidelné: I went to school.' },
        { t: 'open', q: 'Čím se liší pravidelná a nepravidelná slovesa v minulém čase?', a: 'Pravidelná dostanou -ed (play → played). Nepravidelná mají vlastní tvar, který se musím naučit (go → went).' },
        { t: 'open', q: 'Řekni anglicky tři věci, které jsi dělal(a) včera, s nepravidelnými slovesy.', a: 'Např.: I went to school. I ate a sandwich. I saw my friend.' },
      ],
    },
    {
      id: 'past-simple-otazky-zapory',
      title: 'Minulý čas: otázky a zápory',
      emoji: '❓',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Pomocník **did** nese minulost. Sloveso se vrátí do **základního tvaru**.' },
            { t: 'example', q: 'She went home. → zápor?', a: "She **didn't go** home. (ne *didn't went*)" },
            { t: 'example', q: 'He played tennis. → otázka?', a: '**Did** he **play** tennis?' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I didn\'t', after: 'the film.', options: ['see', 'saw'], a: 0 },
              { before: 'Did you', after: 'your homework?', options: ['do', 'did'], a: 0 },
              { before: 'They', after: 'come to the party.', options: ["didn't", "don't"], a: 0 },
              { before: 'Where', after: 'you go?', options: ['did', 'were'], a: 0 },
            ] } },
            { t: 'key', text: 'Po **did / didn\'t** je vždy základní tvar slovesa.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'table', head: ['', 'Vzorec', 'Příklad'], rows: [
              ['zápor', "podmět + didn't + sloveso", "I didn't watch TV."],
              ['otázka', 'Did + podmět + sloveso?', 'Did you watch TV?'],
              ['krátká odpověď', "Yes, I did. / No, I didn't.", ''],
              ['tázací slovo', 'Wh- + did + podmět + sloveso?', 'What did you eat?'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'He ate fish.', back: "He didn't eat fish." },
              { front: 'You saw Tom.', back: 'Did you see Tom?' },
              { front: 'We won.', back: "We didn't win." },
            ] } },
            { t: 'key', text: '**Did** je jen jednou – sloveso už minulé není.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Zápor: I ___ my keys.', o: ["didn't find", "didn't found", "don't found"], a: 0, why: "Po didn't je základní tvar: find." },
        { t: 'choice', q: 'Otázka:', o: ['Did you like it?', 'Did you liked it?', 'You did like it?'], a: 0, why: 'Did + podmět + základní tvar.' },
        { t: 'input', q: 'Doplň: ___ she call you yesterday?', a: ['did'] },
        { t: 'input', q: 'Doplň zápor: We ___ go out. (nešli jsme)', a: ["didn't", 'did not'] },
        { t: 'input', q: 'Krátká odpověď: Did they win? – No, they ___.', a: ["didn't", 'did not'] },
        { t: 'tf', q: '„He didn\'t went to school.“ je správně.', a: false, why: "Správně: He didn't go to school." },
        { t: 'order', q: 'Seřaď otázku.', items: ['What', 'did', 'you', 'buy?'] },
        { t: 'order', q: 'Seřaď zápor.', items: ['She', "didn't", 'eat', 'breakfast.'] },
        { t: 'choice', q: 'Otázka na „Tom saw a fox.“', o: ['Did Tom see a fox?', 'Did Tom saw a fox?', 'Saw Tom a fox?'], a: 0 },
        { t: 'tf', q: 'U was/were se did nepoužívá: „Were you tired?“', a: true, why: 'Be tvoří otázku sám: Were you…? Wasn\'t…' },
        { t: 'open', q: 'Jak utvoříš otázku a zápor v minulém čase prostém?', a: "Pomocí did / didn't a základního tvaru slovesa: Did you go? I didn't go." },
        { t: 'open', q: 'Zeptej se kamaráda anglicky, co dělal o víkendu, a odpověz.', a: 'What did you do at the weekend? – I visited my grandparents and played football.' },
      ],
    },
    {
      id: 'object-pronouns',
      title: 'Zájmena v předmětu',
      emoji: '👉',
      ex: [
        {
          title: 'Situací',
          blocks: [
            { t: 'p', text: '*I like Tom.* → *I like **him**.* Na místě předmětu (koho, komu) je jiný tvar.' },
            { t: 'pic', items: ['👦', '➡️', '👧'], caption: 'He loves her. She loves him.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'This is Anna. I know', after: '.', options: ['her', 'she'], a: 0 },
              { before: 'Call', after: 'tomorrow, please.', options: ['me', 'I'], a: 0 },
              { before: 'Where are my shoes? I can\'t find', after: '.', options: ['them', 'they'], a: 0 },
              { before: 'Come with', after: '!', options: ['us', 'we'], a: 0 },
            ] } },
            { t: 'key', text: 'Po slovese a předložce: **me, you, him, her, it, us, them**.' },
          ],
        },
        {
          title: 'Dvojicemi',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I', back: 'me' },
              { front: 'you', back: 'you' },
              { front: 'he', back: 'him' },
              { front: 'she', back: 'her' },
              { front: 'it', back: 'it' },
              { front: 'we', back: 'us' },
              { front: 'they', back: 'them' },
            ] } },
            { t: 'table', head: ['Podmět (kdo?)', 'Předmět (koho?)'], rows: [
              ['**She** helps me.', 'I help **her**.'],
              ['**They** see us.', 'We see **them**.'],
            ] },
            { t: 'key', text: 'Před slovesem podmět, za ním předmět.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Předmětový tvar od „he“:', a: ['him'] },
        { t: 'input', q: 'Předmětový tvar od „we“:', a: ['us'] },
        { t: 'input', q: 'Předmětový tvar od „they“:', a: ['them'] },
        { t: 'choice', q: 'Can you help ___?', o: ['me', 'I', 'my'], a: 0, why: 'Za slovesem je předmět → me.' },
        { t: 'choice', q: 'I like my teacher. I like ___.', o: ['her', 'she', 'hers'], a: 0 },
        { t: 'choice', q: 'Look at the dog! Look at ___!', o: ['it', 'him', 'its'], a: 0, why: 'Zvíře (obecně) = it.' },
        { t: 'tf', q: '„This present is for she.“ je správně.', a: false, why: 'Po předložce předmětový tvar: for her.' },
        { t: 'pair', q: 'Spoj podmět a předmět.', pairs: [['I', 'me'], ['she', 'her'], ['we', 'us'], ['they', 'them']] },
        { t: 'tf', q: 'Tvar „you“ je stejný v podmětu i předmětu.', a: true },
        { t: 'order', q: 'Seřaď větu.', items: ['My mum', 'calls', 'me', 'every day.'] },
        { t: 'open', q: 'Kdy použiješ „he“ a kdy „him“? Uveď příklad.', a: 'He je podmět (kdo dělá): He plays. Him je předmět, po slovese nebo předložce: I see him. It is for him.' },
        { t: 'open', q: 'Nahraď podstatná jména zájmeny: „Peter gives the books to Jane and Mark.“', a: 'He gives them to them.' },
      ],
    },
    {
      id: 'countable-uncountable',
      title: 'Počitatelná a nepočitatelná',
      emoji: '🍎',
      ex: [
        {
          title: 'Obrázkem',
          blocks: [
            { t: 'pic', items: ['🍎', '🍎', '🍎'], caption: 'three apples – dají se spočítat' },
            { t: 'pic', items: ['🥛'], caption: 'milk – nespočítáš, jen množství' },
            { t: 'w', w: 'sort', p: { buckets: ['countable', 'uncountable'], items: [
              { text: 'apple', b: 0 }, { text: 'egg', b: 0 }, { text: 'chair', b: 0 }, { text: 'banana', b: 0 },
              { text: 'water', b: 1 }, { text: 'bread', b: 1 }, { text: 'money', b: 1 }, { text: 'rice', b: 1 }, { text: 'information', b: 1 },
            ] } },
            { t: 'key', text: 'Nepočitatelná nemají množné číslo ani *a/an*.' },
          ],
        },
        {
          title: 'Pravidlem',
          blocks: [
            { t: 'table', head: ['', 'Počitatelné', 'Nepočitatelné'], rows: [
              ['jedna věc', 'a banana, an egg', '—'],
              ['víc', 'two bananas', 'some milk'],
              ['sloveso', 'The eggs **are**…', 'The milk **is**…'],
            ] },
            { t: 'p', text: '**an** před samohláskou ve výslovnosti: *an apple, an hour*.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I want', after: 'orange.', options: ['an', 'a', 'some'], a: 0 },
              { before: 'Can I have', after: 'water?', options: ['some', 'a', 'an'], a: 0 },
              { before: 'She has got', after: 'cat.', options: ['a', 'an', 'some'], a: 0 },
              { before: 'The bread', after: 'fresh.', options: ['is', 'are'], a: 0 },
            ] } },
            { t: 'key', text: 'Nepočitatelné: *some* + sloveso v jednotném čísle.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je nepočitatelné?', o: ['cheese', 'sandwich', 'cup'], a: 0 },
        { t: 'choice', q: 'Které slovo je počitatelné?', o: ['carrot', 'sugar', 'juice'], a: 0 },
        { t: 'tf', q: '„money“ je v angličtině nepočitatelné.', a: true, why: 'Money is…, počítáme mince (coins) nebo bankovky (notes).' },
        { t: 'tf', q: '„I need an information.“ je správně.', a: false, why: 'Information je nepočitatelné: some information.' },
        { t: 'input', q: 'Doplň a / an: ___ umbrella', a: ['an'], why: 'Umbrella začíná samohláskou.' },
        { t: 'input', q: 'Doplň a / an: ___ dog', a: ['a'] },
        { t: 'choice', q: 'The milk ___ in the fridge.', o: ['is', 'are'], a: 0, why: 'Nepočitatelné → jednotné číslo.' },
        { t: 'choice', q: 'Vyber správně.', o: ['some rice', 'a rice', 'two rices'], a: 0 },
        { t: 'pair', q: 'Spoj s vhodným slovem.', pairs: [['a', 'pen'], ['an', 'egg'], ['some', 'soup'], ['two', 'books']] },
        { t: 'input', q: 'Jak se řekne „sklenice vody“? a ___ of water', a: ['glass'], why: 'Nepočitatelné „počítáme“ přes obal: a glass of water.' },
        { t: 'open', q: 'Jaký je rozdíl mezi počitatelnými a nepočitatelnými podstatnými jmény?', a: 'Počitatelná můžu spočítat, mají množné číslo a a/an (an apple, two apples). Nepočitatelná ne, používám some nebo míru (some milk, a bottle of milk).' },
        { t: 'open', q: 'Řekni anglicky, co je v ledničce – aspoň jedno počitatelné a jedno nepočitatelné.', a: 'There are some eggs and there is some cheese. There is an apple.' },
      ],
    },
    {
      id: 'some-any',
      title: 'Some / any',
      emoji: '🛒',
      ex: [
        {
          title: 'V obchodě',
          blocks: [
            { t: 'p', text: '*We have got **some** eggs. We haven\'t got **any** milk. Have we got **any** bread?*' },
            { t: 'w', w: 'sort', p: { buckets: ['some', 'any'], items: [
              { text: 'There are ___ cars.', b: 0 }, { text: 'I have ___ money.', b: 0 }, { text: 'Would you like ___ tea?', b: 0 },
              { text: "I haven't got ___ pets.", b: 1 }, { text: 'Is there ___ juice?', b: 1 }, { text: "There isn't ___ sugar.", b: 1 },
            ] } },
            { t: 'key', text: 'Kladná věta → **some**. Zápor a otázka → **any**.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Věta', 'Slovo', 'Příklad'], rows: [
              ['kladná', 'some', 'I\'ve got some apples.'],
              ['záporná', 'any', 'I haven\'t got any apples.'],
              ['otázka', 'any', 'Have you got any apples?'],
              ['nabídka / prosba', 'some', 'Would you like some apples?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'There aren\'t', after: 'chairs.', options: ['any', 'some'], a: 0 },
              { before: 'Can I have', after: 'cake, please?', options: ['some', 'any'], a: 0 },
              { before: 'Are there', after: 'questions?', options: ['any', 'some'], a: 0 },
            ] } },
            { t: 'key', text: 'Výjimka: nabídka a prosba mají **some**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'There are ___ books on the table.', o: ['some', 'any'], a: 0 },
        { t: 'choice', q: "I don't have ___ brothers.", o: ['any', 'some'], a: 0 },
        { t: 'choice', q: 'Is there ___ milk?', o: ['any', 'some'], a: 0 },
        { t: 'choice', q: 'Would you like ___ coffee?', o: ['some', 'any'], a: 0, why: 'Nabídka → some.' },
        { t: 'input', q: "Doplň: We haven't got ___ bread.", a: ['any'] },
        { t: 'input', q: 'Doplň: I bought ___ new shoes.', a: ['some'] },
        { t: 'tf', q: '„Have you got any pens?“ je správně.', a: true },
        { t: 'tf', q: '„There isn\'t some water.“ je správně.', a: false, why: 'Zápor → any: There isn\'t any water.' },
        { t: 'input', q: 'Doplň: Can I have ___ water, please?', a: ['some'], why: 'Prosba → some.' },
        { t: 'order', q: 'Seřaď větu.', items: ['There', "aren't", 'any', 'eggs.'] },
        { t: 'open', q: 'Kdy použiješ some a kdy any?', a: 'Some v kladných větách a v nabídkách či prosbách. Any v záporných větách a otázkách.' },
        { t: 'open', q: 'Řekni anglicky, co máš a nemáš v penále (some / any).', a: 'I have got some pencils. I haven\'t got any scissors.' },
      ],
    },
    {
      id: 'how-much-many',
      title: 'How much / how many',
      emoji: '🔢',
      ex: [
        {
          title: 'Otázkou',
          blocks: [
            { t: 'p', text: '*How **many** apples?* – počítám kusy. *How **much** water?* – měřím množství.' },
            { t: 'p', text: 'Cena: *How much is it?* – Kolik to stojí?' },
            { t: 'w', w: 'sort', p: { buckets: ['How much…?', 'How many…?'], items: [
              { text: 'sugar', b: 0 }, { text: 'time', b: 0 }, { text: 'money', b: 0 }, { text: 'milk', b: 0 },
              { text: 'friends', b: 1 }, { text: 'pencils', b: 1 }, { text: 'days', b: 1 }, { text: 'people', b: 1 },
            ] } },
            { t: 'key', text: '**many** + množné číslo; **much** + nepočitatelné.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'Počitatelné', 'Nepočitatelné'], rows: [
              ['otázka', 'How many cats?', 'How much juice?'],
              ['zápor', "not many cats", "not much juice"],
              ['kladně', 'a lot of cats', 'a lot of juice'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'How', after: 'brothers have you got?', options: ['many', 'much'], a: 0 },
              { before: 'How', after: 'homework do you have?', options: ['much', 'many'], a: 0 },
              { before: 'There isn\'t', after: 'cheese.', options: ['much', 'many'], a: 0 },
            ] } },
            { t: 'key', text: 'V kladných větách raději **a lot of**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'How ___ students are in your class?', o: ['many', 'much'], a: 0 },
        { t: 'choice', q: 'How ___ water do you drink?', o: ['much', 'many'], a: 0 },
        { t: 'choice', q: 'How ___ is this T-shirt? – £10.', o: ['much', 'many'], a: 0, why: 'Cena → How much.' },
        { t: 'input', q: 'Doplň: How ___ money have you got?', a: ['much'] },
        { t: 'input', q: 'Doplň: How ___ eggs do we need?', a: ['many'] },
        { t: 'tf', q: '„How many people“ je správně.', a: true, why: 'People je množné číslo (osoby).' },
        { t: 'tf', q: '„I haven\'t got many time.“ je správně.', a: false, why: 'Time (čas) je nepočitatelné → much time.' },
        { t: 'choice', q: 'Které spojení je správně?', o: ['a lot of friends', 'much friends', 'a lot friends'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['How many cars?', 'Kolik aut?'], ['How much bread?', 'Kolik chleba?'], ['How much is it?', 'Kolik to stojí?']] },
        { t: 'order', q: 'Seřaď otázku.', items: ['How', 'many', 'pets', 'have you got?'] },
        { t: 'open', q: 'Kdy se ptáš how much a kdy how many?', a: 'How many u počitatelných v množném čísle (How many books?). How much u nepočitatelných (How much milk?) a na cenu (How much is it?).' },
        { t: 'open', q: 'Zeptej se anglicky, kolik stojí lístek, a kolik lidí přijde.', a: 'How much is the ticket? How many people are coming?' },
      ],
    },
    {
      id: 'going-to',
      title: 'Going to',
      emoji: '🗓️',
      ex: [
        {
          title: 'Plány',
          blocks: [
            { t: 'p', text: 'Už jsem se rozhodl: *I\'m **going to** visit Prague next week.*' },
            { t: 'p', text: 'Vidím, co přijde: *Look at the clouds! It\'s **going to** rain.*' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1, label: 'teď: rozhodnu se' },
              { year: 2, label: 'zítra: buy a ticket' },
              { year: 3, label: 'sobota: visit Prague' },
            ] } },
            { t: 'key', text: '**going to** = plán nebo jasná předpověď.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'table', head: ['', 'Vzorec'], rows: [
              ['kladně', "I'm / he's / we're going to + sloveso"],
              ['zápor', "I'm not / he isn't / we aren't going to + sloveso"],
              ['otázka', 'Are you / Is she going to + sloveso?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She', after: 'going to learn French.', options: ['is', 'are', 'am'], a: 0 },
              { before: 'We', after: 'going to play.', options: ['are', 'is', 'am'], a: 0 },
              { before: 'I\'m going to', after: 'a cake.', options: ['make', 'making', 'made'], a: 0 },
            ] } },
            { t: 'key', text: 'am/is/are + going to + **základní tvar**.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ going to watch a film tonight.', o: ['am', 'is', 'are'], a: 0 },
        { t: 'choice', q: 'They ___ going to buy a car.', o: ['are', 'is', 'am'], a: 0 },
        { t: 'choice', q: 'He is going to ___ football.', o: ['play', 'plays', 'playing'], a: 0, why: 'Po going to základní tvar.' },
        { t: 'input', q: 'Doplň zápor: She ___ going to come. (nepřijde)', a: ["isn't", 'is not', "'s not"] },
        { t: 'input', q: 'Doplň otázku: ___ you going to help me?', a: ['are'] },
        { t: 'tf', q: '„Look at that ball! It\'s going to break the window.“ vyjadřuje předpověď podle toho, co vidím.', a: true },
        { t: 'tf', q: '„We going to travel.“ je správně.', a: false, why: 'Chybí are: We are going to travel.' },
        { t: 'order', q: 'Seřaď větu.', items: ['I', 'am', 'going to', 'visit', 'my aunt.'] },
        { t: 'order', q: 'Seřaď otázku.', items: ['What', 'are', 'you', 'going to', 'do?'] },
        { t: 'input', q: 'Krátká odpověď: Is he going to swim? – Yes, he ___.', a: ['is'] },
        { t: 'open', q: 'K čemu slouží going to? Uveď dva příklady.', a: 'Pro plány, o kterých jsem už rozhodl (I\'m going to visit Grandma), a pro předpovědi podle toho, co vidím (It\'s going to rain).' },
        { t: 'open', q: 'Řekni anglicky tři věci, které chceš dělat o prázdninách.', a: 'I\'m going to swim in the sea. I\'m going to read books. I\'m going to visit my cousins.' },
      ],
    },
  ],
} satisfies Subject
