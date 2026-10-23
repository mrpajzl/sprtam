import type { Subject } from '../../types'

export default {
  grade: 'z2',
  subject: 'prvouka',
  topics: [
    {
      id: 'domov-a-adresa',
      title: 'Domov a adresa',
      emoji: '🏠',
      ex: [
        {
          title: 'Dopis domů',
          blocks: [
            { t: 'p', text: 'Aby dopis došel, musí mít **adresu**.' },
            { t: 'steps', items: ['jméno a příjmení: Jana Nováková', 'ulice a číslo domu: Lipová 12', 'PSČ a obec: 123 45 Horní Ves'] },
            { t: 'key', text: 'Svou adresu znám nazpaměť.' },
            { t: 'example', q: 'K čemu je adresa?', a: 'Aby mě našel pošťák, záchranka nebo kamarád.' },
          ],
        },
        {
          title: 'Bezpečně doma',
          blocks: [
            { t: 'p', text: 'Doma číhají i nebezpečí.' },
            { t: 'w', w: 'sort', p: { buckets: ['Bezpečné ✅', 'Nebezpečné ⚠️'], items: [
              { text: 'hrát si s kostkami', b: 0 }, { text: 'sahat do zásuvky', b: 1 },
              { text: 'hrát si se zápalkami', b: 1 }, { text: 'číst si knížku', b: 0 },
              { text: 'otevřít cizímu', b: 1 }, { text: 'pít neznámé lahvičky', b: 1 },
              { text: 'malovat', b: 0 }, { text: 'zalévat kytky', b: 0 },
            ] } },
            { t: 'key', text: 'Cizím lidem neotvírám.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Co nepatří do adresy?', o: ['oblíbená barva', 'ulice', 'číslo domu'], a: 0 },
        { t: 'choice', q: 'Kdo nosí dopisy?', o: ['pošťák', 'hasič', 'kuchař'], a: 0 },
        { t: 'tf', q: 'Do zásuvky nestrkám prsty ani věci.', a: true, why: 'Elektrický proud může zabít.' },
        { t: 'tf', q: 'Když zazvoní cizí člověk, otevřu mu.', a: false, why: 'Cizím lidem neotvírám. Zavolám rodiče.' },
        { t: 'order', q: 'Seřaď adresu shora dolů.', items: ['jméno a příjmení', 'ulice a číslo', 'PSČ a obec'] },
        { t: 'choice', q: 'Co je byt?', o: ['místo, kde bydlím', 'obchod', 'škola'], a: 0 },
        { t: 'pair', q: 'Spoj místnost a co tam dělám.', pairs: [['kuchyně', 'vařím'], ['ložnice', 'spím'], ['koupelna', 'myju se']] },
        { t: 'input', q: 'Ve které místnosti se myju?', a: ['koupelna', 'v koupelně', 'koupelně'] },
        { t: 'tf', q: 'Neznámé lahvičky a léky nepiju.', a: true },
        { t: 'choice', q: 'Co uděláš, když ucítíš doma kouř?', o: ['řeknu to dospělému a odejdu ven', 'schovám se pod postel', 'nic'], a: 0 },
        { t: 'open', q: 'Řekni svou adresu.', a: 'Jméno, ulice, číslo domu, PSČ a obec, kde bydlím.' },
        { t: 'open', q: 'Co doma může být nebezpečné?', a: 'Zásuvky, sporák, nože, zápalky, léky a čisticí prostředky.' },
      ],
    },
    {
      id: 'obec',
      title: 'Naše obec',
      emoji: '🏘️',
      ex: [
        {
          title: 'Procházkou',
          blocks: [
            { t: 'p', text: 'Obec je **vesnice** nebo **město**.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '🏥 nemocnice', back: 'Tady léčí nemocné.' },
              { front: '🏤 pošta', back: 'Tady posíláme dopisy a balíky.' },
              { front: '🏛️ obecní úřad', back: 'Tady pracuje starosta.' },
              { front: '🚒 hasičská zbrojnice', back: 'Tady mají hasiči auta.' },
              { front: '📚 knihovna', back: 'Tady si půjčíme knihy.' },
            ] } },
            { t: 'key', text: 'V čele obce je starosta.' },
          ],
        },
        {
          title: 'Vesnice a město',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Spíš vesnice 🐄', 'Spíš město 🏙️'], items: [
              { text: 'pole a statky', b: 0 }, { text: 'tramvaj', b: 1 }, { text: 'málo lidí', b: 0 },
              { text: 'vysoké domy', b: 1 }, { text: 'hodně obchodů', b: 1 }, { text: 'kravín', b: 0 },
            ] } },
            { t: 'key', text: 'Město je větší než vesnice a žije v něm víc lidí.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo stojí v čele obce?', o: ['starosta', 'ředitel', 'lékař'], a: 0 },
        { t: 'choice', q: 'Kde si půjčíme knížku?', o: ['v knihovně', 'na poště', 'v lékárně'], a: 0 },
        { t: 'choice', q: 'Kde koupíme léky?', o: ['v lékárně', 'v knihovně', 'na úřadě'], a: 0 },
        { t: 'tf', q: 'Vesnice je obvykle menší než město.', a: true },
        { t: 'tf', q: 'Tramvaje jezdí hlavně na vesnici.', a: false, why: 'Tramvaje jezdí ve velkých městech.' },
        { t: 'pair', q: 'Spoj budovu a co se tam dělá.', pairs: [['pošta', 'dopisy'], ['nemocnice', 'léčení'], ['škola', 'učení']] },
        { t: 'input', q: 'Jak se jmenuje hlavní město naší republiky?', a: ['Praha'] },
        { t: 'choice', q: 'Obec je…', o: ['vesnice nebo město', 'jen les', 'jen řeka'], a: 0 },
        { t: 'tf', q: 'Odpadky házím do koše, ne na zem.', a: true },
        { t: 'order', q: 'Seřaď od nejmenšího.', items: ['dům', 'ulice', 'obec'] },
        { t: 'open', q: 'Co zajímavého je ve tvé obci?', a: 'Například kostel, náměstí, park, hřiště, řeka nebo hrad.' },
        { t: 'open', q: 'Čím se liší vesnice od města?', a: 'Město je větší, žije v něm víc lidí a jsou tam vyšší domy a víc obchodů. Na vesnici jsou pole a statky.' },
      ],
    },
    {
      id: 'rodina-a-pribuzni',
      title: 'Rodina a příbuzní',
      emoji: '👪',
      ex: [
        {
          title: 'Rodokmen',
          blocks: [
            { t: 'p', text: 'Rodina je jako strom. Dole jsem já, nahoře předci.' },
            { t: 'steps', items: ['já 🧒', 'rodiče: máma a táta 👩👨', 'prarodiče: babičky a dědečkové 👵👴'] },
            { t: 'key', text: 'Rodiče mých rodičů jsou moji prarodiče.' },
          ],
        },
        {
          title: 'Kdo je kdo',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'teta', back: 'sestra mámy nebo táty' },
              { front: 'strýc', back: 'bratr mámy nebo táty' },
              { front: 'bratranec', back: 'syn tety nebo strýce' },
              { front: 'sestřenice', back: 'dcera tety nebo strýce' },
              { front: 'sourozenci', back: 'bratři a sestry' },
            ] } },
            { t: 'key', text: 'Bratranec a sestřenice jsou děti tety nebo strýce.' },
            { t: 'example', q: 'Tvoje máma má sestru Evu. Kdo je Eva tobě?', a: 'Teta.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo je sestra mého táty?', o: ['teta', 'babička', 'sestřenice'], a: 0 },
        { t: 'choice', q: 'Kdo je bratr mé mámy?', o: ['strýc', 'dědeček', 'bratranec'], a: 0 },
        { t: 'choice', q: 'Kdo je syn mé tety?', o: ['bratranec', 'strýc', 'bratr'], a: 0 },
        { t: 'input', q: 'Dcera mého strýce je moje ………', a: ['sestřenice'] },
        { t: 'tf', q: 'Prarodiče jsou rodiče mých rodičů.', a: true },
        { t: 'tf', q: 'Bratranec je syn mé babičky.', a: false, why: 'Syn babičky je táta nebo strýc. Bratranec je syn tety nebo strýce.' },
        { t: 'pair', q: 'Spoj.', pairs: [['sestra mámy', 'teta'], ['bratr táty', 'strýc'], ['máma mámy', 'babička']] },
        { t: 'order', q: 'Seřaď od nejmladší generace.', items: ['děti', 'rodiče', 'prarodiče'] },
        { t: 'choice', q: 'Jak se říká bratrům a sestrám dohromady?', o: ['sourozenci', 'prarodiče', 'sousedé'], a: 0 },
        { t: 'tf', q: 'V rodině si pomáháme a respektujeme se.', a: true },
        { t: 'open', q: 'Kdo je teta a kdo strýc?', a: 'Teta je sestra mámy nebo táty. Strýc je bratr mámy nebo táty.' },
        { t: 'open', q: 'Jak slavíte v rodině svátky nebo narozeniny?', a: 'Například se sejdeme, dáme si dárky, upečeme dort a přejeme si.' },
      ],
    },
    {
      id: 'povolani',
      title: 'Lidé a povolání',
      emoji: '👩‍🚒',
      ex: [
        {
          title: 'Kdo to je',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '👩‍⚕️ lékařka', back: 'léčí nemocné' },
              { front: '👨‍🚒 hasič', back: 'hasí požáry a zachraňuje' },
              { front: '👮 policista', back: 'chrání pořádek' },
              { front: '👨‍🍳 kuchař', back: 'vaří jídlo' },
              { front: '👩‍🌾 zemědělka', back: 'pěstuje plodiny a chová zvířata' },
              { front: '👷 zedník', back: 'staví domy' },
            ] } },
            { t: 'key', text: 'Povolání = práce, kterou člověk dělá.' },
          ],
        },
        {
          title: 'Čím pracuje',
          blocks: [
            { t: 'p', text: 'Každé povolání má svoje nástroje.' },
            { t: 'table', head: ['Povolání', 'Nástroj'], rows: [['kadeřnice', 'nůžky, hřeben'], ['malíř', 'štětec'], ['řidič', 'auto, autobus'], ['prodavač', 'pokladna']] },
            { t: 'key', text: 'Každá práce je důležitá.' },
            { t: 'example', q: 'Kdo používá stetoskop?', a: 'Lékař – poslouchá jím srdce a plíce.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo hasí požár?', o: ['hasič', 'pekař', 'malíř'], a: 0 },
        { t: 'choice', q: 'Kdo peče chleba?', o: ['pekař', 'zedník', 'policista'], a: 0 },
        { t: 'choice', q: 'Kdo léčí zvířata?', o: ['veterinář', 'zubař', 'kuchař'], a: 0 },
        { t: 'pair', q: 'Spoj povolání a nástroj.', pairs: [['kadeřnice', 'nůžky'], ['malíř', 'štětec'], ['kuchař', 'vařečka']] },
        { t: 'tf', q: 'Policista chrání pořádek a pomáhá lidem.', a: true },
        { t: 'tf', q: 'Zubař opravuje auta.', a: false, why: 'Zubař ošetřuje zuby. Auta opravuje automechanik.' },
        { t: 'input', q: 'Kdo staví domy? (zedník / pilot)', a: ['zedník'] },
        { t: 'choice', q: 'Kdo řídí letadlo?', o: ['pilot', 'řidič tramvaje', 'kominík'], a: 0 },
        { t: 'choice', q: 'Kdo pracuje na poli?', o: ['zemědělec', 'knihovník', 'prodavač'], a: 0 },
        { t: 'tf', q: 'Lidé pracují mimo jiné proto, aby vydělali peníze.', a: true },
        { t: 'open', q: 'Čím bys chtěl být a proč?', a: 'Například hasičem, protože chci pomáhat lidem.' },
        { t: 'open', q: 'Jakou práci dělají tvoji rodiče?', a: 'Řeknu, jak se jmenuje jejich povolání a co při něm dělají.' },
      ],
    },
    {
      id: 'kalendar',
      title: 'Kalendář a měsíce',
      emoji: '🗓️',
      ex: [
        {
          title: 'Kolo roku',
          blocks: [
            { t: 'p', text: 'Rok má **12 měsíců**.' },
            { t: 'w', w: 'cycle', p: { steps: ['zima: prosinec, leden, únor ❄️', 'jaro: březen, duben, květen 🌷', 'léto: červen, červenec, srpen ☀️', 'podzim: září, říjen, listopad 🍂'] } },
            { t: 'key', text: 'Rok = 12 měsíců = 4 roční období.' },
          ],
        },
        {
          title: 'Doplň měsíc',
          blocks: [
            { t: 'steps', items: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'Škola začíná v ', after: '.', options: ['září', 'květnu'], a: 0 },
              { before: 'Vánoce jsou v ', after: '.', options: ['prosinci', 'srpnu'], a: 0 },
              { before: 'Nový rok začíná 1. ', after: '.', options: ['ledna', 'března'], a: 0 },
              { before: 'Prázdniny jsou v červenci a v ', after: '.', options: ['srpnu', 'říjnu'], a: 0 },
            ] } },
            { t: 'key', text: 'Rok začíná lednem a končí prosincem.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik měsíců má rok?', a: ['12', 'dvanáct'] },
        { t: 'choice', q: 'Který měsíc je první?', o: ['leden', 'září', 'březen'], a: 0 },
        { t: 'choice', q: 'Který měsíc je poslední?', o: ['prosinec', 'listopad', 'leden'], a: 0 },
        { t: 'choice', q: 'Který měsíc je po červnu?', o: ['červenec', 'květen', 'srpen'], a: 0 },
        { t: 'order', q: 'Seřaď měsíce.', items: ['březen', 'duben', 'květen', 'červen'] },
        { t: 'tf', q: 'Škola začíná v září.', a: true },
        { t: 'tf', q: 'Únor je letní měsíc.', a: false, why: 'Únor je zimní měsíc.' },
        { t: 'pair', q: 'Spoj měsíc a roční období.', pairs: [['leden', 'zima'], ['duben', 'jaro'], ['červenec', 'léto'], ['říjen', 'podzim']] },
        { t: 'input', q: 'Kolik dní má týden?', a: ['7', 'sedm'] },
        { t: 'choice', q: 'Který měsíc bývá nejkratší?', o: ['únor', 'srpen', 'leden'], a: 0, why: 'Únor má 28 dní, v přestupném roce 29.' },
        { t: 'open', q: 'Ve kterém měsíci máš narozeniny a které je to roční období?', a: 'Například v dubnu, to je jaro.' },
        { t: 'open', q: 'Vyjmenuj měsíce od ledna.', a: 'Leden, únor, březen, duben, květen, červen, červenec, srpen, září, říjen, listopad, prosinec.' },
      ],
    },
    {
      id: 'hodiny',
      title: 'Hodiny a čas',
      emoji: '🕒',
      ex: [
        {
          title: 'Ciferník',
          blocks: [
            { t: 'p', text: 'Malá ručička = **hodiny**. Velká ručička = **minuty**.' },
            { t: 'w', w: 'clock', p: { h: 3, m: 30 } },
            { t: 'table', head: ['Velká ručička na…', 'Říkáme'], rows: [['12', 'celá'], ['3', 'čtvrt'], ['6', 'půl'], ['9', 'tři čtvrtě']] },
            { t: 'key', text: 'Půl čtvrté = 3 hodiny a 30 minut.' },
          ],
        },
        {
          title: 'Jako pizza',
          blocks: [
            { t: 'p', text: 'Hodina je jako pizza. Má **60 minut**.' },
            { t: 'w', w: 'fraction', p: { n: 1, d: 4 } },
            { t: 'list', items: ['čtvrt hodiny = 15 minut', 'půl hodiny = 30 minut', 'tři čtvrtě hodiny = 45 minut'] },
            { t: 'key', text: 'Den má 24 hodin. Hodina má 60 minut.' },
            { t: 'example', q: 'Velká ručička je na 6, malá mezi 7 a 8. Kolik je?', a: 'Půl osmé (7:30).' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Kolik minut má hodina?', a: ['60'] },
        { t: 'input', q: 'Kolik hodin má den?', a: ['24'] },
        { t: 'input', q: 'Kolik minut je půl hodiny?', a: ['30'] },
        { t: 'input', q: 'Kolik minut je čtvrt hodiny?', a: ['15'] },
        { t: 'choice', q: 'Velká ručička je na 6. Je…', o: ['půl', 'celá', 'čtvrt'], a: 0 },
        { t: 'choice', q: 'Co ukazuje malá ručička?', o: ['hodiny', 'minuty', 'dny'], a: 0 },
        { t: 'choice', q: '7:30 je…', o: ['půl osmé', 'půl sedmé', 'tři čtvrtě na sedm'], a: 0, why: 'Je to půl cesty k osmé hodině.' },
        { t: 'tf', q: 'Čtvrt na tři je 2:15.', a: true },
        { t: 'order', q: 'Seřaď od nejkratšího.', items: ['minuta', 'hodina', 'den', 'týden'] },
        { t: 'pair', q: 'Spoj.', pairs: [['půl páté', '4:30'], ['čtvrt na šest', '5:15'], ['tři čtvrtě na devět', '8:45']] },
        { t: 'open', q: 'Jak poznáš na hodinách „půl“?', a: 'Velká ručička ukazuje na 6. Malá je mezi dvěma čísly.' },
        { t: 'open', q: 'V kolik hodin chodíš do školy a v kolik spát?', a: 'Například do školy v 7:30 a spát v 8 hodin večer.' },
      ],
    },
    {
      id: 'zdravi-a-smysly',
      title: 'Tělo, zdraví a úraz',
      emoji: '🩹',
      ex: [
        {
          title: 'Tísňové linky',
          blocks: [
            { t: 'p', text: 'Když se stane něco vážného, voláme pomoc.' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: '155', back: 'záchranka 🚑' },
              { front: '150', back: 'hasiči 🚒' },
              { front: '158', back: 'policie 🚓' },
              { front: '112', back: 'jednotné číslo pro všechny' },
            ] } },
            { t: 'key', text: 'Řeknu: kdo jsem, kde jsem a co se stalo.' },
          ],
        },
        {
          title: 'Zdravý talíř',
          blocks: [
            { t: 'pic', items: ['🥦', '🍎', '🍞', '🥛', '🐟'], caption: 'Pestrá strava' },
            { t: 'w', w: 'sort', p: { buckets: ['Pomáhá zdraví 💪', 'Škodí zdraví 🤒'], items: [
              { text: 'spánek', b: 0 }, { text: 'sport', b: 0 }, { text: 'zelenina', b: 0 }, { text: 'mytí rukou', b: 0 },
              { text: 'celý den u tabletu', b: 1 }, { text: 'hodně sladkostí', b: 1 }, { text: 'málo spánku', b: 1 },
            ] } },
            { t: 'key', text: 'Jím pestře, hýbu se a dost spím.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Jaké číslo má záchranka?', a: ['155'] },
        { t: 'input', q: 'Jaké číslo mají hasiči?', a: ['150'] },
        { t: 'choice', q: 'Jaké číslo má policie?', o: ['158', '155', '150'], a: 0 },
        { t: 'pair', q: 'Spoj.', pairs: [['155', 'záchranka'], ['150', 'hasiči'], ['158', 'policie']] },
        { t: 'tf', q: 'Číslo 112 platí v celé Evropě.', a: true },
        { t: 'tf', q: 'Na tísňovou linku můžu volat pro legraci.', a: false, why: 'Zdržel bych pomoc pro někoho, kdo ji opravdu potřebuje.' },
        { t: 'choice', q: 'Kamarád si odřel koleno. Co uděláš?', o: ['řeknu to dospělému', 'utíkám pryč', 'směju se'], a: 0 },
        { t: 'choice', q: 'Co je zdravá svačina?', o: ['chléb a jablko', 'chipsy', 'bonbony'], a: 0 },
        { t: 'tf', q: 'Na slunci nosím čepici a mažu se krémem.', a: true },
        { t: 'order', q: 'Co řeknu při volání?', items: ['kdo jsem', 'kde jsem', 'co se stalo'] },
        { t: 'open', q: 'Co řekneš, když voláš záchranku?', a: 'Řeknu své jméno, kde jsem a co se stalo. Nezavěsím, dokud mi to neřeknou.' },
        { t: 'open', q: 'Jak se chráníš před nemocí?', a: 'Myju si ruce, jím ovoce a zeleninu, sportuji, dost spím a obléknu se podle počasí.' },
      ],
    },
    {
      id: 'rostliny-a-stromy',
      title: 'Rostliny a stromy',
      emoji: '🌳',
      ex: [
        {
          title: 'Listy a jehlice',
          blocks: [
            { t: 'p', text: '**Listnaté** stromy mají listy. **Jehličnaté** mají jehlice.' },
            { t: 'w', w: 'sort', p: { buckets: ['Listnatý 🍃', 'Jehličnatý 🌲'], items: [
              { text: 'dub', b: 0 }, { text: 'lípa', b: 0 }, { text: 'bříza', b: 0 }, { text: 'buk', b: 0 },
              { text: 'smrk', b: 1 }, { text: 'borovice', b: 1 }, { text: 'jedle', b: 1 }, { text: 'modřín', b: 1 },
            ] } },
            { t: 'key', text: 'Listnaté stromy na podzim shazují listí.' },
          ],
        },
        {
          title: 'Strom, keř, bylina',
          blocks: [
            { t: 'table', head: ['Rostlina', 'Jak vypadá', 'Příklad'], rows: [['strom', 'jeden silný kmen', 'dub'], ['keř', 'víc tenkých větví od země', 'líska'], ['bylina', 'měkký zelený stonek', 'pampeliška']] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'Plod dubu', back: 'žalud' },
              { front: 'Plod kaštanu (jírovce)', back: 'kaštan' },
              { front: 'Plod lísky', back: 'lískový oříšek' },
            ] } },
            { t: 'key', text: 'Strom má kmen. Keř má víc větví. Bylina má měkký stonek.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který strom je jehličnatý?', o: ['smrk', 'dub', 'lípa'], a: 0 },
        { t: 'choice', q: 'Který strom je listnatý?', o: ['bříza', 'borovice', 'jedle'], a: 0 },
        { t: 'input', q: 'Jak se jmenuje plod dubu?', a: ['žalud', 'žaludy'] },
        { t: 'tf', q: 'Pampeliška je bylina.', a: true },
        { t: 'tf', q: 'Smrk na podzim shazuje jehlice.', a: false, why: 'Smrk je zelený celý rok. Jehlice shazuje modřín.' },
        { t: 'choice', q: 'Který jehličnan na zimu shazuje jehlice?', o: ['modřín', 'smrk', 'jedle'], a: 0 },
        { t: 'pair', q: 'Spoj strom a plod.', pairs: [['dub', 'žalud'], ['líska', 'oříšek'], ['jabloň', 'jablko']] },
        { t: 'choice', q: 'Co má strom a keř nemá?', o: ['jeden silný kmen', 'listy', 'kořeny'], a: 0 },
        { t: 'order', q: 'Seřaď od nejmenšího.', items: ['bylina', 'keř', 'strom'] },
        { t: 'tf', q: 'Stromy vyrábějí kyslík, který dýcháme.', a: true },
        { t: 'open', q: 'Jak poznáš listnatý a jehličnatý strom?', a: 'Listnatý má široké listy a na podzim je shazuje. Jehličnatý má jehlice a většinou je zelený i v zimě.' },
        { t: 'open', q: 'Jmenuj strom, keř a bylinu.', a: 'Například strom dub, keř líska a bylina pampeliška.' },
      ],
    },
    {
      id: 'zvirata-domaci-a-volne',
      title: 'Zvířata kolem nás',
      emoji: '🦔',
      ex: [
        {
          title: 'Kdo kde žije',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Les 🌲', 'Voda 💧', 'Statek 🏡'], items: [
              { text: 'jelen', b: 0 }, { text: 'divočák', b: 0 }, { text: 'veverka', b: 0 },
              { text: 'kapr', b: 1 }, { text: 'kachna divoká', b: 1 }, { text: 'žába', b: 1 },
              { text: 'kráva', b: 2 }, { text: 'koza', b: 2 }, { text: 'husa domácí', b: 2 },
            ] } },
            { t: 'key', text: 'Každé zvíře má svůj domov.' },
          ],
        },
        {
          title: 'Jak přečkají zimu',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: '🦔 ježek', back: 'spí zimním spánkem' },
              { front: '🐿️ veverka', back: 'má zásoby oříšků' },
              { front: '🐦 vlaštovka', back: 'odletí do teplých krajin' },
              { front: '🦌 srnec', back: 'hledá potravu, lidé mu dají seno do krmelce' },
            ] } },
            { t: 'key', text: 'Někdo spí, někdo odletí, někdo si dělá zásoby.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo spí v zimě zimním spánkem?', o: ['ježek', 'zajíc', 'srna'], a: 0 },
        { t: 'choice', q: 'Kdo na zimu odlétá do teplých krajin?', o: ['vlaštovka', 'vrabec', 'sýkora'], a: 0 },
        { t: 'choice', q: 'Kde žije kapr?', o: ['ve vodě', 'v lese', 'na stromě'], a: 0 },
        { t: 'tf', q: 'Veverka si dělá zásoby na zimu.', a: true },
        { t: 'tf', q: 'Kráva je volně žijící zvíře.', a: false, why: 'Krávu chová člověk – je to hospodářské zvíře.' },
        { t: 'input', q: 'Kam dáváme v zimě seno pro srnky? Do ………', a: ['krmelce', 'krmelec'] },
        { t: 'pair', q: 'Spoj zvíře a domov.', pairs: [['liška', 'nora'], ['pták', 'hnízdo'], ['včela', 'úl']] },
        { t: 'choice', q: 'Co nám dává slepice?', o: ['vejce', 'vlnu', 'mléko'], a: 0 },
        { t: 'tf', q: 'Mláďata v lese nebereme domů.', a: true, why: 'Matka je obvykle nablízku a o mládě se stará.' },
        { t: 'choice', q: 'Mládě koně je…', o: ['hříbě', 'tele', 'jehně'], a: 0 },
        { t: 'open', q: 'Jak zvířata přečkávají zimu?', a: 'Někdo spí zimním spánkem (ježek), někdo odletí do teplých krajin (vlaštovka) a někdo si dělá zásoby (veverka).' },
        { t: 'open', q: 'Jak se chováme v lese?', a: 'Nekřičíme, neodhazujeme odpadky, nelámeme stromy a neplašíme ani nebereme zvířata.' },
      ],
    },
  ],
} satisfies Subject
