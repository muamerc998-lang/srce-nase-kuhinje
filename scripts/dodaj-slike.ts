/**
 * Dodaje AI fotografije postojećim receptima i objavljuje izmjenu.
 *   npx tsx scripts/dodaj-slike.ts content/recepti/slike/promptovi.json
 * Za svaki slug: content/recepti/slike/<slug>.webp → Medij (alt, „AI ilustracija“) → naslovna slika recepta.
 * Recept koji već ima naslovnu sliku se preskače. Na produkcijskoj bazi traži S3 spremište
 * (bez njega bi fajl ostao samo na ovom računaru i slika na sajtu ne bi radila).
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? '').hostname
    } catch {
      return ''
    }
  })()
  const local = ['127.0.0.1', 'localhost', '::1'].includes(host)
  if (!local && !process.env.S3_BUCKET) {
    throw new Error('Produkcijska baza bez S3 spremišta: postavite S3_* varijable (vidi .env.example).')
  }
  const items: { slug: string; alt: string }[] = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  const payload = await getPayload({ config })
  for (const it of items) {
    const file = path.resolve('content/recepti/slike', `${it.slug}.webp`)
    if (!fs.existsSync(file)) {
      console.log(`nema slike: ${it.slug}`)
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
      data: { alt: it.alt, credit: 'AI ilustracija' },
      filePath: file,
    })
    await payload.update({
      collection: 'recipes',
      id: recipe.id,
      overrideAccess: true,
      data: { heroImage: media.id, _status: recipe._status === 'published' ? 'published' : 'draft' },
    })
    console.log(`slika dodana: ${it.slug}`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(`Greška: ${(e as Error).message}`)
  process.exit(1)
})
