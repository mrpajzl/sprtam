import type { Subject } from '../../types'

export default {
  grade: 'z5',
  subject: 'cestina',
  topics: [
    {
      id: 'stavba-slova-z5',
      title: 'Stavba slova',
      emoji: '🧩',
      ex: [
        {
          title: 'Barvy',
          blocks: [
            {
              t: 'w',
              w: 'parts',
              p: {
                words: [
                  { parts: [{ text: 'pod', label: 'předpona' }, { text: 'zem', label: 'kořen' }, { text: 'n', label: 'přípona' }, { text: 'í', label: 'koncovka' }] },
                  { parts: [{ text: 'ryb', label: 'kořen' }, { text: 'ník', label: 'přípona' }, { text: 'y', label: 'koncovka' }] },
                  { parts: [{ text: 'do', label: 'předpona' }, { text: 'pis', label: 'kořen' }, { text: 'y', label: 'koncovka' }] },
                ],
              },
            },
            { t: 'list', items: ['**kořen** – společný pro příbuzná slova', '**předpona** – před kořenem', '**přípona** – za kořenem, tvoří nové slovo', '**koncovka** – mění se při skloňování a časování'] },
            { t: 'key', text: 'Předpona + kořen + přípona + koncovka.' },
          ],
        },
        {
          title: 'Postup',
          blocks: [
            { t: 'steps', items: ['Najdi koncovku: změň tvar slova (*lesní – lesního*). Co se mění = **koncovka**.', 'Najdi příbuzná slova (*les, lesník*). Společná část = **kořen**.', 'Před kořenem = **předpona**.', 'Mezi kořenem a koncovkou = **přípona**.'] },
            { t: 'example', q: 'Rozděl: vyletět', a: 'vy (předpona) – let (kořen) – ě (přípona) – t (koncovka infinitivu)' },
            { t: 'key', text: 'Koncovku najdeš, když slovo skloňuješ.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký je kořen slova „podzemní“?', o: ['pod', 'zem', 'zemn'], a: 1 },
        { t: 'choice', q: 'Jaká je předpona slova „rozbít“?', o: ['ro', 'roz', 'rozb'], a: 1 },
        { t: 'choice', q: 'Která část slova se mění při skloňování?', o: ['kořen', 'předpona', 'koncovka'], a: 2 },
        { t: 'input', q: 'Napiš kořen slov: ryba, rybník, rybář.', a: ['ryb'] },
        { t: 'input', q: 'Napiš předponu slova „přeskočit“.', a: ['pře'] },
        { t: 'input', q: 'Napiš koncovku slova „hrady“.', a: ['y'] },
        { t: 'tf', q: 'Přípona stojí za kořenem.', a: true },
        { t: 'tf', q: 'Slova „voda“ a „vodit“ mají stejný kořen.', a: false, why: 'Významy spolu nesouvisejí – nejsou příbuzná.' },
        { t: 'order', q: 'Seřaď části slova „podzemní“.', items: ['pod', 'zem', 'n', 'í'] },
        { t: 'pair', q: 'Spoj část slova s příkladem ve slově „nádražní“.', pairs: [['předpona', 'ná'], ['kořen', 'draž'], ['přípona', 'n'], ['koncovka', 'í']] },
        { t: 'choice', q: 'Které slovo má předponu i příponu?', o: ['podzemní', 'zem', 'zemí'], a: 0 },
        { t: 'open', q: 'Jaké jsou části slova? Ukaž je na slově „podzemní“.', a: 'Předpona pod, kořen zem, přípona n, koncovka í.' },
        { t: 'open', q: 'Jak najdeš koncovku?', a: 'Slovo vyskloňuju nebo vyčasuju. Část na konci, která se mění, je koncovka.' },
      ],
    },
    {
      id: 'be-bje-ve-vje-me-mne',
      title: 'Bě/bje, vě/vje, mě/mně',
      emoji: '🧭',
      ex: [
        {
          title: 'Šev mezi díly',
          blocks: [
            { t: 'p', text: '**bje, vje** píšeme jen na **švu** předpony a kořene.' },
            {
              t: 'w',
              w: 'parts',
              p: {
                words: [
                  { parts: [{ text: 'ob', label: 'předpona' }, { text: 'jet', label: 'kořen + konec' }] },
                  { parts: [{ text: 'v', label: 'předpona' }, { text: 'jezd', label: 'kořen' }] },
                  { parts: [{ text: 'ob', label: 'předpona' }, { text: 'běh', label: 'kořen' }, { text: 'nout', label: 'příponová část' }] },
                ],
              },
            },
            { t: 'p', text: 'Předpona **ob-** nebo **v-** + kořen na **je-** → bje, vje: *objet, objem, vjet, vjezd*.' },
            { t: 'p', text: 'Jinak bě, vě: *oběhnout, běhat, věc, květ*.' },
            { t: 'key', text: 'ob + jet = objet. v + jet = vjet.' },
          ],
        },
        {
          title: 'Mě, nebo mně?',
          blocks: [
            { t: 'table', head: ['píšu', 'kdy', 'příklad'], rows: [['mě', 'běžně', 'město, měsíc, změna'], ['mně', 'v kořeni je mn', 'zapomněl (zapomenout), jemně (jemný)'], ['mě', 'zájmeno 2. a 4. pád', 'bez mě, vidíš mě'], ['mně', 'zájmeno 3. a 6. pád', 'dej mně, o mně']] },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'Na ná', after: 'stí je kašna.', options: ['mě', 'mně'], a: 0 },
                  { before: 'Zapo', after: 'l jsem klíče.', options: ['mě', 'mně'], a: 1 },
                  { before: 'Auto ', after: 'elo do garáže.', options: ['vje', 'vě'], a: 0 },
                  { before: 'Musím o', after: 'hnout hřiště.', options: ['bje', 'bě'], a: 1 },
                  { before: 'Pojď ke ', after: '.', options: ['mě', 'mně'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Komu? O kom? → mně. Koho? Koho, co? → mě.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['objet', 'obět'], a: 0, why: 'ob + jet = objet.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['vjezd', 'vězd'], a: 0, why: 'v + jezd = vjezd.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['objehnout', 'oběhnout'], a: 1, why: 'ob + běhnout – kořen začíná na b, ne na je.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['zapomněl', 'zapoměl'], a: 0, why: 'Zapomenout – v kořeni je mn.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['mněsto', 'město'], a: 1 },
        { t: 'choice', q: 'Doplň: „Pojď ke …“', o: ['mě', 'mně'], a: 1, why: 'Ke komu? 3. pád → mně.' },
        { t: 'choice', q: 'Doplň: „Nikdo … neviděl.“', o: ['mě', 'mně'], a: 0, why: 'Koho neviděl? 4. pád → mě.' },
        { t: 'tf', q: '„Objevit“ píšeme s bje, protože je tam předpona ob-.', a: true },
        { t: 'tf', q: 'Ve slově „věda“ píšeme vje.', a: false, why: 'Není tam předpona v- + kořen je-. Píšeme vě.' },
        { t: 'pair', q: 'Spoj pád zájmena já s tvarem.', pairs: [['2. pád (bez …)', 'mě'], ['3. pád (k …)', 'mně'], ['4. pád (vidím …)', 'mě'], ['6. pád (o …)', 'mně']] },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['jemně', 'jemě'], a: 0, why: 'Jemný – je tam mn.' },
        { t: 'open', q: 'Kdy píšeme bje a vje?', a: 'Na švu předpony ob- nebo v- a kořene, který začíná na je-. Například objet, objem, vjet, vjezd.' },
        { t: 'open', q: 'Jak poznáš, jestli napsat zájmeno mě, nebo mně?', a: 'Nahradím ho tvarem tebe/tobě. Tebe → mě (2. a 4. pád), tobě → mně (3. a 6. pád).' },
      ],
    },
    {
      id: 'predpony-s-z-vz',
      title: 'Předpony s-, z-, vz-',
      emoji: '🪂',
      ex: [
        {
          title: 'Šipky',
          blocks: [
            { t: 'table', head: ['předpona', 'význam', 'příklad'], rows: [['s-, se-', '⬇️ dolů z povrchu', 'seskočit, sjet, slézt'], ['s-, se-', '🤝 dohromady', 'sešít, slepit, sejít se'], ['s-, se-', '🧽 pryč z povrchu', 'smazat, setřít'], ['z-, ze-', '🔄 změna (stát se jiným)', 'zčervenat, zmrznout, zlepšit'], ['vz-, vze-', '⬆️ vzhůru', 'vzlétnout, vztyčit']] },
            { t: 'key', text: 'Dolů / dohromady / pryč → s. Změna → z. Nahoru → vz.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['s-', 'z-', 'vz-'],
                items: [
                  { text: 'sjet z kopce', b: 0 },
                  { text: 'zčervenat', b: 1 },
                  { text: 'vzlétnout', b: 2 },
                  { text: 'slepit', b: 0 },
                  { text: 'zmrznout', b: 1 },
                  { text: 'vztyčit', b: 2 },
                  { text: 'smazat tabuli', b: 0 },
                  { text: 'zhubnout', b: 1 },
                ],
              },
            },
            { t: 'example', q: 'Proč „seskočit“ s s?', a: 'Skáču dolů z povrchu (ze stolu).' },
            { t: 'key', text: 'Zeptej se, co předpona znamená.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Lyžař …el z kopce.', o: ['sj', 'zj'], a: 0, why: 'Směr dolů → s.' },
        { t: 'choice', q: 'Voda v louži …mrzla.', o: ['s', 'z'], a: 1, why: 'Změna stavu (voda → led) → z.' },
        { t: 'choice', q: 'Orel …létl k nebi.', o: ['vz', 'z'], a: 0, why: 'Vzhůru → vz.' },
        { t: 'choice', q: 'Kamarádi se …ešli na hřišti.', o: ['s', 'z'], a: 0, why: 'Dohromady → s.' },
        { t: 'input', q: 'Doplň s/z: _mrznout', a: ['z'] },
        { t: 'input', q: 'Doplň s/z: _lepit papíry', a: ['s'] },
        { t: 'input', q: 'Doplň předponu: _tyčit vlajku (nahoru)', a: ['vz'] },
        { t: 'tf', q: '„Smazat tabuli“ píšeme se s, protože něco odstraňujeme z povrchu.', a: true },
        { t: 'tf', q: '„Zčervenat“ píšeme se s.', a: false, why: 'Je to změna stavu → z.' },
        { t: 'pair', q: 'Spoj předponu s významem.', pairs: [['s- (seskočit)', 'dolů'], ['s- (sešít)', 'dohromady'], ['z- (zbělat)', 'změna'], ['vz- (vzlétnout)', 'nahoru']] },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['sbírat známky', 'zbírat známky'], a: 0, why: 'Sbírat = dávat dohromady → s.' },
        { t: 'open', q: 'Co znamenají předpony s-, z- a vz-?', a: 'S- znamená směr dolů, dohromady nebo pryč z povrchu. Z- znamená změnu stavu. Vz- znamená směr vzhůru.' },
        { t: 'open', q: 'Řekni ke každé předponě jedno sloveso.', a: 'Například seskočit (s-), zbělat (z-), vzlétnout (vz-).' },
      ],
    },
    {
      id: 'koncovky-podstatnych-jmen',
      title: 'Koncovky podstatných jmen',
      emoji: '🎯',
      ex: [
        {
          title: 'Tvrdý a měkký vzor',
          blocks: [
            { t: 'p', text: 'I/y v koncovce poznáš podle **vzoru**.' },
            { t: 'table', head: ['vzory', 'koncovka', 'příklad'], rows: [['tvrdé: hrad, žena, město', 'y', 's hrady, ženy, s městy'], ['pán', 'y, ale 1. pád mn. č. **i**', 's pány – **páni**'], ['měkké: muž, stroj, růže…', 'i', 's muži, se stroji, s růžemi']] },
            { t: 'key', text: 'Tvrdý vzor → y. Měkký vzor → i. Páni, kluci, psi → i.' },
          ],
        },
        {
          title: 'Doplň',
          blocks: [
            { t: 'steps', items: ['Urči rod a **vzor**.', 'Je vzor tvrdý, nebo měkký?', 'U vzoru pán: je to 1. pád množného čísla? → i.'] },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'Na drátě sedí kos', after: '.', options: ['i', 'y'], a: 0 },
                  { before: 'Šel jsem s kamarád', after: '.', options: ['i', 'y'], a: 1 },
                  { before: 'Mezi strom', after: ' teče potok.', options: ['i', 'y'], a: 1 },
                  { before: 'Hrajeme si s míč', after: '.', options: ['i', 'y'], a: 0 },
                  { before: 'Kluc', after: ' běží domů.', options: ['i', 'y'], a: 0 },
                  { before: 'V rybníce plavou ryb', after: '.', options: ['i', 'y'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Nejdřív vzor, pak písmeno.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Doplň i/y: Na zahradě běhají ps_. (1. pád mn. č.)', a: ['i'] },
        { t: 'input', q: 'Doplň i/y: s holub_ (7. pád mn. č., vzor pán)', a: ['y'] },
        { t: 'input', q: 'Doplň i/y: pod strom_ (7. pád mn. č.)', a: ['y'] },
        { t: 'input', q: 'Doplň i/y: s učitel_ (7. pád mn. č.)', a: ['i'], why: 'Učitel → vzor muž (měkký) → s učiteli.' },
        { t: 'choice', q: 'Které je správně?', o: ['Páni odešli.', 'Pány odešli.'], a: 0, why: '1. pád mn. č. vzoru pán → i.' },
        { t: 'choice', q: 'Které je správně?', o: ['Vidím kluky.', 'Vidím kluki.'], a: 0, why: '4. pád mn. č. vzoru pán → y.' },
        { t: 'choice', q: 'Které je správně?', o: ['se stroji', 'se strojy'], a: 0, why: 'Stroj je měkký vzor → i.' },
        { t: 'choice', q: 'Které je správně?', o: ['bez ženi', 'bez ženy'], a: 1, why: 'Žena je tvrdý vzor → y.' },
        { t: 'tf', q: 'Po tvrdých vzorech píšeme v koncovkách y.', a: true },
        { t: 'tf', q: '„S nožy“ je správně.', a: false, why: 'Nůž → vzor stroj (měkký) → s noži.' },
        { t: 'pair', q: 'Spoj tvar se vzorem.', pairs: [['kluci', 'pán'], ['s lesy', 'hrad'], ['s koláči', 'stroj'], ['s lékaři', 'muž']] },
        { t: 'open', q: 'Kdy píšeme v koncovce podstatného jména y a kdy i?', a: 'Po tvrdých vzorech (pán, hrad, žena, město) píšeme y, po měkkých (muž, stroj, růže, moře…) i. Výjimka: vzor pán má v 1. pádě množného čísla i (páni, kluci).' },
        { t: 'open', q: 'Vysvětli, proč píšeme „Kluci si hrají s kluky.“', a: 'Kluk je vzor pán. V 1. pádě mn. č. má i (kluci), v 7. pádě mn. č. y (s kluky).' },
      ],
    },
    {
      id: 'pridavna-jmena',
      title: 'Přídavná jména',
      emoji: '🎨',
      ex: [
        {
          title: 'Tři druhy',
          blocks: [
            { t: 'table', head: ['druh', 'vzor', 'příklad'], rows: [['tvrdá', 'mladý', 'mladý, mladá, mladé'], ['měkká', 'jarní', 'jarní den, jarní noc, jarní ráno'], ['přivlastňovací', 'otcův, matčin', 'otcův klobouk, matčina kabelka']] },
            { t: 'key', text: 'Mladý – mění koncovky. Jarní – má pořád -í.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['mladý', 'jarní', 'přivlastňovací'],
                items: [
                  { text: 'zelený', b: 0 },
                  { text: 'cizí', b: 1 },
                  { text: 'Petrův', b: 2 },
                  { text: 'veselá', b: 0 },
                  { text: 'zimní', b: 1 },
                  { text: 'sestřin', b: 2 },
                  { text: 'velké', b: 0 },
                  { text: 'ptačí', b: 1 },
                ],
              },
            },
            { t: 'p', text: 'Přivlastňovací říká, **čí** věc je: *Petrův míč* = míč patří Petrovi.' },
            { t: 'key', text: 'Jaký? → mladý, jarní. Čí? → otcův, matčin.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Podle jakého vzoru je „modrý“?', o: ['mladý', 'jarní'], a: 0 },
        { t: 'choice', q: 'Podle jakého vzoru je „letní“?', o: ['mladý', 'jarní'], a: 1 },
        { t: 'choice', q: 'Které přídavné jméno je přivlastňovací?', o: ['bratrův', 'bratrský', 'velký'], a: 0 },
        { t: 'choice', q: 'Na jakou otázku odpovídá přivlastňovací přídavné jméno?', o: ['jaký?', 'čí?', 'kolik?'], a: 1 },
        { t: 'input', q: 'Napiš vzor pro „cizí“.', a: ['jarní', 'jarni'] },
        { t: 'input', q: 'Doplň ý/í: „Je to stark_ hrad.“', a: ['ý', 'y'], why: 'Tvrdé přídavné jméno, vzor mladý.' },
        { t: 'tf', q: 'Měkká přídavná jména mají ve všech rodech v 1. pádě j. č. koncovku -í.', a: true, why: 'Jarní den, jarní noc, jarní ráno.' },
        { t: 'tf', q: '„Matčin“ je tvrdé přídavné jméno.', a: false, why: 'Matčin je přivlastňovací.' },
        { t: 'pair', q: 'Spoj přídavné jméno s podstatným.', pairs: [['otcova', 'čepice'], ['otcův', 'svetr'], ['otcovo', 'kolo'], ['otcovy', 'boty']] },
        { t: 'choice', q: 'Co je správně?', o: ['Babiččin koláč', 'Babičkův koláč'], a: 0 },
        { t: 'open', q: 'Jaké druhy přídavných jmen znáš?', a: 'Tvrdá (vzor mladý), měkká (vzor jarní) a přivlastňovací (otcův, matčin).' },
        { t: 'open', q: 'Vytvoř přivlastňovací přídavné jméno od slov „Pavel“ a „Jana“.', a: 'Pavlův (Pavlova, Pavlovo) a Janin (Janina, Janino).' },
      ],
    },
    {
      id: 'zajmena',
      title: 'Zájmena',
      emoji: '👉',
      ex: [
        {
          title: 'Místo jména',
          blocks: [
            { t: 'p', text: '**Zájmeno** stojí **za jméno**. Nemusíme pořád opakovat slovo.' },
            { t: 'example', q: 'Petr má psa. Petr psa venčí.', a: 'Petr má psa. **On** ho venčí.' },
            { t: 'table', head: ['druh', 'příklady'], rows: [['osobní', 'já, ty, on, ona, ono, my, vy, oni'], ['přivlastňovací', 'můj, tvůj, jeho, její, náš, váš, svůj'], ['ukazovací', 'ten, tento, tamten, takový'], ['tázací', 'kdo, co, jaký, který, čí'], ['záporná', 'nikdo, nic, žádný']] },
            { t: 'key', text: 'Zájmeno zastupuje nebo ukazuje na jméno.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['osobní', 'přivlastňovací', 'ukazovací'],
                items: [
                  { text: 'ty', b: 0 },
                  { text: 'můj', b: 1 },
                  { text: 'tento', b: 2 },
                  { text: 'oni', b: 0 },
                  { text: 'náš', b: 1 },
                  { text: 'tamten', b: 2 },
                  { text: 'ona', b: 0 },
                  { text: 'svůj', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Osobní = kdo. Přivlastňovací = čí. Ukazovací = který (ten).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je zájmeno?', o: ['my', 'myš', 'mýt'], a: 0 },
        { t: 'choice', q: 'Jaké zájmeno je „tvůj“?', o: ['osobní', 'přivlastňovací', 'ukazovací'], a: 1 },
        { t: 'choice', q: 'Jaké zájmeno je „kdo“?', o: ['tázací', 'osobní', 'záporné'], a: 0 },
        { t: 'choice', q: 'Jaké zájmeno je „nic“?', o: ['ukazovací', 'záporné', 'osobní'], a: 1 },
        { t: 'input', q: 'Jakým slovním druhem jsou zájmena? Kolikátým?', a: ['3', 'třetím', 'tretim', 'třetí'] },
        { t: 'input', q: 'Nahraď zájmenem: „Ema a Tereza“ jdou ven. → … jdou ven.', a: ['ony'], why: 'Ženský rod mn. č. → ony.' },
        { t: 'tf', q: '„Ten“ je zájmeno ukazovací.', a: true },
        { t: 'tf', q: '„Oni“ používáme pro dívky.', a: false, why: 'Pro dívky „ony“. „Oni“ je pro muže nebo smíšenou skupinu.' },
        { t: 'pair', q: 'Spoj osobní zájmeno s přivlastňovacím.', pairs: [['já', 'můj'], ['ty', 'tvůj'], ['my', 'náš'], ['vy', 'váš']] },
        { t: 'choice', q: 'Co je správně? (mluvíme o dívkách)', o: ['Ony šly ven.', 'Oni šli ven.'], a: 0 },
        { t: 'open', q: 'K čemu jsou zájmena? Řekni příklad.', a: 'Zastupují podstatná jména, abychom je neopakovali. Například: Mám kočku. Ona ráda spí.' },
        { t: 'open', q: 'Vyjmenuj osobní zájmena.', a: 'Já, ty, on, ona, ono, my, vy, oni, ony, ona.' },
      ],
    },
    {
      id: 'cislovky',
      title: 'Číslovky',
      emoji: '🔢',
      ex: [
        {
          title: 'Kolik a kolikátý',
          blocks: [
            { t: 'table', head: ['druh', 'otázka', 'příklad'], rows: [['základní', 'kolik?', 'jeden, tři, sto'], ['řadové', 'kolikátý?', 'první, třetí, 5.'], ['druhové', 'kolikerý?', 'dvojí, trojí'], ['násobné', 'kolikrát?', 'dvakrát, třikrát, dvojnásobný']] },
            { t: 'p', text: 'Řadovou číslovku číslem píšeme **s tečkou**: *1. září*.' },
            { t: 'key', text: 'Kolik? → základní. Kolikátý? → řadová.' },
          ],
        },
        {
          title: 'Kartičky',
          blocks: [
            {
              t: 'w',
              w: 'flip',
              p: {
                cards: [
                  { front: 'pět', back: 'základní (kolik?)' },
                  { front: 'pátý', back: 'řadová (kolikátý?)' },
                  { front: 'pětkrát', back: 'násobná (kolikrát?)' },
                  { front: 'patero', back: 'druhová (kolikero?)' },
                  { front: 'několik', back: 'neurčitá – přesně nevíme kolik' },
                ],
              },
            },
            { t: 'p', text: '**Určité** říkají přesně (*tři*). **Neurčité** nepřesně (*mnoho, málo, několik*).' },
            { t: 'key', text: 'Určitá = přesně. Neurčitá = asi.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaká číslovka je „sedm“?', o: ['základní', 'řadová', 'násobná'], a: 0 },
        { t: 'choice', q: 'Jaká číslovka je „druhý“?', o: ['základní', 'řadová', 'druhová'], a: 1 },
        { t: 'choice', q: 'Jaká číslovka je „třikrát“?', o: ['řadová', 'násobná', 'základní'], a: 1 },
        { t: 'choice', q: 'Která číslovka je neurčitá?', o: ['mnoho', 'deset', 'desátý'], a: 0 },
        { t: 'input', q: 'Napiš slovem řadovou číslovku k „4“.', a: ['čtvrtý', 'ctvrty'] },
        { t: 'input', q: 'Kolikátý slovní druh jsou číslovky?', a: ['4', 'čtvrtý', 'ctvrty'] },
        { t: 'tf', q: 'Ve spojení „5. května“ je řadová číslovka.', a: true, why: 'Čteme „pátého května“.' },
        { t: 'tf', q: '„Několik“ je číslovka určitá.', a: false, why: 'Nevíme přesně kolik → neurčitá.' },
        { t: 'pair', q: 'Spoj číslovku s druhem.', pairs: [['dva', 'základní'], ['druhý', 'řadová'], ['dvakrát', 'násobná'], ['dvojí', 'druhová']] },
        { t: 'order', q: 'Seřaď řadové číslovky od nejmenší.', items: ['první', 'druhý', 'třetí', 'čtvrtý', 'pátý'] },
        { t: 'choice', q: 'Co je napsané správně?', o: ['Narodil jsem se 3. dubna.', 'Narodil jsem se 3 dubna.'], a: 0 },
        { t: 'open', q: 'Jaké znáš druhy číslovek? Řekni příklady.', a: 'Základní (tři), řadové (třetí), druhové (trojí), násobné (třikrát). A dělíme je na určité a neurčité (mnoho).' },
        { t: 'open', q: 'Jak se liší „tři“ a „třetí“?', a: 'Tři je základní číslovka – říká kolik. Třetí je řadová – říká pořadí, kolikátý.' },
      ],
    },
    {
      id: 'shoda-prisudku-s-podmetem',
      title: 'Shoda přísudku s podmětem',
      emoji: '🤝',
      ex: [
        {
          title: 'Tabulka',
          blocks: [
            { t: 'p', text: 'V minulém čase se konec přísudku řídí **rodem podmětu** (v mn. č.).' },
            { t: 'table', head: ['rod podmětu', 'koncovka', 'příklad'], rows: [['mužský životný', '-i', 'Psi štěkali.'], ['mužský neživotný', '-y', 'Stromy rostly.'], ['ženský', '-y', 'Kočky mňoukaly.'], ['střední', '-a', 'Kuřata pípala.']] },
            { t: 'key', text: 'Ti psi štěkali, ty stromy rostly, ty kočky mňoukaly, ta kuřata pípala.' },
          ],
        },
        {
          title: 'Ten, ty, ta',
          blocks: [
            { t: 'steps', items: ['Najdi podmět.', 'Řekni před něj **ti / ty / ta**.', 'Ti → **i**. Ty → **y**. Ta → **a**.'] },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'Kluci hrál', after: ' fotbal.', options: ['i', 'y', 'a'], a: 0 },
                  { before: 'Vlaky jezdil', after: ' včas.', options: ['i', 'y', 'a'], a: 1 },
                  { before: 'Holky zpíval', after: '.', options: ['i', 'y', 'a'], a: 1 },
                  { before: 'Auta stál', after: ' u cesty.', options: ['i', 'y', 'a'], a: 2 },
                  { before: 'Děti si hrál', after: '.', options: ['i', 'y', 'a'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Pozor: ty děti → hrály (y)!' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Doplň i/y/a: Ptáci zpíval_.', a: ['i'] },
        { t: 'input', q: 'Doplň i/y/a: Lavice stál_ ve třídě.', a: ['y'] },
        { t: 'input', q: 'Doplň i/y/a: Koťata spal_.', a: ['a'] },
        { t: 'input', q: 'Doplň i/y/a: Mraky plul_ po obloze.', a: ['y'], why: 'Mraky – mužský neživotný → y.' },
        { t: 'choice', q: 'Co je správně?', o: ['Děti si hráli.', 'Děti si hrály.'], a: 1, why: 'Děti se chovají jako ženský rod: ty děti → y.' },
        { t: 'choice', q: 'Co je správně?', o: ['Chlapci a dívky zpívali.', 'Chlapci a dívky zpívaly.'], a: 0, why: 'Je tam i mužský životný (chlapci) → i.' },
        { t: 'choice', q: 'Co je správně?', o: ['Stoly a židle stály.', 'Stoly a židle stáli.'], a: 0, why: 'Mužský neživotný + ženský → y.' },
        { t: 'tf', q: '„Lidé čekali na autobus.“ je správně.', a: true, why: 'Lidé – mužský životný → i.' },
        { t: 'tf', q: '„Psi štěkaly.“ je správně.', a: false, why: 'Psi – mužský životný → štěkali.' },
        { t: 'pair', q: 'Spoj podmět s přísudkem.', pairs: [['Kluci', 'běželi.'], ['Hrady', 'stály.'], ['Ovce', 'se pásly.'], ['Jablka', 'padala.']] },
        { t: 'choice', q: 'Co je správně? (podmět my = dívky)', o: ['My holky jsme šly ven.', 'My holky jsme šli ven.'], a: 0 },
        { t: 'open', q: 'Vysvětli pravidlo shody přísudku s podmětem.', a: 'Podle rodu podmětu: mužský životný → i, mužský neživotný a ženský → y, střední → a. Ti psi štěkali, ty stromy rostly, ty kočky mňoukaly, ta kuřata pípala.' },
        { t: 'open', q: 'Proč píšeme „Chlapci a dívky tančili“ s i?', a: 'Podmět je několikanásobný a jedna jeho část je rodu mužského životného (chlapci). Ten má přednost, proto -i.' },
      ],
    },
    {
      id: 'prima-rec',
      title: 'Přímá řeč',
      emoji: '💬',
      ex: [
        {
          title: 'Bublina',
          blocks: [
            { t: 'p', text: '**Přímá řeč** = přesná slova, která někdo řekl. Dáváme je do **uvozovek** „ “.' },
            { t: 'p', text: '**Uvozovací věta** říká, kdo mluví: *řekla maminka*.' },
            { t: 'table', head: ['kde je uvozovací věta', 'příklad'], rows: [['před', 'Maminka řekla: „Pojď domů.“'], ['za', '„Pojď domů,“ řekla maminka.'], ['uprostřed', '„Pojď,“ řekla maminka, „bude oběd.“']] },
            { t: 'key', text: 'Uvozovky dole na začátku „ a nahoře na konci “.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            { t: 'steps', items: ['Uvozovací věta **před**: za ní **dvojtečka**, pak „Velké písmeno…“', 'Uvozovací věta **za**: tečku v přímé řeči změň na **čárku**: „Pojď domů,“ řekla.', 'Otazník a vykřičník zůstávají: „Kde jsi?“ zeptal se táta.', 'Uvozovací věta za přímou řečí začíná **malým** písmenem.'] },
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['správně ✅', 'chybně ❌'],
                items: [
                  { text: 'Petr řekl: „Mám hlad.“', b: 0 },
                  { text: '„Mám hlad,“ řekl Petr.', b: 0 },
                  { text: '„Mám hlad.“ řekl Petr.', b: 1 },
                  { text: '„Máš hlad?“ zeptal se Petr.', b: 0 },
                  { text: 'Petr řekl „mám hlad.“', b: 1 },
                  { text: '„Mám hlad,“ Řekl Petr.', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Tečka → čárka. Otazník a vykřičník zůstávají.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co je napsané správně?', o: ['„Jdu ven,“ řekl Tom.', '„Jdu ven.“ řekl Tom.', '„Jdu ven“, řekl Tom.'], a: 0 },
        { t: 'choice', q: 'Co je napsané správně?', o: ['Babička řekla: „Dobrou noc.“', 'Babička řekla „Dobrou noc.“', 'Babička řekla: „dobrou noc.“'], a: 0 },
        { t: 'choice', q: 'Co je napsané správně?', o: ['„Kolik je hodin?“ zeptala se Ema.', '„Kolik je hodin,“ zeptala se Ema.', '„Kolik je hodin?“ Zeptala se Ema.'], a: 0 },
        { t: 'choice', q: 'Jak se jmenuje věta, která říká, kdo mluví?', o: ['uvozovací', 'přímá', 'tázací'], a: 0 },
        { t: 'input', q: 'Jaké znaménko píšeme za uvozovací větou, když stojí před přímou řečí?', a: [':', 'dvojtečka', 'dvojtecku', 'dvojtečku'] },
        { t: 'input', q: 'Najdi uvozovací větu: „Pozor, auto!“ vykřikla Jana.', a: ['vykřikla Jana', 'vykrikla jana'] },
        { t: 'tf', q: 'Přímou řeč dáváme do uvozovek.', a: true },
        { t: 'tf', q: 'Když je uvozovací věta za přímou řečí, začíná velkým písmenem.', a: false, why: 'Začíná malým písmenem: „Ahoj,“ řekl Petr.' },
        { t: 'order', q: 'Slož přímou řeč se správným pořadím.', items: ['„Půjdeš', 'se mnou?“', 'zeptal se', 'Jirka.'] },
        { t: 'pair', q: 'Spoj začátek s pokračováním.', pairs: [['„Mám rád zmrzlinu,“', 'řekl Ondra.'], ['„Kde je můj sešit?“', 'ptala se Lucie.'], ['„Utíkej!“', 'zavolal táta.']] },
        { t: 'open', q: 'Přepiš do přímé řeči: Maminka řekla, ať si uklidím pokoj.', a: 'Maminka řekla: „Ukliď si pokoj.“ (nebo: „Ukliď si pokoj,“ řekla maminka.)' },
        { t: 'open', q: 'Co se stane s tečkou na konci přímé řeči, když za ní následuje uvozovací věta?', a: 'Tečka se změní na čárku, která se píše před koncovými uvozovkami: „Jdu ven,“ řekl Tom.' },
      ],
    },
  ],
} satisfies Subject
