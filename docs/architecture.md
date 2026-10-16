# Arhitektura

Stanje: 15. oktobar 2026.

## Odluke i verzije

| Paket | Verzija | Napomena |
|---|---|---|
| Node.js | ≥ 20.9 (razvoj: 24.21) | Payload `engines`: `^18.20.2 \|\| >=20.9.0` |
| next | 16.3.8 | Payload 3.90.2 traži `>=16.3.3 <17`. Izbjegnut 16.4.1 (objavljen dan ranije). |
| react / react-dom | 19.2.9 | `@payloadcms/ui` peer: `^19.2.1` |
| payload, @payloadcms/* | 3.90.2 | db-postgres, next, richtext-lexical, ui, storage-s3 — sve ista verzija |
| typescript | 5.9.3 | TS 7 (nativna verzija) još nije provjeren s Next/Payload |
| tailwindcss | 4.3.3 | vlastiti sistem komponenti, bez UI biblioteke |
| PostgreSQL | 17 | lokalno: `embedded-postgres` 17.10; produkcija: bilo koji upravljani PostgreSQL ≥ 15 s `pg_trgm` |
| zod | 4.6.7 | validacija formata uvoza i serverskih formi |
| vitest / @playwright/test | 4.1.12 / 1.58.2 | testovi |

Sve je zaključano u `package-lock.json`. npm 11 traži izričito odobrenje install skripti (`allowScripts` u `package.json`): esbuild, unrs-resolver, `@embedded-postgres/windows-x64`.

**Zašto ovako:** Payload daje uredničku administraciju, draftove, verzije, kontrolu pristupa i strukturiran sadržaj u istom Next.js projektu (bez zasebnog WordPress sloja). Javne stranice renderuje Next.js na serveru.

### Odstupanja od briefa i razlozi

- **Lokalna baza bez Dockera.** Docker nije bio instaliran. Umjesto mocka, koristi se stvarni PostgreSQL 17 iz npm paketa `embedded-postgres` (`npm run db`). Na Windowsu je za to instaliran besplatni Microsoft Visual C++ runtime. `docker-compose.yml` je dostupan kao alternativa.
- **Administracija na hrvatskom prevodu Payloada.** Payload nema bosanski prevod sučelja; hrvatski je najbliži (ijekavica). Svi nazivi polja, opisi i poruke koje smo definisali su na bosanskom.
- **Logo.** Koristi se dostavljeni originalni logo (`brand/original/logo-facebook.jpg`). Skripta `scripts/brand-assets.mjs` uklanja sivu pozadinu i pravi `public/brand/znak.png` (srce), `public/brand/natpis.png` (originalni natpis), `src/app/icon.png` i `apple-icon.png`. Horizontalna verzija = znak + natpis, kompaktna = znak. Kad stigne vektorski original, ponovo pokrenuti skriptu ili zamijeniti PNG-ove SVG-om.
- **Boje** su usklađene s logom (procjena s rastera): radnje `#B91C2C` (vanjsko srce), akcent `#E3202A` (unutrašnje srce, samo dekorativno), bordo `#741B2B`, natpis loga `#6E2C2E`. Brief je navodio `#C52235`; odabrana vrijednost je bliža logu i ima bolji kontrast.

## Struktura

```
src/
  app/(frontend)/      javne stranice, server akcije (actions.ts), API rute sajta (/api/site/*)
  app/(payload)/       administracija i REST API (generisano od Payloada)
  app/sitemap.ts, robots.ts, icon.svg
  payload.config.ts    kolekcije, globali, baza, mediji
  payload/             kolekcije, pristup (access.ts), hookovi, uvoznik
  data/                serverski upiti nad Payload Local API-jem (keširani)
  lib/                 čista logika s testovima: količine, lista, podudaranje, pretraga, spremište, schema
  components/          UI (server i klijent komponente)
  migrations/          migracije baze (jedini način promjene sheme)
scripts/               lokalna baza, seed, uklanjanje demoa, uvoz/izvoz, snimci
content/               demo podaci (format uvoza) i primjer formata
tests/                 unit, int (baza), e2e (Playwright)
```

## Keširanje i osvježavanje

- Javne stranice sadržaja su statične s osvježavanjem (ISR): početna, recept, vodič, namirnica, informativne stranice (`revalidate = 3600`, generišu se pri prvom posjetu).
- Upiti nad CMS-om su omotani u `unstable_cache` s tagovima (`recipes`, `guides`, `categories`, `home-page`, …).
- Payload hookovi nakon objave/izmjene/brisanja pozivaju `revalidateTag(tag, { expire: 0 })` (`src/payload/hooks/revalidate.ts`) — povučen sadržaj se ne servira iz keša.
- Pretraga i filteri (`/recepti/?…`, kategorije, kolekcije, alat za namirnice) se renderuju po zahtjevu; rezultat pretrage je keširan po stanju filtera (tag `recipes`, 10 min).
- Draft pregled (`/api/site/preview`) radi samo za prijavljenog korisnika CMS-a i uključuje Next.js draft mode; draft upiti se nikad ne keširaju.
- Lokalni alati (kuharica, plan, lista) su statične ljušture; podaci su u pregledniku. `/api/site/form-token` je `no-store`.
- Administracija i API šalju `X-Robots-Tag: noindex`. Payloadova zaglavlja `Accept-CH/Critical-CH` (tema administracije) ograničena su na `/admin` jer su na javnim stranicama izazivala ponovni zahtjev za svaku stranicu (~0,6 s na mobilnoj mreži).

## Pretraga i filteri (PostgreSQL)

- Pri svakom spremanju recepta hook `computeRecipeIndex` računa izvedena polja: normalizovan naslov i tekst (bez dijakritike, `đ/dj → d`, mala slova) s alternativnim nazivima, namirnicama, njihovim sinonimima i širim pojmovima, kategorijama i oznakama; `facetKeys` (`|c:ID|i:ID|r:ID|m:…|d:…|t:ID|`); efektivno ukupno vrijeme; profil za podudaranje namirnica.
- Migracija `search_indexes` uključuje `pg_trgm` i GIN trigram indekse nad `index_search_text`, `index_search_title`, `index_facet_keys` i nazivima namirnica, tako da su `ILIKE '%…%'` upiti indeksirani.
- Upit se tokenizuje, svaki token se blago skraćuje (padeži) i proširuje sinonimima (kolekcija *Sinonimi pretrage* + sinonimi namirnica). Svaki token mora biti pronađen (AND); alternative tokena su OR.
- Relevantnost: tačan naslov > naslov počinje upitom > sve riječi u naslovu > dio riječi u naslovu > samo namirnice/kategorija. Za relevantnost se rangira najviše 500 kandidata; ostala sortiranja paginira baza.
- Kombinacije: grupe AND; kategorija/metoda/težina OR unutar grupe; prehrambena svojstva AND; obavezne namirnice „sve” ili „bilo koja” (izričit izbor); „bez” isključuje recepte u kojima je namirnica obavezna i nezamjenjiva.
- Kad se sinonimi namirnice promijene, recepti koji je koriste se automatski ponovo indeksiraju.

## Lokalni podaci u pregledniku

`src/lib/storage/` — svaki ključ (`snk:kuharica`, `snk:plan`, `snk:kupovina`, `snk:oznake`, `snk:kuhanje`, `snk:tajmeri`, `snk:nedavno`) ima verziju formata i validator. Neispravni podaci se ne čitaju (rezervna kopija se čuva pod `…:rezerva`), blokirano skladište radi u memoriji uz poruku korisniku, promjene se sinhronizuju među tabovima. Recepti se pamte po stabilnom `uid`-u (UUID iz CMS-a), ne po internom ID-u baze.

## Mediji

- Razvoj: lokalni disk `./media` (Payload upload, `sharp`): veličine `thumb` 320×240, `card` 800×600 (fokusna tačka), `wide` 1600, `og` 1200×630 (fokusna tačka, za Facebook).
- Produkcija: postaviti `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` → uključuje se `@payloadcms/storage-s3` (S3-kompatibilno: AWS S3, Cloudflare R2, Backblaze B2, MinIO…). Ako spremište ima javnu domenu, dodati je u `images.remotePatterns` u `next.config.ts`.
- Payload uz `trailingSlash` dodaje `/` na URL datoteke; maper slika ga uklanja (`src/data/mappers.ts`).

## Sigurnost i privatnost

- Javni pristup (`src/payload/access.ts`): drafti nisu vidljivi; verzije, poruke i korisnici samo prijavljenima; komentari javno samo `odobreno`; email i hash klijenta zaštićeni na nivou polja. U produkciji (`SITE_ENV=production`) javnost ne vidi demo zapise, a demo sadržaj se ne može objaviti. Pokriveno integracijskim testovima.
- GraphQL je isključen. Javni unos (komentari, ocjene, prijave grešaka, kontakt) ide isključivo kroz serverske akcije: zod validacija, sanitizacija, honeypot, potpisan vremenski žeton, ograničenje učestalosti po hash-u IP adrese. Ništa se ne objavljuje bez urednika.
- **Ograničenje:** rate limit je u memoriji procesa (po instanci). Za više instanci ili serverless okruženje uvesti zajedničko spremište (npr. tabela u PostgreSQL-u ili Redis).
- **Ocjene:** jedna osoba može ocijeniti više puta (nema računa); zbog toga se svaka ocjena moderira i prikazuje tek nakon odobrenja.
- Tajne su samo u `.env` (nije u repozitoriju). Klijentski kod koristi samo `NEXT_PUBLIC_SITE_URL`.
- Nema trackera, oglasnih skripti, Facebook widgeta ni newslettera. Oglasna mjesta postoje kao rezervisan prostor (`ads.enabled`, isključeno). Consent rješenje (CMP) treba odabrati prema stvarnim tržištima prije uključivanja analitike ili oglasa.

## SEO

- Canonical na svim sadržajnim stranicama, iz `NEXT_PUBLIC_SITE_URL` (produkcijska domena je konfiguracija).
- Indeksiranje je dozvoljeno samo kad je `SITE_ENV=production` i `SITE_ALLOW_INDEXING=true`; inače su sve stranice `noindex`, sitemap je prazan, a postoji i zaglavlje `X-Robots-Tag`. To **nije** zaštita privatnih podataka; preview okruženje zaštititi lozinkom ili pristupom na nivou hostinga.
- Filtrirane arhive, pretraga, lokalni alati i nedovršene informativne stranice su `noindex` i izvan sitemapa; robots.txt ih ne blokira (pretraživač mora vidjeti noindex). Paginirane arhive imaju vlastiti URL i canonical.
- Recipe JSON-LD se gradi iz istih podataka kao vidljiva kartica (`src/lib/seo/jsonld.ts`); jedan entitet po receptu; `AggregateRating` samo uz stvarne odobrene ocjene; bez nutrition i video podataka. Dodatno: BreadcrumbList, WebSite/Organization, Article, CollectionPage/ItemList.
- Promjena sluga objavljenog sadržaja automatski pravi 301 (kolekcija *Preusmjerenja*, uključujući lance).

## Kontrast (WCAG)

| Kombinacija | Omjer |
|---|---|
| bijeli tekst na `#B91C2C` (dugmad) | 6,4 : 1 |
| `#B91C2C` na bijeloj (linkovi, oznake) | 6,4 : 1 |
| `#B91C2C` na `#FFF5F5` | 6,0 : 1 |
| `#262326` na bijeloj (tekst) | 15,4 : 1 |
| `#5C5558` na bijeloj (sekundarni tekst) | 7,2 : 1 |
| `#E3202A` | samo dekorativno (ikone, znak), ne za tekst |

## Performanse (laboratorij)

Vidi tabelu u [implementation-status.md](implementation-status.md#performanse).
