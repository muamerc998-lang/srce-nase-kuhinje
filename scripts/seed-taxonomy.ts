/**
 * Upisuje konačne kategorije iz plana (src/lib/content/taxonomy.ts).
 * Upsert po slugu: postojeća kategorija dobija naziv, uvod, roditelja i redoslijed iz plana
 * i prestaje biti demo. Kategorije kojih nema u planu se ne diraju.
 *   npm run taxonomy
 */
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'
import { TAXONOMY } from '../src/lib/content/taxonomy'
import { CATEGORY_BODY, TAGS } from '../src/lib/content/taxonomy-texts'
import { slugify } from '../src/lib/text/normalize'

export async function upsertTaxonomy(payload: Payload) {
  const ids: Record<string, number> = {}
  const upsert = async (slug: string, data: Record<string, unknown>) => {
    const found = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
    const doc = found.docs[0]
      ? await payload.update({ collection: 'categories', id: found.docs[0].id, overrideAccess: true, data: { ...data, isDemo: false } })
      : await payload.create({ collection: 'categories', overrideAccess: true, data: { slug, ...data, isDemo: false } as never })
    ids[slug] = doc.id
  }
  for (const top of TAXONOMY) {
    await upsert(top.slug, { name: top.name, intro: top.intro, body: CATEGORY_BODY[top.slug] ?? null, order: top.order, parent: null, showInMenu: true })
    let o = top.order + 1
    for (const c of top.children ?? []) {
      await upsert(c.slug, { name: c.name, intro: c.intro, body: CATEGORY_BODY[c.slug] ?? null, order: o++, parent: ids[top.slug], showInMenu: true })
    }
  }
  return ids
}

/** Kontrolisane oznake iz plana (upsert po slugu; nisu demo). */
export async function upsertTags(payload: Payload) {
  let n = 0
  for (const t of TAGS) {
    const slug = slugify(t.name)
    const data = { name: t.name, group: t.group, synonyms: t.synonyms ?? null, public: true, isDemo: false }
    const found = await payload.find({ collection: 'tags', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs[0]) await payload.update({ collection: 'tags', id: found.docs[0].id, overrideAccess: true, data })
    else await payload.create({ collection: 'tags', overrideAccess: true, data: { slug, ...data } as never })
    n++
  }
  return n
}

async function main() {
  const payload = await getPayload({ config })
  const ids = await upsertTaxonomy(payload)
  const tags = await upsertTags(payload)
  console.log(`Kategorije iz plana upisane: ${Object.keys(ids).length}. Oznake: ${tags}.`)
  process.exit(0)
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/seed-taxonomy.ts')) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
