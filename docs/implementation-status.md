# Status implementacije

Stanje: 15. oktobar 2026. Etape A i B su urađene, a etapa C je urađena djelimično (vidi „Nedovršeno”). Ništa nije javno objavljeno.

## Urađeno

### Etapa A — osnova i dizajn
- Novi projekat (direktorij je bio prazan; nema AGENTS.md od korisnika — Next.js 16 sam generiše AGENTS.md/CLAUDE.md, projektne napomene su dodane ispod).
- Kompatibilan i zaključan stack (vidi [architecture.md](architecture.md)), lokalni PostgreSQL bez Dockera, migracije, ponovljiv seed.
- Payload CMS: 14 kolekcija, 4 globalne postavke, draftovi, verzije, pregled prije objave, urednička validacija, uloge.
- Vizuelni sistem prema logu (boje, Lora + Source Sans 3 posluženi lokalno, linijske ikone, 44 px dodirne mete, max ~1200 px).
- Privremeni logo: horizontalni, kompaktni, favicon.
- Header (desktop meni kategorija; mobilni dijalog s Escape i povratkom fokusa), footer, skip link.
- Stranice: početna (11 sekcija iz CMS-a), svi recepti + pretraga, kategorija, kolekcija, recept, indeks i detalj namirnice, indeks i detalj vodiča, Šta danas kuhati, Moja kuharica, Moj plan, Lista za kupovinu, Kontakt, Autori i uredništvo, informativne stranice, 404, privremena greška, skeleton arhive.

### Etapa B — funkcije
- **Pretraga i filteri** u PostgreSQL-u (trigram indeksi): bez dijakritike, sinonimi (krompir/krumpir, bijeli luk/češnjak…), prioritet naslova; filteri kategorija, uključene (sve/bilo koja) i isključene namirnice, vrijeme, metoda, težina, prehrambena svojstva; stanje u URL-u; aktivni uslovi s uklanjanjem; linkovana paginacija; mobilni panel s „Primijeni (N)”; stanje bez rezultata s prijedlozima; prijedlozi pri tipkanju (250 ms, min. 2 znaka, prekid zahtjeva, rate limit).
- **Moja kuharica**: srce bez računa, potvrda za čitače ekrana, poništavanje, privatne kolekcije (Želim probati, Omiljeno, vlastite), pretraga, izvoz/uvoz JSON, nedostupni recepti, oštećeni/blokirani podaci bez rušenja.
- **Porcije**: 0,5×/1×/2× i ciljni broj; razlomci, rasponi, „po ukusu”; jaja s objašnjenjem zaokruživanja; recept bez pouzdane osnove isključuje preračun; vrijeme i kalup se ne mijenjaju.
- **Checkboxovi sastojaka** po receptu + Očisti oznake; grupe (podloga, krema…); alternative „ili”.
- **Način kuhanja**: jedan korak, veliki tekst, tastatura (← →, Escape), fokus, napredak + Nastavi/Počni ispočetka, sastojci unutar načina, Wake Lock samo na zahtjev, bez oglasa.
- **Tajmeri** po koraku, računaju se od završnog trenutka (tačni nakon pozadine), pauza/nastavak/poništi, vidljivi na svim stranicama; ne obećava se alarm kad je preglednik zatvoren.
- **Štampa** (s fotografijom ili bez nje), **dijeljenje** (Web Share / kopiranje linka), **nedavno pregledano** (lokalno, 8, može se očistiti).
- **Plan** do 7 recepata, dan, porcije, isti recept više puta; odvojeno od čuvanja.
- **Lista za kupovinu**: iz recepta (sve ili samo neoznačeno) i iz plana; spajanje g↔kg, ml↔dl↔l; nespojive jedinice odvojeno; izvori stavki; ručne stavke; „Osvježi listu” s upozorenjem prije gubitka oznaka; kopiranje kao tekst; štampa.
- **Šta imam u kuhinji**: autocomplete normalizovanih namirnica, isključivanje, vrsta jela, vrijeme, „Imam osnovne namirnice” (urednički spisak), poredak sve/1/2 nedostaje uz popis, opcionalno se ne broji, alternative, širi pojmovi; jasna napomena da se ne provjeravaju količine. Promotivni blok na početnoj je isključen dok urednik ne odobri bazu.
- **Moderirane forme**: iskustva/pitanja + ocjene, prijava greške (veže recept), kontakt — sve u CMS, ništa automatski javno; zaštita od spama i zloupotrebe.
- **Uvoz/izvoz** JSON (dry-run, draft, duplikati po uid/slugu, `--update-drafts`), primjer formata.

### Etapa C — provjera (urađeni dijelovi)
- Recipe/Breadcrumb/WebSite/Organization/Article/CollectionPage JSON-LD; canonical, OG/Twitter, sitemap, robots, 301 pri promjeni sluga, noindex za filtere i lokalne alate.
- Testovi, build, lint, typecheck, snimci, laboratorijsko mjerenje performansi (rezultati ispod).

## Rezultati provjera (15. 10. 2026, Windows 10, Node 24.21, lokalni PostgreSQL 17.10)

| Provjera | Rezultat |
|---|---|
| `npm run typecheck` | prolazi |
| `npm run lint` | prolazi, 0 upozorenja |
| `npm run build` | prolazi (recept, vodič, namirnica, informativne stranice: ISR; početna i indeksi: statični s osvježavanjem) |
| Unit testovi (`test:unit`) | 55/55 — preračun količina, spajanje liste, podudaranje namirnica, pretraga i URL stanje, spremište/uvoz kuharice, tajmeri, schema, zaštita formi, format uvoza |
| Integracijski (`test:int`) | 11/11 — javni pristup (draftovi, verzije, poruke, korisnici, email u komentarima), uvoz (dry-run, draft, duplikat, neispravna datoteka), objava + promjena sluga → 301, javni REST API |
| E2E (`test:e2e`) | 23/23 — obroci (početna → doručak), filter Bez mesa / S mesom, pretraga „piletina krompir”, prag kolekcija (404 ispod praga), prilozi i ostaci na receptu, pretraga sinonima i bez kvačica, povratak u filtere, bez rezultata, kuharica (čuvanje/osvježavanje/uklanjanje/poništavanje/izvoz/uvoz/oštećeni podaci), srce ne otvara karticu, porcije i jaja, način kuhanja s tastaturom i nastavkom, tajmer nakon „pozadine”, recept bez JS-a, schema, plan → lista → osvježavanje uz ručne stavke, alat za namirnice, objava recepta (draft 404 → objava → vidljivo i pretraživo), mobilni meni, mobilna traka, mobilni filteri |
| Prelijevanje (360/390/768/1440 px, 13 stranica) | nema horizontalnog prelijevanja (`scripts/screenshots.ts`; snimci u `screenshots/`) |
| Štampa | PDF provjeren: `screenshots/stampa-s-fotografijom.pdf`, `stampa-bez-fotografije.pdf` |

### Performanse

Lighthouse 13.5 (mobilna emulacija, simulirani spori 4G i 4× sporiji CPU), produkcijski build (`next start`), lokalno, demo slike realne veličine (JPEG ~1600×1200):

| Predložak | Performance | LCP (sim.) | CLS | TBT | Pristupačnost | Najbolje prakse |
|---|---|---|---|---|---|---|
| Početna | 92 | 3,3 s | 0 | 30 ms | 100 | 100 |
| Recept | 89–91 | 3,5–3,7 s | 0 | 50–110 ms | 100 | 100 |
| Arhiva | 90–91 | 3,5 s | 0 | 50–60 ms | 100 | 100 |
| Moja kuharica | 91–92 | 3,3–3,4 s | 0,008 | 90 ms | 100 | 100 |
| Vodič | 93 | 3,2 s | 0 | 50 ms | 100 | 100 |

- Izmjereni (nesimulirani) LCP lokalno: ~0,5 s. SEO ocjena 66–69 je očekivana jer je indeksiranje namjerno isključeno (`noindex`) dok `SITE_ENV` nije `production`.
- **LCP cilj ≤ 2,5 s u simulaciji još nije postignut.** Popravljeno tokom mjerenja: Payloadovo zaglavlje `Critical-CH` (−0,6 s ponovnog zahtjeva), CLS kuharice 0,337 → 0,008, `<dl>` pristupačnost 93 → 100. Sljedeći kandidati: manje fontova (jedna porodica ili samo latin-ext za naslove), provjera na stvarnom hostingu s CDN-om/HTTP2 i kompresijom, stvarne fotografije u AVIF/WebP.
- Laboratorijski rezultat nije dokaz terenskih metrika (CrUX/RUM) — mjeriti ponovo nakon izbora hostinga.

## Drugi krug (15. 10. 2026, uveče)

- Originalni logo (raster) izdvojen s providnom pozadinom: znak, natpis, favicon, apple ikona.
- Vizuelna dorada prema smjeru „noviportalznanja” (bez kopiranja): topla pozadina, krem/pješčane sekcije, oznake iznad naslova, podijeljen hero, red brzih kolekcija, velika kartica + lista, kategorije s fotografijom, bordo blok „Šta imate u frižideru?”, sezonski baner, footer.
- Početna: Doručak / Ručak / Večera kao glavni izbor; stranice `/dorucak/`, `/rucak/`, `/vecera/` s uvodom, izdvojenim kolekcijama i filterima.
- Filteri: Obrok, S mesom / Bez mesa (izvodi se iz grupe namirnica); metode „U rerni”, „U tavi”, „Kuhanje”…
- Kolekcije: Ručak do 30 minuta, Iz jedne posude, Obroci za ponijeti, Pripremi danas za sutra, Ideje za porodični ručak; prikaz tek iznad praga recepata.
- Recept: „Idi na recept”, „Sačuvaj recept”, vidljivo sačuvano stanje, „Šta poslužiti uz ovo?”, napomena o ostacima; način kuhanja automatski drži ekran upaljenim (gdje preglednik podržava; može se isključiti).
- Facebook URL, uredništvo, O nama, Urednička politika, Kontakt (s formom), Kolačići popunjeni; Privatnost i Uslovi čekaju pravne podatke.
- Demo: 25 recepata, 61 namirnica. Testovi: unit 55, integracijski 11, E2E 23 — svi prolaze; bez prelijevanja na 360/390/768/1440 px.
- Odstupanje: promotivni blok „Šta imate u frižideru?” je u razvoju vidljiv; u produkciji se prikazuje tek kad urednik označi bazu namirnica kao odobrenu.

## Nedovršeno i ograničenja

- **LCP** u simuliranom mobilnom profilu (vidi gore).
- **Ručna provjera čitačem ekrana** (NVDA/TalkBack) nije urađena; urađene su automatske provjere (Lighthouse 100) i tastaturni E2E tokovi.
- **Email obavijesti** za kontakt/prijave: nema mail servisa (poruke se čuvaju u CMS-u). Payload javlja „No email adapter” — očekivano.
- **Rate limit** je u memoriji procesa (vidi architecture.md).
- **410 Gone:** preusmjerenje tipa 410 trenutno vraća 404 (App Router stranica ne može postaviti 410 bez middleware sloja). 301 radi.
- **Ocjene na karticama** se ne prikazuju (prikazuju se samo na receptu, i to samo odobrene).
- **Indeks kolekcija** (`/kolekcije/`) ne postoji kao stranica — kolekcije su dostupne kroz početnu, Šta danas kuhati i linkove.
- **Oglasi i consent:** samo rezervisana mjesta (isključeno); CMP nije odabran.
- **Hosting i domena** nisu odabrani; produkcijski deployment nije rađen.
- Prijevod sučelja administracije je hrvatski (Payload nema bosanski).
- `npm install` prijavljuje zastarjele tranzitivne pakete (npr. `@esbuild-kit/*` iz alata Payloada); `npm audit` nije rađen kao dio ove etape.

## Blokade (traže korisnika)

Ništa ne blokira nastavak razvoja. Za objavu su potrebni materijali sa [launch-checklist.md](launch-checklist.md).

## Lokalno okruženje — šta je instalirano izvan projekta

- Microsoft Visual C++ 2015–2022 Redistributable (x64) preko wingeta — potreban PostgreSQL binarnim fajlovima na Windowsu.
- Playwright Chromium (`%LOCALAPPDATA%\ms-playwright`) za testove i snimke.

## Treći krug (15. 10. 2026, kasno uveče)

- Početna: desno u heroju je traženje po namirnicama (autocomplete, brzi izbor, osnovne namirnice) umjesto izdvojenog recepta; izdvojeni recept je u sekciji „Danas izdvajamo”.
- Više crvene: crvena gornja linija headera, crvena traka brzih kolekcija, bordo footer, ikone u crvenim krugovima; okvir „kao linije loga” (tamnija + svjetlija crvena) na dugmetu Moja kuharica, profilu, pločicama obroka i brzim izborima.
- Puni desktop header od 1280 px; ispod toga kompaktni header s menijem.
- Autori: Amra Hodžić (slatki recepti), Emir Delić (glavna jela, supe, pite, zimnica), Selma Begić (vodiči), uz Uredništvo za ostalo — recepti su raspoređeni po kategoriji.
- Privatnost, Kolačići i Uslovi korištenja finalizirani (uključujući oglašavanje/Google kolačiće i pravila za recepte čitalaca).
- Recepti čitalaca: registracija i prijava članova (zaseban kolačić, bez pristupa administraciji), panel „Moji recepti” (slanje recepta sa slikom, pričom i predstavljanjem; status; poruka urednika), javna stranica tek nakon odobrenja (noindex), dijeljenje na Facebook (link, bez skripti), oznaka „Izdvojeno na Facebooku”, gostujući autor na receptu. Slike: samo JPG/PNG/WebP do 8 MB, dekodiraju se i ponovo kodiraju u WebP (drugi fajlovi ne prolaze). Rate limit: registracija 5/h po IP, slanje 5/dan po članu.
- Facebook grupa: footer, blok zajednice, recepti čitalaca, panel člana, jedna rečenica uz iskustva na receptu.
- Napomena: zaboravljena lozinka nije ponuđena dok se ne odabere mail servis (ne prikazujemo dugmad koja ne rade).
- Testovi: unit 55, integracijski 11, E2E 24 — svi prolaze; bez prelijevanja na 360/390/768/1024/1280/1440 px.

## Četvrti krug: usklađivanje sa sadržajnim planom (16. 10. 2026.)

- Plan je u `content/plan/content-plan-srce-nase-kuhinje.md`; pravila za njegovu primjenu su u `content/PRAVILA-PISANJA.md`, dio 0.
- Kategorije iz plana (9 glavnih i 31 potkategorija) se upisuju naredbom `npm run taxonomy`. Kod je u `src/lib/content/taxonomy.ts`, a tekstovi o kategorijama i 110 kanonskih oznaka u `taxonomy-texts.ts`. Kategorije nisu demo sadržaj.
- Oznake imaju grupu (glavna namirnica, vrsta tijesta) i sinonime za pretragu (npr. pasulj → grah). Novi filteri su „Glavna namirnica“ i „Vrsta tijesta“ (`?oznaka=`).
- Sastav prema planu: `bez-laktoze` je preimenovano u `bez-mlijeka`, a dodani su `vegansko`, `bez-brasna` i `bez-kvasca`. Način pripreme ima novu vrijednost „Friteza na vrući zrak“. Migracija pretvara postojeće vrijednosti.
- Kolekcije su na `/ideje/` (stari `/kolekcije/` se preusmjerava trajnim 308 preusmjerenjem) i mogu imati članak s automatskom preglednom tabelom. Članci se uvoze kao `ideas` u formatu `srce-nase-kuhinje/v1`. Recepti i ideje imaju interno polje `planId`.
- Dizajn: manje crvene na početnoj (neutralni okviri, nježne ikone), a dvostruke pruge s prelazom boje iz loga (`.logo-stripes`, `.card-stripes`) idu ispod headera i na karticama.
