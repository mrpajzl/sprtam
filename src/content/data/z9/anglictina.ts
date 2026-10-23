import type { Subject } from '../../types'

export default {
  grade: 'z9',
  subject: 'anglictina',
  topics: [
    {
      id: 'first-conditional',
      title: 'First conditional',
      emoji: '🌦️',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Zítra možná bude pršet. Co uděláš?' },
            { t: 'example', q: 'Jestli bude pršet, zůstanu doma.', a: 'If it **rains**, I **will stay** at home.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'If you study, you', after: 'pass.', options: ['will', 'would'], a: 0 },
              { before: 'If it', after: 'sunny, we’ll go out.', options: ['is', 'will be'], a: 0 },
              { before: 'She will be angry if you', after: 'late.', options: ['are', 'will be'], a: 0 },
            ] } },
            { t: 'key', text: 'Skutečná možnost v budoucnu: if + přítomný čas, will + sloveso.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'If it rains,', label: 'if + present simple' }, { text: 'I’ll take an umbrella.', label: 'will + sloveso' }] },
            ] } },
            { t: 'list', items: [
              'Po **if** nikdy nedávej will (česky „bude“, anglicky přítomný čas).',
              'Části lze prohodit: *I’ll take an umbrella if it rains.* (bez čárky)',
              'Zápor: *If you don’t hurry, you’ll miss the bus.*',
            ] },
            { t: 'key', text: 'Žádné will za if!' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'If it ___ tomorrow, we will stay in.', o: ['rains', 'will rain', 'rained'], a: 0, why: 'Za if přítomný čas.' },
        { t: 'choice', q: 'If you eat all the cake, you ___ sick.', o: ['will be', 'are', 'would be'], a: 0 },
        { t: 'tf', q: '„If I will see him, I will tell him.“ je správně.', a: false, why: 'Za if není will: If I see him, I will tell him.' },
        { t: 'input', q: 'Doplň: If she ___ (call), I’ll answer.', a: ['calls'], why: 'she → calls (present simple).' },
        { t: 'input', q: 'Doplň: If you don’t hurry, you ___ miss the train.', a: ['will', "'ll"] },
        { t: 'order', q: 'Seřaď větu.', items: ['If you', 'help me,', 'I', 'will', 'help you.'] },
        { t: 'pair', q: 'Spoj části.', pairs: [['If I have time,', 'I’ll call you.'], ['If it snows,', 'we’ll go skiing.'], ['If you’re tired,', 'you’ll make mistakes.']] },
        { t: 'choice', q: 'Vyber správně.', o: ['We won’t go out if it rains.', 'We don’t go out if it will rain.', 'We won’t go out if it will rain.'], a: 0 },
        { t: 'tf', q: 'First conditional mluví o reálné možnosti v budoucnosti.', a: true },
        { t: 'input', q: 'Doplň zápor: If you ___ (not) study, you will fail.', a: ["don't", 'do not', "don't study", 'do not study'] },
        { t: 'open', q: 'Jak se tvoří first conditional a kdy ho použiješ?', a: 'If + present simple, will + sloveso. Používá se pro reálnou možnost v budoucnu: If it rains, I will stay at home.' },
        { t: 'open', q: 'Řekni anglicky, co uděláš, když budeš mít o víkendu hezké počasí.', a: 'Např. If the weather is nice at the weekend, I will go cycling.' },
      ],
    },
    {
      id: 'zero-conditional',
      title: 'Zero conditional',
      emoji: '🧪',
      ex: [
        {
          title: 'Pokusem',
          blocks: [
            { t: 'p', text: 'Fyzikální pravidla platí vždycky.' },
            { t: 'pic', items: ['🧊', '🔥', '💧'], caption: 'If you heat ice, it melts.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'If you heat water to 100 °C,', back: 'it boils.' },
              { front: 'If you mix red and yellow,', back: 'you get orange.' },
              { front: 'If plants don’t get water,', back: 'they die.' },
            ] } },
            { t: 'key', text: 'Platí vždy: if + přítomný čas, přítomný čas.' },
          ],
        },
        {
          title: 'Srovnáním',
          blocks: [
            { t: 'table', head: ['typ', 'věta', 'význam'], rows: [
              ['zero', 'If you press it, it **opens**.', 'vždy (fakt)'],
              ['first', 'If you press it, it **will open**.', 'jednou situace v budoucnu'],
            ] },
            { t: 'p', text: '**If** jde často nahradit slovem **when** (kdykoli).' },
            { t: 'w', w: 'sort', p: { buckets: ['zero', 'first'], items: [
              { text: 'If you freeze water, it becomes ice.', b: 0 },
              { text: 'If it rains tomorrow, I’ll stay home.', b: 1 },
              { text: 'If I’m tired, I go to bed early.', b: 0 },
              { text: 'If you call me tonight, I’ll answer.', b: 1 },
              { text: 'If you drop glass, it breaks.', b: 0 },
              { text: 'If we win this match, we’ll be champions.', b: 1 },
            ] } },
            { t: 'key', text: 'Fakt / zvyk → zero. Konkrétní budoucnost → first.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'If you heat ice, it ___.', o: ['melts', 'will melt', 'melted'], a: 0, why: 'Obecný fakt → zero conditional.' },
        { t: 'tf', q: 'V zero conditional jsou obě části v přítomném čase.', a: true },
        { t: 'input', q: 'Doplň: If you mix blue and yellow, you ___ green.', a: ['get'] },
        { t: 'choice', q: 'Kterým slovem lze v zero conditional nahradit „if“?', o: ['when', 'will', 'because'], a: 0 },
        { t: 'pair', q: 'Spoj příčinu a následek.', pairs: [['If you don’t water plants,', 'they die.'], ['If I drink coffee at night,', 'I can’t sleep.'], ['If you press this button,', 'the door opens.']] },
        { t: 'tf', q: '„If water reaches 0 °C, it will freeze“ je zero conditional.', a: false, why: 'Je tam will → first conditional. Zero: it freezes.' },
        { t: 'input', q: 'Doplň: If my sister ___ (be) hungry, she gets angry.', a: ['is'] },
        { t: 'order', q: 'Seřaď větu.', items: ['If', 'you touch', 'fire,', 'you get', 'burnt.'] },
        { t: 'choice', q: 'Která věta je zero conditional?', o: ['If people don’t sleep, they get tired.', 'If I see Tom, I’ll tell him.', 'If it’s sunny, we’ll swim.'], a: 0 },
        { t: 'choice', q: 'If he ___ late, his teacher gets angry.', o: ['is', 'will be', 'was'], a: 0 },
        { t: 'open', q: 'Jaký je rozdíl mezi zero a first conditional?', a: 'Zero conditional vyjadřuje obecně platný fakt (if + present, present). First conditional mluví o konkrétní možné situaci v budoucnu (if + present, will).' },
        { t: 'open', q: 'Řekni anglicky jeden přírodní fakt pomocí zero conditional.', a: 'Např. If you heat water to 100 degrees, it boils.' },
      ],
    },
    {
      id: 'time-clauses',
      title: 'When, as soon as, before + budoucnost',
      emoji: '🕐',
      ex: [
        {
          title: 'Plánem dne',
          blocks: [
            { t: 'p', text: 'Domluva s mámou: *I’ll call you* **when** *I* **get** *home.*' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 7, label: '7:00 before I leave → I’ll pack' },
              { year: 15, label: '15:00 when I get home → I’ll call' },
              { year: 18, label: '18:00 as soon as I finish → I’ll eat' },
              { year: 19, label: '19:00 after I eat → I’ll rest' },
            ] } },
            { t: 'key', text: 'Česky „až přijdu“, anglicky *when I come* – bez will.' },
          ],
        },
        {
          title: 'Pravidlem',
          blocks: [
            { t: 'p', text: 'Po spojkách **when, as soon as, before, after, until** mluvíme o budoucnosti **přítomným časem**. Stejně jako po if.' },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I’ll text you as soon as I', after: '.', options: ['arrive', 'will arrive'], a: 0 },
              { before: 'Wait here until I', after: 'back.', options: ['come', 'will come'], a: 0 },
              { before: 'Before you', after: ', turn off the lights.', options: ['leave', 'will leave'], a: 0 },
              { before: 'When she finishes school, she', after: 'study medicine.', options: ['will', 'is'], a: 0 },
            ] } },
            { t: 'key', text: 'Spojka + present simple, hlavní věta + will.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I’ll phone you when I ___ home.', o: ['get', 'will get', 'got'], a: 0, why: 'Po when přítomný čas.' },
        { t: 'choice', q: 'As soon as the film ___, we’ll go.', o: ['ends', 'will end', 'ending'], a: 0 },
        { t: 'tf', q: '„I’ll wait until you will come.“ je správně.', a: false, why: 'Po until přítomný čas: until you come.' },
        { t: 'input', q: 'Doplň: Before he ___ (go) to bed, he will brush his teeth.', a: ['goes'] },
        { t: 'input', q: 'Doplň: When I ___ (be) eighteen, I’ll learn to drive.', a: ['am', "'m"] },
        { t: 'pair', q: 'Spoj spojku s významem.', pairs: [['as soon as', 'jakmile'], ['until', 'dokud ne'], ['before', 'předtím než'], ['after', 'potom co']] },
        { t: 'order', q: 'Seřaď větu.', items: ['I will', 'call you', 'as soon as', 'I', 'land.'] },
        { t: 'choice', q: 'Vyber správně.', o: ['We’ll start when everyone arrives.', 'We start when everyone will arrive.', 'We’ll start when everyone will arrive.'], a: 0 },
        { t: 'tf', q: 'V hlavní větě (bez spojky) se o budoucnosti mluví pomocí will.', a: true },
        { t: 'input', q: 'Přelož spojku „jakmile“ (3 slova).', a: ['as soon as'] },
        { t: 'open', q: 'Jaký čas použiješ po spojkách when, before, as soon as, když mluvíš o budoucnosti?', a: 'Present simple, ne will. Např. I’ll call you when I arrive.' },
        { t: 'open', q: 'Řekni anglicky, co uděláš, jakmile skončí škola.', a: 'Např. As soon as school finishes, I will go home and play football.' },
      ],
    },
    {
      id: 'passive-present',
      title: 'Trpný rod – přítomný',
      emoji: '🏭',
      ex: [
        {
          title: 'V továrně',
          blocks: [
            { t: 'p', text: 'Nezáleží na tom, **kdo** to dělá, ale **co se děje** s věcí.' },
            { t: 'list', items: [
              'Workers make cars here. (činný)',
              'Cars **are made** here. (trpný)',
              'English **is spoken** all over the world.',
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'They grow rice in China.', back: 'Rice is grown in China.' },
              { front: 'People speak French here.', back: 'French is spoken here.' },
              { front: 'They clean the rooms every day.', back: 'The rooms are cleaned every day.' },
            ] } },
            { t: 'key', text: 'Trpný rod: důležitá je věc, ne ten, kdo to dělá.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'Cheese', label: 'věc' }, { text: 'is', label: 'am/is/are' }, { text: 'made', label: '3. tvar' }] },
              { parts: [{ text: 'Cars', label: 'věc' }, { text: 'are', label: 'am/is/are' }, { text: 'washed', label: '3. tvar' }] },
            ] } },
            { t: 'p', text: 'Kdo to dělá, přidáš pomocí **by**: *The book is read* **by** *millions.*' },
            { t: 'key', text: 'am/is/are + 3. tvar slovesa.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Paper ___ from wood.', o: ['is made', 'makes', 'is make'], a: 0, why: 'is + 3. tvar.' },
        { t: 'choice', q: 'These phones ___ in Asia.', o: ['are produced', 'is produced', 'produce'], a: 0, why: 'phones = množné číslo → are.' },
        { t: 'input', q: 'Doplň: English ___ spoken in Australia.', a: ['is'] },
        { t: 'input', q: 'Doplň 3. tvar: Coffee is ___ (grow) in Brazil.', a: ['grown'] },
        { t: 'tf', q: 'V trpném rodě uvádíme původce pomocí „by“.', a: true },
        { t: 'tf', q: '„The windows is cleaned every week.“ je správně.', a: false, why: 'windows → are cleaned.' },
        { t: 'order', q: 'Seřaď větu.', items: ['The', 'letters', 'are', 'delivered', 'every', 'morning.'] },
        { t: 'pair', q: 'Spoj činný a trpný rod.', pairs: [['They sell bread here.', 'Bread is sold here.'], ['They build houses.', 'Houses are built.'], ['They use computers.', 'Computers are used.']] },
        { t: 'choice', q: 'Která věta je v trpném rodě?', o: ['The cake is eaten.', 'He eats the cake.', 'He is eating the cake.'], a: 0 },
        { t: 'input', q: 'Doplň zápor: Pets ___ allowed in this shop.', a: ["aren't", 'are not'] },
        { t: 'open', q: 'Jak se tvoří trpný rod v přítomném čase?', a: 'Tvar am/is/are a 3. tvar slovesa, např. Cars are made in Mladá Boleslav.' },
        { t: 'open', q: 'Kdy použijeme trpný rod?', a: 'Když je důležitější děj nebo věc než to, kdo ho dělá, nebo když původce neznáme.' },
      ],
    },
    {
      id: 'passive-past',
      title: 'Trpný rod – minulý',
      emoji: '🏰',
      ex: [
        {
          title: 'Historií',
          blocks: [
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1348, label: 'Charles University was founded.' },
              { year: 1889, label: 'The Eiffel Tower was built.' },
              { year: 1969, label: 'Apollo 11 was launched to the Moon.' },
            ] } },
            { t: 'p', text: 'Mluvíme o tom, **co se stalo** s věcí v minulosti.' },
            { t: 'key', text: 'was/were + 3. tvar.' },
          ],
        },
        {
          title: 'Přeměnou',
          blocks: [
            { t: 'steps', items: [
              'Činná věta: *Shakespeare wrote Hamlet.*',
              'Předmět dej na začátek: *Hamlet …*',
              'Přidej was/were: *Hamlet was …*',
              'Přidej 3. tvar: *Hamlet was written …*',
              'Původce s by: *Hamlet was written by Shakespeare.*',
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'The window', after: 'broken yesterday.', options: ['was', 'were'], a: 0 },
              { before: 'The tickets were', after: 'online.', options: ['sold', 'sell'], a: 0 },
              { before: 'America was discovered', after: 'Columbus.', options: ['by', 'from'], a: 0 },
            ] } },
            { t: 'key', text: 'Jednotné číslo was, množné were.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'The Eiffel Tower ___ in 1889.', o: ['was built', 'built', 'is built'], a: 0 },
        { t: 'choice', q: 'The cars ___ last week.', o: ['were stolen', 'was stolen', 'were stole'], a: 0, why: 'cars → were; steal – stole – stolen.' },
        { t: 'input', q: 'Doplň: The book was ___ (write) in 1990.', a: ['written'] },
        { t: 'input', q: 'Doplň: The letters ___ sent yesterday.', a: ['were'] },
        { t: 'tf', q: '„The film was directed by Miloš Forman.“ je trpný rod.', a: true },
        { t: 'order', q: 'Seřaď větu.', items: ['The', 'telephone', 'was', 'invented', 'by', 'Bell.'] },
        { t: 'pair', q: 'Spoj.', pairs: [['Mona Lisa', 'was painted by Leonardo.'], ['Penicillin', 'was discovered by Fleming.'], ['The pyramids', 'were built in Egypt.']] },
        { t: 'choice', q: 'Převeď: „Somebody stole my bike.“', o: ['My bike was stolen.', 'My bike stole.', 'My bike is stolen by somebody yesterday.'], a: 0, why: 'Nevíme kdo → původce vynecháme.' },
        { t: 'tf', q: '„The house were built in 1900.“ je správně.', a: false, why: 'house → was built.' },
        { t: 'input', q: 'Doplň předložku: The song was sung ___ Adele.', a: ['by'] },
        { t: 'open', q: 'Převeď do trpného rodu: „Karel IV. founded Charles University.“', a: 'Charles University was founded by Charles IV.' },
        { t: 'open', q: 'Jak se tvoří trpný rod v minulém čase?', a: 'Was (jednotné číslo) nebo were (množné číslo) a 3. tvar slovesa. Původce se uvádí pomocí by.' },
      ],
    },
    {
      id: 'relative-clauses-uvod',
      title: 'Who, which, that, where',
      emoji: '🔗',
      ex: [
        {
          title: 'Hádankou',
          blocks: [
            { t: 'p', text: 'Popiš slovo, aby ho kamarád uhodl.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'a person who teaches', back: 'teacher' },
              { front: 'a thing which tells the time', back: 'clock' },
              { front: 'a place where you buy food', back: 'shop' },
              { front: 'an animal that gives milk', back: 'cow' },
            ] } },
            { t: 'key', text: 'who = lidé, which = věci a zvířata, where = místa, that = lidé i věci.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'table', head: ['slovo', 'pro', 'příklad'], rows: [
              ['who', 'lidi', 'the girl who lives here'],
              ['which', 'věci, zvířata', 'the book which I read'],
              ['that', 'lidi i věci', 'the car that he bought'],
              ['where', 'místa', 'the town where I was born'],
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['who', 'which', 'where'], items: [
              { text: 'the man ___ called', b: 0 },
              { text: 'the house ___ I live', b: 2 },
              { text: 'the dog ___ barks', b: 1 },
              { text: 'the doctor ___ helped me', b: 0 },
              { text: 'the school ___ I study', b: 2 },
              { text: 'the phone ___ I lost', b: 1 },
            ] } },
            { t: 'key', text: 'Česky „který“ – anglicky podle toho, co popisuješ.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'This is the boy ___ broke the window.', o: ['who', 'which', 'where'], a: 0, why: 'boy = člověk.' },
        { t: 'choice', q: 'I lost the book ___ you gave me.', o: ['which', 'who', 'where'], a: 0, why: 'book = věc.' },
        { t: 'choice', q: 'This is the café ___ we met.', o: ['where', 'which', 'who'], a: 0, why: 'Místo, kde se něco stalo → where.' },
        { t: 'tf', q: '„that“ můžeme použít pro lidi i pro věci.', a: true },
        { t: 'tf', q: '„The dog who lives next door…“ je ve školní angličtině preferovaná varianta.', a: false, why: 'Pro zvířata používáme which nebo that.' },
        { t: 'input', q: 'Doplň: A pilot is a person ___ flies planes.', a: ['who', 'that'] },
        { t: 'input', q: 'Doplň: A library is a place ___ you can borrow books.', a: ['where'] },
        { t: 'pair', q: 'Spoj.', pairs: [['a person', 'who'], ['a thing', 'which'], ['a place', 'where']] },
        { t: 'order', q: 'Seřaď větu.', items: ['She', 'is', 'the', 'girl', 'who', 'won.'] },
        { t: 'choice', q: 'A fridge is a machine ___ keeps food cold.', o: ['that', 'where', 'who'], a: 0 },
        { t: 'open', q: 'Kdy použiješ who, which a where?', a: 'Who pro lidi, which pro věci a zvířata, where pro místa. That jde použít pro lidi i věci.' },
        { t: 'open', q: 'Vysvětli anglicky jednou větou, co je „dentist“.', a: 'A dentist is a person who looks after people’s teeth.' },
      ],
    },
    {
      id: 'used-to',
      title: 'Used to',
      emoji: '👶',
      ex: [
        {
          title: 'Kdysi a dnes',
          blocks: [
            { t: 'p', text: 'Dědeček vypráví, jak to bylo dřív.' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 1970, label: 'I used to walk to school.' },
              { year: 1980, label: 'We used to have no TV.' },
              { year: 2026, label: 'Now I drive a car.' },
            ] } },
            { t: 'example', q: 'Co znamená „I used to play the piano.“?', a: 'Dřív jsem hrával na klavír (teď už ne).' },
            { t: 'key', text: 'used to = dřív se to dělalo, teď už ne.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['', 'tvar'], rows: [
              ['+', 'I **used to** live there.'],
              ['−', 'I **didn’t use to** like fish.'],
              ['?', '**Did** you **use to** play football?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She', after: 'to have long hair.', options: ['used', 'uses'], a: 0 },
              { before: 'Did you', after: 'to live here?', options: ['use', 'used'], a: 0 },
              { before: 'He didn’t', after: 'to like school.', options: ['use', 'used'], a: 0 },
            ] } },
            { t: 'key', text: 'S did/didn’t se píše use (bez -d).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ to have a dog, but it died.', o: ['used', 'use', 'was used'], a: 0 },
        { t: 'choice', q: '___ you use to play with toys?', o: ['Did', 'Do', 'Were'], a: 0 },
        { t: 'tf', q: '„I used to live in Prague.“ znamená, že v Praze bydlím i teď.', a: false, why: 'used to = dřív ano, teď už ne.' },
        { t: 'input', q: 'Doplň: We didn’t ___ to go abroad.', a: ['use'] },
        { t: 'input', q: 'Doplň: My dad ___ to smoke, but he stopped.', a: ['used'] },
        { t: 'order', q: 'Seřaď větu.', items: ['She', 'used', 'to', 'be', 'shy.'] },
        { t: 'pair', q: 'Spoj kdysi a dnes.', pairs: [['I used to walk.', 'Now I cycle.'], ['I used to hate carrots.', 'Now I love them.'], ['We used to write letters.', 'Now we send messages.']] },
        { t: 'tf', q: 'Po used to následuje holé sloveso (used to play).', a: true },
        { t: 'choice', q: 'Vyber správný zápor.', o: ['I didn’t use to like it.', 'I didn’t used to liked it.', 'I usedn’t like it.'], a: 0 },
        { t: 'input', q: 'Přelož: „Hrával jsem fotbal.“ (doplň) I ___ to play football.', a: ['used'] },
        { t: 'open', q: 'Co vyjadřuje „used to“?', a: 'Opakovaný děj nebo stav v minulosti, který už neplatí. Např. I used to live in a village.' },
        { t: 'open', q: 'Řekni anglicky dvě věci, které jsi dělal jako malé dítě a už neděláš.', a: 'Např. I used to sleep with a teddy bear. I used to watch cartoons every day.' },
      ],
    },
    {
      id: 'may-might',
      title: 'May, might – možnost',
      emoji: '🤔',
      ex: [
        {
          title: 'Teploměrem jistoty',
          blocks: [
            { t: 'p', text: 'Jak moc jsi si jistý, že zítra půjdeš na výlet?' },
            { t: 'w', w: 'bars', p: { unit: '% jistota', items: [
              { label: 'I will go.', value: 100 },
              { label: 'I may go.', value: 50 },
              { label: 'I might go.', value: 40 },
              { label: 'I won’t go.', value: 0 },
            ] } },
            { t: 'key', text: 'may / might = možná (nejsem si jistý).' },
          ],
        },
        {
          title: 'Pravidlem',
          blocks: [
            { t: 'list', items: [
              'may/might + **holé sloveso**: *It might rain.*',
              'Zápor: *may not, might not*: *She might not come.*',
              'Bez -s: *He may be late.* (ne „mays“)',
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Take a coat. It', after: 'be cold.', options: ['might', 'must'], a: 0 },
              { before: 'He may', after: 'late.', options: ['be', 'to be', 'is'], a: 0 },
              { before: 'I’m not sure. I', after: 'come.', options: ['may not', 'don’t may'], a: 0 },
            ] } },
            { t: 'key', text: 'Česky „možná přijdu“ = I might come.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Take an umbrella. It ___ rain.', o: ['might', 'must', 'mights'], a: 0 },
        { t: 'choice', q: 'She may ___ at home.', o: ['be', 'to be', 'is'], a: 0, why: 'may + holé sloveso.' },
        { t: 'tf', q: '„I might go“ znamená, že určitě půjdu.', a: false, why: 'might = možná.' },
        { t: 'tf', q: 'Zápor od „might“ je „might not“.', a: true },
        { t: 'input', q: 'Doplň: I’m not sure. I ___ go to the party. (možná)', a: ['might', 'may'] },
        { t: 'input', q: 'Doplň zápor: He ___ come – he’s ill. (možná nepřijde, 2 slova)', a: ['might not', 'may not', "mightn't"] },
        { t: 'order', q: 'Seřaď od nejjistějšího.', items: ['will', 'may', 'won’t'] },
        { t: 'pair', q: 'Spoj s významem.', pairs: [['It will rain.', 'Určitě bude pršet.'], ['It might rain.', 'Možná bude pršet.'], ['It won’t rain.', 'Nebude pršet.']] },
        { t: 'choice', q: 'Vyber správně.', o: ['He mays come.', 'He may comes.', 'He may come.'], a: 2 },
        { t: 'order', q: 'Seřaď větu.', items: ['We', 'might', 'go', 'to', 'the', 'cinema.'] },
        { t: 'open', q: 'Co vyjadřují slovesa may a might?', a: 'Možnost, nejistotu – že se něco možná stane. Např. It might snow tomorrow.' },
        { t: 'open', q: 'Řekni anglicky tři věci, které možná uděláš o prázdninách.', a: 'Např. I might go to the sea. I may visit my grandma. I might learn to surf.' },
      ],
    },
    {
      id: 'gerund-infinitive-uvod',
      title: 'Enjoy doing × want to do',
      emoji: '🎯',
      ex: [
        {
          title: 'Roztřiď slovesa',
          blocks: [
            { t: 'p', text: 'Některá slovesa chtějí za sebou **-ing**, jiná **to + sloveso**.' },
            { t: 'w', w: 'sort', p: { buckets: ['+ -ing', '+ to'], items: [
              { text: 'enjoy', b: 0 },
              { text: 'finish', b: 0 },
              { text: 'stop', b: 0 },
              { text: 'mind', b: 0 },
              { text: 'want', b: 1 },
              { text: 'decide', b: 1 },
              { text: 'hope', b: 1 },
              { text: 'plan', b: 1 },
            ] } },
            { t: 'key', text: 'enjoy/finish/stop/mind + -ing. want/decide/hope/plan + to.' },
          ],
        },
        {
          title: 'Příklady',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Baví mě číst.', back: 'I enjoy reading.' },
              { front: 'Chci číst.', back: 'I want to read.' },
              { front: 'Dočetl jsem.', back: 'I finished reading.' },
              { front: 'Rozhodl jsem se číst.', back: 'I decided to read.' },
            ] } },
            { t: 'p', text: 'Po **like, love, hate** jde obojí: *I like swimming. / I like to swim.*' },
            { t: 'p', text: 'Po předložce vždy **-ing**: *good at drawing*, *interested in reading*.' },
            { t: 'key', text: 'Sloveso po předložce = -ing.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I enjoy ___ football.', o: ['playing', 'to play', 'play'], a: 0 },
        { t: 'choice', q: 'She wants ___ a doctor.', o: ['to be', 'being', 'be'], a: 0 },
        { t: 'choice', q: 'Have you finished ___ your essay?', o: ['writing', 'to write', 'write'], a: 0 },
        { t: 'input', q: 'Doplň: We decided ___ (go) by train. (2 slova)', a: ['to go'] },
        { t: 'input', q: 'Doplň: Do you mind ___ (open) the window?', a: ['opening'] },
        { t: 'tf', q: 'Po „like“ lze použít -ing i to.', a: true },
        { t: 'tf', q: '„I’m good at to swim.“ je správně.', a: false, why: 'Po předložce -ing: good at swimming.' },
        { t: 'pair', q: 'Spoj sloveso se správným tvarem.', pairs: [['I hope', 'to see you.'], ['I enjoy', 'cooking.'], ['I plan', 'to travel.'], ['I stopped', 'eating sweets.']] },
        { t: 'order', q: 'Seřaď větu.', items: ['He', 'is', 'interested', 'in', 'learning', 'Spanish.'] },
        { t: 'choice', q: 'They hope ___ the match.', o: ['to win', 'winning', 'win'], a: 0 },
        { t: 'open', q: 'Která slovesa se pojí s -ing a která s to? Uveď po dvou.', a: 'S -ing: enjoy, finish (také stop, mind). S to: want, decide (také hope, plan).' },
        { t: 'open', q: 'Řekni anglicky, co tě baví dělat a co chceš dělat po škole.', a: 'Např. I enjoy playing the guitar. I want to study at a grammar school.' },
      ],
    },
  ],
} satisfies Subject
