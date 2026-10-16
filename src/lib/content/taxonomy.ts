/**
 * Konačne kategorije iz sadržajnog plana (content/plan, dio „Kategorije“).
 * Jedna primarna putanja po receptu; uvod je tekst za čitaoca, pravila razvrstavanja su u planu.
 * Primjena: npm run taxonomy (upsert po slugu, nije demo sadržaj).
 */
export interface TaxonomyNode {
  slug: string
  name: string
  intro: string
  order: number
  children?: Omit<TaxonomyNode, 'children' | 'order'>[]
}

export const TAXONOMY: TaxonomyNode[] = [
  {
    slug: 'slatki-recepti',
    name: 'Slatki recepti',
    order: 10,
    intro: 'Kolači, torte, pite, štrudle i deserti: od tradicionalnih bosanskih slatkiša do jednostavnih kolača za svaki dan.',
    children: [
      { slug: 'kolaci', name: 'Kolači', intro: 'Biskvitni, kremasti, slojeviti i zaliveni kolači, uključujući baklave, hurmašice i oblande.' },
      { slug: 'torte', name: 'Torte', intro: 'Torte i cheesecake za rođendane, praznike i posebne prilike.' },
      { slug: 'keksi-i-sitni-kolaci', name: 'Keksi i sitni kolači', intro: 'Keksi, kiflice i sitni kolači za tacnu, praznike i uz kafu.' },
      { slug: 'slatke-pite', name: 'Slatke pite', intro: 'Pite s voćem, sirom, makom i orasima: prhke, sipane, lijevane i od kora.' },
      { slug: 'tartovi', name: 'Tartovi', intro: 'Tartovi s prhkom ili lisnatom korom i kremastim ili voćnim nadjevom.' },
      { slug: 'strudle', name: 'Štrudle', intro: 'Slatke štrudle od dizanog, vučenog i prhkog tijesta te od gotovih kora.' },
      { slug: 'slatka-peciva', name: 'Slatka peciva', intro: 'Krofne, buhtle, cimet rolnice, fritule i druga slatka peciva.' },
      { slug: 'deserti-i-kreme', name: 'Deserti i kreme', intro: 'Sutlija, tiramisu, halve, sladoled, voćni deserti i kreme.' },
    ],
  },
  {
    slug: 'glavna-jela',
    name: 'Glavna jela',
    order: 20,
    intro: 'Ručkovi i večere za svaki dan: jela s mesom i ribom, tjestenina, variva, jela od jaja i povrća.',
    children: [
      { slug: 'jela-s-mesom', name: 'Jela s mesom', intro: 'Pečeno, prženo, grilovano i pirjano meso i piletina.' },
      { slug: 'riba-i-morski-plodovi', name: 'Riba i morski plodovi', intro: 'Glavna jela od ribe, dagnji i drugih morskih plodova.' },
      { slug: 'tjestenina-i-punjena-tijesta', name: 'Tjestenina i punjena tijesta', intro: 'Tjestenina, lazanje, njoki, ravioli i klepe.' },
      { slug: 'riza-i-zitarice', name: 'Riža i žitarice', intro: 'Rižota, pržena riža i jela s rižom ili heljdom.' },
      { slug: 'variva-i-punjena-jela', name: 'Variva i punjena jela', intro: 'Grah, gulaši, paprikaši, bosanski lonac, sarme i dolme.' },
      { slug: 'jela-od-povrca-i-mahunarki', name: 'Jela od povrća i mahunarki', intro: 'Glavna jela u kojima su povrće ili mahunarke u glavnoj ulozi.' },
      { slug: 'jela-od-jaja', name: 'Jela od jaja', intro: 'Kajgane, omleti i jaja u sosu za doručak ili brzu večeru.' },
      { slug: 'kase-i-zdjele', name: 'Kaše i zdjele', intro: 'Zobene kaše, overnight oats, chia puding i zdjele za doručak.' },
      { slug: 'sendvici-i-tortilje', name: 'Sendviči i tortilje', intro: 'Sendviči, tostovi i punjene tortilje.' },
    ],
  },
  {
    slug: 'palacinke',
    name: 'Palačinke',
    order: 30,
    intro: 'Tanke i američke palačinke, slatke i slane izvedbe, posne i bez glutena.',
  },
  {
    slug: 'pite-i-peciva',
    name: 'Pite i peciva',
    order: 40,
    intro: 'Burek, sirnica, zeljanica, hljeb, pogače, kifle i druga slana peciva.',
    children: [
      { slug: 'hljeb-i-slana-peciva', name: 'Hljeb i slana peciva', intro: 'Hljeb, pogače, somuni, kifle, uštipci i druga slana peciva.' },
      { slug: 'slane-pite', name: 'Slane pite', intro: 'Burek, sirnica, zeljanica i druge pite s korama.' },
      { slug: 'tijesta-i-podloge', name: 'Tijesta i podloge', intro: 'Osnovna tijesta: za pizzu, tortilje i slana peciva.' },
    ],
  },
  {
    slug: 'supe-i-corbe',
    name: 'Supe i čorbe',
    order: 50,
    intro: 'Bistre supe, krem supe i guste domaće čorbe.',
  },
  {
    slug: 'salate',
    name: 'Salate',
    order: 60,
    intro: 'Salate uz ručak i salate koje su same po sebi cijeli obrok.',
    children: [
      { slug: 'salate-kao-prilog', name: 'Salate kao prilog', intro: 'Povrtne, krompir i svečane salate uz glavno jelo.' },
      { slug: 'obrok-salate', name: 'Obrok salate', intro: 'Salate s piletinom, ribom, mahunarkama ili žitaricama za cijeli obrok.' },
    ],
  },
  {
    slug: 'predjela-i-prilozi',
    name: 'Predjela i prilozi',
    order: 70,
    intro: 'Predjela, prilozi, umaci i namazi koji upotpunjuju obrok.',
    children: [
      { slug: 'predjela-i-grickalice', name: 'Predjela i grickalice', intro: 'Topla i hladna predjela i grickalice za goste.' },
      { slug: 'prilozi', name: 'Prilozi', intro: 'Krompir, riža, palenta i povrće uz glavno jelo.' },
      { slug: 'umaci-i-marinade', name: 'Umaci i marinade', intro: 'Umaci za tjesteninu i meso, pesto, dresinzi i marinade.' },
      { slug: 'namazi', name: 'Namazi', intro: 'Namazi od povrća, mahunarki, sira i ribe.' },
    ],
  },
  {
    slug: 'zimnica',
    name: 'Zimnica',
    order: 80,
    intro: 'Ajvar, turšija, ukiseljeno povrće, džemovi i pekmezi.',
    children: [
      { slug: 'slana-zimnica', name: 'Slana zimnica', intro: 'Ajvar, ukiseljeno povrće i salate za zimnicu.' },
      { slug: 'dzemovi-i-pekmezi', name: 'Džemovi i pekmezi', intro: 'Domaći džemovi i pekmezi od sezonskog voća.' },
    ],
  },
  {
    slug: 'napici',
    name: 'Napici',
    order: 90,
    intro: 'Smoothieji, domaći sokovi i sirupi, kafa i drugi napici.',
    children: [
      { slug: 'smoothieji', name: 'Smoothieji', intro: 'Smoothieji od voća, povrća i jogurta.' },
      { slug: 'sokovi-i-sirupi', name: 'Sokovi i sirupi', intro: 'Domaći sokovi i sirupi od voća i bilja.' },
      { slug: 'kafa-i-drugi-napici', name: 'Kafa i drugi napici', intro: 'Domaća i ledena kafa te drugi topli i hladni napici.' },
    ],
  },
]
