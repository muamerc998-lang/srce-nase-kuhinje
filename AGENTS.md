<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Srce naše kuhinje — napomene za rad na projektu

- **Prije pisanja bilo kojeg sadržaja (recepti, članci, vodiči, opisi, SEO, slike) obavezno pročitati `content/PRAVILA-PISANJA.md` i držati ga se.**

- Sav javni tekst, nazivi polja i poruke: bosanski, ijekavica (mlijeko, kuhanje, krompir, kašika, rerna).
- Shema baze se mijenja samo migracijama (`npm run migrate:create -- naziv`), nikad `push`.
- Demo sadržaj ima `isDemo: true`; ne izmišljati autore, recenzije, ocjene ni tvrdnje o testiranju.
- Čista logika (količine, lista, podudaranje, pretraga, spremište) je u `src/lib/` i ima unit testove — mijenjati zajedno s testovima.
- Javni pristup je definisan u `src/payload/access.ts` i pokriven `tests/int/access.int.spec.ts`.
- Ne objavljivati na javnu domenu, ne kupovati i ne uključivati plaćene servise bez izričite odluke vlasnika.
- Dokumentacija: README.md i docs/ (architecture, content-model, implementation-status, launch-checklist).
