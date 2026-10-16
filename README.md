# Srce naše kuhinje

Praktična digitalna kuharica: pronađi recept → razumij vrijeme i zahtjeve → pripremi → sačuvaj → dodaj na listu ili u plan.

**Stack:** Next.js 16.3 (App Router) · React 19.2 · Payload CMS 3.90 · PostgreSQL 17 · Tailwind CSS 4 · TypeScript 5.9.
Detalji i razlozi: [docs/architecture.md](docs/architecture.md). Stanje rada: [docs/implementation-status.md](docs/implementation-status.md).

> Sav sadržaj u bazi nakon `seed:demo` je **demonstracijski** i nije odobren za javnu objavu.

## Lokalno pokretanje (Windows / macOS / Linux)

Preduslovi: Node.js ≥ 20.9 (testirano na 24.21), npm ≥ 10. Docker **nije** potreban.

```bash
npm install
cp .env.example .env        # zatim upisati PAYLOAD_SECRET, PREVIEW_SECRET i lozinku administratora
npm run db                  # terminal 1: lokalni PostgreSQL 17 na 127.0.0.1:5433 (ostaviti otvoren)
npm run migrate             # terminal 2: shema baze (ponovljivo)
npm run seed:demo           # demo sadržaj + administrator iz .env
npm run dev                 # http://localhost:3000  ·  CMS: http://localhost:3000/admin/
```

- `npm run db` koristi paket `embedded-postgres` (stvarni PostgreSQL binarni fajlovi) i čuva podatke u `.data/postgres`.
  Na Windowsu zahtijeva **Microsoft Visual C++ 2015–2022 Redistributable (x64)** — besplatno, `winget install Microsoft.VCRedist.2015+.x64`.
- Alternativa s Dockerom: `docker compose up -d` (isti port i pristupni podaci kao u `.env.example`).
- Ponovno punjenje demo podataka: `npm run seed:demo -- --reset`. Uklanjanje: `npm run demo:remove` (pregled) i `npm run demo:remove -- --yes`.

## Naredbe

| Naredba | Šta radi |
|---|---|
| `npm run dev` / `build` / `start` | razvoj / produkcijski build / produkcijski server |
| `npm run migrate` · `migrate:create -- naziv` | primjena / pravljenje migracija (shema se mijenja isključivo migracijama) |
| `npm run generate:types` | TypeScript tipovi iz Payload konfiguracije |
| `npm run content:import -- datoteka.json [--primijeni] [--update-drafts]` | uvoz recepata i namirnica (podrazumijevano dry-run; uvoz pravi draftove) |
| `npm run content:export -- izvoz.json [--draftovi] [--bez-demo]` | izvoz u isti format |
| `npm run typecheck` · `npm run lint` | TypeScript i ESLint |
| `npm run test:unit` | unit testovi (bez baze) |
| `npm run test:int` | integracijski testovi (baza + demo podaci; HTTP provjere ako radi server) |
| `npm run test:e2e` | Playwright tokovi (prvi put: `npx playwright install chromium`) |
| `npx tsx scripts/screenshots.ts [url]` | snimci ključnih stranica na 360/390/768/1440 px + provjera prelijevanja |

Build zahtijeva dostupnu bazu (stranice čitaju CMS) i pristup internetu za preuzimanje fontova (`next/font` ih zatim poslužuje sa vlastite domene).

## Dokumentacija

- [docs/architecture.md](docs/architecture.md) — odluke, verzije, keširanje, CMS, mediji, sigurnost, performanse
- [docs/content-model.md](docs/content-model.md) — taksonomija, obavezna polja, format uvoza, urednički postupak
- [docs/implementation-status.md](docs/implementation-status.md) — urađeno, nedovršeno, blokade, rezultati provjera
- [docs/launch-checklist.md](docs/launch-checklist.md) — sve što mora biti riješeno prije javne objave
- [content/PRAVILA-PISANJA.md](content/PRAVILA-PISANJA.md) — pravila pisanja sadržaja (obavezno pročitati prije pisanja)
