/**
 * Tekst o kategoriji (prikazuje se ispod recepata). Opisuje šta kategorija obuhvata
 * i kako se snaći — bez tvrdnji o testiranju, zdravlju ili broju recepata.
 */
export const CATEGORY_BODY: Record<string, string> = {
  'slatki-recepti': `U slatkim receptima su kolači, torte, pite, štrudle, keksi, slatka peciva i deserti u čaši. Naći ćete domaće klasike poput baklave, hurmašica, tufahija i sutlije, ali i recepte koji su odavno postali dio naših kuhinja: tiramisu, cheesecake, brownie i mafine.

Ako birate prema vremenu, gledajte ukupno vrijeme na kartici recepta: ono uključuje i hlađenje, odmaranje tijesta i dizanje, a ne samo pečenje. Kolači bez pečenja često traže noć u frižideru, dok se mafini ili banana bread mogu pojesti isti dan. Palačinke imaju svoju kategoriju.`,
  kolaci: `Ovdje su biskvitni, kremasti, slojeviti i zaliveni kolači koji se peku ili slažu u tepsiji pa režu na komade: baklave, hurmašice, oblande, bajadere, mađarica, krempita i slični. Naziv „pita“ ne određuje mjesto u ovoj podjeli: medena ili bijela pita su po izradi slojeviti kolač pa se nalaze ovdje.`,
  torte: `Torte i cheesecake za rođendane, slavlja i nedjeljni desert. Uz svaki recept je navedena veličina kalupa i ukupno vrijeme, uključujući hlađenje, jer većina torti tek nakon odležavanja dobije pravu teksturu i lijepo se reže.`,
  'keksi-i-sitni-kolaci': `Keksi, prhke kiflice, vanilice, medenjaci, raspucanci i kuglice za tacnu s kolačima. Većina ovih recepata podnosi pripremu nekoliko dana unaprijed, a uz svaki stoji kako ih čuvati da ostanu mekani ili hrskavi.`,
  'slatke-pite': `Slatke pite s voćem, sirom, makom ili orasima: lijene i prhke pite, sipane i lijevane pite te pite od gotovih kora. Razlikuju se po tijestu i načinu slaganja, pa je u nazivu recepta uvijek naznačeno o kojoj se izvedbi radi.`,
  tartovi: `Tartovi imaju tanku, unaprijed pečenu ili lisnatu podlogu i otvoren nadjev: vanilija kremu, ganache, lemon curd ili voće. Kod većine se kora peče prije punjenja, a krema se steže u frižideru, pa planirajte i to vrijeme.`,
  strudle: `Slatke štrudle od dizanog, vučenog i prhkog tijesta te od gotovih kora, s makom, orasima, jabukama, višnjama, sirom ili džemom. Kod dizanih štrudli ukupno vrijeme uključuje oba dizanja tijesta.`,
  'slatka-peciva': `Krofne, buhtle, cimet rolnice, fritule i druga slatka peciva od dizanog ili brzog tijesta. Najbolja su svježa, a u receptu je navedeno koliko se mogu čuvati i kako ih podgrijati.`,
  'deserti-i-kreme': `Sutlija, tiramisu, halve, sufle, sladoled, voćni deserti i kreme koje se služe same ili su dio drugog kolača. Nisu svi deserti iz ove grupe hladni ni bez pečenja; način pripreme piše uz svaki recept.`,

  'glavna-jela': `Glavna jela za ručak i večeru: jela s mesom i piletinom, riba, tjestenina, rižota, variva i punjena jela, jela od jaja i povrća. Tu su domaći recepti poput sarme, punjenih paprika, graha i bosanskog lonca, ali i brza jela iz tave za radne dane.

Filteri pomažu suziti izbor: vrijeme pripreme, način (rerna, tava), s mesom ili bez mesa i namirnice koje već imate. Ako ne znate odakle krenuti, pogledajte stranice Ručak i Večera s pregledom ideja.`,
  'jela-s-mesom': `Pečeno, prženo, grilovano i pirjano meso i piletina. Jela u kojima je meso dio tjestenine, rižota ili variva nalaze se u tim kategorijama, kako biste lakše našli baš ono što tražite.`,
  'riba-i-morski-plodovi': `Glavna jela od ribe, dagnji i drugih morskih plodova, iz tave i iz rerne. Uz recepte je navedeno kako prepoznati da je riba gotova, jer se kod nje razlika od par minuta jako primijeti.`,
  'tjestenina-i-punjena-tijesta': `Tjestenina s umacima, lazanje, njoki, ravioli i klepe. Sami umaci, poput bešamela ili pesta, nalaze se među umacima i marinadama.`,
  'riza-i-zitarice': `Rižota, pržena riža i jela od riže ili heljde koja su sama po sebi cijeli obrok. Obična kuhana riža kao prilog nalazi se među prilozima.`,
  'variva-i-punjena-jela': `Grah, gulaši, paprikaši, bosanski lonac, sarma, japrak i dolme, odnosno jela na kašiku i jela koja se dugo kuhaju. Većina se može skuhati dan ranije, a podgrijana često bude još bolja.`,
  'jela-od-povrca-i-mahunarki': `Glavna jela u kojima su povrće ili mahunarke u glavnoj ulozi. Naziv kategorije ne znači da je jelo vegetarijansko ili posno; to je posebno označeno na receptu.`,
  'jela-od-jaja': `Kajgane, omleti i jaja u sosu za doručak ili brzu večeru. Punjena jaja kao posluženje nalaze se među predjelima.`,
  'kase-i-zdjele': `Zobene kaše, overnight oats, chia puding i zdjele s jogurtom. Neke se kuhaju za nekoliko minuta, a neke pripremate navečer pa stoje u frižideru do jutra; to vrijeme je uračunato u ukupno vrijeme.`,
  'sendvici-i-tortilje': `Sendviči, tostovi i punjene tortilje za doručak, užinu ili obrok za ponijeti. Same tortilje i tijesto za njih nalaze se među tijestima i podlogama.`,

  palacinke: `Tanke palačinke, američke palačinke, palačinke iz rerne i torte od palačinki, slatke i slane. Posebno su označene posne palačinke, one bez jaja ili bez mlijeka i bezglutenske izvedbe, jer se po sastavu i postupku razlikuju od osnovnog recepta.

Kod tankih palačinki tijesto se obično odmara prije pečenja, a kod američkih je važno ne miješati smjesu predugo. Takve napomene stoje uz svaki recept.`,

  'pite-i-peciva': `Burek, sirnica, zeljanica i druge pite s korama, hljeb, pogače, somuni, kifle, uštipci i slana peciva. Tu su i osnovna tijesta: za pizzu, tortilje i slana peciva.

Kod recepata s kvascem ukupno vrijeme uključuje dizanje tijesta, a kod pita s gotovim korama veličinu tepsije za koju su količine računate.`,
  'hljeb-i-slana-peciva': `Hljeb, pogače, somuni, kifle, pužići, proha, naan i uštipci. Način pripreme (iz rerne, iz tave, s kvascem ili bez) označen je na receptu i može se birati filterom.`,
  'slane-pite': `Burek, sirnica, zeljanica i druge slane pite s gotovim ili domaćim korama. Uz svaki recept je navedeno kakve kore koristi i za koju tepsiju su računate količine.`,
  'tijesta-i-podloge': `Osnovna tijesta koja se koriste u drugim receptima: za pizzu, tortilje i slana peciva. Gotova jela od tih tijesta nalaze se u svojim kategorijama.`,

  'supe-i-corbe': `Bistre supe, krem supe i guste domaće čorbe: od pileće supe s rezancima do begove i teleće čorbe. Supe se lako kuhaju u većoj količini, a uz recept je navedeno kako ih čuvati i podgrijati.

Ako vam supa treba kao cijeli obrok, birajte gušće čorbe s mesom ili mahunarkama. Bistra supa je najčešće uvod u ručak. Dodaci za supu, poput griz knedli, nalaze se među prilozima.`,

  salate: `Salate uz ručak i salate koje su same po sebi obrok. Kod obrok salata navedeno je šta ih čini cijelim obrokom: piletina, riba, jaja, mahunarke ili žitarice.

Salate s majonezom i one s kuhanim sastojcima obično trebaju hlađenje prije posluživanja, a to vrijeme je uračunato u recept.`,
  'salate-kao-prilog': `Povrtne, krompir i svečane salate koje se služe uz glavno jelo, poput ruske, francuske i krompir salate.`,
  'obrok-salate': `Salate s piletinom, tunjevinom, mahunarkama ili žitaricama, zamišljene kao samostalan obrok za ručak, večeru ili posao.`,

  'predjela-i-prilozi': `Sve što upotpunjuje obrok: predjela i grickalice za goste, prilozi uz meso i ribu, umaci, marinade i namazi.

Prilozi su razvrstani prema tome uz šta se služe, a na receptima glavnih jela često je predloženo šta poslužiti uz njih.`,
  'predjela-i-grickalice': `Topla i hladna predjela i grickalice za goste: pohovani sir, punjena jaja, mozzarella štapići, pečeni kesteni i slično.`,
  prilozi: `Krompir, riža, palenta, pečeno povrće i drugi prilozi uz meso, ribu i variva. Ovdje su i dodaci za supu.`,
  'umaci-i-marinade': `Umaci za tjesteninu i meso, pesto, dresinzi i marinade. Gotova jela s umakom nalaze se među glavnim jelima.`,
  namazi: `Namazi od povrća, mahunarki, sira i ribe za doručak, večeru ili posluženje. Ajvar kao zimnica nalazi se u zimnici.`,

  zimnica: `Ajvar, turšija, ukiseljeno povrće, salate za zimnicu, džemovi i pekmezi. Kod zimnice je postupak jednako važan kao sastojci, zato se recepti drže provjerenih izvora: priprema tegli, odnos sirćeta i soli te način zatvaranja.

Uz svaki recept je navedeno čuva li se zimnica u ostavi ili u frižideru. Ako to nije provjereno, recept to jasno kaže.`,
  'slana-zimnica': `Ajvar, kiseli krastavci, kiseli kupus, turšija, cvekla i salate za zimnicu.`,
  'dzemovi-i-pekmezi': `Domaći džemovi i pekmezi od sezonskog voća. Sokovi i sirupi nalaze se među napicima.`,

  napici: `Smoothieji, domaći sokovi i sirupi, domaća i ledena kafa te drugi napici.

Kod sokova i sirupa recept navodi da li se dobija koncentrat koji se razrjeđuje ili gotov napitak, i kako ga čuvati.`,
  smoothieji: `Smoothieji od voća, povrća, jogurta i mlijeka. Gusti smoothie koji se jede kašikom, smoothie bowl, nalazi se među kašama i zdjelama.`,
  'sokovi-i-sirupi': `Domaći sokovi i sirupi od voća i bilja: zova, nana, višnje, borovnice, grožđe.`,
  'kafa-i-drugi-napici': `Domaća kafa, ledena kafa i drugi topli i hladni napici koji nisu sok ni smoothie.`,
}

type TagDef = { name: string; group: 'namirnica' | 'tijesto'; synonyms?: string }
const ing = (t: string | [string, string]): TagDef =>
  Array.isArray(t) ? { name: t[0], group: 'namirnica', synonyms: t[1] } : { name: t, group: 'namirnica' }

/** Kontrolisane oznake iz plana (dio „Tagovi“): glavne namirnice i vrste tijesta. */
export const TAGS: TagDef[] = [
  ...(
    [
      'Aronija', 'Avokado', 'Bademi', 'Bakalar', 'Banane', ['Batat', 'slatki krompir'], 'Bijela čokolada', 'Bijeli luk', 'Borovnice',
      'Bosiljak', 'Breskve', 'Brokula', 'Bundeva', 'Chia sjemenke', 'Cimet', ['Cvekla', 'cikla'], 'Čokolada', 'Čokoladni namaz', 'Dagnje',
      'Dunje', 'Džem i pekmez', 'Gambori', 'Gljive', 'Govedina', ['Grah', 'pasulj; fažol'], 'Griz', 'Grožđe', 'Heljda', 'Jabuke', 'Jagode',
      'Jaja', 'Jogurt', ['Kafa', 'kahva; kava'], 'Kakao', 'Karamel', 'Karfiol', 'Keks', 'Kelj', 'Kesteni', 'Kikiriki', 'Kiselo vrhnje',
      'Kokos', 'Krastavac', ['Krompir', 'krumpir'], 'Kruške', 'Kukuruz', 'Kupine', 'Kupus', 'Kvinoja', ['Leća', 'sočivo'], 'Lignje',
      'Limeta', 'Limun', 'Losos', 'Luk', 'Lješnjaci', 'Mak', 'Maline', 'Mandarine', 'Mango', 'Marelice', 'Mascarpone', ['Maslac', 'puter'],
      'Med', 'Mlijeko', 'Mljeveno meso', 'Mrkva', 'Mušmule', 'Nana', 'Narandža', 'Orasi', 'Paprika', ['Paradajz', 'rajčica'], 'Patlidžan',
      'Pekan orasi', 'Piletina', 'Pistacije', 'Praziluk', 'Ribizle', ['Rikota', 'ricotta'], 'Riža', 'Rogač', 'Senf', 'Sir', 'Slanina',
      ['Slanutak', 'leblebija; naut'], 'Smokve', 'Suhe šljive', 'Suho voće', 'Susam', 'Svinjetina', 'Šljive', ['Špinat', 'spanać'],
      'Šumsko voće', 'Šunka', 'Teletina', 'Tikvice', 'Tofu', 'Trešnje', 'Tunjevina', 'Vanilija', 'Višnje', 'Vrhnje', 'Zob', 'Zova',
    ] as (string | [string, string])[]
  ).map(ing),
  ...['Dizano tijesto', 'Gotove kore', 'Lisnato tijesto', 'Prhko tijesto', 'Vučeno tijesto'].map((name): TagDef => ({ name, group: 'tijesto' })),
]
