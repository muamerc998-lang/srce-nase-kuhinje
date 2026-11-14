/**
 * Povezuje slike s receptima prepisanim s nasirecepti (content/PREPIS-NASIRECEPTI.md §9).
 *   npx tsx scripts/dodaj-slike-prepis.ts content/recepti/slike/prepis-slike.json
 * Ulaz: [{ slug, file, alt, focalX?, focalY? }] — `file` je naziv koji je dao urednik (sređen za web),
 * NIKAD slug recepta, da URL slike i URL recepta ne budu isti.
 * Izvor: content/recepti/slike/<file>.webp → Medij (alt, „AI ilustracija“, fokusna tačka) → naslovna slika.
 * Recept ostaje u statusu u kojem jeste (nacrt ostaje nacrt). Recept koji već ima sliku se preskače.
 * Fajlovi nastaju u public/media i smanjuju se na najviše 100 KB; zatim ih commitati i pushati.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { shrinkRecipeImages } from './smanji-slike'

type Item = { slug: string; file: string; alt: string; focalX?: number; focalY?: number }

async function main() {
  const items: Item[] = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  const payload = await getPayload({ config })
  for (const it of items) {
    if (it.file === it.slug) {
      console.log(`preskočeno: ${it.slug} — naziv slike ne smije biti isti kao slug`)
      continue
    }
    const file = path.resolve('content/recepti/slike', `${it.file}.webp`)
    if (!fs.existsSync(file)) {
      console.log(`nema slike: ${it.file}`)
      continue
    }
    const found = await payload.find({
      collection: 'recipes',
      where: { slug: { equals: it.slug } },
      draft: true,
      overrideAccess: true,
      limit: 1,
      depth: 0,
      select: { heroImage: true, _status: true },
    })
    const recipe = found.docs[0]
    if (!recipe) {
      console.log(`nema recepta: ${it.slug}`)
      continue
    }
    if (recipe.heroImage) {
      console.log(`već ima sliku: ${it.slug}`)
      continue
    }
    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: { alt: it.alt, credit: 'AI ilustracija', focalX: it.focalX ?? 50, focalY: it.focalY ?? 50 },
      filePath: file,
    })
    const isPublished = recipe._status === 'published'
    await payload.update({
      collection: 'recipes',
      id: recipe.id,
      overrideAccess: true,
      draft: !isPublished,
      data: { heroImage: media.id, _status: isPublished ? 'published' : 'draft' },
    })
    await shrinkRecipeImages(it.file, false)
    console.log(`slika dodana: ${it.slug} ← ${it.file}.webp (${isPublished ? 'objavljeno' : 'nacrt'})`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(`Greška: ${(e as Error).message}`)
  process.exit(1)
})
