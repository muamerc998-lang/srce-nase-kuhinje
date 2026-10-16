/**
 * Lokalni PostgreSQL za razvoj bez Dockera.
 *
 * Koristi paket `embedded-postgres` (stvarni PostgreSQL 17 binarni fajlovi iz npm-a).
 * Podaci se čuvaju u ./.data/postgres i ostaju između pokretanja.
 * Pokretanje: `npm run db` (ostavite terminal otvoren; Ctrl+C gasi bazu).
 */
import 'dotenv/config'
import EmbeddedPostgres from 'embedded-postgres'
import fs from 'node:fs'
import path from 'node:path'

const raw = process.env.DATABASE_URL
if (!raw) {
  console.error('DATABASE_URL nije postavljen. Kopirajte .env.example u .env.')
  process.exit(1)
}

const url = new URL(raw)
const host = url.hostname
if (!['127.0.0.1', 'localhost'].includes(host)) {
  console.error(`DATABASE_URL pokazuje na ${host}; lokalna baza se pokreće samo za 127.0.0.1/localhost.`)
  process.exit(1)
}

const databaseDir = path.resolve('.data/postgres')
const port = Number(url.port || 5432)
const user = decodeURIComponent(url.username || 'postgres')
const password = decodeURIComponent(url.password || 'postgres')
const database = url.pathname.replace(/^\//, '')

const pg = new EmbeddedPostgres({
  databaseDir,
  port,
  user,
  password,
  persistent: true,
  authMethod: 'scram-sha-256',
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {},
  onError: (e) => console.error('[postgres]', e),
})

async function main() {
  if (!fs.existsSync(path.join(databaseDir, 'PG_VERSION'))) {
    console.log('Inicijalizujem novi lokalni klaster u', databaseDir)
    await pg.initialise()
  }
  await pg.start()
  try {
    await pg.createDatabase(database)
    console.log(`Kreirana baza "${database}".`)
  } catch {
    // baza već postoji
  }
  console.log(`PostgreSQL radi na 127.0.0.1:${port} (baza "${database}"). Ctrl+C za gašenje.`)
}

async function shutdown() {
  console.log('\nGasim PostgreSQL…')
  await pg.stop().catch(() => {})
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch(async (e) => {
  console.error('Pokretanje baze nije uspjelo:', e)
  await pg.stop().catch(() => {})
  process.exit(1)
})

// Drži proces živim dok radi baza.
setInterval(() => {}, 1 << 30)
