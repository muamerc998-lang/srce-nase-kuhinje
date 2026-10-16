# Model sadržaja i urednički postupak

## Kolekcije u CMS-u

| Kolekcija | Namjena | Draft/verzije |
|---|---|---|
| Recepti (`recipes`) | glavni sadržaj | da (30 verzija) |
| Namirnice (`ingredients`) | kontrolisani registar; opcionalna javna stranica | ne |
| Kategorije (`categories`) | hijerarhija (npr. Slatki recepti → Torte) | ne |
| Kolekcije (`recipe-collections`) | urednički kurirane stranice | da |
| Vodiči (`guides`) | Savjeti iz kuhinje | da |
| Informativne stranice (`pages`) | O nama, Urednička politika, Privatnost… | da |
| Autori i uredništvo (`authors`) | samo stvarne osobe / imenovano uredništvo | ne |
| Oznake (`tags`) | kontrolisane oznake, spajanje sinonima (*Spojeno u*) | ne |
| Sinonimi pretrage (`search-synonyms`) | grupe izraza koji se u pretrazi tretiraju isto | ne |
| Mediji (`media`) | fotografije s obaveznim alt tekstom i fokusnom tačkom | ne |
| Komentari i ocjene (`comments`) | moderirano; javno samo odobreno | ne |
| Kontakt i prijave grešaka (`messages`) | privatno | ne |
| Preusmjerenja (`redirects`) | 301 / 410; automatski pri promjeni sluga | ne |
| Korisnici CMS-a (`users`) | uloge: administrator, urednik | — |

Globalne postavke: **Stranice obroka** (Doručak / Ručak / Večera: uvod, fotografija, izdvojene kolekcije), **Postavke sajta** (brend, Facebook URL, uključene funkcije, oglasna mjesta), **Navigacija i footer**, **Početna stranica** (11 sekcija; svaka se može isključiti, preimenovati i popuniti), **Osnovne namirnice** (spisak za opciju „Imam osnovne namirnice” + odobrenje baze za javni promotivni blok).

## Taksonomija

Osnovne kategorije: Glavna jela · Supe i čorbe · Pite i peciva · Salate · Predjela i prilozi · Slatki recepti · Zimnica · Napici.
Pod *Slatki recepti*: Torte · Kolači · Keksi i sitni kolači · Palačinke · Slatke pite i tartovi · Štrudle i slatka peciva · Deserti u čaši i hladni deserti.

- Kategorija bez objavljenih recepata se javno ne prikazuje (ni u meniju, ni kao stranica).
- Recept ima jednu **primarnu** kategoriju (breadcrumb) i sekundarne samo ako zaista trebaju. URL recepta ne sadrži kategoriju.
- Filter po nadređenoj kategoriji uključuje podkategorije.
- Namirnice su registar, ne slobodni tagovi. *Širi pojam* (npr. glatko brašno → brašno) koristi se u filterima i alatu za namirnice. Različiti proizvodi se ne spajaju (mlijeko ≠ kondenzovano mlijeko, brašno ≠ bademovo brašno).
- Metode pripreme i prehrambena svojstva su kontrolisana polja (izbor iz liste).
- **Obrok** (doručak / ručak / večera) je polje na receptu; isti recept može biti u više obroka bez duplih stranica. Stranice: `/dorucak/`, `/rucak/`, `/vecera/`.
- **S mesom / Bez mesa** se izvodi automatski: recept je „s mesom“ ako ima obavezni sastojak čija je *Grupa namirnica* = meso.
- **Kolekcije** se javno prikazuju (stranica, početna, linkovi) tek kad imaju bar *N* objavljenih recepata (Postavke sajta → Funkcije, podrazumijevano 3).
- Najviše 5 oznaka po receptu; javno se prikazuju najviše 3 koje su označene kao javne.

## Recept: polja

Obavezno za objavu: naslov, kratak opis, autor/uredništvo, primarna kategorija, težina, bar jedna grupa sastojaka i koraka; **u produkciji i glavna fotografija** (provjerava se pri objavi).

- **Vremena:** priprema, kuhanje/pečenje, čekanje/hlađenje (+ naziv čekanja u genitivu: „hlađenja”), **ukupno proteklo vrijeme** — upisati stvarno vrijeme; ako se radnje preklapaju, manje je od zbira. Prazno = zbir.
- **Prinos:** broj + jedinica (porcija, komada, kriški…) + *Dozvoli preračun porcija* (isključiti kad osnovna količina nije pouzdana, npr. zimnica).
- **Sastojak:** namirnica iz registra · količina · *Do* (raspon) · jedinica · prikazni naziv u padežu („glatkog brašna”) · napomena („sitno sjeckan”) · opcionalno · alternativna grupa (isti kratki ključ za „maslac ili margarin”) · izvorna formulacija (opcionalno).
  - Jedinice: g, kg, ml, dl, l, kom, češanj, glavica, list, kriška, struk, vezica, kesica, paket, konzerva, tegla, kašika, kašičica, šolja, čaša, prstohvat, po ukusu, po potrebi, bez jedinice (npr. „3 jaja”).
  - „Po ukusu/po potrebi” bez količine. Razlomci se unose decimalno (0,5) i prikazuju kao ½.
- **Korak:** tekst, opcionalni naslov, fotografija, **tajmer u minutama** samo kad korak ima jasno trajanje.
- **Veze:** povezani recepti (ručni izbor ima prednost nad automatskim), povezani vodiči, **Šta poslužiti uz ovo?** (do 4 priloga, salate ili supe), **Ostaci** (kratka napomena + recept ili vodič).
- **Facebook:** datum objave (recept tada ulazi u blok „Sa naše Facebook stranice”, sortirano po tom datumu) i opcionalni URL objave. Nema automatske sinhronizacije.
- **Datum stvarne izmjene:** mijenjati samo pri bitnoj sadržajnoj izmjeni (prikazuje se čitaocima i u sitemapu).
- **Stabilni ID (uid)** se dodjeljuje automatski i ne mijenja se.

## Urednički postupak

1. Napraviti recept (status draft) i popuniti polja.
2. **Pregled:** dugme za pregled u CMS-u otvara `/api/site/preview?…` (radi samo prijavljenom uredniku) i prikazuje draft na stvarnoj stranici.
3. **Objavi promjene** — hook provjerava obavezna polja; javne stranice se osvježavaju odmah.
4. Izmjene objavljenog recepta mogu se sačuvati kao nacrt (*Sačuvaj nacrt*) bez uticaja na javnu verziju; *Verzije* omogućavaju vraćanje.
5. Promjena sluga objavljenog recepta automatski pravi 301 sa stare adrese.
6. Komentari/ocjene i prijave grešaka stižu u *Zajednica*; ništa se ne objavljuje bez odobrenja.
7. Početna se uređuje u *Postavke → Početna stranica* (izdvojeni recepti s datumima prikaza, brzi izbor, sezona…).

## Format uvoza i izvoza (`srce-nase-kuhinje/v1`)

Validacija: `src/lib/content/schema.ts`. Primjer: [`content/examples/primjer-uvoza.json`](../content/examples/primjer-uvoza.json). Potpun skup: `content/demo/*.json`.

```json
{
  "format": "srce-nase-kuhinje/v1",
  "ingredients": [{ "slug": "…", "name": "…", "synonyms": [], "broader": "slug-šireg-pojma" }],
  "recipes": [{
    "slug": "…", "title": "…", "summary": "…",
    "primaryCategory": "slug", "authors": ["slug"], "difficulty": "lako|srednje|zahtjevno",
    "yield": { "servings": 4, "unit": "porcije", "scalable": true },
    "times": { "prepMinutes": 10, "cookMinutes": 20, "totalMinutes": 25 },
    "ingredientGroups": [{ "title": null, "items": [{ "ingredient": "slug", "amount": 250, "unit": "g", "label": "brašna" }] }],
    "stepGroups": [{ "steps": [{ "text": "…", "timerMinutes": 20 }] }],
    "image": { "file": "slike/recept.jpg", "alt": "…" }
  }]
}
```

- Veze se navode **slugovima** (kategorije, autori, oznake i vodiči moraju postojati; namirnice mogu biti u istoj datoteci).
- Duplikati se prepoznaju po `uid`-u, zatim po slugu. Postojeći zapis se **preskače**; s `--update-drafts` recept dobija novu *draft* verziju, a objavljena ostaje netaknuta.
- Podrazumijevano: **dry-run izvještaj** (ništa se ne zapisuje). `--primijeni` stvarno uvozi — recepti nastaju kao **draft**.
- Slike: putanje relativno na JSON datoteku.

```bash
npm run content:import -- uvoz.json                 # izvještaj
npm run content:import -- uvoz.json --primijeni     # uvoz kao draft
npm run content:export -- izvoz.json --bez-demo     # izvoz objavljenog stvarnog sadržaja
```

## Demonstracijski podaci

`npm run seed:demo` pravi 16 recepata (jedan namjerno ostaje draft), 55 namirnica, 15 kategorija, 4 kolekcije, 3 vodiča, 4 oznake (s primjerom spajanja sinonima), demo uredništvo i generisane DEMO slike. Svi zapisi imaju oznaku *Demonstracijski sadržaj*; stranice prikazuju vidljivo upozorenje. Informativne stranice imaju samo strukturu i oznake `[POTREBNA UREDNIČKA DOPUNA]`.

Pokrivani rubni slučajevi: rasponi (2–3 kašike, 150–200 ml), „po ukusu/po potrebi”, jaja (zaokruživanje uz napomenu), alternative (maslac ili margarin), opcionalne stavke, recept bez preračuna (ajvar), dugo hlađenje (torta: 30 min + 4 h), paralelne radnje (ukupno < zbir), grupe sastojaka/koraka, tajmeri, prazne podkategorije, draft recept.

Uklanjanje: `npm run demo:remove` (pregled) → `npm run demo:remove -- --yes`.
