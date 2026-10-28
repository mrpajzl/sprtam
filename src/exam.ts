import type { SubjectId } from './content/types'

// Příprava na přijímačky na SŠ (/prijimacky): the two tests of the jednotná přijímací zkouška (CERMAT)
// split into the areas they ask about, each pointing at topics of the app (<grade>/<subject>/<id>, any grade).
// A map of the existing content like the curriculum (curriculum.ts), not content of its own: topics,
// explanations and questions stay in the content service. check.ts makes sure every topic exists.

export interface ExamArea {
  /** In the address (/prijimacky/matematika/<id>); never "test". */
  id: string
  title: string
  emoji: string
  /** What the tests ask about here (inline markup). */
  about: string
  topics: string[]
}

export interface ExamPart {
  s: SubjectId
  title: string
  minutes: number
  points: number
  about: string[]
  areas: ExamArea[]
}

export const EXAM = {
  id: 'prijimacky',
  name: 'Přijímačky na SŠ',
  emoji: '🎓',
  hint: 'čeština a matematika po 9. třídě',
  about: [
    'Na většinu oborů s maturitou se dělá **jednotná přijímací zkouška**: písemný test z **češtiny** a z **matematiky**. Testy připravuje CERMAT a na všech školách jsou stejné.',
    'Každý test je za **50 bodů**. Čeština trvá **60 minut**, matematika **70 minut**. Zkouška má dva termíny v dubnu a z každého testu se ti počítá lepší výsledek.',
    'Testy jsou z učiva celé základní školy. Projdi si oblasti, na které se ptají, procvič, co ti nejde, a nakonec si zkus **cvičný test** z celého předmětu. Opravdová zadání z minulých let jsou na prijimacky.cermat.cz.',
  ],
  parts: [
    {
      s: 'matematika',
      title: 'Matematika',
      minutes: 70,
      points: 50,
      about: [
        'Počítá se **bez kalkulačky** a bez tabulek. Vezmi si propisku, tužku a rýsovací potřeby: pravítko, trojúhelník s ryskou a kružítko.',
        'U části úloh vybíráš z možností nebo přiřazuješ, u jiných píšeš výsledek. Ve slovních a konstrukčních úlohách se boduje i **postup**, tak ho piš celý.',
      ],
      areas: [
        { id: 'cisla', title: 'Čísla a dělitelnost', emoji: '🔢', about: 'Desetinná a celá čísla, pořadí operací, násobky a dělitelé, nejmenší společný násobek a největší společný dělitel.', topics: ['z6/matematika/desetinna-cisla', 'z6/matematika/desetinna-cisla-pocitani', 'z7/matematika/cela-cisla', 'z6/matematika/nasobek-delitel', 'z6/matematika/prvocisla', 'z6/matematika/nsd-nsn'] },
        { id: 'zlomky', title: 'Zlomky', emoji: '🍕', about: 'Krácení a rozšiřování, sčítání, odčítání, násobení a dělení zlomků, smíšená čísla a složené zlomky.', topics: ['z7/matematika/zlomky-zaklad', 'z7/matematika/zlomky-scitani', 'z7/matematika/zlomky-nasobeni'] },
        { id: 'mocniny', title: 'Mocniny a odmocniny', emoji: '⚡', about: 'Druhá mocnina a odmocnina, počítání s mocninami a zápis velkých a malých čísel.', topics: ['z8/matematika/druha-mocnina-odmocnina', 'z8/matematika/mocniny-exponent'] },
        { id: 'vyrazy', title: 'Výrazy', emoji: '🧮', about: 'Dosazování do výrazů, sčítání a násobení mnohočlenů, vytýkání, vzorce a lomené výrazy.', topics: ['z8/matematika/vyrazy', 'z8/matematika/mnohocleny', 'z9/matematika/lomene-vyrazy'] },
        { id: 'rovnice', title: 'Rovnice a slovní úlohy', emoji: '⚖️', about: 'Lineární rovnice, rovnice s neznámou ve jmenovateli a soustavy dvou rovnic. Slovní úlohu přepiš do rovnice a výsledek ověř.', topics: ['z8/matematika/linearni-rovnice', 'z9/matematika/rovnice-neznama-ve-jmenovateli', 'z9/matematika/soustavy-rovnic'] },
        { id: 'pomer-procenta', title: 'Poměr, úměrnost a procenta', emoji: '💯', about: 'Poměr a měřítko mapy, přímá a nepřímá úměrnost, procenta, sleva, zdražení a úrok.', topics: ['z7/matematika/pomer', 'z7/matematika/umernost', 'z9/matematika/neprima-umernost-funkce', 'z7/matematika/procenta', 'z9/matematika/financni-matematika'] },
        { id: 'jednotky', title: 'Jednotky', emoji: '📏', about: 'Převody jednotek délky, obsahu, objemu, hmotnosti a času.', topics: ['z6/matematika/prevody-jednotek', 'z6/matematika/objem-a-jednotky'] },
        { id: 'data-funkce', title: 'Tabulky, grafy a funkce', emoji: '📈', about: 'Čtení údajů z tabulek a grafů, průměr, lineární funkce a její graf.', topics: ['z8/matematika/statistika', 'z9/matematika/linearni-funkce'] },
        { id: 'rovina', title: 'Geometrie v rovině', emoji: '📐', about: 'Úhly, trojúhelníky, čtyřúhelníky, kruh a kružnice, Pythagorova věta, obvody, obsahy a podobnost.', topics: ['z6/matematika/uhel', 'z6/matematika/trojuhelnik', 'z7/matematika/rovnobezniky-lichobeznik', 'z8/matematika/kruh-kruznice', 'z8/matematika/pythagorova-veta', 'z9/matematika/podobnost'] },
        { id: 'konstrukce', title: 'Konstrukční úlohy', emoji: '🧭', about: 'Konstrukce trojúhelníků a čtyřúhelníků s rozborem a postupem, osová a středová souměrnost. V testu rýsuješ, tady si procvičíš, jak na to.', topics: ['z8/matematika/konstrukcni-ulohy', 'z6/matematika/osova-soumernost', 'z7/matematika/stredova-soumernost'] },
        { id: 'telesa', title: 'Tělesa', emoji: '🧊', about: 'Objem a povrch krychle, kvádru, hranolu, válce, jehlanu, kužele a koule.', topics: ['z6/matematika/krychle-kvadr', 'z7/matematika/hranoly', 'z8/matematika/valec', 'z9/matematika/jehlan-kuzel', 'z9/matematika/koule'] },
      ],
    },
    {
      s: 'cestina',
      title: 'Čeština a literatura',
      minutes: 60,
      points: 50,
      about: [
        'Většina úloh je nad **ukázkami textů**: článkem, básní, úryvkem z knihy. Nejdřív čti pozorně zadání, často se ptá na jedno konkrétní slovo nebo větu.',
        'U části úloh vybíráš z možností, u jiných píšeš krátkou odpověď nebo opravuješ chybu. Když odpověď píšeš sám, hlídej i její pravopis.',
      ],
      areas: [
        { id: 'pravopis', title: 'Pravopis', emoji: '✍️', about: 'Shoda přísudku s podmětem, mě/mně, bě/bje, předpony s-, z-, vz-, velká písmena a vyjmenovaná slova.', topics: ['z9/cestina/prijimacky-pravopis', 'z6/cestina/shoda-prisudku', 'z5/cestina/be-bje-ve-vje-me-mne', 'z6/cestina/predpony-s-z-vz'] },
        { id: 'interpunkce', title: 'Čárky a přímá řeč', emoji: '❗', about: 'Čárka v souvětí, u vložené věty, přístavku a oslovení, interpunkce v přímé řeči.', topics: ['z8/cestina/interpunkce', 'z9/cestina/interpunkce-prima-rec'] },
        { id: 'tvaroslovi', title: 'Slovní druhy a tvary', emoji: '🧩', about: 'Určování slovních druhů a mluvnických kategorií, spisovné tvary zájmen, číslovek a obtížných jmen, vid a rod sloves.', topics: ['z6/cestina/podstatna-jmena', 'z6/cestina/pridavna-jmena', 'z6/cestina/zajmena', 'z6/cestina/cislovky', 'z6/cestina/slovesa', 'z7/cestina/slovesny-vid', 'z7/cestina/slovesny-rod', 'z7/cestina/neohebne-slovni-druhy', 'z8/cestina/sklonovani-obtiznych-jmen'] },
        { id: 'skladba', title: 'Větné členy a souvětí', emoji: '🌳', about: 'Základní skladební dvojice, větné členy, druhy vedlejších vět, poměry mezi větami a stavba souvětí.', topics: ['z6/cestina/podmet-prisudek', 'z7/cestina/vetne-cleny', 'z9/cestina/vetne-cleny-opakovani', 'z7/cestina/druhy-vedlejsich-vet', 'z8/cestina/souveti-podradne', 'z8/cestina/souveti-souradne', 'z9/cestina/souveti-slozitejsi'] },
        { id: 'slova', title: 'Význam a stavba slov', emoji: '🔤', about: 'Synonyma, antonyma, homonyma, slova mnohoznačná, ustálená spojení, tvoření slov a slova přejatá.', topics: ['z7/cestina/vyznam-slov', 'z7/cestina/obohacovani-slovni-zasoby', 'z5/cestina/stavba-slova-z5', 'z8/cestina/slova-prejata'] },
        { id: 'text', title: 'Text a jeho styl', emoji: '📰', about: 'Spisovná a nespisovná čeština, funkční styly, slohové útvary a porozumění tomu, co text říká.', topics: ['z9/cestina/utvary-cestiny', 'z8/cestina/funkcni-styly', 'z7/cestina/popis-charakteristika', 'z8/cestina/vyklad-uvaha'] },
        { id: 'literatura', title: 'Literatura', emoji: '📚', about: 'Literární druhy a žánry, obrazná pojmenování (metafora, personifikace, přirovnání…).', topics: ['z6/cestina/literarni-druhy-zanry', 'z9/cestina/literarni-pojmy'] },
      ],
    },
  ] satisfies ExamPart[] as ExamPart[],
}

export const examPart = (s: string | undefined) => EXAM.parts.find((p) => p.s === s)
export const examArea = (p: ExamPart, id: string | undefined) => p.areas.find((a) => a.id === id)
/** Every topic of a part, in the order of its areas. */
export const partTopics = (p: ExamPart) => p.areas.flatMap((a) => a.topics)
