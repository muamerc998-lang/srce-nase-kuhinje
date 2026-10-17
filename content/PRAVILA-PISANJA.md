# Pravila pisanja — Srce naše kuhinje

> **Obavezno pročitati prije pisanja bilo kojeg recepta, članka, vodiča ili opisa, zajedno s `content/UREDNICKI-VODIC.md`** (glas, pristup i struktura teksta).
> Važi za AI i za urednike. Ako se neko pravilo ne može ispuniti, sadržaj se **ne izmišlja** — u isporuci se jasno navede šta nedostaje.

---

## 0. Sadržajni plan (čitati uz ova pravila)

Plan je u `content/plan/content-plan-srce-nase-kuhinje.md`. Svaki zadatak ima trajni ID: `SNK-…` za recept, `VOD-…` za vodič ili ideju (kolekciju). **Brief iz plana ima prednost** pred općim pravilima ispod kad je konkretniji (npr. odabrana verzija recepta, granice teme, šta se ne smije preuzeti).

- **Recept (SNK):** referenca je „Vanjski izvor recepture“. Pratiti „Odabrana verzija recepta“ i „Napomene uz referencu“. Recept se piše samo ako ima status „Provjeren izvor“. Za „Nije provjereno“ ili `BLOK (Q)` se ne piše, nego se prijavi šta nedostaje. U uvozu popuniti `planId` (npr. `SNK-0351`), `family` (tematska porodica) i `sourceNote` (URL i odabrana verzija).
- **Oznake (`tags`, 3–6 po receptu):** koriste se samo kanonske oznake iz `src/lib/content/taxonomy-texts.ts`, dakle glavne namirnice (do 5) i vrsta tijesta. Slug je naziv bez kvačica: `cokolada`, `dzem-i-pekmez`, `prhko-tijesto`. Oznaka „Leća“ se u planu pogrešno pojavljuje uz piletinu, jer je „Pi**leća**“ prepoznato kao leća, pa je dodijeliti samo kad je leća stvarno sastojak. Sastav (Posno, Bez jaja, Bez mlijeka, Bez glutena, Bez brašna, Bez kvasca, Vegetarijansko, Vegansko) se upisuje u polje `diets`, a način pripreme (Iz rerne, Iz tave, Roštilj, Bez pečenja, Friteza na vrući zrak) u `methods`. Te vrijednosti se ne upisuju kao oznake. Svako svojstvo sastava mora se potvrditi po svim sastojcima.
- **Kategorija:** samo slugovi iz `src/lib/content/taxonomy.ts`, koji odgovaraju dijelu plana „Kategorije“. Svaki recept ima tačno jednu primarnu kategoriju, i to najkonkretniju potkategoriju.
- **Ideje (VOD, tip Kolekcija):** uvoze se kao `ideas` u istom JSON formatu i prikazuju na `/ideje/{slug}/`. Iznimke su članci za obroke: VOD-008 je `/dorucak/`, VOD-016 `/rucak/`, a VOD-010 `/vecera/`. Oni se upisuju u CMS → Postavke → Stranice obroka, polje „Članak“. Struktura članka:
  - H2 iz briefa = `sections[].title`;
  - svaka ideja = `items[]`, gdje je `recipe` slug postojećeg recepta, `note` vlastitih 60–90 riječi, a `mainIngredients` i `makeAhead` se popunjavaju za tabelu;
  - zaključak = `closing`; česta pitanja = `faq`.
  - Pregledna tabela se gradi sama iz recepata, pa vremena u tekstu moraju odgovarati receptu.
- **Linkovi na teme koje još ne postoje:** u `relatedIdeas` i `relatedGuides` navesti ih slugom. Uvoz preskače nepostojeće, nikad ne nastaje lažni link.
- **Ideja ide tek nakon recepata.** Članak se ne može uvesti dok svi recepti iz njega ne postoje bar kao draft. Javno se prikazuje tek kad su objavljena najmanje 3 recepta iz njega.
- **Ključne riječi:** glavna ključna riječ iz briefa ide u naslov, H1 i meta opis (meta opis iz briefa je prijedlog). Sinonimi se pokrivaju prirodno u tekstu, nikad na posebnoj stranici. Upiti označeni sa VAN PLANA ili ISKLJUČENO se ne obrađuju.

---

## 1. Jezik

- Sve se piše **bosanskim jezikom, ijekavicom**: mlijeko, bijeli, vrijeme, pripremiti, lijepo, dijete, cijeli, ponijeti.
- Interfejs i tekst koriste ove termine (lijevo **da**, desno **ne**):

| Pišemo | Ne pišemo |
|---|---|
| kašika, kašičica | žlica, žličica |
| rerna | pećnica |
| krompir | krumpir |
| bijeli luk, crni luk | češnjak, kapula |
| paradajz | rajčica |
| pavlaka (slatka, kisela) | vrhnje, mileram |
| hljeb | kruh |
| šerpa, lonac, tava, tepsija | — |
| šećer u prahu | — |
| so | sol |
| kafa | kava |
| sedmica | tjedan |

- Regionalni sinonimi se **ne pišu u tekstu**, nego se unose kao sinonimi namirnice u registru (pretraga ih pronalazi).
- Rečenice kratke i jasne. Obraćanje čitaocu u 2. licu množine („Isjecite…“, „Ostavite…“). Bez anglicizama kad postoji naš izraz.
- Brojevi: decimalni zarez (1,5 kg), raspon crticom (2–3 kašike), temperatura „180 °C“, vrijeme „35 minuta“ / „1 h 20 min“ u podacima.
- Bez emoji ikona, bez uzvika i pretjerivanja („NAJBOLJI recept ikad!!!“).

## 2. Izvori — bez izmišljanja

- Recept se piše **isključivo na osnovu dostavljene reference** (link, knjiga, porodični recept, Facebook objava, bilješka urednika). Referenca se upisuje u interno polje **`sourceNote`** (nije javno).
- Iz reference se preuzimaju **činjenice**: sastojci, količine, vremena, temperature, veličina kalupa, redoslijed radnji.
- **Zabranjeno izmišljati**: količine, temperature, vremena, prinos, kalup, nutritivne vrijednosti, ocjene, recenzije, iskustva čitalaca, tvrdnje „testirano u našoj kuhinji“, lične anegdote autora.
- Ako referenca nema podatak (npr. veličinu kalupa ili vrijeme hlađenja), **ostaviti prazno** i u isporuci navesti: `NEDOSTAJE: …`. Ne pogađati.
- Ako se dvije reference razlikuju, uzima se jedna (navesti koja) — ne praviti „prosjek“.
- Tekst reference se **nikad ne kopira** — ni rečenice, ni pasusi, ni struktura uvoda. Činjenice da, formulacije ne.
- Fotografije iz referenci se ne preuzimaju.

## 3. Urednički tekst — vidi UREDNICKI-VODIC.md

Glas, urednički pristup, strukturu članka, naslove, originalnost u odnosu na referencu, dužinu i samoprovjeru određuje **`content/UREDNICKI-VODIC.md`**. Ovdje su samo pravila za kratka polja:
- Kratak opis (`summary`): 1–2 rečenice, do 300 znakova. Kaže šta je jelo i po čemu je ovaj recept dobar izbor. Bez „U ovom receptu ćete naučiti…“.
- Napomena prije početka (`beforeYouStart`): samo ono što zaista treba znati prije prvog koraka (namakanje, sobna temperatura, dan ranije). Prikazuje se u kartici recepta.
- Prvo lice („mi u uredništvu“) samo za stvarne uredničke odluke, nikad za izmišljeno iskustvo.

## 4. Struktura recepta (polja u CMS-u / uvozu)

Format uvoza: `srce-nase-kuhinje/v1` — primjer `content/examples/primjer-uvoza.json`, opis `docs/content-model.md`.

| Polje | Pravilo |
|---|---|
| `title` | Prirodan naziv jela, bez SEO nabrajanja. „Musaka s krompirom“, ne „Musaka recept najbolja domaća brza“. |
| `alternativeNames` | Drugi nazivi pod kojima ljudi traže jelo (do 5). |
| `slug` | Mala slova, bez kvačica, crtice: `musaka-s-krompirom`. Kratak, bez godina i „recept“. |
| `primaryCategory` | Jedna, iz postojećih kategorija (vidi §8). |
| `meals` | doručak / ručak / večera — samo ako jelo stvarno odgovara. |
| `difficulty` | **lako** (bez posebne tehnike, < 10 koraka), **srednje** (više faza ili tehnika), **zahtjevno** (tijesto, slojevi, precizna temperatura, duga priprema). |
| `methods`, `diets` | Samo ako vrijede za cijeli recept (posno = bez mesa, jaja i mliječnih proizvoda). |
| `yield` | Broj + jedinica (porcija, komada, kriški). `scalable: false` kad osnova nije pouzdana (zimnica, tijesto „koliko upije“). |
| `times` | Priprema / kuhanje-pečenje / čekanje (+ `restLabel` u genitivu: „hlađenja“). `totalMinutes` = **stvarno proteklo vrijeme** (paralelne radnje se ne zbrajaju). |
| `equipment` | Kalup (dimenzije), temperatura, način pečenja — gdje je bitno. |
| Sastojci | Svaki red: namirnica iz registra + količina + jedinica + `label` u padežu („glatkog brašna“) + `note` („sitno sjeckan“). Grupe za faze (Tijesto, Fil, Krema, Preljev). „Po ukusu“ bez količine. Alternative istim `altGroup`. Dekoracija `optional: true`. |
| Koraci | **Jedna radnja po koraku**, imperativ, s temperaturom i trajanjem u tekstu. `timerMinutes` samo kad korak ima jasno trajanje. Grupe kao kod sastojaka. |
| `approach`, `article` | Urednički pristup (interno) i članak iznad kartice: sekcije `{ level: h2/h3, title, body }`; u tekstu pasusi su odvojeni praznim redom, a red koji počinje s „- “ je stavka liste. Sve prema UREDNICKI-VODIC.md. |
| `tips`, `substitutions`, `storage` | Kod novih recepata ostaju prazni, jer njihov sadržaj ide u članak. Rokove čuvanja ne izmišljati; kad nisu sigurni, pisati oprezno. |
| `faq` | Samo stvarna pitanja o ovom receptu (0–3). Ne dodavati FAQ radi Googlea. |
| `servedWith` | 1–4 postojeća recepta koja stvarno idu uz jelo. |
| `relatedRecipes`, `relatedGuides` | Samo smislene veze. |
| `tags` | Najviše 5, samo iz postojećih oznaka (§8). |
| `authors` | Prema oblasti (§9). |
| `sourceNote` | **Obavezno.** Referenca(e) iz kojih je recept nastao. |
| `facebook.postedAt` | Samo ako je recept zaista objavljen na Facebook stranici. |

Namirnice koje ne postoje u registru dodaju se u `ingredients` istog uvoza: kanonski naziv (jednina ili uobičajeni oblik), sinonimi, `broader` (širi pojam), `foodGroup` (meso, riba, mlijecno, jaja, povrce, voce, zitarice, zacini, ostalo). **Ne spajati različite proizvode** (mlijeko ≠ kondenzovano mlijeko).

**Kalorije:** procjena na stranici recepta računa se iz `src/lib/nutrition/data.ts` (vrijednosti na 100 g prema USDA FoodData Central). Za svaku novu namirnicu dodati red s kcal, proteinima, ugljikohidratima i mastima, a za kašike i komade i `density` ili `pieces`. Bez toga se procjena za taj recept ne prikazuje. Recepte u kojima se dio sastojaka ne pojede (temeljac, ulje za prženje, sirup) dodati u `NUTRITION_EXCLUDED`.

## 5. SEO pravila

- **SEO naslov** (`seo.title`): 45–60 znakova; prirodan; ključni pojam na početku; po želji korist ili razlikovanje. Npr. „Musaka s krompirom — sočna, s preljevom od jaja“. Bez naziva sajta (dodaje se automatski). Bez VELIKIH SLOVA i nabrajanja ključnih riječi.
- **Meta opis** (`seo.description`): 140–160 znakova; šta je jelo + konkretna korist (vrijeme, tehnika, prilika) + blagi poziv („Recept korak po korak.“). Jedinstven za svaku stranicu, ne kopija kratkog opisa.
- **H1** = naslov recepta / članka (automatski). Jedan H1 po stranici.
- **Podnaslovi u člancima** (H2/H3): opisni, odgovaraju na pitanja koja ljudi stvarno traže.
- **Ključne riječi**: glavni pojam u naslovu, opisu i prvoj rečenici kratkog opisa — prirodno. **Bez nagomilavanja.** Varijante i sinonimi idu u `alternativeNames`.
- **Interni linkovi**: u člancima 3–8 linkova na postojeće recepte/vodiče; u receptima kroz polja (povezani recepti, vodiči, šta poslužiti). Samo na objavljen sadržaj.
- **Jedinstvenost**: dva recepta ne smiju imati isti naslov, SEO naslov ili meta opis. Ne praviti više stranica istog smisla („brzi ručak“, „ručak na brzinu“).
- **Schema** se generiše automatski iz polja — zato podaci moraju biti tačni i potpuni (vremena, prinos, sastojci, koraci). Nikad lažne ocjene ni kalorije.
- **Alt tekst** svake slike: opis onoga što se vidi (§6), ne nabrajanje ključnih riječi.

## 6. Slike (generisanje preko OpenAI API-ja)

**Postupak (bez vanjskog spremišta):**
1. U `content/recepti/slike/promptovi.json` dodati `{ slug, alt, dish }` za svaki novi recept. `dish` je opis jela na engleskom prema receptu, a `alt` alt tekst na bosanskom.
2. `npx tsx scripts/generisi-slike.ts content/recepti/slike/promptovi.json` (zadano: jeftiniji `gpt-image-1-mini`, srednji kvalitet) napravi `content/recepti/slike/<slug>.webp` (1600 × 1200). Ključ je `OPENAI_API_KEY` u `.env.local`, a postojeće slike se preskaču. Svaku sliku pregledati.
3. Uz `DATABASE_URL` iz `.env.neon` pokrenuti `npx tsx scripts/dodaj-slike.ts content/recepti/slike/promptovi.json`. Skripta pravi medij s izvorom „AI ilustracija“ i postavlja ga kao naslovnu sliku recepta. Fajlovi nastaju u `public/media/`.
4. Fajlove iz `public/media/` commitati i pushati na `main`. Vercel ih objavljuje zajedno sa sajtom. Upload kroz `/admin` na live sajtu ne radi, jer Vercel ne dozvoljava pisanje fajlova.

Pravila za promptove i obradu:

**Sadržaj slike**
- Slika mora prikazivati **baš ovo jelo**: iste glavne sastojke, iste slojeve, isti oblik (rolat, tepsija, krug), realnu boju i teksturu gotovog jela prema receptu. Ništa što nije u receptu (npr. bobičasto voće na torti koja ga nema).
- Realističan stil fotografije hrane: prirodno dnevno svjetlo, topli tonovi, domaći ambijent (drvena daska, bijeli ili keramički tanjir, laneni ubrus, domaća kuhinja). Bez luksuznih restoranskih kompozicija.
- **Bez teksta, logotipa, vodenih žigova, ruku s nerealnim prstima, lica ljudi.**
- Jedna glavna fotografija po receptu; fotografije koraka samo kad pomažu (npr. kako izgleda tijesto).

**Format**
- Glavna: 4:3, najmanje 1600 × 1200 px; jelo u sredini (zbog rezova 4:3, 16:9 i 1,91:1 za Facebook) — ostaviti prostor oko jela.
- Postaviti **fokusnu tačku** na jelo u CMS-u.
- Naziv fajla: `slug-recepta.webp` (npr. `musaka-s-krompirom.webp`).

**Šablon prompta** (prilagoditi receptu):
```
Realistic home-style food photograph of [naziv jela na engleskom + kratak opis izgleda:
sastojci, slojevi, oblik, boja korice], served on [tanjir/tepsija], on a rustic wooden table
in a warm Bosnian home kitchen, soft natural daylight from the side, shallow depth of field,
appetizing but authentic, no text, no logos, no people, 4:3.
```

**Označavanje i alt tekst**
- U polju *Autor fotografije / izvor* upisati: **„AI ilustracija“**.
- Alt tekst na bosanskom, 8–20 riječi, opisuje prizor: „Komad musake s krompirom i zlatnom koricom na bijelom tanjiru“.
- Prije objave urednik provjerava da slika odgovara receptu (§10). Slika koja ne odgovara se ne objavljuje.

## 7. Vodiči (Savjeti iz kuhinje) i članci obroka

**Vodič**
- Naslov kao pitanje ili zadatak: „Kako odvojiti bjelanca od žumanaca“.
- `answer`: **odgovor u 2–4 rečenice na samom početku** — čitalac mora dobiti rješenje bez skrolanja.
- Tijelo: 600–1500 riječi, H2 sekcije (postupak, greške, čuvanje, varijante), liste kad olakšavaju čitanje.
- Povezati 2–6 recepata i namirnice na koje se odnosi.
- Bez generičkih „uvoda u temu“ i historije bez izvora.

**Članci obroka (Doručak / Ručak / Večera)** — CMS → Postavke → Stranice obroka → Članak
- Naslov: „Ideje za doručak: brzi i domaći recepti“ (prilagoditi).
- Uvod 2–3 kratka pasusa: za koga je, kako je izbor organizovan.
- 3–5 tematskih sekcija (npr. „Gotovo za 15 minuta“, „Za vikend“, „Za ponijeti“), svaka s kratkim uvodom i 3–8 recepata.
- Uz svaki recept **vlastiti opis 1–2 rečenice — zašto baš on** (ne kopija kratkog opisa recepta).
- Završni dio „Kako odabrati“ i 3–5 stvarnih pitanja.
- U članak idu **samo objavljeni recepti**.

## 8. Kategorije, oznake, kolekcije

- **Kategorije:** samo slugovi iz `src/lib/content/taxonomy.ts` (vidi §0). Nove kategorije samo uz odluku urednika.
- **Oznake:** kanonske oznake iz `src/lib/content/taxonomy-texts.ts` (vidi §0).
- **Namirnice** nisu oznake — idu kroz sastojke.
- **Kolekcije** okupljaju recepte prema potrebi (Ručak do 30 minuta, Iz jedne posude, Obroci za ponijeti, Pripremi danas za sutra, Ideje za porodični ručak…). Javno se prikazuju tek s najmanje 3 objavljena recepta. Uvod kolekcije: 1–3 rečenice, vlastit tekst.

## 9. Autori

| Autor | Oblast |
|---|---|
| Amra Hodžić | slatki recepti: torte, kolači, palačinke, sitni kolači, deserti |
| Emir Delić | glavna jela, supe i čorbe, pite i peciva, zimnica |
| Selma Begić | vodiči (Savjeti iz kuhinje), namirnice, članci obroka |
| Uredništvo Srce naše kuhinje | salate, prilozi, napici, kolekcije, ostalo i mješoviti sadržaj |

- Autoru se ne pripisuju lična iskustva, titule ni tvrdnje o testiranju koje nisu stvarne.
- Recept čitaoca koji uredništvo preradi dobija i polje **Gostujući autor**.

## 10. Kontrolna lista prije isporuke

- [ ] Bosanski, ijekavica, termini iz §1.
- [ ] `sourceNote` popunjen; ništa nije izmišljeno; `NEDOSTAJE:` navedeno gdje treba.
- [ ] Nijedna rečenica nije prepisana iz reference.
- [ ] Članak prošao samoprovjeru iz UREDNICKI-VODIC.md §9.
- [ ] Sastojci: sve namirnice postoje u registru ili su dodane; padeži u `label`; jedinice iz liste; rasponi i „po ukusu“ ispravni.
- [ ] Koraci: jedna radnja po koraku; temperature i trajanja; tajmeri samo gdje ima smisla.
- [ ] Vremena: ukupno = stvarno proteklo; težina prema kriterijima.
- [ ] SEO naslov 45–60 znakova, meta opis 140–160 znakova, jedinstveni.
- [ ] Kategorija, obrok, oznake (≤ 5), autor prema oblasti.
- [ ] Slika odgovara jelu, alt tekst, „AI ilustracija“, fokusna tačka.
- [ ] Uvoz prvo kao **dry-run** (`npm run content:import -- datoteka.json`), tek zatim `--primijeni` (recepti nastaju kao draft; objavljuje urednik).

## 11. Zabranjeno

- Izmišljene količine, vremena, temperature, kalorije, ocjene, recenzije, iskustva, „testirano“.
- Prepisivanje teksta ili fotografija iz referenci.
- Generički uvodi i punjenje teksta radi dužine.
- Nagomilavanje ključnih riječi, isti meta opisi, duple stranice istog smisla.
- Slike koje ne prikazuju stvarno jelo iz recepta.
- Objavljivanje bez uredničke provjere.
