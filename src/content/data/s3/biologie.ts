import type { Subject } from '../../types'

export default {
  grade: 's3',
  subject: 'biologie',
  topics: [
    {
      id: 'opora-pohyb',
      title: 'Opěrná a pohybová soustava',
      emoji: '🦴',
      ex: [
        {
          title: 'Sval jako zip',
          blocks: [
            { t: 'p', text: 'Sarkomera je jako **zip**: vlákna **myosinu** chytají vlákna **aktinu** a zasouvají je mezi sebe. Sarkomera se zkrátí, sval se stáhne.' },
            { t: 'steps', items: ['nervový vzruch dorazí na nervosvalovou ploténku', 'uvolní se vápenaté ionty (Ca²⁺)', 'myosin se váže na aktin a táhne ho', 'energii dodává ATP', 'Ca²⁺ se odčerpá – sval se uvolní'] },
            { t: 'key', text: 'Stah = zasouvání aktinu mezi myosin; potřebuje Ca²⁺ a ATP.' },
          ],
        },
        {
          title: 'Kost v řezu',
          blocks: [
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'okostice', back: 'vazivový obal, výživa a růst do šířky' },
              { front: 'osteon', back: 'Haversův systém – lamely kolem kanálku s cévou' },
              { front: 'růstová chrupavka', back: 'růst do délky do dospělosti' },
              { front: 'červená kostní dřeň', back: 'krvetvorba' },
              { front: 'osteoporóza', back: 'úbytek kostní hmoty, řídnutí kostí' },
            ] } },
            { t: 'table', head: ['Spojení kostí', 'Příklad'], rows: [
              ['kloub (pohyblivé)', 'kolenní, ramenní'],
              ['chrupavkou', 'meziobratlové ploténky, spona stydká'],
              ['švem (vazivem)', 'kosti lebky'],
            ] },
            { t: 'key', text: 'Kost = živá tkáň: osteoblasty kost tvoří, osteoklasty odbourávají.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Které ionty spouštějí svalový stah?', o: ['Ca²⁺', 'Na⁺', 'Cl⁻'], a: 0 },
        { t: 'choice', q: 'Kostní buňky, které kost odbourávají, jsou…', o: ['osteoklasty', 'osteoblasty', 'chondrocyty'], a: 0 },
        { t: 'tf', q: 'Kost roste do délky v růstové chrupavce.', a: true },
        { t: 'input', q: 'Základní stavební a funkční jednotka myofibrily je…', a: ['sarkomera', 'sarkomér', 'sarkomer'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['okostice', 'růst do šířky'], ['osteon', 'stavební jednotka kosti'], ['šlacha', 'spojení svalu s kostí'], ['vaz', 'spojení kostí v kloubu']] },
        { t: 'tf', q: 'Kosti lebeční klenby jsou spojeny švy.', a: true },
        { t: 'choice', q: 'Kolik krčních obratlů má člověk?', o: ['7', '12', '5'], a: 0 },
        { t: 'choice', q: 'Svalovina srdce je…', o: ['příčně pruhovaná srdeční', 'hladká', 'kosterní ovladatelná vůlí'], a: 0 },
        { t: 'tf', q: 'Při stahu se zkracují vlákna aktinu a myosinu.', a: false, why: 'Vlákna se nezkracují, jen se zasouvají mezi sebe.' },
        { t: 'choice', q: 'Při nedostatku kyslíku vzniká ve svalu…', o: ['kyselina mléčná (laktát)', 'glykogen', 'močovina'], a: 0 },
        { t: 'open', q: 'Popiš mechanismus svalového stahu.', a: 'Vzruch vyvolá uvolnění Ca²⁺ ze sarkoplazmatického retikula. Myosinové hlavy se navážou na aktin a za spotřeby ATP ho zasouvají – sarkomera se zkrátí.' },
        { t: 'open', q: 'Jak kost roste a obnovuje se?', a: 'Do délky roste v růstových chrupavkách, do šířky z okostice. Osteoblasty kost tvoří, osteoklasty odbourávají, takže se kost stále přestavuje.' },
      ],
    },
    {
      id: 'krev-imunita',
      title: 'Krev a imunita',
      emoji: '🩸',
      ex: [
        {
          title: 'Krevní skupiny',
          blocks: [
            { t: 'table', head: ['Skupina', 'Antigen na krvinkách', 'Protilátky v plazmě'], rows: [
              ['A', 'A', 'anti-B'],
              ['B', 'B', 'anti-A'],
              ['AB', 'A i B', 'žádné'],
              ['0', 'žádný', 'anti-A i anti-B'],
            ] },
            { t: 'example', q: 'Proč nelze dát krev A člověku se skupinou B?', a: 'Jeho protilátky anti-A by shlukly darované krvinky (aglutinace).' },
            { t: 'key', text: '0 Rh− je univerzální dárce erytrocytů, AB Rh+ univerzální příjemce.' },
          ],
        },
        {
          title: 'Armáda těla',
          blocks: [
            { t: 'p', text: '**Nespecifická** imunita = hlídky u brány (kůže, fagocyty, horečka). **Specifická** = speciální jednotky na konkrétního nepřítele (lymfocyty).' },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'B-lymfocyty', back: 'tvoří protilátky' },
              { front: 'T-lymfocyty', back: 'řídí imunitu, ničí napadené buňky' },
              { front: 'makrofágy', back: 'pohlcují mikroby (fagocytóza)' },
              { front: 'aktivní imunizace', back: 'očkování – tělo si tvoří protilátky' },
              { front: 'pasivní imunizace', back: 'hotové protilátky (sérum, mateřské mléko)' },
            ] } },
            { t: 'key', text: 'Paměťové buňky = proč podruhé neonemocníme stejně.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kdo je univerzální dárce erytrocytů?', o: ['0 Rh−', 'AB Rh+', 'A Rh+'], a: 0 },
        { t: 'choice', q: 'Protilátky tvoří…', o: ['B-lymfocyty', 'erytrocyty', 'trombocyty'], a: 0 },
        { t: 'tf', q: 'Skupina AB nemá v plazmě protilátky anti-A ani anti-B.', a: true },
        { t: 'input', q: 'Přibližná životnost červené krvinky ve dnech je…', a: ['120'] },
        { t: 'pair', q: 'Spoj složku krve s funkcí.', pairs: [['hemoglobin', 'přenos O₂'], ['fibrinogen', 'srážení'], ['trombocyty', 'zástava krvácení'], ['neutrofily', 'fagocytóza']] },
        { t: 'tf', q: 'Očkování je pasivní imunizace.', a: false, why: 'Očkování je aktivní imunizace – tělo si samo vytvoří protilátky.' },
        { t: 'choice', q: 'Kde vznikají krvinky dospělého?', o: ['v červené kostní dřeni', 've slezině', 'v ledvinách'], a: 0 },
        { t: 'choice', q: 'Kolik krve má přibližně dospělý člověk?', o: ['5–6 litrů', '1–2 litry', '10–12 litrů'], a: 0 },
        { t: 'tf', q: 'HIV ničí pomocné T-lymfocyty.', a: true },
        { t: 'choice', q: 'Rh-inkompatibilita hrozí, když je…', o: ['matka Rh−, plod Rh+', 'matka Rh+, plod Rh−', 'oba Rh+'], a: 0 },
        { t: 'open', q: 'Jaký je rozdíl mezi nespecifickou a specifickou imunitou?', a: 'Nespecifická je vrozená a působí proti všem patogenům stejně (kůže, fagocyty, zánět). Specifická je získaná, cílí na konkrétní antigen (lymfocyty, protilátky) a má paměť.' },
        { t: 'open', q: 'Vysvětli, jak probíhá srážení krve.', a: 'Při poranění se destičky shluknou a uvolní faktory. Kaskádou vznikne trombin, který mění rozpustný fibrinogen na vláknitý fibrin. Fibrinová síť zachytí krvinky a vytvoří krevní sraženinu.' },
      ],
    },
    {
      id: 'obeh-dychani',
      title: 'Oběhová a dýchací soustava',
      emoji: '🫀',
      ex: [
        {
          title: 'Elektrika srdce',
          blocks: [
            { t: 'p', text: 'Srdce má vlastní **generátor rytmu** – sinoatriální (SA) uzel v pravé síni. Pracuje bez pokynu mozku (automacie).' },
            { t: 'w', w: 'cycle', p: { steps: ['SA uzel vyšle vzruch', 'stah síní', 'AV uzel – krátké zdržení', 'Hisův svazek a Purkyňova vlákna', 'stah komor (systola)', 'ochabnutí (diastola)'] } },
            { t: 'key', text: 'Normální tlak krve asi 120/80 mmHg (systolický/diastolický).' },
          ],
        },
        {
          title: 'Plíce v číslech',
          blocks: [
            { t: 'w', w: 'bars', p: { unit: 'litry', items: [
              { label: 'dechový objem (klid)', value: 0.5 }, { label: 'vitální kapacita', value: 4.5 }, { label: 'reziduální objem', value: 1.2 }, { label: 'celková kapacita plic', value: 5.7 },
            ] } },
            { t: 'p', text: 'Výměna plynů v plicních sklípcích probíhá **difúzí** – z místa vyšší koncentrace do nižší. Dýchání řídí prodloužená mícha podle hladiny **CO₂** v krvi.' },
            { t: 'key', text: 'Hlavním podnětem k nádechu je zvýšený CO₂, ne nedostatek O₂.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kde vzniká vzruch udávající srdeční rytmus?', o: ['v SA uzlu', 'v AV uzlu', 'v mozku'], a: 0 },
        { t: 'choice', q: 'Stah komor se nazývá…', o: ['systola', 'diastola', 'fibrilace'], a: 0 },
        { t: 'tf', q: 'Plicní žíly vedou okysličenou krev.', a: true },
        { t: 'input', q: 'Centrum dýchání je v prodloužené…', a: ['míše', 'mise', 'mícha'] },
        { t: 'order', q: 'Seřaď převodní systém srdce.', items: ['SA uzel', 'AV uzel', 'Hisův svazek', 'Purkyňova vlákna'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['EKG', 'záznam elektrické aktivity srdce'], ['vitální kapacita', 'max. výdech po max. nádechu'], ['hypertenze', 'vysoký krevní tlak'], ['infarkt', 'odumření části srdečního svalu']] },
        { t: 'tf', q: 'Hlavním podnětem pro dýchací centrum je zvýšená koncentrace CO₂.', a: true },
        { t: 'choice', q: 'Chlopně mezi levou síní a komorou se nazývají…', o: ['dvojcípá (mitrální)', 'trojcípá', 'poloměsíčitá'], a: 0 },
        { t: 'choice', q: 'Plyny se v plicních sklípcích vyměňují…', o: ['difúzí', 'aktivním transportem', 'filtrací'], a: 0 },
        { t: 'tf', q: 'Srdce potřebuje k činnosti stálé impulzy z mozku.', a: false, why: 'Srdce má automacii, nervy jen upravují frekvenci.' },
        { t: 'open', q: 'Popiš převodní systém srdce.', a: 'Vzruch vzniká v SA uzlu v pravé síni a šíří se síněmi. V AV uzlu se zdrží, pak jde Hisovým svazkem, Tawarovými raménky a Purkyňovými vlákny do svaloviny komor, které se stáhnou.' },
        { t: 'open', q: 'Jak je řízeno dýchání?', a: 'Dýchací centrum v prodloužené míše reaguje hlavně na koncentraci CO₂ (a pH) v krvi. Při zvýšení CO₂ se dýchání zrychlí a prohloubí. Částečně ho lze ovlivnit i vůlí.' },
      ],
    },
    {
      id: 'traveni-vylucovani',
      title: 'Trávení a vylučování',
      emoji: '🧪',
      ex: [
        {
          title: 'Enzymy',
          blocks: [
            { t: 'table', head: ['Enzym', 'Kde', 'Štěpí'], rows: [
              ['slinná amyláza', 'ústa', 'škrob'],
              ['pepsin', 'žaludek', 'bílkoviny'],
              ['trypsin', 'slinivka → dvanáctník', 'bílkoviny'],
              ['lipáza', 'slinivka → dvanáctník', 'tuky'],
              ['žluč (není enzym)', 'játra → dvanáctník', 'emulguje tuky'],
            ] },
            { t: 'key', text: 'Vstřebávání: tenké střevo – klky a mikroklky zvětšují povrch.' },
          ],
        },
        {
          title: 'Nefron jako síto',
          blocks: [
            { t: 'p', text: 'Nefron je **síto + třídírna**. V klubíčku (glomerulu) se krev přefiltruje, v kanálcích se zpět vstřebá vše užitečné.' },
            { t: 'w', w: 'bars', p: { unit: 'litrů za den', items: [
              { label: 'primární moč', value: 170 }, { label: 'definitivní moč', value: 1.5 },
            ] } },
            { t: 'steps', items: ['glomerulus – filtrace, vzniká primární moč', 'proximální kanálek – zpětné vstřebání glukózy, iontů, vody', 'Henleova klička – zahušťování', 'sběrný kanálek – ADH řídí vstřebání vody'] },
            { t: 'key', text: 'Z asi 170 l primární moči zbude asi 1,5 l definitivní.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který enzym štěpí bílkoviny v žaludku?', o: ['pepsin', 'amyláza', 'lipáza'], a: 0 },
        { t: 'tf', q: 'Žluč je trávicí enzym.', a: false, why: 'Žluč neobsahuje enzymy, tuky jen emulguje.' },
        { t: 'input', q: 'Funkční jednotka ledviny je…', a: ['nefron'] },
        { t: 'choice', q: 'Kolik primární moči se vytvoří za den?', o: ['asi 170 l', 'asi 1,5 l', 'asi 17 l'], a: 0 },
        { t: 'pair', q: 'Spoj orgán s funkcí.', pairs: [['játra', 'tvorba žluči, detoxikace'], ['slinivka', 'trávicí enzymy a inzulin'], ['tlusté střevo', 'vstřebávání vody'], ['glomerulus', 'filtrace krve']] },
        { t: 'choice', q: 'Hormon ADH…', o: ['zvyšuje zpětné vstřebávání vody', 'zvyšuje tvorbu moči', 'štěpí tuky'], a: 0 },
        { t: 'tf', q: 'Zásobní forma glukózy v játrech je glykogen.', a: true },
        { t: 'choice', q: 'Konečný produkt rozkladu bílkovin vylučovaný močí je hlavně…', o: ['močovina', 'glukóza', 'glykogen'], a: 0 },
        { t: 'tf', q: 'Ve zdravé definitivní moči se běžně vyskytuje glukóza.', a: false, why: 'Glukóza se zpětně vstřebá. V moči se objevuje např. při cukrovce.' },
        { t: 'choice', q: 'Povrch tenkého střeva zvětšují…', o: ['klky a mikroklky', 'řasy', 'zuby'], a: 0 },
        { t: 'open', q: 'Popiš trávení tuků.', a: 'Žluč z jater tuky v dvanáctníku emulguje na drobné kapénky. Pankreatická lipáza je štěpí na glycerol a mastné kyseliny, které se vstřebají v tenkém střevě do mízy.' },
        { t: 'open', q: 'Jak vzniká moč v nefronu?', a: 'V glomerulu se z krve filtruje primární moč. V kanálcích se zpětně vstřebává glukóza, ionty a většina vody, část látek se vylučuje. Ve sběrném kanálku vzniká definitivní moč.' },
      ],
    },
    {
      id: 'nervy-hormony',
      title: 'Nervová a hormonální soustava, smysly',
      emoji: '🧠',
      ex: [
        {
          title: 'Vzruch jako dominové kostky',
          blocks: [
            { t: 'p', text: 'Akční potenciál běží po axonu jako **padající domino** – každé místo membrány „převrhne“ to další.' },
            { t: 'steps', items: ['klidový potenciál asi −70 mV', 'podnět otevře sodíkové kanály – Na⁺ dovnitř (depolarizace)', 'draslíkové kanály – K⁺ ven (repolarizace)', 'na synapsi se uvolní neurotransmiter (např. acetylcholin)', 'ten vyvolá vzruch na další buňce'] },
            { t: 'key', text: 'Myelinová pochva vedení vzruchu mnohonásobně zrychluje.' },
          ],
        },
        {
          title: 'Žlázy a smysly',
          blocks: [
            { t: 'table', head: ['Žláza', 'Hormon', 'Účinek'], rows: [
              ['hypofýza', 'růstový hormon, TSH, FSH, LH', 'řídí jiné žlázy, růst'],
              ['štítná žláza', 'tyroxin (s jódem)', 'metabolismus'],
              ['slinivka', 'inzulin / glukagon', 'snižuje / zvyšuje glykémii'],
              ['nadledviny', 'adrenalin, kortizol', 'stres'],
            ] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'tyčinky', back: 'vidění za šera, černobíle' },
              { front: 'čípky', back: 'barevné vidění, hlavně ve žluté skvrně' },
              { front: 'slepá skvrna', back: 'výstup zrakového nervu, bez receptorů' },
              { front: 'krátkozrakost', back: 'obraz před sítnicí – rozptylky' },
              { front: 'Cortiho orgán', back: 'sluchové receptory v hlemýždi' },
            ] } },
            { t: 'key', text: 'Hypotalamus + hypofýza = propojení nervového a hormonálního řízení.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký je přibližně klidový membránový potenciál neuronu?', o: ['−70 mV', '+70 mV', '0 mV'], a: 0 },
        { t: 'choice', q: 'Depolarizaci způsobuje vstup iontů…', o: ['Na⁺', 'K⁺', 'Cl⁻'], a: 0 },
        { t: 'tf', q: 'Inzulin zvyšuje hladinu glukózy v krvi.', a: false, why: 'Inzulin ji snižuje, glukagon zvyšuje.' },
        { t: 'input', q: 'Prvek nezbytný pro tvorbu tyroxinu je…', a: ['jód', 'jod'] },
        { t: 'pair', q: 'Spoj část mozku s funkcí.', pairs: [['mozeček', 'koordinace pohybu'], ['prodloužená mícha', 'dýchání a srdce'], ['hypotalamus', 'termoregulace, hlad'], ['mozková kůra', 'vědomí, myšlení']] },
        { t: 'choice', q: 'Barevné vidění zajišťují…', o: ['čípky', 'tyčinky', 'gangliové buňky'], a: 0 },
        { t: 'tf', q: 'Krátkozrakost se koriguje rozptylkami.', a: true },
        { t: 'choice', q: 'Spojení dvou neuronů se nazývá…', o: ['synapse', 'axon', 'dendrit'], a: 0 },
        { t: 'choice', q: 'Rovnovážné ústrojí je uloženo…', o: ['ve vnitřním uchu', 've středním uchu', 'v mozečku'], a: 0 },
        { t: 'tf', q: 'Sympatikus připravuje tělo na zátěž (zrychlí srdce).', a: true },
        { t: 'open', q: 'Jak vzniká a šíří se akční potenciál?', a: 'Podnět otevře sodíkové kanály, Na⁺ vtéká do buňky a membrána se depolarizuje. Pak K⁺ vytéká a membrána se repolarizuje. Změna se šíří po axonu, u myelinizovaných skokově mezi Ranvierovými zářezy.' },
        { t: 'open', q: 'Jak se udržuje stálá hladina glukózy v krvi?', a: 'Po jídle slinivka uvolní inzulin, který snižuje glykémii (ukládání do glykogenu). Při poklesu uvolní glukagon, který glykogen štěpí a glykémii zvyšuje.' },
      ],
    },
    {
      id: 'rozmnozovani-ontogeneze',
      title: 'Rozmnožování a vývoj člověka',
      emoji: '🤰',
      ex: [
        {
          title: 'Menstruační cyklus',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['menstruace (1.–5. den)', 'FSH – zrání folikulu, estrogeny', 'LH – ovulace (asi 14. den)', 'žluté tělísko – progesteron', 'bez oplození pokles hormonů'] } },
            { t: 'key', text: 'Ovulaci spouští vrchol LH. Progesteron udržuje sliznici dělohy.' },
          ],
        },
        {
          title: 'Od zygoty k porodu',
          blocks: [
            { t: 'table', head: ['Období', 'Co se děje'], rows: [
              ['1. týden', 'rýhování, blastocysta, uhnízdění (nidace)'],
              ['do 8. týdne', 'embryo – zakládají se orgány'],
              ['od 9. týdne', 'plod (fetus) – růst a zrání'],
              ['asi 40. týden', 'porod'],
            ] },
            { t: 'p', text: 'Těhotenský test prokazuje hormon **hCG** z placenty.' },
            { t: 'key', text: 'Nejcitlivější na škodliviny (alkohol, léky) je embryonální období.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Který hormon spouští ovulaci?', o: ['LH', 'FSH', 'inzulin'], a: 0 },
        { t: 'choice', q: 'Kdy se z embrya stává plod?', o: ['od 9. týdne', 'od 2. týdne', 'od 30. týdne'], a: 0 },
        { t: 'tf', q: 'Těhotenský test prokazuje hormon hCG.', a: true },
        { t: 'input', q: 'Uhnízdění blastocysty v děložní sliznici se nazývá…', a: ['nidace', 'implantace'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['spermatogeneze', 'tvorba spermií'], ['oogeneze', 'tvorba vajíček'], ['žluté tělísko', 'progesteron'], ['placenta', 'výživa plodu']] },
        { t: 'tf', q: 'K oplození dochází obvykle ve vejcovodu.', a: true },
        { t: 'choice', q: 'Kde dozrávají spermie?', o: ['v nadvarleti', 'v prostatě', 'v močovém měchýři'], a: 0 },
        { t: 'tf', q: 'Jednovaječná dvojčata jsou geneticky shodná.', a: true },
        { t: 'choice', q: 'Kolik spermií oplodní vajíčko?', o: ['jedna', 'dvě', 'tisíce'], a: 0 },
        { t: 'choice', q: 'Který hormon tvoří varlata?', o: ['testosteron', 'progesteron', 'prolaktin'], a: 0 },
        { t: 'open', q: 'Popiš hormonální řízení menstruačního cyklu.', a: 'FSH z hypofýzy podporuje zrání folikulu, který tvoří estrogeny. Vrchol LH vyvolá ovulaci. Ze zbytku folikulu vznikne žluté tělísko tvořící progesteron. Bez oplození zaniká, hormony klesnou a nastane menstruace.' },
        { t: 'open', q: 'Proč je embryonální období nejcitlivější?', a: 'Zakládají se všechny orgány. Škodliviny (alkohol, některé léky, infekce, záření) mohou způsobit vrozené vady.' },
      ],
    },
    {
      id: 'molekularni-genetika',
      title: 'Molekulární genetika',
      emoji: '🧬',
      ex: [
        {
          title: 'Od genu k bílkovině',
          blocks: [
            { t: 'steps', items: ['**replikace** – DNA se zkopíruje (semikonzervativně)', '**transkripce** – v jádře se podle DNA vytvoří mRNA', '**úprava mRNA** – vystřižení intronů', '**translace** – na ribozomu se podle kodonů skládá bílkovina'] },
            { t: 'example', q: 'Úsek DNA (templátové vlákno) TAC. Jaký je kodon mRNA?', a: 'AUG – start kodon pro methionin.' },
            { t: 'key', text: 'DNA → RNA → bílkovina (centrální dogma).' },
          ],
        },
        {
          title: 'DNA vs. RNA',
          blocks: [
            { t: 'table', head: ['', 'DNA', 'RNA'], rows: [
              ['cukr', 'deoxyribóza', 'ribóza'],
              ['báze', 'A, T, G, C', 'A, U, G, C'],
              ['řetězce', 'dvoušroubovice', 'obvykle jeden'],
              ['párování', 'A–T, G–C', 'A–U, G–C'],
            ] },
            { t: 'w', w: 'gap', p: { items: [
              { before: 'DNA: A – ', after: '', options: ['T', 'U', 'G'], a: 0 },
              { before: 'RNA: A – ', after: '', options: ['T', 'U', 'C'], a: 1 },
              { before: 'G – ', after: '', options: ['A', 'C', 'T'], a: 1 },
            ] } },
            { t: 'key', text: 'Kodon = 3 nukleotidy. 64 kodonů kóduje 20 aminokyselin + stop.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Která báze je jen v RNA?', o: ['uracil', 'thymin', 'adenin'], a: 0 },
        { t: 'choice', q: 'Kde probíhá translace?', o: ['na ribozomech', 'v jádře', 'v lyzozomu'], a: 0 },
        { t: 'input', q: 'Kolik nukleotidů tvoří jeden kodon?', a: ['3', 'tři', 'tri'] },
        { t: 'tf', q: 'Replikace DNA je semikonzervativní.', a: true, why: 'Každá nová molekula má jedno původní a jedno nové vlákno.' },
        { t: 'order', q: 'Seřaď tok genetické informace.', items: ['DNA', 'transkripce', 'mRNA', 'translace', 'bílkovina'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['intron', 'nekódující úsek'], ['exon', 'kódující úsek'], ['tRNA', 'přináší aminokyseliny'], ['AUG', 'start kodon']] },
        { t: 'choice', q: 'Model dvoušroubovice DNA popsali v roce 1953…', o: ['Watson a Crick', 'Mendel a Darwin', 'Pasteur a Koch'], a: 0 },
        { t: 'tf', q: 'Genetický kód je degenerovaný – jednu aminokyselinu může kódovat více kodonů.', a: true },
        { t: 'choice', q: 'Downův syndrom je…', o: ['trizomie 21. chromozomu', 'bodová mutace', 'chybění chromozomu X'], a: 0 },
        { t: 'choice', q: 'Kolik aminokyselin standardně kóduje genetický kód?', o: ['20', '64', '4'], a: 0 },
        { t: 'open', q: 'Popiš proteosyntézu.', a: 'Při transkripci se v jádře podle DNA vytvoří mRNA, která se upraví a přejde do cytoplazmy. Při translaci na ribozomu tRNA přinášejí aminokyseliny podle kodonů mRNA a vzniká polypeptid.' },
        { t: 'open', q: 'Jaké druhy mutací rozlišujeme?', a: 'Genové (bodové – změna nukleotidů), chromozomové (změna stavby chromozomu – delece, duplikace, translokace) a genomové (změna počtu chromozomů – např. trizomie).' },
      ],
    },
    {
      id: 'mendelovska-genetika',
      title: 'Mendelovská dědičnost',
      emoji: '🫛',
      ex: [
        {
          title: 'Kombinační čtverec',
          blocks: [
            { t: 'p', text: 'Hrách: žlutá semena **A** dominantní nad zelenými **a**. Kříženci F1 jsou **Aa**. Kříženci F1 × F1:' },
            { t: 'table', head: ['', 'A', 'a'], rows: [
              ['A', 'AA', 'Aa'],
              ['a', 'Aa', 'aa'],
            ] },
            { t: 'w', w: 'bars', p: { unit: 'podíl ze 4', items: [
              { label: 'AA', value: 1 }, { label: 'Aa', value: 2 }, { label: 'aa', value: 1 },
            ] } },
            { t: 'key', text: 'F2 monohybrid: genotyp 1 : 2 : 1, fenotyp 3 : 1.' },
          ],
        },
        {
          title: 'Mendelovy zákony',
          blocks: [
            { t: 'list', items: ['**1. zákon** – uniformita F1: kříženci dvou homozygotů jsou stejní', '**2. zákon** – štěpení v F2 v poměru 3 : 1', '**3. zákon** – volná kombinovatelnost alel různých genů: dihybrid 9 : 3 : 3 : 1'] },
            { t: 'w', w: 'flip', p: { cards: [
              { front: 'neúplná dominance', back: 'heterozygot má přechodný fenotyp (růžová nocenka)' },
              { front: 'kodominance', back: 'projeví se obě alely (krevní skupina AB)' },
              { front: 'gonosomální dědičnost', back: 'gen na X – hemofilie, daltonismus' },
              { front: 'zpětné křížení', back: 's recesivním homozygotem aa – zjistí genotyp' },
            ] } },
            { t: 'key', text: 'Choroby vázané na X postihují častěji muže (mají jen jeden X).' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Jaký je fenotypový štěpný poměr v F2 u monohybridu s úplnou dominancí?', o: ['3 : 1', '1 : 2 : 1', '9 : 3 : 3 : 1'], a: 0 },
        { t: 'choice', q: 'Jaký je štěpný poměr dihybridu v F2?', o: ['9 : 3 : 3 : 1', '3 : 1', '1 : 1'], a: 0 },
        { t: 'input', q: 'Kolik procent potomků bude aa při křížení Aa × aa?', a: ['50', '50 %'] },
        { t: 'tf', q: 'Heterozygot má dvě různé alely daného genu.', a: true },
        { t: 'pair', q: 'Spoj typ dědičnosti s příkladem.', pairs: [['kodominance', 'krevní skupina AB'], ['neúplná dominance', 'růžová nocenka'], ['vazba na X', 'hemofilie'], ['úplná dominance', 'žlutá semena hrachu']] },
        { t: 'choice', q: 'Matka přenašečka daltonismu (XᴰXᵈ) a zdravý otec. Jaká je šance, že syn bude daltonik?', o: ['50 %', '25 %', '100 %'], a: 0 },
        { t: 'tf', q: 'Otec předává chromozom X svým synům.', a: false, why: 'Synům předává Y, chromozom X dostávají od otce dcery.' },
        { t: 'choice', q: 'Rodiče A0 × B0 mohou mít dítě se skupinou…', o: ['A, B, AB i 0', 'jen AB', 'jen A nebo B'], a: 0 },
        { t: 'choice', q: 'Zpětné křížení se provádí s…', o: ['recesivním homozygotem', 'dominantním homozygotem', 'heterozygotem'], a: 0 },
        { t: 'tf', q: 'Mendel publikoval své výsledky v roce 1866 v Brně.', a: true },
        { t: 'open', q: 'Formuluj Mendelovy zákony.', a: '1. Uniformita F1 – potomci dvou homozygotů jsou stejní. 2. V F2 dochází ke štěpení (fenotyp 3 : 1, genotyp 1 : 2 : 1). 3. Alely různých genů se kombinují nezávisle (dihybrid 9 : 3 : 3 : 1).' },
        { t: 'open', q: 'Proč trpí hemofilií častěji muži než ženy?', a: 'Gen je recesivní a leží na chromozomu X. Muž má jen jeden X, takže se projeví hned. Žena potřebuje dvě recesivní alely, s jednou je jen přenašečka.' },
      ],
    },
    {
      id: 'evoluce',
      title: 'Evoluce',
      emoji: '🐒',
      ex: [
        {
          title: 'Přirozený výběr',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['proměnlivost jedinců', 'nadprodukce potomků', 'boj o přežití', 'přežijí a rozmnoží se lépe přizpůsobení', 'změna četnosti alel v populaci'] } },
            { t: 'example', q: 'Proč přibývá bakterií odolných na antibiotika?', a: 'Antibiotikum zabije citlivé bakterie. Odolné přežijí a množí se – to je přirozený výběr.' },
            { t: 'key', text: 'Charles Darwin, *O vzniku druhů* (1859).' },
          ],
        },
        {
          title: 'Důkazy a člověk',
          blocks: [
            { t: 'w', w: 'sort', p: { buckets: ['Homologie (společný původ)', 'Analogie (stejná funkce)'], items: [
              { text: 'ruka člověka a křídlo netopýra', b: 0 }, { text: 'křídlo ptáka a křídlo motýla', b: 1 },
              { text: 'ploutev velryby a přední noha koně', b: 0 }, { text: 'oko chobotnice a oko člověka', b: 1 },
              { text: 'tvar těla žraloka a delfína', b: 1 },
            ] } },
            { t: 'w', w: 'bars', p: { unit: 'milionů let zpět', items: [
              { label: 'Australopithecus (Lucy)', value: 3.2 }, { label: 'Homo habilis', value: 2.4 }, { label: 'Homo erectus', value: 1.9 },
              { label: 'neandertálec', value: 0.4 }, { label: 'Homo sapiens', value: 0.3 },
            ] } },
            { t: 'key', text: 'Člověk a šimpanz mají společného předka – člověk nevznikl ze šimpanze.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Autor teorie přirozeného výběru je…', o: ['Charles Darwin', 'Jean-Baptiste Lamarck', 'Gregor Mendel'], a: 0 },
        { t: 'choice', q: 'Křídlo ptáka a motýla jsou orgány…', o: ['analogické', 'homologické', 'rudimentární'], a: 0 },
        { t: 'tf', q: 'Člověk se vyvinul ze šimpanze.', a: false, why: 'Mají společného předka, šimpanz je naším „bratrancem“.' },
        { t: 'input', q: 'Zakrnělý orgán bez původní funkce (např. kostrč) je…', a: ['rudiment', 'rudimentární orgán'] },
        { t: 'pair', q: 'Spoj pojem s významem.', pairs: [['speciace', 'vznik nového druhu'], ['adaptace', 'přizpůsobení'], ['homologie', 'společný původ'], ['genový drift', 'náhodná změna četnosti alel']] },
        { t: 'order', q: 'Seřaď zástupce od nejstaršího.', items: ['Australopithecus', 'Homo habilis', 'Homo erectus', 'Homo sapiens'] },
        { t: 'choice', q: 'Kde vznikl Homo sapiens?', o: ['v Africe', 'v Evropě', 'v Austrálii'], a: 0 },
        { t: 'tf', q: 'Lamarck předpokládal dědičnost získaných vlastností.', a: true },
        { t: 'choice', q: 'Vznik druhu po geografickém oddělení populací je speciace…', o: ['alopatrická', 'sympatrická', 'umělá'], a: 0 },
        { t: 'tf', q: 'Neandertálci se částečně křížili s Homo sapiens.', a: true, why: 'Lidé mimo Afriku mají v genomu asi 1–2 % neandertálské DNA.' },
        { t: 'open', q: 'Vysvětli princip přirozeného výběru.', a: 'Jedinci se liší, rodí se jich víc, než může přežít. Lépe přizpůsobení přežijí a mají víc potomků, a tak se v populaci šíří jejich výhodné vlastnosti.' },
        { t: 'open', q: 'Uveď důkazy evoluce.', a: 'Fosilní záznam a přechodné formy, homologické orgány a rudimenty, podobnost embryí, molekulární podobnost DNA a bílkovin, biogeografie, pozorovaná evoluce (rezistence bakterií).' },
      ],
    },
    {
      id: 'ekologie',
      title: 'Ekologie',
      emoji: '🌎',
      ex: [
        {
          title: 'Pyramida energie',
          blocks: [
            { t: 'p', text: 'Na vyšší potravní úroveň přejde jen asi **10 %** energie. Zbytek se ztratí hlavně jako teplo.' },
            { t: 'w', w: 'bars', p: { unit: 'kJ', items: [
              { label: 'producenti', value: 10000 }, { label: 'býložravci', value: 1000 }, { label: 'masožravci I.', value: 100 }, { label: 'masožravci II.', value: 10 },
            ] } },
            { t: 'key', text: 'Proto bývají potravní řetězce krátké (4–5 článků).' },
          ],
        },
        {
          title: 'Koloběh dusíku',
          blocks: [
            { t: 'w', w: 'cycle', p: { steps: ['N₂ ve vzduchu', 'fixace (hlízkové bakterie, sinice)', 'amonné ionty → nitrifikace na dusičnany', 'příjem rostlinami, bílkoviny', 'amonifikace odumřelé hmoty', 'denitrifikace zpět na N₂'] } },
            { t: 'table', head: ['Stratégie', 'r', 'K'], rows: [
              ['potomků', 'mnoho', 'málo'],
              ['péče', 'žádná', 'velká'],
              ['příklad', 'myš, hmyz', 'slon, člověk'],
            ] },
            { t: 'key', text: 'Úživnost prostředí (K) omezuje růst populace – logistická křivka.' },
          ],
        },
      ],
      qs: [
        { t: 'choice', q: 'Kolik energie přibližně přejde na vyšší trofickou úroveň?', o: ['10 %', '50 %', '90 %'], a: 0 },
        { t: 'choice', q: 'Přeměna amonných iontů na dusičnany je…', o: ['nitrifikace', 'denitrifikace', 'fixace'], a: 0 },
        { t: 'tf', q: 'Slon je typický r-stratég.', a: false, why: 'Slon má málo potomků s velkou péčí – K-stratég.' },
        { t: 'input', q: 'Postupná změna společenstva na stanovišti v čase se nazývá…', a: ['sukcese'] },
        { t: 'pair', q: 'Spoj vztah s příkladem.', pairs: [['mutualismus', 'mykorhiza'], ['komenzálismus', 'štítovec u žraloka'], ['parazitismus', 'tasemnice'], ['predace', 'rys a srnec']] },
        { t: 'choice', q: 'Konečné stadium sukcese je…', o: ['klimax', 'pionýrské stadium', 'eutrofizace'], a: 0 },
        { t: 'tf', q: 'Eutrofizace je obohacení vod živinami, které vede k přemnožení řas a sinic.', a: true },
        { t: 'choice', q: 'Logistická křivka růstu populace se ustálí na…', o: ['kapacitě prostředí K', 'nule', 'nekonečnu'], a: 0 },
        { t: 'choice', q: 'Který biom má nejvyšší biodiverzitu?', o: ['tropický deštný les', 'tundra', 'poušť'], a: 0 },
        { t: 'tf', q: 'Abiotickými faktory jsou například teplota, světlo a pH.', a: true },
        { t: 'open', q: 'Popiš koloběh dusíku.', a: 'Vzdušný N₂ fixují bakterie (hlízkové, sinice). Amonné ionty nitrifikační bakterie mění na dusičnany, které přijímají rostliny. Z odumřelé hmoty vzniká amoniak (amonifikace). Denitrifikace vrací N₂ do atmosféry.' },
        { t: 'open', q: 'Porovnej r- a K-strategii.', a: 'r-stratégové mají hodně potomků bez péče, krátký život a rychle osidlují nová místa. K-stratégové mají málo potomků s velkou péčí, dlouhý život a populaci blízko kapacity prostředí.' },
      ],
    },
  ],
} satisfies Subject
