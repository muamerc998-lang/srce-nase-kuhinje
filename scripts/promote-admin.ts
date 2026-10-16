/**
 * JEDNOKRATNO: postojećem (jedinom) CMS korisniku dodjeljuje ulogu "admin".
 * Ne briše nalog, ne mijenja lozinku, ne otvara registraciju.
 *
 * Pregled (ništa ne mijenja):
 *   npx tsx scripts/promote-admin.ts --email vas@email.ba
 * Promjena:
 *   npx tsx scripts/promote-admin.ts --email vas@email.ba --potvrdi
 *
 * DATABASE_URL produkcijske (Neon) baze postavite u terminalu prije pokretanja.
 * Skripta odbija rad na lokalnoj bazi.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

function arg(name: string) {
  const i = process.argv.indexOf(name)
  return i > -1 ? process.argv[i + 1] : undefined
}

async function main() {
  const email = arg('--email')?.trim().toLowerCase()
  const apply = process.argv.includes('--potvrdi')
  if (!email) throw new Error('Navedite --email postojećeg naloga.')

  const url = process.env.DATABASE_URL ?? ''
  let host = ''
  try {
    host = new URL(url).hostname
  } catch {
    throw new Error('DATABASE_URL nije ispravan ili nije postavljen.')
  }
  if (['127.0.0.1', 'localhost', '::1'].includes(host)) {
    throw new Error(`DATABASE_URL pokazuje na lokalnu bazu (${host}). Postavite adresu Neon baze.`)
  }
  console.log(`Baza: ${host}`)

  const payload = await getPayload({ config })
  const all = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 10,
    select: { email: true, roles: true },
  })
  console.log(`Broj CMS korisnika: ${all.totalDocs}`)
  if (all.totalDocs !== 1) {
    throw new Error('Očekivan je tačno jedan CMS korisnik. Ništa nije promijenjeno.')
  }
  const user = all.docs[0]
  if (String(user.email).toLowerCase() !== email) {
    throw new Error('Jedini CMS korisnik nema navedeni email. Ništa nije promijenjeno.')
  }
  const roles = (user.roles ?? []) as string[]
  console.log(`Nalog: ${user.email} · trenutne uloge: ${roles.join(', ') || '(nema)'}`)
  if (roles.includes('admin')) {
    console.log('Nalog već ima ulogu admin. Ništa nije promijenjeno.')
    process.exit(0)
  }
  if (!apply) {
    console.log('PREGLED: uloga bi postala "admin". Za promjenu ponovite naredbu s --potvrdi.')
    process.exit(0)
  }
  // Mijenja se samo polje roles; lozinka i ostali podaci ostaju netaknuti.
  const updated = await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    depth: 0,
    data: { roles: ['admin', 'editor'] },
  })
  console.log(`Gotovo: ${updated.email} · uloge: ${(updated.roles ?? []).join(', ')}`)
  console.log('Odjavite se iz /admin i ponovo prijavite da nova uloga stupi na snagu.')
  process.exit(0)
}

main().catch((e) => {
  console.error(`Greška: ${(e as Error).message}`)
  process.exit(1)
})
