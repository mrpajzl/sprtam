import type { Subject } from '../../types'

export default {
  grade: 's2',
  subject: 'anglictina',
  topics: [
    {
      id: 'conditionals-0-1-2',
      title: 'Podmínkové věty 0, 1, 2',
      emoji: '🔀',
      ex: [
        {
          title: 'Podle reality',
          blocks: [
            { t: 'list', items: [
              '**0** – vždy platí: *If you heat ice, it melts.*',
              '**1** – reálné v budoucnosti: *If it rains, I\'ll stay at home.*',
              '**2** – nereálné, smyšlené: *If I had a million, I\'d travel the world.*',
            ] },
            { t: 'w', w: 'sort', p: { buckets: ['0', '1', '2'], items: [
              { text: 'If you mix red and white, you get pink.', b: 0 },
              { text: 'If water reaches 100 °C, it boils.', b: 0 },
              { text: 'If you hurry, you\'ll catch the bus.', b: 1 },
              { text: 'If she calls, I\'ll tell her.', b: 1 },
              { text: 'If I were you, I\'d apologise.', b: 2 },
              { text: 'If dogs could talk, they\'d complain.', b: 2 },
            ] } },
            { t: 'key', text: 'Čím méně reálné, tím „víc do minulosti“ posuneš tvar.' },
          ],
        },
        {
          title: 'Vzorcem',
          blocks: [
            { t: 'table', head: ['Typ', 'if-věta', 'hlavní věta'], rows: [
              ['0', 'present simple', 'present simple'],
              ['1', 'present simple', 'will + infinitiv'],
              ['2', 'past simple', 'would + infinitiv'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'If I', after: 'time tomorrow, I\'ll help you.', options: ['have', 'will have', 'had'], a: 0 },
              { before: 'If I were taller, I', after: 'play basketball.', options: ['would', 'will', 'am'], a: 0 },
              { before: 'If I', after: 'you, I\'d accept the offer.', options: ['were', 'am', 'would be'], a: 0 },
              { before: 'You\'ll fail', after: 'you study.', options: ['unless', 'if', 'when'], a: 0 },
            ] } },
            { t: 'key', text: 'V *if*-větě nikdy *will* ani *would*. *Unless* = *if not*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'If you ___ water, it freezes at 0 °C.', o: ['cool', 'will cool', 'cooled'], a: 0, why: 'Obecná pravda → nultý kondicionál.' },
        { t: 'choice', q: 'If it ___ tomorrow, we\'ll cancel the trip.', o: ['rains', 'will rain', 'rained'], a: 0, why: 'V *if*-větě 1. kondicionálu present simple.' },
        { t: 'choice', q: 'If I ___ his number, I would call him.', o: ['knew', 'know', 'would know'], a: 0, why: 'Nereálná přítomnost → past simple.' },
        { t: 'choice', q: 'I won\'t go ___ you come with me.', o: ['unless', 'if', 'when'], a: 0, why: '*unless* = pokud ne.' },
        { t: 'input', q: 'Doplň: If I ___ (be) you, I\'d see a doctor.', a: ['were', 'was'], why: 'Ve formálním stylu *were* pro všechny osoby.' },
        { t: 'input', q: 'Doplň: If she studies hard, she ___ (pass). – dvě slova', a: ['will pass', "'ll pass"] },
        { t: 'input', q: 'Doplň: What ___ you do if you won the lottery?', a: ['would'] },
        { t: 'tf', q: '„If I will see him, I will tell him.“ je správně.', a: false, why: 'Správně: *If I see him, I\'ll tell him.*' },
        { t: 'tf', q: 'Druhý kondicionál mluví o situaci, která je nepravděpodobná nebo nereálná.', a: true },
        { t: 'pair', q: 'Spoj začátek s koncem.', pairs: [['If you press this button,', 'the machine starts.'], ['If you don\'t hurry,', 'you\'ll be late.'], ['If I lived by the sea,', 'I\'d swim every day.']] },
        { t: 'open', q: 'Jaký je rozdíl mezi „If I have time, I\'ll come“ a „If I had time, I\'d come“?', a: 'První věta (1. kondicionál) je reálná možnost – čas možná mít budu. Druhá (2. kondicionál) je nereálná – čas nemám, takže nepřijdu.' },
        { t: 'open', q: 'Co bys dělal/a, kdybys mohl/a změnit jednu věc ve škole? Odpověz anglicky.', a: 'Např.: *If I could change one thing, I would start lessons later, because students would be less tired.*' },
      ],
    },
    {
      id: 'wish-if-only',
      title: 'Wish a if only',
      emoji: '🌠',
      ex: [
        {
          title: 'Přání',
          blocks: [
            { t: 'p', text: 'Prší a nemáš deštník: *I wish I **had** an umbrella.* – lituješ přítomnosti.' },
            { t: 'p', text: 'Soused pořád hraje hudbu nahlas: *I wish he **would** turn it down!* – chceš, aby se někdo změnil.' },
            { t: 'p', text: 'Včera jsi to zkazil: *I wish I **had studied**.* – lituješ minulosti.' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: -1, label: 'minulost: I wish I had gone' },
              { year: 0, label: 'přítomnost: I wish I knew' },
              { year: 1, label: 'změna chování: I wish you would stop' },
            ] } },
            { t: 'key', text: 'Po *wish* posuneš čas o krok do minulosti.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Lituji…', 'Tvar', 'Příklad'], rows: [
              ['přítomnosti', 'wish + past simple', 'I wish I lived nearer.'],
              ['minulosti', 'wish + past perfect', 'I wish I hadn\'t said that.'],
              ['cizího chování', 'wish + would', 'I wish you would listen.'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'I can\'t swim.', back: 'I wish I could swim.' },
              { front: 'I\'m not rich.', back: 'I wish I were rich.' },
              { front: 'I missed the bus.', back: 'I wish I hadn\'t missed the bus.' },
              { front: 'He keeps interrupting.', back: 'I wish he wouldn\'t interrupt.' },
            ] } },
            { t: 'key', text: '*If only* = silnější *I wish*: *If only I had known!*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I wish I ___ French. (neumím)', o: ['spoke', 'speak', 'will speak'], a: 0, why: 'Přítomnost → past simple.' },
        { t: 'choice', q: 'I wish I ___ that cake. Now I feel sick.', o: ['hadn\'t eaten', 'didn\'t eat', 'wouldn\'t eat'], a: 0, why: 'Lítost nad minulostí → past perfect.' },
        { t: 'choice', q: 'I wish you ___ leaving your socks on the floor!', o: ['would stop', 'stopped', 'had stopped'], a: 0, why: 'Chování druhého → *would*.' },
        { t: 'choice', q: 'If only I ___ more time!', o: ['had', 'have', 'would have'], a: 0 },
        { t: 'input', q: 'Doplň: I wish I ___ (can) come to your party.', a: ['could'] },
        { t: 'input', q: 'Doplň: I wish I ___ (be) taller. – jedno slovo', a: ['were', 'was'] },
        { t: 'input', q: 'Doplň: She wishes she ___ (listen) to her mum. – dvě slova', a: ['had listened', "'d listened"] },
        { t: 'tf', q: '„I wish I would be older.“ je správně.', a: false, why: 'O sobě nepoužíváme *would*: *I wish I were older.*' },
        { t: 'tf', q: '„I wish it would stop raining.“ je správně.', a: true, why: 'Přání změny situace, kterou neovlivním.' },
        { t: 'pair', q: 'Spoj realitu s přáním.', pairs: [['I don\'t have a car.', 'I wish I had a car.'], ['I didn\'t go.', 'I wish I had gone.'], ['You never help.', 'I wish you would help.']] },
        { t: 'open', q: 'Jak vyjádříš lítost nad něčím, co se stalo včera?', a: '*I wish* nebo *If only* + past perfect: *I wish I hadn\'t shouted at her.*' },
        { t: 'open', q: 'Kdy se po wish použije would?', a: 'Když si přejeme, aby se změnilo chování někoho jiného nebo nějaká situace, často s podrážděním: *I wish you would be quiet.* O sobě samém *would* nepoužíváme.' },
      ],
    },
    {
      id: 'passive-all-tenses',
      title: 'Trpný rod ve všech časech',
      emoji: '🏗️',
      ex: [
        {
          title: 'Zprávou',
          blocks: [
            { t: 'p', text: 'Ve zprávách je důležitý děj, ne kdo ho udělal: *A new bridge **has been built**. The thief **was arrested** yesterday.*' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'The house', label: 'podmět' }, { text: 'is being', label: 'be v čase' }, { text: 'painted', label: '3. tvar' }] },
              { parts: [{ text: 'The letters', label: 'podmět' }, { text: 'had been', label: 'be v čase' }, { text: 'sent', label: '3. tvar' }] },
            ] } },
            { t: 'key', text: 'Pasivum = *be* v příslušném čase + 3. tvar. Původce s *by*.' },
          ],
        },
        {
          title: 'Tabulkou',
          blocks: [
            { t: 'table', head: ['Čas', 'Pasivum'], rows: [
              ['present simple', 'is made'],
              ['present continuous', 'is being made'],
              ['past simple', 'was made'],
              ['past continuous', 'was being made'],
              ['present perfect', 'has been made'],
              ['past perfect', 'had been made'],
              ['will / modální', 'will be made / must be made'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'English', after: 'all over the world.', options: ['is spoken', 'is speaking'], a: 0 },
              { before: 'The road', after: 'at the moment.', options: ['is being repaired', 'is repaired'], a: 0 },
              { before: 'The results', after: 'tomorrow.', options: ['will be announced', 'will announce'], a: 0 },
              { before: 'My bike', after: 'twice this year.', options: ['has been stolen', 'has stolen'], a: 0 },
            ] } },
            { t: 'key', text: 'Čas poznáš podle tvaru *be*, hlavní sloveso je vždy 3. tvar.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'The Harry Potter books ___ by J. K. Rowling.', o: ['were written', 'wrote', 'have written'], a: 0, why: 'Minulé pasivum: *was/were* + 3. tvar.' },
        { t: 'choice', q: 'Your room ___ right now.', o: ['is being cleaned', 'is cleaned', 'is cleaning'], a: 0, why: 'Probíhající děj → *is being* + 3. tvar.' },
        { t: 'choice', q: 'When we arrived, the food ___ already ___.', o: ['had … been eaten', 'has … been eaten', 'was … eating'], a: 0, why: 'Předminulost → *had been* + 3. tvar.' },
        { t: 'choice', q: 'This form must ___ in black ink.', o: ['be completed', 'completed', 'been completed'], a: 0, why: 'Modální + *be* + 3. tvar.' },
        { t: 'input', q: 'Převeď do pasiva (doplň dvě slova): They grow rice in China. → Rice ___ in China.', a: ['is grown'] },
        { t: 'input', q: 'Doplň: The Eiffel Tower ___ (build) in the 1880s. – dvě slova', a: ['was built'], why: 'Minulost, jednotné číslo → *was built*.' },
        { t: 'input', q: 'Doplň: The winner will ___ (announce) at 8. – dvě slova', a: ['be announced'] },
        { t: 'tf', q: '„The window was broke by the ball.“ je správně.', a: false, why: '3. tvar je *broken*.' },
        { t: 'tf', q: 'V pasivu se původce děje uvádí předložkou *by*.', a: true },
        { t: 'pair', q: 'Spoj čas s pasivním tvarem.', pairs: [['present perfect', 'has been done'], ['past continuous', 'was being done'], ['future', 'will be done'], ['past perfect', 'had been done']] },
        { t: 'open', q: 'Kdy se v angličtině používá trpný rod?', a: 'Když je důležitější děj nebo výsledek než ten, kdo ho vykonal, nebo když původce neznáme. Častý je ve zprávách, odborných textech a popisech postupů.' },
        { t: 'open', q: 'Jak se tvoří pasivum? Uveď příklad v present perfect.', a: 'Tvar slovesa *be* v potřebném čase + 3. tvar (příčestí minulé) významového slovesa. *The museum has been renovated.*' },
      ],
    },
    {
      id: 'relative-clauses',
      title: 'Vztažné věty',
      emoji: '🔗',
      ex: [
        {
          title: 'Bez čárek a s čárkami',
          blocks: [
            { t: 'p', text: '*The girl **who lives next door** is a singer.* – bez vedlejší věty nevíme, která dívka → **určující**, bez čárek.' },
            { t: 'p', text: '*My sister, **who lives in Brno**, is a singer.* – mám jen jednu sestru, věta jen přidává info → **neurčující**, s čárkami.' },
            { t: 'w', w: 'sort', p: { buckets: ['určující (bez čárek)', 'neurčující (s čárkami)'], items: [
              { text: 'The man who called you is here.', b: 0 },
              { text: 'I lost the book that you gave me.', b: 0 },
              { text: 'Students who cheat will fail.', b: 0 },
              { text: 'Prague, which is my home, is beautiful.', b: 1 },
              { text: 'My dad, who is 50, runs marathons.', b: 1 },
              { text: 'Mr Novák, whose son I know, is a vet.', b: 1 },
            ] } },
            { t: 'key', text: 'V neurčující větě nikdy *that* a zájmeno nelze vynechat.' },
          ],
        },
        {
          title: 'Zájmena',
          blocks: [
            { t: 'table', head: ['Zájmeno', 'Pro'], rows: [
              ['who', 'osoby'],
              ['which', 'věci, zvířata'],
              ['that', 'osoby i věci (jen v určujících)'],
              ['whose', 'přivlastnění (jehož, jejíž)'],
              ['where / when', 'místo / čas'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'That\'s the woman', after: 'car was stolen.', options: ['whose', 'who', 'which'], a: 0 },
              { before: 'This is the hotel', after: 'we stayed.', options: ['where', 'which', 'when'], a: 0 },
              { before: 'Our teacher,', after: 'is very strict, gave us a test.', options: ['who', 'that', 'whose'], a: 0 },
              { before: 'The film', after: 'we saw was boring.', options: ['that', 'who', 'where'], a: 0 },
            ] } },
            { t: 'key', text: 'Je-li zájmeno předmětem v určující větě, smíš ho vynechat: *The film (that) we saw…*' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'The man ___ fixed my car was very friendly.', o: ['who', 'which', 'whose'], a: 0 },
        { t: 'choice', q: 'Is this the phone ___ you bought yesterday?', o: ['that', 'who', 'where'], a: 0 },
        { t: 'choice', q: 'I met a girl ___ father is a pilot.', o: ['whose', 'who\'s', 'which'], a: 0, why: 'Přivlastnění → *whose*.' },
        { t: 'choice', q: 'Která věta je správně?', o: ['London, which is the capital, is huge.', 'London, that is the capital, is huge.', 'London which is the capital is huge.'], a: 0, why: 'Neurčující věta: čárky a *which*, ne *that*.' },
        { t: 'input', q: 'Doplň: 2004 was the year ___ the Czech Republic joined the EU.', a: ['when', 'that', 'in which'] },
        { t: 'input', q: 'Doplň: That\'s the café ___ we first met.', a: ['where'] },
        { t: 'tf', q: 'Ve větě „The book (which) I\'m reading is great.“ lze *which* vynechat.', a: true, why: 'Zájmeno je předmět a věta je určující.' },
        { t: 'tf', q: 'Ve větě „The boy who won the race is my cousin.“ lze *who* vynechat.', a: false, why: '*who* je tu podmět vedlejší věty → nelze vynechat.' },
        { t: 'tf', q: '„My mother, that is a nurse, works nights.“ je správně.', a: false, why: 'V neurčující větě nelze *that* → *who*.' },
        { t: 'pair', q: 'Spoj zájmeno s použitím.', pairs: [['who', 'osoby'], ['which', 'věci'], ['whose', 'přivlastnění'], ['where', 'místo']] },
        { t: 'open', q: 'Jaký je rozdíl mezi určující a neurčující vztažnou větou?', a: 'Určující věta říká, o koho nebo o co jde, a nepíše se v čárkách. Neurčující přidává doplňující informaci, je oddělena čárkami a nesmí v ní být *that*.' },
        { t: 'open', q: 'Kdy lze vztažné zájmeno vynechat? Uveď příklad.', a: 'V určující vztažné větě, když je zájmeno předmětem: *The girl (who) I met was French.* Je-li podmětem, vynechat ho nelze.' },
      ],
    },
    {
      id: 'gerund-infinitive',
      title: 'Gerundium a infinitiv',
      emoji: '🧩',
      ex: [
        {
          title: 'Skupiny sloves',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['+ -ing', '+ to + inf.'], items: [
              { text: 'enjoy', b: 0 }, { text: 'avoid', b: 0 }, { text: 'mind', b: 0 }, { text: 'suggest', b: 0 }, { text: 'finish', b: 0 },
              { text: 'decide', b: 1 }, { text: 'hope', b: 1 }, { text: 'refuse', b: 1 }, { text: 'promise', b: 1 }, { text: 'afford', b: 1 },
            ] } },
            { t: 'list', items: [
              'po předložce vždy -ing: *interested **in learning***',
              'po *make, let* infinitiv bez *to*: *She made me **cry**.*',
            ] },
            { t: 'key', text: 'Vazby se učíš s každým slovesem zvlášť. Po předložce vždy -ing.' },
          ],
        },
        {
          title: 'Změna významu',
          blocks: [
            { t: 'table', head: ['Sloveso', '+ -ing', '+ to'], rows: [
              ['stop', 'přestat (*stop smoking*)', 'zastavit se, abych (*stop to smoke*)'],
              ['remember', 'pamatovat si, že jsem (*remember locking*)', 'nezapomenout (*remember to lock*)'],
              ['forget', 'zapomenout, že jsem (*never forget meeting*)', 'zapomenout udělat (*forget to call*)'],
              ['try', 'zkusit jako pokus (*try adding salt*)', 'snažit se (*try to lift*)'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I stopped', after: 'a coffee on the way.', options: ['to buy', 'buying'], a: 0 },
              { before: 'He finally stopped', after: 'sweets.', options: ['eating', 'to eat'], a: 0 },
              { before: 'Remember', after: 'the door!', options: ['to lock', 'locking'], a: 0 },
              { before: 'I remember', after: 'Grandma as a child.', options: ['visiting', 'to visit'], a: 0 },
            ] } },
            { t: 'key', text: '*to* míří dopředu (úkol, účel), *-ing* míří k ději, který už je nebo byl.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I enjoy ___ in the rain.', o: ['walking', 'to walk', 'walk'], a: 0 },
        { t: 'choice', q: 'They decided ___ a new car.', o: ['to buy', 'buying', 'buy'], a: 0 },
        { t: 'choice', q: 'She is good at ___ problems.', o: ['solving', 'to solve', 'solve'], a: 0, why: 'Po předložce *at* → -ing.' },
        { t: 'choice', q: 'My parents let me ___ late on Fridays.', o: ['stay', 'to stay', 'staying'], a: 0, why: '*let* + infinitiv bez *to*.' },
        { t: 'input', q: 'Doplň tvar slovesa smoke: My grandfather stopped ___ ten years ago (už nekouří).', a: ['smoking'] },
        { t: 'input', q: 'Doplň tvar slovesa call: Don\'t forget ___ me tonight. – dvě slova', a: ['to call'] },
        { t: 'input', q: 'Doplň tvar slovesa wait: Would you mind ___ a moment?', a: ['waiting'] },
        { t: 'tf', q: '„I look forward to see you.“ je správně.', a: false, why: '*to* je zde předložka → *look forward to seeing*.' },
        { t: 'tf', q: '„I can\'t afford to go on holiday.“ je správně.', a: true },
        { t: 'pair', q: 'Spoj větu s významem.', pairs: [['I stopped talking.', 'Přestal jsem mluvit.'], ['I stopped to talk.', 'Zastavil jsem se, abych mluvil.'], ['I tried opening the window.', 'Zkusil jsem otevřít okno (jako řešení).']] },
        { t: 'open', q: 'Vysvětli rozdíl mezi „I remember posting the letter“ a „Remember to post the letter“.', a: 'První: vzpomínám si, že jsem dopis odeslal (děj už proběhl). Druhá: nezapomeň dopis odeslat (úkol do budoucna).' },
        { t: 'open', q: 'Kdy se po slovese používá vždy tvar -ing? Uveď příklady.', a: 'Po předložkách (*interested in, good at, before, without*) a po slovesech jako *enjoy, avoid, mind, finish, suggest*: *I avoid eating late.*' },
      ],
    },
    {
      id: 'used-to-be-used-to',
      title: 'Used to, be used to, would',
      emoji: '🕰️',
      ex: [
        {
          title: 'Příběhem',
          blocks: [
            { t: 'p', text: 'Jana se přestěhovala do Londýna. *She **used to live** in a village.* (dřív ano, teď ne)' },
            { t: 'p', text: 'Zpočátku: *She **wasn\'t used to** the traffic.* Postupně: *She **got used to** it.* Teď: *She **is used to** it.*' },
            { t: 'w', w: 'timeline', p: { events: [
              { year: 2018, label: 'used to live in a village' },
              { year: 2022, label: 'got used to the noise' },
              { year: 2026, label: 'is used to London' },
            ] } },
            { t: 'key', text: '*used to* + infinitiv = dřívější zvyk. *be used to* + -ing = jsem zvyklý.' },
          ],
        },
        {
          title: 'Vzorci',
          blocks: [
            { t: 'table', head: ['Tvar', 'Význam', 'Příklad'], rows: [
              ['used to + inf.', 'dřív (už ne)', 'I used to play chess.'],
              ['would + inf.', 'dřívější opakovaný děj', 'We would go fishing.'],
              ['be used to + -ing', 'být zvyklý', 'I\'m used to getting up early.'],
              ['get used to + -ing', 'zvykat si', 'You\'ll get used to it.'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'I', after: 'have long hair, but I cut it.', options: ['used to', 'am used to'], a: 0 },
              { before: 'I\'m used to', after: 'on the left.', options: ['driving', 'drive'], a: 0 },
              { before: 'Did you', after: 'to like school?', options: ['use', 'used'], a: 0 },
              { before: 'We', after: 'have a dog when I was little.', options: ['used to', 'would'], a: 0 },
            ] } },
            { t: 'key', text: '*would* jen pro opakované děje, ne pro stavy: *I used to have a dog*, ne *I would have a dog*.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'I ___ like vegetables, but now I love them.', o: ['didn\'t use to', 'wasn\'t used to', 'am not used to'], a: 0, why: 'Dřívější stav, který už neplatí.' },
        { t: 'choice', q: 'Nurses are used to ___ at night.', o: ['working', 'work', 'worked'], a: 0, why: '*be used to* + -ing.' },
        { t: 'choice', q: 'It took me months to get used to ___ in English.', o: ['thinking', 'think', 'thought'], a: 0 },
        { t: 'choice', q: 'Která věta je chybně?', o: ['As a child, I would have a cat.', 'As a child, I used to have a cat.', 'As a child, I would go camping every summer.'], a: 0, why: '*have* (vlastnit) je stav → jen *used to*.' },
        { t: 'input', q: 'Doplň: ___ you use to play football? – jedno slovo', a: ['did'] },
        { t: 'input', q: 'Doplň tvar slovesa share: I\'m not used to ___ a room.', a: ['sharing'] },
        { t: 'tf', q: '„She used to be shy“ znamená, že je pořád stydlivá.', a: false, why: '*used to* = dříve, teď už ne.' },
        { t: 'tf', q: '„When I was a kid, I would spend hours reading.“ je správně.', a: true, why: 'Opakovaný děj v minulosti → *would* je možné.' },
        { t: 'pair', q: 'Spoj s významem.', pairs: [['used to do', 'dřív dělal'], ['be used to doing', 'být zvyklý'], ['get used to doing', 'zvykat si']] },
        { t: 'order', q: 'Seřaď do věty.', items: ['I', 'can\'t get', 'used to', 'the cold weather.'] },
        { t: 'open', q: 'Vysvětli rozdíl mezi „I used to get up early“ a „I\'m used to getting up early“.', a: 'První: dřív jsem vstával brzy, teď už ne. Druhá: brzké vstávání mi nevadí, jsem na něj zvyklý.' },
        { t: 'open', q: 'Popiš anglicky dvě věci, které jsi dělal/a jako malé dítě a už neděláš.', a: 'Např.: *I used to watch cartoons every morning. I didn\'t use to like reading, but now I do.*' },
      ],
    },
    {
      id: 'reported-speech-statements',
      title: 'Nepřímá řeč',
      emoji: '🗣️',
      ex: [
        {
          title: 'Posun časů',
          blocks: [
            { t: 'p', text: 'Tom včera řekl: *„I am tired.“* Dnes to převyprávíš: *Tom said (that) he **was** tired.*' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '„I live in Prague.“', back: 'She said she lived in Prague.' },
              { front: '„I\'m working.“', back: 'He said he was working.' },
              { front: '„I have finished.“', back: 'She said she had finished.' },
              { front: '„I saw it.“', back: 'He said he had seen it.' },
              { front: '„I will help.“', back: 'She said she would help.' },
              { front: '„I can swim.“', back: 'He said he could swim.' },
            ] } },
            { t: 'key', text: 'Po *said* posuň čas o krok zpět.' },
          ],
        },
        {
          title: 'Pravidla',
          blocks: [
            { t: 'table', head: ['Přímá řeč', 'Nepřímá řeč'], rows: [
              ['now, today', 'then, that day'],
              ['yesterday', 'the day before'],
              ['tomorrow', 'the next day'],
              ['here, this', 'there, that'],
              ['ago', 'before'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'She', after: 'me she was busy.', options: ['told', 'said'], a: 0 },
              { before: 'He', after: 'that he was hungry.', options: ['said', 'told'], a: 0 },
              { before: 'They told', after: 'they would come.', options: ['us', 'to us'], a: 0 },
            ] } },
            { t: 'key', text: '*tell* + komu (*told me*), *say* bez osoby (*said that*, *said to me*).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: '„I like pizza,“ she said. → She said she ___ pizza.', o: ['liked', 'likes', 'had liked'], a: 0 },
        { t: 'choice', q: '„We are leaving,“ they said. → They said they ___.', o: ['were leaving', 'are leaving', 'had left'], a: 0 },
        { t: 'choice', q: '„I lost my keys,“ he said. → He said he ___ his keys.', o: ['had lost', 'has lost', 'lose'], a: 0, why: 'Past simple → past perfect.' },
        { t: 'choice', q: 'She ___ me that she was sorry.', o: ['told', 'said', 'spoke'], a: 0, why: '*tell* + osoba.' },
        { t: 'input', q: '„I will call you.“ → He said he ___ call me.', a: ['would'] },
        { t: 'input', q: '„I can\'t come.“ → She said she ___ come.', a: ["couldn't", 'could not'] },
        { t: 'input', q: '„I\'ll do it tomorrow.“ → He said he would do it the ___ day.', a: ['next', 'following'] },
        { t: 'tf', q: '„He said me that he was ill.“ je správně.', a: false, why: 'Správně *He told me* nebo *He said (to me)*.' },
        { t: 'tf', q: 'Pokud tvrzení stále platí, posun času není povinný: *She said she lives in Brno.*', a: true },
        { t: 'pair', q: 'Spoj přímou a nepřímou řeč.', pairs: [['am', 'was'], ['have done', 'had done'], ['will', 'would'], ['can', 'could']] },
        { t: 'open', q: 'Co se děje s časy při převodu do nepřímé řeči po „said“?', a: 'Časy se posouvají o krok do minulosti: present → past, past simple a present perfect → past perfect, *will* → *would*, *can* → *could*.' },
        { t: 'open', q: 'Jaký je rozdíl mezi say a tell?', a: 'Po *tell* musí následovat osoba, které něco říkáme (*She told me…*). *Say* se používá bez osoby, nebo s *to* (*She said (to me) that…*).' },
      ],
    },
    {
      id: 'question-tags',
      title: 'Tázací dovětky',
      emoji: '🏷️',
      ex: [
        {
          title: 'Zrcadlem',
          blocks: [
            { t: 'p', text: 'Dovětek = česky „že?“, „viď?“. Kladná věta → záporný dovětek a naopak.' },
            { t: 'w', w: 'parts', p: { words: [
              { parts: [{ text: 'You are tired,', label: 'kladná věta' }, { text: 'aren\'t you?', label: 'záporný dovětek' }] },
              { parts: [{ text: 'She doesn\'t smoke,', label: 'záporná věta' }, { text: 'does she?', label: 'kladný dovětek' }] },
              { parts: [{ text: 'They went home,', label: 'kladná věta' }, { text: 'didn\'t they?', label: 'záporný dovětek' }] },
            ] } },
            { t: 'key', text: 'Pomocné sloveso z věty + zájmeno. Není-li pomocné, použij *do/does/did*.' },
          ],
        },
        {
          title: 'Výjimky',
          blocks: [
            { t: 'table', head: ['Věta', 'Dovětek'], rows: [
              ['I\'m right,', 'aren\'t I?'],
              ['Let\'s go,', 'shall we?'],
              ['Open the door,', 'will you?'],
              ['Nobody called,', 'did they?'],
              ['She never lies,', 'does she?'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'He can swim,', after: '?', options: ['can\'t he', 'doesn\'t he'], a: 0 },
              { before: 'You\'ve met Jo,', after: '?', options: ['haven\'t you', 'didn\'t you'], a: 0 },
              { before: 'It won\'t rain,', after: '?', options: ['will it', 'won\'t it'], a: 0 },
              { before: 'Let\'s have a break,', after: '?', options: ['shall we', 'don\'t we'], a: 0 },
            ] } },
            { t: 'key', text: '*never, nobody, nothing* dělají větu zápornou → dovětek kladný.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'You like coffee, ___?', o: ['don\'t you', 'aren\'t you', 'do you'], a: 0 },
        { t: 'choice', q: 'She isn\'t coming, ___?', o: ['is she', 'isn\'t she', 'does she'], a: 0 },
        { t: 'choice', q: 'I\'m late, ___?', o: ['aren\'t I', 'am not I', 'isn\'t I'], a: 0, why: 'Výjimka: *I am → aren\'t I*.' },
        { t: 'choice', q: 'Nobody saw us, ___?', o: ['did they', 'didn\'t they', 'did nobody'], a: 0, why: '*Nobody* = záporná věta, zájmeno *they*.' },
        { t: 'input', q: 'Doplň: They\'ve finished, ___ they?', a: ["haven't"] },
        { t: 'input', q: 'Doplň: Tom broke it, ___ he?', a: ["didn't"] },
        { t: 'input', q: 'Doplň: Let\'s dance, ___ we?', a: ['shall'] },
        { t: 'tf', q: '„He never helps, doesn\'t he?“ je správně.', a: false, why: '*never* → kladný dovětek: *does he?*' },
        { t: 'tf', q: '„You can drive, can\'t you?“ je správně.', a: true },
        { t: 'pair', q: 'Spoj větu s dovětkem.', pairs: [['It\'s cold,', 'isn\'t it?'], ['You weren\'t there,', 'were you?'], ['She will help,', 'won\'t she?'], ['We should go,', 'shouldn\'t we?']] },
        { t: 'open', q: 'Jak se tvoří tázací dovětky?', a: 'Vezmeme pomocné nebo modální sloveso z věty (případně *do/does/did*) a osobní zájmeno. Po kladné větě je dovětek záporný, po záporné kladný: *You are new, aren\'t you?*' },
        { t: 'open', q: 'K čemu se dovětky v angličtině používají?', a: 'K ověření informace nebo k získání souhlasu, podobně jako česky „že?“. Klesající intonace znamená, že jsme si jistí, stoupající, že se skutečně ptáme.' },
      ],
    },
  ],
} satisfies Subject
