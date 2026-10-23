import type { Subject } from '../../types'

export default {
  grade: 'z2',
  subject: 'cestina',
  topics: [
    {
      id: 'veta-slovo-slabika-hlaska',
      title: 'Věta, slovo, slabika, hláska',
      emoji: '🧱',
      ex: [
        {
          title: 'Stavebnice',
          blocks: [
            { t: 'p', text: 'Řeč je jako stavebnice.' },
            { t: 'list', items: ['**Věta** se skládá ze slov.', '**Slovo** se skládá ze slabik.', '**Slabika** se skládá z hlásek.'] },
            { t: 'pic', items: ['📜 Pes spí.', '➡️', 'pes', '➡️', 'p · e · s'] },
            { t: 'key', text: 'Věta → slova → slabiky → hlásky.' },
          ],
        },
        {
          title: 'Rozlož to',
          blocks: [
            { t: 'example', q: 'Kolik slov má věta „Máma peče koláč.“?', a: '3 slova: Máma / peče / koláč.' },
            { t: 'example', q: 'Kolik slabik má slovo „koláč“?', a: '2 slabiky: ko-láč.' },
            { t: 'example', q: 'Kolik hlásek má slovo „pes“?', a: '3 hlásky: p-e-s.' },
            { t: 'w', w: 'counter', p: { emoji: '👏', start: 0, max: 6 } },
            { t: 'key', text: 'Slabiky vytleskáš. Hlásky vyslovíš jednu po druhé.' },
          ],
        },
      ],
      qs: [
        { t: 'order', q: 'Seřaď od největšího po nejmenší.', items: ['věta', 'slovo', 'slabika', 'hláska'] },
        { t: 'input', q: 'Kolik slov má věta „Na stromě sedí pták.“?', a: ['4'] },
        { t: 'input', q: 'Kolik slabik má slovo „sluníčko“?', a: ['3'], why: 'slu-níč-ko' },
        { t: 'input', q: 'Kolik hlásek má slovo „les“?', a: ['3'] },
        { t: 'choice', q: 'Kolik hlásek má slovo „chata“?', o: ['4', '5', '3'], a: 0, why: 'ch-a-t-a. Ch je jedna hláska.' },
        { t: 'tf', q: 'Ch je jedna hláska.', a: true, why: 'Ch píšeme dvěma znaky, ale je to jedna hláska.' },
        { t: 'tf', q: 'Slabika se skládá ze slov.', a: false, why: 'Je to naopak: slovo se skládá ze slabik.' },
        { t: 'choice', q: 'Jak rozdělíš na slabiky slovo „maminka“?', o: ['ma-min-ka', 'mam-in-ka', 'ma-mi-nka'], a: 0 },
        { t: 'pair', q: 'Spoj s názvem.', pairs: [['k', 'hláska'], ['ko', 'slabika'], ['kolo', 'slovo'], ['Kolo jede.', 'věta']] },
        { t: 'choice', q: 'Které slovo má nejvíc slabik?', o: ['dům', 'kočka', 'pastelka'], a: 2, why: 'pa-stel-ka = 3' },
        { t: 'open', q: 'Z čeho se skládá věta a z čeho slovo?', a: 'Věta se skládá ze slov. Slovo se skládá ze slabik a slabiky z hlásek.' },
        { t: 'open', q: 'Řekni větu o třech slovech.', a: 'Například: Kočka pije mléko.' },
      ],
    },
    {
      id: 'abeceda',
      title: 'Abeceda',
      emoji: '🔡',
      ex: [
        {
          title: 'Řada písmen',
          blocks: [
            { t: 'p', text: 'Abeceda je **pořadí písmen**. Je stejné pořád.' },
            { t: 'p', text: 'a, b, c, č, d, ď, e, f, g, h, **ch**, i, j, k, l, m, n, ň, o, p, q, r, ř, s, š, t, ť, u, v, w, x, y, z, ž' },
            { t: 'key', text: 'Ch je až za h. Č je hned za c.' },
          ],
        },
        {
          title: 'Řazení slov',
          blocks: [
            { t: 'steps', items: ['Podívej se na **první písmeno**.', 'Které je dřív v abecedě, to slovo jde dřív.', 'Stejné první písmeno? Rozhodne **druhé** písmeno.'] },
            { t: 'example', q: 'Seřaď: myš, auto, kolo.', a: 'auto, kolo, myš' },
            { t: 'example', q: 'Seřaď: hrad, chata, cesta.', a: 'cesta, hrad, chata (ch je za h)' },
            { t: 'key', text: 'Abecedu potřebuješ ve slovníku i v seznamu žáků.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které písmeno je hned za písmenem c?', o: ['d', 'č', 'ch'], a: 1 },
        { t: 'choice', q: 'Kde je v abecedě ch?', o: ['za c', 'za h', 'na konci'], a: 1 },
        { t: 'input', q: 'Které písmeno je v abecedě první?', a: ['a'] },
        { t: 'input', q: 'Které písmeno je v abecedě poslední?', a: ['ž'] },
        { t: 'order', q: 'Seřaď podle abecedy.', items: ['auto', 'balón', 'dům', 'kolo'] },
        { t: 'order', q: 'Seřaď podle abecedy.', items: ['hrad', 'chata', 'indián', 'jahoda'] },
        { t: 'order', q: 'Seřaď podle abecedy.', items: ['cibule', 'čaj', 'datel', 'řeka'] },
        { t: 'tf', q: 'Písmeno ř je v abecedě před r.', a: false, why: 'Nejdřív r, potom ř.' },
        { t: 'tf', q: 'Písmeno š je v abecedě za s.', a: true },
        { t: 'choice', q: 'Které slovo bude ve slovníku dřív?', o: ['strom', 'sova'], a: 1, why: 'Obě začínají s. Druhé písmeno: o je dřív než t.' },
        { t: 'open', q: 'Proč je dobré znát abecedu?', a: 'Aby se dalo rychle najít slovo ve slovníku nebo jméno v seznamu.' },
        { t: 'open', q: 'Řekni abecedu od a do h.', a: 'a, b, c, č, d, ď, e, f, g, h.' },
      ],
    },
    {
      id: 'samohlasky-a-souhlasky',
      title: 'Samohlásky a souhlásky',
      emoji: '🎵',
      ex: [
        {
          title: 'Zpívání',
          blocks: [
            { t: 'p', text: '**Samohlásky** se dají zpívat: a, e, i, o, u, y.' },
            { t: 'p', text: 'Mají krátkou i dlouhou podobu: á, é, í, ó, ú, ů, ý.' },
            { t: 'p', text: 'Ostatní hlásky jsou **souhlásky**: b, k, m, s…' },
            { t: 'p', text: '**Dvojhlásky**: ou, au, eu (*m**ou**cha, **au**to*).' },
            { t: 'key', text: 'Samohlásky: a, e, i, o, u, y. Ostatní jsou souhlásky.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['samohláska', 'souhláska'],
                items: [
                  { text: 'a', b: 0 },
                  { text: 'k', b: 1 },
                  { text: 'é', b: 0 },
                  { text: 'r', b: 1 },
                  { text: 'ů', b: 0 },
                  { text: 'š', b: 1 },
                  { text: 'y', b: 0 },
                  { text: 'ch', b: 1 },
                ],
              },
            },
            { t: 'key', text: 'Ů, ý, é… jsou taky samohlásky – jen dlouhé.' },
          ],
        },
      ],
      qs: [
        { t: 'tf', q: 'O je samohláska.', a: true },
        { t: 'tf', q: 'Ch je samohláska.', a: false, why: 'Ch je souhláska.' },
        { t: 'choice', q: 'Která skupina obsahuje jen samohlásky?', o: ['a, e, u', 'a, b, e', 'm, n, o'], a: 0 },
        { t: 'choice', q: 'Která skupina obsahuje jen souhlásky?', o: ['p, o, l', 'k, r, s', 'i, t, u'], a: 1 },
        { t: 'choice', q: 'Co je dvojhláska?', o: ['ou', 'aa', 'ch'], a: 0 },
        { t: 'input', q: 'Kolik samohlásek je ve slově „kolo“?', a: ['2'] },
        { t: 'input', q: 'Kolik souhlásek je ve slově „strom“?', a: ['4'], why: 's, t, r, m – 4 souhlásky, o je samohláska.' },
        { t: 'pair', q: 'Spoj krátkou a dlouhou samohlásku.', pairs: [['a', 'á'], ['i', 'í'], ['y', 'ý'], ['o', 'ó']] },
        { t: 'choice', q: 'Ve kterém slově je dvojhláska?', o: ['auto', 'okno', 'ruka'], a: 0 },
        { t: 'tf', q: 'Ů je dlouhá samohláska.', a: true },
        { t: 'open', q: 'Vyjmenuj krátké samohlásky.', a: 'a, e, i, o, u, y.' },
        { t: 'open', q: 'Co jsou dvojhlásky? Řekni příklad.', a: 'Dvě samohlásky v jedné slabice: ou, au, eu. Například moucha, auto, euro.' },
      ],
    },
    {
      id: 'tvrde-mekke-obojetne',
      title: 'Tvrdé, měkké a obojetné souhlásky',
      emoji: '🪨',
      ex: [
        {
          title: 'Říkanka',
          blocks: [
            { t: 'table', head: ['tvrdé 🪨', 'měkké 🧸', 'obojetné 🔁'], rows: [['h, ch, k, r, d, t, n', 'ž, š, č, ř, c, j, ď, ť, ň', 'b, f, l, m, p, s, v, z']] },
            { t: 'list', items: ['Po **tvrdé** píšeme **y/ý**: *hýbat, kytka, ryba*.', 'Po **měkké** píšeme **i/í**: *žízeň, číst, cibule*.', 'Po **obojetné** píšeme y i i.'] },
            { t: 'key', text: 'Tvrdá – tvrdé y. Měkká – měkké i.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['tvrdá', 'měkká', 'obojetná'],
                items: [
                  { text: 'k', b: 0 },
                  { text: 'ž', b: 1 },
                  { text: 'b', b: 2 },
                  { text: 'h', b: 0 },
                  { text: 'c', b: 1 },
                  { text: 'm', b: 2 },
                  { text: 'r', b: 0 },
                  { text: 'ř', b: 1 },
                  { text: 's', b: 2 },
                ],
              },
            },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'k', after: 'tka', options: ['y', 'i'], a: 0 },
                  { before: 'ž', after: 'dle', options: ['y', 'i'], a: 1 },
                  { before: 'h', after: 'bat', options: ['ý', 'í'], a: 0 },
                  { before: 'č', after: 'st', options: ['ý', 'í'], a: 1 },
                  { before: 'r', after: 'ba', options: ['y', 'i'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Nejdřív zjisti, jaká je souhláska.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která souhláska je tvrdá?', o: ['š', 'k', 'l'], a: 1 },
        { t: 'choice', q: 'Která souhláska je měkká?', o: ['č', 'd', 'v'], a: 0 },
        { t: 'choice', q: 'Která souhláska je obojetná?', o: ['ř', 'ch', 'm'], a: 2 },
        { t: 'input', q: 'Doplň y/i: k_selo', a: ['y'], why: 'K je tvrdá – píšeme y.' },
        { t: 'input', q: 'Doplň y/i: c_bule', a: ['i'], why: 'C je měkká – píšeme i.' },
        { t: 'input', q: 'Doplň y/i: hr_bitov', a: ['y'], why: 'R je tvrdá – píšeme y.' },
        { t: 'tf', q: 'Po měkké souhlásce píšeme i/í.', a: true },
        { t: 'tf', q: 'J je tvrdá souhláska.', a: false, why: 'J je měkká souhláska.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['šyje', 'šije', 'šíye'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['chiba', 'chyba', 'chíba'], a: 1 },
        { t: 'order', q: 'Seřaď tvrdé souhlásky podle říkanky.', items: ['h', 'ch', 'k', 'r', 'd', 't', 'n'] },
        { t: 'open', q: 'Vyjmenuj tvrdé a měkké souhlásky.', a: 'Tvrdé: h, ch, k, r, d, t, n. Měkké: ž, š, č, ř, c, j, ď, ť, ň.' },
        { t: 'open', q: 'Kdy píšeme y a kdy i?', a: 'Po tvrdých souhláskách píšeme y, po měkkých i. Po obojetných může být obojí.' },
      ],
    },
    {
      id: 'dy-ty-ny-di-ti-ni',
      title: 'Dy, ty, ny – di, ti, ni',
      emoji: '🦆',
      ex: [
        {
          title: 'Poslechni si',
          blocks: [
            { t: 'p', text: 'Řekni *dýně* a *dívka*. Slyšíš rozdíl?' },
            { t: 'table', head: ['slyším tvrdě', 'slyším měkce'], rows: [['dy, ty, ny', 'di, ti, ni (ďi, ťi, ňi)'], ['dýně, tygr, nyní', 'divadlo, tichý, nic']] },
            { t: 'p', text: 'Měkké *ďi, ťi, ňi* píšeme **bez háčku**: *di, ti, ni*.' },
            { t: 'key', text: 'Slyším tvrdě → y. Slyším měkce → i.' },
          ],
        },
        {
          title: 'Doplň',
          blocks: [
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'd', after: 'vadlo', options: ['y', 'i'], a: 1 },
                  { before: 't', after: 'gr', options: ['y', 'i'], a: 0 },
                  { before: 'n', after: 'tka', options: ['y', 'i'], a: 1 },
                  { before: 'rod', after: 'na', options: ['y', 'i'], a: 1 },
                  { before: 'hodn', after: '', options: ['ý', 'í'], a: 0 },
                  { before: 'mot', after: 'l', options: ['ý', 'í'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Nahlas: ďi, ťi, ňi zní měkce. Napiš di, ti, ni.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Doplň y/i: t_gr', a: ['y'] },
        { t: 'input', q: 'Doplň y/i: d_vadlo', a: ['i'] },
        { t: 'input', q: 'Doplň y/i: n_tka', a: ['i'] },
        { t: 'input', q: 'Doplň ý/í: d_ně (zelenina)', a: ['ý', 'y'] },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['ťichý', 'tichý', 'tychý'], a: 1, why: 'Ťi píšeme bez háčku: ti.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['rodyna', 'rodina', 'roďina'], a: 1 },
        { t: 'tf', q: 'Ve slově „tykev“ slyšíme tvrdé ty.', a: true },
        { t: 'tf', q: 'Ďi píšeme s háčkem.', a: false, why: 'Píšeme di – bez háčku.' },
        { t: 'pair', q: 'Spoj slovo se skupinou.', pairs: [['dýně', 'dy'], ['divadlo', 'di'], ['tygr', 'ty'], ['nic', 'ni']] },
        { t: 'choice', q: 'Ve kterém slově čteme měkce?', o: ['tykev', 'ticho', 'dým'], a: 1 },
        { t: 'open', q: 'Jak poznáš, jestli napsat di, nebo dy?', a: 'Poslechnu si slovo. Když zní měkce jako ďi, píšu di. Když zní tvrdě, píšu dy.' },
        { t: 'open', q: 'Řekni dvě slova s ti a dvě s ty.', a: 'S ti: ticho, tisk. S ty: tygr, tyč.' },
      ],
    },
    {
      id: 'de-te-ne-be-pe-ve-me',
      title: 'Dě, tě, ně, bě, pě, vě, mě',
      emoji: '🏙️',
      ex: [
        {
          title: 'Háček na e',
          blocks: [
            { t: 'p', text: 'Slyšíš *ďe, ťe, ňe*? Napiš **dě, tě, ně**.' },
            { t: 'pic', items: ['👧 děti', '🌳 větev', '❄️ sněh'] },
            { t: 'p', text: 'Po b, p, v, m slyšíš *bje, pje, vje, mňe*. Napiš **bě, pě, vě, mě**.' },
            { t: 'pic', items: ['🏃 běhat', '5️⃣ pět', '🗼 věž', '🏙️ město'] },
            { t: 'key', text: 'Ě se píše jen po d, t, n, b, p, v, m.' },
          ],
        },
        {
          title: 'Doplň',
          blocks: [
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'd', after: 'ti', options: ['e', 'ě'], a: 1 },
                  { before: 'm', after: 'sto', options: ['e', 'ě'], a: 1 },
                  { before: 'n', after: 'co', options: ['e', 'ě'], a: 1 },
                  { before: 'l', after: 's', options: ['e', 'ě'], a: 0 },
                  { before: 'b', after: 'hat', options: ['e', 'ě'], a: 1 },
                  { before: 'v', after: 'c', options: ['e', 'ě'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Řekni slovo nahlas a poslouchej.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['ďeti', 'děti', 'dieti'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['mněsto', 'město', 'mjesto'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['pjet', 'pět', 'pet'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['vjež', 'věž', 'vež'], a: 1 },
        { t: 'choice', q: 'Kam patří ě? sn_h', o: ['sneh', 'sněh'], a: 1 },
        { t: 'tf', q: 'Ve slově „tělo“ píšeme ě.', a: true },
        { t: 'tf', q: 'Ve slově „pes“ píšeme ě.', a: false, why: 'Pes zní tvrdě – píšeme e.' },
        { t: 'pair', q: 'Spoj, co slyšíš, s tím, co píšeš.', pairs: [['ďe', 'dě'], ['ťe', 'tě'], ['ňe', 'ně'], ['bje', 'bě']] },
        { t: 'choice', q: 'Po kterém písmenu NEPÍŠEME ě?', o: ['m', 'l', 'v'], a: 1, why: 'Ě píšeme jen po d, t, n, b, p, v, m.' },
        { t: 'choice', q: 'Ve kterém slově je ě?', o: ['oběd', 'les', 'nos'], a: 0 },
        { t: 'open', q: 'Po kterých souhláskách píšeme ě?', a: 'Po d, t, n, b, p, v, m. Například děti, tělo, něco, běhat, pět, věž, město.' },
        { t: 'open', q: 'Řekni tři slova s ě.', a: 'Například děti, město, věž, pět.' },
      ],
    },
    {
      id: 'u-u-u',
      title: 'U, ú, ů',
      emoji: '🏠',
      ex: [
        {
          title: 'Kde stojí',
          blocks: [
            { t: 'table', head: ['kde', 'píšu', 'příklad'], rows: [['na začátku slova', 'ú', 'úkol, úterý'], ['uprostřed a na konci', 'ů', 'dům, stůl, domů'], ['po předponě', 'ú', 'neúspěch, bezúročný']] },
            { t: 'key', text: 'Na začátku ú (čárka). Jinde ů (kroužek).' },
          ],
        },
        {
          title: 'Doplň',
          blocks: [
            { t: 'p', text: 'Kroužek bývá tam, kde se v jiném tvaru objeví **o**: *dům – domy*.' },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: '', after: 'terý', options: ['ú', 'ů'], a: 0 },
                  { before: 'st', after: 'l', options: ['ú', 'ů'], a: 1 },
                  { before: 'k', after: 'ň', options: ['ú', 'ů'], a: 1 },
                  { before: '', after: 'směv', options: ['ú', 'ů'], a: 0 },
                  { before: 'dom', after: '', options: ['ú', 'ů'], a: 1 },
                ],
              },
            },
            { t: 'key', text: 'Dům – domy, stůl – stoly, kůň – koně.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['ůkol', 'úkol'], a: 1, why: 'Na začátku slova píšeme ú.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['dúm', 'dům'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['kůň', 'kúň'], a: 0, why: 'Kůň – koně.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['ůsměv', 'úsměv'], a: 1 },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['stúl', 'stůl'], a: 1, why: 'Stůl – stoly.' },
        { t: 'tf', q: 'Na začátku slova píšeme ú.', a: true },
        { t: 'tf', q: 'Na konci slova píšeme ú.', a: false, why: 'Na konci slova píšeme ů: domů.' },
        { t: 'pair', q: 'Spoj slovo s tvarem, kde je o.', pairs: [['dům', 'domy'], ['stůl', 'stoly'], ['kůň', 'koně'], ['vůz', 'vozy']] },
        { t: 'choice', q: 'Ve kterém slově je ú?', o: ['úterý', 'důl', 'sůl'], a: 0 },
        { t: 'choice', q: 'Kam patří ů? „Jdu dom_.“', o: ['domú', 'domů'], a: 1 },
        { t: 'open', q: 'Kdy píšeme ú a kdy ů?', a: 'Ú píšeme na začátku slova a po předponě. Ů píšeme uprostřed a na konci slova.' },
        { t: 'open', q: 'Řekni dvě slova s ú a dvě s ů.', a: 'S ú: úkol, úterý. S ů: dům, stůl.' },
      ],
    },
    {
      id: 'parove-souhlasky',
      title: 'Párové souhlásky',
      emoji: '👯',
      ex: [
        {
          title: 'Kamarádi',
          blocks: [
            { t: 'p', text: 'Některé souhlásky chodí ve dvojicích. Na konci slova zní stejně.' },
            {
              t: 'w',
              w: 'flip',
              p: {
                cards: [
                  { front: 'b', back: 'p' },
                  { front: 'd', back: 't' },
                  { front: 'ď', back: 'ť' },
                  { front: 'z', back: 's' },
                  { front: 'ž', back: 'š' },
                  { front: 'v', back: 'f' },
                  { front: 'h', back: 'ch' },
                  { front: 'g', back: 'k' },
                ],
              },
            },
            { t: 'key', text: 'Na konci slova nevíš? Prodluž slovo!' },
          ],
        },
        {
          title: 'Prodluž slovo',
          blocks: [
            { t: 'steps', items: ['Slyšíš *du(b/p)*.', 'Řekni víc: *duby*.', 'Slyšíš **b**. Píšeš **dub**.'] },
            {
              t: 'w',
              w: 'gap',
              p: {
                items: [
                  { before: 'hra', after: ' (hrady)', options: ['d', 't'], a: 0 },
                  { before: 'le', after: ' (ledy)', options: ['d', 't'], a: 0 },
                  { before: 'ko', after: ' (koše)', options: ['š', 'ž'], a: 0 },
                  { before: 'nů', after: ' (nože)', options: ['š', 'ž'], a: 1 },
                  { before: 'zu', after: ' (zuby)', options: ['b', 'p'], a: 0 },
                  { before: 'ko', after: ' (kosi)', options: ['s', 'z'], a: 0 },
                ],
              },
            },
            { t: 'key', text: 'Více kusů ti napoví: zub – zuby.' },
          ],
        },
      ],
      qs: [
        { t: 'input', q: 'Doplň d/t: hra_ (hrady)', a: ['d'] },
        { t: 'input', q: 'Doplň b/p: hou_ (houby)', a: ['b'] },
        { t: 'input', q: 'Doplň z/s: pe_ (psi)', a: ['s'] },
        { t: 'input', q: 'Doplň ž/š: mu_ (muži)', a: ['ž'] },
        { t: 'choice', q: 'Jak ověříš slovo „zub“?', o: ['zuby', 'zubař', 'zoubek'], a: 0, why: 'Všechny pomohou, ale nejjednodušší je více kusů: zuby.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['chlep', 'chléb'], a: 1, why: 'Chléb – chleba.' },
        { t: 'choice', q: 'Které slovo je napsané správně?', o: ['had', 'hat'], a: 0, why: 'Had – hadi.' },
        { t: 'pair', q: 'Spoj párové souhlásky.', pairs: [['b', 'p'], ['d', 't'], ['z', 's'], ['ž', 'š']] },
        { t: 'tf', q: 'Ve slově „led“ píšeme na konci d.', a: true, why: 'Led – ledy.' },
        { t: 'tf', q: 'Ve slově „kos“ píšeme na konci z.', a: false, why: 'Kos – kosi. Píšeme s.' },
        { t: 'open', q: 'Jak zjistíš, jestli napsat na konci slova d, nebo t?', a: 'Slovo prodloužím, třeba řeknu více kusů: hrad – hrady. Pak slyším, co tam patří.' },
        { t: 'open', q: 'Vyjmenuj párové souhlásky.', a: 'b–p, d–t, ď–ť, z–s, ž–š, v–f, h–ch, g–k.' },
      ],
    },
    {
      id: 'druhy-vet',
      title: 'Druhy vět',
      emoji: '❓',
      ex: [
        {
          title: 'Čtyři tváře',
          blocks: [
            { t: 'table', head: ['věta', 'co dělá', 'na konci'], rows: [['oznamovací 📢', 'něco oznamuje', '.'], ['tázací ❓', 'ptá se', '?'], ['rozkazovací 👉', 'přikazuje, prosí', '! nebo .'], ['přací 🌠', 'něco si přeje', '!']] },
            { t: 'key', text: 'Podle toho, co věta chce, dáš znaménko.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['oznamovací', 'tázací', 'rozkazovací'],
                items: [
                  { text: 'Venku prší.', b: 0 },
                  { text: 'Kde je Ema?', b: 1 },
                  { text: 'Zavři okno!', b: 2 },
                  { text: 'Pes spí.', b: 0 },
                  { text: 'Půjdeš ven?', b: 1 },
                  { text: 'Přines mi míč!', b: 2 },
                ],
              },
            },
            { t: 'example', q: 'Kéž by bylo léto!', a: 'Věta přací – přejeme si.' },
            { t: 'key', text: 'Otázka má vždy otazník.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaká je věta „Kolik je hodin?“', o: ['oznamovací', 'tázací', 'přací'], a: 1 },
        { t: 'choice', q: 'Jaká je věta „Ukliď si pokoj!“', o: ['rozkazovací', 'přací', 'tázací'], a: 0 },
        { t: 'choice', q: 'Jaká je věta „Ať se ti daří!“', o: ['oznamovací', 'přací', 'tázací'], a: 1 },
        { t: 'choice', q: 'Jaká je věta „Babička peče buchty.“', o: ['oznamovací', 'rozkazovací', 'tázací'], a: 0 },
        { t: 'input', q: 'Jaké znaménko patří na konec: „Kdy přijdeš“', a: ['?', 'otazník', 'otaznik'] },
        { t: 'tf', q: 'Tázací věta končí tečkou.', a: false, why: 'Tázací věta končí otazníkem.' },
        { t: 'tf', q: 'Oznamovací věta končí tečkou.', a: true },
        { t: 'pair', q: 'Spoj větu s druhem.', pairs: [['Svítí slunce.', 'oznamovací'], ['Máš hlad?', 'tázací'], ['Sedni si!', 'rozkazovací'], ['Kéž by sněžilo!', 'přací']] },
        { t: 'choice', q: 'Která věta je tázací?', o: ['Jdu domů.', 'Jdeš domů?', 'Jdi domů!'], a: 1 },
        { t: 'choice', q: 'Kterým slovem často začíná věta přací?', o: ['kéž', 'kde', 'proč'], a: 0 },
        { t: 'open', q: 'Jaké znáš druhy vět? Řekni ke každé příklad.', a: 'Oznamovací: Prší. Tázací: Prší? Rozkazovací: Vezmi deštník! Přací: Kéž by nepršelo!' },
        { t: 'open', q: 'Udělej z věty „Pes štěká.“ otázku.', a: 'Štěká pes? (nebo: Proč pes štěká?)' },
      ],
    },
    {
      id: 'slova-nadrazena-podrazena',
      title: 'Slova nadřazená a podřazená',
      emoji: '🌳',
      ex: [
        {
          title: 'Krabice',
          blocks: [
            { t: 'p', text: 'Velká krabice se jmenuje **ovoce** 📦.' },
            { t: 'pic', items: ['🍎', '🍐', '🍌', '🍒'], caption: 'jablko, hruška, banán, třešně' },
            { t: 'list', items: ['*ovoce* = slovo **nadřazené** (krabice)', '*jablko, hruška* = slova **podřazená** (věci v krabici)', '*jablko a hruška* jsou mezi sebou **souřadná**'] },
            { t: 'key', text: 'Nadřazené slovo je společný název.' },
          ],
        },
        {
          title: 'Roztřiď',
          blocks: [
            {
              t: 'w',
              w: 'sort',
              p: {
                buckets: ['zvířata 🐾', 'nábytek 🪑', 'zelenina 🥕'],
                items: [
                  { text: 'pes', b: 0 },
                  { text: 'stůl', b: 1 },
                  { text: 'mrkev', b: 2 },
                  { text: 'kočka', b: 0 },
                  { text: 'židle', b: 1 },
                  { text: 'okurka', b: 2 },
                  { text: 'kůň', b: 0 },
                  { text: 'skříň', b: 1 },
                  { text: 'cibule', b: 2 },
                ],
              },
            },
            { t: 'key', text: 'Podřazená slova patří pod jedno nadřazené.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které slovo je nadřazené ke slovům: růže, tulipán, sedmikráska?', o: ['květiny', 'stromy', 'zahrada'], a: 0 },
        { t: 'choice', q: 'Které slovo je nadřazené ke slovům: auto, vlak, autobus?', o: ['hračky', 'dopravní prostředky', 'silnice'], a: 1 },
        { t: 'choice', q: 'Které slovo NEPATŘÍ k ovoci?', o: ['jablko', 'švestka', 'brambora'], a: 2 },
        { t: 'input', q: 'Nadřazené slovo k: pondělí, úterý, středa', a: ['dny', 'dny v týdnu', 'dny týdne'] },
        { t: 'input', q: 'Nadřazené slovo k: červená, modrá, zelená', a: ['barvy', 'barva'] },
        { t: 'tf', q: 'Slovo „nábytek“ je nadřazené slovu „stůl“.', a: true },
        { t: 'tf', q: 'Slovo „pes“ je nadřazené slovu „zvíře“.', a: false, why: 'Je to naopak: zvíře je nadřazené, pes podřazené.' },
        { t: 'pair', q: 'Spoj podřazené slovo s nadřazeným.', pairs: [['dub', 'strom'], ['kapr', 'ryba'], ['housle', 'hudební nástroj'], ['sýkora', 'pták']] },
        { t: 'choice', q: 'Která slova jsou souřadná?', o: ['pes – kočka', 'zvíře – pes', 'ovoce – jablko'], a: 0, why: 'Pes a kočka jsou na stejné úrovni – obě jsou zvířata.' },
        { t: 'choice', q: 'Které slovo je podřazené slovu „oblečení“?', o: ['bota', 'tričko', 'batoh'], a: 1 },
        { t: 'open', q: 'Co je slovo nadřazené? Řekni příklad.', a: 'Je to společný název pro více věcí. Například zelenina je nadřazené slovo k mrkev, okurka, paprika.' },
        { t: 'open', q: 'Řekni tři slova podřazená ke slovu „hračky“.', a: 'Například panenka, míč, autíčko.' },
      ],
    },
  ],
} satisfies Subject
