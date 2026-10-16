# Prije javne objave

Javna objava je zasebna odluka vlasnika. Ova lista navodi šta mora biti riješeno; ništa od ovoga nije izmišljeno ni pretpostavljeno u kodu.

## Materijali od korisnika (jedno mjesto)

| Materijal | Gdje se unosi | Stanje |
|---|---|---|
| Logo | `brand/original/logo-facebook.jpg` → `node scripts/brand-assets.mjs` pravi `public/brand/znak.png`, `natpis.png`, `src/app/icon.png` | **koristi se dostavljeni raster (1276 px)**; vektorski original (SVG/AI) poželjan za oštrinu na velikim ekranima |
| Potvrda tačnih boja iz vektorskog loga | `src/app/(frontend)/globals.css` (`@theme`) | procijenjene s rastera |
| Domena | `NEXT_PUBLIC_SITE_URL` | nije odabrana |
| Tačan URL Facebook stranice | CMS → Postavke sajta → URL Facebook stranice | **upisano** (profile.php?id=61583909786746) |
| Stvarni autori / imenovano uredništvo, biografije | CMS → Autori i uredništvo | „Uredništvo Srce naše kuhinje“ upisano; imena osoba po želji |
| Naziv izdavača (schema Organization), pravno lice, kontakt | CMS → Postavke sajta; informativne stranice | prazno |
| Tekstovi: O nama, Urednička politika, Kontakt, Kolačići | CMS → Informativne stranice | **napisano — pročitati i potvrditi** |
| Privatnost i Uslovi korištenja: rukovalac podacima / izdavač, mjerodavno pravo | CMS → Informativne stranice (zatim isključiti „Potrebna urednička dopuna”) | tekst napisan, nedostaju samo pravni podaci |
| Fotografije jela (stvarne, odgovaraju receptu) + alt tekst + fokusna tačka | CMS → Mediji | samo DEMO slike |
| Sadržajni plan i stvarni recepti | uvoz (`content:import`) ili CMS | u pripremi |
| Hosting, baza, spremište medija, pristupi | `.env` na serveru | nije odabrano |

## Uklanjanje demoa

- [ ] `npm run demo:remove` (pregled) → `npm run demo:remove -- --yes` na produkcijskoj bazi (ili ne pokretati `seed:demo` na produkciji uopšte).
- [ ] Provjeriti da nema zapisa s oznakom *Demonstracijski sadržaj* (filter u CMS-u po `isDemo`).
- [ ] `SITE_ENV=production` dodatno skriva demo zapise i sprječava objavu demo sadržaja, nedovršenih informativnih stranica i recepata bez glavne fotografije.
- [ ] Postaviti stvarnu Početnu (izdvojeni recepti, brzi izbor, sezona), Navigaciju i Osnovne namirnice.
- [ ] Alat „Šta imam u kuhinji”: urednik pregleda registar namirnica i sinonime, pa uključi *Baza odobrena* i (po želji) promotivni blok.

## Produkcijski resursi

- [ ] Node.js ≥ 20.9 server (ili platforma koja podržava Next.js server + Payload). Ne pretpostavlja se Vercel ni drugi plaćeni servis.
- [ ] Upravljani PostgreSQL ≥ 15 s ekstenzijom `pg_trgm`; trajni volumen; `npm run migrate` pri svakom deployu (migracije su uključene i kao `prodMigrations`).
- [ ] S3-kompatibilno spremište medija (`S3_*` varijable) + javna domena spremišta u `images.remotePatterns`.
- [ ] Tajne: `PAYLOAD_SECRET` (novi, dug), `PREVIEW_SECRET`, pristup bazi i spremištu — samo u okruženju servera, nikad u repozitoriju.
- [ ] HTTPS, kompresija, keširanje statičnih fajlova (`/_next/static`) na CDN-u.
- [ ] Ako postoji više instanci servera: zajedničko spremište za rate limit (vidi architecture.md).
- [ ] Mail servis za obavijesti (opcionalno) — Payload email adapter.

## Backup i obnova

- [ ] Dnevni backup baze (`pg_dump`) s čuvanjem ≥ 14 dana, van servera.
- [ ] Verzionisanje/replikacija bucketa medija.
- [ ] **Probna obnova** na odvojenoj bazi prije objave (zapisati trajanje i postupak).

## Pristupi i sigurnost

- [ ] Administratorski nalozi samo za stvarne urednike; lokalni seed administrator se ne koristi u produkciji.
- [ ] Jake lozinke; pregled uloga (administrator / urednik).
- [ ] Preview/staging okruženje zaštićeno lozinkom ili IP ograničenjem na nivou hostinga (noindex NIJE zaštita).
- [ ] `npm audit` i ažuriranje zakrpa unutar zaključanih verzija.

## Indeksiranje i SEO

- [ ] `SITE_ENV=production`, `SITE_ALLOW_INDEXING=true` tek kad je sadržaj odobren.
- [ ] Provjeriti `/robots.txt`, `/sitemap.xml` (samo objavljeni canonical URL-ovi), canonical i OG slike na nekoliko stranica.
- [ ] Google Rich Results Test za 3–5 recepata (schema ne garantuje prošireni prikaz).
- [ ] Search Console: verifikacija domene, slanje sitemapa.
- [ ] Facebook Sharing Debugger za nekoliko recepata (OG slika 1200×630, ispravno kadriranje hrane).

## Privatnost, oglasi, analitika

- [ ] Odabrati analitiku/oglase (ako ih bude) i odgovarajuće consent rješenje (CMP) prema stvarnim tržištima; uskladiti Privatnost i Kolačiće.
- [ ] Oglasna mjesta uključiti tek nakon odluke (CMS → Postavke sajta → Oglasi). AdSense odobrenje se ne garantuje.

## Završna provjera

- [ ] `npm run build`, `npm run test:unit`, `npm run test:int`, `npm run test:e2e` na staging okruženju.
- [ ] Ručno: telefon (Android/iOS), tastatura, čitač ekrana (NVDA ili TalkBack) na receptu, kuharici i filterima.
- [ ] Lighthouse/PageSpeed na stagingu sa stvarnim fotografijama; nakon objave pratiti terenske metrike (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1).
