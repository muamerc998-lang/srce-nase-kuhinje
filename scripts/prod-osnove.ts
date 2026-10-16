/**
 * JEDNOKRATNO, nakon `seed:demo` → `demo:remove -- --yes` → uvoza serija recepata:
 * ponovo povezuje postavke koje je uklanjanje demo sadržaja ispraznilo
 * (osnovne i brze namirnice, kategorije u footeru, izdvojeni i slatki recepti na početnoj).
 * Koristi samo stvarne (ne demo) zapise koji postoje. Ništa ne briše.
 *   npx tsx scripts/prod-osnove.ts
 */
import 'dotenv/config'
import { getPayload, type CollectionSlug } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })
  const ids = async (collection: CollectionSlug, slugs: string[]) => {
    const res = await payload.find({
      collection,
      where: { and: [{ slug: { in: slugs } }, { isDemo: { not_equals: true } }] },
      pagination: false,
      depth: 0,
      draft: collection === 'recipes',
      overrideAccess: true,
      select: { slug: true },
    })
    const bySlug = new Map(res.docs.map((d) => [String((d as { slug?: string }).slug), d.id as number]))
    const missing = slugs.filter((s) => !bySlug.has(s))
    if (missing.length) console.log(`  (${collection}) ne postoji, preskočeno: ${missing.join(', ')}`)
    return slugs.map((s) => bySlug.get(s)).filter((x): x is number => x != null)
  }

  await payload.updateGlobal({
    slug: 'pantry-basics',
    overrideAccess: true,
    data: { items: await ids('ingredients', ['so', 'biber', 'voda', 'ulje', 'secer', 'brasno']) },
  })
  const featured = await ids('recipes', ['pecena-piletina-s-krompirom', 'sarma', 'sirnica', 'pileca-supa'])
  await payload.updateGlobal({
    slug: 'home-page',
    overrideAccess: true,
    data: {
      pantry: { quickIngredients: await ids('ingredients', ['jaja', 'krompir', 'piletina', 'mljeveno-meso', 'kore-za-pitu', 'mlijeko']) },
      featured: { items: featured.map((recipe) => ({ recipe })) },
      sweet: { recipes: await ids('recipes', ['brownie', 'palacinke', 'sutlija-sutlijas']) },
    },
  })
  await payload.updateGlobal({
    slug: 'navigation',
    overrideAccess: true,
    data: { footerCategories: await ids('categories', ['glavna-jela', 'supe-i-corbe', 'pite-i-peciva', 'slatki-recepti', 'zimnica']) },
  })
  console.log('Osnovne postavke su povezane sa stvarnim sadržajem.')
  process.exit(0)
}

main().catch((e) => {
  console.error(`Greška: ${(e as Error).message}`)
  process.exit(1)
})
