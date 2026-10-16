/**
 * Uklanja SAV demonstracijski sadržaj (isDemo = true) i komentare/poruke vezane
 * za demo recepte. Stvarni sadržaj i korisnici CMS-a ostaju netaknuti.
 *
 *   npm run demo:remove            → prikaže šta bi bilo uklonjeno
 *   npm run demo:remove -- --yes   → stvarno ukloni
 */
import 'dotenv/config'
import { getPayload, type Payload, type CollectionSlug } from 'payload'
import { fileURLToPath } from 'node:url'

const ORDER: CollectionSlug[] = [
  'recipe-collections',
  'recipes',
  'guides',
  'pages',
  'ingredients',
  'categories',
  'tags',
  'authors',
  'search-synonyms',
  'media',
]

export async function removeDemo(payload: Payload, dryRun = false) {
  const counts: Record<string, number> = {}
  const demoRecipes = await payload.find({
    collection: 'recipes',
    where: { isDemo: { equals: true } },
    pagination: false,
    depth: 0,
    draft: true,
    overrideAccess: true,
    select: { slug: true },
  })
  const recipeIds = demoRecipes.docs.map((d) => d.id)
  if (!dryRun) {
    // Globalne postavke pokazuju na demo zapise (početna, obroci, navigacija); te veze se prvo prazne,
    // inače baza ne dozvoljava brisanje. Nakon uklanjanja demoa urednik ih popunjava stvarnim sadržajem.
    await payload.updateGlobal({
      slug: 'home-page',
      overrideAccess: true,
      data: {
        quickLinks: { links: [] },
        featured: { items: [] },
        categories: { items: [] },
        pantry: { quickIngredients: [] },
        sweet: { recipes: [] },
        season: { collection: null, guide: null },
        guides: { items: [] },
        hero: { image: null },
      },
    })
    await payload.updateGlobal({
      slug: 'meal-pages',
      overrideAccess: true,
      data: {
        dorucak: { collections: [], image: null },
        rucak: { collections: [], image: null },
        vecera: { collections: [], image: null },
      },
    })
    await payload.updateGlobal({ slug: 'navigation', overrideAccess: true, data: { recipeMenu: [], footerCategories: [], footerGuides: [] } })
    await payload.updateGlobal({ slug: 'pantry-basics', overrideAccess: true, data: { items: [] } })
  }
  for (const c of ['comments', 'messages'] as const) {
    const where = { recipe: { in: recipeIds } }
    const n = recipeIds.length ? (await payload.count({ collection: c, where, overrideAccess: true })).totalDocs : 0
    counts[c] = n
    if (!dryRun && n) await payload.delete({ collection: c, where, overrideAccess: true })
  }
  for (const c of ORDER) {
    const where = { isDemo: { equals: true } }
    const n = (await payload.count({ collection: c, where, overrideAccess: true })).totalDocs
    counts[c] = n
    if (dryRun || !n) continue
    if (c === 'ingredients' || c === 'categories' || c === 'tags') {
      // samoreferentne veze (širi pojam, nadređena kategorija, spajanje) prvo raskinuti
      const field = c === 'ingredients' ? 'broader' : c === 'categories' ? 'parent' : 'mergedInto'
      await payload.update({ collection: c, where, data: { [field]: null }, overrideAccess: true, context: { skipReindex: true } })
    }
    const res = await payload.delete({ collection: c, where, overrideAccess: true, context: { skipReindex: true } })
    if (res.errors?.length) {
      throw new Error(`Brisanje (${c}) nije uspjelo za ${res.errors.length} zapisa: ${res.errors.map((e) => e.message).slice(0, 3).join('; ')}`)
    }
  }
  console.log(dryRun ? 'Bilo bi uklonjeno:' : 'Uklonjeno:', counts)
  return counts
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const yes = process.argv.includes('--yes')
  await removeDemo(payload, !yes)
  if (!yes) console.log('\nNišta nije obrisano. Za stvarno uklanjanje: npm run demo:remove -- --yes')
  process.exit(0)
}
