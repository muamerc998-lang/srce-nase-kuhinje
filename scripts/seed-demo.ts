/**
 * Demonstracijski skup podataka za razvoj.
 *
 *   npm run seed:demo            → napravi demo sadržaj (ako ga još nema)
 *   npm run seed:demo -- --reset → prvo ukloni postojeći demo, pa ga ponovo napravi
 *
 * Sve što ova skripta napravi ima isDemo = true (osim administratora i
 * strukture informativnih stranica koje traže uredničku dopunu).
 * Uklanjanje: npm run demo:remove
 */
import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import { upsertTaxonomy, upsertTags } from './seed-taxonomy'
import { runImport, formatReport } from '../src/payload/importer'
import { lexicalFromBlocks } from '../src/lib/content/lexical'
import { makeDemoImage } from './demo-images'
import { removeDemo } from './remove-demo'

const IMG_DIR = path.resolve('.data/demo-images')
const demo = { isDemo: true }

async function image(payload: Payload, key: string, label: string) {
  const file = await makeDemoImage(IMG_DIR, key, label)
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: `Demonstracijska slika za "${label}" (nije fotografija jela)`, credit: 'Generisano za razvoj', ...demo },
    filePath: file,
  })
  return doc.id
}

async function ensureAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    console.log('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD nisu postavljeni — administrator se ne pravi.')
    return
  }
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
  if (existing.docs.length) return
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: { email, password, name: 'Lokalni administrator', roles: ['admin', 'editor'] },
  })
  console.log(`Administrator: ${email} (lozinka je u .env)`)
}

async function main() {
  const payload = await getPayload({ config })
  const reset = process.argv.includes('--reset')

  await ensureAdmin(payload)

  const already = await payload.find({
    collection: 'authors',
    where: { slug: { equals: 'demo-urednistvo' } },
    limit: 1,
    overrideAccess: true,
  })
  if (already.docs.length) {
    if (!reset) {
      console.log('Demo sadržaj već postoji. Za ponovno kreiranje: npm run seed:demo -- --reset')
      process.exit(0)
    }
    await removeDemo(payload)
  }

  console.log('Pravim demo registre…')
  // Kategorije su stvarne (iz plana), ne demo: demo recepti ih samo koriste.
  const C = await upsertTaxonomy(payload)
  await upsertTags(payload)

  const tag = async (slug: string, name: string, extra: Record<string, unknown> = {}) =>
    (await payload.create({ collection: 'tags', overrideAccess: true, data: { slug, name, ...extra, ...demo } })).id
  const brzo = await tag('brzo', 'Brzo')
  await tag('bez-pecenja', 'Bez pečenja')
  await tag('nedjeljni-rucak', 'Nedjeljni ručak')
  // primjer spajanja sinonima: recept s oznakom "brzi-recepti" dobija oznaku "brzo"
  await tag('brzi-recepti', 'Brzi recepti', { mergedInto: brzo, public: false })

  await payload.create({
    collection: 'authors',
    overrideAccess: true,
    data: {
      slug: 'demo-urednistvo',
      name: 'Demo uredništvo (nije za objavu)',
      isTeam: true,
      role: 'Privremeni zapis za razvoj',
      bio: 'Demonstracijski zapis. Prije objave zamijeniti stvarnim, imenovanim uredništvom ili autorima.',
      ...demo,
    },
  })

  for (const terms of [
    ['palačinke', 'pačinke', 'palačinci'],
    ['pita', 'savijača'],
    ['kolač', 'kolači', 'slatko'],
  ]) {
    await payload.create({
      collection: 'search-synonyms',
      overrideAccess: true,
      data: { terms: terms.map((term) => ({ term })), ...demo },
    })
  }

  console.log('Pravim demo vodiče…')
  const guide = async (slug: string, title: string, answer: string, body: Parameters<typeof lexicalFromBlocks>[0]) =>
    (
      await payload.create({
        collection: 'guides',
        overrideAccess: true,
        draft: false,
        data: {
          slug,
          title,
          answer,
          body: lexicalFromBlocks(body) as never,
          heroImage: await image(payload, `vodic-${slug}`, title),
          authors: [(await payload.find({ collection: 'authors', where: { slug: { equals: 'demo-urednistvo' } }, overrideAccess: true })).docs[0].id],
          _status: 'published',
          ...demo,
        },
      })
    ).id
  const G: Record<string, number> = {}
  G['kako-odvojiti-bjelanca-od-zumanaca'] = await guide(
    'kako-odvojiti-bjelanca-od-zumanaca',
    'Kako odvojiti bjelanca od žumanaca',
    'Jaja odvajajte dok su hladna, preko posebne posudice, i svako bjelance prebacite u veću posudu tek kad ste sigurni da u njemu nema žumanca.',
    [
      { h2: 'Zašto hladna jaja' },
      { p: 'Žumance hladnog jajeta je čvršće i teže puca, pa se lakše odvaja. Bjelanca zatim ostavite da dostignu sobnu temperaturu ako ih mutite u snijeg.' },
      { h2: 'Postupak' },
      { ol: ['Razbijte jaje o ravnu površinu, ne o ivicu posude.', 'Prebacujte žumance iz jedne polovine ljuske u drugu, puštajući bjelance da klizi u posudicu.', 'Čisto bjelance prebacite u veću posudu, pa nastavite sa sljedećim jajetom.'] },
      { h2: 'Ako žumance pukne' },
      { p: 'Mala kapljica žumanca može spriječiti da se bjelanca umute u čvrst snijeg. Takvo bjelance sačuvajte za drugu upotrebu, npr. za premazivanje.' },
    ],
  )
  G['kako-raditi-s-korama-za-pitu'] = await guide(
    'kako-raditi-s-korama-za-pitu',
    'Kako raditi s gotovim korama za pitu',
    'Gotove kore izvadite iz frižidera ranije, držite ih pokrivene vlažnom krpom i radite brzo, kako se ne bi osušile i pucale.',
    [
      { h2: 'Prije početka' },
      { p: 'Kore ostavite u pakovanju 20–30 minuta na sobnoj temperaturi. Pripremite fil i masnoću unaprijed, da kore ne stoje otkrivene.' },
      { h2: 'Tokom rada' },
      { ul: ['Otvorene kore pokrijte čistom, blago vlažnom krpom.', 'Masnoću nanosite prskanjem ili četkicom, bez natapanja.', 'Napuknuta kora se može iskoristiti u sredini pite.'] },
      { h2: 'Čuvanje otvorenog pakovanja' },
      { p: 'Neiskorištene kore dobro zamotajte u foliju i čuvajte u frižideru nekoliko dana; pratite rok na pakovanju.' },
    ],
  )
  G['kako-cuvati-jabuke'] = await guide(
    'kako-cuvati-jabuke',
    'Kako čuvati jabuke kroz zimu',
    'Za duže čuvanje birajte zdrave jabuke bez udaraca, držite ih na hladnom, tamnom i prozračnom mjestu, odvojeno od krompira i povrća.',
    [
      { h2: 'Odabir' },
      { p: 'Čuvajte samo neoštećene plodove. Jabuke s udarcima iskoristite odmah za pitu ili kompot.' },
      { h2: 'Mjesto' },
      { p: 'Najbolja je hladna i tamna prostorija s malo vlage. Jabuke otpuštaju etilen pa ubrzavaju zrenje okolnog povrća.' },
      { h2: 'Redovna provjera' },
      { p: 'Jednom sedmično pregledajte jabuke i uklonite one koje počinju trunuti.' },
    ],
  )

  console.log('Uvozim demo namirnice i recepte (isti format kao za stvarni uvoz)…')
  const ingFile = JSON.parse(fs.readFileSync('content/demo/ingredients.json', 'utf8'))
  const recFile = JSON.parse(fs.readFileSync('content/demo/recipes.json', 'utf8'))
  for (const r of recFile.recipes) {
    const file = await makeDemoImage(IMG_DIR, `recept-${r.slug}`, r.title)
    r.image = { file, alt: `Demonstracijska slika za "${r.title}" (nije fotografija jela)`, credit: 'Generisano za razvoj' }
  }
  const report = await runImport(
    payload,
    { format: 'srce-nase-kuhinje/v1', ingredients: ingFile.ingredients, recipes: recFile.recipes },
    { dryRun: false, publish: true, markDemo: true, baseDir: process.cwd() },
  )
  console.log(formatReport(report))
  if (!report.ok) throw new Error('Uvoz demo sadržaja nije uspio.')

  const recipeId = async (slug: string) =>
    (await payload.find({ collection: 'recipes', where: { slug: { equals: slug } }, draft: true, overrideAccess: true, limit: 1 })).docs[0]!.id
  const ingredientId = async (slug: string) =>
    (await payload.find({ collection: 'ingredients', where: { slug: { equals: slug } }, overrideAccess: true, limit: 1 })).docs[0]!.id

  // Recept "gulas" ostaje draft — služi za provjeru da se draftovi ne vide javno.
  await payload.update({
    collection: 'recipes',
    id: await recipeId('gulas'),
    overrideAccess: true,
    data: { _status: 'draft' },
  })

  // Vodiči ↔ recepti
  await payload.update({
    collection: 'guides',
    id: G['kako-raditi-s-korama-za-pitu'],
    overrideAccess: true,
    data: {
      relatedRecipes: [await recipeId('burek-sa-mesom'), await recipeId('zeljanica'), await recipeId('pita-s-jabukama')],
      relatedIngredients: [await ingredientId('kore-za-pitu')],
    },
  })
  await payload.update({
    collection: 'guides',
    id: G['kako-cuvati-jabuke'],
    overrideAccess: true,
    data: { relatedRecipes: [await recipeId('pita-s-jabukama')], relatedIngredients: [await ingredientId('jabuke')] },
  })
  await payload.update({
    collection: 'guides',
    id: G['kako-odvojiti-bjelanca-od-zumanaca'],
    overrideAccess: true,
    data: { relatedIngredients: [await ingredientId('jaja')] },
  })

  console.log('Pravim demo kolekcije…')
  const coll = async (slug: string, title: string, intro: string, recipes: string[], indexable = false) =>
    (
      await payload.create({
        collection: 'recipe-collections',
        overrideAccess: true,
        data: {
          slug,
          title,
          intro,
          image: await image(payload, `kolekcija-${slug}`, title),
          recipes: await Promise.all(recipes.map(recipeId)),
          indexable,
          subfilters: ['kategorija', 'vrijeme'],
          _status: 'published',
          ...demo,
        },
      })
    ).id
  const K: Record<string, number> = {}
  K.rucak = await coll(
    'rucak-do-30-minuta',
    'Ručak do 30 minuta',
    'Recepti za dane kad ručak treba biti na stolu brzo, bez kompromisa u ukusu.',
    ['pileca-prsa-u-sosu-od-pavlake', 'tjestenina-s-paradajz-sosom', 'sopska-salata', 'kajgana-s-povrcem'],
    true,
  )
  K.jednaPosuda = await coll(
    'iz-jedne-posude',
    'Iz jedne posude',
    'Jela koja se kuhaju ili peku u jednoj šerpi ili tepsiji — manje suđa, a ručak je kompletan.',
    ['pileci-batak-s-krompirom-u-rerni', 'grah-sa-suhim-mesom', 'rizoto-s-povrcem', 'musaka-s-krompirom'],
  )
  K.ponijeti = await coll(
    'obroci-za-ponijeti',
    'Obroci za ponijeti',
    'Jela koja se lako pakuju i dobra su i hladna — za posao, školu ili put.',
    ['salata-s-piletinom-i-tjesteninom', 'tortilja-s-krompirom', 'zeljanica', 'ustipci'],
  )
  K.sutra = await coll(
    'pripremi-danas-za-sutra',
    'Pripremi danas za sutra',
    'Recepti koji sutradan nisu ništa lošiji — a često su i bolji. Skuhajte večer ranije i ručak je spreman.',
    ['grah-sa-suhim-mesom', 'musaka-s-krompirom', 'pileca-supa-s-rezancima', 'cokoladna-torta-bez-pecenja'],
  )
  K.porodica = await coll(
    'ideje-za-porodicni-rucak',
    'Ideje za porodični ručak',
    'Supa, glavno jelo, prilog i salata — za ručak kad je cijela porodica za stolom.',
    ['pileca-supa-s-rezancima', 'musaka-s-krompirom', 'pileci-batak-s-krompirom-u-rerni', 'pire-krompir', 'sopska-salata'],
  )
  // Namjerno samo dva recepta: kolekcija ispod praga se javno ne prikazuje.
  K.bezPecenja = await coll(
    'kolaci-bez-pecenja',
    'Kolači bez pečenja',
    'Torte i sitni kolači koji se ne peku — dovoljni su frižider i malo strpljenja.',
    ['cokoladna-torta-bez-pecenja', 'kuglice-od-keksa'],
  )
  K.jabuke = await coll(
    'sezona-jabuka',
    'Sezona jabuka',
    'Jesen je vrijeme jabuka: pite, pečene jabuke i topli doručak s cimetom.',
    ['pita-s-jabukama', 'pecene-jabuke-s-orasima', 'ovsena-kasa-s-jabukom'],
  )

  console.log('Postavljam uredništvo i informativne stranice…')
  // Stvarni sadržaj (nije demo): ažurira se ako već postoji.
  const upsert = async (collection: 'pages' | 'authors', slug: string, data: Record<string, unknown>) => {
    const found = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, overrideAccess: true, draft: collection === 'pages' })
    if (found.docs[0]) return payload.update({ collection, id: found.docs[0].id, overrideAccess: true, data: data as never })
    return payload.create({ collection, overrideAccess: true, data: { slug, ...data } as never })
  }
  await upsert('authors', 'urednistvo', {
    name: 'Uredništvo Srce naše kuhinje',
    isTeam: true,
    role: 'Izbor, pisanje i uređivanje recepata',
    bio: 'Recepte bira, piše i uređuje tim koji stoji iza Facebook stranice „Srce naše kuhinje – najbolji recepti“. Svaki recept prije objave dobija jasne količine, vrijeme pripreme i korake.',
    isDemo: false,
  })
  const authorDefs = [
    { slug: 'amra-hodzic', name: 'Amra Hodžić', role: 'Slatki recepti, torte i kolači', bio: 'Piše i uređuje slatke recepte: torte, kolače, palačinke i sitne kolače za goste i praznike.' },
    { slug: 'emir-delic', name: 'Emir Delić', role: 'Glavna jela, supe i zimnica', bio: 'Zadužen za glavna jela, supe, čorbe, pite i zimnicu — recepte za svaki dan i za nedjeljni stol.' },
    { slug: 'selma-begic', name: 'Selma Begić', role: 'Savjeti iz kuhinje i namirnice', bio: 'Piše praktične vodiče o namirnicama, čuvanju hrane i kuhinjskim tehnikama.' },
  ]
  for (const a of authorDefs) await upsert('authors', a.slug, { name: a.name, role: a.role, bio: a.bio, isTeam: false, isDemo: false })
  const authorId = async (slug: string) => (await payload.find({ collection: 'authors', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })).docs[0].id
  const A = { slatko: await authorId('amra-hodzic'), glavna: await authorId('emir-delic'), vodici: await authorId('selma-begic'), redakcija: await authorId('urednistvo') }
  // Raspodjela po oblastima: slatko → Amra, glavna jela/supe/pite/zimnica → Emir, ostalo → redakcija
  const sweetCats = new Set(['slatki-recepti', 'torte', 'kolaci', 'keksi-i-sitni-kolaci', 'palacinke', 'slatke-pite', 'tartovi', 'strudle', 'slatka-peciva', 'deserti-i-kreme'])
  const mainCats = new Set(['glavna-jela', 'supe-i-corbe', 'pite-i-peciva', 'zimnica'])
  const allRecipes = await payload.find({ collection: 'recipes', pagination: false, depth: 1, draft: true, overrideAccess: true, select: { primaryCategory: true } })
  for (const r of allRecipes.docs) {
    const cat = typeof r.primaryCategory === 'object' && r.primaryCategory ? (r.primaryCategory.slug ?? '') : ''
    const author = sweetCats.has(cat) ? A.slatko : mainCats.has(cat) ? A.glavna : A.redakcija
    await payload.update({ collection: 'recipes', id: r.id, overrideAccess: true, data: { authors: [author] }, context: { reindex: true } })
  }
  for (const g of Object.values(G)) await payload.update({ collection: 'guides', id: g, overrideAccess: true, data: { authors: [A.vodici] } })

  const page = (slug: string, title: string, group: 'portal' | 'pravno', needsEditorInput: boolean, blocks: Parameters<typeof lexicalFromBlocks>[0]) =>
    upsert('pages', slug, { title, footerGroup: group, body: lexicalFromBlocks(blocks), needsEditorInput, _status: 'published' })

  await page('o-nama', 'O nama', 'portal', false, [
    { p: 'Srce naše kuhinje je praktična digitalna kuharica nastala uz Facebook stranicu „Srce naše kuhinje – najbolji recepti“. Tamo svakodnevno dijelimo recepte, a ovdje ih okupljamo na jednom mjestu — uredno složene, s jasnim količinama, vremenom pripreme i koracima.' },
    { h2: 'Šta ovdje možete pronaći' },
    { ul: [
      'domaće recepte za doručak, ručak i večeru, kolače, pite i zimnicu;',
      'pretragu po nazivu jela ili po namirnicama koje već imate u kuhinji;',
      'preračun porcija, označavanje sastojaka i način kuhanja korak po korak;',
      'Moju kuharicu, plan obroka i listu za kupovinu — bez registracije.',
    ] },
    { h2: 'Ko stoji iza portala' },
    { p: 'Recepte bira, piše i uređuje uredništvo stranice Srce naše kuhinje. Kako radimo, opisali smo u uredničkoj politici.' },
    { h2: 'Pišite nam' },
    { p: 'Prijedloge, pitanja i ispravke možete poslati putem stranice Kontakt ili obrasca „Prijavi grešku u receptu“ na svakom receptu.' },
  ])
  await page('urednicka-politika', 'Urednička politika', 'portal', false, [
    { h2: 'Kako biramo recepte' },
    { p: 'Objavljujemo domaće i provjereno izvodljive recepte koje bismo i sami pripremili. Prednost imaju jela koja se prave od lako dostupnih namirnica.' },
    { h2: 'Kako uređujemo recept' },
    { ul: [
      'količine pišemo u gramima, mililitrima ili uobičajenim kuhinjskim mjerama, uz napomenu kad je količina „po ukusu“;',
      'vrijeme dijelimo na pripremu, kuhanje ili pečenje i čekanje, a ukupno vrijeme upisujemo kao stvarno proteklo vrijeme;',
      'korake pišemo redom kojim se izvode, s temperaturom i veličinom kalupa gdje su bitni;',
      'fotografija mora prikazivati baš to jelo.',
    ] },
    { h2: 'Ispravke' },
    { p: 'Ako primijetite grešku, koristite obrazac „Prijavi grešku u receptu“. Prijave pregleda uredništvo; kad recept bitno izmijenimo, mijenja se i datum „Ažurirano“.' },
    { h2: 'Komentari i ocjene' },
    { p: 'Iskustva, pitanja i ocjene čitalaca objavljujemo tek nakon pregleda. Ne objavljujemo uvredljive poruke, reklame ni lične podatke.' },
  ])
  await page('kontakt', 'Kontakt', 'portal', false, [
    { p: 'Imate pitanje, prijedlog recepta ili ste pronašli grešku? Pošaljite nam poruku putem obrasca ispod — odgovaramo što prije možemo.' },
    { p: 'Za pitanje o konkretnom receptu najbrže je koristiti obrazac na stranici tog recepta. Poruke možete poslati i preko naše Facebook stranice.' },
  ])
  await page('privatnost', 'Politika privatnosti', 'pravno', false, [
    { p: 'Ova politika objašnjava koje podatke prikuplja portal Srce naše kuhinje, zašto ih prikuplja i kako ih štiti. Rukovalac podacima je Srce naše kuhinje (u daljem tekstu: „mi“). Za sva pitanja o privatnosti pišite nam putem stranice Kontakt.' },
    { h2: 'Podaci koji ostaju u vašem pregledniku' },
    { p: 'Moja kuharica, plan obroka, lista za kupovinu, označeni sastojci, tajmeri i nedavno pregledani recepti čuvaju se samo u vašem pregledniku (lokalno skladište) i ne šalju se na naš server. Brisanjem podataka preglednika ti podaci nestaju.' },
    { h2: 'Podaci koje nam pošaljete' },
    { ul: [
      'Kontakt, prijava greške i iskustvo s receptom: ime, tekst poruke i email ako ga upišete. Email se nikad ne objavljuje.',
      'Račun za slanje recepata: ime za prikaz, email, lozinka (čuva se isključivo kao zaštićeni hash), kratko predstavljanje i recepti s fotografijama koje pošaljete.',
      'Radi zaštite od zloupotrebe čuvamo zaštićeni (hashirani) otisak IP adrese, ne samu adresu.',
    ] },
    { h2: 'Svrha i pravni osnov' },
    { p: 'Podatke koristimo samo da bismo odgovorili na poruke, ispravili recepte, moderirali i objavili sadržaj koji ste poslali te zaštitili portal od zloupotrebe. Podatke ne prodajemo i ne ustupamo trećim stranama radi marketinga.' },
    { h2: 'Koliko dugo čuvamo podatke' },
    { p: 'Poruke čuvamo dok su potrebne za odgovor i evidenciju ispravki, a najduže dvije godine. Račun i poslane recepte čuvamo dok račun postoji; na zahtjev ih brišemo u roku od 30 dana.' },
    { h2: 'Oglašavanje i kolačići trećih strana' },
    { p: 'Kada na portalu budu prikazani oglasi, treće strane, uključujući Google, mogu koristiti kolačiće za prikaz oglasa na osnovu vaših ranijih posjeta ovom i drugim sajtovima. Personalizovane oglase možete isključiti u Google postavkama oglasa (adssettings.google.com). Prije uključivanja takvih kolačića tražit ćemo vaš pristanak. Detalji su na stranici Kolačići.' },
    { h2: 'Vaša prava' },
    { p: 'Imate pravo zatražiti uvid u svoje podatke, njihovu ispravku ili brisanje, kao i povući pristanak. Zahtjev pošaljite putem stranice Kontakt.' },
    { h2: 'Izmjene politike' },
    { p: 'O bitnim izmjenama obavijestit ćemo na ovoj stranici; datum posljednje izmjene naveden je na dnu.' },
  ])
  await page('kolacici', 'Kolačići', 'pravno', false, [
    { p: 'Kolačići su male tekstualne datoteke koje sajt sprema u vaš preglednik. Ovdje navodimo koje kolačiće i slične tehnologije koristimo.' },
    { h2: 'Neophodni' },
    { ul: [
      'kolačić prijave za članove koji šalju recepte (snk-clan) — traje do 30 dana ili do odjave;',
      'tehnički kolačić za prijavu urednika u administraciju;',
      'lokalno skladište preglednika za Moju kuharicu, plan, listu za kupovinu, označene sastojke, tajmere i nedavno pregledane recepte — ovi podaci se ne šalju na server.',
    ] },
    { h2: 'Analitika i oglasi' },
    { p: 'Kada uvedemo analitiku posjeta ili oglase (npr. Google AdSense), ti servisi mogu koristiti vlastite kolačiće. Prije njihovog uključivanja prikazat ćemo obavještenje i tražiti pristanak, a pristanak ćete moći povući u bilo kojem trenutku.' },
    { h2: 'Upravljanje kolačićima' },
    { p: 'Kolačiće možete obrisati ili blokirati u postavkama preglednika. Ako blokirate neophodne kolačiće, prijava za slanje recepata neće raditi; Moja kuharica tada radi samo dok je stranica otvorena.' },
  ])
  await page('uslovi-koristenja', 'Uslovi korištenja', 'pravno', false, [
    { p: 'Korištenjem portala Srce naše kuhinje prihvatate ove uslove. Izdavač portala je Srce naše kuhinje. Na ove uslove primjenjuje se pravo Bosne i Hercegovine.' },
    { h2: 'Autorska prava' },
    { p: 'Recepti, tekstovi i fotografije na ovom sajtu su autorski sadržaj. Dozvoljeno je dijeliti link na recept i štampati recept za ličnu upotrebu; preuzimanje teksta ili fotografija na druge sajtove ili društvene mreže bez dozvole nije dozvoljeno.' },
    { h2: 'Recepti čitalaca' },
    { ul: [
      'Šaljete samo recepte i fotografije koje su vaše ili za koje imate dozvolu.',
      'Slanjem nam dajete pravo da recept, fotografiju i ime za prikaz objavimo na portalu i na našoj Facebook stranici i u grupi, uz navođenje vas kao autora.',
      'Svaki recept pregleda uredništvo; zadržavamo pravo da recept uredimo, ne objavimo ili uklonimo.',
      'Zabranjeni su reklamni sadržaj, linkovi na sumnjive stranice, tuđe fotografije i uvredljiv sadržaj. Račun koji krši pravila može biti blokiran.',
    ] },
    { h2: 'Odgovornost' },
    { p: 'Recepte pripremate na vlastitu odgovornost. Provjerite sastojke ako imate alergije ili posebne prehrambene potrebe; vremena i temperature mogu se razlikovati zavisno od rerne i posuđa.' },
    { h2: 'Izmjene uslova' },
    { p: 'Uslove možemo povremeno ažurirati; važeća verzija je uvijek objavljena na ovoj stranici.' },
  ])

  console.log('Postavljam početnu, obroke, navigaciju i osnovne namirnice…')
  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      facebookUrl: 'https://www.facebook.com/profile.php?id=61583909786746',
      facebookName: 'Srce naše kuhinje – najbolji recepti',
      facebookGroupUrl: 'https://www.facebook.com/groups/1667945840861199',
      organizationName: 'Srce naše kuhinje',
      features: { comments: true, ratings: true, pantryPromo: true, corrections: true, minCollectionRecipes: 3 },
    },
  })
  const featured = ['cokoladna-torta-bez-pecenja', 'musaka-s-krompirom', 'pileca-prsa-u-sosu-od-pavlake', 'grah-sa-suhim-mesom']
  await payload.updateGlobal({
    slug: 'home-page',
    overrideAccess: true,
    data: {
      hero: { enabled: true, title: 'Šta danas kuhamo?', text: 'Odaberite obrok, upišite jelo ili namirnice koje imate — ostalo je na nama.', image: await image(payload, 'pocetna-hero', 'Srce naše kuhinje') },
      quickLinks: {
        enabled: true,
        title: 'Brzi izbor',
        links: [
          { label: 'Ručak do 30 minuta', targetType: 'collection', collection: K.rucak },
          { label: 'Iz jedne posude', targetType: 'collection', collection: K.jednaPosuda },
          { label: 'Obroci za ponijeti', targetType: 'collection', collection: K.ponijeti },
          { label: 'Pripremi danas za sutra', targetType: 'collection', collection: K.sutra },
        ],
      },
      featured: { enabled: true, title: 'Danas izdvajamo', items: await Promise.all(featured.map(async (s) => ({ recipe: await recipeId(s) }))) },
      categories: { enabled: true, title: 'Recepti po vrsti jela' },
      facebook: { enabled: true, title: 'Sa naše Facebook stranice', count: 6 },
      pantry: {
        enabled: true,
        title: 'Šta imate u frižideru?',
        text: 'Odaberite namirnice koje imate — pokazat ćemo šta možete skuhati.',
        quickIngredients: await Promise.all(['jaja', 'krompir', 'piletina', 'mljeveno-meso', 'kore-za-pitu', 'jabuke'].map(ingredientId)),
      },
      sweet: {
        enabled: true,
        title: 'Nešto slatko',
        recipes: await Promise.all(['palacinke', 'vanilice', 'kuglice-od-keksa', 'pita-s-jabukama', 'pecene-jabuke-s-orasima'].map(recipeId)),
      },
      season: { enabled: true, title: 'Sezona jabuka', collection: K.jabuke, guide: G['kako-cuvati-jabuke'] },
      latest: { enabled: true, title: 'Najnoviji recepti' },
      guides: { enabled: true, title: 'Malo znanja, lakša kuhinja' },
      community: { enabled: true, title: 'Pridružite nam se na Facebooku', text: 'Svakog dana dijelimo nove recepte i odgovaramo na vaša pitanja.' },
    },
  })
  await payload.updateGlobal({
    slug: 'meal-pages',
    overrideAccess: true,
    data: {
      dorucak: {
        title: 'Doručak',
        intro: 'Brzi doručci za radne dane i nešto bogatiji za vikend: jaja, peciva, kaše i pite.',
        image: await image(payload, 'obrok-dorucak', 'Doručak'),
        collections: [K.ponijeti],
      },
      rucak: {
        title: 'Ručak',
        intro: 'Od ručka gotovog za pola sata do nedjeljnog stola: glavna jela, supe, prilozi i salate.',
        image: await image(payload, 'obrok-rucak', 'Ručak'),
        collections: [K.rucak, K.jednaPosuda, K.sutra, K.porodica],
      },
      vecera: {
        title: 'Večera',
        intro: 'Lagane i brze večere, ali i jela koja možete pripremiti danas, a pojesti sutra.',
        image: await image(payload, 'obrok-vecera', 'Večera'),
        collections: [K.ponijeti, K.jednaPosuda],
      },
    },
  })
  await payload.updateGlobal({
    slug: 'navigation',
    overrideAccess: true,
    data: {
      footerCategories: ['glavna-jela', 'supe-i-corbe', 'pite-i-peciva', 'slatki-recepti', 'zimnica'].map((s) => C[s]),
      footerGuides: Object.values(G),
    },
  })
  await payload.updateGlobal({
    slug: 'pantry-basics',
    overrideAccess: true,
    data: { items: await Promise.all(['so', 'biber', 'voda', 'ulje', 'secer', 'brasno'].map(ingredientId)), publicApproved: false },
  })


  console.log('Demo sadržaj je spreman. Svi demo zapisi su označeni kao demonstracijski.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
