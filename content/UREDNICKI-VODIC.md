# Urednički vodič — kako pisati recepte za Srce naše kuhinje

> Čitati prije pisanja svakog recepta, zajedno s `content/PRAVILA-PISANJA.md`.
> Ovaj vodič određuje **glas, pristup i strukturu** teksta. Pravila pisanja određuju tehnički okvir: izvore, polja, mjere, SEO dužine, slike i uvoz.
> Ako se nešto čini kontradiktornim, tačnost recepta ima prednost pred stilom.

---

## 1. Šta želimo

Svaki recept je dvije stvari odjednom:

1. **Pouzdan recept**, koji čitalac može skuhati bez nagađanja.
2. **Samostalan, koristan članak** o tom jelu, koji odgovara na ono što ljude stvarno zanima kad ga prave.

Recept ne smije izgledati kao prethodnih deset. Ako bi se naslovi ili prve rečenice mogli premjestiti na drugi recept bez izmjene, tekst nije dovoljno dobar.

Ne postoji obavezan broj savjeta, zamjena, pitanja ni sekcija. Sve što je u tekstu mora biti tu jer pomaže kod **ovog** jela.

## 2. Kako je složena stranica recepta

Odozgo prema dolje:

| Dio | Polje | Šta sadrži |
|---|---|---|
| Zaglavlje | `title`, `summary`, autor, fotografija | Naziv i 1–2 rečenice o jelu: šta je i po čemu je ovaj recept dobar izbor. |
| **Urednički tekst** | `article` (sekcije H2/H3) | Članak o jelu: sve što objašnjava, upozorava, uči i pomaže odabrati. Nalazi se **iznad kartice**. Čitalac ga može preskočiti dugmetom „Idi na recept“. |
| **Kartica recepta** | vremena, porcije, `beforeYouStart`, sastojci, koraci | Ono što treba dok se kuha. Kratko, precizno, bez objašnjavanja „zašto“. |
| Ispod kartice | `faq`, `servedWith`, `leftovers`, povezani recepti, komentari | Česta pitanja (kad ih ima), šta poslužiti uz jelo, ostaci. |

Razdvajanje:
- **Kartica = šta i kako.** Koraci: jedna radnja, temperatura, trajanje i znak da je gotovo.
- **Članak = zašto, kako odabrati, šta ako.** Objašnjenja, uzroci grešaka, izbor sastojaka, varijacije, čuvanje i posluživanje.
- Ista informacija ne ide na oba mjesta. Ako korak u kartici kaže „pecite 20 minuta“, članak ne ponavlja to vrijeme, nego objašnjava zašto se paradajz dodaje tek nakon tih 20 minuta.
- Kod novih recepata polja `tips`, `substitutions` i `storage` ostaju prazna. Njihov sadržaj ide u članak, tamo gdje ima smisla. Stari recepti ih i dalje prikazuju ispod kartice.
- `faq` služi samo za stvarna, kratka pitanja s direktnim odgovorom. Nikad ne ponavlja ono što je već u članku.

## 3. Prije pisanja: tri pitanja

Prije prve rečenice odgovori sebi:

1. **Šta je ključno kod ovog jela?** Šta odlučuje da li će uspjeti: temperatura, vrijeme, izbor mesa, vlažnost tijesta, redoslijed?
2. **Gdje ljudi griješe i zašto?** Konkretni uzroci, a ne opšte „pazite na vrijeme pečenja“.
3. **Šta čitalac traži kad ukuca glavnu ključnu riječ?** Brzi recept, tradicionalnu verziju, rješenje problema („zašto mi je pire ljepljiv“), ideju za goste?

Iz odgovora nastaje struktura članka, ne obrnuto.

## 4. Pet uredničkih pristupa (inspiracija, ne šabloni)

Odaberi pristup koji najbolje odgovara jelu i upiši ga u interno polje `approach`. Pristupi se mogu kombinovati. Uzastopni recepti ne bi trebali imati isti pristup bez razloga.

1. **Praktični vodič** (`prakticni`): za jela koja su jednostavna, ali imaju nekoliko mjesta na kojima se griješi. Tekst prati pripremu i zastaje samo tamo gdje treba objašnjenje. Npr. pečena piletina u tepsiji: raspored sastojaka, kad dodati osjetljivije povrće, kako zadržati umak.
2. **Tehnika i rezultat** (`tehnika`): kad tekstura ili okus zavise od tehnike. Objašnjava šta se dešava i kako to čitalac vidi: zašto se bjelanjci umućuju odvojeno, zašto pire postane ljepljiv, šta radi odmaranje tijesta.
3. **Tradicionalni recept** (`tradicionalni`): domaća jela s jasnim identitetom (sarma, begova čorba, baklava). Naglasak je na tome šta jelo čini prepoznatljivim, po čemu se razlikuju domaće izvedbe i šta se ne bi smjelo mijenjati. Historija i običaji samo ako su provjerljivi, bez legendi.
4. **Brzi svakodnevni recept** (`brzi`): kratko i konkretno. Dvije do četiri kratke sekcije ili samo nekoliko pasusa bez podnaslova. Ništa ne razvlačiti.
5. **Detaljniji kulinarski vodič** (`detaljni`): zahtjevna jela (dizana tijesta, torte, višeslojni kolači), gdje čitalac stvarno treba više objašnjenja. Duže, s jasnom hijerarhijom H2/H3.

## 5. Struktura i naslovi

- Broj, redoslijed i nazive sekcija određuje jelo. Članak može imati i samo dva-tri pasusa bez podnaslova, ako je to najbolje.
- Prva sekcija je obično bez naslova: uvodni pasus koji odmah ulazi u temu i prirodno sadrži glavnu ključnu riječ.
- **Naslove biraš slobodno**, prema tome šta je najprirodnije za to jelo i za čitaoca. Nema zabranjenih riječi: i „Čuvanje“ ili „Zamjene“ mogu biti dobar naslov kad je to stvarno ono što čitalac traži.
- Najčešće su najbolji naslovi koji kažu nešto o konkretnom jelu, kao kratka tvrdnja ili pitanje (npr. „Temeljac kuhajte tiho, ne burno“, „Koliko dugo se diže tijesto za kifle“). Ali to je smjernica, ne pravilo. Pitanje je samo: da li naslov čitaocu jasno kaže šta ga čeka?
- Izbjegavaj da svi recepti imaju isti niz sekcija pod istim imenima. Ako tekst izgleda kao popunjen obrazac, promijeni ga.
- H2 za glavne teme, H3 samo kad sekcija stvarno ima podteme.
- Liste kad čitalac nešto bira ili provjerava (npr. sorte krompira, znakovi gotovosti). Objašnjenja idu u pasuse.
- **Raznolikost:** prije pisanja pogledaj naslove sekcija u zadnjih nekoliko recepata (`content/recepti/*.json`), da se isti naslovi i isti redoslijed ne ponavljaju bez razloga.

## 6. Referentni recept

Referenca iz plana služi da se razumije jelo, a ne da se prepiše tekst.

- Iz reference se preuzimaju **činjenice**: sastojci, količine, vremena, temperature, kalup i redoslijed. Njih ne mijenjati radi prividne originalnosti.
- Ne preuzimaju se uvod, opisi, savjeti, struktura članka ni podnaslovi. Tekst se ne prepričava rečenicu po rečenicu.
- Članak se piše iz vlastitog razumijevanja jela: šta je važno, zašto i kako to čitalac vidi u svojoj kuhinji.
- Kulinarsko objašnjenje koje nije iz reference smije se napisati samo kad je opšte poznato i provjerljivo (npr. da skrob muti supu, da gluten od predugog miješanja čini tijesto žilavim). Ako nisi siguran, ne piši.
- **Ni izvor nije nepogrešiv.** Tvrdnju iz reference koja zvuči sumnjivo (neobično vrijeme ili temperatura, „pravilo“ bez objašnjenja, sigurnosno upitan postupak) ne prenosi slijepo. Provjeri je drugim pouzdanim izvorom; ako se ne može potvrditi, izostavi je ili napiši opreznije i zabilježi u `sourceNote`.
- Ako je izvor nejasan ili nepotpun, to navedi u `sourceNote` (`NEDOSTAJE: …`). Nikad ne izmišljaj podatak.
- **Originalnost:** napiši tekst tako da bi bio isti i da referencu nikad nisi pročitao do kraja. Zajednički mogu biti samo podaci o receptu, nikad rečenice, poređenja, primjeri ni raspored misli.

## 7. Glas i jezik

- Prirodan bosanski, ijekavica, termini iz pravila pisanja (§1). Obraćanje u 2. licu množine, mirno i stručno, kao iskusan kuhar koji objašnjava.
- Kratke i srednje rečenice. Jedna misao po rečenici.
- **Bez izmišljenih iskustava:** nema „kod nas se uvijek pravi“, „moja nana“, „testirali smo“, „naši čitaoci kažu“.
- **Bez praznih AI fraza.** Ne pisati:
  - „U svijetu kulinarstva…“, „Nema ništa bolje od…“, „pravi je užitak“, „savršen za svaku priliku“;
  - „Bilo da ste početnik ili iskusan kuhar…“, „Zaronimo u…“, „Hajde da otkrijemo…“;
  - „Tajna je u ljubavi“, „ne samo da je ukusno, nego i…“, „osvojit će svačije nepce“;
  - „Zaključno“, „Uživajte!“, uskličnike i retorička pitanja kao uvod.
- Ne ponavljati naslov recepta u svakoj sekciji. Ključna riječ ide prirodno u uvod i jedan-dva naslova, srodni pojmovi u tekst.
- Brojevi i mjere kao u pravilima pisanja (decimalni zarez, „180 °C“, raspon crticom).

## 8. Dužina

Dužina zavisi od jela, ne od broja riječi. Orijentacija za cijeli članak:
- brzi i jednostavni recepti: oko 250–500 riječi;
- većina recepata: oko 500–900 riječi;
- zahtjevna jela (tijesta, torte, višeslojni kolači): 900–1500 riječi, samo ako sadržaj to opravdava.

Ako bi tekst trebao biti duži samo da dosegne broj, skrati ga.

## 9. Samoprovjera prije isporuke

Prije uvoza pročitaj članak i karticu kao urednik i ispravi:

- [ ] Neprirodne formulacije, kalkove i prazne fraze (§7).
- [ ] Naslove koji ne govore jasno šta slijedi, ili niz sekcija koji izgleda kao obrazac iz drugih recepata (§5).
- [ ] Kulinarsku tačnost: da li bi iskusan kuhar potpisao svaku tvrdnju? Sumnjive tvrdnje iz izvora provjeriti ili izostaviti (§6).
- [ ] Količine, vremena, temperature i redoslijed: da li se slažu u kartici, u članku i u referenci? Da li je ukupno vrijeme stvarno proteklo vrijeme?
- [ ] Savjete koji ne pomažu ovom jelu („koristite kvalitetne sastojke“) i sekcije koje postoje samo da bi postojale.
- [ ] Ponavljanje: ista informacija u članku i u kartici, ili dvaput u članku.
- [ ] Sličnost s referencom: nijedna rečenica, opis ili naslov ne smije biti preveden ili prepričan.
- [ ] Da li bi čitalac nakon članka znao nešto što ne zna iz same kartice? Ako ne, članak nema svrhu.
