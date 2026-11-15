# PREPIS-NASIRECEPTI.md — pravila za prepis recepata s nasirecepti.com

> **Važi SAMO za recepte preuzete s nasirecepti.com.**
> Za nove recepte se ne koristi. Novi recepti idu po UREDNICKI-VODIC.md, PRAVILA-PISANJA.md, PRAVILA-BRIEFA.md i AUTORI-STILOVI.md, bez ikakve veze s nasirecepti.
> Sve iz UREDNICKI-VODIC.md i PRAVILA-PISANJA.md važi i ovdje (jezik, zabrane, izgled stranice, SEO, slike, uvoz). Ovaj fajl dodaje samo ono što je posebno za prepis.

---

## 1. Izvor: stari post s nasirecepti

Ulaz je XML izvoz iz WordPressa (npr. `nasirecepti.WordPress.2026-11-14.xml`, kategorija po kategorija).

**Iz starog posta se uzima samo recept:**
- sastojci i količine;
- vremena (priprema, kuhanje, pečenje), temperature, kalup ili posuda;
- redoslijed radnji (iz polja step_1…step_5 i teksta);
- broj porcija, težina;
- ključne riječi (tačka 3).

**Ne uzima se ništa od teksta:** ni rečenice, ni struktura, ni H2, ni uvod, ni FAQ, ni meta opis. Članak, kratak opis, koraci, FAQ i SEO pišu se potpuno ispočetka. Test: tekst bi bio isti i da stari post nikad nije pročitan dalje od sastojaka i koraka.

**Recepti se smatraju tačnim.** Vanjski izvori se ne traže. Ali obavezno se sređuje:
- **Čudne brojke se zaokružuju na razumnu mjeru:** 154 g → 155 g, 113 g → 115 g, 482 g → oko 480 g. Kašike i kašičice ostaju kašike.
- **Nema američkih mjera:** šolje (cup), unce (oz), funte (lb), štapići maslaca, °F. Sve u g, ml, kom, kašike/kašičice, °C. Ako je pretvaranje nesigurno, zapisati `NEDOSTAJE: provjera mjere – …` i ne nagađati.
- **Nema stranih brendova ni proizvoda kojih kod nas nema:** umjesto naziva brenda ide naša, opšta namirnica (npr. "kisela pavlaka", "krem sir", "pileći temeljac"). Proizvodi koji se kod nas teško nalaze (npr. "half-and-half", "heavy cream", "cake flour", "kosher salt") prevode se u ono što se kod nas kupuje.
- **Očite greške u receptu** (npr. 3 kg soli, vrijeme koje se ne slaže između teksta i koraka) ne popravljati nagađanjem: zapisati `NEDOSTAJE: …` i javiti u izvještaju.
- **Očito neizvodljiv recept** (premalo tečnosti, prekratko vrijeme, fali korak) smije se dopuniti **standardnom vrijednošću** za takvo jelo (odluka urednika 2026-11-15). Svaka takva dopuna mora biti u izvještaju (tabela „Mjere koje sam dodao“: šta je falilo ili bilo sumnjivo → šta je upisano) i u `sourceNote` recepta. Ako nije jasno šta je standard, i dalje ide `NEDOSTAJE` i recept ne ide dalje.

**Koraci nisu ograničeni na 5.** Na nasirecepti je šablon dozvoljavao najviše 5 koraka (step_1…step_5), pa su stari koraci često zbijeni (više radnji u jednom). Kod nas koraka ima koliko recept stvarno traži: jedna radnja po koraku (PRAVILA-PISANJA.md §4), pa zbijeni korak može postati dva ili tri. Ne forsira se ni veći ni manji broj — ne dijeliti radnje umjetno i ne dodavati korake koji ništa ne govore. Dodatno objašnjenje uz korak (znak da je gotovo, temperatura, trajanje) ide u korak; "zašto" ide u članak.

Stari post se upisuje samo u interno polje `sourceNote` (URL + ID starog posta). U javnom tekstu se nikad ne spominje.

## 2. Jezik

**Jezik je bosanski, ijekavica.** Važi tabela termina iz PRAVILA-PISANJA.md §1 i glas iz UREDNICKI-VODIC.md §7 (obraćanje u 2. licu množine; kašika, rerna, krompir, paradajz, pavlaka, hljeb, so, kafa, sedmica, bijeli/crni luk…).

**Glas je "vi" svuda:** u članku, kratkom opisu, koracima na kartici i FAQ-u ("Dodajte", "Ostavite", "Pecite"). Nema infinitiva u koracima ("dodati", "promiješati") ni miješanja oblika unutar recepta. Stari postovi često imaju korake u infinitivu, pa se svi prepisuju u "vi".

Stari tekstovi su na hrvatskom. Posebno paziti na: češnjak, rajčica, krumpir, pećnica, žlica, umak, juha, papar, sol, kruh, vrhnje, tijekom, blagdani, obitelj, tjedan. Lista se dopunjava kad provjera nađe novu riječ.

## 3. Ključne riječi

Ključne riječi se uzimaju iz tri mjesta u starom postu:
1. `rank_math_title` i `rank_math_focus_keyword` (meta);
2. naslov posta (H1);
3. tekst: pojmovi koji se ponavljaju i nose namjeru (npr. "slavonska hladetina", "čobanac").

Iz toga se bira **jedan glavni pojam** (ide u SEO naslov i H1) i 1–3 sporedna (prirodno u tekstu i alternativeNames).

Glavni pojam se prevodi na bosanski ako je hrvatski (npr. "krumpir gulaš" → "krompir gulaš"), osim ako je to vlastiti naziv jela.

**Prije pisanja provjeriti:** glavni pojam nije već zauzet na srcenasekuhinje.net (postojeći recept) ni na slatkireceptar.com. Ako jeste, javiti i ne pisati dok se ne odluči.

**Zabranjeno** (stari tekstovi su puni toga): podebljana ključna riječ, ključna riječ u svakom pasusu, "recept X donosi…", "ovaj recept X…".

## 4. Autor

Autor se bira po oblasti, kako piše na stranici autora:
- **Emir Delić:** glavna jela, supe, čorbe, pite, zimnica;
- **Amra Hodžić:** slatki recepti, torte, kolači, palačinke, sitni kolači;
- **Selma Begić:** savjeti iz kuhinje, namirnice, čuvanje hrane, tehnike (vodiči);
- **Uredništvo Srce naše kuhinje:** bilo koja vrsta.

**Rotacija:** u okviru oblasti autori idu naizmjenično, da ne bude sve od jednog. Za glavna jela, supe i pite to je Emir ↔ Uredništvo, za slatko Amra ↔ Uredništvo. Isti autor najviše 2 recepta zaredom.

Stil svakog autora, lični detalj i duhovit ton određeni su u **AUTORI-STILOVI.md** (važi za cijeli sajt).

## 5. Brief prije svakog recepta (obavezno)

Prije pisanja se pravi brief po pravilima iz **PRAVILA-BRIEFA.md** (poseban fajl, čitati ga prije svakog briefa). Bez briefa nema pisanja.

Brief je kratak (6–10 redova) i sadrži najmanje:
- glavni i sporedni pojmovi (iz tačke 3);
- autor (iz tačke 4);
- pristup (jedan od 5 iz UREDNICKI-VODIC.md) i stil autora;
- šta je ključno kod ovog jela, odnosno njegov "trik" ili ugao;
- tip uvoda, skup sekcija i završetak, izabrani tako da se ne ponove u odnosu na log;
- šta treba srediti u receptu (zaokruživanje, mjere, brendovi, NEDOSTAJE).

Prije briefa se obavezno pročita log (tačka 7).

Pišu se **jedan po jedan**, svaki iz svog briefa. Nikad više recepata iz zajedničkog plana.

## 6. Provjere (obavezne, prije predaje)

1. **Ponavljanje fraza i konstrukcija** među receptima i na cijelom sajtu.
2. **Struktura:** broj H2, dužine sekcija (ne smiju biti sumnjivo jednake), isti skup sekcija, isti početak ili kraj kao kod zadnjih recepata.
3. **Jezik:** hrvatske riječi iz tačke 2.
4. **Recept:** brojke u tekstu i na kartici se slažu, nema američkih mjera ni stranih brendova, nema zaostalih čudnih brojki.
5. **Original:** nijedna rečenica iz starog posta (provjera poređenjem).

Pokreće se: `python -I scripts/provjera-tekstova.py content/recepti/nasirecepti-*.json --xml nasirecepti.WordPress.2026-11-14.xml` (sve serije zajedno, redom iz loga).

**Granice šablona za cijeli sajt** (provjerava `scripts/provjera-tekstova.py`):
- rečenica o prilogu na kraju („Uz … ide / poslužite / služe se …“): najviše 1 u 5 recepata, i samo kad prilog stvarno nešto znači za jelo;
- naslovi „Kad nešto ne ide…“ i „Šta se (najčešće) pita…“: svaki najviše jednom na sajtu;
- „Tri situacije / problema … (naj)češće“: najviše jednom na sajtu;
- „jedna tava / jednoj tavi“ u uvodu: najviše 1 u 10;
- „radni dan“: najviše 1 u 5;
- ulaz „problem + skoro uvijek / najčešće / gotovo uvijek“: najviše 1 u 5;
- sekcija razbijena na H3 podnaslove: najviše 1 u 5;
- kraj teksta o ostacima i podgrijavanju („ostatak se drži u frižideru…“, „pri podgrijavanju dolijte…“): najviše 1 u 5;
- H2 u obliku „X se Y, ne Z“ („Luk se riba, ne sjecka“): najviše 1 u 10;
- naslov u obliku pitanja (H2 ili H3): najviše 1 H2 i 1 H3 po receptu, a recept s takvim naslovom najviše 2 u 5;
- lični detalj „kod nas“: najviše 1 u 5 tekstova istog autora;
- isti savjet (npr. zapečeno s dna tave za sos) razvijen u tekstu samo u jednom receptu; u ostalima samo kratko u koraku.

**Granice koje se provjeravaju čitanjem** (skripta ih ne hvata):
- izbor dijela piletine („zabatak, a ne prsa“, „prsa s kožom, a ne file“) više nije ugao teksta ni posebna sekcija — to je već urađeno 4 puta (NR-003, 009, 011, 017); u novim pilećim receptima najviše jedna rečenica;
- leća „jeftino i za više ljudi“ kod Emira ostaje, ali nikad istim riječima kao u ranijim receptima („Kad za stolom ima više ljudi…“, „jeftiniji, pa…“, „ručak se lako rastegne“); prije pisanja pročitati zadnje Emirove tekstove;
- uvod ne poredi jelo s „klasičnom“ verzijom ako je to već urađeno u srodnom receptu (npr. rižota: poređenje je u rižotu s gljivama).

**Provjera samo javlja, a tekst se popravlja po smislu.** Nikad se ne ubacuju kratke rečenice, linkovi ili tekst samo da bi provjera prošla.

## 7. Log

U log (npr. `content/log-prepis-nasirecepti.md`) se za svaki recept upisuje:
SNK ID · stari ID · slug · autor · pristup · tip uvoda · broj H2 · vrste sekcija · oblik grešaka (ako ih ima) · završetak · zadnja rečenica teksta · H2 pitanja (broj) · linkovi · status.

**Rotacija iz loga:**
- isti pristup ne dva puta zaredom i nijedan preko ~25% recepata;
- isti tip uvoda najviše 2 od 5 zadnjih;
- isti završetak ne dva puta zaredom;
- greške (ako ih recept ima) svaki put drugim oblikom: proza, H3 pod-naslovi, pitanje-odgovor, uklopljene u drugu sekciju;
- isti broj H2 ne 3 puta zaredom.

## 8. ID-ovi

Svaki recept dobija ID iz plana u obliku **SNK-NR-001, SNK-NR-002…** i upisuje se u sadržajni plan kao preuzet s nasirecepti.

## 9. Slike

Slike pravi urednik i stavlja ih u folder **`reciklaza-slike/`**.

**Naziv fajla nije slug recepta.** URL slike i URL recepta ne smiju biti isti, pa urednik slike imenuje nazivom jela ili ključnim riječima (npr. `hladetina od svinjskih nogica.webp`). Ovo pravilo ovdje ima prednost pred „Naziv fajla: slug-recepta.webp“ iz PRAVILA-PISANJA.md §6.

Claude Code:
- po nazivu fajla prepoznaje koja slika pripada kojem receptu; ako nije jasno ili odgovara za dva recepta, pita, a ne nagađa;
- naziv koji je dao urednik zadržava, a za web ga samo sredi (mala slova, bez kvačica, razmaci → crtice). Provjerava da tako sređen naziv nije isti kao slug recepta;
- povezuje sliku s receptom, provjerava format i veličinu iz PRAVILA-PISANJA.md i piše alt tekst.

Ako slike za recept nema, recept ostaje nacrt i u izvještaju piše `NEDOSTAJE: slika`.

## 10. Tok rada

1. Pročitati log, PRAVILA-BRIEFA.md i AUTORI-STILOVI.md.
2. Iz XML-a izvući recept (samo činjenice i ključne riječi).
3. Provjeriti zauzetost ključne riječi.
4. Napisati brief.
5. Napisati recept (članak, kratak opis, kartica, FAQ ako ima pravih pitanja, SEO).
6. Provjere iz tačke 6, pa popravke po smislu.
7. Probni uvoz (dry-run), pa uvoz kao **nacrt**.
8. Upis u log.
9. Izvještaj: šta je urađeno, šta je NEDOSTAJE, šta treba odluku.

**Pregled urednika:** prvih 5 recepata se čitaju svi, a poslije svaki peti. Objava i zakazivanje tek nakon pregleda: 2–4 dnevno, izmiješane kategorije, nikad cijela kategorija zaredom. Srodna jela (npr. rižota) razmaknuti: nikad dva iz iste porodice u istoj sedmici.

**Zakazivanje:** u CMS-u na receptu „Zakaži objavu“ (datum i vrijeme), ili skriptom preko `payload.jobs.queue({ task: 'schedulePublish', … })`. Zakazane objave izvršava Vercel Cron jednom dnevno u 6:00 (5:00 UTC, `vercel.json`), pa recept izlazi tog jutra. Recept mora imati sliku prije zakazanog dana.
