import type { Subject } from '../../types'

export default {
  grade: 'z1',
  subject: 'prvouka',
  topics: [
    {
      id: 'skola',
      title: 'Škola a třída',
      emoji: '🏫',
      ex: [
        {
          title: 'Moje taška',
          blocks: [
            { t: 'p', text: 'Do školy nosím **aktovku**.' },
            { t: 'pic', items: ['🎒', '📕', '✏️', '🖍️', '📏'], caption: 'Co mám v aktovce' },
            { t: 'w', w: 'sort', p: { buckets: ['Do školy 🎒', 'Nechám doma 🏠'], items: [
              { text: 'penál ✏️', b: 0 }, { text: 'sešit 📒', b: 0 }, { text: 'pastelky 🖍️', b: 0 },
              { text: 'svačina 🍎', b: 0 }, { text: 'peřina 🛏️', b: 1 }, { text: 'hrnec 🍲', b: 1 },
              { text: 'kolo 🚲', b: 1 }, { text: 'čítanka 📕', b: 0 },
            ] } },
            { t: 'key', text: 'Aktovku si chystám večer.' },
          ],
        },
        {
          title: 'Kdo je ve škole',
          blocks: [
            { t: 'p', text: 'Ve škole jsou lidé, kteří nám pomáhají.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '👩‍🏫 Paní učitelka', back: 'Učí nás.' },
              { front: '👨‍💼 Pan ředitel', back: 'Vede celou školu.' },
              { front: '🧹 Paní uklízečka', back: 'Uklízí školu.' },
              { front: '🍽️ Paní kuchařka', back: 'Vaří obědy.' },
              { front: '🧒 Spolužák', back: 'Chodí se mnou do třídy.' },
            ] } },
            { t: 'key', text: 'Ve škole se zdravím a říkám „prosím“ a „děkuji“.' },
            { t: 'example', q: 'Chceš něco říct. Co uděláš?', a: 'Přihlásím se a počkám.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo nás ve škole učí?', o: ['učitelka', 'kuchařka', 'uklízečka'], a: 0 },
        { t: 'choice', q: 'Kdo vede celou školu?', o: ['ředitel', 'spolužák', 'školník'], a: 0 },
        { t: 'tf', q: 'Když chci mluvit, přihlásím se.', a: true, why: 'Přihlásím se a čekám, až mě vyvolají.' },
        { t: 'tf', q: 'Peřinu nosím do školy.', a: false, why: 'Peřina patří do postele doma.' },
        { t: 'choice', q: 'Kam píšu?', o: ['do sešitu', 'do svačiny', 'do penálu'], a: 0 },
        { t: 'choice', q: 'Co uděláš, když zazvoní na hodinu?', o: ['sednu si do lavice', 'běžím ven', 'jím svačinu'], a: 0 },
        { t: 'pair', q: 'Spoj, kdo co dělá.', pairs: [['učitelka', 'učí'], ['kuchařka', 'vaří'], ['uklízečka', 'uklízí']] },
        { t: 'input', q: 'Doplň: Ve škole sedím v ……… (lavici / posteli)', a: ['lavici', 'lavice'] },
        { t: 'tf', q: 'O přestávce se mohu najíst.', a: true },
        { t: 'order', q: 'Seřaď ráno.', items: ['vstanu', 'obléknu se', 'jdu do školy'] },
        { t: 'open', q: 'Co máš v aktovce?', a: 'Penál, sešity, učebnice, pastelky a svačinu.' },
        { t: 'open', q: 'Jak se chováš ve třídě?', a: 'Zdravím, přihlásím se, když chci mluvit, a neruším ostatní.' },
      ],
    },
    {
      id: 'cesta-do-skoly',
      title: 'Bezpečná cesta do školy',
      emoji: '🚦',
      ex: [
        {
          title: 'Semafor',
          blocks: [
            { t: 'pic', items: ['🔴', '🟢'], caption: 'Semafor pro chodce' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '🔴 Červená', back: 'Stůj!' },
              { front: '🟢 Zelená', back: 'Můžeš jít.' },
            ] } },
            { t: 'key', text: 'Na červenou stojím. Na zelenou jdu.' },
          ],
        },
        {
          title: 'Krok za krokem',
          blocks: [
            { t: 'p', text: 'Silnici přecházím po **přechodu**.' },
            { t: 'steps', items: ['Zastavím se.', 'Podívám se vlevo.', 'Podívám se vpravo.', 'Znovu vlevo.', 'Když nic nejede, jdu rovně.'] },
            { t: 'key', text: 'Na přechodu nikdy neběhám.' },
            { t: 'w', w: 'sort', p: { buckets: ['Správně ✅', 'Špatně ❌'], items: [
              { text: 'jdu po chodníku', b: 0 }, { text: 'hraju si u silnice', b: 1 },
              { text: 'přecházím po přechodu', b: 0 }, { text: 'běžím přes silnici', b: 1 },
              { text: 'počkám na zelenou', b: 0 }, { text: 'jdu na červenou', b: 1 },
            ] } },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Na jakou barvu chodec stojí?', o: ['červenou', 'zelenou'], a: 0 },
        { t: 'choice', q: 'Na jakou barvu chodec jde?', o: ['zelenou', 'červenou'], a: 0 },
        { t: 'choice', q: 'Kde chodí chodec?', o: ['po chodníku', 'po silnici', 'po kolejích'], a: 0 },
        { t: 'tf', q: 'Přes přechod běžím co nejrychleji.', a: false, why: 'Přes přechod jdu, neběžím. Mohl bych upadnout.' },
        { t: 'tf', q: 'Před přechodem se podívám vlevo a vpravo.', a: true },
        { t: 'tf', q: 'Míčem si hraju na hřišti, ne u silnice.', a: true },
        { t: 'input', q: 'Silnici přecházím po ……… (doplň slovo)', a: ['přechodu', 'prechodu'] },
        { t: 'order', q: 'Seřaď, jak přecházím.', items: ['zastavím se', 'rozhlédnu se', 'přejdu'] },
        { t: 'choice', q: 'Neznámý člověk ti nabízí bonbon. Co uděláš?', o: ['nevezmu si ho a odejdu', 'půjdu s ním', 'vezmu si ho'], a: 0, why: 'S cizími lidmi nikam nechodím.' },
        { t: 'tf', q: 'Ve tmě je dobré mít reflexní prvky.', a: true, why: 'Řidič mě ve tmě lépe uvidí.' },
        { t: 'open', q: 'Jak bezpečně přejdeš silnici?', a: 'Půjdu na přechod, zastavím se, podívám se vlevo, vpravo a znovu vlevo. Když nic nejede, přejdu.' },
        { t: 'open', q: 'Co uděláš, když tě osloví cizí člověk?', a: 'Nikam s ním nepůjdu, nic si od něj nevezmu a řeknu to rodičům nebo učitelce.' },
      ],
    },
    {
      id: 'rodina',
      title: 'Moje rodina',
      emoji: '👨‍👩‍👧',
      ex: [
        {
          title: 'Obrázkem',
          blocks: [
            { t: 'pic', items: ['👴', '👵', '👨', '👩', '👦', '👧'], caption: 'Rodina' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '👩 Maminka', back: 'Moje máma.' },
              { front: '👨 Tatínek', back: 'Můj táta.' },
              { front: '👦 Bratr', back: 'Kluk, má stejné rodiče jako já.' },
              { front: '👧 Sestra', back: 'Holka, má stejné rodiče jako já.' },
              { front: '👵 Babička', back: 'Maminka mé mámy nebo táty.' },
              { front: '👴 Dědeček', back: 'Tatínek mé mámy nebo táty.' },
            ] } },
            { t: 'key', text: 'V rodině si pomáháme.' },
          ],
        },
        {
          title: 'Kdo pomáhá',
          blocks: [
            { t: 'p', text: 'Doma má práci každý. I já.' },
            { t: 'list', items: ['uklidím si hračky 🧸', 'prostřu stůl 🍽️', 'zaliju kytku 🪴'] },
            { t: 'key', text: 'Rodina = lidé, kteří patří k sobě a mají se rádi.' },
            { t: 'example', q: 'Kdo je maminka mé maminky?', a: 'Babička.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo je maminka mého tatínka?', o: ['babička', 'sestra', 'teta'], a: 0 },
        { t: 'choice', q: 'Kdo je tatínek mé maminky?', o: ['dědeček', 'bratr', 'strýc'], a: 0 },
        { t: 'choice', q: 'Kluk se stejnými rodiči jako já je můj…', o: ['bratr', 'děda', 'táta'], a: 0 },
        { t: 'input', q: 'Holka se stejnými rodiči jako já je moje ………', a: ['sestra'] },
        { t: 'tf', q: 'Doma pomáhají jen dospělí.', a: false, why: 'Pomáhá každý. I děti.' },
        { t: 'tf', q: 'Babička je starší než maminka.', a: true },
        { t: 'order', q: 'Seřaď od nejmladšího.', items: ['miminko', 'já', 'maminka', 'babička'] },
        { t: 'pair', q: 'Spoj.', pairs: [['máma', 'maminka'], ['táta', 'tatínek'], ['děda', 'dědeček']] },
        { t: 'choice', q: 'Jak můžu doma pomoct?', o: ['uklidím si hračky', 'rozházím boty', 'křičím'], a: 0 },
        { t: 'tf', q: 'Když má někdo narozeniny, můžeme mu dát dárek.', a: true },
        { t: 'open', q: 'Kdo patří do tvé rodiny?', a: 'Například máma, táta, sourozenci, babička a dědeček.' },
        { t: 'open', q: 'Jak pomáháš doma?', a: 'Uklízím si hračky, prostírám stůl nebo zalévám květiny.' },
      ],
    },
    {
      id: 'den-a-tyden',
      title: 'Den a týden',
      emoji: '📅',
      ex: [
        {
          title: 'Hodiny',
          blocks: [
            { t: 'p', text: 'Den má **ráno**, **dopoledne**, **poledne**, **odpoledne** a **večer**. Pak je **noc**.' },
            { t: 'w', w: 'cycle', p: { steps: ['ráno 🌅', 'dopoledne 🏫', 'poledne 🍲', 'odpoledne ⚽', 'večer 🌆', 'noc 🌙'] } },
            { t: 'w', w: 'clock', p: { h: 7, m: 0 } },
            { t: 'key', text: 'Malá ručička ukazuje hodiny. Velká minuty.' },
            { t: 'example', q: 'Velká ručička je nahoře na 12, malá na 8. Kolik je?', a: '8 hodin.' },
          ],
        },
        {
          title: 'Týden',
          blocks: [
            { t: 'p', text: 'Týden má **7 dní**.' },
            { t: 'steps', items: ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle'] },
            { t: 'w', w: 'sort', p: { buckets: ['Škola 🏫', 'Víkend 🎈'], items: [
              { text: 'pondělí', b: 0 }, { text: 'úterý', b: 0 }, { text: 'středa', b: 0 },
              { text: 'čtvrtek', b: 0 }, { text: 'pátek', b: 0 }, { text: 'sobota', b: 1 }, { text: 'neděle', b: 1 },
            ] } },
            { t: 'key', text: 'Sobota a neděle jsou víkend.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik dní má týden?', a: ['7', 'sedm'] },
        { t: 'choice', q: 'Který den je po pondělí?', o: ['úterý', 'středa', 'neděle'], a: 0 },
        { t: 'choice', q: 'Který den je před pátkem?', o: ['čtvrtek', 'sobota', 'středa'], a: 0 },
        { t: 'order', q: 'Seřaď dny.', items: ['pondělí', 'úterý', 'středa', 'čtvrtek'] },
        { t: 'tf', q: 'Sobota a neděle jsou víkend.', a: true },
        { t: 'tf', q: 'V noci je světlo.', a: false, why: 'V noci je tma a spíme.' },
        { t: 'order', q: 'Seřaď části dne.', items: ['ráno', 'poledne', 'večer', 'noc'] },
        { t: 'choice', q: 'Kdy obědváme?', o: ['v poledne', 'v noci', 'ráno'], a: 0 },
        { t: 'choice', q: 'Která ručička ukazuje hodiny?', o: ['malá', 'velká'], a: 0 },
        { t: 'input', q: 'Malá ručička je na 3, velká na 12. Kolik je hodin?', a: ['3', 'tři', '15'] },
        { t: 'open', q: 'Co děláš ráno a co večer?', a: 'Ráno vstanu, umyji se, nasnídám se a jdu do školy. Večer se umyji, vyčistím si zuby a jdu spát.' },
        { t: 'open', q: 'Vyjmenuj dny v týdnu.', a: 'Pondělí, úterý, středa, čtvrtek, pátek, sobota, neděle.' },
      ],
    },
    {
      id: 'moje-telo',
      title: 'Moje tělo',
      emoji: '🧍',
      ex: [
        {
          title: 'Od hlavy k patě',
          blocks: [
            { t: 'p', text: 'Tělo má **hlavu**, **krk**, **trup**, **ruce** a **nohy**.' },
            { t: 'steps', items: ['hlava 🙂', 'krk', 'trup (hrudník a břicho)', 'ruce 🤲', 'nohy 🦵'] },
            { t: 'key', text: 'Hlava, krk, trup, ruce, nohy.' },
          ],
        },
        {
          title: 'Smysly',
          blocks: [
            { t: 'p', text: 'Čím poznávám svět?' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '👀 Oči', back: 'Vidím.' },
              { front: '👂 Uši', back: 'Slyším.' },
              { front: '👃 Nos', back: 'Cítím vůni.' },
              { front: '👅 Jazyk', back: 'Poznám chuť.' },
              { front: '✋ Kůže', back: 'Cítím dotek.' },
            ] } },
            { t: 'key', text: 'Mám 5 smyslů: zrak, sluch, čich, chuť, hmat.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Čím vidím?', o: ['očima', 'ušima', 'nosem'], a: 0 },
        { t: 'choice', q: 'Čím slyším?', o: ['ušima', 'očima', 'rukama'], a: 0 },
        { t: 'choice', q: 'Čím cítím vůni?', o: ['nosem', 'jazykem', 'ušima'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['oči', 'vidím'], ['uši', 'slyším'], ['jazyk', 'chutnám']] },
        { t: 'input', q: 'Kolik prstů mám na jedné ruce?', a: ['5', 'pět'] },
        { t: 'input', q: 'Kolik mám nohou?', a: ['2', 'dvě'] },
        { t: 'tf', q: 'Hlava je spojená s trupem krkem.', a: true },
        { t: 'tf', q: 'Jazykem slyším.', a: false, why: 'Jazykem poznám chuť. Slyším ušima.' },
        { t: 'order', q: 'Seřaď shora dolů.', items: ['hlava', 'krk', 'trup', 'nohy'] },
        { t: 'choice', q: 'Kolik mám smyslů?', o: ['5', '3', '10'], a: 0 },
        { t: 'open', q: 'Z jakých částí se skládá tělo?', a: 'Z hlavy, krku, trupu, rukou a nohou.' },
        { t: 'open', q: 'Co dělají oči a uši?', a: 'Očima vidím, ušima slyším.' },
      ],
    },
    {
      id: 'zdravi',
      title: 'Zdraví a hygiena',
      emoji: '🧼',
      ex: [
        {
          title: 'Co je zdravé',
          blocks: [
            { t: 'p', text: 'Zdravé jídlo mi dá sílu.' },
            { t: 'w', w: 'sort', p: { buckets: ['Často 🥕', 'Jen trochu 🍭'], items: [
              { text: 'jablko 🍎', b: 0 }, { text: 'mrkev 🥕', b: 0 }, { text: 'chléb 🍞', b: 0 },
              { text: 'voda 💧', b: 0 }, { text: 'bonbony 🍬', b: 1 }, { text: 'čokoláda 🍫', b: 1 },
              { text: 'limonáda 🥤', b: 1 }, { text: 'hranolky 🍟', b: 1 },
            ] } },
            { t: 'key', text: 'Jím ovoce a zeleninu. Piju vodu.' },
          ],
        },
        {
          title: 'Čistota',
          blocks: [
            { t: 'p', text: 'Na rukou jsou bacily. Nejsou vidět.' },
            { t: 'steps', items: ['Namočím ruce.', 'Namydlím je 🧼.', 'Dobře je promnu.', 'Opláchnu.', 'Utřu do ručníku.'] },
            { t: 'key', text: 'Ruce myju po záchodě a před jídlem.' },
            { t: 'example', q: 'Kolikrát za den si čistím zuby?', a: 'Aspoň 2× – ráno a večer.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdy si myju ruce?', o: ['před jídlem', 'jen v neděli', 'nikdy'], a: 0 },
        { t: 'choice', q: 'Co je zdravější?', o: ['jablko', 'bonbon', 'limonáda'], a: 0 },
        { t: 'input', q: 'Kolikrát denně si čistím zuby? (číslo)', a: ['2', 'dvakrát'] },
        { t: 'tf', q: 'Po záchodě si myju ruce.', a: true },
        { t: 'tf', q: 'Nejlepší pití je sladká limonáda.', a: false, why: 'Nejlepší pití je voda.' },
        { t: 'tf', q: 'Když kýchám, dám si ruku nebo kapesník před pusu.', a: true },
        { t: 'order', q: 'Seřaď mytí rukou.', items: ['namočím', 'namydlím', 'opláchnu', 'utřu'] },
        { t: 'choice', q: 'Co dělám, když jsem nemocný?', o: ['ležím v posteli', 'běžím ven', 'jdu do bazénu'], a: 0 },
        { t: 'choice', q: 'Kolik hodin by mělo spát malé dítě?', o: ['asi 10 hodin', '3 hodiny', '20 hodin'], a: 0 },
        { t: 'tf', q: 'Pohyb venku je zdravý.', a: true },
        { t: 'open', q: 'Co děláš pro své zdraví?', a: 'Jím ovoce a zeleninu, piju vodu, myju si ruce, čistím zuby, hýbu se a dost spím.' },
        { t: 'open', q: 'Proč si myjeme ruce?', a: 'Na rukou jsou bacily. Mýdlo je smyje, a tak nebudu nemocný.' },
      ],
    },
    {
      id: 'rocni-obdobi',
      title: 'Roční období',
      emoji: '🍂',
      ex: [
        {
          title: 'Kolečko roku',
          blocks: [
            { t: 'p', text: 'Rok má **4 roční období**. Pořád se opakují.' },
            { t: 'w', w: 'cycle', p: { steps: ['jaro 🌷', 'léto ☀️', 'podzim 🍂', 'zima ❄️'] } },
            { t: 'key', text: 'Jaro, léto, podzim, zima.' },
          ],
        },
        {
          title: 'Co kdy je',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Léto ☀️', 'Zima ❄️'], items: [
              { text: 'koupání 🏊', b: 0 }, { text: 'sněhulák ⛄', b: 1 }, { text: 'zmrzlina 🍦', b: 0 },
              { text: 'sáňky 🛷', b: 1 }, { text: 'prázdniny 🏖️', b: 0 }, { text: 'Vánoce 🎄', b: 1 },
              { text: 'čepice a rukavice 🧤', b: 1 }, { text: 'kraťasy 🩳', b: 0 },
            ] } },
            { t: 'list', items: ['Jaro: kvetou květiny 🌷', 'Podzim: padá listí 🍂'] },
            { t: 'key', text: 'Léto je nejteplejší. Zima je nejstudenější.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik je ročních období?', a: ['4', 'čtyři'] },
        { t: 'choice', q: 'Kdy padá listí ze stromů?', o: ['na podzim', 'v létě', 'na jaře'], a: 0 },
        { t: 'choice', q: 'Kdy stavíme sněhuláka?', o: ['v zimě', 'v létě', 'na podzim'], a: 0 },
        { t: 'choice', q: 'Kdy jsou velké prázdniny?', o: ['v létě', 'v zimě', 'na podzim'], a: 0 },
        { t: 'choice', q: 'Kdy kvetou sněženky a tulipány?', o: ['na jaře', 'na podzim', 'v zimě'], a: 0 },
        { t: 'order', q: 'Seřaď od jara.', items: ['jaro', 'léto', 'podzim', 'zima'] },
        { t: 'tf', q: 'Po zimě přijde jaro.', a: true },
        { t: 'tf', q: 'Vánoce jsou v létě.', a: false, why: 'Vánoce jsou v zimě, v prosinci.' },
        { t: 'pair', q: 'Spoj.', pairs: [['zima', 'sníh'], ['jaro', 'květy'], ['podzim', 'barevné listí'], ['léto', 'koupání']] },
        { t: 'tf', q: 'Léto je nejteplejší roční období.', a: true },
        { t: 'open', q: 'Jaké je tvoje oblíbené roční období a proč?', a: 'Například léto, protože je teplo, jsou prázdniny a můžu se koupat.' },
        { t: 'open', q: 'Co se děje v přírodě na podzim?', a: 'Listí se barví a padá, ptáci odlétají do teplých krajin, sklízí se ovoce a je chladněji.' },
      ],
    },
    {
      id: 'zvirata',
      title: 'Zvířata a mláďata',
      emoji: '🐄',
      ex: [
        {
          title: 'Domácí a divoká',
          blocks: [
            { t: 'p', text: 'Některá zvířata žijí s lidmi. Jiná žijí volně v přírodě.' },
            { t: 'w', w: 'sort', p: { buckets: ['Domácí 🏡', 'Volně žijící 🌲'], items: [
              { text: 'kráva 🐄', b: 0 }, { text: 'pes 🐕', b: 0 }, { text: 'slepice 🐔', b: 0 },
              { text: 'kočka 🐈', b: 0 }, { text: 'liška 🦊', b: 1 }, { text: 'jelen 🦌', b: 1 },
              { text: 'veverka 🐿️', b: 1 }, { text: 'ježek 🦔', b: 1 },
            ] } },
            { t: 'key', text: 'Domácí zvířata chová člověk a stará se o ně.' },
          ],
        },
        {
          title: 'Máma a mládě',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '🐄 kráva', back: 'tele' },
              { front: '🐖 prase', back: 'sele' },
              { front: '🐔 slepice', back: 'kuře' },
              { front: '🐕 pes', back: 'štěně' },
              { front: '🐈 kočka', back: 'kotě' },
              { front: '🐎 kůň', back: 'hříbě' },
            ] } },
            { t: 'key', text: 'Mládě = malé zvíře. Rodiče se o něj starají.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jak se jmenuje mládě krávy?', o: ['tele', 'sele', 'kotě'], a: 0 },
        { t: 'choice', q: 'Jak se jmenuje mládě psa?', o: ['štěně', 'kuře', 'hříbě'], a: 0 },
        { t: 'input', q: 'Mládě kočky je ………', a: ['kotě'] },
        { t: 'pair', q: 'Spoj mámu a mládě.', pairs: [['slepice', 'kuře'], ['prase', 'sele'], ['kůň', 'hříbě']] },
        { t: 'tf', q: 'Liška je domácí zvíře.', a: false, why: 'Liška žije volně v lese.' },
        { t: 'tf', q: 'Kráva nám dává mléko.', a: true },
        { t: 'choice', q: 'Které zvíře snáší vejce?', o: ['slepice', 'kráva', 'pes'], a: 0 },
        { t: 'choice', q: 'Které zvíře žije v lese?', o: ['jelen', 'slepice', 'koza'], a: 0 },
        { t: 'choice', q: 'Kdo dává vlnu?', o: ['ovce', 'kočka', 'kůň'], a: 0 },
        { t: 'tf', q: 'O domácí zvíře se musím starat každý den.', a: true, why: 'Potřebuje jídlo, vodu a péči.' },
        { t: 'open', q: 'Jak se staráš o domácí zvíře?', a: 'Dám mu jíst a pít, uklidím mu, venčím ho a hraju si s ním.' },
        { t: 'open', q: 'Jmenuj tři domácí zvířata a jejich mláďata.', a: 'Například kráva – tele, slepice – kuře, pes – štěně.' },
      ],
    },
    {
      id: 'ovoce-zelenina',
      title: 'Ovoce, zelenina, rostliny',
      emoji: '🍎',
      ex: [
        {
          title: 'Roztřiď',
          blocks: [
            { t: 'p', text: '**Ovoce** roste hlavně na stromech a keřích. **Zelenina** hlavně na záhonu.' },
            { t: 'w', w: 'sort', p: { buckets: ['Ovoce 🍎', 'Zelenina 🥕'], items: [
              { text: 'jablko', b: 0 }, { text: 'hruška', b: 0 }, { text: 'třešně', b: 0 }, { text: 'švestka', b: 0 },
              { text: 'mrkev', b: 1 }, { text: 'brambory', b: 1 }, { text: 'okurka', b: 1 }, { text: 'zelí', b: 1 },
            ] } },
            { t: 'key', text: 'Ovoce i zelenina jsou zdravé.' },
          ],
        },
        {
          title: 'Co rostlina potřebuje',
          blocks: [
            { t: 'pic', items: ['☀️', '💧', '🟫', '🌱'], caption: 'Slunce + voda + půda = rostlina roste' },
            { t: 'p', text: 'Rostlina má **kořen**, **stonek**, **listy** a **květ**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'kořen', back: 'Drží rostlinu v zemi a pije vodu.' },
              { front: 'stonek', back: 'Nese listy a květy.' },
              { front: 'list', back: 'Chytá sluníčko.' },
              { front: 'květ', back: 'Z něj bude plod se semínky.' },
            ] } },
            { t: 'key', text: 'Rostlina potřebuje světlo, vodu a půdu.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co je ovoce?', o: ['hruška', 'mrkev', 'brambora'], a: 0 },
        { t: 'choice', q: 'Co je zelenina?', o: ['okurka', 'jablko', 'třešně'], a: 0 },
        { t: 'tf', q: 'Brambory rostou v zemi.', a: true },
        { t: 'tf', q: 'Rostlina může růst bez vody.', a: false, why: 'Bez vody rostlina uschne.' },
        { t: 'choice', q: 'Která část drží rostlinu v zemi?', o: ['kořen', 'květ', 'list'], a: 0 },
        { t: 'order', q: 'Seřaď zdola nahoru.', items: ['kořen', 'stonek', 'květ'] },
        { t: 'pair', q: 'Kde to roste?', pairs: [['jablko', 'na stromě'], ['mrkev', 'v zemi'], ['jahoda', 'na záhonu']] },
        { t: 'input', q: 'Co rostlina potřebuje kromě vody a půdy? (slunce / tma)', a: ['slunce', 'světlo', 'sluníčko'] },
        { t: 'choice', q: 'Ze semínka vyroste…', o: ['nová rostlina', 'kámen', 'zvíře'], a: 0 },
        { t: 'tf', q: 'Ovoce před jídlem umyji.', a: true },
        { t: 'open', q: 'Jmenuj tři druhy ovoce a tři druhy zeleniny.', a: 'Ovoce: jablko, hruška, švestka. Zelenina: mrkev, okurka, brambory.' },
        { t: 'open', q: 'Co potřebuje rostlina, aby rostla?', a: 'Světlo ze slunce, vodu a půdu.' },
      ],
    },
  ],
} satisfies Subject
