// Names on the blind maps (src/maps/index.ts): Czech short names of states and their capitals, Czech regions
// and their seats. Keys are the ids in src/maps/data/*.json: ISO 3166-1 alpha-3 codes as Natural Earth uses them
// (Kosovo KOS, South Sudan SDS) and ISO 3166-2 codes of the regions. Names follow the list of the Czech names
// commission (Názvy států a jejich územních částí, ČÚZK). A capital is left out where a pupil could not
// answer it unambiguously (two capitals, a seat shared with another region, a disputed capital).

/** Where a state belongs in the world game. */
export type Part = 'evropa' | 'asie' | 'afrika' | 'amerika' | 'oceanie'

export interface Place { name: string; capital?: string; part?: Part }

const p = (part: Part, list: [string, string, string?][]): [string, Place][] => list.map(([id, name, capital]) => [id, { name, capital, part }])

export const STATES: Record<string, Place> = Object.fromEntries([
  ...p('evropa', [
    ['ALB', 'Albánie', 'Tirana'], ['AND', 'Andorra', 'Andorra la Vella'], ['AUT', 'Rakousko', 'Vídeň'], ['BEL', 'Belgie', 'Brusel'],
    ['BLR', 'Bělorusko', 'Minsk'], ['BIH', 'Bosna a Hercegovina', 'Sarajevo'], ['BGR', 'Bulharsko', 'Sofie'], ['MNE', 'Černá Hora', 'Podgorica'],
    ['CZE', 'Česko', 'Praha'], ['DNK', 'Dánsko', 'Kodaň'], ['EST', 'Estonsko', 'Tallinn'], ['FIN', 'Finsko', 'Helsinky'],
    ['FRA', 'Francie', 'Paříž'], ['HRV', 'Chorvatsko', 'Záhřeb'], ['IRL', 'Irsko', 'Dublin'], ['ISL', 'Island', 'Reykjavík'],
    ['ITA', 'Itálie', 'Řím'], ['KOS', 'Kosovo', 'Priština'], ['CYP', 'Kypr', 'Nikósie'], ['LIE', 'Lichtenštejnsko', 'Vaduz'],
    ['LTU', 'Litva', 'Vilnius'], ['LVA', 'Lotyšsko', 'Riga'], ['LUX', 'Lucembursko', 'Lucemburk'], ['HUN', 'Maďarsko', 'Budapešť'],
    ['MLT', 'Malta', 'Valletta'], ['MDA', 'Moldavsko', 'Kišiněv'], ['MCO', 'Monako', 'Monako'], ['DEU', 'Německo', 'Berlín'],
    ['NLD', 'Nizozemsko', 'Amsterdam'], ['NOR', 'Norsko', 'Oslo'], ['POL', 'Polsko', 'Varšava'], ['PRT', 'Portugalsko', 'Lisabon'],
    ['ROU', 'Rumunsko', 'Bukurešť'], ['RUS', 'Rusko', 'Moskva'], ['GRC', 'Řecko', 'Atény'], ['SMR', 'San Marino', 'San Marino'],
    ['MKD', 'Severní Makedonie', 'Skopje'], ['SVK', 'Slovensko', 'Bratislava'], ['SVN', 'Slovinsko', 'Lublaň'], ['GBR', 'Spojené království', 'Londýn'],
    ['SRB', 'Srbsko', 'Bělehrad'], ['ESP', 'Španělsko', 'Madrid'], ['SWE', 'Švédsko', 'Stockholm'], ['CHE', 'Švýcarsko', 'Bern'],
    ['UKR', 'Ukrajina', 'Kyjev'], ['VAT', 'Vatikán', 'Vatikán'],
  ]),
  ...p('asie', [
    ['AFG', 'Afghánistán', 'Kábul'], ['ARM', 'Arménie', 'Jerevan'], ['AZE', 'Ázerbájdžán', 'Baku'], ['BHR', 'Bahrajn', 'Manáma'],
    ['BGD', 'Bangladéš', 'Dháka'], ['BTN', 'Bhútán', 'Thimphu'], ['BRN', 'Brunej', 'Bandar Seri Begawan'], ['CHN', 'Čína', 'Peking'],
    ['PHL', 'Filipíny', 'Manila'], ['GEO', 'Gruzie', 'Tbilisi'], ['IND', 'Indie', 'Nové Dillí'], ['IDN', 'Indonésie', 'Jakarta'],
    ['IRQ', 'Irák', 'Bagdád'], ['IRN', 'Írán', 'Teherán'], ['ISR', 'Izrael'], ['JPN', 'Japonsko', 'Tokio'],
    ['YEM', 'Jemen', 'Saná'], ['JOR', 'Jordánsko', 'Ammán'], ['KOR', 'Jižní Korea', 'Soul'], ['KHM', 'Kambodža', 'Phnompenh'],
    ['QAT', 'Katar', 'Dauhá'], ['KAZ', 'Kazachstán', 'Astana'], ['KGZ', 'Kyrgyzstán', 'Biškek'], ['KWT', 'Kuvajt', 'Kuvajt'],
    ['LAO', 'Laos', 'Vientiane'], ['LBN', 'Libanon', 'Bejrút'], ['MYS', 'Malajsie', 'Kuala Lumpur'], ['MDV', 'Maledivy', 'Male'],
    ['MNG', 'Mongolsko', 'Ulánbátar'], ['MMR', 'Myanmar', 'Neipyijto'], ['NPL', 'Nepál', 'Káthmándú'], ['OMN', 'Omán', 'Maskat'],
    ['PAK', 'Pákistán', 'Islámábád'], ['PRK', 'Severní Korea', 'Pchjongjang'], ['SAU', 'Saúdská Arábie', 'Rijád'], ['SGP', 'Singapur', 'Singapur'],
    ['ARE', 'Spojené arabské emiráty', 'Abú Zabí'], ['LKA', 'Srí Lanka'], ['SYR', 'Sýrie', 'Damašek'], ['TJK', 'Tádžikistán', 'Dušanbe'],
    ['THA', 'Thajsko', 'Bangkok'], ['TUR', 'Turecko', 'Ankara'], ['TKM', 'Turkmenistán', 'Ašchabad'], ['UZB', 'Uzbekistán', 'Taškent'],
    ['VNM', 'Vietnam', 'Hanoj'], ['TLS', 'Východní Timor', 'Dili'],
  ]),
  ...p('afrika', [
    ['DZA', 'Alžírsko', 'Alžír'], ['AGO', 'Angola', 'Luanda'], ['BEN', 'Benin', 'Porto-Novo'], ['BWA', 'Botswana', 'Gaborone'],
    ['BFA', 'Burkina Faso', 'Ouagadougou'], ['BDI', 'Burundi', 'Gitega'], ['TCD', 'Čad', 'Ndžamena'], ['COD', 'Demokratická republika Kongo', 'Kinshasa'],
    ['DJI', 'Džibutsko', 'Džibuti'], ['EGY', 'Egypt', 'Káhira'], ['ERI', 'Eritrea', 'Asmara'], ['ETH', 'Etiopie', 'Addis Abeba'],
    ['GAB', 'Gabon', 'Libreville'], ['GMB', 'Gambie', 'Banjul'], ['GHA', 'Ghana', 'Akkra'], ['GIN', 'Guinea', 'Konakry'],
    ['GNB', 'Guinea-Bissau', 'Bissau'], ['ZAF', 'Jihoafrická republika', 'Pretorie'], ['SDS', 'Jižní Súdán', 'Džuba'], ['CMR', 'Kamerun', 'Yaoundé'],
    ['CPV', 'Kapverdy', 'Praia'], ['KEN', 'Keňa', 'Nairobi'], ['COM', 'Komory', 'Moroni'], ['COG', 'Kongo', 'Brazzaville'],
    ['LSO', 'Lesotho', 'Maseru'], ['LBR', 'Libérie', 'Monrovia'], ['LBY', 'Libye', 'Tripolis'], ['MDG', 'Madagaskar', 'Antananarivo'],
    ['MWI', 'Malawi', 'Lilongwe'], ['MLI', 'Mali', 'Bamako'], ['MAR', 'Maroko', 'Rabat'], ['MUS', 'Mauricius', 'Port Louis'],
    ['MRT', 'Mauritánie', 'Nuakšott'], ['MOZ', 'Mosambik', 'Maputo'], ['NAM', 'Namibie', 'Windhoek'], ['NER', 'Niger', 'Niamey'],
    ['NGA', 'Nigérie', 'Abuja'], ['CIV', 'Pobřeží slonoviny', 'Yamoussoukro'], ['RWA', 'Rwanda', 'Kigali'], ['GNQ', 'Rovníková Guinea', 'Malabo'],
    ['SEN', 'Senegal', 'Dakar'], ['SYC', 'Seychely', 'Victoria'], ['SLE', 'Sierra Leone', 'Freetown'], ['SOM', 'Somálsko', 'Mogadišo'],
    ['CAF', 'Středoafrická republika', 'Bangui'], ['SDN', 'Súdán', 'Chartúm'], ['SWZ', 'Eswatini', 'Mbabane'], ['STP', 'Svatý Tomáš a Princův ostrov', 'São Tomé'],
    ['TZA', 'Tanzanie', 'Dodoma'], ['TGO', 'Togo', 'Lomé'], ['TUN', 'Tunisko', 'Tunis'], ['UGA', 'Uganda', 'Kampala'],
    ['ZMB', 'Zambie', 'Lusaka'], ['ZWE', 'Zimbabwe', 'Harare'],
  ]),
  ...p('amerika', [
    ['ATG', 'Antigua a Barbuda', 'Saint John’s'], ['ARG', 'Argentina', 'Buenos Aires'], ['BHS', 'Bahamy', 'Nassau'], ['BRB', 'Barbados', 'Bridgetown'],
    ['BLZ', 'Belize', 'Belmopan'], ['BOL', 'Bolívie'], ['BRA', 'Brazílie', 'Brasília'], ['CHL', 'Chile', 'Santiago de Chile'],
    ['DMA', 'Dominika', 'Roseau'], ['DOM', 'Dominikánská republika', 'Santo Domingo'], ['ECU', 'Ekvádor', 'Quito'], ['GRD', 'Grenada', 'Saint George’s'],
    ['GTM', 'Guatemala', 'Guatemala'], ['GUY', 'Guyana', 'Georgetown'], ['HTI', 'Haiti', 'Port-au-Prince'], ['HND', 'Honduras', 'Tegucigalpa'],
    ['JAM', 'Jamajka', 'Kingston'], ['CAN', 'Kanada', 'Ottawa'], ['COL', 'Kolumbie', 'Bogotá'], ['CRI', 'Kostarika', 'San José'],
    ['CUB', 'Kuba', 'Havana'], ['MEX', 'Mexiko', 'Ciudad de México'], ['NIC', 'Nikaragua', 'Managua'], ['PAN', 'Panama', 'Panama'],
    ['PRY', 'Paraguay', 'Asunción'], ['PER', 'Peru', 'Lima'], ['SLV', 'Salvador', 'San Salvador'], ['USA', 'Spojené státy americké', 'Washington'],
    ['KNA', 'Svatý Kryštof a Nevis', 'Basseterre'], ['LCA', 'Svatá Lucie', 'Castries'], ['VCT', 'Svatý Vincenc a Grenadiny', 'Kingstown'], ['SUR', 'Surinam', 'Paramaribo'],
    ['TTO', 'Trinidad a Tobago', 'Port of Spain'], ['URY', 'Uruguay', 'Montevideo'], ['VEN', 'Venezuela', 'Caracas'],
  ]),
  ...p('oceanie', [
    ['AUS', 'Austrálie', 'Canberra'], ['FJI', 'Fidži', 'Suva'], ['KIR', 'Kiribati', 'Jižní Tarawa'], ['MHL', 'Marshallovy ostrovy', 'Majuro'],
    ['FSM', 'Mikronésie', 'Palikir'], ['NRU', 'Nauru'], ['NZL', 'Nový Zéland', 'Wellington'], ['PLW', 'Palau', 'Ngerulmud'],
    ['PNG', 'Papua Nová Guinea', 'Port Moresby'], ['SLB', 'Šalamounovy ostrovy', 'Honiara'], ['WSM', 'Samoa', 'Apia'], ['TON', 'Tonga', 'Nukuʻalofa'],
    ['TUV', 'Tuvalu', 'Funafuti'], ['VUT', 'Vanuatu', 'Port Vila'],
  ]),
])

/** Territories drawn on the maps that are not states in the game: named when tapped, never asked. */
export const OTHER: Record<string, string> = {
  GRL: 'Grónsko (Dánsko)', ESH: 'Západní Sahara', SAH: 'Západní Sahara', PSX: 'Palestina', TWN: 'Tchaj-wan', FRO: 'Faerské ostrovy (Dánsko)',
  PRI: 'Portoriko (USA)', NCL: 'Nová Kaledonie (Francie)', PYF: 'Francouzská Polynésie', FLK: 'Falklandy', IMN: 'Ostrov Man', JEY: 'Jersey', GGY: 'Guernsey',
  HKG: 'Hongkong (Čína)', MAC: 'Macao (Čína)', KAS: 'Kašmír (sporné území)', ATF: 'Francouzská jižní a antarktická území', SGS: 'Jižní Georgie',
}

/** The 14 regions of Czechia (ISO 3166-2:CZ). Středočeský kraj has its seat in Prague, so it has no seat to ask about. */
export const REGIONS: Record<string, Place> = {
  'CZ-PR': { name: 'Hlavní město Praha', capital: 'Praha' },
  'CZ-ST': { name: 'Středočeský kraj' },
  'CZ-JC': { name: 'Jihočeský kraj', capital: 'České Budějovice' },
  'CZ-PL': { name: 'Plzeňský kraj', capital: 'Plzeň' },
  'CZ-KA': { name: 'Karlovarský kraj', capital: 'Karlovy Vary' },
  'CZ-US': { name: 'Ústecký kraj', capital: 'Ústí nad Labem' },
  'CZ-LI': { name: 'Liberecký kraj', capital: 'Liberec' },
  'CZ-KR': { name: 'Královéhradecký kraj', capital: 'Hradec Králové' },
  'CZ-PA': { name: 'Pardubický kraj', capital: 'Pardubice' },
  'CZ-VY': { name: 'Kraj Vysočina', capital: 'Jihlava' },
  'CZ-JM': { name: 'Jihomoravský kraj', capital: 'Brno' },
  'CZ-OL': { name: 'Olomoucký kraj', capital: 'Olomouc' },
  'CZ-ZL': { name: 'Zlínský kraj', capital: 'Zlín' },
  'CZ-MO': { name: 'Moravskoslezský kraj', capital: 'Ostrava' },
}
